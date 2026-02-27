'use client'

import { useState, useRef, useEffect } from 'react'
import './page.css'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface PricingProduct {
  commodity: string
  packageType: string
  price: number | null
  unit?: string
  size?: string
  regionName?: string // shipping point where this product originates
}

interface SearchResult {
  _id: string
  productName: string
  commodity: string
  variety?: string
  isOrganic: boolean
  regionName?: string
  packageType: string
  price: number
  availability: string
  source?: 'supplier' | 'generated'
  tier?: 1 | 2 | 3 | 4
  hasPricing?: boolean
  priceSheetId?: string
  pricingProducts?: PricingProduct[]
  supplier: {
    companyName: string
    location: string
    email?: string
    slug?: string
    verificationScore?: { score: number; maxScore: number } | null
  }
}

const suggestedPrompts = [
  "Cucumbers for food service",
  "Organic tomatoes",
  "Fresh basil in bulk"
]

type ViewMode = 'grid' | 'map'
type SidebarTab = 'powersearch' | 'trends' | 'favorites' | 'history'

interface HistoryItem {
  id: string
  query: string
  timestamp: Date
  resultCount: number
}

const trendItems = [
  { emoji: '🔴', title: 'Supply Alert', subtitle: 'Lettuce prices up 15% this week', type: 'alert' },
  { emoji: '🌤️', title: 'Weather Impact', subtitle: 'CA frost affecting stone fruit supply', type: 'news' },
  { emoji: '📈', title: 'Price Surge', subtitle: 'Organic berries trending upward', type: 'trend' },
  { emoji: '🍓', title: 'Now in Season', subtitle: 'Strawberries, asparagus peak availability', type: 'seasonal' },
  { emoji: '📰', title: 'Market Update', subtitle: 'Mexico cucumber harvest ahead of schedule', type: 'news' },
]

export default function ProduceHunt() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sidebarTab, setSidebarTab] = useState<SidebarTab | null>(null) // null = welcome screen
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showConversation, setShowConversation] = useState(false)
  const [favoriteSuppliers, setFavoriteSuppliers] = useState<any[]>([])
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<SearchResult | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('producehunt_history')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }

    // Load favorite slugs
    const savedFavorites = localStorage.getItem('favoriteSuppliers')
    if (savedFavorites) {
      setFavoriteSlugs(JSON.parse(savedFavorites))
    }
  }, [])

  // Fetch favorite suppliers when Favorites tab is opened
  useEffect(() => {
    if (sidebarTab === 'favorites' && favoriteSlugs.length > 0) {
      fetchFavoriteSuppliers()
    }
  }, [sidebarTab, favoriteSlugs])

  const fetchFavoriteSuppliers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/public/suppliers')
      const data = await response.json()
      const favorites = data.suppliers.filter((s: any) => favoriteSlugs.includes(s.slug))
      setFavoriteSuppliers(favorites)
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSearch = async (text?: string) => {
    const searchText = text || input
    if (!searchText.trim()) return

    setInput('')
    setIsLoading(true)
    setShowConversation(true) // Switch to conversation mode

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: searchText
    }
    setMessages(prev => [...prev, userMsg])

    try {
      // Call search API
      const response = await fetch(
        `http://localhost:3001/api/public/search-products?q=${encodeURIComponent(searchText)}&limit=20`
      )
      const data = await response.json()

      // Add AI response with follow-up questions
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.results.length > 0
          ? `I found ${data.results.length} ${data.results.length === 1 ? 'supplier' : 'suppliers'} for ${searchText}. To help narrow this down:\n\n• Do you need organic or conventional?\n• What package size? (bulk, cartons, individual)\n• Any specific delivery location?`
          : `No results found for "${searchText}". Try different search terms like cucumber, tomato, or basil.`
      }
      setMessages(prev => [...prev, aiMsg])

      // Update results
      setResults(data.results || [])

      // Add to history
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        query: searchText,
        timestamp: new Date(),
        resultCount: data.results.length
      }
      const newHistory = [historyItem, ...history].slice(0, 20) // Keep last 20
      setHistory(newHistory)
      localStorage.setItem('producehunt_history', JSON.stringify(newHistory))

    } catch (error) {
      console.error('Search error:', error)
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error searching. Please try again.'
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleNewSearch = () => {
    setMessages([])
    setResults([])
    setInput('')
    setShowConversation(false)
    setSidebarTab(null) // Back to welcome screen
    inputRef.current?.focus()
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('producehunt_history')
  }

  return (
    <div className="app-container">
      {/* Dynamic 2-col / 3-col Layout */}
      <div className={`perplexity-layout ${showConversation ? 'three-column' : 'two-column'}`}>
        {/* Left Sidebar (Narrow) */}
        <aside className="sidebar">
          {/* Logo */}
          <div className="sidebar-logo">
            <span className="logo-icon">🥬</span>
          </div>

          {/* New Search Button */}
          <button className="new-search-btn" onClick={handleNewSearch}>
            +
          </button>

          {/* Vertical Tabs */}
          <div className="sidebar-nav">
            <button
              className={`nav-item ${sidebarTab === 'powersearch' ? 'active' : ''}`}
              onClick={() => {
                setSidebarTab('powersearch')
                setShowConversation(false)
              }}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                  <path d="M11 8v6M8 11h6" />
                </svg>
              </span>
              <span className="nav-label">PowerSearch</span>
            </button>
            <button
              className={`nav-item ${sidebarTab === 'trends' ? 'active' : ''}`}
              onClick={() => {
                setSidebarTab('trends')
                setShowConversation(false)
              }}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </span>
              <span className="nav-label">Trends</span>
            </button>
            <button
              className={`nav-item ${sidebarTab === 'favorites' ? 'active' : ''}`}
              onClick={() => {
                setSidebarTab('favorites')
                setShowConversation(false)
              }}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill={sidebarTab === 'favorites' ? 'currentColor' : 'none'}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </span>
              <span className="nav-label">Favorites</span>
            </button>
            <button
              className={`nav-item ${sidebarTab === 'history' ? 'active' : ''}`}
              onClick={() => {
                setSidebarTab('history')
                setShowConversation(false)
              }}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              <span className="nav-label">History</span>
            </button>
          </div>

          {/* Spacer to push auth to bottom */}
          <div style={{ flex: 1 }}></div>

          {/* Auth Button at Bottom */}
          <div className="sidebar-footer">
            <button className="signin-btn">Sign In</button>
          </div>
        </aside>

        {/* Center Panel: Welcome, Tab Content, or Conversation */}
        <main className="center-panel">
          {!showConversation ? (
            sidebarTab === null ? (
              /* Welcome/Landing Screen */
              <div className="welcome-state">
                <h1>Source produce as fast as you can type</h1>
                <p className="welcome-subtitle">
                  AI-powered sourcing for CPG and Retail procurement teams
                </p>

                {/* Search Input */}
                <div className="search-box-large">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="What are you looking to buy?"
                    autoFocus
                    disabled={isLoading}
                  />
                  <button
                    className="search-btn"
                    onClick={() => handleSearch()}
                    disabled={!input.trim() || isLoading}
                  >
                    →
                  </button>
                </div>

                {/* Suggestion Chips */}
                <div className="suggestion-chips">
                  {suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(prompt)}
                      className="chip"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Show Tab Content */
              <div className="tab-content-main">
                {sidebarTab === 'powersearch' && (
                <div className="powersearch-main">
                  <h2>PowerSearch</h2>
                  <p className="section-subtitle">Search multiple products at once - upload specs or paste your list</p>

                  <div className="powersearch-grid">
                    <div className="powersearch-card">
                      <div className="powersearch-header">
                        <span className="powersearch-icon">📄</span>
                        <div>
                          <h3>Upload Spec Sheet</h3>
                          <p>Drop PDF or CSV to auto-match suppliers</p>
                        </div>
                      </div>
                      <div className="upload-area">
                        <p>Drag & drop your spec sheet here</p>
                        <button className="upload-btn">Choose File</button>
                      </div>
                    </div>

                    <div className="powersearch-card">
                      <div className="powersearch-header">
                        <span className="powersearch-icon">🛒</span>
                        <div>
                          <h3>Ingredient List Search</h3>
                          <p>Paste list to bulk search all items</p>
                        </div>
                      </div>
                      <textarea
                        className="ingredient-textarea"
                        placeholder="Paste your ingredient list here...&#10;Example:&#10;- Organic cucumbers (500 lbs)&#10;- Cherry tomatoes (200 lbs)&#10;- Fresh basil (50 lbs)"
                      ></textarea>
                      <button className="search-btn-large">Search All Items</button>
                    </div>
                  </div>
                </div>
              )}

              {sidebarTab === 'trends' && (
                <div className="trends-main">
                  <h2>Market Trends & Intelligence</h2>
                  <p className="section-subtitle">Stay ahead with real-time supply chain updates</p>

                  <div className="trends-grid">
                    {trendItems.map((item, idx) => (
                      <div key={idx} className={`trend-card ${item.type}`}>
                        <span className="trend-emoji-large">{item.emoji}</span>
                        <div className="trend-content">
                          <span className="trend-badge">{item.type}</span>
                          <h3>{item.title}</h3>
                          <p>{item.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sidebarTab === 'favorites' && (
                <div className="favorites-main">
                  <div className="favorites-header">
                    <div>
                      <h2>My Favorites</h2>
                      <p className="section-subtitle">Your starred suppliers for quick access</p>
                    </div>
                    <a href="/directory" className="browse-all-btn">
                      Browse All Suppliers →
                    </a>
                  </div>

                  {favoriteSuppliers.length > 0 ? (
                    <div className="favorites-table-container">
                      <table className="favorites-table">
                        <thead>
                          <tr>
                            <th>Company</th>
                            <th>Products</th>
                            <th>Location</th>
                            <th>Verification Score</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {favoriteSuppliers.map((supplier) => (
                            <tr key={supplier.id}>
                              <td className="company-cell">
                                <div className="company-name">{supplier.companyName}</div>
                              </td>
                              <td className="products-cell">
                                <div className="product-tags-inline">
                                  {supplier.products.slice(0, 2).map((product: string, idx: number) => (
                                    <span key={idx} className="product-tag-small">{product}</span>
                                  ))}
                                  {supplier.products.length > 2 && (
                                    <span className="product-tag-small more">+{supplier.products.length - 2}</span>
                                  )}
                                </div>
                              </td>
                              <td className="location-cell">
                                {supplier.location.city && supplier.location.state
                                  ? `${supplier.location.city}, ${supplier.location.state}`
                                  : supplier.location.full || 'Unknown'}
                              </td>
                              <td className="score-cell">
                                {supplier.verificationScore ? (
                                  <div className="score-compact">
                                    <div className="score-bar-mini">
                                      <div
                                        className="score-bar-fill"
                                        style={{ width: `${supplier.verificationScore.percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="score-text-mini">
                                      {supplier.verificationScore.score}/{supplier.verificationScore.maxScore}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td className="action-cell">
                                <a
                                  href={`/directory/${supplier.slug}`}
                                  className="view-profile-btn-small"
                                >
                                  View →
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-state-large">
                      <div className="empty-icon-large">⭐</div>
                      <h3>No favorites yet</h3>
                      <p>Star suppliers in the directory to see them here for quick access</p>
                      <a href="/directory" className="browse-btn-large">
                        Browse Suppliers
                      </a>
                    </div>
                  )}
                </div>
              )}

              {sidebarTab === 'history' && (
                <div className="history-main">
                  <div className="history-header">
                    <div>
                      <h2>Search History</h2>
                      <p className="section-subtitle">Your recent searches and results</p>
                    </div>
                    {history.length > 0 && (
                      <button className="clear-history-btn" onClick={clearHistory}>
                        Clear History
                      </button>
                    )}
                  </div>

                  {history.length > 0 ? (
                    <div className="history-grid">
                      {history.map((item) => (
                        <button
                          key={item.id}
                          className="history-card"
                          onClick={() => handleSearch(item.query)}
                        >
                          <div className="history-card-query">{item.query}</div>
                          <div className="history-card-meta">
                            <span className="result-count">{item.resultCount} suppliers found</span>
                            <span className="history-date">{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state-large">
                      <div className="empty-icon-large">📜</div>
                      <h3>No search history yet</h3>
                      <p>Your searches will appear here so you can easily revisit them</p>
                    </div>
                  )}
                </div>
              )}
              </div>
            )
          ) : (
            /* Conversation Mode */
            <>
              <div className="conversation">
                {messages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.role}`}>
                    <div className="message-content">
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message assistant">
                    <div className="message-content loading">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input at Bottom */}
              <div className="conversation-input">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Ask a follow-up question..."
                  disabled={isLoading}
                />
                <button
                  className="send-btn"
                  onClick={() => handleSearch()}
                  disabled={!input.trim() || isLoading}
                >
                  →
                </button>
              </div>
            </>
          )}
        </main>

        {/* Right Panel: Results (only show during conversation) */}
        {showConversation && (
          <aside className="right-panel">
          {/* Results Header with View Toggle */}
          <div className="results-toolbar">
            <div className="results-count">
              {results.length > 0 ? (
                <span>{results.length} {results.length === 1 ? 'Supplier' : 'Suppliers'}</span>
              ) : (
                <span>Search to see suppliers</span>
              )}
            </div>
            <div className="view-toggle">
              <button
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                ⊞ Grid
              </button>
              <button
                className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
              >
                🗺 Map
              </button>
            </div>
          </div>

          {/* Results Display */}
          <div className="results-container">
            {viewMode === 'grid' ? (
              results.length > 0 ? (
                <div className="results-grid">
                  {results.map((result) => (
                    <div key={result._id} className="result-card">
                      <div className="card-header">
                        <div>
                          <h4
                            className="supplier-name-link"
                            onClick={() => setSelectedSupplier(result)}
                          >
                            {result.supplier.companyName}
                          </h4>
                          <p className="location">📍 {result.supplier.location}</p>
                        </div>
                        {(result.tier === 1 || result.tier === 2) && (
                          <div className="card-header-right">
                            {result.tier === 1 && <span className="tier-badge tier-1">Live Pricing</span>}
                            {result.tier === 2 && <span className="tier-badge tier-2">Member</span>}
                          </div>
                        )}
                      </div>

                      <div className="product-info">
                        <h5 className="product-name">
                          {result.productName}
                          {result.isOrganic && <span className="badge organic">🌿 Organic</span>}
                        </h5>
                        {(result.variety || result.regionName) && (
                          <p className="product-variety">
                            {result.variety && `Variety: ${result.variety}`}
                            {result.regionName && ` • ${result.regionName}`}
                          </p>
                        )}
                        {result.hasPricing && result.pricingProducts && result.pricingProducts.length > 0 ? (
                          <div className="pricing-details">
                            {result.pricingProducts.slice(0, 2).map((p, i) => (
                              <div key={i} className="pricing-row">
                                <span className="pricing-package">
                                  {p.packageType || 'Various'}{p.size ? ` · ${p.size}` : ''}
                                  {p.regionName && <span className="pricing-region"> · {p.regionName}</span>}
                                </span>
                                {p.price !== null && p.price > 0 ? (
                                  <span className="pricing-price">
                                    ${p.price.toFixed(2)}{p.unit ? `/${p.unit}` : ''}
                                  </span>
                                ) : (
                                  <span className="pricing-contact">Contact for price</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : result.hasPricing ? (
                          <div className="pricing-badge">💰 Pricing available</div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>Ready to find suppliers?</h3>
                  <p>Search for produce above and I'll help you find the best suppliers for your needs.</p>
                </div>
              )
            ) : (
              <div className="map-view">
                <div className="map-placeholder">
                  <div className="empty-icon">🗺️</div>
                  <h3>Map View Coming Soon</h3>
                  <p>We're building an interactive map to show supplier locations.</p>
                </div>
              </div>
            )}
          </div>
        </aside>
        )}
      </div>

      {/* Supplier Modal */}
      {selectedSupplier && (
        <div className="modal-backdrop" onClick={() => setSelectedSupplier(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-company-name">{selectedSupplier.supplier.companyName}</h2>
                <p className="modal-location">📍 {selectedSupplier.supplier.location}</p>
              </div>
              <button className="modal-close" onClick={() => setSelectedSupplier(null)}>✕</button>
            </div>

            <div className="modal-body">
              {/* Tier / status badges */}
              <div className="modal-badges">
                {selectedSupplier.tier === 1 && <span className="tier-badge tier-1">Live Pricing</span>}
                {selectedSupplier.tier === 2 && <span className="tier-badge tier-2">AcreList Member</span>}
                {selectedSupplier.isOrganic && <span className="badge organic">🌿 Organic</span>}
              </div>

              {/* Product + pricing */}
              <div className="modal-section">
                <div className="modal-section-label">Product</div>
                <div className="modal-product-name">{selectedSupplier.productName}</div>
                {selectedSupplier.variety && (
                  <div className="modal-variety">Variety: {selectedSupplier.variety}</div>
                )}
              </div>

              {selectedSupplier.hasPricing && selectedSupplier.pricingProducts && selectedSupplier.pricingProducts.length > 0 && (
                <div className="modal-section">
                  <div className="modal-section-label">Current Pricing</div>
                  <div className="modal-pricing">
                    {selectedSupplier.pricingProducts.map((p, i) => (
                      <div key={i} className="modal-pricing-row">
                        <span className="modal-pricing-pkg">
                          {p.packageType || 'Various'}{p.size ? ` · ${p.size}` : ''}
                          {p.regionName && <span className="modal-pricing-region"> · {p.regionName}</span>}
                        </span>
                        {p.price !== null && p.price > 0 ? (
                          <span className="modal-pricing-price">
                            ${p.price.toFixed(2)}{p.unit ? `/${p.unit}` : ''}
                          </span>
                        ) : (
                          <span className="pricing-contact">Contact for price</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification score */}
              {selectedSupplier.supplier.verificationScore && (
                <div className="modal-section">
                  <div className="modal-section-label">Verification Score</div>
                  <div className="modal-score">
                    <div className="modal-score-bar">
                      <div
                        className="modal-score-fill"
                        style={{
                          width: `${Math.round(
                            (selectedSupplier.supplier.verificationScore.score /
                              selectedSupplier.supplier.verificationScore.maxScore) * 100
                          )}%`
                        }}
                      />
                    </div>
                    <span className="modal-score-label">
                      {selectedSupplier.supplier.verificationScore.score} / {selectedSupplier.supplier.verificationScore.maxScore}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {selectedSupplier.supplier.email && (
                <a href={`mailto:${selectedSupplier.supplier.email}`} className="modal-contact-btn">
                  Contact Supplier
                </a>
              )}
              <a
                href={`/directory/${selectedSupplier.supplier.slug}`}
                className="modal-profile-link"
              >
                View Full Profile →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
