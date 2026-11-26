import React, { useState, useEffect, useRef } from 'react';
import { Exam, UserExamAnswers } from '../types/exam';
import {
  Clock,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Eye,
  Check,
  X,
  Volume2,
  VolumeX,
  ShieldAlert,
  AlertTriangle,
  QrCode,
  Shuffle,
} from 'lucide-react';
import { TrueFalseScenarioDisplay } from './TrueFalseScenarioDisplay';
import { DocumentTable } from './DocumentTable';
import { DocumentChart } from './DocumentChart';
import { extractTableAndCitationFromBlock } from '../data/provincialAndOfficialExams';
import { subscribeRealtimeEvent } from '../services/realtimeSyncService';

interface ExamRunnerProps {
  exam: Exam;
  onSubmit: (answers: UserExamAnswers) => void;
  onExit: () => void;
  studentInfo?: {
    name: string;
    studentClass: string;
    studentId?: string;
  };
  customDurationMinutes?: number;
  isPausedForEntry?: boolean;
  teacherNote?: string;
  assignedTeacherUsername?: string;
  isShuffledForStudent?: boolean;
  onUpdateStudentInfo?: (info: {
    name: string;
    studentClass: string;
    studentId?: string;
  }) => void;
  onAssignQr?: (exam: Exam) => void;
}

const QUICK_CLASSES = ['Ôn THPT', '12A1', '12A2', '12A3', '11A1', '10A1'];

export const ExamRunner: React.FC<ExamRunnerProps> = ({
  exam,
  onSubmit,
  onExit,
  studentInfo,
  customDurationMinutes,
  isPausedForEntry = false,
  teacherNote,
  assignedTeacherUsername,
  isShuffledForStudent = false,
  onUpdateStudentInfo,
  onAssignQr,
}) => {
  const effectiveDuration = customDurationMinutes || exam.durationMinutes || 50;
  const [localName, setLocalName] = useState<string>(studentInfo?.name || '');
  const [localClass, setLocalClass] = useState<string>(
    studentInfo?.studentClass || 'Ôn THPT'
  );
  const [localStudentId, setLocalStudentId] = useState<string>(
    studentInfo?.studentId || ''
  );

  useEffect(() => {
    if (studentInfo?.name && !localName) {
      setLocalName(studentInfo.name);
    }
    if (studentInfo?.studentClass && (!localClass || localClass === 'Ôn THPT')) {
      setLocalClass(studentInfo.studentClass);
    }
    if (studentInfo?.studentId && !localStudentId) {
      setLocalStudentId(studentInfo.studentId);
    }
  }, [studentInfo?.name, studentInfo?.studentClass, studentInfo?.studentId]);

  const effectiveStudentInfo = {
    name: localName.trim() || studentInfo?.name?.trim() || 'Học sinh',
    studentClass: localClass.trim() || studentInfo?.studentClass?.trim() || 'Ôn THPT',
    studentId: localStudentId.trim() || studentInfo?.studentId?.trim() || undefined,
  };

  const handleStudentFieldChange = (
    nextName: string,
    nextClass: string,
    nextId: string
  ) => {
    setLocalName(nextName);
    setLocalClass(nextClass);
    setLocalStudentId(nextId);
    onUpdateStudentInfo?.({
      name: nextName,
      studentClass: nextClass || 'Ôn THPT',
      studentId: nextId || undefined,
    });
  };
  const [partIAnswers, setPartIAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | null>>(() => {
    const init: Record<string, 'A' | 'B' | 'C' | 'D' | null> = {};
    exam.partI.forEach((q) => {
      init[q.id] = null;
    });
    return init;
  });

  const [partIIAnswers, setPartIIAnswers] = useState<
    Record<string, Record<'a' | 'b' | 'c' | 'd', boolean | null>>
  >(() => {
    const init: Record<string, Record<'a' | 'b' | 'c' | 'd', boolean | null>> = {};
    exam.partII.forEach((tf) => {
      init[tf.id] = { a: null, b: null, c: null, d: null };
    });
    return init;
  });

  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(effectiveDuration * 60);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'all' | 'part1' | 'part2'>('all');

  // Anti-Cheat & Exit Detection States (Max 5 warnings -> Auto submit)
  const MAX_VIOLATIONS = 5;
  const [violationCount, setViolationCount] = useState(0);
  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
  const [violationReason, setViolationReason] = useState(
    'Thoát khỏi giao diện làm bài thi'
  );
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState<number | null>(
    null
  );
  const [isExitConfirmModalOpen, setIsExitConfirmModalOpen] = useState(false);

  const timerRef = useRef<any>(null);
  const lastViolationTimeRef = useRef<number>(0);
  const baseViewportRef = useRef<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });
  const isShrunkStateRef = useRef<boolean>(false);
  const hasSubmittedRef = useRef<boolean>(false);

  // Keep latest state in ref so timer & 5th-violation auto-submit always submit current answers
  const latestStateRef = useRef({
    partIAnswers,
    partIIAnswers,
    bookmarked,
    secondsRemaining,
    violationCount,
    studentInfo: effectiveStudentInfo,
    effectiveDuration,
  });

  useEffect(() => {
    latestStateRef.current = {
      partIAnswers,
      partIIAnswers,
      bookmarked,
      secondsRemaining,
      violationCount,
      studentInfo: effectiveStudentInfo,
      effectiveDuration,
    };
  }, [
    partIAnswers,
    partIIAnswers,
    bookmarked,
    secondsRemaining,
    violationCount,
    localName,
    localClass,
    localStudentId,
    studentInfo,
    effectiveDuration,
  ]);

  // Audio alert tone generator (compatible with Android, iOS Safari, and Windows)
  const playWarningBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio not permitted or supported
    }
  };

  const executeFinalSubmit = (
    overrideViolationCount?: number,
    forceTimeZero = false,
    autoSubmittedByTeacher = false
  ) => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    if (forceTimeZero) {
      setSecondsRemaining(0);
    }

    const st = latestStateRef.current;
    const finalViolations =
      overrideViolationCount !== undefined
        ? overrideViolationCount
        : st.violationCount;
    const rem = forceTimeZero ? 0 : st.secondsRemaining;

    const answers: UserExamAnswers = {
      partI: st.partIAnswers,
      partII: st.partIIAnswers,
      bookmarked: st.bookmarked,
      timeRemainingSeconds: rem,
      timeSpentSeconds: Math.max(1, st.effectiveDuration * 60 - rem),
      studentInfo: st.studentInfo,
      violationCount: finalViolations,
      autoSubmittedByTeacher,
    };
    onSubmit(answers);
  };

  // Real-time watch: if Teacher clicks "Kết thúc bài thi ngay", immediately stop countdown timer & auto-submit
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const norm = (s?: string | null) =>
      String(s || '')
        .trim()
        .replace(/^@+/, '')
        .toLowerCase();
    const myTeacher = norm(assignedTeacherUsername);
    const myExamId = norm(exam.id);
    const myExamCode = norm(exam.code);

    const doesEventMatch = (ev: any): boolean => {
      if (!ev) return false;
      const evTeacher = norm(ev.teacherUsername || ev.closedBy);
      if (myTeacher && evTeacher && evTeacher !== myTeacher) {
        return false;
      }
      // If student didn't enter via a specific teacher QR, only auto-submit when teacher matches or global lock matches exam
      if (!myTeacher && ev.closeAllForTeacher && ev.scope !== 'all_system') {
        const listCodes = Array.isArray(ev.examCodes) ? ev.examCodes.map(norm) : [];
        const listIds = Array.isArray(ev.examIds) ? ev.examIds.map(norm) : [];
        if (listCodes.length === 0 && listIds.length === 0) return false;
        return listCodes.includes(myExamCode) || listIds.includes(myExamId);
      }
      if (ev.closeAllForTeacher || ev.scope === 'all_teacher' || ev.scope === 'all_system') {
        return true;
      }
      const evId = norm(ev.examId);
      const evCode = norm(ev.examCode);
      const listCodes = Array.isArray(ev.examCodes) ? ev.examCodes.map(norm) : [];
      const listIds = Array.isArray(ev.examIds) ? ev.examIds.map(norm) : [];
      return Boolean(
        (myExamId &&
          (evId === myExamId ||
            evCode === myExamId ||
            listIds.includes(myExamId) ||
            listCodes.includes(myExamId))) ||
          (myExamCode &&
            (evCode === myExamCode ||
              evId === myExamCode ||
              listCodes.includes(myExamCode) ||
              listIds.includes(myExamCode)))
      );
    };

    const unsub = subscribeRealtimeEvent('exam_session_ended', (payload) => {
      if (hasSubmittedRef.current) return;
      if (doesEventMatch(payload)) {
        executeFinalSubmit(undefined, true, true);
      }
    });

    // Polling fallback every 4s for devices/WebViews where SSE may pause
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    const checkStatus = () => {
      if (hasSubmittedRef.current) {
        if (pollTimer) clearInterval(pollTimer);
        return;
      }
      if (!myTeacher) return;
      const qs = new URLSearchParams({
        examId: exam.id,
        code: exam.code,
        teacher: myTeacher,
        _t: String(Date.now()),
      });
      fetch(`/api/assignments/session-status?${qs.toString()}`, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.isClosed === true && !hasSubmittedRef.current) {
            executeFinalSubmit(undefined, true, true);
          }
        })
        .catch(() => {});
    };

    if (myTeacher) {
      pollTimer = setInterval(checkStatus, 4000);
    }

    return () => {
      unsub();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [exam.id, exam.code, assignedTeacherUsername]);

  const triggerViolation = (reason: string) => {
    if (hasSubmittedRef.current) return;
    const now = Date.now();
    // Cooldown 1.0s so simultaneous blur + visibilitychange or continuous resize drag counts as 1 event
    if (now - lastViolationTimeRef.current < 1000) return;
    lastViolationTimeRef.current = now;

    setViolationReason(reason);
    setIsViolationModalOpen(true);
    playWarningBeep();

    const nextCount = latestStateRef.current.violationCount + 1;
    latestStateRef.current.violationCount = nextCount;
    setViolationCount(nextCount);

    if (nextCount >= MAX_VIOLATIONS) {
      // Nếu học sinh đang ẩn tab/thoát trình duyệt ở lần thứ 5, thu bài ngay lập tức để không bị trình duyệt chặn bộ đếm ngầm
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        executeFinalSubmit(MAX_VIOLATIONS, false);
      } else {
        setAutoSubmitCountdown(1);
      }
    }
  };

  // Auto-submit countdown when violationCount reaches 5
  useEffect(() => {
    if (autoSubmitCountdown === null) return;
    if (autoSubmitCountdown <= 0) {
      executeFinalSubmit(MAX_VIOLATIONS, false);
      return;
    }
    const t = setTimeout(() => {
      setAutoSubmitCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 800);
    return () => clearTimeout(t);
  }, [autoSubmitCountdown]);

  // Anti-Cheat: Detect when student leaves exam interface (switches tab, minimizes, loses focus, presses Back, split-screen, or shrinks window)
  useEffect(() => {
    if (isPausedForEntry) return;

    baseViewportRef.current = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    const isMobileOrTouchOS =
      /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
      (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0 && window.innerWidth < 1024);

    // Push a guard state so pressing hardware/browser Back button warns to return immediately instead of leaving
    try {
      window.history.pushState({ examGuard: true }, '', window.location.href);
    } catch {
      // Ignore history errors in restricted iframes
    }

    const handlePopState = () => {
      if (hasSubmittedRef.current) return;
      try {
        window.history.pushState({ examGuard: true }, '', window.location.href);
      } catch {
        // Ignore
      }
      triggerViolation('Nhấn nút Quay lại (Thoát khỏi giao diện làm bài thi)');
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasSubmittedRef.current) return;
      e.preventDefault();
      e.returnValue =
        'CẢNH BÁO: Bạn đang trong thời gian làm bài thi! Vui lòng quay lại làm bài ngay.';
      return e.returnValue;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerViolation(
          'Thoát khỏi giao diện làm bài thi (Chuyển tab hoặc ẩn trình duyệt)'
        );
      }
    };

    const handleWindowBlur = () => {
      // Check after a brief tick so internal focus shifts (e.g. clicking an input/button inside the exam) are not flagged
      setTimeout(() => {
        if (hasSubmittedRef.current) return;
        if (
          document.visibilityState === 'hidden' ||
          (typeof document.hasFocus === 'function' && !document.hasFocus())
        ) {
          triggerViolation(
            'Thoát khỏi giao diện làm bài thi (Rời cửa sổ làm bài hoặc mở ứng dụng khác)'
          );
        }
      }, 150);
    };

    const handleWindowResize = () => {
      const curW = window.innerWidth;
      const curH = window.innerHeight;
      const baseW = baseViewportRef.current.width;
      const baseH = baseViewportRef.current.height;

      // Update baseline if student maximizes/enlarges window
      if (curW > baseW) baseViewportRef.current.width = curW;
      if (curH > baseH) baseViewportRef.current.height = curH;

      const widthRatio = curW / Math.max(baseViewportRef.current.width, 1);
      const heightRatio = curH / Math.max(baseViewportRef.current.height, 1);

      const isNowShrunk = isMobileOrTouchOS
        ? widthRatio < 0.75
        : widthRatio < 0.82 || heightRatio < 0.75;

      if (isNowShrunk && !isShrunkStateRef.current) {
        isShrunkStateRef.current = true;
        if (widthRatio < 0.65) {
          triggerViolation(
            'Chia đôi màn hình hoặc thoát thu nhỏ cửa sổ làm bài thi'
          );
        } else {
          triggerViolation(
            'Thu nhỏ màn hình hoặc thay đổi kích thước giao diện làm bài'
          );
        }
      } else if (!isNowShrunk && isShrunkStateRef.current) {
        isShrunkStateRef.current = false;
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [isPausedForEntry]);

  useEffect(() => {
    if (isPausedForEntry) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          executeFinalSubmit(undefined, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isPausedForEntry]);

  const handleConfirmSubmit = () => {
    executeFinalSubmit(undefined, false);
  };

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectPartIOption = (qId: string, option: 'A' | 'B' | 'C' | 'D') => {
    setPartIAnswers((prev) => ({
      ...prev,
      [qId]: prev[qId] === option ? null : option,
    }));
  };

  const selectPartIIOption = (tfId: string, subId: 'a' | 'b' | 'c' | 'd', value: boolean) => {
    setPartIIAnswers((prev) => ({
      ...prev,
      [tfId]: {
        ...prev[tfId],
        [subId]: prev[tfId]?.[subId] === value ? null : value,
      },
    }));
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Counting answered
  const partIAnsweredCount = Object.values(partIAnswers).filter((v) => v !== null).length;
  let partIIAnsweredCount = 0;
  let totalPartIIStatements = 0;
  exam.partII.forEach((tf) => {
    totalPartIIStatements += 4;
    const ans = partIIAnswers[tf.id];
    if (ans) {
      if (ans.a !== null) partIIAnsweredCount++;
      if (ans.b !== null) partIIAnsweredCount++;
      if (ans.c !== null) partIIAnsweredCount++;
      if (ans.d !== null) partIIAnsweredCount++;
    }
  });

  const totalQuestions = exam.partI.length + exam.partII.length;
  const totalPartIIPoints = exam.partII.length * 1.0;
  const totalPartIPoints = exam.partII.length > 0 ? Math.max(0, 10.0 - totalPartIIPoints) : 10.0;
  const pointPerPartI = exam.partI.length > 0 ? totalPartIPoints / exam.partI.length : 0;
  const totalPartIPointsLabel = totalPartIPoints.toFixed(1).replace('.', ',');
  const totalPartIIPointsLabel = totalPartIIPoints.toFixed(1).replace('.', ',');
  const pointPerPartILabel = Number(pointPerPartI.toFixed(2))
    .toString()
    .replace('.', ',');

  const isPartIIFullyDone = (tfId: string) => {
    const ans = partIIAnswers[tfId];
    return ans && ans.a !== null && ans.b !== null && ans.c !== null && ans.d !== null;
  };

  const isTimeCritical = secondsRemaining < 300; // < 5 minutes

  const scrollToQuestion = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Sticky Exam Progress & Timer Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setIsExitConfirmModalOpen(true)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors shrink-0 cursor-pointer"
            >
              ← Rời thi
            </button>
            <span className="text-slate-300">|</span>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[140px] sm:max-w-xs md:max-w-md">
                {exam.title}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                Mã đề: <strong className="font-mono text-emerald-800">{exam.code}</strong> · {effectiveDuration}p
                {studentInfo?.name && (
                  <span className="font-semibold text-emerald-800 ml-1 hidden sm:inline">
                    · Thí sinh: {studentInfo.name} ({studentInfo.studentClass})
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Teacher Quick Share QR for the currently open exam */}
            {onAssignQr && (
              <button
                type="button"
                onClick={() => onAssignQr(exam)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors cursor-pointer"
                title={`Lấy Mã QR đồng bộ đúng đề đang mở (Mã đề ${exam.code}) cho học sinh`}
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                <span>Mã QR ({exam.code})</span>
              </button>
            )}

            {/* Progress counter */}
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 font-medium">
              <span>Đã làm:</span>
              <span className="tabular-nums font-bold text-emerald-700">
                {partIAnsweredCount}/{exam.partI.length} câu TN
                {exam.partII.length > 0 ? ` · ${partIIAnsweredCount}/${exam.partII.length * 4} ý Đ/S` : ''}
              </span>
            </div>

            {/* Anti-cheat violation count indicator */}
            {violationCount > 0 && (
              <button
                type="button"
                onClick={() => setIsViolationModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 animate-pulse transition-all shadow-2xs cursor-pointer"
                title="Cảnh báo vi phạm quy chế làm bài (Đủ 5 lần hệ thống tự động nộp bài)"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="hidden sm:inline">Cảnh báo:</span>
                <span>{violationCount}/{MAX_VIOLATIONS} lần</span>
              </button>
            )}

            {/* Countdown timer */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm tabular-nums transition-colors ${
                isTimeCritical
                  ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                  : 'bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4 text-current" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            {/* Submit button */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 transition-all rounded-lg shadow-sm whitespace-nowrap"
            >
              Nộp Bài Thi
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Question Area (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Inline Student Identity & Teacher Note Card (Works seamlessly on Smartphone QR scan & PC without blocking popup) */}
            <div className="bg-emerald-950 text-white p-4 sm:p-5 rounded-2xl border-2 border-emerald-600 shadow-md space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-amber-300">
                    Thông Tin Thí Sinh Dự Thi (Mã đề {exam.code})
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-800/90 border border-emerald-500/60 text-[10px] font-bold text-emerald-100">
                    ∞ Giao bài 1 lần · Làm bài không giới hạn bất cứ thời gian nào
                  </span>
                  {isShuffledForStudent && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/60 text-[10px] font-bold text-amber-200">
                      <Shuffle className="w-3 h-3" />
                      <span>Đề đã tự động xáo trộn riêng cho bạn</span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-emerald-200">
                  Nhập họ tên &amp; lớp để lưu kết quả vào Bảng Điểm Giáo Viên
                </span>
              </div>

              {teacherNote && (
                <div className="p-3 rounded-xl bg-amber-400/15 border border-amber-300/40 text-xs text-amber-100">
                  <strong className="text-amber-300">💬 Lời dặn của Giáo viên:</strong> {teacherNote}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-bold text-emerald-200 mb-1">
                    Họ và tên học sinh: <span className="text-amber-300">*</span>
                  </label>
                  <input
                    type="text"
                    value={localName}
                    onChange={(e) =>
                      handleStudentFieldChange(e.target.value, localClass, localStudentId)
                    }
                    placeholder="Nhập họ và tên của em..."
                    className="w-full px-3 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs sm:text-sm border border-emerald-400 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-emerald-200 mb-1">
                    Lớp học: <span className="text-amber-300">*</span>
                  </label>
                  <input
                    type="text"
                    value={localClass}
                    onChange={(e) =>
                      handleStudentFieldChange(localName, e.target.value, localStudentId)
                    }
                    placeholder="VD: 12A1, 11A1, 10A1..."
                    className="w-full px-3 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs sm:text-sm border border-emerald-400 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-emerald-200 mb-1">
                    Số báo danh (tùy chọn):
                  </label>
                  <input
                    type="text"
                    value={localStudentId}
                    onChange={(e) =>
                      handleStudentFieldChange(localName, localClass, e.target.value)
                    }
                    placeholder="VD: 1201"
                    className="w-full px-3 py-2 rounded-xl bg-white text-slate-900 font-mono font-bold text-xs sm:text-sm border border-emerald-400 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px]">
                <span className="text-emerald-300 font-medium">Chọn nhanh lớp:</span>
                {QUICK_CLASSES.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => handleStudentFieldChange(localName, cls, localStudentId)}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer border ${
                      localClass === cls
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-emerald-900/80 text-emerald-100 border-emerald-700 hover:bg-emerald-800'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Exam Header Description */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <span className="text-xs font-semibold text-emerald-800">ĐỀ THAM KHẢO</span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                    {exam.title}
                  </h2>
                  <p className="text-xs text-slate-600">
                    Bài thi: CÔNG NGHỆ (ĐỊNH HƯỚNG NÔNG NGHIỆP)
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">MÃ ĐỀ THI</div>
                  <div className="text-xl font-mono font-extrabold text-emerald-800">{exam.code}</div>
                </div>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p>• Thời gian làm bài: <strong>{effectiveDuration} phút</strong>, không kể thời gian phát đề.</p>
                {exam.partII.length > 0 ? (
                  <p>• Đề thi gồm 2 phần: <strong>Phần I ({exam.partI.length} câu trắc nghiệm nhiều lựa chọn - {totalPartIPointsLabel} điểm)</strong> và <strong>Phần II ({exam.partII.length} câu trắc nghiệm đúng sai tình huống - {(exam.partII.length * 1.0).toFixed(1).replace('.', ',')} điểm)</strong>.</p>
                ) : (
                  <p>• Đề thi gồm: <strong>{exam.partI.length} câu trắc nghiệm nhiều phương án lựa chọn</strong> ({exam.description || 'Bộ sách Kết nối tri thức với cuộc sống'}).</p>
                )}
                <p>• Tổng điểm toàn bài: <strong>10,0 điểm</strong>.</p>
              </div>
            </div>

            {/* PART I: MULTIPLE CHOICE QUESTIONS */}
            {exam.partI.length > 0 && (
            <section id="part-1-section" className="space-y-6">
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-emerald-950">
                      PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn
                    </h3>
                    <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                      Thí sinh trả lời từ <strong>câu 1 đến câu {exam.partI.length}</strong>. Mỗi câu hỏi thí sinh chỉ chọn một phương án.
                      Mỗi câu trả lời đúng được <strong>{pointPerPartILabel} điểm</strong> (Tổng điểm Phần I: {totalPartIPointsLabel} điểm).
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-900 shrink-0 tabular-nums">
                    {exam.partI.length} câu · {totalPartIPointsLabel} điểm
                  </span>
                </div>
              </div>

              {/* Render Part I Questions */}
              {exam.partI.map((q) => {
                const isSelected = partIAnswers[q.id];
                const isFlagged = bookmarked[q.id];

                // Group indicator helper
                const getDomainBadge = () => {
                  const levelLabel =
                    q.level === 'NB' ? 'Nhận biết' : q.level === 'TH' ? 'Thông hiểu' : 'Vận dụng';
                  if (q.textbookRef && q.grade === '10' && exam.partII.length === 0) {
                    const chMatch = q.textbookRef.split('–')[0]?.trim() || 'Công nghệ 10 · Trồng trọt';
                    return `${chMatch} · ${levelLabel}`;
                  }
                  if (q.grade === '10') return `Công nghệ 10 · Trồng trọt · ${levelLabel}`;
                  if (q.grade === '11') return `Công nghệ 11 · Chăn nuôi · ${levelLabel}`;
                  return `Công nghệ 12 · ${q.domain === 'forestry' ? 'Lâm nghiệp' : 'Thủy sản'} · ${levelLabel}`;
                };

                return (
                  <div
                    key={q.id}
                    id={`q-${q.number}`}
                    className={`bg-white rounded-xl border transition-all p-5 sm:p-6 ${
                      isFlagged
                        ? 'border-amber-300 ring-1 ring-amber-200 shadow-sm'
                        : isSelected
                        ? 'border-emerald-300 ring-1 ring-emerald-100 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Question Header & Metadata */}
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-500 mb-3 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">Câu {q.number}.</span>
                        <span aria-hidden="true">·</span>
                        <span>{getDomainBadge()}</span>
                        {q.chartData && (
                          <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
                            Vận dụng · Phân tích biểu đồ
                          </span>
                        )}
                        {q.tableData && (
                          <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
                            Vận dụng · Phân tích số liệu
                          </span>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-emerald-700">{pointPerPartILabel} điểm</span>
                      </div>
                      <button
                        onClick={() => toggleBookmark(q.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          isFlagged
                            ? 'bg-amber-100 text-amber-800'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                        title="Đánh dấu câu hỏi này để xem lại"
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                        <span className="hidden sm:inline">{isFlagged ? 'Đã đánh dấu' : 'Đánh dấu'}</span>
                      </button>
                    </div>

                    {/* Question Content */}
                    {(() => {
                      const inlineTbl =
                        !q.tableData &&
                        q.question &&
                        (q.question.includes('\t') || q.question.includes('|'))
                          ? extractTableAndCitationFromBlock(q.question)
                          : null;
                      const displayStem = inlineTbl?.tableData ? inlineTbl.cleanedText : q.question;
                      const resolvedTables = [
                        ...(q.tableData
                          ? [q.tableData]
                          : inlineTbl?.tableData
                          ? [inlineTbl.tableData, ...(inlineTbl.extraTables || [])]
                          : []),
                        ...(q.extraTables || []),
                      ];
                      const resolvedCharts = [
                        ...(q.chartData ? [q.chartData] : []),
                        ...(q.extraCharts || []),
                      ];
                      return (
                    <div className="space-y-2.5 mb-4">
                      <p className="text-slate-900 font-medium text-base leading-relaxed whitespace-pre-line">
                        {displayStem}
                      </p>

                      {(() => {
                        const qImgs = q.images && q.images.length > 0 ? q.images : q.imageUrl ? [q.imageUrl] : [];
                        if (qImgs.length === 0) return null;
                        return (
                          <div className={`grid gap-3 my-2 ${qImgs.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                            {qImgs.map((src, idx) => (
                              <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 flex justify-center">
                                <img
                                  src={src}
                                  alt={`Hình minh họa Câu ${q.number} (${idx + 1})`}
                                  className="max-h-80 w-auto object-contain rounded"
                                />
                              </div>
                            ))}
                          </div>
                        );
                      })()}

                      {q.subStatements && (
                        <div className="pl-3.5 space-y-1 text-sm text-slate-800 border-l-2 border-slate-300">
                          {q.subStatements.map((stmt, idx) => (
                            <p key={idx}>{stmt}</p>
                          ))}
                        </div>
                      )}

                      {resolvedCharts.map((ch, cIdx) => (
                        <DocumentChart key={cIdx} chartData={ch} className="my-3 shadow-2xs" />
                      ))}

                      {resolvedTables.map((tbl, tIdx) => (
                        <DocumentTable key={tIdx} tableData={tbl} className="my-2" />
                      ))}

                      {q.questionFooter && (
                        <p className="text-slate-900 font-semibold text-sm sm:text-base">
                          {q.questionFooter}
                        </p>
                      )}
                    </div>
                      );
                    })()}

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 items-stretch">
                      {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                        const optText = q.options[optKey];
                        const isChosen = isSelected === optKey;

                        return (
                          <button
                            key={optKey}
                            onClick={() => selectPartIOption(q.id, optKey)}
                            className={`w-full h-full text-left p-3.5 rounded-lg border transition-all flex items-start gap-3 group active:scale-[0.99] ${
                              isChosen
                                ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 font-medium shadow-xs'
                                : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/70 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                                isChosen
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-white border border-slate-300 text-slate-600 group-hover:border-slate-400'
                              }`}
                            >
                              {optKey}
                            </span>
                            <span className="text-sm pt-0.5 leading-snug flex-1">{optText}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>
            )}

            {/* PART II: TRUE/FALSE CASE STUDIES */}
            {exam.partII.length > 0 && (
            <section id="part-2-section" className="space-y-6 pt-6">
              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-amber-950">
                      PHẦN II. Câu trắc nghiệm đúng sai (Tình huống thực tiễn)
                    </h3>
                    <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                      Thí sinh trả lời từ <strong>câu 1 đến câu {exam.partII.length}</strong>.
                      Trong mỗi ý <strong>a), b), c), d)</strong> ở mỗi câu, thí sinh chọn <strong>Đúng</strong> hoặc <strong>Sai</strong>.
                    </p>
                    <p className="text-xs font-semibold text-amber-950 mt-1">
                      Thang điểm: Đúng 1 ý: 0,1 điểm · Đúng 2 ý: 0,25 điểm · Đúng 3 ý: 0,5 điểm · Đúng 4 ý: 1,0 điểm.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-amber-900 shrink-0 tabular-nums">
                    {exam.partII.length} câu · {totalPartIIPointsLabel} điểm
                  </span>
                </div>
              </div>

              {exam.partII.map((tfQ) => {
                const isFlagged = bookmarked[tfQ.id];
                const currentAns = partIIAnswers[tfQ.id] || { a: null, b: null, c: null, d: null };

                return (
                  <div
                    key={tfQ.id}
                    id={`q-tf-${tfQ.number}`}
                    className={`bg-white rounded-xl border transition-all p-5 sm:p-6 ${
                      isFlagged
                        ? 'border-amber-300 ring-1 ring-amber-200 shadow-sm'
                        : isPartIIFullyDone(tfQ.id)
                        ? 'border-emerald-300 ring-1 ring-emerald-100 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-500 mb-3 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">
                          Câu {tfQ.number} (Phần II)
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Công nghệ 12 · {tfQ.domain === 'forestry' ? 'Lâm nghiệp' : 'Thủy sản'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-emerald-700">Tối đa 1,0 điểm</span>
                      </div>
                      <button
                        onClick={() => toggleBookmark(tfQ.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          isFlagged
                            ? 'bg-amber-100 text-amber-800'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                        title="Đánh dấu câu hỏi này để xem lại"
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                        <span className="hidden sm:inline">{isFlagged ? 'Đã đánh dấu' : 'Đánh dấu'}</span>
                      </button>
                    </div>

                    {/* Scenario Title, Real-World Context, Table, Chart & Scientific Citation */}
                    <TrueFalseScenarioDisplay question={tfQ} />

                    {/* 4 Statements (a, b, c, d) with exact cognitive levels: 1 NB, 1 TH, 2 VD */}
                    <div className="space-y-4">
                      {tfQ.statements.map((stmt) => {
                        const userChoice = currentAns[stmt.subId];

                        const levelLabel =
                          stmt.level === 'NB'
                            ? 'Nhận biết'
                            : stmt.level === 'TH'
                            ? 'Thông hiểu'
                            : 'Vận dụng';

                        return (
                          <div
                            key={stmt.subId}
                            className={`p-3.5 rounded-lg border transition-all ${
                              userChoice !== null
                                ? 'bg-slate-50/70 border-slate-300'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="text-sm text-slate-900 leading-relaxed pr-2">
                                <span className="font-bold text-slate-900 mr-2">
                                  {stmt.subId})
                                </span>
                                <span className="text-xs text-slate-500 mr-2">[{levelLabel}]</span>
                                {stmt.text}
                              </div>

                              {/* Segmented True / False Buttons */}
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => selectPartIIOption(tfQ.id, stmt.subId, true)}
                                  className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all border ${
                                    userChoice === true
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Đúng</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => selectPartIIOption(tfQ.id, stmt.subId, false)}
                                  className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all border ${
                                    userChoice === false
                                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                                  }`}
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Sai</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>
            )}

            {/* PART III: SHORT ANSWER / ESSAY (when present in uploaded PDF/Word exams) */}
            {exam.partIII && exam.partIII.length > 0 && (
            <section id="part-3-section" className="space-y-6 pt-6">
              <div className="bg-sky-50/70 p-4 rounded-xl border border-sky-200/80">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-sky-950">
                      PHẦN III. Câu hỏi trả lời ngắn / Tự luận
                    </h3>
                    <p className="text-xs text-sky-900 mt-1 leading-relaxed">
                      Thí sinh trả lời từ <strong>câu 1 đến câu {exam.partIII.length}</strong> theo nội dung đề thi gốc.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-sky-900 shrink-0 tabular-nums">
                    {exam.partIII.length} câu
                  </span>
                </div>
              </div>

              {exam.partIII.map((saQ) => {
                const saImgs =
                  saQ.images && saQ.images.length > 0
                    ? saQ.images
                    : saQ.imageUrl
                    ? [saQ.imageUrl]
                    : [];
                const resolvedTables = [
                  ...(saQ.tableData ? [saQ.tableData] : []),
                  ...(saQ.extraTables || []),
                ];
                const resolvedCharts = [
                  ...(saQ.chartData ? [saQ.chartData] : []),
                  ...(saQ.extraCharts || []),
                ];
                return (
                  <div
                    key={saQ.id}
                    id={`q-sa-${saQ.number}`}
                    className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all p-5 sm:p-6 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-500 border-b border-slate-100 pb-2.5">
                      <span className="font-bold text-slate-900 text-sm">
                        Câu {saQ.originalNumber || saQ.number} (Phần III)
                      </span>
                      <span className="text-sky-700 font-medium">Trả lời ngắn / Tự luận</span>
                    </div>
                    <div className="text-sm text-slate-900 leading-relaxed whitespace-pre-line">
                      {saQ.question}
                    </div>
                    {saImgs.length > 0 && (
                      <div className="flex flex-wrap gap-3 justify-center py-1">
                        {saImgs.map((src, idx) => (
                          <img
                            key={idx}
                            src={src}
                            alt={`Hình Câu ${saQ.number} Phần III (${idx + 1})`}
                            className="max-h-64 w-auto object-contain rounded border border-slate-200 bg-slate-50 p-1"
                          />
                        ))}
                      </div>
                    )}
                    {resolvedCharts.map((ch, cIdx) => (
                      <DocumentChart key={cIdx} chartData={ch} className="my-2" />
                    ))}
                    {resolvedTables.map((tbl, tIdx) => (
                      <DocumentTable key={tIdx} tableData={tbl} className="my-2" />
                    ))}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Câu trả lời của bạn:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Nhập đáp án hoặc ghi chú lời giải..."
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                      />
                    </div>
                  </div>
                );
              })}
            </section>
            )}
          </div>

          {/* Sticky Sidebar: Question Palette & Navigation (1 Col) */}
          <div id="question-palette-sidebar" className="lg:col-span-1">
            <div className="sticky top-20 bg-white p-5 rounded-xl border border-slate-200 space-y-6">
              {/* Palette Summary */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Phiếu Trả Lời Điện Tử
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] mb-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <span className="block text-slate-500 font-medium">Chưa làm</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {exam.partI.length - partIAnsweredCount + (exam.partII.length * 4 - partIIAnsweredCount)}
                    </span>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="block text-emerald-700 font-medium">Đã làm</span>
                    <span className="font-bold text-emerald-800 text-sm">
                      {partIAnsweredCount + Math.floor(partIIAnsweredCount / 4)}
                    </span>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                    <span className="block text-amber-700 font-medium">Đánh dấu</span>
                    <span className="font-bold text-amber-800 text-sm">
                      {Object.values(bookmarked).filter(Boolean).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Part I Question Quick-Jump Matrix */}
              {exam.partI.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-2">
                  <span>Phần I: Trắc nghiệm (1 - {exam.partI.length})</span>
                  <span className="tabular-nums font-normal text-slate-500">
                    {partIAnsweredCount}/{exam.partI.length}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {exam.partI.map((q) => {
                    const ans = partIAnswers[q.id];
                    const isFlagged = bookmarked[q.id];

                    return (
                      <button
                        key={q.id}
                        onClick={() => scrollToQuestion(`q-${q.number}`)}
                        className={`h-8 rounded text-xs font-bold transition-all relative ${
                          isFlagged
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : ans !== null
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                        title={`Câu ${q.number}: ${ans ? `Đã chọn ${ans}` : 'Chưa chọn'}`}
                      >
                        {q.number}
                        {isFlagged && (
                          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              )}

              {/* Part II Question Quick-Jump Matrix */}
              {exam.partII.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-2">
                  <span>Phần II: Đúng / Sai (1 - {exam.partII.length})</span>
                  <span className="tabular-nums font-normal text-slate-500">
                    {partIIAnsweredCount}/{exam.partII.length * 4} ý
                  </span>
                </div>
                <div className="space-y-2">
                  {exam.partII.map((tfQ) => {
                    const ans = partIIAnswers[tfQ.id] || { a: null, b: null, c: null, d: null };
                    const isFlagged = bookmarked[tfQ.id];
                    const doneCount = (['a', 'b', 'c', 'd'] as const).filter((s) => ans[s] !== null).length;

                    return (
                      <div
                        key={tfQ.id}
                        onClick={() => scrollToQuestion(`q-tf-${tfQ.number}`)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between text-xs ${
                          isFlagged
                            ? 'bg-amber-50 border-amber-300'
                            : doneCount === 4
                            ? 'bg-emerald-50 border-emerald-300'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold text-slate-800">
                          Câu {tfQ.number} ({tfQ.domain === 'forestry' ? 'Lâm nghiệp' : 'Thủy sản'})
                        </div>
                        <div className="flex items-center gap-1.5">
                          {(['a', 'b', 'c', 'd'] as const).map((s) => (
                            <span
                              key={s}
                              className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                                ans[s] === true
                                  ? 'bg-emerald-600 text-white'
                                  : ans[s] === false
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-white border border-slate-300 text-slate-400'
                              }`}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              )}

              {/* Bottom Quick Action */}
              <div className="border-t border-slate-100 pt-4">
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="w-full py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 transition-all rounded-lg shadow-sm cursor-pointer"
                >
                  Nộp Bài Thi Ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smartphone / Tablet Fixed Bottom Quick Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xs border-t border-slate-200 px-3 py-2.5 shadow-lg flex items-center justify-between gap-2">
        <div className="text-xs min-w-0">
          <div className="font-bold text-slate-900 truncate">
            Đã làm:{' '}
            <span className="text-emerald-700 tabular-nums">
              {partIAnsweredCount}/{exam.partI.length} TN
              {exam.partII.length > 0 ? ` · ${partIIAnsweredCount}/${exam.partII.length * 4} Đ/S` : ''}
            </span>
          </div>
          {studentInfo?.name && (
            <div className="text-[11px] text-slate-500 truncate">
              TS: {studentInfo.name} ({studentInfo.studentClass})
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => scrollToQuestion('question-palette-sidebar')}
            className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 cursor-pointer"
          >
            Bảng câu hỏi
          </button>
          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs cursor-pointer"
          >
            Nộp Bài
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 my-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Xác nhận nộp bài thi</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Kiểm tra thông tin thí sinh và thống kê câu trả lời trước khi nộp bài:
            </p>

            {/* Student Name & Class confirmation inside Submit Modal */}
            <div className="bg-emerald-50/80 rounded-xl p-3.5 border border-emerald-200 space-y-2.5 mb-4 text-xs">
              <div>
                <label className="block font-bold text-emerald-950 mb-1">
                  Họ và tên thí sinh:
                </label>
                <input
                  type="text"
                  value={localName}
                  onChange={(e) =>
                    handleStudentFieldChange(e.target.value, localClass, localStudentId)
                  }
                  placeholder="Nhập họ và tên của em..."
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-emerald-950 mb-1">Lớp:</label>
                  <input
                    type="text"
                    value={localClass}
                    onChange={(e) =>
                      handleStudentFieldChange(localName, e.target.value, localStudentId)
                    }
                    placeholder="VD: 12A1"
                    className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-emerald-950 mb-1">Số báo danh:</label>
                  <input
                    type="text"
                    value={localStudentId}
                    onChange={(e) =>
                      handleStudentFieldChange(localName, localClass, e.target.value)
                    }
                    placeholder="Tùy chọn"
                    className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 mb-6 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Phần I (Trắc nghiệm):</span>
                <span className="font-bold text-slate-900">
                  {partIAnsweredCount} / {exam.partI.length} câu đã chọn
                </span>
              </div>
              {exam.partII.length > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Phần II (Đúng/Sai tình huống):</span>
                <span className="font-bold text-slate-900">
                  {partIIAnsweredCount} / {exam.partII.length * 4} ý đã chọn
                </span>
              </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Số câu phân vân (đánh dấu):</span>
                <span className="font-bold text-amber-700">
                  {Object.values(bookmarked).filter(Boolean).length} câu
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Thời gian còn lại:</span>
                <span className="font-mono font-bold text-emerald-800">
                  {formatTime(secondsRemaining)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Tiếp tục làm bài
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Đồng ý nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-Cheat: Warning Modal when Student leaves exam, splits screen, or shrinks window */}
      {isViolationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-rose-500 text-center relative overflow-hidden">
            {/* Top pulsing alert bar */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 animate-pulse" />

            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3.5 ring-8 ring-rose-50 shadow-inner">
              <AlertTriangle className="w-9 h-9 animate-bounce" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 mb-3">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>
                CẢNH BÁO THOÁT GIAO DIỆN LẦN {Math.min(violationCount, MAX_VIOLATIONS)} / {MAX_VIOLATIONS}
              </span>
            </div>

            {violationCount >= MAX_VIOLATIONS ? (
              <>
                <h3 className="text-xl sm:text-2xl font-black text-rose-700 tracking-tight mb-2">
                  THOÁT GIAO DIỆN 5 LẦN · HỆ THỐNG TỰ THU BÀI!
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 mb-4 leading-relaxed">
                  Học sinh đã thoát khỏi giao diện làm bài đủ <strong>5/5 lần</strong> ({violationReason}). Hệ thống tự động thu bài ngay lập tức và chấm điểm kết quả hiện tại.
                </p>
                <div className="bg-rose-100 border border-rose-300 rounded-2xl p-4 text-xs sm:text-sm font-bold text-rose-900 mb-5">
                  🚨 Hệ thống đang tự động thu bài và lưu kết quả...
                </div>
                <button
                  type="button"
                  onClick={() => executeFinalSubmit(MAX_VIOLATIONS, false)}
                  className="w-full py-3.5 px-6 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Xem Kết Quả Bài Thi Đã Thu</span>
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl sm:text-2xl font-black text-rose-700 tracking-tight mb-2 uppercase">
                  CẢNH BÁO: QUAY LẠI LÀM BÀI NGAY!
                </h3>

                <p className="text-xs sm:text-sm text-slate-700 mb-3.5 leading-relaxed">
                  Hệ thống phát hiện học sinh vừa thoát khỏi giao diện làm bài thi: <b className="text-rose-700 font-bold">{violationReason}</b>.
                </p>

                <div className="bg-rose-50/90 border-2 border-rose-300 rounded-2xl p-4 text-xs sm:text-sm text-rose-950 text-left space-y-2.5 mb-6">
                  <div className="flex items-start gap-2">
                    <span className="font-extrabold text-rose-700 shrink-0">⚠️ YÊU CẦU:</span>
                    <span>
                      Học sinh <strong>QUAY LẠI LÀM BÀI NGAY!</strong> Trong suốt thời gian làm bài, tuyệt đối không được thoát khỏi giao diện làm bài, chuyển tab hoặc mở ứng dụng khác.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-extrabold text-rose-700 shrink-0">🚨 QUY ĐỊNH THU BÀI:</span>
                    <span>
                      Thoát khỏi giao diện làm bài đủ <strong>5 lần</strong> hệ thống sẽ <strong>TỰ ĐỘNG THU BÀI</strong> ngay lập tức (Đã vi phạm: <strong className="text-rose-700 underline">{violationCount}/5 lần</strong> — chỉ còn <strong>{MAX_VIOLATIONS - violationCount} lần</strong> cảnh báo).
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    lastViolationTimeRef.current = Date.now();
                    isShrunkStateRef.current = false;
                    baseViewportRef.current = {
                      width: window.innerWidth,
                      height: window.innerHeight,
                    };
                    setIsViolationModalOpen(false);
                  }}
                  className="w-full py-3.5 px-6 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer ring-4 ring-rose-200"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>Quay Lại Làm Bài Ngay ({violationCount}/5)</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {isExitConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Bạn có chắc muốn thoát bài thi?</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Thời gian làm bài vẫn đang đếm ngược. Nếu thoát bài thi lúc này, toàn bộ câu trả lời chưa nộp sẽ bị mất và kết quả sẽ không được lưu. Vui lòng quay lại làm bài!
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onExit()}
                className="px-4 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                Vẫn muốn thoát
              </button>
              <button
                type="button"
                onClick={() => setIsExitConfirmModalOpen(false)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                Tiếp tục làm bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
