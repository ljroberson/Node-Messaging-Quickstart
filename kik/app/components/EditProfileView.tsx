"use client"

import { useState } from "react"
import type { KikProfile } from "../data/mockKik"
import { AvatarEditor } from "./AvatarEditor"

type EditProfileViewProps = {
  profile: KikProfile
  onBack: () => void
  onSave: (displayName: string, avatarUrl?: string) => void
  onAvatarClear: () => void
}

export function EditProfileView({
  profile,
  onBack,
  onSave,
  onAvatarClear,
}: EditProfileViewProps) {
  const [displayName, setDisplayName] = useState(profile.displayName)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl)

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
        <span className="text-[17px] font-semibold text-black">Edit Profile</span>
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
          avatarColor={profile.avatarColor}
          avatarUrl={avatarUrl}
          onDisplayNameChange={setDisplayName}
          onAvatarChange={setAvatarUrl}
          onAvatarClear={handleAvatarClear}
        />
        <p className="mt-6 text-center text-[15px] text-kik-text-secondary">
          @{profile.username}
        </p>
      </div>
    </div>
  )
}
