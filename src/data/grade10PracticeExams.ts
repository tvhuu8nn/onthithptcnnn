import {
  CHAPTER_REVIEW_DATA,
  ChapterMCQItem,
  CognitiveLevel,
} from './chapterReviewData';
import { normalizeChapterMCQItem } from '../utils/equalLengthNormalizer';
import { Exam, MultipleChoiceQuestion, TrueFalseQuestion, TrueFalseStatement } from '../types/exam';

export interface Grade10ExamQuestion extends ChapterMCQItem {
  chapterId: string;
  chapterNumber: string;
  chapterTitle: string;
  lessonRef: string;
}

export interface Grade10PracticeExam extends Exam {
  examNumber: number;
  subtitle: string;
  totalQuestions: number;
  bietCount: number;
  hieuCount: number;
  chapterDistribution: {
    chapterId: string;
    chapterNumber: string;
    chapterTitle: string;
    bietCount: number;
    hieuCount: number;
    totalCount: number;
  }[];
  questions: Grade10ExamQuestion[];
}

// Bổ sung thêm mỗi chương 3 câu Biết + 3 câu Thông hiểu chuẩn SGK Công nghệ Trồng trọt 10 (Kết nối tri thức)
// để kết hợp với 160 câu sẵn có (15 Biết + 5 Thông hiểu / chương) tạo thành 5 đề × 40 câu = 200 câu hoàn toàn không trùng lặp.
const EXTRA_QUESTIONS_10_RAW: Record<string, ChapterMCQItem[]> = {
  'cn10-c1': [
    {
      number: 21,
      level: 'biet',
      question: 'Theo đặc tính sinh vật học về cấu trúc thân, nhóm cây trồng nào sau đây thuộc nhóm cây thân thảo?',
      options: [
        'Cây lúa nước, cây ngô, cây rau cải ngọt, cây cà chua và cây hành lá',
        'Cây xoài cát, cây mít nghệ, cây sầu riêng, cây bưởi và cây nhãn lồng',
        'Cây cao su, cây cà phê vối, cây điều ghép, cây thông và cây bạch đàn',
        'Cây cam sành, cây quýt đường, cây vải thiều, cây chôm chôm và cây mận',
      ],
      correctIndex: 0,
      explanation: 'Theo Bài 2 SGK Công nghệ 10, cây thân thảo có thân mềm, ít gỗ hóa, chu kì sống thường ngắn như lúa, ngô, rau cải, cà chua.',
    },
    {
      number: 22,
      level: 'biet',
      question: 'Theo số lá mầm trong phôi hạt, nhóm cây trồng nào sau đây thuộc nhóm cây một lá mầm?',
      options: [
        'Cây lúa nước, cây ngô, cây mía, cây hành củ, cây tỏi và cây hoa lan',
        'Cây đậu tương, cây lạc, cây đậu xanh, cây rau cải và cây cà chua',
        'Cây cam, cây bưởi, cây xoài, cây nhãn, cây vải thiều và cây sầu riêng',
        'Cây cà phê, cây cao su, cây hồ tiêu, cây điều và cây chè trung du',
      ],
      correctIndex: 0,
      explanation: 'Lúa, ngô, mía, hành, tỏi, hoa lan là các cây một lá mầm (hạt có 1 lá mầm, rễ chùm, gân lá song song hoặc hình cung).',
    },
    {
      number: 23,
      level: 'biet',
      question: 'Yêu cầu nào sau đây là phẩm chất cần thiết đối với người lao động trong ngành trồng trọt hiện đại?',
      options: [
        'Có kiến thức chuyên môn, kĩ năng vận hành thiết bị và ý thức bảo vệ môi trường',
        'Chỉ cần làm việc theo kinh nghiệm truyền miệng mà không cần học quy trình mới',
        'Ưu tiên sử dụng tối đa hóa chất độc hại để rút ngắn thời gian chăm sóc cây',
        'Bỏ qua các quy định về an toàn vệ sinh thực phẩm khi thu hoạch nông sản',
      ],
      correctIndex: 0,
      explanation: 'Bài 1 SGK Công nghệ 10 nêu rõ người lao động trồng trọt cần có kiến thức khoa học, kĩ năng sử dụng máy móc công nghệ và ý thức bảo vệ môi trường.',
    },
    {
      number: 24,
      level: 'hieu',
      question: 'Vì sao việc phát triển vùng chuyên canh quy mô lớn đạt chuẩn VietGAP lại giúp nâng cao giá trị nông sản Việt Nam?',
      options: [
        'Đảm bảo chất lượng đồng đều, an toàn thực phẩm và đáp ứng tiêu chuẩn xuất khẩu',
        'Giúp tăng gấp mười lần lượng thuốc trừ sâu hóa học tồn dư bên trong nông sản',
        'Làm giảm hoàn toàn nhu cầu sử dụng nước tưới và ánh sáng mặt trời của cây',
        'Giúp người nông dân không cần thu hoạch mà nông sản vẫn tự bảo quản ngoài đồng',
      ],
      correctIndex: 0,
      explanation: 'Sản xuất theo VietGAP/GlobalGAP tại vùng chuyên canh giúp kiểm soát quy trình an toàn, truy xuất nguồn gốc rõ ràng và mở rộng thị trường xuất khẩu.',
    },
    {
      number: 25,
      level: 'hieu',
      question: 'Tại sao khi thiếu nước kéo dài trong giai đoạn cây lúa làm đòng – trỗ bông thì năng suất hạt lại sụt giảm nghiêm trọng?',
      options: [
        'Vì thiếu nước làm cản trở quang hợp, vận chuyển chất dinh dưỡng và thụ phấn tạo hạt',
        'Vì thiếu nước làm cho rễ lúa phát triển quá mạnh và hút hết chất diệp lục của lá',
        'Vì thiếu nước làm hạt lúa tự động nảy mầm ngay khi vẫn còn nằm ở trên bông',
        'Vì thiếu nước làm tăng gấp đôi số lượng hạt chắc trên mỗi bông lúa khi thu hoạch',
      ],
      correctIndex: 0,
      explanation: 'Nước là nguyên liệu quang hợp và môi trường vận chuyển chất hữu cơ về hạt; thiếu nước lúc làm đòng – trỗ gây nghẹn đòng, hạt lép lửng nhiều.',
    },
    {
      number: 26,
      level: 'hieu',
      question: 'Mối quan hệ giữa giống cây trồng và kĩ thuật canh tác được thể hiện chính xác nhất qua nhận định nào sau đây?',
      options: [
        'Giống quy định tiềm năng năng suất còn kĩ thuật canh tác giúp phát huy tối đa tiềm năng đó',
        'Kĩ thuật canh tác có thể biến đổi giống cây lương thực thành giống cây lấy gỗ lâu năm',
        'Khi đã có giống tốt thì không cần tưới nước, bón phân hay phòng trừ sâu bệnh hại nữa',
        'Giống cây trồng chỉ có vai trò trang trí còn năng suất hoàn toàn do phân hóa học quyết định',
      ],
      correctIndex: 0,
      explanation: 'Giống là yếu tố nội tại quy định giới hạn năng suất, còn kĩ thuật canh tác tác động điều chỉnh ngoại cảnh để giống phát huy tối đa tiềm năng di truyền (Bài 2 SGK CN 10).',
    },
  ],
  'cn10-c2': [
    {
      number: 21,
      level: 'biet',
      question: 'Theo cấu tạo của hạt keo đất (Bài 3 SGK Công nghệ 10), lớp nằm ngoài cùng có khả năng trao đổi ion với dung dịch đất là',
      options: [
        'Lớp ion khuếch tán gồm các ion chuyển động tự do quanh hạt keo',
        'Nhân keo đất nằm ở vị trí trung tâm không mang điện tích tự do',
        'Lớp ion quyết định điện gắn chặt trực tiếp lên bề mặt nhân keo',
        'Lớp ion bất động nằm sát lớp ion quyết định điện của hạt keo',
      ],
      correctIndex: 0,
      explanation: 'Cấu tạo hạt keo đất gồm: Nhân keo -> Lớp ion quyết định điện -> Lớp ion bất động -> Lớp ion khuếch tán (lớp ngoài cùng trao đổi ion với dung dịch đất).',
    },
    {
      number: 22,
      level: 'biet',
      question: 'Độ chua hoạt tính của đất trồng được tạo nên bởi các ion nào tồn tại tự do trong dung dịch đất?',
      options: [
        'Các ion H+ tự do hòa tan ở bên trong dung dịch đất trồng',
        'Các ion Al3+ và H+ nằm trên bề mặt lớp khuếch tán keo đất',
        'Các ion Ca2+ và Mg2+ bám chặt trên bề mặt hạt keo đất âm',
        'Các ion Na+ và Cl- hòa tan với nồng độ cao trong nước ngầm',
      ],
      correctIndex: 0,
      explanation: 'Độ chua hoạt tính do ion H+ trong dung dịch đất gây nên; còn độ chua tiềm tàng do ion H+ và Al3+ trên bề mặt keo đất gây nên (Bài 3 trang 22).',
    },
    {
      number: 23,
      level: 'biet',
      question: 'Giá thể đá trân châu (Perlite) dùng trong trồng trọt được sản xuất bằng cách nung quặng đá núi lửa ở nhiệt độ',
      options: [
        'Nung ở nhiệt độ cao khoảng từ 800 °C đến 850 °C cho nở xốp',
        'Nung ở nhiệt độ thấp khoảng từ 50 °C đến 70 °C trong bóng râm',
        'Ngâm trong nước vôi trong ở nhiệt độ phòng từ 20 °C đến 25 °C',
        'Ủ yếm khí với trấu tươi ở nhiệt độ khoảng từ 40 °C đến 50 °C',
      ],
      correctIndex: 0,
      explanation: 'Theo Bài 5 SGK Công nghệ 10 (trang 35), giá thể Perlite được tạo ra bằng cách nghiền nhỏ đá núi lửa rồi nung ở 800–850 °C tạo hạt xốp trắng nhẹ.',
    },
    {
      number: 24,
      level: 'hieu',
      question: 'Vì sao khi cải tạo đất xám bạc màu, người ta phải thực hiện cày sâu dần kết hợp với bón tăng cường phân hữu cơ?',
      options: [
        'Vì tầng đất mặt rất mỏng và nghèo mùn nên cày sâu ngay sẽ đưa tầng đất chết lên mặt ruộng',
        'Vì đất xám bạc màu có tầng canh tác dày tới hai mét và chứa quá nhiều chất mùn hữu cơ',
        'Để làm tăng nhanh lượng hạt cát thô và thúc đẩy quá trình rửa trôi dinh dưỡng xuống sâu',
        'Để làm cho mặt đất bị đóng váng cứng lại ngăn không cho nước mưa thấm xuống tầng rễ',
      ],
      correctIndex: 0,
      explanation: 'Đất xám bạc màu có tầng canh tác mỏng (< 10–15 cm), nghèo sét và mùn; phải cày sâu dần từng vụ kết hợp bón phân hữu cơ để làm dày tầng đất màu mà không làm nghèo lớp mặt.',
    },
    {
      number: 25,
      level: 'hieu',
      question: 'Tại sao khi trộn giá thể Perlite hoặc gốm viên vào đất trồng trong chậu lại giúp hạn chế tình trạng thối rễ cây cảnh?',
      options: [
        'Vì các hạt giá thể có nhiều lỗ xốp giúp thoát nước dư thừa nhanh và giữ độ thoáng khí O2 cho rễ',
        'Vì giá thể Perlite tiết ra thuốc kháng sinh hóa học tiêu diệt toàn bộ nấm bệnh trong chậu',
        'Vì giá thể gốm viên làm cho nước trong chậu đông đặc lại không cho rễ cây tiếp xúc với nước',
        'Vì các giá thể trơ cứng này cung cấp lượng đạm nguyên chất cao gấp mười lần phân bón urea',
      ],
      correctIndex: 0,
      explanation: 'Perlite và gốm viên là giá thể trơ có cấu trúc lỗ xốp thông thoáng, giúp thoát nước tốt, chống ngập úng và duy trì hàm lượng oxygen cho rễ hô hấp.',
    },
    {
      number: 26,
      level: 'hieu',
      question: 'Trong thực hành xác định độ mặn của đất (Bài 6), nếu kết quả đo nồng độ muối tan đạt 4,2‰ thì cần xử lí đất như thế nào?',
      options: [
        'Đất bị nhiễm mặn nên cần bón vôi đẩy Na+ khỏi keo đất kết hợp thau rửa bằng nước ngọt',
        'Đất hoàn toàn ngọt bình thường nên không cần áp dụng bất kì biện pháp cải tạo đất nào',
        'Cần bón thêm nhiều muối ăn NaCl vào ruộng để cân bằng áp suất thẩm thấu cho rễ cây',
        'Cần tháo nước biển trực tiếp vào ngâm ruộng liên tục trong suốt ba tháng mùa khô hạn',
      ],
      correctIndex: 0,
      explanation: 'Đất có nồng độ muối tan > 2,56‰ là đất mặn (Bài 4 trang 28); mức 4,2‰ cần cải tạo bằng bón vôi (Ca2+ đẩy Na+) và dẫn nước ngọt vào thau rửa mặn.',
    },
  ],
  'cn10-c3': [
    {
      number: 21,
      level: 'biet',
      question: 'Theo Bài 7 SGK Công nghệ 10, nhóm các nguyên tố dinh dưỡng đa lượng thiết yếu mà cây trồng cần với lượng lớn là',
      options: [
        'Đạm (Nitrogen - N), Lân (Phosphorus - P) và Kali (Potassium - K)',
        'Sắt (Fe), Kẽm (Zn), Đồng (Cu), Mangan (Mn) và Molypden (Mo)',
        'Vàng (Au), Bạc (Ag), Bạch kim (Pt), Thủy ngân (Hg) và Chì (Pb)',
        'Khí hiếm Helium (He), Neon (Ne), Argon (Ar) và Krypton (Kr)',
      ],
      correctIndex: 0,
      explanation: 'Đạm (N), Lân (P), Kali (K) là 3 nguyên tố dinh dưỡng đa lượng chính được bổ sung thông qua các loại phân bón đa lượng.',
    },
    {
      number: 22,
      level: 'biet',
      question: 'Bón phân thúc cho cây trồng là hình thức bón phân được thực hiện vào thời điểm nào sau đây?',
      options: [
        'Bón trong quá trình cây đang sinh trưởng, phát triển mạnh để đáp ứng kịp thời nhu cầu dinh dưỡng',
        'Bón toàn bộ lượng phân vào trong đất trước khi tiến hành gieo hạt hoặc trồng cây con lên ruộng',
        'Bón vào nông sản sau khi đã thu hoạch đem về kho bảo quản để làm tăng khối lượng hạt khô',
        'Chỉ bón một lần duy nhất sau khi cây trồng đã già cỗi và kết thúc hoàn toàn chu kì sống',
      ],
      correctIndex: 0,
      explanation: 'Bón lót là bón trước khi gieo trồng; còn bón thúc là bón trong thời kì cây đang sinh trưởng phát triển (đẻ nhánh, vươn lóng, đón đòng, nuôi quả).',
    },
    {
      number: 23,
      level: 'biet',
      question: 'Trong thực hành nhận biết phân bón hóa học (Bài 11), loại phân bón nào không tan hoặc ít tan trong nước và có màu xám tro?',
      options: [
        'Phân lân nung chảy hoặc phân supe lân (có màu xám trắng hoặc xám tro)',
        'Phân đạm urea tinh thể màu trắng tròn tan rất nhanh hoàn toàn trong nước',
        'Phân kali clorua có màu đỏ hồng như muối ớt và tan hoàn toàn trong nước',
        'Phân đạm amoni nitrat có màu trắng ngà dễ chảy nước và tan hết trong nước',
      ],
      correctIndex: 0,
      explanation: 'Theo Bài 11 SGK Công nghệ 10 (trang 57), phân lân (supe lân, lân nung chảy) có màu xám tro/xám xanh và không tan hoặc ít tan trong nước lạnh.',
    },
    {
      number: 24,
      level: 'hieu',
      question: 'Vì sao khi bảo quản các loại phân bón hóa học như đạm urea, amoni nitrat không được để lẫn lộn các loại phân với nhau?',
      options: [
        'Vì chúng dễ xảy ra phản ứng hóa học làm chảy nước, vón cục và mất chất dinh dưỡng',
        'Vì để chung các loại phân sẽ làm khối lượng bao phân tự động tăng lên gấp ba lần',
        'Vì phân đạm trộn sẵn với vôi khi bảo quản sẽ giữ được lượng đạm bền vững mãi mãi',
        'Vì các hạt phân bón sẽ tự nảy mầm thành cây cỏ dại ngay bên trong kho chứa phân',
      ],
      correctIndex: 0,
      explanation: 'Mỗi loại phân hóa học có tính chất lí hóa khác nhau; trộn lẫn khi bảo quản lâu ngày gây phản ứng trao đổi tạo muối dễ hút ẩm chảy nước hoặc bay hơi mất NH3.',
    },
    {
      number: 25,
      level: 'hieu',
      question: 'Tại sao việc bón kết hợp phân bón hữu cơ với phân bón hóa học lại mang lại hiệu quả bền vững cao nhất cho đất và cây?',
      options: [
        'Phân hóa học cung cấp dinh dưỡng nhanh còn phân hữu cơ cải tạo đất và giữ phân lâu bền',
        'Phân hữu cơ làm tiêu hủy hoàn toàn các nguyên tố khoáng N, P, K có trong phân hóa học',
        'Làm cho đất trồng chuyển sang trạng thái hóa đá vĩnh viễn để không bị xói mòn do mưa',
        'Giúp cây trồng không cần sử dụng bộ rễ để hút nước trong suốt cả vụ gieo trồng nữa',
      ],
      correctIndex: 0,
      explanation: 'Phân hóa học giàu dinh dưỡng dễ tiêu giúp cây bứt phá nhanh ở giai đoạn cao điểm, còn phân hữu cơ bổ sung mùn, tăng keo đất và nuôi VSV giúp đất tơi xốp bền vững.',
    },
    {
      number: 26,
      level: 'hieu',
      question: 'Khi thử một mẫu phân bón trên cục than hồng thấy có mùi khai nồng của khí amoniac (NH3) bốc lên thì mẫu đó thuộc nhóm',
      options: [
        'Nhóm phân đạm (như đạm amoni sunfat, amoni clorua hoặc đạm urea)',
        'Nhóm phân lân nung chảy không có chứa nguyên tố nitrogen trong phân',
        'Nhóm phân kali clorua hoặc kali sunfat chỉ chứa nguyên tố potassium',
        'Nhóm bột đá vôi nghiền mịn dùng để bón khử chua cho đất phèn mặn',
      ],
      correctIndex: 0,
      explanation: 'Theo Bài 11 SGK Công nghệ 10 (trang 58), khi đốt trên than hồng, phân đạm nóng chảy/bốc khói trắng và tỏa mùi khai nồng đặc trưng của khí NH3.',
    },
  ],
  'cn10-c4': [
    {
      number: 21,
      level: 'biet',
      question: 'Cấp hạt giống nào có độ thuần di truyền cao nhất, được nhân ra trực tiếp từ hạt giống tác giả để sản xuất hạt giống xác nhận?',
      options: [
        'Hạt giống nguyên chủng (nhân từ giống tác giả theo quy trình nghiêm ngặt)',
        'Hạt giống thương phẩm đại trà đã qua nhiều vụ gieo trồng ngoài đồng ruộng',
        'Hạt giống thu hoạch tận dụng từ các ruộng sản xuất lương thực thương mại',
        'Hạt giống lai F2, F3 đã bị phân li tính trạng mạnh ở các thế hệ kế tiếp',
      ],
      correctIndex: 0,
      explanation: 'Theo Bài 12 SGK Công nghệ 10 (trang 62), hệ thống nhân giống chuẩn gồm: Hạt giống tác giả -> Hạt giống siêu nguyên chủng -> Hạt giống nguyên chủng -> Hạt giống xác nhận.',
    },
    {
      number: 22,
      level: 'biet',
      question: 'Trong phương pháp chọn lọc cá thể (Bài 13), việc đánh giá và chọn lọc ở thế hệ đầu tiên dựa trên cơ sở nào?',
      options: [
        'Chọn các cá thể tốt nhất rồi thu hạt riêng từng cây để gieo thành từng dòng kiểm tra đời sau',
        'Thu hoạch trộn lẫn tất cả hạt của các cây được chọn lại thành một khối hạt giống chung',
        'Nhổ bỏ toàn bộ các cây có năng suất cao và chỉ giữ lại các cây thấp bé bị nhiễm sâu bệnh',
        'Sử dụng tia phóng xạ chiếu trực tiếp vào ruộng lúa đang chín để thu hoạch ngay hôm sau',
      ],
      correctIndex: 0,
      explanation: 'Chọn lọc cá thể (Bài 13 trang 66) thu hạt riêng từng cá thể ưu tú và gieo riêng rẽ thành từng dòng để đánh giá kiểu gen thông qua sự di truyền của thế hệ con.',
    },
    {
      number: 23,
      level: 'biet',
      question: 'Trong kĩ thuật ghép cây ăn quả (Bài 14), bộ phận cành hoặc mắt lấy từ cây mẹ có phẩm chất tốt đem gắn vào gốc ghép gọi là',
      options: [
        'Cành ghép hoặc mắt ghép (mang các đặc tính di truyền ưu tú cần nhân nhanh)',
        'Gốc ghép (bộ phận cây con gieo từ hạt có bộ rễ khỏe thích nghi tốt với đất)',
        'Bầu đất bó chiết (hỗn hợp đất bùn trộn rơm mục bó quanh vị trí khoanh vỏ)',
        'Mô sẹo bất định (khối tế bào chưa phân hóa nuôi cấy trong bình thủy tinh)',
      ],
      correctIndex: 0,
      explanation: 'Cây ghép gồm 2 phần: Gốc ghép (cung cấp bộ rễ khỏe, chống chịu tốt) và Cành ghép/mắt ghép (lấy từ cây mẹ ưu tú quyết định phẩm chất quả thu hoạch).',
    },
    {
      number: 24,
      level: 'hieu',
      question: 'Vì sao khi chọn gốc ghép cho các giống cam, bưởi đặc sản, người ta thường chọn cây bưởi chua hoặc cam ba lá gieo từ hạt?',
      options: [
        'Vì cây gieo từ hạt có bộ rễ cọc ăn sâu khỏe mạnh và chống chịu sâu bệnh, úng hạn rất tốt',
        'Vì gốc ghép bưởi chua sẽ biến toàn bộ quả của cành ghép thành quả chanh rất nhỏ và chua',
        'Vì cây gieo từ hạt hoàn toàn không có rễ nên không cần tưới nước suốt quá trình trồng',
        'Vì gốc ghép sẽ làm cho cây ăn quả ngừng sinh trưởng và chết ngay sau vụ thu hoạch đầu tiên',
      ],
      correctIndex: 0,
      explanation: 'Gốc ghép gieo từ hạt phát triển rễ cọc khỏe, thích nghi tốt với đất đai và kháng bệnh thối rễ, trong khi cành ghép vẫn giữ nguyên hương vị đặc sản của cây mẹ.',
    },
    {
      number: 25,
      level: 'hieu',
      question: 'Tại sao trong quy trình nhân giống bằng nuôi cấy mô tế bào (Bài 14), cây con sau khi tạo rễ trong ống nghiệm phải qua giai đoạn vườn ươm?',
      options: [
        'Để cây con thích nghi dần với ánh sáng, độ ẩm tự nhiên trước khi đem trồng ra đồng ruộng',
        'Để làm cho toàn bộ lá và rễ của cây con in vitro bị héo rụng hết trước khi đem đi trồng',
        'Vì trong ống nghiệm cây con chưa có tế bào thực vật mà chỉ là các hạt khoáng chất vô cơ',
        'Để lây nhiễm các loại virus và nấm bệnh ngoài tự nhiên vào cây giống trước khi xuất vườn',
      ],
      correctIndex: 0,
      explanation: 'Trong bình nuôi cấy in vitro độ ẩm gần 100% và dinh dưỡng có sẵn; nếu đưa thẳng ra nắng gió ngoài đồng cây sẽ sốc nhiệt và mất nước chết nên phải huấn luyện ở vườn ươm.',
    },
    {
      number: 26,
      level: 'hieu',
      question: 'So với phương pháp chọn lọc hỗn hợp, phương pháp chọn lọc cá thể có ưu điểm vượt trội nào trong công tác giống?',
      options: [
        'Kiểm tra được kiểu gen của từng cá thể qua các dòng đời con nên tạo ra giống có độ thuần cao',
        'Đơn giản, tốn ít công sức hơn và không cần theo dõi riêng rẽ từng dòng ở các vụ kế tiếp',
        'Chỉ cần thực hiện trong vòng một ngày là tạo ra ngay giống cây biến đổi gen kháng sâu',
        'Không cần gieo trồng ngoài đồng ruộng mà chỉ cần phân loại kích thước hạt ở trong kho',
      ],
      correctIndex: 0,
      explanation: 'Chọn lọc cá thể theo dõi riêng từng dòng con cháu của mỗi cây mẹ nên phân biệt được biến dị di truyền (kiểu gen) với biến dị thường biến do môi trường.',
    },
  ],
  'cn10-c5': [
    {
      number: 21,
      level: 'biet',
      question: 'Loài côn trùng nào sau đây là đối tượng môi giới truyền virus gây bệnh vàng lùn, lùn xoắn lá hại lúa (Bài 17)?',
      options: [
        'Rầy nâu hại lúa (Nilaparvata lugens) chích hút nhựa và truyền virus',
        'Sâu tơ hại rau họ thập tự ăn khuyết biểu bì lá cải bắp và su hào',
        'Ruồi đục quả đẻ trứng vào bên trong vỏ các loại quả ổi, xoài, cam',
        'Sâu đục thân bướm hai chấm đục vào nõn cây lúa gây dảnh héo bông bạc',
      ],
      correctIndex: 0,
      explanation: 'Theo Bài 17 SGK Công nghệ 10 (trang 86), rầy nâu vừa chích hút nhựa làm lúa cháy rầy vừa là môi giới truyền bệnh virus vàng lùn, lùn xoắn lá.',
    },
    {
      number: 22,
      level: 'biet',
      question: 'Bệnh đạo ôn hại lúa (Bài 18 SGK Công nghệ 10) do tác nhân vi sinh vật nào gây ra và có vết bệnh điển hình hình gì?',
      options: [
        'Do nấm Pyricularia oryzae gây ra với vết bệnh trên lá hình thoi, tâm xám trắng',
        'Do vi khuẩn Ralstonia solanacearum gây héo xanh rũ đột ngột nhưng lá vẫn xanh',
        'Do tuyến trùng kí sinh ở bộ rễ làm rễ lúa phình to thành các u sưng tròn',
        'Do virus gây ra làm lá lúa xoắn tít lại như mũi hành và cây lùn hẳn xuống',
      ],
      correctIndex: 0,
      explanation: 'Bệnh đạo ôn lúa do nấm Pyricularia oryzae gây ra; vết bệnh điển hình trên lá có hình mắt én (hình thoi), viền nâu, tâm màu xám trắng (Bài 18 trang 91).',
    },
    {
      number: 23,
      level: 'biet',
      question: 'Chế phẩm nấm xanh (Metarhizium) và nấm trắng (Beauveria) trong bảo vệ thực vật được dùng để phòng trừ nhóm dịch hại nào?',
      options: [
        'Phòng trừ các loài sâu hại và rầy nâu, bọ cánh cứng hại cây trồng',
        'Phòng trừ các loài cỏ dại lá rộng và cỏ lồng vực mọc trên ruộng lúa',
        'Cung cấp trực tiếp nguyên tố đạm và kali dễ tiêu cho bộ rễ cây trồng',
        'Kích thích quả cây ăn quả chín đồng loạt chỉ sau một đêm phun thuốc',
      ],
      correctIndex: 0,
      explanation: 'Theo Bài 20 SGK Công nghệ 10 (trang 101), chế phẩm nấm xanh và nấm trắng là thuốc trừ sâu vi sinh kí sinh gây bệnh làm chết rầy nâu, châu chấu, bọ dừa, sâu hại.',
    },
    {
      number: 24,
      level: 'hieu',
      question: 'Vì sao khi ruộng lúa đang bị bệnh đạo ôn hoặc bệnh bạc lá phát triển mạnh, tuyệt đối không được bón thúc thêm phân đạm?',
      options: [
        'Vì thừa đạm làm lá lúa xanh non mềm yếu, giàu amino acid tự do khiến nấm và vi khuẩn lây lan bùng phát',
        'Vì phân đạm sẽ kết tủa với bào tử nấm tạo thành lớp màng bảo vệ giúp cây lúa khỏi bệnh ngay lập tức',
        'Vì phân đạm sẽ làm cho toàn bộ nước trong ruộng lúa bị đóng băng khiến rễ lúa không hút được nước',
        'Vì khi bị bệnh cây lúa đã biến đổi thành cây họ Đậu tự cố định được đạm từ không khí',
      ],
      correctIndex: 0,
      explanation: 'Bón thừa đạm làm vách tế bào mô lá mỏng, hàm lượng đạm hòa tan cao là nguồn thức ăn lí tưởng cho nấm đạo ôn và vi khuẩn bạc lá phát triển dữ dội.',
    },
    {
      number: 25,
      level: 'hieu',
      question: 'Tại sao biện pháp bảo vệ các loài thiên địch (nhện bắt mồi, bọ rùa, ong kí sinh) lại giúp ổn định hệ sinh thái đồng ruộng?',
      options: [
        'Vì thiên địch khống chế tự nhiên quần thể sâu hại dưới ngưỡng gây hại mà không gây ô nhiễm môi trường',
        'Vì các loài thiên địch sẽ ăn trụi toàn bộ lá và thân của cây trồng thay cho các loài sâu hại',
        'Vì thiên địch tiết ra chất hóa học làm cho cỏ dại trên đồng ruộng phát triển nhanh gấp mười lần',
        'Vì khi có thiên địch thì cây trồng không cần ánh sáng mặt trời và nước tưới vẫn sống tốt',
      ],
      correctIndex: 0,
      explanation: 'Thiên địch là kẻ thù tự nhiên của sâu hại; bảo tồn thiên địch giúp duy trì cân bằng sinh học tự nhiên, giảm số lần phải phun thuốc hóa học và tránh bùng phát dịch hại thứ cấp.',
    },
    {
      number: 26,
      level: 'hieu',
      question: 'Nguyên tắc "Đúng thời điểm" trong nguyên tắc "4 đúng" khi sử dụng thuốc bảo vệ thực vật được hiểu đúng nhất là',
      options: [
        'Phun khi dịch hại đến ngưỡng phòng trừ, ở tuổi sâu non mẫn cảm nhất và đảm bảo thời gian cách li',
        'Phun định kì cứ mỗi tuần hai lần bất kể trên đồng ruộng có xuất hiện sâu bệnh hại hay không',
        'Phun vào đúng lúc trời đang mưa to gió lớn hoặc giữa trưa nắng gắt để thuốc bốc hơi nhanh',
        'Phun ngay vào buổi sáng trước khi thu hoạch rau ăn lá đem ra chợ bán vào buổi chiều cùng ngày',
      ],
      correctIndex: 0,
      explanation: 'Đúng thời điểm là phun khi sâu non mới nở (tuổi 1–2) dễ diệt nhất, bệnh mới chớm xuất hiện tới ngưỡng, vào lúc trời mát lặng gió và tuân thủ nghiêm ngặt thời gian cách li.',
    },
  ],
  'cn10-c6': [
    {
      number: 21,
      level: 'biet',
      question: 'Khâu kĩ thuật làm đất trước khi gieo trồng gồm các công việc cơ bản theo trình tự nào sau đây (Bài 21)?',
      options: [
        'Cày đất, bừa và đập đất, lên luống (đối với cây trồng cạn) và bón phân lót',
        'Thu hoạch nông sản, phơi sấy khô, đóng bao bì và đưa vào kho lạnh bảo quản',
        'Tỉa cành tạo tán, phun thuốc kích thích ra hoa và bao quả chống ruồi đục quả',
        'Xây dựng nhà máy chế biến, đóng hộp chân không và vận chuyển đi xuất khẩu',
      ],
      correctIndex: 0,
      explanation: 'Theo Bài 21 SGK Công nghệ 10 (trang 106), quy trình làm đất gồm: Cày đất -> Bừa và đập đất -> Lên luống -> Bón phân lót.',
    },
    {
      number: 22,
      level: 'biet',
      question: 'Trong chăm sóc cây trồng (Bài 21), việc tỉa dặm được thực hiện ngay sau khi hạt mọc mầm hoặc sau khi cấy nhằm mục đích',
      options: [
        'Đảm bảo mật độ và khoảng cách cây đồng đều trên toàn bộ diện tích ruộng',
        'Làm giảm một nửa số lượng cây khỏe mạnh để nhường đất cho cỏ dại mọc lên',
        'Thu hoạch toàn bộ thân lá cây con để đem đi chế biến đồ hộp xuất khẩu ngay',
        'Thay thế hoàn toàn việc tưới nước và bón phân thúc trong suốt cả vụ mùa',
      ],
      correctIndex: 0,
      explanation: 'Tỉa bỏ chỗ cây mọc quá dày/cây yếu và dặm bổ sung vào chỗ cây bị chết/khuyết giúp đảm bảo đúng mật độ, khoảng cách quy định.',
    },
    {
      number: 23,
      level: 'biet',
      question: 'Phương pháp bảo quản nông sản trong kho có kiểm soát thành phần khí quyển (tăng CO2, giảm O2) được gọi là',
      options: [
        'Phương pháp bảo quản trong điều kiện khí quyển điều chỉnh (CA/MA)',
        'Phương pháp phơi khô thủ công trực tiếp dưới ánh nắng mặt trời gay gắt',
        'Phương pháp ngâm nông sản tươi sống vào trong dung dịch nước muối mặn',
        'Phương pháp ủ chua yếm khí cùng với mật rỉ đường làm thức ăn gia súc',
      ],
      correctIndex: 0,
      explanation: 'Theo Bài 22 SGK Công nghệ 10 (trang 113), bảo quản trong điều kiện khí quyển biến đổi/điều chỉnh (Controlled Atmosphere - CA) giúp ức chế hô hấp nông sản tươi rất hiệu quả.',
    },
    {
      number: 24,
      level: 'hieu',
      question: 'Vì sao khi trồng các loại cây lấy củ như khoai lang, khoai tây, lạc lại bắt buộc phải lên luống cao và vun gốc kĩ?',
      options: [
        'Giúp tầng đất mặt dày, tơi xốp, thoát nước tốt để tia củ/quả phát triển thuận lợi và dễ thu hoạch',
        'Để giữ cho bộ rễ cây luôn bị ngập chìm hoàn toàn trong nước bùn suốt cả chu kì sinh trưởng',
        'Để ngăn không cho bộ lá cây khoai lang tiếp xúc với ánh sáng mặt trời và khí carbon dioxide',
        'Để làm cho củ khoai tây mọc lộ hoàn toàn lên trên mặt đất và chuyển sang màu xanh lục chứa độc tố',
      ],
      correctIndex: 0,
      explanation: 'Lên luống và vun gốc tạo tầng đất tơi xốp, thoáng khí, thoát nước nhanh khi mưa lớn và che kín tia củ khoai tây (tránh ánh sáng làm củ hóa xanh sinh độc tố solanin).',
    },
    {
      number: 25,
      level: 'hieu',
      question: 'Tại sao trước khi đưa hạt thóc, hạt ngô vào kho bảo quản kín lâu dài, người ta phải phơi hoặc sấy giảm độ ẩm hạt xuống dưới 13%?',
      options: [
        'Để hạ thấp cường độ hô hấp của hạt đến mức tối thiểu, ngăn hạt nảy mầm và ức chế nấm mốc hại',
        'Để kích thích hạt thóc và hạt ngô nảy mầm đồng loạt ngay ở bên trong bao tải chứa trong kho',
        'Để làm tăng tối đa hoạt động của các loài mọt gạo và nấm mốc tiết độc tố aflatoxin trong hạt',
        'Để hạt lương thực tự động chuyển hóa tinh bột thành protein động vật trong thời gian bảo quản',
      ],
      correctIndex: 0,
      explanation: 'Khi độ ẩm hạt < 13%, cường độ hô hấp của hạt cực thấp (trạng thái ngủ nghỉ), không sinh nhiệt ẩm và nấm mốc/côn trùng không thể phát triển gây thối mốc.',
    },
    {
      number: 26,
      level: 'hieu',
      question: 'Trong quy trình trồng cây cảnh trong chậu (Bài 23), việc lót một lớp sỏi nhẹ hoặc viên đất nung ở đáy chậu trước khi cho giá thể vào giúp',
      options: [
        'Tạo độ thông thoáng ở đáy chậu và giúp nước tưới dư thừa thoát nhanh qua lỗ thoát nước, tránh bị tắc',
        'Bịt thật kín lỗ thoát nước ở đáy chậu để giữ toàn bộ nước tưới ngập đầy chậu như ruộng lúa nước',
        'Cung cấp toàn bộ lượng đạm và kali cho cây cảnh mà không cần bón thêm bất kì loại phân nào khác',
        'Ngăn không cho bộ rễ của cây cảnh phát triển xuống nửa dưới của chậu trồng trong suốt nhiều năm',
      ],
      correctIndex: 0,
      explanation: 'Lớp viên đất nung/sỏi nhẹ dưới đáy chậu ngăn giá thể mịn làm bít lỗ thoát nước, giúp nước thừa thoát dễ dàng và chống úng thối rễ.',
    },
  ],
  'cn10-c7': [
    {
      number: 21,
      level: 'biet',
      question: 'Theo Bài 24 SGK Công nghệ 10, kiểu nhà trồng cây có mái che và vách bao quanh bằng lưới chuyên dụng ngăn côn trùng gọi là',
      options: [
        'Nhà lưới (gồm nhà lưới kín hoàn toàn và nhà lưới hở mái/vách)',
        'Nhà kính hiện đại điều khiển tự động hoàn toàn bằng máy tính',
        'Kho lạnh bảo quản nông sản điều chỉnh khí quyển CA công suất lớn',
        'Bể nuôi cấy vi tảo công nghiệp khép kín đặt ở dưới tầng hầm',
      ],
      correctIndex: 0,
      explanation: 'Nhà lưới được bao che bằng lưới chắn côn trùng hoặc lưới che nắng, chi phí đầu tư thấp hơn nhà kính nhưng vẫn ngăn ngừa sâu hại hiệu quả (Bài 24 trang 120).',
    },
    {
      number: 22,
      level: 'biet',
      question: 'Hệ thống tưới nước tiết kiệm nào đưa nước dưới dạng các hạt sương cực nhỏ làm tăng độ ẩm không khí và làm mát nhanh nhà màng?',
      options: [
        'Hệ thống tưới phun sương tự động (thường dùng cho hoa lan, nấm, vườn ươm)',
        'Hệ thống tưới ngập tràn mặt ruộng truyền thống dùng cho canh tác lúa nước',
        'Hệ thống tưới rãnh thấm dẫn nước chảy tràn qua các rãnh đất giữa hai luống',
        'Hệ thống tưới thủ công bằng thùng ô doa xách tay tưới trực tiếp vào gốc cây',
      ],
      correctIndex: 0,
      explanation: 'Theo Bài 24 SGK Công nghệ 10 (trang 122), tưới phun sương tạo các hạt nước li ti giúp tăng ẩm độ không khí, giảm nhiệt độ môi trường, rất hợp với hoa lan, nấm và giâm cành.',
    },
    {
      number: 23,
      level: 'biet',
      question: 'Trong công nghệ trồng cây không dùng đất (Bài 25), kĩ thuật màng dinh dưỡng mỏng chảy tuần hoàn qua rễ có kí hiệu viết tắt là',
      options: [
        'Hệ thống thủy canh hồi lưu kĩ thuật màng dinh dưỡng NFT (Nutrient Film Technique)',
        'Hệ thống bảo quản nông sản trong khí quyển điều chỉnh CA (Controlled Atmosphere)',
        'Hệ thống quản lí dịch hại tổng hợp trên đồng ruộng IPM (Integrated Pest Management)',
        'Hệ thống định vị vệ tinh toàn cầu dẫn đường máy nông nghiệp GPS (Global Positioning System)',
      ],
      correctIndex: 0,
      explanation: 'NFT (Nutrient Film Technique) là kĩ thuật thủy canh hồi lưu dùng dòng dung dịch dinh dưỡng mỏng chảy tuần hoàn qua máng trồng giúp rễ vừa hút khoáng vừa thoáng khí.',
    },
    {
      number: 24,
      level: 'hieu',
      question: 'Vì sao khi trồng cây bằng hệ thống thủy canh, người ta phải thường xuyên kiểm tra chỉ số pH và chỉ số EC của dung dịch dinh dưỡng?',
      options: [
        'Vì pH và nồng độ muối khoáng hòa tan (EC) quyết định trực tiếp khả năng hấp thu dinh dưỡng của rễ cây',
        'Vì chỉ số EC dùng để đo tốc độ gió và cường độ bức xạ mặt trời chiếu vào bên trong nhà kính',
        'Vì nếu không đo EC mỗi ngày thì dung dịch nước trong bể sẽ tự động biến thành xăng dầu dễ cháy',
        'Vì cây trồng trong hệ thống thủy canh chỉ hút được các chất dinh dưỡng khi độ pH đạt mức 14,0',
      ],
      correctIndex: 0,
      explanation: 'Chỉ số EC phản ánh tổng nồng độ ion khoáng hòa tan và pH (thường tối ưu ở 5,5–6,5) quyết định trạng thái hòa tan của các vi lượng; lệch pH/EC cây sẽ bị ngộ độc hoặc thiếu hụt khoáng.',
    },
    {
      number: 25,
      level: 'hieu',
      question: 'So với trồng cây trên đất ngoài đồng ruộng, công nghệ thủy canh và khí canh trong nhà màng giúp giảm thiểu thuốc BVTV vì',
      options: [
        'Cách li hoàn toàn với mầm bệnh trong đất và có lưới ngăn côn trùng xâm nhập từ bên ngoài',
        'Dung dịch dinh dưỡng thủy canh có pha sẵn liều lượng cao thuốc trừ sâu hóa học cực độc',
        'Cây trồng trong hệ thống thủy canh có lớp vỏ thân bằng kim loại nên sâu không cắn thủng được',
        'Các loài sâu bệnh khi bay vào nhà màng sẽ tự động biến thành các loài ong mật thụ phấn',
      ],
      correctIndex: 0,
      explanation: 'Không sử dụng đất tự nhiên giúp loại bỏ hoàn toàn tuyến trùng, nấm khuẩn truyền qua đất, kết hợp nhà màng chắn côn trùng nên hầu như không phải phun thuốc BVTV.',
    },
    {
      number: 26,
      level: 'hieu',
      question: 'Tại sao hệ thống tưới nhỏ giọt lại đặc biệt phù hợp và mang lại hiệu quả kinh tế cao cho các vùng khô hạn, khan hiếm nước ngọt?',
      options: [
        'Cấp nước trực tiếp từ từ vào đúng vùng rễ cây nên giảm tối đa lượng nước bốc hơi và thấm sâu lãng phí',
        'Làm cho toàn bộ mặt đất giữa các hàng cây luôn ngập nước sâu ba mươi xăng-ti-mét suốt mùa khô',
        'Biến nước biển mặn chát thành nước ngọt tinh khiết ngay tại đầu vòi nhỏ giọt mà không cần lọc',
        'Giúp cây trồng ngừng hoàn toàn quá trình thoát hơi nước qua khí khổng ở lá vào ban ngày nắng nóng',
      ],
      correctIndex: 0,
      explanation: 'Tưới nhỏ giọt đưa từng giọt nước thẳng tới vùng rễ tích cực, không làm ướt lối đi hay tán lá, tiết kiệm 30–60% lượng nước so với tưới tràn/tưới phun.',
    },
  ],
  'cn10-c8': [
    {
      number: 21,
      level: 'biet',
      question: 'Theo Bài 26 SGK Công nghệ 10, dấu hiệu nào cho thấy môi trường đất canh tác đang bị suy thoái và ô nhiễm do lạm dụng hóa chất?',
      options: [
        'Đất bị chua hóa, chai cứng, nghèo mùn, tồn dư kim loại nặng và suy giảm mạnh giun đất, vi sinh vật có ích',
        'Đất ngày càng tơi xốp, giàu chất mùn đen, độ pH trung tính ổn định và có rất nhiều giun đất sinh sống',
        'Cây trồng sinh trưởng khỏe mạnh tự nhiên, không xuất hiện sâu bệnh và cho năng suất tăng bền vững',
        'Nguồn nước ngầm và nước mặt quanh vùng canh tác trong sạch, giàu oxygen hòa tan và tôm cá phát triển',
      ],
      correctIndex: 0,
      explanation: 'Bón quá nhiều phân hóa học và phun thuốc BVTV lâu ngày làm đất chua, kết tảng chai cứng, tích lũy độc chất và tiêu diệt hệ vi sinh vật đất, giun đất.',
    },
    {
      number: 22,
      level: 'biet',
      question: 'Khi sử dụng rơm rạ làm giá thể trồng nấm rơm (Bài 27), thời gian từ lúc cấy giống nấm vào mô rơm đến lúc bắt đầu thu hoạch khoảng',
      options: [
        'Khoảng từ 12 đến 15 ngày sau khi cấy giống là bắt đầu thu hái được nấm rơm',
        'Khoảng từ 2 đến 3 năm sau khi cấy giống mới bắt đầu xuất hiện quả thể nấm',
        'Chỉ sau đúng 30 phút kể từ lúc ngâm rơm vào nước vôi là thu hoạch được nấm',
        'Khoảng từ 6 đến 8 tháng ủ rơm trong kho lạnh đóng băng ở nhiệt độ -10 °C',
      ],
      correctIndex: 0,
      explanation: 'Theo quy trình trồng nấm rơm trên giá thể rơm rạ (Bài 27 trang 139), nấm rơm sinh trưởng rất nhanh, chỉ sau khoảng 12–15 ngày cấy giống đã cho thu hoạch.',
    },
    {
      number: 23,
      level: 'biet',
      question: 'Trong quy trình ủ phân hữu cơ vi sinh từ phụ phẩm trồng trọt, độ ẩm của khối nguyên liệu khi phối trộn cần duy trì ở mức',
      options: [
        'Độ ẩm khoảng 55% – 65% (bóp chặt nắm nguyên liệu thấy nước rỉ qua kẽ tay nhưng không nhỏ giọt)',
        'Độ ẩm khoảng 0% – 5% (nguyên liệu phải phơi sấy thật khô giòn để dễ bốc cháy khi ủ đống)',
        'Độ ẩm khoảng 98% – 100% (nguyên liệu phải ngâm chìm hoàn toàn dưới đáy bể nước sâu hai mét)',
        'Không cần quan tâm đến độ ẩm vì vi sinh vật phân giải cellulose hoạt động tốt trong chân không',
      ],
      correctIndex: 0,
      explanation: 'Độ ẩm tối ưu cho đống ủ phân hữu cơ vi sinh là khoảng 55–65%: đủ ẩm cho VSV hoạt động nhưng vẫn còn khe hở chứa O2 cho VSV hiếu khí hô hấp.',
    },
    {
      number: 24,
      level: 'hieu',
      question: 'Vì sao việc xử lí rơm rạ ngay tại ruộng bằng chế phẩm vi sinh (như Trichoderma) lại tốt hơn nhiều so với việc đốt đồng sau gặt?',
      options: [
        'Giúp phân giải nhanh rơm rạ thành mùn hữu cơ trả lại dinh dưỡng cho đất, diệt nấm bệnh và không gây khói bụi',
        'Làm cho toàn bộ rơm rạ biến thành chất nhựa tổng hợp phủ kín mặt ruộng để ngăn cỏ dại mọc lên',
        'Giúp tăng lượng khí thải carbon monoxide (CO) và bụi mịn PM2.5 vào bầu khí quyển quanh khu dân cư',
        'Làm cho đất ruộng bị ngộ độc hữu cơ nặng hơn gấp năm lần so với việc vùi rơm tươi chưa xử lí',
      ],
      correctIndex: 0,
      explanation: 'Phun chế phẩm nấm Trichoderma lên rơm rạ giúp phân giải nhanh cellulose thành mùn hữu cơ, hạn chế ngộ độc hữu cơ cho vụ lúa sau, tiêu diệt nấm bệnh lưu tồn và bảo vệ không khí.',
    },
    {
      number: 25,
      level: 'hieu',
      question: 'Tại sao thức ăn ủ chua từ thân lá cây ngô sau khi mở túi lấy cho trâu bò ăn hàng ngày lại phải ép khí và buộc kín miệng túi ngay?',
      options: [
        'Để ngăn không khí (O2) lọt vào làm nấm mốc và vi khuẩn hiếu khí phát triển gây thối hỏng phần thức ăn còn lại',
        'Để giữ cho ánh sáng mặt trời bên trong túi không bị thoát ra ngoài làm giảm màu xanh của lá ngô',
        'Vì nếu để hở miệng túi thì toàn bộ muối khoáng trong thân ngô sẽ bay hơi hết ra ngoài không khí',
        'Để làm tăng nhiệt độ trong túi lên trên 100 °C giúp nấu chín phần thức ăn cho ngày hôm sau',
      ],
      correctIndex: 0,
      explanation: 'Thức ăn ủ chua bảo quản được nhờ pH thấp và môi trường yếm khí; nếu mở túi để hở lâu, O2 xâm nhập sẽ kích hoạt nấm mốc và vi khuẩn gây thối làm hỏng thức ăn.',
    },
    {
      number: 26,
      level: 'hieu',
      question: 'Giải pháp tổng thể nào sau đây giúp giảm thiểu bền vững ô nhiễm môi trường trong sản xuất trồng trọt hiện đại?',
      options: [
        'Áp dụng quản lí dịch hại tổng hợp (IPM), tăng phân hữu cơ – vi sinh và tái chế phụ phẩm theo kinh tế tuần hoàn',
        'Tăng gấp đôi liều lượng phân đạm hóa học và phun thuốc trừ sâu định kì hàng tuần trên mọi cánh đồng',
        'Cấm hoàn toàn hoạt động trồng lúa và trồng cây ăn quả trên phạm vi cả nước để bảo vệ đất trống',
        'Đổ toàn bộ bao bì thuốc bảo vệ thực vật và phụ phẩm nông nghiệp xuống kênh mương thoát nước',
      ],
      correctIndex: 0,
      explanation: 'Kết hợp IPM, bón phân cân đối ưu tiên phân hữu cơ/vi sinh và ứng dụng công nghệ vi sinh tái chế phụ phẩm trồng trọt là giải pháp căn cơ bảo vệ môi trường nông nghiệp.',
    },
  ],
};

// Danh mục bài học tương ứng cho từng chương Lớp 10
const CHAPTER_10_LESSON_MAP: Record<string, string> = {
  'cn10-c1': 'Bài 1 & Bài 2 – SGK Công nghệ Trồng trọt 10 (Kết nối tri thức)',
  'cn10-c2': 'Bài 3 đến Bài 6 – SGK Công nghệ Trồng trọt 10 (Kết nối tri thức)',
  'cn10-c3': 'Bài 7 đến Bài 11 – SGK Công nghệ Trồng trọt 10 (Kết nối tri thức)',
  'cn10-c4': 'Bài 12 đến Bài 15 – SGK Công nghệ Trồng trọt 10 (Kết nối tri thức)',
  'cn10-c5': 'Bài 16 đến Bài 20 – SGK Công nghệ Trồng trọt 10 (Kết nối tri thức)',
  'cn10-c6': 'Bài 21 đến Bài 23 – SGK Công nghệ Trồng trọt 10 (Kết nối tri thức)',
  'cn10-c7': 'Bài 24 & Bài 25 – SGK Công nghệ Trồng trọt 10 (Kết nối tri thức)',
  'cn10-c8': 'Bài 26 đến Bài 28 – SGK Công nghệ Trồng trọt 10 (Kết nối tri thức)',
};

function buildGrade10PracticeExams(): Grade10PracticeExam[] {
  const grade10Chapters = CHAPTER_REVIEW_DATA.filter((ch) => ch.grade === '10');

  // Mỗi chương có 18 câu Biết (15 câu gốc + 3 câu bổ sung) và 8 câu Thông hiểu (5 câu gốc + 3 câu bổ sung)
  const chapterPools = grade10Chapters.map((ch, chIdx) => {
    const extraRaw = EXTRA_QUESTIONS_10_RAW[ch.id] || [];
    const extraNormalized = extraRaw.map((q, qIdx) => {
      const targetIdx = (chIdx + qIdx) % 4;
      const opts = [...q.options] as [string, string, string, string];
      if (targetIdx !== q.correctIndex) {
        const temp = opts[targetIdx];
        opts[targetIdx] = opts[q.correctIndex];
        opts[q.correctIndex] = temp;
      }
      return normalizeChapterMCQItem(
        {
          ...q,
          options: opts,
          correctIndex: targetIdx,
        },
        'crop'
      );
    });
    const seenQ = new Set<string>();
    const allQuestions: ChapterMCQItem[] = [];
    for (const q of [...ch.mcqQuestions, ...extraNormalized]) {
      const key = q.question.trim().toLowerCase();
      if (!seenQ.has(key)) {
        seenQ.add(key);
        allQuestions.push(q);
      }
    }

    const bietList = allQuestions.filter((q) => q.level === 'biet');
    const hieuList = allQuestions.filter((q) => q.level === 'hieu');

    return {
      chapterId: ch.id,
      chapterNumber: ch.chapterNumber,
      chapterTitle: ch.chapterTitle,
      lessonRef: CHAPTER_10_LESSON_MAP[ch.id] || ch.pageRef,
      bietList, // 20 câu Nhận biết
      hieuList, // 10 câu Thông hiểu
    };
  });

  // Ma trận phân bổ 5 đề × 40 câu:
  // Trong mỗi đề:
  // - Đúng 8 chương, mỗi chương đúng 5 câu (8 × 5 = 40 câu)
  // - 4 chương có (4 câu Biết + 1 câu Thông hiểu = 5 câu)
  // - 4 chương có (3 câu Biết + 2 câu Thông hiểu = 5 câu)
  // => Tổng số câu Biết mỗi đề = 4×4 + 4×3 = 16 + 12 = 28 câu Biết!
  // => Tổng số câu Thông hiểu mỗi đề = 4×1 + 4×2 = 4 + 8 = 12 câu Thông hiểu!
  // Luân phiên nhóm 4 chương giữa các đề để đảm bảo phân bổ đồng đều và không trùng câu hỏi.
  const examConfigs = [
    {
      examNumber: 1,
      code: '1001',
      title: 'Đề Ôn Tập Số 01 – Công Nghệ Trồng Trọt 10 (Kết Nối Tri Thức)',
      subtitle: '40 câu trắc nghiệm (28 câu Biết · 12 câu Thông hiểu) · Rải đều 8 chương (5 câu/chương)',
      fourBietChapterIndices: [0, 1, 2, 3], // Chương I, II, III, IV có 4 Biết + 1 Hiểu; Chương V, VI, VII, VIII có 3 Biết + 2 Hiểu
    },
    {
      examNumber: 2,
      code: '1002',
      title: 'Đề Ôn Tập Số 02 – Công Nghệ Trồng Trọt 10 (Kết Nối Tri Thức)',
      subtitle: '40 câu trắc nghiệm (28 câu Biết · 12 câu Thông hiểu) · Rải đều 8 chương (5 câu/chương)',
      fourBietChapterIndices: [4, 5, 6, 7], // Chương V, VI, VII, VIII có 4 Biết + 1 Hiểu; Chương I, II, III, IV có 3 Biết + 2 Hiểu
    },
    {
      examNumber: 3,
      code: '1003',
      title: 'Đề Ôn Tập Số 03 – Công Nghệ Trồng Trọt 10 (Kết Nối Tri Thức)',
      subtitle: '40 câu trắc nghiệm (28 câu Biết · 12 câu Thông hiểu) · Rải đều 8 chương (5 câu/chương)',
      fourBietChapterIndices: [0, 2, 4, 6], // Chương I, III, V, VII có 4 Biết + 1 Hiểu; Chương II, IV, VI, VIII có 3 Biết + 2 Hiểu
    },
    {
      examNumber: 4,
      code: '1004',
      title: 'Đề Ôn Tập Số 04 – Công Nghệ Trồng Trọt 10 (Kết Nối Tri Thức)',
      subtitle: '40 câu trắc nghiệm (28 câu Biết · 12 câu Thông hiểu) · Rải đều 8 chương (5 câu/chương)',
      fourBietChapterIndices: [1, 3, 5, 7], // Chương II, IV, VI, VIII có 4 Biết + 1 Hiểu; Chương I, III, V, VII có 3 Biết + 2 Hiểu
    },
    {
      examNumber: 5,
      code: '1005',
      title: 'Đề Ôn Tập Số 05 – Công Nghệ Trồng Trọt 10 (Kết Nối Tri Thức)',
      subtitle: '40 câu trắc nghiệm (28 câu Biết · 12 câu Thông hiểu) · Rải đều 8 chương (5 câu/chương)',
      fourBietChapterIndices: [0, 3, 4, 7], // Chương I, IV, V, VIII có 4 Biết + 1 Hiểu; Chương II, III, VI, VII có 3 Biết + 2 Hiểu
    },
  ];

  // Con trỏ lấy câu hỏi không trùng lặp cho từng chương
  const bietCursor = new Array(8).fill(0);
  const hieuCursor = new Array(8).fill(0);

  return examConfigs.map((cfg) => {
    const perChapterSelected: {
      chapterId: string;
      chapterNumber: string;
      chapterTitle: string;
      bietItems: Grade10ExamQuestion[];
      hieuItems: Grade10ExamQuestion[];
    }[] = [];

    chapterPools.forEach((pool, cIdx) => {
      const needBiet = cfg.fourBietChapterIndices.includes(cIdx) ? 4 : 3;
      const needHieu = cfg.fourBietChapterIndices.includes(cIdx) ? 1 : 2;

      const pickedBiet: Grade10ExamQuestion[] = [];
      for (let i = 0; i < needBiet; i++) {
        const q = pool.bietList[(bietCursor[cIdx] + i) % pool.bietList.length];
        pickedBiet.push({
          ...q,
          chapterId: pool.chapterId,
          chapterNumber: pool.chapterNumber,
          chapterTitle: pool.chapterTitle,
          lessonRef: pool.lessonRef,
        });
      }
      bietCursor[cIdx] += needBiet;

      const pickedHieu: Grade10ExamQuestion[] = [];
      for (let i = 0; i < needHieu; i++) {
        const q = pool.hieuList[(hieuCursor[cIdx] + i) % pool.hieuList.length];
        pickedHieu.push({
          ...q,
          chapterId: pool.chapterId,
          chapterNumber: pool.chapterNumber,
          chapterTitle: pool.chapterTitle,
          lessonRef: pool.lessonRef,
        });
      }
      hieuCursor[cIdx] += needHieu;

      perChapterSelected.push({
        chapterId: pool.chapterId,
        chapterNumber: pool.chapterNumber,
        chapterTitle: pool.chapterTitle,
        bietItems: pickedBiet,
        hieuItems: pickedHieu,
      });
    });

    // Rải đều câu hỏi qua 8 chương theo 5 vòng (mỗi vòng 8 câu từ Chương I -> Chương VIII = 40 câu)
    // để nội dung đề thi rải rác đều khắp 8 chương từ câu 1 đến câu 40.
    const interleavedQuestions: Grade10ExamQuestion[] = [];
    for (let round = 0; round < 5; round++) {
      for (let cIdx = 0; cIdx < 8; cIdx++) {
        const chBucket = perChapterSelected[cIdx];
        const combinedForChapter = [...chBucket.bietItems, ...chBucket.hieuItems];
        const item = combinedForChapter[round];
        if (item) {
          interleavedQuestions.push({
            ...item,
            number: interleavedQuestions.length + 1,
          });
        }
      }
    }

    const bietCount = interleavedQuestions.filter((q) => q.level === ('biet' as CognitiveLevel)).length;
    const hieuCount = interleavedQuestions.filter((q) => q.level === ('hieu' as CognitiveLevel)).length;

    const optionKeys = ['A', 'B', 'C', 'D'] as const;
    const partI: MultipleChoiceQuestion[] = interleavedQuestions.map((q) => ({
      id: `g10-${cfg.code}-q-${q.number}`,
      number: q.number,
      grade: '10',
      domain: 'crop',
      level: q.level === 'biet' ? 'NB' : 'TH',
      question: q.question,
      options: {
        A: q.options[0],
        B: q.options[1],
        C: q.options[2],
        D: q.options[3],
      },
      correctAnswer: optionKeys[q.correctIndex] || 'A',
      explanation: q.explanation,
      textbookRef: `${q.chapterNumber}: ${q.chapterTitle} – ${q.lessonRef}`,
    }));

    return {
      id: `g10-exam-${cfg.examNumber}`,
      examNumber: cfg.examNumber,
      code: cfg.code,
      title: cfg.title,
      subtitle: cfg.subtitle,
      description: cfg.subtitle,
      durationMinutes: 45,
      totalQuestions: interleavedQuestions.length,
      bietCount,
      hieuCount,
      chapterDistribution: perChapterSelected.map((ch) => ({
        chapterId: ch.chapterId,
        chapterNumber: ch.chapterNumber,
        chapterTitle: ch.chapterTitle,
        bietCount: ch.bietItems.length,
        hieuCount: ch.hieuItems.length,
        totalCount: ch.bietItems.length + ch.hieuItems.length,
      })),
      questions: interleavedQuestions,
      partI,
      partII: [],
    };
  });
}

export const GRADE_10_PRACTICE_EXAMS: Grade10PracticeExam[] = buildGrade10PracticeExams();

export const GRADE_10_CHAPTER_EXAMS: Exam[] = CHAPTER_REVIEW_DATA.filter((ch) => ch.grade === '10').map(
  (ch, idx) => {
    const optionKeys = ['A', 'B', 'C', 'D'] as const;
    const code = `10C${idx + 1}`;
    const partI: MultipleChoiceQuestion[] = ch.mcqQuestions.map((q) => ({
      id: `${ch.id}-q-${q.number}`,
      number: q.number,
      grade: '10',
      domain: 'crop',
      level: q.level === 'biet' ? 'NB' : q.level === 'hieu' ? 'TH' : 'VD',
      question: q.question,
      options: {
        A: q.options[0],
        B: q.options[1],
        C: q.options[2],
        D: q.options[3],
      },
      correctAnswer: optionKeys[q.correctIndex] || 'A',
      explanation: q.explanation,
      textbookRef: `${ch.chapterNumber}: ${ch.chapterTitle} – SGK Công nghệ 10`,
    }));

    const partII: TrueFalseQuestion[] = (ch.tfQuestions || []).map((tf) => ({
      id: `${ch.id}-tf-${tf.number}`,
      number: tf.number,
      domain: 'crop',
      scenarioTitle: tf.chartData
        ? `Câu ${tf.number}. Phân tích biểu đồ thực nghiệm (${ch.chapterNumber})`
        : tf.tableData
        ? `Câu ${tf.number}. Phân tích bảng số liệu thống kê (${ch.chapterNumber})`
        : `Câu ${tf.number}. Tình huống thực tế (${ch.chapterNumber})`,
      scenario: tf.context,
      citation: tf.citation,
      chartData: tf.chartData,
      tableData: tf.tableData,
      statements: tf.statements.map((st) => ({
        subId: st.label,
        text: st.text,
        level: st.level === 'biet' ? 'NB' : st.level === 'hieu' ? 'TH' : 'VD',
        isCorrect: st.isTrue,
        explanation: st.explanation,
      })) as [
        TrueFalseStatement,
        TrueFalseStatement,
        TrueFalseStatement,
        TrueFalseStatement
      ],
      textbookRef: `${ch.chapterNumber}: ${ch.chapterTitle} – SGK Công nghệ 10`,
    }));

    return {
      id: `exam-${ch.id}`,
      code,
      title: `Đề Ôn Tập ${ch.chapterNumber}: ${ch.chapterTitle} (Công Nghệ 10)`,
      description: `35 câu trắc nghiệm (20 Nhận biết · 10 Thông hiểu · 5 Vận dụng) + 4 câu Đúng/Sai tình huống thực tế – ${ch.pageRef}`,
      durationMinutes: 45,
      partI,
      partII,
    };
  }
);

export interface Grade10ChapterMatrixExam extends Exam {
  chapterId: string;
  chapterNumber: string;
  chapterTitle: string;
  examIndexInChapter: number; // 1..5
  bietCount: number;
  hieuCount: number;
  vandungCount: number;
}

function buildGrade10ChapterMatrixExams(): Record<string, Grade10ChapterMatrixExam[]> {
  const result: Record<string, Grade10ChapterMatrixExam[]> = {};
  const optionKeys = ['A', 'B', 'C', 'D'] as const;
  const grade10Chapters = CHAPTER_REVIEW_DATA.filter((ch) => ch.grade === '10');

  grade10Chapters.forEach((ch, chIdx) => {
    const extraRaw = EXTRA_QUESTIONS_10_RAW[ch.id] || [];
    const extraNormalized = extraRaw.map((q, qIdx) => {
      const targetIdx = (chIdx + qIdx) % 4;
      const opts = [...q.options] as [string, string, string, string];
      if (targetIdx !== q.correctIndex) {
        const temp = opts[targetIdx];
        opts[targetIdx] = opts[q.correctIndex];
        opts[q.correctIndex] = temp;
      }
      return normalizeChapterMCQItem(
        {
          ...q,
          options: opts,
          correctIndex: targetIdx,
        },
        'crop'
      );
    });

    const seenQ = new Set<string>();
    const chapterPool: ChapterMCQItem[] = [];
    for (const q of [...ch.mcqQuestions, ...extraNormalized]) {
      const key = q.question.trim().toLowerCase();
      if (!seenQ.has(key)) {
        seenQ.add(key);
        chapterPool.push(q);
      }
    }

    const bietPool = chapterPool.filter((q) => q.level === 'biet');
    const hieuPool = chapterPool.filter((q) => q.level === 'hieu');
    const vandungPool = chapterPool.filter((q) => q.level === 'vandung');
    const tfPool = ch.tfQuestions || [];
    const lessonRef = CHAPTER_10_LESSON_MAP[ch.id] || ch.pageRef;

    const examsForChapter: Grade10ChapterMatrixExam[] = [];

    for (let examIdx = 0; examIdx < 5; examIdx++) {
      const examNum = examIdx + 1;
      const examCode = `10${chIdx + 1}${examNum}`; // VD: 1011..1015 cho Chương I, ..., 1081..1085 cho Chương VIII

      // Chọn 24 câu trắc nghiệm nhiều lựa chọn chỉ sử dụng nội dung chương này:
      // 12 câu Nhận biết + 8 câu Thông hiểu + 4 câu Vận dụng = 24 câu
      const selectedMcqs: ChapterMCQItem[] = [];
      for (let i = 0; i < 12; i++) {
        selectedMcqs.push(bietPool[(examIdx * 4 + i) % bietPool.length]);
      }
      for (let i = 0; i < 8; i++) {
        selectedMcqs.push(hieuPool[(examIdx * 3 + i) % hieuPool.length]);
      }
      for (let i = 0; i < 4; i++) {
        selectedMcqs.push(vandungPool[(examIdx + i) % vandungPool.length]);
      }

      const partI: MultipleChoiceQuestion[] = selectedMcqs.map((q, qIdx) => {
        const qNumber = qIdx + 1;
        const targetCorrectIdx = (qIdx + examIdx + chIdx) % 4;
        const opts = [...q.options] as [string, string, string, string];
        if (targetCorrectIdx !== q.correctIndex) {
          const tmp = opts[targetCorrectIdx];
          opts[targetCorrectIdx] = opts[q.correctIndex];
          opts[q.correctIndex] = tmp;
        }
        return {
          id: `g10-ch-${ch.id}-e${examNum}-q${qNumber}`,
          number: qNumber,
          grade: '10',
          domain: 'crop',
          level: q.level === 'biet' ? 'NB' : q.level === 'hieu' ? 'TH' : 'VD',
          question: q.question,
          options: {
            A: opts[0],
            B: opts[1],
            C: opts[2],
            D: opts[3],
          },
          correctAnswer: optionKeys[targetCorrectIdx],
          explanation: q.explanation,
          textbookRef: `${ch.chapterNumber}: ${ch.chapterTitle} – ${lessonRef}`,
        };
      });

      // Chọn 4 câu Đúng/Sai (1 câu phân tích biểu đồ + 1 câu phân tích bảng số liệu + 2 câu tình huống thực tế)
      const partII: TrueFalseQuestion[] = [0, 1, 2, 3].map((tfOffset, tfIdx) => {
        const tf = tfPool[(tfOffset + examIdx) % tfPool.length];
        const qNum = tfIdx + 1;
        return {
          id: `g10-ch-${ch.id}-e${examNum}-tf${qNum}`,
          number: qNum,
          domain: 'crop',
          scenarioTitle: tf.chartData
            ? `Câu ${qNum}. Phân tích biểu đồ thực nghiệm (${ch.chapterNumber} – Đề 0${examNum})`
            : tf.tableData
            ? `Câu ${qNum}. Phân tích bảng số liệu thống kê (${ch.chapterNumber} – Đề 0${examNum})`
            : `Câu ${qNum}. Tình huống thực tế (${ch.chapterNumber} – Đề 0${examNum})`,
          scenario: tf.context,
          citation: tf.citation,
          chartData: tf.chartData,
          tableData: tf.tableData,
          statements: tf.statements.map((st) => ({
            subId: st.label,
            text: st.text,
            level: st.level === 'biet' ? 'NB' : st.level === 'hieu' ? 'TH' : 'VD',
            isCorrect: st.isTrue,
            explanation: st.explanation,
          })) as [
            TrueFalseStatement,
            TrueFalseStatement,
            TrueFalseStatement,
            TrueFalseStatement
          ],
          textbookRef: `${ch.chapterNumber}: ${ch.chapterTitle} – ${lessonRef}`,
        };
      });

      examsForChapter.push({
        id: `g10-ch-exam-${ch.id}-${examNum}`,
        code: examCode,
        title: `Đề Số 0${examNum} – ${ch.chapterNumber}: ${ch.chapterTitle} (Công Nghệ 10)`,
        description: `Đề kiểm tra theo ma trận (Mã đề ${examCode}) chỉ sử dụng kiến thức ${ch.chapterNumber}: ${ch.chapterTitle} – Gồm 24 câu trắc nghiệm (12 Nhận biết · 8 Thông hiểu · 4 Vận dụng) + 4 câu Đúng/Sai tình huống thực tế.`,
        durationMinutes: 50,
        chapterId: ch.id,
        chapterNumber: ch.chapterNumber,
        chapterTitle: ch.chapterTitle,
        examIndexInChapter: examNum,
        bietCount: 12,
        hieuCount: 8,
        vandungCount: 4,
        partI,
        partII,
      });
    }

    result[ch.id] = examsForChapter;
  });

  return result;
}

export const GRADE_10_EXAMS_BY_CHAPTER: Record<string, Grade10ChapterMatrixExam[]> =
  buildGrade10ChapterMatrixExams();

export const ALL_GRADE_10_CHAPTER_MATRIX_EXAMS: Grade10ChapterMatrixExam[] =
  Object.values(GRADE_10_EXAMS_BY_CHAPTER).flat();


