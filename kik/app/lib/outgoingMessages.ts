import type { ChatMessage, ChatThread } from "../data/mockKik"
import { formatRelativeTime } from "./smsThreads"

function getMessageSortTime(message: ChatMessage): number {
  if (message.sentAt) {
    return new Date(message.sentAt).getTime()
  }

  const outboundMatch = message.id.match(/^out-(\d+)$/)
  if (outboundMatch) {
    return Number(outboundMatch[1])
  }

  return 0
}

function sortMessages(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort((a, b) => {
    const diff = getMessageSortTime(a) - getMessageSortTime(b)
    if (diff !== 0) return diff
    return a.id.localeCompare(b.id)
  })
}

export function mergeOutgoingIntoThreads(
  threads: ChatThread[],
  outgoingByThread: Record<string, ChatMessage[]>,
): ChatThread[] {
  return threads.map((thread) => {
    const outgoing = outgoingByThread[thread.id] ?? []
    if (outgoing.length === 0) return thread

    const messages = sortMessages([...thread.messages, ...outgoing])
    const last = messages[messages.length - 1]

    return {
      ...thread,
      messages,
      lastPreview: last.text,
      timestamp: last.sentAt ? formatRelativeTime(last.sentAt) : "now",
      status: "D",
    }
  })
}
