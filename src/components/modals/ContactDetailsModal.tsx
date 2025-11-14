"use client"

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { 
  XMarkIcon, 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  MapPinIcon,
  DocumentTextIcon,
  PencilIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline'
import { Contact } from '../../types'
import { cropsApi, contactsApi } from '../../lib/api'

// Types for pricing adjustments
interface CropAdjustment {
  cropId: string
  variationId: string
  cropName: string
  adjustment: number // percentage adjustment (-100 to +100)
  isNegative?: boolean // track sign independently
}

interface PricesheetSettings {
  deliveryMethod: 'email' | 'sms' | 'both'
  globalAdjustment: number // percentage adjustment for all items
  cropAdjustments: CropAdjustment[]
  showDiscountStrikethrough: boolean // whether to show strikethrough for discounts
  deliveredPricing: boolean // whether to include freight in pricing
  deliveryZipCode?: string // zip code for freight calculation
}

interface ContactDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact | null
  onEdit?: (contact: Contact) => void
}

export default function ContactDetailsModal({ isOpen, onClose, contact, onEdit }: ContactDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'pricesheet' | 'history'>('overview')
  const [availableCrops, setAvailableCrops] = useState<any[]>([])
  const [pricesheetSettings, setPricesheetSettings] = useState<PricesheetSettings>({
    deliveryMethod: 'email',
    globalAdjustment: 0,
    cropAdjustments: [],
    showDiscountStrikethrough: true,
    deliveredPricing: false,
    deliveryZipCode: ''
  })
  const [isLoadingCrops, setIsLoadingCrops] = useState(false)
  const [globalAdjustmentEnabled, setGlobalAdjustmentEnabled] = useState(false)
  const [globalAdjustmentIsNegative, setGlobalAdjustmentIsNegative] = useState(false)
  const [deliveredPricingEnabled, setDeliveredPricingEnabled] = useState(false)
  const [showCropDropdown, setShowCropDropdown] = useState(false)
  const [selectedCommodity, setSelectedCommodity] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [priceSheetHistory, setPriceSheetHistory] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Overview tab editable fields
  const [editedContact, setEditedContact] = useState<Contact | null>(null)

  // Load crop data when modal opens
  useEffect(() => {
    if (isOpen && contact) {
      loadCropData()
      // Initialize edited contact state
      setEditedContact(contact)
      setHasUnsavedChanges(false)
      
      // Load existing pricesheet settings for this contact (if any)
      const existingSettings = contact.pricesheetSettings || {
        deliveryMethod: contact.preferredContactMethod === 'phone' ? 'sms' : 'email',
        globalAdjustment: contact.pricingAdjustment || 0,
        cropAdjustments: [],
        showDiscountStrikethrough: true,
        deliveredPricing: false,
        deliveryZipCode: ''
      }
      
      setPricesheetSettings(existingSettings)
      setGlobalAdjustmentEnabled((existingSettings.globalAdjustment || 0) !== 0)
      setGlobalAdjustmentIsNegative((existingSettings.globalAdjustment || 0) < 0)
      setDeliveredPricingEnabled(existingSettings.deliveredPricing || false)
    }
  }, [isOpen, contact])

  // Load price sheet history when History tab is active
  useEffect(() => {
    const loadHistory = async () => {
      if (activeTab === 'history' && contact) {
        const contactId = contact.id || (contact as any)._id
        if (contactId) {
          setIsLoadingHistory(true)
          try {
            const response = await contactsApi.getPriceSheetHistory(contactId)
            setPriceSheetHistory(response.history || [])
          } catch (error) {
            console.error('Failed to load history:', error)
            setPriceSheetHistory([])
          } finally {
            setIsLoadingHistory(false)
          }
        }
      }
    }

    loadHistory()
  }, [activeTab, contact])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      // Don't close if clicking inside the dropdown
      if (target.closest('.crop-dropdown')) {
        return
      }
      
      if (showCropDropdown) {
        setShowCropDropdown(false)
        setSelectedCommodity(null)
      }
    }

    if (showCropDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCropDropdown])

  const loadCropData = async () => {
    try {
      setIsLoadingCrops(true)
      const response = await cropsApi.getAll()
      const crops = response.crops || []
      
      // Group crops by commodity for hierarchical display
      const commodityGroups: { [key: string]: any[] } = {}
      
      crops.forEach((crop: any) => {
        if (crop.variations && crop.variations.length > 0) {
          const commodityKey = crop.commodity || 'Unknown'
          
          if (!commodityGroups[commodityKey]) {
            commodityGroups[commodityKey] = []
          }
          
          crop.variations.forEach((variation: any) => {
            // Create one entry per variation (not per shipping point)
            const cropName = [
              variation.subtype,
              variation.variety,
              variation.isOrganic ? '(Organic)' : ''
            ].filter(Boolean).join(' ')
            
            // Get shipping points for reference but don't create multiple entries
            const shippingPoints = variation.shippingPoints || variation.growingRegions || []
            
            commodityGroups[commodityKey].push({
              cropId: crop.id || `crop_${Date.now()}_${Math.random()}`,
              variationId: variation.id || `var_${Date.now()}_${Math.random()}`,
              cropName,
              fullCropName: [crop.commodity, cropName].filter(Boolean).join(' '),
              category: crop.category,
              commodity: crop.commodity,
              variety: variation.variety,
              subtype: variation.subtype,
              isOrganic: variation.isOrganic,
              shippingPointsCount: shippingPoints.length // Track how many shipping points this variation has
            })
          })
        }
      })
      
      setAvailableCrops(commodityGroups)
    } catch (error) {
      console.error('Failed to load crop data:', error)
    } finally {
      setIsLoadingCrops(false)
    }
  }

  if (!contact) return null

  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount || amount === 0) return '$0'
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount.toFixed(0)}`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserIcon },
    { id: 'pricesheet', name: 'Pricesheet Settings', icon: DocumentTextIcon },
    { id: 'history', name: 'History', icon: ChatBubbleLeftRightIcon }
  ]

  // Helper functions for pricing adjustments
  const addCropAdjustment = (crop: any) => {
    const newAdjustment: CropAdjustment = {
      cropId: crop.cropId,
      variationId: crop.variationId,
      cropName: crop.cropName,
      adjustment: 0,
      isNegative: false
    }
    
    setPricesheetSettings(prev => ({
      ...prev,
      cropAdjustments: [...prev.cropAdjustments, newAdjustment]
    }))
    setHasUnsavedChanges(true)
  }

  const removeCropAdjustment = (cropId: string, variationId: string) => {
    setPricesheetSettings(prev => ({
      ...prev,
      cropAdjustments: prev.cropAdjustments.filter(
        adj => !(adj.cropId === cropId && adj.variationId === variationId)
      )
    }))
    setHasUnsavedChanges(true)
  }

  const updateCropAdjustment = (cropId: string, variationId: string, adjustment: number) => {
    setPricesheetSettings(prev => ({
      ...prev,
      cropAdjustments: prev.cropAdjustments.map(adj =>
        adj.cropId === cropId && adj.variationId === variationId
          ? { ...adj, adjustment }
          : adj
      )
    }))
    setHasUnsavedChanges(true)
  }

  const updateGlobalAdjustment = (adjustment: number) => {
    setPricesheetSettings(prev => ({
      ...prev,
      globalAdjustment: adjustment
    }))
    setHasUnsavedChanges(true)
  }

  const updateDeliveryMethod = (method: 'email' | 'sms' | 'both') => {
    setPricesheetSettings(prev => ({
      ...prev,
      deliveryMethod: method
    }))
    setHasUnsavedChanges(true)
  }

  const updateShowDiscountStrikethrough = (show: boolean) => {
    setPricesheetSettings(prev => ({
      ...prev,
      showDiscountStrikethrough: show
    }))
    setHasUnsavedChanges(true)
  }

  const updateContactField = (field: keyof Contact, value: any) => {
    if (!editedContact) return
    setEditedContact({
      ...editedContact,
      [field]: value
    })
    setHasUnsavedChanges(true)
  }

  const handleSaveOverview = async () => {
    if (!editedContact || !contact) return
    
    try {
      setIsSaving(true)
      // Use _id if available, otherwise fall back to id
      const contactId = (contact as any)._id || contact.id
      
      // Ensure tags array is in sync with status field
      const updatedContact = {
        ...editedContact,
        tags: editedContact.tags && editedContact.tags.length > 0 
          ? editedContact.tags 
          : (editedContact.status ? [editedContact.status] : [])
      }
      
      await contactsApi.update(contactId, updatedContact)
      setHasUnsavedChanges(false)
      // Optionally reload or update the parent component
    } catch (error) {
      console.error('Failed to save contact details:', error)
      // You might want to show a toast notification here
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePricesheetSettings = async () => {
    try {
      setIsSaving(true)
      
      // Use _id if available, otherwise fall back to id
      const contactId = (contact as any)._id || contact.id
      
      // Save pricesheet settings to the contact record
      const updatedContact = {
        ...contact,
        pricesheetSettings: pricesheetSettings
      }
      
      await contactsApi.update(contactId, updatedContact)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save pricesheet settings:', error)
      // You might want to show a toast notification here
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
                {/* Header */}
                <div className="bg-white px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full">
                        <UserIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </Dialog.Title>
                        <p className="text-sm text-gray-500">
                          {contact.title ? `${contact.title} at ` : ''}{contact.company}
                        </p>
                      </div>
                      

                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(contact)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Tabs */}
                  <div className="mt-4">
                    <nav className="flex space-x-8">
                      {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'overview' | 'pricesheet' | 'history')}
                            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{tab.name}</span>
                          </button>
                        )
                      })}
                    </nav>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-white px-6 py-6 max-h-96 overflow-y-auto">
                  {activeTab === 'overview' && editedContact && (
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
                            <input
                              type="text"
                              value={editedContact.firstName || ''}
                              onChange={(e) => updateContactField('firstName', e.target.value)}
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Last Name *</label>
                            <input
                              type="text"
                              value={editedContact.lastName || ''}
                              onChange={(e) => updateContactField('lastName', e.target.value)}
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                            <input
                              type="email"
                              value={editedContact.email || ''}
                              onChange={(e) => updateContactField('email', e.target.value)}
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                            <input
                              type="tel"
                              value={editedContact.phone || ''}
                              onChange={(e) => updateContactField('phone', e.target.value)}
                              placeholder="(555) 123-4567"
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Title/Position</label>
                            <input
                              type="text"
                              value={editedContact.title || ''}
                              onChange={(e) => updateContactField('title', e.target.value)}
                              placeholder="e.g., Purchasing Manager"
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Company *</label>
                            <input
                              type="text"
                              value={editedContact.company || ''}
                              onChange={(e) => updateContactField('company', e.target.value)}
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Industry</label>
                            <select
                              value={editedContact.industry || ''}
                              onChange={(e) => updateContactField('industry', e.target.value)}
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select industry...</option>
                              <option value="CPG (Consumer Packaged Goods)">CPG (Consumer Packaged Goods)</option>
                              <option value="Retail">Retail</option>
                              <option value="Food Service">Food Service</option>
                              <option value="Restaurant">Restaurant</option>
                              <option value="Grocery Chain">Grocery Chain</option>
                              <option value="Distributor">Distributor</option>
                              <option value="Wholesaler">Wholesaler</option>
                              <option value="Food Processor">Food Processor</option>
                              <option value="Catering">Catering</option>
                              <option value="Institutional (Schools/Hospitals)">Institutional (Schools/Hospitals)</option>
                              <option value="Export">Export</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
                            <input
                              type="url"
                              value={editedContact.website || ''}
                              onChange={(e) => updateContactField('website', e.target.value)}
                              placeholder="https://"
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Address</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Street Address</label>
                            <input
                              type="text"
                              value={editedContact.address || ''}
                              onChange={(e) => updateContactField('address', e.target.value)}
                              placeholder="123 Main St"
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                            <input
                              type="text"
                              value={editedContact.city || ''}
                              onChange={(e) => updateContactField('city', e.target.value)}
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                            <input
                              type="text"
                              value={editedContact.state || ''}
                              onChange={(e) => updateContactField('state', e.target.value)}
                              placeholder="CA"
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">ZIP Code</label>
                            <input
                              type="text"
                              value={editedContact.zipCode || ''}
                              onChange={(e) => updateContactField('zipCode', e.target.value)}
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                            <input
                              type="text"
                              value={editedContact.country || 'USA'}
                              onChange={(e) => updateContactField('country', e.target.value)}
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Business Details */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Business Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                            <select
                              value={editedContact.tags?.[0] || editedContact.status || ''}
                              onChange={(e) => {
                                const value = e.target.value
                                updateContactField('tags', value ? [value] : [])
                                updateContactField('status', value as any)
                              }}
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select status...</option>
                              <option value="active">Active</option>
                              <option value="prospect">Prospect</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      {/* Primary Crops */}
                      {contact.primaryCrops.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Primary Crop Interests</h4>
                          <div className="flex flex-wrap gap-2">
                            {contact.primaryCrops.map((crop) => (
                              <span key={crop} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {crop}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Notes */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Notes</h4>
                        <textarea
                          value={editedContact.notes || ''}
                          onChange={(e) => updateContactField('notes', e.target.value)}
                          rows={3}
                          placeholder="Add notes about this contact..."
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* Special Terms */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Special Terms</h4>
                        <textarea
                          value={editedContact.specialTerms || ''}
                          onChange={(e) => updateContactField('specialTerms', e.target.value)}
                          rows={2}
                          placeholder="Add special pricing or delivery terms..."
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-yellow-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'pricesheet' && (
                    <div className="space-y-6">
                      {/* Delivery Method */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Delivery Method</h4>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <input
                              id="delivery-email"
                              name="delivery-method"
                              type="radio"
                              checked={pricesheetSettings.deliveryMethod === 'email'}
                              onChange={() => updateDeliveryMethod('email')}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <label htmlFor="delivery-email" className="ml-3 flex items-center">
                              <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">Email ({contact.email})</span>
                            </label>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center opacity-50 cursor-not-allowed">
                              <input
                                id="delivery-sms"
                                name="delivery-method"
                                type="radio"
                                checked={false}
                                disabled
                                className="h-4 w-4 text-gray-400 border-gray-300 cursor-not-allowed"
                              />
                              <label htmlFor="delivery-sms" className="ml-3 flex items-center">
                                <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-500">SMS ({contact.phone})</span>
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Coming Soon
                                </span>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delivered Pricing */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-900">Delivered Pricing</h4>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={deliveredPricingEnabled}
                              onChange={(e) => {
                                setDeliveredPricingEnabled(e.target.checked)
                                setPricesheetSettings(prev => ({
                                  ...prev,
                                  deliveredPricing: e.target.checked,
                                  deliveryZipCode: e.target.checked ? prev.deliveryZipCode : ''
                                }))
                                setHasUnsavedChanges(true)
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        
                        {deliveredPricingEnabled && (
                          <>
                            <p className="text-xs text-gray-500 mb-3">Include freight costs in pricing based on delivery location</p>
                            <div className="flex items-center space-x-3">
                              <label htmlFor="delivery-zip" className="text-sm text-gray-700">
                                Delivery Zip Code:
                              </label>
                              <input
                                id="delivery-zip"
                                type="text"
                                maxLength={5}
                                pattern="[0-9]{5}"
                                placeholder="12345"
                                value={pricesheetSettings.deliveryZipCode || ''}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 5)
                                  setPricesheetSettings(prev => ({
                                    ...prev,
                                    deliveryZipCode: value
                                  }))
                                  setHasUnsavedChanges(true)
                                }}
                                className="block w-28 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Global Pricing Adjustment */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-900">Global Pricing Adjustment</h4>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={globalAdjustmentEnabled}
                              onChange={(e) => {
                                setGlobalAdjustmentEnabled(e.target.checked)
                                if (!e.target.checked) {
                                  updateGlobalAdjustment(0)
                                }
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        
                        {globalAdjustmentEnabled && (
                          <>
                            <p className="text-xs text-gray-500 mb-3">Apply a percentage adjustment to all items on price sheets for this contact</p>
                            <div className="flex items-center space-x-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setGlobalAdjustmentIsNegative(!globalAdjustmentIsNegative)
                                  const currentValue = Math.abs(pricesheetSettings.globalAdjustment) || 0
                                  updateGlobalAdjustment(globalAdjustmentIsNegative ? Math.abs(currentValue) : -Math.abs(currentValue))
                                }}
                                className="relative inline-flex items-center h-7 w-14 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 hover:shadow-md"
                                style={{
                                  backgroundColor: globalAdjustmentIsNegative ? '#FCA5A5' : '#BBF7D0'
                                }}
                              >
                                <span
                                  className="inline-block h-5 w-5 transform rounded-full transition-all duration-200 shadow-sm flex items-center justify-center font-semibold"
                                  style={{
                                    backgroundColor: 'white',
                                    color: globalAdjustmentIsNegative ? '#DC2626' : '#15803D',
                                    transform: globalAdjustmentIsNegative ? 'translateX(2px)' : 'translateX(calc(56px - 1.25rem - 2px))',
                                    fontSize: '14px'
                                  }}
                                >
                                  {globalAdjustmentIsNegative ? '−' : '+'}
                                </span>
                              </button>
                              <input
                                type="number"
                                min="0"
                                max="50"
                                step="0.1"
                                placeholder="0"
                                value={Math.abs(pricesheetSettings.globalAdjustment) || ''}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0
                                  updateGlobalAdjustment(globalAdjustmentIsNegative ? -Math.abs(value) : Math.abs(value))
                                }}
                                className="block w-20 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-900">%</span>
                              <span className="text-xs text-gray-500">
                                {pricesheetSettings.globalAdjustment > 0 ? 'markup' : pricesheetSettings.globalAdjustment < 0 ? 'discount' : 'no adjustment'}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Individual Crop Adjustments */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Individual Crop Adjustments</h4>
                            <p className="text-xs text-gray-500">
                              Override global adjustment for specific crops
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            {/* Show Discount Strikethrough Toggle */}
                            <div className="flex items-center space-x-2">
                              <label className="text-xs text-gray-700">Show discount strikethrough:</label>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={pricesheetSettings.showDiscountStrikethrough}
                                  onChange={(e) => updateShowDiscountStrikethrough(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-3 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                            <div className="relative">
                            <button
                              onClick={() => setShowCropDropdown(!showCropDropdown)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <PlusIcon className="h-3 w-3 mr-1" />
                              Add Crop
                            </button>
                            
                            {showCropDropdown && (
                              <div className="crop-dropdown absolute right-0 mt-1 w-80 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                                {isLoadingCrops ? (
                                  <div className="p-4 text-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                                    <span className="text-xs text-gray-500 mt-2">Loading...</span>
                                  </div>
                                ) : Object.keys(availableCrops).length === 0 ? (
                                  <div className="p-4 text-center text-xs text-gray-500">
                                    No crops available
                                  </div>
                                ) : !selectedCommodity ? (
                                  <div className="py-1">
                                    <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                                      Select a commodity:
                                    </div>
                                    {Object.keys(availableCrops).map((commodity) => (
                                      <button
                                        key={commodity}
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          setSelectedCommodity(commodity)
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 flex items-center justify-between"
                                      >
                                        <span className="font-medium">{commodity}</span>
                                        <span className="text-xs text-gray-500">
                                          {availableCrops[commodity].length} variations →
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="py-1">
                                    <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b flex items-center justify-between">
                                      <span>{selectedCommodity} variations:</span>
                                      <button
                                        onClick={() => setSelectedCommodity(null)}
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        ← Back
                                      </button>
                                    </div>
                                    {availableCrops[selectedCommodity].length > 1 && (
                                      <button
                                        onClick={() => {
                                          // Add all variations for this commodity
                                          availableCrops[selectedCommodity].forEach((crop: any) => {
                                            if (!pricesheetSettings.cropAdjustments.some(adj => 
                                              adj.cropId === crop.cropId && adj.variationId === crop.variationId
                                            )) {
                                              addCropAdjustment(crop)
                                            }
                                          })
                                          setShowCropDropdown(false)
                                          setSelectedCommodity(null)
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 border-b"
                                      >
                                        Apply to all variations within this commodity
                                      </button>
                                    )}
                                    {availableCrops[selectedCommodity]
                                      .filter((crop: any) => !pricesheetSettings.cropAdjustments.some(adj => 
                                        adj.cropId === crop.cropId && adj.variationId === crop.variationId
                                      ))
                                      .map((crop: any) => (
                                        <button
                                          key={`${crop.cropId}-${crop.variationId}`}
                                          onClick={() => {
                                            addCropAdjustment(crop)
                                            setShowCropDropdown(false)
                                            setSelectedCommodity(null)
                                          }}
                                          className="w-full text-left px-4 py-2 text-xs text-gray-900 hover:bg-gray-100 flex items-center justify-between"
                                        >
                                          <span className="truncate">{crop.cropName || 'Standard'}</span>
                                          {crop.isOrganic && (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                                              Organic
                                            </span>
                                          )}
                                        </button>
                                      ))
                                    }
                                  </div>
                                )}
                              </div>
                            )}
                            </div>
                          </div>
                        </div>

                        {isLoadingCrops ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                            <span className="text-xs text-gray-500 mt-2">Loading crops...</span>
                          </div>
                        ) : pricesheetSettings.cropAdjustments.length === 0 ? (
                          <div className="text-center py-6 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">No individual crop adjustments set</p>
                            <p className="text-xs text-gray-400 mt-1">All crops will use the global adjustment</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {pricesheetSettings.cropAdjustments.map((adjustment) => {
                              const isNegative = adjustment.isNegative ?? (adjustment.adjustment < 0)
                              return (
                                <div key={`${adjustment.cropId}-${adjustment.variationId}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex-1">
                                    <span className="text-sm font-medium text-gray-900">{adjustment.cropName}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentValue = Math.abs(adjustment.adjustment) || 0
                                        const newValue = isNegative ? Math.abs(currentValue) : -Math.abs(currentValue)
                                        setPricesheetSettings(prev => ({
                                          ...prev,
                                          cropAdjustments: prev.cropAdjustments.map(adj =>
                                            adj.cropId === adjustment.cropId && adj.variationId === adjustment.variationId
                                              ? { ...adj, adjustment: newValue, isNegative: !isNegative }
                                              : adj
                                          )
                                        }))
                                        setHasUnsavedChanges(true)
                                      }}
                                      className="relative inline-flex items-center h-6 w-12 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 hover:shadow-md"
                                      style={{
                                        backgroundColor: isNegative ? '#FCA5A5' : '#BBF7D0'
                                      }}
                                    >
                                      <span
                                        className="inline-block h-4 w-4 transform rounded-full transition-all duration-200 shadow-sm flex items-center justify-center font-semibold"
                                        style={{
                                          backgroundColor: 'white',
                                          color: isNegative ? '#DC2626' : '#15803D',
                                          transform: isNegative ? 'translateX(2px)' : 'translateX(calc(48px - 1rem - 2px))',
                                          fontSize: '12px'
                                        }}
                                      >
                                        {isNegative ? '−' : '+'}
                                      </span>
                                    </button>
                                    <input
                                      type="number"
                                      min="0"
                                      max="50"
                                      step="0.1"
                                      placeholder="0"
                                      value={Math.abs(adjustment.adjustment) || ''}
                                      onChange={(e) => {
                                        const value = parseFloat(e.target.value) || 0
                                        updateCropAdjustment(adjustment.cropId, adjustment.variationId, isNegative ? -Math.abs(value) : Math.abs(value))
                                      }}
                                      className="block w-16 rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                    <span className="text-xs text-gray-900">%</span>
                                    <button
                                      onClick={() => removeCropAdjustment(adjustment.cropId, adjustment.variationId)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <MinusIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* Preview Section */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Pricing Preview</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-800 mb-2">Example: $10.00 baseline price</p>
                          <div className="space-y-1 text-xs">
                            {globalAdjustmentEnabled && (
                              <div className="flex justify-between">
                                <span className="text-blue-700">Global adjustment ({pricesheetSettings.globalAdjustment}%):</span>
                                <span className="font-medium text-blue-900">
                                  ${(10 * (1 + pricesheetSettings.globalAdjustment / 100)).toFixed(2)}
                                </span>
                              </div>
                            )}
                            {pricesheetSettings.cropAdjustments.length > 0 && (
                              <div className={`${globalAdjustmentEnabled ? 'border-t border-blue-200 pt-2 mt-2' : ''}`}>
                                <p className="text-blue-700 mb-1">
                                  Individual crop adjustments {globalAdjustmentEnabled ? '(override global)' : ''}:
                                </p>
                                {pricesheetSettings.cropAdjustments.slice(0, 3).map((adj) => (
                                  <div key={`${adj.cropId}-${adj.variationId}`} className="flex justify-between">
                                    <span className="text-blue-600 truncate">{adj.cropName} ({adj.adjustment}%):</span>
                                    <span className="font-medium text-blue-900 ml-2">
                                      ${(10 * (1 + adj.adjustment / 100)).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                                {pricesheetSettings.cropAdjustments.length > 3 && (
                                  <p className="text-blue-600 text-xs">...and {pricesheetSettings.cropAdjustments.length - 3} more</p>
                                )}
                              </div>
                            )}
                            {!globalAdjustmentEnabled && pricesheetSettings.cropAdjustments.length === 0 && (
                              <p className="text-blue-700">No pricing adjustments configured</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'history' && (
                    <div className="space-y-4">
                      {isLoadingHistory ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-4">Loading history...</p>
                        </div>
                      ) : priceSheetHistory.length === 0 ? (
                        <div className="text-center py-8">
                          <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-sm font-medium text-gray-900 mb-2">No Price Sheets Sent Yet</h3>
                          <p className="text-sm text-gray-500">
                            Price sheets sent to this contact will appear here.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-700">Price Sheets Sent</h4>
                          <div className="space-y-3">
                            {priceSheetHistory.map((item) => (
                              <div 
                                key={item.id} 
                                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="text-sm font-medium text-gray-900">
                                      {item.priceSheetTitle}
                                    </h5>
                                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                      <div className="flex items-center">
                                        <EnvelopeIcon className="h-4 w-4 mr-1" />
                                        Sent via Email
                                      </div>
                                      <div>
                                        {new Date(item.sentAt).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                          hour: 'numeric',
                                          minute: '2-digit'
                                        })}
                                      </div>
                                    </div>
                                    {item.opened && (
                                      <div className="mt-2 flex items-center text-xs">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                          ✓ Opened {item.viewCount} {item.viewCount === 1 ? 'time' : 'times'}
                                        </span>
                                        {item.lastViewedAt && (
                                          <span className="ml-2 text-gray-500">
                                            Last viewed {new Date(item.lastViewedAt).toLocaleDateString('en-US', {
                                              month: 'short',
                                              day: 'numeric'
                                            })}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {!item.opened && (
                                      <div className="mt-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                          Not opened yet
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => {
                                      // Open personalized price sheet with contact-specific pricing
                                      window.open(item.personalizedUrl, '_blank')
                                    }}
                                    className="ml-4 inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md border border-blue-300"
                                  >
                                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                                    View
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Contact created {formatDate(contact.createdAt)}
                  </div>
                  <div className="flex items-center space-x-3">
                    {hasUnsavedChanges && (
                      <button
                        type="button"
                        onClick={activeTab === 'overview' ? handleSaveOverview : handleSavePricesheetSettings}
                        disabled={isSaving}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
