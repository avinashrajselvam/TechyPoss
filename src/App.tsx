import { useMemo } from 'react';
import { categories, menuItems } from './data/menuData';
import { usePOSStore } from './store/posStore';
import Header from './components/Header';
import CategorySidebar from './components/CategorySidebar';
import MenuGrid from './components/MenuGrid';
import CartPanel from './components/CartPanel';
import PaymentModal from './components/PaymentModal';
import InvoiceModal from './components/InvoiceModal';
import HoldOrdersModal from './components/HoldOrdersModal';

export default function App() {
  const store = usePOSStore();

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

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white overflow-hidden">
      <Header
        tableNumber={store.tableNumber}
        setTableNumber={store.setTableNumber}
        customerName={store.customerName}
        setCustomerName={store.setCustomerName}
        heldOrdersCount={store.heldOrders.length}
        onShowHeld={() => store.setShowHoldOrders(true)}
      />

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
            onPay={() => store.setShowPaymentModal(true)}
            setDiscount={store.setDiscount}
            setDiscountType={store.setDiscountType}
          />
        </div>
      </div>

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
    </div>
  );
}
