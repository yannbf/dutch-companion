import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shuffle } from "lucide-react";
import { separableVerbs } from "@/data/separableVerbs";
import { omTeExercises } from "@/data/omTe";
import {
  ExerciseSetupLayout,
  ModeSelector,
  DifficultySelector,
  type ModeOption,
  type DifficultyLevel,
} from "@/components/exercise";

const SeparableVerbsSetup = () => {
  const navigate = useNavigate();
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(["easy", "medium", "hard"]);
  const [mode, setMode] = useState<"separable-verbs" | "om-te">("separable-verbs");

  const source = mode === "separable-verbs" ? separableVerbs : omTeExercises;
  
  const modeOptions: ModeOption[] = [
    {
      id: "separable-verbs",
      label: "Separable verbs",
      description: "Practice scheidbare werkwoorden",
      icon: <Shuffle className="w-5 h-5" />,
    },
    {
      id: "om-te",
      label: "Om te",
      description: "Practice om ... te constructions",
      icon: <Shuffle className="w-5 h-5" />,
    },
  ];

  const difficulties: DifficultyLevel[] = [
    { id: "easy", label: "Easy", count: source.filter((v) => v.difficulty === "easy").length },
    { id: "medium", label: "Medium", count: source.filter((v) => v.difficulty === "medium").length },
    { id: "hard", label: "Hard", count: source.filter((v) => v.difficulty === "hard").length },
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
    params.set("mode", mode);
    navigate(`/exercises/separable-verbs/play?${params.toString()}`);
  };

  const totalExercises = source
    .filter((v) => selectedDifficulties.includes(v.difficulty))
    .length;

  return (
    <ExerciseSetupLayout
      title="Sentence Builder"
      subtitle="Build sentences by dragging words into the correct order"
      startButton={{
        label: `Start Practice (10 rounds)`,
        onClick: handleStart,
        disabled: selectedDifficulties.length === 0,
      }}
    >
      {/* Mode Selection */}
      <ModeSelector
        modes={modeOptions}
        selectedMode={mode}
        onSelect={(newMode) => setMode(newMode as "separable-verbs" | "om-te")}
        title="Select Mode"
        layout="column"
      />

      {/* Difficulty Selection */}
      <DifficultySelector
        difficulties={difficulties}
        selectedDifficulties={selectedDifficulties}
        onToggle={toggleDifficulty}
      />

    </ExerciseSetupLayout>
  );
};

export default SeparableVerbsSetup;
