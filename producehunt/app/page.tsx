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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const QUICK_COMMODITIES = [
  'Strawberries', 'Tomatoes', 'Lettuce', 'Avocados', 'Broccoli',
  'Oranges', 'Lemons', 'Blueberries', 'Spinach', 'Cucumbers',
]

// Approximate seasonal availability by month (1=Jan … 12=Dec)
const SEASONAL: Record<string, number[]> = {
  Strawberries:  [3, 4, 5, 6, 7, 8],
  Asparagus:     [3, 4, 5, 6],
  Cherries:      [5, 6, 7],
  Peaches:       [6, 7, 8, 9],
  Blueberries:   [5, 6, 7, 8, 9],
  Corn:          [6, 7, 8, 9],
  Tomatoes:      [6, 7, 8, 9, 10],
  Watermelon:    [6, 7, 8, 9],
  Apples:        [8, 9, 10, 11],
  Pumpkins:      [9, 10, 11],
  Citrus:        [11, 12, 1, 2, 3],
  Broccoli:      [10, 11, 12, 1, 2, 3],
  Spinach:       [3, 4, 5, 9, 10, 11],
  Lettuce:       [3, 4, 5, 9, 10, 11],
  Avocados:      [2, 3, 4, 5, 6, 7, 8, 9],
}

interface PriceEntry { low: number; high: number; mostlyLow: number | null; mostlyHigh: number | null; date: string | null; description?: string }
interface MarketResult { city: string; reportType: 'terminal' | 'shipping_point'; entries: PriceEntry[] }

function conditionFromDesc(desc: string): { label: string; style: React.CSSProperties } | null {
  const m = desc.match(/MARKET\s+(HIGHER|LOWER|STEADY|FIRM|WEAK|ABOUT\s+STEADY|ACTIVE|SLOW)/i)
  if (!m) return null
  const word = m[1].toUpperCase().replace(/\s+/g, ' ')
  if (['HIGHER', 'FIRM', 'ACTIVE'].includes(word)) return { label: '↑ ' + word.charAt(0) + word.slice(1).toLowerCase(), style: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' } }
  if (['LOWER', 'WEAK', 'SLOW'].includes(word))   return { label: '↓ ' + word.charAt(0) + word.slice(1).toLowerCase(), style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' } }
  return { label: '→ Steady', style: { background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb' } }
}

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

  // Market intelligence state
  const [marketCommodity, setMarketCommodity] = useState<string>('Strawberries')
  const [marketInput, setMarketInput] = useState('')
  const [marketData, setMarketData] = useState<MarketResult[]>([])
  const [marketLoading, setMarketLoading] = useState(false)
  const [marketError, setMarketError] = useState<string | null>(null)
  const [marketFetchedAt, setMarketFetchedAt] = useState<string | null>(null)

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

  useEffect(() => {
    if (sidebarTab !== 'trends' || !marketCommodity) return
    setMarketLoading(true)
    setMarketError(null)
    setMarketData([])
    fetch(`${API_BASE}/usda-market?commodity=${encodeURIComponent(marketCommodity)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setMarketError(data.error); return }
        setMarketData(data.markets || [])
        setMarketFetchedAt(data.fetchedAt || null)
      })
      .catch(() => setMarketError('Failed to load market data.'))
      .finally(() => setMarketLoading(false))
  }, [sidebarTab, marketCommodity])

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
            <a href="/login" className="signin-btn">Supplier login</a>
            <a
              href="/claim"
              className="supplier-link"
            >
              Claim your listing
            </a>
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
                    placeholder="Find produce suppliers — lemons, organic tomatoes, stone fruit..."
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

                {/* About / Footer */}
                <div className="welcome-about">
                  <div className="welcome-about-cols">
                    <div className="welcome-about-col">
                      <p className="welcome-about-heading">What is ProduceHunt?</p>
                      <p className="welcome-about-text">A searchable directory of agricultural suppliers across the U.S. — growers, shippers, and distributors. Search by commodity, region, or certification to find who's growing what and where.</p>
                    </div>
                    <div className="welcome-about-col">
                      <p className="welcome-about-heading">How is data sourced?</p>
                      <p className="welcome-about-text">Listings are built from public records and verified sources (PACA, USDA Organic, GFSI). Suppliers who claim their listing can enrich it with live pricing and direct contact details.</p>
                    </div>
                    <div className="welcome-about-col">
                      <p className="welcome-about-heading">Is your company listed?</p>
                      <p className="welcome-about-text">Hundreds of suppliers are already in the directory. Claim your listing to control what buyers see — update your products, connect live pricing, and get found faster.</p>
                      <a href="/claim" className="welcome-about-cta">Claim your listing →</a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Show Tab Content */
              <div className="tab-content-main">
                {sidebarTab === 'powersearch' && (
                <div className="powersearch-main">

                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h2 style={{ margin: 0 }}>PowerSearch</h2>
                        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 8px', borderRadius: '999px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}>Pro</span>
                      </div>
                      <p className="section-subtitle" style={{ margin: 0 }}>Source your entire procurement list in one shot</p>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '4px 10px', borderRadius: '999px', whiteSpace: 'nowrap', flexShrink: 0 }}>Coming Soon</span>
                  </div>

                  {/* Feature cards — side by side */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '18px 0' }}>

                    {/* Card 1 — PowerSearch (combined upload + list) */}
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>🔍</div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '12px', color: '#111827' }}>PowerSearch</p>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: '#b45309', background: '#fef3c7', border: '1px solid #fde68a', padding: '2px 7px', borderRadius: '999px', whiteSpace: 'nowrap', flexShrink: 0 }}>Soon</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', lineHeight: 1.5 }}>Search your entire procurement list at once. Upload a spec sheet or paste a list — we match suppliers for every line item.</p>
                      {/* Two input method previews */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                        <div style={{ border: '1.5px dashed #d1d5db', borderRadius: '8px', padding: '10px', textAlign: 'center', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px' }}>📄</span>
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Drag &amp; drop spec sheet</span>
                          <span style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '2px 7px' }}>Browse</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }} />
                          <span style={{ fontSize: '10px', color: '#d1d5db', fontWeight: 500 }}>or</span>
                          <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }} />
                        </div>
                        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 10px', fontFamily: 'monospace', fontSize: '10px', color: '#9ca3af', lineHeight: 1.7 }}>
                          <div>— Organic cucumbers (500 lbs)</div>
                          <div>— Cherry tomatoes (200 lbs)</div>
                          <div style={{ color: '#d1d5db' }}>— Paste your list…</div>
                        </div>
                      </div>
                    </div>

                    {/* Card 2 — Source & Route */}
                    <div style={{ background: '#fff', border: '1.5px solid #e0e7ff', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden' }}>
                      {/* Subtle background accent */}
                      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: 'radial-gradient(circle at top right, #eef2ff, transparent 70%)', pointerEvents: 'none' }} />
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>🗺️</div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '12px', color: '#111827' }}>Source &amp; Route</p>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: '#b45309', background: '#fef3c7', border: '1px solid #fde68a', padding: '2px 7px', borderRadius: '999px', whiteSpace: 'nowrap', flexShrink: 0 }}>Soon</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', lineHeight: 1.5 }}>Tell us what you need and a destination. ProduceHunt will optimally source suppliers and build the most efficient pickup route to reduce stops, driving distance, and consolidate supply options.</p>
                      {/* Route */}
                      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>

                        {/* Nodes + connectors */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>

                          {/* Stop 1 */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 52 }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #15803d', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: '7px', fontWeight: 700, color: '#15803d' }}>1</span>
                            </div>
                            <p style={{ margin: '4px 0 0', fontSize: '8px', fontWeight: 600, color: '#111827', textAlign: 'center', lineHeight: 1.2 }}>Valley Fresh</p>
                            <p style={{ margin: '2px 0 0', fontSize: '7.5px', color: '#9ca3af', textAlign: 'center' }}>Salinas, CA</p>
                            <p style={{ margin: '2px 0 0', fontSize: '7.5px', color: '#6b7280', textAlign: 'center' }}>4 pallets</p>
                          </div>

                          {/* Connector 1 → 2 */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', paddingTop: 6 }}>
                            <span style={{ fontSize: '7px', color: '#9ca3af' }}>82 mi</span>
                            <div style={{ width: '100%', borderTop: '1.5px dashed #d1d5db' }} />
                          </div>

                          {/* Stop 2 */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 52 }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #15803d', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: '7px', fontWeight: 700, color: '#15803d' }}>2</span>
                            </div>
                            <p style={{ margin: '4px 0 0', fontSize: '8px', fontWeight: 600, color: '#111827', textAlign: 'center', lineHeight: 1.2 }}>Rio Verde</p>
                            <p style={{ margin: '2px 0 0', fontSize: '7.5px', color: '#9ca3af', textAlign: 'center' }}>Nogales, AZ</p>
                            <p style={{ margin: '2px 0 0', fontSize: '7.5px', color: '#6b7280', textAlign: 'center' }}>6 pallets</p>
                          </div>

                          {/* Connector 2 → dest */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', paddingTop: 6 }}>
                            <span style={{ fontSize: '7px', color: '#9ca3af' }}>131 mi</span>
                            <div style={{ width: '100%', borderTop: '1.5px dashed #d1d5db' }} />
                          </div>

                          {/* Destination */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 52 }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #374151', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#374151' }} />
                            </div>
                            <p style={{ margin: '4px 0 0', fontSize: '8px', fontWeight: 600, color: '#111827', textAlign: 'center', lineHeight: 1.2 }}>Chicago DC</p>
                            <p style={{ margin: '2px 0 0', fontSize: '7.5px', color: '#9ca3af', textAlign: 'center' }}>Chicago, IL</p>
                            <p style={{ margin: '2px 0 0', fontSize: '7.5px', color: '#6b7280', textAlign: 'center' }}>10 pallets</p>
                          </div>

                        </div>

                        {/* Efficiency callout */}
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '7px', padding: '5px 6px', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#15803d' }}>−1 stop</p>
                            <p style={{ margin: 0, fontSize: '7.5px', color: '#16a34a' }}>consolidated</p>
                          </div>
                          <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '7px', padding: '5px 6px', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#15803d' }}>~$340</p>
                            <p style={{ margin: 0, fontSize: '7.5px', color: '#16a34a' }}>freight saved</p>
                          </div>
                          <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '7px', padding: '5px 6px', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#15803d' }}>34°F</p>
                            <p style={{ margin: 0, fontSize: '7.5px', color: '#16a34a' }}>reefer temp</p>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Waitlist CTA */}
                  <div style={{ background: 'linear-gradient(135deg, #fefce8, #fff7ed)', border: '1px solid #fde68a', borderRadius: '12px', padding: '18px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '14px', color: '#92400e' }}>Be first when it launches</p>
                    <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#b45309' }}>PowerSearch is in development. Join the waitlist and we&apos;ll notify you the day it goes live.</p>
                    <a
                      href="/waitlist"
                      style={{ display: 'inline-block', padding: '9px 22px', borderRadius: '8px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontWeight: 700, fontSize: '13px', textDecoration: 'none', boxShadow: '0 1px 4px rgba(217,119,6,0.3)' }}
                    >
                      Join the waitlist →
                    </a>
                  </div>

                </div>
              )}

              {sidebarTab === 'trends' && (
                <div className="trends-main">
                  <div style={{ marginBottom: '6px' }}>
                    <h2 style={{ marginBottom: '4px' }}>Market Intelligence</h2>
                    <p className="section-subtitle" style={{ marginBottom: '0' }}>
                      Wholesale price benchmarks from USDA AMS · what buyers are paying right now
                    </p>
                  </div>

                  {/* Commodity quick-select */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '16px 0 12px' }}>
                    {QUICK_COMMODITIES.map(c => (
                      <button
                        key={c}
                        onClick={() => setMarketCommodity(c)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: marketCommodity === c ? '1.5px solid #166534' : '1.5px solid #e5e7eb',
                          background: marketCommodity === c ? '#166534' : '#fff',
                          color: marketCommodity === c ? '#fff' : '#6b7280',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          whiteSpace: 'nowrap',
                        }}
                      >{c}</button>
                    ))}
                  </div>

                  {/* Custom search */}
                  <form
                    onSubmit={e => { e.preventDefault(); const v = marketInput.trim(); if (v) { setMarketCommodity(v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()); setMarketInput('') } }}
                    style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}
                  >
                    <input
                      value={marketInput}
                      onChange={e => setMarketInput(e.target.value)}
                      placeholder="Search any commodity…"
                      style={{ flex: 1, padding: '7px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px', outline: 'none' }}
                    />
                    <button
                      type="submit"
                      style={{ padding: '7px 14px', borderRadius: '8px', background: '#166534', color: '#fff', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                    >Search</button>
                  </form>

                  {/* Results */}
                  {marketLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '13px', padding: '32px 0' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #d1fae5', borderTopColor: '#166834', animation: 'spin 0.8s linear infinite' }} />
                      Fetching USDA market data for {marketCommodity}…
                    </div>
                  )}
                  {marketError && !marketLoading && (
                    <p style={{ color: '#ef4444', fontSize: '13px', padding: '16px 0' }}>{marketError}</p>
                  )}
                  {!marketLoading && !marketError && marketData.length === 0 && (
                    <p style={{ color: '#9ca3af', fontSize: '13px', padding: '24px 0' }}>No USDA data found for <strong>{marketCommodity}</strong>. Try a broader term like "tomato" or "orange".</p>
                  )}
                  {!marketLoading && !marketError && marketData.length > 0 && (() => {
                    const terminals = marketData.filter(m => m.reportType === 'terminal').slice(0, 4)
                    const fob = marketData.filter(m => m.reportType === 'shipping_point').slice(0, 3)
                    return (
                      <div>
                        {/* Buyer context callout */}
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#166534', marginBottom: '18px', lineHeight: 1.5 }}>
                          <strong>How to read this:</strong> Terminal prices = what distributors &amp; retailers pay at major city hubs. FOB = what growers charge at the farm before freight. Both are per shipping unit (carton, flat, lug).
                        </div>

                        {/* Terminal markets */}
                        {terminals.length > 0 && (
                          <div style={{ marginBottom: '20px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: '8px' }}>
                              Terminal Markets <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— what buyers pay at city hubs</span>
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              {terminals.map((m, i) => {
                                const top = m.entries[0]
                                const cond = top?.description ? conditionFromDesc(top.description) : null
                                const city = m.city.replace(' (Shipping Point)', '')
                                return (
                                  <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px', marginBottom: '6px' }}>
                                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#111827', margin: 0 }}>{city}</p>
                                      {cond && (
                                        <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '999px', whiteSpace: 'nowrap', flexShrink: 0, ...cond.style }}>
                                          {cond.label}
                                        </span>
                                      )}
                                    </div>
                                    {top ? (
                                      <>
                                        <p style={{ fontSize: '16px', fontWeight: 700, color: '#166534', margin: '0 0 2px' }}>
                                          ${top.low.toFixed(2)}–${top.high.toFixed(2)}
                                        </p>
                                        {top.mostlyLow != null && (
                                          <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>mostly ${top.mostlyLow.toFixed(2)}–${top.mostlyHigh!.toFixed(2)}</p>
                                        )}
                                      </>
                                    ) : <p style={{ fontSize: '12px', color: '#d1d5db' }}>—</p>}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* FOB shipping point */}
                        {fob.length > 0 && (
                          <div style={{ marginBottom: '20px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: '8px' }}>
                              FOB / Shipping Point <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— grower prices before freight</span>
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              {fob.map((m, i) => {
                                const top = m.entries[0]
                                const cond = top?.description ? conditionFromDesc(top.description) : null
                                const city = m.city.replace(' (Shipping Point)', '')
                                return (
                                  <div key={i} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px', marginBottom: '6px' }}>
                                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#111827', margin: 0 }}>{city}</p>
                                      {cond && (
                                        <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '999px', whiteSpace: 'nowrap', flexShrink: 0, ...cond.style }}>
                                          {cond.label}
                                        </span>
                                      )}
                                    </div>
                                    {top ? (
                                      <>
                                        <p style={{ fontSize: '16px', fontWeight: 700, color: '#1d4ed8', margin: '0 0 2px' }}>
                                          ${top.low.toFixed(2)}–${top.high.toFixed(2)}
                                        </p>
                                        {top.mostlyLow != null && (
                                          <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>mostly ${top.mostlyLow.toFixed(2)}–${top.mostlyHigh!.toFixed(2)}</p>
                                        )}
                                      </>
                                    ) : <p style={{ fontSize: '12px', color: '#d1d5db' }}>—</p>}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Seasonal now */}
                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: '8px' }}>
                            In Season Now
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {(() => {
                              const month = new Date().getMonth() + 1
                              return Object.entries(SEASONAL)
                                .filter(([, months]) => months.includes(month))
                                .map(([name]) => (
                                  <button
                                    key={name}
                                    onClick={() => setMarketCommodity(name)}
                                    style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '12px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#166534', cursor: 'pointer', fontWeight: 500 }}
                                  >{name}</button>
                                ))
                            })()}
                          </div>
                        </div>

                        {marketFetchedAt && (
                          <p style={{ fontSize: '11px', color: '#d1d5db', marginTop: '16px' }}>
                            USDA AMS · updated {new Date(marketFetchedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    )
                  })()}
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
                                  href={`/supplier/${supplier.slug}`}
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
                            {(result.tier === 1 || result.tier === 2) && (
                              <span className="verified-check" title="Verified ProduceHunt member">✓</span>
                            )}
                          </h4>
                          <p className="location">📍 {result.supplier.location}</p>
                        </div>
                        {(result.tier === 1 || result.tier === 2) && (
                          <div className="card-header-right">
                            {result.tier === 1 && <span className="tier-badge tier-1">Live Pricing</span>}
                            {result.tier === 2 && <span className="tier-badge tier-2">Verified Member</span>}
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
                {selectedSupplier.tier === 2 && <span className="tier-badge tier-2">Verified Member</span>}
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
                href={`/supplier/${selectedSupplier.supplier.slug}`}
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
