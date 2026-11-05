import { type ReactNode, useMemo } from 'react'
import { ToastContext, useToastState } from '../lib/useToast'
import { Toaster } from './ui'

// One toast stack for the whole app. Mounted once in App, so toasts survive
// closing a modal and moving between pages.
export default function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, toast, dismiss } = useToastState()
  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}
