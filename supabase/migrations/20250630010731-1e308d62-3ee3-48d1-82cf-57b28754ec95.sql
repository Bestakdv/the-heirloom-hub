
-- Create a storage bucket for story images
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-images', 'story-images', true);

-- Create storage policies to allow users to upload their own images
CREATE POLICY "Users can upload their own story images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'story-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view story images"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-images');

CREATE POLICY "Users can update their own story images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'story-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own story images"
ON storage.objects FOR DELETE
USING (bucket_id = 'story-images' AND auth.uid()::text = (storage.foldername(name))[1]);
