import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './api'
import { useSession } from './auth'
import SessionProvider from './SessionProvider'
import { admin, meResponder } from '../test/session'

vi.mock('./api', () => ({ default: { get: vi.fn(), post: vi.fn() } }))

const get = vi.mocked(api.get)
const post = vi.mocked(api.post)

function Probe() {
  const { status, user, logout } = useSession()
  return (
    <div>
      <p>status: {status}</p>
      <p>user: {user?.username ?? 'none'}</p>
      <button onClick={() => logout()}>Log out</button>
    </div>
  )
}

describe('SessionProvider', () => {
  beforeEach(() => {
    get.mockReset()
    post.mockReset()
  })

  it('restores the session from the cookie on load (page refresh)', async () => {
    get.mockImplementation(meResponder(admin) as typeof api.get)
    render(<SessionProvider><Probe /></SessionProvider>)

    expect(screen.getByText('status: loading')).toBeInTheDocument()
    expect(await screen.findByText('status: signed-in')).toBeInTheDocument()
    expect(screen.getByText('user: thabo')).toBeInTheDocument()
    expect(get).toHaveBeenCalledWith('/auth/me')
  })

  it('is signed out when there is no valid cookie', async () => {
    get.mockImplementation(meResponder(null) as typeof api.get)
    render(<SessionProvider><Probe /></SessionProvider>)
    expect(await screen.findByText('status: signed-out')).toBeInTheDocument()
  })

  it('deletes a token left in localStorage by an older build', async () => {
    localStorage.setItem('renovo_token', 'old.jwt.value')
    get.mockImplementation(meResponder(null) as typeof api.get)
    render(<SessionProvider><Probe /></SessionProvider>)
    await screen.findByText('status: signed-out')
    expect(localStorage.getItem('renovo_token')).toBeNull()
  })

  it('logs out on the server and forgets the user', async () => {
    get.mockImplementation(meResponder(admin) as typeof api.get)
    post.mockResolvedValue({ data: {} })
    render(<SessionProvider><Probe /></SessionProvider>)
    await screen.findByText('status: signed-in')

    await userEvent.click(screen.getByRole('button', { name: 'Log out' }))
    expect(post).toHaveBeenCalledWith('/auth/logout')
    await waitFor(() => expect(screen.getByText('status: signed-out')).toBeInTheDocument())
    expect(screen.getByText('user: none')).toBeInTheDocument()
  })
})
