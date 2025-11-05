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
import { Breadcrumbs } from '@/components/ui'
import PriceSheetPreviewModal from '@/components/modals/PriceSheetPreviewModal'
import PriceSheetDuplicateModal from '@/components/modals/PriceSheetDuplicateModal'
import { priceSheetsApi } from '@/lib/api'

interface PriceSheet {
  _id: string
  title: string
  status: 'draft' | 'active' | 'archived'
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

export default function PriceSheetsLibrary() {
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
  
  // Duplicate modal state
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false)
  const [duplicatePriceSheet, setDuplicatePriceSheet] = useState<any>(null)
  const [isLoadingDuplicate, setIsLoadingDuplicate] = useState(false)
  const [currentSheetId, setCurrentSheetId] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)

  useEffect(() => {
    loadPriceSheets()
  }, [])

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
      
      console.log('Raw products from API:', products)
      console.log('First product price field:', products[0]?.price)
      console.log('First product all price-related fields:', {
        price: products[0]?.price,
        basePrice: products[0]?.basePrice,
        adjustedPrice: products[0]?.adjustedPrice,
        pricePerUnit: products[0]?.pricePerUnit
      })
      
      // Convert products to preview format
      const previewProducts = products.map((product: any) => ({
        id: product._id,
        productName: product.productName || `${product.commodity || ''} ${product.variety || ''}`.trim() || 'Unknown Product',
        commodity: product.commodity,
        variety: product.variety,
        subtype: product.subtype,
        region: product.regionName || 'N/A',
        packageType: product.packageType || 'N/A',
        countSize: product.countSize,
        grade: product.grade,
        basePrice: product.price,
        adjustedPrice: product.price, // For library preview, base = adjusted (no contact-specific pricing)
        availability: product.availability || 'In Stock',
        showStrikethrough: false, // No strikethrough in library view
        isOrganic: product.isOrganic || false
      }))
      
      console.log('Formatted preview products:', previewProducts)
      
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
      const duplicateProducts = products.map((product: any) => ({
        id: product._id,
        productName: product.productName || `${product.commodity || ''} ${product.variety || ''}`.trim() || 'Unknown Product',
        region: product.regionName || 'N/A',
        packageType: product.packageType || 'N/A',
        countSize: product.countSize,
        grade: product.grade,
        price: product.price,
        availability: product.availability || 'In Stock',
        isOrganic: product.isOrganic || false,
        // Store original product data for API call
        _originalData: product
      }))
      
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
          // Use original data structure but override with updated price
          ...original,
          price: product.price || 0,
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
      {/* Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: 'Price Sheets', href: '/dashboard/price-sheets' },
          { label: 'Library', current: true }
        ]} 
        className="mb-4"
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Created Price Sheets</h1>
            <p className="text-gray-600">View and manage all your price sheets</p>
          </div>
          <Link
            href="/dashboard/price-sheets/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-lime-600 hover:bg-lime-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Sheet
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
        />
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

