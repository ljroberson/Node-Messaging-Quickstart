import path from "path"
import { config } from "dotenv"
import { loadIncomingMessages } from "./incomingSmsStore"
import { isValidE164, normalizePhoneNumber } from "./phone"

function clean(value: string | undefined): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }
  return trimmed
}

export function getPersonalNumber(): { number: string | null; source: "env" | "inbound" | null } {
  config({ path: path.resolve(process.cwd(), "../.env"), override: true })
  config({ path: path.resolve(process.cwd(), ".env.local"), override: true })

  const fromEnv = clean(process.env.PERSONAL_NUMBER)
  if (fromEnv) {
    const normalized = normalizePhoneNumber(fromEnv)
    if (isValidE164(normalized)) {
      return { number: normalized, source: "env" }
    }
  }

  const inboundFrom = loadIncomingMessages().find((message) => message.from)?.from
  if (inboundFrom) {
    const normalized = normalizePhoneNumber(inboundFrom)
    if (isValidE164(normalized)) {
      return { number: normalized, source: "inbound" }
    }
  }

  return { number: null, source: null }
}
