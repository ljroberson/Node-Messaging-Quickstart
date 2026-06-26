import { normalizePhoneNumber } from "./phone"

const FIRST_NAMES = [
  "Alex",
  "Jordan",
  "Taylor",
  "Morgan",
  "Casey",
  "Riley",
  "Quinn",
  "Avery",
  "Blake",
  "Cameron",
  "Dakota",
  "Elliot",
  "Finley",
  "Harper",
  "Jamie",
]

const LAST_NAMES = [
  "Rivera",
  "Chen",
  "Brooks",
  "Patel",
  "Nguyen",
  "Foster",
  "Hayes",
  "Kim",
  "Torres",
  "Bennett",
  "Coleman",
  "Reed",
  "Morgan",
  "Sullivan",
  "Parker",
]

const AVATAR_COLORS = [
  "#FF9500",
  "#FF2D55",
  "#5856D6",
  "#34C759",
  "#007AFF",
  "#AF52DE",
  "#FF3B30",
  "#5AC8FA",
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export function threadIdFromPhone(phone: string): string {
  const digits = normalizePhoneNumber(phone).replace(/\D/g, "")
  return `sms-${digits || "unknown"}`
}

export function fakeIdentityFromPhone(phone: string): {
  displayName: string
  username: string
  avatarColor: string
} {
  const normalized = normalizePhoneNumber(phone)
  const hash = hashString(normalized)
  const first = FIRST_NAMES[hash % FIRST_NAMES.length]
  const last = LAST_NAMES[(hash >> 4) % LAST_NAMES.length]
  const suffix = (hash % 900) + 100

  return {
    displayName: `${first} ${last}`,
    username: `${first.toLowerCase()}${last.toLowerCase()}${suffix}`,
    avatarColor: AVATAR_COLORS[(hash >> 8) % AVATAR_COLORS.length],
  }
}

export function isPersonalSender(from: string, personalNumber: string | null): boolean {
  if (!personalNumber) return false
  return normalizePhoneNumber(from) === normalizePhoneNumber(personalNumber)
}
