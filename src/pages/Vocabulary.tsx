import { useState, useMemo, useCallback } from "react";
import { vocabularyData, VocabularyWord } from "@/data/vocabulary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Volume2, Search, Heart, Filter } from "lucide-react";
import { speakerService } from "@/services/speaker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Extended word interface for favorites with chapter info
interface VocabularyWordWithChapter extends VocabularyWord {
  chapterId: string;
  chapterTitle: string;
}

// Category abbreviations
const getCategoryAbbr = (category: VocabularyWord['category']) => {
  switch (category) {
    case 'idioom': return 'idiom';
    case 'vocabulaire': return 'vocab';
    case 'preposities': return 'prep.';
    case 'werkwoorden': return 'verb';
    case 'scheidbare-werkwoorden': return 'sep. verb';
    default: return '';
  }
};

// Custom hook for managing favorites
const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('vocabulary-favorites');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const toggleFavorite = useCallback((wordId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(wordId)) {
      newFavorites.delete(wordId);
    } else {
      newFavorites.add(wordId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('vocabulary-favorites', JSON.stringify([...newFavorites]));
  }, [favorites]);

  const isFavorite = useCallback((wordId: string) => favorites.has(wordId), [favorites]);

  const getFavoriteWords = useCallback((): VocabularyWordWithChapter[] => {
    return vocabularyData
      .flatMap(chapter => chapter.words.map(word => ({ ...word, chapterId: chapter.id, chapterTitle: chapter.title })))
      .filter(word => favorites.has(word.word));
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite, getFavoriteWords };
};

const Vocabulary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toggleFavorite, isFavorite, getFavoriteWords } = useFavorites();

  // Get all unique categories from vocabulary data
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    vocabularyData.forEach(chapter => {
      chapter.words.forEach(word => {
        categories.add(word.category);
      });
    });
    return Array.from(categories).sort();
  }, []);

  // Handle special views
  const isFavoritesView = selectedChapter === "favorites";
  const isAllChaptersView = selectedChapter === "all";
  const currentChapter = isFavoritesView || isAllChaptersView ? null : (vocabularyData.find(ch => ch.id === selectedChapter) || vocabularyData[0]);

  // Get words to display based on current view, category filter, and search
  const wordsToDisplay = useMemo(() => {
    let words;
    if (isFavoritesView) {
      words = getFavoriteWords();
    } else if (isAllChaptersView) {
      // All chapters - get all words from all chapters
      words = vocabularyData.flatMap(chapter => chapter.words);
    } else {
      words = currentChapter?.words || [];
    }

    // Apply category filter if not "all"
    if (selectedCategory !== "all") {
      words = words.filter(word => word.category === selectedCategory);
    }

    return words;
  }, [isFavoritesView, isAllChaptersView, currentChapter, getFavoriteWords, selectedCategory]);

  // Get all words with chapter information for search
  const allWordsWithChapters = useMemo(() => {
    let words;
    if (isFavoritesView) {
      words = getFavoriteWords();
    } else if (isAllChaptersView) {
      // All chapters - get all words from all chapters
      words = vocabularyData.flatMap(chapter =>
        chapter.words.map(word => ({
          ...word,
          chapterId: chapter.id,
          chapterTitle: chapter.title
        }))
      );
    } else {
      // Specific chapter
      const chapter = vocabularyData.find(ch => ch.id === selectedChapter);
      words = chapter ? chapter.words.map(word => ({
        ...word,
        chapterId: chapter.id,
        chapterTitle: chapter.title
      })) : [];
    }

    // Apply category filter if not "all"
    if (selectedCategory !== "all") {
      words = words.filter(word => word.category === selectedCategory);
    }

    return words;
  }, [isFavoritesView, isAllChaptersView, selectedChapter, getFavoriteWords, selectedCategory]);

  // Get count for each option with category filtering
  const getOptionCount = useCallback((chapterId: string, category: string) => {
    let words;
    if (chapterId === "favorites") {
      words = getFavoriteWords();
    } else if (chapterId === "all") {
      words = vocabularyData.flatMap(chapter => chapter.words);
    } else {
      const chapter = vocabularyData.find(ch => ch.id === chapterId);
      words = chapter?.words || [];
    }

    if (category !== "all") {
      words = words.filter(word => word.category === category);
    }

    return words.length;
  }, [getFavoriteWords]);

  // Filter words based on search term across all chapters when searching
  const filteredWords = useMemo(() => {
    if (!searchTerm.trim()) {
      // If no search term, show current chapter or favorites
      return wordsToDisplay;
    }

    const searchLower = searchTerm.toLowerCase();
    return allWordsWithChapters.filter(word =>
      word.word.toLowerCase().includes(searchLower) ||
      word.translation.toLowerCase().includes(searchLower) ||
      word.exampleSentence.toLowerCase().includes(searchLower) ||
      (word.article && word.article.toLowerCase().includes(searchLower))
    );
  }, [wordsToDisplay, allWordsWithChapters, searchTerm]);

  // Use filtered words as-is (no sorting)
  const displayWords = filteredWords;

  const handleSpeak = (text: string) => {
    speakerService.speak(text);
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Vocabulary</h1>

        {/* Search bar with filter button */}
        <div className="mb-6">
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vocabulary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-12"
            />
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Filter Options</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Chapter</label>
                    <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {/* All chapters option */}
                        <SelectItem value="all">
                          All chapters ({getOptionCount("all", selectedCategory)} words)
                        </SelectItem>
                        {/* Favorites option */}
                        <SelectItem value="favorites">
                          ♥ Favorites ({getOptionCount("favorites", selectedCategory)} words)
                        </SelectItem>
                        {/* Regular chapters */}
                        {vocabularyData.map(chapter => (
                          <SelectItem key={chapter.id} value={chapter.id}>
                            {chapter.chapter} - {chapter.title} ({getOptionCount(chapter.id, selectedCategory)} words)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          All Categories ({getOptionCount(selectedChapter, "all")} words)
                        </SelectItem>
                        {allCategories.map(category => {
                          const displayName = category === 'scheidbare-werkwoorden' ? 'Separable Verbs' :
                            category === 'werkwoorden' ? 'Verbs' :
                              category.charAt(0).toUpperCase() + category.slice(1);
                          return (
                            <SelectItem key={category} value={category}>
                              {displayName} ({getOptionCount(selectedChapter, category)} words)
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedChapter("all");
                        setSelectedCategory("all");
                      }}
                      className="flex-1"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-4">
          {displayWords.length > 0 ? (
            displayWords.map((word, idx) => {
              const favorite = isFavorite(word.word);
              // Show chapter info for search results (when searching across chapters) or favorites view
              const showChapterInfo = (searchTerm.trim() && 'chapterTitle' in word && word.chapterTitle) || isFavoritesView;
              return (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start justify-between">
                      <div className="flex-1 relative">
                        <div className="absolute top-0 right-0 text-[10px] text-muted-foreground/40 uppercase tracking-wider">
                          {getCategoryAbbr(word.category)}
                        </div>
                        <span>{word.article ? `${word.word}, ${word.article}` : word.word}</span>
                        {/* Show chapter info for search results or favorites view */}
                        {showChapterInfo && 'chapterTitle' in word && word.chapterTitle && (
                          <div className="text-sm text-muted-foreground mt-1">
                            From: {(word as VocabularyWordWithChapter).chapterTitle}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleFavorite(word.word)}
                          className={favorite ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"}
                        >
                          <Heart className={`w-5 h-5 ${favorite ? "fill-current" : ""}`} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSpeak(word.word)}
                        >
                          <Volume2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-2">{word.translation}</p>
                    <div className="flex items-start gap-2">
                      <p className="italic flex-1">{word.exampleSentence}</p>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleSpeak(word.exampleSentence)}
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  {searchTerm.trim()
                    ? `No vocabulary words found matching "${searchTerm}"`
                    : isFavoritesView
                      ? "No favorite words yet. Add some favorites to see them here!"
                      : selectedCategory !== "all"
                        ? `No ${selectedCategory} words found${isAllChaptersView ? " in any chapter" : " in this chapter"}`
                        : isAllChaptersView
                          ? "No vocabulary words found across all chapters"
                          : "No vocabulary words found"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vocabulary;
