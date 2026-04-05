/**
 * Card — base surface wrapper with shadow, border radius, and padding.
 */
import React, { type ReactNode } from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../../constants/theme';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Elevation level for shadow depth */
  elevation?: 'sm' | 'md' | 'lg';
}

export function Card({ children, style, elevation = 'sm' }: CardProps) {
  return (
    <View style={[styles.card, Shadows[elevation], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    padding: Spacing.xl,
  },
});
