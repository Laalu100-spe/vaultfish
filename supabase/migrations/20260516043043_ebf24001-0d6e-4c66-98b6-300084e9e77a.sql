
-- connected_accounts
CREATE TABLE public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('google_drive','dropbox','onedrive')),
  email TEXT NOT NULL,
  display_name TEXT,
  storage_used BIGINT NOT NULL DEFAULT 0,
  storage_total BIGINT NOT NULL DEFAULT 0,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own connected_accounts select" ON public.connected_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own connected_accounts insert" ON public.connected_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own connected_accounts update" ON public.connected_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own connected_accounts delete" ON public.connected_accounts FOR DELETE USING (auth.uid() = user_id);

-- user_preferences
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_optimize BOOLEAN NOT NULL DEFAULT true,
  smart_split BOOLEAN NOT NULL DEFAULT true,
  encryption_enabled BOOLEAN NOT NULL DEFAULT false,
  dark_mode BOOLEAN NOT NULL DEFAULT true,
  compact_view BOOLEAN NOT NULL DEFAULT false,
  default_upload_destination TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own user_preferences select" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own user_preferences insert" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own user_preferences update" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own user_preferences delete" ON public.user_preferences FOR DELETE USING (auth.uid() = user_id);

-- file_metadata
CREATE TABLE public.file_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.connected_accounts(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  file_type TEXT,
  cloud_path TEXT,
  last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_duplicate BOOLEAN NOT NULL DEFAULT false,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.file_metadata ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own file_metadata select" ON public.file_metadata FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own file_metadata insert" ON public.file_metadata FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own file_metadata update" ON public.file_metadata FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own file_metadata delete" ON public.file_metadata FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.connected_accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.file_metadata;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_preferences;
