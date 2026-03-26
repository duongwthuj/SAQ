import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const CUSTOMER_URL = window.location.port === '3000' ? '' : 'http://localhost:3000'
const STAFF_URL = window.location.port === '3001' ? '' : 'http://localhost:3001'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('staff')
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (role === 'staff') {
        await login(form.username, form.password)
        navigate('/')
      } else {
        const { data } = await axios.post('/api/customers/login/', {
          username: form.username,
          password: form.password,
        })
        localStorage.setItem('customer_tokens', JSON.stringify(data.tokens))
        localStorage.setItem('customer_user', JSON.stringify(data.user))
        window.location.href = CUSTOMER_URL || '/'
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Dang nhap that bai')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrap}>
      <div className="card" style={styles.card}>
        <h2 style={styles.title}>SAQ Staff</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>
          Dang nhap he thong
        </p>

        <div style={styles.roleWrap}>
          <button
            className={`btn btn-sm ${role === 'staff' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setRole('staff')}
            type="button"
          >
            Nhan vien
          </button>
          <button
            className={`btn btn-sm ${role === 'customer' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setRole('customer')}
            type="button"
          >
            Khach hang
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ten dang nhap</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Mat khau</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Dang xu ly...' : `Dang nhap (${role === 'staff' ? 'Nhan vien' : 'Khach hang'})`}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
          Chua co tai khoan? <Link to="/register">Dang ky</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  wrap: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--surface)' },
  card: { width: '100%', maxWidth: 400 },
  title: { fontSize: 24, fontWeight: 700, textAlign: 'center', color: 'var(--primary)', marginBottom: 4 },
  roleWrap: {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
}
