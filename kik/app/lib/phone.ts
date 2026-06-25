/**
 * Normalize a phone number toward E.164 for US numbers.
 * FreeClimb requires E.164 (e.g. +17085551234).
 */
export function normalizePhoneNumber(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ""

  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/\D/g, "")}`
  }

  const digits = trimmed.replace(/\D/g, "")

  if (digits.length === 10) {
    return `+1${digits}`
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`
  }

  return `+${digits}`
}

export function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(phone)
}
