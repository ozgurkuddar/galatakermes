import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function Header({ title, subtitle, children }) {
  const { logout } = useContext(AuthContext)

  return (
    <div className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/logo.png" alt="logo" style={{ height: 32, width: 'auto' }} />
        <div>
          <div className="header-title">{title}</div>
          {subtitle && <div className="header-subtitle">{subtitle}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {children}
        <button
          className="btn btn-sm btn-ghost"
          onClick={logout}
          style={{ color: 'var(--text-muted)', fontSize: 13 }}
        >
          Çıkış
        </button>
      </div>
    </div>
  )
}
