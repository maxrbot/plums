'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChartBarIcon, ArrowTopRightOnSquareIcon, InformationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { cropsApi } from '@/lib/api'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface PriceEntry {
  low: number
  high: number
  mostlyLow: number | null
  mostlyHigh: number | null
  date: string | null
  description?: string
}

interface MarketResult {
  city: string
  reportType: 'terminal' | 'shipping_point'
  entries: PriceEntry[]
}

function formatDate(raw: string | null) {
  if (!raw) return null
  try {
    return new Date(raw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return raw
  }
}

// Cleans raw USDA description text: collapses whitespace, strips section header junk
// e.g. "---ORANGES: MARKET ABOUT STEADY. cartons..." → "MARKET ABOUT STEADY. cartons..."
function cleanDesc(desc: string): string {
  return desc
    .replace(/\s+/g, ' ')
    .replace(/^-*[A-Z][A-Z /&'()-]+:\s*/i, '') // strip "---ORANGES: " or "ORANGES: " prefix
    .trim()
}

// Keywords that indicate a description has full context (variety, origin, pack, grade).
// Short entries lacking these are "continuation" rows that inherit context from above.
const CONTEXT_RE = /\b(carton|flat|lug|bag|box|bin|crate|basket|pallet|bushel|film|california|florida|arizona|washington|oregon|texas|mexico|chile|peru|colombia|navel|valencia|hass|eureka|lisbon|fuji|gala|honeycrisp|shippers|fancy|u\.s\.)\b/i

function isRichDesc(desc: string): boolean {
  return CONTEXT_RE.test(desc)
}

// Strip trailing size count so carry-forward context doesn't include the previous size.
// e.g. "7/10 bu cartons CALIFORNIA NAVEL 36s" → "7/10 bu cartons CALIFORNIA NAVEL"
function stripTrailingSize(desc: string): string {
  return desc.replace(/\s+\d{2,3}s\s*$/i, '').trim()
}

// For each entry, build a display description that carries forward context when
// a row is a short continuation (just a size or quality note).
// If the variety/pack changes mid-list, the new rich description resets the context.
function buildDisplayDescs(entries: PriceEntry[]): string[] {
  let context = ''
  return entries.map(e => {
    const raw = cleanDesc(e.description ?? '')
    if (isRichDesc(raw)) {
      context = stripTrailingSize(raw)
      return raw
    }
    if (!raw) return context
    return context ? `${context} · ${raw}` : raw
  })
}

// Extracts the USDA market condition + optional narrative from the first entry's description.
// e.g. "MARKET HIGHER." → { label: "↑ Higher", narrative: null }
// e.g. "MARKET STEADY. wide range in quality." → { label: "→ Steady", narrative: "Wide range in quality" }
function extractMarketCondition(desc: string): { label: string; pill: string; narrative: string | null } | null {
  const m = desc.match(/MARKET\s+(HIGHER|LOWER|STEADY|FIRM|WEAK|ABOUT\s+STEADY|ACTIVE|SLOW)[.\s]*([^.]{5,60}\.)?/i)
  if (!m || !m[1]) return null
  const word = m[1].replace(/\s+/g, ' ').trim()
  const up = word.toUpperCase()

  // Extract narrative sentence after condition if present and meaningful
  let narrative: string | null = null
  if (m[2]) {
    const raw = m[2].replace(/\.$/, '').trim()
    // Only keep if it reads as a sentence, not package/price info
    if (raw.length > 8 && !/^\d/.test(raw) && !/^(?:carton|flat|bag|box|bulk)/i.test(raw)) {
      narrative = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
    }
  }

  if (up === 'HIGHER' || up === 'FIRM' || up === 'ACTIVE')
    return { label: '↑ ' + word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(), pill: 'bg-emerald-50 text-emerald-700 border border-emerald-100', narrative }
  if (up === 'LOWER' || up === 'WEAK' || up === 'SLOW')
    return { label: '↓ ' + word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(), pill: 'bg-red-50 text-red-600 border border-red-100', narrative }
  return { label: '→ ' + word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(), pill: 'bg-gray-50 text-gray-500 border border-gray-200', narrative }
}


function InfoTooltip({ children }: { children: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <span ref={ref} className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="text-gray-300 hover:text-gray-500 focus:outline-none"
      >
        <InformationCircleIcon className="h-3.5 w-3.5" />
      </button>
      {open && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-gray-900 text-white text-xs rounded-lg z-20 leading-relaxed shadow-lg">
          {children}
          {/* arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  )
}

function EntryRow({
  entry,
  isTop,
  color,
  displayDesc,
}: {
  entry: PriceEntry
  isTop?: boolean
  color: 'emerald' | 'blue'
  displayDesc?: string
}) {
  const priceClass = isTop
    ? `text-lg font-bold ${color === 'emerald' ? 'text-emerald-700' : 'text-blue-700'}`
    : `text-sm font-semibold ${color === 'emerald' ? 'text-emerald-600' : 'text-blue-600'}`

  return (
    <div className={`${isTop ? '' : 'pt-2 border-t border-gray-100'}`}>
      <p className="leading-tight">
        <span className={priceClass}>${entry.low.toFixed(2)}–${entry.high.toFixed(2)}</span>
      </p>
      {entry.mostlyLow != null && entry.mostlyHigh != null && (
        <p className="text-xs mt-0.5">
          <span className="text-gray-400">mostly </span>
          <span className="font-medium text-gray-600">${entry.mostlyLow.toFixed(2)}–${entry.mostlyHigh.toFixed(2)}</span>
        </p>
      )}
      {displayDesc && (
        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{displayDesc}</p>
      )}
    </div>
  )
}

function MarketColumn({
  title,
  tooltip,
  markets,
  commodity,
  color,
}: {
  title: string
  tooltip: string
  markets: MarketResult[]
  commodity: string
  color: 'emerald' | 'blue'
}) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setSelectedCity(null)
    setExpanded(false)
  }, [markets])

  const headingClass = color === 'emerald' ? 'text-emerald-700' : 'text-blue-700'
  const activePillClass = color === 'emerald'
    ? 'bg-emerald-700 text-white border-emerald-700'
    : 'bg-blue-700 text-white border-blue-700'
  const cardClass = color === 'emerald'
    ? 'border-emerald-100 bg-white'
    : 'border-blue-100 bg-blue-50/30'
  const expandClass = color === 'emerald'
    ? 'text-emerald-600 hover:text-emerald-700'
    : 'text-blue-600 hover:text-blue-700'

  if (markets.length === 0) {
    return (
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold uppercase tracking-wide mb-3 flex items-center ${headingClass}`}>
          {title}
          <InfoTooltip>{tooltip}</InfoTooltip>
        </p>
        <p className="text-xs text-gray-300 py-4">No data for this commodity</p>
      </div>
    )
  }

  const active = markets.find(m => m.city === selectedCity) ?? markets[0]
  const topEntry = active.entries[0]
  const hasMore = active.entries.length > 1
  const cleanCity = active.city.replace(' (Shipping Point)', '')

  const topDesc = topEntry.description ?? ''
  const marketCondition = extractMarketCondition(topDesc)
  const displayDescs = buildDisplayDescs(active.entries)

  return (
    <div className="flex-1 min-w-0">
      <p className={`text-xs font-semibold uppercase tracking-wide mb-3 flex items-center ${headingClass}`}>
        {title}
        <InfoTooltip>{tooltip}</InfoTooltip>
      </p>

      {/* City pills */}
      <div className="flex flex-wrap gap-1 mb-3">
        {markets.map(m => (
          <button
            key={m.city}
            onClick={() => { setSelectedCity(m.city); setExpanded(false) }}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
              active.city === m.city ? activePillClass : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}
          >
            {m.city.replace(' (Shipping Point)', '')}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className={`rounded-xl border p-4 ${cardClass}`}>
        {/* Header: city left, condition pill + date right */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="font-semibold text-gray-900 text-sm">{cleanCity}</p>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {marketCondition && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${marketCondition.pill}`}>
                {marketCondition.label}
              </span>
            )}
            {topEntry.date && (
              <span className="text-xs text-gray-300">{formatDate(topEntry.date)}</span>
            )}
          </div>
        </div>

        <EntryRow entry={topEntry} isTop color={color} displayDesc={displayDescs[0]} />

        {hasMore && (
          <>
            <button
              onClick={() => setExpanded(e => !e)}
              className={`text-xs font-medium mt-3 ${expandClass}`}
            >
              {expanded
                ? 'Hide'
                : `+ ${active.entries.length - 1} more`}
            </button>
            {expanded && (
              <div className="mt-2 space-y-0">
                {active.entries.slice(1).map((entry, i) => (
                  <EntryRow key={i} entry={entry} color={color} displayDesc={displayDescs[i + 1]} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function UsdaMarketWidget() {
  const [userCrops, setUserCrops] = useState<string[]>([])
  const [selectedCommodity, setSelectedCommodity] = useState<string | null>(null)
  const [customInput, setCustomInput] = useState('')
  const [markets, setMarkets] = useState<MarketResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)
  const [preferredMarkets, setPreferredMarkets] = useState<string[]>([])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')

    cropsApi.getAll().then((res: any) => {
      const commodities = [...new Set(
        (res.crops || [])
          .map((c: any) => c.commodity)
          .filter(Boolean)
          .map((c: string) => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase())
      )] as string[]
      setUserCrops(commodities)
      if (commodities.length) setSelectedCommodity(commodities[0])
    }).catch(() => {})

    fetch(`${API_BASE}/users/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const saved: string[] = data.user?.preferences?.usdaMarkets || data.preferences?.usdaMarkets || []
        setPreferredMarkets(saved)
      })
      .catch(() => {})
  }, [])

  const fetchPrices = useCallback((commodity: string) => {
    const token = localStorage.getItem('accessToken')
    setLoading(true)
    setError(null)
    setMarkets([])
    fetch(`${API_BASE}/usda-market?commodity=${encodeURIComponent(commodity)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        setMarkets(data.markets || [])
        setFetchedAt(data.fetchedAt || null)
      })
      .catch(() => setError('Failed to load market data.'))
      .finally(() => setLoading(false))
  }, [])

  const clearCacheAndRefresh = useCallback(() => {
    if (!selectedCommodity) return
    const token = localStorage.getItem('accessToken')
    fetch(`${API_BASE}/usda-market/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ commodity: selectedCommodity }),
    }).then(() => fetchPrices(selectedCommodity))
  }, [selectedCommodity, fetchPrices])

  useEffect(() => {
    if (selectedCommodity) fetchPrices(selectedCommodity)
  }, [selectedCommodity, fetchPrices])

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const val = customInput.trim()
    if (!val) return
    setSelectedCommodity(val.charAt(0).toUpperCase() + val.slice(1).toLowerCase())
    setCustomInput('')
  }

  const visibleMarkets = preferredMarkets.length > 0
    ? markets.filter(m => preferredMarkets.includes(m.city))
    : markets

  const terminalMarkets = visibleMarkets.filter(m => m.reportType === 'terminal')
  const fobMarkets = visibleMarkets.filter(m => m.reportType === 'shipping_point')

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-xl mb-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <ChartBarIcon className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">USDA Wholesale Market Prices</h3>
            <p className="text-xs text-gray-400">Official terminal market benchmarks · sourced from USDA AMS Market News</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {fetchedAt && (
            <span className="text-xs text-gray-300 hidden sm:block">Updated {formatDate(fetchedAt)}</span>
          )}
          {selectedCommodity && !loading && (
            <button
              onClick={clearCacheAndRefresh}
              title="Clear cache and re-fetch fresh USDA data"
              className="p-1.5 rounded-lg text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Commodity selector */}
        <div className="flex flex-wrap items-center gap-2 mb-5 pb-4 border-b border-gray-100">
          <span className="text-xs text-gray-400 mr-1">Commodity:</span>
          {userCrops.map(crop => (
            <button
              key={crop}
              onClick={() => setSelectedCommodity(crop)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedCommodity === crop
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-400'
              }`}
            >
              {crop}
            </button>
          ))}
          <form onSubmit={handleCustomSearch} className="flex items-center gap-1 ml-1">
            <input
              type="text"
              placeholder="Search commodity…"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent w-36"
            />
            <button
              type="submit"
              className="px-2.5 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-full hover:bg-emerald-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        {!selectedCommodity ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            Add crops to your profile or search a commodity above to see market prices.
          </p>
        ) : loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-gray-400 text-sm">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-300 border-t-transparent" />
            Fetching USDA market data for {selectedCommodity}…
          </div>
        ) : error ? (
          <p className="text-sm text-red-400 py-4">{error}</p>
        ) : markets.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500">No USDA market data found for <strong>{selectedCommodity}</strong>.</p>
            <p className="text-xs text-gray-400 mt-1">Try a broader term (e.g. "strawberry" instead of "Driscoll strawberry") or check USDA Market News directly.</p>
          </div>
        ) : (
          <div>
            {/* Info callout */}
            <div className="mb-5 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5 flex-shrink-0">ⓘ</span>
              <span>
                All prices are <strong>per shipping unit</strong> (carton, flat, lug — the full container the commodity ships in, not per pound).
                Use these as your benchmark before pricing outgoing shipments.
              </span>
            </div>

            {/* Two-column layout */}
            <div className="flex gap-6 sm:gap-8">
              <MarketColumn
                title="Terminal Markets"
                tooltip="What wholesale buyers (distributors, retailers) pay at major city distribution hubs. Pulled daily from USDA AMS Terminal Market Reports — the industry-standard benchmark for what your commodity is worth once it arrives at market."
                markets={terminalMarkets}
                commodity={selectedCommodity}
                color="emerald"
              />
              <div className="w-px bg-gray-100 flex-shrink-0 self-stretch" />
              <MarketColumn
                title="FOB / Shipping Point"
                tooltip="What peer growers and shippers are charging at the point of origin — before freight. FOB = Freight on Board (buyer covers shipping). Pulled from USDA AMS Shipping Point Reports. Comparing your price to FOB tells you how you stack up against competing growers in similar regions."
                markets={fobMarkets}
                commodity={selectedCommodity}
                color="blue"
              />
            </div>

            {preferredMarkets.length === 0 && (
              <p className="text-xs text-gray-300 mt-4">
                Showing all {markets.length} markets ·{' '}
                <a href="/dashboard/settings" className="text-emerald-500 hover:text-emerald-600">Set preferred markets</a>
                {' '}in Settings → Market Data
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        {markets.length > 0 && (
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-300">Data from USDA Agricultural Marketing Service · updated daily</p>
            <a
              href="https://www.ams.usda.gov/market-news/fruits-vegetables"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Full USDA report <ArrowTopRightOnSquareIcon className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
