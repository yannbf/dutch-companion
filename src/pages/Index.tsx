import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { verbData } from "@/data/verbs";
import { VerbCard } from "@/components/VerbCard";
import { PointTracker } from "@/components/PointTracker";
import { CategoryFilter } from "@/components/CategoryFilter";
import { TranslationToggle } from "@/components/TranslationToggle";
import { SummaryScreen } from "@/components/SummaryScreen";

const Index = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardState, setCardState] = useState<0 | 1 | 2>(0);
  const [points, setPoints] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [category, setCategory] = useState<"all" | "hebben" | "zijn" | "hebben/zijn">("all");
  const [showSummary, setShowSummary] = useState(false);

  const filteredVerbs = useMemo(() => {
    if (category === "all") return verbData;
    return verbData.filter((verb) => verb.category === category);
  }, [category]);

  const currentVerb = filteredVerbs[currentIndex];

  const handleFlip = () => {
    setCardState((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
  };

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right") {
      setPoints((prev) => prev + 1);
    } else {
      setPoints((prev) => prev - 1);
    }

    // Reset card state and move to next card
    setCardState(0);
    
    if (currentIndex + 1 >= filteredVerbs.length) {
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
  };

  const handleCategoryChange = (newCategory: "all" | "hebben" | "zijn" | "hebben/zijn") => {
    setCategory(newCategory);
    setCurrentIndex(0);
    setCardState(0);
    setPoints(0);
  };

  if (showSummary) {
    return (
      <SummaryScreen
        finalScore={points}
        totalCards={filteredVerbs.length}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <CategoryFilter currentCategory={category} onCategoryChange={handleCategoryChange} />
      <PointTracker points={points} />
      <TranslationToggle showTranslation={showTranslation} onToggle={setShowTranslation} />

      <div className="flex-1 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatePresence mode="wait">
            {currentVerb && (
              <VerbCard
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
        {currentIndex + 1} / {filteredVerbs.length}
      </div>
    </div>
  );
};

export default Index;
