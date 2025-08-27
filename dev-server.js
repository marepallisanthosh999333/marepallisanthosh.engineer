import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
// Restrict allowed origins via comma-separated env `ALLOWED_ORIGINS`, fallback to common dev origins
const rawAllowed = process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://localhost:3000';
const allowedOrigins = rawAllowed.split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser tools (no origin) and allowedOrigins
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
}));

// Limit JSON body size to mitigate large payload abuse
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Simple in-memory rate limiter (dev-friendly)
const rateWindowMs = parseInt(process.env.RATE_WINDOW_MS || String(15 * 60 * 1000), 10); // 15 minutes
const rateMax = parseInt(process.env.RATE_MAX || '300', 10); // requests per window per IP
const rateMap = new Map();
app.use((req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateMap.get(ip) || { count: 0, start: now };
    if (now - entry.start > rateWindowMs) {
      entry.count = 1;
      entry.start = now;
    } else {
      entry.count++;
    }
    rateMap.set(ip, entry);
    if (entry.count > rateMax) {
      res.status(429).json({ success: false, error: 'Too many requests' });
      return;
    }
  } catch (e) {
    // swallow rate limiter errors
  }
  next();
});

// Use helmet for common security headers
app.use(helmet());

// Use express-rate-limit as a production-capable limiter (complements the simple limiter above)
const apiLimiter = rateLimit({
  windowMs: rateWindowMs,
  max: rateMax,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Import the main API handler
const { default: apiHandler } = await import('./api/index.js');

// Route all /api requests to our API handler
app.all('/api/*', (req, res) => {
  // Sanitize headers before logging to avoid leaking Authorization/Cookie values
  const sanitizedHeaders = { ...req.headers };
  if (sanitizedHeaders.authorization) sanitizedHeaders.authorization = '[REDACTED]';
  if (sanitizedHeaders.cookie) sanitizedHeaders.cookie = '[REDACTED]';

  const bodyPreview = (() => {
    try {
      if (!req.body) return undefined;
      const s = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      return s.length > 1000 ? `${s.slice(0, 1000)}...[truncated:${s.length}]` : s;
    } catch (e) {
      return '[unserializable body]';
    }
  })();

  console.log(`📨 API Request: ${req.method} ${req.originalUrl}`);
  console.log('�️ Headers (sanitized):', sanitizedHeaders);
  if (bodyPreview) console.log('📦 Body (preview):', bodyPreview);

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
