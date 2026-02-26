export {}

declare global {
  interface Window {
    YG?: {
      Widget: new (
        element: string | HTMLElement,
        options: {
          width?: number
          height?: number
          autoStart?: 0 | 1
          components?: number
          backgroundColor?: string
          panelsBackgroundColor?: string
          textColor?: string
          titleColor?: string
          captionColor?: string
          linkColor?: string
          keywordColor?: string
          queryColor?: string
          markerColor?: string
          events?: {
            onFetchDone?: (event: {
              query: string
              lang: string
              accent?: string
              totalResult: number
            }) => void
            onVideoChange?: (event: {
              video: string
              trackNumber: number
            }) => void
            onCaptionChange?: (event: { caption: string; id: number }) => void
            onError?: (event: { code: number }) => void
          }
        },
      ) => {
        fetch: (query: string, lang: string, accent?: string) => void
        next: () => void
        previous: () => void
        close?: () => void
      }
    }
    onYouglishAPIReady?: () => void
    __youglishApiPromise?: Promise<void>
    __youglishApiReady?: boolean
  }
}
