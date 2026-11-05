import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../lib/api'
import { admin, meResponder, renderWithSession, staff } from '../test/session'
import DashboardLayout from './DashboardLayout'

vi.mock('../lib/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }))

const get = vi.mocked(api.get)
const post = vi.mocked(api.post)

function renderLayout(path = '/dashboard') {
  renderWithSession(
    <>
      <Route path="/dashboard" element={<DashboardLayout><p>Page body</p></DashboardLayout>} />
      <Route path="/staff" element={<DashboardLayout><p>Staff body</p></DashboardLayout>} />
      <Route path="/statistics" element={<DashboardLayout><p>Statistics body</p></DashboardLayout>} />
      <Route path="/login" element={<p>Login page</p>} />
    </>,
    path
  )
}

function crumbs() {
  const trail = screen.getByRole('navigation', { name: 'Breadcrumb' })
  return within(trail).getAllByRole('listitem').map(li => li.textContent)
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

  describe('breadcrumbs', () => {
    it('shows Home › Admin › Staff on the Staff page, with the page marked current', async () => {
      get.mockImplementation(meResponder(admin) as typeof api.get)
      renderLayout('/staff')
      await screen.findByText('Staff body')
      expect(crumbs()).toEqual(['Home', 'Admin', 'Staff'])
      const trail = screen.getByRole('navigation', { name: 'Breadcrumb' })
      expect(within(trail).getByText('Staff')).toHaveAttribute('aria-current', 'page')
      expect(within(trail).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/dashboard')
      expect(document.title).toBe('Staff · Renovo Cape')
    })

    it('shows Home › Statistics on a staff page', async () => {
      get.mockImplementation(meResponder(staff) as typeof api.get)
      renderLayout('/statistics')
      await screen.findByText('Statistics body')
      expect(crumbs()).toEqual(['Home', 'Statistics'])
    })

    it('shows only Home, as the current page, on the dashboard', async () => {
      get.mockImplementation(meResponder(staff) as typeof api.get)
      renderLayout()
      await screen.findByText('Page body')
      expect(crumbs()).toEqual(['Home'])
      const trail = screen.getByRole('navigation', { name: 'Breadcrumb' })
      expect(within(trail).queryByRole('link')).not.toBeInTheDocument()
      expect(within(trail).getByText('Home')).toHaveAttribute('aria-current', 'page')
      expect(document.title).toBe('Dashboard · Renovo Cape')
    })
  })
})
