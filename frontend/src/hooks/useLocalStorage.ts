import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '../constants'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const valueToStore = value instanceof Function ? value(prev) : value
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch {
        console.warn(`Failed to save to localStorage: ${key}`)
      }
      return valueToStore
    })
  }, [key])

  return [storedValue, setValue]
}

export function useDraftStorage(trackId: string, initialValue: string) {
  const key = `${STORAGE_KEYS.DRAFT_PREFIX}${trackId}`
  return useLocalStorage(key, initialValue)
}

function systemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark' | 'system'>(
    STORAGE_KEYS.THEME,
    'system'
  )
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>(systemTheme)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemPreference(media.matches ? 'dark' : 'light')
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? systemPreference : theme

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const effective = current === 'system' ? systemTheme() : current
      return effective === 'dark' ? 'light' : 'dark'
    })
  }, [setTheme])

  return { theme, resolvedTheme, setTheme, toggleTheme }
}
