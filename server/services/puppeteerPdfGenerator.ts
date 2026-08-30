import fs from 'fs';
import path from 'path';
import { formatPaymentMode, numberToIndianWords, formatDisplayReceiptNo, type ReceiptDetailData, generateDonationPDF } from './receiptPdfGenerator';

let letterheadBase64 = '';
try {
  const bgPath = path.join(process.cwd(), 'client/public/images/iskcon-letterhead-bg.png');
  if (fs.existsSync(bgPath)) {
    const fileData = fs.readFileSync(bgPath);
    letterheadBase64 = `data:image/png;base64,${fileData.toString('base64')}`;
  } else {
    const serverBgPath = path.join(process.cwd(), 'server/assets/iskcon-letterhead-bg.png');
    if (fs.existsSync(serverBgPath)) {
      const fileData = fs.readFileSync(serverBgPath);
      letterheadBase64 = `data:image/png;base64,${fileData.toString('base64')}`;
    }
  }
} catch (e) {
  console.warn('Could not read letterhead for base64 embed:', e);
}

/**
 * Generates HTML string matching the exact OfficialDonationReceipt React component
 */
export function generateReceiptHtml(data: ReceiptDetailData): string {
  const receiptNo = data.receiptNo;
  const formattedDate = data.date instanceof Date
    ? data.date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : String(data.date || new Date().toLocaleDateString('en-IN'));

  const amountNum = Number(data.amount) || 0;
  const amountWords = numberToIndianWords(amountNum);
  const displayPaymentMode = formatPaymentMode(data.paymentMode);
  const purpose = data.purpose || 'General Donation / Seva';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Donation Receipt - ${receiptNo}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #ffffff;
      color: #111827;
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 8mm 10mm;
    }

    .receipt-container {
      position: relative;
      background-color: #fffdfa;
      border: 1.5px solid #fde68a;
      border-radius: 16px;
      padding: 24px 28px;
      width: 100%;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      overflow: hidden;
    }

    .bg-watermark {
      position: absolute;
      inset: 0;
      background-image: url('${letterheadBase64}');
      background-size: cover;
      background-position: center top;
      background-repeat: no-repeat;
      opacity: 0.88;
      pointer-events: none;
      z-index: 0;
    }

    .receipt-content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Top Header */
    .header-grid {
      display: grid;
      grid-template-columns: 80px 1fr 150px;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid rgba(244, 114, 182, 0.4);
      padding-bottom: 10px;
    }

    .header-logo-spacer {
      width: 80px;
    }

    .header-center {
      text-align: center;
    }

    .header-title {
      font-size: 15.5px;
      font-weight: 700;
      color: #1e3a8a;
      line-height: 1.25;
      letter-spacing: -0.01em;
    }

    .header-subtitle {
      font-size: 10px;
      font-weight: 600;
      color: #1d4ed8;
      margin-top: 3px;
      margin-bottom: 6px;
      white-space: nowrap;
      letter-spacing: -0.01em;
    }

    .yellow-address-box {
      background: rgba(254, 240, 138, 0.95);
      border: 1px solid #fde047;
      border-radius: 6px;
      padding: 5px 10px;
      font-size: 9.5px;
      line-height: 1.25;
      color: #1f2937;
      max-width: 230px;
      margin: 0 auto;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }

    .yellow-address-box .bold-line {
      font-weight: 700;
      color: #111827;
    }

    .header-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      text-align: right;
      gap: 6px;
    }

    .receipt-no-label {
      font-size: 10px;
      font-weight: 700;
      color: #db2777;
      line-height: 1;
    }

    .receipt-no-val {
      font-size: 22px;
      font-weight: 900;
      font-family: 'Inter', monospace;
      color: #111827;
      letter-spacing: 0.05em;
      margin-top: 2px;
    }

    .badge-date-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .donor-copy-badge {
      background-color: #db2777;
      color: #ffffff;
      font-size: 9px;
      font-weight: 700;
      padding: 3px 7px;
      border-radius: 4px;
      line-height: 1.15;
      text-align: center;
    }

    .date-box {
      border: 1px solid #f472b6;
      background: rgba(255, 255, 255, 0.96);
      border-radius: 4px;
      padding: 2px 8px;
      text-align: center;
      min-width: 82px;
    }

    .date-box-label {
      font-size: 8px;
      font-weight: 700;
      color: #db2777;
      line-height: 1;
    }

    .date-box-val {
      font-size: 10px;
      font-weight: 700;
      color: #111827;
      margin-top: 1px;
    }

    /* 1. Donation Amount Box */
    .amount-box {
      border: 1px solid #f472b6;
      background: rgba(255, 255, 255, 0.92);
      border-radius: 6px;
      padding: 8px 14px;
      text-align: left;
    }

    .amount-box-label {
      font-size: 10.5px;
      font-weight: 700;
      color: #db2777;
      margin-bottom: 2px;
      letter-spacing: -0.01em;
    }

    .amount-box-val {
      font-size: 15px;
      font-weight: 700;
      color: #111827;
      letter-spacing: 0.01em;
    }

    .amount-box-words {
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      margin-left: 8px;
    }

    /* Two Column Details */
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* Left: Donor Details */
    .donor-card {
      border: 1px solid #f472b6;
      background: rgba(255, 255, 255, 0.92);
      border-radius: 6px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .donor-card-title {
      font-size: 10px;
      font-weight: 700;
      color: #db2777;
      border-bottom: 1px solid #fce7f3;
      padding-bottom: 4px;
      margin-bottom: 7px;
      letter-spacing: -0.01em;
    }

    .donor-rows {
      display: flex;
      flex-direction: column;
      gap: 5px;
      font-size: 11px;
      color: #1f2937;
    }

    .donor-row {
      display: flex;
      align-items: baseline;
    }

    .donor-label {
      width: 60px;
      font-weight: 600;
      color: #4b5563;
      flex-shrink: 0;
    }

    .donor-val {
      font-weight: 700;
      color: #111827;
      word-break: break-word;
    }

    .donor-val-normal {
      font-weight: 500;
      color: #1f2937;
      word-break: break-word;
    }

    /* Right Stacked Boxes */
    .right-stack {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 8px;
    }

    .mini-box {
      border: 1px solid #f472b6;
      background: rgba(255, 255, 255, 0.92);
      border-radius: 6px;
      padding: 6px 10px;
    }

    .mini-box-label {
      font-size: 9.5px;
      font-weight: 700;
      color: #db2777;
      margin-bottom: 2px;
      letter-spacing: -0.01em;
    }

    .mini-box-val {
      font-size: 12px;
      font-weight: 700;
      color: #111827;
    }

    .mini-box-val-mono {
      font-size: 11px;
      font-family: monospace;
      font-weight: 600;
      color: #1f2937;
      word-break: break-all;
    }

    .signatures-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .sig-box {
      border: 1px solid #f472b6;
      background: rgba(255, 255, 255, 0.92);
      border-radius: 6px;
      height: 44px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 4px;
      font-size: 8px;
      color: #4b5563;
      text-align: center;
    }

    /* Registered Office Footer */
    .registered-office-row {
      display: flex;
      align-items: stretch;
      gap: 8px;
    }

    .registered-office-box {
      flex: 1;
      background: rgba(254, 240, 138, 0.95);
      border: 1px solid #fde047;
      border-radius: 4px;
      padding: 6px 8px;
      text-align: center;
      font-size: 9px;
      line-height: 1.25;
      color: #1f2937;
    }

    .pto-box {
      border: 1px solid #9ca3af;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 4px;
      padding: 0 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: 700;
      color: #4b5563;
      flex-shrink: 0;
    }

    /* Terms and Conditions */
    .tc-section {
      border-top: 1px solid #d1d5db;
      padding-top: 8px;
      text-align: left;
    }

    .tc-title {
      font-size: 11.5px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 6px;
    }

    .tc-list {
      list-style-type: disc;
      padding-left: 16px;
      font-size: 9.5px;
      color: #1f2937;
      line-height: 1.4;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    /* Maha Mantra Footer */
    .mahamantra-section {
      padding-top: 6px;
      text-align: center;
      position: relative;
    }

    .mahamantra-sub {
      font-size: 10.5px;
      color: #4b5563;
      font-weight: 500;
    }

    .mahamantra-italic {
      font-size: 10px;
      font-style: italic;
      color: #6b7280;
      margin: 2px 0;
    }

    .mahamantra-bold {
      font-size: 11.5px;
      font-weight: 700;
      color: #111827;
      letter-spacing: 0.02em;
      line-height: 1.35;
    }

    .year-stamp {
      position: absolute;
      right: 0;
      bottom: 0;
      font-size: 9.5px;
      font-family: monospace;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="bg-watermark"></div>
    <div class="receipt-content">
      
      <!-- Top Header -->
      <div class="header-grid">
        <div class="header-logo-spacer"></div>
        <div class="header-center">
          <h1 class="header-title">International Society for Krishna Consciousness (ISKCON)</h1>
          <p class="header-subtitle">Founder-Acharya: His Divine Grace A. C. &nbsp;Bhaktivedanta Swami Prabhupada</p>
          <div class="yellow-address-box">
            <div class="bold-line">Branch: Juhu *</div>
            <div class="bold-line">Department: BHISMA</div>
            <div>Hare Krishna Land</div>
            <div>Juhu, Mumbai - 400049</div>
            <div>📱 Mobile: 7400056919</div>
            <div>E-mail: bhisma@iskcontrust.org</div>
          </div>
        </div>
        <div class="header-right">
          <div>
            <div class="receipt-no-label">Donation Receipt No.</div>
            <div class="receipt-no-val">${receiptNo}</div>
          </div>
          <div class="badge-date-row">
            <div class="donor-copy-badge">DONOR'S<br>COPY</div>
            <div class="date-box">
              <div class="date-box-label">Date</div>
              <div class="date-box-val">${formattedDate}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 1. Donation Amount Section -->
      <div class="amount-box">
        <div class="amount-box-label">Donation Amount in Rupees</div>
        <div>
          <span class="amount-box-val">₹ ${amountNum.toLocaleString('en-IN')}/-</span>
          <span class="amount-box-words">(${amountWords})</span>
        </div>
      </div>

      <!-- Two-Column Details Grid -->
      <div class="details-grid">
        <!-- Left: Donor Details -->
        <div class="donor-card">
          <div class="donor-card-title">Donor Details (T&C mentioned backside for tax exemption)</div>
          <div class="donor-rows">
            <div class="donor-row">
              <span class="donor-label">Name:</span>
              <span class="donor-val">${data.name || '-'}</span>
            </div>
            <div class="donor-row">
              <span class="donor-label">Address:</span>
              <span class="donor-val-normal">${data.address || '-'}</span>
            </div>
            <div class="donor-row">
              <span class="donor-label">PIN:</span>
              <span class="donor-val-normal">${data.pin || '-'}</span>
            </div>
            <div class="donor-row">
              <span class="donor-label">PAN:</span>
              <span class="donor-val" style="text-transform: uppercase; font-family: monospace;">${data.pan || '-'}</span>
            </div>
            <div class="donor-row">
              <span class="donor-label">📱 Mobile:</span>
              <span class="donor-val-normal">${data.mobile || '-'}</span>
            </div>
            <div class="donor-row">
              <span class="donor-label">E-mail:</span>
              <span class="donor-val-normal">${data.email || '-'}</span>
            </div>
          </div>
        </div>

        <!-- Right: Stacked Info Boxes -->
        <div class="right-stack">
          <div class="mini-box">
            <div class="mini-box-label">Mode of Payment (Cheque / Online / UPI / Cash)</div>
            <div class="mini-box-val">${displayPaymentMode}</div>
          </div>

          <div class="mini-box">
            <div class="mini-box-label">Payment Details (Cheque / Transaction Details)</div>
            <div class="mini-box-val-mono">${data.paymentDetails ? `Txn ID: ${data.paymentDetails}` : 'Online Payment'}</div>
          </div>

          <div class="mini-box">
            <div class="mini-box-label">Purpose of Donation (Corpus / General / Others)</div>
            <div class="mini-box-val">${purpose}</div>
          </div>

          <div class="signatures-row">
            <div class="sig-box">Donor Signature for Cash Payment</div>
            <div class="sig-box">Signature of ISKCON Representative</div>
          </div>
        </div>
      </div>

      <!-- Yellow Registered Office Box -->
      <div class="registered-office-row">
        <div class="registered-office-box">
          <div>Registered Office: Hare Krishna Land, Juhu, Mumbai - 400 049. 📱 Mobile: 72088 46210. E-mail: info@iskconindia.org</div>
          <div style="font-weight: 500; margin-top: 2px;">Registered under Maharashtra Public Trust Act 1950, vide Regn. No.: F-2179 (Mumbai). Unique Regn. No. : AAATI0017P27MB02</div>
        </div>
        <div class="pto-box">P. T. O.</div>
      </div>

      <!-- Terms and Conditions -->
      <div class="tc-section">
        <h2 class="tc-title">Please note Terms and Conditions (T&C):</h2>
        <ul class="tc-list">
          <li>This donation receipt is an acknowledgement only and not for the purpose of claiming deduction under Section 133 of the Income-tax Act, 2025 (Previously 80G Deduction).</li>
          <li>Form No. 114 (10BE), i.e., Certificate of donation under the relevant provisions of Section 133 of the Income-tax Act, 2025, will be issued to you as per provisions of the Income-tax Act, 2025 and rules made thereunder.</li>
          <li>For all types of donations, irrespective of amount and mode of payment, full legal name and address with PIN are required. Further, PAN is compulsory to obtain Form No. 114 (10BE). Please ensure that the same are mentioned correctly in the donation receipt.</li>
          <li>Form No. 114 (10BE) is not available for any cash donation.</li>
          <li>Form N0. 114 (10BE) will be available in PDF version only. Please ensure to mention correct WhatsApp number and E-mail ID to receive the same.</li>
          <li>PAN is compulsory for all donations of Rs. 50,000/- or more.</li>
          <li>In case of payment by cheque, this donation receipt is valid subject to clearance of the cheque.</li>
          <li>ISKCON's Unique Registration Number (URN) for donations eligible under Section 133 of the Income-tax Act, 2025 (previously Section 80G) is - AAATI0017P27MB02 – is valid till March 31, 2031 and is to be renewed thereafter periodically as per provisions of the Income-tax Act, 2025 and rules made thereunder.</li>
          <li>In case of any error/discrepancy in this receipt, including your Name, address, PAN, E-mail ID, WhatsApp number, etc., please contact the receipt-issuing centre for correction.</li>
          <li>Donations received on or after April 1, 2026 are governed by the Income-tax Act, 2025.</li>
        </ul>
      </div>

      <!-- Sacred Maha Mantra & Footer Closing -->
      <div class="mahamantra-section">
        <p class="mahamantra-sub">Thank you for your support.</p>
        <p class="mahamantra-italic">Please chant</p>
        <p class="mahamantra-bold">HARE KRISHNA HARE KRISHNA KRISHNA KRISHNA HARE HARE</p>
        <p class="mahamantra-bold">HARE RAMA HARE RAMA RAMA RAMA HARE HARE</p>
        <p class="mahamantra-italic">and be happy.</p>
        <span class="year-stamp">2026</span>
      </div>

    </div>
  </div>
</body>
</html>`;
}

let browserInstance: any = null;
let isPuppeteerSupported: boolean | null = null;

async function getBrowser() {
  if (isPuppeteerSupported === false) {
    return null;
  }

  try {
    if (browserInstance && browserInstance.connected) {
      return browserInstance;
    }
  } catch (_) {}

  try {
    // Dynamic import with short 3-second timeout
    const puppeteerModule = await import('puppeteer');
    const puppeteer = puppeteerModule.default || puppeteerModule;

    const launchPromise = puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote'
      ]
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Puppeteer launch timeout')), 3000)
    );

    browserInstance = await Promise.race([launchPromise, timeoutPromise]);
    isPuppeteerSupported = true;
    return browserInstance;
  } catch (error) {
    console.warn('Puppeteer not available or missing Linux libraries, permanently switching to ultra-fast PDFKit generator:', error);
    isPuppeteerSupported = false;
    browserInstance = null;
    return null;
  }
}

/**
 * Generates an exact, 1:1 pixel-perfect A4 PDF with instantaneous fallback
 */
export async function generateHtmlPdf(data: any): Promise<Buffer> {
  const receiptDetail: ReceiptDetailData = {
    receiptNo: formatDisplayReceiptNo(data.invoiceNumber),
    date: data.date || new Date(),
    amount: Number(data.amount) || 0,
    name: data.name || '',
    address: data.address || '',
    pin: data.pin || '',
    pan: data.panCard || '',
    mobile: data.phone || '',
    email: data.email || '',
    paymentMode: data.paymentMethod || 'Online Payment - UPI',
    paymentDetails: data.txnid || '',
    purpose: data.purpose || 'General Donation / Seva',
  };

  try {
    const browser = await getBrowser();
    if (!browser) {
      // Fallback directly and instantly to pdfkit generator (< 50ms)
      return await generateDonationPDF(data);
    }

    const html = generateReceiptHtml(receiptDetail);
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
      await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 5000 });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
        preferCSSPageSize: true
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
  } catch (err) {
    console.warn('Puppeteer rendering failed, falling back to PDFKit:', err);
    return await generateDonationPDF(data);
  }
}
