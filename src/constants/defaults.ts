/**
 * Default configuration values for a new game session.
 */
import { Category, GameConfig, GamePhase, GameState, RevealMode } from '../types/game.types';

export const DEFAULT_CONFIG: GameConfig = {
  playerCount: 4,
  spyCount: 1,
  selectedCategories: Object.values(Category),
  customWords: [],
  timerSeconds: 60,
  revealMode: RevealMode.SHAKE,
  shakeThreshold: 1,
  isMarlMode: false,
  isVotingMode: false,
};

export const INITIAL_GAME_STATE: GameState = {
  config: DEFAULT_CONFIG,
  players: [],
  secretWord: '',
  currentPlayerIndex: 0,
  phase: GamePhase.SETUP,
};

// ─── Constraints ────────────────────────────────────────────────────────────

export const PLAYER_COUNT_MIN = 3;
export const PLAYER_COUNT_MAX = 20;

export const SPY_COUNT_MIN = 1;

/** Spy count must be at most playerCount - 2 (need at least 2 non-spies) */
export const getSpyCountMax = (playerCount: number): number =>
  Math.max(1, playerCount - 2);

export const TIMER_MIN_SECONDS = 15;
export const TIMER_MAX_SECONDS = 300;
export const TIMER_STEP_SECONDS = 15;

export const SHAKE_THRESHOLD_MIN = 1;
export const SHAKE_THRESHOLD_MAX = 10;
