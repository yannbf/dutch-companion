import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { separableVerbs, SeparableVerbExercise } from "@/data/separableVerbs";
import { motion, Reorder } from "framer-motion";
import { Volume2, Check, X } from "lucide-react";
import { speakerService } from "@/services/speaker";
import { hapticService } from "@/services/haptic";
import { exerciseStats } from "@/lib/exerciseStats";

const TOTAL_ROUNDS = 10;

const SeparableVerbs = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentRound, setCurrentRound] = useState(0);
  const [exercises, setExercises] = useState<SeparableVerbExercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<SeparableVerbExercise | null>(null);
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const difficultiesParam = searchParams.get("difficulties") || "easy,medium,hard";
    const selectedDifficulties = difficultiesParam.split(",");
    
    const filtered = separableVerbs.filter(v => 
      selectedDifficulties.includes(v.difficulty)
    );
    
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, TOTAL_ROUNDS);
    
    setExercises(selected);
    if (selected.length > 0) {
      initializeRound(selected[0]);
    }
  }, [searchParams]);

  const initializeRound = (exercise: SeparableVerbExercise) => {
    setCurrentExercise(exercise);
    const shuffled = [...exercise.sentence].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setUserAnswer([]);
    setIsCorrect(null);
  };

  const handleWordClick = (word: string, fromAvailable: boolean) => {
    hapticService.light();
    
    if (fromAvailable) {
      setUserAnswer([...userAnswer, word]);
      setAvailableWords(availableWords.filter(w => w !== word));
    } else {
      const index = userAnswer.indexOf(word);
      if (index > -1) {
        setUserAnswer(userAnswer.filter((_, i) => i !== index));
        setAvailableWords([...availableWords, word]);
      }
    }
  };

  const handleCheck = () => {
    if (!currentExercise || userAnswer.length !== currentExercise.sentence.length) return;
    
    const correct = userAnswer.join(" ") === currentExercise.sentence.join(" ");
    setIsCorrect(correct);
    
    if (correct) {
      hapticService.medium();
      setScore(score + 1);
      exerciseStats.recordAttempt("verbs", currentExercise.difficulty, currentExercise.verb, true);
      
      setTimeout(() => {
        if (currentRound + 1 >= TOTAL_ROUNDS) {
          setShowResults(true);
        } else {
          setCurrentRound(currentRound + 1);
          initializeRound(exercises[currentRound + 1]);
        }
      }, 2000);
    } else {
      hapticService.medium();
      exerciseStats.recordAttempt("verbs", currentExercise.difficulty, currentExercise.verb, false);
    }
  };

  const handleReset = () => {
    if (currentExercise) {
      setUserAnswer([]);
      setAvailableWords([...currentExercise.sentence].sort(() => Math.random() - 0.5));
      setIsCorrect(null);
    }
  };

  const handlePlayAudio = () => {
    if (currentExercise) {
      speakerService.speak(currentExercise.sentence.join(" "));
    }
  };

  const handleRestart = () => {
    setCurrentRound(0);
    setScore(0);
    setShowResults(false);
    if (exercises.length > 0) {
      initializeRound(exercises[0]);
    }
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-6 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-center">Results</h2>
            <div className="text-center space-y-2">
              <div className="text-6xl font-bold text-primary">
                {score}/{TOTAL_ROUNDS}
              </div>
              <p className="text-muted-foreground">
                {Math.round((score / TOTAL_ROUNDS) * 100)}% correct
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleRestart} className="flex-1">
                Practice Again
              </Button>
              <Button onClick={() => navigate("/exercises")} variant="outline" className="flex-1">
                Back to Exercises
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Round {currentRound + 1}/{TOTAL_ROUNDS}
          </span>
          <span className="text-sm font-medium">
            Score: {score}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentRound + 1) / TOTAL_ROUNDS) * 100}%` }}
          />
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                Form the sentence in Dutch
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {currentExercise.translation}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayAudio}
              className="shrink-0"
            >
              <Volume2 className="w-5 h-5" />
            </Button>
          </div>

          {/* User's answer area */}
          <div className="min-h-[120px] border-2 border-dashed border-border rounded-lg p-4">
            {userAnswer.length === 0 ? (
              <p className="text-muted-foreground text-center">
                Tap words below to build your sentence
              </p>
            ) : (
              <Reorder.Group
                axis="x"
                values={userAnswer}
                onReorder={setUserAnswer}
                className="flex flex-wrap gap-2"
              >
                {userAnswer.map((word, index) => (
                  <Reorder.Item key={`${word}-${index}`} value={word}>
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium cursor-pointer touch-manipulation"
                      onClick={() => handleWordClick(word, false)}
                    >
                      {word}
                    </motion.div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </div>

          {/* Feedback */}
          {isCorrect !== null && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg flex items-center gap-3 ${
                isCorrect
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {isCorrect ? (
                <>
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Correct! Well done!</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5" />
                  <span className="font-medium">Not quite right. Try again!</span>
                </>
              )}
            </motion.div>
          )}

          {/* Available words */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Available words:
            </p>
            <div className="flex flex-wrap gap-2">
              {availableWords.map((word, index) => (
                <motion.div
                  key={`${word}-${index}`}
                  whileTap={{ scale: 0.95 }}
                  className="bg-card border-2 border-border px-4 py-2 rounded-lg font-medium cursor-pointer hover:border-primary/50 transition-colors touch-manipulation"
                  onClick={() => handleWordClick(word, true)}
                >
                  {word}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCheck}
              disabled={userAnswer.length !== currentExercise.sentence.length || isCorrect !== null}
              className="flex-1"
              size="lg"
            >
              Check
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              disabled={userAnswer.length === 0 || isCorrect !== null}
              className="flex-1"
              size="lg"
            >
              Reset
            </Button>
          </div>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Separable verb: <span className="font-semibold">{currentExercise.verb}</span></p>
          <p className="text-xs mt-1">
            ({currentExercise.conjugatedVerb} + {currentExercise.prefix})
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeparableVerbs;
