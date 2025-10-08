import { useState, useMemo } from "react";
import { vocabularyData, VocabularyWord } from "@/data/vocabulary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Volume2, Search, Heart } from "lucide-react";
import { speakerService } from "@/services/speaker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Extended word interface for favorites with chapter info
interface VocabularyWordWithChapter extends VocabularyWord {
  chapterId: string;
  chapterTitle: string;
}

// Custom hook for managing favorites
const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('vocabulary-favorites');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const toggleFavorite = (wordId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(wordId)) {
      newFavorites.delete(wordId);
    } else {
      newFavorites.add(wordId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('vocabulary-favorites', JSON.stringify([...newFavorites]));
  };

  const isFavorite = (wordId: string) => favorites.has(wordId);

  const getFavoriteWords = (): VocabularyWordWithChapter[] => {
    return vocabularyData
      .flatMap(chapter => chapter.words.map(word => ({ ...word, chapterId: chapter.id, chapterTitle: chapter.title })))
      .filter(word => favorites.has(word.word));
  };

  return { favorites, toggleFavorite, isFavorite, getFavoriteWords };
};

const Vocabulary = () => {
  const [selectedChapter, setSelectedChapter] = useState(vocabularyData[0].id);
  const [searchTerm, setSearchTerm] = useState("");
  const { toggleFavorite, isFavorite, getFavoriteWords } = useFavorites();

  // Handle special "favorites" chapter
  const isFavoritesView = selectedChapter === "favorites";
  const currentChapter = isFavoritesView ? null : (vocabularyData.find(ch => ch.id === selectedChapter) || vocabularyData[0]);

  // Get words to display
  const wordsToDisplay = useMemo(() => {
    if (isFavoritesView) {
      return getFavoriteWords();
    }
    return currentChapter?.words || [];
  }, [isFavoritesView, currentChapter, getFavoriteWords]);

  // Filter words based on search term
  const filteredWords = useMemo(() => {
    if (!searchTerm.trim()) {
      return wordsToDisplay;
    }

    const searchLower = searchTerm.toLowerCase();
    return wordsToDisplay.filter(word =>
      word.word.toLowerCase().includes(searchLower) ||
      word.translation.toLowerCase().includes(searchLower) ||
      word.exampleSentence.toLowerCase().includes(searchLower) ||
      (word.article && word.article.toLowerCase().includes(searchLower))
    );
  }, [wordsToDisplay, searchTerm]);

  // Use filtered words as-is (no sorting)
  const displayWords = filteredWords;

  const handleSpeak = (text: string) => {
    speakerService.speak(text);
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Vocabulary</h1>
        
        <Select value={selectedChapter} onValueChange={setSelectedChapter}>
          <SelectTrigger className="mb-6">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {/* Favorites option */}
            <SelectItem value="favorites">
              Favorites ({getFavoriteWords().length} words)
            </SelectItem>
            {/* Regular chapters */}
            {vocabularyData.map(chapter => (
              <SelectItem key={chapter.id} value={chapter.id}>
                {chapter.title} ({chapter.words.length} words)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vocabulary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          {displayWords.length > 0 ? (
            displayWords.map((word, idx) => {
              const favorite = isFavorite(word.word);
              return (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{word.article ? `${word.word}, ${word.article}` : word.word}</span>
                      <div className="flex items-center gap-2">
                        {/* Show chapter info for favorites view */}
                        {isFavoritesView && 'chapterTitle' in word && word.chapterTitle && (
                          <span className="text-sm text-muted-foreground mr-2">
                            {(word as VocabularyWordWithChapter).chapterTitle}
                          </span>
                        )}
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
