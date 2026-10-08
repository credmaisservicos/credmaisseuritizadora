# CredMais Securitizadora — site institucional

Documento de passagem para continuar o projeto (Codex / Claude Code).
Leia inteiro antes de mexer. Ele descreve o que já existe, as regras de design
que o cliente aprovou ou rejeitou, e o plano das próximas seções.

---

## 1. Como rodar

- Site estático: HTML + CSS + JS puro. Sem build e sem dependências.
- Rodar localmente na raiz do projeto:
  ```
  python -m http.server 5500
  ```
  Abrir `http://127.0.0.1:5500`.
- **Não abrir o `index.html` com dois cliques.** Os caminhos são absolutos
  (`/assets/...`, `/servicos/...`) e só funcionam através de um servidor.
- Ainda não é um repositório git. Hospedagem provável: Cloudflare Pages
  (ainda não confirmada). Não publicar nada sem pedido explícito do cliente.
- Forma de trabalho do cliente: **uma seção por vez**. Mostrar a proposta,
  esperar a aprovação e só então construir. Ele acompanha tudo no navegador.

---

## 2. Estrutura de arquivos

```
index.html                       Home completa (hero, serviços, história, destaque Boleto, FAQ e contato)
servicos/<slug>/index.html       4 páginas de serviço completas
assets/css/style.css             Tokens, navbar, mega menu, menu mobile, navbar transparente
assets/css/hero.css              Hero da home
assets/js/header.js              Gera navbar + mega menu + menu mobile (fonte única dos SERVIÇOS)
assets/js/main.js                Comportamento: scroll, link ativo, mega menu, prévia, menu mobile
assets/js/hero.js                Palavras alternadas do hero
assets/img/logo.png              Logo oficial (dourado + azul-marinho), fundo transparente
assets/img/logo-prata.png        Variante: partes azul-marinho trocadas por prata (usada na navbar branca)
assets/img/logo-branco.png       Variante: partes azul-marinho em branco (usada sobre fundo azul)
assets/img/hero.jpg/.webp        Imagem do hero (editada: onda branca passa na frente da mulher)
assets/img/hero-top.png          1ª linha da imagem do hero, esticada atrás da navbar transparente
assets/img/servicos/home-*.webp  Fotografias exclusivas da vitrine e do destaque da Home
assets/img/servicos/*-historia.webp  Fotografias editoriais exclusivas das páginas de Boleto e Gestão
assets/img/servicos/pix-*-final.webp  Hero exclusivo do Pix sem quantidade embutida
assets/img/servicos/*-original.png   Originais enviados pelo cliente (não usar no site)
assets/img/hero-elementos*, hero-escritorio*   Imagens de hero descartadas (podem ser apagadas)
```

Cada página precisa de:
```html
<body data-page="<slug ou home>" [data-header="transparent"]>
  <div id="site-header"></div>
  <script src="/assets/js/header.js"></script>
  ...
  <script src="/assets/js/main.js"></script>
```
`data-header="transparent"` só na home: a navbar fica transparente sobre o hero
azul e volta a ser branca ao rolar.

---

## 3. Marca

### Paleta (tokens em `assets/css/style.css`, `:root`)

| Token | Valor | Uso |
|---|---|---|
| `--navy` | `#0E2257` | Cor principal escura: textos fortes, botões |
| `--navy-deep` | `#0A1940` | Topbar, hover de botões |
| `--gold-1` | `#F3D27A` | Dourado claro (detalhes sobre azul) |
| `--gold-2` | `#D7A443` | Dourado médio (traço do link ativo, ícones) |
| `--gold-3` | `#B8832A` | Dourado escuro (números, textos em dourado) |
| `--gold` | `linear-gradient(120deg, #F3D27A, #D7A443 50%, #B8832A)` | Palavra de destaque, logo |
| `--ink` | `#0E1A3A` | Texto base |
| `--text` | `#3A4566` | Texto corrido |
| `--muted` | `#6B7491` | Texto secundário |
| `--ivory` | `#FBFAF6` | Fundos suaves, hover claro |
| `--line` | `rgba(14,34,87,.09)` | Divisórias |
| Azul do hero | `#105AF9`, `#136CE9`, `#1557E7` | Fundo do hero no celular / tom das imagens |
| Azul do painel | `linear-gradient(150deg, #1A73F0, #1250E0)` | Painel de prévia do mega menu |
| Hover claro na lista | `#F3F6FD` | Item ativo do mega menu |

Resumo: **azul vivo das imagens + azul-marinho + dourado + branco.**
O cliente **rejeitou** usar o azul vibrante como cor da marca toda; ele aparece
só porque vem das imagens (hero e mockups).

### Tipografia
- Fonte única: **Sora** (Google Fonts, pesos 400/500/600/700). Escolhida por se
  parecer com a letra geométrica do logo e do banner do Banco BV de referência.
- Títulos: peso 700, `letter-spacing` negativo (−.025 a −.045em), `line-height` próximo de 1.
- Texto corrido: peso 400, `line-height` 1.6.
- Hierarquia por **contraste forte de tamanho** (frase pequena + palavra enorme),
  como no banner do BV.

### Logo
- Na navbar branca: `logo-prata.png`. Sobre azul: `logo-branco.png`.
- Nunca recriar o logo em SVG nem usar outro símbolo. As imagens geradas por IA
  vinham com um losango falso; ele foi substituído pelo logo oficial.

### Contatos
- E-mail: `contato@sejacredmais.com`
- WhatsApp: `(11) 94089-3852` → `https://wa.me/5511940893852`
- Endereço, CNPJ e registros: **ainda não fornecidos**. Não inventar.

---

## 4. Serviços (exatamente 4, confirmados pelo cliente)

Fonte única: array `SERVICES` em `assets/js/header.js`. Ao mudar texto, mude lá.

| # | Slug | Nome | O que é (palavras do cliente) |
|---|---|---|---|
| 01 | `pix-parcelado` | Pix Parcelado | Dá à empresa a opção de vender por Pix parcelado |
| 02 | `antecipacao-de-recebiveis` | Antecipação de boletos e recebíveis | Antecipa um valor que a empresa tem para receber |
| 03 | `boleto-garantido` | Boleto Garantido | A empresa vende no boleto e tem garantia de receber mesmo se o cliente não pagar |
| 04 | `gestao-de-cobrancas` | Gestão de cobranças | A CredMais faz as cobranças para a empresa |

**Não são serviços** (estavam numa lista antiga e foram removidos): securitização,
aquisição de direitos creditórios, gestão de ativos.

Imagem de cada serviço: `assets/img/servicos/<antecipacao|pix-parcelado|boleto-garantido|gestao-de-cobrancas>.webp` (com variantes responsivas quando disponíveis)
(1122×1402, fundo transparente).

---

## 5. Regras de design (feedback do cliente — obrigatório)

O cliente quer **acabamento de agência profissional** e rejeita o que tem
"cara de IA / template". **Não usar:**
- Etiqueta em pílula com ponto pulsante e texto em caixa alta espaçada
  (ex.: "● SECURITIZADORA · ANTECIPAÇÃO") — em nenhuma seção.
- Linha de selos com check sob o CTA ("✓ Análise caso a caso · ✓ Proposta clara").
- Hover em que o dourado "enche" o botão azul. Hovers devem ser discretos:
  escurecer levemente, subir 1px, a seta andar 3–4px.
- Selos do tipo "DESTAQUE", rótulos minúsculos em caixa alta em excesso,
  círculos/blobs decorativos genéricos, marquees com ✦, excesso de ícones flutuantes.

**Fazer:**
- Alinhamento limpo: blocos de texto numa mesma margem, sem recuos aleatórios.
- Texto e botões **não cobrem a pessoa** das imagens.
- Onda/borda branca no fim de imagens emendando na seção seguinte (fundo `#fff` puro).
- Animações sóbrias: entrada com `translateY + blur` leve e escalonada; easing
  `--ease: cubic-bezier(.22,1,.36,1)`.
- Respeitar `prefers-reduced-motion`.
- Responsivo de 340px até 2560px. Breakpoints em uso: 1180, 1024 (vira hambúrguer),
  900, 719 (some a topbar), 599 (celular), 370.
- Não inventar números, taxas, prazos ou depoimentos.

Antes de entregar qualquer seção: testar em 1920, 1440, 1100, 820 e 390px
(o Chrome headless com `--screenshot` funciona bem para isso).

---

## 6. O que já está pronto

### Navbar (todas as páginas)
- Topbar azul-marinho com claim + e-mail + WhatsApp (recolhe ao rolar; some abaixo de 720px).
- Barra: logo, links (Início · Serviços ▾ · Como funciona · Contato), botão "Fale conosco".
- Link ativo com traço dourado; na home acompanha a seção visível.
- Ao rolar: compacta, fundo branco translúcido com blur.
- **Home:** transparente sobre o hero, com logo dourado/branco, links brancos e
  botão branco. Volta ao padrão ao rolar ou com o menu mobile aberto.
- **Mega menu de Serviços:** lista numerada 01–04 à esquerda + painel azul de
  prévia à direita, que troca conforme o item sob o mouse/foco. Rodapé
  "Não sabe qual escolher? Fale com um especialista →" (WhatsApp). Abre no hover
  e no clique, fecha com Esc, clique fora ou Tab para fora.
- **Menu mobile** (≤1024px): painel em tela cheia, links grandes numerados,
  "Serviços" em acordeão, botão + contatos no rodapé, trava o scroll, foco preso.

### Hero (home)
- Imagem de fundo inteira (proporção 1672/941), mulher à direita, onda branca no fim.
- Texto no espaço azul livre à esquerda, tudo na mesma margem:
  1. "Sua empresa já vendeu. Agora, transforme" (pequeno)
  2. Palavra alternada em dourado: **Boletos → Recebíveis → Duplicatas → Vendas**
     (a cada 2,8s; animação 3D de baixo para cima)
  3. "em capital" (branco, grande)
  4. "A CredMais antecipa o que a sua empresa tem a receber, com análise de cada
     operação e atendimento próximo do início ao fim."
  5. Botão pílula branca "Saiba mais →" (hoje aponta para `/#como-funciona`)
- Desktop: posições e tamanhos em `vw` para acompanhar a imagem.
- ≤1024px: texto centralizado em cima, imagem abaixo.

### Home — demais seções
- Vitrine responsiva dos quatro serviços, com troca por scroll no desktop e carrossel no celular.
- História ilustrativa do João, com aviso de que personagem, empresa e resultados são fictícios.
- Destaque de Boleto Garantido, dúvidas frequentes, canais de contato e rodapé.
- A vitrine usa fotos exclusivas da Home, sem números ou promessas operacionais embutidas.
- O hero do Pix foi substituído por uma arte exclusiva sem contagem de parcelas; imagens antigas com limites numéricos não devem voltar ao site sem confirmação.

### Páginas de serviço
- As quatro páginas têm hero e composição próprios, seções explicativas, dúvidas e contato.
- Gestão de cobranças comunica apenas que a CredMais faz as cobranças para a empresa; não apresenta automação, relatórios, prazos ou recuperação garantida.
- Boleto Garantido comunica a garantia de recebimento e orienta o cliente a consultar as condições da operação.
- As páginas novas respeitam redução de movimento e foram verificadas nos tamanhos previstos (1920, 1440, 1100, 820 e 390 px).

---

## 7. Ordem implementada da Home

Ordem da home:
1. Hero ✅
2. Serviços
3. Como funciona
4. Boleto Garantido em destaque
5. Dúvidas frequentes
6. Contato
7. Rodapé

Fundo das seções logo após o hero: **branco puro** (emenda com a onda).

### 7.2 Serviços — vitrine responsiva com imagens
- **Desktop:** duas colunas.
  - Esquerda: título da seção + lista numerada dos 4 serviços (mesmo estilo do
    mega menu: número dourado `--gold-3`, nome em `--navy` peso 600, frase curta
    em `--muted`, divisórias `--line`). O item ativo ganha fundo `#F3F6FD`,
    mostra a descrição completa e o link "Conhecer serviço →" para `/servicos/<slug>/`.
  - Direita: o mockup do serviço ativo grande. Ao trocar o item, a imagem troca
    com fade + leve deslocamento. Flutuação muito sutil (translateY ±6px, 6s).
  - Troca automática a cada ~5s; para quando o usuário interage (hover/clique/foco).
- **Celular:** carrossel com arraste (scroll-snap), imagem em cima e texto embaixo,
  indicadores 1/4.
- Título usado: "Soluções para a sua empresa **receber mais e melhor**"
  (última parte em dourado `--gold`).
- Textos curtos (já usados no mega menu):
  - Pix Parcelado — "Venda no Pix em parcelas" / "Dê aos seus clientes a opção de comprar no Pix parcelado."
  - Antecipação — "Receba hoje o que entraria depois" / "Antecipe o valor que a sua empresa tem para receber de boletos e outros recebíveis."
  - Boleto Garantido — "Garantia de recebimento" / "Sua empresa vende no boleto e tem a garantia de receber, mesmo se o cliente não pagar."
  - Gestão de cobranças — "A CredMais cobra por você" / "A CredMais faz as cobranças para a sua empresa, para você se dedicar ao que importa: vender."

### 7.3 Como funciona
- 4 etapas: Contato → Análise → Proposta → Recursos na empresa.
- Linha de progresso que se preenche com o scroll. Sem ícones genéricos em excesso.

### 7.4 Boleto Garantido em destaque
- Bloco de destaque com o mockup `boleto-garantido.webp` e a explicação da garantia.

### 7.5 Dúvidas frequentes
- Acordeão (`<details>`), 4–6 perguntas. Respostas só com informação confirmada.

### 7.6 Chamada final
- Inspirada em referência enviada pelo cliente (anúncio "Conta PJ+"): texto
  empilhado à esquerda com palavra grande colorida, CTA em pílula com contorno
  e seta, foto à direita dentro de moldura arredondada com a cabeça "saindo"
  por cima da moldura. Versão enxuta: no máximo 1 selo e 1–2 ícones.
  Precisa de foto com fundo transparente (pessoa diferente do hero).

### 7.7 Rodapé
- Logo, links, e-mail, WhatsApp. Endereço/CNPJ quando o cliente enviar.

### Páginas de serviço (`/servicos/<slug>/`)
- Pix Parcelado, Antecipação, Boleto Garantido e Gestão de Cobranças estão implementadas em `/servicos/<slug>/`.

---

## 8. Pendências — confirmar com o cliente

1. **Gestão de cobranças:** o mockup original promete "Lembretes automáticos",
   "Acompanhamento de pagamentos", "Relatórios em tempo real" e
   "Pagamento recuperado!". Esse mockup foi retirado das páginas e da navegação;
   confirmar essas funções antes de voltar a usá-lo.
2. **Pix Parcelado:** mockups antigos mostram números de parcelas. Não usar essas
   artes até confirmar os limites e condições reais.
3. **Marca Pix:** seguir o manual de uso da marca Pix do Banco Central.
4. **Topbar:** o claim "SECURITIZADORA • ANTECIPAÇÃO DE RECEBÍVEIS" tem estilo
   parecido com o que o cliente rejeitou. Perguntar se deve sair.
5. Destino final do botão "Saiba mais" do hero.
6. Endereço, CNPJ e registro (CVM ou outro) para o rodapé.
7. Domínio (`sejacredmais.com`?) e conta do Cloudflare/GitHub antes de publicar.

---

## 9. Observações técnicas

- `header.js` injeta o HTML no lugar de `#site-header`; `main.js` depende dele,
  então a ordem dos scripts importa.
- A prévia do mega menu usa `data-i` para casar `.mega__item` com `.mega__preview`.
- `hero.js` mede a largura da palavra ativa (`--w`) após `document.fonts.ready`.
- Imagem do hero: `hero.jpg` foi editada em Python (Pillow + numpy) para a onda
  branca e a faixa azul-clara passarem na frente da calça. Se trocar a imagem,
  repetir esse cuidado ou pedir uma imagem já com a onda na frente.
- Mockups dos serviços: o losango falso foi apagado por difusão e o logo oficial
  foi colado (celular do Pix, camisa e notebook da cobrança, cartão do boleto).
  A data "10/05/2024" do boleto foi trocada por uma barra cinza.
