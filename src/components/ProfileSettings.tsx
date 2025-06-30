import React, { useState, useEffect } from 'react';
import { User, Target, Save, Bell, Volume2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Profile, NutritionGoal } from '../types';

interface ProfileSettingsProps {
  userId: string;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ userId }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    daily_calories: 2000,
    daily_protein: 150,
    daily_carbs: 250,
    daily_fat: 65,
    daily_fiber: 25,
    daily_sodium: 2300,
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchProfile();
    fetchNutritionGoals();
  }, [userId]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile(data);
      setFormData(prev => ({
        ...prev,
        full_name: data.full_name || '',
      }));
    }
  };

  const fetchNutritionGoals = async () => {
    const { data, error } = await supabase
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching nutrition goals:', error);
    } else if (data) {
      setNutritionGoals(data);
      setFormData(prev => ({
        ...prev,
        daily_calories: data.daily_calories || 2000,
        daily_protein: data.daily_protein_g || 150,
        daily_carbs: data.daily_carbs_g || 250,
        daily_fat: data.daily_fat_g || 65,
        daily_fiber: data.daily_fiber_g || 25,
        daily_sodium: data.daily_sodium_mg || 2300,
      }));
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update or create profile
      if (profile) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (error) {
          console.error('Error updating profile:', error);
        }
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            email: user?.email || '',
            full_name: formData.full_name,
            subscription_tier: 'free',
            voice_settings: {},
            nutrition_preferences: {},
          });

        if (error && error.code !== '23505') {
          console.error('Error creating profile:', error);
        }
      }

      // Update or create nutrition goals
      if (nutritionGoals) {
        const { error } = await supabase
          .from('nutrition_goals')
          .update({
            daily_calories: formData.daily_calories,
            daily_protein_g: formData.daily_protein,
            daily_carbs_g: formData.daily_carbs,
            daily_fat_g: formData.daily_fat,
            daily_fiber_g: formData.daily_fiber,
            daily_sodium_mg: formData.daily_sodium,
            updated_at: new Date().toISOString(),
          })
          .eq('id', nutritionGoals.id);

        if (error) {
          console.error('Error updating nutrition goals:', error);
        }
      } else {
        const { error } = await supabase
          .from('nutrition_goals')
          .insert({
            user_id: userId,
            daily_calories: formData.daily_calories,
            daily_protein_g: formData.daily_protein,
            daily_carbs_g: formData.daily_carbs,
            daily_fat_g: formData.daily_fat,
            daily_fiber_g: formData.daily_fiber,
            daily_sodium_mg: formData.daily_sodium,
            is_active: true,
          });

        if (error) {
          console.error('Error creating nutrition goals:', error);
        }
      }

      // Refresh data
      await fetchProfile();
      await fetchNutritionGoals();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-2xl border-2 border-black shadow-solid-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-black shadow-solid-lg p-6">
        <h1 className="text-2xl font-bold text-black mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account and nutrition preferences</p>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-2xl border-2 border-black shadow-solid-lg p-6">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Profile Information
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-black rounded-xl shadow-solid-sm focus:shadow-solid focus:outline-none"
              placeholder="Enter your full name"
            />
          </div>
        </div>
      </div>

      {/* Nutrition Goals */}
      <div className="bg-white rounded-2xl border-2 border-black shadow-solid-lg p-6">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Daily Nutrition Goals
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Calories
            </label>
            <input
              type="number"
              value={formData.daily_calories}
              onChange={(e) => setFormData(prev => ({ ...prev, daily_calories: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border-2 border-black rounded-xl shadow-solid-sm focus:shadow-solid focus:outline-none"
              min="1000"
              max="5000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Protein (g)
            </label>
            <input
              type="number"
              value={formData.daily_protein}
              onChange={(e) => setFormData(prev => ({ ...prev, daily_protein: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border-2 border-black rounded-xl shadow-solid-sm focus:shadow-solid focus:outline-none"
              min="50"
              max="300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Carbohydrates (g)
            </label>
            <input
              type="number"
              value={formData.daily_carbs}
              onChange={(e) => setFormData(prev => ({ ...prev, daily_carbs: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border-2 border-black rounded-xl shadow-solid-sm focus:shadow-solid focus:outline-none"
              min="100"
              max="500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Fat (g)
            </label>
            <input
              type="number"
              value={formData.daily_fat}
              onChange={(e) => setFormData(prev => ({ ...prev, daily_fat: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border-2 border-black rounded-xl shadow-solid-sm focus:shadow-solid focus:outline-none"
              min="30"
              max="150"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Fiber (g)
            </label>
            <input
              type="number"
              value={formData.daily_fiber}
              onChange={(e) => setFormData(prev => ({ ...prev, daily_fiber: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border-2 border-black rounded-xl shadow-solid-sm focus:shadow-solid focus:outline-none"
              min="15"
              max="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Sodium (mg)
            </label>
            <input
              type="number"
              value={formData.daily_sodium}
              onChange={(e) => setFormData(prev => ({ ...prev, daily_sodium: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border-2 border-black rounded-xl shadow-solid-sm focus:shadow-solid focus:outline-none"
              min="1500"
              max="3000"
            />
          </div>
        </div>
      </div>

      {/* Voice & Notifications */}
      <div className="bg-white rounded-2xl border-2 border-black shadow-solid-lg p-6">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center">
          <Volume2 className="w-5 h-5 mr-2" />
          Voice & Notifications
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-300">
            <div>
              <h3 className="font-semibold text-black">Voice Responses</h3>
              <p className="text-sm text-gray-600">Enable text-to-speech responses</p>
            </div>
            <div className="w-12 h-6 bg-primary-500 rounded-full border-2 border-black shadow-solid-sm relative">
              <div className="w-4 h-4 bg-white rounded-full border border-black absolute top-0.5 right-0.5"></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-300">
            <div>
              <h3 className="font-semibold text-black">Meal Reminders</h3>
              <p className="text-sm text-gray-600">Get notified about meal times</p>
            </div>
            <div className="w-12 h-6 bg-gray-300 rounded-full border-2 border-black shadow-solid-sm relative">
              <div className="w-4 h-4 bg-white rounded-full border border-black absolute top-0.5 left-0.5"></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-300">
            <div>
              <h3 className="font-semibold text-black">Low Stock Alerts</h3>
              <p className="text-sm text-gray-600">Notifications for pantry items running low</p>
            </div>
            <div className="w-12 h-6 bg-primary-500 rounded-full border-2 border-black shadow-solid-sm relative">
              <div className="w-4 h-4 bg-white rounded-full border border-black absolute top-0.5 right-0.5"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-500 text-white px-6 py-3 rounded-xl border-2 border-black shadow-solid-sm hover:shadow-solid transition-all duration-200 hover:-translate-y-0.5 flex items-center space-x-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;