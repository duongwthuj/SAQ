import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Checkout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [address, setAddress] = useState(user?.address || '')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    API.get('/cart/', { params: { customer_id: user.id } })
      .then((res) => setCart(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleOrder = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const items = (cart?.items || []).map((i) => ({
      product_id: i.product_id,
      product_type: i.product_type,
      quantity: i.quantity,
    }))
    try {
      const { data } = await API.post('/orders/', {
        customer_id: user.id,
        items,
        shipping_address: address,
      })
      try { await API.post('/cart/clear/', { customer_id: user.id }) } catch {}
      navigate(`/orders/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Dat hang that bai')
    }
    setSubmitting(false)
  }

  if (loading) return <div className="loading">Dang tai...</div>

  const items = cart?.items || []
  if (items.length === 0) return <div className="empty">Gio hang trong</div>

  const total = items.reduce((s, i) => s + Number(i.unit_price) * i.quantity, 0)

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 className="page-title">Xac nhan don hang</h1>
      <div className="card" style={{ marginBottom: 20 }}>
        {items.map((i) => (
          <div key={i.id} style={styles.item}>
            <div>
              <p style={{ fontWeight: 600 }}>{i.product_name}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {i.product_type === 'laptop' ? 'Laptop' : 'Quan ao'} x{i.quantity}
              </p>
            </div>
            <p style={{ fontWeight: 600 }}>
              {(Number(i.unit_price) * i.quantity).toLocaleString('vi-VN')} VND
            </p>
          </div>
        ))}
        <div style={{ ...styles.item, borderBottom: 'none', paddingTop: 16 }}>
          <p style={{ fontWeight: 700, fontSize: 16 }}>Tong cong</p>
          <p style={{ fontWeight: 700, fontSize: 20, color: 'var(--primary)' }}>
            {total.toLocaleString('vi-VN')} VND
          </p>
        </div>
      </div>

      <form className="card" onSubmit={handleOrder}>
        <div className="form-group">
          <label>Dia chi giao hang</label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
          {submitting ? 'Dang xu ly...' : 'Dat hang'}
        </button>
      </form>
    </div>
  )
}

const styles = {
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid var(--border)',
  },
}
