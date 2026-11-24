import React from 'react';
import { Exam } from '../types/exam';
import { Clock, ArrowRight, Download, Lock, QrCode } from 'lucide-react';

interface ExamCardProps {
  exam: Exam;
  onStartExam: (exam: Exam) => void;
  onAssignQr?: (exam: Exam) => void;
  onDownloadExam: (exam: Exam) => void;
  isGuest?: boolean;
  canDownload?: boolean;
  canUseExamCard?: boolean;
}

export const ExamCard: React.FC<ExamCardProps> = ({
  exam,
  onStartExam,
  onAssignQr,
  onDownloadExam,
  isGuest = false,
  canDownload = true,
  canUseExamCard = true,
}) => {
  const isLockedCard = !canUseExamCard;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all p-5 sm:p-6 flex flex-col justify-between group relative ${
        isLockedCard
          ? 'border-amber-200/90 bg-slate-50/60 hover:border-amber-300'
          : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              MÃ ĐỀ {exam.code}
            </span>
            {isLockedCard && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                <Lock className="w-3 h-3 text-amber-700" />
                <span>Chỉ dành cho VIP</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{exam.durationMinutes} phút</span>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
          {exam.title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">
          {exam.description}
        </p>

        {/* Structure Badges */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="font-medium text-emerald-900">
            24 câu TN (1 VD biểu đồ · 1 VD số liệu)
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="font-medium text-amber-900">4 câu Đúng/Sai (4,0đ)</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="text-slate-500 font-medium">10,0 điểm</span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {onAssignQr && (
            <button
              onClick={() => onAssignQr(exam)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors shadow-2xs cursor-pointer ${
                isLockedCard
                  ? 'text-amber-900 bg-amber-50 border border-amber-300 hover:bg-amber-100'
                  : 'text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-50'
              }`}
              title={
                isGuest
                  ? 'Cần đăng nhập tài khoản để tạo mã QR'
                  : isLockedCard
                  ? 'Gói Giáo viên (50.000đ) đầy đủ tính năng 15 ngày đầu; từ ngày thứ 16 khóa Kho đề và không được tải tài liệu (Cần nâng cấp Giáo viên VIP)'
                  : 'Tạo mã QR đồng bộ nội dung đề thi để học sinh quét làm bài'
              }
            >
              {isGuest || isLockedCard ? (
                <Lock className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <QrCode className="w-3.5 h-3.5 text-emerald-700" />
              )}
              <span>Mã QR</span>
            </button>
          )}

          <button
            onClick={() => onDownloadExam(exam)}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors shadow-2xs cursor-pointer ${
              (!isGuest && !canDownload) || isLockedCard
                ? 'text-amber-900 bg-amber-50 border border-amber-300 hover:bg-amber-100'
                : 'text-emerald-900 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
            }`}
            title={
              isGuest
                ? 'Cần đăng nhập tài khoản để tải đề thi'
                : !canDownload || isLockedCard
                ? 'Gói Giáo viên (50.000đ) đầy đủ tính năng 15 ngày đầu; từ ngày thứ 16 khóa Kho đề và không được tải tài liệu (Cần nâng cấp Giáo viên VIP)'
                : 'Tải đề thi về máy (Word .docx hoặc PDF in ấn)'
            }
          >
            {isGuest || !canDownload || isLockedCard ? (
              <Lock className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <Download className="w-3.5 h-3.5 text-emerald-700" />
            )}
            <span>Tải Đề</span>
          </button>
        </div>

        <button
          onClick={() => onStartExam(exam)}
          className={`px-3.5 py-1.5 text-xs font-bold active:scale-95 transition-all rounded-lg flex items-center gap-1.5 shadow-2xs group-hover:shadow-sm cursor-pointer ${
            isLockedCard
              ? 'text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-400'
              : 'text-white bg-emerald-700 hover:bg-emerald-800'
          }`}
          title={
            isLockedCard
              ? 'Tài khoản cần nâng cấp VIP để tiếp tục sử dụng Kho đề'
              : 'Vào phòng thi làm bài (Không giới hạn số lượt làm bài)'
          }
        >
          {isLockedCard ? (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-800" />
              <span>Làm Bài</span>
            </>
          ) : (
            <>
              <span>Làm Bài</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
