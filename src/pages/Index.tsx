import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { verbData, VerbCard } from "@/data/verbs";
import { CardPile } from "@/components/CardPile";
import { SummaryScreen } from "@/components/SummaryScreen";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { speakerService } from "@/services/speaker";

interface VerbResult {
  verb: VerbCard;
  correct: boolean;
}

// Load global settings from localStorage
const loadGlobalSettings = () => {
  const defaultSettings = {
    showTranslation: true,
    randomMode: false,
    voiceMode: true,
  };

  try {
    const saved = localStorage.getItem('taal-boost-global-settings');
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
  }
  
  return defaultSettings;
};

// Load game setup from localStorage
const loadGameSetup = () => {
  const defaultSetup = {
    category: "all" as "all" | "hebben" | "zijn" | "hebben/zijn",
    mode: "short" as "short" | "long",
  };

  try {
    const saved = localStorage.getItem('verbs-game-setup');
    if (saved) {
      return { ...defaultSetup, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.warn('Failed to load game setup from localStorage:', error);
  }
  
  return defaultSetup;
};

const Index = () => {
  const navigate = useNavigate();
  const globalSettings = loadGlobalSettings();
  const gameSetup = loadGameSetup();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardState, setCardState] = useState<0 | 1 | 2>(0);
  const [points, setPoints] = useState(0);
  const [showTranslation] = useState(globalSettings.showTranslation);
  const [category] = useState(gameSetup.category);
  const [mode] = useState(gameSetup.mode);
  const [randomMode] = useState(globalSettings.randomMode);
  const [voiceMode] = useState(globalSettings.voiceMode);
  const [showSummary, setShowSummary] = useState(false);
  const [results, setResults] = useState<VerbResult[]>([]);
  const [sessionVerbs, setSessionVerbs] = useState<VerbCard[]>([]);
  const [lastResult, setLastResult] = useState<"correct" | "incorrect" | null>(null);
  const lastSpeechTime = useRef<number>(0);
  const speechTimeout = useRef<NodeJS.Timeout | null>(null);

  const filteredVerbs = useMemo(() => {
    if (category === "all") return verbData;
    return verbData.filter((verb) => verb.category === category);
  }, [category]);

  const currentSessionVerbs = useMemo(() => {
    if (sessionVerbs.length > 0) return sessionVerbs;
    
    let verbs = filteredVerbs;
    
    // Apply random mode if enabled
    if (randomMode) {
      verbs = [...verbs].sort(() => Math.random() - 0.5);
    }
    
    if (mode === "short") {
      // Get 10 random verbs
      const shuffled = [...verbs].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(10, shuffled.length));
    }
    return verbs;
  }, [filteredVerbs, mode, sessionVerbs, randomMode]);

  const currentVerb = currentSessionVerbs[currentIndex];

  // Debounced speak function to prevent rapid speech requests
  const debouncedSpeak = (word: string) => {
    const now = Date.now();
    const timeSinceLastSpeech = now - lastSpeechTime.current;

    // Minimum 300ms between speech requests to prevent overlapping
    if (timeSinceLastSpeech < 300) {
      // Cancel any pending speech timeout
      if (speechTimeout.current) {
        clearTimeout(speechTimeout.current);
      }

      // Schedule speech after the minimum delay
      speechTimeout.current = setTimeout(() => {
        speakerService.speak(word);
        lastSpeechTime.current = Date.now();
      }, 300 - timeSinceLastSpeech);
    } else {
      // Enough time has passed, speak immediately
      speakerService.speak(word);
      lastSpeechTime.current = now;
    }
  };

  // Voice mode effect - speak when card changes
  useEffect(() => {
    if (voiceMode && currentVerb) {
      if (cardState === 0) {
        // Speak infinitive
        debouncedSpeak(currentVerb.infinitive);
      } else if (cardState === 1) {
        // Speak imperfectum singularis
        debouncedSpeak(currentVerb.imperfectumSingular);
      } else if (cardState === 2) {
        // Speak perfectum participium
        debouncedSpeak(currentVerb.participium);
      }
    }
  }, [cardState, currentVerb, voiceMode]);

  // Cleanup timeout on unmount or when voice mode is disabled
  useEffect(() => {
    return () => {
      if (speechTimeout.current) {
        clearTimeout(speechTimeout.current);
      }
    };
  }, [voiceMode]);

  const handleFlip = () => {
    setCardState((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
  };

  const handleSwipe = (direction: "left" | "right") => {
    const isCorrect = direction === "right";
    
    if (isCorrect) {
      setPoints((prev) => prev + 1);
    } else {
      setPoints((prev) => prev - 1);
    }

    // Set last result for score flash
    setLastResult(isCorrect ? "correct" : "incorrect");

    // Track result
    setResults((prev) => [...prev, { verb: currentVerb, correct: isCorrect }]);

    // Reset card state and move to next card
    setCardState(0);
    
    if (currentIndex + 1 >= currentSessionVerbs.length) {
      setShowSummary(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleRestart = () => {
    navigate('/exercises/verbs');
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setCardState(0);
    setPoints(0);
    setResults([]);
    setLastResult(null);
    // Cancel any pending speech
    if (speechTimeout.current) {
      clearTimeout(speechTimeout.current);
      speechTimeout.current = null;
    }
    lastSpeechTime.current = 0;
    // If random mode is enabled, reshuffle the session verbs
    if (randomMode) {
      setSessionVerbs([]);
    }
  };

  if (showSummary) {
    const correctAnswers = results.filter(result => result.correct).length;
    return (
      <SummaryScreen
        finalScore={correctAnswers}
        totalCards={currentSessionVerbs.length}
        onRestart={handleRestart}
        results={results}
      />
    );
  }

  return (
    <div className="h-screen relative overflow-hidden flex flex-col pb-20" style={{ touchAction: 'pan-x' }}>
      <ProgressIndicator totalCards={currentSessionVerbs.length} results={results} />
      
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/exercises/verbs')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-sm font-medium text-muted-foreground">
            {currentIndex + 1} / {currentSessionVerbs.length}
          </div>
          
          <div className={`text-sm font-medium min-w-[60px] text-right transition-colors duration-200 ${
            lastResult === "correct" 
              ? "text-green-500" 
              : lastResult === "incorrect" 
              ? "text-red-500" 
              : ""
          }`}>
            Score: {points}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center pointer-events-none pt-14" style={{ touchAction: 'pan-x' }}>
        <div className="pointer-events-auto">
          {currentVerb && (
            <CardPile
              key={`pile-${currentIndex}`}
              verbs={currentSessionVerbs}
              currentIndex={currentIndex}
              cardState={cardState}
              onFlip={handleFlip}
              onSwipe={handleSwipe}
              showTranslation={showTranslation}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
