'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import './directory.css'

interface Supplier {
  id: string
  slug: string
  companyName: string
  location: {
    city?: string
    state?: string
    full: string
  }
  products: string[]
  certifications: string[]
  claimed: boolean
  email?: string
  dataSources?: {
    paca?: { verified: boolean }
    gfsi?: { verified: boolean, certificationType?: string }
    established?: { verified: boolean, yearEstablished?: number }
    usdaOrganic?: { verified: boolean }
    drc?: { verified: boolean }
    website?: { verified: boolean }
    acrelist?: { verified: boolean }
  }
  verificationScore?: {
    score: number
    maxScore: number
    percentage: number
  }
}

export default function SupplierDirectory() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterState, setFilterState] = useState('all')
  const [filterCertification, setFilterCertification] = useState('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [favoriteSuppliers, setFavoriteSuppliers] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchSuppliers()
    loadFavorites()
  }, [])

  const loadFavorites = () => {
    const saved = localStorage.getItem('favoriteSuppliers')
    if (saved) {
      setFavoriteSuppliers(new Set(JSON.parse(saved)))
    }
  }

  const toggleFavorite = (slug: string) => {
    const newFavorites = new Set(favoriteSuppliers)
    if (newFavorites.has(slug)) {
      newFavorites.delete(slug)
    } else {
      newFavorites.add(slug)
    }
    setFavoriteSuppliers(newFavorites)
    localStorage.setItem('favoriteSuppliers', JSON.stringify(Array.from(newFavorites)))
  }

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/public/suppliers')
      const data = await response.json()
      setSuppliers(data.suppliers || [])
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSuppliers = suppliers.filter(supplier => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      supplier.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.products.some(p => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      supplier.location.full.toLowerCase().includes(searchQuery.toLowerCase())

    // State filter
    const matchesState = filterState === 'all' || supplier.location.state === filterState

    // Certification filter
    const matchesCertification = filterCertification === 'all' ||
      supplier.certifications.some(c => c.toLowerCase().includes(filterCertification.toLowerCase()))

    // Favorites filter
    const matchesFavorites = !showFavoritesOnly || favoriteSuppliers.has(supplier.slug)

    return matchesSearch && matchesState && matchesCertification && matchesFavorites
  })

  const uniqueStates = Array.from(new Set(suppliers.map(s => s.location.state).filter(Boolean))).sort()
  const uniqueCertifications = Array.from(new Set(suppliers.flatMap(s => s.certifications))).sort()

  return (
    <div className="directory-page">
      {/* Header */}
      <header className="directory-header">
        <div className="header-content">
          <Link href="/" className="back-link">
            ← Back to Search
          </Link>
          <div className="header-title">
            <h1>Supplier Directory</h1>
            <p className="header-subtitle">
              Browse {suppliers.length}+ verified produce suppliers
              {favoriteSuppliers.size > 0 && (
                <span className="favorites-count"> • {favoriteSuppliers.size} favorite{favoriteSuppliers.size !== 1 ? 's' : ''}</span>
              )}
            </p>
          </div>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="directory-controls">
        <div className="controls-container">
          <div className="search-bar">
            <svg className="search-icon" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search suppliers, products, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filters">
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="filter-select"
            >
              <option value="all">All States</option>
              {uniqueStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            <select
              value={filterCertification}
              onChange={(e) => setFilterCertification(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Certifications</option>
              {uniqueCertifications.map(cert => (
                <option key={cert} value={cert}>{cert}</option>
              ))}
            </select>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`favorites-toggle ${showFavoritesOnly ? 'active' : ''}`}
            >
              <svg viewBox="0 0 24 24" className="star-icon" fill={showFavoritesOnly ? 'currentColor' : 'none'}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              My Favorites {favoriteSuppliers.size > 0 && `(${favoriteSuppliers.size})`}
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info">
        <p>
          Showing <strong>{filteredSuppliers.length}</strong> of <strong>{suppliers.length}</strong> suppliers
        </p>
      </div>

      {/* Table */}
      <div className="directory-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading suppliers...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No suppliers found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <table className="directory-table">
            <thead>
              <tr>
                <th className="star-column"></th>
                <th>Company</th>
                <th>Location</th>
                <th>Products</th>
                <th>Certifications</th>
                <th>Verification Score</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td className="star-cell">
                    <button
                      onClick={() => toggleFavorite(supplier.slug)}
                      className="star-button"
                      title={favoriteSuppliers.has(supplier.slug) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <svg viewBox="0 0 24 24" className="star-icon" fill={favoriteSuppliers.has(supplier.slug) ? '#FFD700' : 'none'}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  </td>
                  <td className="company-cell">
                    <div className="company-name">{supplier.companyName}</div>
                  </td>
                  <td className="location-cell">
                    <div className="location-text">
                      {supplier.location.city && supplier.location.state
                        ? `${supplier.location.city}, ${supplier.location.state}`
                        : supplier.location.full || 'Unknown'}
                    </div>
                  </td>
                  <td className="products-cell">
                    <div className="product-tags">
                      {supplier.products.slice(0, 3).map((product, idx) => (
                        <span key={idx} className="product-tag">{product}</span>
                      ))}
                      {supplier.products.length > 3 && (
                        <span className="product-tag more">+{supplier.products.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="certs-cell">
                    {supplier.certifications.length > 0 ? (
                      <div className="cert-badges">
                        {supplier.certifications.slice(0, 2).map((cert, idx) => (
                          <span key={idx} className="cert-badge">{cert}</span>
                        ))}
                        {supplier.certifications.length > 2 && (
                          <span className="cert-badge more">+{supplier.certifications.length - 2}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="verification-cell">
                    {supplier.verificationScore ? (
                      <div className="verification-score">
                        <div className="score-bar-container">
                          <div
                            className="score-bar-fill"
                            style={{ width: `${supplier.verificationScore.percentage}%` }}
                          ></div>
                        </div>
                        <div className="score-text">
                          {supplier.verificationScore.score}/{supplier.verificationScore.maxScore}
                          <span className="score-percentage">({supplier.verificationScore.percentage}%)</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="action-cell">
                    <Link
                      href={`/supplier/${supplier.slug}`}
                      className="view-profile-btn"
                    >
                      View Profile →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
