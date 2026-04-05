/**
 * ShakeRevealCard — shake-to-reveal card with premium animations and gradients.
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../constants/theme';
import { playRevealSound, playClickSound } from '../../utils/sound';
import { Button } from '../common/Button';
import { useShakeDetector } from '../../hooks/useShakeDetector';
import { Vibrate, Ghost } from 'phosphor-react-native';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

interface ShakeRevealCardProps {
  /** The word to show (empty for spy) */
  word: string;
  isSpy: boolean;
  shakeThreshold: number;
  onDone: () => void;
  playerName: string;
}

export function ShakeRevealCard({
  word,
  isSpy,
  shakeThreshold,
  onDone,
  playerName,
}: ShakeRevealCardProps) {
  const insets = useSafeAreaInsets();
  const [isRevealed, setIsRevealed] = useState(false);
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const revealScale = useRef(new Animated.Value(0.5)).current;
  const revealOpacity = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardScale, cardOpacity]);

  const handleReveal = useCallback(() => {
    setIsRevealed(true);
    playRevealSound();
    Haptics.notificationAsync(
      isSpy
        ? Haptics.NotificationFeedbackType.Error
        : Haptics.NotificationFeedbackType.Success,
    );

    Animated.parallel([
      Animated.spring(revealScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 8,
        bounciness: 10,
      }),
      Animated.timing(revealOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isSpy, revealScale, revealOpacity]);

  const { shakeCount } = useShakeDetector({
    threshold: shakeThreshold,
    onComplete: handleReveal,
    enabled: !isRevealed,
  });

  // Bounce animation on each shake
  useEffect(() => {
    if (shakeCount > 0 && !isRevealed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [shakeCount, isRevealed, bounceAnim]);

  const handleClose = useCallback(() => {
    playClickSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      Animated.timing(revealOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(revealScale, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onDone();
    });
  }, [revealOpacity, revealScale, onDone]);

  const bounceTranslate = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  // Gradients
  const shakeGradient = ['#FFFFFF', '#F9FAFB'] as const;
  const normalCardGradient = ['#FFFFFF', '#F3F4F6'] as const;
  const spyCardGradient = [Colors.spy, '#991B1B'] as const;

  if (isRevealed) {
    return (
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, Spacing.xxxl) }]}>
        <AnimatedGradient
          colors={isSpy ? spyCardGradient : normalCardGradient}
          style={[
            styles.card,
            styles.premiumShadow,
            {
              opacity: revealOpacity,
              transform: [{ scale: revealScale }],
            },
          ]}
        >
          {isSpy ? (
            <>
              <Ghost size={72} color="rgba(255,255,255,0.95)" weight="duotone" />
              <Text style={styles.spyTitle}>You are a Spy!</Text>
              <Text style={styles.spySubtitle}>
                Blend in. Don't get caught.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.wordLabel}>Your word is</Text>
              <Text style={styles.wordText}>{word}</Text>
            </>
          )}
        </AnimatedGradient>

        <Animated.View style={[styles.actionContainer, { opacity: revealOpacity }]}>
          <Text style={styles.closeInstruction}>
            Close this card when you are done to automatically pass the phone.
          </Text>
          <Button
            title="Close Card & Pass"
            onPress={handleClose}
            size="lg"
            fullWidth
            variant={isSpy ? 'danger' : 'primary'}
            style={styles.passButton}
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, Spacing.xxxl) }]}>
      <AnimatedGradient
        colors={shakeGradient}
        style={[
          styles.card,
          styles.premiumShadow,
          {
            opacity: cardOpacity,
            transform: [
              { scale: cardScale },
              { translateY: bounceTranslate },
            ],
          },
        ]}
      >
        <Vibrate size={64} color={Colors.primary} weight="duotone" style={{ marginBottom: Spacing.sm }} />
        <Text style={styles.shakeTitle}>Shake to Reveal</Text>
        
        <View style={styles.progressSection}>
          <Text style={styles.shakeCounter}>
            {shakeCount} <Text style={styles.shakeCounterMax}>/ {shakeThreshold}</Text>
          </Text>

          {/* Progress dots */}
          <View style={styles.dotsContainer}>
            {Array.from({ length: shakeThreshold }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < shakeCount ? styles.dotFilled : styles.dotEmpty,
                ]}
              />
            ))}
          </View>
        </View>

        <Text style={styles.hintText}>
          Shake your phone vigorously {shakeThreshold - shakeCount} more time{shakeThreshold - shakeCount !== 1 && 's'}
        </Text>
      </AnimatedGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
    paddingTop: Spacing.xl,
  },
  card: {
    borderRadius: Radius.xl,
    borderCurve: 'continuous',
    padding: Spacing.massive,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 400, // Matching FlipRevealCard premium ratio
    gap: Spacing.lg,
  },
  premiumShadow: {
    ...Shadows.lg,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  // ── Shake state ──
  shakeTitle: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  progressSection: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  shakeCounter: {
    fontSize: 56,
    fontFamily: 'Fredoka-Bold',
    color: Colors.textPrimary,
  },
  shakeCounterMax: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderCurve: 'continuous',
  },
  dotFilled: {
    backgroundColor: Colors.primary,
  },
  dotEmpty: {
    backgroundColor: Colors.border,
  },
  hintText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  // ── Revealed state ──
  wordLabel: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  wordText: {
    fontSize: 48,
    fontFamily: 'Fredoka-Bold',
    color: Colors.primary,
    textAlign: 'center',
    lineHeight: 56,
  },
  spyTitle: {
    ...Typography.h1,
    color: Colors.textOnPrimary,
    marginTop: Spacing.md,
  },
  spySubtitle: {
    ...Typography.body,
    fontSize: 18,
    fontFamily: 'Fredoka-Medium',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.xxxl,
  },
  passButton: {
    marginTop: Spacing.md,
  },
  closeInstruction: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
});
