/* Navigation sound + transition — section/project pages. Plays when a
   click is about to load a genuinely new page. Two behaviors:

   - Project cards get the full move-to-center-then-fill-screen
     transition (same as the homepage discipline cards) before
     navigating — this both looks consistent site-wide and, just as
     importantly, gives the click sound a full ~1.1s to actually finish
     playing instead of getting cut off by an instant page change.
   - Discipline-switcher buttons and Studio/About/Contact links get a
     quicker, simpler nudge (~180ms) — enough for the sound to start,
     not a big visual moment.

   NOT for filters, category tiles, language toggle, or the sound
   toggle — those stay silent, this is only for "you're now leaving
   this page." Gated by the sound preference; silent until sound is on.

   Real bug fixed here: sound used to lag or not play at all,
   especially on mobile — every click built a brand new Audio object
   and called play() on it immediately, but the browser hadn't fetched
   or decoded the file yet, so playback hadn't actually started by the
   time navigation cut it off. On a real page load (not the in-shell
   swap), if that in-flight fetch got abandoned mid-navigation, the
   browser's back/forward cache could resume it later — which is
   exactly the "plays when I hit browser back" symptom. Fixed by
   preloading and decoding ONE shared Audio instance up front, on page
   load, and just replaying that same ready-to-go instance on click. */

(function () {
  const STORAGE_KEY = 'studio-sound-on';
  const NAV_DELAY_MS = 180;
  const PROJECT_CUT_MS = 850; // fires mid-transition, once the cover has already faded to black (keyframe completes fade at 75% = 825ms of the 1100ms animation) — the page cut lands while still "mid-zoom" rather than waiting for the animation to fully settle first
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sfx = new Audio(new URL('../assets/audio/portal-select.mp3', document.baseURI).href);
  sfx.preload = 'auto';
  sfx.volume = 0.45;
  sfx.load();

  function soundIsOn() {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  }

  function playSfx() {
    if (!soundIsOn()) return;
    try {
      sfx.currentTime = 0;
      sfx.play().catch(() => {});
    } catch {}
  }

  function setSelectionVars(el) {
    const rect = el.getBoundingClientRect();
    const moveX = (window.innerWidth / 2) - (rect.left + rect.width / 2);
    const moveY = (window.innerHeight / 2) - (rect.top + rect.height / 2);
    const fillScale = Math.max(window.innerWidth / rect.width, window.innerHeight / rect.height) * 1.15;
    el.style.setProperty('--move-x', `${moveX}px`);
    el.style.setProperty('--move-y', `${moveY}px`);
    el.style.setProperty('--fill-scale', fillScale.toFixed(2));
  }

  function quickNavigate(e, link) {
    if (!soundIsOn()) return; // let the click proceed normally, silent
    e.preventDefault();
    playSfx();
    setTimeout(() => { window.location.href = link.href; }, NAV_DELAY_MS);
  }

  function projectCardNavigate(e, card) {
    e.preventDefault();
    const href = card.href;
    playSfx();

    if (reduceMotion) {
      setTimeout(() => { window.location.href = href; }, soundIsOn() ? 200 : 0);
      return;
    }

    const grid = card.closest('.work-grid, .project-grid');
    if (grid && grid.classList.contains('is-transitioning')) return; // already mid-transition, ignore extra clicks
    setSelectionVars(card);
    card.classList.add('is-selected');
    if (grid) grid.classList.add('is-transitioning');

    setTimeout(() => { window.location.href = href; }, PROJECT_CUT_MS);
  }

  document.addEventListener('click', (e) => {
    const projectCard = e.target.closest('.project-card');
    if (projectCard && projectCard.href) {
      projectCardNavigate(e, projectCard);
      return;
    }
    const quickLink = e.target.closest('.discipline-switch__btn, .site-nav__links a[data-nav-link]');
    if (quickLink && quickLink.href) {
      quickNavigate(e, quickLink);
    }
  });

  // Same bfcache fix as the homepage: a restored page could have a
  // project card stuck mid-transition from right before the user
  // clicked through — reset it so the page isn't left looking frozen.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    document.querySelectorAll('.work-grid.is-transitioning, .project-grid.is-transitioning').forEach((g) => g.classList.remove('is-transitioning'));
    document.querySelectorAll('.project-card.is-selected').forEach((el) => el.classList.remove('is-selected'));
  });
})();
