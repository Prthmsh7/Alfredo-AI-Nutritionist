import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sample ingredients data for initial population
export const SAMPLE_INGREDIENTS = [
  // Vegetables
  { name: 'Potato', calories_per_100g: 77, protein_per_100g: 2, carbs_per_100g: 17, fat_per_100g: 0.1, common_portions: { 'piece': 150, 'cup': 150 } },
  { name: 'Onion', calories_per_100g: 40, protein_per_100g: 1.1, carbs_per_100g: 9.3, fat_per_100g: 0.1, common_portions: { 'piece': 110, 'cup': 160 } },
  { name: 'Garlic', calories_per_100g: 149, protein_per_100g: 6.4, carbs_per_100g: 33, fat_per_100g: 0.5, common_portions: { 'clove': 3, 'tbsp': 8 } },
  { name: 'Ginger', calories_per_100g: 80, protein_per_100g: 1.8, carbs_per_100g: 18, fat_per_100g: 0.8, common_portions: { 'piece': 15, 'tsp': 2 } },
  { name: 'Tomato', calories_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2, common_portions: { 'piece': 123, 'cup': 149 } },
  { name: 'Carrot', calories_per_100g: 41, protein_per_100g: 0.9, carbs_per_100g: 10, fat_per_100g: 0.2, common_portions: { 'piece': 61, 'cup': 122 } },
  { name: 'Broccoli', calories_per_100g: 34, protein_per_100g: 2.8, carbs_per_100g: 7, fat_per_100g: 0.4, common_portions: { 'cup': 91, 'head': 608 } },
  { name: 'Spinach', calories_per_100g: 23, protein_per_100g: 2.9, carbs_per_100g: 3.6, fat_per_100g: 0.4, common_portions: { 'cup': 30, 'bunch': 340 } },
  { name: 'Bell Pepper', calories_per_100g: 31, protein_per_100g: 1, carbs_per_100g: 7, fat_per_100g: 0.3, common_portions: { 'piece': 119, 'cup': 149 } },
  { name: 'Cucumber', calories_per_100g: 16, protein_per_100g: 0.7, carbs_per_100g: 4, fat_per_100g: 0.1, common_portions: { 'piece': 301, 'cup': 119 } },
  
  // Fruits
  { name: 'Apple', calories_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14, fat_per_100g: 0.2, common_portions: { 'piece': 182, 'cup': 125 } },
  { name: 'Banana', calories_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 23, fat_per_100g: 0.3, common_portions: { 'piece': 118, 'cup': 150 } },
  { name: 'Orange', calories_per_100g: 47, protein_per_100g: 0.9, carbs_per_100g: 12, fat_per_100g: 0.1, common_portions: { 'piece': 131, 'cup': 180 } },
  { name: 'Lemon', calories_per_100g: 29, protein_per_100g: 1.1, carbs_per_100g: 9, fat_per_100g: 0.3, common_portions: { 'piece': 60, 'tbsp': 15 } },
  { name: 'Lime', calories_per_100g: 30, protein_per_100g: 0.7, carbs_per_100g: 11, fat_per_100g: 0.2, common_portions: { 'piece': 67, 'tbsp': 15 } },
  { name: 'Avocado', calories_per_100g: 160, protein_per_100g: 2, carbs_per_100g: 9, fat_per_100g: 15, common_portions: { 'piece': 201, 'cup': 150 } },
  { name: 'Mango', calories_per_100g: 60, protein_per_100g: 0.8, carbs_per_100g: 15, fat_per_100g: 0.4, common_portions: { 'piece': 336, 'cup': 165 } },
  
  // Proteins
  { name: 'Chicken Breast', calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6, common_portions: { 'piece': 174, 'oz': 28 } },
  { name: 'Ground Beef', calories_per_100g: 250, protein_per_100g: 26, carbs_per_100g: 0, fat_per_100g: 15, common_portions: { 'lb': 454, 'oz': 28 } },
  { name: 'Salmon', calories_per_100g: 208, protein_per_100g: 25, carbs_per_100g: 0, fat_per_100g: 12, common_portions: { 'fillet': 150, 'oz': 28 } },
  { name: 'Shrimp', calories_per_100g: 99, protein_per_100g: 18, carbs_per_100g: 0.9, fat_per_100g: 1.4, common_portions: { 'piece': 7, 'cup': 154 } },
  { name: 'Eggs', calories_per_100g: 155, protein_per_100g: 13, carbs_per_100g: 1.1, fat_per_100g: 11, common_portions: { 'piece': 50, 'dozen': 600 } },
  { name: 'Milk', calories_per_100g: 42, protein_per_100g: 3.4, carbs_per_100g: 5, fat_per_100g: 1, common_portions: { 'cup': 244, 'gallon': 3785 } },
  { name: 'Greek Yogurt', calories_per_100g: 59, protein_per_100g: 10, carbs_per_100g: 3.6, fat_per_100g: 0.4, common_portions: { 'cup': 245, 'container': 170 } },
  { name: 'Cheddar Cheese', calories_per_100g: 403, protein_per_100g: 25, carbs_per_100g: 1.3, fat_per_100g: 33, common_portions: { 'slice': 28, 'cup': 113 } },
  { name: 'Tofu', calories_per_100g: 76, protein_per_100g: 8, carbs_per_100g: 1.9, fat_per_100g: 4.8, common_portions: { 'block': 349, 'cup': 126 } },
  { name: 'Lentils', calories_per_100g: 116, protein_per_100g: 9, carbs_per_100g: 20, fat_per_100g: 0.4, common_portions: { 'cup': 198, 'lb': 454 } },
  
  // Grains & Staples
  { name: 'White Rice', calories_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28, fat_per_100g: 0.3, common_portions: { 'cup': 185, 'lb': 454 } },
  { name: 'Brown Rice', calories_per_100g: 112, protein_per_100g: 2.6, carbs_per_100g: 23, fat_per_100g: 0.9, common_portions: { 'cup': 195, 'lb': 454 } },
  { name: 'Quinoa', calories_per_100g: 120, protein_per_100g: 4.4, carbs_per_100g: 22, fat_per_100g: 1.9, common_portions: { 'cup': 185, 'lb': 454 } },
  { name: 'Pasta', calories_per_100g: 131, protein_per_100g: 5, carbs_per_100g: 25, fat_per_100g: 1.1, common_portions: { 'cup': 140, 'lb': 454 } },
  { name: 'Oats', calories_per_100g: 389, protein_per_100g: 17, carbs_per_100g: 66, fat_per_100g: 7, common_portions: { 'cup': 81, 'lb': 454 } },
  { name: 'Bread', calories_per_100g: 265, protein_per_100g: 9, carbs_per_100g: 49, fat_per_100g: 3.2, common_portions: { 'slice': 25, 'loaf': 570 } },
  { name: 'All-Purpose Flour', calories_per_100g: 364, protein_per_100g: 10, carbs_per_100g: 76, fat_per_100g: 1, common_portions: { 'cup': 125, 'lb': 454 } },
  
  // Oils & Fats
  { name: 'Olive Oil', calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, common_portions: { 'tbsp': 14, 'cup': 216 } },
  { name: 'Vegetable Oil', calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, common_portions: { 'tbsp': 14, 'cup': 216 } },
  { name: 'Butter', calories_per_100g: 717, protein_per_100g: 0.9, carbs_per_100g: 0.1, fat_per_100g: 81, common_portions: { 'tbsp': 14, 'stick': 113 } },
  
  // Condiments & Spices
  { name: 'Salt', calories_per_100g: 0, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0, common_portions: { 'tsp': 6, 'tbsp': 18 } },
  { name: 'Black Pepper', calories_per_100g: 251, protein_per_100g: 10, carbs_per_100g: 64, fat_per_100g: 3.3, common_portions: { 'tsp': 2, 'tbsp': 6 } },
  { name: 'Soy Sauce', calories_per_100g: 8, protein_per_100g: 1.3, carbs_per_100g: 0.8, fat_per_100g: 0, common_portions: { 'tbsp': 16, 'cup': 255 } },
  { name: 'Ketchup', calories_per_100g: 112, protein_per_100g: 1.7, carbs_per_100g: 27, fat_per_100g: 0.3, common_portions: { 'tbsp': 17, 'cup': 245 } },
  { name: 'Mayonnaise', calories_per_100g: 680, protein_per_100g: 1, carbs_per_100g: 0.6, fat_per_100g: 75, common_portions: { 'tbsp': 13, 'cup': 220 } },
  
  // Baking Essentials
  { name: 'White Sugar', calories_per_100g: 387, protein_per_100g: 0, carbs_per_100g: 100, fat_per_100g: 0, common_portions: { 'tsp': 4, 'cup': 200 } },
  { name: 'Brown Sugar', calories_per_100g: 380, protein_per_100g: 0.1, carbs_per_100g: 98, fat_per_100g: 0, common_portions: { 'tsp': 4, 'cup': 213 } },
  { name: 'Honey', calories_per_100g: 304, protein_per_100g: 0.3, carbs_per_100g: 82, fat_per_100g: 0, common_portions: { 'tsp': 7, 'tbsp': 21 } },
  { name: 'Vanilla Extract', calories_per_100g: 288, protein_per_100g: 0.1, carbs_per_100g: 13, fat_per_100g: 0.1, common_portions: { 'tsp': 4, 'tbsp': 13 } },
  { name: 'Baking Powder', calories_per_100g: 53, protein_per_100g: 0, carbs_per_100g: 28, fat_per_100g: 0, common_portions: { 'tsp': 4, 'tbsp': 12 } },
  
  // Herbs & Aromatics
  { name: 'Fresh Basil', calories_per_100g: 22, protein_per_100g: 3.2, carbs_per_100g: 2.6, fat_per_100g: 0.6, common_portions: { 'bunch': 25, 'leaf': 0.5 } },
  { name: 'Fresh Parsley', calories_per_100g: 36, protein_per_100g: 3, carbs_per_100g: 6.3, fat_per_100g: 0.8, common_portions: { 'bunch': 60, 'tbsp': 4 } },
  { name: 'Fresh Cilantro', calories_per_100g: 23, protein_per_100g: 2.1, carbs_per_100g: 3.7, fat_per_100g: 0.5, common_portions: { 'bunch': 100, 'tbsp': 4 } },
  { name: 'Green Onions', calories_per_100g: 32, protein_per_100g: 1.8, carbs_per_100g: 7.3, fat_per_100g: 0.2, common_portions: { 'piece': 15, 'bunch': 105 } }
];

// Sample pantry items for new users
export const SAMPLE_PANTRY_ITEMS = [
  { ingredient_name: 'Potato', quantity: 5, unit: 'piece' },
  { ingredient_name: 'Onion', quantity: 3, unit: 'piece' },
  { ingredient_name: 'Garlic', quantity: 1, unit: 'piece' },
  { ingredient_name: 'Tomato', quantity: 4, unit: 'piece' },
  { ingredient_name: 'Carrot', quantity: 6, unit: 'piece' },
  { ingredient_name: 'Eggs', quantity: 12, unit: 'piece' },
  { ingredient_name: 'Milk', quantity: 1, unit: 'gallon' },
  { ingredient_name: 'Chicken Breast', quantity: 2, unit: 'piece' },
  { ingredient_name: 'White Rice', quantity: 2, unit: 'cup' },
  { ingredient_name: 'Pasta', quantity: 1, unit: 'lb' },
  { ingredient_name: 'Olive Oil', quantity: 1, unit: 'cup' },
  { ingredient_name: 'Salt', quantity: 1, unit: 'container' },
  { ingredient_name: 'Black Pepper', quantity: 1, unit: 'container' },
  { ingredient_name: 'Bread', quantity: 1, unit: 'loaf' },
  { ingredient_name: 'Cheddar Cheese', quantity: 8, unit: 'slice' },
  { ingredient_name: 'Apple', quantity: 6, unit: 'piece' },
  { ingredient_name: 'Banana', quantity: 8, unit: 'piece' },
  { ingredient_name: 'Greek Yogurt', quantity: 4, unit: 'container' },
  { ingredient_name: 'Lemon', quantity: 3, unit: 'piece' },
  { ingredient_name: 'Spinach', quantity: 1, unit: 'bunch' }
];