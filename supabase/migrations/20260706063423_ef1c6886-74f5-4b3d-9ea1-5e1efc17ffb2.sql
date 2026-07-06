ALTER TABLE public.file_metadata ADD COLUMN IF NOT EXISTS source text;
CREATE INDEX IF NOT EXISTS file_metadata_user_source_idx ON public.file_metadata (user_id, source) WHERE deleted_at IS NULL;