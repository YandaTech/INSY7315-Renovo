import axios from 'axios'
import { clearToken, getToken } from './auth'

// Same-origin /api: proxied by Vite in dev and by nginx in production.
const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// An expired or invalid token sends the user back to log in.
api.interceptors.response.use(
  res => res,
  error => {
    if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) {
      clearToken()
      window.location.assign('/login')
    }
    return Promise.reject(error)
  }
)

export default api
