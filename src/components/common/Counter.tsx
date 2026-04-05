/**
 * Counter — a +/- stepper component with optional label and constraints.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { IconButton } from './IconButton';

interface CounterProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  label?: string;
  /** Optional formatted string to display instead of the raw number */
  displayValue?: string;
  /** Optional suffix shown after the number, e.g. "s" for seconds */
  suffix?: string;
  /** When true, renders a larger, higher-priority version of the counter */
  large?: boolean;
}

export function Counter({
  value,
  onIncrement,
  onDecrement,
  min = 0,
  max = Infinity,
  label,
  displayValue,
  suffix,
  large = false,
}: CounterProps) {
  return (
    <View style={[styles.container, large && styles.containerLarge]}>
      {label && (
        <Text style={[styles.label, large && styles.labelLarge]}>{label}</Text>
      )}
      <View style={styles.controls}>
        <IconButton
          icon="−"
          onPress={onDecrement}
          disabled={value <= min}
          size={large ? 48 : 36}
          variant="ghost"
        />
        <View style={styles.valueContainer}>
          <Text style={[styles.value, large && { fontSize: 32 }]}>
            {displayValue !== undefined ? displayValue : value}
            {displayValue === undefined && suffix ? (
              <Text style={styles.suffix}>{suffix}</Text>
            ) : null}
          </Text>
        </View>
        <IconButton
          icon="+"
          onPress={onIncrement}
          disabled={value >= max}
          size={large ? 48 : 36}
          variant="ghost"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  containerLarge: {
    gap: Spacing.md,
  },
  label: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  labelLarge: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  valueContainer: {
    minWidth: 44,
    alignItems: 'center',
  },
  value: {
    fontSize: 22,
    fontFamily: 'Fredoka-Bold',
    color: Colors.textPrimary,
  },
  suffix: {
    fontSize: 14,
    fontFamily: 'Fredoka-Regular',
    color: Colors.textSecondary,
  },
});
