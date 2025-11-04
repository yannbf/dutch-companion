import { motion } from "framer-motion";

interface ScoreDisplayProps {
  /**
   * Current score
   */
  score: number;
  /**
   * Label to display (e.g., "Score", "Points", "Correct")
   */
  label?: string;
  /**
   * Display variant
   */
  variant?: "default" | "large" | "compact";
  /**
   * Optional animation when score changes
   */
  animate?: boolean;
  /**
   * Optional feedback state for color changes
   */
  feedback?: "correct" | "incorrect" | null;
  /**
   * Optional className
   */
  className?: string;
}

/**
 * Reusable score display component for exercises.
 * Supports animations and feedback states.
 */
export const ScoreDisplay = ({
  score,
  label = "Score",
  variant = "default",
  animate = true,
  feedback = null,
  className = "",
}: ScoreDisplayProps) => {
  const getFeedbackColor = () => {
    if (feedback === "correct") return "text-green-500";
    if (feedback === "incorrect") return "text-red-500";
    return "";
  };

  if (variant === "compact") {
    return (
      <div className={`text-sm font-medium ${getFeedbackColor()} ${className}`}>
        {score}
      </div>
    );
  }

  if (variant === "large") {
    return (
      <div className={`text-center space-y-2 ${className}`}>
        <motion.div
          key={score}
          initial={animate ? { scale: 1.2, opacity: 0.8 } : {}}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`text-6xl font-bold text-primary ${getFeedbackColor()}`}
        >
          {score}
        </motion.div>
        {label && <div className="text-sm text-muted-foreground uppercase tracking-wide">{label}</div>}
      </div>
    );
  }

  // Default variant
  return (
    <motion.div
      key={score}
      initial={animate ? { scale: 1.1 } : {}}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`text-sm font-medium ${getFeedbackColor()} transition-colors duration-200 ${className}`}
    >
      {label}: {score}
    </motion.div>
  );
};

interface ScoreComparisonProps {
  /**
   * Achieved score
   */
  score: number;
  /**
   * Total possible score
   */
  total: number;
  /**
   * Display variant
   */
  variant?: "default" | "large" | "fraction";
  /**
   * Optional className
   */
  className?: string;
}

/**
 * Display score as a comparison (e.g., "15 / 20" or "75%").
 */
export const ScoreComparison = ({
  score,
  total,
  variant = "default",
  className = "",
}: ScoreComparisonProps) => {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  if (variant === "fraction") {
    return (
      <div className={`font-medium ${className}`}>
        {score} / {total}
      </div>
    );
  }

  if (variant === "large") {
    return (
      <div className={`text-center space-y-2 ${className}`}>
        <div className="text-6xl font-bold text-primary">
          {score}/{total}
        </div>
        <div className="text-2xl text-muted-foreground">{percentage}%</div>
      </div>
    );
  }

  // Default: show both fraction and percentage
  return (
    <div className={`text-center ${className}`}>
      <div className="text-2xl font-bold">
        {score} / {total}
      </div>
      <div className="text-sm text-muted-foreground">{percentage}% correct</div>
    </div>
  );
};

