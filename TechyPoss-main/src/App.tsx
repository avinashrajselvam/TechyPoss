import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { categories, menuItems } from './data/menuData';
import { usePOSStore } from './store/posStore';
import Header from './components/Header';
import CategorySidebar from './components/CategorySidebar';
import MenuGrid from './components/MenuGrid';
import CartPanel from './components/CartPanel';
import PaymentModal from './components/PaymentModal';
import InvoiceModal from './components/InvoiceModal';
import HoldOrdersModal from './components/HoldOrdersModal';
import SupabaseTest from './components/SupabaseTest';
import LoginPage from './components/LoginPage';
import ProductsAdmin from './components/ProductsAdmin';
import { supabase } from './supabaseClient';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [view, setView] = useState<'pos' | 'products'>('pos');
  const store = usePOSStore();

  useEffect(() => {
    if (!supabase) {
      setAuthChecked(true);
      return;
    }
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setSession(data.session ?? null);
      setAuthChecked(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, newSession: Session | null) => {
      setSession(newSession);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (store.activeCategory !== 'all') {
      items = items.filter(i => i.category === store.activeCategory);
    }
    if (store.searchQuery.trim()) {
      const q = store.searchQuery.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    }
    return items;
  }, [store.activeCategory, store.searchQuery]);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  if (supabase && !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="text-sm text-slate-300">Checking session…</div>
      </div>
    );
  }

  if (supabase && authChecked && !session) {
    return <LoginPage />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white overflow-hidden">
      <Header
        tableNumber={store.tableNumber}
        setTableNumber={store.setTableNumber}
        customerName={store.customerName}
        setCustomerName={store.setCustomerName}
        heldOrdersCount={store.heldOrders.length}
        onShowHeld={() => store.setShowHoldOrders(true)}
        onLogout={supabase ? handleLogout : undefined}
        showLogout={!!supabase}
      />

      {/* Top tabs: POS vs Products admin */}
      <div className="border-b border-slate-800 px-4 py-2 text-xs flex items-center gap-2 bg-slate-950/60">
        <button
          type="button"
          onClick={() => setView('pos')}
          className={`px-3 py-1.5 rounded-md font-medium ${
            view === 'pos'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Billing POS
        </button>
        <button
          type="button"
          onClick={() => setView('products')}
          className={`px-3 py-1.5 rounded-md font-medium ${
            view === 'products'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Products (Supabase)
        </button>
      </div>

      {view === 'pos' && (
        <div className="flex flex-1 overflow-hidden">
        {/* Category Sidebar */}
        <CategorySidebar
          categories={categories}
          activeCategory={store.activeCategory}
          onSelectCategory={id => {
            store.setActiveCategory(id);
            store.setSearchQuery('');
          }}
        />

        {/* Menu Grid */}
        <div className="flex-1 overflow-hidden">
          <MenuGrid
            items={filteredItems}
            cart={store.cart}
            searchQuery={store.searchQuery}
            onSearchChange={store.setSearchQuery}
            onAddItem={store.addToCart}
          />
        </div>

        {/* Cart Panel */}
        <div className="w-72 xl:w-80 flex-shrink-0 overflow-hidden">
          <CartPanel
            cart={store.cart}
            tableNumber={store.tableNumber}
            customerName={store.customerName}
            discount={store.discount}
            discountType={store.discountType}
            orderSummary={store.orderSummary}
            onUpdateQty={store.updateQuantity}
            onRemove={store.removeFromCart}
            onClear={store.clearCart}
            onHold={store.holdOrder}
            onPay={() => {
              if (store.cart.length > 0) {
                store.setShowPaymentModal(true);
              }
            }}
            setDiscount={store.setDiscount}
            setDiscountType={store.setDiscountType}
          />
        </div>
        </div>
      )}

      {view === 'products' && (
        <div className="flex-1 overflow-hidden">
          <ProductsAdmin />
        </div>
      )}

      {/* Modals */}
      {store.showPaymentModal && (
        <PaymentModal
          orderSummary={store.orderSummary}
          tableNumber={store.tableNumber}
          customerName={store.customerName}
          onClose={() => store.setShowPaymentModal(false)}
          onConfirm={store.completeOrder}
        />
      )}

      {store.showInvoice && store.lastCompletedOrder && (
        <InvoiceModal
          order={store.lastCompletedOrder}
          onClose={() => store.setShowInvoice(false)}
          onNewOrder={() => {
            store.setShowInvoice(false);
          }}
        />
      )}

      {store.showHoldOrders && (
        <HoldOrdersModal
          orders={store.heldOrders}
          onResume={store.resumeOrder}
          onDelete={store.deleteHeldOrder}
          onClose={() => store.setShowHoldOrders(false)}
        />
      )}

      {/* Small widget to verify Supabase connection */}
      <SupabaseTest />
    </div>
  );
}
