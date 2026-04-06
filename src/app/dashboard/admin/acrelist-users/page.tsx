'use client'

import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import { EyeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
function authHeaders() {
  const t = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  return { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' }
}

interface UserStats {
  _id: string
  id: string
  email: string
  subscriptionTier: string
  role?: 'owner' | 'member'
  orgId?: string
  profile: { companyName: string; contactName: string }
  createdAt: string
  cropCount: number
  contactCount: number
  shippingPointCount: number
  priceSheetCount: number
  emailsSentCount: number
  lastActivity: string
  lastSeenAt?: string
  phStatus: { claimed: boolean; listed: boolean } | null
}

function formatTimeAgo(d: string | undefined): string {
  if (!d) return 'Never'
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'Just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return new Date(d).toLocaleDateString()
}

function isOnline(lastSeenAt: string | undefined) {
  if (!lastSeenAt) return false
  return new Date(lastSeenAt) > new Date(Date.now() - 5 * 60 * 1000)
}

export default function AcreListUsersPage() {
  const { user } = useUser()
  const router = useRouter()
  const [users, setUsers] = useState<UserStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (user && user.subscriptionTier !== 'admin') router.push('/dashboard')
  }, [user, router])

  useEffect(() => {
    if (user?.subscriptionTier !== 'admin') return
    fetch(`${API}/admin/users`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setUsers(d.users || []))
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false))
  }, [user])

  const handleImpersonate = async (userId: string) => {
    try {
      const res = await fetch(`${API}/admin/impersonate/${userId}`, { method: 'POST', headers: authHeaders() })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      const t = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('isImpersonating', 'true')
      if (t) localStorage.setItem('adminToken', t)
      window.location.href = '/dashboard'
    } catch { alert('Failed to impersonate user') }
  }

  // Group by orgId: owner first, then members; ungrouped (admin/no org) at the end
  const grouped = useMemo(() => {
    const searchLower = search.toLowerCase()
    const allFiltered = users.filter(u =>
      !search ||
      u.email.toLowerCase().includes(searchLower) ||
      u.profile.companyName.toLowerCase().includes(searchLower) ||
      u.profile.contactName.toLowerCase().includes(searchLower)
    )

    // Build org groups
    const orgMap = new Map<string, UserStats[]>()
    const ungrouped: UserStats[] = []

    for (const u of allFiltered) {
      if (u.orgId) {
        const group = orgMap.get(u.orgId) || []
        group.push(u)
        orgMap.set(u.orgId, group)
      } else {
        ungrouped.push(u)
      }
    }

    // Sort within each group: owner first
    const groups: { orgId: string; members: UserStats[] }[] = []
    for (const [orgId, members] of orgMap) {
      members.sort((a, b) => {
        if (a.role === 'owner') return -1
        if (b.role === 'owner') return 1
        return 0
      })
      groups.push({ orgId, members })
    }

    // Sort groups: larger orgs first, then alphabetically
    groups.sort((a, b) => b.members.length - a.members.length || (a.members[0]?.profile.companyName || '').localeCompare(b.members[0]?.profile.companyName || ''))

    return { groups, ungrouped }
  }, [users, search])

  if (user?.subscriptionTier !== 'admin') return null

  return (
    <div>
      <div className="mb-6">
        <Breadcrumbs items={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'AcreList Users', current: true }]} />
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AcreList Users</h1>
            <p className="mt-1 text-sm text-gray-500">{users.filter(u => u.subscriptionTier !== 'admin').length} accounts across {[...new Set(users.map(u => u.orgId).filter(Boolean))].length} organizations</p>
          </div>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users…"
              className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 w-52"
            />
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['User', 'Company', 'Role', 'Tier', 'Catalog', 'Activity', 'ProduceHunt', 'Last Seen', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grouped.groups.map(({ orgId, members }) => {
                const orgName = members[0]?.profile.companyName || orgId
                const isMulti = members.length > 1
                return (
                  <>
                    {/* Org group header */}
                    <tr key={`header-${orgId}`} className="bg-gray-50 border-t border-gray-100">
                      <td colSpan={9} className="px-5 py-1.5">
                        <span className="text-xs text-gray-400 font-medium">{orgName}</span>
                        {isMulti && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-gray-200 text-gray-500">{members.length} users</span>
                        )}
                      </td>
                    </tr>
                    {/* Org members */}
                    {members.map((u, i) => (
                      <tr key={u._id} className={`hover:bg-gray-50 border-t border-gray-100 ${isMulti ? 'border-l-2 border-l-gray-200' : ''}`}>
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-gray-900">{u.profile.contactName || '—'}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-700">{u.profile.companyName || '—'}</td>
                        <UserRoleCell u={u} />
                        <TierCell u={u} />
                        <td className="px-5 py-3 text-xs text-gray-500">
                          {u.shippingPointCount} pts · {u.cropCount} crops · {u.contactCount} contacts
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-500">
                          <p>{u.priceSheetCount} sheets · {u.emailsSentCount} emails</p>
                          <p className="text-gray-400">
                            {u.lastActivity && new Date(u.lastActivity).getTime() > 0
                              ? new Date(u.lastActivity).toLocaleDateString() : 'No activity'}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <PhStatusCell u={u} />
                        </td>
                        <td className="px-5 py-3">
                          <LastSeenCell u={u} />
                        </td>
                        <td className="px-5 py-3 text-right">
                          <ImpersonateCell u={u} onImpersonate={handleImpersonate} />
                        </td>
                      </tr>
                    ))}
                  </>
                )
              })}

              {/* Ungrouped users (admin, no org) */}
              {grouped.ungrouped.length > 0 && (
                <>
                  <tr className="bg-gray-50 border-t border-gray-100">
                    <td colSpan={8} className="px-5 py-1.5">
                      <span className="text-xs text-gray-400 font-medium">No organization</span>
                    </td>
                  </tr>
                  {grouped.ungrouped.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50 border-t border-gray-100">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-gray-900">{u.profile.contactName || '—'}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-700">{u.profile.companyName || '—'}</td>
                      <UserRoleCell u={u} />
                      <TierCell u={u} />
                      <td className="px-5 py-3 text-xs text-gray-500">
                        {u.shippingPointCount} pts · {u.cropCount} crops · {u.contactCount} contacts
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">
                        <p>{u.priceSheetCount} sheets · {u.emailsSentCount} emails</p>
                        <p className="text-gray-400">
                          {u.lastActivity && new Date(u.lastActivity).getTime() > 0
                            ? new Date(u.lastActivity).toLocaleDateString() : 'No activity'}
                        </p>
                      </td>
                      <td className="px-5 py-3"><PhStatusCell u={u} /></td>
                      <td className="px-5 py-3"><LastSeenCell u={u} /></td>
                      <td className="px-5 py-3 text-right"><ImpersonateCell u={u} onImpersonate={handleImpersonate} /></td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function UserRoleCell({ u }: { u: UserStats }) {
  return (
    <td className="px-5 py-3">
      {u.subscriptionTier === 'admin' ? (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">Admin</span>
      ) : u.role === 'owner' ? (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700">Owner</span>
      ) : u.role === 'member' ? (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Member</span>
      ) : (
        <span className="text-xs text-gray-300">—</span>
      )}
    </td>
  )
}

function TierCell({ u }: { u: UserStats }) {
  return (
    <td className="px-5 py-3">
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
        u.subscriptionTier === 'enterprise' ? 'bg-purple-100 text-purple-700' :
        u.subscriptionTier === 'premium'    ? 'bg-blue-100 text-blue-700' :
        u.subscriptionTier === 'admin'      ? 'bg-red-100 text-red-700' :
        'bg-gray-100 text-gray-600'
      }`}>{u.subscriptionTier}</span>
    </td>
  )
}

function LastSeenCell({ u }: { u: UserStats }) {
  return isOnline(u.lastSeenAt) ? (
    <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Active now
    </span>
  ) : (
    <span className="text-xs text-gray-400">{formatTimeAgo(u.lastSeenAt)}</span>
  )
}

function PhStatusCell({ u }: { u: UserStats }) {
  if (!u.phStatus) return <td className="px-5 py-3"><span className="text-xs text-gray-300">—</span></td>
  if (u.phStatus.listed) {
    return (
      <td className="px-5 py-3">
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700">Listed</span>
      </td>
    )
  }
  return (
    <td className="px-5 py-3">
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">Delisted</span>
    </td>
  )
}

function ImpersonateCell({ u, onImpersonate }: { u: UserStats; onImpersonate: (id: string) => void }) {
  if (u.subscriptionTier === 'admin') return <span className="text-xs text-gray-300 italic">Admin</span>
  return (
    <button
      onClick={() => onImpersonate(u._id)}
      className="inline-flex items-center gap-1 px-2.5 py-1 border border-gray-200 text-xs font-medium rounded-md text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
    >
      <EyeIcon className="h-3.5 w-3.5" />
      View as
    </button>
  )
}
