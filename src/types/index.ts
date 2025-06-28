export interface User {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'premium';
  voice_settings: Record<string, any>;
  nutrition_preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
  sugar_per_100g: number;
  sodium_per_100g: number;
  micronutrients: Record<string, any>;
  common_portions: Record<string, number>;
  created_at: string;
}

export interface Meal {
  id: string;
  user_id: string;
  name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  logged_at: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  is_favorite: boolean;
  notes?: string;
  created_at: string;
  meal_ingredients?: MealIngredient[];
}

export interface MealIngredient {
  id: string;
  meal_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredient?: Ingredient;
}

export interface PantryItem {
  id: string;
  user_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  expiry_date?: string;
  low_stock_threshold: number;
  is_low_stock: boolean;
  last_updated: string;
  ingredient?: Ingredient;
}

export interface NutritionGoal {
  id: string;
  user_id: string;
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
  daily_fiber: number;
  daily_sodium: number;
  micronutrient_goals: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface GroceryList {
  id: string;
  user_id: string;
  name: string;
  items: GroceryItem[];
  is_completed: boolean;
  created_at: string;
  completed_at?: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  is_completed: boolean;
  ingredient_id?: string;
}

export interface Recipe {
  name: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  prep_time?: string;
  cook_time?: string;
  servings?: number;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  available: boolean;
  ingredient_id?: string;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface VoiceCommand {
  command: string;
  type: 'recipe' | 'consumption' | 'pantry' | 'shopping' | 'general';
  processed: boolean;
  response?: string;
  timestamp: string;
}