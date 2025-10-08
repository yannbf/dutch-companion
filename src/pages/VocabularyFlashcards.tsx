import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { vocabularyData, VocabularyWord } from "@/data/vocabulary";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Volume2, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { speakerService } from "@/services/speaker";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Extended word interface for favorites with chapter info
interface VocabularyWordWithChapter extends VocabularyWord {
  chapterId: string;
  chapterTitle: string;
}

// Custom hook for managing favorites (shared with Vocabulary page)
const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('vocabulary-favorites');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const isFavorite = (wordId: string) => favorites.has(wordId);

  const getFavoriteWords = (): VocabularyWordWithChapter[] => {
    return vocabularyData
      .flatMap(chapter => chapter.words.map(word => ({ ...word, chapterId: chapter.id, chapterTitle: chapter.title })))
      .filter(word => favorites.has(word.word));
  };

  return { isFavorite, getFavoriteWords };
};

interface VocabResult {
  word: string;
  correct: boolean;
}

const VocabularyFlashcards = () => {
  const navigate = useNavigate();
  const [selectedChapters, setSelectedChapters] = useState<number[]>([1, 2, 3]);
  const [includeFavorites, setIncludeFavorites] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [points, setPoints] = useState(0);
  const [results, setResults] = useState<VocabResult[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const { getFavoriteWords } = useFavorites();

  const sessionWords = useMemo(() => {
    if (!gameStarted) return [];

    let words = [];

    // Add words from selected chapters
    if (selectedChapters.length > 0) {
      words.push(...vocabularyData
        .filter((item) => selectedChapters.includes(item.chapter))
        .flatMap((chapter) => chapter.words));
    }

    // Add favorite words if selected
    if (includeFavorites) {
      words.push(...getFavoriteWords());
    }

    // Remove duplicates (in case a favorite word is also in a selected chapter)
    const uniqueWords = words.filter((word, index, self) =>
      index === self.findIndex(w => w.word === word.word)
    );

    // Shuffle words
    return [...uniqueWords].sort(() => Math.random() - 0.5);
  }, [selectedChapters, includeFavorites, gameStarted]);

  const currentWord = sessionWords[currentIndex];

  const handleChapterToggle = (chapter: number) => {
    setSelectedChapters((prev) =>
      prev.includes(chapter)
        ? prev.filter((c) => c !== chapter)
        : [...prev, chapter]
    );
  };

  const handleFavoritesToggle = () => {
    setIncludeFavorites((prev) => !prev);
  };

  const handleStartGame = () => {
    if (selectedChapters.length === 0 && !includeFavorites) return;
    setGameStarted(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    setPoints(0);
    setResults([]);
    setShowSummary(false);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = (text: string) => {
    speakerService.speak(text);
  };

  const handleSwipe = (correct: boolean) => {
    if (correct) {
      setPoints((prev) => prev + 1);
    }

    setResults((prev) => [...prev, { word: currentWord.word, correct }]);

    if (currentIndex + 1 >= sessionWords.length) {
      setShowSummary(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handleRestart = () => {
    setGameStarted(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    setPoints(0);
    setResults([]);
    setShowSummary(false);
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setPoints(0);
    setResults([]);
    setShowSummary(false);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-6 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/exercises")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Vocabulary Flashcards</h1>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-3">Select Chapters</h2>
              <div className="space-y-2">
                {vocabularyData.map((chapter) => (
                  <div key={chapter.chapter} className="flex items-center space-x-2">
                    <Checkbox
                      id={`chapter-${chapter.chapter}`}
                      checked={selectedChapters.includes(chapter.chapter)}
                      onCheckedChange={() => handleChapterToggle(chapter.chapter)}
                    />
                    <Label htmlFor={`chapter-${chapter.chapter}`} className="cursor-pointer">
                      Hoofdstuk {chapter.chapter} ({chapter.words.length} words)
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-favorites"
                  checked={includeFavorites}
                  onCheckedChange={handleFavoritesToggle}
                />
                <Label htmlFor="include-favorites" className="cursor-pointer">
                  Include Favorites ({getFavoriteWords().length} words)
                </Label>
              </div>
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
              Change Settings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen relative overflow-hidden flex flex-col bg-background">
      <div className="p-4 flex items-center justify-between border-b">
        <Button variant="ghost" size="icon" onClick={handleRestart}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-sm font-medium">
          {currentIndex + 1} / {sessionWords.length}
        </div>
        <div className="text-sm font-medium">Score: {points}</div>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleRetry}
        className="fixed bottom-6 left-6 bg-card border-2 border-primary font-bold z-50"
      >
        <RotateCcw className="w-5 h-5" />
      </Button>

      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {currentWord && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-full max-w-md"
            >
              <motion.div
                className="relative w-full aspect-[3/4] cursor-pointer"
                onClick={handleFlip}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front of card */}
                <div
                  className="absolute inset-0 bg-card border-2 border-primary rounded-2xl p-8 flex flex-col items-center justify-center"
                  style={{
                    backfaceVisibility: "hidden",
                  }}
                >
                  <h2 className="text-4xl font-bold text-center mb-4">{currentWord.word}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(currentWord.word);
                    }}
                  >
                    <Volume2 className="w-6 h-6" />
                  </Button>
                </div>

                {/* Back of card */}
                <div
                  className="absolute inset-0 bg-card border-2 border-primary rounded-2xl p-8 flex flex-col items-center justify-center"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="text-center space-y-4">
                    <p className="text-xl font-semibold">{currentWord.translation}</p>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Example:</p>
                      <p className="italic">{currentWord.exampleSentence}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeak(currentWord.exampleSentence);
                        }}
                        className="mt-2"
                      >
                        <Volume2 className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Action buttons */}
              {isFlipped && (
                <div className="flex gap-4 mt-6 justify-center">
                  <Button
                    variant="destructive"
                    onClick={() => handleSwipe(false)}
                    className="flex-1 max-w-[150px]"
                  >
                    Wrong
                  </Button>
                  <Button
                    onClick={() => handleSwipe(true)}
                    className="flex-1 max-w-[150px]"
                  >
                    Correct
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VocabularyFlashcards;
