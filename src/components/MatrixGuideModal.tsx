import React from 'react';
import { X, Layers } from 'lucide-react';

interface MatrixGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MatrixGuideModal: React.FC<MatrixGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-xl border border-slate-200 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Ma Trận & Thang Điểm Đề Thi Tốt Nghiệp THPT
              </h2>
              <p className="text-xs text-slate-500">
                Môn Công nghệ (Định hướng Nông nghiệp) · Chương trình GDPT 2018 (SGK Kết nối tri thức)
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

        <div className="space-y-6 text-xs sm:text-sm text-slate-700">
          {/* Section 1: Overview */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-2">1. Quy Chuẩn Đề Thi Chung</h3>
            <ul className="space-y-1.5 list-disc pl-4 text-xs">
              <li>Thời gian làm bài: <strong>50 phút</strong> (chuẩn Bộ GD&ĐT).</li>
              <li>Tổng số câu hỏi: <strong>28 câu</strong> (24 câu trắc nghiệm nhiều lựa chọn + 4 câu trắc nghiệm đúng/sai).</li>
              <li>Tổng điểm toàn bài: <strong>10,0 điểm</strong>.</li>
            </ul>
          </div>

          {/* Section 2: Part I Detailed Breakdown */}
          <div>
            <h3 className="font-bold text-emerald-900 mb-2">
              2. PHẦN I: Câu Trắc Nghiệm Nhiều Phương Án Lựa Chọn (24 câu · 6,0 điểm)
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200 mb-2">
              <table className="w-full text-xs text-left">
                <thead className="bg-emerald-50 text-emerald-950 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Thứ tự câu</th>
                    <th className="p-2.5">Nội dung chương trình</th>
                    <th className="p-2.5">Mức độ nhận thức</th>
                    <th className="p-2.5">Điểm số</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  <tr>
                    <td className="p-2.5 font-bold">Câu 1 - Câu 4</td>
                    <td className="p-2.5">Công nghệ 10 · Công nghệ Trồng trọt (KNTT)</td>
                    <td className="p-2.5 font-semibold text-emerald-700">4 câu Nhận biết</td>
                    <td className="p-2.5 font-mono">1,00 điểm (0,25đ/câu)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Câu 5 - Câu 8</td>
                    <td className="p-2.5">Công nghệ 11 · Công nghệ Chăn nuôi (KNTT)</td>
                    <td className="p-2.5 font-semibold text-emerald-700">4 câu Nhận biết</td>
                    <td className="p-2.5 font-mono">1,00 điểm (0,25đ/câu)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Câu 9 - Câu 24</td>
                    <td className="p-2.5">Công nghệ 12 · Lâm nghiệp và Thủy sản (KNTT)</td>
                    <td className="p-2.5 font-semibold text-sky-700">
                      16 câu: NB, TH, VD (gồm 01 câu VD phân tích biểu đồ &amp; 01 câu VD phân tích số liệu)
                    </td>
                    <td className="p-2.5 font-mono">4,00 điểm (0,25đ/câu)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              *Mỗi câu hỏi thí sinh chỉ chọn một phương án duy nhất (0,25 điểm/câu). Trong 24 câu Phần I có 01 câu vận dụng phân tích biểu đồ (Câu 14) và 01 câu vận dụng phân tích bảng số liệu (Câu 23).
            </p>
          </div>

          {/* Section 3: Part II Detailed Breakdown */}
          <div>
            <h3 className="font-bold text-amber-950 mb-2">
              3. PHẦN II: Câu Trắc Nghiệm Đúng / Sai Tình Huống Thực Tiễn (4 câu · 4,0 điểm)
            </h3>
            <p className="text-xs leading-relaxed mb-2">
              Nội dung 100% thuộc <strong>Công nghệ 12 Lâm nghiệp và Thủy sản</strong>. Mỗi câu có một tình huống cụ thể (case study thực tế tại các vùng nông lâm ngư nghiệp Việt Nam) và 4 mệnh đề a, b, c, d với cấu trúc mức độ chuẩn hóa:
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="block text-slate-500 font-medium">Ý Nhận biết (NB)</span>
                <strong className="text-emerald-800 font-bold">1 ý / câu</strong>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="block text-slate-500 font-medium">Ý Thông hiểu (TH)</span>
                <strong className="text-sky-800 font-bold">1 ý / câu</strong>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="block text-slate-500 font-medium">Ý Vận dụng (VD)</span>
                <strong className="text-amber-800 font-bold">2 ý / câu</strong>
              </div>
            </div>

            <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 text-xs text-amber-950 space-y-1">
              <p className="font-bold">Thang điểm tính lũy tiến cho mỗi câu trắc nghiệm Đúng/Sai:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Thí sinh chọn chính xác <strong>1 ý</strong> trong 1 câu: được <strong>0,1 điểm</strong>.</li>
                <li>Thí sinh chọn chính xác <strong>2 ý</strong> trong 1 câu: được <strong>0,25 điểm</strong>.</li>
                <li>Thí sinh chọn chính xác <strong>3 ý</strong> trong 1 câu: được <strong>0,5 điểm</strong>.</li>
                <li>Thí sinh chọn chính xác cả <strong>4 ý</strong> trong 1 câu: được <strong>1,0 điểm</strong> trọn vẹn.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Đã hiểu ma trận
          </button>
        </div>
      </div>
    </div>
  );
};
