"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type IncomingSmsMessage = {
  id: string
  from: string
  to: string
  text: string
  direction: string
  receivedAt: string
  rawBody: Record<string, unknown>
}

const POLL_INTERVAL_MS = 3000

export function useIncomingSms(
  onMessagesUpdated?: (messages: IncomingSmsMessage[], personalNumber: string | null) => void,
) {
  const [messages, setMessages] = useState<IncomingSmsMessage[]>([])
  const [personalNumber, setPersonalNumber] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const onMessagesUpdatedRef = useRef(onMessagesUpdated)

  useEffect(() => {
    onMessagesUpdatedRef.current = onMessagesUpdated
  }, [onMessagesUpdated])

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch("/incomingSms", { cache: "no-store" })
      if (!res.ok) {
        throw new Error(`Failed to load messages: ${res.status}`)
      }
      const data = await res.json()
      const nextMessages = data.messages ?? []
      const nextPersonalNumber = data.personalNumber ?? null
      setMessages(nextMessages)
      setPersonalNumber(nextPersonalNumber)
      onMessagesUpdatedRef.current?.(nextMessages, nextPersonalNumber)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadMessages()
    }, 0)

    const intervalId = setInterval(() => {
      void loadMessages()
    }, POLL_INTERVAL_MS)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [loadMessages])

  return { messages, personalNumber, error, reload: loadMessages }
}
