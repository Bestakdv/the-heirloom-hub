-- Fix any invalid email formats first
UPDATE public.profiles 
SET email = NULL 
WHERE email IS NOT NULL 
AND email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';

-- Add constraints one by one
-- Story constraints
ALTER TABLE public.stories 
ADD CONSTRAINT stories_title_length CHECK (char_length(title) <= 200 AND char_length(title) >= 1);

ALTER TABLE public.stories 
ADD CONSTRAINT stories_content_length CHECK (char_length(content) <= 100000 AND char_length(content) >= 1);

ALTER TABLE public.stories 
ADD CONSTRAINT stories_author_length CHECK (char_length(author) <= 100 AND char_length(author) >= 1);

-- Vault constraints
ALTER TABLE public.vaults
ADD CONSTRAINT vaults_name_length CHECK (char_length(name) <= 100 AND char_length(name) >= 1);

ALTER TABLE public.vaults
ADD CONSTRAINT vaults_description_length CHECK (description IS NULL OR char_length(description) <= 500);