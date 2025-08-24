import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import the main API handler
const { default: apiHandler } = await import('./api/index.js');

// Route all /api requests to our API handler
app.all('/api/*', (req, res) => {
  console.log(`📨 API Request: ${req.method} ${req.originalUrl}`);
  console.log('📋 Headers:', req.headers);
  console.log('📦 Body:', req.body);
  
  // Set the URL to match what Vercel expects
  req.url = req.originalUrl;
  return apiHandler(req, res);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Development server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api/*`);
});
