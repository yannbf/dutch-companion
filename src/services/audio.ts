/**
 * Audio feedback service for exercises
 * Provides sound effects for different user interactions
 */

export type AudioType =
  | 'success'
  | 'correct'
  | 'incorrect'
  | 'error'
  | 'complete'
  | 'record-start'

class AudioService {
  private audioContext: AudioContext | null = null

  /**
   * Get or create AudioContext
   * Lazy initialization to comply with browser autoplay policies
   */
  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      this.audioContext = new AudioContextClass()
    }
    return this.audioContext
  }

  /**
   * Play a sound effect
   * @param type - The type of audio to play
   * @param volume - Volume level (0.0 to 1.0), defaults to 0.3
   */
  play(type: AudioType, volume: number = 0.3): void {
    try {
      const audioContext = this.getAudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Clamp volume between 0 and 1
      const clampedVolume = Math.max(0, Math.min(1, volume))

      switch (type) {
        case 'success':
        case 'correct':
          // Happy ascending tones (C5 → E5 → G5)
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
          oscillator.frequency.setValueAtTime(
            659.25,
            audioContext.currentTime + 0.1
          ) // E5
          oscillator.frequency.setValueAtTime(
            783.99,
            audioContext.currentTime + 0.2
          ) // G5
          gainNode.gain.setValueAtTime(clampedVolume, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.3
          )
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.3)
          break

        case 'incorrect':
        case 'error':
          // Subtle error sound (low frequency)
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
          gainNode.gain.setValueAtTime(
            clampedVolume * 0.7,
            audioContext.currentTime
          ) // Slightly quieter
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.2
          )
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.2)
          break

        case 'complete':
          // Celebratory sequence (C5 → E5 → G5 → C6)
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
          oscillator.frequency.setValueAtTime(
            659.25,
            audioContext.currentTime + 0.1
          ) // E5
          oscillator.frequency.setValueAtTime(
            783.99,
            audioContext.currentTime + 0.2
          ) // G5
          oscillator.frequency.setValueAtTime(
            1046.5,
            audioContext.currentTime + 0.3
          ) // C6
          gainNode.gain.setValueAtTime(clampedVolume, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.5
          )
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.5)
          break

        case 'record-start':
          // Subtle, simple recording start beep (short ~440Hz A4)
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime)
          gainNode.gain.setValueAtTime(
            clampedVolume * 0.7,
            audioContext.currentTime
          ) // Softer
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.08
          )
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.08)
          break

        default:
          console.warn(`Unknown audio type: ${type}`)
          return
      }
    } catch (error) {
      console.warn('Failed to play audio:', error)
    }
  }

  /**
   * Close the audio context
   * Call this when the app is shutting down
   */
  close(): void {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}

// Export singleton instance
export const audioService = new AudioService()
