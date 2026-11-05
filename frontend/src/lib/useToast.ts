import { createContext, useCallback, useContext, useState } from 'react'

// useToast() returns `toast(message, tone?)`, `dismiss(id)` and a `toasts` list.
//
// Inside <ToastProvider> (mounted once in App) every toast goes to the one
// app-wide stack, so a toast stays on screen after the modal or page that
// raised it closes. There the local `toasts` list is always empty, so a
// page's own <Toaster> renders nothing.
//
// Outside a provider (some unit tests) the hook keeps its own list; render
// <Toaster toasts={toasts} onDismiss={dismiss} /> to show it.
//
// Each toast auto-dismisses after 4 seconds, or when its × is clicked.
// Lives in its own file so ui.tsx only exports components (React fast refresh).

export type ToastTone = 'error' | 'success'
export type ToastItem = { id: number; message: string; tone: ToastTone }
export type ToastApi = {
  toast: (message: string, tone?: ToastTone) => void
  dismiss: (id: number) => void
}

export const TOAST_MS = 4000

export const ToastContext = createContext<ToastApi | null>(null)

// A counter rather than Date.now(), so two toasts in the same millisecond keep
// separate keys and dismiss separately.
let nextId = 1

// The toast list itself; ToastProvider uses this directly.
export function useToastState() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message: string, tone: ToastTone = 'error') => {
    const id = nextId++
    setToasts(prev => [...prev, { id, message, tone }])
    setTimeout(() => dismiss(id), TOAST_MS)
  }, [dismiss])

  return { toasts, toast, dismiss }
}

const NO_TOASTS: ToastItem[] = []

export function useToast() {
  const shared = useContext(ToastContext)
  const local = useToastState()
  if (shared) return { toasts: NO_TOASTS, toast: shared.toast, dismiss: shared.dismiss }
  return local
}
