import {
  DEFAULT_RECEIPT_LAYOUT,
  DEFAULT_SALES_RECEIPT_CONFIG,
  DEFAULT_RESERVATION_RECEIPT_CONFIG,
  DEFAULT_KITCHEN_TICKET_CONFIG,
} from '../data/defaultData';

/**
 * receiptTypographyHelper.js
 * 
 * Provides unified, dynamic typography styles and calculations for 80mm thermal receipts.
 * Supports 3 completely isolated configurations:
 * 1. salesReceiptConfig (Direct Sales)
 * 2. reservationReceiptConfig (Customer Reservation)
 * 3. kitchenTicketConfig (Kitchen / Chef Ticket)
 * Strictly maintains 72.1mm printable boundaries to prevent horizontal clipping.
 */

export function getDividerClass(style = 'dashed') {
  if (style === 'solid') return 'border-b-2 border-solid border-black';
  if (style === 'double') return 'border-b-4 border-double border-black';
  if (style === 'none') return 'border-b-0 hidden';
  return 'border-b-2 border-dashed border-black';
}

export function getBorderClass(style = 'solid') {
  if (style === 'solid') return 'border-2 border-solid border-black';
  if (style === 'double') return 'border-4 border-double border-black';
  if (style === 'dashed') return 'border-2 border-dashed border-black';
  return 'border-0';
}

export function getLogoFilter(contrast = 160) {
  const c = Math.max(100, Math.min(300, Number(contrast) || 160));
  return `grayscale(100%) contrast(${c}%) brightness(95%)`;
}

function resolveThermalWeights(storeSettings) {
  const globalWeight = String(storeSettings?.receiptGlobalWeight || storeSettings?.receiptFontWeight || '700');
  let weightCss = '700';
  let blackWeightCss = '900';

  if (globalWeight === '500' || globalWeight === 'normal') {
    weightCss = '500';
    blackWeightCss = '700';
  } else if (globalWeight === '900' || globalWeight === 'heavy' || globalWeight === 'black') {
    weightCss = '800';
    blackWeightCss = '900';
  } else {
    weightCss = '700';
    blackWeightCss = '900';
  }

  return { globalWeight, weightCss, blackWeightCss };
}

/**
 * Configuration & Typography Resolver for Sales Receipt
 */
export function getSalesReceiptTypography(storeSettings) {
  const { globalWeight, weightCss, blackWeightCss } = resolveThermalWeights(storeSettings);
  const cfg = {
    ...DEFAULT_SALES_RECEIPT_CONFIG,
    ...(storeSettings?.salesReceiptConfig || {}),
  };

  const lineSpacing = cfg.rowPadding || storeSettings?.receiptLineSpacing || 'normal';
  let lineHeight = '1.25';
  if (lineSpacing === 'compact') lineHeight = '1.14';
  else if (lineSpacing === 'relaxed') lineHeight = '1.38';

  const sizes = {
    title: Number(cfg.storeHeaderSize || 20),
    sub: Math.max(9.5, Math.round((cfg.itemNameSize || 15) - 3)),
    customerName: Number(cfg.customerNameSize || 14),
    customerPhone: Number(cfg.customerPhoneSize || 12),
    productName: Number(cfg.itemNameSize || 15),
    price: Number(cfg.priceSize || 14),
    notes: Math.max(10, Math.round((cfg.itemNameSize || 15) - 3)),
    totals: Number(cfg.totalsSize || 15),
    body: Number(cfg.itemNameSize || 15),
    crucial: Number(cfg.itemNameSize || 15),
    small: 10,
    footer: Number(cfg.footerSize || 10),
    logoSize: Number(cfg.logoSize || 48),
  };

  const containerStyle = {
    '--receipt-base-size': `${sizes.body}px`,
    '--receipt-weight': weightCss,
    '--receipt-black-weight': blackWeightCss,
    fontSize: `${sizes.body}px`,
    fontWeight: weightCss,
    lineHeight: lineHeight,
    color: '#000000',
    backgroundColor: '#ffffff',
    width: '72.1mm',
    maxWidth: '72.1mm',
    margin: '0 auto',
    padding: '1mm',
    boxSizing: 'border-box',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  };

  return {
    config: cfg,
    globalWeight,
    weightCss,
    blackWeightCss,
    sizes,
    lineSpacing,
    lineHeight,
    containerStyle,
    logoFilter: getLogoFilter(cfg.logoContrast),
    dividerClass: getDividerClass(cfg.dividerStyle),
    totalsBorderClass: getBorderClass(cfg.totalsBorderStyle),
  };
}

/**
 * Configuration & Typography Resolver for Customer Reservation Receipt
 */
export function getReservationReceiptTypography(storeSettings) {
  const { globalWeight, weightCss, blackWeightCss } = resolveThermalWeights(storeSettings);
  const cfg = {
    ...DEFAULT_RESERVATION_RECEIPT_CONFIG,
    ...(storeSettings?.reservationReceiptConfig || {}),
  };

  const sizes = {
    title: Number(cfg.storeHeaderSize || 19),
    sub: Math.max(9.5, Math.round((cfg.customerNameSize || cfg.customerDetailsSize || 15) - 3)),
    customer: Number(cfg.customerNameSize || cfg.customerDetailsSize || 16),
    customerName: Number(cfg.customerNameSize || cfg.customerDetailsSize || 16),
    customerPhone: Number(cfg.customerPhoneSize || 14),
    manualTicket: Number(cfg.manualTicketSize || 22),
    pickupBanner: Number(cfg.pickupBannerSize || 17),
    inscription: Number(cfg.inscriptionSize || 16),
    specs: Number(cfg.specsSize || 12),
    deposit: Number(cfg.depositSize || 15),
    remaining: Number(cfg.remainingBalanceSize || 18),
    body: Number(cfg.customerNameSize || cfg.customerDetailsSize || 15),
    crucial: Number(cfg.customerNameSize || cfg.customerDetailsSize || 15),
    small: 10,
    footer: Number(cfg.footerSize || 10),
    logoSize: Number(cfg.logoSize || 48),
  };

  const containerStyle = {
    '--receipt-base-size': `${sizes.body}px`,
    '--receipt-weight': weightCss,
    '--receipt-black-weight': blackWeightCss,
    fontSize: `${sizes.body}px`,
    fontWeight: weightCss,
    lineHeight: '1.25',
    color: '#000000',
    backgroundColor: '#ffffff',
    width: '72.1mm',
    maxWidth: '72.1mm',
    margin: '0 auto',
    padding: '1mm',
    boxSizing: 'border-box',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  };

  return {
    config: cfg,
    globalWeight,
    weightCss,
    blackWeightCss,
    sizes,
    containerStyle,
    logoFilter: getLogoFilter(cfg.logoContrast),
    dividerClass: getDividerClass(cfg.dividerStyle),
    financialBorderClass: getBorderClass(cfg.financialBorderStyle),
  };
}

/**
 * Configuration & Typography Resolver for Kitchen / Chef Ticket
 */
export function getKitchenTicketTypography(storeSettings) {
  const { globalWeight, weightCss, blackWeightCss } = resolveThermalWeights(storeSettings);
  const cfg = {
    ...DEFAULT_KITCHEN_TICKET_CONFIG,
    ...(storeSettings?.kitchenTicketConfig || {}),
  };

  const sizes = {
    title: 18,
    manualTicket: Number(cfg.manualTicketSize || 24),
    pickupBanner: Number(cfg.pickupBannerSize || 18),
    customer: Number(cfg.customerNameSize || 16),
    customerName: Number(cfg.customerNameSize || 16),
    customerPhone: Number(cfg.customerPhoneSize || 14),
    specs: Number(cfg.specsAndNotesSize || 14),
    inscription: Number(cfg.inscriptionSize || 18),
    body: Number(cfg.specsAndNotesSize || 14),
    crucial: Number(cfg.customerNameSize || 16),
    small: 11,
    footer: Number(cfg.footerSize || 10),
    logoSize: Number(cfg.logoSize || 48),
  };

  const containerStyle = {
    '--receipt-base-size': `${sizes.body}px`,
    '--receipt-weight': weightCss,
    '--receipt-black-weight': blackWeightCss,
    fontSize: `${sizes.body}px`,
    fontWeight: weightCss,
    lineHeight: '1.25',
    color: '#000000',
    backgroundColor: '#ffffff',
    width: '72.1mm',
    maxWidth: '72.1mm',
    margin: '0 auto',
    padding: '1mm',
    boxSizing: 'border-box',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  };

  return {
    config: cfg,
    globalWeight,
    weightCss,
    blackWeightCss,
    sizes,
    containerStyle,
    logoFilter: getLogoFilter(cfg.logoContrast),
    dividerClass: getDividerClass(cfg.dividerStyle),
  };
}

/**
 * Unified Dispatcher / Generic Resolver with Backwards Compatibility
 */
export function getReceiptTypography(storeSettings, ticketType = 'sale') {
  if (ticketType === 'reservation' || ticketType === 'cake_reservation') {
    const res = getReservationReceiptTypography(storeSettings);
    return {
      ...res,
      layout: storeSettings?.receiptLayout || DEFAULT_RECEIPT_LAYOUT,
      headerSize: res.sizes.title,
      headerBold: res.config.storeHeaderBold !== false,
      productNameSize: res.sizes.customer,
      productNameBold: res.config.customerDetailsBold !== false,
      notesSize: res.sizes.specs,
      notesBold: res.config.specsBold !== false,
      priceSize: res.sizes.deposit,
      priceBold: true,
      lineSpacing: 'normal',
      totalsBorderClass: res.financialBorderClass,
    };
  }

  if (ticketType === 'kitchen' || ticketType === 'kitchen_ticket') {
    const kit = getKitchenTicketTypography(storeSettings);
    return {
      ...kit,
      layout: storeSettings?.receiptLayout || DEFAULT_RECEIPT_LAYOUT,
      headerSize: kit.sizes.title,
      headerBold: true,
      productNameSize: kit.sizes.customer,
      productNameBold: kit.config.customerNameBold !== false,
      notesSize: kit.sizes.specs,
      notesBold: kit.config.specsAndNotesBold !== false,
      priceSize: 14,
      priceBold: false,
      lineSpacing: 'normal',
      totalsBorderClass: 'border-2 border-black',
    };
  }

  // Default: Direct Sales Receipt
  const sales = getSalesReceiptTypography(storeSettings);
  return {
    ...sales,
    layout: storeSettings?.receiptLayout || DEFAULT_RECEIPT_LAYOUT,
    headerSize: sales.sizes.title,
    headerBold: sales.config.storeHeaderBold !== false,
    productNameSize: sales.sizes.productName,
    productNameBold: sales.config.itemNameBold !== false,
    notesSize: sales.sizes.notes,
    notesBold: false,
    priceSize: sales.sizes.price,
    priceBold: sales.config.priceBold !== false,
    lineSpacing: sales.lineSpacing,
    totalsBorderClass: sales.totalsBorderClass,
  };
}
