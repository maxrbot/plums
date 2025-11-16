# Quick Deployment Checklist

Use this as a quick reference while deploying. See `DEPLOYMENT_GUIDE.md` for detailed instructions.

---

## ✅ Pre-Deployment Setup

### 1. MongoDB Atlas
- [ ] Create cluster (M0 Free tier)
- [ ] Create database user
- [ ] Allow access from anywhere (0.0.0.0/0)
- [ ] Get connection string
- [ ] (Optional) Migrate local data

**Connection String Format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/acrelist?retryWrites=true&w=majority
```

### 2. SendGrid
- [x] Domain verified (`acrelist.ag`)
- [x] Sender verified (`noreply@acrelist.ag`)
- [ ] Get API key (Settings → API Keys)

### 3. Google Places API
- [ ] Enable Places API in Google Cloud Console
- [ ] Create API key
- [ ] Restrict key to your domains
- [ ] Enable billing (required, but $200/month free credit)

### 4. Generate Secrets
```bash
# JWT Secret
openssl rand -base64 32

# Session Secret
openssl rand -base64 32
```

---

## 🚀 Vercel Deployment Steps

### Step 1: Deploy Frontend

1. **Push to GitHub**
   ```bash
   git add -A
   git commit -m "Prepare for production"
   git push origin main
   ```

2. **Vercel Dashboard**
   - Import project from GitHub
   - Framework: Next.js
   - Root: `./`

3. **Environment Variables**
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_key
   NEXT_PUBLIC_AUTH_REDIRECT_URL=https://your-domain.com/dashboard
   ```

4. **Deploy** → Get URL

### Step 2: Deploy Backend

1. **Vercel Dashboard**
   - Import same repository
   - Framework: Other
   - Root: `backend`

2. **Environment Variables**
   ```env
   MONGODB_URI=mongodb+srv://...
   SENDGRID_API_KEY=SG.xxx
   SENDGRID_VERIFIED_EMAIL=noreply@acrelist.ag
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

3. **Deploy** → Get URL

### Step 3: Connect Them

1. **Update Frontend Env Vars**
   - `NEXT_PUBLIC_API_URL` → backend URL

2. **Update Backend Env Vars**
   - `FRONTEND_URL` → frontend URL

3. **Redeploy Both**

---

## 🧪 Testing Checklist

- [ ] Backend health check: `https://backend-url/health`
- [ ] Frontend loads
- [ ] Can log in
- [ ] Can add shipping points
- [ ] Can add commodities
- [ ] Can setup packaging
- [ ] Can add contacts
- [ ] Can create price sheet
- [ ] Can send email (check inbox + BCC)
- [ ] Public price sheet loads
- [ ] Order request works

---

## 🔐 Creating User Accounts

### Option 1: Manual (Recommended for Beta)

1. **Generate password hash:**
   ```javascript
   const bcrypt = require('bcryptjs');
   console.log(bcrypt.hashSync('password123', 12));
   ```

2. **Insert in MongoDB Atlas:**
   ```json
   {
     "email": "user@company.com",
     "password": "$2b$12$hashedpassword...",
     "subscriptionTier": "enterprise",
     "profile": {
       "companyName": "Company Name",
       "contactName": "User Name",
       "email": "user@company.com",
       "phone": "",
       "address": {}
     },
     "preferences": {
       "defaultPriceUnit": "lb",
       "timezone": "America/Los_Angeles",
       "currency": "USD",
       "notifications": {
         "email": true,
         "priceAlerts": true,
         "marketUpdates": false
       }
     },
     "createdAt": { "$date": "2025-01-01T00:00:00.000Z" },
     "updatedAt": { "$date": "2025-01-01T00:00:00.000Z" }
   }
   ```

3. **Share credentials securely**

### Option 2: Open Signup (Future)
- Build signup page
- Enable `/api/auth/signup` endpoint

---

## 🎯 Custom Domains (Optional)

### Frontend
- Vercel → Settings → Domains
- Add: `app.acrelist.ag` or `acrelist.ag`
- Update DNS records in Vercel DNS

### Backend
- Vercel → Settings → Domains
- Add: `api.acrelist.ag`
- Update DNS records

### Update Env Vars
- Frontend: `NEXT_PUBLIC_API_URL=https://api.acrelist.ag/api`
- Backend: `FRONTEND_URL=https://app.acrelist.ag`
- Redeploy both

---

## 💰 Cost Summary

**Free Tier (Good for Beta):**
- Vercel: Free
- MongoDB Atlas M0: Free
- SendGrid: Free (100 emails/day)
- Google Places: Free ($200 credit)

**Total: $0/month**

**Paid Tier (When Scaling):**
- Vercel Pro: $20/month
- MongoDB M10: $57/month
- SendGrid Essentials: $19.95/month
- Google Places: ~$5-50/month

**Total: ~$100-150/month**

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Check `FRONTEND_URL` in backend |
| DB timeout | Check Atlas network access |
| Emails not sending | Verify SendGrid API key |
| Env vars not working | Redeploy after changing |
| Build fails | Check build logs, run `npm run build` locally |

---

## 📞 Need Help?

- Vercel: https://vercel.com/docs
- MongoDB: https://docs.atlas.mongodb.com/
- SendGrid: https://docs.sendgrid.com/

---

**Ready to deploy? Start with Step 1! 🚀**

