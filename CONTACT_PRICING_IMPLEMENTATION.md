# ✅ Contact-Specific Pricing Implementation Complete!

## What We Just Built

You now have a **secure, contact-specific pricing system** for your price sheets! Here's what changed:

### 🔐 Security Features

1. **Base URL (No Pricing)**
   - Anyone can visit: `https://acrelist.com/ps/abc123`
   - They see: Product catalog WITHOUT pricing
   - Use case: Share publicly, on social media, or with prospects

2. **Personalized URL (With Pricing)**
   - Contacts receive: `https://acrelist.com/ps/abc123?c=a1b2c3d4e5f6g7h8`
   - They see: Their personalized pricing (with discounts applied)
   - Security: Hash uses contactID as salt - impossible to forge or reverse-engineer

---

## Files Changed

### Backend

1. **`backend/src/utils/contactHash.ts`** (NEW)
   - Generates secure hashes using HMAC-SHA256
   - Uses contactID as part of the salt for extra security
   - Provides verification and lookup functions

2. **`backend/src/routes/priceSheets.ts`**
   - Updated email sending to generate unique hashed URLs per contact
   - Each contact gets: `baseUrl + "?c=" + hash`

3. **`backend/src/routes/public.ts`**
   - Reads contact hash from URL query parameter
   - Verifies hash against sent contacts
   - Applies contact-specific pricing adjustments
   - Hides pricing if no valid hash present

### Frontend

4. **`src/app/ps/[id]/page.tsx`**
   - Reads contact hash from URL
   - Conditionally displays pricing column
   - Shows helpful banner when pricing is hidden
   - Fetches data with hash parameter

### Documentation

5. **`PRICING_SYSTEM.md`** (NEW)
   - Comprehensive guide to the pricing system
   - Security considerations
   - Use cases and examples
   - Troubleshooting guide

6. **`CONTACT_PRICING_IMPLEMENTATION.md`** (THIS FILE)
   - Implementation summary
   - Testing instructions

---

## How It Works (Quick Version)

### Sending Emails

```typescript
// For each contact:
1. Generate unique hash: hash = generateContactHash(contactId, priceSheetId)
2. Build personalized URL: url = `${baseUrl}?c=${hash}`
3. Send email with personalized URL
```

### Viewing Price Sheets

```typescript
// When someone visits a price sheet:
1. Check if URL has ?c=hash parameter
2. If yes: Verify hash → Show pricing with contact adjustments
3. If no: Hide all pricing → Show catalog only
```

---

## Testing Instructions

### Test 1: Base URL (No Pricing)

1. Navigate to: `http://localhost:3000/dashboard/price-sheets/send`
2. Send a price sheet to at least one contact
3. After sending, copy the price sheet ID from the success message
4. Visit: `http://localhost:3000/ps/{priceSheetId}` (without ?c= parameter)
5. **Expected:** Products visible, but NO pricing column

### Test 2: Personalized URL (With Pricing)

1. Send a price sheet to a contact via the `/send` page
2. Check your email inbox (the sender gets BCC'd)
3. Click "View Price Sheet" button in the email
4. **Expected:** 
   - URL has `?c=...` at the end
   - Products visible WITH pricing column
   - Prices match what you set

### Test 3: Contact-Specific Pricing

1. Go to `/dashboard/contacts`
2. Edit two contacts:
   - Contact A: Set `pricingAdjustment` to `-10` (10% discount)
   - Contact B: Set `pricingAdjustment` to `0` (base pricing)
3. Send the same price sheet to both contacts
4. Open each personalized link (from their emails)
5. **Expected:**
   - Contact A sees 10% lower prices
   - Contact B sees base prices

### Test 4: Invalid Hash

1. Visit a personalized URL: `http://localhost:3000/ps/abc123?c=validhash`
2. Manually change the hash in the URL: `?c=invalidhash`
3. **Expected:** Pricing is hidden (hash verification fails)

---

## Environment Variables

### Required

Add to `backend/.env`:

```bash
# Contact Hash Secret (for personalized price sheet URLs)
CONTACT_HASH_SECRET=your-random-secret-string-for-contact-hashing
```

**Important:**
- Use a strong, random secret in production
- Changing this will invalidate all existing hashed URLs
- Never commit this to version control

### Optional (Already Set)

```bash
SENDGRID_API_KEY=SG.your-api-key
SENDGRID_VERIFIED_EMAIL=max@acrelist.ag
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/plums
JWT_SECRET=your-jwt-secret
```

---

## What Happens in Production

### When You Deploy

1. **Set `CONTACT_HASH_SECRET`** in your production environment
2. **Update `FRONTEND_URL`** to your production domain
3. All price sheet links will automatically use the production URL

### Email Links

Contacts will receive emails with links like:

```
https://acrelist.com/ps/69067ab31d64007a3453f380?c=a1b2c3d4e5f6g7h8
```

- The hash (`c=...`) is unique per contact
- Can't be guessed or forged
- Automatically applies their pricing adjustments

### Public Sharing

You can share the base URL publicly:

```
https://acrelist.com/ps/69067ab31d64007a3453f380
```

- Shows product catalog
- NO pricing visible
- Great for social media, website, etc.

---

## Security Considerations

### ✅ What's Protected

- **Contact IDs are hidden** - Hash doesn't reveal the contact ID
- **Can't forge hashes** - Need secret key + contact ID
- **Can't guess hashes** - 16-character hex = 2^64 combinations
- **Contact-specific** - Each contact gets unique hash

### ⚠️ Limitations

- **URL sharing** - If contact shares their URL, others see their pricing
- **Email forwarding** - Forwarded emails give recipient the same pricing

### 🛡️ Mitigations

- Track views by IP address and user agent (already implemented)
- Monitor for suspicious access patterns
- Add confidentiality notice to emails

---

## Next Steps

### Immediate

1. **Test the system** using the instructions above
2. **Set `CONTACT_HASH_SECRET`** in your `.env` file
3. **Send a test price sheet** to yourself

### Future Enhancements

Consider adding:

1. **Expiring links** - Add timestamp to hash, expire after X days
2. **One-time links** - Invalidate after first view
3. **IP restrictions** - Only allow views from specific IP ranges
4. **View limits** - Limit how many times a link can be accessed
5. **Watermarking** - Add contact name/email as watermark on page

---

## Troubleshooting

### "Pricing is hidden even with a hash"

**Causes:**
- Hash is invalid
- Contact wasn't in original `sentTo` list
- `CONTACT_HASH_SECRET` changed since email was sent

**Solution:**
- Re-send the price sheet
- Check backend logs for hash verification errors

### "All contacts see the same pricing"

**Causes:**
- All contacts have `pricingAdjustment: 0`
- Adjustment not being applied

**Solution:**
- Check contact records in MongoDB for `pricingAdjustment`
- Verify backend logic in `public.ts`

### "Can't send emails"

**Causes:**
- SendGrid API key not set
- Verified email doesn't match

**Solution:**
- Check `SENDGRID_API_KEY` and `SENDGRID_VERIFIED_EMAIL` in `.env`
- Verify email in SendGrid dashboard

---

## Summary

✅ **Base URL** → Catalog view (no pricing)  
✅ **Hashed URL** → Personalized pricing for contacts  
✅ **Secure** → Can't forge or reverse-engineer  
✅ **Flexible** → Automatic contact-specific discounts  
✅ **Trackable** → Monitor who views what  

You're ready to start sending personalized price sheets! 🎉

---

## Quick Reference

### Generate Hash (Backend)

```typescript
import { generateContactHash } from '../utils/contactHash'

const hash = generateContactHash(contactId, priceSheetId)
// Returns: "a1b2c3d4e5f6g7h8"
```

### Verify Hash (Backend)

```typescript
import { verifyContactHash } from '../utils/contactHash'

const isValid = verifyContactHash(hash, contactId, priceSheetId)
// Returns: true or false
```

### Find Contact by Hash (Backend)

```typescript
import { findContactByHash } from '../utils/contactHash'

const contactId = findContactByHash(hash, priceSheetId, contactIds)
// Returns: contactId or null
```

---

**Need help?** Check `PRICING_SYSTEM.md` for detailed documentation.

