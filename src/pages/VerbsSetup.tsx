import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, List } from "lucide-react";
import { verbData } from "@/data/verbs";
import { createLocalStorageStore } from "@/lib/localStorage";
import {
  ExerciseSetupLayout,
  ModeSelector,
  SelectionCard,
  type ModeOption,
} from "@/components/exercise";

type VerbCategory = "all" | "hebben" | "zijn" | "hebben/zijn";
type VerbMode = "short" | "long";

const LS_KEY = 'verbs-game-setup';

// Create a store for verb game setup
const gameSetupStore = createLocalStorageStore('verbs-game-setup', {
  category: "all" as VerbCategory,
  mode: "short" as VerbMode
});

const loadSetup = (): { category: VerbCategory; mode: VerbMode } => {
  const saved = gameSetupStore.get();

  // Validate the loaded data to ensure it has valid category and mode
  const category: VerbCategory = ["all", "hebben", "zijn", "hebben/zijn"].includes(saved?.category)
    ? saved.category
    : "all";
  const mode: VerbMode = ["short", "long"].includes(saved?.mode) ? saved.mode : "short";

  return { category, mode };
};

const saveSetup = (setup: { category: VerbCategory; mode: VerbMode }) => {
  gameSetupStore.set(setup);
};

const VerbsSetup = () => {
  const navigate = useNavigate();
  const [setup, setSetup] = useState(() => loadSetup());
  const { category, mode } = setup;

  const updateSetup = (partial: Partial<{ category: VerbCategory; mode: VerbMode }>) => {
    setSetup((prev) => {
      const next = { ...prev, ...partial };
      saveSetup(next);
      return next;
    });
  };

  const getVerbCount = (cat: VerbCategory) => {
    if (cat === "all") {
      return mode === "short" ? Math.min(10, verbData.length) : verbData.length;
    }
    const filteredVerbs = verbData.filter((verb) => verb.category === cat);
    return mode === "short" ? Math.min(10, filteredVerbs.length) : filteredVerbs.length;
  };

  const handleStart = () => {
    saveSetup({ category, mode });
    navigate('/exercises/verbs/play');
  };

  const modeOptions: ModeOption[] = [
    {
      id: "short",
      label: "Quick",
      description: "10 verbs",
      icon: <Zap className="w-8 h-8" />,
    },
    {
      id: "long",
      label: "Full",
      description: "All verbs",
      icon: <List className="w-8 h-8" />,
    },
  ];

  const categoryOptions: Array<{ key: VerbCategory; label: string }> = [
    { key: "all", label: "All" },
    { key: "hebben", label: "hebben" },
    { key: "zijn", label: "zijn" },
    { key: "hebben/zijn", label: "hebben/zijn" },
  ];

  return (
    <ExerciseSetupLayout
      title="Verb tenses"
      subtitle="Configure your practice"
      startButton={{
        label: `Start Practice (${getVerbCount(category)} verbs)`,
        onClick: handleStart,
      }}
    >
      {/* Game Mode Selection */}
      <ModeSelector
        modes={modeOptions}
        selectedMode={mode}
        onSelect={(newMode) => updateSetup({ mode: newMode })}
        title="Game Mode"
      />

      {/* Verb Category Selection */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Verb Category</h2>
        <div className="grid grid-cols-2 gap-3">
          {categoryOptions.map(({ key, label }) => (
            <SelectionCard
              key={key}
              label={label}
              description={`${getVerbCount(key)} verbs`}
              isSelected={category === key}
              onClick={() => updateSetup({ category: key })}
            />
          ))}
        </div>
      </div>
    </ExerciseSetupLayout>
  );
};

export default VerbsSetup;
