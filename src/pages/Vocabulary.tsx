import { useState } from "react";
import { vocabularyData } from "@/data/vocabulary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2 } from "lucide-react";
import { speakerService } from "@/services/speaker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Vocabulary = () => {
  const [selectedChapter, setSelectedChapter] = useState(vocabularyData[0].id);
  
  const currentChapter = vocabularyData.find(ch => ch.id === selectedChapter) || vocabularyData[0];

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
            {vocabularyData.map(chapter => (
              <SelectItem key={chapter.id} value={chapter.id}>
                {chapter.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-4">
          {currentChapter.words.map((word, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{word.article ? `${word.word}, ${word.article}` : word.word}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleSpeak(word.word)}
                  >
                    <Volume2 className="w-5 h-5" />
                  </Button>
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default Vocabulary;
