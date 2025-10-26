import { createLocalStorageStore } from './localStorage'

export interface ChapterStatsEntry {
  totalAttempts: number
  correctAttempts: number
}

export interface ExerciseStatsBucket {
  totalAttempts: number
  correctAttempts: number
  chapterStats: Record<string, ChapterStatsEntry>
  seenWordsByChapter?: Record<string, string[]>
}

const DEFAULT_BUCKET: ExerciseStatsBucket = {
  totalAttempts: 0,
  correctAttempts: 0,
  chapterStats: {},
  seenWordsByChapter: {},
}

export type ExerciseType = 'vocabulary' | 'deofhet' | 'verbs' | 'weather'

export interface ExerciseStatsData {
  vocabulary: ExerciseStatsBucket
  deofhet: ExerciseStatsBucket
  verbs: ExerciseStatsBucket
  weather: ExerciseStatsBucket
}

const STATS_KEY = 'exercise-stats-v2'
const statsStore = createLocalStorageStore<ExerciseStatsData>(STATS_KEY, {
  vocabulary: { ...DEFAULT_BUCKET },
  deofhet: { ...DEFAULT_BUCKET },
  verbs: { ...DEFAULT_BUCKET },
  weather: { ...DEFAULT_BUCKET },
})

export const exerciseStats = {
  getAll(): ExerciseStatsData {
    return statsStore.get()
  },

  get(bucket: ExerciseType): ExerciseStatsBucket {
    const all = statsStore.get()
    return all[bucket]
  },

  recordAttempt(
    bucket: ExerciseType,
    chapterId: string | undefined,
    word: string | undefined,
    correct: boolean
  ) {
    const all = { ...statsStore.get() }
    const currentBucket = { ...all[bucket] }
    currentBucket.totalAttempts += 1
    if (correct) currentBucket.correctAttempts += 1

    if (chapterId) {
      const existing = currentBucket.chapterStats[chapterId] || {
        totalAttempts: 0,
        correctAttempts: 0,
      }
      const updated: ChapterStatsEntry = {
        totalAttempts: existing.totalAttempts + 1,
        correctAttempts: existing.correctAttempts + (correct ? 1 : 0),
      }
      currentBucket.chapterStats[chapterId] = updated

      if (word) {
        const arr = currentBucket.seenWordsByChapter?.[chapterId] || []
        if (!arr.includes(word)) {
          currentBucket.seenWordsByChapter = {
            ...(currentBucket.seenWordsByChapter || {}),
            [chapterId]: [...arr, word],
          }
        }
      }
    }

    all[bucket] = currentBucket
    statsStore.set(all)
  },

  resetAll() {
    statsStore.set({
      vocabulary: { ...DEFAULT_BUCKET },
      deofhet: { ...DEFAULT_BUCKET },
      verbs: { ...DEFAULT_BUCKET },
      weather: { ...DEFAULT_BUCKET },
    })
  },
}

// no explicit re-exports at bottom to avoid duplicate export conflicts
