/* Ambient studio sound toggle. Off by default; the person has to click
   to turn it on. On Home/About/Contact this actually plays the looping
   studio track (assets/audio/studio-ambient.mp3). Section and project
   pages intentionally have NO background track — deliberately quieter,
   content-focused pages — but the same toggle still lives there as the
   master sound preference, gating the click-sound effects (portal-sfx,
   navigation-sfx) site-wide. Works with or without an <audio> element
   present; it just skips playback calls when there isn't one.
   Preference is remembered for the rest of the browser tab's session.

   Real bug fixed here: the button used to optimistically claim "on"
   the instant sessionStorage said so, before knowing whether
   audio.play() actually succeeded. Browsers block autoplay without a
   fresh user gesture, so restoring the preference on a new page load
   (e.g. navigating from a section page back to Home) would silently
   fail — but the button still showed "Sound: On", so the next click
   read the (wrong) "on" state and just paused an already-paused track,
   looking completely unresponsive. A second click was needed to
   actually resume. Fixed by making the real <audio> element the only
   source of truth: the button's label/pressed-state is driven by the
   audio's own play/pause events, never assumed. */

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

  function setPressed(on) {
    btn.setAttribute('aria-pressed', String(on));
    paintLabel(on);
  }

  function disableControl() {
    btn.disabled = true;
    setPressed(false);
    btn.setAttribute('aria-label', 'Ambient studio sound unavailable');
  }

  if (!audio) {
    // No track on this page (section/project) — the toggle still
    // exists purely to control click-sfx elsewhere. Reflect the stored
    // preference directly since there's no real playback to track.
    setPressed(sessionStorage.getItem(STORAGE_KEY) === '1');
    btn.addEventListener('click', () => {
      const next = btn.getAttribute('aria-pressed') !== 'true';
      sessionStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      setPressed(next);
    });
    return;
  }

  // Audio's own events are the only source of truth for what the
  // button shows — never an assumption about whether play() worked.
  audio.addEventListener('play', () => {
    setPressed(true);
    sessionStorage.setItem(STORAGE_KEY, '1');
  });
  audio.addEventListener('pause', () => {
    setPressed(false);
    sessionStorage.setItem(STORAGE_KEY, '0');
  });
  audio.addEventListener('error', disableControl, { once: true });
  audio.load();

  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    if (audio.paused) {
      audio.play().catch(() => { /* blocked — button correctly stays "off", one more click (a real gesture) will work */ });
    } else {
      audio.pause();
    }
  });

  // Attempt to restore this tab session's preference. If the browser
  // blocks it (no fresh gesture on this load), the audio simply stays
  // paused and the button correctly stays "off" — no lying, no stuck
  // state. The very next click is a real gesture and will work.
  if (sessionStorage.getItem(STORAGE_KEY) === '1') {
    audio.play().catch(() => {});
  } else {
    paintLabel(false);
  }
})();
