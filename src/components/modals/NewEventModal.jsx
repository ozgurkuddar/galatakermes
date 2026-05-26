import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Modal from '../Modal'

export default function NewEventModal({ onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('2026-06-06')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)

    await supabase.from('events').update({ is_active: false }).eq('is_active', true)

    const { error: err } = await supabase.from('events').insert({
      name: name.trim(),
      event_date: date || null,
      is_active: true,
    })

    if (err) { setError(err.message); setLoading(false); return }
    onSuccess()
    onClose()
  }

  return (
    <Modal title="Yeni Kermes Oluştur" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-group">
          <label className="form-label">Kermes Adı</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Kermes 2026"
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label">Kermes Tarihi</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
        <p className="text-muted text-sm" style={{ marginBottom: 20 }}>
          ⚠️ Mevcut aktif kermes arşivlenir ve yeni kermes aktif olur.
        </p>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Oluşturuluyor...' : 'Oluştur'}
        </button>
      </form>
    </Modal>
  )
}
