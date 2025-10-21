import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { vocabularyData } from "@/data/vocabulary";
import type { VocabularyWord } from "@/data/types";
import { SwipeableCardPile, CardContent } from "@/components/SwipeableCardPile";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, BarChart2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { speakerService } from "@/services/speaker";
import { ReactNode } from "react";
import { createLocalStorageStore } from "@/lib/localStorage";
import { reviewTracker } from "@/lib/reviewTracker";
import { exerciseStats } from "@/lib/exerciseStats";

// Convert VocabularyWord to generic CardContent format
const createVocabularyCardContent = (word: VocabularyWord): CardContent => ({
  id: word.word,
  states: [
    {
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
    {
      id: "back",
      content: (
        <div className="text-center space-y-6 w-full">
          <div className="space-y-4">
            <p className="text-2xl text-muted-foreground italic">{word.translation}</p>
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
}

const VocabularyCardPile = ({
  words,
  currentIndex,
  cardState,
  onFlip,
  onSwipe
}: VocabularyCardPileProps) => {
  // Convert words to generic card content format
  const wordCards = words.map(word => createVocabularyCardContent(word));

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

    if (selectedChapters.length > 0) {
      normalWords.push(...vocabularyData
        .filter((item) => selectedChapters.includes(item.chapter))
        .flatMap((chapter) => chapter.words));
    }

    if (includeFavorites) {
      normalWords.push(...getFavoriteWords());
    }

    const uniqueWords = normalWords.filter((word, index, self) =>
      index === self.findIndex(w => w.word === word.word)
    );

    return [...uniqueWords].sort(() => Math.random() - 0.5);
  }, [selectedChapters, includeFavorites, gameStarted, getFavoriteWords, searchParams]);

  const currentWord = sessionWords[currentIndex];

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
      if (cardState === 0) {
        // Speak the word
        debouncedSpeak(currentWord.word);
      }
    }
  }, [cardState, currentWord, voiceMode]);

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
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-6 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/exercises")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Vocabulary Flashcards</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate('/exercises/vocabulary/stats')}>
              <BarChart2 className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {vocabularyData.map((chapter) => {
                  const isSelected = selectedChapters.includes(chapter.chapter);
                  return (
                    <button
                      key={chapter.chapter}
                      onClick={() => handleChapterToggle(chapter.chapter)}
                      className={`
                        relative p-4 rounded-lg border-2 transition-all text-left
                        active:scale-95 touch-manipulation
                        ${isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border bg-card hover:border-primary/50'
                        }
                      `}
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-bold line-clamp-2">Chapter {chapter.chapter}</div>
                        <div className="text-xs text-muted-foreground">{chapter.title} ({chapter.words.length} words)</div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-4">
              <button
                onClick={handleFavoritesToggle}
                className={`
                  w-full p-4 rounded-lg border-2 transition-all text-left
                  active:scale-95 touch-manipulation
                  ${includeFavorites 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-card hover:border-primary/50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-bold">♥ Favorites</div>
                    <div className="text-xs text-muted-foreground">{getFavoriteWords().length} words</div>
                  </div>
                  {includeFavorites && (
                    <div className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </div>
                  )}
                </div>
              </button>
            </div>

            <Button
              onClick={handleStartGame}
              disabled={selectedChapters.length === 0 && !includeFavorites}
              className="w-full"
            >
              Start Game
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showSummary) {
    const correctAnswers = results.filter((r) => r.correct).length;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-4xl font-bold">Great work!</h1>
          <p className="text-2xl">
            Score: {correctAnswers} / {sessionWords.length}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleRetry}>Try Again</Button>
            <Button variant="outline" onClick={handleRestart}>
              Go back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen relative overflow-hidden flex flex-col bg-background" style={{ touchAction: 'pan-x' }}>
      <div className="p-4 flex items-center justify-between border-b">
        <Button variant="ghost" size="icon" onClick={handleRestart}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-sm font-medium">
          {currentIndex + 1} / {sessionWords.length}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">Score: {points}</div>
        </div>
      </div>

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
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VocabularyFlashcards;
