/**
 * CategorySelector — displays all game categories as toggleable chips.
 */
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Category } from '../../types/game.types';
import { playClickSound } from '../../utils/sound';
import { CATEGORY_LABELS } from '../../constants/categories';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { Chip } from '../common/Chip';
import {
  Globe,
  TennisBall,
  Wrench,
  ForkKnife,
  Popcorn,
  PawPrint,
} from 'phosphor-react-native';

interface CategorySelectorProps {
  selectedCategories: Category[];
  onToggleCategory: (category: Category) => void;
}

const ALL_CATEGORIES = Object.values(Category);

function getCategoryIcon(category: Category, isSelected: boolean) {
  const color = isSelected ? Colors.textOnPrimary : Colors.textSecondary;
  const size = 16;
  const weight = isSelected ? 'fill' : 'regular';
  switch (category) {
    case Category.PLACES: return <Globe size={size} color={color} weight={weight} />;
    case Category.SPORTS: return <TennisBall size={size} color={color} weight={weight} />;
    case Category.OBJECTS: return <Wrench size={size} color={color} weight={weight} />;
    case Category.FOOD: return <ForkKnife size={size} color={color} weight={weight} />;
    case Category.MOVIES: return <Popcorn size={size} color={color} weight={weight} />;
    case Category.ANIMALS: return <PawPrint size={size} color={color} weight={weight} />;
    default: return null;
  }
}

export function CategorySelector({
  selectedCategories,
  onToggleCategory,
}: CategorySelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.chipGrid}>
        {ALL_CATEGORIES.map((category) => {
          const isSelectedCategory = selectedCategories.includes(category);
          return (
            <Chip
              key={category}
              label={CATEGORY_LABELS[category]}
              icon={getCategoryIcon(category, isSelectedCategory)}
              selected={isSelectedCategory}
              onToggle={() => onToggleCategory(category)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: Spacing.xs,
  },
  title: {
    ...Typography.caption,
    fontFamily: 'Fredoka-SemiBold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
  },
  selectAllText: {
    ...Typography.caption,
    color: Colors.primary,
    fontFamily: 'Fredoka-Bold',
    fontSize: 12,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
