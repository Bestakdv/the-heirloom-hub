
-- Update the function to include a secure search_path
CREATE OR REPLACE FUNCTION public.update_vault_story_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.vaults 
    SET story_count = story_count + 1,
        updated_at = now()
    WHERE id = NEW.vault_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.vaults 
    SET story_count = story_count - 1,
        updated_at = now()
    WHERE id = OLD.vault_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
