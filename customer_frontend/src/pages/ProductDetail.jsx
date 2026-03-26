import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function ProductDetail() {
  const { type, id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const endpoint = type === 'laptop' ? `/laptops/${id}/` : `/clothes/${id}/`
    API.get(endpoint)
      .then((res) => setProduct(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [type, id])

  const addToCart = async () => {
    if (!user) { navigate('/login'); return }
    setAdding(true)
    setMsg('')
    try {
      await API.post('/cart/create/', { customer_id: user.id })
    } catch {}
    try {
      await API.post('/cart/add/', {
        customer_id: user.id,
        product_id: Number(id),
        product_type: type,
        quantity: qty,
      })
      setMsg('Da them vao gio hang!')
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Loi them vao gio')
    }
    setAdding(false)
  }

  if (loading) return <div className="loading">Dang tai...</div>
  if (!product) return <div className="empty">Khong tim thay san pham</div>

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        ← Quay lai
      </button>
      <div className="card">
        <div style={styles.badge}>{type === 'laptop' ? 'Laptop' : 'Quan ao'}</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{product.name}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{product.brand}</p>
        <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)', marginBottom: 20 }}>
          {Number(product.price).toLocaleString('vi-VN')} VND
        </p>
        {product.description && (
          <p style={{ marginBottom: 16, lineHeight: 1.7 }}>{product.description}</p>
        )}
        {product.specs && (
          <div style={styles.specs}>
            {Object.entries(product.specs).map(([k, v]) => (
              <div key={k} style={styles.specItem}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        <div style={styles.actions}>
          <div style={styles.qtyWrap}>
            <button className="btn btn-outline btn-sm" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 600 }}>{qty}</span>
            <button className="btn btn-outline btn-sm" onClick={() => setQty(qty + 1)}>+</button>
          </div>
          <button className="btn btn-primary" onClick={addToCart} disabled={adding}>
            {adding ? 'Dang them...' : 'Them vao gio'}
          </button>
        </div>
        {msg && <p className="success-msg" style={{ marginTop: 12 }}>{msg}</p>}
      </div>
    </div>
  )
}

const styles = {
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    background: 'var(--primary-light)',
    color: 'var(--primary-dark)',
    marginBottom: 12,
  },
  specs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 10,
    marginBottom: 24,
    padding: 16,
    background: 'var(--primary-light)',
    borderRadius: 'var(--radius)',
  },
  specItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  qtyWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
}
