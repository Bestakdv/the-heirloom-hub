-- Fix the vault RLS policy for collaborators
DROP POLICY IF EXISTS "Users can view their own vaults or vaults they collaborate on" ON public.vaults;

CREATE POLICY "Users can view their own vaults or vaults they collaborate on" 
ON public.vaults 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 
    FROM vault_collaborators 
    WHERE vault_collaborators.vault_id = vaults.id 
    AND vault_collaborators.user_id = auth.uid()
  )
);