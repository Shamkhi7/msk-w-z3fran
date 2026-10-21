import React, { useRef } from 'react';
import {
  FileText,
  Cake,
  ChefHat,
  RotateCcw,
  Sliders,
  Type,
  Image,
  Upload,
  Trash2,
  EyeOff,
} from 'lucide-react';
import {
  DEFAULT_SALES_RECEIPT_CONFIG,
  DEFAULT_RESERVATION_RECEIPT_CONFIG,
  DEFAULT_KITCHEN_TICKET_CONFIG,
} from '../../data/defaultData';
import { getLogoFilter } from '../../utils/receiptTypographyHelper';

/**
 * Sub-component: Logo Management Card
 */
function LogoConfigCard({
  tabTitle,
  logoSrc,
  showLogo,
  logoContrast,
  logoSize,
  onToggleShowLogo,
  onChangeContrast,
  onChangeSize,
  onUploadLogo,
  onResetLogo,
  onRemoveLogo,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result && onUploadLogo) {
          onUploadLogo(uploadEvent.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-warm-50/70 p-3.5 rounded-xl border border-warm-200 space-y-3">
      <div className="flex items-center justify-between border-b border-warm-200/80 pb-2">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-brand-800" />
          <span className="font-black text-xs text-stone-800">
            إدارة الشعار للطباعة الحرارية ({tabTitle})
          </span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-warm-200">
          <span className="text-xs font-bold text-stone-700">إظهار الشعار في هذا الوصل:</span>
          <input
            type="checkbox"
            checked={showLogo !== false}
            onChange={(e) => onToggleShowLogo(e.target.checked)}
            className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
          />
        </label>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Logo Preview with thermal monochrome filter */}
        <div className="w-24 h-20 bg-white border border-stone-300 rounded-xl flex items-center justify-center p-1.5 shrink-0 shadow-2xs overflow-hidden">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="Logo Preview"
              style={{
                filter: getLogoFilter(logoContrast),
                maxHeight: `${Math.min(60, logoSize || 48)}px`,
              }}
              className="max-w-full object-contain"
            />
          ) : (
            <span className="text-[10px] text-stone-400 font-bold text-center">لا يوجد شعار</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex-1 space-y-2 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 bg-brand-800 hover:bg-brand-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-gold-400" />
              <span>رفع شعار جديد (PNG/JPG)</span>
            </button>

            <button
              type="button"
              onClick={onResetLogo}
              title="استعادة الشعار الأصلي الافتراضي"
              className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer border border-stone-300"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
              <span>الشعار الافتراضي</span>
            </button>

            {logoSrc && (
              <button
                type="button"
                onClick={onRemoveLogo}
                title="إزالة الشعار نهائياً من الوصولات"
                className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>إزالة</span>
              </button>
            )}
          </div>

          <div className="text-[10.5px] text-stone-500">
            يُحفظ الشعار محلياً ويُحوّل تلقائياً إلى معالجة حرارية أحادية اللون (Monochrome Dithering)
          </div>
        </div>
      </div>

      {/* Sliders: Contrast & Height */}
      {showLogo !== false && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-warm-200/60">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-bold text-stone-700">حدة التباين والسواد الحراري:</span>
              <span className="font-mono font-black text-brand-900 text-[11px] bg-white px-1.5 py-0.5 rounded border border-warm-200">
                {logoContrast || 160}%
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={300}
              step={10}
              value={logoContrast || 160}
              onChange={(e) => onChangeContrast(Number(e.target.value))}
              className="w-full accent-brand-800 cursor-pointer"
            />
            <div className="flex justify-between text-[9.5px] text-stone-400">
              <span>100% عادي</span>
              <span>200% عالي التباين</span>
              <span>300% أقصى سواد</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-bold text-stone-700">ارتفاع الشعار بالوصل:</span>
              <span className="font-mono font-black text-brand-900 text-[11px] bg-white px-1.5 py-0.5 rounded border border-warm-200">
                {logoSize || 48} px
              </span>
            </div>
            <input
              type="range"
              min={28}
              max={70}
              step={2}
              value={logoSize || 48}
              onChange={(e) => onChangeSize(Number(e.target.value))}
              className="w-full accent-brand-800 cursor-pointer"
            />
            <div className="flex justify-between text-[9.5px] text-stone-400">
              <span>صغير 28px</span>
              <span>متوسط 48px</span>
              <span>كبير 70px</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Sub-component: Custom Labels Card
 */
function CustomLabelsCard({
  ticketTitle,
  customerLabel,
  phoneLabel,
  pickupHeaderLabel,
  inscriptionLabel,
  flavorLabel,
  designLabel,
  onChangeField,
  showPickupAndSpecs = false,
}) {
  return (
    <div className="bg-warm-50/70 p-3.5 rounded-xl border border-warm-200 space-y-2.5">
      <div className="flex items-center gap-2 border-b border-warm-200/80 pb-2">
        <Type className="w-4 h-4 text-brand-800" />
        <span className="font-black text-xs text-stone-800">
          تخصيص العناوين والنصوص الثابتة (Labels & Titles)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-bold text-stone-700 mb-1">
            عنوان الوصل الرئيسي (Header Title):
          </label>
          <input
            type="text"
            value={ticketTitle || ''}
            onChange={(e) => onChangeField('ticketTitle', e.target.value)}
            className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:ring-1 focus:ring-brand-800"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-stone-700 mb-1">
            نص حقل الزبون:
          </label>
          <input
            type="text"
            value={customerLabel || ''}
            onChange={(e) => onChangeField('customerLabel', e.target.value)}
            className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:ring-1 focus:ring-brand-800"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-stone-700 mb-1">
            نص حقل الهاتف:
          </label>
          <input
            type="text"
            value={phoneLabel || ''}
            onChange={(e) => onChangeField('phoneLabel', e.target.value)}
            className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:ring-1 focus:ring-brand-800"
          />
        </div>

        {showPickupAndSpecs && (
          <>
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                نص ترويسة موعد الاستلام / التسليم:
              </label>
              <input
                type="text"
                value={pickupHeaderLabel || ''}
                onChange={(e) => onChangeField('pickupHeaderLabel', e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:ring-1 focus:ring-brand-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                نص ترويسة عبارة الكريمة المطلوبة:
              </label>
              <input
                type="text"
                value={inscriptionLabel || ''}
                onChange={(e) => onChangeField('inscriptionLabel', e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:ring-1 focus:ring-brand-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                نص حقل النكهة والحشوة:
              </label>
              <input
                type="text"
                value={flavorLabel || ''}
                onChange={(e) => onChangeField('flavorLabel', e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:ring-1 focus:ring-brand-800"
              />
            </div>

            {designLabel !== undefined && (
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  نص حقل التصميم والشكل:
                </label>
                <input
                  type="text"
                  value={designLabel || ''}
                  onChange={(e) => onChangeField('designLabel', e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:ring-1 focus:ring-brand-800"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Sub-component: Customer Typography Card
 */
function CustomerTypographyCard({
  customerNameSize,
  customerNameBold,
  customerPhoneSize,
  customerPhoneBold,
  onChangeCustomerNameSize,
  onToggleCustomerNameBold,
  onChangeCustomerPhoneSize,
  onToggleCustomerPhoneBold,
}) {
  return (
    <div className="bg-warm-50/70 p-3.5 rounded-xl border border-warm-200 space-y-3">
      <div className="flex items-center gap-2 border-b border-warm-200/80 pb-2">
        <Type className="w-4 h-4 text-brand-800" />
        <span className="font-black text-xs text-stone-800">
          تخصيص خطوط بيانات الزبون (فصل حجم الاسم عن الهاتف)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Customer Name */}
        <div className="bg-white p-3 rounded-lg border border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-stone-800">حجم خط اسم الزبون:</span>
            <span className="font-mono font-black text-brand-900 text-xs bg-warm-50 px-2 py-0.5 rounded border border-warm-200">
              {customerNameSize || 16} px
            </span>
          </div>
          <input
            type="range"
            min={12}
            max={28}
            step={1}
            value={customerNameSize || 16}
            onChange={(e) => onChangeCustomerNameSize(Number(e.target.value))}
            className="w-full accent-brand-800 cursor-pointer"
          />
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-stone-500">12px - 28px</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-stone-700">
              <input
                type="checkbox"
                checked={customerNameBold !== false}
                onChange={(e) => onToggleCustomerNameBold(e.target.checked)}
                className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
              />
              <span>خط عريض (Bold)</span>
            </label>
          </div>
        </div>

        {/* Customer Phone */}
        <div className="bg-white p-3 rounded-lg border border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-stone-800">حجم خط رقم الهاتف:</span>
            <span className="font-mono font-black text-brand-900 text-xs bg-warm-50 px-2 py-0.5 rounded border border-warm-200">
              {customerPhoneSize || 14} px
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={22}
            step={1}
            value={customerPhoneSize || 14}
            onChange={(e) => onChangeCustomerPhoneSize(Number(e.target.value))}
            className="w-full accent-brand-800 cursor-pointer"
          />
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-stone-500">10px - 22px</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-stone-700">
              <input
                type="checkbox"
                checked={customerPhoneBold !== false}
                onChange={(e) => onToggleCustomerPhoneBold(e.target.checked)}
                className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
              />
              <span>خط عريض (Bold)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Component: ReceiptConfigTabs
 */
export function ReceiptConfigTabs({
  activeReceiptTab = 'sales',
  onTabChange,
  storeSettings,
  onUpdateLogo,
  onUpdateSalesConfig,
  onUpdateReservationConfig,
  onUpdateKitchenConfig,
  onResetConfig,
}) {
  const currentLogo = storeSettings?.logo || '/logo.png';

  const salesCfg = {
    ...DEFAULT_SALES_RECEIPT_CONFIG,
    ...(storeSettings?.salesReceiptConfig || {}),
  };

  const resCfg = {
    ...DEFAULT_RESERVATION_RECEIPT_CONFIG,
    ...(storeSettings?.reservationReceiptConfig || {}),
  };

  const kitCfg = {
    ...DEFAULT_KITCHEN_TICKET_CONFIG,
    ...(storeSettings?.kitchenTicketConfig || {}),
  };

  const tabs = [
    {
      id: 'sales',
      label: '1. وصل المبيعات (البيع المباشر)',
      shortLabel: 'وصل المبيعات',
      icon: FileText,
      badge: 'الكاش والمبيعات',
    },
    {
      id: 'reservation',
      label: '2. وصل حجز الزبون',
      shortLabel: 'وصل الحجز',
      icon: Cake,
      badge: 'نسخة العميل',
    },
    {
      id: 'kitchen',
      label: '3. بون المعمل (الشيف)',
      shortLabel: 'بون المعمل',
      icon: ChefHat,
      badge: 'نسخة الإنتاج',
    },
  ];

  return (
    <div className="bg-white border border-warm-200 rounded-2xl shadow-xs overflow-hidden select-none space-y-0">
      {/* Tab Switcher Bar */}
      <div className="p-3 bg-stone-900 text-white border-b border-stone-800">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-xs sm:text-sm text-white flex items-center gap-2">
                <span>تخصيص وإعدادات الوصولات المنفصلة</span>
                <span className="bg-brand-900 text-gold-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gold-500/30">
                  إعدادات معزولة 3 فئات 🔒
                </span>
              </h3>
              <p className="text-[11px] text-stone-400">
                كل وصل له إعداداته المستقلة تماماً بدون أي تداخل في الخطوط أو الأحجام
              </p>
            </div>
          </div>

          {onResetConfig && (
            <button
              type="button"
              onClick={() => onResetConfig(activeReceiptTab)}
              title="استعادة الإعدادات الافتراضية لهذا الوصل فقط"
              className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-stone-700"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gold-400" />
              <span>افتراضي هذا الوصل</span>
            </button>
          )}
        </div>

        {/* 3 Main Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-stone-950 p-1.5 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeReceiptTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange && onTabChange(tab.id)}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-brand-800 text-white shadow-md font-black ring-1 ring-gold-400/50'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-gold-400' : 'text-stone-400'} shrink-0`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: SALES RECEIPT CONFIG                              */}
      {/* ======================================================== */}
      {activeReceiptTab === 'sales' && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-warm-200 pb-2.5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-800" />
              <h4 className="font-black text-sm text-brand-900">
                إعدادات وصل المبيعات (البيع المباشر والزبائن)
              </h4>
            </div>
            <span className="text-[10.5px] font-mono font-bold bg-brand-50 text-brand-900 px-2.5 py-1 rounded-lg border border-brand-200">
              مخصص لفواتير الكاشير المباشرة
            </span>
          </div>

          {/* 1. Logo Management */}
          <LogoConfigCard
            tabTitle="وصل المبيعات"
            logoSrc={currentLogo}
            showLogo={salesCfg.showLogo}
            logoContrast={salesCfg.logoContrast}
            logoSize={salesCfg.logoSize}
            onToggleShowLogo={(val) => onUpdateSalesConfig('showLogo', val)}
            onChangeContrast={(val) => onUpdateSalesConfig('logoContrast', val)}
            onChangeSize={(val) => onUpdateSalesConfig('logoSize', val)}
            onUploadLogo={(base64) => onUpdateLogo && onUpdateLogo(base64)}
            onResetLogo={() => onUpdateLogo && onUpdateLogo('/logo.png')}
            onRemoveLogo={() => onUpdateLogo && onUpdateLogo(null)}
          />

          {/* 2. Custom Labels & Title */}
          <CustomLabelsCard
            ticketTitle={salesCfg.ticketTitle}
            customerLabel={salesCfg.customerLabel}
            phoneLabel={salesCfg.phoneLabel}
            onChangeField={(field, val) => onUpdateSalesConfig(field, val)}
            showPickupAndSpecs={false}
          />

          {/* 3. Customer Typography (Separated Name & Phone) */}
          <CustomerTypographyCard
            customerNameSize={salesCfg.customerNameSize}
            customerNameBold={salesCfg.customerNameBold}
            customerPhoneSize={salesCfg.customerPhoneSize}
            customerPhoneBold={salesCfg.customerPhoneBold}
            onChangeCustomerNameSize={(val) => onUpdateSalesConfig('customerNameSize', val)}
            onToggleCustomerNameBold={(val) => onUpdateSalesConfig('customerNameBold', val)}
            onChangeCustomerPhoneSize={(val) => onUpdateSalesConfig('customerPhoneSize', val)}
            onToggleCustomerPhoneBold={(val) => onUpdateSalesConfig('customerPhoneBold', val)}
          />

          {/* 4. Payment Method & Rounding Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center justify-between bg-warm-50/60 p-3 rounded-xl border border-warm-200 cursor-pointer">
              <span className="font-bold text-xs text-stone-800">
                إظهار شارة طريقة الدفع (كاش / بطاقة):
              </span>
              <input
                type="checkbox"
                checked={salesCfg.showPaymentMethodBadge !== false}
                onChange={(e) => onUpdateSalesConfig('showPaymentMethodBadge', e.target.checked)}
                className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between bg-warm-50/60 p-3 rounded-xl border border-warm-200 cursor-pointer">
              <span className="font-bold text-xs text-stone-800">
                إظهار سطر خصم تقريب الكاش (250 د.ع):
              </span>
              <input
                type="checkbox"
                checked={salesCfg.showRoundingDiscount !== false}
                onChange={(e) => onUpdateSalesConfig('showRoundingDiscount', e.target.checked)}
                className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* 5. Sliders: Item Name & Price font sizes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Item Name Size */}
            <div className="bg-warm-50/60 p-3.5 rounded-xl border border-warm-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-800">حجم خط اسم الصنف في الجدول:</span>
                <span className="font-mono font-black text-brand-900 text-xs bg-white px-2 py-0.5 rounded border border-warm-200">
                  {salesCfg.itemNameSize || 15} px
                </span>
              </div>
              <input
                type="range"
                min={12}
                max={24}
                step={1}
                value={salesCfg.itemNameSize || 15}
                onChange={(e) => onUpdateSalesConfig('itemNameSize', Number(e.target.value))}
                className="w-full accent-brand-800 cursor-pointer"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-stone-500">12px - 24px</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={salesCfg.itemNameBold !== false}
                    onChange={(e) => onUpdateSalesConfig('itemNameBold', e.target.checked)}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
                  />
                  <span>خط عريض (Bold)</span>
                </label>
              </div>
            </div>

            {/* Price Size */}
            <div className="bg-warm-50/60 p-3.5 rounded-xl border border-warm-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-800">حجم خط السعر والكمية:</span>
                <span className="font-mono font-black text-brand-900 text-xs bg-white px-2 py-0.5 rounded border border-warm-200">
                  {salesCfg.priceSize || 14} px
                </span>
              </div>
              <input
                type="range"
                min={11}
                max={22}
                step={1}
                value={salesCfg.priceSize || 14}
                onChange={(e) => onUpdateSalesConfig('priceSize', Number(e.target.value))}
                className="w-full accent-brand-800 cursor-pointer"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-stone-500">11px - 22px</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={salesCfg.priceBold !== false}
                    onChange={(e) => onUpdateSalesConfig('priceBold', e.target.checked)}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
                  />
                  <span>أرقام عريضة (Bold)</span>
                </label>
              </div>
            </div>
          </div>

          {/* 6. Custom Footer Message */}
          <div className="bg-warm-50/60 p-3.5 rounded-xl border border-warm-200 space-y-2">
            <label className="block font-bold text-xs text-stone-800">
              رسالة وتذييل نهاية فاتورة المبيعات (Footer Message):
            </label>
            <input
              type="text"
              value={salesCfg.footerMessage || ''}
              onChange={(e) => onUpdateSalesConfig('footerMessage', e.target.value)}
              placeholder="مثال: شكراً لزيارتكم لمسك وزعفران | يسعدنا تقييمكم وزيارتكم مجدداً"
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CUSTOMER RESERVATION RECEIPT CONFIG               */}
      {/* ======================================================== */}
      {activeReceiptTab === 'reservation' && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-warm-200 pb-2.5">
            <div className="flex items-center gap-2">
              <Cake className="w-4 h-4 text-brand-800" />
              <h4 className="font-black text-sm text-brand-900">
                إعدادات وصل حجز الزبون (Customer Reservation Ticket)
              </h4>
            </div>
            <span className="text-[10.5px] font-mono font-bold bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-300">
              نسخة الزبون لتثبيت طلبية الكيك
            </span>
          </div>

          {/* 1. Logo Management */}
          <LogoConfigCard
            tabTitle="وصل حجز الزبون"
            logoSrc={currentLogo}
            showLogo={resCfg.showLogo}
            logoContrast={resCfg.logoContrast}
            logoSize={resCfg.logoSize}
            onToggleShowLogo={(val) => onUpdateReservationConfig('showLogo', val)}
            onChangeContrast={(val) => onUpdateReservationConfig('logoContrast', val)}
            onChangeSize={(val) => onUpdateReservationConfig('logoSize', val)}
            onUploadLogo={(base64) => onUpdateLogo && onUpdateLogo(base64)}
            onResetLogo={() => onUpdateLogo && onUpdateLogo('/logo.png')}
            onRemoveLogo={() => onUpdateLogo && onUpdateLogo(null)}
          />

          {/* 2. Custom Labels & Title */}
          <CustomLabelsCard
            ticketTitle={resCfg.ticketTitle}
            customerLabel={resCfg.customerLabel}
            phoneLabel={resCfg.phoneLabel}
            pickupHeaderLabel={resCfg.pickupHeaderLabel}
            inscriptionLabel={resCfg.inscriptionLabel}
            flavorLabel={resCfg.flavorLabel}
            designLabel={resCfg.designLabel}
            onChangeField={(field, val) => onUpdateReservationConfig(field, val)}
            showPickupAndSpecs={true}
          />

          {/* 3. Customer Typography (Separated Name & Phone) */}
          <CustomerTypographyCard
            customerNameSize={resCfg.customerNameSize}
            customerNameBold={resCfg.customerNameBold}
            customerPhoneSize={resCfg.customerPhoneSize}
            customerPhoneBold={resCfg.customerPhoneBold}
            onChangeCustomerNameSize={(val) => onUpdateReservationConfig('customerNameSize', val)}
            onToggleCustomerNameBold={(val) => onUpdateReservationConfig('customerNameBold', val)}
            onChangeCustomerPhoneSize={(val) => onUpdateReservationConfig('customerPhoneSize', val)}
            onToggleCustomerPhoneBold={(val) => onUpdateReservationConfig('customerPhoneBold', val)}
          />

          {/* 4. Independent Sliders: Manual Ticket, Pickup Banner, Inscription, Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Manual Ticket Box Size */}
            <div className="bg-warm-50/60 p-3.5 rounded-xl border border-warm-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-800">حجم رقم الحجز اليدوي (#104):</span>
                <span className="font-mono font-black text-brand-900 text-xs bg-white px-2 py-0.5 rounded border border-warm-200">
                  {resCfg.manualTicketSize || 22} px
                </span>
              </div>
              <input
                type="range"
                min={16}
                max={34}
                step={1}
                value={resCfg.manualTicketSize || 22}
                onChange={(e) => onUpdateReservationConfig('manualTicketSize', Number(e.target.value))}
                className="w-full accent-brand-800 cursor-pointer"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-stone-500">16px - 34px</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={resCfg.manualTicketBold !== false}
                    onChange={(e) => onUpdateReservationConfig('manualTicketBold', e.target.checked)}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
                  />
                  <span>أرقام عريضة (Bold)</span>
                </label>
              </div>
            </div>

            {/* Scheduled Pickup Banner */}
            <div className="bg-warm-50/60 p-3.5 rounded-xl border border-warm-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-800">حجم خط موعد الاستلام المحدد:</span>
                <span className="font-mono font-black text-brand-900 text-xs bg-white px-2 py-0.5 rounded border border-warm-200">
                  {resCfg.pickupBannerSize || 17} px
                </span>
              </div>
              <input
                type="range"
                min={14}
                max={28}
                step={1}
                value={resCfg.pickupBannerSize || 17}
                onChange={(e) => onUpdateReservationConfig('pickupBannerSize', Number(e.target.value))}
                className="w-full accent-brand-800 cursor-pointer"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-stone-500">14px - 28px</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={resCfg.pickupBannerBold !== false}
                    onChange={(e) => onUpdateReservationConfig('pickupBannerBold', e.target.checked)}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
                  />
                  <span>عريض (Bold)</span>
                </label>
              </div>
            </div>

            {/* Inscription Size */}
            <div className="bg-warm-50/60 p-3.5 rounded-xl border border-warm-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-800">حجم خط العبارة المطلوبة على القالب:</span>
                <span className="font-mono font-black text-brand-900 text-xs bg-white px-2 py-0.5 rounded border border-warm-200">
                  {resCfg.inscriptionSize || 16} px
                </span>
              </div>
              <input
                type="range"
                min={14}
                max={30}
                step={1}
                value={resCfg.inscriptionSize || 16}
                onChange={(e) => onUpdateReservationConfig('inscriptionSize', Number(e.target.value))}
                className="w-full accent-brand-800 cursor-pointer"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-stone-500">14px - 30px</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={resCfg.inscriptionBold !== false}
                    onChange={(e) => onUpdateReservationConfig('inscriptionBold', e.target.checked)}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
                  />
                  <span>خط عريض للعبارة</span>
                </label>
              </div>
            </div>

            {/* Flavors & Specs Size */}
            <div className="bg-warm-50/60 p-3.5 rounded-xl border border-warm-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-800">حجم خط النكهات والمواصفات:</span>
                <span className="font-mono font-black text-brand-900 text-xs bg-white px-2 py-0.5 rounded border border-warm-200">
                  {resCfg.specsSize || 12} px
                </span>
              </div>
              <input
                type="range"
                min={11}
                max={22}
                step={1}
                value={resCfg.specsSize || 12}
                onChange={(e) => onUpdateReservationConfig('specsSize', Number(e.target.value))}
                className="w-full accent-brand-800 cursor-pointer"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-stone-500">11px - 22px</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={resCfg.specsBold !== false}
                    onChange={(e) => onUpdateReservationConfig('specsBold', e.target.checked)}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
                  />
                  <span>نصوص عريضة</span>
                </label>
              </div>
            </div>
          </div>

          {/* 5. Policy Disclaimer */}
          <div className="bg-warm-50/60 p-3.5 rounded-xl border border-warm-200 space-y-2">
            <label className="block font-bold text-xs text-stone-800">
              شروط وتعليمات الحجز وسياسة العربون (أسفل الوصل):
            </label>
            <textarea
              rows={3}
              value={resCfg.policyDisclaimer || ''}
              onChange={(e) => onUpdateReservationConfig('policyDisclaimer', e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: KITCHEN TICKET CONFIG                             */}
      {/* ======================================================== */}
      {activeReceiptTab === 'kitchen' && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-warm-200 pb-2.5">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-brand-800" />
              <h4 className="font-black text-sm text-brand-900">
                إعدادات بون المعمل والإنتاج (للشيف وقسم التحضير)
              </h4>
            </div>
            <span className="text-[10.5px] font-mono font-bold bg-blue-50 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-300">
              خاص بالمعمل والخبازين فقط
            </span>
          </div>

          {/* 1. Strict Price Hide Toggle */}
          <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-200/80 text-rose-800 flex items-center justify-center shrink-0">
                <EyeOff className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-black text-xs text-rose-950">
                  إخفاء المبالغ والأسعار والعربون تماماً من بون المعمل:
                </span>
                <span className="block text-[10.5px] text-rose-800">
                  (موصى به دائماً): عدم عرض أي أرقام مالية للشيف لمنع تشتيت الانتباه والحفاظ على سرية المبيعات
                </span>
              </div>
            </div>

            <input
              type="checkbox"
              checked={kitCfg.hideAllPrices !== false}
              onChange={(e) => onUpdateKitchenConfig('hideAllPrices', e.target.checked)}
              className="w-5 h-5 text-rose-700 accent-rose-700 rounded cursor-pointer shrink-0 mr-3"
            />
          </div>

          {/* 2. Logo Management (Hidden by default on kitchen tickets to save paper) */}
          <LogoConfigCard
            tabTitle="بون المعمل"
            logoSrc={currentLogo}
            showLogo={kitCfg.showLogo}
            logoContrast={kitCfg.logoContrast}
            logoSize={kitCfg.logoSize}
            onToggleShowLogo={(val) => onUpdateKitchenConfig('showLogo', val)}
            onChangeContrast={(val) => onUpdateKitchenConfig('logoContrast', val)}
            onChangeSize={(val) => onUpdateKitchenConfig('logoSize', val)}
            onUploadLogo={(base64) => onUpdateLogo && onUpdateLogo(base64)}
            onResetLogo={() => onUpdateLogo && onUpdateLogo('/logo.png')}
            onRemoveLogo={() => onUpdateLogo && onUpdateLogo(null)}
          />

          {/* 3. Custom Labels & Title (Thermal-safe, no broken emoji boxes) */}
          <CustomLabelsCard
            ticketTitle={kitCfg.ticketTitle}
            customerLabel={kitCfg.customerLabel}
            phoneLabel={kitCfg.phoneLabel}
            pickupHeaderLabel={kitCfg.pickupHeaderLabel}
            inscriptionLabel={kitCfg.inscriptionLabel}
            flavorLabel={kitCfg.flavorLabel}
            designLabel={kitCfg.designLabel}
            onChangeField={(field, val) => onUpdateKitchenConfig(field, val)}
            showPickupAndSpecs={true}
          />

          {/* 4. Customer Typography (Separated Name & Phone) */}
          <CustomerTypographyCard
            customerNameSize={kitCfg.customerNameSize}
            customerNameBold={kitCfg.customerNameBold}
            customerPhoneSize={kitCfg.customerPhoneSize}
            customerPhoneBold={kitCfg.customerPhoneBold}
            onChangeCustomerNameSize={(val) => onUpdateKitchenConfig('customerNameSize', val)}
            onToggleCustomerNameBold={(val) => onUpdateKitchenConfig('customerNameBold', val)}
            onChangeCustomerPhoneSize={(val) => onUpdateKitchenConfig('customerPhoneSize', val)}
            onToggleCustomerPhoneBold={(val) => onUpdateKitchenConfig('customerPhoneBold', val)}
          />

          {/* 5. Sliders: Pickup Date Banner & Manual Ticket Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Pickup Date/Time Banner Size */}
            <div className="bg-warm-50/60 p-3.5 rounded-xl border border-warm-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-800">
                  حجم خط بانر موعد التسليم للشيف:
                </span>
                <span className="font-mono font-black text-brand-900 text-xs bg-white px-2 py-0.5 rounded border border-warm-200">
                  {kitCfg.pickupBannerSize || 18} px
                </span>
              </div>
              <input
                type="range"
                min={14}
                max={28}
                step={1}
                value={kitCfg.pickupBannerSize || 18}
                onChange={(e) => onUpdateKitchenConfig('pickupBannerSize', Number(e.target.value))}
                className="w-full accent-brand-800 cursor-pointer"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-stone-500">14px - 28px</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={kitCfg.pickupBannerBold !== false}
                    onChange={(e) => onUpdateKitchenConfig('pickupBannerBold', e.target.checked)}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
                  />
                  <span>عريض جداً للملاحظة السريعة</span>
                </label>
              </div>
            </div>

            {/* Manual Ticket Box Size */}
            <div className="bg-warm-50/60 p-3.5 rounded-xl border border-warm-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-800">حجم رقم الحجز اليدوي (#104):</span>
                <span className="font-mono font-black text-brand-900 text-xs bg-white px-2 py-0.5 rounded border border-warm-200">
                  {kitCfg.manualTicketSize || 24} px
                </span>
              </div>
              <input
                type="range"
                min={16}
                max={34}
                step={1}
                value={kitCfg.manualTicketSize || 24}
                onChange={(e) => onUpdateKitchenConfig('manualTicketSize', Number(e.target.value))}
                className="w-full accent-brand-800 cursor-pointer"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-stone-500">16px - 34px</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={kitCfg.manualTicketBold !== false}
                    onChange={(e) => onUpdateKitchenConfig('manualTicketBold', e.target.checked)}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
                  />
                  <span>أرقام عريضة للفرز</span>
                </label>
              </div>
            </div>
          </div>

          {/* 6. Flavors, Dimensions & Inscription Frame */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Specs & Flavors Font Size */}
            <div className="bg-warm-50/60 p-3.5 rounded-xl border border-warm-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-800">
                  حجم خط نكهات وحشوات وتفاصيل الكيك:
                </span>
                <span className="font-mono font-black text-brand-900 text-xs bg-white px-2 py-0.5 rounded border border-warm-200">
                  {kitCfg.specsAndNotesSize || 14} px
                </span>
              </div>
              <input
                type="range"
                min={11}
                max={22}
                step={1}
                value={kitCfg.specsAndNotesSize || 14}
                onChange={(e) => onUpdateKitchenConfig('specsAndNotesSize', Number(e.target.value))}
                className="w-full accent-brand-800 cursor-pointer"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-stone-500">وضوح عالي لمقادير الشيف</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={kitCfg.specsAndNotesBold !== false}
                    onChange={(e) => onUpdateKitchenConfig('specsAndNotesBold', e.target.checked)}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
                  />
                  <span>تباين عريض (Bold)</span>
                </label>
              </div>
            </div>

            {/* Inscription Size & Decorative Frame */}
            <div className="bg-warm-50/60 p-3.5 rounded-xl border border-warm-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-800">
                  حجم خط عبارة الكيك بالكريمة:
                </span>
                <span className="font-mono font-black text-brand-900 text-xs bg-white px-2 py-0.5 rounded border border-warm-200">
                  {kitCfg.inscriptionSize || 18} px
                </span>
              </div>
              <input
                type="range"
                min={14}
                max={30}
                step={1}
                value={kitCfg.inscriptionSize || 18}
                onChange={(e) => onUpdateKitchenConfig('inscriptionSize', Number(e.target.value))}
                className="w-full accent-brand-800 cursor-pointer"
              />
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={kitCfg.inscriptionBold !== false}
                    onChange={(e) => onUpdateKitchenConfig('inscriptionBold', e.target.checked)}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
                  />
                  <span>خط عريض</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-stone-800">
                  <input
                    type="checkbox"
                    checked={kitCfg.decoratedInscriptionFrame !== false}
                    onChange={(e) => onUpdateKitchenConfig('decoratedInscriptionFrame', e.target.checked)}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
                  />
                  <span>إطار مزخرف للعبارة</span>
                </label>
              </div>
            </div>
          </div>

          {/* 7. Visibility Toggles for Kitchen Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <label className="flex items-center gap-1.5 bg-stone-50 p-2.5 rounded-lg border border-stone-200 cursor-pointer text-[11px] font-bold text-stone-700">
              <input
                type="checkbox"
                checked={kitCfg.showWrittenText !== false}
                onChange={(e) => onUpdateKitchenConfig('showWrittenText', e.target.checked)}
                className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
              />
              <span>عبارة الكريمة</span>
            </label>

            <label className="flex items-center gap-1.5 bg-stone-50 p-2.5 rounded-lg border border-stone-200 cursor-pointer text-[11px] font-bold text-stone-700">
              <input
                type="checkbox"
                checked={kitCfg.showFlavor !== false}
                onChange={(e) => onUpdateKitchenConfig('showFlavor', e.target.checked)}
                className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
              />
              <span>النكهة والحشوة</span>
            </label>

            <label className="flex items-center gap-1.5 bg-stone-50 p-2.5 rounded-lg border border-stone-200 cursor-pointer text-[11px] font-bold text-stone-700">
              <input
                type="checkbox"
                checked={kitCfg.showDesign !== false}
                onChange={(e) => onUpdateKitchenConfig('showDesign', e.target.checked)}
                className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
              />
              <span>تفاصيل الديكور</span>
            </label>

            <label className="flex items-center gap-1.5 bg-stone-50 p-2.5 rounded-lg border border-stone-200 cursor-pointer text-[11px] font-bold text-stone-700">
              <input
                type="checkbox"
                checked={kitCfg.showChefNotes !== false}
                onChange={(e) => onUpdateKitchenConfig('showChefNotes', e.target.checked)}
                className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
              />
              <span>ملاحظات المعمل</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
