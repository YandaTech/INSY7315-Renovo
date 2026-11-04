import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../lib/api'
import { Route } from 'react-router-dom'
import { admin, meResponder, renderWithSession } from '../test/session'
import LoginPage from './LoginPage'

vi.mock('../lib/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }))

const get = vi.mocked(api.get)
const post = vi.mocked(api.post)

function renderLogin() {
  renderWithSession(
    <>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<p>Dashboard page</p>} />
    </>,
    '/login'
  )
}

async function fillAndSubmit(username: string, password: string) {
  const user = userEvent.setup()
  if (username) await user.type(await screen.findByPlaceholderText('Username'), username)
  if (password) await user.type(screen.getByPlaceholderText('Password'), password)
  await user.click(screen.getByRole('button', { name: 'Log in' }))
}

describe('LoginPage', () => {
  beforeEach(() => {
    post.mockReset()
    get.mockReset()
    get.mockImplementation(meResponder(null) as typeof api.get)
  })

  it('renders the form', async () => {
    renderLogin()
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled()
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup')
  })

  it('asks for both fields before calling the API', async () => {
    renderLogin()
    await fillAndSubmit('thabo', '')
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter your username and password')
    expect(post).not.toHaveBeenCalled()
  })

  it('posts the credentials as a form, keeps no token and opens the dashboard', async () => {
    post.mockResolvedValue({ data: { access_token: 'abc123' } })
    renderLogin()
    await screen.findByPlaceholderText('Username')
    // The cookie is set now, so /auth/me answers
    get.mockImplementation(meResponder(admin) as typeof api.get)
    await fillAndSubmit('thabo', 's3cret')

    expect(post).toHaveBeenCalledTimes(1)
    const [url, body] = post.mock.calls[0]
    expect(url).toBe('/auth/login')
    expect(body).toBeInstanceOf(URLSearchParams)
    expect((body as URLSearchParams).get('username')).toBe('thabo')
    expect((body as URLSearchParams).get('password')).toBe('s3cret')

    expect(await screen.findByText('Dashboard page')).toBeInTheDocument()
    // The session is the httpOnly cookie: nothing is stored by the page
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
  })

  it('shows an error and stays on the page when login fails', async () => {
    post.mockRejectedValue(new Error('401'))
    renderLogin()
    await fillAndSubmit('thabo', 'wrong')

    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect username or password')
    expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled()
    expect(localStorage.length).toBe(0)
  })

  it('says to wait when the login rate limit is hit', async () => {
    post.mockRejectedValue(Object.assign(new Error('429'), { isAxiosError: true, response: { status: 429 } }))
    renderLogin()
    await fillAndSubmit('thabo', 'wrong')
    expect(await screen.findByRole('alert')).toHaveTextContent('Too many login attempts')
  })

  it('goes straight to the dashboard when the session is still valid', async () => {
    get.mockImplementation(meResponder(admin) as typeof api.get)
    renderLogin()
    expect(await screen.findByText('Dashboard page')).toBeInTheDocument()
  })
})
