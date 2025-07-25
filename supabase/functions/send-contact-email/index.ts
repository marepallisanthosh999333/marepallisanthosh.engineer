const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const data: ContactFormData = await req.json();
    const { name, email, subject, message, clientInfo, recipientEmail } = data;

    // Create HTML email content
    const htmlContent = createEmailHTML({
      name,
      email,
      subject,
      message,
      clientInfo
    });

    // Create plain text version
    const textContent = createEmailText({
      name,
      email,
      subject,
      message,
      clientInfo
    });

    // Send email using Resend API
    const emailResponse = await sendEmail({
      to: recipientEmail,
      from: 'Portfolio Contact <onboarding@resend.dev>',
      replyTo: email,
      subject: `[PORTFOLIO] ${subject} - From ${name}`,
      html: htmlContent,
      text: textContent
    });

    if (!emailResponse.success) {
      throw new Error('Failed to send email');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully!' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to send email. Please try again.' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  clientInfo: {
    ip: string;
    userAgent: string;
    timestamp: string;
    location?: {
      city: string;
      region: string;
      country: string;
      timezone: string;
    };
  };
  recipientEmail: string;
}

async function sendEmail(emailData: {
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
}) {
  try {
    console.log('Sending email to:', emailData.to);
    console.log('From:', emailData.from);
    console.log('Subject:', emailData.subject);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      throw new Error(`Resend API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
}

function createEmailHTML(data: Omit<ContactFormData, 'recipientEmail'>) {
  const { name, email, subject, message, clientInfo } = data;
  const locationStr = clientInfo.location 
    ? `${clientInfo.location.city}, ${clientInfo.location.region}, ${clientInfo.location.country} (${clientInfo.location.timezone})`
    : 'Location unavailable';

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>New Contact Form Submission</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f5f5f5;
        }
        .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white; 
            border-radius: 12px; 
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
            background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
            color: white; 
            padding: 30px 20px; 
            text-align: center;
        }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px 20px; }
        .field { 
            margin-bottom: 20px; 
            border-bottom: 1px solid #e5e7eb; 
            padding-bottom: 15px;
        }
        .field:last-child { border-bottom: none; margin-bottom: 0; }
        .label { 
            font-weight: 600; 
            color: #374151; 
            margin-bottom: 8px; 
            display: block;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .value { 
            background: #f9fafb; 
            padding: 12px 16px; 
            border-radius: 8px; 
            border: 1px solid #e5e7eb;
            font-size: 15px;
            word-wrap: break-word;
        }
        .message-value {
            min-height: 60px;
            white-space: pre-wrap;
        }
        .technical-info { 
            background: #fef3c7; 
            padding: 20px; 
            border-radius: 8px; 
            margin-top: 25px;
            border-left: 4px solid #f59e0b;
        }
        .technical-info h3 { 
            margin: 0 0 15px 0; 
            color: #92400e; 
            font-size: 16px;
        }
        .footer { 
            background: #1f2937; 
            color: white; 
            padding: 20px; 
            text-align: center; 
        }
        .footer p { margin: 5px 0; }
        .reply-button {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 10px;
            font-weight: 500;
        }
        .icon { margin-right: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 New Contact Form Submission</h1>
            <p>You have received a new message through your portfolio website!</p>
        </div>
        
        <div class="content">
            <div class="field">
                <span class="label">👤 Name</span>
                <div class="value">${name}</div>
            </div>
            
            <div class="field">
                <span class="label">📧 Email</span>
                <div class="value"><a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></div>
            </div>
            
            <div class="field">
                <span class="label">📋 Subject</span>
                <div class="value">${subject}</div>
            </div>
            
            <div class="field">
                <span class="label">💬 Message</span>
                <div class="value message-value">${message}</div>
            </div>
            
            <div class="technical-info">
                <h3>📊 Technical Details</h3>
                
                <div class="field">
                    <span class="label">🌐 IP Address</span>
                    <div class="value">${clientInfo.ip}</div>
                </div>
                
                <div class="field">
                    <span class="label">📍 Location</span>
                    <div class="value">${locationStr}</div>
                </div>
                
                <div class="field">
                    <span class="label">🕒 Timestamp</span>
                    <div class="value">${clientInfo.timestamp}</div>
                </div>
                
                <div class="field">
                    <span class="label">🖥️ User Agent</span>
                    <div class="value" style="word-break: break-all; font-size: 13px;">${clientInfo.userAgent}</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Reply directly to this email to respond to ${name}</strong></p>
            <a href="mailto:${email}" class="reply-button">Reply to ${name}</a>
            <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">
                This email was automatically generated from your portfolio contact form.
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

function createEmailText(data: Omit<ContactFormData, 'recipientEmail'>) {
  const { name, email, subject, message, clientInfo } = data;
  const locationStr = clientInfo.location 
    ? `${clientInfo.location.city}, ${clientInfo.location.region}, ${clientInfo.location.country} (${clientInfo.location.timezone})`
    : 'Location unavailable';

  return `
NEW CONTACT FORM SUBMISSION

From: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Technical Details:
IP Address: ${clientInfo.ip}
Location: ${locationStr}
Timestamp: ${clientInfo.timestamp}
User Agent: ${clientInfo.userAgent}

---
Reply directly to this email to respond to ${name}.
  `;
}
