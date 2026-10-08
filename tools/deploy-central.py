"""Configure only the CredMais central; credentials stay outside the repository."""
import json, secrets, urllib.request, urllib.error, uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRIVATE = ROOT.parent
REF = 'bqfunldpanspuqxsnoib'
OWNER = 'contato@sejacredmais.com'
def env(name):
    return dict(line.split('=',1) for line in (PRIVATE/name).read_text(encoding='utf-8-sig').splitlines() if '=' in line and not line.startswith('#'))
runtime = env('credmais-runtime.env')
pat = env('supabase.env')['SUPABASE_ACCESS_TOKEN'].strip().strip('"')
service = runtime['SUPABASE_SERVICE_ROLE_KEY']
def request(url, method='GET', payload=None, headers=None, raw=None):
    h=headers or {'Authorization':'Bearer '+pat,'Content-Type':'application/json'}
    data=raw if raw is not None else json.dumps(payload).encode() if payload is not None else None
    try:
        with urllib.request.urlopen(urllib.request.Request(url,data=data,headers=h,method=method),timeout=60) as response:
            body=response.read();return json.loads(body) if body else None
    except urllib.error.HTTPError as error:
        print('API failed',method,url.split('?')[0],error.code)
        detail=error.read().decode()
        for token in [pat,service,env('resend.env')['RESEND_API_KEY']]:detail=detail.replace(token,'[redacted]')
        print(detail[:900]);raise SystemExit(1)
def manage(path,method='GET',payload=None):return request('https://api.supabase.com/v1/projects/'+REF+path,method,payload)
def query(sql):return manage('/database/query','POST',{'query':sql})
auth_headers={'Authorization':'Bearer '+service,'apikey':service,'Content-Type':'application/json'}
users=request(runtime['SUPABASE_URL']+'/auth/v1/admin/users',headers=auth_headers)['users']
owner=next((u for u in users if u.get('email','').lower()==OWNER),None)
if not owner:
    password=secrets.token_urlsafe(24)
    owner=request(runtime['SUPABASE_URL']+'/auth/v1/admin/users','POST',{'email':OWNER,'password':password,'email_confirm':True},auth_headers)
    (PRIVATE/'credmais-admin-access.txt').write_text('Painel: https://sejacredmais.com/admin/\nE-mail: '+OWNER+'\nSenha inicial: '+password+'\nTroque a senha em Configurações > Administrador.\n',encoding='utf8')
    print('Owner created; initial password saved outside repositories.')
if not query("select 1 from information_schema.tables where table_schema='public' and table_name='cms_leads'"):
    query((ROOT/'supabase/migrations/20261008_central.sql').read_text())
    print('Central schema and access policies installed.')
if not query("select 1 from information_schema.tables where table_schema='public' and table_name='cms_media'"):
    query((ROOT/'supabase/migrations/20261008_library.sql').read_text())
query("insert into public.cms_admins(user_id,email) values('"+owner['id']+"','"+OWNER+"') on conflict(user_id) do nothing")
catalog=json.loads((ROOT/'admin/catalog.json').read_text(encoding='utf8'))
page_rows=[]
for page in catalog['pages']:
    page_rows.append("('"+page['id'].replace("'","''")+"','"+page['site']+"','"+page['path'].replace("'","''")+"','"+json.dumps(page,ensure_ascii=False).replace("'","''")+"'::jsonb)")
query('insert into public.cms_pages(id,site,path,draft_content) values '+','.join(page_rows)+' on conflict(id) do nothing')
resend=env('resend.env')['RESEND_API_KEY'].strip().strip('"')
manage('/secrets','POST',[{'name':'CMS_RESEND_API_KEY','value':resend},{'name':'CMS_ALLOWED_ORIGINS','value':'https://credmais-securitizadora.pages.dev,https://credcartas.pages.dev'}])
manage('/config/auth','PATCH',{'disable_signup':True,'site_url':'https://sejacredmais.com/admin/','uri_allow_list':'https://sejacredmais.com/admin/,https://www.sejacredmais.com/admin/,http://127.0.0.1:5500/admin/','password_min_length':12,'smtp_host':'smtp.resend.com','smtp_port':'465','smtp_user':'resend','smtp_pass':resend,'smtp_admin_email':OWNER,'smtp_sender_name':'Central CredMais'})
boundary='CredMais'+uuid.uuid4().hex
metadata=json.dumps({'entrypoint_path':'index.ts','name':'receive-contact','verify_jwt':False})
source=(ROOT/'supabase/functions/receive-contact/index.ts').read_bytes()
body=(f'--{boundary}\r\nContent-Disposition: form-data; name="metadata"\r\n\r\n{metadata}\r\n--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="index.ts"\r\nContent-Type: application/typescript\r\n\r\n'.encode()+source+f'\r\n--{boundary}--\r\n'.encode())
result=request('https://api.supabase.com/v1/projects/'+REF+'/functions/deploy?slug=receive-contact','POST',headers={'Authorization':'Bearer '+pat,'Content-Type':'multipart/form-data; boundary='+boundary},raw=body)
print('Contact endpoint deployed:',result.get('slug'),result.get('status'))
config={'url':runtime['SUPABASE_URL'],'anonKey':runtime['SUPABASE_ANON_KEY'],'owner':OWNER}
(ROOT/'admin/backend-config.js').write_text('window.CredMaisBackendConfig='+json.dumps(config)+';\n',encoding='utf8')
print('Public frontend configuration written. No private keys exposed.')
