/**
 * Product Analytics & Movement Helpers
 * Normalizes item names and extracts canonical information to merge
 * direct counter sales with reservation bookings (molds, slices, packaging, extras).
 */

// Normalize Arabic item titles to resolve subtle spacing and letter variant discrepancies
export function normalizeItemTitle(title) {
  if (!title) return '';
  return String(title)
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\u0640/g, '') // tatweel
    .replace(/[\(\)\[\]\{\}\-_]/g, ' ')
    .replace(/\s*د\.ع\b/g, '')
    .replace(/\s*دينار\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Canonical categorization and key extractor to merge direct counter sales with reservation items
export function getCanonicalItemInfo(itemOrRaw) {
  const rawName = typeof itemOrRaw === 'string'
    ? itemOrRaw
    : (itemOrRaw?.product?.name || itemOrRaw?.name || itemOrRaw?.title || '');
  const norm = normalizeItemTitle(rawName);

  // 1. Mold detection (Sizes 0, 1, 2, 3)
  const isMoldFlag =
    itemOrRaw?.isMold ||
    itemOrRaw?.isReservationMold ||
    itemOrRaw?.categoryId === 'cat-molds' ||
    itemOrRaw?.product?.categoryId === 'cat-molds';

  if (isMoldFlag || (norm.includes('قالب') && (norm.includes('كيك') || norm.includes('قياس')))) {
    let size = null;
    const moldSizeVal = String(itemOrRaw?.moldSize ?? itemOrRaw?.size ?? itemOrRaw?.cakeSize ?? '').trim();
    if (moldSizeVal === '0' || norm.includes(' 0') || norm.includes('٠') || norm.endsWith('0')) size = '0';
    else if (moldSizeVal === '1' || norm.includes(' 1') || norm.includes('١') || norm.endsWith('1')) size = '1';
    else if (moldSizeVal === '2' || norm.includes(' 2') || norm.includes('٢') || norm.endsWith('2')) size = '2';
    else if (moldSizeVal === '3' || norm.includes(' 3') || norm.includes('٣') || norm.endsWith('3')) size = '3';
    else if (moldSizeVal) size = moldSizeVal;

    if (size !== null) {
      return {
        key: `mold-size-${size}`,
        name: `قالب كيك قياس ${size}`,
        categoryId: 'cat-molds',
        categoryName: 'قسم القوالب / الحجوزات',
        isMold: true,
        moldSize: size,
        isSlice: false,
      };
    }
  }

  // 2. Accompanying Slices detection (e.g. قطع كيك 500, قطع كيك 750, 1000, 1500, 2000)
  const isSliceFlag = itemOrRaw?.isSlice || itemOrRaw?.isReservationSlice;
  if (isSliceFlag || norm.includes('قطع') || norm.includes('شريح') || itemOrRaw?.tierPrice) {
    let priceVal = null;
    if (itemOrRaw?.tierPrice) {
      priceVal = String(itemOrRaw.tierPrice);
    } else {
      const match = norm.match(/\b(500|750|1000|1500|2000)\b/) || norm.match(/(\d{3,5})/);
      if (match) {
        priceVal = match[1];
      }
    }

    if (priceVal) {
      return {
        key: `slices-tier-${priceVal}`,
        name: `قطع كيك ${priceVal}`,
        categoryId: 'cat-cakes',
        categoryName: 'كيك',
        isMold: false,
        isSlice: true,
        tierPrice: Number(priceVal),
      };
    }
  }

  // 3. Packaging detection (تغليف قطع كيك)
  if (norm.includes('تغليف') && (norm.includes('كيك') || norm.includes('قطع') || norm.includes('علب'))) {
    return {
      key: 'slices-packaging',
      name: 'تغليف قطع كيك',
      categoryId: 'cat-supplies',
      categoryName: 'مستلزمات أعياد ميلاد',
      isMold: false,
      isSlice: false,
    };
  }

  // 4. General products (Counter direct sales & custom reservation extras)
  const rawId = itemOrRaw?.product?.id || itemOrRaw?.id;
  const rawCat =
    itemOrRaw?.product?.categoryId ||
    itemOrRaw?.product?.category ||
    itemOrRaw?.categoryId ||
    itemOrRaw?.category ||
    'cat-cakes';

  const key = norm ? `norm-${norm}` : (rawId ? `prod-${rawId}` : 'item');

  return {
    key,
    name: rawName || 'صنف',
    categoryId: rawCat,
    categoryName: null,
    isMold: false,
    isSlice: false,
  };
}

// Scan IndexedDB and localStorage archive for historical reservation records
export async function fetchIndexedDBReservations() {
  if (typeof window === 'undefined') return [];
  const found = [];

  // 1. Check window.indexedDB
  if (window.indexedDB) {
    try {
      let dbNames = ['mz_pos_db', 'mz_db', 'pos_db', 'musk_pos', 'meska_pos', 'keyval-store'];
      if (typeof window.indexedDB.databases === 'function') {
        try {
          const dbs = await window.indexedDB.databases();
          const detected = dbs.map((d) => d.name).filter(Boolean);
          if (detected.length > 0) {
            dbNames = Array.from(new Set([...detected, ...dbNames]));
          }
        } catch {
          // ignore
        }
      }

      for (const dbName of dbNames) {
        try {
          const records = await new Promise((resolve) => {
            const req = window.indexedDB.open(dbName);
            req.onerror = () => resolve([]);
            req.onblocked = () => resolve([]);
            req.onsuccess = () => {
              const db = req.result;
              const storeNames = Array.from(db.objectStoreNames || []);
              const targetStores = storeNames.filter(
                (sn) =>
                  sn.toLowerCase().includes('res') ||
                  sn.toLowerCase().includes('order') ||
                  sn.toLowerCase().includes('history')
              );

              if (targetStores.length === 0) {
                db.close();
                resolve([]);
                return;
              }

              const resItems = [];
              let remaining = targetStores.length;
              try {
                const tx = db.transaction(targetStores, 'readonly');
                targetStores.forEach((sn) => {
                  try {
                    const store = tx.objectStore(sn);
                    const getAllReq = store.getAll();
                    getAllReq.onsuccess = () => {
                      if (Array.isArray(getAllReq.result)) {
                        getAllReq.result.forEach((item) => {
                          if (item && (item.pickupDate || item.cakeSize || item.sliceTiers || item.customerName)) {
                            resItems.push(item);
                          }
                        });
                      }
                      remaining -= 1;
                      if (remaining <= 0) {
                        db.close();
                        resolve(resItems);
                      }
                    };
                    getAllReq.onerror = () => {
                      remaining -= 1;
                      if (remaining <= 0) {
                        db.close();
                        resolve(resItems);
                      }
                    };
                  } catch {
                    remaining -= 1;
                    if (remaining <= 0) {
                      db.close();
                      resolve(resItems);
                    }
                  }
                });
              } catch {
                db.close();
                resolve([]);
              }
            };
          });

          if (records.length > 0) {
            found.push(...records);
          }
        } catch {
          // ignore db error
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Check localStorage archives or backup keys
  try {
    const backupKeys = [
      'mz_reservations_backup',
      'mz_reservations_archive',
      'reservations_backup',
      'mz_archived_reservations',
    ];
    backupKeys.forEach((key) => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            found.push(...parsed);
          }
        } catch {
          // ignore
        }
      }
    });
  } catch {
    // ignore
  }

  return found;
}

/**
 * Detects whether a product or cart item is sold by weight (per kilogram)
 */
export function isWeightedProduct(productOrItem) {
  if (!productOrItem) return false;
  const prod = productOrItem.product || productOrItem;
  // Strict manager-defined pricingMode takes absolute precedence
  if (prod.pricingMode === 'weight') return true;
  if (prod.pricingMode === 'unit') return false;
  if (prod.isWeighted === true || prod.unit === 'kg' || prod.unit === 'كغم') return true;
  if (prod.categoryId === 'cat-sweets') return true;
  const name = String(prod.name || productOrItem.name || '').toLowerCase();
  const weightedKeywords = [
    'كغم', 'كيلو', 'وزن', 'بقلاوة', 'بيتيفور', 'بيتي فور',
    'برازق', 'غريبة', 'معمول', 'مكسرات', 'زنود', 'حلاوة الجبن',
    'كليجة', 'حلويات بالوزن', 'شوكولا بالوزن'
  ];
  return weightedKeywords.some((kw) => name.includes(kw));
}

/**
 * Universal Iraqi Dinar (IQD) Cash Rounding:
 * Rounds to nearest 250 IQD cash denomination (e.g. 5,004 -> 5,000, 20,256 -> 20,250, 19,900 -> 20,000)
 */
export const roundToIQD = (amount) => Math.round(Number(amount || 0) / 250) * 250;
export const roundIQD = roundToIQD;

/**
 * Bi-directional Price ↔ Weight Synchronizer:
 * a) Weight -> Total Amount: Weight * Base Price (rounded to nearest 250 IQD)
 * b) Total Amount -> Weight: Total Amount / Base Price (rounded to 3 decimal places)
 */
export function calculateWeightFromAmount(amount, baseUnitPrice) {
  const numAmount = Number(amount) || 0;
  const numPrice = Number(baseUnitPrice) || 0;
  if (numPrice <= 0 || numAmount <= 0) return 0;
  return Math.round((numAmount / numPrice) * 1000) / 1000;
}

export function calculateAmountFromWeight(weight, baseUnitPrice) {
  const numWeight = Number(weight) || 0;
  const numPrice = Number(baseUnitPrice) || 0;
  return Math.max(0, roundToIQD(numWeight * numPrice));
}

/**
 * Calculates a cart item's line total with strict manual price lock & universal IQD cash rounding support
 */
export function getCartItemLineTotal(item) {
  if (!item) return 0;
  const isWeighted = isWeightedProduct(item.product || item);
  const uPrice = Number(item.unitPrice ?? item.price ?? item.originalPrice ?? 0);
  const qty = Number(item.quantity) || 0;
  const disc = Number(item.discount) || 0;

  if (isWeighted) {
    if (item.manualTotalAmount !== undefined && item.manualTotalAmount !== null && !isNaN(item.manualTotalAmount)) {
      // Strict manual price lock from typed amount
      return Math.max(0, Math.round(Number(item.manualTotalAmount) - disc));
    }
    // Calculated from weight with IQD 250 rounding
    const rawTotal = Math.max(0, uPrice * qty - disc);
    return roundToIQD(rawTotal);
  }

  // Universal IQD rounding applied to unit/piece items as well
  return Math.max(0, roundToIQD(uPrice * qty - disc));
}


