/* Studio shell router — Home / About / Contact.
   These three pages are physically identical shells (same header, same
   audio element, same three <section data-view> panels) differing only
   in which panel starts active and the <title>. That's what makes this
   work: switching between them via this router never actually
   navigates, so the ambient <audio> element is never destroyed and
   keeps playing right through it.

   A direct hit on about.html or contact.html (bookmark, shared link,
   search engine) still works as a normal page load — it's a real,
   complete document, just one that happens to start on a different
   panel. Only from that point does audio survive further Home/About/
   Contact switches within the same tab; the very first load of any
   kind necessarily starts the track fresh, same as any page load
   would.

   Section and project pages are NOT part of this shell — they're
   genuinely different pages with their own theming, so navigating into
   or out of one is a real page load and the track restarts there. */

(function () {
  const STUDIO_PAGES = ['index.html', 'about.html', 'contact.html'];

  function pageNameFromHref(href) {
    try {
      const url = new URL(href, window.location.href);
      return url.pathname.split('/').pop() || 'index.html';
    } catch {
      return null;
    }
  }

  function showView(view) {
    document.querySelectorAll('[data-view]').forEach((el) => {
      el.classList.toggle('is-active-view', el.dataset.view === view);
    });
    document.querySelectorAll('.site-nav__links a[data-nav-link]').forEach((a) => {
      a.classList.toggle('is-active', a.dataset.navLink === view);
    });
    document.body.classList.toggle('is-home-view', view === 'home');
    document.dispatchEvent(new CustomEvent('content-injected'));
  }

  function viewForPage(page) {
    if (page === 'about.html') return 'about';
    if (page === 'contact.html') return 'contact';
    return 'home';
  }

  function titleForView(view) {
    if (view === 'about') return 'About — Sebastian Schistek';
    if (view === 'contact') return 'Contact — Sebastian Schistek';
    return 'Sebastian Schistek — Portfolio';
  }

  const SOUND_STORAGE_KEY = 'studio-sound-on';
  function soundIsOn() {
    return sessionStorage.getItem(SOUND_STORAGE_KEY) === '1';
  }
  function playNavSound() {
    if (!soundIsOn()) return;
    try {
      const sfx = new Audio(new URL('../assets/audio/portal-select.mp3', document.baseURI).href);
      sfx.volume = 0.45;
      sfx.play().catch(() => {});
    } catch {}
  }

  function navigate(page, push) {
    const view = viewForPage(page);
    showView(view);
    document.title = titleForView(view);
    if (push) window.history.pushState({ page }, '', page);
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const page = pageNameFromHref(link.getAttribute('href'));
    if (!page || !STUDIO_PAGES.includes(page)) return; // real navigation (section/project/mailto/etc.)
    e.preventDefault();
    playNavSound(); // real user action bringing up a new "page" — popstate (below) doesn't get this
    navigate(page, true);
  });

  window.addEventListener('popstate', (e) => {
    const page = (e.state && e.state.page) || 'index.html';
    navigate(page, false);
  });

  // Set the correct initial history state for whichever file was
  // actually loaded, so back/forward behaves sensibly from the start.
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  window.history.replaceState({ page: currentPage }, '', currentPage);
})();
