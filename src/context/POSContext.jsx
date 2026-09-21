import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAudioBeep } from '../hooks/useAudioBeep';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_STORE_SETTINGS,
  INITIAL_RESERVATIONS,
  INITIAL_EXPENSES,
} from '../data/defaultData';

const POSContext = createContext(null);

export function POSProvider({ children }) {
  const audio = useAudioBeep();

  // 1. Core Settings & Store Info
  const [storeSettings, setStoreSettings] = useLocalStorage('mz_settings', DEFAULT_STORE_SETTINGS);

  // 2. Catalog (Categories & Products)
  const [categories, setCategories] = useLocalStorage('mz_categories', DEFAULT_CATEGORIES);
  const [products, setProducts] = useLocalStorage('mz_products', DEFAULT_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState('cat-all');
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Active Cart State
  const [cart, setCart] = useLocalStorage('mz_active_cart', []);

  // 4. Drawer Sessions & Treasury
  // Current active session ID
  const [currentSession, setCurrentSession] = useLocalStorage('mz_current_session', {
    sessionId: 'SESSION-' + new Date().toISOString().split('T')[0],
    openedAt: new Date().toISOString(),
    closedAt: null,
  });

  // Permanent Sales History
  const [salesHistory, setSalesHistory] = useLocalStorage('mz_sales_history', []);

  // Permanent Reservations Record
  const [reservations, setReservations] = useLocalStorage('mz_reservations', INITIAL_RESERVATIONS);

  // Permanent Expenses Archive (NEVER deleted on daily reset)
  const [expenses, setExpenses] = useLocalStorage('mz_expenses', INITIAL_EXPENSES);

  // Permanent Z-Reports Archive
  const [zReportsHistory, setZReportsHistory] = useLocalStorage('mz_zreports', []);

  // 5. Thermal Printing State
  const [printJob, setPrintJob] = useState({
    isOpen: false,
    type: null, // 'sale' | 'reservation' | 'expense' | 'zreport'
    data: null,
  });

  // Sound helper wrapper checking store settings
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
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const addProduct = (productData) => {
    const newProduct = {
      id: 'prod-' + Date.now(),
      name: productData.name,
      categoryId: productData.categoryId || 'cat-cakes',
      price: Number(productData.price) || 0,
      cost: Number(productData.cost) || 0,
      emoji: productData.emoji || '🍰',
      image: productData.image || '',
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
    // Also remove from cart if present
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const toggleProductAvailability = (id) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p))
    );
  };

  // ==========================================
  // CART OPERATIONS & SINGLE-ORDER OVERRIDE
  // ==========================================
  const addToCart = (product, customPrice = null) => {
    playSound('add');
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id
      );

      const resolvedPrice =
        customPrice !== null ? Number(customPrice) : Number(product.price);

      if (existingIndex > -1 && customPrice === null) {
        // Increment quantity if standard catalog price
        return prevCart.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // If new item or custom priced service item
      return [
        ...prevCart,
        {
          cartItemId: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          product,
          quantity: 1,
          originalPrice: Number(product.price),
          unitPrice: resolvedPrice, // Can be overridden for this order only
          discount: 0, // Deduction discount in currency amount for this item
          isOverridden: customPrice !== null && customPrice !== product.price,
          note: '',
        },
      ];
    });
  };

  const updateItemQuantity = (cartItemId, newQuantity) => {
    const qty = Number(newQuantity);
    if (qty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: qty } : item
      )
    );
  };

  const removeFromCart = (cartItemId) => {
    playSound('remove');
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // SINGLE-ORDER OVERRIDE: Modify unit price strictly for this cart order
  const overrideCartItemPrice = (cartItemId, newPrice) => {
    const price = Number(newPrice);
    if (isNaN(price) || price < 0) return;
    setCart((prev) =>
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

  // SINGLE-ORDER DISCOUNT: Deduct fixed amount from the item
  const applyCartItemDiscount = (cartItemId, discountAmount) => {
    const disc = Number(discountAmount);
    setCart((prev) =>
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
  // CART FINANCIAL TOTALS CALCULATION
  // ==========================================
  const cartSummary = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let depositItemsTotal = 0;

    cart.forEach((item) => {
      const lineOriginal = item.originalPrice * item.quantity;
      const lineEffective = Math.max(0, (item.unitPrice * item.quantity) - item.discount);
      const lineDiscount = Math.max(0, lineOriginal - lineEffective);

      subtotal += lineOriginal;
      totalDiscount += lineDiscount;

      if (item.product.isDeposit || item.product.id === 'service-deposit') {
        depositItemsTotal += lineEffective;
      }
    });

    const netTotal = Math.max(0, subtotal - totalDiscount);

    return {
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      totalDiscount,
      netTotal,
      depositItemsTotal,
    };
  }, [cart]);

  // ==========================================
  // COMPLETE SALE / CHECKOUT
  // ==========================================
  const completeSale = (paymentData) => {
    if (cart.length === 0) return null;

    const receiptNo = 'INV-' + new Date().getFullYear() + '-' + (salesHistory.length + 1001);
    
    // Check if cart contains any advance deposits
    const depositAmountInCart = cart
      .filter((item) => item.product.isDeposit || item.product.id === 'service-deposit')
      .reduce((sum, item) => sum + Math.max(0, item.unitPrice * item.quantity - item.discount), 0);

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
      paymentMethod: paymentData.paymentMethod || 'نقداً', // نقداً, بطاقة, آجل
      customerName: paymentData.customerName || 'زبون عام',
      cashierName: storeSettings.cashierName,
      date: new Date().toISOString(),
      notes: paymentData.notes || '',
    };

    setSalesHistory((prev) => [newSale, ...prev]);
    clearCart();
    playSound('success');

    // Trigger Print Receipt
    triggerPrint('sale', newSale);

    return newSale;
  };

  // ==========================================
  // RESERVATIONS MODULE
  // ==========================================
  const addReservation = (reservationData, ringUpDepositToDrawer = true) => {
    const receiptNumber = 'RES-' + new Date().getFullYear() + '-' + (reservations.length + 1001);
    const deposit = Number(reservationData.depositPaid) || 0;
    const total = Number(reservationData.totalCost) || 0;
    const remaining = Math.max(0, total - deposit);

    const newReservation = {
      id: 'RES-' + Date.now(),
      receiptNumber,
      customerName: reservationData.customerName,
      phone: reservationData.phone,
      pickupDate: reservationData.pickupDate,
      pickupTime: reservationData.pickupTime || '18:00',
      cakeSize: reservationData.cakeSize || '1',
      cakeDesign: reservationData.cakeDesign || '',
      cakeFlavor: reservationData.cakeFlavor || '',
      writtenText: reservationData.writtenText || '',
      totalCost: total,
      depositPaid: deposit,
      remainingBalance: remaining,
      status: 'قيد التحضير', // قيد التحضير, جاهز, تم التسليم, ملغي
      notes: reservationData.notes || '',
      createdAt: new Date().toISOString(),
      depositSessionId: currentSession.sessionId,
    };

    setReservations((prev) => [newReservation, ...prev]);

    // If cashier opted to ring up the deposit into today's drawer immediately
    if (ringUpDepositToDrawer && deposit > 0) {
      const depositSale = {
        id: 'SALE-DEP-' + Date.now(),
        receiptNo: 'DEP-' + receiptNumber,
        sessionId: currentSession.sessionId,
        items: [
          {
            cartItemId: 'item-res-dep-' + Date.now(),
            product: {
              id: 'service-deposit',
              name: `عربون حجز كيك (${reservationData.customerName} - قياس ${reservationData.cakeSize})`,
              isDeposit: true,
              emoji: '💵',
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
        cashierName: storeSettings.cashierName,
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
    // Ring up the remaining balance into today's sales
    if (reservation.remainingBalance > 0) {
      const remainingSale = {
        id: 'SALE-REM-' + Date.now(),
        receiptNo: 'REM-' + reservation.receiptNumber,
        sessionId: currentSession.sessionId,
        items: [
          {
            cartItemId: 'item-res-rem-' + Date.now(),
            product: {
              id: 'service-remaining',
              name: `متبقي حجز كيك (${reservation.customerName} - ${reservation.receiptNumber})`,
              isDeposit: false,
              emoji: '💰',
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
        cashierName: storeSettings.cashierName,
        date: new Date().toISOString(),
        reservationId: reservation.id,
        notes: `تسليم طلب كيك واستلام المتبقي للحجز ${reservation.receiptNumber}`,
      };
      setSalesHistory((prev) => [remainingSale, ...prev]);
      triggerPrint('sale', remainingSale);
    }

    // Update reservation status to delivered and remaining to 0
    setReservations((prev) =>
      prev.map((r) =>
        r.id === reservation.id
          ? { ...r, status: 'تم التسليم', depositPaid: r.totalCost, remainingBalance: 0 }
          : r
      )
    );
    playSound('success');
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
      recordedBy: storeSettings.cashierName,
    };

    setExpenses((prev) => [newExpense, ...prev]);
    playSound('remove');

    // Trigger Print Expense Voucher
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
  };

  // ==========================================
  // DYNAMIC DAILY TREASURY METRICS
  // ==========================================
  const dailyTreasury = useMemo(() => {
    const activeSessionId = currentSession.sessionId;

    // Filter sales strictly for today's active session
    const sessionSales = salesHistory.filter(
      (s) => s.sessionId === activeSessionId
    );

    // 1. Total Direct Sales (excluding deposits)
    const directSales = sessionSales.reduce(
      (sum, s) => sum + (s.directSalesAmount !== undefined ? s.directSalesAmount : s.netTotal),
      0
    );

    // 2. Total Collected Deposits (itemized from "عربون حجز")
    const collectedDeposits = sessionSales.reduce(
      (sum, s) => sum + (s.depositAmount || 0),
      0
    );

    // 3. Total Daily Expenses in this session
    const sessionExpenses = expenses.filter(
      (e) => e.sessionId === activeSessionId
    );
    const dailyExpenses = sessionExpenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0
    );

    // 4. Net Cash in Drawer = (Direct Sales + Deposits) - Daily Expenses
    const netCash = (directSales + collectedDeposits) - dailyExpenses;

    return {
      sessionSales,
      sessionExpenses,
      directSales,
      collectedDeposits,
      dailyExpenses,
      netCash,
      salesCount: sessionSales.length,
      expensesCount: sessionExpenses.length,
    };
  }, [salesHistory, expenses, currentSession]);

  // ==========================================
  // END-OF-DAY RESET & Z-REPORT
  // ==========================================
  const closeDayAndResetDrawer = (closingNotes = '') => {
    const closingTime = new Date().toISOString();

    const zReport = {
      id: 'Z-' + Date.now(),
      reportNo: 'Z-' + new Date().toISOString().split('T')[0] + '-' + (zReportsHistory.length + 1),
      sessionId: currentSession.sessionId,
      openedAt: currentSession.openedAt,
      closedAt: closingTime,
      closedBy: storeSettings.cashierName,
      directSales: dailyTreasury.directSales,
      collectedDeposits: dailyTreasury.collectedDeposits,
      dailyExpenses: dailyTreasury.dailyExpenses,
      netCash: dailyTreasury.netCash,
      salesCount: dailyTreasury.salesCount,
      expensesCount: dailyTreasury.expensesCount,
      notes: closingNotes,
    };

    // 1. Save Z-Report to historical archive
    setZReportsHistory((prev) => [zReport, ...prev]);

    // 2. Automatically print the Daily Z-Report
    triggerPrint('zreport', zReport);

    // 3. Reset today's active sales, deposits, and daily expenses counters to 0 for the new day
    // by starting a fresh active session
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
  const exportSystemData = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      storeSettings,
      categories,
      products,
      salesHistory,
      reservations,
      expenses,
      zReportsHistory,
      currentSession,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Meska_Zafran_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSystemData = (jsonData) => {
    try {
      if (jsonData.storeSettings) setStoreSettings(jsonData.storeSettings);
      if (jsonData.categories) setCategories(jsonData.categories);
      if (jsonData.products) setProducts(jsonData.products);
      if (jsonData.salesHistory) setSalesHistory(jsonData.salesHistory);
      if (jsonData.reservations) setReservations(jsonData.reservations);
      if (jsonData.expenses) setExpenses(jsonData.expenses);
      if (jsonData.zReportsHistory) setZReportsHistory(jsonData.zReportsHistory);
      if (jsonData.currentSession) setCurrentSession(jsonData.currentSession);
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
    setSalesHistory([]);
    setCart([]);
    setCurrentSession({
      sessionId: 'SESSION-' + Date.now(),
      openedAt: new Date().toISOString(),
      closedAt: null,
    });
    playSound('warning');
  };

  const value = {
    // Settings & Branding
    storeSettings,
    setStoreSettings,

    // Catalog
    categories,
    products,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    addCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,

    // Cart
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

    // Reservations
    reservations,
    addReservation,
    updateReservationStatus,
    deliverReservationAndCollectBalance,

    // Expenses
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,

    // Treasury & Z-Report
    currentSession,
    dailyTreasury,
    closeDayAndResetDrawer,
    zReportsHistory,

    // Printing
    printJob,
    triggerPrint,
    closePrintJob,

    // System Utilities
    playSound,
    exportSystemData,
    importSystemData,
    resetToFactoryDefaults,
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
