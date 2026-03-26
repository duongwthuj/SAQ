import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'
import CartItem from '../components/CartItem'

export default function Cart() {
  const { user } = useAuth()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadCart = async () => {
    setLoading(true)
    try {
      const { data } = await API.get('/cart/', { params: { customer_id: user.id } })
      setCart(data)
    } catch {
      setCart(null)
    }
    setLoading(false)
  }

  useEffect(() => { loadCart() }, [])

  const clearCart = async () => {
    try {
      await API.post('/cart/clear/', { customer_id: user.id })
      loadCart()
    } catch {}
  }

  if (loading) return <div className="loading">Dang tai...</div>

  const items = cart?.items || []
  const total = items.reduce((s, i) => s + Number(i.unit_price) * i.quantity, 0)

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 className="page-title">Gio hang</h1>
      {items.length === 0 ? (
        <div className="empty">
          <p>Gio hang trong</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Mua sam ngay</Link>
        </div>
      ) : (
        <>
          <div className="card">
            {items.map((item) => (
              <CartItem key={item.id} item={item} onUpdate={loadCart} />
            ))}
          </div>
          <div style={styles.footer}>
            <button className="btn btn-outline" onClick={clearCart}>Xoa tat ca</button>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Tong cong</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>
                {total.toLocaleString('vi-VN')} VND
              </p>
            </div>
            <Link to="/checkout" className="btn btn-primary">Dat hang</Link>
          </div>
        </>
      )}
    </div>
  )
}

const styles = {
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 24,
    marginTop: 24,
    flexWrap: 'wrap',
  },
}
