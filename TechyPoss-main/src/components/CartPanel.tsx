import { useEffect, useState } from 'react';
import {
  ShoppingCart, Trash2, Plus, Minus, Tag, ChevronDown,
  ChevronUp, Pause, CreditCard, X, AlertCircle
} from 'lucide-react';
import { CartItem, OrderSummary } from '../types';

interface CartPanelProps {
  cart: CartItem[];
  tableNumber: string;
  customerName: string;
  discount: number;
  discountType: 'percent' | 'flat';
  orderSummary: OrderSummary;
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onHold: () => void;
  onPay: () => void;
  setDiscount: (v: number) => void;
  setDiscountType: (v: 'percent' | 'flat') => void;
}

export default function CartPanel({
  cart, tableNumber, customerName,
  discount, discountType, orderSummary,
  onUpdateQty, onRemove, onClear, onHold, onPay,
  setDiscount, setDiscountType
}: CartPanelProps) {
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountInput, setDiscountInput] = useState(String(discount));

  useEffect(() => {
    setDiscountInput(String(discount));
  }, [discount]);

  const applyDiscount = () => {
    const val = Math.max(0, parseFloat(discountInput) || 0);
    setDiscount(val);
  };

  const removeDiscount = () => {
    setDiscount(0);
    setDiscountInput('0');
  };

  const isEmpty = cart.length === 0;

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700">
      {/* Cart Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-orange-400" />
          <span className="text-white font-semibold text-sm">Current Order</span>
          {cart.length > 0 && (
            <span className="bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cart.reduce((s, ci) => s + ci.quantity, 0)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-500 text-xs bg-slate-800 px-2 py-1 rounded-lg">{tableNumber}</span>
          {customerName && (
            <span className="text-slate-500 text-xs bg-slate-800 px-2 py-1 rounded-lg truncate max-w-[90px]">
              {customerName}
            </span>
          )}
          {!isEmpty && (
            <button
              onClick={onClear}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Clear cart"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-600 px-4">
            <ShoppingCart size={36} className="mb-3 opacity-40" />
            <p className="text-sm font-medium text-slate-500">Cart is empty</p>
            <p className="text-xs text-slate-600 mt-1 text-center">Add items from the menu to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {cart.map((ci, idx) => (
              <div key={ci.item.id} className="flex items-start gap-2 px-3 py-2.5 hover:bg-slate-800/50 group transition-colors">
                {/* Index */}
                <span className="text-slate-600 text-xs w-4 flex-shrink-0 mt-0.5">{idx + 1}.</span>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-sm border flex-shrink-0 flex items-center justify-center ${
                          ci.item.isVeg ? 'border-green-500' : 'border-red-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${ci.item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                        <span className="text-white text-xs font-medium leading-tight">{ci.item.name}</span>
                      </div>
                      <div className="text-orange-400 text-xs font-semibold mt-0.5">
                        ₹{ci.item.price} × {ci.quantity} = ₹{ci.item.price * ci.quantity}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemove(ci.item.id)}
                      className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1 mt-1.5">
                    <button
                      onClick={() => onUpdateQty(ci.item.id, -1)}
                      className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-400 flex items-center justify-center transition-colors"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="text-white text-xs font-bold w-6 text-center">{ci.quantity}</span>
                    <button
                      onClick={() => onUpdateQty(ci.item.id, 1)}
                      className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-green-500/20 hover:text-green-400 text-slate-400 flex items-center justify-center transition-colors"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discount & Summary */}
      {!isEmpty && (
        <div className="border-t border-slate-700">
          {/* Discount Toggle */}
          <div className="px-4 py-2 border-b border-slate-800">
            <button
              onClick={() => setShowDiscount(!showDiscount)}
              className="flex items-center justify-between w-full text-sm"
            >
              <div className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                <Tag size={13} />
                <span className="text-xs font-medium">
                  {discount > 0 ? (
                    <span className="text-green-400">
                      Discount: {discountType === 'percent' ? `${discount}%` : `₹${discount}`}
                      {' '}(-₹{orderSummary.discountAmount.toFixed(2)})
                    </span>
                  ) : 'Add Discount'}
                </span>
              </div>
              {showDiscount ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
            </button>

            {showDiscount && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex border border-slate-600 rounded-lg overflow-hidden text-xs">
                  <button
                    onClick={() => setDiscountType('percent')}
                    className={`px-2 py-1.5 transition-colors ${discountType === 'percent' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >%</button>
                  <button
                    onClick={() => setDiscountType('flat')}
                    className={`px-2 py-1.5 transition-colors ${discountType === 'flat' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >₹</button>
                </div>
                <input
                  type="number"
                  value={discountInput}
                  onChange={e => setDiscountInput(e.target.value)}
                  onBlur={applyDiscount}
                  onKeyDown={e => e.key === 'Enter' && applyDiscount()}
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  placeholder="0"
                  min="0"
                />
                {discount > 0 && (
                  <button onClick={removeDiscount} className="text-red-400 hover:text-red-300">
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bill Summary */}
          <div className="px-4 py-3 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Subtotal ({cart.reduce((s, c) => s + c.quantity, 0)} items)</span>
              <span>₹{orderSummary.subtotal.toFixed(2)}</span>
            </div>
            {orderSummary.discountAmount > 0 && (
              <div className="flex justify-between text-xs text-green-400">
                <span>Discount ({discountType === 'percent' ? `${discount}%` : 'Flat'})</span>
                <span>-₹{orderSummary.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-slate-400">
              <span>GST ({orderSummary.gstRate}%)</span>
              <span>₹{orderSummary.gstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white border-t border-slate-700 pt-2 mt-2">
              <span>Total Amount</span>
              <span className="text-orange-400 text-base">₹{orderSummary.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-3 pb-3 flex gap-2">
            <button
              onClick={onHold}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <Pause size={13} />
              Hold
            </button>
            <button
              onClick={onPay}
              className="flex-[2] flex items-center justify-center gap-1.5 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-orange-500/30"
            >
              <CreditCard size={13} />
              Pay ₹{orderSummary.total.toFixed(2)}
            </button>
          </div>
        </div>
      )}

      {isEmpty && (
        <div className="px-3 pb-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 text-slate-600 text-xs p-2 bg-slate-800/50 rounded-lg">
            <AlertCircle size={13} />
            <span>Select items from the menu to create an order</span>
          </div>
        </div>
      )}
    </div>
  );
}
