import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock } from 'lucide-react'
import api from '../lib/api'
import { setToken } from '../lib/auth'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleLogin() {
    if (!username || !password) {
      setError('Please enter your username and password')
      return
    }
    setError('')
    setSubmitting(true)

    try {
      // /auth/login is an OAuth2 password form, not JSON
      const res = await api.post(
        '/auth/login',
        new URLSearchParams({ username, password })
      )
      setToken(res.data.access_token)
      navigate('/dashboard')
    } catch {
      setError('Incorrect username or password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Form panel — sits on top of background image */}
      <div className="w-full md:w-1/2 md:ml-auto flex flex-col items-center justify-center px-10 py-8 bg-white/20 ">

       {/* Logo */}
<div className="flex items-center gap-3 mb-8">
  <img
    src="/renovologo.png"  
    alt="Renovo Cape"
    className="w-10 h-10 object-contain"
  />
  <span className="text-2xl font-bold text-gray-900">
    Renovo Cape
  </span>
</div>
       {/* Username input */}
<div className="w-full max-w-sm mb-3">
  <div className="flex items-center bg-white rounded-xl px-4 py-3 gap-3">
    <User size={18} className="text-gray-400" />
    <input
      type="text"
      placeholder="Username"
      value={username}
      onChange={e => setUsername(e.target.value)}
      className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
    />
  </div>
</div>
       {/* Password input */}
<div className="w-full max-w-sm mb-6">
  <div className="flex items-center bg-white rounded-xl px-4 py-3 gap-3">
    <Lock size={18} className="text-gray-400" />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={e => setPassword(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && handleLogin()}
      className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
    />
  </div>
</div>
        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={submitting}
          className="w-full max-w-sm bg-blue-600 text-white py-3 rounded-xl font-medium text-sm mb-4 hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {submitting ? 'Logging in...' : 'Login'}
        </button>

        {/* Sign up link */}
        <p className="text-sm text-gray-800">
          Don't have an account yet?{' '}
          <a href="/signup" className="text-blue-800 font-medium underline">
            Sign up
          </a>
        </p>

      </div>
    </div>
  )
}