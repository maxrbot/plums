'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  PlusIcon,
  PaperAirplaneIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import PriceSheetPreviewModal from '@/components/modals/PriceSheetPreviewModal'
import PriceSheetDuplicateModal from '@/components/modals/PriceSheetDuplicateModal'
import { priceSheetsApi } from '@/lib/api'
import { useUser } from '@/contexts/UserContext'
import { formatProductsForPreview } from '@/lib/priceSheetUtils'

interface PriceSheet {
  _id: string
  title: string
  status: 'draft' | 'active' | 'archived'
  searchable?: boolean
  createdAt: string
  updatedAt: string
  lastSentAt?: string
  productsCount?: number
  productCount?: number // Support both field names
  productIds?: string[]
  recipientCount?: number
  sentTo?: string[] // Array of contact emails
  metadata?: {
    recipientCount?: number
    openRate?: number
  }
}

export default function PriceSheets() {
  const { user } = useUser()
  const [priceSheets, setPriceSheets] = useState<PriceSheet[]>([])
  const [filteredSheets, setFilteredSheets] = useState<PriceSheet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'draft' | 'sent' | 'archived'>('active')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest')
  
  // Preview modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewPriceSheet, setPreviewPriceSheet] = useState<any>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  
  // ProduceHunt summary
  const [phSummary, setPhSummary] = useState<{
    isLive: boolean
    totalProducts: number
    searchableSheets: { _id: string; title: string; productsCount: number; updatedAt: string }[]
    commodities: { commodity: string; count: number }[]
    products: {
      _id: string
      commodity: string
      variety?: string
      isOrganic: boolean
      packageType: string
      size?: string
      grade?: string
      price: number
      unit?: string
      regionName?: string
      priceSheetId: string
      priceSheetTitle: string
    }[]
    lastUpdated: string | null
  } | null>(null)
  const [showPhProducts, setShowPhProducts] = useState(false)

  // Duplicate modal state
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false)
  const [duplicatePriceSheet, setDuplicatePriceSheet] = useState<any>(null)
  const [isLoadingDuplicate, setIsLoadingDuplicate] = useState(false)
  const [currentSheetId, setCurrentSheetId] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)

  useEffect(() => {
    loadPriceSheets()
    loadPhSummary()
  }, [])

  const loadPhSummary = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/price-sheets/producehunt-summary`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      })
      if (res.ok) setPhSummary(await res.json())
    } catch { /* silent */ }
  }

  useEffect(() => {
    filterAndSortSheets()
  }, [priceSheets, searchQuery, statusFilter, sortBy])

  const loadPriceSheets = async () => {
    try {
      setIsLoading(true)
      const response = await priceSheetsApi.getAll()
      setPriceSheets(response.priceSheets || [])
    } catch (error) {
      console.error('Failed to load price sheets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortSheets = () => {
    let filtered = [...priceSheets]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(sheet =>
        sheet.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter === 'active') {
      // 'Active' means show everything EXCEPT archived (drafts, sent, active status)
      filtered = filtered.filter(sheet => sheet.status !== 'archived')
    } else {
      // Show specific status only (draft, sent, or archived)
      filtered = filtered.filter(sheet => sheet.status === statusFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    setFilteredSheets(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handlePreviewPriceSheet = async (sheetId: string) => {
    try {
      setIsLoadingPreview(true)
      
      // Get the price sheet details
      const sheetResponse = await priceSheetsApi.getById(sheetId)
      
      // Get the products
      const productsResponse = await priceSheetsApi.getProducts(sheetId)
      const products = productsResponse.products || []
      
      // Look up package and size names from user's packaging structure
      // (in case they were saved as IDs instead of names)
      const enrichedProducts = products.map((product: any) => {
        const packagingStructure = user?.packagingStructure?.[product.commodity]
        
        let packageTypeDisplay = product.packageType || ''
        let sizeDisplay = product.size || ''
        
        // If packageType looks like an ID (starts with pkg_), look it up
        if (packageTypeDisplay.startsWith('pkg_') && packagingStructure?.packageTypes) {
          const packageType = packagingStructure.packageTypes.find((pkg: any) => pkg.id === packageTypeDisplay)
          if (packageType) {
            packageTypeDisplay = packageType.name
          }
        }
        
        // If size looks like an ID (starts with size_), look it up
        if (sizeDisplay.startsWith('size_') && packagingStructure?.sizeGrades) {
          const sizeGrade = packagingStructure.sizeGrades.find((size: any) => size.id === sizeDisplay)
          if (sizeGrade) {
            sizeDisplay = sizeGrade.name
          }
        }
        
        return {
          ...product,
          packageType: packageTypeDisplay,
          size: sizeDisplay
        }
      })
      
      // Convert products to preview format using shared utility
      const previewProducts = formatProductsForPreview(enrichedProducts)
      
      setPreviewPriceSheet({
        title: sheetResponse.priceSheet.title || 'Untitled Price Sheet',
        products: previewProducts
      })
      setIsPreviewOpen(true)
    } catch (error) {
      console.error('Failed to load price sheet preview:', error)
      alert('Failed to load price sheet preview. Please try again.')
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const handleDuplicatePriceSheet = async (sheetId: string) => {
    try {
      setIsLoadingDuplicate(true)
      setCurrentSheetId(sheetId)
      setHasSaved(false)
      
      // Get the price sheet details
      const sheetResponse = await priceSheetsApi.getById(sheetId)
      
      // Get the products
      const productsResponse = await priceSheetsApi.getProducts(sheetId)
      const products = productsResponse.products || []
      
      // Store the original products with all their data for duplication
      // Convert products to duplicate format for display
      const duplicateProducts = products.map((product: any) => {
        const packagingStructure = user?.packagingStructure?.[product.commodity]
        
        let packageTypeDisplay = product.packageType || 'N/A'
        let sizeDisplay = product.size || ''
        
        // If packageType looks like an ID (starts with pkg_), look it up
        if (packageTypeDisplay.startsWith('pkg_') && packagingStructure?.packageTypes) {
          const packageType = packagingStructure.packageTypes.find((pkg: any) => pkg.id === packageTypeDisplay)
          if (packageType) {
            packageTypeDisplay = packageType.name
          }
        }
        
        // If size looks like an ID (starts with size_), look it up
        if (sizeDisplay.startsWith('size_') && packagingStructure?.sizeGrades) {
          const sizeGrade = packagingStructure.sizeGrades.find((size: any) => size.id === sizeDisplay)
          if (sizeGrade) {
            sizeDisplay = sizeGrade.name
          }
        }
        
        return {
          id: product._id,
          productName: product.productName || `${product.commodity || ''} ${product.variety || ''}`.trim() || 'Unknown Product',
          commodity: product.commodity,
          variety: product.variety,
          subtype: product.subtype,
          region: product.regionName || 'N/A',
          packageType: packageTypeDisplay,
          size: sizeDisplay,
          countSize: product.countSize,
          grade: product.grade,
          price: product.price,
          availability: product.availability || 'In Stock',
          isOrganic: product.isOrganic || false,
          isStickered: product.isStickered || false,
          specialNotes: product.specialNotes,
          hasOverride: product.hasOverride || false,
          overrideComment: product.overrideComment,
          // Store original product data for API call
          _originalData: product
        }
      })
      
      setDuplicatePriceSheet({
        title: sheetResponse.priceSheet.title || 'Untitled Price Sheet',
        products: duplicateProducts
      })
      setIsDuplicateOpen(true)
    } catch (error) {
      console.error('Failed to load price sheet for duplication:', error)
      alert('Failed to load price sheet. Please try again.')
    } finally {
      setIsLoadingDuplicate(false)
    }
  }

  const handleSaveDuplicate = async (updatedData: { title: string; products: any[] }) => {
    try {
      setIsSaving(true)
      
      // Prepare the data for the API
      const priceSheetData = {
        title: updatedData.title,
        status: 'draft' as const,
        notes: ''
      }
      
      // Map products to the format expected by the API, preserving original data
      const productsData = updatedData.products.map(product => {
        const original = product._originalData || {}
        return {
          // Use original data structure but override with updated fields
          ...original,
          price: product.price,
          grade: product.grade,
          availability: product.availability,
          hasOverride: product.hasOverride || false,
          overrideComment: product.overrideComment,
          // Remove fields that shouldn't be copied
          _id: undefined,
          priceSheetId: undefined,
          createdAt: undefined,
          updatedAt: undefined
        }
      })
      
      // Create the duplicate price sheet
      await priceSheetsApi.create({
        priceSheet: priceSheetData,
        products: productsData
      })
      
      setHasSaved(true)
      
      // Reload the price sheets list to show new duplicate
      await loadPriceSheets()
      
      // Auto-close after a brief delay
      setTimeout(() => {
        setIsDuplicateOpen(false)
        setDuplicatePriceSheet(null)
        setHasSaved(false)
      }, 1500)
    } catch (error) {
      console.error('Failed to duplicate price sheet:', error)
      alert('Failed to create duplicate. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleSearchable = async (sheetId: string, currentSearchable: boolean) => {
    const next = !currentSearchable
    // Optimistic update
    setPriceSheets(prev => prev.map(s => s._id === sheetId ? { ...s, searchable: next } : s))
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/price-sheets/${sheetId}/searchable`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ searchable: next })
      })
      loadPhSummary()
    } catch {
      // Revert on failure
      setPriceSheets(prev => prev.map(s => s._id === sheetId ? { ...s, searchable: currentSearchable } : s))
    }
  }

  const handleArchivePriceSheet = async (sheetId: string, currentStatus: string) => {
    const shouldArchive = currentStatus !== 'archived'
    const actionText = shouldArchive ? 'archive' : 'restore'
    
    if (!confirm(`Are you sure you want to ${actionText} this price sheet?`)) {
      return
    }
    
    try {
      console.log('Attempting to archive:', { sheetId, shouldArchive, actionText })
      const result = await priceSheetsApi.archive(sheetId, shouldArchive)
      console.log('Archive result:', result)
      // Refresh the list
      await loadPriceSheets()
      alert(`Price sheet ${actionText}d successfully!`)
    } catch (error) {
      console.error(`Failed to ${actionText} price sheet:`, error)
      alert(`Failed to ${actionText} price sheet: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Price Sheets</h1>
          <p className="mt-2 text-gray-600">View and manage all your saved price sheets.</p>
        </div>
      </div>

      {/* ProduceHunt Panel */}
      {(user as any)?.integrations?.producehunt && phSummary && (
        <div className={`rounded-lg border p-5 mb-6 ${phSummary.isLive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg">🥬</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">ProduceHunt</span>
                  {phSummary.isLive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Live
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                      Not live
                    </span>
                  )}
                </div>
                {phSummary.isLive ? (
                  <p className="text-sm text-gray-600 mt-0.5">
                    <span className="font-semibold text-gray-900">{phSummary.totalProducts}</span> {phSummary.totalProducts === 1 ? 'product' : 'products'} visible across{' '}
                    <span className="font-semibold text-gray-900">{phSummary.searchableSheets.length}</span> {phSummary.searchableSheets.length === 1 ? 'sheet' : 'sheets'}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-0.5">Toggle a price sheet as searchable to go live</p>
                )}
              </div>
            </div>

            {phSummary.isLive && phSummary.commodities.length > 0 && (
              <a
                href={`http://localhost:3002/?q=${encodeURIComponent(phSummary.commodities[0].commodity)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-xs font-medium text-green-700 hover:text-green-900 underline underline-offset-2 whitespace-nowrap"
              >
                Search ProduceHunt →
              </a>
            )}
          </div>

          {phSummary.isLive && (
            <div className="mt-4 space-y-3">
              {/* Commodity breakdown */}
              <div className="flex flex-wrap gap-2">
                {phSummary.commodities.map(({ commodity, count }) => (
                  <span
                    key={commodity}
                    className="inline-flex items-center gap-1 text-xs bg-white border border-green-200 text-gray-700 px-2.5 py-1 rounded-full"
                  >
                    <span className="capitalize font-medium">{commodity}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500">{count}</span>
                  </span>
                ))}
              </div>

              {/* Searchable sheets + view products */}
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-green-100">
                <div className="flex flex-wrap gap-2">
                  {phSummary.searchableSheets.map(sheet => (
                    <span
                      key={sheet._id}
                      className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-green-200 px-2.5 py-1 rounded-full"
                    >
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                      {sheet.title}
                      <span className="text-gray-400">{sheet.productsCount}p</span>
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setShowPhProducts(true)}
                  className="shrink-0 text-xs font-medium text-green-700 hover:text-green-900 underline underline-offset-2 whitespace-nowrap"
                >
                  View all products →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Price Sheets Library */}
      <div>
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search price sheets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-lime-500 focus:border-lime-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm rounded-md"
              >
                <option value="active">Active (All non-archived)</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm rounded-md"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredSheets.length} of {priceSheets.length} price sheets
          </p>
        </div>

        {/* Price Sheets Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
          </div>
        ) : filteredSheets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No price sheets found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || statusFilter !== 'active'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating a new price sheet'}
            </p>
            {!searchQuery && statusFilter === 'active' && (
              <div className="mt-6">
                <Link
                  href="/dashboard/price-sheets/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-lime-600 hover:bg-lime-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create New Sheet
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSheets.map((sheet) => (
              <div
                key={sheet._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-lime-500 transition-all duration-200"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {sheet.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sheet.status)}`}>
                          {sheet.status.charAt(0).toUpperCase() + sheet.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-600">
                          • {sheet.productsCount || sheet.productCount || 0} products
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Created {formatDate(sheet.createdAt)}
                    </div>
                    {sheet.lastSentAt && (
                      <div className="flex items-center text-sm text-gray-600">
                        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                        Last sent {formatDate(sheet.lastSentAt)}
                      </div>
                    )}
                    {(sheet.recipientCount ?? 0) > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <UserGroupIcon className="h-4 w-4 mr-2" />
                        Sent to {sheet.recipientCount} {sheet.recipientCount === 1 ? 'contact' : 'contacts'}
                      </div>
                    )}
                  </div>

                  {/* ProduceHunt searchability toggle */}
                  {(user as any)?.integrations?.producehunt && (
                    <div className="flex items-center justify-between py-2 mb-3 border-t border-gray-100">
                      <div className="flex items-center space-x-1.5">
                        <MagnifyingGlassIcon className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">ProduceHunt searchable</span>
                      </div>
                      <button
                        onClick={() => handleToggleSearchable(sheet._id, !!sheet.searchable)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${sheet.searchable ? 'bg-green-500' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${sheet.searchable ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handlePreviewPriceSheet(sheet._id)}
                      disabled={isLoadingPreview}
                      className="inline-flex items-center justify-center px-2 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      title="Preview"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicatePriceSheet(sheet._id)}
                      disabled={isLoadingDuplicate}
                      className="inline-flex items-center justify-center px-2 py-2 border border-blue-300 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50"
                      title="Duplicate"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/dashboard/price-sheets/send?sheetId=${sheet._id}`}
                      className="inline-flex items-center justify-center px-2 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-lime-600 hover:bg-lime-700"
                      title="Send"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />
                    </Link>
                  </div>
                    {/* Archive Button */}
                    <button
                      onClick={() => handleArchivePriceSheet(sheet._id, sheet.status)}
                      className={`w-full inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md ${
                        sheet.status === 'archived'
                          ? 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-300'
                          : 'text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300'
                      }`}
                      title={sheet.status === 'archived' ? 'Restore' : 'Archive'}
                    >
                      <ArchiveBoxIcon className="h-4 w-4 mr-1" />
                      {sheet.status === 'archived' ? 'Restore' : 'Archive'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && previewPriceSheet && (
        <PriceSheetPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false)
            setPreviewPriceSheet(null)
          }}
          title={previewPriceSheet.title}
          products={previewPriceSheet.products}
          userEmail={user?.profile?.email || user?.email}
          userPhone={user?.profile?.phone}
        />
      )}

      {/* ProduceHunt Live Products Modal */}
      {showPhProducts && phSummary?.products && (
        (() => {
          type LiveProduct = typeof phSummary.products[0]

          // Conflict detection: commodity+variety+organic+packageType+size+grade at different prices across sheets
          const priceKey = (p: LiveProduct) =>
            `${p.commodity}|${p.variety || ''}|${p.isOrganic}|${p.packageType}|${p.size || ''}|${p.grade || ''}`.toLowerCase()

          const priceGroups = new Map<string, Set<number>>()
          phSummary.products.forEach(p => {
            const key = priceKey(p)
            if (!priceGroups.has(key)) priceGroups.set(key, new Set())
            if (p.price != null) priceGroups.get(key)!.add(p.price)
          })
          const isConflict = (p: LiveProduct) => (priceGroups.get(priceKey(p))?.size ?? 0) > 1
          const conflictCount = [...priceGroups.values()].filter(prices => prices.size > 1).length

          // Group by commodity label (includes organic distinction)
          const grouped = phSummary.products.reduce((acc, p) => {
            const label = `${p.commodity.charAt(0).toUpperCase() + p.commodity.slice(1)}${p.isOrganic ? ' (Organic)' : ''}`
            if (!acc[label]) acc[label] = []
            acc[label].push(p)
            return acc
          }, {} as Record<string, LiveProduct[]>)

          // Sort each group by variety → packageType → size
          Object.values(grouped).forEach(rows =>
            rows.sort((a, b) =>
              (a.variety || '').localeCompare(b.variety || '') ||
              (a.packageType || '').localeCompare(b.packageType || '') ||
              (a.size || '').localeCompare(b.size || '')
            )
          )

          return (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowPhProducts(false)}
            >
              <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Live in ProduceHunt</h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {phSummary.totalProducts} {phSummary.totalProducts === 1 ? 'product' : 'products'} · {phSummary.searchableSheets.length} {phSummary.searchableSheets.length === 1 ? 'sheet' : 'sheets'}
                      </p>
                    </div>
                    {conflictCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-200">
                        ⚠️ {conflictCount} pricing {conflictCount === 1 ? 'conflict' : 'conflicts'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowPhProducts(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-4"
                  >
                    ✕
                  </button>
                </div>

                {/* Framed document */}
                <div className="overflow-auto flex-1 bg-gray-50 px-6 py-5">
                  <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    {Object.entries(grouped).map(([commodityLabel, rows], idx) => {
                      const hasConflictInGroup = rows.some(isConflict)
                      return (
                        <div key={commodityLabel} className={idx > 0 ? 'border-t border-gray-200' : ''}>
                          {/* Commodity header */}
                          <div className={`flex items-center justify-between px-4 py-2.5 border-b border-gray-100 ${hasConflictInGroup ? 'bg-amber-50' : 'bg-gray-50'}`}>
                            <h3 className="text-sm font-semibold text-gray-900">{commodityLabel}</h3>
                            {hasConflictInGroup && (
                              <span className="text-xs text-amber-700 font-medium">pricing conflict</span>
                            )}
                          </div>

                          {/* Products table */}
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-xs">
                              <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/60">
                                  <th className="px-4 py-2 text-left font-medium text-gray-400 uppercase tracking-wide">Variety</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-400 uppercase tracking-wide">Package</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-400 uppercase tracking-wide">Size</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-400 uppercase tracking-wide">Grade</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-400 uppercase tracking-wide">Region</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-400 uppercase tracking-wide">Sheet</th>
                                  <th className="px-4 py-2 text-right font-medium text-gray-400 uppercase tracking-wide">Price</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {rows.map(p => {
                                  const conflict = isConflict(p)
                                  return (
                                    <tr key={p._id} className={conflict ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                                      <td className="px-4 py-2.5 font-medium text-gray-900">
                                        <div className="flex items-center gap-1">
                                          {conflict && <span title="Price conflict" className="text-amber-500">⚠</span>}
                                          {p.variety || <span className="text-gray-400">—</span>}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2.5 text-gray-600">{p.packageType || '—'}</td>
                                      <td className="px-4 py-2.5 text-gray-600">{p.size || '—'}</td>
                                      <td className="px-4 py-2.5 text-gray-600">{p.grade || '—'}</td>
                                      <td className="px-4 py-2.5 text-gray-400">{p.regionName || '—'}</td>
                                      <td className="px-4 py-2.5">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 whitespace-nowrap">
                                          {p.priceSheetTitle}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2.5 text-right">
                                        {p.price != null && p.price > 0 ? (
                                          <span className={`font-bold ${conflict ? 'text-amber-700' : 'text-gray-900'}`}>
                                            ${p.price.toFixed(2)}{p.unit ? `/${p.unit}` : ''}
                                          </span>
                                        ) : (
                                          <span className="text-gray-400">—</span>
                                        )}
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  {conflictCount > 0 ? (
                    <p className="text-xs text-amber-700">
                      Conflicting rows share the same variety, package, size and grade but have different prices across sheets.
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">All products have consistent pricing across sheets.</p>
                  )}
                  <button
                    onClick={() => setShowPhProducts(false)}
                    className="ml-4 shrink-0 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )
        })()
      )}

      {/* Duplicate Modal */}
      {isDuplicateOpen && duplicatePriceSheet && (
        <PriceSheetDuplicateModal
          isOpen={isDuplicateOpen}
          onClose={() => {
            setIsDuplicateOpen(false)
            setDuplicatePriceSheet(null)
            setHasSaved(false)
          }}
          title={duplicatePriceSheet.title}
          products={duplicatePriceSheet.products}
          onDuplicate={handleSaveDuplicate}
          isSaving={isSaving}
          hasSaved={hasSaved}
        />
      )}
    </>
  )
}