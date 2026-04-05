/**
 * GameRoundScreen — core gameplay loop.
 *
 * State machine per player:
 *   WAITING → (PlayerTurnBanner) → REVEALING → (ShakeRevealCard | FlipRevealCard) → next
 *
 * After all players reveal, automatically navigates to RoundSummaryScreen.
 */
import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, BackHandler, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { RevealMode, GamePhase } from '../types/game.types';
import { useGameEngine } from '../hooks/useGameEngine';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { ShakeRevealCard } from '../components/game/ShakeRevealCard';
import { FlipRevealCard } from '../components/game/FlipRevealCard';
import { Header } from '../components/common/Header';

type GameNav = NativeStackNavigationProp<RootStackParamList, 'GameRound'>;

export function GameRoundScreen() {
  const navigation = useNavigation<GameNav>();
  const {
    state,
    currentPlayer,
    isLastPlayer,
    totalPlayers,
    revealCurrentPlayer,
    advanceToNextPlayer,
  } = useGameEngine();

  // Prevent accidental quitting via hardware back or header back
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (
        e.data.action.type === 'REPLACE' &&
        (e.data.action.payload as any)?.name === 'RoundSummary'
      ) {
        return;
      }

      e.preventDefault();

      Alert.alert(
        'Quit Game?',
        'Are you sure you want to end the current game and go back?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => {} },
          {
            text: 'Quit',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation]);

  // Navigate to summary when discussion phase starts
  useEffect(() => {
    if (state.phase === GamePhase.DISCUSSION) {
      navigation.replace('RoundSummary');
    }
  }, [state.phase, navigation]);

  const handleRevealDone = useCallback(() => {
    revealCurrentPlayer();
    advanceToNextPlayer();
  }, [revealCurrentPlayer, advanceToNextPlayer]);

  if (!currentPlayer) {
    return null;
  }

  const currentIndex = state.currentPlayerIndex;
  const revealMode = state.config.revealMode;
  const isShakeMode = revealMode === RevealMode.SHAKE;

  // Playful greetings
  const greetings = ['Hey', 'Psst', 'Yo', 'Alright', 'Okay'];
  const greeting = greetings[currentIndex % greetings.length];

  return (
    <View style={styles.container}>
      <Header title="SpyWho" showBack />
      
      <View style={styles.topSection}>
        {/* Progress Dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: totalPlayers }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < currentIndex
                  ? styles.dotDone
                  : i === currentIndex
                  ? styles.dotActive
                  : styles.dotPending,
              ]}
            />
          ))}
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>
          {greeting}, <Text style={styles.playerName}>{currentPlayer.name}</Text> 👋
        </Text>

        {/* Instruction */}
        <Text style={styles.instruction}>
          {isShakeMode
            ? 'Shake your phone to see your card — no peeking by others!'
            : 'Tap the card to see your word — close it before passing!'}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        {isShakeMode ? (
          <ShakeRevealCard
            key={`shake-${currentIndex}`}
            word={currentPlayer.assignedWord}
            isSpy={currentPlayer.isSpy}
            shakeThreshold={state.config.shakeThreshold}
            onDone={handleRevealDone}
            playerName={currentPlayer.name}
          />
        ) : (
          <FlipRevealCard
            key={`flip-${currentIndex}`}
            word={currentPlayer.assignedWord}
            isSpy={currentPlayer.isSpy}
            onDone={handleRevealDone}
            playerName={currentPlayer.name}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.xxxl,
    gap: Spacing.md,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderCurve: 'continuous',
  },
  dotDone: {
    backgroundColor: Colors.primary,
    opacity: 0.35,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 28,
    borderRadius: Radius.round,
    borderCurve: 'continuous',
  },
  dotPending: {
    backgroundColor: Colors.border,
  },
  greeting: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  playerName: {
    color: Colors.primary,
  },
  instruction: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  cardContainer: {
    flex: 1,
  },
});
