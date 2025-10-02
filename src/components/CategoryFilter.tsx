import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CategoryFilterProps {
  currentCategory: "all" | "hebben" | "zijn" | "hebben/zijn";
  onCategoryChange: (category: "all" | "hebben" | "zijn" | "hebben/zijn") => void;
}

export const CategoryFilter = ({ currentCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="fixed top-6 left-6 gap-2 bg-card border-2 border-primary font-bold">
          <Filter className="w-4 h-4" />
          {currentCategory === "all" ? "All Verbs" : currentCategory}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card border-2 border-primary">
        <DropdownMenuItem onClick={() => onCategoryChange("all")} className="font-semibold cursor-pointer">
          All Verbs
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCategoryChange("hebben")} className="font-semibold cursor-pointer">
          hebben
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCategoryChange("zijn")} className="font-semibold cursor-pointer">
          zijn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCategoryChange("hebben/zijn")} className="font-semibold cursor-pointer">
          hebben/zijn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
