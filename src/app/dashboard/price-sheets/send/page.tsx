"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  EyeIcon,
  CheckIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  RectangleGroupIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'
import PriceSheetPreviewModal from '../../../../components/modals/PriceSheetPreviewModal'
import { Contact } from '../../../../types'
import { priceSheetsApi, contactsApi, contactBatchesApi } from '../../../../lib/api'
import { useUser } from '../../../../contexts/UserContext'
import { formatProductForPreview, formatProductsForPreview } from '../../../../lib/priceSheetUtils'

// Interfaces for real data
interface PriceSheet {
  _id: string
  title: string
  status: 'draft' | 'sent' | 'archived'
  productIds: string[] // Array of PriceSheetProduct IDs
  productsCount: number
  totalValue?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

interface PriceSheetProduct {
  _id: string
  priceSheetId: string
  
  // References (for data integrity)
  cropId: string
  variationId: string
  regionId?: string
  
  // Denormalized product details (for performance)
  productName?: string // e.g., "Organic Lime Key Lime"
  category?: string // e.g., "citrus"
  commodity?: string // e.g., "lime"
  variety?: string // e.g., "Key Lime"
  subtype?: string // e.g., "Conventional" or "Organic"
  isOrganic?: boolean
  regionName?: string // e.g., "Central Valley - Fresno"
  
  // Pricing and packaging
  packageType: string
  size?: string
  countSize?: string
  grade?: string
  price: number | null
  marketPrice?: number
  marketPriceUnit?: string
  marketPriceDate?: string
  availability: string
  isSelected: boolean
  customNote?: string
  discountPercent?: number
  
  // Extended options (from expanded options section)
  isStickered?: boolean
  specialNotes?: string
  hasOverride?: boolean
  overrideComment?: string
  
  createdAt: string
  updatedAt: string
}

interface ContactBatch {
  id: string
  name: string
  contactIds: string[]
}

// Utility function for relative time
const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Created just now'
  if (diffInMinutes < 60) return `Created ${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `Created ${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `Created ${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
  
  return `Created on ${date.toLocaleDateString()}`
}

// Removed: convertToPreviewFormat - now using shared utility from priceSheetUtils

export default function SendPriceSheets() {
  // User data
  const { user } = useUser()
  
  // Data state
  const [priceSheets, setPriceSheets] = useState<PriceSheet[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoadingPriceSheets, setIsLoadingPriceSheets] = useState(true)
  const [isLoadingContacts, setIsLoadingContacts] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [selectedPriceSheet, setSelectedPriceSheet] = useState<string>('')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTiers, setSelectedTiers] = useState<string[]>([])
  const [fromTemplate, setFromTemplate] = useState(false)
  // Contact selection mode: 'batch' | 'all' | 'manual' | null
  const [selectionMode, setSelectionMode] = useState<'batch' | 'manual' | null>(null)
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [batches, setBatches] = useState<ContactBatch[]>([])
  const [isLoadingBatches, setIsLoadingBatches] = useState(false)

  // Settings tooltip state (fixed-position to escape scroll container)
  const [settingsTooltip, setSettingsTooltip] = useState<{
    contact: Contact
    x: number
    y: number
  } | null>(null)

  // Removed email generation state - now handled on schedule page
  // Removed Step 3 (Enhance Your Message) - now handled on schedule page

  // Preview modal state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewPriceSheet, setPreviewPriceSheet] = useState<PriceSheet | null>(null)
  const [previewProducts, setPreviewProducts] = useState<Array<{
    id: string
    productName: string
    commodity?: string
    variety?: string
    subtype?: string
    region: string
    packageType: string
    size?: string
    countSize?: string
    grade?: string
    basePrice: number | null
    adjustedPrice: number | null
    availability: string
    showStrikethrough?: boolean
    isOrganic?: boolean
    isStickered?: boolean
    specialNotes?: string
    hasOverride?: boolean
    overrideComment?: string
  }>>([])
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  // Load data on component mount
  useEffect(() => {
    loadPriceSheets()
    loadContacts()
    loadBatches()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadPriceSheets = async () => {
    try {
      setIsLoadingPriceSheets(true)
      const response = await priceSheetsApi.getAll()
      const allSheets = response.priceSheets || []
      // Exclude templates from the send page sheet selector
      const sheets = allSheets.filter((s: any) => !s.isTemplate)
      setPriceSheets(sheets)
      
      // Check URL for sheetId parameter
      const urlParams = new URLSearchParams(window.location.search)
      const sheetIdFromUrl = urlParams.get('sheetId')
      if (urlParams.get('fromTemplate') === 'true') setFromTemplate(true)
      
      let sheetToSelect = ''
      
      // If sheetId in URL and exists in sheets, select it
      if (sheetIdFromUrl && sheets.some(sheet => sheet._id === sheetIdFromUrl)) {
        sheetToSelect = sheetIdFromUrl
      }
      // Otherwise auto-select the most recent price sheet and add to URL
      else if (sheets.length > 0) {
        sheetToSelect = sheets[0]._id
      }
      
      if (sheetToSelect) {
        setSelectedPriceSheet(sheetToSelect)
        // Update URL to reflect selected sheet
        updateURLWithSheet(sheetToSelect)
      }
    } catch (error) {
      console.error('Error loading price sheets:', error)
      setError('Failed to load price sheets')
    } finally {
      setIsLoadingPriceSheets(false)
    }
  }
  
  // Helper function to update URL with sheet ID
  const updateURLWithSheet = (sheetId: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('sheetId', sheetId)
    window.history.replaceState({}, '', url.toString())
  }

  const loadContacts = async () => {
    try {
      setIsLoadingContacts(true)
      const response = await contactsApi.getAll()
      setContacts(response.contacts || [])
    } catch (error) {
      console.error('Error loading contacts:', error)
      setError('Failed to load contacts')
    } finally {
      setIsLoadingContacts(false)
    }
  }

  const loadBatches = async () => {
    try {
      setIsLoadingBatches(true)
      const response = await contactBatchesApi.getAll()
      setBatches(response.batches || [])
    } catch (error) {
      console.error('Error loading batches:', error)
    } finally {
      setIsLoadingBatches(false)
    }
  }

  const handleSelectBatch = (batch: ContactBatch) => {
    setSelectedBatchId(batch.id)
    setSelectedContacts(batch.contactIds)
  }

  const handleSetMode = (mode: 'batch' | 'manual') => {
    setSelectionMode(mode)
    setSelectedBatchId(null)
    if (mode === 'batch') {
      setSelectedContacts([])
    }
    // 'manual' keeps existing selection
  }

  const handlePreviewPriceSheet = async (priceSheetId: string) => {
    try {
      setIsLoadingPreview(true)
      const response = await priceSheetsApi.getById(priceSheetId)
      setPreviewPriceSheet(response.priceSheet)
      
      // Convert products using shared utility
      const convertedProducts = formatProductsForPreview(response.products || [])
      setPreviewProducts(convertedProducts)
      
      setIsPreviewModalOpen(true)
    } catch (error) {
      console.error('Error loading price sheet preview:', error)
      alert('Failed to load price sheet preview')
    } finally {
      setIsLoadingPreview(false)
    }
  }

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchTerm === '' || 
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTier = selectedTiers.length === 0 || selectedTiers.includes(contact.pricingTier)
    
    return matchesSearch && matchesTier
  })

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const toggleTier = (tier: string) => {
    setSelectedTiers(prev => 
      prev.includes(tier) 
        ? prev.filter(t => t !== tier)
        : [...prev, tier]
    )
  }

  const selectAllContacts = () => {
    setSelectedContacts(filteredContacts.map(c => c.id))
  }

  const clearAllContacts = () => {
    setSelectedContacts([])
  }

  const handlePreviewContact = async (contact: Contact) => {
    if (!selectedPriceSheet) return
    
    try {
      setIsLoadingPreview(true)
      
      // Get the selected price sheet
      const selectedSheet = priceSheets.find(s => s._id === selectedPriceSheet)
      if (!selectedSheet) return
      
      // Load the products for this price sheet
      const response = await priceSheetsApi.getProducts(selectedPriceSheet)
      const products = response.products || []
      
      // Apply contact-specific pricing adjustments
      const pricesheetSettings = (contact as any).pricesheetSettings || {}
      
      const adjustedProducts = products.map(product => {
        let adjustedPrice = product.price
        let adjustmentApplied = 0
        
        // Skip price adjustments if product has override or null price
        if (!product.hasOverride && product.price !== null && product.price > 0) {
          // Start with global adjustment as the base
          if (pricesheetSettings.globalAdjustment && pricesheetSettings.globalAdjustment !== 0) {
            adjustmentApplied = pricesheetSettings.globalAdjustment
          }
          
          // Crop-specific adjustments override the global adjustment
          const cropAdjustments = pricesheetSettings.cropAdjustments || []
          const cropAdjustment = cropAdjustments.find((adj: any) => 
            adj.cropId === product.cropId && adj.variationId === product.variationId
          )
          if (cropAdjustment) {
            adjustmentApplied = cropAdjustment.adjustment
          }
          
          // Apply the final adjustment
          if (adjustmentApplied !== 0) {
            adjustedPrice = product.price * (1 + adjustmentApplied / 100)
          }
        }
        
        // Use shared utility for formatting
        return formatProductForPreview(product, {
          adjustedPrice: product.hasOverride || product.price === null ? null : adjustedPrice,
          showStrikethrough: pricesheetSettings.showDiscountStrikethrough && adjustmentApplied !== 0 && !product.hasOverride && product.price !== null
        })
      })

      // Filter by primary crop interests
      const primaryCrops: string[] = (contact as any).primaryCrops || []
      const filteredProducts = primaryCrops.length > 0
        ? adjustedProducts.filter(p => primaryCrops.some(crop => crop.toLowerCase() === (p.commodity || '').toLowerCase()))
        : adjustedProducts

      setPreviewPriceSheet(selectedSheet)
      setPreviewProducts(filteredProducts)
      setIsPreviewModalOpen(true)
    } catch (error) {
      console.error('Failed to load preview:', error)
    } finally {
      setIsLoadingPreview(false)
    }
  }

  // Email generation and sending moved to schedule page

  const tierCounts = {
    premium: contacts.filter(c => c.pricingTier === 'premium').length,
    volume: contacts.filter(c => c.pricingTier === 'volume').length,
    standard: contacts.filter(c => c.pricingTier === 'standard').length,
    new_prospect: contacts.filter(c => c.pricingTier === 'new_prospect').length
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs 
          items={[
            { label: 'Price Sheets', href: '/dashboard/price-sheets' },
            { label: 'Send Price Sheets', current: true }
          ]} 
          className="mb-4"
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Send Price Sheets</h1>
          <p className="mt-2 text-gray-600">Select a price sheet and send it to contacts with automatic pricing optimization.</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* From-template banner (replaces Step 1 when navigating from template flow) */}
        {fromTemplate && selectedPriceSheet && (() => {
          const sheet = priceSheets.find(s => s._id === selectedPriceSheet)
          return (
            <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Price sheet ready</p>
                  <h3 className="text-base font-semibold text-gray-900 mt-0.5">{sheet?.title || 'Untitled'}</h3>
                </div>
                {sheet?.productsCount != null && (
                  <div className="ml-6 pl-6 border-l border-gray-200">
                    <p className="text-xs text-gray-400">Products</p>
                    <p className="text-sm font-semibold text-gray-900">{sheet.productsCount}</p>
                  </div>
                )}
                <div className="ml-4 pl-4 border-l border-gray-200">
                  <p className="text-xs text-gray-400">Created</p>
                  <p className="text-sm font-semibold text-gray-900">{sheet ? getRelativeTime(sheet.createdAt) : '—'}</p>
                </div>
                <p className="ml-auto text-xs text-gray-400">Select contacts below to send</p>
              </div>
            </div>
          )
        })()}

        {/* Step 1: Select Price Sheet — hidden when navigating from template */}
        {!fromTemplate && <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
            <h2 className="text-lg font-medium text-gray-900">Select Price Sheet</h2>
          </div>
          
          {isLoadingPriceSheets ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-24"></div>
                </div>
              ))}
            </div>
          ) : priceSheets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No price sheets found. Create one first in the Price Sheet Generator.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  // Smart display logic: Show selected sheet + 3 most recent (or 4 most recent if none selected)
                  let displaySheets: PriceSheet[] = []
                  
                  if (selectedPriceSheet) {
                    // Find the selected sheet
                    const selectedSheet = priceSheets.find(s => s._id === selectedPriceSheet)
                    
                    if (selectedSheet) {
                      // Start with selected sheet
                      displaySheets = [selectedSheet]
                      
                      // Add up to 3 most recent sheets (excluding the selected one)
                      const otherSheets = priceSheets.filter(s => s._id !== selectedPriceSheet).slice(0, 3)
                      displaySheets = [...displaySheets, ...otherSheets]
                    } else {
                      // Selected sheet not found, show 4 most recent
                      displaySheets = priceSheets.slice(0, 4)
                    }
                  } else {
                    // No selection, show 4 most recent
                    displaySheets = priceSheets.slice(0, 4)
                  }
                  
                  return displaySheets.map((sheet) => (
                    <div
                      key={sheet._id}
                      onClick={() => {
                        setSelectedPriceSheet(sheet._id)
                        updateURLWithSheet(sheet._id)
                      }}
                      className={`relative cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                        selectedPriceSheet === sheet._id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{sheet.title}</h3>
                          <div className="mt-1 text-sm text-gray-500">
                            <p>{sheet.productsCount} products • {sheet.status}</p>
                            <p className="text-xs mt-1 text-blue-600 font-medium">{getRelativeTime(sheet.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePreviewPriceSheet(sheet._id)
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Preview price sheet"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {selectedPriceSheet === sheet._id && (
                            <CheckIcon className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                })()}
              </div>
              {priceSheets.length > 4 && (
                <div className="mt-4 text-center">
                  <Link
                    href="/dashboard/price-sheets"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View All {priceSheets.length} Price Sheets
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              )}
            </>
          )}
          
          {!selectedPriceSheet && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">Please select a price sheet to continue.</p>
            </div>
          )}
        </div>}

        {/* Step 2 (or Step 1 when from template): Select Contacts */}
        {selectedPriceSheet && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">{fromTemplate ? '1' : '2'}</div>
              <h2 className="text-lg font-medium text-gray-900">Select Contacts</h2>
            </div>

            {/* Selection mode cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Batch option */}
              <button
                onClick={() => handleSetMode('batch')}
                className={`flex flex-col items-start p-4 rounded-lg border-2 text-left transition-colors ${
                  selectionMode === 'batch'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${selectionMode === 'batch' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <RectangleGroupIcon className={`h-5 w-5 ${selectionMode === 'batch' ? 'text-blue-600' : 'text-gray-500'}`} />
                </div>
                <p className={`text-sm font-semibold ${selectionMode === 'batch' ? 'text-blue-900' : 'text-gray-900'}`}>Use a Batch</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isLoadingBatches ? 'Loading...' : batches.length === 0 ? 'No batches yet' : `${batches.length} batch${batches.length !== 1 ? 'es' : ''} saved`}
                </p>
              </button>

              {/* Manual option */}
              <button
                onClick={() => handleSetMode('manual')}
                className={`flex flex-col items-start p-4 rounded-lg border-2 text-left transition-colors ${
                  selectionMode === 'manual'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${selectionMode === 'manual' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <CursorArrowRaysIcon className={`h-5 w-5 ${selectionMode === 'manual' ? 'text-blue-600' : 'text-gray-500'}`} />
                </div>
                <p className={`text-sm font-semibold ${selectionMode === 'manual' ? 'text-blue-900' : 'text-gray-900'}`}>Select Manually</p>
                <p className="text-xs text-gray-500 mt-0.5">Pick contacts one by one</p>
              </button>
            </div>

            {/* Batch picker */}
            {selectionMode === 'batch' && (
              <div className="mb-6">
                {batches.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <RectangleGroupIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No batches created yet.</p>
                    <Link href="/dashboard/contacts" className="text-sm text-blue-600 hover:text-blue-500 font-medium mt-1 inline-block">
                      Go to Contacts to create a batch →
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {batches.map(batch => (
                      <button
                        key={batch.id}
                        onClick={() => handleSelectBatch(batch)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                          selectedBatchId === batch.id
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-700'
                        }`}
                      >
                        <RectangleGroupIcon className="h-4 w-4 flex-shrink-0" />
                        {batch.name}
                        <span className={`text-xs ${selectedBatchId === batch.id ? 'text-blue-100' : 'text-gray-400'}`}>
                          {batch.contactIds.length}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Manual search */}
            {selectionMode === 'manual' && (
              <div className="mb-4 space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                      placeholder="Search contacts..."
                    />
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <button onClick={selectAllContacts} className="font-medium text-blue-600 hover:text-blue-500">Select All</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={clearAllContacts} className="font-medium text-gray-500 hover:text-gray-700">Clear</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(tierCounts).map(([tier, count]) => (
                    <button
                      key={tier}
                      onClick={() => toggleTier(tier)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedTiers.includes(tier)
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tier.replace('_', ' ')} ({count})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Contacts table — shown when a mode is active and contacts are selected or browsing manually */}
            {selectionMode && (selectionMode === 'manual' || selectedContacts.length > 0) && (
              <div className="border border-gray-200 rounded-lg">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {selectionMode === 'manual'
                      ? `${selectedContacts.length} of ${filteredContacts.length} selected`
                      : `${selectedContacts.length} contact${selectedContacts.length !== 1 ? 's' : ''} will receive this price sheet`}
                  </span>
                  <span className="text-xs text-gray-500">Dynamic pricing applied automatically</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        {selectionMode === 'manual' && (
                          <th className="px-4 py-2 w-10"></th>
                        )}
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Settings</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {(() => {
                        // For batch/all modes show only selected contacts; for manual show filtered list
                        const displayContacts = selectionMode === 'manual'
                          ? filteredContacts
                          : contacts.filter(c => selectedContacts.includes(c.id))

                        return displayContacts.map((contact) => {
                          const pricesheetSettings = (contact as any).pricesheetSettings || {}
                          const hasGlobalAdjustment = (pricesheetSettings.globalAdjustment || 0) !== 0
                          const hasIndividualAdjustments = (pricesheetSettings.cropAdjustments || []).length > 0
                          const hasCustomPricing = hasGlobalAdjustment || hasIndividualAdjustments
                          const isSelected = selectedContacts.includes(contact.id)

                          return (
                            <tr
                              key={contact.id}
                              onClick={selectionMode === 'manual' ? () => toggleContact(contact.id) : undefined}
                              className={`${selectionMode === 'manual' ? 'cursor-pointer hover:bg-gray-50' : ''} ${isSelected && selectionMode === 'manual' ? 'bg-blue-50' : ''}`}
                            >
                              {selectionMode === 'manual' && (
                                <td className="px-4 py-3 w-10">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleContact(contact.id)}
                                    onClick={e => e.stopPropagation()}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                </td>
                              )}
                              <td className="px-4 py-3 whitespace-nowrap">
                                <p className="text-sm font-medium text-gray-900">{contact.company}</p>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <p className="text-sm text-gray-900">{contact.firstName} {contact.lastName}</p>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <p className="text-sm text-gray-600">{contact.email}</p>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-center">
                                {(() => {
                                  const primaryCrops: string[] = (contact as any).primaryCrops || []
                                  const hasAnySetting = hasCustomPricing || primaryCrops.length > 0
                                  return hasAnySetting ? (
                                    <button
                                      className="inline-flex items-center gap-1 cursor-default"
                                      onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect()
                                        setSettingsTooltip({ contact, x: rect.left + rect.width / 2, y: rect.bottom + 8 })
                                      }}
                                      onMouseLeave={() => setSettingsTooltip(null)}
                                    >
                                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                      <span className="text-xs font-medium text-amber-700">Custom</span>
                                    </button>
                                  ) : (
                                    <div className="inline-flex items-center gap-1">
                                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                      <span className="text-xs font-medium text-green-700">Standard</span>
                                    </div>
                                  )
                                })()}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-center">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handlePreviewContact(contact) }}
                                  className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                  title="Preview pricesheet for this contact"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Removed - Attachments now handled on schedule page */}

        {/* Continue to Review Button */}
        {selectedPriceSheet && selectedContacts.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="flex -space-x-2">
                  {selectedContacts.slice(0, 5).map((contactId) => {
                    const contact = contacts.find(c => c.id === contactId)
                    if (!contact) return null
                    return (
                      <div key={contact.id} className="w-10 h-10 bg-white border-2 border-white rounded-full flex items-center justify-center text-sm font-medium text-gray-700 shadow-md">
                        {contact.firstName ? contact.firstName.charAt(0) : '?'}
                      </div>
                    )
                  }).filter(Boolean)}
                  {selectedContacts.length > 5 && (
                    <div className="w-10 h-10 bg-gray-100 border-2 border-white rounded-full flex items-center justify-center text-sm font-medium text-gray-500 shadow-md">
                      +{selectedContacts.length - 5}
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to Review & Send
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                You've selected <span className="font-semibold text-gray-900">{selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''}</span> to receive <span className="font-semibold text-gray-900">{priceSheets.find(s => s._id === selectedPriceSheet)?.title}</span>.
              </p>
              
              <button
                type="button"
                onClick={() => {
                  // Navigate to schedule page with data
                  const params = new URLSearchParams({
                    sheetId: selectedPriceSheet,
                    contacts: selectedContacts.join(',')
                  })
                  window.location.href = `/dashboard/price-sheets/send/schedule?${params.toString()}`
                }}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Continue to Review & Send
              </button>
              
              <p className="text-xs text-gray-500 mt-4">
                Next: Review all recipients and send emails
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewPriceSheet && (
        <PriceSheetPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title={previewPriceSheet.title}
          products={previewProducts}
          userEmail={user?.profile?.email || user?.email}
          userPhone={user?.profile?.phone}
          mode="send"
          priceType={previewPriceSheet.priceType || 'FOB'}
        />
      )}

      {/* Fixed-position settings tooltip (escapes scroll container) */}
      {settingsTooltip && (() => {
        const c = settingsTooltip.contact
        const ps = (c as any).pricesheetSettings || {}
        const globalAdj = ps.globalAdjustment || 0
        const cropAdjs: any[] = ps.cropAdjustments || []
        const primaryCrops: string[] = (c as any).primaryCrops || []
        const hasCustomPricing = globalAdj !== 0 || cropAdjs.length > 0

        return (
          <div
            className="fixed z-50 w-60 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 pointer-events-none text-left"
            style={{ left: settingsTooltip.x, top: settingsTooltip.y, transform: 'translateX(-50%)' }}
          >
            <p className="font-semibold text-gray-300 mb-1.5">Pricing</p>
            {!hasCustomPricing && <p className="text-gray-400 mb-2">No adjustments</p>}
            {globalAdj !== 0 && (
              <p className="text-gray-200 mb-1">
                Global: <span className={globalAdj > 0 ? 'text-red-300' : 'text-green-300'}>
                  {globalAdj > 0 ? '+' : ''}{globalAdj}%
                </span>
              </p>
            )}
            {cropAdjs.map((adj: any, i: number) => (
              <p key={i} className="text-gray-200 mb-0.5">
                {adj.cropName}: <span className={adj.adjustment > 0 ? 'text-red-300' : 'text-green-300'}>
                  {adj.adjustment > 0 ? '+' : ''}{adj.adjustment}%
                </span>
              </p>
            ))}
            {primaryCrops.length > 0 && (
              <div className="border-t border-gray-700 mt-2 pt-2">
                <p className="font-semibold text-gray-300 mb-1">Crop filter</p>
                <p className="text-gray-400 leading-snug">Only showing: {primaryCrops.join(', ')}</p>
              </div>
            )}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
          </div>
        )
      })()}

      {/* Loading overlay for preview */}
      {isLoadingPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-900">Loading preview...</span>
          </div>
        </div>
      )}
    </>
  )
}
