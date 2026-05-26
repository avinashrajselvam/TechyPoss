import { useEffect, useState } from 'react';
import {
  UtensilsCrossed, Bell, Settings, Wifi, Battery,
  Clock, User, ChevronDown, LayoutDashboard
} from 'lucide-react';

interface HeaderProps {
  tableNumber: string;
  setTableNumber: (v: string) => void;
  customerName: string;
  setCustomerName: (v: string) => void;
  heldOrdersCount: number;
  onShowHeld: () => void;
}

const TABLES = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'Takeaway', 'Delivery', 'Counter'];

export default function Header({
  tableNumber, setTableNumber,
  customerName, setCustomerName,
  heldOrdersCount, onShowHeld
}: HeaderProps) {
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <header className="bg-slate-900 border-b border-slate-700 h-14 flex items-center px-4 gap-3 flex-shrink-0 z-10">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <UtensilsCrossed size={16} className="text-white" />
        </div>
        <div className="hidden sm:block">
          <div className="text-white font-bold text-sm leading-none">SPICE ROUTE</div>
          <div className="text-slate-400 text-[10px] leading-none">Restaurant POS</div>
        </div>
      </div>

      {/* Nav Pills */}
      <div className="flex items-center gap-1">
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-medium">
          <LayoutDashboard size={13} />
          <span className="hidden sm:inline">POS</span>
        </button>
      </div>

      {/* Table selector */}
      <div className="relative ml-2">
        <button
          onClick={() => setShowTablePicker(!showTablePicker)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs text-white transition-colors"
        >
          <span className="text-slate-400">Table:</span>
          <span className="font-semibold text-orange-400">{tableNumber}</span>
          <ChevronDown size={12} className="text-slate-400" />
        </button>
        {showTablePicker && (
          <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50 p-2 w-52">
            <div className="grid grid-cols-3 gap-1">
              {TABLES.map(t => (
                <button
                  key={t}
                  onClick={() => { setTableNumber(t); setShowTablePicker(false); }}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    tableNumber === t
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Customer name */}
      <input
        type="text"
        placeholder="Customer name..."
        value={customerName}
        onChange={e => setCustomerName(e.target.value)}
        className="hidden md:block bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 w-36"
      />

      <div className="flex-1" />

      {/* Hold orders badge */}
      {heldOrdersCount > 0 && (
        <button
          onClick={onShowHeld}
          className="relative flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 rounded-lg text-xs text-amber-400 font-medium transition-colors"
        >
          <Clock size={13} />
          <span className="hidden sm:inline">On Hold</span>
          <span className="ml-1 bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {heldOrdersCount}
          </span>
        </button>
      )}

      {/* Notifications */}
      <button className="relative p-1.5 text-slate-400 hover:text-white transition-colors">
        <Bell size={16} />
        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
      </button>

      {/* Time */}
      <div className="hidden lg:flex flex-col items-end">
        <span className="text-white text-xs font-medium">{formatTime(time)}</span>
        <span className="text-slate-400 text-[10px]">{formatDate(time)}</span>
      </div>

      {/* Status icons */}
      <div className="hidden md:flex items-center gap-1.5 ml-1">
        <Wifi size={14} className="text-green-400" />
        <Battery size={14} className="text-green-400" />
      </div>

      {/* User */}
      <button className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
        <div className="w-7 h-7 bg-slate-600 rounded-full flex items-center justify-center">
          <User size={14} className="text-slate-300" />
        </div>
        <div className="hidden lg:block">
          <div className="text-white text-xs font-medium leading-none">Cashier</div>
          <div className="text-slate-400 text-[10px]">Admin</div>
        </div>
      </button>

      {/* Settings */}
      <button className="p-1.5 text-slate-400 hover:text-white transition-colors">
        <Settings size={16} />
      </button>
    </header>
  );
}
