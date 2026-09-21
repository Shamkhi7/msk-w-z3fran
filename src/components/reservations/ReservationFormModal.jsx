import React, { useState } from 'react';
import { X, Check, Calendar, Clock, Cake, User, Phone, DollarSign, Type } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function ReservationFormModal({ isOpen, onClose }) {
  const { addReservation, storeSettings } = usePOS();

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupDate, setPickupDate] = useState(tomorrow);
  const [pickupTime, setPickupTime] = useState('18:00');
  const [cakeSize, setCakeSize] = useState('2');
  const [cakeFlavor, setCakeFlavor] = useState('');
  const [cakeDesign, setCakeDesign] = useState('');
  const [writtenText, setWrittenText] = useState('');
  const [totalCost, setTotalCost] = useState('35000');
  const [depositPaid, setDepositPaid] = useState('15000');
  const [notes, setNotes] = useState('');
  const [ringUpDeposit, setRingUpDeposit] = useState(true);

  if (!isOpen) return null;

  const numTotal = Number(totalCost) || 0;
  const numDeposit = Number(depositPaid) || 0;
  const remainingBalance = Math.max(0, numTotal - numDeposit);

  const cakeSizeGuides = [
    { size: '0', label: 'قياس 0', desc: 'شخصين (ميني)' },
    { size: '1', label: 'قياس 1', desc: '4-6 أشخاص' },
    { size: '2', label: 'قياس 2', desc: '8-10 أشخاص' },
    { size: '3', label: 'قياس 3', desc: '12-16 شخص' },
    { size: '4', label: 'قياس 4', desc: 'طابقين ملكي' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || numTotal <= 0) {
      alert('يرجى ملء اسم الزبون ورقم الهاتف والمبلغ الإجمالي');
      return;
    }

    addReservation(
      {
        customerName: customerName.trim(),
        phone: phone.trim(),
        pickupDate,
        pickupTime,
        cakeSize,
        cakeFlavor: cakeFlavor.trim(),
        cakeDesign: cakeDesign.trim(),
        writtenText: writtenText.trim(),
        totalCost: numTotal,
        depositPaid: numDeposit,
        notes: notes.trim(),
      },
      ringUpDeposit
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-[#FAF8F5] border border-brand-900/20 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-brand-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cake className="w-5 h-5 text-gold-400" />
            <h3 className="font-bold text-base">تسجيل حجز قالب كيك جديد</h3>
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
          {/* Customer Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  className="w-full bg-white border border-stone-300 rounded-xl pr-9 pl-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                  required
                  autoFocus
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
                  className="w-full bg-white border border-stone-300 rounded-xl pr-9 pl-3 py-2 text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                  required
                />
              </div>
            </div>
          </div>

          {/* Delivery Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                تاريخ الاستلام (Pickup Date):
              </label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                وقت الاستلام المتوقع:
              </label>
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800"
                required
              />
            </div>
          </div>

          {/* Cake Size Selection (0 to 4) */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              قياس قالب الكيك (Cake Size):
            </label>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {cakeSizeGuides.map((guide) => {
                const isSelected = cakeSize === guide.size;
                return (
                  <button
                    key={guide.size}
                    type="button"
                    onClick={() => setCakeSize(guide.size)}
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-800 text-white border-brand-950 shadow-md ring-2 ring-gold-500/50'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-warm-100'
                    }`}
                  >
                    <div className="font-black text-xs sm:text-sm">{guide.label}</div>
                    <div className={`text-[9px] truncate ${isSelected ? 'text-gold-300' : 'text-stone-400'}`}>
                      {guide.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Written Text on Cake */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              العبارة المكتوبة على الكيك (Written Text on Cake):
            </label>
            <div className="relative">
              <Type className="w-4 h-4 absolute right-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={writtenText}
                onChange={(e) => setWrittenText(e.target.value)}
                placeholder="مثال: كل عام وأنت بألف خير يا سارة ❤️"
                className="w-full bg-white border-2 border-stone-300 focus:border-brand-800 rounded-xl pr-9 pl-3 py-2 text-sm font-bold text-brand-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Flavor & Design Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                نكهة وحشوة الكيك:
              </label>
              <input
                type="text"
                value={cakeFlavor}
                onChange={(e) => setCakeFlavor(e.target.value)}
                placeholder="شوكولاتة وفراولة، زعفران ومسك..."
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                تفاصيل الشكل والتصميم:
              </label>
              <input
                type="text"
                value={cakeDesign}
                onChange={(e) => setCakeDesign(e.target.value)}
                placeholder="ورود طبيعية، مجسم سبايدرمان، إلخ..."
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>
          </div>

          {/* Financials: Total, Deposit, Remaining */}
          <div className="p-3.5 bg-white rounded-2xl border-2 border-stone-300 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  المبلغ الإجمالي ({storeSettings.currency}):
                </label>
                <input
                  type="number"
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  step="500"
                  min="0"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-800 mb-1">
                  العربون المدفوع الآن ({storeSettings.currency}):
                </label>
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
              ملاحظات إضافية (تغليف، توصيل، إلخ):
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
              <span>تثبيت الحجز وطباعة الوصل الحراري (72.1mm)</span>
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
  );
}
