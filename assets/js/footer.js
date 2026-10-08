(() => {
  const mount = document.getElementById('site-footer');
  if (!mount) return;

  mount.innerHTML = `
    <footer class="site-footer" aria-label="Rodapé CredMais">
      <div class="container site-footer__inner">
        <div class="site-footer__brand">
          <a class="site-footer__logo" href="/#inicio" aria-label="CredMais — voltar ao início">
            <img src="/assets/img/logo-branco.png" width="430" height="143" alt="CredMais Securitizadora" loading="lazy" />
          </a>
          <p>Soluções para sua empresa vender, receber e seguir em frente.</p>
        </div>
        <nav class="site-footer__nav" aria-label="Links do rodapé">
          <h2>Navegue</h2>
          <a href="/#inicio">Início</a>
          <a href="/#servicos">Serviços</a>
          <a href="/#como-funciona">Como funciona</a>
          <a href="/contato/">Contato</a>
        </nav>
        <div class="site-footer__contact">
          <h2>Fale com a CredMais</h2>
          <a href="https://wa.me/5511940893852" target="_blank" rel="noopener noreferrer">WhatsApp <span>(11) 94089-3852</span></a>
          <a href="mailto:contato@sejacredmais.com">E-mail <span>contato@sejacredmais.com</span></a>
          <a href="https://www.instagram.com/credmais.sa/" target="_blank" rel="noopener noreferrer">Instagram <span>@credmais.sa</span></a>
        </div>
      </div>
      <div class="container site-footer__bottom">
        <span>CredMais Securitizadora</span>
        <a href="https://focussdev.art" target="_blank" rel="noopener noreferrer">Desenvolvido por FocusDev <span aria-hidden="true">↗</span></a>
      </div>
    </footer>`;
})();
