/* Reveal the solution cards as the overview enters the viewport. */
(() => {
  const section = document.querySelector('.solutions-flow');
  if (!section || !('IntersectionObserver' in window)) return;

  const cards = [...section.querySelectorAll('[data-reveal]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches || !cards.length) return;

  section.classList.add('solutions-flow--revealing');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -7% 0px' });

  cards.forEach((card) => observer.observe(card));
})();
