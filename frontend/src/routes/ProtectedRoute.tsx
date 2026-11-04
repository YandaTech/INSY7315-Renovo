import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { isAdmin, useSession } from '../lib/auth'
import { Spinner } from '../components/ui'

// Pages for logged-in users. adminOnly pages send staff to the dashboard;
// the backend refuses their requests anyway, this just hides the page.
export default function ProtectedRoute({ children, adminOnly = false }: {
  children: ReactNode
  adminOnly?: boolean
}) {
  const { status, user } = useSession()

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>
  }
  if (status === 'signed-out') {
    return <Navigate to="/login" replace />
  }
  if (adminOnly && !isAdmin(user)) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}
