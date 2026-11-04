import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../lib/api'
import { Route } from 'react-router-dom'
import { admin, meResponder, renderWithSession, staff } from '../test/session'
import ProtectedRoute from './ProtectedRoute'

vi.mock('../lib/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }))

const get = vi.mocked(api.get)

function renderAt(path: string) {
  renderWithSession(
    <>
      <Route path="/login" element={<p>Login page</p>} />
      <Route path="/dashboard" element={<ProtectedRoute><p>Dashboard page</p></ProtectedRoute>} />
      <Route path="/staff" element={<ProtectedRoute adminOnly><p>Staff page</p></ProtectedRoute>} />
    </>,
    path
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => { get.mockReset() })

  it('waits for the session check before deciding', () => {
    get.mockReturnValue(new Promise(() => {}))
    renderAt('/dashboard')
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
  })

  it('sends a logged-out visitor to login', async () => {
    get.mockImplementation(meResponder(null) as typeof api.get)
    renderAt('/dashboard')
    expect(await screen.findByText('Login page')).toBeInTheDocument()
  })

  it('shows the page once the cookie session is confirmed', async () => {
    get.mockImplementation(meResponder(staff) as typeof api.get)
    renderAt('/dashboard')
    expect(await screen.findByText('Dashboard page')).toBeInTheDocument()
  })

  it('keeps staff out of admin pages', async () => {
    get.mockImplementation(meResponder(staff) as typeof api.get)
    renderAt('/staff')
    expect(await screen.findByText('Dashboard page')).toBeInTheDocument()
    expect(screen.queryByText('Staff page')).not.toBeInTheDocument()
  })

  it('lets admins into admin pages', async () => {
    get.mockImplementation(meResponder(admin) as typeof api.get)
    renderAt('/staff')
    expect(await screen.findByText('Staff page')).toBeInTheDocument()
  })
})
