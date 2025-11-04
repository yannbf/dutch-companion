import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ExerciseSetupLayoutProps {
  /**
   * Title of the exercise
   */
  title: string;
  /**
   * Subtitle or description
   */
  subtitle?: string;
  /**
   * Back navigation path (defaults to /exercises)
   */
  backPath?: string;
  /**
   * Main content (selectors, options, etc.)
   */
  children: ReactNode;
  /**
   * Start button configuration
   */
  startButton?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  /**
   * Maximum width for content container
   */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
}

/**
 * Consistent layout wrapper for all exercise setup pages.
 * Provides header with back button, title, content area, and start button.
 */
export const ExerciseSetupLayout = ({
  title,
  subtitle,
  backPath = "/exercises",
  children,
  startButton,
  maxWidth = "2xl",
}: ExerciseSetupLayoutProps) => {
  const navigate = useNavigate();

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-6 px-4">
      <div className={`${maxWidthClasses[maxWidth]} mx-auto space-y-6`}>
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(backPath)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">{children}</div>

        {/* Start Button */}
        {startButton && (
          <Button
            size="lg"
            className="w-full"
            onClick={startButton.onClick}
            disabled={startButton.disabled}
          >
            {startButton.label}
          </Button>
        )}
      </div>
    </div>
  );
};

