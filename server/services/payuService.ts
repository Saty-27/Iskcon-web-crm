import crypto from 'crypto-js';
import { PAYMENT_CONFIG } from '../paymentConfig';

// PayU payment service
export interface PaymentRequest {
  txnid: string;
  amount: number;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  lastname?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  surl: string;
  furl: string;
}

export interface PayUResponse {
  isSuccess: boolean;
  message: string;
  transactionId?: string;
  amount?: string;
  status?: string;
  error?: any;
}

// PayU configuration - LIVE PRODUCTION MODE
export const payuConfig = {
  merchantKey: PAYMENT_CONFIG.PAYU.MERCHANT_KEY,
  merchantSalt: PAYMENT_CONFIG.PAYU.MERCHANT_SALT,
  baseURL: PAYMENT_CONFIG.PAYU.BASE_URL,
  paymentURL: PAYMENT_CONFIG.PAYU.PAYMENT_URL,
  verifyURL: PAYMENT_CONFIG.PAYU.VERIFY_URL,
  mode: PAYMENT_CONFIG.PAYU.MODE
};

// Generate hash for PayU
export function generateHash(paymentData: PaymentRequest): string {
  if (!payuConfig.merchantKey || !payuConfig.merchantSalt) {
    throw new Error('PayU merchant key or salt is missing');
  }
  
  // The order of the fields is important for hash generation
  const hashString = `${payuConfig.merchantKey}|${paymentData.txnid}|${paymentData.amount}|${paymentData.productinfo}|${paymentData.firstname}|${paymentData.email}|||||||||||${payuConfig.merchantSalt}`;
  
  // Generate SHA512 hash
  return crypto.SHA512(hashString).toString();
}

// Verify PayU response hash
export function verifyPaymentResponse(params: any): boolean {
  if (!payuConfig.merchantSalt) {
    throw new Error('PayU merchant salt is missing');
  }
  
  const receivedHash = params.hash;
  const status = params.status;
  
  // Generate hash based on the response parameters
  let hashString = '';
  
  if (status === 'success') {
    // For successful transactions
    hashString = `${payuConfig.merchantSalt}|${params.status}|||||||||${params.udf5 || ''}|${params.udf4 || ''}|${params.udf3 || ''}|${params.udf2 || ''}|${params.udf1 || ''}|${params.email}|${params.firstname}|${params.productinfo}|${params.amount}|${params.txnid}|${payuConfig.merchantKey}`;
  } else {
    // For failed transactions
    hashString = `${payuConfig.merchantSalt}|${params.status}|||||||||${params.udf5 || ''}|${params.udf4 || ''}|${params.udf3 || ''}|${params.udf2 || ''}|${params.udf1 || ''}|${params.email}|${params.firstname}|${params.productinfo}|${params.amount}|${params.txnid}|${payuConfig.merchantKey}`;
  }
  
  const calculatedHash = crypto.SHA512(hashString).toString();
  return calculatedHash === receivedHash;
}

// Process payment through PayU
export function getPaymentFormData(paymentRequest: PaymentRequest): {
  formUrl: string;
  formData: Record<string, string>;
} {
  if (!payuConfig.merchantKey) {
    throw new Error('PayU merchant key is missing');
  }
  
  const hash = generateHash(paymentRequest);
  
  const formData = {
    key: payuConfig.merchantKey,
    txnid: paymentRequest.txnid,
    amount: paymentRequest.amount.toString(),
    productinfo: paymentRequest.productinfo,
    firstname: paymentRequest.firstname,
    email: paymentRequest.email,
    phone: paymentRequest.phone,
    surl: paymentRequest.surl,
    furl: paymentRequest.furl,
    hash: hash,
    // Optional parameters
    ...(paymentRequest.lastname && { lastname: paymentRequest.lastname }),
    ...(paymentRequest.address1 && { address1: paymentRequest.address1 }),
    ...(paymentRequest.address2 && { address2: paymentRequest.address2 }),
    ...(paymentRequest.city && { city: paymentRequest.city }),
    ...(paymentRequest.state && { state: paymentRequest.state }),
    ...(paymentRequest.country && { country: paymentRequest.country }),
    ...(paymentRequest.zipcode && { zipcode: paymentRequest.zipcode }),
    ...(paymentRequest.udf1 && { udf1: paymentRequest.udf1 }),
    ...(paymentRequest.udf2 && { udf2: paymentRequest.udf2 }),
    ...(paymentRequest.udf3 && { udf3: paymentRequest.udf3 }),
    ...(paymentRequest.udf4 && { udf4: paymentRequest.udf4 }),
    ...(paymentRequest.udf5 && { udf5: paymentRequest.udf5 }),
  };
  
  return {
    formUrl: payuConfig.paymentURL,
    formData
  };
}