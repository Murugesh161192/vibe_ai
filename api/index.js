import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import analyzeRoutes from '../backend/src/routes/analyze.js';

let app;

async function createApp() {
  if (app) return app;

  app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    }
  });

  // Register CORS plugin
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS']
  });

  // Register rate limiting
  await app.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    timeWindow: parseInt(process.env.RATE_LIMIT_TIME_WINDOW) || 900000,
    errorResponseBuilder: (request, context) => ({
      code: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded, retry in ${context.after}`,
      retryAfter: context.after
    })
  });

  // Health check endpoint
  app.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register API routes
  await app.register(analyzeRoutes, { prefix: '/api' });

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    
    if (error.statusCode === 403 && error.message.includes('rate limit')) {
      reply.status(429).send({
        success: false,
        error: 'GitHub API rate limit exceeded',
        message: 'Too many requests to GitHub API. Please try again later.',
        retryAfter: 3600
      });
      return;
    }

    if (error.validation) {
      reply.status(400).send({
        success: false,
        error: 'Validation Error',
        message: error.message,
        details: error.validation
      });
      return;
    }

    reply.status(error.statusCode || 500).send({
      success: false,
      error: error.name || 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' 
        ? 'An error occurred while processing your request'
        : error.message
    });
  });

  return app;
}

export default async function handler(req, res) {
  const app = await createApp();
  await app.ready();
  
  // Use Fastify's inject method for serverless compatibility
  const response = await app.inject({
    method: req.method,
    url: req.url,
    headers: req.headers,
    payload: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined
  });

  // Set response headers
  Object.keys(response.headers).forEach(key => {
    res.setHeader(key, response.headers[key]);
  });

  // Set status code and send response
  res.status(response.statusCode).send(response.payload);
} 