import { render } from '@testing-library/react'
import { type ReactNode } from 'react'
import { MemoryRouter, Routes } from 'react-router-dom'
import type { CurrentUser } from '../lib/auth'
import SessionProvider from '../lib/SessionProvider'

// Helpers for tests that need a logged-in (or logged-out) session. Tests
// mock ../lib/api themselves with vi.mock and pass the mocked get here.

export const admin: CurrentUser = {
  id: 1,
  username: 'thabo',
  first_name: 'Thabo',
  last_name: null,
  email: null,
  role: 'admin',
  is_active: true,
}

export const staff: CurrentUser = { ...admin, id: 2, username: 'lindi', first_name: 'Lindi', role: 'staff' }

type Get = (url: string, config?: unknown) => Promise<unknown>

// Answers /auth/session with `user`, /auth/me with `user` (or 401 when
// null) and other GETs via `rest`.
export function meResponder(user: CurrentUser | null, rest: Record<string, unknown> = {}): Get {
  return async (url: string) => {
    if (url === '/auth/session') return { data: { user } }
    if (url === '/auth/me') {
      if (user) return { data: user }
      throw Object.assign(new Error('401'), { isAxiosError: true, response: { status: 401 } })
    }
    for (const [prefix, data] of Object.entries(rest)) {
      if (url.startsWith(prefix)) return { data }
    }
    throw new Error(`unexpected GET ${url}`)
  }
}

export function renderWithSession(routes: ReactNode, path: string) {
  return render(
    <SessionProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>{routes}</Routes>
      </MemoryRouter>
    </SessionProvider>
  )
}

