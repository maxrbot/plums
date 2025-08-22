"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  PlusIcon, 
  Cog6ToothIcon, 
  PaperAirplaneIcon,
  DocumentTextIcon,
  SparklesIcon,
  UserGroupIcon,
  DocumentDuplicateIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ArchiveBoxIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { regionsApi, cropsApi, certificationsApi, packagingApi, contactsApi, priceSheetsApi } from '../../../lib/api'
import type { GrowingRegion, CropManagement, Capability, Contact } from '../../../types'

interface DashboardMetrics {
  regions: {
    count: number
    data: GrowingRegion[]
    lastUpdated?: string
  }
  crops: {
    count: number
    commodities: number
    variations: number
    organicCount: number
    conventionalCount: number
    data: CropManagement[]
    lastUpdated?: string
  }
  certifications: {
    count: number
    data: Capability[]
    lastUpdated?: string
  }
  packaging: {
    count: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[]
    lastUpdated?: string
  }
  contacts: {
    count: number
    activeCount: number
    data: Contact[]
  }
  priceSheets: {
    count: number
    readyCount: number
  }
}

export default function PriceSheets() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    regions: { count: 0, data: [] },
    crops: { count: 0, commodities: 0, variations: 0, organicCount: 0, conventionalCount: 0, data: [] },
    certifications: { count: 0, data: [] },
    packaging: { count: 0, data: [] },
    contacts: { count: 0, activeCount: 0, data: [] },
    priceSheets: { count: 0, readyCount: 0 }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardMetrics()
  }, [])

  const loadDashboardMetrics = async () => {
    try {
      setError(null)
      
      // Load all data in parallel
      const [regionsRes, cropsRes, certificationsRes, packagingRes, contactsRes, priceSheetsRes] = await Promise.all([
        regionsApi.getAll().catch(() => ({ regions: [] })),
        cropsApi.getAll().catch(() => ({ crops: [] })),
        certificationsApi.getAll().catch(() => ({ certifications: [] })),
        packagingApi.getAll().catch(() => ({ packaging: [] })),
        contactsApi.getAll().catch(() => ({ contacts: [] })),
        priceSheetsApi.getAll().catch(() => ({ priceSheets: [] }))
      ])

      const regions = regionsRes.regions || []
      const crops = cropsRes.crops || []
      const certifications = certificationsRes.certifications || []
      const packaging = packagingRes.packaging || []
      const contacts = contactsRes.contacts || []
      const priceSheets = priceSheetsRes.priceSheets || []

      // Calculate crop metrics
      const totalVariations = crops.reduce((sum, crop) => sum + (crop.variations?.length || 0), 0)
      const organicCount = crops.reduce((sum, crop) => 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sum + (crop.variations?.filter((v: any) => v.type === 'organic').length || 0), 0)
      const conventionalCount = crops.reduce((sum, crop) => 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sum + (crop.variations?.filter((v: any) => v.type === 'conventional').length || 0), 0)
      const uniqueCommodities = new Set(crops.map(crop => crop.commodity)).size

      // Calculate contact metrics
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activeContacts = contacts.filter((c: any) => c.status === 'active').length

      setMetrics({
        regions: {
          count: regions.length,
          data: regions,
          lastUpdated: regions[0]?.updatedAt || regions[0]?.createdAt
        },
        crops: {
          count: totalVariations,
          commodities: uniqueCommodities,
          variations: totalVariations,
          organicCount,
          conventionalCount,
          data: crops,
          lastUpdated: crops[0]?.updatedAt || crops[0]?.createdAt
        },
        certifications: {
          count: certifications.length,
          data: certifications,
          lastUpdated: certifications[0]?.updatedAt || certifications[0]?.createdAt
        },
        packaging: {
          count: packaging.length,
          data: packaging,
          lastUpdated: packaging[0]?.updatedAt || packaging[0]?.createdAt
        },
        contacts: {
          count: contacts.length,
          activeCount: activeContacts,
          data: contacts
        },
        priceSheets: {
          count: priceSheets.length,
          readyCount: priceSheets.length // For now, assume all are ready
        }
      })

      console.log('Dashboard metrics loaded:', {
        regions: regions.length,
        crops: crops.length,
        certifications: certifications.length,
        packaging: packaging.length,
        contacts: contacts.length,
        priceSheets: priceSheets.length
      })

    } catch (err) {
      console.error('Failed to load dashboard metrics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }
  if (error) {
    return (
      <div className="mb-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => {
                    setError(null)
                    loadDashboardMetrics()
                  }}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Price Sheets</h1>
          <p className="mt-2 text-gray-600">Your price sheet management hub - create, manage data, and send to contacts.</p>
        </div>
      </div>

      {/* Main Action Sections */}
      <div className="space-y-8">
        {/* Generate, Send, and USDA Actions - Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. Generate Price Sheets */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
                    <DocumentTextIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Generate Price Sheets</h3>
                    <p className="text-sm text-gray-500">Create professional price sheets</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-sm text-gray-500">Loading data...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded-md">
                      <div className="font-semibold text-gray-900">{metrics.crops.variations}</div>
                      <div className="text-gray-600">Total Products</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-md">
                      <div className="font-semibold text-gray-900">{metrics.regions.count}</div>
                      <div className="text-gray-600">Regions</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Link
                  href="/dashboard/price-sheets/new"
                  className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-lime-500 hover:bg-lime-600"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Generate New Price Sheet
                </Link>
                <p className="text-xs text-gray-500 text-center">
                  Select products, set pricing, and generate professional price sheets for your buyers.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Send & Manage */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
                    <PaperAirplaneIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Send & Manage</h3>
                    <p className="text-sm text-gray-500">Distribute to your contacts</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-sm text-gray-500">Loading data...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-3">
                        <DocumentDuplicateIcon className="h-5 w-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">Saved Price Sheets</span>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">{metrics.priceSheets.readyCount} ready</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-3">
                        <UserGroupIcon className="h-5 w-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">Active Contacts</span>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">{metrics.contacts.activeCount} contacts</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="space-y-3">
                <Link
                  href="/dashboard/price-sheets/send"
                  className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-500 hover:bg-cyan-600"
                >
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Send Price Sheets
                </Link>
                <p className="text-xs text-gray-500 text-center">
                  Select saved price sheets and send to your contacts with automatic pricing optimization.
                </p>
              </div>
            </div>
          </div>

          {/* 3. USDA Market Pricing */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 p-3 bg-orange-100 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">USDA Market Pricing</h3>
                    <p className="text-sm text-gray-500">Real-time agricultural prices</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                    <span className="ml-2 text-sm text-gray-500">Loading data...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Your Crops:</span>
                      <span className="text-sm font-semibold text-orange-600">{metrics.crops.variations} variations</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Commodities:</span>
                      <span className="text-sm font-semibold text-orange-600">{metrics.crops.commodities} types</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="space-y-3">
                <Link
                  href="/dashboard/price-sheets/usda-pricing"
                  className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600"
                >
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  View Market Prices
                </Link>
                <p className="text-xs text-gray-500 text-center">
                  See current USDA market prices for all your crops with high, low, and mostly pricing data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Manage Your Data - Full Width Horizontal */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                  <Cog6ToothIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Manage Your Data</h3>
                  <p className="text-sm text-gray-500">Setup regions, crops & capabilities</p>
                </div>
              </div>
            </div>
            
            {/* Data Management Cards - Horizontal Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              {isLoading ? (
                <div className="col-span-full flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-500">Loading your data...</span>
                </div>
              ) : (
                <>
                  {/* Growing Regions */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                        <MapPinIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">Growing Regions</h4>
                        <p className="text-xs text-gray-500">Active growing regions</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      {metrics.regions.data.slice(0, 2).map((region, index) => (
                        <div key={index} className="flex items-center text-xs text-gray-600">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 flex-shrink-0"></div>
                          <span className="truncate">{region.name}</span>
                        </div>
                      ))}
                      {metrics.regions.data.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{metrics.regions.data.length - 2} more...
                        </div>
                      )}
                      {metrics.regions.data.length === 0 && (
                        <div className="text-xs text-gray-400 italic">No regions added yet</div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500 truncate">
                        {metrics.regions.lastUpdated 
                          ? `Updated ${new Date(metrics.regions.lastUpdated).toLocaleDateString()}`
                          : 'Not set up'
                        }
                      </span>
                      <Link
                        href="/dashboard/price-sheets/regions"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-black flex-shrink-0"
                      >
                        Manage
                        <ArrowRightIcon className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  </div>

                  {/* Commodities */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                        <SparklesIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">Commodities</h4>
                        <p className="text-xs text-gray-500">Crop varieties and seasons</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      {metrics.crops.organicCount > 0 && (
                        <div className="flex items-center text-xs text-gray-600">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 flex-shrink-0"></div>
                          <span className="truncate">{metrics.crops.organicCount} Organic varieties</span>
                        </div>
                      )}
                      {metrics.crops.conventionalCount > 0 && (
                        <div className="flex items-center text-xs text-gray-600">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 flex-shrink-0"></div>
                          <span className="truncate">{metrics.crops.conventionalCount} Conventional varieties</span>
                        </div>
                      )}
                      {metrics.crops.variations > 0 && (
                        <div className="flex items-center text-xs text-gray-600">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 flex-shrink-0"></div>
                          <span className="truncate">{metrics.crops.variations} total variations</span>
                        </div>
                      )}
                      {metrics.crops.variations === 0 && (
                        <div className="text-xs text-gray-400 italic">No crops added yet</div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500 truncate">
                        {metrics.crops.lastUpdated 
                          ? `Updated ${new Date(metrics.crops.lastUpdated).toLocaleDateString()}`
                          : 'Not set up'
                        }
                      </span>
                      <Link
                        href="/dashboard/price-sheets/crops"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-black flex-shrink-0"
                      >
                        Manage
                        <ArrowRightIcon className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  </div>

                  {/* Packaging */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                        <ArchiveBoxIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">Packaging</h4>
                        <p className="text-xs text-gray-500">Custom packaging types</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      {metrics.packaging.data.slice(0, 2).map((pkg, index) => (
                        <div key={index} className="flex items-center text-xs text-gray-600">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 flex-shrink-0"></div>
                          <span className="truncate">{pkg.name}</span>
                        </div>
                      ))}
                      {metrics.packaging.data.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{metrics.packaging.data.length - 2} more...
                        </div>
                      )}
                      {metrics.packaging.data.length === 0 && (
                        <div className="text-xs text-gray-400 italic">Using standard packaging</div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500 truncate">
                        {metrics.packaging.lastUpdated 
                          ? `Updated ${new Date(metrics.packaging.lastUpdated).toLocaleDateString()}`
                          : 'Standard only'
                        }
                      </span>
                      <Link
                        href="/dashboard/price-sheets/packaging"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-black flex-shrink-0"
                      >
                        Manage
                        <ArrowRightIcon className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                        <ShieldCheckIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">Certifications</h4>
                        <p className="text-xs text-gray-500">Quality certifications</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      {metrics.certifications.data.slice(0, 2).map((cert, index) => (
                        <div key={index} className="flex items-center text-xs text-gray-600">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 flex-shrink-0"></div>
                          <span className="truncate">{cert.name}</span>
                        </div>
                      ))}
                      {metrics.certifications.data.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{metrics.certifications.data.length - 2} more...
                        </div>
                      )}
                      {metrics.certifications.data.length === 0 && (
                        <div className="text-xs text-gray-400 italic">No certifications added</div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500 truncate">
                        {metrics.certifications.lastUpdated 
                          ? `Updated ${new Date(metrics.certifications.lastUpdated).toLocaleDateString()}`
                          : 'Not set up'
                        }
                      </span>
                      <Link
                        href="/dashboard/price-sheets/certifications"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-black flex-shrink-0"
                      >
                        Manage
                        <ArrowRightIcon className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>


    </>
  )
}