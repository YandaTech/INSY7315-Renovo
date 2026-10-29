import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock } from 'lucide-react'
import api from '../lib/api'
import { setToken } from '../lib/auth'
import AuthLayout from '../layouts/AuthLayout'
import IconInput from '../components/IconInput'
import { Alert, Button } from '../components/ui'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
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
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see your leads and calls."
      footer={
        <>
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-brand-600 font-medium hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <IconInput
          icon={User}
          label="Username"
          autoComplete="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <IconInput
          icon={Lock}
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && <Alert>{error}</Alert>}

        <Button type="submit" disabled={submitting} className="mt-3 py-3">
          {submitting ? 'Logging in...' : 'Log in'}
        </Button>
      </form>
    </AuthLayout>
  )
}
