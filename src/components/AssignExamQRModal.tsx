import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Exam } from '../types/exam';
import {
  ALL_BUILTIN_EXAMS,
  ExamAssignmentConfig,
  generateStudentExamUrl,
  getSavedAssignmentConfig,
  prepareExamForStudent,
  renderBrandedQrCardCanvas,
  resolveVerifiedShareOrigin,
  syncAssignmentToServer,
} from '../utils/qrExamShare';
import {
  QrCode,
  X,
  Download,
  Copy,
  Check,
  Clock,
  Users,
  Sparkles,
  Play,
  Eye,
  EyeOff,
  CheckCircle2,
  Shuffle,
  FileText,
} from 'lucide-react';

import { AuthUser } from '../types/auth';

interface AssignExamQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam;
  availableExams?: Exam[];
  currentUser?: AuthUser | null;
  onStartDirect?: (
    exam: Exam,
    config: {
      className?: string;
      durationMinutes: number;
      teacherNote?: string;
      shuffleQuestions?: boolean;
      teacherUsername?: string;
      teacherName?: string;
    }
  ) => void;
}

const QUICK_CLASSES = ['Ôn THPT', '12A1', '12A2', '12A3', '11A1', '10A1'];
const QUICK_DURATIONS = [15, 30, 45, 50, 60];

export const AssignExamQRModal: React.FC<AssignExamQRModalProps> = ({
  isOpen,
  onClose,
  exam: initialExam,
  availableExams,
  currentUser,
  onStartDirect,
}) => {
  const [selectedExam, setSelectedExam] = useState<Exam>(initialExam);
  const [className, setClassName] = useState<string>('Ôn THPT');
  const [durationMinutes, setDurationMinutes] = useState<number>(
    initialExam.durationMinutes || 50
  );
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(false);
  const [showSolutionsAfterSubmit, setShowSolutionsAfterSubmit] =
    useState<boolean>(true);
  const [teacherNote, setTeacherNote] = useState<string>(
    'Yêu cầu các em làm bài nghiêm túc, không sử dụng tài liệu.'
  );

  const [verifiedOrigin, setVerifiedOrigin] = useState<string>(
    typeof window !== 'undefined' ? window.location.origin : ''
  );
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [copiedQrImage, setCopiedQrImage] = useState<boolean>(false);
  const [downloadedQrImage, setDownloadedQrImage] = useState<boolean>(false);
  const [showContentPreview, setShowContentPreview] = useState<boolean>(true);

  const qrSvgContainerRef = useRef<HTMLDivElement>(null);

  // Danh sách toàn bộ đề thi có thể chọn (đảm bảo luôn chứa initialExam nếu là đề ngẫu nhiên vừa tạo)
  const allExamsList = React.useMemo(() => {
    const base = availableExams && availableExams.length > 0 ? [...availableExams] : [...ALL_BUILTIN_EXAMS];
    if (!base.some((e) => e.id === initialExam.id)) {
      base.unshift(initialExam);
    }
    ALL_BUILTIN_EXAMS.forEach((builtin) => {
      if (!base.some((e) => e.id === builtin.id)) {
        base.push(builtin);
      }
    });
    return base;
  }, [availableExams, initialExam]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedExam(initialExam);
    const saved = getSavedAssignmentConfig(initialExam);
    setClassName(saved.className || 'Ôn THPT');
    setDurationMinutes(saved.durationMinutes || initialExam.durationMinutes || 50);
    setShuffleQuestions(Boolean(saved.shuffleQuestions));
    setShowSolutionsAfterSubmit(saved.showSolutionsAfterSubmit !== false);
    setTeacherNote(
      saved.teacherNote ||
        'Yêu cầu các em làm bài nghiêm túc, không sử dụng tài liệu.'
    );

    resolveVerifiedShareOrigin().then((res) => {
      if (res.origin) {
        setVerifiedOrigin(res.origin);
      }
    });
  }, [isOpen, initialExam]);

  const currentConfig: ExamAssignmentConfig = {
    examId: selectedExam.id,
    examCode: selectedExam.code,
    className: className.trim() || 'Ôn THPT',
    durationMinutes: durationMinutes || selectedExam.durationMinutes || 50,
    shuffleQuestions,
    showSolutionsAfterSubmit,
    teacherNote: teacherNote.trim(),
    teacherUsername: currentUser?.username || undefined,
    teacherName: currentUser?.fullName || currentUser?.username || undefined,
  };

  // Đề thi thực tế mà học sinh sẽ nhận được khi quét mã QR (đã áp dụng cấu hình đảo câu nếu bật)
  const synchronizedStudentExam = React.useMemo(
    () => prepareExamForStudent(selectedExam, shuffleQuestions),
    [selectedExam, shuffleQuestions]
  );

  // Tự động đồng bộ nội dung đề thi và cấu hình lên máy chủ mỗi khi thay đổi đề hoặc cấu hình
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setIsSyncing(true);
    syncAssignmentToServer(selectedExam, currentConfig)
      .then((ok) => {
        if (!cancelled) {
          setIsSynced(ok);
          setIsSyncing(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsSyncing(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    selectedExam.id,
    selectedExam.code,
    className,
    durationMinutes,
    shuffleQuestions,
    showSolutionsAfterSubmit,
    teacherNote,
    currentUser?.username,
    currentUser?.fullName,
  ]);

  if (!isOpen) return null;

  const qrTargetUrl = generateStudentExamUrl(
    selectedExam,
    currentConfig,
    false,
    true,
    verifiedOrigin
  );

  const handleSelectDifferentExam = (newExamId: string) => {
    const found = allExamsList.find((e) => e.id === newExamId);
    if (!found) return;
    setSelectedExam(found);
    const saved = getSavedAssignmentConfig(found);
    setDurationMinutes(saved.durationMinutes || found.durationMinutes || 50);
  };

  const handleDownloadQrCard = async () => {
    const svgEl = qrSvgContainerRef.current?.querySelector('svg');
    if (!svgEl) return;
    try {
      await syncAssignmentToServer(selectedExam, currentConfig);
      const canvas = await renderBrandedQrCardCanvas(
        svgEl as SVGSVGElement,
        selectedExam,
        currentConfig
      );
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Ma_QR_Giao_De_${selectedExam.code}_Lop_${(
        className || 'THPT'
      ).replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloadedQrImage(true);
      setTimeout(() => setDownloadedQrImage(false), 2500);
    } catch {
      // ignore error
    }
  };

  const handleCopyQrImage = async () => {
    const svgEl = qrSvgContainerRef.current?.querySelector('svg');
    if (!svgEl) return;
    try {
      await syncAssignmentToServer(selectedExam, currentConfig);
      const canvas = await renderBrandedQrCardCanvas(
        svgEl as SVGSVGElement,
        selectedExam,
        currentConfig
      );
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          if (
            navigator.clipboard &&
            typeof (window as any).ClipboardItem !== 'undefined'
          ) {
            const item = new (window as any).ClipboardItem({
              'image/png': blob,
            });
            await navigator.clipboard.write([item]);
            setCopiedQrImage(true);
            setTimeout(() => setCopiedQrImage(false), 2500);
          } else {
            await handleDownloadQrCard();
          }
        } catch {
          await handleDownloadQrCard();
        }
      }, 'image/png');
    } catch {
      // ignore error
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-white/15 border border-white/20 text-amber-300 shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight truncate">
                  Giao Đề Thi Qua Mã QR (Giao 1 Lần · Làm Bài Không Giới Hạn Mọi Lúc)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-400 text-slate-950">
                  Mã đề {selectedExam.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400/20 border border-emerald-300/50 text-emerald-100">
                  ∞ Hiệu lực vĩnh viễn 24/7
                </span>
              </div>
              <p className="text-xs text-emerald-100 truncate mt-0.5">
                Chỉ cần giao bài 1 lần qua mã QR: Học sinh có thể làm bài và thi lại không giới hạn số lượt vào bất cứ thời gian nào ({synchronizedStudentExam.partI.length} câu Phần I
                {synchronizedStudentExam.partII.length > 0
                  ? ` + ${synchronizedStudentExam.partII.length} câu Đúng/Sai Phần II`
                  : ''}
                ).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            title="Đóng cửa sổ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[82vh] overflow-y-auto">
          {/* Left Column: QR Code Display & Actions */}
          <div className="lg:col-span-5 flex flex-col items-center justify-between bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="w-full text-center space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>
                  {isSyncing
                    ? 'Đang đồng bộ nội dung đề...'
                    : isSynced
                    ? 'Đã đồng bộ nội dung đề với Mã QR'
                    : 'Sẵn sàng quét Mã QR'}
                </span>
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2 pt-1">
                {selectedExam.title}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Mã đề: <strong className="font-mono text-emerald-800">{selectedExam.code}</strong> · Lớp:{' '}
                <strong>{className || 'Toàn khối'}</strong> · Thời gian:{' '}
                <strong>{durationMinutes} phút</strong>
              </p>
            </div>

            {/* QR SVG Box */}
            <div
              ref={qrSvgContainerRef}
              className="bg-white p-4 rounded-2xl border-2 border-emerald-500 shadow-md flex flex-col items-center justify-center"
            >
              <QRCodeSVG
                value={qrTargetUrl}
                size={220}
                level="M"
                marginSize={2}
                bgColor="#ffffff"
                fgColor="#064e3b"
              />
              <div className="mt-2.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-mono font-bold text-emerald-900 text-center">
                MÃ ĐỀ: {selectedExam.code} • {durationMinutes} PHÚT • KHÔNG GIỚI HẠN LƯỢT &amp; THỜI GIAN
              </div>
            </div>

            {/* Action Buttons for QR Image */}
            <div className="w-full space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadQrCard}
                  className="px-3 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  {downloadedQrImage ? (
                    <>
                      <Check className="w-4 h-4 text-amber-300" />
                      <span>Đã tải ảnh QR</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Tải Ảnh Thẻ QR</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyQrImage}
                  className="px-3 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                >
                  {copiedQrImage ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>Đã chép ảnh QR</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-emerald-700" />
                      <span>Chép Ảnh QR</span>
                    </>
                  )}
                </button>
              </div>

              {onStartDirect && (
                <button
                  type="button"
                  onClick={() => {
                    syncAssignmentToServer(selectedExam, currentConfig);
                    onStartDirect(synchronizedStudentExam, {
                      className: currentConfig.className,
                      durationMinutes: currentConfig.durationMinutes,
                      teacherNote: currentConfig.teacherNote,
                      shuffleQuestions: currentConfig.shuffleQuestions,
                      teacherUsername: currentConfig.teacherUsername,
                      teacherName: currentConfig.teacherName,
                    });
                    onClose();
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Vào Làm Thử Đúng Đề Của Mã QR Này (Mã {selectedExam.code})</span>
                </button>
              )}

              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-[11px] text-sky-950 text-left space-y-0.5">
                <div className="font-extrabold text-sky-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                  <span>Giao bài 1 lần — Học sinh làm bài không giới hạn mọi lúc (24/7):</span>
                </div>
                <div className="pl-5 text-sky-800">
                  Giáo viên chỉ cần gửi mã QR này <strong>1 lần duy nhất</strong>. Mã QR không bao giờ hết hạn và tự động lưu đề trên thiết bị của học sinh để các em có thể vào làm bài, ôn luyện lại <strong>không giới hạn số lượt vào bất cứ thời gian nào</strong>.
                </div>
              </div>

              {currentUser && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 text-left space-y-0.5">
                  <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Đồng bộ về Bảng Điểm tài khoản:</span>
                  </div>
                  <div className="pl-5 text-emerald-800">
                    <strong>{currentUser.fullName}</strong> (
                    <span className="font-mono font-bold">@{currentUser.username}</span>) — Mọi lượt nộp bài của học sinh qua mã QR này vào bất cứ thời điểm nào đều tự động gửi điểm &amp; chi tiết bài làm về Bảng Điểm của tài khoản này.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Configuration & Synchronized Exam Content Preview */}
          <div className="lg:col-span-7 space-y-4">
            {/* Select Exam Dropdown */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                1. Đề thi đang đồng bộ với Mã QR:
              </label>
              <select
                value={selectedExam.id}
                onChange={(e) => handleSelectDifferentExam(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                {allExamsList.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    [Mã đề {ex.code}] {ex.title} ({ex.partI.length} câu TN
                    {ex.partII.length > 0 ? ` + ${ex.partII.length} câu Đ/S` : ''})
                  </option>
                ))}
              </select>
            </div>

            {/* Class & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Users className="w-3.5 h-3.5 text-emerald-700" />
                  <span>2. Lớp nhận đề:</span>
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="VD: 12A1, Ôn THPT..."
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <div className="flex flex-wrap gap-1">
                  {QUICK_CLASSES.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setClassName(cls)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer border ${
                        className === cls
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>3. Thời gian làm bài (phút):</span>
                </label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) =>
                    setDurationMinutes(Math.max(5, parseInt(e.target.value, 10) || 50))
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <div className="flex flex-wrap gap-1">
                  {QUICK_DURATIONS.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer border ${
                        durationMinutes === mins
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {mins}p
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Teacher Note & Shuffle Toggle */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800">
                  4. Lời dặn của Giáo viên &amp; Tùy chọn câu hỏi:
                </label>
                <button
                  type="button"
                  onClick={() => setShuffleQuestions((prev) => !prev)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer border transition-colors ${
                    shuffleQuestions
                      ? 'bg-amber-100 text-amber-950 border-amber-300'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Shuffle className="w-3 h-3" />
                  <span>
                    {shuffleQuestions
                      ? 'Đang bật đảo thứ tự câu hỏi'
                      : 'Giữ nguyên thứ tự câu 1 → ' + selectedExam.partI.length}
                  </span>
                </button>
              </div>
              <input
                type="text"
                value={teacherNote}
                onChange={(e) => setTeacherNote(e.target.value)}
                placeholder="Nhập lời dặn hiển thị cho học sinh khi quét QR..."
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Synchronized Exam Content Preview */}
            <div className="bg-emerald-50/60 rounded-xl border border-emerald-200 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-950">
                  <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Nội dung đề đồng bộ trong Mã QR ({synchronizedStudentExam.partI.length} câu TN
                    {synchronizedStudentExam.partII.length > 0
                      ? ` + ${synchronizedStudentExam.partII.length} câu Đ/S`
                      : ''}
                    )
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowContentPreview((prev) => !prev)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100/70 text-emerald-900 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  {showContentPreview ? (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span>Thu gọn</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>Xem câu hỏi</span>
                    </>
                  )}
                </button>
              </div>

              {showContentPreview && (
                <div className="max-h-48 overflow-y-auto bg-white rounded-lg border border-emerald-100 p-2.5 space-y-2 text-xs">
                  <div className="font-bold text-emerald-900 text-[11px] uppercase tracking-wider">
                    Phần I — Trắc nghiệm ({synchronizedStudentExam.partI.length} câu):
                  </div>
                  {synchronizedStudentExam.partI.map((q) => (
                    <div
                      key={q.id}
                      className="text-slate-700 border-b border-slate-100 pb-1.5 last:border-b-0"
                    >
                      <strong className="text-slate-900">Câu {q.number}:</strong>{' '}
                      {q.question}
                    </div>
                  ))}

                  {synchronizedStudentExam.partII.length > 0 && (
                    <>
                      <div className="font-bold text-amber-900 text-[11px] uppercase tracking-wider pt-2">
                        Phần II — Đúng/Sai ({synchronizedStudentExam.partII.length} câu tình huống):
                      </div>
                      {synchronizedStudentExam.partII.map((tf) => (
                        <div
                          key={tf.id}
                          className="text-slate-700 border-b border-slate-100 pb-1.5 last:border-b-0"
                        >
                          <strong className="text-slate-900">
                            Câu {tf.number} ({tf.scenarioTitle || 'Tình huống'}):
                          </strong>{' '}
                          <span className="line-clamp-2">{tf.scenario}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Mọi thay đổi về Mã đề, Thời gian, Lớp và Thứ tự câu hỏi được cập nhật trực tiếp vào Mã QR.
            </span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
