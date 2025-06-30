
-- Create a security definer function to get user's vault access without recursion
CREATE OR REPLACE FUNCTION public.user_has_vault_access(vault_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user owns the vault or is a collaborator
  RETURN EXISTS (
    SELECT 1 FROM public.vaults 
    WHERE id = vault_id_param AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.vault_collaborators 
    WHERE vault_id = vault_id_param AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop and recreate the problematic vault policy
DROP POLICY IF EXISTS "Users can view their own vaults or vaults they collaborate on" ON public.vaults;

CREATE POLICY "Users can view their own vaults or vaults they collaborate on" 
  ON public.vaults 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.vault_collaborators 
      WHERE vault_collaborators.vault_id = id 
      AND vault_collaborators.user_id = auth.uid()
    )
  );

-- Also fix the stories policy to avoid recursion
DROP POLICY IF EXISTS "Users can view stories in their vaults or collaborated vaults" ON public.stories;

CREATE POLICY "Users can view stories in their vaults or collaborated vaults" 
  ON public.stories 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    public.user_has_vault_access(vault_id)
  );

-- Fix the insert policy for stories
DROP POLICY IF EXISTS "Users can create stories in their vaults or collaborated vaults with permission" ON public.stories;

CREATE POLICY "Users can create stories in their vaults or collaborated vaults with permission" 
  ON public.stories 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND (
      -- Own vault
      EXISTS (
        SELECT 1 FROM public.vaults 
        WHERE vaults.id = vault_id 
        AND vaults.user_id = auth.uid()
      ) OR
      -- Collaborated vault with view_and_add permission
      EXISTS (
        SELECT 1 FROM public.vault_collaborators 
        WHERE vault_collaborators.vault_id = vault_id 
        AND vault_collaborators.user_id = auth.uid()
        AND vault_collaborators.permission = 'view_and_add'
      )
    )
  );
