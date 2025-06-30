import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { supabase, SAMPLE_INGREDIENTS, SAMPLE_PANTRY_ITEMS } from './lib/supabase';

// Components
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import MealLogging from './components/MealLogging';
import PantryManager from './components/PantryManager';
import ProfileSettings from './components/ProfileSettings';
import VoiceInterface from './components/VoiceInterface';
import BottomNavigation from './components/BottomNavigation';

function App() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dataInitialized, setDataInitialized] = useState(false);

  // Initialize user data when they first sign up
  useEffect(() => {
    if (user && !dataInitialized) {
      initializeUserData();
    }
  }, [user, dataInitialized]);

  const initializeUserData = async () => {
    try {
      // Check if user already has data
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (existingProfile) {
        setDataInitialized(true);
        return;
      }

      // Create profile
      await supabase.from('profiles').insert({
        user_id: user!.id,
        email: user!.email!,
        full_name: user!.user_metadata?.full_name || '',
        subscription_tier: 'free',
        voice_settings: {},
        nutrition_preferences: {},
      });

      // Create default nutrition goals
      await supabase.from('nutrition_goals').insert({
        user_id: user!.id,
        daily_calories: 2000,
        daily_protein: 150,
        daily_carbs: 250,
        daily_fat: 65,
        daily_fiber: 25,
        daily_sodium: 2300,
        is_active: true,
      });

      // Insert sample ingredients if they don't exist
      const { data: existingIngredients } = await supabase
        .from('ingredients')
        .select('id')
        .limit(1);

      if (!existingIngredients || existingIngredients.length === 0) {
        const ingredientsToInsert = SAMPLE_INGREDIENTS.map(ingredient => ({
          ...ingredient,
          fiber_per_100g: 0,
          sugar_per_100g: 0,
          sodium_per_100g: 0,
          micronutrients: {},
        }));

        await supabase.from('ingredients').insert(ingredientsToInsert);
      }

      // Get ingredients for pantry setup
      const { data: ingredients } = await supabase
        .from('ingredients')
        .select('id, name');

      if (ingredients) {
        // Create sample pantry items
        const pantryItemsToInsert = SAMPLE_PANTRY_ITEMS
          .map(pantryItem => {
            const ingredient = ingredients.find(ing => 
              ing.name.toLowerCase() === pantryItem.ingredient_name.toLowerCase()
            );
            
            if (ingredient) {
              return {
                user_id: user!.id,
                ingredient_id: ingredient.id,
                quantity: pantryItem.quantity,
                unit: pantryItem.unit,
                low_stock_threshold: 1,
                is_low_stock: false,
                last_updated: new Date().toISOString(),
              };
            }
            return null;
          })
          .filter(Boolean);

        if (pantryItemsToInsert.length > 0) {
          await supabase.from('pantry_items').insert(pantryItemsToInsert);
        }
      }

      setDataInitialized(true);
    } catch (error) {
      console.error('Error initializing user data:', error);
    }
  };

  // Show auth modal if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    }
  }, [user, loading]);

  const renderContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case 'meals':
        return <MealLogging userId={user.id} />;
      case 'pantry':
        return <PantryManager userId={user.id} />;
      case 'profile':
        return <ProfileSettings userId={user.id} />;
      default:
        return <Dashboard userId={user.id} onVoiceClick={() => setShowVoiceInterface(true)} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border-2 border-black shadow-solid-xl">
          <div className="animate-pulse space-y-4">
            <div className="w-12 h-12 bg-primary-500 rounded-xl mx-auto"></div>
            <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
            <div className="h-3 bg-gray-300 rounded w-24 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-inter">
        {user && (
          <>
            <Header onSettingsClick={() => setShowSettings(true)} />
            
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex">
              <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r-2 border-black p-4 overflow-y-auto">
                <nav className="space-y-2">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
                    { id: 'meals', label: 'Meal Logging', icon: '🍽️' },
                    { id: 'pantry', label: 'Pantry Manager', icon: '📦' },
                    { id: 'profile', label: 'Profile Settings', icon: '👤' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full text-left p-3 rounded-xl border-2 border-black shadow-solid-sm transition-all duration-200 hover:shadow-solid hover:-translate-y-0.5 ${
                        activeTab === item.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-black hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </nav>
              </aside>
              
              <main className="ml-64 pt-16 min-h-screen">
                {renderContent()}
              </main>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden pt-16 pb-20">
              <main className="min-h-[calc(100vh-8rem)]">
                {renderContent()}
              </main>
              <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </>
        )}

        {/* Modals */}
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
        
        {user && (
          <>
            <VoiceInterface
              isOpen={showVoiceInterface}
              onClose={() => setShowVoiceInterface(false)}
              userId={user.id}
            />
            
            {showSettings && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl border-2 border-black shadow-solid-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                  <div className="p-6 border-b-2 border-black flex justify-between items-center">
                    <h2 className="text-xl font-bold text-black">Settings</h2>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="p-2 rounded-lg border-2 border-black bg-gray-100 shadow-solid-sm hover:shadow-solid transition-all duration-200"
                    >
                      ×
                    </button>
                  </div>
                  <div className="overflow-y-auto max-h-[calc(90vh-5rem)]">
                    <ProfileSettings userId={user.id} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Router>
  );
}

export default App;