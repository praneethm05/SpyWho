/**
 * CustomWordInput — text input + add button, renders added words as dismissible chips.
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { TextInput } from '../common/TextInput';
import { playClickSound } from '../../utils/sound';

interface CustomWordInputProps {
  words: string[];
  onAddWord: (word: string) => void;
  onRemoveWord: (word: string) => void;
}

export function CustomWordInput({
  words,
  onAddWord,
  onRemoveWord,
}: CustomWordInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed && !words.includes(trimmed)) {
      playClickSound();
      onAddWord(trimmed);
      setInputValue('');
    }
  }, [inputValue, words, onAddWord]);

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Add a word..."
            onSubmitEditing={handleAdd}
            returnKeyType="go"
          />
        </View>
        <Pressable
          onPress={handleAdd}
          style={[
            styles.addButton,
            !inputValue.trim() && styles.addButtonDisabled,
          ]}
          disabled={!inputValue.trim()}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {words.length > 0 && (
        <View style={styles.wordList}>
          {words.map((word) => (
            <Pressable
              key={word}
              onPress={() => {
                playClickSound();
                onRemoveWord(word);
              }}
              style={styles.wordChip}
            >
              <Text style={styles.wordText}>{word}</Text>
              <Text style={styles.removeIcon}>✕</Text>
            </Pressable>
          ))}
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
  },
  addButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  addButtonText: {
    ...Typography.caption,
    fontFamily: 'Fredoka-Bold',
    color: Colors.textOnPrimary,
  },
  wordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  wordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
  },
  wordText: {
    ...Typography.caption,
    fontFamily: 'Fredoka-SemiBold',
    color: Colors.primary,
  },
  removeIcon: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'Fredoka-Bold',
  },
});
