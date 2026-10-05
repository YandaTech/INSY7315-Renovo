import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import api from '../lib/api'

export default function Profile() {
  const navigate = useNavigate()

  const [username, setUsername]         = useState('')
  const [firstName, setFirstName]       = useState('')
  const [lastName, setLastName]         = useState('')
  const [password, setPassword]         = useState('')
  const [editingPassword, setEditingPassword] = useState(false)
  const [successMessage, setSuccessMessage]   = useState('')
  const [error, setError]               = useState('')

  // load the current logged in user
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    api.get('/auth/me')
      .then(res => {
        setUsername(res.data.username)
        // split username into first and last name if it contains a space
        const parts = res.data.username.split(' ')
        setFirstName(parts[0] || res.data.username)
        setLastName(parts[1] || '')
      })
      .catch(() => navigate('/login'))
  }, [])

  function handleSave() {
    // real save logic will connect to Adam's update endpoint later
    setSuccessMessage('Profile updated successfully')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl">

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
            <User size={36} className="text-blue-700" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {firstName} {lastName}
            </p>
            <p className="text-sm text-gray-500">Administrator</p>
          </div>
        </div>

        {/* Username — read only, comes from backend */}
        <div className="mb-6">
          <label className="text-sm text-gray-600 mb-1 block">Username</label>
          <input
            type="text"
            value={username}
            disabled
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Username cannot be changed
          </p>
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

        <hr className="mb-6 border-gray-100" />

        {/* Password */}
        <div className="mb-8">
          <label className="text-sm text-gray-600 mb-1 block">Password</label>
          <div className="flex gap-3">
            <input
              type={editingPassword ? 'text' : 'password'}
              value={editingPassword ? password : '••••••••'}
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

        {/* Success message */}
        {successMessage && (
          <p className="text-sm text-green-500 mb-4">{successMessage}</p>
        )}

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

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