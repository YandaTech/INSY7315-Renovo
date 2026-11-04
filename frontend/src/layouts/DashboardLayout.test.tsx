import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../lib/api'
import { admin, meResponder, renderWithSession, staff } from '../test/session'
import DashboardLayout from './DashboardLayout'

vi.mock('../lib/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }))

const get = vi.mocked(api.get)
const post = vi.mocked(api.post)

function renderLayout() {
  renderWithSession(
    <>
      <Route path="/dashboard" element={<DashboardLayout><p>Page body</p></DashboardLayout>} />
      <Route path="/login" element={<p>Login page</p>} />
    </>,
    '/dashboard'
  )
}

describe('DashboardLayout', () => {
  beforeEach(() => {
    get.mockReset()
    post.mockReset()
  })

  it('shows admin pages in the menu for admins', async () => {
    get.mockImplementation(meResponder(admin) as typeof api.get)
    renderLayout()
    expect(await screen.findByRole('button', { name: 'Staff' })).toBeInTheDocument()
  })

  it('hides admin pages from staff', async () => {
    get.mockImplementation(meResponder(staff) as typeof api.get)
    renderLayout()
    await screen.findByText('Page body')
    await screen.findByRole('button', { name: 'Pricing' })
    expect(screen.queryByRole('button', { name: 'Staff' })).not.toBeInTheDocument()
  })

  it('logs out on the server and returns to login', async () => {
    get.mockImplementation(meResponder(staff) as typeof api.get)
    post.mockResolvedValue({ data: {} })
    renderLayout()
    await userEvent.click(await screen.findByRole('button', { name: 'Log Out' }))
    expect(post).toHaveBeenCalledWith('/auth/logout')
    expect(await screen.findByText('Login page')).toBeInTheDocument()
  })
})
