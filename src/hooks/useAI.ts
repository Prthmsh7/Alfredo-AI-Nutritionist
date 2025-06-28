import { useState } from 'react';
import { Recipe, PantryItem, Ingredient } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCElvgzL068VehRT43q1cQ5DmcMZVNiIgY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export const useAI = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const callGeminiAPI = async (prompt: string) => {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
  };

  const extractJSON = (response: string): string => {
    // First, try to find JSON within markdown code blocks
    const markdownJsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (markdownJsonMatch) {
      return markdownJsonMatch[1].trim();
    }

    // If no markdown block, look for the JSON object boundaries
    const jsonStart = response.indexOf('{');
    const jsonEnd = response.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No valid JSON found in response');
    }
    
    return response.slice(jsonStart, jsonEnd).trim();
  };

  const generateRecipe = async (dishName: string, pantryItems: PantryItem[]): Promise<Recipe | null> => {
    setIsProcessing(true);
    try {
      const availableIngredients = pantryItems.map(item =>
        `${item.ingredient?.name} (${item.quantity} ${item.unit})`
      ).join(', ');

      const prompt = `Create a detailed recipe for "${dishName}" using available pantry ingredients.

Available ingredients: ${availableIngredients}

Requirements:
- Use as many available ingredients as possible
- Mark ingredients as available: true/false based on pantry
- Provide step-by-step cooking instructions
- List missing ingredients if any
- Include estimated prep/cook times and servings

Return ONLY this JSON format:
{
  "name": "Recipe name",
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": number,
      "unit": "unit",
      "available": true/false
    }
  ],
  "instructions": ["step 1", "step 2", ...],
  "prep_time": "10 minutes",
  "cook_time": "20 minutes",
  "servings": 4,
  "nutrition": {
    "calories": 350,
    "protein": 25,
    "carbs": 40,
    "fat": 12
  }
}`;

      const response = await callGeminiAPI(prompt);
      const jsonString = extractJSON(response);
      const recipe = JSON.parse(jsonString);
      
      // Mark ingredients as available based on pantry
      recipe.ingredients = recipe.ingredients.map((ingredient: any) => ({
        ...ingredient,
        available: pantryItems.some(pantryItem =>
          pantryItem.ingredient?.name.toLowerCase().includes(ingredient.name.toLowerCase())
        )
      }));

      return recipe;
    } catch (error) {
      console.error('Error generating recipe:', error);
      return generateFallbackRecipe(dishName, pantryItems);
    } finally {
      setIsProcessing(false);
    }
  };

  const processConsumption = async (command: string): Promise<{
    action: string;
    ingredient: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null> => {
    setIsProcessing(true);
    try {
      const prompt = `Parse this food consumption and return ONLY a JSON object:
Command: "${command}"

Return exactly this format:
{
  "action": "consume",
  "ingredient": "food name",
  "quantity": number,
  "unit": "unit",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number
}

Common units: piece, cup, slice, tbsp, tsp, oz, gram, lb
Estimate nutrition values based on common food data.`;

      const response = await callGeminiAPI(prompt);
      const jsonString = extractJSON(response);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error processing consumption:', error);
      return parseConsumptionFallback(command);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSmartResponse = async (command: string, context: string = ''): Promise<string> => {
    setIsProcessing(true);
    try {
      const prompt = `You are Alfredo, an AI nutrition assistant. Respond to this user command naturally and helpfully:

Command: "${command}"
Context: ${context}

Keep responses concise, friendly, and actionable. If it's about food/nutrition, provide helpful guidance.`;

      const response = await callGeminiAPI(prompt);
      return response.trim();
    } catch (error) {
      console.error('Error generating response:', error);
      return generateFallbackResponse(command);
    } finally {
      setIsProcessing(false);
    }
  };

  // Fallback functions for when AI is unavailable
  const generateFallbackRecipe = (dishName: string, pantryItems: PantryItem[]): Recipe => {
    const availableIngredients = pantryItems.slice(0, 5);
    
    return {
      name: `Simple ${dishName}`,
      ingredients: availableIngredients.map(item => ({
        name: item.ingredient?.name || 'Ingredient',
        quantity: 1,
        unit: item.unit,
        available: true,
      })),
      instructions: [
        'Gather all available ingredients',
        'Prepare ingredients as needed',
        'Cook according to standard preparation methods',
        'Season to taste and serve'
      ],
      prep_time: '15 minutes',
      cook_time: '20 minutes',
      servings: 2,
      nutrition: {
        calories: 350,
        protein: 20,
        carbs: 30,
        fat: 15
      }
    };
  };

  const parseConsumptionFallback = (command: string) => {
    // Simple regex-based parsing as fallback
    const quantityMatch = command.match(/(\d+(?:\.\d+)?)/);
    const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : 1;
    
    const unitMatch = command.match(/\b(cup|cups|piece|pieces|slice|slices|tbsp|tsp|oz|gram|grams|lb|lbs)\b/i);
    const unit = unitMatch ? unitMatch[1].toLowerCase() : 'piece';
    
    // Extract ingredient (simplified)
    const ingredientMatch = command.match(/(?:ate|had|drank|consumed)\s+(?:\d+\s*\w*\s+)?(.+?)(?:\s|$)/i);
    const ingredient = ingredientMatch ? ingredientMatch[1].trim() : 'food item';
    
    // Basic nutrition estimation
    const baseCalories = ingredient.toLowerCase().includes('apple') ? 52 :
                        ingredient.toLowerCase().includes('banana') ? 89 :
                        ingredient.toLowerCase().includes('bread') ? 265 : 100;
    
    return {
      action: 'consume',
      ingredient: ingredient,
      quantity: quantity,
      unit: unit,
      calories: Math.round(baseCalories * quantity * 0.01), // Rough estimation
      protein: Math.round(baseCalories * 0.1),
      carbs: Math.round(baseCalories * 0.2),
      fat: Math.round(baseCalories * 0.05)
    };
  };

  const generateFallbackResponse = (command: string): string => {
    if (command.toLowerCase().includes('recipe')) {
      return "I'd be happy to help you with a recipe! Let me generate one based on your pantry ingredients.";
    }
    if (command.toLowerCase().includes('eat') || command.toLowerCase().includes('ate')) {
      return "Great! I've logged that food item for you. Your nutrition totals have been updated.";
    }
    if (command.toLowerCase().includes('pantry') || command.toLowerCase().includes('inventory')) {
      return "Let me check your pantry inventory for you.";
    }
    return "I'm here to help with your nutrition tracking! Try asking me about recipes, logging meals, or checking your pantry.";
  };

  return {
    generateRecipe,
    processConsumption,
    generateSmartResponse,
    isProcessing,
  };
};