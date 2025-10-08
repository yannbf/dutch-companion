import { NavLink } from "react-router-dom";
import { BookOpen, GraduationCap } from "lucide-react";

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <NavLink
          to="/verbs"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`
          }
        >
          <GraduationCap className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Verbs</span>
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
      </div>
    </nav>
  );
};
