/**
 * VotingPhase — displays a grid of players for a specific voter to pick their suspect.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  // Suspects are everyone EXCEPT the current voter
  const suspects = players.filter(p => p.id !== voterId);

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
        {suspects.map((suspect) => (
          <TouchableOpacity
            key={suspect.id}
            style={styles.suspectItem}
            onPress={() => {
              playClickSound();
              onVote(suspect.id);
            }}
            activeOpacity={0.7}
          >
            <UserCircle size={28} color={Colors.primary} weight="duotone" />
            <Text style={styles.suspectName} numberOfLines={1}>{suspect.name}</Text>
          </TouchableOpacity>
        ))}
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
  suspectItem: {
    width: '45%',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suspectName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
});
