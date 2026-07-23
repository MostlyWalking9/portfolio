/* Portal selection sequence — homepage only. On click: play the select
   sound (if sound is on), scale the chosen card up over 2s while the
   other two cards and the intro text fade to 20% opacity, then load the
   subpage. Gated by the same sound preference as the ambient track —
   silent by default, but the visual transition always plays regardless
   of the sound toggle. Skips straight to navigation under
   prefers-reduced-motion, since a 2s scale/fade is exactly the kind of
   motion that preference asks us to avoid. */

(function () {
  const STORAGE_KEY = 'studio-sound-on';
  const SFX_SRC = '../assets/audio/portal-select.mp3';
  const TRANSITION_MS = 1100;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function soundIsOn() {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
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
            const sfx = new Audio(SFX_SRC);
            sfx.volume = 0.6;
            sfx.play().catch(() => {});
          } catch {}
        }

        if (reduceMotion) {
          setTimeout(() => { window.location.href = href; }, soundIsOn() ? 200 : 0);
          return;
        }

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
