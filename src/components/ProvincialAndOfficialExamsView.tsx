import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  CornerDownRight,
  Download,
  Eye,
  FileCheck2,
  FileText,
  FolderUp,
  Loader2,
  Lock,
  Play,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
  User,
  X,
} from 'lucide-react';
import { Exam, ExamChartData, ExamTableData } from '../types/exam';
import { AuthUser } from '../types/auth';
import { authService, incrementFreeTrialDownloadCount } from '../services/authService';
import {
  BUILTIN_PROVINCIAL_AND_OFFICIAL_EXAMS,
  ExternalExamCategory,
  ExternalExamItem,
  PROVINCE_LIST,
  convertClipboardHtmlToStructuredText,
  extractAllTablesAndBlocksFromDocument,
  extractStructuredFromDocxFile,
  extractStructuredFromPdfFile,
  extractTableAndCitationFromBlock,
  parseUserUploadedExamContent,
} from '../data/provincialAndOfficialExams';
import { TrueFalseScenarioDisplay } from './TrueFalseScenarioDisplay';
import { DocumentTable, RichDocumentContent } from './DocumentTable';
import { DocumentChart } from './DocumentChart';

interface ProvincialAndOfficialExamsViewProps {
  fixedCategory: ExternalExamCategory;
  currentUser?: AuthUser | null;
  uploadedExams: ExternalExamItem[];
  onUploadExamSuccess: (newExam: ExternalExamItem) => Promise<void> | void;
  onDeleteUploadedExam: (examId: string) => Promise<void> | void;
  onStartExam: (exam: Exam) => void;
  onAssignQr: (exam: Exam) => void;
  onPrintExam: (exam: Exam) => void;
  canDownloadDocuments?: boolean;
  onRequireVipUpgrade?: () => void;
  onRequireLogin?: (reason?: string) => void;
  embeddedSection?: boolean;
  externalOpenUploadSignal?: number;
}

const SAMPLE_PASTE_TEMPLATE = `Câu 1: Phát biểu nào sau đây đúng về vai trò của rừng phòng hộ đầu nguồn?
A. Cung cấp gỗ lớn phục vụ xuất khẩu công nghiệp.
*B. Điều tiết nguồn nước, hạn chế lũ lụt và chống xói mòn đất.
C. Chỉ dùng để nuôi trồng thủy sản nước lợ.
D. Nơi xây dựng các khu công nghiệp chế biến gỗ.

Câu 2: Trong nuôi trồng thủy sản theo tiêu chuẩn VietGAP, biện pháp nào sau đây giúp cải thiện chất lượng nước ao nuôi an toàn sinh học?
A. Sử dụng kháng sinh liều cao định kì hằng tuần.
B. Xả trực tiếp nước thải chưa xử lí ra kênh rạch.
*C. Sử dụng chế phẩm vi sinh (men vi sinh) để phân hủy mùn bã hữu cơ đáy ao.
D. Tăng mật độ thả nuôi gấp 3 lần khuyến cáo.

PHẦN II. Câu trắc nghiệm đúng sai
Câu 1: Một hợp tác xã lâm nghiệp tại Nghệ An tiến hành trồng rừng gỗ lớn Keo tai tượng theo tiêu chuẩn FSC với mật độ 1.600 cây/ha.
*a) Trồng rừng theo chứng chỉ FSC giúp nâng cao giá trị kinh tế gỗ thương phẩm và bảo vệ hệ sinh thái bền vững. (Đúng)
b) Rừng trồng gỗ lớn Keo tai tượng được phép khai thác trắng toàn bộ diện tích khi cây mới 2 năm tuổi. (Sai)
*c) Tỉa thưa định kì giúp cây rừng còn lại có không gian dinh dưỡng và đường kính thân phát triển tốt hơn. (Đúng)
d) Không cần thực hiện các biện pháp phòng cháy, chữa cháy rừng đối với rừng keo thuần loài. (Sai)`;

function detectProvinceFromText(text: string): string | null {
  const norm = text.toLowerCase();
  const map: [string[], string][] = [
    [['bộ giáo dục', 'bộ gd', 'chính thức bộ', 'minh họa bộ'], 'Bộ Giáo dục và Đào tạo'],
    [['hà nội', 'ha noi'], 'Sở GD&ĐT Hà Nội'],
    [['hồ chí minh', 'tp.hcm', 'tphcm', 'ho chi minh'], 'Sở GD&ĐT TP. Hồ Chí Minh'],
    [['cần thơ', 'can tho'], 'Sở GD&ĐT Cần Thơ'],
    [['đà nẵng', 'da nang'], 'Sở GD&ĐT Đà Nẵng'],
    [['hải phòng', 'hai phong'], 'Sở GD&ĐT Hải Phòng'],
    [['nghệ an', 'nghe an'], 'Sở GD&ĐT Nghệ An'],
    [['nam định', 'nam dinh'], 'Sở GD&ĐT Nam Định'],
    [['ninh bình', 'ninh binh'], 'Sở GD&ĐT Ninh Bình'],
    [['an giang'], 'Sở GD&ĐT An Giang'],
    [['thanh hóa', 'thanh hoa'], 'Sở GD&ĐT Thanh Hóa'],
    [['bắc ninh', 'bac ninh'], 'Sở GD&ĐT Bắc Ninh'],
    [['vĩnh phúc', 'vinh phuc'], 'Sở GD&ĐT Vĩnh Phúc'],
    [['phú thọ', 'phu tho'], 'Sở GD&ĐT Phú Thọ'],
    [['thái bình', 'thai binh'], 'Sở GD&ĐT Thái Bình'],
    [['bắc giang', 'bac giang'], 'Sở GD&ĐT Bắc Giang'],
    [['hải dương', 'hai duong'], 'Sở GD&ĐT Hải Dương'],
    [['hà tĩnh', 'ha tinh'], 'Sở GD&ĐT Hà Tĩnh'],
    [['quảng ninh', 'quang ninh'], 'Sở GD&ĐT Quảng Ninh'],
    [['đồng nai', 'dong nai'], 'Sở GD&ĐT Đồng Nai'],
    [['bình dương', 'binh duong'], 'Sở GD&ĐT Bình Dương'],
    [['lâm đồng', 'lam dong'], 'Sở GD&ĐT Lâm Đồng'],
    [['đắk lắk', 'dak lak'], 'Sở GD&ĐT Đắk Lắk'],
    [['gia lai'], 'Sở GD&ĐT Gia Lai'],
    [['đồng tháp', 'dong thap'], 'Sở GD&ĐT Đồng Tháp'],
  ];
  for (const [keywords, province] of map) {
    if (keywords.some((kw) => norm.includes(kw))) {
      return province;
    }
  }
  return null;
}

function formatUploadTimestamp(isoString?: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  const dd = pad(date.getDate());
  const mo = pad(date.getMonth() + 1);
  const yyyy = date.getFullYear();
  return `${hh}:${mm}:${ss} · ${dd}/${mo}/${yyyy}`;
}

function formatRelativeUploadTime(isoString?: string, nowMs: number = Date.now()): string {
  if (!isoString) return '';
  const ts = Date.parse(isoString);
  if (Number.isNaN(ts)) return '';
  const diffSec = Math.max(0, Math.floor((nowMs - ts) / 1000));
  if (diffSec < 60) return 'vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay <= 7) return `${diffDay} ngày trước`;
  return '';
}

export const ProvincialAndOfficialExamsView: React.FC<ProvincialAndOfficialExamsViewProps> = ({
  fixedCategory,
  currentUser,
  uploadedExams,
  onUploadExamSuccess,
  onDeleteUploadedExam,
  onStartExam,
  onAssignQr,
  onPrintExam,
  canDownloadDocuments = true,
  onRequireVipUpgrade,
  onRequireLogin,
  embeddedSection = false,
  externalOpenUploadSignal = 0,
}) => {
  const isOfficialTab = fixedCategory === 'official_past_year';
  const isReferenceTab = fixedCategory === 'reference_exam';
  const isAdmin = Boolean(
    currentUser &&
      (currentUser.role === 'admin' || currentUser.username.toLowerCase() === 'admin')
  );
  const isTeacher = Boolean(
    currentUser && (currentUser.role === 'teacher' || isAdmin)
  );
  // Chỉ người dùng là Giáo viên mới được đăng tài liệu lên hệ thống (Đề chính thức chỉ Admin được đăng)
  const canUploadExam = isOfficialTab ? isAdmin : isTeacher;

  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);
  const [showAnswersInPreview, setShowAnswersInPreview] = useState<Record<string, boolean>>({});

  // Modal Tải đề lên hệ thống (gắn cố định theo thẻ hiện tại)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCode, setUploadCode] = useState('');
  const [uploadProvince, setUploadProvince] = useState(
    isOfficialTab
      ? 'Bộ Giáo dục và Đào tạo'
      : isReferenceTab
      ? 'Tài liệu Giáo viên / Trường THPT chia sẻ'
      : 'Sở GD&ĐT Hà Nội'
  );
  const [customProvinceText, setCustomProvinceText] = useState('');
  const [uploadSchoolOrRound, setUploadSchoolOrRound] = useState(
    isOfficialTab
      ? 'Đề Chính Thức Kỳ Thi Tốt Nghiệp THPT'
      : isReferenceTab
      ? 'Đề Tham Khảo / Tài Liệu Ôn Thi THPT'
      : 'Thi Thử Tốt Nghiệp THPT Lần 1'
  );
  const [uploadYear, setUploadYear] = useState<number>(2026);
  const [uploadDuration, setUploadDuration] = useState<number>(50);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadRawText, setUploadRawText] = useState('');
  const [extractedImages, setExtractedImages] = useState<Record<string, string>>({});
  const [extractedTables, setExtractedTables] = useState<Record<string, ExamTableData>>({});
  const [extractedCharts, setExtractedCharts] = useState<Record<string, ExamChartData>>({});
  const [hasManualProvinceChoice, setHasManualProvinceChoice] = useState(false);
  const lastExternalSignalRef = useRef<number>(externalOpenUploadSignal);
  const [fileReadSummary, setFileReadSummary] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string>('');
  const [attachedFileDataUrl, setAttachedFileDataUrl] = useState<string>('');
  const [pdfExtractMeta, setPdfExtractMeta] = useState<{
    pageCount?: number;
    extractedPageCount?: number;
    warnings?: string[];
  } | null>(null);
  const rawTextAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [uploadSubmitting, setUploadSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [confirmDeleteExamId, setConfirmDeleteExamId] = useState<string | null>(null);
  const [deletingExamId, setDeletingExamId] = useState<string | null>(null);
  const [nowTickMs, setNowTickMs] = useState<number>(() => Date.now());

  // Đồng hồ thời gian thực: cập nhật mỗi giây khi mở cửa sổ đăng tài liệu, và mỗi 30 giây ở danh sách
  useEffect(() => {
    const intervalMs = isUploadModalOpen ? 1000 : 30000;
    setNowTickMs(Date.now());
    const timer = window.setInterval(() => {
      setNowTickMs(Date.now());
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isUploadModalOpen]);

  const normalizedCurrentUsernameForFilter = (currentUser?.username || '')
    .trim()
    .replace(/^@+/, '')
    .toLowerCase();

  const tabExams: ExternalExamItem[] = useMemo(() => {
    const sortedUploaded = [...uploadedExams].sort((a, b) => {
      const ta = Date.parse(a.uploadedAt || '') || 0;
      const tb = Date.parse(b.uploadedAt || '') || 0;
      return tb - ta;
    });
    const merged: ExternalExamItem[] = [...sortedUploaded];
    BUILTIN_PROVINCIAL_AND_OFFICIAL_EXAMS.forEach((b) => {
      if (!merged.some((u) => u.id === b.id)) {
        merged.push(b);
      }
    });
    return merged.filter((e) => {
      if (e.category !== fixedCategory) return false;
      // Tài liệu do người dùng (không phải Admin) đăng lên: CHỈ chính người đăng và Admin được xem/quản lý/sử dụng
      if (e.isUserUploaded && e.category !== 'official_past_year') {
        const ownerKey = (e.uploadedBy || '').trim().replace(/^@+/, '').toLowerCase();
        if (ownerKey !== 'admin') {
          if (isAdmin) return true;
          return Boolean(
            normalizedCurrentUsernameForFilter &&
              ownerKey &&
              ownerKey !== 'guest' &&
              ownerKey === normalizedCurrentUsernameForFilter
          );
        }
      }
      return true;
    });
  }, [uploadedExams, fixedCategory, isAdmin, normalizedCurrentUsernameForFilter]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    tabExams.forEach((e) => {
      if (e.examYear) years.add(e.examYear);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [tabExams]);

  const availableProvinces = useMemo(() => {
    const provs = new Set<string>();
    tabExams.forEach((e) => {
      if (e.provinceOrSource) provs.add(e.provinceOrSource);
    });
    return Array.from(provs);
  }, [tabExams]);

  const filteredExams = useMemo(() => {
    return tabExams.filter((exam) => {
      if (selectedYear !== 'all' && String(exam.examYear) !== selectedYear) return false;
      if (selectedProvince !== 'all' && exam.provinceOrSource !== selectedProvince) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = exam.title.toLowerCase().includes(q);
        const matchCode = exam.code.toLowerCase().includes(q);
        const matchProv = (exam.provinceOrSource || '').toLowerCase().includes(q);
        const matchRound = (exam.schoolOrRound || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchProv && !matchRound) return false;
      }
      return true;
    });
  }, [tabExams, selectedYear, selectedProvince, searchQuery]);

  const liveParsePreview = useMemo(() => {
    const parsed = parseUserUploadedExamContent(
      uploadRawText,
      {
        code: uploadCode.trim() || (isOfficialTab ? 'CT26' : isReferenceTab ? 'TK26' : 'TT26'),
        title: uploadTitle.trim() || 'Đề thi tải lên',
      },
      extractedImages,
      extractedTables,
      extractedCharts
    );
    if (
      parsed.parsedCountI === 0 &&
      parsed.parsedCountII === 0 &&
      parsed.parsedCountIII === 0 &&
      uploadRawText.trim()
    ) {
      const blocks = extractAllTablesAndBlocksFromDocument(
        uploadRawText,
        extractedTables,
        extractedImages,
        extractedCharts
      );
      const rawDocTables = blocks.filter((b) => b.type === 'table').length;
      const rawDocCharts = blocks.filter((b) => b.type === 'chart').length;
      const rawDocImages = blocks.filter((b) => b.type === 'image').length;
      if (rawDocTables > 0 || rawDocCharts > 0 || rawDocImages > 0) {
        return {
          ...parsed,
          tableCount: Math.max(parsed.tableCount, rawDocTables),
          chartCount: Math.max(parsed.chartCount, rawDocCharts),
          imageCount: Math.max(parsed.imageCount, rawDocImages),
        };
      }
    }
    return parsed;
  }, [
    uploadRawText,
    uploadCode,
    uploadTitle,
    isOfficialTab,
    isReferenceTab,
    extractedImages,
    extractedTables,
    extractedCharts,
  ]);

  const jumpToQuestionInTextarea = (charOffset: number) => {
    const el = rawTextAreaRef.current;
    if (!el) return;
    const text = uploadRawText || '';
    const safeStart = Math.max(0, Math.min(charOffset, text.length));
    const lineEndIdx = text.indexOf('\n', safeStart);
    const safeEnd = lineEndIdx === -1 ? Math.min(safeStart + 80, text.length) : lineEndIdx;
    el.focus();
    el.setSelectionRange(safeStart, safeEnd);
    // Cuộn xấp xỉ đến đúng vị trí dòng chứa câu hỏi
    const linesBefore = text.slice(0, safeStart).split('\n').length - 1;
    const totalLines = Math.max(1, text.split('\n').length);
    const ratio = linesBefore / totalLines;
    el.scrollTop = Math.max(0, Math.floor(el.scrollHeight * ratio) - 48);
  };

  const handleOpenUploadModal = () => {
    setUploadError(null);
    if (!currentUser) {
      const msg =
        'Chỉ người dùng là Giáo viên mới được đăng tài liệu lên hệ thống! Vui lòng đăng nhập tài khoản Giáo viên.';
      if (onRequireLogin) {
        onRequireLogin(msg);
      } else {
        setUploadNotice(msg);
      }
      return;
    }
    if (!isTeacher) {
      setUploadNotice(
        'Chỉ người dùng là Giáo viên mới được đăng tài liệu lên hệ thống! Tài khoản Học sinh không có quyền đăng tài liệu.'
      );
      return;
    }
    if (isOfficialTab && !isAdmin) {
      setUploadNotice(
        'Chỉ Quản trị viên (Admin) mới được quyền đăng Đề Chính Thức! Giáo viên được quyền đăng tài liệu tại thẻ Đề Tham Khảo, Đề Thi Thử Tỉnh và Kho Tài Liệu GV.'
      );
      return;
    }
    if (isOfficialTab) {
      setUploadProvince('Bộ Giáo dục và Đào tạo');
      setUploadSchoolOrRound('Đề Chính Thức Kỳ Thi Tốt Nghiệp THPT');
    } else if (isReferenceTab) {
      if (!hasManualProvinceChoice) {
        setUploadProvince('Tài liệu Giáo viên / Trường THPT chia sẻ');
      }
      if (!uploadSchoolOrRound.trim()) {
        setUploadSchoolOrRound('Đề Tham Khảo / Tài Liệu Ôn Thi THPT');
      }
    } else if (uploadProvince === 'Bộ Giáo dục và Đào tạo') {
      setUploadProvince('Sở GD&ĐT Hà Nội');
      setUploadSchoolOrRound('Thi Thử Tốt Nghiệp THPT Lần 1');
    }
    setIsUploadModalOpen(true);
  };

  useEffect(() => {
    if (
      externalOpenUploadSignal > 0 &&
      externalOpenUploadSignal !== lastExternalSignalRef.current
    ) {
      lastExternalSignalRef.current = externalOpenUploadSignal;
      handleOpenUploadModal();
    }
  }, [externalOpenUploadSignal]);

  const handleFileUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setFileReadSummary(null);

    if (file.size > 25 * 1024 * 1024) {
      setUploadError('Tệp tải lên quá lớn (vui lòng chọn tệp dưới 25MB).');
      return;
    }

    setIsReadingFile(true);
    setAttachedFileName(file.name);
    setExtractedImages({});

    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
    if (!uploadTitle.trim()) {
      setUploadTitle(cleanName);
    }

    // Chỉ gợi ý Tỉnh/Sở GD&ĐT từ tên tệp nếu người dùng chưa tự chọn thủ công
    const detectedProv = detectProvinceFromText(cleanName);
    if (detectedProv && !hasManualProvinceChoice && !isOfficialTab) {
      setUploadProvince(detectedProv);
    }

    // Tự động nhận diện năm thi từ tên tệp (VD: 2025, 2026)
    const yearMatch = cleanName.match(/\b(202[0-9])\b/);
    if (yearMatch) {
      setUploadYear(Number(yearMatch[1]));
    }

    // Tự động nhận diện mã đề từ tên tệp (VD: "Mã đề 0701", "Mã đề 0725") nếu ô mã đề đang trống
    if (!uploadCode.trim()) {
      const codeMatch =
        cleanName.match(/mã\s*đề\s*[:\-]?\s*([A-Za-z0-9]+)/i) ||
        cleanName.match(/\b(07\d{2})\b/);
      if (codeMatch) {
        setUploadCode(codeMatch[1].toUpperCase());
      }
    }

    try {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });
      setAttachedFileDataUrl(dataUrl);

      const lowerName = file.name.toLowerCase();
      setPdfExtractMeta(null);
      if (lowerName.endsWith('.txt') || lowerName.endsWith('.json') || lowerName.endsWith('.md')) {
        const textContent = await file.text();
        setUploadRawText(textContent);
        setExtractedImages({});
        setExtractedTables({});
        setExtractedCharts({});
        if (textContent.trim()) {
          setFileReadSummary('Đã đọc nguyên bản toàn bộ nội dung từ tệp văn bản.');
        }
      } else if (lowerName.endsWith('.docx')) {
        const extracted = await extractStructuredFromDocxFile(file, dataUrl);
        const imgCount = Object.keys(extracted.images || {}).length;
        const tblCount = Object.keys(extracted.tables || {}).length;
        const chartCount = Object.keys(extracted.charts || {}).length;
        setExtractedImages(extracted.images || {});
        setExtractedTables(extracted.tables || {});
        setExtractedCharts(extracted.charts || {});
        if (extracted.text.trim()) {
          setUploadRawText(extracted.text);
          if (!detectedProv && !hasManualProvinceChoice && !isOfficialTab) {
            const headerProv = detectProvinceFromText(extracted.text.slice(0, 600));
            if (headerProv) {
              setUploadProvince(headerProv);
            }
          }
          const summaryParts: string[] = [];
          if (tblCount > 0) summaryParts.push(`${tblCount} bảng biểu cố định`);
          if (chartCount > 0) summaryParts.push(`${chartCount} biểu đồ số liệu gốc`);
          if (imgCount > 0) summaryParts.push(`${imgCount} hình ảnh minh họa`);
          setFileReadSummary(
            `Đã trích xuất nguyên bản từ tệp Word (.docx)${
              summaryParts.length > 0 ? ` kèm ${summaryParts.join(', ')}` : ''
            }. Nội dung bảng biểu, biểu đồ và văn bản gốc được giữ nguyên 100%.`
          );
        } else {
          setFileReadSummary(
            'Không tìm thấy văn bản trong tệp Word này. Tệp gốc vẫn được lưu nguyên bản để tải về.'
          );
        }
      } else if (lowerName.endsWith('.pdf')) {
        const extracted = await extractStructuredFromPdfFile(dataUrl);
        const imgCount = Object.keys(extracted.images || {}).length;
        const tblCount = Object.keys(extracted.tables || {}).length;
        const chartCount = Object.keys(extracted.charts || {}).length;
        setExtractedImages(extracted.images || {});
        setExtractedTables(extracted.tables || {});
        setExtractedCharts(extracted.charts || {});
        setPdfExtractMeta({
          pageCount: extracted.pageCount,
          extractedPageCount: extracted.extractedPageCount,
          warnings: extracted.warnings,
        });
        if (extracted.text.trim()) {
          setUploadRawText(extracted.text);
          if (!detectedProv && !hasManualProvinceChoice && !isOfficialTab) {
            const headerProv = detectProvinceFromText(extracted.text.slice(0, 600));
            if (headerProv) {
              setUploadProvince(headerProv);
            }
          }
          const pageLabel =
            typeof extracted.pageCount === 'number' && extracted.pageCount > 0
              ? ` (${extracted.extractedPageCount ?? extracted.pageCount}/${extracted.pageCount} trang)`
              : '';
          const summaryParts: string[] = [];
          if (tblCount > 0) summaryParts.push(`${tblCount} bảng biểu cố định`);
          if (chartCount > 0) summaryParts.push(`${chartCount} biểu đồ số liệu gốc`);
          if (imgCount > 0) summaryParts.push(`${imgCount} hình ảnh / biểu đồ`);
          setFileReadSummary(
            `Đã trích xuất nguyên bản từ tệp PDF${pageLabel}${
              summaryParts.length > 0 ? ` kèm ${summaryParts.join(', ')}` : ''
            }. Tệp PDF gốc cũng được lưu nguyên bản để tải về.`
          );
        } else {
          setUploadRawText('');
          setFileReadSummary(
            'Tệp PDF này là bản scan/ảnh chụp (không có lớp chữ). Hệ thống sẽ lưu nguyên bản tệp PDF gốc để tải về; bạn có thể dán thêm nội dung câu hỏi vào ô bên dưới nếu muốn làm bài trực tuyến.'
          );
        }
      } else if (lowerName.endsWith('.doc')) {
        setFileReadSummary(
          'Định dạng .doc cũ sẽ được lưu nguyên bản để tải về. Để hệ thống tách câu hỏi làm bài trực tuyến, vui lòng lưu tệp dưới dạng .docx hoặc .pdf rồi tải lên.'
        );
      }
    } catch {
      setFileReadSummary(
        'Không thể trích xuất văn bản tự động từ tệp này, nhưng tệp gốc vẫn được lưu nguyên bản để tải về.'
      );
    } finally {
      setIsReadingFile(false);
    }
  };

  const resetUploadForm = () => {
    setUploadTitle('');
    setUploadCode('');
    setCustomProvinceText('');
    setHasManualProvinceChoice(false);
    setUploadYear(2026);
    setUploadDuration(50);
    setUploadDescription('');
    setUploadRawText('');
    setExtractedImages({});
    setExtractedTables({});
    setExtractedCharts({});
    setFileReadSummary(null);
    setAttachedFileName('');
    setAttachedFileDataUrl('');
    setPdfExtractMeta(null);
    setIsReadingFile(false);
    setUploadError(null);
  };

  const handleSubmitUploadExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!currentUser || !isTeacher) {
      setUploadError(
        'Chỉ người dùng là Giáo viên mới được đăng tài liệu lên hệ thống!'
      );
      return;
    }

    if (isOfficialTab && !isAdmin) {
      setUploadError(
        'Chỉ Quản trị viên (Admin) mới được quyền đăng Đề Chính Thức! Giáo viên vui lòng đăng đề tại thẻ Đề Thi Thử Tỉnh.'
      );
      return;
    }

    if (isReadingFile) {
      setUploadError('Hệ thống đang đọc tệp đính kèm, vui lòng đợi 1 giây rồi nhấn Lưu.');
      return;
    }

    const cleanTitle = uploadTitle.trim();
    if (!cleanTitle) {
      setUploadError('Vui lòng nhập tên đề thi.');
      return;
    }

    if (!uploadRawText.trim() && !attachedFileName) {
      setUploadError('Vui lòng chọn tệp tài liệu đính kèm hoặc nhập/dán nội dung đề thi.');
      return;
    }

    const finalProvince =
      uploadProvince === 'Tỉnh / Sở GD&ĐT / Trường THPT khác'
        ? customProvinceText.trim() ||
          (isOfficialTab
            ? 'Bộ Giáo dục và Đào tạo'
            : isReferenceTab
            ? 'Tài liệu Giáo viên / Trường THPT chia sẻ'
            : 'Trường THPT / Sở GD&ĐT')
        : uploadProvince ||
          (isOfficialTab
            ? 'Bộ Giáo dục và Đào tạo'
            : isReferenceTab
            ? 'Tài liệu Giáo viên / Trường THPT chia sẻ'
            : 'Trường THPT / Sở GD&ĐT');

    const generatedCode =
      uploadCode
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, '') ||
      `${isOfficialTab ? 'CT' : isReferenceTab ? 'TK' : 'TT'}${String(Date.now()).slice(-3)}`;

    setUploadSubmitting(true);

    try {
      const parsed = parseUserUploadedExamContent(
        uploadRawText,
        {
          code: generatedCode,
          title: cleanTitle,
        },
        extractedImages,
        extractedTables,
        extractedCharts
      );

      const hasRawImages = Object.keys(extractedImages).length > 0;
      const hasRawCharts = Object.keys(extractedCharts).length > 0;
      const hasRawTables = Object.keys(extractedTables).length > 0;

      const newExam: ExternalExamItem = {
        id: `user-exam-${generatedCode.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        code: generatedCode,
        title: cleanTitle,
        description:
          uploadDescription.trim() ||
          `${
            isOfficialTab
              ? 'Đề thi chính thức Tốt nghiệp THPT'
              : isReferenceTab
              ? 'Đề tham khảo / Tài liệu ôn thi Tốt nghiệp THPT'
              : 'Đề thi thử Tốt nghiệp THPT'
          } - ${finalProvince} (${uploadSchoolOrRound.trim() || `Năm ${uploadYear}`}).`,
        durationMinutes: Math.max(15, Math.min(180, Number(uploadDuration) || 50)),
        partI: parsed.partI,
        partII: parsed.partII,
        ...(parsed.partIII.length > 0 ? { partIII: parsed.partIII } : {}),
        rawDocumentText: uploadRawText.trim() ? uploadRawText : undefined,
        ...(hasRawImages ? { rawDocumentImages: extractedImages } : {}),
        ...(hasRawCharts ? { rawDocumentCharts: extractedCharts } : {}),
        ...(hasRawTables ? { rawDocumentTables: extractedTables } : {}),
        category: fixedCategory,
        provinceOrSource: finalProvince,
        schoolOrRound:
          uploadSchoolOrRound.trim() ||
          (isOfficialTab
            ? 'Đề Thi Chính Thức Kỳ Thi Tốt Nghiệp THPT'
            : isReferenceTab
            ? 'Đề Tham Khảo / Tài Liệu Ôn Thi THPT'
            : 'Đề Thi Thử Tốt Nghiệp THPT'),
        examYear: Number(uploadYear) || 2026,
        uploadedBy: currentUser?.username || 'guest',
        uploadedByFullName: currentUser?.fullName || 'Giáo viên đóng góp',
        uploadedAt: new Date().toISOString(),
        isUserUploaded: true,
        attachedFileName: attachedFileName || undefined,
        attachedFileDataUrl: attachedFileDataUrl || undefined,
        hasAttachedOriginalFile: Boolean(attachedFileName && attachedFileDataUrl),
      };

      await onUploadExamSuccess(newExam);

      setSelectedYear('all');
      setSelectedProvince('all');
      setSearchQuery('');

      const partSummaryParts: string[] = [];
      if (parsed.parsedCountI > 0) partSummaryParts.push(`${parsed.parsedCountI} câu Phần I`);
      if (parsed.parsedCountII > 0) partSummaryParts.push(`${parsed.parsedCountII} câu Đúng/Sai Phần II`);
      if (parsed.parsedCountIII > 0) partSummaryParts.push(`${parsed.parsedCountIII} câu Phần III`);
      const questionSummary =
        partSummaryParts.length > 0
          ? ` (${partSummaryParts.join(', ')} — giữ nguyên 100% nội dung gốc)`
          : ' (đã lưu tài liệu nguyên bản)';

      const formattedUploadedTime = formatUploadTimestamp(newExam.uploadedAt);
      setUploadNotice(
        `Đã lưu & hiển thị "${newExam.title}" (Mã: ${newExam.code})${questionSummary} vào thẻ ${
          isOfficialTab
            ? 'Đề Chính Thức Các Năm'
            : isReferenceTab
            ? 'Đề Tham Khảo'
            : 'Đề Thi Thử Tỉnh'
        }${formattedUploadedTime ? ` lúc ${formattedUploadedTime}` : ''} thành công!`
      );
      setIsUploadModalOpen(false);
      resetUploadForm();
    } catch (err: any) {
      setUploadError(err?.message || 'Có lỗi xảy ra khi tải đề lên hệ thống.');
    } finally {
      setUploadSubmitting(false);
    }
  };

  const handleToggleExamCategory = async (exam: ExternalExamItem) => {
    if (!isAdmin) {
      setUploadNotice('Chỉ Quản trị viên (Admin) mới có quyền chuyển đề giữa các thẻ!');
      return;
    }
    const nextCategory: ExternalExamCategory =
      exam.category === 'official_past_year'
        ? 'provincial_mock'
        : exam.category === 'reference_exam'
        ? 'provincial_mock'
        : 'official_past_year';
    const updatedExam: ExternalExamItem = {
      ...exam,
      category: nextCategory,
      schoolOrRound:
        nextCategory === 'official_past_year' && exam.schoolOrRound === 'Thi Thử Tốt Nghiệp THPT Lần 1'
          ? 'Đề Chính Thức Kỳ Thi Tốt Nghiệp THPT'
          : exam.schoolOrRound,
    };
    await onUploadExamSuccess(updatedExam);
    setUploadNotice(
      `Đã chuyển đề "${exam.title}" sang thẻ ${
        nextCategory === 'official_past_year' ? 'Đề Chính Thức' : 'Đề Thi Thử Tỉnh'
      }.`
    );
  };

  const handleConfirmDeleteExam = async (exam: ExternalExamItem) => {
    setDeletingExamId(exam.id);
    try {
      await onDeleteUploadedExam(exam.id);
      setConfirmDeleteExamId(null);
      setUploadNotice(`Đã xóa tài liệu "${exam.title}" và lưu ngay vào hệ thống.`);
    } catch (err: any) {
      setConfirmDeleteExamId(null);
      setUploadNotice(
        err?.message ||
          'Bạn không có quyền xóa tài liệu này! Chỉ Quản trị viên (Admin) và người đã đăng tài liệu mới được xóa.'
      );
    } finally {
      setDeletingExamId(null);
    }
  };

  const handleDownloadAttachedFile = async (exam: ExternalExamItem) => {
    if (!canDownloadDocuments && onRequireVipUpgrade) {
      onRequireVipUpgrade();
      return;
    }
    if (exam.attachedFileDataUrl && exam.attachedFileName) {
      if (currentUser?.username) {
        incrementFreeTrialDownloadCount(currentUser.username);
      }
      const a = document.createElement('a');
      a.href = exam.attachedFileDataUrl;
      a.download = exam.attachedFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    if (exam.isUserUploaded && (exam.hasAttachedOriginalFile || exam.attachedFileName)) {
      try {
        const fileUrl = `/api/uploaded-exams/${encodeURIComponent(exam.id)}/file`;
        const res = await fetch(fileUrl, {
          headers: authService.getAuthHeaders(),
        });
        if (res.status === 401 || res.status === 403) {
          const errPayload = await res.json().catch(() => null);
          setUploadNotice(
            errPayload?.message ||
              'Bạn không có quyền sử dụng hoặc tải tài liệu này! Chỉ người dùng đã đăng tài liệu và Admin mới được phép.'
          );
          return;
        }
        if (res.ok) {
          if (currentUser?.username) {
            incrementFreeTrialDownloadCount(currentUser.username);
          }
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = exam.attachedFileName || `${exam.code}.docx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 2500);
          return;
        }
      } catch {
        // Nếu tệp cũ trước đây chưa được lưu trên máy chủ thì fallback bên dưới
      }
    }
    if (exam.pdfReferenceUrl) {
      if (currentUser?.username) {
        incrementFreeTrialDownloadCount(currentUser.username);
      }
      const a = document.createElement('a');
      a.href = exam.pdfReferenceUrl;
      a.download = `De_Chinh_Thuc_${exam.code}.pdf`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    if (exam.partI.length > 0 || exam.partII.length > 0) {
      onPrintExam(exam);
    } else if (exam.rawDocumentText) {
      if (currentUser?.username) {
        incrementFreeTrialDownloadCount(currentUser.username);
      }
      const blob = new Blob([exam.rawDocumentText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exam.attachedFileName || `${exam.code}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2500);
    } else {
      setUploadNotice('Tệp gốc của tài liệu này không còn lưu trên máy chủ. Vui lòng tải lại tệp mới.');
    }
  };

  return (
    <div
      className={
        embeddedSection
          ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5'
          : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6'
      }
    >
      {/* Banner Header: compact card when embedded inside Đề Tham Khảo tab, full hero banner on dedicated tabs */}
      {embeddedSection ? (
        <div className="bg-white rounded-2xl border border-emerald-200 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Tài Liệu &amp; Đề Tham Khảo Người Dùng Đăng Tải
                </h2>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {tabExams.length} tài liệu
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                Giáo viên có thể đăng tài liệu, đề tham khảo ôn thi Tốt nghiệp THPT (.docx, .pdf, .txt) lên hệ thống.
                Hệ thống giữ nguyên 100% nội dung gốc, bảng biểu, hình ảnh và tệp đính kèm — tài liệu do người dùng nào đăng thì{' '}
                <strong>chỉ người dùng đó và Quản trị viên (Admin)</strong> mới được xem, quản lý và sử dụng.
              </p>
            </div>

            <div className="shrink-0 flex flex-wrap items-center gap-2">
              {canUploadExam ? (
                <button
                  type="button"
                  onClick={handleOpenUploadModal}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Đăng Tài Liệu / Đề Tham Khảo Lên Hệ Thống</span>
                </button>
              ) : !currentUser ? (
                <button
                  type="button"
                  onClick={() =>
                    onRequireLogin?.(
                      'Chỉ người dùng là Giáo viên mới được đăng tài liệu lên hệ thống! Vui lòng đăng nhập tài khoản Giáo viên.'
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-800" />
                  <span>Đăng nhập Giáo viên để đăng tài liệu</span>
                </button>
              ) : (
                <span className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Chỉ Giáo viên được đăng tài liệu lên hệ thống</span>
                </span>
              )}
            </div>
          </div>

          {tabExams.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tài liệu, đề tham khảo theo tên, nguồn chia sẻ, năm, mã đề..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                >
                  <option value="all">📅 Tất cả các năm ({tabExams.length})</option>
                  {availableYears.map((yr) => (
                    <option key={yr} value={String(yr)}>
                      Năm {yr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                >
                  <option value="all">🏛️ Tất cả Đơn vị / Nguồn chia sẻ</option>
                  {availableProvinces.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`rounded-2xl p-6 sm:p-8 text-white shadow-lg border relative overflow-hidden ${
            isOfficialTab
              ? 'bg-gradient-to-br from-amber-950 via-amber-900 to-emerald-950 border-amber-700/80'
              : 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 border-emerald-800/80'
          }`}
        >
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-amber-200 text-xs font-semibold">
                {isOfficialTab ? (
                  <>
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span>Kho Đề Thi Chính Thức Các Năm · Bộ GD&amp;ĐT</span>
                  </>
                ) : isReferenceTab ? (
                  <>
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                    <span>Kho Đề Tham Khảo &amp; Tài Liệu Ôn Thi · GDPT 2018</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Kho Đề Thi Thử Tốt Nghiệp THPT Các Tỉnh / Sở GD&amp;ĐT · GDPT 2018</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {isOfficialTab
                  ? 'Đề Thi Chính Thức Tốt Nghiệp THPT Các Năm'
                  : isReferenceTab
                  ? 'Đề Tham Khảo & Tài Liệu Ôn Thi Tốt Nghiệp THPT'
                  : 'Đề Thi Thử Tốt Nghiệp THPT Các Tỉnh / Sở GD&ĐT / Trường THPT'}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                {isOfficialTab ? (
                  <>
                    Tổng hợp đề thi chính thức Kỳ thi Tốt nghiệp THPT môn
                    Công nghệ Nông nghiệp các năm do <strong>Quản trị viên (Admin)</strong> đăng tải.
                    Giáo viên và học sinh có thể làm bài trực tuyến, giao bài qua{' '}
                    <strong>Mã QR</strong> và tải tệp gốc.
                  </>
                ) : (
                  <>
                    Tổng hợp bộ đề thi thử, đề khảo sát chất lượng Tốt nghiệp THPT môn Công nghệ Nông
                    nghiệp từ các Sở GD&amp;ĐT và trường THPT trên toàn quốc.{' '}
                    <strong>Giáo viên được quyền đăng đề thi thử lên hệ thống</strong> để làm bài
                    trực tuyến, giao bài qua <strong>Mã QR</strong> và chia sẻ tài liệu.
                  </>
                )}
              </p>

              {/* Quick KPI badges */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 font-bold text-white flex items-center gap-1.5">
                  {isOfficialTab ? (
                    <>
                      <Award className="w-3.5 h-3.5 text-amber-300" />
                      <span>Tổng số đề chính thức: {tabExams.length} đề</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>Tổng số đề thi thử các Tỉnh/Sở: {tabExams.length} đề</span>
                    </>
                  )}
                </span>
                {isOfficialTab ? (
                  <span className="px-3 py-1.5 rounded-xl bg-amber-400/20 border border-amber-300/40 font-bold text-amber-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>Đề chính thức chỉ Admin được đăng</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-amber-400/20 border border-amber-300/40 font-bold text-amber-200 flex items-center gap-1.5">
                    <UploadCloud className="w-3.5 h-3.5 text-amber-300" />
                    <span>Chỉ người dùng là Giáo viên mới được đăng tài liệu (.docx, .pdf, .txt)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Primary Action: Tải Đề Lên Hệ Thống */}
            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5">
              {canUploadExam ? (
                <>
                  <button
                    onClick={handleOpenUploadModal}
                    className="px-5 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <UploadCloud className="w-5 h-5 text-slate-900" />
                    <span>
                      {isOfficialTab
                        ? 'Đăng Đề Chính Thức (Quyền Admin)'
                        : 'Đăng Tài Liệu / Đề Thi Lên Hệ Thống'}
                    </span>
                  </button>
                  <p className="text-[11px] text-emerald-100/90 text-center max-w-[260px]">
                    Dành riêng cho Giáo viên · Giữ nguyên 100% nội dung, bảng biểu và hình ảnh từ tệp Word (.docx), PDF (.pdf), .txt
                  </p>
                </>
              ) : isOfficialTab ? (
                <div className="px-4 py-3 rounded-xl bg-white/10 border border-amber-300/40 text-amber-100 text-xs max-w-[260px] space-y-1">
                  <div className="font-extrabold text-amber-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Chỉ Admin được đăng Đề Chính Thức</span>
                  </div>
                  <p className="text-[11px] text-emerald-100/90 leading-snug">
                    Giáo viên được quyền đăng tài liệu tại thẻ <strong>Đề Tham Khảo</strong> và <strong>Đề Thi Thử Tỉnh</strong>.
                  </p>
                </div>
              ) : !currentUser ? (
                <div className="px-4 py-3 rounded-xl bg-white/10 border border-amber-300/40 text-amber-100 text-xs max-w-[270px] space-y-2">
                  <div className="font-extrabold text-amber-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Chỉ Giáo viên được đăng tài liệu</span>
                  </div>
                  <p className="text-[11px] text-emerald-100/90 leading-snug">
                    Chỉ người dùng là <strong>Giáo viên</strong> mới được đăng tài liệu lên hệ thống.
                  </p>
                  {onRequireLogin && (
                    <button
                      type="button"
                      onClick={() =>
                        onRequireLogin(
                          'Chỉ người dùng là Giáo viên mới được đăng tài liệu lên hệ thống! Vui lòng đăng nhập tài khoản Giáo viên.'
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Đăng nhập tài khoản Giáo viên
                    </button>
                  )}
                </div>
              ) : (
                <div className="px-4 py-3 rounded-xl bg-white/10 border border-amber-300/40 text-amber-100 text-xs max-w-[270px] space-y-1">
                  <div className="font-extrabold text-amber-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Chỉ Giáo viên được đăng tài liệu</span>
                  </div>
                  <p className="text-[11px] text-emerald-100/90 leading-snug">
                    Tài khoản <strong>Học sinh</strong> chỉ được làm bài và tải tài liệu, không được đăng tài liệu lên hệ thống.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Thông báo khi vừa tải đề lên thành công */}
      {uploadNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-3 text-xs sm:text-sm text-emerald-950 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{uploadNotice}</span>
          </div>
          <button
            onClick={() => setUploadNotice(null)}
            className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar (Standalone tabs only; embeddedSection renders compact filters above) */}
      {!embeddedSection && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isOfficialTab ? (
                <Award className="w-5 h-5 text-amber-600" />
              ) : isReferenceTab ? (
                <BookOpen className="w-5 h-5 text-emerald-700" />
              ) : (
                <Building2 className="w-5 h-5 text-teal-700" />
              )}
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                {isOfficialTab
                  ? `Danh Sách Đề Thi Chính Thức (${filteredExams.length} đề)`
                  : isReferenceTab
                  ? `Danh Sách Tài Liệu & Đề Tham Khảo (${filteredExams.length} tài liệu)`
                  : `Danh Sách Đề Thi Thử Các Tỉnh / Sở GD&ĐT (${filteredExams.length} đề)`}
              </h2>
            </div>

            {canUploadExam ? (
              <button
                onClick={handleOpenUploadModal}
                className={`px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer ${
                  isOfficialTab
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>
                  {isOfficialTab
                    ? '+ Đăng Đề Chính Thức Mới'
                    : isReferenceTab
                    ? '+ Đăng Tài Liệu / Đề Tham Khảo Mới'
                    : '+ Đăng Tài Liệu / Đề Thi Thử Mới'}
                </span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>
                  {isOfficialTab
                    ? 'Chỉ Admin có quyền đăng Đề Chính Thức'
                    : 'Chỉ người dùng là Giáo viên mới được đăng tài liệu lên hệ thống'}
                </span>
              </span>
            )}
          </div>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            {/* Search Input */}
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isOfficialTab
                    ? 'Tìm theo tên đề chính thức, năm thi (2025, 2026...), mã đề...'
                    : isReferenceTab
                    ? 'Tìm theo tên tài liệu, đề tham khảo, năm thi, mã đề...'
                    : 'Tìm theo tên tỉnh/sở (Hà Nội, Cần Thơ, Ninh Bình, An Giang...), năm thi, mã đề...'
                }
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter by Year */}
            <div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="all">📅 Tất cả các năm ({tabExams.length} đề)</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={String(yr)}>
                    Năm thi {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Province / Source */}
            <div>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="all">
                  {isOfficialTab
                    ? '🏛️ Tất cả Cơ quan / Đơn vị'
                    : isReferenceTab
                    ? '🏛️ Tất cả Đơn vị / Nguồn chia sẻ'
                    : '🏛️ Tất cả Tỉnh / Sở GD&ĐT / Trường THPT'}
                </option>
                {availableProvinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredExams.length === 0 ? (
        embeddedSection && tabExams.length === 0 ? null : (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <FolderUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {tabExams.length === 0
                ? isOfficialTab
                  ? 'Chưa có đề thi nào trong thẻ Đề Chính Thức Các Năm'
                  : isReferenceTab
                  ? 'Chưa có tài liệu nào được người dùng đăng lên thẻ Đề Tham Khảo'
                  : 'Chưa có đề thi nào trong thẻ Đề Thi Thử Tỉnh'
                : 'Không tìm thấy đề thi nào khớp với bộ lọc'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isOfficialTab ? (
                canUploadExam ? (
                  <>
                    Bạn có thể nhấn nút <strong>&ldquo;Đăng Đề Chính Thức Lên Ngay&rdquo;</strong> để
                    tải đề thi chính thức các năm (.docx, .pdf, .txt) lên hệ thống.
                  </>
                ) : (
                  <>
                    Đề thi chính thức chỉ do <strong>Quản trị viên (Admin)</strong> đăng tải. Giáo
                    viên được quyền đăng đề tại thẻ <strong>Đề Tham Khảo</strong> và{' '}
                    <strong>Đề Thi Thử Tỉnh</strong>.
                  </>
                )
              ) : canUploadExam ? (
                <>
                  Bạn có thể nhấn nút{' '}
                  <strong>
                    &ldquo;{isReferenceTab ? 'Đăng Tài Liệu Lên Ngay' : 'Đăng Đề Thi Thử Lên Ngay'}&rdquo;
                  </strong>{' '}
                  để tải tài liệu / đề thi lên hệ thống.
                </>
              ) : (
                <>
                  Chỉ người dùng là <strong>Giáo viên</strong> mới được đăng tài liệu / đề thi lên hệ thống.
                </>
              )}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {tabExams.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedYear('all');
                    setSelectedProvince('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Xóa bộ lọc ({tabExams.length} đề)
                </button>
              )}
              {canUploadExam && (
                <button
                  onClick={handleOpenUploadModal}
                  className={`px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    isOfficialTab
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>
                    {isOfficialTab
                      ? 'Đăng Đề Chính Thức Lên Ngay'
                      : isReferenceTab
                      ? 'Đăng Tài Liệu Lên Ngay'
                      : 'Đăng Đề Thi Thử Lên Ngay'}
                  </span>
                </button>
              )}
            </div>
          </div>
        )
      ) : (
        /* Grid of Exam Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredExams.map((exam) => {
            const isExpanded = expandedExamId === exam.id;
            const showAns = Boolean(showAnswersInPreview[exam.id]);
            const normalizedCurrentUsername = (currentUser?.username || '')
              .trim()
              .replace(/^@+/, '')
              .toLowerCase();
            const normalizedExamOwner = (exam.uploadedBy || '')
              .trim()
              .replace(/^@+/, '')
              .toLowerCase();
            const isOwner = Boolean(
              normalizedCurrentUsername &&
                normalizedExamOwner &&
                normalizedExamOwner !== 'guest' &&
                normalizedExamOwner === normalizedCurrentUsername
            );
            // Chỉ Admin và đúng người dùng đã đăng tài liệu đó mới được xóa
            const canDelete = Boolean(
              exam.isUserUploaded &&
                currentUser &&
                (isAdmin || (exam.category !== 'official_past_year' && isOwner))
            );

            return (
              <div
                key={exam.id}
                className={`bg-white rounded-2xl border transition-all shadow-2xs flex flex-col justify-between overflow-hidden ${
                  exam.category === 'official_past_year'
                    ? 'border-amber-200 hover:border-amber-400'
                    : 'border-slate-200 hover:border-emerald-400'
                } ${isExpanded ? 'md:col-span-2 ring-2 ring-emerald-600/20' : ''}`}
              >
                <div className="p-5 space-y-3.5">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {exam.category === 'official_past_year' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <Award className="w-3 h-3 text-amber-700" />
                          <span>Đề Chính Thức</span>
                        </span>
                      ) : exam.category === 'reference_exam' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-900 border border-teal-200">
                          <BookOpen className="w-3 h-3 text-teal-700" />
                          <span>Đề Tham Khảo</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                          <Building2 className="w-3 h-3 text-emerald-700" />
                          <span>Đề Thi Thử Tỉnh / Sở</span>
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Năm {exam.examYear}</span>
                      </span>

                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-950 text-amber-300 font-mono">
                        Mã đề: {exam.code}
                      </span>

                      {exam.isUserUploaded && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-200">
                          <UploadCloud className="w-3 h-3 text-sky-700" />
                          <span>
                            {exam.category === 'official_past_year' || normalizedExamOwner === 'admin'
                              ? 'Admin đăng tải'
                              : 'Giáo viên tải lên'}
                          </span>
                        </span>
                      )}

                      {exam.isUserUploaded &&
                        exam.category !== 'official_past_year' &&
                        normalizedExamOwner !== 'admin' && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300"
                            title="Tài liệu riêng tư: chỉ người đăng và Quản trị viên (Admin) được quản lý và sử dụng"
                          >
                            <Lock className="w-3 h-3 text-amber-700" />
                            <span>
                              {isOwner
                                ? 'Riêng tư · Chỉ bạn & Admin'
                                : `Riêng tư · @${normalizedExamOwner} & Admin`}
                            </span>
                          </span>
                        )}
                    </div>

                    {(canDelete || (exam.isUserUploaded && isAdmin)) && (
                      <div className="flex items-center gap-1">
                        {exam.isUserUploaded && isAdmin && (
                          <button
                            onClick={() => handleToggleExamCategory(exam)}
                            className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                            title={
                              exam.category === 'official_past_year' ||
                              exam.category === 'reference_exam'
                                ? 'Chuyển sang thẻ Đề Thi Thử Tỉnh'
                                : 'Chuyển sang thẻ Đề Chính Thức'
                            }
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>
                              {exam.category === 'official_past_year' ||
                              exam.category === 'reference_exam'
                                ? 'Chuyển sang Đề Tỉnh'
                                : 'Chuyển sang Đề Chính Thức'}
                            </span>
                          </button>
                        )}
                        {canDelete && (
                          confirmDeleteExamId === exam.id ? (
                            <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1">
                              <span className="text-[11px] font-bold text-rose-800">Xóa?</span>
                              <button
                                type="button"
                                disabled={deletingExamId === exam.id}
                                onClick={() => handleConfirmDeleteExam(exam)}
                                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer disabled:opacity-60"
                              >
                                {deletingExamId === exam.id ? '...' : 'Xác nhận'}
                              </button>
                              <button
                                type="button"
                                disabled={deletingExamId === exam.id}
                                onClick={() => setConfirmDeleteExamId(null)}
                                className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold cursor-pointer"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteExamId(exam.id)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title={
                                isAdmin
                                  ? 'Xóa tài liệu (Quyền Quản trị viên)'
                                  : 'Xóa tài liệu do bạn đã đăng'
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* Province & Round Subheader */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-800">
                    <span>🏛️ {exam.provinceOrSource}</span>
                    <span>•</span>
                    <span className="text-slate-600">{exam.schoolOrRound}</span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{exam.description}</p>
                  </div>

                  {/* Meta Info Strip */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{exam.durationMinutes} phút</span>
                    </span>
                    {exam.partI.length > 0 ||
                    exam.partII.length > 0 ||
                    (exam.partIII && exam.partIII.length > 0) ? (
                      <>
                        {exam.partI.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="tabular-nums">Phần I: {exam.partI.length} câu ABCD</span>
                          </>
                        )}
                        {exam.partII.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="tabular-nums">Phần II: {exam.partII.length} câu Đúng/Sai</span>
                          </>
                        )}
                        {exam.partIII && exam.partIII.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="tabular-nums">Phần III: {exam.partIII.length} câu ngắn/tự luận</span>
                          </>
                        )}
                        {(() => {
                          const reviewCnt =
                            exam.partI.filter((q) => q.needsReview).length +
                            exam.partII.filter((q) => q.needsReview).length +
                            (exam.partIII || []).filter((q) => q.needsReview).length;
                          if (reviewCnt === 0) return null;
                          return (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 text-amber-700 font-semibold tabular-nums">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{reviewCnt} câu cần kiểm tra định dạng</span>
                              </span>
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-amber-800">Tài liệu lưu trữ nguyên bản</span>
                      </>
                    )}
                    {exam.attachedFileName && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Tệp đính kèm: {exam.attachedFileName}</span>
                        </span>
                      </>
                    )}
                    {exam.isUserUploaded && exam.uploadedByFullName && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <User className="w-3 h-3" />
                          <span>Đăng bởi: {exam.uploadedByFullName}</span>
                        </span>
                      </>
                    )}
                    {exam.uploadedAt && (() => {
                      const formattedTime = formatUploadTimestamp(exam.uploadedAt);
                      if (!formattedTime) return null;
                      const rel = formatRelativeUploadTime(exam.uploadedAt, nowTickMs);
                      return (
                        <>
                          <span>•</span>
                          <span
                            className="inline-flex items-center gap-1 text-slate-600 font-medium tabular-nums"
                            title={`Thời gian đăng lên hệ thống: ${formattedTime}`}
                          >
                            <Clock className="w-3 h-3 text-emerald-700 shrink-0" />
                            <span>
                              Đăng lúc: {formattedTime}
                              {rel ? ` (${rel})` : ''}
                            </span>
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Action Buttons Footer */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {(exam.partI.length > 0 ||
                      exam.partII.length > 0 ||
                      (exam.partIII && exam.partIII.length > 0)) && (
                      <>
                        <button
                          onClick={() => onStartExam(exam)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer bg-emerald-700 hover:bg-emerald-800 text-white"
                          title="Làm bài trực tuyến"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Làm Bài Ngay</span>
                        </button>

                        <button
                          onClick={() => onAssignQr(exam)}
                          className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Lấy Mã QR hoặc Link giao đề này cho học sinh làm trên điện thoại"
                        >
                          <QrCode className="w-3.5 h-3.5 text-amber-700" />
                          <span>Giao Đề QR</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleDownloadAttachedFile(exam)}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Tải tệp gốc đính kèm nguyên bản hoặc xuất đề thi"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        {(exam.attachedFileName && exam.attachedFileDataUrl) ||
                        (exam.isUserUploaded && exam.hasAttachedOriginalFile)
                          ? 'Tải Tệp Gốc'
                          : exam.pdfReferenceUrl
                          ? 'Tải PDF / Word'
                          : 'Tải Đề (.docx)'}
                      </span>
                    </button>

                    {exam.attachedFileName &&
                      (exam.partI.length > 0 ||
                        exam.partII.length > 0 ||
                        (exam.partIII && exam.partIII.length > 0)) && (
                      <button
                        onClick={() => onPrintExam(exam)}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-600" />
                        <span>Xuất Word/In</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isExpanded ? 'Thu gọn nội dung' : 'Xem nội dung đề'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Inline Expanded Exam Preview */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-slate-200 bg-slate-50/60 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                      <div className="text-xs font-bold text-slate-800 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>
                          Chi tiết nội dung: <span className="text-emerald-800">{exam.title}</span>
                        </span>
                        {exam.uploadedAt && formatUploadTimestamp(exam.uploadedAt) && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 tabular-nums">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            <span>Đăng lúc: {formatUploadTimestamp(exam.uploadedAt)}</span>
                          </span>
                        )}
                      </div>
                      {(exam.partI.length > 0 ||
                        exam.partII.length > 0 ||
                        (exam.partIII && exam.partIII.length > 0)) && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setShowAnswersInPreview((prev) => ({
                                ...prev,
                                [exam.id]: !prev[exam.id],
                              }))
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                              showAns
                                ? 'bg-emerald-700 text-white border-emerald-700'
                                : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                            }`}
                          >
                            {showAns ? 'Đang hiện đáp án & lời giải' : 'Hiện đáp án & lời giải'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Nếu là tài liệu nguyên bản không có câu trắc nghiệm */}
                    {exam.partI.length === 0 &&
                      exam.partII.length === 0 &&
                      (!exam.partIII || exam.partIII.length === 0) && (
                      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 text-xs">
                        {exam.rawDocumentText ? (
                          <div className="max-h-[65vh] overflow-y-auto p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                            <RichDocumentContent
                              text={exam.rawDocumentText}
                              tables={exam.rawDocumentTables}
                              images={exam.rawDocumentImages}
                              charts={exam.rawDocumentCharts}
                              compact
                            />
                          </div>
                        ) : (
                          <div className="text-slate-600 leading-relaxed">
                            Tài liệu này là tệp đính kèm nguyên bản (VD: tệp PDF bản scan hoặc tệp Word không ở dạng trắc nghiệm ABCD). Nhấn nút{' '}
                            <strong>&ldquo;Tải Tệp Gốc&rdquo;</strong> để tải về và xem đầy đủ nội dung gốc.
                          </div>
                        )}
                      </div>
                    )}

                    {/* PHẦN I */}
                    {exam.partI.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-emerald-950 bg-emerald-100/80 px-3.5 py-2 rounded-lg border border-emerald-200">
                        PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn ({exam.partI.length} câu)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {exam.partI.map((q) => {
                          const qImgs = q.images && q.images.length > 0 ? q.images : q.imageUrl ? [q.imageUrl] : [];
                          const inlineTbl =
                            !q.tableData &&
                            q.question &&
                            (q.question.includes('\t') || q.question.includes('|'))
                              ? extractTableAndCitationFromBlock(q.question)
                              : null;
                          const displayStem = inlineTbl?.tableData ? inlineTbl.cleanedText : q.question;
                          const resolvedTables = [
                            ...(q.tableData
                              ? [q.tableData]
                              : inlineTbl?.tableData
                              ? [inlineTbl.tableData, ...(inlineTbl.extraTables || [])]
                              : []),
                            ...(q.extraTables || []),
                          ];
                          const resolvedCharts = [
                            ...(q.chartData ? [q.chartData] : []),
                            ...(q.extraCharts || []),
                          ];
                          const isWideCard = resolvedTables.length > 0 || resolvedCharts.length > 0;
                          return (
                          <div
                            key={q.id}
                            className={`bg-white p-4 rounded-xl border space-y-2 text-xs ${
                              q.needsReview ? 'border-amber-300' : 'border-slate-200'
                            } ${isWideCard ? 'md:col-span-2' : ''}`}
                          >
                            {q.needsReview && (
                              <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                                <span>
                                  <strong>Cần kiểm tra định dạng:</strong>{' '}
                                  {q.reviewReason || 'Câu hỏi bị lệch định dạng từ tệp PDF gốc.'}
                                </span>
                              </div>
                            )}
                            <div className="font-bold text-slate-900 whitespace-pre-line">
                              <span className="text-emerald-700">
                                Câu {q.originalNumber || q.number}:
                              </span>{' '}
                              {displayStem}
                            </div>
                            {qImgs.length > 0 && (
                              <div className="flex flex-wrap gap-2 justify-center py-1">
                                {qImgs.map((src, idx) => (
                                  <img
                                    key={idx}
                                    src={src}
                                    alt={`Hình Câu ${q.number} (${idx + 1})`}
                                    className="max-h-52 w-auto object-contain rounded border border-slate-200 bg-slate-50 p-1"
                                  />
                                ))}
                              </div>
                            )}
                            {resolvedCharts.map((ch, cIdx) => (
                              <DocumentChart key={cIdx} chartData={ch} compact className="my-1.5" />
                            ))}
                            {resolvedTables.map((tbl, tIdx) => (
                              <DocumentTable key={tIdx} tableData={tbl} compact className="my-1.5" />
                            ))}
                            {q.subStatements && q.subStatements.length > 0 && (
                              <div className="pl-3 space-y-1 text-slate-700">
                                {q.subStatements.map((st, idx) => (
                                  <div key={idx}>{st}</div>
                                ))}
                              </div>
                            )}
                            {q.questionFooter && (
                              <div className="font-semibold text-slate-800">{q.questionFooter}</div>
                            )}
                            <div className="grid grid-cols-1 gap-1.5 pt-1">
                              {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                                const isCorrect = showAns && q.correctAnswer === letter;
                                return (
                                  <div
                                    key={letter}
                                    className={`px-2.5 py-1.5 rounded-lg border ${
                                      isCorrect
                                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                                        : 'bg-slate-50/70 border-slate-200/80 text-slate-700'
                                    }`}
                                  >
                                    <span className="font-bold mr-1.5">{letter}.</span>
                                    <span>{q.options[letter]}</span>
                                  </div>
                                );
                              })}
                            </div>
                            {showAns && (
                              <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-800 space-y-0.5">
                                <div>
                                  <strong>Đáp án đúng: {q.correctAnswer}</strong>
                                </div>
                                {q.explanation && (
                                  <div className="text-slate-600">{q.explanation}</div>
                                )}
                              </div>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    </div>
                    )}

                    {/* PHẦN II */}
                    {exam.partII.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-950 bg-amber-100/80 px-3.5 py-2 rounded-lg border border-amber-200">
                        PHẦN II. Câu trắc nghiệm Đúng / Sai ({exam.partII.length} câu ·
                        Thang điểm lũy tiến: 1 ý đúng = 0,1đ; 2 ý = 0,25đ; 3 ý = 0,5đ; 4 ý = 1,0đ)
                      </h4>
                      <div className="space-y-3">
                        {exam.partII.map((tf) => (
                          <div
                            key={tf.id}
                            className={`bg-white p-4 rounded-xl border space-y-2.5 text-xs ${
                              tf.needsReview ? 'border-amber-300' : 'border-slate-200'
                            }`}
                          >
                            {tf.needsReview && (
                              <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                                <span>
                                  <strong>Cần kiểm tra định dạng:</strong>{' '}
                                  {tf.reviewReason || 'Câu Đúng/Sai bị lệch định dạng từ tệp PDF gốc.'}
                                </span>
                              </div>
                            )}
                            <div className="font-bold text-slate-900">
                              <span className="text-amber-700">Câu {tf.originalNumber || tf.number}:</span>{' '}
                              {tf.scenarioTitle}
                            </div>
                            <TrueFalseScenarioDisplay question={tf} isPrintMode={true} />
                            <div className="space-y-1.5 pt-1">
                              {tf.statements.map((st) => (
                                <div
                                  key={st.subId}
                                  className={`p-2.5 rounded-lg border flex items-start justify-between gap-3 ${
                                    showAns
                                      ? st.isCorrect
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                                        : 'bg-rose-50/70 border-rose-200 text-rose-950'
                                      : 'bg-slate-50 border-slate-200 text-slate-800'
                                  }`}
                                >
                                  <div>
                                    <span className="font-bold mr-1.5">{st.subId})</span>
                                    <span>{st.text}</span>
                                    {showAns && st.explanation && (
                                      <div className="text-[11px] text-slate-600 mt-1">
                                        → {st.explanation}
                                      </div>
                                    )}
                                  </div>
                                  {showAns && (
                                    <span
                                      className={`px-2 py-0.5 rounded font-bold text-[10px] shrink-0 ${
                                        st.isCorrect
                                          ? 'bg-emerald-700 text-white'
                                          : 'bg-rose-600 text-white'
                                      }`}
                                    >
                                      {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    )}

                    {/* PHẦN III: Trả lời ngắn / Tự luận */}
                    {exam.partIII && exam.partIII.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-sky-950 bg-sky-100/80 px-3.5 py-2 rounded-lg border border-sky-200">
                        PHẦN III. Câu hỏi trả lời ngắn / Tự luận ({exam.partIII.length} câu)
                      </h4>
                      <div className="space-y-3">
                        {exam.partIII.map((sa) => {
                          const saImgs =
                            sa.images && sa.images.length > 0
                              ? sa.images
                              : sa.imageUrl
                              ? [sa.imageUrl]
                              : [];
                          const resolvedTables = [
                            ...(sa.tableData ? [sa.tableData] : []),
                            ...(sa.extraTables || []),
                          ];
                          const resolvedCharts = [
                            ...(sa.chartData ? [sa.chartData] : []),
                            ...(sa.extraCharts || []),
                          ];
                          return (
                            <div
                              key={sa.id}
                              className={`bg-white p-4 rounded-xl border space-y-2 text-xs ${
                                sa.needsReview ? 'border-amber-300' : 'border-slate-200'
                              }`}
                            >
                              {sa.needsReview && (
                                <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                                  <span>
                                    <strong>Cần kiểm tra định dạng:</strong>{' '}
                                    {sa.reviewReason || 'Câu hỏi cần rà soát lại từ tệp PDF gốc.'}
                                  </span>
                                </div>
                              )}
                              <div className="font-bold text-slate-900 whitespace-pre-line">
                                <span className="text-sky-700">
                                  Câu {sa.originalNumber || sa.number}:
                                </span>{' '}
                                {sa.question}
                              </div>
                              {saImgs.length > 0 && (
                                <div className="flex flex-wrap gap-2 justify-center py-1">
                                  {saImgs.map((src, idx) => (
                                    <img
                                      key={idx}
                                      src={src}
                                      alt={`Hình Câu ${sa.number} Phần III (${idx + 1})`}
                                      className="max-h-52 w-auto object-contain rounded border border-slate-200 bg-slate-50 p-1"
                                    />
                                  ))}
                                </div>
                              )}
                              {resolvedCharts.map((ch, cIdx) => (
                                <DocumentChart key={cIdx} chartData={ch} compact className="my-1.5" />
                              ))}
                              {resolvedTables.map((tbl, tIdx) => (
                                <DocumentTable key={tIdx} tableData={tbl} compact className="my-1.5" />
                              ))}
                              {showAns && (sa.expectedAnswer || sa.explanation) && (
                                <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-800 space-y-0.5">
                                  {sa.expectedAnswer && (
                                    <div>
                                      <strong>Đáp án:</strong> {sa.expectedAnswer}
                                    </div>
                                  )}
                                  {sa.explanation && (
                                    <div className="text-slate-600 whitespace-pre-line">
                                      {sa.explanation}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: TẢI ĐỀ LÊN HỆ THỐNG */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 my-8 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isOfficialTab
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isOfficialTab ? (
                    <Award className="w-5 h-5" />
                  ) : isReferenceTab ? (
                    <BookOpen className="w-5 h-5" />
                  ) : (
                    <Building2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {isOfficialTab
                      ? 'Tải Đề Thi Chính Thức Các Năm Lên Hệ Thống'
                      : isReferenceTab
                      ? 'Đăng Tài Liệu / Đề Tham Khảo Lên Hệ Thống'
                      : 'Tải Đề Thi Thử Tỉnh / Sở GD&ĐT / Trường THPT Lên Hệ Thống'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tài liệu tải lên sẽ được lưu trực tiếp vào thẻ{' '}
                    <strong>
                      {isOfficialTab
                        ? 'Đề Chính Thức'
                        : isReferenceTab
                        ? 'Đề Tham Khảo'
                        : 'Đề Thi Thử Tỉnh'}
                    </strong>
                    , hỗ trợ học sinh làm bài trực tuyến, giao bài qua Mã QR và tải tệp gốc về máy.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitUploadExam} className="space-y-4 text-xs">
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                  {uploadError}
                </div>
              )}

              {/* Thông tin cơ bản của đề */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    {isReferenceTab ? 'Tên tài liệu / Đề tham khảo' : 'Tên đề thi'}{' '}
                    <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder={
                      isOfficialTab
                        ? 'VD: Đề Thi Chính Thức Tốt Nghiệp THPT Năm 2025 – Bộ GD&ĐT'
                        : isReferenceTab
                        ? 'VD: Đề Tham Khảo Ôn Thi Tốt Nghiệp THPT 2026 – Số 01'
                        : 'VD: Đề Thi Thử Tốt Nghiệp THPT Lần 1 Năm 2026 – Sở GD&ĐT Hà Nội'
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mã đề (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={uploadCode}
                    onChange={(e) => setUploadCode(e.target.value)}
                    placeholder={
                      isOfficialTab
                        ? 'VD: CT2025, 0718...'
                        : isReferenceTab
                        ? 'VD: TK01, TK26...'
                        : 'VD: HN01, TT26...'
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isOfficialTab
                      ? 'Cơ quan ra đề (Bộ GD&ĐT / Đơn vị)'
                      : isReferenceTab
                      ? 'Nguồn chia sẻ / Đơn vị'
                      : 'Tỉnh / Sở GD&ĐT / Cơ quan ra đề'}
                  </label>
                  <select
                    value={uploadProvince}
                    onChange={(e) => {
                      setUploadProvince(e.target.value);
                      setHasManualProvinceChoice(true);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {PROVINCE_LIST.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isOfficialTab
                      ? 'Kỳ thi / Đợt thi'
                      : isReferenceTab
                      ? 'Phân loại / Ghi chú ngắn'
                      : 'Đợt thi / Tên Trường THPT'}
                  </label>
                  <input
                    type="text"
                    value={uploadSchoolOrRound}
                    onChange={(e) => setUploadSchoolOrRound(e.target.value)}
                    placeholder={
                      isOfficialTab
                        ? 'VD: Đề Chính Thức Kỳ Thi Tốt Nghiệp THPT'
                        : isReferenceTab
                        ? 'VD: Đề Tham Khảo / Chuyên Đề Ôn Thi THPT'
                        : 'VD: Thi thử Lần 1 / Trường THPT Chuyên...'
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Năm thi</label>
                    <input
                      type="number"
                      min={2018}
                      max={2035}
                      value={uploadYear}
                      onChange={(e) => setUploadYear(Number(e.target.value) || 2026)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Thời gian (phút)</label>
                    <input
                      type="number"
                      min={15}
                      max={180}
                      value={uploadDuration}
                      onChange={(e) => setUploadDuration(Number(e.target.value) || 50)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {uploadProvince === 'Tỉnh / Sở GD&ĐT / Trường THPT khác' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nhập tên Tỉnh / Sở GD&amp;ĐT hoặc Trường THPT của bạn
                  </label>
                  <input
                    type="text"
                    value={customProvinceText}
                    onChange={(e) => setCustomProvinceText(e.target.value)}
                    placeholder="VD: Sở GD&ĐT Khánh Hòa / Trường THPT..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              )}

              {/* Bước 1: Chọn tệp đề thi đính kèm (.docx, .pdf, .txt, .json) */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <FolderUp className="w-4 h-4 text-emerald-700" />
                    <span>1. Chọn tệp đề thi từ máy tính (.docx, .pdf, .txt, .json)</span>
                  </label>
                  {isReadingFile ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-semibold text-[11px] flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Đang đọc &amp; tách câu hỏi từ tệp...</span>
                    </span>
                  ) : (
                    attachedFileName && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white font-semibold text-[11px]">
                        Đã đính kèm: {attachedFileName}
                      </span>
                    )
                  )}
                </div>
                <input
                  type="file"
                  accept=".docx,.pdf,.txt,.json,.md,.doc"
                  onChange={handleFileUploadChange}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
                />
                <p className="text-[11px] text-slate-600">
                  • Hỗ trợ trích xuất nguyên bản câu hỏi, bảng biểu và hình ảnh từ tệp Word{' '}
                  <code>.docx</code>, <code>.pdf</code>, <code>.txt</code>, <code>.json</code>. Tệp
                  gốc cũng được lưu nguyên bản để tải về.
                </p>
                {fileReadSummary && (
                  <div className="px-3 py-2 rounded-lg bg-white border border-emerald-200 text-[11px] font-medium text-emerald-900">
                    {fileReadSummary}
                  </div>
                )}
              </div>

              {/* Bước 2: Dán nội dung câu hỏi để hệ thống tự động tạo bài thi tương tác + mã QR */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-extrabold text-slate-800">
                    2. Nội dung tài liệu / câu hỏi (Tự động đọc nguyên bản từ .docx/.pdf/.txt hoặc dán trực tiếp)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadRawText(SAMPLE_PASTE_TEMPLATE);
                      setExtractedImages({});
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] cursor-pointer"
                  >
                    + Chèn mẫu định dạng đề chuẩn
                  </button>
                </div>

                <textarea
                  ref={rawTextAreaRef}
                  rows={8}
                  value={uploadRawText}
                  onChange={(e) => setUploadRawText(e.target.value)}
                  onPaste={(e) => {
                    const html = e.clipboardData?.getData('text/html');
                    if (html && /<table\b/i.test(html)) {
                      const converted = convertClipboardHtmlToStructuredText(html);
                      if (converted && converted.text) {
                        e.preventDefault();
                        const target = e.currentTarget;
                        const start = target.selectionStart ?? uploadRawText.length;
                        const end = target.selectionEnd ?? uploadRawText.length;
                        const nextVal =
                          uploadRawText.slice(0, start) +
                          converted.text +
                          uploadRawText.slice(end);
                        setUploadRawText(nextVal);
                        if (Object.keys(converted.tables).length > 0) {
                          setExtractedTables((prev) => ({ ...prev, ...converted.tables }));
                        }
                      }
                    }
                  }}
                  placeholder={`Dán nội dung tài liệu hoặc câu hỏi vào đây (Hỗ trợ dán trực tiếp bảng từ Word / Google Docs / Excel — tự động cố định cột & viền bảng):\n\nCâu 1: Nội dung câu hỏi 1?\nA. Phương án A\n*B. Phương án B (Đúng)\nC. Phương án C\nD. Phương án D`}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />

                {/* Bảng đối chiếu số câu phát hiện & cảnh báo kiểm tra trước khi lưu */}
                {(() => {
                  const diag = liveParsePreview.diagnostics;
                  const pdfWarnings = pdfExtractMeta?.warnings || [];
                  const hasAnyAlert = diag.hasIssues || pdfWarnings.length > 0;
                  const totalDetected =
                    liveParsePreview.parsedCountI +
                    liveParsePreview.parsedCountII +
                    liveParsePreview.parsedCountIII;
                  const chartTotal =
                    liveParsePreview.chartCount > 0
                      ? liveParsePreview.chartCount
                      : Object.keys(extractedCharts).length;
                  const imgTotal =
                    liveParsePreview.imageCount > 0
                      ? liveParsePreview.imageCount
                      : Object.keys(extractedImages).length;

                  return (
                    <div
                      className={`rounded-xl border p-3.5 space-y-2.5 text-[11px] ${
                        hasAnyAlert
                          ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                          : 'bg-emerald-50/70 border-emerald-200 text-slate-700'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-bold">
                          {hasAnyAlert ? (
                            <>
                              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                              <span className="text-amber-900">
                                Cần rà soát định dạng trước khi lưu (đã giữ nguyên 100% câu hỏi)
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                              <span className="text-emerald-900">
                                Đối chiếu đầy đủ · Giữ nguyên 100% nội dung gốc
                              </span>
                            </>
                          )}
                        </div>
                        {pdfExtractMeta?.pageCount ? (
                          <span className="text-[11px] font-medium text-slate-600 tabular-nums">
                            PDF: {pdfExtractMeta.extractedPageCount ?? pdfExtractMeta.pageCount}/
                            {pdfExtractMeta.pageCount} trang
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs tabular-nums">
                        <span className="font-bold text-slate-900">
                          Tổng: {totalDetected} câu
                        </span>
                        <span aria-hidden="true" className="text-slate-400">
                          ·
                        </span>
                        <span>
                          Phần I:{' '}
                          <strong className="text-emerald-800">
                            {liveParsePreview.parsedCountI} câu
                          </strong>
                          {diag.partI.reviewCount > 0 && (
                            <span className="text-amber-800 font-semibold">
                              {' '}
                              ({diag.partI.reviewCount} cần kiểm tra)
                            </span>
                          )}
                        </span>
                        <span aria-hidden="true" className="text-slate-400">
                          ·
                        </span>
                        <span>
                          Phần II:{' '}
                          <strong className="text-emerald-800">
                            {liveParsePreview.parsedCountII} câu Đ/S
                          </strong>
                          {diag.partII.reviewCount > 0 && (
                            <span className="text-amber-800 font-semibold">
                              {' '}
                              ({diag.partII.reviewCount} cần kiểm tra)
                            </span>
                          )}
                        </span>
                        {liveParsePreview.parsedCountIII > 0 && (
                          <>
                            <span aria-hidden="true" className="text-slate-400">
                              ·
                            </span>
                            <span>
                              Phần III:{' '}
                              <strong className="text-sky-800">
                                {liveParsePreview.parsedCountIII} câu ngắn/tự luận
                              </strong>
                              {diag.partIII.reviewCount > 0 && (
                                <span className="text-amber-800 font-semibold">
                                  {' '}
                                  ({diag.partIII.reviewCount} cần kiểm tra)
                                </span>
                              )}
                            </span>
                          </>
                        )}
                        {liveParsePreview.tableCount > 0 && (
                          <>
                            <span aria-hidden="true" className="text-slate-400">
                              ·
                            </span>
                            <span>{liveParsePreview.tableCount} bảng biểu</span>
                          </>
                        )}
                        {chartTotal > 0 && (
                          <>
                            <span aria-hidden="true" className="text-slate-400">
                              ·
                            </span>
                            <span>{chartTotal} biểu đồ</span>
                          </>
                        )}
                        {imgTotal > 0 && (
                          <>
                            <span aria-hidden="true" className="text-slate-400">
                              ·
                            </span>
                            <span>{imgTotal} hình ảnh</span>
                          </>
                        )}
                      </div>

                      {/* Danh sách cảnh báo trang PDF & khoảng trống đánh số câu hỏi */}
                      {(pdfWarnings.length > 0 || diag.warnings.length > 0) && (
                        <div className="space-y-1 pt-2 border-t border-amber-200/80 text-amber-900">
                          {pdfWarnings.map((w, idx) => (
                            <div key={`pdfw-${idx}`} className="flex items-start gap-1.5">
                              <span className="font-bold shrink-0">•</span>
                              <span>{w}</span>
                            </div>
                          ))}
                          {diag.warnings.map((w, idx) => (
                            <div key={`diagw-${idx}`} className="flex items-start gap-1.5 font-medium">
                              <span className="font-bold shrink-0">•</span>
                              <span>{w}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Danh sách các câu lệch định dạng đã được bảo toàn & nút nhảy nhanh tới dòng văn bản */}
                      {diag.needsReviewItems.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-amber-200/80">
                          <div className="font-bold text-amber-950">
                            Câu hỏi lệch định dạng đã được giữ nguyên ({diag.needsReviewItems.length} câu — nhấn &ldquo;Đi tới vị trí&rdquo; để chỉnh sửa trực tiếp):
                          </div>
                          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                            {diag.needsReviewItems.map((item, idx) => (
                              <div
                                key={`rev-${item.part}-${item.number}-${idx}`}
                                className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-2 bg-white/90 border border-amber-200 rounded-lg px-2.5 py-2"
                              >
                                <div className="space-y-0.5 min-w-0">
                                  <div className="font-bold text-slate-900">
                                    Phần {item.part} · Câu {item.originalNumber}
                                    <span className="font-normal text-amber-800 ml-1.5">
                                      — {item.reason}
                                    </span>
                                  </div>
                                  {item.snippet && (
                                    <div className="text-[10px] text-slate-500 truncate max-w-md">
                                      &ldquo;{item.snippet}…&rdquo;
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => jumpToQuestionInTextarea(item.charOffset)}
                                  className="px-2.5 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-950 font-semibold text-[11px] flex items-center gap-1 shrink-0 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  <CornerDownRight className="w-3 h-3" />
                                  <span>Đi tới vị trí</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-200">
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>
                    Dấu thời gian đăng:{' '}
                    <strong className="text-slate-900">
                      {formatUploadTimestamp(new Date(nowTickMs).toISOString())}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={uploadSubmitting || isReadingFile}
                    className={`px-5 py-2.5 rounded-xl disabled:opacity-60 text-white font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer ${
                      isOfficialTab
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-emerald-700 hover:bg-emerald-800'
                    }`}
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>
                      {isReadingFile
                        ? 'Đang đọc tệp...'
                        : uploadSubmitting
                        ? 'Đang lưu tài liệu...'
                        : isOfficialTab
                        ? 'Lưu Vào Thẻ Đề Chính Thức'
                        : isReferenceTab
                        ? 'Lưu Vào Thẻ Đề Tham Khảo'
                        : 'Lưu Vào Thẻ Đề Thi Thử Tỉnh'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
