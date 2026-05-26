import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Modal from '../Modal'

export default function UpdatePriceModal({ product, onClose, onSuccess }) {
  const currentPrice = product.prices?.at(-1)?.amount
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!amount || isNaN(Number(amount))) return
    setLoading(true)

    const { error: err } = await supabase.from('prices').insert({
      product_id: product.id,
      amount: Number(amount),
    })

    if (err) { setError(err.message); setLoading(false); return }
    onSuccess()
    onClose()
  }

  return (
    <Modal title={`${product.emoji || '🏷️'} ${product.name}`} onClose={onClose}>
      {currentPrice !== undefined && (
        <p className="text-muted text-sm" style={{ marginBottom: 16 }}>
          Mevcut fiyat: <strong>₺{Number(currentPrice).toLocaleString('tr-TR')}</strong>
        </p>
      )}
      <form onSubmit={handleSubmit}>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-group">
          <label className="form-label">Yeni Fiyat (₺)</label>
          <input
            type="number"
            className="form-input"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            autoFocus
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Güncelleniyor...' : 'Fiyatı Güncelle'}
        </button>
      </form>
    </Modal>
  )
}
