-- Add database constraints for security
-- Story title and content validation
ALTER TABLE public.stories 
ADD CONSTRAINT stories_title_length CHECK (char_length(title) <= 200 AND char_length(title) >= 1),
ADD CONSTRAINT stories_content_length CHECK (char_length(content) <= 100000 AND char_length(content) >= 1),
ADD CONSTRAINT stories_author_length CHECK (char_length(author) <= 100 AND char_length(author) >= 1);

-- Vault name and description validation  
ALTER TABLE public.vaults
ADD CONSTRAINT vaults_name_length CHECK (char_length(name) <= 100 AND char_length(name) >= 1),
ADD CONSTRAINT vaults_description_length CHECK (description IS NULL OR char_length(description) <= 500);

-- Profile validation
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_full_name_length CHECK (full_name IS NULL OR char_length(full_name) <= 100),
ADD CONSTRAINT profiles_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add file size and type constraints for story images
ALTER TABLE public.stories
ADD CONSTRAINT stories_images_array_size CHECK (array_length(images, 1) IS NULL OR array_length(images, 1) <= 10);

-- Create storage policies for file upload security
CREATE POLICY "File size limit for story images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'story-images' 
  AND octet_length(decode(metadata->>'size', 'escape')) <= 5242880 -- 5MB limit
);

CREATE POLICY "Only image files allowed in story-images bucket"
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'story-images' 
  AND (metadata->>'mimetype')::text ~ '^image/(jpeg|jpg|png|gif|webp)$'
);