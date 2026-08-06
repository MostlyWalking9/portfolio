/* Nav condense-on-scroll — section pages only. Once the discipline
   switcher row scrolls out of view: the name contracts from the right
   down to just its first letter (still plain text, in place), then —
   once that finishes — swaps to a small separate logo mark (just the
   letter, with a quick circle drawn around it from the top) while
   compact discipline buttons slide in to take the name's place.
   Reverses the moment the switcher scrolls back into view. */

(function () {
  const CONTRACT_MS = 456; // must match the --mark-rest max-width transition duration in CSS

  function init() {
    const nav = document.querySelector('.site-nav');
    const markName = document.querySelector('.site-nav__mark-name');
    const switcher = document.querySelector('.discipline-switch');
    if (!nav || !markName || !switcher || !('IntersectionObserver' in window)) return;

    function buildMarkParts() {
      if (markName.querySelector('.site-nav__mark-logo')) return; // already built
      const text = markName.textContent.trim();
      if (!text) return;
      const first = text.charAt(0);
      const rest = text.slice(1);
      markName.innerHTML = `
        <span class="site-nav__mark-text">
          <span class="site-nav__mark-initial">${first}</span><span class="site-nav__mark-rest">${rest}</span>
        </span>
        <span class="site-nav__mark-logo" aria-hidden="true">
          <svg class="site-nav__mark-logo-ring" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18"></circle>
          </svg>
          <span class="site-nav__mark-logo-letter">${first}</span>
        </span>`;
    }

    function buildMiniSwitcher() {
      if (nav.querySelector('.site-nav__mini-switch')) return;
      const mini = document.createElement('div');
      mini.className = 'site-nav__mini-switch';
      switcher.querySelectorAll('.discipline-switch__btn').forEach((btn) => {
        const clone = btn.cloneNode(true);
        clone.classList.add('site-nav__mini-btn');
        mini.appendChild(clone);
      });
      const controls = nav.querySelector('.site-nav__controls');
      if (controls) nav.insertBefore(mini, controls);
      else nav.appendChild(mini);
    }

    function buildFoldoutSwitcher() {
      const links = document.querySelector('.site-nav__links');
      if (!links || links.querySelector('.site-nav__foldout-switch')) return;
      const divider = document.createElement('hr');
      divider.className = 'site-nav__foldout-divider';
      const wrap = document.createElement('div');
      wrap.className = 'site-nav__foldout-switch';
      switcher.querySelectorAll('.discipline-switch__btn').forEach((btn) => {
        wrap.appendChild(btn.cloneNode(true));
      });
      links.appendChild(divider);
      links.appendChild(wrap);
    }

    buildMarkParts();
    buildMiniSwitcher();
    buildFoldoutSwitcher();

    if (switcher.dataset.condenseBound) return;
    switcher.dataset.condenseBound = '1';

    const logoEl = markName.querySelector('.site-nav__mark-logo');
    const textEl = markName.querySelector('.site-nav__mark-text');
    const initialEl = markName.querySelector('.site-nav__mark-initial');
    const logoLetterEl = markName.querySelector('.site-nav__mark-logo-letter');
    let swapTimer = null;

    // Measure exactly how far off the two S's are from each other, so
    // the contraction can shift the text by that precise amount — by
    // the time it finishes, the remaining S sits exactly where the
    // logo's S will appear, and the swap becomes imperceptible instead
    // of an obvious jump. Measured once (fonts/metrics don't change),
    // with the logo briefly shown off-screen (not visible, not
    // affecting layout) purely to read its real rendered position.
    function measureShift() {
      const prevCss = logoEl.style.cssText;
      logoEl.style.cssText = 'display:inline-flex; position:absolute; visibility:hidden; left:-9999px; top:0;';
      const logoLetterRect = logoLetterEl.getBoundingClientRect();
      const logoRect = logoEl.getBoundingClientRect();
      logoEl.style.cssText = prevCss;

      const initialRect = initialEl.getBoundingClientRect();
      const markRect = markName.getBoundingClientRect();

      // Both text and logo are anchored to markName's own left edge
      // (position:absolute, left:0) — so compare each S's center
      // relative to that same shared origin.
      const initialCenterFromOrigin = (initialRect.left - markRect.left) + initialRect.width / 2;
      const logoLetterCenterFromOrigin = (logoLetterRect.left - logoRect.left) + logoLetterRect.width / 2;
      return logoLetterCenterFromOrigin - initialCenterFromOrigin;
    }

    function applyMeasuredShift() {
      const shiftX = measureShift();
      textEl.style.setProperty('--mark-shift-x', `${shiftX}px`);
    }

    // Measure once immediately (better than nothing if fonts are already
    // cached/loaded), then re-measure once the real web font is
    // confirmed loaded — measuring too early means measuring against
    // the fallback font's metrics, which don't match the real font's
    // glyph width/position once it swaps in, and that mismatch is
    // exactly the kind of small persistent misalignment being reported.
    applyMeasuredShift();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(applyMeasuredShift);
    }

    const toggleIcon = document.querySelector('.site-nav__toggle-icon');
    const soundToggle = document.querySelector('.sound-toggle');
    const soundHomeSlot = document.querySelector('.site-nav__controls'); // where sound normally lives, so it can move back

    function condense() {
      clearTimeout(swapTimer);
      nav.classList.add('is-condensed'); // starts the visible text contraction + shift (name AND MENU)
      swapTimer = setTimeout(() => {
        textEl.style.display = 'none';
        logoEl.classList.add('is-visible');
        // Force a reflow before adding the drawing class, so the circle
        // animation reliably restarts from the beginning every time.
        void logoEl.offsetWidth;
        logoEl.classList.add('is-drawing');
        // Only now does the mini-switcher start sliding in — its space
        // (the logo's width) is already stable at this point, so the
        // buttons don't shift position after they've started appearing.
        nav.classList.add('is-switcher-visible');
        if (toggleIcon) toggleIcon.classList.add('is-visible');
        // Desktop-condensed: Sound moves into the fold-out menu (CSS
        // hides it from its normal spot at this state) — reparented
        // rather than cloned so it keeps its real, live click handler
        // and on/off state instead of becoming a dead duplicate.
        const links = document.querySelector('.site-nav__links');
        if (soundToggle && links && window.innerWidth >= 769) {
          links.insertBefore(soundToggle, links.firstChild);
        }
      }, CONTRACT_MS);
    }

    function uncondense() {
      clearTimeout(swapTimer);
      logoEl.classList.remove('is-visible', 'is-drawing');
      textEl.style.display = '';
      if (toggleIcon) toggleIcon.classList.remove('is-visible');
      nav.classList.remove('is-condensed', 'is-switcher-visible');
      // Move sound back to its normal spot in the controls group.
      if (soundToggle && soundHomeSlot && soundToggle.parentElement !== soundHomeSlot) {
        soundHomeSlot.appendChild(soundToggle);
      }
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) uncondense();
        else condense();
      });
    }, { threshold: 0 });

    observer.observe(switcher);
  }

  init();
  document.addEventListener('content-injected', init);
})();
