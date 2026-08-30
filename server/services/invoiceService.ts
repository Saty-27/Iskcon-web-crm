/**
 * Invoice Service
 * 
 * Provides functionality for generating PDF receipts and sending them via WhatsApp
 */

import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import twilio from 'twilio';

const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

import { drawISKCONReceipt, formatDisplayReceiptNo, type ReceiptDetailData } from './receiptPdfGenerator';

interface DonationReceipt {
  txnid: string;
  amount: number;
  name: string;
  email: string;
  phone: string;
  date: Date;
  paymentMethod: string;
  purpose: string;
  invoiceNumber: string;
  address?: string;
  pin?: string;
  panCard?: string;
}

/**
 * Generates PDF receipt for a donation
 * 
 * @param donation Donation details
 * @returns Buffer containing the PDF data
 */
export async function generateDonationPDF(donation: DonationReceipt): Promise<Buffer> {
  // Create an A4 PDF document with custom margins
  const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });
  
  // Collect PDF output to buffer
  const buffers: Buffer[] = [];
  doc.on('data', buffers.push.bind(buffers));
  
  const receiptDetail: ReceiptDetailData = {
    receiptNo: formatDisplayReceiptNo(donation.invoiceNumber),
    date: donation.date || new Date(),
    amount: donation.amount,
    name: donation.name,
    address: donation.address || '',
    pin: donation.pin || '',
    pan: donation.panCard || '',
    mobile: donation.phone,
    email: donation.email,
    paymentMode: donation.paymentMethod || 'Online / UPI',
    paymentDetails: donation.txnid,
    purpose: donation.purpose || 'General Donation'
  };

  drawISKCONReceipt(doc, receiptDetail);
  
  // Finish the PDF
  doc.end();
  
  // Return PDF as buffer
  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
  });
}

/**
 * Sends a donation receipt via WhatsApp
 * 
 * @param phoneNumber Recipient's phone number (with country code)
 * @param donationData Donation details
 * @returns Boolean indicating success
 */
export async function sendWhatsAppReceipt(phoneNumber: string, donationData: DonationReceipt): Promise<boolean> {
  try {
    // Check if Twilio is configured
    if (!twilioClient) {
      console.warn('Twilio not configured - WhatsApp receipt not sent');
      return false;
    }

    // Format phone number (ensure it has international format with +)
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    
    if (!formattedPhoneNumber) {
      console.error('Invalid phone number format:', phoneNumber);
      return false;
    }
    
    // Generate the PDF
    const pdfBuffer = await generateDonationPDF(donationData);
    
    // Create a temporary file path
    const tempFileName = `donation_receipt_${nanoid()}.pdf`;
    const tempFilePath = path.join('/tmp', tempFileName);
    
    // Write PDF to a temporary file
    await fs.writeFile(tempFilePath, pdfBuffer);
    
    // Send WhatsApp message with PDF
    await twilioClient!.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${formattedPhoneNumber}`,
      body: `Hare Krishna, ${donationData.name}! 🙏\n\nThank you for your donation of ₹${donationData.amount} towards ${donationData.purpose}.\n\nPlease find attached your donation receipt.`,
      mediaUrl: [`https://${process.env.REPLIT_DOMAINS?.split(',')[0]}/api/receipts/${tempFileName}`],
    });
    
    console.log(`Donation receipt sent to WhatsApp number: ${formattedPhoneNumber}`);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp receipt:', error);
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

/**
 * Generates a unique invoice number
 * 
 * @returns Unique invoice number string
 */
export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2); // Last 2 digits of year
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `INV-${year}${month}-${random}`;
}