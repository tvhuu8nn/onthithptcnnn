import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Users,
  Eye,
  Clock,
  Monitor,
  Smartphone,
  Shield,
  Briefcase,
  GraduationCap,
  User,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Search,
  BarChart3,
  Globe,
  Sparkles,
  Layers,
  X,
  Download,
  FileText,
} from 'lucide-react';
import { AuthUser } from '../types/auth';
import { StudentProfile } from './StudentProfileCard';

export interface VisitLogEntry {
  id: string;
  sessionId: string;
  visitorId: string;
  username?: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'student' | 'guest';
  studentClass?: string;
  tab: string;
  tabLabel: string;
  action: string;
  deviceType: string;
  browser: string;
  os: string;
  timestamp: string;
}

export interface DownloadLogEntry {
  id: string;
  visitorId: string;
  username: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'student' | 'guest';
  studentClass?: string;
  fileName: string;
  documentTitle: string;
  category: string;
  categoryLabel: string;
  modeLabel: string;
  deviceType: string;
  browser: string;
  os: string;
  timestamp: string;
}

export interface UserDownloadStat {
  username: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'student' | 'guest';
  count: number;
  lastDownloadAt: string;
  lastFileName: string;
  lastDocumentTitle: string;
}

export interface ActiveVisitorSession {
  sessionId: string;
  visitorId: string;
  username?: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'student' | 'guest';
  studentClass?: string;
  currentTab: string;
  currentTabLabel: string;
  currentAction: string;
  deviceType: string;
  browser: string;
  os: string;
  connectedAt: string;
  lastActiveAt: number;
}

export interface VisitorStatsSnapshot {
  success: boolean;
  serverTime: string;
  totalVisits: number;
  todayVisits: number;
  uniqueVisitorsCount: number;
  onlineCount: number;
  activeSessions: ActiveVisitorSession[];
  tabViews: Record<string, number>;
  hourlyVisits: Record<string, number>;
  last7Days: Array<{ date: string; label: string; count: number; downloadsCount?: number }>;
  visitLogs: VisitLogEntry[];
  totalDownloads?: number;
  todayDownloads?: number;
  downloadsByCategory?: Record<string, number>;
  topDownloadUsers?: UserDownloadStat[];
  downloadLogs?: DownloadLogEntry[];
}

const DOWNLOAD_CATEGORY_LABELS: Record<string, string> = {
  de_thi_thpt: 'Kho 48 Đề Thi Mẫu THPT (.docx)',
  on_tap_chuong: 'Đề Cương Ôn Tập 24 Chương SGK (.docx)',
  de_lop_12: 'Bộ 4 Đề Chuẩn Mẫu 0716 Lớp 12 (.docx)',
  de_lop_11: 'Bộ 5 Đề Khảo Nghiệm Lớp 11 (.docx)',
  de_lop_10: 'Bộ 5 Đề Trắc Nghiệm Lớp 10 (.docx)',
};

const TAB_LABELS: Record<string, string> = {
  exams: 'Đề Tham Khảo',
  provincial_exams: 'Đề Thi Thử Các Tỉnh',
  official_exams: 'Đề Chính Thức Các Năm',
  provincial_official: 'Đề Thi Thử Tỉnh & Chính Thức Các Năm',
  chapter_review: 'Tài Nguyên (SGK 10·11·12)',
  mistakes: 'Câu Sai Nhiều',
  admin: 'Bảng Điểm',
  users: 'Quản Lý Người Dùng',
  traffic: 'Thống Kê Truy Cập',
  handbook: 'Sổ Tay KNTT',
  matrix: 'Ma Trận Đề',
  exam_taking: 'Đang Làm Bài Thi',
};

function detectClientDeviceInfo(): { deviceType: string; browser: string; os: string } {
  if (typeof navigator === 'undefined') {
    return { deviceType: 'Máy tính (PC/Laptop)', browser: 'Chrome', os: 'Windows' };
  }
  const ua = navigator.userAgent || '';
  let deviceType = 'Máy tính (PC/Laptop)';
  if (/iPad|Tablet/i.test(ua)) {
    deviceType = 'Máy tính bảng';
  } else if (/Mobile|Android|iPhone|iPod/i.test(ua)) {
    deviceType = 'Điện thoại';
  }

  let browser = 'Trình duyệt Web';
  if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Google Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Apple Safari';

  let os = 'Hệ điều hành';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X/i.test(ua) && !/iPhone|iPad/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return { deviceType, browser, os };
}

function getOrCreateVisitorId(): string {
  try {
    let vid = localStorage.getItem('agritech_visitor_id');
    if (!vid) {
      vid = `vis_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem('agritech_visitor_id', vid);
    }
    return vid;
  } catch {
    return `vis_${Date.now()}`;
  }
}

// Mỗi lần người dùng nhấp vào link mở Web App (tải trang mới) sẽ tạo 1 phiên truy cập riêng và tính 1 lượt
const PAGE_LOAD_SESSION_ID = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
let hasCountedPageLoadVisit = false;

interface RealtimeVisitorStatsCardProps {
  currentUser?: AuthUser | null;
  studentProfile?: StudentProfile;
  currentTab: string;
  isTakingExam?: boolean;
  activeExamCode?: string;
  defaultExpanded?: boolean;
  fullPageMode?: boolean;
  hiddenUI?: boolean;
}

export const RealtimeVisitorStatsCard: React.FC<RealtimeVisitorStatsCardProps> = ({
  currentUser,
  studentProfile,
  currentTab,
  isTakingExam = false,
  activeExamCode,
  defaultExpanded = false,
  fullPageMode = false,
  hiddenUI = false,
}) => {
  const [stats, setStats] = useState<VisitorStatsSnapshot>({
    success: true,
    serverTime: new Date().toISOString(),
    totalVisits: 1,
    todayVisits: 1,
    uniqueVisitorsCount: 1,
    onlineCount: 1,
    activeSessions: [],
    tabViews: {},
    hourlyVisits: {},
    last7Days: [],
    visitLogs: [],
    totalDownloads: 0,
    todayDownloads: 0,
    downloadsByCategory: {},
    topDownloadUsers: [],
    downloadLogs: [],
  });
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || fullPageMode);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'teacher' | 'student' | 'guest'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailSubTab, setDetailSubTab] = useState<'online' | 'downloads' | 'logs' | 'charts'>('online');

  const sessionIdRef = useRef<string>(PAGE_LOAD_SESSION_ID);
  const visitorIdRef = useRef<string>(getOrCreateVisitorId());
  const deviceInfoRef = useRef(detectClientDeviceInfo());

  const resolveIdentity = () => {
    const fullName =
      currentUser?.fullName ||
      studentProfile?.name?.trim() ||
      'Khách truy cập';
    const username = currentUser?.username || undefined;
    const role: 'admin' | 'teacher' | 'student' | 'guest' =
      currentUser?.role || (studentProfile?.name?.trim() ? 'student' : 'guest');
    const studentClass =
      currentUser?.className ||
      studentProfile?.studentClass?.trim() ||
      (role === 'student' ? 'Ôn THPT' : undefined);

    const effectiveTab = isTakingExam ? 'exam_taking' : currentTab;
    const tabLabel = isTakingExam
      ? `Đang làm bài thi (Mã đề ${activeExamCode || '101'})`
      : TAB_LABELS[currentTab] || 'Đề Tham Khảo';

    return { fullName, username, role, studentClass, effectiveTab, tabLabel };
  };

  const fetchSnapshot = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics/visitors', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          setStats(data);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch visitor stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const recordVisitEvent = async (actionText: string, isNewVisit = true) => {
    const identity = resolveIdentity();
    try {
      const res = await fetch('/api/analytics/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          visitorId: visitorIdRef.current,
          username: identity.username,
          fullName: identity.fullName,
          role: identity.role,
          studentClass: identity.studentClass,
          tab: identity.effectiveTab,
          tabLabel: identity.tabLabel,
          action: actionText,
          deviceType: deviceInfoRef.current.deviceType,
          browser: deviceInfoRef.current.browser,
          os: deviceInfoRef.current.os,
          isNewVisit,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          setStats(data);
        }
      }
    } catch (err) {
      console.warn('Failed to record visit:', err);
    }
  };

  const sendHeartbeat = async () => {
    const identity = resolveIdentity();
    try {
      const res = await fetch('/api/analytics/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          visitorId: visitorIdRef.current,
          username: identity.username,
          fullName: identity.fullName,
          role: identity.role,
          studentClass: identity.studentClass,
          tab: identity.effectiveTab,
          tabLabel: identity.tabLabel,
          action: `Đang xem: ${identity.tabLabel}`,
          deviceType: deviceInfoRef.current.deviceType,
          browser: deviceInfoRef.current.browser,
          os: deviceInfoRef.current.os,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          setStats(data);
        }
      }
    } catch {}
  };

  // 1. Ngay khi người dùng nhấp vào link mở Web App -> Tính ngay 1 lượt truy cập mới
  useEffect(() => {
    if (!hasCountedPageLoadVisit) {
      hasCountedPageLoadVisit = true;
      recordVisitEvent('Nhấp vào link truy cập Web App', true);
    } else {
      fetchSnapshot();
    }

    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/submissions/stream');
      es.onopen = () => setIsLiveConnected(true);
      es.addEventListener('visitor_stats_updated', (ev: MessageEvent) => {
        try {
          const parsed = JSON.parse(ev.data);
          if (parsed && parsed.success) {
            setStats(parsed);
            setIsLiveConnected(true);
          }
        } catch {}
      });
      es.onerror = () => {
        setIsLiveConnected(false);
      };
    } catch {}

    const heartbeatTimer = setInterval(() => {
      sendHeartbeat();
    }, 25000);

    const handleBeforeUnload = () => {
      try {
        const blob = new Blob([JSON.stringify({ sessionId: sessionIdRef.current })], {
          type: 'application/json',
        });
        navigator.sendBeacon?.('/api/analytics/leave', blob);
      } catch {}
    };
    const handleLocalUpdate = (ev: Event) => {
      const customEv = ev as CustomEvent;
      if (customEv.detail && customEv.detail.success) {
        setStats(customEv.detail);
      }
    };
    window.addEventListener('visitor_stats_local_updated', handleLocalUpdate);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeatTimer);
      window.removeEventListener('visitor_stats_local_updated', handleLocalUpdate);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (es) es.close();
    };
  }, []);

  // 2. Cập nhật trạng thái mục đang xem hoặc thông tin đăng nhập (không cộng dồn thêm lượt truy cập khi chỉ chuyển tab)
  useEffect(() => {
    if (!hasCountedPageLoadVisit) return;
    sendHeartbeat();
  }, [currentTab, isTakingExam, currentUser?.username, studentProfile?.name, studentProfile?.studentClass]);

  const formatTimeVi = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const formatDateVi = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const getRelativeSeconds = (timestampMsOrIso: number | string) => {
    const ms = typeof timestampMsOrIso === 'number' ? timestampMsOrIso : new Date(timestampMsOrIso).getTime();
    const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
    if (diffSec < 10) return 'Vừa xong';
    if (diffSec < 60) return `${diffSec} giây trước`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHour = Math.floor(diffMin / 60);
    return `${diffHour} giờ trước`;
  };

  const renderRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
          <Shield className="w-3 h-3 text-amber-700" />
          Admin
        </span>
      );
    }
    if (role === 'teacher') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
          <Briefcase className="w-3 h-3 text-emerald-700" />
          Giáo viên
        </span>
      );
    }
    if (role === 'student') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-200">
          <GraduationCap className="w-3 h-3 text-sky-700" />
          Học sinh
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <User className="w-3 h-3 text-slate-500" />
        Khách
      </span>
    );
  };

  const filteredLogs = (stats.visitLogs || []).filter((log) => {
    const matchRole = roleFilter === 'all' || log.role === roleFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchQuery =
      !q ||
      log.fullName.toLowerCase().includes(q) ||
      (log.username && log.username.toLowerCase().includes(q)) ||
      (log.studentClass && log.studentClass.toLowerCase().includes(q)) ||
      log.action.toLowerCase().includes(q) ||
      log.tabLabel.toLowerCase().includes(q) ||
      log.deviceType.toLowerCase().includes(q);
    return matchRole && matchQuery;
  });

  const activeSessionsList = stats.activeSessions || [];
  const onlineTeachersCount = activeSessionsList.filter((s) => s.role === 'teacher' || s.role === 'admin').length;
  const onlineStudentsCount = activeSessionsList.filter((s) => s.role === 'student').length;
  const onlineGuestsCount = activeSessionsList.filter((s) => s.role === 'guest').length;

  const tabStatsEntries = Object.entries(TAB_LABELS).map(([key, label]) => ({
    key,
    label,
    count: stats.tabViews?.[key] || 0,
  }));
  const maxTabView = Math.max(1, ...tabStatsEntries.map((t) => t.count));

  // Ẩn hoàn toàn thẻ trên giao diện người dùng (chỉ chạy ngầm ghi nhận lượt truy cập hoặc chỉ hiển thị cho Admin)
  if (hiddenUI || currentUser?.role !== 'admin') {
    return null;
  }

  return (
    <div className={fullPageMode ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6' : ''}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all hover:border-emerald-300">
        {/* Top Live Banner Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Thống Kê Số Lượt Người Dùng Truy Cập Theo Thời Gian Thực
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-3.5" />
                  <span>TRỰC TIẾP (LIVE)</span>
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80 mt-0.5">
                Cập nhật tự động số người đang trực tuyến, tổng lượt truy cập, thiết bị và nhật ký hoạt động chi tiết theo từng giây.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={fetchSnapshot}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Làm mới dữ liệu thống kê ngay"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>

            {!fullPageMode && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3.5 py-1.5 rounded-lg bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <span>{isExpanded ? 'Thu gọn chi tiết' : 'Xem chi tiết thời gian thực'}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* 5 Real-Time KPI Summary Cards (including Document Downloads) */}
        <div className="p-4 sm:p-5 bg-slate-50/60 grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Card 1: Currently Online */}
          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Đang Trực Tuyến
              </span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
                {Math.max(1, stats.onlineCount || activeSessionsList.length)}
              </span>
              <span className="text-xs font-semibold text-emerald-600">người đang mở</span>
            </div>
            <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5">
              <span>GV/Admin: <strong className="text-slate-700">{onlineTeachersCount}</strong></span>
              <span>·</span>
              <span>HS: <strong className="text-slate-700">{onlineStudentsCount}</strong></span>
              <span>·</span>
              <span>Khách: <strong className="text-slate-700">{onlineGuestsCount}</strong></span>
            </div>
          </div>

          {/* Card 2: Today Visits */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Lượt Truy Cập Hôm Nay</span>
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {(stats.todayVisits || 1).toLocaleString('vi-VN')}
              </span>
              <span className="text-xs text-slate-500">lượt hôm nay</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Ngày {formatDateVi(stats.serverTime || new Date().toISOString())}
            </div>
          </div>

          {/* Card 3: Total Visits */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Tổng Lượt Truy Cập</span>
              <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
                <Eye className="w-4 h-4" />
              </span>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {(stats.totalVisits || 1).toLocaleString('vi-VN')}
              </span>
              <span className="text-xs text-slate-500">tổng lượt xem</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Ghi nhận tự động trên toàn hệ thống
            </div>
          </div>

          {/* Card 4: Unique Visitors */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Người Dùng Duy Nhất</span>
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                <Globe className="w-4 h-4" />
              </span>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {(stats.uniqueVisitorsCount || 1).toLocaleString('vi-VN')}
              </span>
              <span className="text-xs text-slate-500">thiết bị / TK</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Cập nhật lúc {formatTimeVi(stats.serverTime || new Date().toISOString())}
            </div>
          </div>

          {/* Card 5: Document Downloads */}
          <div
            onClick={() => {
              setIsExpanded(true);
              setDetailSubTab('downloads');
            }}
            className="bg-gradient-to-br from-amber-50/90 via-white to-emerald-50/60 p-4 rounded-xl border-2 border-amber-300 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-emerald-500 transition-all col-span-2 lg:col-span-1"
            title="Nhấn để xem chi tiết thống kê lượt tải tài liệu (.docx)"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                Lượt Tải Tài Liệu
              </span>
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Download className="w-4 h-4" />
              </span>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-800 font-mono">
                {(stats.totalDownloads || 0).toLocaleString('vi-VN')}
              </span>
              <span className="text-xs font-bold text-amber-700">lượt tải (.docx)</span>
            </div>
            <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-1.5">
              <span>Hôm nay: <strong className="text-emerald-800">{stats.todayDownloads || 0}</strong></span>
              <span>·</span>
              <span>Tài khoản tải: <strong className="text-slate-800">{stats.topDownloadUsers?.length || 0}</strong></span>
            </div>
          </div>
        </div>

        {/* Detailed Real-Time Section */}
        {(isExpanded || fullPageMode) && (
          <div className="p-4 sm:p-6 border-t border-slate-200 space-y-5 animate-in fade-in">
            {/* Sub-navigation tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setDetailSubTab('online')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    detailSubTab === 'online'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Đang Online Trực Tiếp ({activeSessionsList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailSubTab('downloads')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    detailSubTab === 'downloads'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-amber-900 bg-amber-100/70 hover:bg-amber-200/70'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Thống Kê Lượt Tải Tài Liệu ({stats.totalDownloads || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailSubTab('logs')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    detailSubTab === 'logs'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Nhật Ký Truy Cập Chi Tiết ({stats.visitLogs?.length || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailSubTab('charts')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    detailSubTab === 'charts'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Thống Kê Theo Chuyên Mục & Ngày</span>
                </button>
              </div>

              {(detailSubTab === 'logs' || detailSubTab === 'downloads') && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm tên, tài khoản, tên tài liệu..."
                      className="pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e: any) => setRoleFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="all">Tất cả đối tượng</option>
                    <option value="admin">Admin</option>
                    <option value="teacher">Giáo viên</option>
                    <option value="student">Học sinh</option>
                    <option value="guest">Khách truy cập</option>
                  </select>
                </div>
              )}
            </div>

            {/* SUB-TAB: DOCUMENT DOWNLOAD STATISTICS */}
            {detailSubTab === 'downloads' && (
              <div className="space-y-5">
                {/* Top Row: Category Breakdown + User Download Leaderboard */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Category Breakdown */}
                  <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-amber-600" />
                        <span>Phân Loại Tài Liệu Đã Tải (.docx)</span>
                      </h4>
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        Tổng: {(stats.totalDownloads || 0).toLocaleString('vi-VN')} lượt
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {Object.entries(DOWNLOAD_CATEGORY_LABELS).map(([catKey, catLabel]) => {
                        const cnt = stats.downloadsByCategory?.[catKey] || 0;
                        const maxCat = Math.max(
                          1,
                          ...Object.keys(DOWNLOAD_CATEGORY_LABELS).map(
                            (k) => stats.downloadsByCategory?.[k] || 0
                          )
                        );
                        const pct = Math.min(100, Math.round((cnt / maxCat) * 100));
                        return (
                          <div key={catKey} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-700">{catLabel}</span>
                              <strong className="font-mono text-slate-900">
                                {cnt.toLocaleString('vi-VN')} lượt
                              </strong>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(pct, cnt > 0 ? 8 : 0)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Users by Download Count */}
                  <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-700" />
                        <span>Thống Kê Lượt Tải Theo Tài Khoản</span>
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {stats.topDownloadUsers?.length || 0} tài khoản đã tải
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white max-h-56 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] sticky top-0">
                          <tr>
                            <th className="py-2 px-3">#</th>
                            <th className="py-2 px-3">Tài Khoản</th>
                            <th className="py-2 px-3 text-center">Số Lượt Tải</th>
                            <th className="py-2 px-3">Tài Liệu Tải Gần Nhất</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {!stats.topDownloadUsers || stats.topDownloadUsers.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-6 text-center text-slate-400">
                                Chưa có lượt tải tài liệu nào được ghi nhận.
                              </td>
                            </tr>
                          ) : (
                            stats.topDownloadUsers.map((u, idx) => (
                              <tr key={u.username} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                                <td className="py-2 px-3">
                                  <div className="font-bold text-slate-900">{u.fullName}</div>
                                  <div className="text-[10px] font-mono text-slate-500">
                                    @{u.username}
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-200 font-mono">
                                    <Download className="w-3 h-3 text-amber-700" />
                                    {u.count}
                                  </span>
                                </td>
                                <td className="py-2 px-3">
                                  <div className="font-medium text-slate-800 line-clamp-1" title={u.lastDocumentTitle}>
                                    {u.lastDocumentTitle}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {formatTimeVi(u.lastDownloadAt)} · {formatDateVi(u.lastDownloadAt)}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Detailed Download Logs Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-emerald-700" />
                      <span>Nhật Ký Tải Tài Liệu Chi Tiết Theo Thời Gian Thực</span>
                    </h4>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-96 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] sticky top-0 z-10">
                        <tr>
                          <th className="py-3 px-3.5">Thời Gian Tải</th>
                          <th className="py-3 px-3.5">Người Tải Tài Liệu</th>
                          <th className="py-3 px-3.5">Vai Trò</th>
                          <th className="py-3 px-3.5">Tên Tài Liệu & Tệp Word (.docx)</th>
                          <th className="py-3 px-3.5">Loại Tài Liệu</th>
                          <th className="py-3 px-3.5">Thiết Bị</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(() => {
                          const dlLogs = (stats.downloadLogs || []).filter((item) => {
                            const matchRole = roleFilter === 'all' || item.role === roleFilter;
                            const q = searchQuery.trim().toLowerCase();
                            const matchQ =
                              !q ||
                              item.fullName.toLowerCase().includes(q) ||
                              item.username.toLowerCase().includes(q) ||
                              item.documentTitle.toLowerCase().includes(q) ||
                              item.fileName.toLowerCase().includes(q) ||
                              item.categoryLabel.toLowerCase().includes(q);
                            return matchRole && matchQ;
                          });

                          if (dlLogs.length === 0) {
                            return (
                              <tr>
                                <td colSpan={6} className="py-8 text-center text-slate-400">
                                  Chưa có lịch sử tải tài liệu nào khớp bộ lọc. Khi người dùng tải bất kỳ đề thi hoặc đề cương (.docx) nào, dữ liệu sẽ hiển thị trực tiếp tại đây.
                                </td>
                              </tr>
                            );
                          }

                          return dlLogs.map((dl) => (
                            <tr key={dl.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-3.5 font-mono whitespace-nowrap">
                                <div className="font-bold text-slate-800">
                                  {formatTimeVi(dl.timestamp)}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {formatDateVi(dl.timestamp)}
                                </div>
                              </td>
                              <td className="py-2.5 px-3.5">
                                <div className="font-bold text-slate-900">{dl.fullName}</div>
                                <div className="text-[10px] font-mono text-slate-500">
                                  @{dl.username}
                                </div>
                              </td>
                              <td className="py-2.5 px-3.5">{renderRoleBadge(dl.role)}</td>
                              <td className="py-2.5 px-3.5">
                                <div className="font-bold text-emerald-900">{dl.documentTitle}</div>
                                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                                  <FileText className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>{dl.fileName}</span>
                                  <span>·</span>
                                  <span className="text-emerald-700 font-sans font-semibold">{dl.modeLabel}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3.5">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-semibold text-[11px]">
                                  {dl.categoryLabel}
                                </span>
                              </td>
                              <td className="py-2.5 px-3.5 text-slate-600">
                                <div className="font-medium text-slate-800">{dl.deviceType}</div>
                                <div className="text-[10px] text-slate-400">
                                  {dl.browser} · {dl.os}
                                </div>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 1: CURRENTLY ONLINE ACTIVE SESSIONS */}
            {detailSubTab === 'online' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold">
                    Danh sách người dùng đang trực tuyến ngay lúc này (tự động cập nhật mỗi khi có người vào/ra hoặc chuyển trang):
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                      <tr>
                        <th className="py-3 px-3.5 w-10 text-center">#</th>
                        <th className="py-3 px-3.5">Người Dùng Đang Truy Cập</th>
                        <th className="py-3 px-3.5">Vai Trò</th>
                        <th className="py-3 px-3.5">Lớp / Đơn Vị</th>
                        <th className="py-3 px-3.5">Mục Đang Xem / Hoạt Động</th>
                        <th className="py-3 px-3.5">Thiết Bị & Trình Duyệt</th>
                        <th className="py-3 px-3.5 text-right">Trạng Thái Thực</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeSessionsList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            Đang đồng bộ danh sách người dùng trực tuyến...
                          </td>
                        </tr>
                      ) : (
                        activeSessionsList.map((sess, idx) => {
                          const isCurrentMe = sess.sessionId === sessionIdRef.current;
                          return (
                            <tr
                              key={sess.sessionId}
                              className={`hover:bg-slate-50/80 transition-colors ${
                                isCurrentMe ? 'bg-emerald-50/40' : ''
                              }`}
                            >
                              <td className="py-3 px-3.5 text-center font-mono text-slate-400">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-3.5">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                  <div>
                                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                      <span>{sess.fullName}</span>
                                      {isCurrentMe && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                          Bạn
                                        </span>
                                      )}
                                    </div>
                                    {sess.username && (
                                      <div className="text-[11px] font-mono text-slate-500">
                                        @{sess.username}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3.5">{renderRoleBadge(sess.role)}</td>
                              <td className="py-3 px-3.5 font-medium text-slate-700">
                                {sess.studentClass || '—'}
                              </td>
                              <td className="py-3 px-3.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold text-[11px]">
                                  <Layers className="w-3 h-3 text-emerald-700" />
                                  {sess.currentTabLabel}
                                </span>
                              </td>
                              <td className="py-3 px-3.5 text-slate-600">
                                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                  {sess.deviceType.includes('Điện thoại') ? (
                                    <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                                  ) : (
                                    <Monitor className="w-3.5 h-3.5 text-emerald-700" />
                                  )}
                                  <span>{sess.deviceType}</span>
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {sess.browser} · {sess.os}
                                </div>
                              </td>
                              <td className="py-3 px-3.5 text-right">
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                  Đang online
                                </span>
                                <div className="text-[10px] text-slate-400">
                                  {getRelativeSeconds(sess.lastActiveAt)}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: REAL-TIME DETAILED VISIT LOGS */}
            {detailSubTab === 'logs' && (
              <div className="space-y-3">
                <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] sticky top-0 z-10">
                      <tr>
                        <th className="py-3 px-3.5">Thời Gian Thực</th>
                        <th className="py-3 px-3.5">Người Dùng Truy Cập</th>
                        <th className="py-3 px-3.5">Vai Trò</th>
                        <th className="py-3 px-3.5">Lớp / Đơn Vị</th>
                        <th className="py-3 px-3.5">Hoạt Động Chi Tiết</th>
                        <th className="py-3 px-3.5">Thiết Bị & Trình Duyệt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            Không tìm thấy bản ghi truy cập phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => {
                          const isStillOnline = activeSessionsList.some(
                            (s) => s.sessionId === log.sessionId
                          );
                          return (
                            <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-3.5 font-mono whitespace-nowrap">
                                <div className="font-bold text-slate-800">
                                  {formatTimeVi(log.timestamp)}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {formatDateVi(log.timestamp)}
                                </div>
                              </td>
                              <td className="py-2.5 px-3.5">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      isStillOnline ? 'bg-emerald-500' : 'bg-slate-300'
                                    }`}
                                    title={isStillOnline ? 'Đang trực tuyến' : 'Đã rời phiên'}
                                  />
                                  <span>{log.fullName}</span>
                                </div>
                                {log.username && (
                                  <div className="text-[10px] font-mono text-slate-500 pl-3.5">
                                    @{log.username}
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 px-3.5">{renderRoleBadge(log.role)}</td>
                              <td className="py-2.5 px-3.5 text-slate-700 font-medium">
                                {log.studentClass || '—'}
                              </td>
                              <td className="py-2.5 px-3.5">
                                <div className="font-semibold text-emerald-900">{log.action}</div>
                                <div className="text-[10px] text-slate-500">
                                  Chuyên mục: {log.tabLabel}
                                </div>
                              </td>
                              <td className="py-2.5 px-3.5 text-slate-600">
                                <div className="font-medium text-slate-800">{log.deviceType}</div>
                                <div className="text-[10px] text-slate-400">
                                  {log.browser} · {log.os}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: CHARTS & SECTION BREAKDOWN */}
            {detailSubTab === 'charts' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Breakdown by Tab / Feature */}
                <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>Số Lượt Truy Cập Theo Từng Thẻ Chức Năng</span>
                  </h4>
                  <div className="space-y-2.5">
                    {tabStatsEntries.map((item) => {
                      const pct = Math.min(100, Math.round((item.count / maxTabView) * 100));
                      return (
                        <div key={item.key} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-700">{item.label}</span>
                            <strong className="font-mono text-slate-900">
                              {item.count.toLocaleString('vi-VN')} lượt
                            </strong>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(pct, item.count > 0 ? 6 : 0)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Last 7 Days Daily Visits */}
                <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-emerald-700" />
                      <span>Biểu Đồ Lượt Truy Cập 7 Ngày Gần Nhất</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Thống kê số lượt truy cập hệ thống theo từng ngày
                    </p>
                  </div>

                  <div className="pt-4 grid grid-cols-7 gap-2 items-end h-44">
                    {(stats.last7Days || []).map((day) => {
                      const maxDay = Math.max(
                        1,
                        ...(stats.last7Days || []).map((d) => d.count)
                      );
                      const heightPct = Math.max(
                        10,
                        Math.round((day.count / maxDay) * 100)
                      );
                      return (
                        <div
                          key={day.date}
                          className="flex flex-col items-center justify-end h-full gap-1.5"
                        >
                          <span className="text-[11px] font-mono font-bold text-emerald-800">
                            {day.count}
                          </span>
                          <div className="w-full bg-slate-200 rounded-t-lg flex items-end h-28 overflow-hidden">
                            <div
                              className="w-full bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-t-lg transition-all duration-500"
                              style={{ height: `${ day.count > 0 ? heightPct : 4 }%` }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-600">
                            {day.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
