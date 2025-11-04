import { useState, useEffect, useRef, Fragment, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { separableVerbs, SeparableVerbExercise } from "@/data/separableVerbs";
import { omTeExercises, SentenceExercise } from "@/data/omTe";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { Volume2, Check, X, Keyboard } from "lucide-react";
import { speakerService } from "@/services/speaker";
import { hapticService } from "@/services/haptic";
import { exerciseStats } from "@/lib/exerciseStats";
import { ExerciseProgress, ExerciseSummary, ScoreDisplay } from "@/components/exercise";

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
  const answerAreaRef = useRef<HTMLDivElement>(null);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [draggingItem, setDraggingItem] = useState<WordItem | null>(null);
  const [insertionIndex, setInsertionIndex] = useState<number | null>(null);
  const [draggingFrom, setDraggingFrom] = useState<"available" | "answer" | null>(null);
  const [dragCursor, setDragCursor] = useState<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
    setWrongStreak(0);
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

  useEffect(() => {
    if (isKeyboardMode) {
      // Auto-focus textarea when keyboard mode is enabled or round changes
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [isKeyboardMode, currentExercise]);

  const handleWordClick = (item: WordItem, from: "available" | "answer") => {
    hapticService.light();
    if (from === "available") {
      setAvailableWords((w) => w.filter((x) => x.id !== item.id));
      setUserAnswer((a) => [...a, item]);
    } else {
      setUserAnswer((a) => a.filter((x) => x.id !== item.id));
      setAvailableWords((w) => [...w, item]);
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
      ? typedAnswer
      : userAnswer.map((i) => i.text).join(" ");
    if (!isKeyboardMode && userAnswer.length !== currentExercise.sentence.length) return;

    const correct = isKeyboardMode
      ? normalizeForCompare(user) === normalizeForCompare(expected)
      : user === expected;
    setIsCorrect(correct);
    
    if (correct) {
      hapticService.medium();
      setScore(score + 1);
      setWrongStreak(0);
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
          setTypedAnswer("");
        }
      }, 2000);
    } else {
      hapticService.medium();
      setWrongStreak((prev) => prev + 1);
      setShakeTrigger((s) => s + 1);
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
      setWrongStreak(0);
      setDraggingItem(null);
      setInsertionIndex(null);
      setDraggingFrom(null);
      setDragCursor(null);
      setTypedAnswer("");
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

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    item: WordItem,
    source: "available" | "answer"
  ) => {
    const area = answerAreaRef.current?.getBoundingClientRect();
    const inside = !!(
      area &&
      info.point.x >= area.left &&
      info.point.x <= area.right &&
      info.point.y >= area.top &&
      info.point.y <= area.bottom
    );
    if (inside && source === "available") {
      setAvailableWords((w) => w.filter((x) => x.id !== item.id));
      setUserAnswer((a) => {
        const idx = insertionIndex ?? a.length;
        return [...a.slice(0, idx), item, ...a.slice(idx)];
      });
      hapticService.light();
    } else if (!inside && source === "answer") {
      setUserAnswer((a) => a.filter((x) => x.id !== item.id));
      setAvailableWords((w) => [...w, item]);
      hapticService.light();
    } else if (inside && source === "answer") {
      // Reorder within answer using the placeholder index
      setUserAnswer((a) => {
        const fromIdx = a.findIndex((x) => x.id === item.id);
        if (fromIdx === -1) return a;
        const toIdxRaw = insertionIndex ?? fromIdx;
        const toIdx = Math.max(0, Math.min(toIdxRaw, a.length));
        if (toIdx === fromIdx || toIdx === fromIdx + 1) return a; // no-op
        const without = a.filter((_, i) => i !== fromIdx);
        const adjusted = toIdx > fromIdx ? toIdx - 1 : toIdx;
        return [...without.slice(0, adjusted), item, ...without.slice(adjusted)];
      });
      hapticService.light();
    }
    setDraggingItem(null);
    setInsertionIndex(null);
    setDraggingFrom(null);
    setDragCursor(null);
  };

  // Compute insertion index for external drags (available -> answer)
  const computeInsertionIndex = (pointX: number, pointY: number): number => {
    if (!answerAreaRef.current) return userAnswer.length;
    const wordNodes = answerAreaRef.current.querySelectorAll('[data-answer-word="true"]');
    const rects = Array.from(wordNodes).map((el) => (el as HTMLElement).getBoundingClientRect());
    if (rects.length === 0) return 0;
    let nearestIndex = 0;
    let nearestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = pointX - cx;
      const dy = pointY - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 < nearestDist) {
        nearestDist = d2;
        nearestIndex = i;
      }
    }
    const nearestRect = rects[nearestIndex];
    const nearestCenterX = nearestRect.left + nearestRect.width / 2;
    return pointX < nearestCenterX ? nearestIndex : nearestIndex + 1;
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Round {currentRound + 1}/{totalRounds}
          </span>
          <ScoreDisplay score={score} variant="compact" animate={false} />
        </div>

        {/* Progress bar */}
        <ExerciseProgress
          current={currentRound}
          total={totalRounds}
          variant="bar"
        />

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
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsKeyboardMode((v) => !v)}
                className={`${isKeyboardMode ? "text-primary" : ""}`}
                aria-pressed={isKeyboardMode}
                aria-label="Toggle keyboard mode"
              >
                <Keyboard className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlayAudio}
                className="shrink-0"
              >
                <Volume2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* User's answer area */}
          <motion.div
            key={shakeTrigger}
            animate={isCorrect === false && wrongStreak >= 2 ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
            transition={{ duration: 0.45 }}
            ref={answerAreaRef}
            className={`min-h-[120px] border-2 border-dashed rounded-lg p-4 ${
              isCorrect === false && wrongStreak >= 2 ? "border-red-500/60" : "border-border"
            }`}
          >
            {isKeyboardMode ? (
              <textarea
                ref={textareaRef}
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCheck();
                  }
                }}
                placeholder="Type the sentence here…"
                className="w-full min-h-[88px] bg-background border rounded-md p-3 outline-none focus:ring-2 focus:ring-primary"
              />
            ) : userAnswer.length === 0 ? (
              <p className="text-muted-foreground text-center">
                Tap or drag words below to build your sentence
              </p>
            ) : (
              <Reorder.Group axis="x" values={userAnswer} onReorder={setUserAnswer} className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {userAnswer.map((item, index) => (
                    <Fragment key={`wrap-${item.id}`}>
                      {draggingItem && insertionIndex === index && (
                        <div
                          key={`placeholder-${index}`}
                          className="px-4 py-2 rounded-lg font-medium border-2 border-primary bg-primary/10 text-transparent select-none"
                        >
                          {draggingItem.text}
                        </div>
                      )}
                    <Reorder.Item
                      key={item.id}
                      value={item}
                      drag
                      onDragStart={(e, info) => {
                        setDraggingItem(item);
                        setDraggingFrom("answer");
                        setDragCursor({ x: info.point.x, y: info.point.y });
                        suppressClickRef.current = true;
                      }}
                      onDrag={(e, info) => {
                        const area = answerAreaRef.current?.getBoundingClientRect();
                        if (!area) return;
                        const inside =
                          info.point.x >= area.left &&
                          info.point.x <= area.right &&
                          info.point.y >= area.top &&
                          info.point.y <= area.bottom;
                        if (inside) {
                          const idx = computeInsertionIndex(info.point.x, info.point.y);
                          setInsertionIndex(idx);
                        } else {
                          setInsertionIndex(null);
                        }
                        setDragCursor({ x: info.point.x, y: info.point.y });
                      }}
                      onDragEnd={(e, info) => {
                        handleDragEnd(e, info, item, "answer");
                        setDraggingItem(null);
                        setInsertionIndex(null);
                        setDraggingFrom(null);
                        setDragCursor(null);
                      }}
                      whileDrag={{ scale: 1.1, zIndex: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
                      initial={{ opacity: 0.9, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={
                        draggingFrom === "answer" && draggingItem?.id === item.id && dragCursor
                          ? { position: "fixed", left: dragCursor.x, top: dragCursor.y, transform: "translate(-50%, -50%)", pointerEvents: "none" }
                          : undefined
                      }
                    >
                      <div
                        data-answer-word={draggingItem?.id === item.id ? "dragging" : "true"}
                        className={"bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium cursor-grab select-none"}
                        onClick={() => {
                          if (suppressClickRef.current) {
                            suppressClickRef.current = false;
                            return;
                          }
                          handleWordClick(item, "answer");
                        }}
                      >
                        {item.text}
                      </div>
                    </Reorder.Item>
                    </Fragment>
                  ))}
                  {draggingItem && insertionIndex === userAnswer.length && (
                    <div
                      key={`placeholder-end`}
                      className="px-4 py-2 rounded-lg font-medium border-2 border-primary bg-primary/10 text-transparent select-none"
                    >
                      {draggingItem.text}
                    </div>
                  )}
                </AnimatePresence>
              </Reorder.Group>
            )}
          </motion.div>

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
            {!isKeyboardMode && (
            <div className="flex flex-wrap gap-2">
                {availableWords.map((item) => (
                <motion.div
                  key={item.id}
                  drag
                    whileDrag={{ scale: 1.1, zIndex: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onDragStart={() => {
                    setDraggingItem(item);
                    setDraggingFrom("available");
                    suppressClickRef.current = true;
                  }}
                  onDrag={(event, info) => {
                    const area = answerAreaRef.current?.getBoundingClientRect();
                    if (!area) return;
                    const inside =
                      info.point.x >= area.left &&
                      info.point.x <= area.right &&
                      info.point.y >= area.top &&
                      info.point.y <= area.bottom;
                    if (inside) {
                      const idx = computeInsertionIndex(info.point.x, info.point.y);
                      setInsertionIndex(idx);
                    } else {
                      setInsertionIndex(null);
                    }
                  }}
                  onDragEnd={(event, info) => {
                    const area = answerAreaRef.current?.getBoundingClientRect();
                    const inside = !!(
                      area &&
                      info.point.x >= area.left &&
                      info.point.x <= area.right &&
                      info.point.y >= area.top &&
                      info.point.y <= area.bottom
                    );
                    handleDragEnd(event, info, item, "available");
                    if (!inside) {
                      // Snap back: rely on dragSnapToOrigin by setting it and letting motion animate back
                      // Alternatively force re-render to reset any transforms
                    }
                    suppressClickRef.current = false;
                  }}
                  className="bg-card border-2 border-border px-4 py-2 rounded-lg font-medium cursor-grab select-none hover:border-primary/50"
                  onClick={() => {
                    if (suppressClickRef.current) {
                      suppressClickRef.current = false;
                      return;
                    }
                    handleWordClick(item, "available");
                  }}
                >
                  {item.text}
                </motion.div>
              ))}
            </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCheck}
              disabled={(!isKeyboardMode && userAnswer.length !== currentExercise.sentence.length) || isCorrect === true}
              className="flex-1"
              size="lg"
            >
              Check
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              disabled={(!isKeyboardMode && userAnswer.length === 0) || isCorrect === true}
              className="flex-1"
              size="lg"
            >
              Reset
            </Button>
          </div>
        </Card>

        

        {"verb" in currentExercise && (
          <div className="text-center text-sm text-muted-foreground">
            <p>Separable verb: <span className="font-semibold">{currentExercise.verb}</span></p>
            <p className="text-xs mt-1">
              ({currentExercise.conjugatedVerb} + {currentExercise.prefix})
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeparableVerbs;
