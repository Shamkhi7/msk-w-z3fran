import React, { useState } from 'react';
import { X, Check, Plus, Tag } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function AddCategoryModal({ isOpen, onClose }) {
  const { addCategory } = usePOS();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Cake');

  if (!isOpen) return null;

  const iconOptions = [
    { id: 'Cake', label: 'كيك 🍰' },
    { id: 'Layers', label: 'قوالب 🎂' },
    { id: 'Coffee', label: 'موس/أقداح 🍮' },
    { id: 'Candy', label: 'حلويات 🍬' },
    { id: 'Croissant', label: 'معجنات 🥐' },
    { id: 'CupSoda', label: 'مشروبات 🥤' },
    { id: 'PartyPopper', label: 'حفلات 🎉' },
    { id: 'Sparkles', label: 'مميز ✨' },
    { id: 'Tag', label: 'عام 🏷️' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addCategory(name.trim(), icon);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-[#FAF8F5] border border-brand-900/20 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="bg-brand-800 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-gold-400" />
            <h3 className="font-bold text-sm">إضافة قسم جديد</h3>
          </div>
          <button
            onClick={onClose}
            className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-brand-900/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              اسم القسم (مثل: بوكسات هدايا، كوكيز):
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اكتب اسم القسم..."
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              أيقونة القسم:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {iconOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setIcon(opt.id)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    icon === opt.id
                      ? 'bg-brand-800 text-white border-brand-900 shadow-xs'
                      : 'bg-white text-stone-700 border-warm-200 hover:bg-warm-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-stone-200">
            <button
              type="submit"
              className="flex-1 bg-brand-800 hover:bg-brand-900 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 text-gold-400" />
              <span>إضافة القسم</span>
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
