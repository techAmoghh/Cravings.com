import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { useRouter } from 'expo-router';


import { useRecipes } from '@/hooks/useRecipes';
import RecipeCard from '@/components/RecipeCard';
import CategoryChip from '@/components/CategoryChip';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - 16 * 2 - CARD_MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

export default function HomeScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  
  const {
    categories,
    selectedCategory,
    recipes,
    isLoading,
    error,
    searchQuery,
    handleCategorySelect,
    handleSearch,
    refreshRecipes,
  } = useRecipes();

  const handleRecipePress = useCallback((recipe: any) => {
    router.push({
      pathname: '/recipe/[id]',
      params: { id: recipe.idMeal, title: recipe.strMeal },
    });
  }, [router]);

  const handleFavoritePress = useCallback((recipe: any) => {
    // TODO: Implement favorite functionality
    console.log('Favorite pressed:', recipe.idMeal);
  }, []);

  const renderRecipeItem = useCallback(({ item, index }: { item: any; index: number }) => {
    return (
      <RecipeCard
        recipe={item}
        index={index % 5} // For staggered animation
        onPress={handleRecipePress}
        onFavoritePress={handleFavoritePress}
        isFavorite={false} // TODO: Connect to favorites state
      />
    );
  }, [handleRecipePress, handleFavoritePress]);

  const renderCategory = useCallback(({ item, index }: { item: any; index: number }) => (
    <CategoryChip
      category={item}
      isSelected={selectedCategory === item.strCategory}
      onPress={handleCategorySelect}
      index={index}
    />
  ), [selectedCategory, handleCategorySelect]);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <Text style={styles.greeting}>Hello, Chef! 👨‍🍳</Text>
      <Text style={styles.subtitle}>What would you like to cook today?</Text>
      
      <View style={styles.searchContainer}>
        <SearchBar
          onSearch={handleSearch}
          value={searchQuery}
          placeholder="Search for recipes..."
        />
      </View>
      
      {!searchQuery && (
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.strCategory}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
      )}
      
      <View style={styles.recipesHeader}>
        <Text style={styles.sectionTitle}>
          {searchQuery ? 'Search Results' : 'Popular Recipes'}
        </Text>
        {!isLoading && !error && recipes.length > 0 && (
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  ), [categories, selectedCategory, searchQuery, isLoading, error, recipes]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return <LoadingSpinner style={styles.loading} />;
    }
    
    if (error) {
      return (
        <EmptyState
          icon="alert-circle"
          title="Something went wrong"
          message={error}
          action={{
            text: 'Try Again',
            onPress: refreshRecipes,
          }}
        />
      );
    }
    
    return (
      <EmptyState
        icon="search"
        title="No recipes found"
        message={searchQuery ? 
          "We couldn't find any recipes matching your search." : 
          "No recipes available at the moment."
        }
      />
    );
  }, [isLoading, error, searchQuery, refreshRecipes]);

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={recipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.idMeal}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && recipes.length > 0}
            onRefresh={refreshRecipes}
            colors={['#FF6B6B']}
            tintColor="#FF6B6B"
          />
        }
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        windowSize={11}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    paddingTop: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
    fontFamily: 'Inter_400Regular',
  },
  searchContainer: {
    marginBottom: 16,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  categoriesList: {
    paddingBottom: 4,
  },
  recipesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  loading: {
    marginTop: 40,
  },
});
