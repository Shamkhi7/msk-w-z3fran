import React, { useState, useRef } from 'react';
import {
  Store,
  Sliders,
  Type,
  Printer,
  ShieldCheck,
  KeyRound,
  FileDown,
  FileUp,
  RotateCcw,
  Clock,
  Sun,
  Moon,
  Palette,
  FolderPlus,
  Users,
  ZoomIn,
  Check,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Save,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { LiveReceiptSimulator } from './LiveReceiptSimulator';
import { ReceiptInspectorPanel } from './ReceiptInspectorPanel';
import { ReceiptConfigTabs } from './ReceiptConfigTabs';
import { MenuCustomizationModal } from './MenuCustomizationModal';
import { ManagePresetExpensesModal } from '../expenses/ManagePresetExpensesModal';
import { ManageExpenseCategoriesModal } from '../expenses/ManageExpenseCategoriesModal';
import { ManageReservationStaffModal } from '../reservations/ManageReservationStaffModal';
import {
  DEFAULT_STORE_SETTINGS,
  DEFAULT_RECEIPT_LAYOUT,
  DEFAULT_SALES_RECEIPT_CONFIG,
  DEFAULT_RESERVATION_RECEIPT_CONFIG,
  DEFAULT_KITCHEN_TICKET_CONFIG,
} from '../../data/defaultData';

export function SettingsModule() {
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
    showToast,
  } = usePOS();

  // Working state for settings form
  const [formData, setFormData] = useState({ ...storeSettings });
  const [activeTab, setActiveTab] = useState('typography'); // 'typography' | 'identity' | 'shifts' | 'menu_staff' | 'security' | 'backup'
  const [activeReceiptTab, setActiveReceiptTab] = useState('sales'); // 'sales' | 'reservation' | 'kitchen'
  const [selectedInspectedElement, setSelectedInspectedElement] = useState('header'); // 'header' | 'customer' | 'itemsTable' | 'notesBlock' | 'totalsBox' | 'dividers' | 'footer'

  // Modals state
  const [isMenuCustomizationOpen, setIsMenuCustomizationOpen] = useState(false);
  const [isPresetExpensesOpen, setIsPresetExpensesOpen] = useState(false);
  const [isExpenseCategoriesOpen, setIsExpenseCategoriesOpen] = useState(false);
  const [isReservationStaffOpen, setIsReservationStaffOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
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

  const isDesktop = typeof window !== 'undefined' && Boolean(window.electronAPI?.isDesktop);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSliderChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleToggleChange = (name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Real-time WYSIWYG Layout Change Handler
  const handleChangeLayout = (section, key, value) => {
    setFormData((prev) => {
      const prevLayout = prev.receiptLayout || DEFAULT_RECEIPT_LAYOUT;
      const updatedSection = {
        ...(prevLayout[section] || DEFAULT_RECEIPT_LAYOUT[section]),
        [key]: value,
      };
      const updatedLayout = {
        ...prevLayout,
        [section]: updatedSection,
      };

      const nextState = {
        ...prev,
        receiptLayout: updatedLayout,
      };

      // Synchronize top-level fields for backwards compatibility and identity
      if (section === 'header') {
        if (key === 'storeNameAr') nextState.storeNameAr = value;
        if (key === 'storeNameEn') nextState.storeNameEn = value;
        if (key === 'tagline') nextState.tagline = value;
        if (key === 'phone') nextState.phone = value;
        if (key === 'phone2') nextState.phone2 = value;
        if (key === 'address') nextState.address = value;
        if (key === 'fontSize') nextState.receiptHeaderSize = value;
        if (key === 'bold') nextState.receiptHeaderBold = value;
      } else if (section === 'itemsTable') {
        if (key === 'itemNameSize') nextState.receiptProductNameSize = value;
        if (key === 'itemNameBold') nextState.receiptProductNameBold = value;
        if (key === 'itemPriceSize') nextState.receiptPriceSize = value;
        if (key === 'itemPriceBold') nextState.receiptPriceBold = value;
        if (key === 'rowPadding') nextState.receiptLineSpacing = value;
      } else if (section === 'notesBlock') {
        if (key === 'fontSize') nextState.receiptNotesSize = value;
        if (key === 'bold') nextState.receiptNotesBold = value;
      } else if (section === 'totalsBox') {
        if (key === 'fontSize') nextState.receiptPriceSize = value;
        if (key === 'bold') nextState.receiptPriceBold = value;
      } else if (section === 'footer') {
        if (key === 'noteText') nextState.receiptFooterNote = value;
      }

      return nextState;
    });
  };

  const handleResetLayoutSection = (section) => {
    if (!DEFAULT_RECEIPT_LAYOUT[section]) return;
    setFormData((prev) => {
      const prevLayout = prev.receiptLayout || DEFAULT_RECEIPT_LAYOUT;
      return {
        ...prev,
        receiptLayout: {
          ...prevLayout,
          [section]: { ...DEFAULT_RECEIPT_LAYOUT[section] },
        },
      };
    });
    showToast(`تمت استعادة الإعدادات الافتراضية لقسم (${section})`, 'info');
  };

  const handleSelectSimulatorElement = (elementId) => {
    setSelectedInspectedElement(elementId);
    if (activeTab !== 'typography') {
      setActiveTab('typography');
    }
  };

  // Dedicated Handlers for the 3 Isolated Receipt Configurations
  const handleUpdateSalesConfig = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      salesReceiptConfig: {
        ...(prev.salesReceiptConfig || DEFAULT_SALES_RECEIPT_CONFIG),
        [key]: value,
      },
    }));
  };

  const handleUpdateReservationConfig = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      reservationReceiptConfig: {
        ...(prev.reservationReceiptConfig || DEFAULT_RESERVATION_RECEIPT_CONFIG),
        [key]: value,
      },
    }));
  };

  const handleUpdateKitchenConfig = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      kitchenTicketConfig: {
        ...(prev.kitchenTicketConfig || DEFAULT_KITCHEN_TICKET_CONFIG),
        [key]: value,
      },
    }));
  };

  const handleResetReceiptConfig = (tab) => {
    if (tab === 'sales') {
      setFormData((prev) => ({
        ...prev,
        salesReceiptConfig: { ...DEFAULT_SALES_RECEIPT_CONFIG },
      }));
      showToast('تمت استعادة الإعدادات الافتراضية لوصل المبيعات بنجاح', 'info');
    } else if (tab === 'reservation') {
      setFormData((prev) => ({
        ...prev,
        reservationReceiptConfig: { ...DEFAULT_RESERVATION_RECEIPT_CONFIG },
      }));
      showToast('تمت استعادة الإعدادات الافتراضية لوصل حجز الزبون بنجاح', 'info');
    } else if (tab === 'kitchen') {
      setFormData((prev) => ({
        ...prev,
        kitchenTicketConfig: { ...DEFAULT_KITCHEN_TICKET_CONFIG },
      }));
      showToast('تمت استعادة الإعدادات الافتراضية لبون المعمل بنجاح', 'info');
    }
  };

  const handleSaveAll = (e) => {
    if (e) e.preventDefault();
    setStoreSettings(formData);
    showToast('تم حفظ كافة إعدادات المنظومة وتحديث خطوط وتنسيق الوصولات بنجاح', 'success');
  };

  const handleResetTypographyDefaults = () => {
    setFormData((prev) => ({
      ...prev,
      receiptHeaderSize: DEFAULT_STORE_SETTINGS.receiptHeaderSize || 20,
      receiptHeaderBold: DEFAULT_STORE_SETTINGS.receiptHeaderBold !== false,
      receiptProductNameSize: DEFAULT_STORE_SETTINGS.receiptProductNameSize || 15,
      receiptProductNameBold: DEFAULT_STORE_SETTINGS.receiptProductNameBold !== false,
      receiptNotesSize: DEFAULT_STORE_SETTINGS.receiptNotesSize || 12,
      receiptNotesBold: DEFAULT_STORE_SETTINGS.receiptNotesBold !== false,
      receiptPriceSize: DEFAULT_STORE_SETTINGS.receiptPriceSize || 14,
      receiptPriceBold: DEFAULT_STORE_SETTINGS.receiptPriceBold !== false,
      receiptGlobalWeight: DEFAULT_STORE_SETTINGS.receiptGlobalWeight || '700',
      receiptLineSpacing: DEFAULT_STORE_SETTINGS.receiptLineSpacing || 'normal',
      receiptFooterNote: DEFAULT_STORE_SETTINGS.receiptFooterNote,
      receiptLayout: { ...DEFAULT_RECEIPT_LAYOUT },
      salesReceiptConfig: { ...DEFAULT_SALES_RECEIPT_CONFIG },
      reservationReceiptConfig: { ...DEFAULT_RESERVATION_RECEIPT_CONFIG },
      kitchenTicketConfig: { ...DEFAULT_KITCHEN_TICKET_CONFIG },
    }));
    showToast('تمت استعادة كافة التنسيقات والخطوط الافتراضية للوصولات بنجاح', 'info');
  };

  const handleUpdatePin = (e) => {
    e.preventDefault();
    const result = updateManagerPin(currentPinInput, newPinInput);
    if (result.success) {
      setPinChangeStatus({ msg: result.message, isError: false });
      setCurrentPinInput('');
      setNewPinInput('');
      showToast(result.message, 'success');
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
      showToast(result.message, 'success');
    } else {
      setResetPinStatus({ msg: result.message, isError: true });
    }
  };

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
        } else {
          alert('فشل استيراد الملف. تأكد من صحة الملف.');
        }
      } catch (err) {
        alert('الملف المحدد غير صالح كنسخة احتياطية JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="h-full flex flex-col bg-[#FAF8F5] select-none overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-warm-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-900 text-gold-400 flex items-center justify-center shadow-xs">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-brand-900 tracking-tight">
                إعدادات المنظومة وتخصيص الطباعة
              </h2>
              <span className="bg-gold-500/20 text-brand-950 border border-gold-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                صلاحية المدير العام 🛡️
              </span>
            </div>
            <p className="text-xs text-stone-500">
              تحكم كامل بهوية المحل، والخطوط الحرارية 80mm، والورديات، والأمان، والنسخ الاحتياطي
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetTypographyDefaults}
            title="استعادة الإعدادات الافتراضية للخطوط"
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">افتراضي الخطوط</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-2 bg-brand-800 hover:bg-brand-900 text-white font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4 text-gold-400" />
            <span>حفظ التغييرات 💾</span>
          </button>
        </div>
      </div>

      {/* Internal Navigation Subtabs */}
      <div className="px-4 bg-white border-b border-warm-200 flex items-center gap-2 overflow-x-auto shrink-0">
        {[
          { id: 'typography', label: 'خطوط وطباعة الوصولات 🖨️', icon: Type },
          { id: 'identity', label: 'معلومات المتجر والهوية 🏪', icon: Store },
          { id: 'shifts', label: 'الورديات ومواقيت الشفت ⏰', icon: Clock },
          { id: 'menu_staff', label: 'القائمة والموظفون 🎨', icon: Palette },
          { id: 'security', label: 'الرموز الأمنية والحماية 🔐', icon: KeyRound },
          { id: 'backup', label: 'النسخ الاحتياطي والبيانات 💾', icon: FileDown },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-3 rounded-t-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border-b-2 flex items-center gap-1.5 ${
                isActive
                  ? 'border-brand-800 text-brand-900 bg-warm-50 font-extrabold'
                  : 'border-transparent text-stone-600 hover:text-brand-800'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-3 sm:p-4 gap-4">
        {/* RIGHT SIDE (65% width): Settings Controls */}
        <div className="w-full lg:w-[65%] h-full overflow-y-auto space-y-4 pr-1 text-right text-xs">
          {/* TAB 1: Interactive WYSIWYG Receipt Designer & Typography Controls */}
          {activeTab === 'typography' && (
            <div className="space-y-4">
              {/* Dedicated Isolated Receipt Configuration Tabs (Sales, Reservation, Kitchen) */}
              <ReceiptConfigTabs
                activeReceiptTab={activeReceiptTab}
                onTabChange={setActiveReceiptTab}
                storeSettings={formData}
                onUpdateLogo={(logoData) => setFormData((prev) => ({ ...prev, logo: logoData }))}
                onUpdateSalesConfig={handleUpdateSalesConfig}
                onUpdateReservationConfig={handleUpdateReservationConfig}
                onUpdateKitchenConfig={handleUpdateKitchenConfig}
                onResetConfig={handleResetReceiptConfig}
              />

              {/* Contextual WYSIWYG Inspector Panel */}
              <ReceiptInspectorPanel
                selectedElement={selectedInspectedElement}
                onSelectElement={setSelectedInspectedElement}
                layout={formData.receiptLayout}
                storeSettings={formData}
                onChangeLayout={handleChangeLayout}
                onResetSection={handleResetLayoutSection}
              />

              {/* Global Thermal Printhead & Paper Economy Card */}
              <div className="bg-white border border-warm-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-warm-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center">
                      <Printer className="w-4 h-4 text-brand-800" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-brand-900">
                        إعدادات الرأس الحراري واستهلاك الورق العامة
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        التحكم بسواد الحبر الحراري العام وتوفير طول رول الورق 80mm
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetTypographyDefaults}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>استعادة الافتراضي للوصل كاملاً</span>
                  </button>
                </div>

                {/* 1. Global Font Weight / Thermal Burning Intensity */}
                <div className="space-y-2">
                  <label className="block font-bold text-stone-800 text-xs">
                    1. سُمك وسواد الخط العام (حرارة الحبر الحراري):
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: '500', label: 'عادي (Normal 500)', desc: 'استهلاك خفيف للرأس الحراري' },
                      { id: '700', label: 'عريض (Bold 700)', desc: 'ناصع وواضح (الموصى به)' },
                      { id: '900', label: 'عريض جداً (Black 900)', desc: 'سواد فائق وأقصى وضوح' },
                    ].map((w) => {
                      const isSelected = (formData.receiptGlobalWeight || '700') === w.id;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, receiptGlobalWeight: w.id }))}
                          className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                            isSelected
                              ? 'border-brand-800 bg-brand-50 text-brand-950 font-black shadow-2xs ring-1 ring-brand-800'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <div className="font-bold text-xs">{w.label}</div>
                          <div className="text-[10px] text-stone-500">{w.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Line Height / Padding / Paper Economy */}
                <div className="pt-2 border-t border-warm-200 space-y-2">
                  <label className="block font-bold text-stone-800 text-xs">
                    2. تباعد الأسطر واستهلاك رول الورق (Line Spacing):
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'compact', label: 'مضغوط (Compact)', desc: 'توفير أقصى لطول الورق' },
                      { id: 'normal', label: 'متوازن (Normal)', desc: 'المظهر القياسي الأنيق' },
                      { id: 'relaxed', label: 'متباعد (Relaxed)', desc: 'مسافات واسعة ومريحة' },
                    ].map((sp) => {
                      const isSelected = (formData.receiptLineSpacing || 'normal') === sp.id;
                      return (
                        <button
                          key={sp.id}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, receiptLineSpacing: sp.id }));
                            handleChangeLayout('itemsTable', 'rowPadding', sp.id);
                          }}
                          className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                            isSelected
                              ? 'border-brand-800 bg-brand-50 text-brand-950 font-black shadow-2xs ring-1 ring-brand-800'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <div className="font-bold text-xs">{sp.label}</div>
                          <div className="text-[10px] text-stone-500">{sp.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Store Identity & Contact */}
          {activeTab === 'identity' && (
            <div className="bg-white border border-warm-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <h3 className="font-black text-sm text-brand-900 border-b border-warm-200 pb-2 flex items-center gap-2">
                <Store className="w-4 h-4 text-brand-800" />
                <span>معلومات الهوية والفواتير الحرارية</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    اسم المتجر (بالعربية):
                  </label>
                  <input
                    type="text"
                    name="storeNameAr"
                    value={formData.storeNameAr || ''}
                    onChange={handleChange}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    الاسم التجاري (بالإنجليزية):
                  </label>
                  <input
                    type="text"
                    name="storeNameEn"
                    value={formData.storeNameEn || ''}
                    onChange={handleChange}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">
                    الوصف / الشعار أسفل العنوان:
                  </label>
                  <input
                    type="text"
                    name="tagline"
                    value={formData.tagline || ''}
                    onChange={handleChange}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    رقم الهاتف الرئيسي:
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
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

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1 flex items-center justify-between">
                    <span className="text-emerald-950 font-bold">
                      📲 رقم واتساب كروب المعمل / الموظفين:
                    </span>
                    <span className="text-[10px] text-stone-500 font-normal">
                      (اتركه فارغاً لاختيار الكروب من قائمة الواتساب مباشرة)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="staffWhatsAppPhone"
                    value={formData.staffWhatsAppPhone || ''}
                    onChange={handleChange}
                    placeholder="0770 000 0000"
                    className="w-full bg-emerald-50/50 border border-emerald-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    العنوان المطبوع بالوصل:
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    رمز العملة الافتراضية:
                  </label>
                  <input
                    type="text"
                    name="currency"
                    value={formData.currency || 'د.ع'}
                    onChange={handleChange}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-brand-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Shift Timings & Auto Switching */}
          {activeTab === 'shifts' && (
            <div className="bg-white border border-warm-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-warm-200 pb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-800" />
                  <h3 className="font-black text-sm text-brand-900">
                    مواعيد الورديات والتبديل التلقائي (الصباحي والمسائي)
                  </h3>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-stone-700">
                  <input
                    type="checkbox"
                    name="autoShiftSwitchEnabled"
                    checked={formData.autoShiftSwitchEnabled !== false}
                    onChange={handleChange}
                    className="w-4 h-4 text-brand-800 rounded accent-brand-800 cursor-pointer"
                  />
                  <span>تبديل الشفت تلقائياً حسب الوقت</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Morning Shift */}
                <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 border-b border-amber-200 pb-1">
                    <Sun className="w-4 h-4 text-amber-600" />
                    <span>الوردية الصباحية ☀️</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">من:</label>
                      <input
                        type="time"
                        name="morningShiftStart"
                        value={formData.morningShiftStart || '08:00'}
                        onChange={handleChange}
                        className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1 font-mono font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">إلى:</label>
                      <input
                        type="time"
                        name="morningShiftEnd"
                        value={formData.morningShiftEnd || '16:00'}
                        onChange={handleChange}
                        className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1 font-mono font-bold text-xs"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-500">الافتراضي: 08:00 صباحاً - 04:00 مساءً</p>
                </div>

                {/* Evening Shift */}
                <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900 border-b border-indigo-200 pb-1">
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span>الوردية المسائية 🌙</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">من:</label>
                      <input
                        type="time"
                        name="eveningShiftStart"
                        value={formData.eveningShiftStart || '16:00'}
                        onChange={handleChange}
                        className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1 font-mono font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">إلى:</label>
                      <input
                        type="time"
                        name="eveningShiftEnd"
                        value={formData.eveningShiftEnd || '02:00'}
                        onChange={handleChange}
                        className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1 font-mono font-bold text-xs"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-500">الافتراضي: 04:00 مساءً - 02:00 بعد منتصف الليل</p>
                </div>
              </div>

              {/* Grid Scale Controls */}
              <div className="pt-3 border-t border-warm-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-brand-800" />
                    <span>حجم الأقسام في نقطة البيع:</span>
                  </label>
                  <select
                    value={categoriesScale}
                    onChange={(e) => setCategoriesScale(Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800 cursor-pointer"
                  >
                    <option value={50}>50% (أصغر جداً - استيعاب أكبر عدد)</option>
                    <option value={75}>75% (صغير - مدمج)</option>
                    <option value={100}>100% (الافتراضي القياسي)</option>
                    <option value={125}>125% (كبير - أزرار واسعة)</option>
                    <option value={150}>150% (أكبر جداً - شاشات اللمس الكبيرة)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-brand-800" />
                    <span>حجم بطاقات المنتجات:</span>
                  </label>
                  <select
                    value={productsScale}
                    onChange={(e) => setProductsScale(Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800 cursor-pointer"
                  >
                    <option value={50}>50% (أصغر جداً - أعمدة أكثر)</option>
                    <option value={75}>75% (صغير - زيادة المنتجات المعروضة)</option>
                    <option value={100}>100% (الافتراضي القياسي)</option>
                    <option value={125}>125% (كبير - أزرار واسعة)</option>
                    <option value={150}>150% (أكبر جداً - للمس المباشر)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Menu, Staff & Presets */}
          {activeTab === 'menu_staff' && (
            <div className="space-y-3">
              {/* Menu Customization */}
              <div className="bg-gradient-to-r from-brand-900 to-[#5c0017] text-white p-4 rounded-2xl border border-brand-950 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gold-300 shrink-0">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-warm-50">تنسيق وترتيب القائمة والألوان</h4>
                    <p className="text-[11px] text-warm-200">
                      إعادة ترتيب تسلسل الأقسام والمنتجات وتخصيص ألوان البطاقات
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuCustomizationOpen(true)}
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-brand-950 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  فتح التنسيق 🎨
                </button>
              </div>

              {/* Preset Expenses */}
              <div className="bg-stone-900 text-white p-4 rounded-2xl border border-stone-800 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gold-400 shrink-0">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-warm-50">إدارة وتخصيص الصرفيات المعتادة</h4>
                    <p className="text-[11px] text-warm-200">
                      إضافة وتعديل بنود المصاريف المتكررة والمبالغ الافتراضية
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPresetExpensesOpen(true)}
                  className="px-4 py-2 bg-warm-100 hover:bg-white text-stone-900 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  إدارة الصرفيات ⚙️
                </button>
              </div>

              {/* Expense Categories */}
              <div className="bg-stone-800 text-white p-4 rounded-2xl border border-stone-700 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gold-400 shrink-0">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-warm-50">إدارة تصنيفات الصرفيات</h4>
                    <p className="text-[11px] text-warm-200">
                      إضافة وتعديل وحذف تصنيفات المصاريف اليومية في المنظومة
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExpenseCategoriesOpen(true)}
                  className="px-4 py-2 bg-warm-100 hover:bg-white text-stone-900 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  إدارة التصنيفات 📁
                </button>
              </div>

              {/* Reservation Staff */}
              <div className="bg-brand-900 text-white p-4 rounded-2xl border border-brand-800 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-brand-950 flex items-center justify-center text-gold-400 border border-gold-500/20 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-warm-50">إدارة قائمة موظفي الحجوزات</h4>
                    <p className="text-[11px] text-warm-200">
                      إضافة وتعديل وحذف أسماء الكادر والعمال المسؤولين عن تسجيل الحجوزات
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReservationStaffOpen(true)}
                  className="px-4 py-2 bg-warm-100 hover:bg-white text-stone-900 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  إدارة الموظفين 👥
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Security PINs */}
          {activeTab === 'security' && (
            <div className="bg-white border border-warm-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <h3 className="font-black text-sm text-brand-900 border-b border-warm-200 pb-2 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-brand-800" />
                <span>إدارة الرموز الأمنية للنظام (Security PINs)</span>
              </h3>

              {/* 1. Manager Profile Login PIN */}
              <div className="bg-warm-50/70 p-4 rounded-xl border border-warm-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 text-xs">
                    1. رمز مرور حساب المدير العام (Manager Profile PIN)
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">الافتراضي: 1234</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  يُستخدم لتسجيل الدخول كمدير، وكشف أرقام الوردية العمياء، وتعديل الفواتير والصرفيات:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10.5px] font-bold text-stone-700 mb-0.5">
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
                    <label className="block text-[10.5px] font-bold text-stone-700 mb-0.5">
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
                    className={`text-[11px] font-bold py-1.5 px-2.5 rounded-lg ${
                      pinChangeStatus.isError ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {pinChangeStatus.msg}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleUpdatePin}
                  className="bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold py-1.5 px-3.5 rounded-lg transition-colors cursor-pointer"
                >
                  تحديث رمز مرور المدير
                </button>
              </div>

              {/* 2. Shift Reset PIN */}
              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-300/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-800" />
                    <span>2. رمز تصفير اليومية المستقل (Shift Reset PIN)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCurrentResetPin((prev) => !prev)}
                    className="text-[10px] text-amber-800 hover:text-amber-950 underline font-bold cursor-pointer"
                  >
                    {showCurrentResetPin ? `الرمز الحالي: ${storeSettings.resetPin || '9999'}` : 'إظهار الرمز الحالي'}
                  </button>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  رمز أمني مستقل يُطلب حصرياً عند النقر على <strong>"إغلاق اليومية وتصفير الصندوق"</strong> لإصدار تقرير Z وتصفير العدادات.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10.5px] font-bold text-stone-700 mb-0.5">
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
                    <label className="block text-[10.5px] font-bold text-stone-700 mb-0.5">
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
                    className={`text-[11px] font-bold py-1.5 px-2.5 rounded-lg ${
                      resetPinStatus.isError ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {resetPinStatus.msg}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleUpdateResetPin}
                  className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold py-1.5 px-3.5 rounded-lg transition-colors cursor-pointer"
                >
                  تحديث رمز تصفير اليومية
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: Backup & Data Management */}
          {activeTab === 'backup' && (
            <div className="bg-white border border-warm-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-warm-200 pb-2">
                <h3 className="font-black text-sm text-brand-900 flex items-center gap-2">
                  <FileDown className="w-4 h-4 text-emerald-700" />
                  <span>النسخ الاحتياطي وحماية البيانات</span>
                </h3>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    isDesktop
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  {isDesktop ? '🖥️ تطبيق مكتبي - حفظ فوري على القرص الصلب' : '🌐 نسخة المتصفح - حفظ محلي فوري'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleExport}
                  className="py-3 px-3.5 bg-white hover:bg-emerald-50 border border-emerald-300 text-stone-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-emerald-600" />
                  <span>تصدير نسخة احتياطية كاملة (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={handleImportClick}
                  className="py-3 px-3.5 bg-white hover:bg-warm-100 border border-warm-300 text-stone-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <FileUp className="w-4 h-4 text-brand-800" />
                  <span>استيراد واسترجاع نسخة احتياطية (JSON)</span>
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
              <div className="pt-3 border-t border-stone-200">
                {showResetConfirm ? (
                  <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl space-y-2.5">
                    <div className="text-xs font-bold text-rose-900 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>تحذير: ستتم استعادة البيانات الافتراضية التجريبية لمحل مسك وزعفران.</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          resetToFactoryDefaults();
                          setShowResetConfirm(false);
                        }}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        نعم، استعد البيانات الافتراضية
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(false)}
                        className="px-4 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold py-2 rounded-lg cursor-pointer"
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
          )}
        </div>

        {/* LEFT SIDE (35% width): Live Thermal Receipt Simulator */}
        <div className="w-full lg:w-[35%] h-full flex flex-col shrink-0">
          <LiveReceiptSimulator
            storeSettings={formData}
            selectedElement={selectedInspectedElement}
            onSelectElement={handleSelectSimulatorElement}
            activeTicketType={
              activeReceiptTab === 'sales'
                ? 'sale_invoice'
                : activeReceiptTab === 'reservation'
                ? 'cake_reservation'
                : 'kitchen_ticket'
            }
            onTicketTypeChange={(type) => {
              if (type === 'sale_invoice') setActiveReceiptTab('sales');
              else if (type === 'cake_reservation') setActiveReceiptTab('reservation');
              else if (type === 'kitchen_ticket') setActiveReceiptTab('kitchen');
            }}
          />
        </div>
      </div>

      {/* Sub-modals for Menu, Expenses, Staff */}
      <MenuCustomizationModal
        isOpen={isMenuCustomizationOpen}
        onClose={() => setIsMenuCustomizationOpen(false)}
      />

      <ManagePresetExpensesModal
        isOpen={isPresetExpensesOpen}
        onClose={() => setIsPresetExpensesOpen(false)}
      />

      <ManageExpenseCategoriesModal
        isOpen={isExpenseCategoriesOpen}
        onClose={() => setIsExpenseCategoriesOpen(false)}
      />

      <ManageReservationStaffModal
        isOpen={isReservationStaffOpen}
        onClose={() => setIsReservationStaffOpen(false)}
      />
    </div>
  );
}
