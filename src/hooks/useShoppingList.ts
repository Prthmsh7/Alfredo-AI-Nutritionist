import { useState, useEffect } from 'react';
import { GroceryList, GroceryItem } from '../types';
import { supabase } from '../lib/supabase';

export const useShoppingList = (userId?: string) => {
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([]);
  const [currentList, setCurrentList] = useState<GroceryList | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchGroceryLists();
    }
  }, [userId]);

  const fetchGroceryLists = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('grocery_lists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching grocery lists:', error);
    } else {
      setGroceryLists(data || []);
      // Set the most recent incomplete list as current
      const activeList = data?.find(list => !list.is_completed);
      setCurrentList(activeList || null);
    }
    setLoading(false);
  };

  const createGroceryList = async (name: string) => {
    if (!userId) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('grocery_lists')
      .insert({
        user_id: userId,
        name,
        items: [],
      })
      .select()
      .single();

    if (!error) {
      await fetchGroceryLists();
      setCurrentList(data);
    }
    return { data, error };
  };

  const addItemToList = async (
    listId: string,
    name: string,
    quantity: number = 1,
    unit: string = 'piece',
    ingredientId?: string
  ) => {
    if (!userId) return { error: new Error('User not authenticated') };

    const list = groceryLists.find(l => l.id === listId);
    if (!list) return { error: new Error('List not found') };

    const newItem: GroceryItem = {
      id: crypto.randomUUID(),
      name,
      quantity,
      unit,
      is_completed: false,
      ...(ingredientId && { ingredient_id: ingredientId }),
    };

    const updatedItems = [...list.items, newItem];

    const { data, error } = await supabase
      .from('grocery_lists')
      .update({ items: updatedItems })
      .eq('id', listId)
      .eq('user_id', userId)
      .select()
      .single();

    if (!error) {
      await fetchGroceryLists();
    }
    return { data, error };
  };

  const toggleItemCompletion = async (listId: string, itemId: string) => {
    if (!userId) return { error: new Error('User not authenticated') };

    const list = groceryLists.find(l => l.id === listId);
    if (!list) return { error: new Error('List not found') };

    const updatedItems = list.items.map(item =>
      item.id === itemId ? { ...item, is_completed: !item.is_completed } : item
    );

    const { data, error } = await supabase
      .from('grocery_lists')
      .update({ items: updatedItems })
      .eq('id', listId)
      .eq('user_id', userId)
      .select()
      .single();

    if (!error) {
      await fetchGroceryLists();
    }
    return { data, error };
  };

  const removeItemFromList = async (listId: string, itemId: string) => {
    if (!userId) return { error: new Error('User not authenticated') };

    const list = groceryLists.find(l => l.id === listId);
    if (!list) return { error: new Error('List not found') };

    const updatedItems = list.items.filter(item => item.id !== itemId);

    const { data, error } = await supabase
      .from('grocery_lists')
      .update({ items: updatedItems })
      .eq('id', listId)
      .eq('user_id', userId)
      .select()
      .single();

    if (!error) {
      await fetchGroceryLists();
    }
    return { data, error };
  };

  const completeList = async (listId: string) => {
    if (!userId) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('grocery_lists')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', listId)
      .eq('user_id', userId)
      .select()
      .single();

    if (!error) {
      await fetchGroceryLists();
      setCurrentList(null);
    }
    return { data, error };
  };

  const generateSmartShoppingList = async (missingIngredients: string[]) => {
    if (!userId) return { error: new Error('User not authenticated') };

    const listName = `Shopping List - ${new Date().toLocaleDateString()}`;
    const { data: newList, error: createError } = await createGroceryList(listName);
    
    if (createError || !newList) return { error: createError };

    // Add missing ingredients to the list
    for (const ingredient of missingIngredients) {
      await addItemToList(newList.id, ingredient, 1, 'piece');
    }

    return { data: newList, error: null };
  };

  const refreshData = () => {
    if (userId) {
      fetchGroceryLists();
    }
  };

  return {
    groceryLists,
    currentList,
    loading,
    createGroceryList,
    addItemToList,
    toggleItemCompletion,
    removeItemFromList,
    completeList,
    generateSmartShoppingList,
    refreshData,
  };
};