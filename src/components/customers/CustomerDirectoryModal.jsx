import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  Users,
  UserPlus,
  Star,
  Phone,
  Calendar,
  Wallet,
  ShoppingBag,
  Trash2,
  Edit2,
  Check,
  MessageCircle,
  Sparkles,
  Lock,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function CustomerDirectoryModal({ isOpen, onClose }) {
  const {
    customersDirectory,
    upsertCustomer,
    deleteCustomer,
    storeSettings,
    isManager,
    verifyManagerPin,
  } = usePOS();

  // Security Gate for non-managers
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterVipOnly, setFilterVipOnly] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null); // for edit/add modal form
  const [isAddMode, setIsAddMode] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formIsVip, setFormIsVip] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsUnlocked(false);
      setPinInput('');
      setPinError('');
      setIsAddMode(false);
      setEditingCustomer(null);
    }
  }, [isOpen]);

  const handleVerifyPin = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (verifyManagerPin(pinInput)) {
      setIsUnlocked(true);
      setPinError('');
      setPinInput('');
    } else {
      setPinError('رمز تأكيد المدير غير صحيح، يرجى المحاولة ثانية');
      setPinInput('');
    }
  };

  const filteredCustomers = useMemo(() => {
    const list = Array.isArray(customersDirectory) ? customersDirectory : [];
    const q = searchQuery.trim().toLowerCase();

    return list
      .filter((c) => {
        if (filterVipOnly && !c.isVip) return false;
        if (!q) return true;
        return (
          c.name?.toLowerCase().includes(q) ||
          c.phone?.includes(q) ||
          c.notes?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (Number(b.totalSpent) || 0) - (Number(a.totalSpent) || 0));
  }, [customersDirectory, searchQuery, filterVipOnly]);

  const handleOpenAdd = () => {
    setIsAddMode(true);
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormNotes('');
    setFormIsVip(false);
  };

  const handleOpenEdit = (cust) => {
    setIsAddMode(false);
    setEditingCustomer(cust);
    setFormName(cust.name || '');
    setFormPhone(cust.phone || '');
    setFormNotes(cust.notes || '');
    setFormIsVip(Boolean(cust.isVip));
  };

  const handleSaveForm = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formName.trim() && !formPhone.trim()) {
      alert('يرجى إدخال اسم الزبون أو رقم هاتفه على الأقل');
      return;
    }

    upsertCustomer({
      ...(editingCustomer ? { id: editingCustomer.id } : {}),
      name: formName.trim(),
      phone: formPhone.trim(),
      notes: formNotes.trim(),
      isVip: formIsVip,
    });

    setIsAddMode(false);
    setEditingCustomer(null);
  };

  const handleToggleVip = (cust) => {
    upsertCustomer({
      ...cust,
      isVip: !cust.isVip,
    });
  };

  const handleOpenWhatsApp = (phone, customerName) => {
    if (!phone) return;
    let cleanPhone = String(phone).replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('07')) {
      cleanPhone = '964' + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith('7')) {
      cleanPhone = '964' + cleanPhone;
    }
    const msg = `أهلاً وسهلاً بك زبوننا العزيز ${customerName} في مسك وزعفران 🌸\nيسعدنا خدمتكم دائماً بأفخر أصناف الكيك والحلويات ✨`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  // Manager Security Barrier: Require PIN if not logged in as manager
  if (!isManager && !isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in select-none">
        <div className="bg-[#FAF8F5] border-2 border-brand-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col">
          <div className="bg-brand-900 text-white px-5 py-4 flex items-center justify-between border-b border-gold-500/40">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-gold-400" />
              <h3 className="font-bold text-sm">سجل الزبائن (صلاحية المدير)</h3>
            </div>
            <button
              onClick={onClose}
              className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-brand-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleVerifyPin} className="p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 mx-auto flex items-center justify-center text-amber-800 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-bold text-stone-900 text-base">سجل الزبائن محمي للمدير</h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                سجل ودليل الزبائن وبياناتهم مخصصة للمدير العام فقط لحماية الخصوصية. أدخل رمز تأكيد المدير للمتابعة:
              </p>
            </div>

            <div>
              <input
                type="password"
                maxLength={8}
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                placeholder="أدخل رمز المدير..."
                className="w-full text-center tracking-widest text-xl font-mono py-2.5 px-3 bg-white border-2 border-stone-300 focus:border-brand-800 rounded-xl focus:outline-none shadow-xs"
              />
              {pinError && (
                <div className="text-xs text-rose-600 font-bold mt-1.5 animate-shake">
                  {pinError}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="py-2.5 px-4 bg-brand-800 hover:bg-brand-900 text-gold-300 rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-4 h-4" />
                <span>تأكيد الرمز</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-[#FAF8F5] border border-brand-900/20 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-brand-900 text-white px-5 py-4 flex items-center justify-between border-b border-gold-500/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold-500 text-brand-950 flex items-center justify-center font-bold shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base flex items-center gap-2">
                <span>سجل ودليل الزبائن الدائمين</span>
                <span className="text-xs bg-gold-400/20 text-gold-300 px-2 py-0.5 rounded-full border border-gold-400/30">
                  {customersDirectory.length} زبون مسجل
                </span>
              </h3>
              <p className="text-[11px] text-warm-200">
                متابعة بيانات الزبائن، تفضيلاتهم، ومجموع مشترياتهم وتصنيف الـ VIP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-brand-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Search Bar */}
        <div className="p-3 sm:p-4 bg-white border-b border-warm-200/80 flex flex-wrap items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الزبون، رقم الهاتف، أو الملاحظة..."
              className="w-full pl-3 pr-9 py-2 bg-warm-50 border border-warm-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-800"
            />
          </div>

          {/* Filter: VIP Only */}
          <button
            type="button"
            onClick={() => setFilterVipOnly(!filterVipOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              filterVipOnly
                ? 'bg-amber-500 text-stone-950 border-amber-600 font-black shadow-xs'
                : 'bg-warm-50 hover:bg-warm-100 text-stone-700 border-warm-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filterVipOnly ? 'fill-current' : 'text-amber-500'}`} />
            <span>زبائن VIP فقط</span>
          </button>

          {/* Add New Customer Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="bg-brand-800 hover:bg-brand-900 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4 text-gold-400" />
            <span>+ إضافة زبون جديد</span>
          </button>
        </div>

        {/* Content Area: List of Customers */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-2.5">
          {filteredCustomers.length === 0 ? (
            <div className="p-12 text-center text-stone-400 flex flex-col items-center justify-center">
              <Users className="w-12 h-12 text-stone-300 mb-2" />
              <p className="font-bold text-stone-600">لا يوجد زبائن مطابقين للبحث</p>
              <p className="text-xs text-stone-400 mt-1">
                تتم إضافة الزبائن تلقائياً عند إتمام أي بيع أو حجز، أو يمكنك إضافتهم يدوياً الآن
              </p>
            </div>
          ) : (
            filteredCustomers.map((cust) => (
              <div
                key={cust.id}
                className={`bg-white rounded-2xl border transition-all p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs hover:shadow-sm ${
                  cust.isVip ? 'border-amber-300 bg-amber-50/20' : 'border-warm-200'
                }`}
              >
                {/* Customer Identity */}
                <div className="flex items-start gap-3 min-w-[200px]">
                  <button
                    type="button"
                    onClick={() => handleToggleVip(cust)}
                    title={cust.isVip ? 'إلغاء تصنيف VIP' : 'تمييز كزبون VIP'}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-transform active:scale-90 ${
                      cust.isVip
                        ? 'bg-amber-400 text-amber-950 shadow-2xs'
                        : 'bg-warm-100 text-stone-400 hover:text-amber-500'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${cust.isVip ? 'fill-current' : ''}`} />
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-stone-900 text-sm">{cust.name}</h4>
                      {cust.isVip && (
                        <span className="bg-amber-500 text-stone-950 text-[10px] px-2 py-0.2 rounded-full font-black flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>VIP</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-stone-500 font-mono mt-1 flex-wrap">
                      {cust.phone ? (
                        <div className="flex items-center gap-1 font-bold text-stone-700">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span>{cust.phone}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-stone-400 font-sans">بدون رقم هاتف</span>
                      )}

                      {cust.lastVisit && (
                        <div className="flex items-center gap-1 text-[11px] text-stone-500">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>
                            آخر زيارة: {new Date(cust.lastVisit).toLocaleDateString('ar-IQ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {cust.notes && (
                      <div className="mt-1.5 text-xs text-amber-900 bg-amber-50/90 px-2.5 py-1 rounded-lg border border-amber-200/80 inline-block font-medium">
                        💡 <strong>ملاحظة وتفضيل:</strong> {cust.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Summary & Actions */}
                <div className="flex items-center gap-3 flex-wrap mr-auto">
                  {/* Stats Badges */}
                  <div className="flex items-center gap-2 bg-warm-50 px-3 py-1.5 rounded-xl border border-warm-200 text-xs">
                    <div className="text-center px-1">
                      <div className="text-[10px] text-stone-500 flex items-center gap-0.5">
                        <ShoppingBag className="w-3 h-3 text-stone-400" />
                        <span>الطلبات</span>
                      </div>
                      <div className="font-mono font-bold text-stone-800">
                        {cust.totalOrders || 0}
                      </div>
                    </div>
                    <div className="w-[1px] h-6 bg-warm-200" />
                    <div className="text-center px-1">
                      <div className="text-[10px] text-emerald-700 flex items-center gap-0.5 font-bold">
                        <Wallet className="w-3 h-3 text-emerald-600" />
                        <span>المشتريات</span>
                      </div>
                      <div className="font-mono font-black text-emerald-800">
                        {(cust.totalSpent || 0).toLocaleString()} {storeSettings.currency}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {cust.phone && (
                      <button
                        type="button"
                        onClick={() => handleOpenWhatsApp(cust.phone, cust.name)}
                        title="إرسال رسالة واتساب للزبون"
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cust)}
                      title="تعديل بيانات وملاحظات الزبون"
                      className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف بيانات الزبون (${cust.name}) من السجل؟`)) {
                          deleteCustomer(cust.id);
                        }
                      }}
                      title="حذف من السجل"
                      className="p-2 rounded-xl hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Sub-form Modal */}
        {(isAddMode || editingCustomer) && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-fade-in">
            <div className="bg-white rounded-2xl border-2 border-brand-800 shadow-2xl max-w-md w-full overflow-hidden p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-warm-200">
                <h4 className="font-black text-brand-900 text-base">
                  {isAddMode ? 'إضافة زبون جديد إلى السجل' : `تعديل بيانات (${editingCustomer?.name})`}
                </h4>
                <button
                  onClick={() => {
                    setIsAddMode(false);
                    setEditingCustomer(null);
                  }}
                  className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    اسم الزبون أو اللقب: *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="مثال: أبو فهد التميمي"
                    className="w-full bg-warm-50 border border-warm-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    رقم الهاتف / الواتساب:
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="مثال: 07701234567"
                    className="w-full bg-warm-50 border border-warm-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ملاحظات وتفضيلات الزبون (كيك، نكهات، قلة سكر):
                  </label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="مثال: يفضل كيك شوكولاتة بسكر خفيف، زبون عائلي دائم..."
                    className="w-full bg-warm-50 border border-warm-300 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-800"
                  />
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                  <input
                    type="checkbox"
                    id="isVipCheck"
                    checked={formIsVip}
                    onChange={(e) => setFormIsVip(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded cursor-pointer"
                  />
                  <label htmlFor="isVipCheck" className="text-xs font-bold text-amber-950 cursor-pointer select-none">
                    ⭐ تصنيف كزبون مميز (VIP Customer)
                  </label>
                </div>

                <div className="flex gap-2 pt-2 border-t border-warm-200">
                  <button
                    type="submit"
                    className="flex-1 bg-brand-800 hover:bg-brand-900 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md"
                  >
                    <Check className="w-4 h-4 text-gold-400" />
                    <span>حفظ بيانات الزبون</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddMode(false);
                      setEditingCustomer(null);
                    }}
                    className="px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
