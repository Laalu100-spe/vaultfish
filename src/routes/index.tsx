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
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { PreferencesProvider } from "@/context/PreferencesContext";
import { Toaster } from "sonner";

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
  return (
    <AuthProvider>
      <PreferencesProvider>
        <Toaster position="top-center" theme="dark" />
        <AuthedApp />
      </PreferencesProvider>
    </AuthProvider>
  );
}

function AuthedApp() {
  const { session, loading } = useAuth();
  const [screen, setScreen] = useState<ScreenId>("home");
  const [appLoading, setAppLoading] = useState(true);

  if (loading) {
    return (
      <div
        style={{
          position: "fixed", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "#0b1020", color: "#4d90fe",
          fontFamily: '"Inter", sans-serif', fontSize: 14,
        }}
      >
        Loading…
      </div>
    );
  }

  if (!session) {
    return <Onboarding onDone={() => { /* signs in within onboarding */ }} />;
  }

  return (
    <>
      {appLoading && <LoadingOverlay onDone={() => setAppLoading(false)} />}
      <Layout current={screen} onNavigate={setScreen}>
        <div key={screen} className="vf-screen-in">
          {screen === "home" && (
            <WithSkeleton skeleton={<HomeSkeleton />}><HomeScreen onNav={setScreen} /></WithSkeleton>
          )}
          {screen === "clouds" && (
            <WithSkeleton skeleton={<CloudsSkeleton />}><CloudsScreen /></WithSkeleton>
          )}
          {screen === "files" && (
            <WithSkeleton skeleton={<FilesSkeleton />}><FilesScreen /></WithSkeleton>
          )}
          {screen === "gallery" && (
            <WithSkeleton skeleton={<GallerySkeleton />}><GalleryScreen /></WithSkeleton>
          )}
          {screen === "upload" && (
            <WithSkeleton skeleton={<GenericSkeleton />}><UploadScreen autoOpen /></WithSkeleton>
          )}
          {screen === "analytics" && (
            <WithSkeleton skeleton={<AnalyticsSkeleton />}><AnalyticsScreen /></WithSkeleton>
          )}
          {screen === "clean" && (
            <WithSkeleton skeleton={<GenericSkeleton />}><CleanScreen /></WithSkeleton>
          )}
          {screen === "settings" && (
            <WithSkeleton skeleton={<GenericSkeleton />}><SettingsScreen /></WithSkeleton>
          )}
        </div>
      </Layout>
    </>
  );
}
