import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock } from 'lucide-react'
import axios from 'axios'
import api from '../lib/api'
import AuthLayout from '../layouts/AuthLayout'
import IconInput from '../components/IconInput'
import { Alert, Button } from '../components/ui'

export default function SignUpPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSignUp(e: FormEvent) {
    e.preventDefault()
    if (username.length < 3 || password.length < 6) {
      setError('Username needs 3+ characters and password 6+ characters')
      return
    }
    setError('')
    setSubmitting(true)

    try {
      await api.post('/auth/register', { username, password })
      navigate('/login')
    } catch (err) {
      const detail = axios.isAxiosError(err) ? err.response?.data?.detail : null
      setError(typeof detail === 'string' ? detail : 'Could not create account')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Set up a staff login for the Renovo Cape dashboard."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSignUp} className="flex flex-col gap-3">
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
          autoComplete="new-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && <Alert>{error}</Alert>}

        <Button type="submit" disabled={submitting} className="mt-3 py-3">
          {submitting ? 'Creating account...' : 'Sign up'}
        </Button>
      </form>
    </AuthLayout>
  )
}
