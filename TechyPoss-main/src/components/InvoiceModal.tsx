import { useRef } from 'react';
import { X, Printer, Share2, CheckCircle2 } from 'lucide-react';
import { CompletedOrder } from '../types';

interface InvoiceModalProps {
  order: CompletedOrder;
  onClose: () => void;
  onNewOrder: () => void;
}

const RESTAURANT_NAME = 'SPICE ROUTE';
const RESTAURANT_ADDRESS = '42, MG Road, Bangalore - 560001';
const RESTAURANT_PHONE = '+91 98765 43210';
const RESTAURANT_GSTIN = '29AABCU9603R1ZX';

function formatTime(d: Date): string {
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

export default function InvoiceModal({ order, onClose, onNewOrder }: InvoiceModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = receiptRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank', 'width=400,height=700');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Receipt - ${order.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 12px; width: 300px; margin: 0 auto; padding: 10px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .row { display: flex; justify-content: space-between; margin: 3px 0; }
            .item-name { flex: 1; }
            .item-price { text-align: right; min-width: 60px; }
            h1 { font-size: 16px; }
            h2 { font-size: 13px; }
            .total { font-size: 14px; font-weight: bold; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  const paymentLabel = (p: string) => {
    const map: Record<string, string> = { cash: 'Cash', upi: 'UPI / QR', card: 'Card', split: 'Split' };
    return map[p] || p;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 bg-slate-800/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center">
              <CheckCircle2 size={18} className="text-green-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">Payment Successful</h2>
              <p className="text-slate-400 text-xs">{order.invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700">
            <X size={18} />
          </button>
        </div>

        {/* Receipt Preview */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="bg-white rounded-xl p-5 text-gray-900 shadow-inner">
            {/* Thermal receipt content */}
            <div ref={receiptRef} className="font-mono text-xs">
              {/* Restaurant header */}
              <div className="center text-center mb-4">
                <h1 className="font-black text-base text-gray-900 tracking-widest">{RESTAURANT_NAME}</h1>
                <p className="text-gray-600 text-[11px] mt-0.5">{RESTAURANT_ADDRESS}</p>
                <p className="text-gray-600 text-[11px]">Tel: {RESTAURANT_PHONE}</p>
                <p className="text-gray-600 text-[11px]">GSTIN: {RESTAURANT_GSTIN}</p>
              </div>

              <div className="divider border-t border-dashed border-gray-400 my-2" />

              {/* Order info */}
              <div className="space-y-0.5 text-[11px] mb-2">
                <div className="row flex justify-between">
                  <span>Invoice:</span>
                  <span className="font-bold">{order.invoiceNumber}</span>
                </div>
                <div className="row flex justify-between">
                  <span>Table:</span>
                  <span className="font-bold">{order.tableNumber}</span>
                </div>
                {order.customerName && (
                  <div className="row flex justify-between">
                    <span>Customer:</span>
                    <span className="font-bold">{order.customerName}</span>
                  </div>
                )}
                <div className="row flex justify-between">
                  <span>Date:</span>
                  <span>{formatTime(order.completedAt)}</span>
                </div>
                <div className="row flex justify-between">
                  <span>Payment:</span>
                  <span className="font-bold">{paymentLabel(order.payment)}</span>
                </div>
              </div>

              <div className="divider border-t border-dashed border-gray-400 my-2" />

              {/* Items header */}
              <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                <span className="flex-1">ITEM</span>
                <span className="w-8 text-center">QTY</span>
                <span className="w-14 text-right">PRICE</span>
                <span className="w-16 text-right">TOTAL</span>
              </div>

              <div className="divider border-t border-dashed border-gray-300 mb-1" />

              {/* Items */}
              <div className="space-y-1 mb-2">
                {order.items.map(ci => (
                  <div key={ci.item.id} className="text-[11px]">
                    <div className="flex justify-between">
                      <span className="flex-1 leading-tight">{ci.item.name}</span>
                      <span className="w-8 text-center">{ci.quantity}</span>
                      <span className="w-14 text-right">₹{ci.item.price.toFixed(2)}</span>
                      <span className="w-16 text-right font-semibold">₹{(ci.item.price * ci.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="divider border-t border-dashed border-gray-400 my-2" />

              {/* Totals */}
              <div className="space-y-1 text-[11px] mb-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{order.orderSummary.subtotal.toFixed(2)}</span>
                </div>
                {order.orderSummary.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.orderSummary.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>CGST ({order.orderSummary.gstRate / 2}%)</span>
                  <span>₹{(order.orderSummary.gstAmount / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST ({order.orderSummary.gstRate / 2}%)</span>
                  <span>₹{(order.orderSummary.gstAmount / 2).toFixed(2)}</span>
                </div>
              </div>

              <div className="divider border-t-2 border-gray-800 my-2" />

              <div className="total flex justify-between text-sm font-black mb-1">
                <span>GRAND TOTAL</span>
                <span>₹{order.orderSummary.total.toFixed(2)}</span>
              </div>

              {/* Split payment breakdown */}
              {order.splitPayment && (
                <div className="text-[10px] space-y-0.5 text-gray-500 mt-2">
                  {order.splitPayment.cash > 0 && <div className="flex justify-between"><span>Cash</span><span>₹{order.splitPayment.cash.toFixed(2)}</span></div>}
                  {order.splitPayment.upi > 0 && <div className="flex justify-between"><span>UPI</span><span>₹{order.splitPayment.upi.toFixed(2)}</span></div>}
                  {order.splitPayment.card > 0 && <div className="flex justify-between"><span>Card</span><span>₹{order.splitPayment.card.toFixed(2)}</span></div>}
                </div>
              )}

              <div className="divider border-t border-dashed border-gray-400 my-3" />

              {/* Footer */}
              <div className="text-center text-[10px] text-gray-500">
                <p>Thank you for dining with us!</p>
                <p>We hope to see you again soon</p>
                <p className="mt-1 font-bold">*** THANK YOU ***</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 pt-3 border-t border-slate-700 flex gap-2 flex-shrink-0">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
          >
            <Printer size={15} />
            Print
          </button>
          <button
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
          >
            <Share2 size={15} />
            Share
          </button>
          <button
            onClick={onNewOrder}
            className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-orange-500/30"
          >
            New Order
          </button>
        </div>
      </div>
    </div>
  );
}
