import { expect, test } from '@playwright/test';
import {
  createContractValidator,
  effectSchema,
  pmJudgmentContributionSchema,
  hiddenFlagRegistry,
  scenario01InitialHiddenFlags,
  meterRegistry,
  pmpSkillRegistry,
  hiddenFlagDefinitionSchema,
  eventInteractionSchema,
  decisionRecordSchema,
  metaStateSchema,
  projectStateSchema,
  scenario01HiddenFlagsSchema,
} from '../src/contracts';
import type {
  EventInteraction,
  DecisionSelection,
  EventDefinition,
  ValidationContext,
  FlagSetEffect,
} from '../src/contracts';

// Synthetic authoring fixtures, not Scenario 01 content or balance assignments.
const choice = (id: string) => ({ id, text: `Option ${id}`, effects: [] });
const option = (id: string) => ({ id, text: `Option ${id}` });
const pairs: { interaction: EventInteraction; selection: DecisionSelection }[] =
  [
    {
      interaction: {
        id: 'single',
        type: 'single_choice',
        decisionWeight: 2,
        choices: [choice('a'), choice('b')],
      },
      selection: { type: 'single_choice', choiceId: 'a' },
    },
    {
      interaction: {
        id: 'rank',
        type: 'ranking',
        decisionWeight: 1,
        items: [option('a'), option('b')],
        rankCount: 2,
      },
      selection: { type: 'ranking', orderedItemIds: ['b', 'a'] },
    },
    {
      interaction: {
        id: 'diagnose',
        type: 'evidence_diagnosis',
        decisionWeight: 2,
        evidenceIds: ['e1', 'e2'],
        diagnosisOptions: [option('a')],
        minEvidenceSelections: 1,
        maxEvidenceSelections: 2,
      },
      selection: {
        type: 'evidence_diagnosis',
        evidenceIds: ['e1'],
        diagnosisId: 'a',
      },
    },
    {
      interaction: {
        id: 'package',
        type: 'decision_package',
        decisionWeight: 3,
        recommendations: [option('a')],
        reasons: [option('b')],
        nextSteps: [option('c')],
      },
      selection: {
        type: 'decision_package',
        recommendationId: 'a',
        reasonId: 'b',
        nextStepId: 'c',
      },
    },
    {
      interaction: {
        id: 'investigate',
        type: 'investigation',
        decisionWeight: 1,
        sources: [option('a')],
        intents: [{ id: 'evidence', text: 'Gather evidence' }],
      },
      selection: { type: 'investigation', sourceId: 'a', intentId: 'evidence' },
    },
    {
      interaction: {
        id: 'lessons',
        type: 'lessons_select',
        decisionWeight: 1,
        lessons: [option('a'), option('b')],
        minSelections: 1,
        maxSelections: 2,
      },
      selection: { type: 'lessons_select', lessonIds: ['a'] },
    },
  ];
const events: EventDefinition[] = pairs.map(({ interaction }, index) => ({
  id: `S99-CORE-0${index + 1}`,
  scenarioId: 'S99',
  phaseId: 'test-phase',
  kind: 'core',
  title: 'Fixture',
  summary: 'Schema fixture only',
  interaction,
}));
const context: ValidationContext = {
  scenarioIds: ['S99'],
  phaseIds: ['test-phase'],
  hiddenTruthIds: ['truth-a'],
  relationships: [{ id: 'test-target', min: 0, max: 10 }],
  evidence: ['e1', 'e2'].map((id) => ({
    id,
    title: 'Fixture',
    sourceType: 'test',
    sourceLabel: 'Test',
    content: 'Fixture only',
    truthCompatibility: ['truth-a'],
  })),
  events,
};
const validator = createContractValidator(context);

for (const [index, pair] of pairs.entries()) {
  test(`${pair.interaction.type}: valid interaction, selection and canonical history`, () => {
    expect(validator.interaction.safeParse(pair.interaction).success).toBe(
      true,
    );
    expect(
      validator.selectionFor(pair.interaction).safeParse(pair.selection)
        .success,
    ).toBe(true);
    expect(
      validator.decisionRecord.safeParse({
        eventId: events[index].id,
        interactionId: pair.interaction.id,
        selection: pair.selection,
        decisionWeight: pair.interaction.decisionWeight,
        availableEvidenceIds: ['e1'],
        pmJudgment: { evidence: 0 },
        discoveryReflection: [
          { kind: 'reflection', rating: 0, key: 'test-reflection' },
        ],
        pmpTags: { skills: ['evidence'] },
      }).success,
    ).toBe(true);
  });
  test(`${pair.interaction.type}: wrong type and unknown selection membership rejected`, () => {
    const invalid = JSON.parse(JSON.stringify(pair.selection)) as Record<
      string,
      unknown
    >;
    const field = Object.keys(invalid).find((key) => key !== 'type')!;
    invalid[field] = Array.isArray(invalid[field]) ? ['unknown'] : 'unknown';
    expect(
      validator.selectionFor(pair.interaction).safeParse(invalid).success,
    ).toBe(false);
    expect(
      validator
        .selectionFor(pair.interaction)
        .safeParse({ ...pair.selection, type: 'unsupported' }).success,
    ).toBe(false);
  });
}

test('meter directions, four initial flags and PMP domains exactly match the approved baseline', () => {
  expect(
    scenario01HiddenFlagsSchema.safeParse(scenario01InitialHiddenFlags).success,
  ).toBe(true);
  expect(meterRegistry).toEqual(
    ['schedule', 'cost', 'team', 'risk', 'stakeholder'].map((id) => ({
      id,
      min: 0,
      max: 100,
      higherIsBetter: id !== 'risk',
    })),
  );
  expect(scenario01InitialHiddenFlags).toEqual({
    information_integrity: 'degraded',
    speak_up_safety: 'low',
    overtime_pressure: 'high',
    baseline_alignment: 'misaligned',
  });
  expect(hiddenFlagRegistry.map((f) => f.key)).toEqual(
    Object.keys(scenario01InitialHiddenFlags),
  );
  expect(pmpSkillRegistry).toHaveLength(21);
  expect(pmpSkillRegistry.find((s) => s.id === 'escalation')?.domain).toBe(
    'business_environment',
  );
  const valid: FlagSetEffect = {
    type: 'flag_set',
    flag: 'information_integrity',
    value: 'distorted',
  };
  expect(effectSchema.safeParse(valid).success).toBe(true);
  // Compile-time proof that flag values are correlated with their keys.
  // @ts-expect-error 'high' belongs to pressure/safety, not information integrity.
  const invalid: FlagSetEffect = {
    type: 'flag_set',
    flag: 'information_integrity',
    value: 'high',
  };
  expect(effectSchema.safeParse(invalid).success).toBe(false);
});

test('all seven effects validate data without applying it', () => {
  const data = [
    { type: 'meter_delta', meter: 'risk', value: -5, visibility: 'latent' },
    { type: 'flag_set', flag: 'baseline_alignment', value: 'aligned' },
    {
      type: 'trust_delta',
      relationshipId: 'test-target',
      value: 2,
      visibility: 'post_choice',
    },
    { type: 'ap_delta', value: 1 },
    { type: 'evidence_add', evidenceId: 'e1' },
    {
      type: 'evidence_status_set',
      evidenceId: 'e1',
      status: 'superseded',
      supersededBy: 'e2',
    },
    { type: 'project_status_set', status: 'uncertain', visibility: 'preview' },
  ];
  const before = structuredClone(data);
  data.forEach((value) =>
    expect(validator.effect.safeParse(value).success).toBe(true),
  );
  expect(data).toEqual(before);
});

for (const [name, value] of Object.entries({
  arbitrarySet: { type: 'set', path: 'project.meters.team', value: 100 },
  arbitraryDelta: { type: 'delta', path: 'world.flags', value: 1 },
  scoringEffect: { type: 'score_delta', value: 1 },
  unknownMeter: {
    type: 'meter_delta',
    meter: 'morale',
    value: 1,
    visibility: 'preview',
  },
  extraPath: { type: 'ap_delta', value: 1, path: 'player.ap' },
  unknownFlag: { type: 'flag_set', flag: 'scope_creep', value: true },
  invalidFlagValue: {
    type: 'flag_set',
    flag: 'information_integrity',
    value: 'high',
  },
  unsupportedStatus: {
    type: 'project_status_set',
    status: 'green',
    visibility: 'preview',
  },
  missingVisibility: { type: 'meter_delta', meter: 'risk', value: 1 },
  unknownRelationship: {
    type: 'trust_delta',
    relationshipId: 'other',
    value: 1,
    visibility: 'latent',
  },
  unknownEvidence: { type: 'evidence_add', evidenceId: 'other' },
  unknownSupersession: {
    type: 'evidence_status_set',
    evidenceId: 'e1',
    status: 'superseded',
    supersededBy: 'other',
  },
  selfSupersession: {
    type: 'evidence_status_set',
    evidenceId: 'e1',
    status: 'superseded',
    supersededBy: 'e1',
  },
  wrongLifecycle: {
    type: 'evidence_status_set',
    evidenceId: 'e1',
    status: 'current',
    supersededBy: 'e2',
  },
  nonFinite: { type: 'ap_delta', value: Infinity },
}))
  test(`invalid effect rejected: ${name}`, () =>
    expect(validator.effect.safeParse(value).success).toBe(false));

test('Evidence definitions and discovery/lifecycle references are validated', () => {
  expect(
    validator.evidenceInstance.safeParse({
      evidenceId: 'e1',
      discoveredAtEventId: events[0].id,
      status: 'outdated',
    }).success,
  ).toBe(true);
  for (const changes of [
    { discoveredAtEventId: 'missing' },
    { evidenceId: 'missing' },
    { status: 'current', supersededBy: 'e2' },
    { status: 'superseded', supersededBy: 'missing' },
  ]) {
    expect(
      validator.evidenceInstance.safeParse({
        evidenceId: 'e1',
        discoveredAtEventId: events[0].id,
        status: 'current',
        ...changes,
      }).success,
    ).toBe(false);
  }
  expect(
    validator.evidenceDefinition.safeParse({
      ...context.evidence[0],
      truthCompatibility: ['missing'],
    }).success,
  ).toBe(false);
});

test('sparse judgment preserves omitted dimensions versus assessed zero', () => {
  const parsed = pmJudgmentContributionSchema.parse({ evidence: 0 });
  expect(parsed).toEqual({ evidence: 0 });
  expect(Object.hasOwn(parsed, 'decision')).toBe(false);
  for (const value of [
    { evidence: 3 },
    { decision: -3 },
    { execution: 0.5 },
    { people: 1 },
  ])
    expect(pmJudgmentContributionSchema.safeParse(value).success).toBe(false);
});

test('all trigger primitives and recursive boolean composition accept known references', () => {
  const conditions = [
    { flag: 'speak_up_safety', op: 'eq', value: 'low' },
    { meter: 'risk', op: 'gte', value: 70 },
    { projectStatus: 'uncertain' },
    { trust: 'test-target', op: 'lte', value: 10 },
    { evidenceDiscovered: 'e1' },
    { evidenceStatus: 'e2', status: 'current' },
    { eventCompleted: events[0].id },
    { choiceSelected: 'a', eventId: events[0].id },
    { ap: true, op: 'gt', value: 0 },
  ];
  conditions.forEach((value) =>
    expect(validator.trigger.safeParse(value).success).toBe(true),
  );
  expect(
    validator.trigger.safeParse({
      all: [{ any: conditions }, { not: conditions[0] }],
    }).success,
  ).toBe(true);
  expect(
    validator.reactiveEventRule.safeParse({
      eventId: events[0].id,
      when: { any: conditions },
      once: true,
      priority: 1,
    }).success,
  ).toBe(true);
});

for (const [name, value] of Object.entries({
  flagValue: { flag: 'baseline_alignment', op: 'eq', value: 'high' },
  event: { not: { eventCompleted: 'missing' } },
  choice: { choiceSelected: 'missing', eventId: events[0].id },
  wrongChoiceEvent: { choiceSelected: 'a', eventId: events[1].id },
  evidence: { all: [{ evidenceDiscovered: 'missing' }] },
  relationship: { trust: 'missing', op: 'eq', value: 1 },
  relationshipBounds: { trust: 'test-target', op: 'gt', value: 11 },
  meterBounds: { meter: 'risk', op: 'eq', value: 101 },
  operator: { meter: 'risk', op: 'approximately', value: 1 },
  callback: { predicate: () => true },
}))
  test(`invalid trigger rejected: ${name}`, () =>
    expect(validator.trigger.safeParse(value).success).toBe(false));

test('definition uniqueness and selection cardinality are enforced for each list', () => {
  const invalidSelections = [
    [pairs[1], { type: 'ranking', orderedItemIds: ['a', 'a'] }],
    [pairs[1], { type: 'ranking', orderedItemIds: ['a'] }],
    [
      pairs[2],
      { type: 'evidence_diagnosis', evidenceIds: [], diagnosisId: 'a' },
    ],
    [
      pairs[2],
      {
        type: 'evidence_diagnosis',
        evidenceIds: ['e1', 'e1'],
        diagnosisId: 'a',
      },
    ],
    [
      pairs[3],
      {
        type: 'decision_package',
        recommendationId: 'b',
        reasonId: 'b',
        nextStepId: 'c',
      },
    ],
    [pairs[4], { type: 'investigation', sourceId: 'a', intentId: 'impact' }],
    [pairs[5], { type: 'lessons_select', lessonIds: [] }],
    [pairs[5], { type: 'lessons_select', lessonIds: ['a', 'a'] }],
  ] as const;
  invalidSelections.forEach(([pair, selection]) =>
    expect(
      validator.selectionFor(pair.interaction).safeParse(selection).success,
    ).toBe(false),
  );
  for (const pair of pairs) {
    const invalid = structuredClone(pair.interaction) as unknown as Record<
      string,
      unknown
    >;
    const list = Object.values(invalid).find(
      (value) =>
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === 'object',
    ) as unknown[];
    list.push(structuredClone(list[0]));
    expect(validator.interaction.safeParse(invalid).success).toBe(false);
  }
  expect(
    eventInteractionSchema.safeParse({ ...pairs[1].interaction, rankCount: 3 })
      .success,
  ).toBe(false);
  expect(
    eventInteractionSchema.safeParse({
      ...pairs[5].interaction,
      minSelections: 3,
      maxSelections: 2,
    }).success,
  ).toBe(false);
  expect(
    eventInteractionSchema.safeParse({ ...pairs[3].interaction, reasons: [] })
      .success,
  ).toBe(false);
  expect(
    eventInteractionSchema.safeParse({
      ...pairs[0].interaction,
      type: 'unsupported',
    }).success,
  ).toBe(false);
});

test('context rejects duplicate IDs, wrong registries and unknown authored references', () => {
  for (const name of [
    'events',
    'evidence',
    'relationships',
    'scenarioIds',
    'phaseIds',
    'hiddenTruthIds',
  ] as const) {
    const invalid = structuredClone(context);
    (invalid[name] as unknown[]).push(structuredClone(invalid[name][0]));
    expect(() => createContractValidator(invalid)).toThrow();
  }
  expect(() =>
    createContractValidator({
      ...context,
      flags: [...hiddenFlagRegistry, hiddenFlagRegistry[0]],
    }),
  ).toThrow();
  expect(() =>
    createContractValidator({
      ...context,
      skills: [...pmpSkillRegistry, pmpSkillRegistry[0]],
    }),
  ).toThrow();
  expect(() =>
    createContractValidator({
      ...context,
      meters: meterRegistry.map((m) => ({ ...m, higherIsBetter: true })),
    }),
  ).toThrow();
  expect(() =>
    createContractValidator({
      ...context,
      flags: hiddenFlagRegistry.map((f) => ({ ...f, default: 'high' })),
    }),
  ).toThrow();
  expect(() =>
    createContractValidator({
      ...context,
      events: [{ ...events[0], availability: { eventCompleted: 'unknown' } }],
    }),
  ).toThrow();
  expect(() =>
    createContractValidator({
      ...context,
      events: [{ ...events[0], scenarioId: 'unknown' }],
    }),
  ).toThrow();
  expect(() =>
    createContractValidator({
      ...context,
      events: [{ ...events[0], phaseId: 'unknown' }],
    }),
  ).toThrow();
});

test('Lens notes and PMP metadata validate local option and registered skill references', () => {
  const lens = {
    concept: 'Fixture concept',
    explanation: 'Authored note',
    skills: ['evidence'],
    optionNotes: [{ optionId: 'a', note: 'Fixture note' }],
  };
  const withLens = {
    ...pairs[0].interaction,
    choices: [{ ...choice('a'), pmpLens: lens }, choice('b')],
  };
  expect(validator.interaction.safeParse(withLens).success).toBe(true);
  expect(
    validator.interaction.safeParse({
      ...withLens,
      choices: [
        {
          ...choice('a'),
          pmpLens: {
            ...lens,
            optionNotes: [{ optionId: 'missing', note: 'Invalid reference' }],
          },
        },
        choice('b'),
      ],
    }).success,
  ).toBe(false);
  expect(
    validator.interaction.safeParse({
      ...withLens,
      choices: [
        { ...choice('a'), pmpLens: { ...lens, skills: ['unregistered'] } },
        choice('b'),
      ],
    }).success,
  ).toBe(false);
  expect(
    validator.pmpObservation.safeParse({
      eventId: events[0].id,
      choiceId: 'a',
      skills: ['evidence'],
    }).success,
  ).toBe(true);
  expect(
    validator.pmpObservation.safeParse({
      eventId: events[0].id,
      choiceId: 'missing',
      skills: ['evidence'],
    }).success,
  ).toBe(false);
});

test('canonical record rejects legacy fields, invalid weights and interaction mismatch', () => {
  const record = {
    eventId: events[0].id,
    interactionId: 'single',
    selection: pairs[0].selection,
    decisionWeight: 2,
    availableEvidenceIds: [],
  };
  for (const changes of [
    { choiceId: 'a' },
    { judgment: { evidence: 1 } },
    { decisionWeight: 4 },
    { decisionWeight: 1 },
    { interactionId: 'wrong' },
    { eventId: 'missing' },
    { availableEvidenceIds: ['missing'] },
    { pmJudgment: { evidence: 3 } },
    { pmpTags: { skills: ['unknown'] } },
    { discoveryReflection: [{ kind: 'exploration', rating: 2, key: 'x' }] },
  ])
    expect(
      validator.decisionRecord.safeParse({ ...record, ...changes }).success,
    ).toBe(false);
  expect(
    decisionRecordSchema.safeParse({ ...record, decisionWeight: undefined })
      .success,
  ).toBe(false);
  expect(
    validator.interaction.safeParse({
      id: 'test',
      type: 'single_choice',
      choices: [{ ...choice('a'), judgment: { evidence: 1 } }, choice('b')],
    }).success,
  ).toBe(false);
});

test('generic flag definition structures and configured bounds validate without new registry entries', () => {
  expect(
    hiddenFlagDefinitionSchema.safeParse({
      key: 'fixture-only',
      type: 'boolean',
      default: false,
      description: 'Test shape only',
    }).success,
  ).toBe(true);
  expect(
    hiddenFlagDefinitionSchema.safeParse({
      key: 'fixture-only',
      type: 'number',
      min: 0,
      max: 5,
      default: 6,
      description: 'Invalid default',
    }).success,
  ).toBe(false);
  expect(
    hiddenFlagDefinitionSchema.safeParse({
      key: 'fixture-only',
      type: 'enum',
      values: ['a'],
      default: 'b',
      description: 'Invalid default',
    }).success,
  ).toBe(false);
  expect(() =>
    createContractValidator({
      ...context,
      relationships: [{ id: 'test-target', min: 3, max: 2 }],
    }),
  ).toThrow();
  expect(
    metaStateSchema.safeParse({
      playCount: 0,
      unlockedEndings: [],
      discoveredEasterEggs: [],
    }).success,
  ).toBe(true);
});

test('malformed interaction payloads and cross-type selections fail for all six variants', () => {
  pairs.forEach((pair) => {
    expect(
      validator.interaction.safeParse({
        id: pair.interaction.id,
        type: pair.interaction.type,
      }).success,
    ).toBe(false);
    const mismatched = pairs.find(
      (candidate) => candidate.selection.type !== pair.selection.type,
    )!;
    expect(
      validator.selectionFor(pair.interaction).safeParse(mismatched.selection)
        .success,
    ).toBe(false);
  });
});

test('zero minimums and component-local IDs preserve the canonical interaction semantics', () => {
  const emptyEvidence = {
    ...pairs[2].interaction,
    type: 'evidence_diagnosis' as const,
    evidenceIds: [],
    diagnosisOptions: [option('a')],
    minEvidenceSelections: 0,
    maxEvidenceSelections: 0,
  };
  expect(
    validator.selectionFor(emptyEvidence).safeParse({
      type: 'evidence_diagnosis',
      evidenceIds: [],
      diagnosisId: 'a',
    }).success,
  ).toBe(true);
  const emptyLessons = {
    id: 'empty-lessons',
    type: 'lessons_select' as const,
    lessons: [],
    minSelections: 0,
    maxSelections: 0,
  };
  expect(
    validator
      .selectionFor(emptyLessons)
      .safeParse({ type: 'lessons_select', lessonIds: [] }).success,
  ).toBe(true);
  const reused = {
    id: 'local-ids',
    type: 'decision_package' as const,
    recommendations: [option('a')],
    reasons: [option('a')],
    nextSteps: [option('a')],
  };
  expect(
    validator.selectionFor(reused).safeParse({
      type: 'decision_package',
      recommendationId: 'a',
      reasonId: 'a',
      nextStepId: 'a',
    }).success,
  ).toBe(true);
});

test('accepted context is isolated from caller mutation and supports forward references', () => {
  const authored = structuredClone(context);
  authored.events[0].availability = { eventCompleted: authored.events[1].id };
  const isolated = createContractValidator(authored);
  authored.events[0].interaction.id = 'changed-later';
  authored.evidence[0].id = 'changed-later';
  expect(
    isolated.evidenceInstance.safeParse({
      evidenceId: 'e1',
      discoveredAtEventId: events[0].id,
      status: 'current',
    }).success,
  ).toBe(true);
  expect(
    isolated.decisionRecord.safeParse({
      eventId: events[0].id,
      interactionId: 'single',
      selection: pairs[0].selection,
      decisionWeight: 2,
      availableEvidenceIds: [],
    }).success,
  ).toBe(true);
});

test('configured project meter values enforce the approved range without choosing starting values', () => {
  const values = {
    meters: { schedule: 0, cost: 100, team: 50, risk: 10, stakeholder: 80 },
    status: 'on_track',
  };
  expect(projectStateSchema.safeParse(values).success).toBe(true);
  expect(
    projectStateSchema.safeParse({
      ...values,
      meters: { ...values.meters, risk: 101 },
    }).success,
  ).toBe(false);
  expect(
    projectStateSchema.safeParse({
      ...values,
      meters: { ...values.meters, status: 1 },
    }).success,
  ).toBe(false);
});
