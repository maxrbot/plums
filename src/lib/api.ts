/* eslint-disable @typescript-eslint/no-explicit-any */
// API configuration and helper functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

// API request wrapper with auth
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Auth API
export const authApi = {
  register: async (data: {
    email: string
    password: string
    companyName?: string
    contactName?: string
  }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  login: async (data: { email: string; password: string }) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  verify: async () => {
    return apiRequest('/auth/verify')
  },

  logout: async () => {
    return apiRequest('/auth/logout', { method: 'POST' })
  },
}

// Users API
export const usersApi = {
  getProfile: async () => {
    return apiRequest('/users/profile')
  },

  updateProfile: async (data: any) => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  getStats: async () => {
    return apiRequest('/users/stats')
  },
}

// Growing Regions API
export const regionsApi = {
  getAll: async () => {
    return apiRequest<{ regions: any[] }>('/regions')
  },

  getById: async (id: string) => {
    return apiRequest<{ region: any }>(`/regions/${id}`)
  },

  create: async (data: {
    name: string
    location: {
      city?: string
      state?: string
      country?: string
      placeId?: string
      formattedAddress?: string
      coordinates?: { lat: number; lng: number }
    }
    farmingTypes: string[]
    acreage?: string
    notes?: string
  }) => {
    return apiRequest<{ region: any }>('/regions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: string, data: any) => {
    return apiRequest<{ region: any }>(`/regions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string) => {
    return apiRequest(`/regions/${id}`, { method: 'DELETE' })
  },
}

// Crops API
export const cropsApi = {
  getAll: async () => {
    return apiRequest<{ crops: any[] }>('/crops')
  },

  create: async (data: any) => {
    return apiRequest<{ crop: any }>('/crops', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: string, data: any) => {
    return apiRequest<{ crop: any }>(`/crops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string) => {
    return apiRequest(`/crops/${id}`, { method: 'DELETE' })
  },
}

// Contacts API
export const contactsApi = {
  getAll: async () => {
    return apiRequest<{ contacts: any[] }>('/contacts')
  },

  create: async (data: any) => {
    return apiRequest<{ contact: any }>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: string, data: any) => {
    return apiRequest<{ contact: any }>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string) => {
    return apiRequest(`/contacts/${id}`, { method: 'DELETE' })
  },

  search: async (query: string, tags?: string) => {
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    if (tags) params.append('tags', tags)
    
    return apiRequest<{ contacts: any[] }>(`/contacts/search?${params.toString()}`)
  },
}

// Certifications API
export const certificationsApi = {
  getAll: async () => {
    return apiRequest<{ certifications: any[] }>('/certifications')
  },

  getById: async (id: string) => {
    return apiRequest<{ certification: any }>(`/certifications/${id}`)
  },

  create: async (data: any) => {
    return apiRequest<{ certification: any }>('/certifications', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: string, data: any) => {
    return apiRequest<{ certification: any }>(`/certifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string) => {
    return apiRequest(`/certifications/${id}`, { method: 'DELETE' })
  },
}

// Price Sheets API
export const priceSheetsApi = {
  getAll: async () => {
    return apiRequest<{ priceSheets: any[] }>('/price-sheets')
  },

  getById: async (id: string) => {
    return apiRequest<{ priceSheet: any; products: any[] }>(`/price-sheets/${id}`)
  },

  create: async (data: { priceSheet: any; products: any[] }) => {
    return apiRequest<{ priceSheet: any; products: any[] }>('/price-sheets', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: string, data: any) => {
    return apiRequest<{ priceSheet: any }>(`/price-sheets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string) => {
    return apiRequest(`/price-sheets/${id}`, { method: 'DELETE' })
  },

  getProducts: async (id: string) => {
    return apiRequest<{ products: any[] }>(`/price-sheets/${id}/products`)
  },
}

// Custom Packaging API
export const packagingApi = {
  getAll: async () => {
    return apiRequest<{ packaging: any[] }>('/packaging')
  },

  create: async (data: any) => {
    return apiRequest<{ packaging: any }>('/packaging', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: string, data: any) => {
    return apiRequest<{ packaging: any }>(`/packaging/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string) => {
    return apiRequest(`/packaging/${id}`, { method: 'DELETE' })
  },
}

// Chatbot API
export const chatbotApi = {
  getConfig: async () => {
    return apiRequest<{ config: any }>('/chatbot/config')
  },

  updateConfig: async (data: any) => {
    return apiRequest<{ config: any }>('/chatbot/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  populateKnowledge: async () => {
    return apiRequest('/chatbot/populate-knowledge', { method: 'POST' })
  },

  deploy: async () => {
    return apiRequest('/chatbot/deploy', { method: 'POST' })
  },

  test: async (message: string) => {
    return apiRequest('/chatbot/test', {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  },
}
