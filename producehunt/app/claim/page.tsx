'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import './claim.css'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const ACRELIST = process.env.NEXT_PUBLIC_ACRELIST_URL || 'http://localhost:3000'

interface LookupResult {
  id: string
  slug: string
  companyName: string
  location: string
  products: string[]
  claimed: boolean
  verificationScore: { score: number; maxScore: number; percentage: number } | null
}

// Static before/after example data
const beforeCard = {
  companyName: 'Sundance Growers',
  location: 'Salinas, CA',
  products: ['Lemons', 'Limes', 'Avocados'],
  verificationScore: { score: 4, maxScore: 34 },
}

const afterCard = {
  companyName: 'Sundance Growers',
  location: 'Salinas, CA',
  products: ['Lemons', 'Limes', 'Avocados'],
  verificationScore: { score: 18, maxScore: 34 },
  pricing: [
    { pkg: '40lb Carton · Fancy', price: '$18.50/carton' },
    { pkg: '10kg Carton · #1', price: '$14.00/carton' },
  ],
}

export default function ClaimPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('company') || '')
  const [results, setResults] = useState<LookupResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      setSearched(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API}/public/company-lookup?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results || [])
        setSearched(true)
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 350)
  }, [query])

  return (
    <div className="claim-page">
      {/* Nav */}
      <nav className="claim-nav">
        <Link href="/" className="claim-nav-logo">🥬 ProduceHunt</Link>
        <a href={ACRELIST} className="claim-nav-signin">Sign in to AcreList →</a>
      </nav>

      {/* Hero */}
      <section className="claim-hero">
        <p className="claim-eyebrow">For suppliers & growers</p>
        <h1 className="claim-h1">Buyers are already finding you.<br />Take control of what they see.</h1>
        <p className="claim-sub">
          ProduceHunt pulls supplier data from public records. Hundreds of growers, shippers, and distributors are already listed — most don't know it. Claiming your listing is free and takes two minutes.
        </p>
        <button
          className="claim-hero-cta"
          onClick={() => searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
        >
          Find my listing ↓
        </button>
      </section>

      {/* Before / After */}
      <section className="claim-before-after">
        <h2 className="claim-section-title">What claiming changes</h2>
        <div className="ba-grid">
          {/* Before */}
          <div className="ba-card ba-before">
            <div className="ba-label ba-label-before">Before — Public record</div>
            <div className="ba-company">{beforeCard.companyName}</div>
            <div className="ba-location">📍 {beforeCard.location}</div>
            <div className="ba-products">
              {beforeCard.products.map(p => (
                <span key={p} className="ba-product-tag">{p}</span>
              ))}
            </div>
            <div className="ba-score-row">
              <div className="ba-score-bar">
                <div className="ba-score-fill" style={{ width: `${Math.round((beforeCard.verificationScore.score / beforeCard.verificationScore.maxScore) * 100)}%`, background: '#d1d5db' }} />
              </div>
              <span className="ba-score-text">{beforeCard.verificationScore.score}/{beforeCard.verificationScore.maxScore}</span>
            </div>
            <div className="ba-no-pricing">No pricing · No contact details</div>
          </div>

          <div className="ba-arrow">→</div>

          {/* After */}
          <div className="ba-card ba-after">
            <div className="ba-label ba-label-after">After — Verified Member ✓</div>
            <div className="ba-company-row">
              <span className="ba-company">{afterCard.companyName}</span>
              <span className="ba-verified-check">✓</span>
            </div>
            <div className="ba-location">📍 {afterCard.location}</div>
            <div className="ba-products">
              {afterCard.products.map(p => (
                <span key={p} className="ba-product-tag">{p}</span>
              ))}
            </div>
            <div className="ba-score-row">
              <div className="ba-score-bar">
                <div className="ba-score-fill" style={{ width: `${Math.round((afterCard.verificationScore.score / afterCard.verificationScore.maxScore) * 100)}%`, background: '#22c55e' }} />
              </div>
              <span className="ba-score-text">{afterCard.verificationScore.score}/{afterCard.verificationScore.maxScore}</span>
            </div>
            <div className="ba-pricing">
              {afterCard.pricing.map((row, i) => (
                <div key={i} className="ba-pricing-row">
                  <span className="ba-pricing-pkg">{row.pkg}</span>
                  <span className="ba-pricing-price">{row.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="claim-benefits">
        <div className="benefits-grid">
          {[
            { icon: '✏️', title: 'Control your listing', body: 'Update products, location, certifications, and contact info. Buyers see accurate, up-to-date data.' },
            { icon: '💰', title: 'Sync live pricing', body: 'Connect your AcreList account to push real-time pricing directly to your ProduceHunt profile.' },
            { icon: '🔓', title: 'Free to claim', body: 'No cost, no credit card. Claiming your listing is included with a free AcreList account.' },
          ].map(({ icon, title, body }) => (
            <div key={title} className="benefit-card">
              <span className="benefit-icon">{icon}</span>
              <h3 className="benefit-title">{title}</h3>
              <p className="benefit-body">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Find Your Company */}
      <section className="claim-find">
        <h2 className="claim-section-title">Find your listing</h2>
        <p className="claim-find-sub">Type your company name to see if you're already in the directory.</p>

        <div className="claim-search-wrap">
          <input
            ref={searchRef}
            type="text"
            className="claim-search-input"
            placeholder="e.g. Sunrise Farms, Pacific Citrus..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {loading && <span className="claim-search-spinner" />}
        </div>

        {/* Results */}
        {searched && (
          <div className="claim-results">
            {results.length === 0 ? (
              <div className="claim-not-found">
                <p className="claim-not-found-title">No listing found for "{query}"</p>
                <p className="claim-not-found-sub">You can still create an AcreList account and we'll get you set up.</p>
                <a href={`${ACRELIST}/register`} className="claim-result-cta">Create account →</a>
              </div>
            ) : (
              <div className="claim-results-list">
                {results.map(r => (
                  <div key={r.id} className="claim-result-row">
                    <div className="claim-result-info">
                      <div className="claim-result-name">
                        {r.companyName}
                        {r.claimed && <span className="claim-result-claimed-badge">Already claimed</span>}
                      </div>
                      <div className="claim-result-meta">
                        {r.location && <span>📍 {r.location}</span>}
                        {r.products.length > 0 && (
                          <span className="claim-result-products">
                            {r.products.slice(0, 3).join(' · ')}
                            {r.products.length > 3 && ` +${r.products.length - 3}`}
                          </span>
                        )}
                      </div>
                    </div>
                    {r.claimed ? (
                      <span className="claim-result-owned">✓ Owned</span>
                    ) : (
                      <a
                        href={`${ACRELIST}/register?claim=${r.slug}`}
                        className="claim-result-cta"
                      >
                        Claim this listing →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="claim-footer">
        <p>ProduceHunt is operated by <a href={ACRELIST} target="_blank" rel="noreferrer">AcreList</a> — agricultural price sheet and supplier tools for growers and shippers.</p>
      </footer>
    </div>
  )
}
