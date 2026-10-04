import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import DashboardLayout from '../layouts/DashboardLayout'
import api from '../lib/api'
import { useCurrentUser, type CurrentUser } from '../lib/useCurrentUser'
import { Alert, Button, Card, Field, Input, PageHeader, Spinner } from '../components/ui'

function errorDetail(err: unknown, fallback: string) {
  const detail = axios.isAxiosError(err) ? err.response?.data?.detail : null
  return typeof detail === 'string' ? detail : fallback
}

export default function Profile() {
  const { user, setUser } = useCurrentUser()

  return (
    <DashboardLayout>
      {user ? (
        <ProfileForm key={user.id} user={user} onSaved={setUser} />
      ) : (
        <Spinner label="Loading profile..." />
      )}
    </DashboardLayout>
  )
}

function ProfileForm({ user, onSaved }: {
  user: CurrentUser
  onSaved: (user: CurrentUser) => void
}) {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState(user.first_name ?? '')
  const [lastName, setLastName]   = useState(user.last_name ?? '')
  const [email, setEmail]         = useState(user.email ?? '')
  const [editingEmail, setEditingEmail] = useState(false)

  const [editingPassword, setEditingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]         = useState('')

  const [saving, setSaving]   = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const res = await api.patch<CurrentUser>('/auth/me', {
        first_name: firstName,
        last_name: lastName,
        email,
      })
      onSaved(res.data)

      if (editingPassword && newPassword) {
        await api.post('/auth/me/password', {
          current_password: currentPassword,
          new_password: newPassword,
        })
        setEditingPassword(false)
        setCurrentPassword('')
        setNewPassword('')
      }

      setEditingEmail(false)
      setMessage({ ok: true, text: 'Profile saved' })
    } catch (err) {
      setMessage({ ok: false, text: errorDetail(err, 'Could not save profile') })
    } finally {
      setSaving(false)
    }
  }

  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  const initials = (fullName.match(/\b\w/g) ?? [user.username[0]]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="max-w-2xl">
      <PageHeader title="Profile" subtitle="Your details and login." />

      <Card className="mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-sea-200 flex items-center justify-center text-sea-800 text-xl font-semibold">
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold text-ink">{fullName || user.username}</p>
            <p className="text-sm text-muted">@{user.username} · Manager</p>
          </div>
        </div>
      </Card>

      <Card title="Details" className="mb-4">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First name">
              {id => <Input id={id} value={firstName} onChange={e => setFirstName(e.target.value)} />}
            </Field>
            <Field label="Last name">
              {id => <Input id={id} value={lastName} onChange={e => setLastName(e.target.value)} />}
            </Field>
          </div>

          <Field label="Email">
            {id => (
              <div className="flex gap-2">
                <Input
                  id={id}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={!editingEmail}
                />
                <Button variant="secondary" onClick={() => setEditingEmail(!editingEmail)}>
                  {editingEmail ? 'Done' : 'Edit'}
                </Button>
              </div>
            )}
          </Field>
        </div>
      </Card>

      <Card
        title="Password"
        action={
          <Button variant="secondary" onClick={() => setEditingPassword(!editingPassword)}>
            {editingPassword ? 'Cancel' : 'Change password'}
          </Button>
        }
        className="mb-6"
      >
        {editingPassword ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Current password">
              {id => (
                <Input
                  id={id}
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
              )}
            </Field>
            <Field label="New password" hint="At least 6 characters.">
              {id => (
                <Input
                  id={id}
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              )}
            </Field>
          </div>
        ) : (
          <p className="text-sm text-muted">••••••••</p>
        )}
      </Card>

      {message && (
        <div className="mb-4">
          <Alert tone={message.ok ? 'success' : 'error'}>{message.text}</Alert>
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </div>
  )
}
