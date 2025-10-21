import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { separableVerbs } from "@/data/separableVerbs";

const SeparableVerbsSetup = () => {
  const navigate = useNavigate();
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(["easy", "medium", "hard"]);

  const difficulties = [
    { id: "easy", label: "Easy", count: separableVerbs.filter(v => v.difficulty === "easy").length },
    { id: "medium", label: "Medium", count: separableVerbs.filter(v => v.difficulty === "medium").length },
    { id: "hard", label: "Hard", count: separableVerbs.filter(v => v.difficulty === "hard").length },
  ];

  const toggleDifficulty = (difficultyId: string) => {
    setSelectedDifficulties(prev =>
      prev.includes(difficultyId)
        ? prev.filter(id => id !== difficultyId)
        : [...prev, difficultyId]
    );
  };

  const handleStart = () => {
    if (selectedDifficulties.length === 0) return;
    
    const params = new URLSearchParams();
    params.set("difficulties", selectedDifficulties.join(","));
    navigate(`/exercises/separable-verbs/play?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Separable Verbs</h1>
          <p className="text-muted-foreground">
            Build sentences with separable verbs by dragging words into the correct order
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Select Difficulty</h2>
          <div className="grid gap-3">
            {difficulties.map((difficulty) => (
              <Card
                key={difficulty.id}
                className={`p-4 cursor-pointer transition-all border-2 touch-manipulation relative ${
                  selectedDifficulties.includes(difficulty.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => toggleDifficulty(difficulty.id)}
              >
                {selectedDifficulties.includes(difficulty.id) && (
                  <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-medium">{difficulty.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {difficulty.count} exercises
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Button
          onClick={handleStart}
          disabled={selectedDifficulties.length === 0}
          className="w-full"
          size="lg"
        >
          Start Practice (10 rounds)
        </Button>
      </div>
    </div>
  );
};

export default SeparableVerbsSetup;
