import { useState, useEffect } from "react";
import { Languages, Shuffle, Volume2, Trash2, Database } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { createLocalStorageStore, localStorageUtils } from "@/lib/localStorage";

// Create a store for global settings
const globalSettingsStore = createLocalStorageStore('taal-boost-global-settings', {
  showTranslation: true,
  randomMode: false,
  voiceMode: true,
});

// Load global settings from localStorage using the robust utility
const loadGlobalSettings = () => {
  return globalSettingsStore.get();
};

// Save global settings to localStorage using the robust utility
const saveGlobalSettings = (settings: {
  showTranslation: boolean;
  randomMode: boolean;
  voiceMode: boolean;
}) => {
  globalSettingsStore.set(settings);
};

const Settings = () => {
  const [showTranslation, setShowTranslation] = useState(loadGlobalSettings().showTranslation);
  const [randomMode, setRandomMode] = useState(loadGlobalSettings().randomMode);
  const [voiceMode, setVoiceMode] = useState(loadGlobalSettings().voiceMode);

  useEffect(() => {
    saveGlobalSettings({ showTranslation, randomMode, voiceMode });
  }, [showTranslation, randomMode, voiceMode]);

  return (
    <div className="min-h-screen bg-background pb-20 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your learning experience</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Global Settings</CardTitle>
            <CardDescription>These settings apply to all exercises</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="translation-toggle" className="text-base font-semibold cursor-pointer flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  Show Translation
                </Label>
                <p className="text-sm text-muted-foreground">Display translations on flashcards</p>
              </div>
              <Switch
                id="translation-toggle"
                checked={showTranslation}
                onCheckedChange={setShowTranslation}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="random-toggle" className="text-base font-semibold cursor-pointer flex items-center gap-2">
                  <Shuffle className="w-5 h-5" />
                  Random Order
                </Label>
                <p className="text-sm text-muted-foreground">Shuffle cards in random order</p>
              </div>
              <Switch
                id="random-toggle"
                checked={randomMode}
                onCheckedChange={setRandomMode}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="voice-toggle" className="text-base font-semibold cursor-pointer flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Voice Mode
                </Label>
                <p className="text-sm text-muted-foreground">Automatically speak words out loud</p>
              </div>
              <Switch
                id="voice-toggle"
                checked={voiceMode}
                onCheckedChange={setVoiceMode}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Management
            </CardTitle>
            <CardDescription>Manage your app data and storage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Clear All Data</Label>
                <p className="text-sm text-muted-foreground">Reset all settings, favorites, and progress</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear All App Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset all your settings, favorites, progress, and preferences.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        localStorageUtils.forceFlush();
                        // Force reload to reinitialize with fresh data
                        window.location.reload();
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear All Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                <p>App Version: {localStorageUtils.getCurrentVersion()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
