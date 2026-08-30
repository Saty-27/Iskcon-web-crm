import express from 'express';
import { generateHtmlPdf } from '../services/puppeteerPdfGenerator';
import { generateDonationPDF } from '../services/receiptPdfGenerator';
import { sendWhatsAppReceipt, generateInvoiceNumber } from '../services/invoiceService';
import { storage } from '../storage';
import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

const router = express.Router();

// Temp directory for storing receipt PDFs
const TEMP_DIR = '/tmp';

/**
 * Generate and send a receipt for a donation via WhatsApp
 */
router.post('/send-whatsapp', async (req, res) => {
  try {
    const { donationId } = req.body;
    
    if (!donationId) {
      return res.status(400).json({
        success: false,
        message: 'Donation ID is required'
      });
    }
    
    // Get donation from the database
    const donation = await storage.getDonation(Number(donationId));
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    // Get category name if available
    let purpose = "ISKCON Juhu Donation";
    if (donation.categoryId) {
      const category = await storage.getDonationCategory(donation.categoryId);
      if (category) {
        purpose = category.name;
      }
    } else if (donation.eventId) {
      const event = await storage.getEvent(donation.eventId);
      if (event) {
        purpose = event.title;
      }
    }
    
    // Check if phone number is available
    if (!donation.phone) {
      return res.status(400).json({
        success: false,
        message: 'Donor phone number is required for WhatsApp receipt'
      });
    }
    
    // Generate a unique invoice number
    const invoiceNumber = generateInvoiceNumber();
    
    // Prepare donation receipt data
    const receiptData = {
      txnid: donation.paymentId || 'N/A',
      amount: donation.amount,
      name: donation.name,
      email: donation.email,
      phone: donation.phone,
      date: donation.createdAt,
      paymentMethod: donation.status.includes('upi') ? 'UPI' : 'Online Payment',
      purpose,
      invoiceNumber,
      address: donation.address || '',
      panCard: donation.panCard || ''
    };
    
    // Send receipt via WhatsApp
    const sent = await sendWhatsAppReceipt(donation.phone, receiptData);
    
    if (sent) {
      // Update donation with receipt information
      await storage.updateDonation(donation.id, {
        receiptSent: true,
        invoiceNumber
      });
      
      res.json({
        success: true,
        message: 'Receipt sent successfully via WhatsApp'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send receipt via WhatsApp'
      });
    }
  } catch (error) {
    console.error('Error sending receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send receipt'
    });
  }
});

/**
 * Generate and download a PDF receipt for a donation
 */
router.get('/download/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;
    const txnidQuery = (req.query.txnid as string) || '';
    
    // Get donation from the database by ID or paymentId/txnid
    let donation = !isNaN(Number(donationId)) ? await storage.getDonation(Number(donationId)) : undefined;
    
    if (!donation && txnidQuery) {
      donation = await storage.getDonationByPaymentId(txnidQuery);
    }

    if (!donation && isNaN(Number(donationId))) {
      donation = await storage.getDonationByPaymentId(donationId);
    }

    if (!donation) {
      const allDonations = await storage.getDonations();
      donation = allDonations.find(d => 
        String(d.id) === donationId || 
        d.paymentId === donationId || 
        d.paymentId === txnidQuery ||
        d.invoiceNumber === donationId ||
        (d.paymentGatewayResponse && (d.paymentGatewayResponse.includes(donationId) || (txnidQuery && d.paymentGatewayResponse.includes(txnidQuery))))
      );
    }
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    // Get category/event purpose name
    let purpose = donation.message || "General Donation / Seva";
    if (donation.categoryId) {
      const category = await storage.getDonationCategory(donation.categoryId);
      if (category) {
        purpose = category.name;
      }
    } else if (donation.eventId) {
      const event = await storage.getEvent(donation.eventId);
      if (event) {
        purpose = event.title;
      }
    }
    
    // Import formatPaymentMode from generator
    const { formatPaymentMode } = await import('../services/receiptPdfGenerator');
    const paymentMethod = formatPaymentMode(null, null, donation.paymentGatewayResponse);
    
    // Generate a unique invoice number if not already assigned
    const invoiceNumber = donation.invoiceNumber || generateInvoiceNumber();
    
    // Prepare donation receipt data
    const receiptData = {
      txnid: donation.paymentId || 'N/A',
      amount: donation.amount,
      name: donation.name,
      email: donation.email,
      phone: donation.phone,
      date: donation.createdAt,
      paymentMethod,
      purpose,
      invoiceNumber,
      address: donation.address || '',
      panCard: donation.panCard || ''
    };
    
    // Generate PDF using exact HTML-to-PDF renderer with fallback
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateHtmlPdf(receiptData);
    } catch (e) {
      console.warn('Puppeteer error, falling back to vector PDF:', e);
      pdfBuffer = await generateDonationPDF(receiptData);
    }
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="donation_receipt_${donationId}.pdf"`);
    
    // Send PDF directly in response
    res.send(pdfBuffer);
    
    // Update donation with receipt information if not already set
    if (!donation.invoiceNumber) {
      await storage.updateDonation(donation.id, {
        invoiceNumber
      });
    }
  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt'
    });
  }
});

/**
 * Serve a temporary receipt PDF file (for Twilio media URLs)
 */
router.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (!/^[a-zA-Z0-9_-]+\.pdf$/.test(filename)) {
      return res.status(400).send('Invalid filename');
    }
    
    const filePath = path.join(TEMP_DIR, filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).send('File not found');
    }
    
    // Set content type and serve the file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Read file into buffer and send
    const fileBuffer = await fs.readFile(filePath);
    res.send(fileBuffer);
    
    // Clean up the file after a delay
    setTimeout(async () => {
      try {
        await fs.unlink(filePath);
        console.log(`Cleaned up temporary receipt file: ${filename}`);
      } catch (error) {
        console.error(`Error cleaning up file ${filename}:`, error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  } catch (error) {
    console.error('Error serving receipt file:', error);
    res.status(500).send('Error serving file');
  }
});

export default router;