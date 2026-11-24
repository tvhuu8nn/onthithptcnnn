import {
  CHAPTER_REVIEW_DATA,
  ChapterMCQItem,
  CognitiveLevel,
} from './chapterReviewData';
import { normalizeChapterMCQItem } from '../utils/equalLengthNormalizer';
import { Exam, MultipleChoiceQuestion, TrueFalseQuestion, TrueFalseStatement } from '../types/exam';

export interface Grade11ExamQuestion extends ChapterMCQItem {
  chapterId: string;
  chapterNumber: string;
  chapterTitle: string;
  lessonRef: string;
}

export interface Grade11PracticeExam extends Exam {
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
  questions: Grade11ExamQuestion[];
}

// Bổ sung thêm mỗi chương 9 câu Đã biết + 5 câu Thông hiểu chuẩn SGK Công nghệ Chăn nuôi 11 (Kết nối tri thức)
// để kết hợp với 120 câu sẵn có (15 Biết + 5 Thông hiểu / chương) tạo thành ngân hàng 204 câu chuẩn SGK cho 5 đề khảo nghiệm 40 câu.
const EXTRA_QUESTIONS_11_RAW: Record<string, ChapterMCQItem[]> = {
  'cn11-c1': [
    {
      number: 21,
      level: 'biet',
      question: 'Theo Bài 1 SGK Công nghệ 11, sản phẩm nào sau đây của ngành chăn nuôi là nguồn nguyên liệu cho công nghiệp chế biến da giày và dệt may?',
      options: [
        'Da trâu, da bò, lông cừu, lông vũ của vịt và ngỗng',
        'Rơm rạ khô, thân cây ngô, vỏ trấu và bã mía ép khô',
        'Mủ cao su tự nhiên, nhựa thông và sợi bông vải thô',
        'Gỗ keo lai, gỗ bạch đàn, tre nứa và song mây rừng',
      ],
      correctIndex: 0,
      explanation: 'Ngành chăn nuôi cung cấp nguyên liệu quan trọng cho công nghiệp nhẹ và thủ công mỹ nghệ như da (trâu, bò, cá sấu), lông (cừu, vịt, ngỗng), sừng, móng (Bài 1 trang 6).',
    },
    {
      number: 22,
      level: 'biet',
      question: 'Theo Bài 1 SGK Công nghệ 11, thành tựu nổi bật về ứng dụng công nghệ cao trong quản lí trang trại chăn nuôi hiện nay là',
      options: [
        'Sử dụng chip điện tử gắn tai, cảm biến IoT và hệ thống tự động hóa tiểu khí hậu chuồng nuôi',
        'Chỉ chăn thả vật nuôi tự do trong rừng tự nhiên mà không cần xây dựng chuồng trại hay tiêm phòng',
        'Thay thế hoàn toàn thức ăn và nước uống của vật nuôi bằng các loại phân bón hóa học tổng hợp',
        'Loại bỏ hoàn toàn công tác kiểm dịch thú y và vệ sinh khử trùng chuồng trại trong suốt vụ nuôi',
      ],
      correctIndex: 0,
      explanation: 'Thành tựu chăn nuôi hiện đại ở Việt Nam và thế giới là ứng dụng cảm biến IoT, thẻ chip RFID gắn tai theo dõi cá thể và tự động hóa cho ăn, uống, làm mát chuồng nuôi.',
    },
    {
      number: 23,
      level: 'biet',
      question: 'Theo Bài 1 SGK Công nghệ 11, người chuyên nghiên cứu về chọn lọc, lai tạo và nhân giống các giống vật nuôi mới có năng suất cao được gọi là',
      options: [
        'Nhà nghiên cứu giống vật nuôi hoặc kĩ sư di truyền – giống vật nuôi',
        'Kĩ sư khai thác lâm sản và chế biến gỗ công nghiệp rừng trồng',
        'Kĩ thuật viên điều khiển tàu đánh bắt hải sản xa bờ bằng lưới vây',
        'Kiến trúc sư thiết kế quy hoạch cảnh quan công viên cây xanh đô thị',
      ],
      correctIndex: 0,
      explanation: 'Kĩ sư/nhà nghiên cứu giống vật nuôi thực hiện công tác bảo tồn, chọn lọc, nhân giống và lai tạo các giống vật nuôi có năng suất, chất lượng cao (Bài 1 trang 9).',
    },
    {
      number: 24,
      level: 'biet',
      question: 'Theo Bài 2 SGK Công nghệ 11, nhóm gia cầm nào sau đây thuộc nhóm gia cầm nuôi lấy trứng chuyên dụng phổ biến ở Việt Nam?',
      options: [
        'Gà Leghorn, gà Ai Cập, gà Isa Brown và vịt Khaki Campbell',
        'Gà Đông Tảo, gà Hồ, gà Mía và vịt Bầu Bến chuyên lấy thịt',
        'Bò BBB (Blanc Bleu Belge), bò Charolais và bò Brahman',
        'Lợn Landrace, lợn Yorkshire, lợn Duroc và lợn Pietrain',
      ],
      correctIndex: 0,
      explanation: 'Gà Leghorn, gà Isa Brown, gà Ai Cập và vịt Khaki Campbell là các giống gia cầm hướng trứng điển hình có sản lượng trứng/năm rất cao.',
    },
    {
      number: 25,
      level: 'biet',
      question: 'Theo nguồn gốc hình thành (Bài 2 SGK Công nghệ 11), nhóm giống vật nuôi nào sau đây đều thuộc nhóm giống vật nuôi nội (bản địa Việt Nam)?',
      options: [
        'Lợn Móng Cái, lợn Ỉ, gà Đông Tảo, gà Hồ, vịt Cỏ và bò Vàng Việt Nam',
        'Lợn Landrace, lợn Yorkshire, bò Holstein Friesian và gà Ross 308',
        'Bò BBB, bò Red Angus, lợn Duroc, lợn Pietrain và vịt Super Meat',
        'Gà Leghorn, gà Plymouth, dê Boer, cừu Dorper và ngựa thuần chủng Anh',
      ],
      correctIndex: 0,
      explanation: 'Lợn Móng Cái, lợn Ỉ, gà Đông Tảo, gà Hồ, vịt Cỏ, bò Vàng là các giống bản địa lâu đời của Việt Nam, thích nghi tốt với khí hậu địa phương.',
    },
    {
      number: 26,
      level: 'biet',
      question: 'Theo đặc điểm sinh vật học về cấu tạo dạ dày (Bài 2 SGK Công nghệ 11), loài vật nuôi nào sau đây thuộc nhóm gia súc dạ dày đơn (ăn tạp hoặc ăn cỏ)?',
      options: [
        'Con lợn (heo), con ngựa và con thỏ nuôi lấy thịt',
        'Con trâu, con bò sữa, con dê và con cừu nhai lại',
        'Con gà ri, con vịt cỏ, con ngan Pháp và con ngỗng',
        'Con cá chép, con tôm thẻ chân trắng và con ngao',
      ],
      correctIndex: 0,
      explanation: 'Lợn, ngựa, thỏ thuộc nhóm gia súc có dạ dày đơn (1 túi), khác với trâu, bò, dê, cừu có dạ dày 4 túi (dạ cỏ, dạ tổ ong, dạ lá sách, dạ múi khế).',
    },
    {
      number: 27,
      level: 'biet',
      question: 'Phương thức chăn nuôi bán công nghiệp (bán thâm canh) có đặc điểm cơ bản nào sau đây theo Bài 2 SGK Công nghệ 11?',
      options: [
        'Kết hợp giữa nuôi nhốt trong chuồng có kiểm soát với sân chơi hoặc bãi chăn thả tự nhiên hợp lí',
        'Nuôi thả rông hoàn toàn trong rừng sâu không có chuồng trại, không bổ sung thức ăn tinh hàng ngày',
        'Nuôi nhốt 100% trong chuồng kín nhiều tầng hoàn toàn không bao giờ tiếp xúc ánh nắng mặt trời',
        'Chỉ nuôi một con vật duy nhất trong lồng sắt đặt ở ban công căn hộ chung cư cao tầng đô thị',
      ],
      correctIndex: 0,
      explanation: 'Chăn nuôi bán công nghiệp kết hợp chuồng nuôi với bãi chăn thả và thức ăn công nghiệp bổ sung, vừa nâng cao năng suất vừa giữ phẩm chất thịt thơm ngon.',
    },
    {
      number: 28,
      level: 'biet',
      question: 'Theo Bài 2 SGK Công nghệ 11, giống bò BBB (Blanc Bleu Belge) có nguồn gốc từ Bỉ nổi tiếng thế giới với hướng sản xuất chính là',
      options: [
        'Chuyên thịt siêu nạc với cơ bắp phát triển vượt trội và tỉ lệ thịt xẻ rất cao',
        'Chuyên vắt sữa với sản lượng sữa tươi trung bình đạt trên mười lăm tấn mỗi chu kì',
        'Chuyên lấy lông mịn để dệt các loại vải len cao cấp phục vụ xuất khẩu sang châu Âu',
        'Chuyên dùng làm sức kéo cày bừa trên các cánh đồng lúa nước lầy thụt ở miền núi',
      ],
      correctIndex: 0,
      explanation: 'Bò BBB (Blanc Bleu Belge) là giống bò chuyên thịt nổi tiếng của Bỉ với ngoại hình cơ bắp cuồn cuộn ("cơ đôi"), tỉ lệ thịt tinh rất cao.',
    },
    {
      number: 29,
      level: 'biet',
      question: 'Một trong những yêu cầu cốt lõi của mô hình chăn nuôi bền vững hiện nay tại Việt Nam (Bài 2 SGK Công nghệ 11) là',
      options: [
        'Phát triển kinh tế hiệu quả gắn liền với bảo vệ môi trường sinh thái, an toàn sinh học và phúc lợi động vật',
        'Tối đa hóa lợi nhuận ngắn hạn bằng cách xả trực tiếp toàn bộ chất thải chăn nuôi chưa xử lí ra sông suối',
        'Sử dụng không giới hạn các chất kích thích tăng trưởng cấm và kháng sinh liều cao ngay trước ngày xuất bán',
        'Xây dựng các trại chăn nuôi quy mô lớn nằm xen lẫn ngay bên trong các khu dân cư đông đúc ở trung tâm',
      ],
      correctIndex: 0,
      explanation: 'Chăn nuôi bền vững đòi hỏi hài hòa 3 trụ cột: hiệu quả kinh tế cao, trách nhiệm xã hội (an toàn thực phẩm, phúc lợi động vật) và bảo vệ môi trường.',
    },
    {
      number: 30,
      level: 'hieu',
      question: 'Vì sao việc chuyển dịch từ chăn nuôi nhỏ lẻ nông hộ sang chăn nuôi trang trại tập trung quy mô công nghiệp lại là xu thế tất yếu ở Việt Nam?',
      options: [
        'Giúp áp dụng đồng bộ cơ giới hóa, kiểm soát dịch bệnh an toàn sinh học và hạ giá thành sản phẩm chăn nuôi',
        'Vì chăn nuôi trang trại tập trung không cần sử dụng thức ăn chăn nuôi và không cần tiêm vắc-xin phòng bệnh',
        'Để làm tăng gấp đôi chi phí nhân công lao động thủ công cho mỗi ki-lô-gam thịt hơi xuất chuồng',
        'Vì chăn nuôi nông hộ nhỏ lẻ luôn đòi hỏi phải trang bị hệ thống robot tự động hóa đắt tiền hơn trang trại',
      ],
      correctIndex: 0,
      explanation: 'Chăn nuôi trang trại tập trung giúp kiểm soát chặt chẽ an toàn sinh học, tự động hóa khâu chăm sóc, xử lí chất thải tập trung và nâng cao năng suất lao động.',
    },
    {
      number: 31,
      level: 'hieu',
      question: 'Tại sao các giống vật nuôi bản địa Việt Nam (như lợn Móng Cái, gà Ri) tuy năng suất thấp hơn giống ngoại nhưng vẫn cần được bảo tồn nguồn gene?',
      options: [
        'Vì chúng có khả năng thích nghi cao, kháng bệnh tốt, chất lượng thịt thơm ngon và là nguyên liệu quý để lai tạo',
        'Vì các giống bản địa hoàn toàn không cần ăn uống gì mà vẫn tự lớn nhanh gấp ba lần các giống nhập nội',
        'Vì giống bản địa có khối lượng cơ thể trưởng thành lớn gấp mười lần các giống ngoại chuyên thịt cao sản',
        'Vì các giống vật nuôi ngoại nhập khẩu về Việt Nam đều không thể đẻ trứng hoặc sinh con được',
      ],
      correctIndex: 0,
      explanation: 'Giống nội mang các gene quý về khả năng chống chịu kham khổ, kháng bệnh nhiệt đới, mắn đẻ và chất lượng thịt đặc sản, rất quan trọng để chọn lọc và lai kinh tế.',
    },
    {
      number: 32,
      level: 'hieu',
      question: 'Trong chăn nuôi thông minh (Bài 2), việc lắp đặt cảm biến nhiệt độ – độ ẩm kết nối quạt hút và tấm làm mát tự động mang lại lợi ích gì?',
      options: [
        'Duy trì tiểu khí hậu chuồng nuôi luôn ở ngưỡng tối ưu, giúp vật nuôi giảm stress nhiệt và tăng hiệu quả chuyển hóa thức ăn',
        'Giúp biến đổi khí carbonic trong chuồng thành thức ăn tinh giàu đạm cho vật nuôi mà không cần cho ăn cám',
        'Làm cho nhiệt độ trong chuồng nuôi luôn giữ ở mức trên 45 °C suốt mùa hè để tiêu diệt mọi loài côn trùng',
        'Thay thế hoàn toàn vai trò của bác sĩ thú y trong việc phẫu thuật ngoại khoa các ca đẻ khó ở gia súc lớn',
      ],
      correctIndex: 0,
      explanation: 'Hệ thống kiểm soát tiểu khí hậu tự động giúp giữ nhiệt độ, độ ẩm và độ thông thoáng ổn định, ngăn ngừa stress nhiệt làm giảm ăn và suy giảm miễn dịch ở vật nuôi.',
    },
    {
      number: 33,
      level: 'hieu',
      question: 'Tại sao việc đảm bảo phúc lợi động vật (chuồng thông thoáng, mật độ hợp lí, vận chuyển nhân đạo) lại giúp nâng cao chất lượng thịt thương phẩm?',
      options: [
        'Vì vật nuôi không bị hoảng loạn hay stress cấp tính trước khi giết mổ sẽ hạn chế hiện tượng thịt nhạt màu, mềm nhão, rỉ dịch (PSE)',
        'Vì khi được nghe nhạc và ở chuồng rộng thì toàn bộ xương của vật nuôi sẽ biến thành thịt nạc nguyên chất',
        'Vì phúc lợi động vật giúp vật nuôi tự tổng hợp được kháng sinh trong máu để tiêu diệt mọi vi khuẩn gây thối',
        'Vì mật độ nuôi thưa làm cho hàm lượng nước tự do trong cơ bắp tăng lên chiếm 99% khối lượng thân thịt',
      ],
      correctIndex: 0,
      explanation: 'Khi vật nuôi bị đánh đập, nhồi nhét, hoảng sợ trước giết mổ, glycogen phân giải yếm khí nhanh tạo acid lactic lúc thân thịt còn nóng gây hội chứng thịt PSE (nhạt, mềm, rỉ dịch).',
    },
    {
      number: 34,
      level: 'hieu',
      question: 'Khi phân loại vật nuôi theo mục đích sử dụng (Bài 2), vì sao người chăn nuôi cần xác định rõ hướng chuyên dụng (thịt, trứng, sữa hay kiêm dụng)?',
      options: [
        'Để xây dựng quy trình dinh dưỡng, thiết kế chuồng trại và chế độ chăm sóc phù hợp nhất với tiềm năng di truyền của giống',
        'Để bắt buộc mọi giống bò chuyên thịt phải vắt được lượng sữa nhiều hơn giống bò sữa chuyên dụng',
        'Vì các giống vật nuôi chuyên dụng đều có chung một khẩu phần ăn và thời gian khai thác giống hệt nhau',
        'Để có thể nuôi nhốt chung tất cả các loài gia súc và gia cầm vào cùng một ô chuồng chật hẹp',
      ],
      correctIndex: 0,
      explanation: 'Mỗi hướng sản xuất (thịt, trứng, sữa) có đặc điểm trao đổi chất và yêu cầu dinh dưỡng, chuồng nuôi khác nhau; phân loại đúng giúp khai thác tối đa năng suất giống.',
    },
  ],
  'cn11-c2': [
    {
      number: 21,
      level: 'biet',
      question: 'Theo Bài 3 SGK Công nghệ 11, điều kiện để một quần thể vật nuôi được công nhận là một giống vật nuôi độc lập về quy mô số lượng là',
      options: [
        'Phải đạt số lượng cá thể nhất định đủ lớn để duy trì sự ổn định di truyền và tránh giao phối cận huyết',
        'Chỉ cần có duy nhất một cá thể đực hoặc một cá thể cái mới được phát hiện ngẫu nhiên trong tự nhiên',
        'Bắt buộc phải có trên một trăm triệu cá thể đang được nuôi ở tất cả các tỉnh thành trong cả nước',
        'Không cần quan tâm đến số lượng cá thể mà chỉ cần có màu lông khác biệt với các con vật xung quanh',
      ],
      correctIndex: 0,
      explanation: 'Một giống vật nuôi phải có số lượng cá thể đủ lớn và tính di truyền ổn định qua các thế hệ để có thể nhân giống lâu dài mà không bị suy thoái cận huyết (Bài 3 trang 17).',
    },
    {
      number: 22,
      level: 'biet',
      question: 'Theo Bài 4 SGK Công nghệ 11, các chỉ tiêu như sản lượng sữa một chu kì, sản lượng trứng/năm, tỉ lệ thịt xẻ và tiêu tốn thức ăn/kg tăng khối lượng thuộc nhóm tiêu chí chọn giống nào?',
      options: [
        'Nhóm chỉ tiêu về năng suất và hiệu quả sản xuất (sức sản xuất) của vật nuôi',
        'Nhóm chỉ tiêu về màu sắc lông, da, hình dáng sừng và tai của vật nuôi',
        'Nhóm chỉ tiêu về tập tính ngủ nghỉ và phản xạ tự vệ của vật nuôi hoang dã',
        'Nhóm chỉ tiêu về kích thước chuồng trại và khoảng cách từ trại đến khu dân cư',
      ],
      correctIndex: 0,
      explanation: 'Sản lượng trứng, sữa, tỉ lệ nạc, tiêu tốn thức ăn (FCR) là các chỉ tiêu đánh giá sức sản xuất (năng suất và chất lượng sản phẩm) trong chọn giống vật nuôi.',
    },
    {
      number: 23,
      level: 'biet',
      question: 'Trong chọn lọc cá thể (Bài 4 SGK Công nghệ 11), bước kiểm tra phẩm chất giống của con đực thông qua năng suất của đời con do nó sinh ra gọi là',
      options: [
        'Kiểm tra đực giống qua đời sau (đánh giá giá trị di truyền thông qua chất lượng đời con)',
        'Chọn lọc hàng loạt dựa vào quan sát màu lông bên ngoài của cả đàn vật nuôi thương phẩm',
        'Lai kinh tế hai giống để tạo ra toàn bộ con lai dùng vào mục đích nuôi lấy thịt thương phẩm',
        'Phối giống tự nhiên ngẫu nhiên không có sự ghi chép sổ sách lí lịch của từng cá thể',
      ],
      correctIndex: 0,
      explanation: 'Theo Bài 4 SGK Công nghệ 11 (trang 23), sau khi kiểm tra bản thân, các cá thể đực giống tốt tiếp tục được kiểm tra qua chất lượng đời con để khẳng định khả năng di truyền vượt trội.',
    },
    {
      number: 24,
      level: 'biet',
      question: 'Theo Bài 5 SGK Công nghệ 11, phương pháp cho giao phối giữa các cá thể đực và cái thuộc cùng một giống để tạo ra đời con mang 100% máu giống đó gọi là',
      options: [
        'Phương pháp nhân giống thuần chủng vật nuôi',
        'Phương pháp lai kinh tế ba giống hoặc bốn giống',
        'Phương pháp lai cải tạo giống vật nuôi địa phương',
        'Phương pháp lai xa giữa hai loài động vật khác nhau',
      ],
      correctIndex: 0,
      explanation: 'Nhân giống thuần chủng là cho phối giống giữa con đực và con cái của cùng một giống nhằm bảo tồn và củng cố các đặc tính tốt của giống đó (Bài 5 trang 25).',
    },
    {
      number: 25,
      level: 'biet',
      question: 'Trong công thức lai kinh tế phổ biến ở Việt Nam: Lợn đực ngoại (Yorkshire/Landrace) × Lợn cái nội (Móng Cái), toàn bộ đàn con lai F1 sinh ra được sử dụng để',
      options: [
        'Nuôi lấy thịt thương phẩm để khai thác ưu thế lai (không dùng con lai F1 để làm giống tiếp)',
        'Giữ lại 100% làm lợn đực giống hạt nhân cấp cụ kị cho toàn bộ các trại giống quốc gia',
        'Thả vào các khu bảo tồn thiên nhiên hoang dã để thay thế hoàn toàn loài lợn rừng tự nhiên',
        'Dùng làm vật chủ thí nghiệm để sản xuất các loại thuốc bảo vệ thực vật dùng cho cây lúa',
      ],
      correctIndex: 0,
      explanation: 'Trong lai kinh tế, toàn bộ con lai được dùng làm thương phẩm (nuôi thịt) vì nếu dùng F1 làm giống tiếp thì đời F2 sẽ phân li tính trạng và giảm ưu thế lai.',
    },
    {
      number: 26,
      level: 'biet',
      question: 'Theo Bài 5 SGK Công nghệ 11, khi một giống vật nuôi địa phương có nhiều ưu điểm về thích nghi nhưng cần bổ sung một vài tính trạng tốt từ giống cao sản mà không làm thay đổi cơ bản giống gốc, người ta áp dụng',
      options: [
        'Phép lai cải tiến (chỉ lai một lần với giống cao sản rồi cho giao phối trở lại với giống gốc)',
        'Phép nhân giống thuần chủng khép kín hoàn toàn trong nội bộ một dòng duy nhất',
        'Phép cấy truyền phôi bò đồng loạt mà không thực hiện bước thụ tinh cho trứng',
        'Phép nuôi cấy mô tế bào soma thực vật trên môi trường thạch dinh dưỡng nhân tạo',
      ],
      correctIndex: 0,
      explanation: 'Lai cải tiến dùng để bổ sung 1–2 tính trạng tốt của giống đi cải tiến vào giống cần cải tiến trong khi vẫn giữ được các đặc điểm quý của giống gốc (Bài 5 trang 27).',
    },
    {
      number: 27,
      level: 'biet',
      question: 'Theo Bài 6 SGK Công nghệ 11, trong quy trình thụ tinh nhân tạo cho gia súc, sau khi lấy tinh dịch từ con đực giống, bước tiếp theo bắt buộc phải thực hiện trong phòng thí nghiệm là',
      options: [
        'Kiểm tra đánh giá chất lượng tinh dịch (màu sắc, mùi, hoạt lực, nồng độ) trước khi pha loãng và bảo quản',
        'Đem đun sôi tinh dịch ở nhiệt độ 100 °C trong 30 phút để tiêu diệt toàn bộ tế bào tinh trùng',
        'Trộn trực tiếp tinh dịch với vôi bột và thuốc sát trùng mạnh rồi đem phơi nắng ngoài sân gạch',
        'Bơm ngay toàn bộ tinh dịch chưa kiểm tra vào đường tiêu hóa của con cái đang mang thai',
      ],
      correctIndex: 0,
      explanation: 'Quy trình thụ tinh nhân tạo gồm: Lấy tinh → Kiểm tra đánh giá chất lượng tinh dịch → Pha loãng tinh dịch → Bảo quản tinh dịch → Phối tinh cho con cái (Bài 6 trang 30).',
    },
    {
      number: 28,
      level: 'biet',
      question: 'Trong công nghệ cấy truyền phôi bò (Bài 6 SGK Công nghệ 11), việc tiêm hormone kích thích để bò cái cho phôi rụng nhiều trứng cùng một lúc gọi là kĩ thuật',
      options: [
        'Gây rụng trứng nhiều (siêu bài noãn) ở bò cái cao sản cho phôi',
        'Xác định giới tính tinh trùng bằng thiết bị dòng chảy tế bào laser',
        'Nhân bản vô tính động vật từ tế bào tuyến vú của con vật trưởng thành',
        'Chẩn đoán bệnh truyền nhiễm bằng phản ứng khuếch đại gene PCR',
      ],
      correctIndex: 0,
      explanation: 'Bò cái cho phôi có phẩm chất di truyền cao được xử lí hormone gây siêu bài noãn (rụng nhiều trứng cùng lúc) để thu được nhiều phôi trong một chu kì (Bài 6 trang 32).',
    },
    {
      number: 29,
      level: 'biet',
      question: 'Công nghệ sinh học nào trong chọn và nhân giống vật nuôi (Bài 6 SGK Công nghệ 11) cho phép lựa chọn chính xác các cá thể mang gene quy định tính trạng mong muốn ngay từ khi vật nuôi còn nhỏ?',
      options: [
        'Chọn giống dựa vào chỉ thị phân tử (MAS – Marker Assisted Selection)',
        'Chọn lọc hàng loạt dựa vào cân khối lượng vật nuôi khi xuất chuồng',
        'Thụ tinh nhân tạo bằng tinh dịch bảo quản lỏng ở nhiệt độ phòng',
        'Ấp trứng gia cầm bằng máy ấp tự động đảo trứng theo chu kì',
      ],
      correctIndex: 0,
      explanation: 'Công nghệ chỉ thị phân tử (MAS) giúp phân tích ADN để nhận diện chính xác các gene quý (như gene kháng bệnh, gene năng suất sữa/thịt) ngay từ giai đoạn sơ sinh hoặc phôi.',
    },
    {
      number: 30,
      level: 'hieu',
      question: 'Vì sao trong sản xuất chăn nuôi thương phẩm, người ta không sử dụng con lai F1 của phép lai kinh tế để tiếp tục nhân giống tạo đời F2?',
      options: [
        'Vì ở thế hệ F2 các cặp gene dị hợp bị phân li làm giảm mạnh ưu thế lai và đàn con không đồng đều',
        'Vì toàn bộ con lai F1 trong phép lai kinh tế đều bị mất hoàn toàn cơ quan sinh sản ngay khi sinh ra',
        'Vì thế hệ F2 sẽ có tốc độ lớn nhanh gấp mười lần thế hệ F1 làm gãy sập sàn chuồng chăn nuôi',
        'Vì con lai F1 chỉ có thể sống được ở môi trường nước mặn chứ không sống được ở chuồng trại trên cạn',
      ],
      correctIndex: 0,
      explanation: 'Ưu thế lai biểu hiện cao nhất ở F1 do trạng thái dị hợp tử tối đa; nếu cho F1 giao phối với nhau, đời F2 sẽ phân li tính trạng, xuất hiện các tổ hợp đồng hợp lặn làm giảm năng suất.',
    },
    {
      number: 31,
      level: 'hieu',
      question: 'Tại sao phương pháp chọn lọc cá thể (Bài 4) lại mang lại hiệu quả di truyền chính xác và bền vững hơn nhiều so với chọn lọc hàng loạt?',
      options: [
        'Vì chọn lọc cá thể kết hợp đánh giá cả ngoại hình bản thân, phả hệ tổ tiên và kiểm tra chất lượng đời con nên xác định đúng kiểu gene',
        'Vì chọn lọc cá thể không cần ghi chép sổ sách theo dõi và thực hiện nhanh chỉ trong vòng năm phút ngoài chuồng nuôi',
        'Vì chọn lọc cá thể chỉ dựa duy nhất vào màu sắc lông của vật nuôi mà bỏ qua toàn bộ các chỉ tiêu về năng suất',
        'Vì chọn lọc hàng loạt chỉ áp dụng được cho cá sấu còn chọn lọc cá thể chỉ áp dụng được cho ong mật',
      ],
      correctIndex: 0,
      explanation: 'Chọn lọc hàng loạt chỉ dựa vào kiểu hình cá thể nên dễ bị ảnh hưởng bởi môi trường nuôi dưỡng; chọn lọc cá thể đánh giá cả gia hệ và đời sau nên chọn đúng giá trị kiểu gene.',
    },
    {
      number: 32,
      level: 'hieu',
      question: 'Trong quy trình cấy truyền phôi bò (Bài 6), vì sao bò cái cho phôi và bò cái nhận phôi bắt buộc phải được xử lí đồng pha động dục?',
      options: [
        'Để trạng thái sinh lí tử cung của bò nhận phôi tương thích hoàn toàn với tuổi phát triển của phôi, giúp phôi làm tổ và sống sót',
        'Để bò cái nhận phôi truyền toàn bộ các gene quy định màu lông và tầm vóc của nó sang cho phôi được cấy vào',
        'Để hai con bò cái có thể tự động trao đổi phôi cho nhau qua không khí mà không cần kĩ thuật viên thao tác',
        'Để rút ngắn thời gian mang thai của bò cái nhận phôi từ chín tháng mười ngày xuống còn đúng bảy ngày',
      ],
      correctIndex: 0,
      explanation: 'Nếu tử cung bò nhận không cùng pha sinh lí (nội tiết progesterone, niêm mạc tử cung) với bò cho phôi tại thời điểm thu phôi thì phôi cấy vào sẽ bị đào thải, không làm tổ được.',
    },
    {
      number: 33,
      level: 'hieu',
      question: 'Tại sao việc ứng dụng công nghệ xác định giới tính tinh trùng bò sữa (tinh phân giới tính cái) lại mang lại hiệu quả kinh tế đột phá cho các trang trại bò sữa?',
      options: [
        'Giúp tạo ra trên 90% bê cái hướng sữa để nhanh chóng mở rộng quy mô đàn bò vắt sữa và giảm tỉ lệ bê đực hiệu quả kinh tế thấp',
        'Giúp tạo ra 100% bê đực chuyên dùng để kéo cày trên các cánh đồng lúa nước thay cho máy cày cơ giới',
        'Làm cho bò mẹ có thể tiết sữa liên tục suốt mười năm mà không cần phải mang thai và đẻ bê con',
        'Giúp tinh trùng bò sữa tự động nhân đôi số lượng trong bình nitrogen lỏng ở nhiệt độ -196 °C',
      ],
      correctIndex: 0,
      explanation: 'Trong chăn nuôi bò sữa, chỉ con cái mới cho sữa; dùng tinh phân giới tính X giúp sinh ra ~90% bê cái, đẩy nhanh tốc độ nhân đàn bò sữa cao sản.',
    },
    {
      number: 34,
      level: 'hieu',
      question: 'Vì sao khi bảo quản tinh dịch động vật trong bình chứa nitrogen lỏng ở nhiệt độ -196 °C thì tinh trùng vẫn giữ được khả năng thụ tinh qua hàng chục năm?',
      options: [
        'Vì ở nhiệt độ siêu lạnh -196 °C همراه chất bảo quản chống đông, mọi hoạt động trao đổi chất của tế bào tinh trùng tạm ngừng hoàn toàn mà không bị vỡ màng',
        'Vì ở nhiệt độ -196 °C các tế bào tinh trùng vẫn bơi lội mạnh mẽ và tự phân chia nguyên phân tạo ra hàng triệu tinh trùng mới',
        'Vì nitrogen lỏng cung cấp một lượng lớn đường glucose và protein giúp nuôi sống tinh trùng trong suốt nhiều năm',
        'Vì nhiệt độ -196 °C làm đốt cháy toàn bộ phần đuôi của tinh trùng giúp đầu tinh trùng nhẹ hơn khi phối giống',
      ],
      correctIndex: 0,
      explanation: 'Môi trường pha loãng có chất bảo vệ đông lạnh (như glycerol, lòng đỏ trứng) kết hợp hạ nhiệt chuẩn và giữ ở -196 °C đưa tinh trùng vào trạng thái tiềm sinh (ngừng trao đổi chất).',
    },
  ],
  'cn11-c3': [
    {
      number: 21,
      level: 'biet',
      question: 'Theo Bài 7 SGK Công nghệ 11, đơn vị dùng để đo lường nhu cầu năng lượng trao đổi trong khẩu phần ăn của gia cầm và lợn phổ biến là',
      options: [
        'Kilocalorie (kcal) hoặc Megajoule (MJ) năng lượng trao đổi (ME) trong 1 kg thức ăn',
        'Milimét thủy ngân (mmHg) đo áp suất thẩm thấu của dịch tiêu hóa trong dạ dày',
        'Độ pH và chỉ số dẫn điện EC của dung dịch nước uống cung cấp tại núm uống tự động',
        'Số lượng vi khuẩn hiếu khí tổng số tính bằng đơn vị CFU trên một gam phân thải ra',
      ],
      correctIndex: 0,
      explanation: 'Nhu cầu năng lượng của vật nuôi thường được biểu thị bằng năng lượng trao đổi ME (Metabolizable Energy), tính bằng kcal hoặc MJ trên 1 kg thức ăn hoặc trên con/ngày (Bài 7 trang 37).',
    },
    {
      number: 22,
      level: 'biet',
      question: 'Theo Bài 7 SGK Công nghệ 11, nguyên tố khoáng đa lượng nào sau đây đóng vai trò cấu tạo nên trên 90% bộ xương, răng của gia súc và vỏ trứng gia cầm?',
      options: [
        'Khoáng Calcium (Ca) kết hợp chặt chẽ với Phosphorus (P)',
        'Khoáng vi lượng Iodine (I) và nguyên tố Selenium (Se)',
        'Khoáng vi lượng Cobalt (Co) và nguyên tố Manganese (Mn)',
        'Chất xơ thô không hòa tan (Cellulose và Lignin thực vật)',
      ],
      correctIndex: 0,
      explanation: 'Calcium (Ca) và Phosphorus (P) là hai chất khoáng đa lượng chủ yếu cấu tạo bộ xương gia súc và vỏ trứng gia cầm; thiếu Ca, P và vitamin D gây còi xương, mềm vỏ trứng.',
    },
    {
      number: 23,
      level: 'biet',
      question: 'Theo Bài 8 SGK Công nghệ 11, nhóm thức ăn nào sau đây thuộc nhóm thức ăn giàu protein có nguồn gốc thực vật dùng trong chăn nuôi?',
      options: [
        'Khô dầu đậu tương (đậu nành), khô dầu lạc, hạt đậu tương rang và khô dầu hạt cải',
        'Bột cá biển, bột thịt xương, bột huyết, bột lông vũ thủy phân và bột nhộng tằm',
        'Hạt ngô vàng, tấm gạo, cám gạo, sắn lát khô, hạt lúa mì và hạt cao lương',
        'Rơm lúa khô, cỏ voi tươi, cỏ Ghine, thân lá cây ngô già và bã mía tươi',
      ],
      correctIndex: 0,
      explanation: 'Khô dầu đậu tương (~44–48% protein thô), khô dầu lạc là các nguyên liệu giàu protein có nguồn gốc thực vật quan trọng nhất trong phối trộn thức ăn chăn nuôi (Bài 8 trang 41).',
    },
    {
      number: 24,
      level: 'biet',
      question: 'Theo Bài 8 SGK Công nghệ 11, thức ăn hỗn hợp hoàn chỉnh (dạng viên hoặc dạng bột mảnh) có đặc điểm nào sau đây?',
      options: [
        'Đã chứa đầy đủ và cân đối các chất dinh dưỡng, cho vật nuôi ăn trực tiếp và chỉ cần cung cấp thêm nước uống sạch',
        'Có hàm lượng đạm và khoáng cực kì đậm đặc nên bắt buộc phải pha thêm 90% ngô, cám gạo trước khi cho ăn',
        'Chỉ chứa duy nhất các loại vitamin tổng hợp và chất tạo màu mà không có bất kì nguồn năng lượng hay protein nào',
        'Chỉ sử dụng để bón lót xuống đáy ao nuôi cá chứ không được phép cho gia súc hoặc gia cầm trên cạn ăn',
      ],
      correctIndex: 0,
      explanation: 'Thức ăn hỗn hợp hoàn chỉnh được phối chế cân đối đủ năng lượng, protein, khoáng, vitamin theo đúng giai đoạn sinh trưởng; người nuôi cho ăn trực tiếp không cần pha trộn thêm (Bài 8 trang 42).',
    },
    {
      number: 25,
      level: 'biet',
      question: 'Theo Bài 9 SGK Công nghệ 11, phương pháp chế biến vật lí nào gồm các bước nghiền nhỏ, hấp chín bằng hơi nước nóng rồi ép qua khuôn tạo thành viên có kích thước phù hợp?',
      options: [
        'Phương pháp ép viên thức ăn chăn nuôi công nghiệp',
        'Phương pháp ủ chua thức ăn xanh thô cho gia súc nhai lại',
        'Phương pháp kiềm hóa rơm lúa khô bằng dung dịch nước vôi',
        'Phương pháp đường hóa tinh bột bằng enzyme amylase mầm mạ',
      ],
      correctIndex: 0,
      explanation: 'Ép viên là quy trình công nghiệp phối trộn nguyên liệu nghiền mịn, gia nhiệt – ẩm bằng hơi nước rồi ép qua khuôn thành viên giúp giảm bụi, tránh vật nuôi chọn lọc thức ăn (Bài 9 trang 46).',
    },
    {
      number: 26,
      level: 'biet',
      question: 'Theo Bài 9 SGK Công nghệ 11, để làm mềm sợi xơ và nâng cao tỉ lệ tiêu hóa của rơm lúa khô cho trâu bò ăn trong mùa đông, người ta thường áp dụng kĩ thuật',
      options: [
        'Ủ rơm khô với dung dịch urea (4%) hoặc nước vôi trong để kiềm hóa và làm giàu nitơ phi protein',
        'Đem rơm khô đốt thành tro bếp rồi trộn trực tiếp với dầu hỏa cho trâu bò uống hàng ngày',
        'Ngâm rơm khô vào trong bình chứa khí nitrogen lỏng ở nhiệt độ -196 °C trong vòng mười ngày',
        'Phơi rơm khô trên mái tôn nắng gắt liên tục ba tháng để tăng hàm lượng chất gỗ lignin trong rơm',
      ],
      correctIndex: 0,
      explanation: 'Ủ rơm với urea (khoảng 4% khối lượng rơm) hoặc nước vôi giúp phá vỡ liên kết ligno-cellulose làm rơm mềm, thơm và cung cấp thêm nguồn nitơ cho vi sinh vật dạ cỏ tổng hợp protein.',
    },
    {
      number: 27,
      level: 'biet',
      question: 'Theo Bài 9 SGK Công nghệ 11, thức ăn ủ chua cho trâu bò đạt chất lượng tốt khi mở hố ủ hoặc túi ủ sẽ có đặc điểm cảm quan là',
      options: [
        'Màu vàng xanh hoặc vàng rơm tự nhiên, mùi thơm chua dịu dễ chịu như dưa muối, không bị nhũn nát hay mốc đen',
        'Màu đen sẫm toàn bộ, bốc mùi thối khẳm nồng nặc và chảy nhiều nước nhớt nhầy màu đen ở đáy túi',
        'Khô cháy giòn tan thành bột mịn màu trắng xóa và tỏa nhiệt nóng rực trên 85 °C khi chạm tay vào',
        'Đóng thành tảng băng cứng như đá lạnh và không có bất kì mùi vị gì khi đưa lại gần mũi ngửi',
      ],
      correctIndex: 0,
      explanation: 'Thức ăn ủ chua đạt chuẩn có độ pH khoảng 3,8–4,2, màu vàng xanh tự nhiên, mùi chua thơm dịu của acid lactic, cấu trúc thân lá còn nguyên vẹn, không nhũn thối hay mốc.',
    },
    {
      number: 28,
      level: 'biet',
      question: 'Theo Bài 10 SGK Công nghệ 11, độc tố vi nấm cực kì nguy hiểm thường sinh ra trong hạt ngô, khô dầu lạc bị mốc (do nấm Aspergillus flavus) gây ngộ độc gan và ung thư ở vật nuôi là',
      options: [
        'Độc tố Aflatoxin',
        'Hormone Oxytocin',
        'Enzyme Cellulase',
        'Vitamin C (Acid ascorbic)',
      ],
      correctIndex: 0,
      explanation: 'Nấm mốc Aspergillus flavus và Aspergillus parasiticus phát triển trên ngô, lạc ẩm mốc tiết ra độc tố Aflatoxin rất bền nhiệt, gây hoại tử gan, giảm miễn dịch và tồn dư trong sữa, thịt.',
    },
    {
      number: 29,
      level: 'biet',
      question: 'Theo Bài 10 SGK Công nghệ 11, khi bảo quản các loại thức ăn hỗn hợp đóng bao trong kho, các bao thức ăn cần được xếp như thế nào để tránh hút ẩm từ nền nhà?',
      options: [
        'Xếp trên kệ gỗ (pallet) cao cách mặt sàn ít nhất 15–20 cm, cách tường kho và có lối đi thông thoáng',
        'Đổ trực tiếp toàn bộ cám rời xuống nền đất ẩm ướt và tưới nước lên mặt đống cám mỗi buổi sáng',
        'Xếp các bao thức ăn sát chặt vào bức tường ngoài trời thường xuyên bị nước mưa tạt ướt đẫm',
        'Đào hố sâu dưới lòng đất ẩm thấp rồi chôn vùi các bao thức ăn hỗn hợp xuống dưới lớp bùn ướt',
      ],
      correctIndex: 0,
      explanation: 'Trong kho bảo quản thức ăn đóng bao, phải kê bao trên kệ/pallet cách nền và cách tường để không khí lưu thông, ngăn hơi ẩm từ nền đất thấm lên làm mốc hỏng thức ăn (Bài 10 trang 51).',
    },
    {
      number: 30,
      level: 'hieu',
      question: 'Vì sao khi phối trộn khẩu phần ăn cho lợn và gia cầm (động vật dạ dày đơn), người ta đặc biệt chú ý bổ sung các amino acid thiết yếu như Lysine và Methionine?',
      options: [
        'Vì cơ thể lợn và gia cầm không tự tổng hợp được các amino acid thiết yếu này, nếu thiếu dù chỉ một chất sẽ làm hạn chế tổng hợp protein của cả cơ thể',
        'Vì Lysine và Methionine là hai loại chất xơ thô giúp mề gà nghiền nát sỏi đá thành nước uống tinh khiết',
        'Vì nếu bổ sung Lysine thì người chăn nuôi có thể cắt bỏ hoàn toàn nguồn thức ăn giàu năng lượng như ngô và tấm gạo',
        'Vì chỉ có trâu bò mới tự tổng hợp được chất béo còn lợn và gà dùng Lysine để biến thành vỏ trấu lót chuồng',
      ],
      correctIndex: 0,
      explanation: 'Theo quy luật "thùng gỗ Liebig" trong dinh dưỡng protein, các amino acid thiết yếu (như Lysine, Methionine, Tryptophan) vật nuôi dạ dày đơn không tự tổng hợp đủ, phải cung cấp từ thức ăn.',
    },
    {
      number: 31,
      level: 'hieu',
      question: 'Tại sao trâu, bò có thể sử dụng được một lượng nhất định urea (nitơ phi protein) trong thức ăn ủ rơm để tạo ra protein cho cơ thể, trong khi lợn và gà ăn urea sẽ bị ngộ độc?',
      options: [
        'Vì trong dạ cỏ của trâu bò có hệ vi sinh vật cộng sinh dùng nitơ từ urea để tổng hợp protein vi sinh vật rồi tiêu hóa ở dạ múi khế và ruột non',
        'Vì dạ dày của lợn và gà có kích thước lớn gấp mười lần dạ cỏ của trâu bò nên hấp thu urea quá chậm',
        'Vì trâu bò thở ra toàn bộ lượng urea qua mũi ngay khi nhai lại nên urea không đi vào trong dạ dày',
        'Vì urea khi vào dạ cỏ trâu bò sẽ tự động biến thành hạt ngô vàng giàu tinh bột và chất béo',
      ],
      correctIndex: 0,
      explanation: 'Hệ vi sinh vật khổng lồ trong dạ cỏ gia súc nhai lại có khả năng phân giải urea và gắn NH3 với khung carbon để tổng hợp protein vi sinh vật; lợn và gà không có dạ cỏ nên bị ngộ độc NH3.',
    },
    {
      number: 32,
      level: 'hieu',
      question: 'Trong quy trình ủ thức ăn tinh bột với nấm men (Bài 9), việc lên men sinh học mang lại lợi ích vượt trội nào cho hệ tiêu hóa của lợn con và gia cầm non?',
      options: [
        'Tăng hàm lượng protein vi sinh vật, vitamin nhóm B, tạo mùi thơm kích thích tính thèm ăn và ức chế vi khuẩn có hại trong đường ruột',
        'Làm tăng gấp năm lần hàm lượng chất xơ khó tiêu và chất chát tannin để làm chậm quá trình tiêu hóa thức ăn',
        'Biến toàn bộ tinh bột trong ngô và cám gạo thành các muối kim loại nặng giúp xương lợn con cứng như thép',
        'Tiêu diệt sạch toàn bộ các enzyme tiêu hóa tự nhiên có trong dịch vị dạ dày và dịch tụy của vật nuôi non',
      ],
      correctIndex: 0,
      explanation: 'Thức ăn lên men bằng chế phẩm nấm men/vi khuẩn lactic giàu sinh khối VSV, vitamin nhóm B, enzyme tiêu hóa và acid hữu cơ giúp lợn con ăn khỏe, tiêu hóa tốt và giảm tiêu chảy.',
    },
    {
      number: 33,
      level: 'hieu',
      question: 'Tại sao việc sử dụng công nghệ ép viên nhiệt ẩm trong sản xuất thức ăn chăn nuôi công nghiệp lại giúp giảm hệ số tiêu tốn thức ăn (FCR)?',
      options: [
        'Vì nhiệt ẩm làm hồ hóa tinh bột dễ tiêu hóa hơn, tiêu diệt vi khuẩn gây bệnh và ngăn vật nuôi lựa chọn bới vãi thức ăn',
        'Vì thức ăn dạng viên không chứa bất kì chất dinh dưỡng nào nên vật nuôi ăn ít đi mà chỉ uống nước cầm hơi',
        'Vì quá trình ép viên làm tăng độ ẩm của viên cám lên mức 85% giúp viên cám nặng hơn gấp ba lần cám bột',
        'Vì viên cám sau khi ép có vỏ cứng như sỏi đá nên nằm lại vĩnh viễn trong dạ dày giúp vật nuôi luôn cảm thấy no',
      ],
      correctIndex: 0,
      explanation: 'Hơi nước nóng trong máy ép viên làm chín (hồ hóa) tinh bột, diệt khuẩn Salmonella/E.coli, đồng thời định hình viên đồng nhất giúp vật nuôi không bới chọn, giảm rơi vãi và tăng tiêu hóa.',
    },
    {
      number: 34,
      level: 'hieu',
      question: 'Khi bảo quản hạt ngũ cốc làm thức ăn chăn nuôi trong silo hiện đại (Bài 10), vì sao hệ thống quạt thông gió làm mát và cảm biến nhiệt – ẩm lại giữ vai trò quyết định?',
      options: [
        'Giúp kịp thời phát hiện và triệt tiêu các điểm tích nhiệt – ẩm cục bộ trong khối hạt, ngăn chặn côn trùng và nấm mốc bùng phát',
        'Để bơm thật nhiều hơi nước nóng ẩm từ ngoài trời mưa vào trong silo giúp hạt ngô nảy mầm đồng loạt trước khi nghiền',
        'Vì hệ thống quạt trong silo dùng để thổi bay toàn bộ hạt ngô ra ngoài trời mỗi khi có ánh nắng mặt trời xuất hiện',
        'Để làm tăng hàm lượng độc tố Aflatoxin tự nhiên trong khối hạt ngô dự trữ lên mức tối đa trước khi xuất kho',
      ],
      correctIndex: 0,
      explanation: 'Khối hạt lớn trong silo rất dễ bị ngưng tụ ẩm và tự bốc nóng cục bộ do hô hấp; cảm biến nhiệt – ẩm kết hợp quạt thông gió giúp duy trì độ ẩm < 13–14% và nhiệt độ mát mẻ an toàn.',
    },
  ],
  'cn11-c4': [
    {
      number: 21,
      level: 'biet',
      question: 'Theo Bài 11 SGK Công nghệ 11, nhóm bệnh nào sau đây có khả năng lây lan nhanh từ cá thể mắc bệnh sang cá thể khỏe mạnh và bùng phát thành dịch lớn?',
      options: [
        'Nhóm bệnh truyền nhiễm (do virus, vi khuẩn gây ra như dịch tả lợn châu Phi, cúm gia cầm, lở mồm long móng)',
        'Nhóm bệnh không truyền nhiễm do chấn thương cơ học như gãy chân, trật khớp hoặc hóc dị vật đường ăn',
        'Nhóm bệnh rối loạn trao đổi chất do thiếu hụt vitamin D, thiếu khoáng calcium hoặc trúng độc muối ăn',
        'Nhóm dị tật bẩm sinh di truyền cá biệt xuất hiện ở một vài cá thể do đột biến nhiễm sắc thể hiếm gặp',
      ],
      correctIndex: 0,
      explanation: 'Bệnh truyền nhiễm do các vi sinh vật gây bệnh (virus, vi khuẩn, nấm) gây ra và có khả năng lây truyền nhanh qua tiếp xúc, không khí, thức ăn, nước uống hoặc vật trung gian (Bài 11 trang 57).',
    },
    {
      number: 22,
      level: 'biet',
      question: 'Theo Bài 12 SGK Công nghệ 11, tác nhân gây bệnh Tụ huyết trùng ở lợn (đấu dấu) và gia cầm là loài vi sinh vật nào sau đây?',
      options: [
        'Vi khuẩn Pasteurella multocida',
        'Virus cúm gia cầm Influenza type A (H5N1)',
        'Virus gây hội chứng rối loạn sinh sản và hô hấp (PRRS)',
        'Kí sinh trùng giun đũa lợn Ascaris suum',
      ],
      correctIndex: 0,
      explanation: 'Bệnh tụ huyết trùng ở lợn, trâu bò và gia cầm là bệnh truyền nhiễm cấp tính do vi khuẩn Pasteurella multocida gây ra, có thể điều trị bằng kháng sinh nếu phát hiện sớm (Bài 12 trang 63).',
    },
    {
      number: 23,
      level: 'biet',
      question: 'Theo Bài 12 SGK Công nghệ 11, bệnh truyền nhiễm nguy hiểm nào ở lợn do virus ASFV gây ra, có tỉ lệ chết lên tới gần 100% và hiện cần kiểm soát an toàn sinh học cực kì nghiêm ngặt?',
      options: [
        'Bệnh Dịch tả lợn châu Phi (African Swine Fever – ASF)',
        'Bệnh thiếu máu dinh dưỡng do thiếu sắt ở lợn con sơ sinh',
        'Bệnh còi xương và bại liệt sau khi đẻ ở lợn nái nuôi con',
        'Bệnh ghẻ ngứa ngoài da do cái ghẻ Sarcoptes kí sinh',
      ],
      correctIndex: 0,
      explanation: 'Bệnh Dịch tả lợn châu Phi (ASF) do virus ASFV gây sốt cao, xuất huyết nặng toàn bộ cơ quan nội tạng, tỉ lệ chết lên tới 100% (Bài 12 trang 62).',
    },
    {
      number: 24,
      level: 'biet',
      question: 'Theo Bài 13 SGK Công nghệ 11, bệnh truyền nhiễm nào ở gia cầm do chủng virus Paramyxovirus gây ra với triệu chứng điển hình là khó thở, tiêu chảy phân xanh trắng và ngoẹo cổ?',
      options: [
        'Bệnh Newcastle (còn gọi là bệnh gà rù)',
        'Bệnh cầu trùng ruột non do đơn bào Eimeria',
        'Bệnh thiếu vitamin B1 gây co giật ở gà con',
        'Bệnh mổ cắn lông nhau do mật độ nuôi quá dày',
      ],
      correctIndex: 0,
      explanation: 'Bệnh Newcastle (gà rù) là bệnh truyền nhiễm nguy hiểm hàng đầu ở gà do virus Newcastle (nhóm Paramyxovirus) gây tổn thương hô hấp, tiêu hóa (phân xanh trắng) và thần kinh (ngoẹo đầu cổ).',
    },
    {
      number: 25,
      level: 'biet',
      question: 'Theo Bài 14 SGK Công nghệ 11, bệnh Lở mồm long móng (FMD) là bệnh truyền nhiễm cấp tính lây lan rất mạnh ở nhóm vật nuôi nào sau đây?',
      options: [
        'Động vật móng guốc chẵn như trâu, bò, lợn, dê và cừu',
        'Các loài gia cầm lông vũ như gà, vịt, ngan, ngỗng và chim cút',
        'Các loài động vật móng guốc lẻ như ngựa đua và lừa vận tải',
        'Các loài thủy sản nước ngọt như cá trắm cỏ, cá chép và tôm càng',
      ],
      correctIndex: 0,
      explanation: 'Bệnh Lở mồm long móng (Foot and Mouth Disease – FMD) do virus FMDV gây mụn nước loét ở niêm mạc miệng, lưỡi và kẽ móng chân ở các loài thú móng guốc chẵn (trâu, bò, lợn, dê, cừu).',
    },
    {
      number: 26,
      level: 'biet',
      question: 'Theo Bài 14 SGK Công nghệ 11, hiện tượng bụng phía bên trái của trâu, bò căng phồng to nhanh như cái trống sau khi ăn quá nhiều thức ăn xanh non dễ lên men (như cỏ họ Đậu ướt mưa) là biểu hiện của bệnh',
      options: [
        'Bệnh chướng hơi dạ cỏ cấp tính ở trâu, bò',
        'Bệnh cúm gia cầm thể độc lực cao H5N1',
        'Bệnh hội chứng còi cọc sau cai sữa ở lợn con',
        'Bệnh đậu gà gây mụn vảy ở mào và tích gà',
      ],
      correctIndex: 0,
      explanation: 'Chướng hơi dạ cỏ là bệnh nội khoa cấp tính ở gia súc nhai lại do thức ăn lên men sinh quá nhiều khí trong dạ cỏ mà không ợ hơi thoát ra được, làm hõm hông trái phồng căng (Bài 14 trang 74).',
    },
    {
      number: 27,
      level: 'biet',
      question: 'Theo Bài 15 SGK Công nghệ 11, kĩ thuật chẩn đoán phân tử hiện đại giúp phát hiện nhanh và chính xác đoạn gene đặc hiệu của virus, vi khuẩn gây bệnh trong mẫu bệnh phẩm là',
      options: [
        'Kĩ thuật phản ứng chuỗi trùng hợp PCR (hoặc Real-time PCR / RT-PCR)',
        'Phương pháp quan sát màu sắc lông bằng mắt thường từ khoảng cách xa',
        'Phương pháp cân khối lượng cơ thể vật nuôi bằng cân đồng hồ cơ học',
        'Phương pháp đo chiều dài chuồng nuôi bằng thước dây kim loại cuộn',
      ],
      correctIndex: 0,
      explanation: 'Kĩ thuật PCR (Polymerase Chain Reaction) và RT-PCR giúp nhân bản và phát hiện chính xác vật chất di truyền (ADN/ARN) của mầm bệnh với độ nhạy và độ đặc hiệu rất cao (Bài 15 trang 77).',
    },
    {
      number: 28,
      level: 'biet',
      question: 'Theo Bài 15 SGK Công nghệ 11, loại chế phẩm sinh học chứa kháng nguyên (mầm bệnh đã làm yếu, làm chết hoặc tiểu đơn vị protein/gene) đưa vào cơ thể vật nuôi khỏe mạnh để tạo miễn dịch chủ động gọi là',
      options: [
        'Vắc-xin phòng bệnh thú y',
        'Thuốc kháng sinh điều trị nhiễm khuẩn',
        'Thuốc tẩy giun sán đường tiêu hóa',
        'Hóa chất sát trùng chuồng trại vôi bột',
      ],
      correctIndex: 0,
      explanation: 'Vắc-xin chứa kháng nguyên kích thích hệ miễn dịch của vật nuôi khỏe mạnh tự sản sinh kháng thể đặc hiệu để chủ động chống lại mầm bệnh khi xâm nhập (Bài 15 trang 79).',
    },
    {
      number: 29,
      level: 'biet',
      question: 'Theo Bài 11 SGK Công nghệ 11, khi phát hiện vật nuôi trong trại có dấu hiệu nghi mắc bệnh truyền nhiễm nguy hiểm, biện pháp đầu tiên người chăn nuôi cần thực hiện ngay là',
      options: [
        'Tách riêng (cách li) ngay con vật ốm ra khu vực cách li, ngừng xuất nhập đàn và báo cho thú y cơ sở',
        'Nhanh chóng bán chạy toàn bộ số vật nuôi đang sốt cao ra chợ thực phẩm tươi sống ở địa phương',
        'Mổ thịt con vật ốm ngay tại nguồn nước sinh hoạt chung rồi vứt nội tạng xuống kênh mương công cộng',
        'Đưa toàn bộ vật nuôi khỏe mạnh từ các ô chuồng khác vào nhốt chung với con vật đang mắc bệnh',
      ],
      correctIndex: 0,
      explanation: 'Nguyên tắc vàng khi có dịch bệnh là cách li ngay vật nuôi ốm để cắt đứt nguồn lây, vệ sinh sát trùng và báo ngay cho cán bộ thú y/chính quyền địa phương (Bài 11 trang 59).',
    },
    {
      number: 30,
      level: 'hieu',
      question: 'Vì sao thuốc kháng sinh chỉ có tác dụng điều trị các bệnh do vi khuẩn (như tụ huyết trùng, phó thương hàn) mà hoàn toàn không tiêu diệt được virus (như virus PRRS, ASF, Newcastle)?',
      options: [
        'Vì kháng sinh tác động vào vách tế bào hoặc bộ máy tổng hợp protein của tế bào vi khuẩn, trong khi virus không có cấu tạo tế bào và kí sinh nội bào bắt buộc',
        'Vì kích thước của hạt virus lớn gấp một nghìn lần con vi khuẩn nên phân tử kháng sinh không thể bao bọc hết virus',
        'Vì virus có khả năng sử dụng thuốc kháng sinh làm nguồn thức ăn giàu năng lượng để nhân lên nhanh hơn trong máu',
        'Vì thuốc kháng sinh khi tiêm vào cơ thể vật nuôi sẽ tự động bốc hơi hết qua da nếu gặp phải các chủng virus',
      ],
      correctIndex: 0,
      explanation: 'Kháng sinh ức chế tổng hợp thành tế bào peptidoglycan hoặc ribosome 70S của vi khuẩn; virus chỉ có lõi acid nucleic và vỏ capsid kí sinh trong tế bào chủ nên kháng sinh không diệt được virus.',
    },
    {
      number: 31,
      level: 'hieu',
      question: 'Tại sao khi sử dụng kháng sinh điều trị bệnh nhiễm khuẩn cho vật nuôi, người chăn nuôi bắt buộc phải tuân thủ đúng "thời gian ngừng thuốc" trước khi giết mổ hoặc khai thác sữa, trứng?',
      options: [
        'Để cơ thể vật nuôi đào thải hết lượng kháng sinh tồn dư, bảo đảm an toàn thực phẩm và ngăn ngừa tình trạng kháng kháng sinh ở người tiêu dùng',
        'Để làm cho khối lượng cơ thể của vật nuôi tăng thêm gấp đôi chỉ trong vòng hai mươi bốn giờ trước khi xuất bán',
        'Vì nếu không ngừng thuốc thì màu lông bên ngoài của vật nuôi sẽ chuyển hết sang màu xanh tím khi đưa ra ánh sáng',
        'Để giúp các vi khuẩn gây bệnh trong chuồng nuôi có đủ thời gian phục hồi và nhân lên trở lại trong cơ thể vật nuôi',
      ],
      correctIndex: 0,
      explanation: 'Ngừng thuốc đúng thời gian quy định trên nhãn giúp dư lượng kháng sinh trong thịt, trứng, sữa giảm xuống dưới ngưỡng an toàn (MRL), bảo vệ sức khỏe người tiêu dùng (Bài 15 trang 81).',
    },
    {
      number: 32,
      level: 'hieu',
      question: 'Vì sao chỉ tiêm vắc-xin phòng bệnh cho đàn vật nuôi đang khỏe mạnh mà tuyệt đối không tiêm vắc-xin cho những con vật đang sốt cao hoặc đang ủ bệnh truyền nhiễm?',
      options: [
        'Vì vật nuôi đang ốm có hệ miễn dịch suy yếu không tạo đủ kháng thể, thậm chí phản ứng vắc-xin sẽ làm bệnh nặng thêm và gây chết nhanh',
        'Vì vắc-xin khi tiêm vào con vật đang sốt cao sẽ tự động biến thành nước cất vô tác dụng ngay ở đầu kim tiêm',
        'Vì con vật đang sốt cao đã có sẵn lượng kháng thể cao gấp mười lần con vật khỏe mạnh nên không cần tiêm thêm',
        'Vì tiêm vắc-xin cho vật nuôi đang ốm sẽ làm gãy toàn bộ kim tiêm bằng thép không gỉ của bác sĩ thú y',
      ],
      correctIndex: 0,
      explanation: 'Vắc-xin cần hệ miễn dịch khỏe mạnh để đáp ứng sinh kháng thể sau 1–3 tuần; tiêm vào vật nuôi đang ủ bệnh/suy nhược sẽ gây quá tải miễn dịch và bùng phát bệnh cấp tính.',
    },
    {
      number: 33,
      level: 'hieu',
      question: 'Trong phòng bệnh tổng hợp cho trang trại chăn nuôi (Bài 11), tại sao thực hiện "cùng vào – cùng ra" (all-in, all-out) theo từng dãy chuồng lại giúp cắt đứt vòng đời mầm bệnh?',
      options: [
        'Vì tạo ra khoảng thời gian trống chuồng hoàn toàn giữa hai lứa nuôi để tổng vệ sinh, phun sát trùng và để trống chuồng tiêu diệt triệt để mầm bệnh lưu cữu',
        'Vì khi xuất bán cùng lúc thì các mầm bệnh sẽ tự động đi theo xe tải ra khỏi trại mà không cần phải rửa chuồng hay phun thuốc sát trùng',
        'Vì phương thức này cho phép nhốt lẫn lộn lợn con mới sinh với lợn thịt sắp xuất chuồng trong cùng một ô chuồng suốt năm',
        'Vì giúp người chăn nuôi tiết kiệm được 100% chi phí mua vắc-xin và thức ăn hỗn hợp trong suốt quá trình nuôi',
      ],
      correctIndex: 0,
      explanation: 'Nguyên tắc "cùng vào – cùng ra" ngăn sự lây truyền mầm bệnh từ lứa cũ sang lứa mới và cho phép tổng tẩy uế, sát trùng, để trống chuồng (1–2 tuần) diệt sạch mầm bệnh.',
    },
    {
      number: 34,
      level: 'hieu',
      question: 'So với vắc-xin truyền thống, vắc-xin tái tổ hợp sản xuất bằng công nghệ gene (Bài 15) có ưu điểm vượt trội nào về mặt an toàn sinh học?',
      options: [
        'Chỉ sử dụng đoạn gene mã hóa protein kháng nguyên đặc hiệu nên hoàn toàn không có nguy cơ mầm bệnh phục hồi độc lực gây bệnh cho vật nuôi',
        'Có thể bảo quản ở ngoài nắng nóng 50 °C suốt nhiều năm mà không bao giờ bị giảm hoạt lực sinh học',
        'Chỉ cần tiêm một mũi duy nhất cho một cá thể là toàn bộ các con vật khác trong trại tự động có miễn dịch theo',
        'Có tác dụng thay thế hoàn toàn thức ăn hỗn hợp và nước uống hàng ngày của đàn gia súc, gia cầm',
      ],
      correctIndex: 0,
      explanation: 'Vắc-xin tái tổ hợp không chứa toàn bộ hệ gene của virus/vi khuẩn gây bệnh mà chỉ chứa protein kháng nguyên bề mặt nên tuyệt đối an toàn, không có nguy cơ tái độc lực.',
    },
  ],
  'cn11-c5': [
    {
      number: 21,
      level: 'biet',
      question: 'Theo Bài 16 SGK Công nghệ 11, khi lựa chọn hướng chuồng nuôi gia súc, gia cầm ở Việt Nam, hai hướng chuồng được ưu tiên hàng đầu để đón gió mát mùa hè và tránh gió lạnh mùa đông là',
      options: [
        'Hướng Nam hoặc hướng Đông – Nam',
        'Hướng Tây hoặc hướng Tây – Bắc',
        'Hướng Bắc hoặc hướng Đông – Bắc',
        'Hướng chính Tây đón nắng chiều gay gắt',
      ],
      correctIndex: 0,
      explanation: 'Ở khí hậu nhiệt đới gió mùa Việt Nam, chuồng nuôi quay hướng Nam hoặc Đông – Nam giúp đón gió mát mùa hè, ấm áp mùa đông, tránh nắng gắt hướng Tây và gió mùa Đông Bắc (Bài 16 trang 85).',
    },
    {
      number: 22,
      level: 'biet',
      question: 'Theo Bài 16 SGK Công nghệ 11, trong kiểu chuồng kín hiện đại, hệ thống tấm làm mát (cooling pad) thường được lắp đặt ở vị trí nào so với hệ thống quạt hút gió công nghiệp?',
      options: [
        'Lắp đặt ở đầu chuồng đối diện với dàn quạt hút ở cuối chuồng để tạo luồng gió mát đi dọc suốt chiều dài chuồng',
        'Lắp đặt ở bên ngoài cổng tường rào cách xa chuồng nuôi khoảng năm trăm mét để làm mát đường giao thông',
        'Lắp đặt chìm ở dưới đáy bể chứa chất thải biogas nằm sâu dưới lòng đất bên dưới nền chuồng nuôi',
        'Đặt chồng khít lên phía trước cánh quạt hút gió để ngăn không cho bất kì luồng không khí nào đi qua quạt',
      ],
      correctIndex: 0,
      explanation: 'Chuồng kín hoạt động theo nguyên lí áp suất âm: quạt hút đặt ở một đầu hồi hút khí ra, không khí bên ngoài đi qua giàn tấm làmướt (cooling pad) ở đầu hồi đối diện làm hạ nhiệt độ chuồng.',
    },
    {
      number: 23,
      level: 'biet',
      question: 'Theo Bài 17 SGK Công nghệ 11, đối với lợn con sơ sinh trong tuần lễ đầu tiên, ngoài việc cho bú sữa đầu càng sớm càng tốt, biện pháp kĩ thuật bắt buộc để phòng bệnh thiếu máu là',
      options: [
        'Tiêm bổ sung chế phẩm sắt (dextran sắt) cho lợn con vào khoảng ngày tuổi thứ 3 và ngày tuổi thứ 10',
        'Cho lợn con ăn ngay một ki-lô-gam rơm lúa khô và cỏ voi già mỗi ngày ngay sau khi cắt rốn',
        'Tắm nước đá lạnh cho toàn bộ đàn lợn con sơ sinh ba lần mỗi ngày để rèn luyện sức chịu lạnh',
        'Tách lợn con sơ sinh nhốt hoàn toàn trong bóng tối tuyệt đối và không cho bú sữa mẹ trong tuần đầu',
      ],
      correctIndex: 0,
      explanation: 'Dự trữ sắt trong gan lợn con sơ sinh rất thấp và sữa mẹ nghèo sắt, trong khi lợn con lớn rất nhanh nên phải tiêm sắt lúc 3 ngày tuổi (và nhắc lại lúc 10–14 ngày tuổi) để phòng thiếu máu (Bài 17 trang 91).',
    },
    {
      number: 24,
      level: 'biet',
      question: 'Theo Bài 18 SGK Công nghệ 11, trong chăn nuôi gà đẻ trứng công nghiệp, yếu tố ngoại cảnh nào cần được chiếu bổ sung theo quy trình nghiêm ngặt (14–16 giờ/ngày) để kích thích tuyến yên tiết hormone sinh sản?',
      options: [
        'Chế độ chiếu sáng (thời gian và cường độ ánh sáng trong chuồng nuôi gà đẻ)',
        'Chế độ phun mưa nhân tạo làm ướt đẫm bộ lông gà đẻ suốt ngày đêm',
        'Chế độ phát tiếng ồn cường độ cực lớn liên tục trong chuồng nuôi gà đẻ',
        'Chế độ bơm khí carbonic đậm đặc vào trong chuồng nuôi vào ban đêm',
      ],
      correctIndex: 0,
      explanation: 'Ánh sáng tác động qua thị giác đến vùng dưới đồi – tuyến yên của gà mái đẻ, kích thích tiết hormone FSH, LH duy trì sự phát triển buồng trứng và năng suất đẻ trứng cao (Bài 18 trang 96).',
    },
    {
      number: 25,
      level: 'biet',
      question: 'Theo Bài 19 SGK Công nghệ 11, đối với bê con mới sinh trong những giờ đầu tiên, việc làm quan trọng nhất để bê có kháng thể miễn dịch tự nhiên chống bệnh tật là',
      options: [
        'Cho bê con bú sữa đầu (colostrum) của bò mẹ càng sớm càng tốt trong vòng 1–2 giờ đầu sau khi sinh',
        'Cho bê con ăn ngay thức ăn ủ chua trộn với urea nồng độ cao ngay sau khi bê vừa đứng dậy',
        'Đưa bê con mới sinh đi cày ruộng ngay lập tức để rèn luyện cơ bắp và hệ xương khớp',
        'Cắt bỏ hoàn toàn khẩu phần sữa và chỉ cho bê con uống nước muối đặc trong mười ngày đầu',
      ],
      correctIndex: 0,
      explanation: 'Sữa đầu của bò mẹ rất giàu kháng thể (Immunoglobulin), vitamin A, protein và muối khoáng giúp nhuận tràng tống phân su; ruột bê hấp thu nguyên vẹn kháng thể tốt nhất trong những giờ đầu sau sinh.',
    },
    {
      number: 26,
      level: 'biet',
      question: 'Theo Bài 19 SGK Công nghệ 11, trong quy trình vắt sữa bò bằng máy tự động, bước vệ sinh bầu vú bằng nước ấm (40–45 °C) và lau khô bằng khăn sạch riêng trước khi lắp cụm núm vắt có tác dụng',
      options: [
        'Đảm bảo vệ sinh an toàn sữa tươi và kích thích phản xạ tiết hormone oxytocin giúp bò thải sữa nhanh, kiệt',
        'Làm đóng băng toàn bộ các nang sữa bên trong bầu vú để sữa tự đông đặc thành phô mai trước khi vắt',
        'Ngăn không cho bất kì giọt sữa nào chảy ra khỏi bầu vú trong suốt thời gian máy vắt sữa hoạt động',
        'Thay thế hoàn toàn việc cho bò sữa ăn thức ăn thô xanh và thức ăn tinh hỗn hợp hàng ngày',
      ],
      correctIndex: 0,
      explanation: 'Rửa bầu vú bằng nước ấm sạch và massage nhẹ nhàng vừa loại bỏ vi khuẩn bẩn ngoài da vú vừa kích thích phản xạ thần kinh – thể dịch tiết oxytocin làm co bóp nang sữa (Bài 19 trang 101).',
    },
    {
      number: 27,
      level: 'biet',
      question: 'Theo Bài 20 SGK Công nghệ 11, mục tiêu cốt lõi của quy trình chăn nuôi theo tiêu chuẩn VietGAP là gì?',
      options: [
        'Đảm bảo an toàn thực phẩm, kiểm soát dịch bệnh, bảo vệ môi trường, sức khỏe người lao động và truy xuất được nguồn gốc',
        'Sử dụng tối đa các loại chất tạo nạc nhóm Beta-agonist và kháng sinh cấm để rút ngắn một nửa thời gian nuôi',
        'Xóa bỏ hoàn toàn việc ghi chép nhật kí chăn nuôi để giảm bớt khối lượng công việc hành chính cho trang trại',
        'Cho phép giết mổ và tiêu thụ tự do các loại gia súc, gia cầm chết do dịch bệnh truyền nhiễm nguy hiểm',
      ],
      correctIndex: 0,
      explanation: 'VietGAP (Vietnamese Good Animal Husbandry Practices) là quy trình thực hành chăn nuôi tốt nhằm đảm bảo chất lượng, an toàn thực phẩm, an toàn dịch bệnh, môi trường và truy xuất nguồn gốc (Bài 20 trang 104).',
    },
    {
      number: 28,
      level: 'biet',
      question: 'Theo Bài 20 SGK Công nghệ 11, hệ thống quản lí và giám sát tiểu khí hậu, cho ăn, cân tự động, vắt sữa tự động bằng robot và phần mềm quản lí đàn thuộc mô hình',
      options: [
        'Chăn nuôi công nghệ cao (chăn nuôi thông minh / chăn nuôi chính xác)',
        'Chăn nuôi du mục truyền thống di chuyển đàn gia súc theo mùa cỏ tự nhiên',
        'Chăn nuôi tận dụng nhỏ lẻ hộ gia đình bằng thức ăn dư thừa trong sinh hoạt',
        'Khai thác động vật hoang dã tự nhiên trong các khu rừng nguyên sinh nhiệt đới',
      ],
      correctIndex: 0,
      explanation: 'Chăn nuôi công nghệ cao ứng dụng tự động hóa, cảm biến IoT, robot vắt sữa/cho ăn, chip RFID và phần mềm quản lí thông minh vào toàn bộ chuỗi sản xuất (Bài 20 trang 107).',
    },
    {
      number: 29,
      level: 'biet',
      question: 'Trong chăn nuôi gà con giai đoạn úm (1–21 ngày tuổi, Bài 18 SGK Công nghệ 11), quan sát thấy đàn gà con tụm lại chồng đống sát ngay dưới bóng đèn sưởi và kêu chiếp chiếp là dấu hiệu cho thấy',
      options: [
        'Nhiệt độ trong quây úm đang bị quá thấp (gà con bị lạnh), cần tăng nhiệt độ sưởi ấm và che chắn gió lùa',
        'Nhiệt độ trong quây úm đang quá nóng bức vượt ngưỡng 45 °C khiến gà con phải tránh xa nguồn nhiệt',
        'Nhiệt độ trong quây úm đã hoàn toàn lí tưởng giúp gà con phân bố đều khắp diện tích quây úm',
        'Đàn gà con đã đạt khối lượng xuất chuồng thương phẩm và cần phải tắt toàn bộ hệ thống chiếu sáng',
      ],
      correctIndex: 0,
      explanation: 'Khi gà con bị lạnh, chúng co cụm lại sát chụp sưởi; khi quá nóng, chúng tản ra xa chụp sưởi há mỏ thở; khi nhiệt độ vừa đủ, gà con phân bố đều, ăn uống linh hoạt (Bài 18 trang 95).',
    },
    {
      number: 30,
      level: 'hieu',
      question: 'Vì sao nền chuồng nuôi gia súc, gia cầm bắt buộc phải được thiết kế cao ráo hơn mặt đất xung quanh (30–50 cm), phẳng, không trơn trượt và có độ dốc thoát nước 2–3% về phía rãnh thoát?',
      options: [
        'Để giữ nền chuồng luôn khô sạch, thoát nhanh nước tiểu và nước rửa chuồng, hạn chế vi sinh vật gây bệnh phát triển và tránh trượt ngã trật khớp cho vật nuôi',
        'Để giữ toàn bộ nước thải và phân tươi đọng lại ngập trên mặt sàn chuồng giúp làm mát bụng vật nuôi suốt mùa đông lạnh giá',
        'Vì độ dốc 2–3% giúp các viên thức ăn tự động lăn ngược từ dưới rãnh thoát chất thải lên trên máng ăn của vật nuôi',
        'Để ngăn không cho ánh sáng mặt trời và không khí trong lành lưu thông vào bên trong khu vực chuồng nuôi gia súc',
      ],
      correctIndex: 0,
      explanation: 'Nền chuồng khô ráo, thoát nước tốt và có độ nhám vừa phải là điều kiện tiên quyết để hạn chế ẩm ướt, khí độc NH3, bệnh móng khớp và tiêu chảy ở vật nuôi (Bài 16 trang 86).',
    },
    {
      number: 31,
      level: 'hieu',
      question: 'Tại sao đối với lợn con theo mẹ, người chăn nuôi cần tập cho lợn con ăn sớm thức ăn tập ăn (creep feed) từ lúc 7 ngày tuổi dù lợn mẹ vẫn đang tiết sữa?',
      options: [
        'Để rèn luyện hệ thống enzyme tiêu hóa phát triển sớm, bù đắp dinh dưỡng khi sữa mẹ giảm dần từ tuần thứ 3 và giảm stress tiêu chảy khi cai sữa',
        'Để làm cho lợn mẹ ngừng tiết sữa hoàn toàn ngay từ ngày thứ bảy sau khi đẻ và chuyển sang mang thai lứa tiếp theo ngay lập tức',
        'Vì sữa của lợn mẹ từ ngày thứ bảy trở đi chỉ chứa toàn nước lã mà không còn bất kì chất dinh dưỡng hay khoáng chất nào',
        'Để lợn con có thể tự đi kiếm ăn ngoài đồng cỏ tự nhiên như trâu bò trưởng thành ngay từ khi mới được một tuần tuổi',
      ],
      correctIndex: 0,
      explanation: 'Sản lượng sữa lợn mẹ đạt đỉnh ở tuần thứ 3 rồi giảm trong khi nhu cầu của lợn con tăng nhanh; tập ăn sớm giúp dạ dày – ruột lợn con quen tiêu hóa tinh bột/protein thực vật, tránh khủng hoảng sau cai sữa.',
    },
    {
      number: 32,
      level: 'hieu',
      question: 'Trong quy trình chăn nuôi theo tiêu chuẩn VietGAP (Bài 20), vì sao việc ghi chép đầy đủ sổ nhật kí chăn nuôi (giống, thức ăn, vắc-xin, thuốc thú y) và lưu trữ hồ sơ lại bắt buộc?',
      options: [
        'Để minh bạch quy trình sản xuất, phục vụ kiểm tra đánh giá chứng nhận và truy xuất chính xác nguồn gốc sản phẩm khi có sự cố an toàn thực phẩm',
        'Chỉ để trang trí tủ sách của văn phòng trang trại chứ không có bất kì giá trị thực tiễn nào đối với người tiêu dùng hay cơ quan quản lí',
        'Để thay thế hoàn toàn việc tiêm phòng vắc-xin và vệ sinh khử trùng chuồng trại trong suốt quá trình nuôi dưỡng vật nuôi',
        'Vì nếu ghi sổ nhật kí hàng ngày thì vật nuôi sẽ tự động lớn nhanh gấp đôi mà không cần phải tiêu tốn thức ăn hỗn hợp',
      ],
      correctIndex: 0,
      explanation: 'Hồ sơ ghi chép là căn cứ pháp lí và kĩ thuật để truy xuất nguồn gốc từ bàn ăn về trang trại (traceability), giúp kiểm soát an toàn thực phẩm và tạo niềm tin trên thị trường.',
    },
    {
      number: 33,
      level: 'hieu',
      question: 'Tại sao trong khẩu phần ăn của bò sữa cao sản, người chăn nuôi luôn phải duy trì tỉ lệ thức ăn thô xanh (cỏ tươi, thức ăn ủ chua) hợp lí bên cạnh thức ăn tinh hỗn hợp?',
      options: [
        'Để duy trì hoạt động nhai lại, ổn định pH dạ cỏ cho vi sinh vật phân giải xơ tạo acid acetic tổng hợp chất béo sữa và phòng bệnh toan hóa dạ cỏ',
        'Vì thức ăn thô xanh có hàm lượng năng lượng trao đổi cao gấp mười lần hạt ngô vàng và khô dầu đậu tương ép',
        'Để làm cho sản lượng sữa của bò giảm đi một nửa nhằm tiết kiệm thời gian vận hành hệ thống máy vắt sữa tự động',
        'Vì bò sữa cao sản không có khả năng tiêu hóa được bất kì loại tinh bột hay protein nào có trong thức ăn tinh hỗn hợp',
      ],
      correctIndex: 0,
      explanation: 'Nếu cho bò sữa ăn quá nhiều thức ăn tinh và thiếu xơ thô, dạ cỏ sẽ sinh nhiều acid lactic gây toan hóa dạ cỏ (acidosis), giảm tỉ lệ mỡ sữa và gây viêm móng, rối loạn tiêu hóa.',
    },
    {
      number: 34,
      level: 'hieu',
      question: 'Trong hệ thống vắt sữa tự động bằng robot ở trang trại bò sữa công nghệ cao (Bài 20), việc mỗi con bò đeo vòng cổ gắn chip điện tử giúp hệ thống thực hiện điều gì?',
      options: [
        'Tự động nhận diện từng cá thể bò, kiểm tra khoảng cách từ lần vắt trước, định lượng thức ăn tinh theo năng suất sữa và cảnh báo sớm bệnh viêm vú',
        'Phát sóng điện từ điều khiển bò sữa tự bay qua hàng rào chuồng nuôi để ra cánh đồng thu hoạch cỏ voi mang về kho',
        'Biến sữa tươi vừa vắt ra thành các hộp sữa bột đóng lon hoàn chỉnh ngay bên trong vòng cổ của con bò',
        'Thay thế hoàn toàn hệ thống cung cấp nước uống và hệ thống quạt thông gió làm mát ở bên trong chuồng nuôi bò sữa',
      ],
      correctIndex: 0,
      explanation: 'Chip RFID gắn cổ giúp trạm robot nhận diện chính xác từng con bò, cấp lượng cám tinh tương ứng với năng suất sữa, đo độ dẫn điện/nhiệt độ sữa từng núm vú để phát hiện sớm viêm vú.',
    },
  ],
  'cn11-c6': [
    {
      number: 21,
      level: 'biet',
      question: 'Theo Bài 21 SGK Công nghệ 11, các loại khí độc và khí gây mùi hôi thối phát sinh chủ yếu từ quá trình phân hủy chất thải chăn nuôi trong chuồng trại là',
      options: [
        'Khí ammonia (NH3), khí hydrogen sulfide (H2S), khí methane (CH4) và các hợp chất indole, skatole',
        'Khí oxygen tinh khiết (O2), khí helium (He), khí neon (Ne) và hơi nước cất vô trùng trong lành',
        'Khí ozone tầng bình lưu (O3) và các ion âm có lợi cho đường hô hấp của con người',
        'Hương thơm tinh dầu sả chanh và tinh dầu tràm trà tự nhiên bốc lên từ nền chuồng xi măng',
      ],
      correctIndex: 0,
      explanation: 'Sự phân hủy protein và chất hữu cơ trong phân, nước tiểu sinh ra các khí độc và mùi hôi như NH3, H2S, CH4, CO2, mercaptan, indole, skatole gây ô nhiễm không khí và hại hô hấp vật nuôi (Bài 21 trang 110).',
    },
    {
      number: 22,
      level: 'biet',
      question: 'Theo Bài 21 SGK Công nghệ 11, nhóm chất thải nào phát sinh từ hoạt động thú y trong trang trại được xếp vào nhóm chất thải nguy hại cần thu gom và xử lí riêng biệt?',
      options: [
        'Kim tiêm đã qua sử dụng, vỏ lọ vắc-xin, bao bì thuốc thú y, bông băng dính máu và xác vật nuôi mắc bệnh truyền nhiễm',
        'Phân trâu bò ăn cỏ tự nhiên đã được ủ hoai mục hoàn toàn dùng để bón lót cho vườn cây ăn quả',
        'Lá cây khô rụng trên đường nội bộ khu hành chính và nước mưa chảy tràn trên mái nhà kho chứa cỏ',
        'Vỏ trấu khô và mùn cưa gỗ thông sạch mới mua về chưa đưa vào sử dụng làm đệm lót chuồng nuôi',
      ],
      correctIndex: 0,
      explanation: 'Vỏ lọ vắc-xin, kim tiêm, thuốc thú y hết hạn, dụng cụ dính bệnh phẩm và xác vật nuôi chết do dịch bệnh là chất thải nguy hại có nguy cơ phát tán mầm bệnh và hóa chất độc hại (Bài 21 trang 111).',
    },
    {
      number: 23,
      level: 'biet',
      question: 'Theo Bài 22 SGK Công nghệ 11, thành phần khí cháy chủ yếu có trong khí sinh học (biogas) thu được từ hầm ủ kị khí chất thải chăn nuôi là',
      options: [
        'Khí methane (CH4, chiếm khoảng 55% – 70% thể tích khí sinh học)',
        'Khí oxygen nguyên chất (O2, chiếm trên 95% thể tích khí sinh học)',
        'Khí nitrogen trơ (N2, chiếm hoàn toàn 100% thể tích khí sinh học)',
        'Khí chlorine (Cl2) dùng để khử trùng nước cấp sinh hoạt đô thị',
      ],
      correctIndex: 0,
      explanation: 'Khí sinh học (biogas) là hỗn hợp khí sinh ra từ phân hủy kị khí chất hữu cơ, trong đó khí methane (CH4) chiếm khoảng 55–70% có thể làm nhiên liệu đun nấu, thắp sáng hoặc chạy máy phát điện (Bài 22 trang 114).',
    },
    {
      number: 24,
      level: 'biet',
      question: 'Theo Bài 22 SGK Công nghệ 11, kĩ thuật nuôi gia cầm hoặc lợn trên lớp vật liệu hữu cơ trơ (trấu, mùn cưa dày 20–50 cm) có phun chế phẩm vi sinh vật có ích để phân hủy phân tại chỗ gọi là',
      options: [
        'Chăn nuôi trên đệm lót sinh học (đệm lót vi sinh)',
        'Chăn nuôi trên sàn nhựa dội rửa nước liên tục hàng giờ',
        'Chăn nuôi thủy canh tuần hoàn trong bể chứa dung dịch khoáng',
        'Chăn nuôi lồng bè nổi trên các hồ thủy điện và vịnh biển kín',
      ],
      correctIndex: 0,
      explanation: 'Đệm lót sinh học gồm lớp chất độn giàu xơ (trấu, mùn cưa) trộn chế phẩm VSV (nấm men, vi khuẩn Bacillus, xạ khuẩn) giúp đồng hóa phân và nước tiểu ngay tại nền chuồng, khử mùi hôi (Bài 22 trang 115).',
    },
    {
      number: 25,
      level: 'biet',
      question: 'Theo Bài 22 SGK Công nghệ 11, thiết bị cơ học dùng để tách riêng phần bã phân rắn và phần nước thải lỏng trước khi đưa nước thải vào hầm biogas ở các trang trại lợn quy mô lớn là',
      options: [
        'Máy ép tách phân (máy tách pha rắn – lỏng chất thải chăn nuôi)',
        'Máy nghiền búa nghiền hạt ngô và khô dầu đậu tương thành bột mịn',
        'Máy ấp trứng gia cầm tự động điều chỉnh nhiệt độ và đảo khay trứng',
        'Máy vắt sữa bò tự động dùng áp lực chân không theo nhịp sinh lí',
      ],
      correctIndex: 0,
      explanation: 'Máy ép tách phân giúp thu hồi phần bã rắn (độ ẩm thấp) để ủ phân hữu cơ thương phẩm, còn phần nước lỏng đi vào hầm biogas giúp tránh đóng váng và tránh đầy bùn hầm biogas (Bài 22 trang 113).',
    },
    {
      number: 26,
      level: 'biet',
      question: 'Theo Bài 22 SGK Công nghệ 11, phương pháp sử dụng giun quế (Perionyx excavatus) để xử lí phân trâu, bò, lợn tươi tạo thành phân bón hữu cơ chất lượng cao và sinh khối giun làm thức ăn chăn nuôi là',
      options: [
        'Ứng dụng công nghệ nuôi giun trùn quế (vermicomposting) trong xử lí chất thải chăn nuôi',
        'Phương pháp đốt chất thải rắn trong lò đốt nhiệt độ cao trên một nghìn độ C',
        'Phương pháp chôn lấp chất thải rắn kèm vôi bột dưới hố sâu ở cuối trang trại',
        'Phương pháp lọc màng thẩm thấu ngược RO đối với nước thải sau bể lắng cát',
      ],
      correctIndex: 0,
      explanation: 'Nuôi giun quế bằng phân gia súc giúp chuyển hóa nhanh chất thải hữu cơ thành phân trùn quế (vermicompost) giàu mùn – vi sinh cho cây trồng và thu sinh khối giun giàu protein cho gà, cá.',
    },
    {
      number: 27,
      level: 'biet',
      question: 'Theo Bài 22 SGK Công nghệ 11, khi xử lí xác vật nuôi chết do mắc bệnh truyền nhiễm nguy hiểm (như dịch tả lợn châu Phi, cúm gia cầm), quy định bắt buộc về bảo vệ môi trường và thú y là',
      options: [
        'Tiêu hủy bằng cách đốt trong lò chuyên dụng hoặc chôn sâu đúng quy cách có rắc vôi bột và phun hóa chất sát trùng',
        'Đưa trực tiếp xác vật nuôi chết vào hầm biogas gia đình hoặc ủ làm phân bón tưới trực tiếp lên rau ăn sống',
        'Vứt xác vật nuôi ra sông suối, kênh mương thoát nước chung để dòng nước cuốn trôi đi sang địa phương khác',
        'Xay nhỏ xác vật nuôi chết vì dịch bệnh để trộn làm thức ăn tươi sống cho các đàn vật nuôi khác trong trại',
      ],
      correctIndex: 0,
      explanation: 'Xác vật nuôi chết do bệnh truyền nhiễm nguy hiểm tuyệt đối không được tái chế làm phân bón hay thức ăn mà phải tiêu hủy (đốt hoặc chôn sâu với vôi bột/hóa chất khử trùng) dưới sự giám sát thú y (Bài 22 trang 116).',
    },
    {
      number: 28,
      level: 'biet',
      question: 'Theo Bài 22 SGK Công nghệ 11, việc bổ sung các enzyme tiêu hóa (như phytase, protease, xylanase) và chế phẩm probiotic vào khẩu phần ăn của vật nuôi giúp bảo vệ môi trường bằng cách nào?',
      options: [
        'Tăng tỉ lệ tiêu hóa hấp thu dinh dưỡng tại ruột, từ đó giảm lượng nitơ, phosphorus dư thừa và mùi hôi thải ra theo phân',
        'Làm cho vật nuôi ngừng hoàn toàn việc bài tiết phân và nước tiểu trong suốt ba tháng nuôi vỗ béo',
        'Biến toàn bộ phân thải ra ngoài nền chuồng thành các viên gạch nung dùng để xây tường rào trang trại',
        'Làm tăng gấp năm lần lượng khí độc ammonia (NH3) và hydrogen sulfide (H2S) bốc lên từ nền chuồng',
      ],
      correctIndex: 0,
      explanation: 'Giảm ô nhiễm ngay từ nguồn thông qua dinh dưỡng (bổ sung enzyme phytase, protease, chế phẩm sinh học đường ruột) giúp vật nuôi hấp thu triệt để đạm và lân, giảm phát thải N, P và khí hôi ra môi trường.',
    },
    {
      number: 29,
      level: 'biet',
      question: 'Trong quy trình ủ phân hữu cơ hiếu khí (compost) từ chất thải rắn chăn nuôi (Bài 22 SGK Công nghệ 11), nhiệt độ bên trong đống ủ ở giai đoạn phân giải mạnh có thể tăng lên mức',
      options: [
        'Khoảng 60 °C – 70 °C, giúp tiêu diệt phần lớn mầm bệnh, trứng giun sán và hạt cỏ dại có trong phân',
        'Khoảng -20 °C đến -10 °C, làm đóng băng toàn bộ khối phân ủ thành một khối nước đá cứng chắc',
        'Khoảng 500 °C – 600 °C, làm nung chảy toàn bộ mái che nhà ủ phân và đốt phân thành tro trắng',
        'Luôn giữ cố định ở mức 15 °C thấp hơn nhiệt độ môi trường bên ngoài trong suốt hai tháng ủ phân',
      ],
      correctIndex: 0,
      explanation: 'Quá trình vi sinh vật hiếu khí phân giải mạnh chất hữu cơ trong đống ủ compost sinh nhiệt làm nhiệt độ tâm đống ủ đạt 60–70 °C, giúp diệt khuẩn gây bệnh, trứng kí sinh trùng và hạt cỏ dại.',
    },
    {
      number: 30,
      level: 'hieu',
      question: 'Vì sao việc xả trực tiếp nước thải chăn nuôi chưa qua xử lí (chứa nhiều chất hữu cơ, N, P) ra ao hồ, sông suối lại gây ra hiện tượng "phú dưỡng hóa" làm chết cá và thủy sinh vật?',
      options: [
        'Vì hàm lượng N, P cao làm tảo bùng phát quá mức rồi chết đi, vi sinh vật phân hủy xác tảo và chất hữu cơ làm cạn kiệt oxygen hòa tan (DO) trong nước',
        'Vì nước thải chăn nuôi làm cho nhiệt độ nước sông hồ ngay lập tức tăng vọt lên mức sôi 100 °C làm chín toàn bộ tôm cá',
        'Vì các chất hữu cơ trong phân vật nuôi hút sạch toàn bộ phân tử nước làm cho lòng sông hồ khô cạn trơ đáy chỉ sau một đêm',
        'Vì chất thải chăn nuôi làm độ mặn của nước ngọt tăng lên gấp mười lần độ mặn của nước biển đại dương',
      ],
      correctIndex: 0,
      explanation: 'Nước thải chăn nuôi giàu N, P và chất hữu cơ (BOD, COD cao) gây hiện tượng phú dưỡng (tảo nở hoa), tiêu thụ hết oxygen hòa tan trong nước, sinh khí độc NH3, H2S làm tôm cá ngạt chết (Bài 21 trang 110).',
    },
    {
      number: 31,
      level: 'hieu',
      question: 'Tại sao nước thải sau khi đi ra khỏi bể biogas (nước sau biogas) vẫn chưa được phép xả thẳng ra kênh mương công cộng mà cần qua hệ thống hồ sinh học hoặc tưới cây có kiểm soát?',
      options: [
        'Vì nước sau biogas vẫn còn hàm lượng ammonium (NH4+), phosphorus và chất hữu cơ hòa tan cao vượt quy chuẩn xả thải trực tiếp ra nguồn nước mặt',
        'Vì nước sau biogas đã biến thành xăng dầu nguyên chất rất dễ bắt lửa cháy nổ khi tiếp xúc với ánh nắng mặt trời',
        'Vì bên trong nước sau biogas có chứa nồng độ acid sulfuric đậm đặc có thể ăn mòn thủng toàn bộ bờ đất kênh mương',
        'Vì nước sau biogas hoàn toàn vô trùng và tinh khiết hơn nước cất y tế nên nếu xả ra sông sẽ làm lãng phí nước uống',
      ],
      correctIndex: 0,
      explanation: 'Hầm biogas phân hủy phần lớn chất hữu cơ tạo CH4 nhưng N và P vẫn tồn tại dạng khoáng hòa tan (NH4+, PO4 3-) rất cao; cần tiếp tục xử lí qua hồ sinh học (bèo tây, tảo, cá) hoặc dùng làm nước tưới cây.',
    },
    {
      number: 32,
      level: 'hieu',
      question: 'Trong quá trình vận hành công trình khí sinh học (biogas), vì sao người chăn nuôi cần hạn chế để một lượng lớn thuốc sát trùng chuồng trại hoặc kháng sinh đậm đặc chảy vào hầm ủ?',
      options: [
        'Vì hóa chất sát trùng và kháng sinh sẽ tiêu diệt hoặc ức chế hệ vi sinh vật kị khí (đặc biệt là vi khuẩn sinh methane), làm hầm ngừng sinh khí gas',
        'Vì thuốc sát trùng khi gặp khí methane trong hầm biogas sẽ ngay lập tức biến toàn bộ bùn đáy hầm thành kim loại rắn',
        'Vì kháng sinh làm cho hệ vi sinh vật trong hầm biogas sinh sản nhanh gấp một trăm lần gây nổ tung nắp hầm chỉ sau một giờ',
        'Vì hóa chất sát trùng làm cho khí methane chuyển hóa hết thành khí thơm hương hoa nhài không thể đốt cháy trên bếp gas',
      ],
      correctIndex: 0,
      explanation: 'Quá trình sinh khí biogas phụ thuộc hoàn toàn vào hoạt động của các nhóm vi khuẩn kị khí và cổ khuẩn sinh methane; thuốc sát trùng và kháng sinh mạnh chảy vào hầm sẽ diệt VSV làm "chết" hầm biogas.',
    },
    {
      number: 33,
      level: 'hieu',
      question: 'Tại sao mô hình kinh tế tuần hoàn "Vườn – Ao – Chuồng – Biogas" (VACB) lại được đánh giá là giải pháp bền vững điển hình cho chăn nuôi nông hộ và trang trại ở Việt Nam?',
      options: [
        'Vì chất thải của khâu chăn nuôi được xử lí qua biogas và ủ phân thành đầu vào (năng lượng, phân bón, thức ăn) cho trồng trọt và thủy sản, giảm tối đa phát thải',
        'Vì mô hình này cho phép xây dựng chuồng lợn nằm ngay phía trên mặt giếng nước uống sinh hoạt của gia đình để tiết kiệm diện tích đất',
        'Vì trong mô hình VACB người nông dân không cần cho vật nuôi ăn và không cần chăm sóc cây trồng mà vẫn thu hoạch quanh năm',
        'Vì mô hình này giúp loại bỏ hoàn toàn sự xuất hiện của các loài vi sinh vật phân giải trong môi trường đất và nước',
      ],
      correctIndex: 0,
      explanation: 'Mô hình VACB khép kín vòng tuần hoàn vật chất và năng lượng: phân chăn nuôi → Biogas (khí đốt/điện) → bã bùn/phân ủ bón vườn cây & nuôi cá/giun → phụ phẩm vườn quay lại làm thức ăn chăn nuôi.',
    },
    {
      number: 34,
      level: 'hieu',
      question: 'Khi sử dụng đệm lót sinh học trong chăn nuôi gà hoặc lợn (Bài 22), vì sao cần định kì cào xới mặt đệm lót và tránh để nước uống rò rỉ làm ướt sũng đệm lót?',
      options: [
        'Để cung cấp oxygen và duy trì độ ẩm thích hợp (~40–50%) cho vi sinh vật hiếu khí hoạt động phân giải phân; nếu ướt sũng sẽ chuyển sang yếm khí gây thối và mốc',
        'Để làm cho toàn bộ lớp trấu và mùn cưa bay lên lơ lửng trong không khí giúp gà hít thở nhiều bụi gỗ hơn mỗi ngày',
        'Vì nếu đệm lót bị ướt nước thì các vi sinh vật có ích sẽ tự động biến thành các loài côn trùng cánh cứng cắn chân vật nuôi',
        'Để hạ nhiệt độ của lớp đệm lót xuống dưới 0 °C nhằm bảo quản đông lạnh phân tươi ngay trên nền chuồng nuôi',
      ],
      correctIndex: 0,
      explanation: 'Hệ VSV trong đệm lót sinh học chủ yếu là nhóm hiếu khí cần độ thoáng khí và độ ẩm vừa phải; nếu rò nước làm đệm lót sũng ướt sẽ thiếu O2, VSV có ích chết và bùng phát khí NH3, nấm mốc.',
    },
  ],
};

// Danh mục bài học tương ứng cho từng chương Lớp 11
const CHAPTER_11_LESSON_MAP: Record<string, string> = {
  'cn11-c1': 'Bài 1 & Bài 2 – SGK Công nghệ Chăn nuôi 11 (Kết nối tri thức)',
  'cn11-c2': 'Bài 3 đến Bài 6 – SGK Công nghệ Chăn nuôi 11 (Kết nối tri thức)',
  'cn11-c3': 'Bài 7 đến Bài 10 – SGK Công nghệ Chăn nuôi 11 (Kết nối tri thức)',
  'cn11-c4': 'Bài 11 đến Bài 15 – SGK Công nghệ Chăn nuôi 11 (Kết nối tri thức)',
  'cn11-c5': 'Bài 16 đến Bài 20 – SGK Công nghệ Chăn nuôi 11 (Kết nối tri thức)',
  'cn11-c6': 'Bài 21 & Bài 22 – SGK Công nghệ Chăn nuôi 11 (Kết nối tri thức)',
};

function buildGrade11PracticeExams(): Grade11PracticeExam[] {
  const grade11Chapters = CHAPTER_REVIEW_DATA.filter((ch) => ch.grade === '11');

  // Mỗi chương có 24 câu Biết (15 câu gốc + 9 câu bổ sung) và 10 câu Thông hiểu (5 câu gốc + 5 câu bổ sung)
  const chapterPools = grade11Chapters.map((ch, chIdx) => {
    const extraRaw = EXTRA_QUESTIONS_11_RAW[ch.id] || [];
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
        'husbandry'
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
      lessonRef: CHAPTER_11_LESSON_MAP[ch.id] || ch.pageRef,
      bietList, // 24 câu Nhận biết
      hieuList, // 10 câu Thông hiểu
    };
  });

  // Ma trận phân bổ 5 đề khảo nghiệm × 40 câu (Lớp 11 – 6 Chương):
  // Trong mỗi đề:
  // - Tất cả 6 chương đều có đúng 2 câu Thông hiểu (6 × 2 = 12 câu Thông hiểu)
  // - 4 chương có 5 câu Đã biết + 2 chương có 4 câu Đã biết (4 × 5 + 2 × 4 = 20 + 8 = 28 câu Đã biết)
  // => Tổng cộng mỗi đề = 28 câu Đã biết + 12 câu Thông hiểu = 40 câu (4 chương 7 câu + 2 chương 6 câu)
  // Luân phiên các chương 5 Biết và 4 Biết qua 5 đề để đảm bảo phân bổ đồng đều ở cả 6 chương và không trùng lặp câu hỏi.
  const examConfigs = [
    {
      examNumber: 1,
      code: '1101',
      title: 'Đề Khảo Nghiệm Số 01 – Công Nghệ Chăn Nuôi 11 (Kết Nối Tri Thức)',
      subtitle: '40 câu trắc nghiệm (28 câu Đã biết · 12 câu Thông hiểu) · Rải đều 6 chương SGK Lớp 11',
      fiveBietChapterIndices: [0, 1, 2, 3], // Chương I, II, III, IV có 5 Biết + 2 Hiểu (7 câu); Chương V, VI có 4 Biết + 2 Hiểu (6 câu)
    },
    {
      examNumber: 2,
      code: '1102',
      title: 'Đề Khảo Nghiệm Số 02 – Công Nghệ Chăn Nuôi 11 (Kết Nối Tri Thức)',
      subtitle: '40 câu trắc nghiệm (28 câu Đã biết · 12 câu Thông hiểu) · Rải đều 6 chương SGK Lớp 11',
      fiveBietChapterIndices: [2, 3, 4, 5], // Chương III, IV, V, VI có 5 Biết + 2 Hiểu (7 câu); Chương I, II có 4 Biết + 2 Hiểu (6 câu)
    },
    {
      examNumber: 3,
      code: '1103',
      title: 'Đề Khảo Nghiệm Số 03 – Công Nghệ Chăn Nuôi 11 (Kết Nối Tri Thức)',
      subtitle: '40 câu trắc nghiệm (28 câu Đã biết · 12 câu Thông hiểu) · Rải đều 6 chương SGK Lớp 11',
      fiveBietChapterIndices: [0, 1, 4, 5], // Chương I, II, V, VI có 5 Biết + 2 Hiểu (7 câu); Chương III, IV có 4 Biết + 2 Hiểu (6 câu)
    },
    {
      examNumber: 4,
      code: '1104',
      title: 'Đề Khảo Nghiệm Số 04 – Công Nghệ Chăn Nuôi 11 (Kết Nối Tri Thức)',
      subtitle: '40 câu trắc nghiệm (28 câu Đã biết · 12 câu Thông hiểu) · Rải đều 6 chương SGK Lớp 11',
      fiveBietChapterIndices: [0, 2, 4, 5], // Chương I, III, V, VI có 5 Biết + 2 Hiểu (7 câu); Chương II, IV có 4 Biết + 2 Hiểu (6 câu)
    },
    {
      examNumber: 5,
      code: '1105',
      title: 'Đề Khảo Nghiệm Số 05 – Công Nghệ Chăn Nuôi 11 (Kết Nối Tri Thức)',
      subtitle: '40 câu trắc nghiệm (28 câu Đã biết · 12 câu Thông hiểu) · Rải đều 6 chương SGK Lớp 11',
      fiveBietChapterIndices: [1, 2, 3, 4], // Chương II, III, IV, V có 5 Biết + 2 Hiểu (7 câu); Chương I, VI có 4 Biết + 2 Hiểu (6 câu)
    },
  ];

  // Con trỏ lấy câu hỏi không trùng lặp cho từng chương
  const bietCursor = new Array(6).fill(0);
  const hieuCursor = new Array(6).fill(0);

  return examConfigs.map((cfg) => {
    const perChapterSelected: {
      chapterId: string;
      chapterNumber: string;
      chapterTitle: string;
      bietItems: Grade11ExamQuestion[];
      hieuItems: Grade11ExamQuestion[];
    }[] = [];

    chapterPools.forEach((pool, cIdx) => {
      const needBiet = cfg.fiveBietChapterIndices.includes(cIdx) ? 5 : 4;
      const needHieu = 2; // Mỗi chương luôn có đúng 2 câu Thông hiểu (6 × 2 = 12 câu Thông hiểu)

      const pickedBiet: Grade11ExamQuestion[] = [];
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

      const pickedHieu: Grade11ExamQuestion[] = [];
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

    // Rải đều câu hỏi qua 6 chương theo 7 vòng (từ Chương I -> Chương VI)
    // để nội dung đề khảo nghiệm rải rác đều khắp 6 chương từ Câu 1 đến Câu 40.
    const interleavedQuestions: Grade11ExamQuestion[] = [];
    for (let round = 0; round < 7; round++) {
      for (let cIdx = 0; cIdx < 6; cIdx++) {
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
      id: `g11-${cfg.code}-q-${q.number}`,
      number: q.number,
      grade: '11',
      domain: 'husbandry',
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
      id: `g11-exam-${cfg.examNumber}`,
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

export const GRADE_11_PRACTICE_EXAMS: Grade11PracticeExam[] = buildGrade11PracticeExams();

export const GRADE_11_CHAPTER_EXAMS: Exam[] = CHAPTER_REVIEW_DATA.filter((ch) => ch.grade === '11').map(
  (ch, idx) => {
    const optionKeys = ['A', 'B', 'C', 'D'] as const;
    const code = `11C${idx + 1}`;
    const partI: MultipleChoiceQuestion[] = ch.mcqQuestions.map((q) => ({
      id: `${ch.id}-q-${q.number}`,
      number: q.number,
      grade: '11',
      domain: 'husbandry',
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
      textbookRef: `${ch.chapterNumber}: ${ch.chapterTitle} – SGK Công nghệ 11`,
    }));

    const partII: TrueFalseQuestion[] = (ch.tfQuestions || []).map((tf) => ({
      id: `${ch.id}-tf-${tf.number}`,
      number: tf.number,
      domain: 'husbandry',
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
      textbookRef: `${ch.chapterNumber}: ${ch.chapterTitle} – SGK Công nghệ 11`,
    }));

    return {
      id: `exam-${ch.id}`,
      code,
      title: `Đề Ôn Tập ${ch.chapterNumber}: ${ch.chapterTitle} (Công Nghệ 11)`,
      description: `35 câu trắc nghiệm (20 Nhận biết · 10 Thông hiểu · 5 Vận dụng) + 4 câu Đúng/Sai tình huống thực tế – ${ch.pageRef}`,
      durationMinutes: 45,
      partI,
      partII,
    };
  }
);

export interface Grade11ChapterMatrixExam extends Exam {
  chapterId: string;
  chapterNumber: string;
  chapterTitle: string;
  examIndexInChapter: number; // 1..5
  bietCount: number;
  hieuCount: number;
  vandungCount: number;
}

function buildGrade11ChapterMatrixExams(): Record<string, Grade11ChapterMatrixExam[]> {
  const result: Record<string, Grade11ChapterMatrixExam[]> = {};
  const optionKeys = ['A', 'B', 'C', 'D'] as const;
  const grade11Chapters = CHAPTER_REVIEW_DATA.filter((ch) => ch.grade === '11');

  grade11Chapters.forEach((ch, chIdx) => {
    const extraRaw = EXTRA_QUESTIONS_11_RAW[ch.id] || [];
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
        'husbandry'
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
    const lessonRef = CHAPTER_11_LESSON_MAP[ch.id] || ch.pageRef;

    const examsForChapter: Grade11ChapterMatrixExam[] = [];

    for (let examIdx = 0; examIdx < 5; examIdx++) {
      const examNum = examIdx + 1;
      const examCode = `11${chIdx + 1}${examNum}`; // VD: 1111..1115 cho Chương I, ..., 1161..1165 cho Chương VI

      // Chọn 24 câu trắc nghiệm nhiều lựa chọn chỉ sử dụng nội dung chương này:
      // 12 câu Nhận biết + 8 câu Thông hiểu + 4 câu Vận dụng = 24 câu
      const selectedMcqs: ChapterMCQItem[] = [];
      for (let i = 0; i < 12; i++) {
        selectedMcqs.push(bietPool[(examIdx * 5 + i) % bietPool.length]);
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
          id: `g11-ch-${ch.id}-e${examNum}-q${qNumber}`,
          number: qNumber,
          grade: '11',
          domain: 'husbandry',
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
          id: `g11-ch-${ch.id}-e${examNum}-tf${qNum}`,
          number: qNum,
          domain: 'husbandry',
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
        id: `g11-ch-exam-${ch.id}-${examNum}`,
        code: examCode,
        title: `Đề Số 0${examNum} – ${ch.chapterNumber}: ${ch.chapterTitle} (Công Nghệ 11)`,
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

export const GRADE_11_EXAMS_BY_CHAPTER: Record<string, Grade11ChapterMatrixExam[]> =
  buildGrade11ChapterMatrixExams();

export const ALL_GRADE_11_CHAPTER_MATRIX_EXAMS: Grade11ChapterMatrixExam[] =
  Object.values(GRADE_11_EXAMS_BY_CHAPTER).flat();

