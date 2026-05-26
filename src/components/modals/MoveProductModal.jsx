import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Modal from '../Modal'

export default function MoveProductModal({ product, categories, onClose, onSuccess }) {
  const [targetCatId, setTargetCatId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const otherCategories = categories.filter(c => c.id !== product.category_id)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!targetCatId) return
    setLoading(true)

    const { error: err } = await supabase
      .from('products')
      .update({ category_id: targetCatId })
      .eq('id', product.id)

    if (err) { setError(err.message); setLoading(false); return }
    onSuccess()
    onClose()
  }

  return (
    <Modal title={`Taşı: ${product.emoji || '🏷️'} ${product.name}`} onClose={onClose}>
      {otherCategories.length === 0 ? (
        <p className="text-muted text-sm">Taşınabilecek başka kategori yok.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}
          <div className="form-group">
            <label className="form-label">Hedef Kategori</label>
            <select
              className="form-select"
              value={targetCatId}
              onChange={e => setTargetCatId(e.target.value)}
              required
              autoFocus
            >
              <option value="">— Seçiniz —</option>
              {otherCategories.map(c => (
                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading || !targetCatId}>
            {loading ? 'Taşınıyor...' : 'Taşı'}
          </button>
        </form>
      )}
    </Modal>
  )
}
