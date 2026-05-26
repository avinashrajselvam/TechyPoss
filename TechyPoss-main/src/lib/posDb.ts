import type { CartItem, HeldOrder, MenuItem, OrderSummary, PaymentMethod, SplitPayment } from '../types';
import { supabase } from '../supabaseClient';

const PLACEHOLDER_IMAGE =
  'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=400';

const round2 = (value: number) => Math.round(value * 100) / 100;

type ProductRow = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  price: number | string;
  is_veg: boolean;
  is_available: boolean;
  tags: string[] | null;
};

type HeldOrderRow = {
  id: string;
  table_number: string;
  customer_name: string | null;
  created_at: string;
  discount_value: number | string | null;
  discount_type: 'percent' | 'flat' | null;
};

type OrderItemRow = {
  order_id: string;
  product_id: string;
  quantity: number | string;
  notes: string | null;
  product_name_snapshot: string;
  product_price_snapshot: number | string;
};

function requireSupabase(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error('Supabase is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
  return supabase;
}

function mapProductRowToMenuItem(product: ProductRow, priceOverride?: number, nameOverride?: string): MenuItem {
  return {
    id: String(product.id),
    name: nameOverride ?? String(product.name),
    category: String(product.category ?? ''),
    price: typeof priceOverride === 'number' ? priceOverride : Number(product.price),
    description: String(product.description ?? ''),
    image: PLACEHOLDER_IMAGE,
    isVeg: Boolean(product.is_veg),
    isAvailable: Boolean(product.is_available),
    tags: (product.tags ?? []) as string[],
  };
}

export async function fetchProductsFromSupabase(): Promise<MenuItem[]> {
  if (!supabase) return [];
  const db = requireSupabase();

  // Note: our existing schema may not include `image`. We handle missing image via fallback in mapping.
  const { data, error } = await db
    .from('products')
    .select('id, name, category, description, price, is_veg, is_available, tags');

  if (error) throw error;

  const rows = (data ?? []) as ProductRow[];
  return rows.map(p => mapProductRowToMenuItem(p));
}

export async function fetchHeldOrdersFromSupabase(): Promise<HeldOrder[]> {
  if (!supabase) return [];
  const db = requireSupabase();

  const { data: orderRows, error: ordersError } = await db
    .from('orders')
    .select('id, table_number, customer_name, created_at, discount_value, discount_type')
    .eq('status', 'held')
    .order('created_at', { ascending: false });

  if (ordersError) throw ordersError;
  const orders = (orderRows ?? []) as HeldOrderRow[];
  if (orders.length === 0) return [];

  const orderIds = orders.map(o => String(o.id));

  const { data: itemRows, error: itemsError } = await db
    .from('order_items')
    .select('order_id, product_id, quantity, notes, product_name_snapshot, product_price_snapshot')
    .in('order_id', orderIds);

  if (itemsError) throw itemsError;

  const items = (itemRows ?? []) as OrderItemRow[];
  const productIds = Array.from(new Set(items.map(i => String(i.product_id))));

  const { data: productRows, error: productsError } = await db
    .from('products')
    .select('id, name, category, description, price, is_veg, is_available, tags')
    .in('id', productIds);

  if (productsError) throw productsError;

  const products = (productRows ?? []) as ProductRow[];
  const productById = new Map(products.map(p => [String(p.id), p]));

  const itemsByOrderId = new Map<string, OrderItemRow[]>();
  for (const it of items) {
    const oid = String(it.order_id);
    const arr = itemsByOrderId.get(oid) ?? [];
    arr.push(it);
    itemsByOrderId.set(oid, arr);
  }

  return orders.map(o => {
    const orderItems = itemsByOrderId.get(String(o.id)) ?? [];
    const cartItems: CartItem[] = orderItems.map((it: OrderItemRow) => {
      const product = productById.get(String(it.product_id));
      if (!product) {
        // If product row is missing, still render something for the cart.
        return {
          item: {
            id: String(it.product_id),
            name: String(it.product_name_snapshot ?? 'Unknown'),
            category: '',
            price: Number(it.product_price_snapshot ?? 0),
            description: '',
            image: PLACEHOLDER_IMAGE,
            isVeg: true,
            isAvailable: true,
          },
          quantity: Number(it.quantity ?? 0),
          notes: it.notes ?? undefined,
        };
      }

      return {
        item: mapProductRowToMenuItem(
          product,
            Number(it.product_price_snapshot ?? product.price),
            String(it.product_name_snapshot ?? product.name),
        ),
        quantity: Number(it.quantity ?? 0),
        notes: it.notes ?? undefined,
      };
    });

    return {
      id: String(o.id),
      items: cartItems,
      tableNumber: String(o.table_number),
      customerName: o.customer_name ? String(o.customer_name) : '',
      createdAt: new Date(o.created_at),
      discount: Number(o.discount_value ?? 0),
      discountType: (o.discount_type ?? 'percent') as 'percent' | 'flat',
    };
  });
}

export async function deleteHeldOrderFromSupabase(orderId: string): Promise<void> {
  if (!supabase) return;
  const db = requireSupabase();
  const { error } = await db.from('orders').delete().eq('id', orderId);
  if (error) throw error;
}

export async function resumeHeldOrderFromSupabase(orderId: string): Promise<HeldOrder | null> {
  if (!supabase) return null;
  const db = requireSupabase();

  const { data: orderRow, error: orderErr } = await db
    .from('orders')
    .select('id, table_number, customer_name, created_at, discount_value, discount_type')
    .eq('id', orderId)
    .eq('status', 'held')
    .maybeSingle();

  if (orderErr) throw orderErr;
  if (!orderRow) return null;

  const { data: itemRows, error: itemsError } = await db
    .from('order_items')
    .select('order_id, product_id, quantity, notes, product_name_snapshot, product_price_snapshot')
    .eq('order_id', orderId);
  if (itemsError) throw itemsError;

  const items = (itemRows ?? []) as OrderItemRow[];
  const productIds = Array.from(new Set(items.map(i => String(i.product_id))));

  const { data: productRows, error: productsError } = await db
    .from('products')
    .select('id, name, category, description, price, is_veg, is_available, tags')
    .in('id', productIds);
  if (productsError) throw productsError;

  const products = (productRows ?? []) as ProductRow[];
  const productById = new Map(products.map(p => [String(p.id), p]));

  const held: HeldOrder = {
    id: String(orderRow.id),
    tableNumber: String(orderRow.table_number),
    customerName: orderRow.customer_name ? String(orderRow.customer_name) : '',
    createdAt: new Date(orderRow.created_at),
    discount: Number(orderRow.discount_value ?? 0),
    discountType: (orderRow.discount_type ?? 'percent') as 'percent' | 'flat',
    items: items.map((it: OrderItemRow) => {
      const product = productById.get(String(it.product_id));
      if (!product) {
        return {
          item: {
            id: String(it.product_id),
            name: String(it.product_name_snapshot ?? 'Unknown'),
            category: '',
            price: Number(it.product_price_snapshot ?? 0),
            description: '',
            image: PLACEHOLDER_IMAGE,
            isVeg: true,
            isAvailable: true,
          },
          quantity: Number(it.quantity ?? 0),
          notes: it.notes ?? undefined,
        };
      }

      return {
        item: mapProductRowToMenuItem(
          product,
          Number(it.product_price_snapshot ?? product.price),
          String(it.product_name_snapshot ?? product.name),
        ),
        quantity: Number(it.quantity ?? 0),
        notes: it.notes ?? undefined,
      };
    }),
  };

  // Consume held order: delete it after resuming to match the existing UI behavior.
  const { error: deleteErr } = await db.from('orders').delete().eq('id', orderId);
  if (deleteErr) throw deleteErr;

  return held;
}

export async function createHeldOrderInSupabase(args: {
  orderNumber: string;
  tableNumber: string;
  customerName: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  summary: OrderSummary;
  items: CartItem[];
}): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const db = requireSupabase();

  const { data: createdOrder, error: orderErr } = await db
    .from('orders')
    .insert({
      order_number: args.orderNumber,
      invoice_number: null,
      table_number: args.tableNumber,
      customer_name: args.customerName || null,
      status: 'held',
      subtotal: args.summary.subtotal,
      discount_type: args.discountType,
      discount_value: args.discountValue,
      discount_amount: args.summary.discountAmount,
      gst_rate: args.summary.gstRate,
      gst_amount: args.summary.gstAmount,
      total_amount: args.summary.total,
    })
    .select('id')
    .single();

  if (orderErr) throw orderErr;

  const orderId = String(createdOrder.id);
  const orderItemRows = args.items.map(ci => ({
    order_id: orderId,
    product_id: ci.item.id,
    product_name_snapshot: ci.item.name,
    product_price_snapshot: round2(ci.item.price),
    quantity: ci.quantity,
    line_subtotal: round2(ci.item.price * ci.quantity),
    notes: ci.notes ?? null,
  }));

  const { error: itemsErr } = await db.from('order_items').insert(orderItemRows);
  if (itemsErr) throw itemsErr;

  return orderId;
}

export async function createCompletedOrderInSupabase(args: {
  orderNumber: string;
  invoiceNumber: string;
  tableNumber: string;
  customerName: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  summary: OrderSummary;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  splitPayment?: SplitPayment;
}): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const db = requireSupabase();

  const { data: createdOrder, error: orderErr } = await db
    .from('orders')
    .insert({
      order_number: args.orderNumber,
      invoice_number: args.invoiceNumber,
      table_number: args.tableNumber,
      customer_name: args.customerName || null,
      status: 'completed',
      subtotal: args.summary.subtotal,
      discount_type: args.discountType,
      discount_value: args.discountValue,
      discount_amount: args.summary.discountAmount,
      gst_rate: args.summary.gstRate,
      gst_amount: args.summary.gstAmount,
      total_amount: args.summary.total,
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (orderErr) throw orderErr;
  const orderId = String(createdOrder.id);

  const orderItemRows = args.items.map(ci => ({
    order_id: orderId,
    product_id: ci.item.id,
    product_name_snapshot: ci.item.name,
    product_price_snapshot: round2(ci.item.price),
    quantity: ci.quantity,
    line_subtotal: round2(ci.item.price * ci.quantity),
    notes: ci.notes ?? null,
  }));
  const { error: itemsErr } = await db.from('order_items').insert(orderItemRows);
  if (itemsErr) throw itemsErr;

  const paymentBase = {
    order_id: orderId,
    method: args.paymentMethod,
    amount_total: args.summary.total,
    upi_reference: null,
    card_last4: null,
    card_scheme: null,
  };

  const paymentRow =
    args.paymentMethod === 'cash'
      ? { ...paymentBase, amount_cash: args.summary.total, amount_upi: 0, amount_card: 0 }
      : args.paymentMethod === 'upi'
        ? { ...paymentBase, amount_cash: 0, amount_upi: args.summary.total, amount_card: 0 }
        : args.paymentMethod === 'card'
          ? { ...paymentBase, amount_cash: 0, amount_upi: 0, amount_card: args.summary.total }
          : {
              ...paymentBase,
              amount_cash: round2(args.splitPayment?.cash ?? 0),
              amount_upi: round2(args.splitPayment?.upi ?? 0),
              amount_card: round2(args.splitPayment?.card ?? 0),
            };

  const { error: paymentErr } = await db.from('payments').insert(paymentRow);
  if (paymentErr) throw paymentErr;

  return orderId;
}

