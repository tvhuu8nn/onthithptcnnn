import React, { useState } from 'react';
import { THEORY_HANDBOOK } from '../data/theoryHandbook';
import {
  Search,
  BookOpen,
  Lightbulb,
  X,
  Tag,
  Copy,
  Check,
} from 'lucide-react';

interface HandbookViewProps {}

export const HandbookView: React.FC<HandbookViewProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<'all' | '10' | '11' | '12'>('all');
  const [selectedDomain, setSelectedDomain] = useState<'all' | 'crop' | 'husbandry' | 'forestry' | 'aquaculture'>('all');
  const [copiedArticleId, setCopiedArticleId] = useState<string | null>(null);

  const filteredArticles = THEORY_HANDBOOK.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      item.title.toLowerCase().includes(q) ||
      item.chapter.toLowerCase().includes(q) ||
      item.keyPoints.some((p) => p.toLowerCase().includes(q)) ||
      item.tips.toLowerCase().includes(q) ||
      (item.tableData?.rows.some((row) => row.some((cell) => cell.toLowerCase().includes(q))) ?? false);

    const matchesGrade = selectedGrade === 'all' || item.grade === selectedGrade;
    const matchesDomain = selectedDomain === 'all' || item.domain === selectedDomain;

    return matchesSearch && matchesGrade && matchesDomain;
  });

  // Calculate counts for quick badges
  const countGrade10 = THEORY_HANDBOOK.filter((a) => a.grade === '10').length;
  const countGrade11 = THEORY_HANDBOOK.filter((a) => a.grade === '11').length;
  const countGrade12 = THEORY_HANDBOOK.filter((a) => a.grade === '12').length;

  const handleCopyArticle = (article: typeof THEORY_HANDBOOK[0]) => {
    // Build plain text for copying
    const summaryText = [
      `【${article.chapter} - Lớp ${article.grade}】${article.title}`,
      `\n* Kiến thức trọng tâm:`,
      ...article.keyPoints.map((p, i) => `  ${i + 1}. ${p}`),
      `\n* Lưu ý bẫy đề thi tốt nghiệp:\n  ${article.tips}`,
      `\n(Nguồn: Sổ tay kiến thức Công nghệ Nông nghiệp GDPT 2018 - Kết nối tri thức)`,
    ].join('\n');

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopiedArticleId(article.id);
      setTimeout(() => setCopiedArticleId(null), 2500);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Sổ Tay Kiến Thức Trọng Tâm SGK (Kết Nối Tri Thức)
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Hệ thống hóa toàn bộ kiến thức cốt lõi theo 3 bộ sách giáo khoa: Công nghệ 10 Trồng trọt, Công nghệ 11 Chăn nuôi, Công nghệ 12 Lâm nghiệp & Thủy sản.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm kiến thức (ví dụ: Keo đất, Biofloc, RAS, pH, DO, FCR, băng cản lửa, tỉa thưa, mụn xơ dừa, giống vật nuôi...)"
            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Khối lớp:
            </span>
            {[
              { id: 'all', label: `Tất cả (${THEORY_HANDBOOK.length})` },
              { id: '10', label: `Lớp 10 (${countGrade10})` },
              { id: '11', label: `Lớp 11 (${countGrade11})` },
              { id: '12', label: `Lớp 12 (${countGrade12})` },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGrade(g.id as any)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors border cursor-pointer ${
                  selectedGrade === g.id
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {g.label}
              </button>
            ))}

            <span className="text-slate-300 mx-1 hidden sm:inline">|</span>

            <span className="text-slate-500 font-medium mr-1">Lĩnh vực:</span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'crop', label: 'Trồng trọt' },
              { id: 'husbandry', label: 'Chăn nuôi' },
              { id: 'forestry', label: 'Lâm nghiệp' },
              { id: 'aquaculture', label: 'Thủy sản' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d.id as any)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors border cursor-pointer ${
                  selectedDomain === d.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="text-slate-500 text-xs self-start lg:self-center font-medium">
            Hiển thị <span className="font-bold text-emerald-800">{filteredArticles.length}</span> / {THEORY_HANDBOOK.length} chủ đề kiến thức
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="space-y-6">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 space-y-2">
            <p className="text-slate-700 font-medium text-sm">Không tìm thấy chủ đề nào khớp với từ khóa tìm kiếm.</p>
            <p className="text-slate-500 text-xs">Hãy thử tìm các từ khóa ngắn gọn hơn như: Biofloc, RAS, Đất phèn, Giá thể, FCR, Lở mồm long móng...</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGrade('all');
                setSelectedDomain('all');
              }}
              className="mt-3 px-3 py-1.5 text-xs text-emerald-800 bg-emerald-50 rounded-lg hover:bg-emerald-100 font-medium cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs hover:border-slate-300 transition-colors relative"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                    {article.chapter}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                    {article.title}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 self-start sm:self-auto shrink-0">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-semibold border border-emerald-200">
                    Lớp {article.grade}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium border border-slate-200">
                    {article.domain === 'crop'
                      ? 'Trồng trọt'
                      : article.domain === 'husbandry'
                      ? 'Chăn nuôi'
                      : article.domain === 'forestry'
                      ? 'Lâm nghiệp'
                      : 'Thủy sản'}
                  </span>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyArticle(article)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      copiedArticleId === article.id
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95'
                    }`}
                    title="Sao chép tóm tắt bài viết này"
                  >
                    {copiedArticleId === article.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Chép tóm tắt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Key points */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kiến Thức Trọng Tâm Cần Đạt:
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-800 leading-relaxed">
                  {article.keyPoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Table Data (if present) */}
              {article.tableData && (
                <div className="pt-2">
                  <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          {article.tableData.headers.map((h, i) => (
                            <th key={i} className="py-2.5 px-3.5 whitespace-nowrap bg-slate-100/70">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {article.tableData.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/60 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="py-2.5 px-3.5 leading-relaxed align-top">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Exam Tip Callout */}
              <div className="bg-amber-50/80 border border-amber-200/90 rounded-lg p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-amber-900 font-bold">Lưu ý bẫy đề thi tốt nghiệp:</strong> {article.tips}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
