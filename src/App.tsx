import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Exercises from "./pages/Exercises";
import VerbsSetup from "./pages/VerbsSetup";
import Verbs from "./pages/Verbs";
import VocabularyFlashcards from "./pages/VocabularyFlashcards";
import Vocabulary from "./pages/Vocabulary";
import VocabularyStats from "./pages/VocabularyStats";
import VocabularyMatchSetup from "./pages/VocabularyMatchSetup";
import VocabularyMatch from "./pages/VocabularyMatch";
import Settings from "./pages/Settings";
import DeOfHetSetup from "./pages/DeOfHetSetup";
import DeOfHet from "./pages/DeOfHet";
import SeparableVerbsSetup from "./pages/SeparableVerbsSetup";
import SeparableVerbs from "./pages/SeparableVerbs";
import SentenceGenerator from "./pages/SentenceGenerator";
import PronunciationPractice from "./pages/PronunciationPractice";
import NotFound from "./pages/NotFound";
import { BottomNav } from "./components/BottomNav";
import Resources from "./pages/Resources";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="ios-viewport-fix">
          <Routes>
            <Route path="/" element={<Navigate to="/exercises" replace />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/exercises/verbs" element={<VerbsSetup />} />
            <Route path="/exercises/verbs/play" element={<Verbs />} />
            <Route path="/exercises/vocabulary" element={<VocabularyFlashcards />} />
            <Route path="/exercises/vocabulary/stats" element={<VocabularyStats />} />
            <Route path="/exercises/vocabulary-match" element={<VocabularyMatchSetup />} />
            <Route path="/exercises/vocabulary-match/play" element={<VocabularyMatch />} />
            <Route path="/exercises/deofhet" element={<DeOfHetSetup />} />
            <Route path="/exercises/deofhet/play" element={<DeOfHet />} />
            <Route path="/exercises/separable-verbs" element={<SeparableVerbsSetup />} />
            <Route path="/exercises/separable-verbs/play" element={<SeparableVerbs />} />
            <Route path="/exercises/sentence-generator" element={<SentenceGenerator />} />
            <Route path="/exercises/pronunciation" element={<PronunciationPractice />} />
            <Route path="/vocabulary" element={<Vocabulary />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
