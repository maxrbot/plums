"use client"

import { useState, useEffect } from 'react'
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
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../../components/ui'
import { Contact } from '../../../../../types'
import { useUser } from '../../../../../contexts/UserContext'
import EmailPreviewModal from '../../../../../components/modals/EmailPreviewModal'
import SMSPreviewModal from '../../../../../components/modals/SMSPreviewModal'
import PriceSheetPreviewModal from '../../../../../components/modals/PriceSheetPreviewModal'

// Mock data - would come from previous page state
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
  
  const [selectedContacts] = useState<Contact[]>(mockSelectedContacts)
  const [sendTiming, setSendTiming] = useState<'now' | 'scheduled'>('now')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('09:00')
  const [timezone] = useState('America/Los_Angeles') // Would come from user settings
  const [isSending, setIsSending] = useState(false)
  const [sendProgress, setSendProgress] = useState(0)
  const [sentEmails, setSentEmails] = useState<string[]>([])
  const [trackingEnabled, setTrackingEnabled] = useState(true)
  
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

  const handlePriceSheetPreview = (contact: Contact) => {
    setPriceSheetPreviewModal({ isOpen: true, contact })
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

  const handleSendEmails = async () => {
    setIsSending(true)
    setSendProgress(0)
    setSentEmails([])

    // Simulate sending emails with progress
    for (let i = 0; i < selectedContacts.length; i++) {
      const contact = selectedContacts[i]
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSentEmails(prev => [...prev, contact.id])
      setSendProgress(((i + 1) / selectedContacts.length) * 100)
    }

    // Complete
    setTimeout(() => {
      setIsSending(false)
    }, 500)
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
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Schedule & Send</h1>
              <p className="text-gray-600 mt-1">
                Review delivery timing and send personalized outreach to your contacts
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <GlobeAltIcon className="h-4 w-4 inline mr-1" />
              Your timezone: {timezone.replace('_', ' ')}
            </div>
          </div>

          {!isSending && sentEmails.length === 0 && (
            <>
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
                      Send immediately
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="send-scheduled"
                      name="timing"
                      value="scheduled"
                      checked={sendTiming === 'scheduled'}
                      onChange={(e) => setSendTiming(e.target.value as 'now' | 'scheduled')}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="send-scheduled" className="text-sm font-medium text-gray-700">
                      Send on specific date
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
              </div>


              {/* Final Review */}
              <div className="mb-8">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Final Review</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-6 max-h-96 overflow-y-auto">
                    {(() => {
                      // Group contacts by delivery method
                      const emailContacts = selectedContacts.filter(c => c.pricesheetSettings?.deliveryMethod === 'email')
                      const smsContacts = selectedContacts.filter(c => c.pricesheetSettings?.deliveryMethod === 'sms')  
                      const bothContacts = selectedContacts.filter(c => c.pricesheetSettings?.deliveryMethod === 'both')
                      
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
                                {emailContacts.map((contact) => {
                                  contactIndex++
                                  return (
                                    <div key={contact.id} className={`flex items-center justify-between px-4 py-3 ${contactIndex < selectedContacts.length ? 'border-b border-gray-100' : ''}`}>
                                      <div className="flex items-center space-x-3 flex-1">
                                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                          {contactIndex}
                                        </div>
                                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900 truncate">{contact.company}</p>
                                          <span className="text-xs text-gray-400 flex-shrink-0">•</span>
                                          <p className="text-xs text-gray-600 truncate">{contact.firstName} {contact.lastName}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2 flex-shrink-0">
                                        <button 
                                          onClick={() => handleEmailPreview(contact)}
                                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-500 hover:bg-blue-50 rounded border border-blue-200"
                                        >
                                          <EnvelopeIcon className="h-3 w-3 mr-1" />
                                          Preview Email
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

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to Edit
                </button>
                <button
                  type="button"
                  onClick={handleSendEmails}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  {sendTiming === 'now' ? 'Send Now' : 'Schedule Send'}
                </button>
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
      </div>

      {/* Preview Modals */}
      {emailPreviewModal.contact && (
        <EmailPreviewModal
          isOpen={emailPreviewModal.isOpen}
          onClose={closeEmailPreview}
          contact={emailPreviewModal.contact}
          customMessage="Fresh quality photos attached - let me know if you need any specific shots!"
          attachedFiles={[
            new File([], 'romaine_quality_photos.jpg'),
            new File([], 'broccoli_crown_samples.jpg')
          ]}
          userEmail={user?.profile?.email || 'sales@acrelist.com'}
          userPhone={user?.profile?.phone || '(555) 123-4567'}
        />
      )}

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
          title="Granite Ridge Produce - Today's Deals"
          products={[
            {
              id: '1',
              productName: 'Romaine Lettuce',
              region: 'Salinas Valley',
              packageType: '24ct cartons',
              basePrice: 22.35,
              adjustedPrice: 19.00,
              availability: 'Available',
              showStrikethrough: priceSheetPreviewModal.contact?.pricesheetSettings?.showDiscountStrikethrough
            },
            {
              id: '2',
              productName: 'Broccoli Crowns',
              region: 'Salinas Valley',
              packageType: '14ct cases',
              basePrice: 28.50,
              adjustedPrice: 28.50,
              availability: 'Available'
            },
            {
              id: '3',
              productName: 'Celery Hearts',
              region: 'Oxnard',
              packageType: '30ct cartons',
              basePrice: 24.50,
              adjustedPrice: 24.50,
              availability: 'Available'
            }
          ]}
          contactInfo={{
            name: `${priceSheetPreviewModal.contact?.firstName} ${priceSheetPreviewModal.contact?.lastName}`,
            pricingTier: priceSheetPreviewModal.contact?.pricesheetSettings?.globalAdjustment ? 'Custom Pricing' : 'Standard',
            pricingAdjustment: priceSheetPreviewModal.contact?.pricesheetSettings?.globalAdjustment || 0
          }}
          userEmail={user?.profile?.email || 'sales@acrelist.com'}
          userPhone={user?.profile?.phone || '(555) 123-4567'}
          mode="send"
        />
      )}
    </>
  )
}
