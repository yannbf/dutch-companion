import { motion } from "framer-motion";
import { Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SummaryScreenProps {
  finalScore: number;
  totalCards: number;
  onRestart: () => void;
}

export const SummaryScreen = ({ finalScore, totalCards, onRestart }: SummaryScreenProps) => {
  const percentage = Math.round((finalScore / totalCards) * 100);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="text-center space-y-8 max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          <Trophy className="w-32 h-32 mx-auto text-primary" />
        </motion.div>

        <h1 className="text-5xl font-black text-foreground">Session Complete!</h1>

        <div className="space-y-4">
          <div className="bg-card border-2 border-primary rounded-2xl p-8">
            <p className="text-sm text-muted-foreground mb-2">Final Score</p>
            <p className="text-7xl font-black text-primary">{finalScore}</p>
            <p className="text-lg text-muted-foreground mt-4">
              {percentage}% accuracy
            </p>
          </div>

          <div className="bg-card border-2 border-secondary rounded-2xl p-6">
            <p className="text-muted-foreground">Cards reviewed</p>
            <p className="text-3xl font-bold text-foreground">{totalCards}</p>
          </div>
        </div>

        <Button
          onClick={onRestart}
          className="w-full py-6 text-xl font-black bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <RotateCcw className="w-6 h-6" />
          Practice Again
        </Button>
      </div>
    </motion.div>
  );
};
