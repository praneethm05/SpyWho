/**
 * TextInput — styled text input with floating label and focus animation.
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  Animated,
  type ViewStyle,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';

interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next' | 'go';
  style?: ViewStyle;
  maxLength?: number;
  editable?: boolean;
}

export function TextInput({
  value,
  onChangeText,
  placeholder,
  label,
  autoFocus = false,
  onSubmitEditing,
  returnKeyType = 'done',
  style,
  maxLength,
  editable = true,
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [borderAnim]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [borderAnim]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.primary],
  });

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text
          style={[
            styles.label,
            isFocused && styles.labelFocused,
          ]}
        >
          {label}
        </Text>
      )}
      <Animated.View
        style={[
          styles.inputContainer,
          { borderColor },
        ]}
      >
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.disabled}
          autoFocus={autoFocus}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          style={styles.input}
          maxLength={maxLength}
          editable={editable}
          autoCorrect={false}
          autoCapitalize="words"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.xs,
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontFamily: 'Fredoka-SemiBold',
    marginLeft: Spacing.xs,
  },
  labelFocused: {
    color: Colors.primary,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  input: {
    ...Typography.body,
    color: Colors.textPrimary,
    padding: 0,
  },
});
