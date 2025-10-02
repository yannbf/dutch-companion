import { motion } from "framer-motion";

interface PointTrackerProps {
  points: number;
}

export const PointTracker = ({ points }: PointTrackerProps) => {
  return (
    <motion.div
      className="fixed top-6 right-6 bg-card border-2 border-primary rounded-full px-6 py-3 shadow-lg"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-muted-foreground">SCORE</span>
        <motion.span
          key={points}
          className="text-3xl font-black text-primary"
          initial={{ scale: 1.5, color: "hsl(48, 100%, 50%)" }}
          animate={{ scale: 1, color: "hsl(48, 100%, 50%)" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {points}
        </motion.span>
      </div>
    </motion.div>
  );
};
