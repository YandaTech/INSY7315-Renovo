import { createContext, useContext } from 'react'

// The session itself is an httpOnly cookie the backend sets at login: page
// scripts never see the token, so nothing about it is kept in localStorage.
// The dashboard only knows who is logged in by asking /auth/me.

export type Role = 'admin' | 'staff'

export interface CurrentUser {
  id: number
  username: string
  first_name: string | null
  last_name: string | null
  email: string | null
  role: Role
  is_active: boolean
}

export type SessionStatus = 'loading' | 'signed-in' | 'signed-out'

export interface Session {
  status: SessionStatus
  user: CurrentUser | null
  login: (username: string, password: string) => Promise<CurrentUser>
  logout: () => Promise<void>
  setUser: (user: CurrentUser) => void
}

export const SessionContext = createContext<Session | null>(null)

export function useSession(): Session {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession must be used inside <SessionProvider>')
  return session
}

export function isAdmin(user: CurrentUser | null): boolean {
  return user?.role === 'admin'
}

// Older builds kept the JWT here. Remove it so no token lingers in storage.
const LEGACY_TOKEN_KEY = 'renovo_token'

export function forgetLegacyToken() {
  try {
    localStorage.removeItem(LEGACY_TOKEN_KEY)
  } catch {
    // storage unavailable - nothing to clear
  }
}
