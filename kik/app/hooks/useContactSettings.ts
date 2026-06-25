"use client"

import { useCallback, useEffect, useState } from "react"
import {
  defaultContactSettings,
  loadContactSettings,
  saveContactSettings,
  type ContactOverride,
  type ContactSettings,
  type ProfileOverride,
} from "../lib/contactSettings"

export function useContactSettings() {
  const [settings, setSettings] = useState<ContactSettings>(defaultContactSettings)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSettings(loadContactSettings())
      setIsLoaded(true)
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [])

  const persist = useCallback((updater: (current: ContactSettings) => ContactSettings) => {
    setSettings((current) => {
      const next = updater(current)
      saveContactSettings(next)
      return next
    })
  }, [])

  const updateProfile = useCallback(
    (patch: ProfileOverride) => {
      persist((current) => ({
        ...current,
        profile: { ...current.profile, ...patch },
      }))
    },
    [persist],
  )

  const updateContact = useCallback(
    (contactId: string, patch: ContactOverride) => {
      persist((current) => ({
        ...current,
        contacts: {
          ...current.contacts,
          [contactId]: { ...current.contacts[contactId], ...patch },
        },
      }))
    },
    [persist],
  )

  const saveProfile = useCallback(
    (displayName: string, avatarUrl?: string) => {
      persist((current) => {
        const profile: ProfileOverride = { displayName }
        if (avatarUrl) profile.avatarUrl = avatarUrl
        return { ...current, profile }
      })
    },
    [persist],
  )

  const saveContact = useCallback(
    (contactId: string, displayName: string, avatarUrl?: string) => {
      persist((current) => {
        const contact: ContactOverride = { displayName }
        if (avatarUrl) contact.avatarUrl = avatarUrl
        return {
          ...current,
          contacts: {
            ...current.contacts,
            [contactId]: contact,
          },
        }
      })
    },
    [persist],
  )

  const clearContactAvatar = useCallback(
    (contactId: string) => {
      persist((current) => {
        const existing = current.contacts[contactId] ?? {}
        const rest = { ...existing }
        delete rest.avatarUrl
        return {
          ...current,
          contacts: {
            ...current.contacts,
            [contactId]: rest,
          },
        }
      })
    },
    [persist],
  )

  const clearProfileAvatar = useCallback(() => {
    persist((current) => {
      const rest = { ...current.profile }
      delete rest.avatarUrl
      return {
        ...current,
        profile: rest,
      }
    })
  }, [persist])

  return {
    settings,
    isLoaded,
    updateProfile,
    updateContact,
    saveProfile,
    saveContact,
    clearContactAvatar,
    clearProfileAvatar,
  }
}
