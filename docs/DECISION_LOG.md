# Product Decision Log v0.1

This file records **why** major product decisions exist. It is intentionally portfolio-friendly.

## Product Positioning

### Decision
Portfolio value first, shareability/playability second.

### Why
The project should demonstrate product thinking, AI-assisted building, UX/game design, and execution rather than only produce a cute game.

## Audience

### Decision
Target:
- experienced PM/project workers with little formal PMP study,
- PMP beginners.

### Why
Creates a bridge between real-world experience and formal project-management frameworks.

## Cat-first, PMP-second

### Decision
Normal gameplay uses plain project language. Formal terminology lives primarily in optional PMP Lens.

### Why
Avoid turning the game into a disguised exam bank.

## Full-project simulator

### Decision
MVP presents a complete project arc rather than unrelated PMP questions.

### Why
Players should feel cumulative consequences and understand project-management systems.

## Modular events

### Decision
Build content as reusable modular events while preserving 1–2 cross-phase story chains.

### Why
Supports replay, future scenario packs, and data-driven implementation.

## Five visible meters

### Decision
Use:
- Schedule,
- Cost,
- Team,
- Risk,
- Stakeholder.

### Why
Enough breadth to create trade-offs without becoming a spreadsheet simulator.

## Overall Project Status is separate

### Decision
Status is not a sixth resource.

### Why
Status is an interpretation of project reality, not something the player should “spend.”

This enables the lesson:

> surfacing truth can make status look worse while making the project healthier.

## Soft fail, selective hard fail

### Decision
Most mistakes create recoverable consequences.

### Why
Players should learn from chains, not immediately restart after one imperfect choice.

## Mission Outcome ≠ PM Judgment

### Decision
Separate delivery result from decision quality.

### Why
Avoid outcome bias.

A lucky result does not validate a poor decision. A responsible delay does not invalidate strong judgment.

## Dual-axis PM identity

### Decision
Use:

> Project Performance × PM Judgment

MVP PM Styles:
- Balanced PM
- Firefighter
- Framework Wizard
- Chaos Coordinator

### Why
Directly expresses the practical-vs-theoretical PM tension. Excellent PM performance requires both.

## Boundary band

### Decision
Keep only four styles but add “Almost Balanced” feedback near thresholds.

### Why
Avoid making tiny score differences feel like completely different identities.

## Fixed PM Style threshold

### Decision
Style standard remains consistent across scenarios. Difficulty may later affect leaderboard scoring.

### Why
“Balanced PM” should mean the same thing everywhere.

## PMP profile is separate from PM Style

### Decision
Four-quadrant PM Style answers:

> What kind of PM were you?

PMP profile answers:

> Which formal skill domains did your decisions demonstrate?

### Why
These are related but different concepts.

## PMP profile UI

### Decision
Ending Card:
- 3 playful badges.

Detail:
- horizontal skill bars.

### Why
Keep the share card friendly while preserving learning depth.

## Coverage-aware PMP scoring

### Decision
Each PMP domain stores coverage/confidence.

### Why
One successful decision should not imply broad mastery.

## Reflection output

### Decision
Show:
- 1 Strength,
- 2–3 Focus Concepts.

### Why
More useful than a wrong-answer list and more aligned with coaching.

## Exploration

### Decision
Simplified mission-base hotspots rather than free movement.

### Why
Creates world feeling without spending MVP effort on locomotion.

## Action Points

### Decision
MVP AP is used for optional exploration/information only.

- +1 base AP per phase.
- bank cap = 2.
- rare bonus AP possible.

### Why
Introduces opportunity cost while keeping the core decision path accessible.

## Boss Investigation

### Decision
2 free Investigation Actions + saved AP.

### Why
A player should never reach Boss unable to investigate, but earlier resource choices should still matter.

## Hidden Truth

### Decision
Boss truth is selected at run start. Earlier evidence must be consistent with it.

MVP truths:
- Real Safety Risk.
- Sensor / Measurement Fault.

### Why
Replay should not become memorization. Judgment is scored on available evidence, not hindsight.

## Evidence Board

### Decision
Important clues are collected automatically.

### Why
Externalize memory without turning evidence collection into inventory micromanagement.

## Evidence reliability

### Decision
Do not show a reliability score.

### Why
Players should judge credibility from source, wording, documentation, and verification.

## Practical Shortcut

### Decision
Use realistic shortcuts as recurring distractors.

### Why
Real PM mistakes are often reasonable short-term choices, not obviously stupid decisions.

## Correct answer presentation

### Decision
Keep options similarly plausible and similar in length.

### Why
Prevent players from solving by “exam formatting” rather than reasoning.

## Burnout / speak-up chain

### Decision
Do not make the correct action ask an overloaded team for more reporting.

### Why
The PM should own synthesis and escalation burden when appropriate.

## Sponsor design

### Decision
Sponsor applies real business pressure but is not a villain.

### Why
Stakeholder management should involve legitimate trade-offs, not defeating caricatures.

## Supplier event

### Decision
Allow both primary and backup supplier options to be bad. Always consider challenging the option set.

### Why
Project management often requires reframing the decision space.

## Meow Live change

### Decision
Teach impact assessment + tailoring + negotiation rather than “always reject scope change.”

### Why
Changes can be valuable when governed and resourced.

## Closing

### Decision
Include a 30–45 second Lessons Learned interaction.

### Why
Close the project lifecycle and test whether the player derived the right lesson.

Lessons Learned has small Judgment weight only.

## Ending reveal order

### Decision
1. PM Judgment
2. Hidden Truth
3. Outcome + Judgment
4. PM Style

### Why
Reduce outcome bias.

## Runtime

### Decision
Do not enforce an absolute 10-minute limit.

Targets:
- Quick: 8–10
- Thoughtful: 12–15
- Full Lens: 15–20

### Why
The scenario now contains meaningful investigation and trade-offs that should not be cut merely for an arbitrary duration.

## Visual direction

### Decision
Keep **Hybrid Pixel Narrative**, but define the hybrid as two pixel-art presentation scales:

- minimal, clean pixel art for map / system state,
- expressive pixel-art portraits for dialogue / emotion / major events.

Normal events use mobile-first dual portraits with simplified event backgrounds. Major events may escalate from chest-up to half-body presentation with medium-exaggerated expression and moderate cinematic lighting.

Character identity and primary silhouette must remain consistent across sprite and portrait scales, while the cast may intentionally vary in age impression, body type, breed, fur pattern, and clothing.

### Why
The earlier hand-drawn narrative layer created too much style separation from the map layer. Style tests showed that expressive pixel portraits can preserve stronger character continuity while still providing enough emotional range for workplace comedy and high-stakes decisions.

The intended progression is more expressive and cinematic, not more realistic. This keeps the game cute and readable while allowing serious project tension without becoming grim or visually noisy.

## Visual asset generation workflow

### Decision
Use a prompt-first, small-test workflow before scaling production assets.

### Why
Style, character consistency, silhouette preservation, mobile readability, emotional range, and visual-noise control should be validated before generating a full asset library. The preferred production model may change over time and is therefore recorded as an implementation note in `docs/VISUAL_DIRECTION.md`, not as a permanent product requirement.

## MVP meta

### Decision
No mid-run save. Store local meta only.

### Why
Runs are short; persistence complexity is not justified yet.

## Monetization

### Decision
No ads in MVP.

Future preference:
- optional rewarded recovery,
- not forced banners/interstitials.

### Why
Do not damage trust or learning flow during product validation.
