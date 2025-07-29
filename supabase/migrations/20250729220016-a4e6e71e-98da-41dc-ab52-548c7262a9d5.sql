-- Fix the stories RLS policy for collaborators
DROP POLICY IF EXISTS "Users can view stories in their vaults or collaborated vaults" ON public.stories;

CREATE POLICY "Users can view stories in their vaults or collaborated vaults" 
ON public.stories 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 
    FROM vaults 
    WHERE vaults.id = stories.vault_id 
    AND vaults.user_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 
    FROM vault_collaborators 
    WHERE vault_collaborators.vault_id = stories.vault_id 
    AND vault_collaborators.user_id = auth.uid()
  )
);

-- Also fix the stories INSERT policy for collaborators
DROP POLICY IF EXISTS "Users can create stories in their vaults or collaborated vaults" ON public.stories;

CREATE POLICY "Users can create stories in their vaults or collaborated vaults" 
ON public.stories 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND (
    EXISTS (
      SELECT 1 
      FROM vaults 
      WHERE vaults.id = stories.vault_id 
      AND vaults.user_id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 
      FROM vault_collaborators 
      WHERE vault_collaborators.vault_id = stories.vault_id 
      AND vault_collaborators.user_id = auth.uid() 
      AND vault_collaborators.permission = 'view_and_add'
    )
  )
);