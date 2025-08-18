"use client"

import { useState } from 'react'
import { 
  UserIcon, 
  BuildingOfficeIcon,
  BellIcon, 
  ShieldCheckIcon,

  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

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
  }
}

export default function Settings() {
  const [userData, setUserData] = useState(initialUserData)
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'notifications' | 'subscription'>('profile')
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

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

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setHasChanges(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'company', name: 'Company', icon: BuildingOfficeIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'subscription', name: 'Subscription', icon: ShieldCheckIcon }
  ]

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
                onClick={() => setActiveTab(tab.id as 'profile' | 'company' | 'notifications' | 'subscription')}
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
      </div>


    </>
  )
}