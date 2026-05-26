import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getEmoji } from '../../lib/emojiMap'
import Modal from '../Modal'

export default function AddCategoryModal({ eventId, onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('📦')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleNameChange(e) {
    const val = e.target.value
    setName(val)
    setEmoji(getEmoji(val))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    const { error: err } = await supabase.from('categories').insert({
      event_id: eventId,
      name: name.trim(),
      emoji: emoji || '📦',
    })

    if (err) { setError(err.message); setLoading(false); return }
    onSuccess()
    onClose()
  }

  return (
    <Modal title="Kategori Ekle" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-group">
          <label className="form-label">Emoji & Kategori Adı</label>
          <div className="emoji-name-row">
            <input
              type="text"
              className="form-input emoji-input"
              value={emoji}
              onChange={e => setEmoji(e.target.value)}
              placeholder="📦"
            />
            <input
              type="text"
              className="form-input name-input"
              value={name}
              onChange={handleNameChange}
              placeholder="Kıyafet, Kitap..."
              required
              autoFocus
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Ekleniyor...' : 'Kategori Ekle'}
        </button>
      </form>
    </Modal>
  )
}
