import { NextResponse } from "next/server"
import { getFreeClimbConfig, sendSms, verifyFreeClimbAuth } from "../../lib/freeclimb"
import { normalizePhoneNumber } from "../../lib/phone"

export const dynamic = "force-dynamic"

const sendApiUrl = process.env.SEND_API_PROXY_URL

async function sendViaProxy(to: string, text: string) {
  const targetUrl = `${sendApiUrl!.replace(/\/$/, "")}/send`

  const response = await fetch(targetUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, text }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    return NextResponse.json(
      {
        error: data?.error || `Failed to send SMS via proxy: ${response.statusText}`,
        hint: data?.hint,
        proxyUrl: targetUrl,
      },
      { status: response.status },
    )
  }

  return NextResponse.json({ success: true, result: data, via: "proxy" })
}

export async function GET() {
  const config = getFreeClimbConfig()
  const auth = config ? await verifyFreeClimbAuth() : null

  return NextResponse.json({
    mode: sendApiUrl ? "proxy" : "direct",
    proxyUrl: sendApiUrl ?? null,
    credentialsConfigured: Boolean(config),
    fromNumber: config?.fromNumber ?? null,
    authOk: auth?.ok ?? false,
    authMessage: auth?.message ?? "Credentials not configured",
    authHint: auth?.hint ?? null,
  })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body || typeof body.to !== "string" || typeof body.text !== "string") {
    return NextResponse.json(
      { error: "Request body must include 'to' and 'text' fields." },
      { status: 400 },
    )
  }

  const to = normalizePhoneNumber(body.to)
  const text = body.text

  if (sendApiUrl) {
    try {
      return await sendViaProxy(to, text)
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? `Proxy fetch failed (${sendApiUrl}): ${error.message}`
              : "Proxy fetch failed",
          hint: "Unset SEND_API_PROXY_URL to send directly from this app using your .env credentials.",
        },
        { status: 500 },
      )
    }
  }

  const result = await sendSms(to, text)

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, hint: result.hint, code: result.code },
      { status: result.code === 50 ? 401 : 500 },
    )
  }

  return NextResponse.json({ success: true, result, via: "direct" })
}
