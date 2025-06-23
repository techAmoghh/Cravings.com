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

  // Fetch recipes when category/area/ingredient changes or on search term changes
  const loadRecipes = useCallback(async () => {
    if (!selectedCategory && !searchTerm.trim() && !filters.area && !filters.ingredient) {
      setRecipes([]);
      setFilteredRecipes([]);
      return;
    }

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
  }, [selectedCategory, searchTerm, filters.area, filters.ingredient, applyFilters]);

  // Debounced search
  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(query);
      // Clear other filters when searching
      setFilters(prev => ({
        ...prev,
        area: null,
        ingredient: null,
      }));
      setSelectedCategory('');
    }, 500);
  }, []);

  // Handle search with debounce
  const handleSearch = (query: string) => {
    setSearchQuery(query); // Update the input value immediately
    debouncedSearch(query);
  };

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
    isLoading,
    error,
    searchQuery, // The current input value
    searchTerm,   // The debounced search term used for actual searching
    filters,
    handleCategorySelect,
    handleSearch,
    updateFilters,
    refreshRecipes: loadRecipes,
  };
};