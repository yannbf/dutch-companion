import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ExerciseHeaderProps {
  /**
   * Path to navigate back to (if not provided, just goes back)
   */
  backPath?: string;
  /**
   * Custom back button click handler (overrides backPath)
   */
  onBack?: () => void;
  /**
   * Content to display in the center of header
   */
  center?: ReactNode;
  /**
   * Content to display on the right side of header
   */
  right?: ReactNode;
  /**
   * Whether the header should be fixed at top
   */
  fixed?: boolean;
  /**
   * Additional className for the header container
   */
  className?: string;
}

/**
 * Reusable header component for exercise play pages.
 * Provides consistent layout with back button, center content, and right content.
 */
export const ExerciseHeader = ({
  backPath,
  onBack,
  center,
  right,
  fixed = true,
  className = "",
}: ExerciseHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const baseClasses = fixed
    ? "fixed top-0 left-0 right-0 z-50"
    : "relative";

  return (
    <div className={`${baseClasses} bg-background border-b ${className}`}>
      <div className="flex items-center justify-between px-4 h-14 max-w-4xl mx-auto">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {center && <div className="flex-1 flex justify-center mx-4">{center}</div>}

        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
    </div>
  );
};

