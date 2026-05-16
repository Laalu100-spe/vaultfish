import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export type Preferences = {
  auto_optimize: boolean;
  smart_split: boolean;
  encryption_enabled: boolean;
  dark_mode: boolean;
  compact_view: boolean;
  default_upload_destination: string | null;
};

const DEFAULTS: Preferences = {
  auto_optimize: true,
  smart_split: true,
  encryption_enabled: false,
  dark_mode: true,
  compact_view: false,
  default_upload_destination: null,
};

type Ctx = {
  prefs: Preferences;
  update: (patch: Partial<Preferences>) => Promise<void>;
};

const PrefCtx = createContext<Ctx | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);

  useEffect(() => {
    if (!user) {
      setPrefs(DEFAULTS);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setPrefs({
          auto_optimize: data.auto_optimize,
          smart_split: data.smart_split,
          encryption_enabled: data.encryption_enabled,
          dark_mode: data.dark_mode,
          compact_view: data.compact_view,
          default_upload_destination: data.default_upload_destination,
        });
      } else {
        await supabase.from("user_preferences").insert({ user_id: user.id });
        setPrefs(DEFAULTS);
      }
    })();
  }, [user]);

  const update = async (patch: Partial<Preferences>) => {
    if (!user) return;
    setPrefs((p) => ({ ...p, ...patch }));
    await supabase
      .from("user_preferences")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
  };

  return <PrefCtx.Provider value={{ prefs, update }}>{children}</PrefCtx.Provider>;
}

export function usePreferences() {
  const v = useContext(PrefCtx);
  if (!v) throw new Error("usePreferences must be used within PreferencesProvider");
  return v;
}
