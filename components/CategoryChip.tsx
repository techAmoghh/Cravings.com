import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInRight, FadeOutRight, Layout } from 'react-native-reanimated';
import { Category } from '../types/recipe';

const { width } = Dimensions.get('window');
const CHIP_HEIGHT = 40;
const CHIP_MARGIN = 8;

interface CategoryChipProps {
  category: Category;
  isSelected: boolean;
  onPress: (category: string) => void;
  index: number;
}

const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  isSelected,
  onPress,
  index,
}) => {
  const handlePress = () => {
    onPress(category.strCategory);
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).springify()}
      layout={Layout.springify()}
      style={styles.container}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.chip,
          isSelected && styles.chipSelected,
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <View style={[
            styles.iconContainer,
            isSelected && styles.iconContainerSelected,
          ]}>
            <Text style={styles.emoji}>
              {getCategoryEmoji(category.strCategory)}
            </Text>
          </View>
          <Text
            style={[
              styles.text,
              isSelected && styles.textSelected,
            ]}
            numberOfLines={1}
          >
            {category.strCategory}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Helper function to get emoji based on category
const getCategoryEmoji = (category: string): string => {
  const emojiMap: Record<string, string> = {
    'Beef': '🥩',
    'Breakfast': '🍳',
    'Chicken': '🍗',
    'Dessert': '🍰',
    'Goat': '🐐',
    'Lamb': '🐑',
    'Miscellaneous': '🍽️',
    'Pasta': '🍝',
    'Pork': '🐖',
    'Seafood': '🦞',
    'Side': '🥗',
    'Starter': '🥘',
    'Vegan': '🌱',
    'Vegetarian': '🥕',
  };

  return emojiMap[category] || '🍽️';
};

const styles = StyleSheet.create({
  container: {
    marginRight: CHIP_MARGIN,
    marginBottom: CHIP_MARGIN,
  },
  chip: {
    height: CHIP_HEIGHT,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  emoji: {
    fontSize: 14,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    maxWidth: width * 0.3,
  },
  textSelected: {
    color: 'white',
    fontWeight: '600',
  },
});

export default React.memo(CategoryChip);
