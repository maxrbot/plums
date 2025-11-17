"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { CheckCircleIcon, ClockIcon, SparklesIcon, ExclamationTriangleIcon, XCircleIcon, StarIcon } from '@heroicons/react/24/outline'

interface PriceSheetProduct {
  _id: string
  productName?: string
  category?: string
  commodity?: string
  variety?: string
  subtype?: string
  isOrganic?: boolean
  regionName?: string
  packageType: string
  size?: string
  countSize?: string
  grade?: string
  price: number | null
  availability: string
  isStickered?: boolean
  specialNotes?: string
  hasOverride?: boolean
  overrideComment?: string
}

interface PriceSheet {
  _id: string
  title: string
  status: string
  productsCount: number
  notes?: string
  createdAt: string
  updatedAt: string
}

interface UserInfo {
  companyName?: string
  name?: string
  email?: string
  logo?: string | null
}

export default function PublicPriceSheetViewer() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = params?.id as string

  const [priceSheet, setPriceSheet] = useState<PriceSheet | null>(null)
  const [products, setProducts] = useState<PriceSheetProduct[]>([])
  const [user, setUser] = useState<UserInfo | null>(null)
  const [showPricing, setShowPricing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchPriceSheet = async () => {
      try {
        // Get contact hash and preview mode from URL if present
        const urlParams = new URLSearchParams(window.location.search)
        const contactHash = urlParams.get('c')
        const preview = urlParams.get('preview')
        
        // Build URL with parameters if present
        const queryParams = new URLSearchParams()
        if (contactHash) queryParams.set('c', contactHash)
        if (preview) queryParams.set('preview', preview)
        
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
        const url = queryParams.toString()
          ? `${apiBase}/public/price-sheets/${id}?${queryParams.toString()}`
          : `${apiBase}/public/price-sheets/${id}`
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Price sheet not found')
        }

        const data = await response.json()
        setPriceSheet(data.priceSheet)
        setProducts(data.products || [])
        setUser(data.user)
        setShowPricing(data.showPricing || false)
      } catch (err) {
        console.error('Error fetching price sheet:', err)
        setError('Unable to load price sheet. It may no longer be available.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPriceSheet()
  }, [id])

  // Group products by shipping point, then by commodity
  const groupedProducts = products.reduce((acc, product) => {
    const shippingPoint = product.regionName || 'Other'
    
    if (!acc[shippingPoint]) {
      acc[shippingPoint] = {}
    }
    
    const commodity = product.commodity || 'Other'
    const commodityKey = commodity.charAt(0).toUpperCase() + commodity.slice(1)
    
    if (!acc[shippingPoint][commodityKey]) {
      acc[shippingPoint][commodityKey] = []
    }
    
    acc[shippingPoint][commodityKey].push(product)
    return acc
  }, {} as Record<string, Record<string, PriceSheetProduct[]>>)

  const getAvailabilityBadge = (availability: string) => {
    const badges: Record<string, { icon: any; className: string; label: string }> = {
      'Available': {
        icon: CheckCircleIcon,
        className: 'bg-green-50 text-green-700 border-green-200',
        label: 'Available'
      },
      'Coming Soon': {
        icon: ClockIcon,
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        label: 'Coming Soon'
      },
      'End of Season': {
        icon: ExclamationTriangleIcon,
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        label: 'End of Season'
      },
      'Limited Supply': {
        icon: ExclamationTriangleIcon,
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        label: 'Limited Supply'
      },
      'Sold Out': {
        icon: XCircleIcon,
        className: 'bg-red-50 text-red-700 border-red-200',
        label: 'Sold Out'
      },
      'Program': {
        icon: StarIcon,
        className: 'bg-purple-50 text-purple-700 border-purple-200',
        label: 'Program'
      }
    }

    const badge = badges[availability] || badges['Available']
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.className}`}>
        <Icon className="h-3.5 w-3.5" />
        {badge.label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading price sheet...</p>
        </div>
      </div>
    )
  }

  if (error || !priceSheet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Price Sheet Not Found</h1>
            <p className="text-gray-600">{error || 'This price sheet may have been removed or is no longer available.'}</p>
          </div>
        </div>
      </div>
    )
  }

  const companyName = user?.companyName || user?.name || 'Supplier'
  
  // Get buyer company name from URL parameter if available
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const buyerCompany = urlParams?.get('buyer') || null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Header */}
          <div className="hidden md:block py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                {buyerCompany && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    For {buyerCompany}
                  </div>
                )}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="font-semibold text-gray-900">{products.length}</span>
                    <span>{products.length === 1 ? 'item' : 'items'}</span>
                  </div>
                  <span>·</span>
                  <span>Updated {new Date(priceSheet.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              {user?.logo && (
                <div className="flex-shrink-0">
                  <img
                    src={user.logo}
                    alt={`${companyName} logo`}
                    className="h-16 w-auto object-contain"
                  />
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{priceSheet.title}</h1>
            {priceSheet.notes && (
              <p className="text-gray-600 mt-3 leading-relaxed">{priceSheet.notes}</p>
            )}
          </div>

          {/* Mobile Header */}
          <div className="md:hidden py-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                {buyerCompany && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 mb-3">
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    For {buyerCompany}
                  </div>
                )}
              </div>
              {user?.logo && (
                <div className="flex-shrink-0 ml-4">
                  <img
                    src={user.logo}
                    alt={`${companyName} logo`}
                    className="h-12 w-auto object-contain"
                  />
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-3">{priceSheet.title}</h1>
            {priceSheet.notes && (
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{priceSheet.notes}</p>
            )}
            <div className="flex items-center space-x-3 text-xs text-gray-500 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="font-semibold text-gray-900">{products.length}</span>
                <span>{products.length === 1 ? 'item' : 'items'}</span>
              </div>
              <span>·</span>
              <span>Updated {new Date(priceSheet.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pricing Hidden Notice */}
        {!showPricing && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-lg p-5">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  Product Catalog View
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Pricing is only visible via personalized links. Contact {companyName} for pricing information.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-8">
          {Object.keys(groupedProducts).length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center text-gray-500">
              No products in this price sheet
            </div>
          ) : (
            Object.entries(groupedProducts).map(([shippingPoint, commodities]) => (
              <div key={shippingPoint} className="space-y-6">
                {/* Shipping Point Header */}
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 rounded-xl px-6 py-4 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Shipping Point</div>
                      <h2 className="text-xl font-bold text-gray-900">{shippingPoint}</h2>
                    </div>
                  </div>
                </div>

                {/* Commodities within this Shipping Point */}
                <div className="space-y-6 pl-0 md:pl-4">
                  {Object.entries(commodities).map(([commodity, commodityProducts]) => (
                    <div key={commodity} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      {/* Commodity Header */}
                      <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900">{commodity}</h3>
                      </div>

                      {/* Products Table - Desktop */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Variety
                              </th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Package
                              </th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Size
                              </th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Grade
                              </th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Availability
                              </th>
                              {showPricing && (
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {priceSheet?.priceType || 'FOB'} Price
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {commodityProducts.map((product, index) => {
                              // Build display name: "Type Variety" or just "Type" or just "Variety"
                              let displayName = '-'
                              if (product.productName) {
                                displayName = product.productName
                              } else if (product.variety && product.subtype) {
                                displayName = `${product.subtype} ${product.variety}`
                              } else if (product.subtype) {
                                displayName = product.subtype
                              } else if (product.variety) {
                                displayName = product.variety
                              }
                              
                              // Remove "Organic" from display name if product is organic (we'll add it back styled)
                              if (product.isOrganic && displayName.toLowerCase().startsWith('organic ')) {
                                displayName = displayName.substring(8) // Remove "Organic " prefix
                              }
                              
                              return (
                              <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-4">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {product.isOrganic && (
                                        <span className="text-green-600 font-semibold">Organic </span>
                                      )}
                                      {displayName}
                                    </div>
                                    {product.isStickered && (
                                      <div className="mt-1.5">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                          Stickered
                                        </span>
                                      </div>
                                    )}
                                    {product.specialNotes && (
                                      <p className="text-xs text-gray-500 mt-2">{product.specialNotes}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 font-medium">
                                    {product.packageType || '-'}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {product.size || product.countSize || '-'}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {product.grade || '-'}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  {getAvailabilityBadge(product.availability)}
                                </td>
                                {showPricing && (
                                  <td className="px-4 py-4 whitespace-nowrap text-right">
                                    {product.hasOverride && product.overrideComment ? (
                                      <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-700">
                                        {product.overrideComment}
                                      </span>
                                    ) : (
                                      <div className="text-xl font-bold text-gray-900">
                                        {product.price !== null ? `$${product.price.toFixed(2)}` : 'Contact'}
                                      </div>
                                    )}
                                  </td>
                                )}
                              </tr>
                            )})}
                          </tbody>
                        </table>
                      </div>

                      {/* Products List - Mobile */}
                      <div className="md:hidden divide-y divide-gray-100">
                        {commodityProducts.map((product, index) => {
                          // Build display name: "Type Variety" or just "Type" or just "Variety"
                          let displayName = '-'
                          if (product.productName) {
                            displayName = product.productName
                          } else if (product.variety && product.subtype) {
                            displayName = `${product.subtype} ${product.variety}`
                          } else if (product.subtype) {
                            displayName = product.subtype
                          } else if (product.variety) {
                            displayName = product.variety
                          }
                          
                          // Remove "Organic" from display name if product is organic (we'll add it back styled)
                          if (product.isOrganic && displayName.toLowerCase().startsWith('organic ')) {
                            displayName = displayName.substring(8) // Remove "Organic " prefix
                          }
                          
                          // Build package info string
                          const packageInfo = [
                            product.packageType,
                            product.size || product.countSize,
                            product.grade
                          ].filter(Boolean).join(' · ')
                          
                          return (
                            <div key={product._id} className="p-4 hover:bg-gray-50 transition-colors">
                              {/* Product Name & Badges */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="text-base font-semibold text-gray-900 mb-2">
                                    {product.isOrganic && (
                                      <span className="text-green-600 font-bold">Organic </span>
                                    )}
                                    {displayName}
                                  </h4>
                                  {product.isStickered && (
                                    <div className="mb-2">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                        Stickered
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {showPricing && (
                                  <div className="text-right ml-4">
                                    {product.hasOverride && product.overrideComment ? (
                                      <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-700">
                                        {product.overrideComment}
                                      </span>
                                    ) : (
                                      <div className="text-2xl font-bold text-gray-900">
                                        {product.price !== null ? `$${product.price.toFixed(2)}` : 'Contact'}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Package Info */}
                              {packageInfo && (
                                <div className="text-sm text-gray-600 mb-2">
                                  {packageInfo}
                                </div>
                              )}

                              {/* Availability */}
                              <div className="flex items-center justify-between">
                                {getAvailabilityBadge(product.availability)}
                              </div>

                              {/* Special Notes */}
                              {product.specialNotes && (
                                <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                                  {product.specialNotes}
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <button
              onClick={() => {
                const queryString = searchParams?.toString() ? `?${searchParams.toString()}` : ''
                router.push(`/ps/${id}/order${queryString}`)
              }}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <div className="flex items-center justify-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <div className="text-left">
                  <div className="text-lg font-semibold">Submit Order Request</div>
                  <div className="text-sm text-blue-100 font-normal">Quick & easy — takes 30 seconds</div>
                </div>
              </div>
            </button>
          </div>
          
          <p className="text-xs text-gray-400 mt-6">
            Powered by PriceSheetSent
          </p>
        </div>
      </div>
    </div>
  )
}

