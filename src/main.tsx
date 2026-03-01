import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { enableDeterministicModeIfRequested } from "./lib/devDeterministic";

const SW_MIGRATION_VERSION = import.meta.env.VITE_SW_MIGRATION_VERSION ?? "1";
const SW_MIGRATION_KEY = `sw-migration-v${SW_MIGRATION_VERSION}-done`;

const runServiceWorkerMigration = async () => {
  if (!("serviceWorker" in navigator)) return;

  const forcePurge = new URLSearchParams(window.location.search).get("purge-sw") === "1";
  const migrationDone = localStorage.getItem(SW_MIGRATION_KEY) === "true";
  if (migrationDone && !forcePurge) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    }

    localStorage.setItem(SW_MIGRATION_KEY, "true");
  } catch (error) {
    console.error("SW migration failed:", error);
  }
};

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    runServiceWorkerMigration().finally(() => {
      navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
    });
  });
}

enableDeterministicModeIfRequested();

createRoot(document.getElementById("root")!).render(<App />);
