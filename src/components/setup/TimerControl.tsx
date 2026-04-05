/**
 * TimerControl — timer duration selector with counter and preset buttons.
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { Counter } from '../common/Counter';
import {
  TIMER_MIN_SECONDS,
  TIMER_MAX_SECONDS,
  TIMER_STEP_SECONDS,
} from '../../constants/defaults';

interface TimerControlProps {
  value: number;
  onChange: (seconds: number) => void;
}

const PRESETS = [30, 60, 90, 120];

export function TimerControl({ value, onChange }: TimerControlProps) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Counter
        value={value}
        onIncrement={() =>
          onChange(Math.min(value + TIMER_STEP_SECONDS, TIMER_MAX_SECONDS))
        }
        onDecrement={() =>
          onChange(Math.max(value - TIMER_STEP_SECONDS, TIMER_MIN_SECONDS))
        }
        min={TIMER_MIN_SECONDS}
        max={TIMER_MAX_SECONDS}
        displayValue={formatTime(value)}
        large
      />

      <View style={styles.presets}>
        {PRESETS.map((preset) => (
          <Pressable
            key={preset}
            onPress={() => onChange(preset)}
            style={[
              styles.presetButton,
              value === preset && styles.presetButtonActive,
            ]}
          >
            <Text
              style={[
                styles.presetLabel,
                value === preset && styles.presetLabelActive,
              ]}
            >
              {formatTime(preset)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  title: {
    ...Typography.caption,
    fontFamily: 'Fredoka-Bold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  presets: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  presetButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetButtonActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  presetLabel: {
    ...Typography.caption,
    fontFamily: 'Fredoka-SemiBold',
    color: Colors.textSecondary,
  },
  presetLabelActive: {
    color: Colors.textOnPrimary,
  },
});
