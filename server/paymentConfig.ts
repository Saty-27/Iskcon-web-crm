/**
 * Production Payment Configuration
 * This file configures the payment system for live production use
 */

export const PAYMENT_CONFIG = {
  // PayU Live Production Configuration
  PAYU: {
    MODE: 'LIVE',
    BASE_URL: 'https://secure.payu.in',
    PAYMENT_URL: 'https://secure.payu.in/_payment',
    VERIFY_URL: 'https://secure.payu.in/merchant/postservice.php?form=2',
    MERCHANT_KEY: process.env.PAYU_MERCHANT_KEY,
    MERCHANT_SALT: process.env.PAYU_MERCHANT_SALT,
  },
  
  // UPI Production Configuration
  UPI: {
    MODE: 'LIVE',
    MERCHANT_ID: 'iskconjuhu@sbi',
    MERCHANT_NAME: 'ISKCON Juhu',
    CURRENCY: 'INR',
  },
  
  // Notification Configuration
  NOTIFICATIONS: {
    WHATSAPP_ENABLED: true,
    EMAIL_ENABLED: false, // Can be enabled if SENDGRID is configured
    SMS_ENABLED: false,
  },
  
  // Transaction Configuration
  TRANSACTION: {
    MIN_AMOUNT: 1,
    MAX_AMOUNT: 500000, // 5 Lakh limit for online donations
    CURRENCY: 'INR',
    TIMEOUT: 900, // 15 minutes
  },
  
  // Receipt Configuration
  RECEIPT: {
    AUTO_GENERATE: true,
    FORMAT: 'PDF',
    TEMPLATE: 'ISKCON_DONATION',
  }
};

// Validate payment configuration
export function validatePaymentConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!PAYMENT_CONFIG.PAYU.MERCHANT_KEY) {
    errors.push('PAYU_MERCHANT_KEY is required for live payments');
  }
  
  if (!PAYMENT_CONFIG.PAYU.MERCHANT_SALT) {
    errors.push('PAYU_MERCHANT_SALT is required for live payments');
  }
  
  if (!process.env.TWILIO_ACCOUNT_SID) {
    errors.push('TWILIO_ACCOUNT_SID is required for WhatsApp notifications');
  }
  
  if (!process.env.TWILIO_AUTH_TOKEN) {
    errors.push('TWILIO_AUTH_TOKEN is required for WhatsApp notifications');
  }
  
  if (!process.env.TWILIO_PHONE_NUMBER) {
    errors.push('TWILIO_PHONE_NUMBER is required for WhatsApp notifications');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export default PAYMENT_CONFIG;