import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface PointTrackerProps {
  points: number;
  lastResult?: "correct" | "incorrect" | null;
}

export const PointTracker = ({ points, lastResult }: PointTrackerProps) => {
  const [flashColor, setFlashColor] = useState<string>("hsl(48, 100%, 50%)");

  useEffect(() => {
    if (lastResult === "correct") {
      setFlashColor("#22C55E"); // Green
      const timer = setTimeout(() => setFlashColor("hsl(48, 100%, 50%)"), 500);
      return () => clearTimeout(timer);
    } else if (lastResult === "incorrect") {
      setFlashColor("#EF4444"); // Red
      const timer = setTimeout(() => setFlashColor("hsl(48, 100%, 50%)"), 500);
      return () => clearTimeout(timer);
    }
  }, [lastResult]);

  return (
    <motion.div
      className="fixed top-6 right-6 bg-card border-2 border-primary rounded-lg px-4 py-2 shadow-lg"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-muted-foreground">SCORE</span>
        <motion.span
          key={points}
          className="text-lg font-black"
          style={{ color: flashColor }}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {points}
        </motion.span>
      </div>
    </motion.div>
  );
};
