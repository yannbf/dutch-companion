import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { vocabularyData, VocabularyWord } from "@/data/vocabulary";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { SummaryScreen } from "@/components/SummaryScreen";
import { hapticService } from "@/services/haptic";
import { createLocalStorageStore } from "@/lib/localStorage";
import { reviewTracker } from "@/lib/reviewTracker";
import { exerciseStats } from "@/lib/exerciseStats";
import { AppHeader } from "@/components/AppHeader";

interface WordResult {
  word: VocabularyWord;
  correct: boolean;
}

const DeOfHet = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<WordResult[]>([]);
  const [showSummary, setShowSummary] = useState(false);

// Create stores for localStorage data
const deOfHetStore = createLocalStorageStore<string[]>("deofhet-chapters", ["all"]);
const globalSettingsStore = createLocalStorageStore("taal-boost-global-settings", {
  showTranslation: true,
  randomMode: false,
  voiceMode: true,
});

  const words = useMemo(() => {
    const selectedChapters = deOfHetStore.get();

    let filteredWords: VocabularyWord[] = [];

    if (selectedChapters.includes("all")) {
      filteredWords = vocabularyData.flatMap(chapter => chapter.words);
    } else {
      filteredWords = vocabularyData
        .filter(chapter => selectedChapters.includes(chapter.id))
        .flatMap(chapter => chapter.words);
    }

    // Only include words with de/het articles
    const articledWords = filteredWords.filter(word =>
      word.article && (word.article === 'de' || word.article === 'het')
    );

    // Shuffle
    const globalSettings = globalSettingsStore.get();
    const randomOrder = globalSettings.randomMode;
    if (randomOrder) {
      return articledWords.sort(() => Math.random() - 0.5);
    }

    return articledWords;
  }, [deOfHetStore, globalSettingsStore]);

  const currentWord = words[currentIndex];
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      const swipedRight = info.offset.x > 0;
      const correctArticle = currentWord.article === 'de' ? true : false;
      const isCorrect = swipedRight === correctArticle;
      
      hapticService.medium();
      
      setResults([...results, { word: currentWord, correct: isCorrect }]);

      // Track incorrect/correct for review
      if (isCorrect) {
        reviewTracker.markCorrect(currentWord.word);
      } else {
        // Words in this exercise always have an article, map to the chapter by id
        reviewTracker.addIncorrect(currentWord.word);
      }

      // Record attempt in stats
      const inferredChapter = reviewTracker.findChapterIdsForWord(currentWord.word)[0]
      exerciseStats.recordAttempt('deofhet', inferredChapter, currentWord.word, isCorrect)
      
      if (currentIndex < words.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          x.set(0);
        }, 300);
      } else {
        setTimeout(() => {
          setShowSummary(true);
        }, 300);
      }
    } else {
      x.set(0);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setResults([]);
    setShowSummary(false);
  };

  const handleRestart = () => {
    navigate("/exercises");
  };

  const correctCount = results.filter(r => r.correct).length;
  const totalCards = words.length;

  if (showSummary) {
    const verbResults = results.map(r => ({
      verb: {
        infinitive: r.word.word.replace(/^(de|het)\s+/i, ''),
        translation: r.word.translation,
        imperfectumSingular: '',
        imperfectumPlural: '',
        hulpverbum: '',
        participium: '',
        category: 'hebben' as const,
        exampleImperfectum: '',
        examplePerfectum: ''
      },
      correct: r.correct
    }));

    return (
      <SummaryScreen
        finalScore={correctCount}
        totalCards={totalCards}
        onRestart={handleRestart}
        results={verbResults}
      />
    );
  }

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No words with articles found</p>
          <Button onClick={() => navigate("/exercises/deofhet")} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      <ProgressIndicator 
        totalCards={totalCards} 
        results={results.map(r => ({
          verb: {
            infinitive: r.word.word,
            translation: r.word.translation,
            imperfectumSingular: '',
            imperfectumPlural: '',
            hulpverbum: '',
            participium: '',
            category: 'hebben' as const,
            exampleImperfectum: '',
            examplePerfectum: ''
          },
          correct: r.correct
        }))} 
      />
      
      <AppHeader
        backPath="/exercises/deofhet"
        center={
          <div className="text-sm font-medium">
            {currentIndex + 1} / {totalCards}
          </div>
        }
        right={
          <div className="text-sm font-medium">
            Score: {correctCount}
          </div>
        }
      />

      {/* Floating DE and HET labels */}
      <div className="fixed top-1/2 left-8 -translate-y-1/2 z-30 pointer-events-none">
        <div className="text-6xl font-bold text-primary/20">HET</div>
      </div>
      <div className="fixed top-1/2 right-8 -translate-y-1/2 z-30 pointer-events-none">
        <div className="text-6xl font-bold text-primary/20">DE</div>
      </div>

      {/* Card */}
      <div className="flex items-center justify-center h-screen px-4">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          style={{ x, rotate, opacity }}
          className="w-full max-w-sm h-96 bg-card border rounded-2xl shadow-lg cursor-grab active:cursor-grabbing"
        >
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <p className="text-4xl font-bold">{currentWord.word.replace(/^(de|het)\s+/i, '')}</p>
            <p className="text-muted-foreground mt-4">{currentWord.translation}</p>
          </div>
        </motion.div>
      </div>

      {/* Instructions */}
      <div className="fixed bottom-24 left-0 right-0 text-center text-sm text-muted-foreground px-4">
        Swipe left for HET • Swipe right for DE
      </div>
    </div>
  );
};

export default DeOfHet;
