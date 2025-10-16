import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, List, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verbData } from "@/data/verbs";

type VerbCategory = "all" | "hebben" | "zijn" | "hebben/zijn";
type VerbMode = "short" | "long";

const LS_KEY = 'verbs-game-setup';

const loadSetup = (): { category: VerbCategory; mode: VerbMode } => {
  const defaultSetup = { category: "all" as VerbCategory, mode: "short" as VerbMode };
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const category: VerbCategory = ["all", "hebben", "zijn", "hebben/zijn"].includes(parsed?.category)
        ? parsed.category
        : defaultSetup.category;
      const mode: VerbMode = ["short", "long"].includes(parsed?.mode) ? parsed.mode : defaultSetup.mode;
      return { category, mode };
    }
  } catch {
    // ignore
  }
  return defaultSetup;
};

const saveSetup = (setup: { category: VerbCategory; mode: VerbMode }) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(setup));
  } catch {
    // ignore
  }
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Game Mode</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button
              variant={mode === "short" ? "default" : "outline"}
              className="h-auto py-3 flex-col gap-1 touch-manipulation"
              onClick={() => updateSetup({ mode: "short" })}
            >
              <Zap className="w-4 h-4" />
              <div className="text-sm font-semibold">Quick</div>
              <div className="text-xs opacity-80">10 verbs</div>
            </Button>
            <Button
              variant={mode === "long" ? "default" : "outline"}
              className="h-auto py-3 flex-col gap-1 touch-manipulation"
              onClick={() => updateSetup({ mode: "long" })}
            >
              <List className="w-4 h-4" />
              <div className="text-sm font-semibold">Full</div>
              <div className="text-xs opacity-80">All verbs</div>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Verb Category</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {([
              { key: "all", label: "All" },
              { key: "hebben", label: "hebben" },
              { key: "zijn", label: "zijn" },
              { key: "hebben/zijn", label: "hebben/zijn" },
            ] as Array<{ key: VerbCategory; label: string }>).map(({ key, label }) => (
              <Button
                key={key}
                variant={category === key ? "default" : "outline"}
                className="h-auto py-2.5 justify-between text-sm touch-manipulation"
                onClick={() => updateSetup({ category: key })}
              >
                <span className="font-semibold">{label}</span>
                <span className="text-xs opacity-80">{getVerbCount(key)}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

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
