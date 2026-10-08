# SEO e banners — Central CredMais

## Acesso

Painel publicado em https://admin.sejacredmais.com/. O login é exclusivo do proprietário. O painel tem `noindex` e robots.txt próprio. Tokens privados permanecem fora dos repositórios.

## Configuração pronta

- Securitizadora: 59 termos iniciais e seis páginas.
- CredCartas: 58 termos iniciais e seis páginas, no domínio cartas.sejacredmais.com.
- CredMais Pay: 60 termos iniciais, seis páginas e dez artigos existentes.
- Títulos, descrições, URL canônica, metadados Open Graph/Twitter e JSON-LD por página.
- Organization, WebSite, WebPage, BreadcrumbList, Service e BlogPosting conforme o conteúdo existente. Sem avaliações, resultados financeiros, endereço ou CNPJ inventados.
- Sitemap com URLs canônicas públicas. Sem prioridade ou frequência fictícia, sem admin/login.
- robots.txt com referência ao sitemap. `noindex` por página ou por site, configurável no painel.
- Campo de verificação do Search Console, prévia de busca, revisão editorial e exportações CSV/JSON/XML/TXT.

## Edição e publicação

**SEO e Google → Páginas:** selecione uma página, revise título, descrição, intenção principal, canônica e imagem. Salvar conserva o rascunho. Publicar SEO altera apenas esses campos e preserva o conteúdo já publicado.

**Palavras-chave:** edite termos, temas, destinos e andamento; clique em Salvar planejamento. Essa lista é privada e não é inserida em meta keywords ou como texto oculto. Ela não contém volume, dificuldade ou posição pesquisada.

**Rastreamento e marca:** permite ajustar descrição, nome público, logo, imagem padrão, perfis oficiais e verificação do Google. A desativação da indexação exige confirmação explícita.

**Arquivos e revisão:** visualizar, baixar e abrir robots.txt e sitemap.xml; exportar configurações; abrir Search Console, PageSpeed Insights e teste de resultados avançados.

Nas duas hospedagens Cloudflare, um Worker de Pages serve SEO no HTML inicial e gera robots/sitemap a partir da configuração publicada. Os dados públicos usam apenas a chave pública do Supabase, com cache de 30 segundos e fallback para a configuração do deploy. Os rascunhos e palavras-chave não são expostos na view pública. Assets são servidos diretamente; não há plano pago adicionado.

CredMais Pay tem hospedagem externa. A entrega inclui HTML inicial com metadados por rota, arquivos SEO, leitor público de configurações e dez artigos no sitemap. Mudanças de conteúdo e metadados no navegador vêm do painel. Atualizações dos arquivos e do HTML inicial dependem de novo deploy pela equipe externa. O painel permite exportar a configuração SEO para essa entrega. Não promete atualizar sozinho o servidor externo.

## Troca de banners

Cada banner mostra a dimensão recomendada e a proporção da imagem original, medidas no arquivo real. O guia está no editor do banner, no editor de página e no seletor da imagem principal.

Dois prompts copiáveis: um com as cores da marca; outro com as dimensões e a área de composição. As dimensões acompanham a proporção de cada arte, incluindo a arte quadrada da CredCartas. A mesma imagem se adapta ao celular; não há um campo de imagem mobile fictício. O guia recomenda espaço para o texto HTML e proteção de rosto/mãos. Não embutir CTA, taxas, prazos, contagem de parcelas ou resultados.

O painel otimiza uploads em WebP até 1400 px; arquivo recebido máximo 5 MB. Objetivo editorial de 400 KB quando possível. A dimensão recomendada é para criar uma matriz nítida, não um requisito rígido do upload.

## Publicação técnica

`tools/build-seo.py` gera metadados iniciais, arquivos e Workers. O Pay executa `scripts/seo-build.mjs` automaticamente em `npm run build`, lendo o SEO publicado para gerar HTML por rota, robots e sitemap; sem credenciais privadas. `tools/deploy-seo.py` instala as políticas e valores iniciais de maneira idempotente. `tools/publish-sites.py` publica apenas os dois projetos autorizados e conecta os hosts da Securitizadora, do painel e da CredCartas. Não altera credmaisapp ou registros de e-mail.

Para o Google, ainda é necessário adicionar e verificar as propriedades na conta desejada do Search Console e enviar os sitemaps. Não há conexão OAuth do Google nem métricas reais de tráfego no painel. Rastreamento, indexação e posicionamento são decisões do buscador.

Referências: [Google: meta tags](https://developers.google.com/search/docs/crawling-indexing/special-tags), [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro), [URLs canônicas](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).
