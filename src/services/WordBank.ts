/**
 * WordBank service — responsible for selecting random words from the pool.
 *
 * Pure functions with no React dependencies.
 * Merges built-in category words with user-supplied custom words.
 */
import { Category } from '../types/game.types';
import { WORD_BANK } from '../constants/categories';
import { randomPick, shuffle } from '../utils/random';

/**
 * Build a combined word pool from selected categories + custom words.
 * Returns a shuffled copy to avoid ordering bias.
 */
export function buildWordPool(
  selectedCategories: Category[],
  customWords: string[] = [],
): string[] {
  const categoryWords = selectedCategories.flatMap(
    (category) => WORD_BANK[category] ?? [],
  );
  const pool = [...categoryWords, ...customWords];
  return shuffle(pool);
}

/**
 * Pick a single random word from the eligible pool.
 *
 * @param selectedCategories - active categories
 * @param customWords - user-added words
 * @param excludeWords - words to exclude (e.g. already used this session)
 * @throws if the pool is empty after exclusions
 */
export function getRandomWord(
  selectedCategories: Category[],
  customWords: string[] = [],
  excludeWords: Set<string> = new Set(),
): string {
  const pool = buildWordPool(selectedCategories, customWords);
  const filtered = pool.filter((word) => !excludeWords.has(word));

  if (filtered.length === 0) {
    // Fallback: if everything has been used, reset and pick from the full pool
    if (pool.length === 0) {
      throw new Error(
        'No words available. Select at least one category or add custom words.',
      );
    }
    return randomPick(pool);
  }

  return randomPick(filtered);
}
