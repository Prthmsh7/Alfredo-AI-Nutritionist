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
      // First, ensure the user record exists in the users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user!.id)
        .maybeSingle();

      // Create user record if it doesn't exist and wait for completion
      if (!existingUser) {
        const { error: userError } = await supabase.from('users').insert({
          id: user!.id,
          email: user!.email!,
          full_name: user!.user_metadata?.full_name || '',
          subscription_status: 'free',
          dietary_preferences: [],
          allergies: [],
          health_goals: [],
          activity_level: 'moderate',
        });

        if (userError && userError.code !== '23505') {
          // Ignore duplicate key errors, but log other errors
          console.error('Error creating user:', userError);
          return;
        }
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      // Create profile if it doesn't exist and wait for completion
      if (!existingProfile) {
        const { error: profileError } = await supabase.from('profiles').insert({
          user_id: user!.id,
          email: user!.email!,
          full_name: user!.user_metadata?.full_name || '',
          subscription_tier: 'free',
          voice_settings: {},
          nutrition_preferences: {},
        });

        if (profileError && profileError.code !== '23505') {
          // Ignore duplicate key errors, but log other errors
          console.error('Error creating profile:', profileError);
        }
      }

      // Verify user exists before proceeding with dependent records
      const { data: verifiedUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user!.id)
        .single();

      if (!verifiedUser) {
        console.error('User verification failed');
        return;
      }

      // Now that user record is verified, create nutrition goals
      const { data: existingGoals } = await supabase
        .from('nutrition_goals')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      // Create default nutrition goals if they don't exist
      if (!existingGoals) {
        const { error: goalsError } = await supabase.from('nutrition_goals').insert({
          user_id: user!.id,
          daily_calories: 2000,
          daily_protein_g: 150,
          daily_carbs_g: 250,
          daily_fat_g: 65,
          daily_fiber_g: 25,
          daily_sodium_mg: 2300,
          is_active: true,
        });

        if (goalsError) {
          console.error('Error creating nutrition goals:', goalsError);
        }
      }

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

        const { error: ingredientsError } = await supabase.from('ingredients').insert(ingredientsToInsert);
        if (ingredientsError) {
          console.error('Error inserting sample ingredients:', ingredientsError);
        }
      }

      // Get ingredients for pantry setup
      const { data: ingredients } = await supabase
        .from('ingredients')
        .select('id, name');

      if (ingredients) {
        // Check if pantry items already exist for this user
        const { data: existingPantryItems } = await supabase
          .from('pantry_items')
          .select('id')
          .eq('user_id', user!.id)
          .limit(1);

        // Only create sample pantry items if none exist
        if (!existingPantryItems || existingPantryItems.length === 0) {
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
            const { error: pantryError } = await supabase.from('pantry_items').insert(pantryItemsToInsert);
            if (pantryError) {
              console.error('Error inserting pantry items:', pantryError);
            }
          }
        }
      }

      setDataInitialized(true);
    } catch (error) {
      console.error('Error initializing user data:', error);
      setDataInitialized(true); // Set to true even on error to prevent infinite loops
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