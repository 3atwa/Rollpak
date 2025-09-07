// API Configuration
// Copy this file to api.local.ts and add your actual API keys

export const API_CONFIG = {
  // Brevo API Configuration
  BREVO_API_KEY: process.env.REACT_APP_BREVO_API_KEY || '',
  
  // WhatsApp API Configuration (optional)
  WHATSAPP_ACCESS_TOKEN: process.env.REACT_APP_WHATSAPP_ACCESS_TOKEN || '',
  WHATSAPP_PHONE_NUMBER_ID: process.env.REACT_APP_WHATSAPP_PHONE_NUMBER_ID || '',
  
  // Email Configuration
  FROM_EMAIL: 'Messaging System',
  FROM_EMAIL_ADDRESS: 'hassoum850@gmail.com',
  FROM_EMAIL_NAME: 'Messaging System',
  
  // WhatsApp Configuration
  WHATSAPP_API_URL: 'https://graph.facebook.com/v17.0', // WhatsApp Business API URL
};

// Instructions for setup:
/*
1. Create a .env file in your project root with the following variables:
   REACT_APP_BREVO_API_KEY=your_brevo_api_key_here
   REACT_APP_WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token_here
   REACT_APP_WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id_here

2. For Brevo (formerly Sendinblue):
   - Sign up at https://www.brevo.com (FREE: 300 emails/day)
   - Get your API key from Settings → API Keys
   - Verify your sender email address
   - No domain verification required for basic usage

3. For WhatsApp Business API:
   - Set up a WhatsApp Business account
   - Get access token and phone number ID from Meta for Developers
   - Update the API URL if using a different version

4. Update the FROM_EMAIL_ADDRESS and FROM_EMAIL_NAME with your details
*/
