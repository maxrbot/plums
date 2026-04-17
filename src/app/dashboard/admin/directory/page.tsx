'use client'

import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import {
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
  TrashIcon,
  CheckBadgeIcon,
  PencilSquareIcon,
  XMarkIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const PH_URL = process.env.NEXT_PUBLIC_PRODUCEHUNT_URL || 'http://localhost:3002'

function authHeaders() {
  const t = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  return { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' }
}

interface ProductVariety {
  name: string
  availability?: string
  organic?: boolean
  growingPractices?: string[]
}

interface Product {
  commodity: string
  varieties: (string | ProductVariety)[]
  isOrganic: boolean
  seasonality?: string
}

interface ClaimedBy {
  id: string
  email: string
  profile: { companyName: string; contactName: string }
}

interface DirectoryEntry {
  id: string
  slug: string
  companyName: string
  location: { city?: string; state?: string; full: string }
  website: string | null
  contactEmail: string | null
  brandStory: string | null
  yearEstablished: number | null
  products: Product[]
  certifications: string[]
  claimed: boolean
  listed: boolean
  acrelistUserId: string | null
  claimedBy: ClaimedBy | null
  verificationScore: { score: number; maxScore: number; percentage: number } | null
  importSource: string | null
  operationScale?: string | null
  certifiedAcres?: number | null
  createdAt: string
  updatedAt: string
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function EditModal({ entry, onClose, onSave }: {
  entry: DirectoryEntry
  onClose: () => void
  onSave: (id: string, data: Partial<DirectoryEntry>) => Promise<void>
}) {
  const [companyName, setCompanyName] = useState(entry.companyName)
  const [city, setCity] = useState(entry.location.city || '')
  const [state, setState] = useState(entry.location.state || '')
  const [website, setWebsite] = useState(entry.website || '')
  const [contactEmail, setContactEmail] = useState(entry.contactEmail || '')
  const [brandStory, setBrandStory] = useState(entry.brandStory || '')
  const [yearEstablished, setYearEstablished] = useState(entry.yearEstablished ? String(entry.yearEstablished) : '')
  const [products, setProducts] = useState<Product[]>(entry.products)
  const [certifications, setCertifications] = useState<string[]>(entry.certifications)
  const [listed, setListed] = useState(entry.listed)
  const [operationScale, setOperationScale] = useState(entry.operationScale || '')
  const [saving, setSaving] = useState(false)

  // New variety input per product
  const [newVariety, setNewVariety] = useState<Record<number, string>>({})
  // New commodity input
  const [newCommodity, setNewCommodity] = useState('')

  const CERT_OPTIONS = ['USDA Organic', 'PACA Licensed', 'GFSI Certified', 'DRC Member', 'Non-GMO Project', 'Fair Trade']

  const varName = (v: string | ProductVariety) => typeof v === 'string' ? v : v.name
  const varOrganic = (v: string | ProductVariety) => typeof v === 'object' ? v.organic : false
  const varAvail = (v: string | ProductVariety) => typeof v === 'object' ? v.availability : undefined

  const removeVariety = (pIdx: number, vIdx: number) => {
    setProducts(prev => {
      const next = [...prev]
      const p = { ...next[pIdx], varieties: next[pIdx].varieties.filter((_, i) => i !== vIdx) }
      next[pIdx] = p
      return next
    })
  }

  const addVariety = (pIdx: number) => {
    const name = (newVariety[pIdx] || '').trim()
    if (!name) return
    setProducts(prev => {
      const next = [...prev]
      next[pIdx] = { ...next[pIdx], varieties: [...next[pIdx].varieties, { name, organic: next[pIdx].isOrganic }] }
      return next
    })
    setNewVariety(prev => ({ ...prev, [pIdx]: '' }))
  }

  const removeCommodity = (pIdx: number) => {
    setProducts(prev => prev.filter((_, i) => i !== pIdx))
  }

  const addCommodity = () => {
    const name = newCommodity.trim()
    if (!name) return
    setProducts(prev => [...prev, { commodity: name, varieties: [], isOrganic: false, seasonality: 'year-round' }])
    setNewCommodity('')
  }

  const toggleOrganic = (pIdx: number) => {
    setProducts(prev => {
      const next = [...prev]
      next[pIdx] = { ...next[pIdx], isOrganic: !next[pIdx].isOrganic }
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(entry.id, {
        companyName: companyName.trim(),
        location: { city: city.trim(), state: state.trim(), full: [city.trim(), state.trim()].filter(Boolean).join(', ') },
        website: website.trim() || null,
        contactEmail: contactEmail.trim() || null,
        brandStory: brandStory.trim() || null,
        yearEstablished: yearEstablished ? parseInt(yearEstablished) : null,
        products,
        certifications,
        listed,
        operationScale: operationScale || null,
      } as any)
      onClose()
    } catch { alert('Failed to save') }
    finally { setSaving(false) }
  }

  const inputCls = 'w-full px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Edit Listing</h2>
            <p className="text-xs text-gray-400 mt-0.5">{entry.companyName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-300 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* Basic info */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Basic Info</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Company Name</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                <input value={city} onChange={e => setCity(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                <input value={state} onChange={e => setState(e.target.value)} className={inputCls} placeholder="CA" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
                <input value={website} onChange={e => setWebsite(e.target.value)} className={inputCls} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contact Email</label>
                <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} className={inputCls} placeholder="sales@..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Year Established</label>
                <input value={yearEstablished} onChange={e => setYearEstablished(e.target.value)} className={inputCls} placeholder="e.g. 1998" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Operation Scale</label>
                <select value={operationScale} onChange={e => setOperationScale(e.target.value)}
                  className={inputCls + ' bg-white'}>
                  <option value="">Unknown</option>
                  <option value="direct-market">Direct Market (CSA / farmers market)</option>
                  <option value="small-farm">Small Farm (&lt;25 acres)</option>
                  <option value="commercial-farm">Commercial Farm (25–500 acres)</option>
                  <option value="major-grower">Major Grower (500+ acres)</option>
                  <option value="packer-shipper">Packer / Shipper / Consolidator</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="listed" checked={listed} onChange={e => setListed(e.target.checked)} className="rounded" />
                <label htmlFor="listed" className="text-sm text-gray-700">Listed (visible in search)</label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Brand Story</label>
              <textarea value={brandStory} onChange={e => setBrandStory(e.target.value)} rows={3}
                className={inputCls + ' resize-none'} placeholder="Brief description of the farm or company…" />
            </div>
          </div>

          {/* Products */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Products</p>
            <div className="space-y-3">
              {products.map((p, pIdx) => (
                <div key={pIdx} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">{p.commodity}</span>
                      <button onClick={() => toggleOrganic(pIdx)}
                        className={`px-1.5 py-0.5 text-xs rounded border transition-colors ${
                          p.isOrganic ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400'
                        }`}>
                        {p.isOrganic ? 'Organic ✓' : 'Organic'}
                      </button>
                    </div>
                    <button onClick={() => removeCommodity(pIdx)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {/* Varieties */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {p.varieties.map((v, vIdx) => (
                      <span key={vIdx} className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {varName(v)}
                        {varOrganic(v) && <span className="text-emerald-600">·org</span>}
                        {varAvail(v) && <span className="text-gray-400">·{varAvail(v)}</span>}
                        <button onClick={() => removeVariety(pIdx, vIdx)} className="ml-0.5 text-gray-400 hover:text-red-400">×</button>
                      </span>
                    ))}
                  </div>
                  {/* Add variety */}
                  <div className="flex items-center gap-1.5">
                    <input
                      value={newVariety[pIdx] || ''}
                      onChange={e => setNewVariety(prev => ({ ...prev, [pIdx]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVariety(pIdx) } }}
                      placeholder="Add variety…"
                      className="flex-1 px-2.5 py-1 border border-dashed border-gray-200 rounded text-xs text-gray-600 focus:outline-none focus:border-gray-400"
                    />
                    <button onClick={() => addVariety(pIdx)} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors">
                      Add
                    </button>
                  </div>
                </div>
              ))}

              {/* Add commodity */}
              <div className="flex items-center gap-2">
                <input
                  value={newCommodity}
                  onChange={e => setNewCommodity(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCommodity() } }}
                  placeholder="Add commodity (e.g. Avocado)…"
                  className="flex-1 px-3 py-1.5 border border-dashed border-gray-200 rounded-md text-sm text-gray-600 focus:outline-none focus:border-gray-400"
                />
                <button onClick={addCommodity} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-md hover:bg-gray-200 transition-colors">
                  <PlusIcon className="h-3.5 w-3.5" />Add
                </button>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Certifications</p>
            <div className="flex flex-wrap gap-2">
              {CERT_OPTIONS.map(c => (
                <button key={c} type="button"
                  onClick={() => setCertifications(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    certifications.includes(c) ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button onClick={handleSave} disabled={saving || !companyName.trim()}
            className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProduceHuntDirectoryPage() {
  const { user } = useUser()
  const router = useRouter()

  const [entries, setEntries] = useState<DirectoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editEntry, setEditEntry] = useState<DirectoryEntry | null>(null)
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())

  const [claimFilter, setClaimFilter] = useState<'all' | 'listed' | 'claimed' | 'delisted'>('all')
  const [search, setSearch] = useState('')
  const [filterState, setFilterState] = useState('')

  useEffect(() => {
    if (user && user.subscriptionTier !== 'admin') router.push('/dashboard')
  }, [user, router])

  useEffect(() => {
    if (user?.subscriptionTier !== 'admin') return
    fetch(`${API}/admin/directory`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setEntries(d.entries || []))
      .catch(() => setError('Failed to load directory'))
      .finally(() => setLoading(false))
  }, [user])

  const allStates = useMemo(() =>
    [...new Set(entries.map(e => e.location.state).filter(Boolean))].sort() as string[]
  , [entries])

  const filtered = useMemo(() => entries.filter(e => {
    if (claimFilter === 'listed' && !e.listed) return false
    if (claimFilter === 'claimed' && !e.claimed) return false
    if (claimFilter === 'delisted' && (e.listed || !e.claimed)) return false
    if (search && !e.companyName.toLowerCase().includes(search.toLowerCase())) return false
    if (filterState && e.location.state !== filterState) return false
    return true
  }), [entries, claimFilter, search, filterState])

  const counts = useMemo(() => ({
    all: entries.length,
    listed: entries.filter(e => e.listed).length,
    claimed: entries.filter(e => e.claimed).length,
    delisted: entries.filter(e => !e.listed && e.claimed).length,
  }), [entries])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from the ProduceHunt directory? This cannot be undone.`)) return
    setDeleting(id)
    try {
      const res = await fetch(`${API}/admin/directory/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (!res.ok) throw new Error('Failed to remove')
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed to remove') }
    finally { setDeleting(null) }
  }

  const handleSave = async (id: string, data: Partial<DirectoryEntry>) => {
    await fetch(`${API}/admin/directory/${id}`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
    }).then(r => { if (!r.ok) throw new Error('Save failed') })
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...data } : e))
  }

  const toggleExpanded = (id: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const varName = (v: string | { name: string }) => typeof v === 'string' ? v : v.name

  if (user?.subscriptionTier !== 'admin') return null

  return (
    <div>
      <div className="mb-6">
        <Breadcrumbs items={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'ProduceHunt Directory', current: true }]} />
        <div className="mt-2">
          <h1 className="text-2xl font-bold text-gray-900">ProduceHunt Directory</h1>
          <p className="mt-1 text-sm text-gray-500">Live supplier listings — publicly searchable on ProduceHunt.</p>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4">
        {([
          { key: 'all', label: 'All', active: 'bg-gray-900 text-white' },
          { key: 'listed', label: 'Listed', active: 'bg-emerald-100 text-emerald-800' },
          { key: 'claimed', label: 'Claimed', active: 'bg-blue-100 text-blue-800' },
          { key: 'delisted', label: 'Delisted', active: 'bg-red-100 text-red-800' },
        ] as const).map(({ key, label, active }) => (
          <button key={key} onClick={() => setClaimFilter(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              claimFilter === key ? active : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
            }`}>
            {label}
            <span className="ml-1.5 opacity-60">{counts[key]}</span>
          </button>
        ))}
      </div>

      {/* Search + state filter */}
      <div className="flex items-center gap-2 mb-5">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings…"
            className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 w-48" />
        </div>
        <select value={filterState} onChange={e => setFilterState(e.target.value)}
          className="px-2.5 py-1.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-600">
          <option value="">All states</option>
          {allStates.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-400">{filtered.length} of {entries.length} listings</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {entries.length === 0 ? 'No listings yet. Push companies from the pipeline.' : 'No results match your filters.'}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Company', 'Location', 'Products', 'Score', 'Status', 'Claimed By', 'Added', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(entry => {
                const isExpanded = expandedProducts.has(entry.id)
                const displayProducts = isExpanded ? entry.products : entry.products.slice(0, 4)
                const overflow = entry.products.length - 4
                return (
                  <tr key={entry.id} className="hover:bg-gray-50 align-top">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-gray-900">{entry.companyName}</p>
                        {entry.claimed && <CheckBadgeIcon className="h-4 w-4 text-emerald-500 flex-shrink-0" title="Claimed" />}
                      </div>
                      {entry.operationScale && (() => {
                        const scaleStyle: Record<string, string> = {
                          'packer-shipper':  'bg-purple-50 text-purple-700',
                          'major-grower':    'bg-indigo-50 text-indigo-700',
                          'commercial-farm': 'bg-sky-50 text-sky-700',
                          'small-farm':      'bg-gray-100 text-gray-500',
                          'direct-market':   'bg-amber-50 text-amber-700',
                        }
                        const scaleLabel: Record<string, string> = {
                          'packer-shipper':  'Packer/Shipper',
                          'major-grower':    'Major Grower',
                          'commercial-farm': 'Commercial',
                          'small-farm':      'Small Farm',
                          'direct-market':   'Direct Market',
                        }
                        return (
                          <span className={`inline-block mt-0.5 px-1.5 py-0.5 text-xs rounded font-medium ${scaleStyle[entry.operationScale!] || 'bg-gray-100 text-gray-400'}`}>
                            {scaleLabel[entry.operationScale!] || entry.operationScale}
                            {entry.certifiedAcres ? ` · ${entry.certifiedAcres.toLocaleString()} ac` : ''}
                          </span>
                        )
                      })()}
                      {entry.website && (
                        <a href={entry.website.match(/^https?:\/\//) ? entry.website : `https://${entry.website}`}
                          target="_blank" rel="noreferrer"
                          className="text-xs text-blue-400 hover:underline block mt-0.5">
                          {entry.website.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">/{entry.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {entry.location.full || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {displayProducts.map((p, i) => {
                          const varieties = (p.varieties || []).map(varName).filter(Boolean)
                          return (
                            <div key={i} className="flex flex-col">
                              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium">{p.commodity}</span>
                              {isExpanded && varieties.length > 0 && (
                                <div className="flex flex-wrap gap-0.5 mt-0.5 ml-1">
                                  {varieties.map((v, j) => (
                                    <span key={j} className="text-xs text-gray-400">
                                      {j > 0 && '· '}{v}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                        {!isExpanded && overflow > 0 && (
                          <button onClick={() => toggleExpanded(entry.id)}
                            className="px-1.5 py-0.5 text-xs text-blue-500 hover:text-blue-700 font-medium">
                            +{overflow} more
                          </button>
                        )}
                        {isExpanded && (
                          <button onClick={() => toggleExpanded(entry.id)}
                            className="text-xs text-gray-400 hover:text-gray-600 mt-1">
                            show less
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {entry.verificationScore ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${entry.verificationScore.percentage}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{entry.verificationScore.score}/{entry.verificationScore.maxScore}</span>
                        </div>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full w-fit ${
                          entry.listed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {entry.listed ? 'Listed' : 'Delisted'}
                        </span>
                        {entry.claimed && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 w-fit">Claimed</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {entry.claimedBy ? (
                        <div>
                          <p className="text-xs font-medium text-gray-700">{entry.claimedBy.profile?.companyName || entry.claimedBy.email}</p>
                          <p className="text-xs text-gray-400">{entry.claimedBy.email}</p>
                        </div>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditEntry(entry)} title="Edit listing"
                          className="p-1.5 text-gray-300 hover:text-gray-600 transition-colors">
                          <PencilSquareIcon className="h-3.5 w-3.5" />
                        </button>
                        <a href={`${PH_URL}/supplier/${entry.slug}`} target="_blank" rel="noreferrer"
                          title="View on ProduceHunt" className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors">
                          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                        </a>
                        <button onClick={() => handleDelete(entry.id, entry.companyName)} disabled={deleting === entry.id}
                          title="Remove from directory" className="p-1.5 text-gray-200 hover:text-red-400 disabled:opacity-50 transition-colors">
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {editEntry && (
        <EditModal
          entry={editEntry}
          onClose={() => setEditEntry(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
