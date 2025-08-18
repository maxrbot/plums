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
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Plums.ag
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 pt-6">
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
                      ? 'bg-green-100 text-blue-700'
                      : isDisabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={isDisabled ? (e) => e.preventDefault() : undefined}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isCurrent ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
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
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {mockUser.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{mockUser.name}</p>
                <p className="text-xs text-gray-500 truncate">{mockUser.email}</p>
              </div>
              <Link
                href="/dashboard/settings"
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Settings"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {mockUser.subscription.tier.charAt(0).toUpperCase() + mockUser.subscription.tier.slice(1)} Plan
              </span>
              <button
                onClick={() => {
                  // TODO: Implement logout functionality when auth is setup
                  console.log('Logout clicked')
                }}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
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
