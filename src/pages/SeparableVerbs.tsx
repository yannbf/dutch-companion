import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { separableVerbs, SeparableVerbExercise } from "@/data/separableVerbs";
import { omTeExercises, SentenceExercise } from "@/data/omTe";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Check, X, RotateCcw, Keyboard } from "lucide-react";
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
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
    setTypedAnswer("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
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
    if (isKeyboardMode) return;
    hapticService.light();
    
    if (from === "available") {
      // Check if word is already in answer to prevent duplicates
      const alreadyInAnswer = userAnswer.some(w => w.id === item.id);
      if (alreadyInAnswer) return;
      
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
    const user = isKeyboardMode 
      ? typedAnswer.trim() 
      : userAnswer.map((i) => i.text).join(" ");
    
    if (!isKeyboardMode && userAnswer.length !== currentExercise.sentence.length) return;
    if (isKeyboardMode && !typedAnswer.trim()) return;

    const correct = normalizeForCompare(user) === normalizeForCompare(expected);
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
      }, 1500);
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
      if (isKeyboardMode) {
        setTypedAnswer("");
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      } else {
        setUserAnswer([]);
        const items: WordItem[] = currentExercise.sentence.map((word, i) => ({
          id: `${word}-${i}-${Math.random().toString(36).slice(2, 8)}`,
          text: word,
        }));
        setAvailableWords([...items].sort(() => Math.random() - 0.5));
      }
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

  const canCheck = isKeyboardMode 
    ? typedAnswer.trim().length > 0 && isCorrect === null
    : userAnswer.length === currentExercise.sentence.length && isCorrect === null;
  const canReset = isKeyboardMode 
    ? typedAnswer.length > 0 && isCorrect === null
    : userAnswer.length > 0 && isCorrect === null;

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
      
      <div className="flex-1 flex flex-col px-4 pt-16 pb-6 max-w-2xl mx-auto w-full">
        {/* Verb info - smaller and more subtle */}
        {"verb" in currentExercise && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="mb-4 py-2 px-3 rounded-lg bg-primary/10 border border-primary/20 inline-flex items-center gap-2 self-start"
          >
            <span className="text-sm font-bold text-primary">
              {currentExercise.verb}
            </span>
            <span className="text-xs text-muted-foreground">
              ({currentExercise.conjugatedVerb} + {currentExercise.prefix})
            </span>
          </motion.div>
        )}

        {/* Question */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">
                Form the sentence in Dutch
              </h3>
              <p className="text-base text-muted-foreground">
                {currentExercise.translation}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsKeyboardMode(!isKeyboardMode)}
                className={`h-9 w-9 rounded-full ${isKeyboardMode ? 'bg-primary/20' : ''}`}
              >
                <Keyboard className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlayAudio}
                className="h-9 w-9 rounded-full"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* User's answer area */}
        <div className="mb-6">
          {isKeyboardMode ? (
            <div className="space-y-2">
              <textarea
                ref={textareaRef}
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-base resize-none focus:outline-none focus:border-primary min-h-[80px]"
                disabled={isCorrect !== null}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Answer lines - Duolingo style */}
              <div className="min-h-[120px] py-2">
                {userAnswer.length === 0 ? (
                  <div className="space-y-3">
                    {[...Array(Math.min(3, currentExercise.sentence.length))].map((_, i) => (
                      <div key={i} className="h-[2px] bg-border rounded-full" />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence mode="popLayout">
                      {userAnswer.map((item, index) => (
                        <motion.button
                          key={item.id}
                          layout
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ 
                            scale: selectedWordIndex === index ? 1.05 : 1, 
                            opacity: 1 
                          }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 500, 
                            damping: 30,
                            mass: 0.5
                          }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleWordClick(item, "answer", index)}
                          className={`
                            px-4 py-2.5 rounded-xl font-medium text-base
                            transition-colors duration-100 touch-manipulation
                            ${selectedWordIndex === index
                              ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                              : "bg-card border-2 border-border hover:border-primary/50"
                            }
                          `}
                        >
                          {item.text}
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {isCorrect !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className={`
                mb-4 p-4 rounded-xl flex items-center gap-3 font-semibold
                ${isCorrect
                  ? "bg-success/10 text-success border-2 border-success/30"
                  : "bg-destructive/10 text-destructive border-2 border-destructive/30"
                }
              `}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center shrink-0
                ${isCorrect ? "bg-success" : "bg-destructive"}
              `}>
                {isCorrect ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <X className="w-5 h-5 text-white" />
                )}
              </div>
              <span className="text-sm">
                {isCorrect ? "Perfect! Well done!" : "Not quite right. Try again!"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Available words */}
        {!isKeyboardMode && (
          <div className="space-y-2 mb-6">
            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {availableWords.map((item) => (
                  <motion.button
                    key={item.id}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 30,
                      mass: 0.5
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleWordClick(item, "available")}
                    className="px-4 py-2.5 rounded-xl font-medium text-base
                      bg-card border-2 border-border
                      hover:border-primary/50 active:bg-card/80
                      transition-colors duration-100 touch-manipulation"
                  >
                    {item.text}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-auto pt-4">
          <Button
            onClick={handleCheck}
            disabled={!canCheck}
            className="flex-1 h-12 text-base font-bold rounded-xl"
            size="lg"
          >
            Check
          </Button>
          {canReset && (
            <Button
              onClick={handleReset}
              variant="outline"
              className="h-12 px-5 rounded-xl"
              size="lg"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeparableVerbs;
