import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  CalendarDays,
  Receipt,
  Wallet,
  Settings,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Clock,
  Sparkles,
  Printer,
  Shield,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { RoleSwitchModal } from './RoleSwitchModal';

export function Header({ activeTab, setActiveTab, onOpenSettings }) {
  const {
    storeSettings,
    setStoreSettings,
    dailyTreasury,
    reservations,
    cartSummary,
    printXReport,
    userRole,
    activeCashier,
    isManager,
  } = usePOS();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const toggleSound = () => {
    setStoreSettings((prev) => ({
      ...prev,
      allowSound: !prev.allowSound,
    }));
  };

  const pendingReservationsCount = reservations.filter(
    (r) => r.status === 'قيد التحضير' || r.status === 'جاهز'
  ).length;

  const navItems = [
    {
      id: 'pos',
      label: 'نقطة البيع السريعة',
      shortLabel: 'الكاشير',
      icon: ShoppingBag,
      badge: cartSummary.itemCount > 0 ? cartSummary.itemCount : null,
      badgeColor: 'bg-gold-500 text-brand-950',
    },
    {
      id: 'reservations',
      label: 'سجل حجوزات الكيك',
      shortLabel: 'الحجوزات',
      icon: CalendarDays,
      badge: pendingReservationsCount > 0 ? pendingReservationsCount : null,
      badgeColor: 'bg-rose-600 text-white',
    },
    {
      id: 'expenses',
      label: 'أرشيف الصرفيات',
      shortLabel: 'الصرفيات',
      icon: Receipt,
      badge: null,
    },
    {
      id: 'treasury',
      label: 'الخزينة وتصفير الصندوق',
      shortLabel: 'الخزينة و Z-Report',
      icon: Wallet,
      badge: null,
    },
  ];

  return (
    <header className="bg-brand-800 text-white border-b-2 border-brand-900 shadow-md sticky top-0 z-30 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        {/* Brand & Boutique Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-700 to-brand-950 border border-gold-500/50 flex items-center justify-center shadow-inner flex-shrink-0">
            <span className="font-serif font-black text-lg text-gold-400">MZ</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-lg sm:text-xl tracking-tight leading-none text-warm-50">
                {storeSettings.storeNameAr}
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-950 text-gold-400 font-bold border border-gold-500/30 hidden sm:inline-block">
                POS
              </span>
            </div>
            <p className="text-[10px] text-warm-200 font-sans tracking-wide leading-tight hidden xs:block">
              {storeSettings.storeNameEn} • حلويات ملكية
            </p>
          </div>
        </div>

        {/* Central Module Navigation Buttons */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-warm-50 text-brand-900 shadow-md font-extrabold translate-y-[-1px]'
                    : 'text-warm-100 hover:bg-brand-700/70 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-800' : 'text-gold-400'}`} />
                <span className="hidden md:inline">{item.label}</span>
                <span className="md:hidden inline">{item.shortLabel}</span>

                {item.badge !== null && (
                  <span
                    className={`text-[10px] font-black font-mono px-1.5 py-0.2 rounded-full leading-tight shadow-sm ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Tools: Quick X-Report, Role Switcher, Drawer Net, Audio, Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Action: "طباعة مبيعات اليوم" (Shift X-Report) */}
          <button
            onClick={printXReport}
            title="طباعة تقرير مبيعات اليوم الفوري (X-Report دون تصفير الصندوق)"
            className="bg-gold-500 hover:bg-gold-400 active:scale-95 text-stone-950 font-black text-xs px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-gold-400"
          >
            <Printer className="w-3.5 h-3.5 text-stone-950" />
            <span className="hidden sm:inline">طباعة مبيعات اليوم</span>
            <span className="sm:hidden inline">مبيعات اليوم</span>
          </button>

          {/* User Role / Cashier Switcher */}
          <button
            onClick={() => setIsRoleModalOpen(true)}
            title="تبديل حساب الكاشير أو الترقية لوضع المدير"
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isManager
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80 shadow-xs'
                : 'bg-brand-950/80 border-gold-500/40 text-gold-300 hover:bg-brand-950 shadow-xs'
            }`}
          >
            {isManager ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden md:inline">المدير العام</span>
                <span className="md:hidden inline">المدير</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>{activeCashier || 'كاشير'}</span>
              </>
            )}
          </button>

          {/* Quick Drawer Net Indicator */}
          <div
            onClick={() => setActiveTab('treasury')}
            title="انقر لعرض تفاصيل الخزينة اليومية"
            className="cursor-pointer bg-brand-950/80 hover:bg-brand-950 border border-gold-500/40 rounded-xl px-2.5 py-1.5 hidden lg:flex items-center gap-2 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-right">
              <div className="text-[9px] text-gold-300 font-medium">صافي الصندوق:</div>
              <div className="text-xs font-mono font-bold text-warm-50">
                {dailyTreasury.netCash.toLocaleString()} {storeSettings.currency}
              </div>
            </div>
          </div>

          {/* Clock */}
          <div className="text-right hidden xl:block text-[11px] font-mono text-warm-200 border-r border-brand-700 pr-2 mr-1">
            <div className="flex items-center gap-1 text-gold-300 font-semibold">
              <Clock className="w-3 h-3" />
              <span>
                {currentTime.toLocaleTimeString('ar-IQ', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>
            <div className="text-[10px] text-warm-300">
              {currentTime.toLocaleDateString('ar-IQ', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </div>
          </div>

          {/* Audio Toggle */}
          <button
            onClick={toggleSound}
            title={storeSettings.allowSound ? 'كتم التنبيهات الصوتية' : 'تفعيل التنبيهات الصوتية'}
            className="w-8 h-8 rounded-lg bg-brand-700/60 hover:bg-brand-700 flex items-center justify-center text-warm-200 hover:text-white transition-colors cursor-pointer"
          >
            {storeSettings.allowSound ? (
              <Volume2 className="w-4 h-4 text-gold-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" />
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title="ملء الشاشة"
            className="w-8 h-8 rounded-lg bg-brand-700/60 hover:bg-brand-700 hidden sm:flex items-center justify-center text-warm-200 hover:text-white transition-colors cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="إعدادات النظام والنسخ الاحتياطي"
            className="w-8 h-8 rounded-lg bg-brand-700/60 hover:bg-brand-700 flex items-center justify-center text-warm-200 hover:text-white transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role Switching Modal */}
      <RoleSwitchModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
    </header>
  );
}
