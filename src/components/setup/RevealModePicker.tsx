/**
 * RevealModePicker — segmented control to select reveal method (shake / card).
 * When shake is selected, an additional counter for shake threshold appears.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { RevealMode } from '../../types/game.types';
import { Colors, Spacing, Radius, Typography, Shadows } from '../../constants/theme';
import { Counter } from '../common/Counter';
import { SHAKE_THRESHOLD_MIN, SHAKE_THRESHOLD_MAX } from '../../constants/defaults';
import { Vibrate, Cards } from 'phosphor-react-native';
import { playClickSound } from '../../utils/sound';

interface RevealModePickerProps {
  mode: RevealMode;
  onModeChange: (mode: RevealMode) => void;
  shakeThreshold: number;
  onShakeThresholdChange: (count: number) => void;
}

const MODES = [
  { value: RevealMode.SHAKE, label: 'Shake' },
  { value: RevealMode.CARD, label: 'Card' },
];

export function RevealModePicker({
  mode,
  onModeChange,
  shakeThreshold,
  onShakeThresholdChange,
}: RevealModePickerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.segmentedControl}>
        {MODES.map((m) => {
          const isActive = mode === m.value;
          const IconComponent = m.value === RevealMode.SHAKE ? Vibrate : Cards;
          
          return (
            <Pressable
              key={m.value}
              onPress={() => {
                playClickSound();
                onModeChange(m.value);
              }}
              style={[
                styles.segment,
                isActive && styles.segmentActive,
              ]}
            >
              <View style={styles.segmentIcon}>
                <IconComponent 
                  size={20} 
                  color={isActive ? Colors.textOnPrimary : Colors.textSecondary} 
                  weight="bold" 
                />
              </View>
              <Text
                style={[
                  styles.segmentLabel,
                  isActive && styles.segmentLabelActive,
                ]}
              >
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {mode === RevealMode.SHAKE && (
        <View style={styles.shakeConfig}>
          <Counter
            value={shakeThreshold}
            onIncrement={() =>
              onShakeThresholdChange(
                Math.min(shakeThreshold + 1, SHAKE_THRESHOLD_MAX),
              )
            }
            onDecrement={() =>
              onShakeThresholdChange(
                Math.max(shakeThreshold - 1, SHAKE_THRESHOLD_MIN),
              )
            }
            min={SHAKE_THRESHOLD_MIN}
            max={SHAKE_THRESHOLD_MAX}
            label="Shakes to reveal"
          />
        </View>
      )}
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
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    padding: Spacing.xs,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
  },
  segmentActive: {
    backgroundColor: Colors.primary,
  },
  segmentIcon: {
    marginRight: 4,
  },
  segmentLabel: {
    ...Typography.caption,
    fontFamily: 'Fredoka-SemiBold',
    color: Colors.textSecondary,
  },
  segmentLabelActive: {
    color: Colors.textOnPrimary,
  },
  shakeConfig: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
});
