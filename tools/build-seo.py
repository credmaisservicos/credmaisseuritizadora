"""Compile initial HTML metadata and the public Cloudflare SEO worker."""
import json,re,shutil,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CORE=(ROOT/'assets/js/seo-core.js').read_text(encoding='utf8')
DEFAULTS=json.loads((ROOT/'tools/seo-defaults-public.json').read_text(encoding='utf8'))
config=json.loads((ROOT/'assets/js/cms-config.js').read_text(encoding='utf8').split('=',1)[1].strip().rstrip(';'))
public_backend={k:config[k] for k in ['url','anonKey']}
node_script=CORE+"\nconst d=JSON.parse(require('fs').readFileSync(0,'utf8'));process.stdout.write(JSON.stringify(Object.fromEntries(Object.entries(d).map(([id,c])=>[id,{head:Object.fromEntries(c.pages.map(p=>[p.id,CredMaisSEO.head(c.site,p)])),robots:CredMaisSEO.robots(c.site),sitemap:CredMaisSEO.sitemap(c.site,c.pages)}]))));"
result=subprocess.run(['node','-e',node_script],input=json.dumps(DEFAULTS),text=True,encoding='utf8',capture_output=True,check=True)
rendered=json.loads(result.stdout)
def inject(file,head):
 text=file.read_text(encoding='utf8')
 start=text.lower().index('<head>')+6;end=text.lower().index('</head>');existing=text[start:end]
 existing=re.sub(r'<title\b[^>]*>.*?</title>|<script\b[^>]*type=[\"\']application/ld\+json[\"\'][^>]*>.*?</script>','',existing,flags=re.I|re.S)
 existing=re.sub(r'<meta\b[^>]*(?:name|property)=[\"\'](?:description|robots|google-site-verification|og:[^\"\']+|twitter:[^\"\']+)[\"\'][^>]*>|<link\b[^>]*rel=[\"\']canonical[\"\'][^>]*>','',existing,flags=re.I)
 file.write_text(text[:start]+existing+'\n'+head+'\n'+text[end:],encoding='utf8')
for sid,base in [('securitizadora',ROOT),('cartas',ROOT.parent/'credcartas'),('pay',ROOT.parent/'credmaispay')]:
 public=base if sid=='securitizadora' else base/'public'
 for name in ['seo-core.js','seo-site.js']:
  if sid!='securitizadora':shutil.copyfile(ROOT/'assets/js'/name,public/name)
 for p in DEFAULTS[sid]['pages']:
  file=base/('index.html' if p['path']=='/' else p['path'].lstrip('/'))
  if sid=='securitizadora' and p['path']!='/':file=file/'index.html'
  if file.is_file():inject(file,rendered[sid]['head'][p['id']])
 for name in ['robots.txt','sitemap.xml']:(public/name).write_text(rendered[sid]['robots' if name=='robots.txt' else 'sitemap'],encoding='utf8')
 if sid in ['securitizadora','cartas']:
  worker=CORE+'\nconst SITE='+json.dumps(sid)+';\nconst DEFAULTS='+json.dumps(DEFAULTS[sid],ensure_ascii=False)+';\nconst BACKEND='+json.dumps(public_backend)+';\n'+(ROOT/'tools/seo-worker-template.js').read_text(encoding='utf8')
  (public/'_worker.js').write_text(worker,encoding='utf8')
  (public/'_routes.json').write_text(json.dumps({'version':1,'include':['/*'],'exclude':['/assets/*','/ads/*','/images/*','/admin/*']}),encoding='utf8')
# Static server metadata for every Pay route, ready for the external host.
pay=ROOT.parent/'credmaispay';dist=pay/'dist'
if dist.is_dir():
 for name in ['robots.txt','sitemap.xml','seo-core.js','seo-site.js','seo-defaults.json']:shutil.copyfile(pay/'public'/name,dist/name)
 for p in DEFAULTS['pay']['pages']:
  file=dist/('index.html' if p['path']=='/' else p['path'].lstrip('/')+'/index.html')
  if file!=dist/'index.html':file.parent.mkdir(exist_ok=True,parents=True);shutil.copyfile(dist/'index.html',file)
  inject(file,rendered['pay']['head'][p['id']])
print('Initial metadata, canonical URLs, social previews, schemas, robots and sitemaps generated.')
