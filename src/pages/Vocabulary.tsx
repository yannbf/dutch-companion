import { useState, useMemo, useCallback, forwardRef, useRef } from "react";
import { Virtuoso } from 'react-virtuoso';
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

// Subtle color themes per category (text-only)
const getCategoryTheme = (word: VocabularyWord) => {
  // Treat entries with participium as verbs as well
  const key: VocabularyWord['category'] | 'verb' = (word.participium ? 'werkwoorden' : word.category);
  switch (key) {
    case 'werkwoorden':
    case 'scheidbare-werkwoorden':
      return {
        badge: 'text-amber-500/70',
      };
    case 'preposities':
      return {
        badge: 'text-violet-500/70',
      };
    case 'idioom':
      return {
        badge: 'text-rose-500/70',
      };
    case 'vocabulaire':
    default:
      return {
        badge: 'text-sky-500/70',
      };
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
  const hasSearch = searchTerm.trim().length > 0;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { toggleFavorite, isFavorite, getFavoriteWords } = useFavorites();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
      (word.article && word.article.toLowerCase().includes(searchLower)) ||
      (word.imperfectumSingular && word.imperfectumSingular.toLowerCase().includes(searchLower)) ||
      (word.imperfectumPlural && word.imperfectumPlural.toLowerCase().includes(searchLower)) ||
      (word.participium && word.participium.toLowerCase().includes(searchLower))
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

        {/* Search bar with filter button (sticky) */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mb-6 pt-2 pb-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vocabulary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-12"
              ref={inputRef}
            />
            {hasSearch && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Clear search"
                onClick={() => { setSearchTerm(""); requestAnimationFrame(() => inputRef.current?.focus()); }}
                className="absolute right-10 top-1.5 h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
              >
                ×
              </Button>
            )}
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
            <Virtuoso
              useWindowScroll
              increaseViewportBy={{ top: 400, bottom: 600 }}
              components={{
                // Make the inner list apply vertical spacing between items, matching the old layout
                List: forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ style, children, ...props }, ref) => (
                  <div ref={ref} style={style} {...props} className="space-y-4" >
                    {children}
                  </div>
                )),
                Footer: () => <div className="h-24" />,
              }}
              totalCount={displayWords.length}
              itemContent={(index) => {
                const word = displayWords[index];
                const favorite = isFavorite(word.word);
                const showChapterInfo = (searchTerm.trim() && 'chapterTitle' in word && (word as VocabularyWordWithChapter).chapterTitle) || isFavoritesView;
                const isExpanded = !!expanded[word.word];
                return (
                  <Card onClick={() => word.participium ? toggleExpanded(word.word) : undefined} className={`relative cursor-pointer select-none ${!word.participium ? 'cursor-default' : ''}`}>
                    <div className={`pointer-events-none absolute top-2 right-2 text-[10px] uppercase tracking-wider ${getCategoryTheme(word).badge}`}>
                      {!word.participium ? getCategoryAbbr(word.category) : 'verb'}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-start justify-between">
                        <div className="flex-1 relative">
                          <span>{word.article ? `${word.word}, ${word.article}` : word.word}</span>
                          {showChapterInfo && 'chapterTitle' in word && (word as VocabularyWordWithChapter).chapterTitle && (
                            <div className="text-sm text-muted-foreground mt-1">
                              From: {(word as VocabularyWordWithChapter).chapterTitle}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(word.word); }}
                            className={`touch-manipulation transition-all ${favorite ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-muted-foreground hover:text-red-500 hover:bg-card hover:border-primary/50"}`}
                          >
                            <Heart className={`w-5 h-5 ${favorite ? "fill-current" : ""}`} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); handleSpeak(word.word); }}
                          >
                            <Volume2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!isExpanded && (
                        <div>
                          <p className="text-muted-foreground mb-2">{word.translation}</p>
                          <div className="flex items-start gap-2">
                            <p className="italic flex-1">{word.exampleSentence}</p>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); handleSpeak(word.exampleSentence); }}
                            >
                              <Volume2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {isExpanded && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <div className="text-xs text-muted-foreground">Imperfectum (sg.)</div>
                              <div className="font-medium">{word.imperfectumSingular || '-'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Imperfectum (pl.)</div>
                              <div className="font-medium">{word.imperfectumPlural || '-'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Hulpverbum</div>
                              <div className="font-medium">{word.hulpverbum || '-'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Participium</div>
                              <div className="font-medium">{word.participium || '-'}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-[1fr_auto] items-start gap-2">
                            <div>
                              <div className="text-xs text-muted-foreground">Voorbeeld (Imperfectum)</div>
                              <div className="italic">{word.exampleImperfectum || '-'}</div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); if (word.exampleImperfectum) handleSpeak(word.exampleImperfectum); }}
                              disabled={!word.exampleImperfectum}
                            >
                              <Volume2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-[1fr_auto] items-start gap-2">
                            <div>
                              <div className="text-xs text-muted-foreground">Voorbeeld (Perfectum)</div>
                              <div className="italic">{word.examplePerfectum || '-'}</div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); if (word.examplePerfectum) handleSpeak(word.examplePerfectum); }}
                              disabled={!word.examplePerfectum}
                            >
                              <Volume2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              }}
            />
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
