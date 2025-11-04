import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreComparison } from "./ScoreDisplay";
import { Trophy, RotateCcw, Home } from "lucide-react";

interface ExerciseSummaryProps {
  /**
   * Final score achieved
   */
  score: number;
  /**
   * Total possible score
   */
  total: number;
  /**
   * Main title (default: auto-generated based on score)
   */
  title?: string;
  /**
   * Subtitle or message
   */
  subtitle?: string;
  /**
   * Custom content to display (replaces default score display)
   */
  children?: ReactNode;
  /**
   * Action buttons configuration
   */
  actions?: {
    retry?: {
      label?: string;
      onClick: () => void;
    };
    home?: {
      label?: string;
      onClick: () => void;
    };
    custom?: Array<{
      label: string;
      onClick: () => void;
      variant?: "default" | "outline" | "secondary";
    }>;
  };
  /**
   * Optional details to show below score
   */
  details?: ReactNode;
  /**
   * Animation variant
   */
  animate?: boolean;
}

/**
 * Reusable summary/results screen component for exercises.
 * Displays score, actions, and optional custom content.
 */
export const ExerciseSummary = ({
  score,
  total,
  title,
  subtitle,
  children,
  actions,
  details,
  animate = true,
}: ExerciseSummaryProps) => {
  // Auto-generate title based on performance
  const getDefaultTitle = () => {
    const percentage = (score / total) * 100;
    if (percentage === 100) return "Perfect! 🎉";
    if (percentage >= 90) return "Excellent Work!";
    if (percentage >= 75) return "Great Job!";
    if (percentage >= 60) return "Well Done!";
    if (percentage >= 50) return "Good Effort!";
    return "Keep Practicing!";
  };

  const displayTitle = title || getDefaultTitle();
  const percentage = (score / total) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pb-20">
      <motion.div
        initial={animate ? { opacity: 0, scale: 0.9 } : {}}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="p-8 space-y-6">
          {/* Trophy Icon for high scores */}
          {percentage >= 80 && (
            <motion.div
              initial={animate ? { scale: 0, rotate: -180 } : {}}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </motion.div>
          )}

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">{displayTitle}</h1>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Score or Custom Content */}
          {children ? (
            <div>{children}</div>
          ) : (
            <ScoreComparison score={score} total={total} variant="large" />
          )}

          {/* Optional Details */}
          {details && (
            <div className="pt-4 border-t text-center text-sm text-muted-foreground">
              {details}
            </div>
          )}

          {/* Action Buttons */}
          {actions && (
            <div className="flex flex-col gap-3 pt-4">
              {/* Custom actions first */}
              {actions.custom?.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || "default"}
                  size="lg"
                  className="w-full"
                >
                  {action.label}
                </Button>
              ))}

              {/* Standard actions */}
              <div className="grid grid-cols-2 gap-3">
                {actions.retry && (
                  <Button
                    onClick={actions.retry.onClick}
                    size="lg"
                    variant="default"
                    className="w-full"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {actions.retry.label || "Try Again"}
                  </Button>
                )}
                {actions.home && (
                  <Button
                    onClick={actions.home.onClick}
                    size="lg"
                    variant="outline"
                    className="w-full"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    {actions.home.label || "Home"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

interface QuickSummaryProps {
  /**
   * Score achieved
   */
  score: number;
  /**
   * Total possible
   */
  total: number;
  /**
   * Retry handler
   */
  onRetry: () => void;
  /**
   * Home/back handler
   */
  onHome: () => void;
}

/**
 * Quick summary component with sensible defaults.
 * For when you just need a simple results screen.
 */
export const QuickSummary = ({ score, total, onRetry, onHome }: QuickSummaryProps) => {
  return (
    <ExerciseSummary
      score={score}
      total={total}
      actions={{
        retry: { onClick: onRetry },
        home: { onClick: onHome },
      }}
    />
  );
};

