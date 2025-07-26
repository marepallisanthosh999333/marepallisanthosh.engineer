import dotenv from 'dotenv';
import { Resend } from 'resend';

// Load environment variables
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

console.log('🔑 API Key loaded:', process.env.RESEND_API_KEY ? 'Yes' : 'No');
console.log('📧 Testing email send to:', 'marepallisanthosh.999333@gmail.com');

try {
  const emailData = await resend.emails.send({
    from: "Portfolio Contact <onboarding@resend.dev>",
    to: ["marepallisanthosh.999333@gmail.com"],
    subject: "🧪 Test Email from Portfolio Contact Form",
    html: `
      <h2>Test Email</h2>
      <p>This is a test email to verify that your contact form is working properly.</p>
      <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      <p><strong>Status:</strong> If you received this email, your contact form is working! 🎉</p>
    `,
  });

  console.log('✅ Email sent successfully!');
  console.log('📊 Response:', emailData);
} catch (error) {
  console.error('❌ Failed to send email:', error);
  console.error('🔍 Error details:', error.message);
}
