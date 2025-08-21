"use client"

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { 
  XMarkIcon, 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  MapPinIcon,

  PencilIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { Contact } from '../../types'

interface ContactDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact | null
  onEdit?: (contact: Contact) => void
}

export default function ContactDetailsModal({ isOpen, onClose, contact, onEdit }: ContactDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'interactions'>('overview')

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
    { id: 'details', name: 'Details', icon: BuildingOfficeIcon },
    { id: 'interactions', name: 'History', icon: ChatBubbleLeftRightIcon }
  ]

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
                      
                      {/* Status indicators */}
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          contact.status === 'active' ? 'bg-green-100 text-green-800' :
                          contact.status === 'prospect' ? 'bg-blue-100 text-blue-800' :
                          contact.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {contact.status}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          contact.relationshipStage === 'customer' ? 'bg-green-100 text-green-800' :
                          contact.relationshipStage === 'hot' ? 'bg-red-100 text-red-800' :
                          contact.relationshipStage === 'warm' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {contact.relationshipStage}
                        </span>
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
                            onClick={() => setActiveTab(tab.id as 'overview' | 'details' | 'interactions')}
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
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">{contact.totalOrders}</div>
                          <div className="text-sm text-gray-500">Total Orders</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{formatCurrency(contact.lifetimeValue)}</div>
                          <div className="text-sm text-gray-500">Lifetime Value</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{contact.pricingAdjustment >= 0 ? '+' : ''}{contact.pricingAdjustment}%</div>
                          <div className="text-sm text-gray-500">Pricing Adjustment</div>
                        </div>
                      </div>
                      
                      {/* Contact Information */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-900">{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center space-x-3">
                              <PhoneIcon className="h-5 w-5 text-gray-400" />
                              <span className="text-sm text-gray-900">{contact.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-3">
                            <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-900">{contact.company}</span>
                          </div>
                          {contact.website && (
                            <div className="flex items-center space-x-3">
                              <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                              <span className="text-sm text-gray-900">{contact.website}</span>
                            </div>
                          )}
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
                      {contact.notes && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Notes</h4>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{contact.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'details' && (
                    <div className="space-y-6">
                      {/* Business Details */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Business Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing Tier</label>
                            <p className="mt-1 text-sm text-gray-900">{contact.pricingTier.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Company Size</label>
                            <p className="mt-1 text-sm text-gray-900">{contact.companySize || 'Not specified'}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</label>
                            <p className="mt-1 text-sm text-gray-900">{contact.industry || 'Not specified'}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Order Frequency</label>
                            <p className="mt-1 text-sm text-gray-900">{contact.orderFrequency || 'Not specified'}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Average Order Value</label>
                            <p className="mt-1 text-sm text-gray-900">{contact.averageOrderValue ? formatCurrency(contact.averageOrderValue) : 'Not specified'}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Preferred Contact Method</label>
                            <p className="mt-1 text-sm text-gray-900">{contact.preferredContactMethod}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Address */}
                      {(contact.address || contact.city || contact.state) && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Address</h4>
                          <div className="flex items-start space-x-3">
                            <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div className="text-sm text-gray-900">
                              {contact.address && <div>{contact.address}</div>}
                              <div>
                                {contact.city}{contact.city && contact.state && ', '}{contact.state} {contact.zipCode}
                              </div>
                              {contact.country && contact.country !== 'USA' && <div>{contact.country}</div>}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Special Terms */}
                      {contact.specialTerms && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Special Terms</h4>
                          <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-md border border-yellow-200">{contact.specialTerms}</p>
                        </div>
                      )}
                      
                      {/* Metadata */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Record Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500">
                          <div>
                            <label className="block font-medium text-gray-500 uppercase tracking-wider">Created</label>
                            <p className="mt-1">{formatDate(contact.createdAt)}</p>
                          </div>
                          <div>
                            <label className="block font-medium text-gray-500 uppercase tracking-wider">Last Updated</label>
                            <p className="mt-1">{formatDate(contact.updatedAt)}</p>
                          </div>
                          <div>
                            <label className="block font-medium text-gray-500 uppercase tracking-wider">Source</label>
                            <p className="mt-1">{contact.source.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <label className="block font-medium text-gray-500 uppercase tracking-wider">Last Contact</label>
                            <p className="mt-1">{formatDate(contact.lastContactDate)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'interactions' && (
                    <div className="space-y-4">
                      <div className="text-center py-8">
                        <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-sm font-medium text-gray-900 mb-2">No Interactions Yet</h3>
                        <p className="text-sm text-gray-500">
                          Interaction history will appear here as you communicate with this contact.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Contact created {formatDate(contact.createdAt)}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
