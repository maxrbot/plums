"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  PaperAirplaneIcon,
  EyeIcon,
  CheckIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CalendarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'
import PriceSheetPreviewModal from '../../../../components/modals/PriceSheetPreviewModal'
import { Contact } from '../../../../types'
import { priceSheetsApi, contactsApi } from '../../../../lib/api'
import { useUser } from '../../../../contexts/UserContext'

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

// Simple function to convert PriceSheet products (now with denormalized data)
const convertToPreviewFormat = async (products: PriceSheetProduct[]): Promise<Array<{
  id: string
  productName: string
  region: string
  packageType: string
  countSize?: string
  grade?: string
  basePrice: number | null
  adjustedPrice: number | null
  availability: string
  showStrikethrough?: boolean
  isStickered?: boolean
  specialNotes?: string
  hasOverride?: boolean
  overrideComment?: string
}>> => {
  // No need for complex lookups - data is already denormalized!
  return products.map(product => ({
    id: product._id,
    productName: product.isStickered ? 
      `${product.productName || 'Unknown Product'} (Stickered)` : 
      (product.productName || 'Unknown Product'),
    region: product.regionName || 'Unknown Region',
    packageType: product.packageType,
    countSize: product.countSize,
    grade: product.grade,
    basePrice: product.hasOverride || product.price === null ? null : product.price,
    adjustedPrice: product.hasOverride || product.price === null ? null : product.price,
    availability: product.availability || 'Available',
    showStrikethrough: false,
    isStickered: product.isStickered,
    specialNotes: product.specialNotes,
    hasOverride: product.hasOverride,
    overrideComment: product.overrideComment
  }))
}

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
  const [contactNotes, setContactNotes] = useState<Record<string, string>>({})
  // Removed email generation state - now handled on schedule page
  
  // Step 3: Enhancement state
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [customMessage, setCustomMessage] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [isStep3Collapsed, setIsStep3Collapsed] = useState(false)
  const [step3HasContent, setStep3HasContent] = useState(false)

  // Preview modal state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewPriceSheet, setPreviewPriceSheet] = useState<PriceSheet | null>(null)
  const [previewProducts, setPreviewProducts] = useState<Array<{
    id: string
    productName: string
    region: string
    packageType: string
    countSize?: string
    grade?: string
    basePrice: number | null
    adjustedPrice: number | null
    availability: string
    showStrikethrough?: boolean
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadPriceSheets = async () => {
    try {
      setIsLoadingPriceSheets(true)
      const response = await priceSheetsApi.getAll()
      const sheets = response.priceSheets || []
      setPriceSheets(sheets)
      
      // Check URL for sheetId parameter
      const urlParams = new URLSearchParams(window.location.search)
      const sheetIdFromUrl = urlParams.get('sheetId')
      
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

  const handlePreviewPriceSheet = async (priceSheetId: string) => {
    try {
      setIsLoadingPreview(true)
      const response = await priceSheetsApi.getById(priceSheetId)
      setPreviewPriceSheet(response.priceSheet)
      
      // Convert products with full data (async)
      const convertedProducts = await convertToPreviewFormat(response.products || [])
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

  const handleAddNote = (contactId: string) => {
    const note = prompt('Add a custom note for this contact:')
    if (note !== null) {
      setContactNotes(prev => ({
        ...prev,
        [contactId]: note
      }))
    }
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
      const adjustedProducts = products.map(product => {
        let adjustedPrice = product.price
        const pricesheetSettings = (contact as any).pricesheetSettings || {}
        
        // Skip price adjustments if product has override or null price
        if (!product.hasOverride && product.price !== null && product.price > 0) {
          // Apply global adjustment if exists
          if (pricesheetSettings.globalAdjustment) {
            adjustedPrice = adjustedPrice * (1 + pricesheetSettings.globalAdjustment / 100)
          }
          
          // Apply individual crop adjustments if exists
          const cropAdjustments = pricesheetSettings.cropAdjustments || []
          const cropAdjustment = cropAdjustments.find((adj: any) => 
            adj.cropId === product.cropId && adj.variationId === product.variationId
          )
          if (cropAdjustment) {
            adjustedPrice = product.price * (1 + cropAdjustment.adjustment / 100)
          }
        }
        
        return {
          id: product._id,
          productName: product.isStickered ? 
            `${product.productName || `${product.commodity} ${product.variety}`} (Stickered)` : 
            (product.productName || `${product.commodity} ${product.variety}`),
          region: product.regionName || 'Unknown Region',
          packageType: product.packageType,
          countSize: product.countSize,
          grade: product.grade,
          basePrice: product.hasOverride || product.price === null ? null : product.price,
          adjustedPrice: product.hasOverride || product.price === null ? null : adjustedPrice,
          availability: product.availability || 'Available',
          showStrikethrough: pricesheetSettings.showDiscountStrikethrough && adjustedPrice < product.price && !product.hasOverride && product.price !== null,
          // Extended options
          isStickered: product.isStickered,
          specialNotes: product.specialNotes,
          hasOverride: product.hasOverride,
          overrideComment: product.overrideComment
        }
      })
      
      setPreviewPriceSheet(selectedSheet)
      setPreviewProducts(adjustedProducts)
      setIsPreviewModalOpen(true)
    } catch (error) {
      console.error('Failed to load preview:', error)
    } finally {
      setIsLoadingPreview(false)
    }
  }

  // File handling functions
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || 
      file.type === 'application/pdf' ||
      file.type.includes('document')
    )
    
    // Limit to 5 files total
    const remainingSlots = 5 - attachedFiles.length
    const filesToAdd = validFiles.slice(0, remainingSlots)
    
    if (validFiles.length > remainingSlots) {
      alert(`You can only attach up to 5 files. ${validFiles.length - remainingSlots} file(s) were not added.`)
    }
    
    const newFiles = [...attachedFiles, ...filesToAdd]
    handleFilesChange(newFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      
      // Limit to 5 files total
      const remainingSlots = 5 - attachedFiles.length
      const filesToAdd = files.slice(0, remainingSlots)
      
      if (files.length > remainingSlots) {
        alert(`You can only attach up to 5 files. ${files.length - remainingSlots} file(s) were not added.`)
      }
      
      const newFiles = [...attachedFiles, ...filesToAdd]
      handleFilesChange(newFiles)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = attachedFiles.filter((_, i) => i !== index)
    handleFilesChange(newFiles)
  }

  // Check if step 3 has content and update state
  const checkStep3Content = () => {
    const hasContent = attachedFiles.length > 0
    setStep3HasContent(hasContent)
    return hasContent
  }

  // Handle step 3 actions
  const handleSkipStep3 = () => {
    setIsStep3Collapsed(true)
  }

  const handleSaveStep3 = () => {
    if (checkStep3Content()) {
      setIsStep3Collapsed(true)
    }
  }

  const handleEditStep3 = () => {
    setIsStep3Collapsed(false)
  }

  // Update content check when inputs change
  const handleCustomMessageChange = (value: string) => {
    setCustomMessage(value)
    setTimeout(checkStep3Content, 0) // Check after state update
  }

  const handleFilesChange = (newFiles: File[]) => {
    setAttachedFiles(newFiles)
    setTimeout(checkStep3Content, 0) // Check after state update
  }

  // Analyze price sheet for smart content generation
  const analyzePriceSheet = async (priceSheetId: string) => {
    try {
      const response = await priceSheetsApi.getProducts(priceSheetId)
      const products = response.products || []
      
      const analysis = {
        totalProducts: products.length,
        availableItems: products.filter(p => p.availability === 'Available').length,
        newCropItems: products.filter(p => p.availability === 'New Crop').length,
        preOrderItems: products.filter(p => p.availability === 'Pre-order').length,
        limitedItems: products.filter(p => p.availability === 'Limited').length,
        organicItems: products.filter(p => p.isOrganic).length,
        topProducts: products.slice(0, 3).map(p => p.productName || `${p.commodity} ${p.variety}`),
        regions: [...new Set(products.map(p => p.regionName).filter(Boolean))]
      }
      
      return analysis
    } catch (error) {
      console.error('Error analyzing price sheet:', error)
      return null
    }
  }

  // Email generation and sending moved to schedule page

  const tierCounts = {
    premium: contacts.filter(c => c.pricingTier === 'premium').length,
    volume: contacts.filter(c => c.pricingTier === 'volume').length,
    standard: contacts.filter(c => c.pricingTier === 'standard').length,
    new_prospect: contacts.filter(c => c.pricingTier === 'new_prospect').length
  }

  // Helper function to render delivery method
  const renderDeliveryMethod = (contact: Contact) => {
    const pricesheetSettings = (contact as any).pricesheetSettings || {}
    const deliveryMethod = pricesheetSettings.deliveryMethod || 
      (contact.preferredContactMethod === 'phone' ? 'sms' : 'email')

    switch (deliveryMethod) {
      case 'email':
        return (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <EnvelopeIcon className="h-3 w-3" />
            <span>Email</span>
          </div>
        )
      case 'sms':
        return (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <DevicePhoneMobileIcon className="h-3 w-3" />
            <span>SMS</span>
          </div>
        )
      case 'both':
        return (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <EnvelopeIcon className="h-3 w-3" />
            <DevicePhoneMobileIcon className="h-3 w-3" />
            <span>Email & SMS</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <EnvelopeIcon className="h-3 w-3" />
            <span>Email</span>
          </div>
        )
    }
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
        {/* Step 1: Select Price Sheet */}
        <div className="bg-white shadow rounded-lg p-6">
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
                    href="/dashboard/price-sheets/library"
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
        </div>

        {/* Step 2: Select Contacts */}
        {selectedPriceSheet && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
              <h2 className="text-lg font-medium text-gray-900">Select Contacts</h2>
            </div>

            {/* Contact Filters & Search */}
            <div className="mb-6 space-y-4">
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
                <div className="flex items-center space-x-2">
                  <button
                    onClick={selectAllContacts}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={clearAllContacts}
                    className="text-sm font-medium text-gray-600 hover:text-gray-500"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Tier Filters */}
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

            {/* Contacts List */}
            <div className="border border-gray-200 rounded-lg">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    Contacts ({selectedContacts.length} of {filteredContacts.length} selected)
                  </span>
                  <span className="text-xs text-gray-500">Dynamic pricing will be applied automatically</span>
                </div>
                
                {/* Column Headers */}
                <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex-1">Contact Information</div>
                  <div className="text-center w-32">Pricing Status</div>
                  <div className="text-center w-20">Preview</div>
                  <div className="w-32 ml-4 text-center">Custom Note</div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {filteredContacts.map((contact) => {
                  return (
                    <div key={contact.id} className="px-4 py-4 hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="flex items-center space-x-3 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => toggleContact(contact.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900">
                                {contact.firstName} {contact.lastName}
                              </p>
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                contact.pricingTier === 'premium' ? 'bg-purple-100 text-purple-800' :
                                contact.pricingTier === 'volume' ? 'bg-orange-100 text-orange-800' :
                                contact.pricingTier === 'standard' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {contact.pricingTier}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{contact.company}</p>
                            <div className="mt-1">
                              {renderDeliveryMethod(contact)}
                            </div>
                            {contactNotes[contact.id] && (
                              <p className="text-xs text-blue-600 mt-1 italic">Note: {contactNotes[contact.id]}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Enhanced Pricing Status Column */}
                        <div className="text-center w-32">
                          {(() => {
                            const pricesheetSettings = (contact as any).pricesheetSettings || {}
                            const hasGlobalAdjustment = (pricesheetSettings.globalAdjustment || 0) !== 0
                            const hasIndividualAdjustments = (pricesheetSettings.cropAdjustments || []).length > 0
                            const hasCustomPricing = hasGlobalAdjustment || hasIndividualAdjustments
                            
                            if (hasCustomPricing) {
                              return (
                                <div>
                                  <div className="flex items-center justify-center space-x-1">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="text-xs font-medium text-red-700">Custom</span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {hasGlobalAdjustment && `Global: ${pricesheetSettings.globalAdjustment > 0 ? '+' : ''}${pricesheetSettings.globalAdjustment}%`}
                                    {hasGlobalAdjustment && hasIndividualAdjustments && <br />}
                                    {hasIndividualAdjustments && `${pricesheetSettings.cropAdjustments.length} crops`}
                                  </div>
                                </div>
                              )
                            } else {
                              return (
                                <div>
                                  <div className="flex items-center justify-center space-x-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-xs font-medium text-green-700">Standard</span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">Base pricing</div>
                                </div>
                              )
                            }
                          })()}
                        </div>

                        {/* Preview Column */}
                        <div className="text-center w-20">
                          <button
                            onClick={() => handlePreviewContact(contact)}
                            className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Preview pricesheet for this contact"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Custom Note Column */}
                        <div className="w-32 ml-4">
                          <button
                            onClick={() => handleAddNote(contact.id)}
                            className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                              contactNotes[contact.id] 
                                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {contactNotes[contact.id] ? 'Edit Note' : 'Add Note'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Enhance Your Message */}
        {selectedPriceSheet && selectedContacts.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Enhance Your Message</h2>
                </div>
              </div>
              
              {isStep3Collapsed && (
                <button
                  onClick={handleEditStep3}
                  className="text-sm font-medium text-orange-600 hover:text-orange-500"
                >
                  Edit
                </button>
              )}
            </div>
            
            {/* Collapsed Content Summary */}
            {isStep3Collapsed && step3HasContent && (
              <div className="ml-11 mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                {attachedFiles.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Attached Files ({attachedFiles.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {attachedFiles.map((file, index) => (
                        <span key={`attached-file-${index}-${file.name}`} className="inline-flex items-center px-2 py-1 rounded-md bg-white border border-orange-300 text-xs text-gray-700">
                          {file.type.startsWith('image/') ? '📷' : file.type.startsWith('video/') ? '🎥' : file.type === 'application/pdf' ? '📄' : '📎'}
                          <span className="ml-1">{file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!isStep3Collapsed && (
              <>
                <p className="text-sm text-gray-600 mb-6 ml-11">
                  Upload photos and videos to showcase your product quality and build buyer confidence.
                </p>

            <div className="max-w-3xl ml-11">
              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Upload Images & Documents
                </label>
                <div
                  onDragOver={attachedFiles.length < 5 ? handleDragOver : undefined}
                  onDragLeave={attachedFiles.length < 5 ? handleDragLeave : undefined}
                  onDrop={attachedFiles.length < 5 ? handleDrop : undefined}
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    attachedFiles.length >= 5
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : isDragOver 
                        ? 'border-orange-400 bg-orange-50' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {attachedFiles.length < 5 && (
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  )}
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`h-10 w-10 ${attachedFiles.length >= 5 ? 'text-gray-300' : 'text-gray-400'}`}>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      {attachedFiles.length >= 5 ? (
                        <>
                          <p className="text-sm text-gray-500">
                            Maximum of 5 files reached
                          </p>
                          <p className="text-xs text-gray-400">
                            Remove a file to add more
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold text-orange-600 hover:text-orange-500">Click to upload</span> or drag files here
                          </p>
                          <p className="text-xs text-gray-500">
                            Images, videos, PDFs • Max 10MB each • {5 - attachedFiles.length} remaining
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Attached Files Grid */}
                {attachedFiles.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">Attached Files ({attachedFiles.length}):</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {attachedFiles.map((file, index) => (
                        <div key={`summary-file-${index}-${file.name}`} className="relative group">
                          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors">
                            <div className="flex-shrink-0 mb-2">
                              {file.type.startsWith('image/') ? (
                                <span className="text-3xl">📷</span>
                              ) : file.type.startsWith('video/') ? (
                                <span className="text-3xl">🎥</span>
                              ) : file.type === 'application/pdf' ? (
                                <span className="text-3xl">📄</span>
                              ) : (
                                <span className="text-3xl">📎</span>
                              )}
                            </div>
                            <div className="text-center w-full">
                              <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons - Bottom Right */}
            <div className="flex justify-end space-x-3 mt-6">
              {attachedFiles.length > 0 ? (
                <button
                  onClick={handleSaveStep3}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-lime-600 hover:bg-lime-700"
                >
                  Done Adding Attachments
                </button>
              ) : (
                <button
                  onClick={handleSkipStep3}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Skip Adding Attachments
                </button>
              )}
            </div>
              </>
            )}
          </div>
        )}

        {/* Continue to Review Button */}
        {selectedPriceSheet && selectedContacts.length > 0 && isStep3Collapsed && (
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
                {customMessage && <span className="block mt-1">Custom message will be included.</span>}
              </p>
              
              <button
                type="button"
                onClick={() => {
                  // Navigate to schedule page with data
                  const params = new URLSearchParams({
                    sheetId: selectedPriceSheet,
                    contacts: selectedContacts.join(','),
                    ...(customMessage && { message: customMessage })
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
          userEmail={user?.profile?.email || 'sales@acrelist.com'}
          userPhone={user?.profile?.phone || '(555) 123-4567'}
          mode="send"
        />
      )}

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
