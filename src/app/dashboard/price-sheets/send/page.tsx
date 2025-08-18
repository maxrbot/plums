"use client"

import { useState } from 'react'
import { 
  PaperAirplaneIcon,
  EyeIcon,
  CheckIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'
import { Contact } from '../../../../types'

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

// Mock saved price sheets (sorted by most recent first)
const mockSavedPriceSheets = [
  {
    id: '1',
    title: 'Spring Strawberries & Lettuce - March 2024',
    products: 5,
    regions: ['Central Valley - Fresno', 'Salinas Valley - Salinas'],
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    lastModified: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    title: 'Organic Tomato Collection',
    products: 3,
    regions: ['Central Valley - Fresno'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
]

// Mock contacts (reusing from contacts page)
const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah@freshmarket.com',
    company: 'Fresh Market Co.',
    pricingTier: 'premium',
    pricingAdjustment: -5,
    tags: ['premium', 'priority'],
    primaryCrops: ['Strawberries'],
    status: 'active',
    relationshipStage: 'customer',
    interactions: [],
    totalOrders: 48,
    lifetimeValue: 120000,
    source: 'manual',
    createdAt: '2023-08-15',
    updatedAt: '2024-03-15'
  },
  {
    id: '2',
    firstName: 'Mike',
    lastName: 'Chen',
    email: 'mike@organicgrocers.com',
    company: 'Organic Grocers Inc.',
    pricingTier: 'volume',
    pricingAdjustment: -15,
    tags: ['organic', 'volume'],
    primaryCrops: ['Tomatoes'],
    status: 'active',
    relationshipStage: 'customer',
    interactions: [],
    totalOrders: 24,
    lifetimeValue: 240000,
    source: 'csv_import',
    createdAt: '2023-06-20',
    updatedAt: '2024-03-12'
  },
  {
    id: '3',
    firstName: 'Lisa',
    lastName: 'Rodriguez',
    email: 'lisa@farmersmarket.com',
    company: 'Rodriguez Farmers Market',
    pricingTier: 'standard',
    pricingAdjustment: 0,
    tags: ['local'],
    primaryCrops: ['Strawberries'],
    status: 'active',
    relationshipStage: 'warm',
    interactions: [],
    totalOrders: 12,
    lifetimeValue: 15000,
    source: 'manual',
    createdAt: '2023-09-10',
    updatedAt: '2024-03-08'
  }
]

export default function SendPriceSheets() {
  const [selectedPriceSheet, setSelectedPriceSheet] = useState<string>(mockSavedPriceSheets[0]?.id || '')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTiers, setSelectedTiers] = useState<string[]>([])
  const [contactNotes, setContactNotes] = useState<Record<string, string>>({})
  const [emailContent, setEmailContent] = useState('')
  const [isEmailGenerated, setIsEmailGenerated] = useState(false)

  // Filter contacts
  const filteredContacts = mockContacts.filter(contact => {
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

  const generateAIEmail = () => {
    const selectedSheet = mockSavedPriceSheets.find(s => s.id === selectedPriceSheet)
    const contactCount = selectedContacts.length
    
    // Mock AI-generated email
    const aiEmail = `Subject: Fresh ${selectedSheet?.title || 'Price Sheet'} - Premium Quality Produce Available

Dear Valued Customer,

I hope this message finds you well! I'm excited to share our latest price sheet featuring the freshest, highest-quality produce from our farms.

🌱 What's New This Week:
• ${selectedSheet?.products || 5} premium products across ${selectedSheet?.regions?.length || 2} growing regions
• Competitive pricing with volume discounts available
• Peak season availability on select items

Our team has carefully curated this selection based on current market conditions and seasonal availability. Each product meets our strict quality standards and is harvested at optimal freshness.

${contactCount > 1 ? 'Please note that pricing may be customized based on your established tier and order history.' : ''}

I'm here to answer any questions about availability, minimum orders, or special requirements. Don't hesitate to reach out if you'd like to discuss any items in detail.

Looking forward to serving you with the best produce available!

Best regards,
The Plums AG Team
sales@plums.ag | (555) 123-4567`

    setEmailContent(aiEmail)
    setIsEmailGenerated(true)
  }

  const getPricingDisplay = (contact: Contact, basePrice: number = 100) => {
    const adjustedPrice = basePrice * (1 + contact.pricingAdjustment / 100)
    return {
      base: basePrice,
      adjusted: adjustedPrice,
      difference: adjustedPrice - basePrice
    }
  }

  const tierCounts = {
    premium: mockContacts.filter(c => c.pricingTier === 'premium').length,
    volume: mockContacts.filter(c => c.pricingTier === 'volume').length,
    standard: mockContacts.filter(c => c.pricingTier === 'standard').length,
    new_prospect: mockContacts.filter(c => c.pricingTier === 'new_prospect').length
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockSavedPriceSheets.map((sheet) => (
              <div
                key={sheet.id}
                onClick={() => setSelectedPriceSheet(sheet.id)}
                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                  selectedPriceSheet === sheet.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{sheet.title}</h3>
                    <div className="mt-1 text-sm text-gray-500">
                      <p>{sheet.products} products • {sheet.regions.length} regions</p>
                      <p className="text-xs mt-1 text-blue-600 font-medium">{getRelativeTime(sheet.createdAt)}</p>
                    </div>
                  </div>
                  {selectedPriceSheet === sheet.id && (
                    <CheckIcon className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
          
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
                  <div className="text-center w-20">Pricing</div>
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
                            {contactNotes[contact.id] && (
                              <p className="text-xs text-blue-600 mt-1 italic">Note: {contactNotes[contact.id]}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Discount Column */}
                        <div className="text-center w-20">
                          <div className={`text-sm font-medium ${
                            contact.pricingAdjustment < 0 ? 'text-green-600' :
                            contact.pricingAdjustment > 0 ? 'text-red-600' :
                            'text-gray-500'
                          }`}>
                            {contact.pricingAdjustment !== 0 ? (
                              `${contact.pricingAdjustment > 0 ? '+' : ''}${contact.pricingAdjustment}%`
                            ) : (
                              'Base'
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            {contact.pricingAdjustment < 0 ? 'Discount' : 
                             contact.pricingAdjustment > 0 ? 'Premium' : 'Standard'}
                          </div>
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

        {/* Step 3: Send */}
        {selectedPriceSheet && selectedContacts.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
              <h2 className="text-lg font-medium text-gray-900">Send Price Sheets</h2>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-green-800 mb-2">Ready to Send</h3>
              <div className="text-sm text-green-700">
                <p className="mb-1">
                  <strong>Price Sheet:</strong> {mockSavedPriceSheets.find(s => s.id === selectedPriceSheet)?.title}
                </p>
                <p className="mb-1">
                  <strong>Recipients:</strong> {selectedContacts.length} contacts
                </p>
                <p className="mb-1">
                  <strong>Custom Notes:</strong> {Object.keys(contactNotes).length} contacts have personalized notes
                </p>
                <p>
                  <strong>Dynamic Pricing:</strong> Prices will be automatically adjusted based on each contact&apos;s tier
                </p>
              </div>
            </div>

            {/* AI Email Generation */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Email Message</h3>
                {!isEmailGenerated && (
                  <button
                    onClick={generateAIEmail}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    ✨ Generate AI Email
                  </button>
                )}
              </div>
              
              {isEmailGenerated ? (
                <div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Content (Editable)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      AI-generated email ready to send. Edit as needed before sending.
                    </p>
                  </div>
                  <textarea
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    rows={12}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm font-mono"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Custom notes will be automatically added to each recipient&apos;s email.
                    </p>
                    <button
                      onClick={generateAIEmail}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      🔄 Regenerate
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Click &quot;Generate AI Email&quot; to create a personalized message for your recipients.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Each contact will receive a personalized email with their optimized pricing and custom notes.
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Preview
                </button>
                <button
                  type="button"
                  disabled={!isEmailGenerated}
                  className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                    isEmailGenerated 
                      ? 'text-white bg-green-600 hover:bg-green-700' 
                      : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                  }`}
                >
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Send to {selectedContacts.length} Contact{selectedContacts.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
