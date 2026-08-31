import React, { useState, useEffect, useRef } from 'react';
import {
  X, MessageSquare, Copy, Check, Send, Phone, User, Calendar, Car, Compass,
  Sparkles, RefreshCw, AlertCircle, ShieldCheck, MapPin, DollarSign, Edit3, Users,
  CheckCircle2, AlertTriangle, RotateCcw
} from 'lucide-react';
import {
  BookingDataInput,
  getTemplatesForBooking,
  TOUR_INSERTABLE_VARIABLES,
  FLEET_INSERTABLE_VARIABLES,
  extractBookingDetails,
  renderBookingTemplate,
  getRecommendedTemplateId,
  sanitizeWhatsAppPhone,
  isValidWhatsAppPhone,
  MessageTemplate
} from '@/utils/whatsappTemplates';

export interface WhatsAppBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDataInput | null;
  defaultTemplateId?: string;
}

export function WhatsAppBookingModal({
  isOpen,
  onClose,
  booking,
  defaultTemplateId,
}: WhatsAppBookingModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const bookingDetails = extractBookingDetails(booking);
  const isTour = bookingDetails.vertical === 'tour';
  const availableTemplates = getTemplatesForBooking(booking);
  const insertableVars = isTour ? TOUR_INSERTABLE_VARIABLES : FLEET_INSERTABLE_VARIABLES;

  useEffect(() => {
    if (isOpen && booking) {
      const templates = getTemplatesForBooking(booking);
      const initialTemplateId =
        defaultTemplateId && templates.some((t) => t.id === defaultTemplateId)
          ? defaultTemplateId
          : getRecommendedTemplateId(booking);

      setSelectedTemplateId(initialTemplateId);
      const matchedTemplate =
        templates.find((t) => t.id === initialTemplateId) || templates[0];

      if (matchedTemplate) {
        const parsed = renderBookingTemplate(matchedTemplate.template, booking);
        setMessageText(parsed);
      }

      const initialPhone = bookingDetails.raw_customer_phone || bookingDetails.clean_phone || '';
      setRecipientPhone(initialPhone);
      setCopied(false);
    }
  }, [isOpen, booking, defaultTemplateId]);

  if (!isOpen || !booking) return null;

  const cleanRecipient = sanitizeWhatsAppPhone(recipientPhone);
  const isPhoneValid = isValidWhatsAppPhone(recipientPhone);
  const isModifiedFromBooking = recipientPhone !== (bookingDetails.raw_customer_phone || '');

  const handleSelectTemplate = (template: MessageTemplate) => {
    setSelectedTemplateId(template.id);
    const parsed = renderBookingTemplate(template.template, booking);
    setMessageText(parsed);
  };

  const handleResetCurrentTemplate = () => {
    const matchedTemplate =
      availableTemplates.find((t) => t.id === selectedTemplateId) ||
      availableTemplates[0];
    if (matchedTemplate) {
      const parsed = renderBookingTemplate(matchedTemplate.template, booking);
      setMessageText(parsed);
    }
  };

  const handleResetRecipientPhone = () => {
    setRecipientPhone(bookingDetails.raw_customer_phone || '');
  };

  const handleInsertVariable = (tag: string) => {
    if (!textareaRef.current) {
      setMessageText((prev) => prev + ` ${tag}`);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = messageText.substring(0, start);
    const after = messageText.substring(end);

    const newText = before + tag + after;
    const parsed = renderBookingTemplate(newText, booking);
    setMessageText(parsed);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const nextPos = start + tag.length;
        textareaRef.current.setSelectionRange(nextPos, nextPos);
      }
    }, 50);
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSendWhatsApp = () => {
    if (!cleanRecipient || !isPhoneValid) {
      alert('Please enter a valid 10-digit customer WhatsApp phone number before sending.');
      return;
    }

    const encodedText = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${cleanRecipient}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-gray-100 my-auto">
        
        {/* HEADER */}
        <div className={`px-5 py-4 border-b border-gray-100 flex items-center justify-between text-white ${
          isTour
            ? 'bg-gradient-to-r from-emerald-950 via-[#12382D] to-[#0A2620]'
            : 'bg-gradient-to-r from-[#171F38] via-[#1E294B] to-[#121A30]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${
              isTour
                ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-400'
                : 'bg-indigo-500/20 border border-indigo-400/30 text-indigo-300'
            }`}>
              {isTour ? <Compass className="w-5 h-5" /> : <Car className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-syne tracking-tight">
                  {isTour ? 'Tour Package WhatsApp Dispatch' : 'Self-Drive & Fleet Dispatch'}
                </h3>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  isTour
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}>
                  {isTour ? '🗺️ Tours & Packages Only' : '🚗 Self-Drive / Fleet Only'}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                {isTour
                  ? 'Send curated itinerary confirmations, driver allotments & tour balance reminders to customer.'
                  : 'Send vehicle handover notices, hub pickup maps & deposit refund confirmations to customer.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">

          {/* 1. SUMMARY CARD */}
          <div className={`border rounded-2xl p-3.5 sm:p-4 grid grid-cols-1 md:grid-cols-4 gap-3 shadow-xs ${
            isTour ? 'bg-emerald-50/40 border-emerald-100' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className="space-y-1 md:border-r border-gray-200/80 pr-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-emerald-600" /> Customer Name
              </span>
              <div className="font-bold text-sm text-gray-900 truncate">{bookingDetails.customer_name}</div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                <span className="font-mono">{bookingDetails.display_phone}</span>
              </div>
            </div>

            <div className="space-y-1 md:border-r border-gray-200/80 pr-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                {isTour ? <Compass className="w-3 h-3 text-emerald-600" /> : <Car className="w-3 h-3 text-indigo-600" />}
                {isTour ? 'Tour Package' : 'Assigned Vehicle'}
              </span>
              <div className="font-bold text-gray-900 text-xs truncate">{bookingDetails.service_type}</div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {isTour ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded flex items-center gap-1">
                    <Users className="w-3 h-3" /> {bookingDetails.pax_count}
                  </span>
                ) : (
                  <span className="font-mono text-[10px] bg-slate-200/80 px-2 py-0.5 rounded font-bold text-slate-700">
                    {bookingDetails.vehicle_number}
                  </span>
                )}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isTour ? 'bg-amber-100/80 text-amber-900' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {bookingDetails.status}
                </span>
              </div>
            </div>

            <div className="space-y-1 md:border-r border-gray-200/80 pr-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-600" />
                {isTour ? 'Travel Dates' : 'Rental Duration'}
              </span>
              <div className="text-[11px] text-gray-800 font-semibold truncate">
                {isTour ? 'Departure:' : 'Pickup:'} {bookingDetails.pickup_date} ({bookingDetails.pickup_time})
              </div>
              <div className="text-[10px] text-gray-500 truncate">
                {isTour ? 'Return:' : 'Drop-off:'} {bookingDetails.dropoff_date} ({bookingDetails.dropoff_time})
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-600" /> Payment Summary
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] text-gray-500">Total:</span>
                <span className="font-bold text-gray-900">₹{bookingDetails.total_amount}</span>
              </div>
              <div className="flex items-baseline justify-between text-[11px]">
                <span className="text-emerald-700 font-medium">Advance: ₹{bookingDetails.advance_paid}</span>
                <span className="text-red-600 font-bold bg-red-50 px-1.5 py-0.2 rounded">
                  Due: ₹{bookingDetails.balance_amount}
                </span>
              </div>
            </div>
          </div>

          {/* 2. RECIPIENT PHONE ROUTING BOX */}
          <div className="bg-gradient-to-r from-emerald-50/80 to-green-50/50 border border-emerald-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 flex-wrap">
            <div className="space-y-1 flex-1 min-w-[260px]">
              <div className="flex items-center gap-2">
                <label htmlFor="recipient-phone-input" className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Recipient Customer WhatsApp Number:</span>
                </label>
                {isPhoneValid ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {isModifiedFromBooking ? 'Custom Recipient' : 'Booking Phone Verified'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Needs Valid Phone
                  </span>
                )}
              </div>
              <p className="text-[10px] text-emerald-800/80">
                Direct dispatch via <span className="font-mono font-bold">wa.me/{cleanRecipient || '...'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono font-bold text-xs text-gray-500 select-none">
                  🇮🇳
                </span>
                <input
                  id="recipient-phone-input"
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="Enter 10-digit phone"
                  className="pl-9 pr-3 py-1.5 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner w-44"
                />
              </div>

              {isModifiedFromBooking && (
                <button
                  type="button"
                  onClick={handleResetRecipientPhone}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> Revert
                </button>
              )}
            </div>
          </div>

          {/* 3. TEMPLATE SELECTION CHIPS */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                {isTour ? 'Select Tour Message Template' : 'Select Self-Drive & Rental Template'} ({availableTemplates.length})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {availableTemplates.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1 relative cursor-pointer ${
                      isSelected
                        ? isTour
                          ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{tpl.icon}</span>
                        <span className={`font-bold text-xs ${
                          isSelected ? (isTour ? 'text-emerald-950' : 'text-indigo-950') : 'text-gray-900'
                        }`}>
                          {tpl.title}
                        </span>
                      </div>
                      {isSelected && (
                        <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${isTour ? 'bg-emerald-500' : 'bg-indigo-600'}`} />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight">
                      {tpl.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. INSERT VARIABLES */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500 font-semibold flex items-center gap-1">
                <Edit3 className="w-3 h-3 text-indigo-500" /> Insert Variable at Cursor:
              </span>
              <button
                type="button"
                onClick={handleResetCurrentTemplate}
                className="text-[10px] font-bold text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Reset Template
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {insertableVars.map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => handleInsertVariable(v.tag)}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                    isTour
                      ? 'bg-emerald-50/50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                      : 'bg-indigo-50/50 hover:bg-indigo-100 border-indigo-200 text-indigo-800'
                  }`}
                >
                  + {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. EDITABLE TEXTAREA */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="whatsapp-draft-textarea" className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                <span>Message Draft (WhatsApp Formatted):</span>
              </label>
              <span className="text-[10px] font-mono text-gray-400">
                {messageText.length} characters
              </span>
            </div>

            <div className="relative rounded-2xl border border-gray-200 bg-[#FAF9F5] focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all overflow-hidden shadow-inner">
              <textarea
                id="whatsapp-draft-textarea"
                ref={textareaRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={10}
                className="w-full p-4 bg-transparent text-gray-800 font-sans text-xs sm:text-sm leading-relaxed resize-y focus:outline-none placeholder-gray-400"
                placeholder="Type your WhatsApp message draft here..."
              />
            </div>
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleCopyMessage}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border shadow-xs active:scale-95 cursor-pointer ${
              copied
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-500" />
                <span>Copy Message</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              disabled={!isPhoneValid}
              className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-md transition-all ${
                isPhoneValid
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-emerald-600/30 hover:scale-102 active:scale-98 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>🟢 Open in WhatsApp & Send ({cleanRecipient ? `+${cleanRecipient}` : 'No Phone'})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default WhatsAppBookingModal;
