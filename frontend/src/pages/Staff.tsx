import { type FormEvent, useCallback, useEffect, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import api from '../lib/api'
import { type Role, useSession } from '../lib/auth'
import {
  MIN_PASSWORD_LENGTH,
  type StaffMember,
  displayName,
  errorDetail,
  isSelf,
  roleLabels,
  sortStaff,
  validateNewMember,
} from '../lib/staff'
import { useToast } from '../lib/useToast'
import { Alert, Button, Card, EmptyState, Field, Input, PageHeader, Select, Spinner, Toaster } from '../components/ui'
import ResetPasswordDialog from '../components/ResetPasswordDialog'

// Admin only (see AppRoutes): add people, change roles, reset passwords,
// deactivate.
export default function Staff() {
  const { user: me } = useSession()
  const [members, setMembers] = useState<StaffMember[] | null>(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const [resetting, setResetting] = useState<StaffMember | null>(null)
  const { toasts, toast } = useToast()

  const load = useCallback(() => {
    api.get<StaffMember[]>('/users/')
      .then(res => { setMembers(res.data); setError('') })
      .catch(err => setError(errorDetail(err, 'Could not load the team')))
  }, [])

  useEffect(load, [load])

  async function update(member: StaffMember, changes: Partial<Pick<StaffMember, 'role' | 'is_active'>>) {
    setBusyId(member.id)
    try {
      const res = await api.patch<StaffMember>(`/users/${member.id}`, changes)
      setMembers(prev => prev?.map(m => (m.id === member.id ? res.data : m)) ?? null)
      const name = displayName(res.data)
      if (changes.role) toast(`${name} is now ${roleLabels[changes.role].toLowerCase()}`, 'success')
      if (changes.is_active === false) toast(`${name} is deactivated and logged out`, 'success')
      if (changes.is_active === true) toast(`${name} can log in again`, 'success')
    } catch (err) {
      toast(errorDetail(err, 'Could not save the change'))
    } finally {
      setBusyId(null)
      setConfirmingId(null)
    }
  }

  return (
    <DashboardLayout>
      <PageHeader title="Staff" subtitle="Who can log in to the dashboard, and what they can change." />

      <AddMember onAdded={member => {
        setMembers(prev => (prev ? [...prev, member] : [member]))
        toast(`Added ${member.username}. Share the temporary password with them securely.`, 'success')
      }} />

      <Card title="Team" subtitle="Admins manage staff and prices. Staff work leads and calls.">
        {error && <Alert>{error}</Alert>}
        {!error && members === null && <Spinner label="Loading team..." />}
        {members && members.length === 0 && <EmptyState>No accounts yet</EmptyState>}
        {members && members.length > 0 && (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted border-y border-sea-100 bg-sea-50/60">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sea-50">
                {sortStaff(members).map(member => {
                  const self = isSelf(member, me)
                  const busy = busyId === member.id
                  return (
                    <tr key={member.id} className={member.is_active ? '' : 'text-muted'}>
                      <td className="px-5 py-3">
                        <p className={`font-medium ${member.is_active ? 'text-ink' : 'text-muted'}`}>
                          {displayName(member)}{self && <span className="text-muted font-normal"> (you)</span>}
                        </p>
                        <p className="text-xs text-muted">@{member.username}</p>
                      </td>
                      <td className="px-5 py-3 w-40">
                        <Select
                          aria-label={`Role for ${member.username}`}
                          value={member.role}
                          disabled={self || busy || !member.is_active}
                          title={self ? 'You cannot change your own role' : undefined}
                          onChange={e => update(member, { role: e.target.value as Role })}
                        >
                          <option value="staff">{roleLabels.staff}</option>
                          <option value="admin">{roleLabels.admin}</option>
                        </Select>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          member.is_active
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                            : 'bg-slate-100 text-slate-600 ring-slate-200'
                        }`}>
                          {member.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        {/* No actions on your own row: admins change their own
                            password on Profile and cannot deactivate themselves */}
                        {!self && (
                          <div className="flex items-center justify-end gap-1">
                            {confirmingId === member.id ? (
                              <>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => update(member, { is_active: false })}
                                  className="text-xs font-medium px-2 py-1 rounded bg-coral-500 text-white hover:bg-coral-600 disabled:opacity-60"
                                >
                                  {busy ? 'Deactivating...' : `Deactivate ${member.username}`}
                                </button>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => setConfirmingId(null)}
                                  className="text-xs font-medium px-2 py-1 rounded text-muted hover:bg-sea-50"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <Button variant="ghost" disabled={busy} onClick={() => setResetting(member)}>
                                  Reset password
                                </Button>
                                {member.is_active ? (
                                  <Button variant="ghost" disabled={busy} onClick={() => setConfirmingId(member.id)}>
                                    Deactivate
                                  </Button>
                                ) : (
                                  <Button variant="secondary" disabled={busy} onClick={() => update(member, { is_active: true })}>
                                    Reactivate
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {resetting && (
        <ResetPasswordDialog
          member={resetting}
          onClose={() => setResetting(null)}
          onReset={member => {
            setResetting(null)
            toast(`Password reset for ${displayName(member)}. They are logged out; share the new temporary password with them securely.`, 'success')
          }}
        />
      )}

      <Toaster toasts={toasts} />
    </DashboardLayout>
  )
}

function AddMember({ onAdded }: { onAdded: (member: StaffMember) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole]         = useState<Role>('staff')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    const problem = validateNewMember(username, password)
    if (problem) {
      setError(problem)
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await api.post<StaffMember>('/users/', { username: username.trim(), password, role })
      onAdded(res.data)
      setUsername('')
      setPassword('')
      setRole('staff')
    } catch (err) {
      setError(errorDetail(err, 'Could not add team member'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="Add a team member" subtitle="Creates a login for someone else on your team." className="mb-6">
      <form onSubmit={handleAdd} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Username">
            {id => <Input id={id} autoComplete="off" value={username} onChange={e => setUsername(e.target.value)} />}
          </Field>
          <Field label="Temporary password" hint={`At least ${MIN_PASSWORD_LENGTH} characters. They can change it on their Profile.`}>
            {id => (
              <Input
                id={id}
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            )}
          </Field>
          <Field label="Role">
            {id => (
              <Select id={id} value={role} onChange={e => setRole(e.target.value as Role)}>
                <option value="staff">{roleLabels.staff}</option>
                <option value="admin">{roleLabels.admin}</option>
              </Select>
            )}
          </Field>
        </div>
        {error && <Alert>{error}</Alert>}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Adding...' : 'Add team member'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
