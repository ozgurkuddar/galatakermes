import { useState, useEffect, useContext, useCallback, useRef } from 'react'
import { AuthContext } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import AddCategoryModal from '../components/modals/AddCategoryModal'
import AddProductModal from '../components/modals/AddProductModal'
import UpdatePriceModal from '../components/modals/UpdatePriceModal'
import EditCategoryModal from '../components/modals/EditCategoryModal'
import MoveProductModal from '../components/modals/MoveProductModal'
import NewEventModal from '../components/modals/NewEventModal'

export default function CategoriesPage() {
  const { profile } = useContext(AuthContext)
  const isEditor = profile?.role === 'editor' || profile?.role === 'admin'

  const [event, setEvent] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [expandedCats, setExpandedCats] = useState(new Set())
  const [deletingCatId, setDeletingCatId] = useState(null)
  const [activeProdId, setActiveProdId] = useState(null)
  const [search, setSearch] = useState('')

  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(null)
  const [showAddProductMain, setShowAddProductMain] = useState(false)
  const [showUpdatePrice, setShowUpdatePrice] = useState(null)
  const [showEditCategory, setShowEditCategory] = useState(null)
  const [showMoveProduct, setShowMoveProduct] = useState(null)
  const [showNewEvent, setShowNewEvent] = useState(false)

  const fetchData = useCallback(async () => {
    const { data: ev } = await supabase
      .from('events').select('*').eq('is_active', true).single()

    setEvent(ev)
    if (!ev) { setLoading(false); setRefreshing(false); return }

    const { data: cats } = await supabase
      .from('categories')
      .select('*, products(*, prices(id, amount, created_at))')
      .eq('event_id', ev.id)
      .order('created_at', { ascending: true })

    const sorted = (cats || []).map(cat => ({
      ...cat,
      products: (cat.products || [])
        .map(p => ({
          ...p,
          prices: [...(p.prices || [])].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          ),
        }))
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    }))

    setCategories(sorted)
    setLastUpdated(new Date())
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Auto-expand matching categories when searching
  useEffect(() => {
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchingIds = categories
        .filter(cat => cat.products.some(p => p.name.toLowerCase().includes(q)))
        .map(c => c.id)
      setExpandedCats(new Set(matchingIds))
      setActiveProdId(null)
    }
  }, [search, categories])

  async function handleRefresh() {
    setRefreshing(true)
    await fetchData()
  }

  function toggleCat(catId) {
    setExpandedCats(prev => {
      const next = new Set(prev)
      next.has(catId) ? next.delete(catId) : next.add(catId)
      return next
    })
  }

  function toggleAll() {
    if (expandedCats.size === displayCategories.length) {
      setExpandedCats(new Set())
    } else {
      setExpandedCats(new Set(displayCategories.map(c => c.id)))
    }
  }

  async function deleteCategory(catId) {
    await supabase.from('categories').delete().eq('id', catId)
    setDeletingCatId(null)
    fetchData()
  }

  function formatEventDate(dateStr) {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  function formatTime(date) {
    if (!date) return ''
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  }

  const q = search.trim().toLowerCase()
  const displayCategories = q
    ? categories
        .map(cat => ({
          ...cat,
          products: cat.products.filter(p => p.name.toLowerCase().includes(q)),
        }))
        .filter(cat => cat.products.length > 0)
    : categories

  const allExpanded = displayCategories.length > 0 && expandedCats.size === displayCategories.length

  if (loading) return <div className="page"><div className="spinner" /></div>

  return (
    <div className="page">
      <Header
        title={event?.name || 'Kermes'}
        subtitle={
          event?.event_date
            ? `${formatEventDate(event.event_date)}${lastUpdated ? ' · ' + formatTime(lastUpdated) : ''}`
            : lastUpdated ? `Son yenileme: ${formatTime(lastUpdated)}` : undefined
        }
      >
        <button className="refresh-btn" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? '⏳' : '🔄'} Yenile
        </button>
        {isEditor && (
          <button className="btn btn-icon btn-secondary" onClick={() => setShowNewEvent(true)} title="Yeni Kermes">
            📅
          </button>
        )}
      </Header>

      <div className="page-content">
        {event?.event_date && <CountdownBanner eventDate={event.event_date} />}
        {!event ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎪</div>
            <p>Aktif kermes bulunamadı.</p>
            {isEditor && (
              <button className="btn btn-primary mt-16" onClick={() => setShowNewEvent(true)}>
                + Yeni Kermes Oluştur
              </button>
            )}
          </div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p>Henüz ürün eklenmemiş.</p>
          </div>
        ) : (
          <>
            <div className="search-bar-wrap">
              <div className="search-bar-inner">
                <span className="search-icon">🔍</span>
                <input
                  type="search"
                  className="search-input"
                  placeholder="Ürün ara..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button className="search-clear" onClick={() => setSearch('')}>✕</button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button className="btn btn-sm btn-ghost" onClick={toggleAll}>
                {allExpanded ? 'Tümünü Kapat' : 'Tümünü Aç'}
              </button>
            </div>

            {displayCategories.length === 0 && q ? (
              <div className="empty-state" style={{ padding: '32px 20px' }}>
                <div className="empty-state-icon">🔍</div>
                <p>"{search}" için sonuç bulunamadı.</p>
              </div>
            ) : (
              displayCategories.map(cat => {
                const isExpanded = expandedCats.has(cat.id)
                const isDeleting = deletingCatId === cat.id

                return (
                  <div key={cat.id} className="category-card">
                    <div className="category-header">
                      <button className="category-toggle" onClick={() => !isDeleting && toggleCat(cat.id)}>
                        <div className="category-title">
                          <span>{cat.emoji || '📦'}</span>
                          <span>{cat.name}</span>
                        </div>
                        <span className="cat-count">{cat.products.length}</span>
                        <span className={`cat-chevron ${isExpanded ? 'open' : ''}`}>▶</span>
                      </button>

                      {isEditor && (
                        <div className="category-actions" onClick={e => e.stopPropagation()}>
                          {isDeleting ? (
                            <>
                              <span className="text-sm text-danger">Sil?</span>
                              <button className="btn btn-sm btn-danger" onClick={() => deleteCategory(cat.id)}>Evet</button>
                              <button className="btn btn-sm btn-secondary" onClick={() => setDeletingCatId(null)}>İptal</button>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-sm btn-secondary" onClick={() => { setShowAddProduct(cat.id); }}>
                                + Ürün
                              </button>
                              <button className="btn btn-icon btn-secondary" onClick={() => setShowEditCategory(cat)} title="Düzenle">✏️</button>
                              <button className="btn btn-icon btn-danger" onClick={() => setDeletingCatId(cat.id)} title="Sil">🗑️</button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="cat-products">
                        {cat.products.length === 0 ? (
                          <p className="text-muted text-sm" style={{ padding: '8px 0' }}>Henüz ürün yok</p>
                        ) : (
                          cat.products.map(product => {
                            const isActive = activeProdId === product.id
                            return (
                              <div
                                key={product.id}
                                className={`product-item${isEditor ? ' product-item-tappable' : ''}`}
                                onClick={() => {
                                  if (isEditor) setActiveProdId(isActive ? null : product.id)
                                }}
                              >
                                <div className="product-row">
                                  <div className="product-name">
                                    <span>{product.emoji || '🏷️'}</span>
                                    <span>{product.name}</span>
                                  </div>
                                  <CurrentPrice prices={product.prices} />
                                </div>
                                <PriceHistory prices={product.prices} />
                                {isEditor && isActive && (
                                  <div className="product-actions" onClick={e => e.stopPropagation()}>
                                    <button
                                      className="btn btn-sm btn-secondary"
                                      onClick={() => { setShowUpdatePrice(product); setActiveProdId(null) }}
                                    >
                                      💰 Fiyat Güncelle
                                    </button>
                                    <button
                                      className="btn btn-icon btn-secondary"
                                      onClick={() => { setShowMoveProduct(product); setActiveProdId(null) }}
                                      title="Taşı"
                                    >
                                      📂
                                    </button>
                                  </div>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}

            {isEditor && !q && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="section-add-btn" onClick={() => setShowAddProductMain(true)} style={{ flex: 1 }}>
                  + Ürün Ekle
                </button>
                <button className="section-add-btn" onClick={() => setShowAddCategory(true)} style={{ flex: 1 }}>
                  + Kategori Ekle
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showAddCategory && event && (
        <AddCategoryModal eventId={event.id} onClose={() => setShowAddCategory(false)} onSuccess={fetchData} />
      )}
      {showAddProduct && (
        <AddProductModal categoryId={showAddProduct} onClose={() => setShowAddProduct(null)} onSuccess={fetchData} />
      )}
      {showAddProductMain && event && (
        <AddProductModal categories={categories} eventId={event.id} onClose={() => setShowAddProductMain(false)} onSuccess={fetchData} />
      )}
      {showUpdatePrice && (
        <UpdatePriceModal product={showUpdatePrice} onClose={() => setShowUpdatePrice(null)} onSuccess={fetchData} />
      )}
      {showEditCategory && (
        <EditCategoryModal category={showEditCategory} onClose={() => setShowEditCategory(null)} onSuccess={fetchData} />
      )}
      {showMoveProduct && (
        <MoveProductModal product={showMoveProduct} categories={categories} onClose={() => setShowMoveProduct(null)} onSuccess={fetchData} />
      )}
      {showNewEvent && (
        <NewEventModal onClose={() => setShowNewEvent(false)} onSuccess={fetchData} />
      )}
    </div>
  )
}

function CountdownBanner({ eventDate }) {
  const [now, setNow] = useState(() => new Date())
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const start = new Date(eventDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(eventDate)
  end.setHours(23, 59, 59, 999)

  if (now > end) {
    return (
      <div className="countdown-banner countdown-ended">
        <span className="countdown-icon">🎪</span>
        <span className="countdown-label">Kermes bitti</span>
      </div>
    )
  }

  if (now >= start) {
    return (
      <div className="countdown-banner countdown-live">
        <span className="countdown-icon">🎉</span>
        <span className="countdown-label">Kermes başladı!</span>
      </div>
    )
  }

  const diff = start - now
  const days    = Math.floor(diff / 86400000)
  const hours   = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  return (
    <div className="countdown-banner countdown-upcoming">
      <div className="countdown-title">Kermese kalan süre</div>
      <div className="countdown-units">
        {days > 0 && (
          <div className="countdown-unit">
            <span className="countdown-num">{days}</span>
            <span className="countdown-lbl">gün</span>
          </div>
        )}
        <div className="countdown-unit">
          <span className="countdown-num">{String(hours).padStart(2,'0')}</span>
          <span className="countdown-lbl">saat</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-num">{String(minutes).padStart(2,'0')}</span>
          <span className="countdown-lbl">dak</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-num">{String(seconds).padStart(2,'0')}</span>
          <span className="countdown-lbl">sn</span>
        </div>
      </div>
    </div>
  )
}

function getValidPrices(prices) {
  return (prices || []).filter(p => Number(p.amount) > 0)
}

function CurrentPrice({ prices }) {
  const valid = getValidPrices(prices)
  if (valid.length === 0) {
    return <span className="price-badge-unset">—</span>
  }
  const current = Number(valid[valid.length - 1].amount)
  const hasHistory = valid.length > 1
  return (
    <span className={hasHistory ? 'price-badge price-badge-current' : 'price-badge price-badge-single'}>
      ₺{current.toLocaleString('tr-TR')}
    </span>
  )
}

function PriceHistory({ prices }) {
  const valid = getValidPrices(prices)
  if (valid.length <= 1) return null

  const first = Number(valid[0].amount)
  const current = Number(valid[valid.length - 1].amount)
  const discountPct = first > current ? Math.round((1 - current / first) * 100) : 0
  const oldPrices = valid.slice(0, -1)

  return (
    <div className="price-history">
      <div className="price-history-items">
        {oldPrices.map((p, i) => (
          <span key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {i > 0 && <span className="price-chain-arrow">→</span>}
            <span className="price-badge price-badge-old">
              ₺{Number(p.amount).toLocaleString('tr-TR')}
            </span>
          </span>
        ))}
      </div>
      {discountPct > 0 && (
        <span className="discount-badge">↓ %{discountPct} indirim</span>
      )}
    </div>
  )
}
