import { useEffect, useCallback, useRef } from 'react'

interface ShortcutHandler {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  handler: () => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: ShortcutHandler[], enabled = true) {
  const handlersRef = useRef(shortcuts)
  handlersRef.current = shortcuts

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    const target = event.target as HTMLElement
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

    for (const shortcut of handlersRef.current) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
      const altMatch = shortcut.alt ? event.altKey : !event.altKey

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        if (shortcut.ctrl || !isInput) {
          event.preventDefault()
          shortcut.handler()
          return
        }
      }
    }
  }, [enabled])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export function useSaveShortcut(onSave: () => void, enabled = true) {
  useKeyboardShortcuts([
    { key: 's', ctrl: true, handler: onSave, description: 'Save' }
  ], enabled)
}

export function useSubmitShortcut(onSubmit: () => void, enabled = true) {
  useKeyboardShortcuts([
    { key: 'Enter', ctrl: true, handler: onSubmit, description: 'Submit' }
  ], enabled)
}
