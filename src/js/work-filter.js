/* Loads src/data/projects.json and renders:
   - chapter grids on index.html   ([data-project-grid="domain"])
   - the full filterable grid on work.html ([data-work-grid] + [data-filter])
   - a single project on project.html ([data-project-detail], via ?slug=)
   Single source of truth: projects.json. No HTML edits needed per project. */

(function () {
  const DATA_URL = '../src/data/projects.json';

  function cardMarkup(project) {
    const img = project.thumb || project.hero || '';
    return `
      <a class="project-card" href="project.html?slug=${encodeURIComponent(project.slug)}" data-reveal>
        <img src="${img}" alt="${project.title}" loading="lazy">
        <div class="project-card__label">
          <h3>${project.title}</h3>
          <span>${project.role || ''}</span>
        </div>
      </a>`;
  }

  function renderChapterGrids(projects) {
    document.querySelectorAll('[data-project-grid]').forEach((grid) => {
      const domain = grid.dataset.projectGrid;
      const items = projects.filter((p) => p.domain === domain).slice(0, 5);
      grid.innerHTML = items.length
        ? items.map(cardMarkup).join('')
        : `<p class="empty-state">No ${domain} projects yet — add entries to projects.json.</p>`;
    });
  }

  function renderWorkGrid(projects) {
    const grid = document.querySelector('[data-work-grid]');
    if (!grid) return;

    const params = new URLSearchParams(window.location.search);
    let activeFilter = params.get('filter') || 'all';

    const filterBtns = document.querySelectorAll('[data-filter]');

    function paint() {
      const items = activeFilter === 'all'
        ? projects
        : projects.filter((p) => p.domain === activeFilter);

      grid.innerHTML = items.length
        ? items.map(cardMarkup).join('')
        : `<p class="empty-state">No projects match this filter yet.</p>`;

      filterBtns.forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.filter === activeFilter);
      });
    }

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.filter;
        const url = new URL(window.location);
        if (activeFilter === 'all') url.searchParams.delete('filter');
        else url.searchParams.set('filter', activeFilter);
        window.history.replaceState({}, '', url);
        paint();
      });
    });

    paint();
  }

  function renderProjectDetail(projects) {
    const root = document.querySelector('[data-project-detail]');
    if (!root) return;

    const slug = new URLSearchParams(window.location.search).get('slug');
    const project = projects.find((p) => p.slug === slug);

    if (!project) {
      root.innerHTML = `<div class="container"><p class="empty-state">Project not found. <a href="work.html">Back to work index →</a></p></div>`;
      return;
    }

    document.title = `${project.title} — Art deBeaufort`;
    document.body.dataset.activeChapter = project.domain;

    const gallery = (project.gallery || []).map(
      (src) => `<img src="${src}" alt="${project.title} — detail" loading="lazy" data-reveal>`
    ).join('');

    root.innerHTML = `
      <section class="project-detail__hero container">
        <a class="project-detail__back" href="work.html">← Back to work</a>
        <span class="eyebrow" data-chapter-label>${project.domain}</span>
        <h1>${project.title}</h1>
        <dl class="project-detail__meta">
          <div><dt>Role</dt><dd>${project.role || '—'}</dd></div>
          <div><dt>Tools</dt><dd>${(project.tools || []).join(', ') || '—'}</dd></div>
          <div><dt>Outcome</dt><dd>${project.outcome || '—'}</dd></div>
        </dl>
        ${project.process ? `<p style="margin-top:var(--space-4); max-width:65ch; color:var(--color-text-muted);">${project.process}</p>` : ''}
        ${project.liveUrl ? `<a class="btn" href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" style="margin-top: var(--space-4);">Visit live site ↗</a>` : ''}
      </section>
      <div class="project-detail__gallery container" data-chapter="${project.domain}">
        ${project.hero ? `<img src="${project.hero}" alt="${project.title}" data-reveal>` : ''}
        ${gallery}
      </div>`;

    // Re-run reveal observation for freshly injected nodes
    document.dispatchEvent(new CustomEvent('content-injected'));
  }

  fetch(DATA_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`projects.json ${res.status}`);
      return res.json();
    })
    .then((projects) => {
      renderChapterGrids(projects);
      renderWorkGrid(projects);
      renderProjectDetail(projects);
    })
    .catch((err) => {
      console.error('Could not load projects.json:', err);
      document.querySelectorAll('[data-project-grid], [data-work-grid]').forEach((el) => {
        el.innerHTML = `<p class="empty-state">Couldn't load project data.</p>`;
      });
    });
})();
