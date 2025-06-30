/*
  # Fix Database Schema Issues

  This migration addresses several schema inconsistencies that are causing application errors:

  1. Database Structure Issues
     - The application expects `pantry_items` table but database has `pantry` table
     - Missing proper foreign key relationships
     - Column name mismatches in `nutrition_goals` table

  2. Schema Corrections
     - Rename `pantry` table to `pantry_items` to match application expectations
     - Fix column names in `nutrition_goals` table to match application code
     - Ensure all foreign key relationships are properly established
     - Update RLS policies to match new table structure

  3. Data Integrity
     - Preserve existing data during table restructuring
     - Maintain all security policies and constraints
*/

-- First, check if pantry_items table exists, if not rename pantry to pantry_items
DO $$
BEGIN
  -- Check if pantry table exists and pantry_items doesn't
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pantry' AND table_schema = 'public')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pantry_items' AND table_schema = 'public') THEN
    
    -- Rename pantry table to pantry_items
    ALTER TABLE pantry RENAME TO pantry_items;
    
    -- Update the unique constraint name
    ALTER INDEX pantry_user_id_ingredient_id_key RENAME TO pantry_items_user_id_ingredient_id_key;
    ALTER INDEX pantry_pkey RENAME TO pantry_items_pkey;
    
    -- Update foreign key constraint names
    ALTER TABLE pantry_items RENAME CONSTRAINT pantry_ingredient_id_fkey TO pantry_items_ingredient_id_fkey;
    ALTER TABLE pantry_items RENAME CONSTRAINT pantry_user_id_fkey TO pantry_items_user_id_fkey;
    
  END IF;
END $$;

-- Fix nutrition_goals table column names to match application expectations
DO $$
BEGIN
  -- Check if daily_protein_g exists and daily_protein doesn't
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nutrition_goals' AND column_name = 'daily_protein_g')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nutrition_goals' AND column_name = 'daily_protein') THEN
    
    -- Rename columns to match application expectations
    ALTER TABLE nutrition_goals RENAME COLUMN daily_protein_g TO daily_protein;
    ALTER TABLE nutrition_goals RENAME COLUMN daily_carbs_g TO daily_carbs;
    ALTER TABLE nutrition_goals RENAME COLUMN daily_fat_g TO daily_fat;
    ALTER TABLE nutrition_goals RENAME COLUMN daily_fiber_g TO daily_fiber;
    ALTER TABLE nutrition_goals RENAME COLUMN daily_sodium_mg TO daily_sodium;
    
  END IF;
END $$;

-- Ensure profiles table exists (it should based on schema, but let's be safe)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  subscription_tier text DEFAULT 'free',
  voice_settings jsonb DEFAULT '{}'::jsonb,
  nutrition_preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles if they don't exist
DO $$
BEGIN
  -- Check if policies exist before creating them
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile') THEN
    CREATE POLICY "Users can insert own profile" ON profiles
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can read own profile') THEN
    CREATE POLICY "Users can read own profile" ON profiles
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Update RLS policies for pantry_items to match new table name
DROP POLICY IF EXISTS "Users can manage own pantry" ON pantry_items;
CREATE POLICY "Users can manage own pantry items" ON pantry_items
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure all necessary indexes exist
CREATE INDEX IF NOT EXISTS pantry_items_user_id_idx ON pantry_items(user_id);
CREATE INDEX IF NOT EXISTS pantry_items_ingredient_id_idx ON pantry_items(ingredient_id);
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
CREATE INDEX IF NOT EXISTS nutrition_goals_user_id_idx ON nutrition_goals(user_id);
CREATE INDEX IF NOT EXISTS meals_user_id_idx ON meals(user_id);
CREATE INDEX IF NOT EXISTS meals_logged_at_idx ON meals(logged_at);