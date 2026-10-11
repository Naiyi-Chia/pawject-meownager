import { z } from 'zod';
import {
  hiddenFlagRegistry,
  meterRegistry,
  pmpSkillRegistry,
} from './registries';
import {
  idSchema,
  meterIdSchema,
  pmpSkillIdSchema,
  eventDefinitionSchema,
  evidenceDefinitionSchema,
  effectSchema,
  triggerConditionSchema,
  evidenceInstanceSchema,
  decisionRecordSchema,
  decisionSelectionSchema,
  eventInteractionSchema,
  pmpObservationSchema,
  reactiveEventRuleSchema,
} from './schemas';
import type { EventInteraction, TriggerCondition } from './schemas';

type Refinement = z.RefinementCtx;
function issue(
  ctx: Refinement,
  message: string,
  path: (string | number)[] = [],
) {
  ctx.addIssue({ code: 'custom', message, path });
}
function unique(
  values: readonly string[],
  ctx: Refinement,
  path: (string | number)[] = [],
) {
  const seen = new Set<string>();
  values.forEach((id, index) => {
    if (seen.has(id)) issue(ctx, `Duplicate ID: ${id}`, [...path, index]);
    seen.add(id);
  });
}
export const hiddenFlagDefinitionSchema = z.discriminatedUnion('type', [
  z.strictObject({
    key: idSchema,
    type: z.literal('boolean'),
    default: z.boolean(),
    description: z.string(),
  }),
  z
    .strictObject({
      key: idSchema,
      type: z.literal('enum'),
      values: z.array(idSchema).min(1),
      default: idSchema,
      description: z.string(),
    })
    .superRefine((flag, ctx) => {
      unique(flag.values, ctx, ['values']);
      if (!flag.values.includes(flag.default))
        issue(ctx, 'Default is outside allowed enum values', ['default']);
    }),
  z
    .strictObject({
      key: idSchema,
      type: z.literal('number'),
      min: z.number(),
      max: z.number(),
      default: z.number(),
      description: z.string(),
    })
    .refine(
      (flag) => flag.min <= flag.default && flag.default <= flag.max,
      'Invalid bounds/default',
    ),
]);
export const relationshipDefinitionSchema = z
  .strictObject({
    id: idSchema,
    min: z.number().optional(),
    max: z.number().optional(),
    default: z.number().optional(),
  })
  .refine(
    (r) =>
      (r.min === undefined || r.max === undefined || r.min <= r.max) &&
      (r.default === undefined ||
        ((r.min === undefined || r.default >= r.min) &&
          (r.max === undefined || r.default <= r.max))),
    'Invalid relationship bounds/default',
  );
const contextSchema = z
  .strictObject({
    scenarioIds: z.array(idSchema),
    phaseIds: z.array(idSchema),
    hiddenTruthIds: z.array(idSchema),
    meters: z
      .array(
        z.strictObject({
          id: meterIdSchema,
          min: z.literal(0),
          max: z.literal(100),
          higherIsBetter: z.boolean(),
        }),
      )
      .default(() => [...meterRegistry]),
    flags: z
      .array(hiddenFlagDefinitionSchema)
      .default(
        () =>
          structuredClone(hiddenFlagRegistry) as z.infer<
            typeof hiddenFlagDefinitionSchema
          >[],
      ),
    skills: z
      .array(
        z.strictObject({
          id: pmpSkillIdSchema,
          domain: z.enum(['people', 'process', 'business_environment']),
        }),
      )
      .default(() => [...pmpSkillRegistry]),
    relationships: z.array(relationshipDefinitionSchema),
    evidence: z.array(evidenceDefinitionSchema),
    events: z.array(eventDefinitionSchema),
  })
  .superRefine((context, ctx) => {
    for (const name of ['scenarioIds', 'phaseIds', 'hiddenTruthIds'] as const)
      unique(context[name], ctx, [name]);
    for (const name of [
      'meters',
      'skills',
      'relationships',
      'evidence',
      'events',
    ] as const)
      unique(
        context[name].map((entry) => entry.id),
        ctx,
        [name],
      );
    unique(
      context.flags.map((entry) => entry.key),
      ctx,
      ['flags'],
    );
    for (const expected of meterRegistry) {
      const actual = context.meters.find((m) => m.id === expected.id);
      if (!actual || actual.higherIsBetter !== expected.higherIsBetter)
        issue(ctx, `Missing/incorrect meter: ${expected.id}`, ['meters']);
    }
    for (const flag of context.flags) {
      const expected = hiddenFlagRegistry.find((f) => f.key === flag.key);
      if (
        !expected ||
        flag.type !== expected.type ||
        flag.default !== expected.default ||
        (flag.type === 'enum' &&
          expected.type === 'enum' &&
          (flag.values.length !== expected.values.length ||
            !flag.values.every((v) => expected.values.includes(v))))
      )
        issue(ctx, `Unapproved Scenario 01 flag definition: ${flag.key}`, [
          'flags',
        ]);
    }
    for (const expected of hiddenFlagRegistry)
      if (!context.flags.some((f) => f.key === expected.key))
        issue(ctx, `Missing flag: ${expected.key}`, ['flags']);
    for (const skill of context.skills)
      if (
        pmpSkillRegistry.find((s) => s.id === skill.id)?.domain !== skill.domain
      )
        issue(ctx, `Incorrect skill domain: ${skill.id}`, ['skills']);
  });
export type ValidationContext = z.input<typeof contextSchema>;

export function createContractValidator(input: unknown) {
  // Parse/copy first: callers cannot mutate an accepted registry behind the validator.
  const context = contextSchema.parse(input);
  const events = new Map(context.events.map((event) => [event.id, event]));
  const evidence = new Set(context.evidence.map((entry) => entry.id));
  const skills = new Set(context.skills.map((entry) => entry.id));
  const relationships = new Map(
    context.relationships.map((entry) => [entry.id, entry]),
  );
  function ref(
    id: string,
    collection: ReadonlySet<string> | ReadonlyMap<string, unknown>,
    ctx: Refinement,
    path: (string | number)[],
  ) {
    if (!collection.has(id)) issue(ctx, `Unknown reference: ${id}`, path);
  }
  function evidenceLink(
    entry: { evidenceId: string; supersededBy?: string },
    ctx: Refinement,
  ) {
    ref(entry.evidenceId, evidence, ctx, ['evidenceId']);
    if (entry.supersededBy !== undefined) {
      ref(entry.supersededBy, evidence, ctx, ['supersededBy']);
      if (entry.supersededBy === entry.evidenceId)
        issue(ctx, 'Evidence cannot supersede itself', ['supersededBy']);
    }
  }
  function triggerRefs(condition: TriggerCondition, ctx: Refinement) {
    if ('all' in condition)
      condition.all.forEach((child) => triggerRefs(child, ctx));
    else if ('any' in condition)
      condition.any.forEach((child) => triggerRefs(child, ctx));
    else if ('not' in condition) triggerRefs(condition.not, ctx);
    else if ('trust' in condition) {
      ref(condition.trust, relationships, ctx, ['trust']);
      const target = relationships.get(condition.trust);
      if (
        target &&
        ((target.min !== undefined && condition.value < target.min) ||
          (target.max !== undefined && condition.value > target.max))
      )
        issue(ctx, 'Trust comparison outside configured bounds', ['value']);
    } else if ('evidenceDiscovered' in condition)
      ref(condition.evidenceDiscovered, evidence, ctx, ['evidenceDiscovered']);
    else if ('evidenceStatus' in condition)
      ref(condition.evidenceStatus, evidence, ctx, ['evidenceStatus']);
    else if ('eventCompleted' in condition)
      ref(condition.eventCompleted, events, ctx, ['eventCompleted']);
    else if ('choiceSelected' in condition) {
      ref(condition.eventId, events, ctx, ['eventId']);
      const target = events.get(condition.eventId)?.interaction;
      if (
        !target ||
        target.type !== 'single_choice' ||
        !target.choices.some((choice) => choice.id === condition.choiceSelected)
      )
        issue(ctx, 'Unknown choice in referenced event', ['choiceSelected']);
    }
  }
  const effect = effectSchema.superRefine((value, ctx) => {
    if ('evidenceId' in value) evidenceLink(value, ctx);
    if (value.type === 'trust_delta')
      ref(value.relationshipId, relationships, ctx, ['relationshipId']);
  });
  const trigger = triggerConditionSchema.superRefine(triggerRefs);

  function lists(interaction: EventInteraction) {
    switch (interaction.type) {
      case 'single_choice':
        return [interaction.choices];
      case 'ranking':
        return [interaction.items];
      case 'evidence_diagnosis':
        return [interaction.diagnosisOptions];
      case 'decision_package':
        return [
          interaction.recommendations,
          interaction.reasons,
          interaction.nextSteps,
        ];
      case 'investigation':
        return [interaction.sources, interaction.intents];
      case 'lessons_select':
        return [interaction.lessons];
    }
  }
  function metadataRefs(
    value: unknown,
    ctx: Refinement,
    optionIds?: Set<string>,
  ) {
    if (Array.isArray(value)) {
      value.forEach((child) => metadataRefs(child, ctx, optionIds));
      return;
    }
    if (!value || typeof value !== 'object') return;
    const object = value as Record<string, unknown>;
    if (Array.isArray(object.skills))
      object.skills.forEach((skill) =>
        ref(skill as string, skills, ctx, ['skills']),
      );
    if (Array.isArray(object.optionNotes) && optionIds) {
      const notes = object.optionNotes as { optionId: string }[];
      notes.forEach((note) =>
        ref(note.optionId, optionIds, ctx, ['optionNotes']),
      );
      unique(
        notes.map((note) => note.optionId),
        ctx,
        ['optionNotes'],
      );
    }
    Object.values(object).forEach((child) =>
      metadataRefs(child, ctx, optionIds),
    );
  }
  const interaction = eventInteractionSchema.superRefine((value, ctx) => {
    const options = lists(value);
    options.forEach((list) =>
      unique(
        list.map((o) => o.id),
        ctx,
      ),
    );
    metadataRefs(
      value,
      ctx,
      new Set(options.flatMap((list) => list.map((o) => o.id))),
    );
    if (
      options.some((list) =>
        list.some((o) => 'judgment' in o && o.judgment !== undefined),
      ) &&
      value.decisionWeight === undefined
    )
      issue(ctx, 'Scored interaction requires decisionWeight', [
        'decisionWeight',
      ]);
    if (value.type === 'single_choice')
      for (const choice of value.choices)
        for (const change of choice.effects) {
          const result = effect.safeParse(change);
          if (!result.success)
            result.error.issues.forEach((error) =>
              issue(ctx, error.message, [
                'choices',
                choice.id,
                'effects',
                ...error.path.map(String),
              ]),
            );
        }
    if (value.type === 'evidence_diagnosis') {
      unique(value.evidenceIds, ctx, ['evidenceIds']);
      value.evidenceIds.forEach((id) =>
        ref(id, evidence, ctx, ['evidenceIds']),
      );
    }
  });
  const event = eventDefinitionSchema.superRefine((value, ctx) => {
    ref(value.scenarioId, new Set(context.scenarioIds), ctx, ['scenarioId']);
    ref(value.phaseId, new Set(context.phaseIds), ctx, ['phaseId']);
    metadataRefs(value.pmpTags, ctx);
    const result = interaction.safeParse(value.interaction);
    if (!result.success)
      result.error.issues.forEach((error) =>
        issue(ctx, error.message, ['interaction', ...error.path.map(String)]),
      );
    if (value.availability) triggerRefs(value.availability, ctx);
  });
  const evidenceDefinition = evidenceDefinitionSchema.superRefine(
    (value, ctx) =>
      value.truthCompatibility?.forEach((id) =>
        ref(id, new Set(context.hiddenTruthIds), ctx, ['truthCompatibility']),
      ),
  );
  // Validate the complete supplied authoring context, including forward references.
  context.evidence.forEach((value) => evidenceDefinition.parse(value));
  context.events.forEach((value) => event.parse(value));

  function selectionFor(definition: EventInteraction) {
    const approved = interaction.parse(definition);
    return decisionSelectionSchema.superRefine((selection, ctx) => {
      if (selection.type !== approved.type) {
        issue(ctx, 'Selection type does not match interaction');
        return;
      }
      const membership = (
        ids: string[],
        allowed: string[],
        min: number,
        max: number,
      ) => {
        unique(ids, ctx);
        ids.forEach((id) => ref(id, new Set(allowed), ctx, []));
        if (ids.length < min || ids.length > max)
          issue(ctx, 'Invalid selection cardinality');
      };
      if (
        selection.type === 'single_choice' &&
        approved.type === 'single_choice'
      )
        membership(
          [selection.choiceId],
          approved.choices.map((c) => c.id),
          1,
          1,
        );
      if (selection.type === 'ranking' && approved.type === 'ranking')
        membership(
          selection.orderedItemIds,
          approved.items.map((i) => i.id),
          approved.rankCount,
          approved.rankCount,
        );
      if (
        selection.type === 'evidence_diagnosis' &&
        approved.type === 'evidence_diagnosis'
      ) {
        membership(
          selection.evidenceIds,
          approved.evidenceIds,
          approved.minEvidenceSelections,
          approved.maxEvidenceSelections,
        );
        membership(
          [selection.diagnosisId],
          approved.diagnosisOptions.map((d) => d.id),
          1,
          1,
        );
      }
      if (
        selection.type === 'decision_package' &&
        approved.type === 'decision_package'
      ) {
        membership(
          [selection.recommendationId],
          approved.recommendations.map((o) => o.id),
          1,
          1,
        );
        membership(
          [selection.reasonId],
          approved.reasons.map((o) => o.id),
          1,
          1,
        );
        membership(
          [selection.nextStepId],
          approved.nextSteps.map((o) => o.id),
          1,
          1,
        );
      }
      if (
        selection.type === 'investigation' &&
        approved.type === 'investigation'
      ) {
        membership(
          [selection.sourceId],
          approved.sources.map((o) => o.id),
          1,
          1,
        );
        membership(
          [selection.intentId],
          approved.intents.map((o) => o.id),
          1,
          1,
        );
      }
      if (
        selection.type === 'lessons_select' &&
        approved.type === 'lessons_select'
      )
        membership(
          selection.lessonIds,
          approved.lessons.map((o) => o.id),
          approved.minSelections,
          approved.maxSelections,
        );
    });
  }
  const decisionRecord = decisionRecordSchema.superRefine((value, ctx) => {
    ref(value.eventId, events, ctx, ['eventId']);
    value.availableEvidenceIds.forEach((id) =>
      ref(id, evidence, ctx, ['availableEvidenceIds']),
    );
    unique(value.availableEvidenceIds, ctx, ['availableEvidenceIds']);
    metadataRefs(value.pmpTags, ctx);
    const definition = events.get(value.eventId)?.interaction;
    if (!definition) return;
    if (definition.id !== value.interactionId)
      issue(ctx, 'Wrong interactionId', ['interactionId']);
    if (definition.decisionWeight !== value.decisionWeight)
      issue(ctx, 'Record weight must match scored interaction', [
        'decisionWeight',
      ]);
    const result = selectionFor(definition).safeParse(value.selection);
    if (!result.success)
      result.error.issues.forEach((error) =>
        issue(ctx, error.message, ['selection', ...error.path.map(String)]),
      );
  });
  return {
    effect,
    trigger,
    interaction,
    event,
    evidenceDefinition,
    decisionRecord,
    selectionFor,
    evidenceInstance: evidenceInstanceSchema.superRefine((value, ctx) => {
      evidenceLink(value, ctx);
      ref(value.discoveredAtEventId, events, ctx, ['discoveredAtEventId']);
    }),
    pmpObservation: pmpObservationSchema.superRefine((value, ctx) => {
      ref(value.eventId, events, ctx, ['eventId']);
      metadataRefs(value, ctx);
      if (value.choiceId !== undefined) {
        const definition = events.get(value.eventId)?.interaction;
        if (
          definition?.type !== 'single_choice' ||
          !definition.choices.some((c) => c.id === value.choiceId)
        )
          issue(ctx, 'Unknown choice', ['choiceId']);
      }
    }),
    reactiveEventRule: reactiveEventRuleSchema.superRefine((value, ctx) => {
      ref(value.eventId, events, ctx, ['eventId']);
      triggerRefs(value.when, ctx);
    }),
  };
}
