import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

function IconList({ active }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  )
}

function IconMoney({ active }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function IconArchive({ active }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  )
}

export default function BottomNav({ current, onChange }) {
  const { profile } = useContext(AuthContext)
  const isEditor = profile?.role === 'editor' || profile?.role === 'admin'

  const tabs = [
    { id: 'categories', label: 'Kategoriler', Icon: IconList },
    ...(isEditor ? [{ id: 'finance', label: 'Finans', Icon: IconMoney }] : []),
    { id: 'archive', label: 'Arşiv', Icon: IconArchive },
  ]

  return (
    <nav className="bottom-nav">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`bottom-nav-item ${current === id ? 'active' : ''}`}
          onClick={() => onChange(id)}
        >
          <Icon active={current === id} />
          {label}
        </button>
      ))}
    </nav>
  )
}
