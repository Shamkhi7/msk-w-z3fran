import React, { useRef } from 'react';
import { Printer, X } from 'lucide-react';
import { SalesReceipt } from './SalesReceipt';
import { ReservationReceipt } from './ReservationReceipt';
import { ExpenseVoucherReceipt } from './ExpenseVoucherReceipt';
import { CombinedExpensesReceipt } from './CombinedExpensesReceipt';
import { SalesReturnReceipt } from './SalesReturnReceipt';
import { ZReportReceipt } from './ZReportReceipt';
import { XReportReceipt } from './XReportReceipt';
import { ProductMovementReceipt } from './ProductMovementReceipt';
import { ShiftHandoverReceipt } from './ShiftHandoverReceipt';
import { usePOS } from '../../context/POSContext';

export function PrintPreviewModal() {
  const { printJob, closePrintJob, storeSettings } = usePOS();
  const printAreaRef = useRef(null);

  if (!printJob.isOpen || !printJob.type) return null;

  const handlePrint = () => {
    // Ensure the DOM has painted before calling window.print
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const getTitle = () => {
    switch (printJob.type) {
      case 'sale':
        return 'معاينة وصل البيع (حراري 80mm)';
      case 'reservation':
        return 'معاينة وصل حجز قالب الكيك';
      case 'expense':
        return 'معاينة سند الصرف النقدي';
      case 'combined_expenses':
        return 'معاينة سند صرفيات اليوم المجمع';
      case 'sales_return':
        return 'معاينة وصل مردود مبيعات';
      case 'zreport':
        return 'معاينة تقرير الإغلاق المالي (Z-Report)';
      case 'xreport':
        return 'معاينة مبيعات اليوم (X-Report)';
      case 'shift_handover':
        return 'معاينة وصل تسليم الوردية (ملخص الشفت)';
      case 'product_movement':
        return 'معاينة تقرير حركة ومبيعات الأصناف (حراري 80mm)';
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
      case 'combined_expenses':
        return (
          <CombinedExpensesReceipt
            expenses={printJob.data}
            storeSettings={storeSettings}
          />
        );
      case 'sales_return':
        return <SalesReturnReceipt returnData={printJob.data} storeSettings={storeSettings} />;
      case 'zreport':
        return <ZReportReceipt report={printJob.data} storeSettings={storeSettings} />;
      case 'xreport':
        return <XReportReceipt reportData={printJob.data} storeSettings={storeSettings} />;
      case 'shift_handover':
        return (
          <ShiftHandoverReceipt
            handoverData={printJob.data}
            storeSettings={storeSettings}
          />
        );
      case 'product_movement':
        return (
          <ProductMovementReceipt
            reportData={printJob.data}
            storeSettings={storeSettings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* 
        1. Isolated Print Portal Component
        Has .print-only so during print media:
        - body * { visibility: hidden !important; }
        - .print-only, .print-only * { visibility: visible !important; }
        - position: absolute; left: 0; top: 0; width: 72.1mm;
        On screen, it is placed off-screen or visually transparent to guarantee it is 100% rendered into DOM
      */}
      <div className="print-only pointer-events-none fixed -left-[9999px] top-0 print:static print:pointer-events-auto print:left-0 print:top-0 print:w-[72.1mm]">
        {renderReceiptContent()}
      </div>

      {/* 
        2. On-screen Interactive Preview Dialog (Screen Only)
      */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
        <div className="bg-[#FAF8F5] border border-stone-300 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="bg-brand-800 text-warm-50 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-gold-400" />
              <h3 className="font-bold text-sm tracking-wide">{getTitle()}</h3>
            </div>
            <button
              onClick={closePrintJob}
              className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-brand-900/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Paper Dimensions Indicator */}
          <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 text-[11px] text-stone-700 flex items-center justify-between">
            <span>قياس الطباعة الفعلي: <strong>72.1 مم</strong> (رول 80 مم)</span>
            <span className="bg-brand-800 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">
              80mm Roll
            </span>
          </div>

          {/* Thermal Receipt Visual Preview Box */}
          <div className="p-4 overflow-y-auto flex-1 bg-stone-200 flex justify-center items-start">
            <div
              ref={printAreaRef}
              className="bg-white shadow-xl rounded-sm border border-stone-300 p-2 min-w-[72.1mm] max-w-[72.1mm]"
              style={{ width: '72.1mm' }}
            >
              {renderReceiptContent()}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-4 bg-white border-t border-stone-200 flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 bg-brand-800 hover:bg-brand-900 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              <Printer className="w-5 h-5 text-gold-400" />
              <span>إرسال إلى الطابعة الحرارية</span>
            </button>
            <button
              onClick={closePrintJob}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium py-3 px-4 rounded-xl transition-colors text-sm cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
