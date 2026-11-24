import React, { useState } from 'react';
import {
  Grade10ChapterMatrixExam,
  GRADE_10_EXAMS_BY_CHAPTER,
} from '../data/grade10PracticeExams';
import {
  Grade11ChapterMatrixExam,
  GRADE_11_EXAMS_BY_CHAPTER,
} from '../data/grade11PracticeExams';
import { AuthUser } from '../types/auth';
import { Exam } from '../types/exam';
import { TrueFalseScenarioDisplay } from './TrueFalseScenarioDisplay';
import { downloadHtmlAsDocx, trackDocumentDownload } from '../utils/examDownloader';
import {
  FileText,
  Check,
  Copy,
  Download,
  Printer,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Sparkles,
  QrCode,
  Lock,
  Play,
  CheckSquare,
} from 'lucide-react';

type ChapterMatrixExam = Grade10ChapterMatrixExam | Grade11ChapterMatrixExam;

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;

interface Grade10And11ChapterFiveExamsPanelProps {
  grade: '10' | '11';
  chapterId: string;
  chapterNumber: string;
  chapterTitle: string;
  currentUser?: AuthUser | null;
  canTakeExam?: boolean;
  canDownloadDocuments?: boolean;
  onRequireLogin?: (reason: string) => void;
  onRequireVipUpgrade?: () => void;
  onStartExam?: (exam: Exam) => void;
  onAssignQr?: (exam: Exam) => void;
}

export function buildChapterMatrixWordHtml(
  exams: ChapterMatrixExam[],
  docTitle: string,
  includeSolutions: boolean,
  grade: '10' | '11'
): string {
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const levelLabel = (lv: 'NB' | 'TH' | 'VD') =>
    lv === 'NB' ? 'Nhận biết' : lv === 'TH' ? 'Thông hiểu' : 'Vận dụng';

  const examsHtml = exams
    .map((exam, idx) => {
      const partIHtml = exam.partI
        .map(
          (q) => `
          <div style="margin-bottom:8pt; page-break-inside:avoid;">
            <p style="margin:0 0 3pt 0; font-size:11.5pt;">
              <strong>Câu ${q.number}</strong> <span style="color:#0369a1; font-size:10pt;">[${levelLabel(
            q.level
          )}]</span>: ${escapeHtml(q.question)}
            </p>
            <table border="0" cellspacing="0" cellpadding="2" style="width:100%; font-size:11pt;">
              <tr>
                <td style="width:50%; vertical-align:top;"><strong>A.</strong> ${escapeHtml(
                  q.options.A
                )}</td>
                <td style="width:50%; vertical-align:top;"><strong>B.</strong> ${escapeHtml(
                  q.options.B
                )}</td>
              </tr>
              <tr>
                <td style="width:50%; vertical-align:top;"><strong>C.</strong> ${escapeHtml(
                  q.options.C
                )}</td>
                <td style="width:50%; vertical-align:top;"><strong>D.</strong> ${escapeHtml(
                  q.options.D
                )}</td>
              </tr>
            </table>
            ${
              includeSolutions
                ? `<p style="margin:2pt 0 0 6pt; font-size:10pt; color:#065f46;">
                    <em>&rarr; <strong>Đáp án: ${q.correctAnswer}</strong>. ${escapeHtml(
                    q.explanation
                  )}</em>
                  </p>`
                : ''
            }
          </div>`
        )
        .join('');

      const partIIHtml = exam.partII
        .map((tf) => {
          const tableHtml = tf.tableData
            ? `<table border="1" cellspacing="0" cellpadding="4" style="width:100%; border-collapse:collapse; border:1px solid #111827; font-size:10.5pt; margin:5pt 0; text-align:center;">
                <thead>
                  <tr style="background-color:#f1f5f9; font-weight:bold;">
                    ${tf.tableData.headers
                      .map((h) => `<th>${escapeHtml(h)}</th>`)
                      .join('')}
                  </tr>
                </thead>
                <tbody>
                  ${tf.tableData.rows
                    .map(
                      (r) =>
                        `<tr>${r
                          .map((c) => `<td>${escapeHtml(String(c))}</td>`)
                          .join('')}</tr>`
                    )
                    .join('')}
                </tbody>
              </table>
              ${
                tf.tableData.note
                  ? `<p style="margin:1pt 0 3pt 0; font-size:9.5pt;"><em>${escapeHtml(
                      tf.tableData.note
                    )}</em></p>`
                  : ''
              }`
            : '';

          const chartHtml = tf.chartData
            ? `<table border="1" cellspacing="0" cellpadding="4" style="width:100%; border-collapse:collapse; border:1px solid #111827; font-size:10.5pt; margin:5pt 0; text-align:center;">
                <thead>
                  <tr style="background-color:#f1f5f9; font-weight:bold;">
                    <th>Nghiệm thức / Công thức thí nghiệm</th>
                    <th>Giá trị${tf.chartData.unit ? ` (${escapeHtml(tf.chartData.unit)})` : ''}</th>
                  </tr>
                </thead>
                <tbody>
                  ${tf.chartData.items
                    .map(
                      (it) =>
                        `<tr>
                          <td style="text-align:left; font-weight:bold;">${escapeHtml(
                            it.label
                          )}</td>
                          <td><strong>${escapeHtml(
                            it.displayValue || String(it.value)
                          )}</strong></td>
                        </tr>`
                    )
                    .join('')}
                </tbody>
              </table>
              ${
                tf.chartData.note
                  ? `<p style="margin:1pt 0 3pt 0; font-size:9.5pt;"><em>${escapeHtml(
                      tf.chartData.note
                    )}</em></p>`
                  : ''
              }`
            : '';

          return `
          <div style="margin-bottom:12pt; page-break-inside:avoid;">
            <p style="margin:0 0 3pt 0; font-size:11.5pt;">
              <strong>Câu ${tf.number}.</strong> ${escapeHtml(tf.scenario)}
            </p>
            ${tableHtml}
            ${chartHtml}
            ${
              tf.citation
                ? `<p style="margin:2pt 0 4pt 0; font-size:9.5pt; color:#0369a1; font-style:italic;">
                    <strong>Dẫn nguồn:</strong> ${escapeHtml(tf.citation)}
                  </p>`
                : ''
            }
            ${tf.statements
              .map(
                (st) => `
              <p style="margin:2pt 0; font-size:11pt;">
                <strong>${st.subId})</strong> <span style="color:#0369a1; font-size:9.5pt;">[${levelLabel(
                  st.level
                )}]</span> ${escapeHtml(st.text)}
                ${
                  includeSolutions
                    ? `<br/><span style="font-size:10pt; color:${
                        st.isCorrect ? '#047857' : '#b91c1c'
                      };"><em>&rarr; <strong>${
                        st.isCorrect ? 'ĐÚNG' : 'SAI'
                      }</strong>: ${escapeHtml(st.explanation)}</em></span>`
                    : ''
                }
              </p>`
              )
              .join('')}
          </div>`;
        })
        .join('');

      const summaryTable = `
        <div style="margin-top:12pt; padding:8pt; border:1px solid #111827; background-color:#f8fafc; page-break-inside:avoid;">
          <p style="margin:0 0 4pt 0; font-weight:bold; font-size:11pt;">
            BẢNG ĐÁP ÁN MÃ ĐỀ ${escapeHtml(exam.code)} (${escapeHtml(exam.chapterNumber)}: ${escapeHtml(
        exam.chapterTitle
      )} – LỚP ${grade})
          </p>
          <p style="margin:0 0 4pt 0; font-size:10.5pt;">
            <strong>PHẦN I (24 câu – 6,0 điểm):</strong> ${exam.partI
              .map((q) => `${q.number}.${q.correctAnswer}`)
              .join(' | ')}
          </p>
          <p style="margin:0; font-size:10.5pt;">
            <strong>PHẦN II (4 câu Đúng/Sai – 4,0 điểm):</strong> ${exam.partII
              .map(
                (tf) =>
                  `Câu ${tf.number}: ` +
                  tf.statements
                    .map((s) => `${s.subId}-${s.isCorrect ? 'Đ' : 'S'}`)
                    .join(', ')
              )
              .join(' ; ')}
          </p>
        </div>`;

      return `
      <div style="${idx > 0 ? 'page-break-before:always;' : ''} margin-bottom:20pt;">
        <div style="display:flex; justify-content:space-between; margin-bottom:8pt; padding-bottom:6pt; border-bottom:1.5px solid #111827; font-size:11pt;">
          <p style="margin:0;"><strong>Chuyên đề Lớp ${grade}:</strong> ${escapeHtml(
            exam.chapterNumber
          )} – ${escapeHtml(exam.chapterTitle)} (Đề số 0${
        exam.examIndexInChapter || 1
      }) &nbsp;|&nbsp; <strong>Mã đề: ${escapeHtml(exam.code)}</strong></p>
        </div>
        <p style="margin:4pt 0 6pt 0; font-size:11.5pt; font-weight:bold;">
          PHẦN I (6,0 điểm): Thí sinh trả lời từ câu 1 đến câu 24 (12 câu Nhận biết · 8 câu Thông hiểu · 4 câu Vận dụng). Mỗi câu đúng được 0,25 điểm.
        </p>
        ${partIHtml}
        <p style="margin:10pt 0 6pt 0; font-size:11.5pt; font-weight:bold;">
          PHẦN II (4,0 điểm): Thí sinh trả lời từ câu 1 đến câu 4. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn Đúng hoặc Sai (Đúng 1 ý: 0,1đ; 2 ý: 0,25đ; 3 ý: 0,5đ; 4 ý: 1,0đ).
        </p>
        ${partIIHtml}
        <p style="text-align:center; font-weight:bold; margin:10pt 0 4pt 0;">---------------- HẾT ----------------</p>
        ${summaryTable}
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
  <style>
    @page { size: 21cm 29.7cm; margin: 1.8cm 1.8cm 1.8cm 2.2cm; }
    body { font-family: "Times New Roman", Times, serif; font-size: 11.5pt; line-height: 1.38; color: #111827; }
  </style>
</head>
<body>
  ${examsHtml}
</body>
</html>`;
}

export const ChapterMatrixExamInteractiveBody: React.FC<{
  exam: ChapterMatrixExam;
  grade: '10' | '11';
  currentUser?: AuthUser | null;
  canTakeExam?: boolean;
  canDownloadDocuments?: boolean;
  onRequireLogin?: (reason: string) => void;
  onRequireVipUpgrade?: () => void;
  onStartExam?: (exam: Exam) => void;
  onAssignQr?: (exam: Exam) => void;
}> = ({
  exam,
  grade,
  currentUser,
  canTakeExam = true,
  canDownloadDocuments = true,
  onRequireLogin,
  onRequireVipUpgrade,
  onStartExam,
  onAssignQr,
}) => {
  const [showAnswers, setShowAnswers] = useState<boolean>(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [levelFilter, setLevelFilter] = useState<'all' | 'NB' | 'TH' | 'VD'>('all');
  const [userPartI, setUserPartI] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [userPartII, setUserPartII] = useState<
    Record<string, Record<'a' | 'b' | 'c' | 'd', boolean>>
  >({});
  const [copied, setCopied] = useState(false);
  const [downloadedMode, setDownloadedMode] = useState<string | null>(null);

  const isExpanded = (key: string) =>
    key in expandedQuestions ? expandedQuestions[key] : showAnswers;

  const toggleExpand = (key: string) =>
    setExpandedQuestions((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? showAnswers),
    }));

  const handleToggleAllAnswers = () => {
    setShowAnswers((prev) => !prev);
    setExpandedQuestions({});
  };

  const handleReset = () => {
    setUserPartI({});
    setUserPartII({});
  };

  // Thang điểm chuẩn:
  // Phần I: 24 câu × 0,25 = 6,0 điểm
  // Phần II: 4 câu, mỗi câu đúng 1 ý -> 0,1đ, 2 ý -> 0,25đ, 3 ý -> 0,5đ, 4 ý -> 1,0đ (tối đa 4,0 điểm)
  const partICorrect = exam.partI.filter((q) => userPartI[q.id] === q.correctAnswer).length;
  const partIScore = partICorrect * 0.25;

  let partIIScore = 0;
  let partIIAnsweredCount = 0;
  exam.partII.forEach((tf) => {
    const u = userPartII[tf.id] || ({} as Record<'a' | 'b' | 'c' | 'd', boolean>);
    let cCount = 0;
    let hasAny = false;
    tf.statements.forEach((st) => {
      if (u[st.subId] !== undefined) {
        hasAny = true;
        if (u[st.subId] === st.isCorrect) cCount++;
      }
    });
    if (hasAny) partIIAnsweredCount++;
    if (cCount === 1) partIIScore += 0.1;
    else if (cCount === 2) partIIScore += 0.25;
    else if (cCount === 3) partIIScore += 0.5;
    else if (cCount === 4) partIIScore += 1.0;
  });

  const totalScore = (partIScore + partIIScore).toFixed(2).replace('.', ',');

  const handleCopyExamText = () => {
    const lines: string[] = [
      `${exam.title.toUpperCase()} (MÃ ĐỀ ${exam.code})`,
      `Chuyên đề: ${exam.chapterNumber} – ${exam.chapterTitle} (Chỉ sử dụng nội dung ${exam.chapterNumber})`,
      `PHẦN I (6,0 điểm): 24 câu trắc nghiệm nhiều lựa chọn (12 Nhận biết · 8 Thông hiểu · 4 Vận dụng)`,
      ...exam.partI.flatMap((q) => [
        `Câu ${q.number}. ${q.question}`,
        `  A. ${q.options.A}`,
        `  B. ${q.options.B}`,
        `  C. ${q.options.C}`,
        `  D. ${q.options.D}`,
        `  -> Đáp án: ${q.correctAnswer} (${q.explanation})`,
      ]),
      `\nPHẦN II (4,0 điểm): 4 câu trắc nghiệm Đúng/Sai tình huống thực tế (Đúng 1 ý: 0,1đ; 2 ý: 0,25đ; 3 ý: 0,5đ; 4 ý: 1,0đ)`,
      ...exam.partII.flatMap((tf) => [
        `Câu ${tf.number}. ${tf.scenario}`,
        ...(tf.citation ? [`  [Nguồn: ${tf.citation}]`] : []),
        ...tf.statements.map(
          (st) =>
            `  ${st.subId}) ${st.text} -> ${st.isCorrect ? 'ĐÚNG' : 'SAI'} (${st.explanation})`
        ),
      ]),
    ];

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownloadWord = (includeSolutions: boolean) => {
    if (!currentUser) {
      onRequireLogin?.('Vui lòng đăng nhập tài khoản để tải file Word (.docx) đề ôn tập chương!');
      return;
    }
    if (!canDownloadDocuments) {
      onRequireVipUpgrade?.();
      return;
    }
    const html = buildChapterMatrixWordHtml([exam], exam.title, includeSolutions, grade);
    const suffix = includeSolutions ? 'Co_Dap_An' : 'De_Hoc_Sinh';
    const filename = `De_${exam.code}_${exam.chapterId.toUpperCase()}_${suffix}.docx`;
    downloadHtmlAsDocx(html, filename);
    trackDocumentDownload({
      fileName: filename,
      documentTitle: `${exam.title} (Mã đề ${exam.code})`,
      category: grade === '10' ? 'de_lop_10' : 'de_lop_11',
      categoryLabel: `Bộ 5 Đề Theo Ma Trận Từng Chương Lớp ${grade}`,
      modeLabel: includeSolutions ? 'Đề + Đáp án chi tiết (.docx)' : 'Đề Học sinh (.docx)',
    });
    setDownloadedMode(includeSolutions ? 'full' : 'student');
    setTimeout(() => setDownloadedMode(null), 2500);
  };

  const getLevelBadge = (lv: 'NB' | 'TH' | 'VD') => {
    if (lv === 'NB') {
      return {
        label: 'Nhận biết',
        cls: 'bg-sky-50 text-sky-800 border-sky-200',
      };
    }
    if (lv === 'TH') {
      return {
        label: 'Thông hiểu',
        cls: 'bg-amber-50 text-amber-900 border-amber-200',
      };
    }
    return {
      label: 'Vận dụng',
      cls: 'bg-purple-50 text-purple-900 border-purple-200',
    };
  };

  const filteredPartI = exam.partI.filter((q) =>
    levelFilter === 'all' ? true : q.level === levelFilter
  );

  const isGuest = !currentUser;
  const headerAccent =
    grade === '10'
      ? 'from-emerald-950 via-emerald-900 to-teal-900'
      : 'from-amber-950 via-amber-900 to-orange-950';

  return (
    <div className="space-y-5">
      {/* Official Exam Paper Header Box */}
      <div className="rounded-xl border-2 border-slate-800 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-4 border-b-2 border-slate-800 text-xs sm:text-sm text-slate-900">
          <div className="md:col-span-5 text-center space-y-0.5">
            <p className="font-semibold uppercase">SỞ GIÁO DỤC VÀ ĐÀO TẠO</p>
            <p className="font-extrabold uppercase underline">
              ĐỀ KIỂM TRA CHUYÊN ĐỀ LỚP {grade}
            </p>
            <p className="text-xs italic text-slate-600 pt-1">
              (Chỉ sử dụng kiến thức {exam.chapterNumber}: {exam.chapterTitle})
            </p>
          </div>
          <div className="md:col-span-7 text-center space-y-1">
            <p className="font-extrabold uppercase text-sm sm:text-base">
              ĐỀ ÔN TẬP THEO MA TRẬN – {exam.chapterNumber.toUpperCase()} (ĐỀ SỐ 0
              {exam.examIndexInChapter})
            </p>
            <p className="font-bold uppercase text-xs sm:text-sm">
              Môn: CÔNG NGHỆ {grade === '10' ? 'TRỒNG TRỌT 10' : 'CHĂN NUÔI 11'} (KẾT NỐI TRI THỨC)
            </p>
            <p className="text-xs font-medium">
              Thời gian làm bài: <strong>50 phút</strong>, không kể thời gian phát đề
            </p>
            <div className="inline-block mt-1 px-3 py-1 border-2 border-slate-900 font-mono font-extrabold text-xs sm:text-sm bg-slate-50">
              Mã đề: {exam.code}
            </div>
          </div>
        </div>

        {/* Action Toolbar + Live Score */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-bold">
              Điểm tạm tính: {totalScore} / 10,00 điểm
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              Phần I: {partICorrect}/24 câu ({partIScore.toFixed(2).replace('.', ',')}đ)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-900 border border-sky-200 font-semibold">
              Phần II: {partIIAnsweredCount}/4 câu Đúng/Sai ({partIIScore.toFixed(2).replace('.', ',')}đ)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
                  onStartExam(exam);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title={
                  isGuest || !canTakeExam
                    ? 'Vui lòng đăng nhập tài khoản để làm bài thi trong mục Tài nguyên'
                    : 'Mở giao diện phòng thi 50 phút'
                }
              >
                {isGuest || !canTakeExam ? <Lock className="w-3.5 h-3.5 text-amber-300" /> : <Play className="w-3.5 h-3.5" />}
                <span>Thi Thử Trực Tuyến (50p)</span>
              </button>
            )}

            {onAssignQr && (
              <button
                onClick={() => onAssignQr(exam)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 flex items-center gap-1.5 cursor-pointer"
                title={
                  isGuest
                    ? 'Cần đăng nhập tài khoản để tạo mã QR giao đề cho học sinh'
                    : `Tạo mã QR giao Đề số 0${exam.examIndexInChapter} (Mã đề ${exam.code}) cho học sinh`
                }
              >
                {isGuest ? (
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <QrCode className="w-3.5 h-3.5 text-amber-800" />
                )}
                <span>Giao Đề Qua Mã QR</span>
              </button>
            )}

            <button
              onClick={handleToggleAllAnswers}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 cursor-pointer ${
                showAnswers
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
            >
              {showAnswers ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Ẩn đáp án</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Hiện đáp án</span>
                </>
              )}
            </button>

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
                handleReset();
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm lại</span>
            </button>

            <button
              onClick={handleCopyExamText}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Chép đề</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownloadWord(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 cursor-pointer"
            >
              {downloadedMode === 'full' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã tải (.docx)</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Đề + Giải (.docx)</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownloadWord(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white flex items-center gap-1.5 cursor-pointer"
            >
              {downloadedMode === 'student' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã tải Đề HS</span>
                </>
              ) : (
                <>
                  <Printer className="w-3.5 h-3.5" />
                  <span>Tải Đề HS (.docx)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Cognitive Level Filter for Part I */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 text-xs">
          <span className="text-slate-600 font-medium">
            Ma trận chuẩn: <strong>12 câu Nhận biết · 8 câu Thông hiểu · 4 câu Vận dụng</strong> (100% kiến thức {exam.chapterNumber})
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'Tất cả Phần I (24)' },
              { id: 'NB', label: 'Nhận biết (12)' },
              { id: 'TH', label: 'Thông hiểu (8)' },
              { id: 'VD', label: 'Vận dụng (4)' },
            ].map((lv) => (
              <button
                key={lv.id}
                type="button"
                onClick={() => setLevelFilter(lv.id as any)}
                className={`px-2.5 py-1 rounded-md font-bold border transition-all cursor-pointer ${
                  levelFilter === lv.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {lv.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PHẦN I: 24 CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN */}
      <div className="space-y-3">
        <div className={`bg-gradient-to-r ${headerAccent} text-white px-4 py-3 rounded-xl font-bold text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2`}>
          <span>
            PHẦN I (6,0 điểm): Thí sinh trả lời từ câu 1 đến câu 24 (12 Nhận biết · 8 Thông hiểu · 4 Vận dụng). Mỗi câu hỏi chỉ chọn một phương án.
          </span>
          <span className="text-emerald-200 text-xs font-normal">0,25 điểm / câu</span>
        </div>

        {filteredPartI.map((q) => {
          const exp = isExpanded(q.id);
          const chosen = userPartI[q.id];
          const hasAnswered = chosen !== undefined;
          const lvBadge = getLevelBadge(q.level);

          return (
            <div
              key={q.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs"
            >
              <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-900 leading-relaxed">
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-xs font-extrabold shrink-0">
                    Câu {q.number}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded border text-[11px] font-bold shrink-0 ${lvBadge.cls}`}
                  >
                    {lvBadge.label}
                  </span>
                  <span className="font-semibold">{q.question}</span>
                </div>

                <button
                  onClick={() => toggleExpand(q.id)}
                  className="text-slate-500 hover:text-slate-900 p-1 shrink-0 cursor-pointer"
                  title="Đóng/mở lời giải"
                >
                  {exp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Options A, B, C, D */}
              <div className="p-3.5 grid grid-cols-1 md:grid-cols-2 gap-2.5 bg-white">
                {OPTION_KEYS.map((key) => {
                  const isCorrect = q.correctAnswer === key;
                  const isSelected = chosen === key;
                  const reveal = exp || hasAnswered;

                  let cls = 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-800';
                  let badge = 'bg-white text-slate-700 border border-slate-300';

                  if (reveal) {
                    if (isCorrect) {
                      cls =
                        'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500/40';
                      badge = 'bg-emerald-600 text-white border-emerald-600';
                    } else if (isSelected) {
                      cls = 'border-rose-400 bg-rose-50 text-rose-950 line-through';
                      badge = 'bg-rose-600 text-white border-rose-600';
                    }
                  }

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        if (!currentUser) {
                          onRequireLogin?.('Vui lòng đăng nhập tài khoản để làm bài thi trong mục Tài nguyên!');
                          return;
                        }
                        if (!canTakeExam) {
                          onRequireVipUpgrade?.();
                          return;
                        }
                        setUserPartI((prev) => ({ ...prev, [q.id]: key }));
                      }}
                      className={`p-3 rounded-lg border text-left flex items-start gap-2.5 text-xs sm:text-[13px] transition-all cursor-pointer ${cls}`}
                    >
                      <span
                        className={`w-6 h-6 rounded font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 ${badge}`}
                      >
                        {key}
                      </span>
                      <span className="flex-1">{q.options[key]}</span>
                    </button>
                  );
                })}
              </div>

              {(exp || hasAnswered) && (
                <div className="px-4 py-2.5 bg-emerald-50/60 border-t border-emerald-100 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <strong className="text-emerald-800 mr-2">Đáp án đúng: {q.correctAnswer}</strong>
                    <span>{q.explanation}</span>
                  </div>
                  {q.textbookRef && (
                    <span className="text-[11px] text-emerald-800 font-medium shrink-0">
                      <FileText className="w-3 h-3 inline mr-1" />
                      {q.textbookRef}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PHẦN II: 4 CÂU TRẮC NGHIỆM ĐÚNG / SAI TÌNH HUỐNG THỰC TẾ */}
      <div className="space-y-4 pt-2">
        <div className="bg-sky-950 text-white px-4 py-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              PHẦN II (4,0 điểm): Thí sinh trả lời từ câu 1 đến câu 4 (mỗi câu gồm 1 ý Nhận biết · 1 ý Thông hiểu · 2 ý Vận dụng).
            </span>
          </div>
          <span className="text-amber-200 text-xs font-normal">
            Đúng 1 ý: 0,1đ · 2 ý: 0,25đ · 3 ý: 0,5đ · 4 ý: 1,0đ
          </span>
        </div>

        {exam.partII.map((tf) => {
          const exp = isExpanded(tf.id);
          const userSt = userPartII[tf.id] || ({} as Record<'a' | 'b' | 'c' | 'd', boolean>);

          return (
            <div
              key={tf.id}
              className="rounded-xl border border-slate-300 bg-white overflow-hidden shadow-xs"
            >
              <div className="p-4 sm:p-5 space-y-3.5">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex-1">
                    <TrueFalseScenarioDisplay question={tf} />
                  </div>
                  <button
                    onClick={() => toggleExpand(tf.id)}
                    className="text-slate-500 hover:text-slate-900 p-1 shrink-0 cursor-pointer"
                  >
                    {exp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* 4 Statements a), b), c), d) */}
                <div className="space-y-2.5">
                  {tf.statements.map((st) => {
                    const picked = userSt[st.subId];
                    const hasPicked = picked !== undefined;
                    const reveal = exp || hasPicked;
                    const stBadge = getLevelBadge(st.level);

                    return (
                      <div
                        key={st.subId}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="text-xs sm:text-[13px] text-slate-900 leading-relaxed flex-1 flex items-start gap-2">
                            <span className="font-extrabold shrink-0">{st.subId})</span>
                            <span
                              className={`px-1.5 py-0.5 rounded border text-[10px] font-bold shrink-0 mt-0.5 ${stBadge.cls}`}
                            >
                              {stBadge.label}
                            </span>
                            <span>{st.text}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (!currentUser) {
                                  onRequireLogin?.('Vui lòng đăng nhập tài khoản để làm bài thi trong mục Tài nguyên!');
                                  return;
                                }
                                if (!canTakeExam) {
                                  onRequireVipUpgrade?.();
                                  return;
                                }
                                setUserPartII((prev) => ({
                                  ...prev,
                                  [tf.id]: { ...(prev[tf.id] || {}), [st.subId]: true },
                                }));
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                picked === true
                                  ? 'bg-emerald-700 text-white border-emerald-700'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50'
                              }`}
                            >
                              Đúng
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!currentUser) {
                                  onRequireLogin?.('Vui lòng đăng nhập tài khoản để làm bài thi trong mục Tài nguyên!');
                                  return;
                                }
                                if (!canTakeExam) {
                                  onRequireVipUpgrade?.();
                                  return;
                                }
                                setUserPartII((prev) => ({
                                  ...prev,
                                  [tf.id]: { ...(prev[tf.id] || {}), [st.subId]: false },
                                }));
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                picked === false
                                  ? 'bg-rose-700 text-white border-rose-700'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-rose-50'
                              }`}
                            >
                              Sai
                            </button>

                            {reveal && (
                              <span
                                className={`px-2.5 py-1 rounded-md text-xs font-extrabold ${
                                  st.isCorrect
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}
                              >
                                Đáp án: {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                              </span>
                            )}
                          </div>
                        </div>

                        {reveal && (
                          <p className="text-xs text-slate-600 pl-4 border-l-2 border-emerald-500">
                            {st.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Component hiển thị Bộ 5 Đề Theo Ma Trận ngay bên trong TỪNG CHƯƠNG của Lớp 10 và Lớp 11
 */
export const Grade10And11ChapterFiveExamsPanel: React.FC<Grade10And11ChapterFiveExamsPanelProps> = ({
  grade,
  chapterId,
  chapterNumber,
  chapterTitle,
  currentUser,
  canTakeExam = true,
  canDownloadDocuments = true,
  onRequireLogin,
  onRequireVipUpgrade,
  onStartExam,
  onAssignQr,
}) => {
  const chapterExams: ChapterMatrixExam[] =
    grade === '10'
      ? GRADE_10_EXAMS_BY_CHAPTER[chapterId] || []
      : GRADE_11_EXAMS_BY_CHAPTER[chapterId] || [];

  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [downloadedAllMode, setDownloadedAllMode] = useState<string | null>(null);

  if (chapterExams.length === 0) return null;

  const activeExam = chapterExams.find((e) => e.id === selectedExamId) || null;
  const isGuest = !currentUser;

  const handleDownloadAll5ChapterExams = (includeSolutions: boolean) => {
    if (!currentUser) {
      onRequireLogin?.('Vui lòng đăng nhập tài khoản để tải bộ 5 đề của chương (.docx)!');
      return;
    }
    if (!canDownloadDocuments) {
      onRequireVipUpgrade?.();
      return;
    }
    const html = buildChapterMatrixWordHtml(
      chapterExams,
      `TRỌN BỘ 5 ĐỀ THEO MA TRẬN ${chapterNumber.toUpperCase()}: ${chapterTitle.toUpperCase()} (LỚP ${grade})`,
      includeSolutions,
      grade
    );
    const filename = `Bo_5_De_${chapterId.toUpperCase()}_${
      includeSolutions ? 'Co_Giai' : 'De_HS'
    }.docx`;
    downloadHtmlAsDocx(html, filename);
    trackDocumentDownload({
      fileName: filename,
      documentTitle: `Trọn Bộ 5 Đề ${chapterNumber}: ${chapterTitle} (Lớp ${grade})`,
      category: grade === '10' ? 'de_lop_10' : 'de_lop_11',
      categoryLabel: `Bộ 5 Đề Theo Ma Trận Chương Lớp ${grade}`,
      modeLabel: includeSolutions
        ? 'Trọn bộ 5 đề + Giải chi tiết (.docx)'
        : 'Trọn bộ 5 đề Học sinh (.docx)',
    });
    setDownloadedAllMode(includeSolutions ? 'full' : 'student');
    setTimeout(() => setDownloadedAllMode(null), 2500);
  };

  const isGrade10 = grade === '10';
  const containerBorder = isGrade10
    ? 'border-emerald-600/80 from-emerald-50/70 to-white'
    : 'border-amber-600/80 from-amber-50/70 to-white';
  const badgeBg = isGrade10 ? 'bg-emerald-800 text-white' : 'bg-amber-800 text-white';
  const primaryBtn = isGrade10
    ? 'bg-emerald-800 hover:bg-emerald-900 text-white'
    : 'bg-amber-800 hover:bg-amber-900 text-white';
  const secondaryBtn = isGrade10
    ? 'bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300'
    : 'bg-white hover:bg-amber-50 text-amber-950 border border-amber-300';

  return (
    <div
      className={`rounded-2xl border-2 bg-gradient-to-b p-4 sm:p-5 space-y-4 shadow-2xs ${containerBorder}`}
    >
      <div
        className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b pb-3.5 ${
          isGrade10 ? 'border-emerald-200' : 'border-amber-200'
        }`}
      >
        <div className="space-y-1">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badgeBg}`}
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>
              Bộ 5 Đề Theo Ma Trận · 100% Kiến Thức {chapterNumber} (Lớp {grade})
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
            5 Đề Kiểm Tra Theo Ma Trận – {chapterNumber}: {chapterTitle} (24 Câu TN + 4 Câu Đúng/Sai)
          </h3>
          <p className="text-xs text-slate-600">
            Mỗi đề xây dựng <strong>chỉ sử dụng thông tin của {chapterNumber}</strong> theo chuẩn ma trận:{' '}
            <strong>Phần I gồm 24 câu trắc nghiệm (12 Nhận biết · 8 Thông hiểu · 4 Vận dụng = 6,0 điểm)</strong> +{' '}
            <strong>Phần II gồm 4 câu Đúng/Sai tình huống thực tế có dẫn nguồn (4,0 điểm; đúng 1 ý: 0,1đ)</strong>. Hỗ trợ giao đề trực tiếp qua <strong>Mã QR</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => handleDownloadAll5ChapterExams(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs ${primaryBtn}`}
          >
            {downloadedAllMode === 'full' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã tải 5 Đề (Có giải)</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Tải cả 5 Đề chương này (.docx)</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleDownloadAll5ChapterExams(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${secondaryBtn}`}
          >
            {downloadedAllMode === 'student' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã tải 5 Đề HS</span>
              </>
            ) : (
              <>
                <Printer className="w-3.5 h-3.5" />
                <span>Tải 5 Đề HS (.docx)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5 Exam Cards for this Chapter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {chapterExams.map((exam) => {
          const isSelected = selectedExamId === exam.id;
          return (
            <div
              key={exam.id}
              onClick={() => setSelectedExamId(isSelected ? null : exam.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? isGrade10
                    ? 'bg-emerald-900 text-white border-emerald-900 shadow-md ring-2 ring-amber-400'
                    : 'bg-amber-900 text-white border-amber-900 shadow-md ring-2 ring-emerald-400'
                  : isGrade10
                  ? 'bg-white hover:bg-emerald-50/60 text-slate-900 border-emerald-200 shadow-2xs'
                  : 'bg-white hover:bg-amber-50/60 text-slate-900 border-amber-200 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 text-[11px] font-bold">
                  <span
                    className={`px-2 py-0.5 rounded font-mono ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950'
                        : isGrade10
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-amber-100 text-amber-950'
                    }`}
                  >
                    Mã đề: {exam.code}
                  </span>
                  <span className={isSelected ? 'text-emerald-100' : 'text-slate-500'}>
                    50 phút
                  </span>
                </div>

                <div className="font-extrabold text-sm mt-1.5">
                  Đề Số 0{exam.examIndexInChapter} – {chapterNumber}
                </div>

                <div
                  className={`text-[11px] mt-1 pt-1 border-t ${
                    isSelected
                      ? 'border-white/20 text-white/90'
                      : 'border-slate-100 text-slate-600'
                  }`}
                >
                  Phần I: 24 câu (12B·8H·4VD)
                  <span className="block font-semibold">
                    Phần II: 4 câu Đ/S thực tế (10đ)
                  </span>
                </div>
              </div>

              <div
                className={`mt-2.5 pt-2 border-t flex items-center gap-1.5 ${
                  isSelected ? 'border-white/20' : 'border-slate-100'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => onAssignQr?.(exam)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      : isGrade10
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200'
                  }`}
                  title={
                    isGuest
                      ? 'Cần đăng nhập để tạo mã QR giao đề'
                      : `Giao Đề số 0${exam.examIndexInChapter} (Mã đề ${exam.code}) qua Mã QR`
                  }
                >
                  {isGuest ? <Lock className="w-3 h-3 text-amber-600" /> : <QrCode className="w-3 h-3" />}
                  <span>Mã QR</span>
                </button>

                {onStartExam && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) {
                        onRequireLogin?.('Vui lòng đăng nhập tài khoản để làm bài thi trong mục Tài nguyên!');
                        return;
                      }
                      if (!canTakeExam) {
                        onRequireVipUpgrade?.();
                        return;
                      }
                      onStartExam(exam);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-white/15 hover:bg-white/25 text-white border border-white/25'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                    title={isGuest || !canTakeExam ? 'Vui lòng đăng nhập tài khoản để làm bài thi trong mục Tài nguyên' : 'Vào làm bài trực tuyến'}
                  >
                    {isGuest || !canTakeExam ? <Lock className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3" />}
                    <span>Làm bài</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Exam View */}
      {activeExam && (
        <div className="pt-2">
          <ChapterMatrixExamInteractiveBody
            exam={activeExam}
            grade={grade}
            currentUser={currentUser}
            canTakeExam={canTakeExam}
            canDownloadDocuments={canDownloadDocuments}
            onRequireLogin={onRequireLogin}
            onRequireVipUpgrade={onRequireVipUpgrade}
            onStartExam={onStartExam}
            onAssignQr={onAssignQr}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Top Overview Section for Grade 10 (8 Chapters × 5 Exams = 40 Exams) & Grade 11 (6 Chapters × 5 Exams = 30 Exams)
 */
export const Grade10And11OverviewExamsSection: React.FC<{
  grade: '10' | '11';
  currentUser?: AuthUser | null;
  canTakeExam?: boolean;
  canDownloadDocuments?: boolean;
  onRequireLogin?: (reason: string) => void;
  onRequireVipUpgrade?: () => void;
  onStartExam?: (exam: Exam) => void;
  onAssignQr?: (exam: Exam) => void;
}> = ({
  grade,
  currentUser,
  canTakeExam = true,
  canDownloadDocuments = true,
  onRequireLogin,
  onRequireVipUpgrade,
  onStartExam,
  onAssignQr,
}) => {
  const examsMap: Record<string, ChapterMatrixExam[]> =
    grade === '10' ? GRADE_10_EXAMS_BY_CHAPTER : GRADE_11_EXAMS_BY_CHAPTER;
  const chapterKeys = Object.keys(examsMap);
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    chapterKeys[0] || (grade === '10' ? 'cn10-c1' : 'cn11-c1')
  );
  const [selectedExamIdx, setSelectedExamIdx] = useState<number>(0);

  const currentChapterExams = examsMap[selectedChapterId] || [];
  const activeExam: ChapterMatrixExam | undefined =
    currentChapterExams[selectedExamIdx] || currentChapterExams[0];

  if (!activeExam) return null;

  const isGrade10 = grade === '10';
  const totalExamsCount = chapterKeys.length * 5;

  return (
    <section
      className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden ${
        isGrade10 ? 'border-emerald-700/80' : 'border-amber-700/80'
      }`}
    >
      <div
        className={`p-5 sm:p-6 text-white space-y-4 bg-gradient-to-r ${
          isGrade10
            ? 'from-emerald-950 via-emerald-900 to-teal-950'
            : 'from-amber-950 via-amber-900 to-orange-950'
        }`}
      >
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>
              SGK Công Nghệ {grade} ({isGrade10 ? 'Công nghệ Trồng trọt' : 'Công nghệ Chăn nuôi'}) · Bộ Sách Kết Nối Tri Thức Với Cuộc Sống
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
            Hệ Thống {totalExamsCount} Đề Ôn Tập Chương Lớp {grade} ({chapterKeys.length} Chương × 5 Đề/Chương Theo Ma Trận)
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Ở từng chương trong <strong>{chapterKeys.length} Chương Lớp {grade}</strong> đều có riêng{' '}
            <strong>5 Đề kiểm tra theo ma trận chỉ sử dụng thông tin của chính chương đó</strong> (gồm{' '}
            <strong>24 câu trắc nghiệm Phần I [12 Nhận biết · 8 Thông hiểu · 4 Vận dụng = 6,0 điểm]</strong> +{' '}
            <strong>4 câu Đúng/Sai tình huống thực tế có dẫn nguồn Phần II [4,0 điểm; đúng 1 ý: 0,1đ]</strong>) và hỗ trợ{' '}
            <strong>giao đề qua Mã QR</strong>.
          </p>
        </div>

        {/* Chapter Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {chapterKeys.map((chId) => {
            const firstExam = examsMap[chId]?.[0];
            if (!firstExam) return null;
            const isSelected = selectedChapterId === chId;
            return (
              <button
                key={chId}
                onClick={() => {
                  setSelectedChapterId(chId);
                  setSelectedExamIdx(0);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-white text-slate-950 border-white shadow-xs'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                {firstExam.chapterNumber}: {firstExam.chapterTitle} (5 đề)
              </button>
            );
          })}
        </div>

        {/* 5 Exam Sub-selector for the selected chapter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
          {currentChapterExams.map((ex, idx) => {
            const isExSelected = selectedExamIdx === idx;
            const isGuest = !currentUser;
            return (
              <div
                key={ex.id}
                onClick={() => setSelectedExamIdx(idx)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isExSelected
                    ? 'bg-white text-slate-950 border-white shadow-md ring-2 ring-amber-300'
                    : 'bg-black/25 hover:bg-black/40 text-white border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span
                      className={`px-2 py-0.5 rounded font-mono ${
                        isExSelected
                          ? isGrade10
                            ? 'bg-emerald-800 text-white'
                            : 'bg-amber-800 text-white'
                          : 'bg-white/15 text-amber-200'
                      }`}
                    >
                      MÃ ĐỀ {ex.code}
                    </span>
                    <span>50 phút</span>
                  </div>
                  <div className="font-extrabold text-sm mt-1">
                    Đề Số 0{ex.examIndexInChapter} – {ex.chapterNumber}
                  </div>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      isExSelected ? 'text-slate-600' : 'text-white/80'
                    }`}
                  >
                    24 câu TN + 4 câu Đ/S ({ex.chapterNumber})
                  </div>
                </div>

                <div
                  className={`mt-2.5 pt-2 border-t flex items-center gap-1.5 ${
                    isExSelected ? 'border-slate-200' : 'border-white/20'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onAssignQr?.(ex)}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
                      isExSelected
                        ? isGrade10
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200'
                        : 'bg-white/15 hover:bg-white/25 text-white border border-white/25'
                    }`}
                    title={isGuest ? 'Cần đăng nhập để tạo mã QR' : 'Giao đề qua Mã QR'}
                  >
                    {isGuest ? <Lock className="w-3 h-3 text-amber-400" /> : <QrCode className="w-3 h-3" />}
                    <span>Mã QR</span>
                  </button>

                  {onStartExam && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) {
                          onRequireLogin?.('Vui lòng đăng nhập tài khoản để làm bài thi trong mục Tài nguyên!');
                          return;
                        }
                        if (!canTakeExam) {
                          onRequireVipUpgrade?.();
                          return;
                        }
                        onStartExam(ex);
                      }}
                      className={`py-1 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
                        isExSelected
                          ? 'bg-slate-900 hover:bg-slate-800 text-white'
                          : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      }`}
                      title={isGuest || !canTakeExam ? 'Vui lòng đăng nhập tài khoản để làm bài thi trong mục Tài nguyên' : 'Làm bài trực tuyến'}
                    >
                      {isGuest || !canTakeExam ? <Lock className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>Thi</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 sm:p-6 bg-slate-50/60">
        <ChapterMatrixExamInteractiveBody
          exam={activeExam}
          grade={grade}
          currentUser={currentUser}
          canTakeExam={canTakeExam}
          canDownloadDocuments={canDownloadDocuments}
          onRequireLogin={onRequireLogin}
          onRequireVipUpgrade={onRequireVipUpgrade}
          onStartExam={onStartExam}
          onAssignQr={onAssignQr}
        />
      </div>
    </section>
  );
};

