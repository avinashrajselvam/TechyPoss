import { X, Clock, Play, Trash2, ShoppingBag, User } from 'lucide-react';
import { HeldOrder } from '../types';
import { calculateOrderSummary } from '../store/posStore';

interface HoldOrdersModalProps {
  orders: HeldOrder[];
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

export default function HoldOrdersModal({
  orders, onResume, onDelete, onClose
}: HoldOrdersModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 bg-slate-800/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center">
              <Clock size={15} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">On Hold Orders</h2>
              <p className="text-slate-400 text-xs">{orders.length} order{orders.length !== 1 ? 's' : ''} waiting</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700">
            <X size={18} />
          </button>
        </div>

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-600">
              <Clock size={36} className="mb-2 opacity-40" />
              <p className="text-sm">No orders on hold</p>
            </div>
          ) : (
            orders.map(order => {
              const summary = calculateOrderSummary(order.items, order.discount, order.discountType);
              const itemCount = order.items.reduce((s, ci) => s + ci.quantity, 0);
              return (
                <div key={order.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-amber-500/40 transition-colors">
                  {/* Order header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <ShoppingBag size={15} className="text-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold text-sm">{order.tableNumber}</span>
                          {order.customerName && (
                            <span className="text-slate-400 text-xs flex items-center gap-1">
                              <User size={10} /> {order.customerName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-slate-500 text-xs flex items-center gap-1">
                            <Clock size={9} /> {timeAgo(order.createdAt)}
                          </span>
                          <span className="text-slate-600 text-xs">•</span>
                          <span className="text-slate-500 text-xs">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-400 font-black text-base">₹{summary.total.toFixed(2)}</div>
                      <div className="text-slate-500 text-xs">Total</div>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="px-4 py-2">
                    <div className="text-slate-400 text-xs space-y-0.5">
                      {order.items.slice(0, 3).map(ci => (
                        <div key={ci.item.id} className="flex justify-between">
                          <span>{ci.item.name} × {ci.quantity}</span>
                          <span>₹{(ci.item.price * ci.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-slate-600">+{order.items.length - 3} more items...</div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 px-4 py-3 border-t border-slate-700/50">
                    <button
                      onClick={() => onDelete(order.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                    <button
                      onClick={() => onResume(order.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-amber-500/20"
                    >
                      <Play size={12} />
                      Resume Order
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-5 pb-4 pt-2 border-t border-slate-800 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
