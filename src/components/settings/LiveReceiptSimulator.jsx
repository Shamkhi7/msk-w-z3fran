import React, { useState } from 'react';
import { Eye, Cake, FileText, ChefHat, Sparkles } from 'lucide-react';
import {
  getReceiptTypography,
  getSalesReceiptTypography,
  getReservationReceiptTypography,
  getKitchenTicketTypography,
  getLogoFilter,
} from '../../utils/receiptTypographyHelper';

function InteractiveSection({ id, label, selected, onSelect, children, className = '' }) {
  const isSelected = selected === id;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect(id);
      }}
      className={`relative group cursor-pointer transition-all duration-150 rounded-xs p-1 ${
        isSelected
          ? 'ring-2 ring-brand-800 bg-brand-50/30 shadow-xs'
          : 'hover:ring-2 hover:ring-dashed hover:ring-blue-500 hover:bg-blue-50/15'
      } ${className}`}
    >
      {/* Floating Section Tag Pill */}
      <div
        className={`absolute -top-2.5 left-2 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs transition-opacity select-none ${
          isSelected
            ? 'opacity-100 bg-brand-800 text-white font-black'
            : 'opacity-0 group-hover:opacity-100 bg-blue-600 text-white'
        }`}
      >
        {isSelected ? `مُحدد: ${label} ✏️` : `انقر لتعديل: ${label}`}
      </div>
      {children}
    </div>
  );
}

function InteractiveDivider({ typo, selected, onSelect }) {
  const isSelected = selected === 'dividers';
  const dividerStyle = typo.layout?.dividers?.style || 'dashed';

  if (dividerStyle === 'none') {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (onSelect) onSelect('dividers');
        }}
        className={`my-1 py-0.5 cursor-pointer text-center text-[9px] text-stone-400 border border-dashed border-stone-200 rounded transition-all ${
          isSelected ? 'ring-2 ring-brand-800 bg-brand-50/40 text-brand-900 font-bold' : 'hover:ring-1 hover:ring-blue-400'
        }`}
        title="انقر لتعديل نمط الفواصل"
      >
        (الفواصل مخفية - انقر لتفعيلها ➖)
      </div>
    );
  }

  let borderStyleCss = 'dashed';
  let borderWidthCss = '2px';
  if (dividerStyle === 'solid') {
    borderStyleCss = 'solid';
    borderWidthCss = '2px';
  } else if (dividerStyle === 'double') {
    borderStyleCss = 'double';
    borderWidthCss = '4px';
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect('dividers');
      }}
      style={{
        borderBottomWidth: borderWidthCss,
        borderBottomStyle: borderStyleCss,
        borderColor: '#000000',
      }}
      className={`my-1.5 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-brand-800 bg-brand-50/50' : 'hover:ring-2 hover:ring-blue-400 hover:ring-dashed'
      }`}
      title="انقر لتعديل نمط الفواصل"
    />
  );
}

export function LiveReceiptSimulator({
  storeSettings,
  selectedElement,
  onSelectElement,
  activeTicketType: controlledTicketType,
  onTicketTypeChange,
}) {
  const [internalTicketType, setInternalTicketType] = useState('cake_reservation'); // 'cake_reservation' | 'sale_invoice' | 'kitchen_ticket'
  const activeTicketType = controlledTicketType || internalTicketType;

  const handleTicketTypeChange = (newType) => {
    if (onTicketTypeChange) {
      onTicketTypeChange(newType);
    } else {
      setInternalTicketType(newType);
    }
  };

  const salesTypo = getSalesReceiptTypography(storeSettings);
  const salesCfg = salesTypo.config;

  const resTypo = getReservationReceiptTypography(storeSettings);
  const resCfg = resTypo.config;

  const kitTypo = getKitchenTicketTypography(storeSettings);
  const kitCfg = kitTypo.config;

  const activeTypo =
    activeTicketType === 'sale_invoice'
      ? salesTypo
      : activeTicketType === 'kitchen_ticket'
      ? kitTypo
      : resTypo;

  const typo = getReceiptTypography(storeSettings, activeTicketType);
  const layout = typo.layout;

  // Header alignment helper
  const headerAlignClass = layout.header?.align === 'right' ? 'text-right' : 'text-center';

  // Totals Box border style helper
  const getTotalsBorderInlineStyle = () => {
    const style = layout.totalsBox?.borderStyle || 'solid';
    if (style === 'none') return { border: 'none' };
    if (style === 'double') return { border: '4px double #000000' };
    if (style === 'dashed') return { border: '2px dashed #000000' };
    return { border: '2px solid #000000' };
  };

  return (
    <div className="flex flex-col h-full bg-stone-100/90 rounded-2xl border border-stone-300 shadow-sm overflow-hidden select-none">
      {/* Simulator Top Control Bar */}
      <div className="p-3 bg-stone-900 text-white flex flex-col gap-2 border-b border-stone-800 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-gold-400" />
            <h4 className="font-bold text-xs tracking-wide text-white">
              محاكي رول الورق الحراري (Live 80mm Preview)
            </h4>
          </div>
          <span className="bg-brand-900 text-gold-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-gold-500/30">
            رول 80mm • طباعة 72.1mm
          </span>
        </div>

        {/* Ticket Type Switcher Chips */}
        <div className="grid grid-cols-3 gap-1 bg-stone-950 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => handleTicketTypeChange('sale_invoice')}
            className={`py-1 px-1.5 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTicketType === 'sale_invoice'
                ? 'bg-brand-800 text-white shadow-xs font-black'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <FileText className="w-3 h-3 text-gold-400 shrink-0" />
            <span className="truncate">وصل بيع كاش</span>
          </button>

          <button
            type="button"
            onClick={() => handleTicketTypeChange('cake_reservation')}
            className={`py-1 px-1.5 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTicketType === 'cake_reservation'
                ? 'bg-brand-800 text-white shadow-xs font-black'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Cake className="w-3 h-3 text-gold-400 shrink-0" />
            <span className="truncate">وصل حجز كيك</span>
          </button>

          <button
            type="button"
            onClick={() => handleTicketTypeChange('kitchen_ticket')}
            className={`py-1 px-1.5 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTicketType === 'kitchen_ticket'
                ? 'bg-brand-800 text-white shadow-xs font-black'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <ChefHat className="w-3 h-3 text-gold-400 shrink-0" />
            <span className="truncate">بون المعمل</span>
          </button>
        </div>
      </div>

      {/* Dynamic Live Measurement Badge */}
      <div className="px-3 py-1.5 bg-stone-200 border-b border-stone-300 text-[10.5px] text-stone-700 flex flex-wrap items-center justify-between gap-1 shrink-0">
        {activeTicketType === 'sale_invoice' ? (
          <>
            <span className="font-mono font-bold text-brand-900">
              الترويسة: {salesCfg.storeHeaderSize || 20}px
            </span>
            <span className="text-stone-400">•</span>
            <span className="font-mono font-bold text-brand-900">
              الأصناف: {salesCfg.itemNameSize || 15}px
            </span>
            <span className="text-stone-400">•</span>
            <span className="font-mono font-bold text-brand-900">
              الأسعار: {salesCfg.priceSize || 14}px
            </span>
            <span className="text-stone-400">•</span>
            <span className="font-mono font-bold text-brand-900">
              المجاميع: {salesCfg.totalsSize || 15}px
            </span>
          </>
        ) : activeTicketType === 'kitchen_ticket' ? (
          <>
            <span className="font-mono font-bold text-brand-900">
              رقم الحجز: {kitCfg.manualTicketSize || 24}px
            </span>
            <span className="text-stone-400">•</span>
            <span className="font-mono font-bold text-brand-900">
              موعد التسليم: {kitCfg.pickupBannerSize || 18}px
            </span>
            <span className="text-stone-400">•</span>
            <span className="font-mono font-bold text-brand-900">
              النكهات: {kitCfg.specsAndNotesSize || 14}px
            </span>
            <span className="text-stone-400">•</span>
            <span className="font-mono font-bold text-brand-900">
              العبارة: {kitCfg.inscriptionSize || 18}px
            </span>
          </>
        ) : (
          <>
            <span className="font-mono font-bold text-brand-900">
              الترويسة: {resCfg.storeHeaderSize || 19}px
            </span>
            <span className="text-stone-400">•</span>
            <span className="font-mono font-bold text-brand-900">
              الزبون: {resCfg.customerDetailsSize || 15}px
            </span>
            <span className="text-stone-400">•</span>
            <span className="font-mono font-bold text-brand-900">
              عبارة الكيك: {resCfg.inscriptionSize || 16}px
            </span>
            <span className="text-stone-400">•</span>
            <span className="font-mono font-bold text-brand-900">
              المتبقي: {resCfg.remainingBalanceSize || 18}px
            </span>
          </>
        )}
      </div>

      {/* Simulator Paper Viewport Area */}
      <div className="flex-1 overflow-y-auto p-4 flex justify-center items-start bg-stone-200/80">
        {/* Physical Paper Simulation Card */}
        <div
          className="bg-white text-black shadow-2xl rounded-xs border border-stone-300 p-2 select-text"
          style={{
            ...activeTypo.containerStyle,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Paper Top Serrated Cut Mockup */}
          <div className="border-b-2 border-dashed border-black/40 pb-1 mb-2 text-center text-[9px] text-stone-500 font-mono select-none">
            - - - - - - - - - - بداية رول الورق 80mm - - - - - - - - - -
          </div>

          {/* 1. STORE HEADER (INTERACTIVE) */}
          <InteractiveSection
            id="header"
            label="الترويسة واسم المحل"
            selected={selectedElement}
            onSelect={onSelectElement}
            className={headerAlignClass}
          >
            <div className="space-y-0.5">
              {/* Store Logo with Thermal Contrast Dithering Filter */}
              {((activeTicketType === 'sale_invoice' && salesCfg.showLogo !== false) ||
                (activeTicketType === 'cake_reservation' && resCfg.showLogo !== false) ||
                (activeTicketType === 'kitchen_ticket' && kitCfg.showLogo === true)) && (
                <div className="flex justify-center mb-1">
                  <img
                    src={storeSettings.logo || './logo.png'}
                    alt="Logo"
                    style={{
                      filter: getLogoFilter(
                        activeTicketType === 'sale_invoice'
                          ? salesCfg.logoContrast || 160
                          : activeTicketType === 'cake_reservation'
                          ? resCfg.logoContrast || 160
                          : kitCfg.logoContrast || 160
                      ),
                      maxHeight: `${
                        activeTicketType === 'sale_invoice'
                          ? salesCfg.logoSize || 48
                          : activeTicketType === 'cake_reservation'
                          ? resCfg.logoSize || 48
                          : kitCfg.logoSize || 48
                      }px`,
                    }}
                    className="max-w-[120px] object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              )}

              <div
                style={{
                  fontSize: `${
                    activeTicketType === 'sale_invoice'
                      ? salesCfg.storeHeaderSize || 20
                      : activeTicketType === 'cake_reservation'
                      ? resCfg.storeHeaderSize || 19
                      : 19
                  }}px`,
                  fontWeight: layout.header?.bold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                  lineHeight: 1.15,
                }}
                className="text-black tracking-wide"
              >
                {layout.header?.storeNameAr || storeSettings.storeNameAr || 'مسك وزعفران'}
              </div>

              {layout.header?.showStoreNameEn !== false && (
                <div
                  style={{
                    fontSize: `${activeTypo.sizes.sub}px`,
                    fontWeight: activeTypo.weightCss,
                  }}
                  className="text-black tracking-wider"
                >
                  {layout.header?.storeNameEn || storeSettings.storeNameEn || 'Meska & Zafran'}
                </div>
              )}

              {layout.header?.showTagline !== false && (
                <div
                  style={{
                    fontSize: `${activeTypo.sizes.small}px`,
                  }}
                  className="text-black font-semibold"
                >
                  {layout.header?.tagline || storeSettings.tagline || 'للحلويات الملكية وقوالب الكيك الفاخرة'}
                </div>
              )}

              {layout.header?.showPhones !== false && (
                <div
                  style={{
                    fontSize: `${activeTypo.sizes.small}px`,
                  }}
                  className="font-mono font-bold text-black"
                >
                  {layout.header?.phone || storeSettings.phone || '0770 123 4567'}
                  {layout.header?.phone2 && ` | ${layout.header.phone2}`}
                </div>
              )}

              {layout.header?.showAddress !== false && (
                <div
                  style={{
                    fontSize: `${activeTypo.sizes.small}px`,
                  }}
                  className="text-black"
                >
                  {layout.header?.address || storeSettings.address || 'شارع الزهور - مقابل المجمع التجاري'}
                </div>
              )}
            </div>
          </InteractiveSection>

          {/* DIVIDER AFTER HEADER */}
          <InteractiveDivider typo={activeTypo} selected={selectedElement} onSelect={onSelectElement} />

          {/* ======================================================== */}
          {/* TICKET TYPE 1: CAKE RESERVATION SIMULATION               */}
          {/* ======================================================== */}
          {activeTicketType === 'cake_reservation' && (
            <div className="space-y-1.5 py-1">
              {/* Ticket Banner */}
              <div
                style={{
                  fontSize: `${resCfg.customerNameSize || 16}px`,
                  fontWeight: activeTypo.blackWeightCss,
                }}
                className="border-2 border-black p-1 text-center bg-white"
              >
                {resCfg.ticketTitle || 'وصل حجز وتثبيت طلبية كيك'}
              </div>

              {/* Manual Ticket Box */}
              <div className="border-2 border-black p-1 text-center bg-white space-y-0.5">
                <span style={{ fontSize: `${activeTypo.sizes.small}px` }} className="font-bold block">
                  {resCfg.manualTicketLabel || 'رقم الحجز اليدوي:'}
                </span>
                <span
                  style={{
                    fontSize: `${resCfg.manualTicketSize || 22}px`,
                    fontWeight: resCfg.manualTicketBold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                  }}
                  className="font-mono block leading-none"
                >
                  #104
                </span>
              </div>

              {/* 2. CUSTOMER & RESERVATION INFO (INTERACTIVE) */}
              <InteractiveSection
                id="customer"
                label="بيانات الزبون والحجز"
                selected={selectedElement}
                onSelect={onSelectElement}
              >
                <div style={{ fontSize: `${activeTypo.sizes.sub}px` }} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold">{resCfg.customerLabel || 'اسم الزبون:'}</span>
                    <span
                      style={{
                        fontSize: `${resCfg.customerNameSize || 16}px`,
                        fontWeight: resCfg.customerNameBold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                      }}
                    >
                      أم مريم الجبوري
                    </span>
                  </div>

                  {resCfg.showCustomerPhone !== false && (
                    <div className="flex justify-between items-baseline">
                      <span>{resCfg.phoneLabel || 'رقم الهاتف:'}</span>
                      <span
                        className="font-mono font-bold"
                        style={{
                          fontSize: `${resCfg.customerPhoneSize || 14}px`,
                          fontWeight: resCfg.customerPhoneBold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                        }}
                      >
                        0771 555 4321
                      </span>
                    </div>
                  )}

                  {resCfg.showWorkerName !== false && (
                    <div className="flex justify-between">
                      <span>{resCfg.workerLabel || 'الموظف المسجل:'}</span>
                      <span className="font-bold">أحمد الشمري</span>
                    </div>
                  )}

                  {resCfg.showPickupDateTime !== false && (
                    <div className="border-2 border-black p-1 text-center mt-1">
                      <span style={{ fontSize: `${activeTypo.sizes.small}px` }} className="block font-bold">
                        {resCfg.pickupHeaderLabel || 'موعد الاستلام:'}
                      </span>
                      <span
                        style={{
                          fontSize: `${resCfg.pickupBannerSize || 17}px`,
                          fontWeight: resCfg.pickupBannerBold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                        }}
                        className="block"
                      >
                        الجمعة 2026/10/16 - 06:30 م
                      </span>
                    </div>
                  )}

                  {resCfg.showDeliveryAddress !== false && (
                    <div className="flex justify-between text-[11px] pt-0.5 text-stone-700">
                      <span>التوصيل:</span>
                      <span>بغداد - المنصور (توصيل خارجي)</span>
                    </div>
                  )}
                </div>
              </InteractiveSection>

              <InteractiveDivider typo={activeTypo} selected={selectedElement} onSelect={onSelectElement} />

              {/* 3. CAKE SPECIFICATIONS & NOTES (INTERACTIVE) */}
              <InteractiveSection
                id="notesBlock"
                label="العبارة والمواصفات والملاحظات"
                selected={selectedElement}
                onSelect={onSelectElement}
              >
                <div className="space-y-1.5">
                  <div
                    className="border-2 border-black px-2 py-0.5 flex justify-between items-center"
                    style={{
                      fontSize: `${(resCfg.specsSize || 12) + 2}px`,
                      fontWeight: activeTypo.blackWeightCss,
                    }}
                  >
                    <span>مواصفات قالب الكيك:</span>
                    <span>قياس 2 (10-12 شخص)</span>
                  </div>

                  {/* Custom Written Text */}
                  {resCfg.showWrittenText !== false && (
                    <div className="border-2 border-black p-1.5 text-center bg-stone-50">
                      <span style={{ fontSize: `${activeTypo.sizes.small}px` }} className="font-bold block">
                        {resCfg.inscriptionLabel || 'العبارة المطلوبة على الكيك:'}
                      </span>
                      <span
                        style={{
                          fontSize: `${resCfg.inscriptionSize || 16}px`,
                          fontWeight: resCfg.inscriptionBold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                        }}
                        className="block font-serif text-black leading-tight pt-0.5"
                      >
                        "كل عام وأنتِ نور عيني مريم"
                      </span>
                    </div>
                  )}

                  {/* Flavor & Specs */}
                  <div
                    style={{
                      fontSize: `${resCfg.specsSize || 12}px`,
                      fontWeight: resCfg.specsBold !== false ? activeTypo.weightCss : 'normal',
                    }}
                    className="space-y-0.5"
                  >
                    {resCfg.showFlavor !== false && (
                      <div>
                        <span className="font-bold">{resCfg.flavorLabel || 'نكهة وحشوة الكيك:'} </span>
                        <span>فانيلا فرنسية مع فراولة طبيعية وغناش بلجيكي</span>
                      </div>
                    )}

                    {resCfg.showDesign !== false && (
                      <div>
                        <span className="font-bold">{resCfg.designLabel || 'تفاصيل وتصميم الشكل:'} </span>
                        <span>كيكة بيضاء مع أزهار طبيعية ولمسات ورق الذهب</span>
                      </div>
                    )}

                    {resCfg.showChefNotes !== false && (
                      <div className="p-1 bg-stone-100 border border-stone-300 rounded text-black mt-1">
                        <span className="font-bold">ملاحظة المعمل: </span>
                        <span>تجهيز بوكس هدايا شفاف مع شريط عنابي فاخر</span>
                      </div>
                    )}
                  </div>
                </div>
              </InteractiveSection>

              <InteractiveDivider typo={activeTypo} selected={selectedElement} onSelect={onSelectElement} />

              {/* 4. TOTALS SECTION (INTERACTIVE) */}
              <InteractiveSection
                id="totalsBox"
                label="صندوق المجاميع والإجمالي"
                selected={selectedElement}
                onSelect={onSelectElement}
              >
                <div
                  style={{
                    fontSize: `${resCfg.depositSize || 14}px`,
                    ...getTotalsBorderInlineStyle(),
                  }}
                  className="space-y-1.5 p-1.5"
                >
                  <div className="flex justify-between">
                    <span>المبلغ الكلي للطلب:</span>
                    <span className="font-mono font-bold">35,000 د.ع</span>
                  </div>

                  {/* Deposit Paid Row */}
                  <div
                    style={{
                      fontSize: `${resCfg.depositSize || 15}px`,
                    }}
                    className={`flex justify-between items-center ${
                      resCfg.highlightDeposit ? 'bg-amber-50 p-1 border border-black rounded-xs' : ''
                    }`}
                  >
                    <span>العربون المستلم (كاش):</span>
                    <span className="font-mono font-bold text-emerald-800">15,000 د.ع</span>
                  </div>

                  {/* Remaining Balance Row */}
                  <div
                    className={`flex justify-between items-baseline pt-1 border-t-2 border-black ${
                      resCfg.highlightRemaining ? 'bg-stone-100 p-1 mt-1 border-2 border-black rounded-xs' : ''
                    }`}
                    style={{
                      fontSize: `${resCfg.remainingBalanceSize || 18}px`,
                      fontWeight: activeTypo.blackWeightCss,
                    }}
                  >
                    <span>المتبقي عند الاستلام:</span>
                    <span className="font-mono" style={{ fontSize: `${resCfg.remainingBalanceSize || 18}px` }}>
                      20,000 د.ع
                    </span>
                  </div>
                </div>
              </InteractiveSection>
            </div>
          )}

          {/* ======================================================== */}
          {/* TICKET TYPE 2: DIRECT SALE INVOICE SIMULATION            */}
          {/* ======================================================== */}
          {activeTicketType === 'sale_invoice' && (
            <div className="space-y-1.5 py-1">
              {salesCfg.ticketTitle && (
                <div
                  style={{
                    fontSize: `${activeTypo.sizes.body}px`,
                    fontWeight: activeTypo.blackWeightCss,
                  }}
                  className="border-2 border-black p-1 text-center bg-white"
                >
                  {salesCfg.ticketTitle}
                </div>
              )}
              {/* Meta Info (Customer Block) */}
              <InteractiveSection
                id="customer"
                label="بيانات الزبون والفاتورة"
                selected={selectedElement}
                onSelect={onSelectElement}
              >
                <div style={{ fontSize: `${activeTypo.sizes.sub}px` }} className="space-y-0.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold">رقم الفاتورة:</span>
                    <span
                      style={{
                        fontSize: `${salesCfg.itemNameSize || 15}px`,
                        fontWeight: activeTypo.blackWeightCss,
                      }}
                      className="font-mono"
                    >
                      INV-2026-1048
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>التاريخ والوقت:</span>
                    <span className="font-mono">2026/10/13 - 07:15 م</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold">{salesCfg.customerLabel || 'الزبون:'}</span>
                    <span
                      style={{
                        fontSize: `${salesCfg.customerNameSize || 14}px`,
                        fontWeight: salesCfg.customerNameBold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                      }}
                      className="font-bold"
                    >
                      زبون كاش مباشر
                    </span>
                  </div>
                  {layout.customer?.showWorker !== false && (
                    <div className="flex justify-between">
                      <span>{salesCfg.cashierLabel || 'الكاشير:'}</span>
                      <span className="font-bold">كاشير مسك 1</span>
                    </div>
                  )}
                  {salesCfg.showPaymentMethodBadge !== false ? (
                    <div className="flex justify-between items-center pt-0.5">
                      <span>طريقة الدفع:</span>
                      <span className="font-bold border border-black px-1.5 py-0.2 rounded text-[10.5px] bg-stone-50">
                        نقداً (كاش)
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span>طريقة الدفع:</span>
                      <span className="font-bold">نقداً (كاش)</span>
                    </div>
                  )}
                </div>
              </InteractiveSection>

              <InteractiveDivider typo={activeTypo} selected={selectedElement} onSelect={onSelectElement} />

              {/* Line Items Table (Interactive) */}
              <InteractiveSection
                id="itemsTable"
                label="جدول وقائمة الأصناف"
                selected={selectedElement}
                onSelect={onSelectElement}
              >
                <div>
                  <table className="w-full text-right" style={{ fontSize: `${activeTypo.sizes.sub}px` }}>
                    <thead>
                      <tr className="border-b-2 border-black font-black">
                        <th className="py-1 w-10 text-center">الكمية</th>
                        <th className="py-1 pr-1">الصنف</th>
                        <th className="py-1 text-center">السعر</th>
                        <th className="py-1 text-left">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      <tr>
                        <td
                          className="py-1 text-center font-mono font-bold"
                          style={{
                            fontSize: `${salesCfg.priceSize || 14}px`,
                            fontWeight: salesCfg.priceBold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                          }}
                        >
                          1
                        </td>
                        <td className="py-1 pr-1">
                          <div
                            style={{
                              fontSize: `${salesCfg.itemNameSize || 15}px`,
                              fontWeight: salesCfg.itemNameBold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                            }}
                          >
                            كيكة الزعفران الملكية
                          </div>
                          <div
                            style={{
                              fontSize: `${Math.max(10, (salesCfg.itemNameSize || 15) - 3)}px`,
                            }}
                            className="font-mono text-stone-600"
                          >
                            زعفران إيراني + كريمة الهيل
                          </div>
                        </td>
                        <td className="py-1 text-center font-mono" style={{ fontSize: `${salesCfg.priceSize || 14}px` }}>
                          32,000
                        </td>
                        <td
                          className="py-1 text-left font-mono"
                          style={{
                            fontSize: `${salesCfg.priceSize || 14}px`,
                            fontWeight: salesCfg.priceBold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                          }}
                        >
                          32,000
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="py-1 text-center font-mono font-bold"
                          style={{
                            fontSize: `${salesCfg.priceSize || 14}px`,
                            fontWeight: salesCfg.priceBold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                          }}
                        >
                          2
                        </td>
                        <td className="py-1 pr-1">
                          <div
                            style={{
                              fontSize: `${salesCfg.itemNameSize || 15}px`,
                              fontWeight: salesCfg.itemNameBold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                            }}
                          >
                            قدح موس كيك شوكولاتة
                          </div>
                          <div
                            style={{
                              fontSize: `${Math.max(10, (salesCfg.itemNameSize || 15) - 3)}px`,
                            }}
                            className="font-mono text-stone-600"
                          >
                            2 × 4,000 د.ع
                          </div>
                        </td>
                        <td className="py-1 text-center font-mono" style={{ fontSize: `${salesCfg.priceSize || 14}px` }}>
                          4,000
                        </td>
                        <td
                          className="py-1 text-left font-mono"
                          style={{
                            fontSize: `${salesCfg.priceSize || 14}px`,
                            fontWeight: salesCfg.priceBold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                          }}
                        >
                          8,000
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </InteractiveSection>

              <InteractiveDivider typo={activeTypo} selected={selectedElement} onSelect={onSelectElement} />

              {/* Grand Total Box (Interactive) */}
              <InteractiveSection
                id="totalsBox"
                label="صندوق المجاميع والإجمالي"
                selected={selectedElement}
                onSelect={onSelectElement}
              >
                <div
                  style={{
                    fontSize: `${salesCfg.totalsSize || 15}px`,
                    ...getTotalsBorderInlineStyle(),
                  }}
                  className="space-y-1 p-1.5"
                >
                  {salesCfg.showSubtotal !== false && (
                    <div className="flex justify-between">
                      <span>المجموع الفرعي:</span>
                      <span className="font-mono">40,000 د.ع</span>
                    </div>
                  )}
                  {salesCfg.showRoundingDiscount !== false && (
                    <div className="flex justify-between text-stone-800" style={{ fontSize: `${Math.max(10, (salesCfg.priceSize || 14) - 2)}px` }}>
                      <span>خصم تقريب الكاش (250 د.ع):</span>
                      <span className="font-mono font-bold">-250 د.ع</span>
                    </div>
                  )}
                  <div
                    className="flex justify-between items-baseline pt-1 border-t-2 border-black"
                    style={{
                      fontSize: `${Math.round((salesCfg.totalsSize || 15) * 1.25)}px`,
                      fontWeight: salesCfg.totalsBold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                    }}
                  >
                    <span>المجموع الكلي المطلوب:</span>
                    <span className="font-mono">{salesCfg.showRoundingDiscount !== false ? '39,750 د.ع' : '40,000 د.ع'}</span>
                  </div>
                </div>
              </InteractiveSection>
            </div>
          )}

          {/* ======================================================== */}
          {/* TICKET TYPE 3: KITCHEN PRODUCTION TICKET SIMULATION      */}
          {/* ======================================================== */}
          {activeTicketType === 'kitchen_ticket' && (
            <div className="space-y-1.5 py-1">
              <div
                style={{
                  fontSize: `${kitCfg.pickupBannerSize || 18}px`,
                  fontWeight: activeTypo.blackWeightCss,
                }}
                className="border-2 border-black p-1 text-center bg-white"
              >
                {kitCfg.ticketTitle || 'بون المعمل والإنتاج (للشيف)'}
              </div>

              {/* Big Manual Ticket Box */}
              <div className="border-2 border-black p-1.5 text-center bg-white space-y-0.5">
                <span style={{ fontSize: `${activeTypo.sizes.small}px` }} className="font-bold block">
                  {kitCfg.manualTicketLabel || 'رقم الحجز اليدوي:'}
                </span>
                <span
                  style={{
                    fontSize: `${kitCfg.manualTicketSize || 24}px`,
                    fontWeight: kitCfg.manualTicketBold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                  }}
                  className="font-mono block leading-none"
                >
                  #104
                </span>
              </div>

              <InteractiveSection
                id="customer"
                label="بيانات الزبون وموعد التحضير"
                selected={selectedElement}
                onSelect={onSelectElement}
              >
                <div style={{ fontSize: `${activeTypo.sizes.sub}px` }} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold">{kitCfg.customerLabel || 'الزبون:'}</span>
                    <span
                      style={{
                        fontSize: `${kitCfg.customerNameSize || 16}px`,
                        fontWeight: kitCfg.customerNameBold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                      }}
                    >
                      أم مريم الجبوري
                    </span>
                  </div>
                  {kitCfg.showCustomerPhone !== false && (
                    <div className="flex justify-between items-baseline">
                      <span>{kitCfg.phoneLabel || 'رقم الهاتف:'}</span>
                      <span
                        className="font-mono font-bold"
                        style={{
                          fontSize: `${kitCfg.customerPhoneSize || 14}px`,
                          fontWeight: kitCfg.customerPhoneBold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                        }}
                      >
                        0771 555 4321
                      </span>
                    </div>
                  )}
                  <div className="border-2 border-black p-1.5 text-center bg-white">
                    <span style={{ fontSize: `${activeTypo.sizes.small}px` }} className="block font-bold">
                      {kitCfg.pickupHeaderLabel || 'جاهز للتسليم للشيف في تمام:'}
                    </span>
                    <span
                      style={{
                        fontSize: `${kitCfg.pickupBannerSize || 18}px`,
                        fontWeight: kitCfg.pickupBannerBold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                      }}
                      className="block leading-tight"
                    >
                      الجمعة 06:30 مساءً
                    </span>
                  </div>
                </div>
              </InteractiveSection>

              <InteractiveDivider typo={activeTypo} selected={selectedElement} onSelect={onSelectElement} />

              {/* Cake Details For Baker */}
              <InteractiveSection
                id="notesBlock"
                label="تفاصيل القالب والنكهات للشيف"
                selected={selectedElement}
                onSelect={onSelectElement}
              >
                <div className="space-y-1.5">
                  <div
                    className="border-2 border-black px-2 py-1 text-center font-black"
                    style={{
                      fontSize: `${(kitCfg.specsAndNotesSize || 14) + 1}px`,
                    }}
                  >
                    قالب كيك دائري - قياس 2
                  </div>

                  {kitCfg.showWrittenText !== false && (
                    <div
                      className={`text-center ${
                        kitCfg.decoratedInscriptionFrame !== false
                          ? 'border-4 border-double border-black p-2 bg-stone-50'
                          : 'border-2 border-black p-1.5 bg-white'
                      }`}
                    >
                      <span style={{ fontSize: `${activeTypo.sizes.small}px` }} className="font-bold block underline">
                        {kitCfg.decoratedInscriptionFrame !== false
                          ? `${kitCfg.inscriptionLabel || 'العبارة المطلوبة بالكريمة'} (مطلوبة بدقة للشيف):`
                          : (kitCfg.inscriptionLabel || 'العبارة المطلوبة بالكريمة:')}
                      </span>
                      <span
                        style={{
                          fontSize: `${kitCfg.inscriptionSize || 18}px`,
                          fontWeight: kitCfg.inscriptionBold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                        }}
                        className="block font-serif text-black leading-tight pt-1"
                      >
                        "كل عام وأنتِ نور عيني مريم"
                      </span>
                    </div>
                  )}

                  <div
                    style={{
                      fontSize: `${kitCfg.specsAndNotesSize || 14}px`,
                      fontWeight: kitCfg.specsAndNotesBold !== false ? activeTypo.blackWeightCss : activeTypo.weightCss,
                    }}
                    className="space-y-1"
                  >
                    {kitCfg.showFlavor !== false && (
                      <div className="flex justify-between">
                        <span className="font-black">{kitCfg.flavorLabel || 'النكهة والحشوة:'}</span>
                        <span className="font-bold">فانيلا فرنسية مع فراولة طازجة وغناش بلجيكي</span>
                      </div>
                    )}
                    {kitCfg.showDesign !== false && (
                      <div className="flex justify-between">
                        <span className="font-black">{kitCfg.designLabel || 'التصميم والديكور:'}</span>
                        <span className="font-bold">تغطية كريمة بيضاء، أزهار طبيعية، ورق ذهب</span>
                      </div>
                    )}
                    {kitCfg.showChefNotes !== false && (
                      <div className="p-1 bg-stone-100 border border-stone-300 rounded text-black mt-1">
                        <span className="font-black">ملاحظة المعمل: </span>
                        <span>تجهيز بوكس هدايا شفاف مع شريط عنابي فاخر</span>
                      </div>
                    )}
                  </div>
                </div>
              </InteractiveSection>

              {/* End of Production Ticket Notice */}
              <div style={{ fontSize: `${activeTypo.sizes.small}px` }} className="pt-1.5 text-center font-bold text-black border-t border-dashed border-black">
                --- بون خاص بقسم الإنتاج والتحضير - لا يحتوي على مبالغ مالية ---
              </div>
            </div>
          )}

          {/* DIVIDER BEFORE FOOTER */}
          <InteractiveDivider typo={activeTypo} selected={selectedElement} onSelect={onSelectElement} />

          {/* 5. BARCODE & RECEIPT FOOTER (INTERACTIVE) */}
          <InteractiveSection
            id="footer"
            label="تذييل الوصل والباركود"
            selected={selectedElement}
            onSelect={onSelectElement}
          >
            <div className="pt-1 text-center space-y-1 text-black">
              {/* Barcode Display */}
              {activeTicketType === 'sale_invoice' && salesCfg.showBarcode !== false && (
                <div
                  className="inline-block border-2 border-black px-2 py-0.5 font-mono font-bold tracking-widest"
                  style={{ fontSize: `${activeTypo.sizes.crucial}px` }}
                >
                  *INV-2026-1048*
                </div>
              )}
              {activeTicketType === 'cake_reservation' && resCfg.showBarcode !== false && (
                <div
                  className="inline-block border-2 border-black px-2 py-0.5 font-mono font-bold tracking-widest"
                  style={{ fontSize: `${activeTypo.sizes.crucial}px` }}
                >
                  *RES-2026-104*
                </div>
              )}

              {/* Footer Note or Disclaimer */}
              {activeTicketType === 'sale_invoice' && (
                <div
                  style={{ fontSize: `${salesCfg.footerSize || 10}px` }}
                  className="font-bold text-black leading-snug"
                >
                  {salesCfg.footerMessage || storeSettings.receiptFooterNote || 'شكراً لاختياركم مسك وزعفران'}
                </div>
              )}
              {activeTicketType === 'cake_reservation' && resCfg.policyDisclaimer && (
                <div
                  style={{ fontSize: `${resCfg.footerSize || 10}px` }}
                  className="font-bold text-black leading-snug whitespace-pre-line"
                >
                  {resCfg.policyDisclaimer}
                </div>
              )}

              {/* Universal Brand Credits */}
              {((activeTicketType === 'sale_invoice' && salesCfg.showBrandCredits !== false) ||
                (activeTicketType === 'cake_reservation' && resCfg.showBrandCredits !== false) ||
                (activeTicketType === 'kitchen_ticket' && kitCfg.showBrandCredits !== false)) && (
                <div className="text-[9px] text-stone-500 font-sans pt-1 border-t border-dashed border-stone-300">
                  {layout.header?.storeNameAr || 'مسك وزعفران'} • هاتف: {layout.header?.phone || storeSettings.phone || '0770 123 4567'}
                </div>
              )}
            </div>
          </InteractiveSection>

          {/* Paper Bottom Serrated Cut Mockup */}
          <div className="border-t-2 border-dashed border-black/40 pt-1 mt-2 text-center text-[9px] text-stone-500 font-mono select-none">
            - - - - - - - - - - نهاية رول الورق 80mm - - - - - - - - - -
          </div>
        </div>
      </div>
    </div>
  );
}
