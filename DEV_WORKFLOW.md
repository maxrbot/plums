# Development Workflow Guide

This monorepo contains three separate applications that work together.

---

## 📁 Project Structure

```
/marketing          → Marketing website (www.acrelist.ag)
/src               → Platform app (app.acrelist.ag)
/backend           → API server (api.acrelist.ag)
```

---

## 🚀 Running Apps Locally

### **Marketing Site**
```bash
cd marketing
npm run dev
```
- Runs on: **http://localhost:3002**
- Purpose: Public marketing site with waitlist
- When users log in: Redirects to platform at `localhost:3000`

### **Platform App**
```bash
cd /Users/max/Documents/GitHub/plums
npm run dev
```
- Runs on: **http://localhost:3000**
- Purpose: Main application with dashboard
- Root (`/`) redirects to `/dashboard`

### **Backend API**
```bash
cd backend
npm run dev
```
- Runs on: **http://localhost:3001**
- Purpose: API server for both marketing and platform

---

## 🔄 How They Connect Locally

### **Full Local Dev Setup** (All 3 running)

**Terminal 1: Backend**
```bash
cd backend
npm run dev
# Runs on localhost:3001
```

**Terminal 2: Platform**
```bash
cd /Users/max/Documents/GitHub/plums
npm run dev
# Runs on localhost:3000
```

**Terminal 3: Marketing**
```bash
cd marketing
npm run dev
# Runs on localhost:3002
```

### **Testing the Login Flow**

1. Open **http://localhost:3002** (marketing site)
2. Click "Sign In"
3. Enter credentials and log in
4. Redirects to **http://localhost:3000/dashboard** (platform)

---

## 🌐 Production URLs

| Service | Local | Production |
|---------|-------|------------|
| Marketing | `localhost:3002` | `www.acrelist.ag` |
| Platform | `localhost:3000` | `app.acrelist.ag` |
| Backend | `localhost:3001` | `api.acrelist.ag` |

---

## ⚙️ Environment Variables

### **Marketing** (`/marketing/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_PLATFORM_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Platform** (`/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_key
NEXT_PUBLIC_AUTH_REDIRECT_URL=http://localhost:3000/dashboard
```

### **Backend** (`/backend/.env`)
```env
MONGODB_URI=mongodb://localhost:27017/markethunt
SENDGRID_API_KEY=your_key
SENDGRID_VERIFIED_EMAIL=noreply@acrelist.ag
JWT_SECRET=your_secret
SESSION_SECRET=your_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## 🧪 Testing Different Scenarios

### **Test Marketing Site Only**
```bash
cd marketing && npm run dev
```
- Login will redirect to `localhost:3000` (platform)
- Platform must be running for login to work

### **Test Platform Only**
```bash
npm run dev
```
- Go to `localhost:3000`
- Will redirect to `/dashboard`
- Backend must be running for auth to work

### **Test Backend Only**
```bash
cd backend && npm run dev
curl http://localhost:3001/health
```

---

## 📝 Common Development Tasks

### **Update Marketing Site**
1. `cd marketing`
2. Make changes
3. Test at `localhost:3002`
4. Commit and push (auto-deploys to `www.acrelist.ag`)

### **Update Platform**
1. Make changes in `/src`
2. Test at `localhost:3000`
3. Commit and push (will deploy to `app.acrelist.ag` once set up)

### **Update Backend**
1. `cd backend`
2. Make changes
3. Test with platform/marketing
4. Commit and push (will deploy to `api.acrelist.ag` once set up)

---

## 🎯 Key Points

✅ **Marketing and Platform are separate Next.js apps**
- They run on different ports locally
- They communicate via URL redirects and API calls

✅ **Backend serves both**
- Marketing uses it for auth
- Platform uses it for everything

✅ **No duplicate code**
- Marketing site is ONLY in `/marketing`
- Platform app is ONLY in `/src`
- Root `/src/app/page.tsx` just redirects to dashboard

---

## 🚨 Troubleshooting

**"Port 3000 already in use"**
- You're trying to run both marketing and platform
- Marketing now runs on port 3002
- Platform runs on port 3000

**"Login doesn't work"**
- Make sure backend is running (`cd backend && npm run dev`)
- Check environment variables are set
- Check browser console for errors

**"Redirect loops"**
- Clear localStorage: `localStorage.clear()`
- Check `NEXT_PUBLIC_PLATFORM_URL` is set correctly

---

## 📚 Next Steps

Ready to deploy? See:
- `QUICK_DEPLOY.md` - Quick reference
- `DEPLOYMENT_GUIDE.md` - Full deployment guide

