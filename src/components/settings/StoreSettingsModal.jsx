import React, { useState, useRef } from 'react';
import {
  X,
  Check,
  Store,
  Phone,
  MapPin,
  Coins,
  FileDown,
  FileUp,
  RotateCcw,
  Volume2,
  Printer,
  ShieldAlert,
  KeyRound,
  Lock,
  Palette,
  ZoomIn,
  Sliders,
  FolderPlus,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { MenuCustomizationModal } from './MenuCustomizationModal';
import { ManagePresetExpensesModal } from '../expenses/ManagePresetExpensesModal';
import { ManageExpenseCategoriesModal } from '../expenses/ManageExpenseCategoriesModal';

export function StoreSettingsModal({ isOpen, onClose }) {
  const {
    storeSettings,
    setStoreSettings,
    updateManagerPin,
    updateResetPin,
    isManager,
    exportSystemData,
    importSystemData,
    resetToFactoryDefaults,
    categoriesScale,
    setCategoriesScale,
    productsScale,
    setProductsScale,
  } = usePOS();

  const [formData, setFormData] = useState({ ...storeSettings });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isMenuCustomizationOpen, setIsMenuCustomizationOpen] = useState(false);
  const [isPresetExpensesOpen, setIsPresetExpensesOpen] = useState(false);
  const [isExpenseCategoriesOpen, setIsExpenseCategoriesOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Manager PIN Change State
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeStatus, setPinChangeStatus] = useState({ msg: '', isError: false });

  // Dedicated Reset PIN Change State
  const [resetManagerPinAuth, setResetManagerPinAuth] = useState('');
  const [newResetPinInput, setNewResetPinInput] = useState('');
  const [resetPinStatus, setResetPinStatus] = useState({ msg: '', isError: false });
  const [showCurrentResetPin, setShowCurrentResetPin] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStoreSettings(formData);
    onClose();
  };

  const handleUpdatePin = (e) => {
    e.preventDefault();
    const result = updateManagerPin(currentPinInput, newPinInput);
    if (result.success) {
      setPinChangeStatus({ msg: result.message, isError: false });
      setCurrentPinInput('');
      setNewPinInput('');
    } else {
      setPinChangeStatus({ msg: result.message, isError: true });
    }
  };

  const handleUpdateResetPin = (e) => {
    e.preventDefault();
    const result = updateResetPin(resetManagerPinAuth, newResetPinInput);
    if (result.success) {
      setResetPinStatus({ msg: result.message, isError: false });
      setResetManagerPinAuth('');
      setNewResetPinInput('');
    } else {
      setResetPinStatus({ msg: result.message, isError: true });
    }
  };

  const isDesktop = typeof window !== 'undefined' && Boolean(window.electronAPI?.isDesktop);

  const handleExport = async () => {
    const res = await exportSystemData();
    if (res?.filePath) {
      alert(`تم تصدير النسخة الاحتياطية بنجاح إلى:\n${res.filePath}`);
    } else if (res?.success) {
      alert('تم تنزيل النسخة الاحتياطية بنجاح!');
    }
  };

  const handleImportClick = async () => {
    if (isDesktop && window.electronAPI && typeof window.electronAPI.importBackup === 'function') {
      const res = await window.electronAPI.importBackup();
      if (res && res.success && res.data) {
        const ok = await importSystemData(res.data);
        if (ok) {
          alert('تم استيراد واسترجاع كافة البيانات بنجاح في المنظومة المكتبية!');
          onClose();
        }
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result);
        const success = await importSystemData(json);
        if (success) {
          alert('تم استيراد واسترجاع البيانات بنجاح!');
          onClose();
        } else {
          alert('فشل استيراد الملف. تأكد من صحة الملف.');
        }
      } catch (err) {
        alert('الملف المحدد غير صالح كنسخة احتياطية JSON.');
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be re-selected if needed
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-[#FAF8F5] border border-brand-900/20 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-brand-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-gold-400" />
            <h3 className="font-bold text-base">إعدادات المحل وإدارة النظام</h3>
          </div>
          <button
            onClick={onClose}
            className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-brand-900/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Store Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-brand-900 border-b border-warm-200 pb-1">
              معلومات الهوية والفواتير الحرارية
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  اسم المتجر (بالعربية):
                </label>
                <input
                  type="text"
                  name="storeNameAr"
                  value={formData.storeNameAr}
                  onChange={handleChange}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  الاسم التجاري (بالإنجليزية):
                </label>
                <input
                  type="text"
                  name="storeNameEn"
                  value={formData.storeNameEn}
                  onChange={handleChange}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                الوصف / الشعار أسفل العنوان:
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  رقم الهاتف الرئيسي:
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  رقم الهاتف الثانوي (اختياري):
                </label>
                <input
                  type="text"
                  name="phone2"
                  value={formData.phone2 || ''}
                  onChange={handleChange}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  العنوان المطبوع بالوصل:
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  رمز العملة:
                </label>
                <input
                  type="text"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  placeholder="د.ع"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800 text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                اسم الكاشير الافتراضي:
              </label>
              <input
                type="text"
                name="cashierName"
                value={formData.cashierName}
                onChange={handleChange}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                عبارة تذييل الوصل الحراري:
              </label>
              <input
                type="text"
                name="receiptFooterNote"
                value={formData.receiptFooterNote}
                onChange={handleChange}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>

            {/* Separate Independent Scale Preferences: Categories & Products */}
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* 1. Categories Scale */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-brand-800" />
                  <span>حجم الأقسام (Categories Scale):</span>
                </label>
                <select
                  value={categoriesScale}
                  onChange={(e) => setCategoriesScale(Number(e.target.value))}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800 cursor-pointer"
                >
                  <option value={50}>50% (أصغر جداً - استيعاب أكبر عدد من الأقسام)</option>
                  <option value={75}>75% (صغير - مدمج ومريح)</option>
                  <option value={100}>100% (الافتراضي القياسي)</option>
                  <option value={125}>125% (كبير - أزرار واسعة للمس)</option>
                  <option value={150}>150% (أكبر جداً - شاشات اللمس الكبيرة)</option>
                </select>
              </div>

              {/* 2. Products Scale */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-brand-800" />
                  <span>حجم المنتجات (Products Scale):</span>
                </label>
                <select
                  value={productsScale}
                  onChange={(e) => setProductsScale(Number(e.target.value))}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800 cursor-pointer"
                >
                  <option value={50}>50% (أصغر جداً - زيادة عدد الأعمدة بالسطر)</option>
                  <option value={75}>75% (صغير - زيادة المنتجات المعروضة)</option>
                  <option value={100}>100% (الافتراضي القياسي)</option>
                  <option value={125}>125% (كبير - أزرار واسعة للمس)</option>
                  <option value={150}>150% (أكبر جداً - شاشات اللمس الكبيرة)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Menu Customization Banner (Manager Only) */}
          {isManager && (
            <div className="bg-gradient-to-r from-brand-900 to-[#5c0017] text-white p-3.5 rounded-2xl border border-brand-950 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-gold-300 shrink-0">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-warm-50">
                    تنسيق وترتيب القائمة والألوان
                  </h4>
                  <p className="text-[11px] text-warm-200">
                    تحكم في تسلسل ظهور الأقسام والمنتجات وتخصيص ألوان البطاقات
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMenuCustomizationOpen(true)}
                className="px-3.5 py-2 bg-gold-500 hover:bg-gold-600 text-brand-950 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              >
                تنسيق القائمة 🎨
              </button>
            </div>
          )}

          {/* Preset Expenses Banner (Manager Only) */}
          {isManager && (
            <div className="bg-stone-900 text-white p-3.5 rounded-2xl border border-stone-800 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-gold-400 shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-warm-50">
                    إدارة وتخصيص الصرفيات المعتادة
                  </h4>
                  <p className="text-[11px] text-warm-200">
                    إضافة وتعديل بنود المصاريف المتكررة والمبالغ الافتراضية للكاشير
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPresetExpensesOpen(true)}
                className="px-3.5 py-2 bg-warm-100 hover:bg-white text-stone-900 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              >
                إدارة الصرفيات ⚙️
              </button>
            </div>
          )}

          {/* Expense Categories Banner (Manager Only) */}
          {isManager && (
            <div className="bg-gradient-to-r from-stone-800 to-stone-900 text-white p-3.5 rounded-2xl border border-stone-700 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-gold-400 shrink-0">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-warm-50">
                    إدارة تصنيفات الصرفيات
                  </h4>
                  <p className="text-[11px] text-warm-200">
                    إضافة وتعديل وحذف تصنيفات المصاريف اليومية في المنظومة
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExpenseCategoriesOpen(true)}
                className="px-3.5 py-2 bg-warm-100 hover:bg-white text-stone-900 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              >
                إدارة التصنيفات 📁
              </button>
            </div>
          )}

          {/* Security PINs Management (Manager Restricted) */}
          <div className="space-y-3 pt-3 border-t border-stone-200">
            <h4 className="text-xs font-black text-brand-900 border-b border-warm-200 pb-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-brand-800" />
                <span>إدارة الرموز الأمنية للنظام (Security PINs)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-900 border border-brand-200">
                صلاحية المدير العام
              </span>
            </h4>

            {isManager ? (
              <div className="space-y-3">
                {/* 1. Manager Profile Login PIN */}
                <div className="bg-warm-100/60 p-3 rounded-xl border border-warm-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">
                      1. رمز مرور حساب المدير (Manager Profile PIN)
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">الافتراضي: 1234</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    يُستخدم لتسجيل الدخول كمدير، وكشف أرقام الوردية العمياء، وتعديل الصرفيات وحذف الحجوزات:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                        رمز المدير الحالي:
                      </label>
                      <input
                        type="password"
                        value={currentPinInput}
                        onChange={(e) => setCurrentPinInput(e.target.value)}
                        placeholder="الرمز الحالي..."
                        className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                        الرمز الجديد:
                      </label>
                      <input
                        type="password"
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        placeholder="الرمز الجديد..."
                        className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-800"
                      />
                    </div>
                  </div>

                  {pinChangeStatus.msg && (
                    <div
                      className={`text-[11px] font-bold py-1 px-2 rounded-lg ${
                        pinChangeStatus.isError
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {pinChangeStatus.msg}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleUpdatePin}
                    className="bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                  >
                    تحديث رمز مرور المدير
                  </button>
                </div>

                {/* 2. Dedicated Shift Reset PIN */}
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-300/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-800" />
                      2. رمز تصفير اليومية المستقل (Shift Reset PIN)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCurrentResetPin((prev) => !prev)}
                      className="text-[10px] text-amber-800 hover:text-amber-950 underline font-bold cursor-pointer"
                    >
                      {showCurrentResetPin
                        ? `الرمز الحالي: ${storeSettings.resetPin || '9999'}`
                        : 'إظهار الرمز الحالي'}
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    رمز أمني مخصص ومستقل تماماً يُطلب فقط عند النقر على <strong>"إغلاق اليومية وتصفير الصندوق"</strong> لإصدار تقرير Z وتصفير عدادات النقدية.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                        رمز تأكيد المدير (للإذن):
                      </label>
                      <input
                        type="password"
                        value={resetManagerPinAuth}
                        onChange={(e) => setResetManagerPinAuth(e.target.value)}
                        placeholder="أدخل رمز المدير الحالي..."
                        className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                        رمز تصفير اليومية الجديد:
                      </label>
                      <input
                        type="password"
                        value={newResetPinInput}
                        onChange={(e) => setNewResetPinInput(e.target.value)}
                        placeholder="رمز التصفير الجديد (4 أرقام)..."
                        className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-700"
                      />
                    </div>
                  </div>

                  {resetPinStatus.msg && (
                    <div
                      className={`text-[11px] font-bold py-1 px-2 rounded-lg ${
                        resetPinStatus.isError
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {resetPinStatus.msg}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleUpdateResetPin}
                    className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                  >
                    تحديث رمز تصفير اليومية
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-stone-100 border border-stone-300 rounded-xl text-stone-600 text-xs text-center flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-stone-500 shrink-0" />
                <span>إدارة وتعديل الرموز الأمنية (رمز المدير ورمز تصفير اليومية) محصورة بحساب المدير فقط.</span>
              </div>
            )}
          </div>

          {/* Backup & Data Management */}
          <div className="space-y-3 pt-3 border-t border-stone-200">
            <div className="flex items-center justify-between border-b border-warm-200 pb-1.5 gap-2">
              <h4 className="text-xs font-black text-brand-900 flex items-center gap-1.5">
                <FileDown className="w-4 h-4 text-emerald-700" />
                <span>النسخ الاحتياطي وحماية البيانات (حماية تامة من انقطاع الكهرباء)</span>
              </h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                isDesktop 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                {isDesktop ? '🖥️ تطبيق مكتبي (Win 7 & 11) - حفظ قرص صلب فوري' : '🌐 نسخة المتصفح - حفظ محلي فوري'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExport}
                className="py-2.5 px-3 bg-white hover:bg-emerald-50 border border-emerald-300 text-stone-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                title="تصدير نسخة احتياطية لكافة المبيعات والشفتات والمنتجات"
              >
                <FileDown className="w-4 h-4 text-emerald-600" />
                <span>تصدير نسخة احتياطية (JSON)</span>
              </button>

              <button
                type="button"
                onClick={handleImportClick}
                className="py-2.5 px-3 bg-white hover:bg-warm-100 border border-warm-300 text-stone-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                title="استرجاع نسخة احتياطية سابقة"
              >
                <FileUp className="w-4 h-4 text-brand-800" />
                <span>استيراد واسترجاع نسخة (JSON)</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
            </div>

            {/* Reset to Factory Defaults */}
            <div className="pt-2">
              {showResetConfirm ? (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>تحذير: ستتم استعادة البيانات الافتراضية التجريبية لمحل مسك وزعفران.</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetToFactoryDefaults();
                        setShowResetConfirm(false);
                        onClose();
                      }}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      نعم، استعد البيانات الافتراضية
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-4 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold py-1.5 rounded-lg cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة تعيين النظام للبيانات التجريبية الافتراضية (Factory Sample Data)</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-3 border-t border-stone-200">
            <button
              type="submit"
              className="flex-1 bg-brand-800 hover:bg-brand-900 text-white font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 text-gold-400" />
              <span>حفظ الإعدادات</span>
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

      {/* Menu Customization Modal */}
      <MenuCustomizationModal
        isOpen={isMenuCustomizationOpen}
        onClose={() => setIsMenuCustomizationOpen(false)}
      />

      {/* Preset Expenses Modal */}
      <ManagePresetExpensesModal
        isOpen={isPresetExpensesOpen}
        onClose={() => setIsPresetExpensesOpen(false)}
      />

      {/* Expense Categories Modal */}
      <ManageExpenseCategoriesModal
        isOpen={isExpenseCategoriesOpen}
        onClose={() => setIsExpenseCategoriesOpen(false)}
      />
    </div>
  );
}
