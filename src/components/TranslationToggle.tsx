import { Languages } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TranslationToggleProps {
  showTranslation: boolean;
  onToggle: (show: boolean) => void;
}

export const TranslationToggle = ({ showTranslation, onToggle }: TranslationToggleProps) => {
  return (
    <div className="fixed bottom-6 left-6 bg-card border-2 border-primary rounded-full px-6 py-3 shadow-lg flex items-center gap-3">
      <Languages className="w-5 h-5 text-primary" />
      <Label htmlFor="translation-toggle" className="font-bold text-sm cursor-pointer">
        Translation
      </Label>
      <Switch
        id="translation-toggle"
        checked={showTranslation}
        onCheckedChange={onToggle}
      />
    </div>
  );
};
