/**
 * useGameEngine — high-level game orchestration hook.
 *
 * Composes GameContext dispatches with service calls to provide
 * a clean API for screens to drive the game lifecycle.
 */
import { useCallback, useRef } from 'react';
import { useGameContext } from '../context/GameContext';
import { getRandomWord } from '../services/WordBank';
import { createPlayers, assignRoles } from '../services/GameAssigner';
import { GamePhase } from '../types/game.types';

export function useGameEngine() {
  const { state, dispatch } = useGameContext();
  const usedWordsRef = useRef<Set<string>>(new Set());

  /**
   * Initialize a new game: create players, pick a word, assign roles.
   * Transitions the game to the REVEALING phase.
   */
  const initializeGame = useCallback(
    (playerNames: string[]) => {
      const secretWord = getRandomWord(
        state.config.selectedCategories,
        state.config.customWords,
        usedWordsRef.current,
      );

      // Track the word so it won't repeat in back-to-back games
      usedWordsRef.current.add(secretWord);

      const players = createPlayers(playerNames);
      // 3. Assign roles
      const isMarlTriggered = state.config.isMarlMode && Math.random() < 0.25;
      
      let assignedPlayers;
      if (isMarlTriggered) {
        // Everyone is a spy!
        assignedPlayers = players.map(p => ({
          ...p,
          isSpy: true,
          assignedWord: '',
          hasRevealed: false,
        }));
      } else {
        assignedPlayers = assignRoles(
          players,
          state.config.spyCount,
          secretWord,
        );
      }

      dispatch({
        type: 'START_GAME',
        payload: { players: assignedPlayers, secretWord },
      });
    },
    [state.config, dispatch],
  );

  /**
   * Mark the current player as having revealed their word.
   */
  const revealCurrentPlayer = useCallback(() => {
    dispatch({ type: 'REVEAL_CURRENT' });
  }, [dispatch]);

  /**
   * Advance to the next player, or finish the round if all have revealed.
   */
  const advanceToNextPlayer = useCallback(() => {
    dispatch({ type: 'NEXT_PLAYER' });
  }, [dispatch]);

  /**
   * End the discussion phase and move to results.
   */
  const finishRound = useCallback(() => {
    dispatch({ type: 'FINISH_ROUND' });
  }, [dispatch]);

  /**
   * Reset the entire game back to setup.
   */
  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  // ─── Derived state ──────────────────────────────────────────────────────

  const currentPlayer = state.players[state.currentPlayerIndex] ?? null;
  const isRoundComplete = state.phase === GamePhase.DISCUSSION || state.phase === GamePhase.RESULT;
  const isLastPlayer = state.currentPlayerIndex >= state.players.length - 1;
  const totalPlayers = state.players.length;
  const revealedCount = state.players.filter((p) => p.hasRevealed).length;

  return {
    state,
    currentPlayer,
    isRoundComplete,
    isLastPlayer,
    totalPlayers,
    revealedCount,
    initializeGame,
    revealCurrentPlayer,
    advanceToNextPlayer,
    finishRound,
    resetGame,
  };
}
