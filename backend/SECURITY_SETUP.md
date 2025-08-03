# 🔐 Security Setup Guide

## Environment Variables Configuration

**IMPORTANT**: Never commit API keys to version control! Always use environment variables.

### 1. Create your `.env` file

```bash
cd backend
cp env.example .env
```

### 2. Add your API keys to `.env`

```bash
# GitHub API Configuration
GITHUB_TOKEN=ghp_your_github_token_here

# Gemini AI API Configuration (for AI features)
GEMINI_API_KEY=AIzaSyDayeDCHIWbooOYZkILjLkjPtTqJZvx7gg

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Verify `.env` is in `.gitignore`

Make sure your `.env` file is listed in `.gitignore`:

```
# Environment variables
.env
.env.local
.env.production
```

### 🛡️ Security Best Practices

1. **Never hardcode API keys** in source code
2. **Use environment variables** for all sensitive data
3. **Keep `.env` files local** - never commit them
4. **Use different keys** for development and production
5. **Regularly rotate API keys** for security

### 🚀 Production Deployment

For production (Netlify, Vercel, etc.):

1. Add environment variables in your hosting platform's dashboard
2. Use secrets management for CI/CD pipelines
3. Consider using services like AWS Secrets Manager for enterprise apps

### ✅ Quick Verification

Test your setup:

```bash
cd backend
npm start
```

Check the console for:
- ✅ GitHub token configured
- ✅ Gemini API available (if configured) 