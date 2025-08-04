# AI Insights Troubleshooting Guide

## 🚨 Issue: `/api/analyze/insights` endpoint not working

### Problem Description
The AI insights endpoint returns errors or doesn't work properly in deployment.

### 🔍 Common Issues and Solutions

#### 1. **503 Error: "AI service not available"**

**Cause**: `GEMINI_API_KEY` environment variable is not configured.

**Solution**:
```bash
# Add to your deployment platform (Railway/Render/Heroku)
GEMINI_API_KEY=your_gemini_api_key_here

# Get your API key from:
# https://makersuite.google.com/app/apikey
```

**Verification**:
```bash
# Test the endpoint
curl -X POST https://your-api-domain.com/api/analyze/insights \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react"}'
```

#### 2. **400 Error: "Invalid GitHub repository URL"**

**Cause**: URL validation pattern is too restrictive.

**Solution**: ✅ **Fixed in latest deployment**
- Updated validation pattern to allow `.git` suffix and additional path components
- Pattern now matches: `https://github.com/owner/repo(.git)?(/.*)?`

#### 3. **500 Error: "Failed to generate insights"**

**Causes**:
- Invalid Gemini API key
- Gemini API quota exceeded
- Network connectivity issues

**Solutions**:
```bash
# 1. Verify API key format
# Should start with "AI" and be ~40 characters long
GEMINI_API_KEY=AIzaSyC...your_key_here

# 2. Check API quota
# Visit: https://makersuite.google.com/app/apikey
# Check usage and limits

# 3. Test API key locally
curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

#### 4. **CORS Error: "Access-Control-Allow-Origin"**

**Cause**: CORS configuration mismatch.

**Solution**:
```bash
# Update CORS_ORIGIN in deployment
CORS_ORIGIN=https://your-frontend-domain.com

# For development
CORS_ORIGIN=http://localhost:5173
```

### 🧪 Testing Steps

#### Step 1: Check Server Health
```bash
curl https://your-api-domain.com/health
# Expected: {"status":"ok","timestamp":"..."}
```

#### Step 2: Test Basic Analysis
```bash
curl -X POST https://your-api-domain.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react"}'
# Expected: Repository analysis data
```

#### Step 3: Test AI Insights
```bash
curl -X POST https://your-api-domain.com/api/analyze/insights \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react"}'
# Expected: AI insights data or 503 if not configured
```

### 🔧 Environment Variables Checklist

**Required for AI Insights**:
```bash
# Backend deployment
GITHUB_TOKEN=ghp_your_token_here
GEMINI_API_KEY=AIzaSyC...your_key_here
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# Frontend deployment
VITE_API_URL=https://your-backend-domain.com
```

### 📋 Deployment Platform Specific

#### Railway
```bash
# In Railway Dashboard → Variables tab
GITHUB_TOKEN=ghp_your_token_here
GEMINI_API_KEY=AIzaSyC...your_key_here
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

#### Render
```bash
# In Render Dashboard → Environment tab
GITHUB_TOKEN=ghp_your_token_here
GEMINI_API_KEY=AIzaSyC...your_key_here
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

#### Heroku
```bash
heroku config:set GITHUB_TOKEN=ghp_your_token_here
heroku config:set GEMINI_API_KEY=AIzaSyC...your_key_here
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://your-frontend-domain.com
```

### 🛠️ Quick Fix Script

Run the deployment setup script:
```bash
npm run setup:deployment
```

This will guide you through configuring all required environment variables.

### 📞 Getting Help

1. **Check deployment logs** for specific error messages
2. **Verify environment variables** are set correctly
3. **Test endpoints** using the curl commands above
4. **Check API quotas** for both GitHub and Gemini APIs

### 🔄 Redeployment

After fixing environment variables:
```bash
# Trigger a new deployment
git commit -m "Fix AI insights configuration"
git push origin main
```

### 📊 Monitoring

Monitor these endpoints for health:
- `GET /health` - Server status
- `POST /api/analyze` - Basic analysis
- `POST /api/analyze/insights` - AI insights (requires Gemini key)

### 🎯 Success Indicators

✅ **Working correctly when**:
- Health endpoint returns `{"status":"ok"}`
- Basic analysis returns repository data
- AI insights returns structured insights or clear 503 error
- No CORS errors in browser console
- Frontend can successfully call AI insights endpoint 