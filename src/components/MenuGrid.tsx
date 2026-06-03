import { Search, Plus, Star, Leaf, Drumstick, X } from 'lucide-react';
import { MenuItem } from '../types';
import { CartItem } from '../types';

interface MenuGridProps {
  items: MenuItem[];
  cart: CartItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddItem: (item: MenuItem) => void;
}

export default function MenuGrid({
  items, cart, searchQuery, onSearchChange, onAddItem
}: MenuGridProps) {
  const getCartQty = (itemId: string) =>
    cart.find(ci => ci.item.id === itemId)?.quantity ?? 0;

  return (
    <div className="flex flex-col h-full bg-slate-800/50">
      {/* Search bar */}
      <div className="p-3 border-b border-slate-700">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search food items..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Items count */}
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-slate-400 text-xs">{items.length} items found</span>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Leaf size={10} className="text-green-500" /> Veg</span>
          <span className="flex items-center gap-1"><Drumstick size={10} className="text-red-400" /> Non-Veg</span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <Search size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5">
            {items.map(item => {
              const qty = getCartQty(item.id);
              const inCart = qty > 0;
              return (
                <button
                  key={item.id}
                  onClick={() => onAddItem(item)}
                  disabled={!item.isAvailable}
                  className={`
                    relative group text-left rounded-xl overflow-hidden border transition-all duration-200
                    ${!item.isAvailable
                      ? 'opacity-50 cursor-not-allowed border-slate-700 bg-slate-800'
                      : inCart
                        ? 'border-orange-500 bg-slate-800 shadow-lg shadow-orange-500/10'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-500 hover:shadow-lg hover:shadow-black/30 active:scale-95'
                    }
                  `}
                >
                  {/* Cart quantity badge */}
                  {inCart && (
                    <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg">
                      {qty}
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags?.includes('popular') && (
                    <div className="absolute top-2 left-2 z-10 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                      <Star size={8} />
                      Hot
                    </div>
                  )}
                  {item.tags?.includes('bestseller') && (
                    <div className="absolute top-2 left-2 z-10 bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                      Best
                    </div>
                  )}

                  {/* Image */}
                  <div className="h-24 overflow-hidden relative bg-slate-700">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={e => {
                        (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400';
                      }}
                    />
                    {/* Veg/nonveg indicator */}
                    <div className={`absolute bottom-1.5 right-1.5 w-4 h-4 rounded border-2 flex items-center justify-center ${
                      item.isVeg ? 'border-green-500 bg-white' : 'border-red-500 bg-white'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2">
                    <div className="text-white text-xs font-semibold leading-tight line-clamp-1">{item.name}</div>
                    <div className="text-slate-500 text-[10px] mt-0.5 line-clamp-1">{item.description}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-orange-400 font-bold text-sm">₹{item.price}</span>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                        inCart
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-700 text-slate-400 group-hover:bg-orange-500 group-hover:text-white'
                      }`}>
                        <Plus size={13} />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
