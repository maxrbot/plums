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
  BuildingOfficeIcon,
  ShoppingBagIcon,
  CubeIcon,
  RectangleGroupIcon,
  XMarkIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { Contact, ContactTag } from '../../../types'
import AddContactModal from '../../../components/modals/AddContactModal'
import ContactDetailsModal from '../../../components/modals/ContactDetailsModal'
import { contactsApi, contactBatchesApi } from '../../../lib/api'

interface ContactBatch {
  id: string
  name: string
  contactIds: string[]
}

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

  // Batch creation
  const [isBatchMode, setIsBatchMode] = useState(false)
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set())
  const [batchName, setBatchName] = useState('')
  const [isSavingBatch, setIsSavingBatch] = useState(false)
  const [batches, setBatches] = useState<ContactBatch[]>([])
  const [isLoadingBatches, setIsLoadingBatches] = useState(true)
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null)
  // Load contacts and batches from API
  useEffect(() => {
    loadContacts()
    loadBatches()
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

  const loadBatches = async () => {
    try {
      const res = await contactBatchesApi.getAll()
      setBatches(res.batches || [])
    } catch { /* keep empty */ }
    finally { setIsLoadingBatches(false) }
  }

  const getContactId = (contact: any): string | undefined => {
    return contact.id || contact._id
  }

  const toggleContactSelection = (id: string) => {
    setSelectedContactIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const enterBatchMode = () => {
    setIsBatchMode(true)
    setSelectedContactIds(new Set())
    setBatchName('')
  }

  const exitBatchMode = () => {
    setIsBatchMode(false)
    setSelectedContactIds(new Set())
    setBatchName('')
  }

  const handleSaveBatch = async () => {
    if (!batchName.trim() || selectedContactIds.size === 0) return
    try {
      setIsSavingBatch(true)
      const res = await contactBatchesApi.create({
        name: batchName.trim(),
        contactIds: Array.from(selectedContactIds),
      })
      setBatches(prev => [res.batch, ...prev])
      exitBatchMode()
    } catch { /* could show error */ }
    finally { setIsSavingBatch(false) }
  }

  const handleDeleteBatch = async (id: string) => {
    try {
      await contactBatchesApi.delete(id)
      setBatches(prev => prev.filter(b => b.id !== id))
      if (activeBatchId === id) setActiveBatchId(null)
    } catch { /* could show error */ }
  }

  const toggleBatchFilter = (id: string) => {
    setActiveBatchId(prev => prev === id ? null : id)
  }

  // Filter contacts based on search and tags
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchTerm === '' || 
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tagId => contact.tags.includes(tagId))

    const activeBatch = activeBatchId ? batches.find(b => b.id === activeBatchId) : null
    const matchesBatch = !activeBatch ||
      activeBatch.contactIds.includes(getContactId(contact) || '')

    return matchesSearch && matchesTags && matchesBatch
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

  // Status distribution
  const statusGroups = [
    { key: 'active',          label: 'Active',          color: 'bg-green-400' },
    { key: 'prospect',        label: 'Prospect',        color: 'bg-blue-400' },
    { key: 'inactive',        label: 'Inactive',        color: 'bg-gray-300' },
    { key: 'do_not_contact',  label: 'Do not contact',  color: 'bg-red-300' },
  ]
  const statusCounts = statusGroups.map(g => ({
    ...g,
    count: contacts.filter(c => c.status === g.key).length,
  })).filter(g => g.count > 0)
  const maxStatusCount = Math.max(...statusCounts.map(g => g.count), 1)

  // Pricing customization breakdown (mutually exclusive buckets)
  const pricingGroups = (() => {
    let standard = 0, globalOnly = 0, cropOnly = 0, both = 0
    contacts.forEach(c => {
      const ps = (c as any).pricesheetSettings || {}
      const hasGlobal = (ps.globalAdjustment || 0) !== 0
      const hasCrop = (ps.cropAdjustments || []).length > 0
      if (hasGlobal && hasCrop) both++
      else if (hasGlobal) globalOnly++
      else if (hasCrop) cropOnly++
      else standard++
    })
    return [
      { label: 'Standard',     count: standard,   color: 'bg-green-400' },
      { label: 'Global adj.',   count: globalOnly, color: 'bg-amber-400' },
      { label: 'Per-crop',      count: cropOnly,   color: 'bg-amber-400' },
      { label: 'Both',          count: both,       color: 'bg-orange-400' },
    ].filter(g => g.count > 0)
  })()
  const maxPricingCount = Math.max(...pricingGroups.map(g => g.count), 1)

  // Commodity interest distribution (computed from primaryCrops)
  const cropDistribution = contacts.reduce((acc, contact) => {
    const crops: string[] = (contact as any).primaryCrops || []
    crops.forEach(crop => { acc[crop] = (acc[crop] || 0) + 1 })
    return acc
  }, {} as Record<string, number>)
  const sortedCrops = Object.entries(cropDistribution).sort((a, b) => b[1] - a[1])
  const maxCropCount = sortedCrops[0]?.[1] || 1
  const contactsWithInterests = contacts.filter(c => ((c as any).primaryCrops || []).length > 0).length

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
              onClick={enterBatchMode}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <RectangleGroupIcon className="h-4 w-4 mr-2" />
              Create Batch
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
      <div className="grid grid-cols-3 gap-5 mb-6">

        {/* Buyer Status Distribution */}
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg">
              <UserGroupIcon className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Contacts</p>
              <p className="text-lg font-bold text-gray-900 leading-none mt-0.5">{totalContacts}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {statusCounts.map(g => (
              <div key={g.key} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-28 flex-shrink-0">{g.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`${g.color} h-full rounded-full`} style={{ width: `${(g.count / maxStatusCount) * 100}%` }} />
                </div>
                <span className="text-xs font-medium text-gray-700 w-4 text-right flex-shrink-0">{g.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Customization */}
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-shrink-0 p-2 bg-amber-50 rounded-lg">
              <CubeIcon className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-sm text-gray-500">Pricing Setup</p>
            <div className="relative group ml-auto">
              <div className="w-4 h-4 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-medium cursor-default hover:bg-gray-200 hover:text-gray-600">?</div>
              <div className="absolute top-full right-0 mt-2 w-56 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                <div className="absolute bottom-full right-3 border-4 border-transparent border-b-gray-900" />
                <p className="font-semibold text-gray-200 mb-1.5">Contact Pricing</p>
                <p className="text-gray-400 leading-relaxed">Contacts can be pre-configured with custom pricing so every price sheet they receive automatically reflects their negotiated rates — no manual adjustments needed at send time.</p>
                <p className="text-gray-500 mt-1.5">Set these in each contact's Pricesheet Settings tab.</p>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            {pricingGroups.map(g => (
              <div key={g.label} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-28 flex-shrink-0">{g.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`${g.color} h-full rounded-full`} style={{ width: `${(g.count / maxPricingCount) * 100}%` }} />
                </div>
                <span className="text-xs font-medium text-gray-700 w-4 text-right flex-shrink-0">{g.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Commodity Interests */}
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-shrink-0 p-2 bg-green-50 rounded-lg">
              <ShoppingBagIcon className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-sm text-gray-500">Commodity Interests</p>
            <div className="relative group ml-auto">
              <div className="w-4 h-4 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-medium cursor-default hover:bg-gray-200 hover:text-gray-600">?</div>
              <div className="absolute top-full right-0 mt-2 w-60 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                <div className="absolute bottom-full right-3 border-4 border-transparent border-b-gray-900" />
                <p className="font-semibold text-gray-200 mb-1.5">Primary Crop Interests</p>
                <p className="text-gray-400 leading-relaxed">When set on a contact, price sheets sent to them will automatically show only matching products — everything else is removed from their view.</p>
                <p className="text-gray-500 mt-1.5">Each bar shows how many contacts have expressed interest in that commodity.</p>
              </div>
            </div>
          </div>
          {sortedCrops.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">No interests set yet</p>
          ) : (
            <div className="space-y-1.5">
              {sortedCrops.map(([crop, count]) => (
                <div key={crop} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-28 flex-shrink-0 capitalize truncate">{crop}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-green-400 h-full rounded-full" style={{ width: `${(count / maxCropCount) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-4 text-right flex-shrink-0">{count}</span>
                </div>
              ))}
            </div>
          )}
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
          <div className="flex flex-wrap gap-2 mb-3">
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

          {/* Batch Filters */}
          {!isLoadingBatches && batches.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide flex-shrink-0 flex items-center gap-1">
                <RectangleGroupIcon className="h-3.5 w-3.5" />
                Batches
              </span>
              {batches.map(batch => {
                const isActive = activeBatchId === batch.id
                return (
                  <button
                    key={batch.id}
                    onClick={() => toggleBatchFilter(batch.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <RectangleGroupIcon className="h-3 w-3" />
                    {batch.name}
                    <span className={`${isActive ? 'text-blue-200' : 'text-gray-400'}`}>
                      {batch.contactIds.length}
                    </span>
                    {isActive
                      ? <XMarkIcon className="h-3 w-3 ml-0.5" onClick={e => { e.stopPropagation(); setActiveBatchId(null) }} />
                      : <TrashIcon
                          className="h-3 w-3 ml-0.5 text-gray-300 hover:text-red-400 transition-colors"
                          onClick={e => { e.stopPropagation(); handleDeleteBatch(batch.id) }}
                        />
                    }
                  </button>
                )
              })}
              <button
                onClick={enterBatchMode}
                className="text-xs text-gray-400 hover:text-gray-600 ml-1"
              >
                + Create batch
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Batch creation bar */}
      {isBatchMode && (
        <div className="sticky top-4 z-20 mb-4 bg-white border border-blue-200 shadow-lg rounded-xl px-5 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <RectangleGroupIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <input
              type="text"
              value={batchName}
              onChange={e => setBatchName(e.target.value)}
              placeholder="Batch name (e.g. Organic Retailers)"
              autoFocus
              className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <span className="text-sm text-gray-500 flex-shrink-0">
            {selectedContactIds.size} selected
          </span>
          <button
            onClick={handleSaveBatch}
            disabled={!batchName.trim() || selectedContactIds.size === 0 || isSavingBatch}
            className="inline-flex items-center px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
          >
            {isSavingBatch ? 'Saving…' : 'Save Batch'}
          </button>
          <button onClick={exitBatchMode} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Contacts List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {activeBatchId
                ? <>
                    <span>{batches.find(b => b.id === activeBatchId)?.name}</span>
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
                    </span>
                  </>
                : <>Your Contacts ({filteredContacts.length})</>
              }
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
            filteredContacts.map((contact) => {
              const contactId = getContactId(contact) || `contact-${contact.firstName}-${contact.lastName}`
              const isSelected = selectedContactIds.has(contactId)
              return (
            <div
              key={contactId}
              className={`px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors ${isBatchMode ? 'cursor-pointer' : ''} ${isSelected ? 'bg-blue-50 hover:bg-blue-50' : ''}`}
              onClick={isBatchMode ? () => toggleContactSelection(contactId) : undefined}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Batch checkbox */}
                {isBatchMode && (
                  <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleContactSelection(contactId)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                )}
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
                {!isBatchMode && (
                  <div className="flex items-center sm:flex-shrink-0">
                    <button
                      onClick={() => handleViewContact(contact)}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View Details
                    </button>
                  </div>
                )}
              </div>
            </div>
              )
            })
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