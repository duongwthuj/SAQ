import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '', email: '', password: '', password_confirm: '', phone: '', address: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password_confirm) {
      setError('Mat khau khong khop')
      return
    }
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      const d = err.response?.data
      if (typeof d === 'object') {
        const msgs = Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        setError(msgs.join(' | '))
      } else {
        setError('Dang ky that bai')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrap}>
      <div className="card" style={styles.card}>
        <h2 style={styles.title}>Dang ky</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ten dang nhap</label>
            <input value={form.username} onChange={set('username')} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label>So dien thoai</label>
            <input value={form.phone} onChange={set('phone')} />
          </div>
          <div className="form-group">
            <label>Dia chi</label>
            <input value={form.address} onChange={set('address')} />
          </div>
          <div className="form-group">
            <label>Mat khau</label>
            <input type="password" value={form.password} onChange={set('password')} required />
          </div>
          <div className="form-group">
            <label>Xac nhan mat khau</label>
            <input type="password" value={form.password_confirm} onChange={set('password_confirm')} required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Dang xu ly...' : 'Dang ky'}
          </button>
        </form>
        <p style={styles.footer}>
          Da co tai khoan? <Link to="/login">Dang nhap</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  wrap: { display: 'flex', justifyContent: 'center', paddingTop: 40 },
  card: { width: '100%', maxWidth: 420 },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 24, textAlign: 'center' },
  footer: { marginTop: 16, textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' },
}
