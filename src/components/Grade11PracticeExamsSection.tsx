import React, { useState } from 'react';
import {
  GRADE_11_PRACTICE_EXAMS,
  Grade11PracticeExam,
} from '../data/grade11PracticeExams';
import { CognitiveLevel } from '../data/chapterReviewData';
import { AuthUser } from '../types/auth';
import { Exam } from '../types/exam';
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
  BookOpenCheck,
  QrCode,
  Lock,
} from 'lucide-react';

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

interface Grade11PracticeExamsSectionProps {
  currentUser?: AuthUser | null;
  canDownloadDocuments?: boolean;
  onRequireLogin?: (reason: string) => void;
  onRequireVipUpgrade?: () => void;
  onAssignQr?: (exam: Exam) => void;
  selectedExamId?: string | null;
  onSelectExamId?: (examId: string | null) => void;
}

export const Grade11PracticeExamsSection: React.FC<Grade11PracticeExamsSectionProps> = ({
  currentUser,
  canDownloadDocuments = true,
  onRequireLogin,
  onRequireVipUpgrade,
  onAssignQr,
  selectedExamId: controlledExamId,
  onSelectExamId,
}) => {
  const [internalExamId, setInternalExamId] = useState<string | null>('g11-exam-1');
  const activeExamId = controlledExamId !== undefined ? controlledExamId : internalExamId;

  const setActiveExamId = (id: string | null) => {
    if (onSelectExamId) {
      onSelectExamId(id);
    } else {
      setInternalExamId(id);
    }
  };

  const [levelFilter, setLevelFilter] = useState<'all' | CognitiveLevel>('all');
  const [chapterFilter, setChapterFilter] = useState<string>('all');
  const [showAnswers, setShowAnswers] = useState<boolean>(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [userChoices, setUserChoices] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  const activeExam = GRADE_11_PRACTICE_EXAMS.find((e) => e.id === activeExamId) || null;

  const getLevelBadge = (level: CognitiveLevel) => {
    if (level === 'biet') {
      return {
        label: 'Đã biết',
        fullLabel: 'Đã biết (Nhận biết)',
        cls: 'bg-sky-50 text-sky-800 border-sky-200',
      };
    }
    return {
      label: 'Thông hiểu',
      fullLabel: 'Thông hiểu',
      cls: 'bg-amber-50 text-amber-900 border-amber-200',
    };
  };

  const isQuestionExpanded = (qKey: string) => {
    if (qKey in expandedQuestions) {
      return expandedQuestions[qKey];
    }
    return showAnswers;
  };

  const toggleQuestionAnswer = (qKey: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [qKey]: !(prev[qKey] ?? showAnswers),
    }));
  };

  const handleToggleAllAnswers = () => {
    setShowAnswers((prev) => !prev);
    setExpandedQuestions({});
  };

  const handleResetExam = (examId: string) => {
    setUserChoices((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(`${examId}-q-`)) delete next[k];
      });
      return next;
    });
  };

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const buildWordHtmlForExams = (
    exams: Grade11PracticeExam[],
    docTitle: string,
    mode: 'full_guide' | 'student_exam'
  ) => {
    const examsHtml = exams
      .map((exam, eIdx) => {
        const distRows = exam.chapterDistribution
          .map(
            (d) =>
              `<tr>
                <td style="font-weight:bold;">${escapeHtml(d.chapterNumber)}: ${escapeHtml(d.chapterTitle)}</td>
                <td style="text-align:center;">${d.bietCount} câu</td>
                <td style="text-align:center;">${d.hieuCount} câu</td>
                <td style="text-align:center; font-weight:bold;">${d.totalCount} câu</td>
              </tr>`
          )
          .join('');

        const questionsHtml = exam.questions
          .map((q) => {
            const lv = q.level === 'biet' ? 'Đã biết' : 'Thông hiểu';
            return `
            <div style="margin-bottom:10pt; page-break-inside:avoid;">
              <p style="margin:0 0 4pt 0; font-size:11.5pt;">
                <strong>Câu ${q.number}</strong>
                <span style="color:#b45309; font-size:10pt;">[${lv} &ndash; ${escapeHtml(
              q.chapterNumber
            )}: ${escapeHtml(q.chapterTitle)}]</span>:
                ${escapeHtml(q.question)}
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
                  ? `<p style="margin:3pt 0 0 8pt; font-size:10.5pt; color:#92400e;">
                      <em>&rarr; <strong>Đáp án đúng: ${
                        OPTION_LABELS[q.correctIndex]
                      }</strong>. Giải thích: ${escapeHtml(q.explanation)}</em>
                    </p>`
                  : ''
              }
            </div>`;
          })
          .join('');

        const answerTable = `
          <div style="margin-top:14pt; padding:8pt; background-color:#f8fafc; border:1px solid #cbd5e1; page-break-inside:avoid;">
            <h4 style="margin:0 0 6pt 0; font-size:11.5pt; color:#0f172a;">
              BẢNG ĐÁP ÁN CHUẨN &ndash; ${escapeHtml(exam.title.toUpperCase())} (MÃ ĐỀ ${exam.code})
            </h4>
            <p style="margin:0; font-size:10.5pt; line-height:1.6;">
              ${exam.questions
                .map((q) => `<strong>${q.number}.${OPTION_LABELS[q.correctIndex]}</strong>`)
                .join(' &nbsp;|&nbsp; ')}
            </p>
          </div>`;

        return `
        <div style="${eIdx > 0 ? 'page-break-before:always;' : ''} margin-bottom:24pt;">
          <div style="background-color:#fffbeb; border:2px solid #d97706; padding:10pt; margin-bottom:12pt;">
            <p style="margin:0; font-size:10.5pt; color:#b45309; font-weight:bold; text-transform:uppercase;">
              SGK CÔNG NGHỆ CHĂN NUÔI 11 &bull; BỘ SÁCH KẾT NỐI TRI THỨC VỚI CUỘC SỐNG &bull; MÃ ĐỀ ${exam.code}
            </p>
            <h2 style="margin:4pt 0 2pt 0; font-size:15pt; color:#78350f; text-transform:uppercase;">
              ${escapeHtml(exam.title)}
            </h2>
            <p style="margin:0; font-size:10.5pt; color:#92400e;">
              Cấu trúc: <strong>40 câu trắc nghiệm (28 câu Đã biết + 12 câu Thông hiểu)</strong> &bull; Thời gian: ${
                exam.durationMinutes
              } phút &bull; Phân bổ đều 6 Chương SGK Lớp 11
            </p>
          </div>

          <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse:collapse; border:1px solid #cbd5e1; margin-bottom:12pt; font-size:10.5pt;">
            <thead>
              <tr style="background-color:#fef3c7; color:#78350f;">
                <th style="width:52%; text-align:left;">Chương trong SGK Công nghệ Chăn nuôi 11</th>
                <th style="width:16%; text-align:center;">Câu Đã biết</th>
                <th style="width:16%; text-align:center;">Câu Thông hiểu</th>
                <th style="width:16%; text-align:center;">Tổng số câu</th>
              </tr>
            </thead>
            <tbody>
              ${distRows}
              <tr style="background-color:#fffbeb; font-weight:bold; color:#78350f;">
                <td>TỔNG CỘNG TOÀN ĐỀ (6 CHƯƠNG)</td>
                <td style="text-align:center;">28 câu (70%)</td>
                <td style="text-align:center;">12 câu (30%)</td>
                <td style="text-align:center;">40 câu (10,0 điểm)</td>
              </tr>
            </tbody>
          </table>

          ${questionsHtml}
          ${answerTable}
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
    @page { size: 21cm 29.7cm; margin: 2cm 2cm 2cm 2.5cm; }
    body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.4; color: #111827; }
  </style>
</head>
<body>
  ${examsHtml}
</body>
</html>`;
  };

  const triggerDownload = (content: string, filename: string) => {
    downloadHtmlAsDocx(content, filename);
  };

  const handleDownloadExamDoc = (
    exam: Grade11PracticeExam,
    mode: 'full_guide' | 'student_exam'
  ) => {
    if (!currentUser) {
      onRequireLogin?.('Vui lòng đăng nhập tài khoản để tải đề khảo nghiệm lớp 11 (.docx)!');
      return;
    }
    if (!canDownloadDocuments) {
      onRequireVipUpgrade?.();
      return;
    }
    const html = buildWordHtmlForExams([exam], exam.title, mode);
    const suffix = mode === 'full_guide' ? 'Co_Dap_An_Chi_Tiet' : 'De_Hoc_Sinh_Tu_Luyen';
    const filename = `De_Khao_Nghiem_CN11_So_0${exam.examNumber}_Ma_${exam.code}_${suffix}.docx`;
    triggerDownload(html, filename);
    trackDocumentDownload({
      fileName: filename,
      documentTitle: `${exam.title} (Mã đề ${exam.code})`,
      category: 'de_lop_11',
      categoryLabel: 'Bộ 5 Đề Khảo Nghiệm Lớp 11',
      modeLabel: mode === 'full_guide' ? 'Đề + Đáp án chi tiết (.docx)' : 'Đề tự luyện Học sinh (.docx)',
    });
    const key = `${exam.id}-${mode}`;
    setDownloadedId(key);
    setTimeout(() => setDownloadedId(null), 2500);
  };

  const handleDownloadAll5ExamsDoc = (mode: 'full_guide' | 'student_exam') => {
    if (!currentUser) {
      onRequireLogin?.('Vui lòng đăng nhập tài khoản để tải trọn bộ 5 đề khảo nghiệm lớp 11 (.docx)!');
      return;
    }
    if (!canDownloadDocuments) {
      onRequireVipUpgrade?.();
      return;
    }
    const html = buildWordHtmlForExams(
      GRADE_11_PRACTICE_EXAMS,
      'TRỌN BỘ 5 ĐỀ KHẢO NGHIỆM 40 CÂU LỚP 11 - CÔNG NGHỆ CHĂN NUÔI (KẾT NỐI TRI THỨC)',
      mode
    );
    const suffix = mode === 'full_guide' ? 'Co_Dap_An_Chi_Tiet' : 'De_Hoc_Sinh';
    const filename = `Tron_Bo_5_De_Khao_Nghiem_40_Cau_Cong_Nghe_11_Chan_Nuoi_${suffix}.docx`;
    triggerDownload(html, filename);
    trackDocumentDownload({
      fileName: filename,
      documentTitle: 'Trọn Bộ 5 Đề Khảo Nghiệm 40 Câu Lớp 11 (Công Nghệ Chăn Nuôi)',
      category: 'de_lop_11',
      categoryLabel: 'Bộ 5 Đề Khảo Nghiệm Lớp 11',
      modeLabel: mode === 'full_guide' ? 'Trọn bộ 5 đề + Đáp án (.docx)' : 'Trọn bộ 5 đề Học sinh (.docx)',
    });
    const key = `all-5-11-${mode}`;
    setDownloadedId(key);
    setTimeout(() => setDownloadedId(null), 2500);
  };

  const handleCopyExam = (exam: Grade11PracticeExam) => {
    const lines: string[] = [
      `==================================================`,
      `${exam.title.toUpperCase()} (MÃ ĐỀ ${exam.code})`,
      `Cấu trúc: 40 câu trắc nghiệm (28 câu Đã biết + 12 câu Thông hiểu) - Rải đều 6 chương SGK Lớp 11`,
      `Sách: Công nghệ Chăn nuôi 11 - Bộ sách Kết nối tri thức với cuộc sống`,
      `==================================================\n`,
      ...exam.questions.flatMap((q) => [
        `Câu ${q.number} [${q.level === 'biet' ? 'Đã biết' : 'Thông hiểu'} - ${q.chapterNumber}: ${q.chapterTitle}]: ${q.question}`,
        ...q.options.map((opt, idx) => `  ${OPTION_LABELS[idx]}. ${opt}`),
        `  -> Đáp án đúng: ${OPTION_LABELS[q.correctIndex]} | Giải thích: ${q.explanation}\n`,
      ]),
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopiedId(exam.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  // Compute stats for activeExam
  const answeredCount = activeExam
    ? activeExam.questions.filter(
        (q) => userChoices[`${activeExam.id}-q-${q.number}`] !== undefined
      ).length
    : 0;
  const correctCount = activeExam
    ? activeExam.questions.filter(
        (q) => userChoices[`${activeExam.id}-q-${q.number}`] === q.correctIndex
      ).length
    : 0;
  const scoreOutOf10 = ((correctCount / 40) * 10).toFixed(2);

  const displayedQuestions = activeExam
    ? activeExam.questions.filter((q) => {
        if (levelFilter !== 'all' && q.level !== levelFilter) return false;
        if (chapterFilter !== 'all' && q.chapterId !== chapterFilter) return false;
        return true;
      })
    : [];

  return (
    <section className="bg-white rounded-2xl border-2 border-amber-600/80 shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-orange-900 p-5 sm:p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-300/20 border border-amber-200/40 text-amber-100 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SGK Công Nghệ Chăn Nuôi 11 · Bộ Sách Kết Nối Tri Thức Với Cuộc Sống</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
              Bộ 5 Đề Khảo Nghiệm 40 Câu Ôn Tập Chương Trình Lớp 11 (28 Câu Đã Biết · 12 Câu Thông Hiểu)
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
              Mỗi đề gồm đúng <strong>40 câu trắc nghiệm</strong> (<strong>28 câu Đã biết</strong> chiếm 70% + <strong>12 câu Thông hiểu</strong> chiếm 30%), nội dung <strong>rải rác đều ở cả 6 Chương</strong> SGK Công nghệ Chăn nuôi 11 (mỗi chương đều có <strong>2 câu Thông hiểu</strong> và <strong>4–5 câu Đã biết</strong>).
            </p>
          </div>

          {/* Batch Download 5 Exams Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleDownloadAll5ExamsDoc('full_guide')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-300 hover:bg-amber-200 text-slate-950 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Tải trọn bộ 5 đề khảo nghiệm lớp 11 (200 câu) kèm đáp án và lời giải chi tiết (.docx)"
            >
              {downloadedId === 'all-5-11-full_guide' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã tải 5 Đề (Có giải)</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Trọn Bộ 5 Đề Có Giải (.docx)</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownloadAll5ExamsDoc('student_exam')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/30 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Tải trọn bộ 5 đề bản học sinh tự luyện kèm bảng đáp án cuối mỗi đề (.docx)"
            >
              {downloadedId === 'all-5-11-student_exam' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã tải 5 Đề HS</span>
                </>
              ) : (
                <>
                  <Printer className="w-3.5 h-3.5" />
                  <span>Tải 5 Đề Học Sinh (.docx)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 5 Exam Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mt-5">
          {GRADE_11_PRACTICE_EXAMS.map((exam) => {
            const isSelected = activeExamId === exam.id;
            const isGuest = !currentUser;
            return (
              <div
                key={exam.id}
                onClick={() => {
                  if (isSelected) {
                    setActiveExamId(null);
                  } else {
                    setActiveExamId(exam.id);
                    setLevelFilter('all');
                    setChapterFilter('all');
                  }
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white text-amber-950 border-white shadow-md ring-2 ring-amber-300'
                    : 'bg-amber-950/60 hover:bg-amber-950/90 text-amber-50 border-amber-700/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 text-[11px] font-bold">
                    <span
                      className={`px-2 py-0.5 rounded font-mono ${
                        isSelected
                          ? 'bg-amber-800 text-white'
                          : 'bg-amber-800/80 text-amber-200'
                      }`}
                    >
                      MÃ ĐỀ {exam.code}
                    </span>
                    <span className={isSelected ? 'text-amber-700' : 'text-amber-300'}>
                      40 câu
                    </span>
                  </div>
                  <div className="font-extrabold text-sm mt-1.5">
                    Đề Khảo Nghiệm 0{exam.examNumber} – Lớp 11
                  </div>
                  <div
                    className={`text-[11px] mt-1 pt-1 border-t ${
                      isSelected
                        ? 'border-slate-200 text-slate-600'
                        : 'border-amber-800/70 text-amber-200/90'
                    }`}
                  >
                    28 câu Đã biết · 12 Thông hiểu
                    <span className="block font-semibold">Rải đều 6 chương (6–7 câu/chương)</span>
                  </div>
                </div>

                {/* Mã QR Button on each Exam Card */}
                <div
                  className={`mt-2.5 pt-2 border-t flex items-center gap-1.5 ${
                    isSelected ? 'border-slate-200' : 'border-amber-800/70'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onAssignQr?.(exam)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300'
                        : 'bg-white/15 hover:bg-white/25 text-white border border-white/25'
                    }`}
                    title={
                      isGuest
                        ? 'Cần đăng nhập tài khoản để tạo mã QR giao đề'
                        : `Tạo mã QR giao ${exam.title} cho học sinh`
                    }
                  >
                    {isGuest ? (
                      <Lock className="w-3 h-3 text-amber-300 shrink-0" />
                    ) : (
                      <QrCode className="w-3 h-3 shrink-0" />
                    )}
                    <span>Mã QR</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Exam Content */}
      {activeExam && (
        <div className="p-5 sm:p-6 space-y-5 bg-slate-50/50">
          {/* Exam Meta + Chapter Distribution Strip */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-md font-mono font-bold bg-amber-800 text-white">
                    MÃ ĐỀ {activeExam.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md font-bold bg-sky-50 text-sky-800 border border-sky-200">
                    28 câu Đã biết (70%)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    12 câu Thông hiểu (30%)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Rải đều 6 Chương = 40 câu
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 pt-0.5">
                  {activeExam.title}
                </h3>
              </div>

              {/* Action Toolbar for Current Exam */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => onAssignQr?.(activeExam)}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title={!currentUser ? 'Cần đăng nhập tài khoản để tạo mã QR giao đề' : 'Tạo mã QR giao đề khảo nghiệm này cho học sinh'}
                >
                  {!currentUser ? (
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <QrCode className="w-3.5 h-3.5 text-amber-700" />
                  )}
                  <span>Mã QR</span>
                </button>

                <button
                  onClick={handleToggleAllAnswers}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    showAnswers
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  {showAnswers ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Ẩn đáp án để tự làm</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Hiện đáp án & giải thích</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleResetExam(activeExam.id)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Làm lại</span>
                </button>

                <button
                  onClick={() => handleCopyExam(activeExam)}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === activeExam.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Đã chép đề</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Chép đề</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownloadExamDoc(activeExam, 'full_guide')}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {downloadedId === `${activeExam.id}-full_guide` ? (
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
                  onClick={() => handleDownloadExamDoc(activeExam, 'student_exam')}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {downloadedId === `${activeExam.id}-student_exam` ? (
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

            {/* Chapter Distribution Matrix (Click to filter by Chapter) */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <BookOpenCheck className="w-4 h-4 text-amber-700" />
                  <span>Phân bổ câu hỏi rải đều 6 chương SGK Công nghệ Chăn nuôi 11 (Bấm để lọc theo chương):</span>
                </span>
                {chapterFilter !== 'all' && (
                  <button
                    onClick={() => setChapterFilter('all')}
                    className="text-amber-800 hover:underline font-semibold cursor-pointer"
                  >
                    Hiện tất cả 6 chương (40 câu)
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                {activeExam.chapterDistribution.map((dist) => {
                  const isChSelected = chapterFilter === dist.chapterId;
                  return (
                    <button
                      key={dist.chapterId}
                      onClick={() =>
                        setChapterFilter(isChSelected ? 'all' : dist.chapterId)
                      }
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        isChSelected
                          ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                          : 'bg-slate-50 hover:bg-amber-50/70 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{dist.chapterNumber}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${
                            isChSelected
                              ? 'bg-amber-300 text-slate-950'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {dist.totalCount} câu
                        </span>
                      </div>
                      <div
                        className={`text-[11px] truncate mt-0.5 ${
                          isChSelected ? 'text-amber-100' : 'text-slate-600'
                        }`}
                        title={dist.chapterTitle}
                      >
                        {dist.chapterTitle}
                      </div>
                      <div
                        className={`text-[10px] mt-1 font-medium ${
                          isChSelected ? 'text-amber-200' : 'text-slate-500'
                        }`}
                      >
                        {dist.bietCount} Biết · {dist.hieuCount} Hiểu
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level Filter + Live Practice Score Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-semibold mr-1">Lọc mức độ:</span>
                <button
                  onClick={() => setLevelFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                    levelFilter === 'all'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Tất cả ({activeExam.totalQuestions} câu)
                </button>
                <button
                  onClick={() => setLevelFilter('biet')}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                    levelFilter === 'biet'
                      ? 'bg-sky-700 text-white border-sky-700'
                      : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
                  }`}
                >
                  Câu Đã biết ({activeExam.bietCount} câu)
                </button>
                <button
                  onClick={() => setLevelFilter('hieu')}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                    levelFilter === 'hieu'
                      ? 'bg-amber-700 text-white border-amber-700'
                      : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  Câu Thông hiểu ({activeExam.hieuCount} câu)
                </button>
              </div>

              {/* Score Summary Pill */}
              <div className="flex flex-wrap items-center gap-3 text-xs bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl">
                <span className="text-slate-700">
                  Đã làm: <strong className="text-slate-900">{answeredCount}/40</strong> câu
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-700">
                  Đúng: <strong className="text-emerald-800">{correctCount}/40</strong> câu
                </span>
                <span className="text-slate-300">|</span>
                <span className="font-bold text-amber-950 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Điểm: {scoreOutOf10} / 10,0</span>
                </span>
              </div>
            </div>
          </div>

          {/* 40 Questions List */}
          <div className="space-y-3">
            {displayedQuestions.map((q) => {
              const qKey = `${activeExam.id}-q-${q.number}`;
              const expanded = isQuestionExpanded(qKey);
              const lvBadge = getLevelBadge(q.level);
              const userSelected = userChoices[qKey];
              const hasAnswered = userSelected !== undefined;

              return (
                <div
                  key={q.number}
                  className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs"
                >
                  {/* Question Header */}
                  <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-slate-900 text-white text-xs font-extrabold">
                          Câu {q.number}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded border text-[11px] font-bold ${lvBadge.cls}`}
                        >
                          {lvBadge.label}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold">
                          {q.chapterNumber}: {q.chapterTitle}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed pt-0.5">
                        {q.question}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleQuestionAnswer(qKey)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 shrink-0 mt-0.5 cursor-pointer"
                      title="Đóng/mở đáp án và giải thích"
                    >
                      {expanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </div>

                  {/* 4 Options Grid */}
                  <div className="p-3.5 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-2.5 bg-white">
                    {q.options.map((optText, optIdx) => {
                      const isCorrect = optIdx === q.correctIndex;
                      const isChosen = userSelected === optIdx;
                      const revealAnswer = expanded || hasAnswered;

                      let optionStyle =
                        'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-800';
                      let badgeStyle = 'bg-white text-slate-700 border border-slate-300';

                      if (revealAnswer) {
                        if (isCorrect) {
                          optionStyle =
                            'border-emerald-500 bg-emerald-50/90 text-emerald-950 font-semibold ring-1 ring-emerald-500/40';
                          badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                        } else if (isChosen && !isCorrect) {
                          optionStyle =
                            'border-rose-400 bg-rose-50 text-rose-950 line-through opacity-90';
                          badgeStyle = 'bg-rose-600 text-white border-rose-600';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() =>
                            setUserChoices((prev) => ({
                              ...prev,
                              [qKey]: optIdx,
                            }))
                          }
                          className={`w-full h-full text-left p-3 rounded-lg border transition-all flex items-start gap-2.5 text-xs sm:text-[13px] leading-relaxed cursor-pointer ${optionStyle}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 ${badgeStyle}`}
                          >
                            {OPTION_LABELS[optIdx]}
                          </span>
                          <span className="flex-1">{optText}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation Footer */}
                  {(expanded || hasAnswered) && (
                    <div className="px-4 py-3 bg-amber-50/50 border-t border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700">
                      <div>
                        <span className="font-extrabold text-emerald-800 mr-2">
                          Đáp án đúng: {OPTION_LABELS[q.correctIndex]}
                        </span>
                        {hasAnswered && (
                          <span
                            className={`font-bold mr-2 px-2 py-0.5 rounded ${
                              userSelected === q.correctIndex
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {userSelected === q.correctIndex
                              ? '✓ Bạn chọn chính xác'
                              : `✗ Bạn đã chọn ${OPTION_LABELS[userSelected]}`}
                          </span>
                        )}
                        <span className="text-slate-700">{q.explanation}</span>
                      </div>
                      <span className="text-[11px] text-amber-900 font-medium shrink-0">
                        <FileText className="w-3 h-3 inline mr-1" />
                        {q.lessonRef}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
