/* =========================================================
   CredMais — Navbar compartilhada por todas as páginas.
   Uso: <div id="site-header"></div><script src="/assets/js/header.js"></script>
   A página atual é indicada em <body data-page="..."> (ex.: "home", "securitizacao").
   ========================================================= */
(() => {
  const WHATSAPP = 'https://wa.me/5511940893852';
  const PHONE = '(11) 94089-3852';
  const EMAIL = 'contato@sejacredmais.com';

  // desc: linha curta da lista · long: texto do painel de prévia
  const SERVICES = [
    {
      slug: 'pix-parcelado',
      title: 'Pix Parcelado',
      desc: 'Venda no Pix em parcelas',
      long: 'Dê aos seus clientes a opção de comprar no Pix parcelado.',
      banner: 'pix-parcelado-venda.webp',
      bannerSmall: 'pix-parcelado-venda-1000.webp',
      bannerWidth: 1672,
    },
    {
      slug: 'antecipacao-de-recebiveis',
      title: 'Antecipação de boletos e recebíveis',
      desc: 'Receba hoje o que entraria depois',
      long: 'Antecipe o valor que a sua empresa tem para receber de boletos e outros recebíveis.',
      banner: 'antecipacao-hero-wide.webp',
      bannerSmall: 'antecipacao-hero-wide-1000.webp',
      bannerWidth: 1672,
    },
    {
      slug: 'boleto-garantido',
      title: 'Boleto Garantido',
      desc: 'Garantia de recebimento',
      long: 'Sua empresa vende no boleto e tem a garantia de receber, mesmo se o cliente não pagar.',
      banner: 'boleto-garantido-historia.webp',
      bannerSmall: 'boleto-garantido-historia-1000.webp',
      bannerWidth: 1536,
    },
    {
      slug: 'gestao-de-cobrancas',
      title: 'Gestão de cobranças',
      desc: 'A CredMais cobra por você',
      long: 'A CredMais faz as cobranças para a sua empresa, para você se dedicar ao que importa: vender.',
      banner: 'gestao-de-cobrancas-historia.webp',
      bannerSmall: 'gestao-de-cobrancas-historia-1000.webp',
      bannerWidth: 1536,
    },
  ];

  const page = document.body.dataset.page || 'home';
  // Páginas com hero de fundo escuro pedem a navbar transparente no topo
  const overHero = document.body.dataset.header === 'transparent';
  const brandedTop = !overHero;
  const isService = SERVICES.some((s) => s.slug === page);
  const svg = (paths) => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
  const arrow = svg('<path d="M5 12h14M13 6l6 6-6 6"/>');

  const activeIndex = Math.max(0, SERVICES.findIndex((s) => s.slug === page));
  const num = (i) => String(i + 1).padStart(2, '0');

  const megaItems = SERVICES.map((s, i) => `
    <a href="/servicos/${s.slug}/" class="mega__item${s.slug === page ? ' is-current' : ''}${i === activeIndex ? ' is-active' : ''}" data-i="${i}" style="--i:${i}"${s.slug === page ? ' aria-current="page"' : ''}>
      <span class="mega__num">${num(i)}</span>
      <span class="mega__text">
        <strong>${s.title}</strong>
        <small>${s.desc}</small>
      </span>
      <span class="mega__go" aria-hidden="true">${arrow}</span>
    </a>`).join('');

  const megaPreviews = SERVICES.map((s, i) => `
    <a href="/servicos/${s.slug}/" class="mega__preview${i === activeIndex ? ' is-active' : ''}" data-i="${i}" tabindex="-1" aria-hidden="true" title="Conhecer ${s.title}">
      <img class="mega__preview-image" src="/assets/img/servicos/${s.banner}" srcset="/assets/img/servicos/${s.bannerSmall} 1000w, /assets/img/servicos/${s.banner} ${s.bannerWidth}w" sizes="(max-width: 1024px) 100vw, 440px" alt="" loading="lazy" />
    </a>`).join('');

  const menuServices = SERVICES.map((s) => `
    <a href="/servicos/${s.slug}/"${s.slug === page ? ' class="is-active" aria-current="page"' : ''}>${s.title}</a>`).join('');

  const html = `
  <header class="header${overHero ? ' is-over-hero' : ''}${brandedTop ? ' is-branded-top' : ''}" id="header">
    <div class="topbar">
      <div class="container topbar__inner">
        <span class="topbar__claim">Securitizadora <i aria-hidden="true"></i> Antecipação de recebíveis</span>
        <div class="topbar__contact">
          <a href="mailto:${EMAIL}">${svg('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/>')}${EMAIL}</a>
          <span class="topbar__sep" aria-hidden="true"></span>
          <a href="${WHATSAPP}" target="_blank" rel="noopener">${svg('<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20z"/>')}${PHONE}</a>
        </div>
      </div>
    </div>

    <div class="nav">
      <div class="container nav__inner">
        <a href="/" class="brand" aria-label="CredMais Securitizadora — início">
          <img class="brand__logo" src="/assets/img/logo-prata.png" alt="CredMais Securitizadora" width="735" height="167" />
          ${overHero || brandedTop ? '<img class="brand__logo brand__logo--light" src="/assets/img/logo-branco.png" alt="" aria-hidden="true" width="735" height="167" />' : ''}
        </a>

        <nav class="nav__links" aria-label="Principal">
          <a href="/#inicio" data-section="inicio"${page === 'home' ? ' class="is-active"' : ''}>Início</a>

          <div class="nav__item has-mega">
            <button class="nav__trigger${isService ? ' is-active' : ''}" type="button" aria-expanded="false" aria-controls="mega">
              Serviços
              <svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
            </button>

            <div class="mega" id="mega">
              <div class="mega__inner">
                <div class="mega__list">
                  ${megaItems}
                  <a href="${WHATSAPP}" target="_blank" rel="noopener" class="mega__help">
                    <span>Não sabe qual escolher?</span>
                    <strong>Fale com um especialista ${arrow}</strong>
                  </a>
                </div>
                <div class="mega__aside">${megaPreviews}</div>
              </div>
            </div>
          </div>

          <a href="/#como-funciona" data-section="como-funciona">Como funciona</a>
          <a href="/contato/" data-section="contato"${page === 'contato' ? ' class="is-active" aria-current="page"' : ''}>Contato</a>
        </nav>

        <div class="nav__actions">
          <a href="/contato/" class="btn-navy"><span>Fale conosco</span>${arrow}</a>
          <button class="burger" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu">
            <span></span><span></span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <div class="menu" id="menu" aria-hidden="true">
    <div class="menu__panel" role="dialog" aria-modal="true" aria-label="Menu">
      <nav class="menu__links">
        <a href="/#inicio" data-section="inicio"><small>01</small><span>Início</span></a>

        <div class="menu__group${isService ? ' is-open' : ''}">
          <button class="menu__toggle" type="button" aria-expanded="${isService}" aria-controls="menu-servicos">
            <small>02</small><span>Serviços</span><i aria-hidden="true"></i>
          </button>
          <div class="menu__sub" id="menu-servicos">
            <div class="menu__sub-inner">${menuServices}</div>
          </div>
        </div>

        <a href="/#como-funciona" data-section="como-funciona"><small>03</small><span>Como funciona</span></a>
        <a href="/contato/" data-section="contato"${page === 'contato' ? ' class="is-active" aria-current="page"' : ''}><small>04</small><span>Contato</span></a>
      </nav>

      <div class="menu__footer">
        <a href="/contato/" class="btn-navy btn-navy--full"><span>Fale conosco</span>${arrow}</a>
        <div class="menu__contact">
          <a href="${WHATSAPP}" target="_blank" rel="noopener"><small>WhatsApp</small>${PHONE}</a>
          <a href="mailto:${EMAIL}"><small>E-mail</small>${EMAIL}</a>
        </div>
      </div>
    </div>
  </div>`;

  const mount = document.getElementById('site-header');
  mount.insertAdjacentHTML('beforebegin', html);
  mount.remove();
})();
