import axios from 'axios'

// Same-origin /api: proxied by Vite in dev and by nginx in production.
// The session is an httpOnly cookie the browser sends by itself;
// withCredentials keeps it on requests even if the API moves origin.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

// An expired session, or an account an admin deactivated, sends the user
// back to log in. /auth/* answers 401 as part of normal use (wrong password,
// "not logged in yet"), so those are left to the caller.
api.interceptors.response.use(
  res => res,
  error => {
    if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) {
      window.location.assign('/login')
    }
    return Promise.reject(error)
  }
)

export default api
