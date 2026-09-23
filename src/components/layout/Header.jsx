import React, { useState } from 'react';
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
  ShieldCheck,
  UserCheck,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { RoleSwitchModal } from './RoleSwitchModal';

export function Header({ activeTab, setActiveTab, onOpenSettings, onOpenWelcome }) {
  const {
    storeSettings,
    setStoreSettings,
    dailyTreasury,
    reservations,
    cartSummary,
    activeCashier,
    isManager,
    activeShiftType,
  } = usePOS();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Sync fullscreen state with both Electron desktop app and web browser
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.onFullscreenChange === 'function') {
      const unsub = window.electronAPI.onFullscreenChange((isFs) => setIsFullscreen(isFs));
      return () => {
        if (typeof unsub === 'function') unsub();
      };
    } else {
      const handleFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
      document.addEventListener('fullscreenchange', handleFsChange);
      return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }
  }, []);

  const toggleFullscreen = () => {
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.toggleFullscreen === 'function') {
      window.electronAPI.toggleFullscreen();
      return;
    }
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

  // Core operational navigation tabs (Role-filtered: reports only for managers)
  const coreNavItems = [
    {
      id: 'pos',
      label: 'نقطة البيع',
      shortLabel: 'البيع',
      icon: ShoppingBag,
      badge: cartSummary.itemCount > 0 ? cartSummary.itemCount : null,
      badgeColor: 'bg-gold-500 text-brand-950',
    },
    {
      id: 'reservations',
      label: 'الحجوزات',
      shortLabel: 'الحجوزات',
      icon: CalendarDays,
      badge: pendingReservationsCount > 0 ? pendingReservationsCount : null,
      badgeColor: 'bg-rose-600 text-white',
    },
    {
      id: 'expenses',
      label: 'الصرفيات',
      shortLabel: 'الصرفيات',
      icon: Receipt,
      badge: null,
    },
    ...(isManager
      ? [
          {
            id: 'reports',
            label: 'حركة الأصناف',
            shortLabel: 'الأصناف',
            icon: BarChart3,
            badge: null,
          },
        ]
      : []),
  ];

  return (
    <header className="bg-brand-800 text-white border-b-2 border-brand-900 shadow-md sticky top-0 z-30 select-none">
      <div className="w-full px-2 sm:px-3 py-1 sm:py-1.5 flex items-center justify-between gap-1 sm:gap-2 overflow-x-hidden">
        {/* Right Side: Boutique Brand Identity */}
        <div
          onClick={onOpenWelcome}
          className="flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer group"
          title="العودة لشاشة الترحيب"
        >
          <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-xl bg-brand-950 border border-gold-500/50 flex items-center justify-center shadow-inner shrink-0 overflow-hidden group-hover:border-gold-300 transition-all p-0.5">
            <img
              src="./logo.png"
              alt="مسك وزعفران"
              className="w-full h-full object-contain transform group-hover:scale-110 transition-transform"
            />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h1 className="font-black text-xs sm:text-sm lg:text-base tracking-tight leading-none text-warm-50 whitespace-nowrap group-hover:text-gold-200 transition-colors">
                {storeSettings.storeNameAr}
              </h1>
              <span className="text-[9px] px-1 py-0.2 rounded bg-brand-950 text-gold-400 font-bold border border-gold-500/30 hidden md:inline-block">
                POS
              </span>
            </div>
            <p className="text-[9.5px] text-warm-200 font-sans tracking-wide leading-tight hidden xl:block">
              {storeSettings.storeNameEn} • حلويات ملكية
            </p>
          </div>
        </div>

        {/* Center: Primary Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {coreNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-2 sm:px-2.5 py-1.2 sm:py-1.5 rounded-xl text-xs sm:text-[13px] font-bold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-warm-50 text-brand-900 shadow-md font-black translate-y-[-1px]'
                    : 'text-warm-100 hover:bg-brand-700/70 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-800' : 'text-gold-400'} shrink-0`} />
                <span className="whitespace-nowrap">{item.label}</span>

                {item.badge !== null && (
                  <span
                    className={`text-[10px] font-black font-mono px-1.5 py-0.2 rounded-full leading-tight shadow-sm shrink-0 ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Left Side: Cashier Profile Badge, Treasury Action Button, and Utilities */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Cashier / Manager Profile Badge (Click to switch cashier or shift) */}
          <button
            onClick={() => setIsRoleModalOpen(true)}
            title="إدارة وردية العمل (الشفت) وتبديل الكاشير أو وضع المدير"
            className={`px-2 py-1.2 sm:py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              isManager
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80 shadow-xs'
                : 'bg-brand-950/80 border-gold-500/40 text-gold-300 hover:bg-brand-950 shadow-xs'
            }`}
          >
            {isManager ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap">المدير العام</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span className="max-w-[70px] truncate whitespace-nowrap">{activeCashier || 'كاشير'}</span>
              </>
            )}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-black flex items-center gap-0.5 shrink-0 ${
                activeShiftType === 'صباحي'
                  ? 'bg-amber-400/25 text-amber-300 border border-amber-400/40'
                  : 'bg-indigo-400/25 text-indigo-300 border border-indigo-400/40'
              }`}
            >
              <span>{activeShiftType === 'صباحي' ? '☀️' : '🌙'}</span>
              <span className="whitespace-nowrap">{activeShiftType}</span>
            </span>
          </button>

          {/* Compact Fast Switch / Handover Button */}
          <button
            onClick={onOpenWelcome}
            title="تبديل الشفت / تسجيل خروج وتسليم المنظومة لكاشير آخر"
            className="px-2 py-1.2 sm:py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/30 text-amber-200 hover:text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs shrink-0 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden xl:inline whitespace-nowrap">تبديل الشفت / خروج</span>
            <span className="xl:hidden whitespace-nowrap">تبديل</span>
          </button>

          {/* Action Button: [الصندوق] */}
          <button
            onClick={() => setActiveTab('treasury')}
            title="فتح وحدة الخزينة وتصفير الصندوق ومطابقة الحسابات"
            className={`px-2 sm:px-2.5 py-1.2 sm:py-1.5 rounded-xl text-xs sm:text-[13px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border shrink-0 whitespace-nowrap ${
              activeTab === 'treasury'
                ? 'bg-warm-50 text-brand-900 border-white shadow-md font-black translate-y-[-1px]'
                : 'bg-brand-950/80 hover:bg-brand-950 text-warm-100 border-gold-500/40 hover:text-white shadow-xs'
            }`}
          >
            <Wallet className={`w-3.5 h-3.5 ${activeTab === 'treasury' ? 'text-brand-800' : 'text-gold-400'} shrink-0`} />
            <span className="whitespace-nowrap">الصندوق</span>
          </button>

          {/* Utility Controls */}
          <div className="flex items-center gap-0.5 sm:gap-1 border-r border-brand-700/60 pr-1 mr-0.5 shrink-0">
            <button
              onClick={toggleSound}
              title={storeSettings.allowSound ? 'كتم التنبيهات الصوتية' : 'تفعيل التنبيهات الصوتية'}
              className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg bg-brand-700/60 hover:bg-brand-700 flex items-center justify-center text-warm-200 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              {storeSettings.allowSound ? (
                <Volume2 className="w-3.5 h-3.5 text-gold-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-warm-400" />
              )}
            </button>

            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'تصغير الشاشة (F11)' : 'ملء الشاشة بالكامل (F11)'}
              className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg bg-brand-700/60 hover:bg-brand-700 flex items-center justify-center text-warm-200 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              {isFullscreen ? (
                <Minimize className="w-3.5 h-3.5 text-gold-400" />
              ) : (
                <Maximize className="w-3.5 h-3.5 text-gold-400" />
              )}
            </button>

            {isManager && (
              <button
                onClick={onOpenSettings}
                title="إعدادات النظام والنسخ الاحتياطي (المدير فقط)"
                className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg bg-brand-700/60 hover:bg-brand-700 flex items-center justify-center text-warm-200 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Role & Shift Switching Modal */}
      <RoleSwitchModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
    </header>
  );
}
