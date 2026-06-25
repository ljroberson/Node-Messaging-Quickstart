import path from "path"
import { config } from "dotenv"
import freeclimb, { MessageRequest } from "@freeclimb/sdk"
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

export type FreeClimbConfig = {
  accountId: string
  apiKey: string
  fromNumber: string
}

export function getFreeClimbConfig(): FreeClimbConfig | null {
  config({ path: path.resolve(process.cwd(), "../.env"), override: true })
  config({ path: path.resolve(process.cwd(), ".env.local"), override: true })

  const accountId = clean(process.env.ACCOUNT_ID)
  const apiKey = clean(process.env.API_KEY ?? process.env.API_TOKEN ?? process.env.AUTH_TOKEN)
  const fromNumber = clean(process.env.FREECLIMB_NUMBER)

  if (!accountId || !apiKey || !fromNumber) {
    return null
  }

  if (apiKey.startsWith("vault:")) {
    throw new Error(
      'API_KEY looks like a dashboard placeholder (vault:...). Copy the revealed API key from Account → API Credentials into .env.',
    )
  }

  return { accountId, apiKey, fromNumber }
}

export function getFreeClimbApi() {
  const credentials = getFreeClimbConfig()
  if (!credentials) {
    throw new Error(
      "Missing FreeClimb credentials. Set ACCOUNT_ID, API_KEY, and FREECLIMB_NUMBER in the repo root .env file.",
    )
  }

  const configuration = freeclimb.createConfiguration({
    accountId: credentials.accountId,
    apiKey: credentials.apiKey,
  })

  return {
    api: new freeclimb.DefaultApi(configuration),
    fromNumber: credentials.fromNumber,
  }
}

export type SendSmsResult =
  | { ok: true; to: string; text: string; messageId?: string }
  | { ok: false; error: string; hint?: string; code?: number }

export function parseFreeClimbError(error: unknown): { message: string; hint?: string; code?: number } {
  const fallback = {
    message: error instanceof Error ? error.message : "Failed to send SMS",
  }

  if (!error || typeof error !== "object") return fallback

  const err = error as { body?: string | Record<string, unknown>; message?: string }
  let body: Record<string, unknown> | null = null

  if (typeof err.body === "string") {
    try {
      body = JSON.parse(err.body) as Record<string, unknown>
    } catch {
      return { message: err.body }
    }
  } else if (err.body && typeof err.body === "object") {
    body = err.body
  }

  const code = typeof body?.code === "number" ? body.code : undefined
  const message =
    (typeof body?.message === "string" && body.message) ||
    err.message ||
    fallback.message

  if (code === 50) {
    return {
      code,
      message,
      hint:
        "FreeClimb rejected these credentials. Run `node scripts/verify-freeclimb.cjs` from the repo root. Regenerate the API key if that script fails.",
    }
  }

  if (code === 1001 || message.toLowerCase().includes("verified")) {
    return {
      code,
      message,
      hint:
        "Trial accounts can only send SMS to verified numbers. Add and verify your personal number in the FreeClimb dashboard first.",
    }
  }

  return { code, message }
}

export async function verifyFreeClimbAuth(): Promise<{
  ok: boolean
  message: string
  hint?: string
}> {
  try {
    const credentials = getFreeClimbConfig()
    if (!credentials) {
      return {
        ok: false,
        message: "Missing ACCOUNT_ID, API_KEY, or FREECLIMB_NUMBER in .env",
      }
    }

    const { api } = getFreeClimbApi()
    await api.listApplications()
    return { ok: true, message: "FreeClimb accepted your credentials." }
  } catch (error) {
    const parsed = parseFreeClimbError(error)
    return { ok: false, message: parsed.message, hint: parsed.hint }
  }
}

export async function sendSms(to: string, text: string): Promise<SendSmsResult> {
  const normalizedTo = normalizePhoneNumber(to)

  if (!isValidE164(normalizedTo)) {
    return {
      ok: false,
      error: `Invalid recipient number "${to}". Use E.164 format, e.g. +17085551234.`,
    }
  }

  if (!text.trim()) {
    return { ok: false, error: "Message text cannot be empty." }
  }

  const { api, fromNumber } = getFreeClimbApi()
  const normalizedFrom = normalizePhoneNumber(fromNumber)

  if (!isValidE164(normalizedFrom)) {
    return {
      ok: false,
      error: `FREECLIMB_NUMBER in .env is invalid (${fromNumber}). It must be E.164 format, e.g. +13175551234.`,
    }
  }

  try {
    const result = await api.sendAnSmsMessage(
      new MessageRequest({
        from: normalizedFrom,
        to: normalizedTo,
        text: text.trim(),
      }),
    )

    return {
      ok: true,
      to: normalizedTo,
      text: text.trim(),
      messageId: result?.messageId,
    }
  } catch (error) {
    const parsed = parseFreeClimbError(error)
    return {
      ok: false,
      error: parsed.message,
      hint: parsed.hint,
      code: parsed.code,
    }
  }
}
