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
}

/**
 * Generates PDF receipt for a donation
 * 
 * @param donation Donation details
 * @returns Buffer containing the PDF data
 */
export async function generateDonationPDF(donation: DonationReceipt): Promise<Buffer> {
  // Create a PDF document
  const doc = new PDFDocument({ margin: 50 });
  
  // Collect PDF output to buffer
  const buffers: Buffer[] = [];
  doc.on('data', buffers.push.bind(buffers));
  
  // Set up the PDF
  await setupPDF(doc, donation);
  
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
 * Set up the PDF document with donation receipt content
 * 
 * @param doc PDF Document
 * @param donation Donation details
 */
async function setupPDF(doc: PDFKit.PDFDocument, donation: DonationReceipt) {
  // Add title 
  doc.fontSize(20)
     .font('Helvetica-Bold')
     .text('DONATION RECEIPT', { align: 'center' });
  
  doc.moveDown();
  
  // Add ISKCON Logo (would use an actual logo in production)
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('ISKCON JUHU', { align: 'center' });
  
  doc.fontSize(12)
     .font('Helvetica')
     .text('Hare Krishna Land, Juhu, Mumbai - 400049', { align: 'center' });
  
  doc.moveDown(2);
  
  // Add receipt number and date
  doc.font('Helvetica-Bold')
     .text(`Receipt Number: ${donation.invoiceNumber}`, { align: 'right' });
  
  doc.font('Helvetica')
     .text(`Date: ${donation.date.toLocaleDateString()}`, { align: 'right' });
  
  doc.moveDown(2);
  
  // Add donation details
  doc.font('Helvetica-Bold')
     .text('Donation Details', { underline: true });
  
  doc.moveDown(0.5);
  
  // Add donor information
  doc.font('Helvetica')
     .text(`Donor Name: ${donation.name}`);
  
  if (donation.email) {
    doc.text(`Email: ${donation.email}`);
  }
  
  if (donation.phone) {
    doc.text(`Phone: ${donation.phone}`);
  }
  
  doc.moveDown();
  
  // Add donation purpose and amount
  doc.text(`Purpose: ${donation.purpose}`);
  doc.text(`Amount: ₹${donation.amount.toFixed(2)}`);
  doc.text(`Payment Method: ${donation.paymentMethod}`);
  doc.text(`Transaction ID: ${donation.txnid}`);
  
  doc.moveDown(2);
  
  // Add thank you message
  doc.font('Helvetica-Bold')
     .fillColor('#553c9a')
     .text('Thank You for Your Generous Contribution!', { align: 'center' });
  
  doc.font('Helvetica')
     .fillColor('black')
     .text('Your support helps us serve Krishna and His devotees.', { align: 'center' });
  
  doc.moveDown();
  
  // Add footer
  doc.fontSize(8)
     .text('This is an electronically generated receipt and does not require a signature.', { align: 'center' });
  
  doc.moveDown(0.5);
  
  doc.fontSize(8)
     .text('For any queries related to your donation, please contact us at donations@iskconjuhu.in', { align: 'center' });
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