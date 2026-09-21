import React from 'react';
import { Plus, Sparkles, Cake, Layers, Coffee, Candy, Croissant, CupSoda, PartyPopper, Receipt, Tag } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

// Map icon names to Lucide components
const iconMap = {
  Sparkles,
  Cake,
  Layers,
  Coffee,
  Candy,
  Croissant,
  CupSoda,
  PartyPopper,
  Receipt,
  Tag,
};

export function CategoryTabs({ onOpenAddCategory }) {
  const { categories, activeCategory, setActiveCategory, products } = usePOS();

  const getProductCount = (catId) => {
    if (catId === 'cat-all') return products.filter((p) => p.isAvailable).length;
    return products.filter((p) => p.categoryId === catId && p.isAvailable).length;
  };

  return (
    <div className="bg-white border-b border-warm-200/80 p-2 shadow-xs select-none">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => {
          const IconComponent = iconMap[cat.icon] || Tag;
          const isActive = activeCategory === cat.id;
          const count = getProductCount(cat.id);

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-800 text-white shadow-md scale-102 ring-2 ring-gold-500/40'
                  : 'bg-warm-50 text-stone-700 hover:bg-warm-100/80 border border-warm-200/70'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-brand-800'}`} />
              <span className="whitespace-nowrap">{cat.name}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-brand-950 text-gold-300' : 'bg-warm-200/70 text-stone-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}

        {/* Inline "+ إضافة قسم" Button */}
        <button
          onClick={onOpenAddCategory}
          title="إضافة قسم جديد للقائمة"
          className="flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-dashed border-amber-400 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-700" />
          <span className="whitespace-nowrap">+ إضافة قسم</span>
        </button>
      </div>
    </div>
  );
}
