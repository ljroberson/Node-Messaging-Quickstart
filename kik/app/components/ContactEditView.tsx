"use client"

import { useState } from "react"
import type { ChatThread } from "../data/mockKik"
import { AvatarEditor } from "./AvatarEditor"

type ContactEditViewProps = {
  thread: ChatThread
  onBack: () => void
  onSave: (displayName: string, avatarUrl?: string) => void
  onAvatarClear: () => void
}

export function ContactEditView({
  thread,
  onBack,
  onSave,
  onAvatarClear,
}: ContactEditViewProps) {
  const [displayName, setDisplayName] = useState(thread.displayName)
  const [avatarUrl, setAvatarUrl] = useState(thread.avatarUrl)

  const handleSave = () => {
    const trimmed = displayName.trim()
    if (!trimmed) return
    onSave(trimmed, avatarUrl)
    onBack()
  }

  const handleAvatarClear = () => {
    setAvatarUrl(undefined)
    onAvatarClear()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <header className="flex items-center justify-between border-b border-kik-divider px-2 py-3">
        <button
          type="button"
          onClick={onBack}
          className="px-3 text-[17px] text-kik-blue"
        >
          Cancel
        </button>
        <span className="text-[17px] font-semibold text-black">Edit Contact</span>
        <button
          type="button"
          onClick={handleSave}
          disabled={!displayName.trim()}
          className="px-3 text-[17px] font-semibold text-kik-blue disabled:opacity-40"
        >
          Save
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <AvatarEditor
          displayName={displayName}
          avatarColor={thread.avatarColor}
          avatarUrl={avatarUrl}
          onDisplayNameChange={setDisplayName}
          onAvatarChange={setAvatarUrl}
          onAvatarClear={handleAvatarClear}
          nameLabel="Contact name"
        />
        <p className="mt-6 text-center text-[15px] text-kik-text-secondary">
          @{thread.username}
        </p>
      </div>
    </div>
  )
}
