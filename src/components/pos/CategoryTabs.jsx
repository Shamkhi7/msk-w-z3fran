import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Cake, Layers, Coffee, Candy, Croissant, CupSoda, PartyPopper, Receipt, Tag, Palette, ZoomIn } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ManagerPinModal } from '../treasury/ManagerPinModal';
import { MenuCustomizationModal } from '../settings/MenuCustomizationModal';

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
  const {
    categories,
    activeCategory,
    setActiveCategory,
    products,
    isManager,
    deleteCategory,
    categoriesScale,
    setCategoriesScale,
  } = usePOS();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);

  const categoryScaleConfig = useMemo(() => {
    switch (categoriesScale) {
      case 50:
        return {
          gridCols: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12',
          gap: 'gap-1',
          padding: 'py-0.5 sm:py-1 px-1 sm:px-1.5',
          minHeight: '28px',
          fontSize: 'text-[10px] sm:text-[11px]',
          iconSize: 'w-3 h-3',
          badgeSize: 'text-[9px] px-1 py-0',
          deleteIconSize: 'w-2.5 h-2.5',
        };
      case 75:
        return {
          gridCols: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8',
          gap: 'gap-1 sm:gap-1.5',
          padding: 'py-1 sm:py-1.5 px-1.5 sm:px-2',
          minHeight: '34px',
          fontSize: 'text-xs',
          iconSize: 'w-3.5 h-3.5',
          badgeSize: 'text-[10px] px-1.5',
          deleteIconSize: 'w-3 h-3',
        };
      case 125:
        return {
          gridCols: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
          gap: 'gap-2 sm:gap-2.5',
          padding: 'py-2.5 sm:py-3 px-3 sm:px-3.5',
          minHeight: '48px',
          fontSize: 'text-sm sm:text-base',
          iconSize: 'w-4 h-4',
          badgeSize: 'text-xs px-2 py-0.5',
          deleteIconSize: 'w-3.5 h-3.5',
        };
      case 150:
        return {
          gridCols: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4',
          gap: 'gap-2.5 sm:gap-3',
          padding: 'py-3 sm:py-3.5 px-3.5 sm:px-4',
          minHeight: '56px',
          fontSize: 'text-base sm:text-lg',
          iconSize: 'w-5 h-5',
          badgeSize: 'text-xs sm:text-sm px-2.5 py-0.5',
          deleteIconSize: 'w-4 h-4',
        };
      case 100:
      default:
        return {
          gridCols: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
          gap: 'gap-1.5 sm:gap-2',
          padding: 'py-1.5 sm:py-2 px-2 sm:px-2.5',
          minHeight: '40px',
          fontSize: 'text-xs sm:text-[13px]',
          iconSize: 'w-3.5 h-3.5',
          badgeSize: 'text-[10px] px-1.5 py-0.2',
          deleteIconSize: 'w-3 h-3',
        };
    }
  }, [categoriesScale]);

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

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  };

  return (
    <>
      {/* Zero-Scroll Category Header: Compact Multi-Row Grid with Dynamic Scale */}
      <div
        className="bg-white border-b border-warm-200 p-1.5 sm:p-2 select-none shadow-xs"
        style={{
          '--category-scale': (categoriesScale || 100) / 100,
        }}
      >
        {/* Header Bar: Category count & Scale Selector & Manager Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 px-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-brand-50 text-brand-800 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black text-stone-800">
              أقسام القائمة ({categories.length})
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* UI Scale Selector for Categories Bar */}
            <div className="flex items-center gap-1.5 bg-warm-100 hover:bg-warm-200/80 border border-warm-300/80 rounded-xl px-2 py-1 transition-colors shadow-2xs">
              <ZoomIn className="w-3.5 h-3.5 text-brand-800 shrink-0" />
              <label htmlFor="category-scale-select" className="text-[11px] font-bold text-stone-600 shrink-0 cursor-pointer hidden sm:inline">
                حجم الأقسام:
              </label>
              <select
                id="category-scale-select"
                value={categoriesScale}
                onChange={(e) => setCategoriesScale(Number(e.target.value))}
                className="bg-transparent font-black text-brand-900 text-xs focus:outline-none cursor-pointer pr-1"
                title="تغيير حجم عرض أزرار الأقسام (Categories Scale)"
              >
                <option value={50}>50% (أصغر جداً)</option>
                <option value={75}>75% (صغير)</option>
                <option value={100}>100% (الافتراضي)</option>
                <option value={125}>125% (كبير)</option>
                <option value={150}>150% (أكبر جداً)</option>
              </select>
            </div>

            {/* Manager Action: "+ إضافة قسم" */}
            {isManager && (
              <button
                type="button"
                onClick={handleAddCategoryClick}
                title="إضافة قسم جديد للقائمة (صلاحية المدير)"
                className="py-1 px-2 sm:px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-dashed border-amber-400 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3 text-amber-800 shrink-0" />
                <span className="truncate">+ إضافة قسم</span>
              </button>
            )}

            {/* Manager Action: "تنسيق القائمة" */}
            {isManager && (
              <button
                type="button"
                onClick={() => setIsCustomizationOpen(true)}
                title="تنسيق وترتيب الأقسام والمنتجات وتخصيص الألوان (صلاحية المدير)"
                className="py-1 px-2 sm:px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1 bg-brand-50 hover:bg-brand-100 text-brand-900 border border-brand-300 transition-colors cursor-pointer shadow-xs"
              >
                <Palette className="w-3 h-3 text-brand-800 shrink-0" />
                <span className="truncate">تنسيق القائمة</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Grid (Dynamically Scaled) */}
        <div className={`grid ${categoryScaleConfig.gridCols} ${categoryScaleConfig.gap}`}>
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Tag;
            const isActive = activeCategory === cat.id;
            const count = getProductCount(cat.id);

            return (
              <div
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`${categoryScaleConfig.padding} rounded-xl ${categoryScaleConfig.fontSize} font-bold flex items-center justify-between gap-1 sm:gap-1.5 transition-all cursor-pointer w-full text-right group ${
                  isActive
                    ? 'text-white shadow-md ring-2 ring-gold-500/40 border border-brand-950 font-black'
                    : 'bg-warm-50 text-stone-700 hover:bg-warm-100 hover:border-warm-300 border border-warm-200/90'
                }`}
                style={{
                  minHeight: categoryScaleConfig.minHeight,
                  borderRightWidth: '4px',
                  borderRightColor: cat.color || '#800020',
                  ...(isActive ? { backgroundColor: cat.color || '#800020' } : {}),
                }}
              >
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <IconComponent
                    className={`${categoryScaleConfig.iconSize} shrink-0 ${
                      isActive ? 'text-gold-300' : 'text-brand-800'
                    }`}
                  />
                  <span className="truncate">{cat.name}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`${categoryScaleConfig.badgeSize} font-mono font-bold rounded-full ${
                      isActive
                        ? 'bg-black/30 text-white'
                        : 'bg-warm-200 text-stone-600'
                    }`}
                  >
                    {count}
                  </span>

                  {/* Manager Only: Category Delete Button */}
                  {isManager && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategoryToDelete(cat);
                      }}
                      title={`حذف قسم ${cat.name}`}
                      className={`p-0.5 rounded transition-colors cursor-pointer ${
                        isActive
                          ? 'text-rose-200 hover:text-white hover:bg-rose-900/60'
                          : 'text-stone-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <Trash2 className={categoryScaleConfig.deleteIconSize} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Deletion Confirmation Modal (Manager) */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 text-right border border-warm-200 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-stone-900 text-center mb-1">
              تأكيد حذف القسم
            </h3>
            <p className="text-sm font-bold text-rose-700 text-center mb-2">
              هل أنت متأكد من حذف هذا القسم مع جميع منتجاته؟
            </p>
            <p className="text-xs text-stone-600 text-center mb-4 leading-relaxed bg-warm-50 p-2.5 rounded-xl border border-warm-200">
              القسم المراد حذفه: <span className="font-bold text-stone-900">{categoryToDelete.name}</span>
              <br />
              عدد المنتجات التي سيتم حذفها نهائياً:{' '}
              <span className="font-bold text-rose-700">{getProductCount(categoryToDelete.id)}</span> صنف
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmDeleteCategory}
                className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                نعم، حذف القسم والمنتجات
              </button>
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Menu Customization Modal (Categories & Products Reordering & Colors) */}
      <MenuCustomizationModal
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
      />
    </>
  );
}
