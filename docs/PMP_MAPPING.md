# PMP Mapping v0.1

## Purpose

Pawject Meownager is **PMP-aligned**, not a simulated official PMP score.

The game should teach and reinforce professional project-management judgment through contextual decisions.

It must not claim:

- “you will pass PMP,”
- “your PMP score is X,”
- or any equivalent prediction.

## 2026 PMP Domain Alignment

Official July 2026 PMP exam domain weighting:

| Domain | Official exam share |
|---|---:|
| People | 33% |
| Process | 41% |
| Business Environment | 26% |

Release-validation source:
`https://www.pmi.org/-/media/pmi/documents/public/pdf/certifications/new-pmp-examination-content-outline-2026.pdf`

The updated exam uses predictive, adaptive/agile, and hybrid approaches across the domains rather than treating them as isolated silos.

## In-Game Names

### 😼 Lead the Cats

Formal domain: **People**

Typical signals:

- team leadership,
- psychological safety,
- conflict,
- stakeholder engagement,
- expectation alignment,
- communication,
- sponsor pressure,
- representing the team.

### 🚀 Run the Mission

Formal domain: **Process**

Typical signals:

- delivery planning,
- schedule,
- cost,
- requirements,
- baseline integrity,
- quality,
- evidence,
- procurement,
- issue management,
- integrated decisions.

### 🌍 See the Bigger Planet

Formal domain: **Business Environment**

Typical signals:

- governance,
- compliance,
- escalation,
- value,
- business impact,
- external environment,
- sustainability,
- safety,
- strategic alignment.

## Cross-Domain Scoring

One event may contribute to more than one domain.

Example: **Earth Impact Boss** may contribute to:

### People

- Sponsor communication
- Stakeholder alignment
- Team / Safety representation

### Process

- Evidence handling
- Risk analysis
- Decision sequencing

### Business Environment

- Governance
- Compliance / safety
- Broader impact
- Escalation authority

This better reflects real project situations than assigning every event to only one domain.

## Coverage / Confidence

Each domain stores:

- score,
- number of relevant decisions,
- evidence coverage,
- confidence.

Example internal representation:

```yaml
business_environment:
  score: 92
  relevant_decisions: 2
  coverage: 0.45
  confidence: low
```

Do not expose this engineering representation directly to players.

### Ending Card

Use playful coverage language.

Examples:

- 🐾🐾🐾 Well observed
- 🐾🐾○ Still exploring

### Detailed view

May show:

- number of relevant decisions,
- high / medium / limited coverage,
- observed skill areas,
- areas lacking enough evidence.

## Skill Tag Layer

MVP UI displays only the three domains.

The engine should retain more detailed tags.

```yaml
people:
  - team_leadership
  - psychological_safety
  - conflict
  - stakeholder_engagement
  - communication

process:
  - schedule
  - cost
  - requirements
  - baseline
  - change
  - risk
  - procurement
  - quality
  - evidence
  - issue_management

business_environment:
  - governance
  - compliance
  - value
  - sustainability
  - external_impact
  - escalation
```

Future use:

- detailed bars,
- sub-archetypes,
- study recommendations,
- scenario personalization.

## Recommended Review Output

Ending should not become an error list.

Use:

### 1 Strength

Example:

> 🌟 Strength · Team Leadership  
> You created enough safety for Engineering to surface bad news before it became a launch-day surprise.

### 2–3 Focus Concepts

Example:

> 🎯 Focus · Change Management  
> You showed a pattern of committing before completing impact assessment.

> 🎯 Focus · Evidence-based Risk Decisions  
> You identified severe risk but over-weighted one source.

Selection should consider:

- error pattern,
- decision quality,
- event importance,
- coverage,
- repeat behavior.

Do not simply count wrong answers.

## PMP Lens Rules

### Purpose

Translate the game event into formal PM learning.

### Can include

- formal concept,
- why chosen option is strong/weak,
- analysis of all options,
- sequence / timing issue,
- wrong owner,
- premature escalation,
- practical shortcut,
- relevant PMP domain / skill tags.

### Must not

- interrupt normal gameplay,
- reveal future hidden truth,
- punish players for skipping,
- make the game feel like mandatory coursework.

## Content Authoring Rule

Core PMP events should be authored / reviewed.

Do not generate core learning content live with AI in MVP.

AI can support:

- drafting,
- variant generation,
- dialogue,
- review,
- distractor ideation.

But final scenario logic should be deterministic and testable.
