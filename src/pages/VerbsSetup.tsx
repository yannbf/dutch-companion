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

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Game Mode</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card
              className={`cursor-pointer transition-all active:scale-95 touch-manipulation ${
                mode === "short" ? "border-primary bg-accent" : "hover:border-primary/50"
              }`}
              onClick={() => updateSetup({ mode: "short" })}
            >
              <CardContent className="pt-6 pb-4 text-center space-y-2">
                <Zap className={`w-8 h-8 mx-auto ${mode === "short" ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <div className="font-bold text-lg">Quick</div>
                  <div className="text-sm text-muted-foreground">10 verbs</div>
                </div>
              </CardContent>
            </Card>
            <Card
              className={`cursor-pointer transition-all active:scale-95 touch-manipulation ${
                mode === "long" ? "border-primary bg-accent" : "hover:border-primary/50"
              }`}
              onClick={() => updateSetup({ mode: "long" })}
            >
              <CardContent className="pt-6 pb-4 text-center space-y-2">
                <List className={`w-8 h-8 mx-auto ${mode === "long" ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <div className="font-bold text-lg">Full</div>
                  <div className="text-sm text-muted-foreground">All verbs</div>
                </div>
              </CardContent>
            </Card>
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
              <Card
                key={key}
                className={`cursor-pointer transition-all active:scale-95 touch-manipulation ${
                  category === key ? "border-primary bg-accent" : "hover:border-primary/50"
                }`}
                onClick={() => updateSetup({ category: key })}
              >
                <CardContent className="pt-6 pb-4 text-center space-y-1">
                  <div className={`font-bold text-lg ${category === key ? "text-primary" : ""}`}>{label}</div>
                  <div className="text-sm text-muted-foreground">{getVerbCount(key)} verbs</div>
                </CardContent>
              </Card>
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
