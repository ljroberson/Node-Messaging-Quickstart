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

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendTo, setSendTo] = useState("")
  const [sendText, setSendText] = useState("")
  const [sendStatus, setSendStatus] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSendStatus(null)
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
        throw new Error(data?.error || `Send failed: ${res.status}`)
      }

      setSendStatus("Message sent successfully.")
      setSendText("")
      setSendTo("")
    } catch (err) {
      setSendStatus(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
        <section className="rounded-3xl bg-white p-8 shadow-lg shadow-zinc-200/60">
          <h1 className="text-3xl font-semibold">FreeClimb SMS Viewer</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            Incoming messages will appear here after they arrive at <code className="rounded bg-zinc-100 px-1.5 py-0.5">/incomingSms</code>.
            Use the refresh button to reload messages.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
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
          {isLoading && <p className="mt-4 text-sm text-slate-600">Loading messages…</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-lg shadow-zinc-200/60">
          <h2 className="text-2xl font-semibold">Send a message</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Send an SMS from your FreeClimb number to a recipient number.
          </p>
          <form onSubmit={handleSend} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">To</label>
              <input
                value={sendTo}
                onChange={(event) => setSendTo(event.target.value)}
                placeholder="+1708xxxxxxx"
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Message</label>
              <textarea
                value={sendText}
                onChange={(event) => setSendText(event.target.value)}
                rows={4}
                placeholder="Hi! This is a test message."
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isSending}
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSending ? "Sending…" : "Send SMS"}
              </button>
              {sendStatus && (
                <p className="text-sm text-slate-600">{sendStatus}</p>
              )}
            </div>
          </form>
        </section>

        <section className="space-y-4">
          {messages.length === 0 && !isLoading ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
              No messages yet. Send an SMS to your FreeClimb number or POST to <code className="rounded bg-zinc-100 px-1.5 py-0.5">/incomingSms</code>.
            </div>
          ) : (
            messages.map((message) => (
              <article key={message.id} className="rounded-3xl bg-white p-6 shadow-sm shadow-zinc-200/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Incoming SMS</p>
                    <p className="mt-2 text-base font-semibold text-slate-950">{message.text || "(empty message)"}</p>
                  </div>
                  <div className="space-y-1 text-right text-sm text-slate-500">
                    <p>{new Date(message.receivedAt).toLocaleString()}</p>
                    <p>{message.direction}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">From</p>
                    <p className="mt-1 text-sm text-slate-900">{message.from || "Unknown"}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">To</p>
                    <p className="mt-1 text-sm text-slate-900">{message.to || "Unknown"}</p>
                  </div>
                </div>
                <details className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="cursor-pointer text-sm font-medium text-slate-700">Raw webhook payload</summary>
                  <pre className="mt-3 max-h-72 overflow-auto text-xs text-slate-800">{JSON.stringify(message.rawBody, null, 2)}</pre>
                </details>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  )
}
