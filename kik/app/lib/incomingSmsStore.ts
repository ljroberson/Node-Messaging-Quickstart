import fs from "fs"
import path from "path"

export type StoredIncomingMessage = {
  id: string
  from: string
  to: string
  text: string
  direction: string
  receivedAt: string
  rawBody: Record<string, unknown>
}

const storePath = path.join(process.cwd(), ".data", "incoming-sms.json")

function ensureStoreDir() {
  fs.mkdirSync(path.dirname(storePath), { recursive: true })
}

export function loadIncomingMessages(): StoredIncomingMessage[] {
  try {
    if (!fs.existsSync(storePath)) return []
    const raw = fs.readFileSync(storePath, "utf8")
    const parsed = JSON.parse(raw) as StoredIncomingMessage[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveIncomingMessages(messages: StoredIncomingMessage[]) {
  ensureStoreDir()
  fs.writeFileSync(storePath, JSON.stringify(messages, null, 2), "utf8")
}

export function addIncomingMessage(message: StoredIncomingMessage): StoredIncomingMessage[] {
  const messages = loadIncomingMessages()
  const messageId = message.rawBody?.messageId
  if (messageId && messages.some((item) => item.rawBody?.messageId === messageId)) {
    return messages
  }
  messages.unshift(message)
  saveIncomingMessages(messages)
  return messages
}
