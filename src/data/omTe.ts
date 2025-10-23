export interface SentenceExercise {
  id: string
  sentence: string[]
  translation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export const omTeExercises: SentenceExercise[] = [
  {
    id: 'omte-1',
    sentence: [
      'Ik',
      'ga',
      'naar',
      'de',
      'supermarkt',
      'om',
      'melk',
      'te',
      'kopen',
    ],
    translation: 'I go to the supermarket to buy milk',
    difficulty: 'easy',
  },
  {
    id: 'omte-2',
    sentence: [
      'Hij',
      'leert',
      'Nederlands',
      'om',
      'met',
      "collega's",
      'te',
      'praten',
    ],
    translation: 'He learns Dutch in order to talk with colleagues',
    difficulty: 'medium',
  },
  {
    id: 'omte-3',
    sentence: ['Wij', 'blijven', 'thuis', 'om', 'rustig', 'te', 'werken'],
    translation: 'We stay at home in order to work quietly',
    difficulty: 'easy',
  },
  {
    id: 'omte-4',
    sentence: [
      'Zij',
      'neemt',
      'een',
      'paraplu',
      'mee',
      'om',
      'niet',
      'nat',
      'te',
      'worden',
    ],
    translation: 'She brings an umbrella in order not to get wet',
    difficulty: 'medium',
  },
  {
    id: 'omte-5',
    sentence: ['Ik', 'zet', 'een', 'wekker', 'om', 'op', 'tijd', 'te', 'zijn'],
    translation: 'I set an alarm in order to be on time',
    difficulty: 'easy',
  },
]
