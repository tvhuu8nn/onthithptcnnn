import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import net from 'net';
import zlib from 'zlib';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { getDocumentProxy, extractImages as extractPdfImages, getResolvedPDFJS } from 'unpdf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');

const AUTH_HMAC_SECRET =
  process.env.AUTH_HMAC_SECRET || 'agritech_kntt_2026_hmac_security_key_9f8e7d6c5b4a';

function signAuthToken(username: string, role: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      u: username,
      r: role,
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_HMAC_SECRET).update(payload).digest('base64url');
  return `v2.${payload}.${sig}`;
}

function verifyAuthToken(token?: string | null): { u: string; r: string } | null {
  if (!token || typeof token !== 'string') return null;
  const raw = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  if (!raw.startsWith('v2.')) return null;
  const parts = raw.split('.');
  if (parts.length !== 3) return null;
  const [, payload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', AUTH_HMAC_SECRET)
    .update(payload)
    .digest('base64url');
  const sigBuf = Buffer.from(sig, 'utf-8');
  const expectedBuf = Buffer.from(expectedSig, 'utf-8');
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (decoded.exp && Date.now() > decoded.exp) return null;
    return { u: String(decoded.u || ''), r: String(decoded.r || '') };
  } catch {
    return null;
  }
}

function normalizeOwnerUsername(raw?: unknown): string {
  return String(raw || '')
    .trim()
    .replace(/^@+/, '')
    .toLowerCase();
}

function getVerifiedAuthIdentity(req: Request): {
  username: string;
  normalizedUsername: string;
  role: string;
  isAdmin: boolean;
  isTeacherOrAdmin: boolean;
} | null {
  const verified = verifyAuthToken(req.headers.authorization);
  if (!verified || !verified.u) return null;
  const normalizedUsername = normalizeOwnerUsername(verified.u);
  if (!normalizedUsername) return null;
  const role = String(verified.r || '').toLowerCase();
  const isAdmin = role === 'admin' || normalizedUsername === 'admin';
  const isTeacherOrAdmin = isAdmin || role === 'teacher';
  return {
    username: verified.u,
    normalizedUsername,
    role,
    isAdmin,
    isTeacherOrAdmin,
  };
}

function isRequestAdmin(req: Request): boolean {
  const verified = verifyAuthToken(req.headers.authorization);
  if (verified && (verified.r === 'admin' || verified.u.toLowerCase() === 'admin')) {
    return true;
  }
  const headerRole = String(req.headers['x-admin-role'] || '').toLowerCase();
  const headerUser = String(req.headers['x-auth-username'] || '').toLowerCase();
  const queryRole = String(req.query?.adminRole || '').toLowerCase();
  const bodyRole = String(req.body?.adminRole || '').toLowerCase();
  return (
    headerRole === 'admin' ||
    headerUser === 'admin' ||
    queryRole === 'admin' ||
    bodyRole === 'admin'
  );
}

function isRequestTeacherOrAdmin(req: Request): boolean {
  if (isRequestAdmin(req)) return true;
  const verified = verifyAuthToken(req.headers.authorization);
  if (verified && (verified.r === 'teacher' || verified.r === 'admin')) {
    return true;
  }
  const headerRole = String(req.headers['x-auth-role'] || req.headers['x-admin-role'] || '').toLowerCase();
  if (headerRole === 'teacher' || headerRole === 'admin') {
    return true;
  }
  const headerUser = String(req.headers['x-auth-username'] || '')
    .trim()
    .replace(/^@+/, '')
    .toLowerCase();
  if (headerUser) {
    try {
      const { users } = loadDataUsers();
      const matched = users.find(
        (u) => cleanAuthString(u.username).replace(/^@+/, '').toLowerCase() === headerUser
      );
      if (matched && (matched.role === 'teacher' || matched.role === 'admin')) {
        return true;
      }
    } catch {}
  }
  return false;
}

// Brute-force login rate limiter per IP + username
const loginRateLimitMap = new Map<
  string,
  { count: number; firstAttemptAt: number; lockedUntil: number }
>();
const LOGIN_MAX_ATTEMPTS = 8;
const LOGIN_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const LOGIN_LOCKOUT_MS = 60 * 1000; // 60 seconds cooldown

// Dynamically resolve port:
// 1. In AI Studio dev/preview container: Nginx listens on NGINX_PORT (8080) and forwards to DEFAULT_APP_PORT (3000).
//    Express must bind to DEFAULT_APP_PORT (3000) to avoid EADDRINUSE on 8080.
// 2. In standalone Cloud Run / published deployment: NGINX_PORT is unset, Cloud Run assigns PORT (8080),
//    so Express must bind to process.env.PORT to satisfy Cloud Run's health check.
function resolvePort(): number {
  if (process.env.NGINX_PORT) {
    return Number(process.env.DEFAULT_APP_PORT || 3000);
  }
  if (process.env.PORT) {
    return Number(process.env.PORT);
  }
  if (process.env.DEFAULT_APP_PORT) {
    return Number(process.env.DEFAULT_APP_PORT);
  }
  return 3000;
}

const PORT = resolvePort();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Security & CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Role, X-Auth-Username, X-Auth-Role, X-Peer-Replicated, Cache-Control, Pragma'
  );
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Storage path for shared student submissions across all devices
const DATA_DIR = path.resolve(__dirname, 'data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

// Initial seed submissions so teacher dashboard always has meaningful demo baseline
const INITIAL_DEMO_SUBMISSIONS = [
  {
    id: 'sub_01',
    studentName: 'Nguyễn Văn An',
    studentClass: '12A1',
    studentId: '120101',
    examId: 'de-chuan-01',
    examCode: '101',
    examTitle: 'Đề Thi Tốt Nghiệp THPT Mẫu Số 01 - Chuẩn Ma Trận',
    totalScore: 9.25,
    partIScore: 5.75,
    partIIScore: 3.5,
    partICorrectCount: 23,
    partIICorrectCount: 14,
    timeSpentSeconds: 2420,
    submittedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    rank: 'Xuất sắc',
  },
  {
    id: 'sub_02',
    studentName: 'Trần Thị Mai',
    studentClass: '12A1',
    studentId: '120102',
    examId: 'de-chuan-01',
    examCode: '101',
    examTitle: 'Đề Thi Tốt Nghiệp THPT Mẫu Số 01 - Chuẩn Ma Trận',
    totalScore: 8.75,
    partIScore: 5.5,
    partIIScore: 3.25,
    partICorrectCount: 22,
    partIICorrectCount: 13,
    timeSpentSeconds: 2650,
    submittedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    rank: 'Giỏi',
  },
  {
    id: 'sub_03',
    studentName: 'Lê Hoàng Nam',
    studentClass: '12A1',
    studentId: '120103',
    examId: 'de-chuan-01',
    examCode: '101',
    examTitle: 'Đề Thi Tốt Nghiệp THPT Mẫu Số 01 - Chuẩn Ma Trận',
    totalScore: 7.75,
    partIScore: 5.0,
    partIIScore: 2.75,
    partICorrectCount: 20,
    partIICorrectCount: 11,
    timeSpentSeconds: 2890,
    submittedAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    rank: 'Khá',
  },
  {
    id: 'sub_04',
    studentName: 'Phạm Minh Đức',
    studentClass: '12A1',
    studentId: '120104',
    examId: 'de-chuan-02',
    examCode: '102',
    examTitle: 'Đề Thi Tốt Nghiệp THPT Mẫu Số 02 - Phát Triển Năng Lực',
    totalScore: 9.5,
    partIScore: 6.0,
    partIIScore: 3.5,
    partICorrectCount: 24,
    partIICorrectCount: 14,
    timeSpentSeconds: 2310,
    submittedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    rank: 'Xuất sắc',
  },
  {
    id: 'sub_05',
    studentName: 'Hoàng Thu Thảo',
    studentClass: '12A1',
    studentId: '120105',
    examId: 'de-chuan-01',
    examCode: '101',
    examTitle: 'Đề Thi Tốt Nghiệp THPT Mẫu Số 01 - Chuẩn Ma Trận',
    totalScore: 6.25,
    partIScore: 4.25,
    partIIScore: 2.0,
    partICorrectCount: 17,
    partIICorrectCount: 8,
    timeSpentSeconds: 2950,
    submittedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    rank: 'Trung bình',
  },
  {
    id: 'sub_06',
    studentName: 'Vũ Quốc Bảo',
    studentClass: '12A2',
    studentId: '120201',
    examId: 'de-chuan-01',
    examCode: '101',
    examTitle: 'Đề Thi Tốt Nghiệp THPT Mẫu Số 01 - Chuẩn Ma Trận',
    totalScore: 8.25,
    partIScore: 5.25,
    partIIScore: 3.0,
    partICorrectCount: 21,
    partIICorrectCount: 12,
    timeSpentSeconds: 2710,
    submittedAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    rank: 'Giỏi',
  },
  {
    id: 'sub_07',
    studentName: 'Đặng Ngọc Ánh',
    studentClass: '12A2',
    studentId: '120202',
    examId: 'de-chuan-01',
    examCode: '101',
    examTitle: 'Đề Thi Tốt Nghiệp THPT Mẫu Số 01 - Chuẩn Ma Trận',
    totalScore: 7.5,
    partIScore: 4.75,
    partIIScore: 2.75,
    partICorrectCount: 19,
    partIICorrectCount: 11,
    timeSpentSeconds: 2840,
    submittedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    rank: 'Khá',
  },
  {
    id: 'sub_08',
    studentName: 'Bùi Gia Huy',
    studentClass: '12A2',
    studentId: '120203',
    examId: 'de-chuan-02',
    examCode: '102',
    examTitle: 'Đề Thi Tốt Nghiệp THPT Mẫu Số 02 - Phát Triển Năng Lực',
    totalScore: 4.75,
    partIScore: 3.5,
    partIIScore: 1.25,
    partICorrectCount: 14,
    partIICorrectCount: 5,
    timeSpentSeconds: 2990,
    submittedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    rank: 'Cần cố gắng',
  },
  {
    id: 'sub_09',
    studentName: 'Ngô Thanh Hằng',
    studentClass: '12 Chuyên Sinh - Nông Nghiệp',
    studentId: '12CS01',
    examId: 'de-chuan-01',
    examCode: '101',
    examTitle: 'Đề Thi Tốt Nghiệp THPT Mẫu Số 01 - Chuẩn Ma Trận',
    totalScore: 9.75,
    partIScore: 6.0,
    partIIScore: 3.75,
    partICorrectCount: 24,
    partIICorrectCount: 15,
    timeSpentSeconds: 2150,
    submittedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    rank: 'Xuất sắc',
  },
  {
    id: 'sub_10',
    studentName: 'Đỗ Hải Đăng',
    studentClass: '12 Chuyên Sinh - Nông Nghiệp',
    studentId: '12CS02',
    examId: 'de-chuan-01',
    examCode: '101',
    examTitle: 'Đề Thi Tốt Nghiệp THPT Mẫu Số 01 - Chuẩn Ma Trận',
    totalScore: 8.5,
    partIScore: 5.5,
    partIIScore: 3.0,
    partICorrectCount: 22,
    partIICorrectCount: 12,
    timeSpentSeconds: 2580,
    submittedAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    rank: 'Giỏi',
  },
];

// Helper to safely load submissions from file or memory
let inMemorySubmissions = [...INITIAL_DEMO_SUBMISSIONS];

function loadSubmissionsFromFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const content = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemorySubmissions = parsed;
        return;
      }
    }
    // Write defaults if missing
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(inMemorySubmissions, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Notice: File system persistence fallback to memory:', err);
  }
}

function persistSubmissionsToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(inMemorySubmissions, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Notice: Failed writing submissions to file:', err);
  }
}

// Load on startup
loadSubmissionsFromFile();

// Active SSE clients for real-time broadcast across all devices & platforms
const sseClients = new Set<Response>();

type SyncDomainKey =
  | 'datauser'
  | 'uploadedExams'
  | 'submissions'
  | 'assignments'
  | 'customExams'
  | 'mistakes'
  | 'visitorStats';

const syncVersions: Record<SyncDomainKey, number> = {
  datauser: Date.now(),
  uploadedExams: Date.now(),
  submissions: Date.now(),
  assignments: Date.now(),
  customExams: Date.now(),
  mistakes: Date.now(),
  visitorStats: Date.now(),
};

function touchSyncVersion(domain: SyncDomainKey, ts = Date.now()): void {
  syncVersions[domain] = Math.max(syncVersions[domain] + 1, ts);
}

function broadcastSSE(eventType: string, data: any) {
  const now = Date.now();
  if (eventType === 'datauser_updated') touchSyncVersion('datauser', now);
  else if (eventType === 'uploaded_exams_updated') touchSyncVersion('uploadedExams', now);
  else if (
    eventType === 'submission_added' ||
    eventType === 'submission_deleted' ||
    eventType === 'submissions_reset'
  ) {
    touchSyncVersion('submissions', now);
  } else if (
    eventType === 'assignment_updated' ||
    eventType === 'exam_session_ended' ||
    eventType === 'exam_session_reopened'
  ) {
    touchSyncVersion('assignments', now);
  } else if (eventType === 'custom_exams_updated') touchSyncVersion('customExams', now);
  else if (eventType === 'mistakes_updated') touchSyncVersion('mistakes', now);
  else if (eventType === 'visitor_stats_updated') touchSyncVersion('visitorStats', now);
  else if (eventType === 'sync_all_updated') {
    (Object.keys(syncVersions) as SyncDomainKey[]).forEach((k) => touchSyncVersion(k, now));
  }

  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  });
}

// ==============================================================================
// REALTIME DATAUSER FILE MANAGEMENT (data/datauser.json, datauser.json, datauser.csv)
// Tự động nhận diện và cập nhật tài khoản đăng nhập theo thời gian thực khi sửa tệp
// ==============================================================================
interface DataUserAccount {
  id?: number | string;
  username: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
  fullName: string;
  email?: string;
  className?: string;
  must_change_password?: boolean;
  is_active?: boolean;
  created_at?: string;
  payment_amount?: number;
  start_date?: string;
  expires_at?: string;
  aliases?: string[];
}

function normalizePaymentAmount(rawPayment?: number): number {
  if (rawPayment !== undefined && rawPayment !== null && String(rawPayment).trim() !== '' && Number(rawPayment) === 0) {
    return 0;
  }
  const amt = Number(rawPayment ?? 200000);
  if (isNaN(amt)) return 200000;
  if (amt <= 0) return 0;
  if (amt <= 100000) return 100000;
  return 200000;
}

function getValidityDaysFromPayment(paymentAmount?: number, _role?: string): number {
  if (paymentAmount !== undefined && paymentAmount !== null && String(paymentAmount).trim() !== '' && Number(paymentAmount) === 0) {
    return 7;
  }
  return 365;
}

const FIXED_DEFAULT_START_DATE = '2026-11-06';

function normalizeDateYMD(dateInput?: string, fallbackYMD: string = FIXED_DEFAULT_START_DATE): string {
  if (!dateInput) {
    return fallbackYMD;
  }
  const s = String(dateInput).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const isoMatch = s.match(/^(\d{4}-\d{2}-\d{2})T/);
  if (isoMatch) return isoMatch[1];
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return fallbackYMD;
}

function computeExpiresAtYMD(startDateYMD: string, paymentAmount?: number, role?: string): string {
  const cleanStart = normalizeDateYMD(startDateYMD);
  const days = getValidityDaysFromPayment(paymentAmount, role);
  const [y, m, d] = cleanStart.split('-').map(Number);
  const target = new Date(y, (m || 1) - 1, (d || 1) + days);
  const ey = target.getFullYear();
  const em = String(target.getMonth() + 1).padStart(2, '0');
  const ed = String(target.getDate()).padStart(2, '0');
  return `${ey}-${em}-${ed}`;
}

const UNLIMITED_USERNAMES = new Set([
  'admin',
  'nvduc',
  'ttbvan',
  'dluphuong',
  'tdquoc',
  'ntmdung',
  'lehang',
  'ledien',
  'ltptuyen',
  'vanhuu',
]);

function isServerUnlimitedAccount(username?: string, role?: string): boolean {
  if (role === 'admin') return true;
  const cleanU = String(username || '')
    .replace(/[\u00A0\uFEFF\s]+/g, '')
    .replace(/^@+/, '')
    .toLowerCase();
  return UNLIMITED_USERNAMES.has(cleanU);
}

const DEFAULT_DATAUSER_ACCOUNTS: DataUserAccount[] = [
  { id: 1794912105161, username: 'nguyenbaolam', password: 'hs123', role: 'student', fullName: 'Nguyễn Bảo Lâm', email: 'nguyenbaolam@truong.edu.vn', className: '12A1', must_change_password: false, is_active: true, created_at: '2026-11-17T10:41:45.161Z', payment_amount: 0, start_date: '2026-11-17', expires_at: '2026-11-24', aliases: ['nguyenbaolam', 'nguyen bao lam'] },
  { id: 1794911445195, username: 'ltptin', password: 'gv123', role: 'teacher', fullName: 'Lâm Thanh Phúc Tín', email: 'lamthanhphuctin@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-17T10:30:45.195Z', payment_amount: 0, start_date: '2026-11-17', expires_at: '2026-11-24', aliases: ['ltptin', 'lam thanh phuc tin', 'lamthanhphuctin'] },
  { id: 1794284663651, username: 'thanhthanh', password: 'gv123', role: 'teacher', fullName: 'Thanh Thanh', email: 'thanhthanh@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-10T04:24:23.651Z', payment_amount: 200000, start_date: '2026-11-10', expires_at: '2027-11-10', aliases: ['thanhthanh', 'thanh thanh'] },
  { id: 1794574690388, username: 'ptan', password: 'gv123', role: 'teacher', fullName: 'Phan Thúy An', email: 'ptan@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-13T12:58:10.388Z', payment_amount: 200000, start_date: '2026-11-13', expires_at: '2027-11-13', aliases: ['ptan', 'phan thuy an', 'phanthuyan'] },
  { id: 1794660667627, username: 'thqua', password: 'gv123', role: 'teacher', fullName: 'Trương Thanh Quá', email: 'truongthanhqua@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-14T12:51:07.627Z', payment_amount: 200000, start_date: '2026-11-14', expires_at: '2027-11-14', aliases: ['thqua', 'truong thanh qua', 'truongthanhqua'] },
  { id: 1794645997706, username: 'nttdung', password: 'gv123', role: 'teacher', fullName: 'Nguyễn Thị Thùy Dung', email: 'nguyenthithuydung@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-14T08:46:37.707Z', payment_amount: 200000, start_date: '2026-11-14', expires_at: '2027-11-14', aliases: ['nttdung', 'nguyen thi thuy dung', 'nguyenthithuydung'] },
  { id: 1794579497302, username: 'renren', password: 'gv123', role: 'teacher', fullName: 'Nèang Rên', email: 'neangren@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-13T14:18:17.302Z', payment_amount: 0, start_date: '2026-11-15', expires_at: '2026-11-22', aliases: ['renren', 'neang ren', 'neangren'] },
  { id: 1794132712393, username: 'phanthiphuongthang', password: 'gv123', role: 'teacher', fullName: 'Phan Thị Phương Thắng', email: 'phanthiphuongthang@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-08T10:11:52.393Z', payment_amount: 200000, start_date: '2026-02-06', expires_at: '2027-02-06', aliases: ['phanthiphuongthang', 'phan thi phuong thang'] },
  { id: 1794063297820, username: 'lahuy', password: 'gv123', role: 'teacher', fullName: 'La Huy', email: 'lahuy@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-07T14:57:29.636Z', payment_amount: 200000, start_date: '2026-11-07', expires_at: '2027-11-07', aliases: ['lahuy', 'la huy'] },
  { id: 1794579539288, username: 'tnloan', password: 'gv123', role: 'teacher', fullName: 'Tống Ngọc Loan', email: 'tongngocloan@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-13T14:18:59.288Z', payment_amount: 0, start_date: '2026-11-15', expires_at: '2026-11-22', aliases: ['tnloan', 'tong ngoc loan', 'tongngocloan'] },
  { id: 1794606633922, username: 'sarach', password: 'gv123', role: 'teacher', fullName: 'Nèang Sarach', email: 'neangsarach@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-13T21:50:33.922Z', payment_amount: 0, start_date: '2026-11-15', expires_at: '2026-11-22', aliases: ['sarach', 'neang sarach', 'neangsarach'] },
  { id: 1794038035192, username: 'ltktuyen', password: 'gv123', role: 'teacher', fullName: 'Lê Thị Kim Tuyến', email: 'ltktuyen@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-07T07:53:55.192Z', payment_amount: 200000, start_date: '2026-02-01', expires_at: '2027-02-01', aliases: ['ltktuyen', 'le thi kim tuyen', 'lethikimtuyen'] },
  { id: 1794109911748, username: 'nttu', password: 'gv123', role: 'teacher', fullName: 'Nguyễn Thanh Tú', email: 'nguyenthanhtu@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-08T03:51:51.748Z', payment_amount: 0, start_date: '2026-11-15', expires_at: '2026-11-22', aliases: ['nttu', 'nguyen thanh tu', 'nguyenthanhtu'] },
  { id: 1794737106519, username: 'dangtoan', password: 'gv123', role: 'teacher', fullName: 'Đặng Toàn', email: 'dangtoan@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-15T10:05:06.519Z', payment_amount: 0, start_date: '2026-11-15', expires_at: '2026-11-22', aliases: ['dangtoan', 'dang toan'] },
  { id: 1794748503157, username: 'ltly', password: 'gv123', role: 'teacher', fullName: 'Lê Thị Lý', email: 'lethily@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-15T13:15:03.157Z', payment_amount: 0, start_date: '2026-11-15', expires_at: '2026-11-22', aliases: ['ltly', 'le thi ly', 'lethily'] },
  { id: 1794813647686, username: 'vtthao', password: 'gv123', role: 'teacher', fullName: 'Vũ Thị Thảo', email: 'vuthithao@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-16T07:20:47.686Z', payment_amount: 0, start_date: '2026-11-16', expires_at: '2026-11-23', aliases: ['vtthao', 'vu thi thao', 'vuthithao'] },
  { id: 1794813676259, username: 'mailoan', password: 'gv123', role: 'teacher', fullName: 'Mai Loan', email: 'mailoan@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-16T07:21:16.259Z', payment_amount: 0, start_date: '2026-11-16', expires_at: '2026-11-23', aliases: ['mailoan', 'mai loan'] },
  { id: 1794813742606, username: 'dothoa', password: 'gv123', role: 'teacher', fullName: 'Đỗ Thoa', email: 'dothoa@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-16T07:22:22.606Z', payment_amount: 0, start_date: '2026-11-16', expires_at: '2026-11-23', aliases: ['dothoa', 'do thoa'] },
  { id: 1794103280271, username: 'tdtoan', password: 'gv123', role: 'teacher', fullName: 'Trần Đức Toàn', email: 'tranductoan@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-08T02:01:20.271Z', payment_amount: 0, start_date: '2026-11-16', expires_at: '2026-11-23', aliases: ['tdtoan', 'tran duc toan', 'tranductoan'] },
  { id: 1794734335159, username: 'pttnga', password: 'gv123', role: 'teacher', fullName: 'Phạm Thị Tố Nga', email: 'phamthitonga@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-15T09:18:55.159Z', payment_amount: 0, start_date: '2026-11-16', expires_at: '2026-11-23', aliases: ['pttnga', 'pham thi to nga', 'phamthitonga'] },
  { id: 1794886924685, username: 'dangnhung', password: 'gv123', role: 'teacher', fullName: 'Đặng Nhung', email: 'dangnhung@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-17T03:42:04.685Z', payment_amount: 0, start_date: '2026-11-17', expires_at: '2026-11-24', aliases: ['dangnhung', 'dang nhung'] },
  { id: 1794886972013, username: 'cthnhung', password: 'gv123', role: 'teacher', fullName: 'Cao Thị Hồng Nhung', email: 'caothihongnhung@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-17T03:42:52.013Z', payment_amount: 0, start_date: '2026-11-17', expires_at: '2026-11-24', aliases: ['cthnhung', 'cao thi hong nhung', 'caothihongnhung'] },
  { id: 1794016480002, username: 'vanhuu', password: 'gv123', role: 'teacher', fullName: 'Văn Hữu', email: 'vanhuu@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-07T01:55:00.000Z', payment_amount: 200000, start_date: '2026-11-07', expires_at: 'Vĩnh viễn', aliases: ['vanhuu', 'vanhuu@truong.edu.vn'] },
  { id: 1794016480001, username: 'truongthanhqua', password: 'gv123', role: 'teacher', fullName: 'Trương Thanh Quà', email: 'truongthanhqua@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-07T01:55:00.000Z', payment_amount: 200000, start_date: '2026-11-07', expires_at: '2027-11-07', aliases: ['ttqua', 'truongthanhqua', 'truongthanhqua@truong.edu.vn'] },
  { id: 1794016464026, username: 'mimosa', password: 'gv123', role: 'teacher', fullName: 'Mimosa', email: 'mimosa@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-07T01:54:25.245Z', payment_amount: 200000, start_date: '2026-11-07', expires_at: '2027-11-07', aliases: [] },
  { id: 1794016426793, username: 'lehang', password: 'gv123', role: 'teacher', fullName: 'Lê Hằng', email: 'lehang@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-07T01:53:46.563Z', payment_amount: 200000, start_date: '2026-11-07', expires_at: 'Vĩnh viễn', aliases: [] },
  { id: 1794016410017, username: 'ledien', password: 'gv123', role: 'teacher', fullName: 'Lê Diến', email: 'ledien@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-07T01:53:31.287Z', payment_amount: 200000, start_date: '2026-11-07', expires_at: 'Vĩnh viễn', aliases: [] },
  { id: 1794016382390, username: 'phuongquynh', password: 'gv123', role: 'teacher', fullName: 'Phương Quỳnh', email: 'phuongquynh@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-07T01:53:03.579Z', payment_amount: 200000, start_date: '2026-11-07', expires_at: '2027-11-07', aliases: [] },
  { id: 1794012668032, username: 'bona', password: 'gv123', role: 'teacher', fullName: 'Chau Bô Na', email: 'bona@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-06T11:53:14.731Z', payment_amount: 200000, start_date: '2026-11-06', expires_at: '2027-11-06', aliases: [] },
  { id: 1794012668029, username: 'mvnien', password: 'gv123', role: 'teacher', fullName: 'Mai Văn Niên', email: 'mvnien@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-06T11:53:53.806Z', payment_amount: 200000, start_date: '2026-11-06', expires_at: '2027-11-06', aliases: [] },
  { id: 1794012668024, username: 'ltptuyen', password: 'gv123', role: 'teacher', fullName: 'Lê Thị Phượng Tuyến', email: 'ltptuyen@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-06T12:30:14.343Z', payment_amount: 200000, start_date: '2026-11-06', expires_at: 'Vĩnh viễn', aliases: [] },
  { id: 1794012668018, username: 'hntruong', password: 'truong8nn', role: 'teacher', fullName: 'Huỳnh Ngọc Trường', email: 'hntruong@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-06T14:50:22.262Z', payment_amount: 200000, start_date: '2026-11-06', expires_at: '2027-11-06', aliases: [] },
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', fullName: 'Trần Văn Hữu', email: 'admin@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-06T11:50:24.301Z', payment_amount: 200000, start_date: '2026-11-06', expires_at: 'Vĩnh viễn', aliases: ['huu', 'tranvanhuu', 'thayhuu', 'tvhuu', '0358016013', 'tvhuu.8nn@gmail.com'] },
  { id: 2, username: 'ttbvan', password: 'gv123', role: 'teacher', fullName: 'Trần Thị Bích Vân', email: 'ttbvan@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-06T11:50:24.301Z', payment_amount: 200000, start_date: '2026-11-06', expires_at: 'Vĩnh viễn', aliases: ['bichvan', 'tranthibichvan', 'covan', 'van', 'ttbvan@gmail.com'] },
  { id: 3, username: 'vtktuyen', password: 'gv123', role: 'teacher', fullName: 'Võ Thị Kim Tuyền', email: 'vtktuyen@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-06T11:50:24.301Z', payment_amount: 200000, start_date: '2026-11-06', expires_at: '2027-11-06', aliases: ['kimtuyen', 'vothikimtuyen', 'cotuyen', 'tuyen', 'vtktuyen@gmail.com'] },
  { id: 4, username: 'lthtrang', password: 'gv123', role: 'teacher', fullName: 'Lê Thị Hồng Trang', email: 'lthtrang@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-06T11:50:24.301Z', payment_amount: 200000, start_date: '2026-11-06', expires_at: '2027-11-06', aliases: ['hongtrang', 'lethihongtrang', 'cotrang', 'trang', 'lthtrang@gmail.com'] },
  { id: 5, username: 'dluphuong', password: 'gv123', role: 'teacher', fullName: 'Đặng Lê Uyên Phương', email: 'dluphuong@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-06T11:50:24.301Z', payment_amount: 200000, start_date: '2026-11-06', expires_at: 'Vĩnh viễn', aliases: ['uyenphuong', 'dangleuyenphuong', 'cophuong', 'phuong', 'dluphuong@gmail.com'] },
  { id: 6, username: 'ntmdung', password: 'gv123', role: 'teacher', fullName: 'Nguyễn Thị Mỹ Dung', email: 'ntmdung@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-06T11:50:24.301Z', payment_amount: 200000, start_date: '2026-11-06', expires_at: 'Vĩnh viễn', aliases: ['mydung', 'nguyenthimydung', 'codung', 'dung', 'ntmdung@gmail.com'] },
  { id: 7, username: 'vtphuong', password: 'gv123', role: 'teacher', fullName: 'Văn Thị Phượng', email: 'vtphuong@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-06T11:50:24.301Z', payment_amount: 200000, start_date: '2026-11-06', expires_at: '2027-11-06', aliases: ['phuong', 'vanthiphuong', 'cophuong', 'vtphuong@gmail.com'] },
  { id: 9, username: 'ntmanh', password: 'gv123', role: 'teacher', fullName: 'Nguyễn Thị Mỹ Anh', email: 'ntmanh@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-06T11:50:24.301Z', payment_amount: 200000, start_date: '2026-11-06', expires_at: '2027-11-06', aliases: ['myanh', 'nguyenthimyanh', 'coanh', 'anh', 'ntmanh@gmail.com'] },
  { id: 11, username: 'tdquoc', password: 'gv123', role: 'teacher', fullName: 'Thái Duy Quốc', email: 'tdquoc@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-06T11:50:24.301Z', payment_amount: 200000, start_date: '2026-11-06', expires_at: 'Vĩnh viễn', aliases: ['thaiduyquoc', 'thayquoc', 'quoc', 'tdquoc@gmail.com'] },
  { id: 14, username: 'dhdiep', password: 'gv123', role: 'teacher', fullName: 'Dương Hồng Diệp', email: 'dhdiep@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-06T11:50:24.301Z', payment_amount: 200000, start_date: '2026-11-06', expires_at: '2027-11-06', aliases: ['duonghongdiep', 'hongdiep', 'codiep', 'diep', 'dhdiep@gmail.com'] },
  { id: 15, username: 'nvduc', password: 'gv123', role: 'teacher', fullName: 'Nguyễn Văn Đức', email: 'nvduc@truong.edu.vn', className: 'Tổ Công Nghệ Nông nghiệp', must_change_password: false, is_active: true, created_at: '2026-11-07T01:55:00.000Z', payment_amount: 200000, start_date: '2026-11-07', expires_at: 'Vĩnh viễn', aliases: ['nvduc', 'nguyenvanduc', 'thayduc', 'duc', 'nvduc@truong.edu.vn', 'nvduc@gmail.com'] },
];

let cachedDataUsers: DataUserAccount[] = [];
let hasInitializedDataUsers = false;
let lastDataUserMtime = 0;
const activeDataUserFile = path.join(DATA_DIR, 'datauser.json');

function cleanAuthString(str: any): string {
  if (str === null || str === undefined) return '';
  return str
    .toString()
    .replace(/[\u00A0\uFEFF\u200B-\u200F\u202A-\u202E\u2060\s]+/g, '')
    .trim();
}

function stripAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

function decodeServerSecret(raw: string): string {
  const val = String(raw || '').trim();
  if (!val.startsWith('enc_v1:')) return val;
  try {
    const encoded = val.slice('enc_v1:'.length);
    const reversed = Buffer.from(encoded, 'base64').toString('utf-8');
    return decodeURIComponent(reversed.split('').reverse().join(''));
  } catch {
    return val;
  }
}

function parseDataUserContent(content: string, filePath: string): DataUserAccount[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  // 1. JSON Array format
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      return list.map((item: any, idx: number) => {
        const u = cleanAuthString(item.username || item.Username || item.user || item.tai_khoan || item.taikhoan || '')
          .replace(/^@+/, '')
          .toLowerCase();
        const rawPass = decodeServerSecret(
          String(item.password || item.Password || item.pass || item.mat_khau || item.matkhau || '')
        );
        const p = cleanAuthString(rawPass);
        const rRaw = String(item.role || item.Role || item.quyen || item.vai_tro || 'teacher').toLowerCase().trim();
        const role: 'admin' | 'teacher' | 'student' = rRaw === 'admin' ? 'admin' : rRaw === 'student' || rRaw === 'hocsinh' ? 'student' : 'teacher';
        const fullName = String(item.fullName || item.FullName || item.fullname || item.name || item.ho_ten || item.hoten || u).trim();
        const email = item.email ? String(item.email).trim() : `${u}@truong.edu.vn`;
        const className = String(item.className || item.Class || item.class || item.lop || (role === 'student' ? '12A1' : 'Tổ Công Nghệ Nông nghiệp')).trim();
        const must_change_password = false;
        const is_active = item.is_active !== undefined ? Boolean(item.is_active) : (item.isActive !== undefined ? Boolean(item.isActive) : true);
        const created_at = item.created_at || item.createdAt || new Date().toISOString();
        const defaultRolePay = role === 'student' ? 100000 : 200000;
        const rawP = item.payment_amount ?? item.paymentAmount;
        const payment_amount = normalizePaymentAmount(rawP !== undefined && rawP !== null ? Number(rawP) : defaultRolePay);
        const start_date = normalizeDateYMD(item.start_date || item.startDate || created_at);
        const expires_at = isServerUnlimitedAccount(u, role)
          ? 'Vĩnh viễn'
          : computeExpiresAtYMD(start_date, payment_amount, role);
        const aliases: string[] = Array.isArray(item.aliases) ? item.aliases : [];
        return {
          id: item.id || idx + 1,
          username: u,
          password: p,
          role,
          fullName,
          email,
          className,
          must_change_password,
          is_active,
          created_at,
          payment_amount,
          start_date,
          expires_at,
          aliases,
        };
      }).filter((acc: DataUserAccount) => acc.username && acc.password);
    } catch (e) {
      console.warn(`[DataUser] JSON parse failed for ${filePath}:`, e);
    }
  }

  // 2. CSV / TSV format
  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const firstLine = lines[0].toLowerCase();
  const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';
  let startIndex = 0;
  if (firstLine.includes('user') || firstLine.includes('pass') || firstLine.includes('role') || firstLine.includes('tài khoản')) {
    startIndex = 1; // skip header line
  }

  const results: DataUserAccount[] = [];
  for (let i = startIndex; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length >= 2) {
      const u = cleanAuthString(cols[0]).replace(/^@+/, '').toLowerCase();
      const p = cleanAuthString(decodeServerSecret(cols[1]));
      const rRaw = (cols[2] || 'teacher').toLowerCase();
      const role: 'admin' | 'teacher' | 'student' = rRaw === 'admin' ? 'admin' : rRaw === 'student' || rRaw === 'hocsinh' ? 'student' : 'teacher';
      const fullName = cols[3] ? cols[3].trim() : u;
      const className = cols[4] ? cols[4].trim() : (role === 'student' ? '12A1' : 'Tổ Công Nghệ Nông nghiệp');
      if (u && p) {
        results.push({ username: u, password: p, role, fullName, className });
      }
    }
  }
  return results;
}

const deletedUsersFile = path.join(DATA_DIR, 'deleted_users.json');
const TMP_DELETED_USERS_FILE = '/tmp/agritech_deleted_users.json';
const TMP_DATAUSER_FILE = '/tmp/agritech_datauser.json';

function loadDeletedUsernamesServer(): Set<string> {
  const result = new Set<string>();
  for (const file of [TMP_DELETED_USERS_FILE, deletedUsersFile]) {
    try {
      if (fs.existsSync(file)) {
        const raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
        if (Array.isArray(raw)) {
          raw
            .map((u) => cleanAuthString(u).replace(/^@+/, '').toLowerCase())
            .filter(Boolean)
            .forEach((u) => result.add(u));
        }
      }
    } catch {}
  }
  return result;
}

function saveDeletedUsernamesServer(set: Set<string>): void {
  const serialized = JSON.stringify(Array.from(set), null, 2);
  try {
    fs.writeFileSync(TMP_DELETED_USERS_FILE, serialized, 'utf-8');
  } catch {}
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(deletedUsersFile, serialized, 'utf-8');
  } catch {}
}

function loadDataUsers(force = false): { users: DataUserAccount[]; filePath: string; mtime: number } {
  if (!hasInitializedDataUsers || force) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const rootDataUserFile = path.resolve(__dirname, 'datauser.json');
      const deletedSet = loadDeletedUsernamesServer();

      let tmpParsed: DataUserAccount[] = [];
      let primaryParsed: DataUserAccount[] = [];
      let rootParsed: DataUserAccount[] = [];

      if (fs.existsSync(TMP_DATAUSER_FILE)) {
        const rawTmp = fs.readFileSync(TMP_DATAUSER_FILE, 'utf-8');
        tmpParsed = parseDataUserContent(rawTmp, TMP_DATAUSER_FILE);
      }

      if (fs.existsSync(activeDataUserFile)) {
        const raw = fs.readFileSync(activeDataUserFile, 'utf-8');
        primaryParsed = parseDataUserContent(raw, activeDataUserFile);
        lastDataUserMtime = fs.statSync(activeDataUserFile).mtimeMs;
      }

      if (fs.existsSync(rootDataUserFile)) {
        const rawRoot = fs.readFileSync(rootDataUserFile, 'utf-8');
        rootParsed = parseDataUserContent(rawRoot, rootDataUserFile);
      }

      const primaryKeys = new Set(
        primaryParsed.map((a) => cleanAuthString(a.username).replace(/^@+/, '').toLowerCase())
      );

      // Merge accounts: in-memory runtime cachedDataUsers & /tmp store take priority so workspace syncs never wipe out newly added users
      const mergedMap = new Map<string, DataUserAccount>();
      let needsSyncWrite = false;

      if (hasInitializedDataUsers && cachedDataUsers.length > 0) {
        for (const acc of cachedDataUsers) {
          const key = cleanAuthString(acc.username).replace(/^@+/, '').toLowerCase();
          if (key && !deletedSet.has(key)) {
            mergedMap.set(key, acc);
            if (!primaryKeys.has(key)) {
              needsSyncWrite = true;
            }
          }
        }
      }

      for (const acc of tmpParsed) {
        const key = cleanAuthString(acc.username).replace(/^@+/, '').toLowerCase();
        if (key && !deletedSet.has(key) && !mergedMap.has(key)) {
          mergedMap.set(key, acc);
          if (!primaryKeys.has(key)) {
            needsSyncWrite = true;
          }
        }
      }

      for (const acc of primaryParsed) {
        const key = cleanAuthString(acc.username).replace(/^@+/, '').toLowerCase();
        if (key && !deletedSet.has(key) && !mergedMap.has(key)) {
          mergedMap.set(key, acc);
        }
      }

      for (const acc of rootParsed) {
        const key = cleanAuthString(acc.username).replace(/^@+/, '').toLowerCase();
        if (key && !deletedSet.has(key) && !mergedMap.has(key)) {
          mergedMap.set(key, acc);
          needsSyncWrite = true;
        }
      }

      for (const defAcc of DEFAULT_DATAUSER_ACCOUNTS) {
        const key = cleanAuthString(defAcc.username).replace(/^@+/, '').toLowerCase();
        if (key && !deletedSet.has(key) && !mergedMap.has(key)) {
          mergedMap.set(key, defAcc);
          needsSyncWrite = true;
        }
      }

      const mergedList = Array.from(mergedMap.values());
      if (mergedList.length > 0) {
        cachedDataUsers = mergedList;
        if (needsSyncWrite || !fs.existsSync(activeDataUserFile) || !fs.existsSync(TMP_DATAUSER_FILE)) {
          persistDataUsersToFile(cachedDataUsers);
        }
      } else if (cachedDataUsers.length === 0) {
        cachedDataUsers = [...DEFAULT_DATAUSER_ACCOUNTS];
        persistDataUsersToFile(cachedDataUsers);
      }
      hasInitializedDataUsers = true;
    } catch (err) {
      console.warn(`[DataUser] Lỗi khởi tạo ${activeDataUserFile}:`, err);
      if (cachedDataUsers.length === 0) {
        cachedDataUsers = [...DEFAULT_DATAUSER_ACCOUNTS];
      }
      hasInitializedDataUsers = true;
    }
  }

  return { users: cachedDataUsers, filePath: activeDataUserFile, mtime: lastDataUserMtime };
}

function persistDataUsersToFile(users: DataUserAccount[]) {
  cachedDataUsers = users;
  hasInitializedDataUsers = true;
  const primaryPath = path.join(DATA_DIR, 'datauser.json');
  const rootPath = path.resolve(__dirname, 'datauser.json');
  const content = JSON.stringify(users, null, 2);

  try {
    fs.writeFileSync(TMP_DATAUSER_FILE, content, 'utf-8');
  } catch (e) {
    console.warn('[DataUser] Lỗi ghi /tmp/agritech_datauser.json:', e);
  }

  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(primaryPath, content, 'utf-8');
    lastDataUserMtime = Date.now();
  } catch (e) {
    console.warn('[DataUser] Lỗi ghi primary datauser.json:', e);
  }

  try {
    fs.writeFileSync(rootPath, content, 'utf-8');
  } catch (e) {
    console.warn('[DataUser] Lỗi ghi root datauser.json:', e);
  }
}

// Initial load on startup
loadDataUsers(true);

// ==============================================================================
// REAL-TIME SHARED CLOUD SQL + CLOUD SYNC STREAM + PEER REPLICATION (DEV <-> PRE / PUBLISHED)
// Đảm bảo khi Admin thêm/cập nhật người dùng mới sẽ lưu ngay vào Cơ sở dữ liệu dùng chung
// và đăng nhập được ngay trên mọi đường link/thiết bị mà không cần bấm "Xuất bản"
// ==============================================================================
const KNOWN_DEV_ORIGIN = 'https://ais-dev-vhtotbsluzowciamdhfmgh-498098900185.asia-southeast1.run.app';
const KNOWN_PRE_ORIGIN = 'https://ais-pre-vhtotbsluzowciamdhfmgh-498098900185.asia-southeast1.run.app';
const CLOUD_SYNC_STREAM_URL = 'https://ntfy.sh/agritech_kntt_0819b689_v2_accounts';

function escapeSqlLiteral(val: string): string {
  return String(val ?? '').replace(/'/g, "''");
}

function pgQuery(sql: string, useAdmin = false): Promise<string[][]> {
  return new Promise((resolve) => {
    const sqlHostDir =
      process.env.SQL_HOST ||
      '/app/cloudsql/evident-order-9t8c4:asia-southeast1:ai-studio-0819b689';
    const socketPath = `${sqlHostDir}/.s.PGSQL.5432`;
    if (!fs.existsSync(socketPath)) {
      return resolve([]);
    }
    const user = useAdmin
      ? process.env.SQL_ADMIN_USER || process.env.SQL_USER || 'postgres'
      : process.env.SQL_USER || process.env.SQL_ADMIN_USER || 'postgres';
    const password = useAdmin
      ? process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD || ''
      : process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD || '';
    const database = process.env.SQL_DB_NAME || 'cloud_sql_development_database';

    const client = net.createConnection(socketPath);
    let settled = false;
    const finish = (rows: string[][]) => {
      if (settled) return;
      settled = true;
      try {
        client.destroy();
      } catch {}
      resolve(rows);
    };

    const timer = setTimeout(() => finish([]), 2800);
    let clientNonce = '';
    let clientFirstMessageBare = '';
    let authMessage = '';
    let saltedPassword = Buffer.alloc(0);
    const rows: string[][] = [];
    let buffer = Buffer.alloc(0);

    client.on('connect', () => {
      const params = `user\0${user}\0database\0${database}\0\0`;
      const len = 4 + 4 + Buffer.byteLength(params);
      const buf = Buffer.alloc(len);
      buf.writeInt32BE(len, 0);
      buf.writeInt32BE(196608, 4);
      buf.write(params, 8);
      client.write(buf);
    });

    client.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      while (buffer.length >= 5) {
        const type = String.fromCharCode(buffer[0]);
        const msgLen = buffer.readInt32BE(1);
        if (buffer.length < 1 + msgLen) break;
        const payload = buffer.subarray(5, 1 + msgLen);
        buffer = buffer.subarray(1 + msgLen);

        if (type === 'R') {
          const authType = payload.readInt32BE(0);
          if (authType === 0) {
            // Auth OK
          } else if (authType === 10) {
            clientNonce = crypto.randomBytes(18).toString('base64');
            clientFirstMessageBare = `n=${user},r=${clientNonce}`;
            const clientFirstMessage = `n,,${clientFirstMessageBare}`;
            const mech = 'SCRAM-SHA-256\0';
            const msgBuf = Buffer.from(clientFirstMessage, 'utf8');
            const totalLen = 4 + Buffer.byteLength(mech) + 4 + msgBuf.length;
            const out = Buffer.alloc(1 + totalLen);
            out.write('p', 0);
            out.writeInt32BE(totalLen, 1);
            out.write(mech, 5);
            out.writeInt32BE(msgBuf.length, 5 + Buffer.byteLength(mech));
            msgBuf.copy(out, 9 + Buffer.byteLength(mech));
            client.write(out);
          } else if (authType === 11) {
            const serverFirst = payload.subarray(4).toString('utf8');
            const parts = Object.fromEntries(
              serverFirst.split(',').map((p) => [p[0], p.slice(2)])
            );
            const r = parts.r || '';
            const s = Buffer.from(parts.s || '', 'base64');
            const i = parseInt(parts.i || '4096', 10);
            saltedPassword = crypto.pbkdf2Sync(password, s, i, 32, 'sha256');
            const clientKey = crypto
              .createHmac('sha256', saltedPassword)
              .update('Client Key')
              .digest();
            const storedKey = crypto.createHash('sha256').update(clientKey).digest();
            const clientFinalWithoutProof = `c=biws,r=${r}`;
            authMessage = `${clientFirstMessageBare},${serverFirst},${clientFinalWithoutProof}`;
            const clientSignature = crypto
              .createHmac('sha256', storedKey)
              .update(authMessage)
              .digest();
            const proof = Buffer.alloc(clientKey.length);
            for (let k = 0; k < clientKey.length; k++) {
              proof[k] = clientKey[k] ^ clientSignature[k];
            }
            const clientFinal = `${clientFinalWithoutProof},p=${proof.toString('base64')}`;
            const msgBuf = Buffer.from(clientFinal, 'utf8');
            const totalLen = 4 + msgBuf.length;
            const out = Buffer.alloc(1 + totalLen);
            out.write('p', 0);
            out.writeInt32BE(totalLen, 1);
            msgBuf.copy(out, 5);
            client.write(out);
          }
        } else if (type === 'Z') {
          if (sql) {
            const qBuf = Buffer.from(sql + '\0', 'utf8');
            const out = Buffer.alloc(1 + 4 + qBuf.length);
            out.write('Q', 0);
            out.writeInt32BE(4 + qBuf.length, 1);
            qBuf.copy(out, 5);
            client.write(out);
            sql = '';
          } else {
            clearTimeout(timer);
            finish(rows);
          }
        } else if (type === 'D') {
          const numCols = payload.readInt16BE(0);
          let offset = 2;
          const row: string[] = [];
          for (let c = 0; c < numCols; c++) {
            const colLen = payload.readInt32BE(offset);
            offset += 4;
            if (colLen === -1) {
              row.push('');
            } else {
              row.push(payload.subarray(offset, offset + colLen).toString('utf8'));
              offset += colLen;
            }
          }
          rows.push(row);
        } else if (type === 'E') {
          clearTimeout(timer);
          finish(rows);
        }
      }
    });

    client.on('error', () => {
      clearTimeout(timer);
      finish(rows);
    });
  });
}

// Parameterized PostgreSQL v3 Extended Query Protocol helper (Parse + Bind + Execute + Sync)
function pgQueryParams(
  sql: string,
  params: (string | number | boolean | null)[] = [],
  useAdmin = false,
  timeoutMs = 8000
): Promise<string[][]> {
  return new Promise((resolve) => {
    const sqlHostDir =
      process.env.SQL_HOST ||
      '/app/cloudsql/evident-order-9t8c4:asia-southeast1:ai-studio-0819b689';
    const socketPath = `${sqlHostDir}/.s.PGSQL.5432`;
    if (!fs.existsSync(socketPath)) {
      return resolve([]);
    }
    const user = useAdmin
      ? process.env.SQL_ADMIN_USER || process.env.SQL_USER || 'postgres'
      : process.env.SQL_USER || process.env.SQL_ADMIN_USER || 'postgres';
    const password = useAdmin
      ? process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD || ''
      : process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD || '';
    const database = process.env.SQL_DB_NAME || 'cloud_sql_development_database';

    const client = net.createConnection(socketPath);
    let settled = false;
    const finish = (rows: string[][]) => {
      if (settled) return;
      settled = true;
      try {
        client.destroy();
      } catch {}
      resolve(rows);
    };

    const timer = setTimeout(() => finish([]), timeoutMs);
    let clientNonce = '';
    let clientFirstMessageBare = '';
    let authMessage = '';
    let saltedPassword = Buffer.alloc(0);
    const rows: string[][] = [];
    let buffer = Buffer.alloc(0);
    let querySent = false;

    const buildMsg = (typeChar: string, body: Buffer): Buffer => {
      const out = Buffer.alloc(1 + 4 + body.length);
      out.write(typeChar, 0);
      out.writeInt32BE(4 + body.length, 1);
      body.copy(out, 5);
      return out;
    };

    const sendParameterizedQuery = () => {
      // 1. Parse: ""\0 + sql\0 + Int16(0)
      const sqlBuf = Buffer.from(sql + '\0', 'utf8');
      const parseBody = Buffer.alloc(1 + sqlBuf.length + 2);
      parseBody[0] = 0;
      sqlBuf.copy(parseBody, 1);
      parseBody.writeInt16BE(0, 1 + sqlBuf.length);

      // 2. Bind: portal ""\0 + stmt ""\0 + formatCount(0) + paramCount + values + resultFormatCount(0)
      const encodedParams: (Buffer | null)[] = params.map((p) => {
        if (p === null || p === undefined) return null;
        if (typeof p === 'boolean') return Buffer.from(p ? 'true' : 'false', 'utf8');
        return Buffer.from(String(p), 'utf8');
      });
      const bindParts: Buffer[] = [Buffer.from([0, 0])];
      const hdr = Buffer.alloc(4);
      hdr.writeInt16BE(0, 0);
      hdr.writeInt16BE(encodedParams.length, 2);
      bindParts.push(hdr);
      for (const ep of encodedParams) {
        if (ep === null) {
          const nullLen = Buffer.alloc(4);
          nullLen.writeInt32BE(-1, 0);
          bindParts.push(nullLen);
        } else {
          const lenBuf = Buffer.alloc(4);
          lenBuf.writeInt32BE(ep.length, 0);
          bindParts.push(lenBuf, ep);
        }
      }
      const resFmt = Buffer.alloc(2);
      resFmt.writeInt16BE(0, 0);
      bindParts.push(resFmt);
      const bindBody = Buffer.concat(bindParts);

      // 3. Execute: portal ""\0 + maxRows(0)
      const execBody = Buffer.alloc(5);
      execBody[0] = 0;
      execBody.writeInt32BE(0, 1);

      // 4. Sync
      const syncMsg = buildMsg('S', Buffer.alloc(0));

      client.write(
        Buffer.concat([
          buildMsg('P', parseBody),
          buildMsg('B', bindBody),
          buildMsg('E', execBody),
          syncMsg,
        ])
      );
    };

    client.on('connect', () => {
      const startupParams = `user\0${user}\0database\0${database}\0\0`;
      const len = 4 + 4 + Buffer.byteLength(startupParams);
      const buf = Buffer.alloc(len);
      buf.writeInt32BE(len, 0);
      buf.writeInt32BE(196608, 4);
      buf.write(startupParams, 8);
      client.write(buf);
    });

    client.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      while (buffer.length >= 5) {
        const type = String.fromCharCode(buffer[0]);
        const msgLen = buffer.readInt32BE(1);
        if (buffer.length < 1 + msgLen) break;
        const payload = buffer.subarray(5, 1 + msgLen);
        buffer = buffer.subarray(1 + msgLen);

        if (type === 'R') {
          const authType = payload.readInt32BE(0);
          if (authType === 10) {
            clientNonce = crypto.randomBytes(18).toString('base64');
            clientFirstMessageBare = `n=${user},r=${clientNonce}`;
            const clientFirstMessage = `n,,${clientFirstMessageBare}`;
            const mech = 'SCRAM-SHA-256\0';
            const msgBuf = Buffer.from(clientFirstMessage, 'utf8');
            const totalLen = 4 + Buffer.byteLength(mech) + 4 + msgBuf.length;
            const out = Buffer.alloc(1 + totalLen);
            out.write('p', 0);
            out.writeInt32BE(totalLen, 1);
            out.write(mech, 5);
            out.writeInt32BE(msgBuf.length, 5 + Buffer.byteLength(mech));
            msgBuf.copy(out, 9 + Buffer.byteLength(mech));
            client.write(out);
          } else if (authType === 11) {
            const serverFirst = payload.subarray(4).toString('utf8');
            const parts = Object.fromEntries(
              serverFirst.split(',').map((p) => [p[0], p.slice(2)])
            );
            const r = parts.r || '';
            const s = Buffer.from(parts.s || '', 'base64');
            const i = parseInt(parts.i || '4096', 10);
            saltedPassword = crypto.pbkdf2Sync(password, s, i, 32, 'sha256');
            const clientKey = crypto
              .createHmac('sha256', saltedPassword)
              .update('Client Key')
              .digest();
            const storedKey = crypto.createHash('sha256').update(clientKey).digest();
            const clientFinalWithoutProof = `c=biws,r=${r}`;
            authMessage = `${clientFirstMessageBare},${serverFirst},${clientFinalWithoutProof}`;
            const clientSignature = crypto
              .createHmac('sha256', storedKey)
              .update(authMessage)
              .digest();
            const proof = Buffer.alloc(clientKey.length);
            for (let k = 0; k < clientKey.length; k++) {
              proof[k] = clientKey[k] ^ clientSignature[k];
            }
            const clientFinal = `${clientFinalWithoutProof},p=${proof.toString('base64')}`;
            const msgBuf = Buffer.from(clientFinal, 'utf8');
            const totalLen = 4 + msgBuf.length;
            const out = Buffer.alloc(1 + totalLen);
            out.write('p', 0);
            out.writeInt32BE(totalLen, 1);
            msgBuf.copy(out, 5);
            client.write(out);
          }
        } else if (type === 'Z') {
          if (!querySent) {
            querySent = true;
            sendParameterizedQuery();
          } else {
            clearTimeout(timer);
            finish(rows);
          }
        } else if (type === 'D') {
          const numCols = payload.readInt16BE(0);
          let offset = 2;
          const row: string[] = [];
          for (let c = 0; c < numCols; c++) {
            const colLen = payload.readInt32BE(offset);
            offset += 4;
            if (colLen === -1) {
              row.push('');
            } else {
              row.push(payload.subarray(offset, offset + colLen).toString('utf8'));
              offset += colLen;
            }
          }
          rows.push(row);
        } else if (type === 'E') {
          clearTimeout(timer);
          finish(rows);
        }
      }
    });

    client.on('error', () => {
      clearTimeout(timer);
      finish(rows);
    });
  });
}

async function ensureSharedCloudSqlStore(): Promise<void> {
  try {
    await pgQuery(
      `CREATE TABLE IF NOT EXISTS agritech_datauser_store (
        username VARCHAR(100) PRIMARY KEY,
        account_json TEXT NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        updated_at BIGINT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS agritech_qr_assignments_store (
        assignment_key VARCHAR(200) PRIMARY KEY,
        record_json TEXT NOT NULL,
        updated_at BIGINT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS agritech_uploaded_exams_store (
        exam_id VARCHAR(200) PRIMARY KEY,
        exam_json TEXT NOT NULL,
        blob_data_url TEXT,
        is_deleted BOOLEAN DEFAULT FALSE,
        updated_at BIGINT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS agritech_submissions_store (
        submission_id VARCHAR(200) PRIMARY KEY,
        teacher_username VARCHAR(120),
        submission_json TEXT NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        updated_at BIGINT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS agritech_custom_exams_store (
        exam_id VARCHAR(200) PRIMARY KEY,
        exam_json TEXT NOT NULL,
        updated_at BIGINT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS agritech_mistakes_store (
        question_id VARCHAR(200) PRIMARY KEY,
        record_json TEXT NOT NULL,
        updated_at BIGINT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS agritech_visitor_stats_store (
        store_key VARCHAR(100) PRIMARY KEY,
        state_json TEXT NOT NULL,
        updated_at BIGINT NOT NULL
      );
      GRANT ALL PRIVILEGES ON TABLE agritech_datauser_store TO PUBLIC;
      GRANT ALL PRIVILEGES ON TABLE agritech_qr_assignments_store TO PUBLIC;
      GRANT ALL PRIVILEGES ON TABLE agritech_uploaded_exams_store TO PUBLIC;
      GRANT ALL PRIVILEGES ON TABLE agritech_submissions_store TO PUBLIC;
      GRANT ALL PRIVILEGES ON TABLE agritech_custom_exams_store TO PUBLIC;
      GRANT ALL PRIVILEGES ON TABLE agritech_mistakes_store TO PUBLIC;
      GRANT ALL PRIVILEGES ON TABLE agritech_visitor_stats_store TO PUBLIC;
      GRANT ALL PRIVILEGES ON TABLE users TO PUBLIC;`,
      true
    );
  } catch {}
}

async function upsertAccountToSharedStores(account: DataUserAccount): Promise<void> {
  const cleanU = cleanAuthString(account.username).replace(/^@+/, '').toLowerCase();
  if (!cleanU) return;
  const nowMs = Date.now();
  const jsonStr = JSON.stringify(account);
  const passStr = String(account.password || 'gv123');
  const roleStr = String(account.role || 'teacher');
  const nameStr = String(account.fullName || cleanU);
  const classStr = String(account.className || 'Tổ Công Nghệ Nông nghiệp');
  const isAct = account.is_active !== false;

  // 1. Write synchronously (awaited) to shared Cloud SQL (accessible immediately by both ais-dev and ais-pre)
  await Promise.allSettled([
    pgQueryParams(
      `INSERT INTO agritech_datauser_store (username, account_json, is_deleted, updated_at)
       VALUES ($1, $2, FALSE, $3)
       ON CONFLICT (username) DO UPDATE SET
         account_json = EXCLUDED.account_json,
         is_deleted = FALSE,
         updated_at = EXCLUDED.updated_at`,
      [cleanU, jsonStr, nowMs]
    ),
    pgQueryParams(
      `INSERT INTO users (username, password, role, full_name, class_name, must_change_password, is_active)
       VALUES ($1, $2, $3, $4, $5, FALSE, $6)
       ON CONFLICT (username) DO UPDATE SET
         password = EXCLUDED.password,
         role = EXCLUDED.role,
         full_name = EXCLUDED.full_name,
         class_name = EXCLUDED.class_name,
         must_change_password = FALSE,
         is_active = EXCLUDED.is_active`,
      [cleanU, passStr, roleStr, nameStr, classStr, isAct]
    ),
  ]);

  // 2. Publish to real-time Cloud Sync Stream (accessible by any container & any browser)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    await fetch(CLOUD_SYNC_STREAM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        account,
        ts: nowMs,
      }),
      signal: controller.signal,
    });
  } catch {} finally {
    clearTimeout(timer);
  }
}

async function deleteAccountFromSharedStores(username: string): Promise<void> {
  const cleanU = cleanAuthString(username).replace(/^@+/, '').toLowerCase();
  const strippedU = stripAccents(cleanU).replace(/\s+/g, '');
  if (!cleanU || cleanU === 'admin') return;
  const nowMs = Date.now();
  const keysToTombstone = Array.from(new Set([cleanU, strippedU].filter((u) => u && u !== 'admin')));

  // Await parameterized Cloud SQL persistence so deletion is durable immediately without re-publishing
  await Promise.allSettled(
    keysToTombstone.flatMap((uKey) => [
      pgQueryParams(
        `INSERT INTO agritech_datauser_store (username, account_json, is_deleted, updated_at)
         VALUES ($1, '{}', TRUE, $2)
         ON CONFLICT (username) DO UPDATE SET
           account_json = '{}',
           is_deleted = TRUE,
           updated_at = EXCLUDED.updated_at`,
        [uKey, nowMs]
      ),
      pgQueryParams(`DELETE FROM users WHERE LOWER(TRIM(username)) = $1`, [uKey]),
    ])
  );

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    await fetch(CLOUD_SYNC_STREAM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete',
        username: cleanU,
        ts: nowMs,
      }),
      signal: controller.signal,
    });
  } catch {} finally {
    clearTimeout(timer);
  }
}

function isPeerReplicatedRequest(req?: Request): boolean {
  if (!req) return false;
  return (
    String(req.headers['x-peer-replicated'] || '') === '1' ||
    String(req.query?.peerReplicated || '') === '1' ||
    Boolean(req.body?.peerReplicated)
  );
}

function getPeerOrigins(req?: Request): string[] {
  const candidates = new Set<string>([KNOWN_DEV_ORIGIN, KNOWN_PRE_ORIGIN]);
  const rawHost = String(req?.headers?.['x-forwarded-host'] || req?.headers?.host || '').trim().toLowerCase();
  const rawOrigin = String(req?.headers?.origin || '').trim().replace(/\/+$/, '');

  if (rawHost && rawHost.includes('.run.app')) {
    const selfUrl = `https://${rawHost}`;
    if (selfUrl.includes('//ais-dev-')) {
      candidates.add(selfUrl.replace('//ais-dev-', '//ais-pre-'));
    } else if (selfUrl.includes('//ais-pre-')) {
      candidates.add(selfUrl.replace('//ais-pre-', '//ais-dev-'));
    }
  }

  if (rawOrigin && rawOrigin.includes('.run.app')) {
    if (rawOrigin.includes('//ais-dev-')) {
      candidates.add(rawOrigin.replace('//ais-dev-', '//ais-pre-'));
    } else if (rawOrigin.includes('//ais-pre-')) {
      candidates.add(rawOrigin.replace('//ais-pre-', '//ais-dev-'));
    }
  }

  return Array.from(candidates).filter((url) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' || !parsed.host.endsWith('.run.app')) return false;
      if (!rawHost) return true;
      return parsed.host.toLowerCase() !== rawHost;
    } catch {
      return false;
    }
  });
}

async function replicateAccountUpsertToPeers(
  accountPayload: Record<string, any>,
  allUsers: DataUserAccount[],
  req?: Request
): Promise<void> {
  // Always persist to shared Cloud SQL + Cloud Sync Stream first
  if (accountPayload && accountPayload.username && accountPayload.password) {
    await upsertAccountToSharedStores(accountPayload as DataUserAccount);
  }
  if (isPeerReplicatedRequest(req)) return;
  const peers = getPeerOrigins(req);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Admin-Role': 'admin',
    'X-Auth-Role': 'admin',
    'X-Auth-Username': 'admin',
    'X-Peer-Replicated': '1',
  };
  if (typeof req?.headers?.authorization === 'string' && req.headers.authorization.trim()) {
    headers.Authorization = req.headers.authorization;
  }
  await Promise.allSettled(
    peers.map(async (peer) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      try {
        await fetch(`${peer}/api/auth/datauser?adminRole=admin&peerReplicated=1`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...accountPayload,
            adminRole: 'admin',
            peerReplicated: true,
          }),
          signal: controller.signal,
        });
      } catch {
        // Ignore network errors to inactive peer
      } finally {
        clearTimeout(timer);
      }
    })
  );
}

async function replicateAccountDeleteToPeers(username: string, req?: Request): Promise<void> {
  await deleteAccountFromSharedStores(username);
  if (isPeerReplicatedRequest(req)) return;
  const peers = getPeerOrigins(req);
  const headers: Record<string, string> = {
    'X-Admin-Role': 'admin',
    'X-Auth-Role': 'admin',
    'X-Auth-Username': 'admin',
    'X-Peer-Replicated': '1',
  };
  if (typeof req?.headers?.authorization === 'string' && req.headers.authorization.trim()) {
    headers.Authorization = req.headers.authorization;
  }
  await Promise.allSettled(
    peers.map(async (peer) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      try {
        await fetch(
          `${peer}/api/auth/datauser/${encodeURIComponent(username)}?adminRole=admin&peerReplicated=1`,
          {
            method: 'DELETE',
            headers,
            signal: controller.signal,
          }
        );
      } catch {
        // Ignore network errors
      } finally {
        clearTimeout(timer);
      }
    })
  );
}

let lastPeerPullMs = 0;
async function pullAndMergeAccountsFromPeers(
  req?: Request,
  forcePull = false
): Promise<DataUserAccount[]> {
  if (isPeerReplicatedRequest(req)) {
    return loadDataUsers(false).users;
  }
  const now = Date.now();
  if (!forcePull && now - lastPeerPullMs < 1000) {
    return loadDataUsers(false).users;
  }
  lastPeerPullMs = now;

  const deletedSet = loadDeletedUsernamesServer();
  let deletedChanged = false;
  let { users } = loadDataUsers(true);
  const existingMap = new Map<string, DataUserAccount>();
  users.forEach((u) => {
    existingMap.set(cleanAuthString(u.username).replace(/^@+/, '').toLowerCase(), u);
  });

  let hasChanges = false;
  const prepended: DataUserAccount[] = [];

  const applyIncomingAccount = (rawAcc: any) => {
    if (!rawAcc || !rawAcc.username || !rawAcc.password) return;
    const cleanU = stripAccents(cleanAuthString(rawAcc.username))
      .replace(/^@+/, '')
      .replace(/\s+/g, '')
      .toLowerCase();
    if (!cleanU || deletedSet.has(cleanU)) return;
    const cleanP = cleanAuthString(decodeServerSecret(String(rawAcc.password)));
    if (!cleanP) return;

    const rRaw = String(rawAcc.role || 'teacher').toLowerCase();
    const validRole: 'admin' | 'teacher' | 'student' =
      rRaw === 'admin' ? 'admin' : rRaw === 'student' ? 'student' : 'teacher';
    const defaultPay = validRole === 'student' ? 100000 : 200000;
    const rawCandidate = rawAcc.payment_amount ?? rawAcc.paymentAmount;
    const resolvedPayment = normalizePaymentAmount(
      rawCandidate !== undefined && rawCandidate !== null ? Number(rawCandidate) : defaultPay
    );
    const resolvedStart = normalizeDateYMD(
      rawAcc.start_date || rawAcc.startDate || rawAcc.created_at || rawAcc.createdAt
    );
    const resolvedExpires = isServerUnlimitedAccount(cleanU, validRole)
      ? 'Vĩnh viễn'
      : rawAcc.expires_at && /^\d{4}-\d{2}-\d{2}$/.test(String(rawAcc.expires_at))
      ? String(rawAcc.expires_at)
      : computeExpiresAtYMD(resolvedStart, resolvedPayment, validRole);
    const fullNameStr = String(rawAcc.fullName || cleanU).trim();
    const rawAliases = Array.isArray(rawAcc.aliases) ? rawAcc.aliases : [];
    const mergedAliases = Array.from(
      new Set(
        [
          ...rawAliases,
          cleanU,
          stripAccents(fullNameStr),
          stripAccents(fullNameStr).replace(/\s+/g, ''),
        ].filter(Boolean)
      )
    );
    const isAct =
      rawAcc.is_active !== undefined
        ? Boolean(rawAcc.is_active)
        : rawAcc.isActive !== undefined
        ? Boolean(rawAcc.isActive)
        : true;

    const existingLocal = existingMap.get(cleanU);
    if (!existingLocal) {
      const newAcc: DataUserAccount = {
        id: rawAcc.id || Date.now() + prepended.length,
        username: cleanU,
        password: cleanP,
        role: validRole,
        fullName: fullNameStr,
        email: String(rawAcc.email || `${cleanU}@truong.edu.vn`).trim(),
        className: String(
          rawAcc.className || (validRole === 'student' ? '12A1' : 'Tổ Công Nghệ Nông nghiệp')
        ).trim(),
        must_change_password: false,
        is_active: isAct,
        created_at: rawAcc.created_at || rawAcc.createdAt || new Date().toISOString(),
        payment_amount: resolvedPayment,
        start_date: resolvedStart,
        expires_at: resolvedExpires,
        aliases: mergedAliases,
      };
      existingMap.set(cleanU, newAcc);
      prepended.push(newAcc);
      hasChanges = true;
    } else {
      const localPass = cleanAuthString(decodeServerSecret(String(existingLocal.password)));
      const passDiff = localPass !== cleanP;
      const roleDiff = existingLocal.role !== validRole;
      const nameDiff = fullNameStr && existingLocal.fullName !== fullNameStr;
      const activeDiff = (existingLocal.is_active !== false) !== isAct;
      const payDiff = existingLocal.payment_amount !== resolvedPayment;
      const startDiff = existingLocal.start_date !== resolvedStart;

      if (passDiff || roleDiff || nameDiff || activeDiff || payDiff || startDiff) {
        existingMap.set(cleanU, {
          ...existingLocal,
          password: cleanP,
          role: validRole,
          fullName: fullNameStr || existingLocal.fullName,
          is_active: isAct,
          payment_amount: resolvedPayment,
          start_date: resolvedStart,
          expires_at: resolvedExpires,
          aliases: mergedAliases,
        });
        hasChanges = true;
      }
    }
  };

  // 1. Pull from shared Cloud SQL database (agritech_datauser_store)
  try {
    const dbRows = await pgQuery(
      `SELECT username, account_json, is_deleted, updated_at FROM agritech_datauser_store ORDER BY updated_at ASC;`
    );
    for (const [u, accJson, isDel] of dbRows) {
      const cleanU = stripAccents(cleanAuthString(u)).replace(/^@+/, '').replace(/\s+/g, '').toLowerCase();
      if (!cleanU) continue;
      if (isDel === 't' || isDel === 'true' || isDel === '1') {
        if (cleanU !== 'admin') {
          deletedSet.add(cleanU);
          deletedChanged = true;
          if (existingMap.has(cleanU)) {
            existingMap.delete(cleanU);
            hasChanges = true;
          }
        }
      } else {
        // Never resurrect an account already marked deleted in deletedSet
        if (deletedSet.has(cleanU)) continue;
        try {
          const parsedAcc = JSON.parse(accJson);
          applyIncomingAccount(parsedAcc);
        } catch {}
      }
    }
  } catch {}

  // 2. Pull from real-time Cloud Sync Stream (ntfy.sh)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const streamRes = await fetch(`${CLOUD_SYNC_STREAM_URL}/json?poll=1&since=all`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (streamRes.ok) {
      const text = await streamRes.text();
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      const latestStreamMap = new Map<string, { action: 'upsert' | 'delete'; account?: any }>();
      for (const line of lines) {
        try {
          const evt = JSON.parse(line);
          if (evt?.event !== 'message' || !evt.message) continue;
          const payload = JSON.parse(evt.message);
          if (payload?.action === 'delete' && payload.username) {
            const delU = stripAccents(cleanAuthString(payload.username))
              .replace(/^@+/, '')
              .replace(/\s+/g, '')
              .toLowerCase();
            if (delU && delU !== 'admin') {
              latestStreamMap.set(delU, { action: 'delete' });
            }
          } else if (payload?.action === 'upsert' && payload.account) {
            const upU = stripAccents(cleanAuthString(payload.account.username))
              .replace(/^@+/, '')
              .replace(/\s+/g, '')
              .toLowerCase();
            if (upU) {
              latestStreamMap.set(upU, { action: 'upsert', account: payload.account });
            }
          }
        } catch {}
      }

      for (const [streamU, entry] of latestStreamMap.entries()) {
        if (entry.action === 'delete') {
          if (streamU !== 'admin') {
            deletedSet.add(streamU);
            deletedChanged = true;
            if (existingMap.has(streamU)) {
              existingMap.delete(streamU);
              hasChanges = true;
            }
          }
        } else if (entry.action === 'upsert' && entry.account) {
          if (deletedSet.has(streamU)) continue;
          applyIncomingAccount(entry.account);
        }
      }
    }
  } catch {}

  if (deletedChanged) {
    saveDeletedUsernamesServer(deletedSet);
  }

  if (hasChanges) {
    const updatedUsers = [
      ...prepended.filter((a) => !deletedSet.has(cleanAuthString(a.username).toLowerCase())),
      ...users
        .filter((u) => !deletedSet.has(cleanAuthString(u.username).replace(/^@+/, '').toLowerCase()))
        .map((u) => {
          const k = cleanAuthString(u.username).replace(/^@+/, '').toLowerCase();
          return existingMap.get(k) || u;
        }),
    ];
    persistDataUsersToFile(updatedUsers);
    users = updatedUsers;
  }

  return users;
}

// Real-Time Cross-Instance Cloud SQL Watermark Watcher
// Tự động phát hiện mọi thay đổi dữ liệu mới từ các thiết bị/nền tảng/máy chủ khác (ais-dev <-> ais-pre <-> Cloud Run)
// và phát tín hiệu SSE ngay lập tức tới tất cả trình duyệt & thiết bị đang kết nối.
const lastSeenSqlWatermarks: Record<string, string> = {};
let isCheckingSqlWatermarks = false;
let lastSqlWatermarkCheckMs = 0;

async function checkCloudSqlWatermarksAndBroadcast(force = false): Promise<string[]> {
  const now = Date.now();
  if (isCheckingSqlWatermarks) return [];
  if (!force && now - lastSqlWatermarkCheckMs < 1500) return [];
  isCheckingSqlWatermarks = true;
  lastSqlWatermarkCheckMs = now;
  const changedDomains: string[] = [];

  try {
    const rows = await pgQuery(
      `SELECT 'datauser' AS k, COALESCE(MAX(updated_at), 0)::text AS v, COUNT(*)::text AS c FROM agritech_datauser_store
       UNION ALL SELECT 'uploaded_exams', COALESCE(MAX(updated_at), 0)::text, COUNT(*)::text FROM agritech_uploaded_exams_store
       UNION ALL SELECT 'submissions', COALESCE(MAX(updated_at), 0)::text, COUNT(*)::text FROM agritech_submissions_store
       UNION ALL SELECT 'assignments', COALESCE(MAX(updated_at), 0)::text, COUNT(*)::text FROM agritech_qr_assignments_store
       UNION ALL SELECT 'custom_exams', COALESCE(MAX(updated_at), 0)::text, COUNT(*)::text FROM agritech_custom_exams_store
       UNION ALL SELECT 'mistakes', COALESCE(MAX(updated_at), 0)::text, COUNT(*)::text FROM agritech_mistakes_store
       UNION ALL SELECT 'visitor_stats', COALESCE(MAX(updated_at), 0)::text, COUNT(*)::text FROM agritech_visitor_stats_store;`
    );

    if (!rows || rows.length === 0) return [];

    const isInitialBaseline = Object.keys(lastSeenSqlWatermarks).length === 0;
    const toRefresh: string[] = [];

    for (const row of rows) {
      const key = String(row[0] || '');
      const sig = `${row[1] || '0'}:${row[2] || '0'}`;
      if (!key) continue;
      if (lastSeenSqlWatermarks[key] && lastSeenSqlWatermarks[key] !== sig) {
        toRefresh.push(key);
      }
      lastSeenSqlWatermarks[key] = sig;
    }

    if (isInitialBaseline || toRefresh.length === 0) {
      return [];
    }

    for (const domainKey of toRefresh) {
      try {
        if (domainKey === 'datauser') {
          await pullAndMergeAccountsFromPeers(undefined, true);
          changedDomains.push('datauser');
          broadcastSSE('datauser_updated', {
            action: 'cloud_sync',
            changedAt: Date.now(),
          });
        } else if (domainKey === 'uploaded_exams') {
          await pullAndMergeUploadedExamsFromCloudSql(true);
          changedDomains.push('uploadedExams');
          broadcastSSE('uploaded_exams_updated', {
            changedAt: Date.now(),
            source: 'cloud_sync',
          });
        } else if (domainKey === 'submissions') {
          await pullAndMergeSubmissionsFromCloudSqlAndPeers(undefined, true);
          changedDomains.push('submissions');
          touchSyncVersion('submissions');
        } else if (domainKey === 'assignments') {
          await loadAssignmentsFromCloudSql();
          changedDomains.push('assignments');
          broadcastSSE('assignment_updated', {
            changedAt: Date.now(),
            source: 'cloud_sync',
          });
        } else if (domainKey === 'custom_exams') {
          const changed = await pullAndMergeCustomExamsFromCloudSql(true);
          if (changed) {
            changedDomains.push('customExams');
            broadcastSSE('custom_exams_updated', sharedCustomExams);
          }
        } else if (domainKey === 'mistakes') {
          const changed = await pullAndMergeMistakesFromCloudSql(true);
          if (changed) {
            changedDomains.push('mistakes');
            broadcastSSE('mistakes_updated', sharedMistakesRecord);
          }
        } else if (domainKey === 'visitor_stats') {
          const changed = await pullAndMergeVisitorStatsFromCloudSql(true);
          if (changed) {
            changedDomains.push('visitorStats');
            broadcastSSE('visitor_stats_updated', getVisitorStatsSnapshot());
          }
        }
      } catch {}
    }
  } catch {
    // Ignore transient SQL errors
  } finally {
    isCheckingSqlWatermarks = false;
  }

  return changedDomains;
}

async function runFullTwoWayCloudSync(): Promise<{
  usersCount: number;
  uploadedExamsCount: number;
  submissionsCount: number;
  assignmentsCount: number;
  customExamsCount: number;
  mistakesCount: number;
}> {
  await ensureSharedCloudSqlStore();

  // 1. Tài khoản người dùng (ưu tiên đồng bộ cả danh sách xóa tombstones 2 chiều)
  const localDeletedUsers = loadDeletedUsernamesServer();
  for (const delU of Array.from(localDeletedUsers)) {
    if (!delU || delU === 'admin') continue;
    await pgQueryParams(
      `INSERT INTO agritech_datauser_store (username, account_json, is_deleted, updated_at)
       VALUES ($1, '{}', TRUE, $2)
       ON CONFLICT (username) DO NOTHING`,
      [delU, Date.now()]
    );
  }
  await pullAndMergeAccountsFromPeers(undefined, true);
  const { users } = loadDataUsers(true);
  const deletedUsers = loadDeletedUsernamesServer();
  for (const acc of users) {
    const cleanU = cleanAuthString(acc.username).replace(/^@+/, '').toLowerCase();
    if (!cleanU || deletedUsers.has(cleanU)) continue;
    await Promise.allSettled([
      pgQueryParams(
        `INSERT INTO agritech_datauser_store (username, account_json, is_deleted, updated_at)
         VALUES ($1, $2, FALSE, $3)
         ON CONFLICT (username) DO NOTHING`,
        [cleanU, JSON.stringify(acc), Date.now()]
      ),
      pgQueryParams(
        `INSERT INTO users (username, password, role, full_name, class_name, must_change_password, is_active)
         VALUES ($1, $2, $3, $4, $5, FALSE, $6)
         ON CONFLICT (username) DO NOTHING`,
        [
          cleanU,
          String(acc.password || 'gv123'),
          String(acc.role || 'teacher'),
          String(acc.fullName || cleanU),
          String(acc.className || 'Tổ Công Nghệ Nông nghiệp'),
          acc.is_active !== false,
        ]
      ),
    ]);
  }
  persistDataUsersToFile(users);
  saveDeletedUsernamesServer(deletedUsers);

  // 2. Tài liệu / Đề thi tải lên (đồng bộ 2 chiều + ghi lại data/uploaded_exams.json & data/deleted_uploaded_exams.json)
  await pullAndMergeUploadedExamsFromCloudSql(true);
  const deletedDocs = loadDeletedUploadedExamIdsServer();
  for (const ex of sharedUploadedExams) {
    if (!ex?.id || deletedDocs.has(String(ex.id))) continue;
    const blob = loadPersistentBlob(String(ex.id));
    await pgQueryParams(
      `INSERT INTO agritech_uploaded_exams_store (exam_id, exam_json, blob_data_url, is_deleted, updated_at)
       VALUES ($1, $2, $3, FALSE, $4)
       ON CONFLICT (exam_id) DO NOTHING`,
      [String(ex.id), JSON.stringify(toLightweightUploadedExam(ex)), blob, Date.now()]
    );
  }
  persistUploadedExams();
  saveDeletedUploadedExamIdsServer(deletedDocs);

  // 3. Giao bài QR
  await loadAssignmentsFromCloudSql();
  persistAssignments();

  // 4. Bảng điểm & Bài làm học sinh
  await pullAndMergeSubmissionsFromCloudSqlAndPeers(undefined, true);
  for (const sub of inMemorySubmissions) {
    if (!sub?.id || String(sub.id).startsWith('sub_0') || String(sub.id) === 'sub_10') continue;
    if (deletedSubmissionIdsSet.has(String(sub.id))) continue;
    await upsertSubmissionToCloudSql(sub);
  }
  persistSubmissionsToFile();

  // 5. Đề thi ngẫu nhiên (Custom Exams)
  await pullAndMergeCustomExamsFromCloudSql(true);
  for (const ex of sharedCustomExams) {
    if (ex?.id || ex?.code) {
      await upsertCustomExamToCloudSql(ex);
    }
  }
  persistCustomExams();

  // 6. Thống kê câu sai (Mistakes Analytics)
  await pullAndMergeMistakesFromCloudSql(true);
  if (Object.keys(sharedMistakesRecord).length > 0) {
    await upsertMistakesToCloudSql(sharedMistakesRecord);
  }
  persistMistakes();

  // 7. Thống kê truy cập & lượt tải (Visitor Stats)
  await pullAndMergeVisitorStatsFromCloudSql(true);
  await upsertVisitorStatsToCloudSql();
  persistVisitorStatsToFile();

  // Cập nhật baseline watermarks sau khi đồng bộ toàn bộ
  await checkCloudSqlWatermarksAndBroadcast(true);

  return {
    usersCount: users.length,
    uploadedExamsCount: sharedUploadedExams.length,
    submissionsCount: inMemorySubmissions.length,
    assignmentsCount: sharedAssignmentsMap.size,
    customExamsCount: sharedCustomExams.length,
    mistakesCount: Object.keys(sharedMistakesRecord).length,
  };
}

// Khởi tạo bảng Cloud SQL dùng chung và đồng bộ toàn diện 7 nhóm dữ liệu khi khởi động máy chủ
setTimeout(async () => {
  try {
    await runFullTwoWayCloudSync();
  } catch {}
}, 800);

// Bộ giám sát thay đổi Cloud SQL thời gian thực giữa tất cả các nền tảng / thiết bị / instance
setInterval(() => {
  if (sseClients.size > 0) {
    void checkCloudSqlWatermarksAndBroadcast(false);
  }
}, 2500);

setInterval(() => {
  if (sseClients.size === 0) {
    void checkCloudSqlWatermarksAndBroadcast(false);
  }
}, 15000);

// Shared Exam Assignments store (so any custom or assigned exam works permanently across all student devices via Link/QR 24/7)
const ASSIGNMENTS_FILE = path.join(DATA_DIR, 'assignments.json');
const TMP_ASSIGNMENTS_FILE = '/tmp/agritech_assignments.json';
const sharedAssignmentsMap = new Map<string, any>();

function loadAssignmentsFromDisk() {
  for (const file of [TMP_ASSIGNMENTS_FILE, ASSIGNMENTS_FILE]) {
    try {
      if (fs.existsSync(file)) {
        const raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
        if (raw && typeof raw === 'object') {
          Object.entries(raw).forEach(([k, v]) => {
            if (v && typeof v === 'object') {
              sharedAssignmentsMap.set(k, v);
            }
          });
        }
      }
    } catch (e) {
      console.warn(`[Assignments] Could not load ${file}:`, e);
    }
  }
}

loadAssignmentsFromDisk();

function stripHeavyBlobFromRecord(record: any): any {
  if (!record || typeof record !== 'object') return record;
  if (record.exam && record.exam.attachedFileDataUrl) {
    const { attachedFileDataUrl: _omitted, ...lightweightExam } = record.exam;
    return { ...record, exam: lightweightExam };
  }
  return record;
}

function persistAssignments() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const obj: Record<string, any> = {};
    sharedAssignmentsMap.forEach((v, k) => {
      obj[k] = stripHeavyBlobFromRecord(v);
    });
    const content = JSON.stringify(obj, null, 2);
    try {
      fs.writeFileSync(TMP_ASSIGNMENTS_FILE, content, 'utf-8');
    } catch {}
    fs.writeFileSync(ASSIGNMENTS_FILE, content, 'utf-8');
  } catch (e) {
    console.warn('[Assignments] Could not save assignments.json:', e);
  }
}

async function upsertAssignmentKeysToCloudSql(keys: string[], record: any): Promise<void> {
  if (!keys.length || !record) return;
  try {
    const lightRecord = stripHeavyBlobFromRecord(record);
    const escJson = escapeSqlLiteral(JSON.stringify(lightRecord));
    const nowMs = Date.now();
    const statements = keys
      .map((k) => {
        const escK = escapeSqlLiteral(String(k).slice(0, 200));
        return `INSERT INTO agritech_qr_assignments_store (assignment_key, record_json, updated_at)
                VALUES ('${escK}', '${escJson}', ${nowMs})
                ON CONFLICT (assignment_key) DO UPDATE SET
                  record_json = EXCLUDED.record_json,
                  updated_at = EXCLUDED.updated_at;`;
      })
      .join('\n');
    await pgQuery(statements);
  } catch {}
}

async function deleteAssignmentKeysFromCloudSql(keys: string[]): Promise<void> {
  if (!keys.length) return;
  try {
    await Promise.allSettled(
      keys.map((k) =>
        pgQueryParams(`DELETE FROM agritech_qr_assignments_store WHERE assignment_key = $1`, [
          String(k).slice(0, 200),
        ])
      )
    );
  } catch {}
}

async function loadAssignmentsFromCloudSql(): Promise<void> {
  try {
    const deletedDocIds = loadDeletedUploadedExamIdsServer();
    const rows = await pgQuery(
      `SELECT assignment_key, record_json FROM agritech_qr_assignments_store ORDER BY updated_at ASC;`
    );
    let loadedAny = false;
    for (const [k, jsonStr] of rows) {
      if (!k || !jsonStr) continue;
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed && (parsed.exam || k.startsWith('closed_lock__'))) {
          if (parsed.exam?.id && deletedDocIds.has(String(parsed.exam.id))) continue;
          sharedAssignmentsMap.set(k, parsed);
          loadedAny = true;
        }
      } catch {}
    }
    if (loadedAny) {
      persistAssignments();
    }
  } catch {}
}

async function lookupAssignmentFromCloudSqlOrPeers(
  key: string,
  qTeacher: string,
  req?: Request
): Promise<any | null> {
  const candidateKeys = new Set<string>();
  const isGenericActive = !key || key === 'active' || key === '__latest_active__';
  if (isGenericActive) {
    if (qTeacher) candidateKeys.add(`teacher_latest__${qTeacher}`);
    candidateKeys.add('__latest_active__');
  } else {
    if (qTeacher) candidateKeys.add(`${qTeacher}__${key.toLowerCase()}`);
    candidateKeys.add(key);
    candidateKeys.add(key.toLowerCase());
  }

  // 1. Try Cloud SQL permanent store
  try {
    for (const ck of candidateKeys) {
      const escK = escapeSqlLiteral(ck.slice(0, 200));
      const rows = await pgQuery(
        `SELECT record_json FROM agritech_qr_assignments_store WHERE assignment_key = '${escK}' LIMIT 1;`
      );
      if (rows.length > 0 && rows[0][0]) {
        const parsed = JSON.parse(rows[0][0]);
        if (parsed && parsed.exam) {
          sharedAssignmentsMap.set(ck, parsed);
          persistAssignments();
          return parsed;
        }
      }
    }
  } catch {}

  // 2. Try peer origin (ais-dev <-> ais-pre) if not already peer-replicated
  if (!isPeerReplicatedRequest(req)) {
    const peers = getPeerOrigins(req);
    for (const peer of peers) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2200);
      try {
        const tQuery = qTeacher ? `&teacher=${encodeURIComponent(qTeacher)}` : '';
        const peerRes = await fetch(
          `${peer}/api/assignments/${encodeURIComponent(key || 'active')}?peerReplicated=1${tQuery}`,
          {
            headers: { 'X-Peer-Replicated': '1' },
            signal: controller.signal,
          }
        );
        clearTimeout(timer);
        if (peerRes.ok) {
          const payload = await peerRes.json();
          if (payload?.success && payload?.data?.exam) {
            const rec = payload.data;
            candidateKeys.forEach((ck) => sharedAssignmentsMap.set(ck, rec));
            persistAssignments();
            return rec;
          }
        }
      } catch {
      } finally {
        clearTimeout(timer);
      }
    }
  }

  return null;
}

interface ClosedSessionInfo {
  isClosed: boolean;
  closedAt?: string;
  closedAtMs?: number;
  closedBy?: string;
  closedByName?: string;
  examId?: string;
  examCode?: string;
  teacherUsername?: string;
  scope?: 'single' | 'all_teacher' | 'all_system';
  reason?: string;
}

function normalizeSessionKeyPart(val?: string | null): string {
  return String(val || '')
    .trim()
    .replace(/^@+/, '')
    .toLowerCase();
}

function buildClosedLockKey(teacherNorm: string, examNorm: string): string {
  return `closed_lock__${teacherNorm || 'global'}__${examNorm || 'all'}`;
}

function getClosedSessionInfoFromMemory(params: {
  examId?: string;
  examCode?: string;
  teacherUsername?: string;
  record?: any;
}): ClosedSessionInfo {
  const teacherNorm = normalizeSessionKeyPart(
    params.teacherUsername || params.record?.config?.teacherUsername
  );
  const examIdNorm = normalizeSessionKeyPart(params.examId || params.record?.exam?.id);
  const examCodeNorm = normalizeSessionKeyPart(params.examCode || params.record?.exam?.code);
  const recordTs = Number(params.record?.timestampMs || 0);

  // 1. Direct closed flag on the matched assignment record itself
  if (params.record && params.record.isClosed === true) {
    return {
      isClosed: true,
      closedAt: params.record.closedAt || undefined,
      closedAtMs: Number(params.record.closedAtMs || 0) || undefined,
      closedBy: params.record.closedBy || teacherNorm || undefined,
      closedByName: params.record.closedByName || params.record?.config?.teacherName || undefined,
      examId: params.record?.exam?.id || params.examId || undefined,
      examCode: params.record?.exam?.code || params.examCode || undefined,
      teacherUsername: teacherNorm || undefined,
      scope: 'single',
      reason: params.record.closedReason || 'Giáo viên đã kết thúc bài thi sớm và chốt bảng điểm.',
    };
  }

  // 2. Check specific exam lock keys (teacher-scoped first, then global)
  const specificLockKeys: string[] = [];
  if (teacherNorm) {
    if (examIdNorm) specificLockKeys.push(buildClosedLockKey(teacherNorm, examIdNorm));
    if (examCodeNorm) specificLockKeys.push(buildClosedLockKey(teacherNorm, examCodeNorm));
  }
  if (examIdNorm) specificLockKeys.push(buildClosedLockKey('global', examIdNorm));
  if (examCodeNorm) specificLockKeys.push(buildClosedLockKey('global', examCodeNorm));

  for (const lk of specificLockKeys) {
    const lockRec = sharedAssignmentsMap.get(lk);
    if (lockRec && lockRec.isClosed === true) {
      const lockMs = Number(lockRec.closedAtMs || lockRec.timestampMs || 0);
      // If a brand-new assignment for this exam was created AFTER the lock, treat as reopened
      if (recordTs > 0 && lockMs > 0 && recordTs > lockMs) {
        continue;
      }
      return {
        isClosed: true,
        closedAt: lockRec.closedAt || lockRec.updatedAt || undefined,
        closedAtMs: lockMs || undefined,
        closedBy: lockRec.closedBy || teacherNorm || undefined,
        closedByName: lockRec.closedByName || undefined,
        examId: lockRec.examId || params.examId || undefined,
        examCode: lockRec.examCode || params.examCode || undefined,
        teacherUsername: lockRec.teacherUsername || teacherNorm || undefined,
        scope: 'single',
        reason: lockRec.reason || 'Giáo viên đã kết thúc bài thi sớm và chốt bảng điểm.',
      };
    }
  }

  // 3. Check teacher-wide "all sessions ended" lock
  if (teacherNorm) {
    const teacherAllLock = sharedAssignmentsMap.get(buildClosedLockKey(teacherNorm, 'all'));
    if (teacherAllLock && teacherAllLock.isClosed === true) {
      const lockMs = Number(teacherAllLock.closedAtMs || teacherAllLock.timestampMs || 0);
      if (!(recordTs > 0 && lockMs > 0 && recordTs > lockMs)) {
        return {
          isClosed: true,
          closedAt: teacherAllLock.closedAt || teacherAllLock.updatedAt || undefined,
          closedAtMs: lockMs || undefined,
          closedBy: teacherAllLock.closedBy || teacherNorm,
          closedByName: teacherAllLock.closedByName || undefined,
          examId: params.examId || undefined,
          examCode: params.examCode || undefined,
          teacherUsername: teacherNorm,
          scope: 'all_teacher',
          reason:
            teacherAllLock.reason || 'Giáo viên đã kết thúc bài thi sớm và chốt bảng điểm.',
        };
      }
    }
  }

  // 4. Check system-wide global lock (if admin closed all)
  const globalAllLock = sharedAssignmentsMap.get(buildClosedLockKey('global', 'all'));
  if (globalAllLock && globalAllLock.isClosed === true) {
    const lockMs = Number(globalAllLock.closedAtMs || globalAllLock.timestampMs || 0);
    if (!(recordTs > 0 && lockMs > 0 && recordTs > lockMs)) {
      return {
        isClosed: true,
        closedAt: globalAllLock.closedAt || globalAllLock.updatedAt || undefined,
        closedAtMs: lockMs || undefined,
        closedBy: globalAllLock.closedBy || 'admin',
        closedByName: globalAllLock.closedByName || 'Quản trị viên',
        examId: params.examId || undefined,
        examCode: params.examCode || undefined,
        teacherUsername: teacherNorm || undefined,
        scope: 'all_system',
        reason:
          globalAllLock.reason || 'Giáo viên đã kết thúc bài thi sớm và chốt bảng điểm.',
      };
    }
  }

  return { isClosed: false };
}

async function resolveClosedSessionInfoAsync(params: {
  examId?: string;
  examCode?: string;
  teacherUsername?: string;
  record?: any;
  req?: Request;
}): Promise<ClosedSessionInfo> {
  const localInfo = getClosedSessionInfoFromMemory(params);
  if (localInfo.isClosed) return localInfo;

  // Check Cloud SQL for any newly written lock keys from another instance
  const teacherNorm = normalizeSessionKeyPart(
    params.teacherUsername || params.record?.config?.teacherUsername
  );
  const examIdNorm = normalizeSessionKeyPart(params.examId || params.record?.exam?.id);
  const examCodeNorm = normalizeSessionKeyPart(params.examCode || params.record?.exam?.code);
  const lockKeysToCheck: string[] = [];
  if (teacherNorm) {
    if (examIdNorm) lockKeysToCheck.push(buildClosedLockKey(teacherNorm, examIdNorm));
    if (examCodeNorm) lockKeysToCheck.push(buildClosedLockKey(teacherNorm, examCodeNorm));
    lockKeysToCheck.push(buildClosedLockKey(teacherNorm, 'all'));
  }
  if (examIdNorm) lockKeysToCheck.push(buildClosedLockKey('global', examIdNorm));
  if (examCodeNorm) lockKeysToCheck.push(buildClosedLockKey('global', examCodeNorm));
  lockKeysToCheck.push(buildClosedLockKey('global', 'all'));

  const uniqueLockKeys = Array.from(new Set(lockKeysToCheck)).map((k) => k.slice(0, 200));
  if (uniqueLockKeys.length > 0) {
    try {
      await ensureSharedCloudSqlStore();
      const placeholders = uniqueLockKeys.map((_, idx) => `$${idx + 1}`).join(', ');
      const rows = await pgQueryParams(
        `SELECT assignment_key, record_json FROM agritech_qr_assignments_store WHERE assignment_key IN (${placeholders});`,
        uniqueLockKeys
      );
      if (rows.length > 0) {
        let changed = false;
        for (const [keyName, jsonStr] of rows) {
          if (!keyName || !jsonStr) continue;
          try {
            const parsed = JSON.parse(String(jsonStr));
            if (parsed && typeof parsed === 'object') {
              sharedAssignmentsMap.set(String(keyName), parsed);
              changed = true;
            }
          } catch {}
        }
        if (changed) {
          return getClosedSessionInfoFromMemory(params);
        }
      }
    } catch {}
  }

  return { isClosed: false };
}

function renderClosedExamHtml(exam: any, closedInfo: ClosedSessionInfo): string {
  const titleSafe = escapeHtmlServer(exam?.title || 'Bài thi Công nghệ Nông nghiệp THPT');
  const codeSafe = escapeHtmlServer(exam?.code || closedInfo.examCode || '---');
  const teacherDisplay = closedInfo.closedByName
    ? `${closedInfo.closedByName}${closedInfo.closedBy ? ` (@${closedInfo.closedBy})` : ''}`
    : closedInfo.closedBy
    ? `@${closedInfo.closedBy}`
    : 'Giáo viên';
  const teacherSafe = escapeHtmlServer(teacherDisplay);
  const closedAtFormatted = closedInfo.closedAt
    ? escapeHtmlServer(new Date(closedInfo.closedAt).toLocaleString('vi-VN'))
    : '';
  const reasonSafe = escapeHtmlServer(
    closedInfo.reason ||
      'Giáo viên đã kết thúc bài thi sớm và chốt danh sách Bảng Điểm cuối cùng.'
  );

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
  <meta name="theme-color" content="#991b1b" />
  <title>Phiên thi đã kết thúc · Mã đề ${codeSafe}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(180deg, #fef2f2 0%, #f8fafc 100%);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
    }
    .card {
      width: 100%;
      max-width: 480px;
      background: #ffffff;
      border: 2px solid #fecaca;
      border-radius: 22px;
      padding: 28px 24px;
      box-shadow: 0 20px 40px -15px rgba(153, 27, 27, 0.16);
      text-align: center;
    }
    .icon-box {
      width: 64px;
      height: 64px;
      margin: 0 auto 14px;
      border-radius: 18px;
      background: #fee2e2;
      color: #b91c1c;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      font-weight: 800;
    }
    .badge {
      display: inline-block;
      background: #dc2626;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.04em;
      padding: 5px 12px;
      border-radius: 999px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    h1 {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 800;
      color: #991b1b;
      line-height: 1.3;
    }
    p {
      margin: 0;
      font-size: 14px;
      color: #475569;
      line-height: 1.55;
    }
    .meta {
      margin-top: 18px;
      padding: 14px;
      border-radius: 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      text-align: left;
      font-size: 13px;
      line-height: 1.6;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      padding: 4px 0;
      border-bottom: 1px dashed #e2e8f0;
    }
    .meta-row:last-child { border-bottom: none; }
    .meta-label { color: #64748b; font-weight: 600; }
    .meta-value { color: #0f172a; font-weight: 700; text-align: right; }
    .foot {
      margin-top: 16px;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-box">🔒</div>
    <div class="badge">Phiên thi đã kết thúc · Link QR đã khóa</div>
    <h1>Link làm bài đã bị khóa bởi Giáo viên</h1>
    <p>${reasonSafe} Học sinh không thể truy cập hoặc làm thêm bài thi này nữa.</p>
    <div class="meta">
      <div class="meta-row">
        <span class="meta-label">Đề thi:</span>
        <span class="meta-value">${titleSafe}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Mã đề:</span>
        <span class="meta-value">${codeSafe}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Giáo viên phụ trách:</span>
        <span class="meta-value">${teacherSafe}</span>
      </div>
      ${
        closedAtFormatted
          ? `<div class="meta-row">
        <span class="meta-label">Thời điểm kết thúc:</span>
        <span class="meta-value">${closedAtFormatted}</span>
      </div>`
          : ''
      }
    </div>
    <div class="foot">
      Nếu cần hỗ trợ hoặc thi bù, vui lòng liên hệ trực tiếp với Giáo viên bộ môn.
    </div>
  </div>
</body>
</html>`;
}

app.post('/api/assignments', async (req: Request, res: Response) => {
  const { exam, config } = req.body || {};
  if (!exam || (!exam.id && !exam.code)) {
    return res.status(400).json({ success: false, message: 'Thiếu dữ liệu đề thi' });
  }
  // Nếu đề thuộc tài liệu riêng tư do người dùng tải lên, chỉ đúng người đăng hoặc Admin mới được giao bài
  const matchedUploaded = sharedUploadedExams.find(
    (u) => u && exam.id && String(u.id) === String(exam.id)
  );
  if (matchedUploaded && !isPublicAdminUploadedExam(matchedUploaded)) {
    const caller = getVerifiedAuthIdentity(req);
    if (!caller) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập đúng tài khoản người đăng tài liệu hoặc Admin!',
      });
    }
    if (!canCallerAccessUploadedExam(matchedUploaded, caller)) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người dùng đã đăng tài liệu và Quản trị viên (Admin) mới được sử dụng tài liệu này!',
      });
    }
  }
  const normalizedCfg = {
    ...(config || {}),
    isPermanent: true,
    expiresAt: 'never',
    unlimitedAttempts: true,
    anytimeAccess: true,
  };
  const tUser = String(normalizedCfg.teacherUsername || '').trim();
  if (tUser && !normalizedCfg.teacherName) {
    const { users } = loadDataUsers(false);
    const matchedTeacher = users.find(
      (u) => cleanAuthString(u.username).toLowerCase() === cleanAuthString(tUser).toLowerCase()
    );
    if (matchedTeacher?.fullName) {
      normalizedCfg.teacherName = matchedTeacher.fullName;
    }
  }

  // Loại bỏ attachedFileDataUrl (file PDF/Word gốc dung lượng lớn) nhưng giữ nguyên 100% ảnh, bảng, biểu đồ và Phần III
  const { attachedFileDataUrl: _omitBlob, ...examWithoutBlob } = exam;
  const mergedExamForAssignment = matchedUploaded
    ? {
        ...examWithoutBlob,
        ...(examWithoutBlob.rawDocumentText
          ? {}
          : matchedUploaded.rawDocumentText
          ? { rawDocumentText: matchedUploaded.rawDocumentText }
          : {}),
        ...(examWithoutBlob.rawDocumentImages
          ? {}
          : matchedUploaded.rawDocumentImages
          ? { rawDocumentImages: matchedUploaded.rawDocumentImages }
          : {}),
        ...(examWithoutBlob.rawDocumentTables
          ? {}
          : matchedUploaded.rawDocumentTables
          ? { rawDocumentTables: matchedUploaded.rawDocumentTables }
          : {}),
        ...(examWithoutBlob.rawDocumentCharts
          ? {}
          : matchedUploaded.rawDocumentCharts
          ? { rawDocumentCharts: matchedUploaded.rawDocumentCharts }
          : {}),
      }
    : examWithoutBlob;

  const nowIso = new Date().toISOString();
  const nowMs = Date.now();
  const record = {
    exam: mergedExamForAssignment,
    config: normalizedCfg,
    isPermanent: true,
    expiresAt: 'never',
    unlimitedAttempts: true,
    anytimeAccess: true,
    isClosed: false,
    closedAt: null,
    closedAtMs: null,
    closedBy: null,
    closedByName: null,
    updatedAt: nowIso,
    timestampMs: nowMs,
  };

  const keysToPersist: string[] = [];
  const tNorm = normalizeSessionKeyPart(tUser);
  const lockKeysToReopen: string[] = [];

  if (exam.id) {
    const idStr = String(exam.id);
    const idLower = idStr.toLowerCase();
    sharedAssignmentsMap.set(idStr, record);
    sharedAssignmentsMap.set(idLower, record);
    keysToPersist.push(idStr, idLower);
    if (tNorm) {
      const tKey = `${tNorm}__${idLower}`;
      sharedAssignmentsMap.set(tKey, record);
      keysToPersist.push(tKey);
      lockKeysToReopen.push(buildClosedLockKey(tNorm, idLower));
    }
    lockKeysToReopen.push(buildClosedLockKey('global', idLower));
  }
  if (exam.code) {
    const codeStr = String(exam.code);
    const codeLower = codeStr.toLowerCase();
    sharedAssignmentsMap.set(codeStr, record);
    sharedAssignmentsMap.set(codeLower, record);
    keysToPersist.push(codeStr, codeLower);
    if (tNorm) {
      const tCodeKey = `${tNorm}__${codeLower}`;
      sharedAssignmentsMap.set(tCodeKey, record);
      keysToPersist.push(tCodeKey);
      lockKeysToReopen.push(buildClosedLockKey(tNorm, codeLower));
    }
    lockKeysToReopen.push(buildClosedLockKey('global', codeLower));
  }
  if (tNorm) {
    const latestTKey = `teacher_latest__${tNorm}`;
    sharedAssignmentsMap.set(latestTKey, record);
    keysToPersist.push(latestTKey);
  }
  sharedAssignmentsMap.set('__latest_active__', record);
  keysToPersist.push('__latest_active__');

  // Clear any prior closed lock for this specific exam when teacher assigns it again
  const reopenedLockKeys: string[] = [];
  for (const lk of Array.from(new Set(lockKeysToReopen))) {
    const existingLock = sharedAssignmentsMap.get(lk);
    if (existingLock && existingLock.isClosed === true) {
      const openMarker = {
        ...existingLock,
        isClosed: false,
        reopenedAt: nowIso,
        timestampMs: nowMs,
        updatedAt: nowIso,
      };
      sharedAssignmentsMap.set(lk, openMarker);
      reopenedLockKeys.push(lk);
    }
  }

  persistAssignments();
  if (!isPeerReplicatedRequest(req)) {
    await upsertAssignmentKeysToCloudSql(Array.from(new Set(keysToPersist)), record);
    for (const lk of reopenedLockKeys) {
      const rec = sharedAssignmentsMap.get(lk);
      if (rec) {
        await upsertAssignmentKeysToCloudSql([lk], rec);
      }
    }
  }

  // Replicate to counterpart origin (ais-dev <-> ais-pre) so QR code works permanently across both URLs
  if (!isPeerReplicatedRequest(req)) {
    const peers = getPeerOrigins(req);
    const lightRecord = stripHeavyBlobFromRecord(record);
    const peerHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Peer-Replicated': '1',
    };
    if (typeof req.headers.authorization === 'string' && req.headers.authorization.trim()) {
      peerHeaders.Authorization = req.headers.authorization;
    }
    peers.forEach((peer) => {
      fetch(`${peer}/api/assignments?peerReplicated=1`, {
        method: 'POST',
        headers: peerHeaders,
        body: JSON.stringify({
          exam: lightRecord.exam,
          config: lightRecord.config,
          peerReplicated: true,
        }),
      }).catch(() => {});
    });
  }

  broadcastSSE('assignment_updated', record);
  res.json({ success: true, data: record });
});

app.get('/api/assignments/active', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const qTeacher = String(req.query.teacher || '').trim().toLowerCase();
  let active =
    (qTeacher ? sharedAssignmentsMap.get(`teacher_latest__${qTeacher}`) : null) ||
    sharedAssignmentsMap.get('__latest_active__') ||
    null;
  if (!active) {
    active = await lookupAssignmentFromCloudSqlOrPeers('active', qTeacher, req);
  }
  res.json({ success: true, data: active });
});

app.delete('/api/assignments/active', (req: Request, res: Response) => {
  // Giữ nguyên hiệu lực vĩnh viễn của tất cả các mã QR đã giao 1 lần để học sinh làm bài bất cứ thời gian nào
  res.json({ success: true, permanentQrPreserved: true });
});

// Public lightweight read-only status check used by active student exam sessions (polling fallback alongside SSE)
app.get('/api/assignments/session-status', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const qExamId = String(req.query.examId || req.query.exam || '').trim();
  const qCode = String(req.query.code || req.query.examCode || '').trim();
  const qTeacher = normalizeSessionKeyPart(String(req.query.teacher || req.query.t || ''));

  let matchedRecord: any = null;
  const keys = [qExamId, qCode].filter(Boolean);
  for (const k of keys) {
    const rec =
      (qTeacher ? sharedAssignmentsMap.get(`${qTeacher}__${k.toLowerCase()}`) : null) ||
      sharedAssignmentsMap.get(k) ||
      sharedAssignmentsMap.get(k.toLowerCase());
    if (rec && rec.exam) {
      matchedRecord = rec;
      break;
    }
  }

  const closedInfo = await resolveClosedSessionInfoAsync({
    examId: qExamId || matchedRecord?.exam?.id,
    examCode: qCode || matchedRecord?.exam?.code,
    teacherUsername: qTeacher || matchedRecord?.config?.teacherUsername,
    record: matchedRecord,
    req,
  });

  res.json({
    success: true,
    ...closedInfo,
  });
});

// List active & closed exam sessions for the logged-in teacher (or all for admin)
app.get('/api/assignments/sessions', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const caller = getVerifiedAuthIdentity(req);
  const requestedTeacher = normalizeSessionKeyPart(String(req.query.teacher || ''));
  const scopeTeacher = caller
    ? caller.isAdmin
      ? requestedTeacher
      : caller.normalizedUsername
    : requestedTeacher;

  const sessionMap = new Map<
    string,
    {
      examId: string;
      examCode: string;
      examTitle: string;
      className?: string;
      teacherUsername?: string;
      teacherName?: string;
      isClosed: boolean;
      closedAt?: string;
      updatedAt?: string;
      timestampMs: number;
    }
  >();

  sharedAssignmentsMap.forEach((rec, key) => {
    if (!rec || key.startsWith('closed_lock__') || key === '__latest_active__' || key.startsWith('teacher_latest__')) {
      return;
    }
    if (!rec.exam || (!rec.exam.id && !rec.exam.code)) return;
    const recTeacher = normalizeSessionKeyPart(rec.config?.teacherUsername);
    if (scopeTeacher && recTeacher !== scopeTeacher) return;

    const dedupKey = `${recTeacher || 'global'}__${normalizeSessionKeyPart(rec.exam.code || rec.exam.id)}`;
    const closedInfo = getClosedSessionInfoFromMemory({
      examId: rec.exam.id,
      examCode: rec.exam.code,
      teacherUsername: recTeacher,
      record: rec,
    });
    const ts = Number(rec.timestampMs || 0);
    const existing = sessionMap.get(dedupKey);
    if (!existing || ts >= existing.timestampMs) {
      sessionMap.set(dedupKey, {
        examId: String(rec.exam.id || rec.exam.code),
        examCode: String(rec.exam.code || rec.exam.id),
        examTitle: String(rec.exam.title || `Mã đề ${rec.exam.code || rec.exam.id}`),
        className: rec.config?.className || undefined,
        teacherUsername: recTeacher || undefined,
        teacherName: rec.config?.teacherName || undefined,
        isClosed: closedInfo.isClosed,
        closedAt: closedInfo.closedAt,
        updatedAt: rec.updatedAt || undefined,
        timestampMs: ts,
      });
    }
  });

  // Also collect active closed lock markers (e.g. teacher ended all sessions or a built-in exam code directly)
  const activeLocks: ClosedSessionInfo[] = [];
  sharedAssignmentsMap.forEach((rec, key) => {
    if (!key.startsWith('closed_lock__') || !rec || rec.isClosed !== true) return;
    const lockTeacher = normalizeSessionKeyPart(rec.teacherUsername || rec.closedBy);
    if (scopeTeacher && lockTeacher && lockTeacher !== scopeTeacher && lockTeacher !== 'global') {
      return;
    }
    activeLocks.push({
      isClosed: true,
      closedAt: rec.closedAt || rec.updatedAt,
      closedAtMs: Number(rec.closedAtMs || rec.timestampMs || 0),
      closedBy: rec.closedBy,
      closedByName: rec.closedByName,
      examId: rec.examId,
      examCode: rec.examCode,
      teacherUsername: rec.teacherUsername,
      scope: rec.scope || 'single',
      reason: rec.reason,
    });
  });

  res.json({
    success: true,
    sessions: Array.from(sessionMap.values()).sort((a, b) => b.timestampMs - a.timestampMs),
    activeLocks: activeLocks.sort((a, b) => (b.closedAtMs || 0) - (a.closedAtMs || 0)),
  });
});

// Teacher / Admin ends an exam session early: immediately stops student timers, auto-submits, locks QR link, and finalizes scoreboard
app.post('/api/assignments/end-session', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const caller = getVerifiedAuthIdentity(req);
  if (!caller) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập tài khoản Giáo viên hoặc Quản trị viên để kết thúc bài thi!',
    });
  }
  if (!caller.isTeacherOrAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Chỉ tài khoản Giáo viên hoặc Quản trị viên mới có quyền kết thúc bài thi sớm!',
    });
  }

  const rawExamId = String(req.body?.examId || '').trim();
  const rawExamCode = String(req.body?.examCode || '').trim();
  const closeAllForTeacher = Boolean(req.body?.closeAllForTeacher) || (!rawExamId && !rawExamCode);
  const requestedTeacher = normalizeSessionKeyPart(req.body?.teacherUsername);
  const targetTeacher = caller.isAdmin
    ? requestedTeacher || caller.normalizedUsername
    : caller.normalizedUsername;

  const { users } = loadDataUsers(false);
  const callerProfile = users.find(
    (u) => cleanAuthString(u.username).replace(/^@+/, '').toLowerCase() === caller.normalizedUsername
  );
  const closedByName = String(
    req.body?.closedByName || callerProfile?.fullName || caller.username
  ).trim();
  const reason = String(
    req.body?.reason ||
      'Giáo viên đã kết thúc bài thi sớm và chốt danh sách Bảng Điểm cuối cùng.'
  ).trim();

  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const keysToPersistToCloudSql: Array<{ key: string; record: any }> = [];

  // 1. Update matching assignment records in sharedAssignmentsMap
  const examIdNorm = normalizeSessionKeyPart(rawExamId);
  const examCodeNorm = normalizeSessionKeyPart(rawExamCode);
  const matchedExamCodes = new Set<string>();
  const matchedExamIds = new Set<string>();
  if (rawExamCode) matchedExamCodes.add(rawExamCode);
  if (rawExamId) matchedExamIds.add(rawExamId);

  sharedAssignmentsMap.forEach((rec, key) => {
    if (!rec || key.startsWith('closed_lock__') || !rec.exam) return;
    const recTeacher = normalizeSessionKeyPart(rec.config?.teacherUsername);
    const recExamId = normalizeSessionKeyPart(rec.exam?.id);
    const recExamCode = normalizeSessionKeyPart(rec.exam?.code);

    const teacherMatches = !targetTeacher || recTeacher === targetTeacher || (!recTeacher && caller.isAdmin);
    if (!teacherMatches) return;

    const examMatches =
      closeAllForTeacher ||
      (examIdNorm && (recExamId === examIdNorm || recExamCode === examIdNorm)) ||
      (examCodeNorm && (recExamCode === examCodeNorm || recExamId === examCodeNorm));

    if (examMatches) {
      const updatedRec = {
        ...rec,
        isClosed: true,
        closedAt: nowIso,
        closedAtMs: nowMs,
        closedBy: caller.normalizedUsername,
        closedByName,
        closedReason: reason,
        updatedAt: nowIso,
      };
      sharedAssignmentsMap.set(key, updatedRec);
      keysToPersistToCloudSql.push({ key, record: updatedRec });
      if (rec.exam?.code) matchedExamCodes.add(String(rec.exam.code));
      if (rec.exam?.id) matchedExamIds.add(String(rec.exam.id));
    }
  });

  // 2. Write authoritative closed_lock__ keys so even built-in exams or fresh QR scans are immediately locked
  const lockBase = {
    isClosed: true,
    closedAt: nowIso,
    closedAtMs: nowMs,
    closedBy: caller.normalizedUsername,
    closedByName,
    teacherUsername: targetTeacher || undefined,
    examId: rawExamId || undefined,
    examCode: rawExamCode || undefined,
    scope: closeAllForTeacher ? 'all_teacher' : 'single',
    reason,
    updatedAt: nowIso,
    timestampMs: nowMs,
  };

  const lockKeys: string[] = [];
  if (closeAllForTeacher) {
    lockKeys.push(buildClosedLockKey(targetTeacher || 'global', 'all'));
    // Also lock individual matched exam codes for this teacher
    matchedExamCodes.forEach((c) => {
      lockKeys.push(buildClosedLockKey(targetTeacher || 'global', normalizeSessionKeyPart(c)));
    });
    matchedExamIds.forEach((id) => {
      lockKeys.push(buildClosedLockKey(targetTeacher || 'global', normalizeSessionKeyPart(id)));
    });
  } else {
    if (examIdNorm) {
      lockKeys.push(buildClosedLockKey(targetTeacher || 'global', examIdNorm));
      if (caller.isAdmin && !requestedTeacher) {
        lockKeys.push(buildClosedLockKey('global', examIdNorm));
      }
    }
    if (examCodeNorm) {
      lockKeys.push(buildClosedLockKey(targetTeacher || 'global', examCodeNorm));
      if (caller.isAdmin && !requestedTeacher) {
        lockKeys.push(buildClosedLockKey('global', examCodeNorm));
      }
    }
    matchedExamCodes.forEach((c) => {
      lockKeys.push(buildClosedLockKey(targetTeacher || 'global', normalizeSessionKeyPart(c)));
    });
    matchedExamIds.forEach((id) => {
      lockKeys.push(buildClosedLockKey(targetTeacher || 'global', normalizeSessionKeyPart(id)));
    });
  }

  for (const lk of Array.from(new Set(lockKeys))) {
    sharedAssignmentsMap.set(lk, lockBase);
    keysToPersistToCloudSql.push({ key: lk, record: lockBase });
  }

  persistAssignments();
  if (!isPeerReplicatedRequest(req)) {
    for (const item of keysToPersistToCloudSql) {
      await upsertAssignmentKeysToCloudSql([item.key], item.record);
    }
    // Replicate to peer instances forwarding verified Authorization header
    const peers = getPeerOrigins(req);
    const peerHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Peer-Replicated': '1',
    };
    if (typeof req.headers.authorization === 'string' && req.headers.authorization.trim()) {
      peerHeaders.Authorization = req.headers.authorization;
    }
    peers.forEach((peer) => {
      fetch(`${peer}/api/assignments/end-session?peerReplicated=1`, {
        method: 'POST',
        headers: peerHeaders,
        body: JSON.stringify({
          examId: rawExamId || undefined,
          examCode: rawExamCode || undefined,
          teacherUsername: targetTeacher || undefined,
          closeAllForTeacher,
          closedByName,
          reason,
          peerReplicated: true,
        }),
      }).catch(() => {});
    });
  }

  const eventPayload = {
    examId: rawExamId || undefined,
    examCode: rawExamCode || undefined,
    examCodes: Array.from(matchedExamCodes),
    examIds: Array.from(matchedExamIds),
    teacherUsername: targetTeacher || undefined,
    closeAllForTeacher,
    closedAt: nowIso,
    closedAtMs: nowMs,
    closedBy: caller.normalizedUsername,
    closedByName,
    reason,
  };

  broadcastSSE('exam_session_ended', eventPayload);
  res.json({
    success: true,
    data: eventPayload,
    message: 'Đã kết thúc bài thi sớm, dừng đồng hồ, tự động thu bài học sinh và khóa link QR thành công!',
  });
});

// Teacher / Admin reopens a previously closed exam session / QR link
app.post('/api/assignments/reopen-session', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const caller = getVerifiedAuthIdentity(req);
  if (!caller) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập tài khoản Giáo viên hoặc Quản trị viên!',
    });
  }
  if (!caller.isTeacherOrAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Chỉ tài khoản Giáo viên hoặc Quản trị viên mới có quyền mở lại phòng thi!',
    });
  }

  const rawExamId = String(req.body?.examId || '').trim();
  const rawExamCode = String(req.body?.examCode || '').trim();
  const reopenAllForTeacher = Boolean(req.body?.reopenAllForTeacher) || (!rawExamId && !rawExamCode);
  const requestedTeacher = normalizeSessionKeyPart(req.body?.teacherUsername);
  const targetTeacher = caller.isAdmin
    ? requestedTeacher || caller.normalizedUsername
    : caller.normalizedUsername;

  const examIdNorm = normalizeSessionKeyPart(rawExamId);
  const examCodeNorm = normalizeSessionKeyPart(rawExamCode);
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const keysToPersistToCloudSql: Array<{ key: string; record: any }> = [];

  sharedAssignmentsMap.forEach((rec, key) => {
    if (!rec) return;
    if (key.startsWith('closed_lock__')) {
      const lockTeacher = normalizeSessionKeyPart(rec.teacherUsername || rec.closedBy);
      const teacherMatches =
        !targetTeacher || lockTeacher === targetTeacher || (caller.isAdmin && lockTeacher === 'global');
      if (!teacherMatches) return;
      const examMatches =
        reopenAllForTeacher ||
        key === buildClosedLockKey(targetTeacher || 'global', 'all') ||
        (examIdNorm && key.endsWith(`__${examIdNorm}`)) ||
        (examCodeNorm && key.endsWith(`__${examCodeNorm}`));
      if (examMatches && rec.isClosed === true) {
        const reopenedLock = {
          ...rec,
          isClosed: false,
          reopenedAt: nowIso,
          updatedAt: nowIso,
          timestampMs: nowMs,
        };
        sharedAssignmentsMap.set(key, reopenedLock);
        keysToPersistToCloudSql.push({ key, record: reopenedLock });
      }
      return;
    }

    if (rec.exam && rec.isClosed === true) {
      const recTeacher = normalizeSessionKeyPart(rec.config?.teacherUsername);
      const teacherMatches = !targetTeacher || recTeacher === targetTeacher || (!recTeacher && caller.isAdmin);
      if (!teacherMatches) return;
      const recExamId = normalizeSessionKeyPart(rec.exam?.id);
      const recExamCode = normalizeSessionKeyPart(rec.exam?.code);
      const examMatches =
        reopenAllForTeacher ||
        (examIdNorm && (recExamId === examIdNorm || recExamCode === examIdNorm)) ||
        (examCodeNorm && (recExamCode === examCodeNorm || recExamId === examCodeNorm));
      if (examMatches) {
        const reopenedRec = {
          ...rec,
          isClosed: false,
          closedAt: null,
          closedAtMs: null,
          reopenedAt: nowIso,
          updatedAt: nowIso,
          timestampMs: nowMs,
        };
        sharedAssignmentsMap.set(key, reopenedRec);
        keysToPersistToCloudSql.push({ key, record: reopenedRec });
      }
    }
  });

  persistAssignments();
  if (!isPeerReplicatedRequest(req)) {
    for (const item of keysToPersistToCloudSql) {
      await upsertAssignmentKeysToCloudSql([item.key], item.record);
    }
    const peers = getPeerOrigins(req);
    const peerHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Peer-Replicated': '1',
    };
    if (typeof req.headers.authorization === 'string' && req.headers.authorization.trim()) {
      peerHeaders.Authorization = req.headers.authorization;
    }
    peers.forEach((peer) => {
      fetch(`${peer}/api/assignments/reopen-session?peerReplicated=1`, {
        method: 'POST',
        headers: peerHeaders,
        body: JSON.stringify({
          examId: rawExamId || undefined,
          examCode: rawExamCode || undefined,
          teacherUsername: targetTeacher || undefined,
          reopenAllForTeacher,
          peerReplicated: true,
        }),
      }).catch(() => {});
    });
  }

  const payload = {
    examId: rawExamId || undefined,
    examCode: rawExamCode || undefined,
    teacherUsername: targetTeacher || undefined,
    reopenAllForTeacher,
    reopenedAt: nowIso,
  };
  broadcastSSE('exam_session_reopened', payload);
  res.json({
    success: true,
    data: payload,
    message: 'Đã mở lại đường link QR phòng thi thành công!',
  });
});

app.get('/api/assignments/:key', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const key = String(req.params.key || '').trim();
  const qTeacher = String(req.query.teacher || req.query.t || '').trim().toLowerCase();
  const isGenericActive = !key || key === 'active' || key === '__latest_active__';
  let found = isGenericActive
    ? (qTeacher ? sharedAssignmentsMap.get(`teacher_latest__${qTeacher}`) : null) ||
      sharedAssignmentsMap.get('__latest_active__')
    : (qTeacher ? sharedAssignmentsMap.get(`${qTeacher}__${key.toLowerCase()}`) : null) ||
      sharedAssignmentsMap.get(key) ||
      sharedAssignmentsMap.get(key.toLowerCase());
  if (!found) {
    found = await lookupAssignmentFromCloudSqlOrPeers(key, qTeacher, req);
  }
  const closedInfo = await resolveClosedSessionInfoAsync({
    examId: found?.exam?.id || (!isGenericActive ? key : undefined),
    examCode: found?.exam?.code || (!isGenericActive ? key : undefined),
    teacherUsername: qTeacher || found?.config?.teacherUsername,
    record: found,
    req,
  });
  if (!found) {
    if (closedInfo.isClosed) {
      return res.json({
        success: true,
        data: null,
        sessionClosed: true,
        closedInfo,
      });
    }
    return res.status(404).json({ success: false, message: 'Không tìm thấy đề giao' });
  }
  res.json({
    success: true,
    data: {
      ...found,
      isClosed: closedInfo.isClosed,
      closedAt: closedInfo.closedAt || found.closedAt || null,
      closedBy: closedInfo.closedBy || found.closedBy || null,
      closedByName: closedInfo.closedByName || found.closedByName || null,
    },
    sessionClosed: closedInfo.isClosed,
    closedInfo,
  });
});

// Check whether ais-pre-* URL is active or returning HTTP 404 (0-byte blank white page)
app.get('/api/share-origin-status', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const rawOrigin = String(req.query.origin || process.env.APP_URL || '').trim();
  const devOrigin = rawOrigin.replace('//ais-pre-', '//ais-dev-');
  const preOrigin = rawOrigin.replace('//ais-dev-', '//ais-pre-');

  if (!preOrigin || !preOrigin.includes('//ais-pre-')) {
    return res.json({
      success: true,
      isPreAlive: false,
      recommendedOrigin: rawOrigin || devOrigin,
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const checkRes = await fetch(preOrigin, {
      method: 'HEAD',
      redirect: 'manual',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    // If Google Frontend returns 404, ais-pre-* is NOT provisioned and will show a 0-byte white screen!
    const isPreAlive = checkRes.status !== 404 && checkRes.status < 500;
    return res.json({
      success: true,
      isPreAlive,
      preStatus: checkRes.status,
      recommendedOrigin: isPreAlive ? preOrigin : devOrigin,
    });
  } catch {
    return res.json({
      success: true,
      isPreAlive: false,
      recommendedOrigin: devOrigin,
    });
  }
});

// Shared Mistakes Analytics & Custom Random Exams across Android, iOS, and Windows
const MISTAKES_FILE = path.join(DATA_DIR, 'mistakes.json');
const CUSTOM_EXAMS_FILE = path.join(DATA_DIR, 'custom_exams.json');

let sharedMistakesRecord: Record<string, any> = {};
let sharedCustomExams: any[] = [];

try {
  if (fs.existsSync(MISTAKES_FILE)) {
    const raw = JSON.parse(fs.readFileSync(MISTAKES_FILE, 'utf-8'));
    if (raw && typeof raw === 'object') {
      sharedMistakesRecord = raw;
    }
  }
} catch (e) {
  console.warn('[Mistakes] Could not load mistakes.json:', e);
}

try {
  if (fs.existsSync(CUSTOM_EXAMS_FILE)) {
    const raw = JSON.parse(fs.readFileSync(CUSTOM_EXAMS_FILE, 'utf-8'));
    if (Array.isArray(raw)) {
      sharedCustomExams = raw;
    }
  }
} catch (e) {
  console.warn('[CustomExams] Could not load custom_exams.json:', e);
}

function persistMistakes() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(MISTAKES_FILE, JSON.stringify(sharedMistakesRecord, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[Mistakes] Could not save mistakes.json:', e);
  }
}

function persistCustomExams() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(CUSTOM_EXAMS_FILE, JSON.stringify(sharedCustomExams, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[CustomExams] Could not save custom_exams.json:', e);
  }
}

function mergeMistakeRecordIntoShared(qId: string, incoming: any): boolean {
  if (!qId || !incoming || typeof incoming !== 'object') return false;
  const existing = sharedMistakesRecord[qId] || {
    totalAttempts: 0,
    wrongAttempts: 0,
    lastChosen: '',
    students: [],
  };
  const incomingStudents = Array.isArray(incoming.students) ? incoming.students : [];
  const existingStudents = Array.isArray(existing.students) ? existing.students : [];
  const mergedStudents = [...incomingStudents];
  existingStudents.forEach((st: any) => {
    if (
      !mergedStudents.some(
        (m: any) => m.studentName === st.studentName && m.examCode === st.examCode
      )
    ) {
      mergedStudents.push(st);
    }
  });
  const nextRec = {
    totalAttempts: Math.max(Number(existing.totalAttempts) || 0, Number(incoming.totalAttempts) || 0),
    wrongAttempts: Math.max(Number(existing.wrongAttempts) || 0, Number(incoming.wrongAttempts) || 0),
    lastChosen: incoming.lastChosen || existing.lastChosen || '',
    students: mergedStudents.slice(0, 20),
  };
  const changed = JSON.stringify(existing) !== JSON.stringify(nextRec);
  sharedMistakesRecord[qId] = nextRec;
  return changed;
}

async function upsertMistakesToCloudSql(records: Record<string, any>): Promise<void> {
  const entries = Object.entries(records || {});
  if (entries.length === 0) return;
  const nowMs = Date.now();
  await Promise.allSettled(
    entries.map(([qId, rec]) =>
      pgQueryParams(
        `INSERT INTO agritech_mistakes_store (question_id, record_json, updated_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (question_id) DO UPDATE SET
           record_json = EXCLUDED.record_json,
           updated_at = EXCLUDED.updated_at`,
        [String(qId).slice(0, 200), JSON.stringify(rec), nowMs],
        false,
        6000
      )
    )
  );
}

let lastMistakesSqlPullMs = 0;
async function pullAndMergeMistakesFromCloudSql(force = false): Promise<boolean> {
  const now = Date.now();
  if (!force && now - lastMistakesSqlPullMs < 1500) return false;
  lastMistakesSqlPullMs = now;
  let changed = false;
  try {
    const rows = await pgQuery(
      `SELECT question_id, record_json FROM agritech_mistakes_store ORDER BY updated_at ASC;`
    );
    for (const [qId, recJson] of rows) {
      if (!qId || !recJson) continue;
      try {
        const parsed = JSON.parse(recJson);
        if (mergeMistakeRecordIntoShared(qId, parsed)) {
          changed = true;
        }
      } catch {}
    }
    if (changed) {
      persistMistakes();
    }
  } catch {}
  return changed;
}

async function upsertCustomExamToCloudSql(exam: any): Promise<void> {
  if (!exam || (!exam.id && !exam.code)) return;
  const examKey = String(exam.id || exam.code).slice(0, 200);
  const nowMs = Date.now();
  try {
    await pgQueryParams(
      `INSERT INTO agritech_custom_exams_store (exam_id, exam_json, updated_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (exam_id) DO UPDATE SET
         exam_json = EXCLUDED.exam_json,
         updated_at = EXCLUDED.updated_at`,
      [examKey, JSON.stringify(exam), nowMs],
      false,
      8000
    );
  } catch {}
}

let lastCustomExamsSqlPullMs = 0;
async function pullAndMergeCustomExamsFromCloudSql(force = false): Promise<boolean> {
  const now = Date.now();
  if (!force && now - lastCustomExamsSqlPullMs < 1500) return false;
  lastCustomExamsSqlPullMs = now;
  let changed = false;
  try {
    const rows = await pgQuery(
      `SELECT exam_id, exam_json FROM agritech_custom_exams_store ORDER BY updated_at DESC LIMIT 50;`
    );
    if (!rows.length) return false;
    const map = new Map<string, any>();
    for (const [, examJson] of rows) {
      if (!examJson) continue;
      try {
        const parsed = JSON.parse(examJson);
        if (parsed && (parsed.id || parsed.code)) {
          const key = String(parsed.id || parsed.code);
          if (!map.has(key)) map.set(key, parsed);
        }
      } catch {}
    }
    for (const localEx of sharedCustomExams) {
      if (!localEx || (!localEx.id && !localEx.code)) continue;
      const key = String(localEx.id || localEx.code);
      if (!map.has(key)) map.set(key, localEx);
    }
    const nextList = Array.from(map.values()).slice(0, 50);
    if (JSON.stringify(nextList) !== JSON.stringify(sharedCustomExams)) {
      sharedCustomExams = nextList;
      persistCustomExams();
      changed = true;
    }
  } catch {}
  return changed;
}

app.get('/api/mistakes', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  if (!isPeerReplicatedRequest(req)) {
    await pullAndMergeMistakesFromCloudSql(false);
  }
  res.json({ success: true, data: sharedMistakesRecord });
});

app.post('/api/mistakes', async (req: Request, res: Response) => {
  const { records } = req.body || {};
  if (!records || typeof records !== 'object') {
    return res.status(400).json({ success: false, message: 'Dữ liệu thống kê lỗi không hợp lệ' });
  }
  const touchedRecords: Record<string, any> = {};
  Object.entries(records).forEach(([qId, incoming]: [string, any]) => {
    if (!incoming || typeof incoming !== 'object') return;
    mergeMistakeRecordIntoShared(qId, incoming);
    touchedRecords[qId] = sharedMistakesRecord[qId];
  });
  persistMistakes();
  if (!isPeerReplicatedRequest(req)) {
    await upsertMistakesToCloudSql(touchedRecords);
    const peers = getPeerOrigins(req);
    peers.forEach((peer) => {
      fetch(`${peer}/api/mistakes?peerReplicated=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Peer-Replicated': '1' },
        body: JSON.stringify({ records: touchedRecords, peerReplicated: true }),
      }).catch(() => {});
    });
  }
  broadcastSSE('mistakes_updated', sharedMistakesRecord);
  res.json({ success: true, data: sharedMistakesRecord });
});

app.get('/api/custom-exams', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  if (!isPeerReplicatedRequest(req)) {
    await pullAndMergeCustomExamsFromCloudSql(false);
  }
  res.json({ success: true, data: sharedCustomExams });
});

app.post('/api/custom-exams', async (req: Request, res: Response) => {
  const { exam, config } = req.body || {};
  if (!exam || (!exam.id && !exam.code)) {
    return res.status(400).json({ success: false, message: 'Đề thi không hợp lệ' });
  }
  // Keep custom random exams synced across all devices & platforms
  sharedCustomExams = [
    exam,
    ...sharedCustomExams.filter((e) => e.code !== exam.code && e.id !== exam.id),
  ].slice(0, 50);

  const record = {
    exam,
    config: config || {
      examId: exam.id,
      examCode: exam.code,
      durationMinutes: exam.durationMinutes || 50,
      shuffleQuestions: false,
      showSolutionsAfterSubmit: true,
    },
    updatedAt: new Date().toISOString(),
    timestampMs: Date.now(),
  };
  const keysToPersist: string[] = [];
  if (exam.id) {
    sharedAssignmentsMap.set(String(exam.id), record);
    sharedAssignmentsMap.set(String(exam.id).toLowerCase(), record);
    keysToPersist.push(String(exam.id), String(exam.id).toLowerCase());
  }
  if (exam.code) {
    sharedAssignmentsMap.set(String(exam.code), record);
    sharedAssignmentsMap.set(String(exam.code).toLowerCase(), record);
    keysToPersist.push(String(exam.code), String(exam.code).toLowerCase());
  }
  persistCustomExams();
  persistAssignments();
  if (!isPeerReplicatedRequest(req)) {
    await Promise.allSettled([
      upsertCustomExamToCloudSql(exam),
      upsertAssignmentKeysToCloudSql(Array.from(new Set(keysToPersist)), record),
    ]);
    const peers = getPeerOrigins(req);
    peers.forEach((peer) => {
      fetch(`${peer}/api/custom-exams?peerReplicated=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Peer-Replicated': '1' },
        body: JSON.stringify({ exam, config, peerReplicated: true }),
      }).catch(() => {});
    });
  }
  broadcastSSE('custom_exams_updated', sharedCustomExams);
  res.json({ success: true, data: sharedCustomExams });
});

// Shared User-Uploaded Exams store (Đề thi thử các Tỉnh, Đề Tham Khảo & Đề thi chính thức các năm)
const UPLOADED_EXAMS_FILE = path.join(DATA_DIR, 'uploaded_exams.json');
const TMP_UPLOADED_EXAMS_FILE = '/tmp/agritech_uploaded_exams.json';
const DELETED_UPLOADED_EXAMS_FILE = path.join(DATA_DIR, 'deleted_uploaded_exams.json');
const TMP_DELETED_UPLOADED_EXAMS_FILE = '/tmp/agritech_deleted_uploaded_exams.json';
const UPLOADED_EXAM_BLOBS_DIR = path.join(DATA_DIR, 'uploaded_exam_blobs');
const LEGACY_UPLOADED_EXAM_BLOBS_FILE = '/tmp/agritech_uploaded_exam_blobs.json';
let sharedUploadedExams: any[] = [];
let legacyUploadedExamBlobsMap: Record<string, string> = {};

function loadDeletedUploadedExamIdsServer(): Set<string> {
  const result = new Set<string>();
  for (const file of [TMP_DELETED_UPLOADED_EXAMS_FILE, DELETED_UPLOADED_EXAMS_FILE]) {
    try {
      if (fs.existsSync(file)) {
        const raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
        if (Array.isArray(raw)) {
          raw
            .map((id) => String(id || '').trim())
            .filter(Boolean)
            .forEach((id) => result.add(id));
        }
      }
    } catch {}
  }
  return result;
}

function saveDeletedUploadedExamIdsServer(set: Set<string>): void {
  const serialized = JSON.stringify(Array.from(set), null, 2);
  try {
    fs.writeFileSync(TMP_DELETED_UPLOADED_EXAMS_FILE, serialized, 'utf-8');
  } catch {}
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DELETED_UPLOADED_EXAMS_FILE, serialized, 'utf-8');
  } catch {}
}

try {
  if (fs.existsSync(LEGACY_UPLOADED_EXAM_BLOBS_FILE)) {
    const parsedBlobs = JSON.parse(fs.readFileSync(LEGACY_UPLOADED_EXAM_BLOBS_FILE, 'utf-8'));
    if (parsedBlobs && typeof parsedBlobs === 'object') {
      legacyUploadedExamBlobsMap = parsedBlobs;
    }
  }
} catch {}

function safeBlobFileName(examId: string): string {
  return String(examId || 'exam').replace(/[^a-zA-Z0-9_-]/g, '_');
}

function getPersistentBlobPath(examId: string): string {
  const baseDir = path.resolve(UPLOADED_EXAM_BLOBS_DIR);
  const resolved = path.resolve(baseDir, `${safeBlobFileName(examId)}.blob`);
  if (!resolved.startsWith(baseDir + path.sep)) {
    throw new Error('Invalid blob path');
  }
  return resolved;
}

function savePersistentBlob(examId: string, dataUrl: string): void {
  if (!examId || !dataUrl) return;
  try {
    if (!fs.existsSync(UPLOADED_EXAM_BLOBS_DIR)) {
      fs.mkdirSync(UPLOADED_EXAM_BLOBS_DIR, { recursive: true });
    }
    fs.writeFileSync(getPersistentBlobPath(examId), dataUrl, 'utf-8');
  } catch (err) {
    console.warn('[UploadedExams] Could not persist original file blob:', err);
  }
}

function loadPersistentBlob(examId: string): string | null {
  if (!examId) return null;
  try {
    const p = getPersistentBlobPath(examId);
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, 'utf-8');
    }
  } catch {}
  if (legacyUploadedExamBlobsMap[String(examId)]) {
    return legacyUploadedExamBlobsMap[String(examId)];
  }
  return null;
}

function hasPersistentBlob(examId: string): boolean {
  if (!examId) return false;
  try {
    if (fs.existsSync(getPersistentBlobPath(examId))) return true;
  } catch {}
  return Boolean(legacyUploadedExamBlobsMap[String(examId)]);
}

function deletePersistentBlob(examId: string): void {
  if (!examId) return;
  try {
    const p = getPersistentBlobPath(examId);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch {}
  if (legacyUploadedExamBlobsMap[String(examId)]) {
    delete legacyUploadedExamBlobsMap[String(examId)];
  }
}

// ============================================================================
// TRÍCH XUẤT NGUYÊN BẢN TỆP WORD (.DOCX) TRÊN SERVER (ZIP CENTRAL DIRECTORY)
// Giữ nguyên đánh số tự động (numbering.xml), bảng biểu (<w:tbl>) & hình ảnh
// ============================================================================

function decodeXmlEntitiesServer(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
}

function guessImageMimeServer(entryName: string): string | null {
  const lower = entryName.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.bmp')) return 'image/bmp';
  return null;
}

function readZipEntriesServer(buf: Buffer): Map<string, Buffer> {
  const result = new Map<string, Buffer>();
  let eocdOffset = -1;
  const minEocd = Math.max(0, buf.length - 65557);
  for (let i = buf.length - 22; i >= minEocd; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  const decompress = (method: number, slice: Buffer): Buffer | null => {
    if (method === 0) return slice;
    if (method === 8) return zlib.inflateRawSync(slice);
    return null;
  };

  if (eocdOffset !== -1) {
    const cdEntries = buf.readUInt16LE(eocdOffset + 10);
    const cdOffset = buf.readUInt32LE(eocdOffset + 16);
    let ptr = cdOffset;
    for (let idx = 0; idx < cdEntries && ptr + 46 <= buf.length; idx++) {
      if (buf.readUInt32LE(ptr) !== 0x02014b50) break;
      const compMethod = buf.readUInt16LE(ptr + 10);
      const compSize = buf.readUInt32LE(ptr + 20);
      const nameLen = buf.readUInt16LE(ptr + 28);
      const extraLen = buf.readUInt16LE(ptr + 30);
      const commentLen = buf.readUInt16LE(ptr + 32);
      const localHeaderOffset = buf.readUInt32LE(ptr + 42);
      const entryName = buf.subarray(ptr + 46, ptr + 46 + nameLen).toString('utf8');
      ptr += 46 + nameLen + extraLen + commentLen;

      const isNeeded =
        entryName === 'word/document.xml' ||
        entryName === 'word/numbering.xml' ||
        entryName === 'word/_rels/document.xml.rels' ||
        entryName.startsWith('word/media/') ||
        (entryName.startsWith('word/charts/') && entryName.toLowerCase().endsWith('.xml'));
      if (!isNeeded) continue;
      if (localHeaderOffset + 30 > buf.length) continue;
      if (buf.readUInt32LE(localHeaderOffset) !== 0x04034b50) continue;

      const lNameLen = buf.readUInt16LE(localHeaderOffset + 26);
      const lExtraLen = buf.readUInt16LE(localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + lNameLen + lExtraLen;
      const slice = buf.subarray(dataStart, Math.min(buf.length, dataStart + compSize));
      try {
        const out = decompress(compMethod, slice);
        if (out) result.set(entryName, out);
      } catch {}
    }
    if (result.has('word/document.xml')) return result;
  }

  let offset = 0;
  while (offset + 30 < buf.length) {
    if (buf.readUInt32LE(offset) !== 0x04034b50) {
      offset++;
      continue;
    }
    const compMethod = buf.readUInt16LE(offset + 8);
    const compSize = buf.readUInt32LE(offset + 18);
    const nameLen = buf.readUInt16LE(offset + 26);
    const extraLen = buf.readUInt16LE(offset + 28);
    const entryName = buf.subarray(offset + 30, offset + 30 + nameLen).toString('utf8');
    const dataStart = offset + 30 + nameLen + extraLen;
    let end = dataStart + compSize;
    if (compSize === 0 || end > buf.length) {
      end = buf.indexOf(Buffer.from([0x50, 0x4b, 0x03, 0x04]), dataStart);
      if (end === -1) end = buf.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]), dataStart);
      if (end === -1) end = buf.length;
    }
    if (
      entryName === 'word/document.xml' ||
      entryName === 'word/numbering.xml' ||
      entryName === 'word/_rels/document.xml.rels' ||
      entryName.startsWith('word/media/') ||
      (entryName.startsWith('word/charts/') && entryName.toLowerCase().endsWith('.xml'))
    ) {
      try {
        const out = decompress(compMethod, buf.subarray(dataStart, end));
        if (out) result.set(entryName, out);
      } catch {}
    }
    offset = compSize > 0 ? dataStart + compSize : end;
  }
  return result;
}

function formatNumValueServer(val: number, fmt: string): string {
  if (val <= 0) return String(val);
  if (fmt === 'upperLetter') {
    let n = val;
    let s = '';
    while (n > 0) {
      n--;
      s = String.fromCharCode(65 + (n % 26)) + s;
      n = Math.floor(n / 26);
    }
    return s;
  }
  if (fmt === 'lowerLetter') {
    let n = val;
    let s = '';
    while (n > 0) {
      n--;
      s = String.fromCharCode(97 + (n % 26)) + s;
      n = Math.floor(n / 26);
    }
    return s;
  }
  if (fmt === 'bullet') return '•';
  if (fmt === 'none') return '';
  return String(val);
}

function parseWordNumberingServer(numberingXml?: string) {
  const abstractLevels = new Map<string, Map<number, { numFmt: string; lvlText: string; start: number }>>();
  const numToAbstract = new Map<string, string>();
  const numStartOverrides = new Map<string, Map<number, number>>();

  if (numberingXml) {
    const absRegex = /<w:abstractNum\b[^>]*w:abstractNumId="([^"]+)"[^>]*>([\s\S]*?)<\/w:abstractNum>/g;
    let absM: RegExpExecArray | null;
    while ((absM = absRegex.exec(numberingXml)) !== null) {
      const lvlMap = new Map<number, { numFmt: string; lvlText: string; start: number }>();
      const lvlRegex = /<w:lvl\b[^>]*w:ilvl="(\d+)"[^>]*>([\s\S]*?)<\/w:lvl>/g;
      let lvlM: RegExpExecArray | null;
      while ((lvlM = lvlRegex.exec(absM[2])) !== null) {
        const ilvl = parseInt(lvlM[1], 10);
        const fmtMatch = lvlM[2].match(/<w:numFmt\b[^>]*w:val="([^"]+)"/);
        const txtMatch = lvlM[2].match(/<w:lvlText\b[^>]*w:val="([^"]*)"/);
        const startMatch = lvlM[2].match(/<w:start\b[^>]*w:val="(\d+)"/);
        lvlMap.set(ilvl, {
          numFmt: fmtMatch ? fmtMatch[1] : 'decimal',
          lvlText: txtMatch ? decodeXmlEntitiesServer(txtMatch[1]) : `%${ilvl + 1}.`,
          start: startMatch ? parseInt(startMatch[1], 10) : 1,
        });
      }
      abstractLevels.set(absM[1], lvlMap);
    }

    const numRegex = /<w:num\b[^>]*w:numId="([^"]+)"[^>]*>([\s\S]*?)<\/w:num>/g;
    let numM: RegExpExecArray | null;
    while ((numM = numRegex.exec(numberingXml)) !== null) {
      const numId = numM[1];
      const refM = numM[2].match(/<w:abstractNumId\b[^>]*w:val="([^"]+)"/);
      if (refM) numToAbstract.set(numId, refM[1]);
      const ovRegex = /<w:lvlOverride\b[^>]*w:ilvl="(\d+)"[^>]*>([\s\S]*?)<\/w:lvlOverride>/g;
      let ovM: RegExpExecArray | null;
      while ((ovM = ovRegex.exec(numM[2])) !== null) {
        const stM = ovM[2].match(/<w:startOverride\b[^>]*w:val="(\d+)"/);
        if (stM) {
          if (!numStartOverrides.has(numId)) numStartOverrides.set(numId, new Map());
          numStartOverrides.get(numId)!.set(parseInt(ovM[1], 10), parseInt(stM[1], 10));
        }
      }
    }
  }

  const counters = new Map<string, Map<number, number>>();
  return {
    getPrefix(numId: string, ilvl: number): string {
      const absId = numToAbstract.get(numId);
      if (!absId) return '';
      const lvlMap = abstractLevels.get(absId);
      if (!lvlMap) return '';
      const def = lvlMap.get(ilvl);
      if (!def || def.numFmt === 'none' || def.numFmt === 'bullet') return '';
      if (!counters.has(numId)) counters.set(numId, new Map());
      const numCounters = counters.get(numId)!;
      for (const existingLvl of Array.from(numCounters.keys())) {
        if (existingLvl > ilvl) numCounters.delete(existingLvl);
      }
      const startVal = numStartOverrides.get(numId)?.get(ilvl) ?? def.start;
      const cur = numCounters.has(ilvl) ? numCounters.get(ilvl)! + 1 : startVal;
      numCounters.set(ilvl, cur);
      let formatted = def.lvlText || `%${ilvl + 1}.`;
      formatted = formatted.replace(/%(\d+)/g, (_, idxStr) => {
        const refLvl = parseInt(idxStr, 10) - 1;
        const refDef = lvlMap.get(refLvl);
        const refVal =
          numCounters.get(refLvl) ??
          numStartOverrides.get(numId)?.get(refLvl) ??
          refDef?.start ??
          1;
        return formatNumValueServer(refVal, refDef?.numFmt || 'decimal');
      });
      return formatted ? `${formatted} ` : '';
    },
  };
}

function hasAnswerHighlightServer(rPr: string): boolean {
  const hasUnderline = /<w:u\b(?![^>]*w:val="none")/.test(rPr);
  const hasHighlight = /<w:highlight\b(?![^>]*w:val="none")/.test(rPr);
  const colorMatch = rPr.match(/<w:color\b[^>]*w:val="([^"]+)"/i);
  const colorVal = colorMatch ? colorMatch[1].toUpperCase() : '';
  const hasSpecialColor =
    Boolean(colorVal) &&
    colorVal !== '000000' &&
    colorVal !== 'AUTO' &&
    colorVal !== '111111' &&
    colorVal !== '222222' &&
    colorVal !== '333333' &&
    colorVal !== 'FFFFFF';
  return hasUnderline || hasHighlight || hasSpecialColor;
}

const SUPERSCRIPT_MAP_SERVER: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '−': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ', g: 'ᵍ', h: 'ʰ', i: 'ⁱ', j: 'ʲ',
  k: 'ᵏ', l: 'ˡ', m: 'ᵐ', n: 'ⁿ', o: 'ᵒ', p: 'ᵖ', r: 'ʳ', s: 'ˢ', t: 'ᵗ', u: 'ᵘ',
  v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ',
};

const SUBSCRIPT_MAP_SERVER: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '−': '₋', '=': '₌', '(': '₍', ')': '₎',
  a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', o: 'ₒ',
  p: 'ₚ', r: 'ᵣ', s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ',
};

function toUnicodeSuperscriptServer(text: string): string {
  return Array.from(text).map((ch) => SUPERSCRIPT_MAP_SERVER[ch] ?? ch).join('');
}

function toUnicodeSubscriptServer(text: string): string {
  return Array.from(text).map((ch) => SUBSCRIPT_MAP_SERVER[ch] ?? ch).join('');
}

function resolveAlternateContentServer(xml: string): string {
  if (!xml.includes('<mc:AlternateContent')) return xml;
  return xml.replace(/<mc:AlternateContent\b[^>]*>([\s\S]*?)<\/mc:AlternateContent>/g, (_m, inner) => {
    const choice = inner.match(/<mc:Choice\b[^>]*>([\s\S]*?)<\/mc:Choice>/);
    if (choice) return choice[1];
    const fallback = inner.match(/<mc:Fallback\b[^>]*>([\s\S]*?)<\/mc:Fallback>/);
    return fallback ? fallback[1] : '';
  });
}

function extractDirectTagBlocksServer(xmlStr: string, tag: string): string[] {
  const out: string[] = [];
  const open = `<${tag}`;
  const close = `</${tag}>`;
  let pos = 0;
  while (pos < xmlStr.length) {
    const st = xmlStr.indexOf(open, pos);
    if (st === -1) break;
    const ch = xmlStr[st + open.length];
    if (ch !== '>' && ch !== ' ' && ch !== '/') {
      pos = st + open.length;
      continue;
    }
    const endTag = xmlStr.indexOf('>', st);
    if (endTag === -1) break;
    if (xmlStr[endTag - 1] === '/') {
      out.push(xmlStr.slice(st, endTag + 1));
      pos = endTag + 1;
      continue;
    }
    let d = 1;
    let sc = endTag + 1;
    while (d > 0 && sc < xmlStr.length) {
      const no = xmlStr.indexOf(open, sc);
      const nc = xmlStr.indexOf(close, sc);
      if (nc === -1) {
        sc = xmlStr.length;
        break;
      }
      if (no !== -1 && no < nc && (xmlStr[no + open.length] === '>' || xmlStr[no + open.length] === ' ')) {
        d++;
        sc = no + open.length;
      } else {
        d--;
        sc = nc + close.length;
      }
    }
    out.push(xmlStr.slice(st, sc));
    pos = sc;
  }
  return out;
}

function extractWordMathTextServer(mathXml: string): string {
  const wrapMathText = (val: string) =>
    `<m:t>${val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</m:t>`;
  let working = mathXml;
  working = working.replace(
    /<m:f\b[^>]*>[\s\S]*?<m:num\b[^>]*>([\s\S]*?)<\/m:num>[\s\S]*?<m:den\b[^>]*>([\s\S]*?)<\/m:den>[\s\S]*?<\/m:f>/g,
    (_m, numXml, denXml) => {
      const n = extractWordMathTextServer(numXml).trim();
      const d = extractWordMathTextServer(denXml).trim();
      return wrapMathText(n && d ? `(${n})/(${d})` : `${n}${d}`);
    }
  );
  working = working.replace(
    /<m:sSubSup\b[^>]*>[\s\S]*?<m:e\b[^>]*>([\s\S]*?)<\/m:e>[\s\S]*?<m:sub\b[^>]*>([\s\S]*?)<\/m:sub>[\s\S]*?<m:sup\b[^>]*>([\s\S]*?)<\/m:sup>[\s\S]*?<\/m:sSubSup>/g,
    (_m, baseXml, subXml, supXml) =>
      wrapMathText(
        `${extractWordMathTextServer(baseXml)}${toUnicodeSubscriptServer(extractWordMathTextServer(subXml))}${toUnicodeSuperscriptServer(extractWordMathTextServer(supXml))}`
      )
  );
  working = working.replace(
    /<m:sSup\b[^>]*>[\s\S]*?<m:e\b[^>]*>([\s\S]*?)<\/m:e>[\s\S]*?<m:sup\b[^>]*>([\s\S]*?)<\/m:sup>[\s\S]*?<\/m:sSup>/g,
    (_m, baseXml, supXml) =>
      wrapMathText(
        `${extractWordMathTextServer(baseXml)}${toUnicodeSuperscriptServer(extractWordMathTextServer(supXml))}`
      )
  );
  working = working.replace(
    /<m:sSub\b[^>]*>[\s\S]*?<m:e\b[^>]*>([\s\S]*?)<\/m:e>[\s\S]*?<m:sub\b[^>]*>([\s\S]*?)<\/m:sub>[\s\S]*?<\/m:sSub>/g,
    (_m, baseXml, subXml) =>
      wrapMathText(
        `${extractWordMathTextServer(baseXml)}${toUnicodeSubscriptServer(extractWordMathTextServer(subXml))}`
      )
  );
  let out = '';
  const tRe = /<(?:m:t|w:t)\b[^>]*>([\s\S]*?)<\/(?:m:t|w:t)>/g;
  let tm: RegExpExecArray | null;
  while ((tm = tRe.exec(working)) !== null) {
    out += decodeXmlEntitiesServer(tm[1]);
  }
  return out;
}

function parseWordChartXmlServer(chartXml: string): any | null {
  if (!chartXml || !chartXml.includes('<c:ser')) return null;

  const extractNodes = (frag: string) => {
    const parts: string[] = [];
    const re = /<(?:a:t|c:v|w:t)\b[^>]*>([\s\S]*?)<\/(?:a:t|c:v|w:t)>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(frag)) !== null) {
      const t = decodeXmlEntitiesServer(m[1]).trim();
      if (t) parts.push(t);
    }
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  };

  const parsePts = (cacheXml: string) => {
    const map = new Map<number, string>();
    const ptRe = /<c:pt\b[^>]*idx="(\d+)"[^>]*>([\s\S]*?)<\/c:pt>/g;
    let pm: RegExpExecArray | null;
    while ((pm = ptRe.exec(cacheXml)) !== null) {
      const idx = parseInt(pm[1], 10);
      const vM = pm[2].match(/<c:v\b[^>]*>([\s\S]*?)<\/c:v>/);
      if (vM) map.set(idx, decodeXmlEntitiesServer(vM[1]).trim());
    }
    return map;
  };

  let caption: string | undefined;
  const plotAreaIdx = chartXml.indexOf('<c:plotArea');
  const headerRegion = plotAreaIdx !== -1 ? chartXml.slice(0, plotAreaIdx) : chartXml;
  const titleM = headerRegion.match(/<c:title\b[^>]*>([\s\S]*?)<\/c:title>/);
  if (titleM) {
    const t = extractNodes(titleM[1]);
    if (t) caption = t;
  }

  let chartType: 'bar' | 'column' | 'line' | 'pie' | 'area' = 'column';
  if (/<c:(?:pieChart|pie3DChart|doughnutChart|ofPieChart)\b/.test(chartXml)) chartType = 'pie';
  else if (/<c:(?:lineChart|line3DChart|scatterChart)\b/.test(chartXml)) chartType = 'line';
  else if (/<c:(?:areaChart|area3DChart)\b/.test(chartXml)) chartType = 'area';
  else if (/<c:(?:barChart|bar3DChart)\b/.test(chartXml)) {
    const bdM = chartXml.match(/<c:barDir\b[^>]*val="([^"]+)"/i);
    chartType = bdM && bdM[1].toLowerCase() === 'bar' ? 'bar' : 'column';
  }

  let unit = '';
  const valAxRe = /<c:valAx\b[^>]*>([\s\S]*?)<\/c:valAx>/g;
  let vm: RegExpExecArray | null;
  while ((vm = valAxRe.exec(chartXml)) !== null) {
    const axTitleM = vm[1].match(/<c:title\b[^>]*>([\s\S]*?)<\/c:title>/);
    if (axTitleM) {
      const ut = extractNodes(axTitleM[1]);
      if (ut) {
        unit = ut;
        break;
      }
    }
  }

  const serBlocks = extractDirectTagBlocksServer(chartXml, 'c:ser');
  if (serBlocks.length === 0) return null;

  const categoryMap = new Map<number, string>();
  const rawSeriesList: { name: string; valMap: Map<number, string> }[] = [];

  for (let sIdx = 0; sIdx < serBlocks.length; sIdx++) {
    const serXml = serBlocks[sIdx];
    let serName = '';
    const txM = serXml.match(/<c:tx\b[^>]*>([\s\S]*?)<\/c:tx>/);
    if (txM) {
      const scM = txM[1].match(/<c:strCache\b[^>]*>([\s\S]*?)<\/c:strCache>/);
      if (scM) serName = Array.from(parsePts(scM[1]).values()).join(' ').trim();
      else {
        const dvM = txM[1].match(/<c:v\b[^>]*>([\s\S]*?)<\/c:v>/);
        if (dvM) serName = decodeXmlEntitiesServer(dvM[1]).trim();
      }
    }

    const catM =
      serXml.match(/<c:cat\b[^>]*>([\s\S]*?)<\/c:cat>/) ||
      serXml.match(/<c:xVal\b[^>]*>([\s\S]*?)<\/c:xVal>/);
    if (catM) {
      const mlM = catM[1].match(/<c:multiLvlStrCache\b[^>]*>([\s\S]*?)<\/c:multiLvlStrCache>/);
      if (mlM) {
        const perIdx = new Map<number, string[]>();
        for (const lvlXml of extractDirectTagBlocksServer(mlM[1], 'c:lvl')) {
          parsePts(lvlXml).forEach((v, k) => {
            if (!perIdx.has(k)) perIdx.set(k, []);
            perIdx.get(k)!.push(v);
          });
        }
        perIdx.forEach((parts, k) => {
          if (!categoryMap.has(k)) categoryMap.set(k, parts.filter(Boolean).join(' - '));
        });
      } else {
        const cM =
          catM[1].match(/<c:strCache\b[^>]*>([\s\S]*?)<\/c:strCache>/) ||
          catM[1].match(/<c:numCache\b[^>]*>([\s\S]*?)<\/c:numCache>/) ||
          catM[1].match(/<c:strLit\b[^>]*>([\s\S]*?)<\/c:strLit>/) ||
          catM[1].match(/<c:numLit\b[^>]*>([\s\S]*?)<\/c:numLit>/);
        if (cM) {
          parsePts(cM[1]).forEach((v, k) => {
            if (!categoryMap.has(k)) categoryMap.set(k, v);
          });
        }
      }
    }

    const valM =
      serXml.match(/<c:val\b[^>]*>([\s\S]*?)<\/c:val>/) ||
      serXml.match(/<c:yVal\b[^>]*>([\s\S]*?)<\/c:yVal>/);
    const valMap = new Map<number, string>();
    if (valM) {
      const ncM =
        valM[1].match(/<c:numCache\b[^>]*>([\s\S]*?)<\/c:numCache>/) ||
        valM[1].match(/<c:numLit\b[^>]*>([\s\S]*?)<\/c:numLit>/);
      if (ncM) parsePts(ncM[1]).forEach((v, k) => valMap.set(k, v));
    }

    if (valMap.size > 0) {
      rawSeriesList.push({
        name: serName || (serBlocks.length === 1 ? caption || 'Giá trị' : `Chuỗi ${sIdx + 1}`),
        valMap,
      });
    }
  }

  if (rawSeriesList.length === 0) return null;
  const idxSet = new Set<number>();
  categoryMap.forEach((_v, k) => idxSet.add(k));
  rawSeriesList.forEach((s) => s.valMap.forEach((_v, k) => idxSet.add(k)));
  const sortedIndices = Array.from(idxSet).sort((a, b) => a - b);
  if (sortedIndices.length === 0) return null;

  const categories = sortedIndices.map((idx, pos) => categoryMap.get(idx) || `Mục ${pos + 1}`);
  const series = rawSeriesList.map((rs) => {
    const values: (number | null)[] = [];
    const displayValues: string[] = [];
    for (const idx of sortedIndices) {
      const raw = rs.valMap.get(idx);
      if (raw === undefined) {
        values.push(null);
        displayValues.push('');
      } else {
        const num = Number(raw.replace(/\s+/g, '').replace(',', '.'));
        if (Number.isFinite(num)) {
          values.push(num);
          displayValues.push(
            Number.isInteger(num) ? String(num) : String(Number(num.toFixed(6))).replace('.', ',')
          );
        } else {
          values.push(null);
          displayValues.push(raw);
        }
      }
    }
    return { name: rs.name, values, displayValues };
  });

  const firstSer = series[0];
  const items = categories.map((label, idx) => ({
    label,
    value: typeof firstSer.values[idx] === 'number' ? (firstSer.values[idx] as number) : 0,
    displayValue: firstSer.displayValues[idx] || undefined,
  }));

  return {
    ...(caption ? { caption } : {}),
    type: chartType,
    unit,
    items,
    categories,
    series,
  };
}

function isGenuineOptionLayoutTableServer(expandedRows: string[][]): boolean {
  const flatCells = expandedRows.flat().map((c) => c.trim()).filter(Boolean);
  if (flatCells.length < 2 || flatCells.length > 4) return false;
  const matchedLetters = new Set<string>();
  for (const cell of flatCells) {
    const m = cell.match(/^\*?\s*([ABCD])\s*\*?\s*[.):]\s+\S/);
    if (!m) return false;
    matchedLetters.add(m[1]);
  }
  return matchedLetters.size === flatCells.length;
}

function extractDocxStructuredFromDataUrlServer(dataUrl: string): {
  text: string;
  images: Record<string, string>;
  tables: Record<string, any>;
  charts: Record<string, any>;
} {
  try {
    const b64 = (dataUrl || '').split(',')[1];
    if (!b64) return { text: '', images: {}, tables: {}, charts: {} };
    const buf = Buffer.from(b64, 'base64');
    const entries = readZipEntriesServer(buf);
    const docBuf = entries.get('word/document.xml');
    if (!docBuf) return { text: '', images: {}, tables: {}, charts: {} };

    const xml = docBuf.toString('utf8');
    const numberingXml = entries.get('word/numbering.xml')?.toString('utf8');
    const relsXml = entries.get('word/_rels/document.xml.rels')?.toString('utf8');

    const relsMap = new Map<string, string>();
    if (relsXml) {
      const relRegex = /<Relationship\b[^>]*>/g;
      let m: RegExpExecArray | null;
      while ((m = relRegex.exec(relsXml)) !== null) {
        const idM = m[0].match(/\bId="([^"]+)"/);
        const targetM = m[0].match(/\bTarget="([^"]+)"/);
        if (idM && targetM) {
          const normalizedTarget = targetM[1]
            .replace(/^(\.\.\/)+/, '')
            .replace(/^\/+/, '')
            .replace(/^word\//, '');
          relsMap.set(idM[1], `word/${normalizedTarget}`);
        }
      }
    }

    const mediaMap = new Map<string, string>();
    const chartXmlMap = new Map<string, string>();
    for (const [entryName, data] of entries.entries()) {
      if (entryName.startsWith('word/media/')) {
        const mime = guessImageMimeServer(entryName);
        if (mime && data.length <= 4 * 1024 * 1024) {
          mediaMap.set(entryName, `data:${mime};base64,${data.toString('base64')}`);
        }
      } else if (entryName.startsWith('word/charts/') && entryName.toLowerCase().endsWith('.xml')) {
        chartXmlMap.set(entryName, data.toString('utf8'));
      }
    }

    const numbering = parseWordNumberingServer(numberingXml);
    const images: Record<string, string> = {};
    const tables: Record<string, any> = {};
    const charts: Record<string, any> = {};
    let imgCounter = 0;
    let tblCounter = 0;
    let chartCounter = 0;

    const extractParagraphText = (pXml: string, depth = 0): string => {
      let prefix = '';
      const numPrMatch = pXml.match(/<w:numPr>([\s\S]*?)<\/w:numPr>/);
      if (numPrMatch) {
        const ilvlM = numPrMatch[1].match(/<w:ilvl\b[^>]*w:val="(\d+)"/);
        const numIdM = numPrMatch[1].match(/<w:numId\b[^>]*w:val="([^"]+)"/);
        if (numIdM && numIdM[1] !== '0') {
          prefix = numbering.getPrefix(numIdM[1], ilvlM ? parseInt(ilvlM[1], 10) : 0);
        }
      }

      const normalizedPXml = resolveAlternateContentServer(pXml);
      const pieces: { text: string; marked: boolean }[] = [];
      const appendPiece = (text: string, marked: boolean) => {
        if (!text) return;
        if (pieces.length > 0 && pieces[pieces.length - 1].marked === marked) {
          pieces[pieces.length - 1].text += text;
        } else {
          pieces.push({ text, marked });
        }
      };

      const childBlockRegex = /<m:oMath\b[^>]*>[\s\S]*?<\/m:oMath>|<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g;
      let rm: RegExpExecArray | null;
      while ((rm = childBlockRegex.exec(normalizedPXml)) !== null) {
        const fullMatch = rm[0];
        if (fullMatch.startsWith('<m:oMath')) {
          const mathText = extractWordMathTextServer(fullMatch);
          if (mathText) appendPiece(mathText, false);
          continue;
        }

        const inner = rm[1] || '';
        const rPrM = inner.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/);
        const rPr = rPrM ? rPrM[1] : '';
        const marked = rPr ? hasAnswerHighlightServer(rPr) : false;
        const vertAlignM = rPr.match(/<w:vertAlign\b[^>]*w:val="(superscript|subscript)"/i);
        const vertAlign = vertAlignM ? vertAlignM[1].toLowerCase() : null;

        const assetTokens: string[] = [];
        const seenRIds = new Set<string>();
        const chartRefRegex = /<c:chart\b[^>]*r:id="([^"]+)"/g;
        let cm: RegExpExecArray | null;
        while ((cm = chartRefRegex.exec(inner)) !== null) {
          const rId = cm[1];
          if (seenRIds.has(`chart:${rId}`)) continue;
          seenRIds.add(`chart:${rId}`);
          const targetPath = relsMap.get(rId);
          if (targetPath && chartXmlMap.has(targetPath)) {
            const parsedChart = parseWordChartXmlServer(chartXmlMap.get(targetPath)!);
            if (parsedChart) {
              chartCounter += 1;
              const chartKey = `chart_${chartCounter}`;
              charts[chartKey] = parsedChart;
              assetTokens.push(`[[CHART:${chartKey}]]`);
            }
          }
        }

        const blipRegex = /(?:r:embed|r:id|o:relid)="([^"]+)"/g;
        let bm: RegExpExecArray | null;
        while ((bm = blipRegex.exec(inner)) !== null) {
          const rId = bm[1];
          if (seenRIds.has(`img:${rId}`)) continue;
          seenRIds.add(`img:${rId}`);
          const targetPath = relsMap.get(rId);
          if (targetPath && mediaMap.has(targetPath)) {
            imgCounter += 1;
            const imgKey = `img_${imgCounter}`;
            images[imgKey] = mediaMap.get(targetPath)!;
            assetTokens.push(`[[IMG:${imgKey}]]`);
          }
        }

        const txbxTexts: string[] = [];
        if (depth < 2 && inner.includes('<w:txbxContent')) {
          for (const txbxXml of extractDirectTagBlocksServer(inner, 'w:txbxContent')) {
            for (const innerP of extractDirectTagBlocksServer(txbxXml, 'w:p')) {
              const txt = extractParagraphText(innerP, depth + 1).trim();
              if (txt) txbxTexts.push(txt);
            }
          }
        }

        const cleanInner = inner
          .replace(/<w:drawing[\s\S]*?<\/w:drawing>/g, '')
          .replace(/<w:pict[\s\S]*?<\/w:pict>/g, '')
          .replace(/<w:rPr[\s\S]*?<\/w:rPr>/g, '');

        let runText = '';
        const tokenRegex =
          /<w:t\b[^>]*>([\s\S]*?)<\/w:t>|<w:tab\b[^>]*\/>|<w:br\b[^>]*\/>|<w:cr\b[^>]*\/>/g;
        let tm: RegExpExecArray | null;
        while ((tm = tokenRegex.exec(cleanInner)) !== null) {
          if (tm[1] !== undefined) {
            const decoded = decodeXmlEntitiesServer(tm[1]);
            if (vertAlign === 'superscript') runText += toUnicodeSuperscriptServer(decoded);
            else if (vertAlign === 'subscript') runText += toUnicodeSubscriptServer(decoded);
            else runText += decoded;
          } else if (tm[0].startsWith('<w:tab')) {
            runText += '\t';
          } else {
            runText += '\n';
          }
        }

        if (txbxTexts.length > 0) {
          runText = (runText ? `${runText}\n` : '') + txbxTexts.join('\n');
        }
        if (assetTokens.length > 0) {
          runText = (runText ? `${runText}\n` : '') + assetTokens.join('\n');
        }

        appendPiece(runText, marked);
      }

      let out = prefix;
      if (/^\s*([ABCDabcdđ])\s*[.)]\s*$/.test(prefix) && pieces.length > 0 && pieces[0].marked && !prefix.includes('*')) {
        out = `*${prefix}`;
      }

      for (let i = 0; i < pieces.length; i++) {
        const piece = pieces[i];
        let t = piece.text;
        if (piece.marked) {
          const nextText = pieces[i + 1]?.text || '';
          const prevEndsWithStar = /\*\s*$/.test(out);
          if (/(?:^|[\s\t])([ABCDabcdđ])\s*[.)]/.test(t) && !prevEndsWithStar) {
            t = t.replace(/(^|[\s\t])(?!\*)([ABCDabcdđ]\s*[.)])/g, '$1*$2');
          } else if (
            !prevEndsWithStar &&
            /^\s*([ABCDabcdđ])\s*$/.test(t) &&
            /^\s*[.)]/.test(nextText) &&
            (out === '' || /[\s\t]$/.test(out))
          ) {
            t = t.replace(/([ABCDabcdđ])/, '*$1');
          }
        }
        out += t;
      }

      return out.replace(/\r/g, '').trimEnd();
    };

    const bodyMatch = xml.match(/<w:body\b[^>]*>([\s\S]*?)<\/w:body>/);
    const bodyXml = bodyMatch ? bodyMatch[1] : xml;
    const lines: string[] = [];
    let cursor = 0;

    while (cursor < bodyXml.length) {
      const nextP = bodyXml.indexOf('<w:p', cursor);
      const nextTbl = bodyXml.indexOf('<w:tbl', cursor);
      const validP =
        nextP !== -1 && (bodyXml[nextP + 4] === '>' || bodyXml[nextP + 4] === ' ' || bodyXml[nextP + 4] === '/');
      const validTbl =
        nextTbl !== -1 &&
        (bodyXml[nextTbl + 6] === '>' || bodyXml[nextTbl + 6] === ' ' || bodyXml[nextTbl + 6] === '/');

      if (nextP === -1 && nextTbl === -1) break;

      if (nextTbl !== -1 && (!validP || nextTbl < nextP) && validTbl) {
        let depth = 1;
        let scan = nextTbl + 6;
        while (depth > 0 && scan < bodyXml.length) {
          const openIdx = bodyXml.indexOf('<w:tbl', scan);
          const closeIdx = bodyXml.indexOf('</w:tbl>', scan);
          if (closeIdx === -1) {
            scan = bodyXml.length;
            break;
          }
          if (openIdx !== -1 && openIdx < closeIdx && (bodyXml[openIdx + 6] === '>' || bodyXml[openIdx + 6] === ' ')) {
            depth++;
            scan = openIdx + 6;
          } else {
            depth--;
            scan = closeIdx + 8;
          }
        }
        const tblXml = bodyXml.slice(nextTbl, scan);
        cursor = scan;

        const gridColWidths: number[] = [];
        const tblGridM = tblXml.match(/<w:tblGrid\b[^>]*>([\s\S]*?)<\/w:tblGrid>/);
        if (tblGridM) {
          const gcRe = /<w:gridCol\b[^>]*w:w="(\d+)"/g;
          let gm: RegExpExecArray | null;
          while ((gm = gcRe.exec(tblGridM[1])) !== null) {
            const v = parseInt(gm[1], 10);
            if (v > 0) gridColWidths.push(v);
          }
        }

        const trBlocks = extractDirectTagBlocksServer(tblXml, 'w:tr');
        const rawRows: {
          isHeaderRow: boolean;
          cells: { text: string; colSpan: number; vMerge: 'none' | 'restart' | 'continue'; align?: 'left' | 'center' | 'right' }[];
        }[] = [];

        for (let ri = 0; ri < trBlocks.length; ri++) {
          const trXml = trBlocks[ri];
          const isHeaderRow = /<w:tblHeader\b/.test(trXml) || ri === 0;
          const tcBlocks = extractDirectTagBlocksServer(trXml, 'w:tc');
          const rowCells: { text: string; colSpan: number; vMerge: 'none' | 'restart' | 'continue'; align?: 'left' | 'center' | 'right' }[] = [];
          for (const tcXml of tcBlocks) {
            const tcPr = (tcXml.match(/<w:tcPr\b[^>]*>([\s\S]*?)<\/w:tcPr>/) || [])[1] || '';
            const gsM = tcPr.match(/<w:gridSpan\b[^>]*w:val="(\d+)"/);
            const colSpan = gsM ? Math.max(1, parseInt(gsM[1], 10)) : 1;
            let vMerge: 'none' | 'restart' | 'continue' = 'none';
            const vmM = tcPr.match(/<w:vMerge\b([^>]*)\/?>/);
            if (vmM) {
              const valM = vmM[1].match(/w:val="([^"]+)"/);
              vMerge = valM && valM[1] === 'restart' ? 'restart' : 'continue';
            }
            const cellParagraphs: string[] = [];
            let align: 'left' | 'center' | 'right' | undefined;
            for (const pXml of extractDirectTagBlocksServer(tcXml, 'w:p')) {
              if (!align) {
                const jcM = pXml.match(/<w:jc\b[^>]*w:val="(left|center|right|both|start|end)"/i);
                if (jcM) {
                  const v = jcM[1].toLowerCase();
                  align = v === 'center' ? 'center' : v === 'right' || v === 'end' ? 'right' : 'left';
                }
              }
              const pt = extractParagraphText(pXml).trim();
              if (pt) cellParagraphs.push(pt);
            }
            rowCells.push({
              text: cellParagraphs.join('\n').replace(/[ \t]+/g, ' ').trim(),
              colSpan,
              vMerge,
              align,
            });
          }
          if (rowCells.some((c) => c.text.length > 0 || c.vMerge === 'continue')) {
            rawRows.push({ isHeaderRow, cells: rowCells });
          }
        }

        if (rawRows.length > 0) {
          const colCount = Math.max(
            gridColWidths.length,
            ...rawRows.map((row) => row.cells.reduce((s, c) => s + c.colSpan, 0)),
            1
          );
          let hasAnyMerge = false;
          const expandedRows: string[][] = [];
          const structuredRows: any[] = [];
          const activeVMerge: any[] = Array(colCount).fill(null);

          for (const row of rawRows) {
            const flatRow: string[] = [];
            const sCells: any[] = [];
            let colCursor = 0;
            for (const cell of row.cells) {
              if (cell.colSpan > 1 || cell.vMerge !== 'none') hasAnyMerge = true;
              if (cell.vMerge === 'continue') {
                const anchor = activeVMerge[colCursor];
                if (anchor) {
                  anchor.rowSpan = (anchor.rowSpan || 1) + 1;
                  if (cell.text) anchor.text = anchor.text ? `${anchor.text}\n${cell.text}` : cell.text;
                }
                for (let k = 0; k < cell.colSpan; k++) flatRow.push('');
                colCursor += cell.colSpan;
                continue;
              }
              const sCell: any = {
                text: cell.text,
                ...(cell.colSpan > 1 ? { colSpan: cell.colSpan } : {}),
                ...(row.isHeaderRow ? { isHeader: true } : {}),
                ...(cell.align ? { align: cell.align } : {}),
              };
              sCells.push(sCell);
              for (let k = 0; k < cell.colSpan; k++) {
                flatRow.push(k === 0 ? cell.text : '');
                if (colCursor + k < colCount) activeVMerge[colCursor + k] = cell.vMerge === 'restart' ? sCell : null;
              }
              colCursor += cell.colSpan;
            }
            while (flatRow.length < colCount) flatRow.push('');
            expandedRows.push(flatRow.slice(0, colCount));
            structuredRows.push({ isHeader: row.isHeaderRow, cells: sCells });
          }

          if (isGenuineOptionLayoutTableServer(expandedRows)) {
            expandedRows.flat().filter(Boolean).forEach((cell) => lines.push(cell));
          } else if (expandedRows.length >= 2 && colCount >= 2) {
            let colWidths: number[] | undefined;
            if (gridColWidths.length === colCount) {
              const sumW = gridColWidths.reduce((a, b) => a + b, 0);
              if (sumW > 0) colWidths = gridColWidths.map((w) => Math.round(((w / sumW) * 100) * 10) / 10);
            }
            tblCounter += 1;
            tables[`tbl_${tblCounter}`] = {
              headers: expandedRows[0],
              rows: expandedRows.slice(1),
              ...(colWidths ? { colWidths } : {}),
              ...(hasAnyMerge ? { structuredRows } : {}),
            };
            const escMd = (c: string) =>
              c.replace(/\|/g, '&#124;').replace(/\r?\n/g, ' <br> ').replace(/\s+/g, ' ').trim();
            const padRow = (r: string[]) => `| ${r.map(escMd).join(' | ')} |`;
            if (lines.length > 0 && lines[lines.length - 1] !== '') lines.push('');
            lines.push(padRow(expandedRows[0]));
            lines.push(`| ${Array(colCount).fill('---').join(' | ')} |`);
            for (let r = 1; r < expandedRows.length; r++) lines.push(padRow(expandedRows[r]));
            lines.push('');
          } else {
            expandedRows.forEach((r) => lines.push(r.join('\t')));
          }
        }
        continue;
      }

      if (nextP !== -1) {
        if (!validP) {
          cursor = nextP + 4;
          continue;
        }
        const closeP = bodyXml.indexOf('</w:p>', nextP);
        const selfClose = bodyXml.indexOf('/>', nextP);
        const tagEnd = bodyXml.indexOf('>', nextP);
        if (selfClose !== -1 && selfClose + 1 === tagEnd) {
          cursor = tagEnd + 1;
          continue;
        }
        if (closeP === -1) break;
        const pXml = bodyXml.slice(nextP, closeP + 6);
        cursor = closeP + 6;
        const text = extractParagraphText(pXml);
        if (text.trim().length > 0) lines.push(text);
      } else {
        cursor = nextTbl + 6;
      }
    }

    return {
      text: lines.join('\n').replace(/\n{3,}/g, '\n\n').trim(),
      images,
      tables,
      charts,
    };
  } catch (err) {
    console.warn('[DocxParser] Could not extract word/document.xml:', err);
    return { text: '', images: {}, tables: {}, charts: {} };
  }
}

// ============================================================================
// TRÍCH XUẤT NGUYÊN BẢN TỆP PDF TRÊN SERVER (VĂN BẢN + BẢNG BIỂU + HÌNH ẢNH)
// ============================================================================

const PNG_CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function pngCrc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = PNG_CRC32_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makePngChunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(pngCrc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodeRawPixelsToPngDataUrl(
  rawData: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
  maxDim = 1100
): string | null {
  if (!width || !height || width * height > 6000 * 6000) return null;
  const pixelCount = width * height;
  const bpp = Math.round(rawData.length / pixelCount);
  if (bpp !== 1 && bpp !== 3 && bpp !== 4) return null;

  // Thu nhỏ gọn ảnh biểu đồ độ phân giải siêu cao để không bao giờ bị rơi mất vì vượt dung lượng
  let outW = width;
  let outH = height;
  if (Math.max(width, height) > maxDim) {
    const scale = maxDim / Math.max(width, height);
    outW = Math.max(1, Math.round(width * scale));
    outH = Math.max(1, Math.round(height * scale));
  }

  const rgba = Buffer.alloc(outH * (1 + outW * 4));
  const scaleX = width / outW;
  const scaleY = height / outH;

  for (let y = 0; y < outH; y++) {
    const rowOut = y * (1 + outW * 4);
    rgba[rowOut] = 0; // filter none
    const srcY0 = Math.floor(y * scaleY);
    const srcY1 = Math.min(height - 1, Math.max(srcY0, Math.floor((y + 1) * scaleY) - 1));
    for (let x = 0; x < outW; x++) {
      const dst = rowOut + 1 + x * 4;
      const srcX0 = Math.floor(x * scaleX);
      const srcX1 = Math.min(width - 1, Math.max(srcX0, Math.floor((x + 1) * scaleX) - 1));

      if (outW === width && outH === height) {
        const src = (srcY0 * width + srcX0) * bpp;
        if (bpp === 4) {
          rgba[dst] = rawData[src];
          rgba[dst + 1] = rawData[src + 1];
          rgba[dst + 2] = rawData[src + 2];
          rgba[dst + 3] = rawData[src + 3];
        } else if (bpp === 3) {
          rgba[dst] = rawData[src];
          rgba[dst + 1] = rawData[src + 1];
          rgba[dst + 2] = rawData[src + 2];
          rgba[dst + 3] = 255;
        } else {
          const g = rawData[src];
          rgba[dst] = g;
          rgba[dst + 1] = g;
          rgba[dst + 2] = g;
          rgba[dst + 3] = 255;
        }
      } else {
        // Trung bình vùng (box filter) giúp đường nét & chữ số trên biểu đồ luôn sắc nét khi thu gọn
        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        let aSum = 0;
        let cnt = 0;
        for (let sy = srcY0; sy <= srcY1; sy++) {
          for (let sx = srcX0; sx <= srcX1; sx++) {
            const src = (sy * width + sx) * bpp;
            if (bpp === 4) {
              rSum += rawData[src];
              gSum += rawData[src + 1];
              bSum += rawData[src + 2];
              aSum += rawData[src + 3];
            } else if (bpp === 3) {
              rSum += rawData[src];
              gSum += rawData[src + 1];
              bSum += rawData[src + 2];
              aSum += 255;
            } else {
              const g = rawData[src];
              rSum += g;
              gSum += g;
              bSum += g;
              aSum += 255;
            }
            cnt++;
          }
        }
        rgba[dst] = Math.round(rSum / cnt);
        rgba[dst + 1] = Math.round(gSum / cnt);
        rgba[dst + 2] = Math.round(bSum / cnt);
        rgba[dst + 3] = Math.round(aSum / cnt);
      }
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(outW, 0);
  ihdr.writeUInt32BE(outH, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(rgba, { level: 6 });
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    makePngChunk('IHDR', ihdr),
    makePngChunk('IDAT', idat),
    makePngChunk('IEND', Buffer.alloc(0)),
  ]);
  return `data:image/png;base64,${png.toString('base64')}`;
}

async function extractPdfStructuredFromDataUrlServer(dataUrl: string): Promise<{
  text: string;
  images: Record<string, string>;
  pageCount: number;
  extractedPageCount: number;
  warnings: string[];
}> {
  const warnings: string[] = [];
  try {
    const b64 = (dataUrl || '').split(',')[1];
    if (!b64) {
      return { text: '', images: {}, pageCount: 0, extractedPageCount: 0, warnings };
    }
    const buf = new Uint8Array(Buffer.from(b64, 'base64'));
    const pdf = await getDocumentProxy(buf);
    const totalPages = pdf.numPages || 0;
    const allLines: string[] = [];
    const images: Record<string, string> = {};
    let imgCounter = 0;
    let extractedPageCount = 0;

    interface PdfRowSegment {
      text: string;
      xStart: number;
      xEnd: number;
    }

    interface PdfRowEntry {
      y: number;
      text: string;
      segments?: PdfRowSegment[];
      rawItems?: { x: number; end: number; s: string }[];
    }

    const isBreakLine = (s: string) =>
      /^\*?\s*[ABCDabcdđĐ]\s*[.):]\s*/.test(s) ||
      /^(?:Câu|Bài)\s*\d+/i.test(s) ||
      /^(?:PHẦN|Phần)\s*(?:I{1,3}|IV|V|\d+)\b/i.test(s) ||
      /^(?:I{1,3}|[ABC])\.\s*(?:CÂU|TRẮC\s*NGHIỆM|TỰ\s*LUẬN|PHẦN)/i.test(s) ||
      /^(?:BẢNG\s+ĐÁP\s+ÁN|ĐÁP\s+ÁN|HƯỚNG\s+DẪN\s+CHẤM|Lời\s+giải|Giải\s+thích)\b/i.test(s) ||
      /^(?:Trang\s+\d+|Mã\s+đề\s*[:\-]?\s*[A-Za-z0-9]+|[-–—*\s]*HẾT[-–—*\s]*)/i.test(s) ||
      /^\(?\s*(?:Nguồn|Ghi\s*chú)\s*[:\-]/i.test(s);

    const hasInlineOptionOrQuestionColumns = (cols: string[]) =>
      cols.some((c) => {
        const t = c.trim();
        return (
          /^\*?\s*[ABCD]\s*[.)]\s*\S/.test(t) ||
          /^\*?\s*[abcdđ]\s*[.)]\s*\S/.test(t) ||
          /^(?:Câu|Bài)\s*\d+\b/i.test(t) ||
          /^(?:PHẦN|Phần)\s*(?:I{1,3}|IV|V|\d+)\b/i.test(t)
        );
      });

    const buildRowEntriesFromItems = (
      items: { x: number; y: number; w: number; s: string }[]
    ): PdfRowEntry[] => {
      const rowBuckets: { y: number; items: { x: number; w: number; s: string }[] }[] = [];
      for (const it of items) {
        let bucket = rowBuckets.find((b) => Math.abs(b.y - it.y) <= 3.5);
        if (!bucket) {
          bucket = { y: it.y, items: [] };
          rowBuckets.push(bucket);
        }
        bucket.items.push({ x: it.x, w: it.w, s: it.s });
      }
      rowBuckets.sort((a, b) => b.y - a.y);

      const entries: PdfRowEntry[] = [];
      for (const bucket of rowBuckets) {
        bucket.items.sort((a, b) => a.x - b.x);
        const segments: PdfRowSegment[] = [];
        let curSeg: PdfRowSegment | null = null;
        let line = '';
        let prevEnd = -1;
        for (const item of bucket.items) {
          const itemEnd = item.x + (item.w || item.s.length * 4);
          if (prevEnd !== -1) {
            const gap = item.x - prevEnd;
            // Ngưỡng tách cột 8.5pt (> 2.5x khoảng trắng chữ thường ~3pt) giúp bắt chính xác bảng nhiều cột trong PDF
            if (gap > 8.5) {
              line += '\t' + item.s;
              if (curSeg) segments.push(curSeg);
              curSeg = { text: item.s, xStart: item.x, xEnd: itemEnd };
            } else {
              const sep = gap > 1.8 && !line.endsWith(' ') && !item.s.startsWith(' ') ? ' ' : '';
              line += sep + item.s;
              if (curSeg) {
                curSeg.text += sep + item.s;
                curSeg.xEnd = Math.max(curSeg.xEnd, itemEnd);
              } else {
                curSeg = { text: item.s, xStart: item.x, xEnd: itemEnd };
              }
            }
          } else {
            line += item.s;
            curSeg = { text: item.s, xStart: item.x, xEnd: itemEnd };
          }
          prevEnd = itemEnd;
        }
        if (curSeg) segments.push(curSeg);
        const cleaned = line.replace(/[ \t]+$/g, '');
        if (cleaned.trim().length > 0) {
          entries.push({
            y: bucket.y,
            text: cleaned,
            segments: segments.map((s) => ({ ...s, text: s.text.trim() })),
            rawItems: bucket.items.map((it) => ({
              x: it.x,
              end: it.x + (it.w || it.s.length * 4),
              s: it.s.trim(),
            })),
          });
        }
      }
      return entries;
    };

    const convertTablesInEntries = (pageRowEntries: PdfRowEntry[]) => {
      let ri = 0;
      while (ri < pageRowEntries.length) {
        const curEntry = pageRowEntries[ri];
        const curText = curEntry.text;
        const cols0 = curText.split('\t').map((c) => c.trim());
        if (
          !isBreakLine(curText.trim()) &&
          cols0.length >= 2 &&
          cols0.filter(Boolean).length >= 2 &&
          !hasInlineOptionOrQuestionColumns(cols0)
        ) {
          let rj = ri + 1;
          const bandRows: { y: number; cols: string[] }[] = [{ y: curEntry.y, cols: [...cols0] }];
          const colCenters: number[] = (curEntry.segments || []).map((s) => (s.xStart + s.xEnd) / 2);
          const colXStarts: number[] = (curEntry.segments || []).map((s) => s.xStart);

          while (rj < pageRowEntries.length) {
            const nxtEntry = pageRowEntries[rj];
            const nxt = nxtEntry.text;
            const nxtTrim = nxt.trim();
            if (isBreakLine(nxtTrim)) break;
            const nxtCols = nxt.split('\t').map((c) => c.trim());
            if (hasInlineOptionOrQuestionColumns(nxtCols)) break;
            const prevRowY = bandRows[bandRows.length - 1].y;
            const yGap = Math.abs(prevRowY - nxtEntry.y);

            if (nxtCols.length >= 2 && Math.abs(nxtCols.length - cols0.length) <= 2) {
              bandRows.push({ y: nxtEntry.y, cols: nxtCols });
              if (nxtEntry.segments && nxtEntry.segments.length >= colCenters.length) {
                nxtEntry.segments.forEach((seg, idx) => {
                  const center = (seg.xStart + seg.xEnd) / 2;
                  if (colCenters[idx] === undefined) colCenters[idx] = center;
                  else colCenters[idx] = (colCenters[idx] + center) / 2;
                  if (colXStarts[idx] === undefined) colXStarts[idx] = seg.xStart;
                  else colXStarts[idx] = Math.min(colXStarts[idx], seg.xStart);
                });
              }
              rj++;
            } else if (
              nxtCols.length === 1 &&
              yGap <= 20 &&
              nxtEntry.segments &&
              nxtEntry.segments.length === 1 &&
              colCenters.length >= 2
            ) {
              const nextAfter = pageRowEntries[rj + 1];
              const nextAfterCols = nextAfter ? nextAfter.text.split('\t').map((c) => c.trim()) : [];
              const followedByTableRow =
                Boolean(nextAfter) &&
                !isBreakLine(nextAfter.text.trim()) &&
                !hasInlineOptionOrQuestionColumns(nextAfterCols) &&
                nextAfterCols.length >= 2 &&
                Math.abs(nextAfterCols.length - cols0.length) <= 2;

              const seg = nxtEntry.segments[0];
              const segCenter = (seg.xStart + seg.xEnd) / 2;
              let nearestCol = 0;
              let bestDist = Infinity;
              for (let c = 0; c < colCenters.length; c++) {
                const dist = Math.abs(colCenters[c] - segCenter);
                if (dist < bestDist) {
                  bestDist = dist;
                  nearestCol = c;
                }
              }

              const segWidth = seg.xEnd - seg.xStart;
              if ((followedByTableRow || (bestDist <= 95 && segWidth <= 240)) && nxtTrim.length <= 120) {
                const lastRow = bandRows[bandRows.length - 1];
                while (lastRow.cols.length <= nearestCol) lastRow.cols.push('');
                lastRow.cols[nearestCol] = lastRow.cols[nearestCol]
                  ? `${lastRow.cols[nearestCol]} <br> ${nxtTrim}`
                  : nxtTrim;
                lastRow.y = nxtEntry.y;
                rj++;
              } else {
                break;
              }
            } else {
              break;
            }
          }

          if (bandRows.length >= 2) {
            let spliceStart = ri;
            if (ri > 0 && colXStarts.length >= 2) {
              const prevEntry = pageRowEntries[ri - 1];
              const prevTrim = prevEntry.text.trim();
              const prevYGap = prevEntry.y - bandRows[0].y;
              if (
                prevEntry.rawItems &&
                prevEntry.rawItems.length >= 2 &&
                prevYGap > 0 &&
                prevYGap <= 28 &&
                !isBreakLine(prevTrim) &&
                !prevTrim.startsWith('|') &&
                !/^Bảng\s*(\d+|[IVX]+)?\s*[:.\-]/i.test(prevTrim) &&
                !/[:.?!]\s*$/.test(prevTrim)
              ) {
                const matchedCols = new Array<string>(colXStarts.length).fill('');
                let alignedAnchorHits = 0;
                for (const item of prevEntry.rawItems) {
                  let targetCol = 0;
                  let bestXDiff = Infinity;
                  for (let c = 0; c < colXStarts.length; c++) {
                    const diff = Math.abs(item.x - colXStarts[c]);
                    if (diff < bestXDiff) {
                      bestXDiff = diff;
                      targetCol = c;
                    }
                  }
                  if (bestXDiff <= 12) alignedAnchorHits += 1;
                  if (bestXDiff > 12) {
                    for (let c = colXStarts.length - 1; c >= 0; c--) {
                      if (item.x >= colXStarts[c] - 8) {
                        targetCol = c;
                        break;
                      }
                    }
                  }
                  matchedCols[targetCol] = matchedCols[targetCol]
                    ? `${matchedCols[targetCol]} ${item.s}`
                    : item.s;
                }
                const filledCount = matchedCols.filter((c) => c.trim().length > 0).length;
                if (
                  alignedAnchorHits >= 2 &&
                  filledCount >= 2 &&
                  !hasInlineOptionOrQuestionColumns(matchedCols)
                ) {
                  bandRows.unshift({ y: prevEntry.y, cols: matchedCols });
                  spliceStart = ri - 1;
                }
              }
            }

            const maxCols = Math.max(...bandRows.map((r) => r.cols.length));
            const padMd = (r: string[]) => {
              const copy = [...r];
              while (copy.length < maxCols) copy.push('');
              return `| ${copy.map((c) => c.replace(/\|/g, '&#124;')).join(' | ')} |`;
            };
            const firstY = bandRows[0].y;
            const mdEntries: PdfRowEntry[] = [
              { y: firstY, text: padMd(bandRows[0].cols) },
              { y: firstY - 0.1, text: `| ${Array(maxCols).fill('---').join(' | ')} |` },
              ...bandRows.slice(1).map((r) => ({
                y: r.y,
                text: padMd(r.cols),
              })),
            ];
            pageRowEntries.splice(spliceStart, rj - spliceStart, ...mdEntries);
            ri = spliceStart + mdEntries.length;
            continue;
          }
        }
        ri++;
      }
    };

    for (let p = 1; p <= totalPages; p++) {
      try {
        const page = await pdf.getPage(p);
        const viewport = page.getViewport({ scale: 1 });
        const pageWidth = viewport?.width || 595;
        const pageHeight = viewport?.height || 842;
        const content = await page.getTextContent();
        const rawItems = (content.items || []) as Array<{
          str?: string;
          transform?: number[];
          width?: number;
        }>;

        const cleanItems: { x: number; y: number; w: number; s: string }[] = [];
        for (const it of rawItems) {
          const str = typeof it.str === 'string' ? it.str : '';
          if (!str.trim()) continue;
          const x = Array.isArray(it.transform) ? Number(it.transform[4] || 0) : 0;
          const y = Array.isArray(it.transform) ? Number(it.transform[5] || 0) : 0;
          const w = Number(it.width || 0);
          cleanItems.push({ x, y, w, s: str });
        }

        // Phát hiện trang PDF trình bày 2 cột (có rãnh dọc rõ ràng ngăn đôi trang và cả 2 cột đều có câu hỏi/đoạn văn)
        const midX = pageWidth / 2;
        const bodyItems = cleanItems.filter((it) => it.y < pageHeight * 0.92 && it.y > pageHeight * 0.06);
        const leftOnly = bodyItems.filter((it) => it.x + (it.w || it.s.length * 4) <= midX + 6);
        const rightOnly = bodyItems.filter((it) => it.x >= midX - 6);
        const spanningMid = bodyItems.filter(
          (it) => it.x < midX - 18 && it.x + (it.w || it.s.length * 4) > midX + 18
        );
        const leftHasQuestionMarker = leftOnly.some((it) => /(?:Câu|Bài)\s*\d+/i.test(it.s));
        const rightHasQuestionMarker = rightOnly.some((it) => /(?:Câu|Bài)\s*\d+/i.test(it.s));
        const isTwoColumnPage =
          leftOnly.length >= 8 &&
          rightOnly.length >= 8 &&
          spanningMid.length <= Math.max(2, Math.floor(bodyItems.length * 0.08)) &&
          (leftHasQuestionMarker || rightHasQuestionMarker) &&
          // Tránh nhầm bảng số liệu 2 cột với đề thi 2 cột
          rightHasQuestionMarker;

        let pageRowEntries: PdfRowEntry[] = [];
        if (isTwoColumnPage) {
          const topFull = cleanItems.filter((it) => it.y >= pageHeight * 0.92);
          const bottomFull = cleanItems.filter((it) => it.y <= pageHeight * 0.06);
          const topEntries = buildRowEntriesFromItems(topFull);
          const leftEntries = buildRowEntriesFromItems(leftOnly);
          const rightEntries = buildRowEntriesFromItems(rightOnly);
          const bottomEntries = buildRowEntriesFromItems(bottomFull);
          convertTablesInEntries(leftEntries);
          convertTablesInEntries(rightEntries);
          pageRowEntries = [...topEntries, ...leftEntries, ...rightEntries, ...bottomEntries];
        } else {
          pageRowEntries = buildRowEntriesFromItems(cleanItems);
          convertTablesInEntries(pageRowEntries);
        }

        // Trích xuất ảnh nhúng (bao gồm biểu đồ chụp/vector rasterized) trên trang và đặt đúng vị trí tọa độ Y
        try {
          const extractedImgs = await extractPdfImages(pdf, p);
          const validImgKeys: string[] = [];
          for (const img of extractedImgs) {
            if (img && img.data && img.width >= 40 && img.height >= 40) {
              let pngUrl = encodeRawPixelsToPngDataUrl(img.data, img.width, img.height, 1100);
              if (pngUrl && pngUrl.length > 1500000) {
                pngUrl = encodeRawPixelsToPngDataUrl(img.data, img.width, img.height, 760);
              }
              if (pngUrl && pngUrl.length <= 2200000) {
                imgCounter += 1;
                const key = `img_${imgCounter}`;
                images[key] = pngUrl;
                validImgKeys.push(key);
              }
            }
          }

          if (validImgKeys.length > 0) {
            const imageYPositions: number[] = [];
            try {
              const { OPS } = await getResolvedPDFJS();
              const ops = await page.getOperatorList();
              const stack: number[][] = [];
              let ctm = [1, 0, 0, 1, 0, 0];
              const mulCtm = (m1: number[], m2: number[]) => [
                m1[0] * m2[0] + m1[2] * m2[1],
                m1[1] * m2[0] + m1[3] * m2[1],
                m1[0] * m2[2] + m1[2] * m2[3],
                m1[1] * m2[2] + m1[3] * m2[3],
                m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
                m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
              ];
              for (let oi = 0; oi < ops.fnArray.length; oi++) {
                const fn = ops.fnArray[oi];
                const args = ops.argsArray[oi];
                if (fn === OPS.save) {
                  stack.push([...ctm]);
                } else if (fn === OPS.restore) {
                  ctm = stack.pop() || [1, 0, 0, 1, 0, 0];
                } else if (fn === OPS.transform && Array.isArray(args) && args.length >= 6) {
                  ctm = mulCtm(ctm, args);
                } else if (
                  fn === OPS.paintImageXObject ||
                  fn === OPS.paintInlineImageXObject
                ) {
                  const yTop = ctm[5] + Math.max(0, ctm[3]);
                  imageYPositions.push(yTop);
                }
              }
            } catch {}

            if (!isTwoColumnPage && imageYPositions.length >= validImgKeys.length) {
              validImgKeys.forEach((key, idx) => {
                pageRowEntries.push({ y: imageYPositions[idx] - 1, text: `[[IMG:${key}]]` });
              });
              pageRowEntries.sort((a, b) => b.y - a.y);
            } else {
              const pageLinesTmp = pageRowEntries.map((e) => e.text);
              let inserted = false;
              for (let li = 0; li < pageLinesTmp.length; li++) {
                if (/(?:hình|biểu\s*đồ|sơ\s*đồ)\s*(sau|bên|vẽ|dưới|trên|minh\s*họa|\d)/i.test(pageLinesTmp[li])) {
                  pageRowEntries.splice(
                    li + 1,
                    0,
                    ...validImgKeys.map((k) => ({ y: pageRowEntries[li].y - 1, text: `[[IMG:${k}]]` }))
                  );
                  inserted = true;
                  break;
                }
              }
              if (!inserted) {
                validImgKeys.forEach((k) => pageRowEntries.push({ y: -1, text: `[[IMG:${k}]]` }));
              }
            }
          }
        } catch {}

        if (pageRowEntries.length > 0) {
          extractedPageCount += 1;
          allLines.push(...pageRowEntries.map((e) => e.text));
        } else {
          warnings.push(`Trang ${p}/${totalPages} không có lớp văn bản (có thể là trang ảnh scan hoặc trang trống).`);
        }
      } catch (pageErr) {
        console.warn(`[PdfParser] Error reading page ${p}/${totalPages}:`, pageErr);
        warnings.push(`Không thể đọc trọn vẹn trang ${p}/${totalPages} của tệp PDF — vui lòng kiểm tra lại nội dung trang này.`);
      }
    }

    return {
      text: allLines.join('\n').replace(/\n{3,}/g, '\n\n').trim(),
      images,
      pageCount: totalPages,
      extractedPageCount,
      warnings,
    };
  } catch (err) {
    console.warn('[PdfParser] Could not extract text/images from PDF:', err);
    return {
      text: '',
      images: {},
      pageCount: 0,
      extractedPageCount: 0,
      warnings: ['Không thể giải mã tệp PDF trên máy chủ. Tệp gốc vẫn được lưu nguyên bản.'],
    };
  }
}

app.post('/api/parse-docx', (req: Request, res: Response) => {
  const { dataUrl } = req.body || {};
  if (!dataUrl || typeof dataUrl !== 'string') {
    return res.status(400).json({ success: false, message: 'Thiếu dữ liệu tệp .docx' });
  }
  const { text, images, tables, charts } = extractDocxStructuredFromDataUrlServer(dataUrl);
  res.json({ success: true, text, images, tables, charts });
});

app.post('/api/parse-pdf', async (req: Request, res: Response) => {
  const { dataUrl } = req.body || {};
  if (!dataUrl || typeof dataUrl !== 'string') {
    return res.status(400).json({ success: false, message: 'Thiếu dữ liệu tệp .pdf' });
  }
  const { text, images, pageCount, extractedPageCount, warnings } =
    await extractPdfStructuredFromDataUrlServer(dataUrl);
  res.json({ success: true, text, images, pageCount, extractedPageCount, warnings });
});

function persistUploadedExams() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const lightList = sharedUploadedExams.map((e) => {
      if (e && e.attachedFileDataUrl) {
        if (e.id) savePersistentBlob(String(e.id), e.attachedFileDataUrl);
        const { attachedFileDataUrl: _omit, ...rest } = e;
        return { ...rest, hasAttachedOriginalFile: true };
      }
      return e;
    });
    const serialized = JSON.stringify(lightList, null, 2);
    try {
      fs.writeFileSync(TMP_UPLOADED_EXAMS_FILE, serialized, 'utf-8');
    } catch {}
    fs.writeFileSync(UPLOADED_EXAMS_FILE, serialized, 'utf-8');
  } catch (e) {
    console.warn('[UploadedExams] Could not save uploaded_exams.json:', e);
  }
}

// Tài liệu hệ thống do Admin đăng (hoặc Đề Chính Thức) được hiển thị chung;
// Tài liệu do người dùng khác đăng là riêng tư: CHỈ đúng người đăng đó và Admin mới được xem, quản lý, sử dụng.
function isPublicAdminUploadedExam(exam: any): boolean {
  if (!exam) return false;
  if (exam.category === 'official_past_year') return true;
  if (exam.isUserUploaded === false) return true;
  const owner = normalizeOwnerUsername(exam.uploadedBy);
  return owner === 'admin';
}

function canCallerAccessUploadedExam(
  exam: any,
  caller: ReturnType<typeof getVerifiedAuthIdentity>
): boolean {
  if (!exam) return false;
  if (isPublicAdminUploadedExam(exam)) return true;
  if (!caller) return false;
  if (caller.isAdmin) return true;
  const owner = normalizeOwnerUsername(exam.uploadedBy);
  return Boolean(owner && owner !== 'guest' && owner === caller.normalizedUsername);
}

function toLightweightUploadedExam(e: any) {
  if (!e) return e;
  const { attachedFileDataUrl, ...rest } = e;
  return {
    ...rest,
    hasAttachedOriginalFile: Boolean(
      attachedFileDataUrl || e.hasAttachedOriginalFile || hasPersistentBlob(String(e.id || ''))
    ),
  };
}

function getLightweightUploadedExamsForCaller(
  caller: ReturnType<typeof getVerifiedAuthIdentity>
) {
  return sharedUploadedExams
    .filter((e) => canCallerAccessUploadedExam(e, caller))
    .map(toLightweightUploadedExam);
}

async function upsertUploadedExamToCloudSql(
  exam: any,
  blobDataUrl?: string | null
): Promise<void> {
  if (!exam?.id) return;
  const examId = String(exam.id).slice(0, 200);
  const lightExamJson = JSON.stringify(toLightweightUploadedExam(exam));
  const nowMs = Date.now();
  try {
    if (blobDataUrl && typeof blobDataUrl === 'string') {
      await pgQueryParams(
        `INSERT INTO agritech_uploaded_exams_store (exam_id, exam_json, blob_data_url, is_deleted, updated_at)
         VALUES ($1, $2, $3, FALSE, $4)
         ON CONFLICT (exam_id) DO UPDATE SET
           exam_json = EXCLUDED.exam_json,
           blob_data_url = EXCLUDED.blob_data_url,
           is_deleted = FALSE,
           updated_at = EXCLUDED.updated_at`,
        [examId, lightExamJson, blobDataUrl, nowMs],
        false,
        12000
      );
    } else {
      await pgQueryParams(
        `INSERT INTO agritech_uploaded_exams_store (exam_id, exam_json, blob_data_url, is_deleted, updated_at)
         VALUES ($1, $2, NULL, FALSE, $3)
         ON CONFLICT (exam_id) DO UPDATE SET
           exam_json = EXCLUDED.exam_json,
           is_deleted = FALSE,
           updated_at = EXCLUDED.updated_at`,
        [examId, lightExamJson, nowMs],
        false,
        10000
      );
    }
  } catch {}
}

async function deleteUploadedExamFromCloudSql(examId: string): Promise<void> {
  const cleanId = String(examId || '').trim().slice(0, 200);
  if (!cleanId) return;
  const nowMs = Date.now();
  try {
    await pgQueryParams(
      `INSERT INTO agritech_uploaded_exams_store (exam_id, exam_json, blob_data_url, is_deleted, updated_at)
       VALUES ($1, '{}', NULL, TRUE, $2)
       ON CONFLICT (exam_id) DO UPDATE SET
         exam_json = '{}',
         blob_data_url = NULL,
         is_deleted = TRUE,
         updated_at = EXCLUDED.updated_at`,
      [cleanId, nowMs],
      false,
      8000
    );
  } catch {}
}

async function loadUploadedExamBlobFromCloudSql(examId: string): Promise<string | null> {
  const cleanId = String(examId || '').trim().slice(0, 200);
  if (!cleanId) return null;
  try {
    const rows = await pgQueryParams(
      `SELECT blob_data_url FROM agritech_uploaded_exams_store WHERE exam_id = $1 AND is_deleted = FALSE LIMIT 1`,
      [cleanId],
      false,
      10000
    );
    const val = rows?.[0]?.[0];
    if (val && val.startsWith('data:')) {
      savePersistentBlob(cleanId, val);
      return val;
    }
  } catch {}
  return null;
}

let lastUploadedExamsPullMs = 0;
async function pullAndMergeUploadedExamsFromCloudSql(forcePull = false): Promise<void> {
  const now = Date.now();
  if (!forcePull && now - lastUploadedExamsPullMs < 1000) return;
  lastUploadedExamsPullMs = now;

  try {
    const rows = await pgQuery(
      `SELECT exam_id, exam_json, is_deleted, updated_at FROM agritech_uploaded_exams_store ORDER BY updated_at ASC;`
    );
    if (!rows.length) return;

    const deletedSet = loadDeletedUploadedExamIdsServer();
    let deletedChanged = false;
    let listChanged = false;
    const examMap = new Map<string, any>();
    sharedUploadedExams.forEach((e) => {
      if (e?.id) examMap.set(String(e.id), e);
    });

    for (const [examId, examJson, isDel] of rows) {
      const cleanId = String(examId || '').trim();
      if (!cleanId) continue;
      if (isDel === 't' || isDel === 'true' || isDel === '1') {
        if (!deletedSet.has(cleanId)) {
          deletedSet.add(cleanId);
          deletedChanged = true;
        }
        if (examMap.has(cleanId)) {
          examMap.delete(cleanId);
          deletePersistentBlob(cleanId);
          listChanged = true;
        }
      } else {
        if (deletedSet.has(cleanId)) {
          deletedSet.delete(cleanId);
          deletedChanged = true;
        }
        try {
          const parsed = JSON.parse(examJson);
          if (parsed && parsed.id && parsed.title) {
            const existing = examMap.get(cleanId);
            if (!existing || JSON.stringify(existing) !== JSON.stringify(parsed)) {
              examMap.set(cleanId, parsed);
              listChanged = true;
            }
          }
        } catch {}
      }
    }

    if (deletedChanged) {
      saveDeletedUploadedExamIdsServer(deletedSet);
    }

    if (listChanged || deletedChanged) {
      const nextList = Array.from(examMap.values())
        .filter((e) => e?.id && !deletedSet.has(String(e.id)))
        .sort((a, b) => {
          const ta = Date.parse(a?.uploadedAt || '') || 0;
          const tb = Date.parse(b?.uploadedAt || '') || 0;
          return tb - ta;
        });
      sharedUploadedExams = nextList;
      persistUploadedExams();
    }
  } catch {}
}

async function replicateUploadedExamUpsertToPeers(
  examPayload: any,
  req?: Request
): Promise<void> {
  if (isPeerReplicatedRequest(req)) return;
  const authHeader =
    typeof req?.headers?.authorization === 'string' ? req.headers.authorization.trim() : '';
  if (!authHeader) return;
  const peers = getPeerOrigins(req);
  await Promise.allSettled(
    peers.map(async (peer) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);
      try {
        await fetch(`${peer}/api/uploaded-exams?peerReplicated=1`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
            'X-Peer-Replicated': '1',
          },
          body: JSON.stringify({ exam: examPayload, peerReplicated: true }),
          signal: controller.signal,
        });
      } catch {} finally {
        clearTimeout(timer);
      }
    })
  );
}

async function replicateUploadedExamDeleteToPeers(
  examId: string,
  req?: Request
): Promise<void> {
  if (isPeerReplicatedRequest(req)) return;
  const authHeader =
    typeof req?.headers?.authorization === 'string' ? req.headers.authorization.trim() : '';
  if (!authHeader) return;
  const peers = getPeerOrigins(req);
  await Promise.allSettled(
    peers.map(async (peer) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      try {
        await fetch(
          `${peer}/api/uploaded-exams/${encodeURIComponent(examId)}?peerReplicated=1`,
          {
            method: 'DELETE',
            headers: {
              Authorization: authHeader,
              'X-Peer-Replicated': '1',
            },
            signal: controller.signal,
          }
        );
      } catch {} finally {
        clearTimeout(timer);
      }
    })
  );
}

try {
  const initialDeletedIds = loadDeletedUploadedExamIdsServer();
  const initialMap = new Map<string, any>();
  // Ưu tiên tệp /tmp mới nhất trước, rồi đến tệp dự án data/uploaded_exams.json
  for (const file of [TMP_UPLOADED_EXAMS_FILE, UPLOADED_EXAMS_FILE]) {
    if (fs.existsSync(file)) {
      const raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (Array.isArray(raw)) {
        raw.forEach((item) => {
          if (!item?.id || initialDeletedIds.has(String(item.id))) return;
          if (initialMap.has(String(item.id))) return;
          if (item?.attachedFileDataUrl) {
            savePersistentBlob(String(item.id), item.attachedFileDataUrl);
          }
          const { attachedFileDataUrl: _omit, ...rest } = item || {};
          initialMap.set(String(item.id), {
            ...rest,
            hasAttachedOriginalFile: Boolean(
              item?.attachedFileDataUrl ||
                item?.hasAttachedOriginalFile ||
                hasPersistentBlob(String(item?.id || ''))
            ),
          });
        });
      }
    }
  }
  sharedUploadedExams = Array.from(initialMap.values());
  // Chỉ đăng ký tự động các đề công khai do Admin xuất bản vào sharedAssignmentsMap;
  // Tài liệu riêng tư của người dùng chỉ người đăng & Admin mới được dùng (không tự động mở công khai qua /api/assignments)
  sharedUploadedExams.forEach((exam) => {
    if (exam && isPublicAdminUploadedExam(exam) && (exam.id || exam.code)) {
      const rec = {
        exam,
        config: {
          examId: exam.id,
          examCode: exam.code,
          durationMinutes: exam.durationMinutes || 50,
          shuffleQuestions: false,
          showSolutionsAfterSubmit: true,
        },
        updatedAt: exam.uploadedAt || new Date().toISOString(),
        timestampMs: Date.now(),
      };
      if (exam.id) {
        sharedAssignmentsMap.set(String(exam.id), rec);
        sharedAssignmentsMap.set(String(exam.id).toLowerCase(), rec);
      }
      if (exam.code) {
        sharedAssignmentsMap.set(String(exam.code), rec);
        sharedAssignmentsMap.set(String(exam.code).toLowerCase(), rec);
      }
    }
  });
} catch (e) {
  console.warn('[UploadedExams] Could not load uploaded_exams.json:', e);
}

app.get('/api/uploaded-exams', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  if (!isPeerReplicatedRequest(req)) {
    await pullAndMergeUploadedExamsFromCloudSql(false);
  }
  const caller = getVerifiedAuthIdentity(req);
  res.json({ success: true, data: getLightweightUploadedExamsForCaller(caller) });
});

app.get('/api/uploaded-exams/:id/file', async (req: Request, res: Response) => {
  const targetId = String(req.params.id || '').trim();
  if (!targetId) {
    return res.status(400).json({ success: false, message: 'Thiếu ID tài liệu.' });
  }
  if (!isPeerReplicatedRequest(req)) {
    await pullAndMergeUploadedExamsFromCloudSql(false);
  }
  let exam = sharedUploadedExams.find(
    (e) => String(e.id) === targetId || String(e.code) === targetId
  );
  if (!exam && !isPeerReplicatedRequest(req)) {
    await pullAndMergeUploadedExamsFromCloudSql(true);
    exam = sharedUploadedExams.find(
      (e) => String(e.id) === targetId || String(e.code) === targetId
    );
  }
  if (!exam) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tài liệu trên hệ thống.' });
  }

  const caller = getVerifiedAuthIdentity(req);
  if (!isPublicAdminUploadedExam(exam)) {
    if (!caller) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập đúng tài khoản người đăng tài liệu hoặc Admin để tải tệp này!',
      });
    }
    if (!canCallerAccessUploadedExam(exam, caller)) {
      return res.status(403).json({
        success: false,
        message:
          'Bạn không có quyền truy cập hoặc tải tài liệu này! Tài liệu do người dùng nào đăng thì chỉ người dùng đó và Admin mới được quản lý, sử dụng.',
      });
    }
  }

  let blobDataUrl = exam?.id ? loadPersistentBlob(String(exam.id)) : null;
  if (!blobDataUrl && exam?.id) {
    blobDataUrl = await loadUploadedExamBlobFromCloudSql(String(exam.id));
  }

  if (!blobDataUrl) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tệp gốc đính kèm.' });
  }

  const match = blobDataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (!match) {
    return res.status(500).json({ success: false, message: 'Định dạng tệp đính kèm không hợp lệ.' });
  }

  const mimeType = match[1] || 'application/octet-stream';
  const fileBuffer = Buffer.from(match[2], 'base64');
  const fileName = exam?.attachedFileName || `Tai_Lieu_${exam?.code || targetId}`;
  const encodedFileName = encodeURIComponent(fileName);

  res.setHeader('Content-Type', mimeType);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${fileName.replace(/[^\x20-\x7E]/g, '_')}"; filename*=UTF-8''${encodedFileName}`
  );
  res.setHeader('Content-Length', String(fileBuffer.length));
  res.send(fileBuffer);
});

app.post('/api/uploaded-exams', async (req: Request, res: Response) => {
  const { exam } = req.body || {};
  if (!exam || !exam.title || (!exam.id && !exam.code)) {
    return res.status(400).json({ success: false, message: 'Dữ liệu đề tải lên không hợp lệ.' });
  }

  const caller = getVerifiedAuthIdentity(req);
  if (!caller) {
    return res.status(401).json({
      success: false,
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!',
    });
  }

  // Chỉ người dùng là Giáo viên (hoặc Admin) mới được quyền đăng tài liệu lên hệ thống
  if (!caller.isTeacherOrAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Chỉ người dùng là Giáo viên mới được đăng tài liệu lên hệ thống!',
    });
  }

  if (!isPeerReplicatedRequest(req)) {
    await pullAndMergeUploadedExamsFromCloudSql(false);
  }

  const existingMatch = sharedUploadedExams.find((e) => e.id === exam.id);
  const requestedCategory =
    exam.category === 'official_past_year'
      ? 'official_past_year'
      : exam.category === 'reference_exam'
      ? 'reference_exam'
      : 'provincial_mock';

  // Đề chính thức chỉ Admin được quyền đăng hoặc chỉnh sửa; Đề thi thử & Đề tham khảo Giáo viên được quyền đăng
  if (
    (requestedCategory === 'official_past_year' ||
      existingMatch?.category === 'official_past_year') &&
    !caller.isAdmin
  ) {
    return res.status(403).json({
      success: false,
      message:
        'Chỉ Quản trị viên (Admin) mới có quyền đăng hoặc chỉnh sửa Đề Chính Thức! Giáo viên được quyền đăng đề tại mục Đề Tham Khảo và Đề Thi Thử.',
    });
  }

  // Nếu cập nhật tài liệu đã tồn tại, chỉ Admin hoặc chính người dùng đã đăng tài liệu đó mới được ghi đè
  if (existingMatch && !caller.isAdmin) {
    const existingOwner = normalizeOwnerUsername(existingMatch.uploadedBy);
    const isExistingOwner = Boolean(
      existingOwner && existingOwner !== 'guest' && existingOwner === caller.normalizedUsername
    );
    if (!isExistingOwner) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ Quản trị viên (Admin) và người dùng đã đăng tài liệu mới có quyền chỉnh sửa tài liệu này!',
      });
    }
  }

  const examId = String(
    exam.id || `user-exam-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  );

  const deletedDocSet = loadDeletedUploadedExamIdsServer();
  if (deletedDocSet.has(examId)) {
    deletedDocSet.delete(examId);
    saveDeletedUploadedExamIdsServer(deletedDocSet);
  }

  const attachedBlob =
    exam.attachedFileDataUrl && typeof exam.attachedFileDataUrl === 'string'
      ? exam.attachedFileDataUrl
      : null;
  if (attachedBlob) {
    savePersistentBlob(examId, attachedBlob);
  }

  // Giữ nguyên 100% nội dung người dùng gửi lên (partI, partII, rawDocumentText, bảng biểu, ảnh), tuyệt đối không tự ý ghi đè hay chèn câu hỏi khác
  const { attachedFileDataUrl: _omitBlob, ...examFields } = exam;
  const authoritativeUploader = existingMatch?.uploadedBy
    ? String(existingMatch.uploadedBy)
    : caller.username;
  const normalizedExam = {
    ...examFields,
    id: examId,
    code: String(exam.code || `UP${Date.now().toString().slice(-3)}`),
    category: requestedCategory,
    isUserUploaded: true,
    uploadedBy: authoritativeUploader,
    uploadedAt:
      existingMatch?.uploadedAt ||
      (isPeerReplicatedRequest(req) && exam.uploadedAt
        ? String(exam.uploadedAt)
        : new Date().toISOString()),
    attachedFileName: exam.attachedFileName || existingMatch?.attachedFileName,
    hasAttachedOriginalFile: Boolean(
      attachedBlob ||
        exam.hasAttachedOriginalFile ||
        existingMatch?.hasAttachedOriginalFile ||
        hasPersistentBlob(examId)
    ),
    partI: Array.isArray(exam.partI) ? exam.partI : [],
    partII: Array.isArray(exam.partII) ? exam.partII : [],
    ...(Array.isArray(exam.partIII) && exam.partIII.length > 0 ? { partIII: exam.partIII } : {}),
  };

  sharedUploadedExams = [
    normalizedExam,
    ...sharedUploadedExams.filter((e) => e.id !== normalizedExam.id),
  ];

  // Chỉ tự động đưa đề công khai do Admin xuất bản vào sharedAssignmentsMap;
  // Tài liệu riêng tư của người dùng chỉ được đưa vào giao bài khi chính người đăng/Admin chủ động giao đề QR
  if (isPublicAdminUploadedExam(normalizedExam)) {
    const record = {
      exam: normalizedExam,
      config: {
        examId: normalizedExam.id,
        examCode: normalizedExam.code,
        durationMinutes: normalizedExam.durationMinutes || 50,
        shuffleQuestions: false,
        showSolutionsAfterSubmit: true,
      },
      updatedAt: new Date().toISOString(),
      timestampMs: Date.now(),
    };
    sharedAssignmentsMap.set(String(normalizedExam.id), record);
    sharedAssignmentsMap.set(String(normalizedExam.id).toLowerCase(), record);
    sharedAssignmentsMap.set(String(normalizedExam.code), record);
    sharedAssignmentsMap.set(String(normalizedExam.code).toLowerCase(), record);
    persistAssignments();
  }

  persistUploadedExams();
  if (!isPeerReplicatedRequest(req)) {
    await upsertUploadedExamToCloudSql(normalizedExam, attachedBlob);
    replicateUploadedExamUpsertToPeers(
      attachedBlob ? { ...normalizedExam, attachedFileDataUrl: attachedBlob } : normalizedExam,
      req
    ).catch(() => {});
  }
  const callerVisibleList = getLightweightUploadedExamsForCaller(caller);
  // Chỉ gửi tín hiệu cập nhật nhẹ qua SSE (không phát tán dữ liệu tài liệu riêng tư ra các phiên khác)
  broadcastSSE('uploaded_exams_updated', { changedAt: Date.now() });
  res.json({ success: true, data: callerVisibleList, exam: normalizedExam });
});

app.delete('/api/uploaded-exams/:id', async (req: Request, res: Response) => {
  const targetId = String(req.params.id || '').trim();
  if (!targetId) {
    return res.status(400).json({ success: false, message: 'Thiếu ID đề cần xóa.' });
  }

  const caller = getVerifiedAuthIdentity(req);
  if (!caller) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập tài khoản để thực hiện xóa tài liệu!',
    });
  }

  if (!isPeerReplicatedRequest(req)) {
    await pullAndMergeUploadedExamsFromCloudSql(false);
  }

  const hasExactId = sharedUploadedExams.some((e) => String(e.id) === targetId);
  const targetExam = sharedUploadedExams.find((e) =>
    hasExactId ? String(e.id) === targetId : String(e.code) === targetId
  );

  if (!targetExam) {
    // Nếu là yêu cầu đồng bộ xóa từ máy chủ đối ứng (peer) hoặc Admin xóa lại ID đã không còn ở local, vẫn ghi tombstone ngay
    if (caller.isAdmin) {
      const deletedSet = loadDeletedUploadedExamIdsServer();
      deletedSet.add(targetId);
      saveDeletedUploadedExamIdsServer(deletedSet);
      await deleteUploadedExamFromCloudSql(targetId);
      if (isPeerReplicatedRequest(req)) {
        return res.json({ success: true, data: getLightweightUploadedExamsForCaller(caller) });
      }
    }
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy tài liệu cần xóa trên hệ thống.',
    });
  }

  if (targetExam.category === 'official_past_year' && !caller.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Chỉ Quản trị viên (Admin) mới có quyền xóa Đề Chính Thức!',
    });
  }

  const ownerNormalized = normalizeOwnerUsername(targetExam.uploadedBy);
  const isOwner = Boolean(
    ownerNormalized && ownerNormalized !== 'guest' && ownerNormalized === caller.normalizedUsername
  );

  // Quy định nghiêm ngặt: người dùng nào đăng tài liệu thì chỉ Admin và đúng người dùng đó được xóa
  if (!caller.isAdmin && !isOwner) {
    return res.status(403).json({
      success: false,
      message:
        'Bạn không có quyền xóa tài liệu này! Chỉ Quản trị viên (Admin) và người dùng đã đăng tài liệu mới được xóa.',
    });
  }

  const canonicalExamId = String(targetExam.id || targetId);
  const deletedSet = loadDeletedUploadedExamIdsServer();
  deletedSet.add(canonicalExamId);
  if (targetId && targetId !== canonicalExamId) {
    deletedSet.add(targetId);
  }
  saveDeletedUploadedExamIdsServer(deletedSet);

  const beforeLen = sharedUploadedExams.length;
  sharedUploadedExams = sharedUploadedExams.filter((e) =>
    hasExactId ? String(e.id) !== targetId : String(e.code) !== targetId
  );
  const removedAssignmentKeys: string[] = [];
  if (canonicalExamId) {
    deletePersistentBlob(canonicalExamId);
    // Gỡ mọi bản sao giao bài liên quan đến tài liệu vừa xóa
    const idKey = canonicalExamId;
    const idKeyLower = idKey.toLowerCase();
    for (const [k, rec] of Array.from(sharedAssignmentsMap.entries())) {
      const recExamId = String(rec?.exam?.id || '');
      if (recExamId === idKey || k === idKey || k === idKeyLower) {
        sharedAssignmentsMap.delete(k);
        removedAssignmentKeys.push(k);
      }
    }
    persistAssignments();
  }
  if (sharedUploadedExams.length !== beforeLen) {
    persistUploadedExams();
  }

  // Lưu trạng thái xóa ngay vào Cloud SQL dùng chung & đồng bộ sang máy chủ xuất bản (không cần bấm Xuất bản)
  await Promise.allSettled([
    deleteUploadedExamFromCloudSql(canonicalExamId),
    deleteAssignmentKeysFromCloudSql(removedAssignmentKeys),
    replicateUploadedExamDeleteToPeers(canonicalExamId, req),
  ]);

  broadcastSSE('uploaded_exams_updated', { changedAt: Date.now() });
  res.json({ success: true, data: getLightweightUploadedExamsForCaller(caller) });
});


// 1. Health check (Crucial for Cloud Run and AI Studio deployment verification)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: PORT,
    activeClients: sseClients.size,
    totalSubmissions: inMemorySubmissions.length,
    versions: syncVersions,
  });
});

// 1b. Lightweight real-time sync version endpoint for instant cross-platform / mobile resume sync
app.get('/api/sync/version', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const forceCheck = String(req.query.force || '') === '1';
  await checkCloudSqlWatermarksAndBroadcast(forceCheck);
  res.json({
    success: true,
    versions: syncVersions,
    serverTime: new Date().toISOString(),
  });
});

// 1c. Force immediate full two-way sync across Cloud SQL, local disk files, peers, and all connected clients
app.post('/api/sync/now', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const summary = await runFullTwoWayCloudSync();
  broadcastSSE('sync_all_updated', {
    changedAt: Date.now(),
    versions: syncVersions,
    summary,
  });
  res.json({
    success: true,
    versions: syncVersions,
    summary,
    serverTime: new Date().toISOString(),
  });
});

// 2. Real-time Server-Sent Events stream for all connected platforms & devices
app.get('/api/submissions/stream', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write(`data: ${JSON.stringify({ type: 'connected', total: inMemorySubmissions.length })}\n\n`);
  res.write(`event: sync_versions\ndata: ${JSON.stringify(syncVersions)}\n\n`);

  sseClients.add(res);

  // Send periodic keep-alive ping every 15s so mobile carrier NAT / Cloud Run proxies stay alive
  const keepAlive = setInterval(() => {
    try {
      res.write(': keep-alive\n\n');
    } catch {
      clearInterval(keepAlive);
      sseClients.delete(res);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAlive);
    sseClients.delete(res);
  });
});

// Shared Cloud SQL & Cross-Origin (ais-dev <-> ais-pre) submission sync
const deletedSubmissionIdsSet = new Set<string>();
let lastSubmissionsRemoteSyncMs = 0;

function normalizeTeacherUsernameServer(raw?: any): string {
  return cleanAuthString(String(raw || '')).replace(/^@+/, '').trim();
}

async function upsertSubmissionToCloudSql(sub: any): Promise<void> {
  if (!sub?.id) return;
  const subId = String(sub.id).slice(0, 200);
  const teacherKey = normalizeTeacherUsernameServer(sub.teacherUsername).toLowerCase().slice(0, 120);
  const subJson = JSON.stringify(sub);
  const nowMs = Date.now();
  try {
    await pgQueryParams(
      `INSERT INTO agritech_submissions_store (submission_id, teacher_username, submission_json, is_deleted, updated_at)
       VALUES ($1, $2, $3, FALSE, $4)
       ON CONFLICT (submission_id) DO UPDATE SET
         teacher_username = EXCLUDED.teacher_username,
         submission_json = EXCLUDED.submission_json,
         is_deleted = FALSE,
         updated_at = EXCLUDED.updated_at`,
      [subId, teacherKey, subJson, nowMs],
      false,
      8000
    );
  } catch {}
}

async function deleteSubmissionFromCloudSql(subId: string): Promise<void> {
  const cleanId = String(subId || '').trim().slice(0, 200);
  if (!cleanId) return;
  const nowMs = Date.now();
  try {
    await pgQueryParams(
      `INSERT INTO agritech_submissions_store (submission_id, teacher_username, submission_json, is_deleted, updated_at)
       VALUES ($1, '', '{}', TRUE, $2)
       ON CONFLICT (submission_id) DO UPDATE SET
         is_deleted = TRUE,
         updated_at = EXCLUDED.updated_at`,
      [cleanId, nowMs],
      false,
      6000
    );
  } catch {}
}

async function replicateSubmissionUpsertToPeers(sub: any, req?: Request): Promise<void> {
  if (!sub || isPeerReplicatedRequest(req)) return;
  const peers = getPeerOrigins(req);
  await Promise.allSettled(
    peers.map(async (peer) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);
      try {
        await fetch(`${peer}/api/submissions?peerReplicated=1&__storage_access_granted=1`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Peer-Replicated': '1',
          },
          body: JSON.stringify({ ...sub, peerReplicated: true }),
          signal: controller.signal,
        });
      } catch {
      } finally {
        clearTimeout(timer);
      }
    })
  );
}

async function replicateSubmissionDeleteToPeers(subId: string, req?: Request): Promise<void> {
  if (!subId || isPeerReplicatedRequest(req)) return;
  const peers = getPeerOrigins(req);
  await Promise.allSettled(
    peers.map(async (peer) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      try {
        await fetch(`${peer}/api/submissions/${encodeURIComponent(subId)}?peerReplicated=1`, {
          method: 'DELETE',
          headers: { 'X-Peer-Replicated': '1' },
          signal: controller.signal,
        });
      } catch {
      } finally {
        clearTimeout(timer);
      }
    })
  );
}

async function pullAndMergeSubmissionsFromCloudSqlAndPeers(
  req?: Request,
  force = false
): Promise<void> {
  const now = Date.now();
  if (!force && now - lastSubmissionsRemoteSyncMs < 2200) return;
  lastSubmissionsRemoteSyncMs = now;

  let changed = false;
  const existingMap = new Map<string, any>();
  inMemorySubmissions.forEach((s) => {
    if (s && s.id) existingMap.set(String(s.id), s);
  });
  const newlyDiscovered: any[] = [];

  // 1. Đọc từ Cloud SQL dùng chung (đồng bộ tức thì giữa ais-dev, ais-pre và mọi Cloud Run instance)
  try {
    const rows = await pgQuery(
      `SELECT submission_id, submission_json, is_deleted FROM agritech_submissions_store ORDER BY updated_at ASC;`,
      false
    );
    for (const row of rows) {
      const sid = String(row[0] || '').trim();
      const sJson = row[1];
      const isDel = row[2] === 't' || row[2] === 'true';
      if (!sid) continue;
      if (isDel) {
        deletedSubmissionIdsSet.add(sid);
        if (existingMap.delete(sid)) {
          changed = true;
        }
        continue;
      }
      if (!sJson) continue;
      try {
        const parsed = JSON.parse(sJson);
        if (parsed && parsed.id) {
          const prev = existingMap.get(String(parsed.id));
          if (!prev) {
            existingMap.set(String(parsed.id), parsed);
            newlyDiscovered.push(parsed);
            changed = true;
          } else if (
            (!prev.teacherUsername && parsed.teacherUsername) ||
            (!prev.examPaper && parsed.examPaper)
          ) {
            existingMap.set(String(parsed.id), { ...prev, ...parsed });
            changed = true;
          }
        }
      } catch {}
    }
  } catch {}

  // 2. Dự phòng kéo thêm từ peer origin (ais-dev <-> ais-pre) nếu Cloud SQL tạm gián đoạn
  if (!isPeerReplicatedRequest(req)) {
    const peers = getPeerOrigins(req);
    for (const peer of peers) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      try {
        const peerRes = await fetch(`${peer}/api/submissions?peerReplicated=1`, {
          headers: { 'X-Peer-Replicated': '1' },
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (peerRes.ok) {
          const payload = await peerRes.json();
          if (payload?.success && Array.isArray(payload.data)) {
            for (const item of payload.data) {
              if (!item || !item.id) continue;
              const sid = String(item.id);
              if (deletedSubmissionIdsSet.has(sid)) continue;
              const prev = existingMap.get(sid);
              if (!prev) {
                existingMap.set(sid, item);
                newlyDiscovered.push(item);
                changed = true;
              } else if (
                (!prev.teacherUsername && item.teacherUsername) ||
                (!prev.examPaper && item.examPaper)
              ) {
                existingMap.set(sid, { ...prev, ...item });
                changed = true;
              }
            }
          }
        }
      } catch {
      } finally {
        clearTimeout(timer);
      }
    }
  }

  if (changed) {
    inMemorySubmissions = Array.from(existingMap.values()).sort(
      (a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
    );
    persistSubmissionsToFile();
    newlyDiscovered.forEach((sub) => {
      broadcastSSE('submission_added', sub);
    });
  }
}

// 3. GET all submissions across all students & devices
app.get('/api/submissions', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  if (!isPeerReplicatedRequest(req)) {
    const forceRefresh = String(req.query.force || '') === '1';
    await pullAndMergeSubmissionsFromCloudSqlAndPeers(req, forceRefresh);
  }
  res.json({
    success: true,
    count: inMemorySubmissions.length,
    data: inMemorySubmissions,
  });
});

// 4. POST student score submission
app.post('/api/submissions', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const body = req.body;
  if (!body || !body.studentName) {
    return res.status(400).json({ error: 'Missing student submission data' });
  }

  // Tự động xác định chính xác tài khoản giáo viên/người dùng đã giao bài thi này cho học sinh
  const rawExamId = String(body.examId || '').trim();
  const rawExamCode = String(body.examCode || '').trim();
  let teacherUsername = normalizeTeacherUsernameServer(body.teacherUsername);
  let teacherName = String(body.teacherName || '').trim();

  if (!teacherUsername) {
    let assignedRecord =
      (rawExamId &&
        (sharedAssignmentsMap.get(rawExamId) ||
          sharedAssignmentsMap.get(rawExamId.toLowerCase()))) ||
      (rawExamCode &&
        (sharedAssignmentsMap.get(rawExamCode) ||
          sharedAssignmentsMap.get(rawExamCode.toLowerCase()))) ||
      null;

    if (!assignedRecord && (rawExamId || rawExamCode)) {
      assignedRecord = await lookupAssignmentFromCloudSqlOrPeers(
        rawExamId || rawExamCode,
        '',
        req
      );
    }

    if (assignedRecord?.config?.teacherUsername) {
      teacherUsername = normalizeTeacherUsernameServer(assignedRecord.config.teacherUsername);
      if (!teacherName && assignedRecord.config.teacherName) {
        teacherName = String(assignedRecord.config.teacherName).trim();
      }
    }

    // Nếu là tài liệu/đề người dùng tự tải lên mà chưa có teacherUsername, gắn về đúng chủ sở hữu tài liệu
    if (!teacherUsername && (rawExamId || rawExamCode)) {
      const matchedUploaded = sharedUploadedExams.find(
        (u) =>
          u &&
          ((rawExamId && String(u.id || '').toLowerCase() === rawExamId.toLowerCase()) ||
            (rawExamCode && String(u.code || '').toLowerCase() === rawExamCode.toLowerCase()))
      );
      const ownerUser = normalizeTeacherUsernameServer(matchedUploaded?.uploadedBy);
      if (ownerUser && ownerUser.toLowerCase() !== 'guest') {
        teacherUsername = ownerUser;
        if (!teacherName && matchedUploaded?.uploadedByFullName) {
          teacherName = String(matchedUploaded.uploadedByFullName).trim();
        }
      }
    }

    // Chỉ fallback sang __latest_active__ nếu đúng trùng mã đề/ID đề đang giao
    if (!teacherUsername) {
      const latestActive = sharedAssignmentsMap.get('__latest_active__');
      const latestId = String(latestActive?.exam?.id || '').toLowerCase();
      const latestCode = String(latestActive?.exam?.code || '').toLowerCase();
      if (
        latestActive?.config?.teacherUsername &&
        ((rawExamId && latestId === rawExamId.toLowerCase()) ||
          (rawExamCode && latestCode === rawExamCode.toLowerCase()))
      ) {
        teacherUsername = normalizeTeacherUsernameServer(latestActive.config.teacherUsername);
        if (!teacherName && latestActive.config.teacherName) {
          teacherName = String(latestActive.config.teacherName).trim();
        }
      }
    }
  }

  if (teacherUsername && !teacherName) {
    const { users } = loadDataUsers(false);
    const matchedTeacher = users.find(
      (u) =>
        cleanAuthString(u.username).replace(/^@+/, '').toLowerCase() ===
        teacherUsername.toLowerCase()
    );
    if (matchedTeacher?.fullName) {
      teacherName = matchedTeacher.fullName;
    }
  }

  // Kiểm tra trạng thái khóa phiên thi: cho phép thu bài tự động (autoSubmittedByTeacher) hoặc trong vòng 90 giây sau khi giáo viên bấm kết thúc sớm; chặn bài nộp mới sau khi đã chốt bảng điểm
  const isAutoCollectedByTeacher = Boolean(body.autoSubmittedByTeacher);
  if (!isPeerReplicatedRequest(req) && !isAutoCollectedByTeacher) {
    const closedCheck = await resolveClosedSessionInfoAsync({
      examId: rawExamId,
      examCode: rawExamCode,
      teacherUsername,
      req,
    });
    if (closedCheck.isClosed && closedCheck.closedAtMs) {
      const elapsedAfterCloseMs = Date.now() - closedCheck.closedAtMs;
      if (elapsedAfterCloseMs > 90_000) {
        return res.status(403).json({
          success: false,
          sessionClosed: true,
          error: 'Phiên thi đã kết thúc và chốt danh sách Bảng Điểm cuối cùng.',
        });
      }
    }
  }

  const newSubmission = {
    id: body.id || `sub_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    studentName: String(body.studentName).trim(),
    studentClass: String(body.studentClass || 'Ôn THPT').trim(),
    studentId: body.studentId ? String(body.studentId).trim() : '',
    examId: body.examId || 'de-chuan-01',
    examCode: body.examCode || '101',
    examTitle: body.examTitle || 'Đề Thi Tốt Nghiệp THPT Môn Công Nghệ Nông Nghiệp',
    totalScore: Number(body.totalScore) || 0,
    partIScore: Number(body.partIScore) || 0,
    partIIScore: Number(body.partIIScore) || 0,
    partICorrectCount: Number(body.partICorrectCount) || 0,
    partIICorrectCount: Number(body.partIICorrectCount) || 0,
    timeSpentSeconds: Number(body.timeSpentSeconds) || 0,
    violationCount: Number(body.violationCount) || 0,
    isAutoCollected:
      Boolean(body.isAutoCollected) ||
      isAutoCollectedByTeacher ||
      Number(body.violationCount) >= 5,
    autoSubmittedByTeacher: isAutoCollectedByTeacher,
    teacherUsername: teacherUsername || undefined,
    teacherName: teacherName || undefined,
    submittedAt: body.submittedAt || new Date().toISOString(),
    rank: body.rank || 'Trung bình',
    examPaper: body.examPaper || undefined,
  };

  deletedSubmissionIdsSet.delete(String(newSubmission.id));

  // Prepend new submission so it appears at top of teacher scoreboard
  inMemorySubmissions = [
    newSubmission,
    ...inMemorySubmissions.filter((s) => s.id !== newSubmission.id),
  ];
  persistSubmissionsToFile();

  // Lưu ngay vào Cloud SQL dùng chung và đồng bộ sang máy chủ đối ứng (ais-dev <-> ais-pre)
  if (!isPeerReplicatedRequest(req)) {
    await upsertSubmissionToCloudSql(newSubmission);
    replicateSubmissionUpsertToPeers(newSubmission, req).catch(() => {});
  }

  // Broadcast to all connected teachers' screens immediately
  broadcastSSE('submission_added', newSubmission);

  res.status(201).json({
    success: true,
    data: newSubmission,
    message: 'Điểm bài thi đã được lưu và đồng bộ tới bảng điểm của tài khoản giáo viên thành công!',
  });
});

// 5. DELETE a submission
app.delete('/api/submissions/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (id) {
    deletedSubmissionIdsSet.add(String(id));
  }
  inMemorySubmissions = inMemorySubmissions.filter((s) => s.id !== id);
  persistSubmissionsToFile();
  if (!isPeerReplicatedRequest(req)) {
    await deleteSubmissionFromCloudSql(String(id));
    replicateSubmissionDeleteToPeers(String(id), req).catch(() => {});
  }
  broadcastSSE('submission_deleted', { id });
  res.json({ success: true, id });
});

// 6. Reset submissions to demo data
app.post('/api/submissions/reset', (req: Request, res: Response) => {
  inMemorySubmissions = [...INITIAL_DEMO_SUBMISSIONS];
  persistSubmissionsToFile();
  broadcastSSE('submissions_reset', inMemorySubmissions);
  res.json({ success: true, data: inMemorySubmissions });
});

// ==============================================================================
// AUTHENTICATION & DATAUSER API (ĐĂNG NHẬP TRỰC TIẾP TỪ TỆP DATAUSER)
// ==============================================================================

// 7. POST /api/auth/login - Xác thực đăng nhập trực tiếp từ tệp datauser (Hỗ trợ đăng nhập trên tất cả các thiết bị: Điện thoại, iPad, Máy tính bảng, Laptop, PC)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const { username, password, customAccounts } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!',
    });
  }

  if (!isPeerReplicatedRequest(req)) {
    await pullAndMergeAccountsFromPeers(req, true);
  }
  let { users, filePath } = loadDataUsers(true);

  // Tự động đồng bộ các tài khoản mới do Admin tạo từ trình duyệt nếu gửi kèm trong request đăng nhập
  if (Array.isArray(customAccounts) && customAccounts.length > 0) {
    const deletedSet = loadDeletedUsernamesServer();
    const existingMap = new Map<string, DataUserAccount>();
    users.forEach((u) => {
      existingMap.set(cleanAuthString(u.username).replace(/^@+/, '').toLowerCase(), u);
    });
    let hasChanges = false;
    const prepended: DataUserAccount[] = [];

    for (const rawAcc of customAccounts) {
      if (!rawAcc || !rawAcc.username || !rawAcc.password) continue;
      const cleanU = stripAccents(cleanAuthString(rawAcc.username))
        .replace(/^@+/, '')
        .replace(/\s+/g, '')
        .toLowerCase();
      if (!cleanU || deletedSet.has(cleanU)) continue;
      const cleanP = cleanAuthString(decodeServerSecret(String(rawAcc.password)));
      if (!cleanP) continue;

      const rRaw = String(rawAcc.role || 'teacher').toLowerCase();
      const validRole: 'admin' | 'teacher' | 'student' =
        rRaw === 'admin' ? 'admin' : rRaw === 'student' ? 'student' : 'teacher';
      const defaultPay = validRole === 'student' ? 100000 : 200000;
      const rawCandidate = rawAcc.payment_amount ?? rawAcc.paymentAmount;
      const resolvedPayment = normalizePaymentAmount(
        rawCandidate !== undefined && rawCandidate !== null ? Number(rawCandidate) : defaultPay
      );
      const resolvedStart = normalizeDateYMD(
        rawAcc.start_date || rawAcc.startDate || rawAcc.created_at || rawAcc.createdAt
      );
      const resolvedExpires = isServerUnlimitedAccount(cleanU, validRole)
        ? 'Vĩnh viễn'
        : computeExpiresAtYMD(resolvedStart, resolvedPayment, validRole);
      const fullNameStr = String(rawAcc.fullName || cleanU).trim();
      const rawAliases = Array.isArray(rawAcc.aliases) ? rawAcc.aliases : [];
      const mergedAliases = Array.from(
        new Set(
          [
            ...rawAliases,
            cleanU,
            stripAccents(fullNameStr),
            stripAccents(fullNameStr).replace(/\s+/g, ''),
          ].filter(Boolean)
        )
      );

      const existingLocal = existingMap.get(cleanU);
      const isAct =
        rawAcc.is_active !== undefined
          ? Boolean(rawAcc.is_active)
          : rawAcc.isActive !== undefined
          ? Boolean(rawAcc.isActive)
          : true;

      if (!existingLocal) {
        const newAcc: DataUserAccount = {
          id: rawAcc.id || Date.now() + prepended.length,
          username: cleanU,
          password: cleanP,
          role: validRole,
          fullName: fullNameStr,
          email: String(rawAcc.email || `${cleanU}@truong.edu.vn`).trim(),
          className: String(
            rawAcc.className || (validRole === 'student' ? '12A1' : 'Tổ Công Nghệ Nông nghiệp')
          ).trim(),
          must_change_password: false,
          is_active: isAct,
          created_at: rawAcc.created_at || rawAcc.createdAt || new Date().toISOString(),
          payment_amount: resolvedPayment,
          start_date: resolvedStart,
          expires_at: resolvedExpires,
          aliases: mergedAliases,
        };
        existingMap.set(cleanU, newAcc);
        prepended.push(newAcc);
        upsertAccountToSharedStores(newAcc).catch(() => {});
        hasChanges = true;
      } else {
        const localPass = cleanAuthString(decodeServerSecret(String(existingLocal.password)));
        if (localPass !== cleanP || existingLocal.role !== validRole || existingLocal.payment_amount !== resolvedPayment) {
          const updatedAcc: DataUserAccount = {
            ...existingLocal,
            password: cleanP,
            role: validRole,
            fullName: fullNameStr || existingLocal.fullName,
            is_active: isAct,
            payment_amount: resolvedPayment,
            start_date: resolvedStart,
            expires_at: resolvedExpires,
            aliases: mergedAliases,
          };
          existingMap.set(cleanU, updatedAcc);
          upsertAccountToSharedStores(updatedAcc).catch(() => {});
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      const updatedUsers = [
        ...prepended,
        ...users.map((u) => {
          const k = cleanAuthString(u.username).replace(/^@+/, '').toLowerCase();
          return existingMap.get(k) || u;
        }),
      ];
      persistDataUsersToFile(updatedUsers);
      users = updatedUsers;
    }
  }

  const cleanInputUser = cleanAuthString(username).replace(/^@+/, '').toLowerCase();
  const inputEmailPrefix = cleanInputUser.includes('@') ? cleanInputUser.split('@')[0] : cleanInputUser;
  const strippedInputUser = stripAccents(username).replace(/^@+/, '');
  const strippedNoSpaceInput = strippedInputUser.replace(/\s+/g, '');
  const strippedInputPrefix = strippedNoSpaceInput.includes('@')
    ? strippedNoSpaceInput.split('@')[0]
    : strippedNoSpaceInput;
  const cleanInputPass = cleanAuthString(decodeServerSecret(String(password)));
  const cleanInputPassLower = cleanInputPass.toLowerCase();
  const strippedInputPass = stripAccents(cleanInputPass).replace(/\s+/g, '');

  const findMatchingAccount = (userList: DataUserAccount[]) => {
    const currentDeletedSet = loadDeletedUsernamesServer();
    return userList.find((u) => {
      const uUser = cleanAuthString(u.username).replace(/^@+/, '').toLowerCase();
      const strippedUUser = stripAccents(u.username).replace(/^@+/, '').replace(/\s+/g, '');
      if (currentDeletedSet.has(uUser) || currentDeletedSet.has(strippedUUser)) return false;
      const uFullName = cleanAuthString(u.fullName).toLowerCase();
      const strippedUFullName = stripAccents(u.fullName);
      const uEmail = cleanAuthString(u.email || '').toLowerCase();
      const uEmailPrefix = uEmail.split('@')[0] || '';

      const isUserMatch =
        uUser === cleanInputUser ||
        uUser === inputEmailPrefix ||
        uUser === strippedNoSpaceInput ||
        uUser === strippedInputPrefix ||
        strippedUUser === strippedNoSpaceInput ||
        strippedUUser === strippedInputPrefix ||
        uEmail === cleanInputUser ||
        (uEmailPrefix && (uEmailPrefix === cleanInputUser || uEmailPrefix === inputEmailPrefix)) ||
        uFullName === cleanInputUser ||
        strippedUFullName === strippedInputUser ||
        uFullName.replace(/\s+/g, '') === cleanInputUser.replace(/\s+/g, '') ||
        strippedUFullName.replace(/\s+/g, '') === strippedNoSpaceInput ||
        (Array.isArray(u.aliases) &&
          u.aliases.some((a) => {
            const aClean = cleanAuthString(a).replace(/^@+/, '').toLowerCase();
            const aPrefix = aClean.split('@')[0] || aClean;
            const aStripped = stripAccents(a).replace(/^@+/, '');
            return (
              aClean === cleanInputUser ||
              aPrefix === inputEmailPrefix ||
              aStripped === strippedInputUser ||
              aStripped.replace(/\s+/g, '') === strippedNoSpaceInput
            );
          }));
      if (!isUserMatch) return false;

      const uPass = cleanAuthString(decodeServerSecret(String(u.password)));
      const uPassLower = uPass.toLowerCase();
      const strippedUPass = stripAccents(uPass).replace(/\s+/g, '');
      if (
        uPass === cleanInputPass ||
        uPassLower === cleanInputPassLower ||
        (strippedUPass && strippedUPass === strippedInputPass)
      ) {
        return true;
      }

      // Hỗ trợ các mật khẩu mặc định tương đương cho tài khoản hệ thống nếu chưa đổi sang mật khẩu riêng
      const isDefaultStored = ['admin123', 'gv123', 'hs123', '123456'].includes(uPassLower);
      if (isDefaultStored) {
        if (u.role === 'admin' || uUser === 'admin') {
          return (
            ['admin123', 'gv123', '123456', 'admin@123', 'tvhuu123'].includes(cleanInputPassLower) ||
            ['admin123', 'gv123', '123456', 'admin@123', 'tvhuu123'].includes(strippedInputPass)
          );
        }
        if (u.role === 'teacher' || u.role === 'student') {
          return (
            ['gv123', 'hs123', '123456', 'gv@123'].includes(cleanInputPassLower) ||
            ['gv123', 'hs123', '123456', 'gv@123'].includes(strippedInputPass)
          );
        }
      }
      return false;
    });
  };

  let matched = findMatchingAccount(users);

  // Nếu chưa tìm thấy (ví dụ Admin vừa thêm tài khoản mới mà chưa bấm Xuất bản), tự động đồng bộ tức thì từ Cloud SQL + Cloud Sync Stream
  if (!matched && !isPeerReplicatedRequest(req)) {
    users = await pullAndMergeAccountsFromPeers(req, true);
    matched = findMatchingAccount(users);
  }

  if (matched) {
    if (matched.is_active === false) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản này hiện đang bị khóa bởi Quản trị viên!',
      });
    }

    const isFirstLogin = false;

    if (matched.must_change_password !== false) {
      const updatedUsers = users.map((u) =>
        cleanAuthString(u.username).toLowerCase() === cleanAuthString(matched.username).toLowerCase()
          ? { ...u, must_change_password: false }
          : u
      );
      persistDataUsersToFile(updatedUsers);
    }

    const defaultRolePay = matched.role === 'student' ? 100000 : 200000;
    const rawP = matched.payment_amount;
    const paymentAmount = normalizePaymentAmount(rawP !== undefined && rawP !== null ? Number(rawP) : defaultRolePay);
    const startDate = normalizeDateYMD(matched.start_date || matched.created_at);
    const expiresAt = isServerUnlimitedAccount(matched.username, matched.role)
      ? 'Vĩnh viễn'
      : computeExpiresAtYMD(startDate, paymentAmount, matched.role);

    const token = signAuthToken(matched.username, matched.role);
    const authUser = {
      username: matched.username,
      role: matched.role,
      fullName: matched.fullName || matched.username,
      className: matched.className || (matched.role === 'student' ? 'Ôn THPT' : 'Tổ Công Nghệ Nông nghiệp'),
      must_change_password: false,
      paymentAmount,
      startDate,
      expiresAt,
      token,
      loggedInAt: new Date().toISOString(),
    };

    return res.json({
      success: true,
      message: `Đăng nhập thành công với quyền ${
        matched.role === 'admin' ? 'Quản trị viên' : matched.role === 'teacher' ? 'Giáo viên' : 'Học sinh'
      } (${matched.fullName})!`,
      user: authUser,
      token,
      isFirstLogin,
      source: 'datauser_file',
      file: path.basename(filePath),
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Tên đăng nhập hoặc mật khẩu không chính xác!',
    source: 'datauser_file',
  });
});

// 8. GET /api/auth/users - Danh sách người dùng trong tệp datauser (không lộ mật khẩu)
app.get('/api/auth/users', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  if (!isPeerReplicatedRequest(req)) {
    await pullAndMergeAccountsFromPeers(req, false);
  }
  const { users, filePath, mtime } = loadDataUsers(true);
  res.json({
    success: true,
    count: users.length,
    file: path.basename(filePath),
    lastModified: new Date(mtime).toISOString(),
    users: users.map((u) => {
      const rawP = u.payment_amount;
      const payment_amount = normalizePaymentAmount(rawP !== undefined && rawP !== null ? Number(rawP) : 200000);
      const start_date = normalizeDateYMD(u.start_date || u.created_at);
      const expires_at = isServerUnlimitedAccount(u.username, u.role)
        ? 'Vĩnh viễn'
        : computeExpiresAtYMD(start_date, payment_amount, u.role);
      return {
        username: u.username,
        role: u.role,
        fullName: u.fullName,
        className: u.className,
        is_active: u.is_active !== false,
        payment_amount,
        start_date,
        expires_at,
        aliases: u.aliases || [],
      };
    }),
  });
});

// 9. GET /api/auth/datauser - Toàn bộ dữ liệu tài khoản trong tệp datauser (chỉ phục vụ Bảng Quản Trị Người Dùng của Admin)
app.get('/api/auth/datauser', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  if (!isRequestAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: 'Chỉ Quản trị viên (Admin) mới có quyền truy cập dữ liệu quản trị tài khoản!',
    });
  }
  if (!isPeerReplicatedRequest(req)) {
    await pullAndMergeAccountsFromPeers(req, false);
  }
  const { users, filePath, mtime } = loadDataUsers(true);
  const enrichedUsers = users.map((u) => {
    const rawP = u.payment_amount;
    const payment_amount = normalizePaymentAmount(rawP !== undefined && rawP !== null ? Number(rawP) : 200000);
    const start_date = normalizeDateYMD(u.start_date || u.created_at);
    const expires_at = isServerUnlimitedAccount(u.username, u.role)
      ? 'Vĩnh viễn'
      : computeExpiresAtYMD(start_date, payment_amount, u.role);
    return {
      ...u,
      payment_amount,
      start_date,
      expires_at,
    };
  });
  res.json({
    success: true,
    count: enrichedUsers.length,
    fileName: path.basename(filePath),
    lastModified: new Date(mtime).toISOString(),
    users: enrichedUsers,
  });
});

// 10. POST /api/auth/datauser - Thêm mới hoặc cập nhật tài khoản vào tệp datauser (chỉ Admin thực hiện)
app.post('/api/auth/datauser', (req: Request, res: Response) => {
  if (!isRequestAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: 'Chỉ Quản trị viên (Admin) mới có quyền thêm hoặc cập nhật tài khoản!',
    });
  }
  const {
    id,
    username,
    originalUsername,
    password,
    role,
    fullName,
    email,
    className,
    is_active,
    isActive,
    created_at,
    createdAt,
    payment_amount,
    paymentAmount,
    start_date,
    startDate,
    aliases,
    onlyResetPassword,
    adminExplicitSubscription,
  } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Thiếu tên đăng nhập hoặc mật khẩu!' });
  }

  const { users } = loadDataUsers(true);
  const rawInputU = String(username).trim();
  const cleanU = stripAccents(cleanAuthString(rawInputU))
    .replace(/^@+/, '')
    .replace(/\s+/g, '')
    .toLowerCase();
  const cleanOrigU = originalUsername
    ? stripAccents(cleanAuthString(originalUsername))
        .replace(/^@+/, '')
        .replace(/\s+/g, '')
        .toLowerCase()
    : cleanU;
  const cleanP = cleanAuthString(decodeServerSecret(String(password)));
  const rRaw = String(role || 'teacher').toLowerCase();
  const validRole: 'admin' | 'teacher' | 'student' =
    rRaw === 'admin' ? 'admin' : rRaw === 'student' ? 'student' : 'teacher';

  const existingIndex = users.findIndex((u) => {
    const uClean = cleanAuthString(u.username).replace(/^@+/, '').toLowerCase();
    return uClean === cleanOrigU || uClean === cleanU;
  });
  const existing = existingIndex >= 0 ? users[existingIndex] : null;

  // Khi Admin cập nhật/khôi phục mật khẩu: giữ nguyên 100% start_date, payment_amount, expires_at, created_at (số ngày còn lại không đổi)
  if (onlyResetPassword && existing) {
    const defaultExistingPay = existing.role === 'student' ? 100000 : 200000;
    const rawExistingPay =
      existing.payment_amount !== undefined && existing.payment_amount !== null
        ? Number(existing.payment_amount)
        : defaultExistingPay;
    const preservedPayment = normalizePaymentAmount(rawExistingPay);
    const preservedStart = normalizeDateYMD(existing.start_date || existing.created_at);
    const preservedExpires = isServerUnlimitedAccount(existing.username, existing.role)
      ? 'Vĩnh viễn'
      : existing.expires_at && /^\d{4}-\d{2}-\d{2}$/.test(existing.expires_at)
      ? existing.expires_at
      : computeExpiresAtYMD(preservedStart, preservedPayment, existing.role);

    const resetAccount: DataUserAccount = {
      ...existing,
      password: cleanP,
      must_change_password: false,
      payment_amount: preservedPayment,
      start_date: preservedStart,
      expires_at: preservedExpires,
    };

    const updatedList = users.map((u, idx) => (idx === existingIndex ? resetAccount : u));
    persistDataUsersToFile(updatedList);
    replicateAccountUpsertToPeers(
      {
        ...resetAccount,
        onlyResetPassword: true,
        adminExplicitSubscription: false,
      },
      updatedList,
      req
    ).catch(() => {});

    const { password: _omittedPass, ...safeResetAccount } = resetAccount;
    broadcastSSE('datauser_updated', {
      action: 'reset_password',
      user: safeResetAccount,
      count: updatedList.length,
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: `Đã cập nhật mật khẩu cho "${resetAccount.fullName}" (@${resetAccount.username}) — giữ nguyên ngày bắt đầu và số ngày còn lại!`,
      data: resetAccount,
      users: updatedList,
      totalAccounts: updatedList.length,
    });
  }

  // Chỉ khi Admin tạo mới hoặc chủ động chỉnh sửa hạn dùng (adminExplicitSubscription) mới cập nhật start_date / payment_amount
  const defaultRolePay = validRole === 'student' ? 100000 : 200000;
  const rawCandidate = existing && !adminExplicitSubscription
    ? existing.payment_amount
    : payment_amount ?? paymentAmount ?? existing?.payment_amount;
  const rawPaymentAmount =
    rawCandidate !== undefined && rawCandidate !== null ? Number(rawCandidate) : defaultRolePay;
  const resolvedPaymentAmount = normalizePaymentAmount(rawPaymentAmount);

  const resolvedStartDate = existing && !adminExplicitSubscription
    ? normalizeDateYMD(existing.start_date || existing.created_at)
    : normalizeDateYMD(
        start_date || startDate || existing?.start_date || created_at || createdAt || existing?.created_at
      );

  const resolvedExpiresAt = isServerUnlimitedAccount(cleanU, validRole)
    ? 'Vĩnh viễn'
    : existing && !adminExplicitSubscription && existing.expires_at && /^\d{4}-\d{2}-\d{2}$/.test(existing.expires_at)
    ? existing.expires_at
    : computeExpiresAtYMD(resolvedStartDate, resolvedPaymentAmount, validRole);

  const resolvedFullName = fullName ? String(fullName).trim() : (existing?.fullName || cleanU);
  const resolvedEmail = email ? String(email).trim() : (existing?.email || `${cleanU}@truong.edu.vn`);
  const baseAliases = Array.isArray(aliases) ? aliases : (existing?.aliases || []);
  const enrichedAliases = Array.from(
    new Set(
      [
        ...baseAliases,
        cleanU,
        rawInputU.replace(/^@+/, '').trim(),
        stripAccents(resolvedFullName),
        stripAccents(resolvedFullName).replace(/\s+/g, ''),
        resolvedEmail.split('@')[0] || '',
      ].filter(Boolean)
    )
  );

  const newAccount: DataUserAccount = {
    id: id || existing?.id || Date.now(),
    username: cleanU,
    password: cleanP,
    role: validRole,
    fullName: resolvedFullName,
    email: resolvedEmail,
    className: className ? String(className).trim() : (existing?.className || (validRole === 'student' ? '12A1' : 'Tổ Công Nghệ Nông nghiệp')),
    must_change_password: false,
    is_active:
      is_active !== undefined
        ? Boolean(is_active)
        : isActive !== undefined
        ? Boolean(isActive)
        : existing?.is_active ?? true,
    created_at: existing?.created_at || created_at || createdAt || '2026-11-06T11:50:24.301Z',
    payment_amount: resolvedPaymentAmount,
    start_date: resolvedStartDate,
    expires_at: resolvedExpiresAt,
    aliases: enrichedAliases,
  };

  let updatedList: DataUserAccount[];
  if (existingIndex >= 0) {
    // Editing an existing account in place (preserves position and subscription history)
    updatedList = users.map((u, idx) => (idx === existingIndex ? newAccount : u));
  } else {
    // Adding a new account: place at the very top of the user list so it is immediately visible
    updatedList = [
      newAccount,
      ...users.filter((u, idx) => idx !== existingIndex && cleanAuthString(u.username).toLowerCase() !== cleanU),
    ];
  }

  const deletedSet = loadDeletedUsernamesServer();
  deletedSet.delete(cleanU);
  saveDeletedUsernamesServer(deletedSet);

  persistDataUsersToFile(updatedList);
  replicateAccountUpsertToPeers(
    {
      ...newAccount,
      originalUsername: cleanOrigU,
      onlyResetPassword: false,
      adminExplicitSubscription: Boolean(adminExplicitSubscription),
    },
    updatedList,
    req
  ).catch(() => {});

  const { password: _omittedPass, ...safeNewAccount } = newAccount;
  broadcastSSE('datauser_updated', {
    action: 'upsert',
    user: safeNewAccount,
    count: updatedList.length,
    timestamp: new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    message: `Đã lưu tài khoản "${newAccount.username}" (${newAccount.fullName}) vào hệ thống thành công! Người dùng có thể đăng nhập ngay mà không cần xuất bản.`,
    data: newAccount,
    users: updatedList,
    totalAccounts: updatedList.length,
  });
});

// 10b. POST /api/auth/sync-accounts - Đồng bộ danh sách tài khoản giữa các thiết bị để người dùng đăng nhập được trên tất cả các thiết bị
app.post('/api/auth/sync-accounts', (req: Request, res: Response) => {
  const { accounts } = req.body || {};
  if (!Array.isArray(accounts) || accounts.length === 0) {
    return res.json({ success: true, synced: 0 });
  }

  const deletedSet = loadDeletedUsernamesServer();
  const { users } = loadDataUsers(true);
  const existingMap = new Map<string, DataUserAccount>();
  users.forEach((u) => {
    existingMap.set(cleanAuthString(u.username).replace(/^@+/, '').toLowerCase(), u);
  });
  const defaultUserSet = new Set(
    DEFAULT_DATAUSER_ACCOUNTS.map((d) => cleanAuthString(d.username).replace(/^@+/, '').toLowerCase())
  );

  let changedCount = 0;
  const newAccountsToPrepend: DataUserAccount[] = [];

  for (const rawAcc of accounts) {
    if (!rawAcc || !rawAcc.username || !rawAcc.password) continue;
    const cleanU = stripAccents(cleanAuthString(rawAcc.username))
      .replace(/^@+/, '')
      .replace(/\s+/g, '')
      .toLowerCase();
    if (!cleanU || deletedSet.has(cleanU)) continue;
    const cleanP = cleanAuthString(decodeServerSecret(String(rawAcc.password)));
    if (!cleanP) continue;

    const rRaw = String(rawAcc.role || 'teacher').toLowerCase();
    const validRole: 'admin' | 'teacher' | 'student' =
      rRaw === 'admin' ? 'admin' : rRaw === 'student' ? 'student' : 'teacher';
    const defaultPay = validRole === 'student' ? 100000 : 200000;
    const rawCandidate = rawAcc.payment_amount ?? rawAcc.paymentAmount;
    const resolvedPayment = normalizePaymentAmount(
      rawCandidate !== undefined && rawCandidate !== null ? Number(rawCandidate) : defaultPay
    );
    const resolvedStart = normalizeDateYMD(
      rawAcc.start_date || rawAcc.startDate || rawAcc.created_at || rawAcc.createdAt
    );
    const resolvedExpires = isServerUnlimitedAccount(cleanU, validRole)
      ? 'Vĩnh viễn'
      : computeExpiresAtYMD(resolvedStart, resolvedPayment, validRole);
    const resolvedFullName = String(rawAcc.fullName || cleanU).trim();
    const resolvedEmail = String(rawAcc.email || `${cleanU}@truong.edu.vn`).trim();
    const baseAliases = Array.isArray(rawAcc.aliases) ? rawAcc.aliases : [];
    const enrichedAliases = Array.from(
      new Set(
        [
          ...baseAliases,
          cleanU,
          stripAccents(resolvedFullName),
          stripAccents(resolvedFullName).replace(/\s+/g, ''),
          resolvedEmail.split('@')[0] || '',
        ].filter(Boolean)
      )
    );

    const existingLocal = existingMap.get(cleanU);
    const isAct =
      rawAcc.is_active !== undefined
        ? Boolean(rawAcc.is_active)
        : rawAcc.isActive !== undefined
        ? Boolean(rawAcc.isActive)
        : true;

    if (!existingLocal) {
      const newAcc: DataUserAccount = {
        id: rawAcc.id || Date.now() + changedCount,
        username: cleanU,
        password: cleanP,
        role: validRole,
        fullName: resolvedFullName,
        email: resolvedEmail,
        className: String(
          rawAcc.className || (validRole === 'student' ? '12A1' : 'Tổ Công Nghệ Nông nghiệp')
        ).trim(),
        must_change_password: false,
        is_active: isAct,
        created_at: rawAcc.created_at || rawAcc.createdAt || new Date().toISOString(),
        payment_amount: resolvedPayment,
        start_date: resolvedStart,
        expires_at: resolvedExpires,
        aliases: enrichedAliases,
      };
      existingMap.set(cleanU, newAcc);
      newAccountsToPrepend.push(newAcc);
      upsertAccountToSharedStores(newAcc).catch(() => {});
      changedCount++;
    } else {
      const localPass = cleanAuthString(decodeServerSecret(String(existingLocal.password)));
      if (localPass !== cleanP || existingLocal.role !== validRole || existingLocal.payment_amount !== resolvedPayment) {
        const updatedAcc: DataUserAccount = {
          ...existingLocal,
          password: cleanP,
          role: validRole,
          fullName: resolvedFullName || existingLocal.fullName,
          is_active: isAct,
          payment_amount: resolvedPayment,
          start_date: resolvedStart,
          expires_at: resolvedExpires,
          aliases: enrichedAliases,
        };
        existingMap.set(cleanU, updatedAcc);
        upsertAccountToSharedStores(updatedAcc).catch(() => {});
        changedCount++;
      }
    }
  }

  if (changedCount > 0) {
    const updatedExisting = users.map((u) => {
      const k = cleanAuthString(u.username).replace(/^@+/, '').toLowerCase();
      return existingMap.get(k) || u;
    });
    const updatedList = [...newAccountsToPrepend, ...updatedExisting];
    persistDataUsersToFile(updatedList);
    if (!isPeerReplicatedRequest(req)) {
      const peers = getPeerOrigins(req);
      peers.forEach((peer) => {
        fetch(`${peer}/api/auth/sync-accounts?peerReplicated=1`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Role': 'admin',
            'X-Peer-Replicated': '1',
          },
          body: JSON.stringify({ accounts: updatedList, peerReplicated: true }),
        }).catch(() => {});
      });
    }
    broadcastSSE('datauser_updated', {
      action: 'sync_accounts',
      count: updatedList.length,
      timestamp: new Date().toISOString(),
    });
  }

  return res.json({
    success: true,
    synced: changedCount,
    totalAccounts: existingMap.size,
  });
});

// 11. DELETE /api/auth/datauser/:username - Xóa tài khoản khỏi tệp datauser (Admin hoặc chính chủ tài khoản thực hiện)
app.delete('/api/auth/datauser/:username', async (req: Request, res: Response) => {
  const rawTarget = String(req.params.username || '').trim();
  const target = stripAccents(cleanAuthString(rawTarget))
    .replace(/^@+/, '')
    .replace(/\s+/g, '')
    .toLowerCase();

  const verifiedToken = verifyAuthToken(req.headers.authorization);
  const tokenUser = verifiedToken
    ? stripAccents(cleanAuthString(verifiedToken.u)).replace(/^@+/, '').replace(/\s+/g, '').toLowerCase()
    : '';
  const isSelfDelete = Boolean(target) && Boolean(tokenUser) && tokenUser === target;

  if (!isRequestAdmin(req) && !isSelfDelete) {
    return res.status(403).json({
      success: false,
      message: 'Chỉ Quản trị viên (Admin) hoặc chính chủ tài khoản mới có quyền xóa tài khoản!',
    });
  }

  if (!target || target === 'admin') {
    return res.status(400).json({
      success: false,
      message: 'Không thể xóa tài khoản Quản trị viên chính (admin)!',
    });
  }

  const deletedSet = loadDeletedUsernamesServer();
  deletedSet.add(target);
  saveDeletedUsernamesServer(deletedSet);

  const { users } = loadDataUsers(true);
  const updatedList = users.filter((u) => {
    const uClean = cleanAuthString(u.username).replace(/^@+/, '').toLowerCase();
    const uStripped = stripAccents(uClean).replace(/\s+/g, '');
    return uClean !== target && uStripped !== target;
  });

  persistDataUsersToFile(updatedList);
  await replicateAccountDeleteToPeers(target, req).catch(() => {});

  broadcastSSE('datauser_updated', {
    action: 'delete',
    username: target,
    count: updatedList.length,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: `Đã xóa tài khoản "${target}" khỏi hệ thống thành công!`,
    users: updatedList,
    totalAccounts: updatedList.length,
  });
});

// 11b. POST /api/auth/delete-accounts - Xóa một hoặc nhiều tài khoản cùng lúc (Admin hoặc chính chủ tài khoản)
app.post('/api/auth/delete-accounts', async (req: Request, res: Response) => {
  const rawUsernames = Array.isArray(req.body?.usernames)
    ? req.body.usernames
    : req.body?.username
    ? [req.body.username]
    : [];

  const targets: string[] = Array.from(
    new Set<string>(
      rawUsernames
        .map((u: any) =>
          stripAccents(cleanAuthString(u)).replace(/^@+/, '').replace(/\s+/g, '').toLowerCase()
        )
        .filter((u: string) => Boolean(u) && u !== 'admin')
    )
  );

  if (targets.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng chọn ít nhất 1 tài khoản hợp lệ để xóa (không thể xóa tài khoản admin)!',
    });
  }

  const verifiedToken = verifyAuthToken(req.headers.authorization);
  const tokenUser = verifiedToken
    ? stripAccents(cleanAuthString(verifiedToken.u)).replace(/^@+/, '').replace(/\s+/g, '').toLowerCase()
    : '';
  const isSingleSelfDelete =
    targets.length === 1 && Boolean(tokenUser) && tokenUser === targets[0];

  if (!isRequestAdmin(req) && !isSingleSelfDelete) {
    return res.status(403).json({
      success: false,
      message: 'Chỉ Quản trị viên (Admin) mới có quyền xóa các tài khoản người dùng!',
    });
  }

  const targetSet = new Set(targets);
  const deletedSet = loadDeletedUsernamesServer();
  targets.forEach((t) => deletedSet.add(t));
  saveDeletedUsernamesServer(deletedSet);

  const { users } = loadDataUsers(true);
  const updatedList = users.filter((u) => {
    const uClean = cleanAuthString(u.username).replace(/^@+/, '').toLowerCase();
    const uStripped = stripAccents(uClean).replace(/\s+/g, '');
    return !targetSet.has(uClean) && !targetSet.has(uStripped);
  });

  persistDataUsersToFile(updatedList);
  await Promise.all(
    targets.map((t) => replicateAccountDeleteToPeers(t, req).catch(() => {}))
  );

  broadcastSSE('datauser_updated', {
    action: 'delete_multiple',
    usernames: targets,
    count: updatedList.length,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    deletedCount: targets.length,
    deletedUsernames: targets,
    message: `Đã xóa vĩnh viễn ${targets.length} tài khoản khỏi hệ thống thành công!`,
    users: updatedList,
    totalAccounts: updatedList.length,
  });
});

// 12. POST /api/auth/change-password - Đổi mật khẩu tài khoản hiện có trong datauser.json
app.post('/api/auth/change-password', (req: Request, res: Response) => {
  const { username, oldPassword, newPassword, skipOldPasswordCheck, role, fullName, className } =
    req.body || {};
  if (!username || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập đầy đủ tên tài khoản và mật khẩu mới!',
    });
  }

  const canSkipOldPassword = Boolean(skipOldPasswordCheck) && isRequestAdmin(req);
  const cleanU = cleanAuthString(username).replace(/^@+/, '');
  const cleanULower = cleanU.toLowerCase();
  const strippedU = stripAccents(username).replace(/^@+/, '');
  const cleanOldP = oldPassword !== undefined ? cleanAuthString(oldPassword) : '';
  const cleanNewP = cleanAuthString(newPassword);

  if (cleanNewP.length < 4) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu mới phải có ít nhất 4 ký tự!',
    });
  }

  const { users } = loadDataUsers(true);
  let matchedUser: (typeof users)[number] | undefined;

  for (const u of users) {
    const uUser = cleanAuthString(u.username).replace(/^@+/, '').toLowerCase();
    const uFullName = cleanAuthString(u.fullName).toLowerCase();
    const strippedUFullName = stripAccents(u.fullName);
    const uEmail = cleanAuthString(u.email || '').toLowerCase();
    const isAliasMatch =
      Array.isArray(u.aliases) &&
      u.aliases.some((a) => {
        const aClean = cleanAuthString(a).replace(/^@+/, '').toLowerCase();
        return aClean === cleanULower || stripAccents(a) === strippedU;
      });

    if (
      uUser === cleanULower ||
      uEmail === cleanULower ||
      uFullName === cleanULower ||
      strippedUFullName === strippedU ||
      isAliasMatch
    ) {
      matchedUser = u;
      break;
    }
  }

  if (!matchedUser) {
    const validRole: 'admin' | 'teacher' | 'student' =
      role === 'admin' && isRequestAdmin(req)
        ? 'admin'
        : role === 'student'
        ? 'student'
        : 'teacher';
    const startDate = normalizeDateYMD();
    const paymentAmount = 200000;
    const expiresAt = isServerUnlimitedAccount(cleanULower, validRole)
      ? 'Vĩnh viễn'
      : computeExpiresAtYMD(startDate, paymentAmount, validRole);
    const createdAcc: DataUserAccount = {
      id: Date.now(),
      username: cleanULower,
      password: cleanNewP,
      role: validRole,
      fullName: fullName ? String(fullName).trim() : cleanULower,
      email: `${cleanULower}@truong.edu.vn`,
      className: className ? String(className).trim() : 'Tổ Công Nghệ Nông nghiệp',
      must_change_password: false,
      is_active: true,
      created_at: new Date().toISOString(),
      payment_amount: paymentAmount,
      start_date: startDate,
      expires_at: expiresAt,
      aliases: [],
    };
    const nextList = [createdAcc, ...users];
    persistDataUsersToFile(nextList);
    const { password: _omitted, ...safeCreatedAcc } = createdAcc;
    broadcastSSE('datauser_updated', {
      action: 'change_password',
      username: cleanULower,
      user: safeCreatedAcc,
      must_change_password: false,
      timestamp: new Date().toISOString(),
    });
    return res.json({
      success: true,
      username: createdAcc.username,
      fullName: createdAcc.fullName,
      message: `Đã thay đổi mật khẩu cho tài khoản "${createdAcc.fullName}" (@${createdAcc.username}) thành công!`,
    });
  }

  // Kiểm tra mật khẩu hiện tại nếu người dùng tự đổi mật khẩu
  if (!canSkipOldPassword && cleanOldP) {
    const currentPass = cleanAuthString(matchedUser.password);
    const currentPassLower = currentPass.toLowerCase();
    const oldPassLower = cleanOldP.toLowerCase();
    const isDirectMatch = currentPass === cleanOldP || currentPassLower === oldPassLower;
    const isDefaultEquiv =
      ['admin123', 'gv123', 'hs123', '123456'].includes(currentPassLower) &&
      ['admin123', 'gv123', 'hs123', '123456'].includes(oldPassLower);
    if (!isDirectMatch && !isDefaultEquiv) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu hiện tại không chính xác! Vui lòng kiểm tra lại.',
      });
    }
  } else if (!canSkipOldPassword && !cleanOldP) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập mật khẩu hiện tại để xác thực!',
    });
  }

  const targetUsernameLower = cleanAuthString(matchedUser.username).toLowerCase();
  let updatedAccountRecord: DataUserAccount | undefined;
  const updatedList = users.map((u) => {
    if (cleanAuthString(u.username).toLowerCase() === targetUsernameLower) {
      const defaultPay = u.role === 'student' ? 100000 : 200000;
      const rawPay = u.payment_amount !== undefined && u.payment_amount !== null ? Number(u.payment_amount) : defaultPay;
      const preservedPayment = normalizePaymentAmount(rawPay);
      const preservedStart = normalizeDateYMD(u.start_date || u.created_at);
      const preservedExpires = isServerUnlimitedAccount(u.username, u.role)
        ? 'Vĩnh viễn'
        : u.expires_at && /^\d{4}-\d{2}-\d{2}$/.test(u.expires_at)
        ? u.expires_at
        : computeExpiresAtYMD(preservedStart, preservedPayment, u.role);
      updatedAccountRecord = {
        ...u,
        password: cleanNewP,
        must_change_password: false,
        payment_amount: preservedPayment,
        start_date: preservedStart,
        expires_at: preservedExpires,
      };
      return updatedAccountRecord;
    }
    return u;
  });

  persistDataUsersToFile(updatedList);
  if (updatedAccountRecord) {
    replicateAccountUpsertToPeers(
      {
        ...updatedAccountRecord,
        onlyResetPassword: true,
        adminExplicitSubscription: false,
      },
      updatedList,
      req
    ).catch(() => {});
  }
  const safeUpdatedRecord = updatedAccountRecord
    ? (({ password: _p, ...rest }) => rest)(updatedAccountRecord)
    : undefined;
  broadcastSSE('datauser_updated', {
    action: 'change_password',
    username: targetUsernameLower,
    user: safeUpdatedRecord,
    must_change_password: false,
    timestamp: new Date().toISOString(),
  });

  return res.json({
    success: true,
    username: matchedUser.username,
    fullName: matchedUser.fullName,
    user: safeUpdatedRecord,
    message: `Đã thay đổi mật khẩu cho tài khoản "${matchedUser.fullName || matchedUser.username}" (@${matchedUser.username}) — giữ nguyên ngày bắt đầu và số ngày còn lại!`,
  });
});

// 13. POST /api/auth/update-profile - Người dùng tự cập nhật thông tin tài khoản cá nhân
app.post('/api/auth/update-profile', (req: Request, res: Response) => {
  const { username, fullName, className, email, phone } = req.body || {};
  if (!username || !fullName || !String(fullName).trim()) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập đầy đủ Họ và tên hợp lệ!',
    });
  }

  const cleanU = cleanAuthString(username).toLowerCase();
  const strippedU = stripAccents(username);
  const { users } = loadDataUsers(true);

  let matchedUser: (typeof users)[number] | undefined;
  for (const u of users) {
    const uUser = cleanAuthString(u.username).toLowerCase();
    const uFullName = cleanAuthString(u.fullName).toLowerCase();
    const strippedUFullName = stripAccents(u.fullName);
    const isAliasMatch =
      Array.isArray(u.aliases) &&
      u.aliases.some((a) => {
        const aClean = cleanAuthString(a).toLowerCase();
        return aClean === cleanU || stripAccents(a) === strippedU;
      });

    if (
      uUser === cleanU ||
      uFullName === cleanU ||
      strippedUFullName === strippedU ||
      isAliasMatch
    ) {
      matchedUser = u;
      break;
    }
  }

  if (!matchedUser) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy tài khoản trong hệ thống!',
    });
  }

  const targetUsernameLower = cleanAuthString(matchedUser.username).toLowerCase();
  const newFullName = String(fullName).trim();
  const newClassName =
    className !== undefined ? String(className).trim() : matchedUser.className;
  const newEmail =
    email !== undefined ? String(email).trim() : matchedUser.email;
  const newPhone =
    phone !== undefined ? String(phone).trim() : (matchedUser as any).phone || '';

  let updatedRecord: any = null;
  const updatedList = users.map((u) => {
    if (cleanAuthString(u.username).toLowerCase() === targetUsernameLower) {
      updatedRecord = {
        ...u,
        fullName: newFullName,
        className: newClassName || u.className,
        email: newEmail || u.email,
        phone: newPhone,
      };
      return updatedRecord;
    }
    return u;
  });

  persistDataUsersToFile(updatedList);
  broadcastSSE('datauser_updated', {
    action: 'update_profile',
    username: targetUsernameLower,
    fullName: newFullName,
    className: newClassName,
    email: newEmail,
    phone: newPhone,
    timestamp: new Date().toISOString(),
  });

  return res.json({
    success: true,
    username: matchedUser.username,
    fullName: newFullName,
    className: newClassName,
    email: newEmail,
    phone: newPhone,
    message: 'Cập nhật thông tin tài khoản thành công!',
  });
});

// ==============================================================================
// REAL-TIME VISITOR & ACCESS ANALYTICS ENGINE
// Thống kê chi tiết số lượt người dùng truy cập theo thời gian thực
// ==============================================================================
const VISITOR_STATS_FILE = path.join(DATA_DIR, 'visitor_stats.json');

interface VisitLogEntry {
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

interface ActiveVisitorSession {
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

interface DownloadLogEntry {
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

interface UserDownloadStat {
  username: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'student' | 'guest';
  count: number;
  lastDownloadAt: string;
  lastFileName: string;
  lastDocumentTitle: string;
}

interface PersistedVisitorStats {
  totalVisits: number;
  uniqueVisitorIds: string[];
  dailyVisits: Record<string, number>;
  hourlyVisitsDate: string;
  hourlyVisits: Record<string, number>;
  tabViews: Record<string, number>;
  visitLogs: VisitLogEntry[];
  totalDownloads: number;
  dailyDownloads: Record<string, number>;
  downloadsByCategory: Record<string, number>;
  downloadsByUser: Record<string, UserDownloadStat>;
  downloadLogs: DownloadLogEntry[];
}

function getVietnamDateKey(date = new Date()): string {
  const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return vnTime.toISOString().slice(0, 10);
}

function getVietnamHourKey(date = new Date()): string {
  const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return String(vnTime.getUTCHours()).padStart(2, '0');
}

const todayKeyInit = getVietnamDateKey();

let visitorStatsState: PersistedVisitorStats = {
  totalVisits: 0,
  uniqueVisitorIds: [],
  dailyVisits: { [todayKeyInit]: 0 },
  hourlyVisitsDate: todayKeyInit,
  hourlyVisits: {},
  tabViews: {
    exams: 0,
    chapter_review: 0,
    mistakes: 0,
    admin: 0,
    users: 0,
    traffic: 0,
    handbook: 0,
    matrix: 0,
    exam_taking: 0,
  },
  visitLogs: [],
  totalDownloads: 0,
  dailyDownloads: { [todayKeyInit]: 0 },
  downloadsByCategory: {
    de_thi_thpt: 0,
    on_tap_chuong: 0,
    de_lop_12: 0,
    de_lop_11: 0,
    de_lop_10: 0,
  },
  downloadsByUser: {},
  downloadLogs: [],
};

const activeVisitorSessions = new Map<string, ActiveVisitorSession>();

function loadVisitorStatsFromFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(VISITOR_STATS_FILE)) {
      const raw = fs.readFileSync(VISITOR_STATS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.totalVisits === 'number') {
        visitorStatsState = {
          totalVisits: parsed.totalVisits || 0,
          uniqueVisitorIds: Array.isArray(parsed.uniqueVisitorIds) ? parsed.uniqueVisitorIds : [],
          dailyVisits: parsed.dailyVisits || {},
          hourlyVisitsDate: parsed.hourlyVisitsDate || getVietnamDateKey(),
          hourlyVisits: parsed.hourlyVisits || {},
          tabViews: {
            exams: 0,
            chapter_review: 0,
            mistakes: 0,
            admin: 0,
            users: 0,
            traffic: 0,
            handbook: 0,
            matrix: 0,
            exam_taking: 0,
            ...(parsed.tabViews || {}),
          },
          visitLogs: Array.isArray(parsed.visitLogs) ? parsed.visitLogs.slice(0, 150) : [],
          totalDownloads: Number(parsed.totalDownloads) || 0,
          dailyDownloads: parsed.dailyDownloads || {},
          downloadsByCategory: {
            de_thi_thpt: 0,
            on_tap_chuong: 0,
            de_lop_12: 0,
            de_lop_11: 0,
            de_lop_10: 0,
            ...(parsed.downloadsByCategory || {}),
          },
          downloadsByUser: parsed.downloadsByUser || {},
          downloadLogs: Array.isArray(parsed.downloadLogs) ? parsed.downloadLogs.slice(0, 150) : [],
        };
        return;
      }
    }
    fs.writeFileSync(VISITOR_STATS_FILE, JSON.stringify(visitorStatsState, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[VisitorStats] Fallback to in-memory visitor stats:', err);
  }
}

function persistVisitorStatsToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(VISITOR_STATS_FILE, JSON.stringify(visitorStatsState, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[VisitorStats] Failed writing visitor_stats.json:', err);
  }
}

function mergeVisitorStatsState(remote: Partial<PersistedVisitorStats>): boolean {
  if (!remote || typeof remote !== 'object') return false;
  const beforeSig = `${visitorStatsState.totalVisits}:${visitorStatsState.totalDownloads}:${visitorStatsState.uniqueVisitorIds.length}:${visitorStatsState.visitLogs[0]?.id || ''}:${visitorStatsState.downloadLogs[0]?.id || ''}`;

  visitorStatsState.totalVisits = Math.max(
    visitorStatsState.totalVisits || 0,
    Number(remote.totalVisits) || 0
  );
  visitorStatsState.totalDownloads = Math.max(
    visitorStatsState.totalDownloads || 0,
    Number(remote.totalDownloads) || 0
  );

  if (Array.isArray(remote.uniqueVisitorIds)) {
    const uniqSet = new Set([...(visitorStatsState.uniqueVisitorIds || []), ...remote.uniqueVisitorIds]);
    visitorStatsState.uniqueVisitorIds = Array.from(uniqSet).slice(-5000);
  }

  if (remote.dailyVisits && typeof remote.dailyVisits === 'object') {
    for (const [k, v] of Object.entries(remote.dailyVisits)) {
      visitorStatsState.dailyVisits[k] = Math.max(
        visitorStatsState.dailyVisits[k] || 0,
        Number(v) || 0
      );
    }
  }
  if (remote.dailyDownloads && typeof remote.dailyDownloads === 'object') {
    for (const [k, v] of Object.entries(remote.dailyDownloads)) {
      visitorStatsState.dailyDownloads[k] = Math.max(
        visitorStatsState.dailyDownloads[k] || 0,
        Number(v) || 0
      );
    }
  }
  if (remote.tabViews && typeof remote.tabViews === 'object') {
    for (const [k, v] of Object.entries(remote.tabViews)) {
      visitorStatsState.tabViews[k] = Math.max(
        visitorStatsState.tabViews[k] || 0,
        Number(v) || 0
      );
    }
  }
  if (remote.downloadsByCategory && typeof remote.downloadsByCategory === 'object') {
    for (const [k, v] of Object.entries(remote.downloadsByCategory)) {
      visitorStatsState.downloadsByCategory[k] = Math.max(
        visitorStatsState.downloadsByCategory[k] || 0,
        Number(v) || 0
      );
    }
  }
  if (remote.downloadsByUser && typeof remote.downloadsByUser === 'object') {
    for (const [uKey, stat] of Object.entries(remote.downloadsByUser)) {
      if (!stat) continue;
      const prev = visitorStatsState.downloadsByUser[uKey];
      if (!prev || (stat.count || 0) > (prev.count || 0)) {
        visitorStatsState.downloadsByUser[uKey] = stat;
      }
    }
  }
  if (Array.isArray(remote.visitLogs) && remote.visitLogs.length > 0) {
    const map = new Map<string, VisitLogEntry>();
    for (const entry of [...(visitorStatsState.visitLogs || []), ...remote.visitLogs]) {
      if (entry?.id && !map.has(entry.id)) map.set(entry.id, entry);
    }
    visitorStatsState.visitLogs = Array.from(map.values())
      .sort((a, b) => Date.parse(b.timestamp || '') - Date.parse(a.timestamp || ''))
      .slice(0, 150);
  }
  if (Array.isArray(remote.downloadLogs) && remote.downloadLogs.length > 0) {
    const map = new Map<string, DownloadLogEntry>();
    for (const entry of [...(visitorStatsState.downloadLogs || []), ...remote.downloadLogs]) {
      if (entry?.id && !map.has(entry.id)) map.set(entry.id, entry);
    }
    visitorStatsState.downloadLogs = Array.from(map.values())
      .sort((a, b) => Date.parse(b.timestamp || '') - Date.parse(a.timestamp || ''))
      .slice(0, 150);
  }

  const afterSig = `${visitorStatsState.totalVisits}:${visitorStatsState.totalDownloads}:${visitorStatsState.uniqueVisitorIds.length}:${visitorStatsState.visitLogs[0]?.id || ''}:${visitorStatsState.downloadLogs[0]?.id || ''}`;
  return beforeSig !== afterSig;
}

async function upsertVisitorStatsToCloudSql(): Promise<void> {
  try {
    await pgQueryParams(
      `INSERT INTO agritech_visitor_stats_store (store_key, state_json, updated_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (store_key) DO UPDATE SET
         state_json = EXCLUDED.state_json,
         updated_at = EXCLUDED.updated_at`,
      ['global_stats', JSON.stringify(visitorStatsState), Date.now()],
      false,
      6000
    );
  } catch {}
}

let lastVisitorStatsSqlPullMs = 0;
async function pullAndMergeVisitorStatsFromCloudSql(force = false): Promise<boolean> {
  const now = Date.now();
  if (!force && now - lastVisitorStatsSqlPullMs < 2000) return false;
  lastVisitorStatsSqlPullMs = now;
  try {
    const rows = await pgQuery(
      `SELECT state_json FROM agritech_visitor_stats_store WHERE store_key = 'global_stats' LIMIT 1;`
    );
    const rawJson = rows?.[0]?.[0];
    if (!rawJson) return false;
    const parsed = JSON.parse(rawJson);
    const changed = mergeVisitorStatsState(parsed);
    if (changed) {
      persistVisitorStatsToFile();
    }
    return changed;
  } catch {}
  return false;
}

loadVisitorStatsFromFile();

function pruneStaleVisitorSessions(): boolean {
  const now = Date.now();
  let removed = false;
  activeVisitorSessions.forEach((session, key) => {
    if (now - session.lastActiveAt > 90000) {
      activeVisitorSessions.delete(key);
      removed = true;
    }
  });
  return removed;
}

setInterval(() => {
  if (pruneStaleVisitorSessions()) {
    broadcastSSE('visitor_stats_updated', getVisitorStatsSnapshot());
  }
}, 20000);

function getVisitorStatsSnapshot() {
  pruneStaleVisitorSessions();
  const todayKey = getVietnamDateKey();
  if (visitorStatsState.hourlyVisitsDate !== todayKey) {
    visitorStatsState.hourlyVisitsDate = todayKey;
    visitorStatsState.hourlyVisits = {};
  }

  const activeSessions = Array.from(activeVisitorSessions.values()).sort(
    (a, b) => b.lastActiveAt - a.lastActiveAt
  );

  // Last 7 days daily visits
  const last7Days: Array<{ date: string; label: string; count: number; downloadsCount: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = getVietnamDateKey(d);
    const parts = key.split('-');
    const label = `${parts[2]}/${parts[1]}`;
    last7Days.push({
      date: key,
      label,
      count: visitorStatsState.dailyVisits[key] || 0,
      downloadsCount: visitorStatsState.dailyDownloads?.[key] || 0,
    });
  }

  const topDownloadUsers = Object.values(visitorStatsState.downloadsByUser || {}).sort(
    (a, b) => b.count - a.count
  );

  return {
    success: true,
    serverTime: new Date().toISOString(),
    totalVisits: visitorStatsState.totalVisits,
    todayVisits: visitorStatsState.dailyVisits[todayKey] || 0,
    uniqueVisitorsCount: visitorStatsState.uniqueVisitorIds.length,
    onlineCount: Math.max(activeSessions.length, sseClients.size > 0 ? Math.min(sseClients.size, Math.max(1, activeSessions.length)) : activeSessions.length),
    activeSessions,
    tabViews: visitorStatsState.tabViews,
    hourlyVisits: visitorStatsState.hourlyVisits,
    last7Days,
    visitLogs: visitorStatsState.visitLogs.slice(0, 100),
    totalDownloads: visitorStatsState.totalDownloads || 0,
    todayDownloads: visitorStatsState.dailyDownloads?.[todayKey] || 0,
    downloadsByCategory: visitorStatsState.downloadsByCategory || {},
    topDownloadUsers,
    downloadLogs: (visitorStatsState.downloadLogs || []).slice(0, 100),
  };
}

// 13. GET /api/analytics/visitors - Lấy dữ liệu thống kê truy cập chi tiết theo thời gian thực
app.get('/api/analytics/visitors', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  await pullAndMergeVisitorStatsFromCloudSql(false);
  res.json(getVisitorStatsSnapshot());
});

// 14. POST /api/analytics/visit - Chỉ cần nhấp vào link mở web app là tính 1 lượt truy cập
app.post('/api/analytics/visit', (req: Request, res: Response) => {
  const {
    sessionId,
    visitorId,
    username,
    fullName,
    role,
    studentClass,
    tab = 'exams',
    tabLabel = 'Kho 48 Mã Đề Thi',
    action = 'Nhấp vào link truy cập Web App',
    deviceType = 'Máy tính (PC/Laptop)',
    browser = 'Chrome',
    os = 'Windows',
    isNewVisit = true,
  } = req.body || {};

  const sid = String(sessionId || `sess_${Date.now()}`);
  const vid = String(visitorId || sid);
  const nowIso = new Date().toISOString();
  const todayKey = getVietnamDateKey();
  const hourKey = getVietnamHourKey();

  if (visitorStatsState.hourlyVisitsDate !== todayKey) {
    visitorStatsState.hourlyVisitsDate = todayKey;
    visitorStatsState.hourlyVisits = {};
  }

  const existingSession = activeVisitorSessions.get(sid);
  const countAsVisit = Boolean(isNewVisit) || !existingSession;

  if (countAsVisit) {
    visitorStatsState.totalVisits += 1;
    visitorStatsState.dailyVisits[todayKey] = (visitorStatsState.dailyVisits[todayKey] || 0) + 1;
    visitorStatsState.hourlyVisits[hourKey] = (visitorStatsState.hourlyVisits[hourKey] || 0) + 1;
  }

  if (vid && !visitorStatsState.uniqueVisitorIds.includes(vid)) {
    visitorStatsState.uniqueVisitorIds.push(vid);
  }

  if (tab) {
    visitorStatsState.tabViews[tab] = (visitorStatsState.tabViews[tab] || 0) + 1;
  }

  const validRole: 'admin' | 'teacher' | 'student' | 'guest' =
    role === 'admin' || role === 'teacher' || role === 'student' ? role : 'guest';

  const displayFullName = String(fullName || username || 'Khách truy cập').trim();

  activeVisitorSessions.set(sid, {
    sessionId: sid,
    visitorId: vid,
    username: username ? String(username) : undefined,
    fullName: displayFullName,
    role: validRole,
    studentClass: studentClass ? String(studentClass) : undefined,
    currentTab: String(tab),
    currentTabLabel: String(tabLabel),
    currentAction: String(action),
    deviceType: String(deviceType),
    browser: String(browser),
    os: String(os),
    connectedAt: existingSession?.connectedAt || nowIso,
    lastActiveAt: Date.now(),
  });

  if (countAsVisit) {
    const logEntry: VisitLogEntry = {
      id: `vlog_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      sessionId: sid,
      visitorId: vid,
      username: username ? String(username) : undefined,
      fullName: displayFullName,
      role: validRole,
      studentClass: studentClass ? String(studentClass) : undefined,
      tab: String(tab),
      tabLabel: String(tabLabel),
      action: String(action),
      deviceType: String(deviceType),
      browser: String(browser),
      os: String(os),
      timestamp: nowIso,
    };

    visitorStatsState.visitLogs = [logEntry, ...visitorStatsState.visitLogs].slice(0, 150);
  } else {
    // Cập nhật thông tin người dùng (nếu đăng nhập hoặc nhập tên sau khi mở link) cho bản ghi của phiên hiện tại
    visitorStatsState.visitLogs = visitorStatsState.visitLogs.map((log) =>
      log.sessionId === sid
        ? {
            ...log,
            username: username ? String(username) : log.username,
            fullName: displayFullName !== 'Khách truy cập' ? displayFullName : log.fullName,
            role: validRole !== 'guest' ? validRole : log.role,
            studentClass: studentClass ? String(studentClass) : log.studentClass,
            tab: String(tab),
            tabLabel: String(tabLabel),
          }
        : log
    );
  }

  persistVisitorStatsToFile();
  void upsertVisitorStatsToCloudSql();

  const snapshot = getVisitorStatsSnapshot();
  broadcastSSE('visitor_stats_updated', snapshot);

  res.json(snapshot);
});

// 15. POST /api/analytics/heartbeat - Cập nhật trạng thái đang trực tuyến của phiên người dùng
app.post('/api/analytics/heartbeat', (req: Request, res: Response) => {
  const {
    sessionId,
    visitorId,
    username,
    fullName,
    role,
    studentClass,
    tab = 'exams',
    tabLabel = 'Kho 48 Mã Đề Thi',
    action = 'Đang trực tuyến',
    deviceType = 'Máy tính (PC/Laptop)',
    browser = 'Chrome',
    os = 'Windows',
  } = req.body || {};

  if (!sessionId) {
    return res.json(getVisitorStatsSnapshot());
  }

  const sid = String(sessionId);
  const vid = String(visitorId || sid);
  const existing = activeVisitorSessions.get(sid);
  const validRole: 'admin' | 'teacher' | 'student' | 'guest' =
    role === 'admin' || role === 'teacher' || role === 'student' ? role : 'guest';
  const displayFullName = String(fullName || username || existing?.fullName || 'Khách truy cập').trim();

  if (existing && existing.currentTab !== String(tab)) {
    visitorStatsState.tabViews[String(tab)] = (visitorStatsState.tabViews[String(tab)] || 0) + 1;
  }

  activeVisitorSessions.set(sid, {
    sessionId: sid,
    visitorId: vid,
    username: username ? String(username) : existing?.username,
    fullName: displayFullName,
    role: validRole,
    studentClass: studentClass ? String(studentClass) : existing?.studentClass,
    currentTab: String(tab),
    currentTabLabel: String(tabLabel),
    currentAction: String(action),
    deviceType: String(deviceType),
    browser: String(browser),
    os: String(os),
    connectedAt: existing?.connectedAt || new Date().toISOString(),
    lastActiveAt: Date.now(),
  });

  // Đồng bộ tên người dùng vào nhật ký phiên hiện tại nếu người dùng vừa đăng nhập/nhập tên
  let logUpdated = false;
  visitorStatsState.visitLogs = visitorStatsState.visitLogs.map((log) => {
    if (log.sessionId === sid) {
      const nextName = displayFullName !== 'Khách truy cập' ? displayFullName : log.fullName;
      const nextRole = validRole !== 'guest' ? validRole : log.role;
      const nextUser = username ? String(username) : log.username;
      const nextClass = studentClass ? String(studentClass) : log.studentClass;
      if (
        nextName !== log.fullName ||
        nextRole !== log.role ||
        nextUser !== log.username ||
        nextClass !== log.studentClass ||
        String(tabLabel) !== log.tabLabel
      ) {
        logUpdated = true;
        return {
          ...log,
          fullName: nextName,
          role: nextRole,
          username: nextUser,
          studentClass: nextClass,
          tab: String(tab),
          tabLabel: String(tabLabel),
        };
      }
    }
    return log;
  });

  if (logUpdated) {
    persistVisitorStatsToFile();
  }

  const snapshot = getVisitorStatsSnapshot();
  broadcastSSE('visitor_stats_updated', snapshot);
  res.json(snapshot);
});

// 16. POST /api/analytics/leave - Ghi nhận người dùng đóng tab/rời trang
app.post('/api/analytics/leave', (req: Request, res: Response) => {
  const { sessionId } = req.body || {};
  if (sessionId && activeVisitorSessions.has(String(sessionId))) {
    activeVisitorSessions.delete(String(sessionId));
    const snapshot = getVisitorStatsSnapshot();
    broadcastSSE('visitor_stats_updated', snapshot);
    return res.json(snapshot);
  }
  res.json({ success: true });
});

// 16b. POST /api/analytics/download - Ghi nhận lượt tải tài liệu (.docx) theo thời gian thực
app.post('/api/analytics/download', (req: Request, res: Response) => {
  const {
    visitorId,
    username = 'khach',
    fullName = 'Khách truy cập',
    role = 'guest',
    studentClass = 'Tổ Công Nghệ Nông nghiệp',
    fileName = 'Tai_lieu_Cong_Nghe.docx',
    documentTitle = 'Tài liệu môn Công nghệ Nông nghiệp',
    category = 'de_thi_thpt',
    categoryLabel = 'Kho 48 Đề Thi Mẫu THPT',
    modeLabel = 'Tài liệu Word (.docx)',
    deviceType = 'Máy tính (PC/Laptop)',
    browser = 'Chrome',
    os = 'Windows',
  } = req.body || {};

  const nowIso = new Date().toISOString();
  const todayKey = getVietnamDateKey();
  const cleanUser = String(username || 'khach').trim().toLowerCase() || 'khach';
  const displayFullName = String(fullName || username || 'Khách truy cập').trim();
  const validRole: 'admin' | 'teacher' | 'student' | 'guest' =
    role === 'admin' || role === 'teacher' || role === 'student' ? role : 'guest';

  visitorStatsState.totalDownloads = (visitorStatsState.totalDownloads || 0) + 1;
  if (!visitorStatsState.dailyDownloads) visitorStatsState.dailyDownloads = {};
  visitorStatsState.dailyDownloads[todayKey] = (visitorStatsState.dailyDownloads[todayKey] || 0) + 1;

  if (!visitorStatsState.downloadsByCategory) visitorStatsState.downloadsByCategory = {};
  const catKey = String(category || 'de_thi_thpt');
  visitorStatsState.downloadsByCategory[catKey] =
    (visitorStatsState.downloadsByCategory[catKey] || 0) + 1;

  if (!visitorStatsState.downloadsByUser) visitorStatsState.downloadsByUser = {};
  const prevUserStat = visitorStatsState.downloadsByUser[cleanUser];
  visitorStatsState.downloadsByUser[cleanUser] = {
    username: cleanUser,
    fullName: displayFullName,
    role: validRole,
    count: (prevUserStat?.count || 0) + 1,
    lastDownloadAt: nowIso,
    lastFileName: String(fileName),
    lastDocumentTitle: String(documentTitle),
  };

  const newDownloadEntry: DownloadLogEntry = {
    id: `dlog_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    visitorId: String(visitorId || cleanUser),
    username: cleanUser,
    fullName: displayFullName,
    role: validRole,
    studentClass: String(studentClass || ''),
    fileName: String(fileName),
    documentTitle: String(documentTitle),
    category: catKey,
    categoryLabel: String(categoryLabel),
    modeLabel: String(modeLabel),
    deviceType: String(deviceType),
    browser: String(browser),
    os: String(os),
    timestamp: nowIso,
  };

  if (!Array.isArray(visitorStatsState.downloadLogs)) {
    visitorStatsState.downloadLogs = [];
  }
  visitorStatsState.downloadLogs = [newDownloadEntry, ...visitorStatsState.downloadLogs].slice(0, 150);

  // Đồng thời ghi vào nhật ký hoạt động chung để Admin theo dõi xuyên suốt
  const visitLogEntry: VisitLogEntry = {
    id: `vlog_dl_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    sessionId: `dl_${Date.now()}`,
    visitorId: String(visitorId || cleanUser),
    username: cleanUser !== 'khach' ? cleanUser : undefined,
    fullName: displayFullName,
    role: validRole,
    studentClass: String(studentClass || ''),
    tab: catKey === 'de_thi_thpt' ? 'exams' : 'chapter_review',
    tabLabel: String(categoryLabel),
    action: `📥 Tải tài liệu: ${documentTitle} (${modeLabel})`,
    deviceType: String(deviceType),
    browser: String(browser),
    os: String(os),
    timestamp: nowIso,
  };
  visitorStatsState.visitLogs = [visitLogEntry, ...visitorStatsState.visitLogs].slice(0, 150);

  persistVisitorStatsToFile();
  void upsertVisitorStatsToCloudSql();

  const snapshot = getVisitorStatsSnapshot();
  broadcastSSE('visitor_stats_updated', snapshot);
  res.json(snapshot);
});


// 17. GET Student QR / Link Exam Page (Self-contained HTML, bypasses Zalo/iOS WebView module cookie blocks)
const EXAMS_CATALOG_BR_FILE = path.join(DATA_DIR, 'exams-catalog.json.br');
const EXAMS_CATALOG_GZ_FILE = path.join(DATA_DIR, 'exams-catalog.json.gz');
const EXAMS_CATALOG_FILE = path.join(DATA_DIR, 'exams-catalog.json');
let builtinExamsCatalog: any[] = [];

try {
  let rawJson = '';
  if (fs.existsSync(EXAMS_CATALOG_BR_FILE)) {
    rawJson = zlib.brotliDecompressSync(fs.readFileSync(EXAMS_CATALOG_BR_FILE)).toString('utf-8');
  } else if (fs.existsSync(EXAMS_CATALOG_GZ_FILE)) {
    rawJson = zlib.gunzipSync(fs.readFileSync(EXAMS_CATALOG_GZ_FILE)).toString('utf-8');
  } else if (fs.existsSync(EXAMS_CATALOG_FILE)) {
    rawJson = fs.readFileSync(EXAMS_CATALOG_FILE, 'utf-8');
  }
  if (rawJson) {
    const parsedCatalog = JSON.parse(rawJson);
    if (Array.isArray(parsedCatalog)) {
      builtinExamsCatalog = parsedCatalog;
    }
  }
} catch (err) {
  console.warn('[ExamsCatalog] Could not load exams catalog:', err);
}

function findBuiltinExamOnServer(idOrCode?: string): any | undefined {
  if (!idOrCode || builtinExamsCatalog.length === 0) return undefined;
  const raw = String(idOrCode).trim();
  const normalized = raw.toLowerCase();
  if (!normalized) return undefined;

  const exactId = builtinExamsCatalog.find(
    (e: any) => String(e?.id || '').toLowerCase() === normalized
  );
  if (exactId) return exactId;

  const exactCode = builtinExamsCatalog.find(
    (e: any) => String(e?.code || '').toLowerCase() === normalized
  );
  if (exactCode) return exactCode;

  return undefined;
}

function hashStringSeedServer(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0 || 123456789;
}

function prepareExamForStudentOnServer(
  exam: any,
  shuffleQuestions?: boolean,
  seedKey?: string
): any {
  if (!shuffleQuestions || !exam || !Array.isArray(exam.partI) || exam.partI.length <= 1) {
    return exam;
  }
  let a = hashStringSeedServer(seedKey || `${exam.id}_${exam.code}`);
  const nextRand = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const clonedPartI = [...exam.partI];
  for (let i = clonedPartI.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    const temp = clonedPartI[i];
    clonedPartI[i] = clonedPartI[j];
    clonedPartI[j] = temp;
  }
  const renumberedPartI = clonedPartI.map((q: any, idx: number) => ({
    ...q,
    number: idx + 1,
  }));
  return {
    ...exam,
    partI: renumberedPartI,
  };
}

function escapeHtmlServer(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderStudentExamHtml(exam: any, config: Record<string, any>): string {
  const partIList = Array.isArray(exam?.partI) ? exam.partI : [];
  const partIIList = Array.isArray(exam?.partII) ? exam.partII : [];
  const partIIIList = Array.isArray(exam?.partIII) ? exam.partIII : [];
  const durationMinutes = Number(config.durationMinutes || exam?.durationMinutes || 50);
  const className = String(config.className || 'Ôn THPT').trim();
  const showSolutionsAfterSubmit = config.showSolutionsAfterSubmit !== false;
  const teacherNote = String(
    config.teacherNote || 'Yêu cầu các em làm bài nghiêm túc, không sử dụng tài liệu.'
  ).trim();

  const teacherUsername = String(config.teacherUsername || '').trim();
  const teacherName = String(config.teacherName || '').trim();

  // Loại bỏ attachedFileDataUrl để trang thi trên điện thoại tải nhanh, giữ nguyên 100% ảnh, bảng, biểu đồ và Phần III
  const { attachedFileDataUrl: _omitPdfBlob, ...cleanExam } = exam || {};

  const safePayload = JSON.stringify({
    exam: {
      ...cleanExam,
      partI: partIList,
      partII: partIIList,
      partIII: partIIIList,
    },
    config: {
      examId: exam?.id || 'de-chuan-01',
      examCode: exam?.code || '101',
      className,
      durationMinutes,
      shuffleQuestions: Boolean(config.shuffleQuestions),
      showSolutionsAfterSubmit,
      teacherNote,
      teacherUsername,
      teacherName,
    },
  }).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
  <meta name="theme-color" content="#047857" />
  <title>Mã đề ${escapeHtmlServer(exam?.code || '101')} - ${escapeHtmlServer(exam?.title || 'Đề thi Công nghệ Nông nghiệp')}</title>
  <style>
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body {
      margin: 0;
      padding: 0;
      background: #f1f5f9;
      color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      padding-bottom: 96px;
    }
    .sticky-header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: linear-gradient(135deg, #064e3b 0%, #047857 100%);
      color: #ffffff;
      box-shadow: 0 4px 16px rgba(6, 78, 59, 0.22);
      border-bottom: 2px solid #10b981;
    }
    .header-inner {
      max-width: 920px;
      margin: 0 auto;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
    }
    .badge-code {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #fde68a;
      color: #78350f;
      font-weight: 800;
      font-size: 13px;
      padding: 4px 10px;
      border-radius: 999px;
    }
    .timer-box {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #ffffff;
      font-weight: 800;
      font-size: 15px;
      padding: 5px 12px;
      border-radius: 12px;
      font-variant-numeric: tabular-nums;
    }
    .timer-box.urgent {
      background: #dc2626;
      border-color: #fca5a5;
    }
    .btn-top-submit {
      background: #10b981;
      color: #ffffff;
      border: 1px solid #6ee7b7;
      font-weight: 800;
      font-size: 13px;
      padding: 7px 14px;
      border-radius: 10px;
      cursor: pointer;
    }
    .btn-top-submit:active { transform: scale(0.98); }
    .container {
      max-width: 920px;
      margin: 0 auto;
      padding: 14px 12px;
    }
    .card {
      background: #ffffff;
      border-radius: 18px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
      padding: 16px;
      margin-bottom: 14px;
    }
    .exam-banner {
      background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
      border: 2px solid #6ee7b7;
    }
    .exam-title {
      margin: 6px 0 4px;
      font-size: 18px;
      font-weight: 800;
      color: #064e3b;
    }
    .exam-meta {
      font-size: 13px;
      color: #047857;
      font-weight: 600;
    }
    .teacher-note {
      margin-top: 10px;
      padding: 10px 12px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 12px;
      font-size: 13px;
      color: #92400e;
      font-weight: 600;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }
    @media (min-width: 640px) {
      .form-grid { grid-template-columns: 1.4fr 1fr 0.8fr; }
    }
    .field-label {
      display: block;
      font-size: 12px;
      font-weight: 800;
      color: #334155;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    .input-box {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #cbd5e1;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      color: #0f172a;
      background: #f8fafc;
      outline: none;
    }
    .input-box:focus {
      border-color: #059669;
      background: #ffffff;
    }
    .class-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }
    .class-pill {
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      color: #475569;
      cursor: pointer;
    }
    .class-pill.active {
      background: #059669;
      color: #ffffff;
      border-color: #059669;
    }
    .palette-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }
    .palette-btn {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      border: 1.5px solid #cbd5e1;
      background: #f8fafc;
      color: #334155;
      font-weight: 800;
      font-size: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .palette-btn.done {
      background: #059669;
      color: #ffffff;
      border-color: #059669;
    }
    .palette-btn.correct {
      background: #10b981;
      color: #ffffff;
      border-color: #059669;
    }
    .palette-btn.wrong {
      background: #ef4444;
      color: #ffffff;
      border-color: #dc2626;
    }
    .section-banner {
      background: #064e3b;
      color: #ffffff;
      padding: 12px 16px;
      border-radius: 14px;
      margin: 18px 0 12px;
    }
    .section-banner h2 {
      margin: 0;
      font-size: 15px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .section-banner p {
      margin: 4px 0 0;
      font-size: 12px;
      color: #a7f3d0;
    }
    .q-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }
    .q-num {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #059669;
      color: #ffffff;
      font-weight: 800;
      font-size: 13px;
      padding: 4px 11px;
      border-radius: 9px;
    }
    .q-topic {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      background: #f1f5f9;
      padding: 3px 9px;
      border-radius: 999px;
      border: 1px solid #e2e8f0;
    }
    .q-stem {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
      white-space: pre-line;
    }
    .sub-statements {
      background: #f8fafc;
      border-left: 3px solid #10b981;
      padding: 10px 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      font-size: 14px;
      color: #1e293b;
    }
    .sub-statements div { margin-bottom: 4px; }
    .options-list {
      display: grid;
      grid-template-columns: 1fr;
      gap: 9px;
    }
    .opt-btn {
      width: 100%;
      text-align: left;
      padding: 11px 13px;
      border-radius: 13px;
      border: 2px solid #e2e8f0;
      background: #f8fafc;
      color: #1e293b;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      transition: all 0.12s ease;
    }
    .opt-letter {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: #e2e8f0;
      color: #334155;
      font-weight: 800;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .opt-btn.selected {
      border-color: #059669;
      background: #ecfdf5;
      color: #064e3b;
    }
    .opt-btn.selected .opt-letter {
      background: #059669;
      color: #ffffff;
    }
    .opt-btn.correct-ans {
      border-color: #10b981;
      background: #d1fae5;
      color: #064e3b;
    }
    .opt-btn.correct-ans .opt-letter {
      background: #059669;
      color: #ffffff;
    }
    .opt-btn.wrong-ans {
      border-color: #ef4444;
      background: #fee2e2;
      color: #7f1d1d;
    }
    .opt-btn.wrong-ans .opt-letter {
      background: #dc2626;
      color: #ffffff;
    }
    .scenario-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 13px;
      padding: 12px 14px;
      margin-bottom: 12px;
      font-size: 14px;
      color: #1e293b;
    }
    .scenario-title {
      font-weight: 800;
      color: #065f46;
      margin-bottom: 6px;
      font-size: 14px;
    }
    .media-images-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
      margin: 10px 0 12px;
    }
    .media-images-grid.multi {
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }
    .media-image-box {
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      background: #ffffff;
      padding: 8px;
      text-align: center;
      overflow: hidden;
    }
    .media-image-box img {
      max-width: 100%;
      max-height: 360px;
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 8px;
      display: block;
      margin: 0 auto;
      cursor: zoom-in;
    }
    .media-image-hint {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    .doc-table-card {
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      background: #ffffff;
      overflow: hidden;
      margin: 10px 0 12px;
    }
    .doc-table-caption {
      padding: 7px 11px;
      background: #f1f5f9;
      border-bottom: 1px solid #cbd5e1;
      font-size: 12px;
      font-weight: 800;
      color: #1e293b;
    }
    .doc-table-footer {
      padding: 6px 11px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #475569;
      font-style: italic;
    }
    .data-table-wrap {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      width: 100%;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
      background: #ffffff;
      color: #1e293b;
    }
    .data-table th, .data-table td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      vertical-align: middle;
      word-break: break-word;
      white-space: pre-line;
      line-height: 1.35;
    }
    .data-table th {
      background: #ecfdf5;
      color: #065f46;
      font-weight: 800;
      text-align: center;
    }
    .data-table tr.zebra {
      background: #f8fafc;
    }
    .doc-chart-card {
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      background: #ffffff;
      overflow: hidden;
      margin: 10px 0 12px;
    }
    .doc-chart-header {
      padding: 8px 11px;
      background: #f1f5f9;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
    }
    .doc-chart-title {
      font-size: 12.5px;
      font-weight: 800;
      color: #1e293b;
    }
    .doc-chart-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .doc-chart-unit {
      font-size: 11px;
      font-weight: 700;
      color: #065f46;
      background: #d1fae5;
      border: 1px solid #a7f3d0;
      padding: 2px 7px;
      border-radius: 6px;
    }
    .doc-chart-toggle {
      font-size: 11px;
      font-weight: 700;
      color: #334155;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 3px 8px;
      border-radius: 6px;
      cursor: pointer;
    }
    .doc-chart-body {
      padding: 12px;
    }
    .doc-chart-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 12px;
      font-weight: 600;
      color: #334155;
    }
    .doc-chart-legend-item {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .doc-chart-swatch {
      width: 11px;
      height: 11px;
      border-radius: 3px;
      display: inline-block;
      flex-shrink: 0;
    }
    .hbar-row { margin-bottom: 10px; }
    .hbar-row:last-child { margin-bottom: 0; }
    .hbar-head {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .hbar-label { font-weight: 700; color: #1e293b; }
    .hbar-val { font-weight: 800; color: #065f46; font-family: ui-monospace, monospace; white-space: nowrap; }
    .hbar-track {
      height: 22px;
      width: 100%;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      padding: 2px;
      overflow: hidden;
    }
    .hbar-fill {
      height: 100%;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 6px;
      font-size: 11px;
      font-weight: 800;
      color: #ffffff;
      font-family: ui-monospace, monospace;
    }
    .pie-wrap {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 14px;
    }
    .pie-legend {
      flex: 1;
      min-width: 180px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 12px;
    }
    .pie-legend-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 5px 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
    }
    .sa-textarea {
      width: 100%;
      min-height: 76px;
      padding: 10px 12px;
      border: 2px solid #cbd5e1;
      border-radius: 12px;
      font-size: 14px;
      font-family: inherit;
      color: #0f172a;
      background: #f8fafc;
      outline: none;
      resize: vertical;
    }
    .sa-textarea:focus {
      border-color: #0284c7;
      background: #ffffff;
    }
    .img-lightbox {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.88);
      display: none;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 10px;
      z-index: 200;
      padding: 16px;
    }
    .img-lightbox.open { display: flex; }
    .img-lightbox img {
      max-width: 96vw;
      max-height: 82vh;
      object-fit: contain;
      border-radius: 10px;
      background: #ffffff;
      padding: 6px;
    }
    .img-lightbox-close {
      padding: 8px 18px;
      border-radius: 10px;
      border: none;
      background: #ffffff;
      color: #0f172a;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
    }
    .tf-row {
      border: 1.5px solid #e2e8f0;
      border-radius: 13px;
      padding: 11px 12px;
      margin-bottom: 9px;
      background: #ffffff;
    }
    .tf-row.answered {
      border-color: #a7f3d0;
      background: #f8fafc;
    }
    .tf-text {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 9px;
    }
    .tf-actions {
      display: flex;
      gap: 8px;
    }
    .tf-btn {
      flex: 1;
      padding: 8px 12px;
      border-radius: 10px;
      border: 2px solid #cbd5e1;
      background: #f8fafc;
      color: #334155;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
    }
    .tf-btn.selected-true {
      border-color: #059669;
      background: #059669;
      color: #ffffff;
    }
    .tf-btn.selected-false {
      border-color: #d97706;
      background: #d97706;
      color: #ffffff;
    }
    .explanation-box {
      margin-top: 10px;
      padding: 10px 12px;
      border-radius: 11px;
      background: #ecfdf5;
      border: 1px solid #6ee7b7;
      font-size: 13px;
      color: #065f46;
    }
    .bottom-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 50;
      background: #ffffff;
      border-top: 2px solid #cbd5e1;
      padding: 10px 14px;
      box-shadow: 0 -4px 16px rgba(15, 23, 42, 0.08);
    }
    .bottom-inner {
      max-width: 920px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .btn-submit-main {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: #ffffff;
      border: none;
      padding: 11px 20px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 15px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
    }
    .result-card {
      background: linear-gradient(135deg, #064e3b 0%, #047857 100%);
      color: #ffffff;
      border-radius: 20px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 10px 25px rgba(6, 78, 59, 0.25);
    }
    .score-big {
      font-size: 42px;
      font-weight: 900;
      color: #fde68a;
      line-height: 1.1;
    }
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 16px;
    }
    .modal-backdrop.open { display: flex; }
    .modal-box {
      background: #ffffff;
      border-radius: 20px;
      max-width: 420px;
      width: 100%;
      padding: 20px;
      box-shadow: 0 20px 35px rgba(15, 23, 42, 0.25);
    }
    .error-toast {
      display: none;
      background: #fef2f2;
      border: 2px solid #ef4444;
      color: #991b1b;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      margin-top: 10px;
    }
    .badge-violation {
      display: none;
      align-items: center;
      gap: 4px;
      background: #fee2e2;
      color: #991b1b;
      border: 1.5px solid #f87171;
      font-weight: 800;
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 999px;
      cursor: pointer;
    }
    .btn-header-exit {
      background: rgba(255, 255, 255, 0.14);
      color: #ecfdf5;
      border: 1px solid rgba(255, 255, 255, 0.3);
      font-weight: 700;
      font-size: 12px;
      padding: 5px 10px;
      border-radius: 9px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="sticky-header">
    <div class="header-inner">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <button type="button" id="headerExitBtn" class="btn-header-exit" onclick="triggerViolation('Nhấn nút thoát khỏi giao diện làm bài thi')">← Rời thi</button>
        <span class="badge-code">MÃ ĐỀ: ${escapeHtmlServer(exam?.code || '101')}</span>
        <span id="progressText" style="font-size:12px;font-weight:700;color:#d1fae5;">Đã làm: 0/${partIList.length} TN · 0/${partIIList.length * 4} Đ/S${partIIIList.length > 0 ? ` · 0/${partIIIList.length} Phần III` : ''}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <button type="button" id="violationBadge" class="badge-violation" onclick="openViolationModal()">⚠️ Thoát: <span id="violationBadgeCount">0/5</span></button>
        <div id="timerBox" class="timer-box">⏱ <span id="timerDisplay">${String(durationMinutes).padStart(2, '0')}:00</span></div>
        <button type="button" id="topSubmitBtn" class="btn-top-submit" onclick="openSubmitModal()">Nộp Bài</button>
      </div>
    </div>
  </div>

  <div class="container">
    <div id="resultSection" style="display:none;"></div>

    <div class="card exam-banner">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
        <span style="font-size:11px;font-weight:800;color:#047857;background:#d1fae5;padding:3px 9px;border-radius:999px;">
          MÔN CÔNG NGHỆ NÔNG NGHIỆP THPT · GDPT 2018
        </span>
        <span style="font-size:12px;font-weight:700;color:#065f46;">
          Lớp: <strong id="bannerClassLabel">${escapeHtmlServer(className)}</strong> · ${durationMinutes} phút
        </span>
      </div>
      <h1 class="exam-title">${escapeHtmlServer(exam?.title || 'Đề Thi Công Nghệ Nông Nghiệp THPT')}</h1>
      <div class="exam-meta">
        Cấu trúc đề: ${partIList.length} câu Trắc nghiệm 4 lựa chọn &amp; ${partIIList.length} câu Đúng/Sai (${partIIList.length * 4} ý)${partIIIList.length > 0 ? ` &amp; ${partIIIList.length} câu Trả lời ngắn / Tự luận` : ''}
      </div>
      ${
        teacherUsername || teacherName
          ? `<div style="margin-top:8px;font-size:12px;font-weight:700;color:#065f46;background:#d1fae5;padding:6px 10px;border-radius:10px;display:inline-block;">👨‍🏫 Giáo viên giao bài: <strong>${escapeHtmlServer(
              teacherName ? `${teacherName} (@${teacherUsername})` : `@${teacherUsername}`
            )}</strong> · Kết quả tự động đồng bộ về Bảng điểm của tài khoản</div>`
          : ''
      }
      ${
        teacherNote
          ? `<div class="teacher-note">💬 <strong>Lời dặn của Giáo viên:</strong> ${escapeHtmlServer(teacherNote)}</div>`
          : ''
      }
    </div>

    <div class="card" id="studentInfoCard">
      <div style="font-size:14px;font-weight:800;color:#064e3b;margin-bottom:10px;">
        👤 THÔNG TIN HỌC SINH LÀM BÀI
      </div>
      <div class="form-grid">
        <div>
          <label class="field-label" for="studentNameInput">Họ và tên Học sinh *</label>
          <input id="studentNameInput" type="text" class="input-box" placeholder="Nhập họ và tên (VD: Nguyễn Văn An)" autocomplete="name" />
        </div>
        <div>
          <label class="field-label" for="studentClassInput">Lớp *</label>
          <input id="studentClassInput" type="text" class="input-box" value="${escapeHtmlServer(className)}" placeholder="VD: 12A1" />
          <div class="class-pills">
            ${['Ôn THPT', '12A1', '12A2', '12A3', '11A1', '10A1']
              .map(
                (cls) =>
                  `<button type="button" class="class-pill ${cls === className ? 'active' : ''}" onclick="selectQuickClass('${cls}', this)">${cls}</button>`
              )
              .join('')}
          </div>
        </div>
        <div>
          <label class="field-label" for="studentIdInput">Số báo danh / Mã HS</label>
          <input id="studentIdInput" type="text" class="input-box" placeholder="Tùy chọn (VD: 1201)" />
        </div>
      </div>
      <div id="nameErrorBox" class="error-toast">
        ⚠️ Vui lòng nhập Họ và tên học sinh trước khi nộp bài!
      </div>
    </div>

    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">
        <span style="font-size:12px;font-weight:800;color:#334155;text-transform:uppercase;">
          📌 Danh sách câu hỏi (Chạm số câu để chuyển nhanh)
        </span>
        <span style="font-size:11px;color:#64748b;font-weight:600;">
          Màu xanh = Đã chọn đáp án
        </span>
      </div>
      <div id="paletteContainer" class="palette-grid"></div>
    </div>

    <div id="questionsRoot"></div>
  </div>

  <div class="bottom-bar" id="bottomBar">
    <div class="bottom-inner">
      <div>
        <div style="font-size:13px;font-weight:800;color:#0f172a;" id="bottomStatusTitle">
          Tiến độ: 0/${partIList.length} câu TN · 0/${partIIList.length * 4} ý Đ/S${partIIIList.length > 0 ? ` · 0/${partIIIList.length} Phần III` : ''}
        </div>
        <div style="font-size:11px;color:#64748b;font-weight:600;">
          Điểm số sẽ tự động gửi về Bảng Điểm của Giáo viên khi nộp bài
        </div>
      </div>
      <button type="button" class="btn-submit-main" onclick="openSubmitModal()">
        ✅ Nộp Bài &amp; Chấm Điểm
      </button>
    </div>
  </div>

  <div id="submitModal" class="modal-backdrop">
    <div class="modal-box">
      <h3 style="margin:0 0 8px;font-size:18px;font-weight:800;color:#064e3b;">
        Xác nhận nộp bài thi?
      </h3>
      <p id="modalSummaryText" style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.5;"></p>
      <div style="display:flex;gap:10px;justify-content:flex-end;">
        <button type="button" onclick="closeSubmitModal()" style="padding:10px 16px;border-radius:11px;border:1.5px solid #cbd5e1;background:#f8fafc;color:#334155;font-weight:700;cursor:pointer;">
          Kiểm tra lại
        </button>
        <button type="button" onclick="confirmSubmitExam()" style="padding:10px 18px;border-radius:11px;border:none;background:#059669;color:#ffffff;font-weight:800;cursor:pointer;">
          Nộp Bài Ngay
        </button>
      </div>
    </div>
  </div>

  <div id="violationModal" class="modal-backdrop">
    <div class="modal-box" style="border:3px solid #dc2626;text-align:center;">
      <div id="violationBadgeModal" style="display:inline-block;padding:4px 12px;border-radius:999px;background:#fee2e2;color:#991b1b;font-weight:800;font-size:12px;border:1px solid #f87171;margin-bottom:10px;">
        🚨 CẢNH BÁO THOÁT GIAO DIỆN LẦN 1/5
      </div>
      <h3 id="violationTitleText" style="margin:0 0 8px;font-size:20px;font-weight:900;color:#b91c1c;text-transform:uppercase;">
        CẢNH BÁO: QUAY LẠI LÀM BÀI NGAY!
      </h3>
      <p id="violationReasonText" style="margin:0 0 12px;font-size:14px;color:#334155;line-height:1.5;"></p>
      <div id="violationRuleBox" style="background:#fef2f2;border:1.5px solid #fca5a5;border-radius:14px;padding:12px;text-align:left;font-size:13px;color:#7f1d1d;margin-bottom:16px;line-height:1.5;">
        <div style="margin-bottom:6px;"><strong>⚠️ YÊU CẦU:</strong> Học sinh <strong>QUAY LẠI LÀM BÀI NGAY!</strong> Tuyệt đối không thoát khỏi giao diện làm bài, chuyển tab hoặc mở ứng dụng khác.</div>
        <div><strong>🚨 QUY ĐỊNH THU BÀI:</strong> Thoát khỏi giao diện làm bài đủ <strong>5 lần</strong> hệ thống sẽ <strong>TỰ ĐỘNG THU BÀI</strong> ngay lập tức!</div>
      </div>
      <button type="button" id="violationActionBtn" onclick="closeViolationModal()" style="width:100%;padding:13px 18px;border-radius:13px;border:none;background:#dc2626;color:#ffffff;font-weight:900;font-size:15px;cursor:pointer;box-shadow:0 6px 16px rgba(220,38,38,0.35);">
        ⚡ Tôi Đã Hiểu &amp; Quay Lại Làm Bài Ngay
      </button>
    </div>
  </div>

  <div id="imgLightbox" class="img-lightbox" onclick="closeImageLightbox()">
    <img id="imgLightboxPic" src="" alt="Phóng to hình ảnh" onclick="event.stopPropagation()" />
    <div id="imgLightboxCaption" style="color:#e2e8f0;font-size:13px;font-weight:700;text-align:center;"></div>
    <button type="button" class="img-lightbox-close" onclick="closeImageLightbox()">✕ Đóng ảnh</button>
  </div>

  <script id="exam-payload" type="application/json">${safePayload}</script>
  <script>
    (function() {
      var payloadEl = document.getElementById('exam-payload');
      var payload = JSON.parse(payloadEl.textContent || '{}');
      var exam = payload.exam || {};
      exam.partI = Array.isArray(exam.partI) ? exam.partI : [];
      exam.partII = Array.isArray(exam.partII) ? exam.partII : [];
      exam.partIII = Array.isArray(exam.partIII) ? exam.partIII : [];
      var config = payload.config || {};

      var answersPartI = {};
      var answersPartII = {};
      var answersPartIII = {};
      for (var i = 0; i < exam.partII.length; i++) {
        var q = exam.partII[i];
        answersPartII[q.id] = { a: null, b: null, c: null, d: null };
      }

      var isSubmitted = false;
      var totalSeconds = (Number(config.durationMinutes) || 50) * 60;
      var remainingSeconds = totalSeconds;
      var timerInterval = null;
      var MAX_VIOLATIONS = 5;
      var violationCount = 0;
      var lastViolationTime = 0;
      var isAutoCollectedBySystem = false;

      try {
        var savedName = localStorage.getItem('student_qr_name') || '';
        var savedClass = config.className || localStorage.getItem('student_qr_class') || 'Ôn THPT';
        var savedId = localStorage.getItem('student_qr_id') || '';
        if (savedName) document.getElementById('studentNameInput').value = savedName;
        if (savedClass) document.getElementById('studentClassInput').value = savedClass;
        if (savedId) document.getElementById('studentIdInput').value = savedId;
      } catch (e) {}

      function esc(str) {
        return String(str === null || str === undefined ? '' : str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function isSafeImgSrc(src) {
        if (typeof src !== 'string') return false;
        var s = src.trim();
        if (!s) return false;
        return /^data:image\\/[a-zA-Z0-9.+-]+;base64,/i.test(s) || /^https?:\\/\\//i.test(s) || s.indexOf('/') === 0;
      }

      var CHART_PALETTE = ['#059669', '#0284c7', '#d97706', '#7c3aed', '#e11d48', '#0d9488', '#475569', '#ea580c'];
      var chartRenderSeq = 0;

      function formatChartNum(val, display) {
        if (display !== undefined && display !== null && String(display).trim().length > 0) {
          return String(display).trim();
        }
        if (val === null || val === undefined || !isFinite(Number(val))) return '—';
        var n = Number(val);
        if (Math.floor(n) === n) return String(n);
        return String(Number(n.toFixed(4))).replace('.', ',');
      }

      function polarToCartesian(cx, cy, r, angleDeg) {
        var rad = ((angleDeg - 90) * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
      }

      function describePieSlice(cx, cy, r, startAngle, endAngle) {
        var span = Math.min(359.99, Math.max(0.01, endAngle - startAngle));
        var start = polarToCartesian(cx, cy, r, startAngle + span);
        var end = polarToCartesian(cx, cy, r, startAngle);
        var largeArc = span > 180 ? 1 : 0;
        return 'M ' + cx + ' ' + cy + ' L ' + end.x.toFixed(2) + ' ' + end.y.toFixed(2) + ' A ' + r + ' ' + r + ' 0 ' + largeArc + ' 1 ' + start.x.toFixed(2) + ' ' + start.y.toFixed(2) + ' Z';
      }

      window.openImageLightbox = function(imgEl) {
        try {
          var src = imgEl && imgEl.getAttribute('src');
          var alt = (imgEl && imgEl.getAttribute('alt')) || '';
          if (!src || !isSafeImgSrc(src)) return;
          document.getElementById('imgLightboxPic').src = src;
          document.getElementById('imgLightboxCaption').textContent = alt;
          document.getElementById('imgLightbox').classList.add('open');
        } catch (e) {}
      };

      window.closeImageLightbox = function() {
        var el = document.getElementById('imgLightbox');
        if (el) el.classList.remove('open');
      };

      window.toggleChartRawTable = function(tableId, btnEl) {
        var el = document.getElementById(tableId);
        if (!el) return;
        var isHidden = el.style.display === 'none' || !el.style.display;
        el.style.display = isHidden ? 'block' : 'none';
        if (btnEl) btnEl.textContent = isHidden ? 'Ẩn bảng số liệu' : 'Số liệu gốc';
      };

      function renderImagesListHtml(imgList, altPrefix) {
        var valid = [];
        var seen = {};
        for (var i = 0; i < imgList.length; i++) {
          var s = imgList[i];
          if (isSafeImgSrc(s) && !seen[s]) {
            seen[s] = true;
            valid.push(s);
          }
        }
        if (valid.length === 0) return '';
        var html = '<div class="media-images-grid' + (valid.length > 1 ? ' multi' : '') + '">';
        for (var k = 0; k < valid.length; k++) {
          var altText = altPrefix + (valid.length > 1 ? ' (' + (k + 1) + ')' : '');
          html += '<div class="media-image-box">' +
            '<img src="' + esc(valid[k]) + '" alt="' + esc(altText) + '" loading="lazy" onclick="openImageLightbox(this)" />' +
            '<div class="media-image-hint">🔍 Chạm vào ảnh để phóng to</div>' +
          '</div>';
        }
        html += '</div>';
        return html;
      }

      function renderItemImagesHtml(item, altPrefix) {
        if (!item) return '';
        var list = [];
        if (Array.isArray(item.images) && item.images.length > 0) {
          list = item.images;
        } else if (item.imageUrl) {
          list = [item.imageUrl];
        }
        return renderImagesListHtml(list, altPrefix);
      }

      function renderStructuredTableHtml(tbl) {
        if (!tbl || typeof tbl !== 'object') return '';
        var headers = Array.isArray(tbl.headers) ? tbl.headers : [];
        var rows = Array.isArray(tbl.rows) ? tbl.rows : [];
        var structuredRows = Array.isArray(tbl.structuredRows) && tbl.structuredRows.length > 0 ? tbl.structuredRows : null;
        if (!structuredRows && headers.length === 0 && rows.length === 0) return '';

        var colWidths = Array.isArray(tbl.colWidths) ? tbl.colWidths : [];
        var alignments = Array.isArray(tbl.alignments) ? tbl.alignments : [];
        var colCount = Math.max(headers.length, colWidths.length, rows[0] ? rows[0].length : 0, 1);
        var minWidthStyle = colCount >= 5 ? ' style="min-width:' + (colCount * 96) + 'px;"' : '';

        var html = '<div class="doc-table-card">';
        if (tbl.caption) {
          html += '<div class="doc-table-caption">📊 ' + esc(tbl.caption) + '</div>';
        }
        html += '<div class="data-table-wrap"><table class="data-table"' + minWidthStyle + '>';
        if (colWidths.length > 0) {
          html += '<colgroup>';
          for (var cw = 0; cw < colWidths.length; cw++) {
            html += '<col style="width:' + Number(colWidths[cw] || 0) + '%" />';
          }
          html += '</colgroup>';
        }

        if (structuredRows) {
          html += '<tbody>';
          for (var r = 0; r < structuredRows.length; r++) {
            var sRow = structuredRows[r] || {};
            var isHRow = Boolean(sRow.isHeader) || r === 0;
            var cells = Array.isArray(sRow.cells) ? sRow.cells : [];
            html += '<tr class="' + (!isHRow && r % 2 === 0 ? 'zebra' : '') + '">';
            for (var c = 0; c < cells.length; c++) {
              var cell = cells[c] || {};
              var isTh = isHRow || Boolean(cell.isHeader);
              var tag = isTh ? 'th' : 'td';
              var align = cell.align || (isTh ? 'center' : (alignments[c] || (c === 0 ? 'left' : 'center')));
              var attrs = ' style="text-align:' + esc(align) + ';' + (!isTh && c === 0 && align === 'left' ? 'font-weight:700;' : '') + '"';
              if (cell.colSpan && cell.colSpan > 1) attrs += ' colspan="' + Number(cell.colSpan) + '"';
              if (cell.rowSpan && cell.rowSpan > 1) attrs += ' rowspan="' + Number(cell.rowSpan) + '"';
              html += '<' + tag + attrs + '>' + esc(cell.text) + '</' + tag + '>';
            }
            html += '</tr>';
          }
          html += '</tbody>';
        } else {
          if (headers.length > 0) {
            html += '<thead><tr>';
            for (var h = 0; h < headers.length; h++) {
              html += '<th>' + esc(headers[h]) + '</th>';
            }
            html += '</tr></thead>';
          }
          html += '<tbody>';
          for (var ri = 0; ri < rows.length; ri++) {
            var row = Array.isArray(rows[ri]) ? rows[ri] : [];
            html += '<tr class="' + (ri % 2 === 1 ? 'zebra' : '') + '">';
            for (var ci = 0; ci < row.length; ci++) {
              var cAlign = alignments[ci] || (ci === 0 ? 'left' : 'center');
              var cStyle = 'text-align:' + esc(cAlign) + ';' + (ci === 0 && cAlign === 'left' ? 'font-weight:700;' : '');
              html += '<td style="' + cStyle + '">' + esc(row[ci]) + '</td>';
            }
            html += '</tr>';
          }
          html += '</tbody>';
        }

        html += '</table></div>';
        if (tbl.source || tbl.note) {
          html += '<div class="doc-table-footer">';
          if (tbl.source) html += '<div style="text-align:right;font-weight:600;">' + esc(tbl.source) + '</div>';
          if (tbl.note) html += '<div>' + esc(tbl.note) + '</div>';
          html += '</div>';
        }
        html += '</div>';
        return html;
      }

      function renderStructuredChartHtml(ch) {
        if (!ch || typeof ch !== 'object') return '';
        var unit = String(ch.unit || '').trim();
        var categories = [];
        if (Array.isArray(ch.categories) && ch.categories.length > 0) {
          categories = ch.categories.map(function(c) { return String(c === null || c === undefined ? '' : c); });
        } else if (Array.isArray(ch.items) && ch.items.length > 0) {
          categories = ch.items.map(function(it) { return String((it && it.label) || ''); });
        }

        var series = [];
        if (Array.isArray(ch.series) && ch.series.length > 0) {
          for (var si = 0; si < ch.series.length; si++) {
            var sObj = ch.series[si] || {};
            series.push({
              name: String(sObj.name || ('Chuỗi ' + (si + 1))),
              values: Array.isArray(sObj.values) ? sObj.values : [],
              displayValues: Array.isArray(sObj.displayValues) ? sObj.displayValues : null,
              color: sObj.color || CHART_PALETTE[si % CHART_PALETTE.length]
            });
          }
        } else if (Array.isArray(ch.items) && ch.items.length > 0) {
          series.push({
            name: unit ? ('Giá trị (' + unit + ')') : 'Giá trị',
            values: ch.items.map(function(it) { return isFinite(Number(it && it.value)) ? Number(it.value) : 0; }),
            displayValues: ch.items.map(function(it) {
              return (it && it.displayValue !== undefined) ? String(it.displayValue) : formatChartNum(it && it.value);
            }),
            color: CHART_PALETTE[0]
          });
        }

        if (categories.length === 0 || series.length === 0) return '';

        var allNums = [];
        for (var a = 0; a < series.length; a++) {
          for (var b = 0; b < series[a].values.length; b++) {
            var v = series[a].values[b];
            if (typeof v === 'number' && isFinite(v)) allNums.push(v);
          }
        }
        var maxVal = allNums.length > 0 ? Math.max.apply(null, allNums.concat([0])) : 1;
        var minVal = allNums.length > 0 ? Math.min.apply(null, allNums.concat([0])) : 0;
        if (maxVal === minVal) maxVal = minVal + 1;
        minVal = Math.min(0, minVal);

        var isMultiSeries = series.length > 1;
        var chartType = ch.type || 'column';
        var isHorizontalSingleBar = chartType === 'bar' && !isMultiSeries && Array.isArray(ch.items) && ch.items.length > 0;
        chartRenderSeq++;
        var rawTblId = 'chart-raw-tbl-' + chartRenderSeq;

        var html = '<div class="doc-chart-card">';
        html += '<div class="doc-chart-header">' +
          '<span class="doc-chart-title">📈 ' + esc(ch.caption || 'Biểu đồ dữ liệu thực nghiệm') + '</span>' +
          '<div class="doc-chart-actions">' +
            (unit ? '<span class="doc-chart-unit">Đơn vị: ' + esc(unit) + '</span>' : '') +
            '<button type="button" class="doc-chart-toggle" onclick="toggleChartRawTable(\\'' + rawTblId + '\\', this)">Số liệu gốc</button>' +
          '</div>' +
        '</div>';

        html += '<div class="doc-chart-body">';
        if (isMultiSeries && chartType !== 'pie') {
          html += '<div class="doc-chart-legend">';
          for (var li = 0; li < series.length; li++) {
            html += '<span class="doc-chart-legend-item"><span class="doc-chart-swatch" style="background:' + esc(series[li].color) + ';"></span><span>' + esc(series[li].name) + '</span></span>';
          }
          html += '</div>';
        }

        if (isHorizontalSingleBar) {
          var maxAbs = 0.1;
          for (var hi = 0; hi < ch.items.length; hi++) {
            var hv = Math.abs(Number(ch.items[hi].value) || 0);
            if (hv > maxAbs) maxAbs = hv;
          }
          for (var hi2 = 0; hi2 < ch.items.length; hi2++) {
            var item = ch.items[hi2];
            var pct = Math.min(100, Math.max(12, (Math.abs(Number(item.value) || 0) / (maxAbs * 1.12)) * 100));
            var lblVal = formatChartNum(item.value, item.displayValue);
            var barBg = item.highlight ? 'linear-gradient(90deg,#059669,#14b8a6)' : 'linear-gradient(90deg,#475569,#64748b)';
            html += '<div class="hbar-row">' +
              '<div class="hbar-head"><span class="hbar-label">' + esc(item.label) + '</span><span class="hbar-val">' + esc(lblVal) + (unit ? ' ' + esc(unit) : '') + '</span></div>' +
              '<div class="hbar-track"><div class="hbar-fill" style="width:' + pct.toFixed(1) + '%;background:' + barBg + ';">' + esc(lblVal) + '</div></div>' +
              (item.subLabel ? '<div style="font-size:11px;color:#64748b;font-style:italic;margin-top:2px;">' + esc(item.subLabel) + '</div>' : '') +
            '</div>';
          }
        } else if (chartType === 'pie') {
          var firstS = series[0];
          var slices = [];
          var pieTotal = 0;
          for (var pi = 0; pi < categories.length; pi++) {
            var rv = firstS.values[pi];
            var pv = (typeof rv === 'number' && isFinite(rv) && rv > 0) ? rv : 0;
            pieTotal += pv;
            slices.push({
              label: categories[pi],
              value: pv,
              display: formatChartNum(rv, firstS.displayValues && firstS.displayValues[pi]),
              color: CHART_PALETTE[pi % CHART_PALETTE.length]
            });
          }
          if (pieTotal <= 0) pieTotal = 1;
          var curAngle = 0;
          var paths = '';
          var legRows = '';
          for (var pi2 = 0; pi2 < slices.length; pi2++) {
            var sl = slices[pi2];
            var ang = (sl.value / pieTotal) * 360;
            if (sl.value > 0) {
              paths += '<path d="' + describePieSlice(100, 100, 86, curAngle, curAngle + ang) + '" fill="' + esc(sl.color) + '" stroke="#ffffff" stroke-width="1.8" />';
            }
            curAngle += ang;
            var pPct = ((sl.value / pieTotal) * 100).toFixed(1).replace('.', ',');
            legRows += '<div class="pie-legend-row">' +
              '<span style="display:inline-flex;align-items:center;gap:6px;font-weight:700;color:#1e293b;"><span class="doc-chart-swatch" style="background:' + esc(sl.color) + ';"></span><span>' + esc(sl.label) + '</span></span>' +
              '<span style="font-family:ui-monospace,monospace;font-weight:800;color:#0f172a;white-space:nowrap;">' + esc(sl.display) + (unit ? ' ' + esc(unit) : '') + ' (' + pPct + '%)</span>' +
            '</div>';
          }
          html += '<div class="pie-wrap">' +
            '<svg viewBox="0 0 200 200" style="width:168px;height:168px;flex-shrink:0;" role="img">' + paths + '</svg>' +
            '<div class="pie-legend">' + legRows + '</div>' +
          '</div>';
        } else if (chartType === 'line' || chartType === 'area') {
          var catCountL = categories.length;
          var svgWL = Math.max(440, catCountL * 74 + 74);
          var svgHL = 240;
          var pLeftL = 48, pRightL = 22, pTopL = 24, pBotL = 48;
          var plotWL = svgWL - pLeftL - pRightL;
          var plotHL = svgHL - pTopL - pBotL;
          var rangeL = Math.max(maxVal - minVal, 0.001);
          var yMaxL = maxVal + rangeL * 0.15;
          var yMinL = minVal;
          var ySpanL = Math.max(yMaxL - yMinL, 0.001);
          var valToYL = function(val) { return pTopL + plotHL - ((val - yMinL) / ySpanL) * plotHL; };
          var idxToXL = function(idx) { return catCountL <= 1 ? pLeftL + plotWL / 2 : pLeftL + (plotWL * idx) / (catCountL - 1); };

          var svgBodyL = '';
          for (var gt = 0; gt <= 4; gt++) {
            var tv = yMinL + (ySpanL * gt) / 4;
            var ty = valToYL(tv);
            svgBodyL += '<line x1="' + pLeftL + '" y1="' + ty.toFixed(1) + '" x2="' + (svgWL - pRightL) + '" y2="' + ty.toFixed(1) + '" stroke="' + (gt === 0 ? '#94a3b8' : '#e2e8f0') + '" stroke-width="' + (gt === 0 ? '1.2' : '1') + '"' + (gt === 0 ? '' : ' stroke-dasharray="3 3"') + ' />';
            svgBodyL += '<text x="' + (pLeftL - 6) + '" y="' + (ty + 3.5).toFixed(1) + '" text-anchor="end" font-size="10" fill="#64748b" font-family="ui-monospace,monospace">' + esc(formatChartNum(Number(tv.toFixed(2)))) + '</text>';
          }
          for (var xi = 0; xi < catCountL; xi++) {
            var xPos = idxToXL(xi);
            var shortC = categories[xi].length > 16 ? categories[xi].slice(0, 15) + '…' : categories[xi];
            svgBodyL += '<text x="' + xPos.toFixed(1) + '" y="' + (svgHL - pBotL + 18) + '" text-anchor="middle" font-size="10.5" font-weight="600" fill="#334155">' + esc(shortC) + '</text>';
          }
          for (var slIdx = 0; slIdx < series.length; slIdx++) {
            var serL = series[slIdx];
            var pts = [];
            for (var pIdx = 0; pIdx < catCountL; pIdx++) {
              var pvL = serL.values[pIdx];
              if (typeof pvL === 'number' && isFinite(pvL)) {
                pts.push({ x: idxToXL(pIdx), y: valToYL(pvL), val: pvL, idx: pIdx });
              }
            }
            if (pts.length === 0) continue;
            var dPath = pts.map(function(p, k) { return (k === 0 ? 'M ' : 'L ') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join(' ');
            if (chartType === 'area' && pts.length >= 2) {
              var areaPath = dPath + ' L ' + pts[pts.length - 1].x.toFixed(1) + ' ' + (pTopL + plotHL).toFixed(1) + ' L ' + pts[0].x.toFixed(1) + ' ' + (pTopL + plotHL).toFixed(1) + ' Z';
              svgBodyL += '<path d="' + areaPath + '" fill="' + esc(serL.color) + '" opacity="0.14" />';
            }
            svgBodyL += '<path d="' + dPath + '" fill="none" stroke="' + esc(serL.color) + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" />';
            for (var ptI = 0; ptI < pts.length; ptI++) {
              var pt = pts[ptI];
              var pLbl = formatChartNum(pt.val, serL.displayValues && serL.displayValues[pt.idx]);
              svgBodyL += '<circle cx="' + pt.x.toFixed(1) + '" cy="' + pt.y.toFixed(1) + '" r="4" fill="#ffffff" stroke="' + esc(serL.color) + '" stroke-width="2.2" />';
              svgBodyL += '<text x="' + pt.x.toFixed(1) + '" y="' + Math.max(12, pt.y - 8 - (slIdx % 2) * 10).toFixed(1) + '" text-anchor="middle" font-size="9.5" font-weight="700" fill="#1e293b" font-family="ui-monospace,monospace">' + esc(pLbl) + '</text>';
            }
          }
          html += '<div class="data-table-wrap"><svg viewBox="0 0 ' + svgWL + ' ' + svgHL + '" style="width:100%;height:auto;display:block;' + (catCountL >= 6 ? 'min-width:' + svgWL + 'px;' : '') + '" role="img">' + svgBodyL + '</svg></div>';
        } else {
          var catCountC = categories.length;
          var serCountC = series.length;
          var svgWC = Math.max(440, catCountC * Math.max(74, serCountC * 28 + 24) + 70);
          var svgHC = 245;
          var pLeftC = 48, pRightC = 18, pTopC = 24, pBotC = 50;
          var plotWC = svgWC - pLeftC - pRightC;
          var plotHC = svgHC - pTopC - pBotC;
          var rangeC = Math.max(maxVal - minVal, 0.001);
          var yMaxC = maxVal + rangeC * 0.15;
          var yMinC = minVal;
          var ySpanC = Math.max(yMaxC - yMinC, 0.001);
          var valToYC = function(val) { return pTopC + plotHC - ((val - yMinC) / ySpanC) * plotHC; };
          var zeroYC = valToYC(0);
          var groupW = plotWC / catCountC;
          var innerGW = Math.min(groupW * 0.74, serCountC * 34);
          var barGap = serCountC > 1 ? 4 : 0;
          var barW = Math.max(10, (innerGW - barGap * (serCountC - 1)) / serCountC);

          var svgBodyC = '';
          for (var gtc = 0; gtc <= 4; gtc++) {
            var tvc = yMinC + (ySpanC * gtc) / 4;
            var tyc = valToYC(tvc);
            svgBodyC += '<line x1="' + pLeftC + '" y1="' + tyc.toFixed(1) + '" x2="' + (svgWC - pRightC) + '" y2="' + tyc.toFixed(1) + '" stroke="' + (gtc === 0 ? '#94a3b8' : '#e2e8f0') + '" stroke-width="' + (gtc === 0 ? '1.2' : '1') + '"' + (gtc === 0 ? '' : ' stroke-dasharray="3 3"') + ' />';
            svgBodyC += '<text x="' + (pLeftC - 6) + '" y="' + (tyc + 3.5).toFixed(1) + '" text-anchor="end" font-size="10" fill="#64748b" font-family="ui-monospace,monospace">' + esc(formatChartNum(Number(tvc.toFixed(2)))) + '</text>';
          }
          for (var ciC = 0; ciC < catCountC; ciC++) {
            var gCenter = pLeftC + groupW * (ciC + 0.5);
            var startX = gCenter - innerGW / 2;
            var shortCC = categories[ciC].length > 18 ? categories[ciC].slice(0, 17) + '…' : categories[ciC];
            for (var siC = 0; siC < serCountC; siC++) {
              var sC = series[siC];
              var vC = sC.values[ciC];
              if (typeof vC !== 'number' || !isFinite(vC)) continue;
              var bx = startX + siC * (barW + barGap);
              var by = vC >= 0 ? valToYC(vC) : zeroYC;
              var bh = Math.max(2, Math.abs(valToYC(vC) - zeroYC));
              var bLbl = formatChartNum(vC, sC.displayValues && sC.displayValues[ciC]);
              svgBodyC += '<rect x="' + bx.toFixed(1) + '" y="' + by.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="3" fill="' + esc(sC.color) + '" opacity="0.92" />';
              svgBodyC += '<text x="' + (bx + barW / 2).toFixed(1) + '" y="' + (vC >= 0 ? Math.max(12, by - 4) : (by + bh + 11)).toFixed(1) + '" text-anchor="middle" font-size="9.5" font-weight="700" fill="#1e293b" font-family="ui-monospace,monospace">' + esc(bLbl) + '</text>';
            }
            svgBodyC += '<text x="' + gCenter.toFixed(1) + '" y="' + (svgHC - pBotC + 16) + '" text-anchor="middle" font-size="10.5" font-weight="600" fill="#334155">' + esc(shortCC) + '</text>';
          }
          html += '<div class="data-table-wrap"><svg viewBox="0 0 ' + svgWC + ' ' + svgHC + '" style="width:100%;height:auto;display:block;' + (catCountC >= 5 ? 'min-width:' + svgWC + 'px;' : '') + '" role="img">' + svgBodyC + '</svg></div>';
        }

        // Hidden toggleable raw data table
        html += '<div id="' + rawTblId + '" style="display:none;margin-top:10px;" class="data-table-wrap"><table class="data-table"><thead><tr><th style="text-align:left;">Danh mục</th>';
        for (var rs = 0; rs < series.length; rs++) {
          html += '<th>' + esc(series[rs].name) + '</th>';
        }
        html += '</tr></thead><tbody>';
        for (var rc = 0; rc < categories.length; rc++) {
          html += '<tr class="' + (rc % 2 === 1 ? 'zebra' : '') + '"><td style="text-align:left;font-weight:700;">' + esc(categories[rc]) + '</td>';
          for (var rs2 = 0; rs2 < series.length; rs2++) {
            html += '<td style="text-align:center;font-family:ui-monospace,monospace;">' + esc(formatChartNum(series[rs2].values[rc], series[rs2].displayValues && series[rs2].displayValues[rc])) + (unit ? ' ' + esc(unit) : '') + '</td>';
          }
          html += '</tr>';
        }
        html += '</tbody></table></div>';

        html += '</div>';
        if (ch.source || ch.note) {
          html += '<div class="doc-table-footer">';
          if (ch.source) html += '<div style="text-align:right;font-weight:600;">' + esc(ch.source) + '</div>';
          if (ch.note) html += '<div>' + esc(ch.note) + '</div>';
          html += '</div>';
        }
        html += '</div>';
        return html;
      }

      function renderItemMediaHtml(item, altPrefix) {
        if (!item) return '';
        var out = '';
        out += renderItemImagesHtml(item, altPrefix);
        var charts = [];
        if (item.chartData) charts.push(item.chartData);
        if (Array.isArray(item.extraCharts)) {
          for (var ci = 0; ci < item.extraCharts.length; ci++) charts.push(item.extraCharts[ci]);
        }
        for (var c = 0; c < charts.length; c++) {
          out += renderStructuredChartHtml(charts[c]);
        }
        var tables = [];
        if (item.tableData) tables.push(item.tableData);
        if (Array.isArray(item.extraTables)) {
          for (var ti = 0; ti < item.extraTables.length; ti++) tables.push(item.extraTables[ti]);
        }
        for (var t = 0; t < tables.length; t++) {
          out += renderStructuredTableHtml(tables[t]);
        }
        return out;
      }

      function isMarkdownSeparatorLine(line) {
        var cleaned = line.replace(/\\|/g, '').replace(/\\s+/g, '');
        return cleaned.length > 0 && /^[:\\-]+$/.test(cleaned);
      }

      function renderRichTextBlock(rawText, altPrefix) {
        var lines = String(rawText || '').replace(/\\r\\n/g, '\\n').split('\\n');
        var htmlParts = [];
        var pipeLines = [];
        var tabLines = [];

        function flushPipeTable() {
          if (pipeLines.length === 0) return;
          var parsedRows = [];
          for (var r = 0; r < pipeLines.length; r++) {
            if (isMarkdownSeparatorLine(pipeLines[r])) continue;
            var rawCells = pipeLines[r].replace(/^\\|/, '').replace(/\\|$/, '').split('|');
            var cells = rawCells.map(function(c) { return c.trim(); });
            if (cells.some(function(c) { return c.length > 0; })) {
              parsedRows.push(cells);
            }
          }
          if (parsedRows.length > 0) {
            htmlParts.push(renderStructuredTableHtml({
              headers: parsedRows[0],
              rows: parsedRows.slice(1)
            }));
          }
          pipeLines = [];
        }

        function flushTabTable() {
          if (tabLines.length === 0) return;
          if (tabLines.length === 1) {
            htmlParts.push('<p style="margin:0 0 6px;">' + esc(tabLines[0]) + '</p>');
          } else {
            var parsedRows = tabLines.map(function(ln) {
              return ln.split('\\t').map(function(c) { return c.trim(); });
            });
            htmlParts.push(renderStructuredTableHtml({
              headers: parsedRows[0],
              rows: parsedRows.slice(1)
            }));
          }
          tabLines = [];
        }

        for (var i = 0; i < lines.length; i++) {
          var rawLine = lines[i];
          var line = rawLine.trim();
          if (!line) {
            flushPipeTable();
            flushTabTable();
            continue;
          }

          var imgMatch = line.match(/^\\[\\[IMG:([^\\]]+)\\]\\]$/);
          if (imgMatch && exam.rawDocumentImages && exam.rawDocumentImages[imgMatch[1]]) {
            flushPipeTable();
            flushTabTable();
            htmlParts.push(renderImagesListHtml([exam.rawDocumentImages[imgMatch[1]]], altPrefix || 'Hình minh họa'));
            continue;
          }
          var tblMatch = line.match(/^\\[\\[TBL:([^\\]]+)\\]\\]$/);
          if (tblMatch && exam.rawDocumentTables && exam.rawDocumentTables[tblMatch[1]]) {
            flushPipeTable();
            flushTabTable();
            htmlParts.push(renderStructuredTableHtml(exam.rawDocumentTables[tblMatch[1]]));
            continue;
          }
          var chMatch = line.match(/^\\[\\[CHART:([^\\]]+)\\]\\]$/);
          if (chMatch && exam.rawDocumentCharts && exam.rawDocumentCharts[chMatch[1]]) {
            flushPipeTable();
            flushTabTable();
            htmlParts.push(renderStructuredChartHtml(exam.rawDocumentCharts[chMatch[1]]));
            continue;
          }

          if (line.indexOf('|') !== -1 && (line.split('|').length >= 3 || isMarkdownSeparatorLine(line))) {
            flushTabTable();
            pipeLines.push(line);
          } else if (rawLine.indexOf('\\t') !== -1 && rawLine.split('\\t').length >= 2) {
            flushPipeTable();
            tabLines.push(rawLine);
          } else {
            flushPipeTable();
            flushTabTable();
            htmlParts.push('<p style="margin:0 0 6px;">' + esc(line) + '</p>');
          }
        }
        flushPipeTable();
        flushTabTable();
        return htmlParts.join('');
      }

      function renderPalette() {
        var html = '';
        for (var i = 0; i < exam.partI.length; i++) {
          var q = exam.partI[i];
          var chosen = answersPartI[q.id];
          var cls = 'palette-btn';
          if (isSubmitted) {
            cls += (chosen === q.correctAnswer) ? ' correct' : ' wrong';
          } else if (chosen) {
            cls += ' done';
          }
          html += '<button type="button" class="' + cls + '" onclick="scrollToQuestion(\\'q-p1-' + esc(q.id) + '\\')">' + q.number + '</button>';
        }
        for (var j = 0; j < exam.partII.length; j++) {
          var tf = exam.partII[j];
          var stMap = answersPartII[tf.id] || {};
          var doneCount = 0;
          ['a', 'b', 'c', 'd'].forEach(function(k) {
            if (stMap[k] !== null && stMap[k] !== undefined) doneCount++;
          });
          var cls2 = 'palette-btn';
          if (doneCount === 4) cls2 += ' done';
          html += '<button type="button" class="' + cls2 + '" style="width:auto;padding:0 8px;" onclick="scrollToQuestion(\\'q-p2-' + esc(tf.id) + '\\')">Đ/S ' + tf.number + ' (' + doneCount + '/4)</button>';
        }
        for (var m = 0; m < exam.partIII.length; m++) {
          var sa = exam.partIII[m];
          var hasVal = String(answersPartIII[sa.id] || '').trim().length > 0;
          var cls3 = 'palette-btn' + (hasVal ? ' done' : '');
          html += '<button type="button" class="' + cls3 + '" style="width:auto;padding:0 8px;" onclick="scrollToQuestion(\\'q-p3-' + esc(sa.id) + '\\')">P3-' + (sa.originalNumber || sa.number) + '</button>';
        }
        document.getElementById('paletteContainer').innerHTML = html;
      }

      function updateProgressCounters() {
        var p1Done = Object.keys(answersPartI).filter(function(k) { return Boolean(answersPartI[k]); }).length;
        var p2Done = 0;
        for (var i = 0; i < exam.partII.length; i++) {
          var q = exam.partII[i];
          var m = answersPartII[q.id] || {};
          ['a', 'b', 'c', 'd'].forEach(function(k) {
            if (m[k] !== null && m[k] !== undefined) p2Done++;
          });
        }
        var p3Done = 0;
        for (var n = 0; n < exam.partIII.length; n++) {
          if (String(answersPartIII[exam.partIII[n].id] || '').trim().length > 0) p3Done++;
        }
        var label = 'Đã làm: ' + p1Done + '/' + exam.partI.length + ' câu TN · ' + p2Done + '/' + (exam.partII.length * 4) + ' ý Đ/S';
        if (exam.partIII.length > 0) {
          label += ' · ' + p3Done + '/' + exam.partIII.length + ' Phần III';
        }
        document.getElementById('progressText').textContent = label;
        document.getElementById('bottomStatusTitle').textContent = label;
        renderPalette();
      }

      function renderQuestions() {
        var html = '';

        if (exam.partI.length === 0 && exam.partII.length === 0 && exam.partIII.length === 0 && exam.rawDocumentText) {
          html += '<div class="section-banner">';
          html += '<h2>NỘI DUNG TÀI LIỆU ĐƯỢC GIAO</h2>';
          html += '<p>Tài liệu gốc kèm đầy đủ hình ảnh, bảng biểu và biểu đồ.</p>';
          html += '</div>';
          html += '<div class="card">' + renderRichTextBlock(exam.rawDocumentText, 'Hình tài liệu') + '</div>';
          document.getElementById('questionsRoot').innerHTML = html;
          updateProgressCounters();
          return;
        }

        if (exam.partI.length > 0) {
          html += '<div class="section-banner">';
          html += '<h2>PHẦN I. TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN (' + exam.partI.length + ' CÂU)</h2>';
          html += '<p>Thí sinh trả lời từ câu 1 đến câu ' + exam.partI.length + '. Mỗi câu hỏi thí sinh chỉ chọn một phương án đúng nhất (A, B, C hoặc D).</p>';
          html += '</div>';

          var letters = ['A', 'B', 'C', 'D'];
          for (var i = 0; i < exam.partI.length; i++) {
            var q = exam.partI[i];
            var selected = answersPartI[q.id] || null;
            html += '<div class="card" id="q-p1-' + esc(q.id) + '">';
            html += '<div class="q-header">';
            html += '<span class="q-num">Câu ' + q.number + '</span>';
            if (q.topic) {
              html += '<span class="q-topic">' + esc(q.topic) + (q.cognitiveLevel ? ' · ' + esc(q.cognitiveLevel) : '') + '</span>';
            }
            html += '</div>';
            html += '<div class="q-stem">' + renderRichTextBlock(q.question, 'Hình Câu ' + q.number) + '</div>';

            // Hình ảnh minh họa của Câu hỏi Phần I
            html += renderItemImagesHtml(q, 'Hình minh họa Câu ' + q.number);

            if (Array.isArray(q.subStatements) && q.subStatements.length > 0) {
              html += '<div class="sub-statements">';
              for (var s = 0; s < q.subStatements.length; s++) {
                html += '<div>' + esc(q.subStatements[s]) + '</div>';
              }
              html += '</div>';
            }

            // Biểu đồ & Bảng biểu cấu trúc của Câu hỏi Phần I
            var p1Charts = [];
            if (q.chartData) p1Charts.push(q.chartData);
            if (Array.isArray(q.extraCharts)) p1Charts = p1Charts.concat(q.extraCharts);
            for (var c1 = 0; c1 < p1Charts.length; c1++) {
              html += renderStructuredChartHtml(p1Charts[c1]);
            }
            var p1Tables = [];
            if (q.tableData) p1Tables.push(q.tableData);
            if (Array.isArray(q.extraTables)) p1Tables = p1Tables.concat(q.extraTables);
            for (var t1 = 0; t1 < p1Tables.length; t1++) {
              html += renderStructuredTableHtml(p1Tables[t1]);
            }

            if (q.questionFooter) {
              html += '<div class="q-stem" style="margin-top:6px;">' + esc(q.questionFooter) + '</div>';
            }

            html += '<div class="options-list">';
            for (var optIdx = 0; optIdx < letters.length; optIdx++) {
              var letter = letters[optIdx];
              var optText = (q.options && q.options[letter]) || '';
              var btnClass = 'opt-btn';
              if (isSubmitted) {
                if (letter === q.correctAnswer && config.showSolutionsAfterSubmit !== false) {
                  btnClass += ' correct-ans';
                } else if (selected === letter && letter !== q.correctAnswer) {
                  btnClass += ' wrong-ans';
                }
              } else if (selected === letter) {
                btnClass += ' selected';
              }
              html += '<button type="button" class="' + btnClass + '" onclick="choosePartI(\\'' + esc(q.id) + '\\', \\'' + letter + '\\')">';
              html += '<span class="opt-letter">' + letter + '</span>';
              html += '<span style="flex:1;">' + esc(optText) + '</span>';
              html += '</button>';
            }
            html += '</div>';

            if (isSubmitted && config.showSolutionsAfterSubmit !== false) {
              var isRight = selected === q.correctAnswer;
              html += '<div class="explanation-box">';
              html += '<div><strong>' + (isRight ? '✅ Chính xác!' : '❌ Chưa đúng (Bạn chọn: ' + (selected || 'Bỏ trống') + ')') + ' — Đáp án đúng: ' + esc(q.correctAnswer) + '</strong></div>';
              if (q.explanation) {
                html += '<div style="margin-top:4px;">💡 <strong>Giải thích:</strong> ' + esc(q.explanation) + '</div>';
              }
              html += '</div>';
            }

            html += '</div>';
          }
        }

        if (Array.isArray(exam.partII) && exam.partII.length > 0) {
          html += '<div class="section-banner">';
          html += '<h2>PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG SAI THEO TÌNH HUỐNG (' + exam.partII.length + ' CÂU)</h2>';
          html += '<p>Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn Đúng hoặc Sai.</p>';
          html += '</div>';

          for (var j = 0; j < exam.partII.length; j++) {
            var tf = exam.partII[j];
            var stMap = answersPartII[tf.id] || {};
            html += '<div class="card" id="q-p2-' + esc(tf.id) + '">';
            html += '<div class="q-header">';
            html += '<span class="q-num">Câu ' + tf.number + ' (Đúng/Sai)</span>';
            if (tf.topic) {
              html += '<span class="q-topic">' + esc(tf.topic) + '</span>';
            }
            html += '</div>';

            html += '<div class="scenario-box">';
            if (tf.scenarioTitle) {
              html += '<div class="scenario-title">📋 ' + esc(tf.scenarioTitle) + '</div>';
            }
            html += renderRichTextBlock(tf.scenario, 'Hình Tình huống Câu ' + tf.number);
            // Hình ảnh, Bảng biểu và Biểu đồ của Phần II
            html += renderItemImagesHtml(tf, 'Hình minh họa Phần II Câu ' + tf.number);
            var p2Tables = [];
            if (tf.tableData) p2Tables.push(tf.tableData);
            if (Array.isArray(tf.extraTables)) p2Tables = p2Tables.concat(tf.extraTables);
            for (var t2 = 0; t2 < p2Tables.length; t2++) {
              html += renderStructuredTableHtml(p2Tables[t2]);
            }
            var p2Charts = [];
            if (tf.chartData) p2Charts.push(tf.chartData);
            if (Array.isArray(tf.extraCharts)) p2Charts = p2Charts.concat(tf.extraCharts);
            for (var c2 = 0; c2 < p2Charts.length; c2++) {
              html += renderStructuredChartHtml(p2Charts[c2]);
            }
            if (tf.citation) {
              html += '<div style="font-size:12px;color:#64748b;font-style:italic;margin-top:6px;">Nguồn: ' + esc(tf.citation) + '</div>';
            }
            html += '</div>';

            var tfStmts = Array.isArray(tf.statements) ? tf.statements : [];
            for (var k = 0; k < tfStmts.length; k++) {
              var stmt = tfStmts[k];
              var userVal = stMap[stmt.subId];
              var hasAnswered = userVal === true || userVal === false;
              html += '<div class="tf-row ' + (hasAnswered ? 'answered' : '') + '">';
              html += '<div class="tf-text"><strong>' + esc(stmt.subId) + ')</strong> ' + esc(stmt.text) + '</div>';
              html += '<div class="tf-actions">';
              html += '<button type="button" class="tf-btn ' + (userVal === true ? 'selected-true' : '') + '" onclick="choosePartII(\\'' + esc(tf.id) + '\\', \\'' + esc(stmt.subId) + '\\', true)">✓ Đúng</button>';
              html += '<button type="button" class="tf-btn ' + (userVal === false ? 'selected-false' : '') + '" onclick="choosePartII(\\'' + esc(tf.id) + '\\', \\'' + esc(stmt.subId) + '\\', false)">✗ Sai</button>';
              html += '</div>';

              if (isSubmitted && config.showSolutionsAfterSubmit !== false) {
                var stmtRight = userVal === stmt.isCorrect;
                html += '<div class="explanation-box" style="margin-top:8px;">';
                html += '<div><strong>' + (stmtRight ? '✅ Chính xác!' : '❌ Chưa đúng') + ' — Đáp án chuẩn: ' + (stmt.isCorrect ? 'Đúng' : 'Sai') + '</strong></div>';
                if (stmt.explanation) {
                  html += '<div style="margin-top:3px;">💡 ' + esc(stmt.explanation) + '</div>';
                }
                html += '</div>';
              }

              html += '</div>';
            }

            html += '</div>';
          }
        }

        if (Array.isArray(exam.partIII) && exam.partIII.length > 0) {
          html += '<div class="section-banner" style="background:#0369a1;">';
          html += '<h2>PHẦN III. TRẢ LỜI NGẮN / TỰ LUẬN (' + exam.partIII.length + ' CÂU)</h2>';
          html += '<p>Thí sinh điền đáp án ngắn hoặc lời giải vào ô bên dưới mỗi câu hỏi.</p>';
          html += '</div>';

          for (var m = 0; m < exam.partIII.length; m++) {
            var saQ = exam.partIII[m];
            var saVal = answersPartIII[saQ.id] || '';
            html += '<div class="card" id="q-p3-' + esc(saQ.id) + '">';
            html += '<div class="q-header">';
            html += '<span class="q-num" style="background:#0284c7;">Câu ' + (saQ.originalNumber || saQ.number) + ' (Phần III)</span>';
            html += '<span class="q-topic">Trả lời ngắn / Tự luận</span>';
            html += '</div>';
            html += '<div class="q-stem">' + renderRichTextBlock(saQ.question, 'Hình Phần III Câu ' + saQ.number) + '</div>';
            html += renderItemMediaHtml(saQ, 'Hình Phần III Câu ' + saQ.number);
            html += '<div style="margin-top:8px;">' +
              '<label class="field-label">Câu trả lời của bạn:</label>' +
              '<textarea class="sa-textarea" ' + (isSubmitted ? 'disabled ' : '') + 'placeholder="Nhập đáp án hoặc ghi chú lời giải..." oninput="updatePartIIIAnswer(\\'' + esc(saQ.id) + '\\', this.value)">' + esc(saVal) + '</textarea>' +
            '</div>';

            if (isSubmitted && config.showSolutionsAfterSubmit !== false && (saQ.expectedAnswer || saQ.explanation)) {
              html += '<div class="explanation-box">';
              if (saQ.expectedAnswer) {
                html += '<div><strong>📌 Đáp án gợi ý:</strong> ' + esc(saQ.expectedAnswer) + '</div>';
              }
              if (saQ.explanation) {
                html += '<div style="margin-top:4px;">💡 ' + esc(saQ.explanation) + '</div>';
              }
              html += '</div>';
            }
            html += '</div>';
          }
        }

        document.getElementById('questionsRoot').innerHTML = html;
        updateProgressCounters();
      }

      window.selectQuickClass = function(cls, btnEl) {
        var inp = document.getElementById('studentClassInput');
        inp.value = cls;
        document.getElementById('bannerClassLabel').textContent = cls;
        var pills = document.querySelectorAll('.class-pill');
        for (var i = 0; i < pills.length; i++) pills[i].classList.remove('active');
        if (btnEl) btnEl.classList.add('active');
      };

      window.scrollToQuestion = function(domId) {
        var el = document.getElementById(domId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };

      window.choosePartI = function(qId, letter) {
        if (isSubmitted) return;
        answersPartI[qId] = letter;
        renderQuestions();
      };

      window.choosePartII = function(qId, subId, val) {
        if (isSubmitted) return;
        if (!answersPartII[qId]) answersPartII[qId] = { a: null, b: null, c: null, d: null };
        answersPartII[qId][subId] = val;
        renderQuestions();
      };

      window.updatePartIIIAnswer = function(qId, val) {
        if (isSubmitted) return;
        answersPartIII[qId] = val;
        updateProgressCounters();
      };

      window.openSubmitModal = function() {
        if (isSubmitted) return;
        var nameInput = document.getElementById('studentNameInput');
        var nameVal = String(nameInput.value || '').trim();
        var errBox = document.getElementById('nameErrorBox');
        if (!nameVal) {
          errBox.style.display = 'block';
          nameInput.focus();
          nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        errBox.style.display = 'none';

        var p1Done = Object.keys(answersPartI).filter(function(k) { return Boolean(answersPartI[k]); }).length;
        var p2Done = 0;
        for (var i = 0; i < exam.partII.length; i++) {
          var m = answersPartII[exam.partII[i].id] || {};
          ['a', 'b', 'c', 'd'].forEach(function(k) {
            if (m[k] !== null && m[k] !== undefined) p2Done++;
          });
        }
        var p3Done = 0;
        for (var n = 0; n < exam.partIII.length; n++) {
          if (String(answersPartIII[exam.partIII[n].id] || '').trim().length > 0) p3Done++;
        }
        var totalP1 = exam.partI.length;
        var totalP2 = exam.partII.length * 4;
        var totalP3 = exam.partIII.length;
        var msg = 'Học sinh: ' + nameVal + ' (' + (document.getElementById('studentClassInput').value || 'Ôn THPT') + '). ';
        msg += 'Bạn đã hoàn thành ' + p1Done + '/' + totalP1 + ' câu Phần I và ' + p2Done + '/' + totalP2 + ' ý Đúng/Sai Phần II';
        if (totalP3 > 0) msg += ' và ' + p3Done + '/' + totalP3 + ' câu Phần III';
        msg += '.';
        if (p1Done < totalP1 || p2Done < totalP2 || p3Done < totalP3) {
          msg += ' Vẫn còn câu hỏi chưa hoàn thành, bạn có chắc chắn muốn nộp bài ngay không?';
        }
        document.getElementById('modalSummaryText').textContent = msg;
        document.getElementById('submitModal').classList.add('open');
      };

      window.closeSubmitModal = function() {
        document.getElementById('submitModal').classList.remove('open');
      };

      function playWarningBeep() {
        try {
          var AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtx) return;
          var ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            ctx.resume().catch(function() {});
          }
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        } catch (e) {}
      }

      window.openViolationModal = function() {
        document.getElementById('violationModal').classList.add('open');
      };

      window.closeViolationModal = function() {
        lastViolationTime = Date.now();
        document.getElementById('violationModal').classList.remove('open');
      };

      window.triggerViolation = function(reason) {
        if (isSubmitted) return;
        var now = Date.now();
        if (now - lastViolationTime < 1000) return;
        lastViolationTime = now;

        violationCount++;
        playWarningBeep();

        var badgeEl = document.getElementById('violationBadge');
        var badgeCountEl = document.getElementById('violationBadgeCount');
        if (badgeEl && badgeCountEl) {
          badgeEl.style.display = 'inline-flex';
          badgeCountEl.textContent = Math.min(violationCount, MAX_VIOLATIONS) + '/' + MAX_VIOLATIONS;
        }

        var modalBadge = document.getElementById('violationBadgeModal');
        var titleEl = document.getElementById('violationTitleText');
        var reasonEl = document.getElementById('violationReasonText');
        var ruleBoxEl = document.getElementById('violationRuleBox');
        var actionBtn = document.getElementById('violationActionBtn');

        if (violationCount >= MAX_VIOLATIONS) {
          isAutoCollectedBySystem = true;
          if (modalBadge) {
            modalBadge.textContent = '🚨 VI PHẠM ĐỦ 5/5 LẦN · HỆ THỐNG TỰ ĐỘNG THU BÀI';
          }
          if (titleEl) {
            titleEl.textContent = 'ĐÃ THOÁT GIAO DIỆN 5 LẦN · TỰ ĐỘNG THU BÀI!';
          }
          if (reasonEl) {
            reasonEl.innerHTML = 'Học sinh đã thoát khỏi giao diện làm bài đủ <strong>5/5 lần</strong> (' + esc(reason) + '). Hệ thống đã <strong>tự động thu bài</strong> ngay lập tức và chấm điểm kết quả hiện tại!';
          }
          if (ruleBoxEl) {
            ruleBoxEl.innerHTML = '<strong>🚨 THÔNG BÁO:</strong> Bài thi của em đã được hệ thống tự động thu và gửi điểm kèm trạng thái vi phạm về Bảng Điểm Giáo Viên.';
          }
          if (actionBtn) {
            actionBtn.textContent = '📄 Xem Kết Quả Bài Thi Đã Thu';
          }
          document.getElementById('violationModal').classList.add('open');
          window.confirmSubmitExam(true);
        } else {
          var remaining = MAX_VIOLATIONS - violationCount;
          if (modalBadge) {
            modalBadge.textContent = '🚨 CẢNH BÁO THOÁT GIAO DIỆN LẦN ' + violationCount + '/' + MAX_VIOLATIONS;
          }
          if (titleEl) {
            titleEl.textContent = 'CẢNH BÁO: QUAY LẠI LÀM BÀI NGAY!';
          }
          if (reasonEl) {
            reasonEl.innerHTML = 'Hệ thống phát hiện học sinh vừa: <strong style="color:#b91c1c;">' + esc(reason) + '</strong>.';
          }
          if (ruleBoxEl) {
            ruleBoxEl.innerHTML =
              '<div style="margin-bottom:6px;"><strong>⚠️ YÊU CẦU:</strong> Học sinh <strong>QUAY LẠI LÀM BÀI NGAY!</strong> Trong thời gian làm bài tuyệt đối không được thoát khỏi giao diện làm bài, chuyển tab hoặc mở ứng dụng khác.</div>' +
              '<div><strong>🚨 QUY ĐỊNH THU BÀI:</strong> Thoát khỏi giao diện làm bài <strong>5 lần</strong> hệ thống sẽ <strong>TỰ ĐỘNG THU BÀI</strong> (Đã vi phạm: <strong>' + violationCount + '/5 lần</strong>, còn <strong>' + remaining + ' lần</strong> cảnh báo).</div>';
          }
          if (actionBtn) {
            actionBtn.textContent = '⚡ Quay Lại Làm Bài Ngay (' + violationCount + '/5)';
          }
          document.getElementById('violationModal').classList.add('open');
        }
      };

      function getRank(score) {
        if (score >= 9.0) return 'Xuất sắc';
        if (score >= 8.0) return 'Giỏi';
        if (score >= 6.5) return 'Khá';
        if (score >= 5.0) return 'Trung bình';
        return 'Cần cố gắng';
      }

      window.confirmSubmitExam = function(isAutoCollect, autoCollectMode) {
        closeSubmitModal();
        if (isSubmitted) return;
        isSubmitted = true;
        if (timerInterval) clearInterval(timerInterval);
        var isTeacherEnded = autoCollectMode === 'teacher_ended';
        if (isTeacherEnded) {
          remainingSeconds = 0;
          var tdEl = document.getElementById('timerDisplay');
          if (tdEl) tdEl.textContent = '00:00';
          var tbEl = document.getElementById('timerBox');
          if (tbEl) tbEl.classList.add('urgent');
        }

        var studentName = String(document.getElementById('studentNameInput').value || '').trim() || 'Học sinh QR';
        var studentClass = String(document.getElementById('studentClassInput').value || '').trim() || 'Ôn THPT';
        var studentId = String(document.getElementById('studentIdInput').value || '').trim();

        try {
          localStorage.setItem('student_qr_name', studentName);
          localStorage.setItem('student_qr_class', studentClass);
          localStorage.setItem('student_qr_id', studentId);
        } catch (e) {}

        var hasPartII = Array.isArray(exam.partII) && exam.partII.length > 0;
        var pointPerPartI = hasPartII ? 0.25 : (exam.partI.length > 0 ? 10 / exam.partI.length : 0.25);

        var partICorrectCount = 0;
        var partIDetails = [];
        var mistakesPayload = {};

        for (var i = 0; i < exam.partI.length; i++) {
          var q = exam.partI[i];
          var sel = answersPartI[q.id] || null;
          var isCorr = sel === q.correctAnswer;
          if (isCorr) {
            partICorrectCount++;
          } else if (sel) {
            mistakesPayload[q.id] = {
              totalAttempts: 1,
              wrongAttempts: 1,
              lastChosen: sel,
              students: [{
                studentName: studentName,
                studentClass: studentClass,
                chosenOption: sel,
                examCode: exam.code,
                submittedAt: new Date().toISOString()
              }]
            };
          }
          partIDetails.push({
            questionNumber: q.number,
            questionId: q.id,
            questionText: q.question,
            options: q.options,
            selectedAnswer: sel,
            correctAnswer: q.correctAnswer,
            isCorrect: isCorr,
            explanation: q.explanation || ''
          });
        }

        var partIScore = Math.round(partICorrectCount * pointPerPartI * 100) / 100;

        var scoreTable = { 0: 0, 1: 0.1, 2: 0.25, 3: 0.5, 4: 1.0 };
        var partIICorrectCount = 0;
        var partIIScore = 0;
        var partIIDetails = [];

        for (var j = 0; j < exam.partII.length; j++) {
          var tf = exam.partII[j];
          var stMap = answersPartII[tf.id] || {};
          var corrInQ = 0;
          var stDetails = [];

          var tfStmts = Array.isArray(tf.statements) ? tf.statements : [];
          for (var k = 0; k < tfStmts.length; k++) {
            var stmt = tfStmts[k];
            var uChoice = stMap[stmt.subId];
            var normalizedChoice = (uChoice === true || uChoice === false) ? uChoice : null;
            var stmtCorr = normalizedChoice === stmt.isCorrect;
            if (stmtCorr) {
              corrInQ++;
              partIICorrectCount++;
            }
            stDetails.push({
              subId: stmt.subId,
              text: stmt.text,
              userChoice: normalizedChoice,
              correctChoice: stmt.isCorrect,
              isCorrect: stmtCorr,
              explanation: stmt.explanation || ''
            });
          }

          var earned = scoreTable[corrInQ] || 0;
          partIIScore += earned;
          partIIDetails.push({
            questionNumber: tf.number,
            questionId: tf.id,
            scenarioTitle: tf.scenarioTitle,
            scenario: tf.scenario,
            earnedScore: earned,
            statements: stDetails
          });
        }

        partIIScore = Math.round(partIIScore * 100) / 100;
        var totalScore = Math.round((partIScore + partIIScore) * 100) / 100;
        var timeSpentSeconds = Math.max(1, totalSeconds - remainingSeconds);
        var rank = getRank(totalScore);

        var autoCollectBanner = isTeacherEnded
          ? '<div style="margin-top:10px;padding:10px 12px;border-radius:11px;background:#dc2626;color:#ffffff;font-size:13px;font-weight:800;">🛑 GIÁO VIÊN ĐÃ KẾT THÚC BÀI THI SỚM — Hệ thống đã dừng đồng hồ, tự động thu bài của bạn và chốt điểm về Bảng Điểm Giáo Viên.</div>'
          : ((isAutoCollect || isAutoCollectedBySystem || violationCount >= MAX_VIOLATIONS)
              ? '<div style="margin-top:10px;padding:10px 12px;border-radius:11px;background:#dc2626;color:#ffffff;font-size:13px;font-weight:800;">🚨 HỆ THỐNG ĐÃ TỰ ĐỘNG THU BÀI (Do học sinh thoát khỏi giao diện làm bài ' + violationCount + '/5 lần)</div>'
              : (violationCount > 0
                  ? '<div style="margin-top:8px;padding:7px 11px;border-radius:9px;background:rgba(254,226,226,0.2);border:1px solid #fca5a5;color:#fecaca;font-size:12px;font-weight:700;">⚠️ Số lần thoát giao diện làm bài: ' + violationCount + '/5 lần</div>'
                  : ''));

        var resultEl = document.getElementById('resultSection');
        resultEl.style.display = 'block';
        resultEl.innerHTML =
          '<div class="result-card">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">' +
              '<div>' +
                '<div style="font-size:12px;font-weight:800;color:#6ee7b7;text-transform:uppercase;">🎉 KẾT QUẢ BÀI THI CỦA BẠN</div>' +
                '<div style="font-size:20px;font-weight:800;margin-top:2px;">' + esc(studentName) + ' · Lớp ' + esc(studentClass) + '</div>' +
                '<div id="syncStatusBadge" style="font-size:12px;color:#d1fae5;margin-top:4px;">⏳ Đang đồng bộ điểm về Bảng Điểm Giáo Viên...</div>' +
                autoCollectBanner +
              '</div>' +
              '<div style="text-align:right;">' +
                '<div class="score-big">' + totalScore.toFixed(2) + ' <span style="font-size:18px;color:#ffffff;">/ 10đ</span></div>' +
                '<div style="font-size:13px;font-weight:800;color:#fde68a;">Xếp loại: ' + rank + '</div>' +
              '</div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.2);">' +
              '<div><div style="font-size:11px;color:#a7f3d0;">Điểm Phần I (TN)</div><div style="font-size:16px;font-weight:800;">' + partIScore.toFixed(2) + 'đ (' + partICorrectCount + '/' + exam.partI.length + ' câu)</div></div>' +
              '<div><div style="font-size:11px;color:#a7f3d0;">Điểm Phần II (Đ/S)</div><div style="font-size:16px;font-weight:800;">' + partIIScore.toFixed(2) + 'đ (' + partIICorrectCount + '/' + (exam.partII.length * 4) + ' ý)</div></div>' +
              '<div><div style="font-size:11px;color:#a7f3d0;">Thời gian làm bài</div><div style="font-size:16px;font-weight:800;">' + Math.floor(timeSpentSeconds / 60) + ' phút ' + (timeSpentSeconds % 60) + ' giây</div></div>' +
            '</div>' +
            '<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">' +
              (isTeacherEnded
                ? '<div style="padding:9px 14px;border-radius:10px;background:rgba(254,226,226,0.18);border:1px solid #fca5a5;color:#fee2e2;font-size:12px;font-weight:800;">🔒 Link QR đã được Giáo viên khóa và chốt bảng điểm</div>'
                : '<button type="button" onclick="window.location.reload()" style="padding:9px 16px;border-radius:10px;border:none;background:#fde68a;color:#78350f;font-weight:800;cursor:pointer;">🔄 Làm Lại Đề Này</button>') +
              '<button type="button" id="retrySyncBtn" onclick="window.retrySubmissionSync()" style="display:none;padding:9px 16px;border-radius:10px;border:1px solid #6ee7b7;background:#065f46;color:#ffffff;font-weight:800;cursor:pointer;">📤 Gửi Lại Điểm Về Giáo Viên</button>' +
            '</div>' +
          '</div>';

        document.getElementById('topSubmitBtn').style.display = 'none';
        document.getElementById('bottomBar').style.display = 'none';
        var exitBtnEl = document.getElementById('headerExitBtn');
        if (exitBtnEl) exitBtnEl.style.display = 'none';
        renderQuestions();
        window.scrollTo({ top: 0, behavior: 'smooth' });

        var urlParams = null;
        try {
          urlParams = new URLSearchParams(window.location.search || '');
        } catch (e) {}
        var resolvedTeacherUser = String(
          config.teacherUsername ||
          (urlParams && (urlParams.get('teacher') || urlParams.get('t'))) ||
          ''
        ).replace(/^@+/, '').trim();
        var resolvedTeacherName = String(
          config.teacherName ||
          (urlParams && urlParams.get('teacherName')) ||
          ''
        ).trim();

        var submissionPayloadObj = {
          id: 'sub_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
          studentName: studentName,
          studentClass: studentClass,
          studentId: studentId,
          examId: exam.id,
          examCode: exam.code,
          examTitle: exam.title,
          totalScore: totalScore,
          partIScore: partIScore,
          partIIScore: partIIScore,
          partICorrectCount: partICorrectCount,
          partIICorrectCount: partIICorrectCount,
          timeSpentSeconds: timeSpentSeconds,
          violationCount: violationCount,
          isAutoCollected: Boolean(isAutoCollect || isTeacherEnded || isAutoCollectedBySystem || violationCount >= MAX_VIOLATIONS),
          autoSubmittedByTeacher: Boolean(isTeacherEnded),
          teacherUsername: resolvedTeacherUser,
          teacherName: resolvedTeacherName,
          submittedAt: new Date().toISOString(),
          rank: rank,
          examPaper: {
            partI: answersPartI,
            partII: answersPartII,
            partIII: answersPartIII,
            partIDetails: partIDetails,
            partIIDetails: partIIDetails
          }
        };
        var submissionPayloadStr = JSON.stringify(submissionPayloadObj);

        function postToPeerBackup() {
          try {
            var curOrigin = String(window.location.origin || '');
            var peerOrigin = curOrigin.indexOf('//ais-dev-') !== -1
              ? curOrigin.replace('//ais-dev-', '//ais-pre-')
              : (curOrigin.indexOf('//ais-pre-') !== -1 ? curOrigin.replace('//ais-pre-', '//ais-dev-') : '');
            if (peerOrigin) {
              fetch(peerOrigin + '/api/submissions?__storage_access_granted=1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: submissionPayloadStr
              }).catch(function() {});
            }
          } catch (e) {}
        }

        function submitToServerWithRetry(attempt) {
          var badge = document.getElementById('syncStatusBadge');
          var retryBtn = document.getElementById('retrySyncBtn');
          if (retryBtn) retryBtn.style.display = 'none';
          if (badge && attempt > 1) {
            badge.textContent = '⏳ Đang thử đồng bộ lại điểm về Bảng Điểm Giáo Viên (lần ' + attempt + ')...';
          }
          fetch('/api/submissions?__storage_access_granted=1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: submissionPayloadStr
          })
            .then(function(res) {
              if (!res.ok) throw new Error('HTTP ' + res.status);
              return res.json();
            })
            .then(function(result) {
              postToPeerBackup();
              var savedSub = (result && result.data) || submissionPayloadObj;
              var tUser = savedSub.teacherUsername || resolvedTeacherUser;
              var tName = savedSub.teacherName || resolvedTeacherName;
              if (badge) {
                var teacherLabel = tName
                  ? (tName + (tUser ? ' (@' + tUser + ')' : ''))
                  : (tUser ? '@' + tUser : 'Giáo Viên');
                badge.textContent = '✅ Đã lưu và đồng bộ điểm + bài làm về Bảng Điểm của tài khoản ' + teacherLabel + ' thành công!';
                badge.style.color = '#6ee7b7';
              }
            })
            .catch(function() {
              if (attempt < 3) {
                setTimeout(function() {
                  submitToServerWithRetry(attempt + 1);
                }, 1200 * attempt);
              } else {
                postToPeerBackup();
                if (badge) {
                  badge.textContent = '⚠️ Mạng đang chập chờn, chưa đồng bộ được về máy chủ. Hãy nhấn nút "Gửi Lại Điểm Về Giáo Viên" bên dưới.';
                  badge.style.color = '#fde68a';
                }
                if (retryBtn) retryBtn.style.display = 'inline-block';
              }
            });
        }

        window.retrySubmissionSync = function() {
          submitToServerWithRetry(1);
        };

        submitToServerWithRetry(1);

        if (Object.keys(mistakesPayload).length > 0) {
          fetch('/api/mistakes?__storage_access_granted=1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records: mistakesPayload })
          }).catch(function() {});
        }
      };

      // Anti-cheat listeners: detect leaving exam interface (tab switch, minimize, window blur, back button)
      try {
        window.history.pushState({ qrExamGuard: true }, '', window.location.href);
      } catch (e) {}

      window.addEventListener('popstate', function() {
        if (isSubmitted) return;
        try {
          window.history.pushState({ qrExamGuard: true }, '', window.location.href);
        } catch (e) {}
        window.triggerViolation('Nhấn nút Quay lại để thoát khỏi giao diện làm bài thi');
      });

      document.addEventListener('visibilitychange', function() {
        if (isSubmitted) return;
        if (document.visibilityState === 'hidden') {
          window.triggerViolation('Thoát khỏi giao diện làm bài thi (Chuyển tab hoặc ẩn trình duyệt)');
        }
      });

      window.addEventListener('blur', function() {
        if (isSubmitted) return;
        setTimeout(function() {
          if (isSubmitted) return;
          if (
            document.visibilityState === 'hidden' ||
            (typeof document.hasFocus === 'function' && !document.hasFocus())
          ) {
            window.triggerViolation('Thoát khỏi giao diện làm bài thi (Rời cửa sổ làm bài hoặc mở ứng dụng khác)');
          }
        }, 150);
      });

      window.addEventListener('beforeunload', function(e) {
        if (isSubmitted) return;
        e.preventDefault();
        e.returnValue = 'CẢNH BÁO: Bạn đang trong thời gian làm bài thi! Vui lòng quay lại làm bài ngay.';
        return e.returnValue;
      });

      timerInterval = setInterval(function() {
        if (isSubmitted) return;
        remainingSeconds--;
        if (remainingSeconds <= 0) {
          remainingSeconds = 0;
          var nameInput = document.getElementById('studentNameInput');
          if (!String(nameInput.value || '').trim()) {
            nameInput.value = 'Học sinh QR';
          }
          window.confirmSubmitExam(false);
          return;
        }
        var mins = Math.floor(remainingSeconds / 60);
        var secs = remainingSeconds % 60;
        document.getElementById('timerDisplay').textContent =
          (mins < 10 ? '0' + mins : mins) + ':' + (secs < 10 ? '0' + secs : secs);
        if (remainingSeconds <= 300) {
          document.getElementById('timerBox').classList.add('urgent');
        }
      }, 1000);

      // Real-time listener: when Teacher clicks "Kết thúc bài thi ngay", immediately stop timer & auto-collect paper
      (function setupTeacherEndSessionWatch() {
        var normStr = function(s) {
          return String(s || '').trim().replace(/^@+/, '').toLowerCase();
        };
        var urlP = null;
        try { urlP = new URLSearchParams(window.location.search || ''); } catch (e) {}
        var myTeacher = normStr(config.teacherUsername || (urlP && (urlP.get('teacher') || urlP.get('t'))));
        var myExamId = normStr(exam.id || config.examId);
        var myExamCode = normStr(exam.code || config.examCode);

        function doesEventMatchMySession(ev) {
          if (!ev) return false;
          var evTeacher = normStr(ev.teacherUsername || ev.closedBy);
          if (evTeacher && myTeacher && evTeacher !== myTeacher) {
            return false;
          }
          if (ev.closeAllForTeacher || ev.scope === 'all_teacher' || ev.scope === 'all_system') {
            return !evTeacher || !myTeacher || evTeacher === myTeacher;
          }
          var evId = normStr(ev.examId);
          var evCode = normStr(ev.examCode);
          var listCodes = Array.isArray(ev.examCodes) ? ev.examCodes.map(normStr) : [];
          var listIds = Array.isArray(ev.examIds) ? ev.examIds.map(normStr) : [];
          return Boolean(
            (myExamId && (evId === myExamId || evCode === myExamId || listIds.indexOf(myExamId) !== -1 || listCodes.indexOf(myExamId) !== -1)) ||
            (myExamCode && (evCode === myExamCode || evId === myExamCode || listCodes.indexOf(myExamCode) !== -1 || listIds.indexOf(myExamCode) !== -1))
          );
        }

        var sessionStatusTimer = null;
        var sessionEventSource = null;

        function forceAutoSubmitByTeacher() {
          if (isSubmitted) return;
          if (timerInterval) clearInterval(timerInterval);
          if (sessionStatusTimer) clearInterval(sessionStatusTimer);
          if (sessionEventSource) {
            try { sessionEventSource.close(); } catch (e) {}
          }
          var nameInput = document.getElementById('studentNameInput');
          if (nameInput && !String(nameInput.value || '').trim()) {
            nameInput.value = 'Học sinh QR';
          }
          window.confirmSubmitExam(true, 'teacher_ended');
        }

        // 1. Instant SSE push from server
        try {
          if ('EventSource' in window) {
            sessionEventSource = new EventSource('/api/submissions/stream?__storage_access_granted=1');
            sessionEventSource.addEventListener('exam_session_ended', function(e) {
              try {
                var parsed = e.data ? JSON.parse(e.data) : null;
                if (doesEventMatchMySession(parsed)) {
                  forceAutoSubmitByTeacher();
                }
              } catch (err) {}
            });
          }
        } catch (e) {}

        // 2. Reliable 3-second polling fallback (for iOS Safari / Zalo WebView where SSE may pause)
        function pollSessionClosedStatus() {
          if (isSubmitted) {
            if (sessionStatusTimer) clearInterval(sessionStatusTimer);
            return;
          }
          var qs =
            'examId=' + encodeURIComponent(exam.id || config.examId || '') +
            '&code=' + encodeURIComponent(exam.code || config.examCode || '') +
            (myTeacher ? '&teacher=' + encodeURIComponent(myTeacher) : '') +
            '&_t=' + Date.now();
          fetch('/api/assignments/session-status?' + qs, { cache: 'no-store' })
            .then(function(r) { return r.ok ? r.json() : null; })
            .then(function(data) {
              if (data && data.isClosed === true) {
                forceAutoSubmitByTeacher();
              }
            })
            .catch(function() {});
        }
        sessionStatusTimer = setInterval(pollSessionClosedStatus, 3000);
        document.addEventListener('visibilitychange', function() {
          if (document.visibilityState === 'visible' && !isSubmitted) {
            pollSessionClosedStatus();
          }
        });
      })();

      renderQuestions();
    })();
  </script>
</body>
</html>`;
}

async function handleStudentExamHtmlRequest(req: Request, res: Response, next: NextFunction) {
  try {
  if (req.method !== 'GET') return next();

  const pathMatch = req.path.match(/^\/(?:thi|s|exam)\/([^/?#]+)/i);
  const pathKey = pathMatch && pathMatch[1] ? decodeURIComponent(pathMatch[1]).trim() : '';

  const mode = String(req.query.mode || '').trim();
  const qExamId = String(req.query.examId || req.query.exam || '').trim();
  const qCustomCode = String(req.query.customCode || '').trim();
  const qCode = String(req.query.code || req.query.s || qCustomCode || '').trim();

  const isRootPath = req.path === '/' || req.path === '/onthithptcnnn' || req.path === '/onthithptcnnn/';
  const isStudentExamReq =
    Boolean(pathKey) ||
    (isRootPath && (mode === 'student' || Boolean(qExamId) || Boolean(qCustomCode)));

  if (!isStudentExamReq) {
    return next();
  }

  const hasValidExamPayload = (ex: any): boolean =>
    Boolean(
      ex &&
        (Array.isArray(ex.partI) ||
          Array.isArray(ex.partII) ||
          Array.isArray(ex.partIII) ||
          Boolean(ex.rawDocumentText))
    );

  const qTeacher = String(req.query.teacher || req.query.t || '').trim();
  const candidateKeys = [qExamId, qCode, pathKey].filter(Boolean);
  let storedRecord: any = null;
  for (const key of candidateKeys) {
    const found =
      (qTeacher
        ? sharedAssignmentsMap.get(`${qTeacher.toLowerCase()}__${key.toLowerCase()}`)
        : null) ||
      sharedAssignmentsMap.get(key) ||
      sharedAssignmentsMap.get(key.toLowerCase());
    if (found && hasValidExamPayload(found.exam)) {
      storedRecord = found;
      break;
    }
  }

  // Fallback truy vấn Cloud SQL / peer instance nếu đề giao QR chưa có trong bộ nhớ cục bộ
  if (!storedRecord && candidateKeys.length > 0) {
    for (const key of candidateKeys) {
      const remoteFound = await lookupAssignmentFromCloudSqlOrPeers(
        key,
        qTeacher.toLowerCase(),
        req
      );
      if (remoteFound && hasValidExamPayload(remoteFound.exam)) {
        storedRecord = remoteFound;
        break;
      }
    }
  }

  if (!storedRecord && candidateKeys.length === 0) {
    const latest =
      (qTeacher
        ? sharedAssignmentsMap.get(`teacher_latest__${qTeacher.toLowerCase()}`)
        : null) ||
      sharedAssignmentsMap.get('__latest_active__') ||
      (await lookupAssignmentFromCloudSqlOrPeers('active', qTeacher.toLowerCase(), req));
    if (latest && hasValidExamPayload(latest.exam)) {
      storedRecord = latest;
    }
  }

  let resolvedExam = storedRecord?.exam || null;
  if (!resolvedExam) {
    for (const key of candidateKeys) {
      const customFound = sharedCustomExams.find(
        (e: any) =>
          String(e?.id || '').toLowerCase() === key.toLowerCase() ||
          String(e?.code || '').toLowerCase() === key.toLowerCase()
      );
      if (hasValidExamPayload(customFound)) {
        resolvedExam = customFound;
        break;
      }
      const uploadedFound = sharedUploadedExams.find(
        (e: any) =>
          String(e?.id || '').toLowerCase() === key.toLowerCase() ||
          String(e?.code || '').toLowerCase() === key.toLowerCase()
      );
      if (hasValidExamPayload(uploadedFound)) {
        resolvedExam = uploadedFound;
        break;
      }
      const builtinFound = findBuiltinExamOnServer(key);
      if (builtinFound) {
        resolvedExam = builtinFound;
        break;
      }
    }
  }

  if (!resolvedExam) {
    resolvedExam = builtinExamsCatalog[0] || {
      id: 'de-chuan-01',
      code: '101',
      title: 'Đề Thi Tốt Nghiệp THPT Mẫu Số 01 - Chuẩn Ma Trận',
      durationMinutes: 50,
      partI: [],
      partII: [],
    };
  }

  const savedCfg: Record<string, any> = storedRecord?.config || {};
  const qDuration = parseInt(String(req.query.duration || ''), 10);
  const durationMinutes =
    !isNaN(qDuration) && qDuration > 0
      ? qDuration
      : savedCfg.durationMinutes || resolvedExam.durationMinutes || 50;

  const className =
    String(req.query.class || '').trim() ||
    savedCfg.className ||
    'Ôn THPT';

  const shuffleQuestions =
    req.query.shuffle !== undefined
      ? String(req.query.shuffle) === '1'
      : Boolean(savedCfg.shuffleQuestions);

  const showSolutionsAfterSubmit =
    req.query.solutions !== undefined
      ? String(req.query.solutions) !== '0'
      : savedCfg.showSolutionsAfterSubmit !== false;

  const teacherNote =
    String(req.query.note || '').trim() ||
    savedCfg.teacherNote ||
    'Yêu cầu các em làm bài nghiêm túc, không sử dụng tài liệu.';

  const teacherUsername = String(
    qTeacher || savedCfg.teacherUsername || ''
  ).trim();
  let teacherName = String(
    req.query.teacherName || savedCfg.teacherName || ''
  ).trim();
  if (teacherUsername && !teacherName) {
    const { users } = loadDataUsers(false);
    const matchedTeacher = users.find(
      (u) =>
        cleanAuthString(u.username).toLowerCase() ===
        cleanAuthString(teacherUsername).toLowerCase()
    );
    if (matchedTeacher?.fullName) {
      teacherName = matchedTeacher.fullName;
    }
  }

  const finalExam = prepareExamForStudentOnServer(
    resolvedExam,
    shuffleQuestions,
    `${resolvedExam.id}_${resolvedExam.code}`
  );

  // Kiểm tra khóa link QR: nếu Giáo viên đã bấm "Kết thúc bài thi ngay", chặn học sinh mới truy cập vào làm thêm
  const closedInfo = await resolveClosedSessionInfoAsync({
    examId: finalExam.id,
    examCode: finalExam.code,
    teacherUsername,
    record: storedRecord,
    req,
  });
  if (closedInfo.isClosed) {
    const lockedHtml = renderClosedExamHtml(finalExam, closedInfo);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.status(200).send(lockedHtml);
  }

  const html = renderStudentExamHtml(finalExam, {
    examId: finalExam.id,
    examCode: finalExam.code,
    className,
    durationMinutes,
    shuffleQuestions,
    showSolutionsAfterSubmit,
    teacherNote,
    teacherUsername,
    teacherName,
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  return res.status(200).send(html);
  } catch (err) {
    return next(err);
  }
}

app.use(handleStudentExamHtmlRequest);

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const distIndexHtml = path.join(distPath, 'index.html');
  const isProd =
    process.env.NODE_ENV === 'production' ||
    process.env.npm_lifecycle_event === 'start';

  if (!isProd || !fs.existsSync(distIndexHtml)) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(
      express.static(distPath, {
        index: false,
      })
    );
    app.use(
      '/onthithptcnnn',
      express.static(distPath, {
        index: false,
      })
    );
    app.get('*', (req: Request, res: Response) => {
      if (
        /^\/(?:onthithptcnnn\/)?assets\//i.test(req.path) ||
        /\.(?:js|mjs|css|map|png|jpe?g|gif|svg|ico|webp|woff2?|ttf|eot|pdf)$/i.test(req.path)
      ) {
        return res.status(404).send('Asset not found');
      }
      if (fs.existsSync(distIndexHtml)) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.sendFile(distIndexHtml);
      } else {
        res.status(404).send('Build not found. Please run npm run build.');
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[Agritech Exam Server] Running at http://0.0.0.0:${PORT} (mode: ${isProd ? 'production' : 'development'})`
    );
  });

  // In standalone Cloud Run deployments where NGINX is not running on process.env.PORT (e.g. 8080)
  // even if NGINX_PORT env var was inherited from the base image, also bind process.env.PORT safely.
  const cloudRunPort = Number(process.env.PORT || 0);
  if (cloudRunPort > 0 && cloudRunPort !== PORT) {
    const extraServer = app.listen(cloudRunPort, '0.0.0.0', () => {
      console.log(`[Agritech Exam Server] Also listening on Cloud Run PORT http://0.0.0.0:${cloudRunPort}`);
    });
    extraServer.on('error', () => {
      // Port is already handled by Nginx proxy in dev/preview container; ignore safely.
    });
  }

  // Graceful shutdown
  const shutdown = () => {
    server.close(() => {
      console.log('Server shut down cleanly');
      process.exit(0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
