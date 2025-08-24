import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendCommentNotification = async (comment) => {
  try {
    const emailData = await resend.emails.send({
      from: "Portfolio Feedback <onboarding@resend.dev>",
      to: ["marepallisanthosh999333@gmail.com"],
      subject: `New Comment: ${comment.rating}/5 stars`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #f39c12; padding-bottom: 10px;">
            New Portfolio Comment
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="background: #f39c12; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px;">
                ${comment.isAnonymous ? 'A' : comment.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <strong>${comment.author}</strong>
                ${!comment.isAnonymous ? `<br><small style="color: #666;">${comment.email}</small>` : ''}
                <br><small style="color: #666;">Rating: ${'★'.repeat(comment.rating)}${'☆'.repeat(5 - comment.rating)} (${comment.rating}/5)</small>
              </div>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #f39c12;">
              <p style="margin: 0; line-height: 1.6;">${comment.content}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://marepallisanthosh.engineer/#feedback" 
               style="background: #f39c12; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View on Website
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="text-align: center; color: #666; font-size: 12px;">
            This notification was sent because you received a new comment on your portfolio.
          </p>
        </div>
      `,
    });

    console.log("Comment notification sent:", emailData);
    return emailData;
  } catch (error) {
    console.error("Failed to send comment notification:", error);
    throw error;
  }
};

export const sendSuggestionNotification = async (suggestion) => {
  try {
    const emailData = await resend.emails.send({
      from: "Portfolio Feedback <onboarding@resend.dev>",
      to: ["marepallisanthosh999333@gmail.com"],
      subject: `New Feature Suggestion: ${suggestion.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #f39c12; padding-bottom: 10px;">
            💡 New Feature Suggestion
          </h2>
          
          <div style="background: #fff8dc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f39c12;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="background: #f39c12; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px;">
                ${suggestion.isAnonymous ? 'A' : suggestion.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <strong>${suggestion.author}</strong>
                ${!suggestion.isAnonymous ? `<br><small style="color: #666;">${suggestion.email}</small>` : ''}
              </div>
            </div>
            
            <h3 style="color: #333; margin: 15px 0 10px 0;">${suggestion.title}</h3>
            
            <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #f39c12;">
              <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${suggestion.description}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://marepallisanthosh.engineer/#feedback" 
               style="background: #f39c12; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
              View Suggestion
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="text-align: center; color: #666; font-size: 12px;">
            This notification was sent because you received a new feature suggestion on your portfolio.
          </p>
        </div>
      `,
    });

    console.log("Suggestion notification sent:", emailData);
    return emailData;
  } catch (error) {
    console.error("Failed to send suggestion notification:", error);
    throw error;
  }
};
