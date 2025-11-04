import { ReactNode } from "react";

interface ExerciseProgressProps {
  /**
   * Current item/round/turn index (0-based)
   */
  current: number;
  /**
   * Total number of items/rounds/turns
   */
  total: number;
  /**
   * Display style for progress
   */
  variant?: "bar" | "dots" | "text" | "compact";
  /**
   * Optional completed items (for showing check marks)
   */
  completed?: boolean[];
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Reusable progress indicator for exercises.
 * Supports multiple display styles: bar, dots, text, or compact.
 */
export const ExerciseProgress = ({
  current,
  total,
  variant = "bar",
  completed = [],
  className = "",
}: ExerciseProgressProps) => {
  const percentage = total > 0 ? ((current + 1) / total) * 100 : 0;

  if (variant === "text") {
    return (
      <div className={`text-sm font-medium ${className}`}>
        {current + 1} / {total}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="text-sm font-medium">
          {current + 1}/{total}
        </div>
        <div className="flex-1 bg-secondary rounded-full h-1.5 min-w-[60px] max-w-[100px]">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  if (variant === "dots") {
    // Limit to showing max 10 dots for readability
    const maxDots = Math.min(total, 10);
    const dotIndexes = Array.from({ length: maxDots }, (_, i) => i);

    return (
      <div className={`flex gap-2 ${className}`}>
        {dotIndexes.map((i) => {
          const actualIndex = Math.floor((i / maxDots) * total);
          const isCompleted = completed[actualIndex] !== undefined 
            ? completed[actualIndex]
            : actualIndex < current;
          const isCurrent = actualIndex === current;

          return (
            <div
              key={i}
              className={`w-8 h-2 rounded-full transition-colors ${
                isCompleted
                  ? "bg-primary"
                  : isCurrent
                  ? "bg-primary/50"
                  : "bg-muted"
              }`}
            />
          );
        })}
      </div>
    );
  }

  // Default: bar variant
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface ExerciseProgressWithLabelProps extends ExerciseProgressProps {
  /**
   * Label to display above/beside progress
   */
  label?: ReactNode;
  /**
   * Layout direction
   */
  layout?: "vertical" | "horizontal";
}

/**
 * Progress indicator with optional label.
 * Useful for showing "Round 1/10" or similar text.
 */
export const ExerciseProgressWithLabel = ({
  label,
  layout = "vertical",
  ...progressProps
}: ExerciseProgressWithLabelProps) => {
  if (layout === "horizontal") {
    return (
      <div className="flex items-center gap-4">
        {label && <div className="text-sm font-medium whitespace-nowrap">{label}</div>}
        <ExerciseProgress {...progressProps} className="flex-1" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <div className="text-sm font-medium text-center">{label}</div>}
      <ExerciseProgress {...progressProps} />
    </div>
  );
};

