import { SelectionCard } from "./SelectionCard";

export interface DifficultyLevel {
  id: string;
  label: string;
  count: number;
}

interface DifficultySelectorProps {
  /**
   * Array of difficulty levels to display
   */
  difficulties: DifficultyLevel[];
  /**
   * Array of currently selected difficulty IDs
   */
  selectedDifficulties: string[];
  /**
   * Callback when a difficulty is toggled
   */
  onToggle: (difficultyId: string) => void;
  /**
   * Optional title for the section
   */
  title?: string;
  /**
   * Layout mode: grid or single column
   */
  layout?: "grid" | "column";
}

/**
 * Reusable difficulty selector component for exercises with difficulty levels.
 * Displays difficulties in a grid or column layout.
 */
export const DifficultySelector = ({
  difficulties,
  selectedDifficulties,
  onToggle,
  title = "Select Difficulty",
  layout = "grid",
}: DifficultySelectorProps) => {
  return (
    <div className="space-y-3">
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      <div
        className={
          layout === "grid"
            ? "grid grid-cols-3 gap-3"
            : "flex flex-col gap-3"
        }
      >
        {difficulties.map((difficulty) => {
          const isSelected = selectedDifficulties.includes(difficulty.id);
          return (
            <SelectionCard
              key={difficulty.id}
              label={difficulty.label}
              description={`${difficulty.count} exercises`}
              isSelected={isSelected}
              onClick={() => onToggle(difficulty.id)}
            />
          );
        })}
      </div>
    </div>
  );
};

