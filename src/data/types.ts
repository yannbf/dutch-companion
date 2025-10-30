export interface VocabularyWord {
  word: string
  article?: string
  translation: string
  exampleSentence: string
  category:
    | 'idioom'
    | 'vocabulaire'
    | 'preposities'
    | 'werkwoorden'
    | 'scheidbare-werkwoorden'
  // Optional verb metadata (only for 'werkwoorden' and 'scheidbare-werkwoorden')
  imperfectumSingular?: string
  imperfectumPlural?: string
  hulpverbum?: 'hebben' | 'zijn' | 'hebben/zijn'
  participium?: string
  exampleImperfectum?: string
  examplePerfectum?: string
}

export interface VocabularyChapter {
  chapter: number | string
  id: string
  title: string
  words: VocabularyWord[]
}
