# Vibe AI - Enterprise GitHub Repository Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Built for Cognizant](https://img.shields.io/badge/Built%20for-Cognizant%20Vibe%20Coding%202025-blue)](https://cognizant.com/)

A professional full-stack web application that provides enterprise-grade analysis of GitHub repositories through intelligent "vibe scoring" based on twelve comprehensive metrics. Designed for organizations seeking data-driven insights into code quality, team collaboration, and repository health.

## 🏢 Enterprise Features

- **🔍 Repository Intelligence**: Comprehensive analysis of any public GitHub repository
- **📊 Multi-Metric Assessment**: 12 weighted enterprise-grade metrics for repository evaluation
- **🌐 Multi-Language Support**: Advanced analysis for Python, Java, JavaScript, Go, TypeScript, and more
- **📈 Interactive Visualizations**: Professional D3.js radar charts with smooth animations
- **♿ Accessibility Compliant**: WCAG 2.2 compliant with full ARIA support and keyboard navigation
- **🔒 Enterprise Security**: Secure API token management and rate limiting
- **⚡ High Performance**: Optimized for enterprise-scale repository analysis

## 🏗️ Technology Stack

### Frontend Architecture
- **React 18** with modern hooks and context management
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** with custom design system for consistent UI
- **D3.js** for interactive data visualizations
- **Lucide React** for consistent iconography

### Backend Architecture
- **Fastify** (Node.js/Bun compatible) with JSON schema validation
- **GitHub REST API** integration with intelligent rate limiting
- **Comprehensive error handling** and logging
- **RESTful API design** with OpenAPI documentation

### Deployment & DevOps
- **Netlify-ready** frontend configuration
- **Railway/Render/Heroku** backend deployment support
- **CI/CD pipeline** support with automated testing
- **Environment-specific** configurations

## 📊 Enterprise Vibe Score Metrics

Our proprietary scoring algorithm evaluates repositories across twelve critical dimensions:

### 🔧 Core Development Metrics (59%)
| Metric | Weight | Description |
|--------|--------|-------------|
| **Code Quality** | 16% | Test coverage, complexity analysis, code standards |
| **Collaboration & Activity** | 15% | Commit frequency, contributor diversity, team dynamics |
| **Readability & Documentation** | 12% | README quality, API docs, inline comments |
| **Innovation & Creativity** | 8% | Modern frameworks, architectural patterns |
| **Maintainability** | 8% | Project structure, dependency management |

### 🏢 Enterprise-Grade Metrics (41%)
| Metric | Weight | Description |
|--------|--------|-------------|
| **Security & Safety** | 12% | Vulnerability scanning, security practices, compliance |
| **Performance & Scalability** | 8% | Optimization techniques, monitoring, architecture |
| **Testing Quality** | 6% | Test coverage, CI/CD integration, quality gates |
| **Inclusivity** | 5% | Multilingual support, accessibility features |
| **Community Health** | 4% | Issue management, PR quality, contributor guidelines |
| **Code Health** | 4% | Technical debt, code smells, refactoring practices |
| **Release Management** | 2% | Versioning, changelog, release frequency |

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js 18+** or **Bun** runtime
- **GitHub Personal Access Token** (for enhanced API limits)
- **Git** for version control

### Installation

1. **Clone and Setup**
   ```bash
   git clone https://github.com/your-username/vibe-ai.git
   cd vibe_ai
   npm run setup
   ```

2. **Configure Environment**
   ```bash
   # Configure GitHub API token (increases limit from 60 to 5,000 requests/hour)
   cd backend
   npm run setup-token
   # Follow the interactive prompts for secure token setup
   ```

3. **Start Development Environment**
   ```bash
   # Start both frontend and backend concurrently
   npm run dev
   
   # Or start individually:
   npm run dev:backend  # Backend: http://localhost:3000
   npm run dev:frontend # Frontend: http://localhost:5173
   ```

### GitHub API Token Setup

**Required for Production Use**: GitHub limits unauthenticated requests to 60/hour. A personal access token provides 5,000 requests/hour.

#### Option A: Interactive Setup (Recommended)
```bash
cd backend
npm run setup-token
```

#### Option B: Manual Configuration
1. Navigate to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate new token (classic) with `public_repo` scope
3. Add to `backend/.env`:
   ```env
   GITHUB_TOKEN=ghp_your_token_here
   ```

## 🧪 Comprehensive Testing Standards

### Repository URL Testing
The application supports various GitHub URL formats. Test with these examples:

#### ✅ Supported URL Formats
```bash
# Standard HTTPS URLs
https://github.com/microsoft/vscode
https://github.com/facebook/react

# URLs with .git extension
https://github.com/nodejs/node.git

# URLs with trailing slashes
https://github.com/tailwindlabs/tailwindcss/

# URLs with subdirectories (will extract main repo)
https://github.com/facebook/react/tree/main/packages
```

#### ❌ Unsupported Formats
```bash
# Private repositories (requires authentication)
https://github.com/private-org/private-repo

# Non-GitHub URLs
https://gitlab.com/user/repo
git@github.com:user/repo.git

# Invalid URLs
github.com/user/repo (missing protocol)
https://github.com/user (missing repository)
```

### Local Testing Checklist

Before deploying, ensure your local setup passes these tests:

#### 🔍 Basic Functionality Tests
- [ ] Application starts without errors (`npm run dev`)
- [ ] Frontend loads at http://localhost:5173
- [ ] Backend API responds at http://localhost:3000
- [ ] Health check endpoint returns 200: `curl http://localhost:3000/health`

#### 📝 Repository Analysis Tests
Test with these diverse repository types:

```bash
# Popular JavaScript Project
https://github.com/facebook/react

# Python Project with Good Documentation
https://github.com/psf/requests

# Go Project with Modern Structure
https://github.com/kubernetes/kubernetes

# Multi-language Enterprise Project
https://github.com/microsoft/vscode

# Well-tested Project
https://github.com/jest-community/jest
```

#### 🔐 Security & Configuration Tests
- [ ] GitHub token authentication working
- [ ] Rate limiting properly configured
- [ ] CORS headers set correctly
- [ ] Error handling for invalid URLs
- [ ] Timeout handling for slow repositories

#### 📊 Metrics Validation Tests
Verify that analysis includes all 12 metrics:
- [ ] Code Quality score calculated
- [ ] Readability/Documentation assessed
- [ ] Collaboration metrics generated
- [ ] Innovation indicators present
- [ ] Security analysis completed
- [ ] Performance metrics calculated

### Integration Testing
```bash
# Run full test suite
npm run test

# Test individual components
npm run test:frontend
npm run test:backend

# Test API endpoints
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react"}'
```

## 🌐 Production Deployment

### Frontend Deployment (Netlify)
```bash
# Build and deploy
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

**Environment Variables:**
- `VITE_API_URL`: Backend API endpoint
- `VITE_APP_NAME`: Application name (optional)

### Backend Deployment (Railway/Render/Heroku)
**Environment Variables:**
- `GITHUB_TOKEN`: GitHub Personal Access Token (required)
- `NODE_ENV`: production
- `PORT`: Auto-configured by platform
- `CORS_ORIGIN`: Frontend domain

### Production Testing Standards
Before going live, verify:
- [ ] All environment variables configured
- [ ] GitHub token has sufficient permissions
- [ ] CORS properly configured for production domain
- [ ] Rate limiting appropriate for expected traffic
- [ ] Error monitoring and logging enabled
- [ ] Health checks responding correctly
- [ ] SSL certificates active

## 📁 Project Architecture

```
vibe_ai/
├── 📁 frontend/                 # React application
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable UI components
│   │   ├── 📁 services/         # API integration services
│   │   ├── 📁 utils/            # Utility functions
│   │   └── 📄 App.jsx           # Main application component
│   ├── 📁 public/               # Static assets
│   └── 📄 package.json          # Frontend dependencies
├── 📁 backend/                  # Fastify API server
│   ├── 📁 src/
│   │   ├── 📁 routes/           # API route handlers
│   │   ├── 📁 services/         # Business logic services
│   │   └── 📄 server.js         # Fastify server configuration
│   └── 📄 package.json          # Backend dependencies
├── 📄 netlify.toml              # Netlify deployment config
├── 📄 DEPLOYMENT.md             # Deployment documentation
└── 📄 README.md                 # This file
```

## 🔧 API Reference

### Core Endpoints

#### `POST /api/analyze`
Analyze a GitHub repository and return vibe score.

**Request:**
```json
{
  "repoUrl": "https://github.com/username/repository"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 78.5,
    "breakdown": {
      "codeQuality": 82.3,
      "readability": 75.6,
      "collaboration": 88.1,
      // ... other metrics
    },
    "repositoryInfo": {
      "name": "repository",
      "owner": "username",
      "description": "Repository description",
      "language": "JavaScript",
      "stars": 1234,
      "forks": 567
    }
  }
}
```

#### `GET /health`
Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-09T10:30:00.000Z"
}
```

## 🎨 UI Components & Design System

Built with enterprise-grade design principles:

- **🌈 Color Palette**: Professional gradients with accessibility-compliant contrast
- **🎯 Typography**: Consistent heading hierarchy and readable body text
- **📱 Responsive Design**: Mobile-first approach with breakpoint optimization
- **♿ Accessibility**: WCAG 2.2 AA compliance with screen reader support
- **🔍 Interactive Elements**: Hover states, focus management, and loading indicators

### Key Components
- **Repository Input**: URL validation with real-time feedback
- **Vibe Score Display**: Large score with color-coded performance indicators
- **Radar Chart**: Interactive D3.js visualization with metric breakdown
- **Metrics Dashboard**: Detailed scores with explanatory tooltips
- **Language Detection**: Automatic primary language identification

## 🔒 Security & Compliance

- **🔐 Secure Token Storage**: Environment-based GitHub API token management
- **✅ Input Validation**: Comprehensive URL and data validation on frontend and backend
- **🌐 CORS Configuration**: Production-ready cross-origin resource sharing
- **⚡ Rate Limiting**: Intelligent request throttling with user feedback
- **🛡️ Security Headers**: Content Security Policy and security headers via Netlify
- **📝 Error Handling**: Graceful error management with user-friendly messages

## 🔧 Troubleshooting & Support

### Common Issues & Solutions

#### GitHub API Rate Limit
**Problem:** "GitHub API rate limit exceeded"

**Solutions:**
1. **Add GitHub Token** (Recommended)
   - Increases limit from 60 to 5,000 requests/hour
   - Follow token setup instructions above

2. **Monitor Usage**
   - Unauthenticated: 60 requests/hour
   - With token: 5,000 requests/hour
   - Rate limit resets every hour

#### Repository Access Issues
**Problem:** "Repository not found" or "Access denied"

**Solutions:**
- Ensure repository is public
- Verify URL format is correct
- Check repository still exists

#### Performance Issues
**Problem:** Slow analysis or timeouts

**Solutions:**
- Large repositories may take longer to analyze
- Check internet connection stability
- Verify backend server is responsive
- Consider repository size and complexity

### Getting Help
- **📊 Application Issues**: Create issue in GitHub repository
- **🔧 Setup Problems**: Review installation documentation
- **💡 Feature Requests**: Submit enhancement proposals
- **🐛 Bug Reports**: Use issue template with reproduction steps

## 🤝 Contributing

We welcome contributions to improve Vibe AI:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Submit** a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**🎉 Built for Cognizant's Vibe Coding Week 2025**

*Empowering enterprise teams with intelligent repository insights and data-driven development decisions.* 