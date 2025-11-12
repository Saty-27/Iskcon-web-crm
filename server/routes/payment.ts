import express from 'express';
import { payuConfig, generateHash, getPaymentFormData } from '../services/payuService';
import { storage } from '../storage';
import { nanoid } from 'nanoid';
import { generatePDFReceipt, sendReceiptEmail, type ReceiptData } from '../services/receiptService';

const router = express.Router();

// Initialize PayU payment
router.post('/initiate', async (req, res) => {
  try {
    const {
      amount,
      name,
      email,
      phone,
      message,
      categoryId, 
      eventId,
      panCard,
      paymentMethod = 'netbanking' // Default payment method
    } = req.body;
    
    if (!amount || !name || !email || !phone) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required payment fields' 
      });
    }
    
    // Generate transaction ID
    const txnid = `ISKCON_${nanoid(8)}`;
    
    // Determine success and failure URLs
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers.host || req.hostname;
    const baseUrl = `${protocol}://${host}`;
    
    // PayU will redirect to these URLs after payment completion
    const surl = `${baseUrl}/api/payments/success`; 
    const furl = `${baseUrl}/api/payments/failure`;
    
    // Product info description
    const categoryName = categoryId ? 'Temple Donation' : 'General Donation';
    const productinfo = `Donation for ISKCON Juhu - ${categoryName}`;
    
    // Prepare payment request for PayU
    const paymentRequest = {
      txnid,
      amount: Number(amount),
      productinfo,
      firstname: name,
      email,
      phone,
      surl,
      furl,
      // Include UPI specific fields if UPI payment method is selected
      ...(paymentMethod === 'upi' && {
        udf1: 'upi', // Use UDF fields to pass payment method info
        pg: 'UPI'    // Payment gateway - UPI
      })
    };
    
    // Get PayU form data with hash
    const { formUrl, formData } = getPaymentFormData(paymentRequest);
    
    // Store donation in database
    await storage.createDonation({
      email,
      name,
      phone,
      amount: Number(amount),
      message: message || null,
      status: 'pending',
      categoryId: categoryId ? Number(categoryId) : null,
      eventId: eventId ? Number(eventId) : null,
      panCard: panCard || null,
      userId: (req as any).user?.id || null,
      paymentId: txnid
    });
    
    // Return payment data and URL for the frontend to create and submit form
    res.json({
      success: true,
      txnid,
      payuUrl: formUrl,
      paymentData: formData,
      // Include UPI data if UPI is selected
      ...(paymentMethod === 'upi' && {
        upiData: {
          payeeVpa: 'iskconjuhu@sbi', // ISKCON Juhu UPI ID
          payeeName: 'ISKCON Juhu',
          amount: Number(amount),
          transactionId: txnid,
          transactionNote: productinfo
        }
      })
    });
  } catch (error) {
    console.error('PayU payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment initialization failed'
    });
  }
});

// Handle PayU success callback
router.post('/success', async (req, res) => {
  try {
    const paymentResponse = req.body;
    
    // Import invoice service functions
    const { generateInvoiceNumber, sendWhatsAppReceipt } = await import('../services/invoiceService');
    
    // Initialize default purpose
    let purpose = "ISKCON Juhu Donation";
    
    // Update donation status to completed
    if (paymentResponse && paymentResponse.txnid) {
      const donation = await storage.getDonationByPaymentId(paymentResponse.txnid);
      
      if (donation) {
        // Generate a unique invoice number
        const invoiceNumber = generateInvoiceNumber();
        
        // Update donation status
        await storage.updateDonation(donation.id, {
          status: 'completed',
          paymentId: paymentResponse.mihpayid || paymentResponse.txnid,
          invoiceNumber
        });
        
        // Get purpose from category or event
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
        
        // Generate and send PDF receipt via email
        const receiptData: ReceiptData = {
          txnid: donation.paymentId || paymentResponse.txnid,
          amount: donation.amount,
          name: donation.name,
          email: donation.email,
          phone: donation.phone,
          purpose,
          invoiceNumber,
          date: donation.createdAt || new Date(),
          panCard: donation.panCard || undefined
        };

        // Send PDF receipt via email
        try {
          const pdfBuffer = await generatePDFReceipt(receiptData);
          const emailSent = await sendReceiptEmail(receiptData, pdfBuffer);
          
          if (emailSent) {
            console.log(`PDF receipt sent to ${donation.email}`);
          }
        } catch (receiptError) {
          console.error('Error sending PDF receipt:', receiptError);
        }

        // Send WhatsApp receipt for successful payment
        if (donation.phone && !donation.receiptSent) {
          try {
            const { sendWhatsAppReceipt } = await import('../services/invoiceService');
            await sendWhatsAppReceipt(donation.phone, {
              txnid: donation.paymentId || paymentResponse.txnid,
              amount: donation.amount,
              name: donation.name,
              email: donation.email,
              phone: donation.phone,
              date: donation.createdAt,
              paymentMethod: 'Online Payment',
              purpose,
              invoiceNumber
            });
            
            // Mark receipt as sent
            await storage.updateDonation(donation.id, {
              receiptSent: true
            });
            
            console.log(`WhatsApp receipt sent to ${donation.phone}`);
          } catch (receiptError) {
            console.error('Error sending WhatsApp receipt:', receiptError);
          }
        }
      }
    }
    
    // Redirect to thank you page with parameters including donation purpose
    const params = new URLSearchParams({
      txnid: paymentResponse.txnid || '',
      amount: paymentResponse.amount || '',
      firstname: paymentResponse.firstname || '',
      email: paymentResponse.email || '',
      status: 'success',
      purpose: purpose,
      categoryName: purpose
    });
    
    res.redirect(`/donate/thank-you?${params.toString()}`);
  } catch (error) {
    console.error('PayU success callback error:', error);
    res.redirect('/donate/payment-failed');
  }
});

// Handle PayU failure callback
router.post('/failure', async (req, res) => {
  try {
    const paymentResponse = req.body;
    
    // Import notification service
    const { sendFailedPaymentNotification } = await import('../services/notificationService');
    
    // Update donation status to failed
    if (paymentResponse && paymentResponse.txnid) {
      const donation = await storage.getDonationByPaymentId(paymentResponse.txnid);
      
      if (donation) {
        await storage.updateDonation(donation.id, {
          status: 'failed'
        });
        
        // Get purpose from category or event
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
        
        // Send WhatsApp notification about failed payment
        if (donation.phone && !donation.notificationSent) {
          try {
            await sendFailedPaymentNotification(
              donation.phone,
              donation.name,
              donation.amount,
              purpose
            );
            
            // Mark notification as sent
            await storage.updateDonation(donation.id, {
              notificationSent: true
            });
            
            console.log(`Failed payment notification sent to ${donation.phone}`);
          } catch (notifyError) {
            console.error('Error sending payment failure notification:', notifyError);
          }
        }
      }
    }
    
    // Redirect to failure page with parameters
    const params = new URLSearchParams({
      txnid: paymentResponse.txnid || '',
      amount: paymentResponse.amount || '',
      firstname: paymentResponse.firstname || '',
      email: paymentResponse.email || '',
      status: 'failure',
      error: paymentResponse.error_Message || 'Payment failed'
    });
    
    res.redirect(`/donate/payment-failed?${params.toString()}`);
  } catch (error) {
    console.error('PayU failure callback error:', error);
    res.redirect('/donate/payment-failed');
  }
});

// API endpoint to initiate UPI payment directly
router.post('/upi-intent', async (req, res) => {
  try {
    // Always use the official ISKCON UPI ID
    const upiId = 'iskconjuhu@sbi';
    const { txnid, amount } = req.body;
    
    if (!txnid || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required UPI fields'
      });
    }
    
    // Import UPI service functions
    const { generateUpiIntent, generateUpiQrData } = await import('../services/upiService');
    
    // Create UPI payment intent URL
    const upiParams = { upiId, txnid, amount };
    const upiIntent = generateUpiIntent(upiParams);
    const qrCodeData = await generateUpiQrData(upiParams);
    
    // Get the donation to update with UPI payment details
    const donation = await storage.getDonationByPaymentId(txnid);
    
    if (donation) {
      // Update donation with additional details
      await storage.updateDonation(donation.id, {
        status: 'pending_upi' // Special status for UPI payments in progress
      });
    }
    
    res.json({
      success: true,
      upiIntent,
      qrCodeData,
      txnid,
      payeeVpa: upiId,
      payeeName: 'ISKCON Juhu'
    });
  } catch (error) {
    console.error('UPI intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create UPI payment intent'
    });
  }
});

// API endpoint to verify UPI payment status
router.post('/verify-upi', async (req, res) => {
  try {
    const { txnid } = req.body;
    
    if (!txnid) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }
    
    // Import UPI service functions
    const { verifyUpiTransaction } = await import('../services/upiService');
    
    // Import notification and receipt services
    const { sendFailedPaymentNotification } = await import('../services/notificationService');
    const { generateInvoiceNumber, sendWhatsAppReceipt } = await import('../services/invoiceService');
    
    // Get the donation record
    const donation = await storage.getDonationByPaymentId(txnid);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found'
      });
    }
    
    // Get purpose from category or event
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
    
    // Verify UPI transaction status
    const verificationResult = await verifyUpiTransaction(txnid);
    
    if (verificationResult.success) {
      // Generate a unique invoice number
      const invoiceNumber = generateInvoiceNumber();
      
      // Update donation status to completed
      await storage.updateDonation(donation.id, {
        status: 'completed_upi',
        invoiceNumber
      });
      
      // Send WhatsApp receipt for successful payment if not already sent
      if (donation.phone && !donation.receiptSent) {
        try {
          const receiptData = {
            txnid: donation.paymentId || txnid,
            amount: donation.amount,
            name: donation.name,
            email: donation.email,
            phone: donation.phone,
            date: donation.createdAt,
            paymentMethod: 'UPI',
            purpose,
            invoiceNumber
          };
          
          await sendWhatsAppReceipt(donation.phone, receiptData);
          
          // Mark receipt as sent
          await storage.updateDonation(donation.id, {
            receiptSent: true
          });
          
          console.log(`UPI payment receipt sent to ${donation.phone}`);
        } catch (receiptError) {
          console.error('Error sending UPI payment receipt:', receiptError);
        }
      }
      
      return res.json({
        success: true,
        status: 'success',
        message: 'Payment verified successfully',
        donation: {
          id: donation.id,
          amount: donation.amount,
          name: donation.name,
          email: donation.email
        }
      });
    } else {
      // Update donation status based on verification result
      const newStatus = verificationResult.status === 'pending' ? 'pending' : 'failed_upi';
      await storage.updateDonation(donation.id, {
        status: newStatus
      });
      
      // Send WhatsApp notification about failed payment if it's marked as failed
      if (newStatus === 'failed_upi' && donation.phone && !donation.notificationSent) {
        try {
          await sendFailedPaymentNotification(
            donation.phone,
            donation.name,
            donation.amount,
            purpose
          );
          
          // Mark notification as sent
          await storage.updateDonation(donation.id, {
            notificationSent: true
          });
          
          console.log(`UPI failed payment notification sent to ${donation.phone}`);
        } catch (notifyError) {
          console.error('Error sending UPI payment failure notification:', notifyError);
        }
      }
      
      return res.json({
        success: false,
        status: verificationResult.status,
        message: verificationResult.message
      });
    }
  } catch (error) {
    console.error('UPI verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify UPI payment'
    });
  }
});

// Generate and download PDF receipt
router.get('/receipt/:txnid', async (req, res) => {
  try {
    const { txnid } = req.params;
    
    // Get donation details from database
    const donation = await storage.getDonationByPaymentId(txnid);
    
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Get purpose from category or event
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

    const receiptData: ReceiptData = {
      txnid: donation.paymentId || txnid,
      amount: donation.amount,
      name: donation.name,
      email: donation.email,
      phone: donation.phone,
      purpose,
      invoiceNumber: donation.invoiceNumber || `INV-${txnid}`,
      date: donation.createdAt || new Date(),
      panCard: donation.panCard || undefined
    };

    const pdfBuffer = await generatePDFReceipt(receiptData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ISKCON_Receipt_${receiptData.invoiceNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});

// Send receipt email
router.post('/send-receipt', async (req, res) => {
  try {
    const { txnid } = req.body;
    
    // Get donation details from database
    const donation = await storage.getDonationByPaymentId(txnid);
    
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Get purpose from category or event
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

    const receiptData: ReceiptData = {
      txnid: donation.paymentId || txnid,
      amount: donation.amount,
      name: donation.name,
      email: donation.email,
      phone: donation.phone,
      purpose,
      invoiceNumber: donation.invoiceNumber || `INV-${txnid}`,
      date: donation.createdAt || new Date(),
      panCard: donation.panCard || undefined
    };

    const pdfBuffer = await generatePDFReceipt(receiptData);
    const emailSent = await sendReceiptEmail(receiptData, pdfBuffer);

    if (emailSent) {
      res.json({ success: true, message: 'Receipt sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send receipt email' });
    }
  } catch (error) {
    console.error('Error sending receipt:', error);
    res.status(500).json({ error: 'Failed to send receipt' });
  }
});

export default router;