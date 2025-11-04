/**
 * Reusable exercise components for consistent UI patterns across exercises.
 * These components help reduce code duplication in setup and play pages.
 */

// Setup Components
export { SelectionCard } from "./SelectionCard";
export { ChapterSelector } from "./ChapterSelector";
export type { ChapterItem } from "./ChapterSelector";
export { DifficultySelector } from "./DifficultySelector";
export type { DifficultyLevel } from "./DifficultySelector";
export { ModeSelector } from "./ModeSelector";
export type { ModeOption } from "./ModeSelector";
export { ExerciseSetupLayout } from "./ExerciseSetupLayout";

// Play Components
export { ExerciseProgress, ExerciseProgressWithLabel } from "./ExerciseProgress";
export { ExerciseHeader } from "./ExerciseHeader";
export { ScoreDisplay, ScoreComparison } from "./ScoreDisplay";
export { ExerciseSummary, QuickSummary } from "./ExerciseSummary";

