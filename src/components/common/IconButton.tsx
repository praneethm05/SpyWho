/**
 * IconButton — circular pressable icon with ripple effect.
 */
import React, { useRef, useCallback } from 'react';
import { Pressable, Text, Animated, StyleSheet, type ViewStyle } from 'react-native';
import { Colors, Radius, Shadows } from '../../constants/theme';
import { playClickSound } from '../../utils/sound';

interface IconButtonProps {
  icon: string | React.ReactNode; // emoji string or vector icon
  onPress: () => void;
  size?: number;
  backgroundColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'solid' | 'ghost';
}

export function IconButton({
  icon,
  onPress,
  size = 44,
  backgroundColor = Colors.accent,
  disabled = false,
  style,
  variant = 'solid',
}: IconButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
      bounciness: 6,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 6,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    playClickSound();
    onPress();
  }, [onPress]);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.button,
          variant === 'solid' && styles.shadow,
          {
            width: size,
            height: size,
            borderRadius: variant === 'solid' ? size / 2 : Radius.md,
            borderCurve: 'continuous',
            backgroundColor:
              variant === 'ghost' ? 'transparent' : disabled ? Colors.disabled : backgroundColor,
          },
        ]}
      >
        {typeof icon === 'string' ? (
          <Text style={[styles.icon, { fontSize: size * 0.45 }]}>{icon}</Text>
        ) : (
          icon
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    ...Shadows.sm,
  },
  icon: {
    textAlign: 'center',
  },
});
