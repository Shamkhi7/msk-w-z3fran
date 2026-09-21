import React, { useState, useRef } from 'react';
import {
  X,
  Check,
  Store,
  Phone,
  MapPin,
  Coins,
  FileDown,
  FileUp,
  RotateCcw,
  Volume2,
  Printer,
  ShieldAlert,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function StoreSettingsModal({ isOpen, onClose }) {
  const {
    storeSettings,
    setStoreSettings,
    exportSystemData,
    importSystemData,
    resetToFactoryDefaults,
  } = usePOS();

  const [formData, setFormData] = useState({ ...storeSettings });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStoreSettings(formData);
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result);
        const success = importSystemData(json);
        if (success) {
          alert('تم استيراد واسترجاع البيانات بنجاح!');
          onClose();
        } else {
          alert('فشل استيراد الملف. تأكد من صحة الملف.');
        }
      } catch (err) {
        alert('الملف المحدد غير صالح كنسخة احتياطية JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-[#FAF8F5] border border-brand-900/20 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-brand-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-gold-400" />
            <h3 className="font-bold text-base">إعدادات المحل والنسخ الاحتياطي</h3>
          </div>
          <button
            onClick={onClose}
            className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-brand-900/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Store Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-brand-900 border-b border-warm-200 pb-1">
              معلومات الهوية والفواتير الحرارية
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  اسم المتجر (بالعربية):
                </label>
                <input
                  type="text"
                  name="storeNameAr"
                  value={formData.storeNameAr}
                  onChange={handleChange}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  الاسم التجاري (بالإنجليزية):
                </label>
                <input
                  type="text"
                  name="storeNameEn"
                  value={formData.storeNameEn}
                  onChange={handleChange}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                الوصف / الشعار أسفل العنوان:
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  رقم الهاتف الرئيسي:
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  رقم الهاتف الثانوي (اختياري):
                </label>
                <input
                  type="text"
                  name="phone2"
                  value={formData.phone2 || ''}
                  onChange={handleChange}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  العنوان المطبوع بالوصل:
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  رمز العملة:
                </label>
                <input
                  type="text"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  placeholder="د.ع"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800 text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                اسم الكاشير الافتراضي:
              </label>
              <input
                type="text"
                name="cashierName"
                value={formData.cashierName}
                onChange={handleChange}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                عبارة تذييل الوصل الحراري:
              </label>
              <input
                type="text"
                name="receiptFooterNote"
                value={formData.receiptFooterNote}
                onChange={handleChange}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>
          </div>

          {/* Backup & Data Management */}
          <div className="space-y-3 pt-3 border-t border-stone-200">
            <h4 className="text-xs font-black text-brand-900 border-b border-warm-200 pb-1">
              النسخ الاحتياطي وإدارة البيانات (JSON Offline Sync)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={exportSystemData}
                className="py-2.5 px-3 bg-white hover:bg-warm-100 border border-warm-300 text-stone-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-emerald-600" />
                <span>تصدير نسخة احتياطية (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 bg-white hover:bg-warm-100 border border-warm-300 text-stone-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <FileUp className="w-4 h-4 text-brand-800" />
                <span>استيراد نسخة احتياطية (JSON)</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
            </div>

            {/* Reset to Factory Defaults */}
            <div className="pt-2">
              {showResetConfirm ? (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>تحذير: ستتم استعادة البيانات الافتراضية التجريبية لمحل مسك وزعفران.</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetToFactoryDefaults();
                        setShowResetConfirm(false);
                        onClose();
                      }}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      نعم، استعد البيانات الافتراضية
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-4 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold py-1.5 rounded-lg cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة تعيين النظام للبيانات التجريبية الافتراضية (Factory Sample Data)</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-3 border-t border-stone-200">
            <button
              type="submit"
              className="flex-1 bg-brand-800 hover:bg-brand-900 text-white font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 text-gold-400" />
              <span>حفظ الإعدادات</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors text-sm cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
