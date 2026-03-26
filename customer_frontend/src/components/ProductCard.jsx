import { Link } from 'react-router-dom'

export default function ProductCard({ product, type }) {
  return (
    <Link to={`/products/${type}/${product.id}`} className="card" style={styles.card}>
      <div style={styles.badge}>{type === 'laptop' ? 'Laptop' : 'Quan ao'}</div>
      <h3 style={styles.name}>{product.name}</h3>
      <p style={styles.brand}>{product.brand}</p>
      <p style={styles.price}>
        {Number(product.price).toLocaleString('vi-VN')} VND
      </p>
    </Link>
  )
}

const styles = {
  card: {
    display: 'block',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'transform 0.15s, box-shadow 0.15s',
    cursor: 'pointer',
  },
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    background: 'var(--primary-light)',
    color: 'var(--primary-dark)',
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 4,
    lineHeight: 1.3,
  },
  brand: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--primary)',
  },
}
