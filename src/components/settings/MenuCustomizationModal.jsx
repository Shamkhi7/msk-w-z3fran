import React, { useState } from 'react';
import {
  X,
  Palette,
  Layers,
  ShoppingBag,
  ArrowUp,
  ArrowDown,
  Check,
  RotateCcw,
  Sparkles,
  Tag,
  Cake,
  Coffee,
  Candy,
  Croissant,
  CupSoda,
  PartyPopper,
  Receipt,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

const PRESET_COLORS = [
  { name: 'عنابي مسك وزعفران', hex: '#800020' },
  { name: 'عنابي ملكي', hex: '#9B1B30' },
  { name: 'ذهبي فاخر', hex: '#D4AF37' },
  { name: 'كهرماني دافئ', hex: '#D97706' },
  { name: 'زمردي فستقي', hex: '#059669' },
  { name: 'فيروزي راقي', hex: '#0D9488' },
  { name: 'نيلي ملكي', hex: '#2563EB' },
  { name: 'بنفسجي فاخر', hex: '#7C3AED' },
  { name: 'توتي وردي', hex: '#E11D48' },
  { name: 'شوكولاتة بلجيكية', hex: '#451A03' },
  { name: 'رمادي بلاتيني', hex: '#475569' },
];

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

export function MenuCustomizationModal({ isOpen, onClose }) {
  const {
    categories,
    reorderCategories,
    updateCategory,
    products,
    reorderProducts,
    updateProductDetails,
    storeSettings,
  } = usePOS();

  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'products'
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categories && categories.length > 0 ? categories[0].id : ''
  );
  const [activeColorTarget, setActiveColorTarget] = useState(null); // { type: 'cat' | 'prod', id }

  if (!isOpen) return null;

  // Filter categories without 'cat-all'
  const validCategories = (categories || []).filter((c) => c.id !== 'cat-all');

  // Move Category Up or Down
  const handleMoveCategory = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= validCategories.length) return;

    const updated = [...validCategories];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    reorderCategories(updated);
  };

  // Set Category Color
  const handleSetCategoryColor = (categoryId, color) => {
    updateCategory(categoryId, { color });
  };

  // Products belonging to the selected category in their current array order
  const categoryProducts = (products || []).filter(
    (p) => p.categoryId === (selectedCategoryId || validCategories[0]?.id)
  );

  // Move Product Up or Down within its Category
  const handleMoveProduct = (productIndex, direction) => {
    const targetIndex = direction === 'up' ? productIndex - 1 : productIndex + 1;
    if (targetIndex < 0 || targetIndex >= categoryProducts.length) return;

    // Get current category products reordered
    const reorderedCatProducts = [...categoryProducts];
    const [movedItem] = reorderedCatProducts.splice(productIndex, 1);
    reorderedCatProducts.splice(targetIndex, 0, movedItem);

    // Rebuild global products array maintaining new order for this category
    let catProductCounter = 0;
    const newGlobalProducts = (products || []).map((p) => {
      if (p.categoryId === selectedCategoryId) {
        const replacement = reorderedCatProducts[catProductCounter];
        catProductCounter++;
        return replacement;
      }
      return p;
    });

    reorderProducts(newGlobalProducts);
  };

  // Set Product Accent Color
  const handleSetProductColor = (productId, color) => {
    updateProductDetails(productId, { color });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-warm-200 animate-fade-in text-right">
        {/* Modal Header */}
        <div className="p-4 bg-brand-800 text-white flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-950 text-gold-400 border border-gold-500/40 flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-warm-50 leading-tight">
                تنسيق وترتيب القائمة والألوان
              </h2>
              <p className="text-xs text-warm-200">
                التحكم في تسلسل ظهور الأقسام والمنتجات على شاشة الكاشير وتخصيص ألوانها
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-warm-200 hover:text-white hover:bg-brand-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-warm-200 bg-stone-50 px-4 pt-2.5 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer border-t border-x ${
              activeTab === 'categories'
                ? 'bg-white text-brand-900 border-warm-200 shadow-xs translate-y-[1px]'
                : 'bg-transparent text-stone-500 hover:text-stone-800 border-transparent'
            }`}
          >
            <Layers className="w-4 h-4 text-gold-600" />
            <span>ترتيب وتلوين الأقسام ({validCategories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer border-t border-x ${
              activeTab === 'products'
                ? 'bg-white text-brand-900 border-warm-200 shadow-xs translate-y-[1px]'
                : 'bg-transparent text-stone-500 hover:text-stone-800 border-transparent'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span>ترتيب وتلوين المنتجات</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* ======================================================== */}
          {/* TAB 1: CATEGORIES REORDERING & COLORING                  */}
          {/* ======================================================== */}
          {activeTab === 'categories' && (
            <div className="space-y-3">
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  استخدم الأسهم <strong>(↑ لأعلى / ↓ لأسفل)</strong> لتقديم أو تأخير الأقسام على شاشة الكاشير. انقر على دائرة اللون لاختيار لون مميز لكل قسم.
                </span>
              </div>

              <div className="space-y-2">
                {validCategories.map((cat, index) => {
                  const IconComp = iconMap[cat.icon] || Tag;
                  const catColor = cat.color || '#800020';
                  const isColorTarget =
                    activeColorTarget?.type === 'cat' && activeColorTarget?.id === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className="p-3 bg-white border border-warm-200 rounded-xl shadow-xs flex items-center justify-between gap-3 hover:border-brand-700 transition-all"
                      style={{ borderRightWidth: '6px', borderRightColor: catColor }}
                    >
                      {/* Right: Index & Name */}
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 font-mono font-bold text-xs flex items-center justify-center">
                          {index + 1}
                        </span>

                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: catColor }}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>

                        <div>
                          <div className="font-black text-sm text-stone-900">{cat.name}</div>
                          <div className="text-[10px] text-stone-500">
                            {products.filter((p) => p.categoryId === cat.id).length} أصناف
                          </div>
                        </div>
                      </div>

                      {/* Left: Reorder Arrows & Color Palette Picker */}
                      <div className="flex items-center gap-2">
                        {/* Color Swatch Trigger */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveColorTarget(
                                isColorTarget ? null : { type: 'cat', id: cat.id }
                              )
                            }
                            title="تغيير لون القسم"
                            className="w-8 h-8 rounded-full border-2 border-white shadow-sm ring-1 ring-stone-300 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                            style={{ backgroundColor: catColor }}
                          >
                            <Palette className="w-3.5 h-3.5 text-white drop-shadow-sm" />
                          </button>

                          {/* Color Dropdown Popover */}
                          {isColorTarget && (
                            <div className="absolute left-0 top-10 z-30 bg-white border border-warm-200 shadow-xl rounded-xl p-2.5 w-56 space-y-2 animate-fade-in text-right">
                              <div className="text-[10px] font-bold text-stone-600">
                                اختر لون مميز للقسم:
                              </div>
                              <div className="grid grid-cols-5 gap-1.5">
                                {PRESET_COLORS.map((c) => (
                                  <button
                                    key={c.hex}
                                    type="button"
                                    onClick={() => {
                                      handleSetCategoryColor(cat.id, c.hex);
                                      setActiveColorTarget(null);
                                    }}
                                    title={c.name}
                                    className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-xs"
                                    style={{ backgroundColor: c.hex }}
                                  >
                                    {catColor.toLowerCase() === c.hex.toLowerCase() && (
                                      <Check className="w-4 h-4 text-white drop-shadow-sm" />
                                    )}
                                  </button>
                                ))}
                              </div>

                              <div className="pt-1 border-t border-stone-100 flex items-center justify-between gap-2">
                                <label className="text-[10px] text-stone-500 font-bold">
                                  لون مخصص:
                                </label>
                                <input
                                  type="color"
                                  value={catColor}
                                  onChange={(e) => handleSetCategoryColor(cat.id, e.target.value)}
                                  className="w-7 h-6 p-0 border border-stone-300 rounded cursor-pointer"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Move Up Button */}
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveCategory(index, 'up')}
                          title="تحريك لأعلى"
                          className={`p-1.5 rounded-lg border text-stone-700 transition-colors ${
                            index === 0
                              ? 'opacity-30 border-stone-200 cursor-not-allowed bg-stone-50'
                              : 'hover:bg-brand-50 hover:text-brand-800 border-stone-300 cursor-pointer'
                          }`}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>

                        {/* Move Down Button */}
                        <button
                          type="button"
                          disabled={index === validCategories.length - 1}
                          onClick={() => handleMoveCategory(index, 'down')}
                          title="تحريك لأسفل"
                          className={`p-1.5 rounded-lg border text-stone-700 transition-colors ${
                            index === validCategories.length - 1
                              ? 'opacity-30 border-stone-200 cursor-not-allowed bg-stone-50'
                              : 'hover:bg-brand-50 hover:text-brand-800 border-stone-300 cursor-pointer'
                          }`}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: PRODUCTS REORDERING & COLORING                   */}
          {/* ======================================================== */}
          {activeTab === 'products' && (
            <div className="space-y-3">
              {/* Category Selector Filter */}
              <div className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-warm-200">
                <label className="text-xs font-black text-stone-700 shrink-0">
                  اختر القسم المطلوب ترتيب أصنافه:
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setActiveColorTarget(null);
                  }}
                  className="bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs font-bold text-brand-900 focus:outline-none focus:ring-1 focus:ring-brand-800 flex-1"
                >
                  {validCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({products.filter((p) => p.categoryId === c.id).length} صنف)
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  رتّب الأصناف الأكثر طلباً في المقدمة لتسهيل وصول الكاشير إليها بسرعة. يمكنك إعطاء بطاقة كل منتج إطاراً ملوناً لتمييزه فوراً في شبكة البيع.
                </span>
              </div>

              {/* Products List */}
              {categoryProducts.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs font-bold">
                  لا توجد منتجات مسجلة في هذا القسم حالياً.
                </div>
              ) : (
                <div className="space-y-2">
                  {categoryProducts.map((prod, pIndex) => {
                    const prodColor = prod.color || '';
                    const isColorTarget =
                      activeColorTarget?.type === 'prod' && activeColorTarget?.id === prod.id;

                    return (
                      <div
                        key={prod.id}
                        className="p-3 bg-white border border-warm-200 rounded-xl shadow-xs flex items-center justify-between gap-3 hover:border-brand-700 transition-all"
                        style={prodColor ? { borderRightWidth: '6px', borderRightColor: prodColor } : {}}
                      >
                        {/* Right: Index & Product Info */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {pIndex + 1}
                          </span>

                          <div className="min-w-0">
                            <div className="font-black text-sm text-stone-900 truncate">
                              {prod.name}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-mono text-stone-500">
                              <span className="font-black text-brand-900">
                                {prod.price.toLocaleString()} {storeSettings.currency}
                              </span>
                              <span>•</span>
                              <span>{prod.barcode}</span>
                            </div>
                          </div>
                        </div>

                        {/* Left: Reorder Arrows & Product Card Accent Color */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Color Picker Swatch */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveColorTarget(
                                  isColorTarget ? null : { type: 'prod', id: prod.id }
                                )
                              }
                              title={prodColor ? 'تغيير لون إطار الصنف' : 'إضافة لون إطار مميز للصنف'}
                              className={`w-8 h-8 rounded-full border-2 border-white shadow-sm ring-1 ring-stone-300 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 ${
                                !prodColor ? 'bg-stone-100 text-stone-400' : 'text-white'
                              }`}
                              style={prodColor ? { backgroundColor: prodColor } : {}}
                            >
                              <Palette className="w-3.5 h-3.5" />
                            </button>

                            {/* Color Dropdown Popover */}
                            {isColorTarget && (
                              <div className="absolute left-0 top-10 z-30 bg-white border border-warm-200 shadow-xl rounded-xl p-2.5 w-56 space-y-2 animate-fade-in text-right">
                                <div className="text-[10px] font-bold text-stone-600">
                                  اختر لون إطار مميز لبطاقة المنتج:
                                </div>
                                <div className="grid grid-cols-5 gap-1.5">
                                  {PRESET_COLORS.map((c) => (
                                    <button
                                      key={c.hex}
                                      type="button"
                                      onClick={() => {
                                        handleSetProductColor(prod.id, c.hex);
                                        setActiveColorTarget(null);
                                      }}
                                      title={c.name}
                                      className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-xs"
                                      style={{ backgroundColor: c.hex }}
                                    >
                                      {prodColor.toLowerCase() === c.hex.toLowerCase() && (
                                        <Check className="w-4 h-4 text-white drop-shadow-sm" />
                                      )}
                                    </button>
                                  ))}
                                </div>

                                <div className="pt-1 border-t border-stone-100 flex items-center justify-between gap-2">
                                  <label className="text-[10px] text-stone-500 font-bold">
                                    لون مخصص:
                                  </label>
                                  <input
                                    type="color"
                                    value={prodColor || '#800020'}
                                    onChange={(e) => handleSetProductColor(prod.id, e.target.value)}
                                    className="w-7 h-6 p-0 border border-stone-300 rounded cursor-pointer"
                                  />
                                </div>

                                {prodColor && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleSetProductColor(prod.id, '');
                                      setActiveColorTarget(null);
                                    }}
                                    className="w-full py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer border border-rose-200"
                                  >
                                    إزالة اللون المميز
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Move Up */}
                          <button
                            type="button"
                            disabled={pIndex === 0}
                            onClick={() => handleMoveProduct(pIndex, 'up')}
                            title="تقديم الصنف لأعلى"
                            className={`p-1.5 rounded-lg border text-stone-700 transition-colors ${
                              pIndex === 0
                                ? 'opacity-30 border-stone-200 cursor-not-allowed bg-stone-50'
                                : 'hover:bg-brand-50 hover:text-brand-800 border-stone-300 cursor-pointer'
                            }`}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>

                          {/* Move Down */}
                          <button
                            type="button"
                            disabled={pIndex === categoryProducts.length - 1}
                            onClick={() => handleMoveProduct(pIndex, 'down')}
                            title="تأخير الصنف لأسفل"
                            className={`p-1.5 rounded-lg border text-stone-700 transition-colors ${
                              pIndex === categoryProducts.length - 1
                                ? 'opacity-30 border-stone-200 cursor-not-allowed bg-stone-50'
                                : 'hover:bg-brand-50 hover:text-brand-800 border-stone-300 cursor-pointer'
                            }`}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-stone-50 border-t border-warm-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-500 font-medium">
            يتم حفظ الترتيب والألوان المختارة فوراً وبشكل دائم.
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer"
          >
            إغلاق وحفظ
          </button>
        </div>
      </div>
    </div>
  );
}
