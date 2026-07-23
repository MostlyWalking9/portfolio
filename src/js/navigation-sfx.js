/* Navigation sound — section/project pages only. Plays when a click is
   about to load a genuinely new page: a project card, a
   discipline-switcher button, or the Studio/About/Contact nav links
   (real navigations from here, unlike the Studio shell where those are
   in-page panel swaps). NOT for filters, category tiles, language
   toggle, or the sound toggle itself — those stay silent, this is only
   for "you're now leaving this page." Gated by the same sound
   preference as everything else; silent until the person turns sound
   on. A short delay lets the sound actually be heard before the new
   page starts loading. */

(function () {
  const STORAGE_KEY = 'studio-sound-on';
  const NAV_DELAY_MS = 180;

  function soundIsOn() {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  }

  function sfxPath() {
    return new URL('../assets/audio/portal-select.mp3', document.baseURI).href;
  }

  function playAndNavigate(e, link) {
    if (!soundIsOn()) return; // let the click proceed normally, silent
    e.preventDefault();
    try {
      const sfx = new Audio(sfxPath());
      sfx.volume = 0.45;
      sfx.play().catch(() => {});
    } catch {}
    setTimeout(() => { window.location.href = link.href; }, NAV_DELAY_MS);
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest(
      '.project-card, .discipline-switch__btn, .site-nav__links a[data-nav-link]'
    );
    if (!link || !link.href) return;
    playAndNavigate(e, link);
  });
})();
