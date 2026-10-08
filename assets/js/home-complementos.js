(() => {
  const targets = [...document.querySelectorAll('.home-guarantee__copy, .home-guarantee__photo, .home-faq__intro, .home-faq__list details')];
  if (!targets.length || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  document.body.classList.add('home-complement-motion-ready');
  targets.forEach((target, index) => {
    target.dataset.homeReveal = '';
    target.style.setProperty('--home-delay', `${Math.min(index % 4, 3) * 70}ms`);
  });
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-home-visible');
    observer.unobserve(entry.target);
  }), { threshold: .12, rootMargin: '0px 0px -4% 0px' });
  targets.forEach((target) => observer.observe(target));
})();
