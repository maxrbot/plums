'use client'

import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import {
  PlusIcon,
  ArrowUpCircleIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
function authHeaders() {
  const t = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  return { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' }
}

interface ScrapedVariety {
  name: string
  availability?: string | null
  organic?: boolean | null
  growingPractices?: string[]
}

interface ScrapedProduct {
  category: string
  commodity: string
  varieties: ScrapedVariety[]
}

interface PipelineEntry {
  _id: string
  companyName: string
  location: { city?: string; state?: string; county?: string; full: string }
  commodities: string[]
  organic: boolean | null
  size?: 'small' | 'medium' | 'large' | 'huge'
  type?: 'grower' | 'shipper' | 'grower-shipper' | 'distributor'
  website?: string
  contactEmail?: string
  contactName?: string
  notes?: string
  status: 'pending' | 'scraped' | 'pushed' | 'claimed' | 'dismissed'
  pushedAt?: string
  supplierDirectoryId?: string
  importSource?: 'usda-organic' | 'usda-paca' | 'admin-pipeline' | 'web-scrape'
  scraped?: boolean
  scrapedAt?: string
  brandStory?: string
  phase1Commodities?: string[]
  scrapedData?: Record<string, unknown>
  outreachSent?: boolean
  dismissReason?: string
  createdAt: string
  // Phase 1 enrichment fields
  certifiedAcres?: number
  operationScale?: 'packer-shipper' | 'major-grower' | 'commercial-farm' | 'small-farm' | 'direct-market'
  operationFlags?: {
    csa?: boolean
    distributor?: boolean
    broker?: boolean
    coPacker?: boolean
    marketer?: boolean
    growerGroup?: boolean
    handler?: boolean
  }
  contact?: { phone?: string; email?: string }
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700',
  scraped:   'bg-purple-50 text-purple-700',
  pushed:    'bg-blue-50 text-blue-700',
  claimed:   'bg-emerald-50 text-emerald-700',
  dismissed: 'bg-gray-100 text-gray-400',
}

function emptyForm() {
  return {
    companyName: '', city: '', state: '', commodities: '',
    organic: '' as '' | 'true' | 'false',
    size: '' as '' | 'small' | 'medium' | 'large' | 'huge',
    type: '' as '' | 'grower' | 'shipper' | 'grower-shipper' | 'distributor',
    website: '', contactEmail: '', contactName: '', notes: '',
  }
}

function parseForm(f: ReturnType<typeof emptyForm>) {
  return {
    companyName: f.companyName.trim(),
    location: {
      city: f.city.trim(), state: f.state.trim(),
      full: [f.city.trim(), f.state.trim()].filter(Boolean).join(', '),
    },
    commodities: f.commodities.split(',').map(s => s.trim()).filter(Boolean),
    organic: f.organic === 'true' ? true : f.organic === 'false' ? false : null,
    size: f.size || undefined,
    type: f.type || undefined,
    website: f.website.trim() || undefined,
    contactEmail: f.contactEmail.trim() || undefined,
    contactName: f.contactName.trim() || undefined,
    notes: f.notes.trim() || undefined,
  }
}

export default function DirectoryPipelinePage() {
  const { user } = useUser()
  const router = useRouter()

  const [pipeline, setPipeline] = useState<PipelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add form
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)


  // Actions
  const [pushModalEntry, setPushModalEntry] = useState<PipelineEntry | null>(null)
  const [pushing, setPushing] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Import batch
  const [showImportModal, setShowImportModal] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'scraped' | 'pushed' | 'claimed' | 'dismissed'>('all')
  const [search, setSearch] = useState('')
  const [filterState, setFilterState] = useState('')
  const [filterCommodity, setFilterCommodity] = useState('')
  const [filterSize, setFilterSize] = useState('')
  const [filterType, setFilterType] = useState('')

  useEffect(() => {
    if (user && user.subscriptionTier !== 'admin') router.push('/dashboard')
  }, [user, router])

  useEffect(() => {
    if (user?.subscriptionTier !== 'admin') return
    fetch(`${API}/admin/directory-pipeline`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setPipeline(d.entries || []))
      .catch(() => setError('Failed to load pipeline'))
      .finally(() => setLoading(false))
  }, [user])

  // Derived filter options from data
  const allStates = useMemo(() =>
    [...new Set(pipeline.map(e => e.location.state).filter(Boolean))].sort() as string[]
  , [pipeline])

  const allCommodities = useMemo(() =>
    [...new Set(pipeline.flatMap(e => e.commodities))].sort()
  , [pipeline])

  // Filtered list
  const filtered = useMemo(() => {
    return pipeline.filter(e => {
      // 'all' hides dismissed — must select 'dismissed' tab explicitly
      if (statusFilter === 'all' && e.status === 'dismissed') return false
      if (statusFilter !== 'all' && e.status !== statusFilter) return false
      if (search && !e.companyName.toLowerCase().includes(search.toLowerCase())) return false
      if (filterState && e.location.state !== filterState) return false
      if (filterCommodity && !e.commodities.includes(filterCommodity)) return false
      if (filterSize && e.size !== filterSize) return false
      if (filterType && e.type !== filterType) return false
      return true
    })
  }, [pipeline, statusFilter, search, filterState, filterCommodity, filterSize, filterType])

  const counts = useMemo(() => ({
    all:       pipeline.filter(e => e.status !== 'dismissed').length,
    pending:   pipeline.filter(e => e.status === 'pending').length,
    scraped:   pipeline.filter(e => e.status === 'scraped').length,
    pushed:    pipeline.filter(e => e.status === 'pushed').length,
    claimed:   pipeline.filter(e => e.status === 'claimed').length,
    dismissed: pipeline.filter(e => e.status === 'dismissed').length,
  }), [pipeline])

  const hasActiveFilters = search || filterState || filterCommodity || filterSize || filterType

  function clearFilters() {
    setSearch('')
    setFilterState('')
    setFilterCommodity('')
    setFilterSize('')
    setFilterType('')
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    if (!form.companyName.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`${API}/admin/directory-pipeline`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(parseForm(form))
      })
      const entry = await res.json()
      setPipeline(prev => [entry, ...prev])
      setForm(emptyForm())
      setShowAddForm(false)
    } catch { alert('Failed to add entry') }
    finally { setSaving(false) }
  }

  const handleSaveEdits = async (id: string, body: Record<string, unknown>) => {
    try {
      await fetch(`${API}/admin/directory-pipeline/${id}`, {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify({
          companyName: body.companyName,
          location: body.location,
          website: body.website,
          contactEmail: body.contactEmail,
          commodities: body.commodities,
          organic: (body.certifications as string[] | undefined)?.some(c => c.toLowerCase().includes('organic')) ?? null,
        })
      })
      setPipeline(prev => prev.map(e => e._id === id ? {
        ...e,
        companyName: body.companyName as string,
        location: body.location as PipelineEntry['location'],
        website: body.website as string,
        contactEmail: body.contactEmail as string,
        commodities: body.commodities as string[],
      } : e))
      setPushModalEntry(null)
    } catch { alert('Failed to save') }
  }

  const handlePush = async (id: string, body: Record<string, unknown>) => {
    setPushing(true)
    try {
      const res = await fetch(`${API}/admin/directory-pipeline/${id}/push`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(body)
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      const data = await res.json()
      setPipeline(prev => prev.map(e => e._id === id
        ? { ...e, status: 'pushed', supplierDirectoryId: data.supplierDirectoryId, pushedAt: new Date().toISOString() }
        : e
      ))
      setPushModalEntry(null)
      router.push('/dashboard/admin/directory')
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed to push') }
    finally { setPushing(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this pipeline entry?')) return
    setDeleting(id)
    try {
      await fetch(`${API}/admin/directory-pipeline/${id}`, { method: 'DELETE', headers: authHeaders() })
      setPipeline(prev => prev.filter(e => e._id !== id))
    } catch { alert('Failed to delete') }
    finally { setDeleting(null) }
  }

  const handleDismiss = async (id: string, reason?: string) => {
    try {
      await fetch(`${API}/admin/pipeline/${id}/dismiss`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ reason }) })
      setPipeline(prev => prev.map(e => e._id === id ? { ...e, status: 'dismissed', dismissReason: reason } : e))
      setPushModalEntry(null)
    } catch { alert('Failed to dismiss') }
  }

  const handleScrape = async (id: string): Promise<Partial<PipelineEntry> | null> => {
    const res = await fetch(`${API}/admin/pipeline/${id}/scrape`, { method: 'POST', headers: authHeaders(), body: '{}' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Scrape failed')
    setPipeline(prev => prev.map(e => e._id === id
      ? {
          ...e,
          status: 'scraped',
          scraped: true,
          brandStory: data.scraped?.brandStory,
          scrapedData: data.scraped,
          // Capture phase1 commodities before merge (only on first scrape)
          phase1Commodities: e.phase1Commodities ?? e.commodities,
        }
      : e
    ))
    return data.scraped || null
  }

  if (user?.subscriptionTier !== 'admin') return null

  return (
    <div>
      <div className="mb-6">
        <Breadcrumbs items={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'Directory Pipeline', current: true }]} />
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Directory Pipeline</h1>
            <p className="mt-1 text-sm text-gray-500">Curate companies and push them live to ProduceHunt.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:border-gray-400 transition-colors"
            >
              Import Batch
            </button>
            <button
              onClick={() => setShowAddForm(v => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Add Company
            </button>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">New Pipeline Entry</h3>
          <PipelineForm form={form} onChange={setForm} />
          <div className="flex items-center gap-2 mt-4">
            <button onClick={handleAdd} disabled={saving || !form.companyName.trim()}
              className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : 'Add to Pipeline'}
            </button>
            <button onClick={() => { setShowAddForm(false); setForm(emptyForm()) }}
              className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Status pills */}
      <div className="flex items-center gap-2 mb-4">
        {(['all', 'pending', 'scraped', 'pushed', 'claimed', 'dismissed'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s
                ? s === 'pending'   ? 'bg-amber-100 text-amber-800'
                : s === 'scraped'   ? 'bg-purple-100 text-purple-800'
                : s === 'pushed'    ? 'bg-blue-100 text-blue-800'
                : s === 'claimed'   ? 'bg-emerald-100 text-emerald-800'
                : s === 'dismissed' ? 'bg-gray-100 text-gray-500'
                : 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1.5 opacity-60">{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search companies…"
            className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 w-48"
          />
        </div>
        <select value={filterState} onChange={e => setFilterState(e.target.value)}
          className="px-2.5 py-1.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-600">
          <option value="">All states</option>
          {allStates.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterCommodity} onChange={e => setFilterCommodity(e.target.value)}
          className="px-2.5 py-1.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-600">
          <option value="">All commodities</option>
          {allCommodities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterSize} onChange={e => setFilterSize(e.target.value)}
          className="px-2.5 py-1.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-600">
          <option value="">All sizes</option>
          {['small','medium','large','huge'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-2.5 py-1.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-600">
          <option value="">All types</option>
          {['grower','shipper','grower-shipper','distributor'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
{hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
            <FunnelIcon className="h-3 w-3" /> Clear filters
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">{filtered.length} of {pipeline.length}</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {pipeline.length === 0 ? 'No companies yet.' : 'No results match your filters.'}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Company', 'Location', 'Commodities', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(entry => (
                <tr key={entry._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-medium text-gray-900">{entry.companyName}</p>
                      {entry.importSource === 'usda-organic' && (
                        <span className="px-1.5 py-0.5 text-xs rounded bg-emerald-50 text-emerald-700 font-medium">Organic</span>
                      )}
                      {entry.importSource === 'usda-paca' && (
                        <span className="px-1.5 py-0.5 text-xs rounded bg-blue-50 text-blue-700 font-medium">PACA</span>
                      )}
                      {(!entry.website || !entry.contactEmail || !entry.location.city) && entry.status === 'pending' && (
                        <span title={[
                          !entry.website && 'Missing website',
                          !entry.contactEmail && 'Missing contact email',
                          !entry.location.city && 'Missing city',
                        ].filter(Boolean).join(' · ')}
                          className="text-amber-400 cursor-default text-xs">⚠</span>
                      )}
                    </div>
                    {entry.website && (
                      <a href={entry.website.match(/^https?:\/\//) ? entry.website : `https://${entry.website}`} target="_blank" rel="noreferrer"
                        className="text-xs text-blue-500 hover:underline block">
                        {entry.website.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    )}
                    {(entry.contactEmail || entry.contact?.email) && (
                      <p className="text-xs text-gray-400">{entry.contactEmail || entry.contact?.email}</p>
                    )}
                    {entry.contact?.phone && (
                      <p className="text-xs text-gray-400">{entry.contact.phone}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-500 whitespace-nowrap">{entry.location.full || '—'}</p>
                    {entry.operationScale && (() => {
                      const scaleStyle: Record<string, string> = {
                        'packer-shipper': 'bg-purple-50 text-purple-700',
                        'major-grower':   'bg-indigo-50 text-indigo-700',
                        'commercial-farm':'bg-sky-50 text-sky-700',
                        'small-farm':     'bg-gray-100 text-gray-500',
                        'direct-market':  'bg-amber-50 text-amber-700',
                      }
                      const scaleLabel: Record<string, string> = {
                        'packer-shipper': 'Packer/Shipper',
                        'major-grower':   'Major Grower',
                        'commercial-farm':'Commercial',
                        'small-farm':     'Small Farm',
                        'direct-market':  'Direct Market',
                      }
                      return (
                        <span className={`inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 text-xs rounded font-medium ${scaleStyle[entry.operationScale!] || 'bg-gray-100 text-gray-400'}`}>
                          {scaleLabel[entry.operationScale!] || entry.operationScale}
                          {entry.certifiedAcres ? <span className="opacity-60">· {entry.certifiedAcres.toLocaleString()} ac</span> : null}
                        </span>
                      )
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const isScraped = entry.scraped && Array.isArray((entry.scrapedData as any)?.products)
                      const display = isScraped
                        ? [...new Set((entry.scrapedData as any).products.map((p: any) => p.commodity as string))]
                        : [...new Set(entry.commodities)]
                      return (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {display.slice(0, 3).map(c => (
                            <span key={c} className={`px-1.5 py-0.5 text-xs rounded ${isScraped ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{c}</span>
                          ))}
                          {display.length > 3 && (
                            <span className="px-1.5 py-0.5 text-gray-400 text-xs">+{display.length - 3} more</span>
                          )}
                        </div>
                      )
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[entry.status]}`}>
                      {entry.status}
                    </span>
                    {entry.pushedAt && (
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(entry.pushedAt).toLocaleDateString()}</p>
                    )}
                    {entry.dismissReason && (
                      <p className="text-xs text-gray-400 mt-0.5 italic">{entry.dismissReason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setPushModalEntry(entry)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors">
                        <ArrowUpCircleIcon className="h-3.5 w-3.5" />
                        {entry.status === 'pending' ? 'Push / Edit' : 'Edit'}
                      </button>
                      <button onClick={() => handleDelete(entry._id)} disabled={deleting === entry._id}
                        className="p-1.5 text-gray-200 hover:text-red-400 disabled:opacity-50 transition-colors">
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showImportModal && (
        <ImportBatchModal
          onClose={() => setShowImportModal(false)}
          onImported={(count) => {
            setShowImportModal(false)
            // Reload pipeline
            fetch(`${API}/admin/directory-pipeline`, { headers: authHeaders() })
              .then(r => r.json()).then(d => setPipeline(d.entries || []))
          }}
        />
      )}

      {pushModalEntry && (
        <PushModal
          entry={pushModalEntry}
          pushing={pushing}
          onClose={() => setPushModalEntry(null)}
          onSave={(body) => handleSaveEdits(pushModalEntry._id, body)}
          onPush={(body) => handlePush(pushModalEntry._id, body)}
          onDismiss={(reason) => handleDismiss(pushModalEntry._id, reason)}
          onScrape={() => handleScrape(pushModalEntry._id)}
        />
      )}
    </div>
  )
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
]

const COMMODITY_OPTIONS = [
  'apple','apricot','artichoke','asparagus','avocado','berry','blueberry',
  'broccoli','carrot','cauliflower','celery','cherry','citrus','corn','cucumber',
  'garlic','grape','grapefruit','green bean','herb','kale','lemon','lettuce',
  'lime','mango','melon','mushroom','nectarine','onion','orange','peach','pear',
  'pepper','pineapple','plum','potato','raspberry','spinach','squash','strawberry',
  'tomato','watermelon','zucchini',
]

function ImportBatchModal({ onClose, onImported }: {
  onClose: () => void
  onImported: (count: number) => void
}) {
  const [source, setSource] = useState<'usda-organic' | 'usda-paca'>('usda-organic')
  const [state, setState] = useState('CA')
  const [commodity, setCommodity] = useState('')
  const [limit, setLimit] = useState(100)
  const [mode, setMode] = useState<'api' | 'csv'>('csv')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ inserted: number; skipped: number; message: string; debug?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadFile(e.target.files?.[0] ?? null)
  }

  const handleImport = async () => {
    setImporting(true)
    setError(null)
    setResult(null)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

      let res: Response
      if (mode === 'csv' && uploadFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve((reader.result as string).split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(uploadFile)
        })
        const isXlsx = uploadFile.name.endsWith('.xlsx')
        res = await fetch(`${API}/admin/import-batch`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source, limit,
            state: state || undefined,
            commodity: commodity || undefined,
            fileData: base64,
            fileType: isXlsx ? 'xlsx' : 'csv',
          }),
        })
      } else {
        res = await fetch(`${API}/admin/import-batch`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ source, limit, state: state || undefined, commodity: commodity || undefined }),
        })
      }

      const data = await res.json()
      if (!res.ok) {
        setError(data.error + (data.instructions ? `\n\n${data.instructions}` : ''))
        return
      }
      setResult(data)
      onImported(data.inserted)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setImporting(false)
    }
  }

  const inputCls = "w-full px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Import Batch</h2>
            <p className="text-xs text-gray-400 mt-0.5">Pull certified organic or PACA suppliers into the pipeline.</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-300 hover:text-gray-600 transition-colors">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Source */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Source</label>
            <div className="flex gap-2">
              {(['usda-organic', 'usda-paca'] as const).map(s => (
                <button key={s} type="button" onClick={() => setSource(s)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    source === s ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}>
                  {s === 'usda-organic' ? '🌿 USDA Organic' : '📋 USDA PACA'}
                </button>
              ))}
            </div>
            {source === 'usda-paca' && (
              <p className="mt-2 text-xs text-amber-600">PACA has no public API — CSV upload required. Request the licensee list from USDA at (800) 495-7222.</p>
            )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
              <select value={state} onChange={e => setState(e.target.value)} className={inputCls}>
                <option value="">All states</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Commodity</label>
              <select value={commodity} onChange={e => setCommodity(e.target.value)} className={inputCls}>
                <option value="">All commodities</option>
                {COMMODITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Limit</label>
              <select value={limit} onChange={e => setLimit(Number(e.target.value))} className={inputCls}>
                {[25, 50, 100, 200, 500].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* Mode toggle */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Data source</label>
            <div className="flex gap-2">
              {(['api', 'csv'] as const).map(m => (
                <button key={m} type="button" onClick={() => setMode(m)}
                  disabled={source === 'usda-paca' && m === 'api'}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    mode === m ? 'bg-gray-100 border-gray-300 text-gray-800 font-medium' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}>
                  {m === 'api' ? 'Pull via API' : 'Upload CSV'}
                </button>
              ))}
            </div>
          </div>

          {mode === 'api' && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-xs text-amber-700 space-y-1">
              <p className="font-medium">⚠ USDA API currently unreliable — use CSV upload instead</p>
              <p>The USDA OData service is returning 503 errors. CSV upload works reliably.</p>
            </div>
          )}

          {(mode === 'csv' || source === 'usda-paca') && (
            <div className="space-y-3">
              {source === 'usda-organic' && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-800 space-y-1.5">
                  <p className="font-semibold">How to get the CSV:</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700">
                    <li>Go to <span className="font-mono bg-blue-100 px-1 rounded">organic.ams.usda.gov/integrity/Search</span></li>
                    <li>Set <strong>Operation Type</strong> → Crops &amp; Livestock</li>
                    <li>Set <strong>State</strong> (e.g. California), click Search</li>
                    <li>Click <strong>Export to CSV</strong> at top-right of results</li>
                    <li>Upload the downloaded file below</li>
                  </ol>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Upload file <span className="text-gray-400 font-normal">(CSV or XLSX)</span></label>
                <input type="file" accept=".csv,.xlsx,.txt" onChange={handleFileUpload}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                {uploadFile && (
                  <p className="mt-1 text-xs text-emerald-600">✓ {uploadFile.name} ({(uploadFile.size / 1024).toFixed(0)} KB)</p>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-xs text-red-700 whitespace-pre-wrap">{error}</div>
          )}

          {result && (
            <div className={`border rounded-lg px-4 py-3 text-xs space-y-1 ${result.inserted > 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
              <p className="font-medium">{result.inserted > 0 ? '✓ ' : ''}{result.message}</p>
              {result.debug && <p className="font-mono text-xs opacity-80 break-all">{result.debug}</p>}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700">
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && (
            <button
              onClick={handleImport}
              disabled={importing || (mode === 'csv' && !uploadFile)}
              className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black disabled:opacity-50 transition-colors"
            >
              {importing ? 'Importing…' : `Import up to ${limit}`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const ALL_COMMODITIES = [
  'Apple', 'Apricot', 'Artichoke', 'Arugula', 'Asparagus', 'Avocado',
  'Banana', 'Basil', 'Beet', 'Bell Pepper', 'Blackberry', 'Blueberry', 'Bok Choy', 'Broccoli', 'Brussels Sprout', 'Butternut Squash',
  'Cabbage', 'Cantaloupe', 'Carrot', 'Cauliflower', 'Celery', 'Cherry', 'Cilantro', 'Clementine', 'Corn', 'Cranberry', 'Cucumber',
  'Date', 'Dragon Fruit',
  'Edamame', 'Eggplant', 'Endive',
  'Fennel', 'Fig',
  'Garlic', 'Ginger', 'Grape', 'Grapefruit', 'Green Bean', 'Green Onion', 'Guava',
  'Honeydew',
  'Jalapeño', 'Jicama',
  'Kale', 'Kiwi', 'Kohlrabi',
  'Leek', 'Lemon', 'Lettuce', 'Lime',
  'Mandarin', 'Mango', 'Melon', 'Mint', 'Mushroom',
  'Nectarine',
  'Onion', 'Orange',
  'Papaya', 'Parsley', 'Passion Fruit', 'Peach', 'Pear', 'Peas', 'Pineapple', 'Plum', 'Pomegranate', 'Potato',
  'Radicchio', 'Radish', 'Raspberry', 'Romaine',
  'Shallot', 'Spinach', 'Squash', 'Strawberry', 'Sweet Potato',
  'Tangerine', 'Tomatillo', 'Tomato', 'Turnip',
  'Watermelon',
  'Yellow Squash', 'Yukon Gold Potato',
  'Zucchini',
]

function CommoditySelector({
  selected, onChange, phase1Commodities, scrapedCommodities,
}: {
  selected: string[]
  onChange: (v: string[]) => void
  phase1Commodities?: string[]
  scrapedCommodities?: string[]
}) {
  const [query, setQuery] = useState('')

  const suggestions = query.length > 0
    ? ALL_COMMODITIES.filter(c =>
        c.toLowerCase().includes(query.toLowerCase()) && !selected.includes(c)
      ).slice(0, 8)
    : []

  const add = (c: string) => { onChange([...selected, c]); setQuery('') }
  const remove = (c: string) => onChange(selected.filter(s => s !== c))

  const tagStyle = (c: string) => {
    if (!scrapedCommodities) return 'bg-gray-100 border border-transparent text-gray-700'
    const inScrape = scrapedCommodities.map(s => s.toLowerCase()).includes(c.toLowerCase())
    const inPhase1 = (phase1Commodities || []).map(s => s.toLowerCase()).includes(c.toLowerCase())
    if (inScrape && inPhase1) return 'bg-purple-50 border border-purple-300 text-purple-800' // confirmed by both
    if (inScrape && !inPhase1) return 'bg-purple-100 border border-purple-400 text-purple-900' // new from website
    if (!inScrape && inPhase1) return 'bg-orange-50 border border-orange-300 text-orange-800' // phase 1 only, not on website
    return 'bg-gray-100 border border-transparent text-gray-700'
  }

  return (
    <div>
      {scrapedCommodities && (
        <div className="flex items-center gap-3 mb-2 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-purple-400 bg-purple-100 inline-block" /> New from website</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-purple-300 bg-purple-50 inline-block" /> Confirmed by both</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-orange-300 bg-orange-50 inline-block" /> Phase 1 only</span>
        </div>
      )}
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map(c => (
            <span key={c} className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md font-medium ${tagStyle(c)}`}>
              {c}
              <button type="button" onClick={() => remove(c)} className="opacity-50 hover:opacity-100 leading-none">×</button>
            </span>
          ))}
        </div>
      )}
      {/* Search input */}
      <div className="relative">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Type to add commodity…"
          className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-md z-10 max-h-48 overflow-y-auto">
            {suggestions.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => add(c)}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ScrapedProductsView({
  products,
  phase1Commodities,
  onChange,
}: {
  products: ScrapedProduct[]
  phase1Commodities?: string[]
  onChange: (v: ScrapedProduct[]) => void
}) {
  const removeVariety = (pIdx: number, varietyName: string) => {
    onChange(products.map((p, i) =>
      i === pIdx ? { ...p, varieties: p.varieties.filter(v => v.name !== varietyName) } : p
    ))
  }
  const removeProduct = (pIdx: number) => onChange(products.filter((_, i) => i !== pIdx))

  // Group by category for display
  const byCategory: Record<string, Array<{ product: ScrapedProduct; idx: number }>> = {}
  products.forEach((p, idx) => {
    if (!byCategory[p.category]) byCategory[p.category] = []
    byCategory[p.category].push({ product: p, idx })
  })

  const commodityStyle = (commodity: string) => {
    const inPhase1 = (phase1Commodities || []).map(c => c.toLowerCase()).includes(commodity.toLowerCase())
    if (inPhase1) return 'bg-purple-50 border border-purple-300 text-purple-800'
    return 'bg-purple-100 border border-purple-400 text-purple-900'
  }

  return (
    <div className="space-y-3">
      {Object.entries(byCategory).map(([category, items]) => (
        <div key={category}>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1.5">{category}</p>
          <div className="space-y-2">
            {items.map(({ product, idx }) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md font-semibold ${commodityStyle(product.commodity)}`}>
                    {product.commodity}
                    <button type="button" onClick={() => removeProduct(idx)} className="opacity-40 hover:opacity-80 leading-none ml-0.5">×</button>
                  </span>
                </div>
                {product.varieties.length > 0 && (
                  <div className="ml-3 flex flex-col gap-1">
                    {product.varieties.map(v => (
                      <div key={v.name} className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-md">
                          {v.name}
                          <button type="button" onClick={() => removeVariety(idx, v.name)} className="opacity-40 hover:opacity-80 leading-none">×</button>
                        </span>
                        {v.organic === true && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded font-medium">Organic</span>
                        )}
                        {v.organic === false && (
                          <span className="px-1.5 py-0.5 bg-gray-50 border border-gray-200 text-gray-500 text-xs rounded">Conventional</span>
                        )}
                        {v.growingPractices && v.growingPractices.filter(p => p !== 'USDA Organic').map(p => (
                          <span key={p} className="px-1.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 text-xs rounded">{p}</span>
                        ))}
                        {v.availability && (
                          <span className="text-xs text-gray-400 italic">{v.availability}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {phase1Commodities && phase1Commodities.length > 0 && (() => {
        const scrapedCommodityNames = products.map(p => p.commodity.toLowerCase())
        const notOnWebsite = phase1Commodities.filter(c => !scrapedCommodityNames.includes(c.toLowerCase()))
        if (notOnWebsite.length === 0) return null
        return (
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1.5">Phase 1 only — not found on website</p>
            <div className="flex flex-wrap gap-1.5">
              {notOnWebsite.map(c => (
                <span key={c} className="px-2 py-0.5 bg-orange-50 border border-orange-300 text-orange-800 text-xs rounded-md font-medium">{c}</span>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

function PushModal({
  entry,
  pushing,
  onClose,
  onSave,
  onPush,
  onDismiss,
  onScrape,
}: {
  entry: PipelineEntry
  pushing: boolean
  onClose: () => void
  onSave: (body: Record<string, unknown>) => void
  onPush: (body: Record<string, unknown>) => void
  onDismiss: (reason?: string) => void
  onScrape: () => Promise<Partial<PipelineEntry> | null>
}) {
  const CERT_OPTIONS = ['USDA Organic', 'PACA Licensed', 'GFSI Certified', 'DRC Member', 'Non-GMO Project', 'Fair Trade']

  const initialCerts = entry.organic ? ['USDA Organic'] : []
  const initialScrapedProducts = (entry.scrapedData?.products as ScrapedProduct[]) || []

  const [companyName, setCompanyName] = useState(entry.companyName)
  const [city, setCity] = useState(entry.location.city || '')
  const [state, setState] = useState(entry.location.state || '')
  const [website, setWebsite] = useState(entry.website || '')
  const [contactEmail, setContactEmail] = useState(entry.contactEmail || '')
  const [brandStory, setBrandStory] = useState(entry.brandStory || '')
  const [scrapedProducts, setScrapedProducts] = useState<ScrapedProduct[]>(initialScrapedProducts)
  const [yearEstablished, setYearEstablished] = useState<string>(
    (entry.scrapedData?.yearEstablished as number)?.toString() || ''
  )
  const [certifications, setCertifications] = useState<string[]>(initialCerts)
  const [scraping, setScraping] = useState(false)
  const [scrapeError, setScrapeError] = useState<string | null>(null)
  const [scrapedFields, setScrapedFields] = useState<Set<string>>(new Set())
  const [dismissing, setDismissing] = useState(false)
  const [dismissReason, setDismissReason] = useState(entry.dismissReason || '')

  const [localPhase1Commodities, setLocalPhase1Commodities] = useState<string[] | undefined>(
    entry.phase1Commodities
  )

  const isDirty =
    companyName.trim() !== entry.companyName ||
    city.trim() !== (entry.location.city || '') ||
    state.trim() !== (entry.location.state || '') ||
    website.trim() !== (entry.website || '') ||
    contactEmail.trim() !== (entry.contactEmail || '') ||
    brandStory.trim() !== (entry.brandStory || '') ||
    certifications.join(',') !== initialCerts.join(',')

  const toggleCert = (cert: string) =>
    setCertifications(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert])

  const buildBody = () => ({
    companyName: companyName.trim(),
    location: { city: city.trim(), state: state.trim(), full: [city.trim(), state.trim()].filter(Boolean).join(', ') },
    website: website.trim(),
    contactEmail: contactEmail.trim(),
    brandStory: brandStory.trim() || undefined,
    commodities: scrapedProducts.map(p => p.commodity),
    products: scrapedProducts,
    yearEstablished: yearEstablished ? parseInt(yearEstablished) : undefined,
    certifications,
  })

  const inputCls = (scraped = false) =>
    `w-full px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${
      scraped ? 'border-purple-200 bg-purple-50 focus:ring-purple-300' : 'border-gray-200 focus:ring-gray-400'
    }`

  const isScraped = entry.scraped || scrapedProducts.length > 0

  const runScrape = async () => {
    setScraping(true)
    setScrapeError(null)
    try {
      const data = await onScrape()
      if (data) {
        const newScraped = new Set<string>()
        if (data.brandStory) { setBrandStory(data.brandStory as string); newScraped.add('brandStory') }
        const products = (data as any).products as ScrapedProduct[] | undefined
        if (products?.length) {
          setScrapedProducts(products)
setLocalPhase1Commodities(prev => prev ?? entry.commodities)
          newScraped.add('products')
        }
        if ((data as any).contactEmail) { setContactEmail((data as any).contactEmail); newScraped.add('contactEmail') }
        if ((data as any).yearEstablished) {
          setYearEstablished(String((data as any).yearEstablished))
          newScraped.add('established')
        }
        setScrapedFields(newScraped)
      }
    } catch (err: any) {
      setScrapeError(err.message)
    } finally {
      setScraping(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pipeline Review</p>
          <div className="flex items-center gap-2">
            {isScraped && entry.website && (
              <button onClick={runScrape} disabled={scraping}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-500 rounded-lg hover:border-gray-400 disabled:opacity-50 transition-colors">
                {scraping ? '⏳ Scraping…' : '↺ Re-scrape'}
              </button>
            )}
            <button onClick={onClose} className="p-1.5 text-gray-300 hover:text-gray-600 transition-colors">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {scrapeError && (
          <div className="px-6 py-2 bg-red-50 border-b border-red-100 text-xs text-red-600">{scrapeError}</div>
        )}

        <div className="divide-y divide-gray-100">

          {/* ── PHASE 1 — USDA Import ── */}
          <div className="px-6 py-5 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phase 1 — USDA Import</p>
              {entry.importSource === 'usda-organic' && (
                <span className="px-1.5 py-0.5 text-xs rounded bg-emerald-50 text-emerald-700 font-medium">Organic</span>
              )}
              {entry.importSource === 'usda-paca' && (
                <span className="px-1.5 py-0.5 text-xs rounded bg-blue-50 text-blue-700 font-medium">PACA</span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-700">{entry.companyName}</p>
            {entry.location.full && <p className="text-xs text-gray-400 mt-0.5">{entry.location.full}{entry.location.county ? ` · ${entry.location.county} County` : ''}</p>}
            {entry.website && (
              <a href={entry.website.match(/^https?:\/\//) ? entry.website : `https://${entry.website}`}
                target="_blank" rel="noreferrer"
                className="text-xs text-blue-400 hover:underline block mt-0.5">
                {entry.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            )}

            {/* Phase 1 enrichment grid */}
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
              {entry.contact?.phone && (
                <div>
                  <span className="text-xs text-gray-400">Phone </span>
                  <span className="text-xs text-gray-700">{entry.contact.phone}</span>
                </div>
              )}
              {(entry.contact?.email || entry.contactEmail) && (
                <div>
                  <span className="text-xs text-gray-400">Email </span>
                  <span className="text-xs text-gray-700">{entry.contact?.email || entry.contactEmail}</span>
                </div>
              )}
              {entry.certifiedAcres && (
                <div>
                  <span className="text-xs text-gray-400">Certified acres </span>
                  <span className="text-xs text-gray-700">{entry.certifiedAcres.toLocaleString()}</span>
                </div>
              )}
              {entry.operationScale && (
                <div>
                  <span className="text-xs text-gray-400">Scale </span>
                  <span className="text-xs text-gray-700 capitalize">{entry.operationScale.replace('-', ' ')}</span>
                </div>
              )}
              {(entry as any).dataSources?.usdaOrganic?.certifier && (
                <div>
                  <span className="text-xs text-gray-400">Certifier </span>
                  <span className="text-xs text-gray-700">{(entry as any).dataSources.usdaOrganic.certifier}</span>
                </div>
              )}
              {(entry as any).dataSources?.established?.yearEstablished && (
                <div>
                  <span className="text-xs text-gray-400">Cert. since </span>
                  <span className="text-xs text-gray-700">{(entry as any).dataSources.established.yearEstablished}</span>
                </div>
              )}
            </div>

            {/* Operation flags */}
            {entry.operationFlags && Object.values(entry.operationFlags).some(Boolean) && (
              <div className="flex flex-wrap gap-1 mt-2">
                {entry.operationFlags.csa && <span className="px-1.5 py-0.5 text-xs rounded bg-amber-50 text-amber-700 border border-amber-100">CSA</span>}
                {entry.operationFlags.distributor && <span className="px-1.5 py-0.5 text-xs rounded bg-purple-50 text-purple-700 border border-purple-100">Distributor</span>}
                {entry.operationFlags.broker && <span className="px-1.5 py-0.5 text-xs rounded bg-purple-50 text-purple-700 border border-purple-100">Broker</span>}
                {entry.operationFlags.coPacker && <span className="px-1.5 py-0.5 text-xs rounded bg-purple-50 text-purple-700 border border-purple-100">Co-Packer</span>}
                {entry.operationFlags.marketer && <span className="px-1.5 py-0.5 text-xs rounded bg-purple-50 text-purple-700 border border-purple-100">Marketer</span>}
                {entry.operationFlags.growerGroup && <span className="px-1.5 py-0.5 text-xs rounded bg-sky-50 text-sky-700 border border-sky-100">Grower Group</span>}
                {entry.operationFlags.handler && <span className="px-1.5 py-0.5 text-xs rounded bg-purple-50 text-purple-700 border border-purple-100">Handler</span>}
              </div>
            )}

            {(localPhase1Commodities || entry.commodities).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[...new Set(localPhase1Commodities || entry.commodities)].map(c => {
                  const superseded = isScraped && !scrapedProducts.some(
                    p => p.commodity.toLowerCase() === c.toLowerCase()
                  )
                  return (
                    <span key={c} className={`px-2 py-0.5 border text-xs rounded-md ${
                      superseded
                        ? 'bg-white border-gray-100 text-red-300 line-through'
                        : 'bg-white border-gray-200 text-gray-500'
                    }`}>{c}</span>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── PHASE 2 — Website Scrape ── */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phase 2 — Website Scrape</p>
              {isScraped && entry.scrapedAt && (
                <span className="text-xs text-purple-500">
                  ✓ {new Date(entry.scrapedAt).toLocaleDateString()}
                  {Array.isArray(entry.scrapedData?.crawledUrls) && (
                    <span className="text-gray-400 ml-1">· {(entry.scrapedData!.crawledUrls as string[]).length} pages</span>
                  )}
                </span>
              )}
            </div>

            {/* Scrape CTA — pre-scrape */}
            {!isScraped && (
              entry.website ? (
                <div className="py-6 flex flex-col items-center gap-3 border border-dashed border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-400 text-center">Scrape the website to populate product catalog,<br />varieties, organic status, and availability windows.</p>
                  <button onClick={runScrape} disabled={scraping}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors">
                    {scraping ? '⏳ Scraping…' : '✦ Scrape Website'}
                  </button>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg">
                  No website URL — cannot scrape.
                </div>
              )
            )}

            {/* Scraped fields — post-scrape */}
            {isScraped && (
              <div className="space-y-5">

                {/* Company info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Company Name</label>
                    <input value={companyName} onChange={e => setCompanyName(e.target.value)} className={inputCls()} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                    <input value={city} onChange={e => setCity(e.target.value)} placeholder="Salinas" className={inputCls()} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                    <input value={state} onChange={e => setState(e.target.value)} placeholder="CA" className={inputCls()} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
                    <input value={website} onChange={e => setWebsite(e.target.value)} className={inputCls()} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Contact Email
                      {scrapedFields.has('contactEmail') && <span className="ml-1.5 text-purple-500 text-xs font-normal">✦ scraped</span>}
                    </label>
                    <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="sales@example.com" className={inputCls(scrapedFields.has('contactEmail'))} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Brand Story
                      {scrapedFields.has('brandStory') && <span className="ml-1.5 text-purple-500 text-xs font-normal">✦ scraped</span>}
                    </label>
                    <textarea value={brandStory} onChange={e => setBrandStory(e.target.value)} rows={2}
                      placeholder="1–2 sentence description…"
                      className={inputCls(scrapedFields.has('brandStory')) + ' resize-none'} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Year Established
                      {scrapedFields.has('established') && <span className="ml-1.5 text-purple-500 text-xs font-normal">✦ scraped</span>}
                    </label>
                    <input type="number" value={yearEstablished}
                      onChange={e => setYearEstablished(e.target.value)}
                      placeholder="e.g. 1987" className={inputCls(scrapedFields.has('established'))} />
                  </div>
                </div>

                {/* Products */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Products</p>
                  {scrapedProducts.length > 0 ? (
                    <ScrapedProductsView
                      products={scrapedProducts}
                      phase1Commodities={localPhase1Commodities}
                      onChange={setScrapedProducts}
                    />
                  ) : (
                    <p className="text-xs text-gray-400 italic">No products extracted — try re-scraping.</p>
                  )}
                </div>

                {/* Certifications */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Certifications</p>
                  <div className="flex flex-wrap gap-2">
                    {CERT_OPTIONS.map(cert => (
                      <button key={cert} type="button" onClick={() => toggleCert(cert)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                          certifications.includes(cert)
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium'
                            : 'border-gray-200 text-gray-400 hover:border-gray-400'
                        }`}>
                        {certifications.includes(cert) ? '✓ ' : ''}{cert}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </button>
            {entry.status !== 'dismissed' && !dismissing && (
              <button onClick={() => setDismissing(true)} className="px-4 py-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors">
                Dismiss
              </button>
            )}
            {dismissing && (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={dismissReason}
                  onChange={e => setDismissReason(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') onDismiss(dismissReason || undefined); if (e.key === 'Escape') setDismissing(false) }}
                  placeholder="Reason (e.g. vineyard, no website)…"
                  className="px-2.5 py-1 border border-red-200 rounded-md text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-red-300 w-52"
                />
                <button onClick={() => onDismiss(dismissReason || undefined)} className="px-3 py-1 bg-red-50 text-red-500 text-xs font-medium rounded-md hover:bg-red-100 transition-colors">
                  Confirm
                </button>
                <button onClick={() => setDismissing(false)} className="text-xs text-gray-400 hover:text-gray-600">
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isScraped && isDirty && (
              <button onClick={() => onSave(buildBody())} disabled={pushing || !companyName.trim()}
                className="px-4 py-1.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:border-gray-400 disabled:opacity-50 transition-colors">
                Save edits
              </button>
            )}
            {entry.status !== 'pushed' && entry.status !== 'dismissed' && (
              isScraped ? (
                <button onClick={() => onPush(buildBody())} disabled={pushing || !companyName.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  <ArrowUpCircleIcon className="h-4 w-4" />
                  {pushing ? 'Pushing…' : 'Push to ProduceHunt'}
                </button>
              ) : (
                <button onClick={() => onPush(buildBody())} disabled={pushing || !companyName.trim()}
                  title="Scrape the website first for a richer directory profile"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 text-gray-400 text-sm font-medium rounded-lg hover:border-gray-300 hover:text-gray-600 disabled:opacity-50 transition-colors">
                  <ArrowUpCircleIcon className="h-4 w-4" />
                  {pushing ? 'Pushing…' : 'Push anyway'}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PipelineForm({ form, onChange }: { form: ReturnType<typeof emptyForm>; onChange: (f: ReturnType<typeof emptyForm>) => void }) {
  const f = (key: keyof ReturnType<typeof emptyForm>, value: string) => onChange({ ...form, [key]: value })
  const inputCls = "w-full px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
  const selectCls = `${inputCls} bg-white`
  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Company Name *</label>
        <input value={form.companyName} onChange={e => f('companyName', e.target.value)} placeholder="Sunridge Farms" className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
        <input value={form.city} onChange={e => f('city', e.target.value)} placeholder="Salinas" className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
        <input value={form.state} onChange={e => f('state', e.target.value)} placeholder="CA" className={inputCls} />
      </div>
      <div className="col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Commodities (comma-separated)</label>
        <input value={form.commodities} onChange={e => f('commodities', e.target.value)} placeholder="lemons, limes, avocados" className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Organic</label>
        <select value={form.organic} onChange={e => f('organic', e.target.value as any)} className={selectCls}>
          <option value="">Unknown</option><option value="true">Yes</option><option value="false">No</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
        <select value={form.size} onChange={e => f('size', e.target.value as any)} className={selectCls}>
          <option value="">Unknown</option><option value="small">Small</option><option value="medium">Medium</option>
          <option value="large">Large</option><option value="huge">Huge</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
        <select value={form.type} onChange={e => f('type', e.target.value as any)} className={selectCls}>
          <option value="">Unknown</option><option value="grower">Grower</option><option value="shipper">Shipper</option>
          <option value="grower-shipper">Grower-Shipper</option><option value="distributor">Distributor</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
        <input value={form.website} onChange={e => f('website', e.target.value)} placeholder="https://example.com" className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Contact Name</label>
        <input value={form.contactName} onChange={e => f('contactName', e.target.value)} placeholder="Jane Smith" className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Contact Email</label>
        <input value={form.contactEmail} onChange={e => f('contactEmail', e.target.value)} placeholder="sales@example.com" className={inputCls} />
      </div>
      <div className="col-span-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
        <input value={form.notes} onChange={e => f('notes', e.target.value)} placeholder="Large shipper, PMA member…" className={inputCls} />
      </div>
    </div>
  )
}
