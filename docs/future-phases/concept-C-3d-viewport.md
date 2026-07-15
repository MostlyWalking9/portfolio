# Design Document — Concept C: 3D Hero / Project-Select Viewport
### Art deBeaufort — Portfolio
**Status: NOT selected for initial build — documented as a phase-two addition, not a launch dependency**

---

## 1. Project Overview

**Core offer:** A game-native selection interface as the centerpiece — visitors scroll/browse through a horizontal lineup of "hero pieces" (references given: League of Legends champ select, Honkai Star Rail's character menu) representing either literal 3D characters, standout websites, logo/branding work, or concept art pieces, each with an idle highlight animation, and a "lock in"/"select" action that opens full project detail (pipeline, concepts, process).

**Why this is phase-two, not launch:** the spirit of the interaction (thumbnail lineup → hover highlight → select → detail reveal) is fully buildable now in plain HTML/CSS/JS. The literal "AAA idle-animated 3D character" version of it is a genuinely different scope of production — real-time 3D characters with idle animation loops are what dedicated game art/tech teams spend months on, and promising that as a launch-blocking centerpiece risks delaying the whole site around one feature.

---

## 2. Brand Positioning

Same audience as Concepts A/B. This concept's specific strength: it's the most immediately impressive to a visually literate audience (game studios, other artists) if executed well — and the most damaging to credibility if it ships half-finished or laggy, given the audience most drawn to it will also be the most likely to notice production shortcuts.

---

## 3. Visual Direction

**Four "lineup" variants you proposed, each mapped to a domain or sub-skill:**

| Variant | Represents | Notes |
|---|---|---|
| AAA character, idle-animated | 3D/character art pipeline | Full 3D asset + rig + idle loop needed |
| Website hovering in a display/portal frame | Web/dev projects | Achievable sooner — a 2D screenshot/video in a stylized 3D-ish frame reads as "displayed," without needing true 3D geometry |
| Glowing logo, on-highlight animation | Branding/design work | Very achievable now — SVG + CSS/WebGL glow shader, no full 3D pipeline required |
| Magical canvas revealing artwork on highlight | Concept art/illustration | Achievable with a shader-based reveal or simple crossfade, doesn't require full 3D |

**Recommendation:** these four variants don't need to launch at equal fidelity. The logo-glow and canvas-reveal items are realistically buildable soon with 2D/shader techniques; the literal 3D idle-character variant is the one to treat as the long-term reach goal.

**Alternative structural reference you mentioned (League/HSR-style):** thumbnails with a title, "lock in" to reveal full detail, factions/sections mapping to your three domains. This selection *mechanic* (lineup → highlight → lock in → detail) is the reusable, launch-ready part — worth building generically now so any of the four visual variants above can slot into it later without rebuilding the interaction.

---

## 4. Answering Your Direct 3D Questions

**"Are you able to use Three.js, OpenGL, Babylon.js, etc.?"** Yes to Three.js and Babylon.js. "OpenGL" itself isn't a browser-native technology — WebGL (which both libraries sit on top of) is the actual target, so this is effectively already answered by choosing one of the two.

**"How well/easily could you implement 3D assets if provided — objects, textures, lights, animations, camera moves?"**
- **Static/rigged glTF (GLB) models with textures and lighting:** straightforward, this is exactly the format both libraries are built to load well.
- **Idle animations baked into the model (e.g. via mixamo-style rigs or custom rigging):** loadable and playable via Three.js's/Babylon's animation mixers, assuming the export is clean.
- **Camera animation / viewport maneuvering:** fully doable — orbit controls for user-driven rotation, or scripted camera paths for a cinematic reveal on "select."
- **Real caveat:** performance across devices (especially mobile/lower-end hardware) needs real testing once actual assets are in hand — asset polycount, texture size, and number of simultaneous loaded models all matter more than the code itself. A fallback (e.g. a pre-rendered video loop instead of live 3D) should be planned for low-power devices from day one, not bolted on after something breaks.

---

## 5. Website Structure (if/when built)

```
/select              The lineup/select screen (whichever variant is chosen)
/select/:project      "Locked in" detail view — full pipeline breakdown
```

Likely integrated as a dedicated section within Concept A's scroll (e.g. inline as an embedded module) rather than a fully separate page, once ready — keeps one coherent site rather than fragmenting into a second experience.

---

## 6. Functionality (if/when built)

**Core reusable mechanic (build this generically, regardless of which visual variant is chosen):**
- Horizontal lineup with keyboard/swipe/scroll navigation
- Hover/focus highlight state per item
- "Select"/"lock in" action expanding into full project detail
- Return-to-lineup control

**3D-specific additions (only for the literal character/model variant):**
- glTF/GLB model loading pipeline
- Animation mixer for idle loops
- Camera control (orbit for browsing, scripted path for the "select" reveal)
- Device-capability detection with a static/video fallback path

---

## 7. Accessibility

This is the concept with the largest accessibility gap to close before launch-readiness: live 3D scenes are not natively screen-reader-friendly, and orbit/camera-drag interactions aren't keyboard-native by default. Any future build needs: full keyboard equivalents for lineup navigation and selection, real alt-text-equivalent descriptions of each 3D piece for non-visual users, and a genuinely usable non-3D fallback path — not just a "reduced motion" toggle, but a full content-equivalent.

---

## 8. Responsive Strategy

Live 3D rendering on mobile is the highest-risk part of this entire concept — GPU/battery constraints are real. Recommendation for any future build: serve the lightweight variants (website-in-frame, logo-glow, canvas-reveal) on mobile as standard, and gate the full live-3D character experience to devices that can comfortably handle it, with a pre-rendered video/image fallback everywhere else.

---

## 9. Development Workflow (if/when built)

**Tech addition on top of baseline stack:** Three.js (recommended over Babylon.js for this scope — lighter footprint, large ecosystem, sufficient feature set for character display + camera control without Babylon's heavier editor-oriented tooling). This sits alongside the plain HTML/CSS/JS baseline as an added dependency for this one module, not a full framework migration.

**Asset pipeline note:** glTF/GLB is the target export format from whatever 3D tool you're modeling in (Blender, Maya, etc.) — send finished exports in that format when ready, plus separate texture files if not embedded.

---

## 10. Assumptions & Recommendations Log

| Item | Assumption / recommendation | Why |
|---|---|---|
| Priority | Phase-two, not launch-blocking | Avoids delaying the whole site around the most production-heavy feature |
| Library choice | Three.js over Babylon.js | Lighter weight, sufficient for this scope |
| Visual variant priority | Logo-glow and canvas-reveal first, full 3D character last | Matches realistic production cost per variant |
| Mobile strategy | Lightweight variant or fallback video, not live 3D by default | GPU/battery risk on mobile is real |

**Manual work needed before this becomes buildable:** actual GLB/glTF assets (models, textures, idle animations), a decision on which of the four lineup variants to prioritize first, and real device-performance testing once assets exist.
