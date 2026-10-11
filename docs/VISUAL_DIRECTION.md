# Visual Direction v0.2

## Selected Style

> **Hybrid Pixel Narrative**

The system world and the emotional story use different **pixel-art presentation scales** rather than feeling like separate visual universes.

The intended progression is:

> cute map sprite → expressive event portrait → more cinematic major-event portrait

Style progression should mean **more expressive and cinematic, not more realistic**.

---

## 1. System Layer — Minimal Pixel Base

Use for:

- mission-base map,
- buildings,
- small player / NPC sprites,
- hotspots,
- meter icons,
- compact system UI,
- transitions.

Characteristics:

- clean,
- simplified,
- low visual noise,
- mobile-readable,
- strong silhouettes,
- easy tap targets.

Avoid:

- dense pixel scenery,
- excessive decorative detail,
- tiny unreadable objects,
- nostalgia-first UI that hurts usability.

### Map Sprite Rule

Small sprites may simplify detail, but they must preserve each character's primary silhouette and identity.

Examples:

- chubby characters should still read as chubby,
- fluffy characters should still read as fluffy,
- slim / tall characters should retain that silhouette,
- breed / fur-pattern differences should remain legible where feasible.

Do not normalize the cast into one generic youthful or slim chibi body type.

---

## 2. Narrative Layer — Expressive Pixel Portraits

Use for:

- character portraits,
- dialogue scenes,
- emotional reactions,
- major story beats,
- Boss scenes,
- ending / special-event character art where appropriate.

Characteristics:

- clearly the same character as the map sprite,
- more expressive faces and posture,
- richer but controlled detail,
- readable clothing / role cues,
- charming workplace-comedy tone,
- selective cinematic presentation for high-stakes moments.

The narrative layer remains stylized pixel art. Do not drift toward photorealism or realistic human anatomy simply because the portrait is larger.

---

## 3. Character Identity and Cast Diversity

The cast should feel like a believable workplace full of different cats.

Characters may vary meaningfully in:

- age impression,
- body type,
- height / proportions,
- breed traits,
- fur color / pattern,
- clothing,
- role-specific accessories.

A chubby middle-aged manager cat is as valid as a slim junior engineer or a fluffy supplier cat.

Across presentation scales, preserve the same character's:

- fur pattern,
- body type,
- age impression,
- face shape,
- clothing,
- signature accessories,
- overall silhouette.

Identity should not depend on one accessory alone.

---

## 4. Dialogue Composition — Mobile-First Dual Portrait

Dialogue scenes use a **dual-portrait layout** adapted for vertical mobile screens.

Default composition:

- one primary speaking portrait,
- one secondary reacting portrait,
- current speaker is visually dominant,
- secondary character remains present to preserve interpersonal tension.

Do not force two equally large full portraits side-by-side if readability suffers.

### Portrait Scale

- **Normal events:** chest-up portrait by default.
- **Major events / Boss / key decisions:** half-body portrait may be used for stronger pose and dramatic emphasis.

This is a presentation escalation, not a character redesign.

---

## 5. Event Backgrounds

Event dialogue uses **simplified scene backgrounds**, not the full-detail base map and not a completely abstract empty UI.

Examples:

- Mission Office,
- meeting room,
- Supply Bay,
- Engineering area,
- Cat Café,
- Launch Pad,
- control room.

Backgrounds should establish context with a few meaningful props while keeping portraits, dialogue, and choices dominant.

---

## 6. Emotional Intensity

Default expression style is **medium-exaggerated**.

Useful emotions include:

- awkward,
- skeptical,
- embarrassed,
- tired,
- suspicious,
- frustrated,
- quietly alarmed,
- trying to remain professional under pressure.

Avoid making every reaction a meme face or emotional collapse.

### Major-Event Rule

Major event does not always mean panic.

Match the emotional intensity to the event context:

- supplier trade-off may read as suspicion,
- fake-green status may read as dawning concern,
- scope negotiation may read as social pressure / awkwardness,
- launch decision may justify much stronger tension.

Tone target:

> **serious corporate drama with subtle comedy**

Major scenes may feel serious, but should not become grim, heroic, threatening, or horror-like.

---

## 7. Lighting

Normal events use clean, readable workplace lighting.

Major events may use **moderate cinematic lighting** to reinforce context, such as:

- monitor glow,
- warning light,
- sunset / window light,
- stronger local contrast.

Preserve the colorful and playful identity of the game.

Avoid:

- heavy noir shadows,
- extreme darkness,
- drastic desaturation,
- generic "crisis filter" treatment.

---

## 8. Detail Density

Target: **medium detail with selective environmental storytelling**.

Keep a few props that communicate workplace context or personality, for example:

- coffee cups,
- documents,
- whiteboards,
- monitors,
- task boards,
- supply crates,
- tools,
- cat-specific visual gags.

Simplify non-essential textures and repeated decorations.

Priority order:

1. character / expression,
2. interactive object or decision UI,
3. contextual prop,
4. decorative detail.

Background richness must never reduce mobile readability.

---

## 9. Why the Hybrid Exists

Minimal map pixel art communicates:

> system / location / project state.

Expressive portrait pixel art communicates:

> people / emotion / narrative meaning.

The contrast should feel intentional while still clearly belonging to one game.

---

## 10. Mobile-First Rules

Primary test target:

> ~390 px phone width.

Design for:

- one-handed tapping,
- short reading chunks,
- clear hierarchy,
- practical 44 px+ tap targets where feasible,
- compact but readable cards,
- readable portraits even when dialogue UI is present.

Desktop should use additional space without inventing a separate gameplay model.

---

## 11. Base Map

MVP locations:

- 🚀 Launch Pad
- 🛠 Engineering
- 📦 Supply Bay
- ☕ Cat Café
- 🏢 Mission Office

Interaction:

1. tap hotspot,
2. tiny movement / transition,
3. event card / scene.

MVP is not free movement.

---

## 12. Event Card Hierarchy

Top:

- phase / time marker,
- event title,
- small category hint.

Body:

- 2–3 line summary.

Expandable:

- what changed,
- constraints,
- known risks.

Bottom:

- decision actions.

Avoid walls of text.

---

## 13. Project Meter Presentation

Visible meters:

- ⏰ Launch Window
- 💰 Mission Budget
- 😼 Cat Morale
- 🚨 Mission Risk
- ❤️ Earth–Meow Trust

Prefer:

- icon,
- short status label,
- relative movement,
- simple bar.

Do not expose precise 0–100 values everywhere.

---

## 14. Evidence Board

Visual metaphor:

> cute mission whiteboard.

Could contain:

- sticky notes,
- paw stamps,
- source labels,
- timestamps,
- crossed / superseded notes.

Do not show numeric evidence reliability.

Conflicts should be visually legible.

---

## 15. Ending Card

Priority order:

1. PM Style
2. Performance / Judgment
3. mini four-quadrant map
4. Mission Outcome
5. PMP badges

Should work as a shareable screenshot.

Do not make the Ending Card look like an enterprise dashboard.

---

## 16. PMP Profile UI

Ending Card uses three playful badges:

- 😼 Lead the Cats
- 🚀 Run the Mission
- 🌍 See the Bigger Planet

Tap for detail.

Detailed view uses horizontal bars for skill breakdown.

Coverage on Ending Card may use playful signals:

- 🐾🐾🐾 Well observed
- 🐾🐾○ Still exploring

Detailed screen may use more explicit coverage language.

---

## 17. Cat Moment Visual Rule

Every Core Event needs at least one of:

- portrait reaction,
- in-world visual gag,
- tiny prop,
- speech bubble,
- memorable line,
- environmental response.

Light events may go further into absurdity.

Core / Boss decisions should remain readable and should not be interrupted by random jokes at the exact moment of a serious choice.

---

## 18. AI Asset Generation Workflow

Visual asset development follows a **prompt-first, small-test workflow**:

1. define / refine the prompt,
2. generate a small controlled style test,
3. compare consistency, readability, tone, and visual noise,
4. lock the visual direction,
5. only then scale production assets.

Do not generate a complete asset library before the style is approved.

### Style-Test Evaluation Priorities

1. character identity consistency,
2. silhouette / body-type preservation,
3. mobile readability,
4. Pawject tone,
5. emotional-level control,
6. visual-noise control,
7. pixel-art quality.

### Implementation Note — Preferred Production Model

Current preferred image-generation model for production asset work:

> **Nano Banana 2**

It performed best in the current style tests.

This is an **implementation preference, not a product requirement**. The product visual rules above remain model-agnostic and may be executed with another model if a future tool produces better results.

### Prompt Anchor

For cross-scale character tests, preserve this principle:

> **Same character, different presentation scale. Preserve identity and silhouette; increase expression and cinematic presentation, not realism.**
