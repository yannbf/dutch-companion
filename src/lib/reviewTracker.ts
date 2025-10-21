import { createLocalStorageStore } from './localStorage'
import { vocabularyData } from '@/data/vocabulary'
import type { VocabularyWord, VocabularyChapter } from '@/data/types'

// Storage shape for review words per chapter
interface ReviewWordEntry {
  // Number of times marked incorrect
  incorrectCount: number
  // Last time it was marked incorrect
  lastIncorrectAt: number
}

export interface ReviewData {
  [chapterId: string]: {
    [word: string]: ReviewWordEntry
  }
}

const REVIEW_KEY = 'vocab-review-words'

const reviewStore = createLocalStorageStore<ReviewData>(REVIEW_KEY, {})

// Build an index to map word -> chapterIds for quick lookup
const wordToChapterIds: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {}
  for (const chapter of vocabularyData) {
    for (const w of chapter.words) {
      const key = w.word
      if (!map[key]) map[key] = []
      map[key].push(chapter.id)
    }
  }
  return map
})()

export const reviewTracker = {
  getAll(): ReviewData {
    return reviewStore.get()
  },

  getCountsByChapter(): { chapterId: string; count: number }[] {
    const data = reviewStore.get()
    return Object.entries(data)
      .map(([chapterId, words]) => ({
        chapterId,
        count: Object.keys(words).length,
      }))
      .filter((x) => x.count > 0)
      .sort((a, b) => a.chapterId.localeCompare(b.chapterId))
  },

  getWordsForChapter(chapterId: string): string[] {
    const data = reviewStore.get()
    return Object.keys(data[chapterId] || {})
  },

  getAllWords(): string[] {
    const data = reviewStore.get()
    const set = new Set<string>()
    Object.values(data).forEach((byWord) => {
      Object.keys(byWord).forEach((w) => set.add(w))
    })
    return Array.from(set)
  },

  addIncorrect(word: string, chapterId?: string) {
    const data = { ...reviewStore.get() }
    const targetChapterId = chapterId || this.findChapterIdsForWord(word)[0]
    if (!targetChapterId) return

    if (!data[targetChapterId]) data[targetChapterId] = {}
    const existing = data[targetChapterId][word]
    const now = Date.now()
    data[targetChapterId][word] = {
      incorrectCount: (existing?.incorrectCount || 0) + 1,
      lastIncorrectAt: now,
    }
    reviewStore.set(data)
  },

  markCorrect(word: string) {
    const data = { ...reviewStore.get() }
    let changed = false
    for (const chapterId of Object.keys(data)) {
      if (data[chapterId] && data[chapterId][word]) {
        delete data[chapterId][word]
        // Clean empty chapter buckets
        if (Object.keys(data[chapterId]).length === 0) {
          delete data[chapterId]
        }
        changed = true
      }
    }
    if (changed) reviewStore.set(data)
  },

  clearChapter(chapterId: string) {
    const data = { ...reviewStore.get() }
    if (data[chapterId]) {
      delete data[chapterId]
      reviewStore.set(data)
    }
  },

  clearAll() {
    reviewStore.set({})
  },

  // Utility to find all chapter IDs that contain a given word
  findChapterIdsForWord(word: string): string[] {
    return wordToChapterIds[word] || []
  },

  // Utility to resolve words to VocabularyWord entries (first match per word)
  resolveWordsToEntries(words: string[]): VocabularyWord[] {
    const results: VocabularyWord[] = []
    const seen = new Set<string>()
    for (const w of words) {
      if (seen.has(w)) continue
      for (const chapter of vocabularyData) {
        const match = chapter.words.find((x) => x.word === w)
        if (match) {
          results.push(match)
          seen.add(w)
          break
        }
      }
    }
    return results
  },
}

export type { ReviewWordEntry }
