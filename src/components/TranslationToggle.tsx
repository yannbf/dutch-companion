import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TranslationToggleProps {
  showTranslation: boolean;
  onToggle: (show: boolean) => void;
}

export const TranslationToggle = ({ showTranslation, onToggle }: TranslationToggleProps) => {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => onToggle(!showTranslation)}
      className={`fixed top-6 right-6 border-2 ${
        showTranslation ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-primary'
      }`}
    >
      <Languages className="w-5 h-5" />
    </Button>
  );
};
