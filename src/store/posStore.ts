import { useState, useCallback } from 'react';
import { CartItem, HeldOrder, MenuItem, CompletedOrder, OrderSummary, PaymentMethod, SplitPayment } from '../types';

const GST_RATE = 5; // 5% GST

let orderCounter = 1000;

export function generateInvoiceNumber(): string {
  orderCounter++;
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  return `INV-${dateStr}-${orderCounter}`;
}

export function calculateOrderSummary(
  items: CartItem[],
  discountValue: number,
  discountType: 'percent' | 'flat',
  gstRate: number = GST_RATE
): OrderSummary {
  const subtotal = items.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = (subtotal * discountValue) / 100;
  } else {
    discountAmount = Math.min(discountValue, subtotal);
  }

  const taxableAmount = subtotal - discountAmount;
  const gstAmount = (taxableAmount * gstRate) / 100;
  const total = taxableAmount + gstAmount;

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
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
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
        return prev.map(o => o.id === newHeld.id ? newHeld : o);
      }
      return [...prev, newHeld];
    });

    clearCart();
  }, [cart, tableNumber, customerName, discount, discountType, currentHeldOrderId, clearCart]);

  const resumeOrder = useCallback((orderId: string) => {
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
  }, [heldOrders]);

  const deleteHeldOrder = useCallback((orderId: string) => {
    setHeldOrders(prev => prev.filter(o => o.id !== orderId));
  }, []);

  const completeOrder = useCallback((
    paymentMethod: PaymentMethod,
    splitPayment?: SplitPayment
  ) => {
    if (cart.length === 0) return;

    const summary = calculateOrderSummary(cart, discount, discountType);
    const completed: CompletedOrder = {
      id: `ORD-${Date.now()}`,
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
      invoiceNumber: generateInvoiceNumber(),
    };

    setCompletedOrders(prev => [...prev, completed]);
    setLastCompletedOrder(completed);
    clearCart();
    setShowPaymentModal(false);
    setShowInvoice(true);
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
