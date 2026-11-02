import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../lib/api'
import { getToken } from '../lib/auth'
import LoginPage from './LoginPage'

vi.mock('../lib/api', () => ({ default: { post: vi.fn() } }))

const post = vi.mocked(api.post)

function renderLogin() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<p>Dashboard page</p>} />
      </Routes>
    </MemoryRouter>
  )
}

async function fillAndSubmit(username: string, password: string) {
  const user = userEvent.setup()
  if (username) await user.type(screen.getByPlaceholderText('Username'), username)
  if (password) await user.type(screen.getByPlaceholderText('Password'), password)
  await user.click(screen.getByRole('button', { name: 'Log in' }))
}

describe('LoginPage', () => {
  beforeEach(() => {
    post.mockReset()
  })

  it('renders the form', () => {
    renderLogin()
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
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

  it('posts the credentials as a form, stores the token and opens the dashboard', async () => {
    post.mockResolvedValue({ data: { access_token: 'abc123' } })
    renderLogin()
    await fillAndSubmit('thabo', 's3cret')

    expect(post).toHaveBeenCalledTimes(1)
    const [url, body] = post.mock.calls[0]
    expect(url).toBe('/auth/login')
    expect(body).toBeInstanceOf(URLSearchParams)
    expect((body as URLSearchParams).get('username')).toBe('thabo')
    expect((body as URLSearchParams).get('password')).toBe('s3cret')

    expect(await screen.findByText('Dashboard page')).toBeInTheDocument()
    expect(getToken()).toBe('abc123')
  })

  it('shows an error and stays on the page when login fails', async () => {
    post.mockRejectedValue(new Error('401'))
    renderLogin()
    await fillAndSubmit('thabo', 'wrong')

    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect username or password')
    expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled()
    expect(getToken()).toBeNull()
  })
})
