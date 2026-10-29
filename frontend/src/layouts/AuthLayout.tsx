import { type ReactNode } from 'react'

// Login and sign up: bathroom photo on the left (hidden on phones), form
// card on the right.
export default function AuthLayout({ title, subtitle, children, footer }: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      <div
        className="hidden md:block md:w-1/2 lg:w-3/5 bg-cover bg-center"
        style={{ backgroundImage: "url('/background.png')" }}
        aria-hidden="true"
      />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-sand">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <img src="/renovologo.png" alt="" className="w-11 h-11 object-contain" />
            <span className="text-2xl font-bold tracking-tight text-ink">Renovo Cape</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
          <p className="text-sm text-muted mt-1 mb-8">{subtitle}</p>

          {children}

          <p className="text-sm text-muted mt-6 text-center">{footer}</p>
        </div>
      </div>
    </div>
  )
}
