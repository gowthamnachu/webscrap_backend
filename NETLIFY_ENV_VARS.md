# 🔐 Netlify Environment Variables

Copy these exact values into your Netlify dashboard:

## 📋 Environment Variables to Add

### 1. SUPABASE_URL
```
https://xaurzkcucsoraqoptyrw.supabase.co
```

### 2. SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhdXJ6a2N1Y3NvcmFxb3B0eXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDgwMzYsImV4cCI6MjA3NjIyNDAzNn0.1i26SU3R7HRCmN-kOJjTu9_XvIIy0FcnJRSKcwU8Pbs
```

### 3. GEMINI_API_KEY
```
AIzaSyDbedaZccJ_fip8uTyX_B5uvIDdeBM1WoM
```

---

## 🚀 How to Add These in Netlify

### Step 1: Go to Environment Variables Page
Click this link: https://app.netlify.com/sites/backend-17-10-2025/settings/env

### Step 2: Add Each Variable

**For each variable above:**
1. Click **"Add a variable"** button
2. Enter the **Key** (e.g., `SUPABASE_URL`)
3. Paste the **Value** from above
4. Select **"Same value for all deploy contexts"** or just **Production**
5. Click **"Create variable"**

### Step 3: Redeploy Your Site

After adding all 3 variables:
1. Go to: https://app.netlify.com/sites/backend-17-10-2025/deploys
2. Click **"Trigger deploy"** dropdown
3. Select **"Clear cache and deploy site"**
4. Wait for deployment to complete (1-2 minutes)

---

## ✅ Quick Copy-Paste Format

If you prefer to add them all at once (some Netlify interfaces support bulk import):

```
SUPABASE_URL=https://xaurzkcucsoraqoptyrw.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhdXJ6a2N1Y3NvcmFxb3B0eXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDgwMzYsImV4cCI6MjA3NjIyNDAzNn0.1i26SU3R7HRCmN-kOJjTu9_XvIIy0FcnJRSKcwU8Pbs
GEMINI_API_KEY=AIzaSyDbedaZccJ_fip8uTyX_B5uvIDdeBM1WoM
```

---

## 🧪 Test After Deployment

Run this command to test all endpoints:
```powershell
cd c:\Users\gowth\Desktop\deploython\web_scarp\backend
.\test-netlify.ps1
```

Or test in your frontend at: http://localhost:5174

---

## 📝 Visual Guide

Here's what it should look like in Netlify:

```
┌─────────────────────────────────────────────────────────────┐
│ Environment Variables                                        │
├─────────────────────────────────────────────────────────────┤
│ Key: SUPABASE_URL                                           │
│ Value: https://xaurzkcucsoraqoptyrw.supabase.co            │
│ Scopes: Production ✓                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Environment Variables                                        │
├─────────────────────────────────────────────────────────────┤
│ Key: SUPABASE_ANON_KEY                                      │
│ Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi... │
│ Scopes: Production ✓                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Environment Variables                                        │
├─────────────────────────────────────────────────────────────┤
│ Key: GEMINI_API_KEY                                         │
│ Value: AIzaSyDbedaZccJ_fip8uTyX_B5uvIDdeBM1WoM              │
│ Scopes: Production ✓                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Important Notes

1. **Don't share these values publicly** - They're in this file for your convenience only
2. **Environment variables only apply after redeployment** - Make sure to redeploy!
3. **Check deployment logs** if you still see errors after redeployment
4. **The anon key expires**: 2076-04-16 (you have many years!)

---

## 🎯 Expected Result

After adding env vars and redeploying, you should see:

✅ **200/201 status codes** instead of 500 errors
✅ **Successful scraping** with AI analysis
✅ **Data saved to Supabase** database
✅ **Frontend works perfectly** at http://localhost:5174

---

**🔗 Quick Links:**
- Add Env Vars: https://app.netlify.com/sites/backend-17-10-2025/settings/env
- Trigger Deploy: https://app.netlify.com/sites/backend-17-10-2025/deploys
- View Logs: https://app.netlify.com/sites/backend-17-10-2025/logs
- Function Logs: https://app.netlify.com/sites/backend-17-10-2025/functions

---

**✨ You're almost there! Just add these variables and redeploy!**
