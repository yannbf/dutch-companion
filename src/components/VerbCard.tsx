import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { VerbCard as VerbCardType } from "@/data/verbs";
import { speakerService } from "@/services/speaker";

interface VerbCardProps {
  verb: VerbCardType;
  cardState: 0 | 1 | 2; // 0: infinitive, 1: imperfectum, 2: perfectum
  onFlip: () => void;
  onSwipe: (direction: "left" | "right") => void;
  showTranslation: boolean;
}

export const VerbCard = ({ verb, cardState, onFlip, onSwipe, showTranslation }: VerbCardProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      onSwipe(info.offset.x > 0 ? "right" : "left");
    }
  };

  const handleSentenceClick = (sentence: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card flip
    speakerService.speak(sentence);
  };

  return (
    <motion.div
      className="cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onClick={onFlip}
    >
      <div className="w-80 max-w-sm h-96 bg-card border-2 border-primary rounded-2xl p-8 flex flex-col justify-center items-center shadow-2xl">
        {cardState === 0 && (
          <div className="text-center space-y-6">
            <h2 className="text-5xl font-black text-primary">{verb.infinitive}</h2>
            {showTranslation && (
              <p className="text-2xl text-muted-foreground italic">{verb.translation}</p>
            )}
            <p className="text-sm text-muted-foreground mt-8">Tap to flip • Swipe to score</p>
          </div>
        )}

        {cardState === 1 && (
          <div className="text-center space-y-4 w-full">
            <h3 className="text-3xl font-bold text-primary mb-6">Imperfectum</h3>
            <div className="space-y-3 text-left">
              <p className="text-xl">
                <span className="text-muted-foreground">Singularis:</span>{" "}
                <span className="font-bold text-foreground">{verb.imperfectumSingular}</span>
              </p>
              <p className="text-xl">
                <span className="text-muted-foreground">Pluralis:</span>{" "}
                <span className="font-bold text-foreground">{verb.imperfectumPlural}</span>
              </p>
            </div>
            <div 
              className="mt-6 p-4 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary/70 transition-colors"
              onClick={(e) => handleSentenceClick(verb.exampleImperfectum, e)}
            >
              <p className="text-sm italic text-foreground">{verb.exampleImperfectum}</p>
            </div>
          </div>
        )}

        {cardState === 2 && (
          <div className="text-center space-y-4 w-full">
            <h3 className="text-3xl font-bold text-primary mb-6">Perfectum</h3>
            <div className="space-y-3 text-left">
              <p className="text-xl">
                <span className="text-muted-foreground">Hulpverbum:</span>{" "}
                <span className="font-bold text-foreground">{verb.hulpverbum}</span>
              </p>
              <p className="text-xl">
                <span className="text-muted-foreground">Participium:</span>{" "}
                <span className="font-bold text-foreground">{verb.participium}</span>
              </p>
            </div>
            <div 
              className="mt-6 p-4 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary/70 transition-colors"
              onClick={(e) => handleSentenceClick(verb.examplePerfectum, e)}
            >
              <p className="text-sm italic text-foreground">{verb.examplePerfectum}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
