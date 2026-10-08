"""Wire the admin and public SEO modules without changing website layouts."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def edit(file,before,after):
 p=ROOT/file;s=p.read_text(encoding='utf8')
 if after in s:return
 if before not in s:raise RuntimeError('Expected edit location missing: '+str(file))
 p.write_text(s.replace(before,after),encoding='utf8')
edit(Path('admin/admin.js'),'<div class="field-columns"><label class="field"><span>Texto no banner</span>','${bannerGuide(p)}<div class="field-columns"><label class="field"><span>Texto no banner</span>')
edit(Path('admin/admin.js'),'Salvar guarda um rascunho neste navegador; a publicação será conectada depois.','Salve o rascunho e use Publicar alterações no editor da página para atualizar o site.')
edit(Path('admin/admin.js'),'<p>Biblioteca de ${esc(siteLabel(workingPage.site))}. Preserve a identidade de cada marca.</p>','<p>Biblioteca de ${esc(siteLabel(workingPage.site))}. Preserve a identidade de cada marca.</p>${bannerGuide(workingPage)}')
edit(Path('admin/builder.js'),"${bImagePicker(item.imageId)}${!hero?", "${bImagePicker(item.imageId)}${hero?bannerGuide(p):''}${!hero?")
edit(Path('admin/builder.js'),'<p>Imagens de ${esc(siteLabel(workingPage.site))}.</p>','<p>Imagens de ${esc(siteLabel(workingPage.site))}.</p>${bSelected===\'hero\'?bannerGuide(workingPage):\'\'}')
edit(Path('assets/js/cms-site.js'),"if(!data)return;const main=", "if(!data||data.seoOnly)return;const main=")
edit(Path('assets/js/cms-site.js'),"p.path===path||(p.path==='/'&&path==='/index.html')", "p.path.replace(/\\.html$/, '').replace(/\\/$/, '')===path.replace(/\\.html$/, '').replace(/\\/$/, '')||(p.path==='/'&&path==='/index.html')")
edit(Path('assets/js/cms-site.js'),"apply(rows[0]?.published_content,baseline);", "await window.CredMaisSEOPage?.load(rows[0]?.published_content);if(current!==sequence)return;apply(rows[0]?.published_content,baseline);")
# Content reader is shared with the two Vite websites.
for repo in ['credcartas','credmaispay']:
 (ROOT.parent/repo/'public/cms-site.js').write_text((ROOT/'assets/js/cms-site.js').read_text(encoding='utf8'),encoding='utf8')
files=[ROOT/'index.html',ROOT/'contato/index.html',*ROOT.glob('servicos/*/index.html')]
for file in files:
 s=file.read_text(encoding='utf8');tag='<script src="/assets/js/seo-core.js" defer></script>\n<script src="/assets/js/seo-site.js" defer></script>'
 if '/assets/js/seo-site.js' not in s:s=s.replace('</head>',tag+'\n</head>')
 file.write_text(s,encoding='utf8')
for repo in ['credcartas','credmaispay']:
 for file in (ROOT.parent/repo).glob('*.html'):
  s=file.read_text(encoding='utf8');tag='<script src="/seo-core.js" defer></script>\n<script src="/seo-site.js" defer></script>'
  if '/seo-site.js' not in s:s=s.replace('</head>',tag+'\n</head>')
  file.write_text(s,encoding='utf8')
print('Admin and public SEO wired.')
