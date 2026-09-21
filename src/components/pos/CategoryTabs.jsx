import React, { useState } from 'react';
import { Plus, Cake, Layers, Coffee, Candy, Croissant, CupSoda, PartyPopper, Receipt, Tag } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ManagerPinModal } from '../treasury/ManagerPinModal';

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
  const { categories, activeCategory, setActiveCategory, products, isManager } = usePOS();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const getProductCount = (catId) => {
    return products.filter((p) => p.categoryId === catId && p.isAvailable).length;
  };

  const handleAddCategoryClick = () => {
    if (isManager) {
      onOpenAddCategory();
    } else {
      setIsPinModalOpen(true);
    }
  };

  return (
    <>
      {/* Zero-Scroll Category Header: Compact Multi-Row Grid */}
      <div className="bg-white border-b border-warm-200 p-2 select-none shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-1.5 sm:gap-2">
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Tag;
            const isActive = activeCategory === cat.id;
            const count = getProductCount(cat.id);

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`py-2 px-2.5 rounded-xl text-xs sm:text-[13px] font-bold flex items-center justify-between gap-1.5 transition-all cursor-pointer w-full text-right ${
                  isActive
                    ? 'bg-brand-800 text-white shadow-md ring-2 ring-gold-500/40 border border-brand-950 font-black'
                    : 'bg-warm-50 text-stone-700 hover:bg-warm-100 hover:border-warm-300 border border-warm-200/90'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <IconComponent
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-gold-400' : 'text-brand-800'
                    }`}
                  />
                  <span className="truncate">{cat.name}</span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                    isActive
                      ? 'bg-brand-950 text-gold-300'
                      : 'bg-warm-200 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* "+ إضافة قسم" Button - As the last compact tile in the same grid */}
          <button
            type="button"
            onClick={handleAddCategoryClick}
            title={isManager ? 'إضافة قسم جديد للقائمة' : 'إضافة قسم جديد (يتطلب موافقة المدير)'}
            className="py-2 px-2.5 rounded-xl text-xs sm:text-[13px] font-bold flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-dashed border-amber-400 transition-colors cursor-pointer w-full"
          >
            <Plus className="w-3.5 h-3.5 text-amber-800 shrink-0" />
            <span className="truncate">+ إضافة قسم</span>
          </button>
        </div>
      </div>

      {/* Manager PIN Protection Modal */}
      <ManagerPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          setIsPinModalOpen(false);
          onOpenAddCategory();
        }}
        title="صلاحيات المدير - إضافة قسم"
        promptMessage="أدخل رمز تأكيد المدير لإضافة قسم جديد إلى قائمة المنتجات"
      />
    </>
  );
}
