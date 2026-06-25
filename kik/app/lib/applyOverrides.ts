import type { ChatThread, KikProfile } from "../data/mockKik"
import type { ContactOverride, ContactSettings } from "./contactSettings"

export function applyProfileOverride(
  profile: KikProfile,
  override: ContactSettings["profile"],
): KikProfile {
  return {
    ...profile,
    displayName: override.displayName?.trim() || profile.displayName,
    avatarUrl: override.avatarUrl ?? profile.avatarUrl,
  }
}

export function applyContactOverride(
  thread: ChatThread,
  override?: ContactOverride,
): ChatThread {
  if (!override) return thread

  return {
    ...thread,
    displayName: override.displayName?.trim() || thread.displayName,
    avatarUrl: override.avatarUrl ?? thread.avatarUrl,
  }
}

export function applyContactOverrides(
  threads: ChatThread[],
  contacts: Record<string, ContactOverride>,
): ChatThread[] {
  return threads.map((thread) => applyContactOverride(thread, contacts[thread.id]))
}
