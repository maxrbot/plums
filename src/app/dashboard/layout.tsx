"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  ChatBubbleLeftRightIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

// Mock subscription data - in real app this would come from auth/API
const mockUser = {
  name: "John Smith",
  email: "john@agrifarm.com",
  subscription: {
    tier: 'premium' as 'basic' | 'premium' | 'enterprise',
    features: ['price_sheets', 'analytics', 'ai_chatbot', 'contacts']
  }
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Price Sheets', href: '/dashboard/price-sheets', icon: DocumentTextIcon },
  { name: 'Contacts', href: '/dashboard/contacts', icon: UserGroupIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'AI Chatbot', href: '/dashboard/chatbot', icon: ChatBubbleLeftRightIcon },
]

const featureAccess = {
  basic: ['price_sheets'],
  premium: ['price_sheets', 'analytics', 'contacts'],
  enterprise: ['price_sheets', 'analytics', 'contacts', 'ai_chatbot']
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const userFeatures = featureAccess[mockUser.subscription.tier]
  
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
          <div className="flex h-16 items-center justify-center border-b border-slate-700">
            <Link href="/" className="text-2xl font-bold text-lime-400">
              MarketHunt
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 pt-6">
            {/* Main Navigation */}
            <div className="space-y-1">
              {filteredNavigation.map((item) => {
                const isCurrent = pathname === item.href
                const isDisabled = !userFeatures.includes(
                  item.name === 'AI Chatbot' ? 'ai_chatbot' :
                  item.name === 'Analytics' ? 'analytics' :
                  item.name === 'Contacts' ? 'contacts' : 'price_sheets'
                )
                
                return (
                  <Link
                    key={item.name}
                    href={isDisabled ? '#' : item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isCurrent
                        ? 'bg-slate-700 text-lime-400'
                        : isDisabled
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                    }`}
                    onClick={isDisabled ? (e) => e.preventDefault() : undefined}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isCurrent ? 'text-lime-400' : 'text-gray-400 group-hover:text-gray-300'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                    {isDisabled && (
                      <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {mockUser.subscription.tier === 'basic' ? 'Premium' : 'Enterprise'}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Divider */}
            <div className="my-4 border-t border-slate-700"></div>

            {/* Chatbot Section */}
            <div className="space-y-1">
              {(() => {
                const isCurrent = pathname.startsWith('/dashboard/chatbot')
                const isDisabled = !userFeatures.includes('ai_chatbot')
                
                return (
                  <Link
                    href={isDisabled ? '#' : '/dashboard/chatbot'}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isCurrent
                        ? 'bg-slate-700 text-lime-400'
                        : isDisabled
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                    }`}
                    onClick={isDisabled ? (e) => e.preventDefault() : undefined}
                  >
                    <ChatBubbleLeftRightIcon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isCurrent ? 'text-lime-400' : 'text-gray-400 group-hover:text-gray-300'
                      }`}
                      aria-hidden="true"
                    />
                    Chatbot
                    {isDisabled && (
                      <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        Enterprise
                      </span>
                    )}
                  </Link>
                )
              })()}
            </div>
          </nav>

          {/* User Section */}
          <div className="border-t border-slate-700 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-lime-500 bg-opacity-20 flex items-center justify-center">
                <span className="text-sm font-medium text-lime-400">
                  {mockUser.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{mockUser.name}</p>
                <p className="text-xs text-gray-300 truncate">{mockUser.email}</p>
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
                {mockUser.subscription.tier.charAt(0).toUpperCase() + mockUser.subscription.tier.slice(1)} Plan
              </span>
              <button
                onClick={() => {
                  // TODO: Implement logout functionality when auth is setup
                  console.log('Logout clicked')
                }}
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
