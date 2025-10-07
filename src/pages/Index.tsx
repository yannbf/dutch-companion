import { useState, useMemo, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { verbData, VerbCard } from "@/data/verbs";
import { CardPile } from "@/components/CardPile";
import { PointTracker } from "@/components/PointTracker";
import { GameControls } from "@/components/GameControls";
import { SummaryScreen } from "@/components/SummaryScreen";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { speakerService } from "@/services/speaker";

interface VerbResult {
  verb: VerbCard;
  correct: boolean;
}

// Load settings from localStorage
const loadSettings = () => {
  const defaultSettings = {
    showTranslation: true,
    category: "all" as "all" | "hebben" | "zijn" | "hebben/zijn",
    mode: "short" as "short" | "long",
    randomMode: false,
    voiceMode: true,
  };

  try {
    const saved = localStorage.getItem('taal-boost-settings');
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
  }
  
  return defaultSettings;
};

// Save settings to localStorage
const saveSettings = (settings: {
  showTranslation: boolean;
  category: "all" | "hebben" | "zijn" | "hebben/zijn";
  mode: "short" | "long";
  randomMode: boolean;
  voiceMode: boolean;
}) => {
  try {
    localStorage.setItem('taal-boost-settings', JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error);
  }
};

const Index = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardState, setCardState] = useState<0 | 1 | 2>(0);
  const [points, setPoints] = useState(0);
  const [showTranslation, setShowTranslation] = useState(loadSettings().showTranslation);
  const [category, setCategory] = useState<"all" | "hebben" | "zijn" | "hebben/zijn">(loadSettings().category);
  const [mode, setMode] = useState<"short" | "long">(loadSettings().mode);
  const [randomMode, setRandomMode] = useState(loadSettings().randomMode);
  const [voiceMode, setVoiceMode] = useState(loadSettings().voiceMode);
  const [showSummary, setShowSummary] = useState(false);
  const [results, setResults] = useState<VerbResult[]>([]);
  const [sessionVerbs, setSessionVerbs] = useState<VerbCard[]>([]);
  const [spokenWords, setSpokenWords] = useState<Set<string>>(new Set());
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
    setCurrentIndex(0);
    setCardState(0);
    setPoints(0);
    setShowSummary(false);
    setResults([]);
    setSessionVerbs([]);
    setSpokenWords(new Set());
    setLastResult(null);
    // Cancel any pending speech
    if (speechTimeout.current) {
      clearTimeout(speechTimeout.current);
      speechTimeout.current = null;
    }
    lastSpeechTime.current = 0;
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setCardState(0);
    setPoints(0);
    setResults([]);
    setSpokenWords(new Set());
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

  const handleCategoryChange = (newCategory: "all" | "hebben" | "zijn" | "hebben/zijn") => {
    setCategory(newCategory);
    setCurrentIndex(0);
    setCardState(0);
    setPoints(0);
    setResults([]);
    setSessionVerbs([]);
    setSpokenWords(new Set());
    // Save settings
    saveSettings({
      showTranslation,
      category: newCategory,
      mode,
      randomMode,
      voiceMode,
    });
  };

  const handleModeChange = (newMode: "short" | "long") => {
    setMode(newMode);
    setCurrentIndex(0);
    setCardState(0);
    setPoints(0);
    setResults([]);
    setSessionVerbs([]);
    setSpokenWords(new Set());
    // Save settings
    saveSettings({
      showTranslation,
      category,
      mode: newMode,
      randomMode,
      voiceMode,
    });
  };

  const handleRandomModeToggle = (random: boolean) => {
    setRandomMode(random);
    setCurrentIndex(0);
    setCardState(0);
    setPoints(0);
    setResults([]);
    setSessionVerbs([]);
    setSpokenWords(new Set());
    // Save settings
    saveSettings({
      showTranslation,
      category,
      mode,
      randomMode: random,
      voiceMode,
    });
  };

  const handleVoiceModeToggle = (voice: boolean) => {
    setVoiceMode(voice);
    // Save settings
    saveSettings({
      showTranslation,
      category,
      mode,
      randomMode,
      voiceMode: voice,
    });
  };

  const handleTranslationToggle = (show: boolean) => {
    setShowTranslation(show);
    // Save settings
    saveSettings({
      showTranslation: show,
      category,
      mode,
      randomMode,
      voiceMode,
    });
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
    <div className="h-screen relative overflow-hidden flex flex-col" style={{ touchAction: 'pan-x' }}>
      <ProgressIndicator totalCards={currentSessionVerbs.length} results={results} />
      <GameControls
        currentCategory={category}
        onCategoryChange={handleCategoryChange}
        currentMode={mode}
        onModeChange={handleModeChange}
        showTranslation={showTranslation}
        onTranslationToggle={handleTranslationToggle}
        randomMode={randomMode}
        onRandomModeToggle={handleRandomModeToggle}
        voiceMode={voiceMode}
        onVoiceModeToggle={handleVoiceModeToggle}
      />
      <PointTracker points={points} lastResult={lastResult} />
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleRetry}
        className="fixed bottom-6 left-6 bg-card border-2 border-primary font-bold"
      >
        <RotateCcw className="w-5 h-5" />
      </Button>

      <div className="flex-1 flex items-center justify-center pointer-events-none" style={{ touchAction: 'pan-x' }}>
        <div className="pointer-events-auto">
          <AnimatePresence mode="popLayout">
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
          </AnimatePresence>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 text-sm text-muted-foreground pointer-events-none">
        {currentIndex + 1} / {currentSessionVerbs.length}
      </div>
    </div>
  );
};

export default Index;
