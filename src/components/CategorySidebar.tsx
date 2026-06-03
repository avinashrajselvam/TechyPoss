import {
  Grid3x3, Salad, UtensilsCrossed, Sandwich, ChefHat,
  IceCream, Coffee, Soup
} from 'lucide-react';
import { Category } from '../types';
import { menuItems } from '../data/menuData';

const iconMap: Record<string, React.ReactNode> = {
  Grid3x3: <Grid3x3 size={18} />,
  Salad: <Salad size={18} />,
  UtensilsCrossed: <UtensilsCrossed size={18} />,
  Sandwich: <Sandwich size={18} />,
  ChefHat: <ChefHat size={18} />,
  IceCream: <IceCream size={18} />,
  Coffee: <Coffee size={18} />,
  Soup: <Soup size={18} />,
};

interface CategorySidebarProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export default function CategorySidebar({
  categories, activeCategory, onSelectCategory
}: CategorySidebarProps) {
  const countForCategory = (catId: string) =>
    catId === 'all'
      ? menuItems.length
      : menuItems.filter(i => i.category === catId).length;

  return (
    <aside className="w-20 lg:w-[88px] bg-slate-900 border-r border-slate-700 flex flex-col py-3 gap-1 overflow-y-auto flex-shrink-0">
      {categories.map(cat => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`
              relative mx-2 flex flex-col items-center gap-1 px-1 py-3 rounded-xl transition-all duration-200 group
              ${isActive
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }
            `}
          >
            {/* Active indicator */}
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-300 rounded-r-full" />
            )}

            <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
              {iconMap[cat.icon]}
            </div>
            <span className="text-[10px] font-medium leading-tight text-center">{cat.name}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
              isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
            }`}>
              {countForCategory(cat.id)}
            </span>
          </button>
        );
      })}
    </aside>
  );
}
