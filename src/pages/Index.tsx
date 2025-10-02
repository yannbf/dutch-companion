import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { verbData, VerbCard } from "@/data/verbs";
import { VerbCard as VerbCardComponent } from "@/components/VerbCard";
import { PointTracker } from "@/components/PointTracker";
import { CategoryFilter } from "@/components/CategoryFilter";
import { TranslationToggle } from "@/components/TranslationToggle";
import { ModeSelector } from "@/components/ModeSelector";
import { SummaryScreen } from "@/components/SummaryScreen";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface VerbResult {
  verb: VerbCard;
  correct: boolean;
}

const Index = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardState, setCardState] = useState<0 | 1 | 2>(0);
  const [points, setPoints] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [category, setCategory] = useState<"all" | "hebben" | "zijn" | "hebben/zijn">("all");
  const [mode, setMode] = useState<"short" | "long">("short");
  const [showSummary, setShowSummary] = useState(false);
  const [results, setResults] = useState<VerbResult[]>([]);
  const [sessionVerbs, setSessionVerbs] = useState<VerbCard[]>([]);

  const filteredVerbs = useMemo(() => {
    if (category === "all") return verbData;
    return verbData.filter((verb) => verb.category === category);
  }, [category]);

  const currentSessionVerbs = useMemo(() => {
    if (sessionVerbs.length > 0) return sessionVerbs;
    
    const verbs = filteredVerbs;
    if (mode === "short") {
      // Get 10 random verbs
      const shuffled = [...verbs].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(10, shuffled.length));
    }
    return verbs;
  }, [filteredVerbs, mode, sessionVerbs]);

  const currentVerb = currentSessionVerbs[currentIndex];

  const handleFlip = () => {
    setCardState((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
  };

  const handleSwipe = (direction: "left" | "right") => {
    const isCorrect = direction === "right";
    
    if (isCorrect) {
      setPoints((prev) => prev + 1);
    } else {
      setPoints((prev) => prev - 1);
    }

    // Track result
    setResults((prev) => [...prev, { verb: currentVerb, correct: isCorrect }]);

    // Reset card state and move to next card
    setCardState(0);
    
    if (currentIndex + 1 >= currentSessionVerbs.length) {
      setShowSummary(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCardState(0);
    setPoints(0);
    setShowSummary(false);
    setCategory("all");
    setResults([]);
    setSessionVerbs([]);
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setCardState(0);
    setPoints(0);
    setResults([]);
  };

  const handleCategoryChange = (newCategory: "all" | "hebben" | "zijn" | "hebben/zijn") => {
    setCategory(newCategory);
    setCurrentIndex(0);
    setCardState(0);
    setPoints(0);
    setResults([]);
    setSessionVerbs([]);
  };

  const handleModeChange = (newMode: "short" | "long") => {
    setMode(newMode);
    setCurrentIndex(0);
    setCardState(0);
    setPoints(0);
    setResults([]);
    setSessionVerbs([]);
  };

  if (showSummary) {
    return (
      <SummaryScreen
        finalScore={points}
        totalCards={currentSessionVerbs.length}
        onRestart={handleRestart}
        results={results}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <CategoryFilter currentCategory={category} onCategoryChange={handleCategoryChange} />
      <ModeSelector currentMode={mode} onModeChange={handleModeChange} />
      <PointTracker points={points} />
      <TranslationToggle showTranslation={showTranslation} onToggle={setShowTranslation} />
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleRetry}
        className="fixed top-20 right-6 bg-card border-2 border-primary font-bold"
      >
        <RotateCcw className="w-5 h-5" />
      </Button>

      <div className="flex-1 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatePresence mode="wait">
            {currentVerb && (
              <VerbCardComponent
                key={`${currentVerb.infinitive}-${currentIndex}`}
                verb={currentVerb}
                cardState={cardState}
                onFlip={handleFlip}
                onSwipe={handleSwipe}
                showTranslation={showTranslation}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 text-sm text-muted-foreground pointer-events-none">
        {currentIndex + 1} / {currentSessionVerbs.length}
      </div>
    </div>
  );
};

export default Index;
