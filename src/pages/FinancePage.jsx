import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import AddEarningModal from '../components/modals/AddEarningModal'
import AddCostModal from '../components/modals/AddCostModal'

export default function FinancePage() {
  const [event, setEvent] = useState(null)
  const [earnings, setEarnings] = useState([])
  const [costs, setCosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddEarning, setShowAddEarning] = useState(false)
  const [showAddCost, setShowAddCost] = useState(false)

  const fetchData = useCallback(async () => {
    const { data: ev } = await supabase
      .from('events').select('*').eq('is_active', true).single()
    setEvent(ev)

    if (!ev) { setLoading(false); return }

    const [{ data: earn }, { data: cost }] = await Promise.all([
      supabase.from('earnings').select('*').eq('event_id', ev.id).order('created_at', { ascending: false }),
      supabase.from('costs').select('*').eq('event_id', ev.id).order('created_at', { ascending: false }),
    ])

    setEarnings(earn || [])
    setCosts(cost || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function totalByCurrency(currency) {
    return earnings
      .filter(e => e.currency === currency)
      .reduce((sum, e) => sum + Number(e.amount), 0)
  }

  const totalCosts = costs.reduce((sum, c) => sum + Number(c.amount), 0)

  if (loading) return <div className="page"><div className="spinner" /></div>

  return (
    <div className="page">
      <Header title="Finans" subtitle={event?.name} />

      <div className="page-content">
        {!event ? (
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <p>Aktif kermes bulunamadı.</p>
          </div>
        ) : (
          <>
            <div className="finance-section">
              <div className="finance-section-title">
                <span>Kazançlar</span>
                <button className="btn btn-sm btn-secondary" onClick={() => setShowAddEarning(true)}>
                  + Ekle
                </button>
              </div>
              <div className="card">
                {earnings.length === 0 ? (
                  <p className="text-muted text-sm">Henüz kazanç girilmemiş</p>
                ) : (
                  earnings.map(e => (
                    <div key={e.id} className="finance-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`badge badge-${e.currency.toLowerCase()}`}>{e.currency}</span>
                        {e.note && <span className="text-sm text-muted">{e.note}</span>}
                      </div>
                      <span style={{ fontWeight: 700 }}>
                        {Number(e.amount).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {['TL', 'USD', 'EUR'].map(cur => {
                const total = totalByCurrency(cur)
                if (total === 0) return null
                return (
                  <div key={cur} className="finance-total">
                    <span className="text-sm">Toplam {cur}</span>
                    <span style={{ fontWeight: 800, fontSize: 16 }}>
                      {total.toLocaleString('tr-TR')} {cur}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="finance-section">
              <div className="finance-section-title">
                <span>Maliyetler</span>
                <button className="btn btn-sm btn-secondary" onClick={() => setShowAddCost(true)}>
                  + Ekle
                </button>
              </div>
              <div className="card">
                {costs.length === 0 ? (
                  <p className="text-muted text-sm">Henüz maliyet girilmemiş</p>
                ) : (
                  costs.map(c => (
                    <div key={c.id} className="finance-item">
                      <span>{c.name}</span>
                      <span style={{ fontWeight: 700 }}>
                        ₺{Number(c.amount).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  ))
                )}
              </div>
              {totalCosts > 0 && (
                <div className="finance-total">
                  <span className="text-sm">Toplam Maliyet</span>
                  <span style={{ fontWeight: 800, fontSize: 16 }}>
                    ₺{totalCosts.toLocaleString('tr-TR')}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showAddEarning && (
        <AddEarningModal
          eventId={event?.id}
          onClose={() => setShowAddEarning(false)}
          onSuccess={fetchData}
        />
      )}
      {showAddCost && (
        <AddCostModal
          eventId={event?.id}
          onClose={() => setShowAddCost(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}
