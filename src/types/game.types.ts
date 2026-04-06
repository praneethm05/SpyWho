/**
 * Core domain types for the SpyWho game.
 * All game logic and UI components depend on these definitions.
 */

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum RevealMode {
  SHAKE = 'shake',
  CARD = 'card',
}

export enum Category {
  PLACES = 'places',
  SPORTS = 'sports',
  OBJECTS = 'objects',
  FOOD = 'food',
  MOVIES = 'movies',
  ANIMALS = 'animals',
}

export enum GamePhase {
  SETUP = 'setup',
  NAMING = 'naming',
  REVEALING = 'revealing',
  DISCUSSION = 'discussion',
  VOTING = 'voting',
  RESULT = 'result',
}

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Player {
  /** Unique identifier for the player within a game session */
  id: string;
  /** Display name entered during the naming phase */
  name: string;
  /** Whether this player has been assigned the spy role */
  isSpy: boolean;
  /** Whether this player has revealed their card during the current round */
  hasRevealed: boolean;
  /** The word shown to this player — the secret word or a spy marker */
  assignedWord: string;
}

export interface GameConfig {
  /** Total number of players (min 3, max 20) */
  playerCount: number;
  /** Number of spies in the game (min 1, max playerCount - 2) */
  spyCount: number;
  /** Which word categories are active */
  selectedCategories: Category[];
  /** User-added custom words that join the word pool */
  customWords: string[];
  /** Discussion timer in seconds */
  timerSeconds: number;
  /** How players reveal their word */
  revealMode: RevealMode;
  /** Number of shakes required to reveal (only relevant in shake mode) */
  shakeThreshold: number;
  /** MARL mode (random chance of all spies) */
  isMarlMode: boolean;
  /** Whether to enable a voting round before the final reveal */
  isVotingMode: boolean;
  /** Stores player names from the last game to re-use or default to */
  previousPlayerNames: string[];
}

export interface GameState {
  /** Current game configuration */
  config: GameConfig;
  /** All players with their assigned roles and words */
  players: Player[];
  /** The actual secret word for this round (non-spies see this) */
  secretWord: string;
  /** Index into the players array for the current turn */
  currentPlayerIndex: number;
  /** Current phase of the game lifecycle */
  phase: GamePhase;
}

// ─── Action Types ────────────────────────────────────────────────────────────

export type GameAction =
  | { type: 'SET_CONFIG'; payload: Partial<GameConfig> }
  | { type: 'SET_PLAYERS'; payload: Player[] }
  | { type: 'START_GAME'; payload: { players: Player[]; secretWord: string } }
  | { type: 'REVEAL_CURRENT' }
  | { type: 'NEXT_PLAYER' }
  | { type: 'FINISH_ROUND' }
  | { type: 'RESET' };
