import type { ChatThread } from "../data/mockKik"
import { ChatListItem } from "./ChatListItem"
import { KikHeader } from "./KikHeader"
import { SearchBar } from "./SearchBar"

type ChatListPanelProps = {
  threads: ChatThread[]
  activeThreadId: string | null
  onSelectThread: (threadId: string) => void
  onSettingsClick: () => void
  fullWidth?: boolean
}

export function ChatListPanel({
  threads,
  activeThreadId,
  onSelectThread,
  onSettingsClick,
  fullWidth = true,
}: ChatListPanelProps) {
  return (
    <div
      className={`flex min-h-0 flex-col bg-white ${fullWidth ? "flex-1" : "h-full shrink-0 border-r border-kik-divider"}`}
      style={fullWidth ? undefined : { width: "var(--kik-list-width)" }}
    >
      <KikHeader onSettingsClick={onSettingsClick} />
      <SearchBar />
      <div className="flex-1 overflow-y-auto">
        {threads.map((thread) => (
          <ChatListItem
            key={thread.id}
            thread={thread}
            isActive={thread.id === activeThreadId}
            onClick={() => onSelectThread(thread.id)}
          />
        ))}
      </div>
    </div>
  )
}
