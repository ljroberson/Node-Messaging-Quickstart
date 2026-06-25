"use client"

import { useEffect, useRef, useState } from "react"
import type { ChatThread } from "../data/mockKik"
import { MessageBubble } from "./MessageBubble"

type ChatViewProps = {
  thread: ChatThread
  onBack: () => void
  onEditContact: () => void
  onSendMessage?: (text: string) => Promise<{ ok: boolean; error?: string }>
  showBack?: boolean
}

export function ChatView({
  thread,
  onBack,
  onEditContact,
  onSendMessage,
  showBack = true,
}: ChatViewProps) {
  const [draft, setDraft] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const canSend = Boolean(onSendMessage)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [thread.messages.length])

  const sendMessage = async () => {
    const text = draft.trim()
    if (!text || !onSendMessage || isSending) return

    setIsSending(true)
    setSendError(null)

    try {
      const result = await onSendMessage(text)
      if (!result.ok) {
        setSendError(result.error ?? "Failed to send message.")
        return
      }
      setDraft("")
    } finally {
      setIsSending(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await sendMessage()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void sendMessage()
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <header className="flex items-center justify-between border-b border-kik-divider px-2 py-3">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 px-2 text-kik-blue"
            aria-label="Back"
          >
            <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
              <path d="M10.5 0L0 10l10.5 10 1.4-1.4L2.8 10l9.1-9.4L10.5 0z" />
            </svg>
            <span className="text-[17px]">Back</span>
          </button>
        ) : (
          <div className="w-16" />
        )}

        <span className="text-[17px] font-semibold text-black">{thread.displayName}</span>

        <button
          type="button"
          onClick={onEditContact}
          className="flex h-8 w-8 items-center justify-center text-kik-blue"
          aria-label="Edit contact"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto py-3">
        {thread.messages.map((message, index) => {
          const prev = thread.messages[index - 1]
          const showAvatar =
            message.direction === "incoming" &&
            (!prev || prev.direction !== "incoming")

          return (
            <MessageBubble
              key={message.id}
              message={message}
              showAvatar={showAvatar}
              avatarColor={thread.avatarColor}
              displayName={thread.displayName}
              avatarUrl={thread.avatarUrl}
            />
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-kik-divider bg-white px-3 py-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={canSend ? "Type a message..." : "Type a message..."}
            disabled={!canSend || isSending}
            className="flex-1 rounded-full border border-kik-divider bg-white px-4 py-2.5 text-[15px] text-black outline-none placeholder:text-kik-text-secondary focus:border-kik-blue disabled:opacity-60"
          />
          {canSend && (
            <button
              type="submit"
              disabled={!draft.trim() || isSending}
              className="shrink-0 rounded-full bg-kik-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {isSending ? "..." : "Send"}
            </button>
          )}
        </div>
        {sendError && <p className="mt-2 px-1 text-xs text-red-600">{sendError}</p>}
        <div className="mt-2 flex items-center gap-5 px-2 pb-1 text-kik-text-secondary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" />
            <path d="M9 2 7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
          </svg>
        </div>
      </form>
    </div>
  )
}
