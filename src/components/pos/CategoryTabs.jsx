import React from 'react';
import { Plus, Cake, Layers, Coffee, Candy, Croissant, CupSoda, PartyPopper, Receipt, Tag } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

const iconMap = {
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
    return products.filter((p) => p.categoryId === catId && p.isAvailable).length;
  };

  return (
    <div className="bg-white border-b border-warm-200 p-2.5 shadow-xs select-none">
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => {
          const IconComponent = iconMap[cat.icon] || Tag;
          const isActive = activeCategory === cat.id;
          const count = getProductCount(cat.id);

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-800 text-white shadow-md ring-2 ring-gold-500/40 translate-y-[-1px]'
                  : 'bg-warm-50 text-stone-700 hover:bg-warm-100 border border-warm-200'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-brand-800'}`} />
              <span className="whitespace-nowrap">{cat.name}</span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-brand-950 text-gold-300' : 'bg-warm-200/80 text-stone-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}

        {/* Inline "+ إضافة قسم" Button (enlarged) */}
        <button
          onClick={onOpenAddCategory}
          title="إضافة قسم جديد للقائمة"
          className="flex-shrink-0 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-dashed border-amber-400 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-800" />
          <span className="whitespace-nowrap">+ إضافة قسم</span>
        </button>
      </div>
    </div>
  );
}
