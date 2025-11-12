#!/bin/bash

# VPS Twilio Fix Script
# This script copies the fixed Twilio configuration to your VPS

echo "=== ISKCON Juhu VPS Twilio Fix ==="
echo "Copying fixed invoice service..."

# Create the fixed invoiceService.ts content
cat > server/services/invoiceService.ts << 'EOF'
/**
 * Invoice Service
 * 
 * Provides functionality for generating PDF receipts and sending them via WhatsApp
 */

import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import twilio from 'twilio';
import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

// Initialize Twilio client with environment variables (only if credentials are valid)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && 
  process.env.TWILIO_AUTH_TOKEN && 
  process.env.TWILIO_ACCOUNT_SID.startsWith('AC') && 
  process.env.TWILIO_AUTH_TOKEN.length > 0
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

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
  
  doc.moveDown();
  
  // Add receipt details
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Receipt Details', { underline: true });
  
  doc.moveDown();
  
  // Receipt information
  doc.fontSize(12)
     .font('Helvetica')
     .text(`Invoice Number: ${donation.invoiceNumber}`)
     .text(`Transaction ID: ${donation.txnid}`)
     .text(`Date: ${donation.date.toLocaleDateString()}`)
     .text(`Amount: ₹${donation.amount}`)
     .text(`Payment Method: ${donation.paymentMethod}`)
     .text(`Purpose: ${donation.purpose}`);
  
  doc.moveDown();
  
  // Donor information
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Donor Information', { underline: true });
  
  doc.moveDown();
  
  doc.fontSize(12)
     .font('Helvetica')
     .text(`Name: ${donation.name}`)
     .text(`Email: ${donation.email}`)
     .text(`Phone: ${donation.phone}`);
  
  doc.moveDown();
  
  // Thank you message
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Thank You!', { align: 'center' });
  
  doc.fontSize(12)
     .font('Helvetica')
     .text('Your donation helps us serve the community better.', { align: 'center' });
  
  doc.moveDown();
  
  // Footer
  doc.fontSize(10)
     .font('Helvetica')
     .text('This is a computer-generated receipt.', { align: 'center' });
}

/**
 * Sends receipt via WhatsApp to the donor
 * 
 * @param donation Donation details
 * @param pdfBuffer PDF receipt as buffer
 */
export async function sendReceiptViaWhatsApp(donation: DonationReceipt, pdfBuffer: Buffer): Promise<void> {
  if (!twilioClient) {
    console.log('WhatsApp service not configured - skipping receipt delivery');
    return;
  }

  try {
    // Save PDF to temporary file
    const tempFilePath = path.join(process.cwd(), 'temp', `receipt-${donation.txnid}.pdf`);
    
    // Ensure temp directory exists
    await fs.mkdir(path.dirname(tempFilePath), { recursive: true });
    
    // Write PDF to file
    await fs.writeFile(tempFilePath, pdfBuffer);
    
    const phoneNumber = donation.phone.startsWith('+') ? donation.phone : `+91${donation.phone}`;
    
    // Send WhatsApp message with PDF attachment
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${phoneNumber}`,
      body: `🕉️ Hare Krishna ${donation.name}!\n\nThank you for your donation of ₹${donation.amount} to ISKCON Juhu.\n\nYour receipt is attached.\n\nTxn ID: ${donation.txnid}\nDate: ${donation.date.toLocaleDateString()}\n\nJai Srila Prabhupada!`,
      mediaUrl: [`file://${tempFilePath}`]
    });
    
    // Clean up temporary file
    await fs.unlink(tempFilePath);
    
    console.log(`Receipt sent via WhatsApp to ${phoneNumber}`);
  } catch (error) {
    console.error('Error sending WhatsApp receipt:', error);
    throw error;
  }
}

/**
 * Generates and sends donation receipt
 * 
 * @param donation Donation details
 */
export async function processReceipt(donation: DonationReceipt): Promise<void> {
  try {
    // Generate PDF
    const pdfBuffer = await generateDonationPDF(donation);
    
    // Send via WhatsApp if configured
    if (twilioClient) {
      await sendReceiptViaWhatsApp(donation, pdfBuffer);
    } else {
      console.log('WhatsApp not configured - receipt generated but not sent');
    }
    
    console.log(`Receipt processed for donation ${donation.txnid}`);
  } catch (error) {
    console.error('Error processing receipt:', error);
    throw error;
  }
}
EOF

echo "Fixed invoice service file created!"
echo ""
echo "Now run these commands in your VPS terminal:"
echo "1. npm run build"
echo "2. pm2 restart iskcon-juhu"
echo "3. pm2 logs iskcon-juhu --lines 10"
echo ""
echo "This will fix the Twilio error and get your application running!"