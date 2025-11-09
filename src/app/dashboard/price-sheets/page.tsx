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
          <p className="mt-2 text-gray-600">Create professional price sheets and send them to your contacts.</p>
        </div>
      </div>

      {/* Main Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Send Price Sheet - Primary Action */}
        <Link
          href="/dashboard/price-sheets/send"
          className="group relative bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg p-6 text-center transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
        >
          {/* Subtle animated background pattern */}
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
          
          <div className="relative flex flex-col items-center space-y-3">
            <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full group-hover:bg-blue-400 group-hover:bg-opacity-40 transition-all ring-2 ring-white ring-opacity-30">
              <PaperAirplaneIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Send Price Sheet</h3>
              <p className="text-sm text-blue-100">Share with your buyers</p>
            </div>
            {metrics.priceSheets.count > 0 && (
              <div className="absolute top-2 right-2 bg-blue-400 bg-opacity-40 px-2.5 py-1 rounded-full ring-1 ring-white ring-opacity-40">
                <span className="text-xs font-bold text-white">{metrics.priceSheets.count} ready</span>
              </div>
            )}
          </div>
        </Link>

        {/* Price Sheet Library - Secondary */}
        <Link
          href="/dashboard/price-sheets/library"
          className="group bg-white border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 rounded-lg p-6 text-center transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-orange-100 rounded-full group-hover:bg-orange-200 transition-all">
              <ArchiveBoxIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Price Sheet Library</h3>
              <p className="text-sm text-gray-600">View & manage sheets</p>
            </div>
          </div>
        </Link>

        {/* Generate New Sheet - Secondary */}
        <Link
          href="/dashboard/price-sheets/new"
          className="group bg-white border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 rounded-lg p-6 text-center transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-all">
              <PlusIcon className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Generate New Sheet</h3>
              <p className="text-sm text-gray-600">Create from scratch</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Simple Metrics Bar */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            {isLoading ? (
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-sm">Loading metrics...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Commodities:</span>
                  <span className="text-sm font-semibold text-gray-900">{metrics.crops.commodities}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Products:</span>
                  <span className="text-sm font-semibold text-gray-900">{metrics.crops.variations}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Saved Sheets:</span>
                  <span className="text-sm font-semibold text-gray-900">{metrics.priceSheets.count}</span>
                </div>
              </>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Data Management - Now Collapsible */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 p-3 bg-gray-100 rounded-lg">
                  <Cog6ToothIcon className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Manage Your Data</h3>
                  <p className="text-sm text-gray-500">Setup and manage your shipping points, crops, and capabilities</p>
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
                  {/* Shipping Points */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                        <MapPinIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">Shipping Points</h4>
                        <p className="text-xs text-gray-500">Active shipping points</p>
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

                  {/* Commodity Structure */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                        <ArchiveBoxIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">Commodity Structure</h4>
                        <p className="text-xs text-gray-500">Processing & packaging options</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      <div className="text-xs text-gray-600">
                        View detailed breakdown of processing, packaging, and sizing specifications for all supported commodities.
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500 truncate">
                        Variety-specific differences
                      </span>
                      <Link
                        href="/dashboard/price-sheets/packaging"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-black flex-shrink-0"
                      >
                        View
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