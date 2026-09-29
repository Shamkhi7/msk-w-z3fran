import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Copy,
  Download,
  Share2,
  Check,
  Image as ImageIcon,
  MessageCircle,
  FileText,
  Sparkles,
  Printer,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { WhatsAppReceiptCard } from './WhatsAppReceiptCard';
import { sendReservationToStaffGroup } from '../../utils/whatsappHelper';

export function WhatsAppReceiptImageModal({
  isOpen,
  onClose,
  reservation,
  storeSettings,
  initialType = 'kitchen', // 'kitchen' | 'reservation' | 'dual'
}) {
  const [receiptType, setReceiptType] = useState(initialType);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageBlob, setImageBlob] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');

  const receiptRef = useRef(null);

  // Sync initial type on open
  useEffect(() => {
    if (isOpen) {
      setReceiptType(initialType || 'kitchen');
      setCopiedSuccess(false);
      setStatusNotice('');
      setImageBlob(null);
      setImageDataUrl('');
    }
  }, [isOpen, initialType]);

  // Generate image whenever receiptType changes or modal opens
  useEffect(() => {
    if (!isOpen || !reservation || !receiptRef.current) return;

    let isMounted = true;
    setIsGenerating(true);
    setStatusNotice('جاري إنشاء صورة عالية الدقة للوصل...');

    const timer = setTimeout(async () => {
      try {
        if (!receiptRef.current) return;

        const canvas = await html2canvas(receiptRef.current, {
          scale: 2.5, // 2.5x retina quality for ultra sharp Arabic text
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
          allowTaint: true,
          width: receiptRef.current.offsetWidth,
          height: receiptRef.current.offsetHeight,
        });

        if (!isMounted) return;

        const dataUrl = canvas.toDataURL('image/png');
        setImageDataUrl(dataUrl);

        canvas.toBlob((blob) => {
          if (!isMounted) return;
          setImageBlob(blob);
          setIsGenerating(false);
          setStatusNotice('');
        }, 'image/png', 0.95);
      } catch (err) {
        console.error('Failed to generate receipt image:', err);
        if (isMounted) {
          setIsGenerating(false);
          setStatusNotice('تعذر توليد الصورة، يمكنك إرسال الوصل كنص كتابي.');
        }
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, reservation, receiptType]);

  if (!isOpen || !reservation) return null;

  const bookingNo = reservation.manualBookingNo || reservation.receiptNumber || 'حجز';
  const fileName = `وصل-حجز-${bookingNo}.png`;

  // 1. Copy image directly to system clipboard
  const handleCopyImage = async () => {
    if (!imageBlob) return false;
    try {
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': imageBlob }),
        ]);
        setCopiedSuccess(true);
        setStatusNotice('✅ تم نسخ صورة الوصل بنجاح إلى الحافظة!');
        setTimeout(() => setCopiedSuccess(false), 3000);
        return true;
      }
    } catch (err) {
      console.warn('Direct clipboard image copy failed', err);
    }
    return false;
  };

  // 2. Open WhatsApp & copy image to clipboard for instant Ctrl+V
  const handleOpenWhatsAppWithImage = async () => {
    await handleCopyImage();

    // Determine target WhatsApp URL
    const staffPhone = (storeSettings.staffWhatsAppPhone || '').trim();
    let url = '';

    if (staffPhone) {
      let clean = staffPhone.replace(/[^0-9]/g, '');
      if (clean.startsWith('07')) clean = '964' + clean.slice(1);
      else if (clean.startsWith('7')) clean = '964' + clean;
      url = `https://wa.me/${clean}`;
    } else {
      url = 'https://web.whatsapp.com';
    }

    window.open(url, '_blank');
    setStatusNotice('📲 تم فتح الواتساب ونسخ الصورة! في خانة الكتابة اضغط (Ctrl + V) أو كلك يمين "لصق" للإرسال فوراً.');
  };

  // 3. Download image PNG file
  const handleDownloadImage = () => {
    if (!imageDataUrl) return;
    const a = document.createElement('a');
    a.href = imageDataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setStatusNotice(`📥 تم تنزيل صورة الوصل (${fileName}) في جهازك.`);
  };

  // 4. Native Device Web Share (if supported on touch devices / tablets)
  const canShare = typeof navigator !== 'undefined' && !!navigator.canShare;
  const handleNativeShare = async () => {
    if (!imageBlob || !canShare) return;
    try {
      const file = new File([imageBlob], fileName, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `وصل حجز كيك #${bookingNo}`,
          text: `تفاصيل حجز الكيك #${bookingNo} - مسك وزعفران 🎂`,
        });
      }
    } catch (err) {
      console.warn('Share dismissed or failed:', err);
    }
  };

  // 5. Fallback: Send as text if preferred
  const handleSendAsText = () => {
    sendReservationToStaffGroup(reservation, storeSettings);
    setStatusNotice('📲 تم فتح الواتساب مع النص الكتابي المنسق.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-[#FAF8F5] border-2 border-brand-900 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-brand-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-gold-500/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base flex items-center gap-2">
                <span>إرسال صورة الوصل لكروب الواتساب</span>
                <span className="text-xs bg-gold-400 text-brand-950 font-mono font-bold px-2 py-0.5 rounded-full">
                  #{bookingNo}
                </span>
              </h3>
              <p className="text-[11px] text-warm-200">
                الزبون: {reservation.customerName} {reservation.phone && `(${reservation.phone})`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-brand-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Type Selector Tabs */}
        <div className="p-2 sm:p-3 bg-stone-100 border-b border-stone-200 flex items-center justify-center gap-1.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setReceiptType('kitchen')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              receiptType === 'kitchen'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-300'
            }`}
          >
            <span>👨‍🍳 بون المعمل للشيف (بدون أسعار)</span>
          </button>

          <button
            type="button"
            onClick={() => setReceiptType('reservation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              receiptType === 'reservation'
                ? 'bg-brand-800 text-white shadow-xs'
                : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-300'
            }`}
          >
            <span>🧾 وصل الحجز المالي (مع الأسعار)</span>
          </button>

          <button
            type="button"
            onClick={() => setReceiptType('dual')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              receiptType === 'dual'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-300'
            }`}
          >
            <span>📑 الوصل المزدوج (كلاهما)</span>
          </button>
        </div>

        {/* Status Notification / Guide Banner */}
        {statusNotice && (
          <div className="bg-emerald-50 text-emerald-950 px-4 py-2 text-xs font-bold border-b border-emerald-200 flex items-center justify-between shrink-0 animate-fade-in">
            <span>{statusNotice}</span>
            {copiedSuccess && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
          </div>
        )}

        {/* Receipt Image / HTML Render Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-stone-200 flex justify-center items-start">
          <div className="shadow-2xl rounded-xl overflow-hidden bg-white">
            <div ref={receiptRef} style={{ backgroundColor: '#ffffff' }}>
              <WhatsAppReceiptCard
                reservation={reservation}
                storeSettings={storeSettings}
                receiptType={receiptType}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-300 space-y-2.5 shrink-0">
          {/* Main Action: Open WhatsApp + Copy to Clipboard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isGenerating || !imageBlob}
              onClick={handleOpenWhatsAppWithImage}
              className="sm:col-span-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
            >
              <MessageCircle className="w-5 h-5 text-emerald-200" />
              <span>فتح الواتساب ولصق الصورة (Ctrl + V) 📲</span>
            </button>

            <button
              type="button"
              disabled={isGenerating || !imageBlob}
              onClick={handleCopyImage}
              className="bg-stone-800 hover:bg-stone-900 disabled:opacity-50 text-white font-bold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
              title="نسخ صورة الوصل إلى الحافظة"
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-300" />
                  <span>نسخ الصورة 📋</span>
                </>
              )}
            </button>
          </div>

          {/* Secondary Utilities: Download, Native Share, Send as text */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isGenerating || !imageDataUrl}
                onClick={handleDownloadImage}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 border border-stone-300"
                title="تنزيل ملف الصورة وحفظه على الحاسبة"
              >
                <Download className="w-3.5 h-3.5 text-stone-600" />
                <span>حفظ الصورة (PNG) 📥</span>
              </button>

              {canShare && (
                <button
                  type="button"
                  disabled={isGenerating || !imageBlob}
                  onClick={handleNativeShare}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 border border-sky-300"
                  title="مشاركة الصورة مباشرة للتطبيقات"
                >
                  <Share2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>مشاركة مباشرة 📤</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleSendAsText}
              className="text-[11px] text-stone-500 hover:text-stone-800 underline transition-colors cursor-pointer"
            >
              إرسال كنص كتابي بدل الصورة
            </button>
          </div>

          {/* Quick Helper Note */}
          <div className="text-[10px] text-stone-500 text-center leading-tight">
            💡 <strong>طريقة الإرسال:</strong> اضغط على الزر الأخضر، سيتم نسخ صورة الوصل وفتح الواتساب، في شات الكروب اضغط <strong>Ctrl + V</strong> للإرسال فوراً كصورة مرفقة.
          </div>
        </div>
      </div>
    </div>
  );
}
