import { useState, useEffect } from "react";
import { Languages, Shuffle, Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Load global settings from localStorage
const loadGlobalSettings = () => {
  const defaultSettings = {
    showTranslation: true,
    randomMode: false,
    voiceMode: true,
  };

  try {
    const saved = localStorage.getItem('taal-boost-global-settings');
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
  }
  
  return defaultSettings;
};

// Save global settings to localStorage
const saveGlobalSettings = (settings: {
  showTranslation: boolean;
  randomMode: boolean;
  voiceMode: boolean;
}) => {
  try {
    localStorage.setItem('taal-boost-global-settings', JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error);
  }
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
      </div>
    </div>
  );
};

export default Settings;
