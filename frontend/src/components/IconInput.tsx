import { type InputHTMLAttributes } from 'react'
import { type LucideIcon } from 'lucide-react'

export default function IconInput({ icon: Icon, label, ...props }: InputHTMLAttributes<HTMLInputElement> & {
  icon: LucideIcon
  label: string
}) {
  return (
    <label className="flex items-center bg-white rounded-md border border-sea-200 px-4 py-3 gap-3 transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
      <Icon size={18} className="text-sea-500 shrink-0" aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <input
        placeholder={label}
        className="flex-1 outline-none text-sm text-ink bg-transparent placeholder:text-muted/70"
        {...props}
      />
    </label>
  )
}
