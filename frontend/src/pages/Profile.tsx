import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import DashboardLayout from '../layouts/DashboardLayout'
import { User } from 'lucide-react'
import api from '../lib/api'
import { useCurrentUser, type CurrentUser } from '../lib/useCurrentUser'

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
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
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

  return (
      <div className="p-6 max-w-2xl">

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
            <User size={36} className="text-blue-700" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {fullName || user.username}
            </p>
            <p className="text-sm text-gray-500">@{user.username}</p>
          </div>
        </div>

        {/* Name fields */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="text-sm text-gray-600 mb-1 block">Email</label>
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={!editingEmail}
              className={`flex-1 border rounded-lg px-3 py-2 text-sm outline-none transition-colors ${
                editingEmail
                  ? 'border-blue-400 bg-white'
                  : 'border-gray-200 bg-gray-50 text-gray-500'
              }`}
            />
            <button
              onClick={() => setEditingEmail(!editingEmail)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              {editingEmail ? 'Done' : 'Edit Email'}
            </button>
          </div>
        </div>

        <hr className="mb-6 border-gray-100" />

        {/* Password */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600">Password</label>
            <button
              onClick={() => setEditingPassword(!editingPassword)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              {editingPassword ? 'Cancel' : 'Change Password'}
            </button>
          </div>
          {editingPassword && (
            <div className="grid grid-cols-2 gap-4">
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="border border-blue-400 rounded-lg px-3 py-2 text-sm outline-none"
              />
              <input
                type="password"
                placeholder="New password (6+ characters)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="border border-blue-400 rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
          )}
        </div>

        {/* Save / Cancel */}
        <div className="flex gap-3 justify-end items-center">
          {message && (
            <p className={`text-sm ${message.ok ? 'text-green-600' : 'text-red-500'}`}>
              {message.text}
            </p>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
  )
}
