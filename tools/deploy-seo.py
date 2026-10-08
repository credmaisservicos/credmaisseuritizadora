"""Deploy owner-only SEO settings and ready public defaults; no credential output."""
import json,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def env(name):return dict(l.split('=',1) for l in (ROOT.parent/name).read_text(encoding='utf-8-sig').splitlines() if '=' in l and not l.startswith('#'))
pat=env('supabase.env')['SUPABASE_ACCESS_TOKEN'].strip().strip('"');runtime=env('credmais-runtime.env');ref='bqfunldpanspuqxsnoib'
def manage(path,body):
 request=urllib.request.Request('https://api.supabase.com/v1/projects/'+ref+path,json.dumps(body).encode(),{'Authorization':'Bearer '+pat,'Content-Type':'application/json'},method='POST' if path=='/database/query' else 'PATCH')
 with urllib.request.urlopen(request,timeout=60) as response:return json.load(response)
def sql(query):return manage('/database/query',{'query':query})
def literal(value):return "'"+json.dumps(value,ensure_ascii=False).replace("'","''")+"'::jsonb"
sql((ROOT/'supabase/migrations/20261008_seo.sql').read_text(encoding='utf8'))
defaults=json.loads((ROOT/'admin/seo-defaults.json').read_text(encoding='utf8'))
for sid,config in defaults.items():
 public={k:v for k,v in config.items() if k!='keywords'}
 sql("insert into public.cms_seo_sites(site,draft_config,published_config,published_at) values ('"+sid+"',"+literal(config)+","+literal(public)+",now()) on conflict(site) do nothing")
catalog=json.loads((ROOT/'admin/catalog.json').read_text(encoding='utf8'))
for p in catalog['pages']+json.loads((ROOT/'admin/seo-extra-pages.json').read_text(encoding='utf8')):
 seo={k:p[k] for k in ['seoTitle','seoDescription','seo']}
 public={'id':p['id'],'path':p['path'],'name':p['name'],'seoOnly':True,**seo}
 if p.get('seoOnlyPage'):
  sql("insert into public.cms_pages(id,site,path,draft_content) values ('"+p['id']+"','"+p['site']+"','"+p['path']+"',"+literal(p)+") on conflict(id) do nothing")
 sql("update public.cms_pages set draft_content="+literal(seo)+" || draft_content, published_content=coalesce(published_content,"+literal(public)+"),published_at=coalesce(published_at,now()) where id='"+p['id']+"'")
 focus=literal(p['seo']['focusKeyword'])
 sql("update public.cms_pages set draft_content=jsonb_set(draft_content,'{seo,focusKeyword}',"+focus+") where id='"+p['id']+"' and coalesce(draft_content#>>'{seo,focusKeyword}','')=''")
manage('/config/auth',{'site_url':'https://admin.sejacredmais.com/','uri_allow_list':'https://admin.sejacredmais.com/,https://admin.sejacredmais.com/admin/,https://sejacredmais.com/admin/,https://www.sejacredmais.com/admin/,http://127.0.0.1:5500/admin/'})
print('SEO settings and initial page metadata published. Owner-only editing enabled.')
