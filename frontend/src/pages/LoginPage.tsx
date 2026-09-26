import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  function handleLogin() {
    // for now just navigate to dashboard
    // real login logic connects to Adam's auth endpoint later
    if (username && password) {
      navigate('/dashboard')
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
            <span className="text-gray-400 text-lg">👤</span>
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
            <span className="text-gray-400 text-lg">🔒</span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
            />
          </div>
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          className="w-full max-w-sm bg-blue-600 text-white py-3 rounded-xl font-medium text-sm mb-4 hover:bg-blue-700 transition-colors"
        >
          Login
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