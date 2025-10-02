import { motion } from "framer-motion";
import { Trophy, RotateCcw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerbCard } from "@/data/verbs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { speakerService } from "@/services/speaker";

interface VerbResult {
  verb: VerbCard;
  correct: boolean;
}

interface SummaryScreenProps {
  finalScore: number;
  totalCards: number;
  onRestart: () => void;
  results: VerbResult[];
}

export const SummaryScreen = ({ finalScore, totalCards, onRestart, results }: SummaryScreenProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const percentage = Math.round((finalScore / totalCards) * 100);

  const handleVerbClick = (verb: VerbCard) => {
    speakerService.speak(verb.infinitive);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="text-center space-y-8 max-w-md w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          <Trophy className="w-32 h-32 mx-auto text-primary" />
        </motion.div>

        <h1 className="text-5xl font-black text-foreground">Session Complete!</h1>

        <div className="space-y-4">
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <CollapsibleTrigger asChild>
              <div className="bg-card border-2 border-primary rounded-2xl p-8 cursor-pointer hover:bg-primary/5 transition-colors relative">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Final Score</p>
                  <p className="text-7xl font-black text-primary">{finalScore}</p>
                  <p className="text-lg text-muted-foreground mt-4">
                    {finalScore}/{totalCards} ({percentage}% accuracy)
                  </p>
                </div>
                <ChevronDown className={`w-8 h-8 transition-transform absolute top-4 right-4 ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="bg-card border-2 border-primary rounded-2xl p-4 space-y-2 max-h-64 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg cursor-pointer hover:bg-secondary/30 transition-colors"
                    onClick={() => handleVerbClick(result.verb)}
                  >
                    <span className="font-bold text-foreground">{result.verb.infinitive}</span>
                    <span
                      className={`w-3 h-3 rounded-full ${
                        result.correct ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
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
