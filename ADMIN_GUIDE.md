# 🔐 Admin Dashboard Guide

## Setup (One-Time)

### 1. Create Admin User

Run this script to create your admin account:

```bash
cd /Users/max/Documents/GitHub/plums
node backend/scripts/create-admin-user.js
```

**Default Credentials:**
- Email: `admin@acrelist.ag`
- Password: `admin123`

⚠️ **IMPORTANT:** Change the password after first login!

---

## Using the Admin Dashboard

### 1. Login as Admin

1. Go to `https://app.acrelist.ag` (or `localhost:3000`)
2. Login with `admin@acrelist.ag`
3. You'll be redirected to `/dashboard` (normal dashboard)
4. Navigate to `/admin` manually (or add a link in the sidebar)

### 2. Admin Dashboard Features

**URL:** `/admin`

**What you see:**
- ✅ Total users count
- ✅ Total price sheets across all users
- ✅ Total contacts across all users
- ✅ Total emails sent
- ✅ User list with activity stats
- ✅ "View as User" button for each user

### 3. Impersonate a User

1. Click "View as User" button next to any user
2. You'll be redirected to `/dashboard` as that user
3. **Red banner appears** at the top: "ADMIN MODE - Viewing as: [User]"
4. You see exactly what they see (their crops, contacts, price sheets, etc.)
5. Click "Exit Impersonation" to return to admin dashboard

**What happens behind the scenes:**
- Your admin token is saved in `localStorage.adminToken`
- User's token replaces your token temporarily
- All actions are logged in `adminLogs` collection
- When you exit, your admin token is restored

---

## Security Features

✅ **Password never shared** - You don't know their password
✅ **Audit trail** - All impersonations logged in MongoDB
✅ **Time-limited** - Impersonation tokens expire after 2 hours
✅ **Clear indicator** - Red banner shows you're in admin mode
✅ **Easy exit** - One-click return to admin dashboard

---

## MongoDB Collections

### `adminLogs`
Tracks all admin actions:
```javascript
{
  adminId: "admin-user-id",
  adminEmail: "admin@acrelist.ag",
  action: "impersonate",
  targetUserId: "user-id",
  targetUserEmail: "user@example.com",
  timestamp: ISODate("2025-01-19T...")
}
```

### View Logs
```javascript
// In MongoDB Compass
db.adminLogs.find().sort({ timestamp: -1 }).limit(20)
```

---

## API Endpoints

All require `Authorization: Bearer <admin-token>` header:

### `GET /api/admin/users`
Returns all users with activity stats

### `GET /api/admin/users/:userId`
Returns detailed info for a specific user

### `POST /api/admin/impersonate/:userId`
Generates impersonation token for a user

### `GET /api/admin/logs`
Returns last 100 admin actions

---

## Monitoring Beta Users

### Quick Queries

**User activity summary:**
```javascript
db.users.aggregate([
  { $match: { subscriptionTier: { $ne: 'admin' } } },
  { $lookup: { from: "crops", localField: "_id", foreignField: "userId", as: "crops" } },
  { $lookup: { from: "contacts", localField: "_id", foreignField: "userId", as: "contacts" } },
  { $lookup: { from: "priceSheets", localField: "_id", foreignField: "userId", as: "priceSheets" } },
  { $lookup: { from: "sentEmails", localField: "_id", foreignField: "userId", as: "sentEmails" } },
  { $project: {
    email: 1,
    "profile.companyName": 1,
    createdAt: 1,
    cropCount: { $size: "$crops" },
    contactCount: { $size: "$contacts" },
    priceSheetCount: { $size: "$priceSheets" },
    emailsSentCount: { $size: "$sentEmails" }
  }},
  { $sort: { createdAt: -1 } }
])
```

**Recent emails sent by user:**
```javascript
db.sentEmails.find({ 
  userId: ObjectId("user-id-here") 
}).sort({ sentAt: -1 }).limit(10)
```

**Users who haven't completed onboarding:**
```javascript
db.users.aggregate([
  { $match: { subscriptionTier: { $ne: 'admin' } } },
  { $lookup: { from: "crops", localField: "_id", foreignField: "userId", as: "crops" } },
  { $lookup: { from: "contacts", localField: "_id", foreignField: "userId", as: "contacts" } },
  { $match: { 
    $or: [
      { crops: { $size: 0 } },
      { contacts: { $size: 0 } }
    ]
  }},
  { $project: { email: 1, "profile.companyName": 1, createdAt: 1 } }
])
```

---

## Tips for Beta Launch

### Before User Signs Up:
1. ✅ Test the full flow yourself one more time
2. ✅ Have MongoDB Compass open
3. ✅ Have backend logs visible (`npm run dev:backend`)
4. ✅ Prepare a feedback form or Slack channel

### After User Signs Up:
1. **First Hour:** Watch their activity in admin dashboard
2. **First Day:** Check MongoDB for their data
3. **First Week:** Schedule a feedback call
4. **Ongoing:** Check admin logs for impersonation history

### What to Look For:
- ❓ Did they add crops?
- ❓ Did they add contacts?
- ❓ Did they create a price sheet?
- ❓ Did they send their first email?
- ❓ Where did they get stuck?

---

## Future Enhancements (Post-Beta)

- [ ] Add admin link to sidebar (only visible to admin users)
- [ ] Email notifications when new users sign up
- [ ] User activity timeline
- [ ] Bulk actions (suspend user, send message, etc.)
- [ ] Analytics dashboard (user growth, feature adoption, etc.)
- [ ] Export user data to CSV
- [ ] In-app messaging to users
- [ ] Feature flags (enable/disable features per user)

---

## Troubleshooting

**Can't access /admin:**
- Check your `subscriptionTier` in MongoDB: `db.users.findOne({ email: 'admin@acrelist.ag' })`
- Should be `'admin'`, not `'enterprise'`

**Impersonation not working:**
- Check browser console for errors
- Verify JWT_SECRET is set in backend `.env`
- Check admin logs: `db.adminLogs.find().sort({ timestamp: -1 })`

**Can't exit impersonation:**
- Manually clear localStorage: `localStorage.clear()` in browser console
- Re-login as admin

---

## Security Best Practices

1. ✅ Never share admin credentials
2. ✅ Change default password immediately
3. ✅ Only impersonate when necessary
4. ✅ Review admin logs regularly
5. ✅ Don't modify user data directly (use impersonation)
6. ✅ Keep admin account separate from personal account

---

**Questions?** Check the code in:
- Backend: `backend/src/routes/admin.ts`
- Frontend: `src/app/admin/page.tsx`
- Layout: `src/app/dashboard/layout.tsx` (impersonation banner)

