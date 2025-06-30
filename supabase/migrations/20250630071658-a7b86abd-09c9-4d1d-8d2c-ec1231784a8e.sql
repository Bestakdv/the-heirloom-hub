
-- Create an enum for collaboration permissions
CREATE TYPE public.collaboration_permission AS ENUM ('view_only', 'view_and_add');

-- Create a table for vault collaborators
CREATE TABLE public.vault_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vault_id UUID REFERENCES public.vaults(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  invited_by UUID REFERENCES auth.users NOT NULL,
  permission public.collaboration_permission NOT NULL DEFAULT 'view_only',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vault_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.vault_collaborators ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vault_collaborators
CREATE POLICY "Vault owners can manage collaborators" 
  ON public.vault_collaborators 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.vaults 
      WHERE vaults.id = vault_collaborators.vault_id 
      AND vaults.user_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can view their own collaborations" 
  ON public.vault_collaborators 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Update vault policies to allow collaborators to view vaults
DROP POLICY IF EXISTS "Users can view their own vaults" ON public.vaults;

CREATE POLICY "Users can view their own vaults or vaults they collaborate on" 
  ON public.vaults 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.vault_collaborators 
      WHERE vault_collaborators.vault_id = vaults.id 
      AND vault_collaborators.user_id = auth.uid()
    )
  );

-- Update story policies to allow collaborators with view_and_add permission
DROP POLICY IF EXISTS "Users can view their own stories" ON public.stories;
DROP POLICY IF EXISTS "Users can create their own stories" ON public.stories;

CREATE POLICY "Users can view stories in their vaults or collaborated vaults" 
  ON public.stories 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.vaults 
      WHERE vaults.id = stories.vault_id 
      AND vaults.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.vault_collaborators 
      WHERE vault_collaborators.vault_id = stories.vault_id 
      AND vault_collaborators.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create stories in their vaults or collaborated vaults with permission" 
  ON public.stories 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND (
      -- Own vault
      EXISTS (
        SELECT 1 FROM public.vaults 
        WHERE vaults.id = stories.vault_id 
        AND vaults.user_id = auth.uid()
      ) OR
      -- Collaborated vault with view_and_add permission
      EXISTS (
        SELECT 1 FROM public.vault_collaborators 
        WHERE vault_collaborators.vault_id = stories.vault_id 
        AND vault_collaborators.user_id = auth.uid()
        AND vault_collaborators.permission = 'view_and_add'
      )
    )
  );
