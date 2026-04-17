'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
function authHeaders() {
  const t = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  return { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' }
}

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  denied:   'bg-red-50 text-red-500',
}

export default function ClaimRequestsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<string | null>(null)

  useEffect(() => {
    if (user && user.subscriptionTier !== 'admin') router.push('/dashboard')
  }, [user, router])

  useEffect(() => {
    if (user?.subscriptionTier !== 'admin') return
    fetch(`${API}/admin/claim-requests`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setClaims(d.requests || []))
      .finally(() => setLoading(false))
  }, [user])

  const handleApprove = async (id: string) => {
    setReviewing(id)
    try {
      await fetch(`${API}/admin/claim-requests/${id}/approve`, { method: 'POST', headers: authHeaders(), body: '{}' })
      setClaims(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r))
    } catch { alert('Failed to approve') }
    finally { setReviewing(null) }
  }

  const handleDeny = async (id: string) => {
    setReviewing(id)
    try {
      await fetch(`${API}/admin/claim-requests/${id}/deny`, { method: 'POST', headers: authHeaders(), body: '{}' })
      setClaims(prev => prev.map(r => r.id === id ? { ...r, status: 'denied' } : r))
    } catch { alert('Failed to deny') }
    finally { setReviewing(null) }
  }

  if (user?.subscriptionTier !== 'admin') return null

  const pending = claims.filter(r => r.status === 'pending')
  const resolved = claims.filter(r => r.status !== 'pending')

  return (
    <div>
      <div className="mb-6">
        <Breadcrumbs items={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'Claim Requests', current: true }]} />
        <div className="mt-2">
          <h1 className="text-2xl font-bold text-gray-900">Claim Requests</h1>
          <p className="mt-1 text-sm text-gray-500">Suppliers requesting to claim their ProduceHunt directory listing.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
        </div>
      ) : claims.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No claim requests yet.</div>
      ) : (
        <div className="space-y-6">
          {/* Pending */}
          {pending.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</span>
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">{pending.length}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {pending.map(r => (
                  <div key={r.id} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{r.companyName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{r.userEmail}</p>
                      {r.emailDomain && r.websiteDomain && (
                        <p className="text-xs text-amber-600 mt-0.5">
                          @{r.emailDomain} vs {r.websiteDomain}
                        </p>
                      )}
                      {r.requestedAt && (
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(r.requestedAt).toLocaleDateString()}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(r.id)}
                        disabled={reviewing === r.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleDeny(r.id)}
                        disabled={reviewing === r.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 text-xs font-medium rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
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

          {/* Resolved */}
          {resolved.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resolved</span>
              </div>
              <div className="divide-y divide-gray-100">
                {resolved.map(r => (
                  <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{r.companyName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.userEmail}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-500'}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
