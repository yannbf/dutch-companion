import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { weatherWords, weatherSentences } from "@/data/weather";
import { exerciseStats } from "@/lib/exerciseStats";
import { hapticService } from "@/services/haptic";

type WeatherMode = "vocab" | "sentiment";

const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

const Weather = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get("mode") || "vocab") as WeatherMode;

  // Common state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [feedback, setFeedback] = useState<null | { correct: boolean; message: string }>(null);

  // Vocab specific
  const vocabItems = useMemo(() => shuffle(weatherWords), []);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const optionsForCurrent = useMemo(() => {
    const correctTranslation = vocabItems[currentIndex]?.translation || "";
    const pool = shuffle(weatherWords.map(w => w.translation).filter(t => t !== correctTranslation));
    return shuffle([correctTranslation, ...pool.slice(0, 3)]);
  }, [currentIndex, vocabItems]);

  // Sentiment specific
  const sentimentItems = useMemo(() => shuffle(weatherSentences), []);
  const [selectedSentiment, setSelectedSentiment] = useState<null | 'positive' | 'negative'>(null);

  const total = mode === "vocab" ? vocabItems.length : sentimentItems.length;

  useEffect(() => {
    if (currentIndex >= total) {
      setShowSummary(true);
    }
  }, [currentIndex, total]);

  const handleBack = () => navigate("/exercises/weather");

  const handleAnswer = (correct: boolean, meta?: { word?: string }) => {
    hapticService.medium();
    if (correct) setScore((s) => s + 1);
    exerciseStats.recordAttempt("weather", undefined, meta?.word, correct);
    setFeedback({ correct, message: correct ? "Correct!" : "Not quite" });
    setTimeout(() => {
      setCurrentIndex((i) => i + 1);
      setFeedback(null);
      setSelectedOption(null);
      setSelectedSentiment(null);
    }, 2000);
  };

  if (showSummary) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-6 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-center">Results</h2>
            <div className="text-center space-y-2">
              <div className="text-6xl font-bold text-primary">{score}/{total}</div>
              <p className="text-muted-foreground">{Math.round((score / Math.max(1, total)) * 100)}% correct</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => { setCurrentIndex(0); setScore(0); setShowSummary(false); }} className="flex-1">Play Again</Button>
              <Button onClick={() => navigate("/exercises")} variant="outline" className="flex-1">Back to Exercises</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Question {Math.min(currentIndex + 1, total)}/{total}</span>
          <span className="text-sm font-medium">Score: {score}</span>
        </div>

        {mode === "vocab" ? (
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Translate the word</h3>
              <p className="text-sm text-muted-foreground mt-1">Choose the correct English translation</p>
            </div>
            <div className="text-2xl font-bold text-center py-6">{vocabItems[currentIndex]?.word}</div>
            <div className="grid gap-3">
              {optionsForCurrent.map((opt) => {
                const correct = opt === (vocabItems[currentIndex]?.translation || "");
                const isSelected = selectedOption === opt;
                const showState = selectedOption !== null;
                return (
                <Button
                  key={opt}
                  variant="outline"
                  disabled={showState}
                  onClick={() => {
                    if (selectedOption) return;
                    setSelectedOption(opt);
                    handleAnswer(correct, { word: vocabItems[currentIndex]?.word });
                  }}
                  className={`justify-start ${
                    showState
                      ? correct
                        ? 'border-green-500 bg-green-500/10'
                        : isSelected
                        ? 'border-red-500 bg-red-500/10'
                        : 'opacity-60'
                      : ''
                  }`}
                >
                  {opt}
                </Button>
                );
              })}
            </div>
            {feedback && (
              <div className={`text-center text-sm font-medium ${feedback.correct ? 'text-green-600' : 'text-red-600'}`}>
                {feedback.message}
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Classify the sentence</h3>
              <p className="text-sm text-muted-foreground mt-1">Is this positive or negative?</p>
            </div>
            <div className="text-xl font-medium text-center py-6">{sentimentItems[currentIndex]?.sentence}</div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                disabled={selectedSentiment !== null}
                onClick={() => {
                  if (selectedSentiment) return;
                  setSelectedSentiment('positive');
                  handleAnswer(sentimentItems[currentIndex]?.sentiment === 'positive');
                }}
                className={`${
                  selectedSentiment
                    ? sentimentItems[currentIndex]?.sentiment === 'positive'
                      ? 'border-green-500 bg-green-500/10'
                      : selectedSentiment === 'positive'
                      ? 'border-red-500 bg-red-500/10'
                      : 'opacity-60'
                    : ''
                }`}
              >
                Positive
              </Button>
              <Button
                variant="outline"
                disabled={selectedSentiment !== null}
                onClick={() => {
                  if (selectedSentiment) return;
                  setSelectedSentiment('negative');
                  handleAnswer(sentimentItems[currentIndex]?.sentiment === 'negative');
                }}
                className={`${
                  selectedSentiment
                    ? sentimentItems[currentIndex]?.sentiment === 'negative'
                      ? 'border-green-500 bg-green-500/10'
                      : selectedSentiment === 'negative'
                      ? 'border-red-500 bg-red-500/10'
                      : 'opacity-60'
                    : ''
                }`}
              >
                Negative
              </Button>
            </div>
            <div className="text-sm text-muted-foreground text-center">{sentimentItems[currentIndex]?.translation}</div>
            {feedback && (
              <div className={`text-center text-sm font-medium ${feedback.correct ? 'text-green-600' : 'text-red-600'}`}>
                {feedback.message}
              </div>
            )}
          </Card>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleBack} className="flex-1">Back</Button>
        </div>
      </div>
    </div>
  );
};

export default Weather;


