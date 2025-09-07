import { API_CONFIG } from '../config/api';

// Brevo REST API endpoint
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export interface MessageRecipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface MessageData {
  content: string;
  recipients: MessageRecipient[];
  channels: string[];
}

export interface EmailMessage {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

export interface WhatsAppMessage {
  to: string;
  message: string;
}

class MessagingService {
  private fromEmail = API_CONFIG.FROM_EMAIL;

  async sendEmailBatch(recipients: MessageRecipient[], content: string): Promise<{ success: boolean; error?: string }> {
    try {
      const emailRecipients = recipients.filter(r => r.email);
      
      if (emailRecipients.length === 0) {
        return { success: false, error: 'No valid email recipients found' };
      }

      // Create email data for Brevo REST API
      const emailData = {
        sender: {
          email: API_CONFIG.FROM_EMAIL_ADDRESS,
          name: API_CONFIG.FROM_EMAIL_NAME
        },
        to: emailRecipients.map(recipient => ({
          email: recipient.email!,
          name: recipient.name
        })),
        subject: 'New Message from Messaging System',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Message</h2>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="font-size: 16px; line-height: 1.6; color: #555;">${content}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #888;">
              This message was sent via our messaging system powered by Brevo.
            </p>
          </div>
        `
      };

      // Send email via Brevo REST API
      const response = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_CONFIG.BREVO_API_KEY
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || `HTTP ${response.status}` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  async sendWhatsAppMessage(recipients: MessageRecipient[], content: string): Promise<{ success: boolean; error?: string }> {
    try {
      const phoneRecipients = recipients.filter(r => r.phone);
      
      if (phoneRecipients.length === 0) {
        return { success: false, error: 'No valid phone recipients found' };
      }

      // For now, we'll simulate WhatsApp sending
      // In a real implementation, you would integrate with WhatsApp Business API
      const whatsappMessages: WhatsAppMessage[] = phoneRecipients.map(recipient => ({
        to: recipient.phone!,
        message: content
      }));

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real implementation, you would make actual WhatsApp API calls here
      // Example with WhatsApp Business API:
      /*
      const whatsappApiUrl = `${API_CONFIG.WHATSAPP_API_URL}/${API_CONFIG.WHATSAPP_PHONE_NUMBER_ID}/messages`;
      const accessToken = API_CONFIG.WHATSAPP_ACCESS_TOKEN;
      
      for (const message of whatsappMessages) {
        const response = await fetch(whatsappApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: message.to,
            type: 'text',
            text: { body: message.message }
          })
        });
        
        if (!response.ok) {
          throw new Error(`WhatsApp API error: ${response.statusText}`);
        }
      }
      */

      console.log('WhatsApp messages would be sent:', whatsappMessages);
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  async sendMessage(messageData: MessageData): Promise<{ success: boolean; error?: string; results?: any }> {
    const results = {
      email: { success: false, error: null as string | null },
      whatsapp: { success: false, error: null as string | null }
    };

    try {
      // Send emails if email channel is selected
      if (messageData.channels.includes('email')) {
        const emailResult = await this.sendEmailBatch(messageData.recipients, messageData.content);
        results.email = { success: emailResult.success, error: emailResult.error || null };
      }

      // Send WhatsApp messages if whatsapp channel is selected
      if (messageData.channels.includes('whatsapp')) {
        const whatsappResult = await this.sendWhatsAppMessage(messageData.recipients, messageData.content);
        results.whatsapp = { success: whatsappResult.success, error: whatsappResult.error || null };
      }

      const hasErrors = results.email.error || results.whatsapp.error;
      const hasSuccess = results.email.success || results.whatsapp.success;

      if (hasErrors && !hasSuccess) {
        return { 
          success: false, 
          error: `Email: ${results.email.error || 'N/A'}, WhatsApp: ${results.whatsapp.error || 'N/A'}`,
          results 
        };
      }

      return { success: true, results };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const messagingService = new MessagingService();
