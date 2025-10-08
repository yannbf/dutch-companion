# SwipeableCardPile Component

A reusable component for creating swipeable card interfaces with multiple states per card. Perfect for flashcards, quiz games, and other interactive card-based experiences.

## Features

- **Swipeable cards**: Drag cards left/right to trigger actions
- **Multiple states**: Each card can have multiple states (front/back, question/answer, etc.)
- **Card pile visualization**: Shows stacked cards with proper z-index and animations
- **Audio support**: Optional audio playback for card content
- **Haptic feedback**: Provides tactile feedback on interactions
- **Fully customizable**: Generic interface allows for any card content type

## Basic Usage

```tsx
import { SwipeableCardPile, CardContent, CardState } from '@/components/SwipeableCardPile';

const MyCardComponent = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentState, setCurrentState] = useState(0);

  const cards: CardContent[] = [
    {
      id: 'card-1',
      states: [
        {
          id: 'front',
          content: <div>Front content</div>,
        },
        {
          id: 'back',
          content: <div>Back content</div>,
          audioText: 'Text to speak',
        }
      ]
    }
  ];

  const handleFlip = () => {
    setCurrentState(prev => (prev + 1) % cards[currentIndex].states.length);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    // Handle swipe action (move to next card, score, etc.)
    setCurrentIndex(prev => (prev + 1) % cards.length);
    setCurrentState(0);
  };

  return (
    <SwipeableCardPile
      cards={cards}
      currentIndex={currentIndex}
      currentState={currentState}
      onFlip={handleFlip}
      onSwipe={handleSwipe}
    />
  );
};
```

## Interfaces

### CardContent
```tsx
interface CardContent {
  id: string;           // Unique identifier for the card
  states: CardState[];  // Array of card states
}
```

### CardState
```tsx
interface CardState {
  id: string;           // Unique identifier for this state
  content: ReactNode;   // JSX content to render for this state
  audioText?: string;   // Optional text to speak when audio button is clicked
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `cards` | `T[]` | Array of card content objects |
| `currentIndex` | `number` | Index of the currently active card |
| `currentState` | `number` | Index of the currently active state within the card |
| `onFlip` | `() => void` | Callback when card is tapped to flip states |
| `onSwipe` | `(direction: 'left' \| 'right') => void` | Callback when card is swiped |
| `onCardChange` | `(card: T) => void` | Optional callback when active card changes |
| `className` | `string` | Additional CSS classes for the container |
| `cardWidth` | `number` | Width of cards in pixels (default: 320) |
| `cardHeight` | `number` | Height of cards in pixels (default: 384) |
| `maxVisibleCards` | `number` | Maximum number of cards to show in pile (default: 3) |

## Card Types

### 1. Vocabulary Cards
Simple front/back cards for language learning:

```tsx
interface VocabularyCardContent extends CardContent {
  type: 'vocabulary';
  word: string;
  translation: string;
  example: string;
}

const createVocabularyCard = (word: string, translation: string, example: string): VocabularyCardContent => ({
  id: word,
  type: 'vocabulary',
  states: [
    {
      id: 'front',
      content: (
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold text-primary">{word}</h2>
        </div>
      ),
    },
    {
      id: 'back',
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
```

### 2. Quiz Cards
Question/answer cards with multiple choice:

```tsx
interface QuizCardContent extends CardContent {
  type: 'quiz';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const createQuizCard = (question: string, options: string[], correctAnswer: string, explanation: string): QuizCardContent => ({
  id: question,
  type: 'quiz',
  states: [
    {
      id: 'question',
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
      id: 'answer',
      content: (
        <div className="text-center space-y-4 w-full">
          <div className="p-4 rounded-lg bg-green-100 text-green-800">
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
```

### 3. Verb Cards (Current Implementation)
Complex cards with multiple grammatical states:

```tsx
interface VerbCardContent extends CardContent {
  type: 'verb';
  infinitive: string;
  translation: string;
  imperfectumSingular: string;
  imperfectumPlural: string;
  participium: string;
  hulpverbum: string;
  exampleImperfectum: string;
  examplePerfectum: string;
}

const createVerbCard = (verb: VerbCard, showTranslation: boolean): VerbCardContent => ({
  id: verb.infinitive,
  type: 'verb',
  states: [
    {
      id: 'infinitive',
      content: (
        <div className="text-center space-y-6">
          <h2 className="text-5xl font-black text-primary">{verb.infinitive}</h2>
          {showTranslation && (
            <p className="text-2xl text-muted-foreground italic">{verb.translation}</p>
          )}
        </div>
      ),
    },
    {
      id: 'imperfectum',
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
        </div>
      ),
      audioText: verb.exampleImperfectum,
    },
    {
      id: 'perfectum',
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
        </div>
      ),
      audioText: verb.examplePerfectum,
    }
  ]
});
```

## Integration with Existing Games

The component is designed to be a drop-in replacement for card-based game mechanics. Here's how it integrates with the current verbs game:

```tsx
// In your game component
const [currentIndex, setCurrentIndex] = useState(0);
const [cardState, setCardState] = useState(0);

// Convert your data to CardContent format
const verbCards = verbs.map(verb => createVerbCardContent(verb, showTranslation));

return (
  <SwipeableCardPile
    cards={verbCards}
    currentIndex={currentIndex}
    currentState={cardState}
    onFlip={() => setCardState(prev => (prev + 1) % 3)}
    onSwipe={(direction) => {
      // Handle scoring and move to next card
      const isCorrect = direction === 'right';
      // Update score, results, etc.
      setCurrentIndex(prev => (prev + 1) % verbCards.length);
      setCardState(0);
    }}
  />
);
```

## Customization

The component supports extensive customization:

- **Card dimensions**: Adjust `cardWidth` and `cardHeight` props
- **Visual styling**: Use `className` prop for additional styling
- **Card pile behavior**: Control `maxVisibleCards` for how many cards are shown
- **Content rendering**: Completely custom JSX in the `content` field of each state
- **Audio integration**: Add `audioText` to any state for speech functionality

## Best Practices

1. **Keep states simple**: Each state should represent one logical piece of information
2. **Use meaningful IDs**: Card and state IDs should be unique and descriptive
3. **Optimize content**: Heavy JSX in card content may impact performance
4. **Handle edge cases**: Always check array bounds when accessing cards and states
5. **Audio feedback**: Use `audioText` for important information that should be spoken

## Examples

See `src/examples/SwipeableCardExamples.tsx` for complete working examples of different card types and use cases.
