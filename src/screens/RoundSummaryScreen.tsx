/**
 * RoundSummaryScreen — post-round screen with discussion timer and spy reveal.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView, AppState } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { useGameEngine } from '../hooks/useGameEngine';
import { useCountdownTimer } from '../hooks/useCountdownTimer';
import { Colors, Spacing, Typography, Radius, Shadows } from '../constants/theme';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Ghost, BellSlash, Fingerprint } from 'phosphor-react-native';
import { Header } from '../components/common/Header';
import { VotingPhase } from '../components/game/VotingPhase';
import { startAlarm, stopAlarm, playClickSound } from '../utils/sound';

type SummaryNav = NativeStackNavigationProp<RootStackParamList, 'RoundSummary'>;

export function RoundSummaryScreen() {
  const navigation = useNavigation<SummaryNav>();
  const insets = useSafeAreaInsets();
  const { state, finishRound, initializeGame } = useGameEngine();
  const [spyRevealed, setSpyRevealed] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  
  // Voting state
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, string[]>>({}); // VoterID -> SuspectIDs[]
  const [isVotingFinished, setIsVotingFinished] = useState(!state.config.isVotingMode);

  const { formattedTime, isRunning, start, pause } = useCountdownTimer({
    durationSeconds: state.config.timerSeconds,
    onComplete: () => {
      console.log('--- [SCREEN] TIMER ENDED - STARTING ALARM ---');
      setIsAlarmActive(true);
      startAlarm();
    },
  });

  const handleStopAlarm = useCallback(() => {
    setIsAlarmActive(false);
    stopAlarm();
  }, []);

  // Auto-start the timer on mount
  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle background behavior and component unmount
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState !== 'active') {
        handleStopAlarm();
      }
    });

    return () => {
      subscription.remove();
      handleStopAlarm(); // Stops alarm when unmounting
    };
  }, [handleStopAlarm]);

  // Reveal animation
  const revealScale = useRef(new Animated.Value(0.5)).current;
  const revealOpacity = useRef(new Animated.Value(0)).current;

  const handleRevealSpy = useCallback(() => {
    setIsAlarmActive(false);
    stopAlarm();
    setSpyRevealed(true);
    pause();
    finishRound();

    Animated.parallel([
      Animated.spring(revealScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 8,
        bounciness: 12,
      }),
      Animated.timing(revealOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pause, finishRound, revealScale, revealOpacity]);

  const handlePlayAgain = useCallback(() => {
    setIsAlarmActive(false);
    stopAlarm();
    
    // Reuse current names
    const names = state.players.map(p => p.name);
    initializeGame(names);
    
    // Jump straight back to reveal, with Home in history
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: 'Home' }, { name: 'GameRound' }],
      }),
    );
  }, [state.players, initializeGame, navigation]);

  const handleReSetup = useCallback(() => {
    setIsAlarmActive(false);
    stopAlarm();
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: 'Home' }, { name: 'Setup' }],
      }),
    );
  }, [navigation]);

  const handleCastVote = useCallback((suspectIds: string[]) => {
    const voterId = state.players[currentVoterIndex].id;
    setVotes(prev => ({ ...prev, [voterId]: suspectIds }));

    if (currentVoterIndex < state.players.length - 1) {
      setCurrentVoterIndex(prev => prev + 1);
    } else {
      setIsVotingFinished(true);
    }
  }, [currentVoterIndex, state.players]);

  const getVoteTally = () => {
    const tally: Record<string, number> = {};
    Object.values(votes).forEach(suspectIds => {
      suspectIds.forEach(suspectId => {
        tally[suspectId] = (tally[suspectId] || 0) + 1;
      });
    });
    return tally;
  };

  const tally = getVoteTally();
  const topSuspectId = Object.keys(tally).reduce((a, b) => (tally[a] > tally[b] ? a : b), '');
  const topSuspect = state.players.find(p => p.id === topSuspectId);

  const spies = state.players.filter((p) => p.isSpy);
  const nonSpies = state.players.filter((p) => !p.isSpy);

  return (
    <View style={styles.screen}>
      <Header title="Results" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, Spacing.massive) }
        ]}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Timer ── */}
        <Card elevation="lg" style={[styles.timerCard, isAlarmActive && styles.alarmRinging]}>
          <Text style={styles.timerLabel}>
            {isAlarmActive ? 'Time is up!' : (isRunning ? 'Time Remaining' : 'Timer Paused')}
          </Text>
          <Text style={styles.timerValue}>{isAlarmActive ? '0:00' : formattedTime}</Text>
          <View style={styles.timerActions}>
            {isAlarmActive ? (
              <Button 
                title="Stop Alarm" 
                onPress={handleStopAlarm} 
                variant="danger" 
                size="sm" 
              />
            ) : isRunning ? (
              <Button 
                title="Pause" 
                onPress={pause} 
                variant="ghost" 
                size="sm" 
                textColor="#FFFFFF" 
              />
            ) : (
              <Button 
                title="Resume" 
                onPress={start} 
                variant="secondary" 
                size="sm" 
              />
            )}
          </View>
        </Card>

        <Text style={styles.hint}>
          Discuss and debate — figure out who the spy is!{"\n"}The spy blends in without knowing the word.
        </Text>

        {/* ── Voting Round ── */}
        {!isVotingFinished && (
          <VotingPhase
            voterName={state.players[currentVoterIndex].name}
            voterId={state.players[currentVoterIndex].id}
            players={state.players}
            onVote={handleCastVote}
            maxVotes={state.config.spyCount}
          />
        )}

        {/* ── Verdict Summary (if finished voting) ── */}
        {isVotingFinished && !spyRevealed && state.config.isVotingMode && (
          <Card elevation="md" style={styles.verdictCard}>
             <Fingerprint size={48} color={Colors.primary} weight="duotone" />
             <Text style={styles.verdictTitle}>The Verdict</Text>
             <View style={styles.tallyList}>
               {state.players.map(p => {
                 const count = tally[p.id] || 0;
                 if (count === 0) return null;
                 return (
                   <View key={p.id} style={styles.tallyRow}>
                     <Text style={styles.tallyName}>{p.name}</Text>
                     <View style={styles.tallyBadge}>
                        <Text style={styles.tallyCount}>{count} {count === 1 ? 'vote' : 'votes'}</Text>
                     </View>
                   </View>
                 );
               })}
             </View>
             {topSuspect && (
               <Text style={styles.verdictCaption}>
                 The majority suspects <Text style={{ color: Colors.primary }}>{topSuspect.name}</Text>!
               </Text>
             )}
          </Card>
        )}

        {/* ── Reveal Spy Button ── */}
        {isVotingFinished && !spyRevealed && (
          <Button
            title="Reveal the Truth"
            onPress={handleRevealSpy}
            variant="danger"
            size="lg"
            fullWidth
          />
        )}

        {/* ── Spy Reveal Card ── */}
        {spyRevealed && (
          <Animated.View
            style={[
              styles.revealContainer,
              {
                opacity: revealOpacity,
                transform: [{ scale: revealScale }],
              },
            ]}
          >
            <Card elevation="lg" style={styles.spyRevealCard}>
              <Ghost size={64} color={Colors.textOnPrimary} weight="duotone" />
              <Text style={styles.revealTitle}>
                {nonSpies.length === 0 ? 'MARL Mode Chaos! 🔥' : 'The Spy was...'}
              </Text>
              
              {nonSpies.length === 0 ? (
                <View style={styles.spyNameBadge}>
                   <Text style={styles.spyName}>Everyone!</Text>
                </View>
              ) : (
                spies.map((spy) => (
                  <View key={spy.id} style={styles.spyNameBadge}>
                    <Text style={styles.spyName}>{spy.name}</Text>
                  </View>
                ))
              )}

              {nonSpies.length > 0 && (
                <View style={styles.wordRevealSection}>
                  <Text style={styles.wordRevealLabel}>The secret word was</Text>
                  <Text style={styles.wordRevealValue}>{state.secretWord}</Text>
                </View>
              )}

              {nonSpies.length === 0 && (
                <View style={[styles.wordRevealSection, { borderTopWidth: 0 }]}>
                  <Text style={styles.wordRevealLabel}>No one knew the word!</Text>
                </View>
              )}
            </Card>

            {/* ── Player Summary ── */}
            <Card elevation="md" style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Players</Text>
              {nonSpies.map((player) => (
                <View key={player.id} style={styles.playerRow}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerWord}>{player.assignedWord}</Text>
                </View>
              ))}
              {spies.map((spy) => (
                <View key={spy.id} style={[styles.playerRow, styles.spyRow]}>
                  <Text style={[styles.playerName, styles.spyPlayerName]}>
                    {spy.name}
                  </Text>
                  <View style={styles.spyBadge}>
                    <Text style={styles.spyBadgeText}>SPY</Text>
                  </View>
                </View>
              ))}
            </Card>

            <View style={styles.actionRow}>
              <Button
                title="Play Again"
                onPress={handlePlayAgain}
                size="lg"
                style={{ flex: 2 }}
              />
              <Button
                title="Setup"
                onPress={handleReSetup}
                variant="ghost"
                size="lg"
                textColor={Colors.textSecondary}
              />
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.massive,
    gap: Spacing.xl,
  },
  screenTitle: {
    ...Typography.h1,
    display: 'none', // Removed in favor of Header component
  },
  // ── Timer ──
  timerCard: {
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.primary,
  },
  alarmRinging: {
    backgroundColor: Colors.spy,
  },
  timerLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Fredoka-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerValue: {
    fontSize: 64,
    fontFamily: 'Fredoka-Bold',
    color: Colors.textOnPrimary,
    letterSpacing: 2,
  },
  timerActions: {
    marginTop: Spacing.xs,
  },
  hint: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.lg,
  },
  // ── Spy Reveal ──
  revealContainer: {
    gap: Spacing.xl,
  },
  spyRevealCard: {
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: Colors.spy,
  },
  revealTitle: {
    ...Typography.h2,
    color: Colors.textOnPrimary,
  },
  spyNameBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.round,
    borderCurve: 'continuous',
  },
  spyName: {
    ...Typography.h2,
    color: Colors.textOnPrimary,
  },
  wordRevealSection: {
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    width: '100%',
  },
  wordRevealLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  wordRevealValue: {
    ...Typography.h2,
    color: Colors.textOnPrimary,
  },
  // ── Summary ──
  summaryCard: {
    gap: Spacing.md,
  },
  summaryTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  playerName: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  playerWord: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  spyRow: {
    borderBottomWidth: 0,
  },
  spyPlayerName: {
    color: Colors.spy,
    fontFamily: 'Fredoka-Bold',
  },
  spyBadge: {
    backgroundColor: Colors.spy,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.round,
    borderCurve: 'continuous',
  },
  spyBadgeText: {
    ...Typography.caption,
    fontFamily: 'Fredoka-Bold',
    color: Colors.textOnPrimary,
    letterSpacing: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  // ── Voting Tally ──
  verdictCard: {
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  verdictTitle: {
    ...Typography.h2,
    color: Colors.primary,
  },
  tallyList: {
    width: '100%',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  tallyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 103, 255, 0.05)',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
  },
  tallyName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  tallyBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.round,
    borderCurve: 'continuous',
  },
  tallyCount: {
    ...Typography.caption,
    color: 'white',
    fontFamily: 'Fredoka-Bold',
  },
  verdictCaption: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});
