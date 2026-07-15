# Design Document — Concept B: Elemental / Domain Portals
### Art deBeaufort — Portfolio
**Status: NOT selected for initial build — kept as a future-phase reference**

---

## 1. Project Overview

**Core offer:** Instead of one continuous narrative (Concept A), this version gives each professional domain its own fully distinct portal-world, entered from a shared home screen:

- **Elemental/magical portal** → Creative/Artistic world (concept art, character/environment art, illustration, game/film storytelling) — fantasy aesthetic
- **Sci-fi/tech portal** → Technical/IT world (coding, web dev, AI systems, automation) — futuristic/systems aesthetic
- **Stylized, clean portal** → Design/Production world (branding, motion, UI/UX, product design) — polished commercial aesthetic

**Main CTA:** View work (per-portal, once inside a world)
**Why this exists as an option:** Strongest possible identity separation between the three domains — each world can look and feel completely different without one aesthetic diluting another.

**Tradeoff vs. Concept A (flagged in consultation, repeated here for the record):** roughly triples production surface — three distinct art directions, three coded aesthetics, three sets of portal VFX assets. Fine as a future expansion once Concept A validates the core content and copy; heavier as a first build.

---

## 2. Brand Positioning

Same audience and positioning as Concept A (potential employers, clients, collaborators; editorial tone at the shell level, with each portal-world allowed its own internal tone once inside).

**Differentiation:** Where Concept A says "one voice, three instruments," Concept B says "three worlds, one architect" — leans harder into the range as spectacle.

---

## 3. Visual Direction

**Home/shell screen:** A single dark, neutral staging area (not yet claiming any of the three aesthetics) where all three portals sit as distinct visual objects.

**Portal identities (assumption, none specified beyond the three-way split):**

| Portal | Aesthetic direction | Suggested palette anchor |
|---|---|---|
| Elemental/magical | Fantasy, painterly, warm ember/gold glow | `#C9553D` / `#E8A23D` |
| Sci-fi/tech | Cool, high-contrast, terminal-green or cyan glow | `#3D8FC9` / `#7CC93D` |
| Stylized/clean | Minimal, high-contrast neutral with one sharp accent | `#F2EFE9` base / `#3D8FC9` accent |

(These are directionally consistent with Concept A's three accent colors, so switching between concepts later doesn't require starting the palette from zero.)

**Portal VFX — file format guidance (answering your direct question):**
Buildable options, roughly in order of production cost (lowest to highest):
1. **Lottie** — vector-based, lightweight, ideal for a looping glow/shimmer portal idle state. Cheapest to produce and by far the easiest to keep performant.
2. **WebM (with alpha channel)** — good for a richer painterly or particle-style loop if Lottie's vector look isn't right for the elemental portal specifically.
3. **Sprite sheet** — solid middle ground for hand-animated 2D VFX, more control than Lottie, more setup work.
4. **GLB (glTF) + Three.js/Babylon.js shaders & particles** — the most visually rich option (true 3D portal with real particle systems and shader-based glow), but the most production-heavy: needs real 3D asset creation, shader work, and performance testing across devices.

**Recommendation:** start with Lottie or WebM for a launch-ready portal interaction; treat the full Three.js shader/particle portal as a phase-two upgrade once the underlying content in each world is built and validated — same phased logic as the 3D viewport in Concept C.

**Typography/logo:** Shared wordmark/logo at the shell level; each portal-world can carry its own internal type treatment once entered, echoing its aesthetic.

---

## 4. Website Structure

**Sitemap:**
```
/                    Shell — 3 portals + name/positioning
/creative/*          Elemental portal world (home, work, project detail)
/technical/*         Sci-fi portal world (home, work, project detail)
/design/*            Stylized portal world (home, work, project detail)
/about                Shared, shell-level
/contact              Shared, shell-level
```

**Navigation logic:** Once inside a portal-world, a persistent "return to shell" control is required at all times — visitors should never feel trapped in one world with no way back to see the others.

---

## 5. User Journey

**First impression:** Land on shell, see three visually distinct portals, intuit before reading a word that this person works across genuinely different modes.

**Main path:** Choose the portal matching the visitor's interest → explore that world's work → optionally return to shell → explore another portal.

**Risk to flag:** visitors who only ever see one portal-world may walk away thinking that's the *entire* scope of your work — the shell screen needs strong enough framing copy ("three ways I work, choose where to start") that range still reads clearly even to someone who never opens a second portal.

---

## 6. Content Strategy

Same underlying content needs as Concept A (chapter/world intros, project descriptions, About, CV-driven bio once supplied) — but tripled in aesthetic-specific copy voice: shell copy is neutral/editorial, then each world's internal copy can shift register (e.g. the elemental world's copy could lean more narrative/mythic, the technical world's more precise/systems-minded).

---

## 7. Functionality

**Must-have if built:**
- Portal hover/select interaction with idle-loop VFX per portal
- Per-world theming system (either fully separate stylesheets per world, or a shared CSS-variable theme-switch — recommend the latter to avoid tripling maintenance cost)
- Shared nav shell for return-to-home from any world
- EN/DE toggle, contact form — same as Concept A

**Explicitly heavier than Concept A:** three times the visual asset production, a theming system robust enough to switch cleanly between worlds without style leakage, and VFX performance testing per portal.

---

## 8. Accessibility

Same baseline as Concept A (semantic structure, alt text, keyboard nav, reduced-motion respect) — with one addition: portal VFX idle-loops must have a static, reduced-motion equivalent (a still glow state) rather than being disabled outright, since the portal *is* the primary navigation affordance here, not a decorative extra.

---

## 9. SEO

Same fundamentals as Concept A. Additional consideration: three separate world sections benefit from being genuinely distinct in their on-page content (not just re-skinned), which is naturally satisfied here since each world covers a different domain of work.

---

## 10. Responsive Strategy

Portal interactions (hover-to-preview, click-to-enter) need a touch-equivalent on mobile — likely tap-to-preview, tap-again-to-enter, since there's no hover state on touch devices. This is a real design decision to make before building, not an afterthought.

---

## 11. Development Workflow

**Tech stack note:** Feasible in plain HTML/CSS/JS with Lottie/WebM portal VFX. If the portals move to the full Three.js/shader treatment later, that's an added dependency layer on top of the same baseline stack, not a full rebuild — Three.js can be scoped to just the portal component.

**Repo structure:** Same baseline as Concept A, with an added `/worlds/creative`, `/worlds/technical`, `/worlds/design` split for per-world assets and styles, plus a shared `/shell` for the portal-selection screen.

---

## 12. Assumptions & Recommendations Log

| Item | Assumption made | Why |
|---|---|---|
| Portal aesthetics | Elemental / sci-fi / stylized-clean, palette anchors listed above | Matches your three-domain split directly |
| Portal VFX format | Recommend Lottie/WebM for launch, GLB+Three.js as upgrade | Balances visual ambition against realistic production cost |
| Theming | Shared CSS-variable theme-switch, not 3 fully separate codebases | Avoids tripling long-term maintenance burden |

**Manual work still needed if this concept is picked up later:** three sets of visual assets, portal VFX files in one of the formats above, decision on touch-equivalent portal interaction for mobile.
