/* Portal selection sequence — homepage only. On click: play the select
   sound (if sound is on), then a two-phase animation (see the CSS
   keyframes in layout.css): the card moves to screen-center with a
   slight scale while the other cards + intro text fade out, then the
   box scales up rapidly to fill the screen while the text separately
   scales just slightly and fades. The exact move/fill amounts are
   measured live here (getBoundingClientRect vs the viewport) since a
   fixed value can't work for all three cards — the left one needs to
   move right, the right one left, and viewport/card sizes vary by
   screen. Gated by the same sound preference as the ambient track —
   silent by default, but the visual transition always plays regardless
   of the sound toggle. Skips straight to navigation under
   prefers-reduced-motion, since this is exactly the kind of motion
   that preference asks us to avoid. */

(function () {
  const STORAGE_KEY = 'studio-sound-on';
  const TRANSITION_MS = 1100;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sfx = new Audio(new URL('../assets/audio/portal-select.mp3', document.baseURI).href);
  sfx.preload = 'auto';
  sfx.volume = 0.6;
  sfx.load();

  function soundIsOn() {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  }

  function setSelectionVars(card) {
    const rect = card.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;

    const moveX = viewportCenterX - cardCenterX;
    const moveY = viewportCenterY - cardCenterY;

    // How much the box needs to scale (from its own, now-centered,
    // center) to fully cover the viewport, plus a small safety margin.
    const fillScale = Math.max(
      window.innerWidth / rect.width,
      window.innerHeight / rect.height
    ) * 1.15;

    card.style.setProperty('--move-x', `${moveX}px`);
    card.style.setProperty('--move-y', `${moveY}px`);
    card.style.setProperty('--fill-scale', fillScale.toFixed(2));
  }

  function bindCards() {
    const grid = document.querySelector('[data-portal-grid]');
    if (!grid) return;
    const fadeEls = document.querySelectorAll('.hero__intro, .hero__eyebrow-row');

    grid.querySelectorAll('.principle-card').forEach((card) => {
      if (card.dataset.sfxBound) return;
      card.dataset.sfxBound = '1';

      card.addEventListener('click', (e) => {
        if (grid.classList.contains('is-transitioning')) { e.preventDefault(); return; }
        e.preventDefault();
        const href = card.href;

        if (soundIsOn()) {
          try {
            sfx.currentTime = 0;
            sfx.play().catch(() => {});
          } catch {}
        }

        if (reduceMotion) {
          setTimeout(() => { window.location.href = href; }, soundIsOn() ? 200 : 0);
          return;
        }

        setSelectionVars(card);
        card.classList.add('is-selected');
        grid.classList.add('is-transitioning');
        fadeEls.forEach((el) => el.classList.add('is-fading'));

        setTimeout(() => { window.location.href = href; }, TRANSITION_MS);
      });
    });
  }

  bindCards();
  document.addEventListener('content-injected', bindCards);

  // Fix for a real bug: navigating back via browser back/forward can
  // restore this exact page from the back/forward cache (bfcache) —
  // including the is-selected/is-transitioning classes still applied
  // from right before the user clicked through. Without this, the page
  // comes back visually stuck (one card scaled up, others dimmed) AND
  // functionally broken (the click handler above refuses new clicks
  // while is-transitioning is present). `pageshow` with `persisted`
  // true is the standard signal for "this is a bfcache restore, not a
  // fresh load" — reset everything when that happens.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    const grid = document.querySelector('[data-portal-grid]');
    if (!grid) return;
    grid.classList.remove('is-transitioning');
    grid.querySelectorAll('.principle-card.is-selected').forEach((el) => el.classList.remove('is-selected'));
    document.querySelectorAll('.hero__intro.is-fading, .hero__eyebrow-row.is-fading').forEach((el) => el.classList.remove('is-fading'));
  });
})();
