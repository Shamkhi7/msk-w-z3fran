import React from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    if (window.confirm('هل تريد إعادة تعيين الذاكرة المؤقتة وتشغيل النظام من جديد؟')) {
      try {
        // Clear multi carts and temporary UI states that might cause syntax errors
        window.localStorage.removeItem('mz_multi_carts');
        window.localStorage.removeItem('mz_active_cart');
        window.localStorage.removeItem('mz_active_cart_id');
      } catch (e) {}
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex items-center justify-center p-4 font-arabic select-none" dir="rtl">
          <div className="bg-white border-2 border-rose-300 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full text-center space-y-4">
            <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-black text-brand-900">حدث خطأ أثناء تحميل واجهة النظام</h2>
              <p className="text-xs text-stone-600 mt-1">
                تم التقاط هذا الخطأ لمنع تعليق النظام أو ظهور شاشة بيضاء. يمكنك محاولة إعادة التشغيل أدناه.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-left font-mono text-[11px] text-rose-900 max-h-36 overflow-y-auto" dir="ltr">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 bg-brand-800 hover:bg-brand-900 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة تحميل الصفحة</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetStorage}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-stone-300"
              >
                <RefreshCw className="w-4 h-4 text-stone-600" />
                <span>إصلاح الذاكرة المؤقتة</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
