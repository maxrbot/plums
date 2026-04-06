'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import './manage.css'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

function authHeaders() {
  const t = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  return { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }
}

const SOURCE_LABELS: Record<string, { label: string; points: number }> = {
  paca:        { label: 'PACA license verified',        points: 5 },
  gfsi:        { label: 'GFSI food safety certification', points: 5 },
  usdaOrganic: { label: 'USDA Organic certification',   points: 5 },
  established: { label: 'Years in business verified',   points: 5 },
  drc:         { label: 'DRC membership',               points: 3 },
  website:     { label: 'Business website',             points: 2 },
}

type ClaimStep = 'idle' | 'detecting' | 'pick' | 'preview' | 'confirming' | 'pending' | 'done'

export default function ManagePage() {
  const router = useRouter()
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notificationsOn, setNotificationsOn] = useState(false)
  const [toggling, setToggling] = useState(false)

  // Claim flow
  const [claimStep, setClaimStep] = useState<ClaimStep>('idle')
  const [claimMatches, setClaimMatches] = useState<any[]>([])
  const [claimPreview, setClaimPreview] = useState<any>(null)
  const [claimError, setClaimError] = useState<string | null>(null)
  // Manual search fallback
  const [manualQuery, setManualQuery] = useState('')
  const [manualResults, setManualResults] = useState<any[]>([])
  const [manualSearching, setManualSearching] = useState(false)
  const manualDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) { router.replace('/login'); return }

    const savedPref = localStorage.getItem('ph_notifications')
    if (savedPref === 'true') setNotificationsOn(true)

    fetch(`${API}/directory/listing/me`, { headers: authHeaders() })
      .then(r => {
        if (r.status === 401) { router.replace('/login'); throw new Error('unauth') }
        return r.json()
      })
      .then(d => setListing(d.listing || null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  const handleStartClaim = async () => {
    setClaimError(null)
    setClaimStep('detecting')
    try {
      const res = await fetch(`${API}/directory/listing/lookup`, { headers: authHeaders() })
      const data = await res.json()
      if (data.alreadyClaimed) {
        // Refresh listing
        const me = await fetch(`${API}/directory/listing/me`, { headers: authHeaders() }).then(r => r.json())
        setListing(me.listing || null)
        setClaimStep('done')
        return
      }
      if (!data.matches || data.matches.length === 0) {
        setClaimStep('pick') // show manual search
        setClaimMatches([])
        return
      }
      if (data.matches.length === 1) {
        await loadPreview(data.matches[0].id)
      } else {
        setClaimMatches(data.matches)
        setClaimStep('pick')
      }
    } catch {
      setClaimError('Something went wrong. Please try again.')
      setClaimStep('idle')
    }
  }

  const loadPreview = async (id: string) => {
    setClaimStep('detecting')
    try {
      const res = await fetch(`${API}/directory/listing/preview/${id}`, { headers: authHeaders() })
      const data = await res.json()
      if (!res.ok) { setClaimError(data.error); setClaimStep('idle'); return }
      setClaimPreview({ ...data, selectedId: id })
      setClaimStep('preview')
    } catch {
      setClaimError('Failed to load listing preview.')
      setClaimStep('idle')
    }
  }

  const handleConfirmClaim = async () => {
    if (!claimPreview) return
    setClaimStep('confirming')
    try {
      const dir = claimPreview.directoryData
      const al = claimPreview.acrelistData
      const body = {
        directoryId: claimPreview.selectedId,
        companyName: dir.companyName || al.companyName,
        location: dir.location?.full ? dir.location : al.location,
        contact: {
          salesEmail: dir.contact?.salesEmail || al.contact?.salesEmail || '',
          phone: dir.contact?.phone || al.contact?.phone || '',
          website: dir.contact?.website || al.contact?.website || '',
        },
        certifications: dir.certifications?.length ? dir.certifications : (al.certifications || []),
      }
      const res = await fetch(`${API}/directory/listing/link`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setClaimError(data.error); setClaimStep('preview'); return }
      if (data.pending) {
        setClaimStep('pending')
        return
      }
      // Success — reload listing
      const me = await fetch(`${API}/directory/listing/me`, { headers: authHeaders() }).then(r => r.json())
      setListing(me.listing || null)
      setClaimStep('done')
    } catch {
      setClaimError('Something went wrong. Please try again.')
      setClaimStep('preview')
    }
  }

  // Manual company search (debounced)
  useEffect(() => {
    if (claimStep !== 'pick') return
    if (manualDebounce.current) clearTimeout(manualDebounce.current)
    if (manualQuery.trim().length < 2) { setManualResults([]); return }
    manualDebounce.current = setTimeout(async () => {
      setManualSearching(true)
      try {
        const res = await fetch(`${API}/public/company-lookup?q=${encodeURIComponent(manualQuery)}`)
        const data = await res.json()
        setManualResults(data.results || [])
      } catch { setManualResults([]) }
      finally { setManualSearching(false) }
    }, 350)
  }, [manualQuery, claimStep])

  const handleSignOut = () => {
    localStorage.removeItem('accessToken')
    router.replace('/login')
  }

  const handleToggleListed = async () => {
    if (!listing) return
    setToggling(true)
    try {
      if (listing.listed) {
        await fetch(`${API}/directory/listing`, { method: 'DELETE', headers: authHeaders() })
        setListing((l: any) => ({ ...l, listed: false }))
      } else {
        await fetch(`${API}/directory/listing/relist`, { method: 'POST', headers: authHeaders() })
        setListing((l: any) => ({ ...l, listed: true }))
      }
    } finally { setToggling(false) }
  }

  const handleToggleNotifications = () => {
    const next = !notificationsOn
    setNotificationsOn(next)
    localStorage.setItem('ph_notifications', String(next))
  }

  if (loading) {
    return (
      <div className="mg-loading">
        <div className="mg-spinner" />
      </div>
    )
  }

  const score = listing?.verificationScore
  const scorePercent = score ? Math.round((score.score / score.maxScore) * 100) : 0
  const products: string[] = listing?.products || []
  const dataSources = listing?.dataSources || {}

  const improvements = Object.entries(SOURCE_LABELS)
    .filter(([key]) => !dataSources[key]?.verified)
    .map(([, v]) => v)

  const searchTerms = [
    ...products.map(p => p.toLowerCase()),
    ...(listing?.certifications || []).some((c: string) => c.toLowerCase().includes('organic')) ? ['organic'] : []
  ]

  const claimedDate = listing?.claimedAt
    ? new Date(listing.claimedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  const PH_URL = process.env.NEXT_PUBLIC_PRODUCEHUNT_URL || 'http://localhost:3002'

  return (
    <div className="mg-page">

      {/* Nav */}
      <nav className="mg-nav">
        <div className="mg-nav-inner">
          <Link href="/" className="mg-nav-logo">ProduceHunt</Link>
          <div className="mg-nav-actions">
            {listing?.slug && (
              <Link href={`/supplier/${listing.slug}`} className="mg-nav-link" target="_blank">
                View your listing ↗
              </Link>
            )}
            <button onClick={handleSignOut} className="mg-nav-signout">Sign out</button>
          </div>
        </div>
      </nav>

      <div className="mg-body">

        {/* No listing — claim flow */}
        {!listing && claimStep !== 'done' && (
          <div className="mg-section">
            <p className="mg-section-label">Get listed</p>

            {/* Idle */}
            {claimStep === 'idle' && (
              <div className="mg-claim-idle">
                <p className="mg-claim-title">Claim your ProduceHunt listing</p>
                <p className="mg-claim-sub">
                  Your company is likely already in our directory from public records. Claiming it takes 30 seconds and puts you in control of what buyers see.
                </p>
                {claimError && <p className="mg-claim-error">{claimError}</p>}
                <button onClick={handleStartClaim} className="mg-cta-btn">
                  Find my listing
                </button>
              </div>
            )}

            {/* Detecting */}
            {claimStep === 'detecting' && (
              <div className="mg-claim-detecting">
                <div className="mg-spinner" style={{ width: 20, height: 20 }} />
                <p>Searching the directory…</p>
              </div>
            )}

            {/* Pick / manual search */}
            {claimStep === 'pick' && (
              <div className="mg-claim-pick">
                <p className="mg-claim-title">
                  {claimMatches.length > 0 ? 'We found a few matches' : 'Search for your company'}
                </p>
                <p className="mg-claim-sub">
                  {claimMatches.length > 0
                    ? 'Select the one that\'s yours, or search by name below.'
                    : 'We couldn\'t auto-detect your company. Search the directory to find and claim your listing.'}
                </p>

                {/* Auto-matched results */}
                {claimMatches.length > 0 && (
                  <div className="mg-match-list" style={{ marginBottom: 12 }}>
                    {claimMatches.map(m => (
                      <button key={m.id} className="mg-match-row" onClick={() => loadPreview(m.id)}>
                        <div>
                          <p className="mg-match-name">{m.companyName}</p>
                          <p className="mg-match-meta">{m.location?.full} · {(m.products || []).slice(0, 3).join(', ')}</p>
                        </div>
                        <span className="mg-match-arrow">→</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Manual search */}
                <div className="mg-manual-search">
                  <input
                    type="text"
                    placeholder="Search by company name…"
                    value={manualQuery}
                    onChange={e => setManualQuery(e.target.value)}
                    className="mg-manual-input"
                    autoFocus
                  />
                  {manualSearching && <p className="mg-manual-status">Searching…</p>}
                  {!manualSearching && manualQuery.length >= 2 && manualResults.length === 0 && (
                    <p className="mg-manual-status">No results found. <a href="mailto:hello@producehunt.com" className="mg-manual-link">Contact us to get listed.</a></p>
                  )}
                  {manualResults.length > 0 && (
                    <div className="mg-match-list">
                      {manualResults.map((m: any) => (
                        <button key={m.id} className="mg-match-row" onClick={() => loadPreview(m.id)}>
                          <div>
                            <p className="mg-match-name">{m.companyName}</p>
                            <p className="mg-match-meta">
                              {m.location} · {(m.products || []).slice(0, 3).join(', ')}
                              {m.claimed && <span className="mg-match-claimed"> · Already claimed</span>}
                            </p>
                          </div>
                          <span className="mg-match-arrow">{m.claimed ? '✓' : '→'}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preview */}
            {claimStep === 'preview' && claimPreview && (
              <div className="mg-claim-preview">
                <p className="mg-claim-title">Is this your listing?</p>
                <div className="mg-preview-card">
                  <p className="mg-preview-name">{claimPreview.directoryData.companyName}</p>
                  <p className="mg-preview-location">{claimPreview.directoryData.location?.full}</p>
                  {claimPreview.directoryData.products?.length > 0 && (
                    <div className="mg-preview-products">
                      {claimPreview.directoryData.products.slice(0, 5).map((p: any, i: number) => (
                        <span key={i} className="mg-product-chip">{p.commodity}</span>
                      ))}
                    </div>
                  )}
                  {claimPreview.directoryData.verificationScore && (
                    <p className="mg-preview-score">
                      Verification score: {claimPreview.directoryData.verificationScore.score}/{claimPreview.directoryData.verificationScore.maxScore}
                    </p>
                  )}
                </div>
                {claimError && <p className="mg-claim-error">{claimError}</p>}
                <div className="mg-preview-actions">
                  <button className="mg-back-btn" onClick={() => setClaimStep(claimMatches.length > 1 ? 'pick' : 'idle')}>
                    ← Back
                  </button>
                  <button className="mg-cta-btn" onClick={handleConfirmClaim}>
                    Yes, claim this listing
                  </button>
                </div>
              </div>
            )}

            {/* Confirming */}
            {claimStep === 'confirming' && (
              <div className="mg-claim-detecting">
                <div className="mg-spinner" style={{ width: 20, height: 20 }} />
                <p>Claiming your listing…</p>
              </div>
            )}

            {/* Pending review */}
            {claimStep === 'pending' && (
              <div className="mg-claim-pending">
                <p className="mg-claim-title">Your claim is under review</p>
                <p className="mg-claim-sub">
                  We couldn&apos;t automatically verify ownership via email domain. Our team will review and approve within 24 hours — we&apos;ll email you when it&apos;s live.
                </p>
              </div>
            )}
          </div>
        )}

        {listing && (
          <>
            {/* ── Section 1: Profile card ───────────────────────────── */}
            <section className="mg-section">
              <div className="mg-profile-header">
                <div className="mg-profile-header-left">
                  <div className="mg-listing-name-row">
                    <span className="mg-listing-name">{listing.companyName}</span>
                    <span className="mg-check">✓</span>
                    <span className={`mg-tier-badge ${listing.tier === 1 ? 'mg-tier-1' : 'mg-tier-2'}`}>
                      {listing.tier === 1 ? 'Live Pricing' : 'Verified Member'}
                    </span>
                  </div>
                  <p className="mg-listing-location">
                    📍 {listing.location?.full || [listing.location?.city, listing.location?.state].filter(Boolean).join(', ')}
                  </p>
                </div>
                <a
                  href={`/supplier/${listing.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mg-view-listing-link"
                >
                  View public listing ↗
                </a>
              </div>

              {/* Contact info row */}
              {(listing.contact?.website || listing.contact?.salesEmail || listing.contact?.phone) && (
                <div className="mg-contact-row">
                  {listing.contact.website && (
                    <a href={listing.contact.website} target="_blank" rel="noreferrer" className="mg-contact-item">
                      <span className="mg-contact-icon">🌐</span> {listing.contact.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  {listing.contact.salesEmail && (
                    <span className="mg-contact-item">
                      <span className="mg-contact-icon">✉️</span> {listing.contact.salesEmail}
                    </span>
                  )}
                  {listing.contact.phone && (
                    <span className="mg-contact-item">
                      <span className="mg-contact-icon">📞</span> {listing.contact.phone}
                    </span>
                  )}
                </div>
              )}

              {/* Products */}
              {products.length > 0 && (
                <div className="mg-listing-products">
                  {products.slice(0, 8).map((p: string) => (
                    <span key={p} className="mg-product-chip">{p}</span>
                  ))}
                </div>
              )}

              {/* Score bar */}
              {score && (
                <div className="mg-score-block">
                  <div className="mg-score-bar-row">
                    <div className="mg-score-bar">
                      <div className="mg-score-fill" style={{ width: `${scorePercent}%` }} />
                    </div>
                    <span className="mg-score-label">{score.score}/{score.maxScore} verification score</span>
                  </div>
                  <p className="mg-score-hint">
                    Higher scores rank you above other {products[0]?.toLowerCase() || 'produce'} suppliers in search results.
                  </p>
                </div>
              )}

              {/* Meta row: managed by + claimed date */}
              <div className="mg-meta-row">
                {listing.managedBy && (
                  <span className="mg-meta-item">Managed by <strong>{listing.managedBy}</strong></span>
                )}
                {claimedDate && (
                  <span className="mg-meta-item">Claimed {claimedDate}</span>
                )}
              </div>

              {/* Visibility toggle */}
              <div className="mg-visibility-row">
                <div>
                  <p className="mg-visibility-status">
                    <span className={`mg-dot ${listing.listed ? 'mg-dot-live' : 'mg-dot-off'}`} />
                    {listing.listed ? 'Listed in search' : 'Hidden from search'}
                  </p>
                  <p className="mg-visibility-hint">
                    {listing.listed
                      ? 'Buyers can find you. Toggle off to hide without losing your listing.'
                      : "You're claimed but hidden. Toggle on to reappear in search results."}
                  </p>
                </div>
                <button
                  onClick={handleToggleListed}
                  disabled={toggling}
                  className={`mg-toggle ${listing.listed ? 'mg-toggle-on' : ''}`}
                >
                  <span className={`mg-toggle-knob ${listing.listed ? 'mg-toggle-knob-on' : ''}`} />
                </button>
              </div>
            </section>

            {/* ── Section 2: What buyers find you for ──────────────── */}
            {searchTerms.length > 0 && (
              <section className="mg-section">
                <p className="mg-section-label">What buyers find you for</p>
                <div className="mg-search-terms">
                  {searchTerms.map(t => (
                    <span key={t} className="mg-search-term">{t}</span>
                  ))}
                </div>
                <p className="mg-search-terms-hint">
                  Buyers searching these terms on ProduceHunt will see your listing.
                  Add products in your profile to appear in more searches.
                </p>
              </section>
            )}

            {/* ── Section 3: Search insights ────────────────────────── */}
            <section className="mg-section">
              <p className="mg-section-label">Search insights</p>
              <div className="mg-insights-opt">
                <div className="mg-insights-opt-text">
                  <p className="mg-insights-title">Weekly search digest</p>
                  <p className="mg-insights-sub">
                    {notificationsOn
                      ? `We'll email ${listing.managedBy || 'you'} weekly with the searches you appeared in and how you ranked.`
                      : 'Get a weekly email showing which buyer searches you appeared in and your ranking position.'}
                  </p>
                </div>
                <button
                  onClick={handleToggleNotifications}
                  className={`mg-toggle ${notificationsOn ? 'mg-toggle-on' : ''}`}
                >
                  <span className={`mg-toggle-knob ${notificationsOn ? 'mg-toggle-knob-on' : ''}`} />
                </button>
              </div>
              {notificationsOn ? (
                <div className="mg-insights-preview">
                  <p className="mg-insights-preview-label">Digest enabled — tracking starts now.</p>
                  <p className="mg-insights-preview-sub">
                    You'll receive your first summary within a week. It will show search terms, your rank, and how many buyers saw your listing.
                  </p>
                </div>
              ) : (
                <div className="mg-insights-empty">
                  Enable the weekly digest to start tracking your search appearances.
                </div>
              )}
            </section>

            {/* ── Section 4: Improve your ranking ──────────────────── */}
            {improvements.length > 0 && (
              <section className="mg-section">
                <p className="mg-section-label">Improve your ranking</p>
                <p className="mg-improve-intro">
                  Your verification score determines where you appear relative to other suppliers.
                  These are missing from your profile:
                </p>
                <ul className="mg-improve-list">
                  {improvements.map((item, i) => (
                    <li key={i} className="mg-improve-item">
                      <span className="mg-improve-dot">○</span>
                      <span className="mg-improve-text">{item.label}</span>
                      <span className="mg-improve-pts">+{item.points} pts</span>
                    </li>
                  ))}
                </ul>
                <p className="mg-improve-note">
                  Most of this data is pulled from public records (PACA, USDA, DRC). If something is missing or wrong, <a href="mailto:hello@producehunt.com" className="mg-manual-link">contact us</a>.
                </p>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
