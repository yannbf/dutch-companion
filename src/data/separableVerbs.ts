export interface SeparableVerbExercise {
  id: string;
  verb: string;
  prefix: string;
  conjugatedVerb: string;
  sentence: string[];
  correctOrder: number[];
  translation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const separableVerbs: SeparableVerbExercise[] = [
  {
    id: "1",
    verb: "uitkomen",
    prefix: "uit",
    conjugatedVerb: "komt",
    sentence: ["De", "zon", "komt", "uit", "achter", "de", "wolken"],
    correctOrder: [0, 1, 2, 4, 5, 6, 3],
    translation: "The sun comes out from behind the clouds",
    difficulty: "easy"
  },
  {
    id: "2",
    verb: "meekomen",
    prefix: "mee",
    conjugatedVerb: "kom",
    sentence: ["Kom", "je", "mee", "naar", "de", "winkel"],
    correctOrder: [0, 1, 3, 4, 5, 2],
    translation: "Are you coming along to the store?",
    difficulty: "easy"
  },
  {
    id: "3",
    verb: "opstaan",
    prefix: "op",
    conjugatedVerb: "sta",
    sentence: ["Ik", "sta", "op", "om", "zeven", "uur"],
    correctOrder: [0, 1, 3, 4, 5, 2],
    translation: "I get up at seven o'clock",
    difficulty: "easy"
  },
  {
    id: "4",
    verb: "aankomen",
    prefix: "aan",
    conjugatedVerb: "komt",
    sentence: ["De", "trein", "komt", "aan", "om", "vijf", "uur"],
    correctOrder: [0, 1, 2, 4, 5, 6, 3],
    translation: "The train arrives at five o'clock",
    difficulty: "easy"
  },
  {
    id: "5",
    verb: "uitnodigen",
    prefix: "uit",
    conjugatedVerb: "nodig",
    sentence: ["Ik", "nodig", "mijn", "vrienden", "uit", "voor", "het", "feest"],
    correctOrder: [0, 1, 2, 3, 5, 6, 7, 4],
    translation: "I invite my friends to the party",
    difficulty: "medium"
  },
  {
    id: "6",
    verb: "terugkomen",
    prefix: "terug",
    conjugatedVerb: "kom",
    sentence: ["Ik", "kom", "terug", "over", "een", "uur"],
    correctOrder: [0, 1, 3, 4, 5, 2],
    translation: "I'll come back in an hour",
    difficulty: "easy"
  },
  {
    id: "7",
    verb: "meenemen",
    prefix: "mee",
    conjugatedVerb: "neem",
    sentence: ["Neem", "je", "je", "paraplu", "mee"],
    correctOrder: [0, 1, 2, 3, 4],
    translation: "Are you taking your umbrella?",
    difficulty: "easy"
  },
  {
    id: "8",
    verb: "afdrogen",
    prefix: "af",
    conjugatedVerb: "droog",
    sentence: ["Ik", "droog", "de", "borden", "af", "na", "het", "eten"],
    correctOrder: [0, 1, 2, 3, 5, 6, 7, 4],
    translation: "I dry the plates after dinner",
    difficulty: "medium"
  },
  {
    id: "9",
    verb: "opruimen",
    prefix: "op",
    conjugatedVerb: "ruim",
    sentence: ["Hij", "ruimt", "zijn", "kamer", "op", "op", "zaterdag"],
    correctOrder: [0, 1, 2, 3, 5, 6, 4],
    translation: "He cleans his room on Saturday",
    difficulty: "medium"
  },
  {
    id: "10",
    verb: "wegbrengen",
    prefix: "weg",
    conjugatedVerb: "breng",
    sentence: ["Ik", "breng", "de", "kinderen", "weg", "naar", "school"],
    correctOrder: [0, 1, 2, 3, 5, 6, 4],
    translation: "I take the children to school",
    difficulty: "medium"
  },
  {
    id: "11",
    verb: "binnenkomen",
    prefix: "binnen",
    conjugatedVerb: "komt",
    sentence: ["De", "kat", "komt", "binnen", "door", "het", "raam"],
    correctOrder: [0, 1, 2, 4, 5, 6, 3],
    translation: "The cat comes in through the window",
    difficulty: "easy"
  },
  {
    id: "12",
    verb: "uitgaan",
    prefix: "uit",
    conjugatedVerb: "ga",
    sentence: ["Ik", "ga", "uit", "met", "mijn", "vrienden", "vanavond"],
    correctOrder: [0, 1, 3, 4, 5, 6, 2],
    translation: "I'm going out with my friends tonight",
    difficulty: "easy"
  },
  {
    id: "13",
    verb: "inschrijven",
    prefix: "in",
    conjugatedVerb: "schrijf",
    sentence: ["Ik", "schrijf", "me", "in", "voor", "de", "cursus"],
    correctOrder: [0, 1, 2, 4, 5, 6, 3],
    translation: "I sign up for the course",
    difficulty: "medium"
  },
  {
    id: "14",
    verb: "doorlopen",
    prefix: "door",
    conjugatedVerb: "loop",
    sentence: ["Wij", "lopen", "door", "het", "park", "naar", "huis"],
    correctOrder: [0, 1, 3, 4, 5, 6, 2],
    translation: "We walk through the park home",
    difficulty: "medium"
  },
  {
    id: "15",
    verb: "opbellen",
    prefix: "op",
    conjugatedVerb: "bel",
    sentence: ["Ik", "bel", "mijn", "moeder", "op", "elke", "zondag"],
    correctOrder: [0, 1, 2, 3, 5, 6, 4],
    translation: "I call my mother every Sunday",
    difficulty: "medium"
  },
  {
    id: "16",
    verb: "uitzien",
    prefix: "uit",
    conjugatedVerb: "zie",
    sentence: ["Ik", "zie", "uit", "naar", "de", "vakantie"],
    correctOrder: [0, 1, 3, 4, 5, 2],
    translation: "I look forward to the vacation",
    difficulty: "easy"
  },
  {
    id: "17",
    verb: "terugkeren",
    prefix: "terug",
    conjugatedVerb: "keer",
    sentence: ["Hij", "keert", "terug", "naar", "zijn", "geboorteland"],
    correctOrder: [0, 1, 3, 4, 5, 2],
    translation: "He returns to his homeland",
    difficulty: "hard"
  },
  {
    id: "18",
    verb: "weggooien",
    prefix: "weg",
    conjugatedVerb: "gooi",
    sentence: ["Gooi", "het", "oud", "papier", "weg", "in", "de", "container"],
    correctOrder: [0, 1, 2, 3, 5, 6, 7, 4],
    translation: "Throw the old paper away in the container",
    difficulty: "medium"
  },
  {
    id: "19",
    verb: "aanraken",
    prefix: "aan",
    conjugatedVerb: "raak",
    sentence: ["Raak", "de", "hete", "pan", "niet", "aan"],
    correctOrder: [0, 1, 2, 3, 4, 5],
    translation: "Don't touch the hot pan",
    difficulty: "medium"
  },
  {
    id: "20",
    verb: "voorbereiden",
    prefix: "voor",
    conjugatedVerb: "bereid",
    sentence: ["Ik", "bereid", "me", "voor", "op", "het", "examen"],
    correctOrder: [0, 1, 2, 4, 5, 6, 3],
    translation: "I prepare for the exam",
    difficulty: "hard"
  }
];
