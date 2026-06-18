import { NextResponse } from "next/server"

const sendApiUrl = process.env.SEND_API_PROXY_URL || "http://127.0.0.1:3002"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body || typeof body.to !== "string" || typeof body.text !== "string") {
    return NextResponse.json(
      { error: "Request body must include 'to' and 'text' fields." },
      { status: 400 }
    )
  }

  const targetUrl = `${sendApiUrl.replace(/\/$/, "")}/send`

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to: body.to, text: body.text }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || `Failed to send SMS: ${response.statusText}` },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, result: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
