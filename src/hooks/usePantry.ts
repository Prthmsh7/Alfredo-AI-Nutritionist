import { useState, useEffect } from 'react';
import { PantryItem, Ingredient } from '../types';
import { supabase } from '../lib/supabase';

export const usePantry = (userId?: string) => {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchPantryItems();
      fetchIngredients();
    }
  }, [userId]);

  const fetchPantryItems = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('pantry_items')
      .select(`
        *,
        ingredient:ingredients (*)
      `)
      .eq('user_id', userId)
      .order('last_updated', { ascending: false });

    if (error) {
      console.error('Error fetching pantry items:', error);
    } else {
      setPantryItems(data || []);
    }
    setLoading(false);
  };

  const fetchIngredients = async () => {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching ingredients:', error);
    } else {
      setIngredients(data || []);
    }
  };

  const addPantryItem = async (
    ingredientId: string,
    quantity: number,
    unit: string,
    expiryDate?: string
  ) => {
    if (!userId) return { error: new Error('User not authenticated') };

    // Check if item already exists
    const existingItem = pantryItems.find(item => item.ingredient_id === ingredientId);

    if (existingItem) {
      // Update existing item
      const { data, error } = await supabase
        .from('pantry_items')
        .update({
          quantity: existingItem.quantity + quantity,
          last_updated: new Date().toISOString(),
          ...(expiryDate && { expiry_date: expiryDate }),
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (!error) {
        await fetchPantryItems();
      }
      return { data, error };
    } else {
      // Create new item
      const { data, error } = await supabase
        .from('pantry_items')
        .insert({
          user_id: userId,
          ingredient_id: ingredientId,
          quantity,
          unit,
          expiry_date: expiryDate,
          low_stock_threshold: 1,
          last_updated: new Date().toISOString(),
        })
        .select()
        .single();

      if (!error) {
        await fetchPantryItems();
      }
      return { data, error };
    }
  };

  const updatePantryQuantity = async (itemId: string, newQuantity: number) => {
    if (!userId) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('pantry_items')
      .update({
        quantity: Math.max(0, newQuantity),
        last_updated: new Date().toISOString(),
        is_low_stock: newQuantity <= pantryItems.find(item => item.id === itemId)?.low_stock_threshold,
      })
      .eq('id', itemId)
      .eq('user_id', userId)
      .select()
      .single();

    if (!error) {
      await fetchPantryItems();
    }
    return { data, error };
  };

  const consumeIngredient = async (ingredientName: string, quantity: number, unit: string) => {
    if (!userId) return { error: new Error('User not authenticated') };

    // Find the pantry item
    const pantryItem = pantryItems.find(
      item => item.ingredient?.name.toLowerCase() === ingredientName.toLowerCase()
    );

    if (pantryItem) {
      const newQuantity = Math.max(0, pantryItem.quantity - quantity);
      return await updatePantryQuantity(pantryItem.id, newQuantity);
    }

    return { data: null, error: new Error('Ingredient not found in pantry') };
  };

  const removePantryItem = async (itemId: string) => {
    if (!userId) return { error: new Error('User not authenticated') };

    const { error } = await supabase
      .from('pantry_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (!error) {
      await fetchPantryItems();
    }
    return { error };
  };

  const getLowStockItems = () => {
    return pantryItems.filter(item => item.is_low_stock || item.quantity <= item.low_stock_threshold);
  };

  const getExpiringItems = () => {
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    return pantryItems.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      return expiryDate <= threeDaysFromNow;
    });
  };

  const refreshData = () => {
    if (userId) {
      fetchPantryItems();
      fetchIngredients();
    }
  };

  return {
    pantryItems,
    ingredients,
    loading,
    addPantryItem,
    updatePantryQuantity,
    consumeIngredient,
    removePantryItem,
    getLowStockItems,
    getExpiringItems,
    refreshData,
  };
};