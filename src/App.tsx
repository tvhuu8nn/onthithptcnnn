import React, { useState, useEffect } from 'react';
import { Exam, UserExamAnswers, ExamResultSummary } from './types/exam';
import { MOCK_EXAMS } from './data/mockExams';
import { GRADE_10_PRACTICE_EXAMS, GRADE_10_CHAPTER_EXAMS } from './data/grade10PracticeExams';
import { GRADE_11_PRACTICE_EXAMS, GRADE_11_CHAPTER_EXAMS } from './data/grade11PracticeExams';
import { ALL_GRADE_12_CHAPTER_EXAMS } from './data/grade12ChapterExams';
import { generateRandomExam } from './data/questionBank';
import { evaluateExam } from './utils/scoring';
import {
  createUniqueShuffleSeed,
  parseStudentUrlParams,
  findBuiltinExam,
  prepareExamForStudent,
  getSavedStudentQrAssignments,
  saveStudentQrAssignment,
  removeStudentQrAssignment,
  SavedStudentQrAssignment,
} from './utils/qrExamShare';
import { Navbar } from './components/Navbar';
import { ExamCard } from './components/ExamCard';
import { ExamRunner } from './components/ExamRunner';
import { ExamResultView } from './components/ExamResultView';
import { ChapterReviewView } from './components/ChapterReviewView';
import { MatrixGuideModal } from './components/MatrixGuideModal';
import { PrintExamModal } from './components/PrintExamModal';
import { AssignExamQRModal } from './components/AssignExamQRModal';
import { StudentEntryModal } from './components/StudentEntryModal';
import { StudentProfileCard, StudentProfile } from './components/StudentProfileCard';
import { RealtimeVisitorStatsCard } from './components/RealtimeVisitorStatsCard';
import { MistakeAnalyticsView } from './components/MistakeAnalyticsView';
import { AdminScoreDashboard } from './components/AdminScoreDashboard';
import { SheetUserManagementView } from './components/SheetUserManagementView';
import { LoginModal } from './components/LoginModal';
import { ProvincialAndOfficialExamsView } from './components/ProvincialAndOfficialExamsView';
import {
  BUILTIN_PROVINCIAL_AND_OFFICIAL_EXAMS,
  ExternalExamItem,
} from './data/provincialAndOfficialExams';
import { recordStudentQuestionMistake, syncMistakesFromServer } from './data/mistakesAnalytics';
import { sendStudentScoreToAdmin } from './services/submissionService';
import { authService, getAccountSubscriptionStatus, normalizePaymentAmount } from './services/authService';
import {
  subscribeRealtimeEvent,
  notifyLocalDomainChange,
} from './services/realtimeSyncService';
import { AuthUser } from './types/auth';
import {
  Sparkles,
  Layers,
  PlusCircle,
  FileSpreadsheet,
  Flame,
  X,
  Download,
  QrCode,
  Users,
  LogIn,
  KeyRound,
  Lock,
  BookOpen,
  Activity,
  BellRing,
  Clock,
  CreditCard,
  Calendar,
  Award,
  Building2,
  UploadCloud,
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    'exams' | 'provincial_exams' | 'official_exams' | 'mistakes' | 'admin' | 'users' | 'chapter_review' | 'matrix'
  >('exams');
  const [examList, setExamList] = useState<Exam[]>(MOCK_EXAMS);
  const canUserAccessUploadedExam = (exam: ExternalExamItem, user: AuthUser | null): boolean => {
    if (!exam) return false;
    if (exam.category === 'official_past_year' || exam.isUserUploaded === false) return true;
    const normalizeUserKey = (u?: string) =>
      String(u || '')
        .trim()
        .replace(/^@+/, '')
        .toLowerCase();
    const ownerKey = normalizeUserKey(exam.uploadedBy);
    if (ownerKey === 'admin') return true;
    if (!user) return false;
    const currentKey = normalizeUserKey(user.username);
    const isUserAdmin = user.role === 'admin' || currentKey === 'admin';
    if (isUserAdmin) return true;
    return Boolean(ownerKey && ownerKey !== 'guest' && ownerKey === currentKey);
  };

  const [uploadedExams, setUploadedExams] = useState<ExternalExamItem[]>(() => {
    try {
      const saved = localStorage.getItem('agritech_user_uploaded_exams');
      const activeUser = authService.getCurrentUser();
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((ex) => canUserAccessUploadedExam(ex, activeUser));
        }
      }
    } catch {}
    return [];
  });
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserExamAnswers | null>(null);
  const [examResult, setExamResult] = useState<ExamResultSummary | null>(null);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printExamTarget, setPrintExamTarget] = useState<Exam>(MOCK_EXAMS[0]);
  const [examCodeFilter, setExamCodeFilter] = useState<string>('all');
  const [codeRange, setCodeRange] = useState<'all' | '101-110' | '111-120' | '121-124'>('all');
  const [randomExamAlert, setRandomExamAlert] = useState<string | null>(null);
  const [referenceUploadTrigger, setReferenceUploadTrigger] = useState<number>(0);

  // Authentication & Guest Mode state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPromptReason, setLoginPromptReason] = useState<string | null>(null);
  const [isSponsorQrModalOpen, setIsSponsorQrModalOpen] = useState(false);
  const [isDownloadRestrictedModalOpen, setIsDownloadRestrictedModalOpen] = useState(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  // Đồng bộ thời gian thực hạn dùng tài khoản (Tiền nộp, Ngày bắt đầu, Ngày hết hạn) từ Admin
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    const syncCurrentUserSubscription = async () => {
      const active = authService.getCurrentUser();
      if (!active) return;
      try {
        const res = await fetch(`/api/auth/users?_t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.users)) {
            const matched = data.users.find(
              (u: any) =>
                String(u.username || '').trim().toLowerCase() ===
                String(active.username || '').trim().toLowerCase()
            );
            if (matched) {
              const latestActive = authService.getCurrentUser();
              if (
                !latestActive ||
                String(latestActive.username || '').trim().toLowerCase() !==
                  String(active.username || '').trim().toLowerCase()
              ) {
                return;
              }
              if (matched.is_active === false && String(active.username).toLowerCase() !== 'admin') {
                authService.logout();
                setCurrentUser(null);
                setLoginPromptReason(
                  'Tài khoản của bạn hiện đang bị tạm khóa bởi Quản trị viên! Vui lòng liên hệ Admin để được mở lại tài khoản.'
                );
                setIsLoginModalOpen(true);
                return;
              }
              const rawPayCandidate = matched.payment_amount ?? latestActive.paymentAmount;
              const rawPay =
                rawPayCandidate !== undefined && rawPayCandidate !== null ? Number(rawPayCandidate) : 200000;
              const updatedUser: AuthUser = {
                ...latestActive,
                fullName: matched.fullName || latestActive.fullName,
                className: matched.className || latestActive.className,
                paymentAmount: normalizePaymentAmount(rawPay),
                startDate: matched.start_date || latestActive.startDate,
                expiresAt: matched.expires_at || latestActive.expiresAt,
              };
              authService.saveSession(updatedUser, latestActive.token);
              setCurrentUser(updatedUser);
            }
          }
        }
      } catch {}
    };

    syncCurrentUserSubscription();
    syncMistakesFromServer();

    const fetchLatestCustomExams = () => {
      fetch(`/api/custom-exams?_t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((payload) => {
          if (payload?.success && Array.isArray(payload.data) && payload.data.length > 0) {
            const custom: Exam[] = payload.data;
            setExamList([...MOCK_EXAMS, ...custom.filter((c) => !MOCK_EXAMS.some((m) => m.code === c.code))]);
          }
        })
        .catch(() => {});
    };

    // Đồng bộ đề ngẫu nhiên vừa tạo trên các thiết bị khác (Android, iOS, Windows, macOS)
    fetchLatestCustomExams();

    const persistUploadedExamsLocally = (list: ExternalExamItem[]) => {
      try {
        // Dọn các khóa exam_data_* cũ chứa chuỗi base64 nặng để tránh đầy 5MB localStorage
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && k.startsWith('exam_data_')) {
            const val = localStorage.getItem(k);
            if (val && val.length > 80000) {
              localStorage.removeItem(k);
            }
          }
        }
        const lightweightList = list.map(({ attachedFileDataUrl, ...rest }) => ({
          ...rest,
          hasAttachedOriginalFile: Boolean(rest.hasAttachedOriginalFile || attachedFileDataUrl),
        }));
        try {
          localStorage.setItem('agritech_user_uploaded_exams', JSON.stringify(lightweightList));
        } catch {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && k.startsWith('exam_data_')) localStorage.removeItem(k);
          }
          localStorage.setItem('agritech_user_uploaded_exams', JSON.stringify(lightweightList));
        }
        lightweightList.forEach((ex) => {
          if (ex && ex.id) {
            try {
              localStorage.setItem(`exam_data_${ex.id}`, JSON.stringify(ex));
            } catch {}
          }
        });
      } catch {}
    };

    const fetchAuthorizedUploadedExams = () => {
      fetch(`/api/uploaded-exams?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: authService.getAuthHeaders(),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((payload) => {
          if (payload?.success && Array.isArray(payload.data)) {
            const activeUser = authService.getCurrentUser();
            const authorizedList: ExternalExamItem[] = payload.data.filter((ex: ExternalExamItem) =>
              canUserAccessUploadedExam(ex, activeUser)
            );
            setUploadedExams(authorizedList);
            persistUploadedExamsLocally(authorizedList);
          }
        })
        .catch(() => {});
    };

    // Đồng bộ danh sách tài liệu được phép xem/sử dụng theo đúng quyền tài khoản hiện tại
    fetchAuthorizedUploadedExams();

    const unsubCustomExams = subscribeRealtimeEvent('custom_exams_updated', (payload) => {
      if (Array.isArray(payload) && payload.length > 0) {
        setExamList([...MOCK_EXAMS, ...payload.filter((c: Exam) => !MOCK_EXAMS.some((m) => m.code === c.code))]);
      } else {
        fetchLatestCustomExams();
      }
    });

    const unsubUploadedExams = subscribeRealtimeEvent('uploaded_exams_updated', () => {
      // Máy chủ chỉ phát tín hiệu cập nhật; client tự tải lại danh sách đã lọc đúng quyền trên máy chủ
      fetchAuthorizedUploadedExams();
    });

    const unsubMistakes = subscribeRealtimeEvent('mistakes_updated', () => {
      syncMistakesFromServer();
    });

    const unsubDatauser = subscribeRealtimeEvent('datauser_updated', (payload) => {
      try {
        const active = authService.getCurrentUser();
        if (
          active &&
          payload?.user &&
          String(payload.user.username || '').trim().toLowerCase() ===
            String(active.username || '').trim().toLowerCase()
        ) {
          if (payload.user.is_active === false && String(active.username).toLowerCase() !== 'admin') {
            authService.logout();
            setCurrentUser(null);
            setLoginPromptReason(
              'Tài khoản của bạn vừa bị Quản trị viên tạm khóa! Vui lòng liên hệ Admin để được mở lại tài khoản.'
            );
            setIsLoginModalOpen(true);
            return;
          }
          const rawPayCandidate = payload.user.payment_amount ?? payload.user.paymentAmount;
          const rawPay =
            rawPayCandidate !== undefined && rawPayCandidate !== null ? Number(rawPayCandidate) : 200000;
          const updatedUser: AuthUser = {
            ...active,
            fullName: payload.user.fullName || active.fullName,
            className: payload.user.className || active.className,
            paymentAmount: normalizePaymentAmount(rawPay),
            startDate: payload.user.start_date || payload.user.startDate,
            expiresAt: payload.user.expires_at || payload.user.expiresAt,
          };
          authService.saveSession(updatedUser, active.token);
          setCurrentUser(updatedUser);
        } else {
          syncCurrentUserSubscription();
        }
      } catch {
        syncCurrentUserSubscription();
      }
    });

    const unsubSyncAll = subscribeRealtimeEvent('sync_all_updated', () => {
      syncCurrentUserSubscription();
      fetchAuthorizedUploadedExams();
      fetchLatestCustomExams();
      syncMistakesFromServer();
    });

    return () => {
      clearInterval(timer);
      unsubCustomExams();
      unsubUploadedExams();
      unsubMistakes();
      unsubDatauser();
      unsubSyncAll();
    };
  }, [currentUser?.username]);

  const handleOpenLoginWithReason = (reason?: string) => {
    setLoginPromptReason(reason || null);
    setIsLoginModalOpen(true);
  };

  // Persistent student profile state (Name, Class, SBD)
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem('agritech_student_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load student profile', e);
    }
    return {
      name: '',
      studentClass: '',
      studentId: '',
    };
  });

  const handleUpdateStudentProfile = (updated: StudentProfile) => {
    setStudentProfile(updated);
    try {
      localStorage.setItem('agritech_student_profile', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save student profile', e);
    }
  };

  const handleLoginSuccess = (user: AuthUser, _isFirstLogin?: boolean) => {
    setCurrentUser(user);
    setUploadedExams((prev) => prev.filter((ex) => canUserAccessUploadedExam(ex, user)));
    setIsLoginModalOpen(false);
    setLoginPromptReason(null);
    if (user.role !== 'admin' && currentTab === 'users') {
      setCurrentTab('exams');
    }
    if (user.fullName) {
      handleUpdateStudentProfile({
        name: user.fullName,
        studentClass: user.className || studentProfile.studentClass || '12A1',
        studentId: user.studentId || studentProfile.studentId || user.username,
      });
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    // Xóa ngay bộ nhớ đệm tài liệu riêng tư của tài khoản vừa đăng xuất
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith('exam_data_user-exam-')) {
          localStorage.removeItem(k);
        }
      }
    } catch {}
    setUploadedExams((prev) => {
      const publicOnly = prev.filter((ex) => canUserAccessUploadedExam(ex, null));
      saveUploadedListToStorage(publicOnly);
      return publicOnly;
    });
    if (currentTab === 'users') {
      setCurrentTab('exams');
    }
  };

  const saveUploadedListToStorage = (list: ExternalExamItem[]) => {
    try {
      const lightweight = list.map(({ attachedFileDataUrl, ...rest }) => ({
        ...rest,
        hasAttachedOriginalFile: Boolean(rest.hasAttachedOriginalFile || attachedFileDataUrl),
      }));
      try {
        localStorage.setItem('agritech_user_uploaded_exams', JSON.stringify(lightweight));
      } catch {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && k.startsWith('exam_data_')) localStorage.removeItem(k);
        }
        localStorage.setItem('agritech_user_uploaded_exams', JSON.stringify(lightweight));
      }
      lightweight.forEach((ex) => {
        if (ex && ex.id) {
          try {
            localStorage.setItem(`exam_data_${ex.id}`, JSON.stringify(ex));
          } catch {}
        }
      });
    } catch {}
  };

  const handleUploadExamSuccess = async (newExam: ExternalExamItem) => {
    const isUserAdmin =
      currentUser?.role === 'admin' || currentUser?.username?.toLowerCase() === 'admin';
    const isUserTeacher = Boolean(
      currentUser && (currentUser.role === 'teacher' || isUserAdmin)
    );
    if (!isUserTeacher) {
      throw new Error(
        'Chỉ người dùng là Giáo viên mới được đăng tài liệu lên hệ thống!'
      );
    }
    if (newExam.category === 'official_past_year' && !isUserAdmin) {
      throw new Error(
        'Chỉ Quản trị viên (Admin) mới có quyền đăng Đề Chính Thức! Giáo viên được quyền đăng đề tại thẻ Đề Tham Khảo và Đề Thi Thử Tỉnh.'
      );
    }

    const headers = authService.getAuthHeaders({ 'Content-Type': 'application/json' });
    let savedExam: ExternalExamItem = newExam;

    try {
      const res = await fetch('/api/uploaded-exams', {
        method: 'POST',
        headers,
        body: JSON.stringify({ exam: newExam }),
      });

      if (res.status === 401 || res.status === 403 || res.status === 400) {
        const errPayload = await res.json().catch(() => null);
        throw new Error(
          errPayload?.message ||
            errPayload?.error ||
            'Không thể lưu tài liệu lên máy chủ (vui lòng kiểm tra quyền đăng nhập).'
        );
      }

      if (res.ok) {
        const payload = await res.json().catch(() => null);
        if (payload?.exam) {
          savedExam = {
            ...payload.exam,
            attachedFileDataUrl: newExam.attachedFileDataUrl,
            hasAttachedOriginalFile: Boolean(
              payload.exam.hasAttachedOriginalFile || newExam.attachedFileDataUrl
            ),
          };
        }
      } else if (newExam.attachedFileDataUrl) {
        // Dự phòng nếu proxy giới hạn dung lượng tệp đính kèm quá lớn: gửi bản đề đã tách câu hỏi nguyên bản không kèm chuỗi base64 tệp gốc
        const { attachedFileDataUrl: _omittedBlob, ...examWithoutHeavyBlob } = newExam;
        const retryRes = await fetch('/api/uploaded-exams', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            exam: { ...examWithoutHeavyBlob, hasAttachedOriginalFile: false },
          }),
        });
        if (retryRes.ok) {
          const retryPayload = await retryRes.json().catch(() => null);
          if (retryPayload?.exam) {
            savedExam = {
              ...retryPayload.exam,
              attachedFileDataUrl: newExam.attachedFileDataUrl,
            };
          }
        }
      }
    } catch (err: any) {
      if (err instanceof Error && err.message && !/fetch|network/i.test(err.message)) {
        throw err;
      }
    }

    setUploadedExams((prev) => {
      const nextList = [
        savedExam,
        ...prev.filter((e) => e.id !== savedExam.id),
      ];
      saveUploadedListToStorage(nextList);
      return nextList;
    });
    notifyLocalDomainChange('uploaded_exams_updated', { changedAt: Date.now() });
  };

  const handleDeleteUploadedExam = async (examId: string) => {
    if (!currentUser) {
      throw new Error('Vui lòng đăng nhập để thực hiện thao tác xóa tài liệu!');
    }

    const targetExam = uploadedExams.find((e) => e.id === examId || e.code === examId);
    const normalizeUserKey = (u?: string) =>
      String(u || '')
        .trim()
        .replace(/^@+/, '')
        .toLowerCase();
    const isUserAdmin =
      currentUser.role === 'admin' || normalizeUserKey(currentUser.username) === 'admin';
    const currentUserKey = normalizeUserKey(currentUser.username);
    const ownerKey = normalizeUserKey(targetExam?.uploadedBy);
    const isOwner = Boolean(
      currentUserKey && ownerKey && ownerKey !== 'guest' && ownerKey === currentUserKey
    );

    if (targetExam?.category === 'official_past_year' && !isUserAdmin) {
      throw new Error('Chỉ Quản trị viên (Admin) mới có quyền xóa Đề Chính Thức!');
    }
    if (targetExam && !isUserAdmin && !isOwner) {
      throw new Error(
        'Bạn không có quyền xóa tài liệu này! Chỉ Quản trị viên (Admin) và người dùng đã đăng tài liệu mới được xóa.'
      );
    }

    const res = await fetch(`/api/uploaded-exams/${encodeURIComponent(examId)}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    });

    if (!res.ok && res.status !== 404) {
      const errPayload = await res.json().catch(() => null);
      throw new Error(
        errPayload?.message ||
          errPayload?.error ||
          'Bạn không có quyền xóa tài liệu này! Chỉ Quản trị viên (Admin) và người đăng tài liệu mới được xóa.'
      );
    }

    const payload = res.ok ? await res.json().catch(() => null) : null;
    if (payload?.success && Array.isArray(payload.data)) {
      setUploadedExams(payload.data);
      saveUploadedListToStorage(payload.data);
      notifyLocalDomainChange('uploaded_exams_updated', { changedAt: Date.now() });
      return;
    }

    setUploadedExams((prev) => {
      const hasExactId = prev.some((e) => e.id === examId);
      const nextList = prev.filter((e) => (hasExactId ? e.id !== examId : e.code !== examId));
      saveUploadedListToStorage(nextList);
      return nextList;
    });
    notifyLocalDomainChange('uploaded_exams_updated', { changedAt: Date.now() });
  };

  // Online Exam QR Assignment state
  const [assignQrExam, setAssignQrExam] = useState<Exam | null>(null);
  const [studentEntryConfig, setStudentEntryConfig] = useState<{
    exam: Exam;
    className?: string;
    durationMinutes: number;
    teacherNote?: string;
  } | null>(null);
  const [currentStudentInfo, setCurrentStudentInfo] = useState<{
    name: string;
    studentClass: string;
    studentId?: string;
  } | undefined>(undefined);
  const [customExamDuration, setCustomExamDuration] = useState<number | undefined>(undefined);
  const [activeTeacherNote, setActiveTeacherNote] = useState<string | undefined>(undefined);
  const [activeAssignedTeacher, setActiveAssignedTeacher] = useState<
    { username?: string; fullName?: string } | undefined
  >(undefined);
  const [closedQrSessionNotice, setClosedQrSessionNotice] = useState<{
    examTitle?: string;
    examCode?: string;
    teacherName?: string;
    closedAt?: string;
    reason?: string;
  } | null>(null);
  const [savedQrAssignments, setSavedQrAssignments] = useState<SavedStudentQrAssignment[]>(() =>
    getSavedStudentQrAssignments()
  );
  const [activeExamShuffleMeta, setActiveExamShuffleMeta] = useState<{
    rawExam: Exam;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
  } | null>(null);

  // Check URL query/hash/path parameters OR active server assignment for student arriving via QR code on Smartphone / PC
  useEffect(() => {
    const studentParams = parseStudentUrlParams();
    if (studentParams && studentParams.isStudentMode) {
      if (studentParams.teacherUsername || studentParams.teacherName) {
        setActiveAssignedTeacher({
          username: studentParams.teacherUsername,
          fullName: studentParams.teacherName,
        });
      }

      const matchedExam: Exam | undefined =
        findBuiltinExam(studentParams.examId) ||
        findBuiltinExam(studentParams.code) ||
        findBuiltinExam(studentParams.customCode);

      const visitShuffleSeed = createUniqueShuffleSeed(
        studentParams.examId || studentParams.code || studentParams.customCode || 'qr'
      );

      if (matchedExam) {
        const initialShouldShuffle = studentParams.shuffleQuestions !== false;
        const initialShuffleOptions = studentParams.shuffleOptions !== false;
        const initialExam = prepareExamForStudent(
          matchedExam,
          initialShouldShuffle,
          visitShuffleSeed,
          initialShuffleOptions
        );
        const initialDuration =
          studentParams.durationMinutes || initialExam.durationMinutes || 50;

        // Lưu vĩnh viễn đề gốc đã giao qua mã QR (để các lượt thi lại sau này tự xáo trộn mới hoàn toàn)
        setSavedQrAssignments(
          saveStudentQrAssignment(matchedExam, {
            examId: matchedExam.id,
            examCode: matchedExam.code,
            className: studentParams.className,
            durationMinutes: initialDuration,
            shuffleQuestions: initialShouldShuffle,
            shuffleOptions: initialShuffleOptions,
            showSolutionsAfterSubmit: studentParams.showSolutionsAfterSubmit !== false,
            teacherNote: studentParams.teacherNote,
            teacherUsername: studentParams.teacherUsername,
            teacherName: studentParams.teacherName,
          })
        );

        setActiveExamShuffleMeta({
          rawExam: matchedExam,
          shuffleQuestions: initialShouldShuffle,
          shuffleOptions: initialShuffleOptions,
        });
        // Mở thẳng đúng đề đã giao vào ExamRunner (đồng bộ 100% nội dung đề với mã QR)
        setActiveExam(initialExam);
        setCustomExamDuration(initialDuration);
        setActiveTeacherNote(studentParams.teacherNote);
        setStudentEntryConfig(null);
        setCurrentStudentInfo((prev) => ({
          name: prev?.name || studentProfile.name || '',
          studentClass:
            studentParams.className ||
            prev?.studentClass ||
            studentProfile.studentClass ||
            '12A1',
          studentId: prev?.studentId || studentProfile.studentId || '',
        }));
      }

      // Đồng bộ thêm thông tin cấu hình phòng thi (hoặc đề tùy chỉnh/ngẫu nhiên từ thiết bị khác) trên server
      const lookupKey =
        studentParams.examId || studentParams.customCode || studentParams.code || 'active';
      const teacherParam = studentParams.teacherUsername
        ? `?teacher=${encodeURIComponent(studentParams.teacherUsername)}`
        : '';
      fetch(`/api/assignments/${encodeURIComponent(lookupKey)}${teacherParam}`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((payload) => {
          if (payload?.sessionClosed || payload?.data?.isClosed) {
            const cInfo = payload.closedInfo || payload.data || {};
            setActiveExam(null);
            setStudentEntryConfig(null);
            setClosedQrSessionNotice({
              examTitle: payload?.data?.exam?.title || matchedExam?.title,
              examCode: cInfo.examCode || payload?.data?.exam?.code || studentParams.code,
              teacherName:
                cInfo.closedByName ||
                payload?.data?.config?.teacherName ||
                studentParams.teacherName ||
                cInfo.closedBy ||
                studentParams.teacherUsername,
              closedAt: cInfo.closedAt || undefined,
              reason:
                cInfo.reason ||
                'Giáo viên đã kết thúc bài thi sớm, khóa link QR và chốt danh sách Bảng Điểm cuối cùng.',
            });
            return;
          }
          if (payload?.success && payload?.data?.exam) {
            const rawServerExam: Exam = payload.data.exam;
            const serverCfg = payload.data.config || {};
            const isMatchingRequestedExam =
              lookupKey === 'active' ||
              (!studentParams.examId && !studentParams.code) ||
              (studentParams.examId &&
                String(rawServerExam.id).toLowerCase() ===
                  String(studentParams.examId).toLowerCase()) ||
              (studentParams.code &&
                String(rawServerExam.code).toLowerCase() ===
                  String(studentParams.code).toLowerCase());

            if (isMatchingRequestedExam) {
              const shouldShuffle =
                studentParams.shuffleQuestions !== undefined
                  ? studentParams.shuffleQuestions
                  : serverCfg.shuffleQuestions !== false;
              const shouldShuffleOptions =
                studentParams.shuffleOptions !== undefined
                  ? studentParams.shuffleOptions
                  : serverCfg.shuffleOptions !== false;
              const serverExam: Exam = prepareExamForStudent(
                rawServerExam,
                shouldShuffle,
                visitShuffleSeed,
                shouldShuffleOptions
              );
              const finalDuration =
                studentParams.durationMinutes ||
                Number(serverCfg.durationMinutes) ||
                serverExam.durationMinutes ||
                50;
              const finalNote =
                studentParams.teacherNote || serverCfg.teacherNote || undefined;
              const finalTeacherUser =
                studentParams.teacherUsername || serverCfg.teacherUsername || undefined;
              const finalTeacherName =
                studentParams.teacherName || serverCfg.teacherName || undefined;
              const finalClass =
                studentParams.className ||
                serverCfg.className ||
                studentProfile.studentClass ||
                '12A1';

              // Lưu vĩnh viễn đề gốc từ server vào thiết bị học sinh để làm bài không giới hạn bất cứ thời gian nào
              setSavedQrAssignments(
                saveStudentQrAssignment(rawServerExam, {
                  examId: rawServerExam.id,
                  examCode: rawServerExam.code,
                  className: finalClass,
                  durationMinutes: finalDuration,
                  shuffleQuestions: shouldShuffle,
                  shuffleOptions: shouldShuffleOptions,
                  showSolutionsAfterSubmit: true,
                  teacherNote: finalNote,
                  teacherUsername: finalTeacherUser,
                  teacherName: finalTeacherName,
                })
              );

              setActiveExamShuffleMeta({
                rawExam: rawServerExam,
                shuffleQuestions: shouldShuffle,
                shuffleOptions: shouldShuffleOptions,
              });
              setActiveExam(serverExam);
              setCustomExamDuration(finalDuration);
              setActiveTeacherNote(finalNote);
              if (finalTeacherUser || finalTeacherName) {
                setActiveAssignedTeacher({
                  username: finalTeacherUser,
                  fullName: finalTeacherName,
                });
              }
              setCurrentStudentInfo((prev) => ({
                name: prev?.name || studentProfile.name || '',
                studentClass: finalClass,
                studentId: prev?.studentId || studentProfile.studentId || '',
              }));
            }
          } else if (!matchedExam) {
            // Dự phòng cuối cùng nếu cả cục bộ và server đều không tìm thấy mã đề
            const fallbackShouldShuffle = studentParams.shuffleQuestions !== false;
            const fallbackShuffleOptions = studentParams.shuffleOptions !== false;
            const fallbackExam = prepareExamForStudent(
              MOCK_EXAMS[0],
              fallbackShouldShuffle,
              visitShuffleSeed,
              fallbackShuffleOptions
            );
            setActiveExamShuffleMeta({
              rawExam: MOCK_EXAMS[0],
              shuffleQuestions: fallbackShouldShuffle,
              shuffleOptions: fallbackShuffleOptions,
            });
            setActiveExam(fallbackExam);
            setCustomExamDuration(studentParams.durationMinutes || 50);
            setActiveTeacherNote(studentParams.teacherNote);
          }
        })
        .catch(() => {
          if (!matchedExam) {
            const fallbackShouldShuffle = studentParams.shuffleQuestions !== false;
            const fallbackShuffleOptions = studentParams.shuffleOptions !== false;
            const fallbackExam = prepareExamForStudent(
              MOCK_EXAMS[0],
              fallbackShouldShuffle,
              visitShuffleSeed,
              fallbackShuffleOptions
            );
            setActiveExamShuffleMeta({
              rawExam: MOCK_EXAMS[0],
              shuffleQuestions: fallbackShouldShuffle,
              shuffleOptions: fallbackShuffleOptions,
            });
            setActiveExam(fallbackExam);
            setCustomExamDuration(studentParams.durationMinutes || 50);
            setActiveTeacherNote(studentParams.teacherNote);
          }
        });
    }
  }, []);

  // Start exam directly from home (Không giới hạn số lượt làm bài)
  const handleStartExam = (
    exam: Exam,
    studentInfo?: { name: string; studentClass: string; studentId?: string },
    duration?: number
  ) => {
    setActiveExam(exam);
    const effectiveInfo = studentInfo || studentProfile;
    setCurrentStudentInfo(effectiveInfo);
    setCustomExamDuration(duration);
    setUserAnswers(null);
    setExamResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Student confirmed name & class in StudentEntryModal (Không giới hạn số lượt làm bài)
  const handleStudentStart = (info: { name: string; studentClass: string; studentId?: string }) => {
    if (!studentEntryConfig) return;
    const targetExam = studentEntryConfig.exam;
    const duration = studentEntryConfig.durationMinutes;
    handleUpdateStudentProfile(info);
    setStudentEntryConfig(null);
    handleStartExam(targetExam, info, duration);
  };

  // Submit exam and evaluate
  const handleSubmitExam = (answers: UserExamAnswers) => {
    if (!activeExam) return;
    const evaluated = evaluateExam(activeExam, answers, 'user_custom');

    const studentInfo = answers.studentInfo || currentStudentInfo || studentProfile;
    evaluated.studentInfo = studentInfo;

    // Record question statistics with student identity for frequent mistakes analytics
    activeExam.partI.forEach((q) => {
      const selected = answers.partI[q.id];
      const isCorrect = selected === q.correctAnswer;
      recordStudentQuestionMistake(
        q.id,
        isCorrect,
        selected || 'Chưa chọn',
        studentInfo,
        activeExam.code,
        q.question,
        q.correctAnswer
      );
    });

    // Ghi nhận cả các ý trong Phần II (Đúng/Sai) học sinh làm sai
    activeExam.partII.forEach((tfQ) => {
      tfQ.statements.forEach((stmt) => {
        const userChoice = answers.partII[tfQ.id]?.[stmt.subId];
        const isCorrect = userChoice === stmt.isCorrect;
        recordStudentQuestionMistake(
          `${tfQ.id}_${stmt.subId}`,
          isCorrect,
          userChoice === null ? 'Chưa chọn' : userChoice ? 'Đúng' : 'Sai',
          studentInfo,
          activeExam.code,
          `Câu ${tfQ.number} ý ${stmt.subId}: ${stmt.text}`,
          stmt.isCorrect ? 'Đúng' : 'Sai'
        );
      });
    });
    try {
      const partIDetails = activeExam.partI.map((q) => {
        const selectedAnswer = answers.partI[q.id] ?? null;
        return {
          questionNumber: q.number,
          questionId: q.id,
          questionText: q.question,
          options: q.options,
          selectedAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect: selectedAnswer === q.correctAnswer,
          explanation: q.explanation,
        };
      });

      const partIIDetails = activeExam.partII.map((tfQ) => ({
        questionNumber: tfQ.number,
        questionId: tfQ.id,
        scenarioTitle: tfQ.scenarioTitle,
        scenario: tfQ.scenario,
        earnedScore: evaluated.partIIQuestionsScore[tfQ.id]?.earnedScore ?? 0,
        statements: tfQ.statements.map((stmt) => {
          const userChoice = answers.partII[tfQ.id]?.[stmt.subId] ?? null;
          return {
            subId: stmt.subId,
            text: stmt.text,
            userChoice,
            correctChoice: stmt.isCorrect,
            isCorrect: userChoice === stmt.isCorrect,
            explanation: stmt.explanation,
          };
        }),
      }));

      const finalViolations = evaluated.violationCount ?? answers.violationCount ?? 0;
      const isTeacherEnded = Boolean(answers.autoSubmittedByTeacher);
      evaluated.autoSubmittedByTeacher = isTeacherEnded;
      sendStudentScoreToAdmin({
        studentName: studentInfo?.name || 'Học sinh',
        studentClass: studentInfo?.studentClass || '12A1',
        studentId: studentInfo?.studentId || '',
        examId: activeExam.id,
        examTitle: activeExam.title,
        examCode: activeExam.code,
        totalScore: evaluated.totalScore,
        partIScore: evaluated.partIScore,
        partIIScore: evaluated.partIIScore,
        partICorrectCount: evaluated.partICorrectCount,
        partIICorrectCount: evaluated.partIICorrectStatementsCount,
        timeSpentSeconds: evaluated.timeSpentSeconds,
        violationCount: finalViolations,
        isAutoCollected: finalViolations >= 5 || isTeacherEnded,
        autoSubmittedByTeacher: isTeacherEnded,
        teacherUsername: activeAssignedTeacher?.username || currentUser?.username || '',
        teacherName:
          activeAssignedTeacher?.fullName ||
          currentUser?.fullName ||
          activeAssignedTeacher?.username ||
          currentUser?.username ||
          '',
        examPaper: {
          partI: answers.partI,
          partII: answers.partII,
          partIDetails,
          partIIDetails,
        },
      });
    } catch (err) {
      console.warn('Failed to send score to admin database', err);
    }

    setUserAnswers(answers);
    setExamResult(evaluated);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Retake current exam (re-shuffle with a fresh unique seed if assigned with auto-shuffle enabled)
  const handleRetakeExam = () => {
    if (activeExamShuffleMeta?.shuffleQuestions) {
      const reshuffled = prepareExamForStudent(
        activeExamShuffleMeta.rawExam,
        true,
        createUniqueShuffleSeed(activeExamShuffleMeta.rawExam.id),
        activeExamShuffleMeta.shuffleOptions
      );
      setActiveExam(reshuffled);
    }
    setUserAnswers(null);
    setExamResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Exit back to home
  const handleExitExam = () => {
    setActiveExam(null);
    setActiveExamShuffleMeta(null);
    setUserAnswers(null);
    setExamResult(null);
    setCurrentStudentInfo(undefined);
    setCustomExamDuration(undefined);
    setActiveTeacherNote(undefined);
    setActiveAssignedTeacher(undefined);
    setStudentEntryConfig(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentSubscription = currentUser
    ? getAccountSubscriptionStatus({
        role: currentUser.role,
        username: currentUser.username,
        startDate: currentUser.startDate,
        paymentAmount: currentUser.paymentAmount,
        nowMs,
      })
    : null;
  const canDownloadDocuments = currentSubscription ? currentSubscription.canDownloadDocuments : false;
  const canAssignExam = currentSubscription ? currentSubscription.canAssignExam : false;
  const isStudentMemberTier = Boolean(currentUser && currentSubscription?.isStudentMemberTier);
  const isFreeTrialTier = Boolean(currentUser && currentSubscription?.isFreeTrialTier);
  const isLoyalMember = Boolean(
    currentUser &&
      currentSubscription &&
      !currentSubscription.canDownloadDocuments &&
      !currentSubscription.isFreeTrialTier
  );

  // Generate random exam from bank - KHÔNG GIỚI HẠN SỐ LẦN TẠO & ĐỒNG BỘ MỌI THIẾT BỊ
  const handleGenerateRandomExam = () => {
    if (!currentUser) {
      handleOpenLoginWithReason('Vui lòng đăng nhập tài khoản để tạo đề thi ngẫu nhiên mới!');
      return;
    }
    if (currentSubscription?.isExpired || isLoyalMember) {
      setIsDownloadRestrictedModalOpen(true);
      return;
    }

    const newExam = generateRandomExam();
    const existingCustom = examList.filter(
      (e) => !MOCK_EXAMS.some((m) => m.code === e.code) && e.code !== newExam.code
    );
    const nextCustomList = [newExam, ...existingCustom];

    setExamList([...MOCK_EXAMS, ...nextCustomList]);
    setExamCodeFilter(newExam.code);
    setCurrentTab('exams');
    setRandomExamAlert(
      `Đã tạo thành công 1 mã đề ngẫu nhiên mới: Mã đề ${newExam.code}.`
    );

    fetch('/api/custom-exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exam: newExam }),
    })
      .then(() => {
        notifyLocalDomainChange('custom_exams_updated', { changedAt: Date.now() });
      })
      .catch(() => {});

    setActiveExam(newExam);
    setCustomExamDuration(newExam.durationMinutes || 50);
    setActiveTeacherNote(undefined);
    setStudentEntryConfig(null);
    setCurrentStudentInfo({
      name: studentProfile.name || '',
      studentClass: studentProfile.studentClass || '12A1',
      studentId: studentProfile.studentId || '',
    });
  };

  const handleOpenPrint = (exam: Exam) => {
    if (!currentUser) {
      handleOpenLoginWithReason('Vui lòng đăng nhập tài khoản để tải về hoặc in đề thi (.docx / PDF)!');
      return;
    }
    if (!canDownloadDocuments) {
      setIsDownloadRestrictedModalOpen(true);
      return;
    }
    setPrintExamTarget(exam);
    setIsPrintModalOpen(true);
  };

  const handleAssignQrAttempt = (exam: Exam) => {
    if (!currentUser) {
      handleOpenLoginWithReason('Vui lòng đăng nhập tài khoản để tạo mã QR giao đề thi!');
      return;
    }
    if (!canAssignExam) {
      setIsDownloadRestrictedModalOpen(true);
      return;
    }
    setAssignQrExam(exam);
  };

  const handleStartExamAttempt = (targetExam?: Exam) => {
    if (isLoyalMember) {
      setIsDownloadRestrictedModalOpen(true);
      return;
    }
    const target = targetExam || (examCodeFilter !== 'all' ? examList.find((e) => e.code === examCodeFilter) : null) || examList[0];
    setActiveExam(target);
    setCustomExamDuration(target.durationMinutes || 50);
    setActiveTeacherNote(undefined);
    setStudentEntryConfig(null);
    setCurrentStudentInfo({
      name: studentProfile.name || '',
      studentClass: studentProfile.studentClass || '12A1',
      studentId: studentProfile.studentId || '',
    });
    setUserAnswers(null);
    setExamResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentSelectedExam: Exam =
    (examCodeFilter !== 'all'
      ? examList.find((e) => e.code === examCodeFilter)
      : undefined) ||
    (examList.length > MOCK_EXAMS.length
      ? examList[examList.length - 1]
      : examList[0]);

  if (closedQrSessionNotice) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border-2 border-rose-200 shadow-xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider">
            Phiên thi đã kết thúc · Link QR đã khóa
          </div>
          <h1 className="text-xl font-extrabold text-rose-900">
            Link làm bài đã bị khóa bởi Giáo viên
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {closedQrSessionNotice.reason}
          </p>
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 text-left text-xs space-y-1.5">
            {closedQrSessionNotice.examTitle && (
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Đề thi:</span>
                <strong className="text-slate-900 text-right">{closedQrSessionNotice.examTitle}</strong>
              </div>
            )}
            {closedQrSessionNotice.examCode && (
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Mã đề:</span>
                <strong className="text-slate-900 font-mono">{closedQrSessionNotice.examCode}</strong>
              </div>
            )}
            {closedQrSessionNotice.teacherName && (
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Giáo viên phụ trách:</span>
                <strong className="text-slate-900">{closedQrSessionNotice.teacherName}</strong>
              </div>
            )}
            {closedQrSessionNotice.closedAt && (
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Thời điểm kết thúc:</span>
                <strong className="text-slate-900 tabular-nums">
                  {new Date(closedQrSessionNotice.closedAt).toLocaleString('vi-VN')}
                </strong>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setClosedQrSessionNotice(null);
              try {
                window.history.replaceState({}, '', '/');
              } catch {}
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-colors cursor-pointer"
          >
            Quay về trang chính
          </button>
        </div>
      </div>
    );
  }

  // If user is currently taking an exam
  if (activeExam && !examResult) {
    return (
      <>
        <RealtimeVisitorStatsCard
          currentUser={currentUser}
          studentProfile={studentProfile}
          currentTab={currentTab}
          isTakingExam={true}
          activeExamCode={activeExam.code}
          hiddenUI={true}
        />
        <ExamRunner
          key={activeExam.id}
          exam={activeExam}
          onSubmit={handleSubmitExam}
          onExit={handleExitExam}
          studentInfo={currentStudentInfo}
          onUpdateStudentInfo={(info) => {
            setCurrentStudentInfo(info);
            handleUpdateStudentProfile({
              name: info.name,
              studentClass: info.studentClass,
              studentId: info.studentId || '',
            });
          }}
          teacherNote={activeTeacherNote}
          assignedTeacherUsername={activeAssignedTeacher?.username}
          isShuffledForStudent={Boolean(activeExamShuffleMeta?.shuffleQuestions)}
          customDurationMinutes={customExamDuration}
          isPausedForEntry={Boolean(studentEntryConfig)}
          onAssignQr={
            currentUser && canAssignExam
              ? (e) => handleAssignQrAttempt(e)
              : undefined
          }
        />
        {assignQrExam && (
          <AssignExamQRModal
            isOpen={Boolean(assignQrExam)}
            onClose={() => setAssignQrExam(null)}
            exam={assignQrExam}
            availableExams={[
              ...examList,
              ...BUILTIN_PROVINCIAL_AND_OFFICIAL_EXAMS,
              ...uploadedExams,
            ]}
            currentUser={currentUser}
            onStartDirect={(exam, cfg) => {
              const sourceRaw = assignQrExam || exam;
              setSavedQrAssignments(
                saveStudentQrAssignment(sourceRaw, {
                  examId: sourceRaw.id,
                  examCode: sourceRaw.code,
                  className: cfg.className,
                  durationMinutes: cfg.durationMinutes,
                  shuffleQuestions: cfg.shuffleQuestions,
                  shuffleOptions: cfg.shuffleOptions,
                  teacherNote: cfg.teacherNote,
                  teacherUsername: cfg.teacherUsername || currentUser?.username,
                  teacherName: cfg.teacherName || currentUser?.fullName,
                })
              );
              setActiveExamShuffleMeta({
                rawExam: sourceRaw,
                shuffleQuestions: Boolean(cfg.shuffleQuestions),
                shuffleOptions: cfg.shuffleOptions !== false,
              });
              setActiveExam(exam);
              setCustomExamDuration(cfg.durationMinutes);
              setActiveTeacherNote(cfg.teacherNote);
              setActiveAssignedTeacher({
                username: cfg.teacherUsername || currentUser?.username,
                fullName: cfg.teacherName || currentUser?.fullName,
              });
              setStudentEntryConfig(null);
              setCurrentStudentInfo({
                name: studentProfile.name || '',
                studentClass: cfg.className || studentProfile.studentClass || '12A1',
                studentId: studentProfile.studentId || '',
              });
            }}
          />
        )}
        {studentEntryConfig && (
          <StudentEntryModal
            exam={studentEntryConfig.exam}
            initialName={studentProfile.name}
            classroom={studentEntryConfig.className || studentProfile.studentClass}
            initialStudentId={studentProfile.studentId}
            durationMinutes={studentEntryConfig.durationMinutes}
            teacherNote={studentEntryConfig.teacherNote}
            onStart={handleStudentStart}
            onCancel={() => {
              setStudentEntryConfig(null);
              if (!currentStudentInfo?.name) {
                handleExitExam();
              }
            }}
          />
        )}
      </>
    );
  }

  // If user has completed an exam and is reviewing results
  if (activeExam && examResult && userAnswers) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === 'matrix') {
              setIsMatrixModalOpen(true);
            } else {
              handleExitExam();
              setCurrentTab(tab);
            }
          }}
          onGenerateRandomExam={handleGenerateRandomExam}
          onStartExam={() => handleStartExamAttempt()}
          currentUser={currentUser}
          onUpdateUser={(updated) => setCurrentUser(updated)}
          isLoyalMember={isLoyalMember}
          onRequireVipUpgrade={() => setIsDownloadRestrictedModalOpen(true)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
        />
        <main className="flex-1">
          {examResult.autoSubmittedByTeacher && (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <div className="bg-rose-600 text-white rounded-xl p-4 shadow-md border border-rose-500 flex items-start gap-3">
                <Lock className="w-5 h-5 shrink-0 mt-0.5 text-rose-100" />
                <div className="text-sm leading-relaxed">
                  <strong className="block font-extrabold">
                    Giáo viên đã kết thúc bài thi sớm
                  </strong>
                  <span>
                    Hệ thống đã dừng đồng hồ đếm ngược, tự động thu bài làm của bạn, khóa đường link QR và đồng bộ điểm vào Bảng Điểm cuối cùng của Giáo viên.
                  </span>
                </div>
              </div>
            </div>
          )}
          <ExamResultView
            exam={activeExam}
            answers={userAnswers}
            result={examResult}
            onRetake={examResult.autoSubmittedByTeacher ? handleExitExam : handleRetakeExam}
            onBackToHome={handleExitExam}
            onPrint={() => handleOpenPrint(activeExam)}
            onViewAdmin={() => {
              handleExitExam();
              setCurrentTab('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          Chương trình GDPT 2018 · Môn Công nghệ Nông nghiệp THPT · SGK Kết Nối Tri Thức Với Cuộc Sống
        </footer>

        <PrintExamModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          exam={printExamTarget}
          studentProfile={studentProfile}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Navbar with Clean Navigation & Auth */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'matrix') {
            setIsMatrixModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        onGenerateRandomExam={handleGenerateRandomExam}
        onStartExam={() => handleStartExamAttempt()}
        currentUser={currentUser}
        onUpdateUser={(updated) => setCurrentUser(updated)}
        isLoyalMember={isLoyalMember}
        onRequireVipUpgrade={() => setIsDownloadRestrictedModalOpen(true)}
        onOpenLogin={() => handleOpenLoginWithReason()}
        onLogout={handleLogout}
        onOpenSponsorQr={() => setIsSponsorQrModalOpen(true)}
      />

      {/* Guest Mode Banner: Clearly notifies that unauthenticated users can only view and not use interactive features */}
      {!currentUser && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-amber-500/15 border-b border-amber-300 text-amber-950 px-4 py-2.5 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <span className="p-1 rounded-md bg-amber-200 text-amber-900 shrink-0">
                <Lock className="w-4 h-4" />
              </span>
              <span>
                <strong>Đề thi không giới hạn số lượt làm bài:</strong> Học sinh có thể làm bài và thi lại thoải mái. Quý Thầy/Cô đăng nhập tài khoản để sử dụng các tính năng: <strong>giao đề trực tuyến</strong>, <strong>tạo đề ngẫu nhiên mới</strong> và <strong>tải tài liệu Word/PDF</strong>.
              </span>
            </div>
            <button
              onClick={() => handleOpenLoginWithReason('Vui lòng đăng nhập tài khoản để mở khóa tất cả các tính năng!')}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm whitespace-nowrap active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng Nhập Ngay</span>
            </button>
          </div>
        </div>
      )}

      {/* Thông báo đếm ngược hạn sử dụng tài khoản khi còn <= 45 ngày (hoặc đã hết hạn) */}
      {currentUser && (() => {
        const sub = getAccountSubscriptionStatus({
          role: currentUser.role,
          username: currentUser.username,
          startDate: currentUser.startDate,
          paymentAmount: currentUser.paymentAmount,
          nowMs,
        });

        if (sub.isUnlimited) {
          return (
            <div className="bg-emerald-950/95 border-b border-emerald-800/80 text-emerald-100 px-4 py-1.5 sm:px-6 text-[11px] sm:text-xs">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 font-bold text-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>
                      {sub.isAdmin ? 'Tài khoản Quản trị viên (Admin):' : 'Tài khoản Sử dụng vô hạn:'}{' '}
                      <strong className="text-white">{currentUser.fullName}</strong> (@{currentUser.username})
                    </span>
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/50 text-amber-200 font-bold">
                  Hạn dùng: Sử dụng vô hạn (Vĩnh viễn)
                </span>
              </div>
            </div>
          );
        }

        if (sub.isCountdownWarning || sub.isExpired) {
          return (
            <div
              className={`border-b px-4 py-2.5 sm:px-6 ${
                sub.isExpired
                  ? 'bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 border-rose-900 text-white'
                  : 'bg-gradient-to-r from-amber-500/25 via-orange-400/25 to-amber-500/25 border-amber-400 text-amber-950'
              }`}
            >
              <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-2.5 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 text-center sm:text-left">
                  <span
                    className={`p-1.5 rounded-lg shrink-0 ${
                      sub.isExpired ? 'bg-white/20 text-white' : 'bg-amber-500 text-white shadow-2xs'
                    }`}
                  >
                    <BellRing className="w-4 h-4 animate-bounce" />
                  </span>
                  <div>
                    <strong>
                      {sub.isExpired
                        ? 'CẢNH BÁO TÀI KHOẢN ĐÃ HẾT HẠN SỬ DỤNG:'
                        : `THÔNG BÁO ĐẾM NGƯỢC HẠN DÙNG TÀI KHOẢN (CÒN ≤ 45 NGÀY):`}
                    </strong>{' '}
                    Tài khoản <strong>{currentUser.fullName}</strong> (@{currentUser.username}) · Thẻ tiền nộp:{' '}
                    <strong>{sub.paymentLabel}</strong> ({sub.validityDays} ngày) · Ngày bắt đầu:{' '}
                    <strong>{sub.startDateVN}</strong> · Ngày hết hạn: <strong>{sub.expiresAtVN}</strong>.
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-extrabold flex items-center gap-1.5 shadow-2xs ${
                      sub.isExpired
                        ? 'bg-rose-950/80 text-rose-100 border border-rose-400'
                        : 'bg-amber-950 text-amber-200 border border-amber-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    {sub.isExpired ? (
                      <span>Đã hết hạn (0 ngày)</span>
                    ) : (
                      <span>
                        Còn {sub.countdownParts.days} ngày {String(sub.countdownParts.hours).padStart(2, '0')} giờ{' '}
                        {String(sub.countdownParts.minutes).padStart(2, '0')} phút{' '}
                        {String(sub.countdownParts.seconds).padStart(2, '0')} giây
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="bg-emerald-950/95 border-b border-emerald-800/80 text-emerald-100 px-4 py-1.5 sm:px-6 text-[11px] sm:text-xs">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-300">
                  <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                  <span>Thẻ tiền nộp: <strong className="text-white">{sub.paymentLabel}</strong> ({sub.validityDays} ngày)</span>
                </span>
                <span className="text-emerald-700">|</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ngày bắt đầu: <strong className="text-white font-mono">{sub.startDateVN}</strong></span>
                </span>
                <span className="text-emerald-700">|</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ngày hết hạn: <strong className="text-amber-300 font-mono">{sub.expiresAtVN}</strong></span>
                </span>
                {sub.isFreeTrialTier && (
                  <>
                    <span className="text-emerald-700">|</span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
                        sub.freeTrialDownloadsRemaining > 0
                          ? 'bg-purple-500/20 text-purple-200 border border-purple-400/50'
                          : 'bg-rose-500/20 text-rose-200 border border-rose-400/50'
                      }`}
                    >
                      🎁 Trải nghiệm (free · 7 ngày) · Chỉ giới hạn 3 lượt tải tài liệu ({sub.freeTrialDownloadsUsed}/{sub.maxFreeTrialDownloads} lượt · Còn {sub.freeTrialDownloadsRemaining}) · Giao bài QR không giới hạn
                    </span>
                  </>
                )}
                {sub.isStudentMemberTier && (
                  <>
                    <span className="text-emerald-700">|</span>
                    <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/50">
                      🎓 Học sinh VIP (100.000đ · hạn dùng 365 ngày) · Không được giao bài cho thành viên khác
                    </span>
                  </>
                )}
                {!sub.isStudentMemberTier && !sub.isFreeTrialTier && sub.paymentAmount <= 50000 && (
                  <>
                    <span className="text-emerald-700">|</span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
                        sub.canDownloadDocuments
                          ? 'bg-emerald-800/80 text-emerald-200 border border-emerald-600'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                      }`}
                    >
                      {sub.canDownloadDocuments
                        ? `Đầy đủ tính năng 15 ngày đầu (Còn ${sub.fullAccessRemainingDays} ngày)`
                        : 'Từ ngày thứ 16: Khóa Kho đề & Không được tải tài liệu'}
                    </span>
                  </>
                )}
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-800/90 border border-emerald-600 text-emerald-200 font-mono font-bold">
                Hạn dùng còn {sub.remainingDays} ngày
              </span>
            </div>
          </div>
        );
      })()}

      {/* Main Tab Views */}
      <main className="flex-1">
        {currentTab === 'exams' && (
          <div className="space-y-10 pb-16">
            {/* Hero & Website Cover Section */}
            <section className="bg-gradient-to-b from-[#145f33] via-emerald-900 to-emerald-950 text-white py-5 sm:py-7 lg:py-8 px-3 sm:px-6 lg:px-8 border-b border-emerald-800">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
                  {/* Block A: Trang bìa chính + Tiêu đề tóm tắt (PC: 8/12 bên trái · Mobile: toàn chiều rộng trên cùng) */}
                  <div className="lg:col-span-8 lg:row-start-1 flex flex-col justify-between gap-4">
                    <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#166d38] ring-1 ring-emerald-300/30 shadow-xl">
                      <img
                        src="/assets/aistudio/Gemini_Generated_Image_5w8nka5w8nka5w8n_bd78dffd.png"
                        alt="Học liệu Công nghệ Nông nghiệp THPT - Hệ thống ôn tập và luyện đề chuẩn chương trình GDPT 2018"
                        width={2816}
                        height={1472}
                        loading="eager"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="block w-full h-auto aspect-[2816/1472] object-contain"
                      />
                    </div>

                    <div className="space-y-1.5 px-0.5">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs font-semibold text-emerald-300">
                        <span>Chương trình GDPT 2018</span>
                        <span aria-hidden="true">·</span>
                        <span>SGK Kết nối tri thức</span>
                        <span aria-hidden="true">·</span>
                        <span>Lớp 10 · 11 · 12 &amp; Tốt nghiệp THPT</span>
                      </div>
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight [text-wrap:balance]">
                        HỌC LIỆU CÔNG NGHỆ NÔNG NGHIỆP THPT
                      </h1>
                      <p className="text-xs sm:text-sm md:text-base font-medium text-emerald-100 leading-relaxed">
                        Hệ Thống Ôn Tập &amp; Luyện Đề Chuẩn Chương Trình GDPT 2018
                      </p>
                    </div>
                  </div>

                  {/* Block B: Thanh công cụ thao tác nhanh (Mobile: hiển thị ngay dưới trang bìa · PC: trải ngang cân đối toàn hàng 2) */}
                  <div className="lg:col-span-12 lg:row-start-2 pt-4 border-t border-emerald-700/60">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                      <button
                        onClick={() => handleAssignQrAttempt(currentSelectedExam)}
                        className={`px-4 py-2.5 text-xs sm:text-sm font-bold active:scale-95 transition-all rounded-lg shadow-sm flex items-center gap-2 cursor-pointer ${
                          isLoyalMember || isStudentMemberTier
                            ? 'text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-400'
                            : 'text-white bg-emerald-600 hover:bg-emerald-500'
                        }`}
                        title={
                          isStudentMemberTier
                            ? 'Gói Học sinh VIP (100.000đ · hạn dùng 365 ngày) không được giao bài cho thành viên khác'
                            : isLoyalMember
                            ? 'Gói Giáo viên (50.000đ) đầy đủ tính năng 15 ngày đầu; từ ngày thứ 16 khóa Kho đề và không được tải tài liệu (Cần nâng cấp Giáo viên VIP)'
                            : 'Tạo mã QR đồng bộ nội dung đề thi trực tuyến cho học sinh quét làm bài'
                        }
                      >
                        {isLoyalMember || isStudentMemberTier ? <Lock className="w-4 h-4 text-amber-800 shrink-0" /> : <QrCode className="w-4 h-4 shrink-0" />}
                        <span>Giao Đề Qua Mã QR Cho Học Sinh</span>
                      </button>

                      <button
                        onClick={handleGenerateRandomExam}
                        className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold active:scale-95 transition-all rounded-lg shadow-sm flex items-center gap-2 cursor-pointer ${
                          isLoyalMember
                            ? 'text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300'
                            : 'text-emerald-950 bg-white hover:bg-emerald-50'
                        }`}
                        title={
                          isLoyalMember
                            ? 'Gói Giáo viên (50.000đ) đầy đủ tính năng 15 ngày đầu; từ ngày thứ 16 khóa Kho đề và không được tải tài liệu (Cần nâng cấp Giáo viên VIP)'
                            : 'Tạo 1 mã đề thi ngẫu nhiên mới chuẩn ma trận Bộ GD&ĐT'
                        }
                      >
                        {isLoyalMember ? (
                          <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                        ) : (
                          <PlusCircle className="w-4 h-4 text-emerald-800 shrink-0" />
                        )}
                        <span>Tạo 1 Đề Thi Ngẫu Nhiên Mới</span>
                      </button>

                      <button
                        onClick={() => setReferenceUploadTrigger((c) => c + 1)}
                        className="px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-teal-300 hover:bg-teal-200 active:scale-95 transition-all rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                        title="Giáo viên đăng tài liệu / đề tham khảo (.docx, .pdf, .txt) lên thẻ Đề Tham Khảo"
                      >
                        <UploadCloud className="w-4 h-4 text-slate-900 shrink-0" />
                        <span>Đăng Tài Liệu Đề Tham Khảo</span>
                      </button>

                      {currentUser?.role === 'admin' && (
                        <button
                          onClick={() => setCurrentTab('users')}
                          className="px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-emerald-950 bg-emerald-300 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                          title="Quản lý danh sách tài khoản học sinh, giáo viên và quản trị viên"
                        >
                          <Users className="w-4 h-4 text-emerald-900 shrink-0" />
                          <span>Quản Lý Người Dùng</span>
                        </button>
                      )}

                      <button
                        onClick={() => setCurrentTab('mistakes')}
                        className="px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-rose-200 bg-rose-950/70 hover:bg-rose-900 border border-rose-800/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Flame className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Câu Học Sinh Hay Sai (Bẫy Đề)</span>
                      </button>

                      <button
                        onClick={() => handleOpenPrint(currentSelectedExam)}
                        className="px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-emerald-100 bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-700/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Tải đề thi về máy tính dưới dạng file Word (.docx) hoặc In/Lưu PDF"
                      >
                        <Download className="w-4 h-4 text-emerald-300 shrink-0" />
                        <span>Tải Đề Về Máy (.docx / PDF)</span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('provincial_exams')}
                        className="px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-indigo-400 hover:bg-indigo-300 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Building2 className="w-4 h-4 text-slate-900 shrink-0" />
                        <span>Đề Thi Thử Các Tỉnh (Tải Đề Lên)</span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('official_exams')}
                        className="px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Award className="w-4 h-4 text-slate-900 shrink-0" />
                        <span>Đề Chính Thức Các Năm (Tải Đề Lên)</span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('chapter_review')}
                        className="px-3.5 py-2.5 text-xs sm:text-sm font-bold text-amber-950 bg-amber-300 hover:bg-amber-200 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4 text-amber-900 shrink-0" />
                        <span>Tài Nguyên (SGK 10·11·12)</span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('admin')}
                        className="px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-emerald-100 bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-700/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-300 shrink-0" />
                        <span>Bảng Điểm</span>
                      </button>

                      <button
                        onClick={() => setIsMatrixModalOpen(true)}
                        className="px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-700/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Layers className="w-4 h-4 shrink-0" />
                        <span>Xem Ma Trận &amp; Thang Điểm</span>
                      </button>
                    </div>
                  </div>

                  {/* Block C: Góc trên bên phải giao diện chính (PC: 4/12 cạnh trang bìa · Mobile: xếp gọn bên dưới) */}
                  <div className="lg:col-span-4 lg:col-start-9 lg:row-start-1 flex flex-col justify-between gap-3">
                    {/* Hộp QR góc nhỏ như mã QR giao bài */}
                    <div
                      onClick={() => setIsSponsorQrModalOpen(true)}
                      className="bg-emerald-950/70 hover:bg-emerald-950/90 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-400/60 shadow-md flex flex-col gap-2.5 cursor-pointer transition-all group"
                      title="Bấm để mở mã QR Nhà tài trợ thiên thần"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1.5 flex-1 min-w-0 flex flex-col items-center justify-center text-center">
                          <div className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[10px] font-bold uppercase tracking-wider">
                            <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                            <span>Mã QR Tài Trợ</span>
                          </div>
                          <p className="text-[11px] sm:text-xs font-semibold text-emerald-50 leading-snug text-center">
                            Quét cú QR nhẹ nhàng, bạn chính thức là &quot;NHÀ TÀI TRỢ THIÊN THẦN&quot; giúp dự án sinh tồn &amp; phát triển
                          </p>
                        </div>

                        {/* Mã QR nằm góc nhỏ */}
                        <div className="shrink-0 flex flex-col items-center gap-1">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl p-1 border-2 border-amber-300 shadow-sm overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                            <img
                              src="/assets/aistudio/df666ece8b190b475208_a4469d11.jpg"
                              alt='Quét cú QR nhẹ nhàng, bạn chính thức là "NHÀ TÀI TRỢ THIÊN THẦN" giúp dự án sinh tồn & phát triển'
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover object-center scale-125"
                            />
                          </div>
                          <span className="text-[10px] font-bold text-amber-300 group-hover:underline">
                            Phóng to QR
                          </span>
                        </div>
                      </div>

                      {/* Các mức Giáo viên VIP / Học sinh VIP / Trải nghiệm (free) */}
                      <div className="pt-2 border-t border-emerald-800/80 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between gap-2 px-2 py-1 rounded-lg bg-cyan-500/15 border border-cyan-400/30 text-cyan-100">
                          <span className="font-bold text-cyan-200">💎 Giáo viên VIP 200000đ</span>
                          <span className="font-mono font-semibold text-white">Hạn dùng 365 ngày · Mở khóa toàn bộ tính năng</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 px-2 py-1 rounded-lg bg-sky-500/15 border border-sky-400/30 text-sky-100">
                          <span className="font-bold text-sky-200">🎓 Học sinh VIP 100000đ</span>
                          <span className="font-mono font-semibold text-white">Hạn dùng 365 ngày · Không được giao bài cho thành viên khác</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 px-2 py-1 rounded-lg bg-purple-500/15 border border-purple-400/30 text-purple-100">
                          <span className="font-bold text-purple-200">🎁 Trải nghiệm (free)</span>
                          <span className="font-mono font-semibold text-white">Hạn 7 ngày · Chỉ giới hạn 3 lượt tải tài liệu · Giao bài QR không giới hạn</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick KPI / Overview Box */}
                    <div className="bg-emerald-800/50 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-emerald-700/60 space-y-2.5 text-xs flex-1 flex flex-col justify-center">
                      <span className="font-bold uppercase tracking-wider text-emerald-200 block">
                        Cấu Trúc Đề Thi Chuẩn
                      </span>
                      <div className="space-y-2 divide-y divide-emerald-700/60">
                        <div className="pt-1 flex justify-between items-center">
                          <span className="text-emerald-100">Thời gian làm bài:</span>
                          <strong className="text-white font-mono tabular-nums text-sm">50 phút</strong>
                        </div>
                        <div className="pt-2 flex justify-between items-center">
                          <span className="text-emerald-100">Phần I (Trắc nghiệm):</span>
                          <strong className="text-white tabular-nums">24 câu (6,0 điểm)</strong>
                        </div>
                        <div className="pt-2 flex justify-between items-center">
                          <span className="text-emerald-100">Phần II (Đúng / Sai):</span>
                          <strong className="text-white tabular-nums">4 câu (4,0 điểm)</strong>
                        </div>
                        <div className="pt-2 flex justify-between items-center">
                          <span className="text-emerald-100">Số lượt làm bài:</span>
                          <strong className="text-amber-300 font-bold">Không giới hạn</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Exam Matrix Visual Strip */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 font-bold">
                      10
                    </div>
                    <div>
                      <strong className="text-slate-900 block">Công nghệ 10 Trồng trọt</strong>
                      <span className="text-slate-500">4 câu Nhận biết (1,00 điểm)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                      11
                    </div>
                    <div>
                      <strong className="text-slate-900 block">Công nghệ 11 Chăn nuôi</strong>
                      <span className="text-slate-500">4 câu Nhận biết (1,00 điểm)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 font-bold">
                      12
                    </div>
                    <div>
                      <strong className="text-slate-900 block">Công nghệ 12 Lâm nghiệp</strong>
                      <span className="text-slate-500">NB, TH, VD + Tình huống thực tế</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-800 flex items-center justify-center shrink-0 font-bold">
                      12
                    </div>
                    <div>
                      <strong className="text-slate-900 block">Công nghệ 12 Thủy sản</strong>
                      <span className="text-slate-500">NB, TH, VD + Tình huống thực tế</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thẻ Chọn / Nhập Tên Học Sinh và Lớp */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <StudentProfileCard
                profile={studentProfile}
                onUpdateProfile={handleUpdateStudentProfile}
              />
            </div>

            {/* Danh sách Đề Thi Đã Nhận Qua Mã QR (Giao bài 1 lần — Học sinh làm bài không giới hạn bất cứ thời gian nào) */}
            {savedQrAssignments.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-5 sm:p-6 border-2 border-amber-400/80 shadow-lg text-white space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-700/80 pb-3.5">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 shrink-0 shadow-xs">
                        <QrCode className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base sm:text-lg font-extrabold text-white">
                            Đề Thi Đã Giao Qua Mã QR (Giao 1 Lần · Làm Bài Không Giới Hạn Mọi Lúc)
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 border border-amber-300 text-amber-200">
                            ∞ Làm bài 24/7 không giới hạn số lượt
                          </span>
                        </div>
                        <p className="text-xs text-emerald-100 mt-0.5">
                          Giáo viên chỉ cần giao đề qua mã QR 1 lần duy nhất — Đề thi đã được lưu cố định để học sinh có thể vào làm bài và ôn luyện lại không giới hạn vào bất cứ thời gian nào.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedQrAssignments.map((item) => (
                      <div
                        key={`saved_qr_${item.exam.id}_${item.exam.code}`}
                        className="bg-white text-slate-900 rounded-xl p-4 border border-emerald-200 shadow-sm flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-mono text-xs font-extrabold border border-emerald-300">
                              Mã đề {item.exam.code}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-bold">
                              ∞ Không giới hạn thời gian &amp; số lượt
                            </span>
                          </div>

                          <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2">
                            {item.exam.title}
                          </h3>

                          <div className="text-xs text-slate-600 space-y-1">
                            <div className="flex items-center justify-between">
                              <span>Thời gian làm bài:</span>
                              <strong className="text-slate-900">{item.config.durationMinutes || 50} phút</strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Lớp nhận đề:</span>
                              <strong className="text-emerald-800">{item.config.className || 'Ôn THPT'}</strong>
                            </div>
                            {(item.config.teacherName || item.config.teacherUsername) && (
                              <div className="flex items-center justify-between">
                                <span>Giáo viên giao đề:</span>
                                <strong className="text-emerald-900">
                                  {item.config.teacherName || `@${item.config.teacherUsername}`}
                                </strong>
                              </div>
                            )}
                          </div>

                          {item.config.teacherNote && (
                            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-950 italic line-clamp-2">
                              💬 &ldquo;{item.config.teacherNote}&rdquo;
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const shouldShuffle = item.config.shuffleQuestions !== false;
                              const shouldShuffleOpt = item.config.shuffleOptions !== false;
                              const prepared = prepareExamForStudent(
                                item.exam,
                                shouldShuffle,
                                createUniqueShuffleSeed(item.exam.id),
                                shouldShuffleOpt
                              );
                              setActiveExamShuffleMeta({
                                rawExam: item.exam,
                                shuffleQuestions: shouldShuffle,
                                shuffleOptions: shouldShuffleOpt,
                              });
                              setActiveExam(prepared);
                              setCustomExamDuration(item.config.durationMinutes || item.exam.durationMinutes || 50);
                              setActiveTeacherNote(item.config.teacherNote);
                              setActiveAssignedTeacher({
                                username: item.config.teacherUsername,
                                fullName: item.config.teacherName,
                              });
                              setStudentEntryConfig(null);
                              setCurrentStudentInfo({
                                name: studentProfile.name || '',
                                studentClass: item.config.className || studentProfile.studentClass || '12A1',
                                studentId: studentProfile.studentId || '',
                              });
                              setUserAnswers(null);
                              setExamResult(null);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="flex-1 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Vào Làm Bài Ngay (Không Giới Hạn)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSavedQrAssignments(removeStudentQrAssignment(item.exam.id));
                            }}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Gỡ đề này khỏi danh sách đã lưu trên thiết bị"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Tài liệu & Đề Tham Khảo người dùng đăng tải lên hệ thống */}
            <ProvincialAndOfficialExamsView
              key="reference_exams"
              fixedCategory="reference_exam"
              embeddedSection={true}
              externalOpenUploadSignal={referenceUploadTrigger}
              currentUser={currentUser}
              uploadedExams={uploadedExams}
              onUploadExamSuccess={handleUploadExamSuccess}
              onDeleteUploadedExam={handleDeleteUploadedExam}
              onStartExam={(exam) => handleStartExamAttempt(exam)}
              onAssignQr={(exam) => handleAssignQrAttempt(exam)}
              onPrintExam={(exam) => handleOpenPrint(exam)}
              canDownloadDocuments={canDownloadDocuments}
              onRequireVipUpgrade={() => setIsDownloadRestrictedModalOpen(true)}
              onRequireLogin={handleOpenLoginWithReason}
            />

            {/* Standard Exams Library */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Đề Tham Khảo Chuẩn Hóa
                    </h2>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      24 Mã Đề Chuẩn (101 - 124)
                    </span>
                    {examList.some((e) => {
                      const c = parseInt(e.code, 10);
                      return isNaN(c) || c < 101 || c > 124;
                    }) && (
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        1 Mã Đề Ngẫu Nhiên Vừa Tạo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Trọn bộ 24 mã đề chuẩn hóa cố định (101 - 124) chuẩn ma trận 24 câu trắc nghiệm + 4 câu đúng/sai thực tiễn. Hỗ trợ tải file Word (.docx) và in ấn / lưu PDF.
                  </p>
                </div>

                {/* Fast Code Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <select
                      value={examCodeFilter}
                      onChange={(e) => {
                        if (isLoyalMember) {
                          setIsDownloadRestrictedModalOpen(true);
                          return;
                        }
                        setExamCodeFilter(e.target.value);
                        if (e.target.value !== 'all') {
                          setCodeRange('all');
                        }
                      }}
                      className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      <option value="all">-- Chọn xem 1 mã đề cụ thể --</option>
                      {examList.map((e) => {
                        const num = parseInt(e.code, 10);
                        const isRandom = isNaN(num) || num < 101 || num > 124;
                        return (
                          <option key={e.code} value={e.code}>
                            Mã đề {e.code} {isRandom ? '(Đề ngẫu nhiên mới tạo)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              {/* Thông báo khóa Kho đề & Tải tài liệu từ ngày thứ 16 đối với Thành viên */}
              {isLoyalMember && (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-200 text-amber-900 shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="text-xs sm:text-sm text-amber-950">
                      <p className="font-extrabold">
                        Từ Ngày Thứ 16: Đã Khóa Kho Đề Và Không Được Tải Tài Liệu
                      </p>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Gói <strong>Giáo viên (50.000đ · 90 ngày)</strong> được sử dụng đầy đủ tất cả tính năng trong <strong>15 ngày đầu</strong>; từ <strong>ngày thứ 16</strong> hệ thống khóa <strong>Kho đề (24 mã đề thi chuẩn hóa &amp; tạo đề ngẫu nhiên)</strong> và <strong>không được tải tài liệu</strong>. Hãy nâng cấp <strong>Giáo viên VIP (200.000đ · 365 ngày)</strong> để mở khóa toàn bộ.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSponsorQrModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Nâng Cấp Giáo Viên VIP (200.000đ)</span>
                  </button>
                </div>
              )}

              {/* Group Range Pills */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium px-2 py-1">Nhóm mã đề:</span>
                {[
                  { id: 'all', label: `Tất cả (${examList.length} đề)` },
                  { id: '101-110', label: 'Mã 101 - 110' },
                  { id: '111-120', label: 'Mã 111 - 120' },
                  { id: '121-124', label: 'Mã 121 - 124' },
                ].map((rng) => (
                  <button
                    key={rng.id}
                    onClick={() => {
                      if (isLoyalMember) {
                        setIsDownloadRestrictedModalOpen(true);
                        return;
                      }
                      setCodeRange(rng.id as any);
                      setExamCodeFilter('all');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      codeRange === rng.id && examCodeFilter === 'all'
                        ? 'bg-emerald-700 text-white font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    {rng.label}
                  </button>
                ))}
              </div>

              {/* Alert banner when 1 random exam has just been generated */}
              {randomExamAlert && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs transition-all">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-950">
                        {randomExamAlert}
                      </p>
                      <p className="text-xs text-emerald-700">
                        Hệ thống duy trì trọn bộ 24 mã đề chuẩn hóa (101 - 124) kết hợp các mã đề ngẫu nhiên mới tạo.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => {
                        setExamCodeFilter('all');
                        setCodeRange('all');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-100/70 rounded-lg transition-colors border border-emerald-200 cursor-pointer"
                    >
                      Xem toàn bộ kho đề
                    </button>
                    <button
                      onClick={() => setRandomExamAlert(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                      title="Đóng thông báo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Informative indicator when filtered to a specific code */}
              {examCodeFilter !== 'all' && (
                <div className="flex items-center justify-between bg-white border border-slate-200 px-4 py-2.5 rounded-lg text-xs shadow-2xs">
                  <span className="text-slate-600">
                    Đang xem 1 mã đề: <strong className="text-slate-900 font-mono font-bold">Mã Đề {examCodeFilter}</strong>
                    {!['101', '102', '103', '104', '105', '106'].includes(examCodeFilter) &&
                      (parseInt(examCodeFilter, 10) > 124 || isNaN(parseInt(examCodeFilter, 10))) && (
                        <span className="ml-2 text-amber-700 font-medium">(1 mã đề ngẫu nhiên vừa tạo)</span>
                      )}
                  </span>
                  <button
                    onClick={() => {
                      setExamCodeFilter('all');
                      setCodeRange('all');
                    }}
                    className="font-semibold text-emerald-700 hover:text-emerald-800 underline transition-colors cursor-pointer"
                  >
                    Xem lại toàn bộ 24 đề thi →
                  </button>
                </div>
              )}

              {/* Grid of exam cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {examList
                  .filter((e) => {
                    if (examCodeFilter !== 'all') {
                      return e.code === examCodeFilter;
                    }
                    if (codeRange !== 'all') {
                      const num = parseInt(e.code, 10);
                      if (isNaN(num)) return true;
                      if (codeRange === '101-110') return num >= 101 && num <= 110;
                      if (codeRange === '111-120') return num >= 111 && num <= 120;
                      if (codeRange === '121-124') return num >= 121 && num <= 124;
                    }
                    return true;
                  })
                  .map((exam) => (
                    <ExamCard
                      key={exam.id}
                      exam={exam}
                      onStartExam={(e) => handleStartExamAttempt(e)}
                      onAssignQr={(e) => handleAssignQrAttempt(e)}
                      onDownloadExam={(e) => handleOpenPrint(e)}
                      isGuest={!currentUser}
                      canDownload={canDownloadDocuments}
                      canUseExamCard={!isLoyalMember}
                    />
                  ))}
              </div>
            </section>
          </div>
        )}

        {currentTab === 'users' && (
          <SheetUserManagementView
            currentUser={currentUser}
            onOpenLogin={() => handleOpenLoginWithReason('Vui lòng đăng nhập tài khoản Admin để truy cập Quản lý người dùng!')}
          />
        )}

        {currentTab === 'mistakes' && (
          <MistakeAnalyticsView
            currentUser={currentUser}
            onOpenLogin={handleOpenLoginWithReason}
          />
        )}

        {currentTab === 'admin' && (
          <AdminScoreDashboard
            currentUser={currentUser}
            onOpenLogin={handleOpenLoginWithReason}
          />
        )}

        {currentTab === 'provincial_exams' && (
          <ProvincialAndOfficialExamsView
            key="provincial_exams"
            fixedCategory="provincial_mock"
            currentUser={currentUser}
            uploadedExams={uploadedExams}
            onUploadExamSuccess={handleUploadExamSuccess}
            onDeleteUploadedExam={handleDeleteUploadedExam}
            onStartExam={(exam) => handleStartExamAttempt(exam)}
            onAssignQr={(exam) => handleAssignQrAttempt(exam)}
            onPrintExam={(exam) => handleOpenPrint(exam)}
            canDownloadDocuments={canDownloadDocuments}
            onRequireVipUpgrade={() => setIsDownloadRestrictedModalOpen(true)}
            onRequireLogin={handleOpenLoginWithReason}
          />
        )}

        {currentTab === 'official_exams' && (
          <ProvincialAndOfficialExamsView
            key="official_exams"
            fixedCategory="official_past_year"
            currentUser={currentUser}
            uploadedExams={uploadedExams}
            onUploadExamSuccess={handleUploadExamSuccess}
            onDeleteUploadedExam={handleDeleteUploadedExam}
            onStartExam={(exam) => handleStartExamAttempt(exam)}
            onAssignQr={(exam) => handleAssignQrAttempt(exam)}
            onPrintExam={(exam) => handleOpenPrint(exam)}
            canDownloadDocuments={canDownloadDocuments}
            onRequireVipUpgrade={() => setIsDownloadRestrictedModalOpen(true)}
            onRequireLogin={handleOpenLoginWithReason}
          />
        )}

        {currentTab === 'chapter_review' && (
          <ChapterReviewView
            currentUser={currentUser}
            canDownloadDocuments={canDownloadDocuments}
            onRequireLogin={handleOpenLoginWithReason}
            onRequireVipUpgrade={() => setIsDownloadRestrictedModalOpen(true)}
            onStartExam={(exam) => handleStartExamAttempt(exam)}
            onAssignQr={(exam) => handleAssignQrAttempt(exam)}
            onPrintExam={(exam) => handleOpenPrint(exam)}
            uploadedExams={uploadedExams}
            onUploadExamSuccess={handleUploadExamSuccess}
            onDeleteUploadedExam={handleDeleteUploadedExam}
          />
        )}

        {/* Bộ theo dõi lượt truy cập chạy ngầm (ẩn hoàn toàn trên giao diện người dùng) */}
        <RealtimeVisitorStatsCard
          currentUser={currentUser}
          studentProfile={studentProfile}
          currentTab={currentTab}
          isTakingExam={Boolean(activeExam && !examResult)}
          activeExamCode={activeExam?.code}
          hiddenUI={true}
        />
      </main>

      {/* Teacher Assign Exam QR Modal */}
      {assignQrExam && (
        <AssignExamQRModal
          isOpen={Boolean(assignQrExam)}
          onClose={() => setAssignQrExam(null)}
          exam={assignQrExam}
          availableExams={[
            ...examList,
            ...BUILTIN_PROVINCIAL_AND_OFFICIAL_EXAMS,
            ...uploadedExams,
          ]}
          currentUser={currentUser}
          onStartDirect={(exam, cfg) => {
            const sourceRaw = assignQrExam || exam;
            setSavedQrAssignments(
              saveStudentQrAssignment(sourceRaw, {
                examId: sourceRaw.id,
                examCode: sourceRaw.code,
                className: cfg.className,
                durationMinutes: cfg.durationMinutes,
                shuffleQuestions: cfg.shuffleQuestions,
                shuffleOptions: cfg.shuffleOptions,
                teacherNote: cfg.teacherNote,
                teacherUsername: cfg.teacherUsername || currentUser?.username,
                teacherName: cfg.teacherName || currentUser?.fullName,
              })
            );
            setActiveExamShuffleMeta({
              rawExam: sourceRaw,
              shuffleQuestions: Boolean(cfg.shuffleQuestions),
              shuffleOptions: cfg.shuffleOptions !== false,
            });
            setActiveExam(exam);
            setCustomExamDuration(cfg.durationMinutes);
            setActiveTeacherNote(cfg.teacherNote);
            setActiveAssignedTeacher({
              username: cfg.teacherUsername || currentUser?.username,
              fullName: cfg.teacherName || currentUser?.fullName,
            });
            setStudentEntryConfig(null);
            setCurrentStudentInfo({
              name: studentProfile.name || '',
              studentClass: cfg.className || studentProfile.studentClass || '12A1',
              studentId: studentProfile.studentId || '',
            });
          }}
        />
      )}

      {/* Student Entry Card / Modal */}
      {studentEntryConfig && (
        <StudentEntryModal
          exam={studentEntryConfig.exam}
          initialName={studentProfile.name}
          classroom={studentEntryConfig.className || studentProfile.studentClass}
          initialStudentId={studentProfile.studentId}
          durationMinutes={studentEntryConfig.durationMinutes}
          teacherNote={studentEntryConfig.teacherNote}
          onStart={handleStudentStart}
          onCancel={() => setStudentEntryConfig(null)}
        />
      )}

      {/* Matrix Guide Modal */}
      <MatrixGuideModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
      />

      {/* Print Exam Modal */}
      <PrintExamModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        exam={printExamTarget}
        studentProfile={studentProfile}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setLoginPromptReason(null);
        }}
        onLoginSuccess={(user, isFirst) => {
          setLoginPromptReason(null);
          handleLoginSuccess(user, isFirst);
        }}
        reason={loginPromptReason}
      />

      {/* Sponsor QR Lightbox Modal */}
      {isSponsorQrModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsSponsorQrModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-2 border-amber-300 space-y-4 relative animate-in fade-in zoom-in-95 duration-150 my-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsSponsorQrModalOpen(false)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center justify-center text-center gap-2 px-4">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                <Sparkles className="w-5 h-5" />
              </span>
              <p className="text-sm sm:text-base font-bold text-emerald-950 leading-snug text-center">
                Quét cú QR nhẹ nhàng, bạn chính thức là &quot;NHÀ TÀI TRỢ THIÊN THẦN&quot; giúp dự án sinh tồn &amp; phát triển
              </p>
            </div>

            {/* Các hạng mức thành viên trong Modal */}
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-950 font-bold shadow-2xs">
                <span>💎 Giáo viên VIP 200000đ</span>
                <span className="font-mono text-cyan-800 text-right">Hạn dùng 365 ngày · Mở khóa toàn bộ tính năng</span>
              </div>
              <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 font-bold shadow-2xs">
                <span>🎓 Học sinh VIP 100000đ</span>
                <span className="font-mono text-sky-800 text-right">Hạn dùng 365 ngày · Không được giao bài cho thành viên khác</span>
              </div>
              <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 font-bold shadow-2xs">
                <span>🎁 Trải nghiệm (free)</span>
                <span className="font-mono text-purple-800 text-right">Hạn 7 ngày · Chỉ giới hạn 3 lượt tải tài liệu · Giao bài QR không giới hạn</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 flex justify-center">
              <img
                src="/assets/aistudio/df666ece8b190b475208_a4469d11.jpg"
                alt='Quét cú QR nhẹ nhàng, bạn chính thức là "NHÀ TÀI TRỢ THIÊN THẦN" giúp dự án sinh tồn & phát triển'
                className="w-full max-w-[300px] h-auto object-contain rounded-lg shadow-xs"
              />
            </div>

            <div className="text-center">
              <button
                onClick={() => setIsSponsorQrModalOpen(false)}
                className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restricted Modal for Giáo viên (50.000đ), Học sinh (50.000đ), or Trải nghiệm (free) */}
      {isDownloadRestrictedModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsDownloadRestrictedModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-amber-300 space-y-4 relative animate-in fade-in zoom-in-95 duration-150 my-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsDownloadRestrictedModalOpen(false)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                {isFreeTrialTier
                  ? 'Gói Trải Nghiệm (Free · 7 Ngày): Đã Tải Đủ 3 File Tài Liệu'
                  : isStudentMemberTier
                  ? 'Gói Học Sinh VIP (100.000đ): Không Được Giao Bài Cho Thành Viên Khác'
                  : 'Từ Ngày Thứ 16: Đã Khóa Kho Đề Và Không Được Tải Tài Liệu'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isFreeTrialTier ? (
                  <>
                    Tài khoản của bạn thuộc gói <strong>Trải nghiệm (free · hạn dùng 7 ngày)</strong>: được <strong>giao bài qua mã QR bình thường không giới hạn</strong>, chỉ giới hạn <strong>tối đa 3 lượt tải tài liệu</strong>. Vui lòng nâng cấp gói <strong>Học sinh VIP (100.000đ · hạn dùng 365 ngày)</strong> hoặc <strong>Giáo viên VIP (200.000đ · hạn dùng 365 ngày)</strong> để tải tài liệu không giới hạn.
                  </>
                ) : isStudentMemberTier ? (
                  <>
                    Tài khoản của bạn thuộc gói <strong>Học sinh VIP (100.000đ · hạn dùng 365 ngày)</strong>: được mở khóa ôn luyện Kho đề và tải tài liệu trong 365 ngày, nhưng <strong>không được giao bài cho thành viên khác</strong>.
                  </>
                ) : (
                  <>
                    Tài khoản của bạn thuộc gói <strong>Giáo viên (50.000đ · hạn 90 ngày)</strong>: được sử dụng <strong>đầy đủ tính năng 15 ngày đầu</strong>, từ <strong>ngày thứ 16 khóa Kho đề và không được tải tài liệu</strong>.
                  </>
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-950 space-y-1.5">
              <div className="font-bold flex items-center justify-between">
                <span>💎 Nâng cấp Giáo viên VIP (200.000đ)</span>
                <span className="font-mono text-cyan-800">Hạn dùng 365 ngày</span>
              </div>
              <p className="text-[11px] text-cyan-800">
                Mở khóa toàn bộ <strong>Kho đề (24 mã đề chuẩn hóa)</strong>, tính năng <strong>Tạo 1 đề thi ngẫu nhiên mới</strong>, <strong>Giao đề qua Mã QR</strong>, tải đề thi chuẩn hóa Word (.docx), xuất/in PDF và tải trọn bộ đề cương 24 chương SGK Lớp 10 · 11 · 12 suốt 365 ngày.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDownloadRestrictedModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setIsDownloadRestrictedModalOpen(false);
                  setIsSponsorQrModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Xem Mã QR Nâng Cấp VIP</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>HỌC LIỆU CÔNG NGHỆ NÔNG NGHIỆP THPT · Hệ Thống Ôn Tập &amp; Luyện Đề Chuẩn Chương Trình GDPT 2018</span>
          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-500">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Đồng bộ đa nền tảng: Android · iOS · Windows</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>SGK Kết Nối Tri Thức Với Cuộc Sống</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsMatrixModalOpen(true)}
              className="text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Ma trận đề thi
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
