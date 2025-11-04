import { ReactNode } from "react";
import { Check } from "lucide-react";

interface SelectionCardProps {
  /**
   * Main label/title for the card
   */
  label: string;
  /**
   * Description or subtitle text
   */
  description?: string;
  /**
   * Whether this card is currently selected
   */
  isSelected: boolean;
  /**
   * Callback when card is clicked
   */
  onClick: () => void;
  /**
   * Optional icon to display
   */
  icon?: ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Disabled state
   */
  disabled?: boolean;
}

/**
 * Reusable selection card component used across exercise setup pages.
 * Provides consistent styling and interaction patterns.
 */
export const SelectionCard = ({
  label,
  description,
  isSelected,
  onClick,
  icon,
  className = "",
  disabled = false,
}: SelectionCardProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative p-4 rounded-lg border-2 transition-all text-left
        active:scale-95 touch-manipulation
        ${
          isSelected
            ? "border-primary bg-primary/10"
            : "border-border bg-card hover:border-primary/50"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      <div className="flex items-center gap-3">
        {icon && <div className="shrink-0">{icon}</div>}
        <div className="flex-1 space-y-1">
          <div className="text-sm font-bold">{label}</div>
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
          <Check className="w-3 h-3" />
        </div>
      )}
    </button>
  );
};

