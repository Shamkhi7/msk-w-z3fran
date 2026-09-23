import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  Calendar,
  Clock,
  Cake,
  User,
  Phone,
  DollarSign,
  Type,
  Plus,
  Trash2,
  Package,
  Calculator,
  Layers,
  Sparkles,
  CheckSquare,
  Square,
  FileText,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { formatPickupDateTime, getArabicWeekday } from '../../utils/dateFormatter';
import { VirtualNumpadModal } from '../common/VirtualNumpadModal';

export function ReservationFormModal({ isOpen, onClose, initialData = null }) {
  const { addReservation, updateReservation, storeSettings } = usePOS();

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Customer Details & Custom Manual Reservation #
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [manualBookingNo, setManualBookingNo] = useState('');
  const [pickupDate, setPickupDate] = useState(tomorrow);
  const [pickupTime, setPickupTime] = useState('18:00');

  // Unified Multi-Item Selection Toggles
  const [includeMold, setIncludeMold] = useState(true);
  const [includeSlices, setIncludeSlices] = useState(false);

  // Section A: Cake Molds Specifics (Array for multiple molds)
  const [cakeMolds, setCakeMolds] = useState([
    {
      id: 'mold-1',
      cakeSize: '2',
      moldPrice: '35000',
      cakeFlavor: '',
      cakeDesign: '',
      writtenText: '',
    },
  ]);

  // Section B: Cake Slices Specifics
  const AVAILABLE_SLICE_TIERS = [500, 750, 1000, 1500, 2000];
  const [sliceTiers, setSliceTiers] = useState([
    { id: 'tier-1', tierPrice: 500, quantity: 50 },
  ]);
  const [hasPackaging, setHasPackaging] = useState(false);
  const PACKAGING_FEE_PER_PIECE = 250;
  const [slicesFlavor, setSlicesFlavor] = useState('');

  // Consolidated Financials
  const [totalCost, setTotalCost] = useState('35000');
  const [depositPaid, setDepositPaid] = useState('15000');
  const [notes, setNotes] = useState('');
  const [ringUpDeposit, setRingUpDeposit] = useState(true);

  // Virtual Numpad State
  const [numpadConfig, setNumpadConfig] = useState({
    isOpen: false,
    title: '',
    initialValue: 0,
    unit: '',
    mode: 'integer',
    quickPresets: [],
    onConfirm: null,
  });

  // Calculate Molds Total
  const moldsTotal = useMemo(() => {
    if (!includeMold) return 0;
    return cakeMolds.reduce((sum, m) => sum + (Number(m.moldPrice) || 0), 0);
  }, [includeMold, cakeMolds]);

  // Calculate Slices Metrics
  const slicesMetrics = useMemo(() => {
    if (!includeSlices) {
      return { totalPieces: 0, slicesTotal: 0, packagingTotal: 0 };
    }
    const totalPieces = sliceTiers.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);
    const slicesTotal = sliceTiers.reduce(
      (sum, t) => sum + (Number(t.quantity) || 0) * (Number(t.tierPrice) || 0),
      0
    );
    const packagingTotal = hasPackaging ? totalPieces * PACKAGING_FEE_PER_PIECE : 0;
    return { totalPieces, slicesTotal, packagingTotal };
  }, [includeSlices, sliceTiers, hasPackaging]);

  // Consolidated Total Calculation
  const computedGrandTotal = useMemo(() => {
    const moldCost = includeMold ? moldsTotal : 0;
    const slicesCost = includeSlices ? slicesMetrics.slicesTotal : 0;
    const packCost = includeSlices ? slicesMetrics.packagingTotal : 0;
    return moldCost + slicesCost + packCost;
  }, [includeMold, moldsTotal, includeSlices, slicesMetrics]);

  // Auto-sync totalCost when mold or slices change
  useEffect(() => {
    setTotalCost(String(computedGrandTotal));
  }, [computedGrandTotal]);

  // Populate form with initialData when editing or reset when creating
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCustomerName(initialData.customerName || '');
        setPhone(initialData.phone || '');
        setManualBookingNo(initialData.manualBookingNo || '');
        setPickupDate(initialData.pickupDate || tomorrow);
        setPickupTime(initialData.pickupTime || '18:00');

        const hasM =
          initialData.hasMold !== false &&
          (initialData.cakeSize || initialData.hasMold || (initialData.cakeMolds && initialData.cakeMolds.length > 0));
        setIncludeMold(Boolean(hasM));

        const hasS = Boolean(
          initialData.hasSlices ||
          initialData.reservationType === 'cake_slices' ||
          (initialData.sliceTiers && initialData.sliceTiers.length > 0)
        );
        setIncludeSlices(hasS);

        if (initialData.cakeMolds && initialData.cakeMolds.length > 0) {
          setCakeMolds(
            initialData.cakeMolds.map((m, idx) => ({
              id: m.id || 'mold-' + (idx + 1),
              cakeSize: m.cakeSize || '2',
              moldPrice: String(m.moldPrice || 0),
              cakeFlavor: m.cakeFlavor || '',
              cakeDesign: m.cakeDesign || '',
              writtenText: m.writtenText || '',
            }))
          );
        } else if (hasM) {
          setCakeMolds([
            {
              id: 'mold-1',
              cakeSize: initialData.cakeSize || '2',
              moldPrice: String(initialData.moldPrice || 0),
              cakeFlavor: initialData.cakeFlavor || '',
              cakeDesign: initialData.cakeDesign || '',
              writtenText: initialData.writtenText || '',
            },
          ]);
        }

        if (initialData.sliceTiers && initialData.sliceTiers.length > 0) {
          setSliceTiers(
            initialData.sliceTiers.map((t, idx) => ({
              id: t.id || 'tier-' + (idx + 1),
              tierPrice: Number(t.tierPrice) || 500,
              quantity: Number(t.quantity) || 0,
            }))
          );
        } else {
          setSliceTiers([{ id: 'tier-1', tierPrice: 500, quantity: 50 }]);
        }

        setHasPackaging(Boolean(initialData.hasPackaging));
        setSlicesFlavor(initialData.slicesFlavor || '');
        setTotalCost(String(initialData.totalCost || 0));
        setDepositPaid(String(initialData.depositPaid || 0));
        setNotes(initialData.notes || '');
        setRingUpDeposit(false);
      } else {
        setCustomerName('');
        setPhone('');
        setManualBookingNo('');
        setPickupDate(tomorrow);
        setPickupTime('18:00');
        setIncludeMold(true);
        setIncludeSlices(false);
        setCakeMolds([
          {
            id: 'mold-1',
            cakeSize: '2',
            moldPrice: '35000',
            cakeFlavor: '',
            cakeDesign: '',
            writtenText: '',
          },
        ]);
        setSliceTiers([{ id: 'tier-1', tierPrice: 500, quantity: 50 }]);
        setHasPackaging(false);
        setSlicesFlavor('');
        setTotalCost('35000');
        setDepositPaid('15000');
        setNotes('');
        setRingUpDeposit(true);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const numTotal = Number(totalCost) || 0;
  const numDeposit = Number(depositPaid) || 0;
  const remainingBalance = Math.max(0, numTotal - numDeposit);

  // STRICTLY SIZES 0, 1, 2, 3
  const cakeSizeGuides = [
    { size: '0', label: 'قياس 0', desc: 'شخصين (ميني)' },
    { size: '1', label: 'قياس 1', desc: '4-6 أشخاص' },
    { size: '2', label: 'قياس 2', desc: '8-10 أشخاص' },
    { size: '3', label: 'قياس 3', desc: '12-16 شخص' },
  ];

  // Mold Handlers
  const addCakeMold = () => {
    setCakeMolds((prev) => [
      ...prev,
      {
        id: 'mold-' + Date.now(),
        cakeSize: '2',
        moldPrice: '35000',
        cakeFlavor: '',
        cakeDesign: '',
        writtenText: '',
      },
    ]);
  };

  const removeCakeMold = (id) => {
    if (cakeMolds.length <= 1) return;
    setCakeMolds((prev) => prev.filter((m) => m.id !== id));
  };

  const updateCakeMold = (id, field, value) => {
    setCakeMolds((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // Slices Handlers
  const addSliceTier = () => {
    const usedTiers = sliceTiers.map((t) => t.tierPrice);
    const nextAvailable = AVAILABLE_SLICE_TIERS.find((p) => !usedTiers.includes(p)) || 750;
    setSliceTiers((prev) => [
      ...prev,
      { id: 'tier-' + Date.now(), tierPrice: nextAvailable, quantity: 25 },
    ]);
  };

  const removeSliceTier = (id) => {
    if (sliceTiers.length <= 1) return;
    setSliceTiers((prev) => prev.filter((t) => t.id !== id));
  };

  const updateSliceTier = (id, field, value) => {
    setSliceTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  // Virtual Numpad Helpers
  const openNumpad = ({ title, initialValue, unit, mode = 'integer', quickPresets = [], onConfirm }) => {
    setNumpadConfig({
      isOpen: true,
      title,
      initialValue,
      unit,
      mode,
      quickPresets,
      onConfirm,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!customerName.trim() || !phone.trim()) {
      alert('يرجى إدخال اسم الزبون ورقم الهاتف');
      return;
    }

    if (!includeMold && !includeSlices) {
      alert('يرجى تحديد قالب كيك أو قطع كيك على الأقل لإتمام الحجز');
      return;
    }

    if (includeMold) {
      if (cakeMolds.length === 0) {
        alert('يرجى إضافة قالب كيك واحد على الأقل أو إلغاء تفعيل تضمين القالب');
        return;
      }
      const invalidMold = cakeMolds.find((m) => (Number(m.moldPrice) || 0) <= 0);
      if (invalidMold) {
        alert('يرجى إدخال سعر صحيح لكل قالب كيك مضاف');
        return;
      }
    }

    if (includeSlices && slicesMetrics.totalPieces <= 0) {
      alert('يرجى إدخال كمية قطع الكيك بشكل صحيح');
      return;
    }

    if (numTotal <= 0) {
      alert('المبلغ الإجمالي للحجز يجب أن يكون أكبر من صفر');
      return;
    }

    const cleanedMolds = includeMold
      ? cakeMolds.map((m) => ({
          id: m.id,
          cakeSize: m.cakeSize || '2',
          moldPrice: Number(m.moldPrice) || 0,
          cakeFlavor: m.cakeFlavor?.trim() || '',
          cakeDesign: m.cakeDesign?.trim() || '',
          writtenText: m.writtenText?.trim() || '',
        }))
      : [];

    const payload = {
      manualBookingNo: manualBookingNo.trim(),
      customerName: customerName.trim(),
      phone: phone.trim(),
      pickupDate,
      pickupTime,
      hasMold: includeMold,
      hasSlices: includeSlices,
      // Multi-mold array
      cakeMolds: cleanedMolds,
      cakeMoldsCount: cleanedMolds.length,
      // Backward-compatibility legacy fields
      cakeSize: includeMold ? (cleanedMolds[0]?.cakeSize || '2') : null,
      moldPrice: includeMold ? moldsTotal : 0,
      cakeFlavor: includeMold ? cleanedMolds.map((m) => m.cakeFlavor).filter(Boolean).join(' | ') : '',
      cakeDesign: includeMold ? cleanedMolds.map((m) => m.cakeDesign).filter(Boolean).join(' | ') : '',
      writtenText: includeMold ? cleanedMolds.map((m) => m.writtenText).filter(Boolean).join(' | ') : '',
      // Section B: Slices
      sliceTiers: includeSlices
        ? sliceTiers.map((t) => ({
            id: t.id,
            tierPrice: Number(t.tierPrice) || 0,
            quantity: Number(t.quantity) || 0,
            subtotal: (Number(t.tierPrice) || 0) * (Number(t.quantity) || 0),
          }))
        : [],
      hasPackaging: includeSlices ? hasPackaging : false,
      packagingFeePerPiece: PACKAGING_FEE_PER_PIECE,
      packagingTotal: includeSlices ? slicesMetrics.packagingTotal : 0,
      totalPieces: includeSlices ? slicesMetrics.totalPieces : 0,
      slicesTotal: includeSlices ? slicesMetrics.slicesTotal : 0,
      slicesFlavor: includeSlices ? slicesFlavor.trim() : '',
      // Consolidated Financials
      totalCost: numTotal,
      depositPaid: numDeposit,
      notes: notes.trim(),
    };

    if (initialData) {
      updateReservation(initialData.id, payload);
    } else {
      addReservation(payload, ringUpDeposit);
    }

    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in select-none">
        <div className="bg-[#FAF8F5] border border-brand-900/20 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[94vh]">
          {/* Header */}
          <div className="bg-brand-800 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Cake className="w-5 h-5 text-gold-400" />
              <div>
                <h3 className="font-bold text-base">
                  {initialData ? 'تعديل بيانات الحجز' : 'تسجيل طلب حجز مجمع (قالب كيك / قطع كيك)'}
                </h3>
                {initialData && (
                  <div className="text-[11px] text-warm-200 font-mono">
                    رقم النظام: {initialData.receiptNumber}
                    {initialData.manualBookingNo && ` • وصل يدوي #${initialData.manualBookingNo}`}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-brand-900/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
            {/* Customer Contacts & Custom Manual Reservation Number */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-2xl border border-warm-200 shadow-2xs">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  اسم الزبون / صاحب الحجز:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="مثال: أم مريم الجبوري"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pr-9 pl-3 py-2 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-800"
                    required
                    autoFocus={!initialData}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  رقم الهاتف:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0770 000 0000"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pr-9 pl-3 py-2 text-sm font-mono font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                  <span>رقم الحجز اليدوي / الوصل:</span>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    اختياري
                  </span>
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-amber-600" />
                  <input
                    type="text"
                    value={manualBookingNo}
                    onChange={(e) => setManualBookingNo(e.target.value)}
                    placeholder="مثال: 104 أو B-22"
                    className="w-full bg-amber-50/40 border border-amber-300/80 rounded-xl pr-9 pl-3 py-2 text-sm font-mono font-bold text-stone-900 placeholder:text-stone-400 placeholder:font-sans placeholder:text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Date & Time */}
            <div className="space-y-2.5 bg-warm-100/70 p-3.5 rounded-2xl border border-warm-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-800" />
                      <span>تاريخ الاستلام (Pickup Date):</span>
                    </div>
                    {pickupDate && (
                      <span className="text-[11px] font-black text-brand-900 bg-brand-100 px-2 py-0.5 rounded-lg border border-brand-200">
                        {getArabicWeekday(pickupDate)}
                      </span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800 shadow-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-800" />
                    <span>وقت الاستلام (Pickup Time):</span>
                  </label>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800 shadow-xs"
                    required
                  />
                </div>
              </div>

              {/* Live Integrated Pickup Schedule Preview */}
              <div className="bg-white border border-brand-200 rounded-xl px-3 py-2 flex items-center justify-between shadow-xs">
                <span className="text-[11px] font-bold text-stone-600">موعد وتوقيت الاستلام المعتمد:</span>
                <span className="text-xs font-black text-brand-900 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100">
                  {formatPickupDateTime(pickupDate, pickupTime)}
                </span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* UNIFIED ORDER INCLUSION SWITCHES (MOLD AND/OR SLICES)     */}
            {/* ========================================================= */}
            <div className="bg-stone-100 p-2.5 rounded-2xl border border-stone-300 flex flex-col sm:flex-row gap-2">
              {/* Toggle 1: Include Cake Mold */}
              <button
                type="button"
                onClick={() => setIncludeMold(!includeMold)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-between transition-all cursor-pointer border ${
                  includeMold
                    ? 'bg-brand-800 text-white border-brand-900 shadow-sm'
                    : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Cake className={`w-4 h-4 ${includeMold ? 'text-gold-400' : 'text-stone-400'}`} />
                  <span>
                    تضمين قالب كيك 🎂 {cakeMolds.length > 1 ? `(${cakeMolds.length})` : ''}
                  </span>
                </div>
                {includeMold ? (
                  <CheckSquare className="w-4 h-4 text-gold-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-stone-400 shrink-0" />
                )}
              </button>

              {/* Toggle 2: Include Cake Slices */}
              <button
                type="button"
                onClick={() => setIncludeSlices(!includeSlices)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-between transition-all cursor-pointer border ${
                  includeSlices
                    ? 'bg-amber-700 text-white border-amber-800 shadow-sm'
                    : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className={`w-4 h-4 ${includeSlices ? 'text-gold-300' : 'text-stone-400'}`} />
                  <span>تضمين قطع كيك 🍰</span>
                </div>
                {includeSlices ? (
                  <CheckSquare className="w-4 h-4 text-gold-300 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-stone-400 shrink-0" />
                )}
              </button>
            </div>

            {/* ========================================================= */}
            {/* SECTION A: CAKE MOLDS SPECIFICATIONS                      */}
            {/* ========================================================= */}
            {includeMold && (
              <div className="space-y-3 bg-white p-4 rounded-2xl border-2 border-brand-900/30 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-brand-900">
                    <Cake className="w-4 h-4 text-brand-800" />
                    <span>
                      القسم الأول: مواصفات قوالب الكيك ({cakeMolds.length}{' '}
                      {cakeMolds.length === 1 ? 'قالب' : cakeMolds.length === 2 ? 'قالبين' : 'قوالب'})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addCakeMold}
                    className="px-2.5 py-1 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-gold-300" />
                    <span>+ إضافة قالب آخر</span>
                  </button>
                </div>

                {/* List of Cake Molds */}
                <div className="space-y-3">
                  {cakeMolds.map((mold, index) => (
                    <div
                      key={mold.id}
                      className="p-3.5 rounded-xl border border-warm-300 bg-stone-50/70 space-y-3 relative"
                    >
                      {/* Mold Header: Title, Price with Numpad, Delete */}
                      <div className="flex items-center justify-between border-b border-warm-200 pb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-brand-800 text-white text-xs font-black flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-xs font-black text-stone-800">
                            {cakeMolds.length > 1 ? `قالب كيك #${index + 1}` : 'قالب الكيك'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs font-mono font-bold text-stone-700">
                            <span>السعر:</span>
                            <input
                              type="number"
                              value={mold.moldPrice}
                              onChange={(e) => updateCakeMold(mold.id, 'moldPrice', e.target.value)}
                              step="500"
                              min="0"
                              className="w-24 bg-white border border-stone-300 rounded-lg px-2 py-0.5 text-xs font-mono font-black text-brand-900 text-center"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                openNumpad({
                                  title: `سعر قالب الكيك #${index + 1}`,
                                  initialValue: Number(mold.moldPrice) || 0,
                                  unit: storeSettings.currency,
                                  quickPresets: [15000, 25000, 35000, 50000],
                                  onConfirm: (val) => updateCakeMold(mold.id, 'moldPrice', String(val)),
                                })
                              }
                              className="p-1 text-stone-400 hover:text-brand-800 cursor-pointer"
                              title="فتح لوحة الأرقام"
                            >
                              <Calculator className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {cakeMolds.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCakeMold(mold.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer mr-1"
                              title="حذف هذا القالب"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Cake Size Selection (0 to 3) */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          قياس القالب (0، 1، 2، 3):
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {cakeSizeGuides.map((guide) => {
                            const isSelected = mold.cakeSize === guide.size;
                            return (
                              <button
                                key={guide.size}
                                type="button"
                                onClick={() => updateCakeMold(mold.id, 'cakeSize', guide.size)}
                                className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-brand-800 text-white border-brand-950 shadow-sm ring-2 ring-gold-500/50'
                                    : 'bg-white text-stone-700 border-stone-200 hover:bg-warm-100'
                                }`}
                              >
                                <div className="font-black text-xs">{guide.label}</div>
                                <div
                                  className={`text-[9.5px] truncate ${
                                    isSelected ? 'text-gold-300' : 'text-stone-500'
                                  }`}
                                >
                                  {guide.desc}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Written Text on Cake */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1">
                          <Type className="w-3.5 h-3.5 text-brand-800" />
                          <span>العبارة المطلوبة على هذا القالب:</span>
                        </label>
                        <input
                          type="text"
                          value={mold.writtenText}
                          onChange={(e) => updateCakeMold(mold.id, 'writtenText', e.target.value)}
                          placeholder="مثال: كل عام وأنت بألف خير يا سارة"
                          className="w-full bg-white border border-stone-300 focus:border-brand-800 rounded-xl px-3 py-1.5 text-xs font-bold text-brand-900 focus:outline-none shadow-xs"
                        />
                      </div>

                      {/* Prominent Cake Design & Shape Details */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-800 mb-1 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                          <span>تفاصيل الشكل والتصميم المطلوب:</span>
                        </label>
                        <input
                          type="text"
                          value={mold.cakeDesign}
                          onChange={(e) => updateCakeMold(mold.id, 'cakeDesign', e.target.value)}
                          placeholder="مثال: ورود طبيعية، ثيم أعياد ميلاد، لون أزرق وذهبي، طابقين..."
                          className="w-full bg-white border border-stone-300 focus:border-amber-700 rounded-xl px-3 py-1.5 text-xs font-bold text-amber-950 focus:outline-none shadow-xs"
                        />
                      </div>

                      {/* Flavor Details */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          نكهة وحشوة القالب:
                        </label>
                        <input
                          type="text"
                          value={mold.cakeFlavor}
                          onChange={(e) => updateCakeMold(mold.id, 'cakeFlavor', e.target.value)}
                          placeholder="شوكولاتة، فانيلا، زعفران ومسك..."
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Molds Total Summary Bar */}
                {cakeMolds.length > 1 && (
                  <div className="bg-brand-50 border border-brand-200 p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-brand-900">
                    <span>إجمالي أسعار قوالب الكيك ({cakeMolds.length} قوالب):</span>
                    <span className="font-mono font-black text-sm">
                      {moldsTotal.toLocaleString()} {storeSettings.currency}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* SECTION B: CAKE SLICES SPECIFICATIONS                     */}
            {/* ========================================================= */}
            {includeSlices && (
              <div className="space-y-3 bg-gradient-to-b from-amber-50/70 to-warm-100/70 p-4 rounded-2xl border-2 border-amber-500/50 shadow-xs">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                    <Layers className="w-4 h-4 text-amber-700" />
                    <span>القسم الثاني: حجز قطع الكيك متعدد الفئات</span>
                  </div>
                  <button
                    type="button"
                    onClick={addSliceTier}
                    className="px-2.5 py-1 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-gold-300" />
                    <span>+ إضافة فئة كيك أخرى</span>
                  </button>
                </div>

                {/* Dynamic Slice Tier Rows */}
                <div className="space-y-2.5">
                  {sliceTiers.map((tier) => {
                    const rowSubtotal = (Number(tier.quantity) || 0) * (Number(tier.tierPrice) || 0);
                    return (
                      <div
                        key={tier.id}
                        className="bg-white p-3 rounded-xl border border-warm-300 shadow-xs flex flex-wrap items-center justify-between gap-3"
                      >
                        {/* Tier Selector */}
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">
                            فئة السعر (سعر القطعة):
                          </label>
                          <div className="flex items-center gap-1 overflow-x-auto">
                            {AVAILABLE_SLICE_TIERS.map((price) => (
                              <button
                                key={price}
                                type="button"
                                onClick={() => updateSliceTier(tier.id, 'tierPrice', price)}
                                className={`px-2 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                                  tier.tierPrice === price
                                    ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-warm-100'
                                }`}
                              >
                                {price.toLocaleString()} د.ع
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Quantity Input + Numpad Trigger */}
                        <div className="w-36">
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">
                            العدد (قطع):
                          </label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={tier.quantity}
                              onChange={(e) =>
                                updateSliceTier(tier.id, 'quantity', Math.max(0, Number(e.target.value) || 0))
                              }
                              min="1"
                              className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2 py-1.5 text-sm font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-brand-800"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                openNumpad({
                                  title: `كمية فئة ${tier.tierPrice} د.ع`,
                                  initialValue: tier.quantity,
                                  unit: 'قطعة',
                                  quickPresets: [10, 25, 50, 100],
                                  onConfirm: (val) => updateSliceTier(tier.id, 'quantity', val),
                                })
                              }
                              title="فتح لوحة الأرقام اللمسية"
                              className="p-1.5 rounded-lg bg-warm-200 hover:bg-brand-800 hover:text-white text-stone-700 transition-colors cursor-pointer shrink-0"
                            >
                              <Calculator className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Subtotal & Delete */}
                        <div className="flex items-center gap-3 pt-4 sm:pt-0">
                          <div className="text-left font-mono">
                            <span className="text-[10px] text-stone-400 block font-sans">الإجمالي:</span>
                            <span className="text-xs font-black text-brand-900">
                              {rowSubtotal.toLocaleString()} د.ع
                            </span>
                          </div>

                          {sliceTiers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSliceTier(tier.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="حذف هذه الفئة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Packaging Fee Toggle Card */}
                <div className="bg-white p-3 rounded-xl border-2 border-emerald-500/30 shadow-xs flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasPackaging}
                      onChange={(e) => setHasPackaging(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded accent-emerald-600 cursor-pointer"
                    />
                    <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-emerald-700" />
                      <span>إضافة تعليب (+{PACKAGING_FEE_PER_PIECE} د.ع لكل قطعة كيك)</span>
                    </div>
                  </label>

                  {hasPackaging && (
                    <div className="text-xs font-mono font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      أجور تعليب ({slicesMetrics.totalPieces} قطعة):{' '}
                      {slicesMetrics.packagingTotal.toLocaleString()} د.ع
                    </div>
                  )}
                </div>

                {/* Slices Flavor Notes */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    نكهات وتشكيلة قطع الكيك:
                  </label>
                  <input
                    type="text"
                    value={slicesFlavor}
                    onChange={(e) => setSlicesFlavor(e.target.value)}
                    placeholder="مشكل، ريد فيلفيت، لوتس، أوريو..."
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                  />
                </div>

                {/* Slices Breakdown Summary Bar */}
                <div className="bg-stone-900 text-white p-2.5 rounded-xl flex items-center justify-between text-xs font-bold">
                  <span className="text-stone-300">
                    مجموع القطع:{' '}
                    <span className="text-gold-400 font-mono font-black">{slicesMetrics.totalPieces}</span>{' '}
                    قطعة
                  </span>
                  {hasPackaging && (
                    <span className="text-emerald-400">
                      التعليب: +{slicesMetrics.packagingTotal.toLocaleString()} د.ع
                    </span>
                  )}
                  <span className="text-gold-300 font-mono font-black">
                    مجموع القطع:{' '}
                    {(slicesMetrics.slicesTotal + slicesMetrics.packagingTotal).toLocaleString()} د.ع
                  </span>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* CONSOLIDATED FINANCIALS (UNIFIED TOTAL, DEPOSIT, BALANCE) */}
            {/* ========================================================= */}
            <div className="p-4 bg-white rounded-2xl border-2 border-stone-300 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="text-xs font-black text-stone-800">
                  الحسابات المالية الموحدة للطلبية:
                </span>
                <div className="text-[11px] font-bold text-stone-500">
                  {includeMold && includeSlices && `${cakeMolds.length > 1 ? `${cakeMolds.length} قوالب كيك` : 'قالب كيك'} + قطع كيك`}
                  {includeMold && !includeSlices && `${cakeMolds.length > 1 ? `${cakeMolds.length} قوالب كيك` : 'قالب كيك فقط'}`}
                  {!includeMold && includeSlices && 'قطع كيك فقط'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Total Cost Input */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                    <span>المبلغ الإجمالي ({storeSettings.currency}):</span>
                    <button
                      type="button"
                      onClick={() =>
                        openNumpad({
                          title: 'المبلغ الإجمالي الموحد للحجز',
                          initialValue: numTotal,
                          unit: storeSettings.currency,
                          quickPresets: [10000, 25000, 50000, 100000],
                          onConfirm: (val) => setTotalCost(String(val)),
                        })
                      }
                      title="فتح لوحة الأرقام"
                      className="text-stone-400 hover:text-brand-800 cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={totalCost}
                      onChange={(e) => setTotalCost(e.target.value)}
                      step="500"
                      min="0"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm font-mono font-black text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-800"
                      required
                    />
                  </div>
                </div>

                {/* Deposit Input */}
                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center justify-between">
                    <span>العربون المستلم الآن ({storeSettings.currency}):</span>
                    <button
                      type="button"
                      onClick={() =>
                        openNumpad({
                          title: 'العربون المستلم الآن',
                          initialValue: numDeposit,
                          unit: storeSettings.currency,
                          quickPresets: [5000, 10000, 25000, 50000],
                          onConfirm: (val) => setDepositPaid(String(val)),
                        })
                      }
                      title="فتح لوحة الأرقام"
                      className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={depositPaid}
                      onChange={(e) => setDepositPaid(e.target.value)}
                      step="500"
                      min="0"
                      className="w-full bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-2 text-sm font-mono font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                      required
                    />
                  </div>
                </div>

                {/* Remaining Balance */}
                <div>
                  <label className="block text-xs font-bold text-rose-800 mb-1">
                    المتبقي عند الاستلام:
                  </label>
                  <div className="w-full bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-sm font-mono font-black text-rose-800">
                    {remainingBalance.toLocaleString()} {storeSettings.currency}
                  </div>
                </div>
              </div>

              {/* Checkbox: Ring up deposit to drawer right now */}
              <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs font-bold text-stone-700 select-none">
                <input
                  type="checkbox"
                  checked={ringUpDeposit}
                  onChange={(e) => setRingUpDeposit(e.target.checked)}
                  className="w-4 h-4 text-brand-800 rounded accent-brand-800 cursor-pointer"
                />
                <span>
                  إدراج العربون ({numDeposit.toLocaleString()} {storeSettings.currency}) مباشرة في صندوق اليومية الحالي كعربون مقبوض
                </span>
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ملاحظات إضافية (توصيل، وقت خاص، إلخ):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="أي تفاصيل أخرى خاصة بالطلب..."
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-2 border-t border-stone-200">
              <button
                type="submit"
                className="flex-1 bg-brand-800 hover:bg-brand-900 text-white font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 text-gold-400" />
                <span>
                  {initialData
                    ? 'حفظ وتحديث بيانات الحجز'
                    : 'تثبيت الحجز وطباعة الوصل الحراري (72.1mm)'}
                </span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors text-sm cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Universal Virtual Numpad Modal */}
      <VirtualNumpadModal
        isOpen={numpadConfig.isOpen}
        onClose={() => setNumpadConfig((prev) => ({ ...prev, isOpen: false }))}
        title={numpadConfig.title}
        initialValue={numpadConfig.initialValue}
        unit={numpadConfig.unit}
        mode={numpadConfig.mode}
        quickPresets={numpadConfig.quickPresets}
        onConfirm={numpadConfig.onConfirm}
      />
    </>
  );
}
