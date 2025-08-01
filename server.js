import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import analyzeRoutes from './backend/src/routes/analyze.js';

// Create Fastify instance with logging
const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
});

// Register CORS plugin for cross-origin requests
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS']
});

// Register rate limiting plugin
await fastify.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  timeWindow: parseInt(process.env.RATE_LIMIT_TIME_WINDOW) || 900000, // 15 minutes
  errorResponseBuilder: (request, context) => ({
    code: 429,
    error: 'Too Many Requests',
    message: `Rate limit exceeded, retry in ${context.after}`,
    retryAfter: context.after
  })
});

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register API routes
await fastify.register(analyzeRoutes, { prefix: process.env.API_PREFIX || '/api' });

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  // Handle GitHub API rate limiting
  if (error.statusCode === 403 && error.message.includes('rate limit')) {
    reply.status(429).send({
      success: false,
      error: 'GitHub API rate limit exceeded',
      message: 'Too many requests to GitHub API. Please try again later or configure a GitHub token for higher limits.',
      retryAfter: 3600 // 1 hour
    });
    return;
  }

  // Handle validation errors
  if (error.validation) {
    reply.status(400).send({
      success: false,
      error: 'Validation Error',
      message: error.message,
      details: error.validation
    });
    return;
  }

  // Handle general errors
  reply.status(error.statusCode || 500).send({
    success: false,
    error: error.name || 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred while processing your request'
      : error.message
  });
});

// Start function for server deployment
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    const host = '0.0.0.0'; // Always bind to 0.0.0.0 for Render
    
    await fastify.listen({ port, host });
    fastify.log.info(`🚀 Vibe AI Backend server running on http://${host}:${port}`);
    fastify.log.info(`📊 Health check available at http://${host}:${port}/health`);
    fastify.log.info(`🔍 API endpoints available at http://${host}:${port}${process.env.API_PREFIX || '/api'}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Start the server
start(); 