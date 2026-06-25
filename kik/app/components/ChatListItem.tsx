import type { ChatThread } from "../data/mockKik"
import { Avatar } from "./Avatar"

type ChatListItemProps = {
  thread: ChatThread
  onClick: () => void
  isActive?: boolean
}

export function ChatListItem({ thread, onClick, isActive = false }: ChatListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 border-b border-kik-divider px-4 py-3 text-left transition ${
        isActive ? "bg-kik-grey-bg" : "hover:bg-kik-grey-bg/50"
      }`}
    >
      <Avatar
        displayName={thread.displayName}
        avatarColor={thread.avatarColor}
        avatarUrl={thread.avatarUrl}
        size="md"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[16px] font-semibold text-black">
            {thread.displayName}
          </span>
          <span className="shrink-0 text-[13px] text-kik-text-secondary">
            {thread.timestamp}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1">
          {thread.status && (
            <span className="text-[13px] font-medium text-kik-text-secondary">
              {thread.status}
            </span>
          )}
          <span className="truncate text-[14px] text-kik-text-secondary">
            {thread.lastPreview}
          </span>
        </div>
      </div>
    </button>
  )
}
