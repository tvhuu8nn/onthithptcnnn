import {
  Exam,
  MultipleChoiceQuestion,
  SubjectDomain,
  TrueFalseQuestion,
  TrueFalseStatement,
} from '../types/exam';
import {
  ChapterMCQItem,
  ChapterQuestionItem,
  ChapterTFQuestion,
  ChapterTFStatement,
} from '../data/chapterReviewData';

/**
 * Kiểm tra xem 4 phương án có phải là dạng con số / kí hiệu / công thức cực ngắn không
 * (VD: "1.", "2.", "3.", "4." hoặc "từ 5‰ đến 25‰.")
 */
function isShortNumericOrCodeOptions(options: string[]): boolean {
  const lens = options.map((o) => o.trim().length);
  const maxLen = Math.max(...lens);
  if (maxLen <= 14) return true;
  const allNumericLike = options.every((o) =>
    /^(?:từ\s+|khoảng\s+|trên\s+|dưới\s+)?[\d.,+\-–—%‰°C/a-zA-Z\s()]{1,22}\.?$/i.test(
      o.trim()
    )
  );
  return allNumericLike && maxLen <= 24;
}

/**
 * Các thay thế cụm từ dài dòng sang diễn đạt súc tích, giữ nguyên 100% nghĩa khoa học
 */
const CONCISE_REPLACEMENTS: [RegExp, string][] = [
  [/\bmột cách hoàn toàn tự động\b/gi, 'tự động'],
  [/\bhoàn toàn tự động\b/gi, 'tự động'],
  [/\bcó tác dụng giúp cho\b/gi, 'giúp'],
  [/\bcó khả năng giúp\b/gi, 'giúp'],
  [/\bnhằm mục đích để\b/gi, 'để'],
  [/\bnhằm mục đích\b/gi, 'để'],
  [/\btrong suốt quá trình\b/gi, 'khi'],
  [/\btất cả các loại\b/gi, 'các loại'],
  [/\btoàn bộ các loại\b/gi, 'các loại'],
  [/\bmôi trường bên ngoài\b/gi, 'bên ngoài'],
  [/\bngay lập tức\b/gi, 'ngay'],
  [/\bmột cách nhanh chóng\b/gi, 'nhanh'],
  [/\bmột cách triệt để\b/gi, 'triệt để'],
  [/\bmột cách hợp lý\b/gi, 'hợp lý'],
  [/\bmột cách hiệu quả\b/gi, 'hiệu quả'],
  [/\bđồng thời kết hợp với việc\b/gi, 'và'],
  [/\bđồng thời kết hợp với\b/gi, 'kết hợp'],
  [/\bđồng thời kết hợp\b/gi, 'kết hợp'],
  [/\bvào thời điểm\b/gi, 'lúc'],
  [/\bở trong điều kiện\b/gi, 'trong điều kiện'],
  [/\bở tại khu vực\b/gi, 'tại khu vực'],
  [/\bcác nguyên tố dinh dưỡng\b/gi, 'dinh dưỡng'],
  [/\bcác chất dinh dưỡng\b/gi, 'dinh dưỡng'],
  [/\bvi sinh vật có ích\b/gi, 'vi sinh có lợi'],
  [/\bvi sinh vật có lợi\b/gi, 'vi sinh có lợi'],
  [/\bthuốc bảo vệ thực vật\b/gi, 'thuốc BVTV'],
  [/\bđộ ẩm tương đối của không khí\b/gi, 'ẩm độ không khí'],
  [/\bhệ số chuyển đổi thức ăn\b/gi, 'hệ số FCR'],
  [/\bhệ số chuyển hóa thức ăn\b/gi, 'hệ số FCR'],
  [/\bkhác biệt không có ý nghĩa thống kê\b/gi, 'không khác biệt thống kê'],
  [/\bkhác biệt có ý nghĩa thống kê\b/gi, 'khác biệt thống kê'],
  [/\bđối với các công thức còn lại\b/gi, 'với các công thức khác'],
  [/\btrong toàn bộ thời gian thí nghiệm\b/gi, 'trong thí nghiệm'],
  [/\btrên một đơn vị diện tích\b/gi, 'trên đơn vị diện tích'],
];

/**
 * Kiểm tra một vế câu sau khi ngắt có bị cụt từ hoặc kết thúc bằng hư từ treo hay không.
 */
function isCompleteClause(text: string): boolean {
  const t = text.trim();
  if (t.length < 18) return false;
  if (
    /\s+(?:và|hoặc|hay|để|nhằm|giúp|với|tại|trong|trên|dưới|ở|khi|do|vì|cho|theo|bằng|từ|đến|tránh|kèm|rồi|như|là|có|được|bị|sẽ|đang|đã|rất|quá|hơn|nhất|của|về|ra|vào|lên|xuống|đi|lại|chuyển|biến|làm|gây|tạo|chứa|gồm|thuộc|mà|nên|nhưng)$/i.test(
      t
    )
  ) {
    return false;
  }
  return true;
}

/**
 * Thu gọn từng bước một phương án quá dài về gần độ dài mục tiêu (targetLen)
 * CHỈ ngắt tại các ranh giới mệnh đề ngữ pháp hoàn chỉnh (không bao giờ cắt ngang từ ghép).
 */
function tightenOptionToTarget(
  rawOption: string,
  targetLen: number,
  _question = ''
): string {
  let s = String(rawOption || '')
    .trim()
    .replace(/\s{2,}/g, ' ');
  if (!s) return s;

  const hasDot = s.endsWith('.');
  if (hasDot) s = s.slice(0, -1).trim();

  const effectiveTarget = hasDot ? Math.max(18, targetLen - 1) : targetLen;
  if (s.length <= effectiveTarget + 5) {
    return hasDot ? `${s}.` : s;
  }

  // Bước 1: Áp dụng các rút gọn cụm từ súc tích
  for (const [rx, rep] of CONCISE_REPLACEMENTS) {
    if (s.length <= effectiveTarget + 4) break;
    const next = s.replace(rx, rep).replace(/\s{2,}/g, ' ').trim();
    if (next.length >= effectiveTarget - 10 && next.length < s.length) {
      s = next;
    }
  }

  if (s.length <= effectiveTarget + 5) {
    return hasDot ? `${s}.` : s;
  }

  // Bước 2: Loại bỏ các chú thích phụ trong ngoặc đơn (...) nếu giúp độ dài gần target hơn
  const parenMatches = Array.from(s.matchAll(/\s*\([^)]+\)/g));
  parenMatches.sort((a, b) => b[0].length - a[0].length);
  for (const m of parenMatches) {
    if (s.length <= effectiveTarget + 5) break;
    const candidate = s.replace(m[0], '').replace(/\s{2,}/g, ' ').trim();
    if (
      candidate.length >= effectiveTarget - 15 &&
      Math.abs(candidate.length - effectiveTarget) <
        Math.abs(s.length - effectiveTarget)
    ) {
      s = candidate;
    }
  }

  if (s.length <= effectiveTarget + 5) {
    return hasDot ? `${s}.` : s;
  }

  // Bước 3: Lược bỏ mệnh đề phụ nối thêm ở cuối câu tại ranh giới ngữ pháp rõ ràng
  const clauseBoundaries = [
    /,\s*đồng thời\s+[^;]+$/i,
    /,\s*qua đó\s+[^;]+$/i,
    /,\s*từ đó\s+[^;]+$/i,
    /,\s*giúp cho\s+[^;]+$/i,
    /,\s*giúp\s+[^;]+$/i,
    /,\s*làm cho\s+[^;]+$/i,
    /,\s*khiến cho\s+[^;]+$/i,
    /,\s*kết hợp với\s+[^;]+$/i,
    /,\s*kết hợp\s+[^;]+$/i,
    /,\s*tránh\s+[^;]+$/i,
    /,\s*không\s+[^;]+$/i,
    /,\s*còn\s+[^;]+$/i,
    /,\s*nhưng\s+[^;]+$/i,
    /;\s*[^;]+$/i,
    /\s+trước khi\s+[^,;]+$/i,
    /\s+sau khi\s+[^,;]+$/i,
    /\s+khiến\s+[^,;]+$/i,
    /\s+làm cho\s+[^,;]+$/i,
    /\s+làm\s+[^,;]{14,}$/i,
    /\s+nên\s+[^,;]{16,}$/i,
    /\s+nhưng\s+[^,;]{14,}$/i,
    /\s+để\s+[^,;]{14,}$/i,
    /\s+nhằm\s+[^,;]{14,}$/i,
    /\s+và\s+[^,;]{16,}$/i,
    /,\s*[^,]+$/i,
  ];

  for (let pass = 0; pass < 3; pass++) {
    if (s.length <= effectiveTarget + 6) break;
    let bestCandidate: string | null = null;
    let bestDist = Math.abs(s.length - effectiveTarget);

    for (const sepRx of clauseBoundaries) {
      const candidate = s
        .replace(sepRx, '')
        .replace(/[,;:\-–—]+$/, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
      if (
        candidate !== s &&
        isCompleteClause(candidate) &&
        candidate.length >= Math.max(24, effectiveTarget - 18)
      ) {
        const dist = Math.abs(candidate.length - effectiveTarget);
        if (dist < bestDist) {
          bestDist = dist;
          bestCandidate = candidate;
        }
      }
    }

    if (bestCandidate) {
      s = bestCandidate;
    } else {
      break;
    }
  }

  return hasDot ? (s.endsWith('.') ? s : `${s}.`) : s;
}

/**
 * Kho cụm từ bổ sung ngữ cảnh khoa học tự nhiên theo từng lĩnh vực và từng vị trí (0..3)
 * được chia thành nhiều nấc độ dài mịn (từ 8 ký tự đến 75 ký tự) để cân bằng các phương án ngắn
 * sao cho cả 4 phương án A, B, C, D luôn có số ký tự tương đương nhau và tự nhiên 100%.
 */
const DOMAIN_EXTENSION_BANKS: Record<SubjectDomain, string[][]> = {
  crop: [
    [
      ' tại ruộng',
      ' ở đồng ruộng',
      ' trong trồng trọt',
      ' tại các vùng canh tác',
      ' trên đồng ruộng canh tác',
      ' trong sản xuất nông nghiệp',
      ' trong canh tác cây trồng hiện nay',
      ' trong quá trình canh tác nông nghiệp',
      ' trong quy trình kỹ thuật canh tác cây trồng',
      ' trong quy trình kỹ thuật canh tác cây trồng hiện nay',
      ' trong quy trình sản xuất trồng trọt theo tiêu chuẩn kỹ thuật',
      ' trong hệ thống canh tác cây trồng nông nghiệp tại các vùng chuyên canh',
    ],
    [
      ' cho cây',
      ' cho cây trồng',
      ' đối với cây trồng',
      ' cho các giống cây trồng',
      ' đối với các loại cây trồng',
      ' đối với sinh trưởng của cây',
      ' đối với sự sinh trưởng cây trồng',
      ' đối với quá trình phát triển của cây',
      ' đối với quá trình sinh trưởng và phát triển của cây',
      ' đối với hoạt động sinh lý và sự phát triển của cây trồng',
      ' đối với hoạt động sinh lý và khả năng hấp thu của cây trồng',
      ' đối với quá trình sinh trưởng, phát triển của các giống cây trồng',
    ],
    [
      ' ngoài đồng',
      ' ngoài thực tế',
      ' ở ngoài tự nhiên',
      ' tại khu vực gieo trồng',
      ' tại các vùng trồng trọt',
      ' trong điều kiện đồng ruộng',
      ' trong điều kiện đất đai canh tác',
      ' trong điều kiện canh tác ở địa phương',
      ' trong điều kiện sản xuất nông nghiệp ở địa phương',
      ' trong điều kiện môi trường đất đai và khí hậu thời vụ',
      ' trong điều kiện thời tiết và môi trường đất trồng ngoài đồng ruộng',
    ],
    [
      ' hằng năm',
      ' theo mùa vụ',
      ' theo thời vụ gieo',
      ' trong vụ gieo trồng',
      ' qua các giai đoạn chăm sóc',
      ' trong suốt chu kỳ sinh trưởng',
      ' trong suốt thời kỳ nuôi dưỡng cây',
      ' trong các giai đoạn chăm sóc cây trồng',
      ' trong suốt các giai đoạn chăm sóc và nuôi dưỡng cây',
      ' trong suốt thời gian từ khi gieo trồng đến khi thu hoạch',
      ' trong suốt các giai đoạn sinh trưởng từ lúc gieo hạt đến thu hoạch',
    ],
  ],
  husbandry: [
    [
      ' tại trại',
      ' ở trang trại',
      ' trong chăn nuôi',
      ' tại cơ sở chăn nuôi',
      ' tại các cơ sở chăn nuôi',
      ' trong chăn nuôi nông hộ',
      ' trong quy trình chăn nuôi gia súc',
      ' trong kỹ thuật chăn nuôi hiện đại',
      ' trong quy trình kỹ thuật chăn nuôi gia súc',
      ' trong quy trình kỹ thuật chăn nuôi gia súc và gia cầm',
      ' trong hệ thống chuồng trại chăn nuôi gia súc, gia cầm hiện nay',
      ' trong quy trình quản lý kỹ thuật tại các trang trại chăn nuôi tập trung',
    ],
    [
      ' cho đàn',
      ' cho vật nuôi',
      ' đối với vật nuôi',
      ' cho đàn gia súc nuôi',
      ' cho đàn gia súc gia cầm',
      ' đối với cơ thể đàn vật nuôi',
      ' đối với sức khỏe đàn vật nuôi',
      ' đối với sự sinh trưởng của vật nuôi',
      ' đối với quá trình sinh trưởng và sức khỏe đàn vật nuôi',
      ' đối với hoạt động trao đổi chất và sinh trưởng của đàn vật nuôi',
      ' đối với khả năng sinh trưởng, phát triển và sức đề kháng của vật nuôi',
    ],
    [
      ' ở chuồng',
      ' tại chuồng nuôi',
      ' ở khu chuồng nuôi',
      ' tại khu vực trang trại',
      ' trong điều kiện trang trại',
      ' tại khu vực chuồng trại chăn nuôi',
      ' trong môi trường chuồng nuôi thực tế',
      ' trong điều kiện chăn nuôi tại trang trại',
      ' trong điều kiện môi trường chuồng trại chăn nuôi thực tế',
      ' trong điều kiện chăm sóc và nuôi dưỡng tại khu vực chuồng trại',
      ' trong điều kiện vệ sinh thú y và môi trường chuồng nuôi tại trang trại',
    ],
    [
      ' định kỳ',
      ' theo lứa nuôi',
      ' theo khẩu phần ăn',
      ' trong chu kỳ chăn nuôi',
      ' qua các giai đoạn nuôi dưỡng',
      ' trong suốt chu kỳ nuôi thương phẩm',
      ' trong quá trình chăm sóc đàn vật nuôi',
      ' trong suốt thời gian nuôi dưỡng gia súc',
      ' trong suốt các giai đoạn chăm sóc và nuôi dưỡng vật nuôi',
      ' trong suốt quá trình nuôi dưỡng từ giai đoạn con non đến xuất chuồng',
      ' trong suốt thời gian nuôi dưỡng và chăm sóc đàn gia súc tại nông hộ',
    ],
  ],
  forestry: [
    [
      ' tại rừng',
      ' ở trong rừng',
      ' trong lâm nghiệp',
      ' tại các lâm phần rừng',
      ' tại khu vực đất lâm nghiệp',
      ' trong hoạt động lâm nghiệp',
      ' trong hoạt động sản xuất lâm nghiệp',
      ' trong công tác quản lý bảo vệ rừng',
      ' trong công tác quản lý và phát triển rừng bền vững',
      ' trong quy trình kỹ thuật lâm sinh và quản lý rừng bền vững',
      ' trong quy trình kỹ thuật lâm sinh và quản lý bảo vệ rừng hiện nay',
      ' trong quy trình kỹ thuật trồng, chăm sóc và bảo vệ hệ sinh thái rừng',
    ],
    [
      ' cho rừng',
      ' cho cây rừng',
      ' đối với cây rừng',
      ' đối với hệ sinh thái rừng',
      ' trên diện tích đất lâm nghiệp',
      ' đối với quần xã thực vật rừng',
      ' đối với sự phát triển của rừng',
      ' đối với sinh trưởng của cây gỗ rừng',
      ' đối với sự sinh trưởng của các loài cây gỗ trong rừng',
      ' đối với cấu trúc tầng tán và quá trình sinh trưởng của cây rừng',
      ' đối với khả năng sinh trưởng, phục hồi tự nhiên của hệ sinh thái rừng',
    ],
    [
      ' ở đồi núi',
      ' ở vùng đồi núi',
      ' tại khu vực rừng',
      ' tại các khu vực rừng trồng',
      ' trên các đai rừng phòng hộ',
      ' trong điều kiện lập địa lâm nghiệp',
      ' tại các tiểu khu rừng tự nhiên và rừng trồng',
      ' trong điều kiện tự nhiên tại các khu vực đất lâm nghiệp',
      ' trong điều kiện địa hình và khí hậu tại các vùng quy hoạch lâm nghiệp',
      ' trong điều kiện lập địa tự nhiên tại các tiểu khu rừng phòng hộ và sản xuất',
    ],
    [
      ' hằng năm',
      ' theo độ tuổi rừng',
      ' theo chu kỳ rừng',
      ' trong kỳ kinh doanh rừng',
      ' qua các giai đoạn lâm sinh',
      ' trong suốt thời kỳ kinh doanh rừng',
      ' trong quá trình chăm sóc rừng trồng',
      ' trong suốt các giai đoạn phát triển của rừng',
      ' trong suốt các giai đoạn chăm sóc và nuôi dưỡng rừng trồng',
      ' trong suốt chu kỳ sinh trưởng từ giai đoạn rừng non đến khi khép tán',
      ' trong suốt quá trình phát triển của lâm phần từ lúc trồng mới đến khai thác',
    ],
  ],
  aquaculture: [
    [
      ' tại ao nuôi',
      ' ở ao đầm nuôi',
      ' trong thủy sản',
      ' tại các ao đầm nuôi',
      ' trong nuôi trồng thủy sản',
      ' tại cơ sở nuôi thủy sản',
      ' trong quy trình nuôi trồng thủy sản',
      ' trong kỹ thuật nuôi thủy sản thâm canh',
      ' trong hệ thống ao nuôi trồng thủy sản hiện nay',
      ' trong hệ thống ao nuôi trồng thủy sản thâm canh hiện nay',
      ' trong quy trình kỹ thuật quản lý môi trường ao nuôi thủy sản',
      ' trong hệ thống công nghệ nuôi trồng và khai thác nguồn lợi thủy sản',
    ],
    [
      ' cho tôm cá',
      ' cho thủy sản',
      ' đối với tôm cá',
      ' đối với đàn thủy sản',
      ' cho các loài thủy sản nuôi',
      ' đối với cơ thể động vật thủy sản',
      ' đối với sức khỏe của đàn thủy sản',
      ' đối với sự sinh trưởng của thủy sản',
      ' đối với tốc độ sinh trưởng và tỉ lệ sống của tôm cá',
      ' đối với hoạt động hô hấp và sinh trưởng của các loài thủy sản',
      ' đối với quá trình trao đổi chất, phát triển và tỉ lệ sống của thủy sản',
    ],
    [
      ' ở thủy vực',
      ' trong nước ao',
      ' ở môi trường nước',
      ' trong thủy vực nuôi trồng',
      ' tại khu vực lồng bè và ao nuôi',
      ' tại các vùng nước nuôi thương phẩm',
      ' trong môi trường thủy vực nuôi thực tế',
      ' trong điều kiện môi trường nước ao nuôi',
      ' trong điều kiện môi trường nước ao nuôi thủy sản thực tế',
      ' trong điều kiện chất lượng nước tại các thủy vực nuôi trồng thủy sản',
      ' trong điều kiện biến động các yếu tố thủy lý, thủy hóa của môi trường ao nuôi',
    ],
    [
      ' hằng ngày',
      ' theo vụ nuôi',
      ' theo vụ nuôi mới',
      ' trong vụ nuôi thương phẩm',
      ' qua các giai đoạn ương nuôi',
      ' trong suốt vụ nuôi thương phẩm',
      ' trong quá trình ương dưỡng thủy sản',
      ' trong suốt chu kỳ nuôi thủy sản thương phẩm',
      ' trong suốt các giai đoạn từ khi thả giống đến thu hoạch',
      ' trong suốt chu kỳ ương dưỡng từ giai đoạn ấu trùng đến thương phẩm',
      ' trong suốt quá trình chăm sóc và quản lý dịch bệnh từ đầu đến cuối vụ nuôi',
    ],
  ],
};

/**
 * Mở rộng tự nhiên một phương án quá ngắn để đạt độ dài tương đương với targetLen.
 */
function expandOptionToTarget(
  rawOption: string,
  targetLen: number,
  domain: SubjectDomain = 'crop',
  slotIndex = 0,
  usedSuffixes: Set<string> = new Set()
): string {
  let s = String(rawOption || '')
    .trim()
    .replace(/\s{2,}/g, ' ');
  if (!s) return s;

  const hasDot = s.endsWith('.');
  if (hasDot) s = s.slice(0, -1).trim();

  const effectiveTarget = hasDot ? Math.max(18, targetLen - 1) : targetLen;
  if (effectiveTarget - s.length <= 5) {
    return hasDot ? `${s}.` : s;
  }

  const domainBanks =
    DOMAIN_EXTENSION_BANKS[domain] || DOMAIN_EXTENSION_BANKS.crop;
  const orderedSlots = [
    slotIndex % 4,
    (slotIndex + 1) % 4,
    (slotIndex + 2) % 4,
    (slotIndex + 3) % 4,
  ];

  // Cho phép ghép tối đa 2 cụm bổ ngữ khác nhóm (VD: đối tượng + thời gian/địa điểm) nếu phương án gốc quá ngắn
  const usedSlotGroups = new Set<number>();
  for (let step = 0; step < 2; step++) {
    const needed = effectiveTarget - s.length;
    if (needed <= 6) break;

    let bestSuffix = '';
    let bestSlotGroup = -1;
    let bestDiff = needed;

    for (const sIdx of orderedSlots) {
      if (usedSlotGroups.has(sIdx)) continue;
      const slotBank = domainBanks[sIdx];
      for (const candidateSuffix of slotBank) {
        if (usedSuffixes.has(candidateSuffix)) continue;
        const words = candidateSuffix.trim().split(/\s+/);
        const lastTwo = words.slice(-2).join(' ').toLowerCase();
        if (s.toLowerCase().includes(lastTwo)) continue;

        const newLen = s.length + candidateSuffix.length;
        // Nếu cần ghép 2 bước (needed > 68), ở bước 1 ưu tiên chọn câu dài nhất không vượt quá effectiveTarget
        const diff = Math.abs(newLen - effectiveTarget);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestSuffix = candidateSuffix;
          bestSlotGroup = sIdx;
        }
      }
      if (bestDiff <= 5) break;
    }

    if (bestSuffix && bestSlotGroup !== -1) {
      usedSuffixes.add(bestSuffix);
      usedSlotGroups.add(bestSlotGroup);
      s = `${s}${bestSuffix}`;
    } else {
      break;
    }
  }

  return hasDot ? (s.endsWith('.') ? s : `${s}.`) : s;
}

/**
 * Cân bằng 4 phương án A, B, C, D của một câu hỏi trắc nghiệm nhiều lựa chọn
 * sao cho cả 4 phương án có số ký tự tương đương nhau (chênh lệch tối thiểu)
 * và 100% trọn vẹn câu chữ tự nhiên.
 */
export function balanceFourOptionsEqualLength(
  rawOptions: [string, string, string, string],
  question = '',
  domain: SubjectDomain = 'crop'
): [string, string, string, string] {
  const cleaned = rawOptions.map((o) =>
    String(o || '')
      .trim()
      .replace(/\s{2,}/g, ' ')
  ) as [string, string, string, string];

  if (isShortNumericOrCodeOptions(cleaned)) {
    return cleaned;
  }

  const endsWithIncompleteStem =
    /(?:là|gồm|như|vì|do|để|bằng|ở|tại|vào|của)\s*$/i.test(question.trim());
  const anyHasDot = cleaned.filter((o) => o.endsWith('.')).length >= 2;

  const formatted = cleaned.map((o) => {
    let text = o.endsWith('.') ? o.slice(0, -1).trim() : o;
    if (!endsWithIncompleteStem && text.length > 0) {
      text = text[0].toUpperCase() + text.slice(1);
    }
    return anyHasDot ? `${text}.` : text;
  }) as [string, string, string, string];

  const lens = formatted.map((o) => o.length);
  const minLen = Math.min(...lens);
  const maxLen = Math.max(...lens);

  // Nếu 4 phương án gốc đã có số ký tự tương đương nhau (chênh lệch <= 12 ký tự), giữ nguyên 100%
  if (maxLen - minLen <= 12) {
    return formatted;
  }

  const sortedLens = [...lens].sort((a, b) => a - b);
  let initialTarget = Math.round((sortedLens[1] + sortedLens[2]) / 2);
  if (sortedLens[3] - sortedLens[2] > 20 && sortedLens[2] < 65) {
    initialTarget = Math.min(76, Math.max(58, sortedLens[2] + 12));
  }
  initialTarget = Math.max(30, Math.min(130, initialTarget));

  // Bước 1: Thu gọn các phương án quá dài tại ranh giới mệnh đề tự nhiên
  const tightened = formatted.map((opt) => {
    if (opt.length > initialTarget + 5) {
      return tightenOptionToTarget(opt, initialTarget, question);
    }
    return opt;
  }) as [string, string, string, string];

  // Bước 2: Sau khi thu gọn an toàn (không cắt ngang từ), lấy độ dài chuẩn bám sát phương án dài nhất
  // để mở rộng các phương án ngắn hơn lên tương đương nhau!
  const tLens = tightened.map((o) => o.length);
  const maxTightened = Math.max(...tLens);
  const finalTarget = Math.max(30, maxTightened - 2);

  const usedSuffixes = new Set<string>();

  const finalBalanced = tightened.map((opt, idx) => {
    if (opt.length > finalTarget + 6) {
      return tightenOptionToTarget(opt, finalTarget, question);
    }
    if (opt.length < finalTarget - 5) {
      return expandOptionToTarget(opt, finalTarget, domain, idx, usedSuffixes);
    }
    return opt;
  }) as [string, string, string, string];

  return finalBalanced;
}

export function condenseOptionToCore(
  rawOption: string,
  question = ''
): string {
  return tightenOptionToTarget(rawOption, 85, question);
}

/**
 * Rút gọn lời giải thích (explanation) ngắn gọn, đi thẳng vào bản chất khoa học đúng trọng tâm câu hỏi.
 */
export function condenseExplanationToCore(rawExplanation: string): string {
  let s = String(rawExplanation || '').trim();
  if (!s) return s;

  s = s
    .replace(
      /^Theo\s+(?:Bài\s+\d+\s*(?:và\s*Bài\s*\d+\s*)?)?SGK\s+[^,.:]+(?:\([^)]+\))?\s*[,.:-]\s*/i,
      ''
    )
    .replace(/^Theo\s+Bài\s+\d+\s*\([^)]+\)\s*[,.:-]\s*/i, '')
    .replace(
      /^(?:Đúng|Sai)\s*\((?:Biết|Hiểu|Thông hiểu|Vận dụng)\)\s*:\s*Theo\s+[^,]+,\s*/i,
      (m) => m.replace(/:\s*Theo\s+[^,]+,\s*/i, ': ')
    )
    .replace(/\s*\(Bài\s+\d+[^)]*\)\.?$/i, '.')
    .replace(/\s*\(SGK[^)]*\)\.?$/i, '.')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (s.length > 0) {
    s = s[0].toUpperCase() + s.slice(1);
  }
  if (!/[.!?]$/.test(s)) {
    s += '.';
  }
  return s;
}

export function extendOptionToLength(
  text: string,
  targetLength = 80,
  domain: SubjectDomain = 'crop',
  slot = 0
): string {
  return expandOptionToTarget(text, targetLength, domain, slot);
}

export function extendQuestionToLength(
  question: string,
  _targetLength?: number,
  _domain?: SubjectDomain
): string {
  return question.trim();
}

/**
 * Chuẩn hóa câu hỏi trắc nghiệm nhiều lựa chọn (MultipleChoiceQuestion):
 * 1. Cân bằng độ dài 4 phương án A, B, C, D có số ký tự tương đương nhau.
 * 2. Xoay vòng đáp án đúng đều giữa A, B, C, D (nếu có truyền rotateIndex).
 */
export function normalizeMultipleChoiceQuestion(
  q: MultipleChoiceQuestion,
  rotateIndex?: number
): MultipleChoiceQuestion {
  const keys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const qTrimmed = q.question.trim();

  const balancedTuple = balanceFourOptionsEqualLength(
    [q.options.A, q.options.B, q.options.C, q.options.D],
    qTrimmed,
    q.domain || 'crop'
  );

  let optionsObj: Record<'A' | 'B' | 'C' | 'D', string> = {
    A: balancedTuple[0],
    B: balancedTuple[1],
    C: balancedTuple[2],
    D: balancedTuple[3],
  };
  let correctKey = q.correctAnswer;

  if (rotateIndex !== undefined) {
    const targetIdx = ((rotateIndex % 4) + 4) % 4;
    const currentIdx = keys.indexOf(q.correctAnswer);
    if (currentIdx !== -1 && currentIdx !== targetIdx) {
      const correctText = optionsObj[q.correctAnswer];
      const otherTexts = keys
        .filter((k) => k !== q.correctAnswer)
        .map((k) => optionsObj[k]);

      const newOptions: Record<'A' | 'B' | 'C' | 'D', string> = {
        A: '',
        B: '',
        C: '',
        D: '',
      };
      let otherPtr = 0;
      for (let i = 0; i < 4; i++) {
        const k = keys[i];
        if (i === targetIdx) {
          newOptions[k] = correctText;
        } else {
          newOptions[k] = otherTexts[otherPtr++];
        }
      }
      optionsObj = newOptions;
      correctKey = keys[targetIdx];
    }
  }

  return {
    ...q,
    question: qTrimmed,
    options: optionsObj,
    correctAnswer: correctKey,
    explanation: condenseExplanationToCore(q.explanation),
  };
}

/**
 * Chuẩn hóa câu hỏi Đúng/Sai Phần II (TrueFalseQuestion):
 * Giữ mệnh đề rõ ràng, ngắn gọn và tinh gọn lời giải thích đúng trọng tâm.
 */
export function normalizeTrueFalseQuestion(
  tf: TrueFalseQuestion
): TrueFalseQuestion {
  const normalizedStatements = tf.statements.map((stmt) => ({
    ...stmt,
    text: stmt.text.trim(),
    explanation: condenseExplanationToCore(stmt.explanation),
  })) as [
    TrueFalseStatement,
    TrueFalseStatement,
    TrueFalseStatement,
    TrueFalseStatement
  ];

  return {
    ...tf,
    statements: normalizedStatements,
  };
}

/**
 * Chuẩn hóa toàn bộ một Đề thi (Exam)
 */
export function normalizeExam(exam: Exam, examSeed = 0): Exam {
  return {
    ...exam,
    partI: exam.partI.map((q, idx) =>
      normalizeMultipleChoiceQuestion(q, idx + examSeed)
    ),
    partII: exam.partII.map((tf) => normalizeTrueFalseQuestion(tf)),
  };
}

/**
 * Chuẩn hóa câu hỏi trắc nghiệm trong Ôn tập chương (ChapterMCQItem)
 * Đảm bảo 4 phương án trả lời có số ký tự tương đương nhau.
 */
export function normalizeChapterMCQItem(
  q: ChapterMCQItem,
  domain: SubjectDomain = 'crop'
): ChapterMCQItem {
  const qTrimmed = q.question.trim();
  const balancedOptions = balanceFourOptionsEqualLength(
    q.options,
    qTrimmed,
    domain
  );
  return {
    ...q,
    question: qTrimmed,
    options: balancedOptions,
    explanation: condenseExplanationToCore(q.explanation),
  };
}

/**
 * Chuẩn hóa câu hỏi Đúng/Sai trong Ôn tập chương (ChapterTFQuestion)
 */
export function normalizeChapterTFQuestion(
  tf: ChapterTFQuestion,
  _domain?: SubjectDomain
): ChapterTFQuestion {
  const normalizedStatements = tf.statements.map((stmt) => ({
    ...stmt,
    text: stmt.text.trim(),
    explanation: condenseExplanationToCore(stmt.explanation),
  })) as [
    ChapterTFStatement,
    ChapterTFStatement,
    ChapterTFStatement,
    ChapterTFStatement
  ];

  return {
    ...tf,
    statements: normalizedStatements,
  };
}

/**
 * Chuẩn hóa câu hỏi tự luận ôn tập chương (ChapterQuestionItem)
 */
export function normalizeChapterQuestionItem(
  item: ChapterQuestionItem,
  _domain?: SubjectDomain
): ChapterQuestionItem {
  if (!item.answer || item.answer.length === 0) return item;
  return {
    ...item,
    question: item.question.trim(),
    answer: item.answer.map((a) =>
      a
        .trim()
        .replace(/\s*\(([^)]{28,})\)/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim()
    ),
  };
}
