import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

export default function Profile() {
  const { user, fetchMe } = useAuth()
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', new_password_confirm: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { fetchMe() }, [])

  const handleChangePw = async (e) => {
    e.preventDefault()
    setMsg('')
    setError('')
    try {
      await API.post('/customers/change-password/', pwForm)
      setMsg('Doi mat khau thanh cong')
      setPwForm({ old_password: '', new_password: '', new_password_confirm: '' })
    } catch (err) {
      const d = err.response?.data
      setError(typeof d === 'object' ? JSON.stringify(d) : 'Loi')
    }
  }

  if (!user) return <div className="loading">Dang tai...</div>

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <h1 className="page-title">Tai khoan</h1>
      <div className="card" style={{ marginBottom: 24 }}>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Dien thoai:</strong> {user.phone || '—'}</p>
        <p><strong>Dia chi:</strong> {user.address || '—'}</p>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Doi mat khau</h3>
        <form onSubmit={handleChangePw}>
          <div className="form-group">
            <label>Mat khau cu</label>
            <input type="password" value={pwForm.old_password}
              onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Mat khau moi</label>
            <input type="password" value={pwForm.new_password}
              onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Xac nhan mat khau moi</label>
            <input type="password" value={pwForm.new_password_confirm}
              onChange={(e) => setPwForm({ ...pwForm, new_password_confirm: e.target.value })} required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          {msg && <p className="success-msg">{msg}</p>}
          <button className="btn btn-primary" style={{ width: '100%' }}>Doi mat khau</button>
        </form>
      </div>
    </div>
  )
}
