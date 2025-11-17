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

// Initialize Google Maps API with the new Places library
export const initializeGoogleMaps = async (): Promise<void> => {
  if (isLoaded) return
  
  if (!config.googlePlaces.apiKey) {
    throw new Error('Google Places API key is not configured')
  }

  if (!googleMapsLoader) {
    googleMapsLoader = new Loader({
      apiKey: config.googlePlaces.apiKey,
      version: 'weekly',
      libraries: ['places', 'marker']
    })
  }

  try {
    await googleMapsLoader.load()
    // Import the new Places library
    await google.maps.importLibrary('places')
    isLoaded = true
  } catch (error) {
    console.error('Failed to load Google Maps API:', error)
    throw error
  }
}

// Create autocomplete service using the new PlaceAutocompleteElement
export const createPlacesAutocomplete = async (
  inputElement: HTMLInputElement,
  onPlaceSelect: (place: PlaceResult) => void
): Promise<any> => {
  await initializeGoogleMaps()

  // Create a container for the autocomplete element
  const container = document.createElement('div')
  container.style.width = '100%'
  
  // Insert the container before the input element
  inputElement.parentNode?.insertBefore(container, inputElement)
  
  // Hide the original input and remove required attribute to prevent form validation issues
  inputElement.style.display = 'none'
  inputElement.removeAttribute('required')

  // Create the new PlaceAutocompleteElement (no config needed for unrestricted version)
  const autocompleteElement = new google.maps.places.PlaceAutocompleteElement() as any

  // Style the autocomplete element to match the input
  const autocompleteInput = autocompleteElement.querySelector('input')
  if (autocompleteInput) {
    autocompleteInput.className = inputElement.className
    autocompleteInput.placeholder = inputElement.placeholder
    autocompleteInput.required = true // Make the new input required instead
  }

  container.appendChild(autocompleteElement)

  console.log('🗺️ PlaceAutocompleteElement created:', autocompleteElement)
  console.log('🗺️ Element properties:', Object.keys(autocompleteElement).join(', '))
  console.log('🗺️ Element.value:', autocompleteElement.value)
  console.log('🗺️ Element.place:', (autocompleteElement as any).place)
  
  // Check for common property names
  const possibleProps = ['value', 'place', 'selectedPlace', 'selection', 'data', 'result']
  possibleProps.forEach(prop => {
    if ((autocompleteElement as any)[prop] !== undefined) {
      console.log(`🗺️ Found property "${prop}":`, (autocompleteElement as any)[prop])
    }
  })
  
  // Store a reference to get the place later
  ;(autocompleteElement as any).getSelectedPlace = async () => {
    console.log('🗺️ getSelectedPlace called')
    console.log('🗺️ Element at submit - all props:', Object.keys(autocompleteElement).join(', '))
    console.log('🗺️ Element at submit - value:', autocompleteElement.value)
    console.log('🗺️ Element at submit - place:', (autocompleteElement as any).place)
    
    // Check all possible property names at submit time
    const possibleProps = ['value', 'place', 'selectedPlace', 'selection', 'data', 'result']
    possibleProps.forEach(prop => {
      if ((autocompleteElement as any)[prop] !== undefined) {
        console.log(`🗺️ At submit - Found property "${prop}":`, (autocompleteElement as any)[prop])
      }
    })
    
    // Try different ways to access the place
    const place = autocompleteElement.value || (autocompleteElement as any).place
    console.log('🗺️ Getting selected place:', place)
    
    if (place) {
      await handlePlaceSelection(place)
    }
    return place
  }

  // Try multiple event listeners to see which one works
  autocompleteElement.addEventListener('gmp-placeselect', async (event: any) => {
    console.log('🗺️ gmp-placeselect event fired:', event)
    await handlePlaceSelection(event.place)
  })

  // Also try the 'place_changed' event
  autocompleteElement.addEventListener('place_changed', async (event: any) => {
    console.log('🗺️ place_changed event fired:', event)
    await handlePlaceSelection(event.place)
  })

  // Try listening on the input element directly
  if (autocompleteInput) {
    autocompleteInput.addEventListener('change', (event: any) => {
      console.log('🗺️ input change event fired:', event)
    })
  }

  // Add a property observer for the place property
  Object.defineProperty(autocompleteElement, 'place', {
    set: async function(place) {
      console.log('🗺️ place property set:', place)
      await handlePlaceSelection(place)
    }
  })

  // Helper function to process place selection
  async function handlePlaceSelection(place: any) {
    console.log('🗺️ handlePlaceSelection called with place:', place)
    
    if (!place || !place.id) {
      console.warn('No place or place_id found for selected place')
      return
    }

    try {
      // Fetch full place details with the fields we need
      await place.fetchFields({
        fields: ['id', 'formattedAddress', 'displayName', 'addressComponents', 'location']
      })
      console.log('🗺️ Place after fetchFields:', place)

      // Extract address components
      let city = ''
      let state = ''
      let country = ''

      if (place.addressComponents) {
        for (const component of place.addressComponents) {
          const types = component.types
          
          if (types.includes('locality')) {
            city = component.longText
          } else if (types.includes('administrative_area_level_1')) {
            state = component.shortText
          } else if (types.includes('country')) {
            country = component.shortText
          }
        }
      }

      const result: PlaceResult = {
        placeId: place.id,
        formattedAddress: place.formattedAddress || '',
        name: place.displayName || '',
        city,
        state,
        country,
        coordinates: place.location ? {
          lat: place.location.lat(),
          lng: place.location.lng()
        } : undefined
      }

      console.log('🗺️ Calling onPlaceSelect with result:', result)
      onPlaceSelect(result)
    } catch (error) {
      console.error('🗺️ Error processing place selection:', error)
    }
  }

  return autocompleteElement
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
