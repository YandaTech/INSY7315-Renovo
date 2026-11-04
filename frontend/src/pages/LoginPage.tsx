import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { User, Lock } from 'lucide-react'
import axios from 'axios'
import { useSession } from '../lib/auth'
import AuthLayout from '../layouts/AuthLayout'
import IconInput from '../components/IconInput'
import { Alert, Button } from '../components/ui'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { status, login } = useSession()

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    if (!username || !password) {
      setError('Please enter your username and password')
      return
    }
    setError('')
    setSubmitting(true)

    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err) {
      const tooMany = axios.isAxiosError(err) && err.response?.status === 429
      setError(tooMany
        ? 'Too many login attempts. Wait a minute and try again.'
        : 'Incorrect username or password')
    } finally {
      setSubmitting(false)
    }
  }

  // Already logged in (e.g. opening / after a refresh): skip the form
  if (status === 'signed-in' && !submitting) {
    return <Navigate to="/dashboard" replace />
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
