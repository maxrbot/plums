"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  UserIcon, 
  BuildingOfficeIcon,
  BellIcon, 
  ShieldCheckIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  RocketLaunchIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { useUser } from '@/contexts/UserContext'

// Mock user data - this would come from backend
const initialUserData = {
  // Personal Info
  firstName: "John",
  lastName: "Smith", 
  email: "john@agrifarm.com",
  phone: "(555) 123-4567",
  
  // Company Info
  companyName: "AgriFarm Co.",
  companySize: "medium" as 'small' | 'medium' | 'large' | 'enterprise',
  industry: "Organic Produce",
  website: "https://agrifarm.com",
  
  // Address
  address: "123 Farm Road",
  city: "Fresno",
  state: "CA",
  zipCode: "93721",
  country: "USA",
  
  // Contact Info for Price Sheets
  contactEmail: "sales@agrifarm.com",
  contactPhone: "(555) 123-4567",
  
  // Notification Preferences
  emailNotifications: {
    priceSheetOpens: true,
    newContacts: true,
    weeklyReports: false,
    systemUpdates: true
  },
  
  // Subscription
  subscription: {
    tier: 'premium',
    status: 'active',
    nextBilling: '2024-04-15',
    amount: '$100/month'
  },
  
  // Pricesheet Preferences
  pricesheetSettings: {
    deliveryMethod: 'link' as 'link' | 'inline',
    defaultEmailMessage: "Here's our latest pricing and availability:",
    companyLogo: null as string | null
  }
}

export default function Settings() {
  const { user, loading, updateUser } = useUser()
  const [userData, setUserData] = useState(initialUserData)
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'notifications' | 'pricesheet' | 'subscription'>('profile')
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isDraggingLogo, setIsDraggingLogo] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      const firstName = user.profile.contactName.split(' ')[0] || ''
      const lastName = user.profile.contactName.split(' ').slice(1).join(' ') || ''
      
      setUserData({
        // Personal Info from user data
        firstName,
        lastName,
        email: user.email,
        phone: user.profile.phone || '',
        
        // Company Info
        companyName: user.profile.companyName || '',
        companySize: user.profile.companySize || 'medium' as 'small' | 'medium' | 'large' | 'enterprise',
        industry: user.profile.industry || '',
        website: user.profile.website || '',
        
        // Address from user data
        address: user.profile.address?.street || '',
        city: user.profile.address?.city || '',
        state: user.profile.address?.state || '',
        zipCode: user.profile.address?.zipCode || '',
        country: user.profile.address?.country || 'USA',
        
        // Contact Info for Price Sheets
        contactEmail: user.profile.email,
        contactPhone: user.profile.phone || '',
        
        // Notification Preferences from user data
        emailNotifications: {
          priceSheetOpens: user.preferences.notifications.priceAlerts,
          newContacts: user.preferences.notifications.email,
          weeklyReports: user.preferences.notifications.marketUpdates,
          systemUpdates: user.preferences.notifications.email
        },
        
        // Subscription
        subscription: {
          tier: user.subscriptionTier,
          status: 'active',
          nextBilling: user.billing.nextBillingDate || '2024-02-15',
          amount: '$100/month' // Default amount
        },
        
        // Pricesheet Preferences (load from user data or use defaults)
        pricesheetSettings: (() => {
          const savedSettings = user.preferences?.pricesheet || user.pricesheetSettings
          console.log('📥 Loading pricesheet settings from user:', savedSettings)
          return savedSettings || {
            deliveryMethod: 'link' as 'link' | 'inline',
            defaultEmailMessage: "Here's our latest pricing and availability:",
            companyLogo: null as string | null
          }
        })()
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string | boolean, section?: string) => {
    setUserData(prev => {
      if (section && section === 'emailNotifications') {
        return {
          ...prev,
          emailNotifications: {
            ...prev.emailNotifications,
            [field]: value
          }
        }
      }
      return {
        ...prev,
        [field]: value
      }
    })
    setHasChanges(true)
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, '')
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length === 0) return ''
    if (phoneNumber.length <= 3) return `(${phoneNumber}`
    if (phoneNumber.length <= 6) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }

  const updateUserData = (field: string, value: any) => {
    // Format phone numbers automatically
    if (field === 'phone' || field === 'contactPhone') {
      value = formatPhoneNumber(value)
    }
    
    setUserData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!user) return
    
    setIsSaving(true)
    try {
      // Transform form data back to user format
      const updatedUserData = {
        profile: {
          ...user.profile,
          contactName: `${userData.firstName} ${userData.lastName}`.trim(),
          phone: userData.phone,
          companyName: userData.companyName,
          companySize: userData.companySize,
          industry: userData.industry,
          website: userData.website,
          address: {
            street: userData.address,
            city: userData.city,
            state: userData.state,
            zipCode: userData.zipCode,
            country: userData.country
          }
        },
        preferences: {
          ...user.preferences,
          notifications: {
            email: userData.emailNotifications.newContacts,
            priceAlerts: userData.emailNotifications.priceSheetOpens,
            marketUpdates: userData.emailNotifications.weeklyReports
          },
          pricesheet: userData.pricesheetSettings || {
            defaultTemplate: 'classic',
            showMarketPrices: true,
            groupByRegion: true,
            includeSeasonality: true,
            companyLogo: null
          }
        },
        // Save pricesheetSettings at root level for backend compatibility
        pricesheetSettings: userData.pricesheetSettings || {
          defaultTemplate: 'classic',
          showMarketPrices: true,
          groupByRegion: true,
          includeSeasonality: true,
          companyLogo: null
        }
      }
      
      console.log('💾 Saving pricesheet settings:', userData.pricesheetSettings)
      console.log('📤 Full user data being saved:', updatedUserData)
      
      await updateUser(updatedUserData)
      setHasChanges(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      // You could add error handling here
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB')
      return
    }

    setIsUploadingLogo(true)
    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setUserData(prev => ({
          ...prev,
          pricesheetSettings: {
            ...prev.pricesheetSettings,
            companyLogo: base64String
          }
        }))
        setHasChanges(true)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Failed to upload logo:', error)
      alert('Failed to upload logo. Please try again.')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingLogo(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleLogoUpload(file)
    }
  }

  const handleLogoDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingLogo(true)
  }

  const handleLogoDragLeave = () => {
    setIsDraggingLogo(false)
  }

  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleLogoUpload(file)
    }
  }

  const handleRemoveLogo = () => {
    setUserData(prev => ({
      ...prev,
      pricesheetSettings: {
        ...prev.pricesheetSettings,
        companyLogo: null
      }
    }))
    setHasChanges(true)
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'company', name: 'Company', icon: BuildingOfficeIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'pricesheet', name: 'Price Sheets', icon: DocumentTextIcon },
    { id: 'subscription', name: 'Subscription', icon: ShieldCheckIcon }
  ]

  // Show loading state while user data is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading settings...</span>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-gray-600">Manage your account, company information, and preferences.</p>
          </div>
          
          {/* Save Button */}
          {hasChanges && (
            <div className="flex items-center space-x-3">
              {showSuccess && (
                <div className="flex items-center text-green-600">
                  <CheckIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Saved!</span>
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'profile' | 'company' | 'notifications' | 'pricesheet' | 'subscription')}
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

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'profile' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={userData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={userData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={userData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={userData.phone}
                  onChange={(e) => updateUserData('phone', e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'company' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Company Information</h3>
            
            {/* Accelerated Setup - Coming Soon */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-lime-50 to-cyan-50 border border-lime-200 rounded-lg p-4 opacity-60 cursor-not-allowed">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-lime-500 to-cyan-500 flex items-center justify-center">
                        <RocketLaunchIcon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-base font-semibold text-gray-900">Accelerated Setup</h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">
                        Import your company data automatically from your website and jumpstart your profile in minutes.
                      </p>
                    </div>
                  </div>
                  <button
                    disabled
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
                  >
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Launch Setup
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Basic Company Info */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={userData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">This appears on your price sheets</p>
                </div>
                
                <div>
                  <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Size
                  </label>
                  <select
                    id="companySize"
                    value={userData.companySize}
                    onChange={(e) => handleInputChange('companySize', e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="small">Small (1-10 employees)</option>
                    <option value="medium">Medium (11-50 employees)</option>
                    <option value="large">Large (51-200 employees)</option>
                    <option value="enterprise">Enterprise (200+ employees)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    id="industry"
                    value={userData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    placeholder="e.g. Organic Produce, Fresh Vegetables"
                  />
                </div>
                
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    value={userData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    placeholder="https://yourcompany.com"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Business Address</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={userData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={userData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      value={userData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      value={userData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information for Price Sheets */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Price Sheet Contact Information</h4>
                <p className="text-sm text-gray-600 mb-4">This information appears on your price sheets for buyers to contact you.</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Sales Email
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      value={userData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Sales Phone
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      value={userData.contactPhone}
                      onChange={(e) => updateUserData('contactPhone', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="p-6 relative">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Notification Preferences</h3>
            
            <div className="space-y-6 opacity-50 pointer-events-none">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Price Sheet Opens</h4>
                  <p className="text-sm text-gray-500">Get notified when contacts open your price sheets</p>
                </div>
                <button
                  className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200"
                >
                  <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 translate-x-0" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">New Contacts</h4>
                  <p className="text-sm text-gray-500">Get notified when new contacts are added</p>
                </div>
                <button
                  className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200"
                >
                  <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 translate-x-0" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Weekly Reports</h4>
                  <p className="text-sm text-gray-500">Receive weekly analytics and engagement summaries</p>
                </div>
                <button
                  className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200"
                >
                  <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 translate-x-0" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">System Updates</h4>
                  <p className="text-sm text-gray-500">Important updates about new features and maintenance</p>
                </div>
                <button
                  className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200"
                >
                  <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 translate-x-0" />
                </button>
              </div>
            </div>
            
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 backdrop-blur-sm">
              <div className="text-center">
                <SparklesIcon className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                <p className="text-lg font-semibold text-gray-900">Coming Soon</p>
                <p className="text-sm text-gray-600 mt-1">Notification preferences will be available in a future update</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Subscription Details</h3>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-medium text-blue-900">
                      Free Trial
                    </h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Beta Access
                    </span>
                  </div>
                  <p className="text-blue-700 mt-2">Full platform access at no cost</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                  <p className="text-sm text-blue-600 mt-1">
                    No billing required
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 opacity-50 pointer-events-none">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Change Plan</h4>
                  <p className="text-sm text-gray-500">Upgrade or downgrade your subscription</p>
                </div>
                <button className="text-sm font-medium text-gray-400 cursor-not-allowed">
                  Manage Plan
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Payment Method</h4>
                  <p className="text-sm text-gray-500">Update your billing information</p>
                </div>
                <button className="text-sm font-medium text-gray-400 cursor-not-allowed">
                  Update Payment
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Billing History</h4>
                  <p className="text-sm text-gray-500">View past invoices and payments</p>
                </div>
                <button className="text-sm font-medium text-gray-400 cursor-not-allowed">
                  View History
                </button>
              </div>
            </div>

            {/* Danger Zone - Only on Subscription Tab */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
                <h4 className="text-lg font-medium text-gray-900">Danger Zone</h4>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-red-900">Delete Account</h5>
                    <p className="text-sm text-red-700 mt-1">
                      Permanently delete your account and all data including price sheets, contacts, and analytics. 
                      This action cannot be undone.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 ml-4"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricesheet' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Price Sheet Settings</h3>
            
            {/* Delivery Method Selection */}
            <div className="mb-8">
              <h4 className="text-base font-medium text-gray-900 mb-4">Price Sheet Delivery Method</h4>
              <p className="text-sm text-gray-600 mb-6">Choose how you want to send price sheets to your contacts.</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                {/* Link to Price Sheet (Current) */}
                <div 
                  className={`relative border-2 rounded-lg p-5 cursor-pointer transition-all ${
                    userData.pricesheetSettings?.deliveryMethod === 'link' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateUserData('pricesheetSettings', { ...userData.pricesheetSettings, deliveryMethod: 'link' })}
                >
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="radio"
                        checked={userData.pricesheetSettings?.deliveryMethod === 'link'}
                        onChange={() => updateUserData('pricesheetSettings', { ...userData.pricesheetSettings, deliveryMethod: 'link' })}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center">
                        <h5 className="font-semibold text-gray-900">Link to Price Sheet</h5>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Recommended
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Sends a link to your branded price sheet page
                      </p>
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center text-sm text-gray-700">
                          <CheckIcon className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                          <span>Track customer views and engagement</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <CheckIcon className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                          <span>Always shows current prices (live updates)</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <CheckIcon className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                          <span>Professional branded presentation</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <CheckIcon className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                          <span>Customers can revisit anytime</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inline Price List */}
                <div 
                  className={`relative border-2 rounded-lg p-5 cursor-pointer transition-all ${
                    userData.pricesheetSettings?.deliveryMethod === 'inline' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateUserData('pricesheetSettings', { ...userData.pricesheetSettings, deliveryMethod: 'inline' })}
                >
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="radio"
                        checked={userData.pricesheetSettings?.deliveryMethod === 'inline'}
                        onChange={() => updateUserData('pricesheetSettings', { ...userData.pricesheetSettings, deliveryMethod: 'inline' })}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h5 className="font-semibold text-gray-900">Inline Price List</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        Display products directly in the email body
                      </p>
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center text-sm text-gray-700">
                          <CheckIcon className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                          <span>Immediate visibility (no click required)</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <CheckIcon className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                          <span>Works offline in email clients</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <CheckIcon className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                          <span>Faster for customers who know what they want</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <ExclamationTriangleIcon className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />
                          <span>No view tracking (only order page visits)</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <ExclamationTriangleIcon className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />
                          <span>Prices are snapshot at send time</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <ExclamationTriangleIcon className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />
                          <span>Best for price sheets with 8 or fewer items</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
                
                {/* Preview Examples */}
                <div className="lg:col-span-1">
                  <div className="sticky top-6">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">Email Preview</h5>
                    
                    {/* Link Method Preview */}
                    {userData.pricesheetSettings?.deliveryMethod === 'link' && (
                      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-center">
                          <div className="text-white font-semibold text-sm">Weekly Price Sheet</div>
                          <div className="text-green-100 text-xs mt-0.5">15 products available</div>
                        </div>
                        <div className="p-4 space-y-2.5">
                          <div className="text-xs text-gray-700 font-medium">Hi John,</div>
                          <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {userData.pricesheetSettings?.defaultEmailMessage || "Here's our latest pricing and availability:"}
                          </div>
                          <div className="pt-2 pb-1">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-2.5 rounded-md font-semibold text-xs shadow-sm">
                              View Price Sheet
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 pt-1">
                            If you have any questions, please reach out.
                          </div>
                        </div>
                        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                          <div className="text-xs font-medium text-gray-700">{userData.companyName || 'Your Company'}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{userData.email}</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Inline Method Preview */}
                    {userData.pricesheetSettings?.deliveryMethod === 'inline' && (
                      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                        <div className="p-4 space-y-2">
                          <div className="text-xs text-gray-700 font-medium">Hi John,</div>
                          <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {userData.pricesheetSettings?.defaultEmailMessage || "Here's our latest pricing and availability:"}
                          </div>
                          <div className="bg-gray-50 rounded px-2.5 py-2 my-2 space-y-1 font-mono text-[10px] text-gray-700 leading-relaxed">
                            <div>Romaine - 24ct - $18.00</div>
                            <div>Iceberg - 24ct - $16.00</div>
                            <div>Red Leaf - 24ct - $20.00</div>
                            <div>Cabbage - 50lb - $22.00</div>
                            <div>Broccoli - 20lb - $28.00</div>
                            <div className="text-gray-500 pt-1">+ 10 more items</div>
                          </div>
                          <div className="text-xs text-gray-600 pt-1">
                            View entire price sheet: <span className="text-blue-600 underline">View Full</span>
                          </div>
                          <div className="text-xs text-gray-600 pt-1">
                            Ready to order? <span className="text-blue-600 underline font-medium">Build Order</span>
                          </div>
                          <div className="text-xs text-gray-500 pt-2">
                            <span className="text-blue-600 underline">View online price sheet</span>
                          </div>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-3">
                          <div className="text-xs text-gray-700">{userData.companyName || 'Your Company'}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{userData.email}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Default Email Message */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h4 className="text-base font-medium text-gray-900 mb-4">Default Email Message</h4>
              <p className="text-sm text-gray-600 mb-4">
                This message will appear in all price sheet emails by default. You can customize it for individual sends.
              </p>
              
              <div>
                <label htmlFor="defaultEmailMessage" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="defaultEmailMessage"
                  value={userData.pricesheetSettings?.defaultEmailMessage || "Here's our latest pricing and availability:"}
                  onChange={(e) => updateUserData('pricesheetSettings', { ...userData.pricesheetSettings, defaultEmailMessage: e.target.value })}
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  placeholder="Here's our latest pricing and availability:"
                />
              </div>
            </div>

            {/* Company Branding */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-medium text-gray-900">Company Branding</h4>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Coming Soon
                </span>
              </div>
              
              <div className="opacity-50 pointer-events-none">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                <div className="relative border-2 border-dashed rounded-lg p-6 border-gray-300 bg-gray-50">
                  {userData.pricesheetSettings?.companyLogo ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={userData.pricesheetSettings.companyLogo}
                          alt="Company logo"
                          className="h-16 w-16 object-contain border border-gray-200 rounded bg-white p-2"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Logo uploaded</p>
                          <p className="text-xs text-gray-500">Drag a new image to replace</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="mt-4">
                        <span className="text-sm font-medium text-gray-400">Upload a file</span>
                        <span className="text-sm text-gray-400"> or drag and drop</span>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">Logo branding will be available in a future update</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              To delete your account, please contact our support team:
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <a 
                href="mailto:support@acrelist.ag"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                support@acrelist.ag
              </a>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}