import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vocabularyData } from "@/data/vocabulary";
import { createLocalStorageStore } from "@/lib/localStorage";

const selectedChaptersStore = createLocalStorageStore<number[]>('vocab-match-selected-chapters', []);
const includeFavoritesStore = createLocalStorageStore<boolean>('vocab-match-include-favorites', false);
const onlySeparableStore = createLocalStorageStore<boolean>('vocab-match-only-separable', false);

// Get favorites from vocabulary flashcards store
const favoritesStore = createLocalStorageStore<string[]>('vocabulary-favorites', []);

const VocabularyMatchSetup = () => {
  const navigate = useNavigate();
  const [selectedChapters, setSelectedChapters] = useState<number[]>(() => {
    return selectedChaptersStore.get();
  });
  const [includeFavorites, setIncludeFavorites] = useState<boolean>(() => {
    return includeFavoritesStore.get();
  });
  const [onlySeparable, setOnlySeparable] = useState<boolean>(() => {
    return onlySeparableStore.get();
  });

  const favorites = favoritesStore.get();
  const favoriteWords = vocabularyData
    .flatMap(chapter => chapter.words.map(word => ({ ...word, chapterId: chapter.id })))
    .filter(word => favorites.includes(word.word));

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

  const handleOnlySeparableToggle = () => {
    setOnlySeparable((prev) => {
      const next = !prev;
      onlySeparableStore.set(next);
      return next;
    });
  };

  const handleStartGame = () => {
    if (selectedChapters.length === 0 && !includeFavorites) return;
    navigate("/exercises/vocabulary-match/play");
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/exercises")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Vocabulary Match</h1>
            <p className="text-sm text-muted-foreground">Match Dutch words with English translations</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Select Chapters</h2>
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
                  <div className="text-xs text-muted-foreground">{favoriteWords.length} words</div>
                </div>
                {includeFavorites && (
                  <div className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>
                )}
              </div>
            </button>
          </div>

          <div>
            <button
              onClick={handleOnlySeparableToggle}
              className={`
                w-full p-4 rounded-lg border-2 transition-all text-left
                active:scale-95 touch-manipulation
                ${onlySeparable 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border bg-card hover:border-primary/50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-bold">Only separable verbs</div>
                  <div className="text-xs text-muted-foreground">Filter to scheidbare-werkwoorden</div>
                </div>
                {onlySeparable && (
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
            size="lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Matching
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VocabularyMatchSetup;
