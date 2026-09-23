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
  Trash2,
  Lock,
  Edit3,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ReservationFormModal } from './ReservationFormModal';
import { ManagerPinModal } from '../treasury/ManagerPinModal';
import { formatPickupDateTime } from '../../utils/dateFormatter';

export function ReservationsModule() {
  const {
    reservations,
    updateReservationStatus,
    deliverReservationAndCollectBalance,
    deleteReservation,
    triggerPrint,
    storeSettings,
    isManager,
    currentSession,
    showToast,
  } = usePOS();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // all, today, preparing, ready, delivered
  const [searchQuery, setSearchQuery] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'cancel', id } or { type: 'delete', reservation }
  const [reservationToDelete, setReservationToDelete] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredReservations = reservations.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.customerName?.toLowerCase().includes(q) ||
      r.phone?.includes(q) ||
      r.receiptNumber?.toLowerCase().includes(q) ||
      (r.manualBookingNo && r.manualBookingNo.toLowerCase().includes(q)) ||
      (r.writtenText && r.writtenText.toLowerCase().includes(q)) ||
      (r.cakeMolds && r.cakeMolds.some((m) =>
        m.writtenText?.toLowerCase().includes(q) ||
        m.cakeFlavor?.toLowerCase().includes(q) ||
        m.cakeDesign?.toLowerCase().includes(q)
      ));

    if (!matchesSearch) return false;
    if (activeFilter === 'all') return true;
    if (activeFilter === 'today') return r.pickupDate === todayStr;
    if (activeFilter === 'preparing') return r.status === 'قيد التحضير';
    if (activeFilter === 'ready') return r.status === 'جاهز';
    if (activeFilter === 'delivered') return r.status === 'تم التسليم';
    return true;
  });

  const handleStatusChange = (resId, newStatus) => {
    if (newStatus === 'ملغي' && !isManager) {
      setPendingAction({ type: 'cancel', id: resId });
      setIsPinModalOpen(true);
      return;
    }
    updateReservationStatus(resId, newStatus);
  };

  const handleInitiateDelete = (res) => {
    const isCurrentSession = (res.sessionId === currentSession.sessionId || res.depositSessionId === currentSession.sessionId);

    // If reservation is from a past session/shift, cashier must get manager approval
    if (!isCurrentSession && !isManager) {
      setPendingAction({ type: 'delete', reservation: res });
      setIsPinModalOpen(true);
      return;
    }

    setReservationToDelete({
      ...res,
      isCurrentSession,
    });
  };

  const confirmDeleteReservation = () => {
    if (reservationToDelete) {
      const res = deleteReservation(reservationToDelete.id);
      if (reservationToDelete.isCurrentSession && (reservationToDelete.depositPaid || 0) > 0) {
        showToast(
          `تم إلغاء الحجز وإعادة العربون (${Number(reservationToDelete.depositPaid).toLocaleString()} د.ع) إلى الزبون وخصمه من الصندوق`,
          'warning'
        );
      } else {
        showToast('تم حذف الحجز بنجاح من السجل', 'info');
      }
      setReservationToDelete(null);
    }
  };

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
          onClick={() => {
            setEditingReservation(null);
            setIsFormOpen(true);
          }}
          className="bg-brand-800 hover:bg-brand-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>+ إضافة حجز</span>
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
            placeholder="ابحث بالاسم، الهاتف، رقم الوصل، أو العبارة..."
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

              const resMolds = (res.cakeMolds && res.cakeMolds.length > 0)
                ? res.cakeMolds
                : ((res.hasMold !== false && (res.cakeSize || res.hasMold))
                    ? [{
                        cakeSize: res.cakeSize,
                        moldPrice: res.moldPrice,
                        cakeFlavor: res.cakeFlavor,
                        cakeDesign: res.cakeDesign,
                        writtenText: res.writtenText,
                      }]
                    : []);
              const hasMold = resMolds.length > 0;

              return (
                <div
                  key={res.id}
                  className="bg-white rounded-2xl border border-warm-200 shadow-xs hover:shadow-md transition-all p-4 flex flex-col justify-between text-right space-y-3"
                >
                  {/* Card Header: Receipt # & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {res.manualBookingNo && (
                          <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-amber-100 text-amber-950 border border-amber-300 font-mono shadow-2xs">
                            وصل يدوي: #{res.manualBookingNo}
                          </span>
                        )}
                        <span className="font-mono font-bold text-xs text-stone-500">
                          {res.receiptNumber}
                        </span>
                        {/* Mold Badge */}
                        {hasMold && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-stone-900 text-white">
                            {resMolds.length > 1
                              ? `🎂 ${resMolds.length} قوالب كيك`
                              : `قالب قياس ${resMolds[0].cakeSize}`}
                          </span>
                        )}
                        {/* Slices Badge */}
                        {(res.hasSlices || res.reservationType === 'cake_slices' || (res.sliceTiers && res.sliceTiers.length > 0)) && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-600 text-white flex items-center gap-1">
                            <span>🍰 {res.totalPieces} قطعة</span>
                          </span>
                        )}
                        {res.hasPackaging && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white">
                            📦 تعليب
                          </span>
                        )}
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
                    <span className="text-xs font-black text-brand-900 bg-white px-2 py-0.5 rounded-lg border border-warm-200 shadow-xs">
                      {formatPickupDateTime(res.pickupDate, res.pickupTime)}
                    </span>
                  </div>

                  {/* Cake Slices Breakdown if Slices Present */}
                  {(res.hasSlices || res.reservationType === 'cake_slices' || res.sliceTiers?.length > 0) && res.sliceTiers?.length > 0 && (
                    <div className="bg-amber-50/90 p-2.5 rounded-xl border border-amber-200/90 space-y-1.5 text-right">
                      <div className="text-[11px] font-bold text-amber-900 flex items-center justify-between">
                        <span>فئات قطع الكيك:</span>
                        <span className="font-mono font-black text-xs">{res.totalPieces} قطعة</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {res.sliceTiers.map((tier, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[11px] font-mono font-bold bg-white text-stone-800 px-2 py-0.5 rounded-lg border border-amber-300 shadow-2xs"
                          >
                            {tier.quantity} × {Number(tier.tierPrice).toLocaleString()} د.ع
                          </span>
                        ))}
                      </div>
                      {res.hasPackaging && (
                        <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                          أجور تعليب: {Number(res.packagingTotal || 0).toLocaleString()} د.ع
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cake Molds Details if Mold Present */}
                  {hasMold && (
                    <div className="space-y-2 bg-stone-50/90 p-2.5 rounded-xl border border-stone-200">
                      {resMolds.map((mold, mIdx) => (
                        <div
                          key={mold.id || mIdx}
                          className="space-y-1 pb-1.5 border-b border-dashed border-stone-300 last:border-b-0 last:pb-0"
                        >
                          <div className="flex items-center justify-between text-xs font-black text-brand-900">
                            <span>
                              {resMolds.length > 1
                                ? `قالب #${mIdx + 1} (قياس ${mold.cakeSize})`
                                : `قالب كيك (قياس ${mold.cakeSize})`}
                            </span>
                            {Number(mold.moldPrice) > 0 && (
                              <span className="font-mono text-[11px] text-stone-700">
                                {Number(mold.moldPrice).toLocaleString()} {storeSettings.currency}
                              </span>
                            )}
                          </div>

                          {mold.writtenText && (
                            <div className="bg-white p-1.5 rounded-lg border border-warm-200 text-center">
                              <span className="text-[9px] text-stone-400 block font-sans">العبارة المطلوبة:</span>
                              <p className="font-black text-brand-950 text-xs font-serif">
                                "{mold.writtenText}"
                              </p>
                            </div>
                          )}

                          {mold.cakeDesign && (
                            <div className="bg-amber-50/70 p-1.5 rounded-lg border border-amber-200 text-center">
                              <span className="text-[9px] text-amber-800 font-bold block font-sans">تفاصيل التصميم والشكل:</span>
                              <p className="font-black text-amber-950 text-xs">
                                {mold.cakeDesign}
                              </p>
                            </div>
                          )}

                          {mold.cakeFlavor && (
                            <div className="text-[10px] text-stone-600 bg-white/60 px-2 py-0.5 rounded-md border border-stone-200">
                              <strong className="text-stone-700">النكهة:</strong> {mold.cakeFlavor}
                            </div>
                          )}
                        </div>
                      ))}
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
                      onChange={(e) => handleStatusChange(res.id, e.target.value)}
                      className="bg-stone-100 border border-stone-300 rounded-xl px-2 py-1.5 text-xs font-bold text-stone-700 focus:outline-none focus:ring-1 focus:ring-brand-800 cursor-pointer"
                    >
                      <option value="قيد التحضير">قيد التحضير</option>
                      <option value="جاهز">جاهز للتسليم</option>
                      <option value="تم التسليم">تم التسليم</option>
                      <option value="ملغي">{isManager ? 'ملغي' : 'ملغي (محمي برمز المدير)'}</option>
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

                    {/* Edit Reservation Button */}
                    <button
                      onClick={() => {
                        setEditingReservation(res);
                        setIsFormOpen(true);
                      }}
                      title="تعديل بيانات وتفاصيل الحجز"
                      className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl border border-amber-200 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>

                    <button
                      onClick={() => triggerPrint('reservation', res)}
                      title="إعادة طباعة وصل الحجز الحراري"
                      className="p-1.5 bg-stone-100 hover:bg-brand-50 text-stone-600 hover:text-brand-800 rounded-xl border border-stone-200 transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* Delete / Undo Reservation Button (accessible to current shift or Manager PIN) */}
                    <button
                      onClick={() => handleInitiateDelete(res)}
                      title="حذف / إلغاء الحجز واسترداد العربون"
                      className="mr-auto p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
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
        onClose={() => {
          setIsFormOpen(false);
          setEditingReservation(null);
        }}
        initialData={editingReservation}
      />

      {/* Reservation Delete Confirmation Modal with Cash Drawer Rollback Alert */}
      {reservationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 text-right border border-warm-200 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-stone-900 text-center mb-1">
              {reservationToDelete.isCurrentSession
                ? 'تأكيد إلغاء الحجز واسترداد العربون'
                : 'تأكيد حذف حجز من وردية سابقة'}
            </h3>

            <div className="p-3 my-3 rounded-xl border text-xs leading-relaxed text-center font-bold">
              {reservationToDelete.isCurrentSession ? (
                Number(reservationToDelete.depositPaid) > 0 ? (
                  <div className="bg-rose-50 border-rose-200 text-rose-800 p-2.5 rounded-lg">
                    ⚠️ تأكيد إلغاء الحجز: سيتم حذف الحجز وخصم مبلغ العربون المدفوع{' '}
                    <span className="font-mono text-sm underline font-black">
                      ({Number(reservationToDelete.depositPaid).toLocaleString()} {storeSettings.currency})
                    </span>{' '}
                    من نقدية الصندوق الحالية تلقائياً. هل أنت متأكد؟
                  </div>
                ) : (
                  <div className="text-stone-700">
                    هل أنت متأكد من إلغاء هذا الحجز وحذفه نهائياً من السجل؟ (لا يوجد عربون مدفوع)
                  </div>
                )
              ) : (
                <div className="bg-amber-50 border-amber-200 text-amber-900 p-2.5 rounded-lg">
                  ℹ️ تنبيه: هذا الحجز مسجل في وردية سابقة / تاريخ سابق. حذف الحجز لن يؤثر على نقدية الصندوق الحالية لأن ورديته قد أغلقت بالفعل.
                </div>
              )}
            </div>

            <div className="text-xs text-stone-600 bg-warm-50 p-3 rounded-xl border border-warm-200 space-y-1 mb-4">
              <div className="flex justify-between">
                <span className="text-stone-500">اسم الزبون:</span>
                <span className="font-bold text-stone-900">{reservationToDelete.customerName}</span>
              </div>
              {reservationToDelete.manualBookingNo && (
                <div className="flex justify-between">
                  <span className="text-stone-500">رقم الحجز اليدوي:</span>
                  <span className="font-mono font-bold text-amber-900">#{reservationToDelete.manualBookingNo}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500">رقم الحجز بالنظام:</span>
                <span className="font-mono font-bold text-stone-900">{reservationToDelete.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">موعد الاستلام:</span>
                <span className="font-bold text-brand-900">
                  {formatPickupDateTime(reservationToDelete.pickupDate, reservationToDelete.pickupTime)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-stone-200 font-bold">
                <span className="text-stone-700">العربون المسجل:</span>
                <span className="font-mono text-rose-700 font-black">
                  {Number(reservationToDelete.depositPaid || 0).toLocaleString()} {storeSettings.currency}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmDeleteReservation}
                className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {reservationToDelete.isCurrentSession && Number(reservationToDelete.depositPaid) > 0
                  ? 'تأكيد الإلغاء وخصم العربون'
                  : 'نعم، حذف الحجز نهائياً'}
              </button>
              <button
                type="button"
                onClick={() => setReservationToDelete(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                تراجع / إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manager PIN Protection Modal for Reservation Cancellation & Historical Deletion */}
      <ManagerPinModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={() => {
          setIsPinModalOpen(false);
          if (pendingAction?.type === 'cancel') {
            updateReservationStatus(pendingAction.id, 'ملغي');
          } else if (pendingAction?.type === 'delete') {
            setReservationToDelete({
              ...pendingAction.reservation,
              isCurrentSession: false,
            });
          }
          setPendingAction(null);
        }}
        title="صلاحيات المدير - إدارة الحجوزات"
        promptMessage="هذا الإجراء يتطلب صلاحيات المدير. يرجى إدخال رمز تأكيد المدير للمتابعة"
      />
    </div>
  );
}
