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
import Settings from "./pages/Settings";
import DeOfHetSetup from "./pages/DeOfHetSetup";
import DeOfHet from "./pages/DeOfHet";
import NotFound from "./pages/NotFound";
import { BottomNav } from "./components/BottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="pb-16 ios-viewport-fix">
          <Routes>
            <Route path="/" element={<Navigate to="/exercises" replace />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/exercises/verbs" element={<VerbsSetup />} />
            <Route path="/exercises/verbs/play" element={<Verbs />} />
            <Route path="/exercises/vocabulary" element={<VocabularyFlashcards />} />
            <Route path="/exercises/deofhet" element={<DeOfHetSetup />} />
            <Route path="/exercises/deofhet/play" element={<DeOfHet />} />
            <Route path="/vocabulary" element={<Vocabulary />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
