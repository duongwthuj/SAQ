import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/axios'

export default function ClothesForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    name: '', brand: '', price: '', description: '', category: '', size: '', color: '', material: '',
  })
  const [inventory, setInventory] = useState('')
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    API.get('/clothes/categories/').then((res) => setCategories(res.data.results || res.data)).catch(() => {})
    if (isEdit) {
      API.get(`/clothes/${id}/`).then((res) => {
        const d = res.data
        setForm({
          name: d.name,
          brand: d.brand || '',
          price: d.price,
          description: d.description || '',
          category: d.category || '',
          size: d.size || '',
          color: d.color || '',
          material: d.material || '',
        })
        setInventory(d.inventory?.quantity ?? '')
      }).catch(() => {})
    }
  }, [id])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = { ...form }
    if (form.category) payload.category = Number(form.category)
    else delete payload.category

    try {
      let itemId = id
      if (isEdit) {
        await API.put(`/clothes/${id}/`, payload)
      } else {
        const { data } = await API.post('/clothes/', payload)
        itemId = data.id
      }

      if (inventory !== '' && inventory !== null) {
        try {
          await API.get(`/clothes/inventory/${itemId}/`)
        } catch {
          await API.post('/clothes/inventory/', { item_id: itemId, quantity: Number(inventory) })
        }
      }

      navigate('/clothes')
    } catch (err) {
      const d = err.response?.data
      setError(typeof d === 'object' ? JSON.stringify(d) : 'Loi luu')
    }
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 className="page-title">{isEdit ? 'Sua quan ao' : 'Them quan ao moi'}</h1>
      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group"><label>Ten</label><input value={form.name} onChange={set('name')} required /></div>
        <div className="form-group"><label>Hang</label><input value={form.brand} onChange={set('brand')} /></div>
        <div className="form-group"><label>Gia</label><input type="number" step="0.01" value={form.price} onChange={set('price')} required /></div>
        <div className="form-group">
          <label>Category</label>
          <select value={form.category} onChange={set('category')}>
            <option value="">-- Chon --</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div className="form-group"><label>Size</label><input value={form.size} onChange={set('size')} /></div>
          <div className="form-group"><label>Mau</label><input value={form.color} onChange={set('color')} /></div>
          <div className="form-group"><label>Chat lieu</label><input value={form.material} onChange={set('material')} /></div>
        </div>
        <div className="form-group"><label>Mo ta</label><textarea rows={3} value={form.description} onChange={set('description')} /></div>
        <div className="form-group"><label>Ton kho</label><input type="number" value={inventory} onChange={(e) => setInventory(e.target.value)} placeholder="So luong" /></div>
        {error && <p className="error-msg">{error}</p>}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Dang luu...' : 'Luu'}</button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/clothes')}>Huy</button>
        </div>
      </form>
    </div>
  )
}
