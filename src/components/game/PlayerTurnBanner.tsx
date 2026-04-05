/**
 * PlayerTurnBanner — full-screen interstitial shown between player turns.
 * Prevents accidental peeks by requiring a deliberate "Ready" tap.
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import { Button } from '../common/Button';

interface PlayerTurnBannerProps {
  playerName: string;
  playerNumber: number;
  totalPlayers: number;
  onReady: () => void;
}

export function PlayerTurnBanner({
  playerName,
  playerNumber,
  totalPlayers,
  onReady,
}: PlayerTurnBannerProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            Player {playerNumber} of {totalPlayers}
          </Text>
        </View>

        <Text style={styles.passText}>Pass the phone to</Text>
        <Text style={styles.playerName}>{playerName}</Text>

        <View style={styles.divider} />

        <Text style={styles.instruction}>
          Make sure only {playerName} can see the screen
        </Text>

        <Button
          title="I'm Ready"
          onPress={onReady}
          size="lg"
          fullWidth
          style={styles.readyButton}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
    backgroundColor: Colors.background,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    gap: Spacing.lg,
  },
  badge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.round,
    borderCurve: 'continuous',
  },
  badgeText: {
    ...Typography.caption,
    fontFamily: 'Fredoka-Bold',
    color: Colors.primary,
  },
  passText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
  },
  playerName: {
    ...Typography.h1,
    color: Colors.primary,
    textAlign: 'center',
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: Colors.accent,
    borderRadius: 2,
    borderCurve: 'continuous',
    marginVertical: Spacing.sm,
  },
  instruction: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  readyButton: {
    marginTop: Spacing.lg,
  },
});
