import PDFKit from 'pdfkit';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

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
      const doc = new PDFKit({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header with ISKCON logo and details
      doc.fontSize(20)
         .fillColor('#FF6B35')
         .text('ISKCON JUHU', 50, 50, { align: 'center' })
         .fontSize(14)
         .fillColor('#000')
         .text('International Society for Krishna Consciousness', 50, 80, { align: 'center' })
         .text('Hare Krishna Land, Juhu, Mumbai - 400049', 50, 100, { align: 'center' })
         .text('Phone: +91-22-2620-6860 | Email: donations@iskconjuhu.org', 50, 120, { align: 'center' });

      // Title
      doc.fontSize(18)
         .fillColor('#FF6B35')
         .text('DONATION RECEIPT', 50, 160, { align: 'center' })
         .fontSize(12)
         .fillColor('#000')
         .text('(Eligible for Tax Deduction under Section 80G)', 50, 185, { align: 'center' });

      // Receipt details box
      doc.rect(50, 210, 495, 200)
         .stroke()
         .fontSize(12);

      // Receipt content
      const startY = 230;
      const lineHeight = 25;
      let currentY = startY;

      const addReceiptLine = (label: string, value: string) => {
        doc.text(label + ':', 70, currentY, { width: 150 })
           .text(value, 250, currentY, { width: 250 });
        currentY += lineHeight;
      };

      addReceiptLine('Receipt No', receiptData.invoiceNumber);
      addReceiptLine('Transaction ID', receiptData.txnid);
      addReceiptLine('Date', receiptData.date.toLocaleDateString('en-IN'));
      addReceiptLine('Donor Name', receiptData.name);
      addReceiptLine('Email', receiptData.email);
      addReceiptLine('Phone', receiptData.phone);
      if (receiptData.panCard) {
        addReceiptLine('PAN Card', receiptData.panCard);
      }
      
      // Donation Purpose - highlighted section
      doc.fontSize(14)
         .fillColor('#FF6B35')
         .text('Donation Purpose:', 70, currentY, { width: 150 })
         .fillColor('#000')
         .text(receiptData.purpose, 250, currentY, { width: 250 });
      currentY += lineHeight;
      
      // Amount in box
      doc.fontSize(14)
         .fillColor('#FF6B35')
         .text('Amount: ₹' + receiptData.amount.toLocaleString('en-IN'), 70, currentY, { width: 400 });

      // Tax benefit information
      currentY += 50;
      doc.fontSize(10)
         .fillColor('#000')
         .text('This donation is eligible for tax deduction under Section 80G of the Income Tax Act, 1961.', 50, currentY, { width: 495, align: 'center' })
         .text('Please retain this receipt for your tax filing purposes.', 50, currentY + 20, { width: 495, align: 'center' });

      // Footer
      doc.fontSize(8)
         .fillColor('#666')
         .text('This is a computer-generated receipt and does not require a signature.', 50, 720, { width: 495, align: 'center' })
         .text('Generated on: ' + new Date().toLocaleString('en-IN'), 50, 735, { width: 495, align: 'center' });

      // Add gratitude message
      doc.fontSize(12)
         .fillColor('#FF6B35')
         .text('🙏 Thank you for your generous contribution to ISKCON Juhu', 50, 600, { width: 495, align: 'center' })
         .fontSize(10)
         .fillColor('#000')
         .text('May Lord Krishna bless you abundantly for your devotion and generosity.', 50, 625, { width: 495, align: 'center' });

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