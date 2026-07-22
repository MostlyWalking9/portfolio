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

## Editing projects without touching code

The editor tool lives in a **separate, private repo** — `MostlyWalking9/portfolio-admin-tool` — deliberately kept out of this repo so it's never part of the deployed site (GitHub Pages serves everything in this repo; keeping the editor elsewhere means there's nothing to accidentally expose at a guessable URL).

To use it: clone `portfolio-admin-tool` locally, open its `editor.html` in **Chrome or Edge**, then:

- **Connect to project folder** → pick this repo's root (`portfolio-scaffold`) on disk
- Add a project: fill the form, attach thumb/hero/gallery media (images or video), write a tasks bullet list — files are copied into `assets/images/<domain>/<slug>/` automatically
- **Edit details** on an existing project: update title, role, tools, process, outcome, tasks, or live URL
- **Edit media** on an existing project: add more gallery items, or remove individual ones (deletes the file too)
- Remove a project: pulls it out of the list; media files are left on disk (delete the folder manually in `assets/images/` if you want those gone)
- **Save projects.json** writes changes back to `src/data/projects.json` — nothing is final until you hit this

It's a local tool, not a hosted CMS — it edits files on your machine. Commit and push from *this* repo afterward like any other change. Safari/Firefox don't support the underlying API; edit `projects.json` by hand there instead.

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
  "liveUrl": "",
  "thumb": "assets/images/creative/forest-scene-concept/thumb.webp",
  "hero": "assets/images/creative/forest-scene-concept/hero.webp",
  "gallery": ["assets/images/creative/forest-scene-concept/detail-01.webp"]
}
```

`liveUrl` is optional — when set, the project detail page shows a "Visit live site ↗" button. Use this for shipped websites/apps instead of trying to embed them: a live iframe embed is fragile (most production sites block framing via `X-Frame-Options`/CSP) and awkward for multi-page sites, so screenshots + a direct link to the real thing is the more reliable pattern. Leave it empty (`""`) for work that isn't live yet or isn't web-based.

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

- [x] CV uploaded — About section rewritten (bio, skills, languages). No home address/phone put on site.
- [ ] Logo/wordmark file (placeholder monogram in use)
- [ ] Accent colors confirmed (`#C9553D` / `#3D8FC9` / `#7CC93D` — see `docs/design-document.md`)
- [ ] Bilingual approach confirmed (assumed: toggle, same URL)
- [ ] First project assets uploaded
