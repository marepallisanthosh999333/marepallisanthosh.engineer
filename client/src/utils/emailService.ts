interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ClientInfo {
  ip: string;
  userAgent: string;
  timestamp: string;
  location?: {
    city: string;
    region: string;
    country: string;
    timezone: string;
  };
}

export const sendContactEmail = async (formData: ContactFormData): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Sending email with data:', formData);
    
    // Get client information
    const clientInfo = await getClientInfo();
    console.log('Client info:', clientInfo);
    
    // Prepare the email data
    const emailData = {
      ...formData,
      clientInfo,
      recipientEmail: 'marepallisanthosh.999333@gmail.com'
    };

    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Making request to:', `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`);

    // Send to Supabase Edge Function
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    console.log('Response status:', response.status);
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error('Invalid response from server');
    }
    
    console.log('Response result:', result);
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email');
    }

    return { success: true, message: 'Email sent successfully!' };
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to send email. Please try again.' 
    };
  }
};

const getClientInfo = async (): Promise<ClientInfo> => {
  const timestamp = new Date().toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'long'
  });

  const userAgent = navigator.userAgent;
  
  // Get IP and location info
  let ip = 'Unknown';
  let location = undefined;

  try {
    // Get IP address
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    if (!ipResponse.ok) throw new Error('Failed to get IP');
    const ipData = await ipResponse.json();
    ip = ipData.ip;

    // Get location data
    const locationResponse = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!locationResponse.ok) throw new Error('Failed to get location');
    const locationData = await locationResponse.json();
    
    if (locationData && !locationData.error) {
      location = {
        city: locationData.city || 'Unknown',
        region: locationData.region || 'Unknown',
        country: locationData.country_name || 'Unknown',
        timezone: locationData.timezone || 'Unknown'
      };
    }
  } catch (error) {
    console.error('Error getting client info:', error);
    // Continue with basic info even if IP/location fails
  }

  return {
    ip,
    userAgent,
    timestamp,
    location
  };
};