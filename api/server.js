import "dotenv/config";
import express from 'express';
import cors from 'cors';
import { Resend } from "resend";
import commentsRoutes from './routes/comments.js';
import suggestionsRoutes from './routes/suggestions.js';

const app = express();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://marepallisanthosh.engineer', 'https://www.marepallisanthosh.engineer']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Contact route (existing functionality)
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        message: "Name, email, and message are required" 
      });
    }

    const emailData = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: ["marepallisanthosh999333@gmail.com"],
      subject: `Portfolio Contact from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    console.log("Email sent successfully:", emailData);
    res.json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Failed to send email:", error);
    res.status(500).json({ 
      message: "Failed to send email",
      error: error.message 
    });
  }
});

// Feedback system routes
app.use('/api/comments', commentsRoutes);
app.use('/api/suggestions', suggestionsRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

// For Vercel serverless function
export default function handler(req, res) {
  return app(req, res);
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}
