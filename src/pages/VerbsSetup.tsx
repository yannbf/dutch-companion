import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, List, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verbData } from "@/data/verbs";
import { createLocalStorageStore } from "@/lib/localStorage";

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

  return (
    <div className="min-h-screen bg-background pb-20 pt-4 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/exercises')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-0">
            <h1 className="text-2xl font-bold">Onregelmatige werkwoorden</h1>
            <p className="text-sm text-muted-foreground">Configure your practice</p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Game Mode</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateSetup({ mode: "short" })}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-center
                active:scale-95 touch-manipulation
                ${mode === "short" 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border bg-card hover:border-primary/50'
                }
              `}
            >
              <div className="space-y-2">
                <Zap className={`w-8 h-8 mx-auto ${mode === "short" ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-sm font-bold">Quick</div>
                <div className="text-xs text-muted-foreground">10 verbs</div>
              </div>
              {mode === "short" && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
              )}
            </button>
            <button
              onClick={() => updateSetup({ mode: "long" })}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-center
                active:scale-95 touch-manipulation
                ${mode === "long" 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border bg-card hover:border-primary/50'
                }
              `}
            >
              <div className="space-y-2">
                <List className={`w-8 h-8 mx-auto ${mode === "long" ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-sm font-bold">Full</div>
                <div className="text-xs text-muted-foreground">All verbs</div>
              </div>
              {mode === "long" && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Verb Category</h2>
          <div className="grid grid-cols-2 gap-3">
            {([
              { key: "all", label: "All" },
              { key: "hebben", label: "hebben" },
              { key: "zijn", label: "zijn" },
              { key: "hebben/zijn", label: "hebben/zijn" },
            ] as Array<{ key: VerbCategory; label: string }>).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => updateSetup({ category: key })}
                className={`
                  relative p-4 rounded-lg border-2 transition-all text-left
                  active:scale-95 touch-manipulation
                  ${category === key 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-card hover:border-primary/50'
                  }
                `}
              >
                <div className="space-y-1">
                  <div className="text-sm font-bold">{label}</div>
                  <div className="text-xs text-muted-foreground">{getVerbCount(key)} verbs</div>
                </div>
                {category === key && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={handleStart}
        >
          Start Practice ({getVerbCount(category)} verbs)
        </Button>
      </div>
    </div>
  );
};

export default VerbsSetup;
