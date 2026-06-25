"use client"

import { useRef, useState } from "react"
import { readImageFile } from "../lib/contactSettings"
import { Avatar } from "./Avatar"

type AvatarEditorProps = {
  displayName: string
  avatarColor: string
  avatarUrl?: string
  onDisplayNameChange: (name: string) => void
  onAvatarChange: (avatarUrl: string) => void
  onAvatarClear: () => void
  nameLabel?: string
}

export function AvatarEditor({
  displayName,
  avatarColor,
  avatarUrl,
  onDisplayNameChange,
  onAvatarChange,
  onAvatarClear,
  nameLabel = "Display name",
}: AvatarEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setError(null)
    try {
      const dataUrl = await readImageFile(file)
      onAvatarChange(dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load image.")
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group relative"
        aria-label="Change profile picture"
      >
        <Avatar
          displayName={displayName}
          avatarColor={avatarColor}
          avatarUrl={avatarUrl}
          size="xl"
        />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
          Change
        </span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="w-full max-w-xs">
        <label className="block text-sm font-medium text-zinc-700">{nameLabel}</label>
        <input
          type="text"
          value={displayName}
          onChange={(event) => onDisplayNameChange(event.target.value)}
          className="mt-2 w-full rounded-xl border border-kik-divider bg-kik-grey-bg px-4 py-3 text-[15px] text-black outline-none focus:border-kik-blue"
        />
      </div>

      {avatarUrl && (
        <button
          type="button"
          onClick={onAvatarClear}
          className="text-sm text-kik-blue"
        >
          Remove photo
        </button>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
