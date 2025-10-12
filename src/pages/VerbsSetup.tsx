import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, List, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verbData } from "@/data/verbs";

const VerbsSetup = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<"all" | "hebben" | "zijn" | "hebben/zijn">("all");
  const [mode, setMode] = useState<"short" | "long">("short");

  const getVerbCount = (cat: "all" | "hebben" | "zijn" | "hebben/zijn") => {
    if (cat === "all") {
      return mode === "short" ? Math.min(10, verbData.length) : verbData.length;
    }
    const filteredVerbs = verbData.filter((verb) => verb.category === cat);
    return mode === "short" ? Math.min(10, filteredVerbs.length) : filteredVerbs.length;
  };

  const handleStart = () => {
    // Save setup choices to localStorage
    localStorage.setItem('verbs-game-setup', JSON.stringify({ category, mode }));
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
              onClick={() => setMode("short")}
            >
              <Zap className="w-4 h-4" />
              <div className="text-sm font-semibold">Quick</div>
              <div className="text-xs opacity-80">10 verbs</div>
            </Button>
            <Button
              variant={mode === "long" ? "default" : "outline"}
              className="h-auto py-3 flex-col gap-1 touch-manipulation"
              onClick={() => setMode("long")}
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
            <Button
              variant={category === "all" ? "default" : "outline"}
              className="h-auto py-2.5 justify-between text-sm touch-manipulation"
              onClick={() => setCategory("all")}
            >
              <span className="font-semibold">All</span>
              <span className="text-xs opacity-80">{getVerbCount("all")}</span>
            </Button>
            <Button
              variant={category === "hebben" ? "default" : "outline"}
              className="h-auto py-2.5 justify-between text-sm touch-manipulation"
              onClick={() => setCategory("hebben")}
            >
              <span className="font-semibold">hebben</span>
              <span className="text-xs opacity-80">{getVerbCount("hebben")}</span>
            </Button>
            <Button
              variant={category === "zijn" ? "default" : "outline"}
              className="h-auto py-2.5 justify-between text-sm touch-manipulation"
              onClick={() => setCategory("zijn")}
            >
              <span className="font-semibold">zijn</span>
              <span className="text-xs opacity-80">{getVerbCount("zijn")}</span>
            </Button>
            <Button
              variant={category === "hebben/zijn" ? "default" : "outline"}
              className="h-auto py-2.5 justify-between text-sm touch-manipulation"
              onClick={() => setCategory("hebben/zijn")}
            >
              <span className="font-semibold">hebben/zijn</span>
              <span className="text-xs opacity-80">{getVerbCount("hebben/zijn")}</span>
            </Button>
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
