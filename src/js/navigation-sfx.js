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
  const SWITCH_CUT_MS = 700; // scale+fade window for the discipline-switch buttons — long enough for the click sound to be heard, shorter than the full project transition since it's a smaller UI moment
  const PROJECT_CUT_MS = 950; // fires just after the scale-up keyframe completes at 80% (880ms of the 1100ms animation) and the fade-to-black completes at 75% (825ms) — so by the cut, the screen is already fully black and filled, not still mid-growth
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

  function disciplineSwitchNavigate(e, btn) {
    if (btn.classList.contains('is-current')) return; // already on this discipline, let it no-op
    e.preventDefault();
    const href = btn.href;
    playSfx();

    const switcher = btn.closest('.discipline-switch');
    if (reduceMotion) {
      setTimeout(() => { window.location.href = href; }, soundIsOn() ? 200 : 0);
      return;
    }
    if (switcher && switcher.classList.contains('is-transitioning')) return;

    btn.classList.add('is-selected');
    if (switcher) switcher.classList.add('is-transitioning');

    setTimeout(() => { window.location.href = href; }, SWITCH_CUT_MS);
  }

  function projectCardNavigate(e, card) {
    e.preventDefault();
    const href = card.href;
    playSfx();

    if (reduceMotion) {
      setTimeout(() => { window.location.href = href; }, soundIsOn() ? 200 : 0);
      return;
    }

    const grid = card.closest('.library-row__track, .library-grid, .project-grid');
    if (grid && grid.classList.contains('is-transitioning')) return; // already mid-transition, ignore extra clicks
    setSelectionVars(card);

    // Real bug fix: library rows scroll horizontally, which means they
    // (and their wrapper, for the vignette) clip anything that
    // overflows their bounds — including this card's own huge scale-up
    // transform. Without this, the "zoom to black" only ever filled
    // the row's small strip instead of the whole screen. Fix: pull the
    // card out to be a direct child of <body>, pinned with position:
    // fixed at exactly its current on-screen position first, so there
    // is no visual jump — then the scale-up plays out unclipped.
    const rect = card.getBoundingClientRect();
    card.style.position = 'fixed';
    card.style.top = `${rect.top}px`;
    card.style.left = `${rect.left}px`;
    card.style.width = `${rect.width}px`;
    card.style.height = `${rect.height}px`;
    card.style.margin = '0';
    document.body.appendChild(card);

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
    const switchBtn = e.target.closest('.discipline-switch__btn');
    if (switchBtn && switchBtn.href) {
      disciplineSwitchNavigate(e, switchBtn);
      return;
    }
    const navLink = e.target.closest('.site-nav__links a[data-nav-link]');
    if (navLink && navLink.href) {
      quickNavigate(e, navLink);
    }
  });

  // Force a full fresh reload on back/forward rather than a bfcache
  // restore — see portal-sfx.js for the full reasoning. Same fix here
  // for the project-card transition, which had the same glitch.
  window.addEventListener('unload', () => {});

  // Extra safeguard specifically for mobile Safari, whose bfcache
  // behavior doesn't always fully respect the unload-listener opt-out
  // above the same way Chrome does. If a bfcache restore is ever
  // detected anyway, force a genuine hard reload rather than trust the
  // frozen snapshot — guarantees a clean page every time, at the cost
  // of a brief extra reload on the rare case this fires.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) window.location.reload();
  });
})();
