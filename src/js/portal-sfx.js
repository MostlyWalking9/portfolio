/* Portal-select click sound — homepage only. Plays a short UI sound
   when a section card is clicked, then gives the sound a brief moment
   to be heard before navigating (multi-page site, so audio doesn't
   survive the page unload otherwise). Gated by the same sound
   preference as the ambient track — if the person hasn't turned sound
   on, clicks stay silent, so nothing surprises a muted-by-default
   visitor. Respects prefers-reduced-motion isn't relevant here (it's
   audio, not motion), but does nothing if the file is missing. */

(function () {
  const STORAGE_KEY = 'studio-sound-on';
  const SFX_SRC = '../assets/audio/portal-select.mp3';
  const NAV_DELAY_MS = 220;

  function soundIsOn() {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  }

  function bindCards() {
    document.querySelectorAll('[data-portal-grid] .principle-card').forEach((card) => {
      if (card.dataset.sfxBound) return;
      card.dataset.sfxBound = '1';

      card.addEventListener('click', (e) => {
        if (!soundIsOn()) return; // silent by default, respects the toggle
        e.preventDefault();
        const href = card.href;
        try {
          const sfx = new Audio(SFX_SRC);
          sfx.volume = 0.6;
          sfx.play().catch(() => {});
        } catch {}
        setTimeout(() => { window.location.href = href; }, NAV_DELAY_MS);
      });
    });
  }

  bindCards();
  document.addEventListener('content-injected', bindCards);
})();
