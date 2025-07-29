-- Update existing profiles to include emails from auth.users
-- This is a one-time update to backfill missing email data

UPDATE public.profiles 
SET email = auth_users.email
FROM auth.users auth_users
WHERE profiles.id = auth_users.id 
AND profiles.email IS NULL;