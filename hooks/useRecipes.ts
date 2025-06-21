import { useState, useEffect, useCallback } from 'react';
import { 
  fetchCategories, 
  fetchRecipesByCategory, 
  searchRecipes, 
} from '@utils/api';
import { Recipe } from '@utils/api';
import { Category } from '@utils/api';

export const useRecipes = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Beef');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on initial load
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load categories';
        setError(errorMessage);
        console.error('Error loading categories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Fetch recipes when category changes or on initial load
  const loadRecipes = useCallback(async () => {
    if (!selectedCategory && !searchQuery.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      
      let data: Recipe[] = [];
      
      if (searchQuery.trim()) {
        data = await searchRecipes(searchQuery);
      } else if (selectedCategory) {
        data = await fetchRecipesByCategory(selectedCategory);
      }
      
      setRecipes(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recipes';
      setError(errorMessage);
      console.error('Error loading recipes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  // Load recipes when selectedCategory or searchQuery changes
  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery(''); // Clear search when selecting a category
  };

  // Refresh recipes
  const refreshRecipes = async () => {
    await loadRecipes();
  };

  return {
    categories,
    selectedCategory,
    recipes,
    isLoading,
    error,
    searchQuery,
    handleCategorySelect,
    handleSearch,
    refreshRecipes,
  };
};