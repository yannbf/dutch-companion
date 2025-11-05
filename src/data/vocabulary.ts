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
import { vocabularyChapterWeather } from './vocabulary/chapter-weather'
import { createLocalStorageStore } from '@/lib/localStorage'

export const level4Vocabulary: VocabularyChapter[] = [
  vocabularyChapter6,
  vocabularyChapter7,
  vocabularyChapter8,
  vocabularyChapter9,
  vocabularyChapter10,
  vocabularyChapter11,
]

export const level3Vocabulary: VocabularyChapter[] = [
  vocabularyChapter1,
  vocabularyChapter2,
  vocabularyChapter3,
  vocabularyChapter4,
  vocabularyChapter5,
  vocabularyChapterWeather,
]

// All vocabulary chapters (for Vocabulary page - always shows everything)
export const vocabularyData: VocabularyChapter[] = [
  ...level3Vocabulary,
  ...level4Vocabulary,
]

// Type for vocabulary level
export type VocabularyLevel = 'level3' | 'level4'

// localStorage store for vocabulary levels setting (now supports multiple)
const vocabularyLevelsStore = createLocalStorageStore<VocabularyLevel[]>(
  'vocabulary-levels',
  ['level3']
)

/**
 * Get the currently selected vocabulary levels from settings
 */
export const getVocabularyLevels = (): VocabularyLevel[] => {
  return vocabularyLevelsStore.get()
}

/**
 * Set the vocabulary levels in settings
 */
export const setVocabularyLevels = (levels: VocabularyLevel[]): void => {
  vocabularyLevelsStore.set(levels)
}

/**
 * Toggle a vocabulary level on/off
 */
export const toggleVocabularyLevel = (level: VocabularyLevel): void => {
  const current = getVocabularyLevels()
  if (current.includes(level)) {
    // Don't allow removing all levels - keep at least one
    if (current.length > 1) {
      setVocabularyLevels(current.filter((l) => l !== level))
    }
  } else {
    setVocabularyLevels([...current, level])
  }
}

/**
 * Get vocabulary chapters based on the current level settings
 * Use this for exercises that should respect the level setting
 */
export const getVocabularyData = (): VocabularyChapter[] => {
  const levels = getVocabularyLevels()
  const chapters: VocabularyChapter[] = []

  if (levels.includes('level3')) {
    chapters.push(...level3Vocabulary)
  }
  if (levels.includes('level4')) {
    chapters.push(...level4Vocabulary)
  }

  return chapters
}

export type { VocabularyWord }
