import { describe, expect, it } from 'vitest'
import { createLocalStorageStore, localStorageUtils } from '@/lib/localStorage'

describe('localStorage utils', () => {
  it('reads/writes typed values through createLocalStorageStore', () => {
    const store = createLocalStorageStore('test-settings', {
      showTranslation: true,
      randomMode: false,
    })

    expect(store.get()).toEqual({ showTranslation: true, randomMode: false })

    store.set({ showTranslation: false, randomMode: true })
    expect(store.get()).toEqual({ showTranslation: false, randomMode: true })
  })

  it('falls back to default on corrupted JSON', () => {
    localStorage.setItem('corrupted', '{not-valid-json')

    const value = localStorageUtils.getItem('corrupted', { ok: true })
    expect(value).toEqual({ ok: true })
  })

  it('supports plain boolean string compatibility', () => {
    localStorage.setItem('legacy-bool', 'true')
    const value = localStorageUtils.getItem('legacy-bool', false)
    expect(value).toBe(true)
  })

  it('checks localStorage availability', () => {
    expect(localStorageUtils.isAvailable()).toBe(true)
  })
})
