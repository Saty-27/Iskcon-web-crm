import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { getPaymentFormData, verifyPaymentResponse } from '../services/payuService';
import { storage } from '../storage';

// Initialize donation payment with PayU
export const initializePayment = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      amount, 
      message, 
      categoryId, 
      eventId,
      panCard 
    } = req.body;

    if (!name || !email || !phone || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Generate unique transaction ID
    const txnid = `TXN_${nanoid(10)}`;
    
    // Create donation record with pending status
    const donation = await storage.createDonation({
      email,
      name,
      phone,
      amount: Number(amount),
      message: message || null,
      panCard: panCard || null,
      status: 'pending',
      createdAt: new Date(),
      userId: req.user ? (req.user as any).id : null,
      categoryId: categoryId ? Number(categoryId) : null,
      eventId: eventId ? Number(eventId) : null,
      paymentId: txnid
    });

    // Prepare PayU request
    const paymentRequest = {
      txnid,
      amount: Number(amount),
      productinfo: categoryId 
        ? 'Donation for ISKCON Juhu - Category' 
        : (eventId ? 'Donation for ISKCON Juhu - Event' : 'Donation for ISKCON Juhu'),
      firstname: name,
      email,
      phone,
      udf1: donation.id.toString(), // Store donation ID for reference
      surl: `${req.protocol}://${req.get('host')}/api/payments/success`,
      furl: `${req.protocol}://${req.get('host')}/api/payments/failure`
    };

    // Get payment form data with hash
    const paymentData = getPaymentFormData(paymentRequest);
    
    // Return payment data to client
    return res.status(200).json({
      success: true,
      paymentData
    });
  } catch (error: any) {
    console.error('Payment initialization error:', error);
    return res.status(500).json({ message: 'Failed to initialize payment', error: error.message });
  }
};

// Handle successful payment callback
export const handlePaymentSuccess = async (req: Request, res: Response) => {
  try {
    // Verify the payment response
    const isValid = verifyPaymentResponse(req.body);
    
    if (!isValid) {
      console.error('Invalid payment hash', req.body);
      return res.redirect('/donate?status=invalid');
    }
    
    const { txnid, status, amount, udf1 } = req.body;
    const donationId = Number(udf1);
    
    // Update donation status
    if (donationId) {
      await storage.updateDonation(donationId, {
        status: status.toLowerCase(),
        paymentId: txnid
      });
    }
    
    // Redirect to thank you page
    return res.redirect(`/donate/thank-you?txnid=${txnid}&amount=${amount}`);
  } catch (error: any) {
    console.error('Payment success callback error:', error);
    return res.redirect('/donate?status=error');
  }
};

// Handle failed payment callback
export const handlePaymentFailure = async (req: Request, res: Response) => {
  try {
    const { txnid, status, error_Message, udf1 } = req.body;
    const donationId = Number(udf1);
    
    // Update donation status
    if (donationId) {
      await storage.updateDonation(donationId, {
        status: status.toLowerCase(),
        paymentId: txnid
      });
    }
    
    // Redirect to failure page
    return res.redirect(`/donate?status=failed&message=${encodeURIComponent(error_Message || 'Payment failed')}`);
  } catch (error: any) {
    console.error('Payment failure callback error:', error);
    return res.redirect('/donate?status=error');
  }
};