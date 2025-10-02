/**
 * Haptic feedback service for mobile devices
 * Provides vibration feedback for user interactions
 */

export class HapticService {
  private static instance: HapticService
  private isSupported: boolean

  private constructor() {
    // Check if vibration API is supported
    this.isSupported = 'vibrate' in navigator
  }

  public static getInstance(): HapticService {
    if (!HapticService.instance) {
      HapticService.instance = new HapticService()
    }
    return HapticService.instance
  }

  /**
   * Light vibration for subtle feedback (like card tap)
   */
  public light(): void {
    if (this.isSupported) {
      navigator.vibrate(10) // 10ms vibration
    }
  }

  /**
   * Medium vibration for more noticeable feedback (like swipe)
   */
  public medium(): void {
    if (this.isSupported) {
      navigator.vibrate(20) // 20ms vibration
    }
  }

  /**
   * Strong vibration for important feedback
   */
  public strong(): void {
    if (this.isSupported) {
      navigator.vibrate(50) // 50ms vibration
    }
  }

  /**
   * Custom vibration pattern
   * @param pattern Array of vibration durations in milliseconds
   */
  public custom(pattern: number[]): void {
    if (this.isSupported) {
      navigator.vibrate(pattern)
    }
  }

  /**
   * Stop any ongoing vibration
   */
  public stop(): void {
    if (this.isSupported) {
      navigator.vibrate(0)
    }
  }

  /**
   * Check if haptic feedback is supported
   */
  public isHapticSupported(): boolean {
    return this.isSupported
  }
}

// Export singleton instance
export const hapticService = HapticService.getInstance()
