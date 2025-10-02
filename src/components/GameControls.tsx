import { Filter, Zap, List, Languages, Shuffle, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { verbData } from "@/data/verbs";

interface GameControlsProps {
  currentCategory: "all" | "hebben" | "zijn" | "hebben/zijn";
  onCategoryChange: (category: "all" | "hebben" | "zijn" | "hebben/zijn") => void;
  currentMode: "short" | "long";
  onModeChange: (mode: "short" | "long") => void;
  showTranslation: boolean;
  onTranslationToggle: (show: boolean) => void;
  randomMode: boolean;
  onRandomModeToggle: (random: boolean) => void;
  voiceMode: boolean;
  onVoiceModeToggle: (voice: boolean) => void;
}

export const GameControls = ({
  currentCategory,
  onCategoryChange,
  currentMode,
  onModeChange,
  showTranslation,
  onTranslationToggle,
  randomMode,
  onRandomModeToggle,
  voiceMode,
  onVoiceModeToggle,
}: GameControlsProps) => {
  const getCategoryLabel = () => {
    if (currentCategory === "all") return "All Verbs";
    return currentCategory;
  };

  const getModeLabel = () => {
    return currentMode === "short" ? "Quick (10)" : "Full";
  };

  const getVerbCount = (category: "all" | "hebben" | "zijn" | "hebben/zijn") => {
    if (category === "all") {
      return currentMode === "short" ? Math.min(10, verbData.length) : verbData.length;
    }
    const filteredVerbs = verbData.filter((verb) => verb.category === category);
    return currentMode === "short" ? Math.min(10, filteredVerbs.length) : filteredVerbs.length;
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="fixed top-6 left-6 gap-2 bg-card border-2 border-primary font-bold">
          <Filter className="w-4 h-4" />
          <div className="flex flex-col items-start">
            <span>{getCategoryLabel()}</span>
            <span className="text-xs text-muted-foreground">{getModeLabel()}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="bg-card border-2 border-primary w-64 z-50" 
        onCloseAutoFocus={(e) => e.preventDefault()}
        sideOffset={8}
      >
        {/* Verb Category Selection */}
        <div className="p-2">
          <Label className="text-sm font-semibold text-muted-foreground">Verb Categories</Label>
        </div>
        <DropdownMenuItem 
          onClick={() => onCategoryChange("all")} 
          className={`font-semibold cursor-pointer ${currentCategory === "all" ? "bg-primary/20 text-primary" : ""}`}
          onSelect={(e) => e.preventDefault()}
        >
          All Verbs ({getVerbCount("all")})
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onCategoryChange("hebben")} 
          className={`font-semibold cursor-pointer ${currentCategory === "hebben" ? "bg-primary/20 text-primary" : ""}`}
          onSelect={(e) => e.preventDefault()}
        >
          hebben ({getVerbCount("hebben")})
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onCategoryChange("zijn")} 
          className={`font-semibold cursor-pointer ${currentCategory === "zijn" ? "bg-primary/20 text-primary" : ""}`}
          onSelect={(e) => e.preventDefault()}
        >
          zijn ({getVerbCount("zijn")})
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onCategoryChange("hebben/zijn")} 
          className={`font-semibold cursor-pointer ${currentCategory === "hebben/zijn" ? "bg-primary/20 text-primary" : ""}`}
          onSelect={(e) => e.preventDefault()}
        >
          hebben/zijn ({getVerbCount("hebben/zijn")})
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Mode Selection */}
        <div className="p-2">
          <Label className="text-sm font-semibold text-muted-foreground">Game Mode</Label>
        </div>
        <DropdownMenuItem 
          onClick={() => onModeChange("short")} 
          className={`font-semibold cursor-pointer ${currentMode === "short" ? "bg-primary/20 text-primary" : ""}`}
          onSelect={(e) => e.preventDefault()}
        >
          <Zap className="w-4 h-4 mr-2" />
          Quick Mode (10 verbs)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onModeChange("long")} 
          className={`font-semibold cursor-pointer ${currentMode === "long" ? "bg-primary/20 text-primary" : ""}`}
          onSelect={(e) => e.preventDefault()}
        >
          <List className="w-4 h-4 mr-2" />
          Full Mode (all verbs)
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Toggles */}
        <div className="p-2 space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="translation-toggle" className="text-sm font-semibold cursor-pointer">
              <Languages className="w-4 h-4 inline mr-2" />
              Show Translation
            </Label>
            <Switch
              id="translation-toggle"
              checked={showTranslation}
              onCheckedChange={onTranslationToggle}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="random-toggle" className="text-sm font-semibold cursor-pointer">
              <Shuffle className="w-4 h-4 inline mr-2" />
              Random Order
            </Label>
            <Switch
              id="random-toggle"
              checked={randomMode}
              onCheckedChange={onRandomModeToggle}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="voice-toggle" className="text-sm font-semibold cursor-pointer">
              <Volume2 className="w-4 h-4 inline mr-2" />
              Voice Mode
            </Label>
            <Switch
              id="voice-toggle"
              checked={voiceMode}
              onCheckedChange={onVoiceModeToggle}
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
