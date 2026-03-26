import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/laptops', label: 'Laptops' },
  { to: '/clothes', label: 'Quan ao' },
  { to: '/orders', label: 'Don hang' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>SAQ Staff</div>
      <nav style={styles.nav}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            style={({ isActive }) => ({
              ...styles.link,
              background: isActive ? 'var(--primary-light)' : 'transparent',
              color: isActive ? 'var(--primary-dark)' : 'var(--text)',
              fontWeight: isActive ? 600 : 500,
            })}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div style={styles.bottom}>
        <p style={{ fontSize: 13, fontWeight: 600 }}>{user?.username}</p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user?.department || 'Staff'}</p>
        <button className="btn btn-outline btn-sm" style={{ marginTop: 8, width: '100%' }} onClick={handleLogout}>
          Dang xuat
        </button>
      </div>
    </aside>
  )
}

const styles = {
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 'var(--sidebar-w)',
    height: '100vh',
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
  },
  brand: {
    padding: '20px 24px',
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--primary)',
    borderBottom: '1px solid var(--border)',
  },
  nav: {
    flex: 1,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  link: {
    display: 'block',
    padding: '10px 16px',
    borderRadius: 'var(--radius)',
    fontSize: 14,
    textDecoration: 'none',
    transition: 'background 0.15s',
  },
  bottom: {
    padding: '16px 24px',
    borderTop: '1px solid var(--border)',
  },
}
