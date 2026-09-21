import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Eye, EyeOff, Edit3 } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function ProductEditModal({ product, isOpen, onClose }) {
  const { updateProduct, deleteProduct, storeSettings } = usePOS();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setPrice(product.price !== undefined ? product.price : '');
      setIsAvailable(product.isAvailable !== false);
      setShowDeleteConfirm(false);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) return;

    updateProduct(product.id, {
      name: name.trim() || product.name,
      price: parsedPrice,
      isAvailable,
    });
    onClose();
  };

  const handleDelete = () => {
    deleteProduct(product.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-[#FAF8F5] border border-brand-900/20 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="bg-brand-800 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-gold-400" />
            <h3 className="font-bold text-sm">تعديل سريع للمنتج</h3>
          </div>
          <button
            onClick={onClose}
            className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-brand-900/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-4 space-y-4">
          <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-warm-200">
            <span className="text-3xl">{product.emoji || '🍰'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-stone-500 font-mono">{product.barcode}</div>
              <div className="font-bold text-stone-800 text-sm truncate">{product.name}</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              اسم المنتج في القائمة:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              السعر الافتراضي ({storeSettings.currency}):
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="250"
              min="0"
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-base font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-800"
              required
            />
          </div>

          {/* Visibility / Availability Toggle */}
          <div className="flex items-center justify-between p-3 bg-white border border-warm-200 rounded-xl">
            <div className="flex items-center gap-2">
              {isAvailable ? (
                <Eye className="w-5 h-5 text-emerald-600" />
              ) : (
                <EyeOff className="w-5 h-5 text-rose-500" />
              )}
              <span className="text-xs font-bold text-stone-700">
                {isAvailable ? 'المنتج متاح وظاهر بالكاشير' : 'إخفاء المنتج مؤقتاً (غير متاح)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                isAvailable ? 'bg-emerald-600 justify-end' : 'bg-stone-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-md" />
            </button>
          </div>

          {/* Delete Warning / Confirm */}
          {showDeleteConfirm ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <p className="text-xs text-rose-800 font-bold text-center">
                هل أنت متأكد من حذف هذا المنتج نهائياً من القائمة؟
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
                >
                  نعم، احذف المنتج
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold py-1.5 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف المنتج من القائمة</span>
              </button>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex gap-2 pt-2 border-t border-stone-200">
            <button
              type="submit"
              className="flex-1 bg-brand-800 hover:bg-brand-900 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 text-gold-400" />
              <span>حفظ التعديلات</span>
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
