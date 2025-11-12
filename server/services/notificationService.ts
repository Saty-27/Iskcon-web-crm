/**
 * Notification Service
 * 
 * Provides functionality for sending notifications about donation statuses
 */

import twilio from 'twilio';

// Initialize Twilio client with environment variables (only if credentials are available)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

/**
 * Sends a notification about failed payment via WhatsApp
 * 
 * @param phoneNumber Recipient's phone number (with country code)
 * @param donorName Name of the donor
 * @param amount Donation amount
 * @param purpose Purpose of the donation
 * @returns Boolean indicating success
 */
export async function sendFailedPaymentNotification(
  phoneNumber: string, 
  donorName: string,
  amount: number,
  purpose: string
): Promise<boolean> {
  try {
    // Check if Twilio is configured
    if (!twilioClient) {
      console.warn('Twilio not configured - Failed payment notification not sent');
      return false;
    }

    // Format phone number (ensure it has international format with +)
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    
    if (!formattedPhoneNumber) {
      console.error('Invalid phone number format:', phoneNumber);
      return false;
    }
    
    // Send WhatsApp message about failed payment
    await twilioClient!.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${formattedPhoneNumber}`,
      body: `Hare Krishna, ${donorName}! 🙏\n\nWe noticed there was an issue with your donation payment of ₹${amount} towards ${purpose}.\n\nPlease try again or contact our support team if you need assistance. You can visit our website at iskconjuhu.in or call us at +91 9876543210.\n\nThank you for your support.`
    });
    
    console.log(`Failed payment notification sent to WhatsApp number: ${formattedPhoneNumber}`);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return false;
  }
}

/**
 * Formats a phone number for WhatsApp
 * Ensures it has the proper international format with + prefix
 * 
 * @param phone Phone number to format
 * @returns Formatted phone number or null if invalid
 */
function formatPhoneNumber(phone: string): string | null {
  // Remove all non-numeric characters
  const numericPhone = phone.replace(/\D/g, '');
  
  // If the phone doesn't start with '+', add India country code if needed
  if (!phone.startsWith('+')) {
    // If it's an Indian number without country code (10 digits)
    if (numericPhone.length === 10) {
      return `+91${numericPhone}`;
    }
    // If it already has the country code without +
    else if (numericPhone.length > 10) {
      return `+${numericPhone}`;
    }
  } else {
    // If it already has the + prefix, return the numeric version with +
    return `+${numericPhone}`;
  }
  
  return null;
}