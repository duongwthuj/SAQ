import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('staff_user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (user) localStorage.setItem('staff_user', JSON.stringify(user))
    else localStorage.removeItem('staff_user')
  }, [user])

  const login = async (username, password) => {
    const { data } = await API.post('/staff/login/', { username, password })
    localStorage.setItem('staff_tokens', JSON.stringify(data.tokens))
    setUser(data.user)
    return data
  }

  const register = async (payload) => {
    const { data } = await API.post('/staff/register/', payload)
    localStorage.setItem('staff_tokens', JSON.stringify(data.tokens))
    setUser(data.user)
    return data
  }

  const logout = async () => {
    const tokens = JSON.parse(localStorage.getItem('staff_tokens') || '{}')
    try { await API.post('/staff/logout/', { refresh: tokens.refresh }) } catch {}
    localStorage.removeItem('staff_tokens')
    localStorage.removeItem('staff_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
