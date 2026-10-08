(() => {
  const root = document.documentElement;
  const header = document.getElementById('header');
  const burger = header.querySelector('.burger');
  const menu = document.getElementById('menu');
  const desktopMQ = window.matchMedia('(min-width: 1025px)');
  const hoverMQ = window.matchMedia('(hover: hover) and (pointer: fine)');
  const isHome = (document.body.dataset.page || 'home') === 'home';

  /* ---------- Altura do header (usada pelo painel do menu) ---------- */
  const setHeaderH = () => root.style.setProperty('--header-h', `${header.offsetHeight}px`);
  setHeaderH();
  window.addEventListener('resize', setHeaderH);

  /* ---------- Header ao rolar: recolhe a topbar e compacta ---------- */
  let ticking = false;
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    if (isHome) updateActive();
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ---------- Link ativo conforme a seção visível (só na home) ---------- */
  const sectionLinks = [...document.querySelectorAll('[data-section]')];
  const sections = [...new Set(sectionLinks.map((a) => a.dataset.section))]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function updateActive() {
    const line = window.innerHeight * 0.4;
    let current = sections[0];
    sections.forEach((s) => { if (s.getBoundingClientRect().top <= line) current = s; });
    if (!current) return;
    sectionLinks.forEach((a) => a.classList.toggle('is-active', a.dataset.section === current.id));
  }
  onScroll();

  /* ---------- Mega menu de Serviços (desktop) ---------- */
  const item = header.querySelector('.has-mega');
  const trigger = item.querySelector('.nav__trigger');
  const mega = item.querySelector('.mega');
  let closeTimer;

  const openMega = () => {
    clearTimeout(closeTimer);
    item.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
  };
  const closeMega = () => {
    clearTimeout(closeTimer);
    item.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  };

  item.addEventListener('mouseenter', () => { if (hoverMQ.matches) openMega(); });
  item.addEventListener('mouseleave', () => {
    if (hoverMQ.matches) closeTimer = setTimeout(closeMega, 180);
  });
  trigger.addEventListener('click', () => {
    item.classList.contains('is-open') ? closeMega() : openMega();
  });

  // Fecha ao clicar fora, ao sair com Tab ou com Esc
  document.addEventListener('click', (e) => { if (!item.contains(e.target)) closeMega(); });
  item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) closeMega(); });
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && item.classList.contains('is-open')) { closeMega(); trigger.focus(); }
    if (e.key === 'ArrowDown' && document.activeElement === trigger) {
      e.preventDefault();
      openMega();
      mega.querySelector('a').focus();
    }
  });

  // Painel de prévia acompanha o serviço sob o mouse ou com foco
  const megaItems = [...mega.querySelectorAll('.mega__item')];
  const previews = [...mega.querySelectorAll('.mega__preview')];
  const showPreview = (i) => {
    megaItems.forEach((el) => el.classList.toggle('is-active', el.dataset.i === i));
    previews.forEach((el) => el.classList.toggle('is-active', el.dataset.i === i));
  };
  megaItems.forEach((el) => {
    el.addEventListener('mouseenter', () => showPreview(el.dataset.i));
    el.addEventListener('focus', () => showPreview(el.dataset.i));
  });

  /* ---------- Menu mobile ---------- */
  const openMenu = () => {
    setHeaderH();
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    root.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fechar menu');
  };
  const closeMenu = ({ restoreFocus = false } = {}) => {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    root.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menu');
    if (restoreFocus) burger.focus();
  };

  burger.addEventListener('click', () => {
    menu.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => closeMenu()));
  menu.addEventListener('click', (e) => {
    if (e.target.classList.contains('menu__panel')) closeMenu();
  });

  // Acordeão de Serviços dentro do menu
  const group = menu.querySelector('.menu__group');
  const toggle = group.querySelector('.menu__toggle');
  toggle.addEventListener('click', () => {
    const open = group.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // Esc fecha; Tab fica preso dentro do menu aberto
  document.addEventListener('keydown', (e) => {
    if (!menu.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeMenu({ restoreFocus: true });
    if (e.key === 'Tab') {
      const items = [burger, ...menu.querySelectorAll('a, button')]
        .filter((el) => el.offsetParent !== null);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Se a tela crescer para desktop com o menu aberto, fecha
  desktopMQ.addEventListener('change', (e) => {
    if (e.matches) closeMenu();
    else closeMega();
  });
})();
