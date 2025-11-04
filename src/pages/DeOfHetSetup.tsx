import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { vocabularyData } from "@/data/vocabulary";
import { createLocalStorageStore } from "@/lib/localStorage";
import { AppHeader } from "@/components/AppHeader";

// Create a store for deofhet chapters
const deOfHetStore = createLocalStorageStore<string[]>("deofhet-chapters", ["all"]);

const DeOfHetSetup = () => {
  const navigate = useNavigate();
  const [selectedChapters, setSelectedChapters] = useState<string[]>(() => {
    return deOfHetStore.get();
  });

  const handleChapterToggle = (chapterId: string) => {
    if (chapterId === "all") {
      setSelectedChapters(["all"]);
    } else {
      const newSelection = selectedChapters.filter(id => id !== "all");
      if (newSelection.includes(chapterId)) {
        const filtered = newSelection.filter(id => id !== chapterId);
        setSelectedChapters(filtered.length === 0 ? ["all"] : filtered);
      } else {
        setSelectedChapters([...newSelection, chapterId]);
      }
    }
  };

  const handleStart = () => {
    deOfHetStore.set(selectedChapters);
    navigate("/exercises/deofhet/play");
  };

  const availableChapters = vocabularyData.filter(chapter => 
    chapter.words.some(word => word.article && (word.article === 'de' || word.article === 'het'))
  );

  return (
    <div className="min-h-screen bg-background pb-20 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <AppHeader
          title="De of Het"
          backPath="/exercises"
          fixed={false}
        />
        
        <p className="text-sm text-muted-foreground text-center">Choose your chapters</p>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chapters</CardTitle>
            <CardDescription>Select which chapters to practice</CardDescription>
          </CardHeader>
          <div className="p-6 pt-0 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all"
                checked={selectedChapters.includes("all")}
                onCheckedChange={() => handleChapterToggle("all")}
              />
              <Label htmlFor="all" className="cursor-pointer">
                All Chapters
              </Label>
            </div>
            {availableChapters.map((chapter) => (
              <div key={chapter.id} className="flex items-center space-x-2">
                <Checkbox
                  id={chapter.id}
                  checked={selectedChapters.includes(chapter.id) || selectedChapters.includes("all")}
                  onCheckedChange={() => handleChapterToggle(chapter.id)}
                  disabled={selectedChapters.includes("all")}
                />
                <Label htmlFor={chapter.id} className="cursor-pointer">
                  {chapter.chapter} - {chapter.title}
                </Label>
              </div>
            ))}
          </div>
        </Card>

        <Button
          onClick={handleStart}
          className="w-full"
          size="lg"
        >
          <Play className="w-5 h-5 mr-2" />
          Start Exercise
        </Button>
      </div>
    </div>
  );
};

export default DeOfHetSetup;
