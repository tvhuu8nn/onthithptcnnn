import { Exam } from '../types/exam';
import { MOCK_EXAMS } from '../data/mockExams';
import {
  GRADE_10_PRACTICE_EXAMS,
  GRADE_10_CHAPTER_EXAMS,
  ALL_GRADE_10_CHAPTER_MATRIX_EXAMS,
  GRADE_10_EXAMS_BY_CHAPTER,
} from '../data/grade10PracticeExams';
import {
  GRADE_11_PRACTICE_EXAMS,
  GRADE_11_CHAPTER_EXAMS,
  ALL_GRADE_11_CHAPTER_MATRIX_EXAMS,
  GRADE_11_EXAMS_BY_CHAPTER,
} from '../data/grade11PracticeExams';
import {
  ALL_GRADE_12_CHAPTER_EXAMS,
  GRADE_12_EXAMS_BY_CHAPTER,
  GRADE_12_SINGLE_CHAPTER_EXAMS,
  OFFICIAL_EXAM_0716,
} from '../data/grade12ChapterExams';
import { BUILTIN_PROVINCIAL_AND_OFFICIAL_EXAMS } from '../data/provincialAndOfficialExams';
import { generateRandomExam } from '../data/questionBank';
import { authService } from '../services/authService';

export const ALL_BUILTIN_EXAMS: Exam[] = [
  ...MOCK_EXAMS,
  OFFICIAL_EXAM_0716,
  ...BUILTIN_PROVINCIAL_AND_OFFICIAL_EXAMS,
  ...GRADE_10_PRACTICE_EXAMS,
  ...GRADE_10_CHAPTER_EXAMS,
  ...ALL_GRADE_10_CHAPTER_MATRIX_EXAMS,
  ...GRADE_11_PRACTICE_EXAMS,
  ...GRADE_11_CHAPTER_EXAMS,
  ...ALL_GRADE_11_CHAPTER_MATRIX_EXAMS,
  ...ALL_GRADE_12_CHAPTER_EXAMS,
  ...GRADE_12_SINGLE_CHAPTER_EXAMS,
];

export interface ExamAssignmentConfig {
  examId: string;
  examCode: string;
  className?: string;
  durationMinutes: number;
  shuffleQuestions: boolean;
  showSolutionsAfterSubmit: boolean;
  teacherNote?: string;
  teacherUsername?: string;
  teacherName?: string;
  isPermanent?: boolean;
  unlimitedAttempts?: boolean;
  anytimeAccess?: boolean;
}

export interface SavedStudentQrAssignment {
  exam: Exam;
  config: ExamAssignmentConfig;
  savedAt: string;
  lastTakenAt?: string;
}

const STUDENT_QR_ASSIGNMENTS_STORAGE_KEY = 'agritech_student_qr_assignments_v1';

export function getSavedStudentQrAssignments(): SavedStudentQrAssignment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STUDENT_QR_ASSIGNMENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item && item.exam && Array.isArray(item.exam.partI));
    }
  } catch {
    // ignore storage errors
  }
  return [];
}

export function saveStudentQrAssignment(
  exam: Exam,
  config?: Partial<ExamAssignmentConfig>
): SavedStudentQrAssignment[] {
  if (typeof window === 'undefined' || !exam) return [];
  try {
    const { attachedFileDataUrl: _omittedBlob, ...lightExam } = exam as any;
    const normalizedConfig: ExamAssignmentConfig = {
      examId: exam.id,
      examCode: exam.code,
      className: config?.className || 'Ôn THPT',
      durationMinutes: config?.durationMinutes || exam.durationMinutes || 50,
      shuffleQuestions: Boolean(config?.shuffleQuestions),
      showSolutionsAfterSubmit: config?.showSolutionsAfterSubmit !== false,
      teacherNote: config?.teacherNote,
      teacherUsername: config?.teacherUsername,
      teacherName: config?.teacherName,
      isPermanent: true,
      unlimitedAttempts: true,
      anytimeAccess: true,
    };

    try {
      localStorage.setItem(`exam_data_${exam.code}`, JSON.stringify(lightExam));
      localStorage.setItem(`exam_data_${exam.id}`, JSON.stringify(lightExam));
    } catch {}

    const currentList = getSavedStudentQrAssignments();
    const newEntry: SavedStudentQrAssignment = {
      exam: lightExam as Exam,
      config: normalizedConfig,
      savedAt: new Date().toISOString(),
    };
    const nextList = [
      newEntry,
      ...currentList.filter(
        (item) =>
          String(item.exam.id).toLowerCase() !== String(exam.id).toLowerCase() &&
          String(item.exam.code).toLowerCase() !== String(exam.code).toLowerCase()
      ),
    ].slice(0, 30);

    localStorage.setItem(STUDENT_QR_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(nextList));
    return nextList;
  } catch {
    return getSavedStudentQrAssignments();
  }
}

export function removeStudentQrAssignment(examIdOrCode: string): SavedStudentQrAssignment[] {
  if (typeof window === 'undefined') return [];
  const target = String(examIdOrCode || '').trim().toLowerCase();
  try {
    const currentList = getSavedStudentQrAssignments();
    const nextList = currentList.filter(
      (item) =>
        String(item.exam.id).toLowerCase() !== target &&
        String(item.exam.code).toLowerCase() !== target
    );
    localStorage.setItem(STUDENT_QR_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(nextList));
    return nextList;
  } catch {
    return getSavedStudentQrAssignments();
  }
}

const assignmentConfigMemoryCache: Record<string, ExamAssignmentConfig> = {};

/**
 * Lấy cấu hình giao đề đã lưu của đề thi (giúp đồng bộ 100% khi Giáo viên chuyển qua lại giữa cửa sổ Link và Mã QR)
 */
export function getSavedAssignmentConfig(exam: Exam): ExamAssignmentConfig {
  const defaultCfg: ExamAssignmentConfig = {
    examId: exam.id,
    examCode: exam.code,
    className: 'Ôn THPT',
    durationMinutes: exam.durationMinutes || 50,
    shuffleQuestions: false,
    showSolutionsAfterSubmit: true,
    teacherNote: 'Yêu cầu các em làm bài nghiêm túc, không sử dụng tài liệu.',
  };

  if (typeof window === 'undefined') return defaultCfg;

  const mem = assignmentConfigMemoryCache[exam.id] || assignmentConfigMemoryCache[exam.code];
  if (mem) {
    return {
      ...mem,
      examId: exam.id,
      examCode: exam.code,
    };
  }

  try {
    const raw =
      localStorage.getItem(`exam_assign_cfg_${exam.id}`) ||
      localStorage.getItem(`exam_assign_cfg_${exam.code}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultCfg,
        ...parsed,
        examId: exam.id,
        examCode: exam.code,
      };
    }
  } catch {
    // ignore storage errors
  }

  return defaultCfg;
}

/**
 * Lưu cấu hình giao đề hiện tại để đồng bộ tức thì giữa Link và Mã QR
 */
export function saveAssignmentConfig(exam: Exam, config: ExamAssignmentConfig): void {
  const normalized: ExamAssignmentConfig = {
    ...config,
    examId: exam.id,
    examCode: exam.code,
  };
  assignmentConfigMemoryCache[exam.id] = normalized;
  assignmentConfigMemoryCache[exam.code] = normalized;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`exam_assign_cfg_${exam.id}`, JSON.stringify(normalized));
    localStorage.setItem(`exam_assign_cfg_${exam.code}`, JSON.stringify(normalized));
  } catch {
    // ignore storage errors
  }
}

/**
 * Tìm đề thi theo ID hoặc Mã đề (ưu tiên khớp chính xác ID trước, sau đó đến Mã đề, hỗ trợ tái tạo đề ngẫu nhiên từ hạt giống trong ID)
 */
export function findBuiltinExam(idOrCode?: string): Exam | undefined {
  if (!idOrCode) return undefined;
  const raw = idOrCode.trim();
  const normalized = raw.toLowerCase();
  if (!normalized) return undefined;

  // 1. Tái tạo chính xác 100% đề ngẫu nhiên từ hạt giống trong ID: exam-random-{code}-{seed}
  const randomMatch = raw.match(/^exam-random-([a-zA-Z0-9]+)-(\d+)$/i);
  if (randomMatch) {
    const code = randomMatch[1];
    const seed = parseInt(randomMatch[2], 10);
    if (!isNaN(seed) && seed > 0) {
      return generateRandomExam(seed, code);
    }
  }

  // 2. Ưu tiên khớp chính xác theo exam.id trước (tránh xung đột giữa id và code)
  const exactIdMatch = ALL_BUILTIN_EXAMS.find(
    (e) => e.id.toLowerCase() === normalized
  );
  if (exactIdMatch) return exactIdMatch;

  // 3. Khớp chính xác theo exam.code
  const exactCodeMatch = ALL_BUILTIN_EXAMS.find(
    (e) => e.code.toLowerCase() === normalized
  );
  if (exactCodeMatch) return exactCodeMatch;

  // 4. Hỗ trợ alias chương Lớp 10, 11, 12 (VD: cn10-c1, cn11-c1, cn12-c1)
  if (GRADE_10_EXAMS_BY_CHAPTER[normalized]?.length) {
    return GRADE_10_EXAMS_BY_CHAPTER[normalized][0];
  }
  if (GRADE_11_EXAMS_BY_CHAPTER[normalized]?.length) {
    return GRADE_11_EXAMS_BY_CHAPTER[normalized][0];
  }
  if (GRADE_12_EXAMS_BY_CHAPTER[normalized]?.length) {
    return GRADE_12_EXAMS_BY_CHAPTER[normalized][0];
  }

  // 5. Kiểm tra trong localStorage (nếu đề ngẫu nhiên được lưu cục bộ theo id hoặc code)
  if (typeof window !== 'undefined') {
    try {
      const cached =
        localStorage.getItem(`exam_data_${raw}`) ||
        localStorage.getItem(`exam_data_${normalized}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.partI)) {
          return parsed as Exam;
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  return undefined;
}

/**
 * Sao chép văn bản đa nền tảng (tương thích hoàn toàn với Android, iOS Safari/Zalo WebView và Windows)
 */
export async function copyTextCrossPlatform(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below for iOS WebView / Zalo / non-HTTPS context
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(textArea);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Lưu đề giao lên server và localStorage để mọi thiết bị (Điện thoại thông minh Android/iOS, Máy tính)
 * chỉ cần giao bài 1 lần qua mã QR là học sinh có thể quét và làm bài không giới hạn bất cứ thời gian nào (24/7).
 */
export async function syncAssignmentToServer(
  exam: Exam,
  config: ExamAssignmentConfig
): Promise<boolean> {
  const permanentConfig: ExamAssignmentConfig = {
    ...config,
    isPermanent: true,
    unlimitedAttempts: true,
    anytimeAccess: true,
  };
  saveAssignmentConfig(exam, permanentConfig);
  if (typeof window === 'undefined') return false;
  const { attachedFileDataUrl: _omittedBlob, ...lightExam } = exam as any;
  try {
    localStorage.setItem(`exam_data_${exam.code}`, JSON.stringify(lightExam));
    localStorage.setItem(`exam_data_${exam.id}`, JSON.stringify(lightExam));
  } catch {
    // ignore storage quota errors
  }

  // Luôn loại bỏ attachedFileDataUrl (tệp PDF/Word gốc dung lượng lớn) khi đồng bộ đề QR
  // nhưng giữ nguyên 100% ảnh minh họa, bảng biểu (tableData/extraTables), biểu đồ (chartData/extraCharts) và Phần III
  const payloadStr = JSON.stringify({ exam: lightExam, config: permanentConfig });

  const authHeaders = authService.getAuthHeaders({ 'Content-Type': 'application/json' });

  // Đồng bộ chéo sang cả domain đối ứng (ais-dev <-> ais-pre) để mã QR hoạt động vĩnh viễn trên mọi đường dẫn
  try {
    const origin = window.location.origin;
    const peerOrigin = origin.includes('//ais-dev-')
      ? origin.replace('//ais-dev-', '//ais-pre-')
      : origin.includes('//ais-pre-')
      ? origin.replace('//ais-pre-', '//ais-dev-')
      : '';
    if (peerOrigin) {
      fetch(`${peerOrigin}/api/assignments?__storage_access_granted=1`, {
        method: 'POST',
        headers: authHeaders,
        body: payloadStr,
      }).catch(() => {});
    }
  } catch {}

  try {
    const res = await fetch('/api/assignments?__storage_access_granted=1', {
      method: 'POST',
      headers: authHeaders,
      body: payloadStr,
    });
    return res.ok;
  } catch {
    return false;
  }
}

function hashStringSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0 || 123456789;
}

/**
 * Chuẩn bị đề thi cho học sinh:
 * - Mặc định giữ nguyên 100% thứ tự câu hỏi chuẩn của đề (Câu 1 -> Câu N) để đồng bộ tuyệt đối với đề Giáo viên giao.
 * - Nếu Giáo viên chủ động bật shuffleQuestions, sử dụng thuật toán xáo trộn cố định theo mã đề (deterministic shuffle)
 *   để câu hỏi không bao giờ bị nhảy lại giữa chừng khi đang làm bài.
 */
export function prepareExamForStudent(
  exam: Exam,
  shuffleQuestions?: boolean,
  seedKey?: string
): Exam {
  if (!shuffleQuestions || !exam.partI || exam.partI.length <= 1) {
    return exam;
  }
  let a = hashStringSeed(seedKey || `${exam.id}_${exam.code}`);
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
  const renumberedPartI = clonedPartI.map((q, idx) => ({
    ...q,
    number: idx + 1,
  }));
  return {
    ...exam,
    partI: renumberedPartI,
  };
}

let cachedVerifiedOrigin: string | null = null;
let cachedIsPreAlive = false;

/**
 * Kiểm tra xem đường dẫn ais-pre-* đã được kích hoạt trên Cloud Run hay đang trả về lỗi 404 màn hình trắng
 */
export async function resolveVerifiedShareOrigin(): Promise<{
  origin: string;
  isPreAlive: boolean;
}> {
  if (typeof window === 'undefined') {
    return { origin: '', isPreAlive: false };
  }
  const currentOrigin = window.location.origin;
  try {
    const res = await fetch(
      `/api/share-origin-status?origin=${encodeURIComponent(currentOrigin)}`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.recommendedOrigin) {
        cachedVerifiedOrigin = data.recommendedOrigin;
        cachedIsPreAlive = Boolean(data.isPreAlive);
        return {
          origin: data.recommendedOrigin,
          isPreAlive: Boolean(data.isPreAlive),
        };
      }
    }
  } catch {
    // ignore network error
  }
  cachedVerifiedOrigin = currentOrigin;
  cachedIsPreAlive = false;
  return { origin: currentOrigin, isPreAlive: false };
}

/**
 * Tạo URL giao đề kèm cấu hình để chia sẻ Link hoặc tạo Mã QR.
 * Đồng bộ 100% tham số nội dung đề (examId, code, duration, class, shuffle, solutions, note) giữa Link và Mã QR.
 */
export function generateStudentExamUrl(
  exam: Exam,
  config: ExamAssignmentConfig,
  useCurrentOrigin = false,
  isCompactQr = false,
  overrideOrigin?: string
): string {
  if (typeof window === 'undefined') return '';

  const rawOrigin = window.location.origin;
  const resolvedOrigin =
    overrideOrigin && overrideOrigin.trim()
      ? overrideOrigin.trim().replace(/\/+$/, '')
      : useCurrentOrigin
      ? rawOrigin
      : cachedVerifiedOrigin || rawOrigin;
  const safePathCode = encodeURIComponent(exam.code || exam.id || '101');
  const baseUrl = `${resolvedOrigin}/thi/${safePathCode}`;

  const params = new URLSearchParams();
  params.set('mode', 'student');
  params.set('examId', exam.id);
  params.set('code', exam.code);
  params.set('duration', String(config.durationMinutes || exam.durationMinutes || 50));

  try {
    const { attachedFileDataUrl: _omittedBlob, ...lightExam } = exam as any;
    localStorage.setItem(`exam_data_${exam.code}`, JSON.stringify(lightExam));
    localStorage.setItem(`exam_data_${exam.id}`, JSON.stringify(lightExam));
  } catch {
    // ignore quota errors
  }

  if (config.className && config.className.trim()) {
    params.set('class', config.className.trim());
  }
  if (config.shuffleQuestions) {
    params.set('shuffle', '1');
  }
  if (!config.showSolutionsAfterSubmit) {
    params.set('solutions', '0');
  }
  if (config.teacherUsername && config.teacherUsername.trim()) {
    params.set('teacher', config.teacherUsername.trim());
  }
  if (!isCompactQr && config.teacherName && config.teacherName.trim()) {
    params.set('teacherName', config.teacherName.trim());
  }
  if (config.teacherNote && config.teacherNote.trim()) {
    const trimmedNote = config.teacherNote.trim();
    // Đối với QR code, giới hạn độ dài lời dặn trong URL ở mức 80 ký tự để mật độ điểm QR luôn thoáng dễ quét (bản đầy đủ vẫn đồng bộ qua /api/assignments)
    params.set('note', isCompactQr ? trimmedNote.slice(0, 80) : trimmedNote);
  }
  // Giúp iOS Safari / Zalo WebView bỏ qua bước chặn document.cookie tại /__cookie_check.html
  params.set('__storage_access_granted', '1');

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Tạo nội dung tin nhắn thông báo chuẩn để Giáo viên gửi vào nhóm Zalo / Messenger / Google Classroom
 */
export function buildAssignmentMessage(
  exam: Exam,
  config: ExamAssignmentConfig,
  studentExamUrl: string
): string {
  return [
    `📢 THÔNG BÁO LÀM BÀI THI MÔN CÔNG NGHỆ NÔNG NGHIỆP THPT`,
    `📝 Đề thi: ${exam.title}`,
    `🔑 Mã đề / Mã phòng thi: ${exam.code}`,
    `👥 Lớp: ${config.className || 'Toàn khối'}`,
    `⏱ Thời gian làm bài: ${config.durationMinutes} phút`,
    config.teacherNote ? `💬 Lời dặn của Giáo viên: ${config.teacherNote}` : '',
    `👉 Nhấn vào link để vào làm bài ngay: ${studentExamUrl}`,
    `(Hoặc mở ứng dụng và nhập Mã đề: ${exam.code} tại ô Phòng Thi Trực Tuyến)`,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Kết xuất ảnh Thẻ QR Giao Đề chất lượng cao (PNG Blob & DataURL) có đầy đủ Tiêu đề, Mã đề, Lớp, Thời gian
 * để Giáo viên tải về hoặc sao chép dán thẳng vào Zalo / Word / PowerPoint
 */
export function renderBrandedQrCardCanvas(
  svgElement: SVGSVGElement,
  exam: Exam,
  config: ExamAssignmentConfig
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const qrImg = new Image();
      qrImg.onload = () => {
        const width = 640;
        const height = 780;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        // Background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);

        // Top Banner
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(0, 0, width, 130);

        ctx.fillStyle = '#6ee7b7';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('HỆ THỐNG ÔN THI THPT MÔN CÔNG NGHỆ NÔNG NGHIỆP', width / 2, 42);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        const titleText =
          exam.title.length > 44 ? exam.title.slice(0, 42) + '...' : exam.title;
        ctx.fillText(titleText, width / 2, 80);

        ctx.fillStyle = '#fde68a';
        ctx.font = 'bold 17px sans-serif';
        ctx.fillText(
          `Mã đề: ${exam.code}   •   Lớp: ${config.className || 'Toàn khối'}   •   Thời gian: ${config.durationMinutes} phút`,
          width / 2,
          112
        );

        // White Card for QR
        const qrBoxSize = 400;
        const qrBoxX = (width - qrBoxSize) / 2;
        const qrBoxY = 165;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 24);
        ctx.fill();
        ctx.stroke();

        // Draw QR inside white card
        const qrPadding = 32;
        ctx.drawImage(
          qrImg,
          qrBoxX + qrPadding,
          qrBoxY + qrPadding,
          qrBoxSize - qrPadding * 2,
          qrBoxSize - qrPadding * 2
        );

        // Room Code Pill
        ctx.fillStyle = '#ecfdf5';
        ctx.strokeStyle = '#6ee7b7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(110, 590, width - 220, 54, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#065f46';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(
          `MÃ ĐỀ: ${exam.code} • GIAO 1 LẦN - LÀM BÀI KHÔNG GIỚI HẠN MỌI LÚC (24/7)`,
          width / 2,
          624
        );

        // Instructions
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(
          'Học sinh chỉ cần quét mã QR 1 lần để làm bài & thi lại không giới hạn bất cứ thời gian nào',
          width / 2,
          682
        );

        if (config.teacherNote && config.teacherNote.trim()) {
          ctx.fillStyle = '#475569';
          ctx.font = 'italic 14px sans-serif';
          const noteText =
            config.teacherNote.length > 68
              ? config.teacherNote.slice(0, 65) + '...'
              : config.teacherNote;
          ctx.fillText(`Lời dặn: "${noteText}"`, width / 2, 715);
        }

        ctx.fillStyle = '#065f46';
        ctx.font = 'bold 13px sans-serif';
        if (config.teacherUsername || config.teacherName) {
          const tLabel = config.teacherName
            ? `${config.teacherName} (@${config.teacherUsername || ''})`
            : `@${config.teacherUsername}`;
          ctx.fillText(
            `Giáo viên giao bài: ${tLabel} · Điểm tự động đồng bộ về Bảng điểm tài khoản`,
            width / 2,
            752
          );
        } else {
          ctx.fillStyle = '#64748b';
          ctx.font = '13px sans-serif';
          ctx.fillText(
            'Đồng bộ trực tuyến trên Điện thoại Android · iPhone/iPad (iOS) · Máy tính Windows',
            width / 2,
            752
          );
        }

        resolve(canvas);
      };
      qrImg.onerror = (err) => reject(err);
      qrImg.src =
        'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (e) {
      reject(e);
    }
  });
}

function safeDecodeNote(raw: string | null): string | undefined {
  if (!raw) return undefined;
  try {
    const once = decodeURIComponent(raw);
    if (once.includes('%20') || once.includes('%C') || once.includes('%E')) {
      try {
        return decodeURIComponent(once);
      } catch {
        return once;
      }
    }
    return once;
  } catch {
    return raw;
  }
}

/**
 * Đọc tham số URL (từ Path /thi/:id, Query ?mode=student... hoặc Hash #mode=student...)
 * khi học sinh mở ứng dụng bằng đường link hoặc quét mã QR trên điện thoại thông minh / máy tính
 */
export function parseStudentUrlParams(): {
  isStudentMode: boolean;
  examId?: string;
  customCode?: string;
  code?: string;
  durationMinutes?: number;
  className?: string;
  shuffleQuestions?: boolean;
  showSolutionsAfterSubmit?: boolean;
  teacherNote?: string;
  teacherUsername?: string;
  teacherName?: string;
} | null {
  if (typeof window === 'undefined') return null;

  // 1. Check pathname /thi/:key or /s/:key or /exam/:key
  let pathExamKey: string | undefined;
  const pathMatch = window.location.pathname.match(/^\/(?:thi|s|exam)\/([^/?#]+)/i);
  if (pathMatch && pathMatch[1]) {
    try {
      pathExamKey = decodeURIComponent(pathMatch[1]).trim();
    } catch {
      pathExamKey = pathMatch[1].trim();
    }
  }

  // 2. Merge search params and hash params
  const searchParams = new URLSearchParams(window.location.search || '');
  let rawHash = window.location.hash || '';
  if (rawHash.startsWith('#')) rawHash = rawHash.slice(1);
  if (rawHash.includes('?')) rawHash = rawHash.substring(rawHash.indexOf('?') + 1);
  const hashParams = new URLSearchParams(rawHash);

  const getParam = (key: string): string | null => {
    return searchParams.get(key) || hashParams.get(key);
  };

  const mode = getParam('mode');
  const examParam =
    getParam('examId') ||
    getParam('exam') ||
    getParam('code') ||
    getParam('s') ||
    getParam('customCode') ||
    pathExamKey;

  if (mode !== 'student' && !examParam) {
    return null;
  }

  const matched =
    findBuiltinExam(getParam('examId') || undefined) ||
    findBuiltinExam(getParam('code') || undefined) ||
    findBuiltinExam(getParam('s') || undefined) ||
    findBuiltinExam(pathExamKey) ||
    findBuiltinExam(examParam || undefined);

  const durationStr = getParam('duration');
  const parsedDuration = durationStr ? parseInt(durationStr, 10) : NaN;
  const defaultDuration = matched ? matched.durationMinutes : 50;

  return {
    isStudentMode: true,
    examId: getParam('examId') || matched?.id || pathExamKey || examParam || undefined,
    customCode: getParam('customCode') || undefined,
    code: getParam('code') || getParam('s') || matched?.code || pathExamKey || examParam || undefined,
    durationMinutes: !isNaN(parsedDuration) && parsedDuration > 0 ? parsedDuration : defaultDuration,
    className: getParam('class') || undefined,
    shuffleQuestions: getParam('shuffle') === '1',
    showSolutionsAfterSubmit: getParam('solutions') !== '0',
    teacherNote: safeDecodeNote(getParam('note')),
    teacherUsername: (getParam('teacher') || getParam('t') || '').trim() || undefined,
    teacherName: safeDecodeNote(getParam('teacherName')),
  };
}
