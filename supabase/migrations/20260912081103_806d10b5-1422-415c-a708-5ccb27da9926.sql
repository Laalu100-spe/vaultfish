ALTER TABLE public.file_metadata RENAME TO files;
ALTER TABLE public.files RENAME COLUMN file_name TO filename;
ALTER TABLE public.files RENAME COLUMN file_size TO size_bytes;
ALTER TABLE public.files RENAME COLUMN account_id TO source_account_id;
ALTER TABLE public.files RENAME COLUMN created_at TO uploaded_at;
ALTER TABLE public.files RENAME COLUMN source TO source_provider;
UPDATE public.files SET source_provider = CASE WHEN source_provider = 'whatsapp' THEN 'whatsapp_import' WHEN source_provider IS NULL OR source_provider = '' THEN 'upload' ELSE source_provider END;
ALTER TABLE public.files ALTER COLUMN source_provider SET DEFAULT 'upload';
ALTER TABLE public.files ALTER COLUMN source_provider SET NOT NULL;

CREATE TABLE public.file_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id uuid NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  version_no integer NOT NULL DEFAULT 1,
  filename text NOT NULL,
  size_bytes bigint NOT NULL DEFAULT 0,
  storage_path text,
  source_provider text NOT NULL DEFAULT 'upload',
  note text,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.file_versions TO authenticated;
GRANT ALL ON public.file_versions TO service_role;
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own file_versions select" ON public.file_versions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own file_versions insert" ON public.file_versions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own file_versions update" ON public.file_versions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own file_versions delete" ON public.file_versions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX file_versions_file_idx ON public.file_versions (file_id, version_no DESC);

CREATE TABLE public.file_text_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id uuid NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (file_id)
);
ALTER TABLE public.file_text_index ADD COLUMN tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.file_text_index TO authenticated;
GRANT ALL ON public.file_text_index TO service_role;
ALTER TABLE public.file_text_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own file_text_index select" ON public.file_text_index FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own file_text_index insert" ON public.file_text_index FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own file_text_index update" ON public.file_text_index FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own file_text_index delete" ON public.file_text_index FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX file_text_index_tsv_idx ON public.file_text_index USING gin (tsv);

CREATE TABLE public.file_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id uuid NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  recipient text,
  expires_at timestamptz NOT NULL,
  revoked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.file_shares TO authenticated;
GRANT ALL ON public.file_shares TO service_role;
ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own file_shares select" ON public.file_shares FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own file_shares insert" ON public.file_shares FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own file_shares update" ON public.file_shares FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own file_shares delete" ON public.file_shares FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX file_shares_file_idx ON public.file_shares (file_id);