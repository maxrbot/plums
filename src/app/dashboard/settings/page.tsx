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
  DocumentTextIcon,
  MagnifyingGlassIcon,
  XMarkIcon
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
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'notifications' | 'pricesheet' | 'producehunt' | 'subscription'>('profile')
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isDraggingLogo, setIsDraggingLogo] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // ProduceHunt claim flow
  const [usdaMarkets, setUsdaMarkets] = useState<string[]>([])
  const [savingMarkets, setSavingMarkets] = useState(false)
  const [marketsSaved, setMarketsSaved] = useState(false)
  const [phOptedIn, setPhOptedIn] = useState(false)    // listed in search
  const [phClaimed, setPhClaimed] = useState(false)    // has claimed a directory entry
  const [phClaimStep, setPhClaimStep] = useState<'idle' | 'detecting' | 'pick' | 'compare' | 'confirming' | 'done'>('idle')
  const [phMatches, setPhMatches] = useState<any[]>([])
  const [phSelectedMatch, setPhSelectedMatch] = useState<any>(null)
  const [phPreview, setPhPreview] = useState<any>(null)
  const [phError, setPhError] = useState<string | null>(null)
  // Editable merged values shown in comparison step
  const [phMerged, setPhMerged] = useState<any>(null)
  // Which side ('directory' | 'acrelist') was chosen for each field
  const [phMergedSources, setPhMergedSources] = useState<Record<string, 'directory' | 'acrelist'>>({
    companyName: 'directory', location: 'directory', contact: 'directory', certifications: 'directory'
  })

  // ProduceHunt PEO dashboard data
  const [phListingData, setPhListingData] = useState<any>(null)
  const [phPendingClaimData, setPhPendingClaimData] = useState<any>(null)
  const [phLoadingListing, setPhLoadingListing] = useState(false)
  const [phToggling, setPhToggling] = useState(false)

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
          priceSheetOpens: user.preferences?.notifications?.priceAlerts ?? false,
          newContacts: user.preferences?.notifications?.email ?? false,
          weeklyReports: user.preferences?.notifications?.marketUpdates ?? false,
          systemUpdates: user.preferences?.notifications?.email ?? false,
        },
        
        // Subscription
        subscription: {
          tier: user.subscriptionTier,
          status: 'active',
          nextBilling: user.billing.nextBillingDate || '2024-02-15',
          amount: '$100/month' // Default amount
        },
        
        // ProduceHunt opt-in state
        ...((() => {
          const opted = !!(user as any).integrations?.producehunt
          setPhOptedIn(opted)
          // If not opted in, check if user has a claimed (but delisted) entry
          if (!opted) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/directory/listing/lookup`, {
              headers: { Authorization: `Bearer ${getAuthToken()}` }
            })
              .then(r => r.json())
              .then(d => { if (d.alreadyClaimed) setPhClaimed(true) })
              .catch(() => {})
          } else {
            setPhClaimed(true)
          }
          return {}
        })()),
        // USDA market preferences
        ...((() => { setUsdaMarkets((user as any).preferences?.usdaMarkets || []); return {} })()),

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

  const getAuthToken = () => localStorage.getItem('accessToken') || ''

  const handlePhOptIn = async () => {
    setPhError(null)
    setPhClaimStep('detecting')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/directory/listing/lookup`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      })
      const data = await res.json()
      if (data.alreadyClaimed) {
        setPhOptedIn(true)
        setPhClaimStep('done')
        return
      }
      setPhMatches(data.matches || [])
      if (data.matches.length === 1) {
        // Single match — skip picker, go straight to compare
        await loadPreview(data.matches[0].id)
      } else if (data.matches.length > 1) {
        setPhClaimStep('pick')
      } else {
        setPhError('No matching directory entry found. Contact support to get listed.')
        setPhClaimStep('idle')
      }
    } catch {
      setPhError('Something went wrong. Please try again.')
      setPhClaimStep('idle')
    }
  }

  const loadPreview = async (directoryId: string) => {
    setPhClaimStep('detecting')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/directory/listing/preview/${directoryId}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      })
      const data = await res.json()
      if (!res.ok) { setPhError(data.error); setPhClaimStep('idle'); return }
      setPhPreview(data)
      setPhSelectedMatch(phMatches.find(m => m.id === directoryId) || { id: directoryId })
      setPhMergedSources({ companyName: 'directory', location: 'directory', contact: 'directory', certifications: 'directory' })
      // Pre-fill merged values with directory data as default
      // Auto-merge: prefer directory data, fall back to AcreList for missing contact fields
      const dirContact = data.directoryData.contact || {}
      const alContact = data.acrelistData.contact || {}
      setPhMerged({
        companyName: data.directoryData.companyName,
        location: data.directoryData.location?.full ? data.directoryData.location : data.acrelistData.location,
        contact: {
          salesEmail: dirContact.salesEmail || alContact.salesEmail || '',
          phone: dirContact.phone || alContact.phone || '',
          website: dirContact.website || alContact.website || ''
        },
        certifications: data.directoryData.certifications?.length ? data.directoryData.certifications : (data.acrelistData.certifications || [])
      })
      setPhClaimStep('compare')
    } catch {
      setPhError('Failed to load preview.')
      setPhClaimStep('idle')
    }
  }

  const handlePhConfirm = async () => {
    if (!phSelectedMatch || !phMerged) return
    setPhClaimStep('confirming')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/directory/listing/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ directoryId: phSelectedMatch.id, ...phMerged })
      })
      const data = await res.json()
      if (!res.ok) { setPhError(data.error); setPhClaimStep('compare'); return }
      setPhOptedIn(true)
      setPhClaimed(true)
      setPhClaimStep('done')
    } catch {
      setPhError('Failed to confirm. Please try again.')
      setPhClaimStep('compare')
    }
  }

  const handlePhOptOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/directory/listing`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      })
      setPhOptedIn(false)
      // phClaimed stays true — still owns the listing, just hidden from search
    } catch {
      setPhError('Failed to delist. Please try again.')
    }
  }

  const handlePhRelist = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/directory/listing/relist`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      })
      setPhOptedIn(true)
    } catch {
      setPhError('Failed to relist. Please try again.')
    }
  }

  useEffect(() => {
    if (activeTab !== 'producehunt') return
    setPhLoadingListing(true)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/directory/listing/me`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
      .then(r => r.json())
      .then(d => {
        setPhListingData(d.listing || null)
        setPhPendingClaimData(d.pendingClaim || null)
        if (d.listing) {
          setPhOptedIn(d.listing.listed)
          setPhClaimed(!!d.listing.claimed)
        }
      })
      .catch(() => {})
      .finally(() => setPhLoadingListing(false))
  }, [activeTab])

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'company', name: 'Company', icon: BuildingOfficeIcon },
    { id: 'notifications', name: 'Market Data', icon: BellIcon },
    { id: 'pricesheet', name: 'Price Sheets', icon: DocumentTextIcon },
    { id: 'producehunt', name: 'ProduceHunt', icon: MagnifyingGlassIcon },
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
        {/* Mobile: Scrollable tabs */}
        <div className="sm:hidden">
          <div className="overflow-x-auto -mx-4 px-4">
            <nav className="flex space-x-4 min-w-max border-b border-gray-200">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'profile' | 'company' | 'notifications' | 'pricesheet' | 'producehunt' | 'subscription')}
                    className={`flex items-center space-x-2 py-3 px-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Desktop: Standard tabs */}
        <nav className="hidden sm:flex space-x-8 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'profile' | 'company' | 'notifications' | 'pricesheet' | 'producehunt' | 'subscription')}
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm ${
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

            {/* Account role — read-only */}
            {user && (
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Account Role</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {user.role === 'owner' ? (
                      <>You manage this organisation and can invite team members. <Link href="/dashboard/team" className="text-gray-700 underline underline-offset-2 hover:text-gray-900">Manage team</Link></>
                    ) : (
                      'You share the catalog with your organisation owner.'
                    )}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                  user.role === 'owner'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  {user.role === 'owner' ? 'Owner' : 'Member'}
                </span>
              </div>
            )}

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
                  readOnly
                  className="block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500 sm:text-sm cursor-not-allowed select-none"
                />
                <p className="mt-1 text-xs text-gray-400">Email address cannot be changed.</p>
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

              {/* Address — compact row */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Location</label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    id="city"
                    value={userData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                  <input
                    type="text"
                    id="state"
                    value={userData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                  <input
                    type="text"
                    id="zipCode"
                    value={userData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="ZIP"
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

            </div>

            {/* Company Branding */}
            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-md font-medium text-gray-900">Company Branding</h4>
              </div>
              <p className="text-sm text-gray-500 mb-4">Upload your logo to appear on price sheets and your ProduceHunt listing.</p>

              {userData.pricesheetSettings?.companyLogo ? (
                /* Logo preview */
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={userData.pricesheetSettings.companyLogo}
                      alt="Company logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoFileSelect}
                      />
                      Replace logo
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                /* Drag-and-drop upload zone */
                <div
                  onDrop={handleLogoDrop}
                  onDragOver={handleLogoDragOver}
                  onDragLeave={handleLogoDragLeave}
                  className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
                    isDraggingLogo
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {isUploadingLogo ? (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-6 w-6 animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <p className="text-sm text-gray-500">Uploading…</p>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-10 w-10 text-gray-300" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        <label className="cursor-pointer font-medium text-blue-600 hover:text-blue-500">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoFileSelect}
                          />
                          Upload a file
                        </label>
                        {' '}or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG up to 2MB</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (() => {
          const TERMINAL = ['Los Angeles', 'New York', 'Chicago', 'Atlanta', 'Philadelphia', 'Boston', 'Baltimore', 'Detroit', 'Miami']
          const SHIPPING = ['Fresno, CA (Shipping Point)', 'Phoenix, AZ (Shipping Point)', 'Orlando, FL (Shipping Point)', 'Miami, FL (Shipping Point)', 'Yakima, WA (Shipping Point)']
          const ALL = [...TERMINAL, ...SHIPPING]

          const toggle = (city: string) =>
            setUsdaMarkets(prev =>
              prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
            )

          const saveMarkets = async () => {
            setSavingMarkets(true)
            try {
              await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/settings/preferences`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}` },
                body: JSON.stringify({ usdaMarkets }),
              })
              setMarketsSaved(true)
              setTimeout(() => setMarketsSaved(false), 3000)
            } finally {
              setSavingMarkets(false)
            }
          }

          return (
            <div className="p-6">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-lg font-medium text-gray-900">USDA Market Data Preferences</h3>
                {usdaMarkets.length > 0 && (
                  <button onClick={() => setUsdaMarkets([])} className="text-xs text-gray-400 hover:text-gray-600">
                    Reset to all markets
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Choose which USDA terminal markets and shipping points appear on your dashboard.
                {usdaMarkets.length === 0 && <span className="text-emerald-600"> All markets shown when none selected.</span>}
              </p>

              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Terminal Markets</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TERMINAL.map(city => (
                      <label key={city} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={usdaMarkets.includes(city)}
                          onChange={() => toggle(city)}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{city}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Shipping Points (FOB)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SHIPPING.map(city => (
                      <label key={city} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={usdaMarkets.includes(city)}
                          onChange={() => toggle(city)}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{city}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={saveMarkets}
                  disabled={savingMarkets}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {savingMarkets ? 'Saving…' : 'Save Preferences'}
                </button>
                {marketsSaved && <span className="text-sm text-emerald-600">Saved!</span>}
              </div>
            </div>
          )
        })()}

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

            {/* Contact Information for Price Sheets */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h4 className="text-base font-medium text-gray-900 mb-1">Contact Information</h4>
              <p className="text-sm text-gray-500 mb-4">Shown on your price sheets so buyers know how to reach you.</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Sales Email</label>
                  <input
                    type="email"
                    id="contactEmail"
                    value={userData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">Sales Phone</label>
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

          </div>
        )}

        {activeTab === 'producehunt' && (() => {
          const PH_DATA_SOURCE_LABELS: Record<string, { label: string; maxScore: number }> = {
            paca:        { label: 'PACA License',       maxScore: 5 },
            gfsi:        { label: 'GFSI Certification', maxScore: 5 },
            established: { label: 'Years in Business',  maxScore: 5 },
            usdaOrganic: { label: 'USDA Organic',       maxScore: 5 },
            drc:         { label: 'DRC Membership',     maxScore: 3 },
            website:     { label: 'Website',            maxScore: 2 },
            acrelist:    { label: 'AcreList Member',    maxScore: 2 },
          }

          const listing = phListingData
          const pendingClaim = phPendingClaimData

          if (phLoadingListing) {
            return (
              <div className="p-6 flex items-center gap-3 text-sm text-gray-500">
                <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
                Loading your ProduceHunt status…
              </div>
            )
          }

          // Not joined
          if (!listing && !pendingClaim) {
            return (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-1">ProduceHunt Directory</h3>
                <p className="text-sm text-gray-500 mb-6">Appear in buyer searches. Claim your existing listing to get started.</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 max-w-lg">
                  <p className="text-sm text-gray-700 mb-3">Claiming your listing lets you:</p>
                  <ul className="space-y-2 text-sm text-gray-600 mb-5">
                    <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Control what buyers see about your company</li>
                    <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Sync live pricing from your price sheets</li>
                    <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Appear higher in search results</li>
                  </ul>
                  {phError && <p className="mb-3 text-sm text-red-600">{phError}</p>}
                  <button
                    onClick={handlePhOptIn}
                    disabled={phClaimStep === 'detecting'}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {phClaimStep === 'detecting' ? 'Searching…' : 'Claim my listing'}
                  </button>
                </div>
              </div>
            )
          }

          // Pending claim
          if (pendingClaim && !listing) {
            return (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">ProduceHunt Directory</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 max-w-lg">
                  <span className="text-amber-500 mt-0.5">⏱</span>
                  <div>
                    <p className="text-sm font-medium text-amber-900">Claim under review</p>
                    <p className="text-sm text-amber-700 mt-1">
                      We couldn&apos;t automatically verify ownership via email domain
                      {pendingClaim.emailDomain && pendingClaim.websiteDomain
                        ? ` (your email is @${pendingClaim.emailDomain}, listing website is ${pendingClaim.websiteDomain})`
                        : ''}.
                      Our team will review and approve within 24 hours.
                    </p>
                  </div>
                </div>
              </div>
            )
          }

          if (!listing) return <div className="p-6" />

          const scorePercent = listing.verificationScore
            ? Math.round((listing.verificationScore.score / listing.verificationScore.maxScore) * 100)
            : 0

          const searchTerms = (listing.products || []).map((p: string) => p.toLowerCase())
          if ((listing.certifications || []).some((c: string) => c.toLowerCase().includes('organic'))) {
            searchTerms.push('organic')
          }

          const upgrades: string[] = []
          if (listing.tier === 2) upgrades.push('Add a searchable price sheet to appear as Tier 1 with live pricing')
          if (!listing.dataSources?.paca?.verified) upgrades.push('Add your PACA license number for +5 verification points')
          if (!listing.dataSources?.gfsi?.verified) upgrades.push('Add GFSI food safety certification for +5 points')
          if (!listing.contact?.website) upgrades.push('Add your website URL for +2 points')

          const handleToggleListed = async () => {
            setPhToggling(true)
            try {
              if (listing.listed) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/directory/listing`, { method: 'DELETE', headers: { Authorization: `Bearer ${getAuthToken()}` } })
                setPhListingData((l: any) => l ? { ...l, listed: false } : l)
                setPhOptedIn(false)
              } else {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/directory/listing/relist`, { method: 'POST', headers: { Authorization: `Bearer ${getAuthToken()}` } })
                setPhListingData((l: any) => l ? { ...l, listed: true } : l)
                setPhOptedIn(true)
              }
            } finally { setPhToggling(false) }
          }

          return (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">ProduceHunt Presence</h3>
                <p className="text-sm text-gray-500 mt-0.5">How buyers find you — and how to rank higher.</p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Left: details */}
                <div className="col-span-2 space-y-5">

                  {/* Tier */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Your search tier</p>
                    <div className="flex items-center gap-3 mb-3">
                      {listing.tier === 1 ? (
                        <span className="px-2.5 py-1 text-sm font-semibold rounded-full bg-emerald-100 text-emerald-800">Tier 1 — Live Pricing</span>
                      ) : (
                        <span className="px-2.5 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">Tier 2 — Verified Member</span>
                      )}
                      <span className={`w-2 h-2 rounded-full ${listing.listed ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-500">{listing.listed ? 'Listed in search' : 'Hidden from buyers'}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {listing.tier === 1
                        ? `You appear first in results for buyers searching ${searchTerms.slice(0, 3).join(', ')}. Live pricing from your price sheets is shown on your card.`
                        : `You appear above unclaimed suppliers for ${searchTerms.slice(0, 3).join(', ')} searches. Add a searchable price sheet to move to Tier 1.`
                      }
                    </p>
                  </div>

                  {/* Listing preview */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Your listing — as buyers see it</p>
                    <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-gray-900">{listing.companyName}</span>
                            <span className="text-xs font-bold text-emerald-500">✓</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            📍 {listing.location?.full || `${listing.location?.city}, ${listing.location?.state}`}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${listing.tier === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {listing.tier === 1 ? 'Live Pricing' : 'Verified Member'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(listing.products || []).slice(0, 5).map((p: string) => (
                          <span key={p} className="px-1.5 py-0.5 bg-white border border-gray-200 text-gray-600 text-xs rounded">{p}</span>
                        ))}
                      </div>
                      {listing.verificationScore && (
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${scorePercent}%` }} />
                          </div>
                          <span className="text-xs text-gray-400">{listing.verificationScore.score}/{listing.verificationScore.maxScore}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Search terms */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Search terms you appear for</p>
                    <div className="flex flex-wrap gap-2">
                      {searchTerms.map((t: string) => (
                        <span key={t} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{t}</span>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-400">Based on your synced crops. Add more in your <a href="/dashboard/catalog" className="underline hover:text-gray-600">Catalog</a>.</p>
                  </div>

                  {/* Upgrades */}
                  {upgrades.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Improve your ranking</p>
                      <ul className="space-y-2">
                        {upgrades.map((u, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="mt-0.5 text-amber-400 flex-shrink-0">○</span>
                            {u}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right: score + toggle */}
                <div className="space-y-4">
                  {/* Verification score */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Verification score</p>
                    {listing.verificationScore ? (
                      <>
                        <div className="flex items-end gap-1 mb-2">
                          <span className="text-3xl font-bold text-gray-900">{listing.verificationScore.score}</span>
                          <span className="text-sm text-gray-400 mb-1">/ {listing.verificationScore.maxScore}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${scorePercent}%` }} />
                        </div>
                        <div className="space-y-1.5">
                          {Object.entries(PH_DATA_SOURCE_LABELS).map(([key, { label, maxScore }]) => {
                            const src = listing.dataSources?.[key]
                            const verified = src?.verified
                            return (
                              <div key={key} className="flex items-center justify-between">
                                <span className={`text-xs ${verified ? 'text-gray-700' : 'text-gray-300'}`}>{label}</span>
                                <span className={`text-xs font-medium ${verified ? 'text-emerald-600' : 'text-gray-200'}`}>
                                  {verified ? `+${src?.score ?? maxScore}` : `+${maxScore}`}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400">Score not yet calculated</p>
                    )}
                  </div>

                  {/* Listed toggle */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Search visibility</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${listing.listed ? 'text-emerald-700' : 'text-gray-400'}`}>
                        {listing.listed ? 'Listed' : 'Delisted'}
                      </span>
                      <button
                        onClick={handleToggleListed}
                        disabled={phToggling}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${listing.listed ? 'bg-emerald-500' : 'bg-gray-200'} disabled:opacity-50`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${listing.listed ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">
                      {listing.listed
                        ? 'Visible to buyers. Toggle off to hide without losing your claim.'
                        : 'Hidden from search. Toggle on to re-appear in results.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* ProduceHunt Claim Modal */}
      {(phClaimStep === 'pick' || phClaimStep === 'compare' || phClaimStep === 'confirming') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-lime-500 flex items-center justify-center">
                  <MagnifyingGlassIcon className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Join ProduceHunt Directory</h3>
              </div>
              <button onClick={() => setPhClaimStep('idle')} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Step: Pick from multiple matches */}
            {phClaimStep === 'pick' && (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  We found multiple entries that might be yours. Select the correct one:
                </p>
                <div className="space-y-3">
                  {phMatches.map(match => (
                    <button
                      key={match.id}
                      onClick={() => loadPreview(match.id)}
                      className="w-full text-left border-2 border-gray-200 hover:border-green-400 rounded-lg p-4 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{match.companyName}</div>
                          <div className="text-sm text-gray-500 mt-0.5">
                            {match.location?.full} · {match.products?.slice(0, 3).join(', ')}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Score: {match.verificationScore?.score}/{match.verificationScore?.maxScore}
                        </div>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => setPhClaimStep('idle')}
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-700 pt-2"
                  >
                    None of these are my business
                  </button>
                </div>
              </div>
            )}

            {/* Step: Claim listing card */}
            {(phClaimStep === 'compare' || phClaimStep === 'confirming') && phPreview && phMerged && (
              <div>
                {/* Headline */}
                <div className="mb-5">
                  <p className="text-sm font-medium text-gray-900">Your business is already listed — claim it to take control.</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Once claimed, you'll appear in ProduceHunt buyer searches and your AcreList pricing will be linked directly to your profile.
                  </p>
                </div>

                {/* Listing preview card */}
                <div className="border-2 border-green-200 bg-green-50 rounded-xl p-5 mb-5 relative">
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                      Unclaimed
                    </span>
                  </div>

                  {/* Company name + location */}
                  <div className="mb-4">
                    <div className="text-lg font-semibold text-gray-900">{phPreview.directoryData.companyName}</div>
                    {phMerged.location?.full && (
                      <div className="text-sm text-gray-500 mt-0.5">{phMerged.location.full}</div>
                    )}
                  </div>

                  {/* Products */}
                  {(phPreview.directoryData.products || []).length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Products</div>
                      <div className="flex flex-wrap gap-1.5">
                        {(phPreview.directoryData.products || []).map((p: any, i: number) => (
                          <span key={i} className="text-xs bg-white border border-green-200 rounded-full px-2.5 py-1 text-gray-700 font-medium">
                            {p.isOrganic ? 'Organic ' : ''}{p.commodity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {(phPreview.directoryData.certifications || []).length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Certifications</div>
                      <div className="flex flex-wrap gap-1.5">
                        {(phPreview.directoryData.certifications || []).map((c: string, i: number) => (
                          <span key={i} className="text-xs bg-white border border-green-200 rounded-full px-2.5 py-1 text-green-700 font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact & verification row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-green-200">
                    <div className="text-xs text-gray-500">
                      {phMerged.contact?.salesEmail || phPreview.acrelistData.contact?.salesEmail || 'No contact email'}
                    </div>
                    {phPreview.directoryData.verificationScore && (
                      <div className="text-xs text-gray-500">
                        Verified {phPreview.directoryData.verificationScore.score}/{phPreview.directoryData.verificationScore.maxScore}
                      </div>
                    )}
                  </div>
                </div>

                {/* What you unlock */}
                <div className="grid grid-cols-3 gap-3 mb-6 text-center">
                  <div className="bg-white border border-gray-100 rounded-lg p-3">
                    <div className="text-lg mb-1">🔍</div>
                    <div className="text-xs font-medium text-gray-700">Buyer Searchable</div>
                    <div className="text-xs text-gray-400 mt-0.5">Appear in ProduceHunt searches</div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-lg p-3">
                    <div className="text-lg mb-1">📋</div>
                    <div className="text-xs font-medium text-gray-700">Live Pricing</div>
                    <div className="text-xs text-gray-400 mt-0.5">Link your price sheets directly</div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-lg p-3">
                    <div className="text-lg mb-1">✅</div>
                    <div className="text-xs font-medium text-gray-700">Verified Profile</div>
                    <div className="text-xs text-gray-400 mt-0.5">Externally verified credentials</div>
                  </div>
                </div>

                {phError && <p className="mb-4 text-sm text-red-600">{phError}</p>}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setPhClaimStep('idle')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePhConfirm}
                    disabled={phClaimStep === 'confirming'}
                    className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {phClaimStep === 'confirming' ? 'Claiming...' : 'Claim Listing & Go Live'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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