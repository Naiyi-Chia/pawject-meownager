# Scenario 01 — Project Meow Homecoming

## Premise

The player becomes the new PM of the **Earth–Meow Joint Mission Office**.

A group of stranded cat aliens needs to return to its home planet.

The previous PM suddenly quit.

Their handover note effectively says:

> Everything is under control. Good luck.

The project appears green and healthy.

It is not.

---

# Story Skeleton

## Node 1 — First Day, Good Luck

### Format

Opening Triage mini-game.

Three issues arrive at once.

### Issue A — Green dashboard, stale information

The dashboard looks healthy, but key documents were last updated roughly two weeks ago.

- importance: high
- urgency: medium

### Issue B — Sponsor feature request

Sponsor asks:

> Can we add an interactive live-stream feature? It shouldn't be big. I need an answer this afternoon.

- urgency: high
- importance: medium initially

### Issue C — Engineering overload

Engineering says the team has been working overtime for two weeks and a critical test is tonight.

- urgency: high
- importance: high

### MVP interaction

Player ranks the three issues.

Do not enforce one rigid perfect order. Evaluate based on:

- impact,
- urgency,
- safety / risk,
- dependencies,
- authority,
- quality of reasoning.

Consequences include small immediate effects plus hidden delayed effects.

---

# Story Chain A — The Cats Aren't Fine

## Early optional clue — Cat Café

Engineering cats privately hint:

- the test is not actually ready,
- people are afraid to raise bad news,
- previous escalation led to more overtime.

Example:

> 「上次有人說測試還沒好……後來大家就多加了兩天班。」

## Formal event — One-on-one with Chief Engineer

The PM should not ask an overloaded team to create more reports.

Preferred behavior:

> 「先跟我說目前最關鍵的 blocker，我來整理影響和後續。」

Learning goal:

- listen,
- obtain minimum necessary information,
- PM owns synthesis,
- PM absorbs coordination / escalation burden.

Hidden state: `speak_up_safety`.

If the PM blames or throws Engineering directly in front of Sponsor, later information quality degrades.

---

# Sponsor Pressure Event

Sponsor asks:

> I don't want to hear all these risks. Can you launch on date or not?

Sponsor is not a villain. Business pressure is legitimate.

The PM's job is to translate pressure into:

- impact,
- options,
- recommendation,
- next action.

### Practical Shortcut

> 「可以，我要求團隊追回。」

Short-term:

- Sponsor trust may rise.

Long-term:

- burnout,
- hidden quality/risk,
- speak-up damage.

### Strong direction

> 「我今天確認 impact 和可行方案，再回來確認 launch decision。」

### Weak ownership

Send Engineering to explain the problem directly to Sponsor.

This may damage psychological safety.

### Premature commitment

Immediately declare a delay without enough information.

---

# Minimum Decision Package Preparation

Before answering Sponsor, player selects two information categories to prioritize:

- Schedule impact
- Technical readiness
- Team capacity
- Cost impact
- Alternative launch options

Information value is context-dependent. Wrong selection does not instantly fail the event, but creates blind spots.

Then use the structured Decision Package:

1. Recommendation
2. Reason
3. Next Step

Score components independently plus coherence.

---

# Node 3 — Everything Is Green… Right?

## Core contradiction

Multiple stakeholders provide individually plausible but mutually inconsistent versions of reality.

Example:

- Sponsor believes a change is already done.
- Engineering is still updating for the newest request.
- Supplier says the old version is complete.
- Launch-site evidence suggests testing is not finished.

## Root Cause

Systemic information-chain distortion:

1. Sponsor verbally requested a change.
2. Former PM informally agreed.
3. Engineering began updating.
4. Formal documents were updated late.
5. Supplier did not receive the newest version.
6. Dashboard remained green.

No single participant needs to be lying. Everyone may be reporting their own truth.

## Investigation

Player should establish:

- latest valid requirement / baseline,
- change history,
- affected deliverables.

## Diagnosis mini-system

Player receives 5–6 information cards and chooses:

1. key evidence,
2. diagnosis category.

Include 1–2 reasonable noise cards, such as:

- team burnout,
- supplier punctuality,
- upcoming press event.

Learning:

> distinguish context, symptom, and root-cause evidence.

## Recovery

### Stabilize

- pause affected work if necessary,
- confirm approved baseline,
- assess impacted deliverables,
- stop propagation.

### Recover

- align affected work,
- verify,
- replan,
- update stakeholders.

### Prevent recurrence

Future-facing controls for change propagation, ownership, and reporting integrity.

## Important consequence

A correct response may change:

> On Track → At Risk

Desired line:

> 「所以……我們不是把專案變黃了，是終於承認它本來就是黃的？」

This is a positive information-integrity outcome despite uglier status.

## Practical shortcuts

### Shortcut A

Send newest requirement to everyone and keep moving.

Immediate:

- schedule relief,
- stakeholder relief.

Latent risk:

- unassessed downstream change.

### Shortcut C

Tell Engineering and Supplier to align informally.

Immediate:

- fast progress.

Latent risk:

- acceptance / baseline mismatch.

---

# Node 4 — The Fast Supplier

## Situation

Main propulsion-part supplier is approximately 10 days late. Launch window is approximately 3 weeks away.

A backup supplier exists.

Backup:

- faster,
- roughly 20% more expensive,
- weaker quality history,
- incomplete certification evidence.

The full risk picture is not shown automatically. Supply Bay exploration can reveal more.

## Decision principle

Validate → Assess → Decide.

In game language:

1. **這家真的能用嗎？**
2. **換了之後會造成什麼？**
3. **現在最合理的 recovery 是什麼？**

## Important branch

Both options may be bad.

Main supplier:

- compliant,
- late.

Backup supplier:

- fast,
- may not close certification gaps before launch.

Always include an option like:

> Are these really the only options?

Earlier exploration may unlock:

- partial delivery,
- replan,
- alternative technical solution,
- additional supplier search,
- split strategy.

Learning:

> Stakeholder-provided options are not necessarily the full decision space.

---

# Node 5 — Just One Tiny Feature

## Meow Live returns

Sponsor explicitly asks:

> Add live-stream this week. It shouldn't be big.

Correct PM logic:

- recognize scope change,
- assess impact,
- tailor scope,
- negotiate budget/time/resources,
- obtain appropriate approval.

Do not teach “reject every change.”

## Scope options

- Full live-stream before launch
- Minimal viable broadcast
- Post-launch media package

## Resource negotiation

### Too little

- Sponsor may be happy.
- Team load / hidden risk rises.

### Evidence-backed reasonable request

Best chance of healthy agreement.

### Too much

- Sponsor trust may fall.
- Request may be rejected.

Negotiation result is based on:

- evidence quality,
- package reasonableness,
- Sponsor trust.

Not random luck.

## If Sponsor refuses enough resources

Strong behavior:

- tailor/reduce scope,
- package trade-offs,
- return infeasible constraint decisions to appropriate authority.

Practical Shortcut:

> accept anyway / team will try.

Engineering Cat:

> 「『努力看看』在我們這邊通常翻譯成『今晚不用回家』。」

## Possible outcomes

- Approved Full
- Approved Reduced
- Deferred
- Rejected / Withdrawn

These outcomes modify Boss conditions.

---

# Node 6 — Should We Still Launch?

## Boss — Earth Impact Crisis

T-2 days.

Earth Science discovers that the **hyperspace tuna engine** may interfere with Earth's magnetic field under certain conditions.

Probability is uncertain. Potential consequence is severe.

Sponsor faces:

- public commitments,
- diplomatic pressure,
- business consequences.

Safety Cat:

> 「我不是說一定會出事。我是說我們現在沒有足夠證據說它安全。」

## Boss investigation

Player receives:

- 2 free Investigation Actions,
- plus saved AP.

Possible sources:

- Earth Science
- Engineering
- Safety
- Sponsor
- Meow representative

Possible investigation intents:

- Evidence
- Impact
- Alternatives
- Compliance
- Authority

MVP uses intent categories rather than free-text questions.

## Hidden Truth

Selected at run start. All earlier clues must remain logically consistent with it.

### Truth A — Real Safety Risk

The engine genuinely may cause unacceptable magnetic-field impact.

### Truth B — Sensor / Measurement Fault

The main abnormality is measurement or calibration. The engine may not have the suspected major hazard.

However, lack of proof is not proof of safety.

## Judgment rule

PM Judgment is scored against:

> evidence available to the player at decision time.

It is **not** scored against whether the player guessed hidden truth correctly.

Example:

Truth B + prudent delay + proper escalation:

- mission may be delayed,
- PM Judgment can still be excellent.

Truth B + reckless launch + lucky outcome:

- mission may succeed,
- PM Judgment remains poor.

Safety Cat:

> 「這次沒事，不是一套風險管理方法。」

## Evidence Board

Automatically collects important evidence.

Each card shows:

- Source
- Time

Do not show a numeric reliability rating.

Reliability should be inferred from:

- source,
- wording,
- documentation,
- independent verification.

Evidence categories may include:

- hearsay,
- observation,
- documented evidence,
- independently verified evidence.

Conflicting evidence can coexist.

Older evidence may be marked:

- outdated,
- superseded,
- still relevant.

Do not delete history.

## Final Boss decision

Use Decision Package:

1. Recommendation
2. Reason
3. Next Step

Possible outcomes:

- launch,
- delay,
- suspend / escalate,
- modified launch,
- other governed option.

PM authority matters.

The PM may stop unsafe activity within authority and escalate, but does not automatically have unilateral authority to terminate the entire project.

---

# Node 7 — What Did We Actually Learn?

## Closing

30–45 seconds.

QA Cat:

> 「拜託這次真的寫點有用的。上次那份只有一句『下次注意』。」

Player selects the most valuable lessons from 3–4 candidates.

Candidates can include:

- strong insight,
- incomplete insight,
- oversimplified lesson,
- wrong causal lesson.

Examples of strong lessons:

- A green status does not mean the evidence is current.
- Team willingness to surface bad news is a project asset.
- High-risk decisions should not be judged only by outcome.

Oversimplified:

- Every change should be rejected.
- The fastest backup supplier is always best.

Lessons Learned contributes only a small amount to PM Judgment.

Future: lessons may unlock meta progression.

---

# Ending Sequence

Order:

1. **PM Judgment**
2. **What actually happened?**
3. **Mission Outcome + Judgment combined**
4. **PM Style**
5. **PMP-aligned profile**
6. **1 Strength + 2–3 Focus Concepts**

This order is intentionally designed to reduce outcome bias.
