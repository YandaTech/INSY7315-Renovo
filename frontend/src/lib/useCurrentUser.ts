import { useSession } from './auth'

export type { CurrentUser } from './auth'

// The logged-in user, loaded once by SessionProvider from /auth/me.
export function useCurrentUser() {
  const { user, setUser } = useSession()
  return { user, setUser }
}
