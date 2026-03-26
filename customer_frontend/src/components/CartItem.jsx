import { useState } from 'react'
import API from '../api/axios'

export default function CartItem({ item, onUpdate }) {
  const [qty, setQty] = useState(item.quantity)
  const [saving, setSaving] = useState(false)

  const updateQty = async (newQty) => {
    if (newQty < 1) return
    setSaving(true)
    setQty(newQty)
    try {
      await API.put(`/cart/items/${item.id}/`, { quantity: newQty })
      onUpdate()
    } catch {}
    setSaving(false)
  }

  const remove = async () => {
    setSaving(true)
    try {
      await API.delete(`/cart/items/${item.id}/`)
      onUpdate()
    } catch {}
    setSaving(false)
  }

  return (
    <div style={styles.row}>
      <div style={{ flex: 1 }}>
        <div style={styles.badge}>
          {item.product_type === 'laptop' ? 'Laptop' : 'Quan ao'}
        </div>
        <p style={{ fontWeight: 600 }}>{item.product_name}</p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {Number(item.unit_price).toLocaleString('vi-VN')} VND
        </p>
      </div>
      <div style={styles.qtyWrap}>
        <button className="btn btn-outline btn-sm" onClick={() => updateQty(qty - 1)} disabled={saving}>−</button>
        <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 600 }}>{qty}</span>
        <button className="btn btn-outline btn-sm" onClick={() => updateQty(qty + 1)} disabled={saving}>+</button>
      </div>
      <p style={{ fontWeight: 700, color: 'var(--primary)', minWidth: 120, textAlign: 'right' }}>
        {(Number(item.unit_price) * qty).toLocaleString('vi-VN')} VND
      </p>
      <button className="btn btn-danger btn-sm" onClick={remove} disabled={saving}>Xoa</button>
    </div>
  )
}

const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '16px 0',
    borderBottom: '1px solid var(--border)',
    flexWrap: 'wrap',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
    background: 'var(--primary-light)',
    color: 'var(--primary-dark)',
    marginBottom: 4,
  },
  qtyWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
}
