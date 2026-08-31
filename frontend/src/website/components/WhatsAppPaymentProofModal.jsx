import React, { useState } from 'react';
import { X, Send, QrCode, ShieldCheck, Copy, Check, ExternalLink, IndianRupee } from 'lucide-react';
import {
  DEFAULT_UPI_VPA,
  DEFAULT_UPI_PAYEE,
  DEFAULT_HELPLINE_NUMBER,
  createPaymentProofWhatsAppUrl,
  sanitizeWhatsAppPhone,
} from '@/utils/whatsappTemplates';

export default function WhatsAppPaymentProofModal({
  isOpen,
  onClose,
  bookingCode = '',
  customerName = '',
  customerPhone = '',
  amount = 0,
}) {
  const [name, setName] = useState(customerName);
  const [phone, setPhone] = useState(customerPhone);
  const [bCode, setBCode] = useState(bookingCode);
  const [paidAmount, setPaidAmount] = useState(amount || 500);
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);

  React.useEffect(() => {
    if (bookingCode) setBCode(bookingCode);
    if (customerName) setName(customerName);
    if (customerPhone) setPhone(customerPhone);
    if (amount) setPaidAmount(amount);
  }, [bookingCode, customerName, customerPhone, amount]);

  if (!isOpen) return null;

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(DEFAULT_UPI_VPA);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleSendProof = (e) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      alert('Please enter your 12-digit UPI Reference / UTR Number before submitting.');
      return;
    }

    const targetAccountPhone = '917026648960';
    const whatsappUrl = createPaymentProofWhatsAppUrl({
      accountPhone: targetAccountPhone,
      bookingCode: bCode || 'BOOKING-REF',
      customerName: name || 'Customer',
      customerPhone: phone || '',
      amountPaid: Number(paidAmount) || 0,
      utrNumber: utrNumber.trim(),
    });

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 my-auto text-left">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#12382D] to-[#0A2620] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-syne">UPI Advance Verification</h3>
              <p className="text-xs text-gray-300">Submit UTR / Ref No. for Instant Confirmation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* UPI Details Box */}
        <div className="p-5 space-y-4 text-xs">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                <QrCode className="w-4 h-4 text-emerald-700" />
                Verified UPI Payee Details:
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Instant Verification
              </span>
            </div>

            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200/80">
              <div>
                <div className="text-[10px] text-gray-500 font-medium">UPI ID / VPA:</div>
                <div className="font-mono font-bold text-sm text-gray-900">{DEFAULT_UPI_VPA}</div>
                <div className="text-[10px] text-emerald-700">Payee: {DEFAULT_UPI_PAYEE}</div>
              </div>
              <button
                type="button"
                onClick={handleCopyVpa}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-xs flex items-center gap-1 border border-emerald-300 transition-all cursor-pointer"
              >
                {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedVpa ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSendProof} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Booking Reference
                </label>
                <input
                  type="text"
                  value={bCode}
                  onChange={(e) => setBCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-mono text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Deposit / Advance Paid (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-gray-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full pl-6 pr-3 py-2 border border-gray-200 rounded-xl font-mono text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  WhatsApp Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit number"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-mono text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                UPI Reference / UTR Number (12 Digits) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="e.g. 423589123456 or bank transaction ref"
                className="w-full px-3 py-2.5 border-2 border-emerald-300 rounded-xl font-mono text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-400"
                required
              />
              <p className="text-[10px] text-gray-500 mt-1">
                You can find the 12-digit UTR in Google Pay, PhonePe, Paytm, or your banking app under payment details.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2.5 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-98"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Proof via WhatsApp</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
