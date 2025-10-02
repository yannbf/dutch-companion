import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { VerbCard as VerbCardType } from "@/data/verbs";
import { speakerService } from "@/services/speaker";
import { Volume2 } from "lucide-react";
import { useState, useEffect } from "react";

interface CardPileProps {
  verbs: VerbCardType[];
  currentIndex: number;
  cardState: 0 | 1 | 2; // 0: infinitive, 1: imperfectum, 2: perfectum
  onFlip: () => void;
  onSwipe: (direction: "left" | "right") => void;
  showTranslation: boolean;
}

export const CardPile = ({
  verbs,
  currentIndex,
  cardState,
  onFlip,
  onSwipe,
  showTranslation
}: CardPileProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const [hideBackgroundText, setHideBackgroundText] = useState(false);

  // Hide background text for 200ms when currentIndex changes
  useEffect(() => {
    setHideBackgroundText(true);
    const timer = setTimeout(() => {
      setHideBackgroundText(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      onSwipe(info.offset.x > 0 ? "right" : "left");
    }
  };

  const handleSentenceClick = (sentence: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card flip
    speakerService.speak(sentence);
  };

  // Get the next 3 cards to show in the pile
  const getVisibleCards = () => {
    const visibleCards = [];
    for (let i = 0; i < Math.min(3, verbs.length - currentIndex); i++) {
      const verbIndex = currentIndex + i;
      if (verbIndex < verbs.length) {
        visibleCards.push({
          verb: verbs[verbIndex],
          index: i,
          isActive: i === 0
        });
      }
    }
    return visibleCards;
  };

  const visibleCards = getVisibleCards();
  const currentVerb = visibleCards[0]?.verb;

  if (!currentVerb) return null;

  return (
    <div className="relative w-80 h-96" style={{ isolation: 'isolate' }}>
      {visibleCards.map(({ verb, index, isActive }) => {
        const scale = 1 - (index * 0.05); // Each card is 5% smaller
        const translateY = index * 8; // Each card is 8px lower
        const translateX = index * 4; // Each card is 4px to the right
        const zIndex = 10 - index; // Much higher z-index for cards on top
        const opacity = 1; // All cards have full opacity

        return (
          <motion.div
            key={`${verb.infinitive}-${currentIndex + index}`}
            className={`absolute inset-0 ${isActive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
            style={{
              scale,
              translateY,
              translateX,
              zIndex,
              opacity: isActive ? opacity : undefined,
              x: isActive ? x : undefined,
              rotate: isActive ? rotate : undefined,
            }}
            drag={isActive ? "x" : false}
            dragConstraints={isActive ? { left: 0, right: 0 } : undefined}
            onDragEnd={isActive ? handleDragEnd : undefined}
            onClick={isActive ? onFlip : undefined}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale, opacity }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <div className="w-full h-full bg-card border-2 border-primary rounded-2xl p-8 flex flex-col justify-center items-center shadow-2xl relative overflow-hidden" style={{ zIndex: zIndex + 1 }}>
              {cardState === 0 && (
                <div className="text-center space-y-6">
                  {(!hideBackgroundText || isActive) && (
                    <>
                      <h2 className="text-5xl font-black text-primary">{verb.infinitive}</h2>
                      {showTranslation && (
                        <p className="text-2xl text-muted-foreground italic">{verb.translation}</p>
                      )}
                    </>
                  )}
                  {isActive && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full text-center">
                      <p className="text-sm text-muted-foreground">Tap to flip • Swipe to score</p>
                    </div>
                  )}
                </div>
              )}

              {cardState === 1 && (
                <div className="text-center space-y-4 w-full">
                  <h3 className="text-3xl font-bold text-primary text-purple-400 mb-6">Imperfectum</h3>
                  {(!hideBackgroundText || isActive) && (
                    <>
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
                      <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <button
                            className="flex-shrink-0 p-1 hover:bg-secondary/70 rounded transition-colors"
                            onClick={(e) => handleSentenceClick(verb.exampleImperfectum, e)}
                          >
                            <Volume2 className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <p className="text-sm italic text-foreground">{verb.exampleImperfectum}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {cardState === 2 && (
                <div className="text-center space-y-4 w-full">
                  <h3 className="text-3xl font-bold text-primary text-blue-400 mb-6">Perfectum</h3>
                  {(!hideBackgroundText || isActive) && (
                    <>
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
                      <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <button
                            className="flex-shrink-0 p-1 hover:bg-secondary/70 rounded transition-colors"
                            onClick={(e) => handleSentenceClick(verb.examplePerfectum, e)}
                          >
                            <Volume2 className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <p className="text-sm italic text-foreground">{verb.examplePerfectum}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
