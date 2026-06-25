import type { ChatMessage, ChatThread } from "../data/mockKik"
import type { IncomingSmsMessage } from "../hooks/useIncomingSms"

export const LAUREN_ROBERSON_THREAD_ID = "lauren-roberson"

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return "now"
  if (diffMin < 60) return `${diffMin} min`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hr${diffHr === 1 ? "" : "s"}`
  return new Date(iso).toLocaleDateString()
}

function smsToChatMessage(sms: IncomingSmsMessage): ChatMessage {
  return {
    id: sms.id,
    direction: "incoming",
    text: sms.text || "(empty message)",
    time: formatMessageTime(sms.receivedAt),
  }
}

export function buildLaurenRobersonThread(smsMessages: IncomingSmsMessage[]): ChatThread {
  const sorted = [...smsMessages].sort(
    (a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime(),
  )

  const last = sorted[sorted.length - 1]
  const senderLabel = sorted[0]?.from || "laurenroberson"

  return {
    id: LAUREN_ROBERSON_THREAD_ID,
    displayName: "Lauren Roberson",
    username: senderLabel,
    avatarColor: "#5856D6",
    lastPreview: last?.text || "Waiting for messages…",
    timestamp: last ? formatRelativeTime(last.receivedAt) : "",
    messages: sorted.map(smsToChatMessage),
  }
}

export function mergeThreads(
  staticThreads: ChatThread[],
  smsMessages: IncomingSmsMessage[],
): ChatThread[] {
  const laurenThread = buildLaurenRobersonThread(smsMessages)
  return [laurenThread, ...staticThreads]
}

export function getThreadFromList(
  threads: ChatThread[],
  threadId: string | null,
): ChatThread | undefined {
  if (!threadId) return undefined
  return threads.find((thread) => thread.id === threadId)
}
