import React, { useState } from 'react';
import {
  FileText,
  PlusCircle,
  Layers,
  BookOpen,
  Flame,
  FileSpreadsheet,
  Users,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  Shield,
  Briefcase,
  GraduationCap,
  Activity,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Award,
  Building2,
  Trash2,
  AlertTriangle,
  Home,
} from 'lucide-react';
import { AuthUser } from '../types/auth';
import { authService, getAccountSubscriptionStatus } from '../services/authService';

export type AppNavTab =
  | 'home'
  | 'exams'
  | 'grade10'
  | 'grade11'
  | 'grade12'
  | 'mistakes'
  | 'admin'
  | 'users';

interface NavbarProps {
  currentTab: AppNavTab;
  onSelectTab: (tab: AppNavTab) => void;
  onStartExam?: () => void;
  onGenerateRandomExam?: () => void;
  currentUser?: AuthUser | null;
  onUpdateUser?: (updatedUser: AuthUser) => void;
  isLoyalMember?: boolean;
  onRequireVipUpgrade?: () => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  onOpenSponsorQr?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onStartExam,
  onGenerateRandomExam,
  currentUser,
  onUpdateUser,
  isLoyalMember = false,
  onRequireVipUpgrade,
  onOpenLogin,
  onLogout,
  onOpenSponsorQr,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // State cho Thông tin tài khoản
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFullName, setProfileFullName] = useState('');
  const [profileClassName, setProfileClassName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // State cho Đổi mật khẩu
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  // State cho Xóa tài khoản
  const [isDeletingOwnAccount, setIsDeletingOwnAccount] = useState(false);
  const [deleteConfirmLoading, setDeleteConfirmLoading] = useState(false);
  const [deleteConfirmError, setDeleteConfirmError] = useState<string | null>(null);

  const initProfileForm = () => {
    setProfileFullName(currentUser?.fullName || '');
    setProfileClassName(currentUser?.className || '');
    setProfileEmail(currentUser?.email || '');
    setProfilePhone(currentUser?.phone || '');
    setProfileError(null);
    setProfileSuccess(null);
    setProfileLoading(false);
  };

  const resetPasswordForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswords(false);
    setPwError(null);
    setPwSuccess(null);
    setPwLoading(false);
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const cleanName = profileFullName.trim();
    if (!cleanName) {
      setProfileError('Vui lòng nhập Họ và tên không được để trống.');
      setProfileSuccess(null);
      return;
    }

    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const res = await authService.updateOwnProfile({
        username: currentUser.username,
        fullName: cleanName,
        className: profileClassName.trim(),
        email: profileEmail.trim(),
        phone: profilePhone.trim(),
      });

      setProfileLoading(false);
      if (res.success) {
        setProfileSuccess(res.message || 'Cập nhật thông tin tài khoản thành công!');
        if (res.user) {
          onUpdateUser?.(res.user);
        } else {
          onUpdateUser?.({
            ...currentUser,
            fullName: cleanName,
            className: profileClassName.trim() || currentUser.className,
            email: profileEmail.trim() || currentUser.email,
            phone: profilePhone.trim() || currentUser.phone,
          });
        }
      } else {
        setProfileError(res.message || 'Không thể cập nhật thông tin tài khoản.');
      }
    } catch (err: any) {
      setProfileLoading(false);
      setProfileError(err?.message || 'Lỗi kết nối khi cập nhật thông tin.');
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const cleanOld = oldPassword.trim();
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanOld || !cleanNew || !cleanConfirm) {
      setPwError('Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.');
      setPwSuccess(null);
      return;
    }

    if (cleanNew.length < 4) {
      setPwError('Mật khẩu mới phải có ít nhất 4 ký tự.');
      setPwSuccess(null);
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setPwError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      setPwSuccess(null);
      return;
    }

    if (cleanOld === cleanNew) {
      setPwError('Mật khẩu mới phải khác mật khẩu hiện tại.');
      setPwSuccess(null);
      return;
    }

    setPwLoading(true);
    setPwError(null);
    setPwSuccess(null);

    try {
      const res = await authService.changePassword({
        username: currentUser.username,
        oldPassword: cleanOld,
        newPassword: cleanNew,
      });

      setPwLoading(false);
      if (res.success) {
        setPwSuccess(res.message || 'Đổi mật khẩu thành công!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwError(res.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại.');
      }
    } catch (err: any) {
      setPwLoading(false);
      setPwError(err?.message || 'Lỗi kết nối khi đổi mật khẩu.');
    }
  };

  const handleConfirmDeleteOwnAccount = async () => {
    if (!currentUser) return;
    if (currentUser.role === 'admin' || currentUser.username.toLowerCase() === 'admin') {
      setDeleteConfirmError('Tài khoản Quản trị viên chính (admin) được bảo vệ, không thể xóa!');
      return;
    }
    setDeleteConfirmLoading(true);
    setDeleteConfirmError(null);
    try {
      await authService.deleteAccountFromDataUser(currentUser.username);
      setDeleteConfirmLoading(false);
      setIsDeletingOwnAccount(false);
      setIsUserMenuOpen(false);
      onLogout?.();
    } catch (err: any) {
      setDeleteConfirmLoading(false);
      setDeleteConfirmError(err?.message || 'Không thể xóa tài khoản. Vui lòng thử lại.');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Wordmark */}
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              NN
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm md:text-base font-extrabold text-emerald-950 tracking-tight block whitespace-nowrap leading-tight">
                HỌC LIỆU CÔNG NGHỆ NÔNG NGHIỆP THPT
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-600 block leading-tight font-medium truncate max-w-[230px] sm:max-w-none">
                Hệ Thống Ôn Tập &amp; Luyện Đề Chuẩn Chương Trình GDPT 2018
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation links */}
          <nav className="hidden lg:flex items-center gap-3 xl:gap-4 text-sm font-medium text-slate-600 shrink-0">
            <button
              onClick={() => onSelectTab('home')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer flex items-center gap-1 ${
                currentTab === 'home'
                  ? 'text-emerald-700 font-bold border-b-2 border-emerald-600'
                  : 'text-emerald-950 font-semibold'
              }`}
              title="Trang Chủ – Tổng quan hệ thống ôn tập & luyện đề"
            >
              <Home className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Trang Chủ</span>
            </button>
            <button
              onClick={() => onSelectTab('grade10')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer flex items-center gap-1 ${
                currentTab === 'grade10'
                  ? 'text-emerald-700 font-bold border-b-2 border-emerald-600'
                  : 'text-emerald-900 font-medium'
              }`}
              title="Lớp 10 – Công Nghệ Trồng Trọt (Ôn tập chương & Luyện đề)"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Lớp 10</span>
            </button>
            <button
              onClick={() => onSelectTab('grade11')}
              className={`hover:text-amber-700 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer flex items-center gap-1 ${
                currentTab === 'grade11'
                  ? 'text-amber-700 font-bold border-b-2 border-amber-600'
                  : 'text-amber-900 font-medium'
              }`}
              title="Lớp 11 – Công Nghệ Chăn Nuôi (Ôn tập chương & Luyện đề)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Lớp 11</span>
            </button>
            <button
              onClick={() => onSelectTab('grade12')}
              className={`hover:text-teal-700 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer flex items-center gap-1 ${
                currentTab === 'grade12'
                  ? 'text-teal-700 font-bold border-b-2 border-teal-600'
                  : 'text-teal-900 font-medium'
              }`}
              title="Lớp 12 – Công Nghệ Lâm Nghiệp & Thủy Sản (Ôn tập chương & Luyện đề)"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Lớp 12</span>
            </button>
            <button
              onClick={() => onSelectTab('exams')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'exams'
                  ? 'text-emerald-700 font-bold border-b-2 border-emerald-600'
                  : 'text-emerald-950 font-semibold'
              }`}
              title="TN.THPT: Đề Tham Khảo, Đề Thi Thử Tỉnh, Đề Chính Thức & Ma Trận Đề"
            >
              <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>TN.THPT</span>
            </button>
            <button
              onClick={() => onSelectTab('mistakes')}
              className={`hover:text-rose-700 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer ${
                currentTab === 'mistakes'
                  ? 'text-rose-700 font-semibold border-b-2 border-rose-600'
                  : 'text-rose-950 font-medium'
              }`}
            >
              Câu Sai Nhiều
            </button>
            <button
              onClick={() => onSelectTab('admin')}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer ${
                currentTab === 'admin'
                  ? 'text-emerald-800 font-semibold border-b-2 border-emerald-700'
                  : 'text-emerald-950 font-medium'
              }`}
            >
              Bảng Điểm
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onSelectTab('users')}
                className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'users'
                    ? 'text-emerald-800 font-semibold border-b-2 border-emerald-700'
                    : 'text-slate-700 font-medium'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Quản Lý Người Dùng</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Primary actions & User Auth */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {onOpenSponsorQr && (
              <button
                onClick={onOpenSponsorQr}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer text-amber-950 bg-amber-50 border border-amber-300 hover:bg-amber-100 active:scale-95"
                title='Quét cú QR nhẹ nhàng, bạn chính thức là "NHÀ TÀI TRỢ THIÊN THẦN" giúp dự án sinh tồn & phát triển'
              >
                <img
                  src="/assets/aistudio/df666ece8b190b475208_a4469d11.jpg"
                  alt="Mã QR"
                  className="w-5 h-5 object-cover object-center rounded border border-amber-300 bg-white shrink-0"
                />
                <span className="hidden sm:inline font-bold">Mã QR</span>
              </button>
            )}

            {onGenerateRandomExam && (
              <button
                onClick={onGenerateRandomExam}
                className={`hidden xl:flex px-3 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-all items-center gap-1.5 active:scale-95 cursor-pointer border ${
                  isLoyalMember
                    ? 'text-amber-900 bg-amber-50 hover:bg-amber-100 border-amber-300'
                    : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                }`}
                title={
                  isLoyalMember
                    ? 'Gói Giáo viên (50.000đ) đầy đủ tính năng 15 ngày đầu; từ ngày thứ 16 khóa Kho đề và không được tải tài liệu (Cần nâng cấp Giáo viên VIP)'
                    : 'Tạo 4 đề mới chuẩn ma trận Bộ GD&ĐT'
                }
              >
                {isLoyalMember ? (
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
                )}
                <span>Tạo 4 Đề Mới</span>
              </button>
            )}

            {/* Take exam button */}
            {onStartExam && (
              <button
                onClick={onStartExam}
                className={`hidden sm:flex px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-all items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95 cursor-pointer ${
                  isLoyalMember
                    ? 'text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-400'
                    : 'text-white bg-emerald-700 hover:bg-emerald-800'
                }`}
                title={
                  isLoyalMember
                    ? 'Tài khoản cần nâng cấp VIP để tiếp tục sử dụng Kho đề'
                    : 'Vào làm bài thi trực tuyến'
                }
              >
                {isLoyalMember ? (
                  <Lock className="w-3.5 h-3.5 text-amber-800" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                <span>Vào Làm Bài</span>
              </button>
            )}

            {/* User Profile or Login Button */}
            {currentUser ? (
              (() => {
                const subStatus = getAccountSubscriptionStatus({
                  role: currentUser.role,
                  username: currentUser.username,
                  startDate: currentUser.startDate,
                  paymentAmount: currentUser.paymentAmount,
                  expiresAt: currentUser.expiresAt,
                });
                const isVip365 = subStatus.validityDays === 365;

                return (
                  <div className="relative">
                    <button
                      onClick={() => {
                        const nextOpen = !isUserMenuOpen;
                        setIsUserMenuOpen(nextOpen);
                        if (!nextOpen) {
                          setIsEditingProfile(false);
                          setIsChangingPassword(false);
                          resetPasswordForm();
                        }
                      }}
                      className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-800 transition-colors border border-slate-200 cursor-pointer"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[11px] ${
                          currentUser.role === 'admin'
                            ? 'bg-purple-700'
                            : currentUser.role === 'teacher'
                            ? 'bg-emerald-700'
                            : 'bg-sky-700'
                        }`}
                      >
                        {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="text-left hidden md:block">
                        <span className="block font-bold text-slate-900 leading-tight">
                          {currentUser.fullName}
                        </span>
                        {isVip365 && (
                          <span className={`text-[10px] font-extrabold block leading-tight ${subStatus.isStudentMemberTier ? 'text-sky-700' : 'text-emerald-700'}`}>
                            {subStatus.isStudentMemberTier ? 'Học sinh VIP' : 'Giáo viên VIP'}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 block leading-none">
                          {currentUser.role === 'admin'
                            ? 'Quản trị viên'
                            : currentUser.role === 'teacher'
                            ? 'Giáo viên'
                            : 'Học sinh'}
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
                    </button>

                    {/* Thẻ tài khoản (Dropdown Menu) */}
                    {isUserMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsEditingProfile(false);
                            setIsChangingPassword(false);
                            resetPasswordForm();
                          }}
                        />
                        <div
                          className={`absolute right-0 mt-2 ${
                            isEditingProfile || isChangingPassword || isDeletingOwnAccount ? 'w-76 sm:w-84' : 'w-64'
                          } bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in text-xs transition-all max-h-[85vh] overflow-y-auto`}
                        >
                          <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/60">
                            <p className="font-bold text-slate-900 text-sm">{currentUser.fullName}</p>
                            <p className="text-slate-500 font-mono text-[11px]">@{currentUser.username}</p>
                            {isVip365 && (
                              <p className={`text-[11px] font-extrabold mt-0.5 ${subStatus.isStudentMemberTier ? 'text-sky-700' : 'text-emerald-700'}`}>
                                {subStatus.isStudentMemberTier ? 'Học sinh VIP (365 ngày)' : 'Giáo viên VIP (365 ngày)'}
                              </p>
                            )}
                            {currentUser.className && (
                              <p className="text-slate-600 text-[11px] mt-0.5 truncate">
                                {currentUser.className}
                              </p>
                            )}
                            <div className="mt-1.5 flex flex-wrap items-center gap-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  currentUser.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800'
                                    : currentUser.role === 'teacher'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-sky-100 text-sky-800'
                                }`}
                              >
                                {currentUser.role === 'admin' ? (
                                  <Shield className="w-3 h-3" />
                                ) : currentUser.role === 'teacher' ? (
                                  <Briefcase className="w-3 h-3" />
                                ) : (
                                  <GraduationCap className="w-3 h-3" />
                                )}
                                {currentUser.role === 'admin'
                                  ? 'Quản trị viên'
                                  : currentUser.role === 'teacher'
                                  ? 'Giáo viên'
                                  : 'Học sinh'}
                              </span>
                            </div>
                          </div>

                      {currentUser?.role === 'admin' && (
                        <div className="py-1 border-b border-slate-100">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setIsEditingProfile(false);
                              setIsChangingPassword(false);
                              resetPasswordForm();
                              onSelectTab('users');
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                          >
                            <Users className="w-4 h-4 text-emerald-700" />
                            <span>Quản lý người dùng</span>
                          </button>
                        </div>
                      )}

                      {/* Tính năng Thông tin tài khoản (xem & cập nhật) */}
                      <div className="py-1 border-b border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            const nextState = !isEditingProfile;
                            setIsEditingProfile(nextState);
                            if (nextState) {
                              setIsChangingPassword(false);
                              initProfileForm();
                            }
                          }}
                          className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-2 font-semibold transition-colors cursor-pointer ${
                            isEditingProfile
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <User className="w-4 h-4 text-emerald-700" />
                            <span>Thông tin tài khoản</span>
                          </span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                              isEditingProfile ? 'rotate-180 text-emerald-700' : ''
                            }`}
                          />
                        </button>

                        {isEditingProfile && (
                          <form
                            onSubmit={handleUpdateProfileSubmit}
                            className="px-3.5 py-3 bg-slate-50/80 border-t border-slate-100 space-y-2.5"
                          >
                            {profileError && (
                              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-start gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                <span>{profileError}</span>
                              </div>
                            )}

                            {profileSuccess && (
                              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span className="font-semibold">{profileSuccess}</span>
                              </div>
                            )}

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                Tên đăng nhập (cố định)
                              </label>
                              <input
                                type="text"
                                value={`@${currentUser.username}`}
                                disabled
                                className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-500 font-mono cursor-not-allowed"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Họ và tên <span className="text-rose-600">*</span>
                              </label>
                              <input
                                type="text"
                                value={profileFullName}
                                onChange={(e) => setProfileFullName(e.target.value)}
                                placeholder="Nhập họ và tên..."
                                disabled={profileLoading}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Đơn vị / Lớp / Tổ chuyên môn
                              </label>
                              <input
                                type="text"
                                value={profileClassName}
                                onChange={(e) => setProfileClassName(e.target.value)}
                                placeholder="VD: Tổ Công nghệ / Lớp 12A1..."
                                disabled={profileLoading}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Email liên hệ
                              </label>
                              <input
                                type="email"
                                value={profileEmail}
                                onChange={(e) => setProfileEmail(e.target.value)}
                                placeholder="VD: giaovien@truong.edu.vn"
                                disabled={profileLoading}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Số điện thoại
                              </label>
                              <input
                                type="tel"
                                value={profilePhone}
                                onChange={(e) => setProfilePhone(e.target.value)}
                                placeholder="Nhập số điện thoại liên hệ..."
                                disabled={profileLoading}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                              />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="submit"
                                disabled={profileLoading}
                                className="flex-1 py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                              >
                                {profileLoading ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Đang lưu...</span>
                                  </>
                                ) : (
                                  <span>Cập nhật thông tin</span>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsEditingProfile(false)}
                                className="py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                              >
                                Đóng
                              </button>
                            </div>
                          </form>
                        )}
                      </div>

                      {/* Tính năng Đổi mật khẩu trong thẻ tài khoản */}
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            const nextState = !isChangingPassword;
                            setIsChangingPassword(nextState);
                            if (nextState) {
                              setIsEditingProfile(false);
                            }
                            resetPasswordForm();
                          }}
                          className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-2 font-semibold transition-colors cursor-pointer ${
                            isChangingPassword
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <KeyRound className="w-4 h-4 text-emerald-700" />
                            <span>Đổi mật khẩu</span>
                          </span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                              isChangingPassword ? 'rotate-180 text-emerald-700' : ''
                            }`}
                          />
                        </button>

                        {isChangingPassword && (
                          <form
                            onSubmit={handleChangePasswordSubmit}
                            className="px-3.5 py-3 bg-slate-50/80 border-t border-b border-slate-100 space-y-2.5"
                          >
                            {pwError && (
                              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-start gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                <span>{pwError}</span>
                              </div>
                            )}

                            {pwSuccess && (
                              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span className="font-semibold">{pwSuccess}</span>
                              </div>
                            )}

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Mật khẩu hiện tại
                              </label>
                              <div className="relative">
                                <input
                                  type={showPasswords ? 'text' : 'password'}
                                  value={oldPassword}
                                  onChange={(e) => setOldPassword(e.target.value)}
                                  placeholder="Nhập mật khẩu hiện tại..."
                                  disabled={pwLoading}
                                  className="w-full pl-2.5 pr-8 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 font-mono"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPasswords(!showPasswords)}
                                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                  title={showPasswords ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                >
                                  {showPasswords ? (
                                    <EyeOff className="w-3.5 h-3.5" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Mật khẩu mới (tối thiểu 4 ký tự)
                              </label>
                              <input
                                type={showPasswords ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới..."
                                disabled={pwLoading}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 font-mono"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Xác nhận mật khẩu mới
                              </label>
                              <input
                                type={showPasswords ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu mới..."
                                disabled={pwLoading}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 font-mono"
                                required
                              />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="submit"
                                disabled={pwLoading}
                                className="flex-1 py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                              >
                                {pwLoading ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Đang lưu...</span>
                                  </>
                                ) : (
                                  <span>Lưu mật khẩu</span>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsChangingPassword(false);
                                  resetPasswordForm();
                                }}
                                className="py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                              >
                                Đóng
                              </button>
                            </div>
                          </form>
                        )}
                      </div>

                      {/* Tính năng Xóa tài khoản */}
                      <div className="border-t border-slate-100 py-1">
                        {currentUser.role === 'admin' || currentUser.username.toLowerCase() === 'admin' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setIsEditingProfile(false);
                              setIsChangingPassword(false);
                              setIsDeletingOwnAccount(false);
                              resetPasswordForm();
                              onSelectTab('users');
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-700 font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                            <span>Xóa tài khoản người dùng</span>
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                const nextState = !isDeletingOwnAccount;
                                setIsDeletingOwnAccount(nextState);
                                if (nextState) {
                                  setIsEditingProfile(false);
                                  setIsChangingPassword(false);
                                  setDeleteConfirmError(null);
                                }
                              }}
                              className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-2 font-semibold transition-colors cursor-pointer ${
                                isDeletingOwnAccount
                                  ? 'bg-rose-50 text-rose-800'
                                  : 'hover:bg-rose-50 text-rose-700'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <Trash2 className="w-4 h-4 text-rose-600" />
                                <span>Xóa tài khoản</span>
                              </span>
                              <ChevronDown
                                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                                  isDeletingOwnAccount ? 'rotate-180 text-rose-600' : ''
                                }`}
                              />
                            </button>

                            {isDeletingOwnAccount && (
                              <div className="px-3.5 py-3 bg-rose-50/70 border-t border-rose-100 space-y-2.5">
                                <div className="flex items-start gap-2 text-rose-900">
                                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                  <p className="text-[11px] leading-relaxed">
                                    Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản <strong>@{currentUser.username}</strong> khỏi hệ thống? Hành động này không thể hoàn tác.
                                  </p>
                                </div>

                                {deleteConfirmError && (
                                  <div className="p-2 rounded-lg bg-white border border-rose-200 text-rose-700 text-[11px]">
                                    {deleteConfirmError}
                                  </div>
                                )}

                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    type="button"
                                    disabled={deleteConfirmLoading}
                                    onClick={handleConfirmDeleteOwnAccount}
                                    className="flex-1 py-1.5 px-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                                  >
                                    {deleteConfirmLoading ? (
                                      <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Đang xóa...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Xác nhận xóa</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={deleteConfirmLoading}
                                    onClick={() => setIsDeletingOwnAccount(false)}
                                    className="py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {onLogout && (
                        <div className="border-t border-slate-100 pt-1">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setIsChangingPassword(false);
                              setIsDeletingOwnAccount(false);
                              resetPasswordForm();
                              onLogout();
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-700 font-semibold cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Đăng xuất</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              );
            })()
            ) : (
              onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Đăng Nhập</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-slate-100 text-xs overflow-x-auto gap-2">
          <button
            onClick={() => onSelectTab('home')}
            className={`py-1 px-2 whitespace-nowrap flex items-center gap-1 ${
              currentTab === 'home'
                ? 'text-emerald-700 font-bold border-b border-emerald-600'
                : 'text-emerald-950 font-semibold'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>Trang Chủ</span>
          </button>
          <button
            onClick={() => onSelectTab('grade10')}
            className={`py-1 px-2 whitespace-nowrap flex items-center gap-1 ${
              currentTab === 'grade10'
                ? 'text-emerald-700 font-bold border-b border-emerald-600'
                : 'text-emerald-900 font-medium'
            }`}
          >
            <span>Lớp 10</span>
          </button>
          <button
            onClick={() => onSelectTab('grade11')}
            className={`py-1 px-2 whitespace-nowrap flex items-center gap-1 ${
              currentTab === 'grade11'
                ? 'text-amber-700 font-bold border-b border-amber-600'
                : 'text-amber-900 font-medium'
            }`}
          >
            <span>Lớp 11</span>
          </button>
          <button
            onClick={() => onSelectTab('grade12')}
            className={`py-1 px-2 whitespace-nowrap flex items-center gap-1 ${
              currentTab === 'grade12'
                ? 'text-teal-700 font-bold border-b border-teal-600'
                : 'text-teal-900 font-medium'
            }`}
          >
            <span>Lớp 12</span>
          </button>
          <button
            onClick={() => onSelectTab('exams')}
            className={`py-1 px-2 whitespace-nowrap flex items-center gap-1 ${
              currentTab === 'exams'
                ? 'text-emerald-700 font-bold border-b border-emerald-600'
                : 'text-emerald-950 font-semibold'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>TN.THPT</span>
          </button>
          <button
            onClick={() => onSelectTab('mistakes')}
            className={`py-1 px-2 whitespace-nowrap ${
              currentTab === 'mistakes' ? 'text-rose-700 font-bold border-b border-rose-600' : 'text-slate-600'
            }`}
          >
            Câu Sai
          </button>
          <button
            onClick={() => onSelectTab('admin')}
            className={`py-1 px-2 whitespace-nowrap ${
              currentTab === 'admin' ? 'text-emerald-800 font-bold border-b border-emerald-700' : 'text-slate-600'
            }`}
          >
            Bảng Điểm
          </button>
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => onSelectTab('users')}
              className={`py-1 px-2 whitespace-nowrap ${
                currentTab === 'users' ? 'text-emerald-800 font-bold border-b border-emerald-700' : 'text-slate-600'
              }`}
            >
              Người Dùng
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
