'use client'

import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import {
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
  TrashIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const PH_URL = process.env.NEXT_PUBLIC_PRODUCEHUNT_URL || 'http://localhost:3002'

function authHeaders() {
  const t = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  return { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' }
}

interface ClaimedBy {
  id: string
  email: string
  profile: { companyName: string; contactName: string }
  lastSeenAt?: string
}

interface DirectoryEntry {
  id: string
  slug: string
  companyName: string
  location: { city?: string; state?: string; full: string }
  products: string[]
  claimed: boolean
  listed: boolean
  acrelistUserId: string | null
  claimedBy: ClaimedBy | null
  verificationScore: { score: number; maxScore: number; percentage: number } | null
  certifications: string[]
  importSource: string | null
  createdAt: string
  updatedAt: string
}

export default function ProduceHuntDirectoryPage() {
  const { user } = useUser()
  const router = useRouter()

  const [entries, setEntries] = useState<DirectoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

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
          <button
            key={key}
            onClick={() => setClaimFilter(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              claimFilter === key ? active : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
            }`}
          >
            {label}
            <span className="ml-1.5 opacity-60">{counts[key]}</span>
          </button>
        ))}
      </div>

      {/* Search + state filter */}
      <div className="flex items-center gap-2 mb-5">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search listings…"
            className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 w-48"
          />
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
              {filtered.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-gray-900">{entry.companyName}</p>
                      {entry.claimed && (
                        <CheckBadgeIcon className="h-4 w-4 text-emerald-500 flex-shrink-0" title="Claimed" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">/{entry.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {entry.location.full || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {entry.products.slice(0, 4).map(p => (
                        <span key={p} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{p}</span>
                      ))}
                      {entry.products.length > 4 && (
                        <span className="text-xs text-gray-400">+{entry.products.length - 4}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {entry.verificationScore ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${entry.verificationScore.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{entry.verificationScore.score}/{entry.verificationScore.maxScore}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
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
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`${PH_URL}?q=${encodeURIComponent(entry.companyName)}`}
                        target="_blank"
                        rel="noreferrer"
                        title="View on ProduceHunt"
                        className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors"
                      >
                        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => handleDelete(entry.id, entry.companyName)}
                        disabled={deleting === entry.id}
                        title="Remove from directory"
                        className="p-1.5 text-gray-200 hover:text-red-400 disabled:opacity-50 transition-colors"
                      >
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
    </div>
  )
}
