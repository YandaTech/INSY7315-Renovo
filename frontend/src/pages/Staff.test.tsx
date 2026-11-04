import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../lib/api'
import ProtectedRoute from '../routes/ProtectedRoute'
import { admin, meResponder, renderWithSession, staff } from '../test/session'
import Staff from './Staff'

vi.mock('../lib/api', () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }))

const get = vi.mocked(api.get)
const post = vi.mocked(api.post)
const patch = vi.mocked(api.patch)

function renderStaffPage() {
  renderWithSession(
    <>
      <Route path="/staff" element={<ProtectedRoute adminOnly><Staff /></ProtectedRoute>} />
      <Route path="/dashboard" element={<p>Dashboard page</p>} />
    </>,
    '/staff'
  )
}

function row(username: string) {
  return screen.getByText(`@${username}`).closest('tr') as HTMLElement
}

describe('Staff page', () => {
  beforeEach(() => {
    get.mockReset()
    post.mockReset()
    patch.mockReset()
  })

  it('is not shown to staff', async () => {
    get.mockImplementation(meResponder(staff, { '/users/': [admin, staff] }) as typeof api.get)
    renderStaffPage()
    expect(await screen.findByText('Dashboard page')).toBeInTheDocument()
    expect(get).not.toHaveBeenCalledWith('/users/')
  })

  it('lists the team and protects the admin from locking themselves out', async () => {
    get.mockImplementation(meResponder(admin, { '/users/': [staff, admin] }) as typeof api.get)
    renderStaffPage()

    await screen.findByText('@lindi')
    const me = row('thabo')
    expect(within(me).getByText('(you)')).toBeInTheDocument()
    expect(within(me).getByRole('combobox')).toBeDisabled()
    expect(within(me).queryByRole('button', { name: 'Deactivate' })).not.toBeInTheDocument()

    expect(within(row('lindi')).getByRole('combobox')).toBeEnabled()
  })

  it('adds a staff member', async () => {
    get.mockImplementation(meResponder(admin, { '/users/': [admin] }) as typeof api.get)
    post.mockResolvedValue({ data: { ...staff, id: 9, username: 'sipho', first_name: null } })
    renderStaffPage()
    const user = userEvent.setup()

    await user.type(await screen.findByLabelText('Username'), 'sipho')
    await user.type(screen.getByLabelText('Temporary password'), 'Temp1234')
    await user.click(screen.getByRole('button', { name: 'Add team member' }))

    expect(post).toHaveBeenCalledWith('/users/', { username: 'sipho', password: 'Temp1234', role: 'staff' })
    expect(await screen.findByText('@sipho')).toBeInTheDocument()
    expect(screen.getByText(/Added sipho/)).toBeInTheDocument()
  })

  it('changes a role', async () => {
    get.mockImplementation(meResponder(admin, { '/users/': [admin, staff] }) as typeof api.get)
    patch.mockResolvedValue({ data: { ...staff, role: 'admin' } })
    renderStaffPage()
    const user = userEvent.setup()

    await screen.findByText('@lindi')
    await user.selectOptions(within(row('lindi')).getByRole('combobox'), 'admin')

    expect(patch).toHaveBeenCalledWith('/users/2', { role: 'admin' })
    expect(await screen.findByText('Lindi is now admin')).toBeInTheDocument()
  })

  it('deactivates someone after a confirmation', async () => {
    get.mockImplementation(meResponder(admin, { '/users/': [admin, staff] }) as typeof api.get)
    patch.mockResolvedValue({ data: { ...staff, is_active: false } })
    renderStaffPage()
    const user = userEvent.setup()

    await screen.findByText('@lindi')
    await user.click(within(row('lindi')).getByRole('button', { name: 'Deactivate' }))
    expect(patch).not.toHaveBeenCalled()
    await user.click(within(row('lindi')).getByRole('button', { name: 'Deactivate lindi' }))

    expect(patch).toHaveBeenCalledWith('/users/2', { is_active: false })
    expect(await screen.findByText('Deactivated')).toBeInTheDocument()
    expect(within(row('lindi')).getByRole('button', { name: 'Reactivate' })).toBeInTheDocument()
  })

  it('shows the reason when the server refuses a change', async () => {
    get.mockImplementation(meResponder(admin, { '/users/': [admin, staff] }) as typeof api.get)
    patch.mockRejectedValue(Object.assign(new Error('400'), {
      isAxiosError: true,
      response: { status: 400, data: { detail: 'You cannot remove your own admin role' } },
    }))
    renderStaffPage()
    const user = userEvent.setup()

    await screen.findByText('@lindi')
    await user.selectOptions(within(row('lindi')).getByRole('combobox'), 'admin')
    expect(await screen.findByRole('alert')).toHaveTextContent('You cannot remove your own admin role')
  })
})
