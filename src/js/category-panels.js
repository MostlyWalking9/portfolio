/* Category selector hover/focus behavior — homepage only.
   Desktop/keyboard: crossfade through each card's placeholder image
   sequence on hover or focus (if it has 2+ images), dim sibling cards,
   scale the active one up, restore on leave. Touch (coarse pointer):
   slow passive autoplay per card while in view — never intercepts taps.
   Fully skipped under prefers-reduced-motion.

   Cards are rendered asynchronously by site-data.js after its fetch
   resolves, so this can't just bind once at load time — it listens for
   the same 'content-injected' event and (re)binds anything new,
   guarding against double-binding with a data attribute. */

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const coarsePointer = window.matchMedia('(hover: none)').matches;
  const CROSSFADE_MS = 620;
  const SLIDESHOW_MS = 2600;

  function setActive(cards, activeCard, isActive) {
    cards.forEach((card) => {
      if (card === activeCard) {
        card.classList.toggle('is-active', isActive);
      } else {
        card.classList.toggle('is-dimmed', isActive);
      }
    });
  }

  function bindDesktop() {
    const cards = Array.from(document.querySelectorAll('.principle-card'));
    if (!cards.length) return;

    cards.forEach((card) => {
      if (card.dataset.panelBound) return;
      card.dataset.panelBound = '1';

      const images = card.querySelectorAll('.principle-card__media-img');
      let index = 0;
      let timer = null;

      function show(i) {
        images.forEach((img, n) => img.classList.toggle('is-shown', n === i));
      }
      function start() {
        if (images.length < 2 || timer) return;
        timer = setInterval(() => {
          index = (index + 1) % images.length;
          show(index);
        }, CROSSFADE_MS);
      }
      function stop() {
        if (timer) { clearInterval(timer); timer = null; }
        index = 0;
        show(0);
      }

      card.addEventListener('mouseenter', () => { setActive(cards, card, true); start(); });
      card.addEventListener('mouseleave', () => { setActive(cards, card, false); stop(); });
      card.addEventListener('focusin', () => { setActive(cards, card, true); start(); });
      card.addEventListener('focusout', () => { setActive(cards, card, false); stop(); });
    });
  }

  function bindTouch() {
    if (!('IntersectionObserver' in window)) return;
    const cards = Array.from(document.querySelectorAll('.principle-card'));
    if (!cards.length) return;

    const timers = new WeakMap();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const card = entry.target;
        const images = card.querySelectorAll('.principle-card__media-img');
        if (images.length < 2) return;

        if (entry.isIntersecting) {
          let index = 0;
          const id = setInterval(() => {
            index = (index + 1) % images.length;
            images.forEach((img, n) => img.classList.toggle('is-shown', n === index));
          }, SLIDESHOW_MS);
          timers.set(card, id);
        } else {
          const id = timers.get(card);
          if (id) { clearInterval(id); timers.delete(card); }
          images.forEach((img, n) => img.classList.toggle('is-shown', n === 0));
        }
      });
    }, { threshold: 0.6 });

    cards.forEach((card) => {
      if (card.dataset.ioBound) return;
      card.dataset.ioBound = '1';
      io.observe(card);
    });
  }

  const bind = coarsePointer ? bindTouch : bindDesktop;
  bind();
  document.addEventListener('content-injected', bind);
})();
