import { useState, useEffect, useRef, useCallback } from 'react'

// Speech Recognition types
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

export interface UseSpeechRecognitionOptions {
  lang?: string
  continuous?: boolean // Default: false (stops when user stops talking)
  interimResults?: boolean
  onResult?: (finalTranscript: string, interimTranscript: string) => void
  onError?: (error: string) => void
  onStart?: () => void
  onEnd?: () => void
}

export interface UseSpeechRecognitionReturn {
  // State
  isListening: boolean
  speechReady: boolean
  interimTranscript: string
  isSpeaking: boolean

  // Actions
  startListening: () => void
  stopListening: () => void
  toggleListening: () => void

  // Support
  isSupported: boolean
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    lang = 'nl-NL',
    continuous = true, // Default: false (stops when user stops talking)
    interimResults = true,
    onResult,
    onError,
    onStart,
    onEnd,
  } = options

  // State
  const [isListening, setIsListening] = useState(false)
  const [speechReady, setSpeechReady] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const latestInterimRef = useRef('')

  // Check if speech recognition is supported
  const isSupported =
    typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    // Don't immediately clear state - let onend handle cleanup
    // This ensures any pending final transcripts are processed
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) {
      onError?.('Speech recognition is not supported in this browser.')
      return
    }

    if (isListening) return

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.lang = lang

    recognition.onstart = () => {
      setSpeechReady(true)
      setIsListening(true)
      latestInterimRef.current = ''
      onStart?.()
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setInterimTranscript(interimTranscript)
      latestInterimRef.current = interimTranscript
      setIsSpeaking(!!interimTranscript)

      onResult?.(finalTranscript, interimTranscript)

      if (finalTranscript) {
        setInterimTranscript('')
        latestInterimRef.current = ''
        setIsSpeaking(false)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      setSpeechReady(false)
      setInterimTranscript('')
      latestInterimRef.current = ''
      setIsSpeaking(false)
      onError?.(event.error)
    }

    recognition.onend = () => {
      setIsListening(false)
      setSpeechReady(false)

      // If there was interim text when stopping, treat it as final
      // This gives users the impression their words were captured
      if (latestInterimRef.current.trim()) {
        onResult?.(latestInterimRef.current.trim(), '')
      }

      setInterimTranscript('')
      latestInterimRef.current = ''
      setIsSpeaking(false)
      onEnd?.()
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [
    isSupported,
    isListening,
    continuous,
    interimResults,
    lang,
    onResult,
    onError,
    onStart,
    onEnd,
  ])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  return {
    // State
    isListening,
    speechReady,
    interimTranscript,
    isSpeaking,

    // Actions
    startListening,
    stopListening,
    toggleListening,

    // Support
    isSupported,
  }
}
