import { useEffect } from 'react'

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <h2 className="modal-title">{title}</h2>
        {children}
      </div>
    </div>
  )
}
