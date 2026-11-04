import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock } from 'lucide-react'
import axios from 'axios'
import api from '../lib/api'
import AuthLayout from '../layouts/AuthLayout'
import IconInput from '../components/IconInput'
import { Alert, Button, Spinner } from '../components/ui'

export default function SignUpPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // Sign-up is only open until the first staff account exists
  const [open, setOpen] = useState<boolean | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get<{ open: boolean }>('/auth/registration-open')
      .then(res => setOpen(res.data.open))
      .catch(() => setOpen(true))
  }, [])

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
      title={open === false ? 'Sign up is closed' : 'Create the first account'}
      subtitle={
        open === false
          ? 'Accounts are added by your team. Ask an admin to add you from the Staff page.'
          : 'Set up the owner login for the Renovo Cape dashboard. More people can be added from the Staff page afterwards.'
      }
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {open === null && <Spinner />}
      {open && (
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
      )}
    </AuthLayout>
  )
}
