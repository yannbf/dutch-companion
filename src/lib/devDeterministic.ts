const createSeededRandom = (seed: number) => {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0x100000000
  }
}

export const enableDeterministicModeIfRequested = () => {
  if (!import.meta.env.DEV) return

  const params = new URLSearchParams(window.location.search)
  const deterministic = params.get('e2e') === '1'
  if (!deterministic) return

  const seed = Number(params.get('seed') || 42)
  const seededRandom = createSeededRandom(seed)

  // Expose for debugging/tests
  ;(window as Window & { __e2eDeterministic?: boolean }).__e2eDeterministic = true

  Math.random = seededRandom
}
