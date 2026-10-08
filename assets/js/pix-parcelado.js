(() => {
  const bridge = document.querySelector('.pix-bridge');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (bridge && !reduceMotion && 'IntersectionObserver' in window) {
    bridge.classList.add('is-pending');
    let bridgeRevealed = false;
    const revealBridge = () => {
      if (bridgeRevealed) return;
      const rect = bridge.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      bridgeRevealed = true;
      bridge.classList.remove('is-pending');
      bridge.classList.add('is-visible');
      bridgeObserver.disconnect();
      window.removeEventListener('scroll', revealBridge);
      window.removeEventListener('resize', revealBridge);
    };
    const bridgeObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) revealBridge();
    }, { threshold: 0.05 });
    bridgeObserver.observe(bridge);
    window.addEventListener('scroll', revealBridge, { passive: true });
    window.addEventListener('resize', revealBridge, { passive: true });
    window.setTimeout(revealBridge, 500);
  }

  const timeline = document.querySelector('.pix-process__timeline');
  const progressLine = document.querySelector('.pix-process__progress');
  const steps = [...document.querySelectorAll('.pix-step')];
  if (!timeline || !progressLine || !steps.length) return;

  let frame = 0;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const updateTimeline = () => {
    frame = 0;
    const rect = timeline.getBoundingClientRect();
    const lead = window.innerHeight * 0.78;
    const progress = clamp((lead - rect.top) / (rect.height + lead * 0.35), 0, 1);
    const active = Math.min(steps.length - 1, Math.floor(progress * steps.length));

    progressLine.style.transform = window.matchMedia('(max-width: 720px)').matches
      ? `scaleY(${progress})`
      : `scaleX(${progress})`;
    steps.forEach((step, index) => step.classList.toggle('is-active', index === active));
  };

  const scheduleUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(updateTimeline);
  };

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  scheduleUpdate();
})();
