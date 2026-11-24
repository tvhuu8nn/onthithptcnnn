import React, { useState, useEffect } from 'react';
import { Exam } from '../types/exam';
import {
  UserCheck,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

interface StudentEntryModalProps {
  exam: Exam;
  initialName?: string;
  classroom?: string;
  initialStudentId?: string;
  durationMinutes: number;
  teacherNote?: string;
  onStart: (studentInfo: { name: string; studentClass: string; studentId?: string }) => void;
  onCancel: () => void;
}

const COMMON_CLASSES = ['Ôn THPT', '12A1', '12A2', '12A3', '11A1', '10A1'];

export const StudentEntryModal: React.FC<StudentEntryModalProps> = ({
  exam,
  initialName = '',
  classroom = 'Ôn THPT',
  initialStudentId = '',
  durationMinutes,
  teacherNote,
  onStart,
  onCancel,
}) => {
  const [studentName, setStudentName] = useState(initialName);
  const [studentClass, setStudentClass] = useState(classroom || 'Ôn THPT');
  const [studentId, setStudentId] = useState(initialStudentId);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (classroom && classroom.trim()) {
      setStudentClass(classroom.trim());
    }
  }, [classroom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên của em trước khi vào làm bài thi.');
      return;
    }
    if (!studentClass.trim()) {
      setErrorMsg('Vui lòng chọn hoặc nhập tên lớp của em.');
      return;
    }

    onStart({
      name: studentName.trim(),
      studentClass: studentClass.trim(),
      studentId: studentId.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
        {/* Header: Exam info and badge */}
        <div className="text-center space-y-2 border-b border-slate-100 pb-5">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 mb-1">
            <GraduationCap className="w-8 h-8 text-emerald-700" />
          </div>
          <span className="text-xs uppercase tracking-wider text-emerald-800 font-bold block">
            Thẻ Thí Sinh Dự Thi · Kỳ Thi Tốt Nghiệp THPT
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
            {exam.title}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-slate-600 font-medium">
            <span>Mã đề: <strong className="font-mono text-emerald-800 font-bold">{exam.code}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Thời gian: <strong className="text-slate-900">{durationMinutes} phút</strong></span>
            <span aria-hidden="true">·</span>
            <span>
              Cấu trúc:{' '}
              <strong>
                {exam.partII.length > 0
                  ? `${exam.partI.length} câu TN + ${exam.partII.length} câu Đ/S`
                  : `${exam.partI.length} câu TN (28 Nhận biết · 12 Thông hiểu)`}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Số lượt làm bài: Không giới hạn
            </span>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5 text-xs text-emerald-950 space-y-1">
          <div className="flex items-center gap-2 font-bold text-emerald-900">
            <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Thí sinh tự nhập họ tên và lớp trước khi làm bài (Không giới hạn số lượt thi):</span>
          </div>
          <p className="text-[11px] text-emerald-900/90 pl-6 leading-relaxed">
            Thông tin họ tên và lớp sẽ được ghi nhận vào bài thi và hiển thị trên phiếu báo điểm khi nộp bài. Đề thi <strong>không giới hạn số lượt làm bài</strong>, thí sinh có thể làm lại nhiều lần để ôn luyện.
          </p>
        </div>

        {/* Teacher Note Callout (if present) */}
        {teacherNote && (
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3.5 text-xs text-amber-950 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-amber-900">
              💬 Lời dặn dò từ Thầy / Cô:
            </span>
            <p className="leading-relaxed pl-5 italic">{teacherNote}</p>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Student Name */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Họ và tên thí sinh: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => {
                setStudentName(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Ví dụ: Nguyễn Văn An..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Student Class */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Lớp học: <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="text-[11px] text-slate-400">Gợi ý nhanh:</span>
              {COMMON_CLASSES.map((cls) => (
                <button
                  type="button"
                  key={cls}
                  onClick={() => {
                    setStudentClass(cls);
                    setErrorMsg('');
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors border cursor-pointer ${
                    studentClass === cls
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
            <input
              type="text"
              required
              value={studentClass}
              onChange={(e) => {
                setStudentClass(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Nhập lớp học của em (ví dụ: Ôn THPT, 12A1)..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Student ID / SBD */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Số báo danh (SBD) / Mã học sinh: <span className="text-slate-400 font-normal">(tùy chọn)</span>
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Ví dụ: 120045"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900 font-medium font-mono placeholder:text-slate-400"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 transition-all rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Xác Nhận & Bắt Đầu Làm Bài ({durationMinutes} Phút)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
