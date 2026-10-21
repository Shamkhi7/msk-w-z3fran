import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  Clock,
  Printer,
  Calculator,
  User,
  Zap,
  Truck,
  Phone,
  Star,
  Percent,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';
import { SalesReceipt } from '../print/SalesReceipt';

export function PaymentModal({ isOpen, onClose, onFastSuccess }) {
  const {
    cart,
    cartSummary,
    completeSale,
    storeSettings,
    activeCart,
    setCartDeliveryFee,
    activeShiftType,
    isSingleInvoiceShiftOverride,
    customersDirectory,
    isManager,
    activeCashier,
    salesHistory,
    directPrintReceipt,
  } = usePOS();

  const [deliveryFee, setDeliveryFee] = useState(0);
  const [orderDiscount, setOrderDiscount] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('نقداً');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomerNote, setSelectedCustomerNote] = useState('');
  const [isVipCustomer, setIsVipCustomer] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [notes, setNotes] = useState('');

  const numDeliveryFee = Math.max(0, Number(deliveryFee) || 0);
  const numOrderDiscount = Math.max(0, Number(orderDiscount) || 0);
  const effectiveTotalDiscount = cartSummary.totalDiscount + numOrderDiscount;
  const itemsNet = Math.max(0, cartSummary.subtotal - effectiveTotalDiscount);
  const netTotal = itemsNet + numDeliveryFee;

  useEffect(() => {
    if (isOpen) {
      const initialFee = Number(activeCart?.deliveryFee) || 0;
      setDeliveryFee(initialFee);
      setOrderDiscount('');
      const initialNet = cartSummary.itemsNet + initialFee;
      setAmountReceived(String(initialNet));
      setPaymentMethod('نقداً');
      setCustomerName('');
      setCustomerPhone('');
      setSelectedCustomerNote('');
      setIsVipCustomer(false);
      setShowCustomerDropdown(false);
      setNotes('');
    }
  }, [isOpen]);

  const matchedCustomers = useMemo(() => {
    const term = (customerName || customerPhone).trim().toLowerCase();
    if (!term || term.length < 2) return [];
    const list = Array.isArray(customersDirectory) ? customersDirectory : [];
    return list
      .filter((c) => c.name?.toLowerCase().includes(term) || c.phone?.includes(term))
      .slice(0, 5);
  }, [customerName, customerPhone, customersDirectory]);

  const handleSelectCustomer = (cust) => {
    setCustomerName(cust.name || '');
    setCustomerPhone(cust.phone || '');
    setSelectedCustomerNote(cust.notes || '');
    setIsVipCustomer(Boolean(cust.isVip));
    setShowCustomerDropdown(false);
  };

  const handleDeliveryFeeChange = (val) => {
    const fee = Math.max(0, Number(val) || 0);
    setDeliveryFee(fee);
    const newTotal = itemsNet + fee;
    setAmountReceived(String(newTotal));
    setCartDeliveryFee(fee);
  };

  const handleOrderDiscountChange = (val) => {
    setOrderDiscount(val);
    const disc = Math.max(0, Number(val) || 0);
    const newItemsNet = Math.max(0, cartSummary.subtotal - (cartSummary.totalDiscount + disc));
    const newTotal = newItemsNet + numDeliveryFee;
    setAmountReceived(String(newTotal));
  };

  const numReceived = Number(amountReceived) || 0;
  const changeDue = Math.max(0, numReceived - netTotal);
  const isShortage = numReceived < netTotal && paymentMethod === 'نقداً';

  const quickCashOptions = [
    { label: 'المبلغ بالضبط', val: netTotal },
    { label: '5,000', val: 5000 },
    { label: '10,000', val: 10000 },
    { label: '25,000', val: 25000 },
    { label: '50,000', val: 50000 },
    { label: '100,000', val: 100000 },
  ];

  const handleQuickCash = (val) => {
    setAmountReceived(String(val));
  };

  // Live draft sale object rendered inside the Receipt Preview
  const liveDraftSale = useMemo(() => {
    const depositAmountInCart = (cart || [])
      .filter((item) => item.product?.isDeposit || item.product?.id === 'service-deposit')
      .reduce((sum, item) => sum + Math.max(0, (Number(item.unitPrice || item.price || 0) * (Number(item.quantity) || 1)) - (Number(item.discount) || 0)), 0);

    const directSalesAmount = Math.max(0, itemsNet - depositAmountInCart);

    return {
      id: 'DRAFT-' + Date.now(),
      receiptNo: 'INV-' + new Date().getFullYear() + '-' + ((salesHistory?.length || 0) + 1001),
      sessionId: 'CURRENT',
      items: cart || [],
      subtotal: cartSummary.subtotal,
      totalDiscount: effectiveTotalDiscount,
      itemsNet,
      deliveryFee: numDeliveryFee,
      netTotal,
      depositAmount: depositAmountInCart,
      directSalesAmount,
      amountReceived: numReceived || netTotal,
      changeDue: changeDue || 0,
      paymentMethod,
      customerName: customerName.trim() || 'زبون عام',
      customerPhone: customerPhone.trim(),
      cashierName: activeCashier || storeSettings.cashierName,
      shiftType: activeShiftType || 'صباحي',
      date: new Date().toISOString(),
      notes: notes.trim(),
    };
  }, [
    cart,
    salesHistory?.length,
    cartSummary.subtotal,
    effectiveTotalDiscount,
    itemsNet,
    numDeliveryFee,
    netTotal,
    numReceived,
    changeDue,
    paymentMethod,
    customerName,
    customerPhone,
    activeCashier,
    storeSettings.cashierName,
    activeShiftType,
    notes,
  ]);

  // Submit with Thermal Receipt Printing
  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isShortage) {
      alert('المبلغ المستلم أقل من المبلغ المطلوب للطلب!');
      return;
    }

    const sale = completeSale(
      {
        amountReceived: numReceived,
        changeDue,
        paymentMethod,
        customerName: customerName.trim() || 'زبون عام',
        customerPhone: customerPhone.trim(),
        customerNotes: selectedCustomerNote.trim(),
        isVip: isVipCustomer,
        notes: notes.trim(),
        deliveryFee: numDeliveryFee,
        orderDiscount: numOrderDiscount,
        printReceipt: false,
      },
      false
    );

    if (sale) {
      directPrintReceipt(sale);
      if (onFastSuccess) {
        onFastSuccess('تم إتمام الطلب وطباعة الوصل');
      }
    }

    onClose();
  };

  // Fast Checkout Without Printing
  const handleNoPrintCheckout = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isShortage) {
      alert('المبلغ المستلم أقل من المبلغ المطلوب للطلب!');
      return;
    }

    completeSale(
      {
        amountReceived: numReceived,
        changeDue,
        paymentMethod,
        customerName: customerName.trim() || 'زبون عام',
        customerPhone: customerPhone.trim(),
        customerNotes: selectedCustomerNote.trim(),
        isVip: isVipCustomer,
        notes: notes.trim(),
        deliveryFee: numDeliveryFee,
        orderDiscount: numOrderDiscount,
        printReceipt: false,
      },
      false
    );

    onClose();
    if (onFastSuccess) {
      onFastSuccess('تم تسجيل البيع بنجاح (بدون طباعة)');
    }
  };

  // Keyboard shortcut listener inside Payment Modal (Shift+Enter for Fast Checkout)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        handleNoPrintCheckout();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isShortage, numReceived, changeDue, paymentMethod, customerName, notes, numOrderDiscount, numDeliveryFee]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-[#FAF8F5] border border-stone-300 rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="bg-brand-800 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Calculator className="w-5 h-5 text-gold-400" />
            <h3 className="font-bold text-base sm:text-lg">معاينة وصل الفاتورة وتعديل الدفع</h3>
            <span className="bg-brand-950 text-gold-300 text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full border border-gold-500/30">
              80mm Roll (72.1 مم)
            </span>
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                activeShiftType === 'صباحي'
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40'
                  : 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/40'
              }`}
            >
              <span>{activeShiftType === 'صباحي' ? '☀️ صباحي' : '🌙 مسائي'}</span>
              {isSingleInvoiceShiftOverride && (
                <span className="bg-amber-400 text-amber-950 px-1 py-0.2 text-[9px] rounded-xs font-black shadow-2xs">
                  مؤقت ⚡
                </span>
              )}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-warm-200 hover:text-white p-1.5 rounded-lg hover:bg-brand-900/50 transition-colors cursor-pointer"
            title="إغلاق النافذة (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2-Column Responsive Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-4 p-4 min-h-0">
          {/* Column 1: Live Thermal Receipt Preview Box */}
          <div className="md:col-span-5 hidden md:flex flex-col overflow-hidden bg-stone-100 rounded-2xl border border-stone-300">
            <div className="bg-stone-200/90 px-3.5 py-2 border-b border-stone-300 text-xs font-black text-stone-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-brand-800" />
                <span>معاينة الوصل المباشرة</span>
              </div>
              <span className="text-[10px] font-mono text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-300">
                عرض الورق 80mm
              </span>
            </div>

            <div className="p-3 overflow-y-auto flex-1 bg-stone-200 flex justify-center items-start shadow-inner">
              <div
                className="bg-white shadow-xl rounded-xs border border-stone-300 p-2 min-w-[72.1mm] max-w-[72.1mm]"
                style={{ width: '72.1mm' }}
              >
                <SalesReceipt sale={liveDraftSale} storeSettings={storeSettings} />
              </div>
            </div>
          </div>

          {/* Column 2: Editable Payment Options Form */}
          <form
            onSubmit={handleSubmit}
            className="md:col-span-7 flex flex-col overflow-y-auto space-y-3.5 pr-1"
          >
            {/* Net Amount Banner */}
            <div className="bg-white p-3 rounded-2xl border-2 border-brand-800/30 text-center space-y-1 shadow-xs shrink-0">
              <div className="text-xs font-bold text-stone-500">المبلغ الإجمالي المطلوب للدفع:</div>
              <div className="text-3xl font-mono font-black text-brand-900">
                {netTotal.toLocaleString()}{' '}
                <span className="text-sm font-sans font-normal text-stone-600">
                  {storeSettings.currency}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs flex-wrap">
                <span className="text-stone-600">
                  المواد: <strong>{itemsNet.toLocaleString()}</strong>
                </span>
                {numDeliveryFee > 0 && (
                  <span className="text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                    + توصيل: {numDeliveryFee.toLocaleString()}
                  </span>
                )}
                {numOrderDiscount > 0 && (
                  <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-bold">
                    - خصم: {numOrderDiscount.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-stone-600 italic">
                {numberToArabicWords(netTotal, storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency)}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="shrink-0">
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                طريقة استلام المبلغ:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'نقداً', label: 'نقداً (كاش)', icon: Banknote },
                  { id: 'بطاقة إلكترونية', label: 'بطاقة / شبكة', icon: CreditCard },
                  { id: 'آجل / ذمم', label: 'حساب آجل', icon: Clock },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(m.id);
                        if (m.id !== 'نقداً') {
                          setAmountReceived(String(netTotal));
                        }
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-brand-800 text-white border-brand-900 shadow-sm'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-warm-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-gold-400' : 'text-stone-500'}`} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery Fee & Invoice Discount Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 shrink-0">
              {/* Delivery Fee Option */}
              <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-300/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 font-bold text-amber-950">
                    <Truck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>أجور التوصيل (للسائق):</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      step="500"
                      placeholder="0"
                      value={deliveryFee || ''}
                      onChange={(e) => handleDeliveryFeeChange(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="w-20 text-center font-mono font-bold text-xs bg-white border border-amber-300 rounded-lg py-1 px-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-[10px] text-amber-900 font-bold">{storeSettings.currency}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {[0, 1000, 2000, 3000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleDeliveryFeeChange(amt)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                        numDeliveryFee === amt
                          ? 'bg-amber-700 text-white'
                          : 'bg-white text-stone-700 border border-stone-300 hover:bg-amber-100'
                      }`}
                    >
                      {amt === 0 ? 'بدون' : `+${amt.toLocaleString()}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra Invoice Discount */}
              <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-300/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 font-bold text-rose-950">
                    <Percent className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                    <span>خصم إضافي على الفاتورة:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      step="250"
                      placeholder="0"
                      value={orderDiscount}
                      onChange={(e) => handleOrderDiscountChange(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="w-20 text-center font-mono font-bold text-xs bg-white border border-rose-300 rounded-lg py-1 px-1 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    <span className="text-[10px] text-rose-900 font-bold">{storeSettings.currency}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {[0, 500, 1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleOrderDiscountChange(amt)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                        numOrderDiscount === amt
                          ? 'bg-rose-700 text-white'
                          : 'bg-white text-stone-700 border border-stone-300 hover:bg-rose-100'
                      }`}
                    >
                      {amt === 0 ? 'بدون' : `-${amt.toLocaleString()}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cash Received & Change Due Box */}
            {paymentMethod === 'نقداً' && (
              <div className="space-y-2.5 bg-warm-100/50 p-3 rounded-2xl border border-warm-200 shrink-0">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700">
                    المبلغ المستلم من الزبون ({storeSettings.currency}):
                  </label>
                  <input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    step="250"
                    min="0"
                    className={`w-36 bg-white border-2 rounded-xl px-2.5 py-1.5 text-lg font-mono font-black text-center focus:outline-none ${
                      isShortage
                        ? 'border-rose-500 text-rose-700'
                        : 'border-stone-300 focus:border-brand-800 text-stone-900'
                    }`}
                  />
                </div>

                {/* Quick Cash Chips */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                  {quickCashOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickCash(opt.val)}
                      className="py-1 px-1 bg-white hover:bg-brand-50 border border-stone-300 hover:border-brand-700 rounded-lg text-[10.5px] font-mono font-bold text-stone-800 transition-colors text-center cursor-pointer"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Change Due Display */}
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-800">الباقي للزبون (Change Due):</span>
                  <div
                    className={`text-lg font-mono font-black ${
                      isShortage
                        ? 'text-rose-600'
                        : changeDue > 0
                        ? 'text-emerald-700'
                        : 'text-stone-800'
                    }`}
                  >
                    {isShortage
                      ? `نقص: ${(netTotal - numReceived).toLocaleString()} ${storeSettings.currency}`
                      : `${changeDue.toLocaleString()} ${storeSettings.currency}`}
                  </div>
                </div>
              </div>
            )}

            {/* Customer Profile & Auto-complete Section */}
            <div className="space-y-2 bg-stone-50/70 p-3 rounded-2xl border border-stone-200 shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 relative">
                {/* Customer Name */}
                <div className="relative">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    اسم الزبون:
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={customerName}
                      onFocus={() => setShowCustomerDropdown(true)}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        setShowCustomerDropdown(true);
                      }}
                      placeholder="زبون عام / اسم الشخص"
                      className="w-full bg-white border border-stone-300 rounded-xl pr-8 pl-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-800"
                    />
                  </div>
                </div>

                {/* Customer Phone */}
                <div className="relative">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    رقم الهاتف:
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onFocus={() => setShowCustomerDropdown(true)}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        setShowCustomerDropdown(true);
                      }}
                      placeholder="0770 000 0000"
                      className="w-full bg-white border border-stone-300 rounded-xl pr-8 pl-2.5 py-1.5 text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-brand-800"
                    />
                  </div>
                </div>

                {/* Auto-complete Dropdown */}
                {showCustomerDropdown && matchedCustomers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border-2 border-brand-800/40 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                    <div className="p-1.5 bg-brand-900 text-white text-[10px] font-bold flex justify-between items-center">
                      <span>زبائن مسجلون في السجل:</span>
                      <button
                        type="button"
                        onClick={() => setShowCustomerDropdown(false)}
                        className="text-warm-200 hover:text-white"
                      >
                        إغلاق ✕
                      </button>
                    </div>
                    <div className="divide-y divide-stone-100 max-h-40 overflow-y-auto">
                      {matchedCustomers.map((cust) => (
                        <div
                          key={cust.id}
                          onClick={() => handleSelectCustomer(cust)}
                          className="p-2 px-3 hover:bg-amber-50 flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900">
                              {cust.isVip && <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />}
                              <span>{cust.name}</span>
                              {cust.phone && (
                                <span className="font-mono text-[11px] text-stone-500 font-normal">
                                  ({cust.phone})
                                </span>
                              )}
                            </div>
                            {cust.notes && (
                              <div className="text-[10px] text-amber-800 italic mt-0.5">
                                {cust.notes}
                              </div>
                            )}
                          </div>
                          {isManager && (
                            <div className="text-right text-[10px] text-emerald-800 font-mono font-bold">
                              {(cust.totalSpent || 0).toLocaleString()} {storeSettings.currency}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Invoice Notes */}
              <div>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات الفاتورة (اختياري)..."
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-800"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-3.5 bg-white border-t border-stone-300 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          {/* 1. Confirmation: Pay and Print Receipt (Primary) */}
          <button
            type="button"
            disabled={isShortage}
            onClick={handleSubmit}
            title="تأكيد الدفع وطباعة الوصل على الطابعة الحرارية مباشرة (F4 / Enter)"
            className={`flex-1 font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] ${
              isShortage
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-brand-800 hover:bg-brand-900 text-white shadow-brand-900/30 hover:shadow-lg cursor-pointer border border-gold-500/30'
            }`}
          >
            <Printer className="w-4 h-4 text-gold-400 shrink-0" />
            <span>طباعة الوصل وتأكيد البيع</span>
          </button>

          {/* 2. Secondary: Pay Without Printing */}
          <button
            type="button"
            disabled={isShortage}
            onClick={handleNoPrintCheckout}
            title="تسجيل البيع في اليومية بدون إرسال أمر طباعة (Shift+Enter)"
            className={`font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.99] ${
              isShortage
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-900/30 hover:shadow-lg cursor-pointer border border-emerald-600/50'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>دفع بدون طباعة (Shift+↵)</span>
          </button>

          {/* 3. Cancel / Close */}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors text-xs sm:text-sm cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
