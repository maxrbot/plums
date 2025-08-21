"use client"

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, UserPlusIcon, TagIcon } from '@heroicons/react/24/outline'
import { Contact, CropManagement } from '../../types'
import { cropsApi } from '../../lib/api'

interface AddContactModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'interactions' | 'totalOrders' | 'lifetimeValue' | 'lastContactDate' | 'firstOrderDate' | 'lastOrderDate'>) => void
}

// Available tags for quick selection
const availableTags = [
  { id: 'premium', name: 'Premium', color: 'bg-purple-100 text-purple-800' },
  { id: 'priority', name: 'Priority', color: 'bg-red-100 text-red-800' },
  { id: 'organic', name: 'Organic', color: 'bg-green-100 text-green-800' },
  { id: 'volume', name: 'Volume', color: 'bg-orange-100 text-orange-800' },
  { id: 'local', name: 'Local', color: 'bg-blue-100 text-blue-800' },
  { id: 'new_customer', name: 'New Customer', color: 'bg-yellow-100 text-yellow-800' }
]

export default function AddContactModal({ isOpen, onClose, onSave }: AddContactModalProps) {
  const [availableCrops, setAvailableCrops] = useState<string[]>([])
  const [isLoadingCrops, setIsLoadingCrops] = useState(false)

  // Load user's commodities when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUserCrops()
    }
  }, [isOpen])

  const loadUserCrops = async () => {
    try {
      setIsLoadingCrops(true)
      const response = await cropsApi.getAll()
      console.log('loadUserCrops - API response:', response)
      
      const crops = response.crops || []
      // Extract unique commodities from user's crop management
      const commodities = Array.from(new Set(crops.map((crop: CropManagement) => crop.commodity))).sort()
      console.log('loadUserCrops - extracted commodities:', commodities)
      
      setAvailableCrops(commodities)
    } catch (err) {
      console.error('Failed to load user crops:', err)
      // Fallback to some basic crops if API fails
      setAvailableCrops(['Strawberries', 'Lettuce', 'Tomatoes', 'Broccoli'])
    } finally {
      setIsLoadingCrops(false)
    }
  }

  // Phone formatting function
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '')
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
    }
  }

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    company: '',
    companySize: '' as 'small' | 'medium' | 'large' | 'enterprise' | '',
    industry: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    tags: [] as string[],
    primaryCrops: [] as string[],
    orderFrequency: '' as 'weekly' | 'monthly' | 'seasonal' | 'sporadic' | '',
    averageOrderValue: '',
    preferredContactMethod: 'email' as 'email' | 'phone' | 'text',
    status: 'prospect' as 'prospect' | 'active' | 'inactive' | 'do_not_contact',
    relationshipStage: 'cold' as 'cold' | 'warm' | 'hot' | 'customer',
    pricingTier: 'new_prospect' as 'premium' | 'standard' | 'volume' | 'new_prospect',
    pricingAdjustment: 0,
    specialTerms: '',
    source: 'manual' as 'manual' | 'csv_import' | 'lead_form' | 'referral',
    notes: ''
  })



  const handleSubmit = (e: React.FormEvent, saveAndAddAnother = false) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.company) {
      alert('Please fill in all required fields (First Name, Last Name, Email, Company)')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address')
      return
    }

    // Prepare contact data
    const contactData = {
      ...formData,
      averageOrderValue: formData.averageOrderValue ? parseFloat(formData.averageOrderValue) : undefined,
      companySize: formData.companySize || undefined,
      orderFrequency: formData.orderFrequency || undefined
    }

    onSave(contactData)
    
    if (saveAndAddAnother) {
      // Reset form but keep some fields
      setFormData(prev => ({
        ...prev,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        title: '',
        notes: ''
      }))
    } else {
      handleClose()
    }
  }

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      title: '',
      company: '',
      companySize: '',
      industry: '',
      website: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      tags: [],
      primaryCrops: [],
      orderFrequency: '',
      averageOrderValue: '',
      preferredContactMethod: 'email',
      status: 'prospect',
      relationshipStage: 'cold',
      pricingTier: 'new_prospect',
      pricingAdjustment: 0,
      specialTerms: '',
      source: 'manual',
      notes: ''
    })

    onClose()
  }

  const toggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId) 
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }))
  }

  const toggleCrop = (crop: string) => {
    setFormData(prev => ({
      ...prev,
      primaryCrops: prev.primaryCrops.includes(crop)
        ? prev.primaryCrops.filter(c => c !== crop)
        : [...prev.primaryCrops, crop]
    }))
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <form onSubmit={(e) => handleSubmit(e)}>
                  {/* Header */}
                  <div className="bg-white px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                          <UserPlusIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                            Add New Contact
                          </Dialog.Title>
                          <p className="text-sm text-gray-500">Add a new contact to your CRM</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="bg-white px-6 py-6 max-h-96 overflow-y-auto">
                    <div className="space-y-6">
                      
                      {/* Basic Information */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Basic Information *</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                              First Name *
                            </label>
                            <input
                              type="text"
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                              placeholder="Enter first name"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                              Last Name *
                            </label>
                            <input
                              type="text"
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                              placeholder="Enter last name"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                              Email *
                            </label>
                            <input
                              type="email"
                              id="email"
                              value={formData.email}
                              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                              placeholder="contact@company.com"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                              Phone
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => {
                                const formatted = formatPhoneNumber(e.target.value)
                                setFormData(prev => ({ ...prev, phone: formatted }))
                              }}
                              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                              placeholder="(555) 123-4567"
                              maxLength={14}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Company Information */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Company Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                              Company *
                            </label>
                            <input
                              type="text"
                              id="company"
                              value={formData.company}
                              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                              placeholder="Company name"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                              Title/Position
                            </label>
                            <input
                              type="text"
                              id="title"
                              value={formData.title}
                              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                              placeholder="e.g. Purchasing Manager"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Business Details */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Business Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="pricingTier" className="block text-sm font-medium text-gray-700 mb-1">
                              Pricing Tier
                            </label>
                            <select
                              id="pricingTier"
                              value={formData.pricingTier}
                              onChange={(e) => setFormData(prev => ({ ...prev, pricingTier: e.target.value as 'premium' | 'standard' | 'volume' | 'new_prospect' }))}
                              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            >
                              <option value="new_prospect">New Prospect</option>
                              <option value="standard">Standard</option>
                              <option value="volume">Volume</option>
                              <option value="premium">Premium</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="relationshipStage" className="block text-sm font-medium text-gray-700 mb-1">
                              Relationship Stage
                            </label>
                            <select
                              id="relationshipStage"
                              value={formData.relationshipStage}
                              onChange={(e) => setFormData(prev => ({ ...prev, relationshipStage: e.target.value as 'cold' | 'warm' | 'hot' | 'customer' }))}
                              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            >
                              <option value="cold">Cold</option>
                              <option value="warm">Warm</option>
                              <option value="hot">Hot</option>
                              <option value="customer">Customer</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <TagIcon className="h-4 w-4 text-gray-600" />
                          <h4 className="text-sm font-medium text-gray-900">Tags</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {availableTags.map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => toggleTag(tag.id)}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                formData.tags.includes(tag.id)
                                  ? tag.color
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {tag.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Primary Crops */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Primary Crop Interests</h4>
                        {isLoadingCrops ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-sm text-gray-500">Loading your crops...</span>
                          </div>
                        ) : availableCrops.length === 0 ? (
                          <div className="text-center py-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-700 mb-2">No crops found in your crop management.</p>
                            <p className="text-xs text-yellow-600">
                              Add crops to your <a href="/dashboard/price-sheets/crops" className="underline">Crop Management</a> first.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                            {availableCrops.map((crop) => (
                              <label key={crop} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={formData.primaryCrops.includes(crop)}
                                  onChange={() => toggleCrop(crop)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">{crop}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          rows={3}
                          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                          placeholder="Additional notes about this contact..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      * Required fields
                    </p>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleSubmit(e, true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                      >
                        Save & Add Another
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <UserPlusIcon className="h-4 w-4 mr-2" />
                        Save Contact
                      </button>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
