"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChatListPanel } from "./components/ChatListPanel"
import { ChatView } from "./components/ChatView"
import { ContactEditView } from "./components/ContactEditView"
import { DevPanel } from "./components/DevPanel"
import { DeviceFrame } from "./components/DeviceFrame"
import { EditProfileView } from "./components/EditProfileView"
import { EmptyChatPlaceholder } from "./components/EmptyChatPlaceholder"
import { PhoneShell } from "./components/PhoneShell"
import { ProfileView } from "./components/ProfileView"
import type { ChatMessage } from "./data/mockKik"
import { chatThreads, kikProfile } from "./data/mockKik"
import {
  defaultDeviceId,
  getDevicePreset,
  type DeviceId,
} from "./data/devicePresets"
import { useContactSettings } from "./hooks/useContactSettings"
import { useIncomingSms, type IncomingSmsMessage } from "./hooks/useIncomingSms"
import { applyContactOverrides, applyProfileOverride } from "./lib/applyOverrides"
import { mergeOutgoingIntoThreads } from "./lib/outgoingMessages"
import { getThreadFromList, LAUREN_ROBERSON_THREAD_ID, mergeThreads } from "./lib/smsThreads"

type View = "list" | "chat" | "profile" | "edit-profile" | "edit-contact" | "dev"

export default function Home() {
  const [deviceId, setDeviceId] = useState<DeviceId>(defaultDeviceId)
  const [view, setView] = useState<View>("list")
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [outgoingByThread, setOutgoingByThread] = useState<Record<string, ChatMessage[]>>({})
  const [personalNumber, setPersonalNumber] = useState<string | null>(null)
  const prevSmsCount = useRef(0)

  const { settings, saveProfile, saveContact, clearProfileAvatar, clearContactAvatar } =
    useContactSettings()

  const device = getDevicePreset(deviceId)
  const isSplitLayout = device.layout === "split"

  const profile = useMemo(
    () => applyProfileOverride(kikProfile, settings.profile),
    [settings.profile],
  )

  const handleSmsUpdate = useCallback(
    (smsMessages: IncomingSmsMessage[]) => {
      if (smsMessages.length <= prevSmsCount.current) return

      prevSmsCount.current = smsMessages.length
      setActiveThreadId(LAUREN_ROBERSON_THREAD_ID)

      if (!isSplitLayout) {
        setView((currentView) => (currentView === "list" ? "chat" : currentView))
      }
    },
    [isSplitLayout],
  )

  const { messages: smsMessages } = useIncomingSms(handleSmsUpdate)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch("/api/config", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        setPersonalNumber(data.personalNumber ?? null)
      } catch {
        setPersonalNumber(null)
      }
    }
    void loadConfig()
  }, [])

  const threads = useMemo(() => {
    const base = mergeThreads(chatThreads, smsMessages)
    const withContacts = applyContactOverrides(base, settings.contacts)
    return mergeOutgoingIntoThreads(withContacts, outgoingByThread)
  }, [smsMessages, settings.contacts, outgoingByThread])

  const resolvedThreadId = useMemo(() => {
    if (activeThreadId && getThreadFromList(threads, activeThreadId)) {
      return activeThreadId
    }
    if (isSplitLayout && threads.length > 0) {
      return threads[0].id
    }
    return activeThreadId
  }, [activeThreadId, isSplitLayout, threads])

  const activeThread = getThreadFromList(threads, resolvedThreadId)

  const handleDeviceChange = (nextDeviceId: DeviceId) => {
    setDeviceId(nextDeviceId)
    const nextDevice = getDevicePreset(nextDeviceId)
    if (nextDevice.layout === "split") {
      setActiveThreadId((current) => current ?? LAUREN_ROBERSON_THREAD_ID)
      setView("list")
    }
  }

  const openChat = (threadId: string) => {
    setActiveThreadId(threadId)
    setView(isSplitLayout ? "list" : "chat")
  }

  const openEditContact = () => {
    if (!activeThread) return
    setView("edit-contact")
  }

  const closeEditContact = () => {
    setView(isSplitLayout ? "list" : "chat")
  }

  const handleSendMessage = useCallback(
    async (text: string): Promise<{ ok: boolean; error?: string }> => {
      if (!personalNumber) {
        return {
          ok: false,
          error:
            "No personal number configured. Add PERSONAL_NUMBER to .env or text your FreeClimb number once so we can detect your phone.",
        }
      }

      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: personalNumber, text }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { ok: false, error: data?.error || data?.hint || "Failed to send SMS." }
      }

      const outgoing: ChatMessage = {
        id: `out-${Date.now()}`,
        direction: "outgoing",
        text,
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      }

      setOutgoingByThread((current) => ({
        ...current,
        [LAUREN_ROBERSON_THREAD_ID]: [
          ...(current[LAUREN_ROBERSON_THREAD_ID] ?? []),
          outgoing,
        ],
      }))

      return { ok: true }
    },
    [personalNumber],
  )

  const renderChatView = (showBack: boolean, onBack: () => void) => {
    if (!activeThread) return null

    const canSend = activeThread.id === LAUREN_ROBERSON_THREAD_ID

    return (
      <ChatView
        thread={activeThread}
        onBack={onBack}
        onEditContact={openEditContact}
        onSendMessage={canSend ? handleSendMessage : undefined}
        showBack={showBack}
      />
    )
  }

  const renderContactEdit = () => {
    if (!activeThread) return null

    return (
      <ContactEditView
        thread={activeThread}
        onBack={closeEditContact}
        onSave={(displayName, avatarUrl) =>
          saveContact(activeThread.id, displayName, avatarUrl)
        }
        onAvatarClear={() => clearContactAvatar(activeThread.id)}
      />
    )
  }

  const renderKikContent = () => {
    if (view === "edit-profile") {
      return (
        <EditProfileView
          profile={profile}
          onBack={() => setView("profile")}
          onSave={(displayName, avatarUrl) => saveProfile(displayName, avatarUrl)}
          onAvatarClear={clearProfileAvatar}
        />
      )
    }

    if (view === "profile") {
      return (
        <ProfileView
          profile={profile}
          onBack={() => setView("list")}
          onEditProfile={() => setView("edit-profile")}
          onDevToolsClick={() => setView("dev")}
        />
      )
    }

    if (view === "dev") {
      return <DevPanel onBack={() => setView("profile")} />
    }

    if (isSplitLayout) {
      return (
        <div className="flex min-h-0 flex-1">
          <ChatListPanel
            threads={threads}
            activeThreadId={resolvedThreadId}
            onSelectThread={openChat}
            onSettingsClick={() => setView("profile")}
            fullWidth={false}
          />
          {view === "edit-contact" ? (
            renderContactEdit() ?? <EmptyChatPlaceholder />
          ) : activeThread ? (
            renderChatView(false, () => setActiveThreadId(null))
          ) : (
            <EmptyChatPlaceholder />
          )}
        </div>
      )
    }

    if (view === "edit-contact") {
      return renderContactEdit()
    }

    if (view === "chat" && activeThread) {
      return renderChatView(true, () => setView("list"))
    }

    return (
      <ChatListPanel
        threads={threads}
        activeThreadId={resolvedThreadId}
        onSelectThread={openChat}
        onSettingsClick={() => setView("profile")}
      />
    )
  }

  return (
    <DeviceFrame device={device} deviceId={deviceId} onDeviceChange={handleDeviceChange}>
      <PhoneShell layout={device.layout} listWidth={device.listWidth}>
        {renderKikContent()}
      </PhoneShell>
    </DeviceFrame>
  )
}
