import { useNavigate } from "react-router-dom";
import { GraduationCap, BookOpen, FileText, Shuffle, Sparkles, Volume2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Exercises = () => {
  const navigate = useNavigate();

  const exercises = [
    {
      id: "verbs",
      title: "Verb tenses",
      description: "Practice irregular Dutch verbs with flashcards",
      icon: GraduationCap,
      path: "/exercises/verbs",
    },
    {
      id: "vocabulary",
      title: "Vocabulary Flashcards",
      description: "Learn vocabulary with flashcards from different chapters",
      icon: BookOpen,
      path: "/exercises/vocabulary",
    },
    {
      id: "vocabulary-match",
      title: "Vocabulary Match",
      description: "Match Dutch words with English translations",
      icon: FileText,
      path: "/exercises/vocabulary-match",
    },
    {
      id: "separable-verbs",
      title: "Separable Verbs",
      description: "Build sentences with separable verbs by arranging words",
      icon: Shuffle,
      path: "/exercises/separable-verbs",
    },
    {
      id: "sentence-generator",
      title: "Wheel of Fortune",
      description: "Spin and combine: pronouns, time and verbs",
      icon: Sparkles,
      path: "/exercises/sentence-generator",
    },
    {
      id: "pronunciation",
      title: "Pronunciation",
      description: "Search words and hear native-like pronunciation in context",
      icon: Volume2,
      path: "/exercises/pronunciation",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Exercises</h1>

        <div className="grid gap-4">
          {exercises.map((exercise) => {
            const Icon = exercise.icon;
            return (
              <Card
                key={exercise.id}
                className="cursor-pointer border-2 transition-all active:scale-95 touch-manipulation border-border bg-card hover:border-primary/50"
                onClick={() => navigate(exercise.path)}
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-3 bg-card rounded-lg border border-primary/20">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{exercise.title}</CardTitle>
                    <CardDescription>{exercise.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Exercises;
