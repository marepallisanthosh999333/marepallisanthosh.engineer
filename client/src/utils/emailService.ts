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
    console.log('Sending contact form with data:', formData);
    
    // Get client information
    const clientInfo = await getClientInfo();
    console.log('Client info:', clientInfo);
    
    // Prepare the submission data
    const submissionData = {
      ...formData,
      clientInfo
    };

    console.log('Sending to local API endpoint: /api/contact');

    // Send to local API endpoint
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    });

    console.log('Response status:', response.status);
    
    const result = await response.json();
    console.log('Response result:', result);
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit contact form');
    }

    return { 
      success: true, 
      message: result.message || 'Thank you for your message! I\'ll get back to you soon.' 
    };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to submit your message. Please try again.' 
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