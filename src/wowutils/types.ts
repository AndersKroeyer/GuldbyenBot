import { PlayerClass, PlayerSpec } from "../genericWowTypes";

/**
 * Raid difficulty levels
 */
export type Difficulty = "lfr" | "normal" | "heroic" | "mythic";

/**
 * Access levels for raid assignments
 */
export type AccessLevel = "Private" | "Public" | "Guild";

/**
 * Individual roster member
 */
export interface RosterMember {
  name: string;
  playerClass: PlayerClass;
  playerSpec: PlayerSpec;
  hexColor: string;
}

/**
 * Assignment pack toggles
 */
export interface AssignmentPackToggles {
  NorthernSky: boolean;
  InterruptAnchor: boolean;
  Liquid: boolean;
  Generic: boolean;
}

/**
 * Individual row within a block
 */
export interface AssignmentRow {
  rowId: string;
  cellValues: string[]; // Array of player names
}

/**
 * Block containing multiple rows of assignments
 */
export interface AssignmentBlock {
  blockId: string;
  rows: AssignmentRow[];
}

/**
 * Checkbox settings configuration
 */
export interface CheckboxSettings {
  packToggles: AssignmentPackToggles;
  disableNorthernSky: boolean;
  disableLiquid: boolean;
}

/**
 * Main raid assignment document structure
 */
export interface RaidAssignment {
  _id: string;
  bossName: string;
  raidSlug: string;
  difficulty: Difficulty;
  assignments: any[]; // Array type unknown from the data, appears to be empty
  createdBy: string; // User ID
  accessLevel: AccessLevel;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  roster: RosterMember[];
  groupId: string;
  customName: string;
  assignmentPackToggles: AssignmentPackToggles;
  blocks: AssignmentBlock[];
  checkboxSettings: CheckboxSettings;
}

/**
 * Type guard to check if an object is a valid RaidAssignment
 */
export function isRaidAssignment(obj: any): obj is RaidAssignment {
  return (
    typeof obj === 'object' &&
    typeof obj._id === 'string' &&
    typeof obj.bossName === 'string' &&
    typeof obj.raidSlug === 'string' &&
    typeof obj.difficulty === 'string' &&
    Array.isArray(obj.assignments) &&
    typeof obj.createdBy === 'string' &&
    typeof obj.accessLevel === 'string' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string' &&
    Array.isArray(obj.roster) &&
    typeof obj.groupId === 'string' &&
    typeof obj.customName === 'string' &&
    typeof obj.assignmentPackToggles === 'object' &&
    Array.isArray(obj.blocks) &&
    typeof obj.checkboxSettings === 'object'
  );
}

/**
 * Utility type for API responses that might contain raid assignments
 */
export interface RaidAssignmentResponse {
  data: RaidAssignment;
  status: 'success' | 'error';
  message?: string;
}

/**
 * Utility type for lists of raid assignments
 */
export interface RaidAssignmentList {
  assignments: RaidAssignment[];
  total: number;
  page?: number;
  limit?: number;
}

// Player info (already similar to RosterMember, but includes realm)
export interface ApiPlayer {
  name: string;
  realm: string;
  playerClass: string;
  playerSpec: string;
  hexColor: string;
}

// Spec info
export interface ApiSpec {
  name: string;
}

// Boss assignment entry
export interface BossAssignmentEntry {
  player: ApiPlayer;
  spec: ApiSpec;
  note: string;
}

// Boss assignments: boss slug -> array of assignments
export type BossAssignments = Record<string, BossAssignmentEntry[]>;

// Active status: player slug -> boolean
export type ActiveStatus = Record<string, boolean>;

// Boss status: boss slug -> boolean
export type BossStatus = Record<string, boolean>;

// Roster entry (same as ApiPlayer)
export type ApiRosterEntry = ApiPlayer;

// Boss cooldown note refs: boss slug -> string
export type BossCooldownNoteRefs = Record<string, string>;

// Boss assignment refs: boss slug -> string
export type BossAssignmentRefs = Record<string, string>;

// Setup object
export interface ApiSetup {
  id: number;
  name: string;
  bossAssignments: BossAssignments;
  activeStatus: ActiveStatus;
  bossStatus: BossStatus;
  roster: ApiRosterEntry[];
  difficulty: string;
  bossCooldownNoteRefs: BossCooldownNoteRefs;
  bossAssignmentRefs: BossAssignmentRefs;
}

// Data object
export interface ApiData {
  setups: ApiSetup[];
}

// Root API response
export interface ApiAssignmentResponse {
  _id: string;
  groupId: string;
  creatorId: string;
  name: string;
  data: ApiData;
  createdAt: string;
  updatedAt: string;
}