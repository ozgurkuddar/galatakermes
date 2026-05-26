import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Modal from '../Modal'

export default function EditCategoryModal({ category, onClose, onSuccess }) {
  const [name, setName] = useState(category.name)
  const [emoji, setEmoji] = useState(category.emoji || '📦')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)

    const { error: err } = await supabase
      .from('categories')
      .update({ name: name.trim(), emoji: emoji || '📦' })
      .eq('id', category.id)

    if (err) { setError(err.message); setLoading(false); return }
    onSuccess()
    onClose()
  }

  return (
    <Modal title="Kategori Düzenle" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-group">
          <label className="form-label">Emoji & Ad</label>
          <div className="emoji-name-row">
            <input
              type="text"
              className="form-input emoji-input"
              value={emoji}
              onChange={e => setEmoji(e.target.value)}
            />
            <input
              type="text"
              className="form-input name-input"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>
    </Modal>
  )
}
