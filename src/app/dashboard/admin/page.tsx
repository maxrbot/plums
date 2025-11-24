'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import { 
  UsersIcon, 
  ChartBarIcon, 
  ClockIcon,
  ArrowRightIcon,
  EyeIcon,
  MapPinIcon,
  CubeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface UserStats {
  _id: string
  id: string
  email: string
  subscriptionTier: string
  profile: {
    companyName: string
    contactName: string
  }
  createdAt: string
  cropCount: number
  contactCount: number
  shippingPointCount: number
  priceSheetCount: number
  emailsSentCount: number
  lastActivity: string
  lastSeenAt?: string
}

// Utility function to format time ago
function formatTimeAgo(dateString: string | undefined): string {
  if (!dateString) return 'Never'
  
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'Just now'
  if (seconds < 300) return `${Math.floor(seconds / 60)} min ago` // < 5 min
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  
  return date.toLocaleDateString()
}

// Check if user is online (active in last 5 minutes)
function isUserOnline(lastSeenAt: string | undefined): boolean {
  if (!lastSeenAt) return false
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  return new Date(lastSeenAt) > fiveMinutesAgo
}

export default function AdminDashboard() {
  const { user } = useUser()
  const router = useRouter()
  const [users, setUsers] = useState<UserStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not admin
  useEffect(() => {
    if (user && user.subscriptionTier !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, router])

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      console.log('🔧 Admin: Fetching users...', { isAdmin: user?.subscriptionTier === 'admin' })
      try {
        const token = localStorage.getItem('accessToken')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('🔧 Admin: Response status:', response.status)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('🔧 Admin: Error response:', errorData)
          throw new Error('Failed to fetch users')
        }

        const data = await response.json()
        console.log('🔧 Admin: Users fetched:', data.users?.length, 'users')
        console.log('🔧 Admin: First user lastSeenAt:', data.users?.[0]?.lastSeenAt)
        setUsers(data.users)
      } catch (err) {
        console.error('🔧 Admin: Fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    if (user?.subscriptionTier === 'admin') {
      fetchUsers()
    } else {
      console.log('🔧 Admin: Not fetching - user tier:', user?.subscriptionTier)
      setLoading(false)
    }
  }, [user])

  // Impersonate user
  const handleImpersonate = async (userId: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/impersonate/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to impersonate user')
      }

      const data = await response.json()
      
      // Store the impersonation tokens
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('isImpersonating', 'true')
      localStorage.setItem('adminToken', token) // Save original admin token
      
      // Redirect to dashboard
      window.location.href = '/dashboard'
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to impersonate user')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user?.subscriptionTier !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage users and monitor platform activity</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Price Sheets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.reduce((sum, u) => sum + u.priceSheetCount, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.reduce((sum, u) => sum + u.contactCount, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ArrowRightIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Emails Sent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.reduce((sum, u) => sum + u.emailsSentCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Users</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Seen
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.profile.contactName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.profile.companyName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.subscriptionTier === 'enterprise' 
                          ? 'bg-purple-100 text-purple-800'
                          : user.subscriptionTier === 'premium'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.subscriptionTier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col space-y-1">
                        <span>{user.shippingPointCount} shipping points</span>
                        <span>{user.cropCount} crops</span>
                        <span>{user.contactCount} contacts</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col space-y-1">
                        <span>{user.priceSheetCount} sheets</span>
                        <span>{user.emailsSentCount} emails</span>
                        <span className="text-xs text-gray-400">
                          {user.lastActivity && new Date(user.lastActivity).getTime() > 0
                            ? new Date(user.lastActivity).toLocaleDateString()
                            : 'No activity'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {isUserOnline(user.lastSeenAt) ? (
                        <span className="flex items-center text-green-600 font-medium">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                          Active now
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          {formatTimeAgo(user.lastSeenAt)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.subscriptionTier === 'admin' ? (
                        <span className="text-xs text-gray-400 italic">Admin account</span>
                      ) : (
                        <button
                          onClick={() => handleImpersonate(user._id)}
                          className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View as User
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

