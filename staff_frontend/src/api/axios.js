import axios from 'axios'

const API = axios.create({
  baseURL: '/api',
})

API.interceptors.request.use((config) => {
  const tokens = JSON.parse(localStorage.getItem('staff_tokens') || '{}')
  if (tokens.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`
  }
  return config
})

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const tokens = JSON.parse(localStorage.getItem('staff_tokens') || '{}')
      if (tokens.refresh) {
        try {
          const { data } = await axios.post('/api/staff/token/refresh/', {
            refresh: tokens.refresh,
          })
          const newTokens = { ...tokens, access: data.access }
          localStorage.setItem('staff_tokens', JSON.stringify(newTokens))
          original.headers.Authorization = `Bearer ${data.access}`
          return API(original)
        } catch {
          localStorage.removeItem('staff_tokens')
          localStorage.removeItem('staff_user')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

export default API
