import { MultipleChoiceQuestion, TrueFalseQuestion, Exam } from '../types/exam';
import {
  normalizeExam,
  normalizeMultipleChoiceQuestion,
} from '../utils/equalLengthNormalizer';
import { MOCK_EXAMS } from './mockExams';

export const EXTRA_GRADE_10_CROP_QUESTIONS: MultipleChoiceQuestion[] = [
  {
    id: 'extra_c1',
    number: 1,
    grade: '10',
    domain: 'crop',
    level: 'NB',
    question: 'Loại phân bón nào sau đây thuộc nhóm phân bón vi sinh vật?',
    options: {
      A: 'Phân vi sinh cố định đạm (Rhizobium).',
      B: 'Phân supe lân đơn.',
      C: 'Phân kali clorua (KCl).',
      D: 'Phân đạm ure CO(NH2)2.',
    },
    correctAnswer: 'A',
    explanation: 'Phân vi sinh vật chứa các chủng vi sinh vật sống hữu ích (như vi khuẩn cố định đạm, vi sinh vật chuyển hóa lân, phân giải cellulose).',
    textbookRef: 'Bài 6: Phân bón cây trồng - Công nghệ 10 KNTT',
  },
  {
    id: 'extra_c2',
    number: 2,
    grade: '10',
    domain: 'crop',
    level: 'NB',
    question: 'Phương pháp bón phân nào đưa chất dinh dưỡng trực tiếp qua khí khổng của lá cây trồng?',
    options: {
      A: 'Bón phân qua lá (phun phân bón lá).',
      B: 'Bón lót theo hốc rễ.',
      C: 'Bón thúc rải đều mặt luống.',
      D: 'Bón phân ngầm vào tầng đất sâu.',
    },
    correctAnswer: 'A',
    explanation: 'Phân bón lá hòa tan các chất dinh dưỡng khoáng và vi lượng được phun sương lên mặt lá để cây hấp thụ nhanh qua khí khổng.',
    textbookRef: 'Bài 6: Phân bón cây trồng - Công nghệ 10 KNTT',
  },
  {
    id: 'extra_c3',
    number: 3,
    grade: '10',
    domain: 'crop',
    level: 'NB',
    question: 'Nhà màng (nhà kính) trồng trọt công nghệ cao có tác dụng chủ yếu nào sau đây?',
    options: {
      A: 'Chủ động kiểm soát tiểu khí hậu (nhiệt độ, ẩm độ, ánh sáng) và ngăn ngừa sâu bệnh hại từ bên ngoài.',
      B: 'Giảm hoàn toàn nhu cầu sử dụng nước tưới cho cây trồng.',
      C: 'Làm cây không cần thực hiện quá trình quang hợp.',
      D: 'Loại bỏ hoàn toàn chi phí đầu tư ban đầu.',
    },
    correctAnswer: 'A',
    explanation: 'Nhà màng giúp che chắn mưa bão, côn trùng gây hại và kết hợp hệ thống quạt thông gió, lưới cắt nắng điều chỉnh nhiệt ẩm tối ưu cho cây.',
    textbookRef: 'Bài 10: Ứng dụng công nghệ cao trong trồng trọt - Công nghệ 10 KNTT',
  },
  {
    id: 'extra_c4',
    number: 4,
    grade: '10',
    domain: 'crop',
    level: 'NB',
    question: 'Kỹ thuật nuôi cấy mô tế bào thực vật (In vitro) có ưu điểm nổi bật nào sau đây?',
    options: {
      A: 'Nhân nhanh số lượng lớn cây giống đồng đều, sạch virus và giữ nguyên đặc tính tốt của cây mẹ.',
      B: 'Tạo ra cây con có nhiều biến dị tổ hợp mới lạ.',
      C: 'Chi phí cực rẻ có thể làm ngoài trời không cần phòng vô trùng.',
      D: 'Chỉ nhân được các loài cây thân gỗ cổ thụ.',
    },
    correctAnswer: 'A',
    explanation: 'Nuôi cấy mô tế bào dựa trên tính toàn năng của tế bào, sản xuất giống cây sạch bệnh quy mô công nghiệp trong thời gian ngắn.',
    textbookRef: 'Bài 7: Nhân giống cây trồng - Công nghệ 10 KNTT',
  },
  {
    id: 'extra_c5',
    number: 5,
    grade: '10',
    domain: 'crop',
    level: 'NB',
    question: 'Biện pháp luân canh cây trồng họ Đậu với cây lúa nước mang lại lợi ích nổi bật nào?',
    options: {
      A: 'Cắt đứt chu kỳ sâu bệnh hại và nốt sần rễ cây họ Đậu giúp cố định đạm làm giàu dinh dưỡng cho đất.',
      B: 'Làm cạn kiệt nguồn nước tưới ngầm.',
      C: 'Tăng lượng cỏ dại thủy sinh trên ruộng.',
      D: 'Làm đất bị chua hóa nhanh hơn.',
    },
    correctAnswer: 'A',
    explanation: 'Vi khuẩn nốt sần Rhizobium trên rễ cây họ đậu cố định nitơ tự do trong không khí thành đạm amon, giúp cải tạo độ phì nhiêu của đất và ngắt cầu nối sâu bệnh.',
    textbookRef: 'Bài 4 & 13: Cải tạo đất và phòng trừ sâu bệnh - Công nghệ 10 KNTT',
  },
];

export const EXTRA_GRADE_11_HUSBANDRY_QUESTIONS: MultipleChoiceQuestion[] = [
  {
    id: 'extra_h1',
    number: 5,
    grade: '11',
    domain: 'husbandry',
    level: 'NB',
    question: 'Phương pháp chọn lọc giống nào dựa vào kết quả kiểm tra năng suất của đời con cháu để đánh giá phẩm chất con bố mẹ?',
    options: {
      A: 'Chọn lọc theo đời sau (kiểm tra cá thể con cháu).',
      B: 'Chọn lọc hàng loạt theo ngoại hình bên ngoài.',
      C: 'Chọn lọc theo tổ tiên xa xưa.',
      D: 'Chọn ngẫu nhiên không có tiêu chí.',
    },
    correctAnswer: 'A',
    explanation: 'Chọn lọc theo đời sau cho độ chính xác cao nhất về giá trị giống của con bố mẹ vì loại trừ được phần lớn ảnh hưởng của môi trường.',
    textbookRef: 'Bài 3: Chọn giống vật nuôi - Công nghệ 11 KNTT',
  },
  {
    id: 'extra_h2',
    number: 6,
    grade: '11',
    domain: 'husbandry',
    level: 'NB',
    question: 'Đệm lót sinh học trong chăn nuôi gia súc, gia cầm được làm từ nguyên liệu chủ yếu nào?',
    options: {
      A: 'Mùn cưa, trấu khô kết hợp với chế phẩm men vi sinh vật hữu hiệu (Balasa N01).',
      B: 'Cát sông ẩm ướt trộn phân tươi.',
      C: 'Bê tông xi măng nhẵn bóng.',
      D: 'Đất sét nung vụn.',
    },
    correctAnswer: 'A',
    explanation: 'Đệm lót sinh học sử dụng trấu hoặc mùn cưa tẩm men vi sinh có khả năng phân giải nhanh phân và nước tiểu, triệt tiêu mùi hôi thối và khí độc NH3, H2S.',
    textbookRef: 'Bài 11: Ứng dụng công nghệ cao bảo vệ môi trường chăn nuôi - Công nghệ 11 KNTT',
  },
  {
    id: 'extra_h3',
    number: 7,
    grade: '11',
    domain: 'husbandry',
    level: 'NB',
    question: 'Bệnh lở mồm long móng (FMD) ở gia súc guốc chẵn (trâu, bò, lợn) lây lan chủ yếu qua con đường nào?',
    options: {
      A: 'Tiếp xúc trực tiếp, qua đường hô hấp, thức ăn, nước uống và không khí mang virus.',
      B: 'Chỉ lây khi bị động vật có độc cắn.',
      C: 'Lây truyền qua đường tia phóng xạ mặt trời.',
      D: 'Chỉ lây ở môi trường nước mặn ven biển.',
    },
    correctAnswer: 'A',
    explanation: 'Bệnh LMLM do Aphthovirus gây ra, lây lan cực kỳ nhanh qua đường hô hấp, tiếp xúc trực tiếp hoặc gián tiếp qua chất thải, dụng cụ chăn nuôi.',
    textbookRef: 'Bài 13: Bệnh truyền nhiễm ở gia súc - Công nghệ 11 KNTT',
  },
  {
    id: 'extra_h4',
    number: 8,
    grade: '11',
    domain: 'husbandry',
    level: 'NB',
    question: 'Công nghệ gắn chíp điện tử (thẻ tai RFID) trong chăn nuôi hiện đại có tác dụng gì?',
    options: {
      A: 'Định danh từng cá thể, theo dõi tự động sức khỏe, chu kỳ động dục, lượng thức ăn và nguồn gốc vật nuôi.',
      B: 'Thay thế việc cho gia súc ăn uống hàng ngày.',
      C: 'Tăng trọng lượng cơ thể vật nuôi thêm 50% ngay lập tức.',
      D: 'Biến vật nuôi thành động vật biến đổi gen.',
    },
    correctAnswer: 'A',
    explanation: 'Thẻ tai RFID lưu mã số định danh kết nối với phần mềm quản lý trang trại giúp ghi nhận chính xác dữ liệu thể trạng, phả hệ và truy xuất nguồn gốc sản phẩm.',
    textbookRef: 'Bài 15: Ứng dụng công nghệ số trong chăn nuôi - Công nghệ 11 KNTT',
  },
];

export const EXTRA_GRADE_12_FORESTRY_QUESTIONS: MultipleChoiceQuestion[] = [
  {
    id: 'extra_f1',
    number: 9,
    grade: '12',
    domain: 'forestry',
    level: 'NB',
    question: 'Tầng vượt tán trong cấu trúc tầng thứ của rừng mưa nhiệt đới thường bao gồm các loài cây có đặc điểm nào?',
    options: {
      A: 'Cây gỗ lớn ưa sáng, vươn cao hẳn lên trên tán rừng liên tục (chiều cao trên 30 - 40 mét).',
      B: 'Các loài cây bụi thấp bé bò sát mặt đất.',
      C: 'Các loài rêu và địa y bám ở gốc cây ẩm ướt.',
      D: 'Cây dây leo thân thảo quấn quanh mặt đất.',
    },
    correctAnswer: 'A',
    explanation: 'Cấu trúc rừng mưa nhiệt đới gồm tầng vượt tán (cây nhô), tầng ưu thế sinh thái (tán rừng), tầng dưới tán, tầng cây bụi và thảm tươi.',
    textbookRef: 'Bài 2: Cấu trúc hệ sinh thái rừng - Công nghệ 12 KNTT',
  },
  {
    id: 'extra_f2',
    number: 10,
    grade: '12',
    domain: 'forestry',
    level: 'TH',
    question: 'Vì sao trong lâm nghiệp, rừng hỗn giao nhiều loài thường có khả năng chống chịu sâu bệnh và điều hòa nguồn nước tốt hơn rừng thuần loài?',
    options: {
      A: 'Có cấu trúc không gian đa dạng, nhiều tầng tán che phủ đất và hệ sinh thái có nhiều loài thiên địch kìm hãm lẫn nhau.',
      B: 'Rừng hỗn giao không có bất kỳ loài côn trùng nào sinh sống.',
      C: 'Rừng hỗn giao hoàn toàn không bị ảnh hưởng bởi nắng mưa hay gió bão.',
      D: 'Các cây rừng hỗn giao không cần hấp thụ nước và khoáng chất trong đất.',
    },
    correctAnswer: 'A',
    explanation: 'Rừng hỗn giao đa dạng sinh học tạo chuỗi lưới thức ăn phong phú, thiên địch phát triển ngăn chặn dịch bùng phát và thảm thực bì nhiều tầng giữ nước cực tốt.',
    textbookRef: 'Bài 2 & 6: Sinh thái và quản lý rừng - Công nghệ 12 KNTT',
  },
  {
    id: 'extra_f3',
    number: 11,
    grade: '12',
    domain: 'forestry',
    level: 'VD',
    question: 'Một dải đất ven biển miền Trung nhiều đồi cát di động, gió biển thổi mạnh mang theo cát vùi lấp ruộng đồng. Dự án lâm nghiệp nên ưu tiên trồng đai rừng phòng hộ với loại cây nào sau đây?',
    options: {
      A: 'Cây phi lao (Casuarina equisetifolia) có tán lá kim cản gió tốt, chịu khô hạn và chịu cát vùi.',
      B: 'Cây chè búp và cà phê chè.',
      C: 'Cây chuối tây và cây đu đủ.',
      D: 'Cây lúa nước và sen bùn.',
    },
    correctAnswer: 'A',
    explanation: 'Cây phi lao có cành biến đổi thành dạng lá kim thoát hơi nước ít, chịu mặn và gió bão, rễ có nốt sần cố định đạm giúp phát triển tốt trên cát trắng chắn cát bay.',
    textbookRef: 'Bài 1 & 5: Trồng rừng phòng hộ ven biển - Công nghệ 12 KNTT',
  },
];

export const EXTRA_GRADE_12_AQUACULTURE_QUESTIONS: MultipleChoiceQuestion[] = [
  {
    id: 'extra_a1',
    number: 15,
    grade: '12',
    domain: 'aquaculture',
    level: 'NB',
    question: 'Độ mặn của nước nuôi tôm sú và tôm thẻ chân trắng nước lợ dao động trong khoảng thích hợp là',
    options: {
      A: 'từ 5‰ đến 25‰.',
      B: 'từ 50‰ đến 70‰.',
      C: 'từ 0‰ đến 1‰.',
      D: 'trên 90‰.',
    },
    correctAnswer: 'A',
    explanation: 'Tôm nước lợ thích ứng tốt nhất trong độ mặn 10 - 25‰ (tôm thẻ có khả năng chịu ngọt hóa xuống 2 - 5‰).',
    textbookRef: 'Bài 11: Môi trường nuôi thủy sản - Công nghệ 12 KNTT',
  },
  {
    id: 'extra_a2',
    number: 16,
    grade: '12',
    domain: 'aquaculture',
    level: 'TH',
    question: 'Tại sao việc xi-phông đáy ao định kỳ trong nuôi tôm thẻ chân trắng mật độ cao lại là khâu kỹ thuật bắt buộc?',
    options: {
      A: 'Hút bỏ phân tôm, thức ăn dư thừa và vỏ tôm lột tích tụ tại hố rốn đáy ao ra ngoài, ngăn ngừa khí độc phát sinh.',
      B: 'Làm giảm mực nước ao để tôm không thể bơi lội.',
      C: 'Để thu hồi tôm nhỏ đem bán lẻ.',
      D: 'Để làm tăng độ kiềm của nước ao.',
    },
    correctAnswer: 'A',
    explanation: 'Xiphong đáy ao gom chất thải hữu cơ ra khỏi hệ thống trước khi chúng phân hủy yếm khí sinh ra các chất cực độc như NH3, NO2-, H2S.',
    textbookRef: 'Bài 12 & 14: Kỹ thuật nuôi tôm công nghiệp - Công nghệ 12 KNTT',
  },
  {
    id: 'extra_a3',
    number: 17,
    grade: '12',
    domain: 'aquaculture',
    level: 'VD',
    question: 'Để nuôi cá rô phi trong lồng bè trên hồ chứa thủy điện lớn đạt năng suất cao và hạn chế dịch bệnh, khoảng cách tối thiểu giữa các cụm lồng bè nên được bố trí là',
    options: {
      A: 'cách nhau từ 200 - 300 mét và diện tích lồng bè không vượt quá 0,2% diện tích mặt nước hồ.',
      B: 'kết bè sát nhau tạo thành một mảng kín toàn bộ mặt hồ.',
      C: 'đặt ngay cửa xả nước của nhà máy phát điện.',
      D: 'neo đậu tại các vũng nước tù đọng không có dòng chảy lưu thông.',
    },
    correctAnswer: 'A',
    explanation: 'Bố trí lồng bè thông thoáng giúp nước hồ lưu thông tự nhiên, cung cấp oxy dồi dào, cuốn trôi chất thải và ngăn ngừa dịch bệnh lây lan giữa các cụm lồng.',
    textbookRef: 'Bài 14: Kỹ thuật nuôi thủy sản trong lồng bè - Công nghệ 12 KNTT',
  },
];

/**
 * Bộ sinh số giả ngẫu nhiên có hạt giống (Seeded PRNG - Mulberry32)
 * Giúp tái tạo chính xác 100% nội dung 24 câu Phần I + 4 câu Phần II của đề ngẫu nhiên
 * trên mọi thiết bị (Android, iOS, Windows) khi học sinh mở Link hoặc quét Mã QR.
 */
function createSeededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Sinh đề thi ngẫu nhiên đảm bảo đúng 100% ma trận quy định:
 * - 24 câu trắc nghiệm nhiều phương án lựa chọn (mỗi câu 0.25đ):
 *   + 4 câu NB Công nghệ 10 Trồng trọt
 *   + 4 câu NB Công nghệ 11 Chăn nuôi
 *   + 16 câu Công nghệ 12 Lâm nghiệp & Thủy sản (gồm NB, TH, VD)
 * - 4 câu Đúng / Sai (mỗi câu 1đ):
 *   + 100% Công nghệ 12 Lâm nghiệp & Thủy sản
 *   + Mỗi câu có tình huống thực tiễn
 *   + 4 ý gồm: 1 ý NB, 1 ý TH, 2 ý VD
 */
export function generateRandomExam(seed?: number, forcedCode?: string): Exam {
  const effectiveSeed =
    typeof seed === 'number' && !isNaN(seed) && seed > 0
      ? Math.floor(seed)
      : Math.floor(100000 + Math.random() * 899999);
  const rng = createSeededRandom(effectiveSeed);

  // Helper deduplicate by question text
  const uniqueByQuestion = (arr: MultipleChoiceQuestion[]): MultipleChoiceQuestion[] => {
    const seen = new Set<string>();
    return arr.filter((item) => {
      const key = item.question.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Helper deduplicate True/False by scenario/citation
  const uniqueByScenario = (arr: TrueFalseQuestion[]): TrueFalseQuestion[] => {
    const seen = new Set<string>();
    return arr.filter((item) => {
      const key = (item.scenario || item.citation || item.id).trim().toLowerCase().slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Pool questions from all 6 standard exams + extras
  const g10Pool = uniqueByQuestion([
    ...MOCK_EXAMS.slice(0, 6).flatMap((e) => e.partI.slice(0, 4)),
    ...EXTRA_GRADE_10_CROP_QUESTIONS.map((q, i) =>
      normalizeMultipleChoiceQuestion(q, i)
    ),
  ]);
  const g11Pool = uniqueByQuestion([
    ...MOCK_EXAMS.slice(0, 6).flatMap((e) => e.partI.slice(4, 8)),
    ...EXTRA_GRADE_11_HUSBANDRY_QUESTIONS.map((q, i) =>
      normalizeMultipleChoiceQuestion(q, i + 1)
    ),
  ]);
  const g12RegularForestryPool = uniqueByQuestion([
    ...MOCK_EXAMS.slice(0, 6).flatMap((e) =>
      e.partI.filter((q) => q.grade === '12' && q.domain === 'forestry' && !q.chartData && !q.tableData)
    ),
    ...EXTRA_GRADE_12_FORESTRY_QUESTIONS.map((q, i) =>
      normalizeMultipleChoiceQuestion(q, i + 2)
    ),
  ]);
  const g12ChartVDPool = uniqueByQuestion(
    MOCK_EXAMS.slice(0, 6).flatMap((e) => e.partI.filter((q) => Boolean(q.chartData)))
  );
  const g12RegularAquaPool = uniqueByQuestion([
    ...MOCK_EXAMS.slice(0, 6).flatMap((e) =>
      e.partI.filter((q) => q.grade === '12' && q.domain === 'aquaculture' && !q.chartData && !q.tableData)
    ),
    ...EXTRA_GRADE_12_AQUACULTURE_QUESTIONS.map((q, i) =>
      normalizeMultipleChoiceQuestion(q, i + 3)
    ),
  ]);
  const g12TableVDPool = uniqueByQuestion(
    MOCK_EXAMS.slice(0, 6).flatMap((e) => e.partI.filter((q) => Boolean(q.tableData)))
  );

  const tfTablePool = uniqueByScenario(
    MOCK_EXAMS.slice(0, 6)
      .map((e) => e.partII[0])
      .filter(Boolean)
  );
  const tfChartPool = uniqueByScenario(
    MOCK_EXAMS.slice(0, 6)
      .map((e) => e.partII[1])
      .filter(Boolean)
  );
  const tfScenarioPool = uniqueByScenario(
    MOCK_EXAMS.slice(0, 6).flatMap((e) => [e.partII[2], e.partII[3]].filter(Boolean))
  );

  // Deterministic shuffle using seeded PRNG
  const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const selectedG10 = shuffle(g10Pool).slice(0, 4);
  const selectedG11 = shuffle(g11Pool).slice(0, 4);
  const selectedForestryRegular = shuffle(g12RegularForestryPool).slice(0, 5);
  const selectedChartVD = shuffle(g12ChartVDPool)[0];
  const selectedAquaRegular = shuffle(g12RegularAquaPool).slice(0, 9);
  const selectedTableVD = shuffle(g12TableVDPool)[0];

  const selectedG12: MultipleChoiceQuestion[] = [
    ...selectedForestryRegular, // Câu 9 - 13
    selectedChartVD, // Câu 14: Vận dụng phân tích biểu đồ
    ...selectedAquaRegular.slice(0, 8), // Câu 15 - 22
    selectedTableVD, // Câu 23: Vận dụng phân tích số liệu
    selectedAquaRegular[8], // Câu 24
  ];

  const selectedTF = [
    ...shuffle(tfTablePool).slice(0, 1),
    ...shuffle(tfChartPool).slice(0, 1),
    ...shuffle(tfScenarioPool).slice(0, 2),
  ];

  // Tạo duy nhất 1 mã đề ngẫu nhiên 3 chữ số (từ 201 - 699), tránh trùng 48 mã đề chuẩn (101 - 148) và mã 0716..0814
  let code = forcedCode ? forcedCode.trim() : '';
  let randomCodeNum = parseInt(code, 10);
  if (!code || isNaN(randomCodeNum)) {
    randomCodeNum = 201 + (effectiveSeed % 499); // 201..699
    code = randomCodeNum.toString();
  }

  // Renumber questions 1 to 24 with deterministic IDs
  const partI: MultipleChoiceQuestion[] = [
    ...selectedG10.map((q, idx) => ({
      ...q,
      id: `rand_${code}_${effectiveSeed}_q${idx + 1}`,
      number: idx + 1,
    })),
    ...selectedG11.map((q, idx) => ({
      ...q,
      id: `rand_${code}_${effectiveSeed}_q${idx + 5}`,
      number: idx + 5,
    })),
    ...selectedG12.map((q, idx) => ({
      ...q,
      id: `rand_${code}_${effectiveSeed}_q${idx + 9}`,
      number: idx + 9,
    })),
  ];

  // Renumber Part II 1 to 4 with deterministic IDs
  const partII: TrueFalseQuestion[] = selectedTF.map((tf, idx) => ({
    ...tf,
    number: idx + 1,
    id: `rand_${code}_${effectiveSeed}_tf${idx + 1}`,
  }));

  return normalizeExam(
    {
      id: `exam-random-${code}-${effectiveSeed}`,
      code,
      title: `Đề Thi Khảo Sát Tốt Nghiệp THPT - Mã Đề ${code}`,
      description:
        'Đề tham khảo tạo ngẫu nhiên mới từ Ngân hàng đề thi Công nghệ Nông nghiệp: Phần I gồm 24 câu nhiều lựa chọn (có 01 câu vận dụng phân tích biểu đồ & 01 câu vận dụng phân tích số liệu); Phần II gồm 04 câu đúng/sai.',
      durationMinutes: 50,
      partI,
      partII,
    },
    randomCodeNum
  );
}

