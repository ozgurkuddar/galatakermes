import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Modal from '../Modal'

export default function AddEarningModal({ eventId, onClose, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('TL')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!amount || isNaN(Number(amount))) return
    setLoading(true)

    const { error: err } = await supabase.from('earnings').insert({
      event_id: eventId,
      amount: Number(amount),
      currency,
      note: note.trim() || null,
    })

    if (err) { setError(err.message); setLoading(false); return }
    onSuccess()
    onClose()
  }

  return (
    <Modal title="Kazanç Ekle" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-group">
          <label className="form-label">Tutar</label>
          <input
            type="number"
            className="form-input"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label">Para Birimi</label>
          <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
            <option value="TL">TL</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Not (opsiyonel)</label>
          <input
            type="text"
            className="form-input"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Açıklama..."
          />
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Ekleniyor...' : 'Kazanç Ekle'}
        </button>
      </form>
    </Modal>
  )
}
