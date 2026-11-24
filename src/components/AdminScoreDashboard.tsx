import React, { useState, useEffect } from 'react';
import { StudentSubmission } from '../types/submission';
import {
  getAllSubmissions,
  fetchServerSubmissions,
  deleteSubmission,
  resetSubmissionsToDemo,
  calculateClassStats,
  exportSubmissionsToCSV,
  subscribeToLiveSubmissions,
  resolveSubmissionExamPaper,
} from '../services/submissionService';
import {
  Download,
  Printer,
  Search,
  Trash2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  BarChart3,
  BookOpen,
  RefreshCw,
  Bell,
  Sparkles,
  Wifi,
  Lock,
  FileText,
  Eye,
  X,
  HelpCircle,
} from 'lucide-react';
import { AuthUser } from '../types/auth';

interface AdminScoreDashboardProps {
  currentUser?: AuthUser | null;
  onOpenLogin?: (reason?: string) => void;
}

export const AdminScoreDashboard: React.FC<AdminScoreDashboardProps> = ({
  currentUser,
  onOpenLogin,
}) => {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [accountScope, setAccountScope] = useState<'mine' | 'all'>(() =>
    currentUser ? 'mine' : 'all'
  );
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedExamCode, setSelectedExamCode] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'scoreDesc' | 'scoreAsc' | 'timeDesc'>('timeDesc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [viewingSubmission, setViewingSubmission] = useState<StudentSubmission | null>(null);
  const [paperFilter, setPaperFilter] = useState<'all' | 'wrong' | 'correct'>('all');
  const [liveAlert, setLiveAlert] = useState<{
    studentName: string;
    studentClass: string;
    totalScore: number;
    submittedAt: string;
    teacherUsername?: string;
    teacherName?: string;
  } | null>(null);

  useEffect(() => {
    setAccountScope(currentUser ? 'mine' : 'all');
  }, [currentUser?.username]);

  const handleManualRefresh = async () => {
    setIsSyncing(true);
    try {
      const list = await fetchServerSubmissions();
      setSubmissions(list);
      setLastSyncedAt(new Date());
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // 1. Initial fast local load
    setSubmissions(getAllSubmissions());

    // 2. Real-time multi-device subscription (SSE + Polling Fallback)
    const unsubscribe = subscribeToLiveSubmissions(
      (newSub) => {
        const isForCurrentUser =
          currentUser &&
          newSub.teacherUsername &&
          newSub.teacherUsername.trim().toLowerCase() ===
            currentUser.username.trim().toLowerCase();

        if (isForCurrentUser) {
          setAccountScope('mine');
        }

        if (!currentUser || isForCurrentUser || currentUser.role === 'admin') {
          setNewlyAddedId(newSub.id);
          setLiveAlert({
            studentName: newSub.studentName,
            studentClass: newSub.studentClass,
            totalScore: newSub.totalScore,
            submittedAt: newSub.submittedAt,
            teacherUsername: newSub.teacherUsername,
            teacherName: newSub.teacherName,
          });
          setLastSyncedAt(new Date());
          setTimeout(() => setLiveAlert(null), 9000);
        }
      },
      (syncedList) => {
        setSubmissions(syncedList);
        setLastSyncedAt(new Date());
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.username, currentUser?.role]);

  const myAccountSubmissions = React.useMemo(() => {
    if (!currentUser) return [];
    const targetUser = currentUser.username.trim().toLowerCase();
    return submissions.filter(
      (s) => String(s.teacherUsername || '').trim().toLowerCase() === targetUser
    );
  }, [submissions, currentUser]);

  const baseSubmissions =
    currentUser && accountScope === 'mine' ? myAccountSubmissions : submissions;

  // Unique classes and exam codes for filtering
  const availableClasses = Array.from(new Set(baseSubmissions.map((s) => s.studentClass))).filter(Boolean);
  const availableExamCodes = Array.from(new Set(baseSubmissions.map((s) => s.examCode))).filter(Boolean);

  // Filtered and sorted submissions
  const filteredSubmissions = baseSubmissions
    .filter((s) => {
      const matchClass = selectedClass === 'all' || s.studentClass === selectedClass;
      const matchExam = selectedExamCode === 'all' || s.examCode === selectedExamCode;
      const matchSearch =
        searchQuery === '' ||
        s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.studentId && s.studentId.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchClass && matchExam && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'scoreDesc') return b.totalScore - a.totalScore;
      if (sortBy === 'scoreAsc') return a.totalScore - b.totalScore;
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

  const stats = calculateClassStats(filteredSubmissions);

  const handleDelete = async (id: string) => {
    if (!currentUser) {
      onOpenLogin?.('Vui lòng đăng nhập tài khoản để xóa kết quả bài thi!');
      return;
    }
    const updated = await deleteSubmission(id);
    setSubmissions(updated);
    setDeleteConfirmId(null);
    if (viewingSubmission?.id === id) {
      setViewingSubmission(null);
    }
  };

  const handleResetData = async () => {
    if (!currentUser) {
      onOpenLogin?.('Vui lòng đăng nhập tài khoản để khôi phục dữ liệu bài thi!');
      return;
    }
    if (window.confirm('Khôi phục danh sách dữ liệu nộp bài về mặc định trên hệ thống máy chủ?')) {
      const updated = await resetSubmissionsToDemo();
      setSubmissions(updated);
    }
  };

  const handleExportCSV = () => {
    if (!currentUser) {
      onOpenLogin?.('Vui lòng đăng nhập tài khoản để xuất file bảng điểm Excel CSV!');
      return;
    }
    exportSubmissionsToCSV(filteredSubmissions, selectedClass === 'all' ? 'ToanTruong' : selectedClass);
  };

  const handlePrint = () => {
    if (!currentUser) {
      onOpenLogin?.('Vui lòng đăng nhập tài khoản để in bảng điểm!');
      return;
    }
    window.print();
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}p ${s.toString().padStart(2, '0')}s`;
  };

  const activeExamPaper = viewingSubmission ? resolveSubmissionExamPaper(viewingSubmission) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Trung Tâm Quản Lý Giáo Viên & Khảo Thí</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Bảng Điểm & Lưu Trữ Bài Làm Học Sinh
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Theo dõi phổ điểm, kết quả thi và xem lại chi tiết toàn bộ bài làm của từng học sinh nộp về hệ thống.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {!currentUser && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <Lock className="w-3 h-3 text-amber-700" />
                <span>Chế độ chỉ xem (Đăng nhập để thao tác dữ liệu)</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <Wifi className="w-3 h-3 text-emerald-700" />
              <span>Đồng bộ điểm & bài làm trực tiếp</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Cập nhật lần cuối: {lastSyncedAt.toLocaleTimeString('vi-VN')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleManualRefresh}
            disabled={isSyncing}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            title="Làm mới bảng điểm từ máy chủ trung tâm"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-700 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Đang tải...' : 'Làm Mới'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs border border-emerald-300"
            title="Tải bảng điểm kèm bài làm Excel (file CSV tiếng Việt)"
          >
            <Download className="w-4 h-4 text-emerald-800" />
            <span>Xuất Excel (Kèm Bài Làm)</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>In Bảng Điểm</span>
          </button>
          <button
            onClick={handleResetData}
            className="p-2 text-xs font-medium text-slate-500 hover:text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            title="Khôi phục danh sách điểm mẫu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Account Scoreboard Scope Banner (Đồng bộ kết quả giao bài về bảng điểm của tài khoản người dùng) */}
      {currentUser && (
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-emerald-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Đồng Bộ Tự Động Theo Tài Khoản Giao Đề</span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              Bảng Điểm Của Tài Khoản: {currentUser.fullName}{' '}
              <span className="font-mono text-emerald-300 text-sm">(@{currentUser.username})</span>
            </h2>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Khi bạn tạo <strong>Mã QR</strong> để giao bài cho học sinh, kết quả điểm số và chi tiết bài làm của học sinh sẽ tự động đồng bộ trực tiếp về bảng điểm của tài khoản <strong>@{currentUser.username}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 bg-emerald-950/80 p-1.5 rounded-xl border border-emerald-800">
            <button
              type="button"
              onClick={() => {
                setAccountScope('mine');
                setSelectedClass('all');
                setSelectedExamCode('all');
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                accountScope === 'mine'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-900'
              }`}
            >
              <span>Học sinh của @{currentUser.username}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono ${
                  accountScope === 'mine'
                    ? 'bg-slate-950 text-amber-300'
                    : 'bg-emerald-800 text-emerald-200'
                }`}
              >
                {myAccountSubmissions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountScope('all');
                setSelectedClass('all');
                setSelectedExamCode('all');
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                accountScope === 'all'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-200 hover:bg-emerald-900'
              }`}
            >
              <span>Tất cả / Dữ liệu mẫu</span>
              <span className="px-1.5 py-0.2 rounded-full text-[11px] font-mono bg-emerald-800 text-emerald-200">
                {submissions.length}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Live Sync Alert Banner when any student submits */}
      {liveAlert && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded">
                  ✓ Vừa đồng bộ bài làm mới của học sinh
                </span>
                {liveAlert.teacherUsername && (
                  <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-mono">
                    Tài khoản giao bài: @{liveAlert.teacherUsername}
                  </span>
                )}
                <span className="text-xs text-emerald-700">
                  {new Date(liveAlert.submittedAt).toLocaleTimeString('vi-VN')}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">
                Thí sinh <strong className="text-emerald-900">{liveAlert.studentName}</strong> (Lớp{' '}
                <strong className="text-emerald-900">{liveAlert.studentClass}</strong>) vừa nộp bài và đạt{' '}
                <span className="text-emerald-800 font-extrabold text-base">{liveAlert.totalScore}/10,0</span> điểm. Kết quả và chi tiết bài làm đã được đồng bộ vào bảng điểm!
              </p>
            </div>
          </div>
          <button
            onClick={() => setLiveAlert(null)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg hover:bg-emerald-100/60"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Class Statistics Overview Cards (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs font-medium block">Tổng Thí Sinh Nộp Bài</span>
          <div className="mt-2 text-3xl font-extrabold text-slate-900 tabular-nums">
            {stats.totalStudents}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Đã lưu điểm & bài làm</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
          <span className="text-emerald-800 text-xs font-bold block">Điểm Trung Bình (ĐTB)</span>
          <div className="mt-2 text-3xl font-extrabold text-emerald-800 tabular-nums">
            {stats.averageScore.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">Thang điểm 10,0</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs font-medium block">Điểm Cao Nhất / Thấp Nhất</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
            <span className="text-emerald-700">{stats.highestScore.toFixed(2)}</span> /{' '}
            <span className="text-rose-700">{stats.lowestScore.toFixed(2)}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Biên độ điểm toàn lớp</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs font-medium block">Tỉ Lệ Đạt (≥ 5,0 điểm)</span>
          <div className="mt-2 text-3xl font-extrabold text-sky-800 tabular-nums">
            {stats.passRate}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Đạt chuẩn xét tốt nghiệp</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs font-medium block">Tỉ Lệ Giỏi (≥ 8,0 điểm)</span>
          <div className="mt-2 text-3xl font-extrabold text-amber-700 tabular-nums">
            {stats.goodRate}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Điểm xét tuyển đại học</span>
        </div>
      </div>

      {/* Score Distribution Visual Histogram */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Phổ Điểm Toàn Lớp (Score Distribution)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Phân khúc 5 mức điểm chuẩn
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 pt-1 text-center text-xs">
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
            <span className="text-rose-700 block font-bold text-[11px]">Dưới 5,0 đ</span>
            <strong className="text-base sm:text-lg font-mono text-rose-900 block mt-1">
              {stats.scoreDistribution.under5} HS
            </strong>
            <span className="text-[10px] text-rose-600">
              {stats.totalStudents ? ((stats.scoreDistribution.under5 / stats.totalStudents) * 100).toFixed(0) : 0}%
            </span>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
            <span className="text-amber-700 block font-bold text-[11px]">5,0 - 6,4 đ</span>
            <strong className="text-base sm:text-lg font-mono text-amber-900 block mt-1">
              {stats.scoreDistribution.from5to65} HS
            </strong>
            <span className="text-[10px] text-amber-600">
              {stats.totalStudents ? ((stats.scoreDistribution.from5to65 / stats.totalStudents) * 100).toFixed(0) : 0}%
            </span>
          </div>

          <div className="p-3 rounded-lg bg-sky-50 border border-sky-100">
            <span className="text-sky-700 block font-bold text-[11px]">6,5 - 7,9 đ</span>
            <strong className="text-base sm:text-lg font-mono text-sky-900 block mt-1">
              {stats.scoreDistribution.from65to8} HS
            </strong>
            <span className="text-[10px] text-sky-600">
              {stats.totalStudents ? ((stats.scoreDistribution.from65to8 / stats.totalStudents) * 100).toFixed(0) : 0}%
            </span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <span className="text-emerald-700 block font-bold text-[11px]">8,0 - 8,9 đ</span>
            <strong className="text-base sm:text-lg font-mono text-emerald-900 block mt-1">
              {stats.scoreDistribution.from8to9} HS
            </strong>
            <span className="text-[10px] text-emerald-600">
              {stats.totalStudents ? ((stats.scoreDistribution.from8to9 / stats.totalStudents) * 100).toFixed(0) : 0}%
            </span>
          </div>

          <div className="p-3 rounded-lg bg-teal-50 border border-teal-100">
            <span className="text-teal-700 block font-bold text-[11px]">9,0 - 10,0 đ</span>
            <strong className="text-base sm:text-lg font-mono text-teal-900 block mt-1">
              {stats.scoreDistribution.from9to10} HS
            </strong>
            <span className="text-[10px] text-teal-600">
              {stats.totalStudents ? ((stats.scoreDistribution.from9to10 / stats.totalStudents) * 100).toFixed(0) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Lớp:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">Tất cả các lớp ({baseSubmissions.length})</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Lớp {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Code Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Mã đề:</span>
            <select
              value={selectedExamCode}
              onChange={(e) => setSelectedExamCode(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">Tất cả mã đề</option>
              {availableExamCodes.map((code) => (
                <option key={code} value={code}>
                  Mã đề {code}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="scoreDesc">Điểm cao nhất trước</option>
              <option value="scoreAsc">Điểm thấp nhất trước</option>
              <option value="timeDesc">Mới nộp bài gần đây</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học sinh, SBD..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-800 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Main Table: Student Score Submissions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3.5 text-center">STT</th>
                <th className="py-3 px-3.5">Họ và Tên Học Sinh</th>
                <th className="py-3 px-3.5">Lớp</th>
                <th className="py-3 px-3.5">SBD</th>
                <th className="py-3 px-3.5">Mã Đề</th>
                <th className="py-3 px-3.5 text-right">Phần I (/6,0)</th>
                <th className="py-3 px-3.5 text-right">Phần II (/4,0)</th>
                <th className="py-3 px-3.5 text-right">Tổng Điểm</th>
                <th className="py-3 px-3.5 text-center">Xếp Loại</th>
                <th className="py-3 px-3.5 text-center">Bài Làm Học Sinh</th>
                <th className="py-3 px-3.5 text-right">Thời Gian</th>
                <th className="py-3 px-3.5">Ngày Giờ Nộp</th>
                <th className="py-3 px-3.5 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-10 px-4 text-center text-slate-500">
                    {currentUser && accountScope === 'mine' ? (
                      <div className="max-w-lg mx-auto space-y-2.5">
                        <p className="font-bold text-slate-800 text-sm">
                          Chưa có bài làm nào của học sinh nộp về bảng điểm của tài khoản @{currentUser.username}
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Khi bạn nhấn nút <strong>&quot;Mã QR&quot;</strong> ở bất kỳ đề thi hoặc chương ôn tập nào để giao bài cho học sinh, ngay khi học sinh nộp bài, kết quả điểm số và chi tiết bài làm sẽ tự động đồng bộ về bảng điểm này.
                        </p>
                        <button
                          type="button"
                          onClick={() => setAccountScope('all')}
                          className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold cursor-pointer"
                        >
                          <span>Xem bảng điểm mẫu toàn hệ thống ({submissions.length} bài)</span>
                        </button>
                      </div>
                    ) : (
                      <span className="italic">Không tìm thấy bài nộp nào phù hợp với bộ lọc.</span>
                    )}
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub, idx) => {
                  const isTopScore = sub.totalScore >= 9.0;
                  const isLowScore = sub.totalScore < 5.0;
                  const isNewlySubmitted =
                    sub.id === newlyAddedId ||
                    Date.now() - new Date(sub.submittedAt).getTime() < 300000;

                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isNewlySubmitted
                          ? 'bg-emerald-50/80 ring-1 ring-inset ring-emerald-300'
                          : isTopScore
                          ? 'bg-emerald-50/20'
                          : isLowScore
                          ? 'bg-rose-50/20'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-3.5 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setPaperFilter('all');
                              setViewingSubmission(sub);
                            }}
                            className="hover:text-emerald-700 hover:underline text-left font-bold"
                            title="Nhấn để xem bài làm chi tiết của học sinh"
                          >
                            {sub.studentName}
                          </button>
                          {isNewlySubmitted && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-emerald-700 text-white animate-pulse shadow-2xs">
                              <Sparkles className="w-2.5 h-2.5" /> Mới nộp
                            </span>
                          )}
                          {(sub.isAutoCollected || (sub.violationCount !== undefined && sub.violationCount >= 5)) ? (
                            <span
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-rose-600 text-white shadow-2xs"
                              title="Học sinh thoát khỏi giao diện làm bài đủ 5 lần nên hệ thống tự động thu bài"
                            >
                              🚨 Tự thu bài (5/5 lần thoát)
                            </span>
                          ) : sub.violationCount !== undefined && sub.violationCount > 0 ? (
                            <span
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300"
                              title={`Học sinh thoát giao diện làm bài ${sub.violationCount}/5 lần`}
                            >
                              ⚠️ Thoát {sub.violationCount}/5 lần
                            </span>
                          ) : null}
                        </div>
                        {(sub.teacherUsername || sub.teacherName) && (
                          <div className="text-[10px] font-medium text-emerald-700 mt-0.5">
                            GV giao bài:{' '}
                            <span className="font-bold">
                              {sub.teacherName
                                ? `${sub.teacherName} (@${sub.teacherUsername || ''})`
                                : `@${sub.teacherUsername}`}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-emerald-800 whitespace-nowrap">
                        {sub.studentClass}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-slate-500">
                        {sub.studentId || '—'}
                      </td>
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-700">
                        {sub.examCode}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums">
                        {sub.partIScore.toFixed(2)}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({sub.partICorrectCount}/24)
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums">
                        {sub.partIIScore.toFixed(2)}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({sub.partIICorrectCount}/16)
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-extrabold text-sm tabular-nums">
                        <span
                          className={
                            isTopScore
                              ? 'text-emerald-700'
                              : isLowScore
                              ? 'text-rose-700'
                              : 'text-slate-900'
                          }
                        >
                          {sub.totalScore.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            sub.rank === 'Xuất sắc'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : sub.rank === 'Giỏi'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : sub.rank === 'Khá'
                              ? 'bg-sky-50 text-sky-800 border-sky-300'
                              : sub.rank === 'Trung bình'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          {sub.rank}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setPaperFilter('all');
                            setViewingSubmission(sub);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs"
                          title="Xem chi tiết bài làm và đáp án của học sinh"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Xem bài làm</span>
                        </button>
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono text-slate-600 whitespace-nowrap">
                        {formatSeconds(sub.timeSpentSeconds)}
                      </td>
                      <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                        {new Date(sub.submittedAt).toLocaleString('vi-VN', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        {deleteConfirmId === sub.id ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold"
                            >
                              Xóa
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(sub.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa bài thi này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <span>
            Hiển thị <strong>{filteredSubmissions.length}</strong> / <strong>{submissions.length}</strong> bài nộp (Nhấn vào <strong>"Xem bài làm"</strong> để kiểm tra chi tiết từng câu của học sinh)
          </span>
          <span className="text-[11px] text-slate-400">
            Hệ thống tự động ghi nhận điểm số kèm toàn bộ bài làm của học sinh khi nộp bài
          </span>
        </div>
      </div>

      {/* Modal Xem Chi Tiết Bài Làm Của Học Sinh */}
      {viewingSubmission && activeExamPaper && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={() => setViewingSubmission(null)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-emerald-950 text-white px-5 py-4 flex items-start sm:items-center justify-between gap-4 shrink-0">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-300 font-bold uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>Hồ Sơ Bài Làm Của Học Sinh • Mã Đề {viewingSubmission.examCode}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                  {viewingSubmission.studentName} — Lớp {viewingSubmission.studentClass}
                  {viewingSubmission.studentId ? ` (SBD: ${viewingSubmission.studentId})` : ''}
                </h2>
                <p className="text-xs text-emerald-200 mt-0.5">
                  {viewingSubmission.examTitle} • Thời gian làm: {formatSeconds(viewingSubmission.timeSpentSeconds)} • Nộp lúc:{' '}
                  {new Date(viewingSubmission.submittedAt).toLocaleString('vi-VN')}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">In bài làm</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingSubmission(null)}
                  className="p-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors"
                  title="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 bg-slate-50/60">
              {/* Summary Score Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">
                    Tổng Điểm Bài Thi
                  </span>
                  <div className="text-2xl font-extrabold text-emerald-700 mt-1 font-mono">
                    {viewingSubmission.totalScore.toFixed(2)} <span className="text-xs font-normal text-slate-400">/ 10,0</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800">
                    Xếp loại: {viewingSubmission.rank}
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">
                    Phần I (Trắc Nghiệm)
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                    {viewingSubmission.partIScore.toFixed(2)} đ
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Đúng <strong>{viewingSubmission.partICorrectCount}</strong> / 24 câu
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">
                    Phần II (Đúng / Sai)
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                    {viewingSubmission.partIIScore.toFixed(2)} đ
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Đúng <strong>{viewingSubmission.partIICorrectCount}</strong> / 16 ý
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">
                    Thời Gian Hoàn Thành
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>{formatSeconds(viewingSubmission.timeSpentSeconds)}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Mã đề: <strong>{viewingSubmission.examCode}</strong>
                  </span>
                </div>
              </div>

              {/* Quick Answer Sheet (Phiếu trả lời trắc nghiệm tóm tắt) */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>Phiếu Trả Lời Trắc Nghiệm Của Học Sinh</span>
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] font-semibold">
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block"></span> Làm đúng
                    </span>
                    <span className="inline-flex items-center gap-1 text-rose-700">
                      <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block"></span> Làm sai / Chưa chọn
                    </span>
                  </div>
                </div>

                {/* Part I Quick Grid */}
                <div>
                  <div className="text-[11px] font-bold text-slate-600 mb-2">
                    PHẦN I: 24 CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN (0,25 điểm/câu)
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 gap-2">
                    {activeExamPaper.partIDetails.map((item) => (
                      <div
                        key={item.questionId}
                        className={`p-2 rounded-lg border text-center text-xs ${
                          item.isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-rose-50 border-rose-300 text-rose-900'
                        }`}
                      >
                        <div className="text-[10px] font-bold text-slate-500">
                          Câu {item.questionNumber}
                        </div>
                        <div className="font-mono font-extrabold text-sm mt-0.5">
                          {item.selectedAnswer || '—'}
                        </div>
                        {!item.isCorrect && (
                          <div className="text-[10px] font-bold text-emerald-700">
                            ĐA: {item.correctAnswer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Part II Quick Grid */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-600 mb-2">
                    PHẦN II: 4 CÂU TRẮC NGHIỆM ĐÚNG / SAI (Tối đa 1,0 điểm/câu)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {activeExamPaper.partIIDetails.map((tf) => (
                      <div
                        key={tf.questionId}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-800">
                            Câu {tf.questionNumber} (Phần II)
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-bold text-[11px]">
                            +{tf.earnedScore.toFixed(2)} đ
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 text-center text-[11px]">
                          {tf.statements.map((st) => (
                            <div
                              key={st.subId}
                              className={`p-1.5 rounded border ${
                                st.isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                  : 'bg-rose-50 border-rose-300 text-rose-900'
                              }`}
                            >
                              <div className="font-bold text-[10px] text-slate-500">
                                Ý {st.subId})
                              </div>
                              <div className="font-extrabold">
                                {st.userChoice === null ? '—' : st.userChoice ? 'Đ' : 'S'}
                              </div>
                              {!st.isCorrect && (
                                <div className="text-[9px] font-bold text-emerald-700">
                                  ({st.correctChoice ? 'Đ' : 'S'})
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filter Tabs for Question Details */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Chi Tiết Từng Câu Hỏi & Bài Làm Của Học Sinh
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaperFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                      paperFilter === 'all'
                        ? 'bg-emerald-800 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Tất cả câu hỏi
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperFilter('wrong')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                      paperFilter === 'wrong'
                        ? 'bg-rose-700 text-white'
                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                    }`}
                  >
                    Chỉ câu làm sai
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperFilter('correct')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                      paperFilter === 'correct'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    Chỉ câu làm đúng
                  </button>
                </div>
              </div>

              {/* Detailed Part I Questions */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 px-1">
                  I. Chi Tiết Bài Làm Phần I — Trắc Nghiệm 4 Phương Án (24 Câu)
                </h4>
                {activeExamPaper.partIDetails
                  .filter((q) => {
                    if (paperFilter === 'wrong') return !q.isCorrect;
                    if (paperFilter === 'correct') return q.isCorrect;
                    return true;
                  })
                  .map((q) => (
                    <div
                      key={q.questionId}
                      className={`bg-white p-4 rounded-xl border shadow-2xs space-y-3 ${
                        q.isCorrect ? 'border-slate-200' : 'border-rose-300 bg-rose-50/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-xs sm:text-sm font-bold text-slate-900">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-slate-900 text-white text-xs font-mono mr-2">
                            Câu {q.questionNumber}
                          </span>
                          {q.questionText}
                        </div>
                        <span
                          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            q.isCorrect
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {q.isCorrect ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Đúng (+0,25đ)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-700" />
                              <span>Sai (0đ)</span>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                          const isSelected = q.selectedAnswer === optKey;
                          const isCorrectAnswer = q.correctAnswer === optKey;

                          let boxStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                          if (isSelected && isCorrectAnswer) {
                            boxStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold ring-1 ring-emerald-400';
                          } else if (isSelected && !isCorrectAnswer) {
                            boxStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-semibold ring-1 ring-rose-400';
                          } else if (!isSelected && isCorrectAnswer) {
                            boxStyle = 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-semibold';
                          }

                          return (
                            <div
                              key={optKey}
                              className={`p-2.5 rounded-lg border flex items-start justify-between gap-2 ${boxStyle}`}
                            >
                              <div>
                                <span className="font-mono font-extrabold mr-1.5">{optKey}.</span>
                                <span>{q.options[optKey]}</span>
                              </div>
                              <div className="shrink-0 flex flex-col items-end gap-0.5">
                                {isSelected && (
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      isCorrectAnswer
                                        ? 'bg-emerald-700 text-white'
                                        : 'bg-rose-700 text-white'
                                    }`}
                                  >
                                    HS chọn
                                  </span>
                                )}
                                {!isSelected && isCorrectAnswer && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    Đáp án đúng
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2">
                          <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-800">Giải thích:</strong> {q.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Detailed Part II Questions */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 px-1">
                  II. Chi Tiết Bài Làm Phần II — Trắc Nghiệm Đúng / Sai (4 Câu - 16 Ý)
                </h4>
                {activeExamPaper.partIIDetails
                  .filter((tf) => {
                    if (paperFilter === 'wrong') return tf.statements.some((s) => !s.isCorrect);
                    if (paperFilter === 'correct') return tf.statements.every((s) => s.isCorrect);
                    return true;
                  })
                  .map((tf) => (
                    <div
                      key={tf.questionId}
                      className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="text-sm font-extrabold text-slate-900">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-emerald-900 text-white text-xs font-mono mr-2">
                            Câu {tf.questionNumber} (Phần II)
                          </span>
                          {tf.scenarioTitle}
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono font-extrabold text-xs border border-emerald-300">
                          Điểm đạt được: +{tf.earnedScore.toFixed(2)} / 1,00 đ
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                        {tf.scenario}
                      </p>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                          <thead className="bg-slate-100 text-slate-700 font-bold">
                            <tr>
                              <th className="py-2 px-3 text-left">Phát biểu (Ý a, b, c, d)</th>
                              <th className="py-2 px-3 text-center w-28">Học sinh chọn</th>
                              <th className="py-2 px-3 text-center w-28">Đáp án chuẩn</th>
                              <th className="py-2 px-3 text-center w-24">Kết quả</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {tf.statements.map((st) => (
                              <tr
                                key={st.subId}
                                className={st.isCorrect ? 'bg-white' : 'bg-rose-50/40'}
                              >
                                <td className="py-2.5 px-3 text-slate-800">
                                  <strong className="font-mono mr-1">{st.subId})</strong> {st.text}
                                  {st.explanation && (
                                    <div className="text-[11px] text-slate-500 mt-1 italic">
                                      → Giải thích: {st.explanation}
                                    </div>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold">
                                  <span
                                    className={`px-2 py-0.5 rounded ${
                                      st.userChoice === null
                                        ? 'bg-slate-200 text-slate-600'
                                        : st.isCorrect
                                        ? 'bg-emerald-100 text-emerald-900'
                                        : 'bg-rose-100 text-rose-900'
                                    }`}
                                  >
                                    {st.userChoice === null
                                      ? 'Bỏ trống'
                                      : st.userChoice
                                      ? 'Đúng'
                                      : 'Sai'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold text-emerald-800">
                                  {st.correctChoice ? 'Đúng' : 'Sai'}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  {st.isCorrect ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                                      <XCircle className="w-3.5 h-3.5" /> Sai
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500">
                Bài làm được lưu trữ tự động kèm theo điểm thi của học sinh <strong>{viewingSubmission.studentName}</strong>
              </span>
              <button
                type="button"
                onClick={() => setViewingSubmission(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
