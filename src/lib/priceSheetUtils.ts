/**
 * Shared utilities for price sheet operations
 * Centralizes logic for formatting products for preview modals
 */

import { PriceSheetProduct } from '@/components/modals/PriceSheetPreviewModal'

/**
 * Formats a raw product object into the structure expected by PriceSheetPreviewModal
 * 
 * This is the single source of truth for product formatting across:
 * - /dashboard/price-sheets/new
 * - /dashboard/price-sheets/library
 * - /dashboard/price-sheets/send
 * 
 * @param product - Raw product data from database or creation flow
 * @param options - Optional overrides for specific fields
 * @returns Formatted product ready for preview modal
 */
export function formatProductForPreview(
  product: any,
  options?: {
    adjustedPrice?: number | null
    showStrikethrough?: boolean
  }
): PriceSheetProduct {
  return {
    id: product._id || product.id,
    productName: product.productName || `${product.commodity || ''} ${product.variety || ''}`.trim() || 'Unknown Product',
    commodity: product.commodity,
    variety: product.variety,
    subtype: product.subtype,
    region: product.regionName || product.region || 'Unknown Region',
    packageType: product.packageType || '',
    size: product.size,
    countSize: product.countSize,
    grade: product.grade,
    basePrice: product.hasOverride || product.price === null ? null : product.price,
    adjustedPrice: options?.adjustedPrice !== undefined ? options.adjustedPrice : (product.hasOverride || product.price === null ? null : product.price),
    availability: product.availability || 'Available',
    showStrikethrough: options?.showStrikethrough || false,
    isOrganic: product.isOrganic || false,
    isStickered: product.isStickered || false,
    specialNotes: product.specialNotes,
    hasOverride: product.hasOverride || false,
    overrideComment: product.overrideComment
  }
}

/**
 * Formats multiple products for preview
 * Convenience wrapper around formatProductForPreview
 */
export function formatProductsForPreview(
  products: any[],
  options?: {
    adjustedPrices?: Record<string, number | null>
    showStrikethrough?: boolean
  }
): PriceSheetProduct[] {
  return products.map(product => {
    const productId = product._id || product.id
    const adjustedPrice = options?.adjustedPrices?.[productId]
    
    return formatProductForPreview(product, {
      adjustedPrice,
      showStrikethrough: options?.showStrikethrough
    })
  })
}

