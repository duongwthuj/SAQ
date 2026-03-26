import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/axios'

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newStatus, setNewStatus] = useState('')
  const [updating, setUpdating] = useState(false)

  const load = () => {
    API.get(`/orders/${id}/`)
      .then((res) => {
        setOrder(res.data)
        setNewStatus(res.data.status)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const updateStatus = async () => {
    setUpdating(true)
    try {
      await API.patch(`/orders/${id}/status/`, { status: newStatus })
      load()
    } catch {}
    setUpdating(false)
  }

  const cancelOrder = async () => {
    if (!confirm('Huy don hang nay?')) return
    setUpdating(true)
    try {
      await API.post(`/orders/${id}/cancel/`)
      load()
    } catch {}
    setUpdating(false)
  }

  if (loading) return <div className="loading">Dang tai...</div>
  if (!order) return <div className="empty">Khong tim thay</div>

  const canCancel = !['cancelled', 'shipped', 'delivered'].includes(order.status)

  return (
    <div style={{ maxWidth: 800 }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate('/orders')} style={{ marginBottom: 20 }}>
        ← Quay lai
      </button>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Don hang #{order.id}</h2>
          <span className={`badge badge-${order.status}`}>{order.status}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, fontSize: 14 }}>
          <p><strong>Customer ID:</strong> {order.customer_id}</p>
          <p><strong>Ngay tao:</strong> {new Date(order.created_at).toLocaleString('vi-VN')}</p>
          <p style={{ gridColumn: '1 / -1' }}><strong>Dia chi:</strong> {order.shipping_address}</p>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>San pham</th><th>Loai</th><th>Don gia</th><th>SL</th><th>Thanh tien</th></tr>
            </thead>
            <tbody>
              {(order.items || []).map((i) => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 600 }}>{i.product_name}</td>
                  <td>{i.product_type}</td>
                  <td>{Number(i.unit_price).toLocaleString('vi-VN')}</td>
                  <td>{i.quantity}</td>
                  <td style={{ fontWeight: 600 }}>{Number(i.line_total).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
            Tong: {Number(order.total_amount).toLocaleString('vi-VN')} VND
          </p>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 600, fontSize: 14 }}>Cap nhat trang thai:</label>
        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
          style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14 }}>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" onClick={updateStatus} disabled={updating || newStatus === order.status}>
          Luu
        </button>
        {canCancel && (
          <button className="btn btn-danger btn-sm" onClick={cancelOrder} disabled={updating}>Huy don</button>
        )}
      </div>
    </div>
  )
}
