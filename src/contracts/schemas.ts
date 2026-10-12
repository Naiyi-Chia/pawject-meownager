import { z } from 'zod';
import { meterIds, projectStatuses, pmpSkillRegistry } from './registries';
import type { HiddenFlagKey, HiddenFlagValue, PmpSkillId } from './registries';

export const idSchema = z.string().min(1);
export const eventIdSchema = idSchema; // Semantic aliases; namespaces are not a closed registry.
export const meterIdSchema = z.enum(meterIds);
export const projectStatusSchema = z.enum(projectStatuses);
export const projectStateSchema = z.strictObject({
  meters: z.strictObject({
    schedule: z.number().min(0).max(100),
    cost: z.number().min(0).max(100),
    team: z.number().min(0).max(100),
    risk: z.number().min(0).max(100),
    stakeholder: z.number().min(0).max(100),
  }),
  status: projectStatusSchema,
});
export const scenario01HiddenFlagsSchema = z.strictObject({
  information_integrity: z.enum(['healthy', 'degraded', 'distorted']),
  speak_up_safety: z.enum(['low', 'medium', 'high']),
  overtime_pressure: z.enum(['low', 'medium', 'high']),
  baseline_alignment: z.enum(['aligned', 'uncertain', 'misaligned']),
});
export const effectVisibilitySchema = z.enum([
  'preview',
  'post_choice',
  'latent',
]);
export const evidenceStatusSchema = z.enum([
  'current',
  'outdated',
  'superseded',
]);
export const judgmentRatingSchema = z.union([
  z.literal(-2),
  z.literal(-1),
  z.literal(0),
  z.literal(1),
  z.literal(2),
]);
export const decisionWeightSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);
export const pmJudgmentContributionSchema = z.strictObject({
  evidence: judgmentRatingSchema.optional(),
  decision: judgmentRatingSchema.optional(),
  execution: judgmentRatingSchema.optional(),
});
export const discoveryReflectionContributionSchema = z.strictObject({
  kind: z.enum(['exploration', 'evidence', 'investigation', 'reflection']),
  rating: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
  key: idSchema,
});
export const pmpSkillIdSchema = z.custom<PmpSkillId>(
  (value) => pmpSkillRegistry.some((skill) => skill.id === value),
  'Unknown PMP skill',
);
export const pmpTagSetSchema = z.strictObject({
  skills: z.array(pmpSkillIdSchema),
});
export const pmpLensContentSchema = z.strictObject({
  title: z.string().optional(),
  concept: z.string(),
  explanation: z.string(),
  optionNotes: z
    .array(z.strictObject({ optionId: idSchema, note: z.string() }))
    .optional(),
  skills: z.array(pmpSkillIdSchema).optional(),
});
export const pmpObservationSchema = z.strictObject({
  eventId: eventIdSchema,
  choiceId: idSchema.optional(),
  skills: z.array(pmpSkillIdSchema),
  judgmentQuality: z.number().optional(),
});
export const pmpDomainAccumulatorSchema = z.strictObject({
  relevantDecisionIds: z.array(idSchema),
  observedSkills: z.array(pmpSkillIdSchema),
  qualitySum: z.number(),
  qualityWeight: z.number(),
});

const flagBranches = [
  z.strictObject({
    flag: z.literal('information_integrity'),
    value: z.enum(['healthy', 'degraded', 'distorted']),
  }),
  z.strictObject({
    flag: z.literal('speak_up_safety'),
    value: z.enum(['low', 'medium', 'high']),
  }),
  z.strictObject({
    flag: z.literal('overtime_pressure'),
    value: z.enum(['low', 'medium', 'high']),
  }),
  z.strictObject({
    flag: z.literal('baseline_alignment'),
    value: z.enum(['aligned', 'uncertain', 'misaligned']),
  }),
] as const;
export const flagValueSchema = z.discriminatedUnion('flag', flagBranches);
export type FlagSetEffect<K extends HiddenFlagKey = HiddenFlagKey> =
  K extends HiddenFlagKey
    ? { type: 'flag_set'; flag: K; value: HiddenFlagValue<K> }
    : never;
export const effectSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('meter_delta'),
    meter: meterIdSchema,
    value: z.number(),
    visibility: effectVisibilitySchema,
  }),
  z.discriminatedUnion('flag', [
    flagBranches[0].extend({ type: z.literal('flag_set') }),
    flagBranches[1].extend({ type: z.literal('flag_set') }),
    flagBranches[2].extend({ type: z.literal('flag_set') }),
    flagBranches[3].extend({ type: z.literal('flag_set') }),
  ]),
  z.strictObject({
    type: z.literal('trust_delta'),
    relationshipId: idSchema,
    value: z.number(),
    visibility: effectVisibilitySchema,
  }),
  z.strictObject({ type: z.literal('ap_delta'), value: z.number() }),
  z.strictObject({ type: z.literal('evidence_add'), evidenceId: idSchema }),
  z
    .strictObject({
      type: z.literal('evidence_status_set'),
      evidenceId: idSchema,
      status: evidenceStatusSchema,
      supersededBy: idSchema.optional(),
    })
    .refine(
      (effect) =>
        effect.supersededBy === undefined || effect.status === 'superseded',
      'supersededBy requires superseded status',
    ),
  z.strictObject({
    type: z.literal('project_status_set'),
    status: projectStatusSchema,
    visibility: effectVisibilitySchema,
  }),
]);

export const evidenceDefinitionSchema = z.strictObject({
  id: idSchema,
  title: z.string(),
  sourceType: z.string(),
  sourceLabel: z.string(),
  content: z.string(),
  truthCompatibility: z.array(idSchema).optional(),
});
export const evidenceInstanceSchema = z
  .strictObject({
    evidenceId: idSchema,
    discoveredAtEventId: eventIdSchema,
    status: evidenceStatusSchema,
    supersededBy: idSchema.optional(),
  })
  .refine(
    (e) => e.supersededBy === undefined || e.status === 'superseded',
    'supersededBy requires superseded status',
  );

export const compareOperatorSchema = z.enum([
  'eq',
  'neq',
  'lt',
  'lte',
  'gt',
  'gte',
]);
export type TriggerCondition =
  | ({ op: 'eq' } & z.infer<typeof flagValueSchema>)
  | {
      meter: z.infer<typeof meterIdSchema>;
      op: z.infer<typeof compareOperatorSchema>;
      value: number;
    }
  | { projectStatus: z.infer<typeof projectStatusSchema> }
  | { trust: string; op: z.infer<typeof compareOperatorSchema>; value: number }
  | { evidenceDiscovered: string }
  | { evidenceStatus: string; status: z.infer<typeof evidenceStatusSchema> }
  | { eventCompleted: string }
  | { choiceSelected: string; eventId: string }
  | { ap: true; op: z.infer<typeof compareOperatorSchema>; value: number }
  | { all: TriggerCondition[] }
  | { any: TriggerCondition[] }
  | { not: TriggerCondition };
export const triggerConditionSchema: z.ZodType<TriggerCondition> = z.lazy(() =>
  z.union([
    ...flagBranches.map((branch) => branch.extend({ op: z.literal('eq') })),
    z.strictObject({
      meter: meterIdSchema,
      op: compareOperatorSchema,
      value: z.number().min(0).max(100),
    }),
    z.strictObject({ projectStatus: projectStatusSchema }),
    z.strictObject({
      trust: idSchema,
      op: compareOperatorSchema,
      value: z.number(),
    }),
    z.strictObject({ evidenceDiscovered: idSchema }),
    z.strictObject({ evidenceStatus: idSchema, status: evidenceStatusSchema }),
    z.strictObject({ eventCompleted: eventIdSchema }),
    z.strictObject({ choiceSelected: idSchema, eventId: eventIdSchema }),
    z.strictObject({
      ap: z.literal(true),
      op: compareOperatorSchema,
      value: z.number(),
    }),
    z.strictObject({ all: z.array(triggerConditionSchema) }),
    z.strictObject({ any: z.array(triggerConditionSchema) }),
    z.strictObject({ not: triggerConditionSchema }),
  ]),
);
export const reactiveEventRuleSchema = z.strictObject({
  eventId: eventIdSchema,
  when: triggerConditionSchema,
  once: z.boolean(),
  priority: z.number(),
});

const metadata = {
  judgment: pmJudgmentContributionSchema.optional(),
  pmpTags: pmpTagSetSchema.optional(),
  pmpLens: pmpLensContentSchema.optional(),
};
const discovery = {
  discoveryReflection: z
    .array(discoveryReflectionContributionSchema)
    .optional(),
};
const option = {
  id: idSchema,
  text: z.string(),
  detail: z.string().optional(),
};
export const choiceDefinitionSchema = z.strictObject({
  id: idSchema,
  text: z.string(),
  preview: z.string().optional(),
  effects: z.array(effectSchema),
  ...metadata,
  ...discovery,
  consequenceText: z.string().optional(),
});
export const rankingItemDefinitionSchema = z.strictObject({
  ...option,
  pmpLens: pmpLensContentSchema.optional(),
});
export const diagnosisOptionDefinitionSchema = rankingItemDefinitionSchema;
export const decisionPackageOptionDefinitionSchema = z.strictObject({
  ...option,
  ...metadata,
});
export const investigationIntentIdSchema = z.enum([
  'evidence',
  'impact',
  'alternatives',
  'compliance',
  'authority',
]);
export const investigationSourceDefinitionSchema = z.strictObject(option);
export const investigationIntentDefinitionSchema = z.strictObject({
  ...option,
  id: investigationIntentIdSchema,
});
export const lessonOptionDefinitionSchema = z.strictObject({
  ...option,
  ...metadata,
  ...discovery,
});
const base = { id: idSchema, decisionWeight: decisionWeightSchema.optional() };
export const eventInteractionSchema = z.discriminatedUnion('type', [
  z.strictObject({
    ...base,
    type: z.literal('single_choice'),
    choices: z.array(choiceDefinitionSchema).min(2),
  }),
  z
    .strictObject({
      ...base,
      type: z.literal('ranking'),
      items: z.array(rankingItemDefinitionSchema),
      rankCount: z.number().int().min(1),
    })
    .refine(
      (i) => i.rankCount <= i.items.length,
      'rankCount exceeds item count',
    ),
  z
    .strictObject({
      ...base,
      type: z.literal('evidence_diagnosis'),
      evidenceIds: z.array(idSchema),
      diagnosisOptions: z.array(diagnosisOptionDefinitionSchema),
      minEvidenceSelections: z.number().int().min(0),
      maxEvidenceSelections: z.number().int().min(0),
    })
    .refine(
      (i) =>
        i.minEvidenceSelections <= i.maxEvidenceSelections &&
        i.maxEvidenceSelections <= i.evidenceIds.length,
      'Invalid evidence selection cardinality',
    ),
  z.strictObject({
    ...base,
    type: z.literal('decision_package'),
    recommendations: z.array(decisionPackageOptionDefinitionSchema).min(1),
    reasons: z.array(decisionPackageOptionDefinitionSchema).min(1),
    nextSteps: z.array(decisionPackageOptionDefinitionSchema).min(1),
  }),
  z.strictObject({
    ...base,
    type: z.literal('investigation'),
    sources: z.array(investigationSourceDefinitionSchema),
    intents: z.array(investigationIntentDefinitionSchema),
  }),
  z
    .strictObject({
      ...base,
      type: z.literal('lessons_select'),
      lessons: z.array(lessonOptionDefinitionSchema),
      minSelections: z.number().int().min(0),
      maxSelections: z.number().int().min(0),
    })
    .refine(
      (i) =>
        i.minSelections <= i.maxSelections &&
        i.maxSelections <= i.lessons.length,
      'Invalid lesson selection cardinality',
    ),
]);
export const decisionSelectionSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('single_choice'), choiceId: idSchema }),
  z.strictObject({
    type: z.literal('ranking'),
    orderedItemIds: z.array(idSchema),
  }),
  z.strictObject({
    type: z.literal('evidence_diagnosis'),
    evidenceIds: z.array(idSchema),
    diagnosisId: idSchema,
  }),
  z.strictObject({
    type: z.literal('decision_package'),
    recommendationId: idSchema,
    reasonId: idSchema,
    nextStepId: idSchema,
  }),
  z.strictObject({
    type: z.literal('investigation'),
    sourceId: idSchema,
    intentId: investigationIntentIdSchema,
  }),
  z.strictObject({
    type: z.literal('lessons_select'),
    lessonIds: z.array(idSchema),
  }),
]);
export const eventDefinitionSchema = z.strictObject({
  id: eventIdSchema,
  scenarioId: idSchema,
  phaseId: idSchema,
  kind: z.enum([
    'core',
    'exploration',
    'reactive',
    'light',
    'crisis',
    'reflection',
  ]),
  title: z.string(),
  summary: z.string(),
  detail: z.string().optional(),
  availability: triggerConditionSchema.optional(),
  interaction: eventInteractionSchema,
  pmpTags: pmpTagSetSchema.optional(),
});
export const decisionRecordSchema = z.strictObject({
  eventId: eventIdSchema,
  interactionId: idSchema,
  selection: decisionSelectionSchema,
  decisionWeight: decisionWeightSchema,
  availableEvidenceIds: z.array(idSchema),
  pmJudgment: pmJudgmentContributionSchema.optional(),
  ...discovery,
  pmpTags: pmpTagSetSchema.optional(),
});
export const metaStateSchema = z.strictObject({
  playCount: z.number().int().min(0),
  bestScore: z.number().optional(),
  unlockedEndings: z.array(idSchema),
  discoveredEasterEggs: z.array(idSchema),
});

export type Effect = z.infer<typeof effectSchema>;
export type EvidenceDefinition = z.infer<typeof evidenceDefinitionSchema>;
export type EvidenceInstance = z.infer<typeof evidenceInstanceSchema>;
export type EvidenceStatus = z.infer<typeof evidenceStatusSchema>;
export type EffectVisibility = z.infer<typeof effectVisibilitySchema>;
export type CompareOperator = z.infer<typeof compareOperatorSchema>;
export type JudgmentRating = z.infer<typeof judgmentRatingSchema>;
export type JudgmentValue = JudgmentRating;
export type DecisionWeight = z.infer<typeof decisionWeightSchema>;
export type PMJudgmentDimension = keyof z.infer<
  typeof pmJudgmentContributionSchema
>;
export type PMJudgmentContribution = z.infer<
  typeof pmJudgmentContributionSchema
>;
export type DiscoveryReflectionContribution = z.infer<
  typeof discoveryReflectionContributionSchema
>;
export type DiscoveryReflectionKind = DiscoveryReflectionContribution['kind'];
export type DiscoveryReflectionRating =
  DiscoveryReflectionContribution['rating'];
export type PmpTagSet = z.infer<typeof pmpTagSetSchema>;
export type PmpLensContent = z.infer<typeof pmpLensContentSchema>;
export type PmpLensOptionNote = NonNullable<
  PmpLensContent['optionNotes']
>[number];
export type PmpObservation = z.infer<typeof pmpObservationSchema>;
export type PmpDomainAccumulator = z.infer<typeof pmpDomainAccumulatorSchema>;
export type ChoiceDefinition = z.infer<typeof choiceDefinitionSchema>;
export type EventInteraction = z.infer<typeof eventInteractionSchema>;
export type DecisionSelection = z.infer<typeof decisionSelectionSchema>;
export type DecisionRecord = z.infer<typeof decisionRecordSchema>;
export type EventDefinition = z.infer<typeof eventDefinitionSchema>;
export type EventKind = EventDefinition['kind'];
export type MetaState = z.infer<typeof metaStateSchema>;
export type ReactiveEventRule = z.infer<typeof reactiveEventRuleSchema>;
export type InvestigationIntentId = z.infer<typeof investigationIntentIdSchema>;
export type BaseEventInteraction = Pick<
  EventInteraction,
  'id' | 'decisionWeight'
>;
export type SingleChoiceInteraction = Extract<
  EventInteraction,
  { type: 'single_choice' }
>;
export type RankingInteraction = Extract<EventInteraction, { type: 'ranking' }>;
export type EvidenceDiagnosisInteraction = Extract<
  EventInteraction,
  { type: 'evidence_diagnosis' }
>;
export type DecisionPackageInteraction = Extract<
  EventInteraction,
  { type: 'decision_package' }
>;
export type InvestigationInteraction = Extract<
  EventInteraction,
  { type: 'investigation' }
>;
export type LessonsSelectInteraction = Extract<
  EventInteraction,
  { type: 'lessons_select' }
>;
export type RankingItemDefinition = z.infer<typeof rankingItemDefinitionSchema>;
export type DiagnosisOptionDefinition = z.infer<
  typeof diagnosisOptionDefinitionSchema
>;
export type DecisionPackageOptionDefinition = z.infer<
  typeof decisionPackageOptionDefinitionSchema
>;
export type InvestigationSourceDefinition = z.infer<
  typeof investigationSourceDefinitionSchema
>;
export type InvestigationIntentDefinition = z.infer<
  typeof investigationIntentDefinitionSchema
>;
export type LessonOptionDefinition = z.infer<
  typeof lessonOptionDefinitionSchema
>;
export type SingleChoiceSelection = Extract<
  DecisionSelection,
  { type: 'single_choice' }
>;
export type RankingSelection = Extract<DecisionSelection, { type: 'ranking' }>;
export type EvidenceDiagnosisSelection = Extract<
  DecisionSelection,
  { type: 'evidence_diagnosis' }
>;
export type DecisionPackageSelection = Extract<
  DecisionSelection,
  { type: 'decision_package' }
>;
export type InvestigationSelection = Extract<
  DecisionSelection,
  { type: 'investigation' }
>;
export type LessonsSelectSelection = Extract<
  DecisionSelection,
  { type: 'lessons_select' }
>;
export type MeterDeltaEffect = Extract<Effect, { type: 'meter_delta' }>;
export type TrustDeltaEffect = Extract<Effect, { type: 'trust_delta' }>;
export type FlagEqualsCondition = Extract<
  TriggerCondition,
  { flag: HiddenFlagKey }
>;
export type MeterCompareCondition = Extract<
  TriggerCondition,
  { meter: string }
>;
export type ProjectStatusCondition = Extract<
  TriggerCondition,
  { projectStatus: string }
>;
export type TrustCompareCondition = Extract<
  TriggerCondition,
  { trust: string }
>;
export type EvidenceDiscoveredCondition = Extract<
  TriggerCondition,
  { evidenceDiscovered: string }
>;
export type EvidenceStatusCondition = Extract<
  TriggerCondition,
  { evidenceStatus: string }
>;
export type EventCompletedCondition = Extract<
  TriggerCondition,
  { eventCompleted: string }
>;
export type ChoiceSelectedCondition = Extract<
  TriggerCondition,
  { choiceSelected: string }
>;
export type APCompareCondition = Extract<TriggerCondition, { ap: true }>;
export type AllCondition = Extract<
  TriggerCondition,
  { all: TriggerCondition[] }
>;
export type AnyCondition = Extract<
  TriggerCondition,
  { any: TriggerCondition[] }
>;
export type NotCondition = Extract<TriggerCondition, { not: TriggerCondition }>;
export type APDeltaEffect = Extract<Effect, { type: 'ap_delta' }>;
export type EvidenceAddEffect = Extract<Effect, { type: 'evidence_add' }>;
export type EvidenceStatusSetEffect = Extract<
  Effect,
  { type: 'evidence_status_set' }
>;
export type ProjectStatusSetEffect = Extract<
  Effect,
  { type: 'project_status_set' }
>;
