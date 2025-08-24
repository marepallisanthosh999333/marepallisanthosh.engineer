import "dotenv/config";
import { Resend } from "resend";
import {
  getComments,
  addComment,
  toggleCommentLike,
  checkCommentLike
} from './controllers/comments.js';
import {
  getSuggestions,
  addSuggestion,
  toggleSuggestionVote,
  checkSuggestionVote,
  updateSuggestionStatus
} from './controllers/suggestions.js';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Stats handler function
async function handleStatsRequest(req, res) {
  if (req.method === 'GET') {
    try {
      // Return demo stats for now - in production this would query Firebase
      const stats = {
        totalComments: 0,
        totalSuggestions: 0,
        totalLikes: 0,
        recentActivity: 0,
        averageRating: 0,
        lastUpdated: new Date().toISOString(),
      };
      
      res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch feedback statistics' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Route handler for comments
async function handleCommentsRoute(req, res) {
  const urlParts = req.url.split('/');
  const method = req.method;
  
  if (method === 'GET' && urlParts.length === 4) {
    // GET /api/feedback/comments or /api/comments
    return getComments(req, res);
  } else if (method === 'POST' && urlParts.length === 4) {
    // POST /api/feedback/comments or /api/comments
    return addComment(req, res);
  } else if (urlParts.length === 6 && urlParts[5] === 'like') {
    // /api/feedback/comments/:id/like or /api/comments/:id/like
    const commentId = urlParts[4];
    req.params = { commentId };
    
    if (method === 'POST') {
      return toggleCommentLike(req, res);
    } else if (method === 'GET') {
      return checkCommentLike(req, res);
    }
  }
  
  return res.status(404).json({ success: false, error: 'Route not found' });
}

// Route handler for suggestions
async function handleSuggestionsRoute(req, res) {
  const urlParts = req.url.split('/');
  const method = req.method;
  
  if (method === 'GET' && urlParts.length === 4) {
    // GET /api/feedback/suggestions or /api/suggestions
    return getSuggestions(req, res);
  } else if (method === 'POST' && urlParts.length === 4) {
    // POST /api/feedback/suggestions or /api/suggestions
    return addSuggestion(req, res);
  } else if (urlParts.length === 6 && urlParts[5] === 'vote') {
    // /api/feedback/suggestions/:id/vote or /api/suggestions/:id/vote
    const suggestionId = urlParts[4];
    req.params = { suggestionId };
    
    if (method === 'POST') {
      return toggleSuggestionVote(req, res);
    } else if (method === 'GET') {
      return checkSuggestionVote(req, res);
    }
  } else if (urlParts.length === 6 && urlParts[5] === 'status') {
    // PUT /api/feedback/suggestions/:id/status or /api/suggestions/:id/status
    const suggestionId = urlParts[4];
    req.params = { suggestionId };
    
    if (method === 'PUT') {
      return updateSuggestionStatus(req, res);
    }
  }
  
  return res.status(404).json({ success: false, error: 'Route not found' });
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req;

  // Route to different handlers based on URL
  if (url.startsWith('/api/feedback/comments') || url.startsWith('/api/comments')) {
    return handleCommentsRoute(req, res);
  } else if (url.startsWith('/api/feedback/suggestions') || url.startsWith('/api/suggestions')) {
    return handleSuggestionsRoute(req, res);
  } else if (url.startsWith('/api/feedback/stats')) {
    return handleStatsRequest(req, res);
  } else if (url === '/api/contact') {
    // Handle contact form (existing functionality)
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

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
  } else {
    // 404 for unknown routes
    return res.status(404).json({ 
      success: false, 
      error: 'Route not found' 
    });
  }
}
