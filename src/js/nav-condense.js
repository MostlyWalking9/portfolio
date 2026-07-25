/* Nav condense-on-scroll — section pages only. Once the discipline
   switcher row scrolls out of view: the name contracts from the right
   down to just its first letter (still plain text, in place), then —
   once that finishes — swaps to a small separate logo mark (just the
   letter, with a quick circle drawn around it from the top) while
   compact discipline buttons slide in to take the name's place.
   Reverses the moment the switcher scrolls back into view. */

(function () {
  const CONTRACT_MS = 380; // must match the --mark-rest max-width transition duration in CSS

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
    let swapTimer = null;

    function condense() {
      clearTimeout(swapTimer);
      nav.classList.add('is-condensed'); // starts the text contraction
      swapTimer = setTimeout(() => {
        logoEl.classList.add('is-visible');
        // Force a reflow before adding the drawing class, so the circle
        // animation reliably restarts from the beginning every time.
        void logoEl.offsetWidth;
        logoEl.classList.add('is-drawing');
      }, CONTRACT_MS);
    }

    function uncondense() {
      clearTimeout(swapTimer);
      logoEl.classList.remove('is-visible', 'is-drawing');
      nav.classList.remove('is-condensed'); // text expands back
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
