import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('customer_user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      localStorage.setItem('customer_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('customer_user')
    }
  }, [user])

  const login = async (username, password) => {
    const { data } = await API.post('/customers/login/', { username, password })
    localStorage.setItem('customer_tokens', JSON.stringify(data.tokens))
    setUser(data.user)
    return data
  }

  const register = async (payload) => {
    const { data } = await API.post('/customers/register/', payload)
    localStorage.setItem('customer_tokens', JSON.stringify(data.tokens))
    setUser(data.user)
    return data
  }

  const logout = async () => {
    const tokens = JSON.parse(localStorage.getItem('customer_tokens') || '{}')
    try {
      await API.post('/customers/logout/', { refresh: tokens.refresh })
    } catch {}
    localStorage.removeItem('customer_tokens')
    localStorage.removeItem('customer_user')
    setUser(null)
  }

  const fetchMe = async () => {
    const { data } = await API.get('/customers/me/')
    setUser(data)
    return data
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchMe, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
