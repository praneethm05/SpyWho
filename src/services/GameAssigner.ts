/**
 * GameAssigner — assigns roles and words to players.
 *
 * Pure functions with no React dependencies.
 * Responsible for the core "who is the spy?" logic.
 */
import { Player } from '../types/game.types';
import { shuffle, generateId } from '../utils/random';

/**
 * Create the initial player roster from names.
 * Players start with no role or word assigned.
 */
export function createPlayers(names: string[]): Player[] {
  return names.map((name) => ({
    id: generateId(),
    name,
    isSpy: false,
    hasRevealed: false,
    assignedWord: '',
  }));
}

/**
 * Assign roles and words to players.
 *
 * @param players   - the player roster (will not be mutated)
 * @param spyCount  - how many spies to assign
 * @param secretWord - the word that non-spies receive
 * @returns a new array of players with roles and words assigned
 *
 * The spy selection uses Fisher-Yates shuffle on indices for unbiased randomness.
 * Spy players receive an empty assignedWord — the UI layer shows the spy message.
 */
export function assignRoles(
  players: Player[],
  spyCount: number,
  secretWord: string,
): Player[] {
  // Validate constraints
  const clampedSpyCount = Math.min(spyCount, players.length - 2);
  if (clampedSpyCount < 1) {
    throw new Error('Need at least 3 players to have 1 spy and 2 non-spies.');
  }

  // Shuffle indices to randomly pick spies
  const indices = players.map((_, i) => i);
  const shuffledIndices = shuffle(indices);
  const spyIndices = new Set(shuffledIndices.slice(0, clampedSpyCount));

  return players.map((player, index) => ({
    ...player,
    isSpy: spyIndices.has(index),
    assignedWord: spyIndices.has(index) ? '' : secretWord,
    hasRevealed: false,
  }));
}
