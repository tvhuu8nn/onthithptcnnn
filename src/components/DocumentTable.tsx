import React, { useMemo } from 'react';
import { Table } from 'lucide-react';
import { ExamChartData, ExamTableData } from '../types/exam';
import {
  extractAllTablesAndBlocksFromDocument,
  normalizeExamTableData,
} from '../data/provincialAndOfficialExams';
import { DocumentChart } from './DocumentChart';

interface DocumentTableProps {
  tableData: ExamTableData;
  compact?: boolean;
  className?: string;
}

/**
 * Hiển thị bảng biểu với bố cục cố định (table-fixed + colgroup chuẩn tỉ lệ cột),
 * đầy đủ viền lưới 4 cạnh, hỗ trợ gộp ô (colSpan/rowSpan), tự xuống dòng gọn trong ô
 * và cuộn ngang mượt khi bảng có nhiều cột số liệu.
 */
export const DocumentTable: React.FC<DocumentTableProps> = ({
  tableData,
  compact = false,
  className = '',
}) => {
  const normalized = useMemo(() => normalizeExamTableData(tableData), [tableData]);
  const colWidths = normalized.colWidths || [];
  const alignments = normalized.alignments || [];
  const colCount = Math.max(normalized.headers.length, colWidths.length, 1);

  // Giữ độ rộng tối thiểu hợp lý khi bảng có nhiều cột (>= 5 cột) để cột không bao giờ bị ép dẹp
  const minTableWidthPx = colCount >= 5 ? colCount * (compact ? 92 : 108) : undefined;

  const alignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'right') return 'text-right';
    if (align === 'left') return 'text-left';
    return 'text-center';
  };

  const cellPadClass = compact ? 'py-1.5 px-2' : 'py-2 px-3';
  const textSizeClass = compact ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm';

  const hasStructuredRows =
    Array.isArray(normalized.structuredRows) && normalized.structuredRows.length > 0;

  return (
    <div
      className={`rounded-lg border border-slate-300 bg-white overflow-hidden ${className}`}
    >
      {normalized.caption && (
        <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-300 flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Table className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span className="break-words">{normalized.caption}</span>
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <table
          className={`w-full table-fixed border-collapse ${textSizeClass} text-slate-800`}
          style={minTableWidthPx ? { minWidth: `${minTableWidthPx}px` } : undefined}
        >
          <colgroup>
            {colWidths.map((w, idx) => (
              <col key={idx} style={{ width: `${w}%` }} />
            ))}
          </colgroup>

          {hasStructuredRows ? (
            <tbody>
              {normalized.structuredRows!.map((row, rIdx) => {
                const isHeaderRow = Boolean(row.isHeader) || rIdx === 0;
                return (
                  <tr
                    key={rIdx}
                    className={
                      isHeaderRow
                        ? 'bg-emerald-50/75 font-bold text-slate-900'
                        : rIdx % 2 === 1
                        ? 'bg-white'
                        : 'bg-slate-50/55'
                    }
                  >
                    {row.cells.map((cell, cIdx) => {
                      const isTh = isHeaderRow || Boolean(cell.isHeader);
                      const resolvedAlign =
                        cell.align ||
                        (isTh ? 'center' : alignments[cIdx] || (cIdx === 0 ? 'left' : 'center'));
                      const Tag = isTh ? 'th' : 'td';
                      return (
                        <Tag
                          key={cIdx}
                          colSpan={cell.colSpan && cell.colSpan > 1 ? cell.colSpan : undefined}
                          rowSpan={cell.rowSpan && cell.rowSpan > 1 ? cell.rowSpan : undefined}
                          className={`${cellPadClass} border border-slate-300 align-middle break-words whitespace-pre-line leading-snug ${alignClass(
                            resolvedAlign
                          )} ${
                            isTh
                              ? 'font-bold text-slate-900'
                              : cIdx === 0 && resolvedAlign === 'left'
                              ? 'font-semibold text-slate-900'
                              : 'tabular-nums'
                          }`}
                        >
                          {cell.text}
                        </Tag>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          ) : (
            <>
              <thead>
                <tr className="bg-emerald-50/75 text-slate-900 font-bold">
                  {normalized.headers.map((h, i) => (
                    <th
                      key={i}
                      className={`${cellPadClass} border border-slate-300 align-middle text-center break-words whitespace-pre-line leading-snug font-bold`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {normalized.rows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/55'}
                  >
                    {row.map((cell, cIdx) => {
                      const align = alignments[cIdx] || (cIdx === 0 ? 'left' : 'center');
                      return (
                        <td
                          key={cIdx}
                          className={`${cellPadClass} border border-slate-300 align-middle break-words whitespace-pre-line leading-snug ${alignClass(
                            align
                          )} ${
                            cIdx === 0 && align === 'left'
                              ? 'font-semibold text-slate-900'
                              : 'tabular-nums'
                          }`}
                        >
                          {String(cell ?? '')}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </>
          )}
        </table>
      </div>

      {(normalized.source || normalized.note) && (
        <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 text-[11px] sm:text-xs text-slate-600 space-y-0.5">
          {normalized.source && (
            <div className="italic text-right font-medium">{normalized.source}</div>
          )}
          {normalized.note && <div className="italic">{normalized.note}</div>}
        </div>
      )}
    </div>
  );
};

interface RichDocumentContentProps {
  text: string;
  tables?: Record<string, ExamTableData>;
  images?: Record<string, string>;
  charts?: Record<string, ExamChartData>;
  compact?: boolean;
  className?: string;
}

/**
 * Hiển thị nội dung tài liệu nguyên bản (không phải trắc nghiệm ABCD) có nhận diện
 * và bảo toàn toàn bộ bảng biểu cố định, biểu đồ nguyên bản và hình ảnh đúng thứ tự tài liệu gốc.
 */
export const RichDocumentContent: React.FC<RichDocumentContentProps> = ({
  text,
  tables,
  images,
  charts,
  compact = false,
  className = '',
}) => {
  const blocks = useMemo(
    () => extractAllTablesAndBlocksFromDocument(text || '', tables, images, charts),
    [text, tables, images, charts]
  );

  if (blocks.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'table') {
          return <DocumentTable key={idx} tableData={block.tableData} compact={compact} />;
        }
        if (block.type === 'chart') {
          return <DocumentChart key={idx} chartData={block.chartData} compact={compact} />;
        }
        if (block.type === 'image') {
          return (
            <div
              key={idx}
              className="rounded-lg border border-slate-200 bg-white p-2 flex justify-center overflow-hidden"
            >
              <img
                src={block.src}
                alt={`Hình minh họa (${block.key})`}
                className={`object-contain rounded ${compact ? 'max-h-64' : 'max-h-96'} w-auto`}
              />
            </div>
          );
        }
        return (
          <div
            key={idx}
            className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed break-words"
          >
            {block.content}
          </div>
        );
      })}
    </div>
  );
};
