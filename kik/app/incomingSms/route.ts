import { NextResponse } from "next/server"
import { getFreeClimbConfig } from "../lib/freeclimb"
import {
  addIncomingMessage,
  loadIncomingMessages,
  type StoredIncomingMessage,
} from "../lib/incomingSmsStore"
import { getPersonalNumber } from "../lib/personalNumber"

export const dynamic = "force-dynamic"

const parseRequestBody = async (request: Request) => {
  const contentType = request.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    return request.json()
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await request.formData()
    return Object.fromEntries(form.entries())
  }

  try {
    return await request.json()
  } catch {
    return {}
  }
}

const toString = (value: unknown) => {
  if (value === undefined || value === null) return ""
  return String(value)
}

export async function POST(request: Request) {
  const body = (await parseRequestBody(request)) as Record<string, unknown>
  const text = toString(body.text ?? body.body ?? "")

  const message: StoredIncomingMessage = {
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    from: toString(body.from),
    to: toString(body.to),
    text,
    direction: toString(body.direction ?? "inbound"),
    receivedAt: new Date().toISOString(),
    rawBody: body,
  }

  const configured = getFreeClimbConfig()
  if (configured?.fromNumber && message.to && message.to !== configured.fromNumber) {
    console.warn(
      `[incomingSms] Webhook delivered to ${message.to} but FREECLIMB_NUMBER is ${configured.fromNumber}. Update the SMS URL on the new number's application in FreeClimb.`,
    )
  }

  console.log("[incomingSms] received:", {
    from: message.from,
    to: message.to,
    text: message.text,
    requestType: body.requestType,
  })

  const messages = addIncomingMessage(message)

  return NextResponse.json({ success: true, message, total: messages.length })
}

export async function GET() {
  const messages = loadIncomingMessages()
  const configured = getFreeClimbConfig()
  const personal = getPersonalNumber()

  return NextResponse.json({
    messages,
    configuredFreeclimbNumber: configured?.fromNumber ?? null,
    personalNumber: personal.number,
    personalNumberSource: personal.source,
  })
}
