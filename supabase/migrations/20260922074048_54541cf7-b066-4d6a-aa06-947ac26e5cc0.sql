CREATE POLICY "no direct access to app_user_connections"
ON public.app_user_connections
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);