'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import './profile.css'

interface DataSource {
  name: string
  date?: string
  url?: string
}

interface SupplierProfile {
  id: string
  slug: string
  companyName: string
  claimed: boolean
  location: {
    city?: string
    state?: string
    full: string
  }
  contact: {
    email?: string
    phone?: string
    website?: string
  }
  products: Array<{
    commodity: string
    varieties: string[]
    isOrganic: boolean
    seasonality: string
  }>
  certifications: string[]
  description?: string
  shippingPoints?: string[]
  dataSources?: {
    paca?: { verified: boolean, licenseNumber?: string, verifiedDate?: string, score?: number }
    gfsi?: { verified: boolean, certificationType?: string, certificationDate?: string, score?: number }
    established?: { verified: boolean, yearEstablished?: number, yearsInBusiness?: number, score?: number }
    usdaOrganic?: { verified: boolean, certifier?: string, certificationDate?: string, score?: number }
    drc?: { verified: boolean, memberSince?: string, score?: number }
    website?: { verified: boolean, url?: string, score?: number }
    acrelist?: { verified: boolean, score?: number }
  }
  dataSourcesList?: DataSource[]
  verificationScore?: {
    score: number
    maxScore: number
    percentage: number
  }
}

export default function SupplierProfilePage() {
  const params = useParams()
  const slug = params.slug as string

  const [profile, setProfile] = useState<SupplierProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchProfile()
    }
  }, [slug])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/public/suppliers/${slug}`)
      const data = await response.json()
      setProfile(data.supplier)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="error-page">
        <h1>Supplier Not Found</h1>
        <p>The supplier you're looking for doesn't exist.</p>
        <Link href="/directory" className="back-link-button">← Back to Directory</Link>
      </div>
    )
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <div className="header-container">
          <Link href="/directory" className="back-link">
            ← Back to Directory
          </Link>
        </div>
      </header>

      {/* Hero Section - Redesigned */}
      <section className="profile-hero-new">
        <div className="hero-container">
          <div className="hero-left">
            <div className="company-icon">🏢</div>
            <div className="company-details">
              <h1>{profile.companyName}</h1>
              <button
                className="location-link"
                onClick={() => setShowMapModal(true)}
              >
                <svg viewBox="0 0 24 24" className="location-icon">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {profile.location.full || 'Location not specified'}
              </button>
            </div>
          </div>

          <div className="hero-right">
            {/* Contact Details */}
            <div className="contact-details-inline">
              {profile.contact.website && (
                <a href={profile.contact.website} target="_blank" rel="noopener noreferrer" className="contact-link">
                  <svg viewBox="0 0 24 24" className="icon">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Website
                </a>
              )}
              {profile.contact.phone && (
                <a href={`tel:${profile.contact.phone}`} className="contact-link">
                  <svg viewBox="0 0 24 24" className="icon">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {profile.contact.phone}
                </a>
              )}
              {profile.description && (
                <button
                  className="about-btn"
                  onClick={() => setShowAboutModal(true)}
                >
                  <svg viewBox="0 0 24 24" className="icon">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  About
                </button>
              )}
            </div>

            {/* Data Sources */}
            {profile.dataSources && (
              <div className="data-sources-inline">
                <span className="sources-label">Verified by:</span>
                <div className="source-badges">
                  {profile.dataSources.paca?.verified && (
                    <span className="source-badge verified" title="USDA PACA License">PACA</span>
                  )}
                  {profile.dataSources.usdaOrganic?.verified && (
                    <span className="source-badge verified" title="USDA Organic Certified">USDA Organic</span>
                  )}
                  {profile.dataSources.website?.verified && (
                    <span className="source-badge verified" title="Company Website Verified">Website</span>
                  )}
                  {profile.dataSources.acrelist?.verified && (
                    <span className="source-badge verified" title="Acrelist Platform Member">Acrelist</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content - Full Width */}
      <div className="profile-content-new">
        <div className="content-container">

          {/* Products Section - Redesigned */}
          <section className="products-section-new">
            <h2>Products & Availability</h2>
            {profile.products.length > 0 ? (
              <div className="products-list-new">
                {profile.products.map((product, idx) => (
                  <div key={idx} className="product-row">
                    <div className="product-main">
                      <div className="product-name-section">
                        <h3>{product.commodity}</h3>
                        <div className="product-meta">
                          {product.isOrganic && (
                            <span className="badge organic">Organic</span>
                          )}
                          {profile.certifications.filter(cert =>
                            cert.toLowerCase().includes('usda') ||
                            cert.toLowerCase().includes('gap') ||
                            cert.toLowerCase().includes('fair trade')
                          ).map((cert, i) => (
                            <span key={i} className="badge cert">{cert}</span>
                          ))}
                        </div>
                      </div>

                      {product.varieties.length > 0 && (
                        <div className="varieties-section">
                          <span className="label">Varieties:</span>
                          <div className="variety-chips">
                            {product.varieties.map((variety, i) => (
                              <span key={i} className="variety-chip">{variety}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="product-availability">
                      <div className="seasonality-info">
                        <svg viewBox="0 0 24 24" className="calendar-icon">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>{product.seasonality}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">No products listed yet</p>
            )}
          </section>

          {/* Verification Checklist Grid */}
          {profile.dataSources && profile.verificationScore && (
            <section className="verification-grid-section">
              <div className="verification-header">
                <h3>Verification Checklist</h3>
                <div className="verification-score-badge">
                  <div className="score-bar-container-large">
                    <div
                      className="score-bar-fill"
                      style={{ width: `${profile.verificationScore.percentage}%` }}
                    ></div>
                  </div>
                  <div className="score-label">
                    {profile.verificationScore.score}/{profile.verificationScore.maxScore}
                    <span className="score-pct">({profile.verificationScore.percentage}%)</span>
                  </div>
                </div>
              </div>

              <div className="verification-grid">
                {/* PACA */}
                <div className={`verification-item ${profile.dataSources.paca?.verified ? 'verified' : 'unverified'}`}>
                  <div className="verification-icon">
                    {profile.dataSources.paca?.verified ? '✓' : '✗'}
                  </div>
                  <div className="verification-details">
                    <div className="verification-name">PACA License</div>
                    <div className="verification-description">
                      {profile.dataSources.paca?.verified
                        ? `Active • License #${profile.dataSources.paca.licenseNumber || 'N/A'}`
                        : 'Not verified'
                      }
                    </div>
                  </div>
                  <div className="verification-weight">Critical (10pts)</div>
                </div>

                {/* GFSI */}
                <div className={`verification-item ${profile.dataSources.gfsi?.verified ? 'verified' : 'unverified'}`}>
                  <div className="verification-icon">
                    {profile.dataSources.gfsi?.verified ? '✓' : '✗'}
                  </div>
                  <div className="verification-details">
                    <div className="verification-name">GFSI Certified</div>
                    <div className="verification-description">
                      {profile.dataSources.gfsi?.verified
                        ? profile.dataSources.gfsi.certificationType || 'Food safety certified'
                        : 'Not verified'
                      }
                    </div>
                  </div>
                  <div className="verification-weight">Critical (10pts)</div>
                </div>

                {/* Established */}
                <div className={`verification-item ${profile.dataSources.established?.verified ? 'verified' : 'unverified'}`}>
                  <div className="verification-icon">
                    {profile.dataSources.established?.verified ? '✓' : '✗'}
                  </div>
                  <div className="verification-details">
                    <div className="verification-name">Business Established</div>
                    <div className="verification-description">
                      {profile.dataSources.established?.verified
                        ? `Since ${profile.dataSources.established.yearEstablished} (${profile.dataSources.established.yearsInBusiness}+ years)`
                        : 'Not verified'
                      }
                    </div>
                  </div>
                  <div className="verification-weight">Important (5pts)</div>
                </div>

                {/* USDA Organic */}
                <div className={`verification-item ${profile.dataSources.usdaOrganic?.verified ? 'verified' : 'unverified'}`}>
                  <div className="verification-icon">
                    {profile.dataSources.usdaOrganic?.verified ? '✓' : '✗'}
                  </div>
                  <div className="verification-details">
                    <div className="verification-name">USDA Organic</div>
                    <div className="verification-description">
                      {profile.dataSources.usdaOrganic?.verified
                        ? `Certified by ${profile.dataSources.usdaOrganic.certifier || 'USDA'}`
                        : 'Not certified'
                      }
                    </div>
                  </div>
                  <div className="verification-weight">Conditional (3pts)</div>
                </div>

                {/* DRC */}
                <div className={`verification-item ${profile.dataSources.drc?.verified ? 'verified' : 'unverified'}`}>
                  <div className="verification-icon">
                    {profile.dataSources.drc?.verified ? '✓' : '✗'}
                  </div>
                  <div className="verification-details">
                    <div className="verification-name">DRC Member</div>
                    <div className="verification-description">
                      {profile.dataSources.drc?.verified
                        ? `Member since ${profile.dataSources.drc.memberSince || 'N/A'}`
                        : 'Not a member'
                      }
                    </div>
                  </div>
                  <div className="verification-weight">Trust Signal (2pts)</div>
                </div>

                {/* Website */}
                <div className={`verification-item ${profile.dataSources.website?.verified ? 'verified' : 'unverified'}`}>
                  <div className="verification-icon">
                    {profile.dataSources.website?.verified ? '✓' : '✗'}
                  </div>
                  <div className="verification-details">
                    <div className="verification-name">Website Verified</div>
                    <div className="verification-description">
                      {profile.dataSources.website?.verified
                        ? 'Active web presence'
                        : 'No website'
                      }
                    </div>
                  </div>
                  <div className="verification-weight">Basic (2pts)</div>
                </div>

                {/* Acrelist */}
                <div className={`verification-item ${profile.dataSources.acrelist?.verified ? 'verified' : 'unverified'}`}>
                  <div className="verification-icon">
                    {profile.dataSources.acrelist?.verified ? '✓' : '✗'}
                  </div>
                  <div className="verification-details">
                    <div className="verification-name">Acrelist Platform</div>
                    <div className="verification-description">
                      {profile.dataSources.acrelist?.verified
                        ? 'Active member'
                        : 'Not on platform'
                      }
                    </div>
                  </div>
                  <div className="verification-weight">Platform (2pts)</div>
                </div>
              </div>

              <div className="verification-note">
                Higher verification scores indicate more reliable and established suppliers with better food safety practices.
              </div>
            </section>
          )}

          {/* Shipping Points */}
          {profile.shippingPoints && profile.shippingPoints.length > 0 && (
            <section className="shipping-section-new">
              <h3>Shipping Points</h3>
              <div className="shipping-grid">
                {profile.shippingPoints.map((point, idx) => (
                  <div key={idx} className="shipping-chip">
                    <svg viewBox="0 0 24 24" className="truck-icon">
                      <rect x="1" y="3" width="15" height="13" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                    {point}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* About Modal */}
      {showAboutModal && profile.description && (
        <div className="modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>About {profile.companyName}</h2>
              <button className="modal-close" onClick={() => setShowAboutModal(false)}>
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p>{profile.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && (
        <div className="modal-overlay" onClick={() => setShowMapModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{profile.location.full}</h2>
              <button className="modal-close" onClick={() => setShowMapModal(false)}>
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="map-placeholder-large">
                <svg viewBox="0 0 24 24" className="map-icon-large">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <p>Map integration coming soon</p>
                <p className="map-address">{profile.location.full}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
