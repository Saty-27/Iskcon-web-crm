/**
 * UPI Payment Service
 * Provides functionality for handling UPI payments
 */

import { nanoid } from 'nanoid';

export interface UpiIntentParams {
  upiId: string;
  txnid: string;
  amount: number;
}

/**
 * Generate a UPI intent URL for mobile UPI apps
 * @param params UPI intent parameters
 * @returns UPI intent URL
 */
export function generateUpiIntent(params: UpiIntentParams): string {
  const { upiId, txnid, amount } = params;
  
  // Encode all parameters for URL safety
  const encodedParams = new URLSearchParams({
    pa: upiId || 'iskconjuhu@sbi', // Use provided UPI ID or default to ISKCON Juhu UPI
    pn: 'ISKCON Juhu',     // Name of the payee
    tr: txnid,             // Transaction ID
    am: amount.toString(), // Amount
    cu: 'INR',             // Currency
    tn: `Donation to ISKCON Juhu (${txnid})`, // Transaction note
  }).toString();
  
  // Return a UPI intent URL which will open a UPI app on mobile devices
  return `upi://pay?${encodedParams}`;
}

/**
 * Generate a UPI QR code data for displaying on desktop
 * @param params UPI intent parameters
 * @returns Promise resolving to QR code data URL
 */
export async function generateUpiQrData(params: UpiIntentParams): Promise<string> {
  const { txnid, amount, upiId } = params;
  
  // Generate UPI intent URL for QR code
  const encodedParams = new URLSearchParams({
    pa: upiId || 'iskconjuhu@sbi', // Use provided UPI ID or default to ISKCON Juhu UPI
    pn: 'ISKCON Juhu',
    tr: txnid,
    am: amount.toString(),
    cu: 'INR',
    tn: `Donation to ISKCON Juhu (${txnid})`,
  }).toString();
  
  const upiIntentUrl = `upi://pay?${encodedParams}`;
  
  try {
    // Import QR code library
    const QRCode = await import('qrcode');
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(upiIntentUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#5a189a', // QR code color - ISKCON purple
        light: '#ffffff' // Background color
      }
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code for UPI payment');
  }
}

/**
 * Verify a UPI transaction status
 * @param txnid Transaction ID
 * @returns Verification result
 */
export async function verifyUpiTransaction(txnid: string): Promise<{
  success: boolean;
  status: 'success' | 'pending' | 'failed';
  message: string;
}> {
  // In a real implementation, you would make an API call to your payment provider
  // to check the transaction status. For now, we're just simulating the response.
  
  try {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 80% chance of success for testing purposes
    const isSuccess = Math.random() < 0.8;
    
    if (isSuccess) {
      return {
        success: true,
        status: 'success',
        message: 'Transaction completed successfully'
      };
    } else {
      return {
        success: false,
        status: 'failed',
        message: 'Transaction failed or was canceled by the user'
      };
    }
  } catch (error) {
    console.error('UPI verification error:', error);
    return {
      success: false,
      status: 'pending',
      message: 'Unable to verify transaction status'
    };
  }
}