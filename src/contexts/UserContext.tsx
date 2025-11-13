'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usersApi } from '@/lib/api'

interface User {
  id: string
  email: string
  subscriptionTier: 'basic' | 'premium' | 'enterprise'
  profile: {
    companyName: string
    contactName: string
    email: string
    phone: string
    website?: string
    address?: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
  preferences: {
    defaultPriceUnit: string
    timezone: string
    currency: string
    notifications: {
      email: boolean
      priceAlerts: boolean
      marketUpdates: boolean
    }
  }
  packagingStructure?: {
    [commodityId: string]: {
      packageTypes: Array<{ id: string; name: string }>
      sizeGrades: Array<{ id: string; name: string }>
    }
  }
  billing: {
    plan: string
    billingCycle: 'monthly' | 'annual'
    nextBillingDate?: string
    paymentMethod?: string
  }
  integrations: {
    quickbooks: boolean
    hubspot: boolean
    mailchimp: boolean
    customApi?: {
      enabled: boolean
      apiKey?: string
    }
  }
}

interface UserContextType {
  user: User | null
  loading: boolean
  error: string | null
  refreshUser: () => Promise<void>
  updateUser: (userData: Partial<User>) => Promise<void>
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is logged in and load their data
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await usersApi.getProfile()
      setUser(response as User)
    } catch (err) {
      console.error('Failed to load user:', err)
      setError(err instanceof Error ? err.message : 'Failed to load user')
      
      // If token is invalid, clear it and redirect to login
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/'
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    await loadUser()
  }

  const updateUser = async (userData: Partial<User>) => {
    try {
      setError(null)
      const response = await usersApi.updateProfile(userData)
      setUser(response as User)
    } catch (err) {
      console.error('Failed to update user:', err)
      setError(err instanceof Error ? err.message : 'Failed to update user')
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
  }

  // Helper function to get first name from contact name
  const getFirstName = (contactName: string): string => {
    if (!contactName) return 'there'
    const names = contactName.trim().split(' ')
    return names[0] || 'there'
  }

  // Helper function to get last name from contact name
  const getLastName = (contactName: string): string => {
    if (!contactName) return ''
    const names = contactName.trim().split(' ')
    return names.length > 1 ? names.slice(1).join(' ') : ''
  }

  const contextValue: UserContextType = {
    user: user ? {
      ...user,
      // Add computed fields for easier access
      firstName: getFirstName(user.profile.contactName),
      lastName: getLastName(user.profile.contactName)
    } as User & { firstName: string; lastName: string } : null,
    loading,
    error,
    refreshUser,
    updateUser,
    logout
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

// Hook for getting user's first name
export function useUserName() {
  const { user } = useUser()
  
  if (!user) return 'there'
  
  const firstName = user.profile.contactName.trim().split(' ')[0]
  return firstName || 'there'
}
