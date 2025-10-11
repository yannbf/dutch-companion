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
    <div className="min-h-screen bg-background pb-20 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/exercises')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Onregelmatige werkwoorden</h1>
            <p className="text-muted-foreground">Configure your practice session</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Game Mode</CardTitle>
            <CardDescription>Choose how many verbs to practice</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button
              variant={mode === "short" ? "default" : "outline"}
              className="h-auto py-4 justify-start"
              onClick={() => setMode("short")}
            >
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Quick Mode</div>
                  <div className="text-sm opacity-80">Practice 10 verbs</div>
                </div>
              </div>
            </Button>
            <Button
              variant={mode === "long" ? "default" : "outline"}
              className="h-auto py-4 justify-start"
              onClick={() => setMode("long")}
            >
              <div className="flex items-center gap-3">
                <List className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Full Mode</div>
                  <div className="text-sm opacity-80">Practice all verbs</div>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verb Category</CardTitle>
            <CardDescription>Select which verbs to practice</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button
              variant={category === "all" ? "default" : "outline"}
              className="h-auto py-4 justify-between"
              onClick={() => setCategory("all")}
            >
              <span className="font-semibold">All Verbs</span>
              <span className="text-sm opacity-80">{getVerbCount("all")} verbs</span>
            </Button>
            <Button
              variant={category === "hebben" ? "default" : "outline"}
              className="h-auto py-4 justify-between"
              onClick={() => setCategory("hebben")}
            >
              <span className="font-semibold">hebben</span>
              <span className="text-sm opacity-80">{getVerbCount("hebben")} verbs</span>
            </Button>
            <Button
              variant={category === "zijn" ? "default" : "outline"}
              className="h-auto py-4 justify-between"
              onClick={() => setCategory("zijn")}
            >
              <span className="font-semibold">zijn</span>
              <span className="text-sm opacity-80">{getVerbCount("zijn")} verbs</span>
            </Button>
            <Button
              variant={category === "hebben/zijn" ? "default" : "outline"}
              className="h-auto py-4 justify-between"
              onClick={() => setCategory("hebben/zijn")}
            >
              <span className="font-semibold">hebben/zijn</span>
              <span className="text-sm opacity-80">{getVerbCount("hebben/zijn")} verbs</span>
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
