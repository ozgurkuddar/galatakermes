import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Modal from '../Modal'

export default function AddCostModal({ eventId, onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !amount || isNaN(Number(amount))) return
    setLoading(true)

    const { error: err } = await supabase.from('costs').insert({
      event_id: eventId,
      name: name.trim(),
      amount: Number(amount),
    })

    if (err) { setError(err.message); setLoading(false); return }
    onSuccess()
    onClose()
  }

  return (
    <Modal title="Maliyet Ekle" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-group">
          <label className="form-label">Maliyet Kalemi</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Kira, malzeme, nakliye..."
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label">Tutar (₺)</label>
          <input
            type="number"
            className="form-input"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Ekleniyor...' : 'Maliyet Ekle'}
        </button>
      </form>
    </Modal>
  )
}
