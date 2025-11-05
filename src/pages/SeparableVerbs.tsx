import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { separableVerbs, SeparableVerbExercise } from "@/data/separableVerbs";
import { omTeExercises, SentenceExercise } from "@/data/omTe";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Check, X, RotateCcw, Keyboard } from "lucide-react";
import { speakerService } from "@/services/speaker";
import { hapticService } from "@/services/haptic";
import { audioService } from "@/services/audio";
import { exerciseStats } from "@/lib/exerciseStats";
import { ExerciseProgress, ExerciseSummary, ScoreDisplay } from "@/components/exercise";
import { AppHeader } from "@/components/AppHeader";

type WordItem = { 
  id: string; 
  text: string; 
  originalIndex: number;
  isSelected: boolean;
};
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
  const [shakeButton, setShakeButton] = useState(false);
  const [showSuccessButton, setShowSuccessButton] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggeredRef = useRef(false);

  // Focus textarea when keyboard mode is enabled
  useEffect(() => {
    if (isKeyboardMode && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(typedAnswer.length, typedAnswer.length);
    }
  }, [isKeyboardMode, typedAnswer.length]);

  const initializeRound = useCallback((exercise: SentenceBuilderExercise) => {
    setCurrentExercise(exercise);
    const items: WordItem[] = exercise.sentence.map((word, i) => ({
      id: `${word}-${i}-${Math.random().toString(36).slice(2, 8)}`,
      text: word,
      originalIndex: i,
      isSelected: false,
    }));
    const shuffled = [...items].sort(() => Math.random() - 0.5).map((item, idx) => ({
      ...item,
      originalIndex: idx, // Use shuffled position as original index
    }));
    setAvailableWords(shuffled);
    setUserAnswer([]);
    setIsCorrect(null);
    setSelectedWordIndex(null);
    setTypedAnswer("");
    setShowSuccessButton(false);
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

  const handleWordPressStart = (item: WordItem, from: "available" | "answer", index?: number) => {
    if (isKeyboardMode) return;
    if (from === "available") return; // Long press only works on answer words
    
    longPressTriggeredRef.current = false;
    
    // Start long press timer (500ms)
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      hapticService.medium(); // Stronger haptic for long press
      
      // Activate swap mode
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
    }, 500);
  };

  const handleWordPressEnd = (item: WordItem, from: "available" | "answer") => {
    if (isKeyboardMode) return;
    
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // If long press was triggered, don't do anything on release
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }
    
    // Regular tap/click behavior
    if (from === "available") {
      // Don't allow selecting if already selected
      if (item.isSelected) return;
      
      hapticService.light();
      
      // Mark as selected and add to answer
      setAvailableWords((words) => 
        words.map((w) => w.id === item.id ? { ...w, isSelected: true } : w)
      );
      setUserAnswer((a) => [...a, item]);
      setSelectedWordIndex(null);
    } else {
      // Single tap on answer word - remove
      hapticService.light();
      setUserAnswer((a) => a.filter((x) => x.id !== item.id));
      setAvailableWords((words) => 
        words.map((w) => w.id === item.id ? { ...w, isSelected: false } : w)
      );
      setSelectedWordIndex(null);
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
    
    // Don't check if already showing correct result
    if (isCorrect === true) return;

    const expected = currentExercise.sentence.join(" ");
    const user = isKeyboardMode 
      ? typedAnswer.trim() 
      : userAnswer.map((i) => i.text).join(" ");
    
    // Allow checking even with incomplete answer
    if (!user) return; // Only prevent if completely empty

    const correct = normalizeForCompare(user) === normalizeForCompare(expected);
    setIsCorrect(correct);
    
    if (correct) {
      hapticService.medium();
      audioService.play('success');
      setScore(score + 1);
      setShowSuccessButton(true);
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
      audioService.play('error');
      
      // Shake the button
      setShakeButton(true);
      setTimeout(() => setShakeButton(false), 600);
      
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
        // Reset all words to unselected state
        setAvailableWords((words) => words.map((w) => ({ ...w, isSelected: false })));
      }
      setIsCorrect(null);
      setSelectedWordIndex(null);
      setShowSuccessButton(false);
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
    audioService.play('complete');
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

  const canResetAction = isKeyboardMode 
    ? typedAnswer.length > 0 && isCorrect !== true
    : userAnswer.length > 0 && isCorrect !== true;

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
        {/* Verb info - centered */}
        {"verb" in currentExercise && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="mb-4 py-2 px-3 rounded-lg bg-primary/10 border border-primary/20 inline-flex items-center gap-2 self-center"
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
        <div className="mb-8">
          {isKeyboardMode ? (
            <div className="space-y-2">
              <textarea
                ref={textareaRef}
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-base resize-none focus:outline-none focus:border-primary min-h-[80px] touch-auto"
                disabled={isCorrect !== null}
                autoFocus
              />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Answer area - Duolingo style with fixed height */}
              <div className="relative p-4 rounded-xl border-2 border-border bg-background" style={{ minHeight: '156px' }}>
                {/* Words - naturally wrap across lines */}
                <div className="flex flex-wrap gap-2 content-start">
                  <AnimatePresence mode="popLayout">
                    {userAnswer.map((item, index) => (
                      <motion.button
                        key={item.id}
                        layout
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ 
                          scale: selectedWordIndex === index ? 1.05 : 1, 
                          opacity: 1,
                          y: 0
                        }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 500, 
                          damping: 30,
                          mass: 0.5
                        }}
                        whileTap={{ scale: 0.95 }}
                        onPointerDown={() => handleWordPressStart(item, "answer", index)}
                        onPointerUp={() => handleWordPressEnd(item, "answer")}
                        onPointerLeave={() => {
                          // Cancel long press if pointer leaves the button
                          if (longPressTimerRef.current) {
                            clearTimeout(longPressTimerRef.current);
                            longPressTimerRef.current = null;
                          }
                        }}
                        className={`
                          px-4 py-2.5 rounded-xl font-medium text-base border-2
                          transition-colors duration-100 touch-manipulation
                          ${selectedWordIndex === index
                            ? "bg-primary text-primary-foreground border-primary shadow-lg"
                            : "bg-background border-border hover:border-primary/50 shadow-sm"
                          }
                        `}
                      >
                        {item.text}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Available words - Fixed positions with placeholders */}
        {!isKeyboardMode && (
          <div className="space-y-2 mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {availableWords.map((item) => (
                <div key={item.id} className="relative">
                  {item.isSelected ? (
                    // Placeholder for selected word - grey background like Duolingo
                    <div 
                      className="px-4 py-2.5 rounded-xl font-medium text-base border-2 border-border/30 bg-muted/60 pointer-events-none"
                    >
                      <span className="invisible">{item.text}</span>
                    </div>
                  ) : (
                    // Available word
                    <motion.button
                      layout
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onPointerDown={() => handleWordPressStart(item, "available")}
                      onPointerUp={() => handleWordPressEnd(item, "available")}
                      className="px-4 py-2.5 rounded-xl font-medium text-base border-2 border-border bg-card hover:border-primary/50 hover:bg-card/80 active:bg-card/60 transition-all duration-100 touch-manipulation shadow-sm"
                    >
                      {item.text}
                    </motion.button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-4 pt-4">
          <motion.div
            className="flex-1"
            animate={shakeButton ? {
              x: [0, -10, 10, -5, 5, 0],
            } : {}}
            transition={{ duration: 0.4 }}
          >
            <Button
              onClick={handleCheck}
              className={`w-full h-12 text-base font-bold rounded-xl transition-colors duration-300 ${
                showSuccessButton
                  ? 'bg-green-500 hover:bg-green-500/90 text-white !opacity-100'
                  : ''
              }`}
              size="lg"
              disabled={showSuccessButton}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: showSuccessButton ? [1, 1.1, 1] : 1,
                  rotate: showSuccessButton ? [0, 10, -10, 0] : 0
                }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center gap-2"
              >
                {showSuccessButton ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Correct!</span>
                  </>
                ) : (
                  <span>Check</span>
                )}
              </motion.div>
            </Button>
          </motion.div>
          <Button
            onClick={handleReset}
            variant="outline"
            className="h-12 px-5 rounded-xl"
            size="lg"
            disabled={!canResetAction}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SeparableVerbs;
