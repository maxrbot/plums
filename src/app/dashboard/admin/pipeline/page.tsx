'use client'

import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import {
  PlusIcon,
  ArrowUpCircleIcon,
  CheckCircleIcon,
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
function authHeaders() {
  const t = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  return { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' }
}

interface PipelineEntry {
  _id: string
  companyName: string
  location: { city?: string; state?: string; full: string }
  commodities: string[]
  organic: boolean | null
  size?: 'small' | 'medium' | 'large' | 'huge'
  type?: 'grower' | 'shipper' | 'grower-shipper' | 'distributor'
  website?: string
  contactEmail?: string
  contactName?: string
  notes?: string
  status: 'pending' | 'pushed' | 'claimed'
  pushedAt?: string
  supplierDirectoryId?: string
  outreachSent?: boolean
  createdAt: string
}

const SIZE_STYLES: Record<string, string> = {
  small:  'bg-gray-100 text-gray-600',
  medium: 'bg-amber-50 text-amber-700',
  large:  'bg-blue-50 text-blue-700',
  huge:   'bg-purple-50 text-purple-700',
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  pushed:  'bg-blue-50 text-blue-700',
  claimed: 'bg-emerald-50 text-emerald-700',
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

  // Claim requests
  const [claimRequests, setClaimRequests] = useState<any[]>([])
  const [reviewingClaim, setReviewingClaim] = useState<string | null>(null)

  // Add form
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(emptyForm())

  // Actions
  const [pushing, setPushing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'pushed' | 'claimed'>('all')
  const [search, setSearch] = useState('')
  const [filterState, setFilterState] = useState('')
  const [filterCommodity, setFilterCommodity] = useState('')
  const [filterSize, setFilterSize] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterOutreach, setFilterOutreach] = useState('')

  useEffect(() => {
    if (user && user.subscriptionTier !== 'admin') router.push('/dashboard')
  }, [user, router])

  useEffect(() => {
    if (user?.subscriptionTier !== 'admin') return
    Promise.all([
      fetch(`${API}/admin/directory-pipeline`, { headers: authHeaders() }).then(r => r.json()),
      fetch(`${API}/admin/claim-requests`, { headers: authHeaders() }).then(r => r.json()),
    ]).then(([pipeline, claims]) => {
      setPipeline(pipeline.entries || [])
      setClaimRequests(claims.requests || [])
    }).catch(() => setError('Failed to load pipeline'))
      .finally(() => setLoading(false))
  }, [user])

  const handleApproveClaim = async (id: string) => {
    setReviewingClaim(id)
    try {
      await fetch(`${API}/admin/claim-requests/${id}/approve`, { method: 'POST', headers: authHeaders() })
      setClaimRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r))
      setPipeline(prev => {
        const req = claimRequests.find(r => r.id === id)
        if (!req) return prev
        return prev.map(e => e.supplierDirectoryId === req.directoryEntryId ? { ...e, status: 'claimed' } : e)
      })
    } catch { alert('Failed to approve') }
    finally { setReviewingClaim(null) }
  }

  const handleDenyClaim = async (id: string) => {
    setReviewingClaim(id)
    try {
      await fetch(`${API}/admin/claim-requests/${id}/deny`, { method: 'POST', headers: authHeaders() })
      setClaimRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'denied' } : r))
    } catch { alert('Failed to deny') }
    finally { setReviewingClaim(null) }
  }

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
      if (statusFilter !== 'all' && e.status !== statusFilter) return false
      if (search && !e.companyName.toLowerCase().includes(search.toLowerCase())) return false
      if (filterState && e.location.state !== filterState) return false
      if (filterCommodity && !e.commodities.includes(filterCommodity)) return false
      if (filterSize && e.size !== filterSize) return false
      if (filterType && e.type !== filterType) return false
      if (filterOutreach === 'sent' && !e.outreachSent) return false
      if (filterOutreach === 'unsent' && e.outreachSent) return false
      return true
    })
  }, [pipeline, statusFilter, search, filterState, filterCommodity, filterSize, filterType, filterOutreach])

  const counts = useMemo(() => ({
    all: pipeline.length,
    pending: pipeline.filter(e => e.status === 'pending').length,
    pushed: pipeline.filter(e => e.status === 'pushed').length,
    claimed: pipeline.filter(e => e.status === 'claimed').length,
  }), [pipeline])

  const hasActiveFilters = search || filterState || filterCommodity || filterSize || filterType || filterOutreach

  function clearFilters() {
    setSearch('')
    setFilterState('')
    setFilterCommodity('')
    setFilterSize('')
    setFilterType('')
    setFilterOutreach('')
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

  const startEdit = (entry: PipelineEntry) => {
    setEditingId(entry._id)
    setEditForm({
      companyName: entry.companyName,
      city: entry.location.city || '',
      state: entry.location.state || '',
      commodities: entry.commodities.join(', '),
      organic: entry.organic === true ? 'true' : entry.organic === false ? 'false' : '',
      size: entry.size || '',
      type: entry.type || '',
      website: entry.website || '',
      contactEmail: entry.contactEmail || '',
      contactName: entry.contactName || '',
      notes: entry.notes || '',
    })
  }

  const handleUpdate = async (id: string) => {
    setSaving(true)
    try {
      await fetch(`${API}/admin/directory-pipeline/${id}`, {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify(parseForm(editForm))
      })
      const parsed = parseForm(editForm)
      setPipeline(prev => prev.map(e => e._id === id ? { ...e, ...parsed } : e))
      setEditingId(null)
    } catch { alert('Failed to update') }
    finally { setSaving(false) }
  }

  const handlePush = async (id: string) => {
    setPushing(id)
    try {
      const res = await fetch(`${API}/admin/directory-pipeline/${id}/push`, {
        method: 'POST', headers: authHeaders()
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      const data = await res.json()
      setPipeline(prev => prev.map(e => e._id === id
        ? { ...e, status: 'pushed', supplierDirectoryId: data.supplierDirectoryId, pushedAt: new Date().toISOString() }
        : e
      ))
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed to push') }
    finally { setPushing(null) }
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
          <button
            onClick={() => setShowAddForm(v => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Add Company
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

      {/* Pending claim requests */}
      {claimRequests.filter(r => r.status === 'pending').length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-200 flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Pending Claims</span>
            <span className="px-1.5 py-0.5 bg-amber-200 text-amber-800 text-xs rounded-full font-medium">
              {claimRequests.filter(r => r.status === 'pending').length}
            </span>
          </div>
          <div className="divide-y divide-amber-100">
            {claimRequests.filter(r => r.status === 'pending').map(r => (
              <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{r.companyName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {r.userEmail}
                    {r.emailDomain && r.websiteDomain && (
                      <span className="ml-2 text-amber-700">
                        @{r.emailDomain} vs {r.websiteDomain}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApproveClaim(r.id)}
                    disabled={reviewingClaim === r.id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleDenyClaim(r.id)}
                    disabled={reviewingClaim === r.id}
                    className="inline-flex items-center gap-1 px-3 py-1 border border-red-200 text-red-600 text-xs font-medium rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    <XCircleIcon className="h-3.5 w-3.5" />
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
        {(['all', 'pending', 'pushed', 'claimed'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s
                ? s === 'pending' ? 'bg-amber-100 text-amber-800'
                : s === 'pushed'  ? 'bg-blue-100 text-blue-800'
                : s === 'claimed' ? 'bg-emerald-100 text-emerald-800'
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
        <select value={filterOutreach} onChange={e => setFilterOutreach(e.target.value)}
          className="px-2.5 py-1.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-600">
          <option value="">Outreach: all</option>
          <option value="sent">Outreach sent</option>
          <option value="unsent">Not contacted</option>
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
                {['Company', 'Location', 'Commodities', 'Org', 'Size', 'Type', 'Status', 'Outreach', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(entry =>
                editingId === entry._id ? (
                  <tr key={entry._id} className="bg-amber-50">
                    <td colSpan={9} className="px-4 py-4">
                      <PipelineForm form={editForm} onChange={setEditForm} />
                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => handleUpdate(entry._id)} disabled={saving}
                          className="px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-md hover:bg-black disabled:opacity-50">
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{entry.companyName}</p>
                      {entry.website && (
                        <a href={entry.website} target="_blank" rel="noreferrer"
                          className="text-xs text-blue-500 hover:underline">
                          {entry.website.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{entry.location.full || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {entry.commodities.map(c => (
                          <span key={c} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{c}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {entry.organic === true
                        ? <span className="text-emerald-600 font-medium">Org</span>
                        : entry.organic === false
                        ? <span className="text-gray-400">Conv</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {entry.size
                        ? <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${SIZE_STYLES[entry.size]}`}>{entry.size}</span>
                        : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{entry.type || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[entry.status]}`}>
                        {entry.status}
                      </span>
                      {entry.pushedAt && (
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(entry.pushedAt).toLocaleDateString()}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {entry.outreachSent
                        ? <span className="text-xs text-emerald-600 font-medium">Sent</span>
                        : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {entry.status === 'pending' && (
                          <button onClick={() => handlePush(entry._id)} disabled={pushing === entry._id}
                            title="Push to ProduceHunt"
                            className="p-1.5 text-blue-400 hover:text-blue-600 disabled:opacity-50 transition-colors">
                            <ArrowUpCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        {entry.status === 'pushed'  && <CheckCircleIcon className="h-4 w-4 text-blue-300 mx-1.5" />}
                        {entry.status === 'claimed' && <CheckCircleIcon className="h-4 w-4 text-emerald-400 mx-1.5" />}
                        <button onClick={() => startEdit(entry)}
                          className="p-1.5 text-gray-300 hover:text-gray-600 transition-colors">
                          <PencilIcon className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(entry._id)} disabled={deleting === entry._id}
                          className="p-1.5 text-gray-200 hover:text-red-400 disabled:opacity-50 transition-colors">
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
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
