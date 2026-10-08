(() => {
  const groups = [
    ['.bg-context__heading', '.bg-context__text', '.bg-visual__image', '.bg-visual__copy', '.bg-steps header', '.bg-steps li', '.bg-faq__inner > div', '.bg-contact__copy'],
    ['.gc-relief__title', '.gc-relief__body', '.gc-quote > div', '.gc-quote__text', '.gc-conversation__intro', '.gc-conversation__steps li', '.gc-faq__intro', '.gc-faq__list details', '.gc-contact__inner > *']
  ];
  const selectors = groups.flat().join(',');
  const targets = [...document.querySelectorAll(selectors)];
  if (!targets.length || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  document.body.classList.add('page-motion-ready');
  targets.forEach((node, index) => {
    node.dataset.pageReveal = '';
    node.style.setProperty('--page-delay', `${Math.min(index % 4, 3) * 65}ms`);
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-page-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -4% 0px' });
  targets.forEach((target) => observer.observe(target));
})();
