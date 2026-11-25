import React, { useState, useEffect } from 'react';
import { subscribeRealtimeEvent } from '../services/realtimeSyncService';
import {
  Users,
  UserCheck,
  UserPlus,
  RefreshCw,
  Search,
  Filter,
  Download,
  Printer,
  Copy,
  Check,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  X,
  Lock,
  Unlock,
  GraduationCap,
  Briefcase,
  Shield,
  Layers,
  AlertTriangle,
  Database,
  Server,
  Calendar,
  Clock,
  CreditCard,
  Award,
  BellRing,
} from 'lucide-react';
import {
  authService,
  removeVietnameseTones,
  PAYMENT_TIERS,
  normalizePaymentAmount,
  getValidityDaysFromPayment,
  normalizeDateYMD,
  getTodayDateYMD,
  computeExpiresAtYMD,
  formatDateVN,
  formatVND,
  getAccountSubscriptionStatus,
  isUnlimitedAccount,
} from '../services/authService';
import { AuthUser, UserRole } from '../types/auth';
import { RealtimeVisitorStatsCard } from './RealtimeVisitorStatsCard';

export interface ManagedUser {
  id?: number | string;
  username: string;
  fullName: string;
  email?: string;
  password?: string;
  role: UserRole;
  className?: string;
  mustChangePassword?: boolean;
  isActive?: boolean;
  createdAt?: string;
  paymentAmount?: number;
  startDate?: string;
  expiresAt?: string;
  aliases?: string[];
}

interface SheetUserManagementViewProps {
  currentUser?: AuthUser | null;
  onOpenLogin?: () => void;
}

export const SheetUserManagementView: React.FC<SheetUserManagementViewProps> = ({
  currentUser,
  onOpenLogin,
}) => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justUpdatedUsername, setJustUpdatedUsername] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'teacher' | 'student'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'locked' | 'must_change' | 'expiring_45'>('all');
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  
  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

  // In-app Confirmation Modals (Replaces native window.confirm & window.alert for sandboxed iframes)
  const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);
  const [selectedUsernames, setSelectedUsernames] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [userToReset, setUserToReset] = useState<ManagedUser | null>(null);
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Form state
  const [formFullName, setFormFullName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [isUsernameManuallyEdited, setIsUsernameManuallyEdited] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('gv123');
  const [formRole, setFormRole] = useState<UserRole>('teacher');
  const [formClass, setFormClass] = useState('Tổ Công Nghệ Nông nghiệp');
  const [formPaymentAmount, setFormPaymentAmount] = useState<number>(200000);
  const [formStartDate, setFormStartDate] = useState<string>(() => getTodayDateYMD());
  const [formMustChange, setFormMustChange] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState('');
  
  // Password visibility map
  const [showPassMap, setShowPassMap] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Tải danh sách người dùng từ hệ thống khi mở trang + đồng bộ SSE thời gian thực + đồng hồ đếm ngược 1 giây
  useEffect(() => {
    loadUserDirectory();

    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    const unsubUsers = subscribeRealtimeEvent('datauser_updated', () => {
      loadUserDirectory();
    });
    const unsubAll = subscribeRealtimeEvent('sync_all_updated', () => {
      loadUserDirectory();
    });

    return () => {
      clearInterval(timer);
      unsubUsers();
      unsubAll();
    };
  }, []);

  const isDefaultSystemPassword = (pw?: string) => {
    const clean = String(pw || '').trim().toLowerCase();
    return clean === 'gv123' || clean === 'admin123' || clean === 'hs123' || clean === '123456';
  };

  const mapRawUsersToManaged = (rawList: any[]): ManagedUser[] => {
    return rawList.map((u: any, idx: number) => {
      const mustChange = false;

      const createdAt = u.created_at || u.createdAt || '2026-11-06T11:50:24.301Z';
      const rawCandidate = u.payment_amount ?? u.paymentAmount;
      const rawPayment =
        rawCandidate !== undefined && rawCandidate !== null ? Number(rawCandidate) : 200000;
      const paymentAmount = normalizePaymentAmount(rawPayment);
      const startDate = normalizeDateYMD(u.start_date || u.startDate || createdAt);
      const expiresAt = computeExpiresAtYMD(startDate, paymentAmount, u.role);

      return {
        id: u.id || idx + 1,
        username: u.username,
        fullName: u.fullName || u.username,
        email: u.email || `${u.username}@truong.edu.vn`,
        password: u.password || '••••••',
        role: (u.role as UserRole) || 'teacher',
        className: u.className || (u.role === 'student' ? '12A1' : 'Tổ Công Nghệ Nông nghiệp'),
        mustChangePassword: mustChange,
        isActive: u.is_active !== undefined ? Boolean(u.is_active) : (u.isActive !== undefined ? Boolean(u.isActive) : true),
        createdAt,
        paymentAmount,
        startDate,
        expiresAt,
        aliases: u.aliases || [],
      };
    });
  };

  const loadUserDirectory = async () => {
    setIsLoading(true);
    try {
      const data = await authService.fetchDataUserAccounts();
      if (data && Array.isArray(data.users) && data.users.length > 0) {
        setUsers(mapRawUsersToManaged(data.users));
      } else {
        setUsers([]);
      }
    } catch (e) {
      console.warn('Error loading user directory:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = (initialRole: UserRole = 'teacher') => {
    setEditingUser(null);
    setFormFullName('');
    setFormUsername('');
    setIsUsernameManuallyEdited(false);
    setFormEmail('');
    setFormRole(initialRole);
    setFormPassword(
      initialRole === 'student' ? 'hs123' : initialRole === 'admin' ? 'admin123' : 'gv123'
    );
    setFormClass(initialRole === 'student' ? '12A1' : 'Tổ Công Nghệ Nông nghiệp');
    setFormPaymentAmount(initialRole === 'student' ? 100000 : 200000);
    setFormStartDate(getTodayDateYMD());
    setFormMustChange(false);
    setFormIsActive(true);
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (user: ManagedUser) => {
    setEditingUser(user);
    setFormFullName(user.fullName);
    setFormUsername(user.username);
    setIsUsernameManuallyEdited(true);
    setFormEmail(user.email || '');
    setFormPassword(user.password || '');
    setFormRole(user.role);
    setFormClass(user.className || '');
    const defaultUserPay = user.role === 'student' ? 100000 : 200000;
    const rawUserPayment =
      user.paymentAmount !== undefined && user.paymentAmount !== null
        ? Number(user.paymentAmount)
        : defaultUserPay;
    setFormPaymentAmount(
      rawUserPayment === 0
        ? 0
        : user.role === 'student' && rawUserPayment <= 100000
        ? 100000
        : normalizePaymentAmount(rawUserPayment)
    );
    setFormStartDate(normalizeDateYMD(user.startDate || user.createdAt));
    setFormMustChange(false);
    setFormIsActive(user.isActive ?? true);
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  // Cập nhật trực tiếp Tiền nộp hoặc Ngày bắt đầu theo thời gian thực ngay trên bảng (Chỉ Admin mới có quyền)
  const handleInlineUpdateSubscription = async (
    user: ManagedUser,
    updates: { paymentAmount?: number; startDate?: string; role?: UserRole }
  ) => {
    const nextRole = updates.role || user.role;
    const rawCandidate = updates.paymentAmount !== undefined ? updates.paymentAmount : user.paymentAmount;
    const rawNextPayment =
      rawCandidate !== undefined && rawCandidate !== null
        ? Number(rawCandidate)
        : nextRole === 'student'
        ? 100000
        : 200000;
    const nextPayment =
      rawNextPayment === 0
        ? 0
        : nextRole === 'student' && rawNextPayment <= 100000
        ? 100000
        : normalizePaymentAmount(rawNextPayment);
    const nextStart = normalizeDateYMD(updates.startDate ?? user.startDate ?? user.createdAt);
    const nextExpires = computeExpiresAtYMD(nextStart, nextPayment, nextRole);
    const validityDays = getValidityDaysFromPayment(nextPayment, nextRole);

    const updatedUser: ManagedUser = {
      ...user,
      role: nextRole,
      paymentAmount: nextPayment,
      startDate: nextStart,
      expiresAt: nextExpires,
    };

    // Optimistic UI update in real time
    setUsers((prev) =>
      prev.map((u) => (u.username.toLowerCase() === user.username.toLowerCase() ? updatedUser : u))
    );
    setJustUpdatedUsername(user.username);
    setTimeout(() => setJustUpdatedUsername(null), 5000);

    const saveRes = await authService.saveAccountToDataUser({
      id: user.id,
      username: user.username,
      originalUsername: user.username,
      password: user.password || (nextRole === 'student' ? 'hs123' : 'gv123'),
      role: nextRole,
      fullName: user.fullName,
      email: user.email,
      className: user.className,
      must_change_password: user.mustChangePassword,
      is_active: user.isActive,
      created_at: user.createdAt,
      payment_amount: nextPayment,
      start_date: nextStart,
      expires_at: nextExpires,
      aliases: user.aliases,
      adminExplicitSubscription: true,
    });

    if (saveRes.success) {
      setToastMessage({
        type: 'success',
        text: `Cập nhật thời gian thực cho "${user.fullName}" (@${user.username}): Tiền nộp ${formatVND(
          nextPayment
        )} (${validityDays} ngày) · Bắt đầu ${formatDateVN(nextStart)} · Hết hạn ${formatDateVN(
          nextExpires
        )}`,
      });
      setTimeout(() => setToastMessage(null), 5000);
    } else {
      setToastMessage({
        type: 'error',
        text: saveRes.message || 'Không thể lưu cập nhật hạn dùng.',
      });
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Khóa hoặc mở lại tài khoản người dùng theo thời gian thực
  const handleToggleLockUser = async (user: ManagedUser) => {
    if (user.username.toLowerCase() === 'admin') {
      setToastMessage({
        type: 'error',
        text: 'Không thể khóa tài khoản Quản trị viên chính (admin)!',
      });
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    const nextActive = user.isActive === false ? true : false;
    const updatedUser: ManagedUser = {
      ...user,
      isActive: nextActive,
    };

    setUsers((prev) =>
      prev.map((u) => (u.username.toLowerCase() === user.username.toLowerCase() ? updatedUser : u))
    );
    setJustUpdatedUsername(user.username);
    setTimeout(() => setJustUpdatedUsername(null), 5000);

    const saveRes = await authService.saveAccountToDataUser({
      id: user.id,
      username: user.username,
      originalUsername: user.username,
      password: user.password || 'gv123',
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      className: user.className,
      must_change_password: user.mustChangePassword,
      is_active: nextActive,
      created_at: user.createdAt,
      payment_amount: user.paymentAmount,
      start_date: user.startDate,
      expires_at: user.expiresAt,
      aliases: user.aliases,
    });

    if (saveRes.success) {
      setToastMessage({
        type: nextActive ? 'success' : 'info',
        text: nextActive
          ? `Đã mở lại tài khoản "${user.fullName}" (@${user.username}) thành công! Người dùng có thể đăng nhập bình thường.`
          : `Đã khóa tài khoản "${user.fullName}" (@${user.username}) thành công! Người dùng này tạm thời không thể đăng nhập.`,
      });
      setTimeout(() => setToastMessage(null), 5000);
    } else {
      setToastMessage({
        type: 'error',
        text: saveRes.message || 'Không thể cập nhật trạng thái khóa/mở tài khoản.',
      });
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawUsername = formUsername.trim() || formFullName.trim();
    if (!formFullName.trim() || !rawUsername || !formPassword.trim()) {
      setFormError('Vui lòng điền đầy đủ Họ tên, Tên đăng nhập và Mật khẩu.');
      return;
    }

    const cleanUsername = removeVietnameseTones(rawUsername)
      .replace(/^@+/, '')
      .replace(/[\u00A0\uFEFF\s]+/g, '')
      .replace(/[^a-z0-9._@-]/g, '')
      .trim()
      .toLowerCase();

    if (!cleanUsername) {
      setFormError('Tên đăng nhập không hợp lệ.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      const cleanEmail = formEmail.trim() || `${cleanUsername}@truong.edu.vn`;
      const cleanPassword = formPassword.trim();
      const effectiveMustChange = false;

      const rawResolvedPayment =
        formPaymentAmount !== undefined && formPaymentAmount !== null
          ? Number(formPaymentAmount)
          : formRole === 'student'
          ? 100000
          : 200000;
      const candidatePayment =
        rawResolvedPayment === 0
          ? 0
          : formRole === 'student' && rawResolvedPayment <= 100000
          ? 100000
          : normalizePaymentAmount(rawResolvedPayment);

      const originalStart = editingUser
        ? normalizeDateYMD(editingUser.startDate || editingUser.createdAt)
        : '';
      const originalPayment = editingUser
        ? normalizePaymentAmount(
            editingUser.paymentAmount !== undefined && editingUser.paymentAmount !== null
              ? Number(editingUser.paymentAmount)
              : editingUser.role === 'student'
              ? 100000
              : 200000
          )
        : -1;

      const didAdminChangeSubscription =
        !editingUser ||
        normalizeDateYMD(formStartDate) !== originalStart ||
        candidatePayment !== originalPayment ||
        formRole !== editingUser.role;

      // Khi Admin cập nhật mật khẩu hoặc sửa thông tin mà không đổi Ngày bắt đầu / Tiền nộp: giữ nguyên 100% số ngày còn lại của hạn dùng
      const resolvedPayment =
        editingUser && !didAdminChangeSubscription ? originalPayment : candidatePayment;
      const resolvedStart =
        editingUser && !didAdminChangeSubscription
          ? originalStart
          : normalizeDateYMD(formStartDate);
      const resolvedExpires =
        editingUser &&
        !didAdminChangeSubscription &&
        editingUser.expiresAt &&
        (/^\d{4}-\d{2}-\d{2}$/.test(editingUser.expiresAt) ||
          editingUser.expiresAt === 'Vĩnh viễn')
          ? editingUser.expiresAt
          : computeExpiresAtYMD(resolvedStart, resolvedPayment, formRole);

      const isOnlyPasswordUpdate =
        Boolean(editingUser) &&
        !didAdminChangeSubscription &&
        cleanPassword !== (editingUser?.password || '') &&
        formFullName.trim() === editingUser?.fullName &&
        cleanUsername === editingUser?.username.toLowerCase();

      const newUserObj: ManagedUser = {
        id: editingUser?.id || Date.now(),
        username: cleanUsername,
        fullName: formFullName.trim(),
        email: cleanEmail,
        password: cleanPassword,
        role: formRole,
        className: formClass.trim() || (formRole === 'student' ? 'Ôn THPT' : 'Tổ Công Nghệ Nông nghiệp'),
        mustChangePassword: effectiveMustChange,
        isActive: formIsActive,
        createdAt: editingUser?.createdAt || new Date().toISOString(),
        paymentAmount: resolvedPayment,
        startDate: resolvedStart,
        expiresAt: resolvedExpires,
      };

      const userAliases = Array.from(
        new Set(
          [
            cleanUsername,
            rawUsername.replace(/^@+/, '').trim(),
            removeVietnameseTones(newUserObj.fullName),
            removeVietnameseTones(newUserObj.fullName).replace(/\s+/g, ''),
            cleanEmail.split('@')[0] || '',
          ].filter(Boolean)
        )
      );

      // Save to server & localStorage (syncs directly to datauser.json & browser storage)
      const saveRes = await authService.saveAccountToDataUser({
        id: newUserObj.id,
        username: newUserObj.username,
        originalUsername: editingUser?.username,
        password: newUserObj.password!,
        role: newUserObj.role,
        fullName: newUserObj.fullName,
        email: newUserObj.email,
        className: newUserObj.className,
        must_change_password: newUserObj.mustChangePassword,
        is_active: newUserObj.isActive,
        created_at: newUserObj.createdAt,
        payment_amount: newUserObj.paymentAmount,
        start_date: newUserObj.startDate,
        expires_at: newUserObj.expiresAt,
        aliases: userAliases,
        onlyResetPassword: isOnlyPasswordUpdate,
        adminExplicitSubscription: didAdminChangeSubscription,
      });

      if (!saveRes.success) {
        setFormError(saveRes.message || 'Không thể lưu tài khoản. Vui lòng thử lại.');
        setIsSaving(false);
        return;
      }

      // Reset filters so the newly added or edited user is immediately visible in the table
      setRoleFilter('all');
      setStatusFilter('all');
      setSearchQuery('');

      if (Array.isArray(saveRes.users) && saveRes.users.length > 0) {
        const mapped = mapRawUsersToManaged(saveRes.users);
        const hasNewUser = mapped.some(
          (u) => u.username.toLowerCase() === newUserObj.username.toLowerCase()
        );
        if (hasNewUser) {
          setUsers(mapped);
        } else {
          setUsers([
            newUserObj,
            ...mapped.filter((u) => u.username.toLowerCase() !== newUserObj.username.toLowerCase()),
          ]);
        }
      } else if (editingUser) {
        setUsers((prev) =>
          prev.map((u) =>
            u.username.toLowerCase() === editingUser.username.toLowerCase() ? newUserObj : u
          )
        );
      } else {
        setUsers((prev) => [
          newUserObj,
          ...prev.filter((u) => u.username.toLowerCase() !== newUserObj.username.toLowerCase()),
        ]);
      }

      setJustUpdatedUsername(newUserObj.username);
      setTimeout(() => setJustUpdatedUsername(null), 8000);

      const savedSub = getAccountSubscriptionStatus({
        role: newUserObj.role,
        username: newUserObj.username,
        startDate: newUserObj.startDate,
        paymentAmount: newUserObj.paymentAmount,
        nowMs,
      });
      const savedRemainingText = savedSub.isUnlimited
        ? 'Sử dụng vô hạn (Vĩnh viễn)'
        : savedSub.isExpired
        ? 'Đã hết hạn'
        : `Còn ${savedSub.remainingDays} ngày`;

      setToastMessage({
        type: 'success',
        text: editingUser
          ? !didAdminChangeSubscription && cleanPassword !== (editingUser.password || '')
            ? `Đã cập nhật mật khẩu tài khoản "${newUserObj.fullName}" (@${newUserObj.username}) — Giữ nguyên ngày bắt đầu (${savedSub.startDateVN}) và số ngày còn lại (${savedRemainingText})!`
            : `Đã cập nhật tài khoản "${newUserObj.fullName}" (@${newUserObj.username}) — Ngày bắt đầu: ${savedSub.startDateVN} · Số ngày còn lại: ${savedRemainingText}!`
          : `Đã lưu ngay tài khoản "${newUserObj.fullName}" (@${newUserObj.username}) vào hệ thống — Người dùng đăng nhập được ngay mà không cần Admin xuất bản!`,
      });
      setTimeout(() => setToastMessage(null), 6000);

      setIsAddEditModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Safe delete handler without window.confirm (avoids iframe blocking)
  const promptDeleteUser = (user: ManagedUser) => {
    if (user.username.toLowerCase() === 'admin') {
      setToastMessage({
        type: 'error',
        text: 'Không thể xóa tài khoản Quản trị viên chính (admin)!',
      });
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setUserToDelete(user);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const targetUser = userToDelete;
      const targetLower = targetUser.username.toLowerCase();
      await authService.deleteAccountFromDataUser(targetUser.username);
      setUsers((prev) => prev.filter((u) => u.username.toLowerCase() !== targetLower));
      setSelectedUsernames((prev) => prev.filter((u) => u.toLowerCase() !== targetLower));
      setToastMessage({
        type: 'success',
        text: `Đã xóa vĩnh viễn tài khoản "${targetUser.fullName}" (@${targetUser.username}) và lưu ngay vào hệ thống!`,
      });
      setUserToDelete(null);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e: any) {
      setToastMessage({
        type: 'error',
        text: e.message || 'Lỗi khi xóa tài khoản.',
      });
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectUser = (username: string) => {
    const cleanU = username.toLowerCase();
    if (cleanU === 'admin') return;
    setSelectedUsernames((prev) =>
      prev.some((u) => u.toLowerCase() === cleanU)
        ? prev.filter((u) => u.toLowerCase() !== cleanU)
        : [...prev, username]
    );
  };

  const confirmBulkDeleteUsers = async () => {
    if (selectedUsernames.length === 0) return;
    setIsBulkDeleting(true);
    try {
      const targets = selectedUsernames.filter((u) => u.toLowerCase() !== 'admin');
      const deletedCount = await authService.deleteMultipleAccountsFromDataUser(targets);
      const targetSet = new Set(targets.map((u) => u.toLowerCase()));
      setUsers((prev) => prev.filter((u) => !targetSet.has(u.username.toLowerCase())));
      setSelectedUsernames([]);
      setIsBulkDeleteModalOpen(false);
      setToastMessage({
        type: 'success',
        text: `Đã xóa vĩnh viễn ${deletedCount} tài khoản đã chọn và lưu ngay vào hệ thống!`,
      });
      setTimeout(() => setToastMessage(null), 5000);
    } catch (e: any) {
      setToastMessage({
        type: 'error',
        text: e.message || 'Lỗi khi xóa các tài khoản đã chọn.',
      });
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Safe update/reset password handler without window.confirm (avoids iframe blocking)
  const promptResetPassword = (user: ManagedUser) => {
    const defaultPass =
      user.role === 'admin' || user.username.toLowerCase() === 'admin'
        ? 'admin123'
        : user.role === 'student'
        ? 'hs123'
        : 'gv123';
    setResetPasswordInput(user.password && user.password !== '••••••' ? user.password : defaultPass);
    setUserToReset(user);
  };

  const confirmResetPassword = async () => {
    if (!userToReset) return;
    setIsResetting(true);
    const defaultPass =
      userToReset.role === 'admin' || userToReset.username.toLowerCase() === 'admin'
        ? 'admin123'
        : userToReset.role === 'student'
        ? 'hs123'
        : 'gv123';
    const nextPass = resetPasswordInput.trim() || defaultPass;
    const preservedStart = normalizeDateYMD(userToReset.startDate || userToReset.createdAt);
    const preservedPayment = normalizePaymentAmount(
      userToReset.paymentAmount !== undefined && userToReset.paymentAmount !== null
        ? Number(userToReset.paymentAmount)
        : userToReset.role === 'student'
        ? 100000
        : 200000
    );
    const preservedExpires =
      userToReset.expiresAt &&
      (/^\d{4}-\d{2}-\d{2}$/.test(userToReset.expiresAt) || userToReset.expiresAt === 'Vĩnh viễn')
        ? userToReset.expiresAt
        : computeExpiresAtYMD(preservedStart, preservedPayment, userToReset.role);
    const currentSub = getAccountSubscriptionStatus({
      role: userToReset.role,
      username: userToReset.username,
      startDate: preservedStart,
      paymentAmount: preservedPayment,
      nowMs,
    });
    try {
      await authService.saveAccountToDataUser({
        id: userToReset.id,
        username: userToReset.username,
        originalUsername: userToReset.username,
        password: nextPass,
        role: userToReset.role,
        fullName: userToReset.fullName,
        email: userToReset.email,
        className: userToReset.className,
        must_change_password: false,
        is_active: userToReset.isActive,
        created_at: userToReset.createdAt,
        payment_amount: preservedPayment,
        paymentAmount: preservedPayment,
        start_date: preservedStart,
        startDate: preservedStart,
        expires_at: preservedExpires,
        expiresAt: preservedExpires,
        aliases: userToReset.aliases,
        onlyResetPassword: true,
        adminExplicitSubscription: false,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.username.toLowerCase() === userToReset.username.toLowerCase()
            ? {
                ...u,
                password: nextPass,
                mustChangePassword: false,
                paymentAmount: preservedPayment,
                startDate: preservedStart,
                expiresAt: preservedExpires,
              }
            : u
        )
      );

      const remainingText = currentSub.isUnlimited
        ? 'Sử dụng vô hạn (Vĩnh viễn)'
        : currentSub.isExpired
        ? 'Đã hết hạn'
        : `Còn ${currentSub.remainingDays} ngày`;

      setToastMessage({
        type: 'success',
        text: `Đã cập nhật mật khẩu tài khoản "${userToReset.fullName}" thành "${nextPass}" — Giữ nguyên ngày bắt đầu (${currentSub.startDateVN}) và số ngày còn lại (${remainingText})!`,
      });
      setUserToReset(null);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (e: any) {
      setToastMessage({
        type: 'error',
        text: e.message || 'Lỗi khi đặt lại mật khẩu.',
      });
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsResetting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'STT',
      'Họ và tên',
      'Tên đăng nhập',
      'Email',
      'Mật khẩu',
      'Vai trò',
      'Lớp / Bộ môn',
      'Tiền nộp',
      'Ngày bắt đầu',
      'Ngày hết hạn',
      'Số ngày còn lại',
      'Yêu cầu đổi MK',
      'Trạng thái',
    ];
    const rows = filteredUsers.map((u, i) => {
      const sub = getAccountSubscriptionStatus({
        role: u.role,
        username: u.username,
        startDate: u.startDate || u.createdAt,
        paymentAmount: u.paymentAmount,
        nowMs,
      });
      return [
        i + 1,
        `"${u.fullName}"`,
        `"${u.username}"`,
        `"${u.email || ''}"`,
        `"${u.password || ''}"`,
        `"${u.role === 'admin' ? 'Quản trị viên' : u.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}"`,
        `"${u.className || ''}"`,
        `"${sub.isUnlimited ? 'Sử dụng vô hạn' : `${sub.paymentLabel} (${sub.validityDays} ngày)`}"`,
        `"${sub.isUnlimited ? 'Sử dụng vô hạn' : sub.startDateVN}"`,
        `"${sub.isUnlimited ? 'Sử dụng vô hạn' : sub.expiresAtVN}"`,
        `"${sub.isUnlimited ? 'Sử dụng vô hạn (Vĩnh viễn)' : sub.isExpired ? 'Đã hết hạn' : `Còn ${sub.remainingDays} ngày`}"`,
        `"${u.mustChangePassword ? 'Có' : 'Không'}"`,
        `"${u.isActive ? 'Hoạt động' : 'Đang khóa'}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_sach_nguoi_dung_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintUserList = () => {
    window.print();
  };

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.className && u.className.toLowerCase().includes(q));

    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const sub = getAccountSubscriptionStatus({
      role: u.role,
      username: u.username,
      startDate: u.startDate || u.createdAt,
      paymentAmount: u.paymentAmount,
      nowMs,
    });
    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? u.isActive !== false
        : statusFilter === 'locked'
        ? u.isActive === false
        : statusFilter === 'expiring_45'
        ? sub.isCountdownWarning || sub.isExpired
        : u.mustChangePassword === true;

    return matchQuery && matchRole && matchStatus;
  });

  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalTeachers = users.filter((u) => u.role === 'teacher').length;
  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalActive = users.filter((u) => u.isActive !== false).length;
  const totalLocked = users.filter((u) => u.isActive === false).length;
  const expiringOrExpiredUsers = users
    .map((u) => ({
      user: u,
      sub: getAccountSubscriptionStatus({
        role: u.role,
        username: u.username,
        startDate: u.startDate || u.createdAt,
        paymentAmount: u.paymentAmount,
        nowMs,
      }),
    }))
    .filter((item) => item.sub.isCountdownWarning || item.sub.isExpired);

  // Guard: Only Admin can access User Management
  if (currentUser?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-8 h-8 text-amber-700" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Khu Vực Dành Riêng Cho Quản Trị Viên (Admin)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Thẻ Quản lý người dùng chỉ dành riêng cho tài khoản có quyền <strong>Quản trị viên (admin)</strong>. Vui lòng đăng nhập bằng tài khoản Admin để quản lý danh sách người dùng.
          </p>
          {onOpenLogin && (
            <div className="pt-3 flex justify-center">
              <button
                onClick={onOpenLogin}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Users className="w-4 h-4" />
                <span>Đăng Nhập Tài Khoản Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-4 z-50 max-w-md p-4 rounded-xl shadow-xl border flex items-center justify-between gap-3 text-xs sm:text-sm animate-in slide-in-from-top-2 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-sky-50 border-sky-300 text-sky-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            {toastMessage.type === 'info' && <Sparkles className="w-5 h-5 text-sky-600 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Quản Lý Tài Khoản Người Dùng
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-700" />
                  <span>Chỉ Admin Quản Lý</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Danh sách người dùng được quản lý cố định bởi Quản trị viên (Admin), hệ thống không tự động cập nhật hay tự ý thêm/khôi phục người dùng.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
            {selectedUsernames.length > 0 && (
              <button
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                title="Xóa toàn bộ các tài khoản đang được tích chọn"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa {selectedUsernames.length} Tài Khoản Đã Chọn</span>
              </button>
            )}

            <button
              onClick={() => handleOpenAddModal('teacher')}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm Giáo Viên</span>
            </button>

            <button
              onClick={() => handleOpenAddModal('student')}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Thêm Học Sinh (MK: hs123)</span>
            </button>

            <button
              onClick={loadUserDirectory}
              disabled={isLoading}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Tải lại danh sách tài khoản từ hệ thống"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Đang tải...' : 'Làm Mới'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Database Status Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>Danh Sách Tài Khoản Cố Định (datauser.json)</span>
              </h2>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed max-w-2xl">
              Danh sách người dùng hoàn toàn cố định và chỉ thay đổi khi Admin trực tiếp thực hiện thao tác thêm mới, chỉnh sửa hoặc xóa tài khoản. Hệ thống không tự động cập nhật hay tự ý sinh thêm người dùng.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-emerald-700 shadow-2xs cursor-pointer active:scale-95"
              title="Xuất danh sách tài khoản ra tệp Excel CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất CSV</span>
            </button>

            <button
              onClick={handlePrintUserList}
              className="px-3.5 py-2 bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-emerald-700 shadow-2xs cursor-pointer active:scale-95"
              title="In danh sách tài khoản"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Danh Sách</span>
            </button>
          </div>
        </div>

        {/* Status Highlights */}
        <div className="pt-3 border-t border-emerald-800/60 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Tệp hệ thống: <strong>datauser.json (Đồng bộ trực tiếp)</strong></span>
          </div>
          <span className="text-emerald-700 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Tài khoản quản trị viên: <strong>admin (Bảo vệ)</strong></span>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Tổng người dùng</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{users.length}</div>
          <span className="text-[11px] text-slate-400">Tài khoản toàn trường</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-amber-700 font-medium flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            Quản trị viên
          </span>
          <div className="text-2xl font-bold text-amber-900 mt-1">{totalAdmins}</div>
          <span className="text-[11px] text-amber-600">MK mặc định: admin123</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" />
            Giáo viên
          </span>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{totalTeachers}</div>
          <span className="text-[11px] text-emerald-600">MK mặc định: gv123</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-sky-700 font-medium flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" />
            Học sinh
          </span>
          <div className="text-2xl font-bold text-sky-900 mt-1">{totalStudents}</div>
          <span className="text-[11px] text-sky-600">MK mặc định: hs123</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            Đang hoạt động
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{totalActive}</div>
          <span className="text-[11px] text-slate-400">Sẵn sàng đăng nhập</span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'expiring_45' ? 'all' : 'expiring_45')}
          className={`p-4 rounded-xl border shadow-2xs cursor-pointer transition-all ${
            expiringOrExpiredUsers.length > 0
              ? 'bg-amber-50 border-amber-300 hover:bg-amber-100/70'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
          title="Bấm để lọc các tài khoản còn hạn ≤ 45 ngày hoặc đã hết hạn"
        >
          <span className="text-xs text-amber-800 font-bold flex items-center gap-1">
            <BellRing className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
            Cảnh báo hạn ≤ 45 ngày
          </span>
          <div className="text-2xl font-extrabold text-amber-900 mt-1">
            {expiringOrExpiredUsers.length}
          </div>
          <span className="text-[11px] text-amber-700">Đếm ngược gia hạn</span>
        </div>
      </div>

      {/* Quy tắc Thẻ Tiền Nộp & Thời Hạn Sử Dụng */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-emerald-950 font-semibold">
          <div className="p-2 rounded-xl bg-emerald-700 text-white shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-emerald-950">
              Quy Tắc Thẻ Tiền Nộp &amp; Cài Đặt Ngày Bắt Đầu (Chỉ Admin Mới Được Cập Nhật Ngày Bắt Đầu)
            </div>
            <p className="text-slate-600 font-normal mt-0.5">
              <strong>Ngày bắt đầu</strong> chỉ <strong>Quản trị viên (Admin)</strong> mới được cập nhật (hệ thống và người dùng không tự động thay đổi ngày bắt đầu). Khi Admin <strong>cập nhật hoặc khôi phục mật khẩu</strong>, <strong>số ngày còn lại của hạn dùng được giữ nguyên không đổi</strong>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-purple-900 font-bold shadow-2xs flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-purple-600" />
            <span>Trải nghiệm (free): 7 ngày · Chỉ giới hạn 3 lượt tải tài liệu · Giao bài QR không giới hạn</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-sky-900 font-bold shadow-2xs flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-sky-600" />
            <span>Học sinh VIP: 100.000đ = 365 ngày (Không được giao bài cho thành viên khác)</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold shadow-2xs flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Giáo viên VIP: 200.000đ = 365 ngày (Mở khóa toàn bộ tính năng 365 ngày)</span>
          </span>
        </div>
      </div>

      {/* Thông báo đếm ngược khi hạn sử dụng còn <= 45 ngày */}
      {expiringOrExpiredUsers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs shrink-0">
                <BellRing className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-amber-950">
                  Thông Báo Đếm Ngược Hạn Sử Dụng Tài Khoản (Còn ≤ 45 Ngày)
                </h3>
                <p className="text-xs text-amber-800">
                  Có <strong>{expiringOrExpiredUsers.length}</strong> tài khoản đang trong thời gian đếm ngược (≤ 45 ngày) hoặc đã hết hạn cần gia hạn.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-200/80 text-amber-950 font-mono text-xs font-bold self-start sm:self-auto">
              Đồng bộ thời gian thực (Live)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {expiringOrExpiredUsers.map(({ user, sub }) => (
              <div
                key={`exp_alert_${user.username}`}
                className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${
                  sub.isExpired
                    ? 'bg-rose-100/90 border-rose-300 text-rose-950'
                    : 'bg-white border-amber-300 text-slate-900 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      <span>{user.fullName}</span>
                      <span className="font-mono text-[11px] text-slate-500">(@{user.username})</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Tiền nộp: <strong>{sub.paymentLabel}</strong> ({sub.validityDays} ngày)
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.isExpired
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {sub.isExpired ? 'Đã hết hạn' : `Còn ${sub.remainingDays} ngày`}
                    </span>
                    {user.username.toLowerCase() !== 'admin' && (
                      <button
                        type="button"
                        onClick={() => promptDeleteUser(user)}
                        className="px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Xóa tài khoản này khỏi hệ thống"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Xóa TK</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[11px] flex items-center justify-between text-slate-600 border-t border-slate-100 pt-1.5">
                  <span>Bắt đầu: <strong>{sub.startDateVN}</strong></span>
                  <span>Hết hạn: <strong className="text-rose-700">{sub.expiresAtVN}</strong></span>
                </div>

                <div
                  className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold text-center flex items-center justify-center gap-1.5 ${
                    sub.isExpired
                      ? 'bg-rose-200/80 text-rose-900'
                      : 'bg-amber-100 text-amber-950 border border-amber-300'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  {sub.isExpired ? (
                    <span>Hết hạn sử dụng — Vui lòng cập nhật ngày bắt đầu / tiền nộp</span>
                  ) : (
                    <span>
                      Đếm ngược: {sub.countdownParts.days} ngày {String(sub.countdownParts.hours).padStart(2, '0')}g{' '}
                      {String(sub.countdownParts.minutes).padStart(2, '0')}p{' '}
                      {String(sub.countdownParts.seconds).padStart(2, '0')}s
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Visitor & Traffic Statistics Card (Admin Only) */}
      <RealtimeVisitorStatsCard
        currentUser={currentUser}
        currentTab="users"
        defaultExpanded={false}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo họ tên, tên đăng nhập, email, lớp..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                roleFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                roleFilter === 'admin' ? 'bg-white text-amber-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin ({totalAdmins})
            </button>
            <button
              onClick={() => setRoleFilter('teacher')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                roleFilter === 'teacher' ? 'bg-white text-emerald-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Giáo viên ({totalTeachers})
            </button>
            <button
              onClick={() => setRoleFilter('student')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                roleFilter === 'student' ? 'bg-white text-sky-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Học sinh ({totalStudents})
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động ({totalActive})</option>
            <option value="locked">Đang bị khóa ({totalLocked})</option>
            <option value="expiring_45">Sắp hết hạn (≤ 45 ngày) / Quá hạn</option>
            <option value="must_change">Cần đổi mật khẩu</option>
          </select>

          {selectedUsernames.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa {selectedUsernames.length} TK đã chọn</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedUsernames([])}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Bỏ chọn
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-3 w-10 text-center">
                  {(() => {
                    const deletableFiltered = filteredUsers.filter(
                      (u) => u.username.toLowerCase() !== 'admin'
                    );
                    const allSelected =
                      deletableFiltered.length > 0 &&
                      deletableFiltered.every((u) =>
                        selectedUsernames.some(
                          (sel) => sel.toLowerCase() === u.username.toLowerCase()
                        )
                      );
                    return (
                      <input
                        type="checkbox"
                        checked={allSelected}
                        disabled={deletableFiltered.length === 0}
                        onChange={() => {
                          if (allSelected) {
                            const filteredSet = new Set(
                              deletableFiltered.map((u) => u.username.toLowerCase())
                            );
                            setSelectedUsernames((prev) =>
                              prev.filter((u) => !filteredSet.has(u.toLowerCase()))
                            );
                          } else {
                            const merged = Array.from(
                              new Set([
                                ...selectedUsernames,
                                ...deletableFiltered.map((u) => u.username),
                              ])
                            );
                            setSelectedUsernames(merged);
                          }
                        }}
                        className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        title="Chọn tất cả tài khoản trong danh sách để xóa nhanh"
                      />
                    );
                  })()}
                </th>
                <th className="py-3.5 px-2 w-10 text-center">STT</th>
                <th className="py-3.5 px-3">Họ và Tên / Email</th>
                <th className="py-3.5 px-3">Tài Khoản &amp; MK</th>
                <th className="py-3.5 px-3">Vai Trò</th>
                <th className="py-3.5 px-3">Thẻ Tiền Nộp</th>
                <th className="py-3.5 px-3">Ngày Bắt Đầu (Chỉ Admin Cài Đặt)</th>
                <th className="py-3.5 px-3">Ngày Hết Hạn &amp; Đếm Ngược</th>
                <th className="py-3.5 px-3">Trạng Thái</th>
                <th className="py-3.5 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-slate-600">Không tìm thấy tài khoản phù hợp</p>
                    <p className="text-xs text-slate-400 mt-1">Hãy thử tìm từ khóa khác hoặc bấm "Làm mới"</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
                  const isPassVisible = Boolean(showPassMap[user.username]);
                  const isCopiedUser = copiedField === `user_${user.username}`;
                  const isCopiedPass = copiedField === `pass_${user.username}`;
                  const isJustUpdated =
                    justUpdatedUsername &&
                    justUpdatedUsername.toLowerCase() === user.username.toLowerCase();
                  const isSelectedForDelete = selectedUsernames.some(
                    (sel) => sel.toLowerCase() === user.username.toLowerCase()
                  );

                  const sub = getAccountSubscriptionStatus({
                    role: user.role,
                    username: user.username,
                    startDate: user.startDate || user.createdAt,
                    paymentAmount: user.paymentAmount,
                    nowMs,
                  });

                  return (
                    <tr
                      key={user.username}
                      className={`transition-colors group ${
                        isSelectedForDelete
                          ? 'bg-rose-50/70 hover:bg-rose-100/60'
                          : isJustUpdated
                          ? 'bg-emerald-50/90 hover:bg-emerald-100/70'
                          : sub.isExpired
                          ? 'bg-rose-50/40 hover:bg-rose-50/80'
                          : sub.isCountdownWarning
                          ? 'bg-amber-50/50 hover:bg-amber-50/90'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        {user.username.toLowerCase() !== 'admin' ? (
                          <input
                            type="checkbox"
                            checked={isSelectedForDelete}
                            onChange={() => toggleSelectUser(user.username)}
                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                            title={`Chọn tài khoản @${user.username} để xóa`}
                          />
                        ) : (
                          <span title="Tài khoản Admin được bảo vệ">
                            <Shield className="w-3.5 h-3.5 text-amber-600 mx-auto" />
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-center text-slate-400 font-mono text-xs">
                        {index + 1}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{user.fullName}</span>
                          {isJustUpdated && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-2xs">
                              Vừa cập nhật
                            </span>
                          )}
                        </div>
                        {sub.validityDays === 365 && (
                          <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            <Award className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{sub.isStudentMemberTier ? 'Học sinh VIP' : 'Giáo viên VIP'}</span>
                          </div>
                        )}
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {user.email || `${user.username}@truong.edu.vn`}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {user.className || 'Tổ Công Nghệ'}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 space-y-1.5">
                        <div>
                          <div className="inline-flex items-center gap-1.5 font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-md text-slate-800 font-semibold">
                            <span>@{user.username}</span>
                            <button
                              onClick={() => copyToClipboard(user.username, `user_${user.username}`)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Sao chép tên đăng nhập"
                            >
                              {isCopiedUser ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          {sub.validityDays === 365 && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] font-extrabold text-amber-600">
                              <Award className="w-3 h-3 text-amber-500 shrink-0" />
                              <span>{sub.isStudentMemberTier ? 'Học sinh VIP' : 'Giáo viên VIP'}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 font-mono text-[11px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-slate-800 w-fit">
                          <span className={isPassVisible ? 'font-bold' : 'text-slate-400'}>
                            {isPassVisible ? user.password || '••••••' : '••••••'}
                          </span>
                          <button
                            onClick={() =>
                              setShowPassMap((prev) => ({
                                ...prev,
                                [user.username]: !prev[user.username],
                              }))
                            }
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                            title={isPassVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          >
                            {isPassVisible ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                          {user.password && (
                            <button
                              onClick={() => copyToClipboard(user.password!, `pass_${user.username}`)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Sao chép mật khẩu"
                            >
                              {isCopiedPass ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => promptResetPassword(user)}
                            className="text-amber-600 hover:text-amber-800 cursor-pointer ml-0.5"
                            title="Cập nhật / đổi mật khẩu (giữ nguyên số ngày còn lại của hạn dùng)"
                          >
                            <KeyRound className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        {user.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            <Shield className="w-3 h-3 text-amber-700" />
                            Admin
                          </span>
                        ) : user.role === 'teacher' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                            <Briefcase className="w-3 h-3 text-emerald-700" />
                            Giáo viên
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-200">
                            <GraduationCap className="w-3 h-3 text-sky-700" />
                            Học sinh
                          </span>
                        )}
                      </td>

                      {/* Cột Thẻ Tiền Nộp (100.000đ / 200.000đ hoặc Sử dụng vô hạn) */}
                      <td className="py-3.5 px-3">
                        {sub.isUnlimited ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold">
                              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                              <span>Sử dụng vô hạn</span>
                            </span>
                            <div className="text-[10px] text-amber-700 font-medium">
                              {sub.isAdmin ? 'Quyền Admin (Vĩnh viễn)' : 'Tài khoản Vô hạn (Vĩnh viễn)'}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <select
                              value={
                                sub.isFreeTrialTier
                                  ? 'trial_free'
                                  : sub.isStudentMemberTier
                                  ? 'student_50k'
                                  : 'vip_200k'
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'trial_free') {
                                  handleInlineUpdateSubscription(user, {
                                    paymentAmount: 0,
                                  });
                                } else if (val === 'student_50k') {
                                  handleInlineUpdateSubscription(user, {
                                    paymentAmount: 100000,
                                    role: 'student',
                                  });
                                } else {
                                  handleInlineUpdateSubscription(user, {
                                    paymentAmount: 200000,
                                    role: user.role === 'student' ? 'teacher' : user.role,
                                  });
                                }
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                sub.isFreeTrialTier
                                  ? 'bg-purple-50 border-purple-300 text-purple-900'
                                  : sub.isStudentMemberTier
                                  ? 'bg-sky-50 border-sky-300 text-sky-900'
                                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                              }`}
                              title="Chọn mức tiền nộp để tự động tính ngày hết hạn"
                            >
                              {PAYMENT_TIERS.map((tier) => (
                                <option key={tier.id || tier.tierName} value={tier.id}>
                                  {tier.tierName} · {tier.label} ({tier.days} ngày)
                                </option>
                              ))}
                            </select>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-emerald-600" />
                              <span>
                                {sub.tierName}: <strong>{sub.validityDays} ngày</strong> ·{' '}
                                <span
                                  className={
                                    sub.isFreeTrialTier
                                      ? 'text-purple-700 font-semibold'
                                      : sub.isStudentMemberTier
                                      ? 'text-sky-700 font-semibold'
                                      : 'text-emerald-700 font-semibold'
                                  }
                                >
                                  {sub.isFreeTrialTier
                                    ? `Hạn 7 ngày · Chỉ giới hạn 3 lượt tải (Còn ${sub.freeTrialDownloadsRemaining}/3) · Giao bài QR không giới hạn`
                                    : sub.isStudentMemberTier
                                    ? 'Hạn 365 ngày · Không được giao bài cho thành viên khác'
                                    : 'Đầy đủ quyền VIP (365 ngày)'}
                                </span>
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Cột Ngày Bắt Đầu (Admin cập nhật theo thời gian thực) */}
                      <td className="py-3.5 px-3">
                        {sub.isUnlimited ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50/80 border border-amber-200 px-2.5 py-1 rounded-lg">
                            <Calendar className="w-3.5 h-3.5 text-amber-600" />
                            <span>Sử dụng vô hạn</span>
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <input
                                type="date"
                                value={sub.startDate}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleInlineUpdateSubscription(user, {
                                      startDate: e.target.value,
                                    });
                                  }
                                }}
                                className="px-2 py-1 bg-white border border-slate-300 hover:border-emerald-500 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                title="Admin cập nhật Ngày bắt đầu theo thời gian thực"
                              />
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-emerald-600" />
                              <span>Bắt đầu: <strong>{sub.startDateVN}</strong> · <span className="text-emerald-700 font-semibold">Chỉ Admin cập nhật</span></span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Cột Ngày Hết Hạn & Thông Báo Đếm Ngược (<= 45 ngày) */}
                      <td className="py-3.5 px-3">
                        {sub.isUnlimited ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-extrabold">
                            <Sparkles className="w-3 h-3 text-amber-700" />
                            <span>Sử dụng vô hạn</span>
                          </span>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-slate-500 text-[11px]">Hết hạn:</span>
                              <strong
                                className={`font-mono ${
                                  sub.isExpired
                                    ? 'text-rose-700'
                                    : sub.isCountdownWarning
                                    ? 'text-amber-800'
                                    : 'text-slate-900'
                                }`}
                              >
                                {sub.expiresAtVN}
                              </strong>
                            </div>

                            {sub.isExpired ? (
                              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-100 border border-rose-300 text-rose-800 text-[11px] font-bold">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>Đã hết hạn sử dụng</span>
                              </div>
                            ) : sub.isCountdownWarning ? (
                              <div className="p-1.5 rounded-lg bg-amber-100/90 border border-amber-400 text-amber-950 space-y-0.5 shadow-2xs">
                                <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-amber-900">
                                  <BellRing className="w-3 h-3 text-amber-700 animate-bounce shrink-0" />
                                  <span>Cảnh báo còn ≤ 45 ngày ({sub.remainingDays} ngày)</span>
                                </div>
                                <div className="font-mono text-[11px] font-bold text-rose-700">
                                  ⏳ {sub.countdownParts.days}d {String(sub.countdownParts.hours).padStart(2, '0')}h{' '}
                                  {String(sub.countdownParts.minutes).padStart(2, '0')}m{' '}
                                  {String(sub.countdownParts.seconds).padStart(2, '0')}s
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                                <Clock className="w-3 h-3 text-emerald-700" />
                                <span>Còn {sub.remainingDays} ngày</span>
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="space-y-1.5">
                          {user.isActive !== false ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              <Lock className="w-3 h-3 text-rose-600" />
                              Đang bị khóa
                            </span>
                          )}

                          {user.username.toLowerCase() !== 'admin' && (
                            <div className="flex flex-wrap items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleToggleLockUser(user)}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer border ${
                                  user.isActive !== false
                                    ? 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                                }`}
                                title={
                                  user.isActive !== false
                                    ? 'Bấm để khóa tài khoản này'
                                    : 'Bấm để mở lại tài khoản này'
                                }
                              >
                                {user.isActive !== false ? (
                                  <>
                                    <Lock className="w-3 h-3" />
                                    <span>Khóa TK</span>
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3 h-3" />
                                    <span>Mở lại TK</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => promptDeleteUser(user)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 transition-colors cursor-pointer"
                                title="Xóa vĩnh viễn tài khoản này khỏi hệ thống"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Xóa TK</span>
                              </button>
                            </div>
                          )}

                          {user.mustChangePassword && (
                            <div className="text-[10px] text-amber-600 flex items-center gap-0.5">
                              <KeyRound className="w-2.5 h-2.5" />
                              <span>Cần đổi MK</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {user.username.toLowerCase() !== 'admin' && (
                            <button
                              onClick={() => handleToggleLockUser(user)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                user.isActive !== false
                                  ? 'text-slate-500 hover:text-rose-700 hover:bg-rose-50'
                                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              }`}
                              title={
                                user.isActive !== false
                                  ? 'Khóa tài khoản người dùng'
                                  : 'Mở khóa lại tài khoản người dùng'
                              }
                            >
                              {user.isActive !== false ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => promptResetPassword(user)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Khôi phục mật khẩu mặc định (gv123 / hs123)"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa thông tin, thẻ tiền nộp & ngày bắt đầu"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {user.username.toLowerCase() !== 'admin' ? (
                            <button
                              onClick={() => promptDeleteUser(user)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              title="Xóa tài khoản khỏi hệ thống"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa</span>
                            </button>
                          ) : (
                            <span
                              className="p-1.5 text-slate-300 cursor-not-allowed"
                              title="Tài khoản Admin chính không thể xóa"
                            >
                              <Shield className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Hiển thị <strong>{filteredUsers.length}</strong> / <strong>{users.length}</strong> tài khoản
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 text-slate-600">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Trải nghiệm (free): 7 ngày (Chỉ giới hạn 3 lượt tải tài liệu · Giao bài QR không giới hạn) · Học sinh VIP: 100.000đ (365 ngày · Không giao bài) · Giáo viên VIP: 200.000đ (365 ngày)</span>
            </span>
              <span className="flex items-center gap-1 text-slate-600">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mặc định: <code>gv123</code> (GV) · <code>hs123</code> (HS) · <code>admin123</code> (Admin)</span>
              </span>
            </div>
          </div>
        </div>

      {/* Add / Edit User Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingUser ? 'Chỉnh Sửa Người Dùng & Hạn Dùng' : 'Thêm Người Dùng Mới (Giáo Viên / Học Sinh)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chỉ Admin mới có quyền cài đặt ngày bắt đầu và quản lý tài khoản
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              {/* Chọn nhanh Vai trò & Mật khẩu mặc định */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Chọn vai trò người dùng <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormRole('teacher');
                      if (isDefaultSystemPassword(formPassword) || !formPassword.trim()) {
                        setFormPassword('gv123');
                      }
                      if (!formClass.trim() || formClass === '12A1' || formClass === 'Ôn THPT') {
                        setFormClass('Tổ Công Nghệ Nông nghiệp');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      formRole === 'teacher'
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-400'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Giáo viên</span>
                    <span className={`text-[10px] font-mono ${formRole === 'teacher' ? 'text-emerald-100' : 'text-slate-500'}`}>
                      MK: gv123
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormRole('student');
                      if (isDefaultSystemPassword(formPassword) || !formPassword.trim()) {
                        setFormPassword('hs123');
                      }
                      if (!formClass.trim() || formClass === 'Tổ Công Nghệ Nông nghiệp') {
                        setFormClass('12A1');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      formRole === 'student'
                        ? 'bg-sky-600 text-white border-sky-700 shadow-xs font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-sky-400'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Học sinh</span>
                    <span className={`text-[10px] font-mono ${formRole === 'student' ? 'text-sky-100' : 'text-slate-500'}`}>
                      MK: hs123
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormRole('admin');
                      if (isDefaultSystemPassword(formPassword) || !formPassword.trim()) {
                        setFormPassword('admin123');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      formRole === 'admin'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-amber-400'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Quản trị viên</span>
                    <span className={`text-[10px] font-mono ${formRole === 'admin' ? 'text-amber-100' : 'text-slate-500'}`}>
                      MK: admin123
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Họ và Tên đầy đủ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formFullName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormFullName(val);
                    if (!editingUser && !isUsernameManuallyEdited) {
                      const suggested = removeVietnameseTones(val)
                        .replace(/[\u00A0\uFEFF\s]+/g, '')
                        .replace(/[^a-z0-9._@-]/g, '')
                        .toLowerCase();
                      setFormUsername(suggested);
                      if (suggested) {
                        setFormEmail(`${suggested}@truong.edu.vn`);
                      } else {
                        setFormEmail('');
                      }
                    }
                  }}
                  placeholder="Ví dụ: Trần Văn Hữu, Nguyễn Thị Mai..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tên đăng nhập <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => {
                      const val = e.target.value;
                      setIsUsernameManuallyEdited(Boolean(val.trim()));
                      setFormUsername(val);
                    }}
                    placeholder="ví dụ: tvhuu, nguyenvana"
                    required
                    disabled={editingUser?.username === 'admin'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white disabled:opacity-60 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormPassword(val);
                    }}
                    placeholder="Mặc định: gv123 hoặc hs123"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                  />
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    <span className="text-[10px] text-slate-500">Mặc định:</span>
                    <button
                      type="button"
                      onClick={() => setFormPassword('gv123')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                        formPassword === 'gv123'
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      gv123 (GV)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormPassword('hs123')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                        formPassword === 'hs123'
                          ? 'bg-sky-100 border-sky-400 text-sky-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      hs123 (HS)
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Vai trò trong hệ thống
                  </label>
                  <select
                    value={formRole}
                    onChange={(e: any) => {
                      const newRole = e.target.value as UserRole;
                      setFormRole(newRole);
                      if (isDefaultSystemPassword(formPassword) || !formPassword.trim()) {
                        setFormPassword(
                          newRole === 'student'
                            ? 'hs123'
                            : newRole === 'admin'
                            ? 'admin123'
                            : 'gv123'
                        );
                      }
                      if (newRole === 'student' && (!formClass.trim() || formClass === 'Tổ Công Nghệ Nông nghiệp')) {
                        setFormClass('12A1');
                      } else if (newRole === 'teacher' && (!formClass.trim() || formClass === '12A1' || formClass === 'Ôn THPT')) {
                        setFormClass('Tổ Công Nghệ Nông nghiệp');
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer"
                  >
                    <option value="teacher">Giáo viên (MK mặc định: gv123)</option>
                    <option value="student">Học sinh (MK mặc định: hs123)</option>
                    <option value="admin">Quản trị viên - Admin (MK mặc định: admin123)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lớp / Đơn vị
                  </label>
                  <input
                    type="text"
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    placeholder="12A1, Ôn THPT hoặc Tổ Công Nghệ..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Thẻ Tiền Nộp & Ngày Bắt Đầu / Ngày Hết Hạn */}
              {isUnlimitedAccount({ role: formRole, username: formUsername }) ? (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-950">
                  <Sparkles className="w-5 h-5 text-amber-700 shrink-0" />
                  <div>
                    <div className="font-bold">
                      {formRole === 'admin' || formUsername.trim().toLowerCase() === 'admin'
                        ? 'Tài khoản Quản trị viên (Admin)'
                        : `Tài khoản Sử dụng vô hạn (@${formUsername.trim().replace(/^@+/, '')})`}
                    </div>
                    <div className="text-[11px] text-amber-800">
                      Tài khoản này được cấp quyền <strong>Sử dụng vô hạn (Vĩnh viễn — Không giới hạn thời gian sử dụng)</strong>.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1.5 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-700" />
                      <span>Chọn Thẻ Tiền Nộp (Tự động tính Ngày Hết Hạn)</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {PAYMENT_TIERS.map((tier) => {
                        const isSelected =
                          tier.amount === 0
                            ? Number(formPaymentAmount) === 0
                            : tier.amount === 100000
                            ? Number(formPaymentAmount) === 100000 || Number(formPaymentAmount) === 50000
                            : Number(formPaymentAmount) === tier.amount;
                        return (
                          <button
                            key={tier.id || tier.tierName}
                            type="button"
                            onClick={() => {
                              setFormPaymentAmount(tier.amount);
                              if (tier.roleHint === 'student') {
                                setFormRole('student');
                                if (isDefaultSystemPassword(formPassword) || !formPassword.trim()) {
                                  setFormPassword('hs123');
                                }
                              } else if (tier.amount > 0 && formRole === 'student') {
                                setFormRole('teacher');
                                if (isDefaultSystemPassword(formPassword) || !formPassword.trim()) {
                                  setFormPassword('gv123');
                                }
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm font-bold'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
                            }`}
                          >
                            <div className="text-[11px] font-bold">{tier.tierName}</div>
                            <div className="text-xs font-extrabold mt-0.5">{tier.label}</div>
                            <div
                              className={`text-[10px] mt-0.5 ${
                                isSelected ? 'text-emerald-100' : 'text-slate-500'
                              }`}
                            >
                              Hạn {tier.days} ngày
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {(() => {
                    const previewSub = getAccountSubscriptionStatus({
                      role: formRole,
                      username: formUsername,
                      startDate: formStartDate,
                      paymentAmount: formPaymentAmount,
                      nowMs,
                    });
                    return (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Ngày bắt đầu (Chỉ Admin cập nhật)
                          </label>
                          <input
                            type="date"
                            value={formStartDate}
                            onChange={(e) => setFormStartDate(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Ngày hết hạn (+{previewSub.validityDays} ngày)
                          </label>
                          <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-emerald-900 flex items-center justify-between">
                            <span>{previewSub.expiresAtVN}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                previewSub.isExpired
                                  ? 'bg-rose-200 text-rose-900'
                                  : previewSub.isCountdownWarning
                                  ? 'bg-amber-200 text-amber-900'
                                  : 'bg-emerald-200 text-emerald-900'
                              }`}
                            >
                              {previewSub.isExpired
                                ? 'Hết hạn'
                                : `Còn ${previewSub.remainingDays} ngày`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email liên hệ
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="email@truong.edu.vn"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Lưu ngay vào hệ thống — Đăng nhập được ngay không cần xuất bản</span>
                </span>
                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-700">Kích hoạt tài khoản</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  {editingUser && editingUser.username.toLowerCase() !== 'admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = editingUser;
                        setIsAddEditModalOpen(false);
                        promptDeleteUser(target);
                      }}
                      disabled={isSaving}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa Tài Khoản</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddEditModalOpen(false)}
                    disabled={isSaving}
                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs cursor-pointer disabled:opacity-50"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>
                      {isSaving
                        ? 'Đang lưu...'
                        : editingUser
                        ? 'Lưu Thay Đổi'
                        : 'Thêm Người Dùng'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User In-App Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 border-b border-rose-100 pb-3">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-rose-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác Nhận Xóa Tài Khoản</h3>
                <p className="text-xs text-rose-600 font-medium">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200 text-xs text-slate-700 space-y-2">
              <p>Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản sau khỏi hệ thống?</p>
              <div className="bg-white p-3 rounded-lg border border-rose-200 space-y-1 font-mono text-[11px]">
                <div className="text-slate-900 font-bold font-sans text-xs">{userToDelete.fullName}</div>
                <div className="text-slate-600">Tài khoản: <strong className="text-rose-700">@{userToDelete.username}</strong></div>
                <div className="text-slate-600">Vai trò: {userToDelete.role === 'admin' ? 'Quản trị viên' : userToDelete.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}</div>
                <div className="text-slate-600">Đơn vị: {userToDelete.className || 'Tổ Công Nghệ'}</div>
              </div>
              <p className="text-[11px] text-rose-700">
                Tài khoản sẽ được xóa khỏi tệp hệ thống <code>datauser.json</code> và không thể đăng nhập lại.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs cursor-pointer disabled:opacity-50"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeleting ? 'Đang xóa...' : 'Xác Nhận Xóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Users In-App Confirmation Modal */}
      {isBulkDeleteModalOpen && selectedUsernames.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 border-b border-rose-100 pb-3">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6 text-rose-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Xác Nhận Xóa {selectedUsernames.length} Tài Khoản Đã Chọn
                </h3>
                <p className="text-xs text-rose-600 font-medium">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200 text-xs text-slate-700 space-y-2">
              <p>
                Bạn có chắc chắn muốn xóa vĩnh viễn <strong>{selectedUsernames.length}</strong> tài khoản đang chọn khỏi hệ thống?
              </p>
              <div className="bg-white p-2.5 rounded-lg border border-rose-200 max-h-40 overflow-y-auto space-y-1 font-mono text-[11px]">
                {selectedUsernames.map((uname) => {
                  const found = users.find((u) => u.username.toLowerCase() === uname.toLowerCase());
                  return (
                    <div key={uname} className="flex items-center justify-between py-0.5 border-b border-slate-100 last:border-0">
                      <span className="font-sans font-bold text-slate-800">{found?.fullName || uname}</span>
                      <span className="text-rose-700 font-semibold">@{uname}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-rose-700">
                Các tài khoản này sẽ bị xóa ngay lập tức khỏi hệ thống mà không cần xuất bản.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                disabled={isBulkDeleting}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs cursor-pointer disabled:opacity-50"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={confirmBulkDeleteUsers}
                disabled={isBulkDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isBulkDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isBulkDeleting ? 'Đang xóa...' : `Xóa ${selectedUsernames.length} Tài Khoản`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update / Reset Password In-App Confirmation Modal */}
      {userToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600 border-b border-amber-100 pb-3">
              <div className="p-2.5 bg-amber-100 rounded-xl">
                <KeyRound className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cập Nhật / Khôi Phục Mật Khẩu</h3>
                <p className="text-xs text-amber-600 font-medium">
                  Cập nhật mật khẩu người dùng — Số ngày còn lại của hạn dùng không đổi
                </p>
              </div>
            </div>

            <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 text-xs text-slate-700 space-y-3">
              <p>
                Cập nhật mật khẩu cho tài khoản <strong>{userToReset.fullName}</strong> (@{userToReset.username} ·{' '}
                {userToReset.role === 'student'
                  ? 'Học sinh'
                  : userToReset.role === 'admin'
                  ? 'Quản trị viên'
                  : 'Giáo viên'}
                ):
              </p>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  Mật khẩu mới (nhập mật khẩu tùy chỉnh hoặc chọn mặc định):
                </label>
                <input
                  type="text"
                  value={resetPasswordInput}
                  onChange={(e) => setResetPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full px-3 py-2 bg-white rounded-lg border border-amber-300 text-center font-mono font-bold text-sm text-emerald-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500">Chọn nhanh mặc định:</span>
                  <button
                    type="button"
                    onClick={() => setResetPasswordInput('gv123')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                      resetPasswordInput === 'gv123'
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    gv123 (GV)
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetPasswordInput('hs123')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                      resetPasswordInput === 'hs123'
                        ? 'bg-sky-100 border-sky-400 text-sky-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    hs123 (HS)
                  </button>
                  {(userToReset.role === 'admin' || userToReset.username.toLowerCase() === 'admin') && (
                    <button
                      type="button"
                      onClick={() => setResetPasswordInput('admin123')}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                        resetPasswordInput === 'admin123'
                          ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      admin123 (Admin)
                    </button>
                  )}
                </div>
              </div>

              {(() => {
                const resetSub = getAccountSubscriptionStatus({
                  role: userToReset.role,
                  username: userToReset.username,
                  startDate: userToReset.startDate || userToReset.createdAt,
                  paymentAmount: userToReset.paymentAmount,
                  nowMs,
                });
                return (
                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-[11px] text-emerald-950 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Số ngày còn lại của hạn dùng không đổi:</span>
                    </div>
                    {resetSub.isUnlimited ? (
                      <div>
                        Hạn dùng: <strong>Sử dụng vô hạn (Vĩnh viễn)</strong>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
                        <span>Bắt đầu: <strong>{resetSub.startDateVN}</strong></span>
                        <span>Hết hạn: <strong>{resetSub.expiresAtVN}</strong></span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-bold">
                          {resetSub.isExpired ? 'Đã hết hạn' : `Còn ${resetSub.remainingDays} ngày`}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}
              <p className="text-[11px] text-slate-500">
                Khi Admin cập nhật mật khẩu, <strong>số ngày còn lại của hạn dùng hoàn toàn không đổi</strong>. Ngày bắt đầu chỉ Admin mới được cập nhật.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setUserToReset(null)}
                disabled={isResetting}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs cursor-pointer disabled:opacity-50"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={confirmResetPassword}
                disabled={isResetting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isResetting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                <span>{isResetting ? 'Đang cập nhật...' : 'Lưu Mật Khẩu Mới'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const UserManagementView = SheetUserManagementView;
