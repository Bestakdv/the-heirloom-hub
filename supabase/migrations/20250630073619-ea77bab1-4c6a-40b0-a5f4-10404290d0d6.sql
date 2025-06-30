
-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their own vaults" ON public.vaults;
DROP POLICY IF EXISTS "Users can create their own vaults" ON public.vaults;
DROP POLICY IF EXISTS "Users can update their own vaults" ON public.vaults;
DROP POLICY IF EXISTS "Users can delete their own vaults" ON public.vaults;
DROP POLICY IF EXISTS "Users can view their own stories" ON public.stories;
DROP POLICY IF EXISTS "Users can create their own stories" ON public.stories;
DROP POLICY IF EXISTS "Users can update their own stories" ON public.stories;
DROP POLICY IF EXISTS "Users can delete their own stories" ON public.stories;

-- Drop any remaining collaboration-related policies
DROP POLICY IF EXISTS "Users can view stories in their vaults or collaborated vaults" ON public.stories;
DROP POLICY IF EXISTS "Users can create stories in their vaults or collaborated vaults with permission" ON public.stories;
DROP POLICY IF EXISTS "Users can view their own vaults or vaults they collaborate on" ON public.vaults;

-- Now drop the security definer function
DROP FUNCTION IF EXISTS public.user_has_vault_access(uuid);

-- Drop the collaboration table and enum
DROP TABLE IF EXISTS public.vault_collaborators;
DROP TYPE IF EXISTS public.collaboration_permission;

-- Now create the original simple RLS policies for vaults
CREATE POLICY "Users can view their own vaults" 
  ON public.vaults 
  FOR SELECT 
  USING (auth.uid() = user_id);

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

-- Create the original simple RLS policies for stories
CREATE POLICY "Users can view their own stories" 
  ON public.stories 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stories" 
  ON public.stories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories" 
  ON public.stories 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" 
  ON public.stories 
  FOR DELETE 
  USING (auth.uid() = user_id);
