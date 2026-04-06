'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import './supplier.css'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const ACRELIST = process.env.NEXT_PUBLIC_ACRELIST_URL || 'http://localhost:3000'

interface SupplierProfile {
  id: string
  slug: string
  companyName: string
  claimed: boolean
  listed: boolean
  location: { city?: string; state?: string; full: string }
  contact: { email?: string; salesEmail?: string; phone?: string; website?: string }
  products: Array<{
    commodity: string
    varieties: string[]
    isOrganic: boolean
    seasonality: { type: string; description: string } | string
  }>
  certifications: string[]
  description?: string
  dataSources?: {
    paca?: { verified: boolean; licenseNumber?: string; score?: number }
    gfsi?: { verified: boolean; certificationType?: string; score?: number }
    established?: { verified: boolean; yearEstablished?: number; yearsInBusiness?: number; score?: number }
    usdaOrganic?: { verified: boolean; certifier?: string; score?: number }
    drc?: { verified: boolean; memberSince?: string; score?: number }
    website?: { verified: boolean; score?: number }
    acrelist?: { verified: boolean; score?: number }
  }
  verificationScore?: { score: number; maxScore: number; percentage: number }
}

export default function SupplierPage() {
  const params = useParams()
  const slug = params.slug as string

  const [profile, setProfile] = useState<SupplierProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetch(`${API}/public/suppliers/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.supplier) setProfile(d.supplier)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="sp-loading">
        <div className="sp-spinner" />
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="sp-not-found">
        <p className="sp-not-found-title">Supplier not found</p>
        <Link href="/" className="sp-back-link">← Back to search</Link>
      </div>
    )
  }

  const contactEmail = profile.contact?.salesEmail || profile.contact?.email
  const scorePercent = profile.verificationScore?.percentage || 0
  const organicCertified = profile.dataSources?.usdaOrganic?.verified ||
    profile.certifications.some(c => c.toLowerCase().includes('organic'))

  return (
    <div className="sp-page">

      {/* Nav */}
      <nav className="sp-nav">
        <div className="sp-nav-inner">
          <Link href="/" className="sp-nav-logo">ProduceHunt</Link>
          <Link href="/" className="sp-nav-back">← Back to search</Link>
        </div>
      </nav>

      {/* Claim banner — unclaimed only */}
      {!profile.claimed && (
        <div className="sp-claim-banner">
          <span>Is this your business?</span>
          <Link
            href={`/claim?company=${encodeURIComponent(profile.companyName)}`}
            className="sp-claim-banner-cta"
          >
            Claim this listing free →
          </Link>
        </div>
      )}

      <div className="sp-body">

        {/* Hero */}
        <div className="sp-hero">
          <div className="sp-hero-top">
            <div className="sp-hero-name-row">
              <h1 className="sp-company-name">{profile.companyName}</h1>
              {profile.claimed && (
                <span className="sp-verified-badge">✓ Verified Member</span>
              )}
              {organicCertified && (
                <span className="sp-organic-badge">Organic</span>
              )}
            </div>
            <p className="sp-location">📍 {profile.location.full || `${profile.location.city}, ${profile.location.state}`}</p>
          </div>

          {/* Score + contact row */}
          <div className="sp-hero-meta">
            {profile.verificationScore && (
              <div className="sp-score-block">
                <div className="sp-score-label">Verification</div>
                <div className="sp-score-row">
                  <div className="sp-score-bar">
                    <div className="sp-score-fill" style={{ width: `${scorePercent}%` }} />
                  </div>
                  <span className="sp-score-num">{profile.verificationScore.score}/{profile.verificationScore.maxScore}</span>
                </div>
              </div>
            )}

            {(contactEmail || profile.contact?.phone || profile.contact?.website) && (
              <div className="sp-contact-row">
                {profile.contact?.website && (
                  <a href={profile.contact.website} target="_blank" rel="noreferrer" className="sp-contact-link">
                    🌐 Website
                  </a>
                )}
                {profile.contact?.phone && (
                  <a href={`tel:${profile.contact.phone}`} className="sp-contact-link">
                    📞 {profile.contact.phone}
                  </a>
                )}
                {contactEmail && (
                  <a href={`mailto:${contactEmail}`} className="sp-contact-link">
                    ✉️ Email
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Verification source pills */}
          {profile.dataSources && (
            <div className="sp-source-pills">
              {profile.dataSources.paca?.verified && <span className="sp-pill">PACA Licensed</span>}
              {profile.dataSources.usdaOrganic?.verified && <span className="sp-pill">USDA Organic</span>}
              {profile.dataSources.gfsi?.verified && <span className="sp-pill">GFSI Certified</span>}
              {profile.dataSources.drc?.verified && <span className="sp-pill">DRC Member</span>}
              {profile.dataSources.established?.verified && profile.dataSources.established.yearsInBusiness && (
                <span className="sp-pill">{profile.dataSources.established.yearsInBusiness}+ years in business</span>
              )}
            </div>
          )}
        </div>

        {/* Products */}
        {profile.products.length > 0 && (
          <section className="sp-section">
            <h2 className="sp-section-title">Products</h2>
            <div className="sp-products">
              {profile.products.map((p, i) => {
                const seasonality = typeof p.seasonality === 'string'
                  ? p.seasonality
                  : p.seasonality?.description || ''
                return (
                  <div key={i} className="sp-product-row">
                    <div className="sp-product-left">
                      <span className="sp-product-name">{p.commodity}</span>
                      {p.isOrganic && <span className="sp-product-organic">Organic</span>}
                      {p.varieties.length > 0 && (
                        <div className="sp-varieties">
                          {p.varieties.map((v, j) => (
                            <span key={j} className="sp-variety">{v}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {seasonality && (
                      <span className="sp-product-season">{seasonality}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Certifications */}
        {profile.certifications.length > 0 && (
          <section className="sp-section">
            <h2 className="sp-section-title">Certifications</h2>
            <div className="sp-cert-list">
              {profile.certifications.map((c, i) => (
                <span key={i} className="sp-cert">{c}</span>
              ))}
            </div>
          </section>
        )}

        {/* Verification checklist */}
        {profile.dataSources && profile.verificationScore && (
          <section className="sp-section">
            <h2 className="sp-section-title">Verification</h2>
            <div className="sp-verify-list">
              {[
                { key: 'paca', label: 'PACA License', detail: profile.dataSources.paca?.licenseNumber ? `#${profile.dataSources.paca.licenseNumber}` : '' },
                { key: 'gfsi', label: 'GFSI Food Safety', detail: profile.dataSources.gfsi?.certificationType || '' },
                { key: 'usdaOrganic', label: 'USDA Organic', detail: profile.dataSources.usdaOrganic?.certifier || '' },
                { key: 'established', label: 'Business Established', detail: profile.dataSources.established?.yearEstablished ? `Since ${profile.dataSources.established.yearEstablished}` : '' },
                { key: 'drc', label: 'DRC Member', detail: '' },
                { key: 'website', label: 'Website Verified', detail: '' },
                { key: 'acrelist', label: 'ProduceHunt Member', detail: '' },
              ].map(({ key, label, detail }) => {
                const verified = (profile.dataSources as any)?.[key]?.verified
                return (
                  <div key={key} className={`sp-verify-row ${verified ? 'sp-verified' : 'sp-unverified'}`}>
                    <span className="sp-verify-icon">{verified ? '✓' : '○'}</span>
                    <span className="sp-verify-label">{label}</span>
                    {detail && <span className="sp-verify-detail">{detail}</span>}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Claim CTA — unclaimed */}
        {!profile.claimed && (
          <div className="sp-claim-section">
            <div className="sp-claim-card">
              <div className="sp-claim-card-left">
                <p className="sp-claim-card-title">Is this your business?</p>
                <p className="sp-claim-card-sub">
                  Claim this listing to control what buyers see, add live pricing, and appear higher in search results. It&apos;s free.
                </p>
              </div>
              <Link
                href={`/claim?company=${encodeURIComponent(profile.companyName)}`}
                className="sp-claim-card-cta"
              >
                Claim this listing
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
