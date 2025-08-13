# Vibe GitHub Assistant - Enterprise Troubleshooting Guide

This comprehensive troubleshooting guide addresses common issues encountered when setting up, developing, and deploying the Vibe GitHub Assistant repository intelligence platform in enterprise environments.

## 🚨 Quick Issue Resolution

### Emergency Checklist
If Vibe GitHub Assistant is not working, check these items first:

1. **Services Running**
   ```bash
   # Check if services are running
   curl http://localhost:3000/health    # Backend health
   curl http://localhost:5173           # Frontend accessibility
   ```

2. **GitHub Token Valid**
   ```bash
   # Verify GitHub token
   curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit
   ```

3. **Environment Variables Set**
   ```bash
   # Check critical environment variables
   echo $GITHUB_TOKEN                   # Should not be empty
   cat backend/.env | grep GITHUB_TOKEN # Should exist
   cat frontend/.env | grep VITE_API_URL # Should point to backend
   ```

4. **Dependencies Installed**
   ```bash
   # Verify installations
   ls backend/node_modules frontend/node_modules
   npm --version                        # Should be 8+
   node --version                       # Should be 18+
   ```

## 🔧 Setup and Installation Issues

### Issue: `npm install` Fails

#### Symptoms
```bash
npm ERR! peer dep missing
npm ERR! The operation was rejected by your operating system
npm ERR! EACCES: permission denied
```

#### Solutions

**Solution 1: Clear npm cache**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Solution 2: Fix npm permissions (Unix/Linux/macOS)**
```bash
# Option A: Use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Option B: Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

**Solution 3: Use correct Node.js version**
```bash
# Check current version
node --version

# Install correct version
nvm install 18.19.0
nvm use 18.19.0

# Or download from nodejs.org for Windows
```

#### Prevention
- Always use Node.js 18+ 
- Use nvm for version management
- Avoid using `sudo` with npm

### Issue: Environment Files Not Found

#### Symptoms
```bash
Error: Cannot find module 'dotenv'
GITHUB_TOKEN is not defined
Frontend cannot connect to backend
```

#### Solutions

**Solution 1: Create environment files**
```bash
# Create backend environment file
cp backend/env.example backend/.env

# Create frontend environment file  
cp frontend/env.example frontend/.env

# Or use setup script
npm run setup:env
```

**Solution 2: Configure environment variables**
```bash
# Backend (.env)
echo "GITHUB_TOKEN=your_github_token_here" >> backend/.env
echo "NODE_ENV=development" >> backend/.env
echo "PORT=3000" >> backend/.env
echo "CORS_ORIGIN=http://localhost:5173" >> backend/.env

# Frontend (.env)
echo "VITE_API_URL=http://localhost:3000" >> frontend/.env
echo "VITE_APP_NAME=Vibe GitHub Assistant" >> frontend/.env
```

### Issue: GitHub Token Problems

#### Symptoms
```bash
GitHub API rate limit exceeded (60 requests per hour)
Unauthorized access to GitHub API
Invalid token format
```

#### Solutions

**Solution 1: Generate new GitHub token**
```bash
# Go to: https://github.com/settings/tokens
# 1. Click "Generate new token (classic)"
# 2. Name: "Vibe GitHub Assistant Development"
# 3. Scopes: Select "public_repo" and "read:user"
# 4. Copy the generated token
# 5. Add to backend/.env:
echo "GITHUB_TOKEN=ghp_your_new_token_here" >> backend/.env
```

**Solution 2: Verify token permissions**
```bash
# Test token validity
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/rate_limit

# Expected response:
# {
#   "rate": {
#     "limit": 5000,
#     "remaining": 4999,
#     "reset": 1640995200
#   }
# }
```

**Solution 3: Token security best practices**
```bash
# Different tokens for different environments
GITHUB_TOKEN_DEV=ghp_dev_token_here      # Development
GITHUB_TOKEN_STAGING=ghp_staging_token   # Staging  
GITHUB_TOKEN_PROD=ghp_prod_token         # Production

# Regular rotation (every 90 days)
# Monitor token usage in GitHub settings
```

## 🌐 API and Network Issues

### Issue: Backend API Not Responding

#### Symptoms
```bash
curl: (7) Failed to connect to localhost port 3000
ECONNREFUSED
Backend server not accessible
```

#### Solutions

**Solution 1: Check if backend is running**
```bash
# Check if process is running
ps aux | grep "node.*server.js"

# Check if port is in use
netstat -tulpn | grep :3000
# Or on macOS: lsof -i :3000

# Start backend if not running
cd backend && npm run dev
```

**Solution 2: Port conflicts**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill conflicting process
kill -9 $(lsof -ti:3000)

# Or use different port
export PORT=3001
cd backend && npm run dev
```

**Solution 3: Firewall and network issues**
```bash
# Test local connectivity
telnet localhost 3000

# Check firewall (Linux)
sudo ufw status
sudo ufw allow 3000

# Check firewall (Windows)
netsh advfirewall firewall add rule name="Vibe GitHub Assistant Backend" dir=in action=allow protocol=TCP localport=3000
```

### Issue: CORS Errors

#### Symptoms
```bash
Access to fetch at 'http://localhost:3000' from origin 'http://localhost:5173' has been blocked by CORS policy
No 'Access-Control-Allow-Origin' header is present
```

#### Solutions

**Solution 1: Verify CORS configuration**
```bash
# Check backend CORS settings in server.js
grep -n "cors" backend/src/server.js

# Verify environment variable
grep CORS_ORIGIN backend/.env

# Should be: CORS_ORIGIN=http://localhost:5173
```

**Solution 2: Update CORS configuration**
```javascript
// In backend/src/server.js
await fastify.register(require('@fastify/cors'), {
  origin: [
    'http://localhost:5173',  // Development frontend
    'http://localhost:3000',  // Development backend
    'https://your-domain.com' // Production frontend
  ],
  credentials: true
});
```

**Solution 3: Browser-specific fixes**
```bash
# Chrome: Start with disabled security (development only)
google-chrome --disable-web-security --user-data-dir="/tmp/chrome_dev"

# Firefox: Install CORS Everywhere extension (development only)
# Safari: Enable Develop menu → Disable Cross-Origin Restrictions
```

### Issue: GitHub API Rate Limiting

#### Symptoms
```bash
GitHub API rate limit exceeded
Analysis fails with 403 Forbidden
Too many requests error
```

#### Solutions

**Solution 1: Check rate limit status**
```bash
# Check current rate limit
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/rate_limit

# Response shows:
# - limit: 5000 (with token) or 60 (without token)
# - remaining: current remaining requests
# - reset: when limit resets (Unix timestamp)
```

**Solution 2: Implement intelligent retry**
```bash
# Wait for rate limit reset
RESET_TIME=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/rate_limit | jq '.rate.reset')

CURRENT_TIME=$(date +%s)
WAIT_TIME=$((RESET_TIME - CURRENT_TIME))

echo "Rate limit resets in $WAIT_TIME seconds"
```

**Solution 3: Optimize API usage**
```javascript
// Implement caching in backend
const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}
```

## 🖥️ Frontend Issues

### Issue: Frontend Build Failures

#### Symptoms
```bash
Module not found: Error: Can't resolve './components/NonExistentComponent'
TypeScript compilation errors
Vite build process fails
```

#### Solutions

**Solution 1: Clear build cache**
```bash
cd frontend
rm -rf dist node_modules .vite
npm install
npm run build
```

**Solution 2: Fix TypeScript errors**
```bash
# Check TypeScript configuration
cat frontend/tsconfig.json

# Run TypeScript checker
cd frontend
npx tsc --noEmit

# Fix common TypeScript issues
# - Add missing type definitions
# - Fix import paths
# - Update deprecated APIs
```

**Solution 3: Dependency conflicts**
```bash
# Check for dependency conflicts
cd frontend
npm ls

# Update dependencies
npm update

# Fix peer dependency warnings
npm install --save-peer missing-peer-dep
```

### Issue: Frontend Not Loading

#### Symptoms
```bash
White screen in browser
Console errors about missing modules
Vite dev server not starting
```

#### Solutions

**Solution 1: Check Vite configuration**
```bash
# Verify Vite config
cat frontend/vite.config.js

# Common issues:
# - Incorrect base path
# - Missing plugins
# - Port conflicts
```

**Solution 2: Environment variable issues**
```bash
# Check frontend environment variables
cat frontend/.env

# Must have VITE_ prefix:
VITE_API_URL=http://localhost:3000

# Restart dev server after env changes
cd frontend && npm run dev
```

**Solution 3: Browser caching issues**
```bash
# Clear browser cache
# Chrome: Ctrl+Shift+R (hard refresh)
# Firefox: Ctrl+F5
# Safari: Cmd+Shift+R

# Or open in incognito/private mode
```

## 🚀 Deployment Issues

### Issue: Netlify Deployment Failures

#### Symptoms
```bash
Build failed with exit code 1
Deploy timeout
Environment variables not working in production
```

#### Solutions

**Solution 1: Fix build configuration**
```bash
# Check netlify.toml
cat netlify.toml

# Correct configuration:
[build]
  command = "cd frontend && npm ci && npm run build"
  publish = "frontend/dist"

[build.environment]
  NODE_VERSION = "18"
```

**Solution 2: Environment variables in Netlify**
```bash
# In Netlify Dashboard:
# Site settings → Environment variables

# Add these variables:
VITE_API_URL=https://your-backend-api.railway.app
NODE_VERSION=18
NPM_VERSION=8
```

**Solution 3: Build optimization**
```bash
# Optimize build for production
cd frontend
npm run build -- --mode production

# Check build output
ls -la dist/

# Test built files locally
npx serve dist
```

### Issue: Backend Deployment Failures

#### Symptoms
```bash
Application crashes on startup
Health check fails in production
Environment variables not loading
```

#### Solutions

**Solution 1: Check production environment**
```bash
# Verify all required environment variables
export NODE_ENV=production
export GITHUB_TOKEN=your_production_token
export PORT=3000
export CORS_ORIGIN=https://your-frontend-domain.com

# Test locally with production settings
cd backend && npm start
```

**Solution 2: Platform-specific issues**

**Railway Issues:**
```bash
# Check Railway logs
railway logs

# Common fixes:
# - Ensure package.json has correct start script
# - Set correct environment variables in Railway dashboard
# - Check memory limits and upgrade plan if needed
```

**Render Issues:**
```bash
# Check Render logs in dashboard
# Common fixes:
# - Verify build command: npm ci
# - Verify start command: npm start
# - Check environment variables in Render dashboard
```

**Heroku Issues:**
```bash
# Check Heroku logs
heroku logs --tail

# Common fixes:
heroku config:set NODE_ENV=production
heroku config:set GITHUB_TOKEN=your_token
heroku ps:scale web=1
```

### Issue: Custom Domain Problems

#### Symptoms
```bash
SSL certificate errors
DNS resolution failures
Domain not pointing to correct service
```

#### Solutions

**Solution 1: DNS configuration**
```bash
# Check DNS records
nslookup your-domain.com
dig your-domain.com

# Correct DNS settings:
# A record: @ → Netlify IP (for frontend)
# CNAME: api → your-backend.railway.app (for backend)
```

**Solution 2: SSL certificate issues**
```bash
# Check SSL status
curl -I https://your-domain.com

# For Netlify:
# - SSL is automatic with Let's Encrypt
# - Check Domain settings in dashboard

# For custom backend domains:
# - Most platforms provide automatic SSL
# - Check platform-specific documentation
```

## 📊 Performance Issues

### Issue: Slow Repository Analysis

#### Symptoms
```bash
Analysis takes longer than 60 seconds
Requests timeout
High memory usage during analysis
```

#### Solutions

**Solution 1: Optimize analysis parameters**
```javascript
// In backend/src/services/analyzer.js
const ANALYSIS_LIMITS = {
  maxFiles: 1000,        // Limit files analyzed
  maxContributors: 30,   // Limit contributors fetched
  maxCommits: 100,       // Limit commits analyzed
  timeout: 30000         // 30 second timeout
};
```

**Solution 2: Implement caching**
```javascript
// Cache GitHub API responses
const cache = new Map();

async function getCachedOrFetch(url, options) {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const response = await fetch(url, options);
  cache.set(cacheKey, response);
  
  return response;
}
```

**Solution 3: Monitor resource usage**
```bash
# Monitor memory usage
ps aux | grep "node.*server.js"

# Monitor during analysis
top -p $(pgrep -f "node.*server.js")

# Set memory limits if needed
node --max-old-space-size=2048 src/server.js
```

### Issue: High Memory Usage

#### Symptoms
```bash
Node.js heap out of memory
Application crashes during analysis
Slow performance over time
```

#### Solutions

**Solution 1: Memory optimization**
```javascript
// Implement proper cleanup
function cleanupAfterAnalysis(analysisData) {
  // Clear large objects
  analysisData = null;
  
  // Force garbage collection (development only)
  if (global.gc) {
    global.gc();
  }
}

// Run with garbage collection exposed (development)
node --expose-gc src/server.js
```

**Solution 2: Increase memory limits**
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 src/server.js

# For production deployment
export NODE_OPTIONS="--max-old-space-size=4096"
```

**Solution 3: Stream processing for large repos**
```javascript
// Process files in chunks instead of all at once
async function processFilesInChunks(files, chunkSize = 50) {
  const results = [];
  
  for (let i = 0; i < files.length; i += chunkSize) {
    const chunk = files.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map(file => processFile(file))
    );
    results.push(...chunkResults);
    
    // Allow garbage collection between chunks
    await new Promise(resolve => setImmediate(resolve));
  }
  
  return results;
}
```

## 🔒 Security Issues

### Issue: Token Exposure

#### Symptoms
```bash
GitHub token visible in browser developer tools
Token committed to version control
Unauthorized API usage
```

#### Solutions

**Solution 1: Audit token exposure**
```bash
# Check if token is in frontend code
grep -r "ghp_" frontend/src/
grep -r "github.com" frontend/dist/

# Check git history for exposed tokens
git log --all --full-history -- "*.env"
git log -p | grep -i "token"
```

**Solution 2: Remove exposed tokens**
```bash
# If token was committed to git:
# 1. Immediately revoke the token on GitHub
# 2. Generate a new token
# 3. Remove from git history:
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch backend/.env' \
  --prune-empty --tag-name-filter cat -- --all

# 4. Force push to remote (WARNING: Destructive)
git push origin --force --all
```

**Solution 3: Implement token rotation**
```bash
# Set up regular token rotation
# 1. Generate new token
# 2. Update in all environments
# 3. Revoke old token
# 4. Document rotation date

# Automated rotation script
#!/bin/bash
echo "Token rotation reminder for $(date)"
echo "Last rotation: $(cat .token-rotation-log)"
echo "Next rotation due: $(date -d '+90 days')"
```

### Issue: Unauthorized Access Attempts

#### Symptoms
```bash
Multiple failed authentication attempts
Unusual API usage patterns
Security warnings from hosting platforms
```

#### Solutions

**Solution 1: Implement rate limiting**
```javascript
// In backend/src/server.js
await fastify.register(require('@fastify/rate-limit'), {
  max: 100,                    // requests per window
  timeWindow: '15 minutes',    // window duration
  ban: 3,                      // ban after 3 violations
  banTimeWindow: '1 hour'      // ban duration
});
```

**Solution 2: Monitor access logs**
```bash
# Monitor application logs
tail -f /var/log/application.log

# Look for suspicious patterns:
# - Multiple rapid requests from same IP
# - Requests from unusual geographic locations
# - Failed authentication attempts
```

**Solution 3: Implement IP allowlisting**
```javascript
// For enterprise environments
const allowedIPs = process.env.ALLOWED_IPS?.split(',') || [];

fastify.addHook('onRequest', async (request, reply) => {
  const clientIP = request.headers['x-forwarded-for'] || request.ip;
  
  if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
    reply.code(403).send({ error: 'IP not allowed' });
  }
});
```

## 🧪 Testing and Development Issues

### Issue: Tests Failing

#### Symptoms
```bash
Jest tests timeout
Mock data not working
API integration tests fail
```

#### Solutions

**Solution 1: Test environment setup**
```bash
# Check test configuration
cat backend/jest.config.js
cat frontend/vite.config.js

# Common test environment variables
export NODE_ENV=test
export GITHUB_TOKEN=test_token_for_mocking

# Run tests with verbose output
npm run test -- --verbose
```

**Solution 2: Mock GitHub API**
```javascript
// In test files
jest.mock('../src/services/github.js', () => ({
  GitHubService: jest.fn().mockImplementation(() => ({
    getRepository: jest.fn().mockResolvedValue(mockRepoData),
    getContributors: jest.fn().mockResolvedValue(mockContributors),
    getCommits: jest.fn().mockResolvedValue(mockCommits)
  }))
}));
```

**Solution 3: Test data management**
```bash
# Create test fixtures
mkdir backend/test/fixtures
echo '{"name": "test-repo", "stars": 100}' > backend/test/fixtures/repo.json

# Use in tests
const testRepo = require('./fixtures/repo.json');
```

### Issue: Development Environment Inconsistencies

#### Symptoms
```bash
Works on one machine but not another
Different behavior between developers
Version conflicts
```

#### Solutions

**Solution 1: Containerization with Docker**
```dockerfile
# Create Dockerfile for consistent environment
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

**Solution 2: Environment standardization**
```bash
# Create .nvmrc for Node.js version
echo "18.19.0" > .nvmrc

# Use nvm to standardize
nvm use

# Document exact versions
npm list --depth=0 > package-versions.txt
```

**Solution 3: Development scripts**
```bash
#!/bin/bash
# dev-setup.sh - Standardized development setup

echo "Setting up Vibe GitHub Assistant development environment..."

# Check Node.js version
node_version=$(node --version)
required_version="v18"

if [[ $node_version != $required_version* ]]; then
  echo "Error: Node.js $required_version required, found $node_version"
  exit 1
fi

# Install dependencies
npm run install:all

# Setup environment files
npm run setup:env

# Verify setup
npm run test

echo "Setup complete! Run 'npm run dev' to start development."
```

## 📱 Browser and Platform Issues

### Issue: Browser Compatibility

#### Symptoms
```bash
Features not working in Safari
IE/Edge compatibility issues
Mobile browser problems
```

#### Solutions

**Solution 1: Check browser support**
```javascript
// Add browser detection
function checkBrowserSupport() {
  const requiredFeatures = [
    'fetch',
    'Promise',
    'URLSearchParams',
    'Object.assign'
  ];
  
  const unsupported = requiredFeatures.filter(feature => 
    typeof window[feature] === 'undefined'
  );
  
  if (unsupported.length > 0) {
    console.warn('Unsupported features:', unsupported);
    // Show compatibility warning
  }
}
```

**Solution 2: Add polyfills**
```bash
# Install polyfills
cd frontend
npm install core-js whatwg-fetch

# Add to main.jsx
import 'core-js/stable';
import 'whatwg-fetch';
```

**Solution 3: Test across browsers**
```bash
# Automated cross-browser testing
npx playwright test --browser=chromium
npx playwright test --browser=firefox
npx playwright test --browser=webkit

# Manual testing checklist:
# - Chrome (latest)
# - Firefox (latest)
# - Safari (latest)
# - Edge (latest)
# - Mobile browsers
```

## 📞 Support and Escalation

### When to Seek Help

#### Immediate Escalation Required
- Security vulnerabilities discovered
- Data corruption or loss
- Complete system outages
- Performance degradation affecting users

#### Standard Support Channels
- **Documentation**: Check README, TESTING_STANDARDS, and this guide
- **GitHub Issues**: For bugs and feature requests
- **Community Forums**: For general questions
- **Enterprise Support**: For production issues

### Information to Provide When Seeking Help

#### System Information
```bash
# Collect system information
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "OS: $(uname -a)"
echo "Memory: $(free -h 2>/dev/null || echo 'N/A')"

# Application information
echo "Frontend build: $(cat frontend/package.json | jq -r '.version')"
echo "Backend version: $(cat backend/package.json | jq -r '.version')"

# Environment status
curl -s http://localhost:3000/health | jq '.'
```

#### Error Logs
```bash
# Collect relevant logs
cat backend/logs/error.log | tail -50
journalctl -u vibe-ai --since "1 hour ago"

# Network information
netstat -tulpn | grep -E "(3000|5173)"
```

#### Steps to Reproduce
1. Exact steps taken before the issue occurred
2. Expected behavior vs actual behavior
3. Screenshots or screen recordings if applicable
4. Repository URLs that trigger the issue

---

## 📚 Additional Resources

### Documentation
- [README.md](README.md) - Main project documentation
- [TESTING_STANDARDS.md](TESTING_STANDARDS.md) - Comprehensive testing guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment procedures
- [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) - API testing procedures

### External Resources
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Node.js Troubleshooting Guide](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [React Debugging Guide](https://reactjs.org/docs/debugging.html)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)

### Community Support
- GitHub Issues: Report bugs and request features
- Stack Overflow: Tag questions with `vibe-ai`
- Discord/Slack: Real-time community support

---

**This troubleshooting guide covers the most common issues encountered with Vibe GitHub Assistant. For enterprise support or complex issues, please contact your system administrator or create a detailed issue report.** 