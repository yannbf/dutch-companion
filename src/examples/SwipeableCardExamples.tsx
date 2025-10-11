import { useState } from "react";
import { SwipeableCardPile, CardContent, CardState } from "@/components/SwipeableCardPile";
import { Button } from "@/components/ui/button";
import { Card, CardContent as UICardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Example 1: Simple vocabulary cards with 2 states (front/back)
interface VocabularyCardContent extends CardContent {
  type: 'vocabulary';
  word: string;
  translation: string;
  example: string;
}

const createVocabularyCardContent = (word: string, translation: string, example: string): VocabularyCardContent => ({
  id: word,
  type: 'vocabulary',
  word,
  translation,
  example,
  states: [
    {
      id: "front",
      content: (
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold text-primary">{word}</h2>
        </div>
      ),
    },
    {
      id: "back",
      content: (
        <div className="text-center space-y-4 w-full">
          <p className="text-xl font-semibold">{translation}</p>
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Example:</p>
            <p className="italic">{example}</p>
          </div>
        </div>
      ),
      audioText: word,
    }
  ]
});

// Example 2: Quiz cards with multiple choice answers
interface QuizCardContent extends CardContent {
  type: 'quiz';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const createQuizCardContent = (question: string, options: string[], correctAnswer: string, explanation: string): QuizCardContent => ({
  id: question,
  type: 'quiz',
  question,
  options,
  correctAnswer,
  explanation,
  states: [
    {
      id: "question",
      content: (
        <div className="text-center space-y-6 w-full">
          <h3 className="text-2xl font-bold">{question}</h3>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="p-3 bg-secondary rounded-lg text-left">
                <span className="font-semibold">Option {index + 1}:</span> {option}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "answer",
      content: (
        <div className="text-center space-y-4 w-full">
          <div className={`p-4 rounded-lg ${options.includes(correctAnswer) ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
            <p className="font-semibold">Correct Answer:</p>
            <p className="text-lg">{correctAnswer}</p>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Explanation:</p>
            <p className="text-sm">{explanation}</p>
          </div>
        </div>
      ),
    }
  ]
});

// Example 3: Image cards with descriptions
interface ImageCardContent extends CardContent {
  type: 'image';
  imageUrl: string;
  title: string;
  description: string;
}

const createImageCardContent = (imageUrl: string, title: string, description: string): ImageCardContent => ({
  id: title,
  type: 'image',
  imageUrl,
  title,
  description,
  states: [
    {
      id: "image",
      content: (
        <div className="text-center space-y-4 w-full">
          <img src={imageUrl} alt={title} className="w-full h-48 object-cover rounded-lg" />
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
      ),
    },
    {
      id: "description",
      content: (
        <div className="text-center space-y-4 w-full">
          <img src={imageUrl} alt={title} className="w-full h-32 object-cover rounded-lg opacity-50" />
          <div className="pt-4 border-t">
            <p className="text-sm">{description}</p>
          </div>
        </div>
      ),
      audioText: description,
    }
  ]
});

export const SwipeableCardExamples = () => {
  const [currentGame, setCurrentGame] = useState<'vocabulary' | 'quiz' | 'image'>('vocabulary');

  // Sample data for each game type
  const vocabularyCards: VocabularyCardContent[] = [
    createVocabularyCardContent(
      "Huis",
      "House",
      "Ik woon in een mooi huis."
    ),
    createVocabularyCardContent(
      "Auto",
      "Car",
      "Hij rijdt in een rode auto."
    ),
    createVocabularyCardContent(
      "Boom",
      "Tree",
      "De boom in de tuin is groot."
    ),
  ];

  const quizCards: QuizCardContent[] = [
    createQuizCardContent(
      "What is the capital of France?",
      ["London", "Berlin", "Paris", "Madrid"],
      "Paris",
      "Paris is the capital and most populous city of France."
    ),
    createQuizCardContent(
      "Which planet is known as the Red Planet?",
      ["Venus", "Mars", "Jupiter", "Saturn"],
      "Mars",
      "Mars appears red due to iron oxide on its surface."
    ),
  ];

  const imageCards: ImageCardContent[] = [
    createImageCardContent(
      "https://picsum.photos/300/200?random=1",
      "Beautiful Landscape",
      "A serene mountain landscape with a lake reflecting the peaks under a cloudy sky."
    ),
    createImageCardContent(
      "https://picsum.photos/300/200?random=2",
      "City Skyline",
      "A modern city skyline at dusk with illuminated buildings against the twilight sky."
    ),
  ];

  const getCurrentCards = () => {
    switch (currentGame) {
      case 'vocabulary': return vocabularyCards;
      case 'quiz': return quizCards;
      case 'image': return imageCards;
      default: return vocabularyCards;
    }
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentState, setCurrentState] = useState(0);

  const handleFlip = () => {
    setCurrentState(prev => (prev + 1) % getCurrentCards()[currentIndex]?.states.length || 0);
  };

  const handleSwipe = (direction: "left" | "right") => {
    const cards = getCurrentCards();
    const isCorrect = direction === "right"; // For quiz, right = correct answer

    // Move to next card or cycle back to beginning
    if (currentIndex + 1 >= cards.length) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
    setCurrentState(0);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Swipeable Card Examples</h1>
          <p className="text-muted-foreground mb-6">
            Demonstrating different use cases for the SwipeableCardPile component
          </p>
        </div>

        {/* Game Type Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Game Type</CardTitle>
          </CardHeader>
          <UICardContent>
            <div className="flex gap-2 justify-center">
              <Button
                variant={currentGame === 'vocabulary' ? 'default' : 'outline'}
                onClick={() => {
                  setCurrentGame('vocabulary');
                  setCurrentIndex(0);
                  setCurrentState(0);
                }}
              >
                Vocabulary
              </Button>
              <Button
                variant={currentGame === 'quiz' ? 'default' : 'outline'}
                onClick={() => {
                  setCurrentGame('quiz');
                  setCurrentIndex(0);
                  setCurrentState(0);
                }}
              >
                Quiz
              </Button>
              <Button
                variant={currentGame === 'image' ? 'default' : 'outline'}
                onClick={() => {
                  setCurrentGame('image');
                  setCurrentIndex(0);
                  setCurrentState(0);
                }}
              >
                Image Cards
              </Button>
            </div>
          </UICardContent>
        </Card>

        {/* Current Game Info */}
        <Card>
          <UICardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              {currentGame === 'vocabulary' && "Tap cards to flip between word and translation. Swipe right for correct, left for incorrect."}
              {currentGame === 'quiz' && "Tap cards to see the answer and explanation. Swipe right for correct answers."}
              {currentGame === 'image' && "Tap cards to see descriptions. Use for visual learning."}
            </p>
          </UICardContent>
        </Card>

        {/* Swipeable Card Component */}
        <div className="flex justify-center">
          <SwipeableCardPile
            cards={getCurrentCards() as CardContent[]}
            currentIndex={currentIndex}
            currentState={currentState}
            onFlip={handleFlip}
            onSwipe={handleSwipe}
            cardWidth={350}
            cardHeight={450}
          />
        </div>

        {/* Card Counter */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {getCurrentCards().length} • State {currentState + 1} of {getCurrentCards()[currentIndex]?.states.length || 0}
          </p>
        </div>
      </div>
    </div>
  );
};
