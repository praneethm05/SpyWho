/**
 * Randomness utilities.
 * All functions are pure and immutable — they return new arrays.
 */

/**
 * Fisher-Yates shuffle — returns a new shuffled copy of the array.
 * O(n) time, O(n) space.
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Pick a random element from a non-empty array.
 * Throws if the array is empty.
 */
export function randomPick<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot pick from an empty array');
  }
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a v4-style UUID using Math.random().
 * Suitable for ephemeral in-session player IDs — not cryptographically secure.
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
