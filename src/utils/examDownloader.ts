import { Exam, ExamChartData, ExamTableData } from '../types/exam';
import { authService, incrementFreeTrialDownloadCount } from '../services/authService';
import {
  extractTableAndCitationFromBlock,
  normalizeExamTableData,
} from '../data/provincialAndOfficialExams';

export interface DownloadExamOptions {
  includeAnswers?: boolean;
  studentName?: string;
  studentClass?: string;
  studentId?: string;
}

export interface TrackDownloadParams {
  fileName: string;
  documentTitle: string;
  category: 'de_thi_thpt' | 'on_tap_chuong' | 'de_lop_12' | 'de_lop_11' | 'de_lop_10';
  categoryLabel: string;
  modeLabel?: string;
}

const DOCX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function detectClientDeviceShort(): { deviceType: string; browser: string; os: string } {
  if (typeof navigator === 'undefined') {
    return { deviceType: 'Máy tính (PC/Laptop)', browser: 'Chrome', os: 'Windows' };
  }
  const ua = navigator.userAgent || '';
  let deviceType = 'Máy tính (PC/Laptop)';
  if (/iPad|Tablet/i.test(ua)) deviceType = 'Máy tính bảng';
  else if (/Mobile|Android|iPhone|iPod/i.test(ua)) deviceType = 'Điện thoại';

  let browser = 'Trình duyệt Web';
  if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Google Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Apple Safari';

  let os = 'Hệ điều hành';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X/i.test(ua) && !/iPhone|iPad/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return { deviceType, browser, os };
}

/**
 * Ghi nhận lượt tải tài liệu (.docx) về máy chủ thống kê theo thời gian thực
 */
export async function trackDocumentDownload(params: TrackDownloadParams): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const currentUser = authService.getCurrentUser();
    if (currentUser?.username) {
      incrementFreeTrialDownloadCount(currentUser.username);
    }
    const visitorId = localStorage.getItem('agritech_visitor_id') || `vis_${Date.now()}`;
    const device = detectClientDeviceShort();

    const normalizedFileName = params.fileName.replace(/\.doc$/i, '.docx');

    const payload = {
      visitorId,
      username: currentUser?.username || 'khach',
      fullName: currentUser?.fullName || 'Khách truy cập',
      role: currentUser?.role || 'guest',
      studentClass: currentUser?.className || 'Tổ Công Nghệ Nông nghiệp',
      fileName: normalizedFileName,
      documentTitle: params.documentTitle,
      category: params.category,
      categoryLabel: params.categoryLabel,
      modeLabel: params.modeLabel || 'Tài liệu Word (.docx)',
      deviceType: device.deviceType,
      browser: device.browser,
      os: device.os,
    };

    const res = await fetch('/api/analytics/download?__storage_access_granted=1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      window.dispatchEvent(new CustomEvent('visitor_stats_local_updated', { detail: data }));
    }
  } catch (err) {
    console.warn('Could not track document download:', err);
  }
}

// ============================================================================
// BỘ CHUYỂN ĐỔI HTML SANG OPENXML (.DOCX) CHUẨN MICROSOFT WORD / GOOGLE DOCS
// ============================================================================

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZipArchive(files: Array<{ name: string; content: string }>): Uint8Array {
  const encoder = new TextEncoder();
  const entries = files.map((f) => {
    const nameBytes = encoder.encode(f.name);
    const dataBytes = encoder.encode(f.content);
    const crc = crc32(dataBytes);
    return { nameBytes, dataBytes, crc };
  });

  let localSize = 0;
  let centralSize = 0;
  for (const e of entries) {
    localSize += 30 + e.nameBytes.length + e.dataBytes.length;
    centralSize += 46 + e.nameBytes.length;
  }

  const totalSize = localSize + centralSize + 22;
  const out = new Uint8Array(totalSize);
  const view = new DataView(out.buffer);

  let localOffset = 0;
  const offsets: number[] = [];

  for (const e of entries) {
    offsets.push(localOffset);
    view.setUint32(localOffset, 0x04034b50, true); // Local file header signature
    view.setUint16(localOffset + 4, 20, true); // Version needed to extract (2.0)
    view.setUint16(localOffset + 6, 0x0800, true); // General purpose bit flag (UTF-8)
    view.setUint16(localOffset + 8, 0, true); // Compression method (0 = STORED)
    view.setUint16(localOffset + 10, 0, true); // File last modification time
    view.setUint16(localOffset + 12, 0x21, true); // File last modification date
    view.setUint32(localOffset + 14, e.crc, true); // CRC-32
    view.setUint32(localOffset + 18, e.dataBytes.length, true); // Compressed size
    view.setUint32(localOffset + 22, e.dataBytes.length, true); // Uncompressed size
    view.setUint16(localOffset + 26, e.nameBytes.length, true); // File name length
    view.setUint16(localOffset + 28, 0, true); // Extra field length
    out.set(e.nameBytes, localOffset + 30);
    out.set(e.dataBytes, localOffset + 30 + e.nameBytes.length);
    localOffset += 30 + e.nameBytes.length + e.dataBytes.length;
  }

  let centralOffset = localOffset;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    view.setUint32(centralOffset, 0x02014b50, true); // Central directory file header signature
    view.setUint16(centralOffset + 4, 20, true); // Version made by
    view.setUint16(centralOffset + 6, 20, true); // Version needed to extract
    view.setUint16(centralOffset + 8, 0x0800, true); // General purpose bit flag (UTF-8)
    view.setUint16(centralOffset + 10, 0, true); // Compression method (0 = STORED)
    view.setUint16(centralOffset + 12, 0, true); // Last mod file time
    view.setUint16(centralOffset + 14, 0x21, true); // Last mod file date
    view.setUint32(centralOffset + 16, e.crc, true); // CRC-32
    view.setUint32(centralOffset + 20, e.dataBytes.length, true); // Compressed size
    view.setUint32(centralOffset + 24, e.dataBytes.length, true); // Uncompressed size
    view.setUint16(centralOffset + 28, e.nameBytes.length, true); // File name length
    view.setUint16(centralOffset + 30, 0, true); // Extra field length
    view.setUint16(centralOffset + 32, 0, true); // File comment length
    view.setUint16(centralOffset + 34, 0, true); // Disk number start
    view.setUint16(centralOffset + 36, 0, true); // Internal file attributes
    view.setUint32(centralOffset + 38, 0, true); // External file attributes
    view.setUint32(centralOffset + 42, offsets[i], true); // Relative offset of local header
    out.set(e.nameBytes, centralOffset + 46);
    centralOffset += 46 + e.nameBytes.length;
  }

  // End of central directory record
  view.setUint32(centralOffset, 0x06054b50, true);
  view.setUint16(centralOffset + 4, 0, true); // Number of this disk
  view.setUint16(centralOffset + 6, 0, true); // Disk where central directory starts
  view.setUint16(centralOffset + 8, entries.length, true); // Number of central directory records on this disk
  view.setUint16(centralOffset + 10, entries.length, true); // Total number of central directory records
  view.setUint32(centralOffset + 12, centralSize, true); // Size of central directory
  view.setUint32(centralOffset + 16, localOffset, true); // Offset of start of central directory
  view.setUint16(centralOffset + 20, 0, true); // Comment length

  return out;
}

function escapeXml(str: string): string {
  return str
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

interface RunStyleState {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  uppercase?: boolean;
  colorHex?: string;
  halfPoints?: number;
}

interface BlockStyleState {
  align?: 'left' | 'center' | 'right' | 'both';
  pageBreakBefore?: boolean;
  indentLeftTwips?: number;
  fillHex?: string;
  borderBottom?: boolean;
  borderTop?: boolean;
  borderLeftColor?: string;
  borderBox?: boolean;
  runStyle: RunStyleState;
}

function normalizeHexColor(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const s = raw.trim().toLowerCase();
  const hexMatch = s.match(/#([0-9a-f]{3,6})\b/i);
  if (hexMatch) {
    const h = hexMatch[1];
    if (h.length === 3) {
      return (h[0] + h[0] + h[1] + h[1] + h[2] + h[2]).toUpperCase();
    }
    if (h.length === 6) {
      return h.toUpperCase();
    }
  }
  return undefined;
}

function extractElementRunStyle(el: Element, parent: RunStyleState): RunStyleState {
  const next: RunStyleState = { ...parent };
  const tag = el.tagName.toLowerCase();
  const cls = (el.getAttribute('class') || '').toLowerCase();
  const style = (el.getAttribute('style') || '').toLowerCase();

  if (
    tag === 'strong' ||
    tag === 'b' ||
    tag === 'th' ||
    tag === 'h1' ||
    tag === 'h2' ||
    tag === 'h3' ||
    tag === 'h4' ||
    cls.includes('bold') ||
    cls.includes('part-title') ||
    cls.includes('question-title') ||
    cls.includes('answer-tag') ||
    /font-weight\s*:\s*(bold|700|800|900)/.test(style)
  ) {
    next.bold = true;
  }
  if (/font-weight\s*:\s*(normal|400)/.test(style)) {
    next.bold = false;
  }

  if (
    tag === 'em' ||
    tag === 'i' ||
    cls.includes('italic') ||
    cls.includes('explanation') ||
    cls.includes('citation') ||
    cls.includes('footer-note') ||
    /font-style\s*:\s*italic/.test(style)
  ) {
    next.italic = true;
  }

  if (tag === 'u' || cls.includes('underline') || /text-decoration\s*:\s*underline/.test(style)) {
    next.underline = true;
  }

  if (
    cls.includes('uppercase') ||
    cls.includes('part-title') ||
    /text-transform\s*:\s*uppercase/.test(style)
  ) {
    next.uppercase = true;
  }

  if (cls.includes('answer-tag-wrong')) {
    next.colorHex = '991B1B';
  } else if (cls.includes('answer-tag') || cls.includes('explanation')) {
    next.colorHex = '166534';
  } else if (cls.includes('citation')) {
    next.colorHex = '1E3A8A';
  }

  const colorMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/);
  if (colorMatch) {
    const hex = normalizeHexColor(colorMatch[1]);
    if (hex) next.colorHex = hex;
  }

  if (tag === 'h1') next.halfPoints = 30;
  else if (tag === 'h2') next.halfPoints = 28;
  else if (tag === 'h3' || cls.includes('part-title')) next.halfPoints = 27;
  else if (cls.includes('explanation') || cls.includes('citation')) next.halfPoints = 22;

  const fontSizePt = style.match(/font-size\s*:\s*([\d.]+)\s*pt/);
  if (fontSizePt) {
    const pt = parseFloat(fontSizePt[1]);
    if (!isNaN(pt) && pt >= 8 && pt <= 36) {
      next.halfPoints = Math.round(pt * 2);
    }
  }

  return next;
}

function extractBlockStyle(el: Element, inherited: BlockStyleState): BlockStyleState {
  const tag = el.tagName.toLowerCase();
  const cls = (el.getAttribute('class') || '').toLowerCase();
  const style = (el.getAttribute('style') || '').toLowerCase();

  const next: BlockStyleState = {
    ...inherited,
    pageBreakBefore: inherited.pageBreakBefore,
    runStyle: extractElementRunStyle(el, inherited.runStyle),
  };

  if (cls.includes('text-center') || cls.includes('footer-note') || /text-align\s*:\s*center/.test(style)) {
    next.align = 'center';
  } else if (cls.includes('text-right') || /text-align\s*:\s*right/.test(style)) {
    next.align = 'right';
  } else if (
    cls.includes('question-title') ||
    cls.includes('scenario-box') ||
    /text-align\s*:\s*justify/.test(style)
  ) {
    next.align = 'both';
  } else if (cls.includes('text-left') || /text-align\s*:\s*left/.test(style)) {
    next.align = 'left';
  }

  if (/page-break-before\s*:\s*always/.test(style)) {
    next.pageBreakBefore = true;
  }

  if (tag === 'li' || cls.includes('explanation')) {
    next.indentLeftTwips = Math.max(next.indentLeftTwips || 0, 320);
  }

  if (cls.includes('part-title') || /border-bottom\s*:/.test(style)) {
    next.borderBottom = true;
  }
  if (cls.includes('footer-note') || /border-top\s*:/.test(style)) {
    next.borderTop = true;
  }
  if (cls.includes('scenario-box') || /border-left\s*:/.test(style)) {
    next.borderLeftColor = '15803D';
    next.fillHex = next.fillHex || 'F8FAFC';
  }
  if (cls.includes('student-box')) {
    next.borderBox = true;
    next.fillHex = 'FAFAFA';
  }

  const bgMatch = style.match(/background(?:-color)?\s*:\s*([^;]+)/);
  if (bgMatch) {
    const bgHex = normalizeHexColor(bgMatch[1]);
    if (bgHex && bgHex !== 'FFFFFF') {
      next.fillHex = bgHex;
    }
  }

  return next;
}

const BLOCK_TAG_SET = new Set([
  'div',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'table',
  'blockquote',
  'section',
  'article',
  'header',
  'footer',
  'hr',
]);

function hasBlockChildren(el: Element): boolean {
  for (let i = 0; i < el.children.length; i++) {
    const childTag = el.children[i].tagName.toLowerCase();
    if (BLOCK_TAG_SET.has(childTag)) {
      return true;
    }
  }
  return false;
}

function buildRunXml(text: string, style: RunStyleState): string {
  if (!text) return '';
  const finalText = style.uppercase ? text.toUpperCase() : text;
  const sz = style.halfPoints || 26; // Default 13pt (26 half-points)
  const rPrParts: string[] = [
    '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>',
  ];
  if (style.bold) {
    rPrParts.push('<w:b/><w:bCs/>');
  }
  if (style.italic) {
    rPrParts.push('<w:i/><w:iCs/>');
  }
  if (style.underline) {
    rPrParts.push('<w:u w:val="single"/>');
  }
  if (style.colorHex) {
    rPrParts.push(`<w:color w:val="${style.colorHex}"/>`);
  }
  rPrParts.push(`<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>`);

  return `<w:r><w:rPr>${rPrParts.join('')}</w:rPr><w:t xml:space="preserve">${escapeXml(
    finalText
  )}</w:t></w:r>`;
}

function collectInlineRunsXml(node: Node, style: RunStyleState): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const raw = (node.nodeValue || '').replace(/\s+/g, ' ');
    return buildRunXml(raw, style);
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  if (tag === 'style' || tag === 'script') return '';
  if (tag === 'br') {
    return '<w:r><w:br/></w:r>';
  }

  const nextStyle = extractElementRunStyle(el, style);
  let out = '';
  for (let i = 0; i < el.childNodes.length; i++) {
    out += collectInlineRunsXml(el.childNodes[i], nextStyle);
  }
  return out;
}

function buildParagraphXml(runsXml: string, blockStyle: BlockStyleState, prefixBullet?: string): string {
  const pPrParts: string[] = [];
  if (blockStyle.pageBreakBefore) {
    pPrParts.push('<w:pageBreakBefore/>');
  }
  if (blockStyle.align) {
    pPrParts.push(`<w:jc w:val="${blockStyle.align}"/>`);
  }
  pPrParts.push('<w:spacing w:before="40" w:after="80" w:line="300" w:lineRule="auto"/>');

  if (blockStyle.indentLeftTwips) {
    pPrParts.push(`<w:ind w:left="${blockStyle.indentLeftTwips}"/>`);
  }

  if (
    blockStyle.borderBottom ||
    blockStyle.borderTop ||
    blockStyle.borderLeftColor ||
    blockStyle.borderBox
  ) {
    const bdr: string[] = [];
    if (blockStyle.borderBox) {
      bdr.push(
        '<w:top w:val="single" w:sz="6" w:space="4" w:color="334155"/>',
        '<w:left w:val="single" w:sz="6" w:space="6" w:color="334155"/>',
        '<w:bottom w:val="single" w:sz="6" w:space="4" w:color="334155"/>',
        '<w:right w:val="single" w:sz="6" w:space="6" w:color="334155"/>'
      );
    } else {
      if (blockStyle.borderTop) {
        bdr.push('<w:top w:val="single" w:sz="6" w:space="4" w:color="94A3B8"/>');
      }
      if (blockStyle.borderBottom) {
        bdr.push('<w:bottom w:val="single" w:sz="8" w:space="3" w:color="0F172A"/>');
      }
      if (blockStyle.borderLeftColor) {
        bdr.push(
          `<w:left w:val="single" w:sz="18" w:space="8" w:color="${blockStyle.borderLeftColor}"/>`
        );
      }
    }
    pPrParts.push(`<w:pBdr>${bdr.join('')}</w:pBdr>`);
  }

  if (blockStyle.fillHex) {
    pPrParts.push(`<w:shd w:val="clear" w:color="auto" w:fill="${blockStyle.fillHex}"/>`);
  }

  const bulletRun = prefixBullet ? buildRunXml(prefixBullet, { ...blockStyle.runStyle, bold: true }) : '';
  return `<w:p><w:pPr>${pPrParts.join('')}</w:pPr>${bulletRun}${runsXml}</w:p>`;
}

function convertTableElementToXml(tableEl: Element, inherited: BlockStyleState): string {
  const cls = (tableEl.getAttribute('class') || '').toLowerCase();
  const style = (tableEl.getAttribute('style') || '').toLowerCase();

  const isBorderlessTable =
    cls.includes('header-table') ||
    cls.includes('options-table') ||
    cls.includes('statement-table') ||
    inherited.borderBox === true;

  // Check if cells or table explicitly have borders (bao gồm cả tf-table dùng cho bảng số liệu)
  let hasExplicitCellBorders =
    cls.includes('key-table') ||
    cls.includes('tf-table') ||
    /border\s*:\s*1/.test(style) ||
    tableEl.getAttribute('border') === '1';
  if (!hasExplicitCellBorders && !isBorderlessTable) {
    const firstCell = tableEl.querySelector('th, td');
    if (firstCell) {
      const cellStyle = (firstCell.getAttribute('style') || '').toLowerCase();
      if (/border\s*:/.test(cellStyle) && !/border\s*:\s*none/.test(cellStyle)) {
        hasExplicitCellBorders = true;
      }
    }
  }

  const borderXml = hasExplicitCellBorders
    ? `<w:tblBorders>
        <w:top w:val="single" w:sz="6" w:space="0" w:color="334155"/>
        <w:left w:val="single" w:sz="6" w:space="0" w:color="334155"/>
        <w:bottom w:val="single" w:sz="6" w:space="0" w:color="334155"/>
        <w:right w:val="single" w:sz="6" w:space="0" w:color="334155"/>
        <w:insideH w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
        <w:insideV w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
      </w:tblBorders>`
    : inherited.borderBox
    ? `<w:tblBorders>
        <w:top w:val="single" w:sz="6" w:space="0" w:color="1E293B"/>
        <w:left w:val="single" w:sz="6" w:space="0" w:color="1E293B"/>
        <w:bottom w:val="single" w:sz="6" w:space="0" w:color="1E293B"/>
        <w:right w:val="single" w:sz="6" w:space="0" w:color="1E293B"/>
        <w:insideH w:val="none" w:sz="0" w:space="0" w:color="auto"/>
        <w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>
      </w:tblBorders>`
    : `<w:tblBorders>
        <w:top w:val="none" w:sz="0" w:space="0" w:color="auto"/>
        <w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/>
        <w:bottom w:val="none" w:sz="0" w:space="0" w:color="auto"/>
        <w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>
        <w:insideH w:val="none" w:sz="0" w:space="0" w:color="auto"/>
        <w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>
      </w:tblBorders>`;

  const rows = Array.from(
    tableEl.querySelectorAll(':scope > tr, :scope > thead > tr, :scope > tbody > tr, :scope > tfoot > tr')
  );
  if (rows.length === 0) return '';

  // Đọc phần trăm độ rộng cột từ <colgroup> nếu có để khóa chính xác <w:tblGrid>
  const TOTAL_TABLE_DXA = 9922; // 11906 - 1134 - 850 (khổ giấy A4 trừ lề trái/phải)
  const colPctFromGroup: number[] = [];
  const colEls = Array.from(tableEl.querySelectorAll(':scope > colgroup > col'));
  for (const colEl of colEls) {
    const m = (colEl.getAttribute('style') || '').match(/width\s*:\s*([\d.]+)%/i);
    if (m) {
      const v = parseFloat(m[1]);
      if (Number.isFinite(v) && v > 0) colPctFromGroup.push(v);
    }
  }

  // Tính tổng số cột thực tế trên toàn bảng (tính cả colspan và rowspan)
  let maxCols = colPctFromGroup.length;
  const activeSpanCheck: number[] = [];
  for (const row of rows) {
    const cells = Array.from(row.children).filter(
      (c) => c.tagName.toLowerCase() === 'td' || c.tagName.toLowerCase() === 'th'
    );
    let colIdx = 0;
    for (const cell of cells) {
      while ((activeSpanCheck[colIdx] || 0) > 0) colIdx++;
      const cs = Math.max(1, parseInt(cell.getAttribute('colspan') || '1', 10) || 1);
      const rs = Math.max(1, parseInt(cell.getAttribute('rowspan') || '1', 10) || 1);
      for (let k = 0; k < cs; k++) {
        if (rs > 1) activeSpanCheck[colIdx + k] = rs;
      }
      colIdx += cs;
    }
    while ((activeSpanCheck[colIdx] || 0) > 0) colIdx++;
    maxCols = Math.max(maxCols, colIdx);
    for (let c = 0; c < activeSpanCheck.length; c++) {
      if (activeSpanCheck[c] > 0) activeSpanCheck[c] -= 1;
    }
  }
  maxCols = Math.max(maxCols, 1);

  const colDxaWidths: number[] = [];
  if (colPctFromGroup.length === maxCols) {
    const sumPct = colPctFromGroup.reduce((a, b) => a + b, 0) || 100;
    colPctFromGroup.forEach((p) => colDxaWidths.push(Math.max(400, Math.round((p / sumPct) * TOTAL_TABLE_DXA))));
  } else {
    const each = Math.round(TOTAL_TABLE_DXA / maxCols);
    for (let c = 0; c < maxCols; c++) colDxaWidths.push(each);
  }
  const dxaDiff = TOTAL_TABLE_DXA - colDxaWidths.reduce((a, b) => a + b, 0);
  if (colDxaWidths.length > 0) colDxaWidths[0] = Math.max(400, colDxaWidths[0] + dxaDiff);

  const tblGridXml = `<w:tblGrid>${colDxaWidths.map((w) => `<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>`;

  const trXmlList: string[] = [];
  const pendingVMerge: { remaining: number; colSpan: number; widthDxa: number }[] = Array(maxCols).fill(null as any);

  for (const row of rows) {
    const cells = Array.from(row.children).filter(
      (c) => c.tagName.toLowerCase() === 'td' || c.tagName.toLowerCase() === 'th'
    );
    if (cells.length === 0) continue;

    const tcXmlList: string[] = [];
    let colCursor = 0;

    const emitContinuationCells = () => {
      while (colCursor < maxCols && pendingVMerge[colCursor] && pendingVMerge[colCursor].remaining > 0) {
        const entry = pendingVMerge[colCursor];
        const contPr: string[] = [];
        if (entry.colSpan > 1) contPr.push(`<w:gridSpan w:val="${entry.colSpan}"/>`);
        contPr.push(`<w:tcW w:w="${entry.widthDxa}" w:type="dxa"/>`);
        contPr.push('<w:vMerge/>');
        contPr.push('<w:vAlign w:val="center"/>');
        tcXmlList.push(`<w:tc><w:tcPr>${contPr.join('')}</w:tcPr><w:p/></w:tc>`);
        entry.remaining -= 1;
        if (entry.remaining <= 0) {
          for (let k = 0; k < entry.colSpan; k++) pendingVMerge[colCursor + k] = null as any;
        }
        colCursor += entry.colSpan;
      }
    };

    for (const cell of cells) {
      emitContinuationCells();

      const cellTag = cell.tagName.toLowerCase();
      const cellStyleStr = (cell.getAttribute('style') || '').toLowerCase();
      const colspan = Math.max(1, parseInt(cell.getAttribute('colspan') || '1', 10) || 1);
      const rowspan = Math.max(1, parseInt(cell.getAttribute('rowspan') || '1', 10) || 1);

      const cellBlockStyle = extractBlockStyle(cell, {
        ...inherited,
        pageBreakBefore: false,
        borderBox: false,
        borderBottom: false,
        borderTop: false,
        borderLeftColor: undefined,
        align: cellTag === 'th' || cls.includes('key-table') ? 'center' : inherited.align,
        runStyle: {
          ...inherited.runStyle,
          bold: cellTag === 'th' ? true : inherited.runStyle.bold,
        },
      });

      const tcPrParts: string[] = [];
      if (colspan > 1) {
        tcPrParts.push(`<w:gridSpan w:val="${colspan}"/>`);
      }

      let cellDxaWidth = 0;
      const pctMatch = cellStyleStr.match(/width\s*:\s*([\d.]+)%/);
      if (pctMatch) {
        const pctVal = parseFloat(pctMatch[1]);
        if (Number.isFinite(pctVal) && pctVal > 0 && pctVal <= 100) {
          cellDxaWidth = Math.max(400, Math.round((pctVal / 100) * TOTAL_TABLE_DXA));
        }
      }
      if (!cellDxaWidth) {
        for (let k = 0; k < colspan; k++) {
          cellDxaWidth += colDxaWidths[colCursor + k] || Math.round(TOTAL_TABLE_DXA / maxCols);
        }
      }
      tcPrParts.push(`<w:tcW w:w="${cellDxaWidth}" w:type="dxa"/>`);

      if (rowspan > 1) {
        tcPrParts.push('<w:vMerge w:val="restart"/>');
        const entry = { remaining: rowspan - 1, colSpan: colspan, widthDxa: cellDxaWidth };
        for (let k = 0; k < colspan; k++) {
          if (colCursor + k < maxCols) pendingVMerge[colCursor + k] = entry;
        }
      }

      const cellBgHex =
        cellBlockStyle.fillHex || (cellTag === 'th' ? 'F1F5F9' : inherited.fillHex);
      if (cellBgHex) {
        tcPrParts.push(`<w:shd w:val="clear" w:color="auto" w:fill="${cellBgHex}"/>`);
      }

      tcPrParts.push('<w:vAlign w:val="center"/>');
      tcPrParts.push(
        '<w:tcMar><w:top w:w="60" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:left w:w="90" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tcMar>'
      );

      const cellContentBlocks = convertDomNodesToXmlBlocks(
        Array.from(cell.childNodes),
        { ...cellBlockStyle, fillHex: undefined }
      );

      let innerXml = cellContentBlocks.join('');
      if (!innerXml || !innerXml.trim().endsWith('</w:p>')) {
        innerXml += '<w:p/>';
      }

      tcXmlList.push(`<w:tc><w:tcPr>${tcPrParts.join('')}</w:tcPr>${innerXml}</w:tc>`);
      colCursor += colspan;
    }

    emitContinuationCells();

    if (tcXmlList.length > 0) {
      trXmlList.push(`<w:tr>${tcXmlList.join('')}</w:tr>`);
    }
  }

  if (trXmlList.length === 0) return '';

  const pageBreakParagraph = inherited.pageBreakBefore
    ? '<w:p><w:pPr><w:pageBreakBefore/></w:pPr></w:p>'
    : '';

  return `${pageBreakParagraph}<w:tbl><w:tblPr><w:tblW w:w="${TOTAL_TABLE_DXA}" w:type="dxa"/><w:tblLayout w:type="fixed"/>${borderXml}</w:tblPr>${tblGridXml}${trXmlList.join(
    ''
  )}</w:tbl>`;
}

function convertDomNodesToXmlBlocks(nodes: Node[], inherited: BlockStyleState): string[] {
  const blocks: string[] = [];
  let inlineBuffer = '';
  let pendingPageBreak = inherited.pageBreakBefore || false;

  const flushInlineBuffer = () => {
    if (inlineBuffer.trim()) {
      blocks.push(
        buildParagraphXml(inlineBuffer, {
          ...inherited,
          pageBreakBefore: pendingPageBreak,
        })
      );
      pendingPageBreak = false;
    }
    inlineBuffer = '';
  };

  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const txt = (node.nodeValue || '').replace(/\s+/g, ' ');
      if (txt.trim()) {
        inlineBuffer += buildRunXml(txt, inherited.runStyle);
      }
      continue;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (tag === 'style' || tag === 'script' || tag === 'meta' || tag === 'title' || tag === 'xml') {
      continue;
    }

    if (!BLOCK_TAG_SET.has(tag)) {
      inlineBuffer += collectInlineRunsXml(el, inherited.runStyle);
      continue;
    }

    // It's a block element -> flush any accumulated inline text first
    flushInlineBuffer();

    const elBlockStyle = extractBlockStyle(el, {
      ...inherited,
      pageBreakBefore: pendingPageBreak,
    });
    pendingPageBreak = false;

    if (tag === 'hr') {
      blocks.push(
        '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="CBD5E1"/></w:pBdr></w:pPr></w:p>'
      );
      continue;
    }

    if (tag === 'table') {
      const tblXml = convertTableElementToXml(el, elBlockStyle);
      if (tblXml) blocks.push(tblXml);
      continue;
    }

    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(el.children).filter((c) => c.tagName.toLowerCase() === 'li');
      items.forEach((li, idx) => {
        const liStyle = extractBlockStyle(li, {
          ...elBlockStyle,
          pageBreakBefore: idx === 0 ? elBlockStyle.pageBreakBefore : false,
          indentLeftTwips: (elBlockStyle.indentLeftTwips || 0) + 360,
        });
        const bulletPrefix = tag === 'ol' ? `${idx + 1}. ` : '• ';
        if (hasBlockChildren(li)) {
          const childBlocks = convertDomNodesToXmlBlocks(Array.from(li.childNodes), liStyle);
          blocks.push(...childBlocks);
        } else {
          const runs = collectInlineRunsXml(li, liStyle.runStyle);
          if (runs.trim()) {
            blocks.push(buildParagraphXml(runs, liStyle, bulletPrefix));
          }
        }
      });
      continue;
    }

    if (hasBlockChildren(el)) {
      const childBlocks = convertDomNodesToXmlBlocks(Array.from(el.childNodes), elBlockStyle);
      blocks.push(...childBlocks);
    } else {
      const runs = collectInlineRunsXml(el, elBlockStyle.runStyle);
      if (runs.trim()) {
        blocks.push(
          buildParagraphXml(
            runs,
            elBlockStyle,
            tag === 'li' ? '• ' : undefined
          )
        );
      } else if (elBlockStyle.pageBreakBefore) {
        pendingPageBreak = true;
      }
    }
  }

  flushInlineBuffer();
  return blocks;
}

function escapeHtmlForWordTable(text: string): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\r?\n/g, '<br/>');
}

function renderFixedExamTableHtml(rawTable: ExamTableData): string {
  const normalized = normalizeExamTableData(rawTable);
  const colWidths = normalized.colWidths || [];
  const alignments = normalized.alignments || [];
  const colgroupHtml =
    colWidths.length > 0
      ? `<colgroup>${colWidths.map((w) => `<col style="width: ${w}%;"/>`).join('')}</colgroup>`
      : '';

  const hasStructured =
    Array.isArray(normalized.structuredRows) && normalized.structuredRows.length > 0;

  const bodyHtml = hasStructured
    ? `<tbody>${normalized.structuredRows!
        .map((row, rIdx) => {
          const isHeaderRow = Boolean(row.isHeader) || rIdx === 0;
          return `<tr>${row.cells
            .map((cell, cIdx) => {
              const isTh = isHeaderRow || Boolean(cell.isHeader);
              const tag = isTh ? 'th' : 'td';
              const align = cell.align || (isTh ? 'center' : alignments[cIdx] || 'center');
              const cs = cell.colSpan && cell.colSpan > 1 ? ` colspan="${cell.colSpan}"` : '';
              const rs = cell.rowSpan && cell.rowSpan > 1 ? ` rowspan="${cell.rowSpan}"` : '';
              return `<${tag}${cs}${rs} style="border: 1px solid #334155; text-align: ${align};">${escapeHtmlForWordTable(
                cell.text
              )}</${tag}>`;
            })
            .join('')}</tr>`;
        })
        .join('')}</tbody>`
    : `<thead><tr>${normalized.headers
        .map(
          (h, idx) =>
            `<th style="border: 1px solid #334155; text-align: center; width: ${
              colWidths[idx] || Math.round(100 / Math.max(normalized.headers.length, 1))
            }%;">${escapeHtmlForWordTable(h)}</th>`
        )
        .join('')}</tr></thead><tbody>${normalized.rows
        .map(
          (r) =>
            `<tr>${r
              .map(
                (c, idx) =>
                  `<td style="border: 1px solid #334155; text-align: ${
                    alignments[idx] || (idx === 0 ? 'left' : 'center')
                  };">${escapeHtmlForWordTable(String(c ?? ''))}</td>`
              )
              .join('')}</tr>`
        )
        .join('')}</tbody>`;

  return `
    <div style="margin: 6pt 0;">
      ${
        normalized.caption
          ? `<div style="font-weight: bold; margin-bottom: 3pt;">${escapeHtmlForWordTable(
              normalized.caption
            )}</div>`
          : ''
      }
      <table class="tf-table" border="1" style="width: 100%; table-layout: fixed; border-collapse: collapse; border: 1px solid #334155;">
        ${colgroupHtml}
        ${bodyHtml}
      </table>
      ${
        normalized.source
          ? `<div style="font-size: 10pt; font-style: italic; text-align: right; margin-top: 3pt;">${escapeHtmlForWordTable(
              normalized.source
            )}</div>`
          : ''
      }
      ${
        normalized.note
          ? `<div style="font-size: 10pt; font-style: italic;">${escapeHtmlForWordTable(
              normalized.note
            )}</div>`
          : ''
      }
    </div>
  `;
}

function renderFixedExamChartHtml(chartData: ExamChartData): string {
  const unit = (chartData.unit || '').trim();
  const hasMultiSeries =
    Array.isArray(chartData.series) &&
    chartData.series.length > 0 &&
    Array.isArray(chartData.categories) &&
    chartData.categories.length > 0;

  const headers: string[] = hasMultiSeries
    ? ['Danh mục / Trục ngang', ...chartData.series!.map((s) => (unit ? `${s.name} (${unit})` : s.name))]
    : ['Công thức / Danh mục', unit ? `Giá trị (${unit})` : 'Giá trị'];

  const rows: (string | number)[][] = hasMultiSeries
    ? chartData.categories!.map((cat, idx) => [
        cat,
        ...chartData.series!.map((s) =>
          s.displayValues?.[idx] !== undefined && s.displayValues[idx] !== ''
            ? s.displayValues[idx]
            : s.values[idx] !== null && s.values[idx] !== undefined
            ? s.values[idx]!
            : ''
        ),
      ])
    : (chartData.items || []).map((it) => [
        it.label,
        it.displayValue !== undefined && it.displayValue !== '' ? it.displayValue : it.value,
      ]);

  const titlePrefix = chartData.caption || 'Biểu đồ dữ liệu thực nghiệm';
  return renderFixedExamTableHtml({
    caption: unit ? `${titlePrefix} (Đơn vị: ${unit})` : titlePrefix,
    headers,
    rows,
    source: chartData.source,
    note: chartData.note,
  });
}

/**
 * Tạo Blob chuẩn OpenXML (.docx) từ chuỗi HTML tài liệu/đề thi
 */
export function buildDocxBlobFromHtml(htmlContent: string): Blob {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const initialStyle: BlockStyleState = {
    align: 'left',
    pageBreakBefore: false,
    runStyle: {
      bold: false,
      italic: false,
      underline: false,
      uppercase: false,
      halfPoints: 26, // 13pt
    },
  };

  const bodyBlocks = convertDomNodesToXmlBlocks(Array.from(doc.body.childNodes), initialStyle);
  if (bodyBlocks.length === 0) {
    bodyBlocks.push('<w:p/>');
  }

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const documentRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        <w:sz w:val="26"/>
        <w:szCs w:val="26"/>
        <w:lang w:val="vi-VN"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="80" w:line="300" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
</w:styles>`;

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyBlocks.join('\n    ')}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838" w:orient="portrait"/>
      <w:pgMar w:top="1134" w:right="850" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const zipBytes = createZipArchive([
    { name: '[Content_Types].xml', content: contentTypesXml },
    { name: '_rels/.rels', content: rootRelsXml },
    { name: 'word/_rels/document.xml.rels', content: documentRelsXml },
    { name: 'word/styles.xml', content: stylesXml },
    { name: 'word/document.xml', content: documentXml },
  ]);

  return new Blob([zipBytes.buffer as ArrayBuffer], { type: DOCX_MIME_TYPE });
}

/**
 * Tải nội dung HTML về máy dưới định dạng tệp Microsoft Word (.docx) chuẩn OpenXML
 */
export function downloadHtmlAsDocx(htmlContent: string, rawFileName: string): string {
  const fileName = rawFileName.replace(/\.doc$/i, '.docx').endsWith('.docx')
    ? rawFileName.replace(/\.doc$/i, '.docx')
    : `${rawFileName}.docx`;

  const blob = buildDocxBlobFromHtml(htmlContent);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2500);
  return fileName;
}

/**
 * Xuất đề thi ra file Microsoft Word (.docx) có định dạng chuẩn văn bản hành chính của Bộ GD&ĐT.
 * Tương thích 100% với Microsoft Word, Google Docs, WPS Office và LibreOffice.
 */
export function downloadExamAsWord(exam: Exam, options: DownloadExamOptions = {}) {
  const {
    includeAnswers = false,
    studentName = '',
    studentClass = '',
    studentId = '',
  } = options;

  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Đề thi tốt nghiệp THPT - Mã đề ${exam.code}</title>
</head>
<body>
  <!-- Header Quốc Hiệu & Thông Tin Đề -->
  <table class="header-table">
    <tr>
      <td style="width: 50%;" class="text-center">
        <div class="bold uppercase" style="font-size: 13pt;">ĐỀ THAM KHẢO</div>
        <div style="font-size: 11pt; margin-top: 3pt;">${
          exam.partII.length > 0 && exam.partI.length > 0
            ? `(Đề thi có ${exam.partI.length} câu TN + ${exam.partII.length} câu Đúng/Sai)`
            : exam.partI.length > 0
            ? `(Đề thi có ${exam.partI.length} câu trắc nghiệm nhiều phương án lựa chọn)`
            : `(Đề thi có ${exam.partII.length} câu trắc nghiệm Đúng/Sai)`
        }</div>
      </td>
      <td style="width: 50%;" class="text-center">
        <div class="bold uppercase" style="font-size: 12pt;">BÀI THI: CÔNG NGHỆ (NÔNG NGHIỆP)</div>
        <div class="italic" style="font-size: 12pt;">Thời gian làm bài: ${exam.durationMinutes || 50} phút (không kể phát đề)</div>
        <div class="bold" style="font-size: 14pt; margin-top: 6pt;">
          MÃ ĐỀ THI: ${exam.code}
        </div>
      </td>
    </tr>
  </table>

  <!-- Thông tin thí sinh -->
  <div class="student-box">
    <table style="margin-bottom: 0;">
      <tr>
        <td style="width: 55%;">
          <strong>Họ và tên thí sinh:</strong> ${studentName || '....................................................................'}
        </td>
        <td style="width: 20%;">
          <strong>Lớp:</strong> ${studentClass || '..................'}
        </td>
        <td style="width: 25%;">
          <strong>Số báo danh:</strong> ${studentId || '..................'}
        </td>
      </tr>
    </table>
  </div>

  <!-- PHẦN I -->
  <div class="part-title">
    PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn (Thí sinh trả lời từ câu 1 đến câu ${exam.partI.length}. Mỗi câu đúng được 0,25 điểm)
  </div>

  ${exam.partI
    .map(
      (q) => `
    <div class="question-block">
      <div class="question-title">
        <strong>Câu ${q.number}.</strong> ${q.question}
      </div>
      ${(() => {
        const charts = [...(q.chartData ? [q.chartData] : []), ...(q.extraCharts || [])];
        return charts.map((ch) => renderFixedExamChartHtml(ch)).join('');
      })()}
      ${(() => {
        const inlineRes =
          !q.tableData &&
          q.question &&
          (q.question.includes('\t') || q.question.includes('|'))
            ? extractTableAndCitationFromBlock(q.question)
            : null;
        const tables = [
          ...(q.tableData
            ? [q.tableData]
            : inlineRes?.tableData
            ? [inlineRes.tableData, ...(inlineRes.extraTables || [])]
            : []),
          ...(q.extraTables || []),
        ];
        return tables.map((tbl) => renderFixedExamTableHtml(tbl)).join('');
      })()}
      ${
        q.questionFooter
          ? `<div style="font-weight: bold; margin: 4pt 0;">${q.questionFooter}</div>`
          : ''
      }
      <table class="options-table">
        <tr>
          <td>
            <strong>A.</strong> ${q.options.A}
            ${includeAnswers && q.correctAnswer === 'A' ? '<span class="answer-tag">✓ [ĐÁP ÁN ĐÚNG]</span>' : ''}
          </td>
          <td>
            <strong>B.</strong> ${q.options.B}
            ${includeAnswers && q.correctAnswer === 'B' ? '<span class="answer-tag">✓ [ĐÁP ÁN ĐÚNG]</span>' : ''}
          </td>
        </tr>
        <tr>
          <td>
            <strong>C.</strong> ${q.options.C}
            ${includeAnswers && q.correctAnswer === 'C' ? '<span class="answer-tag">✓ [ĐÁP ÁN ĐÚNG]</span>' : ''}
          </td>
          <td>
            <strong>D.</strong> ${q.options.D}
            ${includeAnswers && q.correctAnswer === 'D' ? '<span class="answer-tag">✓ [ĐÁP ÁN ĐÚNG]</span>' : ''}
          </td>
        </tr>
      </table>
      ${
        includeAnswers
          ? `<div class="explanation">→ Dẫn chiếu SGK: ${q.textbookRef}. Giải thích: ${q.explanation}</div>`
          : ''
      }
    </div>
  `
    )
    .join('')}

  ${
    exam.partII.length > 0
      ? `
  <!-- PHẦN II -->
  <div class="part-title" style="page-break-before: always; margin-top: 20pt;">
    PHẦN II. Câu trắc nghiệm đúng sai (Thí sinh trả lời từ câu 1 đến câu ${exam.partII.length}. Trong mỗi ý a, b, c, d ở mỗi câu, thí sinh chọn Đúng hoặc Sai)
  </div>
  <p class="italic" style="font-size: 11pt; margin-bottom: 12pt;">
    * Điểm tối đa mỗi câu là 1,0 điểm (Đúng 1 ý được 0,1đ; Đúng 2 ý được 0,25đ; Đúng 3 ý được 0,5đ; Đúng cả 4 ý được 1,0đ).
  </p>

  ${exam.partII
    .map(
      (tfQ) => `
    <div class="question-block" style="margin-bottom: 16pt;">
      <div class="question-title" style="font-size: 13.5pt;">
        <strong>Câu ${tfQ.number} (1,0 điểm):</strong>
      </div>
      <div class="scenario-box">
        ${(() => {
          const inline =
            !tfQ.tableData &&
            tfQ.scenario &&
            (tfQ.scenario.includes('\t') || tfQ.scenario.includes('|'))
              ? extractTableAndCitationFromBlock(tfQ.scenario)
              : null;
          const displayScenario = inline?.tableData ? inline.cleanedText : tfQ.scenario;
          const tables = [
            ...(tfQ.tableData
              ? [tfQ.tableData]
              : inline?.tableData
              ? [inline.tableData, ...(inline.extraTables || [])]
              : []),
            ...(tfQ.extraTables || []),
          ];
          const charts = [...(tfQ.chartData ? [tfQ.chartData] : []), ...(tfQ.extraCharts || [])];
          return `<div>${escapeHtmlForWordTable(displayScenario)}</div>${tables
            .map((tbl) => renderFixedExamTableHtml(tbl))
            .join('')}${charts.map((ch) => renderFixedExamChartHtml(ch)).join('')}`;
        })()}
        ${
          tfQ.citation
            ? `<div class="citation"><strong>[Nguồn dẫn thực nghiệm]:</strong> ${escapeHtmlForWordTable(tfQ.citation)}</div>`
            : ''
        }
      </div>

      <table class="statement-table">
        ${tfQ.statements
          .map(
            (stmt) => `
          <tr>
            <td style="width: 82%; text-align: justify; padding-bottom: 5pt;">
              <div><strong>${stmt.subId})</strong> ${stmt.text}</div>
              ${
                includeAnswers
                  ? `<div class="explanation">→ Giải thích: ${stmt.explanation}</div>`
                  : ''
              }
            </td>
            <td style="width: 18%; text-align: right; vertical-align: top; font-weight: bold;">
              ${
                includeAnswers
                  ? stmt.isCorrect
                    ? '<span class="answer-tag">[ĐÚNG]</span>'
                    : '<span class="answer-tag-wrong">[SAI]</span>'
                  : '[ Đ / S ]'
              }
            </td>
          </tr>
        `
          )
          .join('')}
      </table>
    </div>
  `
    )
    .join('')}
  `
      : ''
  }

  ${
    exam.partIII && exam.partIII.length > 0
      ? `
  <!-- PHẦN III -->
  <div class="part-title" style="margin-top: 20pt;">
    PHẦN III. Câu hỏi trả lời ngắn / Tự luận (Thí sinh trả lời từ câu 1 đến câu ${exam.partIII.length})
  </div>
  ${exam.partIII
    .map(
      (saQ) => `
    <div class="question-block" style="margin-bottom: 12pt;">
      <div class="question-title" style="font-size: 13pt;">
        <strong>Câu ${saQ.originalNumber || saQ.number}:</strong> ${escapeHtmlForWordTable(saQ.question)}
      </div>
      ${[...(saQ.tableData ? [saQ.tableData] : []), ...(saQ.extraTables || [])]
        .map((tbl) => renderFixedExamTableHtml(tbl))
        .join('')}
      ${[...(saQ.chartData ? [saQ.chartData] : []), ...(saQ.extraCharts || [])]
        .map((ch) => renderFixedExamChartHtml(ch))
        .join('')}
      ${
        includeAnswers && (saQ.expectedAnswer || saQ.explanation)
          ? `<div class="explanation">${
              saQ.expectedAnswer
                ? `<strong>Đáp án:</strong> ${escapeHtmlForWordTable(saQ.expectedAnswer)}<br/>`
                : ''
            }${saQ.explanation ? `→ ${escapeHtmlForWordTable(saQ.explanation)}` : ''}</div>`
          : ''
      }
    </div>
  `
    )
    .join('')}
  `
      : ''
  }

  <div class="footer-note">
    <div>---------- HẾT ----------</div>
    <div style="font-size: 11pt; font-weight: normal;">Cán bộ coi thi không giải thích gì thêm. Thí sinh không được sử dụng tài liệu.</div>
  </div>

  ${
    includeAnswers
      ? `
    <!-- BẢNG ĐÁP ÁN VÀ THANG ĐIỂM CHI TIẾT DÀNH CHO GIÁO VIÊN -->
    <div style="page-break-before: always; margin-top: 30pt;">
      <div class="bold uppercase text-center" style="font-size: 14pt; margin-bottom: 6pt;">
        HƯỚNG DẪN CHẤM VÀ BẢNG ĐÁP ÁN CHI TIẾT
      </div>
      <div class="italic text-center" style="font-size: 12pt; margin-bottom: 14pt;">
        BÀI THI: CÔNG NGHỆ NÔNG NGHIỆP - MÃ ĐỀ: ${exam.code}
      </div>

      <div class="bold" style="font-size: 12.5pt; margin-bottom: 6pt;">
        1. ĐÁP ÁN PHẦN I (${exam.partI.length} CÂU TRẮC NGHIỆM - MỖI CÂU 0,25 ĐIỂM = ${(exam.partI.length * 0.25).toFixed(1).replace('.', ',')} ĐIỂM)
      </div>
      <table class="key-table">
        ${Array.from({ length: Math.ceil(exam.partI.length / 10) }, (_, rowIdx) => {
          const slice = exam.partI.slice(rowIdx * 10, (rowIdx + 1) * 10);
          return `
            <tr>
              ${slice.map((q) => `<th>Câu ${q.number}</th>`).join('')}
            </tr>
            <tr>
              ${slice.map((q) => `<td class="bold">${q.correctAnswer}</td>`).join('')}
            </tr>
          `;
        }).join('')}
      </table>

      ${
        exam.partII.length > 0
          ? `
      <div class="bold" style="font-size: 12.5pt; margin-top: 14pt; margin-bottom: 6pt;">
        2. ĐÁP ÁN PHẦN II (${exam.partII.length} CÂU ĐÚNG / SAI - MỖI CÂU 1,0 ĐIỂM = ${(exam.partII.length * 1.0).toFixed(1).replace('.', ',')} ĐIỂM)
      </div>
      <table class="key-table">
        <tr>
          <th style="width: 16%;">Câu hỏi</th>
          <th style="width: 21%;">Lệnh hỏi a)</th>
          <th style="width: 21%;">Lệnh hỏi b)</th>
          <th style="width: 21%;">Lệnh hỏi c)</th>
          <th style="width: 21%;">Lệnh hỏi d)</th>
        </tr>
        ${exam.partII
          .map(
            (q) => `
          <tr>
            <td class="bold">Câu ${q.number}</td>
            <td class="bold ${q.statements[0].isCorrect ? 'answer-tag' : 'answer-tag-wrong'}">
              ${q.statements[0].isCorrect ? 'ĐÚNG' : 'SAI'}
            </td>
            <td class="bold ${q.statements[1].isCorrect ? 'answer-tag' : 'answer-tag-wrong'}">
              ${q.statements[1].isCorrect ? 'ĐÚNG' : 'SAI'}
            </td>
            <td class="bold ${q.statements[2].isCorrect ? 'answer-tag' : 'answer-tag-wrong'}">
              ${q.statements[2].isCorrect ? 'ĐÚNG' : 'SAI'}
            </td>
            <td class="bold ${q.statements[3].isCorrect ? 'answer-tag' : 'answer-tag-wrong'}">
              ${q.statements[3].isCorrect ? 'ĐÚNG' : 'SAI'}
            </td>
          </tr>
        `
          )
          .join('')}
      </table>
      `
          : ''
      }

      ${
        exam.partIII && exam.partIII.length > 0
          ? `
      <div class="bold" style="font-size: 12.5pt; margin-top: 14pt; margin-bottom: 6pt;">
        3. ĐÁP ÁN PHẦN III (${exam.partIII.length} CÂU TRẢ LỜI NGẮN / TỰ LUẬN)
      </div>
      <table class="key-table">
        <tr>
          <th style="width: 18%;">Câu hỏi</th>
          <th style="width: 82%;">Đáp án / Hướng dẫn chấm</th>
        </tr>
        ${exam.partIII
          .map(
            (q) => `
          <tr>
            <td class="bold">Câu ${q.originalNumber || q.number}</td>
            <td style="text-align: left;">${escapeHtmlForWordTable(
              q.expectedAnswer || q.explanation || '(Xem nội dung đề gốc)'
            )}</td>
          </tr>
        `
          )
          .join('')}
      </table>
      `
          : ''
      }
    </div>
  `
      : ''
  }
</body>
</html>
  `.trim();

  const fileName = includeAnswers
    ? `De_Thi_Va_Dap_An_Cong_Nghe_NN_MaDe_${exam.code}.docx`
    : `De_Thi_Tot_Nghiep_Cong_Nghe_NN_MaDe_${exam.code}.docx`;

  downloadHtmlAsDocx(htmlContent, fileName);

  trackDocumentDownload({
    fileName,
    documentTitle: `${exam.title} (Mã đề ${exam.code})`,
    category: 'de_thi_thpt',
    categoryLabel: 'Kho 48 Đề Thi Mẫu THPT',
    modeLabel: includeAnswers ? 'Đề + Đáp án & Giải thích (.docx)' : 'Đề gốc cho Học sinh (.docx)',
  });
}
