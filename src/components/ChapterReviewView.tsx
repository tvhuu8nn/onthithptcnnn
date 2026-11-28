import React, { useState, useEffect, useRef } from 'react';
import {
  CHAPTER_REVIEW_DATA,
  SGK_GLOSSARY,
  ChapterReviewItem,
  CognitiveLevel,
} from '../data/chapterReviewData';
import {
  Search,
  X,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  FileText,
  Network,
  Bookmark,
  Download,
  FileDown,
  Printer,
  BookOpenCheck,
  Lock,
  QrCode,
  Play,
  UploadCloud,
  BookOpen,
  PenTool,
  ArrowRight,
  ArrowLeft,
  ClipboardList,
} from 'lucide-react';
import { AuthUser } from '../types/auth';
import { Exam } from '../types/exam';
import { ExternalExamItem } from '../data/provincialAndOfficialExams';
import { ProvincialAndOfficialExamsView } from './ProvincialAndOfficialExamsView';
import { GRADE_10_CHAPTER_EXAMS } from '../data/grade10PracticeExams';
import { GRADE_11_CHAPTER_EXAMS } from '../data/grade11PracticeExams';
import { GRADE_12_SINGLE_CHAPTER_EXAMS } from '../data/grade12ChapterExams';
import { Grade10And11ChapterFiveExamsPanel } from './Grade10And11ChapterFiveExamsPanel';
import { Grade12ChapterFourExamsPanel } from './Grade12ChapterFourExamsPanel';
import { KhbdLessonPlanSection } from './KhbdLessonPlanSection';
import { downloadHtmlAsDocx, trackDocumentDownload } from '../utils/examDownloader';

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

const GRADE_META: Record<
  '10' | '11' | '12',
  {
    gradeLabel: string;
    bookName: string;
    chapterCount: number;
    examsPerChapter: number;
    totalExams: number;
    reviewTitle: string;
    practiceTitle: string;
    reviewDescription: string;
    practiceDescription: string;
    searchPlaceholder: string;
  }
> = {
  '10': {
    gradeLabel: 'Lớp 10',
    bookName: 'Công Nghệ Trồng Trọt 10',
    chapterCount: 8,
    examsPerChapter: 5,
    totalExams: 40,
    reviewTitle: 'Lớp 10 – Ôn Tập Chương (Công Nghệ Trồng Trọt)',
    practiceTitle: 'Lớp 10 – Luyện Đề Theo Chương (8 Chương × 5 Đề)',
    reviewDescription:
      'Hệ thống hóa trọn bộ 8 Chương Công nghệ Trồng trọt Lớp 10 (SGK Kết nối tri thức) theo sơ đồ tư duy, kiến thức cốt lõi, đáp án câu hỏi ôn tập SGK cùng ngân hàng 35 câu TN + 4 câu Đúng/Sai mỗi chương.',
    practiceDescription:
      'Trọn bộ 40 Đề luyện tập Lớp 10 được nhóm theo từng chương (8 Chương × 5 Đề theo ma trận/chương). Mỗi đề sử dụng 100% kiến thức của chính chương đó (24 câu TN + 4 câu Đúng/Sai), hỗ trợ làm bài trực tuyến, tải Word (.docx) và giao Mã QR.',
    searchPlaceholder:
      'Tìm nhanh chương, bài học hoặc câu hỏi Lớp 10 (VD: keo đất, đất chua, xơ dừa, phân bón vi sinh, sâu bệnh hại...)...',
  },
  '11': {
    gradeLabel: 'Lớp 11',
    bookName: 'Công Nghệ Chăn Nuôi 11',
    chapterCount: 6,
    examsPerChapter: 5,
    totalExams: 30,
    reviewTitle: 'Lớp 11 – Ôn Tập Chương (Công Nghệ Chăn Nuôi)',
    practiceTitle: 'Lớp 11 – Luyện Đề Theo Chương (6 Chương × 5 Đề)',
    reviewDescription:
      'Hệ thống hóa trọn bộ 6 Chương Công nghệ Chăn nuôi Lớp 11 (SGK Kết nối tri thức) theo sơ đồ tư duy, kiến thức cốt lõi, đáp án câu hỏi ôn tập SGK cùng ngân hàng 35 câu TN + 4 câu Đúng/Sai mỗi chương.',
    practiceDescription:
      'Trọn bộ 30 Đề luyện tập Lớp 11 được nhóm theo từng chương (6 Chương × 5 Đề theo ma trận/chương). Mỗi đề sử dụng 100% kiến thức của chính chương đó (24 câu TN + 4 câu Đúng/Sai), hỗ trợ làm bài trực tuyến, tải Word (.docx) và giao Mã QR.',
    searchPlaceholder:
      'Tìm nhanh chương, bài học hoặc câu hỏi Lớp 11 (VD: cấy truyền phôi, thức ăn ủ chua, vaccine, PRRS, chuồng kín...)...',
  },
  '12': {
    gradeLabel: 'Lớp 12',
    bookName: 'Công Nghệ Lâm Nghiệp & Thủy Sản 12',
    chapterCount: 10,
    examsPerChapter: 4,
    totalExams: 40,
    reviewTitle: 'Lớp 12 – Ôn Tập Chương (Lâm Nghiệp & Thủy Sản)',
    practiceTitle: 'Lớp 12 – Luyện Đề Theo Chương (10 Chương × 4 Đề)',
    reviewDescription:
      'Hệ thống hóa trọn bộ 10 Chương Công nghệ Lâm nghiệp (4 chương) & Thủy sản (6 chương) Lớp 12 (SGK Kết nối tri thức) theo sơ đồ tư duy, kiến thức cốt lõi và ngân hàng 30 câu TN + 4 câu Đúng/Sai mỗi chương.',
    practiceDescription:
      'Trọn bộ 40 Đề luyện tập Lớp 12 được nhóm rõ ràng theo từng chương (10 Chương × 4 Đề/chương chuẩn cấu trúc Tốt nghiệp THPT 2026 – Mã đề 0716: 24 câu Phần I + 4 câu Đúng/Sai thực nghiệm có bảng số liệu & biểu đồ Phần II).',
    searchPlaceholder:
      'Tìm nhanh chương, bài học hoặc đề Lớp 12 (VD: rừng phòng hộ, khai thác rừng, RAS, Biofloc, VietGAP thủy sản...)...',
  },
};

interface ChapterReviewViewProps {
  activeGrade: '10' | '11' | '12';
  activeMode: 'review' | 'practice';
  onChangeMode?: (mode: 'review' | 'practice') => void;
  currentUser?: AuthUser | null;
  canTakeExam?: boolean;
  canDownloadDocuments?: boolean;
  onRequireLogin?: (reason?: string) => void;
  onRequireVipUpgrade?: () => void;
  onStartExam?: (exam: Exam) => void;
  onAssignQr?: (exam: Exam) => void;
  onPrintExam?: (exam: Exam) => void;
  uploadedExams?: ExternalExamItem[];
  onUploadExamSuccess?: (newExam: ExternalExamItem) => void;
  onDeleteUploadedExam?: (examId: string) => void;
}

export const ChapterReviewView: React.FC<ChapterReviewViewProps> = ({
  activeGrade,
  activeMode,
  onChangeMode,
  currentUser,
  canTakeExam = true,
  canDownloadDocuments = true,
  onRequireLogin,
  onRequireVipUpgrade,
  onStartExam,
  onAssignQr,
  onPrintExam,
  uploadedExams = [],
  onUploadExamSuccess,
  onDeleteUploadedExam,
}) => {
  const [utilityView, setUtilityView] = useState<
    'none' | 'khbd' | 'glossary' | 'download' | 'teacher_docs'
  >('none');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [grade12DomainFilter, setGrade12DomainFilter] = useState<'all' | 'forestry' | 'aquaculture'>(
    'all'
  );
  const [glossaryShowAllGrades, setGlossaryShowAllGrades] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  // Download tab options
  const [downloadMode, setDownloadMode] = useState<'full_guide' | 'student_exam'>('full_guide');
  const [downloadGradeFilter, setDownloadGradeFilter] = useState<'all' | '10' | '11' | '12'>(
    activeGrade
  );

  const pendingChapterIdRef = useRef<string | null>(null);

  // Đồng bộ khi người dùng đổi khối lớp (Lớp 10/11/12) hoặc đổi tab con (Ôn tập chương / Luyện đề) trên Navbar
  useEffect(() => {
    setUtilityView('none');
    if (pendingChapterIdRef.current) {
      setSelectedChapterId(pendingChapterIdRef.current);
      pendingChapterIdRef.current = null;
    } else {
      setSelectedChapterId('all');
    }
    setGrade12DomainFilter('all');
    setDownloadGradeFilter(activeGrade);
    setSearchQuery('');
  }, [activeGrade, activeMode]);

  const gradeMeta = GRADE_META[activeGrade];

  const allChaptersForActiveGrade = CHAPTER_REVIEW_DATA.filter(
    (item) => item.grade === activeGrade
  );
  const totalLessonsForActiveGrade = allChaptersForActiveGrade.reduce(
    (sum, ch) => sum + ch.lessons.length,
    0
  );

  const chaptersByGrade = allChaptersForActiveGrade.filter((item) => {
    if (activeGrade === '12' && grade12DomainFilter !== 'all') {
      return item.domain === grade12DomainFilter;
    }
    return true;
  });

  const filteredChapters = chaptersByGrade.filter((item) => {
    if (selectedChapterId !== 'all' && item.id !== selectedChapterId) {
      return false;
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    const matchTitle =
      item.chapterNumber.toLowerCase().includes(q) ||
      item.chapterTitle.toLowerCase().includes(q) ||
      item.bookTitle.toLowerCase().includes(q);
    const matchLessons = item.lessons.some((l) => l.toLowerCase().includes(q));
    const matchMindmap = item.mindmapNodes.some(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.subItems.some((s) => s.toLowerCase().includes(q))
    );
    const matchCore = item.coreSummary.some((c) => c.toLowerCase().includes(q));
    const matchMcq = item.mcqQuestions.some(
      (qu) =>
        qu.question.toLowerCase().includes(q) ||
        qu.options.some((opt) => opt.toLowerCase().includes(q)) ||
        qu.explanation.toLowerCase().includes(q)
    );
    const matchTf =
      item.tfQuestions?.some(
        (tf) =>
          tf.context.toLowerCase().includes(q) ||
          tf.statements.some(
            (st) =>
              st.text.toLowerCase().includes(q) ||
              st.explanation.toLowerCase().includes(q)
          )
      ) ?? false;
    return (
      matchTitle ||
      matchLessons ||
      matchMindmap ||
      matchCore ||
      matchMcq ||
      matchTf
    );
  });

  const filteredGlossary = SGK_GLOSSARY.filter((g) => {
    if (!glossaryShowAllGrades && g.grade !== activeGrade) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      g.term.toLowerCase().includes(q) ||
      g.definition.toLowerCase().includes(q) ||
      g.pages.toLowerCase().includes(q)
    );
  });

  const getLevelBadge = (level: CognitiveLevel) => {
    switch (level) {
      case 'biet':
        return {
          label: 'Biết',
          fullLabel: 'Nhận biết',
          cls: 'bg-sky-50 text-sky-800 border-sky-200',
        };
      case 'hieu':
        return {
          label: 'Thông hiểu',
          fullLabel: 'Thông hiểu',
          cls: 'bg-amber-50 text-amber-900 border-amber-200',
        };
      case 'vandung':
        return {
          label: 'Vận dụng',
          fullLabel: 'Vận dụng',
          cls: 'bg-purple-50 text-purple-900 border-purple-200',
        };
    }
  };

  const buildChapterTextContent = (
    chapter: ChapterReviewItem,
    mode: 'full_guide' | 'student_exam' = 'full_guide'
  ) => {
    const mcqStructureText =
      chapter.grade === '12'
        ? '30 câu trắc nghiệm nhiều lựa chọn (12 Biết, 9 Thông hiểu, 9 Vận dụng)'
        : '35 câu trắc nghiệm nhiều lựa chọn (20 Nhận biết, 10 Thông hiểu, 5 Vận dụng)';

    const lines: string[] = [
      `==================================================`,
      `【${chapter.bookTitle.toUpperCase()}】`,
      `${chapter.chapterNumber.toUpperCase()}: ${chapter.chapterTitle.toUpperCase()} (${chapter.pageRef})`,
      `==================================================`,
    ];

    if (mode === 'full_guide') {
      lines.push(
        `\nI. CÁC BÀI HỌC TRONG CHƯƠNG:`,
        ...chapter.lessons.map((l) => `  - ${l}`),
        `\nII. SƠ ĐỒ HỆ THỐNG HÓA KIẾN THỨC CHƯƠNG:`,
        ...chapter.mindmapNodes.flatMap((node) => [
          `  ${node.branchNumber}. ${node.title}:`,
          ...node.subItems.map((sub) => `     + ${sub}`),
        ]),
        `\nIII. KIẾN THỨC CỐT LÕI & LƯU Ý ÔN THI:`,
        ...chapter.coreSummary.map((s) => `  * ${s}`),
        ...(chapter.grade !== '12' && chapter.questions && chapter.questions.length > 0
          ? [
              `\nIV. ĐÁP ÁN TRẢ LỜI NGẮN GỌN TRỌNG TÂM CÂU HỎI ÔN TẬP CHƯƠNG (SGK):`,
              ...chapter.questions.flatMap((q) => [
                `  Câu ${q.number}: ${q.question}`,
                ...q.answer.map((ans) => `    -> ${ans}`),
              ]),
            ]
          : [])
      );
    }

    lines.push(
      `\n${mode === 'full_guide' ? 'IV' : 'PHẦN I'}. CÂU HỎI TRẮC NGHIỆM NHIỀU LỰA CHỌN (${mcqStructureText}):`,
      ...chapter.mcqQuestions.flatMap((q) => {
        const lv = getLevelBadge(q.level).fullLabel;
        const base = [
          `  Câu ${q.number} [${lv}]: ${q.question}`,
          ...q.options.map((opt, idx) => `    ${OPTION_LABELS[idx]}. ${opt}`),
        ];
        if (mode === 'full_guide') {
          base.push(
            `    -> Đáp án đúng: ${OPTION_LABELS[q.correctIndex]} | Giải thích: ${q.explanation}`
          );
        }
        return base;
      })
    );

    if (chapter.tfQuestions && chapter.tfQuestions.length > 0) {
      lines.push(
        `\n${
          mode === 'full_guide' ? 'V' : 'PHẦN II'
        }. CÂU HỎI TRẮC NGHIỆM ĐÚNG/SAI (4 câu - mỗi câu 4 ý: 1 Biết, 1 Hiểu, 2 Vận dụng - Có tình huống thực tế & dẫn nguồn cụ thể):`,
        ...chapter.tfQuestions.flatMap((tf) => [
          `  Câu Đúng/Sai ${tf.number}: ${tf.context}`,
          ...(tf.citation ? [`    [Dẫn nguồn: ${tf.citation}]`] : []),
          ...tf.statements.map((st) => {
            const lv = getLevelBadge(st.level).label;
            if (mode === 'full_guide') {
              return `    ${st.label}) [${lv}] ${st.text}\n       -> ${
                st.isTrue ? 'ĐÚNG' : 'SAI'
              } (${st.explanation})`;
            }
            return `    ${st.label}) [${lv}] ${st.text}   [ Đúng / Sai ]`;
          }),
        ])
      );
    }

    if (mode === 'student_exam') {
      lines.push(
        `\n--------------------------------------------------`,
        `BẢNG ĐÁP ÁN CHUẨN (${chapter.chapterNumber} - Lớp ${chapter.grade}):`,
        `  * Trắc nghiệm nhiều lựa chọn:`,
        `    ` +
          chapter.mcqQuestions
            .map((q) => `${q.number}-${OPTION_LABELS[q.correctIndex]}`)
            .join(' | ')
      );
      if (chapter.tfQuestions && chapter.tfQuestions.length > 0) {
        lines.push(
          `  * Trắc nghiệm Đúng/Sai:`,
          ...chapter.tfQuestions.map(
            (tf) =>
              `    Câu ${tf.number}: ` +
              tf.statements
                .map((st) => `${st.label}) ${st.isTrue ? 'Đ' : 'S'}`)
                .join(' ; ')
          )
        );
      }
    }

    return lines.join('\n');
  };

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const buildWordHtmlDocument = (
    chapters: ChapterReviewItem[],
    docTitle: string,
    mode: 'full_guide' | 'student_exam'
  ) => {
    const chaptersHtml = chapters
      .map((chapter, cIdx) => {
        const mcqStructureText =
          chapter.grade === '12'
            ? '30 câu trắc nghiệm nhiều lựa chọn (12 Biết · 9 Thông hiểu · 9 Vận dụng)'
            : '35 câu trắc nghiệm nhiều lựa chọn (20 Nhận biết · 10 Thông hiểu · 5 Vận dụng)';

        const mindmapSection =
          mode === 'full_guide'
            ? `
          <h3 style="color:#065f46; font-size:13pt; margin-top:14pt; margin-bottom:6pt; border-bottom:1px solid #a7f3d0; padding-bottom:3pt;">
            1. SƠ ĐỒ HỆ THỐNG HÓA KIẾN THỨC &amp; TÓM TẮT CỐT LÕI
          </h3>
          <p style="margin:4pt 0; font-size:11pt;"><strong>Các bài học trong chương:</strong> ${chapter.lessons
            .map(escapeHtml)
            .join(' ; ')}</p>
          <table border="1" cellspacing="0" cellpadding="6" style="width:100%; border-collapse:collapse; border:1px solid #cbd5e1; margin-top:6pt; margin-bottom:10pt; font-size:11pt;">
            <thead>
              <tr style="background-color:#ecfdf5; color:#065f46;">
                <th style="width:28%; text-align:left;">Nhánh kiến thức</th>
                <th style="width:72%; text-align:left;">Nội dung trọng tâm chuẩn SGK</th>
              </tr>
            </thead>
            <tbody>
              ${chapter.mindmapNodes
                .map(
                  (node) => `
                <tr>
                  <td style="vertical-align:top; font-weight:bold;">${node.branchNumber}. ${escapeHtml(
                    node.title
                  )}</td>
                  <td style="vertical-align:top;">
                    <ul style="margin:0; padding-left:16pt;">
                      ${node.subItems
                        .map((sub) => `<li style="margin-bottom:3pt;">${escapeHtml(sub)}</li>`)
                        .join('')}
                    </ul>
                  </td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
          <div style="background-color:#f0fdf4; border:1px solid #bbf7d0; padding:8pt; margin-bottom:12pt; font-size:11pt;">
            <strong>Ghi nhớ cốt lõi ôn thi:</strong>
            <ul style="margin:4pt 0 0 0; padding-left:16pt;">
              ${chapter.coreSummary
                .map((s) => `<li style="margin-bottom:3pt;">${escapeHtml(s)}</li>`)
                .join('')}
            </ul>
          </div>`
            : '';

        const mcqHtml = chapter.mcqQuestions
          .map((q) => {
            const lv = getLevelBadge(q.level).fullLabel;
            return `
            <div style="margin-bottom:10pt; page-break-inside:avoid;">
              <p style="margin:0 0 4pt 0; font-size:11.5pt;">
                <strong>Câu ${q.number}</strong> <span style="color:#0369a1; font-size:10.5pt;">[${lv}]</span>: ${escapeHtml(
              q.question
            )}
              </p>
              <table border="0" cellspacing="0" cellpadding="3" style="width:100%; font-size:11pt; margin-left:6pt;">
                <tr>
                  <td style="width:50%; vertical-align:top;"><strong>A.</strong> ${escapeHtml(
                    q.options[0]
                  )}</td>
                  <td style="width:50%; vertical-align:top;"><strong>B.</strong> ${escapeHtml(
                    q.options[1]
                  )}</td>
                </tr>
                <tr>
                  <td style="width:50%; vertical-align:top;"><strong>C.</strong> ${escapeHtml(
                    q.options[2]
                  )}</td>
                  <td style="width:50%; vertical-align:top;"><strong>D.</strong> ${escapeHtml(
                    q.options[3]
                  )}</td>
                </tr>
              </table>
              ${
                mode === 'full_guide'
                  ? `<p style="margin:3pt 0 0 8pt; font-size:10.5pt; color:#065f46;">
                      <em>&rarr; <strong>Đáp án đúng: ${
                        OPTION_LABELS[q.correctIndex]
                      }</strong>. Giải thích: ${escapeHtml(q.explanation)}</em>
                    </p>`
                  : ''
              }
            </div>`;
          })
          .join('');

        const tfHtml =
          chapter.tfQuestions && chapter.tfQuestions.length > 0
            ? `
          <h3 style="color:#0c4a6e; font-size:13pt; margin-top:14pt; margin-bottom:6pt; border-bottom:1px solid #bae6fd; padding-bottom:3pt;">
            ${
              mode === 'full_guide' ? '3' : 'PHẦN II'
            }. CÂU HỎI TRẮC NGHIỆM ĐÚNG / SAI (4 CÂU &times; 4 Ý: 1 CÂU PHÂN TÍCH BIỂU ĐỒ &middot; 1 CÂU PHÂN TÍCH BẢNG SỐ LIỆU &middot; 2 CÂU TÌNH HUỐNG THỰC TẾ)
          </h3>
          ${chapter.tfQuestions
            .map(
              (tf) => `
            <div style="margin-bottom:12pt; page-break-inside:avoid;">
              <p style="margin:0 0 3pt 0; font-size:11.5pt;">
                <strong>Câu Đúng/Sai ${tf.number}:</strong> ${escapeHtml(tf.context)}
              </p>
              ${
                tf.chartData
                  ? `<div style="margin:4pt 0 6pt 0; padding:6pt; border:1px solid #cbd5e1; background-color:#f8fafc;">
                      <p style="margin:0 0 4pt 0; font-size:10.5pt; font-weight:bold; color:#0c4a6e; text-align:center;">
                        BIỂU ĐỒ: ${escapeHtml((tf.chartData.caption || 'PHÂN TÍCH SỐ LIỆU').toUpperCase())}${tf.chartData.unit ? ` (${escapeHtml(tf.chartData.unit)})` : ''}
                      </p>
                      <table border="1" cellspacing="0" cellpadding="4" style="width:100%; border-collapse:collapse; border:1px solid #cbd5e1; font-size:10pt;">
                        <thead>
                          <tr style="background-color:#e0f2fe; color:#0c4a6e;">
                            ${tf.chartData.items
                              .map((item) => `<th style="text-align:center;">${escapeHtml(item.label)}</th>`)
                              .join('')}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            ${tf.chartData.items
                              .map(
                                (item) =>
                                  `<td style="text-align:center; font-weight:bold;">${escapeHtml(item.displayValue || String(item.value))}${
                                    item.subLabel ? `<br/><span style="font-weight:normal; font-size:9pt; color:#475569;">(${escapeHtml(item.subLabel)})</span>` : ''
                                  }</td>`
                              )
                              .join('')}
                          </tr>
                        </tbody>
                      </table>
                      ${
                        tf.chartData.note
                          ? `<p style="margin:3pt 0 0 0; font-size:9.5pt; font-style:italic; text-align:right; color:#475569;">Ghi chú: ${escapeHtml(tf.chartData.note)}</p>`
                          : ''
                      }
                    </div>`
                  : ''
              }
              ${
                tf.tableData
                  ? `<div style="margin:4pt 0 6pt 0;">
                      <p style="margin:0 0 4pt 0; font-size:10.5pt; font-weight:bold; color:#0c4a6e; text-align:center;">
                        ${escapeHtml(tf.tableData.caption || 'BẢNG SỐ LIỆU')}
                      </p>
                      <table border="1" cellspacing="0" cellpadding="4" style="width:100%; border-collapse:collapse; border:1px solid #cbd5e1; font-size:10pt;">
                        <thead>
                          <tr style="background-color:#e0f2fe; color:#0c4a6e;">
                            ${tf.tableData.headers
                              .map((h) => `<th style="text-align:center;">${escapeHtml(h)}</th>`)
                              .join('')}
                          </tr>
                        </thead>
                        <tbody>
                          ${tf.tableData.rows
                            .map(
                              (row) => `
                            <tr>
                              ${row
                                .map(
                                  (cell, cIdx) =>
                                    `<td style="text-align:${cIdx === 0 ? 'left' : 'center'}; ${cIdx === 0 ? 'font-weight:bold;' : ''}">${escapeHtml(String(cell))}</td>`
                                )
                                .join('')}
                            </tr>`
                            )
                            .join('')}
                        </tbody>
                      </table>
                      ${
                        tf.tableData.note
                          ? `<p style="margin:3pt 0 0 0; font-size:9.5pt; font-style:italic; text-align:right; color:#475569;">Ghi chú: ${escapeHtml(tf.tableData.note)}</p>`
                          : ''
                      }
                    </div>`
                  : ''
              }
              ${
                tf.citation
                  ? `<p style="margin:0 0 5pt 0; font-size:10.5pt; color:#0369a1; font-style:italic;">
                      <strong>Dẫn nguồn:</strong> ${escapeHtml(tf.citation)}
                    </p>`
                  : ''
              }
              <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse:collapse; border:1px solid #cbd5e1; font-size:11pt;">
                <thead>
                  <tr style="background-color:#f0f9ff; color:#0c4a6e;">
                    <th style="width:8%; text-align:center;">Ý</th>
                    <th style="width:14%; text-align:center;">Mức độ</th>
                    <th style="width:62%; text-align:left;">Nội dung mệnh đề</th>
                    <th style="width:16%; text-align:center;">${
                      mode === 'full_guide' ? 'Đáp án' : 'Lựa chọn'
                    }</th>
                  </tr>
                </thead>
                <tbody>
                  ${tf.statements
                    .map((st) => {
                      const lv = getLevelBadge(st.level).label;
                      return `
                      <tr>
                        <td style="text-align:center; font-weight:bold;">${st.label})</td>
                        <td style="text-align:center;">${lv}</td>
                        <td>
                          ${escapeHtml(st.text)}
                          ${
                            mode === 'full_guide'
                              ? `<br/><span style="font-size:10pt; color:#065f46;"><em>Giải thích: ${escapeHtml(
                                  st.explanation
                                )}</em></span>`
                              : ''
                          }
                        </td>
                        <td style="text-align:center; font-weight:bold; color:${
                          mode === 'full_guide'
                            ? st.isTrue
                              ? '#047857'
                              : '#b91c1c'
                            : '#334155'
                        };">
                          ${
                            mode === 'full_guide'
                              ? st.isTrue
                                ? 'ĐÚNG'
                                : 'SAI'
                              : '&#9744; Đúng &nbsp; &#9744; Sai'
                          }
                        </td>
                      </tr>`;
                    })
                    .join('')}
                </tbody>
              </table>
            </div>`
            )
            .join('')}`
            : '';

        const answerTableForStudent =
          mode === 'student_exam'
            ? `
          <div style="margin-top:14pt; padding:8pt; background-color:#f8fafc; border:1px solid #cbd5e1; page-break-inside:avoid;">
            <h4 style="margin:0 0 6pt 0; font-size:11.5pt; color:#0f172a;">
              BẢNG ĐÁP ÁN KIỂM TRA (${escapeHtml(chapter.chapterNumber.toUpperCase())} - LỚP ${
                chapter.grade
              })
            </h4>
            <p style="margin:0 0 4pt 0; font-size:10.5pt;">
              <strong>Phần I (Nhiều lựa chọn):</strong>
              ${chapter.mcqQuestions
                .map((q) => `<strong>${q.number}.${OPTION_LABELS[q.correctIndex]}</strong>`)
                .join(' &nbsp;|&nbsp; ')}
            </p>
            ${
              chapter.tfQuestions && chapter.tfQuestions.length > 0
                ? `<p style="margin:4pt 0 0 0; font-size:10.5pt;">
                    <strong>Phần II (Đúng/Sai):</strong>
                    ${chapter.tfQuestions
                      .map(
                        (tf) =>
                          `<strong>Câu ${tf.number}:</strong> ` +
                          tf.statements
                            .map((st) => `${st.label}-${st.isTrue ? 'Đ' : 'S'}`)
                            .join(', ')
                      )
                      .join(' &nbsp;&bull;&nbsp; ')}
                  </p>`
                : ''
            }
          </div>`
            : '';

        return `
        <div style="${cIdx > 0 ? 'page-break-before:always;' : ''} margin-bottom:24pt;">
          <div style="background-color:#ecfdf5; border:2px solid #059669; padding:10pt; margin-bottom:12pt;">
            <p style="margin:0; font-size:10.5pt; color:#047857; font-weight:bold; text-transform:uppercase;">
              ${escapeHtml(chapter.bookTitle)} &bull; ${escapeHtml(chapter.pageRef)}
            </p>
            <h2 style="margin:4pt 0 0 0; font-size:15pt; color:#064e3b; text-transform:uppercase;">
              ${escapeHtml(chapter.chapterNumber)}: ${escapeHtml(chapter.chapterTitle)}
            </h2>
          </div>
          ${mindmapSection}
          <h3 style="color:#065f46; font-size:13pt; margin-top:14pt; margin-bottom:8pt; border-bottom:1px solid #a7f3d0; padding-bottom:3pt;">
            ${
              mode === 'full_guide' ? '2' : 'PHẦN I'
            }. CÂU HỎI TRẮC NGHIỆM NHIỀU LỰA CHỌN (${mcqStructureText.toUpperCase()})
          </h3>
          ${mcqHtml}
          ${tfHtml}
          ${answerTableForStudent}
        </div>`;
      })
      .join('\n');

    return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(docTitle)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: 21cm 29.7cm;
      margin: 2cm 2cm 2cm 2.5cm;
    }
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 12pt;
      line-height: 1.4;
      color: #111827;
    }
  </style>
</head>
<body>
  <div style="text-align:center; margin-bottom:18pt; border-bottom:2px double #047857; padding-bottom:10pt;">
    <h1 style="margin:0; font-size:16pt; color:#064e3b; text-transform:uppercase;">
      ${escapeHtml(docTitle)}
    </h1>
    <p style="margin:4pt 0 0 0; font-size:11pt; color:#374151;">
      Bộ sách Kết nối tri thức với cuộc sống &bull; ${
        mode === 'full_guide'
          ? 'Bản Đề cương đầy đủ (Sơ đồ + Kiến thức cốt lõi + Đáp án & Giải thích)'
          : 'Bản Đề luyện tập dành cho Học sinh (Kèm bảng đáp án cuối bài)'
      }
    </p>
  </div>
  ${chaptersHtml}
</body>
</html>`;
  };

  const triggerFileDownload = (content: string, filename: string) => {
    downloadHtmlAsDocx(content, filename);
  };

  const handleDownloadSingleChapterDoc = (
    chapter: ChapterReviewItem,
    mode: 'full_guide' | 'student_exam' = 'full_guide'
  ) => {
    if (!currentUser) {
      onRequireLogin?.('Vui lòng đăng nhập tài khoản để tải tài liệu ôn tập chương (.docx)!');
      return;
    }
    if (!canDownloadDocuments) {
      onRequireVipUpgrade?.();
      return;
    }
    const docTitle = `ÔN TẬP ${chapter.chapterNumber.toUpperCase()}: ${chapter.chapterTitle.toUpperCase()} - CÔNG NGHỆ LỚP ${
      chapter.grade
    }`;
    const html = buildWordHtmlDocument([chapter], docTitle, mode);
    const suffix = mode === 'full_guide' ? 'De_Cuong_Day_Du' : 'De_Luyen_Tap';
    const filename = `On_Tap_Cong_Nghe_${chapter.grade}_${chapter.id.toUpperCase()}_${suffix}.docx`;
    triggerFileDownload(html, filename);
    trackDocumentDownload({
      fileName: filename,
      documentTitle: `Lớp ${chapter.grade} - ${chapter.chapterNumber}: ${chapter.chapterTitle}`,
      category: 'on_tap_chuong',
      categoryLabel: `Đề Cương Ôn Tập Chương (Lớp ${chapter.grade})`,
      modeLabel: mode === 'full_guide' ? 'Đề cương đầy đủ + Đáp án (.docx)' : 'Đề luyện tập Học sinh (.docx)',
    });
    setDownloadedId(`${chapter.id}-${mode}`);
    setTimeout(() => setDownloadedId(null), 2500);
  };

  const handleDownloadBatchDoc = (
    grade: 'all' | '10' | '11' | '12',
    mode: 'full_guide' | 'student_exam'
  ) => {
    if (!currentUser) {
      onRequireLogin?.('Vui lòng đăng nhập tài khoản để tải trọn bộ tài liệu ôn tập chương (.docx)!');
      return;
    }
    if (!canDownloadDocuments) {
      onRequireVipUpgrade?.();
      return;
    }
    const chapters =
      grade === 'all'
        ? CHAPTER_REVIEW_DATA
        : CHAPTER_REVIEW_DATA.filter((c) => c.grade === grade);

    const gradeLabel =
      grade === 'all'
        ? 'TRỌN BỘ KHỐI 10 - 11 - 12 (24 CHƯƠNG)'
        : grade === '10'
        ? 'TRỌN BỘ CÔNG NGHỆ 10 - TRỒNG TRỌT (8 CHƯƠNG)'
        : grade === '11'
        ? 'TRỌN BỘ CÔNG NGHỆ 11 - CHĂN NUÔI (6 CHƯƠNG)'
        : 'TRỌN BỘ CÔNG NGHỆ 12 - LÂM NGHIỆP & THỦY SẢN (10 CHƯƠNG)';

    const suffix = mode === 'full_guide' ? 'De_Cuong_Co_Dap_An' : 'De_Luyen_Tap_Hoc_Sinh';
    const filePrefix = grade === 'all' ? 'Tron_Bo_24_Chuong_CN10_11_12' : `Tron_Bo_Cong_Nghe_Lop_${grade}`;
    const filename = `${filePrefix}_${suffix}.docx`;

    const html = buildWordHtmlDocument(
      chapters,
      `TÀI LIỆU ÔN TẬP CHƯƠNG - ${gradeLabel}`,
      mode
    );
    triggerFileDownload(html, filename);
    trackDocumentDownload({
      fileName: filename,
      documentTitle: gradeLabel,
      category: 'on_tap_chuong',
      categoryLabel: 'Đề Cương Ôn Tập Chương (SGK 10·11·12)',
      modeLabel: mode === 'full_guide' ? 'Trọn bộ Đề cương + Đáp án (.docx)' : 'Trọn bộ Đề luyện HS (.docx)',
    });

    setDownloadedId(`batch-${grade}-${mode}-doc`);
    setTimeout(() => setDownloadedId(null), 2500);
  };

  const handleCopyChapter = (chapter: ChapterReviewItem) => {
    const text = buildChapterTextContent(chapter, 'full_guide');
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(chapter.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const getDomainBadge = (domain: ChapterReviewItem['domain']) => {
    switch (domain) {
      case 'crop':
        return {
          label: 'Công nghệ Trồng trọt',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          accent: 'border-l-emerald-600',
          headerBg: 'from-emerald-800 to-teal-800',
          nodeBadge: 'bg-emerald-700',
        };
      case 'husbandry':
        return {
          label: 'Công nghệ Chăn nuôi',
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          accent: 'border-l-amber-600',
          headerBg: 'from-amber-700 to-orange-800',
          nodeBadge: 'bg-amber-700',
        };
      case 'forestry':
        return {
          label: 'Lâm nghiệp',
          bg: 'bg-lime-50 text-lime-900 border-lime-300',
          accent: 'border-l-lime-700',
          headerBg: 'from-lime-800 to-emerald-900',
          nodeBadge: 'bg-lime-800',
        };
      case 'aquaculture':
        return {
          label: 'Thủy sản',
          bg: 'bg-sky-50 text-sky-900 border-sky-200',
          accent: 'border-l-sky-600',
          headerBg: 'from-sky-800 to-blue-900',
          nodeBadge: 'bg-sky-700',
        };
    }
  };

  const downloadListChapters = CHAPTER_REVIEW_DATA.filter((ch) => {
    if (downloadGradeFilter !== 'all' && ch.grade !== downloadGradeFilter) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      ch.chapterNumber.toLowerCase().includes(q) ||
      ch.chapterTitle.toLowerCase().includes(q) ||
      ch.bookTitle.toLowerCase().includes(q)
    );
  });

  const bannerHeading =
    utilityView === 'khbd'
      ? `${gradeMeta.gradeLabel} – KHBD (CV 5512 · Tích hợp NLS 3456 & GD AI 2422)`
      : utilityView === 'download'
      ? `${gradeMeta.gradeLabel} – Trung Tâm Tải Về Tài Liệu (.docx)`
      : utilityView === 'glossary'
      ? `${gradeMeta.gradeLabel} – Bảng Giải Thích Thuật Ngữ SGK`
      : utilityView === 'teacher_docs'
      ? `${gradeMeta.gradeLabel} – Kho Tài Liệu Giáo Viên`
      : activeMode === 'practice'
      ? gradeMeta.practiceTitle
      : gradeMeta.reviewTitle;

  const bannerDescription =
    utilityView === 'khbd'
      ? `Hệ thống Kế hoạch bài dạy chuẩn CV 5512/BGDĐT-GDTrH cho ${gradeMeta.bookName}, tích hợp Năng lực số theo Công văn số 3456/BGDĐT-GDPT (27/06/2025) và Khung nội dung giáo dục AI theo Quyết định số 2422/QĐ-BGDĐT (18/08/2026), hỗ trợ xem chi tiết và tải file Word (.docx).`
      : utilityView === 'download'
      ? `Tải nhanh đề cương ôn tập chương, sơ đồ tư duy và bộ đề trắc nghiệm chuẩn định dạng Microsoft Word (.docx) dành cho ${gradeMeta.bookName} hoặc trọn bộ 3 khối lớp.`
      : utilityView === 'glossary'
      ? `Tra cứu nhanh các thuật ngữ chuyên ngành trích xuất nguyên bản từ sách giáo khoa ${gradeMeta.bookName} (Kết nối tri thức với cuộc sống).`
      : utilityView === 'teacher_docs'
      ? `Không gian chia sẻ và lưu trữ tài liệu giảng dạy, đề kiểm tra (.docx, .pdf, .txt) do Giáo viên đăng tải cho khối ${gradeMeta.gradeLabel} và ôn thi THPT.`
      : activeMode === 'practice'
      ? gradeMeta.practiceDescription
      : gradeMeta.reviewDescription;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6">
      {/* Dynamic Emerald Top Banner Header (tự động cập nhật theo khối lớp & tab con) */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-5 sm:p-7 lg:p-8 text-white shadow-md border border-emerald-700/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-emerald-100 text-[11px] sm:text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>
                {gradeMeta.gradeLabel} · {gradeMeta.bookName} · SGK Kết nối tri thức
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight">
              {bannerHeading}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/95 leading-relaxed">
              {bannerDescription}
            </p>
          </div>

          {/* 5 Quick Mode & Utility Stat Cards (Ôn tập chương, Luyện đề, KHBD, Thẻ Tải Về, Tài Liệu GV) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setUtilityView('none');
                onChangeMode?.('review');
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                utilityView === 'none' && activeMode === 'review'
                  ? 'bg-white text-emerald-950 border-white shadow-md'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              <span className="text-[11px] font-bold uppercase opacity-80 flex items-center gap-1">
                <BookOpen className="w-3 h-3 shrink-0" /> Ôn tập chương
              </span>
              <span className="text-base sm:text-lg font-extrabold block mt-0.5">
                {gradeMeta.chapterCount} Chương
              </span>
              <span className="text-[11px] opacity-85 block">Sơ đồ &amp; kiến thức SGK</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUtilityView('none');
                onChangeMode?.('practice');
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                utilityView === 'none' && activeMode === 'practice'
                  ? 'bg-white text-emerald-950 border-white shadow-md'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              <span className="text-[11px] font-bold uppercase opacity-80 flex items-center gap-1">
                <PenTool className="w-3 h-3 shrink-0" /> Luyện đề
              </span>
              <span className="text-base sm:text-lg font-extrabold block mt-0.5">
                {gradeMeta.totalExams} Đề thi
              </span>
              <span className="text-[11px] opacity-85 block">
                {gradeMeta.examsPerChapter} đề / chương
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUtilityView(utilityView === 'khbd' ? 'none' : 'khbd');
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                utilityView === 'khbd'
                  ? 'bg-indigo-200 text-indigo-950 border-indigo-100 shadow-md'
                  : 'bg-indigo-500/30 text-indigo-100 border-indigo-300/40 hover:bg-indigo-500/45'
              }`}
            >
              <span className="text-[11px] font-bold uppercase flex items-center gap-1">
                <ClipboardList className="w-3 h-3 shrink-0" /> KHBD
              </span>
              <span className="text-base sm:text-lg font-extrabold block mt-0.5">
                {totalLessonsForActiveGrade} Bài
              </span>
              <span className="text-[11px] opacity-90 block">5512 · NLS 3456 · AI 2422</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUtilityView(utilityView === 'download' ? 'none' : 'download');
                setDownloadGradeFilter(activeGrade);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                utilityView === 'download'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                  : 'bg-amber-500/25 text-amber-100 border-amber-300/40 hover:bg-amber-500/35'
              }`}
            >
              <span className="text-[11px] font-bold uppercase flex items-center gap-1">
                <Download className="w-3 h-3 shrink-0" /> Thẻ Tải Về
              </span>
              <span className="text-base sm:text-lg font-extrabold block mt-0.5">Tải Word</span>
              <span className="text-[11px] opacity-90 block">Đề cương &amp; Đề ôn</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (utilityView !== 'teacher_docs' && !currentUser && onRequireLogin) {
                  onRequireLogin(
                    'Chỉ người dùng là Giáo viên mới được đăng tài liệu lên hệ thống! Vui lòng đăng nhập tài khoản Giáo viên.'
                  );
                  return;
                }
                setUtilityView(utilityView === 'teacher_docs' ? 'none' : 'teacher_docs');
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                utilityView === 'teacher_docs'
                  ? 'bg-cyan-300 text-slate-950 border-cyan-200 shadow-md'
                  : 'bg-cyan-500/25 text-cyan-100 border-cyan-300/40 hover:bg-cyan-500/35'
              }`}
            >
              <span className="text-[11px] font-bold uppercase flex items-center gap-1">
                <UploadCloud className="w-3 h-3 shrink-0" /> Tài Liệu GV
              </span>
              <span className="text-base sm:text-lg font-extrabold block mt-0.5">
                {currentUser?.role === 'admin' ? 'Khai Thác' : 'Đăng Đề'}
              </span>
              <span className="text-[11px] opacity-90 block">Dành cho Giáo viên</span>
            </button>
          </div>
        </div>
      </div>

      {/* Back bar when viewing a utility sub-view */}
      {utilityView !== 'none' && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-xs">
          <button
            type="button"
            onClick={() => setUtilityView('none')}
            className="inline-flex items-center gap-1.5 font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              Quay lại {activeMode === 'practice' ? 'Luyện đề' : 'Ôn tập chương'} {gradeMeta.gradeLabel}
            </span>
          </button>
          <span className="text-emerald-700 font-semibold hidden sm:inline">
            {gradeMeta.bookName}
          </span>
        </div>
      )}

      {/* Filter & Search Control Box */}
      {utilityView !== 'teacher_docs' && (
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          {/* Search Input + Quick Utility Buttons */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={gradeMeta.searchPlaceholder}
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {utilityView === 'none' && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setUtilityView('khbd')}
                  className="px-3 py-2.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-indigo-700" />
                  <span>KHBD</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUtilityView('glossary')}
                  className="px-3 py-2.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Thuật ngữ SGK</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUtilityView('download');
                    setDownloadGradeFilter(activeGrade);
                  }}
                  className="px-3.5 py-2.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Thẻ tải về</span>
                </button>

                {!currentUser || currentUser.role === 'teacher' || currentUser.role === 'admin' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser && onRequireLogin) {
                        onRequireLogin(
                          'Chỉ người dùng là Giáo viên mới được đăng tài liệu lên hệ thống! Vui lòng đăng nhập tài khoản Giáo viên.'
                        );
                        return;
                      }
                      setUtilityView('teacher_docs');
                    }}
                    className="px-3.5 py-2.5 rounded-lg text-xs font-bold bg-cyan-700 hover:bg-cyan-800 text-white border border-cyan-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>
                      {currentUser?.role === 'admin' ? 'Khai thác tài liệu GV' : 'Đăng tài liệu (GV)'}
                    </span>
                  </button>
                ) : (
                  <span
                    className="px-3 py-2.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center gap-1.5"
                    title="Tài khoản Học sinh không có quyền đăng tài liệu lên hệ thống"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Chỉ GV được đăng tài liệu</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Domain filter for Grade 12 + Status summary */}
          {(utilityView === 'none' || utilityView === 'khbd') && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs text-slate-600 font-medium">
              <div className="flex flex-wrap items-center gap-2">
                <span>
                  {utilityView === 'khbd' ? (
                    <>
                      Đang hiển thị KHBD của{' '}
                      <strong className="text-indigo-800">{filteredChapters.length} chương</strong> (
                      <strong className="text-indigo-800">
                        {filteredChapters.reduce((sum, c) => sum + c.lessons.length, 0)} bài dạy
                      </strong>
                      ) {gradeMeta.gradeLabel}
                    </>
                  ) : activeMode === 'practice' ? (
                    <>
                      Đang hiển thị{' '}
                      <strong className="text-emerald-800">{filteredChapters.length} chương</strong> (
                      <strong className="text-emerald-800">
                        {filteredChapters.length * gradeMeta.examsPerChapter} đề luyện tập
                      </strong>{' '}
                      · {gradeMeta.examsPerChapter} đề/chương)
                    </>
                  ) : (
                    <>
                      Đang hiển thị{' '}
                      <strong className="text-emerald-800">{filteredChapters.length}</strong> chương ôn tập SGK{' '}
                      {gradeMeta.gradeLabel}
                    </>
                  )}
                </span>

                {activeGrade === '12' && (
                  <div className="inline-flex items-center gap-1 ml-1">
                    {(
                      [
                        { id: 'all' as const, label: 'Tất cả (10)' },
                        { id: 'forestry' as const, label: 'Lâm nghiệp (4)' },
                        { id: 'aquaculture' as const, label: 'Thủy sản (6)' },
                      ] as const
                    ).map((dom) => (
                      <button
                        key={dom.id}
                        type="button"
                        onClick={() => {
                          setGrade12DomainFilter(dom.id);
                          setSelectedChapterId('all');
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer border ${
                          grade12DomainFilter === dom.id
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                        }`}
                      >
                        {dom.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedChapterId !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedChapterId('all')}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold underline cursor-pointer"
                >
                  Xem tất cả {chaptersByGrade.length} chương {gradeMeta.gradeLabel} →
                </button>
              )}
            </div>
          )}

          {/* Quick Chapter Pills when viewing chapters, practice exams, or KHBD */}
          {(utilityView === 'none' || utilityView === 'khbd') && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-500 font-medium shrink-0 mr-1">Chọn chương:</span>
                <button
                  type="button"
                  onClick={() => setSelectedChapterId('all')}
                  className={`px-2.5 py-1 rounded-md font-semibold shrink-0 transition-colors cursor-pointer ${
                    selectedChapterId === 'all'
                      ? utilityView === 'khbd'
                        ? 'bg-indigo-800 text-white'
                        : 'bg-emerald-800 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({chaptersByGrade.length} chương)
                </button>
                {chaptersByGrade.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() =>
                      setSelectedChapterId(selectedChapterId === ch.id ? 'all' : ch.id)
                    }
                    className={`px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors border cursor-pointer ${
                      selectedChapterId === ch.id
                        ? utilityView === 'khbd'
                          ? 'bg-indigo-700 text-white border-indigo-700 font-semibold'
                          : 'bg-emerald-700 text-white border-emerald-700 font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                    }`}
                  >
                    {ch.chapterNumber}: {ch.chapterTitle}
                    {utilityView === 'khbd'
                      ? ` (${ch.lessons.length} bài)`
                      : activeMode === 'practice'
                      ? ` (${gradeMeta.examsPerChapter} đề)`
                      : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content: KHBD, Teacher Docs, Download Center, Glossary, Practice Exams (grouped by chapter), or Chapter Review */}
      {utilityView === 'khbd' ? (
        <KhbdLessonPlanSection
          activeGrade={activeGrade}
          bookName={gradeMeta.bookName}
          chapters={filteredChapters}
          allGradeChapters={allChaptersForActiveGrade}
          currentUser={currentUser}
          canDownloadDocuments={canDownloadDocuments}
          onRequireLogin={onRequireLogin}
          onRequireVipUpgrade={onRequireVipUpgrade}
        />
      ) : utilityView === 'teacher_docs' ? (
        <div className="-mx-3 sm:-mx-6 lg:-mx-8 -mt-4">
          <ProvincialAndOfficialExamsView
            fixedCategory="provincial_mock"
            currentUser={currentUser}
            uploadedExams={uploadedExams}
            onUploadExamSuccess={onUploadExamSuccess || (() => {})}
            onDeleteUploadedExam={onDeleteUploadedExam || (() => {})}
            onStartExam={(exam) => onStartExam?.(exam)}
            onAssignQr={(exam) => onAssignQr?.(exam)}
            onPrintExam={(exam) => onPrintExam?.(exam)}
            canDownloadDocuments={canDownloadDocuments}
            onRequireVipUpgrade={onRequireVipUpgrade}
            onRequireLogin={onRequireLogin}
          />
        </div>
      ) : utilityView === 'download' ? (
        <div className="space-y-6">
          {/* Batch Download Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-bold">
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Trung Tâm Tải Về Tài Liệu Ôn Tập Chương (Chuẩn In Ấn A4)</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Tải Về Đề Cương & Bộ Đề Trắc Nghiệm Ôn Tập Chương (Lớp 10 · 11 · 12)
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Hỗ trợ xuất file <strong>Microsoft Word (.docx)</strong> định dạng chuẩn phông chữ Times New Roman, bảng biểu rõ ràng để giáo viên in phát trực tiếp hoặc học sinh lưu về máy tự ôn luyện.
                </p>
              </div>

              {/* Mode Selector */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0">
                <button
                  onClick={() => setDownloadMode('full_guide')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    downloadMode === 'full_guide'
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  <BookOpenCheck className="w-3.5 h-3.5" />
                  <span>Bản Đề cương đầy đủ (Có đáp án & giải thích)</span>
                </button>
                <button
                  onClick={() => setDownloadMode('student_exam')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    downloadMode === 'student_exam'
                      ? 'bg-sky-800 text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Bản Đề học sinh tự luyện (Bảng đáp án ở cuối)</span>
                </button>
              </div>
            </div>

            {/* 4 Batch Download Packages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  grade: '10' as const,
                  title: 'Trọn Bộ Công Nghệ 10',
                  subtitle: 'Công nghệ Trồng trọt (8 Chương)',
                  stats: '280 câu TN (160B · 80H · 40VD) + 32 câu Đúng/Sai',
                  color: 'border-emerald-200 bg-emerald-50/50',
                  btnColor: 'bg-emerald-700 hover:bg-emerald-800 text-white',
                },
                {
                  grade: '11' as const,
                  title: 'Trọn Bộ Công Nghệ 11',
                  subtitle: 'Công nghệ Chăn nuôi (6 Chương)',
                  stats: '210 câu TN (120B · 60H · 30VD) + 24 câu Đúng/Sai',
                  color: 'border-amber-200 bg-amber-50/50',
                  btnColor: 'bg-amber-700 hover:bg-amber-800 text-white',
                },
                {
                  grade: '12' as const,
                  title: 'Trọn Bộ Công Nghệ 12',
                  subtitle: 'Lâm – Thủy sản (10 Chương)',
                  stats: '300 câu TN + 40 câu Đúng/Sai',
                  color: 'border-sky-200 bg-sky-50/50',
                  btnColor: 'bg-sky-700 hover:bg-sky-800 text-white',
                },
                {
                  grade: 'all' as const,
                  title: 'Trọn Bộ Cả 3 Khối 10-11-12',
                  subtitle: 'Toàn bộ 24 Chương SGK',
                  stats: '790 câu TN + 96 câu Đúng/Sai',
                  color: 'border-purple-200 bg-purple-50/50',
                  btnColor: 'bg-slate-900 hover:bg-slate-800 text-white',
                },
              ].map((pkg) => {
                const docKey = `batch-${pkg.grade}-${downloadMode}-doc`;
                return (
                  <div
                    key={pkg.grade}
                    className={`rounded-xl border p-4 flex flex-col justify-between space-y-4 ${pkg.color}`}
                  >
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {pkg.subtitle}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900">{pkg.title}</h3>
                      <p className="text-xs font-semibold text-slate-700">{pkg.stats}</p>
                      <p className="text-[11px] text-slate-500 pt-1">
                        Chế độ:{' '}
                        <strong>
                          {downloadMode === 'full_guide'
                            ? 'Đầy đủ sơ đồ + đáp án chi tiết'
                            : 'Đề luyện tập + bảng đáp án cuối'}
                        </strong>
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handleDownloadBatchDoc(pkg.grade, downloadMode)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${pkg.btnColor}`}
                      >
                        {downloadedId === docKey ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Đã tải file Word (.docx)</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Tải File Word (.docx)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Individual Chapter Download Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Tải Về Từng Chương Riêng Lẻ ({downloadListChapters.length} Chương)
                </h3>
                <p className="text-xs text-slate-500">
                  Chọn tải riêng từng chương dưới dạng <strong>Đề cương có giải chi tiết (.docx)</strong> hoặc <strong>Đề luyện tập cho học sinh (.docx)</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'Tất cả (24)' },
                  { id: '10', label: 'Lớp 10 (8)' },
                  { id: '11', label: 'Lớp 11 (6)' },
                  { id: '12', label: 'Lớp 12 (10)' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setDownloadGradeFilter(g.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                      downloadGradeFilter === g.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {downloadListChapters.map((ch) => {
                const badge = getDomainBadge(ch.domain);
                const fullDocKey = `${ch.id}-full_guide`;
                const examDocKey = `${ch.id}-student_exam`;
                return (
                  <div
                    key={ch.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold">
                          Lớp {ch.grade}
                        </span>
                        <span className={`px-2 py-0.5 rounded border font-semibold ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-slate-500 font-medium">
                          {ch.grade === '12'
                            ? '30 câu TN + 4 câu Đúng/Sai'
                            : '35 câu TN (20 Biết · 10 Hiểu · 5 Vận dụng) + 4 câu Đúng/Sai'}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 pt-0.5">
                        {ch.chapterNumber}: {ch.chapterTitle}
                      </h4>
                      <p className="text-[11px] text-slate-500">{ch.pageRef}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/80">
                      <button
                        onClick={() => handleDownloadSingleChapterDoc(ch, 'full_guide')}
                        className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {downloadedId === fullDocKey ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Đã tải Đề cương</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Tải Đề cương (.docx)</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDownloadSingleChapterDoc(ch, 'student_exam')}
                        className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {downloadedId === examDocKey ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Đã tải Đề HS</span>
                          </>
                        ) : (
                          <>
                            <Printer className="w-3.5 h-3.5" />
                            <span>Tải Đề luyện (.docx)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : utilityView === 'glossary' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-emerald-700" />
                Bảng Giải Thích Thuật Ngữ Chuẩn SGK ({glossaryShowAllGrades ? 'Lớp 10 · 11 · 12' : gradeMeta.gradeLabel})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Trích xuất nguyên bản từ phần Bảng giải thích thuật ngữ cuối sách Công nghệ 10 (trang 143), Công nghệ 11 (trang 118–119) và Công nghệ 12 (trang 144).
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setGlossaryShowAllGrades((prev) => !prev)}
                className="text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 cursor-pointer"
              >
                {glossaryShowAllGrades ? `Chỉ xem ${gradeMeta.gradeLabel}` : 'Xem cả 3 khối'}
              </button>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {filteredGlossary.length} thuật ngữ
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGlossary.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition-all space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{item.term}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                      item.grade === '10'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.grade === '11'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-sky-100 text-sky-900'
                    }`}
                  >
                    SGK Lớp {item.grade}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {item.definition}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">{item.pages}</p>
              </div>
            ))}
          </div>
        </div>
      ) : filteredChapters.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 space-y-3">
          <p className="text-slate-700 font-semibold text-sm">
            Không tìm thấy chương nào khớp với từ khóa &quot;{searchQuery}&quot; trong {gradeMeta.gradeLabel}.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedChapterId('all');
              setGrade12DomainFilter('all');
            }}
            className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer"
          >
            Xem lại toàn bộ {gradeMeta.chapterCount} chương {gradeMeta.gradeLabel}
          </button>
        </div>
      ) : activeMode === 'practice' ? (
        /* TAB CON: LUYỆN ĐỀ — Nhóm danh sách đề theo từng chương (Lớp 10/11: 5 đề/chương · Lớp 12: 4 đề/chương) */
        <div className="space-y-6">
          {filteredChapters.map((chapter) => {
            const badge = getDomainBadge(chapter.domain);
            return (
              <section key={chapter.id} className="space-y-2">
                {chapter.grade === '12' && (
                  <div className="flex flex-wrap items-center gap-2 px-1">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {chapter.chapterNumber}: {chapter.chapterTitle}
                    </span>
                    <span className="text-[11px] text-slate-500">({chapter.pageRef})</span>
                  </div>
                )}

                {(chapter.grade === '10' || chapter.grade === '11') && (
                  <Grade10And11ChapterFiveExamsPanel
                    grade={chapter.grade}
                    chapterId={chapter.id}
                    chapterNumber={chapter.chapterNumber}
                    chapterTitle={chapter.chapterTitle}
                    currentUser={currentUser}
                    canTakeExam={canTakeExam}
                    canDownloadDocuments={canDownloadDocuments}
                    onRequireLogin={onRequireLogin}
                    onRequireVipUpgrade={onRequireVipUpgrade}
                    onStartExam={onStartExam}
                    onAssignQr={onAssignQr}
                  />
                )}

                {chapter.grade === '12' && (
                  <Grade12ChapterFourExamsPanel
                    chapterId={chapter.id}
                    chapterNumber={chapter.chapterNumber}
                    chapterTitle={chapter.chapterTitle}
                    currentUser={currentUser}
                    canTakeExam={canTakeExam}
                    canDownloadDocuments={canDownloadDocuments}
                    onRequireLogin={onRequireLogin}
                    onRequireVipUpgrade={onRequireVipUpgrade}
                    onStartExam={onStartExam}
                    onAssignQr={onAssignQr}
                  />
                )}
              </section>
            );
          })}
        </div>
      ) : (
        /* TAB CON: ÔN TẬP CHƯƠNG — Sơ đồ hệ thống hóa, Kiến thức cốt lõi, Câu hỏi & Đáp án SGK */
        <div className="space-y-8">
          {filteredChapters.map((chapter) => {
            const badge = getDomainBadge(chapter.domain);

            return (
              <article
                key={chapter.id}
                className={`bg-white rounded-2xl border border-slate-200 border-l-4 ${badge.accent} shadow-xs overflow-hidden transition-all`}
              >
                {/* Card Header */}
                <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-md font-bold bg-slate-900 text-white">
                        Lớp {chapter.grade}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-md font-semibold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="text-slate-500 font-medium">{chapter.pageRef}</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      {chapter.chapterNumber}: {chapter.chapterTitle}
                    </h2>
                    {/* Lessons in Chapter */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {chapter.lessons.map((lesson, lIdx) => (
                        <span
                          key={lIdx}
                          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 font-medium"
                        >
                          <FileText className="w-3 h-3 text-emerald-700 shrink-0" />
                          {lesson}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons (Mã QR, Reset, Copy, Download Word, Download Exam) */}
                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
                    {(() => {
                      const chExam = [
                        ...GRADE_10_CHAPTER_EXAMS,
                        ...GRADE_11_CHAPTER_EXAMS,
                        ...GRADE_12_SINGLE_CHAPTER_EXAMS,
                      ].find((e) => e.id === `exam-${chapter.id}`);
                      if (!chExam) return null;
                      return (
                        <>
                          {onStartExam && (
                            <button
                              onClick={() => {
                                if (!currentUser) {
                                  onRequireLogin?.('Vui lòng đăng nhập tài khoản để làm bài thi trong mục Tài nguyên!');
                                  return;
                                }
                                if (!canTakeExam) {
                                  onRequireVipUpgrade?.();
                                  return;
                                }
                                onStartExam(chExam);
                              }}
                              className="px-3 py-2 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              title={
                                !currentUser || !canTakeExam
                                  ? 'Vui lòng đăng nhập tài khoản để làm bài thi trong mục Tài nguyên'
                                  : `Làm bài thi trực tuyến ${chapter.chapterNumber} (${chExam.partI.length} câu TN${chExam.partII.length > 0 ? ` + ${chExam.partII.length} câu Đ/S` : ''})`
                              }
                            >
                              {!currentUser || !canTakeExam ? (
                                <Lock className="w-3.5 h-3.5 text-amber-300" />
                              ) : (
                                <Play className="w-3.5 h-3.5 text-white" />
                              )}
                              <span>Làm bài thi</span>
                            </button>
                          )}
                          <button
                            onClick={() => onAssignQr?.(chExam)}
                            className="px-3 py-2 rounded-lg text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title={
                              !currentUser
                                ? 'Cần đăng nhập tài khoản để tạo mã QR giao đề'
                                : `Tạo mã QR giao bộ câu hỏi ôn tập ${chapter.chapterNumber} (${chExam.partI.length} câu TN${chExam.partII.length > 0 ? ` + ${chExam.partII.length} câu Đ/S` : ''})`
                            }
                          >
                            {!currentUser ? (
                              <Lock className="w-3.5 h-3.5 text-amber-600" />
                            ) : (
                              <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                            )}
                            <span>Mã QR</span>
                          </button>
                        </>
                      );
                    })()}

                    <button
                      onClick={() => handleCopyChapter(chapter)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                        copiedId === chapter.id
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {copiedId === chapter.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Chép đề cương</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDownloadSingleChapterDoc(chapter, 'full_guide')}
                      className="px-3 py-2 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Tải file Word (.docx) đầy đủ sơ đồ, câu hỏi và lời giải chi tiết"
                    >
                      {downloadedId === `${chapter.id}-full_guide` ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã tải Word</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Tải về (.docx)</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDownloadSingleChapterDoc(chapter, 'student_exam')}
                      className="px-3 py-2 rounded-lg text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white border border-sky-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Tải đề luyện tập cho học sinh (ẩn đáp án câu hỏi, kèm bảng đáp án cuối trang)"
                    >
                      {downloadedId === `${chapter.id}-student_exam` ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã tải Đề HS</span>
                        </>
                      ) : (
                        <>
                          <Printer className="w-3.5 h-3.5" />
                          <span>Tải đề luyện (.docx)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Lối tắt nhanh sang Luyện đề của chương này */}
                  {onChangeMode && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
                      <div className="text-xs text-emerald-950">
                        <strong className="font-bold">
                          Bộ {gradeMeta.examsPerChapter} đề luyện tập chuyên sâu cho {chapter.chapterNumber}:
                        </strong>{' '}
                        Làm trực tuyến 50 phút, xem đáp án chi tiết, tải Word hoặc giao Mã QR.
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          pendingChapterIdRef.current = chapter.id;
                          onChangeMode('practice');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-colors shadow-2xs"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Luyện {gradeMeta.examsPerChapter} đề chương này</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* SECTION 1: Sơ đồ hệ thống hóa kiến thức chương (Mindmap) */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-emerald-700" />
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                        1. Sơ Đồ Hệ Thống Hóa Kiến Thức Chương (Theo Sơ Đồ SGK)
                      </h3>
                    </div>

                    <div
                      className={`grid grid-cols-1 ${
                        chapter.mindmapNodes.length === 2
                          ? 'md:grid-cols-2'
                          : chapter.mindmapNodes.length === 4
                          ? 'md:grid-cols-2'
                          : 'lg:grid-cols-3'
                      } gap-4`}
                    >
                      {chapter.mindmapNodes.map((node) => (
                        <div
                          key={node.branchNumber}
                          className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2.5 flex flex-col"
                        >
                          <div className="flex items-start gap-2.5 border-b border-slate-200/80 pb-2.5">
                            <span
                              className={`w-6 h-6 rounded-full ${badge.nodeBadge} text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs`}
                            >
                              {node.branchNumber}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              {node.title}
                            </h4>
                          </div>
                          <ul className="space-y-2 text-xs sm:text-[13px] text-slate-700 leading-relaxed flex-1">
                            {node.subItems.map((sub, sIdx) => (
                              <li key={sIdx} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                                <span>{sub}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECTION 2: Tóm tắt trọng tâm & Chốt kiến thức thi */}
                  <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>2. Kiến Thức Cốt Lõi & Điểm Nhấn Ôn Thi:</span>
                    </div>
                    <ul className="space-y-1.5 text-xs sm:text-[13px] text-emerald-950 leading-relaxed pl-1">
                      {chapter.coreSummary.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <span className="font-bold text-emerald-700">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* SECTION 2B: Câu hỏi & Đáp án trả lời ngắn gọn đúng trọng tâm câu hỏi SGK */}
                  {chapter.grade !== '12' && chapter.questions && chapter.questions.length > 0 && (
                    <div className="bg-amber-50/50 border border-amber-200/90 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-amber-950 font-extrabold text-xs sm:text-sm uppercase tracking-wider">
                          <BookOpenCheck className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>
                            Đáp Án Trả Lời Ngắn Gọn Đúng Trọng Tâm Câu Hỏi Ôn Tập Chương ({chapter.questions.length} Câu SGK)
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-white text-amber-900 border border-amber-200">
                          Ngắn gọn · Súc tích · Đúng trọng tâm
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5">
                        {chapter.questions.map((qa) => (
                          <div
                            key={qa.number}
                            className="bg-white rounded-lg border border-amber-200/80 p-3.5 space-y-1.5 shadow-2xs"
                          >
                            <div className="flex items-start gap-2 text-xs sm:text-[13px] font-bold text-slate-900">
                              <span className="px-2 py-0.5 rounded bg-amber-700 text-white text-[11px] font-extrabold shrink-0">
                                Câu {qa.number}
                              </span>
                              <span>{qa.question}</span>
                            </div>
                            <ul className="space-y-1 pl-2 pt-0.5 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                              {qa.answer.map((ansLine, aIdx) => (
                                <li key={aIdx} className="flex items-start gap-2">
                                  <span className="text-emerald-700 font-extrabold shrink-0">→</span>
                                  <span>{ansLine}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
