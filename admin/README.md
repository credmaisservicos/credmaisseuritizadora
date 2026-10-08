# Central CredMais — administração

Painel único para Securitizadora, CredCartas e CredMais Pay. HTML, CSS e JavaScript, sem build ou dependências de execução.

## Abrir

Na raiz do site, execute `python -m http.server 5500` e acesse `http://127.0.0.1:5500/admin/`. Não abra o HTML diretamente: o catálogo é carregado por HTTP.

## Telas implementadas

- Visão geral dos três sites e histórico de alterações locais.
- Formulários separados por site, busca, status, anotações e exportação CSV. Os contatos disponíveis são exemplos explicitamente identificados.
- Banners: texto, imagem, botão, destino, enquadramento, alinhamento, visibilidade e prévia de computador/celular.
- Editor visual da página inteira, com cabeçalho, rodapé e os layouts existentes dos três sites.
- Prévia em tempo real em computador (1440 px), tablet (820 px) e celular (390 px), usando os breakpoints de cada site.
- Seções: arrastar para reordenar, mover por botões, ocultar, duplicar, excluir e trocar o modelo. Arraste pela alça também funciona por toque.
- Biblioteca com 12 modelos: imagem e texto, editorial, cards, cards com imagens, etapas, perguntas frequentes, contato, chamada para ação, galeria, texto, banner e outros produtos.
- Edição de textos, imagens, botões, itens e perguntas; opções de fundo, alinhamento, espaçamento e tamanho de títulos, além de informações de busca.
- Salvamento automático de rascunhos, desfazer/refazer e até 12 versões salvas manualmente por página.
- Biblioteca de imagens por site, importação, conversão para WebP, busca e visualização.
- Configurações do proprietário e dos sites, exportação de rascunhos e restauração da prévia.
- Login real do proprietário, recuperação e alteração de senha; cadastro público desativado.
- Recebimento de formulários reais, atualização automática da caixa, status e anotações no Supabase.
- Imagens na biblioteca do Supabase e rascunhos sincronizados.
- Publicação do conteúdo pelo editor, com carregamento nos sites sem um novo deploy.

`catalog.json` contém a referência inicial das 18 páginas e das 107 seções importadas. `preview/pages/` contém snapshots do HTML renderizado dos três sites; `preview/assets/` reúne os estilos e imagens necessários, com fotografias convertidas para WebP. `media/` contém miniaturas da biblioteca. Os originais dos sites foram preservados. Esses arquivos não são uma sincronização de produção.

`builder.js` e `builder.css` implementam o editor. `preview-frame.js` recebe as alterações e monta a prévia em um iframe isolado; os scripts originais dos sites não são executados. Animações são pausadas, formulários não enviam dados e links não navegam enquanto a página está sendo editada. A prévia representa layout e conteúdo, sem simular todos os comportamentos interativos dos sites publicados.

## Persistência e integração

Autenticação: Supabase Auth. As tabelas cms_admins, cms_leads, cms_pages, cms_media e cms_settings usam RLS para um único proprietário. Visitantes não podem consultar formulários; a view cms_public_pages expõe apenas o conteúdo publicado, sem versões anteriores. A biblioteca cms-images é pública para servir as imagens, com escrita restrita ao proprietário.

A sessão fica no sessionStorage e é renovada pelo painel. Formulários reais ficam apenas na memória do painel e no banco; não são gravados no localStorage. Rascunhos locais continuam como apoio em caso de falha de conexão, na chave credmais.admin.frontend.v1. O editor indica quando uma sincronização falha. Salvar rascunho e Publicar alterações são ações distintas.

O endpoint receive-contact valida origem, campos e autorização de contato. Há campo antispam, limite de envios e identificador único para evitar duplicação em tentativas repetidas. O registro é confirmado antes do aviso de e-mail; uma falha de notificação não descarta o contato. notification_status registra o resultado de envio pelo Resend. A atualização da caixa ocorre a cada 30 segundos enquanto o painel está visível.

As imagens importadas são reduzidas para até 1400 px e convertidas para WebP. O histórico de desfazer permanece durante a edição; as últimas 12 versões manuais são guardadas no rascunho. Ctrl/Cmd+S salva, Ctrl/Cmd+Z desfaz fora dos campos e Ctrl/Cmd+Shift+Z refaz.

## Produção

- Site: https://sejacredmais.com
- Cartas: https://cartas.sejacredmais.com
- Painel: https://sejacredmais.com/admin/
- CredMais Pay: o repositório contém os formulários e o leitor de conteúdo; a equipe da hospedagem externa precisa publicar a nova build.

Os projetos Cloudflare são credmais-securitizadora e credcartas. A publicação inicial usa Direct Upload. Editar conteúdo pelo painel dispensa redeploy; alterações de código exigem nova publicação. Os registros de e-mail da Hostinger foram preservados.

supabase/migrations contém o esquema; supabase/functions/receive-contact contém o endpoint. tools/deploy-central.py configura a central e tools/publish-sites.py publica apenas os dois sites autorizados. Os scripts leem credenciais de arquivos privados no diretório pai, fora dos repositórios. Não copie esses arquivos para o site. A senha inicial foi entregue em um arquivo privado fora dos repositórios; o proprietário pode alterá-la no painel.

Os tokens Cloudflare, Supabase e Resend ficam fora do frontend e dos repositórios. O projeto Cloudflare existente `credmaisapp` não faz parte deste painel e não deve ser alterado.

Rotas internas usam hash, por exemplo `#banners?site=cartas` e `#page-edit?id=securitizadora-0`. Dados textuais são escapados na renderização; destinos de botões aceitam apenas protocolos permitidos.
