import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Phone,
  Cake,
  PackageCheck,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ReservationFormModal } from './ReservationFormModal';
import { formatPickupDateTime } from '../../utils/dateFormatter';

export function ReservationsModule() {
  const {
    reservations,
    updateReservationStatus,
    deliverReservationAndCollectBalance,
    triggerPrint,
    storeSettings,
  } = usePOS();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // all, today, preparing, ready, delivered
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredReservations = reservations.filter((r) => {
    const matchesSearch =
      !searchQuery.trim() ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) ||
      r.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.writtenText && r.writtenText.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeFilter === 'all') return true;
    if (activeFilter === 'today') return r.pickupDate === todayStr;
    if (activeFilter === 'preparing') return r.status === 'قيد التحضير';
    if (activeFilter === 'ready') return r.status === 'جاهز';
    if (activeFilter === 'delivered') return r.status === 'تم التسليم';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'قيد التحضير':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: Clock,
          label: 'قيد التحضير في المعمل',
        };
      case 'جاهز':
        return {
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: AlertCircle,
          label: 'جاهز للاستلام',
        };
      case 'تم التسليم':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: CheckCircle2,
          label: 'تم التسليم بالكامل',
        };
      default:
        return {
          bg: 'bg-stone-100 text-stone-700 border-stone-300',
          icon: Clock,
          label: status,
        };
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF8F5] overflow-hidden select-none">
      {/* Top Bar */}
      <div className="p-3 sm:p-4 bg-white border-b border-warm-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-brand-900 leading-tight">
              سجل حجوزات وطلبيات الكيك
            </h2>
            <p className="text-[11px] text-stone-500">
              إجمالي الحجوزات المسجلة: {reservations.length} طلب
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-brand-800 hover:bg-brand-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>+ حجز قالب كيك جديد</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-3 bg-white border-b border-warm-200/80 flex flex-wrap items-center justify-between gap-2">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {[
            { id: 'all', label: 'كافة الحجوزات' },
            { id: 'today', label: 'استلام اليوم' },
            { id: 'preparing', label: 'قيد التحضير' },
            { id: 'ready', label: 'جاهز للتسليم' },
            { id: 'delivered', label: 'تم التسليم' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-brand-800 text-white shadow-xs'
                  : 'bg-warm-50 text-stone-600 hover:bg-warm-100 border border-warm-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم، الهاتف، أو العبارة..."
            className="w-full pl-3 pr-9 py-1.5 bg-warm-50 border border-warm-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-800"
          />
        </div>
      </div>

      {/* Reservations List */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
        {filteredReservations.length === 0 ? (
          <div className="p-12 text-center text-stone-400 flex flex-col items-center justify-center">
            <Cake className="w-12 h-12 text-stone-300 mb-2" />
            <p className="font-bold text-stone-600">لا توجد حجوزات مطابقة للبحث أو الفلتر</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filteredReservations.map((res) => {
              const badge = getStatusBadge(res.status);
              const BadgeIcon = badge.icon;
              const isToday = res.pickupDate === todayStr;

              return (
                <div
                  key={res.id}
                  className="bg-white rounded-2xl border border-warm-200 shadow-xs hover:shadow-md transition-all p-4 flex flex-col justify-between text-right space-y-3"
                >
                  {/* Card Header: Receipt # & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-sm text-brand-900">
                          {res.receiptNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-stone-900 text-white">
                          قياس {res.cakeSize}
                        </span>
                        {isToday && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                            استلام اليوم
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-stone-800 text-base mt-1">
                        {res.customerName}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-stone-500 font-mono mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        <span>{res.phone}</span>
                      </div>
                    </div>

                    <div
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1 ${badge.bg}`}
                    >
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{res.status}</span>
                    </div>
                  </div>

                  {/* Pickup Time & Date */}
                  <div className="bg-warm-100/80 p-2.5 rounded-xl border border-warm-200 text-xs text-stone-800 flex justify-between items-center">
                    <span className="font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-800" />
                      <span>تاريخ ووقت الاستلام:</span>
                    </span>
                    <span className="font-mono font-black text-brand-900 text-xs dir-ltr bg-white px-2 py-0.5 rounded-lg border border-warm-200 shadow-xs">
                      {formatPickupDateTime(res.pickupDate, res.pickupTime)}
                    </span>
                  </div>

                  {/* Written Text on Cake */}
                  {res.writtenText && (
                    <div className="bg-warm-50 p-2 rounded-xl border border-warm-200 text-center">
                      <span className="text-[10px] text-stone-500 block">العبارة المكتوبة:</span>
                      <p className="font-black text-brand-950 text-xs mt-0.5 font-serif">
                        "{res.writtenText}"
                      </p>
                    </div>
                  )}

                  {/* Flavor / Design note if present */}
                  {(res.cakeFlavor || res.cakeDesign) && (
                    <div className="text-[11px] text-stone-600 space-y-0.5 bg-stone-50 p-2 rounded-xl">
                      {res.cakeFlavor && (
                        <div>
                          <span className="font-bold text-stone-700">النكهة:</span> {res.cakeFlavor}
                        </div>
                      )}
                      {res.cakeDesign && (
                        <div>
                          <span className="font-bold text-stone-700">الشكل:</span> {res.cakeDesign}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Financials: Total, Deposit, Remaining */}
                  <div className="pt-2 border-t border-dashed border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-stone-500">الإجمالي:</div>
                      <div className="font-mono font-bold text-stone-800">
                        {res.totalCost.toLocaleString()} {storeSettings.currency}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-emerald-700 font-semibold">العربون:</div>
                      <div className="font-mono font-bold text-emerald-700">
                        {res.depositPaid.toLocaleString()} {storeSettings.currency}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-rose-700 font-bold">المتبقي:</div>
                      <div className="font-mono font-black text-rose-700 text-sm">
                        {res.remainingBalance.toLocaleString()} {storeSettings.currency}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-stone-200 flex items-center gap-1.5 flex-wrap">
                    <select
                      value={res.status}
                      onChange={(e) => updateReservationStatus(res.id, e.target.value)}
                      className="bg-stone-100 border border-stone-300 rounded-xl px-2 py-1.5 text-xs font-bold text-stone-700 focus:outline-none focus:ring-1 focus:ring-brand-800 cursor-pointer"
                    >
                      <option value="قيد التحضير">قيد التحضير</option>
                      <option value="جاهز">جاهز للتسليم</option>
                      <option value="تم التسليم">تم التسليم</option>
                      <option value="ملغي">ملغي</option>
                    </select>

                    {res.status !== 'تم التسليم' && res.remainingBalance > 0 && (
                      <button
                        onClick={() => deliverReservationAndCollectBalance(res)}
                        title="تسليم الكيك واستلام المتبقي في الصندوق"
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>تسليم واستلام ({res.remainingBalance.toLocaleString()})</span>
                      </button>
                    )}

                    <button
                      onClick={() => triggerPrint('reservation', res)}
                      title="إعادة طباعة وصل الحجز الحراري"
                      className="mr-auto p-1.5 bg-stone-100 hover:bg-brand-50 text-stone-600 hover:text-brand-800 rounded-xl border border-stone-200 transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ReservationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
}
