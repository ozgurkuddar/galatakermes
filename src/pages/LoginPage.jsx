import { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useContext(AuthContext)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username.trim().toLowerCase(), password)
    } catch {
      setError('Kullanıcı adı veya şifre hatalı.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-logo-wrap">
        <img src="/logo.png" alt="Galata Rotary Kulübü" className="login-logo-img" />
      </div>

      <div className="login-divider" />

      <div className="login-kermes-badge">🎪 Kermes</div>
      <p className="login-motto">Bursiyerlerimiz için Kermes</p>

      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div className="error-msg">{error}</div>}

        <div className="form-group">
          <label className="form-label">Kullanıcı Adı</label>
          <input
            type="text"
            className="form-input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Şifre</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>
    </div>
  )
}
