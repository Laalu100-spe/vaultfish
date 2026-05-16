import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type ConnectedAccount = {
  id: string;
  user_id: string;
  platform: "google_drive" | "dropbox" | "onedrive";
  email: string;
  display_name: string | null;
  storage_used: number;
  storage_total: number;
  connected_at: string;
  is_active: boolean;
};

export const PLATFORM_LABEL: Record<ConnectedAccount["platform"], string> = {
  google_drive: "Google Drive",
  dropbox: "Dropbox",
  onedrive: "OneDrive",
};

// Bytes <-> GB
export const GB = 1024 * 1024 * 1024;

export function useConnectedAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAccounts([]);
      setLoading(false);
      return;
    }
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("connected_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("connected_at", { ascending: true });
      if (active && data) setAccounts(data as ConnectedAccount[]);
      if (active) setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`connected_accounts:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "connected_accounts", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { accounts, loading };
}
