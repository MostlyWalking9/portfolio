/* Ambient studio sound toggle. Off by default; the person has to click
   to turn it on. On Home/About/Contact this actually plays the looping
   studio track (assets/audio/studio-ambient.mp3). Section and project
   pages intentionally have NO background track — deliberately quieter,
   content-focused pages — but the same toggle still lives there as the
   master sound preference, gating the click-sound effects (portal-sfx,
   click-sfx) site-wide. So this script works with or without an
   <audio> element present; it just skips playback calls when there
   isn't one. Preference is remembered for the rest of the browser
   tab's session only. */

(function () {
  const btn = document.querySelector('[data-sound-toggle]');
  if (!btn) return;
  const audio = document.querySelector('[data-ambient-audio]');

  const STORAGE_KEY = 'studio-sound-on';
  const labelEl = btn.querySelector('[data-sound-label]');

  const COPY = {
    on:  { en: 'Sound: On',  de: 'Ton: An' },
    off: { en: 'Sound: Off', de: 'Ton: Aus' },
  };

  function currentLang() {
    return document.documentElement.getAttribute('lang') || 'en';
  }

  function paintLabel(on) {
    if (!labelEl) return;
    const copy = on ? COPY.on : COPY.off;
    labelEl.setAttribute('data-en', copy.en);
    labelEl.setAttribute('data-de', copy.de);
    labelEl.textContent = copy[currentLang()] || copy.en;
  }

  function disableControl() {
    btn.disabled = true;
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Ambient studio sound unavailable');
    paintLabel(false);
  }

  function setState(on) {
    btn.setAttribute('aria-pressed', String(on));
    paintLabel(on);
    sessionStorage.setItem(STORAGE_KEY, on ? '1' : '0');
    if (!audio) return; // this page has no ambient track — toggle still controls click-sfx elsewhere
    if (on) {
      audio.play().catch(() => { /* blocked or missing — error handler below covers missing file */ });
    } else {
      audio.pause();
    }
  }

  if (audio) {
    audio.addEventListener('error', disableControl, { once: true });
    audio.load();
  }

  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    const next = btn.getAttribute('aria-pressed') !== 'true';
    setState(next);
  });

  // Restore this tab session's preference. Calling play() here is a
  // deliberate choice — it only fires when the user already turned sound
  // on earlier in this same session (a real prior gesture), never on a
  // first visit. Browsers may still block it without a fresh gesture;
  // that's fine, the button stays accurate and clickable either way.
  if (sessionStorage.getItem(STORAGE_KEY) === '1') {
    setState(true);
  } else {
    paintLabel(false);
  }
})();
