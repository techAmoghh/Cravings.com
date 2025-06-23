import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

  const {
    categories,
    selectedCategory,
    recipes,
    isLoading,
    error,
    searchQuery,
    handleCategorySelect,
    handleSearch,
    clearSearch,
    refreshRecipes,
  } = useRecipes();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await refreshRecipes();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshRecipes]);

  const handleSearchChange = (query: string) => {
    handleSearch(query);
  };

  const handleSearchClear = () => {
    clearSearch();
  };

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
          onSearch={handleSearchChange}
          onCancel={handleSearchClear}
          value={searchQuery}
          placeholder="Search Recipes…"
          autoFocus={false}
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
        title={searchQuery ? "No recipes found" : "No recipes available"}
        message={
          searchQuery
            ? "Try a different search term"
            : "Pull to refresh or check your connection"
        }
      />
    );
  }, [isLoading, error, searchQuery, refreshRecipes]);

  const containerStyle = {
    ...styles.container,
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: Math.max(insets.left, 16),
    paddingRight: Math.max(insets.right, 16),
  };

  return (
    <View style={containerStyle}>
      <FlatList
        ref={flatListRef}
        data={recipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.idMeal}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={[
          styles.recipesList,
          { paddingBottom: insets.bottom + 20 } // Add extra bottom padding
        ]}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#FF6B6B']}
            tintColor="#FF6B6B"
            progressViewOffset={insets.top} // Adjust refresh control position
          />
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  recipesList: {
    paddingTop: 16, // Reduced top padding since we're using safe area
  },
  header: {
    paddingTop: 16, // Add some top padding to the header
    paddingHorizontal: 0, // Remove horizontal padding since container handles it
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
