import React, { useState, useEffect, useMemo } from 'react';
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
  UserCheck,
  Users,
  Flame,
  Zap,
  MessageCircle,
  Send,
  Copy,
  Camera,
  Truck,
  CreditCard,
  Banknote,
  X,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ReservationFormModal } from './ReservationFormModal';
import { WhatsAppReceiptImageModal } from './WhatsAppReceiptImageModal';
import { ManageReservationStaffModal } from './ManageReservationStaffModal';
import { ManagerPinModal } from '../treasury/ManagerPinModal';
import { formatPickupDateTime, getReservationDueStatus } from '../../utils/dateFormatter';
import { sendReservationToStaffGroup, copyReservationToClipboard } from '../../utils/whatsappHelper';
import { fetchIndexedDBReservations } from '../../utils/productAnalyticsHelper';

const PAGE_SIZE = 24;

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
  const [activeFilter, setActiveFilter] = useState('today'); // Default: 'today' (حجوزات اليوم)
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [historicalReservations, setHistoricalReservations] = useState([]);
  const [hasFetchedHistorical, setHasFetchedHistorical] = useState(false);
  const [isFetchingHistorical, setIsFetchingHistorical] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'cancel', id } or { type: 'delete', reservation } or { type: 'manage_staff' }
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [receiptImageModalTarget, setReceiptImageModalTarget] = useState(null);
  const [balanceCollectionTarget, setBalanceCollectionTarget] = useState(null); // { res, paymentMethod: 'نقداً' }

  const handleOpenWhatsApp = (phone, customerName, bookingNo, pickupDate, pickupTime, remainingBalance) => {
    if (!phone) return;
    let cleanPhone = String(phone).replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('07')) {
      cleanPhone = '964' + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith('7')) {
      cleanPhone = '964' + cleanPhone;
    }
    const msg = `مرحباً بك زبوننا العزيز ${customerName} في مسك وزعفران 🌸\nنود إعلامكم بتفاصيل حجز الكيك الخاص بكم رقم (${bookingNo}):\n📅 موعد الاستلام: ${formatPickupDateTime(pickupDate, pickupTime)}\n💰 المبلغ المتبقي بذمتكم: ${Number(remainingBalance || 0).toLocaleString()} د.ع\nنشكر ثقتكم ونتمنى لكم أطيب الأوقات ✨`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleSendToStaff = (res) => {
    setReceiptImageModalTarget(res);
  };

  const handleCopyForStaff = async (res) => {
    const ok = await copyReservationToClipboard(res, storeSettings);
    if (ok && showToast) {
      showToast('تم نسخ تفاصيل الحجز كاملة إلى الحافظة! يمكنك لصقها الآن في أي كروب 📋', 'success');
    }
  };

  const handleOpenStaffManagement = () => {
    if (isManager) {
      setIsStaffModalOpen(true);
    } else {
      setPendingAction({ type: 'manage_staff' });
      setIsPinModalOpen(true);
    }
  };

  const loadHistoricalReservations = async () => {
    if (hasFetchedHistorical || isFetchingHistorical) return;
    setIsFetchingHistorical(true);
    try {
      const fetchPromise = fetchIndexedDBReservations();
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve([]), 3500));
      const archived = await Promise.race([fetchPromise, timeoutPromise]);

      if (Array.isArray(archived) && archived.length > 0) {
        const existingIds = new Set((reservations || []).map((r) => r.id || r.receiptNumber));
        const uniqueArchived = archived.filter((r) => r && (r.id || r.receiptNumber) && !existingIds.has(r.id || r.receiptNumber));
        setHistoricalReservations(uniqueArchived);
      }
    } catch (err) {
      console.warn('Failed to lazy load historical reservations:', err);
    } finally {
      setIsFetchingHistorical(false);
      setHasFetchedHistorical(true);
    }
  };

  useEffect(() => {
    if (activeFilter === 'all' && !hasFetchedHistorical && !isFetchingHistorical) {
      loadHistoricalReservations();
    }
  }, [activeFilter, hasFetchedHistorical, isFetchingHistorical]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeFilter, searchQuery]);

  const todayStr = new Date().toISOString().split('T')[0];
  const urgentCount = (reservations || []).filter((r) => getReservationDueStatus(r.pickupDate, r.pickupTime, r.status).isUrgent).length;
  const todayCount = (reservations || []).filter((r) => r.pickupDate === todayStr).length;
  const deliveryCount = (reservations || []).filter((r) => r.isDelivery).length;
  const preparingCount = (reservations || []).filter((r) => r.status === 'قيد التحضير').length;
  const readyCount = (reservations || []).filter((r) => r.status === 'جاهز').length;
  const deliveredCount = (reservations || []).filter((r) => r.status === 'تم التسليم').length;

  const sourceReservations = useMemo(() => {
    if (activeFilter !== 'all' || historicalReservations.length === 0) {
      return reservations || [];
    }
    const existingIds = new Set((reservations || []).map((r) => r.id || r.receiptNumber));
    const newHistory = historicalReservations.filter((r) => !existingIds.has(r.id || r.receiptNumber));
    return [...(reservations || []), ...newHistory];
  }, [reservations, historicalReservations, activeFilter]);

  const filteredReservations = useMemo(() => {
    const list = sourceReservations;
    const q = searchQuery.trim().toLowerCase();

    return list.filter((r) => {
      const matchesSearch =
        !q ||
        r.customerName?.toLowerCase().includes(q) ||
        r.phone?.includes(q) ||
        r.receiptNumber?.toLowerCase().includes(q) ||
        (r.workerName && r.workerName.toLowerCase().includes(q)) ||
        (r.manualBookingNo && r.manualBookingNo.toLowerCase().includes(q)) ||
        (r.writtenText && r.writtenText.toLowerCase().includes(q)) ||
        (r.deliveryAddress && r.deliveryAddress.toLowerCase().includes(q)) ||
        (r.cakeMolds && r.cakeMolds.some((m) =>
          m.writtenText?.toLowerCase().includes(q) ||
          m.cakeFlavor?.toLowerCase().includes(q) ||
          m.cakeDesign?.toLowerCase().includes(q)
        ));

      if (!matchesSearch) return false;
      if (activeFilter === 'all') return true;
      if (activeFilter === 'delivery') return Boolean(r.isDelivery);
      if (activeFilter === 'today') return r.pickupDate === todayStr;
      if (activeFilter === 'urgent') return getReservationDueStatus(r.pickupDate, r.pickupTime, r.status).isUrgent;
      if (activeFilter === 'preparing') return r.status === 'قيد التحضير';
      if (activeFilter === 'ready') return r.status === 'جاهز';
      if (activeFilter === 'delivered') return r.status === 'تم التسليم';
      return true;
    });
  }, [sourceReservations, searchQuery, activeFilter, todayStr]);

  const displayedReservations = useMemo(() => {
    return filteredReservations.slice(0, visibleCount);
  }, [filteredReservations, visibleCount]);

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
              إجمالي الحجوزات المسجلة: {hasFetchedHistorical ? reservations.length + historicalReservations.length : reservations.length} طلب
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenStaffManagement}
            className="bg-warm-100 hover:bg-warm-200 text-stone-800 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-warm-300 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4 text-brand-800" />
            <span>إدارة الموظفين</span>
          </button>

          <button
            onClick={() => {
              setEditingReservation(null);
              setIsFormOpen(true);
            }}
            className="bg-brand-800 hover:bg-brand-900 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>+ إضافة حجز</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-3 bg-white border-b border-warm-200/80 flex flex-wrap items-center justify-between gap-2">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {[
            { id: 'today', label: 'حجوزات اليوم', count: todayCount, badgeClass: 'bg-brand-900 text-white' },
            { id: 'preparing', label: 'قيد التحضير', count: preparingCount > 0 ? preparingCount : null, badgeClass: 'bg-amber-700 text-white' },
            { id: 'ready', label: 'جاهزة للتسليم', count: readyCount > 0 ? readyCount : null, badgeClass: 'bg-blue-700 text-white' },
            { id: 'delivered', label: 'مكتملة / مستلمة', count: deliveredCount > 0 ? deliveredCount : null, badgeClass: 'bg-emerald-700 text-white' },
            { id: 'delivery', label: '🛵 توصيل خارجي', count: deliveryCount > 0 ? deliveryCount : null, badgeClass: 'bg-indigo-600 text-white' },
            ...(urgentCount > 0 ? [{
              id: 'urgent',
              label: 'عاجل ومتأخر ⚡',
              count: urgentCount,
              badgeClass: 'bg-rose-600 text-white animate-pulse',
            }] : []),
            {
              id: 'all',
              label: 'كافة الحجوزات',
              count: isFetchingHistorical
                ? '...'
                : hasFetchedHistorical
                ? (reservations.length + historicalReservations.length)
                : reservations.length,
              badgeClass: 'bg-stone-600 text-white',
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeFilter === tab.id
                  ? 'bg-brand-800 text-white shadow-xs'
                  : tab.id === 'urgent' && tab.count > 0
                  ? 'bg-rose-50 text-rose-900 border-2 border-rose-400 hover:bg-rose-100 font-black'
                  : 'bg-warm-50 text-stone-600 hover:bg-warm-100 border border-warm-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    activeFilter === tab.id
                      ? 'bg-white text-brand-900'
                      : tab.badgeClass || 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
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

      {/* Smart Urgency Banner (Appears when there are due/overdue orders) */}
      {urgentCount > 0 && (
        <div className="mx-3 sm:mx-4 mt-3 p-3 sm:p-3.5 bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border-2 border-rose-300 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0 animate-pulse">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-rose-950 text-xs sm:text-sm flex items-center gap-2">
                <span>تنبيه تسليم طلبيات الكيك:</span>
                <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                  {urgentCount} طلبات موعدها الآن أو متأخرة
                </span>
              </div>
              <div className="text-[11px] text-stone-600 font-medium">
                يرجى مطابقة الكيك في قسم التجهيز والتزيين للتأكد من تسليمه في الوقت المحدد دون تأخير الزبائن
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveFilter('urgent')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              activeFilter === 'urgent'
                ? 'bg-rose-700 text-white'
                : 'bg-white hover:bg-rose-600 hover:text-white text-rose-900 border border-rose-300 active:scale-95'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>عرض الطلبات العاجلة بنقرة واحدة</span>
          </button>
        </div>
      )}

      {/* Reservations List */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
        {filteredReservations.length === 0 ? (
          <div className="p-12 text-center text-stone-400 flex flex-col items-center justify-center">
            <Cake className="w-12 h-12 text-stone-300 mb-2" />
            <p className="font-bold text-stone-600">لا توجد حجوزات مطابقة للبحث أو الفلتر</p>
          </div>
        ) : (
          <>
            {isFetchingHistorical && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 flex items-center justify-center gap-2 animate-pulse">
                <Clock className="w-4 h-4 animate-spin" />
                <span>جاري فحص وجلب الأرشيف التاريخي للحجوزات...</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {displayedReservations.map((res) => {
              const badge = getStatusBadge(res.status);
              const BadgeIcon = badge.icon;
              const isToday = res.pickupDate === todayStr;
              const dueStatus = getReservationDueStatus(res.pickupDate, res.pickupTime, res.status);

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
                  className={`bg-white rounded-2xl border shadow-xs hover:shadow-md transition-all p-4 flex flex-col justify-between text-right space-y-3 ${
                    dueStatus.isOverdue
                      ? 'border-rose-400 ring-1 ring-rose-300'
                      : dueStatus.isUrgent
                      ? 'border-amber-400 ring-1 ring-amber-300'
                      : 'border-warm-200'
                  }`}
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
                        {/* Delivery Badge */}
                        {res.isDelivery && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white shadow-xs flex items-center gap-1 border border-blue-700">
                            <Truck className="w-3 h-3" />
                            <span>🛵 توصيل خارجي</span>
                          </span>
                        )}
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
                        {/* Due Urgency Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border flex items-center gap-1 ${dueStatus.badgeClass}`}>
                          {dueStatus.isUrgent && <Zap className="w-2.5 h-2.5 shrink-0" />}
                          <span>{dueStatus.label}</span>
                        </span>
                      </div>
                      <h4 className="font-black text-stone-800 text-base mt-1">
                        {res.customerName}
                      </h4>

                      {/* Delivery Address Details Card (لمنع النسيان) */}
                      {res.isDelivery && (
                        <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-2.5 text-xs text-blue-950 font-bold space-y-1 mt-1.5 shadow-2xs">
                          <div className="flex items-start gap-1.5 text-blue-900">
                            <Truck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] text-blue-600 block font-normal">عنوان التوصيل:</span>
                              <span className="font-black text-xs">{res.deliveryAddress || 'لم يحدد عنوان'}</span>
                            </div>
                          </div>
                          {res.deliveryPhone && res.deliveryPhone !== res.phone && (
                            <div className="text-[11px] text-blue-800 pr-5">
                              هاتف التوصيل: <span className="font-mono font-bold">{res.deliveryPhone}</span>
                            </div>
                          )}
                          {res.deliveryNotes && (
                            <div className="text-[10.5px] text-blue-700 italic pr-5">
                              ملاحظات السائق: {res.deliveryNotes}
                            </div>
                          )}
                          {Number(res.deliveryFee || 0) > 0 && (
                            <div className="text-[11px] font-mono font-black text-blue-950 pr-5 pt-0.5 border-t border-blue-200 flex justify-between">
                              <span>أجور التوصيل (للسائق):</span>
                              <span>{Number(res.deliveryFee).toLocaleString()} {storeSettings.currency}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-stone-500 font-mono mt-0.5 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span>{res.phone}</span>
                          {res.phone && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenWhatsApp(
                                  res.phone,
                                  res.customerName,
                                  res.manualBookingNo || res.receiptNumber,
                                  res.pickupDate,
                                  res.pickupTime,
                                  res.remainingBalance
                                );
                              }}
                              title="إرسال تفاصيل وموعد الحجز عبر واتساب للزبون"
                              className="mr-1 p-0.5 px-1.5 rounded-md bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 transition-colors text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>واتساب الزبون</span>
                            </button>
                          )}
                        </div>
                        {res.workerName && (
                          <div className="flex items-center gap-1 text-[11px] text-stone-700 font-semibold bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                            <UserCheck className="w-3 h-3 text-brand-800" />
                            <span>المسؤول: {res.workerName}</span>
                          </div>
                        )}
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
                  <div className={`p-2.5 rounded-xl border text-xs flex justify-between items-center ${
                    dueStatus.isOverdue
                      ? 'bg-rose-50/90 border-rose-300 text-rose-950 font-bold'
                      : dueStatus.isUrgent
                      ? 'bg-amber-50/90 border-amber-300 text-amber-950 font-bold'
                      : 'bg-warm-100/80 border-warm-200 text-stone-800'
                  }`}>
                    <span className="font-bold flex items-center gap-1.5">
                      <Clock className={`w-3.5 h-3.5 ${dueStatus.isOverdue ? 'text-rose-600' : dueStatus.isUrgent ? 'text-amber-600' : 'text-brand-800'}`} />
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
                        onClick={() => setBalanceCollectionTarget({ res, paymentMethod: 'نقداً' })}
                        title="تسليم الكيك واستلام المتبقي وتحديد طريقة الدفع (كاش / بطاقة)"
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-xs"
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

                    {/* Print Options Group: Customer, Kitchen, Both */}
                    <div className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded-xl border border-stone-300">
                      <button
                        type="button"
                        onClick={() => triggerPrint('reservation', res)}
                        title="طباعة وصل الزبون الحراري (المالي)"
                        className="px-2 py-1 rounded-lg hover:bg-white text-stone-700 hover:text-brand-900 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3 text-stone-600" />
                        <span>وصل الزبون</span>
                      </button>

                      <span className="text-stone-300 text-xs">|</span>

                      <button
                        type="button"
                        onClick={() => triggerPrint('kitchen_ticket', res)}
                        title="طباعة بون المعمل والإنتاج للشيف (بدون أسعار)"
                        className="px-2 py-1 rounded-lg hover:bg-amber-100 text-amber-900 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3 text-amber-700" />
                        <span>المعمل</span>
                      </button>
                    </div>

                    {/* WhatsApp Staff Group Receipt Image Button */}
                    <div className="flex items-center gap-1 bg-emerald-50/90 p-0.5 rounded-xl border border-emerald-300">
                      <button
                        type="button"
                        onClick={() => handleSendToStaff(res)}
                        title="إرسال صورة وصل الحجز لكروب موظفي المعمل عبر واتساب"
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                      >
                        <Camera className="w-3 h-3 text-emerald-200" />
                        <span>صورة للكروب 📸</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyForStaff(res)}
                        title="نسخ نص الحجز بالكامل للحافظة لمشاركته يدوياً بأي برنامج"
                        className="p-1 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>

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

          {/* Pagination Controls */}
          {filteredReservations.length > visibleCount && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-white border border-warm-200 rounded-2xl shadow-xs mt-4">
              <div className="text-xs font-bold text-stone-600">
                يتم عرض <span className="font-mono font-black text-brand-900">{displayedReservations.length}</span> من أصل <span className="font-mono font-black text-brand-900">{filteredReservations.length}</span> طلب
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredReservations.length))}
                  className="px-4 py-2 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <span>تحميل المزيد (+{PAGE_SIZE})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibleCount(filteredReservations.length)}
                  className="px-3.5 py-2 bg-warm-100 hover:bg-warm-200 text-stone-700 rounded-xl text-xs font-bold transition-all border border-warm-300 cursor-pointer active:scale-95"
                >
                  <span>عرض الكل ({filteredReservations.length})</span>
                </button>
              </div>
            </div>
          )}
        </>
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
          } else if (pendingAction?.type === 'manage_staff') {
            setIsStaffModalOpen(true);
          }
          setPendingAction(null);
        }}
        title="صلاحيات المدير - إدارة الحجوزات"
        promptMessage="هذا الإجراء يتطلب صلاحيات المدير. يرجى إدخال رمز تأكيد المدير للمتابعة"
      />

      {/* Staff Management Modal */}
      <ManageReservationStaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
      />

      {/* WhatsApp Receipt Image Dispatch Modal */}
      {receiptImageModalTarget && (
        <WhatsAppReceiptImageModal
          isOpen={!!receiptImageModalTarget}
          onClose={() => setReceiptImageModalTarget(null)}
          reservation={receiptImageModalTarget}
          storeSettings={storeSettings}
          initialType="kitchen"
        />
      )}

      {/* Balance Collection & Payment Method Modal */}
      {balanceCollectionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in select-none">
          <div className="bg-[#FAF8F5] border border-brand-900/20 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="bg-brand-800 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-gold-400" />
                <h3 className="font-bold text-sm">تسليم الطلبية واستلام المتبقي</h3>
              </div>
              <button
                onClick={() => setBalanceCollectionTarget(null)}
                className="text-warm-200 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5">
              <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-500 font-bold">الزبون:</span>
                  <span className="font-black text-stone-900">{balanceCollectionTarget.res.customerName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-stone-500 font-bold">رقم الحجز:</span>
                  <span className="font-mono font-bold text-stone-700">{balanceCollectionTarget.res.receiptNumber}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-black border-t border-stone-200 pt-1.5 mt-1">
                  <span className="text-rose-800 font-bold">المتبقي المطلوب:</span>
                  <span className="font-mono text-base font-black text-rose-700">
                    {Number(balanceCollectionTarget.res.remainingBalance || 0).toLocaleString()} {storeSettings.currency}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  طريقة استلام المبلغ المتبقي:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBalanceCollectionTarget(prev => ({ ...prev, paymentMethod: 'نقداً' }))}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      balanceCollectionTarget.paymentMethod === 'نقداً'
                        ? 'bg-emerald-700 text-white shadow-xs font-black'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>💵 نقدي (كاش)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceCollectionTarget(prev => ({ ...prev, paymentMethod: 'بطاقة' }))}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      balanceCollectionTarget.paymentMethod === 'بطاقة'
                        ? 'bg-blue-600 text-white shadow-xs font-black'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>💳 بطاقة / إلكتروني</span>
                  </button>
                </div>
                <div className="text-[10px] text-stone-500 mt-1.5 px-1">
                  {balanceCollectionTarget.paymentMethod === 'بطاقة'
                    ? '• لن يدخل هذا المبلغ في نقدية الصندوق (كاش)، وسيُدرج في مقبوضات الدفع الإلكتروني المعزولة'
                    : '• سيُضاف هذا المبلغ مباشرة إلى كاش صندوق اليومية (صافي النقد)'}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    deliverReservationAndCollectBalance(balanceCollectionTarget.res, balanceCollectionTarget.paymentMethod);
                    setBalanceCollectionTarget(null);
                  }}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>تأكيد الاستلام وتسليم الطلب</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBalanceCollectionTarget(null)}
                  className="px-3 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
