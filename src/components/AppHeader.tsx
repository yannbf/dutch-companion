import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

interface AppHeaderProps {
  /**
   * Title to display in the header
   */
  title?: string;
  /**
   * Show back button
   */
  showBack?: boolean;
  /**
   * Path to navigate back to (if not provided, goes back in history)
   */
  backPath?: string;
  /**
   * Custom back button click handler (overrides backPath)
   */
  onBack?: () => void;
  /**
   * Show home button (navigates to /exercises)
   */
  showHome?: boolean;
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
   * Whether to add blur effect to background
   */
  blur?: boolean;
  /**
   * Additional className for the header container
   */
  className?: string;
}

/**
 * Consistent app-wide header component.
 * Provides flexible layout with back button, title, center content, and right content.
 */
export const AppHeader = ({
  title,
  showBack = true,
  backPath,
  onBack,
  showHome = false,
  center,
  right,
  fixed = true,
  blur = false,
  className = "",
}: AppHeaderProps) => {
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
    ? "fixed top-0 left-0 right-0 z-40"
    : "relative";

  const backgroundClasses = blur
    ? "bg-background/80 backdrop-blur-sm"
    : "bg-background";

  return (
    <div className={`${baseClasses} ${backgroundClasses} border-b ${className}`}>
      <div className="flex items-center justify-between px-4 h-14 max-w-4xl mx-auto">
        {/* Left side - Back or Home button */}
        <div className="flex items-center gap-2">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          {showHome && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/exercises")}
            >
              <Home className="w-5 h-5" />
            </Button>
          )}
          {!showBack && !showHome && <div className="w-10" />}
        </div>

        {/* Center - Title or custom content */}
        <div className="flex-1 flex justify-center mx-4">
          {center || (
            title && (
              <h1 className="text-lg font-semibold truncate">{title}</h1>
            )
          )}
        </div>

        {/* Right side - Custom content or spacer */}
        <div className="flex items-center gap-2 min-w-[40px] justify-end">
          {right}
        </div>
      </div>
    </div>
  );
};

