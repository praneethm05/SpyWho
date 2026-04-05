/**
 * Button — primary CTA component with variant support and press animation.
 */
import React, { useCallback, useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Colors, Spacing, Radius, Typography, Shadows } from '../../constants/theme';
import { playClickSound } from '../../utils/sound';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textColor?: string;
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: Colors.primary, text: Colors.textOnPrimary },
  secondary: { bg: Colors.accent, text: Colors.primary },
  ghost: { bg: 'transparent', text: Colors.primary, border: Colors.border },
  danger: { bg: Colors.spy, text: Colors.textOnPrimary },
};

const SIZE_STYLES: Record<ButtonSize, { paddingH: number; paddingV: number; fontSize: number }> = {
  sm: { paddingH: Spacing.lg, paddingV: Spacing.sm, fontSize: 14 },
  md: { paddingH: Spacing.xxl, paddingV: Spacing.md, fontSize: 16 },
  lg: { paddingH: Spacing.xxxl, paddingV: Spacing.lg, fontSize: 18 },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  style,
  textColor,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  const containerStyle: ViewStyle = {
    backgroundColor: disabled ? Colors.disabled : variantStyle.bg,
    paddingHorizontal: sizeStyle.paddingH,
    paddingVertical: sizeStyle.paddingV,
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    ...(variantStyle.border ? { borderWidth: 1.5, borderColor: variantStyle.border } : {}),
    ...(fullWidth ? { width: '100%' } : {}),
    ...(variant === 'primary' && !disabled ? Shadows.md : {}),
  };

  const textStyle: TextStyle = {
    color: textColor || (disabled ? Colors.surface : variantStyle.text),
    fontSize: sizeStyle.fontSize,
    fontFamily: Typography.button.fontFamily,
    letterSpacing: Typography.button.letterSpacing,
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={() => {
          playClickSound();
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={containerStyle}
      >
        <Text style={textStyle}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
}
