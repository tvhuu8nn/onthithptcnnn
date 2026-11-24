import React, { useState } from 'react';
import {
  Grade12ChapterExam,
  GRADE_12_EXAMS_BY_CHAPTER,
} from '../data/grade12ChapterExams';
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
  CheckCircle2,
  QrCode,
  Lock,
  Play,
} from 'lucide-react';

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;

interface Grade12ChapterFourExamsPanelProps {
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

export function buildOfficial0716WordHtml(
  exams: Grade12ChapterExam[],
  docTitle: string,
  includeSolutions: boolean
): string {
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const examsHtml = exams
    .map((exam, idx) => {
      const partIHtml = exam.partI
        .map((q) => {
          const subStmtsHtml = q.subStatements
            ? `<div style="margin:3pt 0 3pt 10pt; font-size:11pt;">
                ${q.subStatements
                  .map((s) => `<p style="margin:1.5pt 0;">${escapeHtml(s)}</p>`)
                  .join('')}
              </div>`
            : '';

          const tableHtml = q.tableData
            ? `<div style="margin:6pt 0;">
                <table border="1" cellspacing="0" cellpadding="4" style="width:100%; border-collapse:collapse; border:1px solid #111827; font-size:10.5pt; text-align:center;">
                  <thead>
                    <tr style="background-color:#f1f5f9; font-weight:bold;">
                      ${q.tableData.headers
                        .map((h) => `<th>${escapeHtml(h)}</th>`)
                        .join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${q.tableData.rows
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
                  q.tableData.source
                    ? `<p style="margin:2pt 0 0 0; font-size:9.5pt; text-align:right;"><em>${escapeHtml(
                        q.tableData.source
                      )}</em></p>`
                    : ''
                }
                ${
                  q.tableData.note
                    ? `<p style="margin:1pt 0 3pt 0; font-size:9.5pt;"><em>${escapeHtml(
                        q.tableData.note
                      )}</em></p>`
                    : ''
                }
              </div>`
            : '';

          const footerHtml = q.questionFooter
            ? `<p style="margin:2pt 0 3pt 0; font-size:11.5pt;">${escapeHtml(
                q.questionFooter
              )}</p>`
            : '';

          return `
          <div style="margin-bottom:8pt; page-break-inside:avoid;">
            <p style="margin:0 0 3pt 0; font-size:11.5pt;">
              <strong>Câu ${q.number}.</strong> ${escapeHtml(q.question)}
            </p>
            ${subStmtsHtml}
            ${tableHtml}
            ${footerHtml}
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
          </div>`;
        })
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
                    <th>Nghiệm thức thí nghiệm</th>
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
                ? `<p style="margin:2pt 0 4pt 0; font-size:9.5pt; text-align:right;"><em>Nguồn: ${escapeHtml(
                    tf.citation
                  )}</em></p>`
                : ''
            }
            ${tf.statements
              .map(
                (st) => `
              <p style="margin:2pt 0; font-size:11pt;">
                <strong>${st.subId})</strong> ${escapeHtml(st.text)}
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
      )})
          </p>
          <p style="margin:0 0 4pt 0; font-size:10.5pt;">
            <strong>PHẦN I (24 câu):</strong> ${exam.partI
              .map((q) => `${q.number}.${q.correctAnswer}`)
              .join(' | ')}
          </p>
          <p style="margin:0; font-size:10.5pt;">
            <strong>PHẦN II (4 câu Đúng/Sai):</strong> ${exam.partII
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
          <p style="margin:0;"><strong>Chuyên đề:</strong> ${escapeHtml(
            exam.chapterNumber
          )} – ${escapeHtml(exam.chapterTitle)} (Đề số 0${
        exam.examIndexInChapter || 1
      }) &nbsp;|&nbsp; <strong>Mã đề: ${escapeHtml(exam.code)}</strong></p>
        </div>
        <p style="margin:4pt 0 6pt 0; font-size:11.5pt; font-weight:bold;">
          PHẦN I: Thí sinh trả lời từ câu 1 đến câu 24. Mỗi câu hỏi thí sinh chỉ chọn một phương án.
        </p>
        ${partIHtml}
        <p style="margin:10pt 0 6pt 0; font-size:11.5pt; font-weight:bold;">
          PHẦN II: Thí sinh trả lời từ câu 1 đến câu 4. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.
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

/**
 * Interactive Viewer for a single Grade 12 Exam in exact 0716 format
 */
export const Official0716ExamInteractiveBody: React.FC<{
  exam: Grade12ChapterExam;
  currentUser?: AuthUser | null;
  canTakeExam?: boolean;
  canDownloadDocuments?: boolean;
  onRequireLogin?: (reason: string) => void;
  onRequireVipUpgrade?: () => void;
  onStartExam?: (exam: Exam) => void;
  onAssignQr?: (exam: Exam) => void;
}> = ({
  exam,
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

  const handleReset = () => {
    setUserPartI({});
    setUserPartII({});
  };

  // Calculate score according to MOET 2026 graduation exam rule:
  // Part I: 24 questions × 0.25 = 6.0 pts
  // Part II: 4 questions, each 1 correct -> 0.1, 2 -> 0.25, 3 -> 0.5, 4 -> 1.0 (max 4.0 pts)
  const partICorrect = exam.partI.filter((q) => userPartI[q.id] === q.correctAnswer).length;
  const partIScore = partICorrect * 0.25;

  let partIIScore = 0;
  let partIIAnsweredCount = 0;
  exam.partII.forEach((tf) => {
    const userSt = userPartII[tf.id] || ({} as Record<'a' | 'b' | 'c' | 'd', boolean>);
    let cCount = 0;
    tf.statements.forEach((st) => {
      if (userSt[st.subId] !== undefined) {
        partIIAnsweredCount++;
        if (userSt[st.subId] === st.isCorrect) cCount++;
      }
    });
    if (cCount === 1) partIIScore += 0.1;
    else if (cCount === 2) partIIScore += 0.25;
    else if (cCount === 3) partIIScore += 0.5;
    else if (cCount === 4) partIIScore += 1.0;
  });

  const totalScore = (partIScore + partIIScore).toFixed(2);

  const handleDownloadSingleDoc = (includeSolutions: boolean) => {
    if (!currentUser) {
      onRequireLogin?.('Vui lòng đăng nhập tài khoản để tải đề thi mẫu Bộ GD&ĐT (.docx)!');
      return;
    }
    if (!canDownloadDocuments) {
      onRequireVipUpgrade?.();
      return;
    }
    const html = buildOfficial0716WordHtml([exam], exam.title, includeSolutions);
    const filename = `De_Thi_CN12_Ma_${exam.code}_${
      includeSolutions ? 'Co_Giai_Chi_Tiet' : 'De_Chinh_Thuc_HS'
    }.docx`;
    downloadHtmlAsDocx(html, filename);
    trackDocumentDownload({
      fileName: filename,
      documentTitle: `${exam.title} (Mã đề ${exam.code})`,
      category: 'de_lop_12',
      categoryLabel: 'Bộ 4 Đề Chuẩn Mẫu 0716 Lớp 12',
      modeLabel: includeSolutions ? 'Đề + Lời giải chi tiết (.docx)' : 'Đề chính thức Học sinh (.docx)',
    });
    setDownloadedMode(includeSolutions ? 'full' : 'student');
    setTimeout(() => setDownloadedMode(null), 2500);
  };

  const handleCopyExam = () => {
    const lines = [
      `${exam.title} - Mã đề: ${exam.code} - Thời gian: 50 phút`,
      `==================================================`,
      `PHẦN I: Thí sinh trả lời từ câu 1 đến câu 24. Mỗi câu hỏi thí sinh chỉ chọn một phương án.`,
      ...exam.partI.flatMap((q) => [
        `Câu ${q.number}. ${q.question}`,
        ...(q.subStatements || []),
        ...(q.questionFooter ? [q.questionFooter] : []),
        `  A. ${q.options.A}   B. ${q.options.B}   C. ${q.options.C}   D. ${q.options.D}`,
        `  -> Đáp án: ${q.correctAnswer} (${q.explanation})`,
      ]),
      `\nPHẦN II: Thí sinh trả lời từ câu 1 đến câu 4. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.`,
      ...exam.partII.flatMap((tf) => [
        `Câu ${tf.number}. ${tf.scenario}`,
        ...(tf.citation ? [`  Nguồn: ${tf.citation}`] : []),
        ...tf.statements.map(
          (st) => `  ${st.subId}) ${st.text} -> ${st.isCorrect ? 'ĐÚNG' : 'SAI'} (${st.explanation})`
        ),
      ]),
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="space-y-5">
      {/* Exam Header & Action Toolbar */}
      <div className="bg-white rounded-xl border-2 border-slate-800 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded border-2 border-slate-900 font-mono text-sm font-extrabold bg-slate-50 text-slate-950">
              Mã đề: {exam.code}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              {exam.title}
            </span>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5">
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
                  !currentUser || !canTakeExam
                    ? 'Vui lòng đăng nhập tài khoản để làm bài thi trong mục Tài nguyên'
                    : 'Làm bài thi bấm giờ 50 phút trong phòng thi trực tuyến'
                }
              >
                {!currentUser || !canTakeExam ? <Lock className="w-3.5 h-3.5 text-amber-300" /> : <Play className="w-3.5 h-3.5" />}
                <span>Làm bài 50 phút</span>
              </button>
            )}

            <button
              onClick={() => onAssignQr?.(exam)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-sky-50 text-sky-900 border border-sky-300 flex items-center gap-1 cursor-pointer"
              title="Tạo mã QR giao đề"
            >
              {!currentUser ? (
                <Lock className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <QrCode className="w-3.5 h-3.5 text-sky-700" />
              )}
              <span>Mã QR</span>
            </button>

            <button
              onClick={() => {
                setShowAnswers((prev) => !prev);
                setExpandedQuestions({});
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 cursor-pointer ${
                showAnswers
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}
            >
              {showAnswers ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Ẩn giải</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Hiện giải</span>
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
              onClick={handleCopyExam}
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
              onClick={() => handleDownloadSingleDoc(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-sky-800 hover:bg-sky-900 text-white flex items-center gap-1 cursor-pointer"
            >
              {downloadedMode === 'full' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã tải Word</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải đề + giải (.docx)</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownloadSingleDoc(false)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1 cursor-pointer"
            >
              {downloadedMode === 'student' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã tải Đề HS</span>
                </>
              ) : (
                <>
                  <Printer className="w-3.5 h-3.5" />
                  <span>Tải đề HS (.docx)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Score Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 text-xs bg-slate-50 px-3.5 py-2 rounded-lg">
          <div className="text-slate-700">
            <strong>Cấu trúc chuẩn Tốt nghiệp THPT 2026:</strong> Phần I (24 câu ABCD = 6,0 điểm) + Phần II (4 câu Đúng/Sai thực nghiệm = 4,0 điểm)
          </div>
          <div className="flex flex-wrap items-center gap-3 font-semibold">
            <span>
              Phần I: <strong className="text-sky-800">{partICorrect}/24 câu</strong> ({partIScore.toFixed(2)}đ)
            </span>
            <span className="text-slate-300">|</span>
            <span>
              Phần II: <strong className="text-amber-800">{partIIAnsweredCount}/16 ý</strong> ({partIIScore.toFixed(2)}đ)
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-800 font-extrabold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tổng điểm: {totalScore} / 10,0
            </span>
          </div>
        </div>
      </div>

      {/* PHẦN I: 24 CÂU TRẮC NGHIỆM ABCD */}
      <div className="space-y-3">
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl font-bold text-xs sm:text-sm">
          PHẦN I: Thí sinh trả lời từ câu 1 đến câu 24. Mỗi câu hỏi thí sinh chỉ chọn một phương án.
        </div>

        {exam.partI.map((q) => {
          const exp = isExpanded(q.id);
          const chosen = userPartI[q.id];
          const hasAnswered = chosen !== undefined;

          return (
            <div
              key={q.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs"
            >
              <div className="p-4 space-y-2.5 bg-slate-50/70 border-b border-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-extrabold">
                        Câu {q.number}.
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded border font-bold ${
                          q.level === 'NB'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : q.level === 'TH'
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-purple-50 text-purple-900 border-purple-200'
                        }`}
                      >
                        {q.level === 'NB' ? 'Nhận biết' : q.level === 'TH' ? 'Thông hiểu' : 'Vận dụng'}
                      </span>
                      {q.tableData && (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                          Bảng số liệu thực nghiệm (p&lt;0,05)
                        </span>
                      )}
                      {q.subStatements && (
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-bold">
                          Đếm số phát biểu đúng (a, b, c, d)
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                      {q.question}
                    </p>

                    {/* Render (a), (b), (c), (d) statements if present (like Câu 4 & Câu 16 in 0716) */}
                    {q.subStatements && (
                      <div className="pl-3 space-y-1 text-xs sm:text-[13px] text-slate-800 font-medium border-l-2 border-slate-300 my-1.5">
                        {q.subStatements.map((stmt, idx) => (
                          <p key={idx}>{stmt}</p>
                        ))}
                      </div>
                    )}

                    {/* Render experimental data table if present (like Câu 20 in 0716) */}
                    {q.tableData && (
                      <div className="my-2 overflow-x-auto rounded-lg border border-slate-300 bg-white">
                        <table className="w-full text-xs border-collapse text-center">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-900">
                              {q.tableData.headers.map((h, i) => (
                                <th
                                  key={i}
                                  className="py-2 px-3 border-r border-slate-300 last:border-r-0"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {q.tableData.rows.map((r, rIdx) => (
                              <tr key={rIdx}>
                                {r.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`py-1.5 px-3 border-r border-slate-200 last:border-r-0 ${
                                      cIdx === 0 ? 'font-bold' : 'font-mono'
                                    }`}
                                  >
                                    {String(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {(q.tableData.source || q.tableData.note) && (
                          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-600 space-y-0.5">
                            {q.tableData.source && (
                              <div className="italic text-right font-medium">
                                {q.tableData.source}
                              </div>
                            )}
                            {q.tableData.note && <div className="italic">{q.tableData.note}</div>}
                          </div>
                        )}
                      </div>
                    )}

                    {q.questionFooter && (
                      <p className="text-xs sm:text-sm font-bold text-slate-900 pt-0.5">
                        {q.questionFooter}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => toggleExpand(q.id)}
                    className="text-slate-500 hover:text-slate-800 p-1 cursor-pointer shrink-0"
                  >
                    {exp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
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

      {/* PHẦN II: 4 CÂU TRẮC NGHIỆM ĐÚNG / SAI THỰC NGHIỆM (CÓ BIỂU ĐỒ & BẢNG SỐ LIỆU) */}
      <div className="space-y-4 pt-2">
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl font-bold text-xs sm:text-sm">
          PHẦN II: Thí sinh trả lời từ câu 1 đến câu 4. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.
        </div>

        {exam.partII.map((tf) => {
          const exp = isExpanded(tf.id);
          const userSt = userPartII[tf.id] || ({} as Record<'a' | 'b' | 'c' | 'd', boolean>);

          return (
            <div
              key={tf.id}
              className="rounded-xl border border-slate-300 bg-white overflow-hidden shadow-xs"
            >
              <div className="p-4 sm:p-5 space-y-4">
                {/* Render Scenario + Experimental Table / Bar Chart + Citation */}
                <TrueFalseScenarioDisplay question={tf} />

                {/* 4 Statements a), b), c), d) */}
                <div className="space-y-2.5">
                  {tf.statements.map((st) => {
                    const picked = userSt[st.subId];
                    const hasPicked = picked !== undefined;
                    const reveal = exp || hasPicked;

                    return (
                      <div
                        key={st.subId}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="text-xs sm:text-[13px] text-slate-900 leading-relaxed flex-1">
                            <span className="font-extrabold mr-1.5">{st.subId})</span>
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
 * Component hiển thị 4 Đề chuẩn mẫu 0716 ngay bên trong TỪNG CHƯƠNG của Lớp 12
 */
export const Grade12ChapterFourExamsPanel: React.FC<Grade12ChapterFourExamsPanelProps> = ({
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
  const chapterExams = GRADE_12_EXAMS_BY_CHAPTER[chapterId] || [];
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [downloadedAllMode, setDownloadedAllMode] = useState<string | null>(null);

  if (chapterExams.length === 0) return null;

  const activeExam = chapterExams.find((e) => e.id === selectedExamId) || null;
  const isGuest = !currentUser;

  const handleDownloadAll4ChapterExams = (includeSolutions: boolean) => {
    if (!currentUser) {
      onRequireLogin?.('Vui lòng đăng nhập tài khoản để tải bộ 4 đề của chương (.docx)!');
      return;
    }
    if (!canDownloadDocuments) {
      onRequireVipUpgrade?.();
      return;
    }
    const html = buildOfficial0716WordHtml(
      chapterExams,
      `TRỌN BỘ 4 ĐỀ ÔN TẬP ${chapterNumber.toUpperCase()}: ${chapterTitle.toUpperCase()}`,
      includeSolutions
    );
    const filename = `Bo_4_De_${chapterId.toUpperCase()}_${
      includeSolutions ? 'Co_Giai' : 'De_HS'
    }.docx`;
    downloadHtmlAsDocx(html, filename);
    trackDocumentDownload({
      fileName: filename,
      documentTitle: `Trọn Bộ 4 Đề ${chapterNumber}: ${chapterTitle} (Lớp 12)`,
      category: 'de_lop_12',
      categoryLabel: 'Bộ 4 Đề Chuẩn Mẫu 0716 Lớp 12',
      modeLabel: includeSolutions ? 'Trọn bộ 4 đề + Giải chi tiết (.docx)' : 'Trọn bộ 4 đề Học sinh (.docx)',
    });
    setDownloadedAllMode(includeSolutions ? 'full' : 'student');
    setTimeout(() => setDownloadedAllMode(null), 2500);
  };

  return (
    <div className="rounded-2xl border-2 border-sky-600/80 bg-gradient-to-b from-sky-50/70 to-white p-4 sm:p-5 space-y-4 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-sky-200 pb-3.5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-800 text-white text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Bộ 4 Đề Chuẩn Cấu Trúc Tốt Nghiệp THPT 2026 · SGK Kết Nối Tri Thức</span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
            4 Đề Thi Ôn Tập {chapterNumber}: {chapterTitle} (24 Câu Phần I + 4 Câu Đúng/Sai Thực Nghiệm Phần II)
          </h3>
          <p className="text-xs text-slate-600">
            Mỗi đề gồm <strong>24 câu trắc nghiệm ABCD</strong> (có câu đếm phát biểu đúng a, b, c, d và câu bảng số liệu thống kê p&lt;0,05) + <strong>4 câu Đúng/Sai có Biểu đồ cột &amp; Bảng kết quả thực nghiệm</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => handleDownloadAll4ChapterExams(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-800 hover:bg-sky-900 text-white flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            {downloadedAllMode === 'full' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã tải 4 Đề (Có giải)</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Tải cả 4 Đề chương này (.docx)</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleDownloadAll4ChapterExams(false)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-sky-50 text-sky-900 border border-sky-300 flex items-center gap-1.5 cursor-pointer"
          >
            {downloadedAllMode === 'student' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã tải 4 Đề HS</span>
              </>
            ) : (
              <>
                <Printer className="w-3.5 h-3.5" />
                <span>Tải 4 Đề HS (.docx)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Exam Cards for this Chapter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {chapterExams.map((exam) => {
          const isSelected = selectedExamId === exam.id;
          return (
            <div
              key={exam.id}
              onClick={() => setSelectedExamId(isSelected ? null : exam.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-sky-900 text-white border-sky-900 shadow-md ring-2 ring-amber-400'
                  : 'bg-white hover:bg-sky-50/60 text-slate-900 border-sky-200 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 text-[11px] font-bold">
                  <span
                    className={`px-2 py-0.5 rounded font-mono ${
                      isSelected ? 'bg-amber-400 text-slate-950' : 'bg-sky-100 text-sky-900'
                    }`}
                  >
                    Mã đề: {exam.code}
                  </span>
                  <span className={isSelected ? 'text-sky-200' : 'text-slate-500'}>
                    50 phút
                  </span>
                </div>

                <div className="font-extrabold text-sm mt-1.5">
                  Đề Số 0{exam.examIndexInChapter} – {chapterNumber}
                </div>

                <div
                  className={`text-[11px] mt-1 pt-1 border-t ${
                    isSelected ? 'border-sky-700 text-sky-100' : 'border-slate-100 text-slate-600'
                  }`}
                >
                  Phần I: 24 câu ABCD (6,0đ)
                  <span className="block font-semibold">
                    Phần II: 4 câu Đ/S thực nghiệm (4,0đ)
                  </span>
                </div>
              </div>

              <div
                className={`mt-2.5 pt-2 border-t flex items-center gap-1.5 ${
                  isSelected ? 'border-sky-700' : 'border-slate-100'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => onAssignQr?.(exam)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-white/15 hover:bg-white/25 text-white border border-white/25'
                      : 'bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200'
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
                      onStartExam(exam);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
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
          <Official0716ExamInteractiveBody
            exam={activeExam}
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
 * Top Overview Section for Grade 12: Shows Official Sample 0716 + Quick Selector across all 10 Chapters (40 Exams)
 */
export const Grade12OverviewExamsSection: React.FC<{
  currentUser?: AuthUser | null;
  canTakeExam?: boolean;
  canDownloadDocuments?: boolean;
  onRequireLogin?: (reason: string) => void;
  onRequireVipUpgrade?: () => void;
  onStartExam?: (exam: Exam) => void;
  onAssignQr?: (exam: Exam) => void;
}> = ({
  currentUser,
  canTakeExam = true,
  canDownloadDocuments = true,
  onRequireLogin,
  onRequireVipUpgrade,
  onStartExam,
  onAssignQr,
}) => {
  const chapterKeys = Object.keys(GRADE_12_EXAMS_BY_CHAPTER);
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    chapterKeys[0] || 'cn12-c1'
  );
  const [selectedExamIdx, setSelectedExamIdx] = useState<number>(0);

  const currentChapterExams = GRADE_12_EXAMS_BY_CHAPTER[selectedChapterId] || [];
  const activeExam: Grade12ChapterExam | undefined =
    currentChapterExams[selectedExamIdx] || currentChapterExams[0];

  if (!activeExam) return null;

  return (
    <section className="bg-white rounded-2xl border-2 border-sky-700/80 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-teal-950 p-5 sm:p-6 text-white space-y-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>SGK Công Nghệ 12 · Bộ Sách Kết Nối Tri Thức Với Cuộc Sống</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
            Hệ Thống 40 Đề Ôn Tập Chương Lớp 12 (10 Chương × 4 Đề/Chương)
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
            Mỗi chương trong <strong>10 Chương Lớp 12</strong> đều có riêng <strong>4 Đề thi chuẩn cấu trúc Tốt nghiệp THPT 2026</strong> (gồm <strong>24 câu trắc nghiệm ABCD Phần I</strong> có câu đếm phát biểu đúng &amp; bảng số liệu thống kê p&lt;0,05 + <strong>4 câu Đúng/Sai Phần II</strong> có Biểu đồ cột &amp; Bảng kết quả thực nghiệm).
          </p>
        </div>

        {/* Chapter Selector Pills (10 Chapters) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {chapterKeys.map((chId) => {
            const firstExam = GRADE_12_EXAMS_BY_CHAPTER[chId]?.[0];
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
                    ? 'bg-white text-sky-950 border-white shadow-xs'
                    : 'bg-white/10 text-sky-100 border-white/20 hover:bg-white/20'
                }`}
              >
                {firstExam.chapterNumber}: {firstExam.chapterTitle} (4 đề)
              </button>
            );
          })}
        </div>

        {/* 4 Exam Sub-selector for the selected chapter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {currentChapterExams.map((ex, idx) => {
            const isExSelected = selectedExamIdx === idx;
            const isGuest = !currentUser;
            return (
              <div
                key={ex.id}
                onClick={() => setSelectedExamIdx(idx)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isExSelected
                    ? 'bg-white text-sky-950 border-white shadow-md ring-2 ring-amber-300'
                    : 'bg-sky-950/60 hover:bg-sky-950/90 text-sky-50 border-sky-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span
                      className={`px-2 py-0.5 rounded font-mono ${
                        isExSelected ? 'bg-sky-800 text-white' : 'bg-sky-800/80 text-amber-200'
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
                      isExSelected ? 'text-slate-600' : 'text-sky-200'
                    }`}
                  >
                    24 câu Phần I + 4 câu Đ/S Phần II
                  </div>
                </div>

                <div
                  className={`mt-2.5 pt-2 border-t flex items-center gap-1.5 ${
                    isExSelected ? 'border-slate-200' : 'border-sky-800'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onAssignQr?.(ex)}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
                      isExSelected
                        ? 'bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200'
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
        <Official0716ExamInteractiveBody
          exam={activeExam}
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
