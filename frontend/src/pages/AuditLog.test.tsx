import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../lib/api'
import type { AuditPage } from '../lib/audit'
import ProtectedRoute from '../routes/ProtectedRoute'
import { admin, meResponder, renderWithSession, staff } from '../test/session'
import AuditLog from './AuditLog'

vi.mock('../lib/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }))

const get = vi.mocked(api.get)

const page: AuditPage = {
  total: 2,
  items: [
    {
      id: 2, created_at: '2026-11-04T08:30:00+00:00', event: 'user_deactivated', actor_id: 1,
      actor_username: 'thabo', ip_address: '203.0.113.9', target_type: 'user', target_id: '2',
      details: { username: 'lindi' },
    },
    {
      id: 1, created_at: '2026-11-04T08:00:00+00:00', event: 'login_failed', actor_id: null,
      actor_username: null, ip_address: '198.51.100.4', target_type: null, target_id: null,
      details: { reason: 'unknown_user' },
    },
  ],
}

// Every /audit-events request, with its params
function auditCalls() {
  return get.mock.calls
    .filter(([url]) => url === '/audit-events/')
    .map(([, config]) => (config as { params: Record<string, unknown> }).params)
}

function renderAudit(user = admin) {
  get.mockImplementation(meResponder(user, { '/users/': [admin, staff], '/audit-events/': page }) as typeof api.get)
  renderWithSession(
    <>
      <Route path="/audit" element={<ProtectedRoute adminOnly><AuditLog /></ProtectedRoute>} />
      <Route path="/dashboard" element={<p>Dashboard page</p>} />
    </>,
    '/audit'
  )
}

describe('Audit log page', () => {
  beforeEach(() => { get.mockReset() })

  it('is not shown to staff', async () => {
    renderAudit(staff)
    expect(await screen.findByText('Dashboard page')).toBeInTheDocument()
    expect(auditCalls()).toEqual([])
  })

  it('shows events with who, what and where from', async () => {
    renderAudit()
    expect(await screen.findByText('Account deactivated')).toBeInTheDocument()
    expect(screen.getByText('lindi')).toBeInTheDocument()
    expect(screen.getByText('203.0.113.9')).toBeInTheDocument()
    expect(screen.getByText('Failed login')).toBeInTheDocument()
    expect(screen.getByText('unknown username')).toBeInTheDocument()
    expect(screen.getByText('unknown')).toBeInTheDocument()
    expect(screen.getByText('2 events')).toBeInTheDocument()
    // Read-only: nothing to edit or delete
    expect(screen.queryByRole('button', { name: /delete|edit/i })).not.toBeInTheDocument()
  })

  it('filters by user and date range', async () => {
    renderAudit()
    const user = userEvent.setup()
    await screen.findByText('Account deactivated')

    await user.selectOptions(screen.getByLabelText('User'), String(staff.id))
    await waitFor(() => expect(auditCalls().at(-1)).toMatchObject({ actor_id: staff.id, offset: 0 }))

    await user.type(screen.getByLabelText('From'), '2026-11-01')
    await user.type(screen.getByLabelText('To'), '2026-11-03')
    await waitFor(() => expect(auditCalls().at(-1)).toEqual({
      actor_id: staff.id,
      limit: 50,
      offset: 0,
      start: new Date(2026, 10, 1).toISOString(),
      end: new Date(2026, 10, 4).toISOString(),
    }))
    expect(await screen.findByText('2 events match')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear' }))
    await waitFor(() => expect(auditCalls().at(-1)).toEqual({ limit: 50, offset: 0 }))
  })

  it('does not query a backwards date range', async () => {
    renderAudit()
    const user = userEvent.setup()
    await screen.findByText('Account deactivated')

    await user.type(screen.getByLabelText('To'), '2026-11-01')
    const before = auditCalls().length
    await user.type(screen.getByLabelText('From'), '2026-11-05')
    expect(await screen.findByRole('alert')).toHaveTextContent('The start date is after the end date')
    expect(auditCalls().length).toBe(before)
  })
})
