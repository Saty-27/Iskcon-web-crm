import React from 'react';

export interface OfficialDonationReceiptProps {
  donation: {
    id?: number;
    name: string;
    amount: number;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    pin?: string | null;
    panCard?: string | null;
    paymentId?: string | null;
    createdAt?: string | Date;
    invoiceNumber?: string | null;
    status?: string;
  };
  purpose?: string;
  paymentMode?: string;
}

/**
 * Normalizes payment mode into official receipt labels
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

// Convert amount to Indian currency words
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

  const crore = Math.floor(rounded / 10000000);
  let remainder = rounded % 10000000;
  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  const thousand = Math.floor(remainder / 1000);
  const hundredPart = remainder % 1000;

  let words = '';
  if (crore > 0) words += convertBelowHundred(crore) + ' Crore ';
  if (lakh > 0) words += convertBelowHundred(lakh) + ' Lakh ';
  if (thousand > 0) words += convertBelowHundred(thousand) + ' Thousand ';
  if (hundredPart > 0) words += convertThreeDigits(hundredPart);

  return `Rupees ${words.trim()} Only`;
}

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

export const OfficialDonationReceipt: React.FC<OfficialDonationReceiptProps> = ({
  donation,
  purpose = 'General Donation / Seva',
  paymentMode
}) => {
  const receiptNo = formatDisplayReceiptNo(donation.invoiceNumber, donation.id);
  const formattedDate = donation.createdAt
    ? new Date(donation.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('en-IN');

  const amountWords = numberToIndianWords(donation.amount);
  const displayPaymentMode = formatPaymentMode(paymentMode);

  return (
    <div className="w-full py-2">
      <div
        id="donation-receipt"
        className="relative text-gray-900 mx-auto border border-amber-200/90 shadow-2xl rounded-2xl p-4 sm:p-7 md:p-9 w-full max-w-3xl overflow-hidden font-sans text-left bg-[#fffdfa] print:shadow-none print:border-none print:p-0 print:m-0 print:w-[210mm] print:min-h-[297mm]"
      >
        {/* Independent Background Watermark Layer - Covers without distortion */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-20 sm:opacity-85"
          style={{
            backgroundImage: `url(/images/iskcon-letterhead-bg.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
          }}
        />

        <div className="relative z-10 space-y-3.5 sm:space-y-4">
          {/* Desktop / Tablet Header (>= sm) */}
          <div className="hidden sm:grid sm:grid-cols-12 items-center gap-2 sm:gap-3 border-b border-pink-200/60 pb-3">
            {/* Top Left Space placeholder for Letterhead Logo */}
            <div className="hidden sm:block sm:col-span-2" />

            {/* Center Title & Yellow Address Box */}
            <div className="sm:col-span-7 text-center px-1">
              <h1 className="text-xs sm:text-sm md:text-base font-bold text-blue-900 leading-tight drop-shadow-sm">
                International Society for Krishna Consciousness (ISKCON)
              </h1>
              <p className="text-[8.5px] sm:text-[9.5px] md:text-[10.5px] text-blue-700 font-semibold mb-1.5 whitespace-nowrap tracking-tight">
                Founder-Acharya: His Divine Grace A. C. &nbsp;Bhaktivedanta Swami Prabhupada
              </p>

              <div className="bg-yellow-100/90 border border-yellow-300 rounded-md py-1 px-2.5 text-[9px] sm:text-[9.5px] leading-tight text-gray-800 mx-auto max-w-[225px] shadow-sm backdrop-blur-xs">
                <div className="font-bold text-gray-900">Branch: Juhu *</div>
                <div className="font-bold text-gray-900">Department: BHISMA</div>
                <div>Hare Krishna Land</div>
                <div>Juhu, Mumbai - 400049</div>
                <div>📱 Mobile: 7400056919</div>
                <div>E-mail: bhisma@iskcontrust.org</div>
              </div>
            </div>

            {/* Right Receipt Info */}
            <div className="sm:col-span-3 flex flex-col items-end text-right gap-1.5">
              <div>
                <div className="text-[10px] sm:text-[10.5px] font-bold text-pink-600 leading-none">Donation Receipt No.</div>
                <div className="text-lg sm:text-2xl font-black font-mono text-gray-900 tracking-wider mt-0.5">{receiptNo}</div>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="bg-pink-600 text-white font-bold text-[8.5px] sm:text-[9.5px] px-2 py-1 rounded leading-tight text-center shadow-xs shrink-0">
                  DONOR'S<br />COPY
                </div>
                <div className="border border-pink-400 bg-white/95 rounded px-2 py-0.5 text-center min-w-[78px] sm:min-w-[88px] shadow-xs">
                  <div className="text-[8px] font-bold text-pink-600 -mt-0.5">Date</div>
                  <div className="text-[10px] sm:text-[10.5px] font-bold text-gray-900">{formattedDate}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Header (< sm) - Stacked cleanly without overlap */}
          <div className="sm:hidden flex flex-col items-center text-center gap-2 border-b border-pink-200/60 pb-3">
            <h1 className="text-sm font-bold text-blue-900 leading-tight">
              International Society for Krishna Consciousness (ISKCON)
            </h1>
            <p className="text-[9.5px] text-blue-700 font-semibold whitespace-nowrap tracking-tight">
              Founder-Acharya: His Divine Grace A. C. &nbsp;Bhaktivedanta Swami Prabhupada
            </p>

            <div className="bg-yellow-100/90 border border-yellow-300 rounded-md py-1.5 px-3 text-[9.5px] leading-tight text-gray-800 w-full max-w-[250px] shadow-sm">
              <div className="font-bold text-gray-900">Branch: Juhu *</div>
              <div className="font-bold text-gray-900">Department: BHISMA</div>
              <div>Hare Krishna Land</div>
              <div>Juhu, Mumbai - 400049</div>
              <div>📱 Mobile: 7400056919</div>
              <div>E-mail: bhisma@iskcontrust.org</div>
            </div>

            <div className="flex items-center justify-between w-full max-w-[310px] px-1 pt-1">
              <div className="text-left">
                <div className="text-[9.5px] font-bold text-pink-600 leading-none">Donation Receipt No.</div>
                <div className="text-lg font-black font-mono text-gray-900 tracking-wider mt-0.5">{receiptNo}</div>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="bg-pink-600 text-white font-bold text-[8.5px] px-2 py-1 rounded leading-tight text-center shadow-xs">
                  DONOR'S<br />COPY
                </div>
                <div className="border border-pink-400 bg-white/95 rounded px-2 py-0.5 text-center min-w-[76px] shadow-xs">
                  <div className="text-[8px] font-bold text-pink-600">Date</div>
                  <div className="text-[10px] font-bold text-gray-900">{formattedDate}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 1. Donation Amount Section */}
          <div className="border border-pink-400 rounded-md p-2.5 px-4 bg-white/85 shadow-xs text-left">
            <div className="text-[10px] sm:text-[10.5px] font-bold text-pink-600 mb-0.5 tracking-tight">
              Donation Amount in Rupees
            </div>
            <div className="font-bold text-gray-900 text-sm sm:text-base tracking-wide break-words">
              ₹ {Number(donation.amount).toLocaleString('en-IN')}/-
              <span className="text-xs sm:text-sm font-semibold text-gray-700 ml-2">({amountWords})</span>
            </div>
          </div>

          {/* Two-Column Details Grid on Desktop / Single Column on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-0.5">
            {/* 2. Left Column: Donor Details Section */}
            <div className="md:col-span-6 border border-pink-400 rounded-md p-3.5 bg-white/85 shadow-xs flex flex-col justify-between">
              <div className="text-[10px] sm:text-[10.5px] font-bold text-pink-600 mb-2 tracking-tight border-b border-pink-100 pb-1">
                Donor Details (T&C mentioned backside for tax exemption)
              </div>
              <div className="space-y-1.5 text-xs text-gray-800 flex-1">
                <div className="flex items-baseline">
                  <span className="w-16 font-semibold text-gray-600 shrink-0">Name:</span>
                  <span className="font-bold text-gray-900 break-words">{donation.name || '-'}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="w-16 font-semibold text-gray-600 shrink-0">Address:</span>
                  <span className="font-medium text-gray-800 break-words">{donation.address || '-'}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="w-16 font-semibold text-gray-600 shrink-0">PIN:</span>
                  <span className="font-medium text-gray-800">{donation.pin || '-'}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="w-16 font-semibold text-gray-600 shrink-0">PAN:</span>
                  <span className="font-bold text-gray-900 uppercase font-mono">{donation.panCard || '-'}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="w-16 font-semibold text-gray-600 shrink-0">📱 Mobile:</span>
                  <span className="font-medium text-gray-800">{donation.phone || '-'}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="w-16 font-semibold text-gray-600 shrink-0">E-mail:</span>
                  <span className="font-medium text-gray-800 break-all">{donation.email || '-'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Stacked Info Boxes & Signatures */}
            <div className="md:col-span-6 flex flex-col justify-between gap-2.5">
              {/* 3. Mode of Payment Section */}
              <div className="border border-pink-400 rounded-md p-2 px-3 bg-white/85 shadow-xs">
                <div className="text-[9px] sm:text-[9.5px] font-bold text-pink-600 mb-0.5 tracking-tight">
                  Mode of Payment (Cheque / Online / UPI / Cash)
                </div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 break-words">
                  {displayPaymentMode}
                </div>
              </div>

              {/* 4. Payment Details Section */}
              <div className="border border-pink-400 rounded-md p-2 px-3 bg-white/85 shadow-xs">
                <div className="text-[9px] sm:text-[9.5px] font-bold text-pink-600 mb-0.5 tracking-tight">
                  Payment Details (Cheque / Transaction Details)
                </div>
                <div className="text-xs font-mono font-medium text-gray-800 break-all">
                  {donation.paymentId ? `Txn ID: ${donation.paymentId}` : 'Online Payment'}
                </div>
              </div>

              {/* 5. Purpose of Donation Section */}
              <div className="border border-pink-400 rounded-md p-2 px-3 bg-white/85 shadow-xs">
                <div className="text-[9px] sm:text-[9.5px] font-bold text-pink-600 mb-0.5 tracking-tight">
                  Purpose of Donation (Corpus / General / Others)
                </div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 break-words">
                  {purpose}
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div className="border border-pink-400 rounded-md h-12 flex flex-col justify-end items-center pb-1 bg-white/85 text-[8px] sm:text-[8.5px] text-gray-600 shadow-xs text-center px-1">
                  <span>Donor Signature for Cash Payment</span>
                </div>
                <div className="border border-pink-400 rounded-md h-12 flex flex-col justify-end items-center pb-1 bg-white/85 text-[8px] sm:text-[8.5px] text-gray-600 shadow-xs text-center px-1">
                  <span>Signature of ISKCON Representative</span>
                </div>
              </div>
            </div>
          </div>

          {/* Yellow Bottom Registered Office Box */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-yellow-100/90 border border-yellow-300 rounded p-2 text-center text-[9px] sm:text-[9.5px] leading-tight text-gray-800 shadow-sm">
              <div>
                Registered Office: Hare Krishna Land, Juhu, Mumbai - 400 049. 📱 Mobile: 72088 46210. E-mail: info@iskconindia.org
              </div>
              <div className="font-medium mt-0.5">
                Registered under Maharashtra Public Trust Act 1950, vide Regn. No.: F-2179 (Mumbai). Unique Regn. No. : AAATI0017P27MB02
              </div>
            </div>
            <div className="border border-gray-400 rounded px-1.5 py-3 text-[9px] font-bold text-gray-600 flex items-center justify-center shrink-0 bg-white/90">
              P. T. O.
            </div>
          </div>

          {/* Terms & Conditions Section */}
          <div className="border-t border-gray-300 pt-3 text-left">
            <h2 className="text-xs font-bold text-gray-900 mb-2">Please note Terms and Conditions (T&C):</h2>
            <ul className="text-[9.5px] sm:text-[10px] text-gray-800 space-y-1.5 list-disc list-outside pl-4 leading-relaxed">
              <li>
                This donation receipt is an acknowledgement only and not for the purpose of claiming deduction under Section 133 of the Income-tax Act, 2025 (Previously 80G Deduction).
              </li>
              <li>
                Form No. 114 (10BE), i.e., Certificate of donation under the relevant provisions of Section 133 of the Income-tax Act, 2025, will be issued to you as per provisions of the Income-tax Act, 2025 and rules made thereunder.
              </li>
              <li>
                For all types of donations, irrespective of amount and mode of payment, full legal name and address with PIN are required. Further, PAN is compulsory to obtain Form No. 114 (10BE). Please ensure that the same are mentioned correctly in the donation receipt.
              </li>
              <li>Form No. 114 (10BE) is not available for any cash donation.</li>
              <li>
                Form N0. 114 (10BE) will be available in PDF version only. Please ensure to mention correct WhatsApp number and E-mail ID to receive the same.
              </li>
              <li>PAN is compulsory for all donations of Rs. 50,000/- or more.</li>
              <li>In case of payment by cheque, this donation receipt is valid subject to clearance of the cheque.</li>
              <li>
                ISKCON's Unique Registration Number (URN) for donations eligible under Section 133 of the Income-tax Act, 2025 (previously Section 80G) is - AAATI0017P27MB02 – is valid till March 31, 2031 and is to be renewed thereafter periodically as per provisions of the Income-tax Act, 2025 and rules made thereunder.
              </li>
              <li>
                In case of any error/discrepancy in this receipt, including your Name, address, PAN, E-mail ID, WhatsApp number, etc., please contact the receipt-issuing centre for correction.
              </li>
              <li>Donations received on or after April 1, 2026 are governed by the Income-tax Act, 2025.</li>
            </ul>
          </div>

          {/* Sacred Maha-Mantra & Footer Closing */}
          <div className="pt-2 text-center text-xs text-gray-800 space-y-1 relative">
            <p className="font-medium text-gray-700">Thank you for your support.</p>
            <p className="italic text-gray-600 text-[11px]">Please chant</p>
            <p className="font-bold text-gray-900 tracking-wide text-xs sm:text-sm">
              HARE KRISHNA HARE KRISHNA KRISHNA KRISHNA HARE HARE
            </p>
            <p className="font-bold text-gray-900 tracking-wide text-xs sm:text-sm">
              HARE RAMA HARE RAMA RAMA RAMA HARE HARE
            </p>
            <p className="italic text-gray-600 text-[11px]">and be happy.</p>
            <span className="absolute right-0 bottom-0 text-[10px] text-gray-400 font-mono">2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialDonationReceipt;
