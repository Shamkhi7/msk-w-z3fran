import React from 'react';
import {
  Store,
  User,
  ListOrdered,
  FileSignature,
  DollarSign,
  Minus,
  Barcode,
  RotateCcw,
  Check,
  AlignCenter,
  AlignRight,
  AlignLeft,
  Sparkles,
  Info,
} from 'lucide-react';
import { DEFAULT_RECEIPT_LAYOUT } from '../../data/defaultData';

export function ReceiptInspectorPanel({
  selectedElement = 'header',
  onSelectElement,
  layout,
  storeSettings,
  onChangeLayout,
  onResetSection,
}) {
  const currentLayout = layout || DEFAULT_RECEIPT_LAYOUT;

  const sections = [
    { id: 'header', label: 'الترويسة', icon: Store, hint: 'اسم المحل والهواتف' },
    { id: 'customer', label: 'الزبون', icon: User, hint: 'بيانات العميل والفاتورة' },
    { id: 'itemsTable', label: 'الأصناف', icon: ListOrdered, hint: 'جدول المواد والأسعار' },
    { id: 'notesBlock', label: 'الملاحظات', icon: FileSignature, hint: 'عبارة الكيك والنكهات' },
    { id: 'totalsBox', label: 'المجاميع', icon: DollarSign, hint: 'الإجمالي والإطار' },
    { id: 'dividers', label: 'الفواصل', icon: Minus, hint: 'نمط الخطوط الفاصلة' },
    { id: 'footer', label: 'التذييل', icon: Barcode, hint: 'الشكر والباركود' },
  ];

  const handleUpdate = (section, key, value) => {
    if (onChangeLayout) {
      onChangeLayout(section, key, value);
    }
  };

  const handleToggle = (section, key) => {
    const currentValue = currentLayout[section]?.[key];
    handleUpdate(section, key, !currentValue);
  };

  return (
    <div className="bg-white border border-warm-200 rounded-2xl shadow-xs overflow-hidden select-none">
      {/* Top Banner & Quick Selector Chips */}
      <div className="bg-stone-900 text-white p-3.5 border-b border-stone-800">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-xs sm:text-sm text-white">
                محرر ومصمم الوصل التفاعلي (WYSIWYG Inspector)
              </h3>
              <p className="text-[10.5px] text-stone-400">
                انقر على أي جزء من الوصل باليسار أو اختر من الأقسام أدناه لتعديله فوراً
              </p>
            </div>
          </div>
          {onResetSection && (
            <button
              type="button"
              onClick={() => onResetSection(selectedElement)}
              title="استعادة الإعدادات الافتراضية لهذا القسم فقط"
              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-gold-400" />
              <span>افتراضي القسم</span>
            </button>
          )}
        </div>

        {/* Section Navigation Tabs */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 bg-stone-950 p-1 rounded-xl">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isSelected = selectedElement === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelectElement && onSelectElement(sec.id)}
                className={`py-1.5 px-1 rounded-lg text-[10.5px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-brand-800 text-white shadow-xs font-black ring-1 ring-gold-400/40'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-gold-400' : 'text-stone-400'}`} />
                <span className="truncate">{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Inspector Controls Body */}
      <div className="p-4 space-y-4">
        {/* 1. HEADER INSPECTOR */}
        {selectedElement === 'header' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-warm-200 pb-2">
              <span className="font-black text-xs text-brand-900 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-brand-800" />
                <span>تخصيص ترويسة المحل (Store Header)</span>
              </span>
              <span className="bg-brand-50 text-brand-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-brand-200">
                الحجم: {currentLayout.header?.fontSize || 20}px
              </span>
            </div>

            {/* Font Size & Bold */}
            <div className="bg-warm-50/60 p-3 rounded-xl border border-warm-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">حجم خط اسم المحل الرئيسي:</span>
                <span className="font-mono font-black text-brand-900 text-xs">
                  {currentLayout.header?.fontSize || 20} px
                </span>
              </div>
              <input
                type="range"
                min={16}
                max={28}
                step={1}
                value={currentLayout.header?.fontSize || 20}
                onChange={(e) => handleUpdate('header', 'fontSize', Number(e.target.value))}
                className="w-full accent-brand-800 cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={currentLayout.header?.bold !== false}
                    onChange={() => handleToggle('header', 'bold')}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
                  />
                  <span>عريض جداً (Heavy Black)</span>
                </label>

                {/* Alignment */}
                <div className="flex items-center gap-1 bg-stone-200 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleUpdate('header', 'align', 'center')}
                    className={`px-2 py-1 rounded text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      (currentLayout.header?.align || 'center') === 'center'
                        ? 'bg-white text-brand-900 shadow-2xs'
                        : 'text-stone-600 hover:text-black'
                    }`}
                  >
                    <AlignCenter className="w-3 h-3" />
                    <span>وسط</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate('header', 'align', 'right')}
                    className={`px-2 py-1 rounded text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      currentLayout.header?.align === 'right'
                        ? 'bg-white text-brand-900 shadow-2xs'
                        : 'text-stone-600 hover:text-black'
                    }`}
                  >
                    <AlignRight className="w-3 h-3" />
                    <span>يمين</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Editable Text Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  اسم المتجر (بالعربية):
                </label>
                <input
                  type="text"
                  value={currentLayout.header?.storeNameAr || ''}
                  onChange={(e) => handleUpdate('header', 'storeNameAr', e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  الاسم التجاري (بالإنجليزية):
                </label>
                <input
                  type="text"
                  value={currentLayout.header?.storeNameEn || ''}
                  onChange={(e) => handleUpdate('header', 'storeNameEn', e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  هاتف المحل الأساسي:
                </label>
                <input
                  type="text"
                  value={currentLayout.header?.phone || ''}
                  onChange={(e) => handleUpdate('header', 'phone', e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  هاتف المحل الثاني (اختياري):
                </label>
                <input
                  type="text"
                  value={currentLayout.header?.phone2 || ''}
                  onChange={(e) => handleUpdate('header', 'phone2', e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  شعار المتجر / العبارة الترويجية:
                </label>
                <input
                  type="text"
                  value={currentLayout.header?.tagline || ''}
                  onChange={(e) => handleUpdate('header', 'tagline', e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  العنوان الجغرافي:
                </label>
                <input
                  type="text"
                  value={currentLayout.header?.address || ''}
                  onChange={(e) => handleUpdate('header', 'address', e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
              </div>
            </div>

            {/* Visibility Toggles */}
            <div className="pt-2 border-t border-warm-200">
              <span className="block text-[11px] font-bold text-stone-700 mb-1.5">
                خيارات الإظهار والإخفاء في الترويسة:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-lg border border-stone-200 cursor-pointer text-[11px] font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={currentLayout.header?.showStoreNameEn !== false}
                    onChange={() => handleToggle('header', 'showStoreNameEn')}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                  />
                  <span>الاسم بالإنجليزية</span>
                </label>

                <label className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-lg border border-stone-200 cursor-pointer text-[11px] font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={currentLayout.header?.showTagline !== false}
                    onChange={() => handleToggle('header', 'showTagline')}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                  />
                  <span>شعار المحل</span>
                </label>

                <label className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-lg border border-stone-200 cursor-pointer text-[11px] font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={currentLayout.header?.showPhones !== false}
                    onChange={() => handleToggle('header', 'showPhones')}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                  />
                  <span>أرقام الهواتف</span>
                </label>

                <label className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-lg border border-stone-200 cursor-pointer text-[11px] font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={currentLayout.header?.showAddress !== false}
                    onChange={() => handleToggle('header', 'showAddress')}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                  />
                  <span>العنوان</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 2. CUSTOMER & RESERVATION INSPECTOR */}
        {selectedElement === 'customer' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-warm-200 pb-2">
              <span className="font-black text-xs text-brand-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand-800" />
                <span>تخصيص بيانات الزبون وتفاصيل الفاتورة (Customer & Meta)</span>
              </span>
              <span className="bg-brand-50 text-brand-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-brand-200">
                الحجم: {currentLayout.customer?.fontSize || 15}px
              </span>
            </div>

            {/* Font Size & Bold */}
            <div className="bg-warm-50/60 p-3 rounded-xl border border-warm-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">حجم خط اسم الزبون والبيانات:</span>
                <span className="font-mono font-black text-brand-900 text-xs">
                  {currentLayout.customer?.fontSize || 15} px
                </span>
              </div>
              <input
                type="range"
                min={12}
                max={22}
                step={1}
                value={currentLayout.customer?.fontSize || 15}
                onChange={(e) => handleUpdate('customer', 'fontSize', Number(e.target.value))}
                className="w-full accent-brand-800 cursor-pointer"
              />

              <div className="pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={currentLayout.customer?.bold !== false}
                    onChange={() => handleToggle('customer', 'bold')}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
                  />
                  <span>خط عريض وبارز (Bold) لاسم الزبون ورقم الهاتف</span>
                </label>
              </div>
            </div>

            {/* Visibility Toggles */}
            <div className="space-y-2">
              <span className="block text-[11px] font-bold text-stone-700">
                الحقول المعروضة في بطاقة الزبون:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={currentLayout.customer?.showPhone !== false}
                    onChange={() => handleToggle('customer', 'showPhone')}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                  />
                  <span>إظهار رقم هاتف الزبون</span>
                </label>

                <label className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={currentLayout.customer?.showAddress !== false}
                    onChange={() => handleToggle('customer', 'showAddress')}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                  />
                  <span>إظهار عنوان وتفاصيل التوصيل</span>
                </label>

                <label className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={currentLayout.customer?.showPickupTime !== false}
                    onChange={() => handleToggle('customer', 'showPickupTime')}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                  />
                  <span>إظهار موعد وتاريخ الاستلام للشيف</span>
                </label>

                <label className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={currentLayout.customer?.showWorker !== false}
                    onChange={() => handleToggle('customer', 'showWorker')}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                  />
                  <span>إظهار اسم الكاشير / الموظف المسجل</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 3. ITEMS TABLE INSPECTOR */}
        {selectedElement === 'itemsTable' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-warm-200 pb-2">
              <span className="font-black text-xs text-brand-900 flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4 text-brand-800" />
                <span>تخصيص جدول الأصناف والأسعار (Items & Table)</span>
              </span>
              <span className="bg-brand-50 text-brand-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-brand-200">
                الصنف: {currentLayout.itemsTable?.itemNameSize || 15}px • السعر: {currentLayout.itemsTable?.itemPriceSize || 14}px
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Item Name Size */}
              <div className="bg-warm-50/60 p-3 rounded-xl border border-warm-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700">حجم خط اسم الصنف:</span>
                  <span className="font-mono font-black text-brand-900 text-xs">
                    {currentLayout.itemsTable?.itemNameSize || 15} px
                  </span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={22}
                  step={1}
                  value={currentLayout.itemsTable?.itemNameSize || 15}
                  onChange={(e) => handleUpdate('itemsTable', 'itemNameSize', Number(e.target.value))}
                  className="w-full accent-brand-800 cursor-pointer"
                />
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-stone-700 pt-1">
                  <input
                    type="checkbox"
                    checked={currentLayout.itemsTable?.itemNameBold !== false}
                    onChange={() => handleToggle('itemsTable', 'itemNameBold')}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                  />
                  <span>اسم الصنف عريض (Bold)</span>
                </label>
              </div>

              {/* Price / Qty Size */}
              <div className="bg-warm-50/60 p-3 rounded-xl border border-warm-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700">حجم خط الأسعار والكميات:</span>
                  <span className="font-mono font-black text-brand-900 text-xs">
                    {currentLayout.itemsTable?.itemPriceSize || 14} px
                  </span>
                </div>
                <input
                  type="range"
                  min={11}
                  max={20}
                  step={1}
                  value={currentLayout.itemsTable?.itemPriceSize || 14}
                  onChange={(e) => handleUpdate('itemsTable', 'itemPriceSize', Number(e.target.value))}
                  className="w-full accent-brand-800 cursor-pointer"
                />
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-stone-700 pt-1">
                  <input
                    type="checkbox"
                    checked={currentLayout.itemsTable?.itemPriceBold !== false}
                    onChange={() => handleToggle('itemsTable', 'itemPriceBold')}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                  />
                  <span>الأرقام والأسعار عريضة (Bold)</span>
                </label>
              </div>
            </div>

            {/* Row Padding / Compactness */}
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
              <span className="block text-xs font-bold text-stone-700">
                تباعد الأسطر وضغط صفوف الجدول (Row Compactness):
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'compact', label: 'مضغوط (Compact)', desc: 'توفير أقصى للورق' },
                  { id: 'normal', label: 'متوازن (Normal)', desc: 'المظهر القياسي الأنيق' },
                  { id: 'relaxed', label: 'متباعد (Relaxed)', desc: 'مسافات واسعة ومريحة' },
                ].map((p) => {
                  const isSelected = (currentLayout.itemsTable?.rowPadding || 'normal') === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleUpdate('itemsTable', 'rowPadding', p.id)}
                      className={`p-2 rounded-xl border text-right transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-800 bg-brand-50 text-brand-950 font-black shadow-2xs ring-1 ring-brand-800'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="font-bold text-xs">{p.label}</div>
                      <div className="text-[10px] text-stone-500">{p.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Show Discounts */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={currentLayout.itemsTable?.showDiscounts !== false}
                  onChange={() => handleToggle('itemsTable', 'showDiscounts')}
                  className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                />
                <span>إظهار سطر الخصم تحت الصنف إذا كان عليه تخفيض</span>
              </label>
            </div>
          </div>
        )}

        {/* 4. NOTES & INSCRIPTION INSPECTOR */}
        {selectedElement === 'notesBlock' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-warm-200 pb-2">
              <span className="font-black text-xs text-brand-900 flex items-center gap-1.5">
                <FileSignature className="w-4 h-4 text-brand-800" />
                <span>تخصيص عبارة الكيك والملاحظات (Notes & Inscriptions)</span>
              </span>
              <span className="bg-brand-50 text-brand-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-brand-200">
                الحجم: {currentLayout.notesBlock?.fontSize || 12}px
              </span>
            </div>

            {/* Font Size & Bold */}
            <div className="bg-warm-50/60 p-3 rounded-xl border border-warm-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">حجم خط الملاحظات والنكهات:</span>
                <span className="font-mono font-black text-brand-900 text-xs">
                  {currentLayout.notesBlock?.fontSize || 12} px
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={18}
                step={1}
                value={currentLayout.notesBlock?.fontSize || 12}
                onChange={(e) => handleUpdate('notesBlock', 'fontSize', Number(e.target.value))}
                className="w-full accent-brand-800 cursor-pointer"
              />

              <div className="pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={currentLayout.notesBlock?.bold !== false}
                    onChange={() => handleToggle('notesBlock', 'bold')}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
                  />
                  <span>تباين داكن وخط عريض للشيف (High Contrast Bold)</span>
                </label>
              </div>
            </div>

            {/* Visibility Toggles */}
            <div className="space-y-2">
              <span className="block text-[11px] font-bold text-stone-700">
                أقسام الملاحظات المعروضة في الوصولات وبون المعمل:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={currentLayout.notesBlock?.showWrittenText !== false}
                    onChange={() => handleToggle('notesBlock', 'showWrittenText')}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                  />
                  <span>إظهار عبارة الكيك المكتوبة بالكريمة</span>
                </label>

                <label className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={currentLayout.notesBlock?.showFlavor !== false}
                    onChange={() => handleToggle('notesBlock', 'showFlavor')}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                  />
                  <span>إظهار نكهة وحشوة الكيك</span>
                </label>

                <label className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={currentLayout.notesBlock?.showDesign !== false}
                    onChange={() => handleToggle('notesBlock', 'showDesign')}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                  />
                  <span>إظهار تفاصيل شكل وتصميم القالب</span>
                </label>

                <label className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={currentLayout.notesBlock?.showChefNotes !== false}
                    onChange={() => handleToggle('notesBlock', 'showChefNotes')}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                  />
                  <span>إظهار ملاحظات الشيف والمعمل</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 5. TOTALS BOX INSPECTOR */}
        {selectedElement === 'totalsBox' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-warm-200 pb-2">
              <span className="font-black text-xs text-brand-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-brand-800" />
                <span>تخصيص صندوق المجاميع والأسعار (Totals Box)</span>
              </span>
              <span className="bg-brand-50 text-brand-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-brand-200">
                الحجم: {currentLayout.totalsBox?.fontSize || 14}px
              </span>
            </div>

            {/* Font Size & Bold */}
            <div className="bg-warm-50/60 p-3 rounded-xl border border-warm-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">حجم خط المجموع الإجمالي:</span>
                <span className="font-mono font-black text-brand-900 text-xs">
                  {currentLayout.totalsBox?.fontSize || 14} px
                </span>
              </div>
              <input
                type="range"
                min={12}
                max={24}
                step={1}
                value={currentLayout.totalsBox?.fontSize || 14}
                onChange={(e) => handleUpdate('totalsBox', 'fontSize', Number(e.target.value))}
                className="w-full accent-brand-800 cursor-pointer"
              />

              <div className="pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={currentLayout.totalsBox?.bold !== false}
                    onChange={() => handleToggle('totalsBox', 'bold')}
                    className="w-4 h-4 text-brand-800 accent-brand-800 rounded cursor-pointer"
                  />
                  <span>عريض جداً للأرقام والمبالغ (Extra Bold)</span>
                </label>
              </div>
            </div>

            {/* Border Style Buttons */}
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
              <span className="block text-xs font-bold text-stone-700">
                إطار وحدود صندوق المجموع (Border Styling):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'solid', label: 'خط مستمر (───)', desc: 'الافتراضي القياسي' },
                  { id: 'double', label: 'خط مزدوج (═══)', desc: 'بارز وفخم' },
                  { id: 'dashed', label: 'خط متقطع (---)', desc: 'مظهر حراري كلاسيكي' },
                  { id: 'none', label: 'بدون إطار', desc: 'بسيط وخالٍ من الحدود' },
                ].map((b) => {
                  const isSelected = (currentLayout.totalsBox?.borderStyle || 'solid') === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleUpdate('totalsBox', 'borderStyle', b.id)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-800 bg-brand-50 text-brand-950 font-black shadow-2xs ring-1 ring-brand-800'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="font-bold text-xs">{b.label}</div>
                      <div className="text-[9.5px] text-stone-500">{b.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alignment & Subtotal Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <label className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 cursor-pointer text-xs font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={currentLayout.totalsBox?.showSubtotal !== false}
                  onChange={() => handleToggle('totalsBox', 'showSubtotal')}
                  className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                />
                <span>إظهار المجموع الفرعي قبل الخصومات</span>
              </label>

              <label className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 cursor-pointer text-xs font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={currentLayout.totalsBox?.showDiscounts !== false}
                  onChange={() => handleToggle('totalsBox', 'showDiscounts')}
                  className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                />
                <span>إظهار سطور الخصم والتوصيل في المجموع</span>
              </label>
            </div>
          </div>
        )}

        {/* 6. DIVIDERS & SEPARATORS INSPECTOR */}
        {selectedElement === 'dividers' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-warm-200 pb-2">
              <span className="font-black text-xs text-brand-900 flex items-center gap-1.5">
                <Minus className="w-4 h-4 text-brand-800" />
                <span>تخصيص نمط الخطوط الفاصلة (Dividers & Lines)</span>
              </span>
              <span className="bg-brand-50 text-brand-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-brand-200">
                النمط: {currentLayout.dividers?.style || 'dashed'}
              </span>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2.5">
              <span className="block text-xs font-bold text-stone-700">
                اختر شكل الخطوط الفاصلة بين أقسام الوصل:
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  {
                    id: 'dashed',
                    label: 'متقطع (---)',
                    desc: 'توفير لحرارة الرأس الحراري والورق',
                    sample: '- - - - - - - - - - - - - -',
                  },
                  {
                    id: 'solid',
                    label: 'مستمر (───)',
                    desc: 'خط أسود أنيق ومستمر',
                    sample: '───────────────────',
                  },
                  {
                    id: 'double',
                    label: 'مزدوج (═══)',
                    desc: 'خطان متوازيان لمظهر ملكي',
                    sample: '═══════════════════',
                  },
                  {
                    id: 'none',
                    label: 'بدون فواصل',
                    desc: 'إخفاء الخطوط لتقليل طول الوصل',
                    sample: '(مساحة بيضاء نظيفة)',
                  },
                ].map((d) => {
                  const isSelected = (currentLayout.dividers?.style || 'dashed') === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleUpdate('dividers', 'style', d.id)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-800 bg-brand-50 text-brand-950 font-black shadow-2xs ring-1 ring-brand-800'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="font-bold text-xs">{d.label}</div>
                      <div className="text-[11px] font-mono font-bold text-stone-900 py-1">{d.sample}</div>
                      <div className="text-[9.5px] text-stone-500">{d.desc}</div>
                    </button>
                  );
                })}
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px] flex items-start gap-1.5 mt-2">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span>
                  نصيحة: الخط المتقطع (Dashed) هو الخيار الأفضل للطابعات الحرارية لأنه يقلل الإجهاد الحراري على رأس الطباعة، بينما الخط المستمر (Solid) يعطي مظهراً كلاسيكياً واضحاً.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 7. FOOTER & BARCODE INSPECTOR */}
        {selectedElement === 'footer' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-warm-200 pb-2">
              <span className="font-black text-xs text-brand-900 flex items-center gap-1.5">
                <Barcode className="w-4 h-4 text-brand-800" />
                <span>تخصيص تذييل الوصل والباركود (Footer & Barcode)</span>
              </span>
              <span className="bg-brand-50 text-brand-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-brand-200">
                الحجم: {currentLayout.footer?.fontSize || 10}px
              </span>
            </div>

            {/* Footer Text Area */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                عبارة التذييل والشكر في نهاية الوصل:
              </label>
              <textarea
                rows={2}
                value={currentLayout.footer?.noteText || ''}
                onChange={(e) => handleUpdate('footer', 'noteText', e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>

            {/* Font Size Slider */}
            <div className="bg-warm-50/60 p-3 rounded-xl border border-warm-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">حجم خط عبارة التذييل:</span>
                <span className="font-mono font-black text-brand-900 text-xs">
                  {currentLayout.footer?.fontSize || 10} px
                </span>
              </div>
              <input
                type="range"
                min={8}
                max={14}
                step={1}
                value={currentLayout.footer?.fontSize || 10}
                onChange={(e) => handleUpdate('footer', 'fontSize', Number(e.target.value))}
                className="w-full accent-brand-800 cursor-pointer"
              />
            </div>

            {/* Visibility Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 cursor-pointer text-xs font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={currentLayout.footer?.showNote !== false}
                  onChange={() => handleToggle('footer', 'showNote')}
                  className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                />
                <span>إظهار عبارة الشكر</span>
              </label>

              <label className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 cursor-pointer text-xs font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={currentLayout.footer?.showBarcode !== false}
                  onChange={() => handleToggle('footer', 'showBarcode')}
                  className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                />
                <span>إظهار كود الباركود</span>
              </label>

              <label className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 cursor-pointer text-xs font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={currentLayout.footer?.showBrandCredits !== false}
                  onChange={() => handleToggle('footer', 'showBrandCredits')}
                  className="w-4 h-4 text-brand-800 accent-brand-800 rounded"
                />
                <span>إظهار هاتف المحل بالتذييل</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
