export interface Ingredient {
  idIngredient: string;
  strIngredient: string;
  strDescription?: string;
  strType?: string;
}

export interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface Area {
  strArea: string;
}

export interface RecipeIngredient {
  name: string;
  measure: string;
}

export interface Recipe {
  idMeal: string;
  strMeal: string;
  strDrinkAlternate: string | null;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string;
  ingredients: RecipeIngredient[];
  
  // Dynamic properties for ingredients and measures
  [key: `strIngredient${number}`]: string | null;
  [key: `strMeasure${number}`]: string | null;
  
  // Optional properties that might be present
  strSource?: string;
  strImageSource?: string | null;
  strCreativeCommonsConfirmed?: string | null;
  dateModified?: string | null;
}

export interface ApiResponse<T> {
  meals: T[] | null;
}

// Filter types
export type DietaryRestriction = 'vegetarian' | 'vegan' | 'glutenFree' | 'dairyFree';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface RecipeFilters {
  dietaryRestrictions: DietaryRestriction[];
  maxCookingTime: number | null;
  difficulty: Difficulty | null;
  area: string | null;
  ingredient: string | null;
}
