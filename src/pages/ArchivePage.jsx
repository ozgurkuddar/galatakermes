import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'

export default function ArchivePage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [details, setDetails] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase
      .from('events').select('*').order('created_at', { ascending: false })
    setEvents(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  async function viewEvent(event) {
    setSelected(event)
    setDetailLoading(true)

    const [{ data: cats }, { data: earn }, { data: cost }] = await Promise.all([
      supabase.from('categories').select('*, products(*, prices(id, amount, created_at))').eq('event_id', event.id),
      supabase.from('earnings').select('*').eq('event_id', event.id),
      supabase.from('costs').select('*').eq('event_id', event.id),
    ])

    setDetails({ categories: cats || [], earnings: earn || [], costs: cost || [] })
    setDetailLoading(false)
  }

  function formatDate(event) {
    const dateStr = event.event_date || event.created_at
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  if (loading) return <div className="page"><div className="spinner" /></div>

  if (selected) {
    return (
      <div className="page">
        <Header title={selected.name} subtitle={formatDate(selected)}>
          <button className="btn btn-sm btn-ghost" onClick={() => { setSelected(null); setDetails(null) }}>
            ← Geri
          </button>
        </Header>
        <div className="page-content">
          {detailLoading ? <div className="spinner" /> : details && <EventDetail details={details} />}
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <Header title="Arşiv" />
      <div className="page-content">
        {events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🗂️</div>
            <p>Henüz kermes kaydı yok.</p>
          </div>
        ) : (
          events.map(event => (
            <button key={event.id} className="archive-item" onClick={() => viewEvent(event)}>
              <div>
                <div style={{ fontWeight: 700 }}>{event.name}</div>
                <div className="text-sm text-muted">{formatDate(event)}</div>
              </div>
              {event.is_active
                ? <span className="archive-active-badge">Aktif</span>
                : <span style={{ color: 'var(--text-muted)', fontSize: 20 }}>›</span>
              }
            </button>
          ))
        )}
      </div>
    </div>
  )
}

function EventDetail({ details }) {
  const { categories, earnings, costs } = details
  const totalCosts = costs.reduce((s, c) => s + Number(c.amount), 0)

  const earningsByCurrency = ['TL', 'USD', 'EUR']
    .map(cur => ({
      currency: cur,
      total: earnings.filter(e => e.currency === cur).reduce((s, e) => s + Number(e.amount), 0)
    }))
    .filter(e => e.total > 0)

  return (
    <>
      <div className="finance-section-title" style={{ marginBottom: 10 }}>
        <span>Kategoriler ({categories.length})</span>
      </div>

      {categories.map(cat => {
        const products = (cat.products || [])
        return (
          <div key={cat.id} className="card">
            <div className="category-title" style={{ marginBottom: 8 }}>
              {cat.emoji} {cat.name}
            </div>
            {products.map(p => {
              const prices = [...(p.prices || [])].sort(
                (a, b) => new Date(a.created_at) - new Date(b.created_at)
              )
              const current = prices.at(-1)
              return (
                <div key={p.id} className="product-item" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="product-name">{p.emoji} {p.name}</span>
                  {current && (
                    <span className="price-current" style={{ fontSize: 14 }}>
                      ₺{Number(current.amount).toLocaleString('tr-TR')}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}

      {earningsByCurrency.length > 0 && (
        <div className="mt-16">
          <div className="finance-section-title"><span>Toplam Kazanç</span></div>
          {earningsByCurrency.map(e => (
            <div key={e.currency} className="finance-total" style={{ marginBottom: 8 }}>
              <span>{e.currency}</span>
              <span style={{ fontWeight: 800 }}>{e.total.toLocaleString('tr-TR')} {e.currency}</span>
            </div>
          ))}
        </div>
      )}

      {totalCosts > 0 && (
        <div className="mt-16">
          <div className="finance-section-title"><span>Toplam Maliyet</span></div>
          <div className="finance-total">
            <span>TL</span>
            <span style={{ fontWeight: 800 }}>₺{totalCosts.toLocaleString('tr-TR')}</span>
          </div>
        </div>
      )}
    </>
  )
}
