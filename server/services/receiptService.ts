import PDFKit from 'pdfkit';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

import { drawISKCONReceipt, formatDisplayReceiptNo, type ReceiptDetailData } from './receiptPdfGenerator';

export interface ReceiptData {
  txnid: string;
  amount: number;
  name: string;
  email: string;
  phone: string;
  purpose: string;
  invoiceNumber: string;
  date: Date;
  panCard?: string;
  address?: string;
  pin?: string;
  paymentMethod?: string;
}

// Create email transporter (using Gmail SMTP - you'll need to configure this)
const createEmailTransporter = () => {
  // For production, use environment variables for email configuration
  return nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER || 'donations@iskconjuhu.org',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
  });
};

export async function generatePDFReceipt(receiptData: ReceiptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFKit({ size: 'A4', margin: 0, autoFirstPage: true });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const receiptDetail: ReceiptDetailData = {
        receiptNo: formatDisplayReceiptNo(receiptData.invoiceNumber),
        date: receiptData.date || new Date(),
        amount: receiptData.amount,
        name: receiptData.name,
        address: receiptData.address || '',
        pin: receiptData.pin || '',
        pan: receiptData.panCard || '',
        mobile: receiptData.phone,
        email: receiptData.email,
        paymentMode: receiptData.paymentMethod || 'Online / UPI',
        paymentDetails: receiptData.txnid,
        purpose: receiptData.purpose || 'General Donation'
      };

      drawISKCONReceipt(doc, receiptDetail);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function sendReceiptEmail(receiptData: ReceiptData, pdfBuffer: Buffer): Promise<boolean> {
  try {
    const transporter = createEmailTransporter();

    const mailOptions = {
      from: 'ISKCON Juhu <donations@iskconjuhu.org>',
      to: receiptData.email,
      subject: `Donation Receipt - ${receiptData.invoiceNumber} | ISKCON Juhu`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF6B35, #F7931E); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🙏 ISKCON JUHU</h1>
            <p style="margin: 10px 0 0; font-size: 16px;">Hare Krishna Land, Mumbai</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #FF6B35; margin-bottom: 20px;">Thank You for Your Donation!</h2>
            
            <p>Dear ${receiptData.name},</p>
            
            <p>We are deeply grateful for your generous contribution of <strong>₹${receiptData.amount.toLocaleString('en-IN')}</strong> to ISKCON Juhu.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #FF6B35; margin-top: 0;">Donation Details:</h3>
              <p><strong>Receipt No:</strong> ${receiptData.invoiceNumber}</p>
              <p><strong>Transaction ID:</strong> ${receiptData.txnid}</p>
              <p><strong>Date:</strong> ${receiptData.date.toLocaleDateString('en-IN')}</p>
              <p><strong>Purpose:</strong> ${receiptData.purpose}</p>
              <p><strong>Amount:</strong> ₹${receiptData.amount.toLocaleString('en-IN')}</p>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1976d2;"><strong>📋 Tax Benefit Information:</strong></p>
              <p style="margin: 10px 0 0; font-size: 14px;">This donation is eligible for tax deduction under Section 80G of the Income Tax Act, 1961. Please retain the attached receipt for your tax filing purposes.</p>
            </div>
            
            <p>Your contribution helps us continue our spiritual and community service. May Lord Krishna bless you abundantly for your devotion and generosity.</p>
            
            <p style="margin-top: 30px;">
              With gratitude,<br>
              <strong>ISKCON Juhu Team</strong>
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">ISKCON Juhu | Hare Krishna Land, Juhu, Mumbai - 400049</p>
            <p style="margin: 5px 0 0;">Phone: +91-22-2620-6860 | Email: donations@iskconjuhu.org</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `ISKCON_Receipt_${receiptData.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending receipt email:', error);
    return false;
  }
}

export async function generateAndSendReceipt(receiptData: ReceiptData): Promise<{ success: boolean; pdfBuffer?: Buffer }> {
  try {
    const pdfBuffer = await generatePDFReceipt(receiptData);
    const emailSent = await sendReceiptEmail(receiptData, pdfBuffer);
    
    console.log(`Receipt generated for ${receiptData.email}, email sent: ${emailSent}`);
    
    return {
      success: true,
      pdfBuffer
    };
  } catch (error) {
    console.error('Error generating/sending receipt:', error);
    return { success: false };
  }
}