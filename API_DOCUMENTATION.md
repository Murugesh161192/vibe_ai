# 🔮 Vibe AI API Documentation

> **Enterprise-Grade GitHub Repository Analysis API**  
> Calculate comprehensive vibe scores for any public GitHub repository with 12 weighted metrics

---

## 🎯 Overview

The Vibe AI API provides enterprise-grade analysis of GitHub repositories, calculating a comprehensive "vibe score" based on 12 key metrics including code quality, security, performance, and community health. Perfect for DevOps teams, CTOs, and engineering managers evaluating repositories for enterprise adoption.

### 🚀 Key Features

- **Real-time Analysis**: Analyze any public GitHub repository in seconds
- **12 Comprehensive Metrics**: From code quality to release management
- **Enterprise Focus**: Security, scalability, and maintainability insights
- **Weighted Scoring**: Intelligent metric prioritization for business decisions
- **Rate Limited**: Built-in protection with GitHub API integration

---

## 🔗 Base URL

```
Production:  https://your-backend-url.com
Development: http://localhost:3000
```

---

## 🔐 Authentication

### GitHub Token (Recommended)

For production usage, configure a GitHub Personal Access Token to increase rate limits from 60 to 5,000 requests per hour.

```env
GITHUB_TOKEN=ghp_your_token_here
```

**Token Permissions Required:**
- `public_repo` - Read access to public repositories

---

## 📊 Core Endpoints

### POST `/api/analyze`

Analyze a GitHub repository and calculate its comprehensive vibe score.

#### Request

```http
POST /api/analyze
Content-Type: application/json

{
  "repoUrl": "https://github.com/owner/repository"
}
```

#### Request Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `repoUrl` | string | ✅ | Valid GitHub repository URL |

#### Response Schema

```json
{
  "success": true,
  "data": {
    "vibeScore": 87.5,
    "grade": "A",
    "repository": {
      "name": "repository-name",
      "owner": "owner-name",
      "description": "Repository description",
      "language": "JavaScript",
      "stars": 1250,
      "forks": 89,
      "size": 2048,
      "createdAt": "2023-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T14:20:00Z"
    },
    "metrics": {
      "codeQuality": {
        "score": 85.0,
        "weight": 16,
        "weightedScore": 13.6,
        "details": {
          "testCoverage": 78.5,
          "complexity": "Low",
          "linting": true
        }
      },
      "readability": {
        "score": 92.0,
        "weight": 12,
        "weightedScore": 11.04,
        "details": {
          "readmeQuality": 95.0,
          "documentation": 88.0,
          "commentDensity": 15.2
        }
      },
      "collaboration": {
        "score": 88.0,
        "weight": 15,
        "weightedScore": 13.2,
        "details": {
          "commitFrequency": 85.0,
          "contributorDiversity": 90.0,
          "issueActivity": 89.0
        }
      },
      "innovation": {
        "score": 75.0,
        "weight": 8,
        "weightedScore": 6.0,
        "details": {
          "modernFrameworks": true,
          "dependencyHealth": 82.0,
          "technologyStack": "Modern"
        }
      },
      "maintainability": {
        "score": 82.0,
        "weight": 8,
        "weightedScore": 6.56,
        "details": {
          "folderStructure": 85.0,
          "dependencyManagement": 79.0,
          "codeOrganization": "Good"
        }
      },
      "inclusivity": {
        "score": 70.0,
        "weight": 5,
        "weightedScore": 3.5,
        "details": {
          "multilingualDocs": false,
          "accessibility": 75.0,
          "codeOfConduct": true
        }
      },
      "security": {
        "score": 90.0,
        "weight": 12,
        "weightedScore": 10.8,
        "details": {
          "vulnerabilities": 0,
          "securityPractices": 92.0,
          "dependencySafety": 88.0
        }
      },
      "performance": {
        "score": 85.0,
        "weight": 8,
        "weightedScore": 6.8,
        "details": {
          "optimization": true,
          "scalability": 87.0,
          "monitoring": false
        }
      },
      "testing": {
        "score": 88.0,
        "weight": 6,
        "weightedScore": 5.28,
        "details": {
          "testCoverage": 85.0,
          "ciCd": true,
          "qualityAssurance": 90.0
        }
      },
      "community": {
        "score": 78.0,
        "weight": 4,
        "weightedScore": 3.12,
        "details": {
          "issueResponse": 80.0,
          "prQuality": 75.0,
          "guidelines": true
        }
      },
      "codeHealth": {
        "score": 83.0,
        "weight": 4,
        "weightedScore": 3.32,
        "details": {
          "technicalDebt": "Low",
          "codeSmells": 15,
          "refactoring": "Recent"
        }
      },
      "releaseManagement": {
        "score": 92.0,
        "weight": 2,
        "weightedScore": 1.84,
        "details": {
          "releaseFrequency": 95.0,
          "versioning": "Semantic",
          "changelog": true
        }
      }
    },
    "insights": {
      "strengths": [
        "Excellent documentation and README quality",
        "Strong security practices with no vulnerabilities",
        "Consistent release management with semantic versioning"
      ],
      "improvements": [
        "Consider adding multilingual documentation",
        "Implement performance monitoring tools",
        "Increase test coverage above 85%"
      ],
      "recommendations": [
        "Add automated dependency updates",
        "Implement code quality gates in CI/CD",
        "Consider adding accessibility guidelines"
      ]
    },
    "analysis": {
      "totalFiles": 156,
      "totalLines": 12890,
      "contributors": 8,
      "lastActivity": "2024-01-15T14:20:00Z",
      "analysisTime": "2024-01-15T15:30:00Z",
      "apiCallsUsed": 12
    }
  }
}
```

#### Score Grading System

| Score Range | Grade | Color Code | Description |
|-------------|-------|------------|-------------|
| 90-100 | A+ | 🟢 `#10b981` | Excellent - Enterprise ready |
| 80-89 | A | 🟢 `#10b981` | Very Good - Production ready |
| 70-79 | B | 🟡 `#f59e0b` | Good - Minor improvements needed |
| 60-69 | C | 🟡 `#f59e0b` | Average - Moderate improvements needed |
| 50-59 | D | 🔴 `#ef4444` | Below Average - Significant improvements needed |
| 0-49 | F | 🔴 `#ef4444` | Poor - Major overhaul required |

#### Error Responses

```json
{
  "success": false,
  "error": {
    "code": "REPOSITORY_NOT_FOUND",
    "message": "Repository not found or is private",
    "details": "The specified repository does not exist or you don't have access to it"
  }
}
```

**Common Error Codes:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_URL` | 400 | Invalid GitHub repository URL format |
| `REPOSITORY_NOT_FOUND` | 404 | Repository doesn't exist or is private |
| `RATE_LIMIT_EXCEEDED` | 429 | GitHub API rate limit exceeded |
| `ANALYSIS_FAILED` | 500 | Internal error during analysis |
| `GITHUB_API_ERROR` | 502 | GitHub API unavailable |

---

## 🎯 Metric Breakdown

### 🏗️ Code Quality (16% weight)
- **Test Coverage**: Percentage of code covered by tests
- **Complexity Analysis**: Cyclomatic complexity assessment
- **Linting Standards**: Code style and best practices adherence

### 📚 Readability/Documentation (12% weight)
- **README Quality**: Completeness and clarity of README
- **Documentation Coverage**: API docs, comments, and guides
- **Comment Density**: Code commenting standards

### 🤝 Collaboration/Activity (15% weight)
- **Commit Frequency**: Regular development activity
- **Contributor Diversity**: Number of active contributors
- **Issue Management**: Response times and resolution rates

### 🚀 Innovation/Creativity (8% weight)
- **Modern Frameworks**: Use of current technologies
- **Dependency Health**: Up-to-date and secure dependencies
- **Technology Stack**: Innovation in architecture choices

### 🔧 Maintainability (8% weight)
- **Folder Structure**: Logical code organization
- **Dependency Management**: Clean dependency tree
- **Code Organization**: Modular and maintainable structure

### 🌍 Inclusivity (5% weight)
- **Multilingual Documentation**: International accessibility
- **Code of Conduct**: Community guidelines presence
- **Accessibility Features**: Inclusive design practices

### 🔒 Security & Safety (12% weight)
- **Vulnerability Assessment**: Known security issues
- **Security Practices**: Implementation of security measures
- **Dependency Safety**: Secure third-party packages

### ⚡ Performance & Scalability (8% weight)
- **Optimization Techniques**: Performance best practices
- **Scalability Design**: Architecture for growth
- **Monitoring Setup**: Performance tracking tools

### 🧪 Testing Quality (6% weight)
- **Test Coverage Tools**: Testing infrastructure
- **CI/CD Integration**: Automated testing pipelines
- **Quality Assurance**: Testing methodology and standards

### 🏘️ Community Health (4% weight)
- **Issue Response Time**: Community engagement speed
- **Pull Request Quality**: Code review standards
- **Contribution Guidelines**: Clear contribution process

### 🏥 Code Health (4% weight)
- **Technical Debt**: Accumulated maintenance burden
- **Code Smells**: Anti-patterns and problematic code
- **Refactoring Activity**: Code improvement frequency

### 🚢 Release Management (2% weight)
- **Release Frequency**: Regular release cycles
- **Versioning Strategy**: Semantic versioning adoption
- **Changelog Quality**: Release documentation

---

## 🔄 Rate Limiting

### Without GitHub Token
- **Limit**: 60 requests per hour
- **Reset**: Every hour at minute 0
- **Headers**: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### With GitHub Token
- **Limit**: 5,000 requests per hour
- **Reset**: Every hour from first request
- **Headers**: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Rate Limit Headers

```http
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4987
X-RateLimit-Reset: 1642680000
X-RateLimit-Used: 13
```

---

## 🛠️ SDKs & Integration

### JavaScript/Node.js

```javascript
const VibeAI = require('@vibe-ai/sdk');

const client = new VibeAI({
  apiUrl: 'https://your-backend-url.com',
  timeout: 30000
});

async function analyzeRepo() {
  try {
    const result = await client.analyze('https://github.com/owner/repo');
    console.log(`Vibe Score: ${result.data.vibeScore}`);
    console.log(`Grade: ${result.data.grade}`);
  } catch (error) {
    console.error('Analysis failed:', error.message);
  }
}
```

### Python

```python
import requests

def analyze_repository(repo_url):
    response = requests.post(
        'https://your-backend-url.com/api/analyze',
        json={'repoUrl': repo_url},
        headers={'Content-Type': 'application/json'},
        timeout=30
    )
    
    if response.status_code == 200:
        data = response.json()
        return data['data']['vibeScore']
    else:
        raise Exception(f"Analysis failed: {response.json()['error']['message']}")

# Usage
vibe_score = analyze_repository('https://github.com/owner/repo')
print(f"Vibe Score: {vibe_score}")
```

### cURL

```bash
curl -X POST \
  https://your-backend-url.com/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{
    "repoUrl": "https://github.com/owner/repository"
  }'
```

---

## 🎨 Frontend Integration

### React Component Example

```jsx
import React, { useState } from 'react';

const VibeAnalyzer = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeRepo = async (repoUrl) => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl })
      });
      
      const data = await response.json();
      setResult(data.data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vibe-analyzer">
      {result && (
        <div className={`vibe-score ${getScoreClass(result.vibeScore)}`}>
          <span className="score">{result.vibeScore}</span>
          <span className="grade">{result.grade}</span>
        </div>
      )}
    </div>
  );
};

const getScoreClass = (score) => {
  if (score >= 80) return 'excellent';
  if (score >= 70) return 'good';
  return 'poor';
};
```

### CSS Classes (Tailwind)

```css
.vibe-score.excellent {
  @apply bg-gradient-to-r from-green-500 to-emerald-600 text-white;
}

.vibe-score.good {
  @apply bg-gradient-to-r from-amber-500 to-orange-600 text-white;
}

.vibe-score.poor {
  @apply bg-gradient-to-r from-red-500 to-rose-600 text-white;
}
```

---

## 🔧 Configuration

### Environment Variables

```env
# Backend Configuration
GITHUB_TOKEN=ghp_your_github_token
NODE_ENV=production
PORT=3000
API_TIMEOUT=30000
RATE_LIMIT_WINDOW=3600000
RATE_LIMIT_MAX=100

# Frontend Configuration
VITE_API_URL=https://your-backend-url.com
VITE_TIMEOUT=30000
VITE_ENABLE_ANALYTICS=true
```

### Server Configuration

```javascript
// backend/src/config/index.js
export const config = {
  github: {
    token: process.env.GITHUB_TOKEN,
    apiUrl: 'https://api.github.com',
    timeout: 10000
  },
  server: {
    port: process.env.PORT || 3000,
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173'
    }
  },
  rateLimit: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100 // requests per window
  }
};
```

---

## 📈 Performance & Monitoring

### Response Times
- **Average**: 2.5 seconds
- **95th percentile**: 4.8 seconds
- **99th percentile**: 8.2 seconds

### Caching Strategy
- **Repository Metadata**: 1 hour cache
- **Analysis Results**: 24 hour cache
- **GitHub API Responses**: 30 minutes cache

### Monitoring Endpoints

```http
GET /health              # Health check
GET /metrics             # Prometheus metrics
GET /api/status          # API status and rate limits
```

---

## 🚨 Error Handling Best Practices

### Retry Logic

```javascript
const analyzeWithRetry = async (repoUrl, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await analyzeRepository(repoUrl);
    } catch (error) {
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
};
```

### Error Recovery

```javascript
const handleAnalysisError = (error) => {
  switch (error.code) {
    case 'RATE_LIMIT_EXCEEDED':
      return 'Rate limit exceeded. Please try again later.';
    case 'REPOSITORY_NOT_FOUND':
      return 'Repository not found. Please check the URL.';
    case 'GITHUB_API_ERROR':
      return 'GitHub API is temporarily unavailable.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};
```

---

## 🔮 Webhook Integration (Coming Soon)

### Repository Updates

```javascript
// Webhook payload for repository changes
{
  "event": "repository.updated",
  "repository": {
    "url": "https://github.com/owner/repo",
    "lastCommit": "abc123"
  },
  "timestamp": "2024-01-15T15:30:00Z"
}
```

### Score Thresholds

```javascript
// Configure score threshold alerts
{
  "webhookUrl": "https://your-app.com/webhooks/vibe-score",
  "thresholds": {
    "excellent": 90,
    "warning": 60,
    "critical": 40
  }
}
```

---

## 📞 Support & Resources

### 🔗 Links
- **Documentation**: https://docs.vibe-ai.com
- **GitHub**: https://github.com/your-org/vibe-ai
- **Status Page**: https://status.vibe-ai.com
- **Community**: https://discord.gg/vibe-ai

### 🆘 Support Channels
- **Email**: support@vibe-ai.com
- **Discord**: #api-support
- **GitHub Issues**: Technical issues and feature requests

### 📊 SLA & Uptime
- **Uptime Target**: 99.9%
- **Response Time**: < 3 seconds (95th percentile)
- **Support Response**: < 24 hours

---

*Built with ❤️ for developers by the Vibe AI Team*  
*Enterprise-grade repository analysis for the modern development workflow*