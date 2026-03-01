const createSeededRandom = (seed: number) => {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0x100000000
  }
}

const E2E_MODE_KEY = '__e2e_deterministic_mode'

export const isE2EDeterministicMode = () => {
  if (!import.meta.env.DEV) return false
  const params = new URLSearchParams(window.location.search)
  return params.get('e2e') === '1' || localStorage.getItem(E2E_MODE_KEY) === '1'
}

export const enableDeterministicModeIfRequested = () => {
  if (!isE2EDeterministicMode()) return

  const params = new URLSearchParams(window.location.search)
  if (params.get('e2e') === '1') {
    localStorage.setItem(E2E_MODE_KEY, '1')
  }

  const seed = Number(params.get('seed') || 42)
  const seededRandom = createSeededRandom(seed)

  // Expose for debugging/tests
  ;(window as Window & { __e2eDeterministic?: boolean }).__e2eDeterministic = true

  Math.random = seededRandom
}
