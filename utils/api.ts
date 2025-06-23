import axios from 'axios';
import { Recipe, Category, Area, Ingredient, ApiResponse } from '../types/recipe';

// In utils/api.ts
export { Category, Area, Ingredient } from '../types/recipe';
export { Recipe } from '../types/recipe';

const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<{ meals: Category[] }>('/categories.php');
    return response.data.meals || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const fetchAreas = async (): Promise<Area[]> => {
  try {
    const response = await api.get<{ meals: Area[] }>('/list.php?a=list');
    return response.data.meals || [];
  } catch (error) {
    console.error('Error fetching areas:', error);
    return [];
  }
};

export const fetchIngredients = async (): Promise<Ingredient[]> => {
  try {
    const response = await api.get<{ meals: Ingredient[] }>('/list.php?i=list');
    return response.data.meals || [];
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return [];
  }
};

export const fetchRecipesByCategory = async (category: string): Promise<Recipe[]> => {
  try {
    const response = await api.get<ApiResponse<Recipe>>(`/filter.php?c=${category}`);
    return response.data.meals || [];
  } catch (error) {
    console.error(`Error fetching recipes for category ${category}:`, error);
    return [];
  }
};

export const fetchRecipesByArea = async (area: string): Promise<Recipe[]> => {
  try {
    const response = await api.get<ApiResponse<Recipe>>(`/filter.php?a=${area}`);
    return response.data.meals || [];
  } catch (error) {
    console.error(`Error fetching recipes for area ${area}:`, error);
    return [];
  }
};

export const fetchRecipesByIngredient = async (ingredient: string): Promise<Recipe[]> => {
  try {
    const response = await api.get<ApiResponse<Recipe>>(`/filter.php?i=${ingredient}`);
    return response.data.meals || [];
  } catch (error) {
    console.error(`Error fetching recipes with ingredient ${ingredient}:`, error);
    return [];
  }
};

export const fetchRecipeById = async (id: string): Promise<Recipe | null> => {
  try {
    const response = await api.get<ApiResponse<Recipe>>(`/lookup.php?i=${id}`);
    const meal = response.data.meals?.[0];
    
    if (!meal) return null;
    
    // Extract ingredients and measures
    const ingredients: { name: string; measure: string }[] = [];
    
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}` as keyof Recipe] as string;
      const measure = meal[`strMeasure${i}` as keyof Recipe] as string;
      
      if (ingredient && ingredient.trim() !== '') {
        ingredients.push({
          name: ingredient,
          measure: measure || '',
        });
      }
    }
    
    return {
      ...meal,
      ingredients,
    };
  } catch (error) {
    console.error(`Error fetching recipe ${id}:`, error);
    return null;
  }
};

export const searchRecipes = async (query: string): Promise<Recipe[]> => {
  try {
    const response = await api.get<ApiResponse<Recipe>>(`/search.php?s=${query}`);
    return response.data.meals || [];
  } catch (error) {
    console.error('Error searching recipes:', error);
    return [];
  }
};
