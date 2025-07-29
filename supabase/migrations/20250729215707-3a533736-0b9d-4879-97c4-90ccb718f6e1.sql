-- Update RLS policy to allow finding users by email for collaboration
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- New policy that allows users to find other users by email for collaboration
CREATE POLICY "Users can view profiles for collaboration" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR  -- Users can still view their own profile
  email IS NOT NULL   -- Users can find others by email for collaboration
);