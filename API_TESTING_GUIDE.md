# Vibe GitHub Assistant - Comprehensive API Testing Guide

This guide provides detailed procedures for testing the Vibe GitHub Assistant API locally, ensuring that when you paste any repository URL, all standards are genuinely covered and validated.

## 🎯 Testing Philosophy

### Core Principles
- **Comprehensive Coverage**: Every metric and edge case must be tested
- **Real-World Scenarios**: Test with actual repositories that users would analyze
- **Performance Validation**: Ensure enterprise-grade performance standards
- **Error Resilience**: Validate graceful handling of all error conditions
- **Security Compliance**: Verify all security measures are effective

## 🚀 Quick Setup for API Testing

### 1. Environment Preparation
```bash
# Ensure all dependencies are installed
cd vibe_ai
npm run install:all

# Verify environment files exist
ls backend/.env frontend/.env

# Start the application
npm run dev

# Verify services are running
curl http://localhost:3000/health
curl http://localhost:5173
```

### 2. GitHub Token Verification
```bash
# Test GitHub API access
curl -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/rate_limit

# Expected response should show 5000 requests/hour limit
```

## 📋 Comprehensive Repository Test Suite

### Tier 1: High-Quality Enterprise Repositories
These repositories should score 75+ overall and test all 12 metrics:

#### JavaScript/TypeScript Projects
```bash
# Test Case 1: React (Facebook)
Repository: https://github.com/facebook/react
Expected Metrics:
- Code Quality: 85-95 (excellent test coverage)
- Readability: 90-95 (comprehensive documentation)
- Collaboration: 90-95 (active contributors)
- Innovation: 85-90 (cutting-edge features)
- Maintainability: 85-90 (clean architecture)
- Inclusivity: 80-85 (accessibility features)
- Security: 85-90 (security practices)
- Performance: 80-85 (optimization techniques)
- Testing: 90-95 (extensive test suite)
- Community: 85-90 (active maintenance)
- Code Health: 85-90 (low technical debt)
- Release: 80-85 (regular releases)
Total Expected: 85-90

# Test API call
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react"}'
```

```bash
# Test Case 2: TypeScript (Microsoft)
Repository: https://github.com/microsoft/TypeScript
Expected Metrics:
- Code Quality: 90-95 (compiler-grade quality)
- Readability: 85-90 (technical documentation)
- Collaboration: 85-90 (Microsoft team)
- Innovation: 90-95 (language innovation)
- Maintainability: 90-95 (excellent structure)
- Security: 85-90 (security conscious)
- Performance: 85-90 (compiler performance)
- Testing: 85-90 (comprehensive tests)
Total Expected: 85-92

curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/microsoft/TypeScript"}'
```

```bash
# Test Case 3: VS Code (Microsoft)
Repository: https://github.com/microsoft/vscode
Expected Metrics:
- Code Quality: 85-90 (enterprise quality)
- Readability: 80-85 (large codebase)
- Collaboration: 90-95 (active community)
- Innovation: 85-90 (editor innovation)
- Maintainability: 80-85 (complex architecture)
- Security: 85-90 (security features)
- Performance: 80-85 (desktop performance)
- Testing: 80-85 (UI testing challenges)
Total Expected: 82-88

curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/microsoft/vscode"}'
```

#### Python Projects
```bash
# Test Case 4: Requests Library
Repository: https://github.com/psf/requests
Expected Metrics:
- Readability: 90-95 (excellent documentation)
- Code Quality: 85-90 (well-tested library)
- Maintainability: 85-90 (clean Python code)
- Community: 80-85 (mature project)
Total Expected: 82-87

curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/psf/requests"}'
```

```bash
# Test Case 5: FastAPI
Repository: https://github.com/tiangolo/fastapi
Expected Metrics:
- Innovation: 90-95 (modern Python framework)
- Performance: 85-90 (high performance)
- Documentation: 90-95 (excellent docs)
- Testing: 85-90 (good test coverage)
Total Expected: 85-90

curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/tiangolo/fastapi"}'
```

#### Go Projects
```bash
# Test Case 6: Kubernetes
Repository: https://github.com/kubernetes/kubernetes
Expected Metrics:
- Performance: 90-95 (system performance)
- Security: 90-95 (security critical)
- Collaboration: 85-90 (large team)
- Code Quality: 80-85 (complex system)
- Release: 85-90 (regular releases)
Total Expected: 82-88

curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/kubernetes/kubernetes"}'
```

### Tier 2: Medium-Quality Projects
These should score 60-75 overall:

```bash
# Test Case 7: Express.js
Repository: https://github.com/expressjs/express
Expected Metrics:
- Code Quality: 75-80 (mature codebase)
- Community: 85-90 (very popular)
- Innovation: 60-70 (older framework)
- Maintainability: 70-75 (older patterns)
Total Expected: 70-78

curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/expressjs/express"}'
```

### Tier 3: Lower-Quality or Specialized Projects
These should score 40-60 overall:

```bash
# Test Case 8: Simple Utility Library
Repository: https://github.com/lodash/lodash
Expected Metrics:
- Code Quality: 80-85 (utility functions)
- Innovation: 40-50 (utility library)
- Performance: 75-80 (optimized utilities)
- Community: 70-75 (mature project)
Total Expected: 65-72

curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/lodash/lodash"}'
```

## 🔍 URL Format Testing

### Valid URL Formats Test
```bash
# Standard HTTPS URL
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react"}'

# URL with .git extension
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react.git"}'

# URL with www prefix
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://www.github.com/facebook/react"}'

# URL with trailing slash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react/"}'

# URL with subdirectory (should extract main repo)
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react/tree/main/packages"}'
```

### Invalid URL Handling Test
```bash
# Missing protocol
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "github.com/facebook/react"}'
# Expected: Error message about invalid URL format

# Non-GitHub URL
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://gitlab.com/gitlab-org/gitlab"}'
# Expected: Error message about GitHub URLs only

# Non-existent repository
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/nonexistent/repository-12345"}'
# Expected: Repository not found error

# Private repository (if you don't have access)
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/private-org/secret-repo"}'
# Expected: Access denied or repository not found error
```

## 📊 Metrics Validation Testing

### Complete Metrics Coverage Test
For every repository analysis, verify all 12 metrics are calculated:

```bash
# Test script to validate all metrics
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react"}' | \
jq '
if .success then
  .data.breakdown | to_entries | map({
    metric: .key,
    score: .value,
    valid: (.value >= 0 and .value <= 100)
  })
else
  {error: .message}
end'
```

### Expected Response Structure Validation
```javascript
// Expected response structure
{
  "success": true,
  "data": {
    "total": 78.5,  // Overall score 0-100
    "breakdown": {
      "codeQuality": 82.3,      // 16% weight
      "readability": 75.6,      // 12% weight  
      "collaboration": 88.1,    // 15% weight
      "innovation": 72.4,       // 8% weight
      "maintainability": 85.2,  // 8% weight
      "inclusivity": 68.9,      // 5% weight
      "security": 90.1,         // 12% weight
      "performance": 76.8,      // 8% weight
      "testing": 88.7,          // 6% weight
      "community": 81.3,        // 4% weight
      "codeHealth": 79.5,       // 4% weight
      "release": 74.2           // 2% weight
    },
    "repositoryInfo": {
      "name": "react",
      "owner": "facebook",
      "description": "A JavaScript library for building user interfaces",
      "language": "JavaScript",
      "stars": 100000,
      "forks": 50000,
      "created_at": "2013-05-24T16:15:54Z",
      "updated_at": "2025-01-09T10:30:00Z"
    },
    "analysisDetails": {
      "totalFiles": 1250,
      "contributors": 1500,
      "commits": 15000,
      "languageBreakdown": {
        "JavaScript": 65.5,
        "TypeScript": 30.2,
        "CSS": 4.3
      }
    }
  }
}
```

## ⚡ Performance Testing

### Response Time Requirements
```bash
# Test response times for different repository sizes
time curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react"}'

# Expected: < 30 seconds for most repositories
# Expected: < 60 seconds for very large repositories
```

### Concurrent Request Testing
```bash
# Test multiple concurrent requests
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/analyze \
    -H "Content-Type: application/json" \
    -d '{"repoUrl": "https://github.com/facebook/react"}' &
done
wait

# Expected: All requests should complete successfully
# Expected: No significant performance degradation
```

### Memory Usage Monitoring
```bash
# Monitor backend memory usage during analysis
# Run this in a separate terminal while testing
while true; do
  ps aux | grep "node.*server.js" | grep -v grep
  sleep 5
done

# Expected: Memory usage should remain stable
# Expected: No significant memory leaks
```

## 🔒 Security Testing

### Input Validation Testing
```bash
# Test XSS attempt
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "<script>alert(\"xss\")</script>"}'
# Expected: Input validation error

# Test SQL injection attempt
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/user/repo\"; DROP TABLE users; --"}'
# Expected: Input validation error

# Test very long URL
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d "{\"repoUrl\": \"https://github.com/user/$(printf 'a%.0s' {1..10000})\"}"
# Expected: Input validation error for excessive length
```

### Rate Limiting Testing
```bash
# Test rate limiting (adjust number based on your limits)
for i in {1..65}; do
  echo "Request $i"
  curl -X POST http://localhost:3000/api/analyze \
    -H "Content-Type: application/json" \
    -d '{"repoUrl": "https://github.com/facebook/react"}' \
    -w "Status: %{http_code}\n"
done

# Expected: Rate limit errors after configured limit
# Expected: Proper error messages with retry information
```

### CORS Testing
```bash
# Test CORS with different origins
curl -H "Origin: https://malicious-site.com" \
  -H "Content-Type: application/json" \
  -X POST http://localhost:3000/api/analyze \
  -d '{"repoUrl": "https://github.com/facebook/react"}'

# Expected: CORS policy should block unauthorized origins
# Expected: Proper CORS headers in response
```

## 🧪 Error Handling Testing

### Network Error Simulation
```bash
# Test with invalid GitHub token (temporarily change token)
# Edit backend/.env temporarily:
# GITHUB_TOKEN=invalid_token_12345

# Restart backend and test
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react"}'

# Expected: Proper error handling for authentication failure
# Remember to restore valid token after test
```

### GitHub API Error Handling
```bash
# Test repository that doesn't exist
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/thisuserdoesnotexist999/thisrepodoesnotexist999"}'

# Expected: Clear error message about repository not found
# Expected: No system crashes or exposing sensitive data
```

### Malformed Request Testing
```bash
# Missing repoUrl field
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: Validation error for missing required field

# Invalid JSON
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react"'
# Expected: JSON parsing error

# Wrong content type
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: text/plain" \
  -d '{"repoUrl": "https://github.com/facebook/react"}'
# Expected: Content type error
```

## 🔄 Integration Testing

### Full Application Flow Testing
```bash
# Test complete workflow
echo "Step 1: Health check"
curl http://localhost:3000/health

echo "Step 2: Analyze repository"
ANALYSIS_RESULT=$(curl -s -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react"}')

echo "Step 3: Validate response structure"
echo $ANALYSIS_RESULT | jq '
  if .success then
    {
      total_score: .data.total,
      metrics_count: (.data.breakdown | length),
      has_repo_info: (.data.repositoryInfo != null),
      all_scores_valid: [.data.breakdown[] | select(. < 0 or . > 100)] | length == 0
    }
  else
    {error: .message}
  end'
```

### Frontend-Backend Integration
```bash
# Test CORS between frontend and backend
# Open browser to http://localhost:5173
# Open browser console and run:
fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    repoUrl: 'https://github.com/facebook/react'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

# Expected: Request should complete successfully
# Expected: No CORS errors in browser console
```

## 📋 Testing Checklist Templates

### Daily Development Testing Checklist
```markdown
## Vibe GitHub Assistant Daily Testing Checklist

### Basic Functionality
- [ ] Backend starts without errors
- [ ] Frontend starts without errors  
- [ ] Health endpoint responds with 200
- [ ] CORS working between frontend/backend

### Repository Analysis
- [ ] Test high-quality repo (React): Score 80-90
- [ ] Test medium-quality repo (Express): Score 65-75
- [ ] Test documentation-heavy repo: High readability score
- [ ] Test well-tested repo: High testing score

### URL Validation
- [ ] Standard GitHub URL works
- [ ] URL with .git extension works
- [ ] URL with trailing slash works
- [ ] Invalid URL shows proper error
- [ ] Non-existent repo shows proper error

### Error Handling
- [ ] Rate limiting works and shows proper message
- [ ] Network errors handled gracefully
- [ ] Invalid JSON shows proper error
- [ ] Missing fields validated properly

### Performance
- [ ] Analysis completes within 30 seconds
- [ ] Memory usage stays stable
- [ ] Multiple concurrent requests work
- [ ] No memory leaks detected

### Security
- [ ] Input validation working
- [ ] XSS attempts blocked
- [ ] CORS properly configured
- [ ] Rate limiting effective
```

### Pre-Release Testing Checklist
```markdown
## Vibe GitHub Assistant Pre-Release Testing Checklist

### Comprehensive Repository Testing
- [ ] JavaScript projects (5+ repositories)
- [ ] Python projects (3+ repositories)  
- [ ] Go projects (2+ repositories)
- [ ] Multi-language projects (2+ repositories)
- [ ] Large repositories (>10k files)
- [ ] Small repositories (<100 files)

### Edge Case Testing
- [ ] Repositories with no README
- [ ] Repositories with minimal files
- [ ] Repositories with only documentation
- [ ] Archived repositories
- [ ] Forked repositories

### Performance Benchmarking
- [ ] Average response time < 15 seconds
- [ ] 95th percentile response time < 30 seconds
- [ ] Memory usage < 512MB during analysis
- [ ] No memory leaks over 100 analyses
- [ ] Concurrent request handling (10+ simultaneous)

### Security Validation
- [ ] All input vectors tested
- [ ] Rate limiting thoroughly tested
- [ ] CORS policy enforced
- [ ] GitHub token security verified
- [ ] Error messages don't expose sensitive data

### Metrics Accuracy
- [ ] All 12 metrics calculated for every repo
- [ ] Scores within 0-100 range
- [ ] Weighted total calculation correct
- [ ] Consistent results for same repository
- [ ] Reasonable scores for known quality repositories
```

## 🔧 Testing Tools and Scripts

### Automated Testing Script
```bash
#!/bin/bash
# save as test-api.sh

API_URL="http://localhost:3000"
TEST_REPOS=(
  "https://github.com/facebook/react"
  "https://github.com/microsoft/TypeScript"
  "https://github.com/psf/requests"
  "https://github.com/expressjs/express"
)

echo "Starting Vibe GitHub Assistant API Testing..."

# Test health endpoint
echo "Testing health endpoint..."
curl -f $API_URL/health > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed"
  exit 1
fi

# Test repository analysis
for repo in "${TEST_REPOS[@]}"; do
  echo "Testing repository: $repo"
  
  response=$(curl -s -X POST $API_URL/api/analyze \
    -H "Content-Type: application/json" \
    -d "{\"repoUrl\": \"$repo\"}")
  
  success=$(echo $response | jq -r '.success')
  
  if [ "$success" = "true" ]; then
    total_score=$(echo $response | jq -r '.data.total')
    metrics_count=$(echo $response | jq '.data.breakdown | length')
    echo "✅ Analysis successful - Score: $total_score, Metrics: $metrics_count"
  else
    error_message=$(echo $response | jq -r '.message')
    echo "❌ Analysis failed - Error: $error_message"
  fi
  
  echo "---"
done

echo "API testing completed!"
```

### Performance Monitoring Script
```bash
#!/bin/bash
# save as monitor-performance.sh

API_URL="http://localhost:3000"
REPO_URL="https://github.com/facebook/react"

echo "Performance monitoring for Vibe GitHub Assistant API..."

for i in {1..10}; do
  echo "Test run $i:"
  
  start_time=$(date +%s)
  
  response=$(curl -s -X POST $API_URL/api/analyze \
    -H "Content-Type: application/json" \
    -d "{\"repoUrl\": \"$REPO_URL\"}")
  
  end_time=$(date +%s)
  duration=$((end_time - start_time))
  
  success=$(echo $response | jq -r '.success')
  
  if [ "$success" = "true" ]; then
    echo "  ✅ Duration: ${duration}s"
  else
    echo "  ❌ Failed in ${duration}s"
  fi
  
  # Memory usage check
  memory=$(ps aux | grep "node.*server.js" | grep -v grep | awk '{print $6}')
  echo "  Memory: ${memory}KB"
  
  echo "---"
  sleep 2
done
```

## 📊 Testing Metrics and KPIs

### Success Criteria
- **Accuracy**: All 12 metrics calculated for every repository
- **Performance**: 95% of requests complete within 30 seconds
- **Reliability**: 99.9% uptime during testing
- **Security**: Zero security vulnerabilities found
- **Usability**: Clear error messages for all failure cases

### Performance Benchmarks
- **Small repositories** (<100 files): < 5 seconds
- **Medium repositories** (100-1000 files): < 15 seconds  
- **Large repositories** (1000+ files): < 30 seconds
- **Memory usage**: < 512MB during analysis
- **Concurrent requests**: Support 10+ simultaneous analyses

---

## 📞 Support and Troubleshooting

### Common Issues
1. **Analysis timeouts**: Check repository size and network connectivity
2. **Rate limiting**: Verify GitHub token configuration
3. **CORS errors**: Ensure proper origin configuration
4. **Memory issues**: Monitor for leaks during extended testing

### Getting Help
- Check backend logs for detailed error information
- Verify GitHub token permissions and rate limits
- Test with smaller repositories first
- Review the comprehensive testing standards document

---

**This testing guide ensures that Vibe GitHub Assistant maintains enterprise-grade quality and reliability through comprehensive validation of all features and edge cases.** 