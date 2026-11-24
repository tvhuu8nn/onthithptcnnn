import React, { useState } from 'react';
import { Exam, UserExamAnswers, ExamResultSummary } from '../types/exam';
import {
  CheckCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  BookOpen,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Download,
} from 'lucide-react';
import { explainQuestionWithAI } from '../services/aiService';
import { TrueFalseScenarioDisplay } from './TrueFalseScenarioDisplay';
import { DocumentTable } from './DocumentTable';
import { DocumentChart } from './DocumentChart';
import { extractTableAndCitationFromBlock } from '../data/provincialAndOfficialExams';

interface ExamResultViewProps {
  exam: Exam;
  answers: UserExamAnswers;
  result: ExamResultSummary;
  onRetake: () => void;
  onBackToHome: () => void;
  onPrint: () => void;
  onViewAdmin?: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  exam,
  answers,
  result,
  onRetake,
  onBackToHome,
  onPrint,
  onViewAdmin,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'wrong' | 'part1' | 'part2'>('all');
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);

  const getRank = (score: number) => {
    if (score >= 9.0) return { title: 'Xuất sắc', color: 'text-emerald-800 bg-emerald-50 border-emerald-300' };
    if (score >= 8.0) return { title: 'Giỏi', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (score >= 6.5) return { title: 'Khá', color: 'text-sky-800 bg-sky-50 border-sky-300' };
    if (score >= 5.0) return { title: 'Trung bình', color: 'text-amber-800 bg-amber-50 border-amber-300' };
    return { title: 'Cần cố gắng', color: 'text-rose-800 bg-rose-50 border-rose-300' };
  };

  const rank = getRank(result.totalScore);
  const studentDisplayName = result.studentInfo?.name || answers.studentInfo?.name || 'Học sinh';
  const studentDisplayClass = result.studentInfo?.studentClass || answers.studentInfo?.studentClass || '12A1';
  const totalWrongPartI = exam.partI.length - result.partICorrectCount;
  const maxPartIIPoints = exam.partII.length * 1.0;
  const maxPartIPoints = exam.partII.length > 0 ? Math.max(0, 10.0 - maxPartIIPoints) : 10.0;
  const pointPerPartI = exam.partI.length > 0 ? maxPartIPoints / exam.partI.length : 0;
  const pointPerPartILabel = pointPerPartI.toFixed(2).replace('.', ',');

  const handleAskAI = async (
    qId: string,
    questionContext: {
      questionTitle: string;
      domain: string;
      optionsOrStatements: string;
      studentChoice?: string;
      correctAnswer: string;
      contextScenario?: string;
    }
  ) => {
    setLoadingAiId(qId);
    try {
      const expl = await explainQuestionWithAI(questionContext);
      setAiExplanations((prev) => ({ ...prev, [qId]: expl }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAiId(null);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins} phút ${s} giây`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={onBackToHome}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về danh sách đề thi</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Kết Quả Bài Thi · {exam.title}
          </h1>
          <p className="text-xs text-slate-500">
            Mã đề: {exam.code} · Hoàn thành trong: {formatSeconds(result.timeSpentSeconds)}
            {result.studentInfo && (
              <span className="font-bold text-emerald-800 ml-2">
                · Thí sinh: {result.studentInfo.name} ({result.studentInfo.studentClass})
                {result.studentInfo.studentId ? ` · SBD: ${result.studentInfo.studentId}` : ''}
              </span>
            )}
            {result.violationCount !== undefined && result.violationCount >= 5 ? (
              <span className="inline-flex items-center gap-1 font-extrabold text-white bg-rose-600 border border-rose-700 px-2.5 py-0.5 rounded-md ml-2 animate-pulse">
                🚨 Hệ thống tự thu bài (Thoát giao diện {result.violationCount}/5 lần)
              </span>
            ) : result.violationCount !== undefined && result.violationCount > 0 ? (
              <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md ml-2">
                ⚠️ Thoát giao diện làm bài: {result.violationCount}/5 lần
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md ml-2">
                ✓ Nghiêm túc (0 lần thoát giao diện)
              </span>
            )}
            <span className="inline-flex items-center gap-1 font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md ml-2">
              ∞ Giao 1 lần qua QR · Làm bài không giới hạn bất cứ thời gian nào
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onPrint}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer text-emerald-900 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 active:scale-95"
            title="Tải đề thi về máy (File Word .docx hoặc In/Lưu PDF)"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Tải đề / In ấn</span>
          </button>
          <button
            onClick={onRetake}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            title="Đề thi giao qua QR 1 lần được làm bài không giới hạn số lượt bất cứ thời gian nào - Bấm để làm lại ngay"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Làm lại đề này (Không giới hạn mọi lúc)</span>
          </button>
        </div>
      </div>

      {/* Admin Scoreboard Sync Confirmation Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-5 border border-emerald-700 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-700/80 flex items-center justify-center shrink-0 border border-emerald-500 shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-800/80 px-2 py-0.5 rounded border border-emerald-600/50">
                  ✓ Đã Lưu Vào Thẻ Bảng Điểm
                </span>
                <span className="text-xs text-emerald-300/90 font-medium">
                  Đồng bộ tức thì
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mt-1">
                Điểm số bài thi đã được cập nhật trực tiếp vào hệ thống quản lý của Giáo viên
              </h2>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Thí sinh: <strong className="text-white font-semibold">{result.studentInfo?.name || 'Học sinh'}</strong> · Lớp:{' '}
                <strong className="text-white font-semibold">{result.studentInfo?.studentClass || '12A1'}</strong>
                {result.studentInfo?.studentId ? ` · SBD: ${result.studentInfo.studentId}` : ''} · Tổng điểm:{' '}
                <span className="font-extrabold text-amber-300 text-sm">{result.totalScore.toFixed(2)}/10,0</span> (Xếp loại {rank.title}).
              </p>
            </div>
          </div>

          {onViewAdmin && (
            <button
              onClick={onViewAdmin}
              className="px-4 py-2.5 text-xs font-bold text-emerald-950 bg-emerald-200 hover:bg-emerald-100 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 shrink-0 border border-emerald-300 cursor-pointer"
            >
              <span>Xem Bảng Điểm</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hero Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Score Box */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tổng Điểm Toàn Bài
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${rank.color}`}>
                {rank.title}
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-emerald-800 tabular-nums">
                {result.totalScore.toFixed(2)}
              </span>
              <span className="text-slate-400 font-semibold text-lg">/ 10,0</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Thời gian: {formatSeconds(result.timeSpentSeconds)}
          </div>
        </div>

        {/* Part I Score */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Phần I: Trắc nghiệm ({exam.partI.length} câu)
            </span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums">
                {result.partIScore.toFixed(2)}
              </span>
              <span className="text-slate-400 font-semibold text-base">
                / {(exam.partI.length > 0 ? maxPartIPoints : 0).toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
            <span>Đúng:</span>
            <strong className="text-emerald-700">
              {result.partICorrectCount} / {exam.partI.length} câu ({exam.partI.length > 0 ? ((result.partICorrectCount / exam.partI.length) * 100).toFixed(0) : 0}%)
            </strong>
          </div>
        </div>

        {/* Part II Score */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {exam.partII.length > 0 ? `Phần II: Đúng/Sai (${exam.partII.length} câu)` : 'Cấu trúc đề trắc nghiệm'}
            </span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums">
                {exam.partII.length > 0 ? result.partIIScore.toFixed(2) : `${exam.partI.length} câu`}
              </span>
              <span className="text-slate-400 font-semibold text-base">
                {exam.partII.length > 0 ? `/ ${maxPartIIPoints.toFixed(2).replace('.', ',')}` : '· 10,00đ'}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
            <span>{exam.partII.length > 0 ? 'Số ý đúng:' : 'Định dạng:'}</span>
            <strong className="text-emerald-700">
              {exam.partII.length > 0
                ? `${result.partIICorrectStatementsCount} / ${exam.partII.length * 4} ý (${((result.partIICorrectStatementsCount / (exam.partII.length * 4)) * 100).toFixed(0)}%)`
                : 'Chỉ gồm Phần I'}
            </strong>
          </div>
        </div>

        {/* Cognitive Levels Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Năng Lực Theo Mức Độ
          </span>
          <div className="mt-3 space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Nhận biết (NB):</span>
                <span className="font-semibold text-slate-900">
                  {result.levelScores.NB.correct}/{result.levelScores.NB.total}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{
                    width: `${result.levelScores.NB.total ? (result.levelScores.NB.correct / result.levelScores.NB.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Thông hiểu (TH):</span>
                <span className="font-semibold text-slate-900">
                  {result.levelScores.TH.correct}/{result.levelScores.TH.total}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-600 h-full rounded-full"
                  style={{
                    width: `${result.levelScores.TH.total ? (result.levelScores.TH.correct / result.levelScores.TH.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Vận dụng (VD):</span>
                <span className="font-semibold text-slate-900">
                  {result.levelScores.VD.correct}/{result.levelScores.VD.total}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full"
                  style={{
                    width: `${result.levelScores.VD.total ? (result.levelScores.VD.correct / result.levelScores.VD.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmed submission to Admin banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-emerald-950">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <strong className="block text-emerald-900 text-sm">
              Điểm số đã được tự động gửi về Bảng Điểm Quản Trị của Thầy/Cô
            </strong>
            <span className="text-emerald-700">
              Thí sinh: <strong>{result.studentInfo?.name || 'Học sinh'}</strong> (Lớp {result.studentInfo?.studentClass || '12A1'}) · Điểm số: <strong>{result.totalScore.toFixed(2)}/10,0</strong> · Mã đề: {exam.code}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Đã lưu hệ thống
          </span>
        </div>
      </div>

      {/* Domain Performance Analysis Cards */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Thống Kê Điểm Số Theo Chương Trình Kết Nối Tri Thức
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100">
            <span className="text-xs font-semibold text-emerald-900">Công nghệ 10 · Trồng trọt</span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {result.domainScores.crop.correct} / 4 câu
            </div>
            <span className="text-xs text-slate-500">4 câu Nhận biết (1,00 điểm)</span>
          </div>
          <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-100">
            <span className="text-xs font-semibold text-amber-900">Công nghệ 11 · Chăn nuôi</span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {result.domainScores.husbandry.correct} / 4 câu
            </div>
            <span className="text-xs text-slate-500">4 câu Nhận biết (1,00 điểm)</span>
          </div>
          <div className="p-4 rounded-lg bg-teal-50/50 border border-teal-100">
            <span className="text-xs font-semibold text-teal-900">Công nghệ 12 · Lâm nghiệp</span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {result.domainScores.forestry.correct} / {result.domainScores.forestry.total} ý/câu
            </div>
            <span className="text-xs text-slate-500">Gồm trắc nghiệm và 2 tình huống Đ/S</span>
          </div>
          <div className="p-4 rounded-lg bg-sky-50/50 border border-sky-100">
            <span className="text-xs font-semibold text-sky-900">Công nghệ 12 · Thủy sản</span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {result.domainScores.aquaculture.correct} / {result.domainScores.aquaculture.total} ý/câu
            </div>
            <span className="text-xs text-slate-500">Gồm trắc nghiệm và 2 tình huống Đ/S</span>
          </div>
        </div>
      </div>

      {/* Review Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-200 pb-3">
        <h2 className="text-lg font-bold text-slate-900">
          Xem Lại Chi Tiết Bài Làm & Dẫn Chiếu SGK
        </h2>
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả câu
          </button>
          <button
            onClick={() => setActiveFilter('wrong')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeFilter === 'wrong' ? 'bg-white text-rose-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chỉ câu HS {studentDisplayName} làm sai ({totalWrongPartI})
          </button>
          <button
            onClick={() => setActiveFilter('part1')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeFilter === 'part1' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Phần I (Trắc nghiệm)
          </button>
          <button
            onClick={() => setActiveFilter('part2')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeFilter === 'part2' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Phần II (Đúng/Sai)
          </button>
        </div>
      </div>

      {/* Review Questions List */}
      <div className="space-y-6">
        {/* Render Part I Questions */}
        {exam.partI.length > 0 && (activeFilter === 'all' || activeFilter === 'part1' || activeFilter === 'wrong') && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
              Phần I: {exam.partI.length} Câu Trắc Nghiệm Nhiều Phương Án Lựa Chọn
            </h3>

            {exam.partI.map((q) => {
              const userChoice = answers.partI[q.id];
              const isCorrect = userChoice === q.correctAnswer;

              if (activeFilter === 'wrong' && isCorrect) {
                return null;
              }

              const aiExpl = aiExplanations[q.id];
              const isLoadingAi = loadingAiId === q.id;

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-xl border p-5 sm:p-6 transition-all ${
                    isCorrect ? 'border-slate-200' : 'border-rose-200 ring-1 ring-rose-100'
                  }`}
                >
                  {/* Meta header */}
                  <div className="flex items-center justify-between gap-3 text-xs text-slate-500 mb-3 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">Câu {q.number}.</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Lớp {q.grade} · {q.domain === 'crop' ? 'Trồng trọt' : q.domain === 'husbandry' ? 'Chăn nuôi' : q.domain === 'forestry' ? 'Lâm nghiệp' : 'Thủy sản'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{q.level === 'NB' ? 'Nhận biết' : q.level === 'TH' ? 'Thông hiểu' : 'Vận dụng'}</span>
                      {q.chartData && (
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
                          Phân tích biểu đồ
                        </span>
                      )}
                      {q.tableData && (
                        <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
                          Phân tích số liệu
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {!isCorrect && (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200">
                          HS {studentDisplayName} ({studentDisplayClass}) làm sai
                        </span>
                      )}
                      {isCorrect ? (
                        <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>+{pointPerPartILabel} đ</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>0,00 đ</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question */}
                  {(() => {
                    const qImgs = q.images && q.images.length > 0 ? q.images : q.imageUrl ? [q.imageUrl] : [];
                    const inlineTbl =
                      !q.tableData && q.question.includes('|')
                        ? extractTableAndCitationFromBlock(q.question)
                        : null;
                    const displayStem = inlineTbl?.tableData ? inlineTbl.cleanedText : q.question;
                    const tablesToRender = [
                      ...(q.tableData
                        ? [q.tableData]
                        : inlineTbl?.tableData
                        ? [inlineTbl.tableData, ...(inlineTbl.extraTables || [])]
                        : []),
                      ...(q.extraTables || []),
                    ];
                    const chartsToRender = [
                      ...(q.chartData ? [q.chartData] : []),
                      ...(q.extraCharts || []),
                    ];

                    return (
                      <div className="space-y-2.5 mb-4">
                        <p className="text-slate-900 font-medium text-base leading-relaxed whitespace-pre-line">
                          {displayStem}
                        </p>

                        {qImgs.length > 0 && (
                          <div className={`grid gap-3 my-2 ${qImgs.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                            {qImgs.map((src, idx) => (
                              <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 flex justify-center">
                                <img
                                  src={src}
                                  alt={`Hình minh họa Câu ${q.number} (${idx + 1})`}
                                  className="max-h-80 w-auto object-contain rounded"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {chartsToRender.map((ch, cIdx) => (
                          <DocumentChart key={cIdx} chartData={ch} className="my-2 shadow-2xs" />
                        ))}

                        {tablesToRender.map((tbl, tIdx) => (
                          <DocumentTable key={tIdx} tableData={tbl} className="my-2" />
                        ))}

                        {q.questionFooter && (
                          <p className="text-slate-900 font-semibold text-sm sm:text-base">
                            {q.questionFooter}
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 items-stretch mb-4">
                    {(['A', 'B', 'C', 'D'] as const).map((key) => {
                      const text = q.options[key];
                      const isOptionCorrect = q.correctAnswer === key;
                      const isOptionChosen = userChoice === key;

                      let style = 'bg-slate-50 border-slate-200 text-slate-700';
                      if (isOptionCorrect) {
                        style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium ring-1 ring-emerald-300';
                      } else if (isOptionChosen && !isOptionCorrect) {
                        style = 'bg-rose-50 border-rose-400 text-rose-950 line-through';
                      }

                      return (
                        <div
                          key={key}
                          className={`h-full p-3 rounded-lg border text-sm flex items-start gap-3 ${style}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isOptionCorrect
                                ? 'bg-emerald-700 text-white'
                                : isOptionChosen
                                ? 'bg-rose-700 text-white'
                                : 'bg-white border border-slate-300 text-slate-600'
                            }`}
                          >
                            {key}
                          </span>
                          <span className="pt-0.5 leading-snug flex-1">{text}</span>
                          {isOptionCorrect && (
                            <span className="ml-auto text-xs font-bold text-emerald-700 shrink-0">
                              Đáp án đúng
                            </span>
                          )}
                          {isOptionChosen && !isOptionCorrect && (
                            <span className="ml-auto text-xs font-bold text-rose-700 shrink-0 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>HS {studentDisplayName} đã chọn (Sai)</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Wrong Answer Student Banner */}
                  {!isCorrect && (
                    <div className="mb-4 p-3 rounded-lg bg-rose-50/90 border border-rose-200 text-xs text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
                        <span>
                          <strong className="text-rose-900">Bài làm HS {studentDisplayName}:</strong> Đã chọn phương án <strong className="text-rose-700 underline font-mono text-sm">{userChoice || 'Chưa chọn'}</strong> (Chưa chính xác)
                        </span>
                      </div>
                      <div className="font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded border border-emerald-300 self-start sm:self-auto">
                        Đáp án đúng của đề: Phương án {q.correctAnswer} ✓
                      </div>
                    </div>
                  )}

                  {/* Official Textbook Explanation */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-xs text-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <BookOpen className="w-4 h-4" />
                      <span>{q.textbookRef || 'Kiến thức SGK Kết nối tri thức'}</span>
                    </div>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>

                  {/* AI Explainer Accordion Button */}
                  <div className="mt-3">
                    <button
                      onClick={() =>
                        handleAskAI(q.id, {
                          questionTitle: q.question,
                          domain: `Công nghệ ${q.grade} ${q.domain}`,
                          optionsOrStatements: `A. ${q.options.A}\nB. ${q.options.B}\nC. ${q.options.C}\nD. ${q.options.D}`,
                          studentChoice: userChoice ? `Phương án ${userChoice}` : 'Chưa chọn',
                          correctAnswer: `Phương án ${q.correctAnswer}`,
                        })
                      }
                      disabled={isLoadingAi}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 py-1 px-2 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {isLoadingAi
                          ? 'Đang kết nối Gemini AI...'
                          : aiExpl
                          ? 'Xem lại giải thích AI'
                          : 'Hỏi AI Giáo viên phân tích bản chất câu hỏi'}
                      </span>
                    </button>

                    {aiExpl && (
                      <div className="mt-3 p-4 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                        {aiExpl}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Render Part II True/False Questions */}
        {exam.partII.length > 0 && (activeFilter === 'all' || activeFilter === 'part2' || activeFilter === 'wrong') && (
          <div className="space-y-6 pt-6">
            <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider">
              Phần II: {exam.partII.length} Câu Trắc Nghiệm Đúng Sai Theo Tình Huống
            </h3>

            {exam.partII.map((tfQ) => {
              const qScoreInfo = result.partIIQuestionsScore[tfQ.id] || {
                correctStatementsCount: 0,
                earnedScore: 0,
              };

              if (activeFilter === 'wrong' && qScoreInfo.earnedScore === 1.0) {
                return null;
              }

              const aiExpl = aiExplanations[tfQ.id];
              const isLoadingAi = loadingAiId === tfQ.id;

              return (
                <div
                  key={tfQ.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3 text-xs text-slate-500 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">
                        Câu {tfQ.number} (Phần II)
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Công nghệ 12 · {tfQ.domain === 'forestry' ? 'Lâm nghiệp' : 'Thủy sản'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 font-semibold">
                        Đúng {qScoreInfo.correctStatementsCount}/4 ý
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 text-xs">
                        +{qScoreInfo.earnedScore.toFixed(2)} / 1,00 đ
                      </span>
                    </div>
                  </div>

                  {/* Scenario box with table/chart and scholarly citation */}
                  <TrueFalseScenarioDisplay question={tfQ} />

                  {/* Statements review */}
                  <div className="space-y-3">
                    {tfQ.statements.map((stmt) => {
                      const userChoice = answers.partII[tfQ.id]?.[stmt.subId];
                      const isStmtCorrect = userChoice === stmt.isCorrect;

                      return (
                        <div
                          key={stmt.subId}
                          className={`p-3.5 rounded-lg border text-xs sm:text-sm space-y-2 ${
                            isStmtCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="text-slate-900 leading-relaxed">
                              <span className="font-bold mr-2 text-slate-900">{stmt.subId})</span>
                              <span className="text-xs text-slate-500 mr-2">
                                [{stmt.level === 'NB' ? 'Nhận biết' : stmt.level === 'TH' ? 'Thông hiểu' : 'Vận dụng'}]
                              </span>
                              {stmt.text}
                            </div>

                            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                              <span className="text-xs text-slate-700 font-medium">
                                HS {studentDisplayName} chọn:{' '}
                                <strong
                                   className={
                                     userChoice === null
                                       ? 'text-slate-400'
                                       : !isStmtCorrect
                                       ? 'text-rose-700 font-bold bg-rose-100 px-1.5 py-0.5 rounded'
                                       : 'text-emerald-700 font-bold'
                                   }
                                >
                                  {userChoice === null ? 'Chưa chọn' : userChoice ? 'Đúng' : 'Sai'}
                                  {!isStmtCorrect ? ' ✗ (Sai)' : ' ✓'}
                                </strong>
                              </span>
                              <span aria-hidden="true" className="text-slate-300">
                                |
                              </span>
                              <span className="text-xs font-bold text-slate-900">
                                Chuẩn:{' '}
                                <span className={stmt.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                                  {stmt.isCorrect ? 'ĐÚNG' : 'SAI'}
                                </span>
                              </span>
                              {isStmtCorrect ? (
                                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              )}
                            </div>
                          </div>

                          <div className="text-xs text-slate-600 bg-white/80 p-2.5 rounded border border-slate-200/80 leading-relaxed">
                            <strong>Giải thích:</strong> {stmt.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* AI Explanation for Scenario */}
                  <div className="pt-2">
                    <button
                      onClick={() =>
                        handleAskAI(tfQ.id, {
                          questionTitle: tfQ.scenarioTitle,
                          domain: `Công nghệ 12 ${tfQ.domain}`,
                          contextScenario: tfQ.scenario,
                          optionsOrStatements: tfQ.statements
                            .map((s) => `${s.subId}) [${s.level}]: ${s.text} -> ${s.isCorrect ? 'ĐÚNG' : 'SAI'}`)
                            .join('\n'),
                          correctAnswer: 'Bám sát SGK Kết nối tri thức và tình huống thực tế',
                        })
                      }
                      disabled={isLoadingAi}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 py-1 px-2 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {isLoadingAi
                          ? 'Đang phân tích...'
                          : aiExpl
                          ? 'Xem lại phân tích AI'
                          : 'Hỏi AI phân tích bối cảnh và hướng giải quyết'}
                      </span>
                    </button>

                    {aiExpl && (
                      <div className="mt-3 p-4 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                        {aiExpl}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
