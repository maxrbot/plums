# Acrelist Deployment Guide

This guide walks through deploying the Acrelist platform to production on Vercel.

---

## 📋 Pre-Deployment Checklist

### 1. **MongoDB Atlas Setup**

#### Current State
- You're likely using a local MongoDB instance (`mongodb://localhost:27017/markethunt`)

#### Production Setup
1. **Create MongoDB Atlas Account** (if not already done)
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up or log in

2. **Create a New Cluster**
   - Choose a cloud provider (AWS recommended for Vercel compatibility)
   - Select a region close to your users (e.g., `us-east-1` for US)
   - Choose the **FREE tier** (M0) to start

3. **Configure Database Access**
   - Go to "Database Access" in Atlas
   - Create a new database user with username/password
   - **Save these credentials securely** - you'll need them for `MONGODB_URI`

4. **Configure Network Access**
   - Go to "Network Access" in Atlas
   - Click "Add IP Address"
   - Select **"Allow Access from Anywhere"** (`0.0.0.0/0`)
   - This is required for Vercel's dynamic IPs

5. **Get Connection String**
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/acrelist?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your credentials
   - Replace the database name with `acrelist` (or your preferred name)

6. **Migrate Local Data to Atlas** (Optional)
   - Export from local MongoDB:
     ```bash
     mongodump --db markethunt --out ./backup
     ```
   - Import to Atlas:
     ```bash
     mongorestore --uri "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/acrelist" ./backup/markethunt
     ```

---

### 2. **SendGrid Configuration**

#### Already Completed ✅
- Domain authentication configured for `acrelist.ag`
- DNS records added to Vercel
- Verified sender: `noreply@acrelist.ag`
- API key generated

#### Verify Production Settings
1. **Confirm API Key**
   - Log in to SendGrid
   - Go to Settings → API Keys
   - Ensure you have an API key with "Mail Send" permissions
   - **Save this key** - you'll need it for `SENDGRID_API_KEY`

2. **Verify Domain Authentication**
   - Go to Settings → Sender Authentication → Domain Authentication
   - Ensure `acrelist.ag` shows "Verified"

3. **Confirm BCC Settings**
   - Platform oversight emails go to: `acrelisthistory@gmail.com`
   - This is hardcoded in the backend (no env var needed)

---

### 3. **Google Places API**

#### Current Usage
- Used for shipping point location autocomplete
- API key needed: `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`

#### Production Setup
1. **Go to Google Cloud Console**
   - https://console.cloud.google.com/

2. **Create/Select Project**
   - Create a new project or select existing

3. **Enable Places API**
   - Go to "APIs & Services" → "Library"
   - Search for "Places API"
   - Click "Enable"

4. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - **Restrict the key**:
     - Application restrictions: HTTP referrers
     - Add your domains:
       - `https://yourdomain.com/*`
       - `https://*.vercel.app/*` (for preview deployments)
     - API restrictions: Limit to "Places API"

5. **Set Up Billing** (Required)
   - Google Places API requires a billing account
   - You get $200/month free credit
   - Typical usage for this app: ~$5-20/month

---

### 4. **Authentication & Security**

#### JWT Secret
- Used for signing authentication tokens
- Generate a strong secret:
  ```bash
  openssl rand -base64 32
  ```
- Save this for `JWT_SECRET`

#### Session Secret
- Used for session management
- Generate another strong secret:
  ```bash
  openssl rand -base64 32
  ```
- Save this for `SESSION_SECRET`

---

## 🚀 Vercel Deployment

### Step 1: Prepare the Repository

1. **Commit all changes**
   ```bash
   git add -A
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Create `.gitignore` entries** (verify these exist)
   ```
   .env
   .env.local
   .env*.local
   node_modules/
   .next/
   dist/
   ```

### Step 2: Deploy Frontend to Vercel

1. **Go to Vercel Dashboard**
   - https://vercel.com/
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository (`plums`)
   - Vercel will auto-detect Next.js

3. **Configure Project**
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   Click "Environment Variables" and add:

   ```env
   # API Backend URL (we'll update this after deploying backend)
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
   
   # Google Places API
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key
   
   # Auth Redirect (update with your domain)
   NEXT_PUBLIC_AUTH_REDIRECT_URL=https://yourdomain.com/dashboard
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - You'll get a URL like: `https://plums-xxxxx.vercel.app`

### Step 3: Deploy Backend to Vercel

The backend needs a separate deployment since it's a Fastify server.

1. **Create `vercel.json` in backend directory**

   Create `/backend/vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/app.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "dist/app.js"
       }
     ]
   }
   ```

2. **Update backend `package.json`**
   
   Ensure these scripts exist:
   ```json
   {
     "scripts": {
       "build": "tsc",
       "start": "node dist/app.js",
       "vercel-build": "npm run build"
     }
   }
   ```

3. **Deploy Backend to Vercel**
   - In Vercel Dashboard, click "Add New..." → "Project"
   - Select the same repository
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Backend Environment Variables**
   ```env
   # MongoDB
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/acrelist?retryWrites=true&w=majority
   
   # SendGrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   SENDGRID_VERIFIED_EMAIL=noreply@acrelist.ag
   
   # JWT & Auth
   JWT_SECRET=your_generated_jwt_secret_here
   SESSION_SECRET=your_generated_session_secret_here
   
   # Environment
   NODE_ENV=production
   
   # CORS (your frontend URL)
   FRONTEND_URL=https://yourdomain.com
   ```

5. **Deploy Backend**
   - Click "Deploy"
   - You'll get a URL like: `https://plums-backend-xxxxx.vercel.app`

### Step 4: Connect Frontend to Backend

1. **Update Frontend Environment Variables**
   - Go to your frontend project in Vercel
   - Settings → Environment Variables
   - Update `NEXT_PUBLIC_API_URL`:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
     ```

2. **Update Backend CORS**
   - Go to your backend project in Vercel
   - Settings → Environment Variables
   - Update `FRONTEND_URL`:
     ```
     FRONTEND_URL=https://your-frontend-url.vercel.app
     ```

3. **Redeploy Both**
   - Go to "Deployments" tab for each project
   - Click "..." on latest deployment → "Redeploy"

### Step 5: Custom Domain (Optional but Recommended)

1. **Add Domain to Frontend**
   - In Vercel frontend project: Settings → Domains
   - Add your domain (e.g., `app.acrelist.ag` or `acrelist.ag`)
   - Follow DNS instructions

2. **Add Domain to Backend**
   - In Vercel backend project: Settings → Domains
   - Add subdomain (e.g., `api.acrelist.ag`)
   - Follow DNS instructions

3. **Update Environment Variables**
   - Update `NEXT_PUBLIC_API_URL` to `https://api.acrelist.ag/api`
   - Update `FRONTEND_URL` to `https://app.acrelist.ag`
   - Update `NEXT_PUBLIC_AUTH_REDIRECT_URL` to `https://app.acrelist.ag/dashboard`

---

## 🔐 User Authentication Strategy

### Option 1: Pre-loaded Demo Accounts (Recommended for Beta)

**For initial launch with pre-vetted users:**

1. **Create user accounts directly in MongoDB Atlas**
   - Use MongoDB Compass or Atlas UI
   - Insert into `users` collection:
     ```json
     {
       "email": "user@example.com",
       "password": "$2b$12$hashedpassword",
       "subscriptionTier": "enterprise",
       "profile": {
         "companyName": "Company Name",
         "contactName": "User Name",
         "email": "user@example.com",
         "phone": "",
         "address": {}
       },
       "createdAt": "2025-01-01T00:00:00.000Z",
       "updatedAt": "2025-01-01T00:00:00.000Z"
     }
     ```

2. **Generate hashed passwords**
   - Use bcrypt to hash passwords
   - Run this Node.js script locally:
     ```javascript
     const bcrypt = require('bcryptjs');
     const password = 'YourSecurePassword123!';
     const hash = bcrypt.hashSync(password, 12);
     console.log(hash);
     ```

3. **Share credentials securely**
   - Email users their login credentials
   - Recommend they change password on first login
   - (Note: Password change feature needs to be built)

### Option 2: Open Registration (Future)

**For public launch:**

1. **Enable signup endpoint** (already exists in `/backend/src/routes/auth.ts`)
2. **Add signup page** to frontend (needs to be built)
3. **Add email verification** (optional, requires additional setup)
4. **Add password reset flow** (needs to be built)

---

## 🧪 Testing Production Deployment

### 1. **Test Backend API**
```bash
# Health check
curl https://your-backend-url.vercel.app/health

# Test auth (should return 401 or error)
curl https://your-backend-url.vercel.app/api/users/me
```

### 2. **Test Frontend**
- Visit your Vercel URL
- Try logging in with test credentials
- Test all major flows:
  - [ ] Login/logout
  - [ ] Add shipping points
  - [ ] Add commodities
  - [ ] Setup packaging
  - [ ] Add contacts
  - [ ] Create price sheet
  - [ ] Send price sheet email
  - [ ] View public price sheet
  - [ ] Submit order request

### 3. **Test Email Sending**
- Send a test price sheet
- Verify:
  - [ ] Email arrives in recipient inbox
  - [ ] BCC to `acrelisthistory@gmail.com` works
  - [ ] Links in email work correctly
  - [ ] Public price sheet loads
  - [ ] Order request email sends correctly

---

## 📊 Monitoring & Maintenance

### Vercel Analytics
- Enable in Vercel dashboard (free tier available)
- Monitor page views, performance, errors

### MongoDB Atlas Monitoring
- Set up alerts for:
  - High connection count
  - Storage usage
  - Query performance

### SendGrid Monitoring
- Check email delivery rates
- Monitor bounce/spam rates
- Review activity feed

### Error Tracking (Optional)
- Consider adding Sentry or LogRocket
- Helps catch production errors

---

## 🚨 Common Issues & Solutions

### Issue: CORS Errors
**Solution**: Ensure `FRONTEND_URL` is set correctly in backend env vars

### Issue: Database Connection Timeout
**Solution**: 
- Check MongoDB Atlas network access (0.0.0.0/0)
- Verify connection string is correct
- Check if cluster is paused (Atlas pauses after inactivity)

### Issue: SendGrid Emails Not Sending
**Solution**:
- Verify API key is correct
- Check domain authentication status
- Review SendGrid activity logs

### Issue: Environment Variables Not Updating
**Solution**:
- After changing env vars, you MUST redeploy
- Vercel doesn't auto-redeploy on env var changes

### Issue: Build Failures
**Solution**:
- Check build logs in Vercel
- Ensure all dependencies are in `package.json`
- Verify TypeScript compiles locally: `npm run build`

---

## 📝 Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and accessible
- [ ] Environment variables configured
- [ ] MongoDB Atlas connected
- [ ] SendGrid emails working
- [ ] Custom domains configured (if applicable)
- [ ] Test user accounts created
- [ ] All major features tested in production
- [ ] Error monitoring set up
- [ ] Database backups configured (Atlas does this automatically)
- [ ] SSL certificates active (Vercel handles this)

---

## 🔄 Continuous Deployment

Vercel automatically deploys on every push to `main`:
- **Production**: Deploys from `main` branch
- **Preview**: Deploys from feature branches

To disable auto-deploy:
- Go to Project Settings → Git
- Configure deployment branches

---

## 💰 Cost Estimates

### Free Tier (Good for Beta/Testing)
- **Vercel**: Free (Hobby plan)
  - 100 GB bandwidth/month
  - Unlimited deployments
- **MongoDB Atlas**: Free (M0 cluster)
  - 512 MB storage
  - Shared CPU
- **SendGrid**: Free
  - 100 emails/day
- **Google Places API**: Free
  - $200/month credit (covers ~40,000 requests)

### Paid Tier (When Scaling)
- **Vercel Pro**: $20/month
  - 1 TB bandwidth
  - Better performance
- **MongoDB Atlas M10**: ~$57/month
  - 10 GB storage
  - Dedicated CPU
- **SendGrid Essentials**: $19.95/month
  - 50,000 emails/month
- **Google Places API**: ~$5-50/month
  - Depends on usage

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **SendGrid Docs**: https://docs.sendgrid.com/
- **Next.js Docs**: https://nextjs.org/docs

---

## 🎉 You're Ready to Deploy!

Follow the steps above in order, and you'll have a production-ready deployment. Good luck! 🚀
