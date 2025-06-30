/*
  # Fix nutrition goals schema and data handling

  1. Schema Updates
    - Add missing columns to nutrition_goals table
    - Ensure proper column types and defaults
  
  2. Data Integrity
    - Fix column name inconsistencies
    - Add proper constraints and defaults
*/

-- Add missing columns to nutrition_goals table
DO $$
BEGIN
  -- Add daily_fiber_g column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_goals' AND column_name = 'daily_fiber_g'
  ) THEN
    ALTER TABLE nutrition_goals ADD COLUMN daily_fiber_g real DEFAULT 25;
  END IF;

  -- Add daily_sodium_mg column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_goals' AND column_name = 'daily_sodium_mg'
  ) THEN
    ALTER TABLE nutrition_goals ADD COLUMN daily_sodium_mg real DEFAULT 2300;
  END IF;

  -- Rename daily_protein to daily_protein_g if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_goals' AND column_name = 'daily_protein'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_goals' AND column_name = 'daily_protein_g'
  ) THEN
    ALTER TABLE nutrition_goals RENAME COLUMN daily_protein TO daily_protein_g;
  END IF;

  -- Rename daily_carbs to daily_carbs_g if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_goals' AND column_name = 'daily_carbs'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_goals' AND column_name = 'daily_carbs_g'
  ) THEN
    ALTER TABLE nutrition_goals RENAME COLUMN daily_carbs TO daily_carbs_g;
  END IF;

  -- Rename daily_fat to daily_fat_g if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_goals' AND column_name = 'daily_fat'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_goals' AND column_name = 'daily_fat_g'
  ) THEN
    ALTER TABLE nutrition_goals RENAME COLUMN daily_fat TO daily_fat_g;
  END IF;
END $$;