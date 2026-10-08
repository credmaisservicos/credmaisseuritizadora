/* =========================================================
   CredMais — interação da vitrine de serviços
   Desktop: GSAP ScrollTrigger fixa a vitrine e avança os itens.
   Celular: carrossel nativo com scroll-snap e controles acessíveis.
   ========================================================= */
(() => {
  const section = document.querySelector('.services');
  if (!section) return;

  const items = [...section.querySelectorAll('.svc')];
  const images = [...section.querySelectorAll('.svc-stage__img')];
  if (!items.length || !images.length) return;

  const mobile = window.matchMedia('(max-width: 900px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = Math.max(0, items.findIndex((item) => item.classList.contains('is-active')));
  let desktopTrigger = null;

  const mobileCarousel = document.createElement('div');
  mobileCarousel.className = 'svc-mobile';
  mobileCarousel.setAttribute('aria-label', 'Serviços da CredMais');
  const track = document.createElement('div');
  track.className = 'svc-mobile__track';
  track.setAttribute('aria-label', 'Deslize para conhecer os serviços');
  track.setAttribute('role', 'region');
  track.tabIndex = 0;

  items.forEach((item, index) => {
    const head = item.querySelector('.svc__head');
    const description = item.querySelector('.svc__body p')?.textContent.trim() || '';
    const link = item.querySelector('.svc__link');
    const source = images.find((image) => Number(image.dataset.i) === index);
    const card = document.createElement('article');
    card.className = 'svc-mobile__card';
    card.id = `svc-mobile-card-${index}`;
    card.setAttribute('aria-label', `${String(index + 1).padStart(2, '0')} de ${items.length}`);
    card.innerHTML = `
      <div class="svc-mobile__image"><img class="svc-mobile__service-image${source?.classList.contains('svc-stage__img--photo') ? ' svc-mobile__service-image--photo' : ''}" src="${source?.getAttribute('src') || ''}" srcset="${source?.getAttribute('srcset') || ''}" sizes="${source?.getAttribute('sizes') || ''}" width="${source?.getAttribute('width') || ''}" height="${source?.getAttribute('height') || ''}" alt="${source?.getAttribute('alt') || ''}" loading="lazy" /></div>
      <div class="svc-mobile__copy">
        <div class="svc-mobile__eyebrow"><span>${String(index + 1).padStart(2, '0')}</span><strong>${head.querySelector('.svc__title').textContent.trim()}</strong></div>
        <p class="svc-mobile__short">${head.querySelector('.svc__short').textContent.trim()}</p>
        <p class="svc-mobile__description">${description}</p>
        <a class="svc-mobile__link" href="${link.href}">Conhecer serviço <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
      </div>`;
    track.append(card);
  });

  const controls = document.createElement('div');
  controls.className = 'svc-mobile__controls';
  controls.innerHTML = `
    <span class="svc-mobile__count" aria-live="polite"><span data-current>01</span> / ${String(items.length).padStart(2, '0')}</span>
    <div class="svc-mobile__buttons">
      <button class="svc-mobile__button" type="button" data-direction="-1" aria-label="Serviço anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6 6-6-6 6-6"/></svg></button>
      <button class="svc-mobile__button" type="button" data-direction="1" aria-label="Próximo serviço"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button>
    </div>`;
  mobileCarousel.append(track, controls);
  section.querySelector('.services__inner').append(mobileCarousel);
  const cards = [...track.children];

  function setActive(index, animate = true) {
    const next = Math.max(0, Math.min(items.length - 1, index));
    const previous = active;
    const shouldAnimate = animate && previous !== next && window.gsap && !reducedMotion.matches;
    if (shouldAnimate && !mobile.matches) {
      window.gsap.set(images[previous], { autoAlpha: 1, y: 0 });
    }
    active = next;
    items.forEach((item, i) => {
      const selected = i === active;
      item.classList.toggle('is-active', selected);
      item.querySelector('.svc__head').setAttribute('aria-expanded', String(selected));
    });
    images.forEach((image, i) => image.classList.toggle('is-active', i === active));
    const count = controls.querySelector('[data-current]');
    if (count) count.textContent = String(active + 1).padStart(2, '0');

    if (shouldAnimate) {
      if (mobile.matches) {
        const entering = cards[next].querySelectorAll('.svc-mobile__image, .svc-mobile__copy');
        window.gsap.killTweensOf(entering);
        window.gsap.fromTo(entering, { autoAlpha: 0, y: 12 }, {
          autoAlpha: 1, y: 0, duration: .48, stagger: .07, ease: 'power2.out', overwrite: true,
        });
      } else {
        window.gsap.killTweensOf(images);
        window.gsap.to(images[previous], { autoAlpha: 0, y: 14, duration: .24, ease: 'power1.out', overwrite: true });
        window.gsap.fromTo(images[next], { autoAlpha: 0, y: 14 }, {
          autoAlpha: 1, y: 0, duration: .55, ease: 'power2.out', overwrite: true,
        });
      }
    } else {
      images.forEach((image, i) => {
        image.style.opacity = i === active ? '1' : '0';
        image.style.visibility = i === active ? 'visible' : 'hidden';
        image.style.transform = 'translateY(0)';
      });
    }
  }

  function selectForScroll(index) {
    if (desktopTrigger?.isActive) {
      const progress = index / (items.length - 1);
      const targetY = desktopTrigger.start + (desktopTrigger.end - desktopTrigger.start) * progress;
      window.scrollTo({ top: targetY, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    } else {
      setActive(index);
    }
  }

  items.forEach((item, index) => {
    item.querySelector('.svc__head').addEventListener('click', () => selectForScroll(index));
  });
  let scrollFrame;
  track.addEventListener('scroll', () => {
    if (!mobile.matches) return;
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      const center = track.getBoundingClientRect().left + track.clientWidth / 2;
      const nearest = cards.reduce((best, card, i) => {
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - center);
        return distance < best.distance ? { index: i, distance } : best;
      }, { index: 0, distance: Infinity });
      setActive(nearest.index);
    });
  }, { passive: true });

  controls.addEventListener('click', (event) => {
    const button = event.target.closest('[data-direction]');
    if (!button) return;
    const target = (active + Number(button.dataset.direction) + cards.length) % cards.length;
    cards[target].scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    setActive(target);
  });

  mobile.addEventListener('change', () => {
    setActive(active, false);
    if (!mobile.matches) return;
    requestAnimationFrame(() => {
      const trackRect = track.getBoundingClientRect();
      const cardRect = cards[active].getBoundingClientRect();
      track.scrollLeft += cardRect.left + cardRect.width / 2 - (trackRect.left + track.clientWidth / 2);
    });
  });

  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    const media = window.gsap.matchMedia();
    media.add('(min-width: 901px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)', () => {
      desktopTrigger = window.ScrollTrigger.create({
        id: 'credmais-services',
        trigger: section,
        pin: section.querySelector('.services__inner'),
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * (items.length - 1) * .52)}`,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: {
          snapTo: 1 / (items.length - 1),
          duration: { min: .18, max: .42 },
          delay: .08,
          ease: 'power1.inOut',
        },
        onUpdate(self) {
          setActive(Math.round(self.progress * (items.length - 1)));
        },
      });
      return () => {
        desktopTrigger = null;
      };
    });
  }

  setActive(active, false);
})();
