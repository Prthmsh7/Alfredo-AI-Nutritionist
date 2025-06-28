import React from 'react';
import { Mic, TrendingUp, Target, Clock, Zap, Apple, Coffee, Utensils, Cookie } from 'lucide-react';
import { useNutrition } from '../hooks/useNutrition';
import { usePantry } from '../hooks/usePantry';

interface DashboardProps {
  userId: string;
  onVoiceClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userId, onVoiceClick }) => {
  const { todaysMeals, nutritionGoals, getTodaysNutrition } = useNutrition(userId);
  const { pantryItems, getLowStockItems } = usePantry(userId);

  const todaysNutrition = getTodaysNutrition();
  const lowStockItems = getLowStockItems();

  // Default goals if none set
  const goals = nutritionGoals || {
    daily_calories: 2000,
    daily_protein: 150,
    daily_carbs: 250,
    daily_fat: 65,
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getRecentMeals = () => {
    return todaysMeals.slice(0, 3);
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return <Coffee className="w-5 h-5" />;
      case 'lunch':
        return <Utensils className="w-5 h-5" />;
      case 'dinner':
        return <Utensils className="w-5 h-5" />;
      case 'snack':
        return <Cookie className="w-5 h-5" />;
      default:
        return <Apple className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl border-2 border-black shadow-solid-lg p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Ready to track your nutrition? Ask me anything about your meals, recipes, or pantry.
            </p>
          </div>
          
          {/* Voice Assistant Button */}
          <button
            onClick={onVoiceClick}
            className="bg-primary-500 text-white px-8 py-4 rounded-2xl border-2 border-black shadow-solid-lg hover:shadow-solid-xl transition-all duration-200 hover:-translate-y-1 flex items-center space-x-3 text-lg font-semibold group"
          >
            <Mic className="w-6 h-6 group-hover:animate-bounce-gentle" />
            <span>Ask Alfredo</span>
          </button>
        </div>
      </div>

      {/* Nutrition Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Calories', current: todaysNutrition.calories, target: goals.daily_calories, color: 'bg-blue-100 border-blue-500', icon: <Zap className="w-5 h-5 text-blue-600" /> },
          { label: 'Protein', current: todaysNutrition.protein, target: goals.daily_protein, color: 'bg-green-100 border-green-500', icon: <TrendingUp className="w-5 h-5 text-green-600" /> },
          { label: 'Carbs', current: todaysNutrition.carbs, target: goals.daily_carbs, color: 'bg-yellow-100 border-yellow-500', icon: <Target className="w-5 h-5 text-yellow-600" /> },
          { label: 'Fat', current: todaysNutrition.fat, target: goals.daily_fat, color: 'bg-purple-100 border-purple-500', icon: <Clock className="w-5 h-5 text-purple-600" /> },
        ].map((item, index) => (
          <div key={index} className={`${item.color} rounded-2xl border-2 shadow-solid-sm p-4`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-black">{item.label}</span>
              {item.icon}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-lg">
                  {Math.round(item.current)}{item.label === 'Calories' ? '' : 'g'}
                </span>
                <span className="text-gray-600">
                  /{Math.round(item.target)}{item.label === 'Calories' ? '' : 'g'}
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-2 border border-black">
                <div
                  className="bg-black h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage(item.current, item.target)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600">
                {Math.round(getProgressPercentage(item.current, item.target))}% of daily goal
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Activity & Pantry Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Meals */}
        <div className="bg-white rounded-2xl border-2 border-black shadow-solid-lg p-6">
          <h2 className="text-xl font-bold text-black mb-4 flex items-center">
            <Utensils className="w-5 h-5 mr-2" />
            Today's Meals
          </h2>
          
          {getRecentMeals().length > 0 ? (
            <div className="space-y-3">
              {getRecentMeals().map((meal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-2 border-gray-300">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg border-2 border-black shadow-solid-sm">
                      {getMealIcon(meal.meal_type)}
                    </div>
                    <div>
                      <p className="font-semibold text-black capitalize">{meal.meal_type}</p>
                      <p className="text-sm text-gray-600">{meal.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-black">{Math.round(meal.total_calories)} cal</p>
                    <p className="text-xs text-gray-500">
                      {new Date(meal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Apple className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No meals logged today</p>
              <p className="text-sm text-gray-400">Use voice commands to log your meals!</p>
            </div>
          )}
        </div>

        {/* Pantry Status */}
        <div className="bg-white rounded-2xl border-2 border-black shadow-solid-lg p-6">
          <h2 className="text-xl font-bold text-black mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Pantry Status
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border-2 border-gray-300">
              <span className="font-medium text-black">Total Items</span>
              <span className="font-bold text-xl text-black">{pantryItems.length}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl border-2 border-red-300">
              <span className="font-medium text-black">Low Stock</span>
              <span className="font-bold text-xl text-red-600">{lowStockItems.length}</span>
            </div>
            
            {lowStockItems.length > 0 && (
              <div className="bg-yellow-200 p-3 rounded-xl border-2 border-yellow-500">
                <p className="font-semibold text-black mb-2">Running Low:</p>
                <div className="flex flex-wrap gap-2">
                  {lowStockItems.slice(0, 3).map((item, index) => (
                    <span key={index} className="bg-white px-2 py-1 rounded-lg border border-black text-xs font-medium">
                      {item.ingredient?.name}
                    </span>
                  ))}
                  {lowStockItems.length > 3 && (
                    <span className="bg-white px-2 py-1 rounded-lg border border-black text-xs font-medium">
                      +{lowStockItems.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border-2 border-black shadow-solid-lg p-6">
        <h2 className="text-xl font-bold text-black mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onVoiceClick}
            className="p-4 bg-primary-500 text-white rounded-xl border-2 border-black shadow-solid-sm hover:shadow-solid transition-all duration-200 hover:-translate-y-0.5 text-left"
          >
            <Mic className="w-6 h-6 mb-2" />
            <h3 className="font-semibold">Voice Log Meal</h3>
            <p className="text-sm opacity-90">Say what you ate</p>
          </button>
          
          <button
            onClick={onVoiceClick}
            className="p-4 bg-green-500 text-white rounded-xl border-2 border-black shadow-solid-sm hover:shadow-solid transition-all duration-200 hover:-translate-y-0.5 text-left"
          >
            <Utensils className="w-6 h-6 mb-2" />
            <h3 className="font-semibold">Get Recipe</h3>
            <p className="text-sm opacity-90">AI recipe suggestions</p>
          </button>
          
          <button
            onClick={onVoiceClick}
            className="p-4 bg-blue-500 text-white rounded-xl border-2 border-black shadow-solid-sm hover:shadow-solid transition-all duration-200 hover:-translate-y-0.5 text-left"
          >
            <Target className="w-6 h-6 mb-2" />
            <h3 className="font-semibold">Check Pantry</h3>
            <p className="text-sm opacity-90">See what you have</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;