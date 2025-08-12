import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './e2e',
  
  // Test match pattern
  testMatch: '**/*.spec.js',
  
  // Maximum time for each test
  timeout: 30 * 1000,
  
  // Maximum time for the entire test run
  globalTimeout: 10 * 60 * 1000,
  
  // Number of parallel workers
  workers: process.env.CI ? 2 : 4,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  
  // Shared test configuration
  use: {
    // Base URL for the application
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    
    // Artifact collection
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Browser context options
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
    
    // Action timeout
    actionTimeout: 15 * 1000,
    
    // Navigation timeout
    navigationTimeout: 30 * 1000,
  },
  
  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Custom Chrome launch options
        launchOptions: {
          args: ['--disable-blink-features=AutomationControlled']
        }
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],
  
  // Run local dev server before tests
  webServer: {
    command: 'npm run dev',
    port: 5173,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    cwd: './frontend',
    env: {
      NODE_ENV: 'test'
    }
  },
  
  // Folder for test artifacts
  outputDir: 'test-results',
  
  // Retry failed tests
  retries: process.env.CI ? 2 : 1,
  
  // Maximum failures before stopping
  maxFailures: process.env.CI ? 10 : 0,
  
  // Quiet mode for CI
  quiet: !!process.env.CI,
  
  // Forbid test.only in CI
  forbidOnly: !!process.env.CI,
  
  // Global setup/teardown
  globalSetup: './e2e/global-setup.js',
  globalTeardown: './e2e/global-teardown.js',
}); 