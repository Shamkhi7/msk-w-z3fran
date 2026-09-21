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

  // 1. Core Settings & Store Info (with default managerPin: '1234')
  const [storeSettings, setStoreSettings] = useLocalStorage('mz_settings', DEFAULT_STORE_SETTINGS);

  // 2. Catalog (Categories & Products)
  // Ensure 'cat-all' is removed even if previously cached in localStorage
  const [categories, setCategories] = useLocalStorage('mz_categories', DEFAULT_CATEGORIES);
  const cleanCategories = useMemo(() => {
    return categories.filter((c) => c.id !== 'cat-all');
  }, [categories]);

  const [products, setProducts] = useLocalStorage('mz_products', DEFAULT_PRODUCTS);
  // Default to first valid category ('cat-cakes')
  const [activeCategory, setActiveCategory] = useState('cat-cakes');
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Active Cart State
  const [cart, setCart] = useLocalStorage('mz_active_cart', []);

  // 4. Drawer Sessions & Treasury
  const [currentSession, setCurrentSession] = useLocalStorage('mz_current_session', {
    sessionId: 'SESSION-' + new Date().toISOString().split('T')[0],
    openedAt: new Date().toISOString(),
    closedAt: null,
  });

  // Permanent Sales History
  const [salesHistory, setSalesHistory] = useLocalStorage('mz_sales_history', []);

  // Sales Returns / Refunds History
  const [salesReturns, setSalesReturns] = useLocalStorage('mz_sales_returns', []);

  // Permanent Reservations Record
  const [reservations, setReservations] = useLocalStorage('mz_reservations', INITIAL_RESERVATIONS);

  // Permanent Expenses Archive (NEVER deleted on daily reset)
  const [expenses, setExpenses] = useLocalStorage('mz_expenses', INITIAL_EXPENSES);

  // Permanent Z-Reports Archive
  const [zReportsHistory, setZReportsHistory] = useLocalStorage('mz_zreports', []);

  // Permanent Shift History Archive (Full records & itemized breakdown)
  const [shiftHistory, setShiftHistory] = useLocalStorage('mz_shift_history', []);

  // User Roles & Cashier Profiles
  const [userRole, setUserRole] = useLocalStorage('mz_user_role', 'cashier'); // 'cashier' | 'manager'
  const [activeCashier, setActiveCashier] = useLocalStorage('mz_active_cashier', 'كاشير 1');
  const cashierProfiles = ['كاشير 1', 'كاشير 2'];

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
  // CART FINANCIAL TOTALS
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
      paymentMethod: paymentData.paymentMethod || 'نقداً',
      customerName: paymentData.customerName || 'زبون عام',
      cashierName: activeCashier || storeSettings.cashierName,
      date: new Date().toISOString(),
      notes: paymentData.notes || '',
    };

    setSalesHistory((prev) => [newSale, ...prev]);
    clearCart();
    playSound('success');

    triggerPrint('sale', newSale);
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
      status: 'قيد التحضير',
      notes: reservationData.notes || '',
      createdAt: new Date().toISOString(),
      depositSessionId: currentSession.sessionId,
    };

    setReservations((prev) => [newReservation, ...prev]);

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

    // 2. Sales Returns / Refunds in this session
    const sessionReturns = salesReturns.filter(
      (r) => r.sessionId === activeSessionId
    );
    const salesReturnsTotal = sessionReturns.reduce(
      (sum, r) => sum + Number(r.amount),
      0
    );

    // Net Direct Sales after subtracting returns
    const netDirectSales = Math.max(0, directSales - salesReturnsTotal);

    // 3. Total Collected Deposits
    const collectedDeposits = sessionSales.reduce(
      (sum, s) => sum + (s.depositAmount || 0),
      0
    );

    // 4. Total Daily Expenses in this session
    const sessionExpenses = expenses.filter(
      (e) => e.sessionId === activeSessionId
    );
    const dailyExpenses = sessionExpenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0
    );

    // 5. Net Cash in Drawer = (Direct Sales - Sales Returns + Deposits) - Daily Expenses
    const netCash = (directSales - salesReturnsTotal + collectedDeposits) - dailyExpenses;

    return {
      sessionSales,
      sessionExpenses,
      sessionReturns,
      directSales,
      salesReturnsTotal,
      netDirectSales,
      collectedDeposits,
      dailyExpenses,
      netCash,
      salesCount: sessionSales.length,
      expensesCount: sessionExpenses.length,
      returnsCount: sessionReturns.length,
    };
  }, [salesHistory, salesReturns, expenses, currentSession]);

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
  // MANAGER PIN MANAGEMENT
  // ==========================================
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
      version: '1.1',
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
    setSalesReturns([]);
    setShiftHistory([]);
    setUserRole('cashier');
    setActiveCashier('كاشير 1');
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
    updateManagerPin,

    // User Roles & Cashier Profiles
    userRole,
    setUserRole,
    activeCashier,
    setActiveCashier,
    cashierProfiles,
    isManager,
    verifyManagerPin,
    switchRole,

    // Catalog
    categories: cleanCategories,
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

    // Sales Returns
    salesReturns,
    addSalesReturn,

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
    printCombinedExpenses,

    // Treasury, Shifts & Z-Report
    currentSession,
    dailyTreasury,
    closeDayAndResetDrawer,
    zReportsHistory,
    shiftHistory,
    setShiftHistory,
    printXReport,
    reprintShiftZReport,

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
