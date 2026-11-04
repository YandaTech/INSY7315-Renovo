import { useEffect, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import api from '../lib/api'
import {
  type AuditFilters,
  type AuditPage,
  PAGE_SIZE,
  auditQuery,
  describeEvent,
  eventLabel,
  formatEventTime,
  rangeError,
} from '../lib/audit'
import { type StaffMember, displayName, errorDetail } from '../lib/staff'
import { Alert, Button, Card, EmptyState, Field, Input, PageHeader, Select, Spinner } from '../components/ui'

const NO_FILTERS: AuditFilters = { userId: '', from: '', to: '' }

// Admin only (see AppRoutes). Read-only: the log cannot be edited.
export default function AuditLog() {
  const [filters, setFilters] = useState<AuditFilters>(NO_FILTERS)
  const [offset, setOffset] = useState(0)
  const [page, setPage] = useState<AuditPage | null>(null)
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [people, setPeople] = useState<StaffMember[]>([])

  useEffect(() => {
    api.get<StaffMember[]>('/users/')
      .then(res => setPeople(res.data))
      .catch(() => setPeople([]))
  }, [])

  const invalid = rangeError(filters)
  // Which query the shown page answers; anything else is still loading
  const queryKey = JSON.stringify(auditQuery(filters, offset))
  const loading = loadedKey !== queryKey

  useEffect(() => {
    if (invalid) return
    let cancelled = false
    api.get<AuditPage>('/audit-events/', { params: JSON.parse(queryKey) })
      .then(res => { if (!cancelled) { setPage(res.data); setError('') } })
      .catch(err => { if (!cancelled) setError(errorDetail(err, 'Could not load the audit log')) })
      .finally(() => { if (!cancelled) setLoadedKey(queryKey) })
    return () => { cancelled = true }
  }, [queryKey, invalid])

  function change(next: Partial<AuditFilters>) {
    setFilters(prev => ({ ...prev, ...next }))
    setOffset(0)
  }

  const total = page?.total ?? 0
  const filtered = filters.userId || filters.from || filters.to

  return (
    <DashboardLayout>
      <PageHeader
        title="Audit log"
        subtitle="Sign-ins, account changes, lead deletions and price edits. Entries cannot be changed or removed."
      />

      <Card className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-end">
          <Field label="User">
            {id => (
              <Select id={id} value={filters.userId} onChange={e => change({ userId: e.target.value })}>
                <option value="">Everyone</option>
                {people.map(p => (
                  <option key={p.id} value={String(p.id)}>
                    {displayName(p)} (@{p.username}){p.is_active ? '' : ', deactivated'}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="From">
            {id => <Input id={id} type="date" value={filters.from} max={filters.to || undefined} onChange={e => change({ from: e.target.value })} />}
          </Field>
          <Field label="To">
            {id => <Input id={id} type="date" value={filters.to} min={filters.from || undefined} onChange={e => change({ to: e.target.value })} />}
          </Field>
          <Button variant="secondary" disabled={!filtered} onClick={() => change(NO_FILTERS)}>
            Clear
          </Button>
        </div>
        {invalid && <div className="mt-4"><Alert>{invalid}</Alert></div>}
      </Card>

      <Card
        title="Events"
        subtitle={page && !invalid ? `${total} ${total === 1 ? 'event' : 'events'}${filtered ? ' match' : ''}` : undefined}
      >
        {error && <Alert>{error}</Alert>}
        {!error && loading && !page && <Spinner label="Loading events..." />}
        {!error && page && page.items.length === 0 && <EmptyState>No events for these filters</EmptyState>}
        {!error && page && page.items.length > 0 && (
          <>
            <div className={`overflow-x-auto -mx-5 ${loading ? 'opacity-60' : ''}`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted border-y border-sea-100 bg-sea-50/60">
                    <th className="px-5 py-3 font-medium">Time</th>
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Event</th>
                    <th className="px-5 py-3 font-medium">Details</th>
                    <th className="px-5 py-3 font-medium">IP address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sea-50">
                  {page.items.map(e => (
                    <tr key={e.id}>
                      <td className="px-5 py-3 text-muted whitespace-nowrap tabular-nums">{formatEventTime(e.created_at)}</td>
                      <td className="px-5 py-3 text-ink">{e.actor_username ?? <span className="text-muted">unknown</span>}</td>
                      <td className={`px-5 py-3 font-medium ${e.event.endsWith('failed') ? 'text-coral-700' : 'text-ink'}`}>
                        {eventLabel(e.event)}
                      </td>
                      <td className="px-5 py-3 text-muted">{describeEvent(e)}</td>
                      <td className="px-5 py-3 text-muted tabular-nums">{e.ip_address ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {total > PAGE_SIZE && (
              <div className="flex items-center justify-between gap-3 pt-4">
                <p className="text-xs text-muted">
                  {offset + 1}-{Math.min(offset + PAGE_SIZE, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" disabled={offset === 0 || loading} onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}>
                    Newer
                  </Button>
                  <Button variant="secondary" disabled={offset + PAGE_SIZE >= total || loading} onClick={() => setOffset(offset + PAGE_SIZE)}>
                    Older
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </DashboardLayout>
  )
}
