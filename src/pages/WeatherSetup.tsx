import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { weatherWords, weatherSentences } from "@/data/weather";

type WeatherMode = "vocab" | "sentiment";

const WeatherSetup = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<WeatherMode>("vocab");

  const handleStart = () => {
    const params = new URLSearchParams();
    params.set("mode", mode);
    navigate(`/exercises/weather/play?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/exercises")}> 
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Weather</h1>
            <p className="text-sm text-muted-foreground">Learn weather vocabulary and classify sentence sentiment</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Choose Mode</h2>
          <div className="grid gap-3">
            {([
              { id: "vocab", label: "Vocabulary", description: "Multiple choice: translate weather words", count: weatherWords.length },
              { id: "sentiment", label: "Sentiment", description: "Positive vs Negative weather sentences", count: weatherSentences.length },
            ] as { id: WeatherMode; label: string; description: string; count: number }[]).map((m) => (
              <Card
                key={m.id}
                className={`p-4 cursor-pointer transition-all border-2 touch-manipulation relative ${
                  mode === m.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onClick={() => setMode(m.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{m.label}</span>
                    <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{m.count} items</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Button onClick={handleStart} className="w-full" size="lg">
          <Play className="w-5 h-5 mr-2" />
          Start
        </Button>
      </div>
    </div>
  );
};

export default WeatherSetup;


