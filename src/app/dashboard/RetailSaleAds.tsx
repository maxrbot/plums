'use client'

import { useState, useEffect } from 'react'
import { MapPinIcon, TagIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { cropsApi } from '@/lib/api'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const PAGE_SIZE = 8

// Maps partial retailer name → search URL template (use {q} as placeholder)
const RETAILER_SEARCH: [string, string][] = [
  ['safeway',         'https://www.safeway.com/shop/search-results.html?q={q}'],
  ['vons',            'https://www.vons.com/shop/search-results.html?q={q}'],
  ['albertsons',      'https://www.albertsons.com/shop/search-results.html?q={q}'],
  ['acme',            'https://www.acmemarkets.com/shop/search-results.html?q={q}'],
  ['jewel',           'https://www.jewelosco.com/shop/search-results.html?q={q}'],
  ['winn-dixie',      'https://www.winndixie.com/shop/search-results.html?q={q}'],
  ['kroger',          'https://www.kroger.com/search?query={q}'],
  ["king soopers",    'https://www.kingsoopers.com/search?query={q}'],
  ["smith's",         'https://www.smithsfoodanddrug.com/search?query={q}'],
  ['smiths',          'https://www.smithsfoodanddrug.com/search?query={q}'],
  ['dillons',         'https://www.dillons.com/search?query={q}'],
  ["fry's",           'https://www.frysfood.com/search?query={q}'],
  ['frys',            'https://www.frysfood.com/search?query={q}'],
  ['harris teeter',   'https://www.harristeeter.com/search?query={q}'],
  ['fred meyer',      'https://www.fredmeyer.com/search?query={q}'],
  ['qfc',             'https://www.qfc.com/search?query={q}'],
  ["pick n save",     'https://www.picknsave.com/search?query={q}'],
  ['metro market',    'https://www.metromarket.net/search?query={q}'],
  ["mariano",         'https://www.marianos.com/search?query={q}'],
  ['sprouts',         'https://shop.sprouts.com/search?search={q}'],
  ['wegmans',         'https://shop.wegmans.com/search?search_term={q}'],
  ['h-e-b',           'https://www.heb.com/search/?q={q}'],
  ['heb',             'https://www.heb.com/search/?q={q}'],
  ['hy-vee',          'https://www.hy-vee.com/search?searchTerm={q}'],
  ['hyvee',           'https://www.hy-vee.com/search?searchTerm={q}'],
  ['giant eagle',     'https://www.gianteagle.com/shop/search?q={q}'],
  ['stop & shop',     'https://stopandshop.com/search?query={q}'],
  ['hannaford',       'https://www.hannaford.com/search?searchString={q}'],
  ['publix',          'https://www.publix.com/pd/search?q={q}'],
  ["raley's",         'https://www.raleys.com/search?q={q}'],
  ['raleys',          'https://www.raleys.com/search?q={q}'],
  ['smart & final',   'https://www.smartandfinal.com/search?q={q}'],
  ['smart and final', 'https://www.smartandfinal.com/search?q={q}'],
  ['price chopper',   'https://www.pricechopper.com/search?q={q}'],
  ['shoprite',        'https://www.shoprite.com/sm/pickup/rsid/3000/results?q={q}'],
  ['food lion',       'https://www.foodlion.com/search/?query={q}'],
]

function getStoreSearchUrl(retailer: string, itemName: string): string {
  const r = retailer.toLowerCase()
  const q = encodeURIComponent(itemName)
  const match = RETAILER_SEARCH.find(([key]) => r.includes(key))
  if (match) return match[1].replace('{q}', q)
  // Fallback: Google search scoped to retailer
  return `https://www.google.com/search?q=${encodeURIComponent(retailer + ' ' + itemName + ' weekly ad sale')}`
}

interface SaleItem {
  retailer: string
  name: string
  price: string | null
  originalPrice: string | null
  unit: string | null
  commodity: string | null
  isOrganic: boolean
  unitType: string
  validTo: string | null
}

interface CommodityGroup {
  commodity: string
  items: SaleItem[]
  hasOrganic: boolean
  retailerCount: number
  priceRange: { min: number; max: number; unitType: string; lowestRetailer: string } | null
}

function buildCommodityGroups(items: SaleItem[]): CommodityGroup[] {
  const groups: Record<string, SaleItem[]> = {}
  for (const item of items) {
    const key = item.commodity || 'Other'
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  }
  return Object.entries(groups)
    .map(([commodity, groupItems]) => {
      const hasOrganic = groupItems.some(i => i.isOrganic)
      const retailerCount = new Set(groupItems.map(i => i.retailer)).size
      const priced = groupItems.filter(i => i.price !== null && i.unitType !== 'unknown')
      const unitTypes = [...new Set(priced.map(i => i.unitType))]
      let priceRange: CommodityGroup['priceRange'] = null
      if (priced.length >= 2 && unitTypes.length === 1) {
        const prices = priced.map(i => parseFloat(i.price!))
        const minPrice = Math.min(...prices)
        const lowestRetailer = priced.find(i => parseFloat(i.price!) === minPrice)?.retailer ?? ''
        priceRange = { min: minPrice, max: Math.max(...prices), unitType: unitTypes[0], lowestRetailer }
      }
      return { commodity, items: groupItems, hasOrganic, retailerCount, priceRange }
    })
    .sort((a, b) => b.items.length - a.items.length)
}

function savingsPct(price: string, original: string): number {
  const p = parseFloat(price)
  const o = parseFloat(original)
  if (!o || o <= p) return 0
  return Math.round((1 - p / o) * 100)
}

function PriceDisplay({ item, showSavings = false }: { item: SaleItem; showSavings?: boolean }) {
  if (item.price) {
    const pct = showSavings && item.originalPrice ? savingsPct(item.price, item.originalPrice) : 0
    return (
      <div className="flex items-baseline gap-1 flex-wrap">
        <span className="text-sm font-bold text-orange-600">${parseFloat(item.price).toFixed(2)}</span>
        {item.unitType !== 'unknown'
          ? <span className="text-xs text-gray-400">/ {item.unitType}</span>
          : item.unit && <span className="text-xs text-gray-400">{item.unit}</span>
        }
        {item.originalPrice && <span className="text-xs text-gray-300 line-through">${parseFloat(item.originalPrice).toFixed(2)}</span>}
        {pct > 0 && <span className="text-xs font-semibold text-green-600">−{pct}%</span>}
      </div>
    )
  }
  if (item.unit) return <p className="text-sm font-bold text-orange-600">{item.unit}</p>
  return (
    <a
      href={getStoreSearchUrl(item.retailer, item.name)}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-orange-500 hover:text-orange-600 underline underline-offset-2"
    >
      See price at {item.retailer} →
    </a>
  )
}

export default function RetailSaleAds() {
  const [zip, setZip] = useState('')
  const [zipInput, setZipInput] = useState('')
  const [items, setItems] = useState<SaleItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)
  const [retailerFilter, setRetailerFilter] = useState<string | null>(null)
  const [myCommoditiesOnly, setMyCommoditiesOnly] = useState(false)
  const [organicOnly, setOrganicOnly] = useState(false)
  const [groupedView, setGroupedView] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [expandedCommodity, setExpandedCommodity] = useState<string | null>(null)
  const [userCommodities, setUserCommodities] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('retailSalesZip')
    if (saved) { setZip(saved); setZipInput(saved) }
    cropsApi.getAll().then((res: any) => {
      const names = [...new Set((res.crops || []).map((c: any) => (c.commodity || '').toLowerCase()))].filter(Boolean) as string[]
      setUserCommodities(names)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!zip || zip.length < 5) return
    const token = localStorage.getItem('accessToken')
    setLoading(true)
    setError(null)
    fetch(`${API_BASE}/retail-sales?zip=${zip}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        setItems(data.items || [])
        setFetchedAt(data.fetchedAt || null)
      })
      .catch(() => setError('Failed to load retail sales.'))
      .finally(() => setLoading(false))
  }, [zip])

  const handleZipSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const z = zipInput.trim()
    if (z.length < 5) return
    localStorage.setItem('retailSalesZip', z)
    setZip(z)
  }

  const filtered = items.filter(item => {
    if (retailerFilter && item.retailer !== retailerFilter) return false
    if (organicOnly && !item.isOrganic) return false
    if (myCommoditiesOnly) {
      const c = (item.commodity || '').toLowerCase()
      const n = (item.name || '').toLowerCase()
      return userCommodities.some(u => c.includes(u) || n.includes(u))
    }
    return true
  })

  const retailers = [...new Set(items.map(i => i.retailer))].sort()
  const groups = buildCommodityGroups(filtered)
  const visibleGroups = showAll ? groups : groups.slice(0, PAGE_SIZE)

  // Stats
  const totalDeals = filtered.length
  const commodityCount = groups.length
  const retailerCount = new Set(filtered.map(i => i.retailer)).size
  const organicCount = filtered.filter(i => i.isOrganic).length

  const pillClass = (active: boolean, activeClass = 'bg-gray-900 text-white border-gray-900') =>
    `px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${active ? activeClass : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-xl mb-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <TagIcon className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Nearby Retail Sale Ads</h3>
            <p className="text-xs text-gray-400">Weekly produce deals from nearby store flyers · verify price before purchasing</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {fetchedAt && (
            <span className="text-xs text-gray-300 hidden sm:block">
              Updated {new Date(fetchedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {zip && !loading && (
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
              <button
                onClick={() => setGroupedView(true)}
                className={`px-3 py-1.5 ${groupedView ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                By Commodity
              </button>
              <button
                onClick={() => setGroupedView(false)}
                className={`px-3 py-1.5 border-l border-gray-200 ${!groupedView ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                All Items
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4">
        {/* ZIP input */}
        {!zip ? (
          <div>
            <p className="text-sm text-gray-500 mb-3">
              Enter your ZIP code to see what produce is on sale at nearby grocery stores this week.
            </p>
            <form onSubmit={handleZipSubmit} className="flex items-center gap-2">
              <div className="relative flex-1 max-w-xs">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  type="text"
                  placeholder="Enter ZIP code"
                  value={zipInput}
                  onChange={e => setZipInput(e.target.value)}
                  maxLength={10}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors">
                Search
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-1.5 mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-1 text-xs mr-1">
                <MapPinIcon className="h-3.5 w-3.5 text-gray-400" />
                <span className="font-medium text-gray-700">{zip}</span>
                <button
                  onClick={() => { setZip(''); setZipInput(''); setItems([]) }}
                  className="ml-0.5 text-gray-300 hover:text-orange-500 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <button
                onClick={() => setRetailerFilter(null)}
                className={pillClass(!retailerFilter)}
              >
                All Retailers
              </button>
              {retailers.map(r => (
                <button
                  key={r}
                  onClick={() => setRetailerFilter(retailerFilter === r ? null : r)}
                  className={pillClass(retailerFilter === r)}
                >
                  {r}
                </button>
              ))}
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <button
                onClick={() => setMyCommoditiesOnly(!myCommoditiesOnly)}
                className={pillClass(myCommoditiesOnly, 'bg-lime-600 text-white border-lime-600')}
              >
                My Crops
              </button>
              <button
                onClick={() => setOrganicOnly(!organicOnly)}
                className={pillClass(organicOnly, 'bg-green-600 text-white border-green-600')}
              >
                🌱 Organic
              </button>
            </div>

            {/* Stats strip */}
            {!loading && filtered.length > 0 && (
              <div className="flex items-center gap-4 mb-5 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-center">
                  <p className="text-base font-bold text-gray-900">{totalDeals}</p>
                  <p className="text-xs text-gray-400">deals</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center">
                  <p className="text-base font-bold text-gray-900">{commodityCount}</p>
                  <p className="text-xs text-gray-400">commodities</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center">
                  <p className="text-base font-bold text-gray-900">{retailerCount}</p>
                  <p className="text-xs text-gray-400">store{retailerCount !== 1 ? 's' : ''}</p>
                </div>
                {organicCount > 0 && (
                  <>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="text-center">
                      <p className="text-base font-bold text-green-600">{organicCount}</p>
                      <p className="text-xs text-gray-400">organic</p>
                    </div>
                  </>
                )}
                <div className="ml-auto text-right hidden sm:block">
                  <p className="text-xs text-gray-400">From retailer digital flyers</p>
                  <p className="text-xs text-gray-300">Verify price before purchasing</p>
                </div>
              </div>
            )}

            {/* Results */}
            {loading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-gray-400 text-sm">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-300 border-t-transparent" />
                Fetching deals…
              </div>
            ) : error ? (
              <p className="text-sm text-red-400 py-4">{error}</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No produce deals found for this ZIP code.</p>
            ) : groupedView ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {visibleGroups.map(({ commodity, items: gItems, hasOrganic, retailerCount: rc, priceRange }) => {
                    const isExpanded = expandedCommodity === commodity
                    const isMyCrop = userCommodities.some(c => commodity.toLowerCase().includes(c))
                    const minPriceItem = priceRange
                      ? gItems.find(i => i.price && parseFloat(i.price) === priceRange.min)
                      : null

                    return (
                      <div
                        key={commodity}
                        className={`rounded-xl border transition-all overflow-hidden ${
                          isExpanded
                            ? 'border-orange-200 col-span-2 sm:col-span-3 lg:col-span-4 shadow-sm'
                            : 'border-gray-100 hover:border-orange-200 hover:shadow-sm cursor-pointer'
                        }`}
                      >
                        {/* Card summary */}
                        <button
                          className="w-full p-4 text-left"
                          onClick={() => setExpandedCommodity(isExpanded ? null : commodity)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm leading-tight">{commodity}</p>
                              {(isMyCrop || hasOrganic) && (
                                <div className="flex gap-1 mt-1.5 flex-wrap">
                                  {isMyCrop && (
                                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-lime-50 text-lime-700 border border-lime-200">
                                      My Crop
                                    </span>
                                  )}
                                  {hasOrganic && (
                                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                                      🌱 Organic
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            {isExpanded
                              ? <ChevronUpIcon className="h-4 w-4 text-gray-300 flex-shrink-0 mt-0.5" />
                              : <ChevronDownIcon className="h-4 w-4 text-gray-300 flex-shrink-0 mt-0.5" />
                            }
                          </div>
                          <div className="mt-3">
                            {priceRange ? (
                              <>
                                <p className="text-base font-bold text-orange-500">
                                  ${priceRange.min.toFixed(2)}{priceRange.min !== priceRange.max ? `–$${priceRange.max.toFixed(2)}` : ''}
                                  <span className="text-xs font-normal text-gray-400 ml-1">/ {priceRange.unitType}</span>
                                </p>
                                {priceRange.min !== priceRange.max && (
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    Best at <span className="text-gray-600 font-medium">{priceRange.lowestRetailer}</span>
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-xs text-gray-400 italic">see details</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {rc} retailer{rc !== 1 ? 's' : ''} · {gItems.length} deal{gItems.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </button>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div className="border-t border-orange-100 bg-orange-50/40 p-3">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                              {gItems.map((item, i) => {
                                const isBest = minPriceItem && item === minPriceItem && priceRange && priceRange.min !== priceRange.max
                                return (
                                  <div
                                    key={i}
                                    className={`bg-white rounded-lg border p-3 flex flex-col gap-1.5 shadow-sm relative ${
                                      isBest ? 'border-orange-300' : 'border-gray-100'
                                    }`}
                                  >
                                    {isBest && (
                                      <span className="absolute top-2 right-2 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-medium leading-none">
                                        Best
                                      </span>
                                    )}
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <span className="text-xs bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded text-gray-600 font-medium truncate max-w-full">
                                        {item.retailer}
                                      </span>
                                      {item.isOrganic && <span className="text-xs">🌱</span>}
                                    </div>
                                    <p className="text-sm text-gray-700 leading-tight line-clamp-2">{item.name}</p>
                                    <div className="mt-auto">
                                      <PriceDisplay item={item} showSavings />
                                      {item.validTo && (
                                        <p className="text-xs text-gray-300 mt-0.5">
                                          thru {new Date(item.validTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                      )}
                                      {item.price && (
                                        <a
                                          href={getStoreSearchUrl(item.retailer, item.name)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-gray-400 hover:text-orange-500 mt-1 inline-block transition-colors"
                                        >
                                          View deal →
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                {groups.length > PAGE_SIZE && (
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="mt-4 text-sm text-orange-500 hover:text-orange-600 font-medium"
                  >
                    {showAll ? 'Show less' : `Show ${groups.length - PAGE_SIZE} more commodities`}
                  </button>
                )}
              </>
            ) : (
              /* Flat tile view */
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(showAll ? filtered : filtered.slice(0, PAGE_SIZE)).map((item, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-3 hover:border-orange-200 hover:shadow-sm transition-all flex flex-col gap-1.5">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-xs bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded text-gray-600 font-medium">{item.retailer}</span>
                        {item.isOrganic && <span className="text-xs">🌱</span>}
                      </div>
                      <p className="text-sm font-medium text-gray-800 leading-tight line-clamp-2">{item.name}</p>
                      <div className="mt-auto">
                        <PriceDisplay item={item} showSavings />
                        {item.validTo && (
                          <p className="text-xs text-gray-300 mt-0.5">
                            thru {new Date(item.validTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {filtered.length > PAGE_SIZE && (
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="mt-4 text-sm text-orange-500 hover:text-orange-600 font-medium"
                  >
                    {showAll ? 'Show less' : `Show ${filtered.length - PAGE_SIZE} more items`}
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
