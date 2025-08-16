import Link from 'next/link'
import { PlusIcon, UserGroupIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'

// Mock contacts data
const mockContacts = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah@freshmarket.com',
    phone: '(555) 123-4567',
    company: 'Fresh Market Co.',
    lastContact: '2024-03-15',
    status: 'active'
  },
  {
    id: 2,
    name: 'Mike Chen',
    email: 'mike@organicgrocers.com',
    phone: '(555) 234-5678',
    company: 'Organic Grocers Inc.',
    lastContact: '2024-03-12',
    status: 'active'
  },
  {
    id: 3,
    name: 'Lisa Rodriguez',
    email: 'lisa@farmersmarket.com',
    phone: '(555) 345-6789',
    company: 'Farmers Market LLC',
    lastContact: '2024-03-08',
    status: 'inactive'
  }
]

export default function Contacts() {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
            <p className="mt-2 text-gray-600">Manage your customer contacts and buyer relationships.</p>
          </div>
          <Link
            href="/dashboard/contacts/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Contact
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Contacts</dt>
                  <dd className="text-lg font-medium text-gray-900">{mockContacts.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EnvelopeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Contacts</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockContacts.filter(contact => contact.status === 'active').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PhoneIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Recent Activity</dt>
                  <dd className="text-lg font-medium text-gray-900">12</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your Contacts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {mockContacts.map((contact) => (
            <div key={contact.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{contact.name}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      contact.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <span>{contact.company}</span>
                    <span>{contact.email}</span>
                    <span>{contact.phone}</span>
                    <span>Last contact: {new Date(contact.lastContact).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/dashboard/contacts/${contact.id}`}
                    className="text-sm font-medium text-purple-600 hover:text-purple-500"
                  >
                    View
                  </Link>
                  <Link
                    href={`/dashboard/contacts/${contact.id}/edit`}
                    className="text-sm font-medium text-gray-600 hover:text-gray-500"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
