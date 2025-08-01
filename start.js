#!/usr/bin/env node

// Simple startup script for Render deployment
import('./backend/src/server.js')
  .then(() => {
    console.log('✅ Server started successfully via start.js');
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }); 