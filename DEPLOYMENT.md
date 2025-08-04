# Vibe AI - Enterprise Deployment Guide

[![Deployment Status](https://img.shields.io/badge/Deployment-Production%20Ready-green)](https://vibe-ai.netlify.app)
[![Security](https://img.shields.io/badge/Security-Enterprise%20Grade-blue)](https://security.md)

This comprehensive deployment guide covers enterprise-grade deployment strategies for the Vibe AI repository intelligence platform across multiple environments and platforms.

## 🏢 Deployment Overview

### Architecture
```
┌─────────────────────────────────────────┐
│              Load Balancer              │
├─────────────────────────────────────────┤
│           Frontend (Netlify)            │ ← React SPA
├─────────────────────────────────────────┤
│      Backend API (Railway/Render)       │ ← Fastify Server
├─────────────────────────────────────────┤
│        GitHub API Integration           │ ← External API
└─────────────────────────────────────────┘
```

### Deployment Environments
- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Enterprise-grade production deployment

## 🚀 Quick Deployment Guide

### Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] GitHub Personal Access Token generated
- [ ] Git repository access configured
- [ ] Platform accounts created (Netlify, Railway/Render)
- [ ] Domain names configured (optional)

### One-Command Deployment
```bash
# Clone and deploy
git clone https://github.com/your-username/vibe-ai.git
cd vibe_ai
npm run setup
npm run build
npm run deploy
```

## 🌐 Frontend Deployment (Netlify)

### Method 1: Git Integration (Recommended for Production)

#### Step 1: Connect Repository
1. **Sign in to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Connect your GitHub account
   - Authorize Netlify access

2. **Create New Site**
   ```bash
   # In Netlify Dashboard:
   New site from Git → GitHub → Select vibe-ai repository
   ```

3. **Configure Build Settings**
   ```yaml
   # Build settings in Netlify UI
   Build command: cd frontend && npm install && npm run build
   Publish directory: frontend/dist
   Base directory: /
   Node version: 18
   ```

#### Step 2: Environment Configuration
```bash
# In Netlify Dashboard: Site settings → Environment variables
VITE_API_URL=https://your-backend-api.railway.app
VITE_APP_NAME=Vibe AI
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
NODE_VERSION=18
```

#### Step 3: Custom Domain (Optional)
```bash
# In Netlify Dashboard: Domain settings
1. Add custom domain: yourdomain.com
2. Configure DNS records:
   - A record: @ → Netlify IP
   - CNAME: www → your-site.netlify.app
3. Enable HTTPS (automatic with Let's Encrypt)
```

### Method 2: Netlify CLI Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Authenticate
netlify login

# Build and deploy
cd frontend
npm run build
netlify deploy --prod --dir=dist

# Configure environment variables
netlify env:set VITE_API_URL "https://your-backend-api.com"
```

### Method 3: Manual Deployment
```bash
# Build the frontend
cd frontend
npm ci
npm run build

# Upload dist folder to Netlify dashboard
# Drag and drop frontend/dist to Netlify deploy area
```

### Netlify Configuration File
Ensure your `netlify.toml` includes:
```toml
[build]
  command = "cd frontend && npm ci && npm run build"
  publish = "frontend/dist"

[build.environment]
  NODE_VERSION = "18"

# SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.github.com;"

# Cache optimization
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## 🔧 Backend Deployment Options

### Option 1: Railway (Recommended for Production)

#### Advantages
- **Automatic deployments** from GitHub
- **Built-in PostgreSQL** (if needed for future features)
- **Automatic HTTPS** with custom domains
- **Environment variable management**
- **Usage-based pricing** with generous free tier

#### Deployment Steps
1. **Connect to Railway**
   ```bash
   # Go to railway.app
   1. Sign up with GitHub
   2. New Project → Deploy from GitHub repo
   3. Select vibe-ai repository
   4. Choose backend service
   ```

2. **Configure Service**
   ```yaml
   # Railway automatically detects Node.js
   Build Command: npm ci
   Start Command: npm start
   Root Directory: backend
   ```

3. **Environment Variables**
   ```bash
   # In Railway Dashboard: Variables tab
   GITHUB_TOKEN=ghp_your_token_here
   NODE_ENV=production
   PORT=3000
   CORS_ORIGIN=https://your-frontend-domain.com
   RATE_LIMIT_MAX=1000
   RATE_LIMIT_TIME_WINDOW=900000
   ```

4. **Custom Domain (Optional)**
   ```bash
   # In Railway Dashboard: Settings → Domains
   1. Add custom domain: api.yourdomain.com
   2. Configure DNS CNAME: api → your-project.railway.app
   ```

### Option 2: Render

#### Deployment Steps
1. **Create Web Service**
   ```bash
   # In Render Dashboard
   New → Web Service → Connect Repository
   ```

2. **Configuration**
   ```yaml
   Name: vibe-ai-backend
   Environment: Node
   Region: Choose closest to users
   Branch: main
   Root Directory: backend
   Build Command: npm ci
   Start Command: npm start
   Instance Type: Free (or paid for production)
   ```

3. **Environment Variables**
   ```bash
   GITHUB_TOKEN=ghp_your_token_here
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

### Option 3: Heroku

#### Preparation
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login
```

#### Deployment
```bash
# Create application
heroku create vibe-ai-backend

# Set environment variables
heroku config:set GITHUB_TOKEN=ghp_your_token_here
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://your-frontend-domain.com

# Deploy
git subtree push --prefix backend heroku main

# Or use GitHub integration in Heroku Dashboard
```

### Option 4: DigitalOcean App Platform

#### Configuration
```yaml
# .do/app.yaml (create in repository root)
name: vibe-ai
services:
- name: backend
  source_dir: backend
  github:
    repo: your-username/vibe-ai
    branch: main
  run_command: npm start
  build_command: npm ci
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: GITHUB_TOKEN
    value: ghp_your_token_here
    type: SECRET
  - key: NODE_ENV
    value: production
  - key: CORS_ORIGIN
    value: https://your-frontend-domain.com
```

## 🔐 Environment Variables & Security

### Required Environment Variables

#### Backend (.env.production)
```bash
# Required for all deployments
GITHUB_TOKEN=ghp_your_github_personal_access_token

# Security configuration
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# Performance tuning
RATE_LIMIT_MAX=1000
RATE_LIMIT_TIME_WINDOW=900000

# Optional monitoring
LOG_LEVEL=info
API_PREFIX=/api

# Platform-specific (auto-configured by platform)
PORT=${PORT:-3000}
HOST=0.0.0.0
```

#### Frontend (.env.production)
```bash
# Required
VITE_API_URL=https://your-backend-api-domain.com

# Optional branding
VITE_APP_NAME=Vibe AI
VITE_APP_VERSION=1.0.0

# Feature flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=false

# Optional monitoring
VITE_SENTRY_DSN=your_sentry_dsn_here
```

### Security Best Practices

#### GitHub Token Security
```bash
# Token permissions (minimum required)
Scopes needed:
- public_repo (for public repository access)
- read:user (for user information)

# Token storage
- Store in platform environment variables
- Never commit to version control
- Rotate tokens every 90 days
- Use different tokens for different environments
```

#### CORS Configuration
```javascript
// Backend CORS settings
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

#### Rate Limiting
```javascript
// Production rate limiting
const rateLimitOptions = {
  max: process.env.RATE_LIMIT_MAX || 1000,
  timeWindow: process.env.RATE_LIMIT_TIME_WINDOW || 900000, // 15 minutes
  skipSuccessfulRequests: false
};
```

## 🏗️ CI/CD Pipeline Setup

### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Vibe AI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci

      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test

      - name: Run linting
        run: |
          cd backend && npm run lint
          cd ../frontend && npm run lint

  build-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install and build frontend
        run: |
          cd frontend
          npm ci
          npm run build

      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=frontend/dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Railway
        uses: railway-app/railway-github-action@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend
```

### Environment-Specific Deployments

#### Development Environment
```bash
# Local development setup
npm run setup
npm run dev

# Environment: http://localhost:3000 (backend), http://localhost:5173 (frontend)
```

#### Staging Environment
```bash
# Staging branch deployment
git checkout staging
git push origin staging

# Automatically deploys to:
# Frontend: https://staging--vibe-ai.netlify.app
# Backend: https://vibe-ai-staging.railway.app
```

#### Production Environment
```bash
# Production deployment
git checkout main
git push origin main

# Automatically deploys to:
# Frontend: https://vibe-ai.netlify.app
# Backend: https://vibe-ai.railway.app
```

## 📊 Monitoring & Analytics

### Health Monitoring Setup

#### Backend Health Checks
```javascript
// Health check endpoint configuration
app.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };
});
```

#### Monitoring Services
```bash
# Uptime monitoring
UptimeRobot: Monitor https://your-api.com/health
Pingdom: Monitor frontend and backend
StatusPage: Public status page for users

# Error tracking
Sentry: Frontend and backend error tracking
LogRocket: Session replay for debugging
DataDog: Infrastructure monitoring
```

### Performance Monitoring
```bash
# Frontend performance
Web Vitals: Core Web Vitals monitoring
Lighthouse CI: Automated performance testing
Google Analytics: User behavior tracking

# Backend performance
New Relic: Application performance monitoring
Railway Metrics: Built-in monitoring
Response time alerts: < 2 seconds target
```

## 🚨 Troubleshooting Deployment Issues

### Common Deployment Problems

#### Build Failures
```bash
# Problem: npm install fails
Solution:
1. Clear npm cache: npm cache clean --force
2. Delete package-lock.json and node_modules
3. Run npm install again
4. Check Node.js version compatibility

# Problem: Frontend build fails
Solution:
1. Check environment variables are set
2. Verify API URL is accessible
3. Check for TypeScript errors
4. Verify all dependencies are compatible
```

#### Environment Variable Issues
```bash
# Problem: API calls fail in production
Solution:
1. Verify VITE_API_URL is set correctly
2. Check CORS_ORIGIN matches frontend domain
3. Ensure GitHub token is valid and has permissions
4. Test API endpoint directly with curl

# Problem: Rate limiting too aggressive
Solution:
1. Adjust RATE_LIMIT_MAX and RATE_LIMIT_TIME_WINDOW
2. Implement user-specific rate limiting
3. Add retry logic with exponential backoff
```

#### CORS and Security Issues
```bash
# Problem: CORS errors in production
Solution:
1. Set CORS_ORIGIN to exact frontend domain
2. Ensure protocol (https/http) matches
3. Check for trailing slashes in URLs
4. Verify Content-Security-Policy headers

# Problem: GitHub API rate limiting
Solution:
1. Verify GitHub token is configured
2. Check token permissions and expiration
3. Implement intelligent caching
4. Add user feedback for rate limit status
```

### Platform-Specific Issues

#### Netlify Troubleshooting
```bash
# Build logs location
Netlify Dashboard → Site → Deploys → [Build] → Deploy log

# Common issues:
- Node version mismatch: Set NODE_VERSION in environment
- Build command fails: Check working directory and command syntax
- Environment variables: Ensure all VITE_ prefixed variables are set
```

#### Railway Troubleshooting
```bash
# Application logs
Railway Dashboard → Project → Service → Logs

# Common issues:
- Service crashes: Check memory limits and error logs
- Environment variables: Verify in Variables tab
- Build failures: Check package.json scripts
```

## 🔧 Performance Optimization

### Frontend Optimization
```bash
# Build optimization
npm run build -- --analyze    # Analyze bundle size
npm run lighthouse            # Performance audit

# Optimization techniques:
- Code splitting: Lazy load components
- Asset optimization: Compress images and fonts
- CDN usage: Serve static assets from CDN
- Service worker: Cache strategies for offline support
```

### Backend Optimization
```bash
# Performance monitoring
npm run benchmark             # API performance tests
npm run profile              # Memory and CPU profiling

# Optimization techniques:
- Response caching: Cache GitHub API responses
- Connection pooling: Optimize HTTP connections
- Database optimization: Add indexes for future features
- Load balancing: Multiple instance deployment
```

### CDN and Caching Strategy
```bash
# Static asset caching
Frontend assets: 1 year cache (immutable files)
API responses: 15 minutes cache (GitHub data)
Health checks: No cache

# CDN configuration
Cloudflare: Automatic optimization
AWS CloudFront: Global distribution
Netlify CDN: Built-in optimization
```

## 📈 Scaling Considerations

### Horizontal Scaling
```bash
# Backend scaling
Railway: Auto-scaling based on CPU/memory
Render: Manual scaling with load balancer
Heroku: Dyno scaling based on traffic

# Database scaling (future)
PostgreSQL: Read replicas for analytics
Redis: Caching layer for frequently accessed data
```

### Cost Optimization
```bash
# Free tier limits
Netlify: 100GB bandwidth, 300 build minutes
Railway: $5 free credit monthly
Render: 750 hours free monthly
Heroku: 1000 dyno hours free monthly

# Production cost estimates
Small scale: $20-50/month
Medium scale: $100-300/month
Enterprise: $500+/month
```

## 🔒 Security Hardening

### Production Security Checklist
- [ ] GitHub tokens rotated regularly
- [ ] HTTPS enforced on all endpoints
- [ ] Security headers implemented
- [ ] Input validation on all user inputs
- [ ] Rate limiting configured
- [ ] Error messages don't expose sensitive data
- [ ] Dependencies regularly updated
- [ ] Security monitoring enabled

### Compliance Considerations
```bash
# Data protection
GDPR: User data handling compliance
CCPA: California privacy compliance
SOC 2: Security controls documentation

# Security frameworks
OWASP: Top 10 security risks mitigation
NIST: Cybersecurity framework implementation
```

---

## 📚 Additional Resources

### Documentation Links
- [Netlify Documentation](https://docs.netlify.com/)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [GitHub API Documentation](https://docs.github.com/en/rest)

### Support Channels
- **Technical Issues**: Create GitHub issue with deployment logs
- **Platform Support**: Contact platform support directly
- **Security Issues**: Email security@yourdomain.com
- **General Questions**: Check documentation and community forums

---

**🎉 Successfully deploying Vibe AI ensures enterprise-grade repository intelligence is available to your organization with maximum reliability and performance.** 