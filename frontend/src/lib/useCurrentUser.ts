import { useEffect, useState } from 'react'
import api from './api'

export interface CurrentUser {
  id: number
  username: string
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    api.get<CurrentUser>('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
  }, [])

  return user
}
