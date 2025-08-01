# Vibe AI - GitHub Repository Vibe Score Calculator

A full-stack web application that analyzes GitHub repositories and calculates a "vibe score" based on twelve comprehensive metrics for enterprise-grade validation, including code quality, readability, collaboration, innovation, maintainability, inclusivity, security, performance, testing quality, community health, code health, and release management.

## 🚀 Features

- **Repository Analysis**: Input any public GitHub repository URL
- **Multi-Language Support**: Works with Python, Java, JavaScript, Go, and more
- **Interactive Visualizations**: D3.js radar chart with smooth animations
- **Comprehensive Scoring**: Twelve weighted metrics for enterprise-grade repository assessment
- **Accessible Design**: WCAG 2.2 compliant with ARIA labels and keyboard navigation

## 🏗️ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + D3.js
- **Backend**: Fastify (Node.js/Bun) with JSON schema validation
- **API**: GitHub REST API for repository data
- **Deployment**: Netlify-ready configuration

## 📊 Vibe Score Metrics

### Core Metrics
1. **Code Quality (16%)**: Test coverage, code complexity analysis
2. **Readability/Documentation (12%)**: README quality, comment density
3. **Collaboration/Activity (15%)**: Commit frequency, contributor diversity
4. **Innovation/Creativity (8%)**: Modern frameworks, dependency analysis
5. **Maintainability (8%)**: Folder structure, dependency management
6. **Inclusivity (5%)**: Multilingual docs, accessibility

### Enterprise-Grade Metrics
7. **Security & Safety (12%)**: Security practices, vulnerability scanning, compliance
8. **Performance & Scalability (8%)**: Performance monitoring, optimization, scaling
9. **Testing Quality (6%)**: Test coverage tools, CI/CD, quality assurance
10. **Community Health (4%)**: Issue response, PR quality, guidelines
11. **Code Health (4%)**: Technical debt, code smells, refactoring
12. **Release Management (2%)**: Release frequency, versioning, changelog

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ or Bun
- GitHub Personal Access Token

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd vibe_ai
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

4. **Configure GitHub API Token (Important!)**
   
   **Why you need this:** GitHub limits unauthenticated API requests to 60 per hour. With a token, you get 5,000 requests per hour.
   
   **Option A: Use the setup script (Recommended)**
   ```bash
   cd backend
   npm run setup-token
   # Follow the interactive prompts
   ```
   
   **Option B: Manual setup**
   a. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   b. Click "Generate new token (classic)"
   c. Give it a name like "Vibe AI Analyzer"
   d. Select the `public_repo` scope (for public repositories only)
   e. Copy the generated token
   f. Add the token to `backend/.env`:
     ```
     GITHUB_TOKEN=ghp_your_token_here
     ```
   
   **Note:** Without a token, the app will work but with limited API calls (60/hour). With a token, you get 5,000 requests/hour.

### Development

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 🚀 Netlify Deployment

### Frontend Deployment

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build command: `cd frontend && npm install && npm run build`
   - Set publish directory: `frontend/dist`
   - Add environment variables in Netlify dashboard:
     - `VITE_API_URL`: Your backend API URL

### Backend Deployment

The backend can be deployed to:
- **Railway**: Connect GitHub repo and set environment variables
- **Render**: Deploy as a web service
- **Heroku**: Deploy using the Procfile

### Environment Variables for Production

```env
# Backend (.env)
GITHUB_TOKEN=your_github_token
NODE_ENV=production
PORT=3000

# Frontend (.env)
VITE_API_URL=https://your-backend-url.com
```

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
npm run test
```

## 📁 Project Structure

```
vibe_ai/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── App.jsx         # Main application component
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # Fastify backend API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Fastify server setup
│   ├── .env.example        # Environment variables template
│   └── package.json        # Backend dependencies
└── README.md               # This file
```

## 🔧 API Endpoints

- `POST /api/analyze` - Analyze a GitHub repository
  - Body: `{ "repoUrl": "https://github.com/user/repo" }`
  - Returns: Vibe score breakdown and analysis

## 🎨 UI Components

- **Repository Input**: URL input with validation
- **Vibe Score Display**: Large score with color-coded indicators
- **Radar Chart**: Interactive D3.js visualization
- **Metrics Breakdown**: Detailed scores for each category
- **Language Detection**: Shows detected primary language

## 🔒 Security

- GitHub API token stored securely in environment variables
- Input validation on both frontend and backend
- CORS configuration for production deployment
- Rate limiting for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔧 Troubleshooting

### GitHub API Rate Limit Issues

**Error:** "GitHub API rate limit exceeded"

**Solutions:**
1. **Add a GitHub token** (recommended)
   - Follow the setup instructions above to add a GitHub Personal Access Token
   - This increases your limit from 60 to 5,000 requests per hour

2. **Wait for rate limit reset**
   - Unauthenticated requests: 60 requests per hour
   - Rate limit resets every hour
   - Check the error message for the exact reset time

3. **Reduce API calls**
   - The app now uses fewer API calls by default
   - Contributors are limited to 30 per repository
   - Detailed user information is not fetched to avoid rate limits

### Other Common Issues

- **"Repository not found"**: Ensure the repository is public and the URL is correct
- **"Access denied"**: Repository might be private or you don't have access
- **Network errors**: Check your internet connection and try again

## 🆘 Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the documentation in `/docs` folder
- Review the inline comments in the codebase

---

**Built for Cognizant's Vibe Coding Week 2025** 🎉 