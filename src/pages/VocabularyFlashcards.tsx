import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { vocabularyData, getVocabularyData } from "@/data/vocabulary";
import type { VocabularyWord } from "@/data/types";
import { SwipeableCardPile, CardContent } from "@/components/SwipeableCardPile";
import { Button } from "@/components/ui/button";
import { RotateCcw, BarChart2, Volume2, ChevronDown } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { speakerService } from "@/services/speaker";
import { ReactNode } from "react";
import { createLocalStorageStore } from "@/lib/localStorage";
import { reviewTracker } from "@/lib/reviewTracker";
import { exerciseStats } from "@/lib/exerciseStats";
import { isE2EDeterministicMode } from "@/lib/devDeterministic";
import { ExerciseSummary, ChapterSelector, SelectionCard } from "@/components/exercise";
import { AppHeader } from "@/components/AppHeader";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Convert VocabularyWord to generic CardContent format
const createVocabularyCardContent = (word: VocabularyWord, flipped: boolean): CardContent => ({
  id: word.word,
  states: [
    // Front side
    flipped ? {
      id: "front",
      content: (
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <p data-testid="vocab-translation" className="text-2xl text-muted-foreground font-medium">{word.translation}</p>
          </div>
        </div>
      ) as ReactNode,
    } : {
      id: "front",
      content: (
        <div className="text-center space-y-6">
          <div className="space-y-2">
            {word.article && (
              <p className="text-2xl text-muted-foreground font-medium">{word.article}</p>
            )}
            <h2 className="text-3xl font-black text-primary">{word.word}</h2>
          </div>
        </div>
      ) as ReactNode,
    },
    // Back side
    flipped ? {
      id: "back",
      content: (
        <div className="text-center space-y-6 w-full">
          <div className="space-y-4">
            <div className="space-y-2">
              {word.article && (
                <p className="text-2xl text-muted-foreground font-medium">{word.article}</p>
              )}
              <h2 data-testid="vocab-word" className="text-3xl font-black text-primary">{word.word}</h2>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Example:</p>
              <p className="italic text-lg">{word.exampleSentence}</p>
            </div>
          </div>
        </div>
      ) as ReactNode,
      audioText: word.exampleSentence,
    } : {
      id: "back",
      content: (
        <div className="text-center space-y-6 w-full">
          <div className="space-y-4">
            <p data-testid="vocab-translation" className="text-2xl text-muted-foreground italic">{word.translation}</p>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Example:</p>
              <p className="italic text-lg">{word.exampleSentence}</p>
            </div>
          </div>
        </div>
      ) as ReactNode,
      audioText: word.exampleSentence,
    }
  ]
});

interface VocabularyCardPileProps {
  words: VocabularyWord[];
  currentIndex: number;
  cardState: 0 | 1; // 0: front, 1: back
  onFlip: () => void;
  onSwipe: (direction: "left" | "right") => void;
  flipped: boolean;
}

const VocabularyCardPile = ({
  words,
  currentIndex,
  cardState,
  onFlip,
  onSwipe,
  flipped
}: VocabularyCardPileProps) => {
  // Convert words to generic card content format
  const wordCards = words.map(word => createVocabularyCardContent(word, flipped));

  return (
    <SwipeableCardPile
      cards={wordCards}
      currentIndex={currentIndex}
      currentState={cardState}
      onFlip={onFlip}
      onSwipe={onSwipe}
    />
  );
};

// Extended word interface for favorites with chapter info
interface VocabularyWordWithChapter extends VocabularyWord {
  chapterId: string;
  chapterTitle: string;
}

// Create a store for vocabulary favorites
const favoritesStore = createLocalStorageStore<string[]>('vocabulary-favorites', []);

// Custom hook for managing favorites (shared with Vocabulary page) with robust localStorage handling
const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const stored = favoritesStore.get();
    return new Set(stored);
  });

  const isFavorite = useCallback((wordId: string) => favorites.has(wordId), [favorites]);

  const getFavoriteWords = useCallback((): VocabularyWordWithChapter[] => {
    return vocabularyData
      .flatMap(chapter => chapter.words.map(word => ({ ...word, chapterId: chapter.id, chapterTitle: chapter.title })))
      .filter(word => favorites.has(word.word));
  }, [favorites]);

  return { isFavorite, getFavoriteWords };
};

interface VocabResult {
  word: string;
  correct: boolean;
}

// Create stores for vocabulary flashcard settings
const selectedChaptersStore = createLocalStorageStore<number[]>('vocab-selected-chapters', []);
const includeFavoritesStore = createLocalStorageStore<boolean>('vocab-include-favorites', false);
const flippedModeStore = createLocalStorageStore<boolean>('vocab-flipped-mode', false);

const VocabularyFlashcards = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedChapters, setSelectedChapters] = useState<number[]>(() => {
    return selectedChaptersStore.get();
  });
  const [includeFavorites, setIncludeFavorites] = useState<boolean>(() => {
    return includeFavoritesStore.get();
  });
  const [gameStarted, setGameStarted] = useState<boolean>(() => {
    const hasReviewParam = Boolean(
      searchParams.get('review') ||
      searchParams.get('reviewChapter') ||
      searchParams.get('reviewWords')
    );
    return hasReviewParam;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardState, setCardState] = useState<0 | 1>(0); // 0: front, 1: back
  const [points, setPoints] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [results, setResults] = useState<VocabResult[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [voiceMode, setVoiceMode] = useState(true);
  const [flippedMode, setFlippedMode] = useState<boolean>(() => flippedModeStore.get());
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { getFavoriteWords } = useFavorites();
  const lastSpeechTime = useRef<number>(0);
  const speechTimeout = useRef<NodeJS.Timeout | null>(null);

  const sessionWords = useMemo(() => {
    if (!gameStarted) return [];

    const reviewAll = searchParams.get('review') === 'all';
    const reviewChapter = searchParams.get('reviewChapter');
    const reviewWordsParam = searchParams.get('reviewWords');

    let words: VocabularyWord[] = [];

    if (reviewAll) {
      const wordsToReview = reviewTracker.getAllWords();
      words = reviewTracker.resolveWordsToEntries(wordsToReview);
    } else if (reviewChapter) {
      const wordsToReview = reviewTracker.getWordsForChapter(reviewChapter);
      words = reviewTracker.resolveWordsToEntries(wordsToReview);
    } else if (reviewWordsParam) {
      const list = reviewWordsParam
        .split(',')
        .map(s => decodeURIComponent(s.trim()))
        .filter(Boolean);
      words = reviewTracker.resolveWordsToEntries(list);
    }

    if (words.length > 0) {
      return [...words].sort(() => Math.random() - 0.5);
    }

    const normalWords: VocabularyWord[] = [];

    // Use level-aware vocabulary for exercises
    const levelVocabulary = getVocabularyData();

    if (selectedChapters.length > 0) {
      normalWords.push(...levelVocabulary
        .filter((item) => selectedChapters.includes(Number(item.chapter)))
        .flatMap((chapter) => chapter.words));
    }

    if (includeFavorites) {
      normalWords.push(...getFavoriteWords());
    }

    const uniqueWords = normalWords.filter((word, index, self) =>
      index === self.findIndex(w => w.word === word.word)
    );

    if (isE2EDeterministicMode()) {
      const ordered = [...uniqueWords].sort((a, b) => a.word.localeCompare(b.word));
      const beestIndex = ordered.findIndex((w) => w.word === 'beest');
      if (beestIndex > 0) {
        const [beest] = ordered.splice(beestIndex, 1);
        ordered.unshift(beest);
      }
      return ordered;
    }

    return [...uniqueWords].sort(() => Math.random() - 0.5);
  }, [selectedChapters, includeFavorites, gameStarted, getFavoriteWords, searchParams]);

  const currentWord = sessionWords[currentIndex];

  useEffect(() => {
    if (!isE2EDeterministicMode()) return

    ;(window as Window & {
      __e2eApplyVocabularySwipe?: (direction: 'left' | 'right') => void
    }).__e2eApplyVocabularySwipe = (direction) => {
      handleSwipe(direction)
    }
  }, [currentIndex, cardState, sessionWords, points])

  // Debounced speak function to prevent rapid speech requests
  const debouncedSpeak = (word: string) => {
    const now = Date.now();
    const timeSinceLastSpeech = now - lastSpeechTime.current;

    // Minimum 300ms between speech requests to prevent overlapping
    if (timeSinceLastSpeech < 300) {
      // Cancel any pending speech timeout
      if (speechTimeout.current) {
        clearTimeout(speechTimeout.current);
      }

      // Schedule speech after the minimum delay
      speechTimeout.current = setTimeout(() => {
        speakerService.speak(word);
        lastSpeechTime.current = Date.now();
      }, 300 - timeSinceLastSpeech);
    } else {
      // Enough time has passed, speak immediately
      speakerService.speak(word);
      lastSpeechTime.current = now;
    }
  };

  // Voice mode effect - speak when card changes
  useEffect(() => {
    if (voiceMode && currentWord) {
      const dutchSideState = flippedMode ? 1 : 0;
      if (cardState === dutchSideState) {
        // Speak the Dutch word when the Dutch side is visible
        debouncedSpeak(currentWord.word);
      }
    }
  }, [cardState, currentWord, voiceMode, flippedMode]);

  // Cleanup timeout on unmount or when voice mode is disabled
  useEffect(() => {
    return () => {
      if (speechTimeout.current) {
        clearTimeout(speechTimeout.current);
      }
    };
  }, []);

  const handleFlip = () => {
    setCardState((prev) => (prev === 0 ? 1 : 0));
  };

  const handleChapterToggle = (chapter: number) => {
    setSelectedChapters((prev) => {
      const next = prev.includes(chapter)
        ? prev.filter((c) => c !== chapter)
        : [...prev, chapter];
      selectedChaptersStore.set(next);
      return next;
    });
  };

  const handleFavoritesToggle = () => {
    setIncludeFavorites((prev) => {
      const next = !prev;
      includeFavoritesStore.set(next);
      return next;
    });
  };

  const handleFlippedToggle = () => {
    setFlippedMode((prev) => {
      const next = !prev;
      flippedModeStore.set(next);
      return next;
    });
  };

  const handleStartGame = () => {
    if (selectedChapters.length === 0 && !includeFavorites) return;
    setGameStarted(true);
    setGameKey(prev => prev + 1);
    setCurrentIndex(0);
    setCardState(0);
    setPoints(0);
    setResults([]);
    setShowSummary(false);
  };

  const handleSwipe = (direction: "left" | "right") => {
    const correct = direction === "right";

    if (correct) {
      setPoints((prev) => prev + 1);
      if (currentWord) {
        reviewTracker.markCorrect(currentWord.word);
      }
    } else {
      setPoints((prev) => prev - 1);
    }

    setResults((prev) => [...prev, { word: currentWord.word, correct }]);

    // Record attempt for stats (best-effort chapter inference)
    if (currentWord) {
      const inferredChapter = reviewTracker.findChapterIdsForWord(currentWord.word)[0]
      exerciseStats.recordAttempt('vocabulary', inferredChapter, currentWord.word, correct)
    }

    if (!correct && currentWord) {
      const chapterIds = reviewTracker.findChapterIdsForWord(currentWord.word);
      reviewTracker.addIncorrect(currentWord.word, chapterIds[0]);
    }

    // Reset card state and move to next card
    setCardState(0);

    if (currentIndex + 1 >= sessionWords.length) {
      setShowSummary(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePileComplete = () => {
    setShowSummary(true);
  };

  const handleRestart = () => {
    setGameStarted(false);
    setGameKey(prev => prev + 1);
    setCurrentIndex(0);
    setCardState(0);
    setPoints(0);
    setResults([]);
    setShowSummary(false);
    if (searchParams.get('review') || searchParams.get('reviewChapter') || searchParams.get('reviewWords')) {
      navigate('/exercises/vocabulary/stats');
    }
  };

  const handleRetry = () => {
    setGameKey(prev => prev + 1);
    setCurrentIndex(0);
    setCardState(0);
    setPoints(0);
    setResults([]);
    setShowSummary(false);
    setIsDetailsOpen(false);
  };

  const handleWordClick = (word: string, event: React.MouseEvent) => {
    event.stopPropagation();
    speakerService.speak(word);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader
          title="Vocabulary Flashcards"
          backPath="/exercises"
          fixed={false}
          right={
            <Button variant="ghost" size="icon" onClick={() => navigate('/exercises/vocabulary/stats')}>
              <BarChart2 className="w-5 h-5" />
            </Button>
          }
        />

        <div className="max-w-4xl mx-auto space-y-4 px-4 pt-6">
          <ChapterSelector
            chapters={getVocabularyData()}
            selectedChapters={selectedChapters}
            onToggle={handleChapterToggle}
          />

          <div className="border-t pt-4">
            <SelectionCard
              label="♥ Favorites"
              description={`${getFavoriteWords().length} words`}
              isSelected={includeFavorites}
              onClick={handleFavoritesToggle}
            />
          </div>

          <SelectionCard
            label="Flipped mode (EN → NL)"
            description="Show English first; flip to see Dutch"
            isSelected={flippedMode}
            onClick={handleFlippedToggle}
          />

          <Button
            onClick={handleStartGame}
            disabled={selectedChapters.length === 0 && !includeFavorites}
            className="w-full"
          >
            Start Game
          </Button>
        </div>

      </div>
    );
  }

  if (showSummary) {
    const correctAnswers = results.filter((r) => r.correct).length;
    return (
      <ExerciseSummary
        score={correctAnswers}
        total={sessionWords.length}
        title="Session Complete!"
        actions={{
          retry: {
            label: "Try Again",
            onClick: handleRetry,
          },
          home: {
            label: "Go back",
            onClick: handleRestart,
          },
        }}
      >
        {/* Custom detailed results section */}
        <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen} className="w-full">
          <CollapsibleTrigger asChild>
            <div className="bg-card border-2 border-primary rounded-2xl p-6 cursor-pointer relative hover:bg-card/80 transition-colors">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">
                  {correctAnswers} / {sessionWords.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  {Math.round((correctAnswers / sessionWords.length) * 100)}% correct
                </p>
              </div>
              <ChevronDown
                className={`w-6 h-6 transition-transform absolute top-4 right-4 text-muted-foreground ${isDetailsOpen ? "rotate-180" : ""
                  }`}
              />
              <CollapsibleContent className="mt-4">
                <div className="border-t border-primary/20 pt-4 space-y-2 max-h-64 overflow-y-auto">
                  {results.map((result, index) => {
                    const word = sessionWords.find(w => w.word === result.word);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            className="p-1 hover:bg-secondary/50 rounded transition-colors shrink-0"
                            onClick={(e) => handleWordClick(result.word, e)}
                          >
                            <Volume2 className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-bold text-foreground truncate">
                              {word?.article ? `${word.article} ` : ''}{result.word}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {word?.translation}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`w-3 h-3 rounded-full shrink-0 ml-2 ${result.correct ? "bg-green-500" : "bg-red-500"
                            }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </div>
          </CollapsibleTrigger>
        </Collapsible>
      </ExerciseSummary>
    );
  }

  return (
    <div className="h-screen relative overflow-hidden flex flex-col bg-background" style={{ touchAction: 'pan-x' }}>
      <AppHeader
        onBack={handleRestart}
        center={
          <div className="text-sm font-medium">
            {currentIndex + 1} / {sessionWords.length}
          </div>
        }
        right={
          <div data-testid="vocab-score" className="text-sm font-medium">Score: {points}</div>
        }
      />

      <Button
        variant="outline"
        size="icon"
        onClick={handleRetry}
        className="fixed bottom-6 left-6 bg-card border-2 border-primary font-bold z-50"
      >
        <RotateCcw className="w-5 h-5" />
      </Button>

      <div className="flex-1 flex items-center justify-center pointer-events-none -mt-16">
        <div className="pointer-events-auto">
          {sessionWords.length > 0 && (
            <VocabularyCardPile
              key={`vocabulary-pile-${currentIndex}`}
              words={sessionWords}
              currentIndex={currentIndex}
              cardState={cardState}
              onFlip={handleFlip}
              onSwipe={handleSwipe}
              flipped={flippedMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VocabularyFlashcards;
