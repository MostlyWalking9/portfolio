/* Category selector hover/focus behavior — homepage only.
   Desktop/keyboard: crossfade through each card's placeholder image
   sequence on hover or focus, dim sibling cards, restore on leave.
   Touch (coarse pointer): slow passive autoplay per card while in
   view — never intercepts taps, so the link always navigates normally.
   Fully skipped under prefers-reduced-motion; a static first image and
   no scaling is guaranteed independently by animations.css. */

(function () {
  const cards = document.querySelectorAll('.principle-card');
  if (!cards.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const coarsePointer = window.matchMedia('(hover: none)').matches;
  const CROSSFADE_MS = 620;
  const SLIDESHOW_MS = 2600;

  function setActive(activeCard, isActive) {
    cards.forEach((card) => {
      if (card === activeCard) {
        card.classList.toggle('is-active', isActive);
      } else {
        card.classList.toggle('is-dimmed', isActive);
      }
    });
  }

  if (!coarsePointer) {
    cards.forEach((card) => {
      const images = card.querySelectorAll('.principle-card__media-img');
      if (images.length < 2) return;

      let index = 0;
      let timer = null;

      function show(i) {
        images.forEach((img, n) => img.classList.toggle('is-shown', n === i));
      }

      function start() {
        if (timer) return;
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

      card.addEventListener('mouseenter', () => { setActive(card, true); start(); });
      card.addEventListener('mouseleave', () => { setActive(card, false); stop(); });
      card.addEventListener('focusin', () => { setActive(card, true); start(); });
      card.addEventListener('focusout', () => { setActive(card, false); stop(); });
    });
    return;
  }

  // Touch / coarse pointer: slow passive autoplay while each card is
  // in view. No listeners on tap/click at all — ordinary link behavior
  // is left completely untouched.
  if (!('IntersectionObserver' in window)) return;

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

  cards.forEach((card) => io.observe(card));
})();
