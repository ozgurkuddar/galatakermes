import { useContext, useState } from 'react'
import { AuthContext } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import CategoriesPage from './pages/CategoriesPage'
import FinancePage from './pages/FinancePage'
import ArchivePage from './pages/ArchivePage'
import BottomNav from './components/BottomNav'

export default function App() {
  const { user, loading } = useContext(AuthContext)
  const [page, setPage] = useState('categories')

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div className="spinner" />
    </div>
  )

  if (!user) return <LoginPage />

  return (
    <>
      {page === 'categories' && <CategoriesPage />}
      {page === 'finance' && <FinancePage />}
      {page === 'archive' && <ArchivePage />}
      <BottomNav current={page} onChange={setPage} />
    </>
  )
}
