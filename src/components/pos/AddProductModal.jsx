import React, { useState } from 'react';
import { X, Check, Plus } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function AddProductModal({ isOpen, onClose, defaultCategoryId }) {
  const { addProduct, categories, storeSettings } = usePOS();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(
    defaultCategoryId ? defaultCategoryId : 'cat-cakes'
  );
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [barcode, setBarcode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    addProduct({
      name: name.trim(),
      categoryId,
      price: Number(price),
      cost: Number(cost) || 0,
      barcode: barcode.trim() || undefined,
    });

    setName('');
    setPrice('');
    setCost('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-[#FAF8F5] border border-brand-900/20 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-brand-800 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-gold-400" />
            <h3 className="font-bold text-sm">إضافة منتج جديد للقائمة</h3>
          </div>
          <button
            onClick={onClose}
            className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-brand-900/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              اسم الصنف:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: كيكة التوت البري والمسك"
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                القسم:
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                سعر البيع ({storeSettings.currency}):
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="25000"
                step="250"
                min="0"
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                تكلفة الصنف (اختياري):
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="14000"
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                الباركود (تلقائي إن ترك فارغاً):
              </label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="MZ-xxxx"
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-stone-200">
            <button
              type="submit"
              className="flex-1 bg-brand-800 hover:bg-brand-900 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 text-gold-400" />
              <span>إضافة المنتج للقائمة</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
