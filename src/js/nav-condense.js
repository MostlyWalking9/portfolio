/* Nav condense-on-scroll — section pages only. Once the discipline
   switcher row scrolls out of view, the nav name contracts down to
   just its first letter (circled, like a logo mark) and compact
   discipline buttons slide in between it and MENU/Sound — giving quick
   access to switch discipline without scrolling back up. Reverses the
   moment the switcher scrolls back into view. */

(function () {
  function init() {
    const nav = document.querySelector('.site-nav');
    const markName = document.querySelector('.site-nav__mark-name');
    const switcher = document.querySelector('.discipline-switch');
    if (!nav || !markName || !switcher || !('IntersectionObserver' in window)) return;

    function splitMarkName() {
      if (markName.querySelector('.site-nav__mark-initial')) return; // already split, avoid re-wrapping on re-render
      const text = markName.textContent.trim();
      if (!text) return;
      const first = text.charAt(0);
      const rest = text.slice(1);
      markName.innerHTML = '';
      const initialEl = document.createElement('span');
      initialEl.className = 'site-nav__mark-initial';
      initialEl.textContent = first;
      const restEl = document.createElement('span');
      restEl.className = 'site-nav__mark-rest';
      restEl.textContent = rest;
      markName.appendChild(initialEl);
      markName.appendChild(restEl);
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
      const wrap = document.createElement('div');
      wrap.className = 'site-nav__foldout-switch';
      switcher.querySelectorAll('.discipline-switch__btn').forEach((btn) => {
        wrap.appendChild(btn.cloneNode(true));
      });
      links.appendChild(wrap);
    }

    splitMarkName();
    buildMiniSwitcher();
    buildFoldoutSwitcher();

    if (switcher.dataset.condenseBound) return;
    switcher.dataset.condenseBound = '1';

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        nav.classList.toggle('is-condensed', !entry.isIntersecting);
      });
    }, { threshold: 0 });

    observer.observe(switcher);
  }

  init();
  document.addEventListener('content-injected', init);
})();
