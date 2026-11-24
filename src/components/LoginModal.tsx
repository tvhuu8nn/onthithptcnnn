import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  KeyRound,
  HelpCircle,
  ArrowLeft,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import {
  authService,
  TEACHER_ACCOUNTS,
  removeVietnameseTones,
} from '../services/authService';
import { AuthUser } from '../types/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser, isFirstLogin?: boolean) => void;
  reason?: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  reason,
}) => {
  const [view, setView] = useState<'login' | 'forgot_password'>('login');
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot password state
  const [forgotQuery, setForgotQuery] = useState('');
  const [forgotResult, setForgotResult] = useState<{
    found: boolean;
    fullName?: string;
    username?: string;
    hintPassword?: string;
    message?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setView('login');
      setIsLoading(false);
      setErrorMessage(null);
      setSuccessMessage(null);
      setForgotResult(null);
      setPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Normalize mobile/desktop inputs: remove zero-width spaces, directional marks, non-breaking spaces, and strip leading @
    const cleanU = username
      .replace(/[\u00A0\uFEFF\u200B-\u200F\u202A-\u202E\u2060]/g, '')
      .trim()
      .replace(/^@+/, '');
    const cleanP = password
      .replace(/[\u00A0\uFEFF\u200B-\u200F\u202A-\u202E\u2060]/g, '')
      .trim();

    if (!cleanU || !cleanP) {
      setErrorMessage('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await authService.login({
        username: cleanU,
        password: cleanP,
        rememberMe,
      });

      if (response.success && response.user) {
        setSuccessMessage(response.message);
        setTimeout(() => {
          setIsLoading(false);
          setSuccessMessage(null);
          onLoginSuccess(response.user!, response.isFirstLogin);
          onClose();
        }, 400);
      } else {
        setIsLoading(false);
        setErrorMessage(response.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Lỗi kết nối trong quá trình đăng nhập.');
    }
  };

  const handleForgotLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = forgotQuery.trim().replace(/^@+/, '').toLowerCase();
    if (!query) return;

    const strippedQuery = removeVietnameseTones(query);

    // 1. Search public user directory (does not expose plaintext passwords)
    try {
      const users = await authService.fetchRealtimeUsers();
      if (Array.isArray(users) && users.length > 0) {
        const matchedSystem = users.find((acc: any) => {
          const u = String(acc.username || '').toLowerCase();
          const fn = String(acc.fullName || '').toLowerCase();
          const strippedFn = removeVietnameseTones(acc.fullName || '');
          const aliases: string[] = Array.isArray(acc.aliases) ? acc.aliases : [];
          return (
            u === query ||
            fn === query ||
            strippedFn === strippedQuery ||
            fn.includes(query) ||
            strippedFn.includes(strippedQuery) ||
            aliases.some(
              (al) =>
                String(al).toLowerCase() === query ||
                removeVietnameseTones(String(al)).includes(strippedQuery)
            )
          );
        });

        if (matchedSystem) {
          setForgotResult({
            found: true,
            fullName: matchedSystem.fullName || matchedSystem.username,
            username: matchedSystem.username,
            hintPassword: '•••••••• (Bảo mật)',
            message: `Đã xác nhận tài khoản "${matchedSystem.fullName || matchedSystem.username}" (@${matchedSystem.username}). Vì lý do bảo mật, mật khẩu không hiển thị công khai.`,
          });
          return;
        }
      }
    } catch {
      // Fallback to local lookup below
    }

    // 2. Search local custom accounts (without revealing password)
    const customList = authService.getCustomAccounts();
    const matchedCustom = customList.find((acc) => {
      const u = acc.username.toLowerCase();
      const fn = acc.fullName.toLowerCase();
      const strippedFn = removeVietnameseTones(acc.fullName);
      return (
        u === query ||
        fn === query ||
        strippedFn === strippedQuery ||
        fn.includes(query) ||
        strippedFn.includes(strippedQuery)
      );
    });

    if (matchedCustom) {
      setForgotResult({
        found: true,
        fullName: matchedCustom.fullName,
        username: matchedCustom.username,
        hintPassword: '•••••••• (Bảo mật)',
        message: `Đã xác nhận tài khoản "${matchedCustom.fullName}" (@${matchedCustom.username}).`,
      });
      return;
    }

    // 3. Search against teacher accounts (without revealing password)
    const matched = TEACHER_ACCOUNTS.find((acc) => {
      const u = acc.username.toLowerCase();
      const fn = acc.fullName.toLowerCase();
      const strippedFn = removeVietnameseTones(acc.fullName);

      return (
        u === query ||
        fn === query ||
        strippedFn === strippedQuery ||
        fn.includes(query) ||
        strippedFn.includes(strippedQuery) ||
        acc.aliases.some((al) => al.toLowerCase() === query || removeVietnameseTones(al).includes(strippedQuery))
      );
    });

    if (matched) {
      setForgotResult({
        found: true,
        fullName: matched.fullName,
        username: matched.username,
        hintPassword: '•••••••• (Bảo mật)',
        message: `Đã xác nhận tài khoản "${matched.fullName}" (@${matched.username}).`,
      });
    } else {
      setForgotResult({
        found: false,
        message: `Không tìm thấy tài khoản "${forgotQuery}" trên hệ thống.`,
      });
    }
  };

  const handleApplyRecoveredAccount = (u: string) => {
    setUsername(u);
    setPassword('');
    setView('login');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 p-3 sm:p-4 flex min-h-full items-center justify-center">
      <div className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 my-auto overflow-hidden max-h-[calc(100dvh-1.5rem)] flex flex-col">
        {/* Top Accent Gradient */}
        <div className="h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 shrink-0" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10 touch-manipulation cursor-pointer"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-8 overflow-y-auto overscroll-contain space-y-5">
          {/* ================= VIEW 1: LOGIN FORM ================= */}
          {view === 'login' && (
            <>
              {/* Header */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 text-emerald-700 mb-2.5 ring-6 ring-emerald-50/50 shadow-inner">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Hệ Thống Đăng Nhập
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Môn Công Nghệ Nông Nghiệp · GDPT 2018
                </p>
              </div>

              {/* Requirement Reason Banner */}
              {reason && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="font-medium leading-relaxed">{reason}</div>
                </div>
              )}

              {/* Alert Messages */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm animate-shake flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
                  <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-600 p-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-medium">{successMessage}</span>
                </div>
              )}

              {/* LOGIN FORM */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Tên đăng nhập hoặc Họ tên
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nhập tên đăng nhập hoặc họ tên..."
                      disabled={isLoading}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      autoComplete="username"
                      inputMode="text"
                      enterKeyHint="next"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all placeholder:text-slate-400 touch-manipulation"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      disabled={isLoading}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      autoComplete="current-password"
                      enterKeyHint="go"
                      className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all placeholder:text-slate-400 font-mono touch-manipulation"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center justify-center min-w-[44px] min-h-[44px] text-slate-400 hover:text-slate-600 transition-colors touch-manipulation cursor-pointer"
                      title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>
                  
                  {/* QUÊN MẬT KHẨU BUTTON */}
                  <button
                    type="button"
                    onClick={() => {
                      setView('forgot_password');
                      setForgotResult(null);
                      if (username) setForgotQuery(username);
                    }}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline touch-manipulation cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer text-sm sm:text-base touch-manipulation ring-2 ring-emerald-500/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang kiểm tra tài khoản...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Đăng Nhập Ngay</span>
                    </>
                  )}
                </button>
              </form>

              {/* Zalo Contact Notice for Creating Account */}
              <div className="p-3.5 rounded-xl bg-blue-50/90 border border-blue-200 text-blue-900 text-xs sm:text-sm flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2 font-semibold">
                  <MessageCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Tạo tài khoản liên hệ zalo: 0358016013</span>
                </div>
                <a
                  href="https://zalo.me/0358016013"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 flex items-center gap-1 transition-colors"
                >
                  <span>Zalo</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Security & Cross-Device Support Footer */}
              <div className="pt-2 text-center text-[11px] text-slate-500 border-t border-slate-100 space-y-0.5">
                <div className="font-semibold text-emerald-700">
                  ✓ Hỗ trợ đăng nhập đồng bộ trên tất cả các thiết bị (Điện thoại, iPad, Laptop, PC)
                </div>
                <div className="text-slate-400">
                  Hệ thống hỗ trợ đăng nhập bằng Tên tài khoản, Email hoặc Họ tên có dấu / không dấu.
                </div>
              </div>
            </>
          )}

          {/* ================= VIEW 2: FORGOT PASSWORD ================= */}
          {view === 'forgot_password' && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 mb-2 ring-6 ring-amber-50/50 shadow-inner">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Khôi Phục Mật Khẩu
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tra cứu tài khoản hoặc liên hệ cấp lại mật khẩu
                </p>
              </div>

              {/* Search Form */}
              <form onSubmit={handleForgotLookup} className="space-y-2.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Nhập Tên đăng nhập hoặc Họ tên
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={forgotQuery}
                      onChange={(e) => setForgotQuery(e.target.value)}
                      placeholder="Ví dụ: ttbvan, vtktuyen, admin..."
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 touch-manipulation"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer touch-manipulation"
                  >
                    Tra cứu
                  </button>
                </div>
              </form>

              {/* Search Result Box */}
              {forgotResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs border animate-in fade-in ${
                    forgotResult.found
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50/80 border-amber-200 text-amber-950'
                  }`}
                >
                  {forgotResult.found ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{forgotResult.fullName}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-emerald-200 font-mono text-[11px] space-y-1">
                        <div>
                          <span className="text-slate-500">Tên đăng nhập: </span>
                          <span className="font-bold text-slate-900">{forgotResult.username}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Mật khẩu: </span>
                          <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            {forgotResult.hintPassword}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Vì lý do bảo mật, hệ thống không hiển thị mật khẩu công khai. Nếu quên mật khẩu, vui lòng liên hệ Quản trị viên bên dưới để được cấp lại.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleApplyRecoveredAccount(forgotResult.username!)}
                        className="w-full mt-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer touch-manipulation"
                      >
                        Điền tên đăng nhập & Quay lại
                      </button>
                    </div>
                  ) : (
                    <div>{forgotResult.message}</div>
                  )}
                </div>
              )}

              {/* Administrator Support Info */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Liên hệ cấp lại mật khẩu:</span>
                </div>
                <div className="mt-1 text-slate-600">
                  Thầy <b>Trần Văn Hữu</b> (Tổ Công Nghệ Nông nghiệp)
                  <div className="mt-1.5">
                    <a
                      href="https://zalo.me/0358016013"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium border border-blue-200 shadow-xs transition-colors group touch-manipulation"
                    >
                      <MessageCircle className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                      <span>Zalo: <strong className="font-mono text-blue-900 tracking-wider">0358016013</strong></span>
                      <ExternalLink className="w-3 h-3 text-blue-500 opacity-70" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Back to Login Button */}
              <button
                type="button"
                onClick={() => setView('login')}
                className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer touch-manipulation"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại màn hình Đăng nhập</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
