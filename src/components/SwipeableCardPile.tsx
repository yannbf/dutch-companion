import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { speakerService } from "@/services/speaker";
import { hapticService } from "@/services/haptic";
import { Volume2 } from "lucide-react";
import { useState, useEffect, useMemo, ReactNode } from "react";

export interface CardState {
  id: string;
  content: ReactNode;
  audioText?: string;
}

export interface CardContent {
  id: string;
  states: CardState[];
}

interface SwipeableCardPileProps<T extends CardContent> {
  cards: T[];
  currentIndex: number;
  currentState?: number;
  onFlip?: () => void;
  onSwipe: (direction: "left" | "right") => void;
  onCardChange?: (card: T) => void;
  onPileComplete?: () => void;
  autoManageStates?: boolean;
  className?: string;
  cardWidth?: number;
  cardHeight?: number;
  maxVisibleCards?: number;
}

export function SwipeableCardPile<T extends CardContent>({
  cards,
  currentIndex: externalCurrentIndex,
  currentState: externalCurrentState,
  onFlip: externalOnFlip,
  onSwipe,
  onCardChange,
  onPileComplete,
  autoManageStates = false,
  className = "relative w-80 h-96",
  cardWidth = 320,
  cardHeight = 384,
  maxVisibleCards = 3,
}: SwipeableCardPileProps<T>) {
  // Internal state management when autoManageStates is true
  const [internalCurrentIndex, setInternalCurrentIndex] = useState(0);
  const [internalCurrentState, setInternalCurrentState] = useState(0);

  // Use external state if provided, otherwise use internal state
  const currentIndex = autoManageStates ? internalCurrentIndex : (externalCurrentIndex ?? 0);
  const currentState = autoManageStates ? internalCurrentState : (externalCurrentState ?? 0);

  // Memoize the current index to use for effects
  const currentIndexToUse = autoManageStates ? internalCurrentIndex : (externalCurrentIndex ?? 0);

  const onFlip = autoManageStates ? () => {
    setInternalCurrentState(prev => (prev + 1) % cards[currentIndexToUse]?.states.length);
  } : externalOnFlip;

  // Handle pile completion when autoManageStates is true
  const handleSwipeWithCompletion = (direction: "left" | "right") => {
    onSwipe(direction);

    if (autoManageStates) {
      if (internalCurrentIndex >= cards.length - 1) {
        // This was the last card in the pile
        onPileComplete?.();
      } else {
        // Move to next card
        setInternalCurrentIndex(prev => prev + 1);
        setInternalCurrentState(0); // Reset card state for new card
      }
    }
  };
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
  }, [currentIndexToUse]);

  // Notify parent when card changes
  useEffect(() => {
    if (cards[currentIndexToUse]) {
      onCardChange?.(cards[currentIndexToUse]);
    }
  }, [currentIndexToUse, cards, onCardChange]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      // Provide haptic feedback for swipe
      hapticService.medium();
      if (autoManageStates) {
        handleSwipeWithCompletion(info.offset.x > 0 ? "right" : "left");
      } else {
        onSwipe(info.offset.x > 0 ? "right" : "left");
      }
    }
  };

  const handleSentenceClick = (audioText: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card flip
    // Provide haptic feedback for audio button tap
    hapticService.light();
    speakerService.speak(audioText);
  };

  const handleCardFlip = () => {
    // Provide haptic feedback for card flip
    hapticService.light();
    onFlip();
  };

  // Get the next cards to show in the pile
  const getVisibleCards = () => {
    const visibleCards = [];
    for (let i = 0; i < Math.min(maxVisibleCards, cards.length - currentIndexToUse); i++) {
      const cardIndex = currentIndexToUse + i;
      if (cardIndex < cards.length) {
        visibleCards.push({
          card: cards[cardIndex],
          index: i,
          isActive: i === 0
        });
      }
    }
    return visibleCards;
  };

  const visibleCards = getVisibleCards();

  if (visibleCards.length === 0) return null;

  return (
    <div className={`${className} relative`} style={{ isolation: 'isolate', width: cardWidth, height: cardHeight, backgroundColor: 'transparent' }}>
      {visibleCards.map(({ card, index, isActive }) => {
        const scale = 1 - (index * 0.05); // Each card is 5% smaller
        const translateY = index * 8; // Each card is 8px lower
        const translateX = index * 4; // Each card is 4px to the right
        const zIndex = 10 - index; // Much higher z-index for cards on top

        // Ensure only the active card respects the currentState; background cards always show front
        const safeCurrentState = Math.min(currentState, card.states.length - 1);
        const stateIndexForCard = isActive ? safeCurrentState : 0;
        const cardStateContent = card.states[stateIndexForCard];

        return (
          <motion.div
            key={`${card.id}-${currentIndexToUse + index}`}
            className={`absolute inset-0 ${isActive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
            style={{
              scale,
              translateY,
              translateX,
              zIndex,
              x: isActive ? x : undefined,
              rotate: isActive ? rotate : undefined,
              width: cardWidth,
              height: cardHeight,
            }}
            drag={isActive ? "x" : false}
            dragConstraints={isActive ? { left: 0, right: 0 } : undefined}
            onDragEnd={isActive ? handleDragEnd : undefined}
            onClick={isActive ? handleCardFlip : undefined}
          >
            <div className="w-full h-full bg-card border-2 border-primary rounded-2xl p-8 flex flex-col justify-center items-center shadow-2xl relative overflow-hidden" style={{ zIndex: zIndex + 1, backgroundColor: 'hsl(var(--card))' }}>
              {cardStateContent?.content || (
                <div className="text-center space-y-6">
                  <p className="text-muted-foreground">Card content unavailable</p>
                </div>
              )}

              {isActive && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full text-center">
                  <p className="text-sm text-muted-foreground">Tap to flip • Swipe to score</p>
                </div>
              )}

              {cardStateContent?.audioText && isActive && (
                <button
                  className="absolute top-4 right-4 p-2 hover:bg-secondary/70 rounded-full transition-colors"
                  onClick={(e) => handleSentenceClick(cardStateContent.audioText!, e)}
                >
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
