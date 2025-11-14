"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  ChatBubbleLeftRightIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  LightBulbIcon,
  CubeIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  PaperAirplaneIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { UserProvider, useUser } from '@/contexts/UserContext'
import { regionsApi, cropsApi, contactsApi } from '@/lib/api'

// Feature access mapping - generous for demo purposes
const featureAccess = {
  basic: ['price_sheets', 'contacts'], // Basic users get core features
  premium: ['price_sheets', 'analytics', 'contacts'], // Premium adds analytics
  enterprise: ['price_sheets', 'analytics', 'contacts', 'ai_chatbot'] // Enterprise gets everything
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Price Sheets', href: '/dashboard/price-sheets', icon: DocumentTextIcon },
  { name: 'Contacts', href: '/dashboard/contacts', icon: UserGroupIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'divider' }, // Visual separator
  { name: 'Market Intelligence', href: '/dashboard/price-sheets/insights', icon: LightBulbIcon, locked: true },
  { name: 'Commodity Structure', href: '/dashboard/price-sheets/packaging', icon: CubeIcon, locked: true },
  { name: 'Certifications', href: '/dashboard/price-sheets/certifications', icon: ShieldCheckIcon, locked: true },
  // { name: 'AI Chatbot', href: '/dashboard/chatbot', icon: ChatBubbleLeftRightIcon }, // Hidden for v1
]

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading, logout } = useUser()
  
  // Track setup completion for action buttons
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [checkingSetup, setCheckingSetup] = useState(true)
  
  // Check if user has completed all setup steps
  useEffect(() => {
    const checkSetupProgress = async () => {
      try {
        const [regionsRes, cropsRes, contactsRes] = await Promise.all([
          regionsApi.getAll().catch(() => ({ regions: [] })),
          cropsApi.getAll().catch(() => ({ crops: [] })),
          contactsApi.getAll().catch(() => ({ contacts: [] }))
        ])
        
        const hasRegions = (regionsRes.regions?.length || 0) > 0
        const hasCrops = (cropsRes.crops?.length || 0) > 0
        const hasContacts = (contactsRes.contacts?.length || 0) > 0
        
        // All 3 core steps must be complete (packaging is optional for now)
        setIsSetupComplete(hasRegions && hasCrops && hasContacts)
      } catch (error) {
        console.error('Failed to check setup progress:', error)
        setIsSetupComplete(false)
      } finally {
        setCheckingSetup(false)
      }
    }
    
    if (!loading) {
      checkSetupProgress()
    }
  }, [loading])
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  // Redirect to login if no user
  if (!user) {
    window.location.href = '/'
    return null
  }
  
  const userFeatures = featureAccess[user.subscriptionTier]
  
  const filteredNavigation = navigation.filter(item => {
    if (item.name === 'AI Chatbot') return userFeatures.includes('ai_chatbot')
    if (item.name === 'Analytics') return userFeatures.includes('analytics')
    if (item.name === 'Contacts') return userFeatures.includes('contacts')
    return true // Dashboard, Price Sheets always available
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-slate-700 px-4">
            <Link href="/" className="flex items-center">
              <Image 
                src="/acrelist-logo-removebg.png" 
                alt="AcreList" 
                width={180} 
                height={45}
                className="h-12 w-auto"
              />
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="px-4 pt-4 pb-2 space-y-2">
            {/* Send Price Sheet Button */}
            {checkingSetup ? (
              <div className="w-full flex items-center justify-center px-4 py-2.5 bg-gray-300 text-white text-sm font-medium rounded-md">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </div>
            ) : isSetupComplete ? (
              <Link
                href="/dashboard/price-sheets/send"
                className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              >
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                Send Price Sheet
              </Link>
            ) : (
              <button
                disabled
                className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md opacity-50 cursor-not-allowed"
                title="Complete setup steps on dashboard to enable"
              >
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                Send Price Sheet
              </button>
            )}
            
            {/* New Price Sheet Button */}
            {checkingSetup ? (
              <div className="w-full flex items-center justify-center px-4 py-2.5 bg-gray-300 text-white text-sm font-medium rounded-md">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </div>
            ) : isSetupComplete ? (
              <Link
                href="/dashboard/price-sheets/new"
                className="w-full flex items-center justify-center px-4 py-2.5 bg-lime-600 text-white text-sm font-medium rounded-md hover:bg-lime-700 transition-colors shadow-sm"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Price Sheet
              </Link>
            ) : (
              <button
                disabled
                className="w-full flex items-center justify-center px-4 py-2.5 bg-lime-600 text-white text-sm font-medium rounded-md opacity-50 cursor-not-allowed"
                title="Complete setup steps on dashboard to enable"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Price Sheet
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 pt-2">
            {/* Main Navigation */}
            <div className="space-y-1">
              {filteredNavigation.map((item, index) => {
                // Handle divider
                if (item.name === 'divider') {
                  return (
                    <div key={`divider-${index}`} className="py-2">
                      <div className="border-t border-slate-700"></div>
                    </div>
                  )
                }

                const isCurrent = pathname === item.href
                const isChatbotSection = pathname.startsWith('/dashboard/chatbot')
                const isPriceSheetsSection = pathname.startsWith('/dashboard/price-sheets')
                const isLocked = item.locked === true
                const isDisabled = !userFeatures.includes(
                  item.name === 'AI Chatbot' ? 'ai_chatbot' :
                  item.name === 'Analytics' ? 'analytics' :
                  item.name === 'Contacts' ? 'contacts' :
                  item.name === 'Market Intelligence' ? 'price_sheets' : 'price_sheets'
                )
                
                return (
                  <div key={item.name}>
                    <Link
                      href={(isDisabled || isLocked) ? '#' : item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isCurrent
                          ? 'bg-slate-700 text-lime-400'
                          : (isDisabled || isLocked)
                          ? 'text-gray-500 cursor-not-allowed opacity-60'
                          : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                      }`}
                      onClick={(isDisabled || isLocked) ? (e) => e.preventDefault() : undefined}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                          isCurrent ? 'text-lime-400' : 'text-gray-400 group-hover:text-gray-300'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                      {isLocked && (
                        <LockClosedIcon className="ml-auto h-4 w-4 text-gray-500" />
                      )}
                      {isDisabled && !isLocked && (
                        <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {user.subscriptionTier === 'basic' ? 'Premium' : 'Enterprise'}
                        </span>
                      )}
                    </Link>
                    
                    {/* Price Sheets Sub-navigation - Always visible */}
                    {item.name === 'Price Sheets' && !isDisabled && (
                      <div className="ml-6 mt-1 space-y-1">
                        <Link
                          href="/dashboard/price-sheets/regions"
                          className={`group flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            pathname === '/dashboard/price-sheets/regions'
                              ? 'bg-slate-700 text-lime-400'
                              : 'text-gray-400 hover:bg-slate-700 hover:text-gray-300'
                          }`}
                        >
                          <span className="text-xs mr-2">🏢</span>
                          Shipping Points
                        </Link>
                        <Link
                          href="/dashboard/price-sheets/crops"
                          className={`group flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            pathname === '/dashboard/price-sheets/crops'
                              ? 'bg-slate-700 text-lime-400'
                              : 'text-gray-400 hover:bg-slate-700 hover:text-gray-300'
                          }`}
                        >
                          <span className="text-xs mr-2">🌾</span>
                          Commodities
                        </Link>
                        <Link
                          href="/dashboard/price-sheets/packaging-structure"
                          className={`group flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            pathname === '/dashboard/price-sheets/packaging-structure'
                              ? 'bg-slate-700 text-lime-400'
                              : 'text-gray-400 hover:bg-slate-700 hover:text-gray-300'
                          }`}
                        >
                          <span className="text-xs mr-2">📦</span>
                          Packaging
                        </Link>
                      </div>
                    )}
                    
                    {/* Chatbot Sub-navigation */}
                    {item.name === 'AI Chatbot' && isChatbotSection && !isDisabled && (
                      <div className="ml-6 mt-1 space-y-1">
                        <Link
                          href="/dashboard/chatbot/setup"
                          className={`group flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            pathname === '/dashboard/chatbot/setup'
                              ? 'bg-slate-700 text-lime-400'
                              : 'text-gray-400 hover:bg-slate-700 hover:text-gray-300'
                          }`}
                        >
                          <Cog6ToothIcon
                            className={`mr-2 h-4 w-4 flex-shrink-0 ${
                              pathname === '/dashboard/chatbot/setup' ? 'text-lime-400' : 'text-gray-500'
                            }`}
                            aria-hidden="true"
                          />
                          Setup
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>


          </nav>

          {/* User Section */}
          <div className="border-t border-slate-700 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-lime-500 bg-opacity-20 flex items-center justify-center">
                <span className="text-sm font-medium text-lime-400">
                  {user.profile.contactName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.profile.contactName}</p>
                <p className="text-xs text-gray-300 truncate">{user.email}</p>
              </div>
              <Link
                href="/dashboard/settings"
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-300 hover:bg-slate-700 transition-colors"
                title="Settings"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Free Trial
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-400 hover:text-gray-300 hover:bg-slate-700 rounded-md transition-colors"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon className="h-3 w-3 mr-1" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
      <DashboardContent>{children}</DashboardContent>
    </UserProvider>
  )
}
