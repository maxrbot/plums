"use client"

import Link from 'next/link'
import { 
  DocumentTextIcon, 
  ChartBarIcon, 
  PlusIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useUserName } from '@/contexts/UserContext'
import { useState, useEffect } from 'react'
import { regionsApi, cropsApi, contactsApi } from '@/lib/api'

export default function Dashboard() {
  const userName = useUserName()
  
  // Real setup progress based on actual user data
  const [setupProgress, setSetupProgress] = useState({
    farmSetup: false,
    contacts: false
  })
  const [productsCount, setProductsCount] = useState(0)
  const [contactsCount, setContactsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Load actual setup progress from APIs
  useEffect(() => {
    const loadSetupProgress = async () => {
      try {
        setLoading(true)
        
        // Check if user has any growing regions and crops
        const [regionsResponse, cropsResponse, contactsResponse] = await Promise.all([
          regionsApi.getAll(),
          cropsApi.getAll(),
          contactsApi.getAll()
        ])
        
        const hasRegions = regionsResponse.regions && regionsResponse.regions.length > 0
        const cropCount = cropsResponse.crops?.length || 0
        const hasCrops = cropCount > 0
        const farmSetupComplete = hasRegions && hasCrops
        
        // Check if user has any contacts
        const contactCount = contactsResponse.contacts?.length || 0
        const hasContacts = contactCount > 0
        
        setProductsCount(cropCount)
        setContactsCount(contactCount)
        setSetupProgress({
          farmSetup: farmSetupComplete,
          contacts: hasContacts
        })
        
      } catch (error) {
        console.error('Failed to load setup progress:', error)
        // Keep default false values on error
      } finally {
        setLoading(false)
      }
    }

    loadSetupProgress()
  }, [])

  const completedSteps = Object.values(setupProgress).filter(Boolean).length
  const totalSteps = Object.keys(setupProgress).length
  const progressPercentage = loading ? 0 : Math.round((completedSteps / totalSteps) * 100)

  return (
    <>
      {/* Welcome & Progress Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userName}!</h1>
        <p className="mt-2 text-gray-600">Here&apos;s what&apos;s next to get your farm online.</p>
      </div>

      {/* Progress Hero Section */}
      <div className="bg-gradient-to-r from-lime-50 to-cyan-50 border border-lime-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Setup Progress - {loading ? 'Loading...' : `${progressPercentage}% Complete`}
            </h2>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Step 1: Add Products */}
          <div className={`p-4 rounded-lg border-2 ${setupProgress.farmSetup ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-white'}`}>
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${setupProgress.farmSetup ? 'bg-green-500' : 'bg-gray-300'}`}>
                {setupProgress.farmSetup ? (
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-semibold">1</span>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Add Products</h3>
                <p className="text-sm text-gray-600">Shipping Points + Products</p>
              </div>
            </div>
            {loading ? (
              <div className="text-sm text-gray-500">Checking...</div>
            ) : setupProgress.farmSetup ? (
              <div className="text-sm text-green-700 font-medium">
                ✅ {productsCount} product{productsCount !== 1 ? 's' : ''} added
              </div>
            ) : (
              <Link href="/dashboard/price-sheets" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Get Started →
              </Link>
            )}
          </div>

          {/* Step 2: Setup Contacts */}
          <div className={`p-4 rounded-lg border-2 ${setupProgress.contacts ? 'border-green-300 bg-green-50' : setupProgress.farmSetup ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${setupProgress.contacts ? 'bg-green-500' : setupProgress.farmSetup ? 'bg-blue-500' : 'bg-gray-300'}`}>
                {setupProgress.contacts ? (
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-semibold">2</span>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Setup Contacts</h3>
                <p className="text-sm text-gray-600">Buyers and Prospect Buyers</p>
              </div>
            </div>
            {loading ? (
              <div className="text-sm text-gray-500">Checking...</div>
            ) : setupProgress.contacts ? (
              <div className="text-sm text-green-700 font-medium">
                ✅ {contactsCount} contact{contactsCount !== 1 ? 's' : ''} added
              </div>
            ) : setupProgress.farmSetup ? (
              <Link href="/dashboard/contacts" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Add Contacts →
              </Link>
            ) : (
              <div className="text-sm text-gray-500">Setup farm data first</div>
            )}
          </div>
        </div>

        {/* Next Action - Only show if setup incomplete */}
        {!setupProgress.farmSetup && (
          <div className="bg-white rounded-lg p-4 border border-lime-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">🎯 Next: Add your products</h3>
                <p className="text-sm text-gray-600 mt-1">Add shipping points and products to get started</p>
              </div>
              <Link 
                href="/dashboard/price-sheets"
                className="inline-flex items-center px-4 py-2 bg-lime-600 text-white text-sm font-medium rounded-md hover:bg-lime-700"
              >
                Continue Setup
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
        {setupProgress.farmSetup && !setupProgress.contacts && (
          <div className="bg-white rounded-lg p-4 border border-lime-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">🎯 Next: Add your contacts</h3>
                <p className="text-sm text-gray-600 mt-1">Add buyers and prospect buyers to send price sheets to</p>
              </div>
              <Link 
                href="/dashboard/contacts"
                className="inline-flex items-center px-4 py-2 bg-lime-600 text-white text-sm font-medium rounded-md hover:bg-lime-700"
              >
                Add Contacts
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Your Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions Sidebar */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <RocketLaunchIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-600">Common tasks</p>
              </div>
            </div>
            <div className="space-y-3">
              <Link href="/dashboard/price-sheets/crops" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 text-sm">
                <PlusIcon className="h-4 w-4 text-gray-600" />
                <span>Add crop variety</span>
              </Link>
              <Link href="/dashboard/price-sheets/insights" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 text-sm">
                <ArrowPathIcon className="h-4 w-4 text-gray-600" />
                <span>Update pricing</span>
              </Link>
              <Link href="/dashboard/price-sheets/send" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 text-sm">
                <PaperAirplaneIcon className="h-4 w-4 text-gray-600" />
                <span>Send price sheet</span>
              </Link>
              <Link href="/dashboard/price-sheets/contacts" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 text-sm">
                <PhoneIcon className="h-4 w-4 text-gray-600" />
                <span>View contacts</span>
              </Link>
              <Link href="/dashboard/chatbot/setup" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 text-sm">
                <ArrowPathIcon className="h-4 w-4 text-gray-600" />
                <span>Sync chatbot data</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Price Sheets Tool */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Smart Price Sheets</h3>
                  <p className="text-sm text-gray-600">Professional pricing that wins contracts</p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Create branded price sheets with USDA market data, your farm story, and professional formatting.
            </p>
            <div className="space-y-2">
              <Link
                href="/dashboard/price-sheets/new"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create New Sheet
              </Link>
              <Link
                href="/dashboard/price-sheets"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Manage Sheets
              </Link>
            </div>
          </div>
        </div>

        {/* This Week's Tip */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LightBulbIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">💡 This Week&apos;s Tip</h3>
              </div>
            </div>
            <p className="text-gray-700 mb-4 text-sm">
              Organic produce is trending 15% above conventional prices this season. Consider highlighting your organic varieties and certifications in your price sheets to capture premium pricing.
            </p>
            <Link
              href="/dashboard/price-sheets/insights"
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              View Market Data
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}