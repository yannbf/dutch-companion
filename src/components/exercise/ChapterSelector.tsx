import { SelectionCard } from "./SelectionCard";

export interface ChapterItem {
  id: number;
  chapter: number;
  title: string;
  words: any[];
}

interface ChapterSelectorProps {
  /**
   * Array of chapters to display
   */
  chapters: ChapterItem[];
  /**
   * Array of currently selected chapter IDs
   */
  selectedChapters: number[];
  /**
   * Callback when a chapter is toggled
   */
  onToggle: (chapterId: number) => void;
  /**
   * Optional title for the section
   */
  title?: string;
}

/**
 * Reusable chapter selector component for vocabulary-based exercises.
 * Displays a grid of chapters that can be selected/deselected.
 */
export const ChapterSelector = ({
  chapters,
  selectedChapters,
  onToggle,
  title = "Select Chapters",
}: ChapterSelectorProps) => {
  return (
    <div className="space-y-3">
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {chapters.map((chapter) => {
          const isSelected = selectedChapters.includes(chapter.chapter);
          return (
            <SelectionCard
              key={chapter.chapter}
              label={`Chapter ${chapter.chapter}`}
              description={`${chapter.title} (${chapter.words.length} words)`}
              isSelected={isSelected}
              onClick={() => onToggle(chapter.chapter)}
            />
          );
        })}
      </div>
    </div>
  );
};

