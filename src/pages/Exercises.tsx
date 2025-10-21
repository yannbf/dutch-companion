import { useNavigate } from "react-router-dom";
import { GraduationCap, BookOpen, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Exercises = () => {
  const navigate = useNavigate();

  const exercises = [
    {
      id: "verbs",
      title: "Onregelmatige werkwoorden",
      description: "Practice irregular Dutch verbs with flashcards",
      icon: GraduationCap,
      path: "/exercises/verbs",
    },
    {
      id: "vocabulary",
      title: "Vocabulary",
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
  ];

  return (
    <div className="min-h-screen bg-background pb-20 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Exercises</h1>
          <p className="text-muted-foreground">Choose an exercise to start practicing</p>
        </div>

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
