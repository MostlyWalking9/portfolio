# Design Document — Concept A: Editorial Cinematic Scroll
### Art deBeaufort — Portfolio
**Status: SELECTED — building this version first**

---

## 1. Project Overview

**Name:** Art deBeaufort — Portfolio
**Category:** Personal portfolio / multi-domain creative brand site
**Core offer:** A single, cinematic, story-led scroll experience that introduces one person working across three distinct professional domains, without those domains feeling like three unrelated resumes bolted together.
**Main CTA:** View work
**Launch goal:** Convert visiting employers, clients, and collaborators into people who explore full project detail and make contact — while making the *breadth* of skill read as a coherent creative identity, not a scattered one.

**The core design problem this document solves:** three domains, one narrative thread.
1. **Creative/Artistic** — concept art, character/environment art, illustration, game/film storytelling
2. **Design/Production** — graphic design, branding, motion design, UI/UX, product design, video/photo editing, AI-assisted content workflows
3. **Technical/IT** — coding, software & web development, AI systems, automation pipelines

Concept A resolves this with one continuous editorial scroll (reference: orkenworld.com), where each domain is a distinct "chapter" with its own accent color, type treatment, and motion signature — rather than three separate sites or portal-worlds (that's Concepts B and C, documented separately).

---

## 2. Brand Positioning

**Audience:** Potential employers (studios, agencies, tech companies), direct clients (branding/design/dev commissions), and collaborators (game/film projects). Assume a mixed audience of visually literate and non-visual (HR/procurement) visitors — the site needs to work for both a creative director scrolling for five minutes and a recruiter skimming for thirty seconds.

**Audience needs:** Fast orientation ("what does this person actually do"), credible proof of range without diluted quality, and an easy path to the specific domain they care about.

**Brand personality:** Editorial, cinematic, confident, precise. Not playful, not corporate.

**Tone of voice:** Editorial — written like a magazine feature about the work, not a resume bullet list.

**Trust signals:** Process transparency (show pipeline/workflow, not just final renders), real project outcomes, a CV-backed About section.

**Differentiation:** Most multi-discipline portfolios either flatten everything into one bland grid, or split into disconnected micro-sites that feel like separate people. The differentiator here is narrative continuity — one voice, three instruments.

---

## 3. Visual Direction

**Overall style:** Cinematic editorial — think a long-form magazine feature crossed with a film title sequence.

**Assumption (flagged, no reference given):** Base palette should be a dark, near-black editorial background (not pure black — something like `#0E0D0C`) with warm off-white text, since this reads as premium/cinematic and lets each domain's accent color pop without competing with a busy light background. Reasoning: reduces production burden of needing 3 fully separate light/dark treatments, and matches the orkenworld-style reference aesthetic.

**Proposed color system:**

| Role | Hex | Usage |
|---|---|---|
| Background base | `#0E0D0C` | Global background |
| Surface | `#171615` | Cards, panels |
| Text primary | `#F2EFE9` | Headings, body |
| Text muted | `#9A968C` | Secondary text, captions |
| Border | `#2B2925` | Dividers, card outlines |
| **Creative accent** | `#C9553D` (warm ember) | Domain 1 — creative/artistic chapter |
| **Design accent** | `#3D8FC9` (cool cyan-blue) | Domain 2 — design/production chapter |
| **Technical accent** | `#7CC93D` (signal green) | Domain 3 — technical/IT chapter, terminal/system feel |
| Success | `#4CAF6D` | Form success states |
| Error | `#D9534F` | Form error states |

Each accent is used sparingly — headlines, active nav state, hover glows, section dividers — never as a full background flood, to keep the editorial base consistent while still clearly separating the three chapters.

**Typography (recommendation, none specified):**
- **Headings:** A high-contrast serif or modern display serif (e.g. "Fraunces" or "Canela"-style) for editorial gravity.
- **Body/UI:** A clean grotesque sans (e.g. "Inter" or "General Sans") for legibility at small sizes and in bilingual (EN/DE) text, which tends to run longer in German.
- **Reasoning:** serif-for-headline / sans-for-body is the standard editorial pairing and reinforces the "magazine feature" tone without feeling decorative.

**Image direction:** Full-bleed, high-resolution work images with a consistent crop/grade per domain chapter (see Style Guide for details). Until real assets are supplied, use clearly labeled placeholder blocks — never fake photography.

**Logo:** No logo file provided — create a simple wordmark-based placeholder ("AdB" monogram or full wordmark in the heading serif) until a real mark exists.

**Motion direction:** Scroll-triggered reveals, subtle parallax, chapter-to-chapter transitions that shift accent color and type weight. Motion should feel deliberate and slow — editorial pacing, not flashy.

---

## 4. Website Structure

**Sitemap:**
```
/               Home — cinematic scroll narrative (all 3 chapters + intro/outro)
/work           Full filterable project index (all domains, tag-filterable)
/work/:project  Individual project detail page
/about          Bio, CV-backed experience, skills summary
/contact        Contact form + direct info
```

**Section-by-section (Home):**
1. **Cinematic hero** — name, one-line positioning statement, scroll cue.
2. **Chapter 1: Creative/Artistic** — accent color shift, editorial intro copy, 3–5 hero pieces, "See all creative work →"
3. **Chapter 2: Design/Production** — accent shift, intro copy, hero pieces, "See all design work →"
4. **Chapter 3: Technical/IT** — accent shift, intro copy, project highlights (could include code/system diagrams, not just visuals), "See all technical work →"
5. **About teaser** — short bio pull, link to full About.
6. **Contact CTA** — closing section, clear single action.

**Navigation logic:** A persistent minimal nav (logo + Work / About / Contact + language toggle) that stays low-profile during the cinematic scroll and becomes fully opaque once scrolled past the hero — doesn't compete with the narrative.

**Footer:** Simple — social links, contact email, language toggle repeated, copyright.

---

## 5. User Journey

**First impression:** Full-screen cinematic hero, minimal text, immediate sense of craft quality before any content loads.

**Main path:** Scroll through all three chapters at a shared pace → land on a chapter that resonates → click through to that domain's full work → view individual project detail → Contact.

**Conversion path:** Contact form, reachable from persistent nav at all times, not just at the end.

**Secondary paths:** Direct visitors who already know which domain they want (e.g. a recruiter told to "check the dev work") should be able to skip straight to `/work?filter=technical` via nav or direct link, not forced through the full cinematic scroll every time.

**Mobile flow:** Same chapter structure, but parallax/scroll-linked effects simplify to straightforward fade/slide-in reveals — performance and thumb-scroll comfort take priority over cinematic flourish on small screens.

---

## 6. Content Strategy

**Required copy (placeholder until final copy provided):**
- Hero positioning line
- Three chapter intros (one editorial paragraph each, written in the voice of someone describing their own craft, not a job description)
- About / bio (no CV supplied — placeholder bio written generically from the goal/audience info above; **replace once CV is provided**, per the standing instruction to read any uploaded CV first)
- Project descriptions per work item (placeholder structure: role, tools, process note, outcome)

**SEO content notes:** Because animation-heavy pages can hide real content from crawlers, all chapter and project copy must exist as real, semantic HTML in the DOM at all times — animation is a presentation layer on top of already-present content, not a replacement for it.

---

## 7. Functionality

**Must-have (launch):**
- Scroll-triggered reveal system (IntersectionObserver-based, no heavy animation library required at this scope)
- EN/DE language toggle
- Filterable work index (`/work`) by domain
- Individual project detail template
- Contact form (static-site-compatible — see Technical Notes)
- Reduced-motion fallback (respects `prefers-reduced-motion`, disables parallax/scroll-linked effects, keeps simple fades)

**Nice-to-have (post-launch):**
- Subtle cursor-following accents on desktop
- Chapter-transition sound design (optional, off by default)
- CMS-lite structure so projects can be added without touching code (flat JSON/Markdown data files, no full CMS needed at this scale)

**Explicitly out of scope for this version:** 3D viewport hero (Concept C), separate portal-world theming (Concept B). Both documented separately as future-phase options.

---

## 8. Accessibility

- Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`) throughout
- All chapter/project content readable and navigable with animations fully disabled
- Alt text required on every image (placeholder alt text flagged as "TODO — descriptive alt text" until real assets arrive)
- Full keyboard navigation, visible focus states in each domain's accent color
- Form fields with proper labels, inline error and success states
- `prefers-reduced-motion` fully respected, not just partially

---

## 9. SEO

- Per-page metadata (title, description) for Home, Work, each project, About, Contact
- Real, crawlable heading hierarchy (H1 per page, logical H2/H3 per chapter/section)
- Descriptive, keyword-relevant image file naming (`concept-art-forest-scene-01.webp`, not `IMG_004.webp`)
- SEO priority marked medium — solid fundamentals prioritized over aggressive content marketing (no blog planned at this stage)

---

## 10. Responsive Strategy

**Breakpoints:** 480 / 768 / 1024 / 1280 / 1440 (standard set, no override requested)

- **Mobile:** Single-column chapters, simplified fade-in reveals, sticky minimal nav collapses to a menu icon
- **Tablet:** Chapters gain two-column hero image + text layouts where space allows
- **Desktop:** Full parallax/scroll-linked treatment, wider hero imagery
- **Large desktop (1440+):** Max content width capped (~1400px) to avoid overly long line lengths in editorial text blocks

---

## 11. Development Workflow

**Tech stack decision:** Plain HTML/CSS/JS as the baseline, per your standing instruction. Reasoning: this site's interactivity (scroll reveals, a filterable grid, a language toggle, a contact form) does not require component state management complex enough to justify a framework's overhead. A framework would add build tooling and dependency weight without adding real capability here. If the work index grows large enough to need pagination/search logic, that can be layered in with vanilla JS without a framework migration.

**Repo structure (baseline):**
```
/assets
  /images  /videos  /icons  /fonts  /logos
/src
  /css       variables.css, base.css, layout.css, components.css, animations.css, responsive.css
  /js        scroll-reveal.js, language-toggle.js, work-filter.js, form.js
  /data      projects.json  (title, domain, role, tools, images, description — per project)
/pages
  index.html, work.html, about.html, contact.html
/docs
  design-document.md, style-guide.md, layout-guide.md, asset-guide.md
README.md
```

**Deployment workflow:** Static site — deploys cleanly to GitHub Pages or Cloudflare Pages with zero build step (or a trivial one if you want minification later).

---

## 12. Assumptions & Recommendations Log

| Item | Assumption made | Why |
|---|---|---|
| Vibe | Cinematic editorial, dark base | Matches orkenworld reference and editorial tone of voice |
| Colors | Dark neutral base + 3 domain accents | Keeps one visual system while still separating chapters |
| Fonts | Serif heading / sans body | Standard, legible editorial pairing, handles EN/DE text length |
| Logo | Wordmark placeholder | No logo file provided yet |
| Copy | Placeholder editorial copy | No final copy provided; CV will override bio once supplied |
| Stack | Plain HTML/CSS/JS | Feature set doesn't require framework overhead |
| Hosting | Cloudflare Pages or GitHub Pages | Free, zero-build-step compatible with static output |

**Manual work still needed from you:**
- Final project images/video (placeholders used until then)
- CV/resume upload (bio is generic until this is provided — I will read it in full and rewrite the About section once it's in hand)
- Confirm or revise the 3 accent colors
- Confirm bilingual approach: toggle vs. separate routes (currently assumed: simple toggle, same URL, swapped content)
