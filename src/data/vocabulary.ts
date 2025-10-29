import { VocabularyChapter, VocabularyWord } from './types'
import { vocabularyChapter1 } from './vocabulary/chapter-1'
import { vocabularyChapter2 } from './vocabulary/chapter-2'
import { vocabularyChapter3 } from './vocabulary/chapter-3'
import { vocabularyChapter4 } from './vocabulary/chapter-4'
import { vocabularyChapter5 } from './vocabulary/chapter-5'
import { vocabularyChapter6 } from './vocabulary/chapter-6'
import { vocabularyChapter7 } from './vocabulary/chapter-7'
import { vocabularyChapter8 } from './vocabulary/chapter-8'
import { vocabularyChapter9 } from './vocabulary/chapter-9'
import { vocabularyChapter10 } from './vocabulary/chapter-10'
import { vocabularyChapter11 } from './vocabulary/chapter-11'

// do not delete
const forLaterButNotNow = [
  vocabularyChapter7,
  vocabularyChapter8,
  vocabularyChapter9,
  vocabularyChapter10,
  vocabularyChapter11,
]

export const vocabularyData: VocabularyChapter[] = [
  vocabularyChapter1,
  vocabularyChapter2,
  vocabularyChapter3,
  vocabularyChapter4,
  vocabularyChapter5,
  vocabularyChapter6,
  // ...forLaterButNotNow,
]

export type { VocabularyWord }
