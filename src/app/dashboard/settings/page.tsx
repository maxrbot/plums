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
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { useUser } from '@/contexts/UserContext'
import TemplatePreviewModal from '@/components/modals/TemplatePreviewModal'

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
    defaultTemplate: 'classic' as 'classic' | 'premium' | 'compact',
    showMarketPrices: true,
    groupByRegion: true,
    includeSeasonality: true,
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
  const [showTemplatePreview, setShowTemplatePreview] = useState(false)

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
        companySize: 'medium' as 'small' | 'medium' | 'large' | 'enterprise', // Default
        industry: 'Organic Produce', // Default
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
          const savedSettings = user.preferences?.pricesheet
          console.log('📥 Loading pricesheet settings from user:', savedSettings)
          return savedSettings || {
            defaultTemplate: 'classic' as 'classic' | 'premium' | 'compact',
            showMarketPrices: true,
            groupByRegion: true,
            includeSeasonality: true,
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

  const updateUserData = (field: string, value: any) => {
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

      {/* Rapid Onboarding Button */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-lime-50 to-cyan-50 border border-lime-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-lime-500 to-cyan-500 flex items-center justify-center">
                  <RocketLaunchIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Accelerated Setup</h3>
                <p className="text-sm text-gray-600">
                  Import your company data automatically from your website and jumpstart your profile in minutes.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/settings/accelerated-setup"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-lime-600 to-cyan-600 hover:from-lime-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-all duration-200"
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              Launch Setup
            </Link>
          </div>
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
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'company' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Company Information</h3>
            
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
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Notification Preferences</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Price Sheet Opens</h4>
                  <p className="text-sm text-gray-500">Get notified when contacts open your price sheets</p>
                </div>
                <button
                  onClick={() => handleInputChange('priceSheetOpens', !userData.emailNotifications.priceSheetOpens, 'emailNotifications')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    userData.emailNotifications.priceSheetOpens ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      userData.emailNotifications.priceSheetOpens ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">New Contacts</h4>
                  <p className="text-sm text-gray-500">Get notified when new contacts are added</p>
                </div>
                <button
                  onClick={() => handleInputChange('newContacts', !userData.emailNotifications.newContacts, 'emailNotifications')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    userData.emailNotifications.newContacts ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      userData.emailNotifications.newContacts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Weekly Reports</h4>
                  <p className="text-sm text-gray-500">Receive weekly analytics and engagement summaries</p>
                </div>
                <button
                  onClick={() => handleInputChange('weeklyReports', !userData.emailNotifications.weeklyReports, 'emailNotifications')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    userData.emailNotifications.weeklyReports ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      userData.emailNotifications.weeklyReports ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">System Updates</h4>
                  <p className="text-sm text-gray-500">Important updates about new features and maintenance</p>
                </div>
                <button
                  onClick={() => handleInputChange('systemUpdates', !userData.emailNotifications.systemUpdates, 'emailNotifications')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    userData.emailNotifications.systemUpdates ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      userData.emailNotifications.systemUpdates ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Subscription Details</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-blue-900">
                    {userData.subscription.tier.charAt(0).toUpperCase() + userData.subscription.tier.slice(1)} Plan
                  </h4>
                  <p className="text-blue-700 mt-1">{userData.subscription.amount}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {userData.subscription.status.charAt(0).toUpperCase() + userData.subscription.status.slice(1)}
                  </span>
                  <p className="text-sm text-blue-600 mt-1">
                    Next billing: {new Date(userData.subscription.nextBilling).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Change Plan</h4>
                  <p className="text-sm text-gray-500">Upgrade or downgrade your subscription</p>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Manage Plan
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Payment Method</h4>
                  <p className="text-sm text-gray-500">Update your billing information</p>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Update Payment
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Billing History</h4>
                  <p className="text-sm text-gray-500">View past invoices and payments</p>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
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
                    <h5 className="text-sm font-medium text-red-900">Cancel Subscription & Delete Account</h5>
                    <p className="text-sm text-red-700 mt-1">
                      Permanently delete your account and all data including price sheets, contacts, and analytics. 
                      This action cannot be undone.
                    </p>
                  </div>
                  <button className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 ml-4">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricesheet' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Price Sheet Settings</h3>
              <button
                onClick={() => setShowTemplatePreview(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                View Your Pricesheet Style
              </button>
            </div>
            
            {/* Template Selection */}
            <div className="mb-8">
              <h4 className="text-base font-medium text-gray-900 mb-4">Default Template</h4>
              <p className="text-sm text-gray-600 mb-6">Choose your preferred price sheet layout. This will be applied when you preview price sheets.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Classic Template */}
                <div className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  userData.pricesheetSettings?.defaultTemplate === 'classic' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateUserData('pricesheetSettings', { ...userData.pricesheetSettings, defaultTemplate: 'classic' })}
                >
                  <div className="aspect-w-16 aspect-h-10 mb-3">
                    <div className="bg-white border border-gray-200 rounded p-2 text-xs">
                      <div className="bg-gray-100 h-2 mb-1 rounded"></div>
                      <div className="space-y-1">
                        <div className="flex space-x-1">
                          <div className="bg-gray-200 h-1 flex-1 rounded"></div>
                          <div className="bg-gray-200 h-1 flex-1 rounded"></div>
                          <div className="bg-gray-200 h-1 flex-1 rounded"></div>
                        </div>
                        <div className="flex space-x-1">
                          <div className="bg-gray-100 h-1 flex-1 rounded"></div>
                          <div className="bg-gray-100 h-1 flex-1 rounded"></div>
                          <div className="bg-gray-100 h-1 flex-1 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <h5 className="font-medium text-gray-900">Classic Table</h5>
                  <p className="text-sm text-gray-500 mt-1">Clean table format, grouped by region</p>
                  {userData.pricesheetSettings?.defaultTemplate === 'classic' && (
                    <div className="absolute top-2 right-2">
                      <CheckIcon className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                </div>

                {/* Premium Template */}
                <div className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  userData.pricesheetSettings?.defaultTemplate === 'premium' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateUserData('pricesheetSettings', { ...userData.pricesheetSettings, defaultTemplate: 'premium' })}
                >
                  <div className="aspect-w-16 aspect-h-10 mb-3">
                    <div className="bg-white border border-gray-200 rounded p-2 text-xs">
                      <div className="bg-gradient-to-r from-blue-100 to-green-100 h-2 mb-1 rounded"></div>
                      <div className="space-y-1">
                        <div className="bg-gray-100 h-3 w-3/4 rounded mb-1"></div>
                        <div className="flex space-x-1">
                          <div className="bg-green-200 h-1 w-1/4 rounded"></div>
                          <div className="bg-gray-200 h-1 flex-1 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <h5 className="font-medium text-gray-900">Premium Catalog</h5>
                  <p className="text-sm text-gray-500 mt-1">Card-based layout, visual focus</p>
                  {userData.pricesheetSettings?.defaultTemplate === 'premium' && (
                    <div className="absolute top-2 right-2">
                      <CheckIcon className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                </div>

                {/* Compact Template */}
                <div className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  userData.pricesheetSettings?.defaultTemplate === 'compact' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateUserData('pricesheetSettings', { ...userData.pricesheetSettings, defaultTemplate: 'compact' })}
                >
                  <div className="aspect-w-16 aspect-h-10 mb-3">
                    <div className="bg-white border border-gray-200 rounded p-2 text-xs">
                      <div className="bg-gray-100 h-1 mb-1 rounded"></div>
                      <div className="space-y-0.5">
                        <div className="flex space-x-0.5">
                          <div className="bg-gray-200 h-0.5 flex-1 rounded"></div>
                          <div className="bg-gray-200 h-0.5 flex-1 rounded"></div>
                          <div className="bg-gray-200 h-0.5 flex-1 rounded"></div>
                          <div className="bg-gray-200 h-0.5 flex-1 rounded"></div>
                        </div>
                        <div className="flex space-x-0.5">
                          <div className="bg-gray-100 h-0.5 flex-1 rounded"></div>
                          <div className="bg-gray-100 h-0.5 flex-1 rounded"></div>
                          <div className="bg-gray-100 h-0.5 flex-1 rounded"></div>
                          <div className="bg-gray-100 h-0.5 flex-1 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <h5 className="font-medium text-gray-900">Compact List</h5>
                  <p className="text-sm text-gray-500 mt-1">Dense format, more data visible</p>
                  {userData.pricesheetSettings?.defaultTemplate === 'compact' && (
                    <div className="absolute top-2 right-2">
                      <CheckIcon className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-base font-medium text-gray-900 mb-4">Display Options</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Show Market Prices</label>
                    <p className="text-sm text-gray-500">Display USDA market prices alongside your prices</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={userData.pricesheetSettings?.showMarketPrices || false}
                    onChange={(e) => updateUserData('pricesheetSettings', { ...userData.pricesheetSettings, showMarketPrices: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Group by Region</label>
                    <p className="text-sm text-gray-500">Organize products by growing region</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={userData.pricesheetSettings?.groupByRegion || false}
                    onChange={(e) => updateUserData('pricesheetSettings', { ...userData.pricesheetSettings, groupByRegion: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Include Seasonality</label>
                    <p className="text-sm text-gray-500">Show seasonal availability indicators</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={userData.pricesheetSettings?.includeSeasonality || false}
                    onChange={(e) => updateUserData('pricesheetSettings', { ...userData.pricesheetSettings, includeSeasonality: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Company Branding */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h4 className="text-base font-medium text-gray-900 mb-4">Company Branding</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {userData.pricesheetSettings?.companyLogo ? (
                      <img
                        src={userData.pricesheetSettings.companyLogo}
                        alt="Company logo"
                        className="h-12 w-12 object-contain border border-gray-200 rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Logo</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Upload Logo
                    </button>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        isOpen={showTemplatePreview}
        onClose={() => setShowTemplatePreview(false)}
        template={userData.pricesheetSettings?.defaultTemplate || 'classic'}
        settings={{
          showMarketPrices: userData.pricesheetSettings?.showMarketPrices || true,
          groupByRegion: userData.pricesheetSettings?.groupByRegion || true,
          includeSeasonality: userData.pricesheetSettings?.includeSeasonality || true,
          companyLogo: userData.pricesheetSettings?.companyLogo || null
        }}
        companyName={userData.companyName || 'Your Company'}
      />

    </>
  )
}