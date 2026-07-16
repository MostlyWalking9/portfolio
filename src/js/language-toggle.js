/* EN/DE toggle. Same URL, swapped content — per design doc §12 assumption.
   Elements provide both languages via data-en / data-de attributes;
   plain text nodes are swapped, so keep markup inside those attrs minimal. */

(function () {
  const STORAGE_KEY = 'portfolio-lang';
  const buttons = document.querySelectorAll('[data-lang-btn]');
  const translatable = document.querySelectorAll('[data-en]');

  function applyLang(lang) {
    translatable.forEach((el) => {
      const value = el.getAttribute(`data-${lang}`);
      if (value !== null) el.textContent = value;
    });
    buttons.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.langBtn === lang);
    });
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  const saved = localStorage.getItem(STORAGE_KEY) || 'en';
  applyLang(saved);

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => applyLang(btn.dataset.langBtn));
  });
})();
