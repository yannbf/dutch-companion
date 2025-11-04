import { SelectionCard } from "./SelectionCard";
import { ReactNode } from "react";

export interface ModeOption {
  id: string;
  label: string;
  description: string;
  icon?: ReactNode;
}

interface ModeSelectorProps<T extends string> {
  /**
   * Array of mode options to display
   */
  modes: ModeOption[];
  /**
   * Currently selected mode ID
   */
  selectedMode: T;
  /**
   * Callback when a mode is selected
   */
  onSelect: (modeId: T) => void;
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
 * Reusable mode selector component for exercises with different modes.
 * Displays modes in a grid or column layout (single-select).
 */
export function ModeSelector<T extends string>({
  modes,
  selectedMode,
  onSelect,
  title = "Select Mode",
  layout = "grid",
}: ModeSelectorProps<T>) {
  return (
    <div className="space-y-3">
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      <div
        className={
          layout === "grid"
            ? "grid grid-cols-2 gap-3"
            : "flex flex-col gap-3"
        }
      >
        {modes.map((mode) => {
          const isSelected = selectedMode === mode.id;
          return (
            <SelectionCard
              key={mode.id}
              label={mode.label}
              description={mode.description}
              icon={mode.icon}
              isSelected={isSelected}
              onClick={() => onSelect(mode.id as T)}
            />
          );
        })}
      </div>
    </div>
  );
}

