import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVocabularyData, vocabularyData } from "@/data/vocabulary";
import { createLocalStorageStore } from "@/lib/localStorage";
import {
  ExerciseSetupLayout,
  ChapterSelector,
  SelectionCard,
} from "@/components/exercise";

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

  // Use level-aware vocabulary for exercises
  const levelVocabulary = getVocabularyData();

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
    <ExerciseSetupLayout
      title="Vocabulary Match"
      subtitle="Match Dutch words with English translations"
      maxWidth="4xl"
      startButton={{
        label: "Start Matching",
        onClick: handleStartGame,
        disabled: selectedChapters.length === 0 && !includeFavorites,
      }}
    >
      {/* Chapter Selection */}
      <ChapterSelector
        chapters={levelVocabulary}
        selectedChapters={selectedChapters}
        onToggle={handleChapterToggle}
      />

      {/* Favorites Toggle */}
      <div className="border-t pt-4">
        <SelectionCard
          label="♥ Favorites"
          description={`${favoriteWords.length} words`}
          isSelected={includeFavorites}
          onClick={handleFavoritesToggle}
        />
      </div>

      {/* Separable Verbs Filter */}
      <SelectionCard
        label="Only separable verbs"
        description="Filter to scheidbare-werkwoorden"
        isSelected={onlySeparable}
        onClick={handleOnlySeparableToggle}
      />
    </ExerciseSetupLayout>
  );
};

export default VocabularyMatchSetup;
