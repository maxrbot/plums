"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  PlusIcon, 
  UserGroupIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  TagIcon,
  DocumentArrowUpIcon,
  EllipsisVerticalIcon,
  StarIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { Contact, ContactTag } from '../../../types'
import AddContactModal from '../../../components/modals/AddContactModal'

// Mock tags
const mockTags: ContactTag[] = [
  { id: 'premium', name: 'Premium', type: 'tier', color: 'bg-purple-100 text-purple-800' },
  { id: 'priority', name: 'Priority', type: 'priority', color: 'bg-red-100 text-red-800' },
  { id: 'organic', name: 'Organic Focus', type: 'crop_interest', color: 'bg-green-100 text-green-800' },
  { id: 'local', name: 'Local Buyer', type: 'region', color: 'bg-blue-100 text-blue-800' },
  { id: 'volume', name: 'Volume Buyer', type: 'tier', color: 'bg-orange-100 text-orange-800' }
]

// Mock contacts with rich data
const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah@freshmarket.com',
    phone: '(555) 123-4567',
    title: 'Purchasing Manager',
    company: 'Fresh Market Co.',
    companySize: 'medium',
    industry: 'Retail Grocery',
    tags: ['premium', 'priority'],
    primaryCrops: ['Strawberries', 'Lettuce'],
    orderFrequency: 'weekly',
    averageOrderValue: 2500,
    status: 'active',
    relationshipStage: 'customer',
    interactions: [],
    lastContactDate: '2024-03-15',
    totalOrders: 48,
    lifetimeValue: 120000,
    pricingTier: 'premium',
    pricingAdjustment: -5, // 5% discount
    source: 'manual',
    createdAt: '2023-08-15',
    updatedAt: '2024-03-15'
  },
  {
    id: '2',
    firstName: 'Mike',
    lastName: 'Chen',
    email: 'mike@organicgrocers.com',
    phone: '(555) 234-5678',
    title: 'Head Buyer',
    company: 'Organic Grocers Inc.',
    companySize: 'large',
    industry: 'Organic Retail',
    tags: ['organic', 'volume'],
    primaryCrops: ['Tomatoes', 'Lettuce'],
    orderFrequency: 'monthly',
    averageOrderValue: 5000,
    status: 'active',
    relationshipStage: 'customer',
    interactions: [],
    lastContactDate: '2024-03-12',
    totalOrders: 24,
    lifetimeValue: 240000,
    pricingTier: 'volume',
    pricingAdjustment: -15, // 15% volume discount
    source: 'csv_import',
    createdAt: '2023-06-20',
    updatedAt: '2024-03-12'
  },
  {
    id: '3',
    firstName: 'Lisa',
    lastName: 'Rodriguez',
    email: 'lisa@farmersmarket.com',
    phone: '(555) 345-6789',
    title: 'Owner',
    company: 'Rodriguez Farmers Market',
    companySize: 'small',
    industry: 'Farmers Market',
    tags: ['local'],
    primaryCrops: ['Strawberries'],
    orderFrequency: 'seasonal',
    averageOrderValue: 800,
    status: 'active',
    relationshipStage: 'warm',
    interactions: [],
    lastContactDate: '2024-03-08',
    totalOrders: 12,
    lifetimeValue: 15000,
    pricingTier: 'standard',
    pricingAdjustment: 0,
    source: 'manual',
    createdAt: '2023-09-10',
    updatedAt: '2024-03-08'
  }
]

export default function Contacts() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>(mockContacts)

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
  const handleSaveContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'interactions' | 'totalOrders' | 'lifetimeValue' | 'lastContactDate' | 'firstOrderDate' | 'lastOrderDate'>) => {
    const newContact: Contact = {
      ...contactData,
      id: `contact_${Date.now()}`,
      interactions: [],
      totalOrders: 0,
      lifetimeValue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setContacts(prev => [newContact, ...prev])
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const getTagInfo = (tagId: string) => mockTags.find(tag => tag.id === tagId)

  // Calculate stats
  const totalContacts = mockContacts.length
  const activeContacts = mockContacts.filter(c => c.status === 'active').length
  const totalLifetimeValue = mockContacts.reduce((sum, c) => sum + c.lifetimeValue, 0)

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
                    {mockContacts.filter(c => c.pricingTier === 'premium').length}
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
          {filteredContacts.map((contact) => (
            <div key={contact.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </h4>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{contact.title}</span>
                    
                    {/* Tags */}
                    <div className="flex items-center space-x-1">
                      {contact.tags.slice(0, 2).map(tagId => {
                        const tag = getTagInfo(tagId)
                        return tag ? (
                          <span key={tagId} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tag.color}`}>
                            {tag.name}
                          </span>
                        ) : null
                      })}
                      {contact.tags.length > 2 && (
                        <span className="text-xs text-gray-500">+{contact.tags.length - 2}</span>
                      )}
                    </div>
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
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-1" />
                      {contact.phone}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 mt-2 text-sm text-gray-500">
                    <span>Pricing: {contact.pricingTier} ({contact.pricingAdjustment >= 0 ? '+' : ''}{contact.pricingAdjustment}%)</span>
                    <span>LTV: ${(contact.lifetimeValue / 1000).toFixed(0)}K</span>
                    <span>Orders: {contact.totalOrders}</span>
                    <span>Last: {contact.lastContactDate ? new Date(contact.lastContactDate).toLocaleDateString() : 'Never'}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/dashboard/contacts/${contact.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    View
                  </Link>
                  <Link
                    href={`/dashboard/contacts/${contact.id}/edit`}
                    className="text-sm font-medium text-gray-600 hover:text-gray-500"
                  >
                    Edit
                  </Link>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveContact}
      />
    </>
  )
}