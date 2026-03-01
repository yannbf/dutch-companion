import { describe, expect, it } from 'vitest'
import { reviewTracker } from '@/lib/reviewTracker'
import { vocabularyData } from '@/data/vocabulary'

const knownWord = vocabularyData[0]?.words[0]?.word || 'hallo'

describe('reviewTracker', () => {
  it('adds incorrect words and reports chapter counts', () => {
    reviewTracker.clearAll()

    reviewTracker.addIncorrect(knownWord)
    reviewTracker.addIncorrect(knownWord)

    const counts = reviewTracker.getCountsByChapter()
    expect(counts.length).toBeGreaterThan(0)

    const allWords = reviewTracker.getAllWords()
    expect(allWords).toContain(knownWord)
  })

  it('removes words when marked correct', () => {
    reviewTracker.clearAll()
    reviewTracker.addIncorrect(knownWord)
    expect(reviewTracker.getAllWords()).toContain(knownWord)

    reviewTracker.markCorrect(knownWord)
    expect(reviewTracker.getAllWords()).not.toContain(knownWord)
  })

  it('can clear chapter and all data', () => {
    reviewTracker.clearAll()
    reviewTracker.addIncorrect(knownWord)

    const chapterId = reviewTracker.findChapterIdsForWord(knownWord)[0]
    expect(chapterId).toBeTruthy()

    reviewTracker.clearChapter(chapterId)
    expect(reviewTracker.getWordsForChapter(chapterId)).toEqual([])

    reviewTracker.addIncorrect(knownWord)
    expect(reviewTracker.getAllWords().length).toBeGreaterThan(0)

    reviewTracker.clearAll()
    expect(reviewTracker.getAllWords()).toEqual([])
  })
})
