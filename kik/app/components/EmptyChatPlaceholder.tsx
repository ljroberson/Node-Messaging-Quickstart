export function EmptyChatPlaceholder() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-white px-8 text-center">
      <span className="kik-logo text-3xl">kik.</span>
      <p className="mt-4 text-[15px] text-kik-text-secondary">
        Select a conversation to view messages
      </p>
    </div>
  )
}
