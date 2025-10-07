class SpeakerService {
  private voice: SpeechSynthesisVoice | undefined = undefined
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private speaking: boolean = false

  constructor() {
    this.setVoice('nl-NL')
  }

  async setVoice(locale: string) {
    this.voice = await this.getVoiceByLocale(locale)
  }

  private get synth(): SpeechSynthesis {
    return window.speechSynthesis
  }

  private async getVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      const voices = this.synth.getVoices()
      if (voices.length) {
        resolve(voices)
      } else {
        this.synth.onvoiceschanged = () => {
          resolve(this.synth.getVoices())
        }
      }
    })
  }

  private async getVoiceByLocale(
    locale: string
  ): Promise<SpeechSynthesisVoice> {
    const voices = await this.getVoices()
    const voice = voices.find((v: SpeechSynthesisVoice) => v.lang === locale)
    if (voice === undefined) {
      const errorMsg = `Could not find a voice with the given locale: ${locale}`
      throw new Error(errorMsg)
    }
    return voice
  }

  public speak(word: string) {
    // Cancel any currently speaking utterance
    if (this.currentUtterance) {
      this.synth.cancel()
    }

    const utterThis = new SpeechSynthesisUtterance(word)
    if (this.voice) {
      utterThis.voice = this.voice

      // Track speech state
      utterThis.onstart = () => {
        this.speaking = true
      }

      utterThis.onend = () => {
        this.speaking = false
        this.currentUtterance = null
      }

      utterThis.onerror = () => {
        this.speaking = false
        this.currentUtterance = null
      }

      this.currentUtterance = utterThis
      console.log({ voice: this.voice, utterThis })
      this.synth.speak(utterThis)
    } else {
      const errorMsg = `Could not speak: Speech voice is not available`
      console.error(errorMsg)
    }
  }

  public cancel() {
    if (this.currentUtterance) {
      this.synth.cancel()
      this.speaking = false
      this.currentUtterance = null
    }
  }

  public isSpeaking(): boolean {
    return this.speaking
  }
}

export const speakerService = new SpeakerService()
