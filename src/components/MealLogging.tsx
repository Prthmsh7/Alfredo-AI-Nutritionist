import React, { useState } from 'react';
import { Plus, Clock, Utensils, Coffee, Cookie, Search } from 'lucide-react';
import { useNutrition } from '../hooks/useNutrition';
import { usePantry } from '../hooks/usePantry';

interface MealLoggingProps {
  userId: string;
}

const MealLogging: React.FC<MealLoggingProps> = ({ userId }) => {
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [mealName, setMealName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<Array<{
    ingredient_id: string;
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>>([]);

  const { todaysMeals, addMeal } = useNutrition(userId);
  const { ingredients } = usePantry(userId);

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'bg-yellow-100 border-yellow-500' },
    { id: 'lunch', label: 'Lunch', icon: Utensils, color: 'bg-green-100 border-green-500' },
    { id: 'dinner', label: 'Dinner', icon: Utensils, color: 'bg-blue-100 border-blue-500' },
    { id: 'snack', label: 'Snack', icon: Cookie, color: 'bg-purple-100 border-purple-500' },
  ];

  const getTodaysMealsByType = (mealType: string) => {
    return todaysMeals.filter(meal => meal.meal_type === mealType);
  };

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addIngredientToMeal = (ingredient: any) => {
    const existing = selectedIngredients.find(item => item.ingredient_id === ingredient.id);
    
    if (existing) {
      setSelectedIngredients(prev => prev.map(item =>
        item.ingredient_id === ingredient.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Calculate nutrition for 1 serving (using common portion or 100g)
      const portion = ingredient.common_portions?.piece || ingredient.common_portions?.cup || 100;
      const portionSize = portion / 100; // Convert to 100g base

      setSelectedIngredients(prev => [...prev, {
        ingredient_id: ingredient.id,
        name: ingredient.name,
        quantity: 1,
        unit: ingredient.common_portions?.piece ? 'piece' : 'cup',
        calories: Math.round(ingredient.calories_per_100g * portionSize),
        protein: Math.round(ingredient.protein_per_100g * portionSize),
        carbs: Math.round(ingredient.carbs_per_100g * portionSize),
        fat: Math.round(ingredient.fat_per_100g * portionSize),
      }]);
    }
  };

  const updateIngredientQuantity = (ingredientId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedIngredients(prev => prev.filter(item => item.ingredient_id !== ingredientId));
    } else {
      setSelectedIngredients(prev => prev.map(item =>
        item.ingredient_id === ingredientId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const calculateTotalNutrition = () => {
    return selectedIngredients.reduce(
      (total, item) => ({
        calories: total.calories + (item.calories * item.quantity),
        protein: total.protein + (item.protein * item.quantity),
        carbs: total.carbs + (item.carbs * item.quantity),
        fat: total.fat + (item.fat * item.quantity),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const handleSaveMeal = async () => {
    if (!mealName.trim() || selectedIngredients.length === 0) return;

    const mealIngredients = selectedIngredients.map(item => ({
      ingredient_id: item.ingredient_id,
      quantity: item.quantity,
      unit: item.unit,
      calories: item.calories * item.quantity,
      protein: item.protein * item.quantity,
      carbs: item.carbs * item.quantity,
      fat: item.fat * item.quantity,
    }));

    await addMeal(mealName, selectedMealType, mealIngredients);
    
    // Reset form
    setMealName('');
    setSelectedIngredients([]);
    setSearchTerm('');
    setShowAddMeal(false);
  };

  const totalNutrition = calculateTotalNutrition();

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-black shadow-solid-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-black">Meal Logging</h1>
          <button
            onClick={() => setShowAddMeal(true)}
            className="bg-primary-500 text-white px-4 py-2 rounded-xl border-2 border-black shadow-solid-sm hover:shadow-solid transition-all duration-200 hover:-translate-y-0.5 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Meal</span>
          </button>
        </div>

        {/* Meal Type Selector */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {mealTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedMealType === type.id;
            
            return (
              <button
                key={type.id}
                onClick={() => setSelectedMealType(type.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl border-2 shadow-solid-sm transition-all duration-200 whitespace-nowrap ${
                  isSelected
                    ? `${type.color} shadow-solid`
                    : 'bg-gray-100 border-gray-300 hover:shadow-solid'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's Meals by Type */}
      <div className="bg-white rounded-2xl border-2 border-black shadow-solid-lg p-6">
        <h2 className="text-xl font-bold text-black mb-4 capitalize flex items-center">
          {mealTypes.find(type => type.id === selectedMealType)?.icon && 
            React.createElement(mealTypes.find(type => type.id === selectedMealType)!.icon, {
              className: "w-5 h-5 mr-2"
            })
          }
          Today's {selectedMealType}
        </h2>

        {getTodaysMealsByType(selectedMealType).length > 0 ? (
          <div className="space-y-3">
            {getTodaysMealsByType(selectedMealType).map((meal, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-300">
                <div>
                  <h3 className="font-semibold text-black">{meal.name}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(meal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-black">{Math.round(meal.total_calories)} cal</p>
                  <p className="text-xs text-gray-600">
                    P: {Math.round(meal.total_protein)}g | C: {Math.round(meal.total_carbs)}g | F: {Math.round(meal.total_fat)}g
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No {selectedMealType} logged today</p>
            <p className="text-sm text-gray-400">Add your first meal or use voice commands!</p>
          </div>
        )}
      </div>

      {/* Add Meal Modal */}
      {showAddMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border-2 border-black shadow-solid-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b-2 border-black">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-black">Add New Meal</h2>
                <button
                  onClick={() => setShowAddMeal(false)}
                  className="p-2 rounded-lg border-2 border-black bg-gray-100 shadow-solid-sm hover:shadow-solid transition-all duration-200"
                >
                  ×
                </button>
              </div>
              
              <input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder="Enter meal name..."
                className="w-full mt-4 px-4 py-3 border-2 border-black rounded-xl shadow-solid-sm focus:shadow-solid focus:outline-none font-medium"
              />
            </div>

            {/* Modal Content */}
            <div className="flex flex-col h-[60vh]">
              {/* Ingredient Search */}
              <div className="p-6 border-b-2 border-black">
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search ingredients..."
                    className="w-full pl-11 pr-4 py-3 border-2 border-black rounded-xl shadow-solid-sm focus:shadow-solid focus:outline-none"
                  />
                </div>

                {/* Ingredient Results */}
                {searchTerm && (
                  <div className="mt-4 max-h-40 overflow-y-auto space-y-2">
                    {filteredIngredients.slice(0, 5).map((ingredient) => (
                      <button
                        key={ingredient.id}
                        onClick={() => addIngredientToMeal(ingredient)}
                        className="w-full text-left p-3 bg-gray-50 rounded-xl border-2 border-gray-300 hover:bg-gray-100 transition-all duration-200"
                      >
                        <p className="font-medium text-black">{ingredient.name}</p>
                        <p className="text-sm text-gray-600">
                          {ingredient.calories_per_100g} cal/100g
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Ingredients */}
              <div className="flex-1 overflow-y-auto p-6">
                <h3 className="font-semibold text-black mb-4">Selected Ingredients</h3>
                
                {selectedIngredients.length > 0 ? (
                  <div className="space-y-3">
                    {selectedIngredients.map((ingredient) => (
                      <div key={ingredient.ingredient_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-2 border-gray-300">
                        <div className="flex-1">
                          <p className="font-medium text-black">{ingredient.name}</p>
                          <p className="text-sm text-gray-600">
                            {ingredient.calories * ingredient.quantity} cal
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateIngredientQuantity(ingredient.ingredient_id, ingredient.quantity - 1)}
                            className="w-8 h-8 bg-white border-2 border-black rounded-lg shadow-solid-sm hover:shadow-solid transition-all duration-200 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">{ingredient.quantity}</span>
                          <button
                            onClick={() => updateIngredientQuantity(ingredient.ingredient_id, ingredient.quantity + 1)}
                            className="w-8 h-8 bg-white border-2 border-black rounded-lg shadow-solid-sm hover:shadow-solid transition-all duration-200 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No ingredients selected</p>
                )}
              </div>

              {/* Nutrition Summary & Save Button */}
              {selectedIngredients.length > 0 && (
                <div className="p-6 border-t-2 border-black bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Calories</p>
                        <p className="font-bold text-black">{Math.round(totalNutrition.calories)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Protein</p>
                        <p className="font-bold text-black">{Math.round(totalNutrition.protein)}g</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Carbs</p>
                        <p className="font-bold text-black">{Math.round(totalNutrition.carbs)}g</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Fat</p>
                        <p className="font-bold text-black">{Math.round(totalNutrition.fat)}g</p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSaveMeal}
                    disabled={!mealName.trim() || selectedIngredients.length === 0}
                    className="w-full bg-primary-500 text-white py-3 rounded-xl border-2 border-black shadow-solid-sm hover:shadow-solid transition-all duration-200 hover:-translate-y-0.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Meal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealLogging;