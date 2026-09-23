import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAudioBeep } from '../hooks/useAudioBeep';
import { requestPersistentStorage, initDesktopStorageSync } from '../utils/storagePersistence';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_STORE_SETTINGS,
  INITIAL_RESERVATIONS,
  INITIAL_EXPENSES,
  INITIAL_SALES_HISTORY,
  DEFAULT_PRESET_EXPENSES,
  DEFAULT_EXPENSE_CATEGORIES,
} from '../data/defaultData';

const POSContext = createContext(null);

export function POSProvider({ children }) {
  const audio = useAudioBeep();

  // 1. Core Settings & Store Info (with default managerPin: '1234')
  const [storeSettings, setStoreSettings] = useLocalStorage('mz_settings', DEFAULT_STORE_SETTINGS);

  // 2. Catalog (Categories & Products)
  // Ensure 'cat-all' is removed even if previously cached in localStorage
  const [categories, setCategories] = useLocalStorage('mz_categories', DEFAULT_CATEGORIES);
  const cleanCategories = useMemo(() => {
    return categories.filter((c) => c.id !== 'cat-all');
  }, [categories]);

  const [products, setProducts] = useLocalStorage('mz_products', DEFAULT_PRODUCTS);
  // Persist active selected category across browser restarts
  const [activeCategory, setActiveCategory] = useLocalStorage('mz_active_category', 'cat-cakes');
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Multi-Cart State (Hold Orders - up to 5 concurrent active orders)
  const [carts, setCarts] = useLocalStorage('mz_multi_carts', () => {
    try {
      const multi = window.localStorage.getItem('mz_multi_carts');
      if (multi) {
        const parsed = JSON.parse(multi);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const legacy = window.localStorage.getItem('mz_active_cart');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [{ id: 'cart-1', name: 'فاتورة 1', items: parsed }];
        }
      }
    } catch (e) {}
    return [{ id: 'cart-1', name: 'فاتورة 1', items: [] }];
  });

  const [activeCartId, setActiveCartId] = useLocalStorage('mz_active_cart_id', 'cart-1');

  const safeCarts = useMemo(() => {
    if (!Array.isArray(carts) || carts.length === 0) {
      return [{ id: 'cart-1', name: 'فاتورة 1', items: [] }];
    }
    return carts;
  }, [carts]);

  const activeCart = useMemo(() => {
    return safeCarts.find((c) => c.id === activeCartId) || safeCarts[0];
  }, [safeCarts, activeCartId]);

  const cart = useMemo(() => {
    return activeCart.items || [];
  }, [activeCart]);

  const updateActiveCartItems = (updater) => {
    setCarts((prevCarts) => {
      const list = Array.isArray(prevCarts) && prevCarts.length > 0 ? prevCarts : [{ id: 'cart-1', name: 'فاتورة 1', items: [] }];
      const currentActiveId = activeCart.id;
      return list.map((c) => {
        if (c.id === currentActiveId) {
          const newItems = typeof updater === 'function' ? updater(c.items || []) : updater;
          return { ...c, items: newItems };
        }
        return c;
      });
    });
  };

  // 4. Drawer Sessions & Treasury
  const [currentSession, setCurrentSession] = useLocalStorage('mz_current_session', {
    sessionId: 'SESSION-' + new Date().toISOString().split('T')[0],
    openedAt: new Date().toISOString(),
    closedAt: null,
  });

  // Permanent Sales History
  const [salesHistory, setSalesHistory] = useLocalStorage('mz_sales_history', INITIAL_SALES_HISTORY);

  // Sales Returns / Refunds History
  const [salesReturns, setSalesReturns] = useLocalStorage('mz_sales_returns', []);

  // Permanent Reservations Record
  const [reservations, setReservations] = useLocalStorage('mz_reservations', INITIAL_RESERVATIONS);

  // Permanent Expenses Archive (NEVER deleted on daily reset)
  const [expenses, setExpenses] = useLocalStorage('mz_expenses', INITIAL_EXPENSES);

  // Preset / Frequent Expenses Templates (الصرفيات المعتادة)
  const [presetExpenses, setPresetExpenses] = useLocalStorage('mz_preset_expenses', DEFAULT_PRESET_EXPENSES);

  // Dynamic Expense Categories (تصنيفات الصرفيات)
  const [expenseCategories, setExpenseCategories] = useLocalStorage('mz_expense_categories', DEFAULT_EXPENSE_CATEGORIES);

  // Permanent Z-Reports Archive
  const [zReportsHistory, setZReportsHistory] = useLocalStorage('mz_zreports', []);

  // Permanent Shift History Archive (Full records & itemized breakdown)
  const [shiftHistory, setShiftHistory] = useLocalStorage('mz_shift_history', []);

  // User Roles & Cashier Profiles
  const [userRole, setUserRole] = useLocalStorage('mz_user_role', 'cashier'); // 'cashier' | 'manager'
  const [activeCashier, setActiveCashier] = useLocalStorage('mz_active_cashier', 'كاشير 1');
  const cashierProfiles = ['كاشير 1', 'كاشير 2'];

  // Dual Shift Tracking (صباحي / مسائي)
  const [activeShiftType, setActiveShiftType] = useLocalStorage('mz_active_shift_type', 'صباحي'); // 'صباحي' | 'مسائي'

  const switchShift = (targetShift) => {
    if (targetShift === activeShiftType) return;
    setActiveShiftType(targetShift);
    playSound('add');
  };

  // Product Movement Statistical Cycle Reset (تصفير حركة الأصناف)
  const [productMovementResetAt, setProductMovementResetAt] = useLocalStorage('mz_product_movement_reset_at', null);

  const resetProductMovement = () => {
    const timestamp = new Date().toISOString();
    setProductMovementResetAt(timestamp);
    playSound('notification');
    return timestamp;
  };

  // 5. Independent Scale Preferences (Categories & Products Grid)
  // Categories scale persistence (50%, 75%, 100%, 125%, 150%)
  const [storedCategoriesScale, setStoredCategoriesScale] = useLocalStorage(
    'pos_categories_scale',
    () => {
      try {
        const legacy = window.localStorage.getItem('pos_grid_scale');
        if (legacy) return Number(legacy);
      } catch (e) {}
      return 100;
    }
  );

  const categoriesScale = useMemo(() => {
    const validScales = [50, 75, 100, 125, 150];
    const val = Number(storedCategoriesScale);
    return validScales.includes(val) ? val : 100;
  }, [storedCategoriesScale]);

  const setCategoriesScale = (newScale) => {
    const val = Number(newScale);
    const validScales = [50, 75, 100, 125, 150];
    const safe = validScales.includes(val) ? val : 100;
    setStoredCategoriesScale(safe);
  };

  // Products scale persistence (50%, 75%, 100%, 125%, 150%)
  const [storedProductsScale, setStoredProductsScale] = useLocalStorage(
    'pos_products_scale',
    () => {
      try {
        const legacy = window.localStorage.getItem('pos_grid_scale');
        if (legacy) return Number(legacy);
      } catch (e) {}
      return 100;
    }
  );

  const productsScale = useMemo(() => {
    const validScales = [50, 75, 100, 125, 150];
    const val = Number(storedProductsScale);
    return validScales.includes(val) ? val : 100;
  }, [storedProductsScale]);

  const setProductsScale = (newScale) => {
    const val = Number(newScale);
    const validScales = [50, 75, 100, 125, 150];
    const safe = validScales.includes(val) ? val : 100;
    setStoredProductsScale(safe);
  };

  // Backwards compatibility aliases
  const gridScale = productsScale;
  const setGridScale = setProductsScale;

  const isManager = userRole === 'manager';

  const verifyManagerPin = (pin) => {
    return String(pin || '').trim() === String(storeSettings.managerPin || '1234').trim();
  };

  const switchRole = (targetRole, pin = '') => {
    if (targetRole === 'manager') {
      if (verifyManagerPin(pin)) {
        setUserRole('manager');
        playSound('success');
        return { success: true };
      } else {
        playSound('warning');
        return { success: false, message: 'رمز مرور المدير غير صحيح' };
      }
    } else {
      setUserRole('cashier');
      playSound('add');
      return { success: true };
    }
  };

  // 4.1 Crash Recovery & Persistent Session Detection
  const [sessionRestoredNotice, setSessionRestoredNotice] = useState(null);

  useEffect(() => {
    // 1. Request persistent storage permission & sync with Desktop Disk Storage
    requestPersistentStorage();
    initDesktopStorageSync();

    // 2. Detect prior session on initial mount
    try {
      const priorTimestamp = window.localStorage.getItem('mz_last_saved_at');
      const savedShift = window.localStorage.getItem('mz_active_shift_type');
      const savedCashier = window.localStorage.getItem('mz_active_cashier');
      const rawCarts = window.localStorage.getItem('mz_multi_carts');

      let heldItemsCount = 0;
      let heldCartsCount = 0;
      if (rawCarts) {
        const parsed = JSON.parse(rawCarts);
        if (Array.isArray(parsed)) {
          heldCartsCount = parsed.length;
          heldItemsCount = parsed.reduce(
            (sum, c) => sum + (c.items ? c.items.reduce((s, i) => s + (Number(i.quantity) || 1), 0) : 0),
            0
          );
        }
      }

      if (priorTimestamp || heldItemsCount > 0 || savedShift) {
        let resolvedShift = activeShiftType || 'صباحي';
        if (savedShift) {
          try { resolvedShift = JSON.parse(savedShift); } catch (e) { resolvedShift = savedShift; }
        }
        let resolvedCashier = activeCashier || 'كاشير 1';
        if (savedCashier) {
          try { resolvedCashier = JSON.parse(savedCashier); } catch (e) { resolvedCashier = savedCashier; }
        }

        setSessionRestoredNotice({
          shift: resolvedShift,
          cashier: resolvedCashier,
          heldItemsCount,
          heldCartsCount,
        });

        const timer = setTimeout(() => {
          setSessionRestoredNotice(null);
        }, 5000);

        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('[Recovery] Error detecting prior session:', e);
    }
  }, []);

  // 4.2 Floating Toast Notification System
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((cur) => (cur && cur.message === message ? null : cur));
    }, 4000);
  };

  // 5. Thermal Printing State
  const [printJob, setPrintJob] = useState({
    isOpen: false,
    type: null, // 'sale' | 'reservation' | 'expense' | 'combined_expenses' | 'sales_return' | 'zreport' | 'xreport'
    data: null,
  });

  // Sound helper
  const playSound = (type) => {
    if (!storeSettings.allowSound) return;
    if (type === 'add') audio.playAddToCart();
    if (type === 'remove') audio.playRemoveItem();
    if (type === 'success') audio.playSuccess();
    if (type === 'warning') audio.playWarning();
  };

  // ==========================================
  // CATALOG CRUD
  // ==========================================
  const addCategory = (name, icon = 'Tag', color = '#800020') => {
    const newCat = {
      id: 'cat-' + Date.now(),
      name,
      icon,
      color,
    };
    setCategories((prev) => [...prev.filter((c) => c.id !== 'cat-all'), newCat]);
    return newCat;
  };

  const updateCategory = (categoryId, updatedFields) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, ...updatedFields } : c))
    );
  };

  const addProduct = (productData) => {
    const newProduct = {
      id: 'prod-' + Date.now(),
      name: productData.name,
      categoryId: productData.categoryId || 'cat-cakes',
      price: Number(productData.price) || 0,
      cost: Number(productData.cost) || 0,
      barcode: productData.barcode || 'MZ-' + Math.floor(1000 + Math.random() * 9000),
      isAvailable: productData.isAvailable !== false,
      isService: productData.isService || false,
      isDeposit: productData.isDeposit || false,
      description: productData.description || '',
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id, updatedFields) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCarts((prevCarts) =>
      (Array.isArray(prevCarts) ? prevCarts : []).map((c) => ({
        ...c,
        items: (c.items || []).filter((item) => item.product.id !== id),
      }))
    );
  };

  const deleteCategory = (categoryId) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    setProducts((prev) => prev.filter((p) => p.categoryId !== categoryId));
    setCarts((prevCarts) =>
      (Array.isArray(prevCarts) ? prevCarts : []).map((c) => ({
        ...c,
        items: (c.items || []).filter((item) => item.product.categoryId !== categoryId),
      }))
    );
    setActiveCategory((prevActive) => {
      if (prevActive === categoryId) {
        const remaining = cleanCategories.filter((c) => c.id !== categoryId);
        return remaining.length > 0 ? remaining[0].id : '';
      }
      return prevActive;
    });
    playSound('remove');
  };

  const toggleProductAvailability = (id) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p))
    );
  };

  const reorderCategories = (newCategories) => {
    setCategories(newCategories);
    playSound('add');
  };


  const reorderProducts = (newProducts) => {
    setProducts(newProducts);
    playSound('add');
  };

  const updateProductDetails = (productId, updatedFields) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updatedFields } : p))
    );
    playSound('add');
  };

  // ==========================================
  // MULTI-CART & HOLD ORDERS MANAGEMENT
  // ==========================================
  const switchCart = (cartId) => {
    setActiveCartId(cartId);
    playSound('add');
  };

  const addNewCart = () => {
    if (safeCarts.length >= 5) {
      playSound('warning');
      return null;
    }

    // Determine the next available cart number (1..5)
    const usedNumbers = safeCarts.map((c) => {
      const match = (c.name || '').match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
    let nextNum = 1;
    while (usedNumbers.includes(nextNum) && nextNum <= 5) {
      nextNum++;
    }
    if (nextNum > 5) nextNum = safeCarts.length + 1;

    const newCart = {
      id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: `فاتورة ${nextNum}`,
      items: [],
      createdAt: new Date().toISOString(),
    };

    setCarts((prev) => [...(Array.isArray(prev) ? prev : []), newCart]);
    setActiveCartId(newCart.id);
    playSound('add');
    return newCart;
  };

  const removeCart = (cartId) => {
    setCarts((prev) => {
      if (!Array.isArray(prev) || prev.length <= 1) {
        return [{ id: 'cart-1', name: 'فاتورة 1', items: [] }];
      }
      return prev.filter((c) => c.id !== cartId);
    });

    if (activeCartId === cartId) {
      const remaining = safeCarts.filter((c) => c.id !== cartId);
      if (remaining.length > 0) {
        // Shift active view to next open cart (prefer one with items)
        const cartWithItems = remaining.find((c) => c.items && c.items.length > 0);
        setActiveCartId(cartWithItems ? cartWithItems.id : remaining[0].id);
      } else {
        setActiveCartId('cart-1');
      }
    }
    playSound('remove');
  };

  // ==========================================
  // ACTIVE CART OPERATIONS & SINGLE-ORDER OVERRIDE
  // ==========================================
  const addToCart = (product, customPrice = null) => {
    playSound('add');
    updateActiveCartItems((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id
      );

      const resolvedPrice =
        customPrice !== null ? Number(customPrice) : Number(product.price);

      if (existingIndex > -1 && customPrice === null) {
        return prevCart.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prevCart,
        {
          cartItemId: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          product,
          quantity: 1,
          originalPrice: Number(product.price),
          unitPrice: resolvedPrice,
          discount: 0,
          isOverridden: customPrice !== null && customPrice !== product.price,
          note: '',
        },
      ];
    });
  };

  const updateItemQuantity = (cartItemId, newQuantity) => {
    const rawNum = parseFloat(newQuantity);
    if (isNaN(rawNum) || rawNum <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    const qty = Math.round(rawNum * 1000) / 1000;
    updateActiveCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: qty } : item
      )
    );
  };

  const removeFromCart = (cartItemId) => {
    playSound('remove');
    updateActiveCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    updateActiveCartItems([]);
  };

  const overrideCartItemPrice = (cartItemId, newPrice) => {
    const price = Number(newPrice);
    if (isNaN(price) || price < 0) return;
    updateActiveCartItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            unitPrice: price,
            isOverridden: price !== item.originalPrice,
          };
        }
        return item;
      })
    );
  };

  const applyCartItemDiscount = (cartItemId, discountAmount) => {
    const disc = Number(discountAmount);
    updateActiveCartItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            discount: isNaN(disc) || disc < 0 ? 0 : disc,
          };
        }
        return item;
      })
    );
  };

  // ==========================================
  // CART FINANCIAL TOTALS
  // ==========================================
  const cartSummary = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let depositItemsTotal = 0;

    (cart || []).forEach((item) => {
      const origPrice = Number(item.originalPrice || item.unitPrice || item.price || 0);
      const uPrice = Number(item.unitPrice || item.price || origPrice);
      const qty = Number(item.quantity) || 1;
      const disc = Number(item.discount) || 0;

      const lineOriginal = Math.round(origPrice * qty);
      const lineEffective = Math.max(0, Math.round((uPrice * qty) - disc));
      const lineDiscount = Math.max(0, lineOriginal - lineEffective);

      subtotal += lineOriginal;
      totalDiscount += lineDiscount;

      if (item.product?.isDeposit || item.product?.id === 'service-deposit') {
        depositItemsTotal += lineEffective;
      }
    });

    const netTotal = Math.max(0, subtotal - totalDiscount);
    const totalQty = (cart || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

    return {
      itemCount: totalQty % 1 === 0 ? totalQty : Number(totalQty.toFixed(2)),
      linesCount: (cart || []).length,
      subtotal,
      totalDiscount,
      netTotal,
      depositItemsTotal,
    };
  }, [cart]);

  // ==========================================
  // COMPLETE SALE / CHECKOUT
  // ==========================================
  const completeSale = (paymentData = {}, shouldPrint = true) => {
    if (!cart || cart.length === 0) return null;

    const receiptNo = 'INV-' + new Date().getFullYear() + '-' + (salesHistory.length + 1001);
    
    const depositAmountInCart = (cart || [])
      .filter((item) => item.product?.isDeposit || item.product?.id === 'service-deposit')
      .reduce((sum, item) => sum + Math.max(0, (Number(item.unitPrice || item.price || 0) * (Number(item.quantity) || 1)) - (Number(item.discount) || 0)), 0);

    const directSalesAmount = Math.max(0, cartSummary.netTotal - depositAmountInCart);

    const newSale = {
      id: 'SALE-' + Date.now(),
      receiptNo,
      sessionId: currentSession.sessionId,
      items: [...cart],
      subtotal: cartSummary.subtotal,
      totalDiscount: cartSummary.totalDiscount,
      netTotal: cartSummary.netTotal,
      depositAmount: depositAmountInCart,
      directSalesAmount: directSalesAmount,
      amountReceived: Number(paymentData.amountReceived) || cartSummary.netTotal,
      changeDue: Number(paymentData.changeDue) || 0,
      paymentMethod: paymentData.paymentMethod || 'نقداً',
      customerName: paymentData.customerName || 'زبون عام',
      cashierName: activeCashier || storeSettings.cashierName,
      shiftType: activeShiftType || 'صباحي',
      date: new Date().toISOString(),
      notes: paymentData.notes || '',
    };

    setSalesHistory((prev) => [newSale, ...prev]);

    // Close or reset the paid cart and shift active view
    const completedCartId = activeCart.id;
    setCarts((prevCarts) => {
      if (!Array.isArray(prevCarts) || prevCarts.length <= 1) {
        return [{ id: prevCarts?.[0]?.id || 'cart-1', name: 'فاتورة 1', items: [] }];
      }
      return prevCarts.filter((c) => c.id !== completedCartId);
    });

    // Shift to next open order or an empty 'فاتورة 1'
    if (safeCarts.length > 1) {
      const remainingOtherCarts = safeCarts.filter((c) => c.id !== completedCartId);
      if (remainingOtherCarts.length > 0) {
        const cartWithItems = remainingOtherCarts.find((c) => c.items && c.items.length > 0);
        setActiveCartId(cartWithItems ? cartWithItems.id : remainingOtherCarts[0].id);
      } else {
        setActiveCartId('cart-1');
      }
    } else {
      setActiveCartId(safeCarts[0]?.id || 'cart-1');
    }

    playSound('success');

    // Only trigger thermal receipt printing if not bypassed
    const doPrint = paymentData.printReceipt !== undefined ? Boolean(paymentData.printReceipt) : Boolean(shouldPrint);
    if (doPrint) {
      triggerPrint('sale', newSale);
    }
    return newSale;
  };

  // ==========================================
  // SALES RETURN / REFUND MODULE
  // ==========================================
  const addSalesReturn = (returnData) => {
    const returnNo = 'RET-' + new Date().getFullYear() + '-' + (salesReturns.length + 1001);
    const amount = Number(returnData.amount) || 0;

    const newReturn = {
      id: 'RET-' + Date.now(),
      returnNo,
      sessionId: currentSession.sessionId,
      amount: amount,
      customerName: returnData.customerName || 'زبون عام',
      originalReceiptNo: returnData.originalReceiptNo || '',
      reason: returnData.reason || 'إرجاع صنف ومسترجع نقدي',
      items: returnData.items || [],
      cashierName: activeCashier || storeSettings.cashierName,
      shiftType: activeShiftType || 'صباحي',
      date: new Date().toISOString(),
    };

    setSalesReturns((prev) => [newReturn, ...prev]);
    playSound('remove');

    // Trigger Print Return Receipt
    triggerPrint('sales_return', newReturn);
    return newReturn;
  };

  // ==========================================
  // RESERVATIONS MODULE
  // ==========================================
  const addReservation = (reservationData, ringUpDepositToDrawer = true) => {
    const receiptNumber = 'RES-' + new Date().getFullYear() + '-' + (reservations.length + 1001);
    const deposit = Number(reservationData.depositPaid) || 0;
    const total = Number(reservationData.totalCost) || 0;
    const remaining = Math.max(0, total - deposit);
    const hasMold = reservationData.hasMold !== false && (reservationData.cakeSize || reservationData.hasMold);
    const hasSlices =
      reservationData.hasSlices === true ||
      reservationData.reservationType === 'cake_slices' ||
      (reservationData.sliceTiers && reservationData.sliceTiers.length > 0);

    const newReservation = {
      id: 'RES-' + Date.now(),
      receiptNumber,
      manualBookingNo: (reservationData.manualBookingNo || '').trim(),
      customerName: reservationData.customerName,
      phone: reservationData.phone,
      pickupDate: reservationData.pickupDate,
      pickupTime: reservationData.pickupTime || '18:00',
      sessionId: currentSession.sessionId,
      hasMold,
      hasSlices,
      reservationType: hasMold && hasSlices ? 'combined' : (hasSlices ? 'cake_slices' : 'whole_cake'),
      // Multi-Mold Support
      cakeMolds: reservationData.cakeMolds || (hasMold ? [{
        cakeSize: reservationData.cakeSize || '2',
        moldPrice: Number(reservationData.moldPrice) || 0,
        cakeDesign: reservationData.cakeDesign || '',
        cakeFlavor: reservationData.cakeFlavor || '',
        writtenText: reservationData.writtenText || '',
      }] : []),
      cakeMoldsCount: reservationData.cakeMoldsCount || (hasMold ? 1 : 0),
      // Section A: Whole cake specific fallback
      cakeSize: hasMold ? (reservationData.cakeSize || '2') : null,
      moldPrice: hasMold ? (Number(reservationData.moldPrice) || 0) : 0,
      cakeDesign: hasMold ? (reservationData.cakeDesign || '') : '',
      cakeFlavor: hasMold ? (reservationData.cakeFlavor || '') : '',
      writtenText: hasMold ? (reservationData.writtenText || '') : '',
      // Section B: Cake slices specific
      sliceTiers: hasSlices ? (reservationData.sliceTiers || []) : [],
      hasPackaging: hasSlices ? Boolean(reservationData.hasPackaging) : false,
      packagingFeePerPiece: hasSlices ? (reservationData.packagingFeePerPiece || 250) : 0,
      packagingTotal: hasSlices ? (reservationData.packagingTotal || 0) : 0,
      totalPieces: hasSlices ? (reservationData.totalPieces || 0) : 0,
      slicesTotal: hasSlices ? (reservationData.slicesTotal || 0) : 0,
      slicesFlavor: hasSlices ? (reservationData.slicesFlavor || '') : '',
      // Consolidated Financials
      totalCost: total,
      depositPaid: deposit,
      remainingBalance: remaining,
      status: 'قيد التحضير',
      notes: reservationData.notes || '',
      createdAt: new Date().toISOString(),
      depositSessionId: currentSession.sessionId,
      shiftType: activeShiftType || 'صباحي',
    };

    setReservations((prev) => [newReservation, ...prev]);

    if (ringUpDepositToDrawer && deposit > 0) {
      let typeLabel = '';
      const mCount = newReservation.cakeMolds?.length || (hasMold ? 1 : 0);
      if (hasMold && hasSlices) {
        typeLabel = mCount > 1
          ? `${mCount} قوالب + ${newReservation.totalPieces} قطعة`
          : `قالب قياس ${newReservation.cakeSize} + ${newReservation.totalPieces} قطعة`;
      } else if (hasMold) {
        typeLabel = mCount > 1
          ? `${mCount} قوالب كيك`
          : `قالب كيك قياس ${newReservation.cakeSize}`;
      } else {
        typeLabel = `${newReservation.totalPieces} قطعة كيك`;
      }

      const depositLabel = `عربون حجز (${reservationData.customerName} - ${typeLabel})`;

      const depositSale = {
        id: 'SALE-DEP-' + Date.now(),
        receiptNo: 'DEP-' + receiptNumber,
        sessionId: currentSession.sessionId,
        items: [
          {
            cartItemId: 'item-res-dep-' + Date.now(),
            product: {
              id: 'service-deposit',
              name: depositLabel,
              isDeposit: true,
            },
            quantity: 1,
            originalPrice: deposit,
            unitPrice: deposit,
            discount: 0,
            isOverridden: true,
          }
        ],
        subtotal: deposit,
        totalDiscount: 0,
        netTotal: deposit,
        depositAmount: deposit,
        directSalesAmount: 0,
        amountReceived: deposit,
        changeDue: 0,
        paymentMethod: 'نقداً',
        customerName: reservationData.customerName,
        cashierName: activeCashier || storeSettings.cashierName,
        shiftType: activeShiftType || 'صباحي',
        date: new Date().toISOString(),
        reservationId: newReservation.id,
        notes: `عربون حجز رقم ${receiptNumber}`,
      };
      setSalesHistory((prev) => [depositSale, ...prev]);
    }

    playSound('success');
    triggerPrint('reservation', newReservation);
    return newReservation;
  };

  const updateReservationStatus = (id, newStatus) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const deliverReservationAndCollectBalance = (reservation) => {
    if (reservation.remainingBalance > 0) {
      const hasMold = reservation.hasMold !== false && (reservation.cakeSize || reservation.hasMold);
      const hasSlices =
        reservation.hasSlices === true ||
        reservation.reservationType === 'cake_slices' ||
        (reservation.sliceTiers && reservation.sliceTiers.length > 0);

      let typeLabel = '';
      const mCount = reservation.cakeMolds?.length || (hasMold ? 1 : 0);
      if (hasMold && hasSlices) {
        typeLabel = mCount > 1
          ? `${mCount} قوالب + ${reservation.totalPieces} قطعة`
          : `قالب قياس ${reservation.cakeSize} + ${reservation.totalPieces} قطعة`;
      } else if (hasMold) {
        typeLabel = mCount > 1
          ? `${mCount} قوالب كيك`
          : `قالب كيك قياس ${reservation.cakeSize}`;
      } else {
        typeLabel = `${reservation.totalPieces} قطعة كيك`;
      }

      const remainingLabel = `متبقي حجز (${reservation.customerName} - ${typeLabel} - ${reservation.receiptNumber})`;

      const remainingSale = {
        id: 'SALE-REM-' + Date.now(),
        receiptNo: 'REM-' + reservation.receiptNumber,
        sessionId: currentSession.sessionId,
        items: [
          {
            cartItemId: 'item-res-rem-' + Date.now(),
            product: {
              id: 'service-remaining',
              name: remainingLabel,
              isDeposit: false,
            },
            quantity: 1,
            originalPrice: reservation.remainingBalance,
            unitPrice: reservation.remainingBalance,
            discount: 0,
            isOverridden: true,
          }
        ],
        subtotal: reservation.remainingBalance,
        totalDiscount: 0,
        netTotal: reservation.remainingBalance,
        depositAmount: 0,
        directSalesAmount: reservation.remainingBalance,
        amountReceived: reservation.remainingBalance,
        changeDue: 0,
        paymentMethod: 'نقداً',
        customerName: reservation.customerName,
        cashierName: activeCashier || storeSettings.cashierName,
        shiftType: activeShiftType || 'صباحي',
        date: new Date().toISOString(),
        reservationId: reservation.id,
        notes: `تسليم طلب كيك واستلام المتبقي للحجز ${reservation.receiptNumber}`,
      };
      setSalesHistory((prev) => [remainingSale, ...prev]);
      triggerPrint('sale', remainingSale);
    }

    setReservations((prev) =>
      prev.map((r) =>
        r.id === reservation.id
          ? { ...r, status: 'تم التسليم', depositPaid: r.totalCost, remainingBalance: 0 }
          : r
      )
    );
    playSound('success');
  };

  const updateReservation = (id, updatedData) => {
    const existing = reservations.find((r) => r.id === id);
    if (!existing) return null;

    const deposit = Number(updatedData.depositPaid) || 0;
    const total = Number(updatedData.totalCost) || 0;
    const remaining = Math.max(0, total - deposit);
    const hasMold =
      updatedData.hasMold !== false &&
      (updatedData.cakeSize || updatedData.hasMold || (updatedData.cakeMolds && updatedData.cakeMolds.length > 0));
    const hasSlices =
      updatedData.hasSlices === true ||
      updatedData.reservationType === 'cake_slices' ||
      (updatedData.sliceTiers && updatedData.sliceTiers.length > 0);

    const updatedReservation = {
      ...existing,
      manualBookingNo: (updatedData.manualBookingNo !== undefined ? updatedData.manualBookingNo : existing.manualBookingNo || '').trim(),
      customerName: updatedData.customerName || existing.customerName,
      phone: updatedData.phone || existing.phone,
      pickupDate: updatedData.pickupDate || existing.pickupDate,
      pickupTime: updatedData.pickupTime || existing.pickupTime || '18:00',
      hasMold,
      hasSlices,
      reservationType: hasMold && hasSlices ? 'combined' : (hasSlices ? 'cake_slices' : 'whole_cake'),
      // Multi-Mold Support
      cakeMolds: updatedData.cakeMolds || existing.cakeMolds || [],
      cakeMoldsCount: updatedData.cakeMolds?.length || (hasMold ? 1 : 0),
      // Backward-compat fields
      cakeSize: hasMold ? (updatedData.cakeSize || updatedData.cakeMolds?.[0]?.cakeSize || existing.cakeSize || '2') : null,
      moldPrice: hasMold ? (Number(updatedData.moldPrice) || 0) : 0,
      cakeDesign: hasMold ? (updatedData.cakeDesign || '') : '',
      cakeFlavor: hasMold ? (updatedData.cakeFlavor || '') : '',
      writtenText: hasMold ? (updatedData.writtenText || '') : '',
      // Slices fields
      sliceTiers: hasSlices ? (updatedData.sliceTiers || []) : [],
      hasPackaging: hasSlices ? Boolean(updatedData.hasPackaging) : false,
      packagingFeePerPiece: hasSlices ? (updatedData.packagingFeePerPiece || 250) : 0,
      packagingTotal: hasSlices ? (updatedData.packagingTotal || 0) : 0,
      totalPieces: hasSlices ? (updatedData.totalPieces || 0) : 0,
      slicesTotal: hasSlices ? (updatedData.slicesTotal || 0) : 0,
      slicesFlavor: hasSlices ? (updatedData.slicesFlavor || '') : '',
      // Consolidated Financials
      totalCost: total,
      depositPaid: deposit,
      remainingBalance: remaining,
      notes: updatedData.notes !== undefined ? updatedData.notes : (existing.notes || ''),
      updatedAt: new Date().toISOString(),
    };

    // Sync deposit in salesHistory if created in current active session
    const isCurrentSession =
      existing.sessionId === currentSession.sessionId ||
      existing.depositSessionId === currentSession.sessionId;

    if (isCurrentSession) {
      const existingDepositSale = salesHistory.find(
        (s) => s.reservationId === id || s.receiptNo === 'DEP-' + existing.receiptNumber
      );

      if (deposit > 0) {
        if (existingDepositSale) {
          setSalesHistory((prev) =>
            prev.map((s) => {
              if (s.reservationId === id || s.receiptNo === 'DEP-' + existing.receiptNumber) {
                return {
                  ...s,
                  customerName: updatedReservation.customerName,
                  subtotal: deposit,
                  netTotal: deposit,
                  depositAmount: deposit,
                  amountReceived: deposit,
                  notes: `عربون حجز رقم ${existing.receiptNumber}`,
                  items: (s.items || []).map((it) => ({
                    ...it,
                    product: {
                      ...it.product,
                      name: `عربون حجز (${updatedReservation.customerName})`,
                    },
                    originalPrice: deposit,
                    unitPrice: deposit,
                  })),
                };
              }
              return s;
            })
          );
        } else {
          // If previously had no deposit transaction, add one
          const depositSale = {
            id: 'SALE-DEP-' + Date.now(),
            receiptNo: 'DEP-' + existing.receiptNumber,
            sessionId: currentSession.sessionId,
            items: [
              {
                cartItemId: 'item-res-dep-' + Date.now(),
                product: {
                  id: 'service-deposit',
                  name: `عربون حجز (${updatedReservation.customerName})`,
                  isDeposit: true,
                },
                quantity: 1,
                originalPrice: deposit,
                unitPrice: deposit,
                discount: 0,
                isOverridden: true,
              },
            ],
            subtotal: deposit,
            totalDiscount: 0,
            netTotal: deposit,
            depositAmount: deposit,
            directSalesAmount: 0,
            amountReceived: deposit,
            changeDue: 0,
            paymentMethod: 'نقداً',
            customerName: updatedReservation.customerName,
            cashierName: activeCashier || storeSettings.cashierName,
            shiftType: activeShiftType || 'صباحي',
            date: new Date().toISOString(),
            reservationId: existing.id,
            notes: `عربون حجز رقم ${existing.receiptNumber}`,
          };
          setSalesHistory((prev) => [depositSale, ...prev]);
        }
      } else if (deposit === 0 && existingDepositSale) {
        // Deposit reduced to zero: remove deposit transaction
        setSalesHistory((prev) =>
          prev.filter((s) => s.reservationId !== id && s.receiptNo !== 'DEP-' + existing.receiptNumber)
        );
      }
    }

    setReservations((prev) => prev.map((r) => (r.id === id ? updatedReservation : r)));
    playSound('success');
    return updatedReservation;
  };

  const deleteReservation = (id) => {
    const res = reservations.find((r) => r.id === id);
    if (!res) return null;

    const isCurrentSession =
      res.sessionId === currentSession.sessionId ||
      res.depositSessionId === currentSession.sessionId;

    if (isCurrentSession) {
      // Rollback deposit / remaining collections from current session drawer
      setSalesHistory((prev) =>
        prev.filter(
          (s) =>
            s.reservationId !== id &&
            s.receiptNo !== 'DEP-' + res.receiptNumber &&
            s.receiptNo !== 'REM-' + res.receiptNumber
        )
      );
    }

    setReservations((prev) => prev.filter((r) => r.id !== id));
    playSound('remove');
    return {
      isCurrentSession,
      depositPaid: Number(res.depositPaid) || 0,
      customerName: res.customerName,
      receiptNumber: res.receiptNumber,
    };
  };

  // ==========================================
  // EXPENSES MODULE (PERMANENT ARCHIVE)
  // ==========================================
  const addExpense = (expenseData) => {
    const voucherNo = 'V-' + String(expenses.length + 1).padStart(3, '0');
    const newExpense = {
      id: 'EXP-' + Date.now(),
      voucherNo,
      sessionId: currentSession.sessionId,
      amount: Number(expenseData.amount) || 0,
      category: expenseData.category || 'مواد أولية',
      recipient: expenseData.recipient || '',
      description: expenseData.description || '',
      date: expenseData.date || new Date().toISOString(),
      recordedBy: activeCashier || storeSettings.cashierName,
      shiftType: expenseData.shiftType || activeShiftType || 'صباحي',
    };

    setExpenses((prev) => [newExpense, ...prev]);
    playSound('remove');

    triggerPrint('expense', newExpense);
    return newExpense;
  };

  const updateExpense = (id, updatedFields) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, ...updatedFields } : exp))
    );
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    playSound('remove');
    showToast('تم إلغاء سند الصرف وإعادة المبلغ للصندوق بنجاح', 'success');
  };

  const undoExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    playSound('remove');
    showToast('تم إلغاء سند الصرف وإعادة المبلغ للصندوق بنجاح', 'success');
  };

  // Combined expenses thermal printing helper
  const printCombinedExpenses = () => {
    const sessionExpenses = expenses.filter(
      (e) => e.sessionId === currentSession.sessionId
    );
    if (sessionExpenses.length === 0) {
      alert('لا توجد صرفيات مسجلة في الوردية الحالية للطباعة');
      return;
    }
    triggerPrint('combined_expenses', sessionExpenses);
  };

  // ==========================================
  // PRESET / FREQUENT EXPENSES MANAGEMENT
  // ==========================================
  const addPresetExpense = (presetData) => {
    const title = (presetData.title || '').trim();
    if (!title) return null;

    const newPreset = {
      id: 'pre-' + Date.now(),
      title,
      category: presetData.category || 'نسريات ومصاريف يومية',
      defaultAmount: Number(presetData.defaultAmount) || 0,
    };

    setPresetExpenses((prev) => [newPreset, ...(Array.isArray(prev) ? prev : [])]);
    playSound('add');
    showToast(`تمت إضافة الصرفية المعتادة "${title}" بنجاح`, 'success');
    return newPreset;
  };

  const updatePresetExpense = (id, updatedFields) => {
    setPresetExpenses((prev) =>
      (Array.isArray(prev) ? prev : []).map((item) =>
        item.id === id
          ? {
              ...item,
              ...updatedFields,
              title: updatedFields.title !== undefined ? updatedFields.title.trim() : item.title,
              defaultAmount:
                updatedFields.defaultAmount !== undefined
                  ? Number(updatedFields.defaultAmount) || 0
                  : item.defaultAmount,
            }
          : item
      )
    );
    playSound('add');
    showToast('تم تحديث الصرفية المعتادة بنجاح', 'success');
  };

  const deletePresetExpense = (id) => {
    setPresetExpenses((prev) => (Array.isArray(prev) ? prev : []).filter((item) => item.id !== id));
    playSound('remove');
    showToast('تم حذف الصرفية المعتادة بنجاح', 'info');
  };

  const resetPresetExpenses = () => {
    setPresetExpenses(DEFAULT_PRESET_EXPENSES);
    playSound('notification');
    showToast('تمت استعادة الصرفيات المعتادة الافتراضية بنجاح', 'success');
  };

  // ==========================================
  // EXPENSE CATEGORIES MANAGEMENT (MANAGER ONLY)
  // ==========================================
  const addExpenseCategory = (categoryName) => {
    const trimmed = (categoryName || '').trim();
    if (!trimmed) {
      showToast('يرجى كتابة اسم التصنيف الجديد', 'warning');
      return false;
    }
    const exists = (expenseCategories || []).some(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      showToast(`التصنيف "${trimmed}" موجود مسبقاً`, 'warning');
      return false;
    }
    setExpenseCategories((prev) => [...(Array.isArray(prev) ? prev : []), trimmed]);
    playSound('add');
    showToast(`تمت إضافة التصنيف "${trimmed}" بنجاح`, 'success');
    return true;
  };

  const updateExpenseCategory = (oldName, newName) => {
    const trimmedNew = (newName || '').trim();
    if (!trimmedNew) {
      showToast('يرجى كتابة الاسم الجديد للتصنيف', 'warning');
      return false;
    }
    if (oldName === trimmedNew) return true;

    const exists = (expenseCategories || []).some(
      (c) => c.toLowerCase() === trimmedNew.toLowerCase() && c.toLowerCase() !== oldName.toLowerCase()
    );
    if (exists) {
      showToast(`التصنيف "${trimmedNew}" موجود مسبقاً`, 'warning');
      return false;
    }

    setExpenseCategories((prev) =>
      (Array.isArray(prev) ? prev : []).map((c) => (c === oldName ? trimmedNew : c))
    );

    // Cascade update to expenses records
    setExpenses((prev) =>
      (Array.isArray(prev) ? prev : []).map((exp) =>
        exp.category === oldName ? { ...exp, category: trimmedNew } : exp
      )
    );

    // Cascade update to preset expenses
    setPresetExpenses((prev) =>
      (Array.isArray(prev) ? prev : []).map((preset) =>
        preset.category === oldName ? { ...preset, category: trimmedNew } : preset
      )
    );

    playSound('add');
    showToast(`تم تحديث التصنيف إلى "${trimmedNew}" وتحديث السجلات المرتبطة`, 'success');
    return true;
  };

  const deleteExpenseCategory = (name) => {
    if (!name) return;
    setExpenseCategories((prev) =>
      (Array.isArray(prev) ? prev : []).filter((c) => c !== name)
    );
    playSound('remove');
    showToast(`تم حذف التصنيف "${name}" بنجاح`, 'info');
  };

  const resetExpenseCategories = () => {
    setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
    playSound('notification');
    showToast('تمت استعادة تصنيفات الصرفيات الافتراضية بنجاح', 'success');
  };

  // ==========================================
  // DYNAMIC DAILY TREASURY METRICS WITH DUAL SHIFT
  // ==========================================
  const computeFinancials = (salesList, returnsList, expensesList) => {
    const directSales = (salesList || []).reduce(
      (sum, s) => sum + (s.directSalesAmount !== undefined ? s.directSalesAmount : s.netTotal),
      0
    );
    const salesReturnsTotal = (returnsList || []).reduce(
      (sum, r) => sum + Number(r.amount),
      0
    );
    const netDirectSales = Math.max(0, directSales - salesReturnsTotal);
    const collectedDeposits = (salesList || []).reduce(
      (sum, s) => sum + (s.depositAmount || 0),
      0
    );
    const dailyExpenses = (expensesList || []).reduce(
      (sum, e) => sum + Number(e.amount),
      0
    );
    const netCash = (directSales - salesReturnsTotal + collectedDeposits) - dailyExpenses;

    const cashierName =
      salesList?.[0]?.cashierName ||
      expensesList?.[0]?.recordedBy ||
      returnsList?.[0]?.cashierName ||
      activeCashier ||
      storeSettings.cashierName;

    return {
      directSales,
      salesReturnsTotal,
      netDirectSales,
      collectedDeposits,
      dailyExpenses,
      netCash,
      salesCount: (salesList || []).length,
      expensesCount: (expensesList || []).length,
      returnsCount: (returnsList || []).length,
      cashierName,
      sessionSales: salesList || [],
      sessionExpenses: expensesList || [],
      sessionReturns: returnsList || [],
    };
  };

  const dailyTreasury = useMemo(() => {
    const activeSessionId = currentSession.sessionId;

    // Filter transactions strictly for today's active session
    const sessionSales = salesHistory.filter(
      (s) => s.sessionId === activeSessionId
    );
    const sessionReturns = salesReturns.filter(
      (r) => r.sessionId === activeSessionId
    );
    const sessionExpenses = expenses.filter(
      (e) => e.sessionId === activeSessionId
    );

    // Cumulative totals for the whole business day
    const overall = computeFinancials(sessionSales, sessionReturns, sessionExpenses);

    // Morning Shift ("صباحي")
    const morningSales = sessionSales.filter((s) => (s.shiftType || 'صباحي') === 'صباحي');
    const morningReturns = sessionReturns.filter((r) => (r.shiftType || 'صباحي') === 'صباحي');
    const morningExpenses = sessionExpenses.filter((e) => (e.shiftType || 'صباحي') === 'صباحي');
    const morningMetrics = computeFinancials(morningSales, morningReturns, morningExpenses);

    // Evening Shift ("مسائي")
    const eveningSales = sessionSales.filter((s) => s.shiftType === 'مسائي');
    const eveningReturns = sessionReturns.filter((r) => r.shiftType === 'مسائي');
    const eveningExpenses = sessionExpenses.filter((e) => e.shiftType === 'مسائي');
    const eveningMetrics = computeFinancials(eveningSales, eveningReturns, eveningExpenses);

    return {
      ...overall,
      morningMetrics,
      eveningMetrics,
    };
  }, [salesHistory, salesReturns, expenses, currentSession, activeCashier, storeSettings]);

  // ==========================================
  // ITEM SALES AGGREGATION & SHIFT ACTIONS
  // ==========================================
  const getItemizedSales = (salesList) => {
    const itemMap = {};
    (salesList || []).forEach((sale) => {
      (sale.items || []).forEach((item) => {
        const key = item.product?.id || item.product?.name || item.name || 'item';
        const name = item.product?.name || item.name || 'منتج';
        const qty = Number(item.quantity) || 1;
        const effectivePrice = Number(item.unitPrice) || Number(item.price) || 0;
        const lineTotal = Math.max(0, (effectivePrice * qty) - (Number(item.discount) || 0));
        if (!itemMap[key]) {
          itemMap[key] = {
            id: key,
            name,
            quantity: 0,
            total: 0,
          };
        }
        itemMap[key].quantity += qty;
        itemMap[key].total += lineTotal;
      });
    });
    return Object.values(itemMap);
  };

  // Quick Action (X-Report): Shift Sales Preview without clearing counters
  const printXReport = () => {
    const itemized = getItemizedSales(dailyTreasury.sessionSales);
    const xReportData = {
      cashierName: activeCashier || storeSettings.cashierName,
      sessionId: currentSession.sessionId,
      openedAt: currentSession.openedAt,
      currentTime: new Date().toISOString(),
      directSales: dailyTreasury.directSales,
      salesReturns: dailyTreasury.salesReturnsTotal,
      collectedDeposits: dailyTreasury.collectedDeposits,
      dailyExpenses: dailyTreasury.dailyExpenses,
      netCash: dailyTreasury.netCash,
      salesCount: dailyTreasury.salesCount,
      expensesCount: dailyTreasury.expensesCount,
      returnsCount: dailyTreasury.returnsCount,
      itemizedItems: itemized,
    };
    triggerPrint('xreport', xReportData);
  };

  // Shift Handover Receipt Print (72.1mm)
  const printShiftHandover = (shiftTypeToPrint = activeShiftType) => {
    const isMorning = shiftTypeToPrint === 'صباحي';
    const metrics = isMorning ? dailyTreasury.morningMetrics : dailyTreasury.eveningMetrics;
    const itemized = getItemizedSales(metrics.sessionSales);

    const handoverData = {
      shiftType: shiftTypeToPrint,
      cashierName: metrics.cashierName || activeCashier || storeSettings.cashierName,
      sessionId: currentSession.sessionId,
      openedAt: currentSession.openedAt,
      handoverTime: new Date().toISOString(),
      directSales: metrics.directSales,
      salesReturns: metrics.salesReturnsTotal,
      netDirectSales: metrics.netDirectSales,
      collectedDeposits: metrics.collectedDeposits,
      dailyExpenses: metrics.dailyExpenses,
      netCash: metrics.netCash,
      salesCount: metrics.salesCount,
      expensesCount: metrics.expensesCount,
      returnsCount: metrics.returnsCount,
      itemizedItems: itemized,
    };

    triggerPrint('shift_handover', handoverData);
    playSound('success');
  };

  // Reprint past shift Z-Report
  const reprintShiftZReport = (shift) => {
    triggerPrint('zreport', {
      reportNo: shift.shiftNo || shift.reportNo || shift.id,
      sessionId: shift.sessionId,
      openedAt: shift.openedAt,
      closedAt: shift.closedAt,
      closedBy: shift.closedBy,
      directSales: shift.directSales,
      salesReturns: shift.salesReturns,
      collectedDeposits: shift.collectedDeposits,
      dailyExpenses: shift.dailyExpenses,
      netCash: shift.netCash,
      salesCount: shift.salesCount,
      expensesCount: shift.expensesCount,
      morningShift: shift.morningShift,
      eveningShift: shift.eveningShift,
      notes: shift.notes,
    });
  };

  // ==========================================
  // END-OF-DAY RESET & Z-REPORT
  // ==========================================
  const closeDayAndResetDrawer = (closingNotes = '') => {
    const closingTime = new Date().toISOString();
    const itemized = getItemizedSales(dailyTreasury.sessionSales);
    const cashier = activeCashier || storeSettings.cashierName;

    const zReport = {
      id: 'Z-' + Date.now(),
      reportNo: 'Z-' + new Date().toISOString().split('T')[0] + '-' + (zReportsHistory.length + 1),
      sessionId: currentSession.sessionId,
      openedAt: currentSession.openedAt,
      closedAt: closingTime,
      closedBy: cashier,
      directSales: dailyTreasury.directSales,
      salesReturns: dailyTreasury.salesReturnsTotal,
      collectedDeposits: dailyTreasury.collectedDeposits,
      dailyExpenses: dailyTreasury.dailyExpenses,
      netCash: dailyTreasury.netCash,
      salesCount: dailyTreasury.salesCount,
      expensesCount: dailyTreasury.expensesCount,
      returnsCount: dailyTreasury.returnsCount,
      morningShift: dailyTreasury.morningMetrics,
      eveningShift: dailyTreasury.eveningMetrics,
      notes: closingNotes,
    };

    const shiftRecord = {
      id: 'SHIFT-' + Date.now(),
      shiftNo: zReport.reportNo,
      sessionId: currentSession.sessionId,
      openedAt: currentSession.openedAt,
      closedAt: closingTime,
      closedBy: cashier,
      directSales: dailyTreasury.directSales,
      salesReturns: dailyTreasury.salesReturnsTotal,
      netDirectSales: dailyTreasury.netDirectSales,
      collectedDeposits: dailyTreasury.collectedDeposits,
      dailyExpenses: dailyTreasury.dailyExpenses,
      netCash: dailyTreasury.netCash,
      salesCount: dailyTreasury.salesCount,
      expensesCount: dailyTreasury.expensesCount,
      returnsCount: dailyTreasury.returnsCount,
      morningShift: dailyTreasury.morningMetrics,
      eveningShift: dailyTreasury.eveningMetrics,
      notes: closingNotes,
      itemizedItems: itemized,
    };

    setZReportsHistory((prev) => [zReport, ...prev]);
    setShiftHistory((prev) => [shiftRecord, ...prev]);

    // Automatically trigger printing of the Daily Z-Report
    triggerPrint('zreport', zReport);

    // Reset today's active session
    const newSessionId = 'SESSION-' + Date.now();
    setCurrentSession({
      sessionId: newSessionId,
      openedAt: new Date().toISOString(),
      closedAt: null,
    });

    playSound('success');
    return zReport;
  };

  // ==========================================
  // DELETE ARCHIVED SHIFT RECORD (MANAGER ONLY)
  // ==========================================
  const deleteShiftRecord = (shiftId, shiftNo, sessionId) => {
    setShiftHistory((prev) =>
      prev.filter((s) => s.id !== shiftId && (shiftNo ? s.shiftNo !== shiftNo : true))
    );

    setZReportsHistory((prev) =>
      prev.filter(
        (z) =>
          z.id !== shiftId &&
          (shiftNo ? z.reportNo !== shiftNo : true) &&
          (sessionId ? z.sessionId !== sessionId : true)
      )
    );

    // Clean up archived transactions tied to this closed session
    if (sessionId && sessionId !== currentSession.sessionId) {
      setSalesHistory((prev) => prev.filter((s) => s.sessionId !== sessionId));
      setSalesReturns((prev) => prev.filter((r) => r.sessionId !== sessionId));
      setExpenses((prev) => prev.filter((e) => e.sessionId !== sessionId));
    }

    playSound('remove');
  };

  // ==========================================
  // MANAGER & RESET PIN MANAGEMENT
  // ==========================================
  const verifyResetPin = (pin) => {
    return String(pin || '').trim() === String(storeSettings.resetPin || '9999').trim();
  };

  const updateManagerPin = (currentPin, newPin) => {
    const storedPin = storeSettings.managerPin || '1234';
    if (currentPin !== storedPin) {
      return { success: false, message: 'رمز المدير الحالي غير صحيح' };
    }
    if (!newPin || newPin.length < 4) {
      return { success: false, message: 'يجب أن يتكون الرمز الجديد من 4 أرقام على الأقل' };
    }
    setStoreSettings((prev) => ({
      ...prev,
      managerPin: String(newPin),
    }));
    return { success: true, message: 'تم تحديث رمز تأكيد المدير بنجاح' };
  };

  const updateResetPin = (currentManagerPin, newResetPin) => {
    const storedManagerPin = storeSettings.managerPin || '1234';
    if (String(currentManagerPin || '').trim() !== String(storedManagerPin).trim()) {
      return { success: false, message: 'رمز مرور المدير الحالي غير صحيح للتحقق من الصلاحية' };
    }
    if (!newResetPin || newResetPin.length < 4) {
      return { success: false, message: 'يجب أن يتكون رمز تصفير اليومية من 4 أرقام على الأقل' };
    }
    setStoreSettings((prev) => ({
      ...prev,
      resetPin: String(newResetPin),
    }));
    return { success: true, message: 'تم تحديث رمز تصفير اليومية المستقل بنجاح' };
  };

  // ==========================================
  // PRINT TRIGGER HELPER
  // ==========================================
  const triggerPrint = (type, data) => {
    setPrintJob({
      isOpen: true,
      type,
      data,
    });
  };

  const closePrintJob = () => {
    setPrintJob({
      isOpen: false,
      type: null,
      data: null,
    });
  };

  // ==========================================
  // BACKUP & RESTORE
  // ==========================================
  const exportSystemData = async () => {
    const backup = {
      version: '1.2',
      exportedAt: new Date().toISOString(),
      storeSettings,
      categories: cleanCategories,
      products,
      salesHistory,
      salesReturns,
      reservations,
      expenses,
      zReportsHistory,
      shiftHistory,
      userRole,
      activeCashier,
      currentSession,
      productMovementResetAt,
      multiCarts: carts,
      activeShiftType,
    };

    // If running in Desktop App, use native Windows Save Dialog
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.exportBackup === 'function') {
      try {
        const res = await window.electronAPI.exportBackup(backup);
        if (res && res.success) {
          playSound('success');
          return { success: true, filePath: res.filePath };
        } else if (res && res.canceled) {
          return { canceled: true };
        }
      } catch (e) {
        console.warn('Desktop backup save failed, falling back to browser download:', e);
      }
    }

    // Web Browser Fallback: standard automatic download
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Meska_Zafran_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playSound('success');
    return { success: true };
  };

  const importSystemData = async (jsonData) => {
    try {
      if (jsonData.storeSettings) setStoreSettings(jsonData.storeSettings);
      if (jsonData.categories) setCategories(jsonData.categories.filter((c) => c.id !== 'cat-all'));
      if (jsonData.products) setProducts(jsonData.products);
      if (jsonData.salesHistory) setSalesHistory(jsonData.salesHistory);
      if (jsonData.salesReturns) setSalesReturns(jsonData.salesReturns);
      if (jsonData.reservations) setReservations(jsonData.reservations);
      if (jsonData.expenses) setExpenses(jsonData.expenses);
      if (jsonData.zReportsHistory) setZReportsHistory(jsonData.zReportsHistory);
      if (jsonData.shiftHistory) setShiftHistory(jsonData.shiftHistory);
      if (jsonData.userRole) setUserRole(jsonData.userRole);
      if (jsonData.activeCashier) setActiveCashier(jsonData.activeCashier);
      if (jsonData.currentSession) setCurrentSession(jsonData.currentSession);
      if (jsonData.productMovementResetAt !== undefined) setProductMovementResetAt(jsonData.productMovementResetAt);
      if (jsonData.multiCarts) setCarts(jsonData.multiCarts);
      if (jsonData.activeShiftType) setActiveShiftType(jsonData.activeShiftType);

      // If running in Desktop App, mirror all imported data directly to atomic disk database
      if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.saveBatchToDisk === 'function') {
        const batch = {
          mz_settings: jsonData.storeSettings,
          mz_categories: jsonData.categories,
          mz_products: jsonData.products,
          mz_sales_history: jsonData.salesHistory,
          mz_sales_returns: jsonData.salesReturns,
          mz_reservations: jsonData.reservations,
          mz_expenses: jsonData.expenses,
          mz_zreports: jsonData.zReportsHistory,
          mz_shift_history: jsonData.shiftHistory,
          mz_user_role: jsonData.userRole,
          mz_active_cashier: jsonData.activeCashier,
          mz_current_session: jsonData.currentSession,
          mz_product_movement_reset_at: jsonData.productMovementResetAt,
          mz_multi_carts: jsonData.multiCarts,
          mz_active_shift_type: jsonData.activeShiftType,
        };
        await window.electronAPI.saveBatchToDisk(batch);
      }

      playSound('success');
      return true;
    } catch (err) {
      console.error('Import failed', err);
      return false;
    }
  };

  const resetToFactoryDefaults = () => {
    setCategories(DEFAULT_CATEGORIES);
    setProducts(DEFAULT_PRODUCTS);
    setStoreSettings(DEFAULT_STORE_SETTINGS);
    setReservations(INITIAL_RESERVATIONS);
    setExpenses(INITIAL_EXPENSES);
    setPresetExpenses(DEFAULT_PRESET_EXPENSES);
    setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
    setSalesHistory([]);
    setSalesReturns([]);
    setShiftHistory([]);
    setUserRole('cashier');
    setActiveCashier('كاشير 1');
    setCarts([{ id: 'cart-1', name: 'فاتورة 1', items: [] }]);
    setActiveCartId('cart-1');
    setProductMovementResetAt(null);
    setCurrentSession({
      sessionId: 'SESSION-' + Date.now(),
      openedAt: new Date().toISOString(),
      closedAt: null,
    });
    playSound('warning');
  };

  // ==========================================
  // CONTEXT VALUE
  // ==========================================
  const value = {
    // Boutique Brand & Global Data
    storeSettings,
    setStoreSettings,
    updateManagerPin,
    userRole,
    setUserRole,
    isManager,
    switchRole,
    activeCashier,
    setActiveCashier,
    cashierProfiles,

    // Product & Category Management
    categories,
    cleanCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    products,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    categoriesScale,
    setCategoriesScale,
    productsScale,
    setProductsScale,
    gridScale,
    setGridScale,
    addProduct,
    updateProduct,
    deleteProduct,
    reorderProducts,
    updateProductDetails,
    toggleProductAvailability,

    // Multi-Cart & Hold Orders
    carts: safeCarts,
    activeCartId,
    activeCart,
    switchCart,
    addNewCart,
    removeCart,

    // Active Cart Operations (Backwards-compatible)
    cart,
    addToCart,
    updateItemQuantity,
    removeFromCart,
    clearCart,
    overrideCartItemPrice,
    applyCartItemDiscount,
    cartSummary,

    // Sales & Checkout
    completeSale,
    salesHistory,

    // Sales Returns
    salesReturns,
    addSalesReturn,

    // Reservations
    reservations,
    addReservation,
    updateReservation,
    updateReservationStatus,
    deliverReservationAndCollectBalance,
    deleteReservation,

    // Expenses
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    undoExpense,
    printCombinedExpenses,

    // Preset / Frequent Expenses (الصرفيات المعتادة)
    presetExpenses,
    addPresetExpense,
    updatePresetExpense,
    deletePresetExpense,
    resetPresetExpenses,

    // Dynamic Expense Categories (تصنيفات الصرفيات)
    expenseCategories,
    addExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
    resetExpenseCategories,

    // Treasury, Shifts & Z-Report
    currentSession,
    dailyTreasury,
    activeShiftType,
    setActiveShiftType,
    switchShift,
    printShiftHandover,
    closeDayAndResetDrawer,
    zReportsHistory,
    shiftHistory,
    setShiftHistory,
    printXReport,
    reprintShiftZReport,
    deleteShiftRecord,

    // Printing
    printJob,
    triggerPrint,
    closePrintJob,

    // Security PIN Management
    verifyManagerPin,
    verifyResetPin,
    updateResetPin,

    // Product Movement Statistical Cycle
    productMovementResetAt,
    resetProductMovement,

    // System Utilities
    playSound,
    exportSystemData,
    importSystemData,
    resetToFactoryDefaults,

    // Crash Recovery & Real-Time Persistence
    sessionRestoredNotice,
    setSessionRestoredNotice,

    // Toast Notifications
    toast,
    setToast,
    showToast,
  };

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
}

export function usePOS() {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
}
