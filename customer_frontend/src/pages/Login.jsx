import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Dang nhap that bai')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrap}>
      <div className="card" style={styles.card}>
        <h2 style={styles.title}>Dang nhap</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ten dang nhap</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Mat khau</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Dang xu ly...' : 'Dang nhap'}
          </button>
        </form>
        <p style={styles.footer}>
          Chua co tai khoan? <Link to="/register">Dang ky</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  wrap: { display: 'flex', justifyContent: 'center', paddingTop: 60 },
  card: { width: '100%', maxWidth: 420 },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 24, textAlign: 'center' },
  footer: { marginTop: 16, textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' },
}
