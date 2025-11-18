"use client"

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  CalendarIcon,
  ClockIcon,
  PaperAirplaneIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../../components/ui'
import { Contact } from '../../../../../types'
import { useUser } from '../../../../../contexts/UserContext'
import EmailPreviewModal from '../../../../../components/modals/EmailPreviewModal'
import SMSPreviewModal from '../../../../../components/modals/SMSPreviewModal'
import PriceSheetPreviewModal from '../../../../../components/modals/PriceSheetPreviewModal'
import { contactsApi, priceSheetsApi } from '../../../../../lib/api'
import { formatProductForPreview } from '../../../../../lib/priceSheetUtils'

interface PriceSheet {
  _id: string
  title: string
  productsCount?: number
  status?: string
}

// Mock data - fallback if no URL params
const mockSelectedContacts: Contact[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    company: 'Fresh Market Co.',
    email: 'john@freshmarket.com',
    phone: '(555) 123-4567',
    pricingAdjustment: -15,
    preferredContactMethod: 'email',
    pricesheetSettings: {
      deliveryMethod: 'email',
      globalAdjustment: -15,
      cropAdjustments: [],
      showDiscountStrikethrough: true
    }
  },
  {
    id: '2', 
    firstName: 'Sarah',
    lastName: 'Johnson',
    company: 'Valley Distributors',
    email: 'sarah@valleydist.com',
    phone: '(555) 234-5678',
    pricingAdjustment: 5,
    preferredContactMethod: 'email',
    pricesheetSettings: {
      deliveryMethod: 'both',
      globalAdjustment: 5,
      cropAdjustments: [],
      showDiscountStrikethrough: false
    }
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Chen',
    company: 'Organic Plus',
    email: 'mike@organicplus.com', 
    phone: '(555) 345-6789',
    pricingAdjustment: 0,
    preferredContactMethod: 'phone',
    pricesheetSettings: {
      deliveryMethod: 'sms',
      globalAdjustment: 0,
      cropAdjustments: [],
      showDiscountStrikethrough: true
    }
  },
  {
    id: '4',
    firstName: 'Lisa',
    lastName: 'Rodriguez',
    company: 'Coastal Produce',
    email: 'lisa@coastalproduce.com',
    phone: '(555) 456-7890',
    pricingAdjustment: -10,
    preferredContactMethod: 'email',
    pricesheetSettings: {
      deliveryMethod: 'email',
      globalAdjustment: -10,
      cropAdjustments: [],
      showDiscountStrikethrough: true
    }
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Park',
    company: 'Metro Foods',
    email: 'david@metrofoods.com',
    phone: '(555) 567-8901',
    pricingAdjustment: 0,
    preferredContactMethod: 'email',
    pricesheetSettings: {
      deliveryMethod: 'email',
      globalAdjustment: 0,
      cropAdjustments: [],
      showDiscountStrikethrough: false
    }
  },
  {
    id: '6',
    firstName: 'Amanda',
    lastName: 'Foster',
    company: 'Green Valley Market',
    email: 'amanda@greenvalley.com',
    phone: '(555) 678-9012',
    pricingAdjustment: 8,
    preferredContactMethod: 'email',
    pricesheetSettings: {
      deliveryMethod: 'both',
      globalAdjustment: 8,
      cropAdjustments: [],
      showDiscountStrikethrough: true
    }
  },
  {
    id: '7',
    firstName: 'Robert',
    lastName: 'Kim',
    company: 'Sunrise Distribution',
    email: 'robert@sunrisedist.com',
    phone: '(555) 789-0123',
    pricingAdjustment: -5,
    preferredContactMethod: 'phone',
    pricesheetSettings: {
      deliveryMethod: 'sms',
      globalAdjustment: -5,
      cropAdjustments: [],
      showDiscountStrikethrough: false
    }
  },
  {
    id: '8',
    firstName: 'Jennifer',
    lastName: 'Walsh',
    company: 'Premium Grocers',
    email: 'jennifer@premiumgrocers.com',
    phone: '(555) 890-1234',
    pricingAdjustment: 12,
    preferredContactMethod: 'email',
    pricesheetSettings: {
      deliveryMethod: 'email',
      globalAdjustment: 12,
      cropAdjustments: [],
      showDiscountStrikethrough: true
    }
  }
]

export default function ScheduleSendPage() {
  // User data
  const { user } = useUser()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get URL parameters
  const sheetId = searchParams.get('sheetId')
  const contactIdsParam = searchParams.get('contacts')
  const customMessage = searchParams.get('message')
  
  // State
  const [isLoading, setIsLoading] = useState(true)
  const [priceSheet, setPriceSheet] = useState<PriceSheet | null>(null)
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const [sendTiming, setSendTiming] = useState<'now' | 'scheduled'>('now')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('09:00')
  const [bccSelf, setBccSelf] = useState(false)
  const [timezone] = useState('America/Los_Angeles') // Would come from user settings
  const [isSending, setIsSending] = useState(false)
  const [sendProgress, setSendProgress] = useState(0)
  const [sentEmails, setSentEmails] = useState<string[]>([])
  const [trackingEnabled, setTrackingEnabled] = useState(true)
  
  // Email generation state
  const [isGeneratingEmails, setIsGeneratingEmails] = useState(false)
  const [emailsGenerated, setEmailsGenerated] = useState(false)
  
  // Store custom email content per contact
  const [customEmailContent, setCustomEmailContent] = useState<Record<string, { subject: string; content: string }>>({})
  
  // Custom pricing (per contact per product) - can be number (price) or string (comment)
  const [customPricing, setCustomPricing] = useState<Record<string, Record<string, number | string>>>({})
  
  // Custom price type (per contact) - FOB or DELIVERED
  const [customPriceType, setCustomPriceType] = useState<Record<string, 'FOB' | 'DELIVERED'>>({})
  
  // Preview modal state
  const [emailPreviewModal, setEmailPreviewModal] = useState<{ isOpen: boolean; contact: Contact | null }>({
    isOpen: false,
    contact: null
  })
  const [smsPreviewModal, setSmsPreviewModal] = useState<{ isOpen: boolean; contact: Contact | null }>({
    isOpen: false,
    contact: null
  })
  const [priceSheetPreviewModal, setPriceSheetPreviewModal] = useState<{ isOpen: boolean; contact: Contact | null }>({
    isOpen: false,
    contact: null
  })
  const [priceSheetProducts, setPriceSheetProducts] = useState<any[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  
  // Terms of Service state
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  // Load data from URL parameters
  useEffect(() => {
    const loadData = async () => {
      if (!sheetId || !contactIdsParam) {
        // Redirect back if missing params
        router.push('/dashboard/price-sheets/send')
        return
      }

      setIsLoading(true)
      
      try {
        // Fetch price sheet
        const sheetResponse = await priceSheetsApi.getById(sheetId)
        setPriceSheet(sheetResponse.priceSheet)
        
        // Fetch contacts
        const contactsResponse = await contactsApi.getAll()
        const allContacts = contactsResponse.contacts || contactsResponse || []
        const contactIds = contactIdsParam.split(',')
        const filteredContacts = allContacts.filter((c: Contact) => 
          contactIds.includes(c.id || (c as any)._id)
        )
        setSelectedContacts(filteredContacts)
        
      } catch (error) {
        console.error('Error loading data:', error)
        alert('Failed to load data. Redirecting back...')
        router.push('/dashboard/price-sheets/send')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [sheetId, contactIdsParam, router])
  
  // Set default scheduled date to tomorrow
  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setScheduledDate(tomorrow.toISOString().split('T')[0])
  }, [])

  // Preview modal handlers
  const handleEmailPreview = (contact: Contact) => {
    setEmailPreviewModal({ isOpen: true, contact })
  }

  const handleSMSPreview = (contact: Contact) => {
    setSmsPreviewModal({ isOpen: true, contact })
  }

  const handlePriceSheetPreview = async (contact: Contact) => {
    setPriceSheetPreviewModal({ isOpen: true, contact })
    
    // Fetch the actual price sheet products
    if (sheetId) {
      setIsLoadingProducts(true)
      try {
        const response = await priceSheetsApi.getProducts(sheetId)
        
        // Get custom pricing for this contact
        const contactId = contact.id || (contact as any)._id
        const contactCustomPricing = customPricing[contactId] || {}
        
        // Apply contact-specific pricing adjustments
        const pricesheetSettings = contact.pricesheetSettings || {}
        const globalAdjustment = pricesheetSettings.globalAdjustment || contact.pricingAdjustment || 0
        const cropAdjustments = pricesheetSettings.cropAdjustments || []
        
        // Build a map of crop-specific adjustments
        const cropAdjustmentMap = new Map()
        cropAdjustments.forEach((adj: any) => {
          const key = `${adj.cropId}-${adj.variationId}`
          cropAdjustmentMap.set(key, adj.adjustment)
        })
        
        // Map products to the format expected by PriceSheetPreviewModal
        const formattedProducts = response.products.map((product: any) => {
          const productId = product._id
          
          // Check for custom pricing first (highest priority)
          if (contactCustomPricing[productId] !== undefined) {
            const customValue = contactCustomPricing[productId]
            const isComment = typeof customValue === 'string'
            
            return formatProductForPreview(product, {
              adjustedPrice: isComment ? null : customValue,
              showStrikethrough: false
            })
          }
          
          // Otherwise, apply percentage-based adjustments
          // Start with global as base, then crop-specific overrides
          let adjustment = globalAdjustment || 0
          
          // Crop-specific adjustments override the global adjustment
          const cropKey = `${product.cropId}-${product.variationId}`
          if (cropAdjustmentMap.has(cropKey)) {
            adjustment = cropAdjustmentMap.get(cropKey) || 0
          }
          
          const basePrice = product.price || 0
          const adjustedPrice = adjustment !== 0 
            ? basePrice * (1 + adjustment / 100)
            : basePrice
          
          return formatProductForPreview(product, {
            adjustedPrice,
            showStrikethrough: pricesheetSettings.showDiscountStrikethrough && adjustment !== 0
          })
        })
        
        setPriceSheetProducts(formattedProducts)
      } catch (error) {
        console.error('Failed to load products:', error)
        setPriceSheetProducts([])
      } finally {
        setIsLoadingProducts(false)
      }
    }
  }

  const closeEmailPreview = () => {
    setEmailPreviewModal({ isOpen: false, contact: null })
  }

  const closeSMSPreview = () => {
    setSmsPreviewModal({ isOpen: false, contact: null })
  }

  const closePriceSheetPreview = () => {
    setPriceSheetPreviewModal({ isOpen: false, contact: null })
  }

  const handleSaveEmailContent = (contactId: string, subject: string, content: string) => {
    setCustomEmailContent(prev => ({
      ...prev,
      [contactId]: { subject, content }
    }))
    // Success message is shown in the modal, no need for alert
  }
  
  // Handle custom pricing for a specific contact and product (can be price or comment)
  const handleSaveCustomPricing = (contactId: string, productId: string, customValue: number | string) => {
    setCustomPricing(prev => ({
      ...prev,
      [contactId]: {
        ...(prev[contactId] || {}),
        [productId]: customValue
      }
    }))
  }
  
  // Handle price type change - store per contact (like custom pricing)
  const handlePriceTypeChange = (newPriceType: 'FOB' | 'DELIVERED') => {
    const contact = priceSheetPreviewModal.contact
    if (!contact) return
    
    const contactId = contact.id || (contact as any)._id
    
    // Store the price type for this specific contact
    setCustomPriceType(prev => ({
      ...prev,
      [contactId]: newPriceType
    }))
    
    console.log('💰 Price type set for contact:', contactId, '→', newPriceType)
  }

  const handleGenerateEmails = async () => {
    setIsGeneratingEmails(true)
    
    // Simulate AI processing time (3 seconds for realistic feel)
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setIsGeneratingEmails(false)
    setEmailsGenerated(true)
  }
  
  // Auto-generate emails on page load
  useEffect(() => {
    if (selectedContacts.length > 0 && !emailsGenerated && !isGeneratingEmails) {
      handleGenerateEmails()
    }
  }, [selectedContacts.length]) // Only run when contacts are loaded

  const handleSendEmails = async () => {
    if (!termsAccepted) {
      alert('Please accept the Terms of Service to send emails')
      return
    }
    
    if (!sheetId) {
      alert('Missing price sheet ID')
      return
    }

    setIsSending(true)
    setSendProgress(0)
    setSentEmails([])

    try {
      const contactIds = selectedContacts.map(c => c.id || (c as any)._id)
      
      // Build custom content map for contacts with edited emails
      const customContentMap: Record<string, { subject?: string; content?: string }> = {}
      Object.keys(customEmailContent).forEach(contactId => {
        if (contactIds.includes(contactId)) {
          customContentMap[contactId] = customEmailContent[contactId]
        }
      })
      
      // Build custom pricing map for contacts with modified prices
      const customPricingMap: Record<string, Record<string, number>> = {}
      Object.keys(customPricing).forEach(contactId => {
        if (contactIds.includes(contactId)) {
          customPricingMap[contactId] = customPricing[contactId]
        }
      })
      
      // Build custom price type map for contacts with modified price types
      const customPriceTypeMap: Record<string, 'FOB' | 'DELIVERED'> = {}
      Object.keys(customPriceType).forEach(contactId => {
        if (contactIds.includes(contactId)) {
          customPriceTypeMap[contactId] = customPriceType[contactId]
        }
      })
      
      // Call real API to send emails with custom content, pricing, and price types
      const result = await priceSheetsApi.send(sheetId, {
        contactIds,
        subject: priceSheet?.title,
        customMessage: customMessage || undefined,
        customEmailContent: Object.keys(customContentMap).length > 0 ? customContentMap : undefined,
        customPricing: Object.keys(customPricingMap).length > 0 ? customPricingMap : undefined,
        customPriceType: Object.keys(customPriceTypeMap).length > 0 ? customPriceTypeMap : undefined,
        bccSender: bccSelf
      })

      // Show success
      alert(`✅ Successfully sent to ${result.sent} contact(s)!${result.failed > 0 ? `\n⚠️ Failed to send to ${result.failed} contact(s).` : ''}`)
      
      // Mark all as sent
      setSentEmails(contactIds)
      setSendProgress(100)
      
      // Redirect to analytics page after sending
      setTimeout(() => {
        router.push('/dashboard/analytics')
      }, 2000)

    } catch (error: any) {
      console.error('Error sending emails:', error)
      alert(`❌ Failed to send emails: ${error.message || 'Unknown error'}`)
    } finally {
      setTimeout(() => {
        setIsSending(false)
      }, 500)
    }
  }

  const renderDeliveryMethod = (contact: Contact) => {
    const pricesheetSettings = contact.pricesheetSettings || {}
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
            <span>Both</span>
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

  const getLocalTime = (contact: Contact) => {
    // Mock timezone logic - would use actual timezone data
    const timezones = {
      'Fresh Market Co.': 'EST (9:00 AM)',
      'Valley Distributors': 'PST (6:00 AM)', 
      'Organic Plus': 'CST (8:00 AM)'
    }
    return timezones[contact.company as keyof typeof timezones] || 'PST (6:00 AM)'
  }

  return (
    <>
      <Breadcrumbs 
        items={[
          { label: 'Price Sheets', href: '/dashboard/price-sheets' },
          { label: 'Send Price Sheets', href: '/dashboard/price-sheets/send' },
          { label: 'Schedule & Send', current: true }
        ]} 
        className="mb-4"
      />

      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading price sheet and contacts...</p>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && (
          <>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Review & Send</h1>
                  <p className="text-gray-600 mt-1">
                    {priceSheet?.title} • {selectedContacts.length} recipient{selectedContacts.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  <GlobeAltIcon className="h-4 w-4 inline mr-1" />
                  Your timezone: {timezone.replace('_', ' ')}
                </div>
              </div>


              {/* Generating State - Auto-triggered */}
              {isGeneratingEmails && (
                <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
                  <div className="flex items-center justify-center mb-6">
                    <SparklesIcon className="h-12 w-12 text-blue-600 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                    ✨ Generating personalized emails...
                  </h3>
                  
                  {/* Progress Bar */}
                  <div className="max-w-md mx-auto mb-6">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Status Steps */}
                  <div className="space-y-3 max-w-md mx-auto text-sm">
                    <div className="flex items-center text-gray-700">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Analyzing contact preferences</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Customizing pricing for {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Personalizing messages</span>
                    </div>
                    <div className="flex items-center text-green-600 font-medium">
                      <CheckCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span>Ready to send!</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Success - Show Recipients */}
              {emailsGenerated && !isSending && sentEmails.length === 0 && (
                <>
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-sm text-green-800 font-medium">
                        ✨ All emails generated and ready to send!
                      </p>
                    </div>
                  </div>

              {/* Final Review */}
              <div className="mb-8">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Final Review</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-6 max-h-96 overflow-y-auto">
                    {(() => {
                      // Group contacts by delivery method (default to email if not set)
                      const emailContacts = selectedContacts.filter(c => {
                        const deliveryMethod = c.pricesheetSettings?.deliveryMethod || 
                          (c.preferredContactMethod === 'phone' ? 'sms' : 'email')
                        return deliveryMethod === 'email'
                      })
                      const smsContacts = selectedContacts.filter(c => {
                        const deliveryMethod = c.pricesheetSettings?.deliveryMethod || 
                          (c.preferredContactMethod === 'phone' ? 'sms' : 'email')
                        return deliveryMethod === 'sms'
                      })
                      const bothContacts = selectedContacts.filter(c => {
                        const deliveryMethod = c.pricesheetSettings?.deliveryMethod || 
                          (c.preferredContactMethod === 'phone' ? 'sms' : 'email')
                        return deliveryMethod === 'both'
                      })
                      
                      let contactIndex = 0
                      
                      return (
                        <>
                          {/* Email Delivery Group */}
                          {emailContacts.length > 0 && (
                            <div>
                              <div className="flex items-center space-x-2 mb-3">
                                <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                                <h4 className="text-sm font-medium text-gray-900">Email Delivery</h4>
                                <span className="text-xs text-gray-500">({emailContacts.length} contacts)</span>
                              </div>
                              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-100">
                                    {emailContacts.map((contact) => {
                                      contactIndex++
                                      const contactId = contact.id || (contact as any)._id
                                      const hasCustomEmail = !!customEmailContent[contactId]
                                      const hasCustomPricing = !!customPricing[contactId]
                                      
                                      return (
                                        <tr key={contact.id} className="hover:bg-gray-50">
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                              {contactIndex}
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <p className="text-sm font-medium text-gray-900">{contact.company}</p>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <p className="text-sm text-gray-900">{contact.firstName} {contact.lastName}</p>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <p className="text-sm text-gray-600">{contact.email}</p>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                              <button 
                                                onClick={() => handleEmailPreview(contact)}
                                                className={`relative inline-flex items-center px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                                                  hasCustomEmail
                                                    ? 'text-blue-700 bg-blue-50 border-blue-300 hover:bg-blue-100'
                                                    : 'text-blue-600 bg-white border-blue-200 hover:bg-blue-50'
                                                }`}
                                              >
                                                <EnvelopeIcon className="h-3 w-3 mr-1" />
                                                Preview Email
                                                {hasCustomEmail && (
                                                  <span className="ml-1 text-xs font-medium">
                                                    (edited)
                                                  </span>
                                                )}
                                              </button>
                                              <button 
                                                onClick={() => handlePriceSheetPreview(contact)}
                                                className={`relative inline-flex items-center px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                                                  hasCustomPricing
                                                    ? 'text-orange-700 bg-orange-50 border-orange-300 hover:bg-orange-100'
                                                    : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'
                                                }`}
                                              >
                                                <DocumentTextIcon className="h-3 w-3 mr-1" />
                                                Sheet
                                                {hasCustomPricing && (
                                                  <span className="ml-1 text-xs font-medium">
                                                    (edited)
                                                  </span>
                                                )}
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                          
                          {/* SMS Delivery Group */}
                          {smsContacts.length > 0 && (
                            <div>
                              <div className="flex items-center space-x-2 mb-3">
                                <DevicePhoneMobileIcon className="h-4 w-4 text-green-600" />
                                <h4 className="text-sm font-medium text-gray-900">SMS Delivery</h4>
                                <span className="text-xs text-gray-500">({smsContacts.length} contacts)</span>
                              </div>
                              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                {smsContacts.map((contact) => {
                                  contactIndex++
                                  return (
                                    <div key={contact.id} className={`flex items-center justify-between px-4 py-3 ${contactIndex < selectedContacts.length ? 'border-b border-gray-100' : ''}`}>
                                      <div className="flex items-center space-x-3 flex-1">
                                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                          {contactIndex}
                                        </div>
                                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900 truncate">{contact.company}</p>
                                          <span className="text-xs text-gray-400 flex-shrink-0">•</span>
                                          <p className="text-xs text-gray-600 truncate">{contact.firstName} {contact.lastName}</p>
                                          {customPricing[contact.id || (contact as any)._id] && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 ml-2">
                                              💰 Custom Pricing
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2 flex-shrink-0">
                                        <button 
                                          onClick={() => handleSMSPreview(contact)}
                                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-500 hover:bg-green-50 rounded border border-green-200"
                                        >
                                          <DevicePhoneMobileIcon className="h-3 w-3 mr-1" />
                                          Preview SMS
                                        </button>
                                        <button 
                                          onClick={() => handlePriceSheetPreview(contact)}
                                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-500 hover:bg-gray-50 rounded border border-gray-200"
                                        >
                                          <DocumentTextIcon className="h-3 w-3 mr-1" />
                                          Sheet
                                        </button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          
                          {/* Both Email & SMS Group */}
                          {bothContacts.length > 0 && (
                            <div>
                              <div className="flex items-center space-x-2 mb-3">
                                <div className="flex items-center space-x-1">
                                  <EnvelopeIcon className="h-4 w-4 text-purple-600" />
                                  <DevicePhoneMobileIcon className="h-4 w-4 text-purple-600" />
                                </div>
                                <h4 className="text-sm font-medium text-gray-900">Email & SMS Delivery</h4>
                                <span className="text-xs text-gray-500">({bothContacts.length} contacts)</span>
                              </div>
                              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                {bothContacts.map((contact) => {
                                  contactIndex++
                                  return (
                                    <div key={contact.id} className={`flex items-center justify-between px-4 py-3 ${contactIndex < selectedContacts.length ? 'border-b border-gray-100' : ''}`}>
                                      <div className="flex items-center space-x-3 flex-1">
                                        <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                          {contactIndex}
                                        </div>
                                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900 truncate">{contact.company}</p>
                                          <span className="text-xs text-gray-400 flex-shrink-0">•</span>
                                          <p className="text-xs text-gray-600 truncate">{contact.firstName} {contact.lastName}</p>
                                          {customEmailContent[contact.id || (contact as any)._id] && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                                              ✏️ Custom Email
                                            </span>
                                          )}
                                          {customPricing[contact.id || (contact as any)._id] && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 ml-2">
                                              💰 Custom Pricing
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-1 flex-shrink-0">
                                        <button 
                                          onClick={() => handleEmailPreview(contact)}
                                          className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-500 hover:bg-blue-50 rounded border border-blue-200"
                                        >
                                          <EnvelopeIcon className="h-3 w-3 mr-1" />
                                          Email
                                        </button>
                                        <button 
                                          onClick={() => handleSMSPreview(contact)}
                                          className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-green-600 hover:text-green-500 hover:bg-green-50 rounded border border-green-200"
                                        >
                                          <DevicePhoneMobileIcon className="h-3 w-3 mr-1" />
                                          SMS
                                        </button>
                                        <button 
                                          onClick={() => handlePriceSheetPreview(contact)}
                                          className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-500 hover:bg-gray-50 rounded border border-gray-200"
                                        >
                                          <DocumentTextIcon className="h-3 w-3 mr-1" />
                                          Sheet
                                        </button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                  
                </div>
              </div>

              {/* Delivery Timing */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Timing</h3>
                <div className="grid grid-cols-3 gap-6 mb-4 max-w-2xl">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="send-now"
                      name="timing"
                      value="now"
                      checked={sendTiming === 'now'}
                      onChange={(e) => setSendTiming(e.target.value as 'now' | 'scheduled')}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="send-now" className="text-sm font-medium text-gray-700">
                      Send Now
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="send-scheduled"
                      name="timing"
                      value="scheduled"
                      disabled
                      className="h-4 w-4 text-gray-400 border-gray-300 cursor-not-allowed"
                    />
                    <label htmlFor="send-scheduled" className="text-sm font-medium text-gray-400">
                      Schedule Send
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="send-custom"
                      name="timing"
                      value="custom"
                      disabled
                      className="h-4 w-4 text-gray-400 border-gray-300 cursor-not-allowed"
                    />
                    <label htmlFor="send-custom" className="text-sm font-medium text-gray-400">
                      Custom schedule
                    </label>
                  </div>
                </div>
                
                {sendTiming === 'scheduled' && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <div className="text-sm text-gray-500">at</div>
                      <div>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <GlobeAltIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-blue-900">Timezone Adjusted</p>
                          <p className="text-xs text-blue-700 mt-1">
                            Each contact will receive the email at {scheduledTime} in their local timezone.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* BCC Option */}
                <div className="mt-6 max-w-2xl">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="bcc-self"
                      checked={bccSelf}
                      onChange={(e) => setBccSelf(e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <label htmlFor="bcc-self" className="text-sm font-medium text-gray-700">
                        BCC me on all emails
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Receive a copy of each email sent (hidden from recipients)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-end space-y-3">
                <button
                  type="button"
                  onClick={handleSendEmails}
                  disabled={!termsAccepted}
                  className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    termsAccepted
                      ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  {sendTiming === 'now' ? 'Send Now' : 'Schedule Send'}
                </button>
                
                {/* Terms of Service */}
                <div className="flex items-start space-x-2 max-w-xs">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
                    I have existing relationships with these contacts and agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Terms of Service
                    </button>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Sending Progress */}
          {isSending && (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sending Personalized Emails...
              </h3>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4 max-w-md mx-auto">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${sendProgress}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                {sentEmails.length} of {selectedContacts.length} emails sent
              </p>

              {/* Live sending status */}
              <div className="space-y-2 max-w-md mx-auto">
                {selectedContacts.map((contact, index) => (
                  <div key={contact.id} className={`flex items-center justify-between py-2 px-3 rounded ${
                    sentEmails.includes(contact.id) 
                      ? 'bg-green-50 border border-green-200' 
                      : index === sentEmails.length 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <span className="text-sm text-gray-700">{contact.name}</span>
                    {sentEmails.includes(contact.id) ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    ) : index === sentEmails.length ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                      <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success State */}
          {!isSending && sentEmails.length === selectedContacts.length && (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                All Emails Sent Successfully!
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {selectedContacts.length} personalized emails have been delivered with tracking enabled.
              </p>
              
              <div className="flex items-center justify-center space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Analytics
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Send Another Price Sheet
                </button>
              </div>
            </div>
          )}
        </div>
          </>
        )}
      </div>

      {/* Preview Modals */}
      {emailPreviewModal.contact && priceSheet && (() => {
        const contactId = emailPreviewModal.contact.id || (emailPreviewModal.contact as any)._id
        const savedCustomContent = customEmailContent[contactId]
        const deliveryMethod = user?.pricesheetSettings?.deliveryMethod || user?.preferences?.pricesheet?.deliveryMethod || 'link'
        const defaultEmailMessage = user?.pricesheetSettings?.defaultEmailMessage || user?.preferences?.pricesheet?.defaultEmailMessage || "Here's our latest pricing and availability:"
        
        return (
          <EmailPreviewModal
            isOpen={emailPreviewModal.isOpen}
            onClose={closeEmailPreview}
            contact={emailPreviewModal.contact}
            priceSheetTitle={priceSheet.title}
            priceSheetUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/ps/${sheetId}`}
            productsCount={priceSheet.productsCount || 0}
            customMessage={customMessage || defaultEmailMessage}
            userName={user?.profile?.contactName || user?.profile?.name || user?.name}
            userEmail={user?.email || user?.profile?.email}
            onSave={handleSaveEmailContent}
            savedCustomContent={savedCustomContent}
            isPreview={true}
            deliveryMethod={deliveryMethod}
          />
        )
      })()}

      {smsPreviewModal.contact && (
        <SMSPreviewModal
          isOpen={smsPreviewModal.isOpen}
          onClose={closeSMSPreview}
          contact={smsPreviewModal.contact}
        />
      )}

      {priceSheetPreviewModal.contact && (
        <PriceSheetPreviewModal
          isOpen={priceSheetPreviewModal.isOpen}
          onClose={closePriceSheetPreview}
          title={priceSheet?.title || 'Price Sheet'}
          products={isLoadingProducts ? [] : priceSheetProducts}
          contactInfo={{
            name: `${priceSheetPreviewModal.contact?.firstName} ${priceSheetPreviewModal.contact?.lastName}`,
            pricingTier: priceSheetPreviewModal.contact?.pricesheetSettings?.globalAdjustment ? 'Custom Pricing' : 'Standard',
            pricingAdjustment: priceSheetPreviewModal.contact?.pricesheetSettings?.globalAdjustment || 0
          }}
          userEmail={user?.profile?.email || user?.email}
          userPhone={user?.profile?.phone}
          mode="send"
          allowPriceEditing={true}
          priceType={(() => {
            const contactId = priceSheetPreviewModal.contact?.id || (priceSheetPreviewModal.contact as any)?._id
            // Use contact-specific price type if set, otherwise use price sheet default
            return customPriceType[contactId] || priceSheet?.priceType || 'FOB'
          })()}
          onPriceTypeChange={handlePriceTypeChange}
          onSaveCustomPricing={(productId, customValue) => {
            const contactId = priceSheetPreviewModal.contact?.id || (priceSheetPreviewModal.contact as any)?._id
            if (contactId) {
              handleSaveCustomPricing(contactId, productId, customValue)
              
              // Update the displayed products immediately
              const isComment = typeof customValue === 'string'
              setPriceSheetProducts(prev => prev.map(product => 
                product.id === productId 
                  ? { 
                      ...product, 
                      adjustedPrice: isComment ? null : customValue,
                      hasOverride: isComment,
                      overrideComment: isComment ? customValue : undefined,
                      showStrikethrough: false 
                    }
                  : product
              ))
            }
          }}
        />
      )}

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Email Sending Terms of Service</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4 text-gray-700">
                <p className="font-semibold text-lg text-gray-900">Acceptable Use Policy</p>
                
                <p>By using Acrelist's email sending feature, you agree to the following:</p>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p><strong>Existing Relationships:</strong> You confirm that you have an existing business relationship with all contacts you're sending to.</p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p><strong>No Spam:</strong> You will not use this platform for unsolicited commercial emails, cold outreach, or any form of spam.</p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p><strong>Accurate Contact Lists:</strong> All contacts in your list have been added with proper authorization and knowledge.</p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p><strong>Respect Opt-Outs:</strong> If a contact requests to stop receiving communications, you will honor that request immediately.</p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p><strong>Your Responsibility:</strong> You are solely responsible for the content of emails sent and compliance with all applicable laws.</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-yellow-900">Important Notice</p>
                      <p className="text-sm text-yellow-800 mt-1">
                        Acrelist reserves the right to suspend or terminate accounts that violate these terms or engage in abusive sending practices. High bounce rates or spam complaints may result in immediate account suspension.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-6">
                  By checking the box and sending emails, you acknowledge that you have read, understood, and agree to these terms.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end border-t border-gray-200">
              <button
                onClick={() => {
                  setTermsAccepted(true)
                  setShowTermsModal(false)
                }}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                I Understand & Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
