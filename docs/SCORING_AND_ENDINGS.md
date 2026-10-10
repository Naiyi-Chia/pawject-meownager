# Scoring & Endings v0.1

## Design Goal

The game should resolve the long-running tension between:

- **實務派** — “I can get the project done.”
- **理論派** — “I know the correct framework / process.”

The game's position:

> Better PMs need both delivery and judgment.

## 1. Core Scores

### Project Performance

Measures whether the project was actually managed to a healthy result.

Candidate components:

- Mission Outcome
- Launch Window
- Mission Budget
- Cat Morale
- Mission Risk
- Earth–Meow Trust
- residual latent risk
- unresolved issues
- delivery quality

### PM Judgment

Measures the quality of project-management decisions.

Candidate components:

- evidence use
- sequence
- ownership
- risk reasoning
- change reasoning
- stakeholder judgment
- governance
- escalation
- decision-package coherence
- practical shortcuts avoided
- latent risk created
- lessons learned (small weight)

### Discovery / Reflection

Smaller auxiliary category.

Candidate components:

- useful exploration,
- meaningful evidence discovered,
- special investigation,
- Lessons Learned.

Pure Easter eggs should give little or no competitive score.

## 2. Initial Total Score Direction

Working starting point:

- Project Performance: 40%
- PM Judgment: 45%
- Discovery / Reflection: 15%

This is not final balancing.

More important rule:

> high Project Performance must not fully compensate for poor PM Judgment, and vice versa.

## 3. Balance Gate

High-level PM rank requires both axes to clear a minimum standard.

Exact thresholds should be calibrated through playtesting.

Illustrative logic:

```text
if performance high AND judgment high:
    Balanced PM
elif performance high AND judgment lower:
    Firefighter
elif performance lower AND judgment high:
    Framework Wizard
else:
    Chaos Coordinator
```

Do not lock production thresholds until enough playtest data exists.

## 4. MVP PM Styles

### 🌟 Balanced PM

High delivery + high judgment.

> You can make sound decisions and turn them into outcomes.

### 🔥 Firefighter

High delivery + weaker judgment.

> You get things done, but may create hidden cost, risk, burnout, or governance debt.

QA Cat:

> 「我承認，火箭真的飛了。下次可以不要靠奇蹟嗎？」

### 📚 Framework Wizard

Strong judgment + weaker delivery.

> You understand what should happen, but struggle to consistently translate it into project outcomes.

Sponsor:

> 「你的分析很完整。所以貓什麼時候回家？」

### 🐈 Chaos Coordinator

Low delivery + low judgment.

> The project is now coordinating itself.

## 5. Boundary Band

Four styles remain fixed.

Avoid making 74 vs 75 feel like completely different people.

Maintain an internal “distance to balanced” calculation.

Example:

> Framework Wizard · Almost Balanced

Feedback:

> Your judgment is strong. The next step is turning it into more reliable delivery.

Or:

> Firefighter · Almost Balanced

Feedback:

> You deliver strongly, but several results depended on compressed risk and team load.

## 6. Scenario Difficulty

PM Style uses a fixed standard across scenarios.

Scenario difficulty may later affect:

- leaderboard bonus,
- score multiplier,
- separate ranking context.

Do not move the definition of “Balanced PM” between scenarios.

## 7. Outcome ≠ Judgment

This is a foundational rule.

### Lucky success

Truth = Sensor Fault.

Player:

- investigates poorly,
- ignores Safety,
- launches anyway.

Outcome:

- mission succeeds.

Judgment:

- poor.

Possible ending:

> **Lucky Homecoming**

Safety Cat:

> 「恭喜你猜對了。拜託不要把這句話寫進 risk management plan。」

### Responsible delay

Truth = Sensor Fault.

Player:

- gathers evidence,
- cannot establish sufficient safety,
- recommends delay / escalation.

Outcome:

- launch delayed.

Judgment:

- excellent.

Possible ending:

> **Better Safe Than Sorry**

### Efficiently Doing the Wrong Thing

Schedule and budget may look excellent while risk, team, governance, or broader impact was ignored.

This is a desired memorable ending category.

## 8. Ending Sequence

Order matters.

1. **PM Judgment** — evaluate quality using evidence available at decision time.
2. **Hidden Truth Reveal** — Confirmed / Most likely / Inconclusive.
3. **Combined Outcome** — Mission Outcome + PM Judgment side by side.
4. **PM Style** — four-quadrant identity.
5. **PMP-aligned profile** — 😼 People / 🚀 Process / 🌍 Business Environment.
6. **Coaching summary** — 1 Strength + 2–3 Focus Concepts.

## 9. Ending Quality Categories

Candidate mission-outcome labels:

- Flawless / Healthy Success
- Made It Somehow
- Pyrrhic Success
- Mission Failed
- Responsible Delay / Suspend
- The PM Who Said No
- Efficiently Doing the Wrong Thing
- Lucky Homecoming

Final naming can remain playful.

## 10. Hard Fail Philosophy

Default: **soft failure**.

Hard failure only for extreme crisis.

Different meters may trigger different hard-fail families:

- budget / funding collapse,
- team walkout,
- governance / stakeholder collapse,
- safety/risk crisis,
- missed launch window.

Whether a crisis can be rescued depends heavily on earlier preparation and hidden flags.

A few terminal states may truly end the run.

## 11. Ending Card

Primary share-card content:

- PM Style
- Project Performance score
- PM Judgment score
- compact four-quadrant position
- Overall Mission Outcome
- three PMP-aligned badges
- optional “Almost Balanced” note

Detailed breakdown should be one tap deeper.

## 12. Future Archetypes

MVP has only four styles.

The engine should retain enough data for future sub-archetypes such as:

- Cat Whisperer
- Risk Tamer
- Evidence Navigator
- Deadline Hero
- Scope Firefighter
- Lucky Launcher

Do not expose these in MVP yet.
