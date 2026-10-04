import { useEffect, useState } from 'react'
import api from './api'

export interface CurrentUser {
  id: number
  username: string
  first_name: string | null
  last_name: string | null
  email: string | null
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)


  useEffect(() => {
    api.get<CurrentUser>('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
  }, [])

  return { user, setUser }
}
