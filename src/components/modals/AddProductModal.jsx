import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getEmoji } from '../../lib/emojiMap'
import Modal from '../Modal'

export default function AddProductModal({ categoryId, categories, eventId, onClose, onSuccess }) {
  const standalone = !categoryId

  const [selectedCatId, setSelectedCatId] = useState(categoryId || '__none__')
  const [newCatName, setNewCatName] = useState('')
  const [newCatEmoji, setNewCatEmoji] = useState('📦')
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🏷️')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleNameChange(e) {
    const val = e.target.value
    setName(val)
    setEmoji(getEmoji(val))
  }

  function handleNewCatNameChange(e) {
    const val = e.target.value
    setNewCatName(val)
    setNewCatEmoji(getEmoji(val))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    let targetCategoryId = categoryId

    if (standalone) {
      if (selectedCatId === '__none__') {
        // Kategorisiz: mevcut "Kategorisiz" kategorisini bul veya oluştur
        const { data: existing } = await supabase
          .from('categories')
          .select('id')
          .eq('event_id', eventId)
          .eq('name', 'Kategorisiz')
          .single()

        if (existing) {
          targetCategoryId = existing.id
        } else {
          const { data: cat, error: catErr } = await supabase
            .from('categories')
            .insert({ event_id: eventId, name: 'Kategorisiz', emoji: '📦' })
            .select().single()
          if (catErr) { setError(catErr.message); setLoading(false); return }
          targetCategoryId = cat.id
        }
      } else if (selectedCatId === '__new__') {
        if (!newCatName.trim()) { setError('Kategori adı gerekli.'); setLoading(false); return }
        const { data: cat, error: catErr } = await supabase
          .from('categories')
          .insert({ event_id: eventId, name: newCatName.trim(), emoji: newCatEmoji || '📦' })
          .select().single()
        if (catErr) { setError(catErr.message); setLoading(false); return }
        targetCategoryId = cat.id
      } else {
        targetCategoryId = selectedCatId
      }
    }

    const { data: product, error: err1 } = await supabase
      .from('products')
      .insert({ category_id: targetCategoryId, name: name.trim(), emoji: emoji || '🏷️' })
      .select().single()

    if (err1) { setError(err1.message); setLoading(false); return }

    if (price && !isNaN(Number(price)) && Number(price) > 0) {
      await supabase.from('prices').insert({ product_id: product.id, amount: Number(price) })
    }

    onSuccess()
    onClose()
  }

  return (
    <Modal title="Ürün Ekle" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-msg">{error}</div>}

        {standalone && (
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select
              className="form-select"
              value={selectedCatId}
              onChange={e => setSelectedCatId(e.target.value)}
            >
              <option value="__none__">📦 Kategorisiz</option>
              {(categories || []).map(c => (
                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
              ))}
              <option value="__new__">+ Yeni kategori oluştur</option>
            </select>
          </div>
        )}

        {standalone && selectedCatId === '__new__' && (
          <div className="form-group">
            <label className="form-label">Yeni Kategori</label>
            <div className="emoji-name-row">
              <input
                type="text"
                className="form-input emoji-input"
                value={newCatEmoji}
                onChange={e => setNewCatEmoji(e.target.value)}
                placeholder="📦"
              />
              <input
                type="text"
                className="form-input name-input"
                value={newCatName}
                onChange={handleNewCatNameChange}
                placeholder="Kategori adı"
              />
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Emoji & Ürün Adı</label>
          <div className="emoji-name-row">
            <input
              type="text"
              className="form-input emoji-input"
              value={emoji}
              onChange={e => setEmoji(e.target.value)}
              placeholder="🏷️"
            />
            <input
              type="text"
              className="form-input name-input"
              value={name}
              onChange={handleNameChange}
              placeholder="Ürün adı"
              required
              autoFocus={!standalone}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Başlangıç Fiyatı ₺ (opsiyonel)</label>
          <input
            type="number"
            className="form-input"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Ekleniyor...' : 'Ürün Ekle'}
        </button>
      </form>
    </Modal>
  )
}
