/* Click sound for buttons and interactive controls, site-wide. Gated by
   the same sound preference as the ambient track and portal-select
   sound — silent until the person turns sound on. Portal cards on the
   homepage are excluded here since portal-sfx.js already gives them
   their own dedicated (delayed) sound as part of the selection
   transition; this would otherwise double up. */

(function () {
  const STORAGE_KEY = 'studio-sound-on';

  function soundIsOn() {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  }

  function sfxPath() {
    // All pages live at the same depth under /pages/, so this resolves
    // consistently regardless of which page triggered it.
    return new URL('../assets/audio/portal-select.mp3', document.baseURI).href;
  }

  function play() {
    if (!soundIsOn()) return;
    try {
      const sfx = new Audio(sfxPath());
      sfx.volume = 0.45;
      sfx.play().catch(() => {});
    } catch {}
  }

  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, a.btn, .work-filters button, .category-card, .lang-toggle button, .sound-toggle');
    if (!target) return;
    if (target.closest('[data-portal-grid]')) return; // handled by portal-sfx.js instead
    play();
  });
})();
