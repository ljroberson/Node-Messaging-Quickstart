export type ContactOverride = {
  displayName?: string
  avatarUrl?: string
}

export type ProfileOverride = {
  displayName?: string
  avatarUrl?: string
}

export type ContactSettings = {
  profile: ProfileOverride
  contacts: Record<string, ContactOverride>
}

const STORAGE_KEY = "kik-contact-settings"

export const defaultContactSettings: ContactSettings = {
  profile: {},
  contacts: {},
}

export function loadContactSettings(): ContactSettings {
  if (typeof window === "undefined") return defaultContactSettings

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultContactSettings
    const parsed = JSON.parse(raw) as ContactSettings
    return {
      profile: parsed.profile ?? {},
      contacts: parsed.contacts ?? {},
    }
  } catch {
    return defaultContactSettings
  }
}

export function saveContactSettings(settings: ContactSettings) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."))
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      reject(new Error("Image must be smaller than 2 MB."))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
      } else {
        reject(new Error("Could not read image."))
      }
    }
    reader.onerror = () => reject(new Error("Could not read image."))
    reader.readAsDataURL(file)
  })
}
