import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { separableVerbs, SeparableVerbExercise } from "@/data/separableVerbs";
import { omTeExercises, SentenceExercise } from "@/data/omTe";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Check, X, RotateCcw } from "lucide-react";
import { speakerService } from "@/services/speaker";
import { hapticService } from "@/services/haptic";
import { exerciseStats } from "@/lib/exerciseStats";
import { ExerciseProgress, ExerciseSummary, ScoreDisplay } from "@/components/exercise";
import { AppHeader } from "@/components/AppHeader";

type WordItem = { id: string; text: string };
type SentenceBuilderExercise = SeparableVerbExercise | SentenceExercise;

const SeparableVerbs = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentRound, setCurrentRound] = useState(0);
  const [exercises, setExercises] = useState<SentenceBuilderExercise[]>([]);
  const [totalRounds, setTotalRounds] = useState(10);
  const [currentExercise, setCurrentExercise] = useState<SentenceBuilderExercise | null>(null);
  const [userAnswer, setUserAnswer] = useState<WordItem[]>([]);
  const [availableWords, setAvailableWords] = useState<WordItem[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const lastTapRef = useRef<{ wordId: string; time: number } | null>(null);

  const initializeRound = useCallback((exercise: SentenceBuilderExercise) => {
    setCurrentExercise(exercise);
    const items: WordItem[] = exercise.sentence.map((word, i) => ({
      id: `${word}-${i}-${Math.random().toString(36).slice(2, 8)}`,
      text: word,
    }));
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setUserAnswer([]);
    setIsCorrect(null);
    setSelectedWordIndex(null);
  }, []);

  useEffect(() => {
    const difficultiesParam = searchParams.get("difficulties") || "easy,medium,hard";
    const selectedDifficulties = difficultiesParam.split(",");
    const mode = (searchParams.get("mode") || "separable-verbs") as "separable-verbs" | "om-te";

    const pool = mode === "separable-verbs" ? separableVerbs : omTeExercises;
    const filtered = pool.filter((v) => selectedDifficulties.includes(v.difficulty));
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    
    // Take up to 10 exercises, or all available if less
    const maxRounds = Math.min(10, filtered.length);
    const selected = shuffled.slice(0, maxRounds);

    setTotalRounds(maxRounds);
    setExercises(selected);
    if (selected.length > 0) {
      initializeRound(selected[0]);
    }
  }, [searchParams, initializeRound]);

  const handleWordClick = (item: WordItem, from: "available" | "answer", index?: number) => {
    hapticService.light();
    
    if (from === "available") {
      // Add to answer
      setAvailableWords((w) => w.filter((x) => x.id !== item.id));
      setUserAnswer((a) => [...a, item]);
      setSelectedWordIndex(null);
    } else {
      // Tap on answer word
      const now = Date.now();
      const isDoubleTap = 
        lastTapRef.current?.wordId === item.id && 
        now - lastTapRef.current.time < 300;

      if (isDoubleTap) {
        // Double tap - remove from answer
        setUserAnswer((a) => a.filter((x) => x.id !== item.id));
        setAvailableWords((w) => [...w, item]);
        setSelectedWordIndex(null);
        lastTapRef.current = null;
      } else {
        // Single tap - select for swapping
        lastTapRef.current = { wordId: item.id, time: now };
        
        if (selectedWordIndex === null) {
          setSelectedWordIndex(index!);
        } else if (selectedWordIndex === index) {
          setSelectedWordIndex(null);
        } else {
          // Swap words
          setUserAnswer((a) => {
            const newAnswer = [...a];
            const temp = newAnswer[selectedWordIndex];
            newAnswer[selectedWordIndex] = newAnswer[index!];
            newAnswer[index!] = temp;
            return newAnswer;
          });
          setSelectedWordIndex(null);
        }
      }
    }
  };

  const normalizeForCompare = (s: string) =>
    s
      .toLowerCase()
      .replace(/[.,!?;:¿¡"“”'()[\]{}]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const handleCheck = () => {
    if (!currentExercise) return;

    const expected = currentExercise.sentence.join(" ");
    const user = userAnswer.map((i) => i.text).join(" ");
    if (userAnswer.length !== currentExercise.sentence.length) return;

    const correct = user === expected;
    setIsCorrect(correct);
    
    if (correct) {
      hapticService.medium();
      setScore(score + 1);
      exerciseStats.recordAttempt(
        "verbs",
        currentExercise.difficulty,
        "verb" in currentExercise ? currentExercise.verb : undefined,
        true
      );
      
      setTimeout(() => {
        if (currentRound + 1 >= totalRounds) {
          setShowResults(true);
        } else {
          setCurrentRound(currentRound + 1);
          initializeRound(exercises[currentRound + 1]);
        }
      }, 2000);
    } else {
      hapticService.medium();
      exerciseStats.recordAttempt(
        "verbs",
        currentExercise.difficulty,
        "verb" in currentExercise ? currentExercise.verb : undefined,
        false
      );
    }
  };

  const handleReset = () => {
    if (currentExercise) {
      setUserAnswer([]);
      const items: WordItem[] = currentExercise.sentence.map((word, i) => ({
        id: `${word}-${i}-${Math.random().toString(36).slice(2, 8)}`,
        text: word,
      }));
      setAvailableWords([...items].sort(() => Math.random() - 0.5));
      setIsCorrect(null);
      setSelectedWordIndex(null);
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
      <ExerciseSummary
        score={totalRounds}
        total={totalRounds}
        title="Excellent Work!"
        subtitle={`You completed ${totalRounds} round${totalRounds !== 1 ? 's' : ''}`}
        actions={{
          retry: {
            label: "Practice Again",
            onClick: handleRestart,
          },
          home: {
            label: "Back to Exercises",
            onClick: () => navigate("/exercises"),
          },
        }}
      >
        <div className="text-center space-y-2">
          <div className="text-6xl font-bold text-primary">{totalRounds}</div>
          <p className="text-muted-foreground">exercises completed</p>
        </div>
      </ExerciseSummary>
    );
  }

  if (!currentExercise && exercises.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No exercises available with the selected difficulties.</p>
          <Button onClick={() => navigate("/exercises/separable-verbs")}>
            Go Back
          </Button>
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

  const canCheck = userAnswer.length === currentExercise.sentence.length && isCorrect === null;
  const canReset = userAnswer.length > 0 && isCorrect === null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader
        backPath="/exercises/separable-verbs"
        center={
          <span className="text-sm font-medium">
            {currentRound + 1}/{totalRounds}
          </span>
        }
        right={<ScoreDisplay score={score} variant="compact" animate={false} />}
      />
      
      <div className="flex-1 flex flex-col px-4 pt-20 pb-6 max-w-2xl mx-auto w-full">
        {/* Progress bar */}
        <div className="mb-6">
          <ExerciseProgress
            current={currentRound}
            total={totalRounds}
            variant="bar"
          />
        </div>

        {/* Verb info card - Now at top for emphasis */}
        {"verb" in currentExercise && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30"
          >
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Separable Verb
              </p>
              <p className="text-2xl font-bold text-primary mb-1">
                {currentExercise.verb}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentExercise.conjugatedVerb} + {currentExercise.prefix}
              </p>
            </div>
          </motion.div>
        )}

        {/* Question */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">
                Form the sentence in Dutch
              </h3>
              <p className="text-base text-muted-foreground">
                {currentExercise.translation}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayAudio}
              className="shrink-0 h-10 w-10 rounded-full"
            >
              <Volume2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* User's answer area */}
        <div className="mb-6 flex-1 flex flex-col justify-center min-h-[140px]">
          <AnimatePresence mode="wait">
            {userAnswer.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full min-h-[100px] border-2 border-dashed border-border rounded-2xl"
              >
                <p className="text-muted-foreground text-center px-4">
                  Tap words below to build your sentence
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="answer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap gap-2 p-4 bg-card/50 rounded-2xl border border-border min-h-[100px] items-center justify-center"
              >
                {userAnswer.map((item, index) => (
                  <motion.button
                    key={item.id}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleWordClick(item, "answer", index)}
                    className={`
                      px-5 py-3 rounded-xl font-semibold text-base
                      transition-all touch-manipulation
                      ${selectedWordIndex === index
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/30 scale-105"
                        : "bg-primary/90 text-primary-foreground hover:bg-primary"
                      }
                    `}
                  >
                    {item.text}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          {selectedWordIndex !== null && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-muted-foreground text-center mt-3"
            >
              Tap another word to swap • Double-tap to remove
            </motion.p>
          )}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {isCorrect !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`
                mb-6 p-5 rounded-2xl flex items-center gap-4 font-semibold
                ${isCorrect
                  ? "bg-success/10 text-success border-2 border-success/30"
                  : "bg-destructive/10 text-destructive border-2 border-destructive/30"
                }
              `}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center shrink-0
                ${isCorrect ? "bg-success" : "bg-destructive"}
              `}>
                {isCorrect ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <X className="w-6 h-6 text-white" />
                )}
              </div>
              <span className="text-base">
                {isCorrect ? "Perfect! Well done!" : "Not quite right. Try again!"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Available words */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Available Words
          </p>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {availableWords.map((item) => (
                <motion.button
                  key={item.id}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleWordClick(item, "available")}
                  className="px-5 py-3 rounded-xl font-semibold text-base
                    bg-card border-2 border-border
                    hover:border-primary/50 active:bg-card/80
                    transition-all touch-manipulation"
                >
                  {item.text}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-auto">
          <Button
            onClick={handleCheck}
            disabled={!canCheck}
            className="flex-1 h-14 text-base font-bold rounded-xl"
            size="lg"
          >
            Check Answer
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={!canReset}
            className="h-14 px-6 rounded-xl"
            size="lg"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SeparableVerbs;
