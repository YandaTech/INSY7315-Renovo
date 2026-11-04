import { describe, expect, it } from 'vitest'
import api from './api'

describe('api client', () => {
  it('sends the session cookie and no Authorization header', async () => {
    localStorage.setItem('renovo_token', 'stale.jwt')
    let seen: { withCredentials?: boolean; authorization?: unknown } = {}
    await api.get('/auth/me', {
      adapter: async config => {
        seen = { withCredentials: config.withCredentials, authorization: config.headers.Authorization }
        return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
      },
    })
    expect(api.defaults.baseURL).toBe('/api')
    expect(seen.withCredentials).toBe(true)
    expect(seen.authorization).toBeUndefined()
  })
})
