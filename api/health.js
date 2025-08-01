export default function handler(req, res) {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    backend: 'Vercel Serverless',
    environment: process.env.NODE_ENV || 'development'
  });
} 