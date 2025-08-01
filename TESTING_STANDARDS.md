# Vibe AI - Comprehensive Testing Standards

This document outlines the complete testing standards and procedures for the Vibe AI enterprise repository analysis platform. These standards ensure consistent quality, reliability, and comprehensive coverage across all development and deployment scenarios.

## 📋 Testing Overview

### Testing Philosophy
- **Quality First**: Every feature must be thoroughly tested before deployment
- **User-Centric**: Tests should cover real-world usage scenarios
- **Comprehensive Coverage**: All 12 metrics and edge cases must be validated
- **Performance Focused**: Tests should validate enterprise-scale performance
- **Security Conscious**: Security validations are mandatory

### Testing Pyramid
```
┌─────────────────────────────────────┐
│           E2E Tests (10%)           │ ← User workflows
├─────────────────────────────────────┤
│       Integration Tests (30%)       │ ← API interactions
├─────────────────────────────────────┤
│         Unit Tests (60%)            │ ← Component logic
└─────────────────────────────────────┘
```

## 🔍 Repository URL Testing Standards

### Supported URL Formats
All these formats MUST be properly handled and validated:

#### ✅ Valid GitHub Repository URLs
```bash
# Standard HTTPS URLs
https://github.com/microsoft/vscode
https://github.com/facebook/react
https://github.com/torvalds/linux

# URLs with .git extension
https://github.com/nodejs/node.git
https://github.com/expressjs/express.git

# URLs with www prefix
https://www.github.com/microsoft/TypeScript

# URLs with trailing slashes
https://github.com/tailwindlabs/tailwindcss/
https://github.com/vercel/next.js/

# URLs with paths (should extract main repo)
https://github.com/vercel/next.js/tree/main/packages
https://github.com/microsoft/vscode/blob/main/README.md
https://github.com/facebook/react/issues
https://github.com/nodejs/node/releases

# URLs with query parameters (should extract main repo)
https://github.com/microsoft/vscode?tab=readme-ov-file
https://github.com/facebook/react/tree/main?tab=readme-ov-file
```

#### ❌ Invalid URLs (Must Show Proper Error Messages)
```bash
# Missing protocol
github.com/microsoft/vscode
www.github.com/facebook/react

# Non-GitHub URLs
https://gitlab.com/gitlab-org/gitlab
https://bitbucket.org/atlassian/bitbucket

# SSH URLs
git@github.com:microsoft/vscode.git

# Incomplete URLs
https://github.com/microsoft
https://github.com/

# Invalid domains
https://github.co/microsoft/vscode
https://githubz.com/microsoft/vscode

# Private repositories (should handle gracefully)
https://github.com/private-org/secret-repo

# Non-existent repositories
https://github.com/nonexistent/nonexistent-repo-12345
```

### URL Validation Test Cases

#### Test Case 1: Valid URL Processing
```javascript
describe('URL Validation', () => {
  test('should accept standard GitHub URLs', () => {
    const validUrls = [
      'https://github.com/microsoft/vscode',
      'https://github.com/facebook/react.git',
      'https://www.github.com/nodejs/node/'
    ];
    
    validUrls.forEach(url => {
      expect(validateRepoUrl(url)).toBe(true);
    });
  });
});
```

#### Test Case 2: URL Normalization
```javascript
test('should normalize URLs correctly', () => {
  const testCases = [
    {
      input: 'https://github.com/microsoft/vscode/',
      expected: { owner: 'microsoft', repo: 'vscode' }
    },
    {
      input: 'https://github.com/facebook/react.git',
      expected: { owner: 'facebook', repo: 'react' }
    }
  ];
  
  testCases.forEach(({ input, expected }) => {
    expect(extractRepoInfo(input)).toEqual(expected);
  });
});
```

## 🧪 Local Development Testing Checklist

### Pre-Development Setup Tests
- [ ] Node.js version 18+ installed
- [ ] Backend dependencies install without errors
- [ ] Frontend dependencies install without errors
- [ ] Environment files created from examples
- [ ] GitHub token configured (if available)

### Application Startup Tests
```bash
# Run these commands and verify expected behavior:

# 1. Backend startup test
cd backend && npm run dev
# Expected: Server starts on port 3000, no errors in console

# 2. Frontend startup test  
cd frontend && npm run dev
# Expected: Development server starts on port 5173, opens browser

# 3. Concurrent startup test
npm run dev
# Expected: Both services start simultaneously

# 4. Health check test
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Functional Testing Scenarios

#### Basic Repository Analysis Tests
Test with these specific repositories to validate comprehensive analysis:

##### 1. JavaScript/React Project
```bash
Repository: https://github.com/facebook/react
Expected Results:
- ✅ Language detected: JavaScript/TypeScript
- ✅ Code Quality score > 70
- ✅ Test files detected
- ✅ Documentation score > 80
- ✅ Active collaboration metrics
- ✅ Security practices identified
```

##### 2. Python Project with Strong Documentation
```bash
Repository: https://github.com/psf/requests
Expected Results:
- ✅ Language detected: Python
- ✅ High readability score (>85)
- ✅ Comprehensive documentation
- ✅ Package management detected
- ✅ Testing framework identified
```

##### 3. Enterprise Go Project
```bash
Repository: https://github.com/kubernetes/kubernetes
Expected Results:
- ✅ Language detected: Go
- ✅ High performance metrics
- ✅ Strong testing practices
- ✅ Release management processes
- ✅ Community health indicators
```

##### 4. Multi-language Project
```bash
Repository: https://github.com/microsoft/vscode
Expected Results:
- ✅ Multiple languages detected
- ✅ Innovation score high (modern frameworks)
- ✅ Maintainability score high
- ✅ Security practices validated
- ✅ Performance optimizations detected
```

##### 5. Well-tested Project
```bash
Repository: https://github.com/jest-community/jest
Expected Results:
- ✅ Testing quality score > 90
- ✅ CI/CD processes identified
- ✅ Code coverage analysis
- ✅ Quality gates detected
```

### API Endpoint Testing

#### 1. Repository Analysis API
```bash
# Test successful analysis
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react"}' \
  | jq '.'

# Expected response structure:
{
  "success": true,
  "data": {
    "total": 78.5,
    "breakdown": {
      "codeQuality": 82.3,
      "readability": 75.6,
      "collaboration": 88.1,
      "innovation": 72.4,
      "maintainability": 85.2,
      "inclusivity": 68.9,
      "security": 90.1,
      "performance": 76.8,
      "testing": 88.7,
      "community": 81.3,
      "codeHealth": 79.5,
      "release": 74.2
    },
    "repositoryInfo": {
      "name": "react",
      "owner": "facebook",
      "description": "...",
      "language": "JavaScript",
      "stars": 100000,
      "forks": 50000
    }
  }
}
```

#### 2. Error Handling Tests
```bash
# Test invalid URL
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "invalid-url"}'

# Expected: Error response with proper message

# Test private repository
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/private/repo"}'

# Expected: Graceful error handling

# Test non-existent repository
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/nonexistent/repo123456"}'

# Expected: Repository not found error
```

#### 3. Rate Limiting Tests
```bash
# Test rate limiting (without GitHub token)
for i in {1..65}; do
  curl -X POST http://localhost:3000/api/analyze \
    -H "Content-Type: application/json" \
    -d '{"repoUrl": "https://github.com/facebook/react"}' &
done

# Expected: Rate limit errors after 60 requests
```

## 📊 Metrics Validation Testing

### All 12 Metrics Must Be Calculated
For every repository analysis, verify these metrics are present:

#### Core Development Metrics (59%)
- [ ] **Code Quality (16%)**: Score calculated, reasoning provided
- [ ] **Collaboration & Activity (15%)**: Contributor data analyzed
- [ ] **Readability & Documentation (12%)**: Documentation quality assessed
- [ ] **Innovation & Creativity (8%)**: Modern practices identified
- [ ] **Maintainability (8%)**: Structure and dependencies evaluated

#### Enterprise-Grade Metrics (41%)
- [ ] **Security & Safety (12%)**: Security practices analyzed
- [ ] **Performance & Scalability (8%)**: Performance indicators found
- [ ] **Testing Quality (6%)**: Test coverage and CI/CD assessed
- [ ] **Inclusivity (5%)**: Accessibility and multilingual support
- [ ] **Community Health (4%)**: Issue management and guidelines
- [ ] **Code Health (4%)**: Technical debt and code smells
- [ ] **Release Management (2%)**: Versioning and release practices

### Metric Calculation Tests
```javascript
describe('Metrics Validation', () => {
  test('should calculate all 12 metrics', async () => {
    const result = await analyzeRepository('https://github.com/facebook/react');
    
    // Verify all metrics are present
    expect(result.breakdown).toHaveProperty('codeQuality');
    expect(result.breakdown).toHaveProperty('readability');
    expect(result.breakdown).toHaveProperty('collaboration');
    expect(result.breakdown).toHaveProperty('innovation');
    expect(result.breakdown).toHaveProperty('maintainability');
    expect(result.breakdown).toHaveProperty('inclusivity');
    expect(result.breakdown).toHaveProperty('security');
    expect(result.breakdown).toHaveProperty('performance');
    expect(result.breakdown).toHaveProperty('testing');
    expect(result.breakdown).toHaveProperty('community');
    expect(result.breakdown).toHaveProperty('codeHealth');
    expect(result.breakdown).toHaveProperty('release');
    
    // Verify scores are within valid range
    Object.values(result.breakdown).forEach(score => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
```

## 🔒 Security Testing Standards

### Environment Security Tests
- [ ] GitHub tokens not exposed in client-side code
- [ ] Environment variables properly loaded
- [ ] CORS configured correctly for production domains
- [ ] Rate limiting active and effective
- [ ] Input sanitization working for all user inputs

### API Security Tests
```bash
# Test CORS headers
curl -H "Origin: https://malicious-site.com" \
  http://localhost:3000/api/analyze

# Expected: CORS policy should block unauthorized origins

# Test input validation
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "<script>alert(\"xss\")</script>"}'

# Expected: Input validation should reject malicious input

# Test rate limiting bypass attempts
curl -X POST http://localhost:3000/api/analyze \
  -H "X-Forwarded-For: 1.2.3.4" \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react"}'

# Expected: Rate limiting should not be bypassable
```

## ⚡ Performance Testing Standards

### Response Time Requirements
- [ ] Repository analysis completes within 30 seconds
- [ ] API health check responds within 100ms
- [ ] Frontend loads within 2 seconds on standard connection
- [ ] Large repositories (>10k files) handle gracefully

### Load Testing
```bash
# Test concurrent requests
ab -n 100 -c 10 http://localhost:3000/health

# Expected: All requests succeed, average response time < 200ms

# Test memory usage during analysis
# Monitor backend memory usage while analyzing large repositories
```

## 🌐 Cross-Browser Testing

### Frontend Compatibility Tests
Test the application on:

#### Desktop Browsers
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest version)
- [ ] Edge (latest version)

#### Mobile Browsers
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Samsung Internet

#### Accessibility Testing
- [ ] Screen reader compatibility (NVDA, JAWS)
- [ ] Keyboard navigation works completely
- [ ] High contrast mode support
- [ ] Text scaling up to 200% works properly

## 🚀 Deployment Testing Standards

### Pre-deployment Checklist
- [ ] All unit tests pass (`npm run test`)
- [ ] Integration tests pass
- [ ] Frontend builds without errors (`npm run build`)
- [ ] Backend starts in production mode
- [ ] Environment variables configured correctly
- [ ] GitHub token has proper permissions

### Production Environment Tests
```bash
# Test production API endpoint
curl https://your-api-domain.com/health

# Test frontend deployment
curl https://your-frontend-domain.com

# Test HTTPS configuration
curl -I https://your-frontend-domain.com

# Expected: Proper SSL certificates and security headers
```

### Post-deployment Validation
- [ ] Application loads correctly in production
- [ ] Repository analysis works with production API
- [ ] Error handling works as expected
- [ ] Performance meets requirements
- [ ] Monitoring and logging active

## 📝 Test Repository Examples

### Comprehensive Test Suite Repositories
Use these repositories for thorough testing:

#### High-Quality Projects
```bash
https://github.com/microsoft/TypeScript    # Large TypeScript project
https://github.com/facebook/react          # Popular React library
https://github.com/nodejs/node             # Core Node.js runtime
https://github.com/kubernetes/kubernetes   # Large Go project
https://github.com/tensorflow/tensorflow   # Multi-language ML project
```

#### Diverse Language Projects
```bash
https://github.com/rust-lang/rust          # Rust language
https://github.com/python/cpython          # Python core
https://github.com/openjdk/jdk             # Java development kit
https://github.com/golang/go               # Go language
https://github.com/dotnet/core             # .NET Core
```

#### Different Project Sizes
```bash
https://github.com/lodash/lodash           # Medium-sized utility library
https://github.com/expressjs/express       # Smaller framework
https://github.com/chromium/chromium       # Very large project
https://github.com/microsoft/vscode        # Large editor project
```

#### Testing Edge Cases
```bash
https://github.com/github/gitignore        # Simple file collection
https://github.com/sindresorhus/awesome    # Documentation-heavy
https://github.com/torvalds/linux          # Extremely large C project
```

## 🔄 Automated Testing Pipeline

### CI/CD Testing Requirements
```yaml
# Example GitHub Actions workflow requirements
test-pipeline:
  - lint-check
  - unit-tests
  - integration-tests
  - security-scan
  - performance-test
  - cross-browser-test
  - deployment-test
```

### Test Coverage Requirements
- **Unit Tests**: Minimum 80% coverage
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: Critical user flows covered
- **Security Tests**: All input vectors tested

## 📋 Testing Checklist Template

### Development Testing Checklist
```markdown
## Local Development Testing

### Setup
- [ ] Dependencies installed successfully
- [ ] Environment variables configured
- [ ] GitHub token configured (optional but recommended)
- [ ] Applications start without errors

### Basic Functionality
- [ ] Frontend loads at http://localhost:5173
- [ ] Backend responds at http://localhost:3000
- [ ] Health check returns 200 status
- [ ] CORS working between frontend and backend

### Repository Analysis Testing
- [ ] Valid GitHub URL accepted
- [ ] Invalid URLs properly rejected
- [ ] Analysis completes successfully
- [ ] All 12 metrics calculated
- [ ] Results display correctly in UI
- [ ] Error messages are user-friendly

### Edge Case Testing
- [ ] Large repositories handle gracefully
- [ ] Private repositories show proper error
- [ ] Non-existent repositories handled
- [ ] Network timeouts handled properly
- [ ] Rate limiting works and shows proper messages

### Performance Testing
- [ ] Analysis completes within 30 seconds
- [ ] UI remains responsive during analysis
- [ ] Memory usage stays reasonable
- [ ] No memory leaks detected

### Security Testing
- [ ] GitHub token not exposed in client
- [ ] Input validation working
- [ ] CORS properly configured
- [ ] No XSS vulnerabilities

### Browser Testing
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Mobile responsive
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
```

## 🆘 Troubleshooting Testing Issues

### Common Testing Problems

#### GitHub API Rate Limiting
```bash
# Problem: Tests fail due to rate limiting
# Solution: Configure GitHub token for testing
export GITHUB_TOKEN=your_test_token

# Or use test doubles/mocks for unit tests
```

#### Network Issues
```bash
# Problem: Tests fail due to network connectivity
# Solution: Implement proper timeout handling and retry logic
```

#### Cross-Platform Issues
```bash
# Problem: Tests fail on different operating systems
# Solution: Use platform-agnostic file paths and commands
```

### Test Environment Setup Issues
- **Node.js Version**: Ensure Node.js 18+ is installed
- **Port Conflicts**: Check if ports 3000 and 5173 are available
- **Permission Issues**: Ensure proper file system permissions
- **Network Configuration**: Verify firewall and proxy settings

---

## 📚 Testing Resources

### Testing Tools and Libraries
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **Supertest**: API testing
- **Playwright**: E2E testing
- **Lighthouse**: Performance testing

### Monitoring and Analytics
- **Error Tracking**: Implement error monitoring
- **Performance Monitoring**: Track API response times
- **User Analytics**: Monitor user interactions
- **Health Checks**: Automated uptime monitoring

---

**This testing standard ensures that Vibe AI maintains enterprise-grade quality and reliability across all environments and use cases.** 