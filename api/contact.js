import "dotenv/config";
import { Resend } from "resend";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Function to get client IP address
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  );
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only handle POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Name, email, and message are required"
      });
    }

    // Get client information
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const timestamp = new Date().toISOString();
    const ipLookupLink = `https://ipapi.co/${clientIP}/json`;

    const emailData = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: ["marepallisanthosh.999333@gmail.com"],
      subject: subject ? `🎯 ${subject}` : `🎯 New Contact Form Submission`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; }
            .section { margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea; }
            .section h3 { margin: 0 0 15px 0; color: #333; font-size: 18px; }
            .field { margin-bottom: 12px; }
            .label { font-weight: bold; color: #555; display: inline-block; min-width: 120px; }
            .value { color: #333; }
            .message-box { background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd; margin-top: 10px; }
            .tech-details { background: #fff3cd; border-left-color: #ffc107; }
            .footer { background: #2c3e50; color: white; padding: 15px; text-align: center; font-size: 14px; }
            .link { color: #667eea; text-decoration: none; }
            .link:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 New Contact Form Submission</h1>
              <p>Someone reached out through your portfolio website</p>
            </div>

            <div class="content">
              <div class="section">
                <h3>👤 Contact Information</h3>
                <div class="field">
                  <span class="label">Name:</span>
                  <span class="value">${name}</span>
                </div>
                <div class="field">
                  <span class="label">Email:</span>
                  <span class="value"><a href="mailto:${email}" class="link">${email}</a></span>
                </div>
                <div class="field">
                  <span class="label">Subject:</span>
                  <span class="value">${subject || 'Portfolio Contact'}</span>
                </div>
                <div class="field">
                  <span class="label">Message:</span>
                  <div class="message-box">${message}</div>
                </div>
              </div>

              <div class="section tech-details">
                <h3>🔍 Technical Details</h3>
                <div class="field">
                  <span class="label">IP Address:</span>
                  <span class="value">${clientIP}</span>
                </div>
                <div class="field">
                  <span class="label">User Agent:</span>
                  <span class="value">${userAgent}</span>
                </div>
                <div class="field">
                  <span class="label">Timestamp:</span>
                  <span class="value">${timestamp}</span>
                </div>
                <div class="field">
                  <span class="label">Location Lookup:</span>
                  <span class="value"><a href="${ipLookupLink}" target="_blank" class="link">🌍 View Location Details</a></span>
                </div>
              </div>

              <div class="section">
                <h3>📞 Quick Actions</h3>
                <p>
                  <a href="mailto:${email}?subject=Re: Your Portfolio Contact&body=Hi ${name},%0D%0A%0D%0AThank you for reaching out through my portfolio.%0D%0A%0D%0A" class="link">
                    ✉️ Reply to ${name}
                  </a>
                </p>
              </div>
            </div>

            <div class="footer">
              <p>📧 This email was sent from your portfolio contact form</p>
              <p>🌐 Portfolio Website | 🕒 ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailData);
    res.json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Failed to send email:", error);
    res.status(500).json({
      message: "An internal server error occurred while sending the email."
    });
  }
}
