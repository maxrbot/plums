"use client"

import Link from 'next/link'
import {
  CheckCircleIcon,
  ArrowRightIcon,
  MapPinIcon,
  SparklesIcon,
  ArchiveBoxIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  LinkIcon,
  RocketLaunchIcon,
  BookmarkIcon,
  DocumentDuplicateIcon,
  PresentationChartLineIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { useUserName, useUser } from '@/contexts/UserContext'
import { useState, useEffect } from 'react'
import { regionsApi, cropsApi, priceSheetsApi } from '@/lib/api'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const STEPS = [
  {
    key: 'shippingPoints' as const,
    label: 'Origin Locations',
    description: 'Add the locations your products ship from — warehouses, coolers, packing houses.',
    href: '/dashboard/price-sheets/regions',
    icon: MapPinIcon,
    cta: 'Add locations',
  },
  {
    key: 'products' as const,
    label: 'Product Catalog',
    description: 'Add the commodities and varieties you grow. Your team will use this as the foundation for every price sheet.',
    href: '/dashboard/price-sheets/crops',
    icon: SparklesIcon,
    cta: 'Add commodities',
  },
  {
    key: 'packaging' as const,
    label: 'Pack Configurations',
    description: 'Define how each commodity ships — carton types, sizes, and grade specs.',
    href: '/dashboard/price-sheets/packaging-structure',
    icon: ArchiveBoxIcon,
    cta: 'Configure packaging',
  },
]

interface Template {
  _id: string
  title: string
  templateName?: string
  productsCount?: number
  usageCount?: number
  lastUsedAt?: string
}

interface UsdaEntry {
  low: number
  high: number
  description?: string
}

interface UsdaMarket {
  city: string
  reportType: string
  entries: UsdaEntry[]
}

interface UsdaSnapshot {
  commodity: string
  low: number
  high: number
  mostlyLow: number | null
  mostlyHigh: number | null
  unit: string
  marketCount: number
  condition: 'higher' | 'lower' | 'steady' | null
}

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  return `${diffDays}d ago`
}

export default function Dashboard() {
  const userName = useUserName()
  const { user } = useUser()
  const isOwner = user?.role === 'owner'

  const [done, setDone] = useState({ shippingPoints: false, products: false, packaging: false })
  const [counts, setCounts] = useState({ regions: 0, crops: 0, packaging: 0 })
  const [loading, setLoading] = useState(true)

  // Templates quick-launch
  const [topTemplates, setTopTemplates] = useState<Template[]>([])

  // USDA strip
  const [usdaSnapshots, setUsdaSnapshots] = useState<UsdaSnapshot[]>([])
  const [usdaUpdatedAt, setUsdaUpdatedAt] = useState<string | null>(null)
  const [usdaOffset, setUsdaOffset] = useState(0)
  const USDA_VISIBLE = 3

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [regionsRes, cropsRes] = await Promise.all([regionsApi.getAll(), cropsApi.getAll()])
        const regions = regionsRes.regions || []
        const crops = cropsRes.crops || []
        const packagingStructure = user?.packagingStructure || {}
        const configuredPack = Object.keys(packagingStructure).filter(c =>
          (packagingStructure[c]?.packageTypes?.length || 0) > 0 &&
          (packagingStructure[c]?.sizeGrades?.length || 0) > 0
        )
        const isDone = { shippingPoints: regions.length > 0, products: crops.length > 0, packaging: configuredPack.length > 0 }
        setDone(isDone)
        setCounts({ regions: regions.length, crops: crops.length, packaging: configuredPack.length })

        // Load templates + USDA only when catalog is set up
        if (isDone.shippingPoints && isDone.products && isDone.packaging) {
          // Top templates
          const sheetsRes = await priceSheetsApi.getAll()
          const templates: Template[] = (sheetsRes.priceSheets || [])
            .filter((s: any) => s.isTemplate)
            .sort((a: any, b: any) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
            .slice(0, 3)
          setTopTemplates(templates)

          // USDA strip — fetch for up to 8 unique commodities from crops
          const uniqueCommodities = [...new Set(crops.map((c: any) => c.commodity as string))].slice(0, 8)
          const token = localStorage.getItem('accessToken')
          const usdaResults = await Promise.all(
            uniqueCommodities.map(async (commodity: string) => {
              try {
                const res = await fetch(
                  `${API_BASE}/usda-market?commodity=${encodeURIComponent(commodity.charAt(0).toUpperCase() + commodity.slice(1))}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                )
                const data = await res.json()
                if (!data.markets?.length) return null
                const allEntries: UsdaEntry[] = data.markets.flatMap((m: UsdaMarket) => m.entries)
                if (!allEntries.length) return null
                const low = Math.min(...allEntries.map(e => e.low))
                const high = Math.max(...allEntries.map(e => e.high))
                if (data.fetchedAt && !usdaUpdatedAt) setUsdaUpdatedAt(data.fetchedAt)

                // Extract condition from first entry's description
                const firstDesc = data.markets[0]?.entries[0]?.description ?? ''
                const condMatch = firstDesc.match(/MARKET\s+(HIGHER|LOWER|STEADY|FIRM|WEAK|ABOUT\s+STEADY)/i)
                const condWord = condMatch?.[1]?.toUpperCase().trim()
                const condition: UsdaSnapshot['condition'] =
                  condWord === 'HIGHER' || condWord === 'FIRM' ? 'higher' :
                  condWord === 'LOWER' || condWord === 'WEAK' ? 'lower' :
                  condWord ? 'steady' : null

                // Mostly price from first entry of any market
                const firstEntry = data.markets[0]?.entries[0]
                const mostlyLow: number | null = firstEntry?.mostlyLow ?? null
                const mostlyHigh: number | null = firstEntry?.mostlyHigh ?? null

                return { commodity, low, high, mostlyLow, mostlyHigh, unit: 'carton', marketCount: data.markets.length, condition } as UsdaSnapshot
              } catch {
                return null
              }
            })
          )
          setUsdaSnapshots(usdaResults.filter(Boolean) as UsdaSnapshot[])
        }
      } catch { /* keep defaults */ }
      finally { setLoading(false) }
    }
    load()
    const onVisible = () => { if (document.visibilityState === 'visible') load() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const allDone = done.shippingPoints && done.products && done.packaging

  const stepCounts: Record<typeof STEPS[number]['key'], string> = {
    shippingPoints: counts.regions > 0 ? `${counts.regions} location${counts.regions !== 1 ? 's' : ''}` : '',
    products: counts.crops > 0 ? `${counts.crops} commodit${counts.crops !== 1 ? 'ies' : 'y'}` : '',
    packaging: counts.packaging > 0 ? `${counts.packaging} configured` : '',
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isOwner ? 'Your operation at a glance.' : 'Here\'s what\'s ready for your team.'}
        </p>
      </div>

      {/* ── SET UP STATE ── */}
      {!allDone && !loading && (
        <>
          {/* Accelerated Setup — owner only */}
          {isOwner && (
            <div className="bg-gradient-to-r from-lime-50 to-cyan-50 border border-lime-200 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-lime-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <RocketLaunchIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Accelerated Setup</h3>
                    <p className="text-xs text-gray-600 mt-0.5">Import your catalog from a spreadsheet, Famous, or another system — skip manual entry entirely.</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/catalog"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-md transition-colors flex-shrink-0"
                >
                  <SparklesIcon className="h-3.5 w-3.5" />
                  Import my data
                </Link>
              </div>
            </div>
          )}

          {/* Operation Readiness stepper */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
            <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Operation Readiness</h2>
                <p className="text-xs text-gray-500 mt-0.5">Your catalog is the foundation everything your team sends is built on</p>
              </div>
              {isOwner && (
                <Link
                  href="/dashboard/catalog"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex-shrink-0"
                >
                  <LinkIcon className="h-3 w-3" />
                  Connect your data
                </Link>
              )}
            </div>
            <div>
              {STEPS.map((step, i) => {
                const isDone = done[step.key]
                const isActive = !isDone && STEPS.slice(0, i).every(s => done[s.key])
                const Icon = step.icon

                if (isDone) {
                  return (
                    <div key={step.key} className="flex items-center gap-3 px-6 py-3 border-b border-gray-50 last:border-0">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircleIcon className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-sm text-gray-500 flex-1">
                        <span className="font-medium text-emerald-700">{step.label}</span>
                        {stepCounts[step.key] && <span className="ml-2 text-xs text-gray-400">{stepCounts[step.key]}</span>}
                      </p>
                      {isOwner && (
                        <Link href={step.href} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5">
                          Edit <ChevronRightIcon className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  )
                }

                if (isActive) {
                  return (
                    <div key={step.key} className="px-6 py-5 border-b border-gray-100 last:border-0 bg-amber-50">
                      <div className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{step.label}</p>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{step.description}</p>
                          {isOwner && (
                            <Link
                              href={step.href}
                              className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-md transition-colors"
                            >
                              {step.cta}
                              <ArrowRightIcon className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={step.key} className="flex items-center gap-3 px-6 py-3 border-b border-gray-50 last:border-0 opacity-40">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-gray-400">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">{step.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* ── OPERATIONAL STATE ── */}
      {allDone && !loading && (
        <>
          {/* USDA Market Card */}
          {usdaSnapshots.length > 0 && (() => {
            const visibleSnaps = usdaSnapshots.slice(usdaOffset, usdaOffset + USDA_VISIBLE)
            const canPrev = usdaOffset > 0
            const canNext = usdaOffset + USDA_VISIBLE < usdaSnapshots.length
            const cols = visibleSnaps.length === 1 ? 'grid-cols-1' : visibleSnaps.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
            return (
              <div className="mb-6">
                {/* Section label */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <PresentationChartLineIcon className="h-4 w-4 text-gray-400" />
                    <h2 className="text-sm font-semibold text-gray-900">Market Prices</h2>
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">USDA AMS</span>
                    {usdaUpdatedAt && (
                      <span className="text-[10px] text-gray-400">· {formatRelativeDate(usdaUpdatedAt)}</span>
                    )}
                    <Link
                      href="/dashboard/market-data"
                      className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-0.5 transition-colors"
                    >
                      Full report <ChevronRightIcon className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

                {/* Commodity columns + nav arrows */}
                <div className="flex items-stretch">
                  {/* Prev arrow */}
                  <button
                    onClick={() => setUsdaOffset(o => Math.max(0, o - 1))}
                    disabled={!canPrev}
                    className="flex items-center justify-center w-8 flex-shrink-0 border-r border-gray-100 transition-colors disabled:cursor-default"
                    style={{ color: canPrev ? undefined : '#d1d5db' }}
                    onMouseEnter={e => { if (canPrev) (e.currentTarget as HTMLElement).style.background = '#f9fafb' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}
                    aria-label="Previous commodity"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>

                  <div className={`grid divide-x divide-gray-100 flex-1 ${cols}`}>
                    {visibleSnaps.map(snap => {
                      const mid = Math.round((snap.low + snap.high) / 2)
                      return (
                        <div key={snap.commodity} className="px-5 py-4">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 capitalize">
                            {snap.commodity}
                          </p>
                          <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-2xl font-bold text-gray-900 tabular-nums">${mid}</span>
                            <span className="text-xs text-gray-400">/{snap.unit}</span>
                          </div>
                          {snap.mostlyLow != null && snap.mostlyHigh != null ? (
                            <p className="text-xs text-gray-500 tabular-nums">
                              mostly ${snap.mostlyLow.toFixed(2)}–${snap.mostlyHigh.toFixed(2)}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400 tabular-nums">
                              ${snap.low.toFixed(2)}–${snap.high.toFixed(2)} range
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            {snap.condition && (
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                snap.condition === 'higher' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                snap.condition === 'lower' ? 'bg-red-50 text-red-600 border border-red-100' :
                                'bg-gray-50 text-gray-500 border border-gray-200'
                              }`}>
                                {snap.condition === 'higher' ? '↑ Higher' : snap.condition === 'lower' ? '↓ Lower' : '→ Steady'}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400">
                              {snap.marketCount} market{snap.marketCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Next arrow */}
                  <button
                    onClick={() => setUsdaOffset(o => Math.min(usdaSnapshots.length - USDA_VISIBLE, o + 1))}
                    disabled={!canNext}
                    className="flex items-center justify-center w-8 flex-shrink-0 border-l border-gray-100 transition-colors disabled:cursor-default"
                    style={{ color: canNext ? undefined : '#d1d5db' }}
                    onMouseEnter={e => { if (canNext) (e.currentTarget as HTMLElement).style.background = '#f9fafb' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}
                    aria-label="Next commodity"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Dot indicators — only shown when there's more than one page */}
                {usdaSnapshots.length > USDA_VISIBLE && (
                  <div className="flex items-center justify-center gap-1.5 py-2.5 border-t border-gray-100">
                    {usdaSnapshots.map((_, i) => {
                      const isActive = i >= usdaOffset && i < usdaOffset + USDA_VISIBLE
                      return (
                        <button
                          key={i}
                          onClick={() => setUsdaOffset(Math.min(i, usdaSnapshots.length - USDA_VISIBLE))}
                          className={`rounded-full transition-all ${isActive ? 'w-4 h-1.5 bg-gray-400' : 'w-1.5 h-1.5 bg-gray-200 hover:bg-gray-300'}`}
                          aria-label={`Go to commodity ${i + 1}`}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            )
          })()}

          {/* My Templates quick-launch */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookmarkIcon className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-gray-900">My Templates</h2>
                <Link
                  href="/dashboard/price-sheets"
                  className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-0.5 transition-colors"
                >
                  View all <ChevronRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {/* Create new — always first */}
              <Link
                href="/dashboard/price-sheets/new"
                className="border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center transition-colors group w-[120px] h-[120px] flex-shrink-0"
              >
                <div className="h-8 w-8 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <PlusIcon className="h-4 w-4 text-gray-500" />
                </div>
                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700 transition-colors">Create new template</p>
              </Link>

              {topTemplates.map(t => (
                <div
                  key={t._id}
                  className="bg-amber-50 border border-amber-200 rounded-xl p-4 hover:border-amber-400 transition-colors w-[240px] flex-shrink-0 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate flex-1 pr-2">{t.templateName || t.title}</h3>
                    <span className="text-xs text-gray-400 flex-shrink-0">{t.productsCount ?? 0} products</span>
                  </div>
                  <p className="text-xs text-amber-700 mb-4 flex-1">
                    {(t.usageCount ?? 0) > 0
                      ? `Sent ${t.usageCount} ${t.usageCount === 1 ? 'time' : 'times'}${t.lastUsedAt ? ` · ${formatRelativeDate(t.lastUsedAt)}` : ''}`
                      : ''}
                  </p>
                  <Link
                    href={`/dashboard/price-sheets/new?templateId=${t._id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-md transition-colors"
                  >
                    <DocumentDuplicateIcon className="h-3.5 w-3.5" />
                    Use Template
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Operation + Team — secondary utility row */}
          <div className={`grid gap-4 ${isOwner ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Operation Readiness */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Catalog</p>
                {isOwner && (
                  <Link
                    href="/dashboard/catalog"
                    className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-0.5 transition-colors"
                  >
                    Manage <ChevronRightIcon className="h-3 w-3" />
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
                  <CheckCircleIcon className="h-3 w-3" />
                  {counts.regions} location{counts.regions !== 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
                  <CheckCircleIcon className="h-3 w-3" />
                  {counts.crops} commodit{counts.crops !== 1 ? 'ies' : 'y'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
                  <CheckCircleIcon className="h-3 w-3" />
                  {counts.packaging} pack config{counts.packaging !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Team — owner only */}
            {isOwner && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Team</p>
                  <Link
                    href="/dashboard/team"
                    className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-0.5 transition-colors"
                  >
                    Manage <ChevronRightIcon className="h-3 w-3" />
                  </Link>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Invite sales reps to share your catalog. Each rep brings their own contacts and sends independently.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
