/* Central data layer: fetches site-config.json, categories.json, and
   projects.json once, then renders whichever page we're on.
   - index.html      -> renders the 3 portal cards from site-config
   - section.html    -> intro text, tag filter, category grid, project grid
   - project.html    -> project detail, tags, similar projects (same
                         section) and similar projects in other sections
   Single source of truth for all three; edited via the admin tool. */

(function () {
  const BASE = '../src/data/';

  function isVideo(src) {
    return /\.(mp4|webm|mov)$/i.test(src || '');
  }

  function mediaMarkup(src, alt, attrs) {
    if (!src) return '';
    return isVideo(src)
      ? `<video src="${src}" ${attrs || ''} muted loop playsinline autoplay></video>`
      : `<img src="${src}" alt="${alt}" ${attrs || ''} loading="lazy">`;
  }

  // Used only for project-detail hero/gallery media, where oversized
  // (e.g. tall vertical video) source files need a height cap and an
  // admin-controlled display width, unlike card/cover fills which always
  // need to cover their container fully.
  const SCALE_WIDTH = { small: '38%', medium: '60%', large: '85%', full: '100%' };

  function detailMediaMarkup(src, alt, scale) {
    if (!src) return '';
    const width = SCALE_WIDTH[scale] || SCALE_WIDTH.full;
    const style = `style="width:${width}; height:auto; margin-inline:auto; max-height:85vh; object-fit:contain;"`;
    return isVideo(src)
      ? `<video src="${src}" ${style} muted loop playsinline autoplay></video>`
      : `<img src="${src}" alt="${alt}" ${style} loading="lazy">`;
  }

  function currentLang() {
    return document.documentElement.getAttribute('lang') || 'en';
  }

  function pick(field) {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[currentLang()] || field.en || '';
  }

  function tagLabel(tag) {
    return (tag || '').replace(/_/g, ' ');
  }

  function applyConfigText(config) {
    document.querySelectorAll('[data-config]').forEach((el) => {
      const path = el.dataset.config.split('.');
      let val = config;
      for (const key of path) val = val ? val[key] : undefined;
      if (val == null) return;
      if (typeof val === 'string') {
        el.textContent = val;
      } else {
        el.setAttribute('data-en', val.en || '');
        el.setAttribute('data-de', val.de || '');
        el.textContent = val[currentLang()] || val.en || '';
      }
    });
  }

  async function fetchAll() {
    const [config, categories, projects] = await Promise.all([
      fetch(BASE + 'site-config.json').then((r) => r.json()),
      fetch(BASE + 'categories.json').then((r) => r.json()),
      fetch(BASE + 'projects.json').then((r) => r.json()),
    ]);
    return { config, categories, projects };
  }

  // ---------------------------------------------------------------------
  // Homepage: 3 portal cards
  // ---------------------------------------------------------------------
  function renderHomepage({ config }) {
    const grid = document.querySelector('[data-portal-grid]');
    if (!grid) return;

    grid.innerHTML = config.sections.map((s, i) => `
      <a class="principle-card principle-card--${s.id}" href="section.html?section=${s.id}">
        <span class="principle-card__media">
          ${mediaMarkup(s.cover, pick(s.title), 'class="principle-card__media-img is-shown"')}
        </span>
        <span class="principle-card__scrim" aria-hidden="true"></span>
        <span class="principle-card__body">
          <span class="principle-card__eyebrow" style="${s.bodyFont ? `font-family:${s.bodyFont};` : ''}">
            <span class="principle-card__number">0${i + 1}</span>
            <span>${pick(s.subtitle)}</span>
          </span>
          <h2 class="principle-card__title" style="${s.headingFont ? `font-family:${s.headingFont};` : ''}">${pick(s.title)}</h2>
          <p class="principle-card__desc" style="${s.bodyFont ? `font-family:${s.bodyFont};` : ''}">${pick(s.introText)}</p>
          <span class="principle-card__explore" data-en="Explore →" data-de="Entdecken →">Explore →</span>
        </span>
      </a>`).join('');

    document.dispatchEvent(new CustomEvent('content-injected'));
  }

  // ---------------------------------------------------------------------
  // Section page: intro, tag filter, category grid, project grid
  // ---------------------------------------------------------------------
  function renderSectionPage({ config, categories, projects }) {
    const root = document.querySelector('[data-section-page]');
    if (!root) return;

    const sectionId = new URLSearchParams(window.location.search).get('section');
    const section = config.sections.find((s) => s.id === sectionId);

    if (!section) {
      root.innerHTML = `<div class="container"><p class="empty-state">Section not found. <a href="index.html">Back home →</a></p></div>`;
      return;
    }

    document.title = `${pick(section.title)} — Sebastian Schistek`;
    document.body.dataset.activeChapter = sectionId;
    if (section.headingFont) document.body.style.setProperty('--font-display', section.headingFont);
    if (section.bodyFont) {
      document.body.style.setProperty('--font-body', section.bodyFont);
      document.body.style.setProperty('--font-label', section.bodyFont);
    }

    const sectionCategories = categories
      .filter((c) => c.section === sectionId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const sectionProjects = projects.filter((p) => p.domain === sectionId);

    // Only categories that actually have at least one project are shown.
    const nonEmptyCategories = sectionCategories.filter(
      (c) => sectionProjects.some((p) => p.category === c.id)
    );

    const allTags = Array.from(new Set(sectionProjects.flatMap((p) => p.tags || []))).sort();

    root.innerHTML = `
      <section class="work-header container">
        <span class="eyebrow">${pick(section.subtitle)}</span>
        <h1>${pick(section.title)}</h1>
        <p class="chapter__intro" style="margin-top: var(--space-3); max-width: 65ch;">${pick(section.introText)}</p>
        ${allTags.length ? `
          <div class="work-filters" data-tag-filters role="group" aria-label="Filter by tag">
            <button data-tag="all" class="is-active">All</button>
            ${allTags.map((t) => `<button data-tag="${t}">#${tagLabel(t)}</button>`).join('')}
          </div>` : ''}
      </section>

      <section class="container" data-category-grid-wrap ${nonEmptyCategories.length ? '' : 'hidden'}>
        <div class="category-grid" data-category-grid>
          ${nonEmptyCategories.map((c) => `
            <button class="category-card" data-category-btn="${c.id}">
              ${mediaMarkup(c.cover, c.title, 'class="category-card__img"')}
              <span class="category-card__label">${c.title}</span>
            </button>`).join('')}
          <button class="category-card category-card--all is-active" data-category-btn="all">
            <span class="category-card__label">All ${pick(section.title)}</span>
          </button>
        </div>
      </section>

      <section class="container">
        <div class="work-grid" data-work-grid></div>
      </section>
    `;

    const filterBtns = root.querySelectorAll('[data-tag-filters] button');
    const categoryBtns = root.querySelectorAll('[data-category-btn]');
    let activeTag = 'all';
    let activeCategory = 'all';

    function cardMarkup(p) {
      const src = p.thumb || p.hero || '';
      return `
        <a class="project-card" href="project.html?slug=${encodeURIComponent(p.slug)}" data-reveal>
          ${mediaMarkup(src, p.title)}
          <div class="project-card__label">
            <h3>${p.title}</h3>
            <span>${p.role || ''}</span>
          </div>
        </a>`;
    }

    function paint() {
      let items = sectionProjects;
      if (activeCategory !== 'all') items = items.filter((p) => p.category === activeCategory);
      if (activeTag !== 'all') items = items.filter((p) => (p.tags || []).includes(activeTag));

      const grid = root.querySelector('[data-work-grid]');
      grid.innerHTML = items.length
        ? items.map(cardMarkup).join('')
        : `<p class="empty-state">No projects match this filter yet.</p>`;

      filterBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.tag === activeTag));
      categoryBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.categoryBtn === activeCategory));

      document.dispatchEvent(new CustomEvent('content-injected'));
    }

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => { activeTag = btn.dataset.tag; paint(); });
    });
    categoryBtns.forEach((btn) => {
      btn.addEventListener('click', () => { activeCategory = btn.dataset.categoryBtn; paint(); });
    });

    paint();
  }

  // ---------------------------------------------------------------------
  // Project detail page: tags, similar projects, cross-section similar
  // ---------------------------------------------------------------------
  function renderProjectDetail({ config, categories, projects }) {
    const root = document.querySelector('[data-project-detail]');
    if (!root) return;

    const slug = new URLSearchParams(window.location.search).get('slug');
    const project = projects.find((p) => p.slug === slug);

    if (!project) {
      root.innerHTML = `<div class="container"><p class="empty-state">Project not found. <a href="index.html">Back home →</a></p></div>`;
      return;
    }

    document.title = `${project.title} — Sebastian Schistek`;
    document.body.dataset.activeChapter = project.domain;

    const gallery = (project.gallery || []).map((item) => `
      <figure class="project-detail__gallery-item" data-reveal>
        ${detailMediaMarkup(item.src, `${project.title} — detail`, item.scale)}
        ${item.caption ? `<figcaption>${item.caption}</figcaption>` : ''}
      </figure>`).join('');

    const tasksList = (project.tasks && project.tasks.length)
      ? `<ul class="project-detail__tasks">${project.tasks.map((t) => `<li>${t}</li>`).join('')}</ul>`
      : '';

    const tagsRow = (project.tags && project.tags.length)
      ? `<div class="project-detail__tags">${project.tags.map((t) => `<span class="tag-chip">#${tagLabel(t)}</span>`).join('')}</div>`
      : '';

    // Similar projects: same section, overlapping tag, excluding self.
    const sameSection = projects.filter((p) => p.slug !== project.slug && p.domain === project.domain);
    const similarSameSection = sameSection.filter((p) => (p.tags || []).some((t) => (project.tags || []).includes(t)));

    // Similar projects in other sections: grouped by section, overlapping tag.
    const otherSections = config.sections.filter((s) => s.id !== project.domain);
    const crossSectionGroups = otherSections.map((s) => {
      const matches = projects.filter((p) =>
        p.domain === s.id && (p.tags || []).some((t) => (project.tags || []).includes(t))
      );
      return { section: s, matches };
    }).filter((g) => g.matches.length > 0);

    function miniCard(p) {
      const src = p.thumb || p.hero || '';
      return `
        <a class="project-card project-card--mini" href="project.html?slug=${encodeURIComponent(p.slug)}">
          ${mediaMarkup(src, p.title)}
          <div class="project-card__label"><h3>${p.title}</h3></div>
        </a>`;
    }

    const similarBlock = similarSameSection.length ? `
      <section class="section-block container">
        <span class="eyebrow">Similar Projects</span>
        <div class="project-grid" style="margin-top: var(--space-4);">${similarSameSection.map(miniCard).join('')}</div>
      </section>` : '';

    const crossBlock = crossSectionGroups.length ? `
      <section class="section-block container">
        <span class="eyebrow">Similar Projects in Other Sections</span>
        ${crossSectionGroups.map((g) => `
          <h3 style="margin-top: var(--space-4);">${pick(g.section.title)}</h3>
          <div class="project-grid" style="margin-top: var(--space-3);">${g.matches.map(miniCard).join('')}</div>
        `).join('')}
      </section>` : '';

    root.innerHTML = `
      <section class="project-detail__hero container">
        <a class="project-detail__back" href="section.html?section=${project.domain}">← Back to ${project.domain}</a>
        <span class="eyebrow" data-chapter-label>${project.domain}</span>
        <h1>${project.title}</h1>
        <dl class="project-detail__meta">
          <div><dt>Role</dt><dd>${project.role || '—'}</dd></div>
          <div><dt>Tools</dt><dd>${(project.tools || []).join(', ') || '—'}</dd></div>
          <div><dt>Outcome</dt><dd>${project.outcome || '—'}</dd></div>
        </dl>
        ${tagsRow}
        ${project.process ? `<p style="margin-top:var(--space-4); max-width:65ch; color:var(--color-text-muted);">${project.process}</p>` : ''}
        ${tasksList}
        ${project.liveUrl ? `<a class="btn" href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" style="margin-top: var(--space-4);">Visit live site ↗</a>` : ''}
      </section>
      <div class="project-detail__gallery container" data-chapter="${project.domain}">
        <figure class="project-detail__gallery-item" data-reveal>${detailMediaMarkup(project.hero, project.title, project.heroScale)}</figure>
        ${gallery}
      </div>
      ${similarBlock}
      ${crossBlock}
    `;

    document.dispatchEvent(new CustomEvent('content-injected'));
  }

  fetchAll()
    .then((data) => {
      applyConfigText(data.config);
      renderHomepage(data);
      renderSectionPage(data);
      renderProjectDetail(data);
    })
    .catch((err) => {
      console.error('Could not load site data:', err);
    });
})();
