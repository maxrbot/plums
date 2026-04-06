'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  UsersIcon,
  BuildingStorefrontIcon,
  QueueListIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
function authHeaders() {
  const t = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  return { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' }
}

interface Summary {
  acrelist: {
    totalUsers: number
    activeToday: number
    activeThisWeek: number
    newUsersThisWeek: number
    totalOrgs: number
    totalPriceSheets: number
    totalEmailsSent: number
    totalContacts: number
  }
  producehunt: {
    directoryTotal: number
    directoryClaimed: number
    directoryUnclaimed: number
    pipelinePending: number
    pipelinePushed: number
    pipelineClaimed: number
  }
  recentSignups: Array<{
    _id: string
    email: string
    role?: string
    profile: { companyName: string; contactName: string }
    createdAt: string
  }>
}

function formatTimeAgo(d: string): string {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'Just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return new Date(d).toLocaleDateString()
}

export default function AdminOverviewPage() {
  const { user } = useUser()
  const router = useRouter()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.subscriptionTier !== 'admin') router.push('/dashboard')
  }, [user, router])

  useEffect(() => {
    if (user?.subscriptionTier !== 'admin') return
    fetch(`${API}/admin/summary`, { headers: authHeaders() })
      .then(r => r.json())
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  if (user?.subscriptionTier !== 'admin') return null

  const al = summary?.acrelist
  const ph = summary?.producehunt

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Platform-wide health across AcreList and ProduceHunt.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
        </div>
      ) : (
        <div className="space-y-8">

          {/* ── AcreList ────────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-gray-400" />
                AcreList
              </h2>
              <Link href="/dashboard/admin/acrelist-users"
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                View all users <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <StatCard label="Total Users" value={al?.totalUsers ?? '—'} sub={`${al?.newUsersThisWeek ?? 0} new this week`} accent="gray" />
              <StatCard label="Active Today" value={al?.activeToday ?? '—'} sub={`${al?.activeThisWeek ?? 0} this week`} accent="emerald" />
              <StatCard label="Organizations" value={al?.totalOrgs ?? '—'} sub="active accounts" accent="gray" />
              <StatCard label="Emails Sent" value={al?.totalEmailsSent ?? '—'} sub={`across ${al?.totalPriceSheets ?? 0} price sheets`} accent="gray" />
            </div>
          </div>

          {/* ── ProduceHunt ─────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <BuildingStorefrontIcon className="h-4 w-4 text-gray-400" />
                ProduceHunt
              </h2>
              <div className="flex items-center gap-3">
                <Link href="/dashboard/admin/pipeline"
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  Pipeline <ArrowRightIcon className="h-3 w-3" />
                </Link>
                <Link href="/dashboard/admin/directory"
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  Directory <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Directory card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Directory</p>
                <div className="flex items-end gap-6">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{ph?.directoryTotal ?? '—'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">total listings</p>
                  </div>
                  <div className="flex-1 space-y-1.5 pb-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Claimed</span>
                      <span className="font-medium text-emerald-600">{ph?.directoryClaimed ?? 0}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all"
                        style={{ width: ph?.directoryTotal ? `${(ph.directoryClaimed / ph.directoryTotal) * 100}%` : '0%' }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Unclaimed</span>
                      <span className="text-gray-400">{ph?.directoryUnclaimed ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pipeline card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Pipeline</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Pending', value: ph?.pipelinePending ?? 0, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Pushed', value: ph?.pipelinePushed ?? 0, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Claimed', value: ph?.pipelineClaimed ?? 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} className={`${bg} rounded-lg p-3 text-center`}>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Recent Signups ──────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Recent Signups</h2>
              <Link href="/dashboard/admin/acrelist-users"
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                All users <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
              {(summary?.recentSignups || []).map(u => (
                <div key={u._id} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 flex-shrink-0">
                    {(u.profile.contactName || u.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {u.profile.contactName || u.email}
                      {u.profile.companyName && <span className="text-gray-400 font-normal"> · {u.profile.companyName}</span>}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {u.role === 'owner' ? (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700">Owner</span>
                    ) : u.role === 'member' ? (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Member</span>
                    ) : null}
                    <span className="text-xs text-gray-400">{formatTimeAgo(u.createdAt)}</span>
                  </div>
                </div>
              ))}
              {!summary?.recentSignups?.length && (
                <p className="px-4 py-6 text-sm text-gray-400 text-center">No signups yet.</p>
              )}
            </div>
          </div>

          {/* ── Quick Links ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'AcreList Users', href: '/dashboard/admin/acrelist-users', icon: UsersIcon, desc: 'Manage accounts, impersonate' },
              { label: 'Directory Pipeline', href: '/dashboard/admin/pipeline', icon: QueueListIcon, desc: 'Curate & push to ProduceHunt' },
              { label: 'ProduceHunt Directory', href: '/dashboard/admin/directory', icon: BuildingStorefrontIcon, desc: 'Monitor live listings' },
            ].map(({ label, href, icon: Icon, desc }) => (
              <Link key={href} href={href}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors group">
                <Icon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 mb-2 transition-colors" />
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </Link>
            ))}
          </div>

        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, accent }: { label: string; value: number | string; sub: string; accent: 'gray' | 'emerald' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent === 'emerald' ? 'text-emerald-600' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}
