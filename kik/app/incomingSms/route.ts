import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

type IncomingMessage = {
  id: string
  from: string
  to: string
  text: string
  direction: string
  receivedAt: string
  rawBody: Record<string, unknown>
}

const messages: IncomingMessage[] = []

const parseRequestBody = async (request: Request) => {
  const contentType = request.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    return request.json()
  }

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
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

  const message: IncomingMessage = {
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    from: toString(body.from),
    to: toString(body.to),
    text,
    direction: toString(body.direction ?? "inbound"),
    receivedAt: new Date().toISOString(),
    rawBody: body,
  }

  messages.unshift(message)

  return NextResponse.json({ success: true, message, total: messages.length })
}

export async function GET() {
  return NextResponse.json({ messages })
}
