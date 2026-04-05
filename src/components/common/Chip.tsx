/**
 * Chip — a toggleable pill component for categories and tags.
 */
import React, { useRef, useCallback } from 'react';
import { Pressable, Text, StyleSheet, Animated, View, type ViewStyle } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { playClickSound } from '../../utils/sound';

interface ChipProps {
  label: string;
  icon?: React.ReactNode;
  selected: boolean;
  onToggle: () => void;
  style?: ViewStyle;
}

export function Chip({ label, icon, selected, onToggle, style }: ChipProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.93,
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

  const handlePress = useCallback(() => {
    playClickSound();
    onToggle();
  }, [onToggle]);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.chip,
          selected ? styles.chipSelected : styles.chipUnselected,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text
          style={[
            styles.label,
            selected ? styles.labelSelected : styles.labelUnselected,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconContainer: {
    marginRight: 2,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipUnselected: {
    backgroundColor: 'transparent',
    borderColor: Colors.border,
  },
  label: {
    ...Typography.caption,
    fontFamily: 'Fredoka-SemiBold',
  },
  labelSelected: {
    color: Colors.textOnPrimary,
  },
  labelUnselected: {
    color: Colors.textSecondary,
  },
});
