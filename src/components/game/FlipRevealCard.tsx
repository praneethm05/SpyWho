/**
 * FlipRevealCard — tap-to-flip card with 3D rotation animation and premium styling.
 */
import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../constants/theme';
import { playRevealSound, playClickSound } from '../../utils/sound';
import { Cards, Ghost } from 'phosphor-react-native';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

interface FlipRevealCardProps {
  word: string;
  isSpy: boolean;
  onDone: () => void;
  playerName: string;
}

export function FlipRevealCard({
  word,
  isSpy,
  onDone,
  playerName,
}: FlipRevealCardProps) {
  const insets = useSafeAreaInsets();
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  const handleFlip = useCallback(() => {
    if (isAnimating.current) return;

    if (isFlipped) {
      // User is flipping BACK (closing)
      isAnimating.current = true;
      playClickSound();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsFlipped(false);

      Animated.spring(flipAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 12,
        bounciness: 4,
      }).start(({ finished }) => {
        isAnimating.current = false;
        if (finished) onDone();
      });

      return;
    }

    // Flipping open
    isAnimating.current = true;
    playRevealSound();
    Haptics.notificationAsync(
      isSpy
        ? Haptics.NotificationFeedbackType.Error
        : Haptics.NotificationFeedbackType.Success,
    );

    setIsFlipped(true);

    Animated.spring(flipAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    }).start(() => {
      isAnimating.current = false;
    });
  }, [isFlipped, isSpy, flipAnim, onDone]);

  // Front face rotation: 0 → 90°
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '90deg'],
  });

  // Back face rotation: -90° → 0
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['180deg', '180deg', '0deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.51],
    outputRange: [1, 1, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0.49, 0.5, 1],
    outputRange: [0, 1, 1],
  });

  // Use more elegant styling
  const frontGradient = [Colors.primary, '#4338CA'] as const;
  const backGradientSpy = [Colors.spy, '#991B1B'] as const;

  return (
    <View style={styles.container}>
      <Pressable onPress={handleFlip} style={styles.cardWrapper}>
        {/* Front Face */}
        <AnimatedGradient
          colors={frontGradient}
          style={[
            styles.card,
            styles.premiumShadow,
            {
              transform: [{ perspective: 1200 }, { rotateY: frontInterpolate }],
              opacity: frontOpacity,
            },
          ]}
        >
          <Cards size={64} color="rgba(255,255,255,0.9)" weight="duotone" />
          <Text style={styles.tapTitle}>Tap to Reveal</Text>
          <View style={styles.divider} />
          <Text style={styles.tapHint}>{playerName}'s card</Text>
        </AnimatedGradient>

        {/* Back Face */}
        {isSpy ? (
          <AnimatedGradient
            colors={backGradientSpy}
            style={[
              styles.card,
              styles.premiumShadow,
              {
                transform: [{ perspective: 1200 }, { rotateY: backInterpolate }],
                opacity: backOpacity,
              },
            ]}
          >
            <Ghost size={72} color="rgba(255,255,255,0.95)" weight="duotone" />
            <Text style={styles.spyTitle}>You are a Spy!</Text>
            <Text style={styles.spySubtitle}>
              Blend in. Don't get caught.
            </Text>
            <Text style={[styles.flipBackHintSpy, { bottom: Math.max(insets.bottom, Spacing.xxxl) }]}>
              Tap card to close & automatically pass
            </Text>
          </AnimatedGradient>
        ) : (
          <Animated.View
            style={[
              styles.card,
              styles.normalBack,
              styles.premiumShadow,
              {
                transform: [{ perspective: 1200 }, { rotateY: backInterpolate }],
                opacity: backOpacity,
              },
            ]}
          >
            <Text style={styles.wordLabel}>Your word is</Text>
            <Text style={styles.wordText}>{word}</Text>
            <Text style={[styles.flipBackHintNormal, { bottom: Math.max(insets.bottom, Spacing.xxxl) }]}>
              Tap card to close & automatically pass
            </Text>
          </Animated.View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  cardWrapper: {
    width: '100%',
    height: 400, // Taller, more premium aspect ratio
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Radius.xl, // More rounded borders
    borderCurve: 'continuous',
    padding: Spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    gap: Spacing.lg,
  },
  premiumShadow: {
    ...Shadows.lg,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  normalBack: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  // ── Front (Gradient Handled Inline) ──
  tapTitle: {
    ...Typography.h1,
    color: Colors.textOnPrimary,
    marginTop: Spacing.md,
  },
  divider: {
    height: 4,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    borderCurve: 'continuous',
    marginVertical: Spacing.sm,
  },
  tapHint: {
    ...Typography.bodyBold,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // ── Back (normal) ──
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
  flipBackHintNormal: {
    ...Typography.caption,
    fontFamily: 'Fredoka-Medium',
    color: Colors.textSecondary,
    position: 'absolute',
    bottom: Spacing.xxxl,
    opacity: 0.6,
  },
  // ── Back (spy) ──
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
  flipBackHintSpy: {
    ...Typography.caption,
    fontFamily: 'Fredoka-Medium',
    color: 'rgba(255,255,255,0.7)',
    position: 'absolute',
    bottom: Spacing.xxxl,
  },
});
