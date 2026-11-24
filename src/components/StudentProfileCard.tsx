import React, { useState, useEffect } from 'react';
import { User, School, Hash, Check, Edit3, Save, Sparkles, UserCheck } from 'lucide-react';

export interface StudentProfile {
  name: string;
  studentClass: string;
  studentId?: string;
}

interface StudentProfileCardProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
}

const POPULAR_CLASSES = [
  'Ôn THPT',
];

export const StudentProfileCard: React.FC<StudentProfileCardProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(profile.name || '');
  const [studentClass, setStudentClass] = useState(profile.studentClass || '');
  const [studentId, setStudentId] = useState(profile.studentId || '');
  const [isEditing, setIsEditing] = useState(!profile.name || !profile.studentClass);
  const [justSaved, setJustSaved] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setName(profile.name || '');
    setStudentClass(profile.studentClass || '');
    setStudentId(profile.studentId || '');
    if (!profile.name || !profile.studentClass) {
      setIsEditing(true);
    }
  }, [profile]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setValidationError('Vui lòng tự nhập họ và tên của em.');
      return;
    }
    if (!studentClass.trim()) {
      setValidationError('Vui lòng tự nhập tên lớp của em.');
      return;
    }

    setValidationError('');
    const updated: StudentProfile = {
      name: name.trim(),
      studentClass: studentClass.trim(),
      studentId: studentId.trim() || undefined,
    };
    onUpdateProfile(updated);
    setIsEditing(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs transition-all hover:border-emerald-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
            <UserCheck className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Thẻ Học Sinh Tự Nhập Họ Tên & Lớp
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Tự nhập thông tin
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Học sinh tự điền họ tên và lớp. Thông tin này sẽ tự động gắn vào bài thi, phiếu kết quả và Bảng Điểm Quản Trị của Thầy/Cô.
            </p>
          </div>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-emerald-50 border border-emerald-200 transition-colors self-start sm:self-auto shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Sửa họ tên & lớp</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-colors shadow-2xs self-start sm:self-auto shrink-0 active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu Thông Tin</span>
          </button>
        )}
      </div>

      {!isEditing && profile.name ? (
        /* Saved profile display view */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/80">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs w-full">
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Họ và tên học sinh (tự nhập):</span>
              <strong className="text-sm font-bold text-slate-900 block truncate mt-0.5">
                {profile.name}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Lớp học (tự nhập):</span>
              <strong className="text-sm font-bold text-emerald-800 block mt-0.5">
                {profile.studentClass}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Số báo danh (SBD):</span>
              <strong className="text-sm font-mono text-slate-700 block mt-0.5">
                {profile.studentId || 'Chưa điền SBD (tùy chọn)'}
              </strong>
            </div>
          </div>

          {justSaved && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-white px-3 py-1.5 rounded-lg shadow-2xs border border-emerald-300 shrink-0 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Đã lưu thành công!</span>
            </div>
          )}
        </div>
      ) : (
        /* Direct Self-Entry form: both name and class are freely typed text inputs */
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {validationError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {validationError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Input 1: Student Name (Tự nhập) */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Họ và tên học sinh: <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder="Nhập họ và tên (ví dụ: Nguyễn Văn An)..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Học sinh tự gõ họ và tên của mình
              </span>
            </div>

            {/* Input 2: Student Class (Tự nhập) */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Lớp học: <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={studentClass}
                onChange={(e) => {
                  setStudentClass(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="Tự nhập lớp (ví dụ: Ôn THPT, 12A1)..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400"
              />
              {/* Quick suggestions chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className="text-[10px] text-slate-400">Gợi ý nhanh:</span>
                {POPULAR_CLASSES.map((cls) => (
                  <button
                    type="button"
                    key={cls}
                    onClick={() => {
                      setStudentClass(cls);
                      if (validationError) setValidationError('');
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors border ${
                      studentClass === cls
                        ? 'bg-emerald-700 text-white border-emerald-700 font-bold'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 3: Student ID (SBD - Tùy chọn) */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Số báo danh (SBD) / Mã HS: <span className="text-slate-400 font-normal">(tùy chọn)</span>
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Ví dụ: 120045"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900 font-medium font-mono placeholder:text-slate-400"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Dùng để tra cứu bảng điểm nhanh
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[11px] text-emerald-800 font-medium">
              ✓ Thông tin sẽ được lưu trên máy của em và tự động điền khi vào làm bất kỳ bài thi nào.
            </span>

            <div className="flex items-center gap-2">
              {profile.name && (
                <button
                  type="button"
                  onClick={() => {
                    setName(profile.name);
                    setStudentClass(profile.studentClass);
                    setStudentId(profile.studentId || '');
                    setIsEditing(false);
                    setValidationError('');
                  }}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-xs font-medium"
                >
                  Hủy bỏ
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-2xs text-xs active:scale-95"
              >
                Lưu Thẻ Thí Sinh
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
