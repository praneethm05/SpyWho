import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ghost, CaretLeft } from 'phosphor-react-native';
import { Colors, Spacing } from '../../constants/theme';
import { playClickSound } from '../../utils/sound';

export interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function Header({ 
  title = "SpyWho", 
  showBack = false, 
  onBack,
  rightElement,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleBack = () => {
    playClickSound();
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            style={styles.backButton}
            hitSlop={Spacing.md}
          >
            <CaretLeft size={26} color={Colors.primary} weight="bold" />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.titleContainer}>
          <Ghost size={24} color={Colors.primary} weight="fill" />
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* Right area, either an element or a placeholder to keep title centered */}
        <View style={styles.rightContainer}>
          {rightElement}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    width: '100%',
    zIndex: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    minHeight: 56,
  },
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
    width: 60,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  placeholder: {
    width: 60,
  },
  rightContainer: {
    width: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  title: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 22,
    color: Colors.primary,
    marginTop: -2,
  },
});
