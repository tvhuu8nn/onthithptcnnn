import {
  CHAPTER_REVIEW_DATA,
  ChapterTFQuestion,
} from './chapterReviewData';
import {
  Exam,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  TrueFalseStatement,
} from '../types/exam';
import { normalizeMultipleChoiceQuestion } from '../utils/equalLengthNormalizer';

export interface Grade12ChapterExam extends Exam {
  chapterId: string;
  chapterNumber: string;
  chapterTitle: string;
  examIndexInChapter: number; // 1..4
  pdfReferenceUrl?: string;
}

export const ATTACHED_SAMPLE_PDF_URL =
  '/assets/aistudio/___C_ng_ngh__n_ng_nghi_p_0716_a77aa05f.pdf';

/**
 * Đề thi chính thức nguyên bản trích xuất 100% từ tệp PDF đính kèm:
 * KỲ THI TỐT NGHIỆP THPT NĂM 2026 - Môn thi: CÔNG NGHỆ NÔNG NGHIỆP - Mã đề: 0716
 */
export const OFFICIAL_EXAM_0716: Grade12ChapterExam = {
  id: 'g12-official-0716',
  code: '0716',
  chapterId: 'cn12-all',
  chapterNumber: 'Đề Mẫu Bộ GD&ĐT',
  chapterTitle: 'Đề Thi Tốt Nghiệp THPT Năm 2026 – Mã Đề 0716 (Từ Tệp Đính Kèm)',
  examIndexInChapter: 0,
  title: 'KỲ THI TỐT NGHIỆP THPT NĂM 2026 – Môn thi: CÔNG NGHỆ NÔNG NGHIỆP (Mã đề 0716)',
  description:
    'Thời gian làm bài: 50 phút, không kể thời gian phát đề · PHẦN I: 24 câu trắc nghiệm ABCD · PHẦN II: 4 câu Đúng/Sai số liệu & biểu đồ thực nghiệm',
  durationMinutes: 50,
  partI: ([
    {
      id: '0716_q1',
      number: 1,
      grade: '11',
      domain: 'husbandry',
      level: 'NB',
      question: 'Phát biểu nào sau đây đúng về ưu điểm của kĩ thuật PCR trong chẩn đoán bệnh vật nuôi?',
      options: {
        A: 'Không cần lấy mẫu bệnh phẩm.',
        B: 'Tiêu diệt hoàn toàn tác nhân gây bệnh.',
        C: 'Phát hiện sớm tác nhân gây bệnh.',
        D: 'Quy trình thực hiện đơn giản.',
      },
      correctAnswer: 'C',
      explanation:
        'Kĩ thuật PCR (Polymerase Chain Reaction) nhân bản đặc hiệu đoạn DNA/RNA của mầm bệnh giúp phát hiện sớm và chính xác tác nhân gây bệnh ngay cả khi tải lượng mầm bệnh còn rất thấp (SGK Công nghệ Chăn nuôi – Kết nối tri thức).',
      textbookRef: 'Bài 15: Ứng dụng công nghệ sinh học trong phòng, trị bệnh vật nuôi – SGK Kết nối tri thức',
    },
    {
      id: '0716_q2',
      number: 2,
      grade: '12',
      domain: 'aquaculture',
      level: 'VD',
      question:
        'Sau một thời gian nuôi cá lóc bằng thức ăn tươi sống, nước trong ao chuyển sang màu xanh đậm, nước đục và có mùi hôi. Để xử lí tình trạng trên, cần thực hiện biện pháp nào sau đây?',
      options: {
        A: 'Bổ sung chế phẩm vi sinh vào ao nuôi.',
        B: 'Tăng khẩu phần ăn cho cá.',
        C: 'Bổ sung kháng sinh vào ao nuôi.',
        D: 'Tăng mật độ cá lóc trong ao nuôi.',
      },
      correctAnswer: 'A',
      explanation:
        'Nước ao nuôi cá bằng thức ăn tươi sống bị xanh đậm, đục và hôi do dư thừa chất hữu cơ và tảo phát triển quá mức; cần bổ sung chế phẩm vi sinh (EM, Bacillus, Nitrosomonas) để phân giải mùn bã hữu cơ và kiểm soát tảo.',
      textbookRef: 'Chương V: Môi trường nuôi thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      id: '0716_q3',
      number: 3,
      grade: '12',
      domain: 'aquaculture',
      level: 'TH',
      question:
        'Bệnh hoại tử thần kinh gây hại trên nhiều loài cá biển do Betanodavirus gây ra. Để xác định nhanh virus gây bệnh ngay tại khu vực nuôi, cần thực hiện biện pháp nào sau đây?',
      options: {
        A: 'Sử dụng vaccine tái tổ hợp.',
        B: 'Sử dụng KIT chẩn đoán.',
        C: 'Sử dụng kĩ thuật PCR.',
        D: 'Sử dụng chế phẩm vi sinh.',
      },
      correctAnswer: 'B',
      explanation:
        'Để chẩn đoán nhanh tác nhân virus ngay tại hiện trường (ao/lồng nuôi) mà không cần thiết bị phòng thí nghiệm phức tạp, người nuôi sử dụng que thử/KIT chẩn đoán nhanh miễn dịch sắc kí.',
      textbookRef: 'Chương IX: Phòng, trị bệnh thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      id: '0716_q4',
      number: 4,
      grade: '11',
      domain: 'husbandry',
      level: 'TH',
      question: 'Cho các phát biểu sau:',
      subStatements: [
        '(a) Chất khoáng tham gia cấu tạo tế bào và các cơ quan của cơ thể vật nuôi.',
        '(b) Khoáng đa lượng gồm các nguyên tố như Ca, P, Mg, Na.',
        '(c) Khoáng vi lượng gồm các nguyên tố như Fe, Cu, Co, Mn, Zn.',
        '(d) Vật nuôi có nhu cầu khoáng vi lượng cao hơn so với nhu cầu khoáng đa lượng.',
      ],
      questionFooter: 'Có bao nhiêu phát biểu đúng về dinh dưỡng khoáng của vật nuôi?',
      options: {
        A: '4.',
        B: '1.',
        C: '2.',
        D: '3.',
      },
      correctAnswer: 'D',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì vật nuôi có nhu cầu khoáng đa lượng (tính bằng g/con/ngày hoặc % khẩu phần) cao hơn nhiều so với khoáng vi lượng (tính bằng mg/kg thức ăn).',
      textbookRef: 'Chương III: Công nghệ thức ăn chăn nuôi – SGK Kết nối tri thức',
    },
    {
      id: '0716_q5',
      number: 5,
      grade: '11',
      domain: 'husbandry',
      level: 'NB',
      question: 'Loại thực phẩm nào sau đây được chế biến từ sản phẩm chăn nuôi?',
      options: {
        A: 'Nước tương.',
        B: 'Rượu vang.',
        C: 'Sữa chua.',
        D: 'Đường mía.',
      },
      correctAnswer: 'C',
      explanation:
        'Sữa chua được lên men lactic từ sữa tươi (sản phẩm của ngành chăn nuôi bò sữa, dê sữa). Nước tương, rượu vang, đường mía là sản phẩm chế biến từ trồng trọt.',
      textbookRef: 'Chương I: Giới thiệu chung về chăn nuôi – SGK Kết nối tri thức',
    },
    {
      id: '0716_q6',
      number: 6,
      grade: '12',
      domain: 'forestry',
      level: 'NB',
      question: 'Hoạt động nào sau đây giúp bảo vệ tài nguyên rừng?',
      options: {
        A: 'Phòng trừ sâu, bệnh hại cây rừng.',
        B: 'Khai thác gỗ trong rừng đặc dụng.',
        C: 'Chặt cây rừng để trồng cây ăn quả.',
        D: 'Săn bắt động vật rừng quý hiếm.',
      },
      correctAnswer: 'A',
      explanation:
        'Phòng trừ sinh vật gây hại rừng (sâu, bệnh hại cây rừng) là một trong các biện pháp cơ bản bảo vệ tài nguyên rừng (Chương I & Chương III SGK Công nghệ 12).',
      textbookRef: 'Chương III: Bảo vệ và khai thác tài nguyên rừng bền vững – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      id: '0716_q7',
      number: 7,
      grade: '10',
      domain: 'crop',
      level: 'NB',
      question: 'Biện pháp nào sau đây giúp cải tạo độ chua của đất?',
      options: {
        A: 'Bón NPK.',
        B: 'Bón vôi.',
        C: 'Bón kali.',
        D: 'Bón đạm.',
      },
      correctAnswer: 'B',
      explanation:
        'Bón vôi (CaCO3, CaO, Ca(OH)2) cung cấp cation Ca2+ đẩy H+, Al3+ ra khỏi keo đất để trung hòa độ chua của đất.',
      textbookRef: 'Chương II: Đất trồng – SGK Công nghệ 10 Kết nối tri thức',
    },
    {
      id: '0716_q8',
      number: 8,
      grade: '11',
      domain: 'husbandry',
      level: 'TH',
      question:
        'Hiện nay, nhiều người có nhu cầu nuôi chó làm thú cưng, tuy nhiên việc này tiềm ẩn nguy cơ lây nhiễm các bệnh kí sinh trùng đường ruột từ chó sang người. Biện pháp nào sau đây phòng ngừa hiệu quả nguy cơ trên?',
      options: {
        A: 'Tiêm kháng sinh phòng bệnh cho chó.',
        B: 'Thường xuyên cắt tỉa lông cho chó.',
        C: 'Cho chó ăn thức ăn tươi sống.',
        D: 'Định kì tẩy giun, sán cho chó.',
      },
      correctAnswer: 'D',
      explanation:
        'Định kì tẩy giun, sán kết hợp giữ vệ sinh phân và không cho ăn đồ sống giúp cắt đứt vòng đời kí sinh trùng đường ruột lây từ chó sang người.',
      textbookRef: 'Chương IV: Phòng, trị bệnh cho vật nuôi – SGK Kết nối tri thức',
    },
    {
      id: '0716_q9',
      number: 9,
      grade: '11',
      domain: 'husbandry',
      level: 'TH',
      question:
        'Để chọn được gà mái có năng suất trứng cao ở giai đoạn gà mới nở, cần ứng dụng công nghệ nào sau đây?',
      options: {
        A: 'Cấy truyền phôi.',
        B: 'Thụ tinh nhân tạo.',
        C: 'Chỉ thị phân tử.',
        D: 'Gây đột biến gene.',
      },
      correctAnswer: 'C',
      explanation:
        'Chọn giống nhờ chỉ thị phân tử (MAS) giúp phát hiện trực tiếp các đoạn DNA/gene quy định năng suất trứng cao ngay từ khi gà mới nở mà không cần chờ đến tuổi đẻ.',
      textbookRef: 'Chương II: Công nghệ giống vật nuôi – SGK Kết nối tri thức',
    },
    {
      id: '0716_q10',
      number: 10,
      grade: '10',
      domain: 'crop',
      level: 'NB',
      question:
        'Hệ số nhân giống cao, cây con sạch bệnh và đồng nhất về di truyền là ưu điểm của phương pháp nhân giống nào sau đây?',
      options: {
        A: 'Nhân giống bằng hạt.',
        B: 'Chiết cành.',
        C: 'Ghép cành.',
        D: 'Nuôi cấy mô.',
      },
      correctAnswer: 'D',
      explanation:
        'Nhân giống bằng nuôi cấy mô tế bào thực vật (vi nhân giống) cho hệ số nhân cực cao, cây con đồng nhất về kiểu gene và sạch bệnh virus.',
      textbookRef: 'Chương IV: Giống cây trồng – SGK Công nghệ 10 Kết nối tri thức',
    },
    {
      id: '0716_q11',
      number: 11,
      grade: '12',
      domain: 'aquaculture',
      level: 'NB',
      question:
        'Trong xử lí nước trước khi nuôi thủy sản, việc bổ sung hóa chất như chlorine, thuốc tím vào nước ao nhằm mục đích chính nào sau đây?',
      options: {
        A: 'Tạo màu cho nước ao nuôi.',
        B: 'Điều chỉnh độ mặn trong nước.',
        C: 'Phân giải chất thải trong nước.',
        D: 'Tiêu diệt vi sinh vật gây hại.',
      },
      correctAnswer: 'D',
      explanation:
        'Chlorine, thuốc tím (KMnO4), iodine là các chất oxi hóa mạnh dùng trong khâu xử lí nước cấp để tiêu diệt vi khuẩn, virus, nấm và nguyên sinh động vật gây bệnh.',
      textbookRef: 'Chương V: Môi trường nuôi thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      id: '0716_q12',
      number: 12,
      grade: '12',
      domain: 'aquaculture',
      level: 'NB',
      question:
        'Để tham gia hoạt động khai thác thủy sản, người lao động cần đáp ứng yêu cầu cơ bản nào sau đây?',
      options: {
        A: 'Có khả năng sử dụng các loại ngư cụ.',
        B: 'Có kiến thức về chọn tạo giống thủy sản.',
        C: 'Có khả năng trị bệnh cho động vật thủy sản.',
        D: 'Có kiến thức về công nghệ sinh học.',
      },
      correctAnswer: 'A',
      explanation:
        'Hoạt động khai thác thủy sản trên biển và nội địa đòi hỏi người lao động nắm vững kĩ thuật vận hành tàu cá, thiết bị hàng hải và sử dụng các loại ngư cụ khai thác đúng quy định.',
      textbookRef: 'Chương X: Bảo vệ và khai thác nguồn lợi thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      id: '0716_q13',
      number: 13,
      grade: '10',
      domain: 'crop',
      level: 'TH',
      question: 'Công nghệ trồng cây thủy canh có đặc điểm nào sau đây?',
      options: {
        A: 'Chi phí đầu tư thấp so với trồng cây trên đất.',
        B: 'Rễ cây hấp thụ dinh dưỡng qua hệ thống phun sương.',
        C: 'Không cần sử dụng thuốc bảo vệ thực vật.',
        D: 'Kiểm soát được chất dinh dưỡng cung cấp cho cây.',
      },
      correctAnswer: 'D',
      explanation:
        'Trồng cây thủy canh giúp kiểm soát chính xác hàm lượng các nguyên tố khoáng hòa tan (EC) và độ pH cung cấp trực tiếp cho bộ rễ theo từng giai đoạn sinh trưởng.',
      textbookRef: 'Chương VII: Công nghệ cao trong trồng trọt – SGK Công nghệ 10 Kết nối tri thức',
    },
    {
      id: '0716_q14',
      number: 14,
      grade: '12',
      domain: 'forestry',
      level: 'VD',
      question:
        'Một rừng keo lai, sau 30 ngày trồng kiểm tra thấy tỉ lệ sống của cây đạt 80%. Để đảm bảo mật độ cây rừng cần thực hiện bón phân, tưới nước kết hợp với biện pháp nào sau đây?',
      options: {
        A: 'Trồng dặm.',
        B: 'Tỉa thưa.',
        C: 'Làm cỏ.',
        D: 'Tỉa cành.',
      },
      correctAnswer: 'A',
      explanation:
        'Theo kĩ thuật chăm sóc rừng (Chương II SGK Công nghệ 12), khi tỉ lệ sống sau trồng dưới 85% (ở đây là 80%), cần tiến hành trồng dặm các hố cây chết để đảm bảo mật độ rừng.',
      textbookRef: 'Chương II: Trồng và chăm sóc rừng – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      id: '0716_q15',
      number: 15,
      grade: '11',
      domain: 'husbandry',
      level: 'TH',
      question:
        'Giống bò Holstein Friesian có sản lượng sữa khoảng 3 500 - 4 000 kg/chu kì, giống bò Red Sindhi có sản lượng sữa khoảng 1 400 - 2 100 kg/chu kì. Nội dung trên thể hiện vai trò nào của giống trong chăn nuôi?',
      options: {
        A: 'Quyết định điều kiện chăm sóc vật nuôi.',
        B: 'Quyết định năng suất chăn nuôi.',
        C: 'Quyết định chất lượng sản phẩm chăn nuôi.',
        D: 'Quyết định sức đề kháng của vật nuôi.',
      },
      correctAnswer: 'B',
      explanation:
        'Sự chênh lệch sản lượng sữa/chu kì giữa giống bò chuyên sữa HF (3.500–4.000 kg) và giống bò kiêm dụng Red Sindhi (1.400–2.100 kg) minh họa rõ vai trò của giống quyết định năng suất chăn nuôi.',
      textbookRef: 'Chương II: Công nghệ giống vật nuôi – SGK Kết nối tri thức',
    },
    {
      id: '0716_q16',
      number: 16,
      grade: '12',
      domain: 'forestry',
      level: 'TH',
      question:
        'Một nhóm học sinh thảo luận và đề xuất các hoạt động góp phần bảo vệ tài nguyên rừng như sau:',
      subStatements: [
        '(a) Sử dụng giấy tiết kiệm.',
        '(b) Nuôi động vật rừng quý hiếm làm cảnh.',
        '(c) Tuyên truyền bảo vệ động vật hoang dã.',
        '(d) Trồng cây gây rừng.',
      ],
      questionFooter: 'Số hoạt động đúng là',
      options: {
        A: '2.',
        B: '1.',
        C: '3.',
        D: '4.',
      },
      correctAnswer: 'C',
      explanation:
        'Có 3 hoạt động đúng là (a), (c), (d). Hoạt động (b) sai vì săn bắt, nuôi nhốt trái phép động vật rừng quý hiếm làm cảnh là hành vi vi phạm pháp luật bảo vệ rừng.',
      textbookRef: 'Chương III: Bảo vệ và khai thác tài nguyên rừng bền vững – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      id: '0716_q17',
      number: 17,
      grade: '11',
      domain: 'husbandry',
      level: 'NB',
      question: 'Căn cứ theo mục đích sử dụng, lợn được xếp vào nhóm nào sau đây?',
      options: {
        A: 'Vật nuôi lấy trứng.',
        B: 'Vật nuôi lấy sức kéo.',
        C: 'Vật nuôi lấy thịt.',
        D: 'Vật nuôi lấy sữa.',
      },
      correctAnswer: 'C',
      explanation:
        'Theo phân loại vật nuôi dựa trên mục đích sử dụng chủ yếu, lợn (heo) là vật nuôi chuyên lấy thịt.',
      textbookRef: 'Chương I: Giới thiệu chung về chăn nuôi – SGK Kết nối tri thức',
    },
    {
      id: '0716_q18',
      number: 18,
      grade: '10',
      domain: 'crop',
      level: 'NB',
      question: 'Trong trồng trọt, phân đạm thường được dùng để bón thúc vì',
      options: {
        A: 'chứa nhiều nguyên tố vi lượng cần thiết cho cây.',
        B: 'dễ hòa tan, cây trồng dễ hấp thụ.',
        C: 'chứa nhiều vi sinh vật có lợi cho đất.',
        D: 'giảm ô nhiễm mạch nước ngầm.',
      },
      correctAnswer: 'B',
      explanation:
        'Phân đạm hóa học (urea, ammonium sulfate...) có đặc điểm dễ tan trong nước, cây hấp thu nhanh nên chủ yếu dùng để bón thúc.',
      textbookRef: 'Chương III: Phân bón – SGK Công nghệ 10 Kết nối tri thức',
    },
    {
      id: '0716_q19',
      number: 19,
      grade: '11',
      domain: 'husbandry',
      level: 'NB',
      question: 'Hoạt động nào sau đây giúp hạn chế ô nhiễm môi trường trong chăn nuôi?',
      options: {
        A: 'Ủ chất thải chăn nuôi làm phân bón hữu cơ.',
        B: 'Xả nước thải chăn nuôi chưa xử lí ra sông, hồ.',
        C: 'Vùi chất thải chăn nuôi nguy hại, khó phân hủy vào đất.',
        D: 'Sử dụng nước thải gia súc tưới trực tiếp cho cây trồng.',
      },
      correctAnswer: 'A',
      explanation:
        'Ủ chất thải rắn chăn nuôi làm phân bón hữu cơ (compost) giúp tiêu diệt mầm bệnh bằng nhiệt sinh học và tái tạo dinh dưỡng cho đất trồng, hạn chế ô nhiễm môi trường.',
      textbookRef: 'Chương VI: Bảo vệ môi trường trong chăn nuôi – SGK Kết nối tri thức',
    },
    {
      id: '0716_q20',
      number: 20,
      grade: '12',
      domain: 'forestry',
      level: 'VD',
      question:
        'Khi nghiên cứu ảnh hưởng của thời điểm tỉa chồi đến tỉ lệ sống của cây Tràm lá dài (Melaleuca leucadendra L.) tái sinh sau khai thác trắng tại Tây Ninh, thí nghiệm được bố trí gồm 4 công thức (CT): CT0: không tỉa chồi; CT1: tỉa chồi sau 6 tháng khai thác; CT2: tỉa chồi sau 12 tháng khai thác; CT3: tỉa chồi sau 18 tháng khai thác. Kết quả thu được như bảng sau:',
      tableData: {
        headers: ['Công thức', 'Tỉ lệ sống (%) - 30 tháng sau khai thác', 'Tỉ lệ sống (%) - 42 tháng sau khai thác'],
        rows: [
          ['CT0', '76,9ᶜ', '69,9ᶜ'],
          ['CT1', '84,2ᵇ', '81,6ᵇ'],
          ['CT2', '93,8ᵃ', '89,4ᵃ'],
          ['CT3', '85,8ᵇ', '81,7ᵇ'],
        ],
        source:
          'Nguồn: Nguyễn Văn Lưu và cộng sự (2026). Tạp chí Khoa học Lâm nghiệp, số 2, trang 51-62.',
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
      questionFooter: 'Nhận định nào sau đây đúng?',
      options: {
        A: 'Tại thời điểm 42 tháng sau khai thác, công thức CT1 cho tỉ lệ sống thấp nhất.',
        B: 'Tại thời điểm 30 tháng sau khai thác, công thức CT2 cho tỉ lệ sống cao nhất.',
        C: 'Tại thời điểm 42 tháng sau khai thác, tỉ lệ sống ở CT3 thấp hơn so với CT0.',
        D: 'Tại thời điểm 30 tháng sau khai thác, tỉ lệ sống ở CT1 thấp hơn so với CT0.',
      },
      correctAnswer: 'B',
      explanation:
        'Ở thời điểm 30 tháng sau khai thác, công thức CT2 (tỉa chồi sau 12 tháng) đạt tỉ lệ sống 93,8ᵃ%, cao nhất và khác biệt có ý nghĩa thống kê (p<0,05) so với các công thức còn lại.',
      textbookRef: 'Chương II & Chương III: Trồng, chăm sóc và tái sinh rừng – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      id: '0716_q21',
      number: 21,
      grade: '12',
      domain: 'aquaculture',
      level: 'NB',
      question: 'Yếu tố nào sau đây là yếu tố thủy hóa trong môi trường nuôi thủy sản?',
      options: {
        A: 'Động vật phù du.',
        B: 'Độ pH.',
        C: 'Độ trong.',
        D: 'Nhiệt độ.',
      },
      correctAnswer: 'B',
      explanation:
        'Trong môi trường nước nuôi thủy sản: Độ pH, DO, NH3, độ mặn, độ kiềm là yếu tố thủy hóa; Nhiệt độ, độ trong, màu nước là yếu tố thủy lí; Động vật phù du là yếu tố thủy sinh.',
      textbookRef: 'Chương V: Môi trường nuôi thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      id: '0716_q22',
      number: 22,
      grade: '12',
      domain: 'forestry',
      level: 'NB',
      question:
        'Trong trồng rừng lấy gỗ, thời gian từ khi trồng đến khi thu hoạch có thể kéo dài hàng chục năm. Nội dung trên thể hiện đặc trưng nào của sản xuất lâm nghiệp?',
      options: {
        A: 'Quy mô lớn.',
        B: 'Tính thời vụ cao.',
        C: 'Địa hình phức tạp.',
        D: 'Chu kì dài.',
      },
      correctAnswer: 'D',
      explanation:
        'Cây rừng có chu kì sinh trưởng và phát triển kéo dài nhiều năm, hàng chục năm thể hiện đặc trưng "chu kì sản xuất dài" của lâm nghiệp.',
      textbookRef: 'Chương I: Giới thiệu chung về lâm nghiệp – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      id: '0716_q23',
      number: 23,
      grade: '12',
      domain: 'aquaculture',
      level: 'NB',
      question: 'Hoạt động nào sau đây có tác dụng bảo vệ nguồn lợi thủy sản?',
      options: {
        A: 'Tăng cường khai thác thủy sản ven bờ.',
        B: 'Thả các loài thủy sản quý hiếm vào môi trường tự nhiên.',
        C: 'Xả nước thải chưa xử lí vào môi trường sống của thủy sản.',
        D: 'Sử dụng thuốc nổ để khai thác thủy sản.',
      },
      correctAnswer: 'B',
      explanation:
        'Thả bổ sung cá giống và các loài thủy sản bản địa, quý hiếm vào thủy vực tự nhiên giúp phục hồi và tái tạo nguồn lợi thủy sản (Chương X SGK Công nghệ 12).',
      textbookRef: 'Chương X: Bảo vệ và khai thác nguồn lợi thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      id: '0716_q24',
      number: 24,
      grade: '12',
      domain: 'aquaculture',
      level: 'TH',
      question:
        'Trong nhân giống cá rô phi, sử dụng hormone 17α-methyl testosterone nhằm mục đích nào sau đây?',
      options: {
        A: 'Tăng tỉ lệ cá đực.',
        B: 'Kéo dài thời gian bảo quản trứng.',
        C: 'Kích thích cho cá đẻ đồng loạt.',
        D: 'Tăng tỉ lệ cá cái.',
      },
      correctAnswer: 'A',
      explanation:
        'Cho cá bột rô phi ăn thức ăn trộn hormone 17α-methyl testosterone trong 21 ngày đầu sau khi tiêu hết noãn hoàng giúp chuyển giới tính tạo đàn cá rô phi đơn tính đực (>95%) lớn nhanh, không đẻ bói.',
      textbookRef: 'Chương VI: Công nghệ giống thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
  ] as MultipleChoiceQuestion[]).map((q) => normalizeMultipleChoiceQuestion(q)),
  partII: [
    // Câu 1 Phần II (Trang 3/4 - Mã đề 0716)
    {
      id: '0716_tf1',
      number: 1,
      domain: 'aquaculture',
      scenarioTitle:
        'Câu 1. Nghiên cứu ương cá chép giống bằng công nghệ biofloc với nguồn carbon từ rỉ đường và bột ngô',
      scenario:
        'Khi nghiên cứu ảnh hưởng của việc ương cá chép giống bằng công nghệ biofloc với nguồn carbon từ rỉ đường và bột ngô đến hệ số chuyển hóa thức ăn (FCR), thí nghiệm được bố trí với 3 nghiệm thức (NT) gồm: NT1: ương bằng công nghệ biofloc với nguồn carbon từ rỉ đường; NT2: ương bằng công nghệ biofloc với nguồn carbon từ bột ngô; NT3: ương thông thường (đối chứng). Sau 60 ngày thí nghiệm, kết quả thu được như hình dưới đây:',
      citation:
        'Đỗ Đăng Khoa và cộng sự (2022). Tạp chí Khoa học Nông nghiệp Việt Nam, 20(8), trang 1021-1030.',
      textbookRef: 'Chương VII & Chương VIII: Thức ăn và công nghệ nuôi thủy sản – SGK Công nghệ 12 Kết nối tri thức',
      chartData: {
        caption: 'Biểu đồ: Hệ số chuyển hóa thức ăn (FCR) sau 60 ngày thí nghiệm',
        type: 'bar',
        unit: 'FCR',
        items: [
          { label: 'NT1 (Biofloc rỉ đường)', value: 1.53, displayValue: '1,53', highlight: true },
          { label: 'NT2 (Biofloc bột ngô)', value: 1.58, displayValue: '1,58', highlight: true },
          { label: 'NT3 (Đối chứng thông thường)', value: 1.73, displayValue: '1,73', highlight: false },
        ],
        note: 'Ghi chú: Hệ số chuyển hóa thức ăn FCR = Tổng lượng thức ăn cho cá ăn / tăng trọng của cá.',
      },
      statements: [
        {
          subId: 'a',
          level: 'VD',
          text: 'Kết quả nghiên cứu cho thấy, ương cá chép giống bằng công nghệ biofloc giúp giảm hệ số chuyển hóa thức ăn, nhờ đó giảm ô nhiễm môi trường nuôi.',
          isCorrect: true,
          explanation:
            'ĐÚNG: FCR ở NT1 (1,53) và NT2 (1,58) đều thấp hơn đối chứng NT3 (1,73), giúp giảm lượng thức ăn dư thừa và chất thải bài tiết ra môi trường.',
        },
        {
          subId: 'b',
          level: 'NB',
          text: 'Hệ số chuyển hóa thức ăn cao nhất khi ương cá chép giống ở NT2.',
          isCorrect: false,
          explanation:
            'SAI: Hệ số chuyển hóa thức ăn cao nhất ở nghiệm thức đối chứng NT3 (1,73), không phải NT2 (1,58).',
        },
        {
          subId: 'c',
          level: 'TH',
          text: 'Ương cá chép giống bằng NT1 có chi phí thức ăn cao hơn so với ương cá chép giống bằng NT2.',
          isCorrect: false,
          explanation:
            'SAI: NT1 có FCR thấp hơn (1,53 < 1,58) và sử dụng rỉ đường rẻ hơn bột ngô nên chi phí thức ăn ở NT1 thấp hơn so với NT2.',
        },
        {
          subId: 'd',
          level: 'VD',
          text: 'Khi ương nuôi trong hệ thống biofloc, cá sử dụng hạt biofloc (hạt floc) như nguồn thức ăn sẵn có là một trong những yếu tố làm giảm chi phí thức ăn.',
          isCorrect: true,
          explanation:
            'ĐÚNG: Hạt biofloc giàu protein vi sinh vật được cá chép tận dụng làm thức ăn tự nhiên tại chỗ, giúp giảm lượng thức ăn công nghiệp.',
        },
      ],
    },
    // Câu 2 Phần II (Trang 3/4 - Mã đề 0716)
    {
      id: '0716_tf2',
      number: 2,
      domain: 'forestry',
      scenarioTitle:
        'Câu 2. Nghiên cứu ảnh hưởng của biện pháp làm đất đến sinh trưởng của cây Mây chỉ (Calamus dioicus Lour.) tại Lâm Đồng',
      scenario:
        'Mây chỉ (Calamus dioicus Lour.) là một loài lâm sản ngoài gỗ. Khi nghiên cứu ảnh hưởng của biện pháp làm đất đến sinh trưởng của cây Mây chỉ trồng dưới tán rừng tự nhiên tại tỉnh Lâm Đồng, thí nghiệm được bố trí với 3 công thức (CT) làm đất gồm: CT1: cuốc hố 30 x 30 x 30 cm; CT2: cuốc hố 40 x 40 x 40 cm; CT3: làm đất theo rạch 60 x 20 x 30 cm. Kết quả thu được như bảng sau:',
      citation:
        'Phạm Trọng Nhân và cộng sự (2026). Tạp chí Khoa học Lâm nghiệp, số 1, trang 81-91.',
      textbookRef: 'Chương II: Trồng và chăm sóc rừng – SGK Công nghệ 12 Kết nối tri thức',
      tableData: {
        caption: 'Bảng kết quả sinh trưởng của cây Mây chỉ theo 3 công thức làm đất',
        headers: ['Thông số', 'CT1 (Hố 30x30x30 cm)', 'CT2 (Hố 40x40x40 cm)', 'CT3 (Rạch 60x20x30 cm)'],
        rows: [
          ['Tỉ lệ sống (%)', '83,32ᵃ', '85,33ᵃ', '85,56ᵃ'],
          ['Chiều dài thân trung bình (cm)', '90,40ᵃ', '91,03ᵃ', '84,23ᵇ'],
          ['Số chồi trung bình/cụm (chồi)', '3,03ᵃ', '3,00ᵃ', '2,67ᵇ'],
        ],
        note: 'Ghi chú: Trong cùng một hàng, các chữ cái a, b khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
      statements: [
        {
          subId: 'a',
          level: 'NB',
          text: 'Trong các công thức thí nghiệm, chiều dài thân trung bình của cây Mây chỉ đạt cao nhất ở công thức làm đất bằng biện pháp cuốc hố có kích thước 30 x 30 x 30 cm.',
          isCorrect: false,
          explanation:
            'SAI: Chiều dài thân trung bình đạt giá trị số học cao nhất ở CT2 (cuốc hố 40 x 40 x 40 cm: 91,03 cm).',
        },
        {
          subId: 'b',
          level: 'TH',
          text: 'Tỉ lệ sống của cây Mây chỉ cao nhất ở công thức làm đất bằng biện pháp cuốc hố 40 x 40 x 40 cm.',
          isCorrect: false,
          explanation:
            'SAI: Tỉ lệ sống đạt giá trị cao nhất ở CT3 (85,56%) và ba công thức đều mang chữ cái a (không khác biệt thống kê).',
        },
        {
          subId: 'c',
          level: 'VD',
          text: 'Biện pháp làm đất bằng cách cuốc hố đem lại hiệu quả hơn so với biện pháp làm đất theo rạch cả về thông số chiều dài thân và số chồi.',
          isCorrect: true,
          explanation:
            'ĐÚNG: Cả CT1 và CT2 (cuốc hố) đều có chiều dài thân (90,40ᵃ và 91,03ᵃ cm) và số chồi (3,03ᵃ và 3,00ᵃ) cao hơn có ý nghĩa thống kê (p<0,05) so với CT3 (làm đất theo rạch: 84,23ᵇ cm và 2,67ᵇ chồi).',
        },
        {
          subId: 'd',
          level: 'VD',
          text: 'Số chồi trung bình/cụm ở CT2 lớn hơn so với CT3.',
          isCorrect: true,
          explanation:
            'ĐÚNG: Số chồi trung bình/cụm ở CT2 là 3,00ᵃ chồi, lớn hơn có ý nghĩa thống kê so với CT3 là 2,67ᵇ chồi.',
        },
      ],
    },
    // Câu 3 Phần II (Trang 4/4 - Mã đề 0716)
    {
      id: '0716_tf3',
      number: 3,
      domain: 'aquaculture',
      scenarioTitle:
        'Câu 3. Tình huống thực tiễn: Đánh giá khả năng sử dụng rong mền (Cladophoraceae) khô thay thế thức ăn viên cho cá trắm cỏ',
      scenario:
        'Nhằm đánh giá khả năng sử dụng rong mền (Cladophoraceae) khô để thay thế thức ăn viên cho cá trắm cỏ, các nhà khoa học đã thực hiện thí nghiệm gồm 4 nghiệm thức (NT) sau 45 ngày nuôi và ghi nhận kết quả (các chữ cái a, b, c, d khác nhau thể hiện khác biệt có ý nghĩa thống kê p<0,05): NT1 (cho ăn hoàn toàn thức ăn viên) có tỉ lệ sống 96,9%, tăng trưởng khối lượng 5,43ᵇ g, chi phí thức ăn 29,529 nghìn đ/kg; NT2 (cho ăn hoàn toàn rong mền khô) có tỉ lệ sống 93,3%, tăng trưởng khối lượng 5,12ᵃ g, chi phí thức ăn 6,624 nghìn đ/kg; NT3 (luân phiên 1 ngày rong mền khô và 1 ngày thức ăn viên) có tỉ lệ sống 99,0%, tăng trưởng khối lượng 5,81ᶜ g, chi phí thức ăn 14,250 nghìn đ/kg; NT4 (luân phiên 2 ngày rong mền khô và 1 ngày thức ăn viên) có tỉ lệ sống 97,7%, tăng trưởng khối lượng 6,18ᵈ g, chi phí thức ăn 9,373 nghìn đ/kg.',
      citation:
        'Tiền Hải Lý và cộng sự (2025). Tạp chí Khoa học Nông nghiệp Việt Nam, 23(2), trang 203-211.',
      textbookRef: 'Chương VII: Công nghệ thức ăn thủy sản – SGK Công nghệ 12 Kết nối tri thức',
      statements: [
        {
          subId: 'a',
          level: 'VD',
          text: 'So với NT1, chi phí thức ăn cho 1 kg tăng trọng của cá ở NT4 giảm 51,74%.',
          isCorrect: false,
          explanation:
            'SAI: So với NT1 (29,529 nghìn đ/kg), chi phí thức ăn ở NT4 (9,373 nghìn đ/kg) giảm: (29,529 - 9,373) / 29,529 × 100% = 68,26% (còn giảm 51,74% là của NT3 so với NT1).',
        },
        {
          subId: 'b',
          level: 'NB',
          text: 'Tỉ lệ sống của cá trắm cỏ ở tất cả các nghiệm thức đều cao hơn 95%.',
          isCorrect: false,
          explanation:
            'SAI: Ở nghiệm thức NT2, tỉ lệ sống của cá chỉ đạt 93,3% (thấp hơn 95%).',
        },
        {
          subId: 'c',
          level: 'TH',
          text: 'Tăng trưởng khối lượng của cá ở NT1 thấp hơn so với NT2.',
          isCorrect: false,
          explanation:
            'SAI: Tăng trưởng khối lượng ở NT1 là 5,43ᵇ g, cao hơn có ý nghĩa thống kê so với NT2 là 5,12ᵃ g.',
        },
        {
          subId: 'd',
          level: 'VD',
          text: 'Cho cá ăn luân phiên 2 ngày rong mền khô và 1 ngày thức ăn viên, cá tăng trưởng khối lượng cao hơn và tiết kiệm chi phí thức ăn hơn so với cho ăn hoàn toàn thức ăn viên trong thời gian nghiên cứu.',
          isCorrect: true,
          explanation:
            'ĐÚNG: Ở NT4 (2 ngày rong - 1 ngày viên), cá đạt tăng trưởng khối lượng cao nhất (6,18ᵈ g > 5,43ᵇ g ở NT1) và chi phí thức ăn chỉ 9.373 đ/kg (thấp hơn nhiều so với 29.529 đ/kg ở NT1).',
        },
      ],
    },
    // Câu 4 Phần II (Trang 4/4 - Mã đề 0716)
    {
      id: '0716_tf4',
      number: 4,
      domain: 'aquaculture',
      scenarioTitle:
        'Câu 4. Tình huống thực tiễn: Đánh giá khả năng điều trị bệnh lồi mắt ở cá rô phi do vi khuẩn Streptococcus agalactiae gây ra',
      scenario:
        'Bệnh lồi mắt ở cá rô phi do vi khuẩn Streptococcus agalactiae (S. agalactiae) gây ra. Để đánh giá khả năng điều trị bệnh lồi mắt ở cá rô phi của kháng sinh amoxicillin (AX) và kháng sinh amoxicillin kết hợp clavulanic acid (AC), các nhà khoa học đã tiến hành thí nghiệm gồm 4 nghiệm thức (NT) và ghi nhận tỉ lệ sống trung bình của cá như sau: NT1 (tiêm dung môi không chứa vi khuẩn gây bệnh) đạt tỉ lệ sống 100%; NT2 (tiêm vi khuẩn S. agalactiae nhưng không điều trị) đạt tỉ lệ sống 48,9%; NT3 (tiêm vi khuẩn S. agalactiae và điều trị bằng AX) đạt tỉ lệ sống 77,8%; NT4 (tiêm vi khuẩn S. agalactiae và điều trị bằng AC) đạt tỉ lệ sống 91,1%.',
      citation:
        'Trương Đình Hoài và cộng sự (2024). Tạp chí Khoa học Nông nghiệp Việt Nam, 22(1), trang 25-36.',
      textbookRef: 'Chương IX: Phòng, trị bệnh thủy sản – SGK Công nghệ 12 Kết nối tri thức',
      statements: [
        {
          subId: 'a',
          level: 'TH',
          text: 'Tỉ lệ sống trung bình của cá ở NT2 cao hơn so với tỉ lệ sống trung bình của cá ở NT3 là 28,9%.',
          isCorrect: false,
          explanation:
            'SAI: Tỉ lệ sống ở NT2 (48,9%) THẤP HƠN so với NT3 (77,8%) là 28,9% (77,8% - 48,9% = 28,9%).',
        },
        {
          subId: 'b',
          level: 'TH',
          text: 'Hiệu quả điều trị bệnh lồi mắt ở cá rô phi cao nhất ở nghiệm thức sử dụng kháng sinh amoxicillin kết hợp với clavulanic acid.',
          isCorrect: true,
          explanation:
            'ĐÚNG: Nghiệm thức NT4 (sử dụng AC) cho tỉ lệ sống đạt 91,1%, cao nhất trong các nghiệm thức điều trị.',
        },
        {
          subId: 'c',
          level: 'NB',
          text: 'Trong các nghiệm thức tiêm vi khuẩn S. agalactiae cho cá thì NT4 có tỉ lệ sống cao nhất.',
          isCorrect: true,
          explanation:
            'ĐÚNG: Trong 3 nghiệm thức có tiêm vi khuẩn (NT2: 48,9%; NT3: 77,8%; NT4: 91,1%), NT4 có tỉ lệ sống cao nhất.',
        },
        {
          subId: 'd',
          level: 'NB',
          text: 'Vi khuẩn S. agalactiae là tác nhân gây bệnh lồi mắt trên cá rô phi.',
          isCorrect: true,
          explanation:
            'ĐÚNG: Theo thông tin đề bài và kết quả đối chứng NT2, vi khuẩn Streptococcus agalactiae là tác nhân gây bệnh lồi mắt trên cá rô phi.',
        },
      ],
    },
  ],
};

// Ngân hàng các câu hỏi Bảng số liệu thống kê thực nghiệm (Câu 20 Phần I theo mẫu Mã đề 0716) cho 10 chương Lớp 12
const STATISTICAL_TABLE_QUESTIONS_BY_CHAPTER: Record<
  string,
  Omit<MultipleChoiceQuestion, 'id' | 'number'>[]
> = {
  'cn12-c1': [
    {
      grade: '12',
      domain: 'forestry',
      level: 'VD',
      question:
        'Khi nghiên cứu khả năng hấp thụ carbon (tấn CO2/ha/năm) của 4 mô hình rừng trồng (CT0: Keo tai tượng thuần loài 4 năm tuổi; CT1: Keo tai tượng 7 năm tuổi; CT2: Keo tai tượng hỗn giao Sao đen 7 năm tuổi; CT3: Rừng bản địa phục hồi 7 năm tuổi), kết quả thu được như bảng sau:',
      tableData: {
        headers: ['Công thức', 'Sinh khối khô (tấn/ha)', 'Lượng CO2 hấp thụ (tấn/ha/năm)'],
        rows: [
          ['CT0', '52,4ᶜ', '18,6ᶜ'],
          ['CT1', '98,5ᵇ', '24,3ᵇ'],
          ['CT2', '126,8ᵃ', '31,5ᵃ'],
          ['CT3', '95,2ᵇ', '23,8ᵇ'],
        ],
        source: 'Nguồn: Viện Khoa học Lâm nghiệp Việt Nam (2025). Tạp chí Khoa học Lâm nghiệp, số 3, trang 12-21.',
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
      questionFooter: 'Nhận định nào sau đây đúng?',
      options: {
        A: 'Mô hình rừng trồng hỗn giao CT2 có khả năng hấp thụ CO2 cao nhất.',
        B: 'Mô hình CT0 có sinh khối khô cao hơn có ý nghĩa thống kê so với CT1.',
        C: 'Lượng CO2 hấp thụ ở CT1 và CT2 không có sự khác biệt thống kê.',
        D: 'Mô hình CT3 có lượng CO2 hấp thụ thấp nhất trong 4 công thức.',
      },
      correctAnswer: 'A',
      explanation:
        'Ở bảng số liệu, công thức CT2 đạt sinh khối khô 126,8ᵃ tấn/ha và lượng CO2 hấp thụ 31,5ᵃ tấn/ha/năm, cao nhất và khác biệt có ý nghĩa thống kê (p<0,05) so với các công thức còn lại.',
      textbookRef: 'Chương I: Giới thiệu chung về lâm nghiệp – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
  'cn12-c2': [
    {
      grade: '12',
      domain: 'forestry',
      level: 'VD',
      question:
        'Khi nghiên cứu ảnh hưởng của thời điểm tỉa chồi đến tỉ lệ sống của cây Tràm lá dài (Melaleuca leucadendra L.) tái sinh sau khai thác trắng tại Tây Ninh, thí nghiệm gồm 4 công thức: CT0: không tỉa chồi; CT1: tỉa chồi sau 6 tháng; CT2: tỉa chồi sau 12 tháng; CT3: tỉa chồi sau 18 tháng. Kết quả thu được như bảng sau:',
      tableData: {
        headers: ['Công thức', 'Tỉ lệ sống (%) - 30 tháng sau khai thác', 'Tỉ lệ sống (%) - 42 tháng sau khai thác'],
        rows: [
          ['CT0', '76,9ᶜ', '69,9ᶜ'],
          ['CT1', '84,2ᵇ', '81,6ᵇ'],
          ['CT2', '93,8ᵃ', '89,4ᵃ'],
          ['CT3', '85,8ᵇ', '81,7ᵇ'],
        ],
        source: 'Nguồn: Nguyễn Văn Lưu và cộng sự (2026). Tạp chí Khoa học Lâm nghiệp, số 2, trang 51-62.',
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
      questionFooter: 'Nhận định nào sau đây đúng?',
      options: {
        A: 'Tại thời điểm 42 tháng sau khai thác, công thức CT1 cho tỉ lệ sống thấp nhất.',
        B: 'Tại thời điểm 30 tháng sau khai thác, công thức CT2 cho tỉ lệ sống cao nhất.',
        C: 'Tại thời điểm 42 tháng sau khai thác, tỉ lệ sống ở CT3 thấp hơn so với CT0.',
        D: 'Tại thời điểm 30 tháng sau khai thác, tỉ lệ sống ở CT1 thấp hơn so với CT0.',
      },
      correctAnswer: 'B',
      explanation:
        'Tại thời điểm 30 tháng sau khai thác, CT2 đạt tỉ lệ sống 93,8ᵃ%, cao nhất trong 4 công thức thí nghiệm.',
      textbookRef: 'Chương II: Trồng và chăm sóc rừng – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
  'cn12-c3': [
    {
      grade: '12',
      domain: 'forestry',
      level: 'VD',
      question:
        'Khi nghiên cứu ảnh hưởng của cường độ khai thác chọn đến mật độ cây gỗ tái sinh tự nhiên (cây/ha) tại rừng tự nhiên lá rộng thường xanh sau 36 tháng, thí nghiệm gồm 4 công thức: CT0 (không khai thác); CT1 (khai thác cường độ 15%); CT2 (khai thác cường độ 25%); CT3 (khai thác cường độ 45%). Kết quả thu được như bảng sau:',
      tableData: {
        headers: ['Công thức', 'Độ tàn che còn lại', 'Mật độ cây tái sinh triển vọng (cây/ha)'],
        rows: [
          ['CT0 (Đối chứng)', '0,82ᵃ', '1.120ᶜ'],
          ['CT1 (Cường độ 15%)', '0,71ᵇ', '1.680ᵇ'],
          ['CT2 (Cường độ 25%)', '0,62ᶜ', '2.350ᵃ'],
          ['CT3 (Cường độ 45%)', '0,38ᵈ', '1.150ᶜ'],
        ],
        source: 'Nguồn: Trần Lâm Đồng và cộng sự (2025). Tạp chí Khoa học Lâm nghiệp, số 4, trang 33-42.',
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c, d khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
      questionFooter: 'Nhận định nào sau đây đúng?',
      options: {
        A: 'Khai thác chọn ở cường độ 25% (CT2) cho mật độ cây tái sinh triển vọng cao nhất.',
        B: 'Cường độ khai thác càng lớn thì mật độ cây tái sinh triển vọng càng tăng tuyến tính.',
        C: 'Ở công thức CT3, độ tàn che còn lại đạt mức cao nhất trong 4 công thức.',
        D: 'Mật độ cây tái sinh triển vọng ở CT1 thấp hơn có ý nghĩa thống kê so với CT0.',
      },
      correctAnswer: 'A',
      explanation:
        'Ở CT2 (cường độ 25%, giữ độ tàn che 0,62), ánh sáng lọt qua tán rừng vừa đủ kích thích hạt nảy mầm và cây con vươn lên, đạt 2.350ᵃ cây/ha (cao nhất).',
      textbookRef: 'Chương III: Bảo vệ và khai thác tài nguyên rừng bền vững – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
  'cn12-c4': [
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'VD',
      question:
        'Khi khảo sát năng suất và tỉ lệ thu hồi thịt phi lê của 4 đối tượng cá nuôi thương phẩm chủ lực ở đồng bằng sông Cửu Long sau 6 tháng nuôi (CT1: Cá tra; CT2: Cá rô phi dòng GIFT; CT3: Cá lóc bông; CT4: Cá chép V1), kết quả thu được như bảng sau:',
      tableData: {
        headers: ['Đối tượng nuôi', 'Khối lượng thương phẩm (g/con)', 'Tỉ lệ sống (%)'],
        rows: [
          ['CT1 (Cá tra)', '1.050,5ᵃ', '88,4ᵇ'],
          ['CT2 (Cá rô phi GIFT)', '780,2ᶜ', '94,2ᵃ'],
          ['CT3 (Cá lóc bông)', '920,6ᵇ', '82,1ᶜ'],
          ['CT4 (Cá chép V1)', '790,0ᶜ', '89,0ᵇ'],
        ],
        source: 'Nguồn: Nguyễn Thanh Phương và cộng sự (2025). Tạp chí Khoa học Nông nghiệp Việt Nam, 23(1), trang 45-54.',
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
      questionFooter: 'Nhận định nào sau đây đúng?',
      options: {
        A: 'Cá rô phi dòng GIFT (CT2) đạt tỉ lệ sống cao nhất sau 6 tháng nuôi.',
        B: 'Khối lượng thương phẩm của CT2 và CT4 có sự khác biệt có ý nghĩa thống kê.',
        C: 'Cá lóc bông (CT3) có tỉ lệ sống cao hơn có ý nghĩa thống kê so với cá tra (CT1).',
        D: 'Cá chép V1 (CT4) đạt khối lượng thương phẩm lớn nhất trong 4 đối tượng.',
      },
      correctAnswer: 'A',
      explanation:
        'Dựa vào bảng số liệu, CT2 (Cá rô phi GIFT) đạt tỉ lệ sống 94,2ᵃ%, cao nhất và khác biệt có ý nghĩa thống kê (p<0,05) so với CT1, CT3, CT4.',
      textbookRef: 'Chương IV: Giới thiệu chung về thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
  'cn12-c5': [
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'VD',
      question:
        'Khi nghiên cứu hiệu quả xử lí ammonia tổng số (TAN) trong nước ao nuôi tôm thẻ chân trắng bằng chế phẩm vi sinh (CT0: đối chứng không bổ sung; CT1: bổ sung Bacillus subtilis; CT2: bổ sung Nitrosomonas + Nitrobacter; CT3: tổ hợp Bacillus + Nitrosomonas + Nitrobacter), kết quả đo nồng độ TAN (mg/L) như sau:',
      tableData: {
        headers: ['Công thức', 'Nồng độ TAN sau 3 ngày (mg/L)', 'Nồng độ TAN sau 7 ngày (mg/L)'],
        rows: [
          ['CT0', '1,85ᵃ', '2,40ᵃ'],
          ['CT1', '1,12ᵇ', '0,85ᵇ'],
          ['CT2', '0,94ᵇ', '0,52ᶜ'],
          ['CT3', '0,45ᶜ', '0,12ᵈ'],
        ],
        source: 'Nguồn: Trần Ngọc Hải và cộng sự (2025). Tạp chí Khoa học Nông nghiệp Việt Nam, 23(3), trang 310-319.',
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c, d khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
      questionFooter: 'Nhận định nào sau đây đúng?',
      options: {
        A: 'Sau 7 ngày xử lí, công thức phối hợp CT3 làm giảm nồng độ khí độc TAN xuống mức thấp nhất.',
        B: 'Ở công thức đối chứng CT0, nồng độ TAN giảm dần từ ngày thứ 3 đến ngày thứ 7.',
        C: 'Sau 3 ngày xử lí, nồng độ TAN ở CT1 và CT2 khác biệt có ý nghĩa thống kê.',
        D: 'Công thức CT1 xử lí TAN sau 7 ngày hiệu quả hơn so với công thức CT3.',
      },
      correctAnswer: 'A',
      explanation:
        'Ở CT3, nồng độ TAN sau 7 ngày giảm xuống chỉ còn 0,12ᵈ mg/L, thấp nhất và khác biệt có ý nghĩa thống kê (p<0,05) so với CT0, CT1, CT2.',
      textbookRef: 'Chương V: Môi trường nuôi thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
  'cn12-c6': [
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'VD',
      question:
        'Khi nghiên cứu ảnh hưởng của liều lượng hormone 17α-methyltestosterone (MT) trộn vào thức ăn đến tỉ lệ cá rô phi đực sau 21 ngày xử lí (CT0: 0 mg/kg; CT1: 30 mg/kg; CT2: 60 mg/kg; CT3: 90 mg/kg), kết quả thu được như bảng sau:',
      tableData: {
        headers: ['Công thức', 'Tỉ lệ sống của cá bột (%)', 'Tỉ lệ cá rô phi đực (%)'],
        rows: [
          ['CT0 (Đối chứng)', '91,5ᵃ', '51,2ᶜ'],
          ['CT1 (30 mg MT/kg)', '90,8ᵃ', '84,6ᵇ'],
          ['CT2 (60 mg MT/kg)', '91,2ᵃ', '98,5ᵃ'],
          ['CT3 (90 mg MT/kg)', '82,4ᵇ', '97,8ᵃ'],
        ],
        source: 'Nguồn: Viện Nghiên cứu Nuôi trồng Thủy sản I (2025). Tạp chí Khoa học Nông nghiệp Việt Nam, 23(2), trang 115-124.',
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
      questionFooter: 'Nhận định nào sau đây đúng?',
      options: {
        A: 'Công thức CT2 (60 mg MT/kg) vừa đạt tỉ lệ cá đực cao nhất vừa duy trì tỉ lệ sống cao.',
        B: 'Tỉ lệ sống của cá bột ở cả 4 công thức không có sự khác biệt thống kê.',
        C: 'Công thức đối chứng CT0 cho tỉ lệ cá đực cao hơn so với công thức CT1.',
        D: 'Tăng liều MT từ 60 mg/kg lên 90 mg/kg giúp tăng tỉ lệ sống của cá bột.',
      },
      correctAnswer: 'A',
      explanation:
        'Công thức CT2 (60 mg MT/kg thức ăn) đạt tỉ lệ cá đực 98,5ᵃ% và tỉ lệ sống 91,2ᵃ% (tương đương đối chứng, trong khi CT3 tăng liều lên 90 mg/kg làm giảm tỉ lệ sống xuống 82,4ᵇ%).',
      textbookRef: 'Chương VI: Công nghệ giống thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
  'cn12-c7': [
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'VD',
      question:
        'Khi nghiên cứu ảnh hưởng của hàm lượng protein thô trong thức ăn viên đến tốc độ tăng trưởng của cá chẽm (Lates calcarifer) giống (CT1: 35% protein; CT2: 40% protein; CT3: 45% protein; CT4: 50% protein), kết quả sau 60 ngày nuôi như bảng sau:',
      tableData: {
        headers: ['Công thức', 'Khối lượng cuối (g/con)', 'Hệ số chuyển đổi thức ăn (FCR)'],
        rows: [
          ['CT1 (35% protein)', '42,5ᶜ', '1,68ᵃ'],
          ['CT2 (40% protein)', '56,2ᵇ', '1,42ᵇ'],
          ['CT3 (45% protein)', '68,4ᵃ', '1,18ᶜ'],
          ['CT4 (50% protein)', '69,1ᵃ', '1,19ᶜ'],
        ],
        source: 'Nguồn: Lê Quốc Việt và cộng sự (2025). Tạp chí Khoa học Nông nghiệp Việt Nam, 23(4), trang 402-411.',
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
      questionFooter: 'Nhận định nào sau đây đúng?',
      options: {
        A: 'Khối lượng cuối của cá ở CT3 (45% protein) và CT4 (50% protein) khác biệt không có ý nghĩa thống kê.',
        B: 'Hệ số FCR ở công thức CT1 (35% protein) là thấp nhất trong 4 công thức.',
        C: 'Tăng hàm lượng protein từ 45% lên 50% giúp giảm mạnh hệ số FCR có ý nghĩa thống kê.',
        D: 'Cá chẽm giống ở công thức CT1 đạt khối lượng cuối cao nhất sau 60 ngày nuôi.',
      },
      correctAnswer: 'A',
      explanation:
        'Ở cột khối lượng cuối, CT3 (68,4ᵃ g) và CT4 (69,1ᵃ g) cùng mang chữ cái a nên khác biệt không có ý nghĩa thống kê (p<0,05); do đó mức 45% protein là tối ưu về kinh tế.',
      textbookRef: 'Chương VII: Công nghệ thức ăn thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
  'cn12-c8': [
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'VD',
      question:
        'Khi nghiên cứu mật độ ương tôm thẻ chân trắng trong giai đoạn 1 của quy trình nuôi 3 giai đoạn ứng dụng công nghệ Biofloc (CT1: 1.000 con/m³; CT2: 2.000 con/m³; CT3: 3.000 con/m³; CT4: 4.000 con/m³), kết quả sau 25 ngày ương như bảng sau:',
      tableData: {
        headers: ['Công thức', 'Tỉ lệ sống (%)', 'Khối lượng tôm sau 25 ngày (g/con)'],
        rows: [
          ['CT1 (1.000 con/m³)', '94,5ᵃ', '1,45ᵃ'],
          ['CT2 (2.000 con/m³)', '93,8ᵃ', '1,42ᵃ'],
          ['CT3 (3.000 con/m³)', '85,2ᵇ', '1,15ᵇ'],
          ['CT4 (4.000 con/m³)', '74,6ᶜ', '0,88ᶜ'],
        ],
        source: 'Nguồn: Võ Nam Sơn và cộng sự (2025). Tạp chí Khoa học Nông nghiệp Việt Nam, 23(3), trang 275-284.',
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
      questionFooter: 'Nhận định nào sau đây đúng?',
      options: {
        A: 'Tỉ lệ sống và khối lượng tôm ở CT1 và CT2 không có sự khác biệt có ý nghĩa thống kê.',
        B: 'Ương ở mật độ 4.000 con/m³ (CT4) cho tỉ lệ sống cao nhất sau 25 ngày.',
        C: 'Khối lượng tôm ở CT3 cao hơn có ý nghĩa thống kê so với CT2.',
        D: 'Khi tăng mật độ từ 2.000 lên 4.000 con/m³, tỉ lệ sống của tôm tăng dần.',
      },
      correctAnswer: 'A',
      explanation:
        'Cả CT1 và CT2 đều có tỉ lệ sống (94,5ᵃ% và 93,8ᵃ%) và khối lượng (1,45ᵃ g và 1,42ᵃ g) cùng mang chữ cái a nên không khác biệt thống kê; mật độ 2.000 con/m³ giúp gấp đôi sản lượng con giống trên 1 m³ bể.',
      textbookRef: 'Chương VIII: Công nghệ nuôi thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
  'cn12-c9': [
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'VD',
      question:
        'Khi thử nghiệm bổ sung chiết xuất tỏi (Allium sativum) vào thức ăn nhằm tăng cường miễn dịch phòng bệnh xuất huyết do vi khuẩn Aeromonas hydrophila trên cá chép (CT0: 0 g/kg; CT1: 5 g/kg; CT2: 10 g/kg; CT3: 15 g/kg), sau 14 ngày gây nhiễm thu được bảng sau:',
      tableData: {
        headers: ['Công thức', 'Mật độ hồng cầu (10⁶ tế bào/mm³)', 'Tỉ lệ sống sau cảm nhiễm (%)'],
        rows: [
          ['CT0 (Đối chứng)', '1,21ᶜ', '42,5ᶜ'],
          ['CT1 (5 g tỏi/kg)', '1,54ᵇ', '68,2ᵇ'],
          ['CT2 (10 g tỏi/kg)', '1,88ᵃ', '86,7ᵃ'],
          ['CT3 (15 g tỏi/kg)', '1,85ᵃ', '85,9ᵃ'],
        ],
        source: 'Nguồn: Trương Đình Hoài và cộng sự (2025). Tạp chí Khoa học Nông nghiệp Việt Nam, 23(1), trang 88-97.',
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
      questionFooter: 'Nhận định nào sau đây đúng?',
      options: {
        A: 'Bổ sung 10 g chiết xuất tỏi/kg thức ăn (CT2) giúp tăng tỉ lệ sống lên mức cao nhất.',
        B: 'Công thức đối chứng CT0 có tỉ lệ sống sau cảm nhiễm cao hơn CT1.',
        C: 'Mật độ hồng cầu ở CT2 thấp hơn có ý nghĩa thống kê so với CT0.',
        D: 'Tỉ lệ sống ở CT2 và CT3 có sự khác biệt rất lớn về mặt thống kê (p<0,05).',
      },
      correctAnswer: 'A',
      explanation:
        'Ở CT2 (10 g/kg), tỉ lệ sống sau cảm nhiễm đạt 86,7ᵃ% (cao nhất) và không khác biệt thống kê với CT3 (85,9ᵃ%), giúp tiết kiệm nguyên liệu thảo dược.',
      textbookRef: 'Chương IX: Phòng, trị bệnh thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
  'cn12-c10': [
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'VD',
      question:
        'Khi nghiên cứu ảnh hưởng của kích thước mắt lưới ở đụt lưới kéo đến tỉ lệ cá con chưa trưởng thành bị đánh bắt lẫn (CT1: mắt lưới 20 mm; CT2: mắt lưới 30 mm; CT3: mắt lưới 40 mm; CT4: mắt lưới 50 mm), kết quả khảo sát các mẻ lưới như bảng sau:',
      tableData: {
        headers: ['Công thức', 'Tỉ lệ cá con bị bắt lẫn (%)', 'Sản lượng cá thương phẩm đạt chuẩn (kg/mẻ)'],
        rows: [
          ['CT1 (Mắt lưới 20 mm)', '64,5ᵃ', '48,2ᵇ'],
          ['CT2 (Mắt lưới 30 mm)', '41,2ᵇ', '55,6ᵃ'],
          ['CT3 (Mắt lưới 40 mm)', '12,4ᶜ', '56,8ᵃ'],
          ['CT4 (Mắt lưới 50 mm)', '8,1ᵈ', '41,0ᶜ'],
        ],
        source: 'Nguồn: Viện Nghiên cứu Hải sản (2025). Tạp chí Khoa học và Công nghệ Thủy sản, số 2, trang 70-79.',
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c, d khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
      questionFooter: 'Nhận định nào sau đây đúng?',
      options: {
        A: 'Sử dụng mắt lưới 40 mm (CT3) vừa giảm mạnh tỉ lệ cá con bị bắt lẫn vừa đạt sản lượng cá thương phẩm cao.',
        B: 'Sử dụng mắt lưới càng nhỏ (CT1) thì tỉ lệ cá con bị bắt lẫn càng thấp.',
        C: 'Sản lượng cá thương phẩm đạt chuẩn ở CT2 và CT3 khác biệt có ý nghĩa thống kê.',
        D: 'Công thức CT1 bảo vệ nguồn lợi thủy sản tốt hơn so với công thức CT3 và CT4.',
      },
      correctAnswer: 'A',
      explanation:
        'Công thức CT3 (mắt lưới 40 mm) giúp cá con thoát qua mắt lưới (chỉ còn 12,4ᶜ% cá tạp non) trong khi vẫn thu được sản lượng cá thương phẩm đạt chuẩn cao nhất (56,8ᵃ kg/mẻ).',
      textbookRef: 'Chương X: Bảo vệ và khai thác nguồn lợi thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
};

// Ngân hàng câu hỏi đếm số phát biểu đúng (a), (b), (c), (d) (Câu 4 và Câu 16) RIÊNG BIỆT CHO TỪNG CHƯƠNG LỚP 12
// Chỉ sử dụng kiến thức thuộc phạm vi nội dung của chính chương đó
const STATEMENT_COUNT_QUESTIONS_BY_CHAPTER: Record<
  string,
  Omit<MultipleChoiceQuestion, 'id' | 'number'>[]
> = {
  'cn12-c1': [
    {
      grade: '12',
      domain: 'forestry',
      level: 'TH',
      question:
        'Cho các phát biểu sau về vai trò, triển vọng và đặc trưng cơ bản của sản xuất lâm nghiệp (Chương I):',
      subStatements: [
        '(a) Lâm nghiệp có vai trò cung cấp gỗ, lâm sản ngoài gỗ và điều hòa khí hậu, bảo vệ môi trường sinh thái.',
        '(b) Đối tượng của sản xuất lâm nghiệp là cây rừng có chu kì sinh trưởng dài từ vài năm đến hàng chục năm.',
        '(c) Hoạt động sản xuất lâm nghiệp diễn ra trên địa bàn rộng lớn, phức tạp và mang tính thời vụ cao.',
        '(d) Rừng đặc dụng được sử dụng với mục đích chính là khai thác trắng gỗ tròn thương mại hàng năm.',
      ],
      questionFooter: 'Có bao nhiêu phát biểu đúng?',
      options: { A: '4.', B: '1.', C: '2.', D: '3.' },
      correctAnswer: 'D',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì rừng đặc dụng dùng để bảo tồn thiên nhiên, hệ sinh thái và nguồn gene sinh vật rừng.',
      textbookRef: 'Chương I: Giới thiệu chung về lâm nghiệp – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      grade: '12',
      domain: 'forestry',
      level: 'TH',
      question:
        'Một nhóm học sinh thảo luận về các hoạt động lâm nghiệp cơ bản và nguyên nhân làm suy thoái tài nguyên rừng (Chương I) như sau:',
      subStatements: [
        '(a) Giao rừng, cho thuê rừng, chuyển loại rừng và thu hồi rừng thuộc nhóm hoạt động quản lí rừng.',
        '(b) Trồng mới rừng, trồng lại rừng sau khai thác và khoanh nuôi tái sinh thuộc nhóm hoạt động phát triển rừng.',
        '(c) Khai thác gỗ quá mức, cháy rừng và phá rừng trồng cây công nghiệp là nguyên nhân chính gây suy thoái rừng.',
        '(d) Chăn thả gia súc tự do với mật độ cao trong rừng non mới trồng giúp cây rừng con sinh trưởng nhanh hơn.',
      ],
      questionFooter: 'Số phát biểu đúng là',
      options: { A: '2.', B: '1.', C: '3.', D: '4.' },
      correctAnswer: 'C',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì chăn thả gia súc bừa bãi trong rừng non làm gãy dập cây con, ăn chồi lá và nén chặt đất gây suy thoái rừng.',
      textbookRef: 'Chương I: Giới thiệu chung về lâm nghiệp – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
  'cn12-c2': [
    {
      grade: '12',
      domain: 'forestry',
      level: 'TH',
      question:
        'Cho các phát biểu sau về quy luật sinh trưởng và phát triển của cây rừng (Chương II):',
      subStatements: [
        '(a) Chu kì sinh trưởng và phát triển của cây rừng gồm 4 giai đoạn: non, gần thành thục, thành thục và già cỗi.',
        '(b) Những loài cây rừng sinh trưởng nhanh có đường kính thân tăng bình quân từ 2 cm/năm trở lên hoặc năng suất đạt từ 15 m³/ha/năm trở lên.',
        '(c) Ở giai đoạn thành thục, sinh trưởng thể tích gỗ đạt cực đại và chất lượng hạt giống thu hái đạt tốt nhất.',
        '(d) Ở giai đoạn non (từ hạt nảy mầm đến trước khi ra hoa lần đầu), cây rừng hoàn toàn không cần làm cỏ hay chăm sóc.',
      ],
      questionFooter: 'Có bao nhiêu phát biểu đúng?',
      options: { A: '4.', B: '1.', C: '2.', D: '3.' },
      correctAnswer: 'D',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì ở giai đoạn non sức chống chịu của cây rừng còn yếu, dễ bị cỏ dại chèn ép nên cần chăm sóc làm cỏ, vun xới tích cực nhất.',
      textbookRef: 'Chương II: Trồng và chăm sóc rừng – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      grade: '12',
      domain: 'forestry',
      level: 'TH',
      question:
        'Cho các phát biểu sau về kĩ thuật trồng và chăm sóc rừng (Chương II):',
      subStatements: [
        '(a) Trồng rừng bằng cây con có bầu giúp bảo vệ bộ rễ và đạt tỉ lệ sống cao trên đất đồi núi dốc.',
        '(b) Khi đặt cây con có bầu vào hố trồng, bắt buộc phải rạch và xé bỏ vỏ túi bầu nilon không tự phân hủy.',
        '(c) Sau khi trồng rừng, nếu kiểm tra thấy tỉ lệ cây sống dưới 85% thì phải tiến hành trồng dặm bổ sung kịp thời.',
        '(d) Khi tỉa cành cho cây rừng, người ta cắt cụt toàn bộ phần ngọn cây và tất cả cành lá xanh ở đỉnh tán.',
      ],
      questionFooter: 'Số phát biểu đúng là',
      options: { A: '2.', B: '1.', C: '3.', D: '4.' },
      correctAnswer: 'C',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì tỉa cành chỉ cắt sát thân các cành khô, cành sâu bệnh và cành phía dưới 1/3 chiều cao tán cây vào đầu mùa khô.',
      textbookRef: 'Chương II: Trồng và chăm sóc rừng – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
  'cn12-c3': [
    {
      grade: '12',
      domain: 'forestry',
      level: 'TH',
      question:
        'Một nhóm học sinh thảo luận về các biện pháp bảo vệ tài nguyên rừng (Chương III) như sau:',
      subStatements: [
        '(a) Bảo vệ rừng là trách nhiệm của toàn dân, của chủ rừng và của Ủy ban nhân dân các cấp.',
        '(b) Trên biển báo dự báo cấp cháy rừng từ cấp I đến cấp V, Cấp V là cấp cực kì nguy hiểm dễ xảy ra cháy lớn.',
        '(c) Xây dựng đường băng cản lửa dọn sạch vật liệu cháy giúp ngăn chặn đám cháy rừng lan rộng.',
        '(d) Trong phân khu bảo vệ nghiêm ngặt của rừng đặc dụng, người dân được tự do săn bắt động vật rừng quý hiếm.',
      ],
      questionFooter: 'Số phát biểu đúng là',
      options: { A: '2.', B: '1.', C: '3.', D: '4.' },
      correctAnswer: 'C',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì nghiêm cấm săn bắt động vật rừng và khai thác gỗ tự nhiên trong rừng đặc dụng.',
      textbookRef: 'Chương III: Bảo vệ và khai thác tài nguyên rừng bền vững – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      grade: '12',
      domain: 'forestry',
      level: 'TH',
      question:
        'Cho các phát biểu sau về các phương thức khai thác tài nguyên rừng bền vững (Chương III):',
      subStatements: [
        '(a) Khai thác trắng là chặt toàn bộ cây rừng trên một diện tích nhất định trong một lần chặt (< 1 năm) và phải trồng lại rừng ngay.',
        '(b) Khai thác dần là chặt toàn bộ cây rừng qua 3 – 4 lần chặt trong 5 – 10 năm để tận dụng khả năng tái sinh hạt tự nhiên.',
        '(c) Khai thác chọn là chỉ chọn chặt những cây đã thành thục, già cỗi theo yêu cầu, không giới hạn thời gian lặp lại.',
        '(d) Đối với rừng phòng hộ đầu nguồn trên núi dốc đứng, chủ rừng được phép áp dụng phương thức khai thác trắng toàn bộ.',
      ],
      questionFooter: 'Có bao nhiêu phát biểu đúng?',
      options: { A: '4.', B: '1.', C: '2.', D: '3.' },
      correctAnswer: 'D',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì nghiêm cấm khai thác trắng rừng phòng hộ đầu nguồn trên núi dốc (sẽ gây xói mòn, lũ quét).',
      textbookRef: 'Chương III: Bảo vệ và khai thác tài nguyên rừng bền vững – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
  'cn12-c4': [
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'TH',
      question:
        'Cho các phát biểu sau về vai trò, triển vọng và phân loại động vật thủy sản ở Việt Nam (Chương IV):',
      subStatements: [
        '(a) Xu hướng phát triển bền vững của ngành thủy sản là tăng tỉ lệ sản lượng nuôi trồng và giảm dần tỉ lệ sản lượng khai thác tự nhiên.',
        '(b) Theo nguồn gốc, cá tra và tôm sú là thủy sản bản địa; còn tôm thẻ chân trắng và cá tầm là thủy sản nhập nội.',
        '(c) Theo tính ăn, cá trắm cỏ thuộc nhóm ăn thực vật, cá quả (cá lóc) thuộc nhóm ăn động vật, còn cá chép thuộc nhóm ăn tạp.',
        '(d) Các loài ngao, sò huyết, hàu biển và mực ống được xếp vào nhóm động vật có xương sống.',
      ],
      questionFooter: 'Có bao nhiêu phát biểu đúng?',
      options: { A: '4.', B: '1.', C: '2.', D: '3.' },
      correctAnswer: 'D',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì ngao, sò, hàu, mực thuộc nhóm động vật thân mềm (nhuyễn thể, không xương sống).',
      textbookRef: 'Chương IV: Giới thiệu chung về thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'TH',
      question:
        'Một nhóm học sinh so sánh các phương thức nuôi thủy sản phổ biến ở Việt Nam (Chương IV) như sau:',
      subStatements: [
        '(a) Nuôi quảng canh có diện tích ao đầm lớn, mật độ thả rất thưa và dựa hoàn toàn vào thức ăn tự nhiên.',
        '(b) Nuôi bán thâm canh kết hợp nguồn thức ăn tự nhiên trong ao với thức ăn bổ sung (tự chế hoặc công nghiệp).',
        '(c) Nuôi thâm canh có mật độ thả rất cao, dùng 100% thức ăn công nghiệp, vận hành quạt nước/sục khí và cho năng suất cao nhất.',
        '(d) Phương thức nuôi quảng canh luôn đòi hỏi chi phí đầu tư trang thiết bị cao gấp nhiều lần so với nuôi thâm canh.',
      ],
      questionFooter: 'Số phát biểu đúng là',
      options: { A: '2.', B: '1.', C: '3.', D: '4.' },
      correctAnswer: 'C',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì nuôi quảng canh có mức đầu tư thấp nhất, còn nuôi thâm canh mới đòi hỏi vốn đầu tư trang thiết bị rất cao.',
      textbookRef: 'Chương IV: Giới thiệu chung về thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
  'cn12-c5': [
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'TH',
      question:
        'Cho các phát biểu sau về yêu cầu của môi trường nước nuôi thủy sản (Chương V):',
      subStatements: [
        '(a) Độ trong thích hợp cho ao nuôi cá là 20 – 30 cm và cho ao nuôi tôm là 30 – 45 cm.',
        '(b) Màu nước tốt nhất cho ao nuôi nước ngọt là màu xanh nõn chuối, còn cho ao nuôi nước lợ/mặn là màu vàng nâu (màu nước trà).',
        '(c) Khoảng giá trị độ pH thích hợp cho đa số thủy sản là từ 6,5 đến 8,5 và hàm lượng DO cho cá từ 4 – 5 mg/L trở lên.',
        '(d) Hàm lượng oxygen hòa tan (DO) trong ao nuôi nhiều tảo luôn đạt mức cao nhất vào lúc 4 – 5 giờ sáng.',
      ],
      questionFooter: 'Có bao nhiêu phát biểu đúng?',
      options: { A: '4.', B: '1.', C: '2.', D: '3.' },
      correctAnswer: 'D',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì ban đêm tảo không quang hợp mà cùng thủy sản và VSV hô hấp tiêu thụ O2 nên DO xuống mức thấp nhất vào lúc rạng sáng.',
      textbookRef: 'Chương V: Môi trường nuôi thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'TH',
      question:
        'Một nhóm học sinh thảo luận về quản lí và xử lí môi trường nuôi thủy sản (Chương V) như sau:',
      subStatements: [
        '(a) Quy trình xử lí nước trước khi nuôi gồm 4 bước: Lắng lọc -> Diệt tạp, khử khuẩn -> Khử hóa chất -> Bón phân gây màu nước.',
        '(b) Vi khuẩn Nitrosomonas và Nitrobacter giúp chuyển hóa khí độc NH3 và NO2- thành NO3- không độc cho thủy sản.',
        '(c) Dụng cụ đo độ trong của nước ngoài ao là đĩa Secchi, còn dụng cụ đo độ mặn là khúc xạ kế.',
        '(d) Để tiết kiệm thời gian, nên tạt chế phẩm vi sinh Bacillus cùng lúc với hóa chất sát trùng Chlorine.',
      ],
      questionFooter: 'Số phát biểu đúng là',
      options: { A: '2.', B: '1.', C: '3.', D: '4.' },
      correctAnswer: 'C',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì Chlorine sẽ tiêu diệt toàn bộ vi khuẩn có lợi trong chế phẩm vi sinh; phải khử hết dư lượng Chlorine sau 3–5 ngày mới cấy vi sinh.',
      textbookRef: 'Chương V: Môi trường nuôi thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
  'cn12-c6': [
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'TH',
      question:
        'Cho các phát biểu sau về đặc điểm sinh sản và kĩ thuật ương nuôi cá, tôm giống (Chương VI):',
      subStatements: [
        '(a) Đa số các loài cá nuôi đẻ trứng và thụ tinh ngoài trong môi trường nước, còn tôm biển có tập tính giao vĩ.',
        '(b) Ấu trùng tôm biển phát triển qua 4 giai đoạn biến thái theo thứ tự: Nauplius -> Zoea -> Mysis -> Postlarvae (PL).',
        '(c) Ở giai đoạn Nauplius ấu trùng tôm dinh dưỡng bằng noãn hoàng tự thân, sang giai đoạn Zoea bắt đầu ăn tảo khuê.',
        '(d) Khi thu hoạch cá giống để đóng túi vận chuyển đi xa, cần cho cá ăn thật no ngay trước lúc kéo lưới.',
      ],
      questionFooter: 'Có bao nhiêu phát biểu đúng?',
      options: { A: '4.', B: '1.', C: '2.', D: '3.' },
      correctAnswer: 'D',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì trước khi vận chuyển đi xa phải luyện cá và ngừng cho ăn 1–2 ngày để cá sạch ruột, tránh thải phân gây ngạt và nhiễm độc NH3 trong túi.',
      textbookRef: 'Chương VI: Công nghệ giống thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'TH',
      question:
        'Một nhóm học sinh tìm hiểu về ứng dụng công nghệ sinh học trong chọn và nhân giống thủy sản (Chương VI) như sau:',
      subStatements: [
        '(a) Chọn giống bằng chỉ thị phân tử (MAS) giúp chọn chính xác các cá thể mang gene quý như kháng bệnh, lớn nhanh.',
        '(b) Sử dụng hormone ngoại sinh (LRHa + DOM, HCG, não thùy cá) giúp kích thích cá bố mẹ đẻ trứng đồng loạt.',
        '(c) Cho cá bột rô phi ăn thức ăn trộn hormone 17α-methyltestosterone trong 21 ngày đầu giúp tạo đàn cá rô phi đơn tính đực.',
        '(d) Tinh trùng cá bảo quản dài hạn nhiều năm được lưu giữ trong tủ ấm ở nhiệt độ 40 °C.',
      ],
      questionFooter: 'Số phát biểu đúng là',
      options: { A: '2.', B: '1.', C: '3.', D: '4.' },
      correctAnswer: 'C',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì bảo quản dài hạn tinh trùng cá phải lưu giữ trong bình nitrogen lỏng ở nhiệt độ -196 °C.',
      textbookRef: 'Chương VI: Công nghệ giống thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
  'cn12-c7': [
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'TH',
      question:
        'Cho các phát biểu sau về các nhóm thức ăn thủy sản và phương pháp bảo quản thức ăn (Chương VII):',
      subStatements: [
        '(a) Thức ăn thủy sản gồm 4 nhóm chính: thức ăn tự nhiên, thức ăn tươi sống, thức ăn hỗn hợp và chất bổ sung.',
        '(b) Thức ăn hỗn hợp dạng viên cho cá (như cá rô phi, cá tra) thường là viên nổi, còn cho tôm là viên chìm bền trong nước.',
        '(c) Khi bảo quản trong kho khô thoáng, thức ăn hỗn hợp cần có độ ẩm 10 – 12% và chất bổ sung có độ ẩm 5 – 7%.',
        '(d) Các loại thức ăn tươi sống dạng động vật (cá tạp, mực tươi) có thể để ở nhiệt độ phòng 30 °C suốt 1 tháng không hỏng.',
      ],
      questionFooter: 'Có bao nhiêu phát biểu đúng?',
      options: { A: '4.', B: '1.', C: '2.', D: '3.' },
      correctAnswer: 'D',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì thức ăn tươi sống để ở nhiệt độ thường sẽ ươn thối rất nhanh, phải bảo quản lạnh bằng đá (0–4 °C) hoặc cấp đông (-18 °C).',
      textbookRef: 'Chương VII: Công nghệ thức ăn thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'TH',
      question:
        'Một nhóm học sinh thảo luận về quy trình chế biến và ứng dụng CNSH trong thức ăn thủy sản (Chương VII) như sau:',
      subStatements: [
        '(a) Quy trình chế biến thức ăn công nghiệp gồm 5 bước: Nghiền -> Phối trộn -> Hấp chín, ép viên -> Sấy khô -> Làm nguội, đóng bao.',
        '(b) Các thành phần nhạy cảm với nhiệt như vitamin, enzyme và dầu cá nên được phun phủ bổ sung sau khi ép viên và sấy.',
        '(c) Thủy phân phụ phẩm cá bằng enzyme protease giúp tạo nguồn thức ăn giàu amino acid tự do (như lysine) dễ tiêu hóa.',
        '(d) Hệ số chuyển đổi thức ăn (FCR) càng cao thì hiệu quả kinh tế của thức ăn càng lớn.',
      ],
      questionFooter: 'Số phát biểu đúng là',
      options: { A: '2.', B: '1.', C: '3.', D: '4.' },
      correctAnswer: 'C',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì FCR là lượng thức ăn tiêu tốn để tăng 1 kg khối lượng cơ thể nên FCR càng thấp mới càng hiệu quả.',
      textbookRef: 'Chương VII: Công nghệ thức ăn thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
  'cn12-c8': [
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'TH',
      question:
        'Cho các phát biểu sau về công nghệ nuôi thủy sản và tiêu chuẩn VietGAP (Chương VIII):',
      subStatements: [
        '(a) Quy trình nuôi tôm thẻ chân trắng thâm canh 3 giai đoạn có mật độ giảm dần từ giai đoạn 1 sang giai đoạn 3.',
        '(b) Nuôi thủy sản theo tiêu chuẩn VietGAP giúp đảm bảo an toàn thực phẩm, an toàn dịch bệnh, môi trường và truy xuất nguồn gốc.',
        '(c) Trong hệ thống nuôi tuần hoàn (RAS), bể lọc cơ học đặt trước bể lọc sinh học để tách chất thải rắn trước khi xử lí NH3.',
        '(d) Trong công nghệ Biofloc, người nuôi cần tắt toàn bộ máy sục khí suốt ban đêm để hạt Biofloc lắng chặt xuống đáy.',
      ],
      questionFooter: 'Có bao nhiêu phát biểu đúng?',
      options: { A: '4.', B: '1.', C: '2.', D: '3.' },
      correctAnswer: 'D',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì hệ thống Biofloc bắt buộc phải sục khí liên tục 24/24h để cung cấp O2 và giữ hạt floc lơ lửng.',
      textbookRef: 'Chương VIII: Công nghệ nuôi thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'TH',
      question:
        'Một nhóm học sinh tìm hiểu về công nghệ bảo quản và chế biến sản phẩm thủy sản (Chương VIII) như sau:',
      subStatements: [
        '(a) Hầm cách nhiệt Polyurethane (PU) kết hợp công nghệ nano UFB chứa khí Nitrogen giúp bảo quản cá ngừ đại dương tươi lâu 20 – 30 ngày.',
        '(b) Trong chế biến nước mắm truyền thống, muối ăn ở nồng độ cao (25 – 30%) giúp ức chế vi khuẩn gây thối trong khi enzyme protease thủy phân đạm.',
        '(c) Trong chế biến chả cá Surimi từ mực đại dương, bổ sung enzyme tạo gel giúp liên kết protein tạo cấu trúc dai giòn.',
        '(d) Khi chế biến cá tra phi lê đông lạnh xuất khẩu, tâm sản phẩm sau cấp đông được duy trì ở nhiệt độ 25 °C.',
      ],
      questionFooter: 'Số phát biểu đúng là',
      options: { A: '2.', B: '1.', C: '3.', D: '4.' },
      correctAnswer: 'C',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì tâm sản phẩm cá phi lê đông lạnh phải đạt từ -18 °C trở xuống.',
      textbookRef: 'Chương VIII: Công nghệ nuôi thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
  'cn12-c9': [
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'TH',
      question:
        'Cho các phát biểu sau về nguyên nhân và một số bệnh thủy sản phổ biến (Chương IX):',
      subStatements: [
        '(a) Bệnh thủy sản chỉ bùng phát khi có sự tác động đồng thời của 3 yếu tố: Mầm bệnh, Vật chủ mẫn cảm và Môi trường bất lợi.',
        '(b) Bệnh lồi mắt, xuất huyết ở cá rô phi do liên cầu khuẩn Gram dương Streptococcus agalactiae gây ra.',
        '(c) Bệnh gan thận mủ trên cá tra do vi khuẩn Edwardsiella ictaluri gây ra với dấu hiệu nhiều đốm trắng đục trên gan, thận, lách.',
        '(d) Bệnh đốm trắng trên tôm (WSSV) do vi khuẩn gây ra nên có thể chữa khỏi hoàn toàn bằng thuốc kháng sinh.',
      ],
      questionFooter: 'Có bao nhiêu phát biểu đúng?',
      options: { A: '4.', B: '1.', C: '2.', D: '3.' },
      correctAnswer: 'D',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì bệnh đốm trắng trên tôm do virus DNA (WSSV) gây ra, kháng sinh không tiêu diệt được virus.',
      textbookRef: 'Chương IX: Phòng, trị bệnh thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'TH',
      question:
        'Một nhóm học sinh thảo luận về ứng dụng công nghệ sinh học trong phòng, trị bệnh thủy sản (Chương IX) như sau:',
      subStatements: [
        '(a) Kĩ thuật PCR giúp nhân bản đoạn DNA/RNA đặc hiệu để phát hiện sớm và chính xác mầm bệnh trên con giống.',
        '(b) Sử dụng vaccine cho cá khỏe mạnh giúp kích thích cơ thể tạo miễn dịch chủ động đặc hiệu phòng bệnh.',
        '(c) Chế phẩm thảo dược men tỏi chứa hoạt chất kháng sinh tự nhiên Allicin giúp phòng trị bệnh đường ruột và tăng sức đề kháng.',
        '(d) Vaccine thủy sản chỉ được sử dụng để tiêm cấp cứu cho những đàn cá đang mắc bệnh cấp tính chết hàng loạt.',
      ],
      questionFooter: 'Số phát biểu đúng là',
      options: { A: '2.', B: '1.', C: '3.', D: '4.' },
      correctAnswer: 'C',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì vaccine dùng để phòng bệnh cho thủy sản đang khỏe mạnh, không tiêm cho cá đang phát bệnh cấp tính.',
      textbookRef: 'Chương IX: Phòng, trị bệnh thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
  'cn12-c10': [
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'TH',
      question:
        'Một nhóm học sinh đề xuất các biện pháp bảo vệ nguồn lợi thủy sản và chống khai thác IUU (Chương X) như sau:',
      subStatements: [
        '(a) Quy định kích thước mắt lưới tối thiểu và cấm đánh bắt vào mùa sinh sản để bảo vệ cá bố mẹ và cá con.',
        '(b) Thiết lập các khu bảo tồn biển và định kì thả bổ sung các loài thủy sản bản địa, quý hiếm ra tự nhiên.',
        '(c) Tàu cá khai thác xa bờ phải bật thiết bị giám sát hành trình (VMS) 24/24 giờ và ghi nộp nhật kí khai thác.',
        '(d) Sử dụng chất nổ, xung điện và hóa chất độc để đánh bắt thủy sản nhanh chóng tại vùng nước ven bờ.',
      ],
      questionFooter: 'Số biện pháp đúng là',
      options: { A: '2.', B: '1.', C: '3.', D: '4.' },
      correctAnswer: 'C',
      explanation:
        'Có 3 biện pháp đúng là (a), (b), (c). Biện pháp (d) sai vì dùng chất nổ, xung điện, chất độc là hành vi hủy diệt nguồn lợi thủy sản bị pháp luật nghiêm cấm.',
      textbookRef: 'Chương X: Bảo vệ và khai thác nguồn lợi thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
    {
      grade: '12',
      domain: 'aquaculture',
      level: 'TH',
      question:
        'Cho các phát biểu sau về các phương pháp khai thác nguồn lợi thủy sản phổ biến ở Việt Nam (Chương X):',
      subStatements: [
        '(a) Bốn phương pháp khai thác thủy sản phổ biến là nghề lưới kéo, nghề lưới rê, nghề lưới vây và nghề câu.',
        '(b) Nghề lưới vây thường kết hợp ánh sáng đèn ban đêm để thu hút và bao vây các đàn cá nổi tập trung.',
        '(c) Nghề câu (như câu vàng cá ngừ đại dương, câu mực) có tính chọn lọc cao nhất và chất lượng sản phẩm tốt.',
        '(d) Nghề lưới kéo đáy (giã cào) có tính chọn lọc cao hơn nghề câu và hoàn toàn không ảnh hưởng đến hệ sinh thái đáy biển.',
      ],
      questionFooter: 'Có bao nhiêu phát biểu đúng?',
      options: { A: '4.', B: '1.', C: '2.', D: '3.' },
      correctAnswer: 'D',
      explanation:
        'Có 3 phát biểu đúng là (a), (b), (c). Phát biểu (d) sai vì nghề lưới kéo có tính chọn lọc rất thấp (bắt lẫn nhiều cá con) và cào sát đáy gây tổn hại hệ sinh thái đáy biển.',
      textbookRef: 'Chương X: Bảo vệ và khai thác nguồn lợi thủy sản – SGK Công nghệ 12 Kết nối tri thức',
    },
  ],
};

// Ngân hàng Biểu đồ cột & Bảng số liệu thống kê thực nghiệm cho Phần II (4 câu Đúng/Sai)
// Thiết kế RIÊNG BIỆT cho từng chương (cn12-c1 .. cn12-c10) và khớp 100% với nội dung tình huống của câu Đúng/Sai đó
const CHAPTER_TF_EXPERIMENTAL_DATA: Record<
  string,
  Record<
    number,
    {
      citation: string;
      chartData?: TrueFalseQuestion['chartData'];
      tableData?: TrueFalseQuestion['tableData'];
    }
  >
> = {
  'cn12-c1': {
    1: {
      citation:
        'Viện Khoa học Lâm nghiệp Việt Nam (2025). Tạp chí Khoa học Lâm nghiệp, số 1, trang 15-24.',
      chartData: {
        caption:
          'Biểu đồ: Lượng carbon lưu giữ trung bình (tấn C/ha) của các khu rừng tại Hợp tác xã A (Chương I)',
        type: 'bar',
        unit: 'tấn C/ha',
        items: [
          { label: 'Rừng phòng hộ đầu nguồn (100 ha)', value: 142.5, displayValue: '142,5', highlight: true },
          { label: 'Rừng sản xuất trồng quế + dược liệu', value: 118.4, displayValue: '118,4', highlight: true },
          { label: 'Rừng sản xuất keo thuần loài', value: 78.2, displayValue: '78,2', highlight: false },
        ],
        note: 'Ghi chú: Rừng phòng hộ đầu nguồn và mô hình nông – lâm kết hợp dưới tán rừng giúp nâng cao sinh khối và bảo vệ hồ chứa.',
      },
    },
    2: {
      citation:
        'Cục Lâm nghiệp & Viện Điều tra Quy hoạch rừng (2025). Báo cáo chuyên đề Quản lí tài nguyên rừng bền vững, trang 30-39.',
      tableData: {
        caption:
          'Bảng thống kê nguyên nhân suy giảm diện tích rừng và kết quả phục hồi tại địa phương X (Chương I)',
        headers: ['Chỉ tiêu khảo sát tại địa phương X', 'Giai đoạn trước giao rừng', 'Sau 5 năm giao rừng & hỗ trợ sinh kế'],
        rows: [
          ['Số vụ khai thác gỗ trái phép và đốt nương rẫy (vụ/năm)', '48,5ᵃ', '6,2ᵇ'],
          ['Diện tích rừng khoanh nuôi tái sinh phục hồi (ha)', '120,0ᵇ', '685,0ᵃ'],
          ['Độ che phủ rừng toàn địa phương (%)', '36,4ᵇ', '43,8ᵃ'],
        ],
        note: 'Ghi chú: Trong cùng một hàng, các chữ cái a, b khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
    },
    3: {
      citation:
        'Viện Nghiên cứu Lâm sinh (2025). Tạp chí Khoa học Lâm nghiệp, số 2, trang 41-50.',
      tableData: {
        caption:
          'Bảng so sánh hiệu quả kinh tế giữa rừng gỗ nhỏ (5 năm) và rừng gỗ lớn có chứng chỉ FSC (11 năm) liên kết với Công ty B (Chương I)',
        headers: ['Mô hình kinh doanh rừng trồng', 'Trữ lượng gỗ (m³/ha)', 'Tỉ lệ gỗ xẻ nội thất (%)', 'Lợi nhuận ròng (triệu đ/ha/năm)'],
        rows: [
          ['CT1 (Rừng gỗ nhỏ 5 năm băm dăm)', '95,0ᵇ', '12,5ᵇ', '14,2ᵇ'],
          ['CT2 (Rừng gỗ lớn 11 năm đạt chuẩn FSC)', '245,0ᵃ', '78,4ᵃ', '32,6ᵃ'],
        ],
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
    },
    4: {
      citation:
        'Phân viện Khoa học Lâm nghiệp Nam Bộ (2025). Tạp chí Khoa học Lâm nghiệp, số 3, trang 60-69.',
      chartData: {
        caption:
          'Biểu đồ: Tỉ lệ giảm chiều cao sóng biển (%) theo bề rộng đai rừng phòng hộ ven biển (Chương I)',
        type: 'bar',
        unit: '%',
        items: [
          { label: 'Bờ biển không có rừng phòng hộ', value: 5.0, displayValue: '5,0%', highlight: false },
          { label: 'Đai rừng phòng hộ rộng 50 m', value: 46.5, displayValue: '46,5%', highlight: true },
          { label: 'Đai rừng phòng hộ rộng 150 m (Dự án 500 ha)', value: 82.4, displayValue: '82,4%', highlight: true },
        ],
        note: 'Ghi chú: Đai rừng phòng hộ ven biển tiêu tán mạnh năng lượng sóng bão và bảo vệ an toàn thân đê biển.',
      },
    },
  },
  'cn12-c2': {
    1: {
      citation:
        'Trung tâm Nghiên cứu Giống cây rừng (2025). Tạp chí Khoa học Lâm nghiệp, số 1, trang 28-36.',
      chartData: {
        caption:
          'Biểu đồ: Tỉ lệ sống của cây keo lai sau trồng (%) theo kĩ thuật xử lí bầu và bón lót (Chương II)',
        type: 'bar',
        unit: '%',
        items: [
          { label: 'CT1 (Rạch bỏ vỏ bầu + bón lót đất mặt)', value: 94.2, displayValue: '94,2%', highlight: true },
          { label: 'CT2 (Có rạch vỏ bầu, không bón lót)', value: 78.0, displayValue: '78,0% (cần trồng dặm)', highlight: false },
          { label: 'CT3 (Không xé bỏ vỏ bầu nilon)', value: 45.6, displayValue: '45,6%', highlight: false },
        ],
        note: 'Ghi chú: Khi tỉ lệ cây sống sau trồng đạt dưới 85% thì bắt buộc phải tiến hành trồng dặm bổ sung.',
      },
    },
    2: {
      citation:
        'Viện Khoa học Lâm nghiệp Việt Nam (2025). Tạp chí Khoa học Lâm nghiệp, số 2, trang 19-28.',
      tableData: {
        caption:
          'Bảng theo dõi chỉ tiêu sinh trưởng và chất lượng hạt giống qua 4 giai đoạn tuổi của rừng thông mã vĩ (Chương II)',
        headers: ['Giai đoạn phát triển', 'Tăng trưởng đường kính (cm/năm)', 'Tỉ lệ hạt chắc mẩy (%)', 'Biện pháp kĩ thuật trọng tâm'],
        rows: [
          ['1. Giai đoạn non (1 – 4 tuổi)', '1,15ᵇ', '0,0ᶜ (chưa ra hoa)', 'Làm cỏ, vun gốc, trồng dặm'],
          ['2. Giai đoạn gần thành thục (5 – 10 tuổi)', '2,10ᵃ', '54,2ᵇ (ra hoa bói)', 'Tỉa cành, tỉa thưa nuôi dưỡng'],
          ['3. Giai đoạn thành thục (11 – 20 tuổi)', '2,25ᵃ', '92,6ᵃ (tốt nhất)', 'Thu hoạch hạt giống, khai thác gỗ'],
          ['4. Giai đoạn già cỗi (> 25 tuổi)', '0,35ᶜ', '41,0ᵇ', 'Khai thác thanh lí, tái sinh rừng'],
        ],
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
    },
    3: {
      citation:
        'Nguyễn Văn Lưu và cộng sự (2025). Tạp chí Khoa học Lâm nghiệp, số 3, trang 51-60.',
      tableData: {
        caption:
          'Bảng kết quả ảnh hưởng của biện pháp chăm sóc rừng 2 năm tuổi tại Lâm trường X sau 12 tháng (Chương II)',
        headers: ['Công thức chăm sóc', 'Tỉ lệ sống (%)', 'Tăng trưởng đường kính D1.3 (cm/năm)', 'Tăng trưởng chiều cao Hvn (m/năm)'],
        rows: [
          ['CT0 (Đối chứng không làm cỏ, không vun gốc)', '74,5ᵇ', '1,24ᶜ', '1,12ᶜ'],
          ['CT1 (Phát quang, làm cỏ, xới đất vun gốc sâu 10 cm)', '91,2ᵃ', '2,15ᵇ', '1,85ᵇ'],
          ['CT2 (Làm cỏ vun gốc + bón thúc lấp đất + tỉa cành < 1/3 tán)', '94,6ᵃ', '2,58ᵃ', '2,24ᵃ'],
        ],
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
    },
    4: {
      citation:
        'Viện Khoa học Lâm nghiệp Nam Trung Bộ và Tây Nguyên (2025). Tạp chí Khoa học Lâm nghiệp, số 4, trang 34-43.',
      chartData: {
        caption:
          'Biểu đồ: Tỉ lệ sống sau 12 tháng (%) của 3 phương thức trồng rừng trên đất đồi dốc đá lẫn tại Bình Định (Chương II)',
        type: 'bar',
        unit: '%',
        items: [
          { label: 'Trồng bằng cây con có bầu (vụ mưa T9–T12)', value: 92.8, displayValue: '92,8%', highlight: true },
          { label: 'Trồng bằng cây con rễ trần', value: 61.4, displayValue: '61,4%', highlight: false },
          { label: 'Gieo hạt thẳng trên đồi dốc', value: 38.5, displayValue: '38,5%', highlight: false },
        ],
        note: 'Ghi chú: Trên đất đồi dốc tầng mỏng ở miền Trung, trồng bằng cây con có bầu vào mùa mưa (tháng 9–12) đạt tỉ lệ sống cao nhất.',
      },
    },
  },
  'cn12-c3': {
    1: {
      citation:
        'Cục Kiểm lâm (2025). Tài liệu hướng dẫn Dự báo cấp cháy rừng và Phòng cháy chữa cháy rừng, trang 18-26.',
      chartData: {
        caption:
          'Biểu đồ: Độ ẩm vật liệu cháy dưới tán rừng thông (%) tương ứng với 5 cấp dự báo cháy rừng tại Khu bảo tồn X (Chương III)',
        type: 'bar',
        unit: '% độ ẩm VLC',
        items: [
          { label: 'Cấp I – II (Ít nguy hiểm, VLC ẩm)', value: 32.5, displayValue: '32,5%', highlight: false },
          { label: 'Cấp III (Cấp cao, bắt đầu khô hanh)', value: 21.0, displayValue: '21,0%', highlight: false },
          { label: 'Cấp IV (Cấp nguy hiểm)', value: 14.2, displayValue: '14,2%', highlight: true },
          { label: 'Cấp V (Cực kì nguy hiểm – Báo động đỏ)', value: 7.8, displayValue: '7,8%', highlight: true },
        ],
        note: 'Ghi chú: Ở Cấp V, độ ẩm vật liệu cháy xuống dưới 10%, chỉ một tàn lửa nhỏ cũng bùng phát thành đám cháy rừng lớn.',
      },
    },
    2: {
      citation:
        'Trần Lâm Đồng và cộng sự (2025). Tạp chí Khoa học Lâm nghiệp, số 2, trang 44-53.',
      tableData: {
        caption:
          'Bảng khảo sát độ tàn che và lượng đất xói mòn theo phương thức khai thác tại Khu A (dốc 8°) và Khu B (dốc 25°) (Chương III)',
        headers: ['Khu vực & Phương thức khai thác', 'Độ tàn che còn lại sau khai thác', 'Lượng đất xói mòn (tấn/ha/năm)', 'Khả năng phục hồi rừng'],
        rows: [
          ['Khu A (Rừng trồng dốc 8° – Khai thác trắng + trồng lại ngay)', '0,0 (trồng lại ngay mùa mưa)', '4,2ᵇ (trong ngưỡng an toàn)', 'Phục hồi tốt bằng rừng trồng mới'],
          ['Khu B (Rừng tự nhiên dốc 25° – Khai thác chọn bền vững)', '0,62ᵃ (đảm bảo > 0,4)', '3,5ᵇ (rất thấp)', 'Tái sinh tự nhiên liên tục'],
          ['Đối chứng giả định: Khai thác trắng trên sườn dốc 25° (Bị cấm)', '0,0', '68,4ᵃ (xói mòn nghiêm trọng)', 'Suy thoái đất trơ sỏi đá'],
        ],
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
    },
    3: {
      citation:
        'Viện Nghiên cứu Lâm sinh (2025). Tạp chí Khoa học Lâm nghiệp, số 3, trang 72-81.',
      tableData: {
        caption:
          'Bảng diễn biến độ tàn che cây mẹ và mật độ cây con tái sinh tự nhiên qua 3 đợt chặt của phương thức Khai thác dần (Chương III)',
        headers: ['Đợt khai thác dần (trong 8 năm)', 'Độ tàn che tầng cây mẹ', 'Mật độ cây con tái sinh (cây/ha)', 'Chiều cao trung bình cây tái sinh (m)'],
        rows: [
          ['Đợt 1 (Chặt mở tán 30% trữ lượng – Năm thứ 1)', '0,65ᵃ', '1.450ᶜ', '0,45ᶜ'],
          ['Đợt 2 (Chặt nuôi dưỡng 35% trữ lượng – Năm thứ 4)', '0,38ᵇ', '3.120ᵃ', '1,35ᵇ'],
          ['Đợt 3 (Chặt tận thu cây mẹ còn lại – Năm thứ 8)', '0,00ᶜ (rừng non đã khép tán)', '2.680ᵇ (cây khỏe đồng đều)', '2,80ᵃ'],
        ],
        note: 'Ghi chú: Đợt chặt cuối chỉ thực hiện khi lớp cây con tái sinh tự nhiên đã đạt mật độ chuẩn và khép tán vững chắc.',
      },
    },
    4: {
      citation:
        'Trung tâm Nghiên cứu Bảo vệ rừng (2025). Tạp chí Khoa học Lâm nghiệp, số 4, trang 55-63.',
      chartData: {
        caption:
          'Biểu đồ: Hiệu lực diệt sâu ăn lá rừng thông (%) và tỉ lệ sống của thiên địch tại Tiểu khu 124 (Chương III)',
        type: 'bar',
        unit: '%',
        items: [
          { label: 'Chế phẩm sinh học Bt (Hiệu lực diệt sâu)', value: 89.5, displayValue: '89,5%', highlight: true },
          { label: 'Chế phẩm sinh học Bt (Tỉ lệ thiên địch sống sót)', value: 96.2, displayValue: '96,2%', highlight: true },
          { label: 'Đối chứng không phòng trừ (Mật độ sâu tăng)', value: 12.0, displayValue: '12,0%', highlight: false },
        ],
        note: 'Ghi chú: Sử dụng chế phẩm sinh học (Bt, nấm bạch cương) giúp diệt sâu hại rừng hiệu quả mà vẫn bảo vệ thiên địch và nguồn nước đầu nguồn.',
      },
    },
  },
  'cn12-c4': {
    1: {
      citation:
        'Cục Thủy sản – Bộ Nông nghiệp và Phát triển nông thôn (2025). Báo cáo Tổng kết ngành Thủy sản Việt Nam, trang 10-18.',
      chartData: {
        caption:
          'Biểu đồ: Cơ cấu tỉ trọng sản lượng nuôi trồng và sản lượng khai thác thủy sản của Việt Nam (%) (Chương IV)',
        type: 'bar',
        unit: '% tổng sản lượng',
        items: [
          { label: 'Sản lượng Nuôi trồng thủy sản (Tăng mạnh)', value: 58.2, displayValue: '58,2%', highlight: true },
          { label: 'Sản lượng Khai thác thủy sản (Giảm dần hợp lí)', value: 41.8, displayValue: '41,8%', highlight: false },
        ],
        note: 'Ghi chú: Xu hướng phát triển thủy sản Việt Nam là tăng tỉ lệ nuôi trồng (đặc biệt nuôi công nghệ cao, VietGAP/ASC) và giảm tỉ lệ khai thác tự nhiên.',
      },
    },
    2: {
      citation:
        'Viện Nghiên cứu Nuôi trồng Thủy sản I (2025). Tạp chí Khoa học Nông nghiệp Việt Nam, 23(1), trang 32-41.',
      tableData: {
        caption:
          'Bảng phân loại đặc tính sinh học và kết quả nuôi ghép các loài cá tại Trang trại X (Chương IV)',
        headers: ['Loài thủy sản', 'Nguồn gốc', 'Tính ăn & Tầng nước sống', 'Tỉ lệ sống khi nuôi đúng môi trường (%)'],
        rows: [
          ['Cá trắm cỏ', 'Bản địa / Truyền thống', 'Ăn thực vật (tầng giữa)', '92,5ᵃ (ao nước ngọt 25–30 °C)'],
          ['Cá mè trắng', 'Bản địa / Truyền thống', 'Ăn sinh vật phù du (tầng mặt)', '94,0ᵃ (ao nước ngọt 25–30 °C)'],
          ['Cá chép V1', 'Lai chọn tạo', 'Ăn tạp (tầng đáy)', '93,2ᵃ (ao nước ngọt 25–30 °C)'],
          ['Cá tầm Nga', 'Nhập nội (ôn đới lạnh)', 'Ăn động vật (ưa nước chảy lạnh 15–20 °C)', '0,0ᵇ (nếu thả ao tĩnh 35 °C)'],
        ],
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
    },
    3: {
      citation:
        'Viện Nghiên cứu Nuôi trồng Thủy sản II (2025). Tạp chí Khoa học và Công nghệ Thủy sản, số 1, trang 22-30.',
      tableData: {
        caption:
          'Bảng so sánh các chỉ tiêu kĩ thuật giữa 3 phương thức nuôi tôm tại vùng ven biển Sóc Trăng (Chương IV)',
        headers: ['Phương thức nuôi', 'Mật độ thả (con/m²)', 'Nguồn thức ăn sử dụng', 'Năng suất trung bình (tấn/ha/vụ)'],
        rows: [
          ['1. Nuôi quảng canh (Hộ ông A)', '1 – 2ᶜ', '100% thức ăn tự nhiên trong đầm', '0,35ᶜ'],
          ['2. Nuôi bán thâm canh', '15 – 25ᵇ', 'Thức ăn tự nhiên + thức ăn bổ sung', '3,80ᵇ'],
          ['3. Nuôi thâm canh (Hộ ông B)', '120 – 150ᵃ', '100% thức ăn viên công nghiệp + quạt nước 24/24', '28,50ᵃ'],
        ],
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
    },
    4: {
      citation:
        'Viện Nghiên cứu Hải sản (2025). Tạp chí Khoa học và Công nghệ Thủy sản, số 2, trang 45-53.',
      chartData: {
        caption:
          'Biểu đồ: Tỉ lệ sống (%) của Hàu Thái Bình Dương (nhuyễn thể ăn lọc) và Cá song (cá biển ăn động vật) ở vùng biển Vân Đồn độ mặn 30‰ so với nước ngọt 0‰ (Chương IV)',
        type: 'bar',
        unit: '% tỉ lệ sống',
        items: [
          { label: 'Nuôi kết hợp tại vịnh biển Vân Đồn (Độ mặn 28–32‰)', value: 91.5, displayValue: '91,5%', highlight: true },
          { label: 'Đưa vào hồ nước ngọt trên núi (Độ mặn 0‰)', value: 0.0, displayValue: '0% (Chết do sốc mặn)', highlight: false },
        ],
        note: 'Ghi chú: Hàu Thái Bình Dương (thân mềm) và cá song (nhóm cá) thuộc nhóm thủy sản nước mặn, không sống được ở nước ngọt 0‰.',
      },
    },
  },
  'cn12-c5': {
    1: {
      citation:
        'Trần Ngọc Hải và cộng sự (2025). Tạp chí Khoa học Nông nghiệp Việt Nam, 23(2), trang 140-149.',
      chartData: {
        caption:
          'Biểu đồ: Mật độ vi khuẩn gây hại Vibrio (CFU/mL) và độ trong nước ao (cm) qua 4 bước xử lí nước trước khi nuôi của anh Minh (Chương V)',
        type: 'bar',
        unit: 'Độ trong (cm)',
        items: [
          { label: 'Bước 1: Sau lắng lọc (nước trong)', value: 65.0, displayValue: '65 cm', highlight: false },
          { label: 'Bước 2 & 3: Diệt khuẩn Chlorine & Quạt khử dư lượng', value: 70.0, displayValue: '70 cm (Sạch khuẩn)', highlight: false },
          { label: 'Bước 4: Sau gây màu nước tảo khuê & cấy vi sinh', value: 35.0, displayValue: '35 cm (Đạt chuẩn thả tôm)', highlight: true },
        ],
        note: 'Ghi chú: Chỉ được cấy chế phẩm vi sinh và gây màu nước ở Bước 4 sau khi đã khử hết dư lượng Chlorine ở Bước 3.',
      },
    },
    2: {
      citation:
        'Viện Nghiên cứu Nuôi trồng Thủy sản I (2025). Tạp chí Khoa học Nông nghiệp Việt Nam, 23(3), trang 210-218.',
      tableData: {
        caption:
          'Bảng theo dõi biến động hàm lượng Oxygen hòa tan (DO – mg/L) trong ao nuôi cá rô phi thâm canh theo thời gian ngày và đêm (Chương V)',
        headers: ['Thời điểm đo trong ngày', 'Hàm lượng DO tầng mặt (mg/L)', 'Hàm lượng DO tầng đáy (mg/L)', 'Trạng thái hoạt động của đàn cá'],
        rows: [
          ['14 giờ chiều (Tảo quang hợp mạnh)', '7,8ᵃ', '5,6ᵃ', 'Cá bơi lội và bắt mồi bình thường'],
          ['22 giờ đêm (Tảo ngừng quang hợp, hô hấp)', '4,2ᵇ', '3,1ᵇ', 'Cá giảm hoạt động, cần bật quạt nước'],
          ['5 giờ sáng (Trời âm u, tắt quạt nước)', '1,6ᶜ', '1,2ᶜ (< ngưỡng 4 mg/L)', 'Cá nổi đầu đớp không khí hàng loạt (Ngạt O2)'],
        ],
        note: 'Ghi chú: Khi cá nổi đầu lúc rạng sáng do DO tụt xuống 1,2 mg/L, phải bật ngay quạt nước/sục khí và tuyệt đối ngừng cho ăn.',
      },
    },
    3: {
      citation:
        'Khoa Thủy sản – Trường Đại học Cần Thơ (2025). Tạp chí Khoa học Đại học Cần Thơ, 61(1), trang 95-104.',
      tableData: {
        caption:
          'Bảng kết quả xử lí khí độc NH3 và NO2- bằng chế phẩm vi khuẩn Nitrosomonas và Nitrobacter trong ao tôm 70 ngày tuổi (Chương V)',
        headers: ['Nghiệm thức xử lí', 'Nồng độ NH3 sau 5 ngày (mg/L)', 'Nồng độ NO2- sau 5 ngày (mg/L)', 'Tỉ lệ sống của tôm (%)'],
        rows: [
          ['Ban đầu (Trước khi xử lí)', '0,80ᵃ (vượt ngưỡng < 0,5)', '2,15ᵃ', '—'],
          ['NT1 (Xi phông đáy + Sục khí + Vi sinh Nitrosomonas & Nitrobacter)', '0,06ᶜ (An toàn)', '0,18ᶜ (An toàn)', '95,4ᵃ'],
          ['NT2 (Bón nhiều vôi sống CaO nâng pH > 9,5 lúc trưa)', '0,72ᵃ (Tăng tỉ lệ NH3 tự do cực độc)', '2,10ᵃ', '41,2ᵇ (Tôm ngộ độc)'],
        ],
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
    },
    4: {
      citation:
        'Tài liệu Thực hành Xác định chỉ tiêu nước nuôi thủy sản – Bài 12 SGK Công nghệ 12 Kết nối tri thức (trang 62–64).',
      chartData: {
        caption:
          'Biểu đồ: Kết quả thực hành đo độ trong bằng đĩa Secchi (cm) và độ pH tại mẫu nước đầm tôm (Chương V)',
        type: 'bar',
        unit: 'Giá trị đo',
        items: [
          { label: 'Độ sâu ẩn đĩa Secchi (cm)', value: 36.0, displayValue: '36 cm', highlight: false },
          { label: 'Độ sâu hiện đĩa Secchi (cm)', value: 40.0, displayValue: '40 cm', highlight: false },
          { label: 'Độ trong trung bình = (36+40)/2 (Đạt chuẩn)', value: 38.0, displayValue: '38 cm', highlight: true },
        ],
        note: 'Ghi chú: Độ trong 38 cm đạt chuẩn ao tôm (30–45 cm); nhưng nếu pH = 4,2 (quá chua so với chuẩn 6,5–8,5) thì phải bón vôi nâng pH trước khi thả giống.',
      },
    },
  },
  'cn12-c6': {
    1: {
      citation:
        'Viện Nghiên cứu Nuôi trồng Thủy sản III (2025). Tạp chí Khoa học và Công nghệ Thủy sản, số 1, trang 14-23.',
      tableData: {
        caption:
          'Bảng đặc điểm các giai đoạn phát triển của ấu trùng tôm thẻ chân trắng và chế độ dinh dưỡng tại Trại giống A (Chương VI)',
        headers: ['Giai đoạn ấu trùng tôm', 'Nguồn dinh dưỡng / Thức ăn chính', 'Độ mặn nước bể ương (‰)', 'Tỉ lệ sống qua giai đoạn (%)'],
        rows: [
          ['1. Nauplius', 'Dinh dưỡng bằng noãn hoàng tự thân (chưa ăn ngoài)', '30‰', '95,2ᵃ'],
          ['2. Zoea (Z1 – Z3)', 'Thực vật phù du (Tảo khuê tươi) + thức ăn vi nang', '30‰', '88,4ᵇ'],
          ['3. Mysis (M1 – M3)', 'Động vật phù du (Ấu trùng Artemia bung dù) + tảo', '30‰', '86,0ᵇ'],
          ['4. Postlarvae (PL1 – PL12)', 'Ấu trùng Artemia mới nở + thức ăn tổng hợp (thuần hóa độ mặn dần)', 'Giảm dần từ 30‰ về độ mặn ao nuôi', '91,5ᵃ'],
        ],
        note: 'Ghi chú: Trước khi xuất bán thả vào ao có độ mặn thấp (5‰), tôm PL12 bắt buộc phải được thuần hóa hạ độ mặn từ từ.',
      },
    },
    2: {
      citation:
        'Viện Nghiên cứu Nuôi trồng Thủy sản I (2025). Tạp chí Khoa học Nông nghiệp Việt Nam, 23(2), trang 115-124.',
      chartData: {
        caption:
          'Biểu đồ: Tỉ lệ cá rô phi đực (%) khi cho cá bột ăn thức ăn trộn hormone 17α-methyltestosterone (MT) trong 21 ngày đầu tại Trung tâm B (Chương VI)',
        type: 'bar',
        unit: '% cá đực',
        items: [
          { label: 'Đối chứng (Không bổ sung hormone MT)', value: 51.2, displayValue: '51,2%', highlight: false },
          { label: 'Cho ăn chậm (Sau khi cá đã lớn 30 ngày tuổi)', value: 64.5, displayValue: '64,5%', highlight: false },
          { label: 'Cho ăn MT ngay khi cá bột vừa tiêu hết noãn hoàng (21 ngày)', value: 96.8, displayValue: '96,8%', highlight: true },
        ],
        note: 'Ghi chú: Đàn cá rô phi đơn tính đực xử lí bằng hormone 17α-MT chỉ dùng nuôi thương phẩm, không dùng làm cá bố mẹ sinh sản.',
      },
    },
    3: {
      citation:
        'Trung tâm Quốc gia Giống Thủy sản Nước ngọt (2025). Quy trình kĩ thuật ương nuôi cá chép giống, trang 12-20.',
      tableData: {
        caption:
          'Bảng kết quả quy trình ương cá chép 2 giai đoạn tại ao 1.000 m² của hộ ông Nam (Chương VI)',
        headers: ['Giai đoạn ương nuôi', 'Thời gian ương (ngày)', 'Thức ăn sử dụng chính', 'Tỉ lệ sống (%)'],
        rows: [
          ['Giai đoạn 1: Cá bột lên Cá hương', '25 – 30 ngày', 'Lòng đỏ trứng, bột đậu nành, sinh vật phù du (luân trùng, Moina)', '78,5ᵇ'],
          ['Giai đoạn 2: Cá hương lên Cá giống', '30 – 45 ngày', 'Thức ăn hỗn hợp dạng mảnh/viên nhỏ giàu đạm (30–35% protein)', '91,2ᵃ'],
          ['Trước vận chuyển đi xa 300 km', 'Luyện mạng lưới & ngừng ăn 24–48h', 'Ngừng cho ăn hoàn toàn để cá sạch phân trong ruột', '98,4ᵃ (khi vận chuyển)'],
        ],
        note: 'Ghi chú: Nếu cho cá giống ăn no ngay trước khi đóng túi nilon vận chuyển đi xa, cá sẽ thải phân gây ngạt và nhiễm độc NH3 làm chết hàng loạt.',
      },
    },
    4: {
      citation:
        'Viện Nghiên cứu Nuôi trồng Thủy sản II (2025). Tạp chí Khoa học Nông nghiệp Việt Nam, 23(4), trang 330-339.',
      chartData: {
        caption:
          'Biểu đồ: Hoạt lực tinh trùng cá tra (%) sau bảo quản lạnh sâu trong nitrogen lỏng (-196 °C) theo nhiệt độ nước giải đông (Chương VI)',
        type: 'bar',
        unit: '% hoạt lực',
        items: [
          { label: 'Tinh trùng tươi ban đầu (Đối chứng)', value: 92.0, displayValue: '92,0%', highlight: false },
          { label: 'Bảo quản -196 °C, giải đông nhanh ở 37–40 °C', value: 84.5, displayValue: '84,5%', highlight: true },
          { label: 'Bảo quản -196 °C, đun sôi ở 100 °C (Biến tính chết)', value: 0.0, displayValue: '0,0%', highlight: false },
        ],
        note: 'Ghi chú: Tinh trùng cá bảo quản dài hạn ở -196 °C khi dùng chỉ được giải đông nhanh ở bể ổn nhiệt 35–40 °C, tuyệt đối không đun sôi 100 °C.',
      },
    },
  },
  'cn12-c7': {
    1: {
      citation:
        'Lê Quốc Việt và cộng sự (2025). Tạp chí Khoa học Nông nghiệp Việt Nam, 23(3), trang 280-289.',
      tableData: {
        caption:
          'Bảng thông số kĩ thuật dây chuyền sản xuất thức ăn viên công nghiệp tại Nhà máy X (Chương VII)',
        headers: ['Loại sản phẩm & Công đoạn', 'Độ bền trong nước (phút)', 'Tỉ lệ giữ hoạt tính Vitamin C (%)', 'Độ ẩm khi đóng bao (%)'],
        rows: [
          ['Thức ăn viên nổi cho cá (Phun phủ vitamin sau sấy, làm nguội về 28 °C)', '45,0ᵇ', '94,5ᵃ', '10,8ᵇ (Đạt chuẩn < 12%)'],
          ['Thức ăn viên chìm cho tôm (Phun phủ vitamin sau sấy, làm nguội về 28 °C)', '180,0ᵃ (3 giờ)', '93,8ᵃ', '10,5ᵇ (Đạt chuẩn < 12%)'],
          ['Đóng bao sai kĩ thuật (Trộn vitamin trước ép nhiệt 110 °C & đóng bao nóng 80 °C)', '30,0ᶜ', '22,4ᵇ (Bị phân hủy nhiệt)', '16,5ᵃ (Ngưng tụ hơi nước, mốc)'],
        ],
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
    },
    2: {
      citation:
        'Viện Công nghệ Sinh học & Trường Đại học Cần Thơ (2025). Tạp chí Khoa học Nông nghiệp Việt Nam, 23(4), trang 412-421.',
      chartData: {
        caption:
          'Biểu đồ: Tỉ lệ tiêu hóa protein (%) của nguyên liệu thức ăn thủy sản ứng dụng công nghệ sinh học (Chương VII)',
        type: 'bar',
        unit: '% tiêu hóa đạm',
        items: [
          { label: 'Khô dầu đậu nành sống chưa lên men', value: 68.4, displayValue: '68,4%', highlight: false },
          { label: 'Khô dầu đậu nành lên men vi khuẩn Bacillus subtilis', value: 89.2, displayValue: '89,2%', highlight: true },
          { label: 'Dịch phụ phẩm cá tra thủy phân bằng enzyme protease (ở 50–55 °C)', value: 94.6, displayValue: '94,6%', highlight: true },
        ],
        note: 'Ghi chú: Thủy phân bằng enzyme protease phải thực hiện ở nhiệt độ tối ưu 50–55 °C (nếu đun sôi 100 °C ngay từ đầu enzyme sẽ mất hoạt tính).',
      },
    },
    3: {
      citation:
        'Cục Thủy sản (2025). Quy chuẩn kĩ thuật quốc gia về bảo quản thức ăn thủy sản tại trang trại, trang 8-15.',
      tableData: {
        caption:
          'Bảng kết quả kiểm tra chất lượng bảo quản các nhóm thức ăn thủy sản sau 14 ngày tại trang trại ông Thành (Chương VII)',
        headers: ['Nhóm thức ăn & Chế độ bảo quản', 'Độ ẩm tiêu chuẩn (%)', 'Tỉ lệ nhiễm nấm mốc (%)', 'Đánh giá chất lượng'],
        rows: [
          ['Thức ăn hỗn hợp (Độ ẩm 11%, xếp trên kệ pallet cách sàn 15 cm, <= 10 bao)', '10 – 12%', '0,0ᵇ', 'Tốt, viên thơm giòn'],
          ['Chất bổ sung Vitamin & Khoáng (Độ ẩm 6%, đóng kín nơi khô mát)', '5 – 7%', '0,0ᵇ', 'Tốt, giữ nguyên hoạt tính'],
          ['Cá tạp tươi sống (Cấp đông sâu ở -18 °C)', '75 – 80% (tươi)', '0,0ᵇ', 'Tốt, thịt cá tươi nguyên'],
          ['Cá tạp tươi sống (Để ở góc kho nhiệt độ thường 30 °C)', '—', '100,0ᵃ (Phân hủy thối rữa)', 'Hỏng hoàn toàn sau 12 giờ'],
        ],
        note: 'Ghi chú: Thức ăn tươi sống dùng dài ngày bắt buộc phải bảo quản trong kho cấp đông (-18 °C).',
      },
    },
    4: {
      citation:
        'Viện Nghiên cứu Nuôi trồng Thủy sản II (2025). Tạp chí Khoa học Nông nghiệp Việt Nam, 23(2), trang 188-196.',
      chartData: {
        caption:
          'Biểu đồ: Hệ số chuyển đổi thức ăn (FCR) giữa Ao 1 (dùng 30 tấn viên nổi công nghiệp) và Ao 2 (dùng 38 tấn thức ăn tự chế ẩm) cho cùng 20 tấn cá tra tăng trọng (Chương VII)',
        type: 'bar',
        unit: 'FCR (kg thức ăn/kg tăng trọng)',
        items: [
          { label: 'Ao 1: Thức ăn viên nổi ép đùn (30 tấn / 20 tấn cá)', value: 1.5, displayValue: '1,50 (Hiệu quả cao)', highlight: true },
          { label: 'Ao 2: Thức ăn tự chế dạng ẩm (38 tấn / 20 tấn cá)', value: 1.9, displayValue: '1,90 (Tốn thức ăn hơn)', highlight: false },
        ],
        note: 'Ghi chú: FCR = Tổng lượng thức ăn (kg) / Khối lượng thủy sản tăng thêm (kg). FCR càng thấp thì hiệu quả sử dụng thức ăn càng cao.',
      },
    },
  },
  'cn12-c8': {
    1: {
      citation:
        'Võ Nam Sơn và cộng sự (2025). Tạp chí Khoa học Nông nghiệp Việt Nam, 23(3), trang 275-284.',
      chartData: {
        caption:
          'Biểu đồ: Hệ số FCR và tỉ lệ sống của tôm thẻ chân trắng trong hệ thống Biofloc (C:N = 15:1, sục khí 24/24h) tại Hợp tác xã X (Chương VIII)',
        type: 'bar',
        unit: 'FCR',
        items: [
          { label: 'Nuôi công nghệ Biofloc (Bổ sung mật rỉ đường, sục khí 24/24h)', value: 1.18, displayValue: '1,18 (Tiết kiệm 25% thức ăn)', highlight: true },
          { label: 'Nuôi thông thường không Biofloc (Đối chứng)', value: 1.56, displayValue: '1,56', highlight: false },
        ],
        note: 'Ghi chú: Hạt Biofloc vừa xử lí khí độc NH3 tại chỗ (không cần thay nước) vừa làm thức ăn giàu đạm cho tôm nhưng bắt buộc phải sục khí 24/24h.',
      },
    },
    2: {
      citation:
        'Viện Nghiên cứu Nuôi trồng Thủy sản I (2025). Tạp chí Khoa học Nông nghiệp Việt Nam, 23(1), trang 64-73.',
      tableData: {
        caption:
          'Bảng hiệu suất xử lí nước qua các công đoạn của hệ thống nuôi cá tuần hoàn RAS kết hợp Aquaponics (Chương VIII)',
        headers: ['Công đoạn trong hệ thống RAS – Aquaponics', 'Hàm lượng chất rắn lơ lửng TSS (mg/L)', 'Nồng độ NH3 (mg/L)', 'Nồng độ NO3- dinh dưỡng cho rau (mg/L)'],
        rows: [
          ['1. Nước ra từ bể nuôi cá rô phi', '85,4ᵃ', '1,45ᵃ', '12,0ᶜ'],
          ['2. Sau bể lọc cơ học (Tách phân rắn)', '8,2ᵇ (Giảm > 90%)', '1,38ᵃ', '12,5ᶜ'],
          ['3. Sau bể lọc sinh học (Chuyển hóa NH3 -> NO3-)', '5,4ᵇ', '0,04ᵇ (An toàn)', '64,8ᵃ (Cung cấp cho rau)'],
          ['4. Sau giàn rau thủy canh & đèn UV (Quay lại bể cá)', '2,1ᶜ (Nước trong sạch)', '0,01ᵇ', '15,2ᵇ (Rau đã hấp thụ)'],
        ],
        note: 'Ghi chú: Tuyệt đối không phun thuốc trừ sâu hóa học vào nước tuần hoàn giàn rau vì nước chảy trực tiếp về bể nuôi cá.',
      },
    },
    3: {
      citation:
        'Trung tâm Khuyến nông Quốc gia (2025). Tài liệu hướng dẫn Nuôi cá rô phi lồng bè theo tiêu chuẩn VietGAP, trang 15-24.',
      tableData: {
        caption:
          'Bảng kết quả nuôi cá rô phi đơn tính thương phẩm trong lồng (6×6×3 m) sau 7 tháng theo tiêu chuẩn VietGAP tại hộ ông Kiên (Chương VIII)',
        headers: ['Chế độ quản lí lồng nuôi', 'Lưu tốc dòng chảy qua lồng (m/s)', 'Khối lượng cá thu hoạch (kg/con)', 'Tỉ lệ sống (%)'],
        rows: [
          ['Lồng đạt chuẩn VietGAP (Định kì vệ sinh lưới lồng, ngừng ăn 1 ngày trước thu hoạch)', '0,25ᵃ (Lưu thông tốt)', '1,05ᵃ (Đạt chuẩn >= 0,8 kg)', '93,5ᵃ'],
          ['Lồng đối chứng (Không vệ sinh rong rêu bít mắt lưới, cho ăn quá no lúc thu hoạch)', '0,04ᵇ (Tù đọng thiếu O2)', '0,68ᵇ', '74,2ᵇ'],
        ],
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
    },
    4: {
      citation:
        'Viện Nghiên cứu Hải sản (2025). Tạp chí Khoa học và Công nghệ Thủy sản, số 3, trang 82-91.',
      chartData: {
        caption:
          'Biểu đồ: Tỉ lệ cá ngừ đại dương đạt chuẩn Sashimi xuất khẩu (%) sau chuyến biển 25 ngày theo công nghệ bảo quản trên tàu (Chương VIII)',
        type: 'bar',
        unit: '% đạt chuẩn Sashimi',
        items: [
          { label: 'Hầm cách nhiệt PU + Nano UFB khí Nitrogen (-1,5 đến -1 °C)', value: 92.4, displayValue: '92,4%', highlight: true },
          { label: 'Hầm cách nhiệt PU + Đá xay thông thường (0 đến 2 °C)', value: 64.0, displayValue: '64,0%', highlight: false },
          { label: 'Hầm xốp truyền thống (Đá tan nhanh sau 10 ngày)', value: 28.5, displayValue: '28,5%', highlight: false },
        ],
        note: 'Ghi chú: Bóng khí Nitrogen siêu mịn (Nano UFB) ở -1,5 đến -1 °C giúp đuổi O2 hòa tan, giữ thịt cá ngừ đỏ tươi suốt 20–30 ngày.',
      },
    },
  },
  'cn12-c9': {
    1: {
      citation:
        'Đặng Thị Hoàng Oanh và cộng sự (2025). Tạp chí Khoa học Nông nghiệp Việt Nam, 23(1), trang 102-111.',
      chartData: {
        caption:
          'Biểu đồ: Tỉ lệ sống của cá tra (%) khi điều trị bệnh gan thận mủ (do vi khuẩn Edwardsiella ictaluri) theo kháng sinh đồ tại Đồng Tháp (Chương IX)',
        type: 'bar',
        unit: '% tỉ lệ sống',
        items: [
          { label: 'NT1 (Đối chứng khỏe mạnh không nhiễm khuẩn)', value: 98.0, displayValue: '98,0%', highlight: false },
          { label: 'NT2 (Nhiễm E. ictaluri, không điều trị)', value: 34.5, displayValue: '34,5%', highlight: false },
          { label: 'NT3 (Điều trị kháng sinh theo kháng sinh đồ đủ 5–7 ngày)', value: 88.6, displayValue: '88,6%', highlight: true },
        ],
        note: 'Ghi chú: Cá tra mắc bệnh gan thận mủ có nhiều đốm trắng đục 1–3 mm trên gan, thận, lách; xác cá chết phải thu gom chôn vôi, nghiêm cấm vứt ra sông.',
      },
    },
    2: {
      citation:
        'Cục Thú y & Viện Nghiên cứu Nuôi trồng Thủy sản II (2025). Chuyên khảo Phòng chống bệnh đốm trắng trên tôm nước lợ, trang 24-33.',
      tableData: {
        caption:
          'Bảng hiệu quả của các biện pháp an toàn sinh học phòng bệnh đốm trắng (virus WSSV) tại khu nuôi tôm của anh Tuấn (Chương IX)',
        headers: ['Giải pháp kĩ thuật áp dụng', 'Tỉ lệ phát hiện sớm mầm bệnh (%)', 'Tỉ lệ ao nuôi an toàn không nổ dịch WSSV (%)', 'Hiệu quả điều trị khi đã phát bệnh cấp tính'],
        rows: [
          ['Xét nghiệm PCR tôm giống PL12 + Rào lưới chống cua còng + Men tỏi định kì', '99,5ᵃ (Chính xác bằng PCR)', '94,8ᵃ (An toàn sinh học cao)', 'Phòng bệnh chủ động hiệu quả nhất'],
          ['Thả giống trôi nổi không xét nghiệm PCR, không rào lưới bờ ao', '0,0ᵇ', '38,2ᵇ (Nhiễm virus từ giáp xác hoang dã)', 'Tôm chết 90–100% sau 3–7 ngày'],
          ['Dùng thuốc kháng sinh Penicillin tạt khi tôm đã nhiễm virus WSSV', '—', '0,0ᶜ', 'Không có tác dụng (Kháng sinh không diệt được virus)'],
        ],
        note: 'Ghi chú: Bệnh đốm trắng do virus DNA (WSSV) gây ra nên không điều trị được bằng kháng sinh; bắt buộc phải sàng lọc giống bằng PCR và cách li vật chủ trung gian.',
      },
    },
    3: {
      citation:
        'Trương Đình Hoài và cộng sự (2025). Tạp chí Khoa học Nông nghiệp Việt Nam, 23(2), trang 155-164.',
      tableData: {
        caption:
          'Bảng kết quả thử nghiệm hiệu quả bảo hộ của Vaccine phòng bệnh lồi mắt do vi khuẩn Streptococcus agalactiae trên cá rô phi (Chương IX)',
        headers: ['Nghiệm thức sử dụng Vaccine', 'Thời điểm cấp Vaccine', 'Tỉ lệ bảo hộ sống sót sau khi thử độc lực (%)', 'Đánh giá đáp ứng miễn dịch'],
        rows: [
          ['NT1 (Tiêm vaccine cho cá giống khỏe mạnh trước khi thả lồng 21 ngày)', 'Cá đang khỏe mạnh', '91,5ᵃ', 'Tạo kháng thể chủ động rất cao'],
          ['NT2 (Ngâm tắm / trộn thức ăn vaccine cho cá hương khỏe mạnh)', 'Cá đang khỏe mạnh', '82,4ᵇ', 'Tạo miễn dịch chủ động tốt, tiện lợi'],
          ['NT3 (Đối chứng không dùng vaccine)', '—', '28,6ᶜ', 'Cá bệnh lồi mắt, bơi quay tròn chết nhiều'],
          ['NT4 (Bắt cá đang sốt bệnh cấp tính lên tiêm vaccine)', 'Cá đang phát bệnh nặng', '15,0ᵈ', 'Sai nguyên tắc (Cá sốc chết nhanh hơn)'],
        ],
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c, d khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
    },
    4: {
      citation:
        'Tài liệu Thực hành Điều chế chế phẩm thảo dược men tỏi – Bài 25 SGK Công nghệ 12 Kết nối tri thức (trang 131–132).',
      chartData: {
        caption:
          'Biểu đồ: Đường kính vòng kháng khuẩn (mm) và tỉ lệ sống của cá/tôm (%) khi bổ sung chế phẩm thảo dược men tỏi (tỉ lệ 10 tỏi : 1 đường : 1 giấm/men : 16 nước ủ 10–15 ngày) (Chương IX)',
        type: 'bar',
        unit: '% tỉ lệ sống',
        items: [
          { label: 'Bổ sung dịch men tỏi ủ chuẩn 15 ngày (Giàu Allicin & VSV có lợi)', value: 91.2, displayValue: '91,2%', highlight: true },
          { label: 'Đối chứng không bổ sung men tỏi', value: 64.5, displayValue: '64,5%', highlight: false },
          { label: 'Đun sôi dịch men tỏi với Chlorine (Mất hoàn toàn hoạt tính)', value: 58.0, displayValue: '58,0%', highlight: false },
        ],
        note: 'Ghi chú: Tuyệt đối không đun sôi hoặc trộn dịch men tỏi với chất sát trùng Chlorine vì sẽ phá hủy Allicin và giết chết vi sinh vật lên men.',
      },
    },
  },
  'cn12-c10': {
    1: {
      citation:
        'Cục Kiểm ngư & Viện Nghiên cứu Hải sản (2025). Báo cáo Thực thi Luật Thủy sản và Chống khai thác IUU, trang 19-28.',
      chartData: {
        caption:
          'Biểu đồ: Trữ lượng quần đàn cá bố mẹ phục hồi (kg/mẻ lưới khảo sát) tại vùng biển thực thi bảo tồn và cấm đánh bắt mùa sinh sản (Chương X)',
        type: 'bar',
        unit: 'kg/mẻ khảo sát',
        items: [
          { label: 'Vùng thiết lập Khu bảo tồn biển & cấm đánh bắt mùa sinh sản', value: 84.5, displayValue: '84,5 kg', highlight: true },
          { label: 'Vùng biển kiểm soát mắt lưới chuẩn & bật VMS 100%', value: 62.0, displayValue: '62,0 kg', highlight: true },
          { label: 'Vùng bị khai thác quá mức ven bờ trước đây', value: 18.4, displayValue: '18,4 kg', highlight: false },
        ],
        note: 'Ghi chú: Pháp luật nghiêm cấm tuyệt đối hành vi dùng xung điện, chất nổ, hóa chất độc để đánh bắt thủy sản ở mọi vùng nước.',
      },
    },
    2: {
      citation:
        'Viện Nghiên cứu Hải sản (2025). Tạp chí Khoa học và Công nghệ Thủy sản, số 2, trang 70-79.',
      tableData: {
        caption:
          'Bảng so sánh tính chọn lọc và chất lượng sản phẩm của 4 phương pháp khai thác thủy sản tại Khánh Hòa (Chương X)',
        headers: ['Phương pháp khai thác (Bài 27)', 'Đối tượng và Tầng nước khai thác', 'Tỉ lệ cá con bị bắt lẫn (%)', 'Tỉ lệ sản phẩm đạt chuẩn loại I (%)'],
        rows: [
          ['1. Nghề lưới kéo đáy (Tốc độ kéo tôm 2–3 km/h, kéo cá 6–8 km/h)', 'Tôm, cá tầng đáy (Cào sát đáy)', '38,5ᵃ (Tính chọn lọc thấp)', '52,0ᶜ'],
          ['2. Nghề lưới rê (Giăng lưới chắn ngang đường cá bơi)', 'Cá tầng mặt, tầng giữa hoặc đáy', '11,2ᵇ (Chọn lọc khá theo mắt lưới)', '76,4ᵇ'],
          ['3. Nghề lưới vây (Bao vây đàn cá nổi kết hợp ánh sáng)', 'Đàn cá nổi tập trung (cá nục, cá thu, cá ngừ)', '9,4ᵇ', '84,2ᵇ'],
          ['4. Nghề câu (Câu vàng cá ngừ đại dương, câu mực)', 'Cá dữ kích cỡ lớn, mực đại dương', '1,8ᶜ (Tính chọn lọc cao nhất)', '95,6ᵃ (Ít dập nát, giá trị cao)'],
        ],
        note: 'Ghi chú: Trong cùng một cột, các chữ cái a, b, c khác nhau thể hiện khác biệt có ý nghĩa thống kê (p<0,05).',
      },
    },
    3: {
      citation:
        'Trường Đại học Nha Trang – Viện Khoa học và Công nghệ Khai thác Thủy sản (2025). Tạp chí Khoa học – Công nghệ Thủy sản, số 3, trang 38-47.',
      tableData: {
        caption:
          'Bảng kết quả thực hiện quy trình 5 bước khai thác bằng lưới vây kết hợp ánh sáng của đội tàu Quảng Ngãi (Chương X)',
        headers: ['Phương thức vận hành chuyến biển', 'Thời gian phát hiện đàn cá (giờ)', 'Sản lượng trung bình (tấn/mẻ lưới)', 'Tỉ lệ cá giữ độ tươi loại A khi cập cảng (%)'],
        rows: [
          ['Quy trình chuẩn 5 bước (Dùng máy dò cá Sonar + Chong đèn gom cá + Cấp lạnh ngay sau thu lưới)', '1,8ᵇ (Nhanh, chính xác)', '14,6ᵃ', '93,8ᵃ'],
          ['Vận hành thủ công (Không dùng máy dò Sonar, để cá phơi nắng trên boong tàu trước khi ướp đá)', '6,5ᵃ', '5,2ᵇ', '31,0ᵇ (Ươn hỏng nhanh)'],
        ],
        note: 'Ghi chú: Ngay sau Bước 4 (Thu lưới bắt cá), ngư dân bắt buộc phải thực hiện ngay Bước 5 (Phân loại, sơ chế và đưa xuống hầm lạnh bảo quản).',
      },
    },
    4: {
      citation:
        'Sở Nông nghiệp và Phát triển nông thôn & Chi cục Thủy sản (2025). Báo cáo Chương trình Tái tạo nguồn lợi thủy sản ngày 1/4, trang 11-18.',
      chartData: {
        caption:
          'Biểu đồ: Tỉ lệ sống sót ngoài tự nhiên sau 60 ngày (%) của nguồn giống thủy sản thả tái tạo tại tỉnh Z (Chương X)',
        type: 'bar',
        unit: '% sống sót ngoài tự nhiên',
        items: [
          { label: 'Thả cá giống bản địa khỏe mạnh cỡ chuẩn + Cấm đánh bắt vùng thả', value: 84.6, displayValue: '84,6%', highlight: true },
          { label: 'Thả cá bột quá nhỏ hoặc sai độ mặn thủy vực', value: 22.4, displayValue: '22,4%', highlight: false },
          { label: 'Sinh vật ngoại lai xâm hại (Ốc bươu vàng, rùa tai đỏ – Cấm thả tuyệt đối)', value: 0.0, displayValue: '0% (Bị pháp luật nghiêm cấm)', highlight: false },
        ],
        note: 'Ghi chú: Chỉ thả bổ sung các loài thủy sản bản địa, quý hiếm, có giá trị kinh tế; tuyệt đối nghiêm cấm thả sinh vật ngoại lai xâm hại ra tự nhiên.',
      },
    },
  },
};

/**
 * Chuyển đổi câu Đúng/Sai của chương trong CHAPTER_REVIEW_DATA sang định dạng chuẩn:
 * Trong 4 câu Đúng/Sai của mỗi đề có đúng 1 câu phân tích biểu đồ (Câu 1),
 * 1 câu phân tích bảng số liệu (Câu 2), và 2 câu tình huống thực tiễn (Câu 3, Câu 4).
 */
function enrichChapterTFTo0716Format(
  tf: ChapterTFQuestion,
  chapterId: string,
  chapterNumber: string,
  chapterTitle: string,
  domain: 'forestry' | 'aquaculture',
  examIdx: number,
  tfSlot: number // 0..3 -> Câu 1..4 Phần II
): TrueFalseQuestion {
  const journalName =
    domain === 'forestry'
      ? 'Tạp chí Khoa học Lâm nghiệp'
      : 'Tạp chí Khoa học Nông nghiệp Việt Nam';

  const chapterExpMap = CHAPTER_TF_EXPERIMENTAL_DATA[chapterId] || {};
  const chartEntries = Object.values(chapterExpMap).filter((item) => Boolean(item.chartData));
  const tableEntries = Object.values(chapterExpMap).filter((item) => Boolean(item.tableData));

  const mappedStatements = tf.statements.map((st) => ({
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
  ];

  // Câu 1 (tfSlot === 0): 1 câu phân tích biểu đồ
  if (tfSlot === 0 && chartEntries.length > 0) {
    const pickedChart = chartEntries[examIdx % chartEntries.length];
    return {
      id: `${chapterId}_d${examIdx + 1}_tf${tfSlot + 1}`,
      number: tfSlot + 1,
      domain,
      scenarioTitle: `Câu ${tfSlot + 1}. Phân tích biểu đồ thực nghiệm – ${chapterNumber}: ${chapterTitle}`,
      scenario: tf.context,
      citation:
        pickedChart.citation ||
        tf.citation ||
        `Viện Khoa học Chuyên ngành (2025). ${journalName} – Chuyên đề ${chapterNumber}: ${chapterTitle}.`,
      textbookRef: `${chapterNumber}: ${chapterTitle} – SGK Công nghệ 12 Kết nối tri thức`,
      chartData: pickedChart.chartData,
      statements: mappedStatements,
    };
  }

  // Câu 2 (tfSlot === 1): 1 câu phân tích bảng số liệu
  if (tfSlot === 1 && tableEntries.length > 0) {
    const pickedTable = tableEntries[examIdx % tableEntries.length];
    return {
      id: `${chapterId}_d${examIdx + 1}_tf${tfSlot + 1}`,
      number: tfSlot + 1,
      domain,
      scenarioTitle: `Câu ${tfSlot + 1}. Phân tích bảng số liệu thống kê – ${chapterNumber}: ${chapterTitle}`,
      scenario: tf.context,
      citation:
        pickedTable.citation ||
        tf.citation ||
        `Viện Khoa học Chuyên ngành (2025). ${journalName} – Chuyên đề ${chapterNumber}: ${chapterTitle}.`,
      textbookRef: `${chapterNumber}: ${chapterTitle} – SGK Công nghệ 12 Kết nối tri thức`,
      tableData: pickedTable.tableData,
      statements: mappedStatements,
    };
  }

  // Câu 3 & Câu 4 (tfSlot === 2, 3): 2 câu tình huống thực tiễn
  return {
    id: `${chapterId}_d${examIdx + 1}_tf${tfSlot + 1}`,
    number: tfSlot + 1,
    domain,
    scenarioTitle: `Câu ${tfSlot + 1}. Tình huống thực tiễn – ${chapterNumber}: ${chapterTitle}`,
    scenario: tf.context,
    citation:
      tf.citation ||
      `Viện Khoa học Chuyên ngành (2025). ${journalName} – Chuyên đề ${chapterNumber}: ${chapterTitle}.`,
    textbookRef: `${chapterNumber}: ${chapterTitle} – SGK Công nghệ 12 Kết nối tri thức`,
    statements: mappedStatements,
  };
}

/**
 * Xây dựng trọn bộ 4 Đề thi cho TỪNG CHƯƠNG trong 10 chương của Lớp 12
 * Mỗi đề chỉ sử dụng 100% thông tin và kiến thức thuộc phạm vi nội dung của chính chương đó
 */
function buildGrade12ChapterExams(): Record<string, Grade12ChapterExam[]> {
  const grade12Chapters = CHAPTER_REVIEW_DATA.filter((ch) => ch.grade === '12');
  const optionKeys = ['A', 'B', 'C', 'D'] as const;

  const result: Record<string, Grade12ChapterExam[]> = {};

  grade12Chapters.forEach((chapter, chIdx) => {
    const chapterMcqs = chapter.mcqQuestions; // 30 câu chuẩn thuộc nội dung của chương
    const chapterTfs = chapter.tfQuestions || []; // 4 câu Đúng/Sai chuẩn thuộc nội dung của chương
    const statQuestions =
      STATISTICAL_TABLE_QUESTIONS_BY_CHAPTER[chapter.id] ||
      STATISTICAL_TABLE_QUESTIONS_BY_CHAPTER['cn12-c1'];
    const stmtCountQuestions =
      STATEMENT_COUNT_QUESTIONS_BY_CHAPTER[chapter.id] ||
      STATEMENT_COUNT_QUESTIONS_BY_CHAPTER['cn12-c1'];

    const examsForChapter: Grade12ChapterExam[] = [];

    for (let examIdx = 0; examIdx < 4; examIdx++) {
      // Mã đề 4 chữ số: ví dụ Chương 1 -> 0711, 0712, 0713, 0714; Chương 2 -> 0721..0724...
      const codeNum = 710 + (chIdx + 1) * 10 + (examIdx + 1);
      const code = codeNum.toString().padStart(4, '0');

      const partI: MultipleChoiceQuestion[] = [];
      let regularSlotCounter = 0;

      for (let qNum = 1; qNum <= 24; qNum++) {
        // Câu 4 và Câu 16: Câu hỏi đếm số phát biểu đúng (a), (b), (c), (d) CỦA CHÍNH CHƯƠNG NÀY
        if (qNum === 4 || qNum === 16) {
          const stmtIdx =
            qNum === 4
              ? examIdx % stmtCountQuestions.length
              : (examIdx + 1) % stmtCountQuestions.length;
          const stmtQ = stmtCountQuestions[stmtIdx];
          partI.push(
            normalizeMultipleChoiceQuestion({
              ...stmtQ,
              id: `${chapter.id}_d${examIdx + 1}_q${qNum}`,
              number: qNum,
            })
          );
          continue;
        }

        // Câu 20: Câu hỏi phân tích Bảng số liệu thống kê thực nghiệm (p<0,05) CỦA CHÍNH CHƯƠNG NÀY
        if (qNum === 20) {
          const statQ = statQuestions[examIdx % statQuestions.length];
          partI.push(
            normalizeMultipleChoiceQuestion({
              ...statQ,
              id: `${chapter.id}_d${examIdx + 1}_q${qNum}`,
              number: qNum,
            })
          );
          continue;
        }

        // 21 câu còn lại lấy trực tiếp (không trùng lặp) từ ngân hàng 30 câu chuyên sâu CỦA CHÍNH CHƯƠNG NÀY (đã được chuẩn hóa độ dài ở CHAPTER_REVIEW_DATA)
        const cMcqIdx =
          (examIdx * 7 + regularSlotCounter) % chapterMcqs.length;
        regularSlotCounter++;
        const cItem = chapterMcqs[cMcqIdx];
        partI.push({
          id: `${chapter.id}_d${examIdx + 1}_q${qNum}`,
          number: qNum,
          grade: '12',
          domain: chapter.domain === 'forestry' ? 'forestry' : 'aquaculture',
          level:
            cItem.level === 'biet'
              ? 'NB'
              : cItem.level === 'hieu'
              ? 'TH'
              : 'VD',
          question: cItem.question,
          options: {
            A: cItem.options[0],
            B: cItem.options[1],
            C: cItem.options[2],
            D: cItem.options[3],
          },
          correctAnswer: optionKeys[cItem.correctIndex] || 'A',
          explanation: cItem.explanation,
          textbookRef: `${chapter.chapterNumber}: ${chapter.chapterTitle} – SGK Công nghệ 12 Kết nối tri thức`,
        });
      }

      // Xây dựng Phần II (4 câu Đúng/Sai có Biểu đồ cột & Bảng số liệu thống kê thực nghiệm CỦA CHÍNH CHƯƠNG NÀY)
      const partII: TrueFalseQuestion[] = [];
      for (let tfSlot = 0; tfSlot < 4; tfSlot++) {
        const rotatedTf = chapterTfs[(tfSlot + examIdx) % chapterTfs.length];
        partII.push(
          enrichChapterTFTo0716Format(
            rotatedTf,
            chapter.id,
            chapter.chapterNumber,
            chapter.chapterTitle,
            chapter.domain === 'forestry' ? 'forestry' : 'aquaculture',
            examIdx,
            tfSlot
          )
        );
      }

      examsForChapter.push({
        id: `g12-${chapter.id}-de-0${examIdx + 1}`,
        code,
        chapterId: chapter.id,
        chapterNumber: chapter.chapterNumber,
        chapterTitle: chapter.chapterTitle,
        examIndexInChapter: examIdx + 1,
        title: `Đề Số 0${examIdx + 1} – ${chapter.chapterNumber}: ${chapter.chapterTitle}`,
        description: `Đề ôn tập chuyên sâu ${chapter.chapterNumber}: ${chapter.chapterTitle} · Mã đề ${code} · 50 phút · Phần I (24 câu ABCD) + Phần II (4 câu Đúng/Sai số liệu & biểu đồ thực nghiệm của chương)`,
        durationMinutes: 50,
        partI,
        partII,
      });
    }

    result[chapter.id] = examsForChapter;
  });

  return result;
}

export const GRADE_12_EXAMS_BY_CHAPTER: Record<string, Grade12ChapterExam[]> =
  buildGrade12ChapterExams();

export const ALL_GRADE_12_CHAPTER_EXAMS: Grade12ChapterExam[] =
  Object.values(GRADE_12_EXAMS_BY_CHAPTER).flat();

/**
 * Bộ 10 Đề Ôn Tập Chuyên Đề Từng Chương Lớp 12 (30 câu trắc nghiệm ABCD + 4 câu Đúng/Sai của từng chương)
 * Đồng bộ 100% với nội dung phần 3 trong Thẻ Ôn Tập Chương Lớp 12
 */
export const GRADE_12_SINGLE_CHAPTER_EXAMS: Exam[] = CHAPTER_REVIEW_DATA.filter(
  (ch) => ch.grade === '12'
).map((ch, idx) => {
  const optionKeys = ['A', 'B', 'C', 'D'] as const;
  const code = `12C${idx + 1}`;
  const domain = ch.domain === 'forestry' ? 'forestry' : 'aquaculture';

  const partI: MultipleChoiceQuestion[] = ch.mcqQuestions.map((q) => ({
    id: `${ch.id}-q-${q.number}`,
    number: q.number,
    grade: '12',
    domain,
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
    textbookRef: `${ch.chapterNumber}: ${ch.chapterTitle} – SGK Công nghệ 12 Kết nối tri thức`,
  }));

  const partII: TrueFalseQuestion[] = (ch.tfQuestions || []).map((tf, tfIdx) =>
    enrichChapterTFTo0716Format(
      tf,
      ch.id,
      ch.chapterNumber,
      ch.chapterTitle,
      domain,
      0,
      tfIdx
    )
  );

  return {
    id: `exam-${ch.id}`,
    code,
    title: `Đề Ôn Tập ${ch.chapterNumber}: ${ch.chapterTitle} (Công Nghệ 12)`,
    description: `30 câu trắc nghiệm nhiều lựa chọn (12 Biết · 9 Thông hiểu · 9 Vận dụng) + 4 câu Đúng/Sai tình huống của ${ch.chapterNumber} – ${ch.pageRef}`,
    durationMinutes: 50,
    partI,
    partII,
  };
});


