/*
  # Fix Schema Mismatches

  1. Missing Tables and Columns
    - The application expects certain tables and columns that don't exist
    - Need to align code with actual database schema provided

  2. Table Structure Updates
    - Update nutrition_goals to match expected columns
    - Ensure proper relationships exist

  3. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Update nutrition_goals table to match application expectations
DO $$
BEGIN
  -- Add missing columns to nutrition_goals if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_goals' AND column_name = 'daily_protein_g'
  ) THEN
    ALTER TABLE nutrition_goals RENAME COLUMN daily_protein_g TO daily_protein;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_goals' AND column_name = 'daily_carbs_g'
  ) THEN
    ALTER TABLE nutrition_goals RENAME COLUMN daily_carbs_g TO daily_carbs;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_goals' AND column_name = 'daily_fat_g'
  ) THEN
    ALTER TABLE nutrition_goals RENAME COLUMN daily_fat_g TO daily_fat;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_goals' AND column_name = 'daily_fiber_g'
  ) THEN
    ALTER TABLE nutrition_goals RENAME COLUMN daily_fiber_g TO daily_fiber;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_goals' AND column_name = 'daily_sodium_mg'
  ) THEN
    ALTER TABLE nutrition_goals RENAME COLUMN daily_sodium_mg TO daily_sodium;
  END IF;

  -- Add is_active column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_goals' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE nutrition_goals ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Create profiles table if it doesn't exist (application expects this)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  subscription_tier text DEFAULT 'free',
  voice_settings jsonb DEFAULT '{}',
  nutrition_preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create pantry_items table if it doesn't exist (application expects this instead of pantry)
CREATE TABLE IF NOT EXISTS pantry_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  ingredient_id uuid REFERENCES ingredients(id),
  quantity real DEFAULT 0,
  unit text DEFAULT 'units',
  expiry_date date,
  low_stock_threshold real DEFAULT 1,
  is_low_stock boolean DEFAULT false,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(user_id, ingredient_id)
);

-- Enable RLS on new tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add RLS policies for pantry_items
CREATE POLICY "Users can manage own pantry items"
  ON pantry_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update ingredients table to match expected structure
DO $$
BEGIN
  -- Rename columns to match application expectations
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ingredients' AND column_name = 'calories_per_serving'
  ) THEN
    ALTER TABLE ingredients RENAME COLUMN calories_per_serving TO calories_per_100g;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ingredients' AND column_name = 'protein_g'
  ) THEN
    ALTER TABLE ingredients RENAME COLUMN protein_g TO protein_per_100g;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ingredients' AND column_name = 'carbs_g'
  ) THEN
    ALTER TABLE ingredients RENAME COLUMN carbs_g TO carbs_per_100g;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ingredients' AND column_name = 'fat_g'
  ) THEN
    ALTER TABLE ingredients RENAME COLUMN fat_g TO fat_per_100g;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ingredients' AND column_name = 'fiber_g'
  ) THEN
    ALTER TABLE ingredients RENAME COLUMN fiber_g TO fiber_per_100g;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ingredients' AND column_name = 'sugar_g'
  ) THEN
    ALTER TABLE ingredients RENAME COLUMN sugar_g TO sugar_per_100g;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ingredients' AND column_name = 'sodium_mg'
  ) THEN
    ALTER TABLE ingredients RENAME COLUMN sodium_mg TO sodium_per_100g;
  END IF;

  -- Add missing columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ingredients' AND column_name = 'micronutrients'
  ) THEN
    ALTER TABLE ingredients ADD COLUMN micronutrients jsonb DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ingredients' AND column_name = 'common_portions'
  ) THEN
    ALTER TABLE ingredients ADD COLUMN common_portions jsonb DEFAULT '{}';
  END IF;
END $$;

-- Update meals table to match expected structure
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meals' AND column_name = 'total_protein_g'
  ) THEN
    ALTER TABLE meals RENAME COLUMN total_protein_g TO total_protein;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meals' AND column_name = 'total_carbs_g'
  ) THEN
    ALTER TABLE meals RENAME COLUMN total_carbs_g TO total_carbs;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meals' AND column_name = 'total_fat_g'
  ) THEN
    ALTER TABLE meals RENAME COLUMN total_fat_g TO total_fat;
  END IF;

  -- Add missing columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meals' AND column_name = 'is_favorite'
  ) THEN
    ALTER TABLE meals ADD COLUMN is_favorite boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meals' AND column_name = 'notes'
  ) THEN
    ALTER TABLE meals ADD COLUMN notes text;
  END IF;
END $$;

-- Update meal_ingredients table to match expected structure
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meal_ingredients' AND column_name = 'protein_g'
  ) THEN
    ALTER TABLE meal_ingredients RENAME COLUMN protein_g TO protein;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meal_ingredients' AND column_name = 'carbs_g'
  ) THEN
    ALTER TABLE meal_ingredients RENAME COLUMN carbs_g TO carbs;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meal_ingredients' AND column_name = 'fat_g'
  ) THEN
    ALTER TABLE meal_ingredients RENAME COLUMN fat_g TO fat;
  END IF;
END $$;