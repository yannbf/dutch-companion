import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vocabularyData, VocabularyWord } from "@/data/vocabulary";
import { createLocalStorageStore } from "@/lib/localStorage";
import { speakerService } from "@/services/speaker";
import { hapticService } from "@/services/haptic";
import { reviewTracker } from "@/lib/reviewTracker";
import { exerciseStats } from "@/lib/exerciseStats";
import { motion } from "framer-motion";
import { ExerciseHeader, ExerciseProgress, ExerciseSummary } from "@/components/exercise";

interface MatchPair {
  dutchWord: string;
  englishTranslation: string;
  article?: string;
  word: VocabularyWord;
}

const selectedChaptersStore = createLocalStorageStore<number[]>('vocab-match-selected-chapters', []);
const includeFavoritesStore = createLocalStorageStore<boolean>('vocab-match-include-favorites', false);
const onlySeparableStore = createLocalStorageStore<boolean>('vocab-match-only-separable', false);
const favoritesStore = createLocalStorageStore<string[]>('vocabulary-favorites', []);

const VocabularyMatch = () => {
  const navigate = useNavigate();
  const [currentTurn, setCurrentTurn] = useState(0);
  const [selectedDutch, setSelectedDutch] = useState<number | null>(null);
  const [matches, setMatches] = useState<Set<number>>(new Set());
  const [incorrectPairs, setIncorrectPairs] = useState<Set<string>>(new Set());
  const [turnResults, setTurnResults] = useState<boolean[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const allWords = useMemo(() => {
    const selectedChapters = selectedChaptersStore.get();
    const includeFavorites = includeFavoritesStore.get();
    const favorites = favoritesStore.get();
    const onlySeparable = onlySeparableStore.get();

    let words: VocabularyWord[] = [];

    if (selectedChapters.length > 0) {
      words.push(...vocabularyData
        .filter((item) => selectedChapters.includes(item.chapter))
        .flatMap((chapter) => chapter.words));
    }

    if (includeFavorites) {
      const favoriteWords = vocabularyData
        .flatMap(chapter => chapter.words)
        .filter(word => favorites.includes(word.word));
      words.push(...favoriteWords);
    }

    if (onlySeparable) {
      words = words.filter((word) => word.category === 'scheidbare-werkwoorden');
    }

    const uniqueWords = words.filter((word, index, self) =>
      index === self.findIndex(w => w.word === word.word)
    );

    return [...uniqueWords].sort(() => Math.random() - 0.5);
  }, []);

  const turns = useMemo(() => {
    const turnsData: MatchPair[][] = [];
    const wordsPerTurn = 5;
    
    for (let i = 0; i < 5; i++) {
      const startIdx = i * wordsPerTurn;
      const turnWords = allWords.slice(startIdx, startIdx + wordsPerTurn);
      
      if (turnWords.length === 0) break;
      
      const pairs: MatchPair[] = turnWords.map(word => ({
        dutchWord: word.word,
        englishTranslation: word.translation,
        article: word.article,
        word
      }));
      
      turnsData.push(pairs);
    }
    
    return turnsData;
  }, [allWords]);

  const currentPairs = turns[currentTurn];
  const shuffledEnglish = useMemo(() => {
    if (!currentPairs) return [];
    return [...currentPairs].sort(() => Math.random() - 0.5);
  }, [currentPairs, currentTurn]);

  useEffect(() => {
    if (currentPairs && matches.size === currentPairs.length) {
      const timer = setTimeout(() => {
        if (currentTurn < 4 && currentTurn < turns.length - 1) {
          setCurrentTurn(prev => prev + 1);
          setMatches(new Set());
          setSelectedDutch(null);
          setIncorrectPairs(new Set());
          setTurnResults(prev => [...prev, true]);
        } else {
          setShowSummary(true);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [matches, currentPairs, currentTurn, turns.length]);

  const handleDutchClick = (index: number) => {
    if (matches.has(index)) return;
    
    hapticService.light();
    
    if (selectedDutch === index) {
      setSelectedDutch(null);
    } else {
      setSelectedDutch(index);
      const word = currentPairs[index];
      speakerService.speak(word.dutchWord);
    }
  };

  const handleEnglishClick = (englishTranslation: string) => {
    if (selectedDutch === null) return;
    
    hapticService.light();
    
    const dutchWord = currentPairs[selectedDutch];
    const pairKey = `${selectedDutch}-${englishTranslation}`;
    
    if (dutchWord.englishTranslation === englishTranslation) {
      hapticService.medium();
      setMatches(new Set([...matches, selectedDutch]));
      setSelectedDutch(null);
      setIncorrectPairs(new Set([...incorrectPairs].filter(k => !k.startsWith(`${selectedDutch}-`))));
      
      reviewTracker.markCorrect(dutchWord.word.word);
      const inferredChapter = reviewTracker.findChapterIdsForWord(dutchWord.word.word)[0];
      exerciseStats.recordAttempt('vocabulary', inferredChapter, dutchWord.word.word, true);
    } else {
      hapticService.medium();
      setIncorrectPairs(new Set([...incorrectPairs, pairKey]));
      
      reviewTracker.addIncorrect(dutchWord.word.word);
      const inferredChapter = reviewTracker.findChapterIdsForWord(dutchWord.word.word)[0];
      exerciseStats.recordAttempt('vocabulary', inferredChapter, dutchWord.word.word, false);
      
      setTimeout(() => {
        setIncorrectPairs(new Set([...incorrectPairs].filter(k => k !== pairKey)));
      }, 500);
    }
  };

  const handleRestart = () => {
    navigate("/exercises/vocabulary-match");
  };

  if (!currentPairs || currentPairs.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Not enough words selected. Please select more chapters.</p>
          <Button onClick={handleRestart}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (showSummary) {
    const totalMatches = turns.reduce((sum, turn) => sum + turn.length, 0);
    return (
      <ExerciseSummary
        score={totalMatches}
        total={totalMatches}
        title="Excellent Work!"
        subtitle={`You completed ${currentTurn + 1} turn${currentTurn !== 0 ? 's' : ''}`}
        actions={{
          retry: {
            label: "Play Again",
            onClick: handleRestart,
          },
          home: {
            label: "Back to Exercises",
            onClick: () => navigate("/exercises"),
          },
        }}
      >
        <div className="text-center space-y-2">
          <div className="text-6xl font-bold text-primary">{totalMatches}</div>
          <p className="text-muted-foreground">words matched</p>
        </div>
      </ExerciseSummary>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <ExerciseHeader
        onBack={handleRestart}
        center={<ExerciseProgress current={currentTurn} total={5} variant="dots" />}
        right={<div className="text-sm font-medium">Turn {currentTurn + 1}/5</div>}
      />

      <div className="pt-24 px-4 max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <p className="text-muted-foreground">
            Match the Dutch words with their English translations
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Dutch words column */}
          <div className="space-y-3">
            {currentPairs.map((pair, index) => {
              const isMatched = matches.has(index);
              const isSelected = selectedDutch === index;
              
              return (
                <motion.button
                  key={`dutch-${index}`}
                  onClick={() => handleDutchClick(index)}
                  disabled={isMatched}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    w-full p-4 rounded-lg border-2 text-left transition-all
                    touch-manipulation relative
                    ${isMatched
                      ? 'border-green-500 bg-green-500/10 cursor-not-allowed'
                      : isSelected
                      ? 'border-primary bg-primary/10 scale-105'
                      : 'border-border bg-card hover:border-primary/50 active:scale-95'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      {pair.article && (
                        <span className="text-sm text-muted-foreground mr-2">
                          {pair.article}
                        </span>
                      )}
                      <span className="font-semibold">{pair.dutchWord}</span>
                    </div>
                    {isMatched && (
                      <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
                        ✓
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* English translations column */}
          <div className="space-y-3">
            {shuffledEnglish.map((pair, index) => {
              const dutchIndex = currentPairs.findIndex(p => p.englishTranslation === pair.englishTranslation);
              const isMatched = matches.has(dutchIndex);
              const pairKey = selectedDutch !== null ? `${selectedDutch}-${pair.englishTranslation}` : '';
              const isIncorrect = incorrectPairs.has(pairKey);
              
              return (
                <motion.button
                  key={`english-${index}`}
                  onClick={() => handleEnglishClick(pair.englishTranslation)}
                  disabled={isMatched || selectedDutch === null}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: isIncorrect ? [1, 1.05, 0.95, 1.05, 1] : 1
                  }}
                  transition={{ 
                    delay: index * 0.1,
                    scale: { duration: 0.5 }
                  }}
                  className={`
                    w-full p-4 rounded-lg border-2 text-left transition-all
                    touch-manipulation
                    ${isMatched
                      ? 'border-green-500 bg-green-500/10 cursor-not-allowed'
                      : isIncorrect
                      ? 'border-red-500 bg-red-500/10'
                      : selectedDutch === null
                      ? 'border-border bg-card opacity-50 cursor-not-allowed'
                      : 'border-border bg-card hover:border-primary/50 active:scale-95'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{pair.englishTranslation}</span>
                    {isMatched && (
                      <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
                        ✓
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {matches.size === currentPairs.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <div className="inline-block px-6 py-3 bg-green-500/10 border-2 border-green-500 rounded-lg">
              <p className="text-green-500 font-semibold">Perfect! Moving to next turn...</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VocabularyMatch;
