import { Zap, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ModeSelectorProps {
  currentMode: "short" | "long";
  onModeChange: (mode: "short" | "long") => void;
}

export const ModeSelector = ({ currentMode, onModeChange }: ModeSelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="fixed top-6 left-1/2 -translate-x-1/2 gap-2 bg-card border-2 border-primary font-bold">
          {currentMode === "short" ? <Zap className="w-4 h-4" /> : <List className="w-4 h-4" />}
          {currentMode === "short" ? "Quick (10)" : "Full"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card border-2 border-primary">
        <DropdownMenuItem onClick={() => onModeChange("short")} className="font-semibold cursor-pointer">
          <Zap className="w-4 h-4 mr-2" />
          Quick Mode (10 verbs)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onModeChange("long")} className="font-semibold cursor-pointer">
          <List className="w-4 h-4 mr-2" />
          Full Mode (all verbs)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
