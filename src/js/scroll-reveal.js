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

  // Chapter accent: swap --accent-current on <body> as each chapter dominates viewport
  function observeChapters() {
    const chapters = document.querySelectorAll('[data-chapter]');
    if (!('IntersectionObserver' in window) || !chapters.length) return;

    const chapterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          document.body.dataset.activeChapter = entry.target.dataset.chapter;
        } else if (document.body.dataset.activeChapter === entry.target.dataset.chapter) {
          // Chapter scrolled out with nothing else taking its place yet —
          // fall back to the studio hub default rather than staying stuck
          // on the last chapter's identity (matters for nav + focus rings).
          delete document.body.dataset.activeChapter;
        }
      });
    }, { threshold: 0.5 });

    chapters.forEach((el) => chapterObserver.observe(el));
  }

  observeChapters();
  document.addEventListener('content-injected', observeChapters);

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
