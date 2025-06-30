import { useState, useEffect } from 'react';
import { Meal, NutritionGoal, NutritionTotals } from '../types';
import { supabase } from '../lib/supabase';

export const useNutrition = (userId?: string) => {
  const [todaysMeals, setTodaysMeals] = useState<Meal[]>([]);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchTodaysMeals();
      fetchNutritionGoals();
    }
  }, [userId]);

  const fetchTodaysMeals = async () => {
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('meals')
      .select(`
        *,
        meal_ingredients (
          *,
          ingredient:ingredients (*)
        )
      `)
      .eq('user_id', userId)
      .gte('logged_at', `${today}T00:00:00.000Z`)
      .lt('logged_at', `${today}T23:59:59.999Z`)
      .order('logged_at', { ascending: false });

    if (error) {
      console.error('Error fetching meals:', error);
    } else {
      setTodaysMeals(data || []);
    }
    setLoading(false);
  };

  const fetchNutritionGoals = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching nutrition goals:', error);
    } else {
      setNutritionGoals(data);
    }
  };

  const getTodaysNutrition = (): NutritionTotals => {
    return todaysMeals.reduce(
      (totals, meal) => ({
        calories: totals.calories + (meal.total_calories || 0),
        protein: totals.protein + (meal.total_protein || 0),
        carbs: totals.carbs + (meal.total_carbs || 0),
        fat: totals.fat + (meal.total_fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const addMeal = async (
    name: string,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    ingredients: Array<{
      ingredient_id: string;
      quantity: number;
      unit: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }>
  ) => {
    if (!userId) return { error: new Error('User not authenticated') };

    const totalNutrition = ingredients.reduce(
      (totals, ingredient) => ({
        calories: totals.calories + ingredient.calories,
        protein: totals.protein + ingredient.protein,
        carbs: totals.carbs + ingredient.carbs,
        fat: totals.fat + ingredient.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // Insert meal
    const { data: mealData, error: mealError } = await supabase
      .from('meals')
      .insert({
        user_id: userId,
        name,
        meal_type: mealType,
        total_calories: totalNutrition.calories,
        total_protein: totalNutrition.protein,
        total_carbs: totalNutrition.carbs,
        total_fat: totalNutrition.fat,
        logged_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (mealError) return { error: mealError };

    // Insert meal ingredients
    const mealIngredientsData = ingredients.map(ingredient => ({
      meal_id: mealData.id,
      ...ingredient,
    }));

    const { error: ingredientsError } = await supabase
      .from('meal_ingredients')
      .insert(mealIngredientsData);

    if (ingredientsError) return { error: ingredientsError };

    // Refresh meals
    await fetchTodaysMeals();
    return { data: mealData, error: null };
  };

  const refreshData = () => {
    if (userId) {
      fetchTodaysMeals();
      fetchNutritionGoals();
    }
  };

  return {
    todaysMeals,
    nutritionGoals,
    loading,
    getTodaysNutrition,
    addMeal,
    refreshData,
  };
};