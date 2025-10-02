class SpeakerService {
  private voice: SpeechSynthesisVoice | undefined = undefined

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
    const utterThis = new SpeechSynthesisUtterance(word)
    if (this.voice) {
      utterThis.voice = this.voice
      console.log({ voice: this.voice, utterThis })
      this.synth.speak(utterThis)
    } else {
      const errorMsg = `Could not speak: Speech voice is not available`
      console.error(errorMsg)
    }
  }
}

export const speakerService = new SpeakerService()
