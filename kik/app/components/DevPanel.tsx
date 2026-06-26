"use client"

import { useEffect, useState } from "react"

type Message = {
  id: string
  from: string
  to: string
  text: string
  direction: string
  receivedAt: string
  rawBody: Record<string, unknown>
}

type DevPanelProps = {
  onBack: () => void
}

export function DevPanel({ onBack }: DevPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendTo, setSendTo] = useState("")
  const [sendText, setSendText] = useState("")
  const [sendStatus, setSendStatus] = useState<string | null>(null)
  const [sendHint, setSendHint] = useState<string | null>(null)
  const [sendConfig, setSendConfig] = useState<string | null>(null)
  const [configuredNumber, setConfiguredNumber] = useState<string | null>(null)
  const [personalNumber, setPersonalNumber] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [simulateFrom, setSimulateFrom] = useState("+15551234567")
  const [simulateText, setSimulateText] = useState("")
  const [simulateStatus, setSimulateStatus] = useState<string | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const loadSendConfig = async () => {
    try {
      const res = await fetch("/api/send", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      if (data.mode === "proxy") {
        setSendConfig(`Proxy mode → ${data.proxyUrl}`)
      } else if (data.credentialsConfigured) {
        setSendConfig(
          data.authOk
            ? `Direct mode from ${data.fromNumber} — credentials verified`
            : `Direct mode from ${data.fromNumber} — ${data.authMessage}`,
        )
        setSendHint(data.authHint ?? null)
      } else {
        setSendConfig("Missing ACCOUNT_ID, API_KEY, or FREECLIMB_NUMBER in root .env")
      }
    } catch {
      setSendConfig(null)
    }
  }

  const loadMessages = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/incomingSms", { cache: "no-store" })
      if (!res.ok) {
        throw new Error(`Failed to load messages: ${res.status}`)
      }
      const data = await res.json()
      setMessages(data.messages ?? [])
      setConfiguredNumber(data.configuredFreeclimbNumber ?? null)
      setPersonalNumber(data.personalNumber ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadMessages()
      void loadSendConfig()
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [])

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSendStatus(null)
    setSendHint(null)
    setIsSending(true)

    if (!sendTo || !sendText) {
      setSendStatus("Please enter both recipient and message.")
      setIsSending(false)
      return
    }

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: sendTo, text: sendText }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSendHint(data?.hint ?? null)
        throw new Error(data?.error || `Send failed: ${res.status}`)
      }

      setSendStatus("Message sent successfully.")
      setSendHint(null)
      setSendText("")
      setSendTo("")
    } catch (err) {
      setSendStatus(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsSending(false)
    }
  }

  const handleSimulateInbound = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSimulateStatus(null)
    setIsSimulating(true)

    if (!simulateFrom.trim() || !simulateText.trim()) {
      setSimulateStatus("Enter both a sender number and message text.")
      setIsSimulating(false)
      return
    }

    try {
      const res = await fetch("/incomingSms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: simulateFrom.trim(),
          to: configuredNumber ?? undefined,
          text: simulateText.trim(),
          direction: "inbound",
          requestType: "messageDelivery",
          status: "received",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || `Simulate failed: ${res.status}`)
      }

      setSimulateStatus("Simulated inbound SMS saved. Check the chat list for a new thread.")
      setSimulateText("")
      await loadMessages()
    } catch (err) {
      setSimulateStatus(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-zinc-100">
      <header className="sticky top-0 z-10 flex items-center border-b border-zinc-200 bg-white px-2 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 px-2 text-kik-blue"
          aria-label="Back"
        >
          <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
            <path d="M10.5 0L0 10l10.5 10 1.4-1.4L2.8 10l9.1-9.4L10.5 0z" />
          </svg>
          <span className="text-[17px]">Back</span>
        </button>
        <span className="flex-1 text-center text-[17px] font-semibold text-black pr-16">
          Developer Tools
        </span>
      </header>

      <div className="flex flex-col gap-4 p-4">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">FreeClimb SMS Viewer</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Incoming messages appear here after they arrive at{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">/incomingSms</code>.
            The <strong>To</strong> field on each message shows which FreeClimb number received it.
            Update your new number&apos;s app SMS URL in the FreeClimb dashboard if texts to the new
            number are not appearing.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={loadMessages}
              className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Refresh messages
            </button>
            <div className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700">
              {messages.length} message{messages.length === 1 ? "" : "s"}
            </div>
          </div>
          {isLoading && <p className="mt-3 text-sm text-slate-600">Loading messages…</p>}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {configuredNumber && messages[0]?.to && messages[0].to !== configuredNumber && (
            <p className="mt-3 text-sm text-amber-700">
              Latest webhook was sent to {messages[0].to}, but your .env FreeClimb number is{" "}
              {configuredNumber}. Point your new number&apos;s SMS URL to ngrok, or text the
              number that is configured in the dashboard.
            </p>
          )}
          <p className="mt-3 text-sm text-amber-800">
            <strong>Trial account note:</strong> FreeClimb only delivers inbound SMS from your
            verified number
            {personalNumber ? ` (${personalNumber})` : ""}. Texts from other real phones will not
            reach this app until you upgrade your account. Use &quot;Simulate inbound SMS&quot;
            below to test fake threads locally.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Simulate inbound SMS</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Inject a fake inbound webhook to test unknown-sender threads without a second phone.
            Messages from your personal number open Lauren Roberson; any other{" "}
            <strong>From</strong> number creates a new fake contact thread.
          </p>
          <form onSubmit={handleSimulateInbound} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">From</label>
              <input
                value={simulateFrom}
                onChange={(event) => setSimulateFrom(event.target.value)}
                placeholder="+15551234567"
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Message</label>
              <textarea
                value={simulateText}
                onChange={(event) => setSimulateText(event.target.value)}
                rows={3}
                placeholder="Hey, is this Lauren?"
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSimulating}
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSimulating ? "Saving…" : "Simulate inbound SMS"}
              </button>
              {simulateStatus && <p className="text-sm text-slate-600">{simulateStatus}</p>}
            </div>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Send a message</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Send an SMS from your FreeClimb number. Use E.164 format for the recipient
            (e.g. <code className="rounded bg-zinc-100 px-1.5 py-0.5">+17085551234</code>).
            Trial accounts must verify outbound numbers in the FreeClimb dashboard first.
          </p>
          {sendConfig && (
            <p className="mt-2 text-xs text-zinc-500">{sendConfig}</p>
          )}
          <form onSubmit={handleSend} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">To</label>
              <input
                value={sendTo}
                onChange={(event) => setSendTo(event.target.value)}
                placeholder="+1708xxxxxxx"
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Message</label>
              <textarea
                value={sendText}
                onChange={(event) => setSendText(event.target.value)}
                rows={3}
                placeholder="Hi! This is a test message."
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSending}
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSending ? "Sending…" : "Send SMS"}
              </button>
              {sendStatus && <p className="text-sm text-slate-600">{sendStatus}</p>}
              {sendHint && <p className="text-sm text-amber-700">{sendHint}</p>}
            </div>
          </form>
        </section>

        <section className="space-y-3">
          {messages.length === 0 && !isLoading ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
              No messages yet. Send an SMS to your FreeClimb number or POST to{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5">/incomingSms</code>.
            </div>
          ) : (
            messages.map((message) => (
              <article key={message.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Incoming SMS</p>
                  <p className="text-base font-semibold text-slate-950">
                    {message.text || "(empty message)"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Date(message.receivedAt).toLocaleString()} · {message.direction}
                  </p>
                </div>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">From</p>
                    <p className="mt-1 text-sm text-slate-900">{message.from || "Unknown"}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      To (FreeClimb number)
                    </p>
                    <p className="mt-1 text-sm text-slate-900">{message.to || "Unknown"}</p>
                  </div>
                </div>
                <details className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="cursor-pointer text-sm font-medium text-slate-700">
                    Raw webhook payload
                  </summary>
                  <pre className="mt-3 max-h-48 overflow-auto text-xs text-slate-800">
                    {JSON.stringify(message.rawBody, null, 2)}
                  </pre>
                </details>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  )
}
