-- Restrict Realtime channel subscriptions so users can only join channels scoped to their own auth.uid().
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only access their own realtime channels" ON realtime.messages;

CREATE POLICY "Users can only access their own realtime channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() IN (
    'connected_accounts:' || auth.uid()::text,
    'file_metadata:' || auth.uid()::text,
    'user_preferences:' || auth.uid()::text
  )
);
