import PDFKit from 'pdfkit';
import fs from 'fs';
import path from 'path';

export interface ReceiptDetailData {
  receiptNo: string;
  date: Date | string;
  amount: number;
  name: string;
  address?: string | null;
  pin?: string | null;
  pan?: string | null;
  mobile?: string | null;
  email?: string | null;
  paymentMode?: string | null;
  paymentDetails?: string | null;
  purpose?: string | null;
}

/**
 * Normalizes payment mode from gateway response or status into official receipt labels
 * e.g. "Online Payment - UPI", "Online Payment - Card", "Online Payment - Net Banking"
 */
export function formatPaymentMode(mode?: string | null, bankcode?: string | null, rawResponse?: string | null): string {
  if (rawResponse) {
    try {
      const parsed = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;
      if (!mode && parsed.mode) mode = parsed.mode;
      if (!bankcode && parsed.bankcode) bankcode = parsed.bankcode;
    } catch (_) {}
  }

  const normalized = (mode || '').toUpperCase().trim();
  const bank = (bankcode || '').toUpperCase().trim();

  if (normalized === 'UPI' || bank === 'INTENT' || bank === 'UPI' || normalized.includes('UPI')) {
    return 'Online Payment - UPI';
  }
  if (normalized === 'CC' || normalized === 'DC' || normalized === 'CARD' || normalized === 'CD' || normalized === 'DEBIT_CARD' || normalized === 'CREDIT_CARD') {
    return 'Online Payment - Card';
  }
  if (normalized === 'NB' || normalized === 'NETBANKING' || normalized.includes('NET_BANKING')) {
    return `Online Payment - Net Banking${bank ? ` (${bank})` : ''}`;
  }
  if (normalized === 'WALLET' || normalized.includes('WALLET')) {
    return `Online Payment - Wallet${bank ? ` (${bank})` : ''}`;
  }
  if (normalized === 'CASH') {
    return 'Cash Payment';
  }
  if (normalized.includes('ONLINE')) {
    return 'Online Payment - UPI';
  }
  if (mode && mode.trim()) {
    return `Online Payment - ${mode.trim()}`;
  }
  return 'Online Payment - UPI';
}

/**
 * Converts a number to Indian currency words
 */
export function numberToIndianWords(amount: number): string {
  const rounded = Math.floor(Math.abs(amount));
  if (rounded === 0) return 'Rupees Zero Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const twoDigits = [
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tensMultiple = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertBelowHundred(n: number): string {
    if (n < 10) return singleDigits[n];
    if (n >= 10 && n < 20) return twoDigits[n - 10];
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return (tensMultiple[tens] + (ones > 0 ? ' ' + singleDigits[ones] : '')).trim();
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    let res = '';
    if (hundred > 0) {
      res += singleDigits[hundred] + ' Hundred';
    }
    if (remainder > 0) {
      if (res) res += ' ';
      res += convertBelowHundred(remainder);
    }
    return res;
  }

  let crore = Math.floor(rounded / 10000000);
  let remainder = rounded % 10000000;
  let lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  let thousand = Math.floor(remainder / 1000);
  let hundredPart = remainder % 1000;

  let words = '';
  if (crore > 0) {
    words += convertBelowHundred(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertBelowHundred(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertBelowHundred(thousand) + ' Thousand ';
  }
  if (hundredPart > 0) {
    words += convertThreeDigits(hundredPart);
  }

  return `Rupees ${words.trim()} Only`;
}

/**
 * Formats a dynamic receipt number from donation details or invoice number
 * E.g. "0048 69"
 */
export function formatDisplayReceiptNo(invoiceNumber?: string | null, id?: number): string {
  if (invoiceNumber && /^\d{4,6}$/.test(invoiceNumber.replace(/\s+/g, ''))) {
    const raw = invoiceNumber.replace(/\s+/g, '');
    return raw.length === 6 ? `${raw.slice(0, 4)} ${raw.slice(4)}` : raw;
  }
  
  if (invoiceNumber && invoiceNumber.startsWith('INV-')) {
    const parts = invoiceNumber.split('-');
    const suffix = parts[parts.length - 1] || '004869';
    const clean = suffix.padStart(6, '0').slice(-6);
    return `${clean.slice(0, 4)} ${clean.slice(4)}`;
  }

  const num = (id || 4869).toString().padStart(6, '0');
  return `${num.slice(0, 4)} ${num.slice(4)}`;
}

/**
 * Draws the complete ISKCON official receipt PDF into a PDFKit document (A4 Portrait 210mm x 297mm)
 */
export function drawISKCONReceipt(doc: PDFKit.PDFDocument, data: ReceiptDetailData) {
  const leftMargin = 32;
  const contentWidth = 531.28;

  // 1. Full Page Authentic Letterhead Background
  const bgPath = path.join(process.cwd(), 'server/assets/iskcon-letterhead-bg.png');
  const bgExists = fs.existsSync(bgPath);
  if (bgExists) {
    try {
      doc.image(bgPath, 0, 0, { width: 595.28, height: 841.89 });
    } catch (e) {
      console.warn('Could not load letterhead background image:', e);
    }
  }

  if (!bgExists) {
    // Watermark fallback
    doc.save();
    doc.fillColor('#10B981')
       .fillOpacity(0.04)
       .fontSize(8);
    for (let y = 15; y < 820; y += 18) {
      for (let x = 10; x < 570; x += 110) {
        doc.text('ISKCON ISKCON', x, y, { lineBreak: false });
      }
    }
    doc.restore();

    // Top Header - Left Lotus Logo & Text
    doc.save();
    const logoX = 48;
    const logoY = 32;
    doc.lineWidth(1.5).strokeColor('#D97706');
    doc.path(`M ${logoX} ${logoY + 28} Q ${logoX - 8} ${logoY + 14} ${logoX} ${logoY} Q ${logoX + 8} ${logoY + 14} ${logoX} ${logoY + 28}`).stroke();
    doc.path(`M ${logoX} ${logoY + 28} Q ${logoX - 16} ${logoY + 16} ${logoX - 18} ${logoY + 6} Q ${logoX - 8} ${logoY + 18} ${logoX} ${logoY + 28}`).stroke();
    doc.path(`M ${logoX} ${logoY + 28} Q ${logoX + 16} ${logoY + 16} ${logoX + 18} ${logoY + 6} Q ${logoX + 8} ${logoY + 18} ${logoX} ${logoY + 28}`).stroke();
    doc.path(`M ${logoX} ${logoY + 28} Q ${logoX - 24} ${logoY + 22} ${logoX - 28} ${logoY + 16} Q ${logoX - 14} ${logoY + 24} ${logoX} ${logoY + 28}`).stroke();
    doc.path(`M ${logoX} ${logoY + 28} Q ${logoX + 24} ${logoY + 22} ${logoX + 28} ${logoY + 16} Q ${logoX + 14} ${logoY + 24} ${logoX} ${logoY + 28}`).stroke();

    doc.font('Helvetica-Bold')
       .fontSize(8)
       .fillColor('#B45309')
       .text('ISKCON®', logoX - 30, logoY + 34, { width: 60, align: 'center' });

    doc.font('Helvetica-Bold')
       .fontSize(8)
       .fillColor('#000000')
       .text('JUHU', logoX - 30, logoY + 44, { width: 60, align: 'center' })
       .text('MUMBAI', logoX - 30, logoY + 54, { width: 60, align: 'center' });
    doc.restore();
  }

  // 2. Top Center Title & Subtitle
  doc.font('Helvetica-Bold')
     .fontSize(13.5)
     .fillColor('#1E3A8A') // Deep Blue
     .text('International Society for Krishna Consciousness (ISKCON)', 110, 20, { width: 440, align: 'center' });

  doc.font('Helvetica-Bold')
     .fontSize(8.5)
     .fillColor('#2563EB')
     .text('Founder-Acharya: His Divine Grace A. C.   Bhaktivedanta Swami Prabhupada', 110, 36, { width: 440, align: 'center' });

  // 3. Yellow Center Address Box
  const yellowBoxX = 160;
  const yellowBoxY = 48;
  const yellowBoxW = 188;
  const yellowBoxH = 64;
  doc.save();
  doc.rect(yellowBoxX, yellowBoxY, yellowBoxW, yellowBoxH)
     .fillAndStroke('#FEF9C3', '#FDE047');
  doc.font('Helvetica-Bold')
     .fontSize(7.5)
     .fillColor('#111827')
     .text('Branch: Juhu *', yellowBoxX, yellowBoxY + 5, { width: yellowBoxW, align: 'center' })
     .text('Department: BHISMA', yellowBoxX, yellowBoxY + 14, { width: yellowBoxW, align: 'center' });
  doc.font('Helvetica')
     .fontSize(7.5)
     .fillColor('#1F2937')
     .text('Hare Krishna Land', yellowBoxX, yellowBoxY + 24, { width: yellowBoxW, align: 'center' })
     .text('Juhu, Mumbai - 400049', yellowBoxX, yellowBoxY + 34, { width: yellowBoxW, align: 'center' })
     .text('Mobile: 7400056919', yellowBoxX, yellowBoxY + 44, { width: yellowBoxW, align: 'center' })
     .text('E-mail: bhisma@iskcontrust.org', yellowBoxX, yellowBoxY + 54, { width: yellowBoxW, align: 'center' });
  doc.restore();

  // 4. Right Header: Receipt No, DONOR'S COPY, Date
  doc.font('Helvetica-Bold')
     .fontSize(8.5)
     .fillColor('#DB2777')
     .text('Donation Receipt No.', 372, 48);

  const displayReceiptNo = data.receiptNo;
  doc.font('Helvetica-Bold')
     .fontSize(16)
     .fillColor('#000000')
     .text(displayReceiptNo, 372, 59);

  // Pink DONOR'S COPY Badge
  doc.save();
  doc.roundedRect(372, 78, 62, 34, 3)
     .fill('#EC4899');
  doc.font('Helvetica-Bold')
     .fontSize(8)
     .fillColor('#FFFFFF')
     .text("DONOR'S\nCOPY", 372, 85, { width: 62, align: 'center' });
  doc.restore();

  // Date Box
  const dateBoxX = 440;
  const dateBoxY = 78;
  const dateBoxW = 123;
  const dateBoxH = 34;
  doc.save();
  doc.roundedRect(dateBoxX, dateBoxY, dateBoxW, dateBoxH, 3)
     .lineWidth(0.8)
     .fillAndStroke('#FFF', '#F472B6');
  doc.font('Helvetica-Bold')
     .fontSize(7.5)
     .fillColor('#DB2777')
     .text('Date', dateBoxX + 8, dateBoxY + 4);
  
  const formattedDate = data.date instanceof Date
    ? data.date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : String(data.date || new Date().toLocaleDateString('en-IN'));

  doc.font('Helvetica-Bold')
     .fontSize(10)
     .fillColor('#111827')
     .text(formattedDate, dateBoxX, dateBoxY + 16, { width: dateBoxW, align: 'center' });
  doc.restore();

  // 5. Donation Amount in Rupees Section (Heading cleanly INSIDE the box)
  const amountBoxY = 122;
  const amountBoxH = 38;
  doc.save();
  doc.roundedRect(leftMargin, amountBoxY, contentWidth, amountBoxH, 4)
     .lineWidth(0.8)
     .fillAndStroke('#FFF', '#F472B6');

  // Title inside at top
  doc.font('Helvetica-Bold')
     .fontSize(8)
     .fillColor('#DB2777')
     .text('Donation Amount in Rupees', leftMargin + 12, amountBoxY + 6);

  // Amount In Numbers & Words directly below
  const amountWords = numberToIndianWords(data.amount);
  const formattedAmountNum = `Rs. ${Number(data.amount).toLocaleString('en-IN')}/-`;
  
  doc.font('Helvetica-Bold')
     .fontSize(11)
     .fillColor('#111827')
     .text(formattedAmountNum, leftMargin + 12, amountBoxY + 18, { lineBreak: false });

  const numWidth = doc.widthOfString(formattedAmountNum);
  doc.font('Helvetica-Bold')
     .fontSize(9.5)
     .fillColor('#374151')
     .text(`   (${amountWords})`, leftMargin + 12 + numWidth, amountBoxY + 19, { width: contentWidth - numWidth - 30, lineBreak: false });
  doc.restore();

  // 6. Middle Section: Two Columns (Donor Details on Left, 4 Stacked Boxes on Right)
  const middleY = 168;
  const colGap = 10;
  const leftColW = 258;
  const rightColW = contentWidth - leftColW - colGap;
  const colHeight = 160;

  // --- Left Column: Donor Details (Heading cleanly INSIDE the box) ---
  doc.save();
  doc.roundedRect(leftMargin, middleY, leftColW, colHeight, 4)
     .lineWidth(0.8)
     .fillAndStroke('#FFF', '#F472B6');

  doc.font('Helvetica-Bold')
     .fontSize(8)
     .fillColor('#DB2777')
     .text('Donor Details (T&C mentioned backside for tax exemption)', leftMargin + 10, middleY + 7);

  // Subtle separator line under title
  doc.moveTo(leftMargin + 10, middleY + 20)
     .lineTo(leftMargin + leftColW - 10, middleY + 20)
     .strokeColor('#FBCFE8')
     .lineWidth(0.6)
     .stroke();

  const donorFieldsY = middleY + 26;
  const lineHeight = 21;

  const drawField = (label: string, value: string, yPos: number, maxLines = 1) => {
    doc.font('Helvetica')
       .fontSize(8)
       .fillColor('#4B5563')
       .text(label, leftMargin + 10, yPos, { width: 54 });
    doc.font('Helvetica-Bold')
       .fontSize(8)
       .fillColor('#111827')
       .text(value || '-', leftMargin + 66, yPos, { width: leftColW - 76, lineBreak: true, height: maxLines * 11 });
  };

  drawField('Name:', data.name || '-', donorFieldsY, 1);
  drawField('Address:', data.address || '-', donorFieldsY + lineHeight, 2);
  drawField('PIN:', data.pin || '-', donorFieldsY + lineHeight * 2.4, 1);
  drawField('PAN:', data.pan || '-', donorFieldsY + lineHeight * 3.3, 1);
  drawField('Mobile:', data.mobile || '-', donorFieldsY + lineHeight * 4.2, 1);
  drawField('E-mail:', data.email || '-', donorFieldsY + lineHeight * 5.1, 1);
  doc.restore();

  // --- Right Column: 4 Stacked Boxes (All Headings cleanly INSIDE each box) ---
  const rightColX = leftMargin + leftColW + colGap;
  const boxH = 32;
  const boxSpacing = 6;

  // Box 1: Mode of Payment
  const b1Y = middleY;
  const formattedMode = formatPaymentMode(data.paymentMode, null, null);
  doc.save();
  doc.roundedRect(rightColX, b1Y, rightColW, boxH, 4)
     .lineWidth(0.8)
     .fillAndStroke('#FFF', '#F472B6');
  doc.font('Helvetica-Bold')
     .fontSize(7.5)
     .fillColor('#DB2777')
     .text('Mode of Payment (Cheque / Online / UPI / Cash)', rightColX + 10, b1Y + 5);
  doc.font('Helvetica-Bold')
     .fontSize(9)
     .fillColor('#111827')
     .text(formattedMode, rightColX + 10, b1Y + 16, { width: rightColW - 20, lineBreak: false });
  doc.restore();

  // Box 2: Payment Details
  const b2Y = b1Y + boxH + boxSpacing;
  doc.save();
  doc.roundedRect(rightColX, b2Y, rightColW, boxH, 4)
     .lineWidth(0.8)
     .fillAndStroke('#FFF', '#F472B6');
  doc.font('Helvetica-Bold')
     .fontSize(7.5)
     .fillColor('#DB2777')
     .text('Payment Details (Cheque / Transaction Details)', rightColX + 10, b2Y + 5);
  doc.font('Helvetica')
     .fontSize(8)
     .fillColor('#111827')
     .text(data.paymentDetails ? `Txn ID: ${data.paymentDetails}` : 'Online Payment', rightColX + 10, b2Y + 16, { width: rightColW - 20, lineBreak: false, ellipsis: true });
  doc.restore();

  // Box 3: Purpose of Donation
  const b3Y = b2Y + boxH + boxSpacing;
  doc.save();
  doc.roundedRect(rightColX, b3Y, rightColW, boxH, 4)
     .lineWidth(0.8)
     .fillAndStroke('#FFF', '#F472B6');
  doc.font('Helvetica-Bold')
     .fontSize(7.5)
     .fillColor('#DB2777')
     .text('Purpose of Donation (Corpus / General / Others)', rightColX + 10, b3Y + 5);
  doc.font('Helvetica-Bold')
     .fontSize(9)
     .fillColor('#111827')
     .text(data.purpose || 'General Donation / Seva', rightColX + 10, b3Y + 16, { width: rightColW - 20, lineBreak: false, ellipsis: true });
  doc.restore();

  // Box 4: Signatures Split
  const b4Y = b3Y + boxH + boxSpacing;
  const sigW = (rightColW - 8) / 2;
  const sigH = colHeight - (3 * boxH + 3 * boxSpacing); // 160 - 114 = 46 pt

  // 4a: Donor Signature
  doc.save();
  doc.roundedRect(rightColX, b4Y, sigW, sigH, 4)
     .lineWidth(0.8)
     .fillAndStroke('#FFF', '#F472B6');
  doc.font('Helvetica')
     .fontSize(6.5)
     .fillColor('#4B5563')
     .text('Donor Signature for Cash Payment', rightColX + 2, b4Y + sigH - 12, { width: sigW - 4, align: 'center' });
  doc.restore();

  // 4b: ISKCON Representative Signature
  doc.save();
  doc.roundedRect(rightColX + sigW + 8, b4Y, sigW, sigH, 4)
     .lineWidth(0.8)
     .fillAndStroke('#FFF', '#F472B6');
  doc.font('Helvetica')
     .fontSize(6.5)
     .fillColor('#4B5563')
     .text('Signature of ISKCON Representative', rightColX + sigW + 8 + 2, b4Y + sigH - 12, { width: sigW - 4, align: 'center' });
  doc.restore();

  // 7. Yellow Bottom Info Box (Registered Office)
  const bottomYellowY = middleY + colHeight + 10;
  const ptoW = 28;
  const bottomYellowW = contentWidth - ptoW - 6;
  const bottomYellowH = 28;

  doc.save();
  doc.rect(leftMargin, bottomYellowY, bottomYellowW, bottomYellowH)
     .fillAndStroke('#FEF9C3', '#FDE047');
  doc.font('Helvetica')
     .fontSize(6.8)
     .fillColor('#1F2937')
     .text('Registered Office: Hare Krishna Land, Juhu, Mumbai - 400 049.  Mobile: 72088 46210.  E-mail: info@iskconindia.org', leftMargin + 4, bottomYellowY + 4, { width: bottomYellowW - 8, align: 'center' })
     .text('Registered under Maharashtra Public Trust Act 1950, vide Regn. No.: F-2179 (Mumbai). Unique Regn. No. : AAATI0017P27MB02', leftMargin + 4, bottomYellowY + 15, { width: bottomYellowW - 8, align: 'center' });
  doc.restore();

  // P.T.O Box
  const ptoX = leftMargin + bottomYellowW + 6;
  doc.save();
  doc.rect(ptoX, bottomYellowY, ptoW, bottomYellowH)
     .lineWidth(0.8)
     .fillAndStroke('#FFFFFF', '#9CA3AF');
  doc.font('Helvetica-Bold')
     .fontSize(7.5)
     .fillColor('#111827')
     .text('P. T. O.', ptoX, bottomYellowY + 9, { width: ptoW, align: 'center' });
  doc.restore();

  // 8. Terms and Conditions (Lower Half)
  const tcY = bottomYellowY + bottomYellowH + 12;
  doc.font('Helvetica-Bold')
     .fontSize(8.5)
     .fillColor('#111827')
     .text('Please note Terms and Conditions (T&C):', leftMargin, tcY);

  const bulletPoints = [
    'This donation receipt is an acknowledgement only and not for the purpose of claiming deduction under Section 133 of the Income-tax Act, 2025 (Previously 80G Deduction).',
    'Form No. 114 (10BE), i.e., Certificate of donation under the relevant provisions of Section 133 of the Income-tax Act, 2025, will be issued to you as per provisions of the Income-tax Act, 2025 and rules made thereunder.',
    'For all types of donations, irrespective of amount and mode of payment, full legal name and address with PIN are required. Further, PAN is compulsory to obtain Form No. 114 (10BE). Please ensure that the same are mentioned correctly in the donation receipt.',
    'Form No. 114 (10BE) is not available for any cash donation.',
    'Form N0. 114 (10BE) will be available in PDF version only. Please ensure to mention correct WhatsApp number and E-mail ID to receive the same.',
    'PAN is compulsory for all donations of Rs. 50,000/- or more.',
    'In case of payment by cheque, this donation receipt is valid subject to clearance of the cheque.',
    "ISKCON's Unique Registration Number (URN) for donations eligible under Section 133 of the Income-tax Act, 2025 (previously Section 80G) is - AAATI0017P27MB02 – is valid till March 31, 2031 and is to be renewed thereafter periodically as per provisions of the Income-tax Act, 2025 and rules made thereunder.",
    'In case of any error/discrepancy in this receipt, including your Name, address, PAN, E-mail ID, WhatsApp number, etc., please contact the receipt-issuing centre for correction.',
    'Donations received on or after April 1, 2026 are governed by the Income-tax Act, 2025.'
  ];

  let currentTcY = tcY + 12;
  bulletPoints.forEach((bp) => {
    doc.font('Helvetica')
       .fontSize(7)
       .fillColor('#1F2937')
       .text('•  ', leftMargin, currentTcY, { lineBreak: false });
    doc.text(bp, leftMargin + 10, currentTcY, { width: contentWidth - 12, lineGap: 1.5 });
    const textHeight = doc.heightOfString(bp, { width: contentWidth - 12 });
    currentTcY += textHeight + 3.5;
  });

  // 9. Sacred Maha-Mantra & Footer Closing
  const footerY = Math.max(currentTcY + 8, 750);
  doc.font('Helvetica')
     .fontSize(7.5)
     .fillColor('#4B5563')
     .text('Thank you for your support.', leftMargin, footerY, { width: contentWidth, align: 'center' });

  doc.font('Helvetica-Oblique')
     .fontSize(7)
     .fillColor('#6B7280')
     .text('Please chant', leftMargin, footerY + 11, { width: contentWidth, align: 'center' });

  doc.font('Helvetica-Bold')
     .fontSize(8.5)
     .fillColor('#111827')
     .text('HARE KRISHNA HARE KRISHNA KRISHNA KRISHNA HARE HARE', leftMargin, footerY + 22, { width: contentWidth, align: 'center' })
     .text('HARE RAMA HARE RAMA RAMA RAMA HARE HARE', leftMargin, footerY + 33, { width: contentWidth, align: 'center' });

  doc.font('Helvetica-Oblique')
     .fontSize(7)
     .fillColor('#6B7280')
     .text('and be happy.', leftMargin, footerY + 44, { width: contentWidth, align: 'center' });

  // Year 2026 Stamp
  doc.font('Helvetica')
     .fontSize(8)
     .fillColor('#9CA3AF')
     .text('2026', leftMargin + contentWidth - 28, footerY + 44);
}

/**
 * Helper to generate a PDF buffer using exact HTML-to-PDF with PDFKit fallback
 */
export async function generateDonationPDF(data: any): Promise<Buffer> {
  try {
    const { generateHtmlPdf } = await import('./puppeteerPdfGenerator');
    const buffer = await generateHtmlPdf(data);
    if (buffer && buffer.length > 0) {
      return buffer;
    }
  } catch (err) {
    console.warn('Puppeteer PDF generation failed, falling back to PDFKit vector rendering:', err);
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFKit({
      size: 'A4',
      margin: 0,
      info: {
        Title: `Donation Receipt - ${data.invoiceNumber || data.txnid || 'ISKCON'}`,
        Author: 'ISKCON Juhu Mumbai',
        Subject: 'Donation Receipt',
        Creator: 'ISKCON Juhu Donation Portal',
      }
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    const receiptData: ReceiptDetailData = {
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

    drawISKCONReceipt(doc, receiptData);
    doc.end();
  });
}
