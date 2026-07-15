# Art deBeaufort — Portfolio

Concept A (Editorial Cinematic Scroll) — selected build. See `/docs/design-document.md`.

## Where to put your work

Two locations, different purpose:

### 1. `/work-source/{creative,design,technical}/`
Raw, unprocessed source files — original resolution images, video exports, PSDs/source project files if you want them versioned. Not served to the site directly. One subfolder per project, named with a slug:

```
work-source/creative/forest-scene-concept/
  final-render.png
  process-01.png
  process-02.png
  notes.md
```

### 2. `/assets/images/{creative,design,technical}/` and `/assets/videos/{creative,design,technical}/`
Web-ready, optimized files actually used on the site (compressed, correct dimensions, `.webp` preferred for images). Same slug-per-project convention:

```
assets/images/creative/forest-scene-concept/
  hero.webp
  thumb.webp
  detail-01.webp
```

Workflow: drop raw work into `work-source/`, then export optimized versions into `assets/` under the matching domain + slug. Once assets exist, register the project in `src/data/projects.json` (schema below) — the site reads from there, no HTML editing needed per project.

## `projects.json` schema

```json
{
  "slug": "forest-scene-concept",
  "domain": "creative",
  "title": "Forest Scene — Environment Concept",
  "role": "Concept Artist",
  "tools": ["Photoshop", "Blender"],
  "process": "Short note on approach/pipeline.",
  "outcome": "Short note on result/use.",
  "thumb": "assets/images/creative/forest-scene-concept/thumb.webp",
  "hero": "assets/images/creative/forest-scene-concept/hero.webp",
  "gallery": ["assets/images/creative/forest-scene-concept/detail-01.webp"]
}
```

`domain` must be one of `creative`, `design`, `technical` — drives accent color and chapter placement automatically.

## Repo layout

```
/assets            web-ready, optimized files served by the site
/src/css            variables, base, layout, components, animations, responsive
/src/js              scroll-reveal, language-toggle, work-filter, form
/src/data/projects.json   single source of truth for all project cards
/pages               index.html, work.html, about.html, contact.html
/work-source          raw/unprocessed originals, not deployed
/docs                 design doc, style guide, layout guide, asset guide
```

## Status

- [ ] CV uploaded (About section is placeholder until then)
- [ ] Logo/wordmark file (placeholder monogram in use)
- [ ] Accent colors confirmed (`#C9553D` / `#3D8FC9` / `#7CC93D` — see `docs/design-document.md`)
- [ ] Bilingual approach confirmed (assumed: toggle, same URL)
- [ ] First project assets uploaded
