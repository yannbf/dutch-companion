/**
 * Robust localStorage utility with error handling and fallbacks
 * Handles common localStorage issues like corruption, quota exceeded, and parsing errors
 *
 * Version-based flushing mechanism ensures corrupted data is cleared on app updates
 */

// Current app version for localStorage compatibility checking
const CURRENT_APP_VERSION = '1.0.1' // Increment this when breaking changes are made
const VERSION_KEY = 'taal-boost-version'

// Check if we need to flush localStorage due to version mismatch or corruption
const checkAndFlushIfNeeded = (): boolean => {
  // Disable this for now
  return
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY)

    // If no version exists or version mismatch, flush and update
    if (!storedVersion || storedVersion !== CURRENT_APP_VERSION) {
      console.log(
        `localStorage version mismatch or missing. Stored: ${storedVersion}, Current: ${CURRENT_APP_VERSION}. Flushing data...`
      )

      // Clear all app-related localStorage data
      localStorageUtils.clearAppData()

      // Set the current version
      localStorage.setItem(VERSION_KEY, CURRENT_APP_VERSION)

      return true
    }

    return false
  } catch (error) {
    console.warn('Failed to check localStorage version, flushing data:', error)
    try {
      localStorageUtils.clearAppData()
      localStorage.setItem(VERSION_KEY, CURRENT_APP_VERSION)
    } catch (flushError) {
      console.error('Failed to flush localStorage:', flushError)
    }
    return true
  }
}

// Initialize localStorage - this runs once when the module is first imported
checkAndFlushIfNeeded()

// Generic localStorage operations with error handling
export const localStorageUtils = {
  /**
   * Safely get an item from localStorage and parse it as JSON
   * @param key - localStorage key
   * @param defaultValue - Default value if key doesn't exist or parsing fails
   * @returns Parsed value or default value
   */
  getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return defaultValue
      }

      // Try to parse as JSON first
      try {
        return JSON.parse(item) as T
      } catch {
        // If JSON parsing fails, check if it's a simple string that should be returned as-is
        // For boolean strings like "true"/"false"
        if (item === 'true' || item === 'false') {
          return (item === 'true') as T
        }

        // For other simple values, try to return them as-is if they match the default value type
        if (typeof defaultValue === 'string' && typeof item === 'string') {
          return item as T
        }

        // If all parsing fails, return default value
        console.warn(`Failed to parse localStorage item '${key}':`, item)
        return defaultValue
      }
    } catch (error) {
      console.warn(`Failed to read localStorage item '${key}':`, error)
      return defaultValue
    }
  },

  /**
   * Safely set an item in localStorage as JSON
   * @param key - localStorage key
   * @param value - Value to store (will be JSON.stringify'd)
   */
  setItem<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.warn(`Failed to save to localStorage '${key}':`, error)

      // Try to clear some space if quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        try {
          this.clearOldData()
          localStorage.setItem(key, JSON.stringify(value))
          return true
        } catch (retryError) {
          console.error(
            `Failed to save even after clearing space for '${key}':`,
            retryError
          )
        }
      }

      return false
    }
  },

  /**
   * Remove an item from localStorage
   * @param key - localStorage key to remove
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn(`Failed to remove localStorage item '${key}':`, error)
    }
  },

  /**
   * Clear all app-related localStorage data
   * Useful for resetting corrupted data
   */
  clearAppData(): void {
    const appKeys = [
      'taal-boost-global-settings',
      'vocabulary-favorites',
      'vocab-selected-chapters',
      'vocab-include-favorites',
      'verbs-game-setup',
      'deofhet-chapters',
      'vocab-review-words',
      'exercise-stats-v1',
      'exercise-stats-v2',
      'global-randomOrder',
      VERSION_KEY, // Also clear the version key so next load will re-initialize
    ]

    appKeys.forEach((key) => {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.warn(
          `Failed to remove localStorage item '${key}' during cleanup:`,
          error
        )
      }
    })
  },

  /**
   * Clear old/unused localStorage keys to free up space
   */
  clearOldData(): void {
    // This could be expanded to remove old/expired data
    // For now, we'll just remove any keys that might be taking up space
    try {
      const keysToRemove: string[] = []

      // Look for any old or temporary keys that might exist
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if ((key && key.startsWith('temp-')) || key.startsWith('old-')) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key))
    } catch (error) {
      console.warn('Failed to clear old localStorage data:', error)
    }
  },

  /**
   * Check if localStorage is available and working
   */
  isAvailable(): boolean {
    try {
      const testKey = '__localStorage-test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  },

  /**
   * Diagnose localStorage issues and return helpful information
   */
  diagnose(): {
    isAvailable: boolean
    corruptedKeys: string[]
    totalKeys: number
    totalSize: number
  } {
    const corruptedKeys: string[] = []
    let totalSize = 0

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          try {
            const value = localStorage.getItem(key)
            if (value) {
              totalSize += key.length + value.length

              // Try to parse as JSON to check for corruption
              try {
                JSON.parse(value)
              } catch {
                corruptedKeys.push(key)
              }
            }
          } catch (error) {
            corruptedKeys.push(key)
          }
        }
      }
    } catch (error) {
      console.warn('Failed to diagnose localStorage:', error)
    }

    return {
      isAvailable: this.isAvailable(),
      corruptedKeys,
      totalKeys: localStorage.length,
      totalSize,
    }
  },

  /**
   * Force flush all app data (useful for manual reset)
   */
  forceFlush(): void {
    console.log('Forcing localStorage flush...')
    this.clearAppData()
    localStorage.setItem(VERSION_KEY, CURRENT_APP_VERSION)
  },

  /**
   * Get current app version
   */
  getCurrentVersion(): string {
    return CURRENT_APP_VERSION
  },

  /**
   * Get stored app version
   */
  getStoredVersion(): string | null {
    try {
      return localStorage.getItem(VERSION_KEY)
    } catch {
      return null
    }
  },
}

/**
 * Type-safe localStorage hooks for common use cases
 */
export const createLocalStorageStore = <T>(key: string, defaultValue: T) => {
  return {
    get: (): T => localStorageUtils.getItem(key, defaultValue),
    set: (value: T): boolean => localStorageUtils.setItem(key, value),
    remove: (): void => localStorageUtils.removeItem(key),
    getKey: () => key,
  }
}
