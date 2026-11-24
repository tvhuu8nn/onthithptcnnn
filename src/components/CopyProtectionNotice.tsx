import React, { useEffect } from 'react';
import { Lock, LogIn, X, ShieldAlert } from 'lucide-react';

interface CopyProtectionNoticeProps {
  isVisible: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  customMessage?: string;
}

export const CopyProtectionNotice: React.FC<CopyProtectionNoticeProps> = ({
  isVisible,
  onClose,
  onOpenLogin,
  customMessage,
}) => {
  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] bg-slate-900/95 text-white p-4 rounded-xl shadow-2xl border border-amber-500/40 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0 mt-0.5 border border-amber-500/30">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Bản Quyền Nội Dung Tài Liệu
            </h4>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {customMessage ||
              'Khách truy cập chỉ có quyền xem trực tuyến, không được sao chép nội dung tài liệu. Vui lòng đăng nhập để sao chép hoặc trích dẫn!'}
          </p>
          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng Nhập Ngay</span>
            </button>
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
