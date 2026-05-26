import { useState, useCallback, useEffect } from 'react';
import { CartItem, HeldOrder, MenuItem, CompletedOrder, OrderSummary, PaymentMethod, SplitPayment } from '../types';
import { supabase } from '../supabaseClient';
import {
  createCompletedOrderInSupabase,
  createHeldOrderInSupabase,
  deleteHeldOrderFromSupabase,
  fetchHeldOrdersFromSupabase,
  resumeHeldOrderFromSupabase,
} from '../lib/posDb';

const GST_RATE = 5; // 5% GST
const HELD_ORDERS_KEY = 'pos.heldOrders';
const COMPLETED_ORDERS_KEY = 'pos.completedOrders';
const ORDER_COUNTER_KEY = 'pos.orderCounter';
const dbEnabled = !!supabase;

let orderCounter = Number(localStorage.getItem(ORDER_COUNTER_KEY) || 1000);

const round2 = (value: number) => Math.round(value * 100) / 100;

export function generateInvoiceNumber(): string {
  orderCounter++;
  localStorage.setItem(ORDER_COUNTER_KEY, String(orderCounter));
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  return `INV-${dateStr}-${orderCounter}`;
}

export function generateOrderNumber(): string {
  orderCounter++;
  localStorage.setItem(ORDER_COUNTER_KEY, String(orderCounter));
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  return `ORD-${dateStr}-${orderCounter}`;
}

export function calculateOrderSummary(
  items: CartItem[],
  discountValue: number,
  discountType: 'percent' | 'flat',
  gstRate: number = GST_RATE
): OrderSummary {
  const subtotal = round2(items.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0));
  const safeDiscountValue = Math.max(0, discountValue || 0);

  let discountAmount = 0;
  if (discountType === 'percent') {
    const safePercent = Math.min(100, safeDiscountValue);
    discountAmount = (subtotal * safePercent) / 100;
  } else {
    discountAmount = Math.min(safeDiscountValue, subtotal);
  }

  discountAmount = round2(discountAmount);
  const taxableAmount = round2(subtotal - discountAmount);
  const gstAmount = round2((taxableAmount * gstRate) / 100);
  const total = round2(taxableAmount + gstAmount);

  return {
    subtotal,
    gstRate,
    gstAmount,
    discount: discountValue,
    discountType,
    discountAmount,
    total,
  };
}

export function usePOSStore() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>(() => {
    if (dbEnabled) return [];
    try {
      const saved = localStorage.getItem(HELD_ORDERS_KEY);
      if (!saved) return [];
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>(() => {
    if (dbEnabled) return [];
    try {
      const saved = localStorage.getItem(COMPLETED_ORDERS_KEY);
      if (!saved) return [];
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });
  const [tableNumber, setTableNumber] = useState('T1');
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showHoldOrders, setShowHoldOrders] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<CompletedOrder | null>(null);
  const [currentHeldOrderId, setCurrentHeldOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (dbEnabled) return;
    localStorage.setItem(HELD_ORDERS_KEY, JSON.stringify(heldOrders));
  }, [heldOrders]);

  useEffect(() => {
    if (dbEnabled) return;
    localStorage.setItem(COMPLETED_ORDERS_KEY, JSON.stringify(completedOrders));
  }, [completedOrders]);

  useEffect(() => {
    if (!dbEnabled) return;
    // Load held orders from Supabase on startup.
    (async () => {
      try {
        const orders = await fetchHeldOrdersFromSupabase();
        setHeldOrders(orders);
      } catch {
        // If DB fails, keep UI working with empty held orders.
      }
    })();
  }, []);

  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(ci => ci.item.id === item.id);
      if (existing) {
        return prev.map(ci =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(ci => ci.item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(ci =>
        ci.item.id === itemId ? { ...ci, quantity: Math.max(0, ci.quantity + delta) } : ci
      );
      return updated.filter(ci => ci.quantity > 0);
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setDiscount(0);
    setDiscountType('percent');
    setCustomerName('');
    setCurrentHeldOrderId(null);
  }, []);

  const holdOrder = useCallback(() => {
    if (cart.length === 0) return;

    const summary = calculateOrderSummary(cart, discount, discountType);

    if (!dbEnabled) {
      const newHeld: HeldOrder = {
        id: currentHeldOrderId || `HOLD-${Date.now()}`,
        items: [...cart],
        tableNumber,
        customerName,
        createdAt: new Date(),
        discount,
        discountType,
      };

      setHeldOrders(prev => {
        const exists = prev.find(o => o.id === newHeld.id);
        if (exists) {
          return prev.map(o => (o.id === newHeld.id ? newHeld : o));
        }
        return [...prev, newHeld];
      });

      clearCart();
      return;
    }

    // Persist hold to Supabase (fallback to local state on failure).
    (async () => {
      try {
        const orderId = await createHeldOrderInSupabase({
          orderNumber: generateOrderNumber(),
          tableNumber,
          customerName,
          discountType,
          discountValue: discount,
          summary,
          items: cart,
        });

        const orders = await fetchHeldOrdersFromSupabase();
        setHeldOrders(orders);
        setCurrentHeldOrderId(orderId);
        clearCart();
      } catch {
        const newHeld: HeldOrder = {
          id: currentHeldOrderId || `HOLD-${Date.now()}`,
          items: [...cart],
          tableNumber,
          customerName,
          createdAt: new Date(),
          discount,
          discountType,
        };
        setHeldOrders(prev => [...prev, newHeld]);
        clearCart();
      }
    })();
  }, [cart, tableNumber, customerName, discount, discountType, currentHeldOrderId, clearCart]);

  const resumeOrder = useCallback((orderId: string) => {
    if (!dbEnabled) {
      const held = heldOrders.find(o => o.id === orderId);
      if (!held) return;

      setCart(held.items);
      setTableNumber(held.tableNumber);
      setCustomerName(held.customerName);
      setDiscount(held.discount);
      setDiscountType(held.discountType);
      setCurrentHeldOrderId(held.id);
      setHeldOrders(prev => prev.filter(o => o.id !== orderId));
      setShowHoldOrders(false);
      return;
    }

    (async () => {
      try {
        const held = await resumeHeldOrderFromSupabase(orderId);
        if (!held) return;

        setCart(held.items);
        setTableNumber(held.tableNumber);
        setCustomerName(held.customerName);
        setDiscount(held.discount);
        setDiscountType(held.discountType);
        setCurrentHeldOrderId(held.id);
        // Order is consumed server-side; refresh held list.
        const orders = await fetchHeldOrdersFromSupabase();
        setHeldOrders(orders);
        setShowHoldOrders(false);
      } catch {
        const localHeld = heldOrders.find(o => o.id === orderId);
        if (!localHeld) return;
        setCart(localHeld.items);
        setTableNumber(localHeld.tableNumber);
        setCustomerName(localHeld.customerName);
        setDiscount(localHeld.discount);
        setDiscountType(localHeld.discountType);
        setCurrentHeldOrderId(localHeld.id);
        setHeldOrders(prev => prev.filter(o => o.id !== orderId));
        setShowHoldOrders(false);
      }
    })();
  }, [heldOrders]);

  const deleteHeldOrder = useCallback((orderId: string) => {
    if (!dbEnabled) {
      setHeldOrders(prev => prev.filter(o => o.id !== orderId));
      return;
    }

    (async () => {
      try {
        await deleteHeldOrderFromSupabase(orderId);
        const orders = await fetchHeldOrdersFromSupabase();
        setHeldOrders(orders);
      } catch {
        setHeldOrders(prev => prev.filter(o => o.id !== orderId));
      }
    })();
  }, []);

  const completeOrder = useCallback((
    paymentMethod: PaymentMethod,
    splitPayment?: SplitPayment
  ) => {
    if (cart.length === 0) return;

    const summary = calculateOrderSummary(cart, discount, discountType);
    if (paymentMethod === 'split' && splitPayment) {
      const paid = round2(splitPayment.cash + splitPayment.upi + splitPayment.card);
      if (Math.abs(paid - summary.total) > 0.01) return;
    }
    const invoiceNumber = generateInvoiceNumber();
    const orderNumber = generateOrderNumber();

    const completedDraft: CompletedOrder = {
      id: `PENDING-${Date.now()}`,
      items: [...cart],
      tableNumber,
      customerName,
      createdAt: new Date(),
      completedAt: new Date(),
      discount,
      discountType,
      payment: paymentMethod,
      splitPayment,
      orderSummary: summary,
      invoiceNumber,
    };

    if (!dbEnabled) {
      setCompletedOrders(prev => [...prev, completedDraft]);
      setLastCompletedOrder(completedDraft);
      clearCart();
      setShowPaymentModal(false);
      setShowInvoice(true);
      return;
    }

    (async () => {
      try {
        const orderId = await createCompletedOrderInSupabase({
          orderNumber,
          invoiceNumber,
          tableNumber,
          customerName,
          discountType,
          discountValue: discount,
          summary,
          items: cart,
          paymentMethod,
          splitPayment,
        });

        const completed: CompletedOrder = { ...completedDraft, id: orderId };
        setLastCompletedOrder(completed);
        setCompletedOrders(prev => [...prev, completed]);
        clearCart();
        setShowPaymentModal(false);
        setShowInvoice(true);
      } catch {
        setCompletedOrders(prev => [...prev, completedDraft]);
        setLastCompletedOrder(completedDraft);
        clearCart();
        setShowPaymentModal(false);
        setShowInvoice(true);
      }
    })();
  }, [cart, tableNumber, customerName, discount, discountType, clearCart]);

  const orderSummary = calculateOrderSummary(cart, discount, discountType);

  return {
    cart, setCart,
    heldOrders,
    completedOrders,
    tableNumber, setTableNumber,
    customerName, setCustomerName,
    discount, setDiscount,
    discountType, setDiscountType,
    activeCategory, setActiveCategory,
    searchQuery, setSearchQuery,
    showPaymentModal, setShowPaymentModal,
    showInvoice, setShowInvoice,
    showHoldOrders, setShowHoldOrders,
    lastCompletedOrder,
    currentHeldOrderId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    holdOrder,
    resumeOrder,
    deleteHeldOrder,
    completeOrder,
    orderSummary,
  };
}
