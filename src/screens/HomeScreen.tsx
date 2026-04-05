/**
 * HomeScreen — landing page.
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { Colors, Spacing, Typography, Radius, Shadows } from '../constants/theme';
import { Ghost } from 'phosphor-react-native';
import { playClickSound } from '../utils/sound';

type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.timing(slideUp, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [fadeIn, slideUp, floatAnim]);

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeIn, transform: [{ translateY: slideUp }] },
      ]}
    >
      <View style={styles.spacer} />

      {/* Hero */}
      <View style={styles.hero}>
        <Animated.View style={{ transform: [{ translateY: floatY }] }}>
          <Ghost size={56} color={Colors.primary} weight="fill" />
        </Animated.View>

        <Text style={styles.title}>SpyWho</Text>
        <Text style={styles.tagline}>Find the spy among you</Text>
      </View>

      {/* Button */}
      <View style={styles.buttonArea}>
        <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
          <Pressable
            style={styles.newGameButton}
            onPressIn={() => {
              Animated.spring(buttonScale, {
                toValue: 0.96,
                useNativeDriver: true,
                speed: 50,
                bounciness: 4,
              }).start();
            }}
            onPressOut={() => {
              Animated.spring(buttonScale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 50,
                bounciness: 4,
              }).start();
            }}
            onPress={() => {
              playClickSound();
              navigation.navigate('Setup');
            }}
          >
            <Text style={styles.newGameText}>Let's haunt</Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.credit}>Crafted by Praneeth M</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xxxl,
  },
  spacer: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    fontSize: 44,
    fontFamily: 'Fredoka-Bold',
    color: Colors.textPrimary,
    letterSpacing: -1,
    marginTop: Spacing.lg,
  },
  tagline: {
    fontSize: 15,
    fontFamily: 'Fredoka-Regular',
    color: Colors.textSecondary,
  },
  buttonArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.massive,
  },
  newGameButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  newGameText: {
    fontSize: 16,
    fontFamily: 'Fredoka-Bold',
    color: Colors.textOnPrimary,
    letterSpacing: 0.3,
  },
  footer: {
    paddingBottom: Spacing.huge,
    alignItems: 'center',
  },
  credit: {
    fontSize: 12,
    fontFamily: 'Fredoka-Regular',
    color: Colors.disabled,
  },
});
