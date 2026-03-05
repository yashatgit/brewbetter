import { useState, useCallback, useRef } from 'react'

export function useBrewCommentary(brewId: string, existingCommentary?: string | null) {
  const [text, setText] = useState(existingCommentary ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Sync with existingCommentary when it changes (e.g. after refetch)
  const lastExistingRef = useRef(existingCommentary)
  if (existingCommentary !== lastExistingRef.current) {
    lastExistingRef.current = existingCommentary
    if (existingCommentary && !text) {
      setText(existingCommentary)
    }
  }

  const generate = useCallback(async (force?: boolean) => {
    // If we already have text and not forcing, skip
    if (text && !force) return

    setIsLoading(true)
    setError(null)
    setText('')

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/llm/brew-commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brewId }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Failed to get commentary')
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setText(accumulated)
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong')
      }
    } finally {
      setIsLoading(false)
    }
  }, [brewId, text])

  return { text, isLoading, error, generate, hasContent: text.length > 0 }
}

export function useBeanScan() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scan = useCallback(async (base64Image: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/llm/bean-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Scan failed')
      }

      return await res.json()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { scan, isLoading, error }
}
