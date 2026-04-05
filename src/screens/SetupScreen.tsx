/**
 * SetupScreen — game configuration form.
 *
 * Sections: Player/Spy count, Categories, Custom Words, Timer, Reveal Mode.
 * Validates on submit and navigates to PlayerNamesScreen.
 */
import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { Category, RevealMode } from '../types/game.types';
import { useGameContext } from '../context/GameContext';
import {
  PLAYER_COUNT_MIN,
  PLAYER_COUNT_MAX,
  SPY_COUNT_MIN,
  getSpyCountMax,
} from '../constants/defaults';
import { Colors, Spacing, Typography, Radius, Shadows } from '../constants/theme';
import { Button } from '../components/common/Button';
import { Counter } from '../components/common/Counter';
// Card removed: moving to a blended, flat UI for setup
import { CategorySelector } from '../components/setup/CategorySelector';
import { TimerControl } from '../components/setup/TimerControl';
import { RevealModePicker } from '../components/setup/RevealModePicker';
import { CustomWordInput } from '../components/setup/CustomWordInput';
import { Header } from '../components/common/Header';
import { Chip } from '../components/common/Chip';
import { UsersThree, BookOpen, Sliders, Ghost as GhostIcon, Fingerprint } from 'phosphor-react-native';

type SetupNav = NativeStackNavigationProp<RootStackParamList, 'Setup'>;

export function SetupScreen() {
  const navigation = useNavigation<SetupNav>();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useGameContext();
  const { config } = state;
  const [showValidation, setShowValidation] = React.useState(false);

  // ─── Config updaters ──────────────────────────────────────────────

  const updateConfig = useCallback(
    (partial: Partial<typeof config>) => {
      dispatch({ type: 'SET_CONFIG', payload: partial });
    },
    [dispatch],
  );

  const handlePlayerCountChange = useCallback(
    (delta: number) => {
      const newCount = config.playerCount + delta;
      if (newCount < PLAYER_COUNT_MIN || newCount > PLAYER_COUNT_MAX) return;
      // Clamp spy count if needed
      const maxSpies = getSpyCountMax(newCount);
      updateConfig({
        playerCount: newCount,
        spyCount: Math.min(config.spyCount, maxSpies),
      });
    },
    [config, updateConfig],
  );

  const handleSpyCountChange = useCallback(
    (delta: number) => {
      const newCount = config.spyCount + delta;
      const maxSpies = getSpyCountMax(config.playerCount);
      if (newCount < SPY_COUNT_MIN || newCount > maxSpies) return;
      updateConfig({ spyCount: newCount });
    },
    [config, updateConfig],
  );

  const handleToggleCategory = useCallback(
    (category: Category) => {
      const current = config.selectedCategories;
      const isSelected = current.includes(category);

      // Prevent deselecting all categories when no custom words exist
      if (isSelected && current.length === 1 && config.customWords.length === 0) {
        Alert.alert(
          'At least one source needed',
          'Keep at least one category selected, or add custom words.',
        );
        return;
      }

      const updated = isSelected
        ? current.filter((c) => c !== category)
        : [...current, category];

      updateConfig({ selectedCategories: updated });
    },
    [config, updateConfig],
  );

  const handleAddCustomWord = useCallback(
    (word: string) => {
      updateConfig({ customWords: [...config.customWords, word] });
    },
    [config, updateConfig],
  );

  const handleRemoveCustomWord = useCallback(
    (word: string) => {
      const updated = config.customWords.filter((w) => w !== word);

      // Prevent removing all word sources
      if (updated.length === 0 && config.selectedCategories.length === 0) {
        Alert.alert(
          'At least one source needed',
          'Keep at least one custom word, or select a category.',
        );
        return;
      }

      updateConfig({ customWords: updated });
    },
    [config, updateConfig],
  );

  // ─── Submit ───────────────────────────────────────────────────────

  const handleNext = useCallback(() => {
    if (config.selectedCategories.length === 0 && config.customWords.length === 0) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    navigation.navigate('PlayerNames');
  }, [config, navigation]);

  return (
    <View style={styles.screen}>
      <Header title="Game Setup" showBack />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 140 + insets.bottom }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Players & Spies ── */}
        <Text style={styles.sectionLabel}>Players</Text>
        <View style={styles.countersRow}>
          <Counter
            value={config.playerCount}
            onIncrement={() => handlePlayerCountChange(1)}
            onDecrement={() => handlePlayerCountChange(-1)}
            min={PLAYER_COUNT_MIN}
            max={PLAYER_COUNT_MAX}
            label="Players"
            large
          />
          <View style={styles.counterDivider} />
          <Counter
            value={config.spyCount}
            onIncrement={() => handleSpyCountChange(1)}
            onDecrement={() => handleSpyCountChange(-1)}
            min={SPY_COUNT_MIN}
            max={getSpyCountMax(config.playerCount)}
            label="Spies"
            large
          />
        </View>

        {/* ── Toggles ── */}
        <View style={[styles.toggleCard, config.isMarlMode && styles.toggleCardActive]}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>MARL Mode</Text>
            <Text style={styles.toggleDesc}>Random chance everyone is a spy</Text>
          </View>
          <Chip
            label={config.isMarlMode ? "ON" : "OFF"}
            selected={config.isMarlMode}
            onToggle={() => updateConfig({ isMarlMode: !config.isMarlMode })}
          />
        </View>

        <View style={[styles.toggleCard, config.isVotingMode && styles.toggleCardActiveBlue]}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Voting Mode</Text>
            <Text style={styles.toggleDesc}>Structured vote before the reveal</Text>
          </View>
          <Chip
            label={config.isVotingMode ? "ON" : "OFF"}
            selected={config.isVotingMode}
            onToggle={() => updateConfig({ isVotingMode: !config.isVotingMode })}
          />
        </View>

        {/* ── Word Pool ── */}
        <Text style={styles.sectionLabel}>
          Word Pool
          {showValidation && (
            <Text style={styles.validationHint}>  — select a source!</Text>
          )}
        </Text>
        <CategorySelector
          selectedCategories={config.selectedCategories}
          onToggleCategory={handleToggleCategory}
        />
        <CustomWordInput
          words={config.customWords}
          onAddWord={handleAddCustomWord}
          onRemoveWord={handleRemoveCustomWord}
        />

        {/* ── Round Rules ── */}
        <Text style={styles.sectionLabel}>Timer</Text>
        <TimerControl
          value={config.timerSeconds}
          onChange={(seconds) => updateConfig({ timerSeconds: seconds })}
        />

        <Text style={styles.sectionLabel}>Reveal Style</Text>
        <RevealModePicker
          mode={config.revealMode}
          onModeChange={(mode) => updateConfig({ revealMode: mode })}
          shakeThreshold={config.shakeThreshold}
          onShakeThresholdChange={(count) =>
            updateConfig({ shakeThreshold: count })
          }
        />

      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}>
        <Button
          title="Next: Enter Names"
          onPress={handleNext}
          size="md"
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 140,
    gap: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'Fredoka-SemiBold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Spacing.sm,
  },
  validationHint: {
    color: Colors.error,
    textTransform: 'none',
    letterSpacing: 0,
  },
  countersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: Spacing.lg,
  },
  counterDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.divider,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  toggleCardActive: {
    backgroundColor: 'rgba(255, 71, 87, 0.05)',
    borderColor: Colors.spy,
  },
  toggleCardActiveBlue: {
    backgroundColor: 'rgba(99, 103, 255, 0.05)',
    borderColor: Colors.primary,
  },
  toggleInfo: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    fontSize: 15,
    fontFamily: 'Fredoka-SemiBold',
    color: Colors.textPrimary,
  },
  toggleDesc: {
    fontSize: 12,
    fontFamily: 'Fredoka-Regular',
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    ...Shadows.lg,
  },
});
