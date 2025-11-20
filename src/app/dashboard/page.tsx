"use client"

import Link from 'next/link'
import { 
  CheckCircleIcon,
  ArrowRightIcon,
  PaperAirplaneIcon,
  Cog6ToothIcon,
  MapPinIcon,
  SparklesIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline'
import { useUserName, useUser } from '@/contexts/UserContext'
import { useState, useEffect } from 'react'
import { regionsApi, cropsApi, contactsApi, certificationsApi, packagingApi } from '@/lib/api'

export default function Dashboard() {
  const userName = useUserName()
  const { user } = useUser()
  
  // Real setup progress based on actual user data
  const [setupProgress, setSetupProgress] = useState({
    shippingPoints: false,
    products: false,
    packaging: false,
    contacts: false
  })
  const [regionsCount, setRegionsCount] = useState(0)
  const [productsCount, setProductsCount] = useState(0)
  const [packagingCount, setPackagingCount] = useState(0)
  const [contactsCount, setContactsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // Additional metrics for "Manage Your Data" section
  const [metrics, setMetrics] = useState({
    regions: { count: 0, data: [] as any[], lastUpdated: undefined as string | undefined },
    crops: { count: 0, commodities: 0, variations: 0, organicCount: 0, conventionalCount: 0, data: [] as any[], lastUpdated: undefined as string | undefined },
    certifications: { count: 0, data: [] as any[], lastUpdated: undefined as string | undefined },
    packaging: { count: 0, packageTypes: 0, sizeGrades: 0, data: {} as any, lastUpdated: undefined as string | undefined }
  })

  // Load actual setup progress from APIs
  useEffect(() => {
    const loadSetupProgress = async () => {
      try {
        setLoading(true)
        
        // Check if user has shipping points, products, contacts, certifications, and packaging
        const [regionsResponse, cropsResponse, contactsResponse, certificationsResponse, packagingResponse] = await Promise.all([
          regionsApi.getAll(),
          cropsApi.getAll(),
          contactsApi.getAll(),
          certificationsApi.getAll().catch(() => ({ certifications: [] })),
          packagingApi.getAll().catch(() => ({ packaging: [] }))
        ])
        
        const regions = regionsResponse.regions || []
        const crops = cropsResponse.crops || []
        const contacts = contactsResponse.contacts || []
        const certifications = certificationsResponse.certifications || []
        const packaging = packagingResponse.packaging || []
        
        const regionCount = regions.length
        const hasRegions = regionCount > 0
        
        const cropCount = crops.length
        const hasCrops = cropCount > 0
        
        // Check if user has packaging structure defined (stored in user profile)
        const packagingStructure = user?.packagingStructure || {}
        const commoditiesWithPackaging = Object.keys(packagingStructure)
        
        // Calculate packaging structure metrics
        const totalPackageTypes = commoditiesWithPackaging.reduce((sum, commodity) => {
          return sum + (packagingStructure[commodity]?.packageTypes?.length || 0)
        }, 0)
        const totalSizeGrades = commoditiesWithPackaging.reduce((sum, commodity) => {
          return sum + (packagingStructure[commodity]?.sizeGrades?.length || 0)
        }, 0)
        
        // Count commodities that have BOTH package types AND size grades
        const commoditiesWithCompletePackaging = commoditiesWithPackaging.filter(commodity => {
          const hasPackageTypes = (packagingStructure[commodity]?.packageTypes?.length || 0) > 0
          const hasSizeGrades = (packagingStructure[commodity]?.sizeGrades?.length || 0) > 0
          return hasPackageTypes && hasSizeGrades
        }).length
        
        const hasPackaging = commoditiesWithCompletePackaging > 0
        const packagingSetupCount = commoditiesWithCompletePackaging
        
        const contactCount = contacts.length
        const hasContacts = contactCount > 0
        
        // Calculate crop metrics
        const totalVariations = crops.reduce((sum: number, crop: any) => sum + (crop.variations?.length || 0), 0)
        const organicCount = crops.reduce((sum: number, crop: any) => 
          sum + (crop.variations?.filter((v: any) => v.isOrganic).length || 0), 0)
        const conventionalCount = crops.reduce((sum: number, crop: any) => 
          sum + (crop.variations?.filter((v: any) => !v.isOrganic).length || 0), 0)
        const uniqueCommodities = new Set(crops.map((crop: any) => crop.commodity)).size
        
        setRegionsCount(regionCount)
        setProductsCount(cropCount)
        setPackagingCount(packagingSetupCount)
        setContactsCount(contactCount)
        setSetupProgress({
          shippingPoints: hasRegions,
          products: hasCrops,
          packaging: hasPackaging,
          contacts: hasContacts
        })
        
        // Set metrics for "Manage Your Data" section
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
            count: commoditiesWithPackaging.length,
            packageTypes: totalPackageTypes,
            sizeGrades: totalSizeGrades,
            data: packagingStructure,
            lastUpdated: user?.updatedAt
          }
        })
        
      } catch (error) {
        console.error('Failed to load setup progress:', error)
        // Keep default false values on error
      } finally {
        setLoading(false)
      }
    }

    loadSetupProgress()
  }, [])

  const completedSteps = Object.values(setupProgress).filter(Boolean).length
  const totalSteps = Object.keys(setupProgress).length
  const progressPercentage = loading ? 0 : Math.round((completedSteps / totalSteps) * 100)

  return (
    <>
      {/* Welcome & Progress Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userName}!</h1>
        <p className="mt-2 text-gray-600">Here&apos;s what&apos;s next to get your farm online.</p>
      </div>

      {/* Progress Hero Section */}
      <div className="bg-gradient-to-r from-lime-50 to-cyan-50 border border-lime-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Setup Progress - {loading ? 'Loading...' : `${progressPercentage}% Complete`}
            </h2>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Step 1: Add Shipping Points */}
          <div className={`p-4 rounded-lg border-2 ${setupProgress.shippingPoints ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-white'}`}>
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${setupProgress.shippingPoints ? 'bg-green-500' : 'bg-gray-300'}`}>
                {setupProgress.shippingPoints ? (
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-semibold">1</span>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Shipping Points</h3>
                <p className="text-sm text-gray-600">Where you ship from</p>
              </div>
            </div>
            {loading ? (
              <div className="text-sm text-gray-500">Checking...</div>
            ) : setupProgress.shippingPoints ? (
              <div className="text-sm text-green-700 font-medium">
                ✅ {regionsCount} point{regionsCount !== 1 ? 's' : ''} added
              </div>
            ) : (
              <Link href="/dashboard/price-sheets/regions" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Get Started →
              </Link>
            )}
          </div>

          {/* Step 2: Add Products */}
          <div className={`p-4 rounded-lg border-2 ${setupProgress.products ? 'border-green-300 bg-green-50' : setupProgress.shippingPoints ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${setupProgress.products ? 'bg-green-500' : setupProgress.shippingPoints ? 'bg-blue-500' : 'bg-gray-300'}`}>
                {setupProgress.products ? (
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-semibold">2</span>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Commodities</h3>
                <p className="text-sm text-gray-600">Crops & varieties</p>
              </div>
            </div>
            {loading ? (
              <div className="text-sm text-gray-500">Checking...</div>
            ) : setupProgress.products ? (
              <div className="text-sm text-green-700 font-medium">
                ✅ {productsCount} commodit{productsCount !== 1 ? 'ies' : 'y'} added
              </div>
            ) : setupProgress.shippingPoints ? (
              <Link href="/dashboard/price-sheets/crops" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Add Products →
              </Link>
            ) : (
              <div className="text-sm text-gray-500">Add shipping points first</div>
            )}
          </div>

          {/* Step 3: Setup Packaging */}
          <div className={`p-4 rounded-lg border-2 ${setupProgress.packaging ? 'border-green-300 bg-green-50' : setupProgress.products ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${setupProgress.packaging ? 'bg-green-500' : setupProgress.products ? 'bg-blue-500' : 'bg-gray-300'}`}>
                {setupProgress.packaging ? (
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-semibold">3</span>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Packaging</h3>
                <p className="text-sm text-gray-600">Package types & sizes</p>
              </div>
            </div>
            {loading ? (
              <div className="text-sm text-gray-500">Checking...</div>
            ) : setupProgress.packaging ? (
              <div className="text-sm text-green-700 font-medium">
                ✅ {packagingCount} setup{packagingCount !== 1 ? 's' : ''} added
              </div>
            ) : setupProgress.products ? (
              <Link href="/dashboard/price-sheets/packaging-structure" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Setup Packaging →
              </Link>
            ) : (
              <div className="text-sm text-gray-500">Add products first</div>
            )}
          </div>

          {/* Step 4: Setup Contacts */}
          <div className={`p-4 rounded-lg border-2 ${setupProgress.contacts ? 'border-green-300 bg-green-50' : setupProgress.packaging ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${setupProgress.contacts ? 'bg-green-500' : setupProgress.packaging ? 'bg-blue-500' : 'bg-gray-300'}`}>
                {setupProgress.contacts ? (
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-semibold">4</span>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Contacts</h3>
                <p className="text-sm text-gray-600">Buyers & prospects</p>
              </div>
            </div>
            {loading ? (
              <div className="text-sm text-gray-500">Checking...</div>
            ) : setupProgress.contacts ? (
              <div className="text-sm text-green-700 font-medium">
                ✅ {contactsCount} contact{contactsCount !== 1 ? 's' : ''} added
              </div>
            ) : setupProgress.packaging ? (
              <Link href="/dashboard/contacts" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Add Contacts →
              </Link>
            ) : (
              <div className="text-sm text-gray-500">Setup packaging first</div>
            )}
          </div>
        </div>

        {/* Next Action or Ready to Send */}
        {!setupProgress.shippingPoints && (
          <div className="bg-white rounded-lg p-4 border border-lime-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">🎯 Next: Add shipping points</h3>
                <p className="text-sm text-gray-600 mt-1">Tell us where your products ship from</p>
              </div>
              <Link 
                href="/dashboard/price-sheets/regions"
                className="inline-flex items-center px-4 py-2 bg-lime-600 text-white text-sm font-medium rounded-md hover:bg-lime-700"
              >
                Add Shipping Points
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
        {setupProgress.shippingPoints && !setupProgress.products && (
          <div className="bg-white rounded-lg p-4 border border-lime-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">🎯 Next: Add your products</h3>
                <p className="text-sm text-gray-600 mt-1">Add the crops and varieties you grow</p>
              </div>
              <Link 
                href="/dashboard/price-sheets/crops"
                className="inline-flex items-center px-4 py-2 bg-lime-600 text-white text-sm font-medium rounded-md hover:bg-lime-700"
              >
                Add Products
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
        {setupProgress.shippingPoints && setupProgress.products && !setupProgress.packaging && (
          <div className="bg-white rounded-lg p-4 border border-lime-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">🎯 Next: Setup packaging</h3>
                <p className="text-sm text-gray-600 mt-1">Define package types and size grades for your products</p>
              </div>
              <Link 
                href="/dashboard/price-sheets/packaging-structure"
                className="inline-flex items-center px-4 py-2 bg-lime-600 text-white text-sm font-medium rounded-md hover:bg-lime-700"
              >
                Setup Packaging
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
        {setupProgress.shippingPoints && setupProgress.products && setupProgress.packaging && !setupProgress.contacts && (
          <div className="bg-white rounded-lg p-4 border border-lime-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">🎯 Next: Add your contacts</h3>
                <p className="text-sm text-gray-600 mt-1">Add buyers and prospect buyers to send price sheets to</p>
              </div>
              <Link 
                href="/dashboard/contacts"
                className="inline-flex items-center px-4 py-2 bg-lime-600 text-white text-sm font-medium rounded-md hover:bg-lime-700"
              >
                Add Contacts
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
        {setupProgress.shippingPoints && setupProgress.products && setupProgress.packaging && setupProgress.contacts && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">🎉 You&apos;re all set!</h3>
                <p className="text-sm text-gray-600 mt-1">Ready to create and send price sheets</p>
              </div>
              <Link 
                href="/dashboard/price-sheets"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white text-base font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 shadow-lg transform hover:scale-105 transition-all"
              >
                <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                Send Price Sheet
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Manage Your Data Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {loading ? (
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
                    {metrics.regions.data.slice(0, 2).map((region: any, index: number) => (
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

                {/* Packaging Structure */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                      <ArchiveBoxIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">Packaging Structure</h4>
                      <p className="text-xs text-gray-500">Package types & size grades</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    {metrics.packaging.count > 0 ? (
                      <>
                        <div className="flex items-center text-xs text-gray-600">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 flex-shrink-0"></div>
                          <span className="truncate">{metrics.packaging.count} commodit{metrics.packaging.count !== 1 ? 'ies' : 'y'} configured</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 flex-shrink-0"></div>
                          <span className="truncate">{metrics.packaging.packageTypes} package type{metrics.packaging.packageTypes !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 flex-shrink-0"></div>
                          <span className="truncate">{metrics.packaging.sizeGrades} size grade{metrics.packaging.sizeGrades !== 1 ? 's' : ''}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-gray-400 italic">No packaging structure defined</div>
                    )}
                    <div className="text-xs text-gray-600 mt-2">
                      Define custom package types and size grades for your commodities.
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500 truncate">
                      {metrics.packaging.lastUpdated 
                        ? `Updated ${new Date(metrics.packaging.lastUpdated).toLocaleDateString()}`
                        : 'Not set up'
                      }
                    </span>
                    <Link
                      href="/dashboard/price-sheets/packaging-structure"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-black flex-shrink-0"
                    >
                      Setup
                      <ArrowRightIcon className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}