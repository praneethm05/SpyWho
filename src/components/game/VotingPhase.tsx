/**
 * VotingPhase — displays a grid of players for a specific voter to pick their suspect.
 */
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Player } from '../../types/game.types';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../constants/theme';
import { Chip } from '../common/Chip';
import { UserCircle, Fingerprint } from 'phosphor-react-native';
import { playClickSound } from '../../utils/sound';

interface VotingPhaseProps {
  voterName: string;
  players: Player[];
  onVote: (suspectId: string) => void;
  voterId: string;
}

export function VotingPhase({ voterName, players, voterId, onVote }: VotingPhaseProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Suspects are everyone EXCEPT the current voter
  const suspects = players.filter(p => p.id !== voterId);

  const handleVotePress = useCallback((suspectId: string) => {
    if (selectedId) return; // Prevent double taps

    setSelectedId(suspectId);
    playClickSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Scale down then back
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    // Small delay to let them see the selection before UI re-renders for next voter
    setTimeout(() => {
      onVote(suspectId);
      setSelectedId(null);
    }, 400);
  }, [onVote, selectedId, scaleAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.cardHeader}>
        <Fingerprint size={32} color={Colors.primary} weight="duotone" />
        <View>
          <Text style={styles.turnLabel}>Whose turn to vote?</Text>
          <Text style={styles.voterName}>{voterName}</Text>
        </View>
      </View>

      <Text style={styles.prompt}>Select your top suspect:</Text>

      <View style={styles.grid}>
        {suspects.map((suspect) => {
          const isSelected = selectedId === suspect.id;
          return (
            <Animated.View 
              key={suspect.id} 
              style={[
                styles.suspectWrapper,
                isSelected && { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <Pressable
                style={[
                  styles.suspectItem,
                  isSelected && styles.suspectItemActive
                ]}
                onPress={() => handleVotePress(suspect.id)}
              >
                <UserCircle 
                  size={28} 
                  color={isSelected ? Colors.textOnPrimary : Colors.primary} 
                  weight={isSelected ? "fill" : "duotone"} 
                />
                <Text 
                  style={[
                    styles.suspectName,
                    isSelected && { color: Colors.textOnPrimary }
                  ]} 
                  numberOfLines={1}
                >
                  {suspect.name}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    gap: Spacing.lg,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  turnLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  voterName: {
    ...Typography.h2,
    color: Colors.primary,
  },
  prompt: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  suspectWrapper: {
    width: '45%',
  },
  suspectItem: {
    width: '100%',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suspectItemActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.md,
  },
  suspectName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
});
