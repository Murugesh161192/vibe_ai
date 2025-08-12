# AI Insights Troubleshooting Guide

## 🚨 Issue: `/api/analyze/insights` endpoint not working

### Problem Description
The AI insights endpoint returns errors or doesn't work properly in deployment.

## ✅ Enhanced Fallback Behavior

**Good News**: Even without AI, the application now provides **repository-specific insights and recommendations** instead of generic fallbacks.

### What You Get Without AI:
- **Dynamic Metrics**: Repository-specific calculations for PR merge rates, response times, code quality
- **Smart Recommendations**: Tailored suggestions based on actual repository data (stars, contributors, issues)
- **No Static Content**: All recommendations are unique to each repository
- **Contextual Analysis**: Real issue counts, contributor numbers, and activity levels

### What You Get With AI:
- **Enhanced Analysis**: Deeper contextual insights using Google Gemini 1.5 Flash
- **Advanced Recommendations**: More nuanced suggestions based on AI analysis
- **Sophisticated Patterns**: AI-detected code patterns and collaboration insights

## 🔍 Common Issues and Solutions

#### 1. **503 Error: "AI service not available"**

**Cause**: `GEMINI_API_KEY` environment variable is not configured.

**Impact**: ✅ **No problem** - App automatically uses enhanced repository-specific analysis

**Solution** (Optional - to enable AI features):
```bash
# Add to your deployment platform (Railway/Render/Heroku)
GEMINI_API_KEY=your_gemini_api_key_here

# Get your API key from:
# https://makersuite.google.com/app/apikey
```

**Verification**:
```bash
# Test the endpoint - should work with or without AI
curl -X POST https://your-api-domain.com/api/analyze \
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

**Impact**: App automatically falls back to repository-specific analysis

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

## 🧪 Testing Steps

#### Step 1: Check Server Health
```bash
curl https://your-api-domain.com/health
# Expected: {"status":"ok","timestamp":"..."}
```

#### Step 2: Test Basic Analysis (Always Works)
```bash
curl -X POST https://your-api-domain.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react"}'
# Expected: Repository analysis with dynamic metrics and repository-specific recommendations
```

#### Step 3: Verify Smart Recommendations
```bash
# Check that recommendations are repository-specific
# Should show actual issue counts, star counts, contributor numbers
# No "1033 open issues" or other hardcoded values
```

#### Step 4: Test AI Insights (Optional)
```bash
curl -X POST https://your-api-domain.com/api/analyze/insights \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react"}'
# Expected: Enhanced AI insights or graceful fallback to repository-specific analysis
```

## 🔧 Environment Variables Checklist

**Required for Basic Operation** (Always Works):
```bash
# Backend deployment
GITHUB_TOKEN=ghp_your_token_here
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# Frontend deployment
VITE_API_URL=https://your-backend-domain.com
```

**Optional for AI Enhancement**:
```bash
# Backend deployment
GEMINI_API_KEY=AIzaSyC...your_key_here
```

## 📋 Deployment Platform Specific

#### Railway
```bash
# In Railway Dashboard → Variables tab
GITHUB_TOKEN=ghp_your_token_here
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# Optional for AI
GEMINI_API_KEY=AIzaSyC...your_key_here
```

#### Render
```bash
# In Render Dashboard → Environment tab
GITHUB_TOKEN=ghp_your_token_here
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# Optional for AI
GEMINI_API_KEY=AIzaSyC...your_key_here
```

#### Heroku
```bash
heroku config:set GITHUB_TOKEN=ghp_your_token_here
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://your-frontend-domain.com

# Optional for AI
heroku config:set GEMINI_API_KEY=AIzaSyC...your_key_here
```

## 🛠️ Quick Fix Script

Run the deployment setup script:
```bash
npm run setup:deployment
```

This will guide you through configuring all required environment variables.

## 📞 Getting Help

1. **Check deployment logs** for specific error messages
2. **Verify environment variables** are set correctly
3. **Test endpoints** using the curl commands above
4. **Check API quotas** for GitHub (and optionally Gemini) APIs

## 🔄 Redeployment

After fixing environment variables:
```bash
# Trigger a new deployment
git commit -m "Fix configuration"
git push origin main
```

## 📊 Monitoring

Monitor these endpoints for health:
- `GET /health` - Server status
- `POST /api/analyze` - Repository analysis (always works)
- `POST /api/analyze/insights` - AI insights (optional enhancement)

## 🎯 Success Indicators

✅ **Working correctly when**:
- Health endpoint returns `{"status":"ok"}`
- Repository analysis returns dynamic, repository-specific data
- Smart recommendations show actual repository values (not hardcoded numbers)
- No CORS errors in browser console
- Profile images display correctly in Active Contributors section

✅ **AI Enhancement working when**:
- AI insights returns structured insights without errors
- Recommendations show enhanced contextual analysis
- More sophisticated insights compared to fallback mode

## 💡 Key Improvements

**Repository-Specific Metrics**:
- PR merge rates calculated from actual repository data
- Issue response times based on contributor count and activity
- Code quality scores using real repository characteristics
- No more static "75%" or "7/week" values

**Dynamic Recommendations**:
- Issue management suggestions use actual open issue counts
- Testing recommendations based on repository popularity and team size
- Community engagement advice tailored to actual contributor patterns
- All descriptions include real repository data

**Enhanced User Experience**:
- Profile images load correctly with smart fallbacks
- Contributors show real GitHub avatars and roles
- All metrics reflect genuine repository characteristics 