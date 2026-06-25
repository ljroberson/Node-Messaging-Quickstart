import type { KikProfile } from "../data/mockKik"
import { Avatar } from "./Avatar"

type ProfileViewProps = {
  profile: KikProfile
  onBack: () => void
  onEditProfile: () => void
  onDevToolsClick: () => void
}

export function ProfileView({
  profile,
  onBack,
  onEditProfile,
  onDevToolsClick,
}: ProfileViewProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <header className="flex items-center border-b border-kik-divider px-2 py-3">
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
          Settings
        </span>
      </header>

      <div className="flex flex-col items-center px-6 py-8">
        <Avatar
          displayName={profile.displayName}
          avatarColor={profile.avatarColor}
          avatarUrl={profile.avatarUrl}
          size="xl"
        />
        <h1 className="mt-4 text-[22px] font-semibold text-black">{profile.displayName}</h1>
        <p className="mt-1 text-[15px] text-kik-text-secondary">@{profile.username}</p>
      </div>

      <div className="border-t border-kik-divider">
        <button
          type="button"
          onClick={onEditProfile}
          className="flex w-full items-center justify-between px-4 py-3.5 text-left"
        >
          <span className="text-[17px] text-black">Edit Profile</span>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="#C7C7CC">
            <path d="M1 0l7 7-7 7-1.4-1.4L5.2 7 0 1.4 1 0z" />
          </svg>
        </button>
        <button
          type="button"
          className="flex w-full items-center justify-between border-t border-kik-divider px-4 py-3.5 text-left"
        >
          <span className="text-[17px] text-black">Notifications</span>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="#C7C7CC">
            <path d="M1 0l7 7-7 7-1.4-1.4L5.2 7 0 1.4 1 0z" />
          </svg>
        </button>
        <button
          type="button"
          className="flex w-full items-center justify-between border-t border-kik-divider px-4 py-3.5 text-left"
        >
          <span className="text-[17px] text-black">Privacy</span>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="#C7C7CC">
            <path d="M1 0l7 7-7 7-1.4-1.4L5.2 7 0 1.4 1 0z" />
          </svg>
        </button>
      </div>

      <div className="mt-auto border-t border-kik-divider p-4">
        <button
          type="button"
          onClick={onDevToolsClick}
          className="text-[13px] text-kik-text-secondary underline"
        >
          Developer tools
        </button>
      </div>
    </div>
  )
}
