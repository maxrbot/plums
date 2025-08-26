"use client"

import { useState, useEffect } from 'react'
import { 
  PlusIcon, 
  UserGroupIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  TagIcon,
  DocumentArrowUpIcon,
  StarIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { Contact, ContactTag } from '../../../types'
import AddContactModal from '../../../components/modals/AddContactModal'
import ContactDetailsModal from '../../../components/modals/ContactDetailsModal'
import { contactsApi } from '../../../lib/api'

// Mock tags
const mockTags: ContactTag[] = [
  { id: 'premium', name: 'Premium', type: 'tier', color: 'bg-purple-100 text-purple-800' },
  { id: 'priority', name: 'Priority', type: 'priority', color: 'bg-red-100 text-red-800' },
  { id: 'organic', name: 'Organic Focus', type: 'crop_interest', color: 'bg-green-100 text-green-800' },
  { id: 'local', name: 'Local Buyer', type: 'region', color: 'bg-blue-100 text-blue-800' },
  { id: 'volume', name: 'Volume Buyer', type: 'tier', color: 'bg-orange-100 text-orange-800' }
]



export default function Contacts() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false)

  // Load contacts from API
  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setError(null)
      const response = await contactsApi.getAll()
      console.log('loadContacts - API response:', response)
      
      const contactsData = response.contacts || []
      console.log('loadContacts - setting contacts:', contactsData)
      
      setContacts(contactsData)
    } catch (err) {
      console.error('Failed to load contacts:', err)
      setError(err instanceof Error ? err.message : 'Failed to load contacts')
    } finally {
      setIsLoading(false)
    }
  }

  // Demo contacts data
  const demoContactsData = [
    {
      firstName: "Bill",
      lastName: "Lasson", 
      email: "bill@lassonfamilyfarms.com",
      phone: "(802) 339-9940",
      title: "Purchasing Manager",
      company: "Lasson Family Farms",
      industry: "Agriculture",
      website: "lassonfamilyfarms.com",
      address: "",
      city: "Burlington",
      state: "Vermont", 
      zipCode: "",
      country: "USA",
      tags: ["new_customer"],
      primaryCrops: ["apple", "apricot"],
      preferredContactMethod: "email" as const,
      status: "prospect" as const,
      relationshipStage: "cold" as const,
      pricingTier: "standard" as const,
      pricingAdjustment: 0,
      specialTerms: "",
      source: "manual" as const,
      notes: ""
    },
    {
      firstName: "Sarah",
      lastName: "Chen",
      email: "sarah@freshvalleyproduce.com", 
      phone: "(559) 847-2156",
      title: "Head Buyer",
      company: "Fresh Valley Produce",
      industry: "Food Distribution",
      website: "freshvalleyproduce.com",
      address: "",
      city: "Fresno",
      state: "California",
      zipCode: "",
      country: "USA", 
      tags: ["premium"],
      primaryCrops: ["lettuce", "carrot", "broccoli"],
      preferredContactMethod: "phone" as const,
      status: "active" as const,
      relationshipStage: "warm" as const,
      pricingTier: "premium" as const,
      pricingAdjustment: 5,
      specialTerms: "Net 15 payment terms",
      source: "referral" as const,
      notes: "Prefers organic options when available"
    },
    {
      firstName: "Mike",
      lastName: "Rodriguez",
      email: "mrodriguez@coastalmarkets.com",
      phone: "(831) 555-0123",
      title: "Produce Director", 
      company: "Coastal Markets",
      industry: "Retail",
      website: "coastalmarkets.com",
      address: "",
      city: "Salinas",
      state: "California",
      zipCode: "",
      country: "USA",
      tags: ["volume"],
      primaryCrops: ["strawberry", "lettuce", "spinach"],
      preferredContactMethod: "email" as const,
      status: "active" as const,
      relationshipStage: "customer" as const,
      pricingTier: "volume" as const,
      pricingAdjustment: -10,
      specialTerms: "Volume discounts apply",
      source: "lead_form" as const,
      notes: "Large volume buyer, seasonal contracts"
    },
    {
      firstName: "Jennifer",
      lastName: "Thompson",
      email: "jen@organicharvest.coop",
      phone: "(503) 782-4567",
      title: "Sourcing Manager",
      company: "Organic Harvest Co-op",
      industry: "Organic Foods",
      website: "organicharvest.coop",
      address: "",
      city: "Portland",
      state: "Oregon",
      zipCode: "",
      country: "USA",
      tags: ["organic", "premium"],
      primaryCrops: ["apple", "pear", "cherry"],
      preferredContactMethod: "email" as const,
      status: "prospect" as const,
      relationshipStage: "hot" as const,
      pricingTier: "premium" as const,
      pricingAdjustment: 8,
      specialTerms: "Organic certification required",
      source: "manual" as const,
      notes: "Only interested in certified organic produce"
    },
    {
      firstName: "David",
      lastName: "Park",
      email: "dpark@metropolitanfoods.com",
      phone: "(206) 445-8901",
      title: "Category Manager",
      company: "Metropolitan Foods",
      industry: "Food Service",
      website: "metropolitanfoods.com",
      address: "",
      city: "Seattle", 
      state: "Washington",
      zipCode: "",
      country: "USA",
      tags: ["foodservice"],
      primaryCrops: ["potato", "onion", "carrot"],
      preferredContactMethod: "phone" as const,
      status: "active" as const,
      relationshipStage: "warm" as const,
      pricingTier: "standard" as const,
      pricingAdjustment: 0,
      specialTerms: "",
      source: "csv_import" as const,
      notes: "Supplies restaurants in Seattle metro area"
    },
    {
      firstName: "Lisa",
      lastName: "Williams",
      email: "lwilliams@farmtotable.net",
      phone: "(415) 892-3456",
      title: "Procurement Specialist",
      company: "Farm to Table Network",
      industry: "Restaurant Supply",
      website: "farmtotable.net",
      address: "",
      city: "San Francisco",
      state: "California", 
      zipCode: "",
      country: "USA",
      tags: ["premium", "local"],
      primaryCrops: ["tomato", "pepper", "cucumber"],
      preferredContactMethod: "email" as const,
      status: "prospect" as const,
      relationshipStage: "cold" as const,
      pricingTier: "premium" as const,
      pricingAdjustment: 12,
      specialTerms: "Local sourcing preferred",
      source: "referral" as const,
      notes: "Focuses on farm-to-table restaurants"
    },
    {
      firstName: "Robert",
      lastName: "Johnson",
      email: "rjohnson@valleyprocessing.com",
      phone: "(209) 334-7890",
      title: "Raw Materials Manager",
      company: "Valley Processing Co.",
      industry: "Food Processing",
      website: "valleyprocessing.com",
      address: "",
      city: "Modesto",
      state: "California",
      zipCode: "",
      country: "USA",
      tags: ["processing", "volume"],
      primaryCrops: ["tomato", "peach", "apricot"],
      preferredContactMethod: "phone" as const,
      status: "active" as const,
      relationshipStage: "customer" as const,
      pricingTier: "volume" as const,
      pricingAdjustment: -15,
      specialTerms: "Processing grade acceptable",
      source: "manual" as const,
      notes: "Large volume processor, flexible on quality grades"
    },
    {
      firstName: "Amanda",
      lastName: "Garcia",
      email: "agarcia@freshstart.org",
      phone: "(916) 567-1234",
      title: "Food Program Director",
      company: "Fresh Start Community",
      industry: "Non-Profit",
      website: "freshstart.org",
      address: "",
      city: "Sacramento",
      state: "California",
      zipCode: "",
      country: "USA",
      tags: ["nonprofit", "community"],
      primaryCrops: ["apple", "orange", "banana"],
      preferredContactMethod: "email" as const,
      status: "prospect" as const,
      relationshipStage: "warm" as const,
      pricingTier: "standard" as const,
      pricingAdjustment: -5,
      specialTerms: "Non-profit discount",
      source: "lead_form" as const,
      notes: "Community food program, price-sensitive"
    }
  ]

  // Generate demo contacts
  const generateDemoContacts = async () => {
    try {
      setIsGeneratingDemo(true)
      setError(null)

      // Create all demo contacts
      const createPromises = demoContactsData.map(contactData => 
        contactsApi.create(contactData)
      )

      await Promise.all(createPromises)
      
      // Reload contacts to show the new ones
      await loadContacts()
      
    } catch (err) {
      console.error('Failed to generate demo contacts:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate demo contacts')
    } finally {
      setIsGeneratingDemo(false)
    }
  }

  // Helper function to get the correct ID field (handles both 'id' and '_id')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getContactId = (contact: any): string | undefined => {
    return contact.id || contact._id
  }

  // Filter contacts based on search and tags
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchTerm === '' || 
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tagId => contact.tags.includes(tagId))
    
    return matchesSearch && matchesTags
  })

  // Handle saving new contact
  const handleSaveContact = async (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'interactions' | 'totalOrders' | 'lifetimeValue' | 'lastContactDate' | 'firstOrderDate' | 'lastOrderDate'>) => {
    try {
      setError(null)
      
      const response = await contactsApi.create(contactData)
      console.log('✅ Contact created successfully:', response.contact)
      
      // Add to local state
      setContacts(prev => [response.contact, ...prev])
      
    } catch (err) {
      console.error('Failed to create contact:', err)
      setError(err instanceof Error ? err.message : 'Failed to create contact')
    }
  }

  // Handle opening contact details
  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact)
    setIsDetailsModalOpen(true)
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }



  // Calculate stats
  const totalContacts = contacts.length
  const activeContacts = contacts.filter(c => c.status === 'active').length
  const totalLifetimeValue = contacts.reduce((sum, c) => sum + (c.lifetimeValue || 0), 0)

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
            <p className="mt-2 text-gray-600">Manage your customer relationships and optimize pricing strategies.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
              Import CSV
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Contact
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Contacts</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalContacts}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EnvelopeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Contacts</dt>
                  <dd className="text-lg font-medium text-gray-900">{activeContacts}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total LTV</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${(totalLifetimeValue / 1000).toFixed(0)}K
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Premium Tier</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {contacts.filter(c => c.pricingTier === 'premium').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                placeholder="Search contacts by name, company, or email..."
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Tag Filters */}
          <div className="flex flex-wrap gap-2">
            {mockTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedTags.includes(tag.id)
                    ? tag.color
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <TagIcon className="h-3 w-3 mr-1" />
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Your Contacts ({filteredContacts.length})
            </h3>
            <div className="flex items-center space-x-2">
              <select className="text-sm border-gray-300 rounded-md">
                <option>Sort by Name</option>
                <option>Sort by Company</option>
                <option>Sort by Last Contact</option>
                <option>Sort by Lifetime Value</option>
              </select>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading contacts...</p>
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center">
              <div className="text-red-600 mb-2">Error loading contacts</div>
              <p className="text-gray-500 text-sm">{error}</p>
              <button 
                onClick={loadContacts}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
              <p className="text-gray-500 mb-4">
                {contacts.length === 0 
                  ? "Get started by adding your first contact."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {contacts.length === 0 && (
                <div className="space-y-3">
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Your First Contact
                  </button>
                  <div>
                    <button
                      onClick={generateDemoContacts}
                      disabled={isGeneratingDemo}
                      className="text-sm text-blue-600 hover:text-blue-800 underline disabled:text-gray-400 disabled:no-underline"
                    >
                      {isGeneratingDemo ? 'Generating contacts...' : 'Generate 8 Demo Contacts'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            filteredContacts.map((contact) => (
            <div key={getContactId(contact) || `contact-${contact.firstName}-${contact.lastName}`} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </h4>
                    {contact.title && (
                      <>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{contact.title}</span>
                      </>
                    )}
                    
                    {/* Primary pricing tier badge */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      contact.pricingTier === 'premium' ? 'bg-purple-100 text-purple-800' :
                      contact.pricingTier === 'volume' ? 'bg-orange-100 text-orange-800' :
                      contact.pricingTier === 'standard' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contact.pricingTier.replace('_', ' ')}
                    </span>
                    
                    {/* Relationship stage indicator */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      contact.relationshipStage === 'customer' ? 'bg-green-100 text-green-800' :
                      contact.relationshipStage === 'hot' ? 'bg-red-100 text-red-800' :
                      contact.relationshipStage === 'warm' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contact.relationshipStage}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                      {contact.company}
                    </div>
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-1" />
                      {contact.email}
                    </div>
                    {contact.phone && (
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        {contact.phone}
                      </div>
                    )}
                    {contact.primaryCrops.length > 0 && (
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-1">Crops:</span>
                        <span>{contact.primaryCrops.slice(0, 2).join(', ')}{contact.primaryCrops.length > 2 ? ` +${contact.primaryCrops.length - 2}` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewContact(contact)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      </div>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveContact}
      />

      {/* Contact Details Modal */}
      <ContactDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedContact(null)
        }}
        contact={selectedContact}
      />
    </>
  )
}