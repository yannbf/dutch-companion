import { VerbCard } from "@/data/verbs";

interface VerbResult {
  verb: VerbCard;
  correct: boolean;
}

interface ProgressIndicatorProps {
  totalCards: number;
  results: VerbResult[];
}

export const ProgressIndicator = ({ totalCards, results }: ProgressIndicatorProps) => {
  const getClassName = (index: number) => {
    if (index < results.length) {
      return results[index].correct ? 'correct' : 'wrong';
    }
    return '';
  };

  return (
    <div className="fixed top-1 left-0 flex flex-row justify-evenly w-full z-50 px-1">
      {Array.from({ length: totalCards }, (_, index) => (
        <div
          key={index}
          className={`flex-1 h-2 rounded-full w-auto mx-0.5 block min-w-0 transition-colors duration-200 ${
            getClassName(index) === 'correct' 
              ? 'bg-green-500' 
              : getClassName(index) === 'wrong' 
                ? 'bg-red-500' 
                : 'bg-white/10'
          }`}
        />
      ))}
    </div>
  );
};
