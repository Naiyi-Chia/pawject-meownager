import type { MeterId, ProjectStatus } from './registries';

// The spec locks domain ownership, but not final child fields. Generic domain
// parameters let later approved tickets supply those fields without pretending
// an unrestricted dictionary is the final runtime state schema.
export type RunState = object;
export type WorldState = object;
export type PlayerState = object;
export type EvidenceState = object;
export type ScoringState = object;
export interface ProjectState {
  meters: Record<MeterId, number>;
  status: ProjectStatus;
}
export interface StateDomains {
  run: RunState;
  project: ProjectState;
  world: WorldState;
  player: PlayerState;
  evidence: EvidenceState;
  scoring: ScoringState;
}
export type GameState<Domains extends StateDomains = StateDomains> = {
  [K in keyof StateDomains]: Domains[K];
};
