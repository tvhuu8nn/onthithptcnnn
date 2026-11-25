import React, { useState, useEffect } from 'react';
import {
  INITIAL_FREQUENT_MISTAKES,
  QuestionErrorStat,
  getStoredStudentsForQuestion,
  syncMistakesFromServer,
  StudentMistakeEntry,
} from '../data/mistakesAnalytics';
import {
  AlertTriangle,
  TrendingDown,
  BookOpen,
  Sparkles,
  CheckCircle,
  XCircle,
  HelpCircle,
  Printer,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldAlert,
  Flame,
  Users,
  Search,
  User,
  X,
  Lock,
} from 'lucide-react';
import { explainQuestionWithAI } from '../services/aiService';
import { subscribeRealtimeEvent } from '../services/realtimeSyncService';
import { AuthUser } from '../types/auth';

interface MistakeAnalyticsViewProps {
  currentUser?: AuthUser | null;
  onOpenLogin?: (reason?: string) => void;
}

export const MistakeAnalyticsView: React.FC<MistakeAnalyticsViewProps> = ({
  currentUser,
  onOpenLogin,
}) => {
  const [mistakes] = useState<QuestionErrorStat[]>(INITIAL_FREQUENT_MISTAKES);
  const [selectedDomain, setSelectedDomain] = useState<'all' | 'crop' | 'husbandry' | 'forestry' | 'aquaculture'>('all');
  const [minRateFilter, setMinRateFilter] = useState<number>(0);
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);
  const [, setSyncTick] = useState(0);

  useEffect(() => {
    syncMistakesFromServer().then(() => setSyncTick((t) => t + 1));
    const unsubMistakes = subscribeRealtimeEvent('mistakes_updated', () => {
      syncMistakesFromServer().then(() => setSyncTick((t) => t + 1));
    });
    const unsubAll = subscribeRealtimeEvent('sync_all_updated', () => {
      syncMistakesFromServer().then(() => setSyncTick((t) => t + 1));
    });
    return () => {
      unsubMistakes();
      unsubAll();
    };
  }, []);

  // Lấy toàn bộ danh sách học sinh làm sai của một câu (kết hợp dữ liệu chuẩn và bài nộp thực tế)
  const getQuestionStudents = (item: QuestionErrorStat): StudentMistakeEntry[] => {
    const dynamicList = getStoredStudentsForQuestion(item.id);
    const initialList = item.recentStudentsMistakes || [];
    const merged = [
      ...dynamicList,
      ...initialList.filter((init) => !dynamicList.some((dyn) => dyn.studentName === init.studentName && dyn.examCode === init.examCode)),
    ];
    return merged;
  };

  const filteredMistakes = mistakes.filter((item) => {
    const matchesDomain = selectedDomain === 'all' || item.domain === selectedDomain;
    const matchesRate = item.failRatePercent >= minRateFilter;

    if (!matchesDomain || !matchesRate) return false;

    if (studentSearch.trim() !== '') {
      const q = studentSearch.toLowerCase().trim();
      const students = getQuestionStudents(item);
      const studentMatch = students.some(
        (s) => s.studentName.toLowerCase().includes(q) || s.studentClass.toLowerCase().includes(q)
      );
      const titleMatch = item.title.toLowerCase().includes(q);
      return studentMatch || titleMatch;
    }

    return true;
  });

  const handleAskAI = async (item: QuestionErrorStat) => {
    if (!currentUser) {
      onOpenLogin?.('Vui lòng đăng nhập tài khoản để sử dụng tính năng giải thích bẫy đề thi cùng AI!');
      return;
    }
    setLoadingAiId(item.id);
    try {
      const expl = await explainQuestionWithAI({
        questionTitle: item.title,
        domain: `Công nghệ ${item.grade} - ${item.domain}`,
        contextScenario: item.scenario,
        optionsOrStatements: `Bẫy thường gặp: ${item.commonTrap}\nChi tiết các lỗi học sinh chọn: ${item.wrongChoicesBreakdown.map((w) => `${w.label} (${w.percent}%)`).join('; ')}`,
        correctAnswer: item.correctAnswer,
      });
      setAiExplanations((prev) => ({ ...prev, [item.id]: expl }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAiId(null);
    }
  };

  const handlePrint = () => {
    if (!currentUser) {
      onOpenLogin?.('Vui lòng đăng nhập tài khoản để in danh sách câu hay sai!');
      return;
    }
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Alert Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase tracking-wide mb-1">
            <Flame className="w-4 h-4 text-rose-600" />
            <span>Phân Tích Bẫy Đề Thi & Danh Sách Học Sinh Làm Sai</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Thống Kê Câu Hỏi & Danh Sách Học Sinh Chọn Sai
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Tự động cập nhật tên và lớp của từng học sinh chọn sai ở mỗi câu hỏi thi thử tốt nghiệp THPT, giúp giáo viên nắm bắt lỗ hổng kiến thức chính xác theo từng cá nhân.
          </p>
          {!currentUser && (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <Lock className="w-3 h-3 text-amber-700" />
                <span>Chế độ chỉ xem (Đăng nhập để in và hỏi trợ lý AI)</span>
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs self-start cursor-pointer"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>In danh sách câu hay sai</span>
        </button>
      </div>

      {/* Top Warning KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-rose-600 font-semibold mb-2">
            <span>Tỉ Lệ Sai Cao Nhất</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-rose-700 tabular-nums">74%</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Câu hỏi về nguyên lý C:N trong công nghệ Biofloc ao tôm
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-amber-700 font-semibold mb-2">
            <span>Chuyên Đề Sai Nhiều Nhất</span>
            <TrendingDown className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">Thủy Sản 12 (42%)</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Bẫy dùng kháng sinh trị virus & tính hệ số FCR
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold mb-2">
            <span>Chuyên Đề Lâm Nghiệp 12</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">Băng Cản Lửa & Rạch Bầu</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Lỗi sai kỹ thuật làm đất dốc & cấp cháy rừng V
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-2">
            <span>Mức Độ Tư Duy Hay Mất Điểm</span>
            <ShieldAlert className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">Vận Dụng (VD) 65%</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Tình huống thực tế đòi hỏi liên hệ kỹ thuật sản xuất
          </p>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-medium mr-1">Lĩnh vực:</span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'aquaculture', label: 'Thủy sản 12' },
            { id: 'forestry', label: 'Lâm nghiệp 12' },
            { id: 'crop', label: 'Trồng trọt 10' },
            { id: 'husbandry', label: 'Chăn nuôi 11' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedDomain(item.id as any)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors border ${
                selectedDomain === item.id
                  ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search by student name */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Tìm theo tên học sinh làm sai (ví dụ: Bảo, Yến, Khang...)"
              className="pl-8 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-600 w-64"
            />
            {studentSearch && (
              <button
                onClick={() => setStudentSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Ngưỡng tỉ lệ sai:</span>
            <select
              value={minRateFilter}
              onChange={(e) => setMinRateFilter(parseInt(e.target.value, 10))}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-600 cursor-pointer"
            >
              <option value={0}>Tất cả mức độ sai</option>
              <option value={50}>Tỉ lệ sai ≥ 50% (Rất cao)</option>
              <option value={60}>Tỉ lệ sai ≥ 60% (Nguy hiểm)</option>
              <option value={70}>Tỉ lệ sai ≥ 70% (Báo động đỏ)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mistakes List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Hiển thị {filteredMistakes.length} câu hỏi có tỉ lệ học sinh chọn sai nhiều nhất</span>
          {studentSearch && (
            <span className="text-rose-700 font-semibold">
              Đang lọc theo học sinh: "{studentSearch}"
            </span>
          )}
        </div>

        {filteredMistakes.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            Không tìm thấy câu hỏi sai nào khớp với bộ lọc hoặc tên học sinh "{studentSearch}".
          </div>
        ) : (
          filteredMistakes.map((item, idx) => {
            const aiExpl = aiExplanations[item.id];
            const isLoadingAi = loadingAiId === item.id;
            const isRedAlert = item.failRatePercent >= 65;
            const studentsList = getQuestionStudents(item);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-6 space-y-5 transition-all shadow-2xs hover:shadow-xs ${
                  isRedAlert ? 'border-rose-300 ring-1 ring-rose-100' : 'border-slate-200'
                }`}
              >
                {/* Header with Fail Rate Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                    <span className="font-bold text-slate-900 text-sm"># {idx + 1}.</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-800">
                      Lớp {item.grade} · {item.domain === 'crop' ? 'Trồng trọt' : item.domain === 'husbandry' ? 'Chăn nuôi' : item.domain === 'forestry' ? 'Lâm nghiệp' : 'Thủy sản'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Mức độ: {item.level === 'NB' ? 'Nhận biết' : item.level === 'TH' ? 'Thông hiểu' : 'Vận dụng'}</span>
                    <span aria-hidden="true">·</span>
                    <span>Dạng: {item.type === 'mcq' ? 'Trắc nghiệm đơn' : 'Đúng/Sai tình huống'}</span>
                  </div>

                  {/* Error Rate Gauge */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Tỉ lệ thí sinh sai</span>
                      <strong className={`text-base font-extrabold tabular-nums ${isRedAlert ? 'text-rose-700' : 'text-amber-700'}`}>
                        {item.failRatePercent}%
                      </strong>
                    </div>
                    <div className="w-20 bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full ${isRedAlert ? 'bg-rose-600' : 'bg-amber-600'}`}
                        style={{ width: `${item.failRatePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Question Title & Scenario */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                  {item.scenario && (
                    <p className="mt-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 italic leading-relaxed">
                      "{item.scenario}"
                    </p>
                  )}
                </div>

                {/* The Trap (Bẫy đề thi) */}
                <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-rose-800 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Vì sao học sinh hay bị lừa ở câu này?</span>
                  </div>
                  <p className="text-rose-950 leading-relaxed font-normal">
                    {item.commonTrap}
                  </p>
                </div>

                {/* Breakdown of wrong answers chosen by students */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Thống Kê Các Phương Án / Mệnh Đề Học Sinh Bị Chọn Sai:
                  </h4>
                  <div className="space-y-2">
                    {item.wrongChoicesBreakdown.map((wb, wIdx) => (
                      <div
                        key={wIdx}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-rose-900">
                          <span className="flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>{wb.label}</span>
                          </span>
                          <span className="font-mono text-rose-700 tabular-nums">
                            {wb.percent}% thí sinh chọn
                          </span>
                        </div>
                        <p className="text-slate-600 pl-5 leading-relaxed">
                          <strong>Lý do sai:</strong> {wb.explanationWhyWrong}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DANH SÁCH HỌC SINH CỤ THỂ LÀM SAI CÂU NÀY */}
                <div className="p-4 bg-slate-50/90 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <div className="flex items-center gap-1.5 text-rose-800">
                      <Users className="w-4 h-4 text-rose-600" />
                      <span>Danh Sách Học Sinh Làm Sai Câu Này ({studentsList.length} HS):</span>
                    </div>
                    <span className="text-[11px] font-normal text-slate-500">
                      Cập nhật tự động từ kết quả nộp bài của học sinh
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {studentsList.map((st, sIdx) => (
                      <div
                        key={sIdx}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-slate-800 text-xs shadow-2xs"
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
                        <strong className="text-slate-900 font-bold">{st.studentName}</strong>
                        <span className="text-slate-500 font-medium">({st.studentClass} · Mã {st.examCode})</span>
                        <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          ✗ Chọn: {st.chosenAnswer}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{st.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Correct Answer & Explanation */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Đáp án chuẩn xác theo SGK Kết Nối Tri Thức:</span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800">
                      {item.textbookRef}
                    </span>
                  </div>
                  <p className="text-emerald-950 font-semibold leading-relaxed">
                    {item.correctAnswer}
                  </p>
                  <p className="text-slate-700 leading-relaxed pt-1 border-t border-emerald-200/60">
                    {item.explanation}
                  </p>
                </div>

                {/* Ask Gemini AI about this trap */}
                <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => handleAskAI(item)}
                    disabled={isLoadingAi}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 py-1 px-2.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {isLoadingAi
                        ? 'Đang kết nối Gemini AI...'
                        : aiExpl
                        ? 'Xem lại phân tích AI'
                        : 'Hỏi AI giáo viên phân tích sâu bẫy câu này'}
                    </span>
                  </button>

                  <span className="text-[11px] text-slate-400">
                    Khảo sát từ {item.sampleSize.toLocaleString()} lượt làm bài
                  </span>
                </div>

                {aiExpl && (
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                    {aiExpl}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
