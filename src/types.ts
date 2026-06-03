export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
  modifiers?: string[];
}

export interface HeldOrder {
  id: string;
  items: CartItem[];
  tableNumber: string;
  customerName: string;
  createdAt: Date;
  discount: number;
  discountType: 'percent' | 'flat';
}

export interface OrderSummary {
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  discount: number;
  discountType: 'percent' | 'flat';
  discountAmount: number;
  total: number;
}

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'split';

export interface SplitPayment {
  cash: number;
  upi: number;
  card: number;
}

export interface CompletedOrder extends HeldOrder {
  completedAt: Date;
  payment: PaymentMethod;
  splitPayment?: SplitPayment;
  orderSummary: OrderSummary;
  invoiceNumber: string;
}
