import crypto from 'crypto'
import database from '../config/database'
import { ObjectId } from 'mongodb'

/**
 * Generate a secure hash for a contact ID
 * Uses the contact ID itself as part of the salt for extra security
 * 
 * @param contactId - The MongoDB ObjectId string of the contact
 * @param priceSheetId - The MongoDB ObjectId string of the price sheet
 * @returns A secure hash string
 */
export function generateContactHash(contactId: string, priceSheetId: string): string {
  // Use contactID as part of the salt - makes it impossible to reverse engineer
  const salt = `${process.env.CONTACT_HASH_SECRET || 'plums-default-secret'}-${contactId}`
  const data = `${priceSheetId}:${contactId}`
  
  return crypto
    .createHmac('sha256', salt)
    .update(data)
    .digest('hex')
    .substring(0, 16) // Shorter hash for cleaner URLs
}

/**
 * Generate a unique hash for a specific email send
 * This is unique per send, so sending the same sheet to the same contact twice
 * will generate different hashes (allowing different custom pricing per send)
 * 
 * @param contactId - The MongoDB ObjectId string of the contact
 * @param priceSheetId - The MongoDB ObjectId string of the price sheet
 * @param timestamp - Optional timestamp to make hash unique per send
 * @returns A secure unique hash string
 */
export function generateUniqueSendHash(contactId: string, priceSheetId: string, timestamp?: number): string {
  const salt = `${process.env.CONTACT_HASH_SECRET || 'plums-default-secret'}-${contactId}`
  const time = timestamp || Date.now()
  const data = `${priceSheetId}:${contactId}:${time}`
  
  return crypto
    .createHmac('sha256', salt)
    .update(data)
    .digest('hex')
    .substring(0, 16) // Shorter hash for cleaner URLs
}

/**
 * Verify a contact hash is valid
 * 
 * @param hash - The hash to verify
 * @param contactId - The contact ID to verify against
 * @param priceSheetId - The price sheet ID to verify against
 * @returns True if the hash is valid
 */
export function verifyContactHash(hash: string, contactId: string, priceSheetId: string): boolean {
  const expectedHash = generateContactHash(contactId, priceSheetId)
  return hash === expectedHash
}

/**
 * Find which contact a hash belongs to (by trying all contacts)
 * This is used when we receive a hash and need to find the matching contact
 * 
 * @param hash - The hash to look up
 * @param priceSheetId - The price sheet ID
 * @param contactIds - Array of contact IDs to check against
 * @returns The matching contact ID, or null if not found
 */
export function findContactByHash(
  hash: string, 
  priceSheetId: string, 
  contactIds: string[]
): string | null {
  for (const contactId of contactIds) {
    if (verifyContactHash(hash, contactId, priceSheetId)) {
      return contactId
    }
  }
  return null
}

/**
 * Find which contact a hash belongs to by querying the database
 * This is used when we receive a hash and need to find the matching contact
 * 
 * @param hash - The hash to look up
 * @param priceSheetId - The price sheet ID
 * @param userId - The user ID who owns the contacts
 * @returns The matching contact object, or null if not found
 */
export async function findContactByHashFromDb(
  hash: string, 
  priceSheetId: string,
  userId: ObjectId
): Promise<any | null> {
  const db = database.getDb()
  
  // Get all contacts for this user
  const contacts = await db.collection('contacts').find({ userId }).toArray()
  
  console.log(`🔎 Checking ${contacts.length} contacts for hash match`)
  console.log('Hash to match:', hash)
  console.log('Price sheet ID:', priceSheetId)
  
  // Try to find a matching contact
  for (const contact of contacts) {
    const contactId = contact._id.toString()
    const expectedHash = generateContactHash(contactId, priceSheetId)
    console.log(`  Checking contact ${contact.email}: generated hash = ${expectedHash}, matches = ${hash === expectedHash}`)
    if (verifyContactHash(hash, contactId, priceSheetId)) {
      console.log(`✅ Found matching contact: ${contact.email}`)
      return contact
    }
  }
  
  console.log('❌ No matching contact found')
  return null
}

