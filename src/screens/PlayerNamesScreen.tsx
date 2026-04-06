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
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { CaretUp, CaretDown, Trash, PencilSimple } from 'phosphor-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { useGameEngine } from '../hooks/useGameEngine';
import { useGameContext } from '../context/GameContext';
import {
  PLAYER_COUNT_MIN,
  PLAYER_COUNT_MAX,
  SPY_COUNT_MIN,
  getSpyCountMax,
} from '../constants/defaults';
import { Colors, Spacing, Typography, Radius, Shadows } from '../constants/theme';
import { Button } from '../components/common/Button';
import { TextInput } from '../components/common/TextInput';
import { Header } from '../components/common/Header';
import { Counter } from '../components/common/Counter';

type PlayerNamesNav = NativeStackNavigationProp<RootStackParamList, 'PlayerNames'>;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function PlayerNamesScreen() {
  const navigation = useNavigation<PlayerNamesNav>();
  const insets = useSafeAreaInsets();
  const { state, initializeGame } = useGameEngine();
  const { dispatch } = useGameContext();
  const { playerCount, spyCount } = state.config;

  const [modalVisible, setModalVisible] = useState(false);
  const [modalPlayerCount, setModalPlayerCount] = useState(playerCount);
  const [modalSpyCount, setModalSpyCount] = useState(spyCount);

  // Initialize names with defaults or previous config
  const [names, setNames] = useState<{ id: string, value: string }[]>(() =>
    Array.from(
      { length: playerCount },
      (_, i) => ({
        id: `player-${Math.random().toString(36).substring(7)}-${i}`,
        value: state.config.previousPlayerNames?.[i] || `Player ${i + 1}`
      })
    )
  );

  // Re-sync if playerCount changes
  useEffect(() => {
    setNames((prev) => {
      // If we need to add players
      if (playerCount > prev.length) {
        return Array.from(
          { length: playerCount },
          (_, i) => prev[i] ?? {
            id: `player-${Math.random().toString(36).substring(7)}-${i}`,
            value: `Player ${i + 1}`
          },
        );
      }
      // If playerCount < prev.length, we rely on the deletion mode
      return prev;
    });
  }, [playerCount]);

  const playersToDelete = Math.max(0, names.length - playerCount);
  const isDeleteMode = playersToDelete > 0;

  const handleNameChange = useCallback((index: number, value: string) => {
    if (isDeleteMode) return;
    setNames((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value };
      return updated;
    });
  }, []);

  const moveUp = useCallback((index: number) => {
    if (index === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNames((prev) => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    if (index === names.length - 1) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNames((prev) => {
      const updated = [...prev];
      [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
      return updated;
    });
  }, []);

  const handleClear = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNames((prev) => prev.map(p => ({ ...p, value: '' })));
  }, []);

  const handleDeletePlayer = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNames((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const openEditModal = useCallback(() => {
    setModalPlayerCount(playerCount);
    setModalSpyCount(spyCount);
    setModalVisible(true);
  }, [playerCount, spyCount]);

  const handleSaveModal = useCallback(() => {
    dispatch({
      type: 'SET_CONFIG',
      payload: { playerCount: modalPlayerCount, spyCount: modalSpyCount },
    });
    setModalVisible(false);
  }, [dispatch, modalPlayerCount, modalSpyCount]);

  const handleStartGame = useCallback(() => {
    // Fill empty names with defaults
    const finalNames = names.map((nameObj, i) =>
      nameObj.value.trim() || `Player ${i + 1}`,
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
      <Header
        title={isDeleteMode ? `Remove ${playersToDelete} Player${playersToDelete !== 1 ? 's' : ''}` : "Player Names"}
        showBack={!isDeleteMode}
        rightElement={
          !isDeleteMode && (
            <TouchableOpacity onPress={handleClear} hitSlop={Spacing.md}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )
        }
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 160 + insets.bottom }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!isDeleteMode && (
          <View style={styles.configBanner}>
            <Text style={styles.configText}>
              {playerCount} Players • {spyCount} Spies
            </Text>
            <TouchableOpacity onPress={openEditModal} hitSlop={Spacing.sm} style={styles.editConfigBtn}>
              <PencilSimple size={18} color={Colors.primary} weight="bold" />
              <Text style={styles.editConfigText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}


        {names.map((nameObj, index) => (
          <Animated.View
            key={nameObj.id}
            style={[
              styles.inputRow,
              {
                opacity: entranceAnims[index] || 1,
                transform: [
                  {
                    translateX: entranceAnims[index]
                      ? entranceAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-30, 0],
                      })
                      : 0,
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
                value={nameObj.value}
                onChangeText={(text) => handleNameChange(index, text)}
                placeholder={`Player ${index + 1}`}
                returnKeyType={index < names.length - 1 ? 'next' : 'done'}
                maxLength={20}
                editable={!isDeleteMode}
              />
            </View>

            {isDeleteMode ? (
              <TouchableOpacity
                onPress={() => handleDeletePlayer(index)}
                style={styles.deleteButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash size={22} color={Colors.error} weight="bold" />
              </TouchableOpacity>
            ) : (
              <View style={styles.orderControls}>
                <TouchableOpacity
                  onPress={() => moveUp(index)}
                  disabled={index === 0}
                  style={[styles.arrowButton, index === 0 && styles.arrowDisabled]}
                  hitSlop={{ top: 10, bottom: 5, left: 10, right: 10 }}
                >
                  <CaretUp size={18} color={index === 0 ? Colors.border : Colors.textSecondary} weight="bold" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  onPress={() => moveDown(index)}
                  disabled={index === names.length - 1}
                  style={[styles.arrowButton, index === names.length - 1 && styles.arrowDisabled]}
                  hitSlop={{ top: 5, bottom: 10, left: 10, right: 10 }}
                >
                  <CaretDown size={18} color={index === names.length - 1 ? Colors.border : Colors.textSecondary} weight="bold" />
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        ))}
      </ScrollView>

      {/* Edit Form Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Game Size</Text>

            <View style={styles.countersRow}>
              <Counter
                value={modalPlayerCount}
                onIncrement={() => {
                  const val = modalPlayerCount + 1;
                  if (val <= PLAYER_COUNT_MAX) {
                    setModalPlayerCount(val);
                    setModalSpyCount(Math.min(modalSpyCount, getSpyCountMax(val)));
                  }
                }}
                onDecrement={() => {
                  const val = modalPlayerCount - 1;
                  if (val >= PLAYER_COUNT_MIN) {
                    setModalPlayerCount(val);
                    setModalSpyCount(Math.min(modalSpyCount, getSpyCountMax(val)));
                  }
                }}
                min={PLAYER_COUNT_MIN}
                max={PLAYER_COUNT_MAX}
                label="Players"
              />
              <View style={styles.counterDivider} />
              <Counter
                value={modalSpyCount}
                onIncrement={() => modalSpyCount < getSpyCountMax(modalPlayerCount) && setModalSpyCount(modalSpyCount + 1)}
                onDecrement={() => modalSpyCount > SPY_COUNT_MIN && setModalSpyCount(modalSpyCount - 1)}
                min={SPY_COUNT_MIN}
                max={getSpyCountMax(modalPlayerCount)}
                label="Spies"
              />
            </View>

            <View style={styles.modalFooter}>
              <Button title="Cancel" variant="ghost" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
              <Button title="Update Config" onPress={handleSaveModal} style={{ flex: 1.5 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}>
        <Button
          title={isDeleteMode ? "Remove Players to Continue" : "Start Game"}
          onPress={handleStartGame}
          disabled={isDeleteMode}
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
    paddingBottom: 160,
    gap: Spacing.md,
  },
  configBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  configText: {
    fontFamily: 'Fredoka-Medium',
    fontSize: 16,
    color: Colors.textSecondary,
  },
  editConfigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99, 103, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.round,
  },
  editConfigText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 14,
    color: Colors.primary,
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
  orderControls: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  arrowButton: {
    padding: 6,
    paddingHorizontal: 8,
  },
  divider: {
    width: '60%',
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  deleteButton: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    borderRadius: Radius.md,
    borderCurve: 'continuous',
  },
  arrowDisabled: {
    opacity: 0.5,
  },
  clearText: {
    fontFamily: 'Fredoka-Medium',
    fontSize: 16,
    color: Colors.accent,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.background,
    width: '100%',
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  modalTitle: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 20,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  countersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  counterDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.divider,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
});
