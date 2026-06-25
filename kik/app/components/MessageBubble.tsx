import type { ChatMessage } from "../data/mockKik"
import { Avatar } from "./Avatar"

type MessageBubbleProps = {
  message: ChatMessage
  showAvatar?: boolean
  avatarColor?: string
  displayName?: string
  avatarUrl?: string
}

export function MessageBubble({
  message,
  showAvatar = false,
  avatarColor = "#8E8E93",
  displayName = "",
  avatarUrl,
}: MessageBubbleProps) {
  const isOutgoing = message.direction === "outgoing"

  if (isOutgoing) {
    return (
      <div className="flex justify-end px-3 py-0.5">
        <div className="max-w-[75%] rounded-2xl bg-kik-green px-3.5 py-2 text-[15px] leading-snug text-white">
          {message.text}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2 px-3 py-0.5">
      {showAvatar ? (
        <Avatar
          displayName={displayName}
          avatarColor={avatarColor}
          avatarUrl={avatarUrl}
          size="sm"
        />
      ) : (
        <div className="h-7 w-7 shrink-0" />
      )}
      <div className="max-w-[75%] rounded-2xl bg-kik-incoming-bubble px-3.5 py-2 text-[15px] leading-snug text-black">
        {message.text}
      </div>
    </div>
  )
}
