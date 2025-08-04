# Vibe GitHub Analyzer 🚀

A powerful web application that analyzes GitHub repositories and provides comprehensive insights into code quality, community health, and project vibes using advanced metrics and AI-powered analysis.

📖 **[About This Project](ABOUT.md)** - Learn about Cognizant Vibe Coding 2025

## ✨ Features

- **Repository Analysis**: Deep analysis of any public GitHub repository
- **User Profile Insights**: View GitHub user profiles and their repositories
- **Vibe Score™**: Proprietary scoring system based on 12+ metrics
- **Visual Analytics**: Interactive charts and visualizations
- **AI-Powered Insights**: Smart recommendations using Google Gemini 1.5 Flash
- **Real-time Processing**: Fast analysis with caching support
- **Beautiful UI**: Modern, responsive design with dark theme

## 🎯 Key Metrics

The Vibe Score analyzes repositories across multiple dimensions:

- **Code Quality**: Test coverage, code complexity, best practices
- **Documentation**: README quality, inline comments, API docs
- **Community Health**: Contributor diversity, issue response time
- **Security**: Vulnerability scanning, dependency updates
- **Performance**: Build optimization, runtime efficiency
- **Innovation**: Use of modern technologies and patterns

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- D3.js for data visualization
- Axios for API communication

### Backend
- Node.js with Fastify framework
- GitHub API v3 integration
- Google Gemini 1.5 Flash for AI insights
- Jest for testing

### Frontend Testing
- Vitest for unit testing
- React Testing Library for component testing

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- GitHub Personal Access Token
- Google Gemini API Key (free tier available)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vibe-github-analyzer.git
cd vibe-github-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create environment files:

**Backend** (create `backend/.env`):
```env
# GitHub API Configuration
GITHUB_TOKEN=your_github_token_here

# Gemini AI API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Frontend** (create `frontend/.env`):
```env
# API Configuration
VITE_API_URL=http://localhost:3000

# Application Configuration
VITE_APP_NAME=Vibe AI
VITE_APP_VERSION=1.0.0
```

4. Start the development server:
```bash
npm run dev
# Or start services individually:
npm run dev:backend  # Backend only
npm run dev:frontend # Frontend only
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 🔑 API Keys Setup

### GitHub Token
1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token with `public_repo` scope
3. Copy the token to your `.env` file

### Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

## 📱 Usage

### Analyzing a Repository
1. Enter a GitHub repository URL (e.g., `https://github.com/facebook/react`)
2. Click analyze to see the Vibe Score and detailed metrics
3. Click "Generate AI Insights" for smart recommendations

### Viewing User Profiles
1. Enter a GitHub username (e.g., `torvalds`)
2. View user statistics and repository list
3. Click on any repository to analyze it

## 🤖 AI Insights

The application uses **Google Gemini 1.5 Flash** to provide:
- Code hotspot identification
- Contributor collaboration patterns
- Development velocity analysis
- Code quality assessment
- Actionable improvement recommendations

## 🧪 Testing

Run the test suite:
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
# Or run with coverage:
npm run test:coverage
```

## 📦 Deployment

### Deploying to Netlify

The application is optimized for Netlify deployment with automatic builds:

1. **Fork this repository** to your GitHub account

2. **Connect to Netlify**:
   - Log in to [Netlify](https://www.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your forked repository

3. **Configure build settings** (already set in `netlify.toml`):
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`
   - Base directory: `.`

4. **Set environment variables** in Netlify dashboard:
   - Go to Site settings → Environment variables
   - Add your backend API URL:
     ```
     VITE_API_URL=https://your-backend-url.com
     ```

5. **Deploy**:
   - Click "Deploy site"
   - Netlify will automatically build and deploy your frontend
   - Future pushes to your repository will trigger automatic deployments

### Backend Deployment

The backend needs to be deployed separately on a platform like:
- Railway
- Render
- Fly.io
- AWS/Azure/GCP

Ensure your backend environment variables are set:
```
GITHUB_TOKEN=your_github_token
GEMINI_API_KEY=your_gemini_api_key
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- GitHub API for repository data
- Google Gemini 1.5 Flash for AI insights
- React and Vite communities
- All contributors and users

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Contact: your.email@example.com

---

Built with ❤️ for **Cognizant Vibe Coding 2025** 🚀

*Empowering developers with intelligent repository insights* 