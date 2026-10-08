"""Deploy only the two authorized websites. Never changes credmaisapp."""
import json,os,subprocess,urllib.request,urllib.error,shutil,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];PRIVATE=ROOT.parent
def env(name):return dict(l.split('=',1) for l in (PRIVATE/name).read_text(encoding='utf-8-sig').splitlines() if '=' in l and not l.startswith('#'))
runtime=env('credmais-runtime.env');token=env('cloudflare.env')['CLOUDFLARE_API_TOKEN'].strip()
account=runtime['CLOUDFLARE_ACCOUNT_ID'];zone=runtime['CLOUDFLARE_ZONE_ID']
def api(path,method='GET',payload=None):
 try:
  req=urllib.request.Request('https://api.cloudflare.com/client/v4/'+path,data=json.dumps(payload).encode() if payload is not None else None,headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'},method=method)
  result=json.load(urllib.request.urlopen(req,timeout=60))
  if not result.get('success'):raise RuntimeError(str(result.get('errors')))
  return result['result']
 except urllib.error.HTTPError as e:
  print('Cloudflare API failed:',method,path,e.code,e.read().decode()[:500]);raise SystemExit(1)
stage=Path(os.environ['TEMP'])/'credmais-release-20261008'
stage.mkdir(exist_ok=True)
secur=stage/'securitizadora';secur.mkdir(exist_ok=True)
for name in ['assets','admin','contato','servicos']:shutil.copytree(ROOT/name,secur/name,dirs_exist_ok=True)
shutil.copyfile(ROOT/'index.html',secur/'index.html')
for name in ['robots.txt','sitemap.xml','_worker.js','_routes.json']:
 if (ROOT/name).exists():shutil.copyfile(ROOT/name,secur/name)
headers='/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n/admin/*\n  Cache-Control: no-store\n'
(secur/'_headers').write_text(headers)
cartas=PRIVATE/'credcartas/dist';(cartas/'_headers').write_text(headers)
cli_env=os.environ.copy();cli_env.update({'CLOUDFLARE_API_TOKEN':token,'CLOUDFLARE_ACCOUNT_ID':account,'WRANGLER_SEND_METRICS':'false','CI':'true'})
projects=api('accounts/'+account+'/pages/projects')
deployment=[]
for name,folder,domains in [('credmais-securitizadora',secur,['sejacredmais.com','www.sejacredmais.com','admin.sejacredmais.com']),('credcartas',cartas,['cartas.sejacredmais.com'])]:
 assert name!='credmaisapp'
 project=next((p for p in projects if p['name']==name),None)
 if not project:project=api('accounts/'+account+'/pages/projects','POST',{'name':name,'production_branch':'main'})
 print('Publishing',name,flush=True)
 command=['npx.cmd','--yes','wrangler@4','pages','deploy',str(folder),'--project-name',name,'--branch','main','--commit-dirty=true']
 result=subprocess.run(command,cwd=stage,env=cli_env)
 if result.returncode:raise SystemExit(result.returncode)
 project=api('accounts/'+account+'/pages/projects/'+name)
 deployment.append({'name':name,'subdomain':project['subdomain'],'domains':domains})
# Only switch DNS after both deployments succeeded.
records=api('zones/'+zone+'/dns_records?per_page=100')
backup=PRIVATE/'credmais-dns-before-publish.json'
if not backup.exists():backup.write_text(json.dumps(records,indent=2),encoding='utf8')
for project in deployment:
 base='accounts/'+account+'/pages/projects/'+project['name']+'/domains'
 existing=api(base)
 for domain in project['domains']:
  if not any(d['name']==domain for d in existing):api(base,'POST',{'name':domain})
  web=[r for r in records if r['name']==domain and r['type'] in ['A','AAAA','CNAME']]
  payload={'type':'CNAME','name':domain,'content':project['subdomain'],'proxied':True,'ttl':1}
  if web:
   for r in web[1:]:api('zones/'+zone+'/dns_records/'+r['id'],'DELETE')
   api('zones/'+zone+'/dns_records/'+web[0]['id'],'PUT',payload)
  else:api('zones/'+zone+'/dns_records','POST',payload)
  print('Domain connected:',domain,flush=True)
print(json.dumps(deployment))
(PRIVATE/'credmais-deployments.json').write_text(json.dumps(deployment,indent=2),encoding='utf8')
