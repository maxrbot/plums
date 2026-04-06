'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import {
  CheckCircleIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  EyeSlashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const PH_URL = process.env.NEXT_PUBLIC_PRODUCEHUNT_URL || 'http://localhost:3002'

function authHeaders() {
  const t = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  return { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }
}

interface Listing {
  id: string
  slug: string
  companyName: string
  location: { city?: string; state?: string; full: string }
  products: string[]
  claimed: boolean
  listed: boolean
  verificationScore: { score: number; maxScore: number; percentage: number } | null
  certifications: string[]
  contact: { salesEmail?: string; phone?: string; website?: string }
  dataSources: Record<string, { verified: boolean; score?: number }>
  tier: 1 | 2
  searchableSheets: number
}

interface PendingClaim {
  id: string
  status: string
  createdAt: string
  emailDomain: string | null
  websiteDomain: string | null
}

const DATA_SOURCE_LABELS: Record<string, { label: string; maxScore: number; tip: string }> = {
  paca:        { label: 'PACA License',       maxScore: 5,  tip: 'Verified by USDA PACA records' },
  gfsi:        { label: 'GFSI Certification', maxScore: 5,  tip: 'Global food safety certification' },
  established: { label: 'Years in Business',  maxScore: 5,  tip: 'Length of business operation' },
  usdaOrganic: { label: 'USDA Organic',       maxScore: 5,  tip: 'USDA National Organic Program' },
  drc:         { label: 'DRC Membership',     maxScore: 3,  tip: 'Dispute Resolution Corporation' },
  website:     { label: 'Website',            maxScore: 2,  tip: 'Verified business website' },
  acrelist:    { label: 'AcreList Member',    maxScore: 2,  tip: 'Claimed & connected AcreList account' },
}

export default function ProduceHuntPage() {
  const { user } = useUser()
  const [listing, setListing] = useState<Listing | null>(null)
  const [pendingClaim, setPendingClaim] = useState<PendingClaim | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetch(`${API}/directory/listing/me`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => {
        setListing(d.listing || null)
        setPendingClaim(d.pendingClaim || null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleToggleListed = async () => {
    if (!listing) return
    setToggling(true)
    try {
      if (listing.listed) {
        await fetch(`${API}/directory/listing`, { method: 'DELETE', headers: authHeaders() })
        setListing(l => l ? { ...l, listed: false } : l)
      } else {
        await fetch(`${API}/directory/listing/relist`, { method: 'POST', headers: authHeaders() })
        setListing(l => l ? { ...l, listed: true } : l)
      }
    } finally { setToggling(false) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
      </div>
    )
  }

  // ── Not joined ──────────────────────────────────────────────────────────────
  if (!listing && !pendingClaim) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-gray-900">ProduceHunt Presence</h1>
        <p className="mt-2 text-sm text-gray-500">You're not yet listed on ProduceHunt. Claim your listing to start appearing in buyer searches.</p>
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-700 mb-4">Claiming your listing lets you:</p>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            <li className="flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-emerald-500" /> Control what buyers see about your company</li>
            <li className="flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-emerald-500" /> Sync live pricing from your price sheets</li>
            <li className="flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-emerald-500" /> Appear higher in search results</li>
          </ul>
          <a
            href={`${PH_URL}/claim`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Find my listing on ProduceHunt
            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    )
  }

  // ── Pending claim ───────────────────────────────────────────────────────────
  if (pendingClaim && !listing) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-gray-900">ProduceHunt Presence</h1>
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-5 flex gap-3">
          <ClockIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">Claim under review</p>
            <p className="text-sm text-amber-700 mt-1">
              We couldn't automatically verify your ownership via email domain
              {pendingClaim.emailDomain && pendingClaim.websiteDomain
                ? ` (your email is @${pendingClaim.emailDomain}, listing website is ${pendingClaim.websiteDomain})`
                : ''}.
              Our team will review and approve within 24 hours.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!listing) return null

  const scorePercent = listing.verificationScore
    ? Math.round((listing.verificationScore.score / listing.verificationScore.maxScore) * 100)
    : 0

  // Derive search terms from products
  const searchTerms = listing.products.map(p => p.toLowerCase())
  if (listing.certifications.some(c => c.toLowerCase().includes('organic'))) {
    searchTerms.push('organic')
  }

  // Upgrade suggestions
  const upgrades: string[] = []
  if (listing.tier === 2) upgrades.push('Add a searchable price sheet to appear as Tier 1 with live pricing')
  if (!listing.dataSources.paca?.verified) upgrades.push('Add your PACA license number for +5 verification points')
  if (!listing.dataSources.usdaOrganic?.verified && listing.certifications.some(c => c.toLowerCase().includes('organic')))
    upgrades.push('Verify USDA Organic certification for +5 verification points')
  if (!listing.dataSources.gfsi?.verified) upgrades.push('Add GFSI food safety certification for +5 points')
  if (!listing.contact.website) upgrades.push('Add your website URL for +2 points')

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ProduceHunt Presence</h1>
          <p className="mt-1 text-sm text-gray-500">How buyers find you — and how to rank higher.</p>
        </div>
        <a
          href={`${PH_URL}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          View on ProduceHunt <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: listing preview */}
        <div className="col-span-2 space-y-6">

          {/* Current tier */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Your search tier</p>
            <div className="flex items-center gap-3 mb-4">
              {listing.tier === 1 ? (
                <span className="px-2.5 py-1 text-sm font-semibold rounded-full bg-emerald-100 text-emerald-800">Tier 1 — Live Pricing</span>
              ) : (
                <span className="px-2.5 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">Tier 2 — Verified Member</span>
              )}
              <span className={`w-2 h-2 rounded-full ${listing.listed ? 'bg-emerald-400' : 'bg-gray-300'}`} />
              <span className="text-xs text-gray-500">{listing.listed ? 'Listed in search' : 'Not visible to buyers'}</span>
            </div>
            <p className="text-sm text-gray-600">
              {listing.tier === 1
                ? `You appear first in results for buyers searching ${searchTerms.slice(0, 3).join(', ')}. Live pricing from your price sheets is shown directly on your card.`
                : `You appear above unclaimed suppliers for ${searchTerms.slice(0, 3).join(', ')} searches. Add a searchable price sheet to move to Tier 1.`
              }
            </p>
          </div>

          {/* Listing preview (as buyers see it) */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Your listing — as buyers see it</p>
            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-gray-900">{listing.companyName}</h3>
                    <span className="text-xs font-bold text-emerald-500">✓</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">📍 {listing.location.full || `${listing.location.city}, ${listing.location.state}`}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${listing.tier === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  {listing.tier === 1 ? 'Live Pricing' : 'Verified Member'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {listing.products.slice(0, 5).map(p => (
                  <span key={p} className="px-1.5 py-0.5 bg-white border border-gray-200 text-gray-600 text-xs rounded">{p}</span>
                ))}
              </div>
              {listing.verificationScore && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${scorePercent}%` }} />
                  </div>
                  <span className="text-xs text-gray-400">{listing.verificationScore.score}/{listing.verificationScore.maxScore}</span>
                </div>
              )}
              {listing.tier === 2 && (
                <p className="mt-3 text-xs text-gray-400 italic">+ Add a searchable price sheet to show live pricing here</p>
              )}
            </div>
          </div>

          {/* Search terms */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Search terms you appear for</p>
            <div className="flex flex-wrap gap-2">
              {searchTerms.map(t => (
                <span key={t} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{t}</span>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-400">Based on your synced crops and certifications. Add more crops in your <a href="/dashboard/catalog" className="underline hover:text-gray-600">Catalog</a> to appear in more searches.</p>
          </div>

          {/* Upgrade suggestions */}
          {upgrades.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Improve your ranking</p>
              <ul className="space-y-2.5">
                {upgrades.map((u, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-0.5 text-amber-400 flex-shrink-0">○</span>
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right: score + controls */}
        <div className="space-y-4">

          {/* Verification score */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Verification score</p>
            {listing.verificationScore ? (
              <>
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-3xl font-bold text-gray-900">{listing.verificationScore.score}</span>
                  <span className="text-sm text-gray-400 mb-1">/ {listing.verificationScore.maxScore}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${scorePercent}%` }} />
                </div>
                <div className="space-y-2">
                  {Object.entries(DATA_SOURCE_LABELS).map(([key, { label, maxScore }]) => {
                    const src = listing.dataSources[key]
                    const verified = src?.verified
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className={`text-xs ${verified ? 'text-gray-700' : 'text-gray-300'}`}>{label}</span>
                        <span className={`text-xs font-medium ${verified ? 'text-emerald-600' : 'text-gray-200'}`}>
                          {verified ? `+${src?.score ?? maxScore}` : `+${maxScore}`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400">Score not yet calculated</p>
            )}
          </div>

          {/* Listed toggle */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Search visibility</p>
            <div className="flex items-center justify-between mb-3">
              <span className={`flex items-center gap-1.5 text-sm font-medium ${listing.listed ? 'text-emerald-700' : 'text-gray-400'}`}>
                {listing.listed ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
                {listing.listed ? 'Listed' : 'Delisted'}
              </span>
              <button
                onClick={handleToggleListed}
                disabled={toggling}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${listing.listed ? 'bg-emerald-500' : 'bg-gray-200'} disabled:opacity-50`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${listing.listed ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>
            <p className="text-xs text-gray-400">
              {listing.listed
                ? 'Your listing is visible to buyers searching ProduceHunt. Toggle off to hide without losing your claim.'
                : 'Your listing is hidden from search. Toggle on to re-appear in buyer results.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
