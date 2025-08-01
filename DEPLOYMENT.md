# Deployment Guide - Vibe AI

This guide covers deploying the Vibe AI application to various platforms.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- GitHub Personal Access Token
- Git repository access

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd vibe_ai
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Backend
   cp backend/env.example backend/.env
   # Edit backend/.env with your GitHub token
   
   # Frontend
   cp frontend/env.example frontend/.env
   # Edit frontend/.env with your API URL
   ```

## 🌐 Frontend Deployment (Netlify)

### Option 1: Netlify UI (Recommended)

1. **Connect to GitHub**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub account
   - Select your repository

2. **Configure build settings**
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`
   - Node version: `18`

3. **Set environment variables**
   - Go to Site settings > Environment variables
   - Add `VITE_API_URL` with your backend URL

4. **Deploy**
   - Click "Deploy site"
   - Your site will be available at `https://your-site.netlify.app`

### Option 2: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

### Option 3: Manual Upload

1. **Build the project**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload to Netlify**
   - Go to Netlify dashboard
   - Drag and drop the `frontend/dist` folder
   - Configure environment variables

## 🔧 Backend Deployment

### Option 1: Railway (Recommended)

1. **Connect to Railway**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub account
   - Select your repository

2. **Configure service**
   - Railway will auto-detect the backend
   - Set environment variables:
     - `GITHUB_TOKEN`: Your GitHub token
     - `NODE_ENV`: `production`
     - `PORT`: `3000`

3. **Deploy**
   - Railway will automatically deploy on push
   - Get your backend URL from Railway dashboard

### Option 2: Render

1. **Create Web Service**
   - Go to [Render](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository

2. **Configure settings**
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment: `Node`

3. **Set environment variables**
   - `GITHUB_TOKEN`: Your GitHub token
   - `NODE_ENV`: `production`

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku app**
   ```bash
   heroku create your-vibe-ai-backend
   ```

3. **Set environment variables**
   ```bash
   heroku config:set GITHUB_TOKEN=your_token
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 4: DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean App Platform
   - Create new app from GitHub

2. **Configure**
   - Source: Your GitHub repository
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Run Command: `npm start`

3. **Set environment variables**
   - Add `GITHUB_TOKEN` and `NODE_ENV`

## 🔐 Environment Variables

### Backend (.env)
```env
# Required
GITHUB_TOKEN=your_github_personal_access_token

# Optional
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_MAX=100
RATE_LIMIT_TIME_WINDOW=900000
```

### Frontend (.env)
```env
# Required
VITE_API_URL=https://your-backend-url.com

# Optional
VITE_APP_NAME=Vibe AI
VITE_APP_VERSION=1.0.0
```

## 🔑 GitHub Token Setup

1. **Generate Personal Access Token**
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo`, `read:user`
   - Copy the token

2. **Add to environment variables**
   - Backend: `GITHUB_TOKEN=your_token`
   - Never commit tokens to version control

## 🌍 Domain Configuration

### Custom Domain (Optional)

1. **Netlify**
   - Go to Site settings > Domain management
   - Add custom domain
   - Configure DNS records

2. **SSL Certificate**
   - Netlify provides automatic SSL
   - Railway/Render also provide SSL

## 📊 Monitoring & Analytics

### Health Checks

1. **Backend Health**
   - Endpoint: `https://your-backend.com/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend Health**
   - Check if the app loads correctly
   - Test repository analysis functionality

### Error Monitoring

1. **Backend Logs**
   - Railway: View logs in dashboard
   - Render: View logs in dashboard
   - Heroku: `heroku logs --tail`

2. **Frontend Errors**
   - Check browser console
   - Monitor Netlify function logs

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm test
      # Add deployment steps for your backend platform

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm run build
      # Add deployment steps for Netlify
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CORS_ORIGIN` is set correctly
   - Check if frontend URL matches backend CORS settings

2. **GitHub API Rate Limits**
   - Use GitHub token for higher limits
   - Implement proper error handling

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

4. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names and values

### Support

- Check the application logs
- Verify GitHub token permissions
- Test with a simple repository first
- Review the README for setup instructions

## 📈 Performance Optimization

1. **Frontend**
   - Enable gzip compression
   - Use CDN for static assets
   - Implement lazy loading

2. **Backend**
   - Enable caching headers
   - Optimize database queries
   - Use connection pooling

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit secrets to version control
   - Use platform-specific secret management

2. **CORS Configuration**
   - Restrict origins to your frontend domain
   - Avoid using `*` in production

3. **Rate Limiting**
   - Implement proper rate limiting
   - Monitor API usage

4. **Input Validation**
   - Validate all user inputs
   - Sanitize repository URLs

---

**Need Help?** Check the main README or create an issue in the repository. 