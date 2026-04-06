/**
 * GameContext — global game state managed via React Context + useReducer.
 *
 * Provides the single source of truth for the entire game lifecycle.
 * All screens read from this context; mutations happen through dispatched actions.
 */
import React, { createContext, useContext, useReducer, useMemo, type ReactNode } from 'react';
import {
  GameState,
  GameAction,
  GamePhase,
} from '../types/game.types';
import { INITIAL_GAME_STATE } from '../constants/defaults';

// ─── Reducer ────────────────────────────────────────────────────────────────

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_CONFIG':
      return {
        ...state,
        config: { ...state.config, ...action.payload },
      };

    case 'SET_PLAYERS':
      return {
        ...state,
        players: action.payload,
        phase: GamePhase.NAMING,
      };

    case 'START_GAME':
      return {
        ...state,
        players: action.payload.players,
        secretWord: action.payload.secretWord,
        currentPlayerIndex: 0,
        phase: GamePhase.REVEALING,
        config: { ...state.config, previousPlayerNames: action.payload.players.map(p => p.name) },
      };

    case 'REVEAL_CURRENT': {
      const updatedPlayers = state.players.map((player, index) =>
        index === state.currentPlayerIndex
          ? { ...player, hasRevealed: true }
          : player,
      );
      return {
        ...state,
        players: updatedPlayers,
      };
    }

    case 'NEXT_PLAYER': {
      const nextIndex = state.currentPlayerIndex + 1;
      const allRevealed = nextIndex >= state.players.length;
      return {
        ...state,
        currentPlayerIndex: allRevealed ? state.currentPlayerIndex : nextIndex,
        phase: allRevealed ? GamePhase.DISCUSSION : state.phase,
      };
    }

    case 'FINISH_ROUND':
      return {
        ...state,
        phase: GamePhase.RESULT,
      };

    case 'RESET':
      return {
        ...INITIAL_GAME_STATE,
        config: { ...INITIAL_GAME_STATE.config, previousPlayerNames: state.config.previousPlayerNames },
      };

    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────────────────────

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * Access the game context. Must be called within a GameProvider.
 */
export function useGameContext(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
