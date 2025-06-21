import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '../types/recipe';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 cards per row with 16px padding on each side
const IMAGE_HEIGHT = CARD_WIDTH * 0.8;

interface RecipeCardProps {
  recipe: Recipe;
  index: number;
  onPress: (recipe: Recipe) => void;
  onFavoritePress?: (recipe: Recipe) => void;
  isFavorite?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  index,
  onPress,
  onFavoritePress,
  isFavorite = false,
}) => {
  const handlePress = () => {
    onPress(recipe);
  };

  const handleFavoritePress = () => {
    if (onFavoritePress) {
      onFavoritePress(recipe);
    }
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify().damping(12)}
      style={styles.container}
    >
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={handlePress}
        style={styles.touchable}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recipe.strMealThumb }}
            style={styles.image}
            resizeMode="cover"
          />
          
          {onFavoritePress && (
            <TouchableOpacity 
              onPress={handleFavoritePress}
              style={styles.favoriteButton}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#FF6B6B' : 'white'}
              />
            </TouchableOpacity>
          )}
          
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText} numberOfLines={1}>
              {recipe.strCategory}
            </Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {recipe.strMeal}
          </Text>
          <View style={styles.footer}>
            <View style={styles.areaContainer}>
              <Ionicons name="location-outline" size={14} color="#64748B" />
              <Text style={styles.areaText} numberOfLines={1}>
                {recipe.strArea}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  touchable: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1E293B',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  areaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  areaText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
    maxWidth: CARD_WIDTH - 80,
  },
});

export default React.memo(RecipeCard);
