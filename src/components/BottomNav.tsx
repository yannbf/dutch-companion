import { NavLink } from "react-router-dom";
import { BookOpen, GraduationCap, Settings, BookMarked } from "lucide-react";

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <NavLink
          to="/exercises"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`
          }
        >
          <GraduationCap className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Exercises</span>
        </NavLink>

        <NavLink
          to="/vocabulary"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`
          }
        >
          <BookOpen className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Vocabulary</span>
        </NavLink>

        <NavLink
          to="/resources"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`
          }
        >
          <BookMarked className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Resources</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`
          }
        >
          <Settings className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Settings</span>
        </NavLink>
      </div>
    </nav>
  );
};
