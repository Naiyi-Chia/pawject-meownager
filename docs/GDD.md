# Pawject Meownager — Game Design Document v0.1

**Working scenario:** Project Meow Homecoming｜喵星返航計畫  
**Status:** MVP design baseline  
**Product goal:** Portfolio-first, playable/shareable second

## 1. Product Vision

**Pawject Meownager** is a cute, mobile-first project-management simulation that lets players experience a complete project lifecycle through short, memorable decisions.

The MVP asks the player to become the new PM of the **Earth–Meow Joint Mission Office** and send stranded cat aliens back to their home planet. The project looks healthy on day one. It is not.

The game sits between:

- a cute browser game,
- a project-management simulation,
- and a PMP-aligned learning experience.

It must **not** feel like a PMP quiz wearing a cat skin.

> **Good PMs don't just know the right thing. They make the right things happen.**

The product deliberately explores the tension between:

- **Project Performance** — can you actually deliver?
- **PM Judgment** — did you use sound project-management reasoning?

The best PM is strong at both.

## 2. Portfolio Intent

This project should demonstrate:

1. **Product thinking** — users, trade-offs, MVP boundaries, success criteria.
2. **AI-assisted product building** — ChatGPT for product/design reasoning, Codex for implementation.
3. **UX/game experience design** — narrative, pacing, replayability, feedback loops.
4. **Technical execution** — important, but not the primary portfolio story.

Desired portfolio narrative:

> Idea → requirements → product decisions → prototype → playable product → iteration.

## 3. Target Player

Primary audience:

- PMs / project workers with real experience but limited formal PMP study.
- PMP beginners who want contextual learning instead of pure memorization.

No prior PMP knowledge should be required.

### Language rule

**Cat-first, PMP-second.**

Approximate communication split:

- 80% in-world language / everyday project language.
- 20% formal PMP terminology in optional **PMP Lens**.

Do not name primary actions with jargon.

| Formal concept | In-game wording |
|---|---|
| Perform Impact Assessment | 先查清楚 |
| Escalate to Governance Body | 找能做決定的人 |
| Validate Procurement Compliance | 這家真的能用嗎？ |

## 4. Session Length

The 10-minute target is a guideline, not a hard cap.

- **Quick Run:** 8–10 min
- **Thoughtful Run:** 12–15 min
- **PMP Lens full-read run:** 15–20 min

Do not cut meaningful investigation or trade-offs just to force an arbitrary duration.

## 5. Core Experience Loop

1. Enter a project phase.
2. Read a short situation summary.
3. Optionally explore a location using Action Points.
4. Gather clues, context, or small advantages.
5. Make a project decision.
6. See immediate narrative consequences.
7. Observe visible project-state changes.
8. Carry hidden consequences forward.
9. Reach Boss investigation and final decision.
10. Reflect, reveal truth, and receive ending + PM profile.

## 6. MVP Scenario Structure

The MVP uses seven major story nodes:

1. **First Day, Good Luck** — Opening Triage.
2. **The Cats Aren't Fine** — burnout / psychological safety / speak-up.
3. **Everything Is Green… Right?** — stale baseline / fake-green dashboard / information integrity.
4. **The Fast Supplier** — procurement recovery and qualification trade-offs.
5. **Just One Tiny Feature** — Meow Live scope change and resource negotiation.
6. **Should We Still Launch?** — Earth Impact Crisis Boss.
7. **What Did We Actually Learn?** — Lessons Learned, judgment, truth reveal, ending.

Detailed scenario content: `SCENARIO_01_HOMECOMING.md`.

## 7. Project State Model

### Visible meters

1. ⏰ **Launch Window** → Schedule
2. 💰 **Mission Budget** → Cost
3. 😼 **Cat Morale** → Team
4. 🚨 **Mission Risk** → Risk
5. ❤️ **Earth–Meow Trust** → Stakeholder

Values may exist internally on a 0–100 scale but should not always be shown numerically. Prefer qualitative states, bars, relative change, and diegetic reactions.

### Overall Project Status

Separate from the five meters.

Possible states:

- On Track
- At Risk
- Critical
- Status Uncertain

This is **not** a sixth player-managed resource.

A correct decision may intentionally make the project look worse on paper. Example: the dashboard goes green → yellow because the PM finally surfaces the real problem.

### Hidden states

Examples:

- information_integrity
- speak_up_safety
- individual_character_trust
- overtime_pressure
- supplier_pressure
- scope_creep
- technical_debt
- media_attention
- baseline_alignment
- governance_readiness

These drive reactive events and endings.

## 8. Exploration & Action Points

MVP uses a simplified mission-base map rather than free movement.

Core locations:

- 🚀 Launch Pad
- 🛠 Engineering
- 📦 Supply Bay
- ☕ Cat Café
- 🏢 Mission Office

Main story is mandatory. Detours are optional.

Each phase:

- base +1 AP,
- AP can bank,
- MVP bank cap = 2,
- rare bonus AP may occur.

AP is used only for exploration / information gathering in MVP.

### Boss investigation

Boss provides:

- 2 free Investigation Actions,
- plus saved AP 1:1,
- up to saved AP cap.

## 9. Event Types

1. **Core PMP Event** — main learning/judgment event.
2. **Reactive World Event** — triggered by previous actions and hidden flags.
3. **Light / Absurd Event** — humor, pacing, world-building; some have zero strategic value.
4. **External Crisis** — used later, after players understand cause → effect.

Target: roughly 30–40% of light events may exist purely because the world should feel alive and funny.

## 10. Content Design Rules

### Core Event format

1. 2–3 line situation summary.
2. Expandable detail: what changed / constraints / known risks.
3. Plausible options of similar length.
4. Decision preview shows partial trade-offs, not exact outcomes.
5. Immediate in-world consequence.
6. Optional PMP Lens.

### Correct-answer rule

The correct option must **not** consistently look longer, more polished, more formal, or more cautious.

Wrong options should often fail because of:

- sequence,
- timing,
- ownership,
- missing assessment,
- unvalidated assumptions,
- practical shortcuts.

Randomize answer position.

### Practical Shortcut

A recurring distractor type:

> A realistic action that gives short-term benefit but skips necessary assessment, governance, validation, or sequencing and plants latent risk.

Show:

1. immediate reward,
2. subtle in-world warning,
3. delayed consequence.

Do not use a giant warning icon. Use diegetic hints such as:

> 「所以我們現在到底照 v3.2 還是 v3.3？」

## 11. Cat Moment Rule

Every Core Event must contain at least one memorable **Cat Moment**:

- whisper,
- reaction,
- absurd prop,
- expressive portrait,
- shareable line,
- environmental gag.

The Cat Moment does not always need to be a joke. Its job is to make abstract PM concepts memorable.

## 12. Learning Feedback

### Immediate feedback

Game-first:

- narrative reaction,
- meter shifts,
- world response.

Avoid giant “Wrong Answer” banners.

### PMP Lens

Optional and skippable.

May explain:

- why the selected option works/fails,
- why other options are tempting,
- sequence,
- ownership,
- practical shortcut logic,
- formal PMP concept.

It may analyze all options.

## 13. Scoring Philosophy

### Project Performance

Did you make the mission work?

Signals include:

- mission outcome,
- schedule,
- budget,
- risk health,
- team health,
- stakeholder trust,
- residual project state.

### PM Judgment

Did you use sound project-management reasoning?

Signals include:

- evidence use,
- sequencing,
- change/risk/stakeholder judgment,
- governance,
- decision-package coherence,
- lucky guessing vs justified decisions,
- latent risk created.

These two axes cannot fully wash each other out.

See `SCORING_AND_ENDINGS.md`.

## 14. PMP-Aligned Profile

The ending includes a separate profile aligned to the 2026 PMP domains:

- 😼 **Lead the Cats** → People
- 🚀 **Run the Mission** → Process
- 🌍 **See the Bigger Planet** → Business Environment

Official July 2026 PMP exam weighting:

- People: 33%
- Process: 41%
- Business Environment: 26%

These percentages describe exam composition, **not** the player's proficiency score.

Pawject Meownager must never claim to predict official PMP pass/fail results.

Each event may contribute to multiple domains. Each domain also tracks **coverage/confidence** so a player is not over-interpreted after only one relevant event.

See `PMP_MAPPING.md`.

Official release-validation source:
`https://www.pmi.org/-/media/pmi/documents/public/pdf/certifications/new-pmp-examination-content-outline-2026.pdf`

## 15. Closing & Reflection

After Boss:

1. PM Judgment first.
2. Hidden Truth / post-mission truth reveal second.
3. Outcome + Judgment side by side.
4. Lessons Learned reflection.
5. PM Style.
6. PMP-aligned profile and focus concepts.

This sequence deliberately reduces outcome bias.

Lessons Learned contributes only a small amount to PM Judgment.

## 16. Visual Direction

Selected direction:

> **Hybrid Pixel Narrative**

System layer:

- clean minimal pixel art,
- simple mission-base map,
- mobile-readable UI,
- buildings / hotspots / small characters.

Narrative layer:

- hand-drawn character portraits,
- special-event illustrations,
- Boss scenes,
- ending / share cards.

See `VISUAL_DIRECTION.md`.

## 17. Platform & Implementation Direction

MVP target:

- browser,
- mobile-first,
- responsive desktop.

Primary design width: ~390 px phone viewport.

Likely implementation:

- TypeScript
- Vite
- Phaser 3 for 2D game layer
- HTML/CSS for start/tutorial/result surfaces
- localStorage for MVP meta
- GitHub → Vercel deployment

Backend is not required for MVP.

Future backend may support leaderboard / anonymous identity / richer progression.

### Content architecture

Prefer data-driven events. Game logic should read event/scenario data rather than hard-code every branch into UI code.

## 18. MVP Success Criteria

MVP is successful when:

1. A new player understands the premise without PMP knowledge.
2. A full run feels like a project, not a quiz set.
3. Players perceive consequences from earlier choices.
4. At least one ending clearly separates luck from good judgment.
5. PMP-aware users recognize authentic PM reasoning.
6. Non-PMP players can enjoy the game without opening PMP Lens.
7. Result cards are understandable and worth sharing.
8. Hidden truth, exploration, and branches create meaningful replay.
9. The repo clearly demonstrates a traceable AI-assisted product-development process.

## 19. Design Principles

1. **Cat-first, PMP-second.**
2. **Outcome ≠ decision quality.**
3. **Delivery and judgment are both required for excellent PM performance.**
4. **Uncertainty comes from incomplete/conflicting information, not obscure jargon.**
5. **Correct PM actions may have short-term costs.**
6. **Do not reward irresponsible luck as expertise.**
7. **World reactions are feedback.**
8. **MVP surface can be simple while the underlying model remains extensible.**
9. **Keep some events useless, cute, and alive.**
10. **Every major mechanic must justify its place in the portfolio story.**
