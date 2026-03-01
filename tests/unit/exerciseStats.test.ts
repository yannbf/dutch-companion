import { describe, expect, it } from 'vitest'
import { exerciseStats } from '@/lib/exerciseStats'

describe('exerciseStats', () => {
  it('records attempts and chapter breakdown', () => {
    exerciseStats.resetAll()

    exerciseStats.recordAttempt('verbs', 'chapter-1', 'lopen', true)
    exerciseStats.recordAttempt('verbs', 'chapter-1', 'lopen', false)
    exerciseStats.recordAttempt('verbs', 'chapter-1', 'zijn', true)

    const verbs = exerciseStats.get('verbs')

    expect(verbs.totalAttempts).toBe(3)
    expect(verbs.correctAttempts).toBe(2)
    expect(verbs.chapterStats['chapter-1']).toEqual({
      totalAttempts: 3,
      correctAttempts: 2,
    })

    expect(verbs.seenWordsByChapter?.['chapter-1']).toEqual(['lopen', 'zijn'])
  })

  it('keeps buckets isolated', () => {
    exerciseStats.resetAll()

    exerciseStats.recordAttempt('vocabulary', 'ch-1', 'huis', true)
    exerciseStats.recordAttempt('deofhet', 'ch-1', 'tafel', false)

    expect(exerciseStats.get('vocabulary').totalAttempts).toBe(1)
    expect(exerciseStats.get('deofhet').totalAttempts).toBe(1)
    expect(exerciseStats.get('verbs').totalAttempts).toBe(0)
  })
})
