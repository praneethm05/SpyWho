/**
 * PlayerNamesScreen — allows entering a name for each player.
 *
 * Pre-fills with "Player 1", "Player 2", etc.
 * On submit, initializes the game and navigates to GameRoundScreen.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { useGameEngine } from '../hooks/useGameEngine';
import { Colors, Spacing, Typography, Radius, Shadows } from '../constants/theme';
import { Button } from '../components/common/Button';
import { TextInput } from '../components/common/TextInput';
import { Header } from '../components/common/Header';

type PlayerNamesNav = NativeStackNavigationProp<RootStackParamList, 'PlayerNames'>;

export function PlayerNamesScreen() {
  const navigation = useNavigation<PlayerNamesNav>();
  const insets = useSafeAreaInsets();
  const { state, initializeGame } = useGameEngine();
  const { playerCount } = state.config;

  // Initialize names with defaults
  const [names, setNames] = useState<string[]>(() =>
    Array.from({ length: playerCount }, (_, i) => `Player ${i + 1}`),
  );

  // Re-sync if playerCount changes (shouldn't happen here, but safety)
  useEffect(() => {
    setNames((prev) => {
      if (prev.length === playerCount) return prev;
      return Array.from(
        { length: playerCount },
        (_, i) => prev[i] ?? `Player ${i + 1}`,
      );
    });
  }, [playerCount]);

  const handleNameChange = useCallback((index: number, value: string) => {
    setNames((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);

  const handleStartGame = useCallback(() => {
    // Fill empty names with defaults
    const finalNames = names.map((name, i) =>
      name.trim() || `Player ${i + 1}`,
    );
    initializeGame(finalNames);
    navigation.navigate('GameRound');
  }, [names, initializeGame, navigation]);

  // Staggered entrance animation
  const entranceAnims = useRef(
    Array.from({ length: playerCount }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animations = entranceAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: i * 60,
        useNativeDriver: true,
      }),
    );
    Animated.stagger(60, animations).start();
  }, [entranceAnims]);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Player Names" showBack />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 120 + insets.bottom }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >


        {names.map((name, index) => (
          <Animated.View
            key={index}
            style={[
              styles.inputRow,
              {
                opacity: entranceAnims[index],
                transform: [
                  {
                    translateX: entranceAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.indexBadge}>
              <Text style={styles.indexText}>{index + 1}</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                value={name}
                onChangeText={(text) => handleNameChange(index, text)}
                placeholder={`Player ${index + 1}`}
                returnKeyType={index < playerCount - 1 ? 'next' : 'done'}
                maxLength={20}
              />
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}>
        <Button
          title="Start Game"
          onPress={handleStartGame}
          size="lg"
          fullWidth
        />
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 120,
    gap: Spacing.md,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  indexBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  indexText: {
    color: Colors.textOnPrimary,
    fontFamily: 'Fredoka-Bold',
    fontSize: 16,
  },
  inputWrapper: {
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
