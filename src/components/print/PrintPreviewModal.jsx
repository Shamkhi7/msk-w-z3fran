import React, { useRef } from 'react';
import { Printer, X, Check, Copy } from 'lucide-react';
import { SalesReceipt } from './SalesReceipt';
import { ReservationReceipt } from './ReservationReceipt';
import { ExpenseVoucherReceipt } from './ExpenseVoucherReceipt';
import { ZReportReceipt } from './ZReportReceipt';
import { usePOS } from '../../context/POSContext';

export function PrintPreviewModal() {
  const { printJob, closePrintJob, storeSettings } = usePOS();
  const printAreaRef = useRef(null);

  if (!printJob.isOpen || !printJob.type) return null;

  const handlePrint = () => {
    window.print();
  };

  const getTitle = () => {
    switch (printJob.type) {
      case 'sale':
        return 'معاينة وصل البيع (حراري 80mm)';
      case 'reservation':
        return 'معاينة وصل حجز قالب الكيك';
      case 'expense':
        return 'معاينة سند الصرف النقدي';
      case 'zreport':
        return 'معاينة تقرير الإغلاق المالي (Z-Report)';
      default:
        return 'معاينة الطباعة';
    }
  };

  const renderReceiptContent = () => {
    switch (printJob.type) {
      case 'sale':
        return <SalesReceipt sale={printJob.data} storeSettings={storeSettings} />;
      case 'reservation':
        return <ReservationReceipt reservation={printJob.data} storeSettings={storeSettings} />;
      case 'expense':
        return <ExpenseVoucherReceipt expense={printJob.data} storeSettings={storeSettings} />;
      case 'zreport':
        return <ZReportReceipt report={printJob.data} storeSettings={storeSettings} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* 
        1. Isolated Print Container Mounted for Browser Print Engine
        Only visible when window.print() is executed
      */}
      <div id="thermal-print-area" className="hidden-on-screen">
        {renderReceiptContent()}
      </div>

      {/* 
        2. On-screen Interactive Preview Dialog (Hidden in print)
      */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm no-print animate-fade-in">
        <div className="bg-[#FAF8F5] border border-amber-900/20 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="bg-brand-800 text-warm-50 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-gold-400" />
              <h3 className="font-bold text-sm tracking-wide">{getTitle()}</h3>
            </div>
            <button
              onClick={closePrintJob}
              className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-brand-900/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Paper Guide Banner */}
          <div className="bg-amber-50 px-4 py-2 border-b border-amber-200/60 text-[11px] text-amber-900 flex items-center justify-between">
            <span>قياس الطباعة المخصص: <strong>72.1 مم</strong> (رول 80 مم)</span>
            <span className="bg-brand-800 text-white text-[10px] px-2 py-0.5 rounded font-mono">
              80mm Roll
            </span>
          </div>

          {/* Thermal Receipt Visual Preview Box */}
          <div className="p-4 overflow-y-auto flex-1 bg-stone-200/70 flex justify-center items-start">
            <div
              ref={printAreaRef}
              className="bg-white shadow-xl rounded-sm border border-stone-300 p-3 min-w-[72.1mm] max-w-[72.1mm] transition-transform"
              style={{ width: '72.1mm' }}
            >
              {renderReceiptContent()}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-4 bg-white border-t border-stone-200 flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 bg-brand-800 hover:bg-brand-900 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <Printer className="w-5 h-5 text-gold-400" />
              <span>إرسال إلى الطابعة الحرارية</span>
            </button>
            <button
              onClick={closePrintJob}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium py-3 px-4 rounded-xl transition-colors text-sm"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
