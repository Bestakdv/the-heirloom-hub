
-- First, let's check if we need to add any missing policies by trying to create them with IF NOT EXISTS equivalent
-- Since Postgres doesn't have IF NOT EXISTS for policies, we'll drop and recreate them

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create their own vaults" ON public.vaults;
DROP POLICY IF EXISTS "Users can update their own vaults" ON public.vaults;
DROP POLICY IF EXISTS "Users can delete their own vaults" ON public.vaults;

-- Recreate the policies
CREATE POLICY "Users can create their own vaults" 
  ON public.vaults 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vaults" 
  ON public.vaults 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vaults" 
  ON public.vaults 
  FOR DELETE 
  USING (auth.uid() = user_id);
