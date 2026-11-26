export type GradeLevel = '10' | '11' | '12';
export type SubjectDomain = 'crop' | 'husbandry' | 'forestry' | 'aquaculture';
export type CognitiveLevel = 'NB' | 'TH' | 'VD'; // Nhận biết, Thông hiểu, Vận dụng

export interface ExamTableCell {
  text: string;
  colSpan?: number;
  rowSpan?: number;
  isHeader?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface ExamTableRow {
  isHeader?: boolean;
  cells: ExamTableCell[];
}

export interface ExamTableData {
  caption?: string;
  headers: string[];
  rows: (string | number)[][];
  source?: string;
  note?: string;
  /** Phần trăm độ rộng cố định của từng cột (tổng = 100) để cố định bố cục bảng */
  colWidths?: number[];
  /** Căn lề chuẩn của từng cột */
  alignments?: ('left' | 'center' | 'right')[];
  /** Cấu trúc hàng/ô chi tiết khi bảng gốc có gộp ô (colSpan / rowSpan) */
  structuredRows?: ExamTableRow[];
}

export interface ExamChartItem {
  label: string;
  subLabel?: string;
  value: number;
  displayValue?: string;
  highlight?: boolean;
}

export interface ExamChartSeries {
  name: string;
  values: (number | null)[];
  displayValues?: string[];
  color?: string;
}

export interface ExamChartData {
  caption?: string;
  type: 'bar' | 'column' | 'line' | 'pie' | 'area';
  unit?: string;
  /** Dữ liệu 1 chuỗi (tương thích hoàn toàn với các biểu đồ có sẵn) */
  items: ExamChartItem[];
  /** Nhãn trục ngang (dùng cho biểu đồ nhiều chuỗi trích xuất từ Word/Excel) */
  categories?: string[];
  /** Danh sách các chuỗi số liệu (dùng cho biểu đồ cột nhóm, đường nhiều chuỗi...) */
  series?: ExamChartSeries[];
  source?: string;
  note?: string;
}

export interface MultipleChoiceQuestion {
  id: string;
  number: number; // 1 to 24 (hoặc toàn bộ số câu trong đề tải lên)
  originalNumber?: number; // Số thứ tự câu gốc trong tài liệu PDF/Word
  grade: GradeLevel;
  domain: SubjectDomain;
  level: CognitiveLevel;
  question: string;
  imageUrl?: string;
  images?: string[];
  subStatements?: string[];
  tableData?: ExamTableData;
  extraTables?: ExamTableData[];
  chartData?: ExamChartData;
  extraCharts?: ExamChartData[];
  questionFooter?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  textbookRef?: string; // Ví dụ: "Bài 4: Đất trồng - Công nghệ 10 KNTT"
  needsReview?: boolean; // Đánh dấu câu lệch định dạng cần người dùng kiểm tra
  reviewReason?: string;
}

export interface TrueFalseStatement {
  subId: 'a' | 'b' | 'c' | 'd';
  text: string;
  level: CognitiveLevel; // 1 NB, 1 TH, 2 VD
  isCorrect: boolean; // true = Đúng, false = Sai
  explanation: string;
}

export interface TrueFalseQuestion {
  id: string;
  number: number; // 1 to 4 (tương ứng câu 25 to 28)
  originalNumber?: number;
  domain: SubjectDomain;
  scenario: string; // Tình huống thực tiễn cụ thể
  scenarioTitle: string;
  imageUrl?: string;
  images?: string[];
  citation?: string; // Nguồn nghiên cứu khoa học rõ ràng (Tác giả, năm, Tạp chí, tập, số, trang)
  tableData?: ExamTableData;
  extraTables?: ExamTableData[];
  chartData?: ExamChartData;
  extraCharts?: ExamChartData[];
  statements: [TrueFalseStatement, TrueFalseStatement, TrueFalseStatement, TrueFalseStatement];
  textbookRef?: string;
  needsReview?: boolean;
  reviewReason?: string;
}

export interface ShortAnswerQuestion {
  id: string;
  number: number;
  originalNumber?: number;
  domain?: SubjectDomain;
  question: string;
  imageUrl?: string;
  images?: string[];
  tableData?: ExamTableData;
  extraTables?: ExamTableData[];
  chartData?: ExamChartData;
  extraCharts?: ExamChartData[];
  expectedAnswer?: string;
  explanation?: string;
  textbookRef?: string;
  needsReview?: boolean;
  reviewReason?: string;
}

export interface Exam {
  id: string;
  code: string; // Mã đề: 101, 102, ...
  title: string;
  description: string;
  durationMinutes: number; // 50 phút
  partI: MultipleChoiceQuestion[]; // 24 câu (6.0 điểm)
  partII: TrueFalseQuestion[]; // 4 câu (4.0 điểm)
  partIII?: ShortAnswerQuestion[]; // Phần III: Trả lời ngắn / Tự luận (nếu có trong tài liệu tải lên)
}

export interface UserExamAnswers {
  partI: Record<string, 'A' | 'B' | 'C' | 'D' | null>; // questionId -> answer
  partII: Record<string, Record<'a' | 'b' | 'c' | 'd', boolean | null>>; // questionId -> subId -> boolean | null
  bookmarked: Record<string, boolean>; // id -> isBookmarked
  timeRemainingSeconds: number;
  timeSpentSeconds: number;
  studentInfo?: {
    name: string;
    studentClass: string;
    studentId?: string;
  };
  violationCount?: number; // Số lần rời giao diện làm bài thi
  autoSubmittedByTeacher?: boolean; // Giáo viên bấm kết thúc bài thi sớm -> tự động thu bài
}

export interface PartIIScoreBreakdown {
  correctStatementsCount: number;
  earnedScore: number;
}

export interface ExamResultSummary {
  examId: string;
  examCode: string;
  examTitle: string;
  completedAt: string;
  totalScore: number;
  partIScore: number; // / 6.0
  partIIScore: number; // / 4.0
  partICorrectCount: number; // / 24
  partIICorrectStatementsCount: number; // / 16
  partIIQuestionsScore: Record<string, PartIIScoreBreakdown>;
  domainScores: {
    crop: { correct: number; total: number; score: number };
    husbandry: { correct: number; total: number; score: number };
    forestry: { correct: number; total: number; score: number };
    aquaculture: { correct: number; total: number; score: number };
  };
  levelScores: {
    NB: { correct: number; total: number };
    TH: { correct: number; total: number };
    VD: { correct: number; total: number };
  };
  timeSpentSeconds: number;
  studentInfo?: {
    name: string;
    studentClass: string;
    studentId?: string;
  };
  violationCount?: number;
  autoSubmittedByTeacher?: boolean;
}
