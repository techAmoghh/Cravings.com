import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  fetchCategories, 
  fetchRecipesByCategory, 
  searchRecipes,
  fetchAreas,
  fetchIngredients,
  fetchRecipesByArea,
  fetchRecipesByIngredient,
} from '@utils/api';
import { Recipe, Category, Area, Ingredient } from '@utils/api';

type DietaryRestriction = 'vegetarian' | 'vegan' | 'glutenFree' | 'dairyFree';
type Difficulty = 'easy' | 'medium' | 'hard';

type RecipeFilters = {
  dietaryRestrictions: DietaryRestriction[];
  maxCookingTime: number | null;
  difficulty: Difficulty | null;
  area: string | null;
  ingredient: string | null;
};

export const useRecipes = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Beef');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<RecipeFilters>({
    dietaryRestrictions: [],
    maxCookingTime: null,
    difficulty: null,
    area: null,
    ingredient: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch categories, areas, and ingredients on initial load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [categoriesData, areasData, ingredientsData] = await Promise.all([
          fetchCategories(),
          fetchAreas(),
          fetchIngredients(),
        ]);
        setCategories(categoriesData);
        setAreas(areasData);
        setIngredients(ingredientsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load initial data';
        setError(errorMessage);
        console.error('Error loading initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Apply filters to recipes
  const applyFilters = useCallback((recipesToFilter: Recipe[]): Recipe[] => {
    return recipesToFilter.filter(recipe => {
      // Dietary restrictions
      if (filters.dietaryRestrictions.length > 0) {
        if (filters.dietaryRestrictions.includes('vegetarian') && recipe.strMeal.toLowerCase().includes('chicken')) {
          return false;
        }
        // Add more dietary restriction checks as needed
      }

      // Cooking time (example - would need actual cooking time data)
      // if (filters.maxCookingTime) {
      //   if (recipe.cookingTime > filters.maxCookingTime) return false;
      // }


      // Difficulty (example - would need difficulty data)
      // if (filters.difficulty && recipe.difficulty !== filters.difficulty) {
      //   return false;
      // }


      // Area/cuisine
      if (filters.area && recipe.strArea !== filters.area) {
        return false;
      }

      // Ingredient
      if (filters.ingredient && !recipe.ingredients?.some(i => 
        i.name.toLowerCase().includes(filters.ingredient!.toLowerCase())
      )) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // Debounced search function
  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If query is empty or only whitespace, reset immediately
    if (!query.trim()) {
      setSearchTerm('');
      setSelectedCategory('Beef'); // Reset to default category
      setFilters({
        dietaryRestrictions: [],
        maxCookingTime: null,
        difficulty: null,
        area: null,
        ingredient: null,
      });
      return;
    }

    // Only search if query has at least 2 characters
    if (query.trim().length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        setSearchTerm(query.trim());
        setIsSearching(false);
      }, 300); // 300ms debounce delay
    }
  }, []);

  // Handle search input changes
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Clear search and reset to default state
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchTerm('');
    setIsSearching(false);
    setSelectedCategory('Beef');
    setFilters({
      dietaryRestrictions: [],
      maxCookingTime: null,
      difficulty: null,
      area: null,
      ingredient: null,
    });
  }, []);

  // Load recipes when search term or filters change
  const loadRecipes = useCallback(async () => {
    // Don't show loading state for empty searches
    if (searchTerm === '' && !selectedCategory && !filters.area && !filters.ingredient) {
      // Reset to default state (beef category)
      try {
        setIsLoading(true);
        const data = await fetchRecipesByCategory('Beef');
        setRecipes(data);
        setFilteredRecipes(applyFilters(data));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load recipes';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Only search if we have a valid search term or filter
    if (searchTerm.trim() || selectedCategory || filters.area || filters.ingredient) {
      try {
        setIsLoading(true);
        setError(null);
        
        let data: Recipe[] = [];
        
        if (searchTerm.trim()) {
          data = await searchRecipes(searchTerm);
        } else if (filters.area) {
          data = await fetchRecipesByArea(filters.area);
        } else if (filters.ingredient) {
          data = await fetchRecipesByIngredient(filters.ingredient);
        } else if (selectedCategory) {
          data = await fetchRecipesByCategory(selectedCategory);
        }
        
        setRecipes(data);
        setFilteredRecipes(applyFilters(data));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load recipes';
        setError(errorMessage);
        console.error('Error loading recipes:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [searchTerm, selectedCategory, filters.area, filters.ingredient, applyFilters]);

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
    // Clear other filters when selecting a category
    setFilters({
      dietaryRestrictions: [],
      maxCookingTime: null,
      difficulty: null,
      area: null,
      ingredient: null,
    });
  };

  // Update filters
  const updateFilters = (newFilters: Partial<RecipeFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  // Apply filters when they change
  useEffect(() => {
    if (recipes.length > 0) {
      setFilteredRecipes(applyFilters(recipes));
    }
  }, [filters, recipes, applyFilters]);

  // Load recipes when search term changes
  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    categories,
    areas,
    ingredients,
    selectedCategory,
    recipes: filteredRecipes,
    isLoading: isSearching || isLoading,
    error,
    searchQuery,
    searchTerm,
    filters,
    handleCategorySelect,
    handleSearch,
    clearSearch,
    updateFilters,
    refreshRecipes: loadRecipes,
  };
};