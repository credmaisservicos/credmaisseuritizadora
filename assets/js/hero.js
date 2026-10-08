(() => {
  const rotator = document.querySelector('.rotator');
  if (!rotator) return;

  const words = [...rotator.querySelectorAll('.rotator__word')];
  const INTERVAL = 2800;
  let index = 0;
  let timer;

  // A largura acompanha a palavra ativa, para o sublinhado e a centralização
  const fit = () => rotator.style.setProperty('--w', `${words[index].offsetWidth}px`);

  const next = () => {
    const current = words[index];
    index = (index + 1) % words.length;
    const incoming = words[index];

    current.classList.remove('is-active');
    current.classList.add('is-leaving');
    current.setAttribute('aria-hidden', 'true');

    incoming.classList.remove('is-leaving');
    incoming.classList.add('is-active');
    incoming.removeAttribute('aria-hidden');

    fit();

    // Depois que sai, a palavra volta para baixo, pronta para entrar de novo
    setTimeout(() => current.classList.remove('is-leaving'), 800);
  };

  const start = () => { stop(); timer = setInterval(next, INTERVAL); };
  const stop = () => clearInterval(timer);

  const init = () => {
    rotator.classList.add('is-ready');
    fit();
    start();
  };

  // Espera a fonte carregar para medir as palavras corretamente
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(init);

  window.addEventListener('resize', fit);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
})();
