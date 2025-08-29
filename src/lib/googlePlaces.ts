import { Loader } from '@googlemaps/js-api-loader'
import { config } from './config'

let googleMapsLoader: Loader | null = null
let isLoaded = false

export interface PlaceResult {
  placeId: string
  formattedAddress: string
  name: string
  city?: string
  state?: string
  country?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

// Initialize Google Maps API
export const initializeGoogleMaps = async (): Promise<void> => {
  if (isLoaded) return
  
  if (!config.googlePlaces.apiKey) {
    throw new Error('Google Places API key is not configured')
  }

  if (!googleMapsLoader) {
    googleMapsLoader = new Loader({
      apiKey: config.googlePlaces.apiKey,
      version: 'weekly',
      libraries: ['places']
    })
  }

  try {
    await googleMapsLoader.load()
    isLoaded = true
  } catch (error) {
    console.error('Failed to load Google Maps API:', error)
    throw error
  }
}

// Create autocomplete service
export const createPlacesAutocomplete = async (
  inputElement: HTMLInputElement,
  onPlaceSelect: (place: PlaceResult) => void
): Promise<google.maps.places.Autocomplete> => {
  await initializeGoogleMaps()

  const autocomplete = new google.maps.places.Autocomplete(inputElement, {
    types: ['(cities)'],
    fields: ['place_id', 'formatted_address', 'name', 'address_components', 'geometry']
  })

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    
    if (!place.place_id) {
      console.warn('No place_id found for selected place')
      return
    }

    // Extract address components
    let city = ''
    let state = ''
    let country = ''

    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types
        
        if (types.includes('locality')) {
          city = component.long_name
        } else if (types.includes('administrative_area_level_1')) {
          state = component.short_name
        } else if (types.includes('country')) {
          country = component.short_name
        }
      }
    }

    const result: PlaceResult = {
      placeId: place.place_id,
      formattedAddress: place.formatted_address || '',
      name: place.name || '',
      city,
      state,
      country,
      coordinates: place.geometry?.location ? {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      } : undefined
    }

    onPlaceSelect(result)
  })

  return autocomplete
}

// Search places by text
export const searchPlaces = async (query: string): Promise<PlaceResult[]> => {
  await initializeGoogleMaps()

  return new Promise((resolve, reject) => {
    const service = new google.maps.places.PlacesService(document.createElement('div'))
    
    service.textSearch(
      {
        query,
        type: 'locality'
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const places: PlaceResult[] = results.map(result => ({
            placeId: result.place_id || '',
            formattedAddress: result.formatted_address || '',
            name: result.name || '',
            coordinates: result.geometry?.location ? {
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng()
            } : undefined
          }))
          resolve(places)
        } else {
          reject(new Error(`Places search failed: ${status}`))
        }
      }
    )
  })
}
