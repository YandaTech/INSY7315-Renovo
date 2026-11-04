import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import api from './api'
import { type CurrentUser, type Session, SessionContext, type SessionStatus, forgetLegacyToken } from './auth'

// Restores the session from the cookie on load (and on refresh) by asking
// /auth/session, and gives every page login, logout and the current user.
// /auth/session answers 200 with user null when nobody is logged in, so
// the login page does not log a failed request.
export default function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading')
  const [user, setUserState] = useState<CurrentUser | null>(null)

  const setUser = useCallback((next: CurrentUser | null) => {
    setUserState(next)
    setStatus(next ? 'signed-in' : 'signed-out')
  }, [])

  useEffect(() => {
    forgetLegacyToken()
    let cancelled = false
    api.get<{ user: CurrentUser | null }>('/auth/session')
      .then(res => { if (!cancelled) setUser(res.data.user) })
      .catch(() => { if (!cancelled) setUser(null) })
    return () => { cancelled = true }
  }, [setUser])

  const login = useCallback(async (username: string, password: string) => {
    // /auth/login is an OAuth2 password form, not JSON. The response sets
    // the session cookie; the token in the body is deliberately ignored.
    await api.post('/auth/login', new URLSearchParams({ username, password }))
    const me = await api.get<CurrentUser>('/auth/me')
    setUser(me.data)
    return me.data
  }, [setUser])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      setUser(null)
    }
  }, [setUser])

  const session = useMemo<Session>(
    () => ({ status, user, login, logout, setUser }),
    [status, user, login, logout, setUser],
  )

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}
