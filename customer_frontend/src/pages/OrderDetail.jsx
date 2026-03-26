import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/axios'

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  const load = () => {
    API.get(`/orders/${id}/`)
      .then((res) => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const cancel = async () => {
    if (!confirm('Ban co chac muon huy don hang nay?')) return
    setCancelling(true)
    try {
      await API.post(`/orders/${id}/cancel/`)
      load()
    } catch {}
    setCancelling(false)
  }

  if (loading) return <div className="loading">Dang tai...</div>
  if (!order) return <div className="empty">Khong tim thay don hang</div>

  const canCancel = !['cancelled', 'shipped', 'delivered'].includes(order.status)

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate('/orders')} style={{ marginBottom: 20 }}>
        ← Quay lai
      </button>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Don hang #{order.id}</h2>
          <span className={`badge badge-${order.status}`}>{order.status}</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
          Ngay tao: {new Date(order.created_at).toLocaleString('vi-VN')}
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Dia chi: {order.shipping_address}
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>San pham</th>
                <th>Loai</th>
                <th>Don gia</th>
                <th>SL</th>
                <th>Thanh tien</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((i) => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 600 }}>{i.product_name}</td>
                  <td>{i.product_type === 'laptop' ? 'Laptop' : 'Quan ao'}</td>
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

      {canCancel && (
        <button className="btn btn-danger" onClick={cancel} disabled={cancelling}>
          {cancelling ? 'Dang huy...' : 'Huy don hang'}
        </button>
      )}
    </div>
  )
}
