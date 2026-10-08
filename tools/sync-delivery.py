"""Sync reviewed source and prepare the external Pay delivery, excluding private files."""
import shutil,json,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];target=ROOT.parent/'credmaisseuritizadora'
assert target.resolve().parent==ROOT.parent.resolve() and target.name=='credmaisseuritizadora'
for folder in ['assets','admin','contato','servicos','tools','supabase']:
 shutil.copytree(ROOT/folder,target/folder,dirs_exist_ok=True)
for name in ['index.html','robots.txt','sitemap.xml','_worker.js','_routes.json']:
 shutil.copyfile(ROOT/name,target/name)
private=ROOT.parent/'credmais-admin-access.txt'
content=private.read_text(encoding='utf8').replace('Painel: https://sejacredmais.com/admin/','Painel: https://admin.sejacredmais.com/')
with private.open('r+',encoding='utf8') as output:output.write(content);output.truncate()
pay=ROOT.parent/'credmaispay';note=pay/'INTEGRACAO-PAINEL.md'
text=note.read_text(encoding='utf8').replace('https://sejacredmais.com/admin/','https://admin.sejacredmais.com/')
if '## SEO por rota' not in text:
 text+='\n\n## SEO por rota\nA entrega dist contém robots.txt, sitemap.xml e HTML inicial com metadados próprios para seis páginas e dez artigos. Use os arquivos da entrega completa; preserve as rotas e o fallback SPA. O leitor do painel aplica também metadados publicados ao navegar.\n\nDepois de editar SEO no painel, exporte a configuração em SEO e Google → Arquivos e revisão. Para refletir as mudanças no HTML inicial e nos arquivos robots/sitemap, a equipe que hospeda precisa aplicar novo deploy. O painel não altera automaticamente o servidor externo.\n\nNovo build Vite precisa de uma etapa de geração SEO equivalente à entrega: copie o HTML base para cada rota e injete os metadados da configuração publicada. Na preparação local do grupo, tools/build-seo.py da Securitizadora executa essa etapa após npm run build.\n'
note.write_text(text,encoding='utf8')
archive=ROOT.parent/'credmaispay-entrega-20261008.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as output:
 for file in (pay/'dist').rglob('*'):
  if file.is_file():output.write(file,'dist/'+file.relative_to(pay/'dist').as_posix())
 output.write(note,'LEIA-ME.md')
print('Securitizadora source synchronized and external Pay ZIP rebuilt.')
