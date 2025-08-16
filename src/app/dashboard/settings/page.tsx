import { 
  UserIcon, 
  CreditCardIcon, 
  BellIcon, 
  ShieldCheckIcon,
  GlobeAltIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

// Mock user data
const mockUser = {
  name: "John Smith",
  email: "john@agrifarm.com",
  company: "AgriFarm Co.",
  phone: "(555) 123-4567",
  subscription: {
    tier: 'premium',
    status: 'active',
    nextBilling: '2024-04-15',
    amount: '$100/month'
  }
}

const settingsSections = [
  {
    title: 'Account',
    icon: UserIcon,
    items: [
      { name: 'Profile Information', description: 'Update your personal details', href: '#' },
      { name: 'Company Details', description: 'Manage your business information', href: '#' },
      { name: 'Password & Security', description: 'Change password and security settings', href: '#' }
    ]
  },
  {
    title: 'Subscription',
    icon: CreditCardIcon,
    items: [
      { name: 'Current Plan', description: `Premium - ${mockUser.subscription.amount}`, href: '#' },
      { name: 'Billing History', description: 'View past invoices and payments', href: '#' },
      { name: 'Payment Method', description: 'Update your payment information', href: '#' }
    ]
  },
  {
    title: 'Notifications',
    icon: BellIcon,
    items: [
      { name: 'Email Preferences', description: 'Manage email notifications', href: '#' },
      { name: 'Price Sheet Alerts', description: 'Get notified about engagement', href: '#' },
      { name: 'Chatbot Notifications', description: 'New conversation alerts', href: '#' }
    ]
  },
  {
    title: 'Integrations',
    icon: GlobeAltIcon,
    items: [
      { name: 'Website Settings', description: 'Configure chatbot integration', href: '#' },
      { name: 'API Access', description: 'Manage API keys and webhooks', href: '#' },
      { name: 'Third-party Apps', description: 'Connect with other tools', href: '#' }
    ]
  }
]

export default function Settings() {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account, subscription, and preferences.</p>
        </div>
      </div>

      {/* Account Overview */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Account Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Personal Information</h4>
              <dl className="mt-2 space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900">{mockUser.name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{mockUser.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Phone</dt>
                  <dd className="text-sm text-gray-900">{mockUser.phone}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Subscription</h4>
              <dl className="mt-2 space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Plan</dt>
                  <dd className="text-sm text-gray-900">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {mockUser.subscription.tier.charAt(0).toUpperCase() + mockUser.subscription.tier.slice(1)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {mockUser.subscription.status.charAt(0).toUpperCase() + mockUser.subscription.status.slice(1)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Next Billing</dt>
                  <dd className="text-sm text-gray-900">{new Date(mockUser.subscription.nextBilling).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section) => (
          <div key={section.title} className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <section.icon className="h-5 w-5 text-gray-400 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {section.items.map((item) => (
                <div key={item.name} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <div className="ml-4">
                      <button className="text-sm font-medium text-purple-600 hover:text-purple-500">
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="bg-white shadow rounded-lg mt-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-5 w-5 text-red-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Danger Zone</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Delete Account</h4>
                <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
