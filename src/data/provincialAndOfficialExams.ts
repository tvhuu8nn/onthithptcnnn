import {
  Exam,
  ExamChartData,
  ExamChartItem,
  ExamChartSeries,
  ExamTableCell,
  ExamTableData,
  ExamTableRow,
  GradeLevel,
  MultipleChoiceQuestion,
  ShortAnswerQuestion,
  SubjectDomain,
  TrueFalseQuestion,
  TrueFalseStatement,
} from '../types/exam';

export type ExternalExamCategory = 'provincial_mock' | 'official_past_year' | 'reference_exam';

export interface ExternalExamItem extends Exam {
  category: ExternalExamCategory;
  provinceOrSource: string; // VD: "Sở GD&ĐT Hà Nội", "Bộ Giáo dục và Đào tạo"
  schoolOrRound: string; // VD: "Thi thử Tốt nghiệp THPT Lần 1", "Đề Chính Thức Kỳ Thi TN THPT"
  examYear: number; // VD: 2025, 2026
  uploadedBy?: string; // username
  uploadedByFullName?: string; // Họ tên người tải lên
  uploadedAt?: string; // ISO string
  isUserUploaded?: boolean;
  attachedFileName?: string;
  attachedFileDataUrl?: string; // Base64 Data URL của tệp đính kèm (.docx, .pdf, .txt)
  hasAttachedOriginalFile?: boolean; // Đánh dấu tệp gốc được lưu an toàn trên server
  rawDocumentText?: string; // Lưu nguyên bản văn bản người dùng đăng lên (không tự ý chỉnh sửa)
  rawDocumentImages?: Record<string, string>; // Hình ảnh trích xuất nguyên bản cho tài liệu không phải trắc nghiệm
  rawDocumentCharts?: Record<string, ExamChartData>; // Biểu đồ trích xuất nguyên bản từ Word/Excel
  rawDocumentTables?: Record<string, ExamTableData>; // Bảng biểu cấu trúc cố định nguyên bản (colWidths, colSpan, rowSpan)
  pdfReferenceUrl?: string;
}

export interface ExtractedDocumentResult {
  text: string;
  images: Record<string, string>;
  tables?: Record<string, ExamTableData>;
  charts?: Record<string, ExamChartData>;
  pageCount?: number;
  extractedPageCount?: number;
  warnings?: string[];
}

export interface ParseReviewItem {
  part: 'I' | 'II' | 'III';
  number: number;
  originalNumber: number;
  reason: string;
  snippet: string;
  charOffset: number;
}

export interface PartReconciliationSummary {
  detectedCount: number;
  parsedCount: number;
  cleanCount: number;
  reviewCount: number;
  originalNumbers: number[];
  missingNumbers: number[];
}

export interface ExamParseDiagnostics {
  partI: PartReconciliationSummary;
  partII: PartReconciliationSummary;
  partIII: PartReconciliationSummary;
  needsReviewItems: ParseReviewItem[];
  warnings: string[];
  hasIssues: boolean;
}

export const PROVINCE_LIST = [
  'Tài liệu Giáo viên / Trường THPT chia sẻ',
  'Bộ Giáo dục và Đào tạo',
  'Sở GD&ĐT Hà Nội',
  'Sở GD&ĐT TP. Hồ Chí Minh',
  'Sở GD&ĐT Cần Thơ',
  'Sở GD&ĐT Đà Nẵng',
  'Sở GD&ĐT Hải Phòng',
  'Sở GD&ĐT Nghệ An',
  'Sở GD&ĐT Nam Định',
  'Sở GD&ĐT Ninh Bình',
  'Sở GD&ĐT An Giang',
  'Sở GD&ĐT Thanh Hóa',
  'Sở GD&ĐT Bắc Ninh',
  'Sở GD&ĐT Vĩnh Phúc',
  'Sở GD&ĐT Phú Thọ',
  'Sở GD&ĐT Thái Bình',
  'Sở GD&ĐT Bắc Giang',
  'Sở GD&ĐT Hải Dương',
  'Sở GD&ĐT Hà Tĩnh',
  'Sở GD&ĐT Quảng Ninh',
  'Sở GD&ĐT Đồng Nai',
  'Sở GD&ĐT Bình Dương',
  'Sở GD&ĐT Lâm Đồng',
  'Sở GD&ĐT Đắk Lắk',
  'Sở GD&ĐT Gia Lai',
  'Sở GD&ĐT Đồng Tháp',
  'Tỉnh / Sở GD&ĐT / Trường THPT khác',
];

/**
 * Kho đề trong thẻ Đề Thi Thử Tỉnh & Đề Chính Thức Các Năm (chỉ hiển thị các đề do người dùng tự tải lên hệ thống)
 */
export const BUILTIN_PROVINCIAL_AND_OFFICIAL_EXAMS: ExternalExamItem[] = [];

// ============================================================================
// BỘ ĐỌC ZIP CENTRAL DIRECTORY CHUẨN CHO TỆP WORD (.DOCX) TRÊN TRÌNH DUYỆT
// Hỗ trợ đầy đủ Data Descriptor (compSize = 0), numbering.xml, bảng biểu & ảnh
// ============================================================================

async function readZipEntriesFromArrayBuffer(
  arrayBuffer: ArrayBuffer
): Promise<Map<string, Uint8Array>> {
  const bytes = new Uint8Array(arrayBuffer);
  const view = new DataView(arrayBuffer);
  const result = new Map<string, Uint8Array>();

  // 1. Tìm End of Central Directory Record (0x06054b50) từ cuối tệp
  let eocdOffset = -1;
  const minEocd = Math.max(0, bytes.length - 65557);
  for (let i = bytes.length - 22; i >= minEocd; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  const decompressEntry = async (
    compMethod: number,
    compressedSlice: Uint8Array
  ): Promise<Uint8Array | null> => {
    if (compMethod === 0) {
      return compressedSlice;
    }
    if (compMethod === 8 && typeof DecompressionStream !== 'undefined') {
      const ds = new DecompressionStream('deflate-raw');
      const writer = ds.writable.getWriter();
      writer.write(compressedSlice as unknown as BufferSource).catch(() => {});
      writer.close().catch(() => {});
      const buf = await new Response(ds.readable).arrayBuffer();
      return new Uint8Array(buf);
    }
    return null;
  };

  if (eocdOffset !== -1) {
    const cdEntries = view.getUint16(eocdOffset + 10, true);
    const cdOffset = view.getUint32(eocdOffset + 16, true);
    let ptr = cdOffset;

    for (let idx = 0; idx < cdEntries && ptr + 46 <= bytes.length; idx++) {
      if (view.getUint32(ptr, true) !== 0x02014b50) break;
      const compMethod = view.getUint16(ptr + 10, true);
      const compSize = view.getUint32(ptr + 20, true);
      const nameLen = view.getUint16(ptr + 28, true);
      const extraLen = view.getUint16(ptr + 30, true);
      const commentLen = view.getUint16(ptr + 32, true);
      const localHeaderOffset = view.getUint32(ptr + 42, true);

      const entryName = new TextDecoder('utf-8').decode(
        bytes.subarray(ptr + 46, ptr + 46 + nameLen)
      );
      ptr += 46 + nameLen + extraLen + commentLen;

      const isNeeded =
        entryName === 'word/document.xml' ||
        entryName === 'word/numbering.xml' ||
        entryName === 'word/_rels/document.xml.rels' ||
        entryName.startsWith('word/media/') ||
        (entryName.startsWith('word/charts/') && entryName.toLowerCase().endsWith('.xml'));

      if (!isNeeded) continue;
      if (localHeaderOffset + 30 > bytes.length) continue;
      if (view.getUint32(localHeaderOffset, true) !== 0x04034b50) continue;

      const lNameLen = view.getUint16(localHeaderOffset + 26, true);
      const lExtraLen = view.getUint16(localHeaderOffset + 28, true);
      const dataStart = localHeaderOffset + 30 + lNameLen + lExtraLen;
      const dataEnd = Math.min(bytes.length, dataStart + compSize);
      const slice = bytes.subarray(dataStart, dataEnd);
      try {
        const out = await decompressEntry(compMethod, slice);
        if (out) result.set(entryName, out);
      } catch {
        // Bỏ qua entry lỗi nén lẻ
      }
    }
    if (result.has('word/document.xml')) {
      return result;
    }
  }

  // Fallback nếu tệp ZIP không có EOCD chuẩn
  let offset = 0;
  while (offset + 30 < bytes.length) {
    if (view.getUint32(offset, true) !== 0x04034b50) {
      offset++;
      continue;
    }
    const compMethod = view.getUint16(offset + 8, true);
    const compSize = view.getUint32(offset + 18, true);
    const nameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);
    const entryName = new TextDecoder('utf-8').decode(
      bytes.subarray(offset + 30, offset + 30 + nameLen)
    );
    const dataStart = offset + 30 + nameLen + extraLen;
    let dataEnd = dataStart + compSize;
    if (compSize === 0 || dataEnd > bytes.length) {
      dataEnd = bytes.length;
      for (let j = dataStart; j < bytes.length - 4; j++) {
        if (
          bytes[j] === 0x50 &&
          bytes[j + 1] === 0x4b &&
          ((bytes[j + 2] === 0x03 && bytes[j + 3] === 0x04) ||
            (bytes[j + 2] === 0x01 && bytes[j + 3] === 0x02))
        ) {
          dataEnd = j;
          break;
        }
      }
    }
    if (
      entryName === 'word/document.xml' ||
      entryName === 'word/numbering.xml' ||
      entryName === 'word/_rels/document.xml.rels' ||
      entryName.startsWith('word/media/') ||
      (entryName.startsWith('word/charts/') && entryName.toLowerCase().endsWith('.xml'))
    ) {
      try {
        const out = await decompressEntry(compMethod, bytes.subarray(dataStart, dataEnd));
        if (out) result.set(entryName, out);
      } catch {}
    }
    offset = compSize > 0 ? dataStart + compSize : dataEnd;
  }

  return result;
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, i + chunk);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

function guessImageMime(pathName: string): string | null {
  const lower = pathName.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.bmp')) return 'image/bmp';
  return null;
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
}

interface NumberingLevelDef {
  numFmt: string;
  lvlText: string;
  start: number;
}

function formatNumberingValue(val: number, fmt: string): string {
  if (val <= 0) return String(val);
  switch (fmt) {
    case 'upperLetter': {
      let n = val;
      let s = '';
      while (n > 0) {
        n--;
        s = String.fromCharCode(65 + (n % 26)) + s;
        n = Math.floor(n / 26);
      }
      return s;
    }
    case 'lowerLetter': {
      let n = val;
      let s = '';
      while (n > 0) {
        n--;
        s = String.fromCharCode(97 + (n % 26)) + s;
        n = Math.floor(n / 26);
      }
      return s;
    }
    case 'upperRoman':
    case 'lowerRoman': {
      const map: [number, string][] = [
        [1000, 'M'],
        [900, 'CM'],
        [500, 'D'],
        [400, 'CD'],
        [100, 'C'],
        [90, 'XC'],
        [50, 'L'],
        [40, 'XL'],
        [10, 'X'],
        [9, 'IX'],
        [5, 'V'],
        [4, 'IV'],
        [1, 'I'],
      ];
      let n = val;
      let out = '';
      for (const [v, sym] of map) {
        while (n >= v) {
          out += sym;
          n -= v;
        }
      }
      return fmt === 'lowerRoman' ? out.toLowerCase() : out;
    }
    case 'bullet':
      return '•';
    case 'none':
      return '';
    default:
      return String(val);
  }
}

function parseWordNumberingXml(numberingXml?: string): {
  getPrefix: (numId: string, ilvl: number) => string;
} {
  const abstractLevels = new Map<string, Map<number, NumberingLevelDef>>();
  const numToAbstract = new Map<string, string>();
  const numStartOverrides = new Map<string, Map<number, number>>();

  if (numberingXml) {
    const absRegex = /<w:abstractNum\b[^>]*w:abstractNumId="([^"]+)"[^>]*>([\s\S]*?)<\/w:abstractNum>/g;
    let absM: RegExpExecArray | null;
    while ((absM = absRegex.exec(numberingXml)) !== null) {
      const absId = absM[1];
      const absBody = absM[2];
      const lvlMap = new Map<number, NumberingLevelDef>();
      const lvlRegex = /<w:lvl\b[^>]*w:ilvl="(\d+)"[^>]*>([\s\S]*?)<\/w:lvl>/g;
      let lvlM: RegExpExecArray | null;
      while ((lvlM = lvlRegex.exec(absBody)) !== null) {
        const ilvl = parseInt(lvlM[1], 10);
        const lvlBody = lvlM[2];
        const fmtMatch = lvlBody.match(/<w:numFmt\b[^>]*w:val="([^"]+)"/);
        const txtMatch = lvlBody.match(/<w:lvlText\b[^>]*w:val="([^"]*)"/);
        const startMatch = lvlBody.match(/<w:start\b[^>]*w:val="(\d+)"/);
        lvlMap.set(ilvl, {
          numFmt: fmtMatch ? fmtMatch[1] : 'decimal',
          lvlText: txtMatch ? decodeXmlEntities(txtMatch[1]) : `%${ilvl + 1}.`,
          start: startMatch ? parseInt(startMatch[1], 10) : 1,
        });
      }
      abstractLevels.set(absId, lvlMap);
    }

    const numRegex = /<w:num\b[^>]*w:numId="([^"]+)"[^>]*>([\s\S]*?)<\/w:num>/g;
    let numM: RegExpExecArray | null;
    while ((numM = numRegex.exec(numberingXml)) !== null) {
      const numId = numM[1];
      const numBody = numM[2];
      const refMatch = numBody.match(/<w:abstractNumId\b[^>]*w:val="([^"]+)"/);
      if (refMatch) {
        numToAbstract.set(numId, refMatch[1]);
      }
      const ovRegex = /<w:lvlOverride\b[^>]*w:ilvl="(\d+)"[^>]*>([\s\S]*?)<\/w:lvlOverride>/g;
      let ovM: RegExpExecArray | null;
      while ((ovM = ovRegex.exec(numBody)) !== null) {
        const ilvl = parseInt(ovM[1], 10);
        const stM = ovM[2].match(/<w:startOverride\b[^>]*w:val="(\d+)"/);
        if (stM) {
          if (!numStartOverrides.has(numId)) numStartOverrides.set(numId, new Map());
          numStartOverrides.get(numId)!.set(ilvl, parseInt(stM[1], 10));
        }
      }
    }
  }

  const counters = new Map<string, Map<number, number>>();

  return {
    getPrefix(numId: string, ilvl: number): string {
      const absId = numToAbstract.get(numId);
      if (!absId) return '';
      const lvlMap = abstractLevels.get(absId);
      if (!lvlMap) return '';
      const def = lvlMap.get(ilvl);
      if (!def || def.numFmt === 'none') return '';
      if (def.numFmt === 'bullet') return '';

      if (!counters.has(numId)) counters.set(numId, new Map());
      const numCounters = counters.get(numId)!;

      // Reset tất cả cấp sâu hơn khi cấp hiện tại tăng
      for (const existingLvl of Array.from(numCounters.keys())) {
        if (existingLvl > ilvl) numCounters.delete(existingLvl);
      }

      const startVal = numStartOverrides.get(numId)?.get(ilvl) ?? def.start;
      const cur = numCounters.has(ilvl) ? numCounters.get(ilvl)! + 1 : startVal;
      numCounters.set(ilvl, cur);

      let formatted = def.lvlText || `%${ilvl + 1}.`;
      formatted = formatted.replace(/%(\d+)/g, (_, idxStr) => {
        const refLvl = parseInt(idxStr, 10) - 1;
        const refDef = lvlMap.get(refLvl);
        const refVal =
          numCounters.get(refLvl) ??
          numStartOverrides.get(numId)?.get(refLvl) ??
          refDef?.start ??
          1;
        return formatNumberingValue(refVal, refDef?.numFmt || 'decimal');
      });
      return formatted ? `${formatted} ` : '';
    },
  };
}

function parseWordRelsXml(relsXml?: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!relsXml) return map;
  const relRegex = /<Relationship\b[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = relRegex.exec(relsXml)) !== null) {
    const tag = m[0];
    const idM = tag.match(/\bId="([^"]+)"/);
    const targetM = tag.match(/\bTarget="([^"]+)"/);
    if (idM && targetM) {
      const normalizedTarget = targetM[1]
        .replace(/^(\.\.\/)+/, '')
        .replace(/^\/+/, '')
        .replace(/^word\//, '');
      map.set(idM[1], `word/${normalizedTarget}`);
    }
  }
  return map;
}

const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '−': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ', g: 'ᵍ', h: 'ʰ', i: 'ⁱ', j: 'ʲ',
  k: 'ᵏ', l: 'ˡ', m: 'ᵐ', n: 'ⁿ', o: 'ᵒ', p: 'ᵖ', r: 'ʳ', s: 'ˢ', t: 'ᵗ', u: 'ᵘ',
  v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ',
};

const SUBSCRIPT_MAP: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '−': '₋', '=': '₌', '(': '₍', ')': '₎',
  a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', o: 'ₒ',
  p: 'ₚ', r: 'ᵣ', s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ',
};

function toUnicodeSuperscript(text: string): string {
  return Array.from(text)
    .map((ch) => SUPERSCRIPT_MAP[ch] ?? ch)
    .join('');
}

function toUnicodeSubscript(text: string): string {
  return Array.from(text)
    .map((ch) => SUBSCRIPT_MAP[ch] ?? ch)
    .join('');
}

function resolveAlternateContentXml(xml: string): string {
  if (!xml.includes('<mc:AlternateContent')) return xml;
  return xml.replace(/<mc:AlternateContent\b[^>]*>([\s\S]*?)<\/mc:AlternateContent>/g, (_m, inner) => {
    const choice = inner.match(/<mc:Choice\b[^>]*>([\s\S]*?)<\/mc:Choice>/);
    if (choice) return choice[1];
    const fallback = inner.match(/<mc:Fallback\b[^>]*>([\s\S]*?)<\/mc:Fallback>/);
    return fallback ? fallback[1] : '';
  });
}

function extractWordMathText(mathXml: string): string {
  const wrapMathText = (val: string) =>
    `<m:t>${val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</m:t>`;
  let working = mathXml;
  // Xử lý phân số <m:f><m:num>...</m:num><m:den>...</m:den></m:f>
  working = working.replace(
    /<m:f\b[^>]*>[\s\S]*?<m:num\b[^>]*>([\s\S]*?)<\/m:num>[\s\S]*?<m:den\b[^>]*>([\s\S]*?)<\/m:den>[\s\S]*?<\/m:f>/g,
    (_m, numXml, denXml) => {
      const n = extractWordMathText(numXml).trim();
      const d = extractWordMathText(denXml).trim();
      return wrapMathText(n && d ? `(${n})/(${d})` : `${n}${d}`);
    }
  );
  // Xử lý chỉ số trên/dưới đồng thời <m:sSubSup>
  working = working.replace(
    /<m:sSubSup\b[^>]*>[\s\S]*?<m:e\b[^>]*>([\s\S]*?)<\/m:e>[\s\S]*?<m:sub\b[^>]*>([\s\S]*?)<\/m:sub>[\s\S]*?<m:sup\b[^>]*>([\s\S]*?)<\/m:sup>[\s\S]*?<\/m:sSubSup>/g,
    (_m, baseXml, subXml, supXml) =>
      wrapMathText(
        `${extractWordMathText(baseXml)}${toUnicodeSubscript(extractWordMathText(subXml))}${toUnicodeSuperscript(extractWordMathText(supXml))}`
      )
  );
  // Xử lý chỉ số trên <m:sSup>
  working = working.replace(
    /<m:sSup\b[^>]*>[\s\S]*?<m:e\b[^>]*>([\s\S]*?)<\/m:e>[\s\S]*?<m:sup\b[^>]*>([\s\S]*?)<\/m:sup>[\s\S]*?<\/m:sSup>/g,
    (_m, baseXml, supXml) =>
      wrapMathText(
        `${extractWordMathText(baseXml)}${toUnicodeSuperscript(extractWordMathText(supXml))}`
      )
  );
  // Xử lý chỉ số dưới <m:sSub>
  working = working.replace(
    /<m:sSub\b[^>]*>[\s\S]*?<m:e\b[^>]*>([\s\S]*?)<\/m:e>[\s\S]*?<m:sub\b[^>]*>([\s\S]*?)<\/m:sub>[\s\S]*?<\/m:sSub>/g,
    (_m, baseXml, subXml) =>
      wrapMathText(
        `${extractWordMathText(baseXml)}${toUnicodeSubscript(extractWordMathText(subXml))}`
      )
  );

  let out = '';
  const tRe = /<(?:m:t|w:t)\b[^>]*>([\s\S]*?)<\/(?:m:t|w:t)>/g;
  let tm: RegExpExecArray | null;
  while ((tm = tRe.exec(working)) !== null) {
    out += decodeXmlEntities(tm[1]);
  }
  return out;
}

function extractChartTextNodes(xmlFragment: string): string {
  const parts: string[] = [];
  const re = /<(?:a:t|c:v|w:t)\b[^>]*>([\s\S]*?)<\/(?:a:t|c:v|w:t)>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xmlFragment)) !== null) {
    const t = decodeXmlEntities(m[1]).trim();
    if (t) parts.push(t);
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function parseChartIndexedPoints(cacheXml: string): Map<number, string> {
  const map = new Map<number, string>();
  const ptRe = /<c:pt\b[^>]*idx="(\d+)"[^>]*>([\s\S]*?)<\/c:pt>/g;
  let pm: RegExpExecArray | null;
  while ((pm = ptRe.exec(cacheXml)) !== null) {
    const idx = parseInt(pm[1], 10);
    const vM = pm[2].match(/<c:v\b[^>]*>([\s\S]*?)<\/c:v>/);
    if (vM) {
      map.set(idx, decodeXmlEntities(vM[1]).trim());
    }
  }
  return map;
}

function parseChartNumericValue(raw: string): { num: number | null; display: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { num: null, display: '' };
  const cleaned = trimmed.replace(/\s+/g, '').replace(',', '.');
  const num = Number(cleaned);
  if (Number.isFinite(num)) {
    // Giữ nguyên định dạng hiển thị gọn gàng không làm sai số gốc
    const display = Number.isInteger(num)
      ? String(num)
      : String(Number(num.toFixed(6))).replace('.', ',');
    return { num, display };
  }
  return { num: null, display: trimmed };
}

/**
 * Trích xuất nguyên bản biểu đồ gốc nhúng trong tệp Word (.docx: word/charts/chart*.xml)
 * Hỗ trợ đầy đủ: biểu đồ cột dọc/ngang, cột nhóm nhiều chuỗi, biểu đồ đường, miền, biểu đồ tròn.
 */
export function parseWordChartXml(chartXml: string): ExamChartData | null {
  if (!chartXml || !chartXml.includes('<c:ser')) return null;

  // 1. Tiêu đề biểu đồ (nằm trong <c:chart> trước <c:plotArea>)
  let caption: string | undefined;
  const plotAreaIdx = chartXml.indexOf('<c:plotArea');
  const headerRegion = plotAreaIdx !== -1 ? chartXml.slice(0, plotAreaIdx) : chartXml;
  const titleMatch = headerRegion.match(/<c:title\b[^>]*>([\s\S]*?)<\/c:title>/);
  if (titleMatch) {
    const t = extractChartTextNodes(titleMatch[1]);
    if (t) caption = t;
  }

  // 2. Xác định loại biểu đồ gốc
  let chartType: ExamChartData['type'] = 'column';
  if (/<c:(?:pieChart|pie3DChart|doughnutChart|ofPieChart)\b/.test(chartXml)) {
    chartType = 'pie';
  } else if (/<c:(?:lineChart|line3DChart|scatterChart)\b/.test(chartXml)) {
    chartType = 'line';
  } else if (/<c:(?:areaChart|area3DChart)\b/.test(chartXml)) {
    chartType = 'area';
  } else if (/<c:(?:barChart|bar3DChart)\b/.test(chartXml)) {
    const barDirM = chartXml.match(/<c:barDir\b[^>]*val="([^"]+)"/i);
    chartType = barDirM && barDirM[1].toLowerCase() === 'bar' ? 'bar' : 'column';
  }

  // 3. Đơn vị từ tiêu đề trục giá trị (<c:valAx><c:title>)
  let unit = '';
  const valAxRe = /<c:valAx\b[^>]*>([\s\S]*?)<\/c:valAx>/g;
  let vm: RegExpExecArray | null;
  while ((vm = valAxRe.exec(chartXml)) !== null) {
    const axTitleM = vm[1].match(/<c:title\b[^>]*>([\s\S]*?)<\/c:title>/);
    if (axTitleM) {
      const ut = extractChartTextNodes(axTitleM[1]);
      if (ut) {
        unit = ut;
        break;
      }
    }
  }

  // 4. Trích xuất toàn bộ các chuỗi <c:ser> theo đúng thứ tự chỉ mục
  const serBlocks = extractDirectChildBlocks(chartXml, 'c:ser');
  if (serBlocks.length === 0) return null;

  const categoryMap = new Map<number, string>();
  const rawSeriesList: {
    name: string;
    valMap: Map<number, string>;
    maxIdx: number;
  }[] = [];

  for (let sIdx = 0; sIdx < serBlocks.length; sIdx++) {
    const serXml = serBlocks[sIdx];

    // Tên chuỗi (<c:tx>)
    let serName = '';
    const txM = serXml.match(/<c:tx\b[^>]*>([\s\S]*?)<\/c:tx>/);
    if (txM) {
      const strCacheM = txM[1].match(/<c:strCache\b[^>]*>([\s\S]*?)<\/c:strCache>/);
      if (strCacheM) {
        const pts = parseChartIndexedPoints(strCacheM[1]);
        serName = Array.from(pts.values()).join(' ').trim();
      } else {
        const directV = txM[1].match(/<c:v\b[^>]*>([\s\S]*?)<\/c:v>/);
        if (directV) serName = decodeXmlEntities(directV[1]).trim();
      }
    }

    // Nhãn danh mục (<c:cat> hoặc <c:xVal>)
    const catM =
      serXml.match(/<c:cat\b[^>]*>([\s\S]*?)<\/c:cat>/) ||
      serXml.match(/<c:xVal\b[^>]*>([\s\S]*?)<\/c:xVal>/);
    if (catM) {
      const multiLvlM = catM[1].match(/<c:multiLvlStrCache\b[^>]*>([\s\S]*?)<\/c:multiLvlStrCache>/);
      if (multiLvlM) {
        const lvlBlocks = extractDirectChildBlocks(multiLvlM[1], 'c:lvl');
        const perIdxParts = new Map<number, string[]>();
        for (const lvlXml of lvlBlocks) {
          const pts = parseChartIndexedPoints(lvlXml);
          pts.forEach((v, k) => {
            if (!perIdxParts.has(k)) perIdxParts.set(k, []);
            perIdxParts.get(k)!.push(v);
          });
        }
        perIdxParts.forEach((parts, k) => {
          if (!categoryMap.has(k)) categoryMap.set(k, parts.filter(Boolean).join(' - '));
        });
      } else {
        const cacheM =
          catM[1].match(/<c:strCache\b[^>]*>([\s\S]*?)<\/c:strCache>/) ||
          catM[1].match(/<c:numCache\b[^>]*>([\s\S]*?)<\/c:numCache>/) ||
          catM[1].match(/<c:strLit\b[^>]*>([\s\S]*?)<\/c:strLit>/) ||
          catM[1].match(/<c:numLit\b[^>]*>([\s\S]*?)<\/c:numLit>/);
        if (cacheM) {
          const pts = parseChartIndexedPoints(cacheM[1]);
          pts.forEach((v, k) => {
            if (!categoryMap.has(k)) categoryMap.set(k, v);
          });
        }
      }
    }

    // Giá trị số liệu (<c:val> hoặc <c:yVal>)
    const valM =
      serXml.match(/<c:val\b[^>]*>([\s\S]*?)<\/c:val>/) ||
      serXml.match(/<c:yVal\b[^>]*>([\s\S]*?)<\/c:yVal>/);
    const valMap = new Map<number, string>();
    if (valM) {
      const numCacheM =
        valM[1].match(/<c:numCache\b[^>]*>([\s\S]*?)<\/c:numCache>/) ||
        valM[1].match(/<c:numLit\b[^>]*>([\s\S]*?)<\/c:numLit>/);
      if (numCacheM) {
        const pts = parseChartIndexedPoints(numCacheM[1]);
        pts.forEach((v, k) => valMap.set(k, v));
      }
    }

    if (valMap.size > 0) {
      const maxIdx = Math.max(...Array.from(valMap.keys()), 0);
      rawSeriesList.push({
        name: serName || (serBlocks.length === 1 ? caption || 'Giá trị' : `Chuỗi ${sIdx + 1}`),
        valMap,
        maxIdx,
      });
    }
  }

  if (rawSeriesList.length === 0) return null;

  const allIdxSet = new Set<number>();
  categoryMap.forEach((_v, k) => allIdxSet.add(k));
  rawSeriesList.forEach((s) => s.valMap.forEach((_v, k) => allIdxSet.add(k)));
  const sortedIndices = Array.from(allIdxSet).sort((a, b) => a - b);
  if (sortedIndices.length === 0) return null;

  const categories = sortedIndices.map((idx, pos) => categoryMap.get(idx) || `Mục ${pos + 1}`);
  const series: ExamChartSeries[] = rawSeriesList.map((rs) => {
    const values: (number | null)[] = [];
    const displayValues: string[] = [];
    for (const idx of sortedIndices) {
      const raw = rs.valMap.get(idx);
      if (raw === undefined) {
        values.push(null);
        displayValues.push('');
      } else {
        const parsed = parseChartNumericValue(raw);
        values.push(parsed.num);
        displayValues.push(parsed.display);
      }
    }
    return {
      name: rs.name,
      values,
      displayValues,
    };
  });

  const firstSer = series[0];
  const items: ExamChartItem[] = categories.map((label, idx) => ({
    label,
    value: typeof firstSer.values[idx] === 'number' ? (firstSer.values[idx] as number) : 0,
    displayValue: firstSer.displayValues?.[idx] || undefined,
  }));

  return {
    ...(caption ? { caption } : {}),
    type: chartType,
    unit,
    items,
    categories,
    series,
  };
}

function isGenuineOptionLayoutTable(expandedRows: string[][]): boolean {
  const flatCells = expandedRows.flat().map((c) => c.trim()).filter(Boolean);
  if (flatCells.length < 2 || flatCells.length > 4) return false;
  const matchedLetters = new Set<string>();
  for (const cell of flatCells) {
    const m = cell.match(/^\*?\s*([ABCD])\s*\*?\s*[.):]\s+\S/);
    if (!m) return false;
    matchedLetters.add(m[1]);
  }
  return matchedLetters.size === flatCells.length;
}

function hasAnswerHighlightInRunPr(rPr: string): boolean {
  const hasUnderline = /<w:u\b(?![^>]*w:val="none")/.test(rPr);
  const hasHighlight = /<w:highlight\b(?![^>]*w:val="none")/.test(rPr);
  const colorMatch = rPr.match(/<w:color\b[^>]*w:val="([^"]+)"/i);
  const colorVal = colorMatch ? colorMatch[1].toUpperCase() : '';
  const hasSpecialColor =
    Boolean(colorVal) &&
    colorVal !== '000000' &&
    colorVal !== 'AUTO' &&
    colorVal !== '111111' &&
    colorVal !== '222222' &&
    colorVal !== '333333' &&
    colorVal !== 'FFFFFF';
  return hasUnderline || hasHighlight || hasSpecialColor;
}

export function convertWordXmlToStructuredContent(
  xml: string,
  options?: {
    numberingXml?: string;
    relsXml?: string;
    mediaDataUrls?: Map<string, string>;
    chartXmlMap?: Map<string, string>;
  }
): ExtractedDocumentResult {
  const images: Record<string, string> = {};
  const tables: Record<string, ExamTableData> = {};
  const charts: Record<string, ExamChartData> = {};
  let imgCounter = 0;
  let tblCounter = 0;
  let chartCounter = 0;
  const relsMap = parseWordRelsXml(options?.relsXml);
  const numbering = parseWordNumberingXml(options?.numberingXml);
  const mediaMap = options?.mediaDataUrls || new Map<string, string>();
  const chartXmlMap = options?.chartXmlMap || new Map<string, string>();

  const extractParagraphText = (pXml: string, depth = 0): string => {
    let prefix = '';
    const numPrMatch = pXml.match(/<w:numPr>([\s\S]*?)<\/w:numPr>/);
    if (numPrMatch) {
      const ilvlM = numPrMatch[1].match(/<w:ilvl\b[^>]*w:val="(\d+)"/);
      const numIdM = numPrMatch[1].match(/<w:numId\b[^>]*w:val="([^"]+)"/);
      if (numIdM && numIdM[1] !== '0') {
        prefix = numbering.getPrefix(numIdM[1], ilvlM ? parseInt(ilvlM[1], 10) : 0);
      }
    }

    // Khử trùng lặp <mc:AlternateContent> (chỉ giữ <mc:Choice> hoặc <mc:Fallback>)
    const normalizedPXml = resolveAlternateContentXml(pXml);

    // Trích xuất theo đúng thứ tự xuất hiện: <w:r> và <m:oMath> (công thức Toán/Hóa trong ô bảng hoặc câu hỏi)
    interface RunPiece {
      text: string;
      marked: boolean;
    }
    const pieces: RunPiece[] = [];
    const appendPiece = (text: string, marked: boolean) => {
      if (!text) return;
      if (pieces.length > 0 && pieces[pieces.length - 1].marked === marked) {
        pieces[pieces.length - 1].text += text;
      } else {
        pieces.push({ text, marked });
      }
    };

    const childBlockRegex =
      /<m:oMath\b[^>]*>[\s\S]*?<\/m:oMath>|<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g;
    let rm: RegExpExecArray | null;
    while ((rm = childBlockRegex.exec(normalizedPXml)) !== null) {
      const fullMatch = rm[0];
      if (fullMatch.startsWith('<m:oMath')) {
        const mathText = extractWordMathText(fullMatch);
        if (mathText) appendPiece(mathText, false);
        continue;
      }

      const inner = rm[1] || '';
      const rPrM = inner.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/);
      const rPr = rPrM ? rPrM[1] : '';
      const marked = rPr ? hasAnswerHighlightInRunPr(rPr) : false;
      const vertAlignM = rPr.match(/<w:vertAlign\b[^>]*w:val="(superscript|subscript)"/i);
      const vertAlign = vertAlignM ? vertAlignM[1].toLowerCase() : null;

      // 1. Tìm biểu đồ gốc (<c:chart r:id="..."/>) và ảnh nhúng (r:embed / r:id / o:relid) không trùng lặp
      const assetTokens: string[] = [];
      const seenRIds = new Set<string>();
      const chartRefRegex = /<c:chart\b[^>]*r:id="([^"]+)"/g;
      let cm: RegExpExecArray | null;
      while ((cm = chartRefRegex.exec(inner)) !== null) {
        const rId = cm[1];
        if (seenRIds.has(`chart:${rId}`)) continue;
        seenRIds.add(`chart:${rId}`);
        const targetPath = relsMap.get(rId);
        if (targetPath && chartXmlMap.has(targetPath)) {
          const parsedChart = parseWordChartXml(chartXmlMap.get(targetPath)!);
          if (parsedChart) {
            chartCounter += 1;
            const chartKey = `chart_${chartCounter}`;
            charts[chartKey] = parsedChart;
            assetTokens.push(`[[CHART:${chartKey}]]`);
          }
        }
      }

      const blipRegex = /(?:r:embed|r:id|o:relid)="([^"]+)"/g;
      let bm: RegExpExecArray | null;
      while ((bm = blipRegex.exec(inner)) !== null) {
        const rId = bm[1];
        if (seenRIds.has(`img:${rId}`)) continue;
        seenRIds.add(`img:${rId}`);
        const targetPath = relsMap.get(rId);
        if (targetPath && mediaMap.has(targetPath)) {
          imgCounter += 1;
          const imgKey = `img_${imgCounter}`;
          images[imgKey] = mediaMap.get(targetPath)!;
          assetTokens.push(`[[IMG:${imgKey}]]`);
        }
      }

      // 2. Trích xuất văn bản trong TextBox (<w:txbxContent>) nếu có thay vì xóa trắng
      const txbxTexts: string[] = [];
      if (depth < 2 && inner.includes('<w:txbxContent')) {
        const txbxBlocks = extractDirectChildBlocks(inner, 'w:txbxContent');
        for (const txbxXml of txbxBlocks) {
          const innerPs = extractDirectChildBlocks(txbxXml, 'w:p');
          for (const innerP of innerPs) {
            const txt = extractParagraphText(innerP, depth + 1).trim();
            if (txt) txbxTexts.push(txt);
          }
        }
      }

      // 3. Loại bỏ thẻ hình vẽ sau khi đã trích xuất ảnh, biểu đồ và nội dung TextBox
      const cleanInner = inner
        .replace(/<w:drawing[\s\S]*?<\/w:drawing>/g, '')
        .replace(/<w:pict[\s\S]*?<\/w:pict>/g, '')
        .replace(/<w:rPr[\s\S]*?<\/w:rPr>/g, '');

      // 4. Trích xuất văn bản <w:t>, <w:tab/>, <w:br/>
      let runText = '';
      const tokenRegex = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>|<w:tab\b[^>]*\/>|<w:br\b[^>]*\/>|<w:cr\b[^>]*\/>/g;
      let tm: RegExpExecArray | null;
      while ((tm = tokenRegex.exec(cleanInner)) !== null) {
        if (tm[1] !== undefined) {
          const decoded = decodeXmlEntities(tm[1]);
          if (vertAlign === 'superscript') runText += toUnicodeSuperscript(decoded);
          else if (vertAlign === 'subscript') runText += toUnicodeSubscript(decoded);
          else runText += decoded;
        } else if (tm[0].startsWith('<w:tab')) {
          runText += '\t';
        } else {
          runText += '\n';
        }
      }

      if (txbxTexts.length > 0) {
        runText = (runText ? `${runText}\n` : '') + txbxTexts.join('\n');
      }
      if (assetTokens.length > 0) {
        runText = (runText ? `${runText}\n` : '') + assetTokens.join('\n');
      }

      appendPiece(runText, marked);
    }

    // Gắn dấu * cho phương án được gạch chân/tô màu (hỗ trợ cả trường hợp A và dấu . nằm tách ở 2 run liên tiếp)
    let out = prefix;
    const prefixHasOption = /^\s*([ABCDabcdđ])\s*[.)]\s*$/.test(prefix);
    if (prefixHasOption && pieces.length > 0 && pieces[0].marked && !prefix.includes('*')) {
      out = `*${prefix}`;
    }

    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      let t = piece.text;
      if (piece.marked) {
        const nextText = pieces[i + 1]?.text || '';
        const prevEndsWithStar = /\*\s*$/.test(out);
        if (/(?:^|[\s\t])([ABCDabcdđ])\s*[.)]/.test(t) && !prevEndsWithStar) {
          t = t.replace(/(^|[\s\t])(?!\*)([ABCDabcdđ]\s*[.)])/g, '$1*$2');
        } else if (
          !prevEndsWithStar &&
          /^\s*([ABCDabcdđ])\s*$/.test(t) &&
          /^\s*[.)]/.test(nextText) &&
          (out === '' || /[\s\t]$/.test(out))
        ) {
          t = t.replace(/([ABCDabcdđ])/, '*$1');
        }
      }
      out += t;
    }

    return out.replace(/\r/g, '').trimEnd();
  };

  // Trích xuất phần <w:body> để đi theo đúng thứ tự các khối <w:p> và <w:tbl>
  const bodyMatch = xml.match(/<w:body\b[^>]*>([\s\S]*?)<\/w:body>/);
  const bodyXml = bodyMatch ? bodyMatch[1] : xml;

  const lines: string[] = [];
  let cursor = 0;
  while (cursor < bodyXml.length) {
    const nextP = bodyXml.indexOf('<w:p', cursor);
    const nextTbl = bodyXml.indexOf('<w:tbl', cursor);

    const validP =
      nextP !== -1 && (bodyXml[nextP + 4] === '>' || bodyXml[nextP + 4] === ' ' || bodyXml[nextP + 4] === '/');
    const validTbl =
      nextTbl !== -1 &&
      (bodyXml[nextTbl + 6] === '>' || bodyXml[nextTbl + 6] === ' ' || bodyXml[nextTbl + 6] === '/');

    if (nextP === -1 && nextTbl === -1) break;

    if (nextTbl !== -1 && (!validP || nextTbl < nextP) && validTbl) {
      let depth = 1;
      let scan = nextTbl + 6;
      while (depth > 0 && scan < bodyXml.length) {
        const openIdx = bodyXml.indexOf('<w:tbl', scan);
        const closeIdx = bodyXml.indexOf('</w:tbl>', scan);
        if (closeIdx === -1) {
          scan = bodyXml.length;
          break;
        }
        if (
          openIdx !== -1 &&
          openIdx < closeIdx &&
          (bodyXml[openIdx + 6] === '>' || bodyXml[openIdx + 6] === ' ')
        ) {
          depth++;
          scan = openIdx + 6;
        } else {
          depth--;
          scan = closeIdx + 8;
        }
      }
      const tblXml = bodyXml.slice(nextTbl, scan);
      cursor = scan;

      // Parse bảng Word đầy đủ: hỗ trợ độ rộng cột (<w:tblGrid>), gộp cột (<w:gridSpan>), gộp dòng (<w:vMerge>) và căn lề (<w:jc>)
      const parsedWordTable = parseWordTableElement(tblXml, extractParagraphText);
      if (parsedWordTable && parsedWordTable.expandedRows.length > 0) {
        const looksLikeOptionLayoutTable = isGenuineOptionLayoutTable(parsedWordTable.expandedRows);

        if (looksLikeOptionLayoutTable) {
          parsedWordTable.expandedRows.flat().filter(Boolean).forEach((cell) => lines.push(cell));
        } else if (parsedWordTable.expandedRows.length >= 2 && parsedWordTable.colCount >= 2) {
          tblCounter += 1;
          const tblKey = `tbl_${tblCounter}`;
          tables[tblKey] = parsedWordTable.tableData;

          const colCount = parsedWordTable.colCount;
          const escapeCellForMd = (val: string) =>
            val.replace(/\|/g, '&#124;').replace(/\r?\n/g, ' <br> ').replace(/\s+/g, ' ').trim();
          const padRow = (r: string[]) => {
            const copy = [...r];
            while (copy.length < colCount) copy.push('');
            return `| ${copy.map(escapeCellForMd).join(' | ')} |`;
          };
          if (lines.length > 0 && lines[lines.length - 1] !== '') lines.push('');
          lines.push(padRow(parsedWordTable.expandedRows[0]));
          lines.push(`| ${Array(colCount).fill('---').join(' | ')} |`);
          for (let r = 1; r < parsedWordTable.expandedRows.length; r++) {
            lines.push(padRow(parsedWordTable.expandedRows[r]));
          }
          lines.push('');
        } else {
          parsedWordTable.expandedRows.forEach((r) => lines.push(r.join('\t')));
        }
      }
      continue;
    }

    if (nextP !== -1) {
      if (!validP) {
        cursor = nextP + 4;
        continue;
      }
      const closeP = bodyXml.indexOf('</w:p>', nextP);
      const selfClose = bodyXml.indexOf('/>', nextP);
      const tagEnd = bodyXml.indexOf('>', nextP);
      if (selfClose !== -1 && selfClose + 1 === tagEnd) {
        cursor = tagEnd + 1;
        continue;
      }
      if (closeP === -1) break;
      const pXml = bodyXml.slice(nextP, closeP + 6);
      cursor = closeP + 6;
      const text = extractParagraphText(pXml);
      if (text.trim().length > 0) {
        lines.push(text);
      }
    } else {
      cursor = nextTbl + 6;
    }
  }

  return {
    text: lines
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim(),
    images,
    tables,
    charts,
  };
}

export function convertWordXmlToPlainText(xml: string): string {
  return convertWordXmlToStructuredContent(xml).text;
}

/**
 * Giải nén và trích xuất đầy đủ nội dung (văn bản, tự động đánh số, bảng biểu, biểu đồ, hình ảnh)
 * từ tệp Word (.docx) ngay trên trình duyệt, có dự phòng qua server /api/parse-docx
 */
export async function extractStructuredFromDocxFile(
  file: File,
  dataUrlFallback?: string
): Promise<ExtractedDocumentResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const entries = await readZipEntriesFromArrayBuffer(arrayBuffer);
    const docBytes = entries.get('word/document.xml');
    if (docBytes) {
      const decoder = new TextDecoder('utf-8');
      const docXml = decoder.decode(docBytes);
      const numberingBytes = entries.get('word/numbering.xml');
      const relsBytes = entries.get('word/_rels/document.xml.rels');

      const mediaDataUrls = new Map<string, string>();
      const chartXmlMap = new Map<string, string>();
      for (const [entryName, data] of entries.entries()) {
        if (entryName.startsWith('word/media/')) {
          const mime = guessImageMime(entryName);
          if (mime && data.length <= 4 * 1024 * 1024) {
            mediaDataUrls.set(entryName, `data:${mime};base64,${uint8ToBase64(data)}`);
          }
        } else if (entryName.startsWith('word/charts/') && entryName.toLowerCase().endsWith('.xml')) {
          chartXmlMap.set(entryName, decoder.decode(data));
        }
      }

      const extracted = convertWordXmlToStructuredContent(docXml, {
        numberingXml: numberingBytes ? decoder.decode(numberingBytes) : undefined,
        relsXml: relsBytes ? decoder.decode(relsBytes) : undefined,
        mediaDataUrls,
        chartXmlMap,
      });

      if (extracted.text) {
        return extracted;
      }
    }
  } catch {
    // Fallback xuống server bên dưới nếu trình duyệt không giải nén được
  }

  if (dataUrlFallback) {
    try {
      const res = await fetch('/api/parse-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl: dataUrlFallback }),
      });
      if (res.ok) {
        const payload = await res.json();
        if (payload?.success && typeof payload.text === 'string') {
          return {
            text: payload.text,
            images: payload.images && typeof payload.images === 'object' ? payload.images : {},
            tables: payload.tables && typeof payload.tables === 'object' ? payload.tables : undefined,
            charts: payload.charts && typeof payload.charts === 'object' ? payload.charts : undefined,
          };
        }
      }
    } catch {}
  }

  return { text: '', images: {} };
}

export async function extractTextFromDocxFile(
  file: File,
  dataUrlFallback?: string
): Promise<string> {
  const res = await extractStructuredFromDocxFile(file, dataUrlFallback);
  return res.text;
}

/**
 * Trích xuất văn bản, bảng biểu và hình ảnh nguyên bản từ tệp PDF qua máy chủ /api/parse-pdf
 */
export async function extractStructuredFromPdfFile(
  dataUrl: string
): Promise<ExtractedDocumentResult> {
  if (!dataUrl) return { text: '', images: {} };
  try {
    const res = await fetch('/api/parse-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl }),
    });
    if (res.ok) {
      const payload = await res.json();
      if (payload?.success && typeof payload.text === 'string') {
        return {
          text: payload.text,
          images: payload.images && typeof payload.images === 'object' ? payload.images : {},
          tables: payload.tables && typeof payload.tables === 'object' ? payload.tables : undefined,
          charts: payload.charts && typeof payload.charts === 'object' ? payload.charts : undefined,
          pageCount: typeof payload.pageCount === 'number' ? payload.pageCount : undefined,
          extractedPageCount:
            typeof payload.extractedPageCount === 'number' ? payload.extractedPageCount : undefined,
          warnings: Array.isArray(payload.warnings) ? payload.warnings : undefined,
        };
      }
    }
  } catch {}
  return { text: '', images: {} };
}

// ============================================================================
// BỘ PHÂN TÍCH CÂU HỎI NGUYÊN BẢN (100% GIỮ NGUYÊN NỘI DUNG NGƯỜI DÙNG)
// TUYỆT ĐỐI KHÔNG TỰ Ý THÊM, ĐỔI HOẶC THAY THẾ BẰNG CÂU HỎI NGẪU NHIÊN!
// ============================================================================

function inferDomainAndGrade(text: string): { domain: SubjectDomain; grade: GradeLevel } {
  const lower = text.toLowerCase();
  if (
    /\b(đất trồng|phân bón|giá thể|cây trồng|trồng trọt|bảo quản.*rau|sâu bệnh hại cây|nhân giống cây)\b/.test(
      lower
    )
  ) {
    return { domain: 'crop', grade: '10' };
  }
  if (
    /\b(vật nuôi|chuồng nuôi|chăn nuôi|gia súc|gia cầm|thức ăn chăn nuôi|thức ăn cho vật nuôi|biogas|đệm lót sinh học|lên men lactic|cấy truyền phôi)\b/.test(
      lower
    )
  ) {
    return { domain: 'husbandry', grade: '11' };
  }
  if (
    /\b(rừng|lâm nghiệp|lâm sản|cây rừng|trồng rừng|khai thác gỗ|cháy rừng|mật ong rừng)\b/.test(
      lower
    )
  ) {
    return { domain: 'forestry', grade: '12' };
  }
  return { domain: 'aquaculture', grade: '12' };
}

function isNumericOrUnitCell(val: string): boolean {
  const t = String(val || '').trim();
  if (!t || t === '-' || t === '—' || t === '–') return true;
  // Số liệu, phần trăm, khoảng số, đơn vị ngắn hoặc ký hiệu thống kê (VD: 5,43ᵇ, 10%, 10 - 15, 29.529, 3,29 ± 0,1)
  return /^[\d.,+\-–—±%‰/<>≤≥=~()\[\]\sᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖʳˢᵗᵘᵛʷˣʸᶻa-zA-Z]{1,18}$/.test(t) && /\d/.test(t);
}

export function computeSmartColumnWidths(
  headers: string[],
  rows: (string | number)[][]
): number[] {
  const colCount = Math.max(
    headers.length,
    ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
    1
  );
  if (colCount <= 1) return [100];

  const weights: number[] = [];
  for (let c = 0; c < colCount; c++) {
    const hText = String(headers[c] || '').trim();
    const cellLens = rows.map((r) => {
      const s = String(r?.[c] ?? '').trim();
      const longestLine = s
        .split('\n')
        .reduce((mx, part) => Math.max(mx, part.trim().length), 0);
      return longestLine;
    });
    const maxDataLen = cellLens.length > 0 ? Math.max(...cellLens) : 0;
    const avgDataLen =
      cellLens.length > 0 ? cellLens.reduce((a, b) => a + b, 0) / cellLens.length : 0;
    const headerLongest = hText
      .split('\n')
      .reduce((mx, part) => Math.max(mx, part.trim().length), 0);

    // Ước lượng độ rộng hợp lý: ưu tiên cột chứa văn bản mô tả dài, giữ cột số liệu gọn cân đối
    const effective = Math.max(
      6,
      Math.min(46, Math.max(headerLongest * 0.85, maxDataLen * 0.72 + avgDataLen * 0.28))
    );
    weights.push(effective);
  }

  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const minPct = colCount <= 4 ? 14 : colCount <= 6 ? 10 : 7;
  const maxPct = colCount === 2 ? 70 : colCount === 3 ? 52 : 42;
  const clamped = weights.map((w) => Math.max(minPct, Math.min(maxPct, (w / total) * 100)));
  const clampedSum = clamped.reduce((a, b) => a + b, 0) || 100;
  const rounded = clamped.map((v) => Math.round(((v / clampedSum) * 100) * 10) / 10);
  const diff = Math.round((100 - rounded.reduce((a, b) => a + b, 0)) * 10) / 10;
  if (rounded.length > 0) {
    rounded[0] = Math.round((rounded[0] + diff) * 10) / 10;
  }
  return rounded;
}

export function inferColumnAlignments(
  headers: string[],
  rows: (string | number)[][]
): ('left' | 'center' | 'right')[] {
  const colCount = Math.max(
    headers.length,
    ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
    1
  );
  const alignments: ('left' | 'center' | 'right')[] = [];
  for (let c = 0; c < colCount; c++) {
    const nonEmpty = rows
      .map((r) => String(r?.[c] ?? '').trim())
      .filter((s) => s.length > 0);
    if (nonEmpty.length === 0) {
      alignments.push(c === 0 ? 'left' : 'center');
      continue;
    }
    const numericCount = nonEmpty.filter(isNumericOrUnitCell).length;
    const avgLen = nonEmpty.reduce((acc, s) => acc + s.length, 0) / nonEmpty.length;
    if (numericCount >= Math.ceil(nonEmpty.length * 0.65) || (c > 0 && avgLen <= 12)) {
      alignments.push('center');
    } else {
      alignments.push('left');
    }
  }
  return alignments;
}

export function normalizeExamTableData(table: ExamTableData): ExamTableData {
  const rawHeaders = Array.isArray(table.headers) ? table.headers.map((h) => String(h ?? '').trim()) : [];
  const rawRows = Array.isArray(table.rows) ? table.rows : [];
  const colCount = Math.max(
    rawHeaders.length,
    ...rawRows.map((r) => (Array.isArray(r) ? r.length : 0)),
    1
  );

  const headers = [...rawHeaders];
  while (headers.length < colCount) headers.push('');

  const rows = rawRows.map((r) => {
    const arr = Array.isArray(r) ? r.map((c) => (c === null || c === undefined ? '' : c)) : [];
    const copy = [...arr];
    while (copy.length < colCount) copy.push('');
    return copy.slice(0, colCount);
  });

  let colWidths =
    Array.isArray(table.colWidths) && table.colWidths.length === colCount
      ? table.colWidths.map((w) => (Number.isFinite(w) && w > 0 ? w : 100 / colCount))
      : computeSmartColumnWidths(headers, rows);

  const wSum = colWidths.reduce((a, b) => a + b, 0);
  if (wSum > 0 && Math.abs(wSum - 100) > 1) {
    colWidths = colWidths.map((w) => Math.round(((w / wSum) * 100) * 10) / 10);
  }

  const alignments =
    Array.isArray(table.alignments) && table.alignments.length === colCount
      ? table.alignments
      : inferColumnAlignments(headers, rows);

  return {
    ...table,
    headers,
    rows,
    colWidths,
    alignments,
  };
}

function buildTableFingerprint(headers: string[], rows: (string | number)[][]): string {
  const norm = (s: string) =>
    String(s || '')
      .replace(/&#124;/g, '|')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  const hKey = headers.map(norm).join('¦');
  const r0Key = rows[0] ? rows[0].map((c) => norm(String(c))).join('¦') : '';
  return `${hKey}##${r0Key}##${rows.length}`;
}

function extractDirectChildBlocks(xml: string, tagName: string): string[] {
  const results: string[] = [];
  const openTag = `<${tagName}`;
  const closeTag = `</${tagName}>`;
  let cursor = 0;
  while (cursor < xml.length) {
    const start = xml.indexOf(openTag, cursor);
    if (start === -1) break;
    const ch = xml[start + openTag.length];
    if (ch !== '>' && ch !== ' ' && ch !== '/') {
      cursor = start + openTag.length;
      continue;
    }
    const tagEnd = xml.indexOf('>', start);
    if (tagEnd === -1) break;
    if (xml[tagEnd - 1] === '/') {
      results.push(xml.slice(start, tagEnd + 1));
      cursor = tagEnd + 1;
      continue;
    }
    let depth = 1;
    let scan = tagEnd + 1;
    while (depth > 0 && scan < xml.length) {
      const nextOpen = xml.indexOf(openTag, scan);
      const nextClose = xml.indexOf(closeTag, scan);
      if (nextClose === -1) {
        scan = xml.length;
        break;
      }
      if (
        nextOpen !== -1 &&
        nextOpen < nextClose &&
        (xml[nextOpen + openTag.length] === '>' || xml[nextOpen + openTag.length] === ' ')
      ) {
        depth++;
        scan = nextOpen + openTag.length;
      } else {
        depth--;
        scan = nextClose + closeTag.length;
      }
    }
    results.push(xml.slice(start, scan));
    cursor = scan;
  }
  return results;
}

function parseWordTableElement(
  tblXml: string,
  extractParagraphText: (pXml: string) => string
): {
  expandedRows: string[][];
  colCount: number;
  tableData: ExamTableData;
} | null {
  // 1. Đọc độ rộng từng cột từ <w:tblGrid><w:gridCol w:w="..."/>
  const gridColWidths: number[] = [];
  const tblGridMatch = tblXml.match(/<w:tblGrid\b[^>]*>([\s\S]*?)<\/w:tblGrid>/);
  if (tblGridMatch) {
    const gcRegex = /<w:gridCol\b[^>]*w:w="(\d+)"/g;
    let gm: RegExpExecArray | null;
    while ((gm = gcRegex.exec(tblGridMatch[1])) !== null) {
      const val = parseInt(gm[1], 10);
      if (val > 0) gridColWidths.push(val);
    }
  }

  // 2. Tách từng hàng trực tiếp <w:tr> và từng ô trực tiếp <w:tc>
  const trBlocks = extractDirectChildBlocks(tblXml, 'w:tr');
  if (trBlocks.length === 0) return null;

  interface RawParsedCell {
    text: string;
    colSpan: number;
    vMerge: 'none' | 'restart' | 'continue';
    align?: 'left' | 'center' | 'right';
    isBoldHeader?: boolean;
  }

  const rawRows: { isHeaderRow: boolean; cells: RawParsedCell[] }[] = [];

  for (let rIdx = 0; rIdx < trBlocks.length; rIdx++) {
    const trXml = trBlocks[rIdx];
    const isTblHeader = /<w:tblHeader\b/.test(trXml) || rIdx === 0;
    const tcBlocks = extractDirectChildBlocks(trXml, 'w:tc');
    const rowCells: RawParsedCell[] = [];

    for (const tcXml of tcBlocks) {
      const tcPrMatch = tcXml.match(/<w:tcPr\b[^>]*>([\s\S]*?)<\/w:tcPr>/);
      const tcPr = tcPrMatch ? tcPrMatch[1] : '';

      const gridSpanMatch = tcPr.match(/<w:gridSpan\b[^>]*w:val="(\d+)"/);
      const colSpan = gridSpanMatch ? Math.max(1, parseInt(gridSpanMatch[1], 10)) : 1;

      let vMerge: 'none' | 'restart' | 'continue' = 'none';
      const vMergeMatch = tcPr.match(/<w:vMerge\b([^>]*)\/?>/);
      if (vMergeMatch) {
        const valM = vMergeMatch[1].match(/w:val="([^"]+)"/);
        vMerge = valM && valM[1] === 'restart' ? 'restart' : 'continue';
      }

      // Đọc văn bản các đoạn trong ô, giữ xuống dòng rõ ràng nếu ô có nhiều dòng độc lập
      const cellParagraphs: string[] = [];
      let detectedAlign: 'left' | 'center' | 'right' | undefined;
      const pBlocks = extractDirectChildBlocks(tcXml, 'w:p');
      for (const pXml of pBlocks) {
        if (!detectedAlign) {
          const jcMatch = pXml.match(/<w:jc\b[^>]*w:val="(left|center|right|both|start|end)"/i);
          if (jcMatch) {
            const v = jcMatch[1].toLowerCase();
            if (v === 'center') detectedAlign = 'center';
            else if (v === 'right' || v === 'end') detectedAlign = 'right';
            else detectedAlign = 'left';
          }
        }
        const pt = extractParagraphText(pXml).trim();
        if (pt) cellParagraphs.push(pt);
      }

      const cellText = cellParagraphs.join('\n').replace(/[ \t]+/g, ' ').trim();
      rowCells.push({
        text: cellText,
        colSpan,
        vMerge,
        align: detectedAlign,
        isBoldHeader: isTblHeader,
      });
    }

    if (rowCells.some((c) => c.text.length > 0 || c.vMerge === 'continue')) {
      rawRows.push({ isHeaderRow: isTblHeader, cells: rowCells });
    }
  }

  if (rawRows.length === 0) return null;

  const colCount = Math.max(
    gridColWidths.length,
    ...rawRows.map((row) => row.cells.reduce((sum, c) => sum + c.colSpan, 0)),
    1
  );

  let hasAnyMerge = false;
  const expandedRows: string[][] = [];
  const structuredRows: ExamTableRow[] = [];
  // Track active vMerge anchor per column index
  const activeVMerge: (ExamTableCell | null)[] = Array(colCount).fill(null);

  for (let rIdx = 0; rIdx < rawRows.length; rIdx++) {
    const row = rawRows[rIdx];
    const flatRow: string[] = [];
    const sCells: ExamTableCell[] = [];
    let colCursor = 0;

    for (const cell of row.cells) {
      if (cell.colSpan > 1 || cell.vMerge !== 'none') {
        hasAnyMerge = true;
      }

      if (cell.vMerge === 'continue') {
        const anchor = activeVMerge[colCursor];
        if (anchor) {
          anchor.rowSpan = (anchor.rowSpan || 1) + 1;
          if (cell.text) {
            anchor.text = anchor.text ? `${anchor.text}\n${cell.text}` : cell.text;
          }
        }
        for (let k = 0; k < cell.colSpan; k++) {
          flatRow.push('');
        }
        colCursor += cell.colSpan;
        continue;
      }

      const sCell: ExamTableCell = {
        text: cell.text,
        ...(cell.colSpan > 1 ? { colSpan: cell.colSpan } : {}),
        ...(row.isHeaderRow ? { isHeader: true } : {}),
        ...(cell.align ? { align: cell.align } : {}),
      };
      sCells.push(sCell);

      for (let k = 0; k < cell.colSpan; k++) {
        flatRow.push(k === 0 ? cell.text : '');
        if (colCursor + k < colCount) {
          activeVMerge[colCursor + k] = cell.vMerge === 'restart' ? sCell : null;
        }
      }
      colCursor += cell.colSpan;
    }

    while (flatRow.length < colCount) flatRow.push('');
    expandedRows.push(flatRow.slice(0, colCount));
    structuredRows.push({
      isHeader: row.isHeaderRow,
      cells: sCells,
    });
  }

  let colWidths: number[] | undefined;
  if (gridColWidths.length === colCount) {
    const totalW = gridColWidths.reduce((a, b) => a + b, 0);
    if (totalW > 0) {
      colWidths = gridColWidths.map((w) => Math.round(((w / totalW) * 100) * 10) / 10);
    }
  }

  const headers = expandedRows[0] || [];
  const dataRows = expandedRows.slice(1);
  const tableData = normalizeExamTableData({
    headers,
    rows: dataRows,
    ...(colWidths ? { colWidths } : {}),
    ...(hasAnyMerge ? { structuredRows } : {}),
  });

  return {
    expandedRows,
    colCount,
    tableData,
  };
}

interface ExtractedTableResult {
  cleanedText: string;
  tableData?: ExamTableData;
  extraTables?: ExamTableData[];
  citation?: string;
}

interface DetectedTableSpan {
  startLine: number;
  endLine: number;
  headers: string[];
  rows: string[][];
}

function splitMarkdownRowCells(line: string): string[] {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map((c) =>
    c
      .replace(/&#124;/g, '|')
      .replace(/<br\s*\/?>/gi, '\n')
      .trim()
  );
}

function isMarkdownSeparatorLine(line: string): boolean {
  const s = line.trim();
  if (!s.includes('-')) return false;
  return /^\|?[\s:\-]+(\|[\s:\-]+)+\|?$/.test(s);
}

function splitTsvPreserveInterior(line: string): string[] {
  // Chỉ bỏ tab thừa ở cuối dòng (Word thường thêm \t cuối hàng), KHÔNG bỏ các ô rỗng nằm giữa các cột
  const trimmedRight = line.replace(/\t+$/, '');
  return trimmedRight.split('\t').map((c) => c.trim());
}

function findNextTableSpan(lines: string[], fromIndex = 0): DetectedTableSpan | null {
  const isOptionLine = (s: string) => /^\*?\s*[ABCDabcdđ]\s*[.)]\s*/.test(s.trim());

  // 1. Ưu tiên nhận diện bảng Markdown pipe: | col1 | col2 | (hoặc col1 | col2 | col3)
  for (let i = fromIndex; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const pipeCount = (trimmed.match(/\|/g) || []).length;
    const looksLikeMdRow =
      (trimmed.startsWith('|') && trimmed.endsWith('|') && pipeCount >= 3) ||
      (pipeCount >= 2 &&
        i + 1 < lines.length &&
        isMarkdownSeparatorLine(lines[i + 1]));

    if (looksLikeMdRow) {
      let j = i;
      const mdLines: string[] = [];
      let sawSeparator = false;
      while (j < lines.length) {
        const cur = lines[j].trim();
        const curPipes = (cur.match(/\|/g) || []).length;
        const curIsSep = isMarkdownSeparatorLine(cur);
        // Nếu đã qua dòng phân cách của bảng hiện tại và dòng sau là dòng phân cách mới => dòng hiện tại là tiêu đề của bảng kế tiếp
        if (
          sawSeparator &&
          !curIsSep &&
          j + 1 < lines.length &&
          isMarkdownSeparatorLine(lines[j + 1])
        ) {
          break;
        }
        if (
          (cur.startsWith('|') && cur.endsWith('|') && curPipes >= 2) ||
          curIsSep ||
          (curPipes >= 2 && !isOptionLine(cur) && !/^(?:Câu|Bài)\s+\d+/i.test(cur))
        ) {
          if (curIsSep) sawSeparator = true;
          mdLines.push(cur);
          j++;
        } else {
          break;
        }
      }
      const dataLines = mdLines.filter((l) => !isMarkdownSeparatorLine(l));
      if (dataLines.length >= 2) {
        const parsed = dataLines.map(splitMarkdownRowCells);
        const maxCols = Math.max(...parsed.map((r) => r.length));
        if (maxCols >= 2) {
          const normalized = parsed.map((r) => {
            const copy = [...r];
            while (copy.length < maxCols) copy.push('');
            return copy.slice(0, maxCols);
          });
          return {
            startLine: i,
            endLine: j,
            headers: normalized[0],
            rows: normalized.slice(1),
          };
        }
      }
    }
  }

  // 2. Nhận diện bảng Word/Google Docs dán nhiều dòng dạng:
  //    Cell1\n\tCell2\n\tCell3\n\t\nRow2Cell1\n\tRow2Cell2\n\tRow2Cell3\n\t
  for (let i = fromIndex; i < lines.length - 2; i++) {
    const firstLine = lines[i];
    if (
      !firstLine.trim() ||
      firstLine.startsWith('\t') ||
      isOptionLine(firstLine) ||
      /^(?:Câu|Bài)\s+\d+/i.test(firstLine.trim()) ||
      /^\(?\s*Nguồn\s*[:\-]/i.test(firstLine.trim())
    ) {
      continue;
    }
    if (!lines[i + 1]?.startsWith('\t') || !lines[i + 1].trim()) {
      continue;
    }

    const collectedRows: string[][] = [];
    let j = i;
    while (j < lines.length) {
      const rowHead = lines[j];
      if (!rowHead.trim() || rowHead.startsWith('\t')) {
        // Dòng phân cách hàng (\t trống hoặc dòng trống giữa các hàng)
        if (collectedRows.length > 0 && j + 1 < lines.length && lines[j + 1].trim() && !lines[j + 1].startsWith('\t')) {
          // Kiểm tra hàng tiếp theo có kèm ít nhất 1 dòng \tCell không
          if (j + 2 < lines.length && lines[j + 2].startsWith('\t') && lines[j + 2].trim()) {
            j++;
            continue;
          }
        }
        break;
      }
      if (
        isOptionLine(rowHead) ||
        /^(?:Câu|Bài)\s+\d+/i.test(rowHead.trim()) ||
        /^\(?\s*Nguồn\s*[:\-]/i.test(rowHead.trim())
      ) {
        break;
      }

      const cells: string[] = [rowHead.trim()];
      let k = j + 1;
      while (k < lines.length && lines[k].startsWith('\t')) {
        const cellVal = lines[k].replace(/^\t+/, '').trim();
        if (cellVal.length > 0) {
          cells.push(cellVal);
          k++;
        } else {
          // Dòng chỉ có \t là dấu kết thúc hàng của Word
          k++;
          break;
        }
      }

      if (cells.length >= 2) {
        if (
          collectedRows.length > 0 &&
          Math.abs(cells.length - collectedRows[0].length) > 2
        ) {
          break;
        }
        collectedRows.push(cells);
        j = k;
        // Bỏ qua 1 dòng trống phân cách hàng nếu có
        while (j < lines.length && lines[j].trim() === '') {
          // Chỉ nuốt dòng trống nếu dòng sau là một hàng bảng tiếp theo
          if (
            j + 2 < lines.length &&
            lines[j + 1].trim() &&
            !lines[j + 1].startsWith('\t') &&
            lines[j + 2].startsWith('\t') &&
            lines[j + 2].trim()
          ) {
            j++;
          } else {
            break;
          }
        }
      } else {
        break;
      }
    }

    if (collectedRows.length >= 2) {
      const maxCols = Math.max(...collectedRows.map((r) => r.length));
      const normalized = collectedRows.map((r) => {
        const copy = [...r];
        while (copy.length < maxCols) copy.push('');
        return copy.slice(0, maxCols);
      });
      return {
        startLine: i,
        endLine: j,
        headers: normalized[0],
        rows: normalized.slice(1),
      };
    }
  }

  // 3. Nhận diện bảng TSV cùng dòng (phân cách bằng \t, bảo toàn các ô trống ở giữa)
  for (let i = fromIndex; i < lines.length; i++) {
    if (!lines[i].includes('\t') || isOptionLine(lines[i])) continue;
    const cols = splitTsvPreserveInterior(lines[i]);
    const nonEmptyCols = cols.filter((c) => c.length > 0);
    if (cols.length >= 2 && nonEmptyCols.length >= 2) {
      let j = i + 1;
      const tsvRows: string[][] = [cols];
      while (j < lines.length) {
        const nextLine = lines[j];
        if (!nextLine.includes('\t') || isOptionLine(nextLine)) break;
        const nextCols = splitTsvPreserveInterior(nextLine);
        const nextNonEmpty = nextCols.filter((c) => c.length > 0);
        if (
          nextCols.length >= 2 &&
          nextNonEmpty.length >= 1 &&
          Math.abs(nextCols.length - cols.length) <= 2
        ) {
          tsvRows.push(nextCols);
          j++;
        } else {
          break;
        }
      }
      if (tsvRows.length >= 2) {
        const maxCols = Math.max(...tsvRows.map((r) => r.length));
        const normalized = tsvRows.map((r) => {
          const copy = [...r];
          while (copy.length < maxCols) copy.push('');
          return copy.slice(0, maxCols);
        });
        return {
          startLine: i,
          endLine: j,
          headers: normalized[0],
          rows: normalized.slice(1),
        };
      }
    }
  }

  // 4. Nhận diện bảng căn cột bằng nhiều khoảng trắng (từ PDF / văn bản thuần: >= 2 khoảng trắng liên tiếp)
  for (let i = fromIndex; i < lines.length - 1; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine || isOptionLine(rawLine) || /^(?:Câu|Bài)\s+\d+/i.test(rawLine)) continue;
    const cols = rawLine.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
    if (cols.length >= 2 && cols.length <= 10) {
      let j = i + 1;
      const spaceRows: string[][] = [cols];
      while (j < lines.length) {
        const nextRaw = lines[j].trim();
        if (!nextRaw || isOptionLine(nextRaw) || /^(?:Câu|Bài)\s+\d+/i.test(nextRaw)) break;
        const nextCols = nextRaw.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
        if (nextCols.length >= 2 && Math.abs(nextCols.length - cols.length) <= 1) {
          spaceRows.push(nextCols);
          j++;
        } else {
          break;
        }
      }
      // Tránh nhận nhầm đoạn văn thường: yêu cầu ít nhất 3 dòng hoặc có ít nhất 2 cột số liệu
      const hasNumericData = spaceRows
        .slice(1)
        .some((r) => r.filter(isNumericOrUnitCell).length >= 1);
      if ((spaceRows.length >= 3 || (spaceRows.length === 2 && hasNumericData)) && cols.length >= 2) {
        const maxCols = Math.max(...spaceRows.map((r) => r.length));
        const normalized = spaceRows.map((r) => {
          const copy = [...r];
          while (copy.length < maxCols) copy.push('');
          return copy.slice(0, maxCols);
        });
        return {
          startLine: i,
          endLine: j,
          headers: normalized[0],
          rows: normalized.slice(1),
        };
      }
    }
  }

  return null;
}

function matchExtractedWordTableSpec(
  headers: string[],
  rows: string[][],
  extractedTables?: Record<string, ExamTableData>
): ExamTableData | undefined {
  if (!extractedTables) return undefined;
  const targetFp = buildTableFingerprint(headers, rows);
  for (const spec of Object.values(extractedTables)) {
    if (!spec) continue;
    if (buildTableFingerprint(spec.headers, spec.rows) === targetFp) {
      return spec;
    }
  }
  return undefined;
}

export function extractTableAndCitationFromBlock(
  rawText: string,
  extractedTables?: Record<string, ExamTableData>
): ExtractedTableResult {
  const lines = (rawText || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const extractedList: ExamTableData[] = [];
  const excludedRanges: Array<{ start: number; end: number }> = [];
  let cursor = 0;

  while (cursor < lines.length) {
    const detected = findNextTableSpan(lines, cursor);
    if (!detected) break;

    let tableStart = detected.startLine;
    let tableEnd = detected.endLine;
    let caption: string | undefined;
    let tableSource: string | undefined;
    let note: string | undefined;

    // Tách dòng tiêu đề bảng ngay trước bảng nếu có (VD: "Bảng 1: ...", "Bảng số liệu...")
    if (tableStart > cursor) {
      let prevIdx = tableStart - 1;
      while (prevIdx >= cursor && !lines[prevIdx].trim()) prevIdx--;
      if (prevIdx >= cursor) {
        const prevLine = lines[prevIdx].trim();
        if (/^Bảng\s*(\d+|[IVX]+)?\s*[:.\-]/i.test(prevLine) && prevLine.length <= 180) {
          caption = prevLine;
          tableStart = prevIdx;
        }
      }
    }

    // Tách dòng Nguồn / Ghi chú ngay sau bảng nếu có
    let nextIdx = tableEnd;
    for (let look = 0; look < 2; look++) {
      while (nextIdx < lines.length && !lines[nextIdx].trim()) nextIdx++;
      if (nextIdx >= lines.length) break;
      const tLine = lines[nextIdx].trim();
      if (!note && /^\(?\s*Ghi\s*chú\s*[:\-]/i.test(tLine)) {
        note = tLine;
        tableEnd = nextIdx + 1;
        nextIdx++;
      } else if (!tableSource && /^\(?\s*Nguồn\s*[:\-]/i.test(tLine)) {
        tableSource = tLine;
        tableEnd = nextIdx + 1;
        nextIdx++;
      } else {
        break;
      }
    }

    excludedRanges.push({ start: tableStart, end: tableEnd });

    if (detected.headers.length >= 2 && detected.rows.length >= 1) {
      const matchedWordSpec = matchExtractedWordTableSpec(
        detected.headers,
        detected.rows,
        extractedTables
      );
      extractedList.push(
        normalizeExamTableData({
          ...(matchedWordSpec || {}),
          // Khi khớp bảng Word/HTML gốc, ưu tiên giữ nguyên headers/rows/structuredRows gốc (100% bảo toàn nội dung và ô gộp)
          headers: matchedWordSpec ? matchedWordSpec.headers : detected.headers,
          rows: matchedWordSpec ? matchedWordSpec.rows : detected.rows,
          ...(caption
            ? { caption }
            : matchedWordSpec?.caption
            ? { caption: matchedWordSpec.caption }
            : {}),
          ...(tableSource ? { source: tableSource } : {}),
          ...(note ? { note } : {}),
        })
      );
    }

    cursor = tableEnd;
  }

  // Tách dòng (Nguồn: ...) còn lại ở ngoài bảng nếu có
  let citation: string | undefined;
  const isInExcludedRange = (idx: number) =>
    excludedRanges.some((r) => idx >= r.start && idx < r.end);
  const remainingLines: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (isInExcludedRange(i)) continue;
    const line = lines[i];
    const sourceMatch = line.trim().match(/^\(?\s*Nguồn\s*[:\-]\s*(.+?)\)?\s*$/i);
    if (sourceMatch) {
      citation = sourceMatch[1].replace(/\)\s*$/, '').trim();
      continue;
    }
    remainingLines.push(line);
  }

  // Nếu có citation ở ngoài bảng mà bảng đầu tiên chưa có source, gắn thêm để hiển thị thống nhất
  if (citation && extractedList.length > 0 && !extractedList[0].source) {
    extractedList[0] = { ...extractedList[0], source: `(Nguồn: ${citation})` };
  }
  if (!citation && extractedList.length > 0 && extractedList[0].source) {
    const m = extractedList[0].source.match(/^\(?\s*Nguồn\s*[:\-]\s*(.+?)\)?\s*$/i);
    if (m) citation = m[1].replace(/\)\s*$/, '').trim();
  }

  return {
    cleanedText: remainingLines.join('\n').replace(/\n{3,}/g, '\n\n').trim(),
    tableData: extractedList[0],
    extraTables: extractedList.length > 1 ? extractedList.slice(1) : undefined,
    citation,
  };
}

export type RichDocumentBlock =
  | { type: 'text'; content: string }
  | { type: 'table'; tableData: ExamTableData }
  | { type: 'image'; src: string; key: string }
  | { type: 'chart'; chartData: ExamChartData; key: string };

function pushTextAndEmbeddedAssetBlocks(
  textSegment: string,
  blocks: RichDocumentBlock[],
  extractedImages?: Record<string, string>,
  extractedCharts?: Record<string, ExamChartData>
) {
  if (!textSegment.trim()) return;
  const tokenRegex = /\[\[(IMG|CHART):([^\]]+)\]\]/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = tokenRegex.exec(textSegment)) !== null) {
    const before = textSegment.slice(lastIdx, m.index).trim();
    if (before) blocks.push({ type: 'text', content: before });

    const kind = m[1];
    const key = String(m[2]).trim();
    if (kind === 'IMG' && extractedImages?.[key]) {
      blocks.push({ type: 'image', src: extractedImages[key], key });
    } else if (kind === 'CHART' && extractedCharts?.[key]) {
      blocks.push({ type: 'chart', chartData: extractedCharts[key], key });
    }
    lastIdx = m.index + m[0].length;
  }
  const tail = textSegment.slice(lastIdx).trim();
  if (tail) blocks.push({ type: 'text', content: tail });
}

/**
 * Tách toàn bộ nội dung văn bản gốc của tài liệu người dùng đăng lên thành các khối
 * văn bản + bảng biểu cố định + biểu đồ nguyên bản + hình ảnh đúng thứ tự tài liệu gốc.
 */
export function extractAllTablesAndBlocksFromDocument(
  rawText: string,
  extractedTables?: Record<string, ExamTableData>,
  extractedImages?: Record<string, string>,
  extractedCharts?: Record<string, ExamChartData>
): RichDocumentBlock[] {
  const lines = (rawText || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const blocks: RichDocumentBlock[] = [];
  let cursor = 0;

  while (cursor < lines.length) {
    const found = findNextTableSpan(lines, cursor);
    if (!found) {
      const rest = lines.slice(cursor).join('\n');
      pushTextAndEmbeddedAssetBlocks(rest, blocks, extractedImages, extractedCharts);
      break;
    }

    let tableStart = found.startLine;
    let tableEnd = found.endLine;
    let caption: string | undefined;
    let source: string | undefined;
    let note: string | undefined;

    // Kiểm tra dòng tiêu đề bảng ngay phía trên
    let prevIdx = tableStart - 1;
    while (prevIdx >= cursor && !lines[prevIdx].trim()) prevIdx--;
    if (prevIdx >= cursor) {
      const prevLine = lines[prevIdx].trim();
      if (/^Bảng\s*(\d+|[IVX]+)?\s*[:.\-]/i.test(prevLine) && prevLine.length <= 180) {
        caption = prevLine;
        tableStart = prevIdx;
      }
    }

    // Kiểm tra dòng nguồn / ghi chú ngay phía dưới
    let nextIdx = tableEnd;
    for (let look = 0; look < 2; look++) {
      while (nextIdx < lines.length && !lines[nextIdx].trim()) nextIdx++;
      if (nextIdx >= lines.length) break;
      const tLine = lines[nextIdx].trim();
      if (!source && /^\(?\s*Nguồn\s*[:\-]/i.test(tLine)) {
        source = tLine;
        tableEnd = nextIdx + 1;
        nextIdx++;
      } else if (!note && /^\(?\s*Ghi\s*chú\s*[:\-]/i.test(tLine)) {
        note = tLine;
        tableEnd = nextIdx + 1;
        nextIdx++;
      } else {
        break;
      }
    }

    const beforeText = lines.slice(cursor, tableStart).join('\n');
    pushTextAndEmbeddedAssetBlocks(beforeText, blocks, extractedImages, extractedCharts);

    const matchedWordSpec = matchExtractedWordTableSpec(
      found.headers,
      found.rows,
      extractedTables
    );
    blocks.push({
      type: 'table',
      tableData: normalizeExamTableData({
        ...(matchedWordSpec || {}),
        headers: matchedWordSpec ? matchedWordSpec.headers : found.headers,
        rows: matchedWordSpec ? matchedWordSpec.rows : found.rows,
        ...(caption ? { caption } : matchedWordSpec?.caption ? { caption: matchedWordSpec.caption } : {}),
        ...(source ? { source } : {}),
        ...(note ? { note } : {}),
      }),
    });

    cursor = tableEnd;
  }

  return blocks;
}

/**
 * Chuyển đổi HTML dán trực tiếp từ Microsoft Word / Google Docs / Excel sang văn bản chuẩn hóa
 * giữ cố định 100% cấu trúc bảng (bao gồm gộp cột colspan, gộp dòng rowspan và căn lề).
 */
export function convertClipboardHtmlToStructuredText(html: string): {
  text: string;
  tables: Record<string, ExamTableData>;
} | null {
  if (!html || !/<table\b/i.test(html) || typeof DOMParser === 'undefined') {
    return null;
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;
    if (!body || !body.querySelector('table')) return null;

    const lines: string[] = [];
    const tables: Record<string, ExamTableData> = {};
    let tblCounter = 0;

    const extractCellText = (el: Element): string => {
      const cloned = el.cloneNode(true) as Element;
      cloned.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
      const raw = (cloned.textContent || '')
        .replace(/\u00A0/g, ' ')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');
      return raw
        .split('\n')
        .map((l) => l.replace(/[ \t]+/g, ' ').trim())
        .filter(Boolean)
        .join('\n')
        .trim();
    };

    const parseHtmlTable = (tableEl: HTMLTableElement) => {
      const trNodes = Array.from(
        tableEl.querySelectorAll(':scope > tr, :scope > thead > tr, :scope > tbody > tr, :scope > tfoot > tr')
      );
      if (trNodes.length === 0) return;

      // Xử lý chuẩn cả colspan và rowspan bằng lưới chiếm chỗ (occupancy grid)
      const grid: string[][] = [];
      const structuredRows: ExamTableRow[] = [];
      let hasMerges = false;
      let maxCols = 0;

      trNodes.forEach((tr, rIdx) => {
        if (!grid[rIdx]) grid[rIdx] = [];
        const cellNodes = Array.from(tr.children).filter(
          (c) => c.tagName.toLowerCase() === 'td' || c.tagName.toLowerCase() === 'th'
        );
        const sCells: ExamTableCell[] = [];
        const isHeaderRow =
          rIdx === 0 ||
          tr.parentElement?.tagName.toLowerCase() === 'thead' ||
          cellNodes.every((c) => c.tagName.toLowerCase() === 'th');
        let cCursor = 0;

        for (const cellEl of cellNodes) {
          while (grid[rIdx][cCursor] !== undefined) cCursor++;
          const colSpan = Math.max(1, parseInt(cellEl.getAttribute('colspan') || '1', 10) || 1);
          const rowSpan = Math.max(1, parseInt(cellEl.getAttribute('rowspan') || '1', 10) || 1);
          if (colSpan > 1 || rowSpan > 1) hasMerges = true;

          const text = extractCellText(cellEl);
          const styleStr = (cellEl.getAttribute('style') || '').toLowerCase();
          const alignAttr = (cellEl.getAttribute('align') || '').toLowerCase();
          let align: 'left' | 'center' | 'right' | undefined;
          if (alignAttr === 'center' || /text-align\s*:\s*center/.test(styleStr)) align = 'center';
          else if (alignAttr === 'right' || /text-align\s*:\s*right/.test(styleStr)) align = 'right';
          else if (alignAttr === 'left' || /text-align\s*:\s*left/.test(styleStr)) align = 'left';

          sCells.push({
            text,
            ...(colSpan > 1 ? { colSpan } : {}),
            ...(rowSpan > 1 ? { rowSpan } : {}),
            ...(isHeaderRow || cellEl.tagName.toLowerCase() === 'th' ? { isHeader: true } : {}),
            ...(align ? { align } : {}),
          });

          for (let dr = 0; dr < rowSpan; dr++) {
            if (!grid[rIdx + dr]) grid[rIdx + dr] = [];
            for (let dc = 0; dc < colSpan; dc++) {
              grid[rIdx + dr][cCursor + dc] = dr === 0 && dc === 0 ? text : '';
            }
          }
          cCursor += colSpan;
          maxCols = Math.max(maxCols, cCursor);
        }

        if (sCells.length > 0) {
          structuredRows.push({ isHeader: isHeaderRow, cells: sCells });
        }
      });

      const normalizedGrid = grid
        .map((r) => {
          const copy: string[] = [];
          for (let c = 0; c < maxCols; c++) copy.push(r?.[c] ?? '');
          return copy;
        })
        .filter((r) => r.some((cell) => cell.length > 0));

      if (normalizedGrid.length === 0) return;

      if (isGenuineOptionLayoutTable(normalizedGrid)) {
        normalizedGrid.flat().filter(Boolean).forEach((cell) => lines.push(cell));
        return;
      }

      if (normalizedGrid.length >= 2 && maxCols >= 2) {
        tblCounter += 1;
        tables[`tbl_paste_${tblCounter}`] = normalizeExamTableData({
          headers: normalizedGrid[0],
          rows: normalizedGrid.slice(1),
          ...(hasMerges ? { structuredRows } : {}),
        });

        const escapeMd = (s: string) =>
          s.replace(/\|/g, '&#124;').replace(/\n/g, ' <br> ').replace(/\s+/g, ' ').trim();
        lines.push(`| ${normalizedGrid[0].map(escapeMd).join(' | ')} |`);
        lines.push(`| ${Array(maxCols).fill('---').join(' | ')} |`);
        for (let r = 1; r < normalizedGrid.length; r++) {
          lines.push(`| ${normalizedGrid[r].map(escapeMd).join(' | ')} |`);
        }
      } else {
        normalizedGrid.forEach((r) => lines.push(r.join('\t')));
      }
    };

    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const t = (node.textContent || '').replace(/\u00A0/g, ' ').trim();
        if (t) lines.push(t);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const el = node as Element;
      const tag = el.tagName.toLowerCase();
      if (tag === 'style' || tag === 'script' || tag === 'meta' || tag === 'link') return;
      if (tag === 'table') {
        parseHtmlTable(el as HTMLTableElement);
        return;
      }
      if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote'].includes(tag)) {
        if (el.querySelector('table')) {
          Array.from(el.childNodes).forEach(walk);
        } else {
          const t = extractCellText(el);
          if (t) lines.push(t);
        }
        return;
      }
      Array.from(el.childNodes).forEach(walk);
    };

    Array.from(body.childNodes).forEach(walk);
    const outText = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    if (!outText) return null;
    return { text: outText, tables };
  } catch {
    return null;
  }
}

function extractImageTokens(
  text: string,
  imageMap?: Record<string, string>
): { cleanedText: string; imageUrl?: string; images?: string[] } {
  const found: string[] = [];
  const cleanedText = text
    .replace(/\[\[IMG:([^\]]+)\]\]/g, (_full, key) => {
      const url = imageMap?.[String(key).trim()];
      if (url && !found.includes(url)) {
        found.push(url);
      }
      return '';
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (found.length === 0) return { cleanedText };
  return {
    cleanedText,
    imageUrl: found[0],
    images: found.length > 1 ? found : undefined,
  };
}

function extractChartTokens(
  text: string,
  chartMap?: Record<string, ExamChartData>
): { cleanedText: string; chartData?: ExamChartData; extraCharts?: ExamChartData[] } {
  const found: ExamChartData[] = [];
  const cleanedText = text
    .replace(/\[\[CHART:([^\]]+)\]\]/g, (_full, key) => {
      const chart = chartMap?.[String(key).trim()];
      if (chart) {
        found.push(chart);
      }
      return '';
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (found.length === 0) return { cleanedText };
  return {
    cleanedText,
    chartData: found[0],
    extraCharts: found.length > 1 ? found.slice(1) : undefined,
  };
}

function containsFullQuestionBlocks(text: string): boolean {
  const hasFullPartI =
    /(?:^|\n)[ \t*#>]*(?:Câu|Bài)\s*\d{1,3}[\s\S]{0,900}?(?:\n|\t|\s)\*?\s*A\s*\*?\s*[.)][\s\S]{0,600}?(?:\n|\t|\s)\*?\s*B\s*\*?\s*[.)][\s\S]{0,600}?(?:\n|\t|\s)\*?\s*C\s*\*?\s*[.)][\s\S]{0,600}?(?:\n|\t|\s)\*?\s*D\s*\*?\s*[.)]/i.test(
      text
    );
  const hasFullPartII =
    /(?:^|\n)[ \t*#>]*(?:Câu|Bài)\s*\d{1,3}[\s\S]{0,1200}?(?:\n|\t)\*?\s*a\s*\*?\s*[.)][\s\S]{0,700}?(?:\n|\t)\*?\s*b\s*\*?\s*[.)][\s\S]{0,700}?(?:\n|\t)\*?\s*c\s*\*?\s*[.)][\s\S]{0,700}?(?:\n|\t)\*?\s*[dđ]\s*\*?\s*[.)]/i.test(
      text
    );
  return hasFullPartI || hasFullPartII;
}

function extractTrailingAnswerSection(fullText: string): {
  examBodyText: string;
  partIAnswerKey: Record<number, 'A' | 'B' | 'C' | 'D'>;
  partIIAnswerKey: Record<number, Partial<Record<'a' | 'b' | 'c' | 'd', boolean>>>;
  partIIIAnswerKey: Record<number, string>;
} {
  const partIAnswerKey: Record<number, 'A' | 'B' | 'C' | 'D'> = {};
  const partIIAnswerKey: Record<number, Partial<Record<'a' | 'b' | 'c' | 'd', boolean>>> = {};
  const partIIIAnswerKey: Record<number, string> = {};

  // Quét TẤT CẢ ứng viên tiêu đề bảng đáp án; KHÔNG bao giờ cắt ngang đề nếu phía sau vẫn là các câu hỏi đầy đủ!
  const ansSectionRegex =
    /(?:^|\n)[ \t*#|]*(BẢNG\s+ĐÁP\s+ÁN|ĐÁP\s+ÁN\s+(?:CHI\s+TIẾT|THAM\s+KHẢO|ĐỀ\s+THI|CHÍNH\s+THỨC|VÀ\s+HƯỚNG\s+DẪN\s+CHẤM)|HƯỚNG\s+DẪN\s+CHẤM|ĐÁP\s+ÁN)[ \t*:|\-–—]*(?:\n|$)/gi;

  const candidates: { index: number; heading: string; endIndex: number }[] = [];
  let candMatch: RegExpExecArray | null;
  while ((candMatch = ansSectionRegex.exec(fullText)) !== null) {
    candidates.push({
      index: candMatch.index,
      heading: (candMatch[1] || '').trim().toUpperCase(),
      endIndex: candMatch.index + candMatch[0].length,
    });
  }

  let chosenCandidate: { index: number; heading: string; endIndex: number } | null = null;
  for (const cand of candidates) {
    const beforeText = fullText.slice(0, cand.index);
    const afterText = fullText.slice(cand.endIndex);

    // Phải có ít nhất 1 câu hỏi nằm trước tiêu đề bảng đáp án
    const beforeQuestionCount = (
      beforeText.match(/(?:^|\n)[ \t*#>]*(?:Câu|Bài)\s*\d{1,3}\b/gi) || []
    ).length;
    if (beforeQuestionCount === 0) continue;

    // Nếu phía sau vẫn chứa các câu hỏi hoàn chỉnh (VD: "Đáp án:" xen kẽ sau Câu 1), TUYỆT ĐỐI KHÔNG CẮT!
    const afterHasQuestions = containsFullQuestionBlocks(afterText);
    if (afterHasQuestions) {
      // Ngoại lệ duy nhất: tài liệu có phần "ĐÁP ÁN CHI TIẾT" / "HƯỚNG DẪN CHẤM" lặp lại từ Câu 1 sau khi đã đủ đề phía trước
      const isExplicitDetailedKey =
        /(?:CHI\s+TIẾT|HƯỚNG\s+DẪN\s+CHẤM|BẢNG\s+ĐÁP\s+ÁN)/i.test(cand.heading);
      const afterFirstQ = afterText.match(/(?:^|\n)[ \t*#>]*(?:Câu|Bài)\s*(\d{1,3})\b/i);
      const afterStartsAtOne = afterFirstQ ? parseInt(afterFirstQ[1], 10) === 1 : false;
      if (!(isExplicitDetailedKey && beforeQuestionCount >= 4 && afterStartsAtOne)) {
        continue;
      }
    }

    // Kiểm tra phía sau thực sự có dữ liệu đáp án (ít nhất 2 cặp đáp án, bảng đáp án hoặc đáp án Đúng/Sai)
    const pairHits = (afterText.match(/(?:Câu\s*)?\d{1,2}\s*[.:\-)]\s*[ABCD]\b/gi) || []).length;
    const tfHits = (afterText.match(/([abcdđ])\s*[:.)\-]?\s*(?:Đúng|Sai|Đ|S)\b/gi) || []).length;
    const tableLetterHits = (afterText.match(/\|\s*[ABCD]\s*(?=\|)/g) || []).length;
    const shortAnsHits = (afterText.match(/(?:Câu\s*)?\d{1,2}\s*[.:)\-]\s*[-+]?\d/gi) || []).length;
    if (pairHits >= 2 || tfHits >= 2 || tableLetterHits >= 3 || shortAnsHits >= 2) {
      chosenCandidate = cand;
      break;
    }
  }

  if (!chosenCandidate) {
    return { examBodyText: fullText, partIAnswerKey, partIIAnswerKey, partIIIAnswerKey };
  }

  const examBodyText = fullText.slice(0, chosenCandidate.index).trim();
  const ansText = fullText.slice(chosenCandidate.index);

  // Phân tách Phần I, Phần II và Phần III bên trong bảng đáp án nếu có
  const p2Match = /(?:^|\n)[ \t*#|]*PHẦN\s*(?:II|2)\b/i.exec(ansText);
  const p3Match = /(?:^|\n)[ \t*#|]*PHẦN\s*(?:III|3)\b/i.exec(ansText);

  const p2Idx = p2Match ? p2Match.index : -1;
  const p3Idx = p3Match && p3Match.index > p2Idx ? p3Match.index : -1;

  const ansPartI =
    p2Idx >= 0 ? ansText.slice(0, p2Idx) : p3Idx >= 0 ? ansText.slice(0, p3Idx) : ansText;
  const ansPartII =
    p2Idx >= 0
      ? p3Idx >= 0
        ? ansText.slice(p2Idx, p3Idx)
        : ansText.slice(p2Idx)
      : ansText;
  const ansPartIII = p3Idx >= 0 ? ansText.slice(p3Idx) : '';

  // Dạng "1.A 2.C" hoặc "Câu 1: A"
  const pairRegex = /(?:Câu\s*)?(\d{1,3})\s*[.:\-)]\s*([ABCD])\b/gi;
  let m: RegExpExecArray | null;
  while ((m = pairRegex.exec(ansPartI)) !== null) {
    const qNum = parseInt(m[1], 10);
    if (qNum >= 1 && qNum <= 200) {
      partIAnswerKey[qNum] = m[2].toUpperCase() as 'A' | 'B' | 'C' | 'D';
    }
  }

  // Dạng bảng Markdown "| Câu | 1 | 2 | ... |" theo sau bởi "| Đáp án | A | B | ... |"
  const ansLines = ansPartI.split('\n').map((l) => l.trim());
  for (let i = 0; i < ansLines.length - 1; i++) {
    const nums = ansLines[i].match(/\b\d{1,3}\b/g);
    const nextIdx = /^\|[\s\-:|]+\|$/.test(ansLines[i + 1]) ? i + 2 : i + 1;
    if (nums && nums.length >= 3 && nextIdx < ansLines.length) {
      const letters = ansLines[nextIdx].match(/\b[ABCD]\b/g);
      if (letters && letters.length === nums.length) {
        for (let k = 0; k < nums.length; k++) {
          partIAnswerKey[parseInt(nums[k], 10)] = letters[k] as 'A' | 'B' | 'C' | 'D';
        }
      }
    }
  }

  // Dạng Phần II: "Câu 1: a-Đ, b-S, c-S, d-Đ" hoặc "1: Đ-S-S-Đ" hoặc "1. ĐSSĐ"
  const tfLineRegex = /(?:Câu\s*)?(\d{1,2})\s*[:.)\-]\s*([^\n]+)/gi;
  let tm: RegExpExecArray | null;
  while ((tm = tfLineRegex.exec(ansPartII)) !== null) {
    const tfNum = parseInt(tm[1], 10);
    const rest = tm[2];
    const subPairs = Array.from(rest.matchAll(/([abcdđ])\s*[:.)\-]?\s*(Đúng|Sai|Đ|S)\b/gi));
    if (subPairs.length >= 2) {
      partIIAnswerKey[tfNum] = partIIAnswerKey[tfNum] || {};
      for (const sp of subPairs) {
        const subId = (sp[1].toLowerCase() === 'đ' ? 'd' : sp[1].toLowerCase()) as
          | 'a'
          | 'b'
          | 'c'
          | 'd';
        const v = sp[2].toUpperCase();
        partIIAnswerKey[tfNum][subId] = v === 'ĐÚNG' || v === 'Đ';
      }
      continue;
    }
    const compactSeq = rest.match(/\b([ĐS])[\s,\-/]*([ĐS])[\s,\-/]*([ĐS])[\s,\-/]*([ĐS])\b/i);
    if (compactSeq) {
      partIIAnswerKey[tfNum] = {
        a: compactSeq[1].toUpperCase() === 'Đ',
        b: compactSeq[2].toUpperCase() === 'Đ',
        c: compactSeq[3].toUpperCase() === 'Đ',
        d: compactSeq[4].toUpperCase() === 'Đ',
      };
    }
  }

  // Dạng Phần III: "Câu 1: 12,5" hoặc "1. 45"
  if (ansPartIII) {
    const p3LineRegex = /(?:Câu\s*)?(\d{1,2})\s*[:.)\-]\s*([^\n]+)/gi;
    let p3m: RegExpExecArray | null;
    while ((p3m = p3LineRegex.exec(ansPartIII)) !== null) {
      const qNum = parseInt(p3m[1], 10);
      const val = p3m[2].trim();
      if (qNum >= 1 && qNum <= 60 && val) {
        partIIIAnswerKey[qNum] = val;
      }
    }
  }

  return { examBodyText, partIAnswerKey, partIIAnswerKey, partIIIAnswerKey };
}

/**
 * Loại bỏ các dòng đầu trang / chân trang PDF lặp lại (VD: "Trang 2/4", "Trang 1/4 - Mã đề 0701")
 * mà KHÔNG làm thay đổi hay cắt bớt nội dung câu hỏi.
 */
function stripRunningPdfPageMarkers(text: string): string {
  return text
    .split('\n')
    .filter((line) => {
      const t = line.trim();
      if (!t) return true;
      if (/^Trang\s+\d+\s*(?:\/\s*\d+)?(?:\s*[-–—|•]\s*Mã\s+đề(?:\s+thi)?\s*[:\-]?\s*[A-Za-z0-9]+)?$/i.test(t)) {
        return false;
      }
      if (/^Mã\s+đề(?:\s+thi)?\s*[:\-]?\s*[A-Za-z0-9]+(?:\s*[-–—|•]\s*Trang\s+\d+(?:\s*\/\s*\d+)?)?$/i.test(t)) {
        return false;
      }
      if (/^[-–—]{2,}\s*Trang\s+\d+(?:\s*\/\s*\d+)?\s*[-–—]{2,}$/i.test(t)) {
        return false;
      }
      return true;
    })
    .join('\n');
}

/**
 * Giải phóng các hàng bảng Markdown bị nhận diện nhầm từ đáp án nằm ngang (VD: "| A. ... | B. ... |")
 * trong phạm vi nội dung một câu hỏi.
 */
function unwrapOptionPipeLines(body: string): string {
  return body
    .split('\n')
    .map((line) => {
      const t = line.trim();
      if (!(t.startsWith('|') && t.endsWith('|'))) return line;
      if (/^\|[\s\-:|]+\|$/.test(t)) return line;
      const cells = t
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean);
      const looksLikeOptionsRow =
        cells.length >= 2 &&
        cells.every(
          (c) =>
            /^\*?\s*[ABCD]\s*\*?\s*[.):]\s*/.test(c) ||
            /^\*?\s*[abcdđ]\s*\*?\s*[.):]\s*/.test(c)
        );
      return looksLikeOptionsRow ? cells.join('\t') : line;
    })
    .join('\n');
}

interface OptionCandidate {
  letter: 'A' | 'B' | 'C' | 'D';
  starred: boolean;
  startIdx: number;
  contentStart: number;
  atLineStart: boolean;
}

function collectPartIOptionCandidates(body: string): OptionCandidate[] {
  // Hỗ trợ cả "A. Nội dung" lẫn "A.Nội dung" (thiếu khoảng trắng sau dấu chấm trong PDF)
  const regex =
    /(^|\n|\t|\s)(\*?)\s*([ABCD])\s*(\*?)\s*([.):])(?:\s+|(?=[A-ZÀ-Ỹa-zà-ỹ0-9"“'(+]))/g;
  const all: OptionCandidate[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(body)) !== null) {
    const sep = m[1];
    const letter = m[3] as 'A' | 'B' | 'C' | 'D';
    const punct = m[5];
    const matchStart = m.index + (sep === '\n' || sep === '\t' || sep === ' ' ? sep.length : 0);

    // Bỏ qua ký tự nằm trong hàng bảng dữ liệu Markdown (| ... |)
    const lineStart = body.lastIndexOf('\n', matchStart) + 1;
    const lineEnd = body.indexOf('\n', matchStart);
    const lineTrim = body.slice(lineStart, lineEnd === -1 ? body.length : lineEnd).trim();
    if (lineTrim.startsWith('|') && lineTrim.endsWith('|')) continue;

    // Tránh nhầm dấu ":" ở giữa câu nếu không phải đầu dòng / sau tab
    if (punct === ':' && sep === ' ') continue;

    // Tránh nhầm chữ viết tắt liền kề như "U.S.A." hoặc "T.B."
    if (sep === ' ' && matchStart > 1 && /[A-ZÀ-Ỹ.]/.test(body[matchStart - 2] || '')) {
      const prevChunk = body.slice(Math.max(0, matchStart - 4), matchStart);
      if (/[A-Z]\.\s*$/.test(prevChunk)) continue;
    }

    all.push({
      letter,
      starred: Boolean(m[2] || m[4]),
      startIdx: matchStart,
      contentStart: m.index + m[0].length,
      atLineStart: sep === '' || sep === '\n' || sep === '\t',
    });
  }
  return all;
}

function findBestOrderedPartIOptions(body: string): OptionCandidate[] | null {
  const all = collectPartIOptionCandidates(body);

  const byLetter: Record<'A' | 'B' | 'C' | 'D', OptionCandidate[]> = {
    A: all.filter((x) => x.letter === 'A'),
    B: all.filter((x) => x.letter === 'B'),
    C: all.filter((x) => x.letter === 'C'),
    D: all.filter((x) => x.letter === 'D'),
  };

  if (
    byLetter.A.length === 0 ||
    byLetter.B.length === 0 ||
    byLetter.C.length === 0 ||
    byLetter.D.length === 0
  ) {
    return null;
  }

  let best: OptionCandidate[] | null = null;
  let bestScore = -1;

  for (const a of byLetter.A) {
    for (const b of byLetter.B) {
      if (b.startIdx <= a.contentStart) continue;
      for (const c of byLetter.C) {
        if (c.startIdx <= b.contentStart) continue;
        for (const d of byLetter.D) {
          if (d.startIdx <= c.contentStart) continue;
          const lineStartCount =
            (a.atLineStart ? 1 : 0) +
            (b.atLineStart ? 1 : 0) +
            (c.atLineStart ? 1 : 0) +
            (d.atLineStart ? 1 : 0);
          const score =
            (a.atLineStart ? 1000 : 0) +
            lineStartCount * 200 +
            Math.floor((a.startIdx / Math.max(1, body.length)) * 100);
          if (score >= bestScore) {
            bestScore = score;
            best = [a, b, c, d];
          }
        }
      }
    }
  }

  return best;
}

/**
 * Khôi phục một phần phương án A/B/C/D khi câu hỏi trong PDF bị thiếu 1 hoặc nhiều nhãn phương án
 * để TUYỆT ĐỐI KHÔNG bỏ sót câu hỏi.
 */
function findPartialOrderedPartIOptions(body: string): OptionCandidate[] {
  const all = collectPartIOptionCandidates(body).sort((x, y) => x.startIdx - y.startIdx);
  const order: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const picked: OptionCandidate[] = [];
  let minIdx = -1;
  for (const letter of order) {
    const candidates = all.filter((c) => c.letter === letter && c.startIdx > minIdx);
    if (candidates.length === 0) continue;
    const preferred = candidates.find((c) => c.atLineStart) || candidates[0];
    picked.push(preferred);
    minIdx = preferred.contentStart;
  }
  return picked;
}

interface SubStatementCandidate {
  subId: 'a' | 'b' | 'c' | 'd';
  starred: boolean;
  startIdx: number;
  contentStart: number;
  atLineStart: boolean;
}

function collectPartIIStatementCandidates(
  body: string,
  allowUppercaseFallback = false
): SubStatementCandidate[] {
  const charClass = allowUppercaseFallback ? '[ABCDabcdđĐ]' : '[abcdđ]';
  const regex = new RegExp(
    `(^|\\n|\\t|\\s)(\\*?)\\s*(${charClass})\\s*(\\*?)\\s*([.):])(?:\\s+|(?=[A-ZÀ-Ỹa-zà-ỹ0-9"“'(+]))`,
    'g'
  );
  const all: SubStatementCandidate[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(body)) !== null) {
    const sep = m[1];
    const raw = m[3].toLowerCase();
    const punct = m[5];
    const matchStart = m.index + sep.length;

    const lineStart = body.lastIndexOf('\n', matchStart) + 1;
    const lineEnd = body.indexOf('\n', matchStart);
    const lineTrim = body.slice(lineStart, lineEnd === -1 ? body.length : lineEnd).trim();
    if (lineTrim.startsWith('|') && lineTrim.endsWith('|')) continue;

    // Tránh bắt nhầm ký tự giữa câu văn nếu chỉ cách 1 khoảng trắng với dấu ":" hoặc "."
    if (sep === ' ' && (punct === ':' || (punct === '.' && !allowUppercaseFallback))) continue;

    const subId = (raw === 'đ' ? 'd' : raw) as 'a' | 'b' | 'c' | 'd';
    all.push({
      subId,
      starred: Boolean(m[2] || m[4]),
      startIdx: matchStart,
      contentStart: m.index + m[0].length,
      atLineStart: sep === '' || sep === '\n' || sep === '\t',
    });
  }
  return all;
}

function findBestOrderedPartIIStatements(
  body: string,
  allowUppercaseFallback = false
): SubStatementCandidate[] | null {
  const tryCollect = (allowUpper: boolean): SubStatementCandidate[] | null => {
    const all = collectPartIIStatementCandidates(body, allowUpper);
    const byId: Record<'a' | 'b' | 'c' | 'd', SubStatementCandidate[]> = {
      a: all.filter((x) => x.subId === 'a'),
      b: all.filter((x) => x.subId === 'b'),
      c: all.filter((x) => x.subId === 'c'),
      d: all.filter((x) => x.subId === 'd'),
    };
    if (
      byId.a.length === 0 ||
      byId.b.length === 0 ||
      byId.c.length === 0 ||
      byId.d.length === 0
    ) {
      return null;
    }

    let best: SubStatementCandidate[] | null = null;
    let bestScore = -1;
    for (const a of byId.a) {
      for (const b of byId.b) {
        if (b.startIdx <= a.contentStart) continue;
        for (const c of byId.c) {
          if (c.startIdx <= b.contentStart) continue;
          for (const d of byId.d) {
            if (d.startIdx <= c.contentStart) continue;
            const lineCount =
              (a.atLineStart ? 1 : 0) +
              (b.atLineStart ? 1 : 0) +
              (c.atLineStart ? 1 : 0) +
              (d.atLineStart ? 1 : 0);
            const score =
              (a.atLineStart ? 1000 : 0) +
              lineCount * 200 +
              Math.floor((a.startIdx / Math.max(1, body.length)) * 100);
            if (score >= bestScore) {
              bestScore = score;
              best = [a, b, c, d];
            }
          }
        }
      }
    }
    return best;
  };

  const strictLower = tryCollect(false);
  if (strictLower) return strictLower;
  if (allowUppercaseFallback) {
    return tryCollect(true);
  }
  return null;
}

function findPartialOrderedPartIIStatements(body: string): SubStatementCandidate[] {
  const all = collectPartIIStatementCandidates(body, true).sort((x, y) => x.startIdx - y.startIdx);
  const order: ('a' | 'b' | 'c' | 'd')[] = ['a', 'b', 'c', 'd'];
  const picked: SubStatementCandidate[] = [];
  let minIdx = -1;
  for (const subId of order) {
    const candidates = all.filter((c) => c.subId === subId && c.startIdx > minIdx);
    if (candidates.length === 0) continue;
    const preferred = candidates.find((c) => c.atLineStart) || candidates[0];
    picked.push(preferred);
    minIdx = preferred.contentStart;
  }
  return picked;
}

interface ParsedQuestionBlock {
  origNum: number;
  body: string;
  charOffset: number;
}

/**
 * Tách tất cả khối câu hỏi (Câu 1, Câu 02 (0,25đ), Bài 1...) kèm vị trí ký tự chính xác trong văn bản nguồn.
 */
function splitQuestionBlocksWithOffsets(
  sectionText: string,
  sectionBaseOffset: number,
  allowPlainNumberedFallback = false
): ParsedQuestionBlock[] {
  if (!sectionText.trim()) return [];

  // Khớp linh hoạt: "Câu 1:", "Câu 1.", "Câu 01 (0,25đ):", "Câu 1 [NB].", "Câu1:", "Bài 1:"
  const headerRegex =
    /(?:^|\n)[ \t*#>|]*(?:Câu|Bài)\s*(\d{1,3})\s*(?:\([^)\n]{1,40}\)|\[[^\]\n]{1,30}\])?\s*(?:[.:)\-–—]|\t|\n|(?=\s+[A-ZÀ-Ỹ"“(]))/gi;

  const matches: { index: number; headerEnd: number; origNum: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = headerRegex.exec(sectionText)) !== null) {
    const num = parseInt(m[1], 10);
    if (Number.isNaN(num) || num <= 0 || num > 300) continue;
    const startIdx = m.index + (sectionText[m.index] === '\n' ? 1 : 0);
    matches.push({
      index: startIdx,
      headerEnd: m.index + m[0].length,
      origNum: num,
    });
  }

  // Fallback chỉ dùng khi KHÔNG tìm thấy nhãn "Câu/Bài" nào trong phần này nhưng có danh sách đánh số "1. ... 2. ..."
  if (matches.length === 0 && allowPlainNumberedFallback) {
    const plainNumRegex = /(?:^|\n)[ \t*#>]*(\d{1,3})\s*[.)]\s+(?=\S)/g;
    const plainMatches: { index: number; headerEnd: number; origNum: number }[] = [];
    let pm: RegExpExecArray | null;
    while ((pm = plainNumRegex.exec(sectionText)) !== null) {
      const num = parseInt(pm[1], 10);
      if (num >= 1 && num <= 100) {
        const startIdx = pm.index + (sectionText[pm.index] === '\n' ? 1 : 0);
        plainMatches.push({
          index: startIdx,
          headerEnd: pm.index + pm[0].length,
          origNum: num,
        });
      }
    }
    if (plainMatches.length >= 2) {
      matches.push(...plainMatches);
    }
  }

  const blocks: ParsedQuestionBlock[] = [];
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const nextStart = i + 1 < matches.length ? matches[i + 1].index : sectionText.length;
    const body = sectionText.slice(cur.headerEnd, nextStart).trim();
    if (!body) continue;
    blocks.push({
      origNum: cur.origNum,
      body,
      charOffset: sectionBaseOffset + cur.index,
    });
  }

  return blocks;
}

function findGenuineSectionSplitIndex(
  text: string,
  sectionRegex: RegExp,
  minOffset = 0,
  requireFollowingQuestion = true
): number {
  const candidates: number[] = [];
  let m: RegExpExecArray | null;
  sectionRegex.lastIndex = 0;
  while ((m = sectionRegex.exec(text)) !== null) {
    const idx = m.index + (text[m.index] === '\n' ? 1 : 0);
    if (idx < minOffset) continue;
    candidates.push(idx);
  }
  if (candidates.length === 0) return -1;

  for (const idx of candidates) {
    const after = text.slice(idx);
    const before = text.slice(0, idx);
    // Nếu ngay sau tiêu đề này lại có "PHẦN I." (tức tiêu đề nằm trong đoạn giới thiệu cấu trúc đề ở trang 1), bỏ qua!
    const afterHasPartIHeader =
      /(?:^|\n)[ \t*#|]*PHẦN\s*(?:I|1)\b(?:\s*[.:–\-]|\s+Câu|\s+Trắc)/i.test(after.slice(0, 600));
    const beforeHasAnyQuestion = /(?:^|\n)[ \t*#>]*(?:Câu|Bài)\s*\d{1,3}\b/i.test(before);
    if (afterHasPartIHeader && !beforeHasAnyQuestion) {
      continue;
    }
    if (requireFollowingQuestion) {
      const afterHasQuestion = /(?:^|\n)[ \t*#>]*(?:Câu|Bài)\s*\d{1,3}\b/i.test(after);
      const afterHasNumbered = /(?:^|\n)[ \t*#>]*\d{1,2}\s*[.)]\s+\S/.test(after);
      if (!afterHasQuestion && !afterHasNumbered) continue;
    }
    return idx;
  }
  return -1;
}

function trimTrailingExamEndMarker(body: string, isLastBlockOfPart: boolean): string {
  if (!isLastBlockOfPart) return body;
  const endMarker = body.search(
    /(?:^|\n)[ \t*]*(?:[-–—*\s]{2,}\s*HẾT\s*[-–—*\s]{2,}|HẾT\s*[!.]?\s*$|Thí\s+sinh\s+không\s+được\s+sử\s+dụng\s+tài\s+liệu[^\n]*)/i
  );
  if (endMarker > 0) {
    return body.slice(0, endMarker).trim();
  }
  return body;
}

function computeNumberingGaps(originalNumbers: number[]): number[] {
  if (originalNumbers.length === 0) return [];
  const valid = originalNumbers.filter((n) => n >= 1 && n <= 200);
  if (valid.length === 0) return [];
  const uniqueSet = new Set(valid);
  const minNum = Math.min(...valid);
  const rawMax = Math.max(...valid);
  // Chống số bất thường (VD: đánh nhầm Câu 2025) tạo hàng nghìn khoảng trống giả
  const effectiveMax = rawMax <= valid.length + 30 ? rawMax : valid.length;
  const start = minNum <= 5 ? 1 : minNum;
  const missing: number[] = [];
  for (let n = start; n <= effectiveMax; n++) {
    if (!uniqueSet.has(n)) {
      missing.push(n);
    }
  }
  return missing;
}

function createEmptyDiagnostics(): ExamParseDiagnostics {
  const emptyPart: PartReconciliationSummary = {
    detectedCount: 0,
    parsedCount: 0,
    cleanCount: 0,
    reviewCount: 0,
    originalNumbers: [],
    missingNumbers: [],
  };
  return {
    partI: { ...emptyPart },
    partII: { ...emptyPart },
    partIII: { ...emptyPart },
    needsReviewItems: [],
    warnings: [],
    hasIssues: false,
  };
}

/**
 * Bộ phân tích nguyên bản chuyển đổi văn bản đề thi người dùng dán hoặc tải lên (.txt / .docx / .pdf / .json)
 * thành cấu trúc câu hỏi tương tác Phần I (ABCD), Phần II (Đúng/Sai) & Phần III (Trả lời ngắn / Tự luận).
 *
 * CAM KẾT BẢO TOÀN NỘI DUNG (ZERO-DROP):
 * - Giữ nguyên 100% câu chữ, số lượng câu hỏi, bảng biểu và hình ảnh người dùng tải lên.
 * - TUYỆT ĐỐI KHÔNG tự ý cắt giảm, bỏ sót hay chèn thêm câu hỏi ngẫu nhiên.
 * - Các câu bị lệch định dạng PDF vẫn được giữ nguyên và gắn cờ needsReview kèm chẩn đoán để người dùng kiểm tra.
 */
export function parseUserUploadedExamContent(
  rawText: string,
  meta: {
    code: string;
    title: string;
  },
  extractedImages?: Record<string, string>,
  extractedTables?: Record<string, ExamTableData>,
  extractedCharts?: Record<string, ExamChartData>
): {
  partI: MultipleChoiceQuestion[];
  partII: TrueFalseQuestion[];
  partIII: ShortAnswerQuestion[];
  parsedCountI: number;
  parsedCountII: number;
  parsedCountIII: number;
  tableCount: number;
  imageCount: number;
  chartCount: number;
  diagnostics: ExamParseDiagnostics;
} {
  const trimmed = (rawText || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!trimmed) {
    return {
      partI: [],
      partII: [],
      partIII: [],
      parsedCountI: 0,
      parsedCountII: 0,
      parsedCountIII: 0,
      tableCount: 0,
      imageCount: 0,
      chartCount: 0,
      diagnostics: createEmptyDiagnostics(),
    };
  }

  // 1. Thử parse nếu là định dạng JSON trực tiếp
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const obj = JSON.parse(trimmed);
      if (obj && (Array.isArray(obj.partI) || Array.isArray(obj.partII) || Array.isArray(obj.partIII))) {
        const p1: MultipleChoiceQuestion[] = Array.isArray(obj.partI) ? obj.partI : [];
        const p2: TrueFalseQuestion[] = Array.isArray(obj.partII) ? obj.partII : [];
        const p3: ShortAnswerQuestion[] = Array.isArray(obj.partIII) ? obj.partIII : [];
        const diag = createEmptyDiagnostics();
        diag.partI = {
          detectedCount: p1.length,
          parsedCount: p1.length,
          cleanCount: p1.length,
          reviewCount: 0,
          originalNumbers: p1.map((q) => q.number),
          missingNumbers: [],
        };
        diag.partII = {
          detectedCount: p2.length,
          parsedCount: p2.length,
          cleanCount: p2.length,
          reviewCount: 0,
          originalNumbers: p2.map((q) => q.number),
          missingNumbers: [],
        };
        diag.partIII = {
          detectedCount: p3.length,
          parsedCount: p3.length,
          cleanCount: p3.length,
          reviewCount: 0,
          originalNumbers: p3.map((q) => q.number),
          missingNumbers: [],
        };
        return {
          partI: p1,
          partII: p2,
          partIII: p3,
          parsedCountI: p1.length,
          parsedCountII: p2.length,
          parsedCountIII: p3.length,
          tableCount:
            p1.reduce((acc, q) => acc + (q.tableData ? 1 : 0) + (q.extraTables?.length || 0), 0) +
            p2.reduce((acc, q) => acc + (q.tableData ? 1 : 0) + (q.extraTables?.length || 0), 0) +
            p3.reduce((acc, q) => acc + (q.tableData ? 1 : 0) + (q.extraTables?.length || 0), 0),
          imageCount:
            p1.filter((q) => Boolean(q.imageUrl)).length +
            p2.filter((q) => Boolean(q.imageUrl)).length +
            p3.filter((q) => Boolean(q.imageUrl)).length,
          chartCount:
            p1.reduce((acc, q) => acc + (q.chartData ? 1 : 0) + (q.extraCharts?.length || 0), 0) +
            p2.reduce((acc, q) => acc + (q.chartData ? 1 : 0) + (q.extraCharts?.length || 0), 0) +
            p3.reduce((acc, q) => acc + (q.chartData ? 1 : 0) + (q.extraCharts?.length || 0), 0),
          diagnostics: diag,
        };
      }
    } catch {
      // Không phải JSON hợp lệ -> tiếp tục parse văn bản
    }
  }

  // 2. Tách phần Bảng Đáp Án ở cuối đề một cách an toàn (không bao giờ cắt nhầm đáp án xen kẽ trong đề)
  const { examBodyText, partIAnswerKey, partIIAnswerKey, partIIIAnswerKey } =
    extractTrailingAnswerSection(trimmed);

  // Loại bỏ các dòng chân trang PDF lặp lại ("Trang 2/4", "Mã đề 0701") mà giữ nguyên mọi nội dung câu hỏi
  const sanitizedBody = stripRunningPdfPageMarkers(examBodyText);

  // 3. Tách Phần I, Phần II (Đúng/Sai) và Phần III (Trả lời ngắn / Tự luận)
  const partIIHeadingRegex =
    /(?:^|\n)[ \t*#|]*(?:P\s*H\s*Ầ\s*N\s*(?:I\s*I|2)\b|PHẦN\s*(?:II|2)\b|II\.\s*(?:CÂU\s+)?(?:TRẮC\s+NGHIỆM\s+)?ĐÚNG\s*[-–/ ]?\s*SAI\b|[B2]\.\s*(?:CÂU\s+)?TRẮC\s+NGHIỆM\s+ĐÚNG\s*[-–/ ]?\s*SAI\b)[^\n]*/gi;
  const partIIIHeadingRegex =
    /(?:^|\n)[ \t*#|]*(?:P\s*H\s*Ầ\s*N\s*(?:I\s*I\s*I|3)\b|PHẦN\s*(?:III|3)\b|III\.\s*(?:CÂU\s+)?(?:TRẮC\s+NGHIỆM\s+)?(?:TRẢ\s+LỜI\s+NGẮN|TỰ\s+LUẬN)\b|[C3]\.\s*(?:CÂU\s+)?(?:TRẮC\s+NGHIỆM\s+TRẢ\s+LỜI\s+NGẮN|TỰ\s+LUẬN)\b|(?:PHẦN\s+)?TỰ\s+LUẬN\s*(?:\(|:|\.|\n|$))[^\n]*/gi;

  const partIIIdx = findGenuineSectionSplitIndex(sanitizedBody, partIIHeadingRegex, 0, true);
  const partIIIIdx = findGenuineSectionSplitIndex(
    sanitizedBody,
    partIIIHeadingRegex,
    partIIIdx >= 0 ? partIIIdx + 6 : 0,
    true
  );

  const partIEnd =
    partIIIdx >= 0 ? partIIIdx : partIIIIdx >= 0 ? partIIIIdx : sanitizedBody.length;
  const partIText = sanitizedBody.slice(0, partIEnd);
  const partIIText =
    partIIIdx >= 0
      ? sanitizedBody.slice(partIIIdx, partIIIIdx >= 0 ? partIIIIdx : sanitizedBody.length)
      : '';
  const partIIIText = partIIIIdx >= 0 ? sanitizedBody.slice(partIIIIdx) : '';

  let tableCount = 0;
  let imageCount = 0;
  let chartCount = 0;

  const parsedPartI: MultipleChoiceQuestion[] = [];
  const parsedPartII: TrueFalseQuestion[] = [];
  const parsedPartIII: ShortAnswerQuestion[] = [];
  const needsReviewItems: ParseReviewItem[] = [];

  const partIOrigNumbers: number[] = [];
  const partIIOrigNumbers: number[] = [];
  const partIIIOrigNumbers: number[] = [];

  const findCharOffsetInRaw = (snippet: string, approxOffset: number): number => {
    const cleanProbe = snippet.replace(/\s+/g, ' ').trim().slice(0, 36);
    if (!cleanProbe) return Math.max(0, Math.min(approxOffset, trimmed.length));
    const exactIdx = trimmed.indexOf(snippet.slice(0, 32), Math.max(0, approxOffset - 250));
    if (exactIdx >= 0) return exactIdx;
    const looseIdx = trimmed.indexOf(snippet.slice(0, 20));
    return looseIdx >= 0 ? looseIdx : Math.max(0, Math.min(approxOffset, trimmed.length));
  };

  const buildTrueFalseQuestionFromBlock = (
    block: ParsedQuestionBlock,
    isLastBlock: boolean,
    allowUppercaseFallback: boolean
  ): TrueFalseQuestion => {
    let body = trimTrailingExamEndMarker(unwrapOptionPipeLines(block.body), isLastBlock);
    const origNum = block.origNum;

    const fullSubs = findBestOrderedPartIIStatements(body, allowUppercaseFallback);
    const partialSubs = fullSubs ? fullSubs : findPartialOrderedPartIIStatements(body);
    const isMalformed = !fullSubs;

    const firstSubStart = partialSubs.length > 0 ? partialSubs[0].startIdx : body.length;
    const rawScenario = body.slice(0, firstSubStart).trim();
    const imgExtracted = extractImageTokens(rawScenario, extractedImages);
    const chartExtracted = extractChartTokens(imgExtracted.cleanedText, extractedCharts);
    const tblExtracted = extractTableAndCitationFromBlock(chartExtracted.cleanedText, extractedTables);
    if (tblExtracted.tableData) tableCount += 1 + (tblExtracted.extraTables?.length || 0);
    if (imgExtracted.imageUrl) imageCount += imgExtracted.images ? imgExtracted.images.length : 1;
    if (chartExtracted.chartData) chartCount += 1 + (chartExtracted.extraCharts?.length || 0);

    const tfNum = parsedPartII.length + 1;
    const hasAnyStarred = partialSubs.some((s) => s.starred);
    const keyForTf = partIIAnswerKey[origNum];

    const subMap = new Map<'a' | 'b' | 'c' | 'd', { text: string; isCorrect: boolean }>();
    for (let idx = 0; idx < partialSubs.length; idx++) {
      const sub = partialSubs[idx];
      const nextIdx = idx + 1 < partialSubs.length ? partialSubs[idx + 1].startIdx : body.length;
      let stText = body.slice(sub.contentStart, nextIdx).trim();

      if (idx + 1 < partialSubs.length && /\s*\*+$/.test(stText) && !partialSubs[idx + 1].starred) {
        stText = stText.replace(/\s*\*+$/, '').trim();
        partialSubs[idx + 1].starred = true;
      }

      let isCorrect =
        keyForTf && typeof keyForTf[sub.subId] === 'boolean'
          ? Boolean(keyForTf[sub.subId])
          : hasAnyStarred
          ? sub.starred
          : false;

      const tfTagMatch = stText.match(/\s*[[(]?\s*(Đúng|Sai|Đ|S)\s*[\])]?\s*$/i);
      if (tfTagMatch && tfTagMatch.index !== undefined) {
        const tag = tfTagMatch[1].toUpperCase();
        isCorrect = tag === 'ĐÚNG' || tag === 'Đ';
        stText = stText.slice(0, tfTagMatch.index).trim();
      }

      stText = stText
        .replace(/\[\[(?:IMG|CHART):[^\]]+\]\]/g, '')
        .replace(/[ \t]+/g, ' ')
        .trim();

      subMap.set(sub.subId, { text: stText, isCorrect });
    }

    const allSubIds: ('a' | 'b' | 'c' | 'd')[] = ['a', 'b', 'c', 'd'];
    const missingSubIds = allSubIds.filter((sid) => !subMap.has(sid));
    const reviewReason = isMalformed
      ? missingSubIds.length === 4
        ? 'Không tìm thấy đủ 4 ý a), b), c), d) trong PDF — đã giữ nguyên toàn bộ nội dung gốc để bạn kiểm tra.'
        : `Thiếu hoặc lệch định dạng ý ${missingSubIds.map((s) => `${s})`).join(', ')} — đã giữ nguyên nội dung gốc để bạn kiểm tra.`
      : undefined;

    const statements = allSubIds.map((sid, idx) => {
      const found = subMap.get(sid);
      const isCorrect = found
        ? found.isCorrect
        : Boolean(keyForTf && typeof keyForTf[sid] === 'boolean' ? keyForTf[sid] : false);
      return {
        subId: sid,
        text:
          found && found.text
            ? found.text
            : '[Chưa tách được nhận định từ PDF — cần kiểm tra lại]',
        level: (idx === 0 ? 'NB' : idx === 1 ? 'TH' : 'VD') as 'NB' | 'TH' | 'VD',
        isCorrect,
        explanation: `Nhận định (${sid}) là ${isCorrect ? 'Đúng' : 'Sai'}.`,
      } as TrueFalseStatement;
    }) as [TrueFalseStatement, TrueFalseStatement, TrueFalseStatement, TrueFalseStatement];

    const inferred = inferDomainAndGrade(tblExtracted.cleanedText);
    const tfDomain: SubjectDomain =
      inferred.domain === 'forestry' || inferred.domain === 'aquaculture'
        ? inferred.domain
        : 'aquaculture';

    if (isMalformed && reviewReason) {
      needsReviewItems.push({
        part: 'II',
        number: tfNum,
        originalNumber: origNum,
        reason: reviewReason,
        snippet: (tblExtracted.cleanedText || body).slice(0, 90),
        charOffset: findCharOffsetInRaw(`Câu ${origNum}`, block.charOffset),
      });
    }

    return {
      id: `up_${meta.code}_tf${tfNum}`,
      number: tfNum,
      originalNumber: origNum,
      domain: tfDomain,
      scenarioTitle: `Câu ${origNum} – Phần II`,
      scenario: tblExtracted.cleanedText || body,
      ...(imgExtracted.imageUrl ? { imageUrl: imgExtracted.imageUrl } : {}),
      ...(imgExtracted.images ? { images: imgExtracted.images } : {}),
      ...(tblExtracted.citation ? { citation: tblExtracted.citation } : {}),
      ...(tblExtracted.tableData ? { tableData: tblExtracted.tableData } : {}),
      ...(tblExtracted.extraTables ? { extraTables: tblExtracted.extraTables } : {}),
      ...(chartExtracted.chartData ? { chartData: chartExtracted.chartData } : {}),
      ...(chartExtracted.extraCharts ? { extraCharts: chartExtracted.extraCharts } : {}),
      statements,
      textbookRef: 'Đề thi do giáo viên tải lên hệ thống',
      ...(isMalformed ? { needsReview: true, reviewReason } : {}),
    };
  };

  // 4. Parse TOÀN BỘ các câu hỏi ở Phần I (Zero-Drop: không bao giờ bỏ sót câu lệch định dạng)
  const partIBlocks = splitQuestionBlocksWithOffsets(partIText, 0, true);
  for (let i = 0; i < partIBlocks.length; i++) {
    const block = partIBlocks[i];
    const isLastOfPartI = i === partIBlocks.length - 1;
    let body = trimTrailingExamEndMarker(unwrapOptionPipeLines(block.body), isLastOfPartI);
    const origNum = block.origNum;

    const bestOpts = findBestOrderedPartIOptions(body);

    // Nếu không tìm thấy A/B/C/D nhưng lại có trọn bộ a) b) c) d) -> tự động nhận diện là câu Phần II (Đúng/Sai) bị thiếu tiêu đề PHẦN II!
    if (!bestOpts) {
      const hiddenPartIISubs = findBestOrderedPartIIStatements(body, false);
      if (hiddenPartIISubs) {
        partIIOrigNumbers.push(origNum);
        parsedPartII.push(buildTrueFalseQuestionFromBlock(block, isLastOfPartI, false));
        continue;
      }
    }

    partIOrigNumbers.push(origNum);

    const partialOpts = bestOpts ? bestOpts : findPartialOrderedPartIOptions(body);
    const isMalformed = !bestOpts;

    const firstOptStart = partialOpts.length > 0 ? partialOpts[0].startIdx : body.length;
    const rawStem = body.slice(0, firstOptStart).trim();
    const imgExtracted = extractImageTokens(rawStem, extractedImages);
    const chartExtracted = extractChartTokens(imgExtracted.cleanedText, extractedCharts);
    const tblExtracted = extractTableAndCitationFromBlock(chartExtracted.cleanedText, extractedTables);
    if (tblExtracted.tableData) tableCount += 1 + (tblExtracted.extraTables?.length || 0);
    if (imgExtracted.imageUrl) imageCount += imgExtracted.images ? imgExtracted.images.length : 1;
    if (chartExtracted.chartData) chartCount += 1 + (chartExtracted.extraCharts?.length || 0);

    const options: { A: string; B: string; C: string; D: string } = {
      A: '',
      B: '',
      C: '',
      D: '',
    };
    let detectedCorrect: 'A' | 'B' | 'C' | 'D' = partIAnswerKey[origNum] || 'A';
    let savedExpl = '';

    for (let k = 0; k < partialOpts.length; k++) {
      const cur = partialOpts[k];
      const nextIdx = k + 1 < partialOpts.length ? partialOpts[k + 1].startIdx : body.length;
      let optContent = body.slice(cur.contentStart, nextIdx).trim();

      if (k + 1 < partialOpts.length && /\s*\*+$/.test(optContent) && !partialOpts[k + 1].starred) {
        optContent = optContent.replace(/\s*\*+$/, '').trim();
        partialOpts[k + 1].starred = true;
      }

      const inlineExplMatch = optContent.match(
        /(?:^|\n)\s*(?:Lời\s*giải|Giải\s*thích|HD)\s*[:\-]\s*([\s\S]+)$/i
      );
      if (inlineExplMatch && inlineExplMatch.index !== undefined) {
        savedExpl = inlineExplMatch[1].trim();
        optContent = optContent.slice(0, inlineExplMatch.index).trim();
      }
      const inlineAnsMatch = optContent.match(
        /(?:\n|^|\s)(?:Đáp\s*án|Chọn)\s*[:\-]?\s*([ABCD])\b/i
      );
      if (inlineAnsMatch && inlineAnsMatch.index !== undefined) {
        detectedCorrect = inlineAnsMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
        optContent = optContent.slice(0, inlineAnsMatch.index).trim();
      }

      optContent = optContent
        .replace(/\[\[(?:IMG|CHART):[^\]]+\]\]/g, '')
        .replace(/[ \t]+/g, ' ')
        .trim();

      options[cur.letter] = optContent;
      if (cur.starred) {
        detectedCorrect = cur.letter;
      }
    }

    const foundLetters = new Set(partialOpts.map((o) => o.letter));
    const missingLetters = (['A', 'B', 'C', 'D'] as const).filter((l) => !foundLetters.has(l));
    for (const ml of missingLetters) {
      options[ml] = '[Chưa tách được phương án từ PDF — cần kiểm tra lại]';
    }

    const reviewReason = isMalformed
      ? missingLetters.length === 4
        ? 'Không tìm thấy ký tự phân tách A., B., C., D. trong PDF — đã giữ nguyên toàn bộ câu gốc để bạn kiểm tra.'
        : `Thiếu hoặc dính chữ ở phương án ${missingLetters.join(', ')} — đã giữ nguyên câu gốc để bạn kiểm tra.`
      : undefined;

    const qNum = parsedPartI.length + 1;
    const finalQuestionText = tblExtracted.cleanedText || body;
    const { domain, grade } = inferDomainAndGrade(
      `${finalQuestionText} ${options.A} ${options.B} ${options.C} ${options.D}`
    );

    if (isMalformed && reviewReason) {
      needsReviewItems.push({
        part: 'I',
        number: qNum,
        originalNumber: origNum,
        reason: reviewReason,
        snippet: finalQuestionText.slice(0, 90),
        charOffset: findCharOffsetInRaw(`Câu ${origNum}`, block.charOffset),
      });
    }

    parsedPartI.push({
      id: `up_${meta.code}_q${qNum}`,
      number: qNum,
      originalNumber: origNum,
      grade,
      domain,
      level: tblExtracted.tableData || chartExtracted.chartData ? 'VD' : 'NB',
      question: finalQuestionText,
      ...(imgExtracted.imageUrl ? { imageUrl: imgExtracted.imageUrl } : {}),
      ...(imgExtracted.images ? { images: imgExtracted.images } : {}),
      ...(tblExtracted.tableData ? { tableData: tblExtracted.tableData } : {}),
      ...(tblExtracted.extraTables ? { extraTables: tblExtracted.extraTables } : {}),
      ...(chartExtracted.chartData ? { chartData: chartExtracted.chartData } : {}),
      ...(chartExtracted.extraCharts ? { extraCharts: chartExtracted.extraCharts } : {}),
      options,
      correctAnswer: detectedCorrect,
      explanation:
        savedExpl || `Đáp án đúng là ${detectedCorrect}. (Nguyên bản từ đề: ${meta.title})`,
      textbookRef: 'Đề thi do giáo viên tải lên hệ thống',
      ...(isMalformed ? { needsReview: true, reviewReason } : {}),
    });
  }

  // 5. Parse TOÀN BỘ các câu Đúng/Sai ở Phần II (Zero-Drop)
  if (partIIText) {
    const tfBlocks = splitQuestionBlocksWithOffsets(partIIText, Math.max(0, partIIIdx), true);
    for (let i = 0; i < tfBlocks.length; i++) {
      const block = tfBlocks[i];
      partIIOrigNumbers.push(block.origNum);
      parsedPartII.push(buildTrueFalseQuestionFromBlock(block, i === tfBlocks.length - 1, true));
    }
  }

  // 6. Parse TOÀN BỘ các câu Trả lời ngắn / Tự luận ở Phần III (Zero-Drop)
  if (partIIIText) {
    const p3Blocks = splitQuestionBlocksWithOffsets(partIIIText, Math.max(0, partIIIIdx), true);
    for (let i = 0; i < p3Blocks.length; i++) {
      const block = p3Blocks[i];
      const origNum = block.origNum;
      partIIIOrigNumbers.push(origNum);

      let body = trimTrailingExamEndMarker(block.body, i === p3Blocks.length - 1);
      let expectedAnswer = partIIIAnswerKey[origNum] || '';
      let explanation = '';

      const explMatch = body.match(
        /(?:^|\n)\s*(?:Lời\s*giải|Giải\s*thích|Hướng\s*dẫn\s*giải|HD)\s*[:\-]\s*([\s\S]+)$/i
      );
      if (explMatch && explMatch.index !== undefined) {
        explanation = explMatch[1].trim();
        body = body.slice(0, explMatch.index).trim();
      }
      const ansMatch = body.match(/(?:^|\n)\s*(?:Đáp\s*án|Đáp\s*số)\s*[:\-]\s*([^\n]+)$/i);
      if (ansMatch && ansMatch.index !== undefined) {
        expectedAnswer = ansMatch[1].trim();
        body = body.slice(0, ansMatch.index).trim();
      }

      const imgExtracted = extractImageTokens(body, extractedImages);
      const chartExtracted = extractChartTokens(imgExtracted.cleanedText, extractedCharts);
      const tblExtracted = extractTableAndCitationFromBlock(chartExtracted.cleanedText, extractedTables);
      if (tblExtracted.tableData) tableCount += 1 + (tblExtracted.extraTables?.length || 0);
      if (imgExtracted.imageUrl) imageCount += imgExtracted.images ? imgExtracted.images.length : 1;
      if (chartExtracted.chartData) chartCount += 1 + (chartExtracted.extraCharts?.length || 0);

      const qNum = parsedPartIII.length + 1;
      const finalQ = tblExtracted.cleanedText || body;
      const isTooShort = finalQ.trim().length < 5;
      const reviewReason = isTooShort
        ? 'Nội dung câu hỏi Phần III quá ngắn hoặc bị lỗi ký tự PDF — vui lòng kiểm tra lại.'
        : undefined;

      if (isTooShort && reviewReason) {
        needsReviewItems.push({
          part: 'III',
          number: qNum,
          originalNumber: origNum,
          reason: reviewReason,
          snippet: finalQ.slice(0, 90),
          charOffset: findCharOffsetInRaw(`Câu ${origNum}`, block.charOffset),
        });
      }

      const inferred = inferDomainAndGrade(finalQ);
      parsedPartIII.push({
        id: `up_${meta.code}_sa${qNum}`,
        number: qNum,
        originalNumber: origNum,
        domain: inferred.domain,
        question: finalQ,
        ...(imgExtracted.imageUrl ? { imageUrl: imgExtracted.imageUrl } : {}),
        ...(imgExtracted.images ? { images: imgExtracted.images } : {}),
        ...(tblExtracted.tableData ? { tableData: tblExtracted.tableData } : {}),
        ...(tblExtracted.extraTables ? { extraTables: tblExtracted.extraTables } : {}),
        ...(chartExtracted.chartData ? { chartData: chartExtracted.chartData } : {}),
        ...(chartExtracted.extraCharts ? { extraCharts: chartExtracted.extraCharts } : {}),
        ...(expectedAnswer ? { expectedAnswer } : {}),
        ...(explanation ? { explanation } : {}),
        textbookRef: 'Đề thi do giáo viên tải lên hệ thống',
        ...(isTooShort ? { needsReview: true, reviewReason } : {}),
      });
    }
  }

  // 7. Tổng hợp bảng đối chiếu số câu phát hiện vs câu bị thiếu / lệch định dạng
  const missingI = computeNumberingGaps(partIOrigNumbers);
  const missingII = computeNumberingGaps(partIIOrigNumbers);
  const missingIII = computeNumberingGaps(partIIIOrigNumbers);

  const reviewCountI = parsedPartI.filter((q) => q.needsReview).length;
  const reviewCountII = parsedPartII.filter((q) => q.needsReview).length;
  const reviewCountIII = parsedPartIII.filter((q) => q.needsReview).length;

  const warnings: string[] = [];
  if (missingI.length > 0) {
    warnings.push(
      `Phần I phát hiện khoảng trống đánh số ở các câu: ${missingI.map((n) => `Câu ${n}`).join(', ')}.`
    );
  }
  if (missingII.length > 0) {
    warnings.push(
      `Phần II phát hiện khoảng trống đánh số ở các câu: ${missingII.map((n) => `Câu ${n}`).join(', ')}.`
    );
  }
  if (missingIII.length > 0) {
    warnings.push(
      `Phần III phát hiện khoảng trống đánh số ở các câu: ${missingIII.map((n) => `Câu ${n}`).join(', ')}.`
    );
  }
  if (partIIIdx >= 0 && parsedPartII.length === 0) {
    warnings.push('Phát hiện tiêu đề PHẦN II nhưng chưa tách được câu Đúng/Sai nào — vui lòng kiểm tra lại định dạng câu hỏi.');
  }
  if (partIIIIdx >= 0 && parsedPartIII.length === 0) {
    warnings.push('Phát hiện tiêu đề PHẦN III nhưng chưa tách được câu nào — vui lòng kiểm tra lại định dạng câu hỏi.');
  }

  const diagnostics: ExamParseDiagnostics = {
    partI: {
      detectedCount: partIOrigNumbers.length,
      parsedCount: parsedPartI.length,
      cleanCount: parsedPartI.length - reviewCountI,
      reviewCount: reviewCountI,
      originalNumbers: partIOrigNumbers,
      missingNumbers: missingI,
    },
    partII: {
      detectedCount: partIIOrigNumbers.length,
      parsedCount: parsedPartII.length,
      cleanCount: parsedPartII.length - reviewCountII,
      reviewCount: reviewCountII,
      originalNumbers: partIIOrigNumbers,
      missingNumbers: missingII,
    },
    partIII: {
      detectedCount: partIIIOrigNumbers.length,
      parsedCount: parsedPartIII.length,
      cleanCount: parsedPartIII.length - reviewCountIII,
      reviewCount: reviewCountIII,
      originalNumbers: partIIIOrigNumbers,
      missingNumbers: missingIII,
    },
    needsReviewItems,
    warnings,
    hasIssues:
      warnings.length > 0 ||
      needsReviewItems.length > 0 ||
      missingI.length > 0 ||
      missingII.length > 0 ||
      missingIII.length > 0,
  };

  return {
    partI: parsedPartI,
    partII: parsedPartII,
    partIII: parsedPartIII,
    parsedCountI: parsedPartI.length,
    parsedCountII: parsedPartII.length,
    parsedCountIII: parsedPartIII.length,
    tableCount,
    imageCount,
    chartCount,
    diagnostics,
  };
}
