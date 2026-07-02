
-- Storage RLS: users can only access files under their own userId folder
CREATE POLICY "users read own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "users insert own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "users update own files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "users delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add storage_path + deleted_at to file_metadata for real Supabase Storage integration
ALTER TABLE public.file_metadata
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS file_metadata_user_active_idx
  ON public.file_metadata (user_id, created_at DESC)
  WHERE deleted_at IS NULL;
