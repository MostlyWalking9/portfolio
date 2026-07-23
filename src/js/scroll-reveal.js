/* Scroll-triggered reveals + chapter accent tracking + nav opacity.
   No animation library — IntersectionObserver only, per design doc §7. */

(function () {
  const nav = document.querySelector('.site-nav');

  // Reveal-on-scroll — re-runnable, so content injected later (e.g. by
  // work-filter.js after its fetch resolves) still gets observed.
  const revealObserver = ('IntersectionObserver' in window)
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' })
    : null;

  function observeReveals() {
    const revealEls = document.querySelectorAll('[data-reveal]:not(.is-visible), [data-reveal-group]:not(.is-visible)');
    if (revealObserver) {
      revealEls.forEach((el) => revealObserver.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }
  }

  observeReveals();
  document.addEventListener('content-injected', observeReveals);

  // Nav background toggle after scrolling past hero
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Mobile menu toggle
  const menuToggle = document.querySelector('.site-nav__toggle');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-menu-open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });
  }
})();
