/* Reveals each passage once as it enters the viewport, in the same quiet rhythm as Home. */
(() => {
  const targets = [...document.querySelectorAll('[data-ar-reveal]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!targets.length || reduceMotion) return;

  document.body.classList.add('ar-motion-ready');
  const pending = new Set(targets);

  const revealVisible = () => {
    pending.forEach((target) => {
      const rect = target.getBoundingClientRect();
      if (rect.top > window.innerHeight * .86 || rect.bottom < 0) return;
      target.classList.add('is-visible');
      pending.delete(target);
    });
    if (!pending.size) {
      window.removeEventListener('scroll', revealVisible);
      window.removeEventListener('resize', revealVisible);
    }
  };

  window.addEventListener('scroll', revealVisible, { passive: true });
  window.addEventListener('resize', revealVisible);
  revealVisible();
})();
