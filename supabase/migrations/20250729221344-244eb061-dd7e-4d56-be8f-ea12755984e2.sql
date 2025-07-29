-- First, let's check and fix any existing data that might violate constraints
-- Truncate any overly long content
UPDATE public.stories 
SET content = LEFT(content, 100000) 
WHERE char_length(content) > 100000;

UPDATE public.stories 
SET title = LEFT(title, 200) 
WHERE char_length(title) > 200;

UPDATE public.stories 
SET author = LEFT(author, 100) 
WHERE char_length(author) > 100;

-- Ensure no empty required fields
UPDATE public.stories 
SET title = 'Untitled Story' 
WHERE title = '' OR title IS NULL;

UPDATE public.stories 
SET content = 'No content provided' 
WHERE content = '' OR content IS NULL;

UPDATE public.stories 
SET author = 'Unknown Author' 
WHERE author = '' OR author IS NULL;

-- Fix vault data
UPDATE public.vaults 
SET name = LEFT(name, 100) 
WHERE char_length(name) > 100;

UPDATE public.vaults 
SET name = 'Untitled Vault' 
WHERE name = '' OR name IS NULL;

UPDATE public.vaults 
SET description = LEFT(description, 500) 
WHERE description IS NOT NULL AND char_length(description) > 500;

-- Fix profile data
UPDATE public.profiles 
SET full_name = LEFT(full_name, 100) 
WHERE full_name IS NOT NULL AND char_length(full_name) > 100;