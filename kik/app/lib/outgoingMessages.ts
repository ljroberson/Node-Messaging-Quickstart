import type { ChatMessage, ChatThread } from "../data/mockKik"

export function appendOutgoingMessage(thread: ChatThread, message: ChatMessage): ChatThread {
  const messages = [...thread.messages, message]
  const last = messages[messages.length - 1]

  return {
    ...thread,
    messages,
    lastPreview: last.text,
    timestamp: "now",
    status: "D",
  }
}

export function mergeOutgoingIntoThreads(
  threads: ChatThread[],
  outgoingByThread: Record<string, ChatMessage[]>,
): ChatThread[] {
  return threads.map((thread) => {
    const outgoing = outgoingByThread[thread.id] ?? []
    if (outgoing.length === 0) return thread

    return outgoing.reduce((current, message) => appendOutgoingMessage(current, message), thread)
  })
}
