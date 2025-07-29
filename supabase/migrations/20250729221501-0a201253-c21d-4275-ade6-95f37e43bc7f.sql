-- Add remaining profile and image constraints
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_full_name_length CHECK (full_name IS NULL OR char_length(full_name) <= 100);

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.stories
ADD CONSTRAINT stories_images_array_size CHECK (array_length(images, 1) IS NULL OR array_length(images, 1) <= 10);