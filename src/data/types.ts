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
}

export interface VocabularyChapter {
  chapter: number
  id: string
  title: string
  words: VocabularyWord[]
}
