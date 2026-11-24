import { CHAPTER_QUESTIONS_10 } from './chapterQuestions10';
import { CHAPTER_QUESTIONS_11 } from './chapterQuestions11';
import { EXTRA_MCQ_10_FOR_30, CHAPTER_TF_10 } from './chapterTF10';
import { EXTRA_MCQ_11_FOR_30, CHAPTER_TF_11 } from './chapterTF11';
import { VANDUNG_MCQ_10, VANDUNG_MCQ_11 } from './chapterVandung10_11';
import {
  CHAPTER_MCQ_12_FORESTRY,
  CHAPTER_TF_12_FORESTRY,
} from './chapterQuestions12Forestry';
import {
  CHAPTER_MCQ_12_AQUA1,
  CHAPTER_TF_12_AQUA1,
} from './chapterQuestions12Aqua1';
import {
  CHAPTER_MCQ_12_AQUA2,
  CHAPTER_TF_12_AQUA2,
} from './chapterQuestions12Aqua2';
import {
  normalizeChapterMCQItem,
  normalizeChapterQuestionItem,
  normalizeChapterTFQuestion,
} from '../utils/equalLengthNormalizer';
import { TrueFalseQuestion } from '../types/exam';

export type CognitiveLevel = 'biet' | 'hieu' | 'vandung';

export interface MindmapBranch {
  branchNumber: number;
  title: string;
  subItems: string[];
}

export interface ChapterQuestionItem {
  number: number;
  question: string;
  answer: string[];
}

export interface ChapterMCQItem {
  number: number;
  level: CognitiveLevel;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0 = A, 1 = B, 2 = C, 3 = D
  explanation: string;
}

export interface ChapterTFStatement {
  label: 'a' | 'b' | 'c' | 'd';
  level: CognitiveLevel;
  text: string;
  isTrue: boolean;
  explanation: string;
}

export interface ChapterTFQuestion {
  number: number;
  context: string;
  citation?: string;
  chartData?: TrueFalseQuestion['chartData'];
  tableData?: TrueFalseQuestion['tableData'];
  statements: [
    ChapterTFStatement,
    ChapterTFStatement,
    ChapterTFStatement,
    ChapterTFStatement
  ];
}

export interface TheoryDocBulletItem {
  lead?: string;
  text: string;
  subBullets?: { lead?: string; text: string }[];
}

export interface TheoryDocTable {
  headers: string[];
  rows: string[][];
}

export interface TheoryDocSection {
  heading: string;
  bullets?: TheoryDocBulletItem[];
  table?: TheoryDocTable;
}

export interface TheoryDocLesson {
  lessonTitle: string;
  sections: TheoryDocSection[];
}

export interface ChapterTheoryDocument {
  title: string;
  subtitle: string;
  objectiveTitle: string;
  objectiveText: string;
  pdfUrl?: string;
  lessons: TheoryDocLesson[];
  coreNotesTitle: string;
  coreNotes: string[];
}

export interface ChapterReviewItem {
  id: string;
  grade: '10' | '11' | '12';
  bookTitle: string;
  domain: 'crop' | 'husbandry' | 'forestry' | 'aquaculture';
  chapterNumber: string;
  chapterTitle: string;
  pageRef: string;
  lessons: string[];
  theoryDocument?: ChapterTheoryDocument;
  mindmapNodes: MindmapBranch[];
  coreSummary: string[];
  questions: ChapterQuestionItem[];
  mcqQuestions: ChapterMCQItem[];
  tfQuestions?: ChapterTFQuestion[];
}

export interface GlossaryItem {
  grade: '10' | '11' | '12';
  term: string;
  definition: string;
  pages: string;
}

const RAW_CHAPTER_REVIEW_DATA: Omit<
  ChapterReviewItem,
  'mcqQuestions' | 'tfQuestions'
>[] = [
  // ============================================================================
  // SÁCH 1: CÔNG NGHỆ 10 - CÔNG NGHỆ TRỒNG TRỌT (8 CHƯƠNG)
  // ============================================================================
  {
    id: 'cn10-c1',
    grade: '10',
    bookTitle: 'Công nghệ 10 – Công nghệ Trồng trọt',
    domain: 'crop',
    chapterNumber: 'Chương I',
    chapterTitle: 'Giới thiệu chung về trồng trọt',
    pageRef: 'Tài liệu tóm tắt lý thuyết trọng tâm – SGK Công nghệ 10 (Kết nối tri thức)',
    lessons: [
      'Bài 1: Giới thiệu về trồng trọt',
      'Bài 2: Cây trồng và các yếu tố chính trong trồng trọt',
    ],
    theoryDocument: {
      title: 'CHƯƠNG I: GIỚI THIỆU CHUNG VỀ TRỒNG TRỌT',
      subtitle: 'Tài liệu tóm tắt lý thuyết trọng tâm – SGK Công nghệ 10 (Kết nối tri thức)',
      objectiveTitle: 'Mục tiêu trọng tâm Chương I',
      objectiveText:
        'Nắm vững vai trò, triển vọng và xu hướng phát triển của ngành trồng trọt trong thời kỳ Cách mạng công nghiệp 4.0; hiểu rõ các tiêu chí phân loại cây trồng và phân tích sâu sắc tác động của 7 yếu tố sinh thái - kỹ thuật chính đến sinh trưởng, phát triển và năng suất cây trồng.',
      pdfUrl: '/assets/aistudio/Chuong_1_Gioi_thieu_chung_ve_trong_trot_99fcbfe1.pdf',
      lessons: [
        {
          lessonTitle: 'Bài 1: Giới thiệu về trồng trọt',
          sections: [
            {
              heading: '1. Vai trò của trồng trọt trong nền kinh tế và đời sống',
              bullets: [
                {
                  lead: 'Đảm bảo an ninh lương thực quốc gia:',
                  text: 'Trồng trọt là ngành sản xuất duy nhất trực tiếp tạo ra nguồn lương thực (lúa gạo, ngô, khoai, sắn,...), đóng vai trò nền tảng quyết định sự tồn tại, ổn định xã hội và phát triển kinh tế bền vững của đất nước.',
                },
                {
                  lead: 'Thúc đẩy chăn nuôi và công nghiệp chế biến:',
                  text: 'Cung cấp phần lớn nguồn thức ăn thô tinh cho ngành chăn nuôi gia súc, gia cầm; đồng thời cung cấp nguyên liệu đầu vào thiết yếu cho các ngành công nghiệp chế biến thực phẩm, dệt may, dược liệu và sản phẩm tiêu dùng.',
                },
                {
                  lead: 'Đóng góp quan trọng vào kim ngạch xuất khẩu:',
                  text: 'Nông sản Việt Nam có vị thế cao trên thị trường quốc tế với các mặt hàng chủ lực như gạo, cà phê, hạt điều, hạt tiêu, chè và trái cây nhiệt đới, mang lại nguồn ngoại tệ lớn hàng chục tỷ USD mỗi năm.',
                },
                {
                  lead: 'Giải quyết việc làm và kiến tạo cảnh quan:',
                  text: 'Thu hút lực lượng lao động xã hội lớn (chiếm tỷ trọng cao trong cơ cấu lao động cả nước); tạo mảng xanh sinh thái, bảo vệ môi trường, cung cấp cảnh quan xanh - sạch - đẹp phục vụ đời sống và du lịch sinh thái.',
                },
              ],
            },
            {
              heading: '2. Triển vọng phát triển của ngành trồng trọt',
              bullets: [
                {
                  lead: 'Phát triển trồng trọt công nghệ cao:',
                  text: 'Ứng dụng công nghệ nhà kính, nhà lưới, hệ thống tưới nước tiết kiệm tự động, công nghệ sinh học và thủy canh - khí canh. Giúp tối ưu hóa chi phí, tăng năng suất vượt trội, nâng cao phẩm chất nông sản, giảm phụ thuộc thời tiết và xóa bỏ tính mùa vụ.',
                },
                {
                  lead: 'Hướng tới nền nông nghiệp thông minh 4.0:',
                  text: 'Tích hợp toàn diện Internet vạn vật (IoT), trí tuệ nhân tạo (AI), cảm biến môi trường thông minh, robot và máy bay không người lái (drone) vào quản lý giám sát đồng ruộng, tự động hóa toàn bộ chuỗi giá trị từ sản xuất, thu hoạch đến tiêu thụ.',
                },
              ],
            },
            {
              heading: '3. Thành tựu nổi bật của trồng trọt công nghệ cao',
              table: {
                headers: [
                  'Khu vực',
                  'Mô hình / Điểm sáng',
                  'Công nghệ ứng dụng nổi bật',
                  'Hiệu quả mang lại',
                ],
                rows: [
                  [
                    'Nhật Bản',
                    'Khu nông nghiệp Miyagi',
                    'Cải tạo nhà máy cũ thành trang trại thẳng đứng 15 tầng (2.500 m2), 17.500 bóng đèn LED',
                    'Thu hoạch hơn 10.000 cây xà lách mỗi ngày, không phụ thuộc thời tiết bên ngoài.',
                  ],
                  [
                    'Hà Lan',
                    'Vườn hoa Keukenhof & nông nghiệp nhà kính',
                    'Công nghệ nhà kính thông minh khép kín, tự động hóa vi khí hậu và chọn tạo giống hoa hiện đại',
                    'Xuất khẩu nông sản đứng thứ 2 thế giới; vườn hoa 32 ha thu hút hàng triệu lượt khách du lịch.',
                  ],
                  [
                    'Hoa Kỳ',
                    'Trang trại táo California',
                    'Ứng dụng máy bay không người lái viễn thám, máy thu hoạch tự động, cảm biến sức khỏe cây trồng',
                    'Chỉ chiếm chưa đến 0,7% dân số làm nông nghiệp nhưng đứng đầu thế giới về sản lượng xuất khẩu lương thực.',
                  ],
                  [
                    'Dubai (UAE)',
                    'Khu vườn kỳ diệu (Miracle Garden)',
                    'Hệ thống tưới nhỏ giọt ngầm tiết kiệm, tái sử dụng nước thải sinh hoạt đã xử lý',
                    'Khu vườn 72.000 m2 trên sa mạc khô cằn với 60 triệu bông hoa khoe sắc.',
                  ],
                  [
                    'Việt Nam',
                    'Lâm Đồng, Hà Nội, TP.HCM',
                    'Trồng lan hồ điệp, dưa lưới trong nhà kính Israel, tưới nhỏ giọt và thủy canh hồi lưu',
                    'Doanh thu đạt từ 8 - 9 tỷ đồng/ha/năm với rau thủy canh; 1,2 tỷ đồng/ha/năm với hoa cao cấp.',
                  ],
                ],
              },
            },
            {
              heading: '4. Yêu cầu cơ bản đối với người lao động trong ngành trồng trọt',
              bullets: [
                {
                  lead: 'Sức khỏe và phẩm chất:',
                  text: 'Sức khỏe tốt, tính chịu khó, kiên trì, tỉ mỉ và có tinh thần trách nhiệm cao đối với sản phẩm nông nghiệp an toàn.',
                },
                {
                  lead: 'Kiến thức và kỹ năng:',
                  text: 'Nắm vững quy trình sinh học của cây trồng; sử dụng thành thạo máy móc, thiết bị cơ giới hóa và điều khiển được các phần mềm nông nghiệp thông minh.',
                },
                {
                  lead: 'Ý thức trách nhiệm:',
                  text: 'Tuân thủ nghiêm ngặt quy định an toàn lao động, vệ sinh an toàn thực phẩm và bảo vệ môi trường sinh thái bền vững.',
                },
              ],
            },
          ],
        },
        {
          lessonTitle: 'Bài 2: Cây trồng và các yếu tố chính trong trồng trọt',
          sections: [
            {
              heading: '1. Phân loại cây trồng phổ biến',
              bullets: [
                {
                  lead: 'Phân loại theo nguồn gốc khí hậu:',
                  text: '',
                  subBullets: [
                    {
                      lead: 'Cây trồng ôn đới:',
                      text: 'Nguồn gốc từ vùng ôn đới, thích nghi khí hậu mát lạnh, mùa đông lạnh (dâu tây, mận, lê, táo, cải bắp,... trồng ở Sa Pa, Đà Lạt, vùng núi cao phía Bắc).',
                    },
                    {
                      lead: 'Cây trồng nhiệt đới:',
                      text: 'Thích nghi khí hậu nóng ẩm quanh năm, không chịu được sương muối hay băng giá (lúa nước, chuối, xoài, vải, nhãn, mít, mía,...).',
                    },
                    {
                      lead: 'Cây trồng á nhiệt đới:',
                      text: 'Cần giai đoạn nhiệt độ thấp nhất định để phân hóa mầm hoa và kết quả (bơ, chanh leo, cherry, cam,...).',
                    },
                  ],
                },
                {
                  lead: 'Phân loại theo đặc tính sinh vật học:',
                  text: 'Cây hằng năm (lúa, ngô, lạc) và cây lâu năm (cà phê, cao su, cam); cây thân thảo (rau muống, lúa) và cây thân gỗ (xoài, nhãn); cây một lá mầm (họ Hòa thảo) và cây hai lá mầm (họ Đậu).',
                },
                {
                  lead: 'Phân loại theo mục đích sử dụng:',
                  text: 'Cây lương thực; Cây ăn quả; Cây rau; Cây hoa cảnh; Cây lấy gỗ; Cây dược liệu; Cây công nghiệp hàng năm và lâu năm.',
                },
              ],
            },
            {
              heading: '2. Các yếu tố chính tác động đến cây trồng',
              table: {
                headers: [
                  'Yếu tố',
                  'Vai trò sinh lý đối với cây trồng',
                  'Tác động khi bất lợi & Biện pháp kỹ thuật',
                ],
                rows: [
                  [
                    '1. Giống cây trồng',
                    'Quyết định trực tiếp tiềm năng năng suất, phẩm chất nông sản, khả năng chống chịu sâu bệnh và điều kiện ngoại cảnh bất lợi.',
                    'Giống thoái hóa làm giảm năng suất; giải pháp là sử dụng giống xác nhận, giống lai F1, giống chuyển gene kháng sâu.',
                  ],
                  [
                    '2. Ánh sáng',
                    'Nguồn năng lượng duy nhất cho quá trình quang hợp tạo chất hữu cơ; quang chu kỳ chi phối sự phân hóa mầm hoa.',
                    'Thiếu sáng làm cây vống cao, lá vàng, rụng hoa; giải pháp là tỉa cành, trồng mật độ hợp lý, chiếu đèn bổ sung.',
                  ],
                  [
                    '3. Nhiệt độ',
                    'Chi phối mọi phản ứng sinh hóa, hô hấp, quang hợp, thoát hơi nước. Khoảng nhiệt độ thích hợp của cây trồng từ 15°C – 40°C.',
                    'Quá cao gây cháy lá, hạt phấn bất thụ; quá thấp gây đình trệ sinh trưởng. Biện pháp: che phủ màng phủ, sưởi ấm hoặc tưới hạ nhiệt.',
                  ],
                  [
                    '4. Nước và độ ẩm',
                    'Thành phần cấu tạo tế bào, dung môi hòa tan chất khoáng, điều hòa thân nhiệt qua thoát hơi nước.',
                    'Hạn hán làm cây héo chết; ngập úng làm thối rễ do thiếu oxy. Biện pháp: tưới tiêu chủ động, tưới nhỏ giọt, thoát nước kịp thời.',
                  ],
                  [
                    '5. Đất trồng',
                    'Môi trường cơ giới giữ rễ cho cây đứng vững, cung cấp chất khoáng, oxy và nước.',
                    'Đất chai cứng, chua, mặn làm hạn chế hút dinh dưỡng. Biện pháp: bón vôi khử chua, bón phân hữu cơ, cày bừa tơi xốp.',
                  ],
                  [
                    '6. Dinh dưỡng',
                    'Cung cấp các nguyên tố đa lượng (N, P, K), trung lượng (Ca, Mg, S) và vi lượng (Fe, Zn, Cu,...) cho cấu trúc tế bào và enzyme.',
                    'Thiếu dinh dưỡng làm còi cọc, vàng lá; thừa dinh dưỡng làm lốp đổ, nhiễm độc. Biện pháp: bón phân cân đối, đúng tỷ lệ.',
                  ],
                  [
                    '7. Kỹ thuật canh tác',
                    'Chuỗi tác động của con người: làm đất, thời vụ, mật độ gieo trồng, luân canh xen canh, chăm sóc và phòng trừ sâu bệnh.',
                    'Canh tác sai quy trình làm lây lan sâu bệnh, thoái hóa đất. Biện pháp: tuân thủ lịch thời vụ, luân canh cây họ Đậu, áp dụng IPM.',
                  ],
                ],
              },
            },
          ],
        },
      ],
      coreNotesTitle: 'Ghi nhớ cốt lõi Chương I',
      coreNotes: [
        'Trồng trọt là bệ đỡ kinh tế xã hội, đang chuyển mạnh từ nông nghiệp truyền thống sang nông nghiệp công nghệ cao và nông nghiệp thông minh 4.0.',
        'Năng suất và chất lượng cây trồng là kết quả tương tác chặt chẽ giữa kiểu gene (Giống) và các điều kiện ngoại cảnh (Ánh sáng, Nhiệt độ, Nước, Đất, Dinh dưỡng kết hợp Kỹ thuật canh tác).',
      ],
    },
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Vai trò và triển vọng phát triển của ngành trồng trọt',
        subItems: [
          'Đảm bảo an ninh lương thực quốc gia: Ngành sản xuất duy nhất trực tiếp tạo ra nguồn lương thực (lúa gạo, ngô, khoai, sắn,...), nền tảng ổn định xã hội và phát triển kinh tế bền vững.',
          'Thúc đẩy chăn nuôi và công nghiệp chế biến: Cung cấp thức ăn thô tinh cho gia súc, gia cầm và nguyên liệu đầu vào cho chế biến thực phẩm, dệt may, dược liệu.',
          'Đóng góp kim ngạch xuất khẩu & giải quyết việc làm, kiến tạo cảnh quan: Xuất khẩu gạo, cà phê, hạt điều, hạt tiêu, chè, trái cây nhiệt đới hàng chục tỷ USD/năm; thu hút lao động lớn, tạo mảng xanh và du lịch sinh thái.',
          'Triển vọng: Phát triển trồng trọt công nghệ cao (nhà kính, nhà lưới, tưới tiết kiệm tự động, công nghệ sinh học, thủy canh - khí canh) và hướng tới nông nghiệp thông minh 4.0 (IoT, AI, cảm biến, robot, drone).',
        ],
      },
      {
        branchNumber: 2,
        title: 'Thành tựu công nghệ cao & Yêu cầu người lao động',
        subItems: [
          'Nhật Bản (Khu nông nghiệp Miyagi): Trang trại thẳng đứng 15 tầng (2.500 m2), 17.500 bóng đèn LED -> thu hoạch hơn 10.000 cây xà lách/ngày.',
          'Hà Lan (Vườn hoa Keukenhof & nhà kính): Nhà kính thông minh khép kín, tự động hóa vi khí hậu -> xuất khẩu nông sản thứ 2 thế giới, vườn hoa 32 ha.',
          'Hoa Kỳ (Trang trại táo California) & Dubai (Miracle Garden 72.000 m2, 60 triệu bông hoa nhờ tưới nhỏ giọt ngầm, tái sử dụng nước thải).',
          'Việt Nam (Lâm Đồng, Hà Nội, TP.HCM): Lan hồ điệp, dưa lưới nhà kính Israel, thủy canh hồi lưu (doanh thu 8 - 9 tỷ đồng/ha/năm với rau thủy canh; 1,2 tỷ đồng/ha/năm với hoa cao cấp).',
          'Yêu cầu người lao động: Sức khỏe và phẩm chất (chịu khó, kiên trì, tỉ mỉ, trách nhiệm); Kiến thức và kỹ năng (quy trình sinh học, máy móc cơ giới hóa, phần mềm thông minh); Ý thức trách nhiệm (an toàn lao động, ATTP, bảo vệ môi trường).',
        ],
      },
      {
        branchNumber: 3,
        title: 'Phân loại cây trồng & 7 yếu tố chính tác động đến cây trồng',
        subItems: [
          'Phân loại cây trồng: Theo nguồn gốc khí hậu (Ôn đới: dâu tây, mận, lê, táo, cải bắp; Nhiệt đới: lúa nước, chuối, xoài, vải, nhãn, mít, mía; Á nhiệt đới: bơ, chanh leo, cherry, cam); Theo đặc tính sinh vật học (hằng năm/lâu năm, thân thảo/thân gỗ, một lá mầm/hai lá mầm); Theo mục đích sử dụng (lương thực, ăn quả, rau, hoa cảnh, lấy gỗ, dược liệu, công nghiệp).',
          '1. Giống cây trồng (quyết định tiềm năng năng suất, phẩm chất, chống chịu) & 2. Ánh sáng (năng lượng quang hợp, quang chu kỳ phân hóa mầm hoa).',
          '3. Nhiệt độ (thích hợp từ 15°C – 40°C) & 4. Nước và độ ẩm (cấu tạo tế bào, hòa tan khoáng, điều hòa thân nhiệt).',
          '5. Đất trồng (giữ rễ đứng vững, cung cấp khoáng, oxy, nước) & 6. Dinh dưỡng (đa lượng N, P, K; trung lượng Ca, Mg, S; vi lượng Fe, Zn, Cu,...).',
          '7. Kỹ thuật canh tác (làm đất, thời vụ, mật độ, luân canh xen canh, chăm sóc, áp dụng IPM).',
        ],
      },
    ],
    coreSummary: [
      'Mục tiêu trọng tâm Chương I: Nắm vững vai trò, triển vọng và xu hướng phát triển của ngành trồng trọt trong thời kỳ Cách mạng công nghiệp 4.0; hiểu rõ các tiêu chí phân loại cây trồng và phân tích sâu sắc tác động của 7 yếu tố sinh thái - kỹ thuật chính đến sinh trưởng, phát triển và năng suất cây trồng.',
      'Ghi nhớ cốt lõi 1: Trồng trọt là bệ đỡ kinh tế xã hội, đang chuyển mạnh từ nông nghiệp truyền thống sang nông nghiệp công nghệ cao và nông nghiệp thông minh 4.0.',
      'Ghi nhớ cốt lõi 2: Năng suất và chất lượng cây trồng là kết quả tương tác chặt chẽ giữa kiểu gene (Giống) và các điều kiện ngoại cảnh (Ánh sáng, Nhiệt độ, Nước, Đất, Dinh dưỡng kết hợp Kỹ thuật canh tác).',
    ],
    questions: [
      {
        number: 1,
        question: 'Trình bày vai trò và triển vọng phát triển của ngành trồng trọt trong nền kinh tế và đời sống.',
        answer: [
          'Vai trò của trồng trọt: (1) Đảm bảo an ninh lương thực quốc gia (lúa gạo, ngô, khoai, sắn,...); (2) Thúc đẩy chăn nuôi (cung cấp thức ăn thô tinh) và công nghiệp chế biến (thực phẩm, dệt may, dược liệu); (3) Đóng góp quan trọng vào kim ngạch xuất khẩu (gạo, cà phê, hạt điều, hạt tiêu, chè, trái cây nhiệt đới mang lại hàng chục tỷ USD/năm); (4) Giải quyết việc làm và kiến tạo cảnh quan xanh - sạch - đẹp, du lịch sinh thái.',
          'Triển vọng phát triển: (1) Phát triển trồng trọt công nghệ cao (nhà kính, nhà lưới, tưới tiết kiệm tự động, công nghệ sinh học, thủy canh - khí canh giúp tối ưu chi phí, tăng năng suất, xóa bỏ tính mùa vụ); (2) Hướng tới nền nông nghiệp thông minh 4.0 (tích hợp IoT, AI, cảm biến môi trường, robot, drone tự động hóa toàn bộ chuỗi giá trị).',
        ],
      },
      {
        number: 2,
        question: 'Nêu các thành tựu nổi bật của trồng trọt công nghệ cao trên thế giới và ở Việt Nam.',
        answer: [
          'Nhật Bản (Khu nông nghiệp Miyagi): Cải tạo nhà máy cũ thành trang trại thẳng đứng 15 tầng (2.500 m2) với 17.500 bóng đèn LED, thu hoạch hơn 10.000 cây xà lách mỗi ngày, không phụ thuộc thời tiết.',
          'Hà Lan (Vườn hoa Keukenhof & nông nghiệp nhà kính): Nhà kính thông minh khép kín, tự động hóa vi khí hậu; xuất khẩu nông sản đứng thứ 2 thế giới, vườn hoa 32 ha thu hút hàng triệu khách du lịch.',
          'Hoa Kỳ (Trang trại táo California): Ứng dụng drone viễn thám, máy thu hoạch tự động, cảm biến sức khỏe cây trồng (<0,7% dân số làm nông nghiệp nhưng đứng đầu thế giới về xuất khẩu lương thực).',
          'Dubai - UAE (Miracle Garden): Hệ thống tưới nhỏ giọt ngầm tiết kiệm, tái sử dụng nước thải đã xử lý cho khu vườn 72.000 m2 trên sa mạc với 60 triệu bông hoa.',
          'Việt Nam (Lâm Đồng, Hà Nội, TP.HCM): Trồng lan hồ điệp, dưa lưới trong nhà kính Israel, tưới nhỏ giọt và thủy canh hồi lưu; doanh thu đạt 8 - 9 tỷ đồng/ha/năm với rau thủy canh và 1,2 tỷ đồng/ha/năm với hoa cao cấp.',
        ],
      },
      {
        number: 3,
        question: 'Trình bày yêu cầu cơ bản đối với người lao động trong ngành trồng trọt.',
        answer: [
          'Sức khỏe và phẩm chất: Sức khỏe tốt, tính chịu khó, kiên trì, tỉ mỉ và có tinh thần trách nhiệm cao đối với sản phẩm nông nghiệp an toàn.',
          'Kiến thức và kỹ năng: Nắm vững quy trình sinh học của cây trồng; sử dụng thành thạo máy móc, thiết bị cơ giới hóa và điều khiển được các phần mềm nông nghiệp thông minh.',
          'Ý thức trách nhiệm: Tuân thủ nghiêm ngặt quy định an toàn lao động, vệ sinh an toàn thực phẩm và bảo vệ môi trường sinh thái bền vững.',
        ],
      },
      {
        number: 4,
        question: 'Phân loại các nhóm cây trồng phổ biến theo nguồn gốc khí hậu, đặc tính sinh vật học và mục đích sử dụng.',
        answer: [
          'Theo nguồn gốc khí hậu: (1) Cây trồng ôn đới (thích nghi khí hậu mát lạnh, mùa đông lạnh: dâu tây, mận, lê, táo, cải bắp,... ở Sa Pa, Đà Lạt, vùng núi cao phía Bắc); (2) Cây trồng nhiệt đới (thích nghi nóng ẩm quanh năm, không chịu được sương muối, băng giá: lúa nước, chuối, xoài, vải, nhãn, mít, mía,...); (3) Cây trồng á nhiệt đới (cần giai đoạn nhiệt độ thấp để phân hóa mầm hoa và kết quả: bơ, chanh leo, cherry, cam,...).',
          'Theo đặc tính sinh vật học: Cây hằng năm (lúa, ngô, lạc) và cây lâu năm (cà phê, cao su, cam); cây thân thảo (rau muống, lúa) và cây thân gỗ (xoài, nhãn); cây một lá mầm (họ Hòa thảo) và cây hai lá mầm (họ Đậu).',
          'Theo mục đích sử dụng: Cây lương thực; Cây ăn quả; Cây rau; Cây hoa cảnh; Cây lấy gỗ; Cây dược liệu; Cây công nghiệp hàng năm và lâu năm.',
        ],
      },
      {
        number: 5,
        question: 'Phân tích vai trò sinh lý, tác động khi bất lợi và biện pháp kỹ thuật của 7 yếu tố chính tác động đến cây trồng.',
        answer: [
          '1. Giống cây trồng: Quyết định tiềm năng năng suất, phẩm chất, chống chịu sâu bệnh. Giống thoái hóa làm giảm năng suất -> dùng giống xác nhận, giống lai F1, giống chuyển gene kháng sâu.',
          '2. Ánh sáng: Nguồn năng lượng duy nhất cho quang hợp, quang chu kỳ chi phối phân hóa mầm hoa. Thiếu sáng cây vống cao, lá vàng, rụng hoa -> tỉa cành, trồng mật độ hợp lý, chiếu đèn bổ sung.',
          '3. Nhiệt độ: Chi phối phản ứng sinh hóa, hô hấp, quang hợp, thoát hơi nước (thích hợp 15°C – 40°C). Quá cao gây cháy lá, hạt phấn bất thụ; quá thấp đình trệ sinh trưởng -> che màng phủ, sưởi ấm hoặc tưới hạ nhiệt.',
          '4. Nước và độ ẩm: Cấu tạo tế bào, dung môi hòa tan khoáng, điều hòa thân nhiệt. Hạn hán gây héo chết, ngập úng gây thối rễ do thiếu oxy -> tưới tiêu chủ động, tưới nhỏ giọt, thoát nước kịp thời.',
          '5. Đất trồng & 6. Dinh dưỡng: Đất giữ rễ đứng vững, cung cấp khoáng, oxy, nước (bón vôi khử chua, phân hữu cơ, cày bừa tơi xốp). Dinh dưỡng cung cấp đa lượng (N, P, K), trung lượng (Ca, Mg, S), vi lượng (Fe, Zn, Cu,...) -> bón phân cân đối, đúng tỷ lệ.',
          '7. Kỹ thuật canh tác: Làm đất, thời vụ, mật độ, luân canh xen canh, chăm sóc, phòng trừ sâu bệnh -> tuân thủ lịch thời vụ, luân canh cây họ Đậu, áp dụng IPM.',
        ],
      },
    ],
  },
  {
    id: 'cn10-c2',
    grade: '10',
    bookTitle: 'Công nghệ 10 – Công nghệ Trồng trọt',
    domain: 'crop',
    chapterNumber: 'Chương II',
    chapterTitle: 'Đất trồng',
    pageRef: 'Ôn tập Chương II – Trang 40 SGK Công nghệ 10',
    lessons: [
      'Bài 3: Giới thiệu về đất trồng (trang 19)',
      'Bài 4: Sử dụng, cải tạo và bảo vệ đất trồng (trang 25)',
      'Bài 5: Giá thể trồng cây (trang 31)',
      'Bài 6: Thực hành: Xác định độ chua và độ mặn của đất (trang 37)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Giới thiệu về đất trồng',
        subItems: [
          'Khái niệm: Đất trồng là lớp bề mặt tơi xốp của vỏ Trái Đất, trên đó thực vật có khả năng sinh sống và sản xuất ra sản phẩm.',
          'Thành phần của đất trồng: Phần lỏng (nước), phần rắn (chất vô cơ ~95% và chất hữu cơ <5%), phần khí (oxygen, nitrogen, CO2), sinh vật đất.',
          'Tính chất của đất trồng: Keo đất (kích thước khoảng 1 µm, gồm keo âm và keo dương) và khả năng hấp phụ của đất; Thành phần cơ giới (tỉ lệ cát, limon, sét); Phản ứng của dung dịch đất (độ chua hoạt tính H+ và độ chua tiềm tàng H+/Al3+ trên bề mặt keo đất; độ kiềm; độ trung tính).',
        ],
      },
      {
        branchNumber: 2,
        title: 'Sử dụng, cải tạo và bảo vệ đất trồng',
        subItems: [
          'Sử dụng và bảo vệ đất trồng: Chọn cây trồng phù hợp với từng loại đất; kết hợp sử dụng với cải tạo, bồi dưỡng đất; canh tác bền vững.',
          'Cải tạo đất chua: Bón vôi (khử chua, kết tủa Al3+, Fe3+ di động), biện pháp thủy lợi (rửa trôi acid), biện pháp canh tác (cày sâu dần kết hợp bón phân hữu cơ, không bón phân sinh lí chua).',
          'Cải tạo đất mặn (nồng độ muối tan > 2,56‰): Bón vôi đẩy Na+ ra khỏi keo đất rồi tháo nước ngọt rửa mặn; xây đê biển và hệ thống mương máng tưới tiêu; cày sâu không lật, trồng cây chịu mặn (cói, đước, vẹt).',
          'Cải tạo đất xám bạc màu: Bón phân hữu cơ, phân xanh kết hợp bón vôi; xây dựng hệ thống thủy lợi tưới tiêu hợp lí; cày sâu dần, luân canh và xen canh cây họ Đậu.',
        ],
      },
      {
        branchNumber: 3,
        title: 'Giá thể trồng cây',
        subItems: [
          'Khái niệm: Vật liệu hoặc hỗn hợp các vật liệu tạo môi trường thuận lợi cho sự phát triển bộ rễ cây trồng.',
          'Giá thể hữu cơ tự nhiên: Giá thể than bùn, giá thể mùn cưa, giá thể trấu hun (đốt yếm khí), giá thể xơ dừa (ngâm nước sạch 2–3 ngày và nước vôi 2kg/100L 5–7 ngày để khử tanin và lignin).',
          'Giá thể trơ cứng (vô cơ): Giá thể perlite (nung đá núi lửa ở 800–850 °C), giá thể gốm (nung đất sét ở 1200–1300 °C).',
        ],
      },
    ],
    coreSummary: [
      'Cấu tạo hạt keo đất: Nhân keo -> Lớp ion quyết định điện (mang điện âm là keo âm, mang điện dương là keo dương) -> Lớp ion bất động -> Lớp ion khuếch tán (có khả năng trao đổi với các ion trong dung dịch đất).',
      'Phân loại độ pH của đất: Đất chua (pH < 6,6), Đất trung tính (pH = 6,6 – 7,5), Đất kiềm (pH > 7,5). Đa số cây trồng thích hợp ở pH từ 5,5 đến 7,5.',
      'Nguyên nhân đất xám bạc màu: Hình thành trên phù sa cổ, địa hình dốc thoải, thành phần cơ giới nhẹ (nhiều cát, ít sét và mùn), rửa trôi mạnh và tập quán canh tác lạc hậu.',
    ],
    questions: [
      {
        number: 1,
        question: 'Trình bày khái niệm, thành phần và tính chất của đất trồng.',
        answer: [
          'Khái niệm: Đất trồng là lớp bề mặt tơi xốp của vỏ Trái Đất, trên đó thực vật có khả năng sinh sống và sản xuất ra sản phẩm.',
          'Thành phần gồm 4 phần: (1) Phần rắn (khoảng 95% chất vô cơ chứa N, P, K, Ca, Mg... và <5% chất hữu cơ, mùn); (2) Phần lỏng (nước và chất dinh dưỡng hòa tan); (3) Phần khí (O2, N2, CO2 trong các khe hở); (4) Sinh vật đất (côn trùng, giun đất, vi khuẩn, nấm, xạ khuẩn phân giải chất hữu cơ).',
          'Tính chất chính: (1) Keo đất và khả năng hấp phụ (nhờ lớp ion khuếch tán trao đổi ion giúp giữ phân bón, chống rửa trôi); (2) Thành phần cơ giới (tỉ lệ % cát, limon, sét chia thành đất cát, đất thịt, đất sét); (3) Phản ứng của dung dịch đất (chua, kiềm, trung tính).',
        ],
      },
      {
        number: 2,
        question: 'Giải thích cơ sở khoa học của các biện pháp sử dụng và cải tạo đất chua, đất mặn và đất bạc màu.',
        answer: [
          'Đất chua: Bón vôi cung cấp Ca2+ trao đổi đẩy H+, Al3+ ra khỏi keo đất để trung hòa acid và kết tủa Al3+, Fe3+ di động giảm độc cho rễ; thủy lợi giúp thau chua rửa trôi acid tự do.',
          'Đất mặn: Keo đất mặn hấp phụ nhiều Na+ gây độc. Bón vôi cung cấp Ca2+ đẩy Na+ ra khỏi bề mặt keo đất tạo thành muối Na2SO4 hoặc NaCl hòa tan, sau đó đưa nước ngọt vào ngâm và tháo cạn để rửa mặn ra khỏi ruộng.',
          'Đất xám bạc màu: Tầng đất canh tác mỏng, nghèo mùn và sét, chua. Cày sâu dần kết hợp bón nhiều phân hữu cơ, phân xanh, vôi và luân canh cây họ Đậu giúp làm giàu chất mùn, tăng keo đất, cải thiện kết cấu viên và cố định đạm sinh học.',
        ],
      },
      {
        number: 3,
        question: 'Phân biệt giá thể hữu cơ tự nhiên và giá thể trơ cứng. Trình bày đặc điểm của một số loại giá thể trồng cây phổ biến.',
        answer: [
          'Phân biệt: Giá thể hữu cơ tự nhiên có nguồn gốc từ xác sinh vật (than bùn, mùn cưa, trấu hun, xơ dừa), chứa dinh dưỡng hữu cơ, giữ ẩm tốt nhưng bị phân hủy dần theo thời gian; Giá thể trơ cứng có nguồn gốc khoáng vô cơ (đá perlite, sỏi gốm keramzit), bền vững, không phân hủy, thoáng khí tốt nhưng hầu như không chứa dinh dưỡng.',
          'Đặc điểm: Than bùn (nhẹ, xốp, giàu mùn); Mùn cưa (chứa cellulose, thoáng khí nhưng giữ ẩm kém); Trấu hun (sạch mầm bệnh, giàu K2O và SiO2); Xơ dừa (giữ nước rất tốt nhưng có tanin và lignin cần xử lí trước khi dùng); Perlite và Gốm (nhẹ, xốp, thoát nước tốt, tái sử dụng nhiều lần cho thủy canh, trồng lan).',
        ],
      },
      {
        number: 4,
        question: 'Trình bày các bước sản xuất giá thể than bùn, giá thể mùn cưa, giá thể trấu hun và giá thể xơ dừa.',
        answer: [
          'Giá thể than bùn (4 bước): Tập kết phơi khô -> Nghiền nhỏ, sàng lọc -> Phối trộn vôi bột, vi sinh vật và khoáng -> Kiểm tra chất lượng, đóng gói.',
          'Giá thể mùn cưa (4 bước): Thu gom phơi khô -> Ủ mục mùn cưa với chế phẩm vi sinh -> Phối trộn nguyên liệu -> Kiểm tra chất lượng, đóng gói.',
          'Giá thể trấu hun (4 bước): Tập kết vỏ trấu (độ ẩm <15%) -> Đốt trấu trong điều kiện yếm khí (hun âm ỉ không thành ngọn lửa) -> Làm nguội (phun sương nước) và phối trộn -> Đóng gói.',
          'Giá thể xơ dừa (4 bước): Tách vỏ dừa (đập dập, tuốt tách sợi và mụn dừa) -> Ngâm nước sạch 2–3 ngày rồi ngâm nước vôi (2 kg vôi/100 L nước trong 5–7 ngày) để loại bỏ tanin và lignin -> Ủ mục với chế phẩm vi sinh -> Kiểm tra chất lượng, đóng gói.',
        ],
      },
      {
        number: 5,
        question: 'Xác định độ chua, độ mặn của đất trồng có ý nghĩa như thế nào đối với trồng trọt? Nêu ví dụ minh họa.',
        answer: [
          'Ý nghĩa: Giúp đánh giá đúng tính chất hóa học của đất để lựa chọn loại cây trồng phù hợp, xác định lượng vôi cần bón khử chua hoặc lượng nước ngọt cần rửa mặn, và chọn loại phân bón thích hợp (ví dụ đất chua không bón phân chua sinh lí như đạm sunphat mà dùng phân lân nung chảy có tính kiềm).',
          'Ví dụ: Khi đo thấy đất có pH < 4,5 (rất chua), người trồng cần bón vôi bột và thau chua trước khi gieo cấy lúa, hoặc chọn trồng các cây chịu chua như chè, dứa (thơm).',
        ],
      },
    ],
  },
  {
    id: 'cn10-c3',
    grade: '10',
    bookTitle: 'Công nghệ 10 – Công nghệ Trồng trọt',
    domain: 'crop',
    chapterNumber: 'Chương III',
    chapterTitle: 'Phân bón',
    pageRef: 'Ôn tập Chương III – Trang 56 SGK Công nghệ 10',
    lessons: [
      'Bài 7: Giới thiệu về phân bón (trang 41)',
      'Bài 8: Sử dụng và bảo quản phân bón (trang 45)',
      'Bài 9: Ứng dụng công nghệ vi sinh trong sản xuất phân bón (trang 50)',
      'Bài 10: Thực hành: Nhận biết một số loại phân bón hóa học (trang 54)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Giới thiệu chung về phân bón',
        subItems: [
          'Khái niệm và vai trò của phân bón: Cung cấp chất dinh dưỡng cho cây trồng, cải tạo đất, tăng năng suất và chất lượng nông sản.',
          'Đặc điểm cơ bản của một số loại phân bón phổ biến: Phân bón hóa học (tỉ lệ dinh dưỡng cao, dễ tan, tác dụng nhanh nhưng bón nhiều làm đất hóa chua); Phân bón hữu cơ (chứa đa – trung – vi lượng cân đối, cải tạo đất tơi xốp nhưng hàm lượng thấp, tác dụng chậm); Phân bón vi sinh (chứa VSV sống có ích, an toàn môi trường nhưng có thời hạn sử dụng ngắn).',
          'Nhận biết một số loại phân bón hóa học thông thường: Dựa vào màu sắc, độ tan, đốt trên ngọn lửa đèn cồn (mùi khai là phân đạm, lửa tím nổ lép bép là phân kali) và phản ứng thuốc thử (BaCl2, AgNO3, diphenylamine).',
        ],
      },
      {
        branchNumber: 2,
        title: 'Sử dụng và bảo quản phân bón',
        subItems: [
          'Phân bón hóa học: Đạm và kali dùng để bón thúc là chính (chia nhỏ nhiều lần); phân lân ít tan dùng để bón lót. Bảo quản: chống ẩm, chống để lẫn lộn, chống acid, chống nóng.',
          'Phân bón hữu cơ: Dùng để bón lót là chính (bón sớm trước khi gieo trồng). Bảo quản bằng 3 phương pháp ủ: ủ nóng (60–70 °C, thoáng khí), ủ nguội (20–35 °C, nén chặt yếm khí), ủ hỗn hợp (nóng trước – nguội sau).',
          'Phân bón vi sinh: Trộn tẩm hạt giống/rễ cây trước khi gieo hoặc bón trực tiếp vào đất ẩm; không trộn chung với phân hóa học hay thuốc trừ bệnh. Bảo quản nơi thoáng mát, tránh ánh nắng trực tiếp, dùng trong 4–6 tháng.',
        ],
      },
      {
        branchNumber: 3,
        title: 'Công nghệ vi sinh trong sản xuất phân bón',
        subItems: [
          'Nguyên lí chung: Nhân giống chủng vi sinh vật đặc hiệu trên môi trường dinh dưỡng thích hợp rồi phối trộn với chất mang (than bùn, bột khoáng, chất hữu cơ).',
          'Phân bón vi sinh cố định đạm: Chứa VSV sống cộng sinh (Rhizobium ở nốt sần cây họ Đậu), hội sinh (Spirillum, Azospirillum ở lúa, ngô) hoặc tự do (Azotobacter) chuyển hóa N2 không khí thành NH3.',
          'Phân bón vi sinh chuyển hóa lân: Chứa VSV phân giải lân khó tan trong đất thành lân dễ tan cho cây hấp thụ (ví dụ chế phẩm Phosphorobacterin).',
          'Phân bón vi sinh phân giải chất hữu cơ: Chứa VSV phân giải cellulose, tinh bột, protein thành hợp chất mùn và khoáng đơn giản (chế phẩm Trichoderma, EM, Bima).',
        ],
      },
    ],
    coreSummary: [
      'Cách phân biệt các loại phân hóa học khi thực hành (Bài 10): Phân lân không tan hoặc ít tan trong nước và không cháy khi đốt; Phân đạm đốt có mùi khai (NH3) và khói trắng; Phân kali (KCl, K2SO4) đốt không có mùi khai, phát ra tiếng nổ lép bép và ngọn lửa màu tím.',
      'Phản ứng hóa học nhận biết: NH4NO3 + diphenylamine -> màu xanh thẫm; (NH4)2SO4 hoặc K2SO4 + BaCl2 -> kết tủa trắng BaSO4; NH4Cl + AgNO3 -> kết tủa trắng AgCl.',
    ],
    questions: [
      {
        number: 1,
        question: 'Trình bày khái niệm về phân bón và vai trò của phân bón đối với trồng trọt.',
        answer: [
          'Khái niệm: Phân bón là sản phẩm có chức năng cung cấp chất dinh dưỡng cho cây trồng hoặc có tác dụng cải tạo đất để làm tăng năng suất và chất lượng nông sản.',
          'Vai trò: Cung cấp các nguyên tố dinh dưỡng thiết yếu (đa lượng N, P, K; trung lượng Ca, Mg, S; vi lượng Fe, Zn, B, Cu, Mo) cho cây sinh trưởng phát triển; bổ sung chất mùn, tăng độ phì nhiêu, tơi xốp và hệ vi sinh vật có ích trong đất.',
        ],
      },
      {
        number: 2,
        question: 'Nêu đặc điểm của một số loại phân bón phổ biến. So sánh ưu, nhược điểm của phân bón hóa học, phân bón hữu cơ và phân bón vi sinh.',
        answer: [
          'Phân bón hóa học: Ưu điểm là hàm lượng dinh dưỡng cao, dễ tan (trừ phân lân), hiệu quả nhanh; Nhược điểm là không cải tạo đất, bón nhiều và liên tục làm đất hóa chua, chai cứng và ô nhiễm nguồn nước.',
          'Phân bón hữu cơ: Ưu điểm là chứa đầy đủ các nguyên tố đa, trung, vi lượng, giúp cải tạo đất tơi xốp, tăng độ mùn và hệ VSV đất; Nhược điểm là hàm lượng dinh dưỡng thấp, hiệu quả chậm, khối lượng lớn tốn công vận chuyển và nếu không ủ hoai mục dễ mang mầm bệnh.',
          'Phân bón vi sinh: Ưu điểm là an toàn cho người, cây trồng và môi trường, cải tạo hệ sinh thái đất; Nhược điểm là tác dụng chậm, mỗi loại chỉ thích hợp với một hoặc một nhóm cây trồng nhất định, hạn sử dụng ngắn (4–6 tháng) và phụ thuộc điều kiện pH, độ ẩm đất.',
        ],
      },
      {
        number: 3,
        question: 'So sánh biện pháp sử dụng và bảo quản các loại phân bón hóa học, phân bón hữu cơ và phân bón vi sinh.',
        answer: [
          'Sử dụng: Phân hóa học (đạm, kali chủ yếu bón thúc; lân chủ yếu bón lót); Phân hữu cơ (chủ yếu bón lót sớm và phải ủ hoai mục); Phân vi sinh (tẩm hạt giống, hồ rễ hoặc bón vào đất đủ ẩm, không trộn với thuốc hóa học).',
          'Bảo quản: Phân hóa học (đóng bao kín, để nơi khô ráo trên kệ, chống ẩm, chống nóng, chống acid, không trộn lẫn); Phân hữu cơ (ủ thành đống có mái che bằng phương pháp ủ nóng, ủ nguội hoặc ủ hỗn hợp); Phân vi sinh (để nơi mát dưới 30 °C, tránh ánh nắng mặt trời trực tiếp).',
        ],
      },
      {
        number: 4,
        question: 'Nêu nguyên lí chung sản xuất phân bón vi sinh. Trình bày các bước sản xuất phân bón vi sinh cố định đạm, phân bón vi sinh chuyển hóa lân và phân bón vi sinh phân giải chất hữu cơ.',
        answer: [
          'Nguyên lí chung: Nhân nuôi chủng vi sinh vật đặc hiệu trên môi trường dinh dưỡng nhân tạo trong thiết bị lên men để đạt mật độ tế bào tiêu chuẩn, sau đó phối trộn với chất mang đã tiệt trùng.',
          'Các bước sản xuất (gồm 2 giai đoạn chính): Bước 1: Chuẩn bị và kiểm tra chủng vi sinh vật (cố định đạm / chuyển hóa lân / phân giải hữu cơ) và xử lí, tiệt trùng chất mang (than bùn, chất hữu cơ...); Bước 2: Phối trộn dịch vi sinh vật đã nhân giống với chất mang, bổ sung dinh dưỡng/phụ gia, kiểm tra chất lượng (mật độ VSV sống >= 10^8 – 10^9 CFU/g hoặc mL) và đóng bao bảo quản.',
        ],
      },
      {
        number: 5,
        question: 'Quan sát và nêu những điểm chưa hợp lí trong bảo quản, sử dụng phân bón ở gia đình, địa phương; đề xuất giải pháp khắc phục.',
        answer: [
          'Điểm chưa hợp lí thường gặp: Bón phân chuồng tươi chưa ủ hoai mục trực tiếp cho rau màu; lạm dụng phân đạm hóa học làm cây lốp đổ, sâu bệnh nhiều và tồn dư nitrate; để bao phân đạm mở miệng ngoài trời ẩm gây chảy nước và bay hơi NH3; trộn vôi bột trực tiếp với phân đạm/phân lân super.',
          'Giải pháp khắc phục: Ủ hoai mục phân hữu cơ kết hợp chế phẩm Trichoderma trước khi bón; áp dụng nguyên tắc "4 đúng" (đúng loại, đúng liều, đúng lúc, đúng cách); buộc kín miệng bao phân hóa học và kê trên kệ gỗ nơi khô thoáng.',
        ],
      },
    ],
  },
  {
    id: 'cn10-c4',
    grade: '10',
    bookTitle: 'Công nghệ 10 – Công nghệ Trồng trọt',
    domain: 'crop',
    chapterNumber: 'Chương IV',
    chapterTitle: 'Công nghệ giống cây trồng',
    pageRef: 'Ôn tập Chương IV – Trang 74 SGK Công nghệ 10',
    lessons: [
      'Bài 11: Khái niệm và vai trò của giống cây trồng (trang 57)',
      'Bài 12: Một số phương pháp chọn, tạo giống cây trồng (trang 60)',
      'Bài 13: Nhân giống cây trồng (trang 66)',
      'Bài 14: Thực hành: Nhân giống cây ăn quả bằng phương pháp ghép (trang 72)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Khái niệm và vai trò của giống cây trồng',
        subItems: [
          'Khái niệm: Là một quần thể cây trồng cùng loài, có nguồn gốc chung, có tính di truyền đồng nhất và ổn định, phân biệt được với các quần thể khác cùng loài.',
          'Vai trò của giống cây trồng: Quy định năng suất và chất lượng nông sản; tăng khả năng chống chịu sâu bệnh và điều kiện bất lợi; thay đổi cơ cấu cây trồng và tăng số vụ gieo trồng trong năm.',
        ],
      },
      {
        branchNumber: 2,
        title: 'Chọn, tạo giống cây trồng',
        subItems: [
          'Chọn giống cây trồng: Chọn lọc hỗn hợp (chọn nhiều cây ưu tú thu hạt trộn chung, đơn giản dễ làm) và Chọn lọc cá thể (chọn từng cây ưu tú, thu hạt riêng từng cây để so sánh chọn dòng tốt nhất, độ đồng đều cao).',
          'Tạo giống bằng phương pháp lai: Tạo giống thuần chủng bằng lai hữu tính (lai đơn 2 bố mẹ hoặc lai phức >= 3 bố mẹ, 6 bước) và Tạo giống ưu thế lai F1 (6 bước, dùng làm thương phẩm, không giữ hạt F1 làm giống vụ sau).',
          'Tạo giống bằng phương pháp gây đột biến: Xử lí tác nhân vật lí (tia X, tia gamma, tia tử ngoại) hoặc hóa học (colchicine, EMS, NMU) gồm 6 bước.',
          'Tạo giống bằng công nghệ gene (chuyển gene): Tách gene mục tiêu -> tạo vector tái tổ hợp -> chuyển vào tế bào thực vật -> tái sinh cây chuyển gene (6 bước).',
        ],
      },
      {
        branchNumber: 3,
        title: 'Nhân giống cây trồng',
        subItems: [
          'Nhân giống hữu tính (bằng hạt): Trải qua 4 vụ từ Hạt giống tác giả (SNC) -> Hạt giống siêu nguyên chủng -> Hạt giống nguyên chủng -> Hạt giống xác nhận (đưa ra sản xuất đại trà).',
          'Nhân giống vô tính: Giâm cành, chiết cành, ghép cành/ghép mắt (ghép đoạn cành, ghép mắt nhỏ có gỗ, ghép chữ T), và nhân giống bằng nuôi cấy mô tế bào (5 bước: Chọn vật liệu -> Khử trùng -> Tạo chồi -> Ra rễ -> Chuyển ra vườn ươm).',
        ],
      },
    ],
    coreSummary: [
      'Thứ tự 4 cấp hạt giống: Giống tác giả -> Giống siêu nguyên chủng (SNC) -> Giống nguyên chủng (NC) -> Giống xác nhận (XN).',
      'Ưu điểm của nuôi cấy mô tế bào (vi nhân giống): Hệ số nhân giống cực cao, cây con đồng nhất về mặt di truyền (giữ nguyên đặc tính cây mẹ), sạch bệnh (đặc biệt là bệnh virus khi nuôi cấy đỉnh sinh trưởng) và không phụ thuộc mùa vụ.',
    ],
    questions: [
      {
        number: 1,
        question: 'Giống cây trồng là gì? Nêu vai trò của giống trong trồng trọt.',
        answer: [
          'Khái niệm: Giống cây trồng là một quần thể cây trồng thuộc cùng một bậc phân loại thực vật thấp nhất, có các đặc điểm di truyền, hình thái, sinh lí ổn định, phân biệt được với quần thể khác và cho năng suất, phẩm chất phù hợp.',
          'Vai trò: Quyết định giới hạn năng suất và chất lượng nông sản; giúp tăng khả năng kháng sâu bệnh và chịu hạn, mặn, phèn; giống ngắn ngày giúp tăng vụ và thay đổi cơ cấu cây trồng hợp lí.',
        ],
      },
      {
        number: 2,
        question: 'Trình bày phương pháp chọn lọc hỗn hợp và chọn lọc cá thể trong chọn giống cây trồng. So sánh ưu, nhược điểm của hai phương pháp này.',
        answer: [
          'Chọn lọc hỗn hợp: Chọn các cây có đặc tính tốt từ quần thể ban đầu rồi thu hoạch hạt chung thành một mẫu để gieo ở vụ sau. Ưu điểm: Đơn giản, dễ thực hiện, ít tốn công và chi phí; Nhược điểm: Không kiểm tra được kiểu gene từng cây nên hiệu quả chọn lọc thấp, chậm đạt độ thuần.',
          'Chọn lọc cá thể: Chọn các cây ưu tú từ quần thể khởi đầu, thu hạt riêng từng cây và gieo thành từng dòng riêng biệt ở vụ sau để đánh giá kiểu gene qua đời con. Ưu điểm: Độ chính xác cao, nhanh tạo được dòng thuần đồng nhất; Nhược điểm: Phức tạp, tốn nhiều diện tích, công sức theo dõi.',
        ],
      },
      {
        number: 3,
        question: 'Trình bày các phương pháp tạo giống cây trồng phổ biến. Phân biệt phương pháp lai hữu tính và phương pháp gây đột biến trong tạo giống cây trồng.',
        answer: [
          'Các phương pháp tạo giống phổ biến: Tạo giống bằng phương pháp lai (lai tạo giống thuần và lai tạo giống ưu thế lai F1), tạo giống bằng gây đột biến (vật lí, hóa học) và tạo giống bằng công nghệ gene.',
          'Phân biệt: Lai hữu tính tạo ra biến dị tổ hợp dựa trên sự kết hợp nguồn gene có sẵn của bố và mẹ qua thụ phấn; Gây đột biến dùng tác nhân vật lí (tia gamma, tia X) hoặc hóa học (EMS, colchicine) làm thay đổi cấu trúc DNA/số lượng nhiễm sắc thể để tạo ra các gene hoặc tính trạng hoàn toàn mới.',
        ],
      },
      {
        number: 4,
        question: 'So sánh nhân giống hữu tính và nhân giống vô tính. Trình bày các phương pháp nhân giống vô tính phổ biến.',
        answer: [
          'So sánh: Nhân giống hữu tính (bằng hạt) có hệ số nhân cao, cây có rễ cọc khỏe, tuổi thọ dài nhưng đời con dễ bị phân li tính trạng ở cây giao phấn và lâu ra hoa quả; Nhân giống vô tính (từ bộ phận sinh dưỡng thân, lá, rễ) giữ nguyên 100% đặc tính di truyền của cây mẹ, sớm ra hoa kết quả nhưng rễ chùm ăn nông (trừ ghép trên gốc ghép hạt) và hệ số nhân truyền thống thấp.',
          'Các phương pháp nhân giống vô tính: Giâm cành (cắt đoạn cành cắm vào giá thể ẩm), Chiết cành (khoanh vỏ bó bầu đất cho ra rễ trên cây mẹ rồi mới cắt hạ bầu), Ghép (gắn mắt ghép hoặc cành ghép lên gốc ghép) và Nuôi cấy mô tế bào thực vật.',
        ],
      },
      {
        number: 5,
        question: 'Trình bày quy trình nhân giống cây trồng bằng phương pháp nuôi cấy mô tế bào và cơ sở khoa học của phương pháp này.',
        answer: [
          'Cơ sở khoa học: Dựa trên tính toàn năng của tế bào thực vật (mỗi tế bào thực vật đều chứa hệ gene hoàn chỉnh và khi được nuôi cấy trong môi trường nhân tạo vô trùng đầy đủ dinh dưỡng, hormone auxin/cytokinin thích hợp sẽ nguyên phân, biệt hóa thành một cây hoàn chỉnh).',
          'Quy trình 5 bước: Bước 1: Chọn vật liệu nuôi cấy (thường là mô phân sinh đỉnh chồi từ cây mẹ khỏe mạnh, sạch bệnh); Bước 2: Khử trùng mẫu cấy; Bước 3: Tạo chồi trong môi trường nhân tạo (bổ sung cytokinin); Bước 4: Tạo rễ (chuyển chồi sang môi trường bổ sung auxin như α-NAA, IBA); Bước 5: Cấy cây vào môi trường thích ứng (vườn ươm) trước khi đưa ra trồng ngoài đồng ruộng.',
        ],
      },
      {
        number: 6,
        question: 'Vì sao khi ghép cây phải buộc chặt cành ghép hay mắt ghép vào gốc ghép?',
        answer: [
          'Buộc chặt bằng dây nilon chuyên dụng giúp áp sát tượng tầng (mô phân sinh bên) của cành ghép/mắt ghép vào tượng tầng của gốc ghép để các tế bào phân chia tạo mô sẹo và mạch dẫn thông suốt nuôi sống cành ghép.',
          'Đồng thời buộc kín giúp cố định vết ghép không bị xê dịch do gió, hạn chế sự thoát hơi nước làm khô mắt ghép và ngăn nước mưa, vi khuẩn, nấm bệnh xâm nhập làm thối vết ghép.',
        ],
      },
    ],
  },
  {
    id: 'cn10-c5',
    grade: '10',
    bookTitle: 'Công nghệ 10 – Công nghệ Trồng trọt',
    domain: 'crop',
    chapterNumber: 'Chương V',
    chapterTitle: 'Phòng trừ sâu, bệnh hại cây trồng',
    pageRef: 'Ôn tập Chương V – Trang 95 SGK Công nghệ 10',
    lessons: [
      'Bài 15: Sâu, bệnh hại cây trồng và ý nghĩa của việc phòng trừ (trang 75)',
      'Bài 16: Một số sâu hại cây trồng thường gặp và biện pháp phòng trừ (trang 79)',
      'Bài 17: Một số bệnh hại cây trồng thường gặp và biện pháp phòng trừ (trang 85)',
      'Bài 18: Ứng dụng công nghệ vi sinh trong phòng trừ sâu, bệnh hại cây trồng (trang 90)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Sâu, bệnh hại cây trồng và biện pháp phòng trừ',
        subItems: [
          'Khái niệm và tác hại của sâu, bệnh hại cây trồng (làm giảm năng suất, phẩm chất nông sản, thậm chí mất trắng).',
          'Các biện pháp phòng trừ: Biện pháp canh tác và sử dụng giống chống chịu; Biện pháp cơ giới, vật lí; Biện pháp sinh học (thiên địch, chế phẩm sinh học); Biện pháp hóa học (thuốc BVTV theo nguyên tắc 4 đúng); Biện pháp quản lí dịch hại tổng hợp (IPM).',
          'Ý nghĩa của việc phòng trừ sâu, bệnh hại: Bảo vệ cây trồng, ổn định năng suất – chất lượng nông sản và đảm bảo an toàn thực phẩm.',
        ],
      },
      {
        branchNumber: 2,
        title: 'Một số loại sâu hại cây trồng thường gặp',
        subItems: [
          'Sâu tơ hại rau (Plutella xylostella): Sâu non ăn biểu bì lá tạo vết trong mờ ở tuổi nhỏ, tuổi lớn ăn thủng lá rau họ Thập tự.',
          'Rầy nâu hại lúa (Nilaparvata lugens): Chích hút nhựa ở bẹ lúa làm cây khô héo ("cháy rầy") và là môi giới truyền bệnh virus vàng lùn, lùn xoắn lá.',
          'Sâu keo mùa thu (Spodoptera frugiperda): Phá hại nặng trên ngô, trên đầu có hình chữ Y ngược màu vàng, đốt bụng cuối có 4 chấm đen xếp thành hình vuông.',
          'Ruồi đục quả (Bactrocera dorsalis): Ruồi cái đẻ trứng vào vỏ quả sắp chín, dòi (ấu trùng) đục ăn phần thịt quả làm quả thối rụng.',
        ],
      },
      {
        branchNumber: 3,
        title: 'Một số loại bệnh hại cây trồng thường gặp',
        subItems: [
          'Bệnh thán thư: Do nấm Colletotrichum spp. gây ra trên xoài, ớt, cà phê; vết bệnh có các vòng đồng tâm màu nâu sẫm.',
          'Bệnh vàng lá greening: Do vi khuẩn Candidatus Liberibacter asiaticus sống trong mạch rây cây có múi (cam, quýt, bưởi), lây truyền qua mắt ghép và rầy chổng cánh (Diaphorina citri).',
          'Bệnh đạo ôn hại lúa: Do nấm Pyricularia oryzae gây ra; vết bệnh trên lá có hình thoi (mắt én), tâm màu xám trắng, viền nâu và gây thối cổ bông.',
          'Bệnh héo xanh vi khuẩn: Do vi khuẩn Ralstonia (Pseudomonas) solanacearum gây hại cà chua, khoai tây, lạc; cây héo đột ngột khi lá vẫn còn xanh, cắt ngang thân thấy mạch dẫn hóa nâu và có dịch nhầy trắng đục chứa vi khuẩn.',
        ],
      },
      {
        branchNumber: 4,
        title: 'Công nghệ vi sinh trong phòng trừ sâu, bệnh hại cây trồng',
        subItems: [
          'Chế phẩm vi khuẩn trừ sâu (Bt – Bacillus thuringiensis): Tạo tinh thể protein độc tố delta-endotoxin làm liệt ruột và thủng ruột sâu non bộ Cánh vảy (6 bước sản xuất).',
          'Chế phẩm virus trừ sâu (NPV – Nuclear Polyhedrosis Virus): Virus kí sinh bắt buộc nên phải nhân nuôi trực tiếp trên cơ thể sâu non vật chủ nuôi bằng thức ăn nhân tạo (6 bước).',
          'Chế phẩm nấm trừ sâu (Beauveria bassiana – nấm bạch cương, Metarhizium – nấm lục cương) và nấm đối kháng trừ bệnh (Trichoderma spp. kiểm soát nấm gây thối rễ Fusarium, Rhizoctonia, Pythium).',
        ],
      },
    ],
    coreSummary: [
      'Điểm khác biệt quan trọng trong sản xuất chế phẩm NPV so với Bt và nấm: Virus NPV là kí sinh nội bào bắt buộc nên KHÔNG lên men trên môi trường thạch/lỏng nhân tạo trực tiếp được mà phải nhân nuôi sâu non vật chủ trên thức ăn nhân tạo rồi gây nhiễm virus NPV cho sâu.',
      '4 nguyên tắc cốt lõi của Quản lí dịch hại tổng hợp (IPM): (1) Trồng cây khỏe; (2) Bảo tồn thiên địch; (3) Thăm đồng thường xuyên; (4) Nông dân trở thành chuyên gia.',
    ],
    questions: [
      {
        number: 1,
        question: 'Sâu, bệnh hại cây trồng là gì? Nêu tác hại của sâu, bệnh đối với trồng trọt và ý nghĩa của việc phòng trừ sâu, bệnh hại.',
        answer: [
          'Khái niệm: Sâu hại là các loài côn trùng gây hại cho các bộ phận của cây; Bệnh hại là trạng thái không bình thường của cây về hình thái, sinh lí do vi sinh vật (nấm, vi khuẩn, virus) hoặc điều kiện ngoại cảnh bất lợi gây ra.',
          'Tác hại & Ý nghĩa: Sâu bệnh làm cây còi cọc, giảm năng suất, giảm phẩm chất thương phẩm, lây lan thành dịch gây mất mùa. Phòng trừ kịp thời giúp bảo vệ mùa màng, nâng cao hiệu quả kinh tế và đảm bảo an ninh lương thực.',
        ],
      },
      {
        number: 2,
        question: 'So sánh ưu, nhược điểm của các biện pháp phòng trừ sâu, bệnh hại cây trồng. Theo em, nên sử dụng biện pháp nào để đạt hiệu quả cao nhất? Vì sao?',
        answer: [
          'Canh tác & giống kháng: Phòng ngừa chủ động, bền vững, an toàn nhưng khi dịch đã bùng phát thì không dập dịch ngay được; Cơ giới vật lí: An toàn nhưng tốn công; Sinh học: An toàn với người và môi trường, bảo vệ thiên địch nhưng tác dụng chậm; Hóa học: Diệt sâu bệnh nhanh, dập dịch tức thời nhưng gây ô nhiễm môi trường, diệt cả thiên địch, tồn dư nông sản và tạo tính kháng thuốc.',
          'Biện pháp đạt hiệu quả cao nhất và bền vững nhất là Quản lí dịch hại tổng hợp (IPM) vì phối hợp hài hòa tất cả các biện pháp trên, lấy canh tác và sinh học làm nền tảng, chỉ dùng thuốc hóa học khi mật độ sâu bệnh vượt ngưỡng kinh tế.',
        ],
      },
      {
        number: 3,
        question: 'Nêu nguyên nhân phát sinh, đặc điểm nhận biết và biện pháp phòng trừ một số loại sâu hại cây trồng thường gặp.',
        answer: [
          'Sâu tơ hại rau: Phát triển mạnh khi thời tiết khô mát, trồng rau họ cải liên tục; sâu non màu xanh nhạt ăn thủng lá; phòng trừ bằng luân canh, bẫy Pheromone, phun chế phẩm Bt hoặc NPV.',
          'Rầy nâu hại lúa: Phát sinh mạnh khi gieo sạ dày, bón thừa đạm; chích hút gốc lúa gây cháy rầy; phòng trừ bằng giống lúa kháng rầy, gieo sạ thưa hợp lí, bảo vệ nhện và bọ rùa ăn rầy.',
          'Sâu keo mùa thu: Bướm di cư mạnh, sâu non có chữ Y ngược trên đầu và 4 chấm đen ở đốt bụng cuối, phá hại nõn ngô; phòng trừ bằng bẫy bả chua ngọt, chế phẩm Bt, nấm bạch cương.',
          'Ruồi đục quả: Đẻ trứng vào quả sắp chín làm dòi đục thối quả; phòng trừ hiệu quả bằng bao trái, treo bẫy Pheromone (Methyl Eugenol) hoặc bả protein và thu gom tiêu hủy quả rụng.',
        ],
      },
      {
        number: 4,
        question: 'Nêu nguyên nhân phát sinh, đặc điểm nhận biết và biện pháp phòng trừ một số loại bệnh hại cây trồng thường gặp.',
        answer: [
          'Bệnh thán thư (do nấm Colletotrichum): Phát sinh khi ẩm độ cao, mưa nhiều; vết bệnh có vòng đồng tâm lõm xuống; phòng trừ bằng tỉa cành tạo thông thoáng, thu gom cành bệnh và phun thuốc gốc đồng.',
          'Bệnh vàng lá greening (do vi khuẩn Candidatus Liberibacter asiaticus): Lây qua mắt ghép và rầy chổng cánh; lá vàng lốm đốm gân xanh, quả nhỏ lệch tâm hạt lép đen; phòng trừ bằng nhân giống sạch bệnh, trồng cây chắn gió, trừ rầy chổng cánh (hoặc nuôi kiến vàng thiên địch) và chặt bỏ cây bệnh (vì không có thuốc trị dứt điểm).',
          'Bệnh đạo ôn lúa (do nấm Pyricularia oryzae): Phát triển khi trời âm u, sương mù, bón thừa đạm; vết bệnh hình thoi trên lá và thối cổ bông; phòng trừ bằng giống kháng, bón phân cân đối N-P-K và phun thuốc đặc trị đạo ôn.',
          'Bệnh héo xanh vi khuẩn (do Ralstonia solanacearum): Phát triển khi nhiệt độ và độ ẩm đất cao; cây héo rũ đột ngột nhưng lá vẫn xanh, bó mạch hóa nâu có dịch khuẩn trắng đục; phòng trừ bằng luân canh với lúa nước, bón vôi và chế phẩm đối kháng Trichoderma.',
        ],
      },
      {
        number: 5,
        question: 'Trình bày đặc điểm, nguyên lí tác động và quy trình sản xuất chế phẩm vi khuẩn trừ sâu, virus trừ sâu và nấm trừ sâu.',
        answer: [
          'Chế phẩm vi khuẩn Bt: Trong quá trình hình thành bào tử, vi khuẩn Bt tổng hợp tinh thể protein độc tố delta-endotoxin. Khi sâu non ăn phải, trong môi trường kiềm của ruột sâu, tinh thể tan ra làm thủng màng ruột giữa khiến sâu ngừng ăn và chết sau 2–4 ngày.',
          'Chế phẩm virus NPV: Xâm nhập qua đường tiêu hóa của sâu non, nhân lên trong nhân tế bào làm toàn bộ mô cơ thể sâu hóa lỏng, sâu bò lên ngọn cây và chết treo ngược.',
          'Chế phẩm nấm trừ sâu (Beauveria, Metarhizium): Bào tử nấm bám trên vỏ cơ thể côn trùng, nảy mầm tiết enzyme xuyên qua lớp vỏ kitin vào khoang cơ thể, hút chất dinh dưỡng làm côn trùng chết cứng và phủ lớp sợi nấm màu trắng hoặc xanh.',
        ],
      },
      {
        number: 6,
        question: 'Trình bày đặc điểm và quy trình sản xuất chế phẩm nấm trừ bệnh hại cây trồng.',
        answer: [
          'Đặc điểm: Sử dụng các chủng nấm đối kháng (phổ biến nhất là nấm Trichoderma spp.) có khả năng tiết enzyme phân hủy vách tế bào nấm bệnh (Fusarium, Rhizoctonia, Pythium), cạnh tranh dinh dưỡng và kích thích rễ cây phát triển.',
          'Quy trình sản xuất 6 bước: Giống nấm Trichoderma thuần khiết -> Nhân giống cấp 1 trên môi trường thạch nghiêng -> Nhân giống cấp 2 trên môi trường dịch thể/xốp -> Chuẩn bị và khử trùng giá thể (cám gạo, bột ngô, vỏ trấu) -> Cấy giống và ủ lên men hiếu khí -> Làm khô, nghiền nhỏ, phối trộn chất phụ gia và đóng gói.',
        ],
      },
      {
        number: 7,
        question: 'Quan sát và nêu các loại sâu, bệnh hại trên một loại cây trồng phổ biến ở địa phương em. Đề xuất biện pháp phòng trừ phù hợp theo hướng bảo vệ môi trường.',
        answer: [
          'Ví dụ trên cây lúa hoặc rau cải tại địa phương: Xuất hiện sâu tơ, sâu xanh ăn lá hoặc bệnh thối rễ.',
          'Biện pháp theo hướng bảo vệ môi trường: Vệ sinh đồng ruộng, luân canh cây trồng khác họ, bón phân hữu cơ hoai mục ủ với nấm đối kháng Trichoderma để phòng bệnh thối rễ, dùng bẫy dính màu vàng/bẫy Pheromone và phun chế phẩm sinh học Bt hoặc thảo dược (tỏi – ớt – gừng) thay cho thuốc hóa học độc hại.',
        ],
      },
    ],
  },
  {
    id: 'cn10-c6',
    grade: '10',
    bookTitle: 'Công nghệ 10 – Công nghệ Trồng trọt',
    domain: 'crop',
    chapterNumber: 'Chương VI',
    chapterTitle: 'Kĩ thuật trồng trọt',
    pageRef: 'Ôn tập Chương VI – Trang 114 SGK Công nghệ 10',
    lessons: [
      'Bài 19: Quy trình trồng trọt và cơ giới hóa trong trồng trọt (trang 96)',
      'Bài 20: Công nghệ cao trong thu hoạch và bảo quản sản phẩm trồng trọt (trang 102)',
      'Bài 21: Chế biến sản phẩm trồng trọt (trang 108)',
      'Bài 22: Thực hành: Chế biến sản phẩm trồng trọt (trang 112)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Quy trình trồng trọt và cơ giới hóa trong trồng trọt',
        subItems: [
          'Bước 1: Làm đất, bón phân lót (cày đất, bừa/đập đất, lên luống; dùng máy cày, máy phay đất, máy bón phân).',
          'Bước 2: Gieo hạt, trồng cây con (gieo vãi, gieo hàng, gieo hốc; dùng máy gieo hạt, máy cấy lúa, máy trồng khoai tây).',
          'Bước 3: Chăm sóc và phòng trừ sâu, bệnh (tỉa dặm, làm cỏ vun xới, bón phân thúc, tưới tiêu nước; dùng drone phun thuốc, hệ thống tưới tự động).',
          'Bước 4: Thu hoạch sản phẩm (đúng độ chín; dùng máy gặt đập liên hợp, máy thu hoạch mía/ngô/khoai, robot hái quả).',
        ],
      },
      {
        branchNumber: 2,
        title: 'Bảo quản sản phẩm trồng trọt',
        subItems: [
          'Vai trò của bảo quản: Giảm tổn thất sau thu hoạch về số lượng và chất lượng, duy trì độ tươi ngon và kéo dài thời gian sử dụng.',
          'Một số phương pháp bảo quản ứng dụng công nghệ cao: Bảo quản trong kho silo (kiểm soát nhiệt độ, độ ẩm tự động cho hạt lương thực); Bảo quản trong kho lạnh (0–5 °C) và công nghệ cấp đông tế bào CAS (Cells Alive System dùng từ trường); Bảo quản bằng chiếu xạ (tia gamma, tia X, chùm tia điện tử diệt mầm bệnh, ức chế nảy mầm); Bảo quản bằng khí quyển điều chỉnh CA/MA (giảm O2, tăng CO2); Bảo quản bằng công nghệ plasma lạnh.',
        ],
      },
      {
        branchNumber: 3,
        title: 'Chế biến sản phẩm trồng trọt',
        subItems: [
          'Mục đích của chế biến: Tăng giá trị gia tăng, đa dạng hóa sản phẩm, kéo dài thời hạn bảo quản.',
          'Một số phương pháp chế biến thông thường: Sấy khô, nghiền bột và tinh bột, muối chua (lên men lactic), làm xirô hoa quả.',
          'Một số phương pháp chế biến ứng dụng công nghệ cao: Công nghệ sấy lạnh (sấy bơm nhiệt ở 10–65 °C, độ ẩm không khí sấy < 40%); Công nghệ xử lí áp suất cao HPP (High Pressure Processing ở 4–10 °C cho nước ép); Công nghệ chiên chân không (ở nhiệt độ thấp ~100–120 °C giữ nguyên màu sắc và vitamin).',
        ],
      },
    ],
    coreSummary: [
      'Ưu điểm vượt trội của sấy lạnh so với sấy nhiệt truyền thống: Sấy ở nhiệt độ thấp (10–65 °C) nên nông sản không bị biến tính protein, giữ nguyên màu sắc tự nhiên, hương vị và hàm lượng vitamin.',
      'Chiên chân không: Thực hiện trong buồng áp suất thấp làm nhiệt độ sôi của nước giảm xuống, giúp thoát ẩm nhanh ở nhiệt độ dầu thấp, sản phẩm giòn xốp, ít ngấm dầu và không sinh chất độc acrylamide.',
    ],
    questions: [
      {
        number: 1,
        question: 'Nêu các bước trong quy trình trồng trọt và mục đích, yêu cầu kĩ thuật của từng bước.',
        answer: [
          'Bước 1 – Làm đất, bón phân lót: Giúp đất tơi xốp, thoáng khí, vùi lấp cỏ dại và mầm sâu bệnh, cung cấp dinh dưỡng ban đầu cho cây.',
          'Bước 2 – Gieo hạt, trồng cây con: Đúng thời vụ, đúng mật độ và khoảng cách, đúng độ sâu để cây nhận đủ ánh sáng và dinh dưỡng.',
          'Bước 3 – Chăm sóc và phòng trừ sâu bệnh: Gồm tỉa dặm đảm bảo mật độ, làm cỏ vun xới chống đổ, tưới tiêu nước hợp lí, bón phân thúc đúng giai đoạn và phòng trừ sâu bệnh kịp thời.',
          'Bước 4 – Thu hoạch: Thu hoạch đúng độ chín (chín sinh lí hoặc chín thương phẩm), đúng lúc, nhanh gọn, nhẹ nhàng để hạn chế hao hụt và dập nát.',
        ],
      },
      {
        number: 2,
        question: 'Nêu một số ứng dụng cơ giới hóa trong làm đất, gieo trồng, chăm sóc và thu hoạch sản phẩm trồng trọt.',
        answer: [
          'Làm đất: Máy cày chảo, máy phay đất, máy lên luống kết hợp rải màng phủ nông nghiệp.',
          'Gieo trồng: Máy gieo hạt chính xác bằng khí nén, máy cấy lúa, máy trồng sắn/mía/khoai tây.',
          'Chăm sóc: Hệ thống tưới phun mưa, nhỏ giọt tự động; máy xới cỏ; thiết bị bay không người lái (Drone) phun thuốc BVTV và rải phân.',
          'Thu hoạch: Máy gặt đập liên hợp thu hoạch lúa, máy thu hoạch ngô, mía, khoai tây và cánh tay robot thu hoạch cà chua, dâu tây trong nhà kính.',
        ],
      },
      {
        number: 3,
        question: 'Nêu vai trò của bảo quản sản phẩm trồng trọt. Trình bày đặc điểm của một số phương pháp ứng dụng công nghệ cao trong bảo quản sản phẩm trồng trọt.',
        answer: [
          'Vai trò: Hạn chế hao hụt khối lượng, giữ nguyên chất lượng dinh dưỡng và cảm quan, điều hòa nguồn cung nông sản quanh năm và phục vụ xuất khẩu đi xa.',
          'Các công nghệ cao: (1) Kho silo hiện đại: Bảo quản khối lượng lớn hạt có cảm biến nhiệt – ẩm và thông gió tự động; (2) Kho lạnh & CAS: Kết hợp lạnh đông với sóng từ trường làm phân tử nước dao động không tạo tinh thể đá sắc nhọn phá vỡ màng tế bào, giữ độ tươi 99,9% sau rã đông; (3) Chiếu xạ: Diệt côn trùng kiểm dịch và ức chế nảy mầm hành tỏi, khoai tây; (4) Khí quyển điều chỉnh (CA/MA): Hạ thấp O2 và nâng CO2 để ức chế cường độ hô hấp của rau quả tươi; (5) Plasma lạnh: Tiêu diệt vi khuẩn, nấm mốc trên bề mặt vỏ quả mà không dùng hóa chất.',
        ],
      },
      {
        number: 4,
        question: 'Trình bày đặc điểm của một số phương pháp chế biến sản phẩm trồng trọt phổ biến.',
        answer: [
          'Phương pháp truyền thống: Sấy khô/phơi khô, nghiền bột/tinh bột (bột sắn dây, bột nghệ), muối chua lên men lactic (dưa cải, cà muối) và ngâm đường làm xirô hoa quả (xirô dâu, mơ, sấu).',
          'Phương pháp công nghệ cao: Sấy lạnh (giữ nguyên màu, mùi vị và vitamin), Chiên chân không (tạo mít sấy, chuối sấy, khoai môn sấy giòn ít dầu), Xử lí áp suất cao HPP (tiệt trùng nước ép trái cây ở nhiệt độ lạnh 4–10 °C giúp giữ nguyên hương vị tươi sống).',
        ],
      },
      {
        number: 5,
        question: 'Phân biệt bảo quản và chế biến sản phẩm trồng trọt.',
        answer: [
          'Bảo quản: Là các biện pháp giữ cho nông sản ở trạng thái nguyên vẹn ban đầu (tươi sống hoặc hạt khô), hạn chế sự hư hỏng và duy trì phẩm chất tự nhiên của nông sản.',
          'Chế biến: Là quá trình tác động cơ học, nhiệt học, hóa học hoặc sinh học làm biến đổi trạng thái, hình dạng, tính chất của nguyên liệu nông sản ban đầu để tạo ra sản phẩm mới có giá trị sử dụng và thời hạn bảo quản cao hơn.',
        ],
      },
      {
        number: 6,
        question: 'Kể tên các loại sản phẩm chế biến từ sản phẩm trồng trọt có ở gia đình hoặc địa phương em. Lựa chọn một sản phẩm, tìm hiểu và trình bày quy trình chế biến sản phẩm đó.',
        answer: [
          'Các sản phẩm phổ biến: Dưa cải muối chua, hành/kiệu muối, xirô mơ/dâu, mứt dừa, mít sấy, tinh bột nghệ.',
          'Quy trình làm xirô quả (mơ, dâu hoặc mận) chuẩn SGK Bài 22: Bước 1: Lựa chọn quả tươi chín đều, không dập nát, rửa sạch, để thật ráo nước -> Bước 2: Xếp vào lọ thủy tinh sạch theo cứ 1 lớp quả rải 1 lớp đường trắng (tỉ lệ khoảng 1 kg quả : 1–1,2 kg đường) -> Bước 3: Đậy kín nắp, bảo quản nơi khô mát, sau khoảng 2–4 tuần đường tan hết và chiết dịch quả ra ngoài tạo thành xirô.',
        ],
      },
    ],
  },
  {
    id: 'cn10-c7',
    grade: '10',
    bookTitle: 'Công nghệ 10 – Công nghệ Trồng trọt',
    domain: 'crop',
    chapterNumber: 'Chương VII',
    chapterTitle: 'Trồng trọt công nghệ cao',
    pageRef: 'Ôn tập Chương VII – Trang 133 SGK Công nghệ 10',
    lessons: [
      'Bài 23: Giới thiệu về trồng trọt công nghệ cao (trang 115)',
      'Bài 24: Một số công nghệ cao trong trồng trọt (trang 120)',
      'Bài 25: Công nghệ trồng cây không dùng đất (trang 125)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Giới thiệu về trồng trọt công nghệ cao',
        subItems: [
          'Khái niệm: Là nền trồng trọt được ứng dụng kết hợp những công nghệ mới, tiên tiến để sản xuất nhằm nâng cao hiệu quả, tạo bước đột phá về năng suất, chất lượng nông sản.',
          'Ưu điểm và hạn chế: Ưu điểm (chủ động sản xuất không phụ thuộc thời tiết, tiết kiệm đất/nước/phân bón, năng suất và chất lượng cao, an toàn thực phẩm); Hạn chế (chi phí đầu tư ban đầu rất lớn, đòi hỏi nhân lực trình độ kĩ thuật cao).',
        ],
      },
      {
        branchNumber: 2,
        title: 'Một số công nghệ cao trong trồng trọt',
        subItems: [
          'Công nghệ nhà kính: Nhà kính đơn giản (khung tre/gỗ/sắt, mái nilon, tuổi thọ 5–10 năm), Nhà kính liên hoàn (khung thép mạ kẽm nối tiếp nhau, tuổi thọ 10–15 năm), Nhà kính hiện đại (mái kính hoặc nhựa thông minh, điều khiển vi khí hậu tự động, tuổi thọ > 15 năm).',
          'Công nghệ tưới nước tự động, tiết kiệm: Tưới nhỏ giọt (tiết kiệm nước nhất, đưa nước + phân bón trực tiếp tới vùng rễ), Tưới phun sương (làm mát và tăng ẩm độ nhà màng, vườn lan, vườn ươm), Tưới phun mưa (tạo hạt mưa nhân tạo cho cây ăn quả, cà phê, rau màu).',
          'Công nghệ IoT (Internet vạn vật): Thu thập dữ liệu từ cảm biến (nhiệt độ, độ ẩm, ánh sáng, pH, EC) gửi về điện thoại/máy tính để phân tích và điều khiển thiết bị tự động trong canh tác chính xác và nhà kính thông minh.',
        ],
      },
      {
        branchNumber: 3,
        title: 'Một số mô hình trồng cây không dùng đất',
        subItems: [
          'Mô hình thủy canh (Hydroponics): Trồng cây trong dung dịch dinh dưỡng, gồm Thủy canh không hồi lưu (thủy canh tĩnh – dung dịch đứng yên trong thùng xốp/khay) và Thủy canh hồi lưu (thủy canh động – dùng máy bơm tuần hoàn dung dịch qua các ống nhựa, phổ biến là kĩ thuật màng dinh dưỡng NFT).',
          'Mô hình khí canh (Aeroponics): Rễ cây lơ lửng trong không khí tối kín, dung dịch dinh dưỡng được phun dưới dạng sương mù trực tiếp vào bộ rễ định kì vài phút một lần (tiết kiệm tới 95–98% nước và 95% phân bón).',
        ],
      },
    ],
    coreSummary: [
      'Hai chỉ số quan trọng nhất khi pha và kiểm tra dung dịch dinh dưỡng thủy canh/khí canh: Độ pH (thường duy trì từ 5,5 đến 6,5) và Nồng độ chất rắn hòa tan / Độ dẫn điện (TDS / EC, tính bằng ppm hoặc mS/cm tùy loại cây và giai đoạn sinh trưởng).',
      'So sánh thủy canh và khí canh: Khí canh cung cấp oxygen cho bộ rễ tối đa vì rễ lơ lửng trong không khí và tiết kiệm nước hơn thủy canh, nhưng nếu mất điện ngừng phun sương lâu thì rễ cây dễ bị khô héo nhanh.',
    ],
    questions: [
      {
        number: 1,
        question: 'Thế nào là trồng trọt công nghệ cao? Trình bày ưu điểm và hạn chế của trồng trọt công nghệ cao.',
        answer: [
          'Khái niệm: Trồng trọt công nghệ cao là nền trồng trọt ứng dụng đồng bộ các công nghệ tiên tiến (tự động hóa, CNTT, công nghệ sinh học, vật liệu mới...) vào sản xuất để nâng cao năng suất, chất lượng và hiệu quả kinh tế.',
          'Ưu điểm: Cách li sâu bệnh và thời tiết bất lợi, tiết kiệm tài nguyên (đất, nước, phân bón, thuốc BVTV), nâng cao năng suất và chất lượng đồng đều, an toàn vệ sinh thực phẩm. Hạn chế: Vốn đầu tư xây dựng hạ tầng lớn, chi phí điện năng và bảo trì cao, yêu cầu người lao động có trình độ chuyên môn cao.',
        ],
      },
      {
        number: 2,
        question: 'Nêu các loại nhà kính phổ biến. Trình bày đặc điểm, ưu và nhược điểm của từng loại nhà kính trong trồng trọt công nghệ cao.',
        answer: [
          'Nhà kính đơn giản (nhà màng): Khung sắt/tre phủ màng PE, tuổi thọ 5–10 năm; chi phí thấp, dễ lắp đặt nhưng khả năng điều chỉnh nhiệt độ kém và chịu bão yếu.',
          'Nhà kính liên hoàn: Nhiều nhà kính ghép liền nhau bằng khung thép mạ kẽm, có cửa thông gió mái và quạt đối lưu, tuổi thọ 10–15 năm; tiết kiệm diện tích, thông thoáng tốt, chi phí trung bình.',
          'Nhà kính hiện đại: Lợp kính cường lực hoặc tấm nhựa polycarbonate, tích hợp hệ thống sưởi, làm mát, rèm cắt nắng, cảm biến IoT tự động hoàn toàn, tuổi thọ > 15 năm; kiểm soát tối ưu mọi yếu tố vi khí hậu nhưng chi phí đầu tư rất đắt.',
        ],
      },
      {
        number: 3,
        question: 'So sánh các phương pháp tưới nước tự động trong trồng trọt.',
        answer: [
          'Tưới nhỏ giọt: Đưa nước dưới dạng từng giọt tới thẳng gốc cây; tiết kiệm nước nhất (30–60%), hạn chế cỏ dại, kết hợp châm phân dễ dàng nhưng đầu nhỏ giọt dễ bị tắc nếu nước không được lọc kĩ.',
          'Tưới phun sương: Phun nước qua béc áp suất cao tạo hạt sương cực mịn; làm mát nhanh và tăng độ ẩm không khí rất tốt (thích hợp cho hoa lan, nấm, vườn ươm giâm cành) nhưng lượng nước thấm xuống đất ít và dễ bị gió thổi bay.',
          'Tưới phun mưa: Tạo tia nước bắn xoay tròn như mưa; làm sạch bụi trên lá, thích hợp cho rau ăn lá ngoài đồng, chè, cà phê, cây ăn quả nhưng tốn nước hơn tưới nhỏ giọt và tạo điều kiện cho cỏ dại mọc.',
        ],
      },
      {
        number: 4,
        question: 'Trình bày ứng dụng của công nghệ IoT trong trồng trọt. Liên hệ với thực tiễn sản xuất ở Việt Nam.',
        answer: [
          'Ứng dụng IoT: Hệ thống cảm biến đo liên tục các thông số môi trường (nhiệt độ, độ ẩm đất/không khí, cường độ sáng, pH, EC), truyền dữ liệu qua đám mây về phần mềm điều khiển trung tâm để tự động bật/tắt máy bơm tưới, quạt thông gió, rèm che nắng, đèn chiếu sáng mà không cần con người có mặt trực tiếp.',
          'Liên hệ ở Việt Nam: Được ứng dụng rộng rãi tại các trang trại trồng dưa lưới, dâu tây, cà chua cherry, hoa cúc, hoa lan ở Đà Lạt (Lâm Đồng), Mộc Châu (Sơn La) và các nông trại thông minh ven đô Hà Nội, TP.HCM.',
        ],
      },
      {
        number: 5,
        question: 'Phân biệt kĩ thuật thủy canh không hồi lưu, thủy canh hồi lưu và khí canh trong trồng cây không dùng đất.',
        answer: [
          'Thủy canh không hồi lưu (thủy canh tĩnh): Dung dịch dinh dưỡng chứa cố định trong thùng/chậu, một phần rễ ngập trong dung dịch, phần trên nằm trong khoảng không khí để hô hấp, không dùng máy bơm tuần hoàn.',
          'Thủy canh hồi lưu (thủy canh động): Dùng máy bơm đưa dung dịch dinh dưỡng chảy tuần hoàn liên tục qua các máng/ống trồng cây rồi thu hồi về bể chứa trung tâm, giúp bổ sung oxygen hòa tan đều hơn.',
          'Khí canh: Rễ cây treo lơ lửng hoàn toàn trong buồng kín tối, không ngâm trong nước mà được hệ thống vòi phun sương tự động phun dung dịch dinh dưỡng trực tiếp vào bộ rễ theo chu kì.',
        ],
      },
    ],
  },
  {
    id: 'cn10-c8',
    grade: '10',
    bookTitle: 'Công nghệ 10 – Công nghệ Trồng trọt',
    domain: 'crop',
    chapterNumber: 'Chương VIII',
    chapterTitle: 'Bảo vệ môi trường trong trồng trọt',
    pageRef: 'Ôn tập Chương VIII – Trang 142 SGK Công nghệ 10',
    lessons: [
      'Bài 26: Sự cần thiết phải bảo vệ môi trường trong trồng trọt (trang 134)',
      'Bài 27: Ứng dụng công nghệ vi sinh trong bảo vệ môi trường trồng trọt (trang 137)',
      'Bài 28: Thực hành: Tạo chế phẩm vi sinh vật từ chất thải trồng trọt (trang 141)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Sự cần thiết phải bảo vệ môi trường trong trồng trọt',
        subItems: [
          'Khái niệm ô nhiễm môi trường trong trồng trọt: Là sự biến đổi tính chất vật lí, hóa học, sinh học của môi trường đất, nước, không khí do hoạt động trồng trọt gây ảnh hưởng xấu tới sức khỏe con người và sinh vật.',
          'Nguyên nhân gây ô nhiễm: Lạm dụng thuốc bảo vệ thực vật và phân bón hóa học; thu gom, xử lí chất thải trồng trọt không đúng quy định (vứt bao bì thuốc BVTV bừa bãi, đốt rơm rạ ngoài đồng).',
          'Ảnh hưởng của ô nhiễm: Thoái hóa đất, ô nhiễm nguồn nước ngầm và nước mặt (gây phú dưỡng), phát thải khí nhà kính (CO2, CH4, N2O), suy giảm đa dạng sinh học và mất an toàn thực phẩm.',
          'Một số biện pháp hạn chế: Nâng cao nhận thức, sử dụng phân bón và thuốc BVTV hợp lí (ưu tiên phân hữu cơ, vi sinh, chế phẩm sinh học), thu gom và xử lí phụ phẩm trồng trọt.',
        ],
      },
      {
        branchNumber: 2,
        title: 'Ứng dụng công nghệ vi sinh trong xử lí chất thải trồng trọt và bảo vệ môi trường',
        subItems: [
          'Sản xuất phân bón hữu cơ vi sinh từ chất thải trồng trọt (5 bước): Chuẩn bị nguyên liệu (phụ phẩm cây trồng + vôi + chế phẩm VSV) -> Phối trộn -> Ủ đống (đảo trộn khi nhiệt độ đạt 40–50 °C trong 42–45 ngày) -> Bổ sung VSV có ích -> Kiểm tra chất lượng, đóng gói.',
          'Sản xuất thức ăn ủ chua cho trâu, bò từ chất thải trồng trọt (3 bước): Chuẩn bị nguyên liệu (100 kg phụ phẩm băm nhỏ 3–5 cm, phơi héo còn 65–70% ẩm + 5 kg mật rỉ đường + 0,5–1 kg muối ăn + chế phẩm VSV lactic) -> Phối trộn -> Ủ yếm khí nén chặt trong túi/hố 1 tháng.',
          'Sử dụng rơm, rạ làm giá thể trồng nấm (3 bước): Ngâm rơm rạ trong nước vôi (0,3 kg vôi tôi / 100 L nước) -> Ủ đống và đảo trộn -> Đóng mô hoặc đóng bịch và cấy giống nấm rơm.',
        ],
      },
    ],
    coreSummary: [
      'Tuyệt đối không đốt rơm rạ trực tiếp trên đồng ruộng vì làm phát thải bụi mịn PM2.5, khí CO, CO2 gây ô nhiễm không khí, làm chết vi sinh vật có ích trên mặt đất và lãng phí nguồn chất hữu cơ.',
      'Trong ủ chua thức ăn xanh từ phụ phẩm trồng trọt (thân cây ngô, ngọn mía, cỏ voi): Vi khuẩn lactic lên men yếm khí chuyển hóa đường thành acid lactic làm giảm pH xuống khoảng 3,8–4,2 giúp ức chế vi khuẩn gây thối và bảo quản thức ăn lâu dài.',
    ],
    questions: [
      {
        number: 1,
        question: 'Thế nào là ô nhiễm môi trường trong trồng trọt? Nêu nguyên nhân gây ô nhiễm môi trường trong trồng trọt và tác hại của nó.',
        answer: [
          'Khái niệm: Là sự thay đổi tiêu cực các thành phần đất, nước, không khí trong khu vực canh tác vượt ngưỡng cho phép do hoạt động trồng trọt gây ra.',
          'Nguyên nhân: Lạm dụng phân bón hóa học và thuốc BVTV hóa học; vứt vỏ bao bì thuốc BVTV xuống kênh mương; đốt rơm rạ và phụ phẩm nông nghiệp sau thu hoạch.',
          'Tác hại: Làm đất chua, chai cứng, mất hệ vi sinh vật có ích; gây ô nhiễm nguồn nước mặt và nước ngầm; gây ngộ độc thực phẩm, bệnh hiểm nghèo cho người sản xuất và người tiêu dùng.',
        ],
      },
      {
        number: 2,
        question: 'Trình bày một số biện pháp hạn chế ô nhiễm môi trường trong trồng trọt.',
        answer: [
          'Tuyên truyền, nâng cao ý thức bảo vệ môi trường cho người dân.',
          'Giảm dần phân hóa học và thuốc BVTV hóa học; tăng cường sử dụng phân hữu cơ, phân vi sinh, thuốc BVTV sinh học và áp dụng IPM, VietGAP, nông nghiệp hữu cơ.',
          'Thu gom bao bì thuốc BVTV vào bể chứa chuyên dụng để tiêu hủy đúng quy định; thu gom rơm rạ, thân ngô, vỏ cà phê để ủ phân hữu cơ vi sinh, trồng nấm hoặc ủ chua làm thức ăn chăn nuôi.',
        ],
      },
      {
        number: 3,
        question: 'Nêu vai trò của vi sinh vật trong xử lí chất thải trồng trọt. Trình bày các bước sản xuất phân bón hữu cơ vi sinh và thức ăn ủ chua cho chăn nuôi từ chất thải trồng trọt.',
        answer: [
          'Vai trò của VSV: Tiết hệ enzyme (cellulase, amylase, protease...) phân giải nhanh cellulose, hemicellulose, lignin trong phụ phẩm thực vật thành chất mùn, hoặc lên men tạo acid hữu cơ bảo quản thức ăn và tiêu diệt mầm bệnh.',
          'Quy trình sản xuất phân hữu cơ vi sinh (5 bước): Chuẩn bị và băm nhỏ phụ phẩm -> Phối trộn với chế phẩm VSV phân giải cellulose và tưới ẩm 55–65% -> Đánh đống ủ có che phủ và đảo trộn định kì trong 42–45 ngày -> Bổ sung VSV chức năng (cố định đạm, phân giải lân) -> Kiểm tra và đóng bao.',
          'Quy trình ủ chua thức ăn cho gia súc (3 bước): Băm nhỏ phụ phẩm 3–5 cm, phơi héo đạt độ ẩm 65–70% -> Phối trộn đều với muối ăn (0,5–1%), mật rỉ đường (5%) và chế phẩm vi khuẩn lactic -> Nén thật chặt trong túi nilon hoặc hố ủ kín khí (yếm khí), buộc chặt miệng túi ủ sau 3–4 tuần là dùng được.',
        ],
      },
      {
        number: 4,
        question: 'Quan sát hoạt động trồng trọt ở địa phương, nêu những việc làm gây ô nhiễm môi trường trồng trọt và đề xuất biện pháp khắc phục.',
        answer: [
          'Việc làm gây ô nhiễm: Đốt đồng rơm rạ sau vụ gặt; rửa bình bơm thuốc sâu trực tiếp dưới mương nước; bón thừa phân đạm.',
          'Biện pháp khắc phục: Dùng chế phẩm vi sinh (Trichoderma, Sumitri) phun trực tiếp lên gốc rạ ngoài đồng để phân hủy nhanh thành phân bón hoặc thu cuộn rơm để trồng nấm rơm; xây dựng bể thu gom vỏ bao bì thuốc BVTV tại đầu bờ ruộng.',
        ],
      },
    ],
  },

  // ============================================================================
  // SÁCH 2: CÔNG NGHỆ 11 - CÔNG NGHỆ CHĂN NUÔI (6 CHƯƠNG)
  // ============================================================================
  {
    id: 'cn11-c1',
    grade: '11',
    bookTitle: 'Công nghệ 11 – Công nghệ Chăn nuôi',
    domain: 'husbandry',
    chapterNumber: 'Chương I',
    chapterTitle: 'Giới thiệu chung về chăn nuôi',
    pageRef: 'Ôn tập Chương I – Trang 18 SGK Công nghệ 11',
    lessons: [
      'Bài 1: Vai trò và triển vọng của chăn nuôi (trang 6)',
      'Bài 2: Vật nuôi và phương thức chăn nuôi (trang 11)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Vai trò, triển vọng và thành tựu nổi bật của chăn nuôi',
        subItems: [
          'Vai trò của chăn nuôi: Cung cấp thực phẩm giàu dinh dưỡng (thịt, trứng, sữa); cung cấp nguyên liệu cho công nghiệp chế biến, dược phẩm và xuất khẩu; cung cấp sức kéo; cung cấp phân bón hữu cơ cho trồng trọt.',
          'Thành tựu nổi bật: Công tác giống (thụ tinh nhân tạo, cấy truyền phôi, xác định giới tính phôi); Nuôi dưỡng – chăm sóc tự động hóa (gắn chip điện tử, robot vắt sữa, chuồng kín lạnh); Bảo vệ môi trường (biogas, đệm lót sinh học).',
          'Triển vọng của chăn nuôi: Phát triển theo hướng công nghiệp, hiện đại hóa, ứng dụng công nghệ cao 4.0, chăn nuôi hữu cơ và an toàn sinh học.',
        ],
      },
      {
        branchNumber: 2,
        title: 'Phân loại vật nuôi',
        subItems: [
          'Theo nguồn gốc: Vật nuôi bản địa (gà Đông Tảo, gà Hồ, lợn Móng Cái, lợn ỉ, lợn Ba Xuyên, cừu Phan Rang) và Vật nuôi ngoại nhập (bò Red Sindhi, bò Hà Lan HF, dê Boer, lợn Yorkshire, lợn Landrace).',
          'Theo đặc tính sinh vật học: Gia súc (thú có vú đẻ con: ăn cỏ nhai lại như trâu, bò, dê, cừu; ăn tạp dạ dày đơn như lợn) và Gia cầm (động vật có lông vũ đẻ trứng: gà, vịt, ngan, ngỗng, chim cút).',
          'Theo mục đích sử dụng: Vật nuôi chuyên dụng (chuyên thịt như bò BBB, chuyên sữa như bò HF, chuyên trứng như gà Leghorn) và Vật nuôi kiêm dụng (thịt – trứng, thịt – sữa, thịt – cày kéo).',
        ],
      },
      {
        branchNumber: 3,
        title: 'Phương thức chăn nuôi',
        subItems: [
          'Chăn thả tự do: Vật nuôi tự đi kiếm ăn ngoài tự nhiên, đầu tư thấp, thịt thơm ngon nhưng năng suất thấp, phụ thuộc tự nhiên và khó kiểm soát dịch bệnh.',
          'Chăn nuôi công nghiệp (thâm canh): Nuôi nhốt hoàn toàn trong chuồng trại hiện đại với mật độ cao, thức ăn công nghiệp hoàn chỉnh, năng suất cao nhưng vốn đầu tư lớn và cần xử lí chất thải nghiêm ngặt.',
          'Chăn nuôi bán công nghiệp (bán thâm canh): Kết hợp chuồng nuôi với sân chơi/bãi chăn thả có rào chắn, sử dụng thức ăn công nghiệp kết hợp thức ăn tự nhiên tại chỗ.',
        ],
      },
      {
        branchNumber: 4,
        title: 'Xu hướng phát triển của chăn nuôi',
        subItems: [
          'Chăn nuôi bền vững: Hài hòa giữa hiệu quả kinh tế, công bằng xã hội và bảo vệ môi trường sinh thái.',
          'Chăn nuôi thông minh: Ứng dụng cảm biến IoT, AI, tự động hóa trong chuồng nuôi và liên kết chuỗi giá trị "5 nhà" (Nhà nước – Nhà nông – Nhà khoa học – Nhà doanh nghiệp – Nhà ngân hàng).',
        ],
      },
    ],
    coreSummary: [
      'Ưu điểm của các giống vật nuôi bản địa Việt Nam (lợn Móng Cái, gà Hồ, gà Đông Tảo): Thích nghi rất tốt với khí hậu nhiệt đới nóng ẩm, sức kháng bệnh cao, tận dụng tốt thức ăn nghèo dinh dưỡng, chất lượng thịt thơm ngon đặc trưng, nhưng năng suất thấp và tỉ lệ mỡ cao hơn giống ngoại.',
      'Chăn nuôi bền vững phải đáp ứng đồng thời các khía cạnh: Năng suất và hiệu quả kinh tế cao, bảo vệ môi trường (kinh tế tuần hoàn), an toàn dịch bệnh – an toàn thực phẩm và đảm bảo phúc lợi động vật (đối xử nhân đạo với vật nuôi).',
    ],
    questions: [
      {
        number: 1,
        question: 'Nêu vai trò và triển vọng của ngành chăn nuôi trong bối cảnh cuộc cách mạng công nghiệp 4.0.',
        answer: [
          'Vai trò: Cung cấp thực phẩm thiết yếu giàu đạm (thịt, trứng, sữa) cho con người; cung cấp phân hữu cơ cho trồng trọt; cung cấp nguyên liệu cho công nghiệp chế biến da, lông, dược phẩm và phục vụ xuất khẩu.',
          'Triển vọng trong CMCN 4.0: Chuyển dịch từ chăn nuôi nông hộ nhỏ lẻ sang chăn nuôi trang trại quy mô lớn, khép kín, ứng dụng công nghệ cao (chuồng kín điều hòa vi khí hậu, chip RFID quản lí từng cá thể, robot cho ăn và vắt sữa, công nghệ sinh học giống và vaccine thế hệ mới).',
        ],
      },
      {
        number: 2,
        question: 'Những nhận định về thành tựu của ngành chăn nuôi dưới đây là đúng hay sai? Giải thích.\na) Hiện nay ngành chăn nuôi đã tạo ra được nhiều giống vật nuôi có năng suất chất lượng cao.\nb) Quy mô chăn nuôi ngày càng lớn nên làm ô nhiễm môi trường ngày càng nặng nề.\nc) Chưa có công nghệ hiện đại xử lí chất thải chăn nuôi để làm giảm ô nhiễm môi trường.\nd) Nhiều thiết bị công nghệ hiện đại được đưa vào chăn nuôi giải phóng sức lao động.',
        answer: [
          'a) ĐÚNG – Nhờ ứng dụng chọn giống bằng chỉ thị phân tử (MAS), lai tạo, thụ tinh nhân tạo và cấy truyền phôi đã tạo ra nhiều giống vật nuôi năng suất, chất lượng cao.',
          'b) SAI – Tuy quy mô lớn phát sinh nhiều chất thải nhưng nhờ quy hoạch xa khu dân cư và áp dụng công nghệ xử lí chất thải hiện đại (biogas, đệm lót sinh học, ủ compost, kinh tế tuần hoàn) nên ô nhiễm được kiểm soát.',
          'c) SAI – Hiện nay đã có nhiều công nghệ hiện đại xử lí chất thải chăn nuôi như hầm biogas phát điện, máy ép tách phân rắn – lỏng, chế phẩm vi sinh và đệm lót sinh học.',
          'd) ĐÚNG – Các hệ thống máng ăn tự động, núm uống tự động, băng chuyền thu trứng, robot vắt sữa, cảm biến nhiệt ẩm đã giúp giải phóng sức lao động của con người.',
        ],
      },
      {
        number: 3,
        question: 'Trình bày cơ sở để phân loại vật nuôi. Vật nuôi được phân thành những loại nào?',
        answer: [
          'Dựa vào nguồn gốc: Vật nuôi bản địa (địa phương) và vật nuôi ngoại nhập.',
          'Dựa vào đặc tính sinh vật học: Nhóm gia súc (động vật có vú: gia súc nhai lại và gia súc dạ dày đơn) và nhóm gia cầm (động vật có lông vũ đẻ trứng: thủy cầm và gia cầm trên cạn).',
          'Dựa vào mục đích sử dụng (hướng sản xuất): Vật nuôi chuyên dụng (chuyên thịt, chuyên trứng, chuyên sữa) và vật nuôi kiêm dụng.',
        ],
      },
      {
        number: 4,
        question: 'Nêu tên và đặc điểm một số giống vật nuôi phổ biến ở Việt Nam.',
        answer: [
          'Gà Đông Tảo (Hưng Yên): Thân hình to, đôi chân to xù xì màu đỏ, thịt thơm ngon giòn.',
          'Lợn Móng Cái (Quảng Ninh): Lưng hơi võng, lông đen trắng có đám trắng hình yên ngựa vắt qua vai, đẻ sai (12–14 con/lứa), nuôi con khéo, chịu kham khổ tốt.',
          'Bò vàng Việt Nam: Tầm vóc nhỏ, lông vàng mịn, chịu nóng ẩm và kháng kí sinh trùng tốt; Bò lai Sind và bò sữa Hà Lan (HF): lông loang trắng đen, năng suất sữa rất cao.',
        ],
      },
      {
        number: 5,
        question: 'So sánh ưu điểm, nhược điểm của các phương thức chăn nuôi phổ biến ở nước ta.',
        answer: [
          'Chăn thả tự do: Ưu điểm là vốn đầu tư thấp, tận dụng thức ăn tự nhiên, thịt chắc thơm; Nhược điểm là năng suất thấp, thời gian nuôi dài, nguy cơ lây lan dịch bệnh cao.',
          'Chăn nuôi công nghiệp: Ưu điểm là năng suất rất cao, sản phẩm đồng đều, chủ động kiểm soát dịch bệnh và thời tiết; Nhược điểm là vốn đầu tư lớn, đòi hỏi kĩ thuật cao, nếu không xử lí tốt chất thải dễ gây ô nhiễm cục bộ.',
          'Chăn nuôi bán công nghiệp: Kết hợp ưu điểm của cả hai phương thức trên, vật nuôi được vận động nên sức đề kháng tốt, chi phí vừa phải, phù hợp với hộ gia đình và trang trại vừa.',
        ],
      },
      {
        number: 6,
        question: 'Trình bày những đặc điểm chính của chăn nuôi bền vững và chăn nuôi thông minh.',
        answer: [
          'Chăn nuôi bền vững: Khai thác hợp lí tài nguyên, tái sử dụng phụ phẩm và chất thải theo mô hình kinh tế tuần hoàn (Vườn – Ao – Chuồng – Biogas), đảm bảo an toàn sinh học, phúc lợi động vật và lợi ích kinh tế lâu dài.',
          'Chăn nuôi thông minh: Ứng dụng công nghệ số (IoT, AI, Big Data, Blockchain truy xuất nguồn gốc, tự động hóa chuồng nuôi) để giám sát sức khỏe từng cá thể vật nuôi và tối ưu hóa chi phí thức ăn, năng lượng.',
        ],
      },
    ],
  },
  {
    id: 'cn11-c2',
    grade: '11',
    bookTitle: 'Công nghệ 11 – Công nghệ Chăn nuôi',
    domain: 'husbandry',
    chapterNumber: 'Chương II',
    chapterTitle: 'Công nghệ giống vật nuôi',
    pageRef: 'Ôn tập Chương II – Trang 37 SGK Công nghệ 11',
    lessons: [
      'Bài 3: Khái niệm, vai trò của giống trong chăn nuôi (trang 19)',
      'Bài 4: Chọn giống vật nuôi (trang 23)',
      'Bài 5: Nhân giống vật nuôi (trang 27)',
      'Bài 6: Ứng dụng công nghệ sinh học trong chọn và nhân giống vật nuôi (trang 32)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Khái niệm, vai trò của giống trong chăn nuôi',
        subItems: [
          'Khái niệm: Là quần thể vật nuôi cùng loài, cùng nguồn gốc, có ngoại hình và cấu trúc di truyền tương tự nhau, hình thành, củng cố và phát triển do tác động của con người.',
          'Điều kiện để được công nhận là một giống vật nuôi: (1) Có chung nguồn gốc; (2) Có ngoại hình và năng suất giống nhau; (3) Có tính di truyền ổn định; (4) Đạt số lượng cá thể nhất định (gia cầm >= 10.000 con, lợn >= 5.000 con, trâu/bò/ngựa >= 300 con) và được Hội đồng Giống Quốc gia công nhận.',
          'Vai trò của giống trong chăn nuôi: Quyết định năng suất và chất lượng sản phẩm chăn nuôi.',
        ],
      },
      {
        branchNumber: 2,
        title: 'Chọn giống và nhân giống vật nuôi',
        subItems: [
          'Chỉ tiêu chọn giống: Ngoại hình, thể chất, sinh trưởng – phát dục, khả năng sản xuất.',
          'Phương pháp chọn giống: Chọn lọc hàng loạt (dựa vào kiểu hình cá thể so với tiêu chuẩn, nhanh và đơn giản) và Chọn lọc cá thể (kiểm tra qua 3 bước: Tổ tiên -> Bản thân -> Đời con, độ chính xác cao dùng chọn đực giống).',
          'Phương pháp nhân giống: Nhân giống thuần chủng (cho giao phối đực và cái cùng giống để bảo tồn, tăng số lượng) và Lai giống (cho giao phối đực và cái khác giống gồm: Lai kinh tế đơn giản 2 giống / phức tạp >= 3 giống, Lai cải tiến, Lai cải tạo, Lai xa như Ngựa cái x Lừa đực -> Con la).',
        ],
      },
      {
        branchNumber: 3,
        title: 'Ứng dụng công nghệ sinh học trong chọn và nhân giống vật nuôi',
        subItems: [
          'Công nghệ cấy truyền phôi (MOET): Đưa phôi từ bò mẹ cho phôi (đã gây siêu bài noãn) sang bò mẹ nhận phôi (đã gây động dục đồng pha) gồm 11 bước.',
          'Công nghệ thụ tinh trong ống nghiệm (IVF): Hút trứng -> Nuôi chín trứng -> Thụ tinh với tinh trùng hoạt hóa trong ống nghiệm -> Nuôi cấy phôi rồi cấy vào thú nhận hoặc bảo quản lạnh trong nitrogen lỏng (-196 °C).',
          'Công nghệ xác định giới tính phôi: Lấy 1 vài tế bào phôi -> Tách DNA -> Nhân bản đoạn gene đặc hiệu nhiễm sắc thể giới tính Y bằng PCR -> Điện di trên gel agarose (5 bước).',
          'Ứng dụng công nghệ phân tử (MAS): Chọn giống dựa trên chỉ thị phân tử DNA liên kết với gene quy định tính trạng quý (như gene Halothane ở lợn, gene DGAT1 tạo sữa ở bò, gene kháng E.coli).',
        ],
      },
    ],
    coreSummary: [
      'Lưu ý quan trọng về Lai kinh tế: Toàn bộ con lai F1 trong lai kinh tế đều dùng để nuôi thương phẩm (lấy thịt, trứng), KHÔNG dùng làm giống nhân tiếp vì đời sau sẽ bị phân li tính trạng và giảm ưu thế lai.',
      'Điều kiện bắt buộc trong Cấy truyền phôi: Thú cho phôi và thú nhận phôi phải có trạng thái sinh lí sinh dục ĐỒNG PHA (cùng giai đoạn chu kì động dục). Thú nhận phôi chỉ đóng vai trò mang thai hộ, không truyền đặc điểm di truyền cho con sinh ra.',
    ],
    questions: [
      {
        number: 1,
        question: 'Nêu khái niệm giống vật nuôi, điều kiện để công nhận giống vật nuôi và phân tích vai trò của giống trong chăn nuôi.',
        answer: [
          'Khái niệm: Giống vật nuôi là quần thể vật nuôi cùng loài, cùng nguồn gốc, có ngoại hình và cấu trúc di truyền tương tự nhau, do con người tạo ra.',
          'Điều kiện công nhận: Có nguồn gốc chung, đặc điểm ngoại hình – năng suất đồng nhất, di truyền ổn định cho đời sau, đủ số lượng cá thể (ví dụ >= 300 con trâu bò, >= 5.000 con lợn, >= 10.000 con gia cầm) và được Hội đồng Giống Quốc gia công nhận.',
          'Vai trò: Giống là yếu tố tiền đề quyết định năng suất (tốc độ tăng khối lượng, sản lượng trứng/sữa, hệ số tiêu tốn thức ăn FCR) và chất lượng sản phẩm (tỉ lệ nạc, hàm lượng bơ sữa, hương vị thịt).',
        ],
      },
      {
        number: 2,
        question: 'So sánh phương pháp chọn lọc hàng loạt và chọn lọc cá thể.',
        answer: [
          'Giống nhau: Đều nhằm chọn ra những cá thể có đặc tính tốt phù hợp với mục tiêu chăn nuôi để làm giống.',
          'Khác nhau: Chọn lọc hàng loạt chỉ dựa vào chỉ tiêu ngoại hình và khả năng sản xuất của bản thân con vật so với tiêu chuẩn để chọn một nhóm lớn (đơn giản, ít tốn kém nhưng độ chính xác kiểu gene thấp, thường dùng chọn cái sinh sản); Chọn lọc cá thể đánh giá toàn diện qua 3 bước (Tổ tiên -> Bản thân -> Kiểm tra phẩm chất giống qua đời sau), độ chính xác rất cao nhưng tốn thời gian và kinh phí, chủ yếu dùng để chọn lọc đực giống đầu dòng.',
        ],
      },
      {
        number: 3,
        question: 'Phân biệt phương pháp nhân giống thuần chủng và phương pháp lai giống.',
        answer: [
          'Nhân giống thuần chủng: Cho giao phối giữa con đực và con cái thuộc CÙNG một giống để tạo ra đời con mang 100% máu của giống đó; mục đích là củng cố, duy trì độ đồng nhất di truyền và bảo tồn các giống quý hiếm.',
          'Lai giống: Cho giao phối giữa con đực và con cái thuộc HAI HAY NHIỀU giống khác nhau; mục đích là tạo biến dị tổ hợp, khai thác ưu thế lai (lai kinh tế), bổ sung tính trạng tốt (lai cải tiến) hoặc thay đổi cơ bản giống địa phương năng suất thấp (lai cải tạo).',
        ],
      },
      {
        number: 4,
        question: 'Một trang trại nuôi lợn thịt muốn tăng hiệu quả chăn nuôi, cần có đàn lợn con có khả năng sinh trưởng nhanh, tỉ lệ nạc cao đồng thời thích nghi tốt với điều kiện chăn nuôi của địa phương. Nếu được giao nhiệm vụ tạo đàn lợn con có các đặc điểm như trên, em sẽ sử dụng phương pháp nhân giống nào? Giải thích lí do lựa chọn của em.',
        answer: [
          'Phương pháp lựa chọn: Sử dụng phương pháp LAI KINH TẾ (cho lợn cái bản địa như lợn Móng Cái phối giống với lợn đực ngoại cao sản như Yorkshire hoặc Landrace, hoặc lai kinh tế 3 giống với đực cuối Duroc).',
          'Giải thích: Con lai F1 sẽ thừa hưởng khả năng thích nghi tốt, chống chịu bệnh tật và tận dụng thức ăn của lợn mẹ địa phương, đồng thời thừa hưởng tốc độ lớn nhanh, tỉ lệ nạc cao của lợn bố ngoại và biểu hiện ưu thế lai vượt trội để nuôi lấy thịt thương phẩm hiệu quả cao.',
        ],
      },
      {
        number: 5,
        question: 'Nêu khái niệm và ý nghĩa ứng dụng công nghệ sinh học trong chọn và nhân giống vật nuôi (cấy truyền phôi, thụ tinh trong ống nghiệm, xác định giới tính phôi, chọn giống bằng chỉ thị phân tử).',
        answer: [
          'Cấy truyền phôi: Nhân nhanh số lượng con từ những cá thể cái cao sản quý hiếm (1 bò cái tốt có thể cho 15–20 bê con/năm thay vì 1 bê/năm) và thuận lợi vận chuyển giống quốc tế dưới dạng phôi đông lạnh.',
          'Thụ tinh trong ống nghiệm (IVF): Tận dụng tối đa nguồn tế bào trứng từ buồng trứng vật nuôi cao sản kết hợp với tinh trùng đã phân giới tính để tạo hàng loạt phôi chất lượng cao.',
          'Xác định giới tính phôi: Chủ động chọn phôi cái khi nuôi bò sữa hoặc chọn phôi đực khi nuôi bò thịt trước khi cấy vào bò nhận, nâng cao hiệu quả kinh tế.',
          'Chọn giống bằng chỉ thị phân tử (MAS): Sàng lọc chính xác kiểu gene ngay từ khi vật nuôi còn sơ sinh hoặc giai đoạn phôi mà không bị ảnh hưởng bởi môi trường, rút ngắn đáng kể thời gian chọn tạo giống mới.',
        ],
      },
    ],
  },
  {
    id: 'cn11-c3',
    grade: '11',
    bookTitle: 'Công nghệ 11 – Công nghệ Chăn nuôi',
    domain: 'husbandry',
    chapterNumber: 'Chương III',
    chapterTitle: 'Công nghệ thức ăn chăn nuôi',
    pageRef: 'Ôn tập Chương III – Trang 58 SGK Công nghệ 11',
    lessons: [
      'Bài 7: Dinh dưỡng và thức ăn chăn nuôi (trang 38)',
      'Bài 8: Sản xuất và chế biến thức ăn chăn nuôi (trang 45)',
      'Bài 9: Bảo quản thức ăn chăn nuôi (trang 52)',
      'Bài 10: Thực hành: Chế biến, bảo quản thức ăn cho vật nuôi (trang 56)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Nhu cầu dinh dưỡng, tiêu chuẩn ăn, khẩu phần ăn và các nhóm thức ăn chăn nuôi',
        subItems: [
          'Khái niệm nhu cầu dinh dưỡng (nhu cầu duy trì sự sống và nhu cầu sản xuất tạo thịt, trứng, sữa, thai, sức kéo).',
          'Tiêu chuẩn ăn (quy định mức ăn cụ thể hàng ngày về năng lượng, protein, khoáng, vitamin) và Khẩu phần ăn (lượng thức ăn cụ thể cung cấp trong 1 ngày đêm thỏa mãn tiêu chuẩn ăn, đảm bảo tính khoa học và tính kinh tế).',
          'Các nhóm thức ăn chăn nuôi: Thức ăn giàu năng lượng (ngô, cám gạo, thóc, sắn; ME >= 2500 kcal/kg, xơ thô < 18%, protein thô < 20%); Thức ăn giàu protein (khô dầu đậu tương, bột cá, bột thịt xương; protein thô >= 20%); Thức ăn giàu khoáng; Thức ăn giàu vitamin; Thức ăn thô xanh (cỏ tươi, rơm rạ, xơ thô > 18%) và Phụ gia thức ăn.',
        ],
      },
      {
        branchNumber: 2,
        title: 'Sản xuất và chế biến thức ăn chăn nuôi',
        subItems: [
          'Sản xuất thức ăn: Thức ăn truyền thống, thức ăn hỗn hợp hoàn chỉnh (dạng bột 4 bước; dạng viên 6 bước có công đoạn hấp nhiệt hơi nước làm hồ hóa tinh bột và ép viên) và thức ăn đậm đặc.',
          'Phương pháp chế biến thức ăn: Chế biến vật lí (cắt ngắn 2–3 cm, nghiền nhỏ, nấu chín/rang khử chất phản dinh dưỡng như antitrypsin trong đậu tương sống, HCN trong sắn, solanin trong khoai tây mầm); Chế biến hóa học (đường hóa tinh bột bằng mầm thóc; kiềm hóa rơm rạ bằng urea 4% hoặc nước vôi làm mềm lignin – cellulose); Chế biến bằng vi sinh vật (ủ chua thức ăn xanh 4 bước và lên men thức ăn giàu tinh bột thành thức ăn giàu protein đơn bào bằng nấm men Saccharomyces).',
          'Ứng dụng công nghệ cao trong chế biến: Dây chuyền tự động hóa điều khiển bằng máy tính, công nghệ ép đùn (Extrusion).',
        ],
      },
      {
        branchNumber: 3,
        title: 'Bảo quản thức ăn chăn nuôi',
        subItems: [
          'Một số phương pháp bảo quản thông thường: Bảo quản trong kho (khô ráo, thông thoáng, kê trên kệ pallet cách mặt đất và tường); Bảo quản bằng phương pháp làm khô (phơi hoặc sấy đưa độ ẩm hạt về 10–15%).',
          'Ứng dụng công nghệ cao trong bảo quản: Bảo quản bằng kho silo kim loại khổng lồ (> 1000 tấn/silo, tự động nạp – xả, đo nhiệt ẩm, sục khí làm mát và xông khói diệt mọt); Sử dụng chất bảo quản sinh học có nguồn gốc tự nhiên (enzyme, bacteriocin/nisin kháng khuẩn thay thế hóa chất độc hại).',
        ],
      },
    ],
    coreSummary: [
      'Tại sao phải nấu chín hoặc rang hạt đậu tương (đậu nành) trước khi cho lợn, gà ăn? Vì trong hạt đậu tương sống có chứa enzyme ức chế trypsin (antitrypsin) làm vật nuôi không tiêu hóa được protein và gây tiêu chảy; xử lí nhiệt sẽ phá hủy chất phản dinh dưỡng này.',
      'Tại sao kiềm hóa rơm rạ bằng urea (4 kg urea + 80–100 L nước cho 100 kg rơm khô) chỉ dùng cho gia súc nhai lại (trâu, bò, dê, cừu)? Vì hệ vi sinh vật dạ cỏ của thú nhai lại có khả năng sử dụng nguồn nitơ phi protein (NPN) từ urea để tổng hợp protein vi sinh vật và tiêu hóa tốt cellulose.',
    ],
    questions: [
      {
        number: 1,
        question: 'Nêu khái niệm tiêu chuẩn ăn và khẩu phần ăn của vật nuôi. Cho ví dụ minh họa và phân tích các nguyên tắc phối hợp khẩu phần ăn cho vật nuôi.',
        answer: [
          'Tiêu chuẩn ăn là những quy định về mức ăn cần cung cấp cho một vật nuôi trong một ngày đêm để đáp ứng nhu cầu dinh dưỡng (năng lượng, protein, khoáng, vitamin). Khẩu phần ăn là tiêu chuẩn ăn đã được cụ thể hóa bằng các loại thức ăn xác định với khối lượng cụ thể (kg, g).',
          'Nguyên tắc phối hợp khẩu phần ăn: (1) Đảm bảo tính khoa học (đủ tiêu chuẩn dinh dưỡng, phù hợp đặc điểm sinh lí tiêu hóa của loài và lứa tuổi, ngon miệng, không chứa độc tố); (2) Đảm bảo tính kinh tế (tận dụng tối đa nguồn nguyên liệu sẵn có tại địa phương để giảm giá thành thức ăn).',
        ],
      },
      {
        number: 2,
        question: 'Trình bày thành phần dinh dưỡng chủ yếu và vai trò của từng nhóm thức ăn đối với vật nuôi.',
        answer: [
          'Nhóm giàu năng lượng (ngô, tấm, cám, sắn): Giàu tinh bột/glucid, cung cấp năng lượng trao đổi chủ yếu cho mọi hoạt động sống và tích lũy mỡ.',
          'Nhóm giàu protein (bột cá, khô dầu đậu tương, bột đậu): Cung cấp amino acid thiết yếu để xây dựng tế bào cơ (tạo thịt), tạo trứng, sữa và kháng thể miễn dịch.',
          'Nhóm giàu khoáng (bột vỏ sò, bột xương, đá vôi, muối ăn) & giàu vitamin (cỏ xanh, premix): Cấu tạo bộ xương, vỏ trứng, duy trì áp suất thẩm thấu và làm chất xúc tác trong các phản ứng trao đổi chất.',
          'Nhóm thức ăn thô xanh (cỏ voi, rơm rạ, thân ngô): Giàu chất xơ, tạo khuôn phân, kích thích nhu động ruột và là nguồn thức ăn chính cho gia súc nhai lại.',
        ],
      },
      {
        number: 3,
        question: 'Trình bày các phương pháp sản xuất và chế biến thức ăn chăn nuôi phổ biến.',
        answer: [
          'Sản xuất thức ăn hỗn hợp: Dạng bột (Làm sạch, sấy, nghiền nguyên liệu -> Cân định lượng -> Phối trộn đều + bổ sung premix -> Đóng bao) và dạng viên (thêm bước hấp hơi nước làm chín hồ hóa tinh bột -> ép viên -> làm nguội trước khi đóng bao).',
          'Chế biến thức ăn: Phương pháp vật lí (cắt ngắn, nghiền nhỏ, nấu chín/hấp); phương pháp hóa học (đường hóa, kiềm hóa rơm rạ bằng urea/nước vôi); phương pháp vi sinh vật (ủ chua cỏ xanh với vi khuẩn lactic, ủ men bột ngô/cám gạo với bánh men rượu hoặc chế phẩm EM).',
        ],
      },
      {
        number: 4,
        question: 'So sánh phương pháp bảo quản thức ăn chăn nuôi thông thường trong kho và bảo quản trong kho silo.',
        answer: [
          'Bảo quản trong kho thông thường: Thức ăn đóng bao xếp trên kệ gỗ/pallet trong nhà kho xây gạch; chi phí đầu tư thấp nhưng tốn diện tích mặt bằng, tốn nhân công bốc vác và dễ bị chuột bọ, nấm mốc tấn công khi thời tiết nồm ẩm.',
          'Bảo quản trong kho silo công nghệ cao: Chứa hạt rời với sức chứa hàng nghìn tấn trong tháp kim loại kín; cơ giới hóa và tự động hóa hoàn toàn khâu nhập – xuất, kiểm soát nhiệt độ – độ ẩm tự động, ngăn chặn triệt để chuột, chim và nấm mốc, tiết kiệm diện tích đất nhưng vốn đầu tư ban đầu cao.',
        ],
      },
      {
        number: 5,
        question: 'Quan sát và nhận xét ưu, nhược điểm của việc chế biến và bảo quản thức ăn chăn nuôi ở gia đình, địa phương em. Đề xuất biện pháp cải tiến phù hợp.',
        answer: [
          'Nhận xét: Nhiều hộ chăn nuôi đã biết tận dụng phụ phẩm (thân chuối, bã đậu, ngô, cám) nhưng thường bảo quản trong bao tải đặt sát nền đất ẩm dẫn đến mốc (nhiễm độc tố vi nấm Aflatoxin) hoặc thiếu thức ăn xanh cho trâu bò vào mùa đông.',
          'Đề xuất cải tiến: Phơi khô hạt ngô, thóc dưới 13% độ ẩm và kê bao trên kệ gỗ cao >= 15 cm; áp dụng kĩ thuật ủ chua cỏ voi/thân ngô và ủ rơm với urea để dự trữ thức ăn giàu dinh dưỡng cho trâu bò vào mùa khô rét.',
        ],
      },
    ],
  },
  {
    id: 'cn11-c4',
    grade: '11',
    bookTitle: 'Công nghệ 11 – Công nghệ Chăn nuôi',
    domain: 'husbandry',
    chapterNumber: 'Chương IV',
    chapterTitle: 'Phòng, trị bệnh cho vật nuôi',
    pageRef: 'Ôn tập Chương IV – Trang 77 SGK Công nghệ 11',
    lessons: [
      'Bài 11: Vai trò của phòng, trị bệnh trong chăn nuôi (trang 59)',
      'Bài 12: Một số bệnh phổ biến ở lợn và biện pháp phòng, trị (trang 63)',
      'Bài 13: Một số bệnh phổ biến ở gia cầm và biện pháp phòng, trị (trang 67)',
      'Bài 14: Một số bệnh phổ biến ở trâu, bò và biện pháp phòng, trị (trang 70)',
      'Bài 15: Ứng dụng công nghệ sinh học trong phòng, trị bệnh cho vật nuôi (trang 73)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Vai trò của phòng, trị bệnh cho vật nuôi',
        subItems: [
          'Vai trò của phòng, trị bệnh: Bảo vệ sức khỏe đàn vật nuôi, giảm tỉ lệ chết, nâng cao năng suất – chất lượng sản phẩm và hiệu quả kinh tế; bảo vệ sức khỏe cộng đồng (ngăn chặn các bệnh truyền lây giữa động vật và người như cúm A/H5N1, liên cầu khuẩn, nhiệt thán) và bảo vệ môi trường.',
          'Biện pháp đảm bảo an toàn trong chăn nuôi nông hộ và trang trại: Cách li chuồng trại, sát trùng định kì, tiêm phòng đầy đủ các loại vaccine, kiểm dịch con giống nhập đàn (nuôi cách li theo dõi ít nhất 2–3 tuần), thực hiện "cùng vào – cùng ra".',
        ],
      },
      {
        branchNumber: 2,
        title: 'Một số bệnh phổ biến trên vật nuôi',
        subItems: [
          'Một số bệnh phổ biến ở lợn: Bệnh dịch tả lợn cổ điển (do virus RNA họ Flaviviridae – xuất huyết điểm đinh ghim trên da, thận, hạch, loét hình cúc áo ở ruột già); Hội chứng rối loạn hô hấp và sinh sản PRRS / Bệnh tai xanh (do virus RNA họ Arteriviridae – nái sảy thai, tai chuyển màu xanh tím); Bệnh tụ huyết trùng lợn (do vi khuẩn Gram âm Pasteurella multocida – cổ hầu sưng phù, khó thở ngồi như chó ngồi).',
          'Một số bệnh phổ biến ở gia cầm: Bệnh Newcastle / Gà rù (do Paramyxovirus – gà ủ rũ, khó thở, phân trắng xanh, nghẹo cổ xoay vòng, xuất huyết dạ dày tuyến); Bệnh cúm gia cầm (do virus cúm A/H5N1, H5N6... – mào tích tím tái phù nề, chết rất nhanh, lây sang người); Bệnh tụ huyết trùng gia cầm / Toi gà (do vi khuẩn Pasteurella multocida).',
          'Một số bệnh phổ biến ở trâu, bò: Bệnh lở mồm long móng FMD (do virus RNA họ Picornaviridae – mọc mụn nước ở niêm mạc miệng, lưỡi, kẽ móng chân làm sùi bọt mép và long móng); Bệnh tụ huyết trùng trâu, bò (do vi khuẩn Pasteurella multocida).',
        ],
      },
      {
        branchNumber: 3,
        title: 'Ứng dụng công nghệ sinh học trong phòng, trị bệnh cho vật nuôi',
        subItems: [
          'Ứng dụng trong sản xuất vaccine phòng bệnh: Công nghệ vaccine DNA tái tổ hợp (cắt gene mã hóa kháng nguyên của mầm bệnh gắn vào vector plasmid, nhân bản trong vi khuẩn rồi tinh sạch làm vaccine thế hệ mới cực kì an toàn, không có nguy cơ tái độc lực).',
          'Ứng dụng trong phát hiện sớm virus gây bệnh (kĩ thuật PCR / RT-PCR): Lấy mẫu bệnh phẩm -> Tách chiết RNA/DNA -> Phiên mã ngược RNA thành cDNA (nếu là virus RNA) và nhân bản đoạn gene đặc hiệu bằng phản ứng chuỗi trùng hợp PCR -> Điện di kiểm tra sản phẩm PCR trên gel agarose để chẩn đoán chính xác ngay từ giai đoạn ủ bệnh.',
          'Ứng dụng trong sản xuất thuốc kháng sinh và chế phẩm sinh học (interferon, kháng thể đơn dòng).',
        ],
      },
    ],
    coreSummary: [
      'Nguyên tắc Vàng khi điều trị bệnh truyền nhiễm ở vật nuôi: Các bệnh do VIRUS (Dịch tả lợn, Tai xanh PRRS, Newcastle, Cúm gia cầm, Lở mồm long móng) KHÔNG điều trị đặc hiệu được bằng thuốc kháng sinh (vì kháng sinh chỉ diệt được vi khuẩn như Tụ huyết trùng, Phó thương hàn, E.coli). Với bệnh do virus, biện pháp quan trọng nhất là TIÊM VACCINE phòng bệnh chủ động.',
      'Quy định bắt buộc khi xảy ra dịch nguy hiểm (Cúm gia cầm H5N1, Dịch tả lợn, Lở mồm long móng): Báo ngay cho cơ quan thú y; thực hiện "5 không" (Không giấu dịch; Không mua bán, vận chuyển vật nuôi mắc bệnh; Không giết mổ, tiêu thụ thịt vật nuôi bệnh; Không vứt xác vật nuôi ra môi trường; Không dùng thức ăn thừa chưa xử lí nhiệt).',
    ],
    questions: [
      {
        number: 1,
        question: 'Phân tích vai trò của phòng, trị bệnh trong chăn nuôi. Để chăn nuôi hiệu quả và an toàn, cần làm những công việc gì?',
        answer: [
          'Vai trò: Giúp vật nuôi khỏe mạnh, phát huy tối đa tiềm năng di truyền, giảm chi phí thuốc thú y, ngăn chặn thiệt hại kinh tế do dịch bệnh; đồng thời đảm bảo sản phẩm thịt, trứng, sữa an toàn không tồn dư mầm bệnh hay kháng sinh và ngăn chặn bệnh lây sang người.',
          'Các công việc cần làm: Xây dựng chuồng trại cách li khu dân cư; chọn con giống rõ nguồn gốc sạch bệnh; vệ sinh tiêu độc khử trùng định kì; tiêm phòng đầy đủ vaccine theo lịch; cung cấp thức ăn – nước uống sạch và thực hiện nghiêm quy trình an toàn sinh học.',
        ],
      },
      {
        number: 2,
        question: 'So sánh nguyên nhân và biểu hiện đặc trưng của một số bệnh phổ biến ở lợn, gia cầm và trâu, bò.',
        answer: [
          'Ở lợn: Dịch tả lợn (do virus Flaviviridae: sốt cao, xuất huyết điểm đinh ghim trên da, loét hình cúc áo ở van hồi manh tràng); Tai xanh PRRS (do virus Arteriviridae: rối loạn sinh sản ở lợn nái và viêm phổi, tai tím xanh ở lợn con); Tụ huyết trùng (do vi khuẩn Pasteurella multocida: sưng hầu, thở khó, điều trị được bằng kháng sinh).',
          'Ở gia cầm: Newcastle/Gà rù (do Paramyxovirus: triệu chứng thần kinh ngoẹo đầu, xuất huyết đỉnh gai dạ dày tuyến); Cúm gia cầm (do virus Influenza A: phù đầu mặt, mào tích tím bầm, xuất huyết chân, chết hàng loạt); Tụ huyết trùng/Toi gà (do vi khuẩn Pasteurella multocida).',
          'Ở trâu, bò: Lở mồm long móng (do virus Picornaviridae: sốt cao, chảy nước dãi như bọt xà phòng, mụn nước loét ở lưỡi, lợi và vành móng chân); Tụ huyết trùng trâu bò (do vi khuẩn Pasteurella multocida: sưng hầu, lưỡi thè ra, thở khò khè).',
        ],
      },
      {
        number: 3,
        question: 'Nêu những điểm chung nhất trong phòng và trị các bệnh truyền nhiễm cho vật nuôi.',
        answer: [
          'Phòng bệnh là chính: Kết hợp vệ sinh phòng dịch (tiêu độc khử trùng chuồng trại, kiểm soát người và phương tiện ra vào), nuôi dưỡng tốt để tăng sức đề kháng và tiêm phòng vaccine đầy đủ đúng lịch.',
          'Khi có dịch xảy ra: Cách li ngay con ốm, báo cơ quan thú y, tuyệt đối không bán chạy hay vứt xác vật nuôi bệnh. Nếu bệnh do vi khuẩn thì dùng kháng sinh theo phác đồ kết hợp thuốc trợ sức; nếu bệnh truyền nhiễm nguy hiểm do virus thì xử lí tiêu hủy và bao vây ổ dịch theo quy định của Luật Thú y.',
        ],
      },
      {
        number: 4,
        question: 'Ứng dụng công nghệ sinh học trong sản xuất vaccine phòng bệnh và phát hiện sớm virus gây bệnh ở vật nuôi có ý nghĩa gì đối với ngành chăn nuôi?',
        answer: [
          'Trong sản xuất vaccine: Công nghệ DNA tái tổ hợp giúp sản xuất nhanh số lượng lớn vaccine có độ tinh khiết và độ an toàn tuyệt đối (không chứa mầm bệnh nguyên vẹn nên không bao giờ gây phát bệnh ngược), bảo quản ổn định hơn vaccine truyền thống.',
          'Trong chẩn đoán bệnh: Công nghệ PCR / RT-PCR giúp phát hiện chính xác sự có mặt của hệ gene virus ngay từ khi tải lượng virus còn rất thấp và con vật chưa biểu hiện triệu chứng lâm sàng, giúp khoanh vùng dập dịch sớm, giảm thiểu thiệt hại cho người chăn nuôi.',
        ],
      },
      {
        number: 5,
        question: 'Liên hệ với thực tiễn chăn nuôi ở gia đình, địa phương và nêu những biện pháp phòng, trị bệnh cho vật nuôi chưa đúng và đề xuất cách khắc phục.',
        answer: [
          'Những việc làm chưa đúng thường gặp: Đợi vật nuôi phát bệnh mới đi mua thuốc hoặc mới tiêm vaccine; tự ý dùng kháng sinh điều trị các bệnh do virus; dùng kháng sinh không đủ liều hoặc không tuân thủ thời gian ngừng thuốc trước khi xuất bán; vứt xác gà, lợn chết ra sông suối.',
          'Cách khắc phục: Lập sổ theo dõi và tiêm vaccine phòng bệnh đúng lịch ngay khi vật nuôi đang khỏe mạnh; chỉ dùng kháng sinh khi có chỉ định của bác sĩ thú y cho bệnh nhiễm khuẩn và chôn lấp/đốt xác vật nuôi chết cùng vôi bột đúng quy định.',
        ],
      },
    ],
  },
  {
    id: 'cn11-c5',
    grade: '11',
    bookTitle: 'Công nghệ 11 – Công nghệ Chăn nuôi',
    domain: 'husbandry',
    chapterNumber: 'Chương V',
    chapterTitle: 'Công nghệ chăn nuôi',
    pageRef: 'Ôn tập Chương V – Trang 107 SGK Công nghệ 11',
    lessons: [
      'Bài 16: Chuồng nuôi và biện pháp vệ sinh trong chăn nuôi (trang 78)',
      'Bài 17: Nuôi dưỡng và chăm sóc vật nuôi (trang 84)',
      'Bài 18: Chăn nuôi theo tiêu chuẩn VietGAP (trang 92)',
      'Bài 19: Chăn nuôi công nghệ cao (trang 96)',
      'Bài 20: Bảo quản và chế biến sản phẩm chăn nuôi (trang 100)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Chuồng nuôi và bảo vệ môi trường trong chăn nuôi',
        subItems: [
          'Yêu cầu về chuồng nuôi: Vị trí yên tĩnh, cao ráo, xa khu dân cư; hướng chuồng tốt nhất là hướng Nam hoặc Đông – Nam (mát về mùa hè, ấm về mùa đông); nền chuồng cao hơn mặt đất 20–30 cm, độ dốc 2–3% để thoát nước tốt.',
          'Một số kiểu chuồng nuôi: Chuồng hở (thông thoáng tự nhiên, chi phí thấp nhưng phụ thuộc thời tiết), Chuồng kín (có hệ thống quạt hút gió + tấm làm mát Cooling pad + sưởi ấm, kiểm soát hoàn toàn tiểu khí hậu), Chuồng kín – hở linh hoạt.',
          'Vệ sinh chuồng nuôi và bảo vệ môi trường: Quét dọn hàng ngày, phun thuốc sát trùng định kì, để trống chuồng ít nhất 7–15 ngày giữa hai lứa nuôi.',
        ],
      },
      {
        branchNumber: 2,
        title: 'Nuôi dưỡng và chăm sóc vật nuôi',
        subItems: [
          'Chăn nuôi gà đẻ trứng: Mật độ nuôi trên nền 3–3,5 con/m2 (cứ 4 gà mái có 1 ổ đẻ); thức ăn giai đoạn đẻ trứng cần 15–17% protein và 3–3,5% Calcium để tạo vỏ trứng; chiếu sáng 14–16 giờ/ngày ở cường độ 30 lux để kích thích tuyến yên tiết hormone FSH/LH làm trứng chín và rụng.',
          'Chăn nuôi lợn thịt: Chia khẩu phần ăn theo giai đoạn sinh trưởng (Giai đoạn lợn choai 10–30 kg, giai đoạn vỗ béo 31–60 kg và > 60 kg đến xuất chuồng); mật độ chuồng nuôi hợp lí, tắm chải và giữ ấm/làm mát theo mùa.',
          'Chăn nuôi bò sữa: Thức ăn gồm thức ăn thô xanh (cỏ voi, thân ngô ủ chua), thức ăn tinh hỗn hợp và thức ăn bổ sung (đá liếm khoáng, urea); bò đang vắt sữa chiếu sáng 16 giờ sáng + 8 giờ tối (bò cạn sữa chiếu sáng 8 giờ sáng + 16 giờ tối); vệ sinh bầu vú sạch bằng nước ấm trước và sát trùng núm vú sau khi vắt sữa.',
        ],
      },
      {
        branchNumber: 3,
        title: 'Mô hình chăn nuôi tiên tiến',
        subItems: [
          'Chăn nuôi theo tiêu chuẩn VietGAP (7 bước): Chuẩn bị chuồng trại & thiết bị -> Chọn con giống -> Nuôi dưỡng & chăm sóc -> Quản lí dịch bệnh -> Quản lí chất thải & bảo vệ môi trường -> Ghi chép hồ sơ, lưu trữ & truy xuất nguồn gốc -> Kiểm tra nội bộ.',
          'Chăn nuôi công nghệ cao: Chuồng nuôi gà đẻ tự động thu trứng bằng băng chuyền, phân loại và đóng khay; Robot chăn nuôi bò sữa (tự động nhận diện bò qua chip, vệ sinh bầu vú, gắn cốc vắt sữa và kiểm tra chất lượng sữa từng núm vú); Chăn nuôi lợn gắn chip điện tử ở tai (quản lí khẩu phần ăn tự động cho từng lợn nái).',
        ],
      },
      {
        branchNumber: 4,
        title: 'Bảo quản, chế biến sản phẩm chăn nuôi',
        subItems: [
          'Bảo quản sản phẩm chăn nuôi: Bảo quản lạnh thịt ở 0–2 °C hoặc cấp đông sâu ở -18 đến -25 °C; Bảo quản sữa tươi nguyên liệu ở 4–6 °C, thanh trùng Pasteur (72–75 °C trong 15–20 giây) hoặc tiệt trùng UHT (135–140 °C trong 3–5 giây).',
          'Chế biến sản phẩm chăn nuôi: Chế biến thịt hộp (5 bước), giò lụa, lạp xưởng, xúc xích, thịt xông khói, nem chua (lên men lactic thịt lợn sống với thính gạo); Chế biến sữa chua lên men (tỉ lệ sữa : cái men = 9 : 1, ủ ở 42–43 °C trong 6–8 giờ), phô mai, bơ.',
        ],
      },
    ],
    coreSummary: [
      'Tại sao trong chăn nuôi gà đẻ trứng cần duy trì chiếu sáng 14–16 giờ/ngày và bổ sung nhiều Calcium (3–3,5%)? Vì ánh sáng tác động qua mắt lên vùng dưới đồi và tuyến yên tiết hormone kích thích buồng trứng phát triển, còn Calcium là thành phần chính tạo nên vỏ trứng cứng chắc.',
      'Điểm cốt lõi của chăn nuôi VietGAP: Ghi chép nhật kí chăn nuôi đầy đủ từ con giống, thức ăn, thuốc thú y để phục vụ TRUY XUẤT NGUỒN GỐC và đảm bảo 4 an toàn (An toàn dịch bệnh, An toàn thực phẩm, An toàn môi trường, An toàn lao động).',
    ],
    questions: [
      {
        number: 1,
        question: 'Nêu những yêu cầu chung về chuồng nuôi. So sánh ưu, nhược điểm của các kiểu chuồng nuôi phổ biến.',
        answer: [
          'Yêu cầu chung: Địa điểm cao ráo, yên tĩnh, xa khu dân cư và trục giao thông chính; hướng chuồng Nam hoặc Đông – Nam; nền chuồng chắc chắn, không trơn trượt, cao hơn mặt đất 20–30 cm và dốc 2–3% về phía rãnh thoát nước.',
          'So sánh: Chuồng hở có chi phí xây dựng và vận hành thấp, tận dụng gió và ánh sáng tự nhiên nhưng phụ thuộc thời tiết và khó ngăn mầm bệnh từ chim hoang, côn trùng; Chuồng kín kiểm soát chủ động nhiệt độ, độ ẩm, tốc độ gió và an toàn sinh học cao nhưng chi phí đầu tư và tiền điện lớn, cần máy phát điện dự phòng.',
        ],
      },
      {
        number: 2,
        question: 'Trình bày kĩ thuật nuôi dưỡng, chăm sóc gà đẻ trứng, lợn thịt và bò sữa.',
        answer: [
          'Gà đẻ trứng: Đảm bảo mật độ hợp lí, bố trí đủ ổ đẻ (4–5 gà/ổ), cung cấp thức ăn giàu đạm (15–17%) và khoáng Calcium (3–3,5%), chiếu sáng 14–16 giờ/ngày và cắt mỏ để tránh gà mổ cắn nhau và mổ trứng.',
          'Lợn thịt: Nuôi theo các giai đoạn sinh trưởng với tỉ lệ protein giảm dần và năng lượng trao đổi phù hợp khi lợn lớn; cho uống nước sạch tự do qua núm uống, giữ chuồng khô sạch và mát mẻ (nhiệt độ thích hợp cho lợn thịt từ 18–25 °C).',
          'Bò sữa: Khẩu phần ăn phải cân đối giữa thức ăn thô xanh (để duy trì hoạt động nhai lại và tỉ lệ mỡ sữa) với thức ăn tinh (tính theo sản lượng sữa khai thác) và đá liếm khoáng; thực hiện quy trình vắt sữa vệ sinh nghiêm ngặt 2–3 lần/ngày để phòng bệnh viêm vú.',
        ],
      },
      {
        number: 3,
        question: 'Nêu các bước trong quy trình chăn nuôi theo tiêu chuẩn VietGAP. Phân tích ý nghĩa của việc áp dụng VietGAP trong chăn nuôi.',
        answer: [
          '7 bước quy trình VietGAP: (1) Chuẩn bị chuồng trại, thiết bị; (2) Chọn con giống; (3) Nuôi dưỡng và chăm sóc; (4) Quản lí dịch bệnh; (5) Quản lí chất thải và bảo vệ môi trường; (6) Ghi chép, lưu trữ hồ sơ và truy xuất nguồn gốc; (7) Kiểm tra nội bộ.',
          'Ý nghĩa: Tạo ra sản phẩm thịt, trứng, sữa an toàn vệ sinh thực phẩm (không tồn dư kháng sinh, chất cấm), nâng cao giá trị thương phẩm, bảo vệ sức khỏe người lao động và môi trường sinh thái.',
        ],
      },
      {
        number: 4,
        question: 'Trình bày một số ứng dụng công nghệ cao trong chăn nuôi gà đẻ trứng, lợn và bò sữa.',
        answer: [
          'Trong chăn nuôi gà đẻ: Hệ thống lồng tầng tự động cung cấp thức ăn, nước uống, băng tải thu gom phân và băng chuyền thu trứng tự động đưa về nhà đóng gói (soi trứng, khử trùng tia UV, phân cỡ và đóng vỉ).',
          'Trong chăn nuôi lợn: Gắn thẻ chip điện tử RFID ở tai lợn nái kết hợp trạm cho ăn tự động (ESF) giúp máy tính nhận diện từng con nái và cấp đúng lượng thức ăn theo thể trạng và giai đoạn mang thai.',
          'Trong chăn nuôi bò sữa: Gắn vòng cảm biến ở cổ/chân để phát hiện động dục và theo dõi sức khỏe nhai lại; hệ thống robot vắt sữa tự động (AMS) làm việc 24/7.',
        ],
      },
      {
        number: 5,
        question: 'Trình bày một số phương pháp bảo quản và chế biến sản phẩm chăn nuôi (thịt, trứng, sữa).',
        answer: [
          'Bảo quản: Thịt bảo quản lạnh mát (0–2 °C) hoặc cấp đông (-18 đến -25 °C); Trứng bảo quản lạnh sau khi lau sạch, phủ dầu khoáng hoặc bảo quản trong dung dịch nước vôi; Sữa tươi làm lạnh nhanh ở 4 °C sau khi vắt, thanh trùng Pasteur (72–75 °C/15–20s) hoặc tiệt trùng UHT (135–140 °C/3–5s).',
          'Chế biến: Từ thịt chế biến thành thịt hộp, xúc xích, giò chả, thịt xông khói, nem chua; từ sữa chế biến thành sữa chua (lên men bởi vi khuẩn Streptococcus thermophilus và Lactobacillus bulgaricus), sữa bột, bơ, phô mai.',
        ],
      },
    ],
  },
  {
    id: 'cn11-c6',
    grade: '11',
    bookTitle: 'Công nghệ 11 – Công nghệ Chăn nuôi',
    domain: 'husbandry',
    chapterNumber: 'Chương VI',
    chapterTitle: 'Bảo vệ môi trường trong chăn nuôi',
    pageRef: 'Ôn tập Chương VI – Trang 117 SGK Công nghệ 11',
    lessons: [
      'Bài 21: Sự cần thiết phải bảo vệ môi trường trong chăn nuôi (trang 108)',
      'Bài 22: Xử lí chất thải chăn nuôi (trang 112)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Sự cần thiết phải bảo vệ môi trường trong chăn nuôi',
        subItems: [
          'Nguyên nhân gây ô nhiễm môi trường trong chăn nuôi: Chất thải rắn (phân, chất độn chuồng, thức ăn thừa), nước thải chăn nuôi, khí thải (NH3, H2S, CH4, CO2) và xác vật nuôi chết không được xử lí đúng quy định.',
          'Ảnh hưởng của ô nhiễm: Gây ô nhiễm không khí (mùi hôi thối, hiệu ứng nhà kính), ô nhiễm đất và nguồn nước, làm bùng phát và lây lan dịch bệnh cho vật nuôi và con người.',
          'Một số biện pháp hạn chế ô nhiễm: Quy hoạch khu chăn nuôi xa khu dân cư; nuôi với mật độ hợp lí; áp dụng công nghệ chuồng trại tiên tiến; vệ sinh khử trùng thường xuyên; chuyển đổi sang chăn nuôi an toàn sinh học và tuần hoàn.',
        ],
      },
      {
        branchNumber: 2,
        title: 'Xử lí chất thải chăn nuôi',
        subItems: [
          'Một số biện pháp xử lí chất thải phổ biến: Công nghệ khí sinh học (hầm Biogas lên men yếm khí tạo khí CH4 làm chất đốt/phát điện) kết hợp hồ sinh học (nuôi bèo, tảo, cá); Ủ phân hữu cơ (Compost) hiếu khí sinh nhiệt tới 60–70 °C tiêu diệt mầm bệnh; Ép tách phân rắn – lỏng; Lọc sinh học khí thải chuồng nuôi; Xử lí nhiệt đối với xác vật nuôi.',
          'Ứng dụng công nghệ sinh học trong xử lí chất thải: Bổ sung enzyme (phytase, protease), probiotics và amino acid tổng hợp vào thức ăn để tăng tiêu hóa và giảm phát thải N, P, CH4 theo phân; Chăn nuôi trên nền đệm lót sinh học (trấu, mùn cưa trộn chế phẩm VSV phân giải phân ngay tại nền chuồng không cần tắm rửa); Sử dụng chế phẩm vi sinh (EM, Trichoderma, Bacillus) khử mùi và ủ phân.',
        ],
      },
    ],
    coreSummary: [
      'Cơ chế của Đệm lót sinh học trong chăn nuôi lợn, gà: Nền chuồng rải lớp trấu, mùn cưa dày 20–50 cm có phun chế phẩm vi sinh vật có ích (nấm men, vi khuẩn Bacillus, xạ khuẩn); VSV đồng hóa và phân giải nhanh phân, nước tiểu thành sinh khối protein và CO2, nước, giúp triệt tiêu mùi hôi NH3, H2S, giữ ấm vật nuôi và tiết kiệm 80% nước rửa chuồng.',
      'Quá trình lên men trong hầm Biogas là lên men KỊ KHÍ (yếm khí) nhờ hệ vi khuẩn methane hóa chuyển hóa chất hữu cơ trong phân thành khí sinh học (chứa khoảng 60–70% khí CH4 cháy được).',
    ],
    questions: [
      {
        number: 1,
        question: 'Nêu các nguồn gây ô nhiễm môi trường trong chăn nuôi và tác hại của chúng đối với môi trường và sức khỏe con người.',
        answer: [
          'Các nguồn gây ô nhiễm: Phân và chất độn chuồng (chất thải rắn), nước tiểu và nước rửa chuồng (nước thải), các khí độc và khí nhà kính (NH3, H2S, CH4, indole, skatole), xác vật nuôi chết và chất thải thú y (kim tiêm, vỏ lọ thuốc).',
          'Tác hại: Chứa nhiều vi khuẩn gây bệnh (Salmonella, E.coli, trứng giun sán) làm ô nhiễm nguồn nước ngầm/nước mặt, gây hiện tượng phú dưỡng ao hồ, gây mùi hôi thối ảnh hưởng hệ hô hấp của con người và làm lây lan dịch bệnh.',
        ],
      },
      {
        number: 2,
        question: 'Trình bày nguyên lí và ưu, nhược điểm của phương pháp xử lí chất thải chăn nuôi bằng công nghệ biogas và ủ phân compost.',
        answer: [
          'Công nghệ Biogas: Lên men yếm khí chất thải lỏng – rắn trong bể kín để vi sinh vật kị khí phân giải chất hữu cơ tạo khí methane (CH4). Ưu điểm: Diệt phần lớn mầm bệnh, giảm mùi hôi và thu được khí đốt/điện năng; Nhược điểm: Nước thải sau biogas vẫn còn hàm lượng N, P cao nên cần xử lí tiếp qua hồ sinh học trước khi xả ra môi trường.',
          'Ủ phân Compost: Lên men hiếu khí phân rắn trộn với phụ phẩm trồng trọt làm nhiệt độ đống ủ tăng lên 60–70 °C. Ưu điểm: Tiêu diệt 100% hạt cỏ dại, trứng giun sán và vi khuẩn gây bệnh, tạo nguồn phân hữu cơ chất lượng cao cho trồng trọt; Nhược điểm: Cần diện tích nhà ủ và công đảo trộn.',
        ],
      },
      {
        number: 3,
        question: 'Phân tích vai trò của ứng dụng công nghệ sinh học (bổ sung enzyme/probiotics vào thức ăn, đệm lót sinh học) trong bảo vệ môi trường chăn nuôi.',
        answer: [
          'Bổ sung enzyme (như phytase, xylanase) và probiotics vào thức ăn giúp giảm ô nhiễm ngay từ nguồn (từ trong cơ thể vật nuôi) vì vật nuôi hấp thu triệt để protein và khoáng chất, làm giảm lượng nitơ, photpho và khí độc thải ra ngoài theo phân.',
          'Sử dụng đệm lót sinh học giúp xử lí chất thải trực tiếp tại nền chuồng, không phát sinh nước thải rửa chuồng, khử hoàn toàn mùi hôi và sau lứa nuôi lớp đệm lót trở thành nguồn phân bón hữu cơ vi sinh giàu dinh dưỡng.',
        ],
      },
      {
        number: 4,
        question: 'Một hộ gia đình nuôi 50 con lợn thịt trong khu vực gần khu dân cư. Em hãy đề xuất quy trình kết hợp các giải pháp xử lí chất thải để không gây mùi hôi ảnh hưởng đến hàng xóm.',
        answer: [
          'Giải pháp 1 (Khuyến khích nhất): Chuyển sang mô hình nuôi lợn trên nền đệm lót sinh học kết hợp bổ sung men tiêu hóa (probiotics) vào thức ăn và phun chế phẩm EM khử mùi chuồng trại.',
          'Giải pháp 2 (Nếu nuôi nền xi măng): Thu gom phân rắn hàng ngày đem ủ Compost với chế phẩm Trichoderma/EM; toàn bộ nước tiểu và nước rửa chuồng dẫn vào hầm Biogas nhựa HDPE hoặc composite, nước thải sau Biogas dẫn qua bể lọc sinh học trồng cây thủy sinh hoặc tưới cho vườn cây ăn quả.',
        ],
      },
    ],
  },

  // ============================================================================
  // SÁCH 3: CÔNG NGHỆ 12 - LÂM NGHIỆP – THỦY SẢN (10 CHƯƠNG)
  // ============================================================================
  {
    id: 'cn12-c1',
    grade: '12',
    bookTitle: 'Công nghệ 12 – Lâm nghiệp – Thủy sản',
    domain: 'forestry',
    chapterNumber: 'Chương I',
    chapterTitle: 'Giới thiệu chung về lâm nghiệp',
    pageRef: 'Ôn tập Chương I – Trang 18 SGK Công nghệ 12',
    lessons: [
      'Bài 1: Vai trò và triển vọng của lâm nghiệp (trang 6)',
      'Bài 2: Các hoạt động lâm nghiệp cơ bản và nguyên nhân chủ yếu làm suy thoái tài nguyên rừng (trang 12)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Vai trò, triển vọng và đặc trưng cơ bản của lâm nghiệp',
        subItems: [
          'Vai trò đối với đời sống con người: Cung cấp gỗ, củi và lâm sản ngoài gỗ (dược liệu, tre nứa, nhựa, tinh dầu); tạo việc làm và thu nhập cho người dân (đặc biệt là đồng bào dân tộc thiểu số); phục vụ nghiên cứu khoa học, du lịch sinh thái.',
          'Vai trò đối với môi trường sinh thái: Điều hòa khí hậu (hấp thụ CO2, cung cấp O2 – "lá phổi xanh"), phòng hộ đầu nguồn (chắn gió, chắn cát bay, chống xói mòn, hạn chế lũ lụt, bảo vệ nguồn nước ngầm), bảo tồn đa dạng sinh học.',
          'Triển vọng của lâm nghiệp: Về kinh tế (xuất khẩu đồ gỗ đạt chuẩn FSC/PEFC và dịch vụ hấp thụ, lưu giữ carbon rừng), về môi trường (nâng tỉ lệ che phủ rừng ổn định 42–43%), về xã hội.',
          'Đặc trưng cơ bản của sản xuất lâm nghiệp (4 đặc trưng): (1) Đối tượng sản xuất là cơ thể sống có chu kì sinh trưởng dài (từ vài năm đến hàng chục, hàng trăm năm); (2) Quá trình tái sản xuất tự nhiên xen lẫn tái sản xuất kinh tế; (3) Địa bàn sản xuất rộng lớn, phức tạp, hiểm trở; (4) Mang tính thời vụ cao.',
        ],
      },
      {
        branchNumber: 2,
        title: 'Các hoạt động lâm nghiệp cơ bản',
        subItems: [
          'Quản lí rừng: Giao rừng, cho thuê rừng, chuyển loại rừng, chuyển mục đích sử dụng rừng sang mục đích khác, thu hồi rừng.',
          'Bảo vệ rừng: Bảo vệ hệ sinh thái rừng, thực vật rừng, động vật rừng; phòng cháy và chữa cháy rừng (PCCCR); phòng trừ sinh vật gây hại rừng.',
          'Phát triển rừng: Trồng mới rừng, trồng lại rừng sau khai thác, khoanh nuôi xúc tiến tái sinh phục hồi rừng, cải tạo rừng nghèo kiệt.',
          'Sử dụng rừng: Khai thác lâm sản bền vững gắn với chức năng của 3 loại rừng (Rừng đặc dụng, Rừng phòng hộ, Rừng sản xuất).',
          'Chế biến và thương mại lâm sản.',
        ],
      },
      {
        branchNumber: 3,
        title: 'Suy thoái tài nguyên rừng: Nguyên nhân và giải pháp khắc phục',
        subItems: [
          'Nguyên nhân chủ yếu làm suy thoái rừng: Khai thác gỗ và lâm sản khác không hợp lí (khai thác quá mức và chặt phá rừng trái phép); Chăn thả gia súc bừa bãi trong rừng non; Cháy rừng; Phá rừng để lấy đất trồng cây công nghiệp và cây đặc sản.',
          'Giải pháp khắc phục suy thoái: Hoàn thiện quy hoạch lâm nghiệp quốc gia; Đẩy mạnh giao rừng, cho thuê rừng gắn với trách nhiệm chủ rừng; Kiểm soát chặt chẽ chuyển mục đích sử dụng rừng tự nhiên; Bảo tồn các loài động, thực vật rừng quý hiếm; Kiện toàn lực lượng kiểm lâm và nâng cao sinh kế cho người dân sống gần rừng.',
        ],
      },
    ],
    coreSummary: [
      'Phân biệt 3 loại rừng ở Việt Nam theo mục đích sử dụng chủ yếu: (1) Rừng đặc dụng (vườn quốc gia, khu bảo tồn thiên nhiên: bảo tồn hệ sinh thái và nguồn gene); (2) Rừng phòng hộ (đầu nguồn, chắn gió cát ven biển, chắn sóng ngập mặn: bảo vệ nguồn nước, đất, chống thiên tai); (3) Rừng sản xuất (cung cấp gỗ, lâm sản kinh doanh kết hợp bảo vệ môi trường).',
      'Đặc trưng quan trọng nhất của sản xuất lâm nghiệp: Chu kì kinh doanh cây rừng rất dài nên vốn đầu tư thu hồi chậm, đòi hỏi phải kết hợp nông – lâm kết hợp (lấy ngắn nuôi dài).',
    ],
    questions: [
      {
        number: 1,
        question: 'Lâm nghiệp có vai trò và triển vọng như thế nào đối với đời sống con người và môi trường? Cho ví dụ minh họa.',
        answer: [
          'Vai trò: Cung cấp gỗ cho xây dựng, chế biến nội thất xuất khẩu và dược liệu quý (sâm Ngọc Linh, ba kích, quế, hồi); điều hòa khí hậu, hấp thụ khí nhà kính CO2, giữ nước đầu nguồn cho các hồ thủy điện và chống sạt lở đất, lũ quét.',
          'Triển vọng: Việt Nam là một trong những nước xuất khẩu gỗ và lâm sản hàng đầu thế giới, đồng thời mở ra nguồn thu lớn từ bán tín chỉ carbon rừng và dịch vụ môi trường rừng (PFES).',
        ],
      },
      {
        number: 2,
        question: 'Nêu những đặc trưng cơ bản của sản xuất lâm nghiệp.',
        answer: [
          '(1) Đối tượng của sản xuất lâm nghiệp là những cơ thể sống có chu kì sinh trưởng, phát triển dài (hàng chục năm).',
          '(2) Quá trình tái sản xuất tự nhiên luôn gắn liền với quá trình tái sản xuất kinh tế.',
          '(3) Sản xuất lâm nghiệp diễn ra trên địa bàn rộng lớn, địa hình đồi núi dốc phức tạp.',
          '(4) Hoạt động sản xuất lâm nghiệp (trồng rừng, khai thác rừng) phụ thuộc chặt chẽ vào điều kiện thời tiết, khí hậu nên có tính thời vụ cao.',
        ],
      },
      {
        number: 3,
        question: 'Trình bày các hoạt động lâm nghiệp cơ bản.',
        answer: [
          'Gồm 5 nhóm hoạt động liên hoàn: Quản lí rừng (quy hoạch, giao rừng, cho thuê rừng, cấp chứng chỉ rừng bền vững); Bảo vệ rừng (chống chặt phá, PCCCR, phòng trừ sâu bệnh); Phát triển rừng (nhân giống, trồng rừng, khoanh nuôi tái sinh); Sử dụng rừng (khai thác lâm sản và dịch vụ môi trường rừng); Chế biến và thương mại lâm sản.',
        ],
      },
      {
        number: 4,
        question: 'Phân tích các nguyên nhân chủ yếu làm suy thoái tài nguyên rừng và đề xuất giải pháp khắc phục.',
        answer: [
          'Nguyên nhân: Khai thác gỗ và lâm sản vượt quá khả năng tự phục hồi của rừng; nạn lâm tặc chặt phá rừng trái phép; đốt rừng làm nương rẫy hoặc phá rừng tự nhiên để trồng cây công nghiệp (cà phê, cao su, hồ tiêu); cháy rừng vào mùa khô hanh và chăn thả gia súc làm dẫm đạp cây rừng tái sinh.',
          'Giải pháp: Thực hiện nghiêm việc đóng cửa rừng tự nhiên; giao đất giao rừng lâu dài cho hộ gia đình và cộng đồng; ứng dụng viễn thám GIS cảnh báo sớm cháy rừng và mất rừng; phát triển rừng trồng thâm canh gỗ lớn có chứng chỉ FSC để thay thế gỗ rừng tự nhiên.',
        ],
      },
    ],
  },
  {
    id: 'cn12-c2',
    grade: '12',
    bookTitle: 'Công nghệ 12 – Lâm nghiệp – Thủy sản',
    domain: 'forestry',
    chapterNumber: 'Chương II',
    chapterTitle: 'Trồng và chăm sóc rừng',
    pageRef: 'Ôn tập Chương II – Trang 30 SGK Công nghệ 12',
    lessons: [
      'Bài 3: Vai trò, nhiệm vụ của trồng và chăm sóc rừng (trang 19)',
      'Bài 4: Quy luật sinh trưởng và phát triển của cây rừng (trang 22)',
      'Bài 5: Kĩ thuật trồng và chăm sóc rừng (trang 25)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Vai trò, nhiệm vụ của trồng và chăm sóc rừng',
        subItems: [
          'Vai trò của trồng rừng: Phủ xanh đất trống, đồi núi trọc; cung cấp gỗ, củi và nguyên liệu công nghiệp; phòng hộ bảo vệ môi trường, bảo tồn đa dạng sinh học.',
          'Vai trò của chăm sóc rừng: Giảm sự cạnh tranh ánh sáng, nước, dinh dưỡng của cỏ dại và cây bụi; nâng cao tỉ lệ sống của cây rừng sau trồng (đạt >= 85%) và thúc đẩy cây rừng sinh trưởng nhanh, thân thẳng, chất lượng gỗ tốt.',
          'Nhiệm vụ của trồng và chăm sóc rừng: Đảm bảo toàn bộ diện tích đất lâm nghiệp quy hoạch được phủ xanh và phát triển bền vững cho cả 3 loại rừng (sản xuất, phòng hộ, đặc dụng).',
        ],
      },
      {
        branchNumber: 2,
        title: 'Quy luật sinh trưởng và phát triển của cây rừng',
        subItems: [
          'Khái niệm: Sinh trưởng là sự tăng lên về kích thước (chiều cao, đường kính thân) và khối lượng (thể tích gỗ); Phát triển là sự biến đổi về chất lượng dẫn đến sự phát sinh các cơ quan mới (ra hoa, kết quả, tái sinh hạt). Cây rừng sinh trưởng nhanh có đường kính tăng >= 2 cm/năm hoặc năng suất đạt >= 15 m3/ha/năm.',
          'Các giai đoạn sinh trưởng và phát triển của cây rừng (4 giai đoạn): (1) Giai đoạn non (từ hạt nảy mầm đến trước khi ra hoa lần đầu, cây vươn chiều cao mạnh, cần chăm sóc làm cỏ vun xới); (2) Giai đoạn gần thành thục (3–5 năm kể từ khi ra hoa bói lần đầu, tán cây khép kín, cần tỉa cành và tỉa thưa); (3) Giai đoạn thành thục (5–10 năm tiếp theo, sinh trưởng chiều cao chậm lại, tăng mạnh đường kính và thể tích gỗ, thu hoạch hạt giống và khai thác gỗ); (4) Giai đoạn già cỗi (năng suất giảm, rỗng ruột, cần khai thác và xúc tiến tái sinh rừng mới).',
        ],
      },
      {
        branchNumber: 3,
        title: 'Kĩ thuật trồng và chăm sóc rừng',
        subItems: [
          'Thời vụ trồng rừng: Miền Bắc trồng vụ xuân và xuân – hè (tháng 2 đến tháng 7); Miền Trung trồng vào mùa mưa (tháng 9 đến tháng 12); Miền Nam và Tây Nguyên trồng vào mùa mưa (tháng 5 đến tháng 11).',
          'Kĩ thuật trồng rừng: Trồng bằng gieo hạt thẳng (gieo toàn diện hoặc gieo cục bộ theo hàng/theo khóm trên đất tốt, bằng phẳng) và Trồng rừng bằng cây con (cây con có bầu phổ biến nhất và cây con rễ trần; kích thước hố thường 30x30x30 cm hoặc 40x40x40 cm).',
          'Kĩ thuật chăm sóc rừng: Làm cỏ, phát quang dây leo bụi rậm và xới đất, vun gốc (sâu 8–13 cm); Bón phân thúc; Tưới nước; Tỉa cành (cắt cành khô và cành dưới 1/3 chiều cao tán cây vào đầu mùa khô) và tỉa thưa (chặt bỏ cây cong queo, sâu bệnh); Trồng dặm (khi tỉ lệ cây sống < 85%).',
        ],
      },
    ],
    coreSummary: [
      'Quy trình trồng rừng bằng cây con có bầu (6 bước chuẩn): Bước 1: Tạo hố trồng cây và bón lót (để lớp đất mặt riêng một bên, trộn đất mặt với phân bón lót lấp xuống đáy hố trước 7–10 ngày) -> Bước 2: Rạch và xé bỏ vỏ bầu (tránh làm vỡ bầu đất) -> Bước 3: Đặt bầu cây thẳng đứng vào giữa hố (cổ rễ ngang mặt đất) -> Bước 4: Lấp đất lần 1 và nén chặt xung quanh bầu -> Bước 5: Lấp đất lần 2 cao hơn cổ rễ 1–2 cm -> Bước 6: Vun gốc và phủ cỏ rác giữ ẩm.',
      'Tại sao trồng rừng bằng cây con có bầu lại phổ biến nhất ở Việt Nam? Vì đồi núi nước ta có độ dốc lớn, đất nghèo dinh dưỡng và thời tiết khắc nghiệt; bầu đất chứa sẵn dinh dưỡng và bảo vệ bộ rễ không bị đứt hoặc khô héo khi vận chuyển, giúp cây đạt tỉ lệ sống cao nhất.',
    ],
    questions: [
      {
        number: 1,
        question: 'Trình bày vai trò và nhiệm vụ của trồng và chăm sóc rừng.',
        answer: [
          'Vai trò: Trồng rừng giúp phục hồi diện tích rừng bị mất, phủ xanh đất trống đồi núi trọc, cung cấp lâm sản và phát huy chức năng phòng hộ môi trường; Chăm sóc rừng giúp bảo vệ cây rừng non trong những năm đầu (1–4 năm đầu sau trồng) trước sự lấn át của cỏ dại, sâu bệnh để rừng nhanh khép tán.',
          'Nhiệm vụ: Trồng rừng sản xuất (lấy gỗ nhỏ, gỗ lớn, nguyên liệu giấy), trồng rừng phòng hộ (đầu nguồn, ven biển) và trồng rừng đặc dụng (phục hồi cảnh quan, bảo tồn nguồn gene).',
        ],
      },
      {
        number: 2,
        question: 'Nêu đặc điểm các giai đoạn sinh trưởng, phát triển của cây rừng và ý nghĩa của việc nắm vững quy luật đó trong lâm nghiệp.',
        answer: [
          '4 giai đoạn: Giai đoạn non (vươn cao mạnh, sức chống chịu yếu); Giai đoạn gần thành thục (bắt đầu ra hoa, khép tán, phân hóa cây ưu thế và cây bị chèn ép); Giai đoạn thành thục (sinh trưởng thể tích gỗ đạt cực đại, hạt giống chất lượng tốt nhất); Giai đoạn già cỗi (suy giảm sinh trưởng và khả năng kháng sâu bệnh).',
          'Ý nghĩa: Giúp người làm lâm nghiệp áp dụng đúng biện pháp kĩ thuật tương ứng với từng độ tuổi (giai đoạn non tập trung làm cỏ, vun xới, trồng dặm; giai đoạn gần thành thục tập trung tỉa cành, tỉa thưa nuôi dưỡng; giai đoạn thành thục tiến hành thu hái hạt giống và khai thác chính).',
        ],
      },
      {
        number: 3,
        question: 'Phân tích ưu, nhược điểm của trồng rừng bằng cây con có bầu, cây con rễ trần và gieo hạt thẳng. Trình bày các công việc chăm sóc rừng sau khi trồng.',
        answer: [
          'So sánh 3 phương thức: Cây con có bầu có tỉ lệ sống rất cao, áp dụng được ở vùng đất xấu đồi dốc nhưng tốn chi phí đóng bầu và công vận chuyển; Cây con rễ trần nhẹ, vận chuyển dễ và rẻ nhưng rễ dễ bị tổn thương, chỉ trồng được nơi đất tốt ẩm mát; Gieo hạt thẳng đỡ tốn chi phí vườn ươm, bộ rễ cọc phát triển tự nhiên nhưng tốn nhiều hạt giống và dễ bị chim, chuột, kiến ăn hạt.',
          'Các công việc chăm sóc rừng: Phát quang dây leo cây bụi chèn ép, làm cỏ xới đất vun gốc, bón phân thúc (từ năm thứ 1 đến năm thứ 3), tỉa cành, tỉa thưa và trồng dặm bổ sung những cây bị chết.',
        ],
      },
    ],
  },
  {
    id: 'cn12-c3',
    grade: '12',
    bookTitle: 'Công nghệ 12 – Lâm nghiệp – Thủy sản',
    domain: 'forestry',
    chapterNumber: 'Chương III',
    chapterTitle: 'Bảo vệ và khai thác tài nguyên rừng bền vững',
    pageRef: 'Ôn tập Chương III – Trang 39 SGK Công nghệ 12',
    lessons: [
      'Bài 6: Ý nghĩa, nhiệm vụ, thực trạng của việc bảo vệ và khai thác rừng (trang 31)',
      'Bài 7: Biện pháp bảo vệ và khai thác tài nguyên rừng (trang 35)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Bảo vệ rừng',
        subItems: [
          'Ý nghĩa của bảo vệ rừng: Giữ gìn diện tích và chất lượng tài nguyên rừng hiện có, duy trì cân bằng sinh thái và đa dạng sinh học.',
          'Nhiệm vụ của bảo vệ rừng: Là trách nhiệm của toàn dân, của chủ rừng (trực tiếp tuần tra, phòng chống cháy rừng, báo cáo kiểm lâm) và của Ủy ban nhân dân các cấp.',
          'Một số biện pháp bảo vệ rừng: Nâng cao ý thức pháp luật cho người dân; Ngăn chặn hành vi làm suy thoái rừng; Phòng, chống cháy rừng (làm đường băng cản lửa rộng 8–12 m, biển báo cấp dự báo cháy rừng từ cấp I đến cấp V, trực canh lửa mùa khô); Phòng, trừ sinh vật gây hại rừng; Trồng cây bản địa và nuôi dưỡng rừng; Giao rừng, cho thuê rừng gắn với phát triển sinh kế bền vững.',
        ],
      },
      {
        branchNumber: 2,
        title: 'Khai thác rừng bền vững',
        subItems: [
          'Ý nghĩa và nhiệm vụ của khai thác rừng bền vững: Thu hoạch lâm sản đáp ứng nhu cầu kinh tế – xã hội nhưng không làm suy giảm khả năng tái sinh và chức năng phòng hộ của rừng (lượng khai thác không vượt quá lượng tăng trưởng của rừng).',
          'Một số phương thức khai thác rừng phổ biến (3 phương thức): (1) Khai thác trắng: Chặt toàn bộ cây rừng trên một diện tích nhất định trong thời gian ngắn (< 1 năm, vào mùa khô), sau khai thác bắt buộc phải trồng lại rừng ngay trong mùa mưa kế tiếp (chỉ áp dụng cho rừng trồng sản xuất thuần loài ở nơi độ dốc < 15°); (2) Khai thác dần: Chặt toàn bộ cây rừng qua 3–4 lần chặt trong thời gian 5–10 năm (tận dụng rừng tái sinh tự nhiên hoàn thành thì mới chặt hết cây mẹ); (3) Khai thác chọn: Chỉ chọn chặt những cây đã thành thục, già cỗi, phẩm chất kém theo yêu cầu, không hạn chế thời gian, giữ lại cây non và độ tàn che rừng luôn >= 0,3–0,4 (áp dụng cho rừng tự nhiên nhiều tầng tuổi và rừng phòng hộ).',
        ],
      },
    ],
    coreSummary: [
      'So sánh 3 phương thức khai thác gỗ: Khai thác trắng làm thay đổi hoàn toàn hoàn cảnh rừng và dễ gây xói mòn đất nếu dốc lớn nên phải trồng lại rừng ngay; Khai thác dần và Khai thác chọn duy trì được độ che phủ thường xuyên của tán rừng và tận dụng khả năng tái sinh hạt tự nhiên của rừng.',
      'Trong phòng cháy chữa cháy rừng (PCCCR), phương châm cốt lõi là "Phòng là chính, chữa cháy phải khẩn trương, kịp thời, triệt để" và thực hiện phương châm "4 tại chỗ" (Chỉ huy tại chỗ, lực lượng tại chỗ, phương tiện tại chỗ, hậu cần tại chỗ).',
    ],
    questions: [
      {
        number: 1,
        question: 'Nêu ý nghĩa, nhiệm vụ của việc bảo vệ và khai thác tài nguyên rừng bền vững.',
        answer: [
          'Ý nghĩa: Bảo vệ hệ sinh thái rừng, nguồn gene động thực vật quý hiếm, duy trì chức năng phòng hộ đầu nguồn và cung cấp lâm sản ổn định lâu dài cho nền kinh tế.',
          'Nhiệm vụ: Ngăn chặn triệt để nạn phá rừng, cháy rừng, săn bắt động vật hoang dã trái phép; tổ chức khai thác đúng quy trình kĩ thuật và tái tạo rừng ngay sau khai thác.',
        ],
      },
      {
        number: 2,
        question: 'Đánh giá thực trạng công tác trồng, chăm sóc, bảo vệ và khai thác rừng ở Việt Nam hoặc tại địa phương em.',
        answer: [
          'Thành tựu: Diện tích rừng trồng tăng nhanh (đạt trên 4,6 triệu ha), độ che phủ rừng toàn quốc duy trì trên 42%, công nghiệp chế biến gỗ xuất khẩu phát triển mạnh.',
          'Tồn tại: Chất lượng rừng tự nhiên ở nhiều nơi còn nghèo kiệt; rừng trồng chủ yếu là rừng gỗ nhỏ (keo, bạch đàn chu kì 5–7 năm), diện tích rừng gỗ lớn và rừng có chứng chỉ bền vững FSC còn thấp; nguy cơ cháy rừng và xâm lấn đất rừng vẫn diễn biến phức tạp.',
        ],
      },
      {
        number: 3,
        question: 'Trình bày các biện pháp bảo vệ tài nguyên rừng.',
        answer: [
          '(1) Tuyên truyền, phổ biến Luật Lâm nghiệp cho cộng đồng; (2) Tuần tra, kiểm soát ngăn chặn chặt phá rừng và săn bắt động vật rừng; (3) Thực hiện đồng bộ các biện pháp phòng cháy, chữa cháy rừng (xây dựng đường băng cản lửa, chòi canh lửa, dự báo cấp cháy rừng); (4) Phòng trừ sâu bệnh hại rừng (như sâu róm thông) ưu tiên biện pháp sinh học; (5) Đẩy mạnh giao đất, giao rừng và chi trả dịch vụ môi trường rừng để người dân gắn bó với rừng.',
        ],
      },
      {
        number: 4,
        question: 'So sánh mục đích, đối tượng áp dụng và cách thức tiến hành của phương thức khai thác trắng, khai thác dần và khai thác chọn.',
        answer: [
          'Khai thác trắng: Chặt toàn bộ cây trong 1 lần (< 1 năm); áp dụng cho rừng trồng sản xuất thuần loài, đều tuổi ở nơi đất ít dốc; sau khi khai thác phải trồng lại rừng mới bằng nhân tạo.',
          'Khai thác dần: Chặt toàn bộ cây thành 3–4 đợt kéo dài 5–10 năm; áp dụng cho rừng sản xuất có khả năng tái sinh hạt tự nhiên tốt; khi lớp cây con tái sinh đã khép tán vững chắc mới chặt nốt đợt cuối.',
          'Khai thác chọn: Chỉ chặt các cây đã đạt đường kính khai thác hoặc cây già cỗi, sâu bệnh theo định kì, không giới hạn thời gian; áp dụng cho rừng tự nhiên hỗn giao nhiều tầng tuổi và rừng phòng hộ để luôn giữ nguyên cấu trúc rừng.',
        ],
      },
    ],
  },
  {
    id: 'cn12-c4',
    grade: '12',
    bookTitle: 'Công nghệ 12 – Lâm nghiệp – Thủy sản',
    domain: 'aquaculture',
    chapterNumber: 'Chương IV',
    chapterTitle: 'Giới thiệu chung về thủy sản',
    pageRef: 'Ôn tập Chương IV – Trang 50 SGK Công nghệ 12',
    lessons: [
      'Bài 8: Vai trò và triển vọng của thủy sản (trang 40)',
      'Bài 9: Các nhóm thủy sản và một số phương thức nuôi phổ biến (trang 45)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Vai trò, triển vọng và xu hướng phát triển của thủy sản',
        subItems: [
          'Vai trò của thủy sản: Cung cấp thực phẩm giàu đạm dễ tiêu hóa và acid béo không no (Omega-3, DHA, EPA); cung cấp nguyên liệu cho công nghiệp chế biến xuất khẩu và thức ăn chăn nuôi; giải quyết việc làm, phát triển kinh tế biển; khẳng định chủ quyền biển đảo của Tổ quốc khi ngư dân vươn khơi bám biển.',
          'Triển vọng và xu hướng phát triển: Phát triển thủy sản bền vững; Tăng tỉ lệ sản lượng nuôi trồng (đặc biệt là nuôi biển), giảm tỉ lệ khai thác tự nhiên (nhất là khai thác ven bờ); Ứng dụng công nghệ cao (RAS, Biofloc, IoT, công nghệ sinh học) và tuân thủ tiêu chuẩn VietGAP, GlobalGAP, ASC, BAP cũng như gỡ "thẻ vàng" IUU.',
        ],
      },
      {
        branchNumber: 2,
        title: 'Phân loại động vật thủy sản',
        subItems: [
          'Phân loại theo nguồn gốc: Thủy sản bản địa (cá tra, cá basa, cá rô đồng, cá quả/cá lóc, tôm sú) và Thủy sản nhập nội (tôm thẻ chân trắng, cá rô phi đơn tính, cá tầm, cá hồi vân, cá chép Hungary).',
          'Phân loại theo đặc tính sinh vật học: (1) Theo cấu tạo cơ thể (5 nhóm): Nhóm cá, Nhóm giáp xác (tôm, cua, ghẹ), Nhóm động vật thân mềm/nhuyễn thể (ngao, sò, ốc, hàu, mực, bạch tuộc), Nhóm rong – tảo, Nhóm bò sát và lưỡng cư (rùa, ba ba, ếch); (2) Theo tính ăn: Ăn thực vật (cá trắm cỏ), ăn động vật (cá lóc, cá tầm, ba ba), ăn tạp (cá chép, cá rô phi, cá tra, tôm); (3) Theo môi trường nước: Nước ngọt, nước lợ, nước mặn.',
        ],
      },
      {
        branchNumber: 3,
        title: 'Một số phương thức nuôi thủy sản ở Việt Nam',
        subItems: [
          'Nuôi quảng canh (và quảng canh cải tiến): Diện tích ao/đầm rất lớn, mật độ thả rất thưa (tự nhiên hoặc thả bổ sung ít), hoàn toàn dựa vào nguồn thức ăn tự nhiên trong thủy vực, đầu tư thấp nhưng năng suất thấp.',
          'Nuôi bán thâm canh: Diện tích vừa phải, chủ động cấp thoát nước một phần, thả giống mật độ trung bình, kết hợp thức ăn tự nhiên trong ao với thức ăn bổ sung (thức ăn tự chế hoặc viên công nghiệp).',
          'Nuôi thâm canh (và siêu thâm canh): Hệ thống ao/bể nhỏ được thiết kế hoàn chỉnh, mật độ thả rất cao, sử dụng 100% thức ăn công nghiệp chất lượng cao, có hệ thống quạt nước/sục khí cung cấp oxygen liên tục và kiểm soát chặt chẽ môi trường nước, năng suất rất cao.',
        ],
      },
    ],
    coreSummary: [
      'Xu hướng cơ cấu sản lượng thủy sản Việt Nam: Tăng mạnh tỉ trọng nuôi trồng thủy sản (đặc biệt là nuôi biển công nghiệp xa bờ và các đối tượng chủ lực: tôm nước lợ, cá tra, nhuyễn thể) và giảm dần cường lực khai thác thủy sản tự nhiên ven bờ để phục hồi nguồn lợi.',
      '4 yêu cầu cơ bản đối với người lao động trong ngành thủy sản: Có kiến thức, kĩ năng chuyên môn; sử dụng thành thạo thiết bị công nghệ; có sức khỏe tốt (chịu được sóng gió khi đi biển hoặc làm việc ngoài ao đầm); có ý thức bảo vệ nguồn lợi thủy sản và môi trường.',
    ],
    questions: [
      {
        number: 1,
        question: 'Phân tích vai trò và xu hướng phát triển của ngành thủy sản ở Việt Nam trong bối cảnh hội nhập quốc tế.',
        answer: [
          'Vai trò: Cung cấp trên 50% lượng đạm động vật trong khẩu phần ăn của người Việt; đóng góp kim ngạch xuất khẩu lớn (9–11 tỉ USD/năm với tôm, cá tra, cá ngừ); tạo sinh kế cho hàng triệu lao động và góp phần bảo vệ chủ quyền vùng biển, hải đảo của Tổ quốc.',
          'Xu hướng phát triển: Chuyển từ chạy theo sản lượng sang nâng cao chất lượng và giá trị gia tăng; tăng nuôi trồng (nhất là nuôi biển công nghệ cao), giảm khai thác tự nhiên; đẩy mạnh áp dụng tiêu chuẩn quốc tế (VietGAP, ASC, BAP), truy xuất nguồn gốc và chống khai thác bất hợp pháp (IUU).',
        ],
      },
      {
        number: 2,
        question: 'Trình bày cách phân loại thủy sản theo nguồn gốc và theo đặc tính sinh vật học. Cho ví dụ minh họa.',
        answer: [
          'Theo nguồn gốc: Loài bản địa (cá tra, cá lóc, tôm sú, cá anh vũ) và loài nhập nội (tôm thẻ chân trắng, cá rô phi dòng GIFT, cá tầm Nga, cá hồi).',
          'Theo đặc tính sinh vật học: (1) Theo nhóm phân loại: Cá (cá chép, cá song), Giáp xác (tôm sú, cua biển), Thân mềm (ngao Bến Tre, hàu Thái Bình Dương, mực), Bò sát – lưỡng cư (ba ba, ếch đồng), Rong tảo (rong sụn, tảo xoắn Spirulina); (2) Theo tính ăn: Ăn thực vật (cá trắm cỏ), ăn động vật (cá quả, cá mú), ăn tạp (cá tra, cá rô phi); (3) Theo độ mặn: Thủy sản nước ngọt, nước lợ, nước mặn.',
        ],
      },
      {
        number: 3,
        question: 'So sánh các phương thức nuôi thủy sản phổ biến ở nước ta (quảng canh, bán thâm canh, thâm canh).',
        answer: [
          'Quảng canh: Diện tích ao đầm lớn (như tôm – rừng ngập mặn, tôm – lúa), mật độ rất thấp, không cho ăn hoặc rất ít, vốn đầu tư thấp, ít rủi ro ô nhiễm nhưng năng suất thấp.',
          'Bán thâm canh: Diện tích vừa, mật độ trung bình, sử dụng kết hợp thức ăn tự nhiên có trong ao với thức ăn công nghiệp/tự chế, có trang bị quạt nước hỗ trợ khi cần.',
          'Thâm canh: Hệ thống ao/bể nhỏ (thường lót bạt hoặc bể tròn), mật độ thả dày, hoàn toàn dùng thức ăn công nghiệp hoàn chỉnh, sục khí và quạt nước liên tục, ứng dụng chế phẩm sinh học; năng suất và lợi nhuận cao nhưng vốn đầu tư và yêu cầu kĩ thuật rất cao.',
        ],
      },
      {
        number: 4,
        question: 'Theo em, những yêu cầu cơ bản nào là cần thiết đối với người lao động trong ngành thủy sản hiện nay?',
        answer: [
          'Có kiến thức chuyên môn vững về sinh học thủy sản, quản lí môi trường nước, dinh dưỡng, bệnh học thủy sản và khai thác bền vững.',
          'Có kĩ năng vận hành các thiết bị đo môi trường tự động, hệ thống tuần hoàn RAS, Biofloc hoặc thiết bị hàng hải, dò cá hiện đại.',
          'Có sức khỏe dẻo dai, yêu nghề và có đạo đức nghề nghiệp (không dùng hóa chất, kháng sinh cấm, không khai thác hủy diệt bằng chất nổ, xung điện).',
        ],
      },
    ],
  },
  {
    id: 'cn12-c5',
    grade: '12',
    bookTitle: 'Công nghệ 12 – Lâm nghiệp – Thủy sản',
    domain: 'aquaculture',
    chapterNumber: 'Chương V',
    chapterTitle: 'Môi trường nuôi thủy sản',
    pageRef: 'Ôn tập Chương V – Trang 65 SGK Công nghệ 12',
    lessons: [
      'Bài 10: Yêu cầu của môi trường nuôi thủy sản (trang 51)',
      'Bài 11: Quản lí và xử lí môi trường nuôi thủy sản (trang 56)',
      'Bài 12: Thực hành: Xác định một số chỉ tiêu của nước nuôi thủy sản (trang 62)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Yêu cầu chính của môi trường nuôi thủy sản',
        subItems: [
          'Yếu tố thủy lí: Nhiệt độ nước (thủy sản nhiệt đới thích hợp 20–30 °C, ôn đới như cá tầm/cá hồi 15–20 °C); Độ trong (ao nuôi cá: 20–30 cm, ao nuôi tôm: 30–45 cm đo bằng đĩa Secchi); Màu nước (nước ngọt tốt nhất là màu xanh nõn chuối do tảo lục; nước lợ, mặn tốt nhất là màu vàng nâu / màu nước trà do tảo khuê).',
          'Yếu tố thủy hóa: Độ pH (thích hợp từ 6,5 đến 8,5, dao động trong ngày không quá 0,5); Hàm lượng Oxygen hòa tan DO (tôm >= 3 mg/L, tốt nhất >= 5 mg/L; cá >= 4–5 mg/L); Khí độc NH3 (< 0,5 mg/L, tốt nhất < 0,1 mg/L) và H2S (< 0,05 mg/L); Độ mặn (nước ngọt < 5‰, nước lợ 5–25‰, nước mặn > 25–35‰).',
          'Yếu tố thủy sinh: Thực vật thủy sinh, sinh vật phù du (tảo khuê, tảo lục, động vật phù du làm thức ăn tự nhiên và tạo O2 ban ngày), vi sinh vật và động vật đáy.',
        ],
      },
      {
        branchNumber: 2,
        title: 'Các yếu tố ảnh hưởng đến môi trường nuôi thủy sản',
        subItems: [
          'Nguồn nước cấp (nước ngầm, nước sông hồ, nước biển ven bờ), tính lưu động của nước, tính chất thổ nhưỡng đáy ao (đất phèn làm giảm pH), thời tiết khí hậu (mưa lớn làm phân tầng nước và giảm độ mặn, giảm pH đột ngột) và quy trình kĩ thuật nuôi (mật độ thả, lượng thức ăn dư thừa).',
        ],
      },
      {
        branchNumber: 3,
        title: 'Quản lí môi trường nuôi thủy sản',
        subItems: [
          'Quản lí nguồn nước trước khi nuôi (lấy nước qua túi lọc vào ao lắng), trong khi nuôi (kiểm tra pH, DO, độ trong, độ kiềm hàng ngày; bật quạt nước/sục khí nhất là về ban đêm và rạng sáng; xi phông đáy ao hút chất thải) và sau khi thu hoạch.',
        ],
      },
      {
        branchNumber: 4,
        title: 'Biện pháp xử lí môi trường nuôi thủy sản',
        subItems: [
          'Xử lí nước trước khi nuôi thủy sản (4 bước chuẩn): Bước 1: Lắng lọc (bơm nước qua túi lọc vào ao lắng 3–7 ngày để lắng phù sa) -> Bước 2: Diệt tạp, khử khuẩn (dùng Saponin diệt cá tạp và Chlorine/Iodine/BKC diệt khuẩn) -> Bước 3: Khử hóa chất tồn dư (chạy quạt nước liên tục 3–5 ngày hoặc dùng Sodium thiosulfate để bay hết dư lượng Chlorine) -> Bước 4: Bón phân gây màu nước và bổ sung chế phẩm vi sinh trước khi thả giống.',
          'Xử lí nước sau thu hoạch: Thu gom bùn đáy ao đem ủ làm phân bón cho cây trồng, xử lí nước thải bằng bể lắng và hồ sinh học (nuôi cá rô phi, hàu, rong câu, cỏ vetiver) trước khi xả ra ngoài.',
          'Ứng dụng công nghệ sinh học trong xử lí môi trường: Dùng vi khuẩn dị dưỡng Bacillus spp., Lactobacillus phân giải mùn bã hữu cơ đáy ao; Dùng vi khuẩn nitrat hóa Nitrosomonas và Nitrobacter chuyển hóa khí độc NH3 -> NO2- -> NO3- không độc cho tôm cá.',
        ],
      },
    ],
    coreSummary: [
      'Tại sao phải bật quạt nước mạnh vào ban đêm và lúc rạng sáng (3h–6h sáng)? Vì ban đêm tảo không quang hợp tạo O2 mà cả tảo, vi sinh vật và tôm cá đều hô hấp tiêu thụ O2 làm hàm lượng DO trong ao giảm xuống mức thấp nhất vào lúc rạng sáng.',
      'Tại sao trong quy trình xử lí nước trước khi nuôi KHÔNG ĐƯỢC bón chế phẩm vi sinh cùng lúc với Chlorine/thuốc sát trùng? Vì Chlorine sẽ tiêu diệt toàn bộ vi sinh vật có ích trong chế phẩm; phải chạy quạt khử hết dư lượng Chlorine sau 3–5 ngày mới được cấy vi sinh.',
    ],
    questions: [
      {
        number: 1,
        question: 'Nêu các yêu cầu chính về thủy lí, thủy hóa và thủy sinh của môi trường nước nuôi thủy sản.',
        answer: [
          'Thủy lí: Nhiệt độ ổn định phù hợp từng loài (20–30 °C với loài nhiệt đới), độ trong 20–45 cm, màu nước xanh nõn chuối (nước ngọt) hoặc màu vàng nâu trà (nước lợ/mặn).',
          'Thủy hóa: Độ pH từ 6,5–8,5; hàm lượng oxygen hòa tan (DO) >= 4–5 mg/L; nồng độ khí độc NH3, NO2-, H2S ở mức rất thấp không gây độc; độ mặn và độ kiềm phù hợp từng đối tượng.',
          'Thủy sinh: Duy trì mật độ tảo có lợi (tảo lục, tảo khuê) và động vật phù du vừa phải; hạn chế tảo lam phát triển quá mức (hiện tượng "nở hoa" của nước) và tiêu diệt cá dữ, địch hại.',
        ],
      },
      {
        number: 2,
        question: 'Phân tích các yếu tố ảnh hưởng đến môi trường nuôi thủy sản. Vì sao sau những trận mưa lớn kéo dài cần phải kiểm tra và xử lí nước ao nuôi ngay?',
        answer: [
          'Các yếu tố ảnh hưởng: Nguồn nước cấp, chất đất đáy ao, thời tiết và hoạt động cho ăn, bài tiết của thủy sản.',
          'Sau mưa lớn kéo dài: Nước mưa làm giảm đột ngột nhiệt độ, độ mặn và độ pH, tạo hiện tượng phân tầng nước, đồng thời nước mưa rửa trôi phèn từ bờ ao xuống làm pH tụt sâu và có thể gây sập tảo làm thiếu hụt DO. Vì vậy cần tháo bớt tầng nước mặt, bật quạt nước đảo đều nước và rải vôi CaCO3/Dolomite quanh bờ và xuống ao để ổn định pH và hệ đệm.',
        ],
      },
      {
        number: 3,
        question: 'Trình bày quy trình xử lí nguồn nước trước khi nuôi thủy sản và biện pháp xử lí nước thải sau thu hoạch.',
        answer: [
          'Trước khi nuôi (4 bước): (1) Bơm nước qua lưới lọc vào ao lắng để lắng chất lơ lửng; (2) Diệt tạp và diệt khuẩn bằng hóa chất được phép sử dụng (Saponin, Chlorine, thuốc tím); (3) Chạy quạt nước sục khí để khử hết dư lượng hóa chất sát trùng; (4) Gây màu nước và cấy chế phẩm vi sinh có lợi để tạo hệ sinh thái ổn định trước khi thả con giống.',
          'Sau thu hoạch: Không xả trực tiếp bùn và nước thải đặc ra sông rạch; bơm nước thải qua ao lắng có thả cá ăn mùn bã (cá rô phi, cá trôi), nhuyễn thể lọc nước (ngao, hàu) và thực vật thủy sinh để làm sạch sinh học trước khi thải ra môi trường.',
        ],
      },
      {
        number: 4,
        question: 'Trình bày cơ sở khoa học của việc ứng dụng công nghệ sinh học trong xử lí khí độc và chất thải hữu cơ trong ao nuôi thủy sản.',
        answer: [
          'Xử lí chất thải hữu cơ: Các chủng vi khuẩn Bacillus (B. subtilis, B. licheniformis) tiết enzyme protease, amylase, lipase phân giải nhanh thức ăn thừa và phân tôm cá thành CO2 và nước, làm sạch đáy ao.',
          'Xử lí khí độc NH3 và NO2-: Vi khuẩn tự dưỡng Nitrosomonas chuyển hóa NH3/NH4+ (rất độc) thành Nitrite (NO2-), tiếp theo vi khuẩn Nitrobacter chuyển hóa NO2- thành Nitrate (NO3-) không độc và được tảo hấp thụ làm dinh dưỡng.',
        ],
      },
    ],
  },
  {
    id: 'cn12-c6',
    grade: '12',
    bookTitle: 'Công nghệ 12 – Lâm nghiệp – Thủy sản',
    domain: 'aquaculture',
    chapterNumber: 'Chương VI',
    chapterTitle: 'Công nghệ giống thủy sản',
    pageRef: 'Ôn tập Chương VI – Trang 80 SGK Công nghệ 12',
    lessons: [
      'Bài 13: Vai trò của giống và đặc điểm sinh sản của cá, tôm (trang 66)',
      'Bài 14: Kĩ thuật ương nuôi cá, tôm giống (trang 70)',
      'Bài 15: Ứng dụng công nghệ sinh học trong chọn và nhân giống thủy sản (trang 75)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Vai trò của giống thủy sản',
        subItems: [
          'Quyết định năng suất và chất lượng sản phẩm thủy sản; quyết định tỉ lệ sống và hiệu quả kinh tế của vụ nuôi.',
        ],
      },
      {
        branchNumber: 2,
        title: 'Kĩ thuật ương nuôi cá và tôm giống',
        subItems: [
          'Đặc điểm sinh sản của cá và tôm: Tuổi thành thục sinh dục, mùa vụ sinh sản (tập trung vào mùa xuân – thu khi ấm áp và có mưa rào), phương thức sinh sản (đa số cá đẻ trứng thụ tinh ngoài trong nước; tôm giao vĩ, con đực gắn túi tinh vào con cái trước khi đẻ).',
          'Kĩ thuật ương nuôi cá giống (trong ao đất hoặc bể): Chia làm 2 giai đoạn chính là Ương từ cá bột lên cá hương (khoảng 25–30 ngày, thức ăn ban đầu là lòng đỏ trứng, bột đậu nành, sinh vật phù du Luân trùng/Moina) và Ương từ cá hương lên cá giống (khoảng 30–60 ngày, thức ăn công nghiệp có độ đạm 28–35%).',
          'Kĩ thuật ương nuôi tôm giống (tôm sú, tôm thẻ chân trắng trong bể xi măng/composite): Độ mặn nước 28–30‰; Ấu trùng tôm biến thái qua 4 giai đoạn: Nauplius (dinh dưỡng bằng noãn hoàng tự thân, có tính hướng quang mạnh) -> Zoea (bắt đầu ăn tảo khuê tươi/khô) -> Mysis (ăn tảo + ấu trùng Artemia bung dù) -> Postlarvae / PL (ăn Artemia và thức ăn tổng hợp; xuất bán ở giai đoạn PL12–PL15 sau khi đã thuần hóa độ mặn).',
        ],
      },
      {
        branchNumber: 3,
        title: 'Công nghệ sinh học trong chọn và nhân giống thủy sản',
        subItems: [
          'Trong chọn giống thủy sản: Ứng dụng chỉ thị phân tử DNA (MAS) để chọn tạo các dòng tôm, cá lớn nhanh và kháng bệnh (như tôm thẻ kháng virus Taura/WSSV, cá tra kháng bệnh gan thận mủ).',
          'Trong nhân giống thủy sản: (1) Sử dụng hormone ngoại sinh kích thích sinh sản nhân tạo (LRHa, GnRHa kết hợp chất kháng dopamine DOM, HCG hoặc dịch chiết não thùy cá) giúp các loài cá không tự đẻ trong ao tĩnh (cá mè, cá trắm, cá tra) đẻ đồng loạt; (2) Điều khiển giới tính tạo đàn cá rô phi đơn tính đực (trộn hormone 17α-methyltestosterone vào thức ăn cho cá bột ăn trong 21 ngày đầu đạt 85–95% cá đực lớn nhanh, không đẻ tạp trong ao nuôi thương phẩm); (3) Bảo quản lạnh tinh trùng cá (ngắn hạn ở 0–4 °C và dài hạn hàng năm trong bình nitrogen lỏng ở -196 °C).',
        ],
      },
    ],
    coreSummary: [
      'Thứ tự 4 giai đoạn phát triển của ấu trùng tôm biển/nước lợ: Trứng -> Nauplius (dùng noãn hoàng, chưa ăn ngoài) -> Zoea (ăn thực vật phù du/tảo) -> Mysis (ăn động vật phù du/Artemia) -> Postlarvae (PL – hình dạng giống tôm trưởng thành).',
      'Tại sao trong nuôi cá rô phi thương phẩm người ta ưu tiên nuôi cá rô phi đơn tính ĐỰC? Vì cá rô phi cái thành thục rất sớm (3–4 tháng tuổi đã đẻ) và ấp trứng trong miệng khiến cá cái chậm lớn và ao nuôi bị dày đặc cá con phân cỡ; cá đực không tốn năng lượng sinh sản nên tốc độ tăng trưởng nhanh hơn cá cái 20–30%.',
    ],
    questions: [
      {
        number: 1,
        question: 'Nêu vai trò của giống trong nuôi trồng thủy sản và trình bày các đặc điểm sinh sản cơ bản của cá và tôm.',
        answer: [
          'Vai trò: Con giống khỏe mạnh, sạch bệnh (SPF) và có tiềm năng di truyền tốt quyết định tỉ lệ sống, tốc độ tăng trưởng, hệ số chuyển đổi thức ăn (FCR) và chất lượng thịt thương phẩm.',
          'Đặc điểm sinh sản: Cá và tôm có tuổi thành thục khác nhau tùy loài (cá rô phi 4–6 tháng, cá chép/rô đồng ~1 năm, cá trắm/cá mè 2–4 năm); sức sinh sản của thủy sản rất lớn (từ vài vạn đến hàng triệu trứng/con cái) để bù đắp tỉ lệ hao hụt tự nhiên ngoài môi trường nước.',
        ],
      },
      {
        number: 2,
        question: 'Trình bày quy trình kĩ thuật ương nuôi cá giống từ cá bột lên cá giống.',
        answer: [
          'Gồm 5 bước: (1) Chuẩn bị ao ương (tát cạn, vét bùn, bón vôi 7–10 kg/100m2 phơi đáy 3–5 ngày, lấy nước qua lưới lọc và bón phân gây màu nước tạo sinh vật phù du); (2) Chọn và thả cá bột (thả vào sáng sớm hoặc chiều mát, ngâm túi cá 15–20 phút để cân bằng nhiệt độ); (3) Chăm sóc và cho ăn (tuần đầu ăn lòng đỏ trứng, sữa đậu nành và luân trùng, sau đó ăn bột cám/thức ăn công nghiệp giàu đạm 30–40%); (4) Quản lí môi trường và phòng bệnh; (5) Thu hoạch (luyện cá bằng lưới trước khi vận chuyển đi xa).',
        ],
      },
      {
        number: 3,
        question: 'Mô tả các giai đoạn phát triển và loại thức ăn tương ứng trong quy trình ương nuôi ấu trùng tôm biển/nước lợ.',
        answer: [
          'Giai đoạn Nauplius (kéo dài ~36–48 giờ): Ấu trùng tự dinh dưỡng bằng túi noãn hoàng, không cần cho ăn.',
          'Giai đoạn Zoea (Z1 -> Z3): Ấu trùng bắt đầu mở miệng ăn ngoài, thức ăn chính là tảo khuê tươi (Chaetoceros, Skeletonema) kết hợp thức ăn vi nang kích thước nhỏ.',
          'Giai đoạn Mysis (M1 -> M3): Chuyển sang ăn động vật phù du, thức ăn chính là ấu trùng Artemia bung dù/mới nở kết hợp tảo và thức ăn tổng hợp.',
          'Giai đoạn Postlarvae (PL1 -> PL15): Ăn ấu trùng Artemia và thức ăn công nghiệp chuyên dùng cho tôm giống.',
        ],
      },
      {
        number: 4,
        question: 'Phân tích ý nghĩa và cơ sở khoa học của các ứng dụng công nghệ sinh học trong nhân giống thủy sản (tiêm hormone sinh sản nhân tạo, tạo cá rô phi đơn tính đực, bảo quản lạnh tinh trùng).',
        answer: [
          'Tiêm hormone sinh sản (LRHa + DOM, HCG): Bổ sung hormone giải phóng kích dục tố tác động lên tuyến yên cá bố mẹ làm trứng chín rụng đồng loạt, giúp chủ động sản xuất giống nhân tạo quanh năm cho cả những loài cá sông không tự đẻ trong ao tù.',
          'Tạo cá rô phi đơn tính đực: Ở giai đoạn cá bột mới tiêu hết noãn hoàng (tuyến sinh dục chưa biệt hóa hoàn toàn), bổ sung hormone đực 17α-methyltestosterone vào thức ăn trong 21 ngày sẽ hướng tuyến sinh dục biệt hóa thành tinh hoàn, tạo đàn cá 85–95% đực.',
          'Bảo quản lạnh tinh trùng trong nitrogen lỏng (-196 °C): Ngừng mọi hoạt động trao đổi chất của tế bào tinh trùng nhưng vẫn giữ nguyên khả năng thụ tinh sau khi giải đông, phục vụ bảo tồn nguồn gene loài nguy cấp và lai tạo các loài lệch mùa sinh sản.',
        ],
      },
    ],
  },
  {
    id: 'cn12-c7',
    grade: '12',
    bookTitle: 'Công nghệ 12 – Lâm nghiệp – Thủy sản',
    domain: 'aquaculture',
    chapterNumber: 'Chương VII',
    chapterTitle: 'Công nghệ thức ăn thủy sản',
    pageRef: 'Ôn tập Chương VII – Trang 92 SGK Công nghệ 12',
    lessons: [
      'Bài 16: Thức ăn thủy sản (trang 81)',
      'Bài 17: Phương pháp bảo quản và chế biến thức ăn thủy sản (trang 85)',
      'Bài 18: Ứng dụng công nghệ sinh học trong bảo quản, chế biến thức ăn thủy sản (trang 89)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Thức ăn thủy sản: Thành phần dinh dưỡng và các nhóm thức ăn',
        subItems: [
          'Thành phần dinh dưỡng của thức ăn thủy sản: Nước và Chất khô (Protein – quan trọng nhất, yêu cầu hàm lượng đạm của thủy sản cao hơn vật nuôi trên cạn, thường từ 25% đến 50%; Lipid; Carbohydrate; Vitamin; Chất khoáng).',
          'Các nhóm thức ăn thủy sản (4 nhóm): (1) Thức ăn hỗn hợp (dạng viên nổi cho cá ăn tầng mặt/giữa như cá rô phi, cá tra và dạng viên chìm có độ bền trong nước cao cho tôm, cua ăn đáy); (2) Chất bổ sung (vitamin C, khoáng vi lượng, enzyme, chế phẩm probiotic, chất dẫn dụ mùi vị giúp tôm cá bắt mồi nhanh); (3) Thức ăn tươi sống (cá tạp, giun quế, ấu trùng Artemia, luân trùng, tảo tươi); (4) Nguyên liệu thức ăn (bột cá, khô đậu nành, cám gạo, bột mì).',
        ],
      },
      {
        branchNumber: 2,
        title: 'Bảo quản thức ăn thủy sản',
        subItems: [
          'Bảo quản thức ăn hỗn hợp: Đóng bao chống ẩm, độ ẩm viên thức ăn <= 10–12%, xếp trên kệ pallet cách mặt sàn 10–15 cm và cách tường >= 20 cm, không xếp cao quá 10 bao.',
          'Bảo quản chất bổ sung: Độ ẩm 5–7%, để nơi khô mát tránh ánh sáng trực tiếp.',
          'Bảo quản thức ăn tươi sống: Bảo quản lạnh (4–8 °C), cấp đông (-18 °C) đối với cá tạp/mực hoặc nuôi lưu sống sục khí đối với tảo, luân trùng, Artemia.',
        ],
      },
      {
        branchNumber: 3,
        title: 'Chế biến thức ăn thủy sản và ứng dụng công nghệ sinh học',
        subItems: [
          'Chế biến thủ công và Chế biến công nghiệp (5 bước: Nghiền nhỏ nguyên liệu -> Phối trộn theo công thức -> Hấp chín và ép viên / ép đùn -> Sấy khô và phun áo dầu cá/vitamin -> Làm nguội và đóng bao).',
          'Ứng dụng công nghệ sinh học trong chế biến thức ăn thủy sản: (1) Thủy phân phụ phẩm cá tra/cá biển bằng enzyme protease để sản xuất dịch đạm thủy phân giàu peptide và amino acid tự do (như lysine) giúp ấu trùng tôm cá hấp thu dễ dàng (5 bước); (2) Lên men khô dầu đậu nành bằng vi khuẩn Bacillus subtilis / nấm mốc Aspergillus oryzae để phân hủy các chất kháng dinh dưỡng và thay thế một phần bột cá đắt tiền (5 bước).',
        ],
      },
    ],
    coreSummary: [
      'Điểm khác biệt lớn nhất của thức ăn viên thủy sản so với thức ăn chăn nuôi gia súc, gia cầm: Thức ăn thủy sản được rải trực tiếp vào môi trường nước nên bắt buộc phải có chất kết dính và công nghệ ép đùn để viên thức ăn lâu tan rã trong nước (tránh thất thoát dinh dưỡng và gây ô nhiễm nước ao), đồng thời phải có chất dẫn dụ kích thích khứu giác giúp tôm cá tìm mồi nhanh.',
      'Tại sao phun bổ sung dầu cá, vitamin và enzyme thường thực hiện SAU KHI viên thức ăn đã ép nhiệt và sấy khô (công nghệ phun phủ chân không)? Vì nhiệt độ cao trong buồng ép đùn (100–130 °C) sẽ làm phân hủy vitamin, mất hoạt tính enzyme và làm oxy hóa acid béo không no.',
    ],
    questions: [
      {
        number: 1,
        question: 'Trình bày thành phần dinh dưỡng và phân biệt các nhóm thức ăn thủy sản phổ biến.',
        answer: [
          'Thành phần dinh dưỡng: Nước và chất khô gồm Protein (cung cấp amino acid thiết yếu và năng lượng chính cho thủy sản), Lipid (cung cấp acid béo thiết yếu HUFA/PUFA và dung môi hòa tan vitamin A, D, E, K), Carbohydrate (tạo năng lượng và chất kết dính viên thức ăn), Vitamin và Khoáng.',
          '4 nhóm thức ăn: Thức ăn hỗn hợp hoàn chỉnh (viên nổi, viên chìm, mảnh vụn), Chất bổ sung (vitamin, khoáng, men tiêu hóa, chất dẫn dụ), Thức ăn tươi sống (tảo, luân trùng, Artemia, cá tạp) và Nguyên liệu đơn (bột cá, khô đậu tương, bột mì).',
        ],
      },
      {
        number: 2,
        question: 'Nêu các bước trong quy trình sản xuất thức ăn hỗn hợp công nghiệp cho thủy sản và cách bảo quản từng nhóm thức ăn.',
        answer: [
          'Quy trình 5 bước sản xuất công nghiệp: Nghiền siêu mịn nguyên liệu -> Cân và phối trộn đồng đều -> Gia nhiệt hơi nước và ép viên (ép đùn tạo viên nổi cho cá hoặc ép viên nén tạo viên chìm cho tôm) -> Sấy khô đến độ ẩm 10–12% và phun phủ dầu/vitamin -> Làm nguội và đóng bao.',
          'Bảo quản: Thức ăn hỗn hợp và nguyên liệu khô bảo quản trong kho thông thoáng trên kệ pallet cách sàn 10–15 cm; thức ăn tươi sống bảo quản trong kho lạnh hoặc tủ cấp đông, còn sinh vật phù du (tảo, luân trùng) bảo quản sống trong bể sục khí có chiếu sáng.',
        ],
      },
      {
        number: 3,
        question: 'Phân tích vai trò của ứng dụng công nghệ sinh học trong chế biến thức ăn thủy sản (thủy phân phụ phẩm bằng enzyme và lên men khô đậu nành).',
        answer: [
          'Thủy phân phụ phẩm thủy sản (đầu, xương, nội tạng cá tra) bằng enzyme protease: Cắt các phân tử protein lớn khó tiêu thành peptide mạch ngắn và amino acid tự do (giàu lysine, methionine), vừa tận dụng phụ phẩm bảo vệ môi trường, vừa tạo nguồn đạm dễ tiêu hóa và có mùi thơm dẫn dụ tôm cá bắt mồi.',
          'Lên men khô dầu đậu nành bằng vi sinh vật: Giúp loại bỏ hoàn toàn các yếu tố kháng dinh dưỡng trong thực vật (antitrypsin, oligosaccharide gây đầy hơi), nâng hàm lượng protein dễ tiêu lên cao để thay thế nguồn bột cá biển đang ngày càng cạn kiệt và đắt đỏ.',
        ],
      },
    ],
  },
  {
    id: 'cn12-c8',
    grade: '12',
    bookTitle: 'Công nghệ 12 – Lâm nghiệp – Thủy sản',
    domain: 'aquaculture',
    chapterNumber: 'Chương VIII',
    chapterTitle: 'Công nghệ nuôi thủy sản',
    pageRef: 'Ôn tập Chương VIII – Trang 117 SGK Công nghệ 12',
    lessons: [
      'Bài 19: Kĩ thuật nuôi một số loài thủy sản phổ biến (trang 93)',
      'Bài 20: Nuôi thủy sản theo tiêu chuẩn VietGAP (trang 101)',
      'Bài 21: Một số ứng dụng công nghệ cao trong nuôi thủy sản (trang 105)',
      'Bài 22: Bảo quản và chế biến sản phẩm thủy sản (trang 110)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Công nghệ nuôi thủy sản phổ biến và công nghệ cao',
        subItems: [
          'Nuôi cá rô phi trong lồng trên sông, hồ chứa: Lồng kích thước 6x6x3 m hoặc 9x6x3 m đặt nơi nước chảy nhẹ 0,2–0,3 m/s; mật độ 50–150 con/m3; cho ăn thức ăn viên nổi đạm 30–35%; thu hoạch sau 6–8 tháng khi cá đạt > 0,8–1,0 kg/con.',
          'Nuôi tôm thẻ chân trắng trong ao (3 giai đoạn công nghệ cao): Giai đoạn 1 (ương trong bể/ao gièo 25–30 ngày, mật độ 500–1000 con/m2) -> Giai đoạn 2 (nuôi 30 ngày tiếp, mật độ 250–500 con/m2) -> Giai đoạn 3 (nuôi thương phẩm 30–40 ngày cuối, mật độ 100–150 con/m2, thu hoạch cỡ 30–60 con/kg).',
          'Nuôi ngao (nghêu) ngoài bãi triều: Bãi cát pha bùn, độ mặn 15–25‰, phơi bãi không quá 4–6 giờ/ngày, rào lưới vây quanh bãi, không cần cho ăn vì ngao tự lọc sinh vật phù du và mùn bã hữu cơ trong nước, thu hoạch sau 12–18 tháng (cỡ 30–50 con/kg).',
          'Nuôi thủy sản theo tiêu chuẩn VietGAP (7 bước).',
          'Công nghệ cao trong nuôi thủy sản: Công nghệ nuôi tuần hoàn khép kín RAS (Recirculating Aquaculture System – nước chảy qua bể nuôi -> lọc cơ học tách phân -> lọc sinh học chuyển hóa NH3 -> khử trùng UV/Ozone -> bổ sung O2 rồi quay lại bể nuôi, kết hợp trồng rau Aquaponics) và Công nghệ Biofloc (bổ sung nguồn carbon như mật rỉ đường để duy trì tỉ lệ C : N từ 10 : 1 đến 20 : 1 giúp vi khuẩn dị dưỡng kết tụ chất thải thành hạt floc làm thức ăn giàu đạm tại chỗ cho tôm, cá).',
        ],
      },
      {
        branchNumber: 2,
        title: 'Chế biến và bảo quản sản phẩm thủy sản',
        subItems: [
          'Phương pháp bảo quản thông thường: Bảo quản lạnh bằng nước đá (< 4 °C), cấp đông (-18 °C), làm khô, ướp muối.',
          'Công nghệ cao trong bảo quản trên tàu khai thác xa bờ: Công nghệ đá bọt / bóng khí siêu nhỏ Nano UFB (Ultra Fine Bubble chứa khí Nitrogen làm giảm lượng O2 trong nước lạnh -1,5 đến -1 °C giúp cá ngừ đại dương không bị oxy hóa, giữ thịt đỏ tươi đạt chuẩn Sashimi) kết hợp hầm bảo quản cách nhiệt bằng vật liệu Polyurethane (PU) giữ lạnh 20–30 ngày.',
          'Phương pháp chế biến thủy sản: Sản xuất nước mắm truyền thống (ủ chượp cá với muối tỉ lệ 3 cá : 1 muối trong 6–12 tháng nhờ enzyme protease nội tại của cá và vi sinh vật ưa mặn), làm tôm chua (5–7 ngày), chế biến cá tra phi lê đông lạnh xuất khẩu, đồ hộp thủy sản và ứng dụng CNSH sản xuất chả cá Surimi từ mực đại dương nhờ bổ sung enzyme Transglutaminase (TGase) tạo cấu trúc gel dai giòn.',
        ],
      },
    ],
    coreSummary: [
      'Nguyên lí cốt lõi của công nghệ Biofloc (BFT): Bổ sung nguồn Carbon hữu cơ (mật rỉ đường, bột mì, cám gạo) vào nước ao nuôi có sục khí liên tục để đạt tỉ lệ C : N khoảng 10:1 – 20:1. Khi đó, vi khuẩn dị dưỡng sẽ hấp thụ trực tiếp khí độc NH3/NH4+ trong nước để tổng hợp thành sinh khối protein vi khuẩn (hạt Biofloc), vừa làm sạch nước (không cần thay nước), vừa làm thức ăn giàu đạm cho tôm thẻ chân trắng và cá rô phi.',
      'Tại sao hầm bảo quản bằng vật liệu Polyurethane (PU) tốt hơn hầm xốp Polystyrene truyền thống trên tàu cá? Vì PU có hệ số dẫn nhiệt cực thấp, cách nhiệt kín khít giúp giảm 30–40% lượng đá tan chảy và kéo dài thời gian chuyến biển từ 20–30 ngày.',
    ],
    questions: [
      {
        number: 1,
        question: 'So sánh đặc điểm kĩ thuật của mô hình nuôi cá rô phi trong lồng bè, nuôi tôm thẻ chân trắng thâm canh 3 giai đoạn và nuôi ngao ngoài bãi triều.',
        answer: [
          'Cá rô phi lồng bè: Tận dụng lưu tốc dòng chảy tự nhiên trên sông/hồ để cung cấp O2 và cuốn trôi chất thải, mật độ cao, dùng thức ăn viên nổi hoàn toàn.',
          'Tôm thẻ chân trắng 3 giai đoạn: Nuôi trong hệ thống bể/ao lót bạt có mái che, sang thưa dần qua 3 giai đoạn giúp kiểm soát dịch bệnh sớm, rút ngắn thời gian mỗi vụ thương phẩm và cho phép quay vòng 4–6 vụ/năm.',
          'Nuôi ngao bãi triều: Thả trực tiếp trên bãi triều tự nhiên ven biển có rào lưới chắn, hoàn toàn không tốn chi phí thức ăn (ngao ăn lọc tự nhiên), thân thiện với môi trường.',
        ],
      },
      {
        number: 2,
        question: 'Trình bày nguyên lí hoạt động và ưu điểm của hệ thống nuôi thủy sản tuần hoàn (RAS) và công nghệ Biofloc.',
        answer: [
          'Hệ thống tuần hoàn RAS: Nước từ bể nuôi được thu hồi qua bể lọc cơ học (tách chất thải rắn), bể lọc sinh học (vi khuẩn nitrat hóa khử NH3), thiết bị tiệt trùng tia UV/Ozone và sục khí O2 trước khi bơm ngược lại bể nuôi. Ưu điểm: Tiết kiệm 90–95% lượng nước, cách li hoàn toàn dịch bệnh bên ngoài, nuôi được mật độ siêu cao ngay cả trong nhà phố.',
          'Công nghệ Biofloc: Bổ sung nguồn Carbon để kích thích vi khuẩn dị dưỡng phát triển mạnh (tỉ lệ C/N = 10/1 đến 20/1), chuyển hóa chất thải chứa Nitơ thành các hạt sinh khối Biofloc lơ lửng trong nước. Ưu điểm: Xử lí triệt để khí độc NH3, giảm 20–30% chi phí thức ăn công nghiệp và hạn chế thay nước (Zero water exchange).',
        ],
      },
      {
        number: 3,
        question: 'Vì sao sản phẩm thủy sản rất dễ bị ươn hỏng sau khi thu hoạch? Trình bày các công nghệ cao bảo quản thủy sản trên tàu khai thác.',
        answer: [
          'Nguyên nhân nhanh ươn hỏng: Thủy sản có hàm lượng nước cao (70–80%), giàu protein và acid béo không no dễ bị oxy hóa, mô liên kết lỏng lẻo và hệ enzyme tự phân giải trong nội tạng cũng như vi sinh vật trên mang, da hoạt động rất mạnh ngay sau khi cá chết.',
          'Công nghệ cao trên tàu: Dùng hầm bảo quản bọc vật liệu cách nhiệt Polyurethane (PU) kết hợp máy làm đá vảy nước biển hoặc công nghệ nano UFB (bơm bóng khí Nitrogen siêu mịn vào nước biển lạnh -1,5 đến -1 °C để đuổi O2 hòa tan, làm tê liệt vi khuẩn hiếu khí và giữ màu thịt cá ngừ tươi nguyên vẹn).',
        ],
      },
      {
        number: 4,
        question: 'Giải thích cơ sở khoa học của quy trình chế biến nước mắm truyền thống và ứng dụng enzyme trong sản xuất Surimi.',
        answer: [
          'Chế biến nước mắm truyền thống: Dựa trên quá trình thủy phân protein thịt cá thành các amino acid tự do nhờ hệ enzyme protease có sẵn trong ruột cá dưới điều kiện nồng độ muối cao (20–25% muối giúp ức chế vi khuẩn gây thối nhưng vẫn cho phép enzyme và vi khuẩn ưa mặn tạo hương hoạt động).',
          'Sản xuất Surimi bằng enzyme: Sử dụng enzyme Transglutaminase (TGase) xúc tác tạo liên kết đồng hóa trị giữa các chuỗi protein myofibrillar của thịt cá/mực xay nhuyễn, giúp tạo khối gel có độ đàn hồi và độ dai giòn cao.',
        ],
      },
      {
        number: 5,
        question: 'Nêu ý nghĩa của việc áp dụng quy trình nuôi thủy sản theo tiêu chuẩn VietGAP.',
        answer: [
          'Đảm bảo 4 trụ cột: An toàn vệ sinh thực phẩm (sản phẩm không chứa kháng sinh cấm, hóa chất độc hại, đáp ứng rào cản kĩ thuật xuất khẩu sang Mỹ, EU, Nhật Bản), An toàn dịch bệnh, Bảo vệ môi trường sinh thái và Đảm bảo sức khỏe, phúc lợi xã hội cho người lao động.',
        ],
      },
    ],
  },
  {
    id: 'cn12-c9',
    grade: '12',
    bookTitle: 'Công nghệ 12 – Lâm nghiệp – Thủy sản',
    domain: 'aquaculture',
    chapterNumber: 'Chương IX',
    chapterTitle: 'Phòng, trị bệnh thủy sản',
    pageRef: 'Ôn tập Chương IX – Trang 133 SGK Công nghệ 12',
    lessons: [
      'Bài 23: Vai trò của phòng, trị bệnh thủy sản (trang 118)',
      'Bài 24: Một số bệnh thủy sản phổ biến và biện pháp phòng, trị (trang 122)',
      'Bài 25: Ứng dụng công nghệ sinh học trong phòng, trị bệnh thủy sản (trang 128)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Vai trò của phòng, trị bệnh thủy sản',
        subItems: [
          'Đối với thủy sản: Giúp tôm, cá khỏe mạnh, sinh trưởng nhanh, nâng cao tỉ lệ sống.',
          'Đối với kinh tế – xã hội: Giảm chi phí thuốc hóa chất, ổn định sản lượng và tăng thu nhập cho người nuôi.',
          'Đối với con người và môi trường: Tạo nguồn thực phẩm thủy sản sạch không tồn dư kháng sinh và hạn chế sự hình thành các chủng vi khuẩn kháng kháng sinh trong môi trường nước.',
        ],
      },
      {
        branchNumber: 2,
        title: 'Một số bệnh thủy sản phổ biến và biện pháp phòng, trị',
        subItems: [
          'Bệnh lồi mắt, xuất huyết ở cá rô phi: Do liên cầu khuẩn Gram dương Streptococcus agalactiae gây ra (phát triển mạnh khi nhiệt độ nước cao > 30 °C); cá bơi lờ đờ quay cuồng, mắt lồi đục có xuất huyết.',
          'Bệnh gan thận mủ trên cá tra: Do trực khuẩn Gram âm Edwardsiella ictaluri gây ra (vào mùa mưa lũ, nhiệt độ 25–28 °C); giải phẫu thấy gan, thận, lách sưng to và có nhiều đốm mủ trắng đục đường kính 1–3 mm.',
          'Bệnh hoại tử thần kinh (VNN – Viral Nervous Necrosis) trên cá biển (cá song/cá mú, cá chẽm): Do virus RNA Betanodavirus gây ra; cá bơi xoáy tròn bất thường, bóng hơi căng phồng, tỉ lệ chết ở cá giống lên tới 80–100%.',
          'Bệnh đốm trắng trên tôm (WSSV – White Spot Syndrome Virus): Do virus DNA có vỏ bọc gây ra (bùng phát mạnh khi nhiệt độ nước thấp < 30 °C hoặc biến động môi trường); vỏ đầu ngực và đốt bụng có nhiều đốm trắng tròn đường kính 0,5–2 mm, tôm dạt bờ và chết 100% chỉ sau 3–7 ngày.',
        ],
      },
      {
        branchNumber: 3,
        title: 'Công nghệ sinh học trong phòng, trị bệnh thủy sản',
        subItems: [
          'Chẩn đoán sớm mầm bệnh: Kĩ thuật PCR / Real-time PCR (4 bước: Tách chiết DNA/RNA -> Nhân bản PCR -> Điện di/đọc tín hiệu huỳnh quang -> Phân tích kết quả) và Kit chẩn đoán nhanh miễn dịch sắc kí (cho kết quả tại ao chỉ sau 15 phút) giúp sàng lọc con giống sạch bệnh (SPF).',
          'Sản xuất vaccine phòng bệnh cho cá: Vaccine bất hoạt và vaccine DNA tái tổ hợp phòng bệnh Streptococcus ở cá rô phi, bệnh gan thận mủ ở cá tra (đưa vào cơ thể cá bằng 3 cách: Tiêm, Ngâm hoặc Trộn vào thức ăn). Lưu ý: Tôm không có hệ miễn dịch đặc hiệu tạo kháng thể nhớ như động vật có xương sống nên không dùng vaccine truyền thống mà dùng chất kích thích miễn dịch (Beta-glucan).',
          'Sản xuất chế phẩm vi sinh (Probiotics như Bacillus sp., Saccharomyces) và chế phẩm thảo dược (chế phẩm men tỏi giàu hoạt chất kháng sinh tự nhiên Allicin trộn thức ăn tăng sức đề kháng và phòng bệnh đường ruột).',
        ],
      },
    ],
    coreSummary: [
      'Tại sao trong nuôi thủy sản phương châm "Phòng bệnh hơn chữa bệnh" lại đặc biệt quan trọng hơn cả chăn nuôi trên cạn? Vì tôm cá sống chìm trong môi trường nước nên rất khó phát hiện sớm từng cá thể mắc bệnh, khó cách li riêng, khi rải thuốc vào nước thì tốn kém và dễ làm ô nhiễm cả ao, còn khi cá đã bệnh nặng bỏ ăn thì trộn thuốc vào thức ăn cá cũng không ăn được.',
      'Phân biệt tác nhân 4 bệnh trọng tâm Lớp 12: (1) Lồi mắt cá rô phi -> Vi khuẩn Gram (+) Streptococcus agalactiae; (2) Gan thận mủ cá tra -> Vi khuẩn Gram (-) Edwardsiella ictaluri; (3) Hoại tử thần kinh VNN cá biển -> Virus RNA Betanodavirus; (4) Đốm trắng trên tôm WSSV -> Virus DNA.',
    ],
    questions: [
      {
        number: 1,
        question: 'Vì sao trong nuôi trồng thủy sản phải lấy phòng bệnh là chính? Nêu các biện pháp phòng bệnh tổng hợp cho thủy sản.',
        answer: [
          'Lí do: Thủy sản sống dưới nước nên khó quan sát triệu chứng sớm, mầm bệnh phát tán qua môi trường nước cực nhanh cho cả đàn; khi tôm cá đã mắc bệnh nặng thường bỏ ăn nên việc cấp thuốc qua thức ăn không còn hiệu quả.',
          'Biện pháp phòng bệnh tổng hợp: (1) Cải tạo ao và xử lí nguồn nước triệt để trước khi nuôi; (2) Chọn con giống khỏe mạnh, đã qua xét nghiệm PCR sạch bệnh (SPF); (3) Thả mật độ vừa phải, cho ăn vừa đủ kết hợp bổ sung Vitamin C, Beta-glucan, chế phẩm tỏi và men tiêu hóa; (4) Định kì dùng chế phẩm vi sinh xử lí nước và đáy ao.',
        ],
      },
      {
        number: 2,
        question: 'So sánh nguyên nhân, dấu hiệu bệnh lí đặc trưng và cách phòng trị của 4 bệnh: Lồi mắt ở cá rô phi, Gan thận mủ ở cá tra, Hoại tử thần kinh ở cá biển và Đốm trắng ở tôm.',
        answer: [
          'Bệnh do vi khuẩn (Lồi mắt cá rô phi do Streptococcus agalactiae; Gan thận mủ cá tra do Edwardsiella ictaluri): Lồi mắt cá rô phi có triệu chứng mắt lồi đục, xuất huyết gốc vây; Gan thận mủ cá tra có các đốm trắng như hạt tấm trên gan, thận, lách. Cả hai bệnh này phòng bằng vaccine hoặc trị bằng kháng sinh được phép sử dụng theo kháng sinh đồ.',
          'Bệnh do virus (Hoại tử thần kinh cá biển do Betanodavirus; Đốm trắng trên tôm do WSSV): Cá biển bị VNN bơi xoáy bất thường; Tôm bị WSSV xuất hiện đốm trắng dưới vỏ kitin và chết hàng loạt sau vài ngày. Cả hai bệnh do virus đều KHÔNG trị được bằng kháng sinh, phải phòng bằng kiểm dịch giống bằng PCR, diệt vật chủ trung gian (cua, còng, tôm hoang dã) và đảm bảo an toàn sinh học.',
        ],
      },
      {
        number: 3,
        question: 'Trình bày các ứng dụng công nghệ sinh học trong chẩn đoán, phòng và trị bệnh thủy sản.',
        answer: [
          'Trong chẩn đoán: Ứng dụng kĩ thuật PCR / RT-PCR và que thử nhanh miễn dịch giúp phát hiện chính xác virus WSSV, VNN, vi khuẩn gây bệnh trên tôm cá bố mẹ và con giống trước khi thả nuôi.',
          'Trong phòng và trị bệnh: Sản xuất vaccine DNA tái tổ hợp cho cá; sản xuất chế phẩm vi sinh (Bacillus, Lactobacillus) cạnh tranh ức chế vi khuẩn gây bệnh Vibrio; sản xuất chế phẩm thảo dược lên men (men tỏi giàu allicin, diếp cá, trầu không) thay thế kháng sinh hóa học.',
        ],
      },
    ],
  },
  {
    id: 'cn12-c10',
    grade: '12',
    bookTitle: 'Công nghệ 12 – Lâm nghiệp – Thủy sản',
    domain: 'aquaculture',
    chapterNumber: 'Chương X',
    chapterTitle: 'Bảo vệ và khai thác nguồn lợi thủy sản',
    pageRef: 'Ôn tập Chương X – Trang 143 SGK Công nghệ 12',
    lessons: [
      'Bài 26: Bảo vệ nguồn lợi thủy sản (trang 134)',
      'Bài 27: Khai thác nguồn lợi thủy sản (trang 138)',
    ],
    mindmapNodes: [
      {
        branchNumber: 1,
        title: 'Bảo vệ nguồn lợi thủy sản',
        subItems: [
          'Ý nghĩa và nhiệm vụ của bảo vệ nguồn lợi thủy sản: Phục hồi và duy trì trữ lượng các loài thủy sản tự nhiên, bảo vệ đa dạng sinh học hệ sinh thái thủy vực (rạn san hô, thảm cỏ biển, rừng ngập mặn) và phát triển nghề cá bền vững.',
          'Một số biện pháp bảo vệ nguồn lợi thủy sản phổ biến: (1) Khai thác đúng quy định của pháp luật (tuân thủ mùa vụ cấm khai thác khi cá đẻ, kích thước mắt lưới tối thiểu, kích thước cá tối thiểu được phép đánh bắt; nghiêm cấm chất nổ, xung điện, chất độc); (2) Tái tạo, thả bổ sung các loài thủy sản quý hiếm, có giá trị kinh tế vào các thủy vực tự nhiên (nội thủy, hồ chứa, vũng, vịnh); (3) Thiết lập và quản lí các khu bảo tồn biển (như Cù Lao Chàm, Nha Trang, Côn Đảo, Phú Quốc); (4) Bảo vệ môi trường sống của các loài thủy sản.',
        ],
      },
      {
        branchNumber: 2,
        title: 'Khai thác nguồn lợi thủy sản',
        subItems: [
          'Ý nghĩa và nhiệm vụ của khai thác nguồn lợi thủy sản: Cung cấp thực phẩm và nguyên liệu xuất khẩu, gắn phát triển kinh tế biển với bảo vệ chủ quyền quốc gia trên biển; thực hiện nghiêm quy định chống khai thác thủy sản bất hợp pháp, không báo cáo và không theo quy định (IUU).',
          'Một số phương pháp khai thác thủy sản phổ biến (4 nghề chính): (1) Nghề lưới kéo (chủ động dùng tàu kéo lưới hình túi lọc nước bắt các loài tầng đáy/gần đáy; tốc độ dắt lưới kéo tôm 2–3 km/h, kéo cá 6–8 km/h; đang được hạn chế vì tính chọn lọc thấp và cào sát đáy biển); (2) Nghề lưới rê (thụ động giăng tấm lưới thẳng đứng như bức tường chắn ngang đường di chuyển của cá để cá mắc vào mắt lưới); (3) Nghề lưới vây (chủ động dùng lưới bao vây đàn cá nổi tập trung ở tầng mặt/tầng giữa, thường kết hợp chà rạo hoặc nguồn ánh sáng nhân tạo ban đêm để thu hút đàn cá); (4) Nghề câu (như câu vàng cá ngừ đại dương, câu tay mực – có tính chọn lọc rất cao, chất lượng sản phẩm tốt và thân thiện với môi trường).',
        ],
      },
    ],
    coreSummary: [
      'Quy trình chung của một chuyến biển khai thác thủy sản xa bờ (5 bước): Bước 1: Chuẩn bị chuyến biển (tàu thuyền, ngư cụ, nhiên liệu, đá lạnh, nhu yếu phẩm, bật thiết bị giám sát hành trình VMS và làm thủ tục xuất bến) -> Bước 2: Tìm kiếm và phát hiện đàn cá (dựa vào kinh nghiệm ngư trường kết hợp máy dò cá siêu âm Sonar/Echo sounder) -> Bước 3: Thả ngư cụ đánh bắt (thả lưới/thả câu) -> Bước 4: Thu ngư cụ và thu hoạch thủy sản -> Bước 5: Phân loại, sơ chế, bảo quản lạnh trên tàu và ghi nhật kí khai thác.',
      'Tại sao Nhà nước chủ trương giảm dần nghề lưới kéo (giã cào), đặc biệt ở vùng biển ven bờ? Vì lưới kéo có mắt lưới ở đụt lưới rất nhỏ và cào sát nền đáy biển làm bắt sạch cả cá con chưa trưởng thành và phá hủy nơi cư trú, sinh sản của các loài thủy sinh vật đáy.',
    ],
    questions: [
      {
        number: 1,
        question: 'Nêu ý nghĩa, nhiệm vụ và các biện pháp chủ yếu để bảo vệ nguồn lợi thủy sản ở Việt Nam.',
        answer: [
          'Ý nghĩa: Ngăn chặn sự suy giảm và tuyệt chủng của các loài thủy sản quý hiếm, đảm bảo nguồn lợi thủy sản có khả năng tự tái tạo phục vụ thế hệ hiện tại và tương lai.',
          'Các biện pháp chủ yếu: (1) Thực thi nghiêm Luật Thủy sản (cấm chất nổ, xung điện, hóa chất độc, ngư cụ mắt lưới quá nhỏ; cấm đánh bắt vào mùa sinh sản); (2) Xây dựng và mở rộng mạng lưới Khu bảo tồn biển và khu bảo vệ nguồn lợi thủy sản nội địa; (3) Định kì thả giống tái tạo nguồn lợi thủy sản ra sông, hồ, biển; (4) Bảo vệ và phục hồi rừng ngập mặn, rạn san hô, thảm cỏ biển.',
        ],
      },
      {
        number: 2,
        question: 'So sánh nguyên lí hoạt động, đối tượng khai thác và mức độ thân thiện môi trường của 4 phương pháp khai thác: Lưới kéo, Lưới rê, Lưới vây và Nghề câu.',
        answer: [
          'Lưới kéo: Tàu kéo lưới hình phễu di chuyển lọc nước bắt tôm, cá đáy; tính chọn lọc thấp, dễ gây tổn hại hệ sinh thái đáy biển nên cần hạn chế.',
          'Lưới rê: Giăng lưới cố định hoặc thả trôi chắn ngang đường cá bơi làm cá mắc vào mắt lưới (hoặc cuốn vào lưới); có tính chọn lọc kích thước cá khá tốt tùy theo cỡ mắt lưới.',
          'Lưới vây: Bao vây nhanh đàn cá nổi (cá nục, cá trích, cá cơm, cá ngừ) quy mô lớn, thường kết hợp đèn chiếu sáng tập trung cá ban đêm; năng suất cao.',
          'Nghề câu: Dùng mồi gắn vào lưỡi câu (câu vàng cá ngừ đại dương, câu mực); có tính chọn lọc cao nhất, chỉ bắt cá lớn ăn mồi, sản phẩm ít bị dập nát nên giá trị kinh tế rất cao và bảo vệ nguồn lợi tốt.',
        ],
      },
      {
        number: 3,
        question: 'Thế nào là khai thác thủy sản bất hợp pháp, không báo cáo và không theo quy định (IUU)? Ngư dân cần làm gì để góp phần gỡ "thẻ vàng" IUU cho thủy sản Việt Nam?',
        answer: [
          'Khai thác IUU (Illegal, Unreported and Unregulated fishing) là các hoạt động đánh bắt không có giấy phép, vi phạm vùng biển nước ngoài, tắt thiết bị giám sát hành trình (VMS), không ghi và nộp nhật kí khai thác hoặc dùng ngư cụ bị cấm.',
          'Trách nhiệm của ngư dân: Đăng kí, đăng kiểm tàu cá và xin cấp phép khai thác đúng vùng biển; bật thiết bị giám sát hành trình VMS 24/24 giờ suốt chuyến biển; tuyệt đối không xâm phạm vùng biển nước ngoài; ghi chép nhật kí khai thác trung thực và cập cảng cá chỉ định để phục vụ truy xuất nguồn gốc.',
        ],
      },
      {
        number: 4,
        question: 'Các nhận định sau đây về bảo vệ và khai thác nguồn lợi thủy sản là Đúng hay Sai? Giải thích (Câu hỏi số 4 trang 143 SGK Công nghệ 12):\na) Khai thác nguồn lợi thủy sản bền vững giúp duy trì sự đa dạng sinh học.\nb) Đánh bắt cá bằng xung điện là phương pháp hiện đại, hiệu quả cao nên cần khuyến khích.\nc) Thả bổ sung các loài thủy sản bản địa, quý hiếm vào tự nhiên là biện pháp tái tạo nguồn lợi.\nd) Nghề lưới kéo có tính chọn lọc cao hơn nghề câu.\ne) Không khai thác thủy sản vào mùa sinh sản giúp bảo vệ đàn cá bố mẹ và cá con.',
        answer: [
          'a) ĐÚNG – Vì khai thác bền vững chỉ thu hoạch phần tăng trưởng tự nhiên, giữ lại quần đàn tái sinh nên duy trì được đa dạng sinh học.',
          'b) SAI – Đánh bắt bằng xung điện, chất nổ, hóa chất độc là hành vi hủy diệt bị pháp luật nghiêm cấm tuyệt đối vì làm chết hàng loạt cả cá lớn, cá nhỏ, trứng cá và sinh vật đáy.',
          'c) ĐÚNG – Giúp phục hồi mật độ quần thể các loài bản địa và loài nguy cấp trong các thủy vực tự nhiên.',
          'd) SAI – Nghề câu mới có tính chọn lọc cao hơn nghề lưới kéo; nghề lưới kéo có tính chọn lọc rất thấp vì bắt lẫn cả cá con và các loài không mong muốn.',
          'e) ĐÚNG – Tránh đánh bắt vào mùa sinh sản và tại bãi đẻ giúp đàn cá bố mẹ sinh sản thuận lợi, bổ sung nguồn giống tự nhiên cho vụ sau.',
        ],
      },
    ],
  },
];

function mergeChapterMCQs(
  baseBank: Record<string, ChapterMCQItem[]>,
  extraBank: Record<string, ChapterMCQItem[]>,
  vandungBank: Record<string, ChapterMCQItem[]>
): Record<string, ChapterMCQItem[]> {
  const result: Record<string, ChapterMCQItem[]> = {};
  for (const chapterId of Object.keys(baseBank)) {
    const combined = [
      ...(baseBank[chapterId] || []),
      ...(extraBank[chapterId] || []),
      ...(vandungBank[chapterId] || []),
    ];
    const bietItems = combined.filter((q) => q.level === 'biet');
    const hieuItems = combined.filter((q) => q.level === 'hieu');
    const vandungItems = combined.filter((q) => q.level === 'vandung');
    const ordered = [...bietItems, ...hieuItems, ...vandungItems].map(
      (q, index) => ({
        ...q,
        number: index + 1,
      })
    );
    result[chapterId] = ordered;
  }
  return result;
}

const MERGED_CHAPTER_QUESTIONS_10 = mergeChapterMCQs(
  CHAPTER_QUESTIONS_10,
  EXTRA_MCQ_10_FOR_30,
  VANDUNG_MCQ_10
);

const MERGED_CHAPTER_QUESTIONS_11 = mergeChapterMCQs(
  CHAPTER_QUESTIONS_11,
  EXTRA_MCQ_11_FOR_30,
  VANDUNG_MCQ_11
);

const ALL_MCQ_BANKS: Record<string, ChapterMCQItem[]> = {
  ...MERGED_CHAPTER_QUESTIONS_10,
  ...MERGED_CHAPTER_QUESTIONS_11,
  ...CHAPTER_MCQ_12_FORESTRY,
  ...CHAPTER_MCQ_12_AQUA1,
  ...CHAPTER_MCQ_12_AQUA2,
};

const ALL_TF_BANKS: Record<string, ChapterTFQuestion[]> = {
  ...CHAPTER_TF_10,
  ...CHAPTER_TF_11,
  ...CHAPTER_TF_12_FORESTRY,
  ...CHAPTER_TF_12_AQUA1,
  ...CHAPTER_TF_12_AQUA2,
};

function distributeMCQOptions(
  questions: ChapterMCQItem[],
  chapterIndex: number
): ChapterMCQItem[] {
  return questions.map((q) => {
    const shift = (q.number * 3 + chapterIndex) % 4;
    if (shift === 0) return q;
    const opts = [...q.options];
    const correctOpt = opts[q.correctIndex];
    const otherOpts = opts.filter((_, idx) => idx !== q.correctIndex);
    const reordered: string[] = [];
    let otherIdx = 0;
    for (let i = 0; i < 4; i++) {
      if (i === shift) {
        reordered.push(correctOpt);
      } else {
        reordered.push(otherOpts[otherIdx++]);
      }
    }
    return {
      ...q,
      options: reordered as [string, string, string, string],
      correctIndex: shift,
    };
  });
}

function distributeTFStatements(
  tfQuestions: ChapterTFQuestion[],
  chapterIndex: number
): ChapterTFQuestion[] {
  const labels: ('a' | 'b' | 'c' | 'd')[] = ['a', 'b', 'c', 'd'];
  return tfQuestions.map((tf) => {
    const shift = (tf.number + chapterIndex) % 4;
    const rotated = [0, 1, 2, 3].map((i) => {
      const src = tf.statements[(i + shift) % 4];
      return {
        ...src,
        label: labels[i],
      };
    }) as [
      ChapterTFStatement,
      ChapterTFStatement,
      ChapterTFStatement,
      ChapterTFStatement
    ];
    return {
      ...tf,
      statements: rotated,
    };
  });
}

// Dữ liệu 1 câu phân tích biểu đồ (Câu 1) và 1 câu phân tích bảng số liệu (Câu 2) cho mỗi chương (24 chương Lớp 10, 11, 12)
const CHAPTER_TF_CHART_AND_TABLE_DATA: Record<
  string,
  {
    chartData: NonNullable<TrueFalseQuestion['chartData']>;
    tableData: NonNullable<TrueFalseQuestion['tableData']>;
  }
> = {
  // LỚP 10 (8 CHƯƠNG)
  'cn10-c1': {
    chartData: {
      caption: 'Biểu đồ: Lượng lúa giống gieo sạ (kg/ha) của quy trình canh tác thông minh Drone + AWD so với sạ dày truyền thống',
      type: 'bar',
      unit: 'kg/ha',
      items: [
        { label: 'ĐC (Sạ lan truyền thống)', value: 120, displayValue: '120 kg/ha', highlight: false },
        { label: 'CT1 (Sạ hàng cơ giới)', value: 90, displayValue: '90 kg/ha', highlight: false },
        { label: 'CT2 (Sạ cụm bằng Drone + tưới AWD)', value: 72, displayValue: '72 kg/ha (Giảm 40%)', highlight: true },
      ],
      note: 'Ghi chú: Áp dụng sạ cụm bằng Drone kết hợp tưới Ướt – Khô xen kẽ (AWD) giúp giảm 40% lượng giống (tiết kiệm 48 kg/ha) và giảm 30% lượng nước tưới.',
    },
    tableData: {
      caption: 'Bảng hiệu quả chong đèn LED 9W điều khiển ra hoa thanh long trái vụ tại Bình Thuận',
      headers: ['Công thức chiếu sáng ban đêm (20h – 4h)', 'Công suất bóng đèn (W)', 'Tỉ lệ cành phân hóa mầm hoa (%)', 'Mức tiết kiệm điện năng (%)'],
      rows: [
        ['CT1 (Không chong đèn vào mùa ngày ngắn T10–T2)', '0', '4,5ᶜ', '—'],
        ['CT2 (Chong đèn sợi đốt truyền thống)', '60 W', '88,2ᵃ', '0% (Đối chứng)'],
        ['CT3 (Chong đèn LED nông nghiệp phổ đỏ – vàng)', '9 W', '91,4ᵃ', '85,0%'],
      ],
      note: 'Ghi chú: Trong cùng một cột, các chữ cái a, c khác nhau thể hiện sự khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },
  'cn10-c2': {
    chartData: {
      caption: 'Biểu đồ: Sự thay đổi chỉ số pH(KCl) của tầng đất mặt vùng đất phèn Tứ giác Long Xuyên trước và sau cải tạo',
      type: 'bar',
      unit: 'pH(KCl)',
      items: [
        { label: 'Trước cải tạo (Đất phèn rất chua, nhiều Al³⁺)', value: 3.8, displayValue: 'pH = 3,8', highlight: false },
        { label: 'Chỉ thau rửa nước ngọt (Không bón vôi)', value: 4.5, displayValue: 'pH = 4,5', highlight: false },
        { label: 'Bón 1,5 tấn vôi CaCO₃/ha + Thau chua rửa phèn', value: 5.8, displayValue: 'pH = 5,8 (An toàn cho rễ)', highlight: true },
      ],
      note: 'Ghi chú: Bón vôi kết hợp thau rửa nước ngọt giúp Ca²⁺ đẩy H⁺, Al³⁺ khỏi keo đất và nâng pH từ 3,8 lên 5,8.',
    },
    tableData: {
      caption: 'Bảng kết quả phân tích độ mặn của đất và hiệu quả cải tạo đất nhiễm mặn tại huyện Thạnh Phú (Bến Tre)',
      headers: ['Công thức xử lí đất', 'Nồng độ muối tan tổng số (‰)', 'Tỉ lệ Na⁺ trao đổi trên keo đất (%)', 'Tỉ lệ sống của cây trồng (%)'],
      rows: [
        ['Đất nhiễm mặn ban đầu (Trước cải tạo)', '5,40ᵃ (> ngưỡng 2,56‰)', '18,6ᵃ', '22,0ᶜ'],
        ['CT1 (Chỉ tưới nước ngọt bề mặt, không bón vôi)', '3,25ᵇ', '14,2ᵇ', '58,5ᵇ'],
        ['CT2 (Bón vôi đẩy Na⁺ + Ngâm nước ngọt xả mặn)', '1,15ᶜ (Đạt chuẩn)', '3,8ᶜ', '94,2ᵃ'],
      ],
      note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện sự khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },
  'cn10-c3': {
    chartData: {
      caption: 'Biểu đồ: Hàm lượng đường tổng số (°Brix) của quả vải thiều Lục Ngạn theo chế độ bón phân giai đoạn nuôi quả',
      type: 'bar',
      unit: '°Brix',
      items: [
        { label: 'CT1 (Bón thừa đạm Urea sát ngày thu hoạch)', value: 14.2, displayValue: '14,2 °Brix (Nứt quả nhiều)', highlight: false },
        { label: 'CT2 (Không bón thúc giai đoạn nuôi quả)', value: 16.5, displayValue: '16,5 °Brix', highlight: false },
        { label: 'CT3 (Giảm đạm + Tăng Kali sunfat K₂SO₄)', value: 20.4, displayValue: '20,4 °Brix (Vỏ đỏ, cùi dày)', highlight: true },
      ],
      note: 'Ghi chú: Kali (K₂SO₄) thúc đẩy vận chuyển đường về quả, giúp quả vải ngọt đậm và hạn chế nứt vỏ.',
    },
    tableData: {
      caption: 'Bảng kết quả thí nghiệm sử dụng phân vi sinh cố định đạm (Rhizobium) cho cây lạc xuân tại Nghệ An',
      headers: ['Nghiệm thức thí nghiệm', 'Lượng phân đạm hóa học sử dụng', 'Số nốt sần hữu hiệu (nốt/cây)', 'Năng suất củ khô (tạ/ha)'],
      rows: [
        ['Lô 1 (Đối chứng: Bón 100% NPK truyền thống)', '100% định mức', '24,0ᵇ', '28,2ᵇ'],
        ['Lô 2 (Giảm 60% đạm + Trộn giống vi sinh Rhizobium)', '40% định mức', '60,0ᵃ (Tăng 2,5 lần)', '33,4ᵃ (+18,4%)'],
        ['Lô 3 (Trộn Rhizobium chung với vôi nóng & thuốc đồng)', '40% định mức', '8,5ᶜ (Vi khuẩn chết)', '21,0ᶜ'],
      ],
      note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện sự khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },
  'cn10-c4': {
    chartData: {
      caption: 'Biểu đồ: Năng suất lúa thương phẩm (tấn/ha) của giống lúa ST25 theo cấp hạt giống sử dụng',
      type: 'bar',
      unit: 'tấn/ha',
      items: [
        { label: 'Hạt giống cấp Xác nhận (Nhân từ Nguyên chủng)', value: 7.4, displayValue: '7,4 tấn/ha (Độ thuần > 99%)', highlight: true },
        { label: 'Thóc thịt giữ lại làm giống vụ thứ 3', value: 5.8, displayValue: '5,8 tấn/ha (Lẫn tạp)', highlight: false },
        { label: 'Gieo trên đất mặn quá ngưỡng 15‰', value: 0.0, displayValue: '0 tấn/ha (Chết mặn)', highlight: false },
      ],
      note: 'Ghi chú: Sử dụng hạt giống cấp Xác nhận giúp duy trì độ thuần di truyền, phẩm chất gạo thơm và năng suất cao.',
    },
    tableData: {
      caption: 'Bảng so sánh hiệu quả nhân giống chuối già Nam Mỹ bằng nuôi cấy mô tế bào (in vitro) và tách chồi truyền thống',
      headers: ['Phương pháp nhân giống', 'Hệ số nhân giống sau 8 tháng (cây/mẫu đầu)', 'Tỉ lệ cây sạch bệnh virus BBTV (%)', 'Độ đồng đều khi thu hoạch (%)'],
      rows: [
        ['1. Tách chồi bên truyền thống ngoài đồng', '8 – 10ᵇ', '62,5ᵇ (Dễ lây bệnh qua củ)', '68,0ᵇ'],
        ['2. Vi nhân giống nuôi cấy mô đỉnh sinh trưởng (in vitro)', '2.500ᵃ', '100,0ᵃ (Sạch bệnh tuyệt đối)', '98,5ᵃ'],
      ],
      note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b khác nhau thể hiện sự khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },
  'cn10-c5': {
    chartData: {
      caption: 'Biểu đồ: Tỉ lệ diện tích lá lúa bị bệnh đạo ôn (%) theo chế độ bón phân đạm và quản lí nước vụ Đông Xuân',
      type: 'bar',
      unit: '% diện tích lá bệnh',
      items: [
        { label: 'Bón thừa đạm Urea + Để ruộng khô hạn khi phát bệnh', value: 64.5, displayValue: '64,5% (Cháy đạo ôn)', highlight: false },
        { label: 'Bón cân đối NPK (Đối chứng)', value: 18.2, displayValue: '18,2%', highlight: false },
        { label: 'Ngừng bón đạm + Giữ đủ nước + Phun thuốc đặc trị 4 đúng', value: 3.4, displayValue: '3,4% (Khống chế bệnh)', highlight: true },
      ],
      note: 'Ghi chú: Khi lúa chớm bị đạo ôn lá, phải ngừng ngay bón đạm, giữ nước ổn định và phun thuốc đặc trị theo nguyên tắc 4 đúng.',
    },
    tableData: {
      caption: 'Bảng hiệu quả phòng trừ sâu tơ hại rau bắp cải bằng chế phẩm sinh học (Bt + Beauveria) trong mô hình IPM tại Mộc Châu',
      headers: ['Công thức phòng trừ', 'Hiệu lực diệt sâu tơ sau 7 ngày (%)', 'Mật độ ong kí sinh Cotesia tồn tại (con/m²)', 'Dư lượng thuốc hóa học trên rau'],
      rows: [
        ['CT1 (Phun thuốc hóa học định kì hàng tuần)', '52,4ᵇ (Sâu kháng thuốc)', '0,5ᶜ (Thiên địch bị tiêu diệt)', 'Vượt ngưỡng cho phép'],
        ['CT2 (Bẫy Pheromone + Phun Bt & nấm Beauveria chiều mát)', '89,6ᵃ', '14,8ᵃ (Bảo tồn thiên địch)', '0,0 (An toàn tuyệt đối)'],
        ['CT3 (Pha chung Bt & nấm Beauveria với nước vôi đặc)', '18,0ᶜ (Mất hoạt lực)', '6,2ᵇ', '0,0'],
      ],
      note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện sự khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },
  'cn10-c6': {
    chartData: {
      caption: 'Biểu đồ: Tỉ lệ nảy mầm và tỉ lệ hạt nguyên (%) của lúa sau 12 tháng bảo quản theo công nghệ sấy và lưu trữ',
      type: 'bar',
      unit: '% chất lượng hạt',
      items: [
        { label: 'Sấy tháp 42–45 °C (ẩm độ 12,5%) + Bảo quản Silo kín', value: 94.5, displayValue: '94,5% (Đạt chuẩn)', highlight: true },
        { label: 'Thóc tươi ẩm độ 26% để đống trong bao quá 48 giờ', value: 38.0, displayValue: '38,0% (Bốc nóng, mốc)', highlight: false },
        { label: 'Sấy thóc giống ở nhiệt độ quá cao 85–90 °C', value: 2.0, displayValue: '2,0% (Chết phôi giống)', highlight: false },
      ],
      note: 'Ghi chú: Sấy lúa tươi về độ ẩm 12,5% ở 42–45 °C và bảo quản trong Silo kín giúp duy trì phẩm chất hạt suốt 12 tháng.',
    },
    tableData: {
      caption: 'Bảng kết quả bảo quản quả vải thiều tươi xuất khẩu đường biển sau 30 ngày theo các chế độ công nghệ',
      headers: ['Chế độ bảo quản sau thu hoạch', 'Tỉ lệ quả giữ vỏ đỏ tươi (%)', 'Tỉ lệ thối hỏng (%)', 'Hàm lượng đường tổng số (°Brix)'],
      rows: [
        ['CT1 (Bảo quản ở nhiệt độ phòng 28–30 °C)', '0,0ᶜ (Nâu vỏ sau 3 ngày)', '100,0ᵃ', '—'],
        ['CT2 (Kho lạnh thường 4 °C, không điều chỉnh khí quyển)', '54,2ᵇ', '24,5ᵇ', '16,8ᵇ'],
        ['CT3 (Làm mát sơ bộ + Màng MAP + Container CA: 4 °C, 4% O₂, 6% CO₂)', '95,6ᵃ', '2,1ᶜ', '19,2ᵃ'],
      ],
      note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện sự khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },
  'cn10-c7': {
    chartData: {
      caption: 'Biểu đồ: Năng suất và độ ngọt (°Brix) của dưa lưới trồng trên giá thể nhà màng theo chế độ điều khiển EC và tưới nhỏ giọt IoT',
      type: 'bar',
      unit: '°Brix',
      items: [
        { label: 'Tưới nhỏ giọt IoT chuẩn (pH 6,0; EC 1,5 -> 2,5 mS/cm)', value: 15.4, displayValue: '15,4 °Brix (Đạt loại 1)', highlight: true },
        { label: 'Tưới thủ công không kiểm soát EC và Kali giai đoạn chín', value: 10.8, displayValue: '10,8 °Brix (Quả nhạt)', highlight: false },
        { label: 'Pha dung dịch quá đặc (EC = 8,5 mS/cm; pH = 3,0)', value: 0.0, displayValue: '0 °Brix (Cháy rễ, héo cây)', highlight: false },
      ],
      note: 'Ghi chú: Kiểm soát pH (5,8–6,2) và EC (1,5–2,5 mS/cm) qua cảm biến IoT giúp cây dưa lưới hấp thu dinh dưỡng tối ưu.',
    },
    tableData: {
      caption: 'Bảng so sánh hiệu quả nhân giống củ khoai tây siêu nguyên chủng sạch bệnh bằng công nghệ Khí canh (Aeroponics) tại Đà Lạt',
      headers: ['Phương pháp nhân giống trong nhà lưới', 'Số củ giống thu được (củ/cây)', 'Tỉ lệ tiết kiệm nước và phân khoáng (%)', 'Tỉ lệ củ nhiễm bệnh truyền qua đất (%)'],
      rows: [
        ['1. Trồng trên luống đất / giá thể truyền thống', '5,4ᵇ', '0% (Đối chứng)', '12,5ᵃ'],
        ['2. Công nghệ Khí canh (Aeroponics – Phun sương rễ trong buồng tối)', '48,6ᵃ (Gấp 9 lần)', '92,0%', '0,0ᵇ (Sạch bệnh 100%)'],
      ],
      note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b khác nhau thể hiện sự khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },
  'cn10-c8': {
    chartData: {
      caption: 'Biểu đồ: Hàm lượng mùn hữu cơ trả lại cho đất và lượng phát thải CO₂ khi xử lí 1 tấn rơm rạ sau thu hoạch',
      type: 'bar',
      unit: 'kg mùn hữu cơ/tấn rơm',
      items: [
        { label: 'Đốt rơm trực tiếp trên đồng (Phát thải 1,4 tấn CO₂)', value: 0, displayValue: '0 kg mùn (Mất > 80% đạm)', highlight: false },
        { label: 'Vùi rơm tươi ngập nước không xử lí vi sinh', value: 180, displayValue: '180 kg (Gây ngộ độc H₂S)', highlight: false },
        { label: 'Trồng nấm rơm + Ủ phân hữu cơ vi sinh Trichoderma', value: 450, displayValue: '450 kg mùn (Kinh tế tuần hoàn)', highlight: true },
      ],
      note: 'Ghi chú: Thu gom rơm trồng nấm và ủ phân hữu cơ bằng chế phẩm Trichoderma giúp tái tạo chất mùn và xóa bỏ khói bụi đốt đồng.',
    },
    tableData: {
      caption: 'Bảng kết quả trồng nấm rơm từ phụ phẩm rơm rạ theo quy trình xử lí nước vôi và ủ nhiệt tại Đồng Tháp',
      headers: ['Công thức xử lí giá thể rơm rạ', 'Nhiệt độ đống ủ rơm (°C)', 'Tỉ lệ mô rơm nhiễm nấm dại (%)', 'Năng suất nấm rơm tươi (kg/tấn rơm khô)'],
      rows: [
        ['CT1 (Rơm khô không ngâm nước vôi, không ủ đống)', '30 °C', '68,5ᵃ', '35,0ᶜ'],
        ['CT2 (Ngâm nước vôi 1% + Ủ đống 65–70 °C + Cấy giống lúc nguội 32 °C)', '68 °C', '3,2ᵇ', '145,0ᵃ (Chất lượng loại 1)'],
        ['CT3 (Cấy meo giống ngay khi đống rơm đang nóng 70 °C)', '70 °C', '15,0ᵇ', '0,0ᵈ (Chết sợi meo giống)'],
      ],
      note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c, d khác nhau thể hiện sự khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },

  // LỚP 11 (6 CHƯƠNG)
  'cn11-c1': {
    chartData: {
      caption: 'Biểu đồ: Năng suất sữa trung bình (lít/con/chu kì 305 ngày) của bò sữa HF theo công nghệ quản lí chuồng nuôi',
      type: 'bar',
      unit: 'lít/chu kì',
      items: [
        { label: 'Chuồng kín làm mát tự động (< 26 °C) + Chip cảm biến IoT', value: 10200, displayValue: '10.200 lít', highlight: true },
        { label: 'Chuồng hở truyền thống bị stress nhiệt mùa hè (> 33 °C)', value: 6400, displayValue: '6.400 lít', highlight: false },
        { label: 'Chăn thả tự do ngoài trời thiếu khẩu phần TMR', value: 3100, displayValue: '3.100 lít', highlight: false },
      ],
      note: 'Ghi chú: Hệ thống làm mát chuồng tự động và vòng cổ gắn chip cảm biến giúp bò sữa HF phát huy tối đa tiềm năng năng suất.',
    },
    tableData: {
      caption: 'Bảng so sánh chỉ tiêu sinh trưởng và hiệu quả kinh tế giữa giống gà bản địa (Gà Mía/Ri) và gà công nghiệp Ross 308',
      headers: ['Giống gà & Phương thức nuôi', 'Thời gian nuôi xuất chuồng', 'Khối lượng xuất chuồng (kg/con)', 'Giá bán thương phẩm tương đối và Đặc điểm thịt'],
      rows: [
        ['1. Gà Ross 308 nhập nội (Nuôi công nghiệp chuồng kín)', '42 ngàyᵇ', '2,65ᵃ', '100% (Năng suất cao, thịt mềm)'],
        ['2. Gà Mía / Gà Đông Tảo bản địa (Nuôi bán chăn thả)', '135 ngàyᵃ', '1,85ᵇ', '260% (Thịt thơm săn chắc, kháng bệnh tốt)'],
        ['3. Con lai kinh tế (Gà Mía × Gà lông màu ngoại)', '95 ngàyab', '2,25ab', '185% (Kết hợp thịt ngon & lớn nhanh)'],
      ],
      note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b khác nhau thể hiện sự khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },
  'cn11-c2': {
    chartData: {
      caption: 'Biểu đồ: Hệ số tiêu tốn thức ăn (FCR – kg thức ăn/kg tăng trọng) và độ dày mỡ lưng của các cá thể lợn đực Duroc kiểm tra bản thân',
      type: 'bar',
      unit: 'FCR (kg/kg)',
      items: [
        { label: 'Cá thể đực A (Mỡ lưng 9,5 mm – Được chọn làm giống)', value: 2.15, displayValue: 'FCR = 2,15 (Ưu tú)', highlight: true },
        { label: 'Trung bình đàn kiểm tra năng suất', value: 2.45, displayValue: 'FCR = 2,45', highlight: false },
        { label: 'Cá thể đực B (Mỡ lưng 16,0 mm – Loại thải)', value: 2.75, displayValue: 'FCR = 2,75 (Tốn cám)', highlight: false },
      ],
      note: 'Ghi chú: Trong chọn lọc cá thể lợn đực giống hướng nạc, ưu tiên chọn cá thể có FCR thấp nhất và mỡ lưng mỏng.',
    },
    tableData: {
      caption: 'Bảng kết quả năng suất của công thức lai kinh tế 3 giống lợn ngoại (Landrace × Yorkshire × Duroc)',
      headers: ['Công thức phối giống', 'Số con cai sữa/nái/năm (con)', 'Thời gian nuôi đạt 100 kg (ngày)', 'Tỉ lệ thịt nạc thân thịt (%)'],
      rows: [
        ['1. Nhân giống thuần chủng Landrace (L × L)', '22,4ᵇ', '162ᵃ', '58,5ᵇ'],
        ['2. Nái lai F1 (Landrace × Yorkshire: LY)', '26,8ᵃ (Ưu thế lai sinh sản)', '155ab', '59,2ᵇ'],
        ['3. Con lai thương phẩm 3 máu (Nái LY × Đực Duroc: LYD)', '— (Dùng nuôi thịt 100%)', '142ᵇ (Lớn rất nhanh)', '64,4ᵃ (Siêu nạc)'],
      ],
      note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b khác nhau thể hiện sự khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },
  'cn11-c3': {
    chartData: {
      caption: 'Biểu đồ: Nhu cầu hàm lượng Calcium (%) và Protein thô (%) trong thức ăn hỗn hợp hoàn chỉnh của lợn con và gà mái đẻ',
      type: 'bar',
      unit: '% trong thức ăn',
      items: [
        { label: 'Lợn con cai sữa 5–15 kg (Protein thô 20,5%; Ca 0,8%)', value: 20.5, displayValue: '20,5% Protein (Ca: 0,8%)', highlight: true },
        { label: 'Gà thịt thương phẩm (Protein thô 19,0%; Ca 1,0%)', value: 19.0, displayValue: '19,0% Protein (Ca: 1,0%)', highlight: false },
        { label: 'Gà mái đẻ trứng giai đoạn đẻ rộ (Ca cao gấp 4 lần: 4,0%)', value: 17.0, displayValue: '17,0% Protein (Ca: 4,0%)', highlight: true },
      ],
      note: 'Ghi chú: Gà mái đẻ trứng cần 3,8–4,2% Calcium để tạo vỏ trứng; tuyệt đối không lấy cám gà đẻ cho lợn con ăn vì thừa Ca gây tiêu chảy.',
    },
    tableData: {
      caption: 'Bảng hiệu quả chế biến dự trữ thức ăn thô xanh (Ủ chua cây ngô và Ủ rơm khô với Urea 4%) cho bò thịt vụ đông',
      headers: ['Loại thức ăn thô cung cấp cho bò', 'Hàm lượng Protein thô quy đổi (%)', 'Tỉ lệ tiêu hóa chất xơ (%)', 'Tăng trọng của bò trong 60 ngày mùa đông (g/con/ngày)'],
      rows: [
        ['1. Rơm lúa khô tự nhiên chưa qua chế biến', '3,5ᶜ', '41,0ᶜ', '-120ᶜ (Bò sụt cân)'],
        ['2. Rơm lúa khô ủ kiềm hóa với dung dịch Urea 4%', '8,8ᵃ', '58,5ᵇ', '+450ᵇ'],
        ['3. Thân lá ngô ủ chua (2,5% mật rỉ + 0,5% muối) kết hợp rơm ủ Urea', '9,4ᵃ', '68,2ᵃ', '+820ᵃ (Khỏe mạnh)'],
      ],
      note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện sự khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },
  'cn11-c4': {
    chartData: {
      caption: 'Biểu đồ: Tỉ lệ an toàn dịch bệnh (%) và tỉ lệ chết khi xâm nhiễm virus Dịch tả lợn châu Phi (ASFV) theo mức độ an toàn sinh học',
      type: 'bar',
      unit: '%',
      items: [
        { label: 'Trại áp dụng An toàn sinh học nghiêm ngặt + Nấu chín thức ăn', value: 98.5, displayValue: '98,5% An toàn dịch', highlight: true },
        { label: 'Hộ mua lợn trôi nổi + Cho ăn thức ăn thừa sống (Tỉ lệ chết ASF)', value: 100.0, displayValue: '100% Lợn bệnh chết', highlight: false },
        { label: 'Hiệu quả diệt virus ASFV bằng thuốc kháng sinh Penicillin', value: 0.0, displayValue: '0% (Kháng sinh không diệt được virus)', highlight: false },
      ],
      note: 'Ghi chú: Bệnh Dịch tả lợn châu Phi (ASF) do virus gây ra có tỉ lệ chết tới 100% và không điều trị được bằng kháng sinh.',
    },
    tableData: {
      caption: 'Bảng kết quả bảo hộ của quy trình sử dụng vắc-xin phòng bệnh Newcastle (Gà rù) tại trang trại nuôi gà lông màu Vĩnh Phúc',
      headers: ['Nhóm đàn gà khảo sát (5.000 con/trại)', 'Hiệu giá kháng thể HI trung bình (log₂)', 'Tỉ lệ mắc bệnh khi có dịch (%)', 'Tỉ lệ gà sống sót xuất chuồng (%)'],
      rows: [
        ['Lứa 1 (Bỏ qua không nhỏ và không tiêm vắc-xin Newcastle)', '0,8ᵇ (Không đủ bảo hộ)', '86,5ᵃ', '24,2ᵇ (Chết > 75%)'],
        ['Lứa 2 (Nhỏ vắc-xin Lasota ngày 4, 21 + Tiêm Newcastle ngày 38)', '7,6ᵃ (Bảo hộ cao ≥ 4 log₂)', '0,0ᵇ', '97,4ᵃ'],
      ],
      note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b khác nhau thể hiện sự khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },
  'cn11-c5': {
    chartData: {
      caption: 'Biểu đồ: Nhiệt độ tiểu khí hậu trong chuồng nuôi lợn (°C) vào trưa hè 38 °C theo phương thức thiết kế chuồng',
      type: 'bar',
      unit: '°C',
      items: [
        { label: 'Nhiệt độ ngoài trời trưa hè tại Thanh Hóa', value: 38.0, displayValue: '38,0 °C (Nắng nóng)', highlight: false },
        { label: 'Chuồng hở truyền thống hướng Tây', value: 36.2, displayValue: '36,2 °C (Lợn stress nhiệt)', highlight: false },
        { label: 'Chuồng kín hướng Đông – Nam (Cooling pad + Quạt áp suất âm)', value: 27.5, displayValue: '27,5 °C (Mát hơn 10,5 °C)', highlight: true },
      ],
      note: 'Ghi chú: Chuồng kín hoạt động theo nguyên lí áp suất âm cần đóng kín cửa bên hông để luồng gió đi qua tấm làm mát Cooling pad.',
    },
    tableData: {
      caption: 'Bảng kết quả chăm sóc lợn con sơ sinh theo mẹ từ 1 đến 28 ngày tuổi tại trang trại lợn ngoại Thái Nguyên',
      headers: ['Quy trình chăm sóc lợn con', 'Hàm lượng Hemoglobin máu lúc 14 ngày (g/dL)', 'Tỉ lệ tiêu chảy phân trắng (%)', 'Khối lượng cai sữa lúc 28 ngày (kg/con)'],
      rows: [
        ['CT1 (Bú sữa đầu giờ đầu + Sưởi 32–34 °C + Tiêm sắt ngày 3 + Tập ăn ngày 7)', '11,8ᵃ (Bình thường)', '3,5ᵇ', '7,85ᵃ'],
        ['CT2 (Không tiêm bổ sung sắt Dextran Fe + Không sưởi ấm ô úm)', '6,2ᵇ (Thiếu máu nặng)', '38,4ᵃ', '4,90ᵇ (Còi cọc)'],
      ],
      note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b khác nhau thể hiện sự khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },
  'cn11-c6': {
    chartData: {
      caption: 'Biểu đồ: Hàm lượng Oxygen hòa tan (DO – mg/L) của nước hồ cạnh trại lợn trước và sau khi lắp đặt hệ thống xử lí Biogas – Hồ sinh học',
      type: 'bar',
      unit: 'mg/L DO',
      items: [
        { label: 'Khi xả tràn nước thải chưa xử lí (Phú dưỡng hóa, cá chết)', value: 0.7, displayValue: '0,7 mg/L (Cạn kiệt O₂)', highlight: false },
        { label: 'Nước ngay sau hầm Biogas (Còn nhiều NH₄⁺, P)', value: 2.1, displayValue: '2,1 mg/L', highlight: false },
        { label: 'Sau chuỗi Máy tách phân + Biogas HDPE + Hồ sinh học', value: 6.4, displayValue: '6,4 mg/L (Đạt chuẩn)', highlight: true },
      ],
      note: 'Ghi chú: Nước thải chăn nuôi phải qua tách phân, hầm Biogas và hồ sinh học hiếu khí để tránh gây phú dưỡng hóa nguồn nước.',
    },
    tableData: {
      caption: 'Bảng so sánh chỉ tiêu môi trường chuồng nuôi gà thịt giữa nền chuồng truyền thống và Đệm lót sinh học tại Hải Dương',
      headers: ['Phương thức quản lí nền chuồng', 'Nồng độ khí độc NH₃ trong chuồng (ppm)', 'Tỉ lệ mắc bệnh hô hấp và cầu trùng (%)', 'Lượng nước dội rửa chuồng (m³/lứa)'],
      rows: [
        ['1. Nền chuồng xi măng rửa nước hàng ngày', '24,5ᵃ (Mùi khai nồng)', '16,8ᵃ', '120,0ᵃ'],
        ['2. Đệm lót sinh học (Trấu + mùn cưa dày 35 cm + VSV Saccharomyces, Bacillus)', '3,2ᵇ (Không mùi hôi)', '2,4ᵇ', '0,0ᵇ (Tiết kiệm 100% nước rửa)'],
      ],
      note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b khác nhau thể hiện sự khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },

  // LỚP 12 (10 CHƯƠNG)
  'cn12-c1': {
    chartData: {
      caption: 'Biểu đồ: Trữ lượng carbon tích lũy (tấn C/ha) của các mô hình rừng tại lưu vực hồ chứa (Chương I)',
      type: 'bar',
      unit: 'tấn C/ha',
      items: [
        { label: 'Rừng phòng hộ đầu nguồn hỗn giao (100 ha)', value: 142.5, displayValue: '142,5 tấn C/ha', highlight: true },
        { label: 'Rừng sản xuất trồng quế + dược liệu dưới tán', value: 118.4, displayValue: '118,4 tấn C/ha', highlight: true },
        { label: 'Rừng sản xuất keo thuần loài chu kì ngắn', value: 78.2, displayValue: '78,2 tấn C/ha', highlight: false },
      ],
      note: 'Ghi chú: Rừng phòng hộ đầu nguồn và mô hình nông – lâm kết hợp giúp nâng cao sinh khối tích lũy carbon và bảo vệ hồ chứa.',
    },
    tableData: {
      caption: 'Bảng thống kê nguyên nhân suy giảm diện tích rừng và kết quả phục hồi sau giao rừng tại địa phương X (Chương I)',
      headers: ['Chỉ tiêu khảo sát tại địa phương X', 'Giai đoạn trước giao rừng', 'Sau 5 năm giao rừng & hỗ trợ sinh kế'],
      rows: [
        ['Số vụ khai thác gỗ trái phép và đốt nương rẫy (vụ/năm)', '48,5ᵃ', '6,2ᵇ'],
        ['Diện tích rừng khoanh nuôi tái sinh phục hồi (ha)', '120,0ᵇ', '685,0ᵃ'],
        ['Độ che phủ rừng toàn địa phương (%)', '36,4ᵇ', '43,8ᵃ'],
      ],
      note: 'Ghi chú: Trong cùng một hàng, các chữ cái a, b khác nhau thể hiện khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },
  'cn12-c2': {
    chartData: {
      caption: 'Biểu đồ: Tỉ lệ sống của cây keo lai sau trồng (%) theo kĩ thuật xử lí vỏ bầu và bón lót (Chương II)',
      type: 'bar',
      unit: '%',
      items: [
        { label: 'CT1 (Rạch bỏ vỏ bầu nilon + bón lót đất mặt)', value: 94.2, displayValue: '94,2% (Đạt chuẩn)', highlight: true },
        { label: 'CT2 (Có rạch vỏ bầu, không bón lót)', value: 78.0, displayValue: '78,0% (Cần trồng dặm)', highlight: false },
        { label: 'CT3 (Không xé bỏ vỏ bầu nilon khi trồng)', value: 45.6, displayValue: '45,6%', highlight: false },
      ],
      note: 'Ghi chú: Khi tỉ lệ cây sống sau trồng đạt dưới 85% thì bắt buộc phải tiến hành trồng dặm bổ sung.',
    },
    tableData: {
      caption: 'Bảng theo dõi chỉ tiêu sinh trưởng và chất lượng hạt giống qua 4 giai đoạn tuổi của rừng thông mã vĩ (Chương II)',
      headers: ['Giai đoạn phát triển', 'Tăng trưởng đường kính (cm/năm)', 'Tỉ lệ hạt chắc mẩy (%)', 'Biện pháp kĩ thuật trọng tâm'],
      rows: [
        ['1. Giai đoạn non (1 – 4 tuổi)', '1,15ᵇ', '0,0ᶜ (Chưa ra hoa)', 'Làm cỏ, vun gốc, trồng dặm'],
        ['2. Giai đoạn gần thành thục (5 – 10 tuổi)', '2,10ᵃ', '54,2ᵇ (Ra hoa bói)', 'Tỉa cành, tỉa thưa nuôi dưỡng'],
        ['3. Giai đoạn thành thục (11 – 20 tuổi)', '2,25ᵃ', '92,6ᵃ (Tốt nhất)', 'Thu hoạch hạt giống, khai thác gỗ'],
        ['4. Giai đoạn già cỗi (> 25 tuổi)', '0,35ᶜ', '41,0ᵇ', 'Khai thác thanh lí, tái sinh rừng'],
      ],
      note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },
  'cn12-c3': {
    chartData: {
      caption: 'Biểu đồ: Độ ẩm vật liệu cháy dưới tán rừng thông (%) tương ứng với các cấp dự báo cháy rừng tại Khu bảo tồn X (Chương III)',
      type: 'bar',
      unit: '% độ ẩm VLC',
      items: [
        { label: 'Cấp I – II (Ít nguy hiểm, VLC ẩm)', value: 32.5, displayValue: '32,5%', highlight: false },
        { label: 'Cấp III (Cấp cao, bắt đầu khô hanh)', value: 21.0, displayValue: '21,0%', highlight: false },
        { label: 'Cấp IV (Cấp nguy hiểm)', value: 14.2, displayValue: '14,2%', highlight: true },
        { label: 'Cấp V (Cực kì nguy hiểm – Báo động đỏ)', value: 7.8, displayValue: '7,8%', highlight: true },
      ],
      note: 'Ghi chú: Ở Cấp V, độ ẩm vật liệu cháy xuống dưới 10%, nguy cơ cháy rừng cực kì lớn.',
    },
    tableData: {
      caption: 'Bảng khảo sát độ tàn che và lượng đất xói mòn theo phương thức khai thác tại Khu A (dốc 8°) và Khu B (dốc 25°) (Chương III)',
      headers: ['Khu vực & Phương thức khai thác', 'Độ tàn che còn lại sau khai thác', 'Lượng đất xói mòn (tấn/ha/năm)', 'Khả năng phục hồi rừng'],
      rows: [
        ['Khu A (Rừng trồng dốc 8° – Khai thác trắng + trồng lại ngay)', '0,0 (Trồng lại ngay mùa mưa)', '4,2ᵇ (An toàn)', 'Phục hồi tốt bằng rừng trồng mới'],
        ['Khu B (Rừng tự nhiên dốc 25° – Khai thác chọn bền vững)', '0,62ᵃ (Đảm bảo > 0,4)', '3,5ᵇ (Rất thấp)', 'Tái sinh tự nhiên liên tục'],
        ['Đối chứng: Khai thác trắng trên sườn dốc 25° (Bị cấm)', '0,0', '68,4ᵃ (Xói mòn nghiêm trọng)', 'Suy thoái đất trơ sỏi đá'],
      ],
      note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b khác nhau thể hiện khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },
  'cn12-c4': {
    chartData: {
      caption: 'Biểu đồ: Cơ cấu tỉ trọng sản lượng nuôi trồng và sản lượng khai thác thủy sản của Việt Nam (%) (Chương IV)',
      type: 'bar',
      unit: '% tổng sản lượng',
      items: [
        { label: 'Sản lượng Nuôi trồng thủy sản (Tăng mạnh bền vững)', value: 58.2, displayValue: '58,2%', highlight: true },
        { label: 'Sản lượng Khai thác thủy sản (Giảm dần hợp lí)', value: 41.8, displayValue: '41,8%', highlight: false },
      ],
      note: 'Ghi chú: Xu hướng phát triển thủy sản Việt Nam là tăng tỉ lệ nuôi trồng công nghệ cao và giảm khai thác tự nhiên.',
    },
    tableData: {
      caption: 'Bảng phân loại đặc tính sinh học và kết quả nuôi ghép các loài cá tại Trang trại X (Chương IV)',
      headers: ['Loài thủy sản', 'Nguồn gốc', 'Tính ăn & Tầng nước sống', 'Tỉ lệ sống khi nuôi đúng môi trường (%)'],
      rows: [
        ['Cá trắm cỏ', 'Bản địa / Truyền thống', 'Ăn thực vật (Tầng giữa)', '92,5ᵃ (Ao nước ngọt 25–30 °C)'],
        ['Cá mè trắng', 'Bản địa / Truyền thống', 'Ăn sinh vật phù du (Tầng mặt)', '94,0ᵃ (Ao nước ngọt 25–30 °C)'],
        ['Cá chép V1', 'Lai chọn tạo', 'Ăn tạp (Tầng đáy)', '93,2ᵃ (Ao nước ngọt 25–30 °C)'],
        ['Cá tầm Nga', 'Nhập nội (Ôn đới lạnh)', 'Ăn động vật (Nước chảy lạnh 15–20 °C)', '0,0ᵇ (Nếu thả ao tĩnh 35 °C)'],
      ],
      note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b khác nhau thể hiện khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },
  'cn12-c5': {
    chartData: {
      caption: 'Biểu đồ: Độ trong nước ao (cm) qua các bước xử lí nước trước khi thả nuôi tôm của anh Minh (Chương V)',
      type: 'bar',
      unit: 'Độ trong (cm)',
      items: [
        { label: 'Bước 1: Sau lắng lọc cơ học', value: 65.0, displayValue: '65 cm', highlight: false },
        { label: 'Bước 2 & 3: Diệt khuẩn Chlorine & Quạt khử dư lượng', value: 70.0, displayValue: '70 cm (Sạch khuẩn)', highlight: false },
        { label: 'Bước 4: Sau gây màu nước tảo khuê & cấy vi sinh', value: 35.0, displayValue: '35 cm (Đạt chuẩn thả giống)', highlight: true },
      ],
      note: 'Ghi chú: Chỉ được cấy chế phẩm vi sinh và gây màu nước ở Bước 4 sau khi đã khử hết dư lượng Chlorine ở Bước 3.',
    },
    tableData: {
      caption: 'Bảng theo dõi biến động hàm lượng Oxygen hòa tan (DO – mg/L) trong ao nuôi cá rô phi thâm canh theo thời gian (Chương V)',
      headers: ['Thời điểm đo trong ngày', 'Hàm lượng DO tầng mặt (mg/L)', 'Hàm lượng DO tầng đáy (mg/L)', 'Trạng thái hoạt động của đàn cá'],
      rows: [
        ['14 giờ chiều (Tảo quang hợp mạnh)', '7,8ᵃ', '5,6ᵃ', 'Cá bơi lội và bắt mồi bình thường'],
        ['22 giờ đêm (Tảo ngừng quang hợp, hô hấp)', '4,2ᵇ', '3,1ᵇ', 'Cá giảm hoạt động, cần bật quạt nước'],
        ['5 giờ sáng (Trời âm u, tắt quạt nước)', '1,6ᶜ', '1,2ᶜ (< ngưỡng 4 mg/L)', 'Cá nổi đầu đớp không khí hàng loạt'],
      ],
      note: 'Ghi chú: Khi cá nổi đầu lúc rạng sáng do DO tụt xuống 1,2 mg/L, phải bật ngay quạt nước/sục khí và ngừng cho ăn.',
    },
  },
  'cn12-c6': {
    chartData: {
      caption: 'Biểu đồ: Tỉ lệ cá rô phi đực (%) khi cho cá bột ăn thức ăn trộn hormone 17α-methyltestosterone (MT) trong 21 ngày đầu (Chương VI)',
      type: 'bar',
      unit: '% cá đực',
      items: [
        { label: 'Đối chứng (Không bổ sung hormone MT)', value: 51.2, displayValue: '51,2%', highlight: false },
        { label: 'Cho ăn muộn (Sau khi cá đã lớn 30 ngày tuổi)', value: 64.5, displayValue: '64,5%', highlight: false },
        { label: 'Cho ăn MT ngay khi cá bột vừa tiêu hết noãn hoàng (21 ngày)', value: 96.8, displayValue: '96,8%', highlight: true },
      ],
      note: 'Ghi chú: Đàn cá rô phi đơn tính đực xử lí bằng hormone 17α-MT chỉ dùng nuôi thương phẩm, không dùng làm cá bố mẹ sinh sản.',
    },
    tableData: {
      caption: 'Bảng đặc điểm các giai đoạn phát triển của ấu trùng tôm thẻ chân trắng và chế độ dinh dưỡng tại Trại giống A (Chương VI)',
      headers: ['Giai đoạn ấu trùng tôm', 'Nguồn dinh dưỡng / Thức ăn chính', 'Độ mặn nước bể ương (‰)', 'Tỉ lệ sống qua giai đoạn (%)'],
      rows: [
        ['1. Nauplius', 'Dinh dưỡng bằng noãn hoàng tự thân (Chưa ăn ngoài)', '30‰', '95,2ᵃ'],
        ['2. Zoea (Z1 – Z3)', 'Thực vật phù du (Tảo khuê tươi) + thức ăn vi nang', '30‰', '88,4ᵇ'],
        ['3. Mysis (M1 – M3)', 'Động vật phù du (Ấu trùng Artemia bung dù) + tảo', '30‰', '86,0ᵇ'],
        ['4. Postlarvae (PL1 – PL12)', 'Ấu trùng Artemia mới nở + thức ăn tổng hợp (Thuần hóa độ mặn)', 'Hạ dần về độ mặn ao nuôi', '91,5ᵃ'],
      ],
      note: 'Ghi chú: Trước khi thả vào ao có độ mặn thấp (5‰), tôm PL12 bắt buộc phải được thuần hóa hạ độ mặn từ từ.',
    },
  },
  'cn12-c7': {
    chartData: {
      caption: 'Biểu đồ: Tỉ lệ tiêu hóa protein (%) của nguyên liệu thức ăn thủy sản ứng dụng công nghệ sinh học (Chương VII)',
      type: 'bar',
      unit: '% tiêu hóa đạm',
      items: [
        { label: 'Khô dầu đậu nành sống chưa lên men', value: 68.4, displayValue: '68,4%', highlight: false },
        { label: 'Khô dầu đậu nành lên men vi khuẩn Bacillus subtilis', value: 89.2, displayValue: '89,2%', highlight: true },
        { label: 'Dịch phụ phẩm cá tra thủy phân bằng enzyme protease (50–55 °C)', value: 94.6, displayValue: '94,6%', highlight: true },
      ],
      note: 'Ghi chú: Thủy phân bằng enzyme protease phải thực hiện ở nhiệt độ tối ưu 50–55 °C.',
    },
    tableData: {
      caption: 'Bảng thông số kĩ thuật dây chuyền sản xuất thức ăn viên công nghiệp tại Nhà máy X (Chương VII)',
      headers: ['Loại sản phẩm & Công đoạn', 'Độ bền trong nước (phút)', 'Tỉ lệ giữ hoạt tính Vitamin C (%)', 'Độ ẩm khi đóng bao (%)'],
      rows: [
        ['Thức ăn viên nổi cho cá (Phun phủ vitamin sau sấy, làm nguội 28 °C)', '45,0ᵇ', '94,5ᵃ', '10,8ᵇ (Đạt chuẩn < 12%)'],
        ['Thức ăn viên chìm cho tôm (Phun phủ vitamin sau sấy, làm nguội 28 °C)', '180,0ᵃ (3 giờ)', '93,8ᵃ', '10,5ᵇ (Đạt chuẩn < 12%)'],
        ['Đóng bao sai kĩ thuật (Trộn vitamin trước ép nhiệt 110 °C & đóng bao nóng)', '30,0ᶜ', '22,4ᵇ (Phân hủy nhiệt)', '16,5ᵃ (Ẩm mốc)'],
      ],
      note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },
  'cn12-c8': {
    chartData: {
      caption: 'Biểu đồ: Hệ số FCR của tôm thẻ chân trắng trong hệ thống Biofloc (C:N = 15:1, sục khí 24/24h) tại Hợp tác xã X (Chương VIII)',
      type: 'bar',
      unit: 'FCR',
      items: [
        { label: 'Nuôi công nghệ Biofloc (Bổ sung mật rỉ đường, sục khí 24/24h)', value: 1.18, displayValue: '1,18 (Tiết kiệm 25% thức ăn)', highlight: true },
        { label: 'Nuôi thông thường không Biofloc (Đối chứng)', value: 1.56, displayValue: '1,56', highlight: false },
      ],
      note: 'Ghi chú: Hạt Biofloc vừa xử lí khí độc NH₃ tại chỗ vừa làm thức ăn giàu đạm cho tôm nhưng bắt buộc phải sục khí 24/24h.',
    },
    tableData: {
      caption: 'Bảng hiệu suất xử lí nước qua các công đoạn của hệ thống nuôi cá tuần hoàn RAS kết hợp Aquaponics (Chương VIII)',
      headers: ['Công đoạn trong hệ thống RAS – Aquaponics', 'Chất rắn lơ lửng TSS (mg/L)', 'Nồng độ NH₃ (mg/L)', 'Nồng độ NO₃⁻ cho rau (mg/L)'],
      rows: [
        ['1. Nước ra từ bể nuôi cá rô phi', '85,4ᵃ', '1,45ᵃ', '12,0ᶜ'],
        ['2. Sau bể lọc cơ học (Tách phân rắn)', '8,2ᵇ (Giảm > 90%)', '1,38ᵃ', '12,5ᶜ'],
        ['3. Sau bể lọc sinh học (Chuyển hóa NH₃ -> NO₃⁻)', '5,4ᵇ', '0,04ᵇ (An toàn)', '64,8ᵃ (Nuôi rau)'],
        ['4. Sau giàn rau thủy canh & đèn UV (Quay lại bể cá)', '2,1ᶜ (Nước trong sạch)', '0,01ᵇ', '15,2ᵇ (Rau đã hấp thụ)'],
      ],
      note: 'Ghi chú: Tuyệt đối không phun thuốc trừ sâu hóa học vào nước tuần hoàn giàn rau vì nước chảy trực tiếp về bể nuôi cá.',
    },
  },
  'cn12-c9': {
    chartData: {
      caption: 'Biểu đồ: Tỉ lệ sống của cá tra (%) khi điều trị bệnh gan thận mủ (do vi khuẩn Edwardsiella ictaluri) theo kháng sinh đồ (Chương IX)',
      type: 'bar',
      unit: '% tỉ lệ sống',
      items: [
        { label: 'NT1 (Đối chứng khỏe mạnh không nhiễm khuẩn)', value: 98.0, displayValue: '98,0%', highlight: false },
        { label: 'NT2 (Nhiễm E. ictaluri, không điều trị)', value: 34.5, displayValue: '34,5%', highlight: false },
        { label: 'NT3 (Điều trị kháng sinh theo kháng sinh đồ đủ 5–7 ngày)', value: 88.6, displayValue: '88,6%', highlight: true },
      ],
      note: 'Ghi chú: Cá tra mắc bệnh gan thận mủ có nhiều đốm trắng đục 1–3 mm trên gan, thận, lách.',
    },
    tableData: {
      caption: 'Bảng hiệu quả của các biện pháp an toàn sinh học phòng bệnh đốm trắng (virus WSSV) tại khu nuôi tôm của anh Tuấn (Chương IX)',
      headers: ['Giải pháp kĩ thuật áp dụng', 'Tỉ lệ phát hiện sớm mầm bệnh (%)', 'Tỉ lệ ao nuôi an toàn không nổ dịch WSSV (%)', 'Hiệu quả điều trị khi đã phát bệnh cấp tính'],
      rows: [
        ['Xét nghiệm PCR tôm giống PL12 + Rào lưới chống cua còng + Men tỏi', '99,5ᵃ (Chính xác bằng PCR)', '94,8ᵃ (An toàn sinh học cao)', 'Phòng bệnh chủ động hiệu quả nhất'],
        ['Thả giống trôi nổi không xét nghiệm PCR, không rào lưới bờ ao', '0,0ᵇ', '38,2ᵇ (Nhiễm virus từ giáp xác)', 'Tôm chết 90–100% sau 3–7 ngày'],
        ['Dùng thuốc kháng sinh Penicillin tạt khi tôm đã nhiễm virus WSSV', '—', '0,0ᶜ', 'Không có tác dụng (Kháng sinh không diệt virus)'],
      ],
      note: 'Ghi chú: Bệnh đốm trắng do virus DNA (WSSV) gây ra nên không điều trị được bằng kháng sinh; bắt buộc phải sàng lọc giống bằng PCR.',
    },
  },
  'cn12-c10': {
    chartData: {
      caption: 'Biểu đồ: Trữ lượng quần đàn cá bố mẹ phục hồi (kg/mẻ lưới khảo sát) tại vùng biển thực thi bảo tồn và cấm đánh bắt mùa sinh sản (Chương X)',
      type: 'bar',
      unit: 'kg/mẻ khảo sát',
      items: [
        { label: 'Vùng thiết lập Khu bảo tồn biển & cấm đánh bắt mùa sinh sản', value: 84.5, displayValue: '84,5 kg', highlight: true },
        { label: 'Vùng biển kiểm soát mắt lưới chuẩn & bật VMS 100%', value: 62.0, displayValue: '62,0 kg', highlight: true },
        { label: 'Vùng bị khai thác quá mức ven bờ trước đây', value: 18.4, displayValue: '18,4 kg', highlight: false },
      ],
      note: 'Ghi chú: Pháp luật nghiêm cấm tuyệt đối hành vi dùng xung điện, chất nổ, hóa chất độc để đánh bắt thủy sản.',
    },
    tableData: {
      caption: 'Bảng so sánh tính chọn lọc và chất lượng sản phẩm của 4 phương pháp khai thác thủy sản tại Khánh Hòa (Chương X)',
      headers: ['Phương pháp khai thác (Bài 27)', 'Đối tượng và Tầng nước khai thác', 'Tỉ lệ cá con bị bắt lẫn (%)', 'Tỉ lệ sản phẩm đạt chuẩn loại I (%)'],
      rows: [
        ['1. Nghề lưới kéo đáy (Tốc độ kéo tôm 2–3 km/h, kéo cá 6–8 km/h)', 'Tôm, cá tầng đáy (Cào sát đáy)', '38,5ᵃ (Chọn lọc thấp)', '52,0ᶜ'],
        ['2. Nghề lưới rê (Giăng lưới chắn ngang đường cá bơi)', 'Cá tầng mặt, tầng giữa hoặc đáy', '11,2ᵇ (Chọn lọc khá)', '76,4ᵇ'],
        ['3. Nghề lưới vây (Bao vây đàn cá nổi kết hợp ánh sáng)', 'Đàn cá nổi tập trung (Cá nục, thu, ngừ)', '9,4ᵇ', '84,2ᵇ'],
        ['4. Nghề câu (Câu vàng cá ngừ đại dương, câu mực)', 'Cá dữ kích cỡ lớn, mực đại dương', '1,8ᶜ (Chọn lọc cao nhất)', '95,6ᵃ (Ít dập nát)'],
      ],
      note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện khác biệt có ý nghĩa thống kê (p < 0,05).',
    },
  },
};

export const CHAPTER_REVIEW_DATA: ChapterReviewItem[] =
  RAW_CHAPTER_REVIEW_DATA.map((chapter, idx) => {
    const rawMcq = ALL_MCQ_BANKS[chapter.id] || [];
    const rawTf = ALL_TF_BANKS[chapter.id];
    const distributedMcq = distributeMCQOptions(rawMcq, idx).map((q) =>
      normalizeChapterMCQItem(q, chapter.domain)
    );
    const defaultCitation =
      chapter.domain === 'forestry'
        ? `Nguồn: Viện Khoa học Lâm nghiệp Việt Nam (VAFS) & Cục Lâm nghiệp – ${chapter.pageRef}.`
        : chapter.domain === 'aquaculture'
        ? `Nguồn: Viện Nghiên cứu Nuôi trồng Thủy sản & Cục Thủy sản (Bộ NN&PTNT) – ${chapter.pageRef}.`
        : chapter.domain === 'crop'
        ? `Nguồn: Viện Khoa học Nông nghiệp Việt Nam (VAAS) & Cục Trồng trọt – ${chapter.pageRef}.`
        : `Nguồn: Viện Chăn nuôi Quốc gia (NIAS) & Cục Chăn nuôi – ${chapter.pageRef}.`;

    const chapterVisualData = CHAPTER_TF_CHART_AND_TABLE_DATA[chapter.id];
    const distributedTf = rawTf
      ? distributeTFStatements(rawTf, idx).map((tf) => ({
          ...normalizeChapterTFQuestion(tf, chapter.domain),
          citation: tf.citation || defaultCitation,
          chartData: tf.number === 1 ? chapterVisualData?.chartData : undefined,
          tableData: tf.number === 2 ? chapterVisualData?.tableData : undefined,
        }))
      : undefined;
    const normalizedQuestions =
      chapter.grade === '12'
        ? []
        : chapter.questions.map((q) =>
            normalizeChapterQuestionItem(q, chapter.domain)
          );
    return {
      ...chapter,
      questions: normalizedQuestions,
      mcqQuestions: distributedMcq,
      tfQuestions: distributedTf,
    };
  });

export const SGK_GLOSSARY: GlossaryItem[] = [
  // Thuật ngữ Công nghệ 10 (Trang 143 SGK)
  {
    grade: '10',
    term: 'Cảm biến (Sensor)',
    definition: 'Thiết bị điện tử cảm nhận và đo lường các thông số vật lí, hóa học của môi trường (nhiệt độ, độ ẩm, ánh sáng, pH, EC) rồi chuyển đổi thành tín hiệu điện truyền về bộ điều khiển.',
    pages: 'Trang 116, 123 SGK CN 10',
  },
  {
    grade: '10',
    term: 'Keo đất',
    definition: 'Những hạt đất có kích thước vô cùng nhỏ (khoảng dưới 1 µm), không hòa tan trong nước mà ở trạng thái huyền phù, có khả năng hấp phụ và trao đổi ion với dung dịch đất.',
    pages: 'Trang 20, 21 SGK CN 10',
  },
  {
    grade: '10',
    term: 'Quang chu kì',
    definition: 'Phản ứng của thực vật đối với tương quan độ dài ngày (thời gian chiếu sáng) và độ dài đêm trong một chu kì 24 giờ, quyết định sự ra hoa của cây ngày ngắn và cây ngày dài.',
    pages: 'Trang 15 SGK CN 10',
  },
  {
    grade: '10',
    term: 'Khí canh (Aeroponics)',
    definition: 'Kĩ thuật trồng cây không dùng đất mà bộ rễ cây được treo lơ lửng trong không khí kín, dung dịch dinh dưỡng được phun dưới dạng sương mù trực tiếp vào rễ.',
    pages: 'Trang 9, 129 SGK CN 10',
  },
  {
    grade: '10',
    term: 'Thủy canh (Hydroponics)',
    definition: 'Kĩ thuật trồng cây không dùng đất trong đó rễ cây được ngâm trực tiếp trong dung dịch dinh dưỡng chứa đầy đủ các nguyên tố khoáng thiết yếu.',
    pages: 'Trang 9, 125 SGK CN 10',
  },
  {
    grade: '10',
    term: 'Tính toàn năng của tế bào',
    definition: 'Khả năng của một tế bào thực vật riêng lẻ có thể phân chia, biệt hóa và tái sinh thành một cơ thể thực vật hoàn chỉnh khi được nuôi cấy trong môi trường thích hợp.',
    pages: 'Trang 69 SGK CN 10',
  },
  {
    grade: '10',
    term: 'Ưu thế lai',
    definition: 'Hiện tượng cơ thể lai F1 có sức sống, tốc độ sinh trưởng, khả năng chống chịu và năng suất vượt trội hơn hẳn so với trung bình giữa hai bố mẹ hoặc vượt cả bố mẹ tốt nhất.',
    pages: 'Trang 62 SGK CN 10',
  },

  // Thuật ngữ Công nghệ 11 (Trang 118 - 119 SGK)
  {
    grade: '11',
    term: 'Chỉ thị phân tử (Molecular marker)',
    definition: 'Đoạn trình tự DNA nằm ở vị trí xác định trên nhiễm sắc thể, liên kết chặt với gene quy định tính trạng quan tâm, được dùng để chọn giống chính xác ở mức độ phân tử (MAS).',
    pages: 'Trang 35 SGK CN 11',
  },
  {
    grade: '11',
    term: 'Cấy truyền phôi (Embryo transfer)',
    definition: 'Kĩ thuật lấy phôi từ cơ quan sinh dục của con cái cho phôi (cao sản) ở giai đoạn sớm rồi cấy vào tử cung của những con cái nhận phôi (đồng pha động dục) để mang thai hộ.',
    pages: 'Trang 7, 32 SGK CN 11',
  },
  {
    grade: '11',
    term: 'Đệm lót sinh học',
    definition: 'Lớp chất độn chuồng (trấu, mùn cưa, phoi bào) được phối trộn với hệ vi sinh vật có ích để phân hủy trực tiếp phân và nước tiểu của vật nuôi ngay tại nền chuồng.',
    pages: 'Trang 8, 115 SGK CN 11',
  },
  {
    grade: '11',
    term: 'Phúc lợi động vật (Animal welfare)',
    definition: 'Việc đối xử nhân đạo với vật nuôi sao cho chúng có trạng thái tốt về thể chất và tinh thần, không bị đói khát, đau đớn, sợ hãi hay ngược đãi trong suốt quá trình nuôi, vận chuyển và giết mổ.',
    pages: 'Trang 17 SGK CN 11',
  },
  {
    grade: '11',
    term: 'PCR (Polymerase Chain Reaction)',
    definition: 'Phản ứng chuỗi trùng hợp giúp nhân bản đặc hiệu một đoạn DNA mục tiêu lên hàng triệu bản sao trong ống nghiệm để xác định giới tính phôi hoặc phát hiện mầm bệnh.',
    pages: 'Trang 34, 74 SGK CN 11',
  },
  {
    grade: '11',
    term: 'Probiotics (Chế phẩm sinh học đường ruột)',
    definition: 'Chế phẩm chứa các vi sinh vật sống có lợi (như vi khuẩn lactic, Bacillus, nấm men) khi bổ sung vào thức ăn giúp cân bằng hệ vi sinh đường ruột, tăng tiêu hóa và ức chế vi khuẩn gây bệnh.',
    pages: 'Trang 114 SGK CN 11',
  },
  {
    grade: '11',
    term: 'Siêu bài noãn (Superovulation)',
    definition: 'Kĩ thuật tiêm hormone kích thích buồng trứng của con cái cho phôi làm chín và rụng số lượng trứng nhiều gấp nhiều lần so với chu kì động dục tự nhiên.',
    pages: 'Trang 32 SGK CN 11',
  },

  // Thuật ngữ Công nghệ 12 (Trang 144 SGK)
  {
    grade: '12',
    term: 'Ấu trùng (Larvae)',
    definition: 'Giai đoạn phát triển phôi sau khi nở ra khỏi trứng của các loài thủy sản (như Nauplius, Zoea, Mysis ở tôm) có hình thái và tập tính dinh dưỡng khác với con trưởng thành.',
    pages: 'Trang 72 SGK CN 12',
  },
  {
    grade: '12',
    term: 'Biofloc',
    definition: 'Tập hợp các hạt kết tụ lơ lửng trong nước gồm vi khuẩn dị dưỡng, tảo, động vật nguyên sinh và chất hữu cơ hình thành khi bổ sung nguồn Carbon (C:N = 10:1 – 20:1) và sục khí liên tục.',
    pages: 'Trang 107 SGK CN 12',
  },
  {
    grade: '12',
    term: 'Độ kiềm của nước (Alkalinity)',
    definition: 'Tổng hàm lượng các ion base có khả năng trung hòa acid trong nước (chủ yếu là HCO3-, CO3^2-), đóng vai trò là hệ đệm giữ cho pH nước ao nuôi ổn định và cung cấp khoáng cho tôm lột xác.',
    pages: 'Trang 53 SGK CN 12',
  },
  {
    grade: '12',
    term: 'Độ tàn che của rừng',
    definition: 'Mức độ che kín mặt đất của tán cây rừng, được biểu thị bằng tỉ số giữa diện tích hình chiếu thẳng đứng của tán cây rừng với tổng diện tích đất rừng (từ 0,1 đến 1,0).',
    pages: 'Trang 38 SGK CN 12',
  },
  {
    grade: '12',
    term: 'Giao vĩ (ở tôm, giáp xác)',
    definition: 'Quá trình ghép đôi sinh dục ở các loài giáp xác trong đó tôm đực chuyển và gắn túi tinh vào bộ phận nhận tinh của tôm cái.',
    pages: 'Trang 69 SGK CN 12',
  },
  {
    grade: '12',
    term: 'Hệ số chuyển đổi thức ăn (FCR – Feed Conversion Ratio)',
    definition: 'Lượng thức ăn (kg) tiêu tốn để thủy sản hoặc vật nuôi tăng thêm được 1 kg khối lượng cơ thể. FCR càng thấp thì hiệu quả sử dụng thức ăn càng cao.',
    pages: 'Trang 108 SGK CN 12',
  },
  {
    grade: '12',
    term: 'Hệ thống nuôi tuần hoàn (RAS)',
    definition: 'Hệ thống nuôi thủy sản công nghệ cao khép kín trong đó nước thải từ bể nuôi được lọc cơ học, lọc sinh học và khử trùng để tái sử dụng liên tục.',
    pages: 'Trang 105 SGK CN 12',
  },
  {
    grade: '12',
    term: 'Surimi',
    definition: 'Sản phẩm thịt cá hoặc mực đã được tách xương, rửa sạch mỡ và máu, nghiền nhuyễn tạo thành khối protein myofibrillar dẻo dai dùng làm nguyên liệu chế biến giả cua, chả cá, xúc xích hải sản.',
    pages: 'Trang 115 SGK CN 12',
  },
];
