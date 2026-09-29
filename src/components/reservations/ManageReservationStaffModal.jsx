import React, { useState } from 'react';
import {
  X,
  Check,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Users,
  UserCheck,
  AlertCircle,
  HelpCircle,
  CalendarCheck,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function ManageReservationStaffModal({ isOpen, onClose }) {
  const {
    reservationStaffList,
    addReservationStaff,
    updateReservationStaff,
    deleteReservationStaff,
    resetReservationStaff,
    reservations,
  } = usePOS();

  const [newStaffName, setNewStaffName] = useState('');
  const [editingStaff, setEditingStaff] = useState(null); // original name
  const [editedName, setEditedName] = useState('');
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleAddStaff = (e) => {
    e.preventDefault();
    const success = addReservationStaff(newStaffName);
    if (success) {
      setNewStaffName('');
    }
  };

  const handleStartEdit = (name) => {
    setEditingStaff(name);
    setEditedName(name);
  };

  const handleCancelEdit = () => {
    setEditingStaff(null);
    setEditedName('');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingStaff) return;
    const success = updateReservationStaff(editingStaff, editedName);
    if (success) {
      handleCancelEdit();
    }
  };

  const handleConfirmDelete = () => {
    if (staffToDelete) {
      deleteReservationStaff(staffToDelete);
      if (editingStaff === staffToDelete) {
        handleCancelEdit();
      }
      setStaffToDelete(null);
    }
  };

  // Helper to count how many reservations are under a worker's name
  const getStaffReservationCount = (name) => {
    return (reservations || []).filter(
      (r) => r.workerName && r.workerName.trim().toLowerCase() === name.trim().toLowerCase()
    ).length;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-[#FAF8F5] border border-brand-900/20 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-brand-800 text-white px-5 py-3.5 flex items-center justify-between border-b border-brand-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-950 flex items-center justify-center text-gold-400 border border-gold-500/30">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                إدارة قائمة موظفي الحجوزات (صلاحية المدير)
              </h3>
              <p className="text-[11px] text-warm-200">
                إضافة وتعديل وحذف أسماء الكادر والعمال المسؤولين عن تسجيل الحجوزات
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-200 hover:text-white hover:bg-brand-700/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Quick Notice */}
          <div className="bg-warm-100 border border-warm-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-stone-700">
            <HelpCircle className="w-4 h-4 text-brand-800 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              تظهر هذه الأسماء كأزرار سريعة ومباشرة للكاشير عند تسجيل أي حجز جديد لاختيار العامل بنقرة واحدة، كما يمكن للكاشير كتابة أي اسم يدوي إضافي بحرية.
            </div>
          </div>

          {/* Add New Staff Input */}
          <form
            onSubmit={handleAddStaff}
            className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs space-y-2"
          >
            <label className="block text-xs font-bold text-stone-800">
              إضافة موظف / عامل حجز جديد:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="مثال: حيدر، علي، أحمد، كرار..."
                className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-800 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!newStaffName.trim()}
                className="bg-brand-800 hover:bg-brand-900 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </button>
            </div>
          </form>

          {/* Staff List Header */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
              <span>قائمة الموظفين الحالية</span>
              <span className="bg-brand-100 text-brand-900 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                {reservationStaffList.length}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 underline font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>استعادة القائمة الافتراضية</span>
            </button>
          </div>

          {/* List of Staff */}
          <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-0.5">
            {reservationStaffList.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs font-bold bg-white rounded-xl border border-dashed border-stone-300">
                لا توجد أسماء موظفين مضافة حالياً. أضف أسماء من النموذج أعلاه.
              </div>
            ) : (
              reservationStaffList.map((staffName, index) => {
                const isEditing = editingStaff === staffName;
                const reservationCount = getStaffReservationCount(staffName);

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isEditing
                        ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/40'
                        : 'bg-white border-stone-200 hover:border-warm-300 shadow-2xs'
                    }`}
                  >
                    {isEditing ? (
                      <form onSubmit={handleSaveEdit} className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="flex-1 bg-white border border-amber-400 rounded-lg px-2.5 py-1 text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-600"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="حفظ التعديل"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
                          title="إلغاء التعديل"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-800">
                            <UserCheck className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-stone-800 block">
                              {staffName}
                            </span>
                            {reservationCount > 0 ? (
                              <span className="text-[10px] text-brand-800 flex items-center gap-1 font-semibold">
                                <CalendarCheck className="w-3 h-3 text-brand-600" />
                                <span>{reservationCount} حجز مسجل</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-stone-400 font-normal">
                                لا توجد حجوزات مسجلة بعد
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(staffName)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                            title="تعديل الاسم"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setStaffToDelete(staffName)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="حذف الموظف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>

      {/* Confirmation Modal: Delete Staff */}
      {staffToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xs animate-fade-in select-none">
          <div className="bg-white border border-stone-300 rounded-2xl p-5 max-w-sm w-full shadow-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto border border-rose-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-stone-900">
              تأكيد حذف الموظف من القائمة
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              هل أنت متأكد من حذف الموظف <strong className="text-rose-700">"{staffToDelete}"</strong> من قائمة موظفي الحجوزات السريعة؟
            </p>
            {getStaffReservationCount(staffToDelete) > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-[11px] text-amber-900 font-bold">
                تنبيه: مسجل لهذا الموظف {getStaffReservationCount(staffToDelete)} حجز سابق، وستبقى أسماؤهم محفوظة في الأرشيف دون تغيير.
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                تأكيد الحذف
              </button>
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs py-2 rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Reset to Defaults */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xs animate-fade-in select-none">
          <div className="bg-white border border-stone-300 rounded-2xl p-5 max-w-sm w-full shadow-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-200">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-stone-900">
              استعادة قائمة الموظفين الافتراضية
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              هل أنت متأكد من إعادة تعيين قائمة الموظفين إلى الأسماء الافتراضية للنظام؟
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetReservationStaff();
                  setShowResetConfirm(false);
                }}
                className="flex-1 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                تأكيد الاستعادة
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs py-2 rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
