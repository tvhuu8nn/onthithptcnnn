import React, { useMemo } from 'react';
import { TrueFalseQuestion } from '../types/exam';
import { BookOpen } from 'lucide-react';
import { DocumentTable } from './DocumentTable';
import { DocumentChart } from './DocumentChart';
import { extractTableAndCitationFromBlock } from '../data/provincialAndOfficialExams';

interface TrueFalseScenarioDisplayProps {
  question: TrueFalseQuestion;
  isPrintMode?: boolean;
}

export const TrueFalseScenarioDisplay: React.FC<TrueFalseScenarioDisplayProps> = ({
  question,
  isPrintMode = false,
}) => {
  const {
    scenarioTitle,
    scenario,
    citation,
    tableData,
    extraTables,
    chartData,
    extraCharts,
    imageUrl,
    images,
  } = question;
  const imageList = images && images.length > 0 ? images : imageUrl ? [imageUrl] : [];

  // Tự động nhận diện và cố định lại toàn bộ bảng biểu nếu tài liệu cũ lưu bảng ở dạng văn bản thô trong scenario
  const resolvedContent = useMemo(() => {
    if (tableData) {
      return {
        text: scenario,
        tables: [tableData, ...(extraTables || [])],
        citationText: citation,
      };
    }
    if (scenario && (scenario.includes('\t') || scenario.includes('|') || /\s{2,}/.test(scenario))) {
      const extracted = extractTableAndCitationFromBlock(scenario);
      if (extracted.tableData) {
        return {
          text: extracted.cleanedText,
          tables: [extracted.tableData, ...(extracted.extraTables || []), ...(extraTables || [])],
          citationText: citation || extracted.citation,
        };
      }
    }
    return {
      text: scenario,
      tables: extraTables ? [...extraTables] : [],
      citationText: citation,
    };
  }, [scenario, tableData, extraTables, citation]);

  const allCharts = [
    ...(chartData ? [chartData] : []),
    ...(extraCharts || []),
  ];

  return (
    <div
      className={`rounded-xl border transition-all ${
        isPrintMode
          ? 'bg-slate-50/80 border-slate-300 p-3 mb-3 text-xs'
          : 'bg-slate-50/90 border-slate-200/90 p-4 sm:p-5 mb-5 space-y-4'
      }`}
    >
      {/* Title */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 pb-2">
        <h4
          className={`font-bold text-emerald-900 tracking-wide uppercase ${
            isPrintMode ? 'text-xs' : 'text-xs sm:text-sm'
          }`}
        >
          {scenarioTitle}
        </h4>
        {resolvedContent.citationText && (
          <span
            className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-100/80 text-emerald-800 ${
              isPrintMode ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5'
            }`}
          >
            <BookOpen className="w-3 h-3 text-emerald-700 shrink-0" />
            <span>Dữ liệu thực nghiệm KH</span>
          </span>
        )}
      </div>

      {/* Scenario text */}
      {resolvedContent.text && (
        <p
          className={`text-slate-800 leading-relaxed font-normal whitespace-pre-line ${
            isPrintMode ? 'text-xs' : 'text-sm'
          }`}
        >
          {resolvedContent.text}
        </p>
      )}

      {/* Render Embedded Images if present */}
      {imageList.length > 0 && (
        <div className={`grid gap-3 ${imageList.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {imageList.map((src, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-200 bg-white p-2 flex justify-center overflow-hidden"
            >
              <img
                src={src}
                alt={`Hình minh họa ${scenarioTitle} (${idx + 1})`}
                className={`object-contain rounded ${isPrintMode ? 'max-h-56' : 'max-h-80 w-auto'}`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Render ALL Data Tables if present */}
      {resolvedContent.tables.map((tbl, tIdx) => (
        <DocumentTable
          key={tIdx}
          tableData={tbl}
          compact={isPrintMode}
          className={isPrintMode ? 'my-2' : 'my-3 shadow-2xs'}
        />
      ))}

      {/* Render ALL Charts if present */}
      {allCharts.map((ch, cIdx) => (
        <DocumentChart
          key={cIdx}
          chartData={ch}
          compact={isPrintMode}
          className={isPrintMode ? 'my-2' : 'my-3 shadow-2xs'}
        />
      ))}

      {/* Scholarly Citation Box */}
      {resolvedContent.citationText && (
        <div
          className={`flex items-start gap-2.5 rounded-lg border ${
            isPrintMode
              ? 'bg-slate-100/70 border-slate-300 p-2 text-[11px]'
              : 'bg-amber-50/50 border-amber-200/70 p-2.5 sm:p-3 text-xs'
          }`}
        >
          <BookOpen
            className={`w-4 h-4 shrink-0 mt-0.5 ${
              isPrintMode ? 'text-slate-600' : 'text-amber-800'
            }`}
          />
          <div className="leading-relaxed">
            <span
              className={`font-bold mr-1.5 ${
                isPrintMode ? 'text-slate-800' : 'text-amber-900'
              }`}
            >
              Nguồn nghiên cứu trích dẫn:
            </span>
            <span
              className={`italic ${
                isPrintMode ? 'text-slate-700' : 'text-slate-700'
              }`}
            >
              {resolvedContent.citationText}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
