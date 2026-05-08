import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout, type ScreenId } from "@/components/cloudfish/Layout";
import { HomeScreen } from "@/components/cloudfish/screens/HomeScreen";
import { CloudsScreen } from "@/components/cloudfish/screens/CloudsScreen";
import { FilesScreen } from "@/components/cloudfish/screens/FilesScreen";
import { GalleryScreen } from "@/components/cloudfish/screens/GalleryScreen";
import { UploadScreen } from "@/components/cloudfish/screens/UploadScreen";
import { AnalyticsScreen } from "@/components/cloudfish/screens/AnalyticsScreen";
import { CleanScreen } from "@/components/cloudfish/screens/CleanScreen";
import { SettingsScreen } from "@/components/cloudfish/screens/SettingsScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VaultFish — Swim across all your clouds" },
      { name: "description", content: "Multi-cloud file manager that unifies Google Drive, Dropbox, and OneDrive." },
    ],
  }),
  component: Index,
});

function Index() {
  const [screen, setScreen] = useState<ScreenId>("home");
  return (
    <Layout current={screen} onNavigate={setScreen}>
      {screen === "home" && <HomeScreen onNav={setScreen} />}
      {screen === "clouds" && <CloudsScreen />}
      {screen === "files" && <FilesScreen />}
      {screen === "gallery" && <GalleryScreen />}
      {screen === "upload" && <UploadScreen />}
      {screen === "analytics" && <AnalyticsScreen />}
      {screen === "clean" && <CleanScreen />}
      {screen === "settings" && <SettingsScreen />}
    </Layout>
  );
}
