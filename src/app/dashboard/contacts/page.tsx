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
  CurrencyDollarIcon,
  ShoppingBagIcon,
  CubeIcon
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
      
      // Debug: Check tags for each contact
      contactsData.forEach((contact: Contact) => {
        console.log(`Contact ${contact.firstName} ${contact.lastName}:`, {
          tags: contact.tags,
          status: contact.status
        })
      })
      
      setContacts(contactsData)
    } catch (err) {
      console.error('Failed to load contacts:', err)
      setError(err instanceof Error ? err.message : 'Failed to load contacts')
    } finally {
      setIsLoading(false)
    }
  }

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
  const retailContacts = contacts.filter(c => c.industry === 'Retail').length
  const cpgContacts = contacts.filter(c => c.industry === 'CPG (Consumer Packaged Goods)').length

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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
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
                <ShoppingBagIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Retail Buyers</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {retailContacts}
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
                <CubeIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">CPG Buyers</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {cpgContacts}
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
                </div>
              )}
            </div>
          ) : (
            filteredContacts.map((contact) => (
            <div key={getContactId(contact) || `contact-${contact.firstName}-${contact.lastName}`} className="px-4 sm:px-6 py-4 hover:bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Left side - Contact Info (stacked on mobile, inline on desktop) */}
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                  {/* Column 1: Name & Company */}
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {contact.firstName} {contact.lastName}
                      </h4>
                      {/* Contact Status Tags */}
                      {contact.tags && contact.tags.length > 0 ? (
                        contact.tags.map((tag) => (
                          <span key={tag} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            tag === 'active' ? 'bg-green-100 text-green-800' :
                            tag === 'prospect' ? 'bg-blue-100 text-blue-800' :
                            tag === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {tag === 'active' ? 'Active' : 
                             tag === 'prospect' ? 'Prospect' : 
                             tag === 'inactive' ? 'Inactive' : 
                             tag}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No status
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <BuildingOfficeIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                      <span className="truncate">{contact.company}</span>
                    </div>
                    {contact.title && (
                      <div className="text-xs text-gray-500 truncate mt-0.5">{contact.title}</div>
                    )}
                  </div>

                  {/* Column 2: Email */}
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500 mb-1">Email</div>
                    <div className="flex items-center text-sm text-gray-900">
                      <EnvelopeIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  </div>

                  {/* Column 3: Phone & Crops */}
                  <div className="min-w-0">
                    {contact.phone && (
                      <>
                        <div className="text-xs text-gray-500 mb-1">Phone</div>
                        <div className="flex items-center text-sm text-gray-900 mb-2">
                          <PhoneIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0 text-gray-400" />
                          <span className="truncate">{contact.phone}</span>
                        </div>
                      </>
                    )}
                    {contact.primaryCrops.length > 0 && (
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="text-gray-400 mr-1">Crops:</span>
                        <span className="truncate">{contact.primaryCrops.slice(0, 2).join(', ')}{contact.primaryCrops.length > 2 ? ` +${contact.primaryCrops.length - 2}` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right side - Action Button */}
                <div className="flex items-center sm:flex-shrink-0">
                  <button
                    onClick={() => handleViewContact(contact)}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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