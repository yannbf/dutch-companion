import { VerbCard } from "@/data/verbs";
import { SwipeableCardPile, CardContent, CardState } from "./SwipeableCardPile";
import { ReactNode } from "react";

// Convert VerbCard to generic CardContent format
const createVerbCardContent = (verb: VerbCard, showTranslation: boolean): CardContent => ({
  id: verb.infinitive,
  states: [
    {
      id: "infinitive",
      content: (
        <div className="text-center space-y-6">
          <h2 className="text-5xl font-black text-primary">{verb.infinitive}</h2>
          {showTranslation && (
            <p className="text-2xl text-muted-foreground italic">{verb.translation}</p>
          )}
        </div>
      ) as ReactNode,
    },
    {
      id: "imperfectum",
      content: (
        <div className="text-center space-y-4 w-full">
          <h3 className="text-3xl font-bold text-primary text-purple-400 mb-6">Imperfectum</h3>
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
              <p className="text-sm italic text-foreground flex-1">{verb.exampleImperfectum}</p>
            </div>
          </div>
        </div>
      ) as ReactNode,
      audioText: verb.exampleImperfectum,
    },
    {
      id: "perfectum",
      content: (
        <div className="text-center space-y-4 w-full">
          <h3 className="text-3xl font-bold text-primary text-blue-400 mb-6">Perfectum</h3>
          <div className="space-y-3 text-left">
            <p className="text-xl">
              <span className="text-muted-foreground">Participium:</span>{" "}
              <span className="font-bold text-foreground">{verb.participium}</span>
            </p>
            <p className="text-xl">
              <span className="text-muted-foreground">Hulpverbum:</span>{" "}
              <span className="font-bold text-foreground">{verb.hulpverbum}</span>
            </p>
          </div>
          <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-start gap-3">
              <p className="text-sm italic text-foreground flex-1">{verb.examplePerfectum}</p>
            </div>
          </div>
        </div>
      ) as ReactNode,
      audioText: verb.examplePerfectum,
    }
  ]
});

interface CardPileProps {
  verbs: VerbCard[];
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
  // Convert verbs to generic card content format
  const verbCards = verbs.map(verb => createVerbCardContent(verb, showTranslation));

  return (
    <SwipeableCardPile
      cards={verbCards}
      currentIndex={currentIndex}
      currentState={cardState}
      onFlip={onFlip}
      onSwipe={onSwipe}
    />
  );
};
