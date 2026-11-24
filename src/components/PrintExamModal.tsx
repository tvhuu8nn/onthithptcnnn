import React, { useState } from 'react';
import { Exam } from '../types/exam';
import { Printer, X, Download, CheckCircle2 } from 'lucide-react';
import { TrueFalseScenarioDisplay } from './TrueFalseScenarioDisplay';
import { downloadExamAsWord } from '../utils/examDownloader';
import { DocumentTable } from './DocumentTable';
import { DocumentChart } from './DocumentChart';
import { extractTableAndCitationFromBlock } from '../data/provincialAndOfficialExams';

interface PrintExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam;
  studentProfile?: {
    name: string;
    studentClass: string;
    studentId?: string;
  };
}

export const PrintExamModal: React.FC<PrintExamModalProps> = ({
  isOpen,
  onClose,
  exam,
  studentProfile,
}) => {
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    downloadExamAsWord(exam, {
      includeAnswers,
      studentName: studentProfile?.name,
      studentClass: studentProfile?.studentClass,
      studentId: studentProfile?.studentId,
    });
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Tải Đề Thi Về Máy & In Ấn (Mã Đề {exam.code})
              </h2>
              <p className="text-xs text-slate-500">
                Hỗ trợ tải file Microsoft Word (.docx) và In trực tiếp / Xuất file PDF chuẩn Bộ GD&ĐT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-5 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 select-none">
            <input
              type="checkbox"
              checked={includeAnswers}
              onChange={(e) => setIncludeAnswers(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            />
            <span>Bao gồm đáp án và lời giải chi tiết (Dành cho Giáo viên chấm thi)</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadWord}
              className="px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs active:scale-95 cursor-pointer text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300"
              title="Tải file Word .docx về máy tính"
            >
              <Download className="w-4 h-4 text-emerald-800" />
              <span>Tải File Word (.docx)</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm active:scale-95 cursor-pointer text-white bg-emerald-700 hover:bg-emerald-800"
              title="Mở hộp thoại in hoặc Lưu dưới dạng PDF"
            >
              <Printer className="w-4 h-4" />
              <span>In / Lưu PDF</span>
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Đã tải thành công đề thi mã <strong>{exam.code}</strong> về máy! Bạn có thể mở file bằng Microsoft Word, Google Docs hoặc WPS Office.
            </span>
          </div>
        )}

        {/* Printable Paper Preview Box */}
        <div
          id="printable-area"
          className="bg-white border border-slate-300 rounded-lg p-6 sm:p-8 max-h-[55vh] overflow-y-auto text-xs leading-relaxed font-sans space-y-6 shadow-inner"
        >
          {/* Header Paper */}
          <div className="flex justify-between border-b-2 border-slate-800 pb-4 text-center">
            <div className="text-left flex items-center">
              <p className="font-bold uppercase text-sm sm:text-base">ĐỀ THAM KHẢO</p>
            </div>
            <div className="text-right">
              <p className="font-bold">BÀI THI: CÔNG NGHỆ (NÔNG NGHIỆP)</p>
              <p>Thời gian làm bài: {exam.durationMinutes || 50} phút</p>
              <p className="font-mono font-bold">MÃ ĐỀ: {exam.code}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-300 flex flex-wrap justify-between items-center text-xs">
            <div>
              <strong>Họ và tên thí sinh:</strong>{' '}
              <span>{studentProfile?.name || '....................................................................'}</span>
            </div>
            <div>
              <strong>Lớp:</strong>{' '}
              <span>{studentProfile?.studentClass || '..................'}</span>
            </div>
            <div>
              <strong>Số báo danh:</strong>{' '}
              <span>{studentProfile?.studentId || '..................'}</span>
            </div>
          </div>

          <div className="border border-slate-400 p-2 text-center text-xs italic">
            {exam.partII.length > 0 && exam.partI.length > 0
              ? `(Đề thi gồm ${exam.partI.length} câu trắc nghiệm nhiều phương án lựa chọn và ${exam.partII.length} câu trắc nghiệm đúng sai)`
              : exam.partI.length > 0
              ? `(Đề thi gồm ${exam.partI.length} câu trắc nghiệm nhiều phương án lựa chọn)`
              : exam.partII.length > 0
              ? `(Đề thi gồm ${exam.partII.length} câu trắc nghiệm đúng sai)`
              : `(${exam.title})`}
          </div>

          {/* Part I */}
          {exam.partI.length > 0 && (
          <div>
            <h3 className="font-bold uppercase text-slate-900 border-b border-slate-300 pb-1 mb-3">
              PHẦN I. Thí sinh trả lời từ câu 1 đến câu {exam.partI.length}
            </h3>
            <div className="space-y-4">
              {exam.partI.map((q) => {
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
                <div key={q.id} className="space-y-1.5">
                  <p className="font-medium text-slate-900 whitespace-pre-line">
                    <strong>Câu {q.number}.</strong> {displayStem}
                  </p>

                  {qImgs.length > 0 && (
                    <div className="my-2 flex flex-wrap gap-2 justify-center">
                      {qImgs.map((src, idx) => (
                        <img
                          key={idx}
                          src={src}
                          alt={`Hình minh họa Câu ${q.number} (${idx + 1})`}
                          className="max-h-56 w-auto object-contain border border-slate-300 rounded p-1 bg-white"
                        />
                      ))}
                    </div>
                  )}

                  {chartsToRender.map((ch, cIdx) => (
                    <DocumentChart key={cIdx} chartData={ch} compact={true} className="my-2" />
                  ))}

                  {tablesToRender.map((tbl, tIdx) => (
                    <DocumentTable key={tIdx} tableData={tbl} compact={true} className="my-2" />
                  ))}

                  {q.questionFooter && (
                    <p className="font-semibold text-slate-900">{q.questionFooter}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pl-4">
                    <div>
                      A. {q.options.A}{' '}
                      {includeAnswers && q.correctAnswer === 'A' && (
                        <strong className="text-emerald-700">✓ (Đúng)</strong>
                      )}
                    </div>
                    <div>
                      B. {q.options.B}{' '}
                      {includeAnswers && q.correctAnswer === 'B' && (
                        <strong className="text-emerald-700">✓ (Đúng)</strong>
                      )}
                    </div>
                    <div>
                      C. {q.options.C}{' '}
                      {includeAnswers && q.correctAnswer === 'C' && (
                        <strong className="text-emerald-700">✓ (Đúng)</strong>
                      )}
                    </div>
                    <div>
                      D. {q.options.D}{' '}
                      {includeAnswers && q.correctAnswer === 'D' && (
                        <strong className="text-emerald-700">✓ (Đúng)</strong>
                      )}
                    </div>
                  </div>
                  {includeAnswers && (
                    <div className="pl-4 pt-1 text-slate-600 italic">
                      * Dẫn chiếu: {q.textbookRef} - {q.explanation}
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
          )}

          {/* Part II */}
          {exam.partII.length > 0 && (
          <div>
            <h3 className="font-bold uppercase text-slate-900 border-b border-slate-300 pb-1 mb-3">
              PHẦN II. Thí sinh trả lời từ câu 1 đến câu {exam.partII.length} (Trong mỗi ý a, b, c, d ở mỗi câu, chọn Đúng hoặc Sai)
            </h3>
            <div className="space-y-6">
              {exam.partII.map((tfQ) => (
                <div key={tfQ.id} className="space-y-2 border-b border-slate-200 pb-4">
                  <p className="font-bold text-slate-900 text-sm">
                    Câu {tfQ.number} (Phần II - 1,0 điểm):
                  </p>
                  <TrueFalseScenarioDisplay question={tfQ} isPrintMode={true} />
                  <div className="space-y-1.5 pl-3">
                    {tfQ.statements.map((stmt) => (
                      <div key={stmt.subId} className="flex justify-between items-start gap-4">
                        <div>
                          <strong>{stmt.subId})</strong> [{stmt.level}]: {stmt.text}
                          {includeAnswers && (
                            <p className="text-slate-500 italic text-[11px] pl-4">
                              Giải thích: {stmt.explanation}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 font-mono">
                          {includeAnswers ? (
                            <strong
                              className={
                                stmt.isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'
                              }
                            >
                              [{stmt.isCorrect ? 'ĐÚNG' : 'SAI'}]
                            </strong>
                          ) : (
                            <span className="text-slate-400">[ Đ / S ]</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Part III */}
          {exam.partIII && exam.partIII.length > 0 && (
          <div>
            <h3 className="font-bold uppercase text-slate-900 border-b border-slate-300 pb-1 mb-3">
              PHẦN III. Câu hỏi trả lời ngắn / Tự luận ({exam.partIII.length} câu)
            </h3>
            <div className="space-y-4">
              {exam.partIII.map((saQ) => (
                <div key={saQ.id} className="space-y-1.5 border-b border-slate-200 pb-3">
                  <p className="font-bold text-slate-900 text-sm whitespace-pre-line">
                    Câu {saQ.originalNumber || saQ.number}: {saQ.question}
                  </p>
                  {includeAnswers && (saQ.expectedAnswer || saQ.explanation) && (
                    <div className="pl-4 text-xs text-emerald-800 space-y-0.5">
                      {saQ.expectedAnswer && (
                        <p>
                          <strong>Đáp án:</strong> {saQ.expectedAnswer}
                        </p>
                      )}
                      {saQ.explanation && (
                        <p className="text-slate-600 italic whitespace-pre-line">
                          Giải thích: {saQ.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Footer Paper */}
          <div className="text-center border-t border-slate-300 pt-3 text-slate-500 italic">
            ---------- HẾT ----------
          </div>
        </div>
      </div>
    </div>
  );
};
