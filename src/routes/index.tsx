import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout, type ScreenId } from "@/components/cloudfish/Layout";
import { HomeScreen } from "@/components/cloudfish/screens/HomeScreen";
import { CloudsScreen } from "@/components/cloudfish/screens/CloudsScreen";
import { FilesScreen } from "@/components/cloudfish/screens/FilesScreen";
import { GalleryScreen } from "@/components/cloudfish/screens/GalleryScreen";
import { UploadScreen } from "@/components/cloudfish/screens/UploadScreen";
import { AnalyticsScreen } from "@/components/cloudfish/screens/AnalyticsScreen";
import { CleanScreen } from "@/components/cloudfish/screens/CleanScreen";
import { SettingsScreen } from "@/components/cloudfish/screens/SettingsScreen";
import { Onboarding } from "@/components/cloudfish/Onboarding";
import { LoadingOverlay } from "@/components/cloudfish/LoadingOverlay";
import {
  WithSkeleton,
  HomeSkeleton,
  FilesSkeleton,
  GallerySkeleton,
  CloudsSkeleton,
  AnalyticsSkeleton,
  GenericSkeleton,
} from "@/components/cloudfish/Skeleton";

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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      if (!localStorage.getItem("vaultfish_onboarded")) setShowOnboarding(true);
    } catch {}
  }, []);

  if (hydrated && showOnboarding) {
    return <Onboarding onDone={() => setShowOnboarding(false)} />;
  }

  return (
    <Layout current={screen} onNavigate={setScreen}>
      {screen === "home" && (
        <WithSkeleton skeleton={<HomeSkeleton />}>
          <HomeScreen onNav={setScreen} />
        </WithSkeleton>
      )}
      {screen === "clouds" && (
        <WithSkeleton skeleton={<CloudsSkeleton />}>
          <CloudsScreen />
        </WithSkeleton>
      )}
      {screen === "files" && (
        <WithSkeleton skeleton={<FilesSkeleton />}>
          <FilesScreen />
        </WithSkeleton>
      )}
      {screen === "gallery" && (
        <WithSkeleton skeleton={<GallerySkeleton />}>
          <GalleryScreen />
        </WithSkeleton>
      )}
      {screen === "upload" && (
        <WithSkeleton skeleton={<GenericSkeleton />}>
          <UploadScreen />
        </WithSkeleton>
      )}
      {screen === "analytics" && (
        <WithSkeleton skeleton={<AnalyticsSkeleton />}>
          <AnalyticsScreen />
        </WithSkeleton>
      )}
      {screen === "clean" && (
        <WithSkeleton skeleton={<GenericSkeleton />}>
          <CleanScreen />
        </WithSkeleton>
      )}
      {screen === "settings" && (
        <WithSkeleton skeleton={<GenericSkeleton />}>
          <SettingsScreen />
        </WithSkeleton>
      )}
    </Layout>
  );
}
