import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import YoutubeIframe from 'react-native-youtube-iframe';
import { fetchRecipeById } from '../../utils/api';
import { Recipe } from '../../types/recipe';
import LoadingSpinner from '../../components/LoadingSpinner';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 0.7;
const HEADER_HEIGHT = 60;

export default function RecipeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Fetch recipe details
  useEffect(() => {
    const loadRecipe = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!id) {
          throw new Error('No recipe ID provided');
        }
        
        const data = await fetchRecipeById(id);
        if (!data) {
          throw new Error('Recipe not found');
        }
        
        setRecipe(data);
      } catch (err) {
        setError(err.message || 'Failed to load recipe');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipe();
  }, [id]);

  const handleShare = async () => {
    if (!recipe) return;
    
    try {
      await Share.share({
        message: `Check out this delicious recipe: ${recipe.strMeal}\n\n${recipe.strSource || ''}`,
        title: recipe.strMeal,
      });
    } catch (error) {
      console.error('Error sharing recipe:', error);
    }
  };

  const toggleFavorite = () => {
    // TODO: Implement favorite functionality
    setIsFavorite(!isFavorite);
  };

  const extractVideoId = (url: string | null): string | null => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = recipe?.strYoutube ? extractVideoId(recipe.strYoutube) : null;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size={48} color="#FF6B6B" />
      </View>
    );
  }


  if (error || !recipe) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="sad-outline" size={48} color="#94A3B8" />
        <Text style={styles.errorText}>{error || 'Failed to load recipe'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with back button and actions */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, right: 20, bottom: 10, left: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {recipe.strMeal}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={toggleFavorite}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#FF6B6B' : 'white'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="share-social-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Recipe Image */}
        <View style={styles.imageContainer}>
          <Animated.Image
            source={{ uri: recipe.strMealThumb }}
            style={styles.recipeImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          />
          
          {/* Floating back button (visible when scrolled up) */}
          <Animated.View
            style={[
              styles.floatingBackButton,
              {
                opacity: scrollY.interpolate({
                  inputRange: [0, 50],
                  outputRange: [1, 0],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backButtonFloating}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          </Animated.View>
          
          {/* Recipe title overlay */}
          <View style={styles.titleContainer}>
            <View style={styles.recipeMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="white" />
                <Text style={styles.metaText}>30 mins</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={16} color="white" />
                <Text style={styles.metaText}>4 servings</Text>
              </View>
            </View>
            <Text style={styles.recipeTitle}>{recipe.strMeal}</Text>
            <Text style={styles.recipeCategory}>{recipe.strCategory}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Video Section */}
          {videoId && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Watch How to Make It</Text>
              <View style={styles.videoContainer}>
                <YoutubeIframe
                  height={220}
                  videoId={videoId}
                  play={false}
                  webViewStyle={styles.video}
                  webViewProps={{
                    startInLoadingState: true,
                    renderLoading: () => (
                      <View style={styles.videoLoading}>
                        <LoadingSpinner size={32} color="#FF6B6B" />
                      </View>
                    ),
                  }}
                />
              </View>
            </View>
          )}

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'ingredients' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('ingredients')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'ingredients' && styles.tabTextActive,
                ]}
              >
                Ingredients
              </Text>
              {activeTab === 'ingredients' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'instructions' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('instructions')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'instructions' && styles.tabTextActive,
                ]}
              >
                Instructions
              </Text>
              {activeTab === 'instructions' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          </View>

          {/* Content based on active tab */}
          <View style={styles.tabContent}>
            {activeTab === 'ingredients' ? (
              <View style={styles.ingredientsList}>
                {recipe.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <View style={styles.ingredientBullet} />
                    <Text style={styles.ingredientText}>
                      {ingredient.measure} {ingredient.name}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.instructions}>
                <Text style={styles.instructionsText}>
                  {recipe.strInstructions}
                </Text>
              </View>
            )}
          </View>

          {/* Source */}
          {recipe.strSource && (
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceText}>Source: </Text>
              <TouchableOpacity>
                <Text style={styles.sourceLink}>View Original Recipe</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 100,
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  imageContainer: {
    height: IMAGE_HEIGHT,
    width: '100%',
    backgroundColor: '#F1F5F9',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  floatingBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 16,
    left: 16,
    zIndex: 10,
  },
  backButtonFloating: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  recipeMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 4,
    fontFamily: 'Inter_500Medium',
  },
  recipeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    fontFamily: 'Inter_700Bold',
  },
  recipeCategory: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Inter_400Regular',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    fontFamily: 'Inter_700Bold',
  },
  videoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  video: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  videoLoading: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 24,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 16,
    position: 'relative',
  },
  tabActive: {},
  tabText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  tabTextActive: {
    color: '#1E293B',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 16,
    right: 16,
    height: 3,
    backgroundColor: '#FF6B6B',
    borderRadius: 3,
  },
  tabContent: {
    minHeight: 200,
  },
  ingredientsList: {
    marginBottom: 24,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B6B',
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 16,
    color: '#334155',
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  instructions: {
    marginBottom: 24,
  },
  instructionsText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  sourceText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter_400Regular',
  },
  sourceLink: {
    fontSize: 14,
    color: '#FF6B6B',
    textDecorationLine: 'underline',
    fontFamily: 'Inter_500Medium',
  },
});
