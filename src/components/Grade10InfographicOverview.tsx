import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  FileText,
  Layers,
  Lock,
  PenTool,
  Sparkles,
  Target,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AuthUser } from '../types/auth';
import { trackDocumentDownload } from '../utils/examDownloader';

export const GRADE10_INFOGRAPHIC_PDF_URL =
  '/assets/aistudio/He_thong_hoa_kien_thuc_Cong_nghe_10_8ce65dc2.pdf';

type ChapterThemeKey = 'emerald' | 'amber' | 'teal' | 'rose' | 'indigo';

interface SummaryBox {
  title: string;
  items: string[];
}

interface TableColumnSection {
  title: string;
  headers?: string[];
  rows: string[][];
  variant?: 'standard' | 'two-column-cards' | 'three-column-cards' | 'four-step-grid';
  footerBox?: {
    title: string;
    content: string;
  };
}

interface InfographicChapter {
  id: string;
  chapterId: string; // matches chapterReviewData.ts id ('cn10-c1' .. 'cn10-c8')
  chapterNumber: string;
  title: string;
  lessonsRange: string;
  pageLabel: string;
  theme: ChapterThemeKey;
  objectives: string[];
  summaryBoxes: SummaryBox[];
  sections: TableColumnSection[];
}

const THEME_STYLES: Record<
  ChapterThemeKey,
  {
    headerBg: string;
    border: string;
    accentBorder: string;
    badgeBg: string;
    softBg: string;
    softBorder: string;
    titleText: string;
    tableHeaderBg: string;
    bulletColor: string;
    pillActive: string;
    stepBadge: string;
  }
> = {
  emerald: {
    headerBg: 'bg-emerald-800',
    border: 'border-emerald-200',
    accentBorder: 'border-l-emerald-700',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    softBg: 'bg-emerald-50/75',
    softBorder: 'border-emerald-200',
    titleText: 'text-emerald-900',
    tableHeaderBg: 'bg-emerald-800 text-white',
    bulletColor: 'text-emerald-700',
    pillActive: 'bg-emerald-700 text-white border-emerald-700',
    stepBadge: 'bg-emerald-700 text-white',
  },
  amber: {
    headerBg: 'bg-amber-800',
    border: 'border-amber-200',
    accentBorder: 'border-l-amber-700',
    badgeBg: 'bg-amber-100 text-amber-950 border-amber-200',
    softBg: 'bg-amber-50/75',
    softBorder: 'border-amber-200',
    titleText: 'text-amber-950',
    tableHeaderBg: 'bg-amber-800 text-white',
    bulletColor: 'text-amber-700',
    pillActive: 'bg-amber-700 text-white border-amber-700',
    stepBadge: 'bg-amber-700 text-white',
  },
  teal: {
    headerBg: 'bg-teal-800',
    border: 'border-teal-200',
    accentBorder: 'border-l-teal-700',
    badgeBg: 'bg-teal-100 text-teal-950 border-teal-200',
    softBg: 'bg-teal-50/75',
    softBorder: 'border-teal-200',
    titleText: 'text-teal-950',
    tableHeaderBg: 'bg-teal-800 text-white',
    bulletColor: 'text-teal-700',
    pillActive: 'bg-teal-700 text-white border-teal-700',
    stepBadge: 'bg-teal-700 text-white',
  },
  rose: {
    headerBg: 'bg-rose-800',
    border: 'border-rose-200',
    accentBorder: 'border-l-rose-700',
    badgeBg: 'bg-rose-100 text-rose-950 border-rose-200',
    softBg: 'bg-rose-50/75',
    softBorder: 'border-rose-200',
    titleText: 'text-rose-950',
    tableHeaderBg: 'bg-rose-800 text-white',
    bulletColor: 'text-rose-700',
    pillActive: 'bg-rose-700 text-white border-rose-700',
    stepBadge: 'bg-rose-700 text-white',
  },
  indigo: {
    headerBg: 'bg-indigo-800',
    border: 'border-indigo-200',
    accentBorder: 'border-l-indigo-700',
    badgeBg: 'bg-indigo-100 text-indigo-950 border-indigo-200',
    softBg: 'bg-indigo-50/75',
    softBorder: 'border-indigo-200',
    titleText: 'text-indigo-950',
    tableHeaderBg: 'bg-indigo-800 text-white',
    bulletColor: 'text-indigo-700',
    pillActive: 'bg-indigo-700 text-white border-indigo-700',
    stepBadge: 'bg-indigo-700 text-white',
  },
};

const GRADE_10_INFOGRAPHIC_CHAPTERS: InfographicChapter[] = [
  {
    id: 'info-c1',
    chapterId: 'cn10-c1',
    chapterNumber: 'Chương I',
    title: 'GIỚI THIỆU CHUNG VỀ TRỒNG TRỌT',
    lessonsRange: 'Bài 1 – Bài 2',
    pageLabel: 'Trang 1/11',
    theme: 'emerald',
    objectives: [
      'Vai trò, triển vọng trồng trọt trong CMCN 4.0',
      'Thành tựu công nghệ cao',
      'Yêu cầu với người lao động',
      'Phân loại cây trồng & Mối quan hệ với các yếu tố chính',
    ],
    summaryBoxes: [
      {
        title: '1. Vai trò của trồng trọt',
        items: [
          'Đảm bảo an ninh lương thực; thúc đẩy chăn nuôi & công nghiệp chế biến.',
          'Xuất khẩu nông sản (đạt 41,25 tỉ USD năm 2020); tạo việc làm (37,7% lực lượng lao động) và cảnh quan xanh.',
        ],
      },
      {
        title: '2. Triển vọng trong CMCN 4.0',
        items: [
          'Nông nghiệp công nghệ cao giúp giảm phụ thuộc vào thời tiết.',
          'Ứng dụng IoT, AI, công nghệ nano quản lí toàn diện từ khâu sản xuất đến tiêu thụ.',
        ],
      },
      {
        title: '3. Yêu cầu đối với người lao động',
        items: [
          'Sức khoẻ tốt, chăm chỉ, có trách nhiệm, yêu thiên nhiên.',
          'Có kiến thức, vận hành được máy móc; tuân thủ an toàn lao động và bảo vệ môi trường.',
        ],
      },
    ],
    sections: [
      {
        title: '4. Thành tựu ứng dụng công nghệ cao trong trồng trọt (Bài 1)',
        variant: 'two-column-cards',
        headers: ['Tại Việt Nam', 'Trên Thế giới'],
        rows: [
          [
            'Cơ giới hoá (trên cây lúa, năm 2020): Làm đất ~95%, gieo trồng ~42%, chăm sóc ~77%, thu hoạch ~70% (máy cày, máy cấy, drone, máy gặt đập liên hợp).',
            'Miyagi (Nhật Bản): Nhà máy rau 2.500 m², 18 kệ × 15 tầng, 17.500 đèn LED, thu hoạch >10.000 cây xà lách/ngày.',
          ],
          [
            'Thuỷ canh, khí canh: Ứng dụng trồng rau ăn lá, dưa chuột, cà chua, dâu tây, khoai tây.',
            'Vườn Keukenhof (Hà Lan): Diện tích 32 ha, hàng triệu bông hoa tulip; Hà Lan xuất khẩu nông sản đứng thứ 2 thế giới.',
          ],
          [
            'Tưới tiết kiệm & Nhà kính: Tưới nhỏ giọt, phun mưa, phun sương; nhà kính trồng hoa, dưa lưới kiểm soát sâu bệnh và tiểu khí hậu.',
            'Trang trại táo California (Mỹ): <0,7% dân số làm nông nghiệp; >2,1 triệu trang trại dùng drone, cảm biến. Vườn kì diệu (Dubai): 72.000 m² trên sa mạc, >60 triệu bông hoa, tưới nhỏ giọt bằng nước thải đã xử lí.',
          ],
        ],
      },
      {
        title: '5. Phân loại cây trồng & 7 yếu tố chính trong trồng trọt (Bài 2)',
        variant: 'two-column-cards',
        headers: ['Phân loại cây trồng (mang tính tương đối)', 'Mối quan hệ với 7 yếu tố chính'],
        rows: [
          [
            'Theo nguồn gốc: Ôn đới (đông lạnh, hè mát: dâu tây, mận, lê, táo đỏ); Nhiệt đới (không chịu lạnh/băng: vải, xoài, ổi, mít); Á nhiệt đới (cần thời gian lạnh để ra hoa, đậu quả: bơ, cherry).',
            '1. Giống: Quy định năng suất, phẩm chất, khả năng kháng bệnh (ví dụ: lúa BT7KBL kháng bạc lá). 2. Ánh sáng: Quang hợp; cường độ & quang chu kì quyết định sự ra hoa.',
          ],
          [
            'Theo đặc tính sinh vật học: Cây hằng năm / lâu năm; thân thảo / thân gỗ; một lá mầm / hai lá mầm.',
            '3. Nhiệt độ: Ảnh hưởng hô hấp, quang hợp (đa số thích hợp 15–40°C). 4. Nước & độ ẩm: Quang hợp, hoà tan khoáng, điều hoà nhiệt; ngập úng/hạn gây chết cây.',
          ],
          [
            'Theo mục đích sử dụng: Cây lương thực, cây ăn quả, cây rau, cây dược liệu, cây lấy gỗ, cây hoa...',
            '5. Đất trồng: Dự trữ nước, dinh dưỡng, không khí; giữ cây đứng vững. 6. Dinh dưỡng: Thiếu gây còi cọc; thừa gây ngộ độc, rối loạn sinh trưởng. 7. Kĩ thuật canh tác: Làm đất, bón phân, luân canh, thời vụ, mật độ...',
          ],
        ],
      },
    ],
  },
  {
    id: 'info-c2',
    chapterId: 'cn10-c2',
    chapterNumber: 'Chương II',
    title: 'ĐẤT TRỒNG',
    lessonsRange: 'Bài 3 – Bài 6',
    pageLabel: 'Trang 2/11',
    theme: 'amber',
    objectives: [
      'Khái niệm, thành phần, tính chất đất trồng',
      'Cơ sở khoa học cải tạo đất chua, mặn, bạc màu',
      'Sản xuất giá thể trồng cây',
      'Thực hành xác định độ chua, độ mặn của đất',
    ],
    summaryBoxes: [
      {
        title: '1. Đất trồng & Thành phần (Bài 3)',
        items: [
          'Lớp bề mặt tơi xốp của vỏ Trái Đất hình thành từ đá mẹ.',
          'Gồm 4 thành phần: Phần rắn (vô cơ ~95%, hữu cơ <5%), Phần lỏng (nước), Phần khí (O₂, N₂, CO₂) và Sinh vật đất.',
        ],
      },
      {
        title: '2. Keo đất & Tính chất đất trồng',
        items: [
          'Keo đất (~1 µm) gồm nhân keo và lớp điện kép giúp đất hấp phụ và trao đổi ion dinh dưỡng.',
          'Thành phần cơ giới gồm cát (0,02–2 mm), limon (0,002–0,02 mm), sét (<0,002 mm) tạo thành đất cát, đất thịt, đất sét.',
          'Phản ứng của đất: Chua (pH < 6,6), Trung tính (pH 6,6–7,5), Kiềm (pH > 7,5).',
        ],
      },
    ],
    sections: [
      {
        title: '3. Cải tạo đất thoái hoá & Cơ sở khoa học (Bài 4)',
        variant: 'standard',
        headers: ['Loại đất thoái hoá', 'Nguyên nhân hình thành', 'Biện pháp cải tạo & Cơ sở khoa học'],
        rows: [
          [
            'Đất chua (Nhiều H⁺, Al³⁺, Fe³⁺)',
            'Mưa rửa trôi Ca²⁺, Mg²⁺, K⁺; bón phân chua sinh lí ((NH₄)₂SO₄, KCl); phân giải kị khí chất hữu cơ.',
            'Bón vôi: Khử chua, kết tủa Al³⁺, Fe³⁺ hết độc tính, tăng hoạt động VSV. Thuỷ lợi & canh tác: Kênh thau chua; che phủ đất, trồng cây phân xanh.',
          ],
          [
            'Đất mặn (Hàm lượng muối > 2,56%)',
            'Thuỷ triều, vỡ đê, nước biển xâm nhập vùng trũng ven biển; nước ngầm mặn thấm mao quản lên mặt đất.',
            'Thuỷ lợi (biện pháp chính): Đắp đê, trồng cây chắn sóng; kênh rửa mặn; hạ mực nước ngầm. Bón phân & làm đất: Phân hữu cơ, vôi rửa mặn; cày không lật cắt đứt mao quản.',
          ],
          [
            'Đất bạc màu (Tầng canh tác mỏng, chua)',
            'Địa hình dốc thoải rửa trôi mạnh (Đông Nam Bộ, Tây Nguyên); độc canh, để đất trống mùa mưa.',
            'Bón phân: Phân hữu cơ, phân xanh nâng độ phì nhiêu; bón vôi nâng pH. Canh tác & thuỷ lợi: Luân canh, trồng xen cây họ Đậu; tưới tiêu hợp lí.',
          ],
        ],
      },
      {
        title: '4. Giá thể trồng cây (Bài 5) & Thực hành đo độ chua, độ mặn (Bài 6)',
        variant: 'two-column-cards',
        headers: ['Giá thể hữu cơ tự nhiên & Giá thể trơ cứng', 'Thực hành xác định độ chua (pH) & độ mặn (EC)'],
        rows: [
          [
            'Than bùn (Hữu cơ): Giữ ẩm/dinh dưỡng tốt, nghèo khoáng. SX: Phơi, nghiền → Trộn vôi, phụ gia, VSV, ủ → Đóng gói.',
            'Chuẩn bị mẫu đất: Theo TCVN-7538-4-2007; phơi khô tự nhiên, nghiền nhỏ, rây qua lưới 1 mm.',
          ],
          [
            'Mùn cưa (Hữu cơ): Tạo hữu cơ, kém thoáng. SX: Phơi khô, đảo → Ủ VSV phân giải cellulose → Đóng gói. Trấu hun: Sạch bệnh, giàu kali, hấp thụ nhiệt. SX: Đốt kị khí, làm nguội, lọc → Trộn VSV → Đóng gói.',
            'Đo độ chua (pH): 20 g đất + 50 mL nước cất (pH_H₂O) hoặc 50 mL KCl 1N (pH_KCl < pH_H₂O). Lắc 15–20 phút → Đo máy (ngập điện cực 2 cm, chờ 30 giây). Thang pH_H₂O: <4,5 (rất chua); 4,5–5,5 (chua); 5,6–6,5 (chua ít); 6,6–7,5 (trung tính); ≥7,6 (kiềm).',
          ],
          [
            'Xơ dừa (Hữu cơ): Thoáng, giữ ẩm; có tanin/lignin. SX: Làm nhỏ → Ngâm nước (2–3 ngày) + nước vôi (5–7 ngày) → Ủ VSV → Đóng gói. Giá thể trơ cứng: Perlite (nung 800–850°C, giàu SiO₂, nhẹ, giải phóng Al giảm pH); Gốm (nung 1.200–1.300°C, bền, tái sử dụng, khô nhanh).',
            'Đo độ mặn (EC): 20 g đất + 100 mL nước cất → Lắc 15–20 phút → Lọc lấy dung dịch → Đo máy EC (ngập 2 cm, chờ 30 giây). Thang EC (dS/m): 0–2 (không mặn); 2–4 (mặn ít); 4–8 (mặn trung bình); 8–16 (mặn); >16 (rất mặn).',
          ],
        ],
      },
    ],
  },
  {
    id: 'info-c3',
    chapterId: 'cn10-c3',
    chapterNumber: 'Chương III',
    title: 'PHÂN BÓN',
    lessonsRange: 'Bài 7 – Bài 10',
    pageLabel: 'Trang 3–4/11',
    theme: 'teal',
    objectives: [
      'Khái niệm, vai trò, đặc điểm phân bón',
      'So sánh sử dụng & bảo quản 3 nhóm phân bón',
      'Ứng dụng công nghệ vi sinh sản xuất phân bón',
      'Thực hành nhận biết phân bón hoá học',
    ],
    summaryBoxes: [
      {
        title: 'Khái niệm & Vai trò phân bón',
        items: [
          'Cung cấp chất dinh dưỡng chính (N, P, K), nguyên tố vi lượng hoặc cải tạo đất nhằm tăng năng suất, chất lượng nông sản và hiệu quả kinh tế.',
        ],
      },
      {
        title: 'Thực hành nhận biết phân bón hoá học (Bài 10)',
        items: [
          'Bước 1 – Hoà tan nước cất: Ít/không tan là Phân lân; tan hết là phân đạm hoặc phân kali.',
          'Bước 2 – Đốt trên đèn cồn: Mùi khai, khói trắng là Phân đạm (+ Diphenylamine → xanh thẫm: NH₄NO₃; + BaCl₂ → kết tủa trắng: (NH₄)₂SO₄; + AgNO₃ → kết tủa trắng: NH₄Cl).',
          'Ngọn lửa màu tím hoặc nổ lép bép là Phân kali (+ BaCl₂ → kết tủa trắng: K₂SO₄; không kết tủa: KCl).',
        ],
      },
    ],
    sections: [
      {
        title: '1. Đặc điểm, cách sử dụng và bảo quản 3 loại phân bón (Bài 7 – Bài 8)',
        variant: 'standard',
        headers: ['Tiêu chí', 'Phân bón hoá học', 'Phân bón hữu cơ', 'Phân bón vi sinh'],
        rows: [
          [
            'Đặc điểm',
            'Sản xuất công nghiệp (N, P, K, NPK, vi lượng). Hàm lượng dinh dưỡng cao (Urea 46% N), dễ tan (trừ lân), tác dụng nhanh; bón nhiều gây chua đất.',
            'Phân chuồng, than bùn, phân xanh, phân rác. Đa dạng nguyên tố nhưng hàm lượng thấp (<1%), tác dụng chậm (cần khoáng hoá), bền, cải tạo đất tốt.',
            'Chứa VSV sống (cố định đạm, chuyển hoá lân, phân giải hữu cơ). Hạn dùng ngắn, chuyên biệt cho từng nhóm cây, an toàn và cải tạo đất.',
          ],
          [
            'Cách sử dụng',
            'Đạm, kali: bón thúc. Lân: bón lót (lân tự nhiên bón đất chua). NPK: lót/thúc. Đúng lúc, đúng liều, tránh mưa; bón vôi chống chua.',
            'Chủ yếu bón lót sớm với lượng lớn; dùng phân hoai mục; ủ chung với phân lân giúp chóng hoai và lân dễ tiêu; phối hợp với phân vô cơ.',
            'Trộn/tẩm hạt, rễ trước gieo hoặc bón vào đất (cây ngắn ngày: bón lót; cây dài ngày: sau thu hoạch). Giữ đủ ẩm đất cho VSV hoạt động.',
          ],
          [
            'Bảo quản',
            '4 chống: Chống ẩm (kê giá gỗ, bao kín); Chống lẫn lộn (chia ngăn); Chống acid (nền gạch/xi măng); Chống nóng (tránh nổ nitrate).',
            'Phủ bạt/trát bùn. 3 cách ủ: Ủ nóng (hiếu khí, 60–70°C, chóng hoai); Ủ nguội (kị khí, nén chặt, dự trữ); Ủ hỗn hợp (nóng trước, nguội sau).',
            'Nơi thoáng mát, tránh nắng trực tiếp và ẩm ướt. Thời hạn sử dụng: mùa hè ~4 tháng, mùa đông ~6 tháng.',
          ],
        ],
      },
      {
        title: '2. Công nghệ vi sinh sản xuất phân bón (Bài 9)',
        variant: 'standard',
        headers: ['Loại phân vi sinh', 'Chủng VSV đặc hiệu', 'Quy trình sản xuất chính'],
        rows: [
          [
            'Phân VSV cố định đạm',
            'Rhizobium, Bradyrhizobium (họ Đậu); Spirillum, Azospirillum (lúa); Azotobacter, Clostridium (tự do).',
            'B1: Nhân giống VSV (máy lắc 150 v/phút, 48h) + rây chất mang 0,25 mm, tiệt trùng 2 atm (121–130°C/2h) → B2: Phối trộn, ủ 1 tuần, thêm đa/vi lượng → B3: Kiểm tra TCVN, đóng bao.',
          ],
          [
            'Phân VSV chuyển hoá lân',
            'VSV chuyển lân khó tiêu thành dễ tiêu (chất mang: than bùn, bột phosphorite/apatite).',
            'B1: Nhân giống VSV (48–72h vi khuẩn/nấm men; 5–7 ngày xạ khuẩn/nấm mốc) → B2: Tiệt trùng chất mang (2 atm/2h) → B3: Phối trộn, ủ 1 tuần → B4: Kiểm tra TCVN, đóng bao.',
          ],
          [
            'Phân VSV phân giải hữu cơ',
            'VSV phân giải xác thực vật (nguyên liệu: than bùn, bã mía, vỏ cà phê...).',
            'B1: Tập kết, sơ chế nguyên liệu hữu cơ → B2: Ủ với VSV phân giải hữu cơ → B3: Bổ sung chế phẩm VSV, NPK, vi lượng → B4: Kiểm tra TCVN, đóng bao.',
          ],
        ],
      },
    ],
  },
  {
    id: 'info-c4',
    chapterId: 'cn10-c4',
    chapterNumber: 'Chương IV',
    title: 'CÔNG NGHỆ GIỐNG CÂY TRỒNG',
    lessonsRange: 'Bài 11 – Bài 14',
    pageLabel: 'Trang 5–6/11',
    theme: 'emerald',
    objectives: [
      'Khái niệm, 4 cấp giống & vai trò giống cây trồng',
      'Các phương pháp chọn, tạo và nhân giống cây trồng',
      'Ứng dụng công nghệ sinh học (chuyển gene, nuôi cấy mô)',
      'Thực hành ghép đoạn cành & ghép chữ T cây ăn quả',
    ],
    summaryBoxes: [
      {
        title: 'Khái niệm (Luật Trồng trọt 2018) & 4 cấp giống',
        items: [
          'Giống cây trồng là quần thể cây trồng phân biệt được ít nhất 1 đặc tính di truyền, đồng nhất về hình thái, ổn định qua chu kì nhân giống, có giá trị canh tác và sử dụng.',
          '4 cấp giống: Giống tác giả → Giống siêu nguyên chủng → Giống nguyên chủng → Giống xác nhận (sản xuất đại trà).',
        ],
      },
      {
        title: 'Vai trò của giống cây trồng',
        items: [
          'Tăng năng suất, nâng cao chất lượng nông sản (lúa ST25, BC15).',
          'Kháng sâu bệnh (ngô DK9955s), chống chịu điều kiện bất lợi (mặn, hạn); tăng vụ và chuyển đổi cơ cấu cây trồng.',
        ],
      },
    ],
    sections: [
      {
        title: '1. Các phương pháp chọn và tạo giống cây trồng (Bài 12)',
        variant: 'standard',
        headers: ['Phương pháp', 'Quy trình tiến hành', 'Đặc điểm & Thành tựu'],
        rows: [
          [
            'Chọn lọc hỗn hợp',
            'Vụ 1 chọn ~10% cây tốt thu hỗn hợp hạt → Vụ 2 gieo chung so sánh đối chứng → Lặp lại (tự thụ phấn: 1 lần; giao phấn: nhiều lần).',
            'Đơn giản, ít tốn kém nhưng không đánh giá được đặc điểm di truyền của từng cá thể.',
          ],
          [
            'Chọn lọc cá thể',
            'Vụ 1 chọn vài cá thể tốt nhất, giữ hạt riêng → Vụ 2 gieo riêng từng hàng so sánh đối chứng → Lặp lại (áp dụng cây tự thụ phấn).',
            'Độ đồng đều cao, tính ổn định tốt nhưng công phu và tốn diện tích.',
          ],
          [
            'Lai giống thuần (Lai đơn)',
            'Chọn bố mẹ → Khử đực mẹ, thụ phấn bố thu F₁ → Gieo F₁ loại cây xấu → Gieo từng hàng nhiều vụ tạo dòng thuần → Khảo nghiệm.',
            'Tạo giống thuần ổn định: lúa PC6, OM 5451, LTh31.',
          ],
          [
            'Ưu thế lai (Lai khác dòng)',
            'Thu thập vật liệu → Tự thụ phấn tạo dòng thuần bố mẹ → Lai khác dòng → Chọn tổ hợp ưu thế lai → SX hạt lai → Khảo nghiệm.',
            'Thế hệ F₁ vượt trội bố mẹ về năng suất, sức sống: lúa LY006, ngô LYN10, cà chua HT25.',
          ],
          [
            'Gây đột biến',
            'Thu thập vật liệu → Xử lí tác nhân vật lí/hoá học/sinh học → Chọn thể đột biến → Tự thụ phấn tạo dòng thuần → Khảo nghiệm.',
            'Tạo tổ hợp gene mới có lợi: táo má hồng, lạc LDH.10, đậu tương DT84.',
          ],
          [
            'Công nghệ gene (Chuyển gene)',
            'Chuẩn bị nguồn cho/nhận gene → Thu nhận gene → Gắn thể truyền/súng bắn gene → Chuyển gene → Chọn lọc tế bào mang gene → Khảo nghiệm.',
            'Tạo cây biến đổi gene: lúa vàng (giàu β-carotene), ngô NK66BT, đậu tương RR.',
          ],
        ],
      },
      {
        title: '2. Nhân giống cây trồng (Bài 13) & Thực hành ghép cây ăn quả (Bài 14)',
        variant: 'two-column-cards',
        headers: ['Phương pháp nhân giống (Bài 13)', 'Thực hành ghép đoạn cành & ghép chữ T (Bài 14)'],
        rows: [
          [
            'Nhân giống hữu tính (bằng hạt – 4 vụ): Nhân hạt tác giả (từ cây G₀) → Hạt siêu nguyên chủng → Hạt nguyên chủng → Hạt xác nhận.',
            'Chuẩn bị dụng cụ & vật liệu: Dao ghép sắc, kéo cắt cành, dây ghép tự huỷ; gốc ghép khoẻ và cành/mắt ghép đúng giống.',
          ],
          [
            'Nhân giống vô tính truyền thống: Giâm cành (cắt cành bánh tẻ 2–3 mắt ngủ, tỉa lá → nhúng thuốc ra rễ → cắm nền giâm ẩm); Chiết cành (khoanh vỏ cành khoẻ → bôi thuốc ra rễ, bó đất + nylon → ra rễ cắt trồng); Ghép (gieo gốc ghép → chọn & xử lí cành/mắt ghép → ghép vào gốc → chăm sóc).',
            'Ghép đoạn cành: B1: Chọn cành bánh tẻ (2–3 mầm ngủ), cắt bỏ lá, cắt vát gốc 1,5–2 cm. B2: Gốc ghép cách mặt đất 10–15 cm, tỉa cành phụ, cắt vát tương tự. B3: Đặt chồng khít tượng tầng, buộc cố định, chụp túi nylon kín. B4: Sau 30–35 ngày mở dây kiểm tra.',
          ],
          [
            'Nuôi cấy mô tế bào (CNSH): B1: Chọn mẫu mô non sạch bệnh → B2: Khử trùng → B3: Tạo chồi → B4: Tạo rễ → B5: Đưa cây ra vườn ươm. Ưu điểm: nhân nhanh hệ số lớn, sạch bệnh, sản xuất quanh năm.',
            'Ghép chữ T: B1: Cắt mắt ghép hình thoi dài 1,5–2 cm (kèm ít gỗ & mầm ngủ). B2: Cách mặt đất 15–20 cm, rạch ngang 1 cm + rạch dọc 2 cm (chữ T), tách nhẹ vỏ. B3: Cài mắt ghép vào khe chữ T, quấn dây (tránh đè mắt & cuống lá). B4: Sau 15–20 ngày tháo dây; sau 7–10 ngày cắt ngọn gốc ghép cách mắt 1,5–2 cm.',
          ],
        ],
      },
    ],
  },
  {
    id: 'info-c5',
    chapterId: 'cn10-c5',
    chapterNumber: 'Chương V',
    title: 'PHÒNG TRỪ SÂU, BỆNH HẠI CÂY TRỒNG',
    lessonsRange: 'Bài 15 – Bài 18',
    pageLabel: 'Trang 7–8/11',
    theme: 'rose',
    objectives: [
      'Tác hại & ý nghĩa phòng trừ sâu, bệnh hại',
      '5 biện pháp phòng trừ tổng hợp (IPM)',
      'Đặc điểm nhận biết, nguyên nhân & phòng trừ 8 sâu, bệnh thường gặp',
      'Ứng dụng công nghệ vi sinh sản xuất chế phẩm Bt, NPV, nấm',
    ],
    summaryBoxes: [
      {
        title: 'Khái niệm & Ý nghĩa (Bài 15)',
        items: [
          'Sâu hại là côn trùng ăn phá bộ phận cây; Bệnh hại là trạng thái bất thường của cây do nấm, vi khuẩn, virus hoặc điều kiện ngoại cảnh bất lợi.',
          'Phòng trừ sâu, bệnh giúp bảo vệ năng suất, chất lượng nông sản; ưu tiên biện pháp sinh học và IPM nhằm bảo vệ môi trường, thiên địch và sức khoẻ con người.',
        ],
      },
      {
        title: '5 biện pháp phòng trừ sâu, bệnh hại',
        items: [
          '(1) Canh tác: vệ sinh đồng ruộng, luân/xen canh, giống kháng. (2) Cơ giới, vật lí: bắt sâu, bẫy đèn/bả, bao quả.',
          '(3) Sinh học: dùng thiên địch, chế phẩm VSV. (4) Hoá học: tác dụng nhanh nhưng dễ ô nhiễm, gây kháng thuốc. (5) IPM: phối hợp đồng bộ các biện pháp, lấy sinh học làm trọng tâm.',
        ],
      },
    ],
    sections: [
      {
        title: '1. Nhận biết & phòng trừ sâu, bệnh hại thường gặp (Bài 16 – Bài 17)',
        variant: 'standard',
        headers: ['Tên sâu / bệnh', 'Tác nhân & Đặc điểm nhận biết, gây hại', 'Biện pháp phòng trừ chính'],
        rows: [
          [
            'Sâu tơ hại rau (Plutella xylostella)',
            'Ngài nâu có dải gợn sóng trắng/vàng; sâu non xanh nhạt 4 tuổi; nhộng bọc kén tơ trắng. Ăn thủng lá rau họ Cải trơ gân.',
            'Xen canh hành, tỏi, cà chua; luân canh lúa; dùng bẫy; Abamectin, nấm trắng/xanh, chế phẩm Bt, ong kí sinh.',
          ],
          [
            'Rầy nâu hại lúa (Nilaparvata lugens)',
            'Thân nâu vàng 3–5 mm; trứng xếp ổ hình nải chuối trong bẹ lá; rầy non 5 tuổi. Chích hút nhựa gây hiện tượng “cháy rầy”.',
            'Giống kháng (quan trọng nhất); vệ sinh ruộng, gieo đúng vụ, bón phân cân đối; thả vịt, cá rô phi, nấm xanh.',
          ],
          [
            'Sâu keo mùa thu (Spodoptera frugiperda)',
            'Ngài nâu xám vân gợn sóng; sâu non đầu có vân chữ Y ngược, đốt cuối có 4 u lông đen xếp hình vuông. Phá hại mạnh trên ngô.',
            'Cày lật diệt nhộng, luân canh lúa; bẫy ngài, ngắt ổ trứng; dùng ong kí sinh, nấm xanh, Bt, virus NPV.',
          ],
          [
            'Ruồi đục quả (Bactrocera dorsalis)',
            'Ngực có 2 sọc vàng, bụng vân chữ T đen; dòi không chân. Ruồi chích vỏ quả tạo vết đen, dòi đục bên trong làm thối rụng quả.',
            'Vệ sinh vườn, bọc quả sớm, tiêu huỷ quả rụng; đặt bẫy bắt ruồi trưởng thành; phun thuốc đúng hướng dẫn.',
          ],
          [
            'Bệnh thán thư',
            'Nấm Colletotrichum (ưa ẩm độ cao, sương muối). Đốm mép lá viền nâu sẫm; chồi non thối khô; quả chấm đen lõm, rụng.',
            'Tỉa cành bệnh, bọc quả, thoát nước tốt; bón cân đối NPK; phun Difenoconazole, Tebuconazole, Azoxystrobin.',
          ],
          [
            'Vàng lá greening',
            'Vi khuẩn Candidatus Liberibacter asiaticus (do rầy chổng cánh truyền). Lá lốm đốm vàng xanh, gân lá sưng; quả nhỏ, méo mó.',
            'Dùng giống sạch bệnh (quan trọng nhất); tỉa tán thông thoáng; diệt rầy chổng cánh; nhổ huỷ cây bệnh (chưa có thuốc trị).',
          ],
          [
            'Đạo ôn hại lúa',
            'Nấm Pyricularia oryzae. Vết bệnh trên lá hình thoi nâu nhạt, giữa tro xám, có quầng vàng; cổ bông nâu xám teo thắt dễ gãy.',
            'Giống chống chịu, xử lí hạt giống, vệ sinh ruộng, bón phân cân đối; phun phòng khi trời âm u, ẩm cao, có sương mù.',
          ],
          [
            'Héo xanh vi khuẩn',
            'Vi khuẩn Pseudomonas solanacearum. Lá héo rũ đột ngột nhưng thân vẫn xanh, rắn đặc; cắt ngang thân có dịch nhờn trắng chảy ra.',
            'Giống sạch bệnh; ngâm ruộng 15–30 ngày hoặc phơi đất, luân canh lúa nước; sử dụng chế phẩm Bacillus subtilis.',
          ],
        ],
      },
      {
        title: '2. Ứng dụng công nghệ vi sinh sản xuất chế phẩm trừ sâu, bệnh (Bài 18)',
        variant: 'three-column-cards',
        headers: [
          'Chế phẩm vi khuẩn (Bt)',
          'Chế phẩm virus (NPV)',
          'Chế phẩm nấm (Trừ sâu & bệnh)',
        ],
        rows: [
          [
            'Quy trình SX: Giống cấp 1 → Giống cấp 2 → Lên men → Sấy nghiền → Trộn phụ gia → Đóng gói.',
            'Quy trình SX: Nuôi vật chủ (sâu non) → Lây nhiễm virus → Tăng sinh khối → Nghiền, li tâm → Phối trộn → Đóng gói.',
            'Quy trình SX: Giống cấp 1 → Giống cấp 2 → Lên men → Sấy khô → Phối trộn → Đóng gói.',
          ],
          [
            'Cơ chế & Tác dụng: Tinh thể protein làm tổn thương ruột giữa, sâu ngừng ăn và chết sau 2–4 ngày (trừ sâu róm thông, sâu tơ, sâu khoang).',
            'Cơ chế & Tác dụng: Gây rối loạn trao đổi chất, sâu chết mềm nhũn, treo ngược đầu xuống sau 2–5 ngày (trừ sâu xanh, sâu róm).',
            'Tác dụng: Nấm trừ sâu (Beauveria, Metarhizium) làm sâu chết cứng sau 2–7 ngày; Nấm trừ bệnh (Trichoderma) đối kháng bệnh lở cổ rễ, tuyến trùng.',
          ],
        ],
      },
    ],
  },
  {
    id: 'info-c6',
    chapterId: 'cn10-c6',
    chapterNumber: 'Chương VI',
    title: 'KĨ THUẬT TRỒNG TRỌT',
    lessonsRange: 'Bài 19 – Bài 22',
    pageLabel: 'Trang 9/11',
    theme: 'teal',
    objectives: [
      '4 bước quy trình trồng trọt & cơ giới hoá đồng bộ',
      'Công nghệ cao trong thu hoạch, bảo quản và chế biến nông sản',
      'Lập kế hoạch, tính chi phí dự án trồng hoa trong chậu',
    ],
    summaryBoxes: [
      {
        title: '1. Quy trình trồng trọt 4 bước & Cơ giới hoá (Bài 19)',
        items: [
          'B1 – Làm đất, bón lót: Cày, bừa, lên luống, đào hố, bón lót (máy cày, máy bừa, máy lên luống, máy đào hố).',
          'B2 – Gieo trồng: Gieo hạt trực tiếp hoặc trồng cây con (máy gieo hạt tự động, máy sạ, máy cấy).',
          'B3 – Chăm sóc, phòng trừ sâu bệnh: Tưới tiêu, bón thúc, tỉa cành (hệ thống tưới tự động, máy bón phân đĩa, drone phun thuốc).',
          'B4 – Thu hoạch: Thu đúng thời điểm, nhanh gọn (máy gặt đập liên hợp, máy thu hoạch củ/quả).',
        ],
      },
    ],
    sections: [
      {
        title: '2. Công nghệ cao trong thu hoạch và bảo quản sản phẩm (Bài 20)',
        variant: 'two-column-cards',
        headers: ['Thu hoạch công nghệ cao', 'Bảo quản công nghệ cao'],
        rows: [
          [
            'Máy thu hoạch chuyên dụng (máy gặt đập liên hợp, máy thu hoạch khoai tây, cà chua, thiết bị hái quả trên cao) tích hợp cảm biến nhận diện độ chín, tự phân loại và đóng gói.',
            'Bảo quản lạnh: Kho lạnh điều chỉnh nhiệt độ, độ ẩm thấp giúp ức chế hô hấp và hoạt động vi sinh vật. Môi trường khí điều biến (CA): Giảm O₂, tăng CO₂ làm chậm quá trình chín.',
          ],
          [
            'Hiệu quả: Giảm mạnh tổn thất sau thu hoạch, tiết kiệm nhân công và giữ nguyên chất lượng thương phẩm của nông sản.',
            'Chiếu xạ: Dùng tia gamma, tia X diệt vi sinh vật, ức chế nảy mầm (khoai tây, hành, tỏi, hoa quả xuất khẩu). Màng bao sinh học (chitosan, sáp ong): Ngăn thoát hơi nước và vi sinh vật xâm nhập.',
          ],
        ],
      },
      {
        title: '3. Chế biến sản phẩm (Bài 21) & Dự án trồng hoa trong chậu (Bài 22)',
        variant: 'two-column-cards',
        headers: ['Chế biến đơn giản / truyền thống', 'Ứng dụng công nghệ cao trong chế biến'],
        rows: [
          [
            'Sấy / Phơi khô: Giảm độ ẩm để bảo quản lâu (lúa, ngô, hoa quả sấy). Muối chua: Lên men lactic tạo môi trường acid ức chế vi khuẩn gây thối.',
            'Sấy thăng hoa (đông khô): Cấp đông sâu kết hợp tách ẩm trong môi trường chân không → giữ nguyên hình dạng, màu sắc, hương vị và dinh dưỡng.',
          ],
          [
            'Chế biến đường (mứt, siro): Áp suất thẩm thấu cao ức chế VSV. Đóng hộp: Thanh trùng/tiệt trùng kết hợp đóng gói kín.',
            'Sấy lạnh: Sấy ở nhiệt độ thấp 10–50°C bằng không khí khô. Chiên chân không: Nhiệt độ thấp trong chân không giúp giòn, ít hút dầu. Xử lí áp suất cao (HPP): Diệt khuẩn không dùng nhiệt, giữ tươi nước ép.',
          ],
        ],
        footerBox: {
          title: 'Dự án trồng hoa trong chậu (Bài 22)',
          content:
            '(1) Lập kế hoạch: chọn loại hoa, số lượng chậu, thời gian thực hiện, phân công nhiệm vụ • (2) Tính chi phí: Tổng chi phí = ∑ (Số lượng × Đơn giá) của chậu, giá thể/đất, giống, phân bón, thuốc BVTV, dụng cụ • (3) Thực hiện & đánh giá: trồng, chăm sóc, ghi chép nhật kí và tổng kết hiệu quả.',
        },
      },
    ],
  },
  {
    id: 'info-c7',
    chapterId: 'cn10-c7',
    chapterNumber: 'Chương VII',
    title: 'TRỒNG TRỌT CÔNG NGHỆ CAO',
    lessonsRange: 'Bài 23 – Bài 25',
    pageLabel: 'Trang 10/11',
    theme: 'indigo',
    objectives: [
      'Những vấn đề cơ bản & 4 đặc điểm trồng trọt công nghệ cao',
      'Mô hình nhà có mái che, tưới nhỏ giọt, trồng cây thông minh (IoT, AI)',
      'Cơ sở khoa học & thực hành trồng cây không dùng đất (giá thể, thuỷ canh, khí canh)',
    ],
    summaryBoxes: [
      {
        title: '1. Khái niệm & Vai trò (Bài 23)',
        items: [
          'Ứng dụng kết hợp các công nghệ mới (CNSH, tự động hoá, CNTT, vật liệu mới) tạo nông sản năng suất, chất lượng cao, an toàn, hiệu quả kinh tế.',
          'Giúp chủ động sản xuất, không phụ thuộc thời tiết và tiết kiệm tối đa tài nguyên nước, đất, phân bón.',
        ],
      },
      {
        title: '2. Bốn đặc điểm chính',
        items: [
          '(1) Giống mới năng suất cao, chống chịu tốt. (2) Quy trình sản xuất khép kín, cơ giới – tự động hoá đồng bộ.',
          '(3) Kiểm soát chặt chẽ môi trường (ánh sáng, nhiệt độ, độ ẩm, dinh dưỡng). (4) Tuân thủ nghiêm ngặt tiêu chuẩn an toàn (VietGAP, GlobalGAP, hữu cơ).',
        ],
      },
    ],
    sections: [
      {
        title: '3. Một số mô hình trồng trọt công nghệ cao (Bài 24)',
        variant: 'standard',
        headers: ['Mô hình / Công nghệ', 'Cấu tạo & Nguyên lí hoạt động', 'Ưu điểm nổi bật'],
        rows: [
          [
            'Nhà có mái che (Nhà kính, nhà lưới, nhà màng)',
            'Khung kim loại chắc chắn, mái/vách lợp kính, màng polymer hoặc lưới; tích hợp hệ thống điều chỉnh nhiệt độ, độ ẩm, ánh sáng, quạt thông gió.',
            'Cách li sâu bệnh và thời tiết bất lợi; chủ động trồng trái vụ, giảm thiểu sử dụng thuốc BVTV.',
          ],
          [
            'Hệ thống tưới nhỏ giọt',
            'Nguồn nước, máy bơm, bộ lọc, van điều áp, hệ thống ống dẫn và đầu nhỏ giọt đặt sát gốc (có thể kết hợp bộ châm phân tự động).',
            'Cấp nước và dinh dưỡng chính xác tới vùng rễ; tiết kiệm nước, phân bón, chống rửa trôi và xói mòn.',
          ],
          [
            'Trồng cây thông minh (IoT, AI)',
            'Cảm biến (nhiệt độ, độ ẩm, ánh sáng, EC, pH) → Bộ điều khiển trung tâm IoT → Thiết bị chấp hành tự động (bơm, đèn LED, rèm che).',
            'Giám sát, điều khiển tự động từ xa qua internet; tối ưu hoá sinh trưởng cây trồng, giảm nhân công.',
          ],
        ],
      },
      {
        title: '4. Công nghệ trồng cây không dùng đất (Bài 25)',
        variant: 'three-column-cards',
        headers: ['1. Trồng trên giá thể', '2. Hệ thống thuỷ canh', '3. Hệ thống khí canh'],
        rows: [
          [
            'Trồng trong chậu/túi chứa xơ dừa, trấu hun, perlite, hạt gốm kết hợp tưới nhỏ giọt dung dịch dinh dưỡng.',
            'Rễ cây ngập trực tiếp hoặc ngập một phần trong dung dịch dinh dưỡng (thuỷ canh tĩnh hoặc thuỷ canh hồi lưu).',
            'Rễ cây lơ lửng trong trụ/hộp kín, được phun sương dung dịch dinh dưỡng định kì theo chu trình.',
          ],
          [
            'Ưu điểm & Cây trồng: Giữ rễ đứng vững, cách li nguồn bệnh từ đất (phù hợp dưa lưới, cà chua, dâu tây).',
            'Ưu điểm & Cây trồng: Tiết kiệm nước, có thể trồng nhiều tầng tăng diện tích (phù hợp các loại rau ăn lá).',
            'Ưu điểm & Cây trồng: Rễ rất giàu O₂, tiết kiệm 90–95% nước (phù hợp rau ăn lá, sản xuất khoai tây giống).',
          ],
        ],
        footerBox: {
          title: 'Cơ sở khoa học & Quy trình thực hành thuỷ canh tĩnh',
          content:
            'Cơ sở khoa học: Cung cấp trực tiếp dung dịch dinh dưỡng khoáng thiết yếu (đúng pH, EC) và O₂ cho rễ mà không cần đất. Các bước thực hành: Chuẩn bị thùng nhựa tối màu, rọ nhựa, giá thể, máy sục khí, bút đo pH/EC, dung dịch dinh dưỡng, cây con → Pha dung dịch đúng nồng độ pH, EC → Đặt cây vào rọ sao cho đáy rễ chạm nhẹ mặt dung dịch (chừa khoảng không khí cho rễ hô hấp) → Theo dõi pH, EC định kì và thu hoạch.',
        },
      },
    ],
  },
  {
    id: 'info-c8',
    chapterId: 'cn10-c8',
    chapterNumber: 'Chương VIII',
    title: 'BẢO VỆ MÔI TRƯỜNG TRONG TRỒNG TRỌT',
    lessonsRange: 'Bài 26 – Bài 28',
    pageLabel: 'Trang 11/11',
    theme: 'emerald',
    objectives: [
      'Sự cần thiết phải bảo vệ môi trường trong trồng trọt',
      'Ứng dụng công nghệ vi sinh xử lí chất thải trồng trọt',
      'Quy trình 4 bước thực hành sử dụng rơm, rạ trồng nấm rơm',
    ],
    summaryBoxes: [
      {
        title: 'Sự cần thiết bảo vệ môi trường trong trồng trọt (Bài 26)',
        items: [
          'Nguyên nhân ô nhiễm: Lạm dụng phân bón hoá học và thuốc BVTV, vứt vỏ bao bì bừa bãi; đốt hoặc xả thải rơm rạ, phụ phẩm nông nghiệp; canh tác đất dốc không hợp lí gây xói mòn.',
          'Tác hại & Ý nghĩa: Gây suy thoái đất, ô nhiễm nước – không khí, giảm đa dạng sinh học và mất an toàn thực phẩm. Bảo vệ môi trường giúp duy trì độ phì đất, cân bằng sinh thái và phát triển trồng trọt bền vững.',
        ],
      },
    ],
    sections: [
      {
        title: '1. Ứng dụng công nghệ vi sinh xử lí chất thải trồng trọt (Bài 27)',
        variant: 'standard',
        headers: ['Hướng ứng dụng', 'Cách thức thực hiện', 'Hiệu quả mang lại'],
        rows: [
          [
            'Ủ phụ phẩm làm phân hữu cơ vi sinh',
            'Trộn rơm rạ, thân ngô, bã mía, vỏ cà phê với chế phẩm VSV phân giải cellulose (Trichoderma, xạ khuẩn...).',
            'Phân giải nhanh chất xơ, tiêu diệt mầm bệnh & hạt cỏ dại, tạo nguồn phân hữu cơ chất lượng bón lại cho cây.',
          ],
          [
            'Làm thức ăn chăn nuôi & trồng nấm',
            'Ủ chua rơm rạ, thân ngô bằng vi khuẩn lactic; dùng rơm rạ, mùn cưa làm giá thể trồng nấm ăn, nấm dược liệu.',
            'Tận dụng hiệu quả phụ phẩm, hạn chế đốt rơm rạ gây ô nhiễm không khí, nâng cao thu nhập cho nông hộ.',
          ],
          [
            'Cải tạo đất & thay thế hoá chất',
            'Sử dụng phân bón vi sinh và chế phẩm VSV phòng trừ sâu bệnh thay thế dần phân bón, thuốc BVTV hoá học.',
            'Phân giải tồn dư hoá chất độc hại, phục hồi hệ vi sinh vật đất có ích.',
          ],
        ],
      },
      {
        title: '2. Quy trình thực hành trồng nấm rơm từ rơm, rạ (Bài 28)',
        variant: 'four-step-grid',
        headers: [
          'Bước 1: Xử lí rơm, rạ',
          'Bước 2: Ủ đống rơm, rạ',
          'Bước 3: Đóng mô, cấy meo',
          'Bước 4: Chăm sóc, thu hái',
        ],
        rows: [
          [
            'Chọn rơm khô sạch, không mốc, không nhiễm thuốc BVTV. Ngâm nước vôi (3–4 kg vôi / 1.000 L nước) trong 15–30 phút. Vớt ra để ráo nước.',
            'Chất đống rộng 1,5 m, cao 1,5 m, phủ kín bạt. Sau 3–4 ngày (nhiệt độ đạt 60–70°C): đảo đống ủ, bổ sung nước nếu khô. Ủ tiếp 3–4 ngày cho rơm chín mềm, có mùi thơm.',
            'Rải lớp rơm dày 10–15 cm vào khuôn, nén nhẹ. Rắc meo giống cách mép khuôn 4–5 cm. Xếp 3–4 lớp như vậy rồi trùm kín bằng rơm khô hoặc bạt.',
            'Duy trì nhiệt độ 30–35°C, độ ẩm không khí 80–85%. Sau 10–12 ngày nấm bắt đầu mọc. Thu hái khi nấm còn hình trứng (chưa bung dù).',
          ],
        ],
      },
    ],
  },
];

interface Grade10InfographicOverviewProps {
  searchQuery?: string;
  currentUser?: AuthUser | null;
  canDownloadDocuments?: boolean;
  onRequireLogin?: (message?: string) => void;
  onRequireVipUpgrade?: () => void;
  onSelectChapter?: (chapterId: string) => void;
  onPracticeChapter?: (chapterId: string) => void;
  showDetailedToggle?: boolean;
  onToggleDetailedMode?: () => void;
}

const matchesSearch = (chapter: InfographicChapter, query: string): boolean => {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack: string[] = [
    chapter.chapterNumber,
    chapter.title,
    chapter.lessonsRange,
    chapter.pageLabel,
    ...chapter.objectives,
    ...chapter.summaryBoxes.flatMap((box) => [box.title, ...box.items]),
    ...chapter.sections.flatMap((sec) => [
      sec.title,
      ...(sec.headers || []),
      ...sec.rows.flat(),
      ...(sec.footerBox ? [sec.footerBox.title, sec.footerBox.content] : []),
    ]),
  ];

  return haystack.some((text) => text.toLowerCase().includes(q));
};

export const Grade10InfographicOverview: React.FC<Grade10InfographicOverviewProps> = ({
  searchQuery = '',
  currentUser,
  canDownloadDocuments = false,
  onRequireLogin,
  onRequireVipUpgrade,
  onSelectChapter,
  onPracticeChapter,
  showDetailedToggle = false,
  onToggleDetailedMode,
}) => {
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});

  const visibleChapters = useMemo(
    () => GRADE_10_INFOGRAPHIC_CHAPTERS.filter((ch) => matchesSearch(ch, searchQuery)),
    [searchQuery]
  );

  const allCollapsed =
    visibleChapters.length > 0 && visibleChapters.every((ch) => collapsedIds[ch.id]);

  const toggleChapterCollapse = (id: string) => {
    setCollapsedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllCollapse = () => {
    if (allCollapsed) {
      setCollapsedIds({});
    } else {
      const next: Record<string, boolean> = {};
      visibleChapters.forEach((ch) => {
        next[ch.id] = true;
      });
      setCollapsedIds(next);
    }
  };

  const handleDownloadPdf = () => {
    if (!currentUser) {
      onRequireLogin?.('Vui lòng đăng nhập tài khoản để tải tệp PDF Hệ thống hóa kiến thức Công nghệ 10!');
      return;
    }
    if (!canDownloadDocuments) {
      onRequireVipUpgrade?.();
      return;
    }
    const link = document.createElement('a');
    link.href = GRADE10_INFOGRAPHIC_PDF_URL;
    link.download = 'He_thong_hoa_kien_thuc_Cong_nghe_10.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    trackDocumentDownload({
      fileName: 'He_thong_hoa_kien_thuc_Cong_nghe_10.pdf',
      documentTitle: 'Infographic Hệ thống hóa kiến thức Công nghệ 10 (8 Chương)',
      category: 'on_tap_chuong',
      categoryLabel: 'Ôn Tập Chương Lớp 10 (Infographic PDF)',
      modeLabel: 'Bản PDF gốc 11 trang',
    });
  };

  const scrollToChapter = (id: string) => {
    setCollapsedIds((prev) => ({ ...prev, [id]: false }));
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs overflow-hidden">
        <div className="bg-emerald-900 text-white px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-800/90 border border-emerald-700 text-emerald-100 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Infographic Hệ Thống Hóa Kiến Thức · SGK Kết Nối Tri Thức
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                TỔNG HỢP KIẾN THỨC CÔNG NGHỆ 10 — CÔNG NGHỆ TRỒNG TRỌT
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-3xl leading-relaxed">
                Trọn bộ <strong>8 Chương (Bài 1 – Bài 28)</strong> trình bày trực quan theo 11 trang Infographic gốc: đầy đủ yêu cầu cần đạt, bảng so sánh, quy trình công nghệ và hướng dẫn thực hành.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowPdfPreview((prev) => !prev)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  showPdfPreview
                    ? 'bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300'
                    : 'bg-emerald-800 hover:bg-emerald-700 text-white border-emerald-600'
                }`}
              >
                {showPdfPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPdfPreview ? 'Ẩn bản PDF gốc' : 'Xem bản PDF gốc (11 trang)'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-950 border border-white inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title={
                  !currentUser || !canDownloadDocuments
                    ? 'Cần tài khoản có quyền tải tài liệu để tải file PDF gốc'
                    : 'Tải về bản PDF Infographic Hệ thống hóa kiến thức Công nghệ 10 (11 trang)'
                }
              >
                {!currentUser || !canDownloadDocuments ? (
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                )}
                <span>Tải PDF gốc</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Jump Bar + Controls */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
            <span className="text-slate-500 font-semibold shrink-0 mr-1 inline-flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              Mục lục nhanh:
            </span>
            {GRADE_10_INFOGRAPHIC_CHAPTERS.map((ch) => {
              const t = THEME_STYLES[ch.theme];
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => scrollToChapter(ch.id)}
                  className={`px-2.5 py-1 rounded-md font-semibold border transition-colors shrink-0 cursor-pointer ${t.badgeBg} hover:opacity-90`}
                >
                  {ch.chapterNumber}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleAllCollapse}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 inline-flex items-center gap-1 cursor-pointer"
            >
              {allCollapsed ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Mở rộng tất cả</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Thu gọn tất cả</span>
                </>
              )}
            </button>
            {showDetailedToggle && onToggleDetailedMode && (
              <button
                type="button"
                onClick={onToggleDetailedMode}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 inline-flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Xem dạng đề cương SGK</span>
              </button>
            )}
          </div>
        </div>

        {/* Inline PDF Viewer */}
        {showPdfPreview && (
          <div className="p-4 sm:p-5 bg-slate-100 border-t border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-slate-800 inline-flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                Bản PDF gốc: Infographic Hệ thống hóa kiến thức Công nghệ 10 (11 trang)
              </span>
              <span className="text-slate-500">
                Cuộn trực tiếp khung dưới để xem trọn bộ 11 trang màu gốc
              </span>
            </div>
            <div className="w-full h-[680px] rounded-xl overflow-hidden border border-slate-300 bg-white shadow-inner">
              <iframe
                src={GRADE10_INFOGRAPHIC_PDF_URL}
                title="Hệ thống hóa kiến thức Công nghệ 10 (PDF)"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}
      </div>

      {/* Empty Search Result */}
      {visibleChapters.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 space-y-2">
          <p className="text-sm font-semibold text-slate-700">
            Không tìm thấy nội dung nào trong Infographic 8 chương khớp với từ khóa &quot;{searchQuery}&quot;.
          </p>
        </div>
      ) : (
        /* 8 Infographic Chapter Cards */
        <div className="space-y-6">
          {visibleChapters.map((chapter) => {
            const theme = THEME_STYLES[chapter.theme];
            const isCollapsed = Boolean(collapsedIds[chapter.id]);

            return (
              <article
                key={chapter.id}
                id={chapter.id}
                className={`scroll-mt-24 bg-white rounded-2xl border ${theme.border} border-l-4 ${theme.accentBorder} shadow-xs overflow-hidden`}
              >
                {/* Chapter Infographic Header */}
                <div className={`${theme.headerBg} text-white px-5 py-4 sm:px-6`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                        <span className="px-2 py-0.5 rounded bg-white/15 text-white border border-white/25 uppercase tracking-wider">
                          {chapter.chapterNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-black/20 text-white/95">
                          {chapter.lessonsRange}
                        </span>
                        <span className="text-white/80 font-medium">{chapter.pageLabel}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                        {chapter.chapterNumber.toUpperCase()}: {chapter.title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {onSelectChapter && (
                        <button
                          type="button"
                          onClick={() => onSelectChapter(chapter.chapterId)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/30 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          title={`Mở chi tiết ${chapter.chapterNumber} gồm sơ đồ SGK, câu hỏi tự luận, tải Word & Mã QR`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Chi tiết & Câu hỏi SGK</span>
                        </button>
                      )}
                      {onPracticeChapter && (
                        <button
                          type="button"
                          onClick={() => onPracticeChapter(chapter.chapterId)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 border border-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <PenTool className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Luyện 5 đề</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleChapterCollapse(chapter.id)}
                        className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/25 cursor-pointer"
                        aria-label={isCollapsed ? 'Mở rộng chương' : 'Thu gọn chương'}
                      >
                        {isCollapsed ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="p-5 sm:p-6 space-y-5">
                    {/* Yêu cầu cần đạt */}
                    <div className={`rounded-xl border ${theme.softBorder} ${theme.softBg} p-3.5 sm:p-4`}>
                      <div className={`flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider ${theme.titleText} mb-2`}>
                        <Target className="w-4 h-4 shrink-0" />
                        <span>Yêu cầu cần đạt</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {chapter.objectives.map((obj, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200/90 text-xs font-medium text-slate-800 shadow-2xs"
                          >
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${theme.bulletColor}`} />
                            <span>{obj}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Top Summary Cards */}
                    {chapter.summaryBoxes.length > 0 && (
                      <div
                        className={`grid grid-cols-1 ${
                          chapter.summaryBoxes.length === 1
                            ? 'md:grid-cols-1'
                            : chapter.summaryBoxes.length === 2
                            ? 'md:grid-cols-2'
                            : 'lg:grid-cols-3'
                        } gap-3.5`}
                      >
                        {chapter.summaryBoxes.map((box, bIdx) => (
                          <div
                            key={bIdx}
                            className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2"
                          >
                            <h4 className={`text-xs sm:text-sm font-extrabold ${theme.titleText}`}>
                              {box.title}
                            </h4>
                            <ul className="space-y-1.5 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                              {box.items.map((item, iIdx) => (
                                <li key={iIdx} className="flex items-start gap-2">
                                  <span className={`font-extrabold mt-0.5 ${theme.bulletColor}`}>•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Structured Tables & Comparison Cards */}
                    <div className="space-y-5">
                      {chapter.sections.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-2.5">
                          <h4 className={`text-xs sm:text-sm font-extrabold uppercase tracking-wide ${theme.titleText}`}>
                            {section.title}
                          </h4>

                          {section.variant === 'four-step-grid' && section.headers ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              {section.headers.map((stepTitle, stepIdx) => (
                                <div
                                  key={stepIdx}
                                  className={`rounded-xl border ${theme.softBorder} ${theme.softBg} p-3.5 space-y-2 flex flex-col`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`w-6 h-6 rounded-md ${theme.stepBadge} text-xs font-extrabold flex items-center justify-center shrink-0`}
                                    >
                                      {stepIdx + 1}
                                    </span>
                                    <h5 className={`text-xs font-extrabold ${theme.titleText} leading-snug`}>
                                      {stepTitle.replace(/^Bước \d+:\s*/i, '')}
                                    </h5>
                                  </div>
                                  <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed flex-1">
                                    {section.rows[0]?.[stepIdx]}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : section.variant === 'three-column-cards' && section.headers ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                              {section.headers.map((colTitle, colIdx) => (
                                <div
                                  key={colIdx}
                                  className="rounded-xl border border-slate-200 overflow-hidden bg-white flex flex-col"
                                >
                                  <div className={`${theme.tableHeaderBg} px-3.5 py-2 text-xs font-extrabold`}>
                                    {colTitle}
                                  </div>
                                  <div className="p-3.5 space-y-2.5 text-xs sm:text-[13px] text-slate-700 leading-relaxed flex-1">
                                    {section.rows.map((row, rIdx) => (
                                      <p key={rIdx}>{row[colIdx]}</p>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : section.variant === 'two-column-cards' && section.headers ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                              {section.headers.map((colTitle, colIdx) => (
                                <div
                                  key={colIdx}
                                  className="rounded-xl border border-slate-200 overflow-hidden bg-white flex flex-col"
                                >
                                  <div className={`${theme.tableHeaderBg} px-4 py-2.5 text-xs font-extrabold`}>
                                    {colTitle}
                                  </div>
                                  <ul className="p-4 space-y-2.5 text-xs sm:text-[13px] text-slate-700 leading-relaxed flex-1 divide-y divide-slate-100">
                                    {section.rows.map((row, rIdx) => (
                                      <li key={rIdx} className={rIdx > 0 ? 'pt-2.5 flex items-start gap-2' : 'flex items-start gap-2'}>
                                        <span className={`font-extrabold mt-0.5 shrink-0 ${theme.bulletColor}`}>▸</span>
                                        <span>{row[colIdx]}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          ) : (
                            /* Standard Responsive Comparison Table */
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                              <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
                                {section.headers && (
                                  <thead>
                                    <tr className={theme.tableHeaderBg}>
                                      {section.headers.map((head, hIdx) => (
                                        <th
                                          key={hIdx}
                                          className={`px-3.5 py-2.5 font-extrabold border-r border-white/15 last:border-r-0 ${
                                            hIdx === 0 ? 'w-[22%] min-w-[150px]' : ''
                                          }`}
                                        >
                                          {head}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                )}
                                <tbody className="divide-y divide-slate-200 bg-white">
                                  {section.rows.map((row, rIdx) => (
                                    <tr
                                      key={rIdx}
                                      className={rIdx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}
                                    >
                                      {row.map((cell, cIdx) => (
                                        <td
                                          key={cIdx}
                                          className={`px-3.5 py-2.5 align-top leading-relaxed border-r border-slate-100 last:border-r-0 ${
                                            cIdx === 0
                                              ? `font-bold ${theme.titleText}`
                                              : 'text-slate-700'
                                          }`}
                                        >
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Optional Footer Box (e.g., Dự án trồng hoa Bài 22 / Thuỷ canh tĩnh Bài 25) */}
                          {section.footerBox && (
                            <div
                              className={`rounded-xl border ${theme.softBorder} ${theme.softBg} p-3.5 sm:p-4 text-xs sm:text-[13px] text-slate-800 leading-relaxed`}
                            >
                              <span className={`font-extrabold ${theme.titleText}`}>
                                {section.footerBox.title}:{' '}
                              </span>
                              <span>{section.footerBox.content}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
