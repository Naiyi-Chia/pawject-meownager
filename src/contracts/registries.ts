export const meterIds = [
  'schedule',
  'cost',
  'team',
  'risk',
  'stakeholder',
] as const;
export type MeterId = (typeof meterIds)[number];
export interface MeterDefinition {
  id: MeterId;
  min: 0;
  max: 100;
  higherIsBetter: boolean;
}
export const meterRegistry: readonly MeterDefinition[] = meterIds.map((id) => ({
  id,
  min: 0,
  max: 100,
  higherIsBetter: id !== 'risk',
}));
export const projectStatuses = [
  'on_track',
  'at_risk',
  'critical',
  'uncertain',
] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

export const scenario01InitialHiddenFlags = {
  information_integrity: 'degraded',
  speak_up_safety: 'low',
  overtime_pressure: 'high',
  baseline_alignment: 'misaligned',
} as const;
export interface Scenario01HiddenFlags {
  information_integrity: 'healthy' | 'degraded' | 'distorted';
  speak_up_safety: 'low' | 'medium' | 'high';
  overtime_pressure: 'low' | 'medium' | 'high';
  baseline_alignment: 'aligned' | 'uncertain' | 'misaligned';
}
export type HiddenFlagKey = keyof Scenario01HiddenFlags;
export type HiddenFlagValue<K extends HiddenFlagKey> = Scenario01HiddenFlags[K];
export type HiddenFlagDefinition =
  | { key: string; type: 'boolean'; default: boolean; description: string }
  | {
      key: string;
      type: 'enum';
      values: readonly string[];
      default: string;
      description: string;
    }
  | {
      key: string;
      type: 'number';
      min: number;
      max: number;
      default: number;
      description: string;
    };
export const hiddenFlagRegistry: readonly HiddenFlagDefinition[] = [
  {
    key: 'information_integrity',
    type: 'enum',
    values: ['healthy', 'degraded', 'distorted'],
    default: 'degraded',
    description: 'Integrity of available project information.',
  },
  {
    key: 'speak_up_safety',
    type: 'enum',
    values: ['low', 'medium', 'high'],
    default: 'low',
    description: 'Safety of surfacing bad news.',
  },
  {
    key: 'overtime_pressure',
    type: 'enum',
    values: ['low', 'medium', 'high'],
    default: 'high',
    description: 'Sustained overtime pressure on Engineering.',
  },
  {
    key: 'baseline_alignment',
    type: 'enum',
    values: ['aligned', 'uncertain', 'misaligned'],
    default: 'misaligned',
    description: 'Alignment of the working project baseline.',
  },
];

export const pmpSkillsByDomain = {
  people: [
    'team_leadership',
    'psychological_safety',
    'conflict',
    'stakeholder_engagement',
    'communication',
  ],
  process: [
    'schedule',
    'cost',
    'requirements',
    'baseline',
    'change',
    'risk',
    'procurement',
    'quality',
    'evidence',
    'issue_management',
  ],
  business_environment: [
    'governance',
    'compliance',
    'value',
    'sustainability',
    'external_impact',
    'escalation',
  ],
} as const;
export type PmpDomain = keyof typeof pmpSkillsByDomain;
export type PmpSkillId = (typeof pmpSkillsByDomain)[PmpDomain][number];
export interface PmpSkillDefinition {
  id: PmpSkillId;
  domain: PmpDomain;
}
export const pmpSkillRegistry: readonly PmpSkillDefinition[] = Object.entries(
  pmpSkillsByDomain,
).flatMap(([domain, skills]) =>
  skills.map((id) => ({ id, domain: domain as PmpDomain })),
);
// Scenario-specific targets/bounds/defaults are supplied by approved content.
export interface RelationshipDefinition {
  id: string;
  min?: number;
  max?: number;
  default?: number;
}
