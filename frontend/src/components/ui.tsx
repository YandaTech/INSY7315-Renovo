import { statusStyles } from '../lib/status'
import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, useCallback, useId, useState } from 'react'

// Shared building blocks so every page uses the same spacing, colours and
// focus states.

export function Card({ title, subtitle, action, className = '', children }: {
  title?: string
  subtitle?: string
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section className={`bg-white rounded-lg border border-sea-100 p-5 ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {title && <h2 className="font-semibold text-ink">{title}</h2>}
            {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

const buttonStyles = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600',
  secondary: 'bg-white text-ink border border-sea-200 hover:bg-sea-50',
  ghost: 'text-sea-700 hover:bg-sea-50',
}

export function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonStyles
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${buttonStyles[variant]} ${className}`}
      {...props}
    />
  )
}

const controlClass =
  'w-full rounded-md border border-sea-200 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-sea-50 disabled:text-muted'

export function Field({ label, hint, children }: {
  label: string
  hint?: string
  children: (id: string) => ReactNode
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      {children(id)}
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  )
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${controlClass} ${className}`} {...props} />
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${controlClass} ${className}`} {...props} />
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${statusStyles[status] ?? 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
      {status}
    </span>
  )
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-8 h-8 border-4 border-sea-500 border-t-transparent rounded-full animate-spin" />
      {label && <p className="text-sm text-muted">{label}</p>}
    </div>
  )
}

export function Alert({ tone = 'error', children }: { tone?: 'error' | 'success'; children: ReactNode }) {
  const styles = tone === 'error'
    ? 'bg-coral-50 text-coral-700 border-coral-100'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-md border px-4 py-3 text-sm ${styles}`}>
      {children}
    </p>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted text-center py-10">{children}</p>
}

export function PageHeader({ title, subtitle, action }: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Toast ──────────────────────────────────────────────────────────────────
//
// useToast() returns a `toast(message, tone?)` function and a `toasts` list.
// Drop <Toaster toasts={toasts} /> anywhere in the page (once per page).
// Each toast auto-dismisses after 4 seconds.

export type ToastItem = { id: number; message: string; tone: 'error' | 'success' }

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, tone: 'error' | 'success' = 'error') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, tone }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  return { toasts, toast }
}

export function Toaster({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map(t => {
        const styles = t.tone === 'error'
          ? 'bg-coral-50 text-coral-700 border-coral-100'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        return (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className={`rounded-lg border px-4 py-3 text-sm shadow-md pointer-events-auto max-w-sm ${styles}`}
          >
            {t.message}
          </div>
        )
      })}
    </div>
  )
}