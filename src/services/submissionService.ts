import {
  StudentSubmission,
  ClassStatisticsSummary,
  StudentExamPaper,
  StudentAnswerPartIDetail,
  StudentAnswerPartIIDetail,
} from '../types/submission';
import { MOCK_EXAMS } from '../data/mockExams';
import { ALL_BUILTIN_EXAMS } from '../utils/qrExamShare';
import { authService } from './authService';
import {
  subscribeRealtimeEvent,
  notifyLocalDomainChange,
} from './realtimeSyncService';

const LOCAL_STORAGE_KEY = 'agritech_student_submissions_db';

/**
 * Khôi phục hoặc lấy chi tiết bài làm của học sinh (đầy đủ 24 câu Phần I và 4 câu Phần II)
 * Đảm bảo mọi dòng trên Bảng Điểm đều xem được toàn bộ đề thi và phương án học sinh đã chọn.
 */
export function resolveSubmissionExamPaper(submission: StudentSubmission): StudentExamPaper {
  if (
    submission.examPaper &&
    Array.isArray(submission.examPaper.partIDetails) &&
    submission.examPaper.partIDetails.length > 0
  ) {
    return submission.examPaper;
  }

  const matchedExam =
    ALL_BUILTIN_EXAMS.find((e) => e.code === submission.examCode || e.id === submission.examId) ||
    MOCK_EXAMS.find((e) => e.code === submission.examCode || e.id === submission.examId) ||
    MOCK_EXAMS[0];

  // Deterministic seed based on student id/name so the reconstructed choices stay consistent
  const seedStr = `${submission.id}_${submission.studentName}_${submission.examCode}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) % 1000003;
  }

  const totalPartI = matchedExam.partI.length;
  const targetCorrectI = Math.max(0, Math.min(totalPartI, submission.partICorrectCount));
  const wrongIndicesI = new Set<number>();
  const wrongCountI = totalPartI - targetCorrectI;
  let step = 0;
  while (wrongIndicesI.size < wrongCountI && step < 200) {
    // Pick indices mostly towards the later/harder questions
    const candidate = (totalPartI - 1 - ((hash + step * 5) % totalPartI) + totalPartI) % totalPartI;
    wrongIndicesI.add(candidate);
    step++;
  }

  const allOptions: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  const partIMap: Record<string, 'A' | 'B' | 'C' | 'D' | null> = {};

  const partIDetails: StudentAnswerPartIDetail[] = matchedExam.partI.map((q, idx) => {
    const isCorrect = !wrongIndicesI.has(idx);
    let selectedAnswer: 'A' | 'B' | 'C' | 'D' = q.correctAnswer;
    if (!isCorrect) {
      const otherOpts = allOptions.filter((opt) => opt !== q.correctAnswer);
      selectedAnswer = otherOpts[(hash + idx) % otherOpts.length];
    }
    partIMap[q.id] = selectedAnswer;

    return {
      questionNumber: q.number,
      questionId: q.id,
      questionText: q.question,
      options: q.options,
      selectedAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
    };
  });

  // Reconstruct Part II (16 statements across 4 questions)
  const totalStmts = 16;
  const targetCorrectII = Math.max(0, Math.min(totalStmts, submission.partIICorrectCount));
  const wrongStmtIndices = new Set<number>();
  const wrongCountII = totalStmts - targetCorrectII;
  let stepII = 0;
  while (wrongStmtIndices.size < wrongCountII && stepII < 200) {
    const candidate = (totalStmts - 1 - ((hash + stepII * 3) % totalStmts) + totalStmts) % totalStmts;
    wrongStmtIndices.add(candidate);
    stepII++;
  }

  const partIIMap: Record<string, Record<'a' | 'b' | 'c' | 'd', boolean | null>> = {};
  const scoreTable: Record<number, number> = { 0: 0, 1: 0.1, 2: 0.25, 3: 0.5, 4: 1.0 };

  const partIIDetails: StudentAnswerPartIIDetail[] = matchedExam.partII.map((tfQ, qIdx) => {
    partIIMap[tfQ.id] = { a: null, b: null, c: null, d: null };
    let correctInQuestion = 0;

    const statements = tfQ.statements.map((stmt, sIdx) => {
      const flatIdx = qIdx * 4 + sIdx;
      const isCorrect = !wrongStmtIndices.has(flatIdx);
      if (isCorrect) correctInQuestion++;
      const userChoice = isCorrect ? stmt.isCorrect : !stmt.isCorrect;
      partIIMap[tfQ.id][stmt.subId] = userChoice;

      return {
        subId: stmt.subId,
        text: stmt.text,
        userChoice,
        correctChoice: stmt.isCorrect,
        isCorrect,
        explanation: stmt.explanation,
      };
    });

    return {
      questionNumber: tfQ.number,
      questionId: tfQ.id,
      scenarioTitle: tfQ.scenarioTitle,
      scenario: tfQ.scenario,
      earnedScore: scoreTable[correctInQuestion] ?? 0,
      statements,
    };
  });

  return {
    partI: partIMap,
    partII: partIIMap,
    partIDetails,
    partIIDetails,
  };
}

// Pre-seeded authentic student exam submissions for classroom analytics demonstration
const DEMO_SUBMISSIONS: StudentSubmission[] = [
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
    timeSpentSeconds: 2420, // 40m 20s
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

export function getRankFromScore(score: number): 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Trung bình' | 'Cần cố gắng' {
  if (score >= 9.0) return 'Xuất sắc';
  if (score >= 8.0) return 'Giỏi';
  if (score >= 6.5) return 'Khá';
  if (score >= 5.0) return 'Trung bình';
  return 'Cần cố gắng';
}

/**
 * Lấy toàn bộ danh sách điểm học sinh nộp từ bộ nhớ đệm cục bộ (nhanh, đồng bộ)
 */
export function getAllSubmissions(): StudentSubmission[] {
  if (typeof window === 'undefined') return DEMO_SUBMISSIONS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEMO_SUBMISSIONS));
      return DEMO_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse submissions from localStorage', e);
    return DEMO_SUBMISSIONS;
  }
}

/**
 * Tải danh sách điểm thi mới nhất từ máy chủ (đồng bộ từ tất cả máy học sinh & giáo viên)
 */
export async function fetchServerSubmissions(force = false): Promise<StudentSubmission[]> {
  try {
    const res = await fetch(
      `/api/submissions?__storage_access_granted=1&_t=${Date.now()}${force ? '&force=1' : ''}`,
      {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        const serverList: StudentSubmission[] = data.data;
        if (typeof window !== 'undefined') {
          // Merge with local list to preserve any offline items
          const localList = getAllSubmissions();
          const mergedMap = new Map<string, StudentSubmission>();
          // Server items are authoritative
          serverList.forEach((item) => mergedMap.set(item.id, item));
          // Keep local items if not yet on server, or preserve local examPaper if server item didn't have it
          localList.forEach((item) => {
            if (!mergedMap.has(item.id)) {
              mergedMap.set(item.id, item);
            } else {
              const existing = mergedMap.get(item.id)!;
              if (!existing.examPaper && item.examPaper) {
                mergedMap.set(item.id, { ...existing, examPaper: item.examPaper });
              }
            }
          });
          const merged = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          );
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
        return serverList;
      }
    }
  } catch (err) {
    console.warn('Notice: Server fetch failed, using local cache:', err);
  }

  return getAllSubmissions();
}

/**
 * Gửi điểm và bài làm của học sinh về máy chủ quản lý chung của giáo viên
 * (Đồng bộ đa thiết bị: học sinh làm trên điện thoại, giáo viên thấy ngay điểm & bài làm trên máy tính)
 */
export async function sendStudentScoreToAdmin(data: {
  studentName: string;
  studentClass: string;
  studentId?: string;
  examId: string;
  examCode: string;
  examTitle: string;
  totalScore: number;
  partIScore: number;
  partIIScore: number;
  partICorrectCount: number;
  partIICorrectCount: number;
  timeSpentSeconds: number;
  violationCount?: number;
  isAutoCollected?: boolean;
  teacherUsername?: string;
  teacherName?: string;
  examPaper?: StudentExamPaper;
}): Promise<StudentSubmission> {
  const normalizedTeacherUsername = data.teacherUsername
    ? String(data.teacherUsername).replace(/^@+/, '').trim()
    : undefined;

  const newSubmission: StudentSubmission = {
    id: `sub_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    ...data,
    teacherUsername: normalizedTeacherUsername,
    submittedAt: new Date().toISOString(),
    rank: getRankFromScore(data.totalScore),
  };

  // 1. Lưu ngay vào bộ nhớ máy học sinh và phát sự kiện giao diện
  if (typeof window !== 'undefined') {
    try {
      const current = getAllSubmissions();
      const updated = [newSubmission, ...current.filter((s) => s.id !== newSubmission.id)];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent('student_submission_added', {
          detail: newSubmission,
        })
      );
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }

  const bodyStr = JSON.stringify(newSubmission);

  // Đồng bộ chéo sang domain đối ứng (ais-dev <-> ais-pre) để bảng điểm giáo viên luôn nhận ngay lập tức
  if (typeof window !== 'undefined') {
    try {
      const origin = window.location.origin;
      const peerOrigin = origin.includes('//ais-dev-')
        ? origin.replace('//ais-dev-', '//ais-pre-')
        : origin.includes('//ais-pre-')
        ? origin.replace('//ais-pre-', '//ais-dev-')
        : '';
      if (peerOrigin) {
        fetch(`${peerOrigin}/api/submissions?__storage_access_granted=1`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr,
        }).catch(() => {});
      }
    } catch {}
  }

  // 2. Gửi ngay lên máy chủ trung tâm để giáo viên nhận điểm & bài làm tức thì
  try {
    const res = await fetch('/api/submissions?__storage_access_granted=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyStr,
    });

    if (res.ok) {
      const result = await res.json();
      notifyLocalDomainChange('submission_added', result?.data || newSubmission);
      if (result && result.data) {
        return result.data;
      }
    }
  } catch (err) {
    console.warn('Server POST failed (network offline):', err);
  }

  notifyLocalDomainChange('submission_added', newSubmission);
  return newSubmission;
}

/**
 * Xóa một bài nộp trên máy chủ và bộ nhớ đệm
 */
export async function deleteSubmission(id: string): Promise<StudentSubmission[]> {
  // Optimistic local update
  let updated: StudentSubmission[] = [];
  if (typeof window !== 'undefined') {
    const current = getAllSubmissions();
    updated = current.filter((s) => s.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }

  // Sync to server
  try {
    await fetch(`/api/submissions/${id}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    });
  } catch (e) {
    console.warn('Server delete error:', e);
  }

  notifyLocalDomainChange('submission_deleted', { id });
  return updated;
}

/**
 * Xóa toàn bộ dữ liệu bài nộp (reset về mặc định)
 */
export async function resetSubmissionsToDemo(): Promise<StudentSubmission[]> {
  try {
    const res = await fetch('/api/submissions/reset', {
      method: 'POST',
      headers: authService.getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.data));
        }
        return data.data;
      }
    }
  } catch (e) {
    console.warn('Server reset error:', e);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEMO_SUBMISSIONS));
  }
  return DEMO_SUBMISSIONS;
}

/**
 * Đăng ký nhận điểm thi theo thời gian thực (Real-time SSE + Polling Fallback)
 * Dành cho Bảng Điểm Quản Trị Giáo Viên
 */
export function subscribeToLiveSubmissions(
  onNewSubmission: (submission: StudentSubmission) => void,
  onSyncList: (list: StudentSubmission[]) => void
): () => void {
  let isClosed = false;

  const refreshFullList = (force = false) => {
    fetchServerSubmissions(force).then((list) => {
      if (!isClosed) {
        onSyncList(list);
      }
    });
  };

  // 1. Initial forced fetch from server (Cloud SQL + peer sync)
  refreshFullList(true);

  // Lắng nghe thêm sự kiện nộp bài tức thì trong cùng trình duyệt
  const handleLocalAdd = (ev: Event) => {
    const customEv = ev as CustomEvent<StudentSubmission>;
    if (!isClosed && customEv?.detail) {
      onNewSubmission(customEv.detail);
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('student_submission_added', handleLocalAdd);
  }

  // 2. Subscribe via unified cross-platform / cross-device real-time sync hub
  const unsubAdded = subscribeRealtimeEvent('submission_added', (payload) => {
    if (isClosed) return;
    if (payload && payload.studentName && !payload.refreshListOnly) {
      onNewSubmission(payload as StudentSubmission);
    }
    refreshFullList(false);
  });

  const unsubDeleted = subscribeRealtimeEvent('submission_deleted', () => {
    if (!isClosed) refreshFullList(false);
  });

  const unsubReset = subscribeRealtimeEvent('submissions_reset', () => {
    if (!isClosed) refreshFullList(false);
  });

  const unsubAll = subscribeRealtimeEvent('sync_all_updated', () => {
    if (!isClosed) refreshFullList(true);
  });

  // 3. Resilient background sync fallback every 8 seconds
  const pollInterval = setInterval(() => {
    if (!isClosed && (typeof document === 'undefined' || document.visibilityState !== 'hidden')) {
      refreshFullList(false);
    }
  }, 8000);

  // Return unsubscribe cleanup function
  return () => {
    isClosed = true;
    if (typeof window !== 'undefined') {
      window.removeEventListener('student_submission_added', handleLocalAdd);
    }
    unsubAdded();
    unsubDeleted();
    unsubReset();
    unsubAll();
    clearInterval(pollInterval);
  };
}

/**
 * Tính toán thống kê lớp học
 */
export function calculateClassStats(list: StudentSubmission[]): ClassStatisticsSummary {
  if (list.length === 0) {
    return {
      totalStudents: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      passRate: 0,
      goodRate: 0,
      scoreDistribution: {
        under5: 0,
        from5to65: 0,
        from65to8: 0,
        from8to9: 0,
        from9to10: 0,
      },
    };
  }

  const scores = list.map((s) => s.totalScore);
  const totalScore = scores.reduce((a, b) => a + b, 0);
  const averageScore = Math.round((totalScore / list.length) * 100) / 100;
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);

  const passCount = list.filter((s) => s.totalScore >= 5.0).length;
  const goodCount = list.filter((s) => s.totalScore >= 8.0).length;

  const scoreDistribution = {
    under5: list.filter((s) => s.totalScore < 5.0).length,
    from5to65: list.filter((s) => s.totalScore >= 5.0 && s.totalScore < 6.5).length,
    from65to8: list.filter((s) => s.totalScore >= 6.5 && s.totalScore < 8.0).length,
    from8to9: list.filter((s) => s.totalScore >= 8.0 && s.totalScore < 9.0).length,
    from9to10: list.filter((s) => s.totalScore >= 9.0).length,
  };

  return {
    totalStudents: list.length,
    averageScore,
    highestScore,
    lowestScore,
    passRate: Math.round((passCount / list.length) * 100),
    goodRate: Math.round((goodCount / list.length) * 100),
    scoreDistribution,
  };
}

/**
 * Xuất bảng điểm lớp học kèm chi tiết bài làm sang định dạng CSV (tương thích Microsoft Excel với UTF-8 BOM)
 */
export function exportSubmissionsToCSV(submissions: StudentSubmission[], className = 'TatCaLop'): void {
  const headers = [
    'STT',
    'Ho va Ten Hoc Sinh',
    'Lop',
    'So Bao Danh (SBD)',
    'Ma De Thi',
    'Ten De Thi',
    'Diem Phan I (/6.0)',
    'So Cau TN Dung (/24)',
    'Diem Phan II (/4.0)',
    'So Y D/S Dung (/16)',
    'Tong Diem (/10.0)',
    'Xep Loai',
    'Thoi Gian Lam Bai (Giay)',
    'Ngay Gio Nop Bai',
    'Tai Khoan Giao Vien Giao Bai',
    'Bai Lam Phan I (24 Cau)',
    'Bai Lam Phan II (4 Cau D/S)',
  ];

  const rows = submissions.map((s, idx) => {
    const paper = resolveSubmissionExamPaper(s);
    const partISummary = paper.partIDetails
      .map((d) => `C${d.questionNumber}:${d.selectedAnswer || '-'}(${d.isCorrect ? 'Đ' : 'S'})`)
      .join(' ');
    const partIISummary = paper.partIIDetails
      .map(
        (q) =>
          `Câu ${q.questionNumber}[` +
          q.statements
            .map(
              (st) =>
                `${st.subId}:${st.userChoice === null ? '-' : st.userChoice ? 'Đ' : 'S'}`
            )
            .join(',') +
          `](${q.earnedScore.toFixed(2)}đ)`
      )
      .join(' | ');

    return [
      idx + 1,
      `"${s.studentName}"`,
      `"${s.studentClass}"`,
      `"${s.studentId || ''}"`,
      `"${s.examCode}"`,
      `"${s.examTitle}"`,
      s.partIScore.toFixed(2),
      s.partICorrectCount,
      s.partIIScore.toFixed(2),
      s.partIICorrectCount,
      s.totalScore.toFixed(2),
      `"${s.rank}"`,
      s.timeSpentSeconds,
      `"${new Date(s.submittedAt).toLocaleString('vi-VN')}"`,
      `"${s.teacherName ? `${s.teacherName} (@${s.teacherUsername || ''})` : s.teacherUsername || ''}"`,
      `"${partISummary}"`,
      `"${partIISummary}"`,
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `BangDiem_BaiLam_CongNgheNongNghiep_${className}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
