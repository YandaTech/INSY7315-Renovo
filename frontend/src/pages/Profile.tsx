import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'

export default function Profile() {
  const navigate = useNavigate()

  const [firstName, setFirstName]   = useState('Dean')
  const [lastName, setLastName]     = useState('Thiart')
  const [email, setEmail]           = useState('renovocape@gmail.com')
  const [password, setPassword]     = useState('12345678')

  const [editingEmail, setEditingEmail]       = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)

  function handleSave() {
    // for now just navigate back to dashboard
    // real save logic connects to Adam's auth endpoint later
    navigate('/dashboard')
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl">

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-700">
            {firstName.charAt(0)}{lastName.charAt(0)}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {firstName} {lastName}
            </p>
            <p className="text-sm text-gray-500">Manager</p>
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
          <label className="text-sm text-gray-600 mb-1 block">Password</label>
          <div className="flex gap-3">
            <input
              type={editingPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={!editingPassword}
              className={`flex-1 border rounded-lg px-3 py-2 text-sm outline-none transition-colors ${
                editingPassword
                  ? 'border-blue-400 bg-white'
                  : 'border-gray-200 bg-gray-50 text-gray-500'
              }`}
            />
            <button
              onClick={() => setEditingPassword(!editingPassword)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              {editingPassword ? 'Done' : 'Change Password'}
            </button>
          </div>
        </div>

        {/* Save / Cancel */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>

      </div>
    </DashboardLayout>
  )
}