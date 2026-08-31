import React, { useState } from 'react';
import { X, Send, Compass, Car, Calendar, User, Phone, MessageSquare, Sparkles } from 'lucide-react';
import {
  createWhatsAppInquiryUrl,
  sanitizeWhatsAppPhone,
  isValidWhatsAppPhone,
  DEFAULT_HELPLINE_NUMBER,
} from '@/utils/whatsappTemplates';

export default function WhatsAppInquiryModal({
  isOpen,
  onClose,
  defaultService = 'Goa Cab Sightseeing Tour',
  hotlinePhone = '917026648960',
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState(defaultService);
  const [travelDate, setTravelDate] = useState('');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (defaultService) setService(defaultService);
  }, [defaultService]);

  if (!isOpen) return null;

  const handleSendInquiry = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (!phone.trim()) {
      alert('Please enter your WhatsApp contact number.');
      return;
    }

    const whatsappUrl = createWhatsAppInquiryUrl({
      hotlinePhone,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      serviceTitle: service.trim(),
      travelDate: travelDate.trim(),
      notes: notes.trim(),
    });

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#DFE8EC] my-auto text-left font-body">
        {/* Header */}
        <div className="bg-[#063247] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#288DA6]/20 border border-[#288DA6]/30 text-[#288DA6] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-display">Cab Castle WhatsApp Inquiry</h3>
              <p className="text-xs text-[#C3E7FA]">Instant quote &amp; cab booking directly on WhatsApp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSendInquiry} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Interested Vehicle / Tour Package <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="e.g. Thar 4x4, Swift Dzire, South Goa Tour..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                WhatsApp Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit number"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl font-mono text-xs font-semibold focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Preferred Travel Dates / Duration
            </label>
            <input
              type="text"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              placeholder="e.g. 15th to 18th Oct or Flexible"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Custom Requirements / Questions
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any questions about pickup hub, self-drive requirements, or custom timings..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs leading-relaxed focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Quick Preview Badge */}
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-[10px] text-gray-600 space-y-1">
            <div className="font-bold text-gray-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> WhatsApp Message Preview:
            </div>
            <p className="font-mono text-gray-500 truncate">
              *NEW INQUIRY* • {name || 'Customer'} • {service || 'Package'} • {travelDate || 'Flexible'}
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
              <span>Connect on WhatsApp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
