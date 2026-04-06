/**
 * VotingPhase — displays a grid of players for a specific voter to pick their suspect.
 */
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Player } from '../../types/game.types';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../constants/theme';
import { Button } from '../common/Button';
import { Chip } from '../common/Chip';
import { UserCircle, Fingerprint } from 'phosphor-react-native';
import { playClickSound } from '../../utils/sound';

interface VotingPhaseProps {
  voterName: string;
  players: Player[];
  onVote: (suspectIds: string[]) => void;
  voterId: string;
  maxVotes: number;
}

export function VotingPhase({ voterName, players, voterId, onVote, maxVotes }: VotingPhaseProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const scaleAnims = useRef<Record<string, Animated.Value>>({}).current;

  // Initialize scale animation for each player
  players.forEach(p => {
    if (!scaleAnims[p.id]) {
      scaleAnims[p.id] = new Animated.Value(1);
    }
  });

  // Suspects are everyone EXCEPT the current voter
  const suspects = players.filter(p => p.id !== voterId);

  const toggleSuspect = useCallback((suspectId: string) => {
    const isSelected = selectedIds.includes(suspectId);

    if (!isSelected && selectedIds.length >= maxVotes) {
      // Don't allow more than maxVotes
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    playClickSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate the tap
    Animated.sequence([
      Animated.timing(scaleAnims[suspectId], { toValue: 0.94, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnims[suspectId], { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    setSelectedIds(prev =>
      isSelected
        ? prev.filter(id => id !== suspectId)
        : [...prev, suspectId]
    );
  }, [selectedIds, maxVotes, scaleAnims]);

  const handleConfirm = useCallback(() => {
    if (selectedIds.length !== maxVotes) return;
    onVote(selectedIds);
    setSelectedIds([]);
  }, [onVote, selectedIds, maxVotes]);

  const votesRemaining = maxVotes - selectedIds.length;

  return (
    <View style={styles.container}>
      <View style={styles.cardHeader}>
        <Fingerprint size={32} color={Colors.primary} weight="duotone" />
        <View style={{ flex: 1 }}>
          <Text style={styles.turnLabel}>Whose turn to vote?</Text>
          <Text style={styles.voterName}>{voterName}</Text>
        </View>
        {maxVotes > 1 && (
          <View style={styles.voteCountBadge}>
             <Text style={styles.voteCountValue}>{selectedIds.length}/{maxVotes}</Text>
          </View>
        )}
      </View>

      <Text style={styles.prompt}>
        {maxVotes === 1 
          ? "Select your top suspect:" 
          : `Select exactly ${maxVotes} suspects:`}
      </Text>

      <View style={styles.grid}>
        {suspects.map((suspect) => {
          const isSelected = selectedIds.includes(suspect.id);
          return (
            <Animated.View 
              key={suspect.id} 
              style={[
                styles.suspectWrapper,
                { transform: [{ scale: scaleAnims[suspect.id] }] }
              ]}
            >
              <Pressable
                style={[
                  styles.suspectItem,
                  isSelected && styles.suspectItemActive
                ]}
                onPress={() => toggleSuspect(suspect.id)}
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

      {/* Action Button */}
      <View style={styles.footer}>
        <Button 
          title={votesRemaining > 0 
            ? `Select ${votesRemaining} more` 
            : "Confirm Votes"} 
          onPress={handleConfirm}
          disabled={selectedIds.length !== maxVotes}
          fullWidth
          size="md"
        />
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
  voteCountBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.round,
  },
  voteCountValue: {
    ...Typography.caption,
    fontFamily: 'Fredoka-Bold',
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
  footer: {
    marginTop: Spacing.sm,
  }
});
