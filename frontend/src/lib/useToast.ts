import { useCallback, useState } from 'react'

// useToast() returns a `toast(message, tone?)` function and a `toasts` list.
// Drop <Toaster toasts={toasts} /> (from components/ui) anywhere in the page, once per
// page. Each toast auto-dismisses after 4 seconds.
//
// Lives in its own file so ui.tsx only exports components (React fast refresh).

export type ToastItem = { id: number; message: string; tone: 'error' | 'success' }

// A counter rather than Date.now(), so two toasts in the same millisecond keep
// separate keys and dismiss separately.
let nextId = 1

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, tone: 'error' | 'success' = 'error') => {
    const id = nextId++
    setToasts(prev => [...prev, { id, message, tone }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  return { toasts, toast }
}
