import { useState } from 'react';
import {
  X, Banknote, Smartphone, CreditCard, Split,
  CheckCircle2, ChevronRight, ArrowLeft
} from 'lucide-react';
import { OrderSummary, PaymentMethod, SplitPayment } from '../types';

interface PaymentModalProps {
  orderSummary: OrderSummary;
  tableNumber: string;
  customerName: string;
  onClose: () => void;
  onConfirm: (method: PaymentMethod, split?: SplitPayment) => void;
}

type Step = 'select' | 'cash' | 'upi' | 'card' | 'split';

export default function PaymentModal({
  orderSummary, tableNumber, customerName, onClose, onConfirm
}: PaymentModalProps) {
  const [step, setStep] = useState<Step>('select');
  const [cashTendered, setCashTendered] = useState('');
  const [splitCash, setSplitCash] = useState('');
  const [splitUPI, setSplitUPI] = useState('');
  const [splitCard, setSplitCard] = useState('');

  const total = orderSummary.total;
  const cashTenderedNumber = parseFloat(cashTendered) || 0;
  const cashBack = cashTendered ? Math.max(0, cashTenderedNumber - total) : 0;

  const quickAmounts = [
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 50) * 50,
    Math.ceil(total / 100) * 100,
    Math.ceil(total / 500) * 500,
  ].filter((v, i, arr) => arr.indexOf(v) === i && v >= total).slice(0, 4);

  const splitTotal = (parseFloat(splitCash) || 0) + (parseFloat(splitUPI) || 0) + (parseFloat(splitCard) || 0);
  const splitValid = Math.abs(splitTotal - total) < 0.01;
  const splitRemaining = total - splitTotal;

  const handleConfirm = () => {
    if (step === 'cash') {
      onConfirm('cash');
    } else if (step === 'upi') {
      onConfirm('upi');
    } else if (step === 'card') {
      onConfirm('card');
    } else if (step === 'split' && splitValid) {
      onConfirm('split', {
        cash: parseFloat(splitCash) || 0,
        upi: parseFloat(splitUPI) || 0,
        card: parseFloat(splitCard) || 0,
      });
    }
  };

  const paymentMethods = [
    {
      id: 'cash' as const,
      label: 'Cash',
      icon: <Banknote size={22} />,
      color: 'emerald',
      desc: 'Accept cash payment',
    },
    {
      id: 'upi' as const,
      label: 'UPI / QR',
      icon: <Smartphone size={22} />,
      color: 'blue',
      desc: 'Google Pay, PhonePe, Paytm',
    },
    {
      id: 'card' as const,
      label: 'Card',
      icon: <CreditCard size={22} />,
      color: 'violet',
      desc: 'Debit / Credit card',
    },
    {
      id: 'split' as const,
      label: 'Split Bill',
      icon: <Split size={22} />,
      color: 'amber',
      desc: 'Multiple payment modes',
    },
  ];

  const colorMap: Record<string, string> = {
    emerald: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
    blue: 'border-blue-500 bg-blue-500/10 text-blue-400',
    violet: 'border-slate-400 bg-slate-500/10 text-slate-300',
    amber: 'border-amber-500 bg-amber-500/10 text-amber-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 bg-slate-800/60">
          <div className="flex items-center gap-2">
            {step !== 'select' && (
              <button onClick={() => setStep('select')} className="text-slate-400 hover:text-white mr-1">
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <h2 className="text-white font-bold text-base">
                {step === 'select' ? 'Payment' : step === 'cash' ? 'Cash Payment' : step === 'upi' ? 'UPI Payment' : step === 'card' ? 'Card Payment' : 'Split Payment'}
              </h2>
              <p className="text-slate-400 text-xs">{tableNumber} {customerName && `• ${customerName}`}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700">
            <X size={18} />
          </button>
        </div>

        {/* Amount Summary */}
        <div className="px-5 py-4 bg-slate-800/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs">Subtotal</span>
            <span className="text-slate-300 text-xs">₹{orderSummary.subtotal.toFixed(2)}</span>
          </div>
          {orderSummary.discountAmount > 0 && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-xs">Discount</span>
              <span className="text-green-400 text-xs">-₹{orderSummary.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-xs">GST ({orderSummary.gstRate}%)</span>
            <span className="text-slate-300 text-xs">₹{orderSummary.gstAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-700 pt-3">
            <span className="text-white font-bold">Total Payable</span>
            <span className="text-orange-400 font-black text-2xl">₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="px-5 py-4">
          {/* Method selection */}
          {step === 'select' && (
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map(m => (
                <button
                  key={m.id}
                  onClick={() => setStep(m.id as Step)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-105 active:scale-100 ${colorMap[m.color]}`}
                >
                  {m.icon}
                  <span className="font-bold text-sm">{m.label}</span>
                  <span className="text-xs opacity-70 text-center leading-tight">{m.desc}</span>
                  <ChevronRight size={14} className="opacity-50" />
                </button>
              ))}
            </div>
          )}

          {/* Cash */}
          {step === 'cash' && (
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs mb-2 block">Cash Tendered</label>
                <input
                  type="number"
                  value={cashTendered}
                  onChange={e => setCashTendered(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-orange-500 text-center"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setCashTendered(String(amt))}
                    className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    ₹{amt}
                  </button>
                ))}
                <button
                  onClick={() => setCashTendered(total.toFixed(2))}
                  className="col-span-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 rounded-lg text-orange-300 text-sm font-medium transition-colors"
                >
                  Exact ₹{total.toFixed(2)}
                </button>
              </div>
              {cashTendered && parseFloat(cashTendered) >= total && (
                <div className="flex justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
                  <span className="text-emerald-400 font-medium text-sm">Change to Return</span>
                  <span className="text-emerald-400 font-black text-lg">₹{cashBack.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* UPI */}
          {step === 'upi' && (
            <div className="text-center space-y-4">
              <div className="bg-white rounded-2xl p-6 mx-auto w-fit">
                <div className="w-36 h-36 bg-slate-200 rounded-xl flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <Smartphone size={32} className="mx-auto mb-1" />
                    <div className="text-xs font-medium">QR Code</div>
                    <div className="text-[10px]">₹{total.toFixed(2)}</div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-white font-semibold">Scan & Pay ₹{total.toFixed(2)}</p>
                <p className="text-slate-400 text-xs mt-1">Google Pay • PhonePe • Paytm • BHIM</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-3 text-xs text-slate-400">
                UPI ID: spiceroute@hdfc
              </div>
            </div>
          )}

          {/* Card */}
          {step === 'card' && (
            <div className="space-y-4 text-center">
              <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6">
                <CreditCard size={40} className="mx-auto text-slate-400 mb-3" />
                <p className="text-white font-semibold">Insert / Tap Card</p>
                <p className="text-slate-400 text-sm mt-1">Amount: ₹{total.toFixed(2)}</p>
              </div>
              <p className="text-slate-500 text-xs">Follow instructions on the card terminal</p>
            </div>
          )}

          {/* Split */}
          {step === 'split' && (
            <div className="space-y-3">
              <p className="text-slate-400 text-xs">Total: ₹{total.toFixed(2)} — allocate across payment modes</p>
              {[
                { label: 'Cash', value: splitCash, setter: setSplitCash, icon: <Banknote size={14} />, color: 'emerald' },
                { label: 'UPI', value: splitUPI, setter: setSplitUPI, icon: <Smartphone size={14} />, color: 'blue' },
                { label: 'Card', value: splitCard, setter: setSplitCard, icon: <CreditCard size={14} />, color: 'slate' },
              ].map(field => (
                <div key={field.label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-800 text-slate-400`}>
                    {field.icon}
                  </div>
                  <label className="text-slate-400 text-xs w-10">{field.label}</label>
                  <input
                    type="number"
                    value={field.value}
                    onChange={e => field.setter(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
              ))}
              <div className={`flex justify-between text-sm font-medium px-2 pt-2 border-t border-slate-700 ${
                splitValid ? 'text-green-400' : Math.abs(splitTotal - total) > 0.01 ? 'text-red-400' : 'text-slate-400'
              }`}>
                <span>Allocated</span>
                <span>₹{splitTotal.toFixed(2)} / ₹{total.toFixed(2)}</span>
              </div>
              <div className={`text-xs text-right ${splitValid ? 'text-green-400' : 'text-slate-500'}`}>
                {splitValid ? 'Split is valid' : `Remaining: ₹${Math.max(0, splitRemaining).toFixed(2)}`}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step !== 'select' && (
          <div className="px-5 pb-5 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={(step === 'cash' && cashTenderedNumber < total) || (step === 'split' && !splitValid)}
              className="flex-[2] flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-orange-500/30"
            >
              <CheckCircle2 size={16} />
              Confirm Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
