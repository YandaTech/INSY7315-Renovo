import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Lock } from 'lucide-react'

export default function SignUpPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  function handleSignUp() {
    // temporary navigate to login
    // real sign up logic connects to Adam's auth endpoint later
    if (username && email && password) {
      navigate('/login')
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
      <div className="w-full md:w-1/2 md:ml-auto flex flex-col items-center justify-center px-10 py-8 bg-white/20">

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

{/* Email input */}
<div className="w-full max-w-sm mb-3">
  <div className="flex items-center bg-white rounded-xl px-4 py-3 gap-3">
    <Mail size={18} className="text-gray-400" />
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={e => setEmail(e.target.value)}
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
      className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
    />
  </div>
</div>

        {/* Sign Up button */}
        <button
          onClick={handleSignUp}
          className="w-full max-w-sm bg-blue-600 text-white py-3 rounded-xl font-medium text-sm mb-4 hover:bg-blue-700 transition-colors"
        >
          Sign Up
        </button>

        {/* Login link */}
        <p className="text-sm text-gray-800">
          Already have an account?{' '}
          <a href="/login" className="text-blue-800 font-medium underline">
            Login
          </a>
        </p>

      </div>
    </div>
  )
}