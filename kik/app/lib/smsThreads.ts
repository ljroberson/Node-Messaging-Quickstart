import type { ChatMessage, ChatThread } from "../data/mockKik"
import type { IncomingSmsMessage } from "../hooks/useIncomingSms"
import { fakeIdentityFromPhone, isPersonalSender, threadIdFromPhone } from "./smsIdentity"
import { normalizePhoneNumber } from "./phone"

export const LAUREN_ROBERSON_THREAD_ID = "lauren-roberson"

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

export function formatRelativeTime(iso: string): string {
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
    sentAt: sms.receivedAt,
  }
}

function sortSmsMessages(messages: IncomingSmsMessage[]): IncomingSmsMessage[] {
  return [...messages].sort(
    (a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime(),
  )
}

export function buildLaurenRobersonThread(smsMessages: IncomingSmsMessage[]): ChatThread {
  const sorted = sortSmsMessages(smsMessages)
  const last = sorted[sorted.length - 1]

  return {
    id: LAUREN_ROBERSON_THREAD_ID,
    displayName: "Lauren Roberson",
    username: "laurenroberson",
    avatarColor: "#5856D6",
    lastPreview: last?.text || "Waiting for messages…",
    timestamp: last ? formatRelativeTime(last.receivedAt) : "",
    messages: sorted.map(smsToChatMessage),
  }
}

function buildSmsSenderThread(phone: string, smsMessages: IncomingSmsMessage[]): ChatThread {
  const sorted = sortSmsMessages(smsMessages)
  const last = sorted[sorted.length - 1]
  const identity = fakeIdentityFromPhone(phone)

  return {
    id: threadIdFromPhone(phone),
    displayName: identity.displayName,
    username: identity.username,
    avatarColor: identity.avatarColor,
    lastPreview: last?.text || "",
    timestamp: last ? formatRelativeTime(last.receivedAt) : "",
    status: "D",
    messages: sorted.map(smsToChatMessage),
  }
}

function groupSmsBySender(
  smsMessages: IncomingSmsMessage[],
): Map<string, IncomingSmsMessage[]> {
  const bySender = new Map<string, IncomingSmsMessage[]>()

  for (const sms of smsMessages) {
    const from = normalizePhoneNumber(sms.from)
    if (!from) continue

    const bucket = bySender.get(from) ?? []
    bucket.push(sms)
    bySender.set(from, bucket)
  }

  return bySender
}

export function getThreadIdForSender(from: string, personalNumber: string | null): string {
  if (personalNumber && isPersonalSender(from, personalNumber)) {
    return LAUREN_ROBERSON_THREAD_ID
  }

  return threadIdFromPhone(from)
}

export function mergeThreads(
  staticThreads: ChatThread[],
  smsMessages: IncomingSmsMessage[],
  personalNumber: string | null,
): ChatThread[] {
  const bySender = groupSmsBySender(smsMessages)
  const normalizedPersonal = personalNumber ? normalizePhoneNumber(personalNumber) : null

  const laurenMessages = normalizedPersonal
    ? (bySender.get(normalizedPersonal) ?? [])
    : smsMessages

  if (normalizedPersonal) {
    bySender.delete(normalizedPersonal)
  } else {
    bySender.clear()
  }

  const laurenThread = buildLaurenRobersonThread(laurenMessages)

  const smsThreads = Array.from(bySender.entries())
    .map(([phone, messages]) => buildSmsSenderThread(phone, messages))
    .sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.sentAt
      const bLast = b.messages[b.messages.length - 1]?.sentAt
      const aTime = aLast ? new Date(aLast).getTime() : 0
      const bTime = bLast ? new Date(bLast).getTime() : 0
      return bTime - aTime
    })

  return [laurenThread, ...smsThreads, ...staticThreads]
}

export function getThreadFromList(
  threads: ChatThread[],
  threadId: string | null,
): ChatThread | undefined {
  if (!threadId) return undefined
  return threads.find((thread) => thread.id === threadId)
}
